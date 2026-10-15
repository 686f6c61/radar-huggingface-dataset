# ml-resources/sapiens2-normal-1b

## Resumen

Sapiens2-normal-1B es un modelo de visión por computador desarrollado por Meta que realiza estimación de normales de superficie por píxel (vectores unitarios de tres canales en el sistema de coordenadas de la cámara) sobre imágenes centradas en personas. Se trata de un Vision Transformer (ViT) de 1.462 B de parámetros en el backbone, afinado a partir del backbone preentrenado facebook/sapiens2-pretrain-1b. El repositorio analizado, ml-resources/sapiens2-normal-1b, es un espejo no oficial de facebook/sapiens2-normal-1b; la autoría y la licencia corresponden a Meta.

El modelo resuelve una tarea densa de geometría humana: recuperar la orientación de la superficie corporal en cada píxel, lo que resulta útil para reconstrucción 3D, avatares, realidad aumentada y análisis biomecánico. Pertenece a la familia Sapiens2-Surface, que incluye variantes de 0.4 B, 0.8 B, 1 B, 1 B-4K y 5 B de parámetros, todas con la misma formulación de tarea pero distinto coste computacional.

Su relevancia actual radica en que continúa la línea Sapiens de modelos fundacionales centrados en el cuerpo humano, con una resolución de inferencia de 1024 × 768 y un patch size de 16, lo que permite obtener mapas de normales densos de alta calidad a partir de un único fotograma RGB. El checkpoint se distribuye en formato safetensors con un tamaño de repositorio de 6.2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sapiens2 ViT backbone + cabeza de estimacion de normales de superficie |
| Parametros totales | 1.539.334.323 (1.462 B en el backbone) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como en LLM; a 1024x768 con patch 16 genera 3072 tokens de parche |
| Tipos de cuantizacion | no disponible (el autor solo publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Sapiens2 License (license_name: sapiens2-license) |
| Formato de pesos | safetensors (fichero sapiens2_1b_normal.safetensors) |

Datos adicionales de arquitectura: dimension de embedding 1536, 40 capas, 24 cabezas de atencion, patch size 16, resolucion de inferencia 1024 x 768 (alto x ancho), 4.715 T FLOPs en el backbone.

## Arquitectura y entrenamiento

El modelo es un Vision Transformer puro con un backbone Sapiens2 de 40 capas, dimension de embedding 1536 y 24 cabezas de atencion, seguido de una cabeza especifica de estimacion de normales de superficie que produce un mapa denso de vectores unitarios de tres canales en el marco de la camara. El backbone procesa la imagen de entrada a 1024 x 768 con parches de 16 x 16 pixeles, y el checkpoint se obtiene por ajuste fino (finetune) sobre el backbone preentrenado facebook/sapiens2-pretrain-1b. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO, por lo que esos datos no estan disponibles.

La innovacion principal de la familia Sapiens2 es el propio backbone preentrenado a gran escala sobre imagenes humanas, que se reutiliza mediante ajuste fino para distintas tareas densas (entre ellas la estimacion de normales). La model card tampoco documenta innovaciones de inferencia como decodificacion especulativa o atencion lineal; se trata de atencion estandar sobre la cuadricula de parches. El modelo se publica como checkpoint de investigacion con licencia propia (Sapiens2 License) y no como un paquete de inferencia de proposito general.

## Capacidades

- Estimacion de normales de superficie por pixel: genera un mapa de 3 canales con vectores unitarios en el sistema de coordenadas de la camara.
- Procesamiento de imagenes centradas en personas: la tarea objetivo son cuerpos y escenas humanas.
- Vision a resolucion alta: entrada de 1024 x 768 con parches de 16 x 16.
- Salida densa alineada con la imagen de entrada (una prediccion por pixel).
- Variantes de escala dentro de la misma familia (0.4 B, 0.8 B, 1 B, 1 B-4K, 5 B) que permiten intercambiar coste y precision.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni agentes.
- No tiene capacidades multilingues: no procesa texto.
- No dispone de modo de razonamiento explicito (thinking mode), vision multimodal de lenguaje, audio ni generacion de texto.

## Casos de uso

- Reconstruccion 3D de personas: los mapas de normales densos alimentan algoritmos de integracion de superficie o de fotometria estereo para recuperar geometria corporal a partir de un unico fotograma RGB; la resolucion de 1024 x 768 aporta detalle fino en caras y manos.
- Creacion de avatares y dobles digitales: la estimacion de normales por pixel permite texturizar y modelar mallas humanas en pipelines de captura por movimiento sin marcadores.
- Realidad aumentada y probadores virtuales: la orientacion de la superficie del cuerpo mejora el sombreado y la coherencia de iluminacion al superponer prendas virtuales sobre el usuario.
- Analisis biomecanico y medico: la geometria local del cuerpo ayuda a medir curvaturas, posturas y deformaciones superficiales en estudios de rehabilitacion o ergonomia.
- Postprocesado en generacion de imagenes: los mapas de normales sirven como control de profundidad y relighting en pipelines de difusion o de retoque fotografico profesional.
- Entrenamiento de modelos de geometria: el checkpoint puede emplearse como anotador automatico de pseudo-etiquetas de normales sobre grandes corpus de imagenes humanas para tareas posteriores.
- Investigacion en vision centrada en humanos: linea base reproducible y de escala controlada (1 B) para comparar metodos de estimacion de superficie dentro del ecosistema Sapiens2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda consultados no incluyen tablas con metricas (MMLU, HumanEval, GSM8K ni equivalentes de vision como errores angulares medios) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 los pesos ocupan aproximadamente 3.1 GB (1.539 B parametros); en fp32, unos 6.2 GB, coherente con el tamano de repositorio de 6.2 GB. Estas cifras son estimaciones de calculo, no datos publicados por el autor.
- A las cifras de pesos hay que sumar el coste de activaciones a 1024 x 768 con 3072 tokens de parche; se recomienda reservar margen adicional de VRAM para lotes pequenos.
- GPU recomendadas: A100 o H100 para inferencia por lotes y produccion; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual en fp16.
- Si cabe en GPU de consumo: si, en tarjetas con 24 GB o mas como la RTX 4090 o la RTX 3090, siempre que se gestione el tamano de lote; en tarjetas de 12-16 GB la viabilidad depende del lote y de las optimizaciones de memoria.
- Opciones de despliegue: el flujo oficial es el repositorio Sapiens2 (instalacion con `pip install -e .` y script `scripts/demo/normal.sh` del directorio `sapiens/dense`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no aplican a este checkpoint de vision.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs | Embed dim | Capas | Cabezas |
|---|---|---|---|---|---|
| Sapiens2-0.4B | 0.398 B | 1.260 T | 1024 | 24 | 16 |
| Sapiens2-0.8B | 0.818 B | 2.592 T | 1280 | 32 | 16 |
| Sapiens2-1B (este) | 1.462 B | 4.715 T | 1536 | 40 | 24 |
| Sapiens2-1B-4K | 1.607 B | no disponible | 1536 | 40 | 24 |
| Sapiens2-5B | 5.071 B | 15.722 T | 2432 | 56 | 32 |

Las cinco variantes comparten la misma tarea de estimacion de normales y la licencia Sapiens2 License; la diferencia principal es el coste computacional y la capacidad del backbone. No se dispone de datos de rendimiento cuantitativo que permitan ordenarlas por precision, ni de comparaciones con modelos externos de estimacion de normales en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta especializado en imagenes centradas en personas, por lo que su comportamiento en escenas sin figuras humanas o en dominios muy distintos al de entrenamiento no esta documentado.
- Riesgo de alucinacion: en tareas densas de vision la salida es una prediccion por pixel; no hay un mecanismo de abandono, de modo que pueden aparecer normales incoherentes en zonas ocluidas, con reflejos especulares o con texturas ambiguas.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje y no procesa texto; no aplica el concepto de ventana de contexto textual. La resolucion de trabajo documentada es 1024 x 768 y no se detalla el comportamiento en otras resoluciones (salvo la variante 1B-4K).
- Restricciones de licencia: se distribuye bajo la Sapiens2 License, no bajo una licencia de codigo abierto permisiva estandar. Es imprescindible revisar LICENSE.md antes de cualquier uso comercial; la model card indica que la licencia no cambia respecto al lanzamiento oficial.
- Caveat de procedencia: este repositorio es un espejo no oficial mantenido por ml-resources; la fuente autoritativa es facebook/sapiens2-normal-1b. No cuenta con descargas ni likes en el momento de la consulta.
- Uso previsto limitado: la model card restringe el uso a investigacion en vision centrada en humanos y a la tarea de normales, sin garantias para produccion critica.
- No se documentan procesos de mitigacion de sesgos, auditorias de robustez ni evaluaciones de equidad.

## Enlaces

- Repositorio del modelo en HuggingFace (espejo): https://huggingface.co/ml-resources/sapiens2-normal-1b
- Repositorio oficial en HuggingFace: https://huggingface.co/facebook/sapiens2-normal-1b
- Backbone preentrenado: https://huggingface.co/facebook/sapiens2-pretrain-1b
- Variante 1B-4K: https://huggingface.co/facebook/sapiens2-pretrain-1b-4k
- Variante 0.4B: https://huggingface.co/facebook/sapiens2-normal-0.4b
- Variante 0.8B: https://huggingface.co/facebook/sapiens2-normal-0.8b
- Variante 5B: https://huggingface.co/facebook/sapiens2-normal-5b
- Coleccion Sapiens2: https://huggingface.co/collections/facebook/sapiens2
- Paper (arXiv:2604.21681): https://arxiv.org/pdf/2604.21681
- Pagina del proyecto: https://rawalkhirodkar.github.io/sapiens2
- Codigo fuente: https://github.com/facebookresearch/sapiens2
- Guia de estimacion de normales: https://github.com/facebookresearch/sapiens2/blob/main/docs/NORMAL.md
- Licencia: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
