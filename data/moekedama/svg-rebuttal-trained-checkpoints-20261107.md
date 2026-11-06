# moeKedama/svg-rebuttal-trained-checkpoints-20261107

## Resumen

`moeKedama/svg-rebuttal-trained-checkpoints-20261107` es un repositorio de checkpoints de investigación publicado por el usuario moeKedama en Hugging Face, no un modelo base entrenado desde cero. Contiene un lote de pesos ya entrenados orientados a la generación de gráficos vectoriales SVG: siete checkpoints de inferencia de StarVector, un baseline OmniSVG SVGIcon corregido y trece adaptadores finales Qwen8/LLaVA8 que faltaban en un backup de despliegue anterior. El repositorio ocupa 49 GB y se distribuye en formato PyTorch/safetensors.

El interés del artefacto es de trazabilidad y reproducibilidad experimental más que de uso como modelo listo para producción: incluye un `MANIFEST.json` con tamaños, hashes SHA256, rutas de origen y procedencia de configuración, y separa explícitamente los checkpoints corregidos de los históricos con problemas de caché de datos de entrenamiento. La model card advierte de que los pesos no se han modificado respecto al origen y de que el estado de reanudación de optimizador, RNG y posición de datos no está incluido.

No se dispone de información sobre arquitectura de los modelos subyacentes, número de parámetros, contexto, licencia ni idiomas dentro de la información proporcionada; los datos disponibles se limitan a la estructura del repositorio y a la procedencia declarada de los checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de StarVector, OmniSVG y adaptadores LoRA sobre Qwen8/LLaVA8) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`weights.pt`) y safetensors; adaptadores LoRA con `adapter_config.json` |

## Arquitectura y entrenamiento

El repositorio agrupa artefactos de tres familias de trabajo distintas sobre generación de SVG. La primera son siete checkpoints de inferencia de StarVector: seis grupos históricos de corrección de scheduler y el S2 corregido `starvector/rebuttal-warmup125-unisvg-top10-stage2-full-20261105-dtypeguard-v2/weights.pt`, que emplea un warmup de 125 pasos sobre UniSVG top-10 en lugar del warmup histórico, conservado en el otro checkpoint S2 solo para comparación diagnóstica. La segunda es el baseline OmniSVG SVGIcon corregido, que completó 2706 actualizaciones de optimizador e incluye un recibo de verificación de entrenamiento; los antiguos checkpoints `tokenfix_v2` de OmniSVG presentan un problema histórico de caché de datos y no se sustituyen por este baseline. OmniSVG S1 seguía en entrenamiento y no forma parte del lote.

La tercera familia son trece adaptadores LoRA finales (Qwen8/LLaVA8) que faltaban en el backup de despliegue previo. Las rutas base de los adaptadores se han hecho portables fijando el repositorio oficial del modelo base y su revisión en cada `adapter_config.json`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se detalla ninguna innovación de decodificación o atención; la única modificación declarada es de posprocesado (reparación de salida "native-clean"), que no altera los pesos.

## Capacidades

- Generación de gráficos vectoriales SVG a partir de modelos StarVector y OmniSVG (capacidad inferida de los tags `svg`, `starvector` y `omnisvg`).
- Adaptación mediante LoRA sobre modelos base Qwen8 y LLaVA8, presumiblemente para tareas de generación o descripción de SVG.
- Comparación diagnóstica entre configuraciones de scheduler y warmup (checkpoints históricos frente a corregidos).
- Reproducibilidad de experimentos mediante manifiesto con hashes SHA256 y procedencia de configuración.
- No se dispone de información sobre tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio o modo thinking.

## Casos de uso

- Reproducción de experimentos de generación SVG: cargar los checkpoints StarVector con su `config.yaml` y archivo de código fuente para replicar los resultados del artículo o rebuttal asociado, usando el manifiesto para verificar integridad.
- Evaluación comparativa de schedulers: usar el par de checkpoints S2 (warmup125 frente a warmup histórico) para medir el efecto del cambio de warmup en la calidad de los SVG generados.
- Fine-tuning de adaptadores LoRA: descargar el modelo base fijado en cada `adapter_config.json` y cargar el adaptador correspondiente para tareas de generación vectorial sobre Qwen8/LLaVA8.
- Auditoría de procedencia de pesos: verificar hashes SHA256 y rutas de origen del `MANIFEST.json` antes de incorporar checkpoints a un pipeline interno, útil en entornos con requisitos de trazabilidad.
- Baseline para investigación en OmniSVG: emplear el baseline SVGIcon corregido (2706 actualizaciones, con recibo de verificación) como referencia frente a los checkpoints `tokenfix_v2` descartados por el problema de caché.
- Archivado y sincronización de artefactos de laboratorio: el repositorio sirve como lote de checkpoints completados sincronizado desde "lab7", útil para reconstruir un backup de despliegue incompleto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del modelo base subyacente de cada checkpoint y adaptador, no especificado).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: los checkpoints StarVector requieren su `config.yaml`, archivo de código fuente y dependencias oficiales de modelo y tokenizador; los adaptadores LoRA requieren descargar el modelo base fijado en `adapter_config.json`. No se indican frameworks de serving (vLLM, llama.cpp, TGI).
- Latencia y throughput: no disponible.
- Nota operativa: el repositorio completo ocupa 49 GB, por lo que conviene descargar solo los subdirectorios necesarios de `trained_checkpoints_20261106_v1/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moeKedama/svg-rebuttal-trained-checkpoints-20261107 | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas, 1 like |
| StarVector (modelo upstream) | no disponible | no disponible | no disponible | no disponible | referenciado como dependencia oficial, no detallado |
| OmniSVG (modelo upstream) | no disponible | no disponible | no disponible | no disponible | baseline incluido en este lote; S1 en entrenamiento |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada; la comparación se limita a la disponibilidad declarada.

## Limitaciones y advertencias

- No es un modelo listo para uso directo: son checkpoints de investigación que requieren el código fuente, configuración y dependencias del proyecto original.
- Los snapshots nativos conservan rutas de origen del proyecto original y necesitan adaptación explícita de rutas al desplegarse en otro entorno.
- Los checkpoints OmniSVG `tokenfix_v2` tienen un problema histórico de caché de datos de entrenamiento y no deben usarse como sustituto del baseline corregido.
- OmniSVG S1 no está incluido (seguía entrenando en el momento de la publicación).
- No se incluye estado de reanudación de optimizador, RNG ni posición de datos, lo que impide reanudar entrenamientos desde estos checkpoints.
- Licencia no declarada: no se puede asumir uso comercial sin confirmación del autor.
- Sin información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas de los modelos subyacentes.
- El repositorio tiene 0 descargas y 1 like, sin validación comunitaria; la calidad de los pesos no está contrastada de forma independiente.
- Contexto de seguridad: se ha documentado públicamente actividad de ransomware dirigida a checkpoints y datasets de IA (caso JadePuffer/EncForge); conviene verificar hashes SHA256 del manifiesto antes de cargar los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moeKedama/svg-rebuttal-trained-checkpoints-20261107
- Perfil del autor: https://huggingface.co/moeKedama
- Noticia sobre ataques a activos de IA (contexto de seguridad): https://www.bleepingcomputer.com/news/security/jadepuffer-agentic-attacks-now-target-ai-model-data-with-ransomware/
