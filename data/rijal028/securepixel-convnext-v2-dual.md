# rijal028/securepixel-convnext-v2-dual

## Resumen

SecurePixel (identificador `rijal028/securepixel-convnext-v2-dual`) es un clasificador de imagen para forensia digital desarrollado por el usuario rijal028, cuyo objetivo es distinguir fotografias reales de camara (MS COCO, camaras DSLR y moviles) de imagenes generadas por modelos de sintesis modernos como Midjourney v6, SDXL, Stable Diffusion 3 y DALL-E 3. Se publica bajo licencia Apache 2.0, con un repositorio de 0,2 GB y pipeline declarado de `image-classification`.

La propuesta tecnica se apoya en un backbone ConvNeXt V2 en su variante tiny (`convnextv2_tiny.fcmae_ft_in22k_in1k`) y en una entrada de resolucion dinamica nativa, es decir, sin reescalado forzado a 224x224. El autor justifica esta decision indicando que el reescalado destruye el ruido de sensor, que es precisamente una de las senales que permite separar una captura real de una imagen sintetica.

El modelo adopta un esquema de "doble experto": una rama `guardian/` orientada a verificar fotos reales y resistente a la recompresion tipica de redes sociales, y una rama `hunter/` orientada a detectar discontinuidades de textura propias de la generacion sintetica. Es relevante en el contexto actual de verificacion de autenticidad de contenido, moderacion de plataformas y filtrado de datasets, aunque se trata de una publicacion muy reciente, sin descargas ni validacion independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (backbone `convnextv2_tiny.fcmae_ft_in22k_in1k`) con esquema de doble experto (`guardian/` y `hunter/`) |
| Parametros totales | No disponible de forma explicita. La variante tiny de ConvNeXt V2 ronda los 28,6 M de parametros por rama; al existir dos ramas (guardian y hunter), el total podria aproximarse al doble. El autor no publica la cifra |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificacion de imagen). Acepta entrada de resolucion dinamica nativa, sin reescalado forzado a 224x224 |
| Tipos de cuantizacion | No disponible. No se publican versiones cuantizadas (GGUF, ONNX, INT8 ni FP16) |
| Idiomas soportados | Ingles e indonesio segun las etiquetas (`en`, `id`). La model card esta redactada en indonesio. No son idiomas de inferencia, ya que el modelo procesa imagenes |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no especificado en la model card; el repositorio ocupa 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es un clasificador convolucional basado en ConvNeXt V2 tiny, la familia de redes presentada en el trabajo "ConvNeXt V2: Co-designing and Scaling ConvNets with Masked Autoencoders", que combina el diseno tipo ConvNeXt con preentrenamiento mediante masked autoencoders (FCMAE) y una capa de normalizacion global (GRN). Sobre ese backbone, el autor define dos ramas especializadas: `guardian/`, descrita como experta en verificar camaras reales y resistente a la compresion de redes sociales, y `hunter/`, descrita como experta en capturar discontinuidades de textura de IA. La model card no detalla el mecanismo de combinacion o enrutamiento entre ambas ramas (si es un ensemble, un router aprendido o dos cabezas sobre un tronco compartido).

La innovacion que se destaca es el tratamiento de la resolucion: el modelo trabaja con resolucion dinamica nativa en lugar de reescalar a 224x224, con el argumento de preservar el ruido de sensor y las trazas de alta frecuencia que diferencian una fotografia real de una sintesis. En cuanto a los datos, la model card menciona que el sistema se disena para separar fotos reales procedentes de MS COCO, camaras DSLR y telefonos moviles frente a salidas de Midjourney v6, SDXL, Stable Diffusion 3 y DALL-E 3, pero no indica el tamano del conjunto de entrenamiento, su composicion porcentual ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en clasificacion). La unica informacion de entrenamiento publicada es la configuracion de validacion: 5 epocas con una tasa de aprendizaje de 4,0e-6.

## Capacidades

