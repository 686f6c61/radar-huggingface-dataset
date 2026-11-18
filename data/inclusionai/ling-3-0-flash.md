# inclusionAI/Ling-3.0-flash

## Resumen

Ling-3.0-flash es un modelo de lenguaje de tipo MoE híbrido lineal desarrollado por inclusionAI (equipo vinculado a Ant Group). Se presenta como un modelo de razonamiento nativo de nueva generación que activa únicamente 5,1B de parámetros por token sobre un total de 124B, lo que lo sitúa en la categoría de modelos eficientes de gran escala orientados a despliegue en producción. Su arquitectura combina atención lineal Kimi Delta Attention (KDA) con atención MLA en un apilamiento alternado 5:1, una decisión tomada desde el inicio del preentrenamiento y no como un añadido posterior.

El modelo está diseñado explícitamente para flujos de trabajo agénticos: entrenamiento con más de 10.000 entornos interactivos, integración nativa con la arquitectura de caché jerárquica SGLang HiCache + Mooncake y evaluaciones centradas en benchmarks de ingeniería de software, uso de herramientas MCP y tareas de investigación profunda. Su ventana de contexto alcanza los 256K tokens según el calendario de entrenamiento (8K → 32K → 256K).

La relevancia actual del modelo reside en su relación entre capacidad y coste computacional: con un 12,4% de los parámetros de su predecesor Ring-2.6-1T y un 8,1% de parámetros activos, el autor afirma igualar o superar a ese modelo en benchmarks clave. La licencia MIT facilita su adopción comercial sin restricciones de uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido lineal (KDA + Gated MLA, apilamiento 5:1) |
| Parámetros totales | 127.486.405.600 (124B según model card) |
| Parámetros activos | 5,1B |
| Longitud de contexto | 256K tokens (calendario de entrenamiento 8K → 32K → 256K) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code) |
| Capas transformer | 35 KDA + 7 Gated MLA |
| Capas densas | 2 |
| Expertos enrutados | 512 |
| Expertos compartidos | 1 |
| Expertos activados | 8 |
| Cabezas de atención | 32 |
| Hidden size | 2560 |
| Tamaño intermedio de experto | 768 |
| Tamaño intermedio denso | 6144 |
| Vocabulario | 157184 |
| Tamaño del repo | 255,0 GB |

## Arquitectura y entrenamiento

Ling-3.0-flash emplea una arquitectura híbrida lineal desde el inicio del preentrenamiento: 35 capas de Kimi Delta Attention (KDA) alternadas con 7 capas de Gated MLA en proporción 5:1, más 2 capas densas. La KDA incorpora una mejora de compuerta diagonal de grano fino, y el componente MoE utiliza enrutamiento disperso 1/64 con 512 expertos enrutados, 1 experto compartido y 8 expertos activados por token. El tamaño oculto es de 2560 y el vocabulario de 157.184 tokens. Esta combinación busca reducir el coste computacional del contexto largo manteniendo la calidad de atención completa en las capas MLA.

El entrenamiento se organiza en tres fases de contexto creciente (8K, 32K y 256K tokens). El autor indica que el modelo se ha entrenado con más de 10.000 entornos interactivos para tareas de agente, cubriendo Coding, General y Deep Research, con ejecución en bucle cerrado de extremo a extremo. No se especifican en la información disponible el número total de tokens de preentrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modo de razonamiento (thinking) está activado por defecto, con parámetros recomendados de `temperature=0.6, top_p=0.95, top_k=20`.

## Capacidades

