# kerzgrr/Tercet-R-1.1

## Resumen
Tercet-R-1.1 es un modelo de lenguaje de razonamiento y uso de herramientas (tool-use) de tamaño reducido, desarrollado por kerzgrr. Se trata de un checkpoint intermedio del entrenamiento de la línea Tercet-R, concretamente el último snapshot completo del stage-3 de SFT, publicado como actualización del modelo Tercet-R-1.0.

La arquitectura es híbrida y está basada en TinyGDN: combina capas Gated DeltaNet-2 (GDN-2) con capas de atención de consultas agrupadas (GQA), con 32 capas, 501.635.264 parámetros y una longitud de contexto de 16.384 tokens. Los pesos publicados están en bfloat16 bajo licencia Apache 2.0. El modelo está afinado para seguir instrucciones, razonar de forma explícita (modo think) y emitir llamadas a herramientas en formato JSON (SmolTalk), con herramientas integradas como búsqueda web, ejecución de Python y calculadora. Su relevancia radica en ofrecer estas capacidades en un paquete compacto, apto para entornos con recursos limitados y para investigación en arquitecturas híbridas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TinyGDN híbrida: 32 capas (GDN-2 ×3 + GQA cada 4ª capa), hidden 1.024, MLP SwiGLU 2.624, atención 8 Q / 2 KV con head dim 128 y RoPE parcial, Gated DeltaNet-2 con 8 cabezas × 128, vocabulario BPE 49.152 |
| Parámetros totales | 501.635.264 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantización | No disponible; pesos publicados en bfloat16 |
| Idiomas soportados | Inglés (etiqueta del modelo); la mezcla de datos incluye algunos recursos multilingües, pero el soporte oficial declarado es inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (bfloat16); librería tiny_gdn |

## Arquitectura y entrenamiento
La arquitectura es híbrida: la mayoría de las capas utilizan Gated DeltaNet-2, una variante de modelo de estado lineal recurrente, mientras que una de cada cuatro capas emplea atención con consultas agrupadas (GQA). Esto combina la eficiencia de las capas lineales con la capacidad de atención, manteniendo un coste computacional reducido. Se usa RoPE parcial y activación SwiGLU en el MLP. Esta configuración procede del modelo base Tercet-base, del cual Tercet-R-1.1 hereda todos los parámetros.

El entrenamiento se realizó en varias etapas:
- Base: preentrenamiento con HuggingFaceFW/fineweb-edu.
- SFT inicial: mid + instruct con HuggingFaceTB/smoltalk2, obteniendo un checkpoint instruct (EMA) al paso 5.000.
- Stage-3 SFT (este checkpoint): continuación sobre el instruct EMA al paso 5.000, con una mezcla multiturno de datasets como Nemotron PTD v1, Nemotron Agentic v1/v2 (incluye búsqueda web), Nemotron IF-Chat v1/v2, Cascade-2 instruction following, Toucan 1.5M, Hermes-3, Hermes reasoning tool-use, WildChat-4.8M, entre otros. Se usó secuencia de 16.384 tokens, AdamW con learning rate 3×10⁻⁵, y el checkpoint publicado corresponde al paso 5.300, tras ~27,5 horas y 602 millones de tokens de entrenamiento. Los pesos publicados son el promedio móvil exponencial (EMA). La pérdida de validación del EMA es 2.027 (perplejidad 7.59).

La innovación destacable incluye el contrato de chat con tokens de control de "thinking" (`<|think|>` y `<|no_think|>`) y el formato de tool calling en JSON estilo SmolTalk. El script de inferencia proporcionado permite la transmisión en tiempo real del bloque de razonamiento y la ejecución automática de herramientas como web-search (Tavily o DuckDuckGo + Wikipedia), stateful_python_code_exec y calculator.

## Capacidades
- Generación de texto y seguimiento de instrucciones: modelo causal instruct-tuned para conversación y tareas de instrucción.
- Razonamiento explícito (thinking mode): cada turno del asistente puede ir prefijado con el token `<|think|>`, produciendo una cadena de razonamiento entre `` antes de la respuesta final.
- Tool calling / function calling: admite llamadas a herramientas en formato JSON `<tool_call>...</tool_call>`, con esquema `{"name": ..., "arguments": {...}}`.
- Agentes y razonamiento multi-paso: combinación de modo think con tool calls y observaciones `<|tool_response|>`, lo que habilita flujos agénticos de varios pasos.
- Herramientas integradas: búsqueda web, ejecución de Python con estado (stateful_python_code_exec) y calculadora de expresiones matemáticas.
- Contexto largo de 16.384 tokens, capaz de mantener conversaciones multiturno.
- Idiomas: el modelo está etiquetado en inglés; la inclusión de aya_dataset en el entrenamiento sugiere cierta exposición multilingüe, pero no hay garantías de soporte fuera del inglés.
- No se especifican capacidades multimodales (visión, audio) ni decodificación especulativa.