- Clasificacion binaria de imagenes: distingue fotografia real de contenido sintetico generado por IA.
- Verificacion de autenticidad orientada a evitar falsos positivos: la rama `guardian/` esta disenada para no marcar como sinteticas fotografias reales.
- Deteccion de artefactos de sintesis: la rama `hunter/` busca discontinuidades de textura caracteristicas de generadores de difusion.
- Entrada de resolucion dinamica: procesa la imagen a su resolucion nativa, sin el reescalado a 224x224 que el autor considera destructivo para el ruido de sensor.
- Robustez declarada frente a recompresion de redes sociales (JPEG y pipelines de plataformas), segun la descripcion de la rama `guardian/`.
- Cobertura declarada de generadores concretos: Midjourney v6, SDXL, Stable Diffusion 3 y DALL-E 3.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision multimodal descriptiva, tool calling, function calling ni capacidades de agente. Es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en plataformas: integrado como filtro previo en el pipeline de subida de imagenes para marcar posibles sintesis antes de la revision humana, aprovechando su tamano reducido para procesar volumenes altos.
- Verificacion periodistica y fact-checking: comprobar si una imagen virica es una fotografia real o una generacion de IA antes de publicarla, con especial utilidad en la rama `guardian/` para no acusar falsamente a material autentico.
- Peritaje forense digital: uso como herramienta auxiliar en investigaciones que requieran un indicio tecnico sobre el origen de una imagen, dejando la conclusion final a un peritaje humano.
- Filtrado de datasets de entrenamiento: depurar corpus de imagenes recopilados de internet para eliminar contenido sintetico y evitar contaminacion en el entrenamiento de otros modelos.
- Proteccion de marketplaces y clasificados: detectar imagenes de producto generadas o manipuladas con IA en anuncios, reduciendo fraude en comercio electronico.
- Verificacion de identidad y KYC: pre-filtro de selfies o documentos sospechosos de ser sinteticos antes de pasarlos a un sistema de verificacion mas costoso.
- Deteccion de imagenes sinteticas en redes sociales: gracias a la resistencia declarada a la recompresion, puede aplicarse sobre imagenes ya publicadas y recomprimidas por la plataforma.
- Monitorizacion de medios y seguimiento de marca: auditar grandes volumenes de material grafico para estimar la proporcion de contenido generado por IA.

## Benchmarks y rendimiento

La model card unicamente reporta resultados de validacion interna, obtenidos tras 5 epocas con una tasa de aprendizaje de 4,0e-6. No se publican resultados en conjuntos de referencia estandar (MMLU, HumanEval, GSM8K y similares no son aplicables a una tarea de clasificacion de imagen) ni comparaciones cuantitativas con otros detectores.

| Metrica | Resultado | Condicion declarada |
|---|---|---|
| Precision total | 86,7 % | Validacion interna, 5 epocas, LR 4,0e-6 |
| Verificacion de reales (anti falso positivo) | 90,0 % | Validacion interna |
| Tasa de deteccion de IA (AI catch rate) | 83,3 % | Validacion interna |

No se especifica el conjunto de validacion, su tamano, la distribucion de clases ni el protocolo de evaluacion, por lo que estos valores deben interpretarse como una validacion preliminar autodeclarada y no como un resultado replicado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con un backbone ConvNeXt V2 tiny, los pesos en FP32 ocupan del orden de centenares de MB (una sola rama); si el esquema dual implica dos conjuntos de pesos, el total se situaria en el entorno de 0,2 GB, coherente con el tamano del repositorio. La estimacion de VRAM en ejecucion se situa entre 1 y 2 GB con lotes pequenos, y depende de la resolucion de entrada, que al ser dinamica puede elevar el consumo de memoria en imagenes grandes. Estas cifras son estimaciones por arquitectura, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Funciona con tarjetas de consumo como GTX 1650, RTX 3060, RTX 4060 o superiores, y tambien en GPU de datacenter (T4, L4, A10, A100, H100) para despliegues de alto volumen.
- Compatibilidad con hardware de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso puede ejecutarse en CPU. Al ser un modelo convolucional pequeno, tambien es candidato a despliegue en dispositivos edge o moviles tras conversion.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, TorchScript, TensorRT y frameworks de vision como `timm` o `torchvision`. No se han publicado integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje. La model card no documenta ningun procedimiento de carga o inferencia.
- Latencia y throughput estimados: no disponibles de forma oficial. Por el tamano del backbone (decenas de millones de parametros), se espera una latencia del orden de milisegundos por imagen en GPU moderna y decenas de milisegundos en CPU, aunque la resolucion dinamica puede incrementar estos valores. Estas cifras son estimaciones y no han sido publicadas por el autor.

