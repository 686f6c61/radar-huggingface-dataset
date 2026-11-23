# mradermacher/Aurum-4B-Uncensored-GGUF

## Resumen

Aurum-4B-Uncensored es un modelo de lenguaje de 4.326 millones de parámetros (aproximadamente 4,3B) desarrollado por 2Beyes y distribuido en formato GGUF por mradermacher. Se trata de una variante "uncensored" y "abliterated" del modelo base, derivada de la familia Qwen 3.5 según las etiquetas del repositorio, y orientada a usos donde el modelo original aplica rechazos o restricciones de contenido. El modelo incorpora soporte declarado de tool calling y de MTP (multi-token prediction), lo que lo hace apto para flujos conversacionales y de agentes.

La relevancia de esta ficha reside en que mradermacher publica cuantizaciones estáticas listas para usar con llama.cpp y entornos compatibles con GGUF, cubriendo desde Q2_K (2,1 GB) hasta f16 (8,8 GB). Esto permite desplegar un modelo de 4,3B parámetros en hardware de consumo, algo imposible con los pesos originales en precisión completa. La licencia Apache 2.0 facilita el uso comercial sin las restricciones habituales de otros modelos "uncensored".

No obstante, la información pública disponible es muy limitada: no se especifican la longitud de contexto, los idiomas soportados más allá del inglés, los datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja únicamente lo que consta en la model card y en los metadatos del repositorio, marcando explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen 3.5, según etiquetas; detalles no disponibles) |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estáticas); variantes i1 (imatrix) en repo separado |
| Idiomas soportados | en (inglés); no se detallan otros |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es 2Beyes/Aurum-4B-Uncensored, del que no se publican detalles de arquitectura interna más allá de la etiqueta "qwen3.5", que sugiere una arquitectura transformer derivada de la familia Qwen 3.5. El repositorio de mradermacher es una conversión a GGUF de esos pesos, no un reentrenamiento: las cuantizaciones son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), es decir, se ha aplicado cuantización post-entrenamiento sobre los pesos en formato Hugging Face.

Las etiquetas "uncensored" y "abliterated" indican que el modelo base ha sido sometido a un proceso de abliteración, una técnica que elimina o atenúa la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo ante ciertas peticiones. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del soporte declarado de tool calling y MTP (multi-token prediction), que en la práctica puede traducirse en una generación más rápida al predecir varios tokens por paso.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno.
- Tool calling / function calling: la etiqueta "tool-calling" indica soporte para invocar herramientas externas, aunque no se documenta el formato exacto de las plantillas.
- MTP (multi-token prediction): capacidad declarada que puede acelerar la decodificación.
- Modo "uncensored"/"abliterated": menor tendencia a rechazar peticiones que el modelo original rechazaría.
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües: solo se declara inglés; no hay evidencia de soporte de otros idiomas.
- No se documentan capacidades de visión, audio, razonamiento extendido (thinking mode) ni matemáticas avanzadas.

## Casos de uso

- Asistentes conversacionales sin filtros editoriales: el modelo puede mantener diálogos multi-turno en inglés donde se requiere abordar temas que otros modelos rechazan, gracias a su naturaleza abliterated; útil en entornos de investigación sobre seguridad y alineación.
- Prototipado de agentes con tool calling: la etiqueta "tool-calling" permite integrarlo en pipelines donde el modelo decide qué función invocar (APIs, bases de datos, calculadoras), aunque conviene validar el formato de plantilla antes de producción.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_M (2,9 GB) o Q5_K_M (3,3 GB) cabe en GPUs de 8 GB o incluso en CPU con llama.cpp, lo que lo hace adecuado para estaciones de trabajo modestas y pruebas locales.
- Generación de texto creativo y roleplay: su sesgo reducido de rechazo lo hace apropiado para narrativa, guiones y juegos de rol donde se exploran temas sensibles de forma controlada.
- Investigación en abliteración y evaluación de sesgos: sirve como objeto de estudio para comparar el comportamiento del modelo base frente a la variante abliterated en tareas de moderación y seguridad.
- Fine-tuning ligero sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, los pesos safetensors del modelo base permiten adaptaciones con LoRA/QLoRA sobre la variante original de 2Beyes.
- Inferencia en entornos con recursos limitados: las cuantizaciones Q2_K (2,1 GB) y Q3_K_S (2,2 GB) permiten ejecución en dispositivos con poca memoria, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~2,1 GB; Q3_K_S ~2,2 GB; Q3_K_M ~2,4 GB; Q3_K_L ~2,6 GB; IQ4_XS ~2,7 GB; Q4_K_S ~2,7 GB; Q4_K_M ~2,9 GB; Q5_K_S ~3,2 GB; Q5_K_M ~3,3 GB; Q6_K ~3,7 GB; Q8_0 ~4,7 GB; f16 ~8,8 GB. Añadir margen para el contexto KV cache (no documentado).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB para las cuantizaciones altas; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, desde una GTX 1650 4 GB (con Q2_K) hasta una RTX 4090 (con f16). Las cuantizaciones Q4 recomendadas encajan en GPUs de 8 GB o superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama.cpp server, llama-cpp-python). No se documenta soporte nativo de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles; dependen del hardware y de si se aprovecha MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Aurum-4B-Uncensored (este) | 4,3B | no disponible | Apache 2.0 | GGUF, safetensors | Abliterated, tool calling, MTP |
| Qwen 2.5 3B Instruct | 3B | 32K (según familia) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, con alineación estándar |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community | safetensors, GGUF | Multilingüe, alineación estándar |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Fuerte en razonamiento y código |

La comparación con Qwen y Llama es aproximada, ya que no se dispone de benchmarks del modelo. La principal diferencia es su carácter abliterated, que lo aleja de los modelos alineados convencionales; en el resto de dimensiones (tamaño y licencia) es comparable a la gama 3B-4B.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad en MMLU, HumanEval, GSM8K ni tareas similares.
- Proceso de abliteración: reduce los rechazos, lo que implica mayor riesgo de generar contenido dañino, ofensivo o inexacto; requiere moderación externa en producción.
- Riesgo de alucinación: inherente a modelos de este tamaño; no hay evaluaciones que lo cuantifiquen.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base 2Beyes/Aurum-4B-Uncensored por si hubiera condiciones adicionales no reflejadas en la etiqueta.
- Formato GGUF: no apto para fine-tuning directo; para adaptaciones hay que partir de los safetensors del modelo base.
- Repositorio con 0 likes y 927 descargas en la fecha de creación (2026-11-19): ecosistema muy pequeño, sin validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Aurum-4B-Uncensored-GGUF
- Modelo base: https://huggingface.co/2Beyes/Aurum-4B-Uncensored
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Aurum-4B-Uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Aurum-4B-Uncensored-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
