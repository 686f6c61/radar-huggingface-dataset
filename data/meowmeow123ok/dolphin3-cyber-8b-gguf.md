# meowmeow123ok/Dolphin3-Cyber-8B-GGUF

## Resumen

Dolphin3-Cyber-8B es un modelo de lenguaje de 8.030.277.696 parametros especializado en ciberseguridad, publicado por el usuario meowmeow123ok en formato GGUF. Se construye mediante un fine-tuning con LoRA (r=16) sobre el modelo base huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated, que a su vez deriva de Dolphin3.0-Llama3.1-8B. El objetivo declarado es ofrecer asistencia experta en seguridad ofensiva (pentesting, desarrollo de exploits, investigacion de vulnerabilidades) y defensiva (blue team, marcos como OWASP Top 10 y MITRE ATT&CK).

La propuesta de valor se apoya en tres ejes: especializacion de dominio mediante un dataset de ciberseguridad propio, eliminacion de restricciones de alineamiento (abliterated/uncensored) para permitir contenido que los modelos genericos rechazan, y un despliegue 100 % local en hardware de consumo gracias a sus 11 niveles de cuantizacion GGUF, desde 3,18 GB (Q2_K) hasta 16,1 GB (F16).

Se trata de un modelo denso tipo transformer de la familia Llama 3.1, con licencia llama3.1 y soporte exclusivo del idioma ingles. No se han publicado resultados de benchmarks y el repositorio registra cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que su calidad real no esta validada de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parametros totales | 8.030.277.696 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens heredados de Llama 3.1 (no confirmado en la model card; las estimaciones de RAM dimensionan la cache KV para 2.048 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (repo); transformers para el modelo base |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1, un transformer decoder-only con atencion de multiples cabezales y RoPE, en su variante de 8B. Sobre el checkpoint huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (que ya incorpora tecnicas de abliteracion para eliminar restricciones de rechazo), se aplico un ajuste fino supervisado mediante LoRA con rango r=16, usando el framework Unsloth, que el autor destaca por ser 2x mas rapido. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO.

El dataset de ajuste se describe como un "custom-cybersecurity-dataset", especificamente curado para cubrir OWASP Top 10, MITRE ATT&CK, CVEs, bases de datos de exploits, metodologias de pentesting y marcos de seguridad defensiva. No se especifica el volumen del corpus ni su procedencia. La cuantizacion a GGUF la realiza RavichandranJ. No se documentan innovaciones tecnicas propias mas alla de la especializacion por dominio y la abliteracion heredada del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Llama 3.1 (formato Dolphin3).
- Analisis y explicacion de vulnerabilidades: OWASP Top 10, MITRE ATT&CK, CVE, tecnicas de ataque y mitigaciones.
- Asistencia en pentesting: metodologias, reconocimiento, enumeracion, explotacion y post-explotacion.
- Desarrollo y explicacion de exploits y PoCs (el modelo se declara "full" en generacion de codigo de exploit).
- Seguridad defensiva (blue team): deteccion, respuesta a incidentes y hardening.
- Soporte para investigacion de vulnerabilidades y retos CTF, segun los tags del repositorio (CTF, bug-bounty).
- Comportamiento sin rechazos (uncensored/abliterated) en temas de seguridad ofensiva.
- Capacidades de tool calling / function calling: no disponibles de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Asistencia en auditorias de pentesting: el modelo puede guiar un compromiso paso a paso (reconocimiento, escaneo, explotacion), apoyandose en su conocimiento de OWASP y MITRE ATT&CK y en su capacidad para generar comandos y scripts.
- Analisis de vulnerabilidades en codigo fuente: dado un fragmento de codigo, identifica patrones de CWE/OWASP y propone mitigaciones, util en revisiones de seguridad previas a despliegue.
- Redaccion de informes de seguridad: genera descripciones de hallazgos, impacto y recomendaciones, y puede reformular notas tecnicas para audiencias no tecnicas.
- Formacion y concienciacion en seguridad: sirve como tutor para entrenar a equipos en tecnicas ofensivas y defensivas en entornos controlados de laboratorio.
- Desarrollo de PoCs en CTF y bug bounty: genera y explica payloads y tecnicas de explotacion para entornos autorizados, acelerando la resolucion de retos.
- Analisis de malware y threat intelligence: ayuda a interpretar indicadores, tacticas y familias de malware apoyandose en marcos como ATT&CK.
- Despliegue local en entornos sensibles: al ejecutarse 100 % en local via llama.cpp/Ollama, permite analizar artefactos o realizar evaluaciones sin enviar datos a servicios en la nube.
- Consulta rapida de referencia tecnica: actua como base de conocimiento de seguridad para consultas puntuales sobre CVEs, tecnicas de ataque o configuraciones defensivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo model-index de la model card declara una entrada ("Dolphin3-Cyber-8B") con una lista de resultados vacia, por lo que no existen datos verificables de MMLU, HumanEval, GSM8K ni de cualquier otra prueba en la informacion proporcionada.

## Requisitos de hardware

- Uso en CPU/GPU de consumo: el autor indica que el modelo funciona en GPUs consumer desde una GTX 1650 en adelante.
- VRAM/RAM estimada segun cuantizacion (incluye modelo + cache KV para 2.048 tokens):

| Cuantizacion | Tamano de fichero | Bits | RAM necesaria (aprox.) |
|---|---|---|---|
| Q2_K | 3,18 GB | 2-bit | ~5,5 GB |
| Q3_K_M | 4,02 GB | 3-bit | ~6,5 GB |
| Q4_0 | 4,66 GB | 4-bit | ~7,0 GB |
| Q4_K_S | 4,69 GB | 4-bit | ~7,0 GB |
| Q4_K_M | 4,92 GB | 4-bit | ~7,5 GB |
| Q5_0 | 5,6 GB | 5-bit | ~8,0 GB |
| Q5_K_S | 5,6 GB | 5-bit | ~8,0 GB |
| Q5_K_M | 5,73 GB | 5-bit | ~8,5 GB |
| Q6_K | 6,6 GB | 6-bit | ~9,0 GB |
| Q8_0 | 8,54 GB | 8-bit | ~11,0 GB |
| F16 | 16,1 GB | 16-bit | ~18,5 GB |

- Opciones de despliegue documentadas: Ollama, llama.cpp, LM Studio, llama-cpp-python (Python) y Open WebUI.
- GPU recomendadas: en la informacion disponible solo se menciona compatibilidad con GTX 1650 y superiores; no se detallan modelos concretos como RTX 4090, A100 o H100.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Dolphin3-Cyber-8B | 8,03B | 128k (heredado; no confirmado) | Ciberseguridad | llama3.1 | GGUF |
| huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (modelo base) | 8B | 128k | Generalista abliterated | llama3.1 | safetensors |
| Dolphin3.0-Llama3.1-8B (origen) | 8B | 128k | Generalista | llama3.1 | safetensors |
| Meta Llama 3.1 8B Instruct | 8B | 128k | Generalista | llama3.1 | safetensors |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y formato. Para el modelo objeto de esta ficha no se han publicado benchmarks que permitan situarlo frente a alternativas especializadas en seguridad.

## Limitaciones y advertencias

- Idioma: solo soporta ingles; no se declara soporte de castellano ni de otros idiomas.
- Riesgo de alucinacion: como cualquier LLM de 8B, puede generar comandos, CVE, rutas de explotacion o referencias inexactas; todo output tecnico debe validarse antes de usarse en produccion.
- Contenido sin filtrar: al ser un modelo abliterated/uncensored, puede producir respuestas con tecnicas ofensivas o contenido que otros modelos rechazan; requiere controles de uso y supervision.
- Uso dual y legalidad: la generacion de exploits y material ofensivo debe limitarse a entornos autorizados; el uso indebido puede tener implicaciones legales.
- Licencia: hereda la Llama 3.1 Community License, con sus restricciones (entre ellas, la clausula de licencia para productos con mas de 700 millones de usuarios activos mensuales y obligaciones de atribucion). Verificar antes de uso comercial.
- Falta de validacion: cero descargas y cero valoraciones, conjunto de benchmarks vacio y dataset de entrenamiento no documentado; la calidad y seguridad del modelo no estan verificadas de forma independiente.
- Contexto: aunque la arquitectura base admite 128.000 tokens, las estimaciones de la model card dimensionan la cache KV para 2.048 tokens, sin que se documente comportamiento en ventanas largas.
- Ambito: el rendimiento fuera del dominio de ciberseguridad puede ser inferior al de un modelo generalista del mismo tamano, al haber sido ajustado especificamente.
- Repositorio de 69,6 GB: incluye las 11 cuantizaciones, lo que exige espacio de disco considerable si se descarga completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/meowmeow123ok/Dolphin3-Cyber-8B-GGUF
- Adaptadores LoRA: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA
- Modelo base: https://huggingface.co/huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
