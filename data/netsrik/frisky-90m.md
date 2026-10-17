# netsrik/frisky-90m

## Resumen

Frisky 90M es un modelo de lenguaje de 90.128.896 parametros entrenado desde cero por el desarrollador independiente netsrik (usuario de HuggingFace) utilizando DeepJ, un framework de entrenamiento e inferencia escrito en Java que se ejecuta sobre GPU de Apple (Metal). El modelo ha completado tres fases: preentrenamiento base, mid-training y un ajuste fino de instrucciones del tipo *response-only*, lo que lo situa como un pequeno asistente conversacional mas que como un modelo base puro.

Su interes no reside en el rendimiento absoluto, sino en la combinacion de tres factores: es un modelo de escala muy reducida (compatible con hardware de consumo e incluso con entornos de borde), emplea una arquitectura propia denominada DeepJ Prism Transformer con atencion Q/KV de bajo rango, y todo su ciclo de vida (tokenizador, checkpoint y runtime) gira en torno al ecosistema DeepJ, no al de HuggingFace Transformers. El checkpoint se distribuye en un formato binario propietario (`model.dj`) que no es cargable directamente con la libreria Python de Transformers.

Con 10 capas, tamano oculto de 768, 12 cabezas de atencion y un vocabulario de 16.384 tokens, Frisky se posiciona como una pieza experimental y didactica: sirve para estudiar arquitecturas de atencion de bajo rango, para validar el tooling de DeepJ y para prototipar en Java, pero el propio autor advierte que su calidad tras el post-entrenamiento no ha sido establecida mediante benchmarks rigurosos. La longitud de contexto no se especifica en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepJ Prism Transformer (transformer decoder con atencion Q/KV de bajo rango, RoPE, RMSNorm y SwiGLU) |
| Parametros totales | 90.128.896 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye un unico checkpoint en formato propietario) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (aplicada a los pesos del modelo, no a los datasets de origen) |
| Formato de pesos | `model.dj` (formato binario versionado de DeepJ); tokenizador en `tokenizer.bpe`. No compatible con safetensors, GGUF ni con la libreria Python Transformers |
| Capas | 10 |
| Tamano oculto | 768 |
| Cabezas de atencion | 12 |
| Rango Q | 384 |
| Rango KV | 192 |
| Vocabulario | 16.384 tokens |
| Tamano del repositorio | 0,4 GB |
| Libreria de inferencia | DeepJ 0.9.5-alpha o superior (Java, JDK 20+) |

## Arquitectura y entrenamiento

Frisky emplea la arquitectura DeepJ Prism Transformer, una variante de transformer decoder que sustituye la atencion completa por una atencion Q/KV de bajo rango: las proyecciones de consulta se factorizan a rango 384 y las de clave/valor a rango 192, lo que reduce el coste de las matrices de atencion manteniendo 12 cabezas sobre un espacio oculto de 768. La normalizacion se realiza con RMSNorm, la no linealidad del bloque feed-forward es SwiGLU y las posiciones se codifican mediante embeddings rotatorios (RoPE). Una caracteristica destacable de implementacion es que el modelo recalcula el contexto completo para cada token generado, es decir, no utiliza una cache KV persistente: esto simplifica el runtime pero implica que el coste por token crece con la longitud de la secuencia.

El entrenamiento se desarrollo en tres etapas. El preentrenamiento base utilizo FineWeb-Edu; el mid-training y el ajuste fino de instrucciones emplearon mezclas derivadas de SmolTalk, MMLU, GSM8K y ARC. El ajuste final es de tipo *response-only*, lo que significa que la perdida se calcula unicamente sobre los tokens de la respuesta del asistente. Todo el proceso se ejecuto sobre GPU de Apple, lo que refuerza el caracter experimental del proyecto: no hay constancia en la informacion disponible de tecnicas de RLHF, DPO ni de decodificacion especulativa.

## Capacidades

