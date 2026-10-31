# mradermacher/LYNX-ALPHA-i1-GGUF

## Resumen

LYNX-ALPHA-i1-GGUF es una colección de cuantizaciones GGUF con imatrix (matriz de importancia) del modelo alphalabz/LYNX-ALPHA, realizadas por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base LYNX-ALPHA es un modelo de generación de texto de aproximadamente 8.953 millones de parámetros, construido sobre la arquitectura Qwen3.5 y afinado con QLoRA sobre el dataset CyberMetric, con foco específico en ciberseguridad ofensiva: red teaming, pentesting, OSINT y análisis de malware.

Su relevancia radica en la combinación de tres factores: es un modelo especializado en seguridad con etiquetas "uncensored" y "abliterated" (es decir, con los filtros de seguridad eliminados), está publicado bajo licencia Apache 2.0 (uso comercial permitido) y está disponible en formato GGUF, lo que permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama o LM Studio. Esto lo hace atractivo para profesionales de la seguridad que necesitan un asistente offline sin restricciones de contenido para tareas técnicas.

Cabe destacar que la ficha del repositorio indica que se trata de un modelo de visión (vision model), aunque los archivos mmproj correspondientes se encuentran en el repositorio de cuantizaciones estáticas, no en este. El modelo base está entrenado principalmente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5 (transformer decoder), con adapter LoRA/QLoRA |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix/i1) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base, alphalabz/LYNX-ALPHA, se construye sobre la arquitectura Qwen3.5, una familia de transformers decoder densos. Sobre esta base se aplicó un ajuste fino mediante LoRA/QLoRA (según los tags del repositorio), una técnica de entrenamiento eficiente en parámetros que congela los pesos originales y entrena matrices de bajo rango, reduciendo drásticamente los requisitos de cómputo. El dataset empleado para el fine-tuning es CyberMetric, un benchmark público de preguntas y respuestas sobre ciberseguridad que cubre redes, criptografía, seguridad ofensiva y defensiva.

Sobre el modelo resultante, el autor alphalabz aplicó un proceso de "abliteration" (etiquetado como uncensored/abliterated), que consiste en identificar y neutralizar las direcciones de rechazo en el espacio de activaciones del modelo para eliminar sus negativas por motivos de seguridad. No hay información disponible sobre el número de tokens de preentrenamiento, la composición completa del dataset ni el uso de RLHF o DPO.

Las cuantizaciones de este repositorio son de tipo "imatrix" (importance matrix), creadas por mradermacher: se calcula una matriz de importancia a partir de datos de calibración para asignar mayor precisión a los tensores más relevantes, obteniendo mejor calidad que las cuantizaciones estáticas a igual tamaño. Se ofrecen 23 variantes, desde IQ1_S (2,8 GB) hasta Q6_K (7,5 GB).

## Capacidades

- Generación de texto conversacional centrada en ciberseguridad, con afinado sobre CyberMetric (preguntas técnicas de seguridad informática).
- Dominios especializados según los tags del modelo: seguridad ofensiva, red teaming, pruebas de penetración, OSINT y análisis de malware.
- Al estar abliterated, responde a consultas técnicas sensibles (exploits, payloads, técnicas de ataque) sin los rechazos habituales de modelos alineados.
- Capacidades de visión según la model card, aunque los archivos mmproj necesarios están en el repositorio de cuantizaciones estáticas (mradermacher/LYNX-ALPHA-GGUF), no en este.
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados.
- No hay información disponible sobre soporte de tool calling, function calling, capacidades de agentes ni modos de razonamiento (thinking).

## Casos de uso

