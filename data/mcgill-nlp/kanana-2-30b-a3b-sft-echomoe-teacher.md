# McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher

## Resumen

Kanana-2-30B-A3B-SFT-EchoMoE-teacher es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por el grupo McGill-NLP a partir del modelo base kakaocorp/kanana-2-30b-a3b-base-2601 de Kakao. Se trata de un ajuste fino supervisado (SFT) sobre el dataset Dolci-Instruct-SFT de AllenAI, concebido como el "teacher" no comprimido del informe EchoMoE: el modelo del que se destila el estudiante Kanana-2-30B-A3B y contra el que se comparan sus resultados.

El modelo emplea la arquitectura deepseek_v3 del modelo base, con 48 capas, 128 expertos enrutados (6 activos) y 2 expertos compartidos, hidden size de 2.048 y un total de 30.670.815.104 parámetros. Se evaluó a una longitud de contexto de 32.768 tokens en precisión bf16. Su relevancia actual radica en que sirve como referencia reproducible para investigar destilación y compresión de activaciones en MoE, y en que puede cargarse con vLLM y transformers sin necesidad del paquete EchoMoE.

El modelo obtiene una media de 58,5 sobre los 18 benchmarks del informe EchoMoE, con 68,2 en conocimiento y razonamiento, 41,5 en matemáticas, 53,4 en código y 53,0 en seguimiento de instrucciones. Su licencia derivada de Kanana impone restricciones relevantes para uso comercial y para ofrecerlo como API a terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts tipo deepseek_v3 (transformer) |
| Parametros totales | 30.670.815.104 (aproximadamente 30,7B) |
| Parametros activos | 6 expertos enrutados de 128, mas 2 expertos compartidos (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 32.768 tokens (longitud de evaluacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | kanana-license (Kanana License Agreement, derivada del modelo base de Kakao) |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos: 48 capas, hidden size de 2.048, tamano del repositorio de 61,3 GB, pipeline text-generation, compatible con text-generation-inference y endpoints.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con la arquitectura propia del base kanana-2-30b-a3b-base-2601 (etiquetada como deepseek_v3): 48 capas, 128 expertos enrutados de los que se activan 6 por token, 2 expertos compartidos y un hidden size de 2.048. Al conservar la arquitectura del base, vLLM y transformers lo cargan directamente sin el paquete EchoMoE.

El entrenamiento consistio en un ajuste fino supervisado sobre allenai/Dolci-Instruct-SFT, con dos epocas de secuencias empaquetadas de 8.192 tokens y una tasa de aprendizaje de 2e-5. No se documentan en la informacion disponible fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento. La innovacion tecnica asociada al modelo no reside en su arquitectura sino en su papel dentro del trabajo EchoMoE ("Communicate the Change: Efficient Expert Parallelism via Activation Compression"), donde actua como teacher de referencia para destilar y comprimir activaciones en paralelismo de expertos.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat propia.
- Razonamiento y conocimiento general (68,2 de media en el dominio de conocimiento y razonamiento del informe).
- Codigo (53,4 de media en el dominio de codigo).
- Matematicas (41,5 de media en el dominio de matematicas).
- Seguimiento de instrucciones (53,0 de media en el dominio correspondiente).
- Procesamiento de contexto largo de hasta 32.768 tokens.
- Compatibilidad con vLLM (incluido expert parallelism) y transformers.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Destilacion de modelos MoE: el modelo actua como teacher no comprimido para generar senales de destilacion hacia el estudiante Kanana-2-30B-A3B, tal como plantea el informe EchoMoE.
- Investigacion en compresion de activaciones: sirve como referencia de calidad para medir la perdida introducida por la compresion de activaciones en paralelismo de expertos.
- Evaluacion comparativa de tecnicas de eficiencia: al disponer de una media agregada sobre 18 benchmarks, permite cuantificar la degradacion de metodos de compresion o cuantizacion frente al modelo completo.
- Generacion de codigo asistida en ingles: con 53,4 de media en codigo, es utilizable en tareas de completado y explicacion de codigo dentro de pipelines de desarrollo.
- Razonamiento y respuesta a preguntas sobre documentos largos: su contexto de 32.768 tokens permite procesar articulos, informes o expedientes completos en una sola pasada.
- Reproduccion de experimentos academicos: al ser un checkpoint publico con configuracion de evaluacion documentada (vLLM 0.21, temperatura 0.7, top_p 0.8, top_k 20, presencia 1.5), facilita la replicacion de resultados.
- Base para ajustes finos posteriores: al estar ya alineado por SFT sobre Dolci, puede servir de punto de partida para especializaciones adicionales en ingles.

## Benchmarks y rendimiento

Resultados publicados en la model card: media (%) sobre los 18 benchmarks del informe EchoMoE, por dominio.

| Dominio | Puntuacion |
|---|---|
| Conocimiento y razonamiento | 68,2 |
| Matematicas | 41,5 |
| Codigo | 53,4 |
| Seguimiento de instrucciones | 53,0 |
| **Media** | **58,5** |

No se han publicado resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos (aproximadamente 30,7B parametros) ocupan en torno a 61 GB, por lo que caben en una unica GPU de 80 GB, tal como indica el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 en una sola tarjeta; configuraciones multi-GPU para mayor throughput.
- Despliegue en consumer GPU: no es viable en bf16 en tarjetas de 24 GB (RTX 4090) sin cuantizacion, y el autor no documenta pesos cuantizados.
- Opciones de despliegue: vLLM 0.21 (con `--data-parallel-size 8 --enable-expert-parallel --max-model-len 32768`), transformers con `device_map="cuda"`, y text-generation-inference por los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Media en 18 benchmarks EchoMoE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanana-2-30B-A3B-SFT-EchoMoE-teacher (este) | 30,7B (MoE, 6 de 128 activos) | 32.768 | 58,5 | kanana-license | Hugging Face (McGill-NLP) |
| Estudiante Kanana-2-30B-A3B (EchoMoE) | no disponible en la informacion | no disponible | comparado contra el teacher en el informe | no disponible | coleccion EchoMoE en Hugging Face |
| kakaocorp/kanana-2-30b-a3b-base-2601 | 30,7B (MoE) | no disponible | no disponible (modelo base sin SFT) | kanana-license | Hugging Face (Kakao) |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos externos comparables de la misma categoria.

## Limitaciones y advertencias

- Sesgos: no documentados en la informacion disponible; al entrenarse sobre Dolci-Instruct-SFT hereda los sesgos de ese corpus.
- Alucinacion: riesgo inherente a los modelos generativos; no se documentan evaluaciones especificas de factualidad.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Contexto: la longitud de evaluacion es de 32.768 tokens; no se garantiza un rendimiento fiable mas alla de esa ventana.
- Licencia: es una obra derivada de Kanana-2-30B-A3B bajo la Kanana License Agreement. El uso debe cumplir las Guidelines for Responsible AI de Kakao (seccion 2.2) y ofrecerlo a terceros mediante API o como parte de un producto requiere una licencia comercial separada de Kakao (seccion 4).
- Uso en produccion: es un checkpoint de investigacion (teacher de destilacion) con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion en produccion.
- Configuracion de generacion: los ajustes recomendados (temperatura 0.7, top_p 0.8, top_k 20, presencia 1.5) estan pensados para chat; las tareas few-shot usan decodificacion greedy.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/McGill-NLP/Kanana-2-30B-A3B-SFT-EchoMoE-teacher
- Codigo: https://github.com/McGill-NLP/EchoMoE
- Pagina del proyecto: https://mcgill-nlp.github.io/EchoMoE/
- Coleccion EchoMoE: https://huggingface.co/collections/McGill-NLP/echomoe-6afcbfa10b38185f87cbd0ac
- Modelo base: https://huggingface.co/kakaocorp/kanana-2-30b-a3b-base-2601
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Instruct-SFT
- Guidelines for Responsible AI de Kakao: https://www.kakaocorp.com/page/responsible/detail/guidelinesForResponsibleAI
- Paper: referencia bibliografica "Communicate the Change: Efficient Expert Parallelism via Activation Compression" (Liu, Gala, Reddy, Bahdanau, 2026); el identificador arXiv no esta disponible en la informacion proporcionada.
