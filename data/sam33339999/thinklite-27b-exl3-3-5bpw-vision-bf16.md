# sam33339999/Thinklite-27B-EXL3-3.5bpw-vision-bf16

## Resumen

Thinklite-27B-EXL3-3.5bpw-vision-bf16 es una cuantización EXL3 (ExLlamaV3) del modelo Sparset/Thinklite-27B, que a su vez es un fine-tune de Qwen/Qwen3.8-27B orientado a razonamiento eficiente. El autor de esta conversión es el usuario sam33339999 y el resultado se distribuye en formato safetensors compatible con la librería exllamav3. El objetivo del modelo base es reducir el número de tokens de razonamiento manteniendo casi intacta la precisión del modelo original: según la model card, con `reasoning_effort="xhigh"` emplea un 47% menos de razonamiento y produce la mitad de tokens de salida, con un time-to-final-output (TTFO) aproximadamente 2x menor y un 99,6% de la precisión media del modelo base.

Esta versión cuantizada aplica 3,5 bits por peso en las capas lineales, 6 bpw en la cabeza de salida, 4 bpw en las capas MTP y mantiene el torre de visión en bf16 sin cuantizar, además de embeddings en bf16 y modo de alta calidad (`-hq`) para elevar el suelo de bits en capas sensibles. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidades multimodales de entrada de imagen. La licencia es Apache 2.0.

La relevancia de esta ficha radica en que combina tres factores poco habituales: un modelo de razonamiento con reducción agresiva de tokens de pensamiento, capacidades de visión y una cuantización de baja precisión (3,5 bpw) pensada para abaratar el despliegue. No obstante, el número de parámetros reportado en safetensors (7.673.312.496) no coincide con la denominación "27B" del modelo, lo que conviene tener en cuenta al planificar hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.8-27B), con torre de visión; cuantización EXL3 de ExLlamaV3 |
| Parametros totales | 7.673.312.496 según safetensors del repo (la denominación comercial es "27B"; discrepancia no aclarada en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,5 bpw en capas lineales, 6 bpw en cabeza de salida, 4 bpw en capas MTP, torre de visión en bf16 sin cuantizar, embeddings en bf16, modo `-hq` activado, codebook `mul1`, calibración 250×2048 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, requiere exllamav3) |

## Arquitectura y entrenamiento

El modelo base Thinklite-27B es un fine-tune de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura transformer del modelo Qwen correspondiente, con un pipeline multimodal image-text-to-text que implica una torre de visión acoplada al decoder de lenguaje. La model card del modelo base no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se emplearon técnicas de RLHF o DPO; únicamente se describe el objetivo de entrenamiento: reducir la longitud de las cadenas de razonamiento preservando la precisión. Según los datos publicados, con `reasoning_effort="xhigh"` el modelo usa un 47% menos de razonamiento que Qwen3.8-27B en seis benchmarks y mantiene el 99,6% de la precisión media (89,8 frente a 90,2), mientras que con `reasoning_effort="low"` reduce el razonamiento un 28% y conserva el 97,5% de la precisión.

La conversión a EXL3 se realizó con ExLlamaV3 v1.6.6 mediante el script `convert.py`, con los parámetros `-b 3.5 -hb 6 -mb 4 -vb 16 -hq`, codebook `mul1` y calibración de 250 filas por 2048 columnas. El resultado es una cuantización mixta: las capas lineales del decoder se comprimen a 3,5 bpw, la cabeza de salida sube a 6 bpw, las capas MTP (multi-token prediction) quedan a 4 bpw y la torre de visión se mantiene en bf16 para no degradar la percepción visual. El modo `-hq` eleva el mínimo de bits en capas consideradas sensibles. No se documentan innovaciones adicionales como decodificación especulativa más allá de la presencia de capas MTP.

## Capacidades

- Generación de texto y razonamiento multi-paso con cadenas de pensamiento de longitud controlable mediante `reasoning_effort` (niveles `xhigh` y `low` documentados).
- Razonamiento eficiente: reduce el número de tokens de pensamiento frente a Qwen3.8-27B manteniendo la precisión media en torno al 99,6% en el modo `xhigh`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión conservada en bf16.
- Conversación multi-turno (tag `conversational`).
- Capacidades de código y matemáticas: no se detallan explícitamente en la información disponible, aunque se infieren del linaje Qwen; no hay datos concretos publicados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modelo está orientado a razonamiento, pero no se documenta integración específica con frameworks de agentes.
- Capacidades multilingües: no disponibles.
- Modo "thinking" con esfuerzo de razonamiento configurable.

## Casos de uso