- Generacion de texto en ingles: es la funcion principal del modelo, con formato de prompt conversacional aplicado automaticamente por el runtime de DeepJ.
- Respuesta a instrucciones: el ajuste *response-only* le permite mantener dialogos de un turno o varios, aunque sin garantias de calidad verificada.
- Razonamiento basico y matematicas elementales: expuesto a GSM8K y MMLU durante el mid-training, lo que le otorga cierta familiaridad con problemas escolares y de opcion multiple, siempre a escala de un modelo de 90M.
- Generacion de codigo elemental: contemplada en el material de entrenamiento (SmolTalk incluye ejemplos de codigo), aunque el autor advierte explicitamente de que puede producir codigo incorrecto.
- Capacidades multilingues: no, el modelo esta etiquetado unicamente para ingles.
- Tool calling / function calling: no disponible; no se menciona soporte alguno en la informacion proporcionada.
- Uso como agente y razonamiento multi-paso: no disponible; no hay indicios de entrenamiento especifico para agentes.
- Modo *thinking* explicito, vision o audio: no disponible.
- Integracion con el ecosistema Java: es la capacidad diferencial real, ya que el modelo se consume mediante la API `DeepJChat` y puede ejecutarse con la interfaz de chat de escritorio incluida en el repositorio de DeepJ.

## Casos de uso

- Prototipado de aplicaciones Java con IA generativa: cualquier equipo que trabaje en JVM puede integrar Frisky mediante la dependencia Maven `io.github.kirstenali:deepj` y la clase `DeepJChat`, sin necesidad de montar un servidor Python ni de convertir pesos a otros formatos.
- Entorno de aprendizaje de arquitecturas transformer: al ser un modelo de 10 capas y 90M de parametros con codigo de runtime disponible, resulta adecuado para inspeccionar como funciona la atencion de bajo rango sobre Q y KV y comparar su comportamiento con atencion completa.
- Desarrollo y prueba del propio framework DeepJ: sirve como modelo de referencia para validar cambios en el formato `model.dj`, en el tokenizador BPE versionado o en la interfaz de chat de escritorio.
- Aplicaciones de borde y entornos con recursos muy limitados: con un repositorio de 0,4 GB, el modelo es candidato para demos locales en portatiles, mini-PC o dispositivos con GPU integrada, siempre que se acepte su calidad limitada.
- Pruebas de integracion y CI de pipelines de generacion de texto: por su tamano reducido y su licencia MIT, puede actuar como modelo de humo en *test suites* que verifiquen el cableado de un sistema mayor antes de sustituirlo por un modelo de produccion.
- Generacion de respuestas cortas en ingles para tareas de bajo riesgo: por ejemplo, autocompletado de campos, generacion de textos de relleno en maquetas o asistentes internos no criticos, siempre con supervision humana.
- Ejercicios docentes sobre ajuste de instrucciones: las tres fases documentadas (preentrenamiento, mid-training y SFT *response-only*) constituyen un caso de estudio reproducible para cursos de aprendizaje automatico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad del post-entrenamiento "todavia no ha sido establecida mediante un benchmark riguroso", por lo que no se dispone de cifras de MMLU, GSM8K, ARC, HumanEval ni de ninguna otra evaluacion comparable, pese a que MMLU, GSM8K y ARC se utilizaron como fuentes de datos de entrenamiento y no como conjuntos de evaluacion reportados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 360 MB en precision FP32, 180 MB en FP16/BF16 y en torno a 90 MB en cuantizacion de 8 bits. Son calculos derivados del numero de parametros, ya que el repositorio no distribuye variantes cuantizadas.
- GPU recomendadas: el modelo fue entrenado en GPU de Apple, por lo que el camino nativo es Apple Silicon (familia M). Cualquier GPU NVIDIA o AMD con soporte del runtime Java correspondiente deberia ser suficiente dado el tamano, pero no hay confirmacion en la informacion disponible.
- GPU de consumo: si, cabe con enorme holgura en cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) e incluso en muchas GPU integradas. El cuello de botella no es la memoria sino el soporte del formato `model.dj`.
- Opciones de despliegue: DeepJ 0.9.5-alpha o superior mediante Maven, con API `DeepJChat.load(...)` o con la interfaz de chat de escritorio (JDK 20+ y JavaFX). No se puede desplegar con vLLM, llama.cpp, Ollama, TGI ni con la libreria Python Transformers, ya que el formato de checkpoint es propietario y el autor lo declara incompatible con Transformers.
- Latencia y throughput: no disponible. Cabe senalar que, al recalcular el contexto completo en cada token generado y no usar cache KV, la latencia por token aumenta con la longitud de la secuencia, por lo que el rendimiento decae en generaciones largas.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas tecnicas y de licencia; no incluye rendimiento porque Frisky no tiene benchmarks publicados. Los datos de los modelos alternativos corresponden a su documentacion publica.

