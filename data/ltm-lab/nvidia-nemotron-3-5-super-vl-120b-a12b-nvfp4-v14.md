# LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14 es una conversión del checkpoint cuantizado en NVFP4 de NVIDIA (nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4), publicada por LTM-Lab. No se ha reentrenado, fusionado ni recuantizado nada: los pesos son idénticos bit a bit a los del modelo original. Lo que añade esta versión es una arquitectura de memoria episódica (`NemotronHV14ForConditionalGeneration`) implementada en dos ficheros de código remoto y un conjunto de opciones de memoria en `config.json`, junto con un `auto_map` para cargarla desde Transformers.

El modelo base es un transformer multimodal de tipo Nemotron H (arquitectura híbrida con capas recurrentes SSM/Mamba y atención) con 65.769.840.138 parámetros totales en safetensors (el nombre del checkpoint indica 120B-A12B, es decir, un esquema de mezcla de expertos con aproximadamente 12B parámetros activos). El pipeline declarado es image-text-to-text y el contexto configurado en el ejemplo de servicio de SGLang es de 262.144 tokens. La contribución de esta variante es que, servida con una imagen Docker modificada de SGLang, el modelo conserva memoria entre peticiones: lo dicho en una conversación puede recuperarse en otra posterior, sin añadir texto al prompt.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal de gran tamaño con cuantización NVFP4 (apto para una GPU de 96 GB); por otro, describe un mecanismo experimental de memoria episódica basada en claves y valores de atención persistidos en disco, con limitaciones explícitas declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H híbrida (atención + capas recurrentes SSM/Mamba), multimodal image-text-to-text; variante V14 con memoria episódica (`NemotronHV14ForConditionalGeneration`) |
| Parametros totales | 65.769.840.138 (safetensors); el nombre del checkpoint indica 120B totales / A12B activos |
| Parametros activos | A12B según nomenclatura del checkpoint (no verificado en la información disponible) |
| Longitud de contexto | 262.144 tokens (configuración de servicio indicada por el autor) |
| Tipos de cuantizacion | NVFP4 (formato cuantizado de NVIDIA), tag `8-bit`, `modelopt_mixed`; KV cache en fp8_e4m3 en el ejemplo de servicio |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (etiqueta `license: other`) |
| Formato de pesos | safetensors (no cargable directamente por Transformers según el autor; requiere SGLang modificado) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura Nemotron H: un transformer híbrido que combina capas de atención con capas recurrentes de tipo SSM/Mamba, lo que explica los argumentos específicos de servicio (`--mamba-ssm-dtype bfloat16`, `--max-mamba-cache-size`). La variante multimodal procesa imagen, texto, vídeo y audio a través del pipeline image-text-to-text. Los pesos están en formato NVFP4, la cuantización de NVIDIA, con mezcla de precisión (`modelopt_mixed`).

Esta conversión concreta no entrena nada. Añade dos ficheros de código (`configuration_nemotron_h_v14_reinstatement.py` y `modeling_nemotron_h_v14_reinstatement.py`) que implementan la memoria episódica: durante la lectura de un prompt, las claves y valores de las capas de atención se segmentan en eventos de hasta 128 tokens y se escriben en disco junto con un *engram* de bajo rango del estado que dejan en las capas recurrentes. En una petición posterior, un primer pase determina qué eventos almacenados recibirían atención; se recuperan mediante un voto único para todas las capas y cabezas, sus engrams se componen en el estado recurrente de la petición y el prompt se relee con esas claves y valores fusionados en la atención. No se recupera texto ni se modifica el prompt. El autor no documenta datos de entrenamiento, composición del dataset ni si hubo RLHF/DPO para el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en seis idiomas (inglés, español, francés, alemán, italiano y japonés).
- Comprensión de imagen y texto (pipeline image-text-to-text); el autor menciona también peticiones con vídeo y audio, servidas como lo haría el modelo plano.
- Memoria episódica entre peticiones: recuperación de información dicha en conversaciones anteriores mediante claves y valores de atención persistidos en disco, sin inserción de texto en el prompt.
- Razonamiento con parser de razonamiento dedicado (`--reasoning-parser nemotron_3`).
- Tool calling / function calling (parser `qwen3_coder` en la configuración de SGLang).
- Decodificación especulativa EAGLE soportada en el servicio (top-k 1, 3 pasos, 4 tokens borrador).
- Compatible con prefix caching y CUDA graphs en el servidor SGLang modificado.
- Capacidad de desactivar la memoria (`SGLANG_V14_MEMORY=0`) para comportarse como el modelo original.

