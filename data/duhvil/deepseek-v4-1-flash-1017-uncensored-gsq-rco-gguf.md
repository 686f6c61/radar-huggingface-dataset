# Duhvil/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF es una cuantización GGUF de tipo "abliterated" (sin rechazos) del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario Duhvil y derivado del trabajo de cuantización de ISTA-DASLab y de la edición de rechazos de AtomicChat. El modelo base es un transformer de tipo mezcla de expertos (MoE) de 763B parámetros con 384 expertos enrutados, desarrollado originalmente por DeepSeek. La edición elimina la dirección de rechazo de DeepSeek proyectándola fuera de los tensores densos que escriben en el flujo residual, dejando intactos los expertos enrutados.

El interés de esta ficha reside en dos aspectos: por un lado, demuestra una técnica de abliteración quirúrgica que, según las mediciones del autor, preserva la precisión en tareas (GPQA-Diamond idéntico al cuantizado original, AIME25 dentro del ruido estadístico) mientras reduce la tasa de jailbreak de ~85% a 0% en las variantes probadas. Por otro lado, el formato GSQ-RCO con tabla Engram separada permite ejecutar un modelo de 763B parámetros en una única GPU de 12 GB mediante el runtime Strata, lo que lo convierte en un caso práctico de inferencia de modelos masivos en hardware de consumo.

