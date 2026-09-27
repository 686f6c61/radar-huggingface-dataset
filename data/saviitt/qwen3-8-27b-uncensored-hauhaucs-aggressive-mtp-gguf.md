# Saviitt/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una redistribución cuantizada en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario Saviitt a partir del trabajo de HauhauCS. Se trata de un modelo denso de 27.000 millones de parámetros con arquitectura híbrida (capas Gated DeltaNet combinadas con capas de atención con compuerta) y con codificador de visión, orientado a tareas de image-text-to-text. Su rasgo diferencial es doble: por un lado aplica el perfil de "descensura" Aggressive de HauhauCS, que según el autor elimina el comportamiento de rechazo (0/465 rechazos declarados); por otro, incorpora FastMTP, un sidecar de decodificación especulativa que acelera la generación respecto al MTP embebido estándar.

El modelo conserva las capacidades nativas de la familia Qwen3.8 en texto, razonamiento, uso agéntico, imagen y vídeo, con una ventana de contexto nativa de 262.144 tokens ampliable hasta 1.000.000. Se distribuye exclusivamente en cuantizaciones GGUF de 2 a 8 bits, más un proyector de visión BF16 separado y el fichero FastMTP de 32K, lo que lo hace desplegable en llama.cpp y LM Studio sin compilaciones especiales.

Su relevancia práctica es doble: para desarrolladores que necesitan un modelo multimodal de 27B ejecutable en hardware local con cuantizaciones de perfil optimizado (K_P), y para investigadores que quieran estudiar comportamiento sin rechazos o evaluar el impacto de la decodificación especulativa sobre el throughput de generación. El repositorio tiene 172,5 GB y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador de vision; 48 capas Gated DeltaNet (atencion lineal) y 16 capas de atencion con compuerta; 64 capas de language model |
| Parametros totales | 27B declarados en la model card; el campo de parametros safetensors de HuggingFace indica 1.863.907.840 (discrepancia no explicada por el autor) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M; ademas mmproj BF16 (proyector de vision) y FastMTP-32K |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (texto, vision y sidecar MTP); metadatos safetensors en HuggingFace |
| Tamano del repositorio | 172,5 GB |
| Tamano oculto / FFN | 5.120 / 17.408 |
| Vocabulario | 248.320 tokens (con padding) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un modelo denso de 27B con 64 capas de language model, tamano oculto de 5.120 y FFN de 17.408, sobre un vocabulario de 248.320 tokens. La innovacion estructural mas relevante es la hibridacion de capas: 48 capas usan Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente, y 16 capas mantienen atencion con compuerta. Esta mezcla reduce el coste del contexto largo en comparacion con un transformer de atencion completa, lo que explica que se declare una ventana nativa de 262.144 tokens. El modelo incorpora ademas un modulo MTP (Multi-Token Prediction) / NextN embebido en los tensores de texto, disenado para decodificacion especulativa.

Sobre el entrenamiento no se aporta informacion: no se indica numero de tokens, composicion del dataset, ni si hubo etapas de RLHF, DPO o similares. El autor declara explicitamente que "no hay cambios en los datasets ni en las capacidades previstas" respecto al modelo base Qwen/Qwen3.8-27B, por lo que el trabajo de este repositorio es de cuantizacion y perfilado, no de reentrenamiento. Las dos innovaciones tecnicas propias son: (1) las cuantizaciones K_P ("Perfect"), un perfil de cuantizacion por modelo que preserva selectivamente las capas mas sensibles a cambio de un 5-15 % mas de tamano, obteniendo calidad equivalente a uno o dos niveles de cuantizacion superiores; y (2) FastMTP, un sidecar de 903 MB que acelera la decodificacion especulativa en un perfil de 32K. Segun el autor, FastMTP alcanza hasta 3,02x de throughput de generacion en documentos y 1,93x en razonamiento frente a la version sin MTP, y hasta un 35,2 % y un 21,1 % mas que el MTP embebido estandar en esos mismos escenarios.

## Capacidades

