# openbmb/Ultra-FineWeb-classifier

## Resumen

Ultra-FineWeb-Classifier es un clasificador bilingüe de calidad de texto desarrollado por OpenBMB para seleccionar documentos de alta calidad en corpus web a gran escala, tanto en inglés como en chino. Está implementado con fastText, lo que permite una inferencia extremadamente eficiente y de bajo coste, diseñado para procesar volúmenes de datos del orden de billones de tokens. Este modelo es el componente clave del pipeline de filtrado de Ultra-FineWeb, que a partir de los corpora FineWeb y Chinese FineWeb genera el dataset de preentrenamiento Ultra-FineWeb, con aproximadamente 1 billón de tokens en inglés y 120 mil millones en chino.

El clasificador se desarrolla mediante un pipeline de verificación basado en el informe técnico Ultra-FineWeb (arXiv:2505.05427), que introduce una estrategia de evaluación rápida del impacto de los datos en el entrenamiento de LLMs con coste computacional mínimo. Además, se integra dentro del marco L0-L4 de gestión de datos en capas de la plataforma UltraData (arXiv:2602.09003). Su relevancia actual radica en que es el filtro de calidad usado para los datos de preentrenamiento de las series MiniCPM4 y MiniCPM5, demostrando mejoras significativas en tareas de razonamiento y conocimiento general.

