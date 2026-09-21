# SeriYann/MicroscopyCLIP

## Resumen

MicroscopyCLIP es un ajuste fino del modelo CLIP ViT-B/32 de OpenAI, publicado por el usuario SeriYann en HuggingFace. Se trata de un modelo de visión y lenguaje de doble codificador (dual encoder) orientado a la clasificación de imágenes de microscopía mediante zero-shot image classification, es decir, sin necesidad de reentrenar para cada nueva taxonomía de clases. El repositorio ocupa 0,6 GB y contiene pesos en formato safetensors con 151.277.312 parámetros, coherentes con la arquitectura del modelo base.

El modelo parte de `openai/clip-vit-base-patch32` y se ha sometido a un ajuste fino de todos los parámetros (full-parameter fine-tuning) sobre pares imagen-texto de microscopía, según la escasa model card publicada. No se documenta el volumen del dataset, su composición, el procedimiento de curación ni ninguna evaluación cuantitativa posterior al ajuste.

Su relevancia es limitada y debe interpretarse con cautela: el repositorio no tiene descargas ni likes, no incluye resultados de benchmarks, no especifica idiomas ni recetas de cuantización, y la model card se reduce a dos líneas. Resulta útil como punto de partida experimental para quien trabaje con datos histológicos o citológicos, pero no puede considerarse un modelo validado para producción clínica sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP de doble codificador (ViT-B/32 para visión y transformer de texto), heredada de `openai/clip-vit-base-patch32` |
| Parametros totales | 151.277.312 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens para el codificador de texto, limite estandar del modelo base CLIP ViT-B/32; no especificado en la model card |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | zero-shot-image-classification |
| Modelo base | openai/clip-vit-base-patch32 |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |

## Arquitectura y entrenamiento

La arquitectura es la de CLIP ViT-B/32: un codificador de imagen basado en Vision Transformer con parches de 32x32 pixeles y un codificador de texto tipo transformer, ambos proyectados a un espacio de embeddings compartido de 512 dimensiones y entrenados con un objetivo contrastivo imagen-texto. El ajuste fino es de todos los parametros, no un adaptador tipo LoRA, segun indica la model card.

No se especifica el numero de pares imagen-texto empleados, la procedencia de las imagenes (histologia, citologia, microscopia electronica, cultivos celulares), el esquema de muestreo negativo, la resolucion de entrada ni la duracion del entrenamiento. Tampoco hay constancia de tecnicas adicionales como decodificacion especulativa, atencion lineal o destilacion. Al ser un modelo contrastivo, no se aplican tecnicas de alineacion tipo RLHF o DPO.

## Capacidades

- Clasificacion de imagenes zero-shot: permite definir clases mediante prompts de texto en tiempo de inferencia, sin reentrenamiento.
- Similitud imagen-texto: genera embeddings normalizados de imagen y de texto comparables con similitud coseno.
- Recuperacion imagen-texto y texto-imagen: util para buscar en repositorios de imagenes a partir de descripciones.
- Extraccion de embeddings visuales para clustering, deduplicacion o deteccion de outliers en colecciones de microscopia.
- Filtrado y triaje automatico: puntuacion de pertenencia a una clase o a un conjunto de atributos descritos en lenguaje natural.
- No genera texto: no dispone de decoder autoregresivo, por lo que no hay generacion libre, resumen ni respuesta a preguntas de formato abierto.
- Soporte de tool calling / function calling: no disponible, no es una capacidad de la arquitectura CLIP.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el codificador de texto de CLIP se entreno predominantemente con texto en ingles, pero la model card no confirma el alcance idiomatico tras el ajuste.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponibles; la unica modalidad de entrada es imagen y texto.

## Casos de uso