- Asistentes de razonamiento con latencia reducida: al recortar un 47% los tokens de razonamiento en modo `xhigh`, el modelo reduce el TTFO a la mitad, lo que lo hace adecuado para aplicaciones interactivas donde el usuario espera respuesta en segundos y no puede asumir cadenas de pensamiento largas.
- Análisis de documentos con imágenes: al conservar la torre de visión en bf16 y el pipeline image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones textuales en un mismo flujo.
- Despliegue en hardware limitado: la cuantización a 3,5 bpw reduce el peso del modelo respecto a una versión bf16, lo que permite servirlo en GPUs con menos VRAM que las necesarias para el modelo base completo, manteniendo la torre de visión sin degradar.
- Razonamiento sobre código y matemáticas en entornos de producción: el linaje Qwen3.8 aporta capacidades de razonamiento estructurado; con el modo de esfuerzo bajo se obtienen respuestas más rápidas para tareas de clasificación o extracción donde no se requiere cadena de pensamiento extensa.
- Chat multi-turno con contexto conversacional: el tag `conversational` y el formato de instrucciones del modelo base permiten construir asistentes que mantengan el hilo de la conversación, con la ventaja de un menor coste por turno al generar menos tokens de salida.
- Evaluación comparativa de eficiencia de razonamiento: útil en investigación para medir el impacto de reducir tokens de pensamiento sobre la precisión en distintos dominios, ya que el modelo base publica comparativas frente a ThinkingCap-Qwen3.8-27B y Swift-1.5-Qwen3.8-27b.
- Prototipado con ExLlamaV3: al estar empaquetado en EXL3 y safetensors, encaja en pipelines de inferencia que ya usan exllamav3, sin necesidad de reconvertir pesos.

## Benchmarks y rendimiento

La model card del modelo base publica datos de eficiencia de razonamiento (no de precisión por benchmark individual). Se reproducen a continuación:

| Modelo | Razonamiento vs base (xhigh) | TTFO speed-up (xhigh) | Razonamiento vs base (low) | TTFO speed-up (low) |
|---|---|---|---|---|
| Thinklite-27B | ↓ 47,0% | 2,0x | ↓ 28,0% | 1,3x |
| ThinkingCap-Qwen3.8-27B | ↓ 45,8% | 1,7x | ↓ 16,4% | 1,2x |
| Swift-1.5-Qwen3.8-27b | ↓ 35,6% | 1,6x | ↓ 12,7% | 1,1x |

Precisión media reportada para Thinklite-27B: 89,8 frente a 90,2 del modelo base (99,6% de retención) en modo `xhigh`; en modo `low`, 2,2 puntos por debajo del base (97,5% de retención). No se han publicado resultados de benchmarks por tarea (MMLU, HumanEval, GSM8K) en la información disponible, ni datos específicos de esta cuantización EXL3.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 15,4 GB, por lo que se necesita al menos esa cantidad de VRAM más overhead de contexto y caché KV; con contexto largo, prever 18-24 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para el modelo completo con contexto moderado; A100 40 GB, H100 o L40S para contextos largos y mayor throughput.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB (RTX 3090, 4090) con margen ajustado; en GPUs de 16 GB no cabe el modelo completo en EXL3 tal como está empaquetado.
- Opciones de despliegue: ExLlamaV3 (librería nativa del formato EXL3); no es compatible directamente con llama.cpp, Ollama ni TGI sin reconversión a otro formato.
- Latencia y throughput estimados: no disponibles de forma numérica; la model card del base indica un TTFO aproximadamente 2x menor que Qwen3.8-27B en modo `xhigh`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento vs base (xhigh) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thinklite-27B (esta cuantización EXL3) | 7,67B según safetensors (denominado 27B) | no disponible | ↓ 47,0% | Apache 2.0 | Hugging Face, formato EXL3 |
| ThinkingCap-Qwen3.8-27B | no disponible | no disponible | ↓ 45,8% | no disponible | Hugging Face |
| Swift-1.5-Qwen3.8-27b | no disponible | no disponible | ↓ 35,6% | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | referencia (0%) | no disponible | Hugging Face |

Los datos de la comparativa de eficiencia proceden de la model card del modelo base. No se dispone de datos de parámetros, contexto ni licencia de los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de tamaño: el safetensors declara 7.673.312.496 parámetros, muy lejos de los "27B" del nombre; conviene verificar el modelo base antes de asumir capacidades o requisitos de hardware.
- La cuantización a 3,5 bpw puede degradar la calidad frente al modelo base en tareas sensibles; no se han publicado evaluaciones de esta conversión concreta.
- El modelo base retiene el 99,6% de la precisión media en modo `xhigh`, pero cae 2,2 puntos en modo `low`; el uso del modo de bajo esfuerzo puede afectar a tareas de razonamiento complejo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingüe homogéneo.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen/Qwen3.8-27B y de Sparset/Thinklite-27B, que no se detalla en la información disponible.
- Requiere ExLlamaV3; no es desplegable directamente en llama.cpp, Ollama o TGI sin conversión adicional.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de la calidad de la cuantización.
- La model card incluye texto en chino tradicional en algunas secciones, lo que sugiere un autor o proceso de conversión con esa procedencia; no afecta al uso, pero conviene revisar la documentación completa.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/sam33339999/Thinklite-27B-EXL3-3.5bpw-vision-bf16
- Modelo base: https://huggingface.co/Sparset/Thinklite-27B
- Versión GGUF del modelo base: https://huggingface.co/Sparset/Thinklite-27B-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio ExLlamaV3: no disponible en la información proporcionada
