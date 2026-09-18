# mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF

## Resumen

Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF es la version cuantizada en formato GGUF del modelo 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated, publicada por el usuario mradermacher, especializado en la generacion de cuantizaciones GGUF para llama.cpp y derivados. El modelo base es un ajuste fino "abliterated" (es decir, con los mecanismos de rechazo eliminados o atenuados mediante tecnicas de abliteracion) sobre una arquitectura denominada Ornith 1.5, cuyo nombre sugiere una configuracion de tipo mezcla de expertos con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token; el dato real de parametros en safetensors es de 34.660.610.688.

Este repositorio no contiene pesos originales en safetensors, sino exclusivamente archivos GGUF cuantizados con la variante i1 (basada en matriz de importancia, imatrix), pensados para ejecucion local en CPU y GPU con llama.cpp, Ollama o LM Studio. El autor ofrece un abanico muy amplio de niveles de cuantizacion, desde IQ1_S (7,6 GB) hasta Q5_K_S (24,1 GB), lo que permite desplegar el modelo en hardware muy dispar a costa de degradar la calidad en los niveles mas agresivos.

Se trata de un modelo multimodal (el propio autor lo etiqueta como "vision model", con archivos mmproj alojados en el repositorio estatico hermano), orientado a uso conversacional y solo declarado para ingles. La licencia es MIT tanto en el modelo base como en la cuantizacion, lo que facilita su uso comercial sin restricciones de atribucion mas alla de las habituales de dicha licencia. El repositorio acumula 293 descargas y ningun "like" en la fecha de los datos, lo que lo situa como un artefacto de nicho dentro del ecosistema de modelos abliterated.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (la nomenclatura "35B-A3B" del nombre sugiere mezcla de expertos con 35B totales y 3B activos; no confirmado por el autor) |
| Parametros totales | 34.660.610.688 (~34,66 mil millones, dato real de safetensors) |
| Parametros activos | no disponible (estimacion por nomenclatura: ~3B por token, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S y superiores (listado truncado en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix; existe tambien un repositorio de cuantizaciones estaticas del mismo autor) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura interna del modelo base: no se especifica si se trata de un transformer denso, un transformer con mezcla de expertos (MoE), un modelo hibrido con capas de estado (SSM) u otra variante. El nombre del modelo, Ornith-1.5-35B-A3B, sigue la convencion habitual de los modelos MoE, en la que el primer numero indica los parametros totales y el sufijo "A3B" los parametros activos por token, pero esta interpretacion no aparece confirmada en la model card y debe tratarse como una hipotesis. El dato duro disponible es el recuento de parametros en safetensors, 34.660.610.688.

Tampoco se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o cualquier otro metodo de alineacion, ni innovaciones tecnicas concretas mas alla de la propia abliteracion aplicada al modelo base. La model card del repositorio se limita a describir el proceso de cuantizacion: el autor emplea cuantizacion i1 guiada por matriz de importancia (imatrix), con el archivo imatrix incluido en el repositorio (0,3 GB) para quien quiera generar sus propias cuantizaciones. Las cuantizaciones de tipo IQ suelen ofrecer mejor relacion tamano/calidad que las K-quants de tamano equivalente, segun las notas del propio autor.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como "conversational" y el nombre del modelo apunta a un ajuste orientado a dialogo.
- Procesamiento de vision: el autor indica explicitamente que se trata de un modelo de vision y que los archivos mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas. La cuantizacion i1 de este repositorio no incluye mmproj.
- Multimodalidad potencial: al ser un modelo de vision, cabria esperar entrada de imagenes ademas de texto, aunque la informacion disponible no detalla el alcance de estas capacidades.
- Modo sin rechazos: la etiqueta "abliterated" implica que se han eliminado o reducido los mecanismos de rechazo del modelo original, de modo que responde a peticiones que un modelo alineado convencional rechazaria.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible", orientada al despliegue mediante Hugging Face Inference Endpoints con backend compatible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Audio: no disponible; no se menciona soporte de audio.

## Casos de uso

- Ejecucion local en estaciones de trabajo con GPU de consumo: con las cuantizaciones IQ2_M (11,8 GB) o Q4_K_S (20,0 GB) el modelo puede ejecutarse en una RTX 4090 o en dos GPU de 16 GB, permitiendo asistentes conversacionales privados sin enviar datos a servicios externos.
- Generacion de contenido creativo sin filtros editoriales: la variante abliterated esta pensada para escenarios donde el desarrollador necesita un modelo que no aplique rechazos automaticos, como escritura de ficcion, guiones o narrativa con tematicas sensibles.
- Investigacion sobre alineacion y seguridad: comparar las respuestas de este modelo abliterated frente al modelo base original permite estudiar que comportamientos se pierden o se alteran al eliminar los rechazos, un caso de uso habitual en equipos de investigacion en seguridad de IA.
- Despliegue en servidores sin GPU dedicada: las cuantizaciones de menor tamano (IQ1_S de 7,6 GB, IQ2_XXS de 9,6 GB) permiten inferencia en CPU con llama.cpp, util para entornos de laboratorio o demos de bajo coste.
- Prototipado rapido de aplicaciones conversacionales: gracias al formato GGUF y a la compatibilidad con Ollama y llama.cpp, el modelo puede integrarse en un prototipo en minutos sin necesidad de infraestructura de entrenamiento ni conversion de pesos.
- Procesamiento de imagenes mediante el repositorio estatico: si se necesita la componente de vision, el flujo pasaria por descargar el modelo y el archivo mmproj desde el repositorio de cuantizaciones estaticas y usarlos conjuntamente en llama.cpp.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye veinte y tantos niveles de cuantizacion distintos, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad frente a la reduccion de tamano en un mismo modelo.
- Fine-tuning o destilacion de datos sinteticos: al ser un modelo abliterated de acceso libre bajo MIT, puede emplearse para generar datasets sinteticos en dominios donde otros modelos rechazarian la peticion, con las cautelas legales y eticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni tampoco comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia (tamano del archivo de pesos mas cache KV y sobrecarga del runtime; la longitud de contexto es desconocida, por lo que la cache KV puede variar significativamente):
  - i1-IQ1_S: 7,6 GB de pesos, aproximadamente 9-11 GB en total.
  - i1-IQ2_M: 11,8 GB de pesos, aproximadamente 14-16 GB en total.
  - i1-IQ3_S: 15,4 GB de pesos, aproximadamente 18-20 GB en total.
  - i1-Q4_K_S: 20,0 GB de pesos, aproximadamente 23-25 GB en total.
  - i1-Q4_K_M: 21,3 GB de pesos, aproximadamente 24-27 GB en total.
  - i1-Q5_K_S: 24,1 GB de pesos, aproximadamente 27-30 GB en total.
- GPU recomendadas: para las cuantizaciones de menor tamano, RTX 4080 (16 GB), RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q4_K_M en adelante, conviene disponer de 32 GB o mas, lo que apunta a RTX 5090 (32 GB), A100 40 GB, L40S (48 GB) o H100 (80 GB).
- Cabe en GPU de consumo: si, en las cuantizaciones hasta IQ3_S en tarjetas de 16-24 GB, y hasta Q4_K_M de forma ajustada en tarjetas de 24 GB. Si el modelo es realmente MoE con unos 3B parametros activos, el rendimiento de generacion deberia aproximarse al de un modelo denso de ese tamano siempre que los expertos esten en memoria; si parte de los pesos se descarga a RAM, la velocidad caera de forma notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se proporciona informacion sobre soporte en vLLM o TGI, que en general requieren pesos safetensors y no GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados sobre modelos comparables en la informacion proporcionada. No se han encontrado en la busqueda web resultados relacionados con el modelo, su arquitectura ni sus benchmarks; los resultados obtenidos corresponden a contenido sin relacion (citas del dia). La unica comparativa posible con los datos disponibles es entre las variantes del propio ecosistema del modelo:

| Variante | Formato | Tamano del repositorio | Notas |
|---|---|---|---|
| mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF | GGUF con imatrix (i1) | 370,8 GB (todas las cuantizaciones) | Incluye archivo imatrix de 0,3 GB; no incluye mmproj |
| mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF | GGUF estatico | no disponible | Repositorio hermano; aloja los archivos mmproj para la componente de vision |
| 3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated | safetensors (modelo base) | no disponible | Modelo original sin cuantizar, 34.660.610.688 parametros, licencia MIT |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al derivar de un ajuste abliterated sin documentacion de evaluacion, no hay garantia de que los sesgos del modelo original se hayan mitigado; es razonable esperar que persistan o se amplifiquen en determinados dominios.
- Riesgo de alucinacion: no cuantificado. Las cuantizaciones de baja precision (IQ1, IQ2, Q2_K) degradan de forma significativa la coherencia y aumentan la probabilidad de respuestas incorrectas o incoherentes; el propio autor etiqueta IQ1_S como "for the desperate" y Q2_K_S como "very low quality".
- Limitaciones de idioma: el modelo declara unicamente ingles. El uso en castellano no esta soportado oficialmente y previsiblemente dara resultados de menor calidad.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad real del modelo ni compararlo con alternativas.
- Contenido sin filtros: la abliteracion elimina los rechazos del modelo alineado. Esto implica riesgo de generar contenido ofensivo, ilegal o peligroso sin advertencia, y traslada al desarrollador toda la responsabilidad sobre el filtrado posterior.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No obstante, el usuario debe verificar de forma independiente la procedencia de los datos de entrenamiento del modelo base, ya que la informacion disponible no los detalla.
- Repositorio grande: 370,8 GB de tamano total. Conviene descargar unicamente el archivo de cuantizacion necesario y no clonar el repositorio completo.
- Arquitectura no confirmada: la hipotesis MoE derivada del nombre no esta verificada, por lo que las estimaciones de rendimiento basadas en parametros activos son especulativas.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion (i1-GGUF): https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF
- Repositorio de cuantizaciones estaticas del mismo autor (incluye mmproj, si existe): https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/3MPER0RR/Ornith-1.5-35B-A3B-3MPER0RR-abliterated
- Pagina de resumen y descarga del autor: https://hf.tst.eu/model#Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF
- Archivo imatrix para generar cuantizaciones propias: https://huggingface.co/mradermacher/Ornith-1.5-35B-A3B-3MPER0RR-abliterated-i1-GGUF/resolve/main/Ornith-1.5-35B-A3B-3MPER0RR-abliterated.imatrix.gguf
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
