# mradermacher/EliasAI-Micro-v1.0-i1-GGUF

## Resumen

EliasAI-Micro-v1.0-i1-GGUF es la version cuantizada en formato GGUF del modelo EliasAI-Micro-v1.0, un ajuste fino (finetune) conversacional en aleman desarrollado por ETME-TECH a partir de Qwen/Qwen3.5-0.8B-Base. La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, empleando cuantizacion con imatrix (importancia matricial) para preservar mejor la calidad en tasas de bits bajas.

El modelo base subyacente es un transformer de la familia Qwen3.5 con aproximadamente 1.006 millones de parametros totales (1,0 B), lo que lo situa en la categoria de modelos ultraligeros. Esta orientado a conversacion en aleman y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en entornos con recursos limitados.

Su relevancia actual radica en que permite desplegar un asistente conversacional en aleman en hardware muy modesto (incluso CPU o GPUs de gama baja), gracias a las multiples cuantizaciones disponibles que van desde aproximadamente 0,5 GB hasta 0,9 GB. Es una opcion practica para prototipado rapido, aplicaciones embebidas y experimentacion local sin infraestructura dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B-Base) |
| Parametros totales | 1.006.672.704 (aprox. 1,0 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizacion con imatrix) |
| Idiomas soportados | aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de aproximadamente 1,0 B de parametros. Sobre esta base, ETME-TECH realizo un ajuste fino orientado a conversacion en aleman, dando lugar a EliasAI-Micro-v1.0. No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en la informacion proporcionada.

La contribucion de esta ficha es la cuantizacion: mradermacher ha generado las versiones GGUF aplicando cuantizacion con imatrix (fichero imatrix incluido para quien quiera crear sus propias cuantizaciones). Se ofrecen tanto cuantizaciones estaticas (en el repositorio hermano EliasAI-Micro-v1.0-GGUF) como cuantizaciones i1 (importancia matricial) en este repositorio. Las cuantizaciones i1 suelen ofrecer mejor relacion calidad/tamano que las estaticas de tamano equivalente, segun las notas del autor.

## Capacidades

- Generacion de texto conversacional en aleman.
- Dialogo multi-turno orientado a asistencia conversacional.
- Ajuste fino especifico para conversacion (etiqueta "conversational").
- Inferencia en formato GGUF compatible con llama.cpp y derivados.
- Ejecucion en CPU y en GPUs de gama baja gracias a su reducido tamano.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al aleman segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en aleman: el modelo puede mantener dialogos multi-turno en aleman ejecutandose en un portatil o incluso en una Raspberry Pi con llama.cpp, sin necesidad de conexion a internet ni de GPU dedicada, lo que lo hace idoneo para prototipos de chatbots privados.
- Prototipado rapido de aplicaciones de chat: gracias a sus cuantizaciones de menos de 1 GB, se puede integrar en entornos de desarrollo con recursos limitados para validar flujos conversacionales antes de escalar a modelos mayores.
- Educacion y demostraciones: util para talleres y cursos sobre despliegue de LLM en local, ya que permite mostrar el ciclo completo de cuantizacion, carga e inferencia en hardware asequible.
- Procesamiento de texto en aleman en entornos embebidos: resumen o reformulacion de textos cortos en aplicaciones de escritorio o moviles donde no cabe un modelo mayor.
- Generacion de respuestas en sistemas de FAQ en aleman: el modelo puede redactar respuestas a partir de contexto breve en un dominio acotado, con la ventaja de su baja latencia en CPU.
- Filtrado y clasificacion ligera de texto en aleman: su tamano permite ejecutarlo como paso previo en pipelines que necesitan un primer cribado de contenido antes de invocar modelos mayores.
- Experimentacion con cuantizaciones: el repositorio incluye el fichero imatrix y decenas de variantes, lo que lo convierte en un banco de pruebas practico para comparar calidad entre tipos de cuantizacion (IQ frente a Q_K, por ejemplo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 0,5 GB (IQ1_S) hasta aproximadamente 0,9 GB (Q6_K) solo para los pesos; anadir margen para el contexto y el estado de inferencia.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (por ejemplo, GTX 1050 Ti, RTX 3050, RTX 4090) e incluso en GPUs integradas.
- Ejecucion en CPU: viable y recomendada para este tamano; llama.cpp puede ejecutarlo con buen rendimiento en CPU modernas.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y cualquier runtime compatible con GGUF; el modelo base en safetensors es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EliasAI-Micro-v1.0-i1-GGUF | aprox. 1,0 B | no disponible | aleman | Apache 2.0 | GGUF |
| Qwen/Qwen3.5-0.8B-Base | aprox. 0,8 B | no disponible | multilingue (segun modelo base) | no disponible | safetensors |
| EliasAI-Micro-v1.0-GGUF (cuantizaciones estaticas) | aprox. 1,0 B | no disponible | aleman | Apache 2.0 | GGUF |

La comparativa se limita a las variantes directamente relacionadas con este modelo, ya que no se dispone de datos de rendimiento de terceros en la informacion proporcionada. Frente a las cuantizaciones estaticas del repositorio hermano, las versiones i1 de este repositorio suelen ofrecer mejor calidad a igual tamano, segun las notas del autor.

## Limitaciones y advertencias

- Modelo de apenas 1,0 B de parametros: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparacion con modelos de mayor tamano.
- Riesgo elevado de alucinacion en preguntas factuales, especialmente con cuantizaciones muy agresivas (IQ1, IQ2).
- Las cuantizaciones por debajo de Q4 degradan notablemente la calidad; el propio autor advierte de que IQ1 esta "para los desesperados".
- Idioma limitado al aleman: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: conviene verificar empiricamente el contexto efectivo antes de usarlo en produccion.
- No hay informacion sobre sesgos especificos del ajuste fino; al derivar de Qwen3.5, puede heredar sesgos del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5 y del ajuste fino original de ETME-TECH.
- No se han publicado benchmarks: la evaluacion de calidad debe hacerse de forma empirica en el caso de uso concreto.
- El repositorio tiene 14,0 GB por acumulacion de todas las variantes de cuantizacion; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/EliasAI-Micro-v1.0-i1-GGUF
- Modelo base del ajuste fino: https://huggingface.co/ETME-TECH/EliasAI-Micro-v1.0
- Modelo base original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/EliasAI-Micro-v1.0-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#EliasAI-Micro-v1.0-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
