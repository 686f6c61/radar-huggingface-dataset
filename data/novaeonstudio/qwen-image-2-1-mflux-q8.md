# NovaeonStudio/qwen-image-2.1-mflux-q8

## Resumen

`NovaeonStudio/qwen-image-2.1-mflux-q8` es una cuantización de 8 bits del modelo de difusión texto-a-imagen `Qwen/Qwen-Image-2.1`, empaquetada por Novaeon.Studio en el formato nativo de la librería mflux para su ejecución sobre Apple Silicon mediante MLX. No es un modelo nuevo: es un repack de los pesos oficiales de Qwen, sin fine-tuning ni fusiones, orientado a que la comunidad Mac pueda cargar el modelo de forma directa con el pipeline dedicado `mflux-generate-qwen-2.1`.

El problema que resuelve es operativo: cuando se publicó Qwen-Image-2.1 no existía un paquete de 8 bits listo para mflux, solo el modelo base en precisión completa. Esta build reduce el peso en disco a unos 22 GB y el pico de memoria en ejecución a unos 18,4 GB, lo que la hace viable en máquinas Apple Silicon con 24 GB o más de memoria unificada, evitando cuantizaciones en tiempo de ejecución y descargas de más de 40 GB.

La arquitectura subyacente es un transformer de difusión (DiT) con un text encoder Qwen2.5-VL y un VAE de imagen. El modelo está pensado para generación de imágenes fotorrealistas con buen rendimiento en materiales e iluminación, y tolera inferencia con pocos pasos (8 pasos con guidance 1.0 para borradores rápidos). La licencia es de investigación, no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) con text encoder Qwen2.5-VL y VAE de imagen |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el contexto aplica al prompt de texto) |
| Tipos de cuantizacion | 8 bits (mflux 8-bit, generado con `mflux-save --quantize 8`) |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research-license (solo investigacion y evaluacion; uso comercial requiere licencia aparte de Qwen) |
| Formato de pesos | safetensors (shards por componente: `transformer/`, `text_encoder/`, `vae/`, `processor/`) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-2.1 es un modelo de difusion texto-a-imagen cuya columna vertebral es un transformer de difusion (DiT). El paquete incluye cuatro componentes: el transformer DiT cuantizado (shards 0-3 mas indice), el text encoder basado en Qwen2.5-VL (shards 0-7 mas indice), el VAE de imagen y el procesador con tokenizer y chat template. Esta build concreta es una cuantizacion directa de los pesos oficiales a 8 bits mediante mflux, sin reentrenamiento, fine-tuning ni fusion de pesos.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovacion tecnica destacable de este repack es el formato nativo mflux sobre MLX, que permite cargar el modelo en segundos y mantener coherencia con muy pocos pasos de muestreo (8 pasos con guidance 1.0), lo que abarata los borradores y acelera las iteraciones.

## Capacidades

- Generacion de imagenes texto-a-imagen con enfasis en materiales, iluminacion y realismo fotografico.
- Borradores rapidos con pocos pasos (8 pasos, guidance 1.0) manteniendo coherencia.
- Generacion final de mayor detalle con 20-30 pasos y guidance 2.5-3.5.
- Resoluciones configurables entre 1024 y 1536 (multiplos de 16), con 1328x1328 como valor por defecto recomendado.
- Control de semilla para resultados reproducibles.
- Capacidad limitada de renderizar texto en imagen; el autor recomienda minimizarlo y componer texto real despues.
- Soporte de prompts en ingles (unico idioma declarado).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento, al tratarse de un modelo de generacion de imagen.

## Casos de uso

- Prototipado visual rapido en Mac: usar los 8 pasos con guidance 1.0 para generar borradores en unos 14 segundos a 768x768 y validar direcciones creativas antes de invertir en renders finales.
- Fotografia de producto sintetica: generar bodegones con lenguaje de iluminacion ("rim light", "volumetric", "85 mm") para maquetas de ecommerce o presentaciones, aprovechando el rendimiento del base en materiales y reflejos.
- Concept art de arquitectura y escenarios: prompts de interiores o exteriores con paletas controladas (por ejemplo, "midnight navy background, amber-to-coral glow, indigo accents") para previsualizacion de entornos.
- Exploracion de paletas de marca: fijar una paleta consistente mediante el prompt y generar variaciones de una misma direccion visual para revision interna.
- Iteracion creativa local sin nube: al requerir unos 18,4 GB de pico de memoria, se puede ejecutar en un portatil Apple Silicon de 24 GB o mas, manteniendo el flujo de trabajo offline y sin coste por imagen.
- Investigacion en difusion: servir como base cuantizada reproducible para experimentos de muestreo con pocos pasos, comparativas de guidance o estudios de calidad frente al modelo en precision completa.
- Generacion de material de referencia para equipos de diseno: crear imagenes de referencia que luego se retocan o se usan como guia en herramientas de diseno, dado el caracter no comercial de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o metricas de imagen como FID) en la informacion disponible. Los unicos datos de rendimiento son mediciones de velocidad y memoria del autor sobre un Apple M5 Max de 128 GB:

| Resolucion | Pasos | Tiempo | Memoria pico |
|---|---|---|---|
| 768x768 | 8 | ~14 s | ~18,4 GB |
| 1328x1328 | 8 | ~30 s (incluye carga) | ~18 GB |

El tiempo escala de forma aproximadamente lineal con el numero de pasos y el area en pixeles. La primera llamada incluye un coste de carga del modelo; las llamadas posteriores con el modelo residente son mas rapidas. La velocidad medida es de aproximadamente 1,4 s por paso en M5 Max.

## Requisitos de hardware

- Memoria pico en ejecucion: unos 18,4 GB a 768x768 con 8 pasos; unos 18 GB a 1328x1328.
- Espacio en disco: unos 22 GB para los pesos cuantizados (el repositorio ocupa 24,0 GB).
- Hardware objetivo: Apple Silicon con memoria unificada de 24 GB o mas; el autor lo construyo y midio en un Apple M5 Max de 128 GB.
- No esta pensado para GPU NVIDIA ni CUDA: el formato es MLX/mflux, no GGUF ni safetensors estandar para vLLM, TGI o llama.cpp.
- Opciones de despliegue: mflux 0.20.0 o superior, mediante el comando `mflux-generate-qwen-2.1`.
- No se debe volver a aplicar `--quantize` al cargar el modelo, ya que los pesos ya estan cuantizados a 8 bits.
- Latencia y throughput: aproximadamente 1,4 s por paso en M5 Max; 8 pasos en unos 14 s a 768x768 y unos 30 s a 1328x1328 incluyendo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NovaeonStudio/qwen-image-2.1-mflux-q8 | no disponible | no disponible | safetensors 8-bit / mflux (MLX) | qwen-research-license (no comercial) | Hugging Face, 213 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | precision completa / varios | qwen-research-license (no comercial) | Hugging Face (oficial) |
| Otros modelos texto-a-imagen para Apple Silicon | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa mas relevante es con el modelo base Qwen-Image-2.1 en precision completa: esta build reduce el peso en disco a unos 22 GB y el pico de memoria a unos 18,4 GB, a cambio de una cuantizacion a 8 bits cuyos efectos en calidad no se han cuantificado en la informacion disponible. No se dispone de datos de otros modelos comparables de la misma categoria en el material proporcionado.

## Limitaciones y advertencias

- Licencia de investigacion: solo permite uso, copia y modificacion para investigacion o evaluacion; cualquier uso comercial requiere una licencia separada de Qwen (contacto indicado en la model card).
- Es una version modificada (cuantizada a 8 bits) del modelo base; los posibles sesgos del base se heredan y no se documentan en esta ficha.
- Riesgo de alucinacion visual y de artefactos: como todo modelo de difusion, puede generar detalles incoherentes, anatomia incorrecta o texturas erroneas.
- Renderizado de texto deficiente: el autor advierte que puede garblear cadenas largas; recomienda componer texto y logotipos reales despues.
- Solo soporta prompts en ingles; no se declaran capacidades multilingues.
- Dependencia de hardware: exclusivo de Apple Silicon via MLX/mflux; no es desplegable en CUDA, vLLM, TGI ni llama.cpp sin conversion adicional.
- No se deben aplicar cuantizaciones adicionales al cargar (`--quantize`), ya que los pesos ya estan a 8 bits.
- No hay datos publicados de calidad (FID, CLIP score u otras metricas) que permitan evaluar la perdida de fidelidad frente al modelo en precision completa.
- El rendimiento medido corresponde a un M5 Max de 128 GB; en equipos con 24 GB el margen de memoria es ajustado y podria limitar resoluciones altas o procesos concurrentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NovaeonStudio/qwen-image-2.1-mflux-q8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio mflux: https://github.com/filipstrand/mflux
- Novaeon.Studio: https://novaeon.studio
- Licencia (archivo LICENSE en el repositorio): https://huggingface.co/NovaeonStudio/qwen-image-2.1-mflux-q8/blob/main/LICENSE
- Atribuciones (archivo NOTICE en el repositorio): https://huggingface.co/NovaeonStudio/qwen-image-2.1-mflux-q8/blob/main/NOTICE
