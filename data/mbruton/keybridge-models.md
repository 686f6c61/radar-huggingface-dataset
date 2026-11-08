# mbruton/keybridge-models

## Resumen

Keybridge Models es una colección de modelos de descifrado entrenados específicamente para claves de cifrados de sustitución históricos. El repositorio, publicado por el usuario mbruton en Hugging Face, agrupa tres modelos independientes, cada uno asociado a una clave criptográfica histórica concreta: dos variantes de las cartas de Maximiliano II (1575) y el cifrado Copiale. Cada modelo lee texto cifrado transcrito con esa clave y produce un borrador de descifrado, de modo que probar un criptograma contra todos los modelos permite identificar con qué clave conocida fue escrito, si es que lo fue.

El proyecto no es un modelo de lenguaje generativo de propósito general, sino una herramienta especializada de criptoanálisis histórico. Se distribuye con la librería PyTorch y un repositorio de 0,7 GB que incluye los pesos (`_model.pt`), las claves (`_key.tsv`), informes de entrenamiento y un índice `index.json` que las herramientas leen para orquestar las pruebas. Los modelos se entrenaron con 5.000 ejemplos sintéticos generados a partir de un corpus de texto plano en inglés integrado en la herramienta (`HistCiph`), con inserción de unidades raras a una tasa de 0,02.

La relevancia actual del proyecto es de nicho: aporta un flujo reproducible para descifrar documentos cifrados históricos con claves ya conocidas y para contribuir nuevas claves entrenadas mediante los cuadernos del repositorio. La información pública disponible es escasa en cuanto a arquitectura, parámetros y evaluación, por lo que muchos campos de esta ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos en PyTorch; no se detalla la topología) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos `.pt` sin cuantización publicada) |
| Idiomas soportados | no disponibles a nivel de modelo; el texto plano de entrenamiento sintético es inglés (`HistCiph`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de los modelos: no se especifica si se trata de un transformer, una red recurrente, un modelo basado en atención o un clasificador secuencial. Lo que sí se documenta es el esquema de entrenamiento: cada modelo se entrena para una única clave histórica conocida, con 5.000 ejemplos sintéticos generados a partir del corpus de texto plano inglés `HistCiph`, aplicando inserción de unidades raras a una tasa de 0,02. Cada modelo incluye un informe de entrenamiento (`_training_report.txt`) con los ajustes y la precisión obtenida sobre texto sintético, aunque esos valores no se reproducen en la información disponible.

El diseño es modular y orientado a la identificación de claves: el archivo `index.json` lista cada modelo con sus símbolos, formato de transcripción, idioma y fuente, y las herramientas del repositorio lo leen primero para probar un criptograma contra todos los modelos. La transcripción esperada es de símbolos separados por espacios; para ficheros con un carácter por símbolo existe un comando de conversión (`keybridge convert`). No se documentan innovaciones como decodificación especulativa, atención lineal ni fases de RLHF o DPO.

## Capacidades

- Descifrado de borrador de criptogramas históricos escritos con una clave conocida (cartas de Maximiliano II de 1575 y cifrado Copiale).
- Identificación de clave: al probar un criptograma contra todos los modelos de la colección se determina con qué clave conocida fue escrito, si alguna.
- Manejo de cifrados de sustitución homofónica, según las etiquetas del repositorio (`homophonic-cipher`, `substitution-cipher`).
- Lectura de transcripciones con símbolos separados por espacios y conversión desde formatos de un carácter por símbolo.
- Entrenamiento de nuevas claves por parte de terceros mediante los cuadernos del repositorio y envío a `submissions/` para revisión.
- No se documentan capacidades de generación de texto general, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo de pensamiento.

## Casos de uso

- Descifrado de documentos de los fondos DECODE: los modelos `maximilian_II`, `maximilian_1472` y `copiale` permiten obtener un borrador de descifrado de cartas y criptogramas asociados a los identificadores DECODE 1471, 1412, 1407, 1472, 1473 y 2, acelerando la labor del historiador antes de la revisión manual.
- Atribución de clave en archivos históricos: dado un criptograma sin identificar, ejecutarlo contra los tres modelos y observar cuál produce una salida coherente sirve como prueba inicial de qué clave se empleó.
- Investigación en criptografía histórica: el flujo reproducible (índice, claves en TSV, informes de entrenamiento) permite comparar resultados entre claves y documentar metodología en publicaciones.
- Ampliación colaborativa de la colección: un investigador que conozca una nueva clave puede entrenar su modelo con el cuaderno ①, marcar «Share my model» y contribuir a `index.json` tras la revisión.
- Docencia y divulgación: los cuadernos y la herramienta de línea de comandos permiten mostrar a estudiantes cómo se entrena y evalúa un descifrador sobre texto sintético con una clave conocida.
- Preprocesado de corpus cifrados: la conversión de transcripciones de un carácter por símbolo a símbolos separados por espacios (`keybridge convert`) facilita normalizar colecciones digitalizadas antes de aplicar los modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona informes de entrenamiento con precisión sobre texto sintético para cada modelo, pero sus valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,7 GB e incluye pesos, claves e informes de los tres modelos, pero no se desglosa el tamaño de cada uno.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible; no se confirma ni descarta.
- Opciones de despliegue: los pesos son ficheros PyTorch (`.pt`) y se usan mediante los cuadernos o la herramienta de línea de comandos del repositorio de GitHub `keybridge`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de descifrado de cifrados históricos con los que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Cobertura restringida: solo existen modelos para tres claves (dos de Maximiliano II y Copiale); un criptograma escrito con otra clave no será descifrado por esta colección.
- Entrenamiento sintético: los modelos se entrenaron con 5.000 ejemplos generados a partir de texto plano inglés, por lo que el rendimiento sobre documentos reales con ruido, abreviaturas o errores de transcripción puede diferir del reportado en los informes.
- Salida de borrador: la model card describe el resultado como «draft decipherment», es decir, requiere revisión humana; no debe tratarse como descifrado definitivo.
- Idiomas: el texto plano de entrenamiento es inglés; no se documenta soporte para otras lenguas.
- Arquitectura y métricas opacas: no se publican detalles de topología, número de parámetros ni resultados de evaluación en la información disponible, lo que dificulta estimar calidad y coste computacional.
- Citación incompleta: la model card incluye un marcador de posición (`[citation to be added]`) en lugar de la referencia bibliográfica.
- Licencia: CC BY 4.0 permite uso y adaptación para cualquier propósito, incluido el comercial, con atribución; además debe acreditarse la fuente original de cada clave, indicada en el README de cada modelo.
- Repositorio sin tracción: cero descargas y cero «likes» en el momento de la consulta, sin revisión por pares documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mbruton/keybridge-models
- Herramienta y cuadernos (GitHub): https://github.com/mbruton0426/keybridge