- Triaje previo de portaobjetos en laboratorio: usar el modelo para separar imagenes que contienen tejido de las que son fondo, artefactos o portaobjetos vacios antes de pasarlas a un patologo o a un modelo de segmentacion, aprovechando la clasificacion zero-shot con prompts del tipo "tejido histologico teñido con hematoxilina-eosina".
- Organizacion automatica de archivos de imagenes microscopicas: extraer embeddings de todo el repositorio y agrupar por similitud para detectar duplicados, series incompletas o capturas fuera de protocolo, sin etiquetas previas.
- Busqueda semantica en archivos de investigacion: indexar las imagenes con embeddings y permitir consultas en lenguaje natural como "celulas con nucleo grande y citoplasma claro", lo que acelera la localizacion de casos de interes en estudios retrospectivos.
- Filtrado en pipelines de anotacion y active learning: puntuar cada imagen nueva contra un conjunto de etiquetas provisionales y enviar al anotador humano solo las muestras con mayor incertidumbre, reduciendo el coste de etiquetado.
- Control de calidad de capturas: definir prompts que describan capturas correctas (enfoque, iluminacion, campo completo) y descartar automaticamente las que se alejen de esa descripcion.
- Experimentos de clasificacion con taxonomias cambiantes: cuando el conjunto de clases de un estudio se redefine con frecuencia, el modelo permite reevaluar todo el conjunto cambiando unicamente los prompts, sin reentrenar.
- Prototipado rapido en investigacion: servir como linea base frente a modelos especificos de patologia para decidir si merece la pena invertir en un ajuste fino supervisado con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion, exactitud zero-shot, AUC ni comparaciones con modelos de patologia, y la busqueda web realizada no ha devuelto ningun articulo, blog o repositorio asociado a este modelo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,6 GB solo para los pesos, mas activaciones y buffers de la pipeline de vision; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en fp16/bf16: alrededor de 0,3 GB para los pesos, con margen amplio para lotes grandes en GPU de gama media.
- GPU consumer compatibles: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). Tambien es viable en CPU para inferencia puntual, con latencia mayor.
- GPU de datacenter: A100, H100 o L40S resultan sobredimensionadas para una sola inferencia, pero utiles para indexar cientos de miles de imagenes en paralelo con lotes grandes.
- Opciones de despliegue: pipeline de `transformers` con `zero-shot-image-classification`, exportacion a ONNX con Optimum y ejecucion con ONNX Runtime o TensorRT, servidores tipo TorchServe o HuggingFace Inference Endpoints. `open_clip` puede cargar pesos compatibles de CLIP, aunque no hay confirmacion explicita de compatibilidad con este ajuste concreto. Ollama y llama.cpp estan orientados a modelos de lenguaje generativos y no aplican a esta arquitectura.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MicroscopyCLIP | 151.277.312 | 77 tokens (heredado de CLIP ViT-B/32) | MIT | HuggingFace, 0 descargas, sin evaluacion publicada | Ajuste fino completo sobre pares imagen-texto de microscopia, dataset no documentado |
| openai/clip-vit-base-patch32 | ~151 M | 77 tokens | MIT | HuggingFace, ampliamente usado | Modelo base sin ajuste de dominio; rendimiento generico en imagenes naturales |
| BiomedCLIP | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Orientado a imagen medica general con encoder ViT-B/16; no se dispone de datos verificados en esta busqueda |
| PLIP | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Ajuste de CLIP para patologia; referencia habitual en el mismo nicho |

Los datos de los modelos alternativos no se han verificado en esta busqueda y se marcan como no disponibles para evitar afirmaciones sin respaldo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay metricas, curvas ni comparaciones que permitan estimar si el ajuste mejora o degrada el modelo base.
- Dataset de entrenamiento desconocido: se ignora el numero de pares, la procedencia, la distribucion de tinciones, escaneres y aumentos, lo que impide juzgar el riesgo de sobreajuste a un unico dominio.
- Generalizacion dudosa: un ajuste fino completo sobre un corpus reducido puede degradar el rendimiento fuera del estilo de imagen concreto usado, incluido el propio dominio de microscopia si cambia la tincion o el equipo.
- Sesgo de idioma: el codificador de texto de CLIP se entreno principalmente con texto en ingles; los prompts en castellano pueden funcionar peor y no hay validacion al respecto.
- Sensibilidad a los prompts: en clasificacion zero-shot los resultados dependen mucho de la redaccion de las etiquetas; conviene probar varias plantillas y calibrar umbrales.
- Alucinacion: al no generar texto libre, no aplica el riesgo habitual de alucinacion linguistica, pero si existe el riesgo de asignar una clase con alta confianza a una imagen irrelevante, ya que la similitud coseno no esta calibrada como probabilidad.
- Sin validacion clinica: el modelo no cuenta con marcado CE ni aprobacion FDA, y no debe usarse para diagnostico ni para decisiones terapeuticas.
- Licencia MIT: permisiva y compatible con uso comercial, pero no exime al usuario de verificar la procedencia de los datos de entrenamiento ni de las imagenes que utilice.
- Repositorio sin traccion: cero descargas y cero likes implican que no ha sido revisado por la comunidad; cualquier fallo de carga o incompatibilidad no esta documentado.
- Ausencia de versiones cuantizadas y de pesos GGUF: la integracion en entornos de bajos recursos exige exportar los pesos por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeriYann/MicroscopyCLIP
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Paper original de CLIP (referencia del modelo base): https://arxiv.org/abs/2103.00020
- Repositorio open_clip: https://github.com/mlfoundations/open_clip
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) asociados a este modelo en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