El repositorio incluye pesos separados para el clasificador en inglés y en chino, con un tamaño total de 4.2 GB. No se trata de un modelo generativo sino de un clasificador binario que asigna una puntuación de calidad a cada documento, permitiendo filtrar de forma rápida y económica grandes cantidades de texto web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | fastText (modelo de bolsa de n-gramas con embeddings) |
| Parametros totales | no disponible (modelo ligero, tamaño del repo 4.2 GB para ambos idiomas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (fastText no usa contexto secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | binarios de fastText (.bin) |

## Arquitectura y entrenamiento

El modelo se basa en fastText, una arquitectura de clasificacion de texto que utiliza la suma de embeddings de n-gramas del texto y una capa de clasificacion lineal. No es un transformer ni un modelo secuencial; su diseno esta optimizado para la eficiencia computacional, permitiendo procesar millones de documentos por hora en CPU. El entrenamiento se realizo siguiendo el pipeline de verificacion eficiente propuesto en el informe tecnico de Ultra-FineWeb. Este pipeline parte de la hipotesis de que los datos de alta calidad son beneficiosos para el entrenamiento de LLM, y mediante una estrategia de verificacion que evalua rapidamente el impacto de los datos en el entrenamiento, se optimiza la seleccion de muestras positivas y negativas para entrenar el clasificador. Los datos de entrenamiento provienen de la anotacion manual y de la verificacion automatizada sobre corpora web, sin que se hayan publicado detalles especificos sobre el numero de tokens de entrenamiento o la composicion exacta del dataset.

## Capacidades

- Clasificacion binaria de calidad de texto: asigna una puntuacion de calidad a documentos web, determinando si son aptos para preentrenamiento de LLM.
- Bilingue: soporta ingles y chino con pesos separados para cada idioma.
- Alta eficiencia: disenado para procesar corpus a escala de billones de tokens con bajo coste computacional, ejecutable en CPU.
- Integracion con pipelines de filtrado: se usa para producir las etapas L2 del dataset Ultra-FineWeb, combinado con etapas de limpieza basica, deduplicacion y reemplazo de campos sensibles.
- Compatible con el marco UltraData L0-L4: puede integrarse en el sistema de gestion de datos de la plataforma UltraData para la curacion de corpora de preentrenamiento.
- No es generativo ni multimodal: solo realiza clasificacion de texto, no genera contenido.

## Casos de uso

- **Filtrado de corpora web para preentrenamiento de LLM**: el uso principal es aplicar el clasificador a grandes colecciones de texto (como FineWeb y Chinese FineWeb) para retener solo documentos de alta calidad. Se puede ejecutar en paralelo sobre particiones del corpus, obteniendo un dataset filtrado listo para entrenar.
- **Curacion de datasets de dominio especifico**: aunque esta entrenado para calidad general, puede adaptarse como punto de partida para filtrar datos en dominios como noticias, articulos academicos o foros, reduciendo el ruido antes de un ajuste fino especifico.
- **Pipeline de limpieza de datos en produccion**: integrable en sistemas de ingesta de datos web, donde cada documento se pasa por el clasificador y se descarta si su puntuacion es inferior a un umbral. Su velocidad permite procesar millones de documentos por hora en un solo nodo CPU.
- **Evaluacion rapida de calidad de datasets**: se puede usar para medir la proporcion de contenido de alta calidad en un dataset nuevo, dando una estimacion previa al entrenamiento de un LLM.
- **Sistema de recomendacion de contenido**: aunque su objetivo es preentrenamiento, el clasificador puede servir para priorizar contenido de calidad en motores de busqueda o recomendacion de articulos web.
- **Investigacion en curacion de datos**: como herramienta de referencia para comparar metodos de filtrado de datos, ya que su licencia Apache 2.0 permite su uso y modificacion libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos del clasificador (como precision, recall o F1) en la informacion disponible. Sin embargo, el informe tecnico de Ultra-FineWeb (arXiv:2505.05427) valida la efectividad del pipeline completo, mostrando que los modelos de lenguaje entrenados con Ultra-FineWeb (obtenido mediante este clasificador) mejoran significativamente en tareas como MMLU, HellaSwag y otros benchmarks de lenguaje general, en comparacion con modelos entrenados con los datos originales sin filtrar. No se ofrecen numeros concretos en la informacion proporcionada.

## Requisitos de hardware

- **VRAM**: no se requiere GPU; fastText se ejecuta completamente en CPU.
- **CPU**: cualquier CPU moderna con al menos 4 nucleos es suficiente. El modelo es ligero y puede procesar miles de documentos por segundo.
- **RAM**: se necesita RAM suficiente para cargar los binarios del modelo (peso total del repo 4.2 GB, cada modelo individual probablemente menos de 1 GB). Para procesar corpus muy grandes, se recomienda un servidor con multiples nucleos.
- **GPU**: opcional, pero no necesaria. Si se usa GPU, se puede acelerar el procesamiento con librerias como cuDF, aunque no es la via estandar.
- **Despliegue**: se puede usar directamente con la libreria fastText de Python o C++. No hay soporte nativo para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- **Latencia y throughput**: en CPU, fastText puede clasificar cientos de miles de documentos por segundo con una sola maquina, dependiendo del hardware. No se proporcionan cifras exactas en la documentacion.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros clasificadores de calidad de texto para filtrado de corpora web, como los clasificadores de C4 o TextBooks. El informe de Ultra-FineWeb menciona la eficiencia de fastText frente a clasificadores basados en LLM, pero no ofrece una tabla comparativa con alternativas concretas. Por tanto, la comparativa queda no disponible.

## Limitaciones y advertencias

- **Alucinacion**: al ser un clasificador binario, no genera texto, por lo que no sufre alucinacion en el sentido generativo.
- **Sesgos**: el clasificador fue entrenado con datos de la web, por lo que puede heredar sesgos presentes en esos datos, especialmente en terminos de contenido y estilo. La seleccion de muestras positivas y negativas se basa en la hipotesis de que los datos de alta calidad son buenos para el entrenamiento, lo que puede introducir un sesgo hacia contenidos de ciertos dominios (por ejemplo, Wikipedia, articulos cientificos).
- **Idiomas**: solo soporta ingles y chino. No es aplicable a otros idiomas sin entrenamiento adicional.
- **Contexto**: no utiliza contexto secuencial, por lo que documentos que requieren una comprension global del texto pueden no ser evaluados correctamente. Es una limitacion inherente a fastText.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial libre, siempre que se mantenga el aviso de licencia. No hay restricciones conocidas.
- **Produccion**: se debe tener cuidado con el umbral de puntuacion elegido, ya que un umbral muy alto puede descartar documentos utiles y uno muy bajo puede dejar pasar ruido. Se recomienda ajustar el umbral segun el caso de uso.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/openbmb/Ultra-FineWeb-classifier)
- [Informe tecnico Ultra-FineWeb (arXiv:2505.05427)](https://arxiv.org/abs/2505.05427)
- [Informe del marco L0-L4 (arXiv:2602.09003)](https://arxiv.org/abs/2602.09003)
- [Dataset Ultra-FineWeb en HuggingFace](https://huggingface.co/datasets/openbmb/Ultra-FineWeb)
- [Coleccion UltraData en HuggingFace](https://huggingface.co/collections/openbmb/ultradata)
- [Plataforma UltraData](https://ultradata.openbmb.cn/)
- [Modelo en ModelScope](https://www.modelscope.cn/models/OpenBMB/Ultra-FineWeb-classifier)
