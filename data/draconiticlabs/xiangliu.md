# DraconiticLabs/xiangliu

## Resumen

Xiangliu es un modelo de identificación de idioma (language identification) desarrollado por DraconiticLabs. Se distribuye como un clasificador de texto extremadamente compacto (4,8 MB) que asigna a un fragmento de texto una de 284 etiquetas de idioma codificadas según ISO 639-3. Su propósito es sustituir a herramientas clásicas como `fastText lid.176` o `facebook/fasttext-language-identification` ofreciendo mayor precisión en textos cortos con una huella de disco y memoria mucho menor.

La relevancia del modelo reside en su relación entre tamaño y rendimiento: con 4,8 MB y únicamente NumPy como dependencia en Python, supera a `fastText lid.176.ftz` (0,9 MB) y `lid.176.bin` (131 MB) en las nueve comparaciones publicadas, y queda a la par de GlotLID v4 small (35 MB) en cinco de nueve pruebas. Frente a modelos de más de 1 GB como `facebook/fasttext-language-identification` u OpenLID-v3, cede en siete de nueve comparaciones, pero mantiene cifras competitivas en textos de 50 y 200 caracteres.

El modelo está pensado para entornos con recursos limitados: navegador, dispositivos embebidos, pipelines de preprocesado o clasificación masiva de documentos. Cuenta con implementaciones en Python y JavaScript sin dependencias externas (salvo NumPy en Python), y la licencia MIT permite uso comercial sin las restricciones de licencias como CC BY-NC 4.0 o GPL-3.0 presentes en varios competidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador por hashing de n-gramas de caracteres (1 a 4) con embedding de 131.072 × 32 valores de 8 bits y agregación por media; no es un transformer |
| Parametros totales | 4.356.892 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Lee hasta 100.000 caracteres de entrada; usa como maximo 20.000 caracteres tras normalizacion |
| Tipos de cuantizacion | Pesos en 8 bits (int8) de forma nativa; no se documentan otras cuantizaciones |
| Idiomas soportados | 284 etiquetas ISO 639-3 (incluye 19 lenguas construidas, antiguas, historicas o extintas como latin o klingon) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) y config.json; implementaciones en Python y JavaScript |

## Arquitectura y entrenamiento

Xiangliu no es un transformer. Es un clasificador de texto basado en hashing de n-gramas de caracteres. El texto se pasa a minusculas, se colapsa todo lo que no sean letras o marcas a espacios y se limita a 20.000 caracteres. Cada secuencia de 1 a 4 caracteres se proyecta mediante hashing a dos filas de una tabla de 131.072 × 32 valores de 8 bits. Las filas se promedian y el vector resultante se compara con las representaciones de las 284 etiquetas para producir una prediccion con probabilidad. El modelo devuelve `und` cuando el texto no contiene letras.

El autor no documenta en la model card el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO. La evaluacion se realiza sobre FLORES-200 (texto de test) y WiLI-2018, con particiones a tres longitudes (10, 50 y 200 caracteres). La model card indica que 201 etiquetas se evaluan en benchmarks publicos y las otras 83 sobre texto reservado de sus propias fuentes. La implementacion en Python y la de JavaScript se validan mutuamente mediante `tests/test_parity.py`, que exige respuestas identicas para cada caracter asignado en Unicode 15.0.

## Capacidades

