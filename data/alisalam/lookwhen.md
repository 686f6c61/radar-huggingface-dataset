# alisalam/LookWhen

## Resumen

LookWhen es un framework de selector-extractor para reconocimiento de video eficiente, desarrollado por Ali Salamatian y colaboradores (UBC, Simon Fraser University y Google DeepMind). El modelo aborda el coste computacional superlineal de los transformers aplicados a video, que procesan cientos de tokens por fotograma cuando gran parte de la informacion es redundante. La propuesta divide el reconocimiento en dos etapas: un selector superficial que puntua todos los parches de un clip reducido al 50% de resolucion, y un extractor profundo que procesa unicamente los top-K tokens seleccionados, prediciendo aun asi las caracteristicas del video completo.

El checkpoint publicado corresponde a un ViT-B/16 pre-entrenado durante 20 epocas en Kinetics-400 y Something-Something v2 (SSv2), mediante destilacion de los tokens de video de InternVideo2 y los tokens de fotograma y parche de DINOv3, con seleccion supervisada por unicidad de tokens basada en distancia top-1. El modelo se entrena con una esparsidad entre el 70% y el 95%, por lo que puede ejecutarse en cualquier punto de ese rango sin necesidad de re-entrenamiento. Su relevancia actual radica en que ofrece una via practica para desplegar reconocimiento de acciones en tiempo real en hardware limitado, manteniendo la calidad de un ViT completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (selector-extractor) |
| Parametros totales | no disponible (arquitectura ViT-B/16 estandar, ~86M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa clips de 16 fotogramas a 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de video) |
| Licencia | MIT |
| Formato de pesos | PyTorch (carga mediante `from_pretrained`) |

## Arquitectura y entrenamiento

LookWhen factoriza el reconocimiento de video en tres aprendizajes: cuando, donde y que computar. Un selector superficial (shallow) recibe un clip reducido al 50% de resolucion y puntua cada parche del video, mientras que un extractor profundo (deep) procesa unicamente los top-K parches seleccionados. El selector se entrena con una supervision basada en unicidad de tokens por distancia top-1, de modo que los parches seleccionados son los mas informativos en espacio y tiempo, ignorando fondos estaticos y redundancia temporal.

El entrenamiento se realizo durante 20 epocas en Kinetics-400 y SSv2, destilando tres fuentes de supervision: el token de video de InternVideo2, y los tokens de fotograma y de parche de DINOv3. El modelo se entrena con una esparsidad variable entre el 70% y el 95%, lo que permite ajustar el coste computacional en inferencia sin re-entrenar. La salida es un embedding de video de 768 dimensiones, identico en forma al de un ViT-B/16 estandar, lo que facilita su integracion en pipelines existentes.

## Capacidades

- Clasificacion de acciones en video (action recognition) sobre Kinetics-400 y SSv2.
- Generacion de embeddings de video de 768 dimensiones compatibles con tareas downstream (recuperacion, clustering, clasificacion lineal).
- Inferencia eficiente con seleccion de tokens: procesa solo el 5-30% de los parches (keep_ratio entre 0.05 y 0.30) manteniendo la calidad del video completo.
- Seleccion adaptativa de tokens en espacio y tiempo: el selector identifica los parches mas unicos, concentrandose en el sujeto y los cambios de movimiento, no en el fondo estatico.
- Rango de esparsidad configurable en inferencia (70-95%) sin re-entrenamiento, permitiendo un trade-off entre precision y latencia.
- No soporta generacion de texto, tool calling ni capacidades multimodales de lenguaje; es un modelo puramente de vision para video.

## Casos de uso

