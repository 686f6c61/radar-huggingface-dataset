# mradermacher/Rostam-S1-4B-i1-GGUF

## Resumen

Rostam-S1-4B-i1-GGUF es un conjunto de cuantizaciones GGUF del modelo oficialmobai/Rostam-S1-4B, publicadas por mradermacher. El modelo base es un LLM de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) desarrollado por MOB AI, orientado a razonamiento, matemáticas, física, código, capacidades agenticas y conversación, con soporte declarado de inglés y persa (farsi). Esta ficha describe la versión cuantizada, que es la que se distribuye en este repositorio.

La relevancia de esta publicación reside en que permite ejecutar un modelo de 4B especializado en razonamiento en hardware de consumo mediante cuantizaciones que van desde 1,3 GB (IQ1_S) hasta 3,5 GB (Q6_K). El repositorio incluye tanto cuantizaciones estáticas como cuantizaciones con pesos ponderados mediante fichero imatrix, lo que mejora la calidad en los niveles de compresión más agresivos. La licencia Apache 2.0 del modelo base facilita el uso comercial sin restricciones adicionales.

No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks en la documentación consultada. La model card del cuantizador se limita a la información técnica de las cuantizaciones y no reproduce la ficha del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; no especificado en la documentación consultada) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (no se ha documentado como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q3_K_L, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; también cuantizaciones estáticas en el repositorio mradermacher/Rostam-S1-4B-GGUF |
| Idiomas soportados | inglés (en), persa (fa) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la documentación consultada. Por el tamaño (4.112.079.360 parámetros) y el ecosistema de publicación (transformers, etiquetas de razonamiento, matemáticas, física y código), se trata de un modelo denso de la familia de transformers de aproximadamente 4B parámetros, pero no se confirma en la información disponible si emplea atención completa, atención lineal u otras variantes.

Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Las etiquetas del repositorio indican especialización en razonamiento, matemáticas, física, código, capacidades agenticas y conversación, además de bilingüismo inglés-persa, pero se desconoce el proceso concreto de entrenamiento. La única innovación técnica documentada en esta publicación es el uso de cuantizaciones ponderadas con fichero imatrix (generado a partir de datos de calibración), que reduce la pérdida de calidad en los niveles de cuantización bajos.

## Capacidades

- Generación de texto conversacional en inglés y persa.
- Razonamiento explícito, con etiquetas que indican entrenamiento orientado a cadenas de razonamiento.
- Resolución de problemas matemáticos y de física.
- Generación y comprensión de código.
- Capacidades agenticas (agentic), según las etiquetas del repositorio del modelo base.
- Soporte de tool calling / function calling: no confirmado en la documentación consultada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no confirmado en la documentación consultada.

## Casos de uso

- Asistente de razonamiento matemático en local: con la cuantización Q4_K_M (2,7 GB), el modelo puede desplegarse en un portátil con GPU de 8 GB o incluso en CPU, resolviendo problemas paso a paso sin enviar datos a servicios externos.
- Tutor de física para estudiantes persa-hablantes: el soporte nativo de farsi y las etiquetas de física permiten construir un asistente educativo bilingüe que explique conceptos y resuelva ejercicios en el idioma del usuario.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse localmente mediante llama.cpp u Ollama, el modelo puede integrarse en editores o pipelines internos sin exponer el código a APIs de terceros.
- Prototipado de agentes con tool calling (sujeto a verificación): las etiquetas agentic sugieren capacidad para flujos multi-paso; conviene validar empíricamente el soporte de function calling antes de usarlo en producción.
- Chat de atención al cliente en persa: con cuantizaciones Q4 o Q5 (2,5-3,1 GB) se puede desplegar en una GPU modesta para gestionar conversaciones multi-turno, aunque la longitud de contexto no está documentada y debe medirse.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantización, lo que permite medir empíricamente el compromiso entre tamaño, latencia y calidad para un caso de uso concreto antes de fijar una versión en producción.
- Inferencia en dispositivos de borde: la variante IQ1_S (1,3 GB) permite ejecutar el modelo en hardware con muy poca memoria, a costa de una calidad notablemente inferior, útil para demos o entornos con restricciones severas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, incluyendo overhead de contexto): IQ1_S ~1,5-2 GB; Q2_K ~2,5 GB; Q3_K_M ~3 GB; Q4_K_M ~3,5-4 GB; Q5_K_M ~4-4,5 GB; Q6_K ~4,5-5 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM permite ejecutar Q4_K_M o Q5_K_M con comodidad; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 son más que suficientes. Para las cuantizaciones más bajas basta una GTX 1650 de 4 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones desde IQ1_S hasta Q6_K con GPUs de 6 GB o más; las variantes Q4_K_S y Q4_K_M son las recomendadas por el autor para equilibrio tamaño/velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida. Como referencia cualitativa, el autor marca Q4_0 como "fast, low quality" y Q4_K_M como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rostam-S1-4B-i1-GGUF | 4,11B | no disponible | Apache 2.0 | GGUF | Bilingüe en/fa, orientado a razonamiento, matemáticas, física y código |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia habitual en la categoría 3-4B; multilingüe amplio |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Buen equilibrio calidad/tamaño; licencia con restricciones para >700M usuarios |
| Phi-3.5-mini-instruct | 3,82B | 131.072 tokens | MIT | safetensors, GGUF | Fuerte en razonamiento y código; sin soporte nativo de persa declarado |

La comparación se basa en datos públicos de los modelos alternativos; para Rostam-S1-4B no se dispone de contexto ni benchmarks verificables, por lo que la comparación cuantitativa de rendimiento no es posible con la información consultada.

## Limitaciones y advertencias

- No se han publicado benchmarks del modelo base en la documentación consultada; el rendimiento real en matemáticas, física o código no está verificado de forma independiente.
- La longitud de contexto no está documentada, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- El soporte de tool calling y de agentes multi-paso se deduce de etiquetas del repositorio, no de documentación técnica detallada; debe validarse empíricamente.
- Riesgo de alucinación inherente a los modelos de 4B parámetros, especialmente en dominios especializados como física avanzada o código de producción.
- Sesgos potenciales derivados del dataset de entrenamiento, no documentado; el sesgo cultural puede ser especialmente relevante al ser un modelo bilingüe inglés-persa.
- Las cuantizaciones por debajo de Q4 (especialmente IQ1 e IQ2) degradan la calidad de forma significativa; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Aunque la licencia Apache 2.0 permite uso comercial, conviene revisar la ficha del modelo base (officialmobai/Rostam-S1-4B) por si añade condiciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.
- El tamaño del repositorio (50,4 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF necesario, no el repositorio completo.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones: https://huggingface.co/mradermacher/Rostam-S1-4B-i1-GGUF
- Modelo base: https://huggingface.co/officialmobai/Rostam-S1-4B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Rostam-S1-4B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Rostam-S1-4B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