## Casos de uso
- Asistentes de análisis y razonamiento en recursos limitados: gracias al modo think y al tamaño reducido, el modelo puede ejecutarse en una GPU de consumo para desglosar problemas antes de responder. Por ejemplo, para preguntas de matemáticas o lógica.
- Agentes de investigación con búsqueda web: integrado con la herramienta web-search, puede consultar fuentes externas, razonar sobre los resultados y devolver una respuesta. Es útil en prototipos de RAG ligera para periodistas o analistas.
- Asistente de código para entornos educativos: mediante stateful_python_code_exec, puede ejecutar código Python, mostrar la salida y explicarla paso a paso, siendo adecuado para tutorías interactivas.
- Chat de soporte técnico con contexto de 16.384 tokens: permite mantener conversaciones largas con historial, recordando instrucciones y detalles de la sesión sin perder el hilo.
- Extracción de información estructurada vía tool calls: el formato JSON de llamadas a funciones permite pedir al modelo que emita datos estructurados (nombres, fechas) que luego se validan en el backend, útil para formularios automatizados.
- Prototipos de agentes de cálculo: con la herramienta calculator, el modelo puede resolver expresiones numéricas complejas y usarlas en flujos de decisión, por ejemplo en herramientas de presupuestos o finanzas personales.
- Investigación en arquitecturas híbridas: al ser un modelo abierto, compacto y con una arquitectura GDN-2+GQA inusual, sirve como referencia reproducible para comparar rendimiento y coste de este tipo de diseños frente a transformers estándar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado por el autor durante el entrenamiento es la pérdida de validación del EMA:

| Métrica | Valor |
|---|---|
| Val loss (EMA) | 2.027 |
| Perplejidad | 7.59 |

Este valor no es comparable con benchmarks de tareas.

## Requisitos de hardware
- Tamaño de pesos: 501.635.264 parámetros en bfloat16, aproximadamente 1,0 GB en memoria/almacenamiento.
- VRAM estimada para inferencia: con bfloat16, los pesos requieren ~1 GB; sumando activaciones, KV cache y la carga adicional del framework, una GPU con 4-6 GB de VRAM debería ser suficiente para el contexto completo. Para contextos más cortos, incluso menos.
- GPU recomendadas: RTX 3060 12GB, RTX 4060 Ti, RTX 4090, A100 o H100. En CPU es funcional pero con mayor latencia.
- Despliegue: el autor proporciona un script `inference.py` que descarga los pesos, el tokenizador y la librería `tiny_gdn`, e instala `flash-linear-attention`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El uso previsto es mediante este script o directamente con Python.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
Se comparan los tres modelos de la línea Tercet que aparecen en la información, todos con la misma arquitectura y tamaño base.

| Modelo | Parámetros | Contexto | Rendimiento (publicado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tercet-base | 501.635.264 | 16.384 | No se han publicado benchmarks | Apache 2.0 | HuggingFace |
| Tercet-R-1.0 | 501.635.264 | 16.384 | No se han publicado benchmarks | Apache 2.0 | HuggingFace |
| Tercet-R-1.1 | 501.635.264 | 16.384 | Val loss 2.027 / ppl 7.59 (solo validación de entrenamiento) | Apache 2.0 | HuggingFace |

No se han publicado comparativas con modelos externos de la misma talla en la información disponible.

## Limitaciones y advertencias
- Es un checkpoint intermedio de un entrenamiento en curso, no una versión final estable. El stage-3 estaba aún en progreso cuando se publicó el repositorio.
- El contrato de chat depende de tokens de control específicos (`<|think|>`, `<|no_think|>`, `<|tool_response|>`) y del script `inference.py` del autor. Integraciones con otros frameworks requieren adaptación.
- La librería `tiny_gdn` y la dependencia `flash-linear-attention` no son estándar, lo que puede dificultar el despliegue en sistemas que no admitan instalaciones personalizadas.
- El modelo está etiquetado como inglés. Aunque el dataset `aya_dataset` introduce algo de multilingüismo, no se garantiza un rendimiento fiable fuera del inglés.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad. Al ser un modelo pequeño afinado sobre datos web y conversaciones, puede heredar sesgos y producir alucinaciones, especialmente en tareas de razonamiento complejo o hechos no verificables.
- El contexto máximo de 16.384 tokens es moderado frente a modelos modernos; para tareas que requieran documentos muy largos puede verse limitado.
- La elección del modo think o no-think es por turno y debe gestionarse en el prompt; si no se usa el prefijo correcto, el modelo puede comportarse de forma inconsistente.
- La licencia Apache 2.0 permite uso comercial sin restricciones, lo que evita problemas de licencia para producción.

## Enlaces
- Modelo: https://huggingface.co/kerzgrr/Tercet-R-1.1
- Versión anterior: https://huggingface.co/kerzgrr/Tercet-R-1.0
- Modelo base: https://huggingface.co/kerzgrr/Tercet-base
- Demo interactiva: https://huggingface.co/spaces/kerzgrr/tercet-r-1.1-demo
- Script de inferencia en el repositorio del modelo (enlace al archivo `inference.py` dentro del modelo); se accede desde la página del modelo en HuggingFace.
- No se han encontrado papers o blogs adicionales en la búsqueda web más allá de los enlaces anteriores.