| Modelo | Parametros | Contexto | Licencia | Formato / ecosistema | Benchmarks publicados |
|---|---|---|---|---|---|
| Frisky 90M | 90.128.896 | No disponible | MIT (pesos) | `model.dj` propietario, runtime Java (DeepJ) | No disponibles |
| SmolLM2-135M-Instruct | 135 millones | 8.192 tokens | Apache 2.0 | safetensors, transformers, GGUF | Si (reportados por su autoria) |
| Pythia-70M | 70 millones | 2.048 tokens | Apache 2.0 | safetensors, transformers | Si (evaluaciones del Pythia suite) |
| GPT-2 small | 124 millones | 1.024 tokens | MIT | safetensors y formatos convertidos, transformers | Si (evaluaciones historicas) |

La diferencia fundamental no es de tamano sino de interoperabilidad: las tres alternativas se integran con el ecosistema Python estandar y disponen de cuantizaciones GGUF para llama.cpp u Ollama, mientras que Frisky exige el runtime Java de DeepJ. A cambio, Frisky ofrece un stack homogeneo en JVM que ninguno de los otros proporciona de forma nativa.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe explicitamente como un modelo pequeno y experimental, no apto para decisiones de consecuencias relevantes.
- Calidad no verificada: no existe ninguna evaluacion rigurosa publicada de su post-entrenamiento, por lo que no se puede afirmar ni negar su competencia en tareas concretas.
- Alucinacion: la model card advierte de que puede inventar hechos, repetirse y cometer errores de razonamiento.
- Codigo incorrecto: puede generar codigo que no compila o que hace algo distinto de lo esperado; no debe usarse sin revision humana en produccion.
- Idiomas: solo ingles. No hay soporte declarado para castellano ni para otras lenguas, por lo que su uso en espanol producira resultados poco fiables.
- Contexto: la longitud de contexto no esta documentada. Ademas, al recalcular el contexto completo por token, las secuencias largas degradan la latencia de forma notable.
- Licencia y datos: la licencia MIT cubre los pesos del modelo, pero no los datasets de origen (FineWeb-Edu, SmolTalk, MMLU, GSM8K, ARC). Cualquier uso comercial debe revisar los terminos de cada dataset por separado.
- Interoperabilidad: el checkpoint `model.dj` y el tokenizador `tokenizer.bpe` no son cargables con Transformers ni convertibles con las herramientas habituales; esto limita el despliegue a DeepJ 0.9.5-alpha o superior y ata el modelo a un framework en fase alpha.
- Adopcion practicamente nula: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netsrik/frisky-90m
- Repositorio de DeepJ: https://github.com/KirstenAli/DeepJ
- Paquete Maven de DeepJ 0.9.5-alpha: https://central.sonatype.com/artifact/io.github.kirstenali/deepj/0.9.5-alpha
- Interfaz de chat de escritorio de DeepJ: https://github.com/KirstenAli/DeepJ#desktop-chat
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de instrucciones SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
- Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en el repositorio oficial.
