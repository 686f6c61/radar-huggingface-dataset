# axteam/Qwen3.5-27B-AWQ-8bit

## Resumen

`axteam/Qwen3.5-27B-AWQ-8bit` es una cuantización de 8 bits del modelo multimodal `Qwen/Qwen3.5-27B`, publicada por el usuario axteam para servir el modelo con vLLM de forma eficiente en memoria. No es un modelo nuevo: es un derivado PTQ (post-training quantization) que conserva tokenizador, `chat_template` y `generation_config` del original, por lo que el comportamiento esperado es el del modelo base con una pérdida de calidad medida de aproximadamente el 0,0 % en perplejidad.

El modelo base es un transformer denso de 27.781.427.952 parámetros (unos 27,8 B) con arquitectura híbrida de atención lineal y atención completa, torre visual (pipeline `image-text-to-text`) y un cabezal MTP (*multi-token prediction*). La cuantización aplica AWQ INT8 en esquema W8A16: pesos INT8 simétricos con grupo de 32 y activaciones en BF16, almacenados en formato `compressed-tensors` `pack-quantized`.

Su relevancia es práctica: permite ejecutar un modelo multimodal de clase 27B en una sola GPU de 48-80 GB con un peso en disco de ~30,5 GB, frente a los ~55 GB que ocuparía el original en BF16, manteniendo una fidelidad muy alta respecto al modelo sin cuantizar según las métricas publicadas por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal + atención completa), multimodal con torre visual y cabezal MTP |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AWQ INT8 W8A16 (pesos INT8 simétricos, grupo 32, activaciones BF16); torre visual, proyector, cabezal MTP, RMSNorms, embeddings, LM head y partes no lineales del SSM (`linear_attn.conv1d`, `A_log`, `dt_bias`) se mantienen en BF16 |
| Idiomas soportados | No disponible en la model card; el conjunto de evaluación interno es mixto inglés/coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con `compressed-tensors` (`pack-quantized`); ~30,5 GB en disco, repo de 32,7 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de atención lineal con capas de atención completa, lo que reduce el coste de memoria y cómputo del *KV cache* en secuencias largas frente a un transformer de atención completa pura. Es un modelo denso (no MoE) de 27,8 B de parámetros, con torre visual y proyector para entrada de imagen, y un cabezal MTP que habilita decodificación multi-token. El proceso de cuantización conserva en BF16 los componentes sensibles a la precisión: torre visual y proyector (`model.visual.*`), cabezal MTP (`mtp.*`), todas las RMSNorm, embeddings de tokens, LM head y las partes no lineales del bloque SSM (`linear_attn.conv1d/A_log/dt_bias`).

No se ha reentrenado nada: es PTQ puro sobre los pesos del modelo base. La calibración de AWQ se hizo con 256 muestras de un corpus mixto con predominio de coreano, sin gradientes, con el objetivo de proteger los canales de pesos más relevantes antes del redondeo a INT8. El autor no documenta la composición del dataset de preentrenamiento, el número de tokens, ni si el modelo base usó RLHF/DPO; tampoco se detalla en la información disponible el mecanismo exacto de atención lineal empleado más allá de la etiqueta `qwen3_5` y la presencia de componentes SSM.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat, con plantilla idéntica a la del modelo original.
- Entrada de imagen y texto (`image-text-to-text`): la torre visual y el proyector se conservan en BF16, por lo que la ruta multimodal no sufre la cuantización INT8.
- Razonamiento general y respuesta a instrucciones heredados del modelo base Qwen3.5-27B. Los benchmarks concretos del base no se incluyen en la información disponible.
- Cabezal MTP conservado en BF16, pensado para decodificación especulativa o multi-token si el stack de serving lo aprovecha.
- Atención híbrida (lineal + completa) que reduce el coste por token en contextos largos.
- Soporte de *tool calling* / *function calling*: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades multilingües: no documentadas; la única evidencia es el conjunto de evaluación interno inglés/coreano.
- Modo *thinking* explícito, audio o vídeo: no documentado.

## Casos de uso

- **Servicio multimodal en producción con vLLM**: `vllm serve axteam/Qwen3.5-27B-AWQ-8bit` arranca directamente con un peso de ~30,5 GB, lo que permite atender peticiones de imagen + texto en una única GPU de 48-80 GB sin recurrir al modelo BF16.
- **Extracción de datos de documentos escaneados**: facturas, albaranes o formularios en imagen se envían junto a una instrucción de extracción estructurada; la torre visual en BF16 evita degradar la calidad de percepción que introduciría cuantizar la visión.
- **Atención al cliente automatizada multi-turno**: la arquitectura híbrida de atención lineal reduce el coste del *KV cache* en conversaciones largas, lo que abarata mantener historiales extensos en memoria frente a un transformer de atención completa equivalente.
- **Generación de descripciones y alt-text a escala**: procesamiento por lotes de catálogos de imágenes en una sola GPU, con throughput limitado por la VRAM disponible (no se han publicado cifras de throughput).
- **Validación de fidelidad de cuantizaciones**: el modelo sirve como referencia reproducible para comparar perplejidad y acuerdo top-1 frente al BF16 original con el mismo arnés de evaluación (100 prompts, respuestas greedy).
- **Despliegue on-premise con requisitos de privacidad**: al ser Apache-2.0 y ejecutarse en un solo nodo, encaja en entornos donde los datos no pueden salir de la infraestructura propia.
- **Decodificación especulativa**: si el stack de serving soporta el cabezal MTP preservado en BF16, puede reducir la latencia de generación en cargas interactivas (no hay mediciones publicadas).

