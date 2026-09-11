# mradermacher/logi-1.5b-GGUF

## Resumen

logi-1.5b-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo guiiwfz/logi-1.5b, un modelo de lenguaje de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) afinado en portugues con QLoRA y Unsloth sobre un dataset propio. El modelo original esta orientado a dos areas concretas: la logica proposicional y la alfabetizacion en inteligencia artificial, y viene etiquetado con los identificadores `logi`, `decifra-ia`, `logica-proposicional` y `alfabetizacao-ia`. El repositorio que nos ocupa no entrena el modelo, sino que lo publica en distintos niveles de cuantizacion para que pueda ejecutarse en hardware de consumo.

La relevancia de esta publicacion es practica: al tratarse de un modelo de 1,5B con licencia Apache 2.0, es candidato a desplegarse en local, en un portatil o incluso en un servidor modesto, cubriendo tareas educativas de logica formal en portugues sin depender de APIs externas. Las cuantizaciones disponibles van desde f16 (3,2 GB) hasta Q2_K (0,8 GB), lo que permite ajustar el equilibrio entre calidad y memoria.

La principal limitacion a la hora de evaluarlo es la ausencia de informacion tecnica: no se documentan la arquitectura base, la longitud de contexto, la composicion del dataset ni resultados de benchmarks. El modelo cuenta ademas con 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion comunitaria publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: guiiwfz/logi-1.5b; se infiere transformer denso por el tamano y el metodo de entrenamiento, sin confirmacion del autor) |
| Parametros totales | 1.543.714.304 (segun safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16 (16 bpw), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 14,2 GB (suma de todas las cuantizaciones) |
| Metodo de ajuste | QLoRA con Unsloth |
| Dataset | custom (no especificado) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura del modelo base guiiwfz/logi-1.5b en la documentacion proporcionada. Por el recuento de parametros (1,54B) y por el uso de QLoRA con Unsloth, el escenario mas probable es un transformer denso de tipo decoder-only, pero el autor no lo confirma en la model card ni los tags aportan detalle adicional (`transformers`, `conversational`).

Respecto al entrenamiento, la unica informacion disponible indica que se realizo un ajuste fino con QLoRA (cuantizacion de 4 bits durante el entrenamiento) apoyado en la libreria Unsloth, sobre un dataset de composicion no publicada y marcado como `custom`. No hay datos sobre el numero de tokens de entrenamiento, la mezcla del corpus, la existencia de fases de RLHF, DPO o cualquier otra tecnica de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio GGUF es obra de mradermacher, que realiza cuantizaciones estaticas (no ponderadas ni con matriz de importancia) de los pesos originales.

## Capacidades

- Generacion de texto conversacional en portugues, segun el tag `conversational` del repositorio.
- Razonamiento sobre logica proposicional, area declarada explicitamente en los tags (`logica-proposicional`).
- Contenido orientado a alfabetizacion en IA (`alfabetizacao-ia`), es decir, explicacion de conceptos basicos de inteligencia artificial.
- Uso educativo, segun el tag `education`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no; el modelo esta etiquetado unicamente como portugues (`pt`).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Ensenanza de logica proposicional en portugues: el modelo puede explicar tablas de verdad, validar razonamientos o generar ejercicios de deduccion, que es la tarea declarada en sus tags.
- Alfabetizacion en IA para publico no tecnico: generar explicaciones introductorias sobre conceptos de machine learning en portugues, integrandose en plataformas educativas o chats de apoyo al estudiante.
- Asistente conversacional en portugues en local: al ocupar entre 0,8 y 3,2 GB segun cuantizacion, puede desplegarse en un portatil sin GPU dedicada y operar sin conexion.
- Prototipado rapido de aplicaciones educativas: con Q4_K_M (1,1 GB) es viable arrancar un servidor de inferencia en un contenedor pequeno para validar una idea de producto antes de invertir en un modelo mayor.
- Generacion de material didactico: produccion de enunciados de ejercicios, ejemplos y correcciones en portugues para cursos de logica o de introduccion a la IA.
- Investigacion sobre ajuste fino eficiente: el modelo sirve como caso de estudio de un pipeline QLoRA + Unsloth sobre un corpus pequeno y especializado, util para comparar estrategias de cuantizacion.
- Evaluacion de cuantizaciones: comparar Q2_K frente a Q8_0 o f16 sobre las mismas consultas de logica permite medir la degradacion introducida por la cuantizacion en un dominio acotado.
- Filtrado o clasificacion de enunciados logicos: tareas de etiquetado de formulas, deteccion de falacias o normalizacion de expresiones, dentro de un pipeline mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los tags incluyen puntuaciones de MMLU, GSM8K, HumanEval ni de cualquier otra evaluacion estandar, y no existe validacion comunitaria (0 descargas, 0 likes) que permita contrastar cifras. Tampoco se dispone de resultados especificos para tareas de logica proposicional en portugues.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto segun la cuantizacion): Q2_K ~1,5 GB; Q4_K_S / Q4_K_M ~1,8-2 GB; Q6_K ~2,2 GB; Q8_0 ~2,5 GB; f16 ~4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM. Una RTX 3060 (12 GB), una RTX 4060 (8 GB) o una RTX 4090 (24 GB) sobran ampliamente; la RTX 4090 solo tendria sentido para servir muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPU con memoria unificada compartida.
- Ejecucion en CPU: viable con Q4_K_M o inferiores mediante llama.cpp; el modelo completo en f16 requiere unos 4 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llamafile, text-generation-webui y otros clientes compatibles con GGUF. Para vLLM o TGI seria preferible partir del modelo base en safetensors (guiiwfz/logi-1.5b).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| logi-1.5b-GGUF | 1,54B | no disponible | Apache 2.0 | pt | GGUF |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | multilingue (incluye pt) | safetensors, GGUF |
| Llama 3.2 1B | 1,24B | 128.000 tokens | Llama 3.2 Community License | multilingue | safetensors, GGUF |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma Terms of Use | multilingue | safetensors, GGUF |

