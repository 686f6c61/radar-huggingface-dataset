# nikigoli/CountGDPlusPlus

## Resumen

CountGD++ es un modelo multimodal de conteo de objetos en mundo abierto desarrollado por Niki Amini-Naieni (junto con Andrew Zisserman, según la cita del paper) y presentado en CVPR 2026 bajo el título "CountGD++: Generalized Prompting for Open-World Counting". El modelo resuelve el problema de contar instancias de objetos arbitrarios en imágenes sin necesidad de entrenamiento específico por categoría: el usuario indica qué contar mediante texto, mediante ejemplos visuales (cajas delimitadoras sobre objetos de muestra) o combinando ambas modalidades.

Su aportación principal es la generalización del esquema de prompting: admite también indicaciones negativas, es decir, texto y ejemplos visuales que especifican qué **no** contar (por ejemplo, contar "fresas" pero no "arándanos"). Además, los ejemplos visuales pueden proceder de la propia imagen analizada o de una imagen distinta, lo que amplía mucho la flexibilidad práctica.

La arquitectura se basa en Grounding DINO (detector de vocabulario abierto) con un codificador de texto BERT (`bert-base-uncased`). El modelo tiene 233.860.480 parámetros, se distribuye en safetensors con licencia MIT y está implementado en PyTorch. Es relevante porque el conteo abierto en mundo abierto es una tarea con aplicaciones directas en inventario, teledetección, microscopía y análisis de escenas densas, y CountGD++ es uno de los modelos más recientes en este nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Grounding DINO (detector open-vocabulary multimodal) con codificador de texto BERT |
| Parametros totales | 233.860.480 |
| Parametros activos | no disponible (no es un modelo MoE; todos los parametros participan en la inferencia) |
| Longitud de contexto | no disponible (limitada por el codificador de texto bert-base-uncased, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible (se distribuye en pesos originales sin cuantizar) |
| Idiomas soportados | Ingles (prompts de texto; el codificador es bert-base-uncased) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` + `config.json`) |

## Arquitectura y entrenamiento

CountGD++ se construye sobre Grounding DINO, un detector de objetos de vocabulario abierto que fusiona informacion visual y textual mediante atencion cruzada. El pipeline de inferencia sigue el esquema clasico de deteccion: un backbone visual (con Swin Transformer segun la implementacion original de Grounding DINO, aunque la model card no lo especifica explicitamente), un codificador de texto BERT-base-uncased, un encoder-decoder con atencion deformable multiescala y una cabeza de deteccion. Sobre esta base, el modelo extiende el mecanismo de prompting para aceptar simultaneamente texto positivo, texto negativo, ejemplos visuales positivos (cajas sobre objetos de la imagen objetivo o de una imagen externa) y ejemplos visuales negativos.

La model card menciona dos componentes adicionales empleados en algunos resultados de benchmark que no forman parte de la funcion `count()` basica: pseudo-ejemplos (exemplars sinteticos) y recorte adaptativo (adaptive cropping), utiles para imagenes muy densas. Los kernels compilados de atencion deformable multiescala son opcionales; sin ellos se usa una implementacion equivalente en PyTorch puro sobre CPU o GPU. Los detalles del procedimiento de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se describen en la informacion disponible; para la tarea de conteo estos elementos no aplican de la misma forma que en modelos de lenguaje. Los detalles completos estan en el paper (arXiv:2512.23351).

## Capacidades

- **Conteo open-vocabulary zero-shot**: cuenta instancias de cualquier categoria descrita en lenguaje natural, sin entrenamiento por clase.
- **Prompting multimodal**: acepta texto, ejemplos visuales (cajas sobre objetos de muestra) o ambos combinados.
- **Prompting negativo**: permite especificar que no contar mediante texto negativo y ejemplos visuales negativos, reduciendo confusiones entre clases visualmente similares.
- **Ejemplos de imagenes externas**: los ejemplos visuales pueden provenir de una imagen distinta a la que se analiza.
- **Deteccion con localizacion**: ademas del conteo, devuelve las cajas de las detecciones en formato normalizado (cx, cy, w, h).
- **Zero-shot object detection**: clasificado en Hugging Face bajo el pipeline `zero-shot-object-detection`.
- **Ejecucion en CPU o GPU**: sin los kernels compilados de atencion deformable, funciona con una implementacion PyTorch pura en ambos dispositivos.

## Casos de uso

- **Inventario y retail automatizado**: contar productos en estanterias o palés a partir de fotografias; el prompting con ejemplos visuales permite adaptarse a referencias nuevas sin reentrenar, y el texto negativo evita confundir productos similares de distinta marca.
- **Analisis de imagenes de microscopia y biologia**: cuantificar celulas, colonias u organismos en imagenes densas; el recorte adaptativo (disponible en los scripts de test) esta pensado para escenas con muchas instancias.
- **Teledeteccion y agricultura**: contar arboles, vehiculos, embarcaciones o animales en imagenes aereas o satelitales, donde las categorias varian por region y campana y un detector cerrado no escala.
- **Vigilancia y trafico**: estimar el numero de vehiculos o personas en una escena con prompts textuales, combinando ejemplos visuales cuando la apariencia es dificil de describir con palabras.
- **Etiquetado y validacion de datasets**: generar conteos y cajas de anotacion automaticas para construir o auditar datasets de vision, con revision humana posterior, gracias a que devuelve tanto el conteo como las detecciones.
- **Investigacion en vision por computador**: servir como baseline o componente en sistemas de conteo, deteccion open-vocabulary o razonamiento visual, dado que el codigo y los pesos son abiertos bajo MIT.
- **Control de calidad industrial**: verificar el numero de piezas, tornillos o componentes en una linea de produccion usando ejemplos visuales de la pieza correcta y ejemplos negativos de piezas defectuosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que algunos resultados del paper emplean pseudo-ejemplos y recorte adaptativo, pero no incluye tablas de metricas (por ejemplo, MAE o RMSE sobre FSC-147, benchmark estandar de la tarea). Consultese el paper en arXiv:2512.23351 para los numeros oficiales.

## Requisitos de hardware

- **VRAM estimada**: no disponible como cifra oficial. Con ~234 millones de parametros en fp32, los pesos ocupan alrededor de 0,9 GB; en la practica, una GPU con 8 GB de VRAM (por ejemplo, una RTX 3060 o superior) deberia ser suficiente para inferencia, aunque la model card no lo confirma.
- **GPU recomendadas**: no disponible oficialmente; el modelo esta pensado para ejecutarse con `.to("cuda")` pero tambien funciona en CPU mediante la implementacion PyTorch pura de la atencion deformable.
- **Consumer GPU**: la model card no impone requisitos de gama alta; dado el tamano del modelo, deberia funcionar en GPUs de consumo modernas, aunque sin datos oficiales esto es una estimacion.
- **Despliegue**: el repositorio de Hugging Face incluye tanto pesos como codigo de inferencia (`countgdpp.CountGDPlusPlus` con `from_pretrained`), de modo que basta con `snapshot_download` y PyTorch. No hay soporte nativo documentado para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a modelos de lenguaje; este es un modelo de vision).
- **Dependencias**: requiere `transformers<4.50`, `timm` y otras librerias indicadas en la model card; el codificador de texto `bert-base-uncased` se descarga del Hub en la primera carga.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Prompting | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CountGD++ (este modelo) | 233,9 M | Conteo open-vocabulary | Texto, ejemplos visuales, prompts negativos (texto y visual) | MIT | Pesos y codigo en Hugging Face |
| CountGD (predecesor) | no disponible | Conteo open-vocabulary | Texto y ejemplos visuales | no disponible | Repositorio de los mismos autores |
| Grounding DINO | no disponible | Deteccion open-vocabulary | Solo texto | no disponible (pesos abiertos) | Hugging Face, integrado en transformers |

CountGD++ se distingue de su predecesor CountGD y de detectores como Grounding DINO por añadir el prompting negativo (texto y ejemplos visuales) y por permitir ejemplos visuales provenientes de imagenes externas. Para alternativas de conteo con otros enfoques (por ejemplo, metodos especializados en conteo por clase), no hay datos comparativos suficientes en la informacion disponible.

## Limitaciones y advertencias

- **Idioma del prompt**: el codificador de texto es `bert-base-uncased`, entrenado en ingles; los prompts en otros idiomas, incluido el castellano, probablemente degraden el rendimiento.
- **Version de transformers**: requiere `transformers<4.50`, lo que puede generar conflictos de dependencias en entornos modernos.
- **Componentes no incluidos en la API basica**: los pseudo-ejemplos y el recorte adaptativo usados en algunos resultados del paper no forman parte de `count()`; hay que recurrir a los scripts de test del repositorio de GitHub.
- **Kernels opcionales**: sin compilar la atencion deformable multiescala, el rendimiento puede ser inferior al usar la implementacion en PyTorch puro.
- **Riesgo de errores de conteo**: como todo modelo de conteo zero-shot, puede confundir clases visualmente similares o fallar en escenas muy densas u ocluidas; la model card no publica metricas de error, por lo que conviene validar en el dominio de aplicacion antes de usarlo en produccion.
- **Sesgos**: no documentados en la informacion disponible; al heredar de Grounding DINO y BERT, puede heredar los sesgos de sus datos de entrenamiento (no detallados en la model card).
- **Licencia**: MIT, sin restricciones para uso comercial.
- **Estado del repositorio**: modelo reciente (creado en octubre de 2026) con muy pocas descargas (119), por lo que el soporte comunitario y la madurez del codigo son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikigoli/CountGDPlusPlus
- Paper (arXiv): https://arxiv.org/abs/2512.23351
- Codigo (GitHub): https://github.com/niki-amini-naieni/CountGDPlusPlus