## Benchmarks y rendimiento

El autor solo publica métricas de fidelidad frente al modelo BF16 original, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas greedy BF16 puntuadas bajo cada build y el mismo arnés para todas las filas. No son puntuaciones absolutas de tarea.

| Metrica | Este modelo (AWQ INT8) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplejidad (menor = más cercano) | 1,3606 | 1,3603 | +0,0 % |
| Acuerdo top-1 en siguiente token | 99,0 % | 99,3 % | -0,3 pp |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, MMMU u otros) en la información disponible, ni para esta cuantización ni para el modelo base.

## Requisitos de hardware

- **VRAM estimada**: ~31-33 GB solo para pesos (27,8 B en INT8 ≈ 27,8 GB, más torre visual, proyector, MTP, normas, embeddings y LM head en BF16). Con *KV cache* y overhead de vLLM, el consumo realista arranca en ~40 GB y crece con la longitud de contexto, que no está documentada.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB o A6000 48 GB. Una GPU de 40 GB es el mínimo ajustado.
- **Consumer GPU**: no cabe en una RTX 4090 (24 GB) ni deja margen útil en una RTX 5090 (32 GB) una vez descontados pesos y *KV cache*. Requeriría tensor parallelism con 2× RTX 4090, configuración no validada por el autor.
- **Despliegue**: vLLM es la vía soportada y recomendada (formato `compressed-tensors`). llama.cpp y Ollama no soportan este esquema INT8 `pack-quantized`, por lo que no son opciones directas sin reconversión no documentada. TGI no está confirmado en la información disponible.
- **Parámetros de muestreo recomendados por Qwen**: `temperature=0.7`, `top_p=0.8`, `top_k=20`.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Qwen3.5-27B-AWQ-8bit | 27,8 B (denso) | No disponible | AWQ INT8 W8A16, ~30,5 GB | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-27B (original) | 27,8 B (denso) | No disponible | BF16, ~55 GB | Apache-2.0 | HuggingFace |
| Versiones W4A16/GGUF de 27B de la familia Qwen | ~27-28 B | No disponible | 4 bits, ~14-17 GB | Apache-2.0 (según base) | Existen en el ecosistema, pero las encontradas corresponden a otras versiones de la familia, no comparables directamente |

Frente al original BF16, esta cuantización reduce el peso a prácticamente la mitad (~30,5 GB frente a ~55 GB) con una perplejidad prácticamente idéntica (1,3606 frente a 1,3603) según la medición del autor. Frente a alternativas de 4 bits del mismo tamaño, el coste es mayor en VRAM a cambio de una fidelidad previsiblemente superior; no hay datos públicos que permitan cuantificar esa diferencia para esta familia concreta.

## Limitaciones y advertencias

- **Evaluación de fidelidad con muestra pequeña**: 100 prompts de un conjunto interno inglés/coreano, sin publicación del conjunto ni del arnés. Las cifras de perplejidad y acuerdo top-1 no son extrapolables a otras lenguas o dominios.
- **Calibración sesgada al coreano**: las 256 muestras de calibración tienen predominio de coreano; el comportamiento en castellano o en otros idiomas puede desviarse más respecto al BF16 de lo que indican las métricas publicadas.
- **Idiomas no documentados**: la model card no declara la lista de idiomas soportados. No debe asumirse cobertura multilingüe sin validación propia.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto del modelo base en esta ficha; planificar el dimensionado de VRAM sin ese dato es arriesgado.
- **Riesgo de alucinación**: inherente al modelo base y no mitigado por la cuantización; no se han publicado evaluaciones de factualidad.
- **Capacidades no confirmadas**: *tool calling*, uso como agente y modo *thinking* no aparecen documentados; conviene verificarlos antes de diseñar arquitecturas que dependan de ellos.
- **Licencia**: Apache-2.0 permite uso comercial, pero los derechos sobre pesos originales, tokenizador y `chat_template` pertenecen al equipo de Qwen; revisar el fichero LICENSE enlazado en el repo del modelo base.
- **Restricciones de despliegue**: el formato INT8 `pack-quantized` limita las opciones a stacks que soporten `compressed-tensors`; no hay ruta directa a llama.cpp u Ollama.
- **Madurez del artefacto**: 0 descargas y 0 *likes* en el momento de la consulta, con creación y última actualización separadas por unos 11 minutos; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-27B-AWQ-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Listado de modelos con cuantización W4A16 en HuggingFace: https://huggingface.co/models?other=w4a16
- Listado de modelos con cuantización INT4 en HuggingFace: https://huggingface.co/models?other=int4&p=2&sort=trending