- Identificacion de idioma sobre texto plano, devolviendo codigo ISO 639-3, nombre y probabilidad.
- Prediccion de las k etiquetas mas probables mediante `model.top(texto, k=3)`.
- Restriccion del espacio de etiquetas candidatas con `model.identify(texto, "nld", "eng"])`.
- Manejo de 284 etiquetas, incluidas lenguas minoritarias, historicas y construidas.
- Deteccion de texto sin letras, que devuelve la etiqueta `und`.
- Ejecucion en navegador mediante JavaScript puro (`Xiangliu.fromUrl`), sin dependencias.
- Ejecucion en Node.js cargando `config.json` y `model.safetensors` desde disco.
- Uso desde linea de comandos (`python xiangliu_lid.py "texto"`) y por entrada estandar (pipe de lineas).
- API en Python compatible con `snapshot_download` de `huggingface_hub`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Enrutado de idioma en pipelines de NLP: antes de aplicar un modelo de traduccion, resumen o analisis de sentimiento, Xiangliu clasifica el fragmento en milisegundos y permite seleccionar el modelo o el tokenizador adecuado por idioma.
- Clasificacion masiva de documentos y registros: al ocupar 4,8 MB y depender solo de NumPy, se puede ejecutar en paralelo sobre millones de filas en un cluster sin cargar modelos de cientos de MB en memoria por worker.
- Deteccion de idioma en el navegador: la implementacion JavaScript permite clasificar texto de formularios o contenido pegado por el usuario sin enviar datos a un servidor, util para cumplimiento de privacidad y para aplicaciones offline.
- Preprocesado en dispositivos embebidos o edge: el tamano reducido y la naturaleza int8 del modelo permiten integrarlo en dispositivos con poca RAM o en contenedores ligeros donde fastText o GlotLID no caben.
- Filtrado y deduplicacion de corpus multilingues: durante la construccion de datasets, Xiangliu etiqueta cada documento para separar por idioma, descartar contenido mal etiquetado o equilibrar la mezcla linguistica.
- Moderacion y analisis de contenido generado por usuarios: identificar el idioma de comentarios o mensajes cortos para aplicar reglas de moderacion especificas por region o idioma.
- Investigacion linguistica y catalogacion: con 284 etiquetas que incluyen lenguas minoritarias e historicas, sirve para etiquetar muestras en estudios comparativos o archivos documentales.

## Benchmarks y rendimiento

Macro F1 sobre texto de test de FLORES-200, sobre los 106 idiomas presentes en todos los modelos comparados:

| Modelo | Tamano | Etiquetas | 10 caracteres | 50 caracteres | 200 caracteres | Licencia |
|---|---|---|---|---|---|---|
| Xiangliu 1.0 | 4,8 MB | 284 | 0,738 | 0,944 | 0,977 | MIT |
| fastText `lid.176.ftz` | 0,9 MB | 176 | 0,535 | 0,791 | 0,877 | CC BY-SA 3.0 |
| fastText `lid.176.bin` | 131 MB | 176 | 0,581 | 0,837 | 0,907 | CC BY-SA 3.0 |
| GlotLID v4 small `.ftz` | 35 MB | 2.060 | 0,659 | 0,930 | 0,979 | Apache 2.0 con avisos |
| GlotLID v4 | 783 MB | 2.060 | 0,763 | 0,970 | 0,987 | Apache 2.0 con avisos |
| `facebook/fasttext-language-identification` | 1.176 MB | 218 | 0,715 | 0,970 | 0,986 | CC BY-NC 4.0 |
| OpenLID-v3 | 1.233 MB | 195 | 0,716 | 0,970 | 0,987 | GPL-3.0 |

Recuento de comparaciones (nueve en total, tres tablas a tres longitudes cada una; una diferencia de 0,001 o menos cuenta como empate):

