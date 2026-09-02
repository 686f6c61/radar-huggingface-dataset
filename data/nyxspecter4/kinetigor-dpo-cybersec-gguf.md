# nyxspecter4/kinetigor-dpo-cybersec-gguf

## Resumen

KIN v6 DPO es un modelo de lenguaje especializado en ciberseguridad, desarrollado por el usuario nyxspecter4. Se trata de un ajuste fino mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen2.5-0.5B-Instruct, orientado a responder preguntas de seguridad informática con un estilo directo y técnico, similar al de un ingeniero senior. El modelo está disponible en formato GGUF para su ejecución local con Ollama, llama.cpp u otros runtime compatibles.

El modelo resuelve el problema de obtener respuestas rápidas y específicas sobre ciberseguridad sin depender de servicios en la nube, con un tamaño reducido de aproximadamente 494 millones de parámetros. Su relevancia actual radica en la demanda de herramientas de asistencia para SOC, análisis de incidentes y pruebas de penetración que puedan ejecutarse en hardware modesto o incluso en CPU. La cuantización GGUF facilita su despliegue en entornos de producción con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0 y soporta únicamente inglés, según la información disponible. No se especifica la longitud de contexto en la model card, aunque al estar basado en Qwen2.5-0.5B-Instruct es probable que herede su ventana de contexto nativa, pero este dato no se confirma explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la model card; probablemente hereda la de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Q4_K_M (~398 MB), Q8_0 (~531 MB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de Qwen2.5-0.5B-Instruct, un modelo de 0.5 mil millones de parámetros diseñado para generación de texto. El fine-tuning se realizó mediante DPO (Direct Preference Optimization), una técnica de alineación que optimiza las preferencias humanas sin necesidad de un modelo de recompensa explícito. Los datos de entrenamiento provienen del dataset `nyxspecter4/kin-dpo-data`, específicamente curado para tareas de ciberseguridad, incluyendo respuestas preferidas y rechazadas para enseñar al modelo a priorizar información precisa y accionable.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales como RLHF. La innovación principal no reside en la arquitectura base, sino en la especialización mediante DPO y en la posterior cuantización a GGUF para facilitar su uso local. El modelo se entrena con un system prompt específico que condiciona el estilo de respuesta: directo, opinativo, con nombres de herramientas, CVEs y empresas reales, y con un límite de 2-3 párrafos.

## Capacidades

- Generación de texto especializado en ciberseguridad: responde preguntas sobre detección de intrusiones, análisis de malware, respuesta a incidentes, hardening, etc.
- Conocimiento de herramientas y productos reales: menciona nombres concretos como CrowdStrike Falcon, Velociraptor, Duo MFA, KnowBe4, entre otros.
- Referencias a CVEs y vulnerabilidades conocidas: incluye ejemplos como CVE-2023-4863, CVE-2021-44228 (Log4Shell) y CVE-2024-3094.
- Conocimiento de incidentes históricos: cita casos reales como el ataque a MGM, Colonial Pipeline, NotPetya, y pérdidas económicas asociadas (Maersk $300M, Merck $670M).
- Estilo de respuesta configurable mediante system prompt: el modelo está entrenado para responder de forma directa y opinativa, evitando respuestas genéricas tipo "como experto en IA".
- Ejecución local eficiente: gracias a su pequeño tamaño y cuantización GGUF, puede ejecutarse en CPU y en GPUs de gama baja.

## Casos de uso

- Asistencia para analistas SOC: el modelo puede ayudar a interpretar alertas de SIEM o EDR, sugiriendo pasos de triaje y herramientas específicas. Por ejemplo, ante una alerta de phishing, puede recomendar revisar logs de correo, usar Velociraptor para búsqueda de indicadores y verificar si hay persistencia. Su tamaño reducido permite ejecutarlo en el portátil de un analista sin conexión a internet.
- Respuesta a incidentes (DFIR): en un escenario de compromiso, el modelo puede guiar al investigador sobre qué artefactos recopilar (volcados de memoria, registros de eventos, imágenes de disco) y qué herramientas forenses utilizar, citando CVEs relevantes al vector de ataque.
- Entrenamiento y concienciación en seguridad: se puede integrar en plataformas de formación interna para simular preguntas y respuestas sobre ciberamenazas, ayudando a empleados a reconocer tácticas de ingeniería social o phishing.
- Análisis rápido de vulnerabilidades: los equipos de seguridad pueden consultar al modelo sobre una CVE concreta, obteniendo un resumen de su impacto y posibles mitigaciones, útil durante la gestión de parches.
- Pruebas de penetración (red team): el modelo puede sugerir comandos o técnicas de enumeración, pero con la advertencia de que su tamaño limita la profundidad. Es adecuado como apoyo en fases iniciales de reconocimiento o para generar ideas de vectores de ataque.
- Chatbot de seguridad integrado en herramientas de ticketing: al ser GGUF, puede desplegarse en un servidor local y conectarse a un sistema de tickets para responder consultas comunes de seguridad, reduciendo la carga del equipo de soporte.
- Investigación de amenazas (threat intelligence): el modelo puede correlacionar nombres de actores, tácticas y herramientas, aunque con las limitaciones de un modelo pequeño, sirviendo como referencia rápida durante análisis manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se desconoce su rendimiento cuantitativo en tareas de ciberseguridad.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (~398 MB), cabe en GPUs con 512 MB o más, aunque se recomienda al menos 1 GB para margen. La Q8_0 (~531 MB) necesita alrededor de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, GTX 1650, RTX 3050, o incluso integradas modernas. También se ejecuta en CPU sin GPU.
- En consumer GPU: sí, funciona en cualquier GPU de consumo reciente. Incluso en Raspberry Pi (con suficiente RAM) podría ejecutarse, aunque con menor velocidad.
- Opciones de despliegue: Ollama (compatible vía `ollama run hf.co/nyxspecter4/kinetigor-dpo-cybersec-gguf:Q4_K_M`), llama.cpp (`llama-cli`), y cualquier runtime que soporte GGUF (llama-cpp-python, LM Studio, etc.).
- Latencia y throughput: no hay datos oficiales, pero un modelo de 0.5B cuantizado a Q4_K_M en CPU moderna (por ejemplo, 8 núcleos) puede generar entre 10 y 30 tokens por segundo, dependiendo del hardware. En GPU, la velocidad es significativamente mayor.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (modelos pequeños especializados en ciberseguridad con formato GGUF). Existen otros modelos de ciberseguridad como `cyberfocus` o `security-llama`, pero no hay datos públicos de rendimiento o especificaciones para establecer una comparación objetiva. Por tanto, esta sección se limita a indicar que no hay datos suficientes.

## Limitaciones y advertencias

- Tamaño reducido (0.5B parámetros): la capacidad de razonamiento y conocimiento factual es limitada en comparación con modelos de mayor escala. Puede generar respuestas incompletas o simplificaciones excesivas.
- Riesgo de alucinación: al ser un modelo pequeño, es propenso a inventar nombres de herramientas, CVEs o datos técnicos si no los conoce. Se recomienda verificar cualquier referencia con fuentes oficiales.
- Solo inglés: no soporta otros idiomas, lo que limita su uso en entornos hispanohablantes.
- Dependencia del system prompt: el modelo fue entrenado con un prompt de sistema específico. Usar un prompt diferente degrada notablemente la calidad de las respuestas.
- Sin información sobre contexto: no se especifica la longitud de contexto, lo que impide conocer el límite de tokens de entrada. Para tareas con documentos largos, puede ser insuficiente.
- Licencia Apache 2.0: permite uso comercial, pero es necesario atribuir al autor original y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas de ciberseguridad, por lo que las capacidades descritas se basan únicamente en las afirmaciones del autor.
- Actualización reciente: el modelo fue creado en septiembre de 2026, pero no hay indicios de mantenimiento continuo o soporte activo.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/nyxspecter4/kinetigor-dpo-cybersec-gguf)
- [Modelo base sin cuantizar](https://huggingface.co/nyxspecter4/kinetigor-dpo-cybersec)
- [Dataset de entrenamiento DPO](https://huggingface.co/datasets/nyxspecter4/kin-dpo-data)
- [Perfil de GitHub del autor](https://github.com/NyxSpecter4)