## Casos de uso

- Asistentes conversacionales con memoria persistente: el modelo puede recordar hechos mencionados en sesiones anteriores (preferencias, datos de proyecto) gracias al almacén en disco de claves y valores, útil en asistentes personales o de soporte recurrente.
- Atención al cliente multi-sesión: con 262.144 tokens de contexto y memoria entre peticiones, puede mantener continuidad en casos que se reabren días después, siempre que se despliegue una instancia con su propio directorio `/memory` por cliente.
- Análisis de documentos e imágenes en pipelines RAG multimodal: el pipeline image-text-to-text permite extraer información de capturas, diagramas o páginas escaneadas junto a texto.
- Automatización de agentes con tool calling: los parsers de razonamiento y de llamadas a herramientas permiten integrarlo en flujos de agentes que consultan APIs o ejecutan acciones.
- Investigación sobre memoria en modelos: el mecanismo de eventos de 128 tokens con engrams de bajo rango y voto único es un objeto de estudio reproducible con trazas (`SGLANG_V14_TRACE=1`).
- Despliegue en una única GPU de 96 GB: el autor documenta el servicio en una RTX PRO 6000 Blackwell, lo que permite prototipado de modelos de gran tamaño sin clúster.
- Evaluación comparativa de cuantización NVFP4: al conservar los pesos originales, sirve para medir el comportamiento del checkpoint NVFP4 de NVIDIA en tareas multimodales.

## Benchmarks y rendimiento

El autor declara explícitamente que las comprobaciones realizadas son "una comprobación funcional, no un benchmark". Los únicos datos publicados en la información disponible son de puesta en marcha:

| Comprobacion | Resultado |
|---|---|
| Tiempo hasta estar listo | 711 s |
| CUDA graphs capturados | dato truncado en la información disponible |
| Resto de comprobaciones funcionales | dato truncado en la información disponible |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: se necesita una GPU de 96 GB según el autor; el repositorio ocupa 75,0 GB.
- GPU recomendada: RTX PRO 6000 Blackwell (96 GB), la única verificada en la documentación. No se documenta funcionamiento en A100 (80 GB) ni H100.
- GPU de consumo: no cabe en ninguna GPU consumer actual (la mayor, RTX 4090, tiene 24 GB).
- Despliegue: exclusivamente mediante la imagen Docker `lovewin10/sglang-v14:nightly-dev-cu13-20260924-ffac53d7-v14` (SGLang modificado). Transformers no carga el formato NVFP4 según el autor.
- Configuración de servicio: `--tp-size 1`, `--context-length 262144`, `--attention-backend flashinfer`, `--kv-cache-dtype fp8_e4m3`, `--max-running-requests 2`, `--mem-fraction-static 0.90`, `--max-total-tokens 1016382`, decodificación especulativa EAGLE.
- Restricciones: TP, PP y DP attention deben ser 1; la memoria requiere backend de atención `flashinfer` o `fa3`.
- Latencia y throughput: no disponibles; solo se documenta un tiempo de arranque de 711 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Este modelo (V14) | 65.769.840.138 en safetensors (120B-A12B nominal) | 262.144 | openmdw-1.1 | SGLang modificado en Docker, 1 GPU de 96 GB | Memoria episódica entre peticiones |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | mismos pesos | no disponible | no disponible | SGLang cookbook | Modelo base sin memoria; misma cuantización NVFP4 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La memoria episódica es experimental: el autor la describe como una comprobación funcional y no como un benchmark.
- La opción `recall_while_decoding` está desactivada en este directorio.
- El directorio `/memory` contiene los token ids y las claves y valores de atención de todos los prompts leídos: debe tratarse como registro de conversaciones y borrarse para olvidar.
- No hay separación entre usuarios: todas las peticiones leen y escriben el mismo almacén. Para aislar memorias por usuario o inquilino hay que levantar una instancia con su propio `/memory`.
- Las peticiones con imagen, vídeo o audio no leen ni escriben la memoria.
- El texto generado no se escribe en memoria; solo se convierte en memoria cuando un prompt posterior lo incluye.
- El modelo no es cargable con Transformers en su formato NVFP4; depende de una imagen Docker de terceros no oficial.
- Restricciones de licencia: openmdw-1.1 (etiquetada como `license: other`); deben revisarse los términos en el enlace oficial antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas: solo se declaran seis; no hay datos sobre rendimiento en otros.
- El repositorio no registra descargas ni likes, y la información de benchmarks está truncada, lo que limita la evaluación previa a producción.

## Enlaces

- Hugging Face: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Imagen Docker de SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v14
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