| Competidor | Por delante | Por detras |
|---|---|---|
| fastText `lid.176.ftz` | 9 | 0 |
| fastText `lid.176.bin` | 9 | 0 |
| GlotLID v4 small `.ftz` | 5 | 4 |
| GlotLID v4 | 0 | 9 |
| `facebook/fasttext-language-identification` | 2 | 7 |
| OpenLID-v3 | 2 | 7 |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo cabe en CPU y en memoria RAM convencional. El archivo de pesos ocupa 4,8 MB.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en cualquier CPU moderna, incluidos entornos de contenedor sin aceleracion.
- Cabe en GPU consumer: si, en cualquier GPU consumer e incluso en entornos sin GPU; el cuello de botella es la CPU y el ancho de banda de memoria, no la VRAM.
- Opciones de despliegue: Python con NumPy (`xiangliu_lid.py`), JavaScript en navegador o Node.js (`xiangliu.js`), linea de comandos con entrada por pipe, e integracion en pipelines propios mediante `snapshot_download` de `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El modelo procesa hasta 20.000 caracteres utiles por llamada tras normalizacion, pero no se publican cifras de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Etiquetas | Macro F1 (200 car.) | Licencia | Dependencias |
|---|---|---|---|---|---|
| Xiangliu 1.0 | 4,8 MB / 4,36 M | 284 | 0,977 | MIT | NumPy (Python) o ninguna (JS) |
| fastText `lid.176.bin` | 131 MB | 176 | 0,907 | CC BY-SA 3.0 | fastText |
| GlotLID v4 small `.ftz` | 35 MB | 2.060 | 0,979 | Apache 2.0 con avisos | fastText |
| `facebook/fasttext-language-identification` | 1.176 MB | 218 | 0,986 | CC BY-NC 4.0 (no comercial) | fastText |

Xiangliu se situa como la opcion mas ligera del grupo con licencia permisiva. Frente a fastText `lid.176.bin` gana en las nueve comparaciones con un archivo 27 veces menor. Frente a GlotLID v4 small queda practicamente empatado en textos de 200 caracteres (0,977 frente a 0,979) y por delante en cinco de nueve pruebas, aunque GlotLID cubre muchas mas etiquetas (2.060 frente a 284). Frente a `facebook/fasttext-language-identification`, Xiangliu pierde en siete de nueve comparaciones, pero este ultimo tiene licencia CC BY-NC 4.0, lo que restringe el uso comercial.

## Limitaciones y advertencias

- Cobertura incompleta: no dispone de etiqueta para algunos idiomas esperables, como haitiano, tayiko, sindhi, bosnio y chino wu. En esos casos el modelo devolvera la etiqueta mas cercana o `und`, sin garantia de correccion.
- Etiquetas poco validadas: 83 de las 284 etiquetas no se evaluan en benchmarks publicos, sino sobre texto reservado de sus propias fuentes, por lo que su rendimiento en dominios externos es menos predecible.
- Textos muy cortos: con 10 caracteres el Macro F1 cae a 0,738, por debajo de GlotLID v4 (0,763) y de `facebook/fasttext-language-identification` (0,715 en esa columna). Para fragmentos de una o dos palabras la fiabilidad es limitada.
- Normalizacion agresiva: el texto se pasa a minusculas y se colapsa todo lo que no sean letras o marcas, lo que puede degradar la distincion entre idiomas que dependen de mayusculas, digitos o puntuacion.
- No es un modelo generativo: no produce texto, no razona, no ejecuta codigo ni soporta tool calling. Cualquier expectativa en ese sentido queda fuera de su alcance.
- Riesgo de confusion entre lenguas cercanas: la model card no documenta tasas de confusion por par de idiomas, pero el diseno por n-gramas de caracteres tiende a confundir variedades muy proximas (por ejemplo, lenguas eslavas o romance).
- Sesgos: no se documenta en la informacion disponible un analisis de sesgos por origen, dominio o variedad dialectal. La evaluacion se limita a FLORES-200 y WiLI-2018.
- Licencia: MIT permite uso comercial y modificacion sin restricciones, pero conviene conservar el aviso de copyright. Las implementaciones en Python y JavaScript se distribuyen junto al modelo y deben verificarse en la revision `v1.0.0` para reproducir los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DraconiticLabs/xiangliu
- Demo en navegador (Hugging Face Spaces): https://huggingface.co/spaces/DraconiticLabs/xiangliu-demo
- Repositorio de referencia de fastText `lid.176`: https://fasttext.cc/docs/en/language-identification.html (citado como comparador en la model card)
- GlotLID v4 (comparador): https://huggingface.co/cis-lmu/glotlid (referencia de la comparativa)
- `facebook/fasttext-language-identification` (comparador): https://huggingface.co/facebook/fasttext-language-identification
- OpenLID-v3 (comparador): https://huggingface.co/datasets/laurievb/OpenLID (referencia de la comparativa)
- FLORES-200 (conjunto de evaluacion): https://huggingface.co/datasets/facebook/flores
- WiLI-2018 (conjunto de evaluacion): https://zenodo.org/record/841984