- Generación de texto conversacional y razonamiento nativo en modo thinking activado por defecto.
- Razonamiento matemático y conocimiento general, según las evaluaciones declaradas por el autor.
- Generación y edición de código, con resultados destacados en SWE-Bench Pro, SWE-Bench Multilingual y AntSWEBench.
- Uso de herramientas y function calling, con evaluación específica en MCP-Atlas (500 tareas, límite de 20 turnos).
- Comportamiento agéntico multi-paso: tareas de investigación profunda, agentes de búsqueda y ejecución en bucle cerrado.
- Integración con frameworks agénticos: Claude Code, Kilo Code, Qwen Code, Hermes Agent y OpenClaw.
- Manejo de contexto largo de hasta 256K tokens, con evaluación en tareas de comprensión de contexto extenso.
- Capacidad de generación de aplicaciones HTML interactivas (MiniAppBench).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede resolver issues y aplicar parches en repositorios reales, como demuestra su evaluación en SWE-Bench Pro y SWE-Bench Multilingual con el harness OpenHands y 256K de contexto. Adecuado para pipelines de revisión y corrección automática de código.
- Automatización de refactorizaciones multi-lenguaje: AntSWEBench cubre Java, JavaScript y Python en escenarios de nueva funcionalidad, corrección de bugs y refactorización, lo que lo hace apto para tareas de mantenimiento de código en entornos corporativos.
- Investigación profunda asistida: con más de 10.000 entornos de entrenamiento interactivo y soporte de agentes de búsqueda multi-agente (BrowseComp), puede encadenar búsquedas, lectura y síntesis en informes extensos.
- Integración de herramientas MCP: su evaluación en MCP-Atlas (500 tareas públicas) indica capacidad para orquestar llamadas a herramientas externas y verificar cobertura de afirmaciones, útil en asistentes empresariales conectados a APIs.
- Generación de aplicaciones web completas: MiniAppBench evalúa la conversión de una petición de usuario en una app HTML interactiva usable, un caso realista para prototipado rápido y herramientas low-code.
- Atención al cliente con contexto largo: la ventana de 256K y la caché jerárquica SGLang HiCache + Mooncake reducen el TTFT entre un 60% y un 80% en entradas largas, lo que permite conversaciones multi-turno con historial extenso y documentación adjunta.
- Despliegue en producción con coste contenido: al activar solo 5,1B de parámetros por token, es viable servir cargas concurrentes en infraestructura moderada comparado con modelos densos de tamaño similar.

## Benchmarks y rendimiento

El autor declara evaluaciones en SWE-Bench Pro, SWE-Bench Multilingual, Tau3-banking-AA, MCP-Atlas, SkillsBench, Terminal-Bench 2.1, MiniAppBench, AntSWEBench, GDPval v2-AA y tareas de agente de búsqueda, pero los resultados numéricos se presentan únicamente en imágenes no incluidas en la información disponible.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo MoE de 124B totales requiere almacenar todos los pesos; en FP16 serían aproximadamente 250 GB, y en cuantización de 4 bits en torno a 65-70 GB, aunque estas cifras no las confirma el autor.
- GPU recomendadas: no disponible. El tamaño del repo (255 GB) sugiere despliegue multi-GPU para pesos sin cuantizar.
- ¿Cabe en GPU de consumo? No disponible; con 124B de parámetros totales, previsiblemente no en configuraciones de una sola GPU de consumo sin cuantización agresiva.
- Opciones de despliegue: el autor menciona integración nativa con SGLang HiCache + Mooncake (caché jerárquica con doble pool físico y caché L3 compartida por clúster). No se confirman en la información disponible soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor reporta una reducción del Time to First Token del 60% al 80% en escenarios de entrada larga gracias a la caché jerárquica. No se proporcionan cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.0-flash | 124B / 5,1B | 256K | MIT | Híbrido lineal KDA + MLA, MoE 1/64 |
| Ring-2.6-1T (predecesor, mismo autor) | ~1T (clase) | no disponible | no disponible | El autor afirma que Ling-3.0-flash lo iguala o supera con ~12,4% de sus parámetros |
| Alternativas de terceros | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con modelos de otros fabricantes no puede realizarse con rigor porque la información disponible no incluye resultados numéricos ni especificaciones de competidores directos.

## Limitaciones y advertencias

- Los resultados de benchmarks se presentan solo en imágenes; no hay cifras verificables en texto, lo que impide validar las afirmaciones de rendimiento.
- No se especifican los idiomas soportados ni la composición del corpus de entrenamiento, por lo que el rendimiento fuera del inglés (incluido el español) es incierto.
- Riesgo de alucinación inherente a los modelos generativos; el modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens de salida.
- El uso de `custom_code` implica que la carga del modelo requiere confiar en código remoto del repositorio; conviene auditar antes de desplegar en producción.
- No se documentan sesgos conocidos, datos de alineación (RLHF/DPO) ni evaluaciones de seguridad.
- Aunque la licencia MIT permite uso comercial sin restricciones, la ausencia de información sobre procedencia de datos puede plantear riesgos de cumplimiento en entornos regulados.
- El despliegue eficiente depende de infraestructura específica (SGLang HiCache + Mooncake); no se confirma compatibilidad con otros motores de inferencia populares.
- El tamaño del repo (255 GB) y los 124B de parámetros totales exigen planificación de almacenamiento y memoria considerable.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Organización en Hugging Face: https://huggingface.co/inclusionAI
- ModelScope: https://modelscope.cn/organization/inclusionAI
- OpenRouter (versión gratuita): https://openrouter.ai/inclusionai/ling-3.0-flash:free
