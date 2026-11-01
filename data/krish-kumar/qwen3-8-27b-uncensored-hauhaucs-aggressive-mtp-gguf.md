# krish-kumar/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF de la familia Qwen3.8-27B, publicada por el usuario krish-kumar a partir del trabajo de HauhauCS sobre el modelo base Qwen/Qwen3.8-27B. Se trata de un modelo denso de 27 mil millones de parametros con codificador de vision, orientado a generacion de texto, razonamiento, uso agentico y entrada de imagen y video. La publicacion aplica un perfil de "desensurado agresivo" que elimina el comportamiento de rechazo y reduce el preambulo en peticiones dificiles.

La innovacion tecnica principal es FastMTP, un sidecar de aceleracion que se apoya en la cabeza NextN/MTP nativa del modelo para aplicar decodificacion especulativa. Segun el autor, esto produce hasta 3,02x de velocidad en generacion de documentos y 1,93x en generacion de razonamiento frente a la version sin MTP, y entre un 35,2% y un 21,1% mas de rendimiento que el MTP embebido estandar. El modelo conserva un contexto nativo de 262.144 tokens, extensible hasta 1.000.000.

Es relevante ahora porque combina tres piezas poco habituales en un mismo paquete GGUF: multimodalidad (proyector BF16 separado), decodificacion especulativa integrada y una linea completa de cuantizaciones propietarias K_P que prometen calidad de uno o dos niveles superior con solo un 5-15% mas de tamano. La ficha debe leerse con cautela: el repositorio no incluye resultados de benchmarks estandar ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador de vision; hibrido de 48 capas Gated DeltaNet y 16 capas de atencion con compuerta |
| Parametros totales | 27B (segun model card); el campo safetensors del repo declara 1.863.907.840, dato no coherente con la nomenclatura del modelo |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; proyector de vision BF16; sidecar FastMTP 32K |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto), GGUF BF16 (proyector de vision), GGUF (sidecar FastMTP) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso de 27B parametros con 64 capas, tamano oculto de 5.120 y FFN de 17.408. La arquitectura es hibrida: 48 capas usan Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y 16 capas usan atencion con compuerta. El vocabulario esta ampliado a 248.320 tokens. Incorpora una cabeza NextN/MTP (multi-token prediction) nativa embebida en los tensores del modelo, que es la base sobre la que opera el sidecar FastMTP.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) del modelo base Qwen3.8-27B en la informacion proporcionada. La model card indica explicitamente que no se han modificado datasets ni capacidades previstas: el trabajo de HauhauCS se limita a aplicar un perfil de desensurado y a preservar las capacidades originales de texto, razonamiento, agentica, imagen y video. La innovacion tecnica destacable es FastMTP, un perfil de aceleracion de 32K tokens que se combina con la cabeza MTP embebida para decodificacion especulativa, y las cuantizaciones K_P ("Perfect"), que aplican analisis especifico del modelo para preservar calidad en las capas mas sensibles.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto largo.
- Razonamiento y resolucion de problemas, incluida la variante de razonamiento con decodificacion especulativa acelerada.
- Generacion de codigo y tareas de programacion.
- Capacidades agenticas y razonamiento multi-paso.
- Entrada multimodal de imagen y video mediante el proyector BF16 separado (pipeline image-text-to-text).
- Comprension multilingue en ingles, chino y otros idiomas.
- Perfil "Aggressive": respuestas directas, sin comportamiento de rechazo y con preambulo minimo en peticiones dificiles.
- Decodificacion especulativa mediante FastMTP para acelerar la generacion.
- Compatibilidad con endpoints (tag endpoints_compatible) y runtimes GGUF estandar.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens nativos) sin perder el hilo, y el perfil agresivo reduce las evasivas en consultas delicadas, aunque conviene revisar la politica de contenido antes de exponerlo al publico.
- Generacion de codigo en produccion: al ser un GGUF compatible con llama.cpp y LM Studio, puede integrarse en pipelines locales de CI/CD o asistentes de IDE; el sidecar FastMTP acelera la generacion de documentos tecnicos y explicaciones de codigo.
- Analisis de documentos extensos: con contexto de hasta 1.000.000 tokens, es adecuado para resumir contratos, informes o bases de conocimiento completas en una sola pasada, usando cuantizaciones Q8_K_P o Q6_K_P para maximizar fidelidad.
- Procesamiento de imagen y video: el proyector BF16 permite describir, clasificar o extraer informacion de capturas, fotografias y fotogramas de video en flujos de moderacion de contenido o catalogacion de medios.
- Asistente agentico local: combinado con tool calling y razonamiento multi-paso, puede orquestar tareas de automatizacion en entornos de escritorio o servidores sin conexion a la nube, usando cuantizaciones Q4_K_P o IQ4_XS para ajustar requisitos de VRAM.
- Investigacion sobre desensurado y seguridad: el perfil Aggressive y la afirmacion de "0/465 rechazos" lo convierten en un objeto de estudio para evaluar comportamiento de rechazo, sesgos y robustez en modelos abiertos, siempre en entornos controlados.
- Despliegue en hardware de consumo: las cuantizaciones IQ2_M (10,32 GB) e IQ3_XS (12,18 GB) permiten ejecutar el modelo en GPUs de 12-16 GB, habilitando prototipado local de asistentes multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas relativas de aceleracion de FastMTP frente a variantes sin MTP y con MTP embebido:

| Metrica | FastMTP vs. sin MTP | FastMTP vs. MTP embebido estandar |
|---|---|---|
| Throughput en generacion de documentos (TG) | hasta 3,02x | hasta +35,2% |
| Throughput en generacion de razonamiento (TG) | hasta 1,93x | hasta +21,1% |

No se especifican las condiciones de medicion (hardware, cuantizacion, longitud de prompt) ni se aportan cifras absolutas de tokens por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (solo pesos de texto, sin contar contexto KV ni proyector):
  - Q8_K_P: ~31,5 GB; Q8_0: ~29 GB.
  - Q6_K_P: ~25,9 GB; Q6_K: ~22,5 GB.
  - Q5_K_P: ~20,2 GB; Q5_K_M: ~19,5 GB.
  - Q4_K_P: ~17,9 GB; Q4_K_M: ~16,7 GB.
  - IQ4_XS: ~15,7 GB.
  - Q3_K_P: ~13,4 GB; Q3_K_M: ~13,3 GB; IQ3_M: ~12,8 GB; IQ3_XS: ~12,2 GB.
  - Q2_K_P: ~10,7 GB; IQ2_M: ~10,3 GB.
  - Proyector de vision BF16: ~931 MB adicionales.
  - Sidecar FastMTP 32K: ~903 MB adicionales.
- GPU recomendadas: A100 80 GB o H100 para Q8_K_P con contexto largo; RTX 4090 (24 GB) para Q4_K_P o Q5_K_P con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_P o inferiores; en GPUs de 12-16 GB (RTX 4070 Ti, 4080, 4060 Ti 16 GB) con IQ3_XS, IQ3_M o IQ2_M, a costa de calidad y velocidad.
- Opciones de despliegue: llama.cpp, LM Studio y otros runtimes compatibles con GGUF; los archivos K_P son GGUFs estandar y no requieren build ni plugin especial. No se menciona soporte especifico para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no se aportan cifras absolutas; solo los multiplicadores relativos de FastMTP indicados en la seccion de benchmarks.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP | 27B denso | 262.144 (ext. 1M) | Si (imagen y video) | Apache 2.0 | GGUF | Perfil desensurado agresivo, FastMTP, cuantizaciones K_P |
| Qwen/Qwen3.8-27B (base) | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | safetensors (original) | Modelo de referencia sin modificaciones de alineacion |
| Qwen3-32B | 32B denso | 32.768 (ext. 131K) | No | Apache 2.0 | safetensors, GGUF | Generacion anterior, sin vision ni MTP |
| Llama 3.3 70B | 70B denso | 128K | No | Llama 3.3 Community License | safetensors, GGUF | Mayor tamano y contexto menor; licencia no Apache |

Los datos de Qwen3-32B y Llama 3.3 70B se incluyen como referencia de categoria; no se dispone de comparaciones de rendimiento publicadas entre este modelo y dichas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El perfil "Aggressive" elimina el comportamiento de rechazo de forma deliberada; esto puede producir contenido inapropiado, danino o legalmente problematico si se expone sin filtros adicionales. El propio autor recomienda una variante "Balanced" para trabajo agentico de larga duracion en entornos criticos.
- Riesgo elevado de alucinacion en tareas de razonamiento y datos factuales, agravado por la ausencia de benchmarks publicados que permitan calibrar su fiabilidad.
- La afirmacion "0/465 rechazos" es una metrica del autor sin metodologia publicada ni validacion independiente.
- El campo de parametros safetensors del repositorio (1.863.907.840) no es coherente con la nomenclatura de 27B del modelo; conviene verificar el contenido real de los archivos antes de confiar en el etiquetado.
- El contexto maximo de 1.000.000 tokens es una extension declarada, no verificada; el rendimiento en contextos muy largos puede degradarse y el coste de memoria KV crece de forma significativa.
- Cobertura multilingue limitada principalmente a ingles y chino; el rendimiento en castellano no esta documentado.
- Las cuantizaciones K_P pueden mostrarse como "?" en la columna de cuantizacion de LM Studio (problema de visualizacion, no de carga) y el widget de compatibilidad de hardware de HuggingFace puede no reconocerlas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por un modelo desensurado recae en el desplegador; conviene auditar el cumplimiento normativo (RGPD, DSA, normativa sectorial) antes de produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/krish-kumar/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio original del autor de las cuantizaciones: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