- Vigilancia y analisis de video en tiempo real: el modelo puede procesar multiples streams de camaras en un solo GPU gracias a su esparsidad configurable, seleccionando solo los parches con movimiento relevante y reduciendo la carga computacional en escenarios con fondos estaticos.
- Analisis deportivo automatizado: en clips de deportes donde la accion se concentra en una region pequena del fotograma (p. ej., un buceador o un jugador), el selector concentra el computo en el sujeto y las perturbaciones del agua o el movimiento, permitiendo clasificacion de acciones con latencia reducida.
- Moderacion de contenido en video: clasificacion de clips para detectar contenido inapropiado en plataformas de streaming, donde el coste por minuto de video procesado es critico y la esparsidad del 70-95% reduce significativamente el coste de GPU.
- Recuperacion de video por similitud: el embedding de 768 dimensiones puede indexarse en bases vectoriales para busqueda de clips similares, aprovechando que el modelo predice caracteristicas del video completo aunque solo procese una fraccion de los tokens.
- Despliegue en edge computing: con un checkpoint de 0.6 GB y la capacidad de operar con alta esparsidad, el modelo puede ejecutarse en dispositivos con GPUs de consumo o incluso en inferencia CPU para lotes pequenos, habilitando clasificacion de acciones en camaras inteligentes.
- Investigacion en eficiencia de vision transformers: el framework selector-extractor sirve como base para experimentar con politicas de seleccion de tokens, destilacion de caracteristicas y trade-offs de esparsidad en reconocimiento de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo (arXiv:2605.06809) reporta evaluacion en Kinetics-400 y SSv2, pero los numeros concretos de precision, FLOPs y latencia no estan incluidos en la documentacion proporcionada. Se recomienda consultar el paper y el repositorio de GitHub para obtener las metricas detalladas.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0.6 GB en disco; en FP32 los pesos de un ViT-B/16 requieren aproximadamente 350 MB de VRAM, y en FP16 unos 175 MB. Con la seleccion de tokens, la memoria de activaciones se reduce proporcionalmente a la esparsidad.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas es suficiente para inferencia (p. ej., NVIDIA GTX 1650, RTX 3060, Jetson Orin). Para entrenamiento o fine-tuning se recomienda una GPU con 16-24 GB (RTX 4090, A100).
- Cabe en GPUs de consumo: si, holgadamente. Incluso en una GPU integrada o CPU con suficiente RAM para lotes pequenos.
- Opciones de despliegue: el modelo se carga con `from_pretrained` de PyTorch. No se menciona soporte para vLLM, llama.cpp u Ollama, que son herramientas orientadas a modelos de lenguaje; para video, el despliegue natural es mediante el repositorio oficial de GitHub o un servidor de inferencia PyTorch (TorchServe, FastAPI).
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen de la esparsidad elegida (keep_ratio entre 0.05 y 0.30) y del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LookWhen (este) | ViT-B/16 selector-extractor | ~86M (estandar ViT-B) | 16 fotogramas a 224x224 | MIT | Procesa solo top-K tokens; esparsidad 70-95% configurable |
| InternVideo2 (profesor) | ViT-L/H con atencion temporal | no disponible | no disponible | no disponible | Modelo de referencia usado como profesor de destilacion; mucho mas costoso en inferencia |
| ViT-B/16 estandar (p. ej., VideoMAE) | ViT-B/16 | ~86M | 16 fotogramas a 224x224 | no disponible | Procesa todos los tokens; coste superlineal sin seleccion |

La comparativa directa con numeros de rendimiento no es posible con la informacion disponible. La ventaja principal de LookWhen frente a un ViT estandar es la reduccion del coste computacional mediante seleccion de tokens, manteniendo la misma arquitectura base y formato de salida.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena exclusivamente en Kinetics-400 y SSv2, por lo que su rendimiento puede degradarse en dominios muy diferentes (video medico, imagenes de drones, contenido generado sinteticamente).
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto, pero puede producir clasificaciones erroneas con alta confianza en clips fuera de distribucion.
- Limitaciones de contexto: procesa clips de 16 fotogramas a 224x224; no soporta video de mayor duracion sin segmentacion previa ni resoluciones superiores sin re-escalado.
- Limitaciones de idioma: no aplica, es un modelo de vision puro.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el codigo de entrenamiento y evaluacion depende del repositorio de GitHub, que debe verificarse para confirmar que no incluye dependencias con licencias mas restrictivas.
- Caveat de produccion: el modelo requiere elegir un `keep_ratio` adecuado; valores muy bajos (0.05) reducen la precision, mientras que valores altos (0.30) aumentan el coste. No se proporcionan curvas de trade-off en la documentacion disponible.
- El numero de descargas y likes es 0, lo que sugiere que el modelo es reciente y no ha sido ampliamente validado por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/alisalam/LookWhen
- Paper (arXiv): https://arxiv.org/abs/2605.06809
- PDF del paper: https://arxiv.org/pdf/2605.06809v1
- Repositorio de codigo: https://github.com/alisalamatian1/LookWhen
- Pagina del autor: https://alisalamatian1.github.io/publications/lookwhen/