- Generacion de texto y razonamiento: el autor declara que se preservan las capacidades de texto y razonamiento del modelo base.
- Capacidades agenticas: la model card menciona explicitamente que se conservan las capacidades agenticas de Qwen3.8-27B; el detalle concreto del soporte de tool calling o function calling no se especifica en la informacion disponible.
- Vision e imagen: pipeline image-text-to-text con codificador de vision; requiere el proyector separado mmproj BF16 (931 MB) para entrada de imagen o video.
- Video: el autor indica que se preservan las capacidades de video del modelo base.
- Multilingue: etiquetado para ingles, chino y multilingue.
- Comportamiento sin rechazos: perfil Aggressive, con 0/465 rechazos declarados por el autor, respuestas directas y preambulo minimo en prompts dificiles.
- Decodificacion especulativa: MTP/NextN nativo embebido mas el perfil FastMTP 32K para acelerar la generacion.
- Contexto largo: 262.144 tokens nativos, extensibles hasta 1.000.000.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Audio: no disponible.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto nativo y un perfil FastMTP optimizado precisamente para throughput en documentos (hasta 3,02x), el modelo es adecuado para resumir, extraer y consultar contratos, informes o expedientes completos sin fragmentacion agresiva.
- Procesamiento de imagenes y video: al cargar el proyector mmproj BF16, el modelo acepta entradas de imagen y video, lo que permite OCR de capturas, descripcion de diagramas tecnicos, analisis de fotogramas o transcripcion visual de material audiovisual.
- Agentes multi-paso en local: las capacidades agenticas heredadas y el contexto largo permiten mantener historiales de herramientas y observaciones de varias iteraciones; conviene validar el soporte exacto de tool calling antes de integrarlo en produccion.
- Despliegue en GPU de consumo: con cuantizaciones desde 10,32 GB (IQ2_M) hasta 17,92 GB (Q4_K_P), el modelo cabe en GPUs de 12, 16 y 24 GB de VRAM, lo que habilita asistentes multimodales en estaciones de trabajo sin acceso a clústeres.
- Investigacion sobre alineacion y rechazos: el perfil Aggressive, con 0/465 rechazos declarados, sirve como contrapunto experimental frente a la version alineada del modelo base para estudiar donde se concentra el comportamiento de rechazo y como afecta a la utilidad de la respuesta.
- Red-teaming y evaluacion de seguridad: la ausencia de rechazos declarada lo convierte en candidato para generar conjuntos de prompts adversarios y evaluar clasificadores de contenido, siempre con las salvaguardas externas adecuadas.
- Escritura creativa y de ficcion sin filtros editoriales: el perfil Aggressive y el preambulo minimo reducen las negativas y evasivas en narrativa, guiones o dialogos con tematicas sensibles.
- RAG multilingue sobre corpus en ingles y chino: el soporte declarado de en, zh y multilingue permite indexar documentacion bilingue y responder consultas cruzadas manteniendo el contexto completo en una sola ventana.
- Analisis de video de larga duracion combinado con texto: la ventana de 262K tokens permite concatenar descripciones de fotogramas con transcripciones y documentacion asociada en una misma sesion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento aportados son mediciones relativas de throughput de generacion (TG) del propio autor, sin valores absolutos en tokens por segundo:

| Metrica (declarada por el autor) | FastMTP frente a sin MTP | FastMTP frente a MTP embebido estandar |
|---|---|---|
| TG en documentos | hasta 3,02x | hasta +35,2 % |
| TG en razonamiento | hasta 1,93x | hasta +21,1 % |
| Rechazos | 0/465 (perfil Aggressive) | no aplica |
| MMLU, HumanEval, GSM8K, MT-Bench | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de fichero publicado, sin incluir cache KV ni el proyector): IQ2_M unos 10,3 GB; Q2_K_P unos 10,7 GB; IQ3_XS unos 12,2 GB; IQ3_M unos 12,8 GB; Q3_K_P unos 13,4 GB; IQ4_XS unos 15,7 GB; Q4_K_P unos 17,9 GB; Q5_K_P unos 20,2 GB; Q6_K_P unos 25,9 GB; Q8_K_P unos 31,5 GB. Estas cifras son estimaciones derivadas del tamano de fichero, no mediciones publicadas.
- GPU recomendadas: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar Q4_K_P, IQ4_XS y todas las cuantizaciones inferiores dejando margen para cache KV en contextos moderados; una GPU de 48 GB (A6000, L40S) o A100/H100 de 80 GB permite Q6_K_P y Q8_K_P con contextos amplios.
- Cabe en GPU de consumo: si. Q4_K_P (17,92 GB) entra en 24 GB; IQ3_XS (12,18 GB) y Q2_K_P (10,68 GB) entran en GPUs de 12-16 GB.
- Vision: requiere descargar adicionalmente el proyector mmproj BF16 (931 MB), que funciona con cualquier cuantizacion de texto.
- Decodificacion especulativa: requiere el fichero adicional FastMTP-32K (903 MB).
- Opciones de despliegue: llama.cpp y LM Studio estan confirmados por el autor; el repositorio incluye la etiqueta endpoints_compatible, aunque la compatibilidad efectiva con HuggingFace Inference Endpoints para GGUF no se detalla. El soporte de vLLM, TGI u Ollama no se menciona en la informacion disponible.
- Latencia y throughput: no hay valores absolutos publicados; solo los multiplicadores relativos de FastMTP indicados en la seccion anterior.
- Nota del autor: los quants K_P pueden aparecer como "?" en la columna de cuantizacion de LM Studio, un problema de visualizacion que no impide la carga. El widget de compatibilidad de hardware de HuggingFace puede no reconocer los quants K_P; hay que usar "View variants" o "Files and versions".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B Uncensored Aggressive + FastMTP) | 27B (nominal) | 262.144, extensible a 1.000.000 | Texto, imagen y video | apache-2.0 | FastMTP: hasta 3,02x TG en documentos y 1,93x en razonamiento frente a sin MTP |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible en la informacion proporcionada | Texto, imagen y video | no disponible en la informacion proporcionada | Sin perfil de descensura ni FastMTP; usado como referencia del multiplicador "sin MTP" |
| Variante con MTP embebido estandar | 27B | no disponible en la informacion proporcionada | Texto | no disponible en la informacion proporcionada | FastMTP declara hasta un 35,2 % mas de TG en documentos y un 21,1 % mas en razonamiento |
| Otras cuantizaciones GGUF no K_P | 27B | no disponible | Texto | no disponible | El autor indica que las K_P mejoran la calidad uno o dos niveles de cuantizacion con un 5-15 % mas de tamano |