## Comparativa con modelos similares

No se han publicado en la informacion disponible resultados comparativos frente a otros detectores de imagenes sinteticas. La model card no incluye ninguna comparacion con alternativas, y no se dispone de cifras de parametros, contexto ni rendimiento de competidores en el material facilitado.

A modo orientativo, en la literatura cientifica existen otros enfoques de deteccion de imagenes generadas (por ejemplo, CNNDetection, UnivFD o NPR), pero la informacion proporcionada no permite establecer una tabla comparativa fiable frente a SecurePixel, por lo que se indica "no disponible" en lugar de estimar valores.

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecurePixel ConvNeXt V2 Dual | No disponible (~28,6 M por rama, sin confirmar) | No aplica (resolucion dinamica nativa) | 86,7 % en validacion propia | Apache 2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Tasa de deteccion de IA del 83,3 %: aproximadamente una de cada seis imagenes sinteticas podria no ser detectada en el conjunto de validacion declarado.
- Tasa de verificacion de reales del 90,0 %: en torno al 10 % de las fotografias autenticas podrian marcarse como problematicas, lo que implica riesgo de falsos positivos pese a la orientacion anti falso positivo de la rama `guardian/`.
- Validacion preliminar: los resultados declarados corresponden a un entrenamiento de solo 5 epocas, sin especificar el conjunto de validacion, su tamano ni el protocolo, lo que limita la confianza en las cifras.
- Generalizacion desconocida: no hay datos sobre el comportamiento frente a generadores distintos de Midjourney v6, SDXL, Stable Diffusion 3 y DALL-E 3, ni frente a versiones mas recientes.
- Sensibilidad al postprocesado: aunque se declara resistencia a la compresion de redes sociales, no se documentan evaluaciones frente a recorte, rotacion, redimensionado, filtros o edicion parcial de imagenes.
- Sin validacion por terceros: el repositorio presenta 0 descargas y 0 "me gusta", no hay publicacion cientifica asociada ni replicacion independiente de los resultados.
- Ambito limitado a clasificacion: no puede explicar el motivo de su decision ni localizar las regiones manipuladas, ya que no incorpora capacidades de segmentacion ni de vision descriptiva.
- Riesgo de sesgo de dominio: si el entrenamiento se apoyo en MS COCO, camaras DSLR y telefonos, el rendimiento podria degradarse en imagenes de otros dominios (satelite, microscopia, radiologia, documentos escaneados).
- Idiomas: las etiquetas `en` e `id` no implican capacidades linguisticas; la model card solo esta disponible en indonesio, lo que dificulta su adopcion por equipos no familiarizados con ese idioma.
- Licencia Apache 2.0: permite uso comercial y modificacion sin practicamente restricciones, pero no ofrece garantias ni responsabilidad por parte del autor.
- Uso responsable: un detector con estas tasas de error no deberia utilizarse como unica evidencia en decisiones con consecuencias legales, laborales o reputacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rijal028/securepixel-convnext-v2-dual
- Paper de la arquitectura base ConvNeXt V2: https://arxiv.org/abs/2301.00808
- Repositorio oficial de ConvNeXt V2: https://github.com/facebookresearch/ConvNeXt-V2
- Busqueda web realizada: no se han encontrado enlaces adicionales relevantes sobre este modelo. Los resultados devueltos correspondian a sitios de cuestionarios semanales sin relacion con el modelo.