Nota: los datos de Qwen2.5-1.5B, Llama 3.2 1B y Gemma 2 2B corresponden a especificaciones publicas de sus respectivos autores y se incluyen unicamente como referencia de categoria. No se dispone de comparaciones de rendimiento entre logi-1.5b y estos modelos, por lo que la eleccion entre ellos debe basarse en la especializacion en logica y portugues del primero frente a la mayor cobertura multilingue y de contexto de los alternativos. Las cifras de parametros de logi-1.5b coinciden exactamente con las de Qwen2.5-1.5B, lo que sugiere una posible relacion de derivacion, pero el autor no la confirma y por tanto no debe asumirse.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de ajuste, por lo que no es posible evaluar sesgos de genero, culturales o ideologicos.
- Riesgo de alucinacion: elevado en un modelo de 1,5B parametros. En dominios fuera de la logica proposicional y la alfabetizacion en IA puede producir afirmaciones plausibles pero incorrectas, especialmente al usar cuantizaciones agresivas como Q2_K o Q3_K_S.
- Degradacion por cuantizacion: las variantes Q2_K (0,8 GB) y Q3_K_S (0,9 GB) reducen notablemente la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Limitacion idiomatica: el modelo esta etiquetado exclusivamente como portugues. Su comportamiento en castellano, catalan, gallego o ingles no esta documentado y no deberia asumirse.
- Limitacion de contexto: se desconoce la ventana de contexto, lo que impide planificar conversaciones largas o tareas de resumen sobre documentos extensos con garantias.
- Alcance funcional: no se confirma soporte de tool calling, function calling ni razonamiento multi-paso, capacidades poco habituales en modelos de este tamano y no declaradas en los tags.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia, siempre que se cumplan las condiciones del modelo base guiiwfz/logi-1.5b. Conviene verificar la licencia del modelo base por si impone condiciones adicionales.
- Madurez del proyecto: 0 descargas y 0 likes, sin issues ni discusiones publicas. No existe evidencia de uso en produccion ni de validacion independiente.
- Incoherencia en las fechas: el repositorio figura creado el 11 de septiembre de 2026, fecha posterior a la actual, lo que probablemente refleja un error de metadatos en HuggingFace y conviene tener en cuenta al citarlo.
- Cuantizaciones ponderadas no disponibles: el autor indica que no ha publicado cuantizaciones ponderadas ni con matriz de importancia, y sugiere solicitarlas en un hilo de discusion si se necesitan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/logi-1.5b-GGUF
- Modelo base: https://huggingface.co/guiiwfz/logi-1.5b
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#logi-1.5b-GGUF
- Solicitudes de cuantizacion y FAQ de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa responsable de la cuantizacion: https://www.nethype.de/

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre logi-1.5b ni sobre su modelo base; los unicos enlaces utiles son los procedentes de la propia model card.
