# eulogik/pico-type

## Resumen

pico-type es un clasificador de contenido byte-level multi-head desarrollado por eulogik, una empresa centrada en infraestructura de IA para edge computing. Con apenas 1,5 millones de parámetros y un único archivo ONNX de unos 9 MB en FP32, el modelo clasifica cualquier contenido directamente desde los bytes brutos UTF-8, sin necesidad de tokenizador ni preprocesamiento. Esto lo hace especialmente adecuado para entornos con recursos limitados, como dispositivos embebidos, navegadores mediante WebAssembly o sistemas aislados (air-gapped).

El modelo resuelve un problema práctico: identificar automáticamente el tipo de contenido (texto, código, imagen, archivo, etc.), el lenguaje de programación, el idioma natural, el tipo MIME y posibles riesgos (como secretos o binarios) en una sola pasada hacia adelante. Su arquitectura combina embeddings de bytes, convoluciones 1D y atención bidireccional con RoPE, seguida de siete cabezas de clasificación independientes. La versión v2, entrenada con datos reales (The Heap para lenguajes de código y Wikipedia para idiomas), mejora drásticamente la precisión frente a la versión inicial solo sintética, pasando de un 3 % a un 60,3 % en detección de lenguaje de código y de un 19 % a un 98,3 % en detección de idioma.

La relevancia actual de pico-type radica en su enfoque de clasificación de contenido en el borde, con soporte para CLI, API de Python, servidor MCP (Model Context Protocol) y una interfaz Gradio. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en herramientas de desarrollo, análisis de portapapeles o moderación de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteEmbed + 3×Conv1D (k=3,5,7) + 2×BiAttention (RoPE) + Pool + 7 cabezas Matryoshka |
| Parametros totales | 1,43M (tiny) / 1,45M (small) / 1,48M (base) / 1,56M (pro) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada (opera sobre secuencias de bytes; sin límite declarado) |
| Tipos de cuantizacion | No se mencionan cuantizaciones oficiales; exportado en FP32. El repositorio puede incluir versiones adicionales no documentadas |
| Idiomas soportados | Multilingüe (30 idiomas en la cabeza text_lang, 62 lenguajes de programación en code_lang) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP32), también disponible en PyTorch (checkpoints) |

## Arquitectura y entrenamiento

La arquitectura de pico-type es compacta y está diseñada para operar directamente sobre bytes. Cada byte (0–255) se mapea a un vector aprendido de 96 dimensiones mediante una capa ByteEmbed sin lookup table adicional. A continuación, tres convoluciones 1D paralelas con kernels de anchura 3, 5 y 7 procesan la secuencia, cada una con residual y layer norm. Sobre estas representaciones se aplican dos capas de atención bidireccional con embeddings rotatorios (RoPE) y 4 cabezas. Tras un pooling que concatena media, máximo y desviación estándar, siete cabezas lineales independientes producen las clasificaciones. El diseño Matryoshka permite seleccionar la dimensión del pool (16, 64, 192 o 576) según el nivel de precisión deseado, compartiendo el mismo tronco.

El entrenamiento se realizó en dos fases. La versión v0.1 usaba exclusivamente datos sintéticos, lo que daba una precisión muy baja en tareas de lenguaje (3 % en code_lang, 19 % en text_lang). La versión v2 incorporó datos reales: el dataset The Heap (AISE-TUDelft) para 24 lenguajes de programación con 1.200 muestras, y Wikipedia (30 idiomas, 1.500 muestras) para detección de idioma. Esta mejora elevó la precisión a 60,3 % en code_lang y 98,3 % en text_lang. No se menciona el uso de RLHF, DPO ni técnicas de alineación; el entrenamiento es supervisado de clasificación multiclase.

## Capacidades

- Clasificación de contenido en 7 ejes simultáneos: tipo grueso (12 clases), modalidad (8), subtipo (24), lenguaje de código (62), idioma natural (30), tipo MIME (90) y banderas de riesgo (6).
- Operación byte-level sin tokenizador: acepta cualquier entrada UTF-8, incluidos binarios, sin preprocesamiento.
- Cuatro niveles de precisión (Matryoshka): tiny, small, base y pro, con el mismo tronco y diferente dimensión de proyección.
- Inferencia en CPU en tiempos de 6 a 18 ms según la fuente (la model card indica ~18 ms, el repositorio GitHub <6 ms).
- Interfaz CLI, API de Python, servidor MCP (para Claude Desktop, Cursor, etc.) y espacio Gradio.
- Detección de riesgos: identifica secretos, binarios, archivos ejecutables y otros contenidos potencialmente peligrosos.
- Soporte para despliegue en edge: compatible con ONNX Runtime, WebAssembly y dispositivos de bajo consumo como Raspberry Pi.
- Capacidad de clasificar contenido del portapapeles directamente (comando `picotype --clip`).

## Casos de uso