- Asistente para pentesting: consulta de metodologías, enumeración de servicios, interpretación de resultados de Nmap o Burp Suite y generación de comandos durante una evaluación de seguridad autorizada.
- Red teaming: elaboración de informes de ataque, sugerencia de vectores de explotación y análisis de tácticas MITRE ATT&CK en ejercicios de equipo rojo.
- Análisis de malware: ayuda a interpretar comportamientos sospechosos, cadenas de ejecución y ofuscación básica descritas en texto, apoyando el triage inicial de muestras.
- OSINT: asistencia en la planificación de recopilación de inteligencia de fuentes abiertas y organización de la información obtenida en investigaciones de seguridad.
- Formación en ciberseguridad: generación de preguntas tipo examen, explicaciones de conceptos (criptografía, protocolos, vulnerabilidades) y preparación para certificaciones tipo Security+ o OSCP.
- Entornos air-gapped: al ser un GGUF ejecutable localmente, resulta útil en laboratorios aislados de red donde no se puede usar una API externa por confidencialidad de los datos analizados.
- Automatización de respuestas en SOC: borradores de análisis de incidentes y clasificación preliminar de alertas, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el dataset de entrenamiento es CyberMetric (que es en sí un benchmark), ni el autor del modelo base ni el cuantizador aportan puntuaciones evaluadas del modelo resultante en CyberMetric ni en otros benchmarks (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar KV cache ni over-head de contexto):
  - IQ1_S / IQ1_M: 2,8-3,0 GB
  - IQ2 / Q2: 3,2-3,9 GB
  - IQ3 / Q3: 4,0-5,0 GB
  - IQ4 / Q4: 5,3-5,9 GB
  - Q5: 6,4-6,6 GB
  - Q6_K: 7,5 GB
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) permite ejecutar cómodamente las cuantizaciones Q4_K_M o inferiores; con una RTX 4090 (24 GB) cabe la Q6_K con contexto amplio.
- Consumer GPUs: sí, es un modelo de ~9B parámetros diseñado para ejecutarse en hardware de consumo; también funciona en CPU pura con llama.cpp a velocidades aceptables (del orden de 10-20 tokens/s en CPUs modernas de 8 núcleos, valor estimado no verificado).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, GPT4All; también puede convertirse de nuevo o servirse con backends compatibles con GGUF. No es un GGUF orientado a vLLM o TGI (que requieren pesos safetensors; para ello usar el modelo base alphalabz/LYNX-ALPHA).
- Latencia y throughput: no disponible; dependen de la cuantización elegida y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| LYNX-ALPHA (este) | ~8,95B | GGUF (imatrix) | Ciberseguridad ofensiva, abliterated | Apache 2.0 |
| WhiteRabbitNeo (variantes ~7B/13B) | 7-13B | GGUF, safetensors | Ciberseguridad ofensiva, uncensored | no disponible |
| Qwen3.5 8B (modelo base sin afinar) | ~8B | Safetensors, GGUF comunitarios | Uso general | no disponible (consultar repo base) |
| HackTheBox / CTF-oriented fine-tunes (p. ej. Dolphin-mixtral variantes) | variable | GGUF, safetensors | Asistencia sin filtros de uso general | Apache 2.0 (linea Dolphin) |

Nota: la comparativa es orientativa; no hay benchmarks publicados que permitan comparar rendimiento objetivo entre estos modelos en tareas de seguridad.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: elimina deliberadamente las salvaguardas de seguridad. Esto implica riesgo real de generación de contenido peligroso y debe usarse únicamente en contextos legítimos y autorizados (pentesting con contrato, investigación, formación).
- Sesgos: no hay documentación sobre sesgos evaluados; hereda los sesgos del modelo base Qwen3.5 y del dataset CyberMetric.
- Alucinaciones: como todo modelo de ~9B, puede inventar comandos, CVEs, exploits o detalles técnicos plausibles pero incorrectos; en seguridad un comando erróneo puede ser disruptivo, así que verifica siempre la salida.
- Idioma: entrenado/documentado solo en inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud de ventana de contexto no está documentada en la ficha; no asumas contextos largos sin verificarlo en el modelo base.
- Cuantizaciones extremas (IQ1_S, IQ1_M, IQ2): el propio autor las marca como de calidad muy baja ("for the desperate"); para trabajo técnico serio usa Q4_K_M o superior.
- Licencia: Apache 2.0 permite uso comercial, pero las capacidades ofensivas del modelo pueden estar sujetas a restricciones legales según jurisdicción y a las políticas de las plataformas donde se despliegue.
- La model card menciona capacidades de visión, pero los archivos mmproj no están en este repositorio; habría que acudir al repo estático.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/LYNX-ALPHA-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/LYNX-ALPHA-GGUF
- Modelo base: https://huggingface.co/alphalabz/LYNX-ALPHA
- Página de descargas resumida: https://hf.tst.eu/model#LYNX-ALPHA-i1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper o demo oficial: no disponible
