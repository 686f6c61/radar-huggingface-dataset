# mradermacher/sionic-K-SAT-MATH-3B-GGUF

## Resumen

sionic-K-SAT-MATH-3B es un modelo de lenguaje especializado en razonamiento matematico, desarrollado originalmente por sionic-ai y distribuido en formato GGUF por mradermacher. El modelo parte de una base de aproximadamente 4.170 millones de parametros (etiquetado comercialmente como "3B") y ha sido afinado mediante GRPO (Group Relative Policy Optimization), una tecnica de aprendizaje por refuerzo, para mejorar su desempeno en tareas de resolucion de problemas matematicos, con especial enfasis en el examen de acceso a la universidad coreano (CSAT, Suneung).

La relevancia de esta ficha radica en que se trata de una cuantizacion estatica del modelo original, publicada en multiples formatos GGUF que van desde Q2_K (1,9 GB) hasta f16 (8,4 GB), lo que permite desplegarlo en hardware de consumo. El modelo declara soporte para coreano e ingles y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines locales mediante llama.cpp u Ollama.

La informacion disponible sobre arquitectura interna, composicion del dataset de entrenamiento y resultados de benchmarks es limitada: la model card original no detalla estos aspectos, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, segun la libreria transformers) |
| Parametros totales | 4.169.800.704 (aprox. 4,17 mil millones) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por la libreria declarada (transformers) y el tamano de parametros, se trata presumiblemente de un transformer decoder-only de aproximadamente 4,17 mil millones de parametros, pero la model card no confirma la familia arquitectonica, el numero de capas ni la dimension de las cabezas de atencion.

En cuanto al entrenamiento, la unica informacion disponible es que el modelo ha sido ajustado mediante GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo con optimizacion de politica relativa a grupos, orientada a mejorar el razonamiento matematico. El modelo esta especializado en el examen CSAT coreano y en matematicas en general. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de SFT o DPO. Las cuantizaciones publicadas por mradermacher son estaticas (no ponderadas por imatrix), segun indica el propio autor.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Razonamiento matematico y resolucion de problemas, con especial orientacion al examen CSAT coreano.
- Razonamiento paso a paso (la naturaleza del ajuste con GRPO sugiere cadenas de razonamiento, aunque no se documenta explicitamente un modo "thinking").
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, vision, audio ni capacidades de agente multi-paso.

## Casos de uso

- Tutoria matematica en coreano: el modelo puede resolver y explicar problemas de matematicas de nivel de bachillerato y de preparacion del CSAT, aprovechando su ajuste especifico con GRPO sobre este dominio.
- Generacion de problemas y soluciones para plataformas educativas: util para crear bancos de ejercicios con solucion razonada en coreano, dado su entrenamiento orientado al examen de acceso universitario.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones Q4_K_S (2,6 GB) y Q4_K_M (2,7 GB), puede ejecutarse en portatiles con GPU modesta o incluso en CPU mediante llama.cpp, lo que lo hace adecuado para herramientas educativas offline.
- Asistente de estudio bilingue coreano-ingles: permite a estudiantes coreanos practicar matematicas y a estudiantes angloparlantes trabajar problemas en ingles, dentro de los dos idiomas declarados.
- Evaluacion de pipelines de razonamiento matematico: su tamano reducido y su especializacion lo convierten en un candidato para pruebas comparativas de tecnicas de RL aplicadas a matematicas.
- Integracion en asistentes de chat con contexto conversacional: el tag `conversational` y la compatibilidad con endpoints permiten montarlo detras de una API compatible con OpenAI en herramientas de chat autoalojadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB con cuantizaciones Q4 (Q4_K_S: 2,6 GB; Q4_K_M: 2,7 GB); alrededor de 4,5-5 GB con Q8_0 (4,5 GB) y 9-10 GB con f16 (8,4 GB), incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4 (por ejemplo, GTX 1650, RTX 3050); RTX 3060/4060 o superiores para Q8_0; A100/H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna con 4 GB o mas puede ejecutar las cuantizaciones Q4; las versiones Q2_K (1,9 GB) y Q3 (2,1-2,4 GB) caben incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base (safetensors) puede servirse con vLLM o TGI, aunque las cuantizaciones publicadas aqui son GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones oficiales en la informacion proporcionada. Como referencia estructural, se puede comparar con otros modelos de ~3-4B, pero los datos de rendimiento no estan disponibles para este modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sionic-K-SAT-MATH-3B (este) | 4,17B | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en matematicas y CSAT coreano, ajustado con GRPO |
| Alternativas de ~3-4B | no disponible | no disponible | no disponible | no disponible | No se han identificado comparaciones publicadas en la informacion disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al estar especializado en el examen CSAT coreano, su rendimiento fuera de ese dominio (matematicas generales, otras materias, conversacion abierta) puede degradarse.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar pasos de razonamiento plausibles pero incorrectos; en matematicas esto es especialmente critico y requiere verificacion.
- Idiomas limitados a coreano e ingles; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana larga para problemas extensos o conversaciones prolongadas.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; el propio autor marca Q3_K_M como "lower quality".
- Las cuantizaciones publicadas son estaticas, no ponderadas con imatrix, lo que puede suponer una perdida de calidad algo mayor frente a cuantizaciones ponderadas equivalentes.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la model card del modelo base (sionic-ai/sionic-K-SAT-MATH-3B) por si hubiera condiciones adicionales no reflejadas en la cuantizacion.
- El modelo base es de fecha reciente (noviembre de 2026) y cuenta con pocas descargas (423) y cero likes, lo que indica escasa validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sionic-K-SAT-MATH-3B-GGUF
- Modelo base: https://huggingface.co/sionic-ai/sionic-K-SAT-MATH-3B
- Pagina de descargas del autor: https://hf.tst.eu/model#sionic-K-SAT-MATH-3B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
