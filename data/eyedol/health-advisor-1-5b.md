# EYEDOL/health-advisor-1.5b

## Resumen

El modelo `health-advisor-1.5b` es un fine-tune del modelo instructivo Qwen2.5-1.5B-Instruct, desarrollado por el usuario EYEDOL (Adegoke Israel). Está diseñado específicamente como asistente offline de educación al paciente y apoyo en triaje, con el objetivo de explicar información de salud, señalar síntomas de alarma y derivar consultas de dosificación a profesionales clínicos. No es una herramienta de diagnóstico. El modelo se distribuye en formato GGUF cuantizado (Q4_K_M y Q5_K_M) para su ejecución en CPU mediante llama.cpp, lo que permite su uso en entornos sin conexión a internet. Con 1.543.714.304 parámetros (1.5B), es un modelo compacto y ligero, adecuado para despliegues con recursos limitados. Su relevancia radica en la creciente demanda de asistentes de salud accesibles y privados, que puedan funcionar en dispositivos locales o en zonas con baja conectividad. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (1.5B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-1.5B-Instruct, que es un modelo de lenguaje denso con atención causal. El fine-tune se realizó sobre el modelo instructivo original, pero no se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens, ni las técnicas de alineación (RLHF, DPO, etc.). La información disponible indica únicamente que fue fine-tuned y convertido a GGUF para inferencia offline. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Por tanto, la arquitectura interna se mantiene idéntica al modelo base, con adaptaciones únicamente en la tarea objetivo.

## Capacidades

- Educación al paciente: explica información de salud de manera comprensible, como síntomas, condiciones comunes y cuidados preventivos.
- Soporte de triaje: orienta al usuario sobre si un síntoma requiere atención médica urgente o puede esperar, aunque no realiza diagnóstico.
- Identificación de síntomas de alarma: señala señales que requieren consulta médica inmediata (p. ej., dolor torácico, sangrado anormal).
- Derivación de dosificación: no ofrece dosis de medicamentos; redirige al usuario a un clínico o farmacéutico.
- Conversación instructiva: al ser un fine-tune del modelo instructivo Qwen2.5-1.5B, conserva la capacidad de seguir instrucciones y mantener diálogos multi-turno.
- Funcionamiento offline: gracias a la cuantización GGUF, puede ejecutarse sin conexión a internet en dispositivos locales.

## Casos de uso

- Atención al paciente en clínicas rurales: el modelo puede funcionar en un ordenador portátil o Raspberry Pi sin conexión, explicando a los pacientes información sobre enfermedades comunes y cuándo buscar ayuda médica.
- Asistente de triaje en consultas de telemedicina: integrado en un chatbot, el modelo puede recopilar síntomas y clasificarlos en niveles de urgencia, ayudando a priorizar citas médicas.
- Educación sanitaria en centros comunitarios: se puede desplegar en quioscos interactivos que expliquen condiciones crónicas (diabetes, hipertensión) y ofrezcan consejos generales de estilo de vida.
- Soporte para personal no clínico: en farmacias o centros de salud, el modelo puede ayudar a personal no médico a responder preguntas frecuentes, siempre que se supervise con profesionales.
- Aplicación móvil de autoeducación: los usuarios pueden consultar sobre síntomas y recibir orientación sobre cuándo visitar a un médico, sin sustituir el diagnóstico.
- Entornos de emergencia con baja conectividad: durante desastres naturales, el modelo puede funcionar en equipos locales para dar información básica de salud mientras se restaura la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han reportado evaluaciones como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo está cuantizado en GGUF para CPU, por lo que puede ejecutarse en hardware sin GPU. La memoria RAM necesaria depende de la cuantización: Q4_K_M ocupa aproximadamente 1,5 GB y Q5_K_M alrededor de 1,8 GB (estimación basada en el tamaño de archivo, no se proporciona dato oficial).
- Es adecuado para ejecutarse en una Raspberry Pi 4 o 5 con al menos 2 GB de RAM, aunque se recomienda 4 GB para mayor fluidez.
- En GPU, puede usarse con tarjetas de baja VRAM (2 GB o más) si se carga con llama.cpp o herramientas compatibles, pero no es obligatorio.
- Despliegue recomendado mediante llama.cpp (`llama-cli`, `llama-server`) o en Ollama si se convierte al formato adecuado.
- No se han publicado métricas de latencia o throughput; para un modelo de 1.5B en CPU, se espera una generación de unos pocos tokens por segundo, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EYEDOL/health-advisor-1.5b | 1.5B | No disponible | Apache 2.0 | GGUF en HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1.5B | 32k (según documentación de Qwen, no confirmado en la fuente) | Apache 2.0 | Safetensors, GGUF |
| yasserrmd/MedScholar-1.5B | 1.5B | No disponible | No especificada (probablemente Apache 2.0) | Safetensors |

Nota: los datos de contexto del modelo base no se han verificado en la información proporcionada; se indican como "no disponible" para el modelo analizado. No se dispone de comparativas de rendimiento (benchmarks) entre estos modelos.

## Limitaciones y advertencias

- No es un dispositivo de diagnóstico: el modelo no puede diagnosticar enfermedades ni condiciones médicas; debe usarse únicamente como herramienta educativa y de triaje.
- No debe utilizarse para recomendar dosis de medicamentos: la model card indica explícitamente que deferir estas preguntas a profesionales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información incorrecta o inventada, especialmente en el dominio médico donde la precisión es crítica.
- No se han documentado sesgos específicos, pero al ser un fine-tune de Qwen2.5-1.5B, puede heredar sesgos del modelo base.
- El contexto de la ventana no está documentado; puede limitar conversaciones largas o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantía de exactitud médica; el responsable del despliegue debe asumir la responsabilidad legal.
- El modelo está en formato GGUF, lo que limita su uso a entornos que soporten este formato (llama.cpp y derivados).

## Enlaces

- HuggingFace: [EYEDOL/health-advisor-1.5b](https://huggingface.co/EYEDOL/health-advisor-1.5b)
- Perfil de EYEDOL: [EYEDOL](https://huggingface.co/EYEDOL)
- Referencia al modelo base: [Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
