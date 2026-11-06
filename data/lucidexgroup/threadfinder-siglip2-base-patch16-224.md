# LucidexGroup/threadfinder-siglip2-base-patch16-224

## Resumen

ThreadFinder SigLIP 2 Base (patch 16, 224) es una conversion a Core ML del codificador vision-lenguaje `google/siglip2-base-patch16-224`, publicada por LucidexGroup para su uso dentro de ThreadFinder, una aplicacion de macOS que permite buscar fotos por descripcion en el propio dispositivo. No se trata de un modelo entrenado desde cero ni de un lanzamiento oficial de Google, sino de una reempaquetadura de los pesos originales en el formato `.mlpackage` que consume Core ML, con las dos torres (imagen y texto) separadas en ficheros independientes.

El modelo resuelve el problema de la recuperacion imagen-texto y la clasificacion de imagenes zero-shot sobre hardware Apple: cada torre proyecta su entrada en un embedding unitario de 768 dimensiones y la similitud entre imagen y texto se calcula como el producto escalar de ambos vectores. La conversion esta pensada para ejecucion local, sin dependencia de servicios en la nube, y conserva la licencia Apache-2.0 del modelo base.

Es relevante ahora porque SigLIP 2, publicado en febrero de 2025, mejora sobre SigLIP original en comprension semantica, localizacion y caracteristicas densas, y su disponibilidad en Core ML abre la puerta a busqueda semantica de fotos y clasificacion visual en aplicaciones nativas de macOS y iOS sin coste de inferencia por consulta. El repositorio ocupa 0,4 GB y las dos torres suman unos 378 MB de pesos en cuantizacion `palettized8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dual (torre de imagen ViT + torre de texto), base SigLIP 2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (sin mascara de atencion); imagen de 224x224 px |
| Tipos de cuantizacion | pesos `palettized8` en operaciones linear, matmul y gather; resto en float32; sin GGUF ni otras variantes publicadas |
| Idiomas soportados | no disponible en la model card (el paper de SigLIP 2 describe entrenamiento multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`SigLIP2ImageEncoder.mlpackage`, `SigLIP2TextEncoder.mlpackage`); tamano del repo 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es SigLIP 2 en configuracion base con parches de 16x16 y resolucion de entrada de 224x224, un codificador dual de dos torres: una torre de vision tipo ViT que procesa la imagen y una torre de texto que procesa la descripcion. Ambas proyectan a un espacio comun de 768 dimensiones con embeddings normalizados a longitud unitaria, de modo que la relevancia imagen-texto es directamente el producto escalar. La funcion de perdida original de SigLIP es una variante sigmoide de la contrastiva, que evita la normalizacion global sobre el lote y facilita el entrenamiento a gran escala.

El entrenamiento original corresponde a Google (Tschannen et al., 2025, arXiv:2502.14786), que describe mejoras en comprension semantica, localizacion y caracteristicas densas respecto a SigLIP, ademas de cobertura multilingue. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en el paper original. La innovacion tecnica de esta publicacion concreta es la conversion a Core ML con cuantizacion por paletas de 8 bits en las operaciones lineales, matmul y gather, manteniendo el resto en float32, y una validacion de fidelidad: la conversion solo se acepta si la similitud coseno frente al modelo PyTorch es de al menos 0,99 en cada torre, tanto con todos los compute units de Core ML como solo con CPU. La similitud minima medida entre pares sinteticos no relacionados es 0,010098.

## Capacidades

- Recuperacion imagen-texto: genera embeddings de 768 dimensiones para imagen y texto y permite ordenar una coleccion de fotos por similitud con una descripcion escrita.
- Clasificacion de imagenes zero-shot: comparar la imagen contra un conjunto de etiquetas textuales y elegir la de mayor similitud, sin entrenamiento adicional.
- Busqueda semantica local: inferencia en el dispositivo mediante Core ML, sin llamadas a red.
- Procesamiento de imagen con preprocesado fijo: redimensionado bilineal a 224x224 sin recorte ni preservacion de aspecto, con normalizacion interna (`x / 127.5 - 1`).
- Tokenizacion de texto con SentencePiece de Gemma: minusculas, sin token BOS, maximo 63 piezas, EOS (id 1) y relleno con id 0 hasta 64.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un codificador, no un modelo generativo.
- No incluye capacidades de vision generativa, audio ni modo de razonamiento.

## Casos de uso

- Busqueda de fotos por descripcion en macOS: la aplicacion calcula el embedding de cada foto una vez y lo almacena; en cada consulta solo se codifica el texto y se ordenan los vectores por producto escalar, lo que da busquedas casi instantaneas en local.
- Organizacion automatica de bibliotecas fotograficas: clasificacion zero-shot contra etiquetas predefinidas (paisaje, retrato, comida, documento) para etiquetar o agrupar imagenes sin modelo supervisado.
- Moderacion o filtrado visual en cliente: comparar miniaturas contra descripciones de contenido no deseado y marcar candidatas para revision, manteniendo las imagenes en el dispositivo.
- Accesibilidad: permitir a un usuario describir una foto con lenguaje natural y recuperarla, sin depender de metadatos ni de nombres de fichero.
- Deduplicacion y similitud visual: usar los embeddings de imagen para detectar fotos casi identicas mediante umbral de coseno, util en herramientas de gestion de archivos.
- Prototipado rapido en apps Apple: al ser un `.mlpackage`, se integra en Xcode y se ejecuta en CPU o en el Neural Engine sin infraestructura de servidores, lo que reduce el coste de un piloto.
- Clasificacion de capturas y documentos: etiquetar capturas de pantalla o imagenes escaneadas por tipo de contenido para enrutarlas en un flujo de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de fidelidad de la conversion: coseno minimo de 0,99 frente al modelo PyTorch en cada torre (con todos los compute units y solo CPU) y similitud minima de 0,010098 entre pares sinteticos no relacionados. No hay cifras de MMLU, HumanEval, GSM8K ni de recuperacion (Recall@k) para esta conversion.

## Requisitos de hardware

- VRAM: no aplica en el sentido de GPU discreta; el consumo es de memoria unificada en Apple Silicon. Los pesos suman aproximadamente 378 MB (95,0 MB torre de imagen + 282,9 MB torre de texto) mas las activaciones en float32.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o posterior) puede ejecutar el modelo via Core ML; tambien es ejecutable solo en CPU.
- Cabe en GPU de consumo: si, en cualquier Mac Apple Silicon; no esta pensado para GPU NVIDIA ni para CUDA.
- Opciones de despliegue: Core ML (`coremltools`, Xcode, Vision framework); no hay versiones GGUF, vLLM, llama.cpp, Ollama ni TGI publicadas.
- Latencia y throughput: no disponibles. Al ser un codificador de una sola pasada con 64 tokens de texto y 224x224 de imagen, la carga es baja, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThreadFinder SigLIP 2 Base patch16-224 (esta ficha) | no disponible | 64 tokens de texto; imagen 224x224 | Core ML | Apache-2.0 | Hugging Face, 0 descargas |
| google/siglip2-base-patch16-224 | no disponible | 64 tokens de texto; imagen 224x224 | safetensors (PyTorch) | Apache-2.0 | Hugging Face, modelo base oficial |
| SigLIP original (base patch16-224) | no disponible | 64 tokens de texto; imagen 224x224 | safetensors | Apache-2.0 | Hugging Face |
| CLIP ViT-B/32 | no disponible | 77 tokens de texto; imagen 224x224 | safetensors | MIT (segun publicacion original) | Hugging Face |

La comparativa se limita a lo verificable: el modelo de esta ficha es una conversion del segundo, con el mismo contrato de entrada y salida pero formato Core ML y cuantizacion `palettized8`. No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas; solo embeddings.
- Ventana de texto muy corta (64 tokens, 63 piezas utiles): descripciones largas se truncan y pierden informacion.
- Preprocesado rigido: la imagen debe redimensionarse a 224x224 sin preservar aspecto ni recortar; desviarse de ese contrato degrada la similitud.
- Tokenizacion especifica: minusculas, sin BOS y con relleno a 64; usar otro tokenizador o no aplicar estas reglas invalida los resultados.
- Riesgo de sesgo y alucinacion: como codificador contrastivo, puede asignar similitudes altas a pares incorrectos; la model card fija un suelo de 0,010098 para pares no relacionados, lo que conviene usar como referencia al calibrar umbrales.
- Idiomas: la model card no declara idiomas soportados; el paper original menciona entrenamiento multilingue, pero no se detalla en esta publicacion.
- Licencia Apache-2.0 permite uso comercial, pero el aviso indica que no es un lanzamiento oficial de Google y que el fichero `LICENSE` documenta los cambios realizados; conviene revisarlo antes de redistribuir.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay garantias de soporte.
- Solo para el ecosistema Apple: no hay pesos en safetensors ni GGUF en este repositorio, por lo que no se puede desplegar en servidores Linux con CUDA sin recurrir al modelo base original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucidexGroup/threadfinder-siglip2-base-patch16-224
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Repositorio del modelo base en GitHub (Google Big Vision): https://github.com/google-research/big_vision
- Documentacion de Core ML: https://developer.apple.com/documentation/coreml