- Análisis de portapapeles en el escritorio: un usuario copia código o texto y pico-type identifica al instante el lenguaje o el tipo de contenido, útil para editores de código o herramientas de captura.
- Moderación de contenido en foros o redes sociales: clasifica mensajes como texto, código, enlaces o binarios, y detecta posibles secretos o contenido arriesgado antes de publicar.
- Clasificación de archivos en sistemas de archivos o servicios de almacenamiento: identifica el tipo MIME y el subtipo (JSON, YAML, HTML, etc.) sin depender de extensiones de archivo.
- Detección de lenguaje de programación en pipelines de CI/CD: analiza fragmentos de código en repositorios para enrutarlos a linters o formateadores específicos.
- Asistentes de IA con MCP: el servidor MCP permite que asistentes como Claude Desktop o Cursor clasifiquen contenido en tiempo real, mejorando el manejo de entradas variadas.
- Clasificación de contenido en dispositivos edge o navegadores: gracias a su tamaño reducido y compatibilidad con WebAssembly, puede ejecutarse en aplicaciones web sin servidor, por ejemplo para filtrar datos pegados en formularios.
- Detección de idioma en sistemas de atención al cliente: identifica el idioma de un mensaje entrante para enrutarlo al agente o al flujo de traducción adecuado.
- Auditoría de seguridad: la cabeza de riesgo puede señalar fragmentos que contienen secretos (API keys, tokens) antes de que se compartan en logs o repositorios.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados de precisión por cabeza:

| Cabeza | Clases | Precisión | Dataset |
|---|---|---|---|
| coarse | 12 | 100 % | Sintético |
| modality | 8 | 100 % | Sintético |
| subtype | 24 | 93,8 % | Sintético |
| code_lang | 62 | 60,3 % | The Heap (24 lenguajes reales, 1.200 muestras) |
| text_lang | 30 | 98,3 % | Wikipedia (30 idiomas, 1.500 muestras) |
| file_mime | 90 | 100 % | Sintético |
| risk (mAP) | 6 | 100 % | Sintético |

La versión v0.1 (solo sintética) obtenía 3 % en code_lang y 19 % en text_lang; la v2 mejora 57 y 79 puntos porcentuales respectivamente.

En cuanto a la precisión por lenguaje de código, los mejores resultados son cpp 96 %, dart 98 %, erlang 98 %, rust 98 %, r 94 %, swift 92 %, python 88 %, lua 88 %. Los peores: javascript 2 %, sql 0 %, clojure 0 %, elixir 0 %, julia 0 %, scala 4 %, haskell 24 %, perl 50 %. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo ONNX FP32 ocupa ~9 MB y ejecuta en ~18 ms en CPU estándar (según model card) o <6 ms (según GitHub). No requiere GPU.
- VRAM: no aplica, ya que no se usa GPU; el consumo de memoria RAM es inferior a 50 MB en tiempo de ejecución.
- GPU recomendadas: ninguna; funciona en CPU, aunque podría acelerarse en GPU si se desea, pero no es necesario.
- Compatibilidad con consumer GPU: no relevante, pero puede ejecutarse en cualquier hardware con soporte ONNX Runtime, incluidas Raspberry Pi y dispositivos móviles.
- Opciones de despliegue: ONNX Runtime, WebAssembly (ONNX Runtime Web), servidor MCP, CLI, API Python, Gradio Space.
- Latencia y throughput: ~18 ms por clasificación en CPU (model card) o <6 ms (GitHub); throughput estimado de 50-150 clasificaciones por segundo en un núcleo moderno.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas con otros clasificadores de contenido byte-level. Como referencia, se pueden considerar alternativas generales:

| Modelo | Parámetros | Enfoque | Precisión code_lang | Licencia |
|---|---|---|---|---|
| pico-type | 1,5M | Byte-level, multi-head | 60,3 % (24 lenguajes) | Apache 2.0 |
| FastText (text classification) | ~1M (típico) | Subword n-gramas | No especializado en código | BSD-3 |
| Language Identification (langid.py) | ~1M | Naive Bayes sobre caracteres | No aplica | BSD-2 |

pico-type se diferencia por su naturaleza multi-head y byte-level, que le permite clasificar simultáneamente tipo, lenguaje, MIME y riesgo sin tokenización. FastText o langid.py son más simples pero no ofrecen la misma versatilidad. No hay datos comparativos de rendimiento publicados.

## Limitaciones y advertencias

- Precisión muy baja en ciertos lenguajes de programación: javascript (2 %), sql (0 %), clojure (0 %), elixir (0 %), julia (0 %), scala (4 %). Esto se debe a la escasez de muestras reales en el entrenamiento; el autor indica que más datos mejorarían estos resultados.
- Los benchmarks de coarse, modality, subtype, file_mime y risk se basan en datos sintéticos, lo que puede no reflejar el rendimiento en datos reales del mundo.
- No se especifica la longitud máxima de contexto; aunque opera sobre bytes, secuencias muy largas podrían degradar el rendimiento o aumentar la latencia.
- El modelo no genera texto ni realiza razonamiento; es exclusivamente un clasificador.
- Riesgo de sesgo en la detección de idioma: aunque la precisión global es alta (98,3 %), podría fallar en dialectos o variantes no representadas en Wikipedia.
- La documentación muestra discrepancias en la velocidad de inferencia (18 ms vs <6 ms); conviene validar en el hardware objetivo.
- El repositorio de HuggingFace ocupa 0,5 GB, aunque el archivo ONNX individual es de ~9 MB; el tamaño adicional probablemente corresponde a checkpoints PyTorch y otros artefactos.
- No hay información sobre cuantizaciones oficiales (INT8, INT4), lo que podría limitar su uso en dispositivos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eulogik/pico-type
- Repositorio GitHub: https://github.com/eulogik/pico-type
- Sitio web del proyecto: https://eulogik.github.io/pico-type/
- Espacio Gradio en HuggingFace: https://huggingface.co/spaces/eulogik/pico-type
- Versión v0.2 en HuggingFace: https://huggingface.co/eulogik/pico-type-v02
- Sitio web de eulogik: https://eulogik.com/
- Paquete PyPI: https://pypi.org/project/pico-type/
- Dataset The Heap: https://huggingface.co/datasets/AISE-TUDelft/the-heap
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