No se dispone de modelos comparables alternativos con datos verificables en la informacion proporcionada; la comparativa se limita por tanto al propio modelo base y a las variantes internas del repositorio.

## Limitaciones y advertencias

- Descargas y validacion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de las afirmaciones del autor (0/465 rechazos, multiplicadores de FastMTP, calidad superior de los quants K_P).
- Discrepancia de parametros: el campo de parametros safetensors de HuggingFace indica 1.863.907.840, muy lejos de los 27B declarados en la model card. El autor no explica esta diferencia; conviene verificar los ficheros antes de planificar hardware.
- Perfil Aggressive: el autor advierte que para trabajo agentico critico y de contexto largo es mas seguro un perfil Balanced, cuando este disponible. El comportamiento sin rechazos puede producir contenido inapropiado o danino en produccion.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o representacion. Al eliminar los rechazos, se elimina tambien una capa de mitigacion, lo que previsiblemente incrementa la exposicion a contenido sesgado u ofensivo.
- Alucinacion: no se aportan datos de tasas de alucinacion ni evaluaciones de veracidad. Un perfil que responde sin dudar ante prompts dificiles puede aumentar la confianza aparente en respuestas incorrectas.
- Ausencia de datos de entrenamiento: al no documentarse dataset, tokens ni proceso de alineacion, no es posible auditar la procedencia del comportamiento del modelo.
- Contexto e idioma: el contexto nativo es de 262.144 tokens, pero no hay mediciones publicadas del rendimiento real en ventanas extremas; la extension a 1.000.000 se declara como capacidad, no como rendimiento verificado. Los idiomas declarados son ingles, chino y multilingue, sin lista cerrada ni evaluacion por idioma.
- Licencia: apache-2.0 permite uso comercial, pero el modelo base declara su propia licencia que no se detalla en la informacion disponible; conviene verificar las condiciones del modelo base antes de explotarlo comercialmente.
- Requisitos adicionales: sin el proyector mmproj BF16 no hay vision, y sin el fichero FastMTP-32K no hay la aceleracion anunciada; ambos son descargas separadas.
- Herramientas: la compatibilidad mas alla de llama.cpp y LM Studio (vLLM, TGI, Ollama, endpoints gestionados) no esta documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Saviitt/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de referencia de HauhauCS citado en la model card: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Servidor de Discord del autor: https://discord.gg/SZ5vacTXYf
- Ficheros de cuantizacion citados por el autor: Q8_K_P, Q6_K_P, Q5_K_P, Q4_K_P, IQ4_XS, Q3_K_P, IQ3_M, IQ3_XS, Q2_K_P e IQ2_M, todos bajo la ruta https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/resolve/main/
- Proyector de vision: mmproj-Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-BF16.gguf (931 MB)
- Sidecar de decodificacion especulativa: Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf (903 MB)
- Paper, blog tecnico o demo oficial: no disponible en la informacion proporcionada
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados no guardan relacion con el contenido tecnico de la ficha y se han descartado.
