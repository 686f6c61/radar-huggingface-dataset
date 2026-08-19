# kepom/Dolphin3-Cyber-8B-GGUF

## Resumen

Dolphin3-Cyber-8B es un modelo de lenguaje de 8.030 millones de parámetros especializado en ciberseguridad, desarrollado a partir de Dolphin3.0-Llama3.1-8B-abliterated, una variante sin censura de Llama 3.1 creada por huihui-ai. El fine-tuning se realizó con adaptadores LoRA de rango 16 mediante la librería Unsloth sobre un dataset propio de ciberseguridad que cubre OWASP Top 10, MITRE ATT&CK, CVEs, metodologías de pentesting y frameworks de seguridad defensiva. El modelo se distribuye exclusivamente en formato GGUF con 11 niveles de cuantización, lo que permite ejecutarlo localmente en hardware de consumo sin depender de servicios en la nube.

Su principal valor diferencial es ofrecer un asistente de seguridad sin restricciones de alineación (abliterated), capaz de generar código de exploit, analizar vulnerabilidades y discutir técnicas ofensivas sin rechazos. Está pensado para profesionales de seguridad que necesitan confidencialidad y control total sobre la inferencia. El repo actual (kepom/Dolphin3-Cyber-8B-GGUF) es una re-subida del trabajo original de RavichandranJ, con la misma model card y cuantizaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.277.696 (8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer estándar de Llama 3.1 con 8B parámetros y una ventana de contexto de 2048 tokens. No incorpora innovaciones estructurales como atención lineal o decodificación especulativa; es un fine-tuning de dominio sobre el modelo base abliterated. El entrenamiento utilizó adaptadores LoRA con r=16 y alpha=32 (valores típicos de Unsloth), aplicados sobre todas las capas de atención y MLP. El dataset de entrenamiento es un conjunto propio de ciberseguridad que incluye datos de OWASP, MITRE ATT&CK, bases de exploits, CTFs y guías de pentesting. No se menciona el número de tokens de entrenamiento ni el uso de RLHF o DPO posterior al fine-tuning. La técnica de abliteration aplicada al modelo base elimina las direcciones de activación asociadas a comportamientos de rechazo, lo que permite respuestas sin censura en temas de seguridad.

## Capacidades

- Generación de texto especializado en ciberseguridad: análisis de vulnerabilidades, redacción de informes técnicos y explicación de vectores de ataque.
- Generación de código de exploit y PoC (proof of concept) para CVEs específicos, con sintaxis en Python, Bash, PowerShell y otros lenguajes.
- Asistencia en CTF (Capture The Flag): resolución de retos de reversing, pwn, crypto y web.
- Soporte de conversación multi-turno mediante la plantilla de chat de Llama 3.1 (Dolphin3 chat format).
- Sin censura en temas de seguridad ofensiva: no rechaza peticiones sobre exploits, malware o técnicas de intrusión.
- Capacidades multilingües limitadas al inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- No soporta tool calling ni function calling de forma nativa, ni capacidades multimodales (visión, audio).

## Casos de uso

- Análisis de vulnerabilidades en código fuente: el modelo puede revisar fragmentos de código en busca de fallos comunes (inyección SQL, XSS, buffer overflow) y sugerir correcciones, aprovechando su entrenamiento en OWASP Top 10 y CVE.
- Generación de PoC para investigaciones de seguridad: un investigador puede describir una vulnerabilidad recién descubierta y el modelo genera un script de prueba de concepto funcional, acelerando la validación de exploits.
- Preparación de entornos de red team: el modelo ayuda a planificar fases de reconocimiento, enumeración y explotación en ejercicios de penetración autorizados, generando comandos y secuencias de ataque.
- Soporte en blue team y respuesta a incidentes: puede analizar logs, identificar patrones de ataque y recomendar medidas de mitigación basadas en MITRE ATT&CK.
- Educación y formación en ciberseguridad: instructores y estudiantes pueden usarlo para practicar técnicas de hacking ético en laboratorios controlados, obteniendo explicaciones detalladas de cada paso.
- Automatización de informes de seguridad: el modelo redacta informes técnicos estructurados a partir de hallazgos, ahorrando tiempo a los consultores de seguridad.
- Revisión de configuraciones de seguridad: puede evaluar configuraciones de firewalls, servidores web o políticas de acceso y señalar malas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara una lista de resultados vacía (`results: []`). No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas de ciberseguridad. El autor no proporciona métricas comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (incluyendo KV cache para 2048 tokens):
  - Q2_K: ~5,5 GB
  - Q3_K_M: ~6,5 GB
  - Q4_K_M: ~7,5 GB
  - Q5_K_M: ~8,5 GB
  - Q6_K: ~9,0 GB
  - Q8_0: ~11,0 GB
  - F16: ~18,5 GB
- GPU recomendadas: para cuantizaciones Q4 y menores, una GTX 1650 con 4 GB de VRAM es suficiente; para Q5/Q6 se recomienda RTX 3060 o superior; para Q8/F16, RTX 3090 o A100.
- Es ejecutable en hardware de consumo (GPU con 4 GB+ VRAM) gracias a las cuantizaciones GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan.ai, Open WebUI y llama-cpp-python.
- Latencia y throughput estimados: no disponibles; dependen del hardware y la cuantización. En una GPU moderna, un modelo 8B en Q4_K_M suele generar entre 20 y 40 tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para una comparación cuantitativa. Cualitativamente, se puede comparar con:

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin3-Cyber-8B | 8B | 2048 | Ciberseguridad, sin censura | Llama 3.1 | GGUF |
| WhiteRabbitNeo 13B | 13B | 4096 | Ciberseguridad, sin censura | Custom (no comercial) | safetensors, GGUF |
| Llama 3.1 8B base | 8B | 128K | General | Llama 3.1 | múltiples formatos |

Dolphin3-Cyber-8B destaca por su menor tamaño (8B) frente a WhiteRabbitNeo (13B), lo que facilita su ejecución en hardware modesto, pero su contexto de 2048 tokens es muy inferior al de Llama 3.1 base (128K). La licencia Llama 3.1 permite uso comercial con restricciones para empresas de gran escala, mientras que WhiteRabbitNeo tiene una licencia más restrictiva.

## Limitaciones y advertencias

- Contexto limitado a 2048 tokens: insuficiente para analizar documentos largos o mantener conversaciones extensas sin truncamiento.
- Solo soporta inglés; el rendimiento en otros idiomas no está garantizado.
- Al ser un modelo abliterated y sin censura, puede generar contenido peligroso, ilegal o éticamente cuestionable. Su uso para actividades maliciosas es responsabilidad del usuario.
- Riesgo de alucinación en recomendaciones de seguridad: puede sugerir exploits inexistentes o configuraciones incorrectas, por lo que sus salidas deben verificarse siempre.
- No se han publicado evaluaciones formales de sesgos ni de robustez frente a jailbreaks.
- La licencia Llama 3.1 restringe el uso comercial si la empresa tiene más de 700 millones de usuarios mensuales; para el resto, el uso comercial está permitido.
- El dataset de entrenamiento es propio y no está disponible públicamente, lo que limita la reproducibilidad y la auditoría del modelo.
- No soporta tool calling ni integración con APIs externas, lo que reduce su utilidad en pipelines de automatización complejos.

## Enlaces

- Repo de HuggingFace (este modelo): https://huggingface.co/kepom/Dolphin3-Cyber-8B-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated
- Adaptadores LoRA originales: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA
- Repo original de cuantización (RavichandranJ): https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-GGUF
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Perfil en LLM Explorer: https://llm-explorer.com/model/RavichandranJ%2FDolphin3-Cyber-8B-GGUF,3sNOSWIdiqaQoiX3tgrbSV
