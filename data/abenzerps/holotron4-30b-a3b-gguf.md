# abenzerps/Holotron4-30B-A3B-GGUF

## Resumen

Holotron4-30B-A3B-GGUF es la colección de cuantizaciones en formato GGUF del modelo Hcompany/Holotron4-30B-A3B, publicada por el usuario abenzerps. Se trata de un modelo visión-lenguaje (con soporte adicional de audio mediante proyector multimodal) de arquitectura híbrida NemotronH con mezcla de expertos (MoE), diseñado específicamente para Computer Use, uso intensivo de herramientas y flujos de trabajo agénticos. Cuenta con 31.577.940.288 parámetros totales (el nombre comercial indica "30B-A3B", es decir, unos 3B activos por token).

El modelo parte del modelo base Nemotron 3 Nano Omni y ha sido ajustado por H Company para mejorar el rendimiento en entornos GUI, así como en escenarios con herramientas MCP, APIs y sandboxes de código. Según los benchmarks publicados por el autor del modelo original, Holotron4 mejora a su base en OSWorld (de 21,0 a 76,3), AutomationBench (de 19,4 a 35,6) y ALE Linux (de 0,6 a 8,5), lo que lo posiciona como una opción relevante para agentes que operan software real.

La relevancia de esta ficha concreta radica en que ofrece pesos cuantizados listos para ejecución local con llama.cpp: una versión Q4_0 de 18,0 GB y una Q8_0 de 33,6 GB, más un proyector multimodal F16 de 2,99 GB. Debido a las dimensiones intermedias del MoE (1856), las cuantizaciones K-quant estándar (Q4_K, Q6_K) provocan fallbacks internos en llama.cpp, por lo que el autor proporciona cuantizaciones de bloque limpio de 32 (Q4_0 y Q8_0) como alternativa óptima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida NemotronH (Mamba + transformer) con mezcla de expertos (MoE), visión-lenguaje |
| Parametros totales | 31.577.940.288 (≈31,58B) |
| Parametros activos | ≈3B (según nomenclatura "A3B"; no confirmado explícitamente en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q8_0 (F16 para el proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (license_name: nvidia-open-model-agreement) |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales de los ficheros publicados:

| Fichero | Cuantización | Tamaño | Notas |
|---|---|---:|---|
| Holotron4-30B-Q4_0.gguf | Q4_0 | 18,0 GB | Opción equilibrada recomendada por el autor |
| Holotron4-30B-Q8_0.gguf | Q8_0 | 33,6 GB | Referencia de alta precisión, casi sin pérdida |
| mmproj-Holotron4-30B-f16.gguf | F16 | 2,99 GB | Necesario para entrada de imagen y audio |

## Arquitectura y entrenamiento

La arquitectura es una variante híbrida NemotronH que combina capas Mamba (modelo de espacio de estados) con capas transformer bajo un esquema de mezcla de expertos. Esta combinación busca reducir el coste computacional en secuencias largas y, al mismo tiempo, mantener la calidad de atención de un transformer convencional. El modelo incorpora además un componente de visión y de audio, gestionado a través del proyector multimodal (mmproj) que se distribuye por separado en formato F16. Las dimensiones intermedias del MoE son de 1856, un valor que, según el autor de la cuantización, es incompatible con las K-quants estándar de llama.cpp y provoca fallbacks automáticos a tipos Q5/Q8.

En cuanto al entrenamiento, la información disponible solo indica que Holotron4-30B-A3B deriva del modelo Nemotron 3 Nano Omni y que H Company lo ha optimizado para flujos GUI y entornos con herramientas MCP, APIs o sandboxes de código. No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones internas adicionales (decodificación especulativa, atención lineal específica, etc.) más allá del propio diseño híbrido Mamba-MoE.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno.
- Computer Use: interacción con interfaces gráficas (GUI), control de escritorio y automatización de tareas visuales (evaluado en OSWorld y OSWorld 2.0).
- Uso de herramientas mediante MCP (Model Context Protocol) y APIs externas (evaluado en AutomationBench).
- Operación en terminal y entornos shell, incluyendo tareas de código en Linux (PinchBench y ALE).
- Generación y ejecución de código dentro de sandboxes.
- Capacidades agénticas multi-paso: planificación, ejecución de acciones y bucle de interacción con herramientas.
- Visión: comprensión de imágenes y capturas de pantalla (pipeline image-text-to-text).
- Audio: soportado mediante el proyector multimodal incluido (mmproj F16).
- Idiomas: no disponible en la información proporcionada.
- Modo de pensamiento explícito ("thinking mode"): no disponible en la información proporcionada.

## Casos de uso

- Agentes de Computer Use: automatización de flujos de trabajo en aplicaciones de escritorio mediante interpretación de capturas de pantalla y emisión de acciones sobre la GUI. El salto de 21,0 a 76,3 en OSWorld lo hace adecuado para tareas donde el agente debe navegar menús, rellenar formularios y manejar ventanas reales.
- Automatización de back-office con MCP: el modelo puede orquestar herramientas MCP y APIs para completar procesos administrativos (consulta de bases de datos, envío de correos, actualización de registros) gracias a su capacidad agéntica y a los resultados obtenidos en AutomationBench.
- Operación de terminal y DevOps: ejecución de comandos, diagnóstico de errores y tareas de mantenimiento en servidores Linux, apoyándose en el rendimiento en PinchBench (88,6) y ALE Linux (8,5) frente a modelos de terminal especializados.
- Testing automatizado de interfaces: el modelo puede recorrer una aplicación, interpretar sus pantallas mediante visión y detectar comportamientos inesperados, integrándose en pipelines de CI/CD como paso de validación de UI.
- Agentes de soporte técnico con acceso a herramientas: asistencia al usuario combinando conversación multi-turno con llamadas a APIs internas y ejecución de acciones (reinicio de servicios, apertura de tickets), siempre que la ventana de contexto del modelo sea suficiente para el histórico de la sesión.
- Análisis de capturas e imágenes técnicas: descripción y extracción de información de diagramas, paneles de control o documentos escaneados mediante el proyector multimodal F16.
- Ejecución local y en el borde: al distribuirse en GGUF, el modelo puede desplegarse en estaciones de trabajo con GPU de consumo (Q4_0) o en servidores sin conectividad externa, un requisito habitual en entornos corporativos regulados.
- Investigación en agentes híbridos: la combinación Mamba + MoE + visión lo convierte en una plataforma útil para estudiar el comportamiento de agentes que operan software real bajo distintas cuantizaciones.

## Benchmarks y rendimiento

Resultados publicados por el autor del modelo original (puntos porcentuales absolutos; comparación frente a Nemotron 3 Nano Omni):

| Benchmark | Interfaz | Nemotron 3 Nano Omni | Holotron4-30B-A3B | Ganancia |
|---|---|---:|---:|---:|
| OSWorld | GUI | 21,0 | 76,3 | +55,3 |
| OSWorld 2.0 | GUI y código | 0,2 | 7,9 | +7,7 |
| AutomationBench | MCP | 19,4 | 35,6 | +16,2 |
| PinchBench | Terminal | 84,7 | 88,6 | +3,9 |
| ALE (Linux, código) | Terminal | 0,6 | 8,5 | +7,9 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_0 (18,0 GB de pesos): aproximadamente 20-24 GB sumando caché KV y el proyector multimodal. Los valores concretos dependen de la longitud de contexto y del backend.
- VRAM estimada para inferencia con Q8_0 (33,6 GB de pesos): aproximadamente 36-40 GB o más, según contexto y proyector.
- GPU recomendadas: para Q4_0, tarjetas de 24 GB como RTX 3090 o RTX 4090; para Q8_0, GPU profesionales tipo A100 40/80 GB, H100 o L40S.
- Compatibilidad con GPU de consumo: sí, la versión Q4_0 encaja en GPUs de 24 GB, aunque con margen ajustado si se usa contexto largo. En GPUs de 16 GB o menos sería necesario recurrir a offload parcial a CPU o a memoria del sistema.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server), así como cualquier frontend compatible con GGUF (por ejemplo, Ollama o LM Studio). No se documenta soporte específico para vLLM o TGI en la información proporcionada.
- Throughput y latencia: no disponibles. No se han publicado mediciones de tokens por segundo en la información proporcionada.
- Ejemplo de ejecución documentado por el autor: `llama-cli -m Holotron4-30B-Q4_0.gguf -c 4096 -n 512 --temp 0.6 --top-p 0.95 --jinja --chat-template-file chat_template.jinja`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Holotron4-30B-A3B (esta ficha) | 31,58B totales / ~3B activos | no disponible | NVIDIA Open Model Agreement | GGUF (Q4_0, Q8_0) y proyector F16 en HuggingFace |
| Nemotron 3 Nano 30B-A3B (modelo base de la familia) | 30B-A3B (aprox.) | no disponible | no disponible en la información proporcionada | GGUF (unsloth/Nemotron-3-Nano-30B-A3B-GGUF) y safetensors |
| Holo4 35B-A3B (MoE de H Company) | 35B-A3B | no disponible | no disponible en la información proporcionada | Pesos abiertos según H Company y API de H Models |

No se dispone de datos comparativos de rendimiento directo entre estos tres modelos en benchmarks comunes dentro de la información proporcionada. La referencia más cercana es el propio modelo base Nemotron 3 Nano Omni, frente al cual se calculan las ganancias recogidas en la sección de benchmarks.

## Limitaciones y advertencias

- Licencia NVIDIA Open Model Agreement: es una licencia "other" con condiciones específicas. Antes de un uso comercial es imprescindible revisar el texto completo del acuerdo, ya que puede imponer restricciones de uso, obligaciones de atribución o límites de responsabilidad.
- La cuantización GGUF puede degradar ligeramente la calidad frente a los pesos originales. El autor recomienda Q4_0 como equilibrio y Q8_0 como referencia casi sin pérdida, pero no hay comparativa oficial contra el modelo sin cuantizar.
- Las cuantizaciones K-quant convencionales (Q4_K, Q6_K) no funcionan correctamente con este modelo debido a las dimensiones intermedias del MoE (1856), que activan fallbacks internos a Q5/Q8 en llama.cpp.
- No se han publicado los idiomas soportados, por lo que el comportamiento multilingüe (especialmente en castellano) no está verificado.
- La longitud de contexto del modelo no está documentada; debe comprobarse experimentalmente antes de fijar configuraciones de producción.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento multi-paso o cuando el agente interpreta capturas de pantalla ambiguas.
- Los agentes de Computer Use pueden ejecutar acciones destructivas sobre el sistema (borrado de ficheros, cambios de configuración, envío de datos). Se recomienda ejecutarlos en entornos aislados o con sandbox y confirmación humana en acciones críticas.
- El repositorio tiene 0 descargas y 0 "likes" en la fecha de consulta, por lo que no cuenta con validación de la comunidad ni con informes independientes de calidad.
- El modelo base es un ajuste de Nemotron 3 Nano Omni; los sesgos y limitaciones de ese modelo pueden heredarse en Holotron4 y, a su vez, trasladarse a las cuantizaciones.
- Cualquier uso en producción debería incluir evaluación propia sobre la tarea objetivo, ya que los benchmarks publicados (OSWorld, AutomationBench, PinchBench, ALE) no cubren dominios generales de texto.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/abenzerps/Holotron4-30B-A3B-GGUF
- Modelo base: https://huggingface.co/Hcompany/Holotron4-30B-A3B
- Revisión de la plantilla de chat: https://huggingface.co/Hcompany/Holotron4-30B-A3B/commit/52184310f6c916e5e7d4b8f055af49fc41642574
- Blog de H Company sobre la familia Holo4: https://huggingface.co/blog/Hcompany/holo4
- Cobertura en Unite.AI: https://www.unite.ai/h-company-releases-holo4-open-weight-models-for-computer-use-agents/
- Cuantizaciones GGUF del modelo base Nemotron 3 Nano 30B-A3B (unsloth): https://huggingface.co/unsloth/Nemotron-3-Nano-30B-A3B-GGUF
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Fichero de checksums (SHA256SUMS): incluido en el repositorio del modelo GGUF