El repositorio tiene 414,2 GB y contiene varias "rungs" (escalones de cuantización) en formato GGUF, con tipos IQ2_XXS, IQ2_XS e IQ1_M. El modelo se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 384 expertos enrutados, expertos compartidos y tabla Engram separada |
| Parametros totales | 551.880.949.208 (aproximadamente 552B según safetensors; la model card indica 763B para el modelo base completo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (2,0 bpw), IQ2_XS (2,25 bpw), IQ1_M (1,75 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (shards con tabla Engram separada de 110 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de mezcla de expertos con 384 expertos enrutados, expertos compartidos (shared experts) y un mecanismo denominado Engram, que actúa como tabla de búsqueda de valores con proyección propia (`engram_wkv`). La cuantización GSQ-RCO de ISTA-DASLab aplica un redondeo de baja precisión aprendido sobre los expertos enrutados y separa la tabla Engram en un fichero independiente de 110 GB que se transmite desde SSD durante la inferencia.

La edición "uncensored" de AtomicChat sustituye únicamente los tensores densos que escriben en el flujo residual: la salida de atención (`attn_output_b`), la proyección descendente del experto compartido (`ffn_down_shexp`) y la proyección de valores Engram (`engram_wkv`). Sobre esos tensores se aplica una proyección de la dirección de rechazo con fuerza 2,0, calculada a precisión completa y recuantizada al tipo por tensor exacto de ISTA. Los 384 expertos enrutados se conservan byte a byte, de modo que el redondeo aprendido de GSQ se preserva íntegro y cada fichero mantiene el mismo tamaño y los mismos requisitos de ejecución que el original. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento de varios pasos, con modo de pensamiento ("thinking") configurable por esfuerzo.
- Razonamiento matemático y científico de alto nivel: la model card reporta GPQA-Diamond y AIME25 como benchmarks de referencia.
- Razonamiento y respuesta sin rechazos: la edición elimina la dirección de rechazo en todos los temas, no solo en un subconjunto.
- Ejecución en hardware de consumo mediante el runtime Strata, con la columna vertebral en memoria del sistema y la tabla Engram en streaming desde SSD.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.
- No se documentan capacidades de tool calling, function calling, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el modelo sirve como banco de pruebas para medir el efecto de proyectar la dirección de rechazo sobre tensores densos concretos, con métricas de KL y de precisión en tareas publicadas en el repositorio de métricas.
- Evaluación de robustez de clasificadores de rechazo: la model card advierte que el clasificador lee el inicio de la respuesta, por lo que un rechazo suave posterior puede pasar como respuesta; útil para diseñar clasificadores más robustos.
- Inferencia de modelos masivos en hardware limitado: con Strata y una GPU de 12 GB se puede servir un modelo de 763B parámetros, lo que permite experimentar con MoE de gran escala sin clúster.
- Generación de texto creativo sin filtros: para proyectos de escritura, guiones o narrativa donde se requiere ausencia de rechazos temáticos.
- Estudio de cuantización de baja precisión: las rungs IQ1_M (1,75 bpw) e IQ2_XXS (2,0 bpw) permiten analizar la degradación de calidad frente al modelo original en tareas de razonamiento.
- Despliegue local offline: al ejecutarse con Strata en una máquina de consumo, encaja en entornos sin conectividad o con requisitos de privacidad estrictos.
- Reproducción de benchmarks: el repositorio de métricas incluye logs por pregunta de GPQA-Diamond y AIME25, lo que facilita la verificación independiente de los resultados.

## Benchmarks y rendimiento

Datos publicados en la model card (medidos con Strata, esfuerzo de razonamiento 50):

| Benchmark | GSQ-RCO original | Uncensored (este modelo) |
|---|---|---|
| GPQA-Diamond (198 preguntas) | 83,3% | 83,3% |
| AIME25 (30 preguntas) | 76,7% | 80,0% |

Métricas de la edición por rung (lectura "original → editado"):

| Rung | bpw | Total GB | JailbreakBench (EN) | XSTest (rechazos seguros) | Thinking high (30) | MMLU (500) | KL respecto al original |
|---|---|---|---|---|---|---|---|
| IQ2_XXS | 2,0 | 249 | 85,2% → 0,0% | 7,6% → 0,0% | 27/30 → 0/30 | 82,8% (p=0,27) | 0,0225 |
| IQ2_XS | 2,25 | 266 | 86,4% → 0,0% | 4,0% → 0,4% | 27/30 → 2/30 | 81,6% (p=1,00) | 0,0272 |
| IQ1_M | 1,75 | 231 | 88,9% → 0,0% | 4,8% → 0,0% | 27/30 → 1/30 | 80,6% (p=0,75) | 0,0207 |

El KL se calcula con el modo de puntuación forzada por profesor de Strata y es una cota inferior top-64, por lo que el KL real es ligeramente superior.

## Requisitos de hardware

- VRAM estimada: el modelo base completo requiere una GPU de 12 GB según la model card, gracias a que la columna vertebral reside en memoria del sistema y la tabla Engram (110 GB) se transmite desde SSD.
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica "una única GPU de 12 GB".
- Cabe en GPU de consumo: sí, con 12 GB de VRAM y suficiente RAM de sistema y almacenamiento SSD rápido para la tabla Engram.
- Opciones de despliegue: runtime Strata (el único soportado actualmente; llama.cpp no soporta todavía DeepSeek-V4.1 con fichero Engram separado).
- Almacenamiento: cada rung ocupa entre 231 y 266 GB, más 110 GB de la tabla Engram compartida, que debe residir en un SSD rápido junto a los shards.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF (este) | ~552B (MoE, 384 expertos) | no disponible | MIT | GGUF | Edición sin rechazos, requiere Strata |
| ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF | ~552B (MoE, 384 expertos) | no disponible | no disponible | GGUF | Cuantización original sin edición de rechazos |
| AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF | 552B | no disponible | no disponible | GGUF | Misma edición de rechazos, mediciones por rung |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | 763B (MoE, 384 expertos) | no disponible | no disponible | no disponible | Modelo base original de DeepSeek |

## Limitaciones y advertencias

- El clasificador de rechazo lee el inicio de la respuesta, por lo que un rechazo suave formulado más adelante en el texto puede pasar como respuesta válida.
- La edición elimina los rechazos en todos los temas; no conserva un subconjunto más estrecho de rechazos.
- Con el modo de pensamiento activado, la model card indica que la edición planifica una respuesta a una petición (texto truncado en la información disponible).
- No todas las rungs superaron todas las puertas de calidad; las que no lo hicieron se publican tal cual, con sus números en la tabla y en el repositorio de métricas.
- El modelo solo se ejecuta actualmente en Strata; no hay soporte en llama.cpp para DeepSeek-V4.1 con fichero Engram separado.
- Requiere descargar la tabla Engram de 110 GB desde el repositorio de ISTA-DASLab, que no se rehostea en este repositorio.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgos de alucinación específicos.
- Licencia MIT: permite uso comercial, pero el contenido generado sin filtros de rechazo puede ser inapropiado y requiere revisión en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Duhvil/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Repositorio de cuantización original: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Edición de rechazos de referencia: https://huggingface.co/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Repositorio de métricas: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Runtime Strata: https://github.com/Niko1221/Strata
- Repositorio espejo en GitHub: https://github.com/chen47206017-cpu/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-GGUF
- Atomic Chat: https://atomic.chat/
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de AtomicChat: https://x.com/atomic_chat_hq
