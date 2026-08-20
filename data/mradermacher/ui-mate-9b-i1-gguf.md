# mradermacher/UI-Mate-9B-i1-GGUF

## Resumen

UI-Mate-9B-i1-GGUF es una cuantización en formato GGUF del modelo multimodal UI-Mate-9B desarrollado por Tencent. Se trata de un modelo de visión y lenguaje (VLM) diseñado específicamente para actuar como agente de interfaz gráfica de usuario (GUI), capaz de interpretar capturas de pantalla y generar acciones para controlar aplicaciones de escritorio. El modelo original de Tencent no se ha publicado como modelo abierto, pero su cuantización por mradermacher permite ejecutarlo en hardware de consumo mediante llama.cpp u otros runners compatibles con GGUF.

La relevancia de este modelo radica en la creciente demanda de agentes autónomos que operen ordenadores como lo haría un humano: viendo la pantalla, decidiendo qué hacer y ejecutando acciones (clics, teclado, etc.). UI-Mate-9B está orientado a benchmarks de referencia como OSWorld y WindowsAgentArena, y su licencia Apache 2.0 permite uso comercial sin restricciones. El formato GGUF facilita su despliegue en entornos con recursos limitados, aunque al ser un modelo multimodal requiere también el proyecto de visión (mmproj) que se distribuye en el repositorio estático.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) y soporta únicamente inglés según la model card. La cuantización ofrecida incluye múltiples niveles de precisión (desde Q2_K hasta Q6_K) y un archivo imatrix para generar cuantizaciones propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de visión y lenguaje) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio original de Tencent) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo original (número de capas, tipo de atención, visión, etc.) en la model card de la cuantización. Los metadatos indican que es un modelo de visión y lenguaje (VLM) diseñado para agentes de GUI, con capacidades para interpretar capturas de pantalla y generar acciones de bajo nivel (como coordenadas de clic o pulsaciones de teclado). El modelo original de Tencent no ha publicado su paper ni detalles de entrenamiento en la información disponible.

La cuantización realizada por mradermacher utiliza el proceso de imatrix (importance matrix) para optimizar la calidad de las cuantizaciones de baja precisión. El repositorio incluye un archivo imatrix de 0.1 GB que permite a los usuarios generar sus propias cuantizaciones con herramientas como llama.cpp.

## Capacidades

- Interacción con interfaces gráficas de usuario: el modelo es capaz de analizar una captura de pantalla y decidir qué acción ejecutar (clic, tecleo, arrastre, etc.).
- Generación de acciones de bajo nivel: soporta formatos compatibles con pyautogui y similares, produciendo comandos concretos para controlar el ratón y el teclado.
- Razonamiento multimodal: combina la comprensión visual con el razonamiento textual para resolver tareas complejas en entornos de escritorio.
- Multilingüe: solo inglés (según la model card).
- Soporte de herramientas: los tags sugieren integración con agentes de GUI como OSWorld y WindowsWorldArena, lo que implica capacidad de seguir instrucciones en formato de acción.
- No se han documentado capacidades de tool calling estándar (funciones API) ni de modo de pensamiento explícito.

## Casos de uso

- Automatización de tareas de escritorio: el modelo puede controlar aplicaciones como navegadores, editores de texto o herramientas de ofimática mediante capturas de pantalla y acciones de GUI, útil para procesos de trabajo repetitivos o para usuarios con movilidad reducida.
- Testing de aplicaciones GUI: permite generar pruebas de regresión automáticas que interactúan con la interfaz como un usuario real, capturando pantallas y ejecutando clics y teclados en entornos de integración continua.
- Asistentes de asistencia remota: un sistema que observe la pantalla de un usuario y sugiera o ejecute acciones para resolver problemas técnicos (por ejemplo, en centros de soporte).
- Automatización de tareas de datos: extracción de información de aplicaciones heredadas sin API, simulando la interacción humana con formularios y tablas.
- Robótica de software (RPA): sustitución de flujos RPA tradicionales basados en reglas por un agente flexible que aprende a interactuar con nuevas aplicaciones sin programación específica.
- Investigación en agentes de GUI: como modelo de referencia para evaluar técnicas de aprendizaje por refuerzo o de planificación en entornos como OSWorld, dado su tamaño reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantización Q4_K_M (aprox. 5.5-6 GB de pesos), se necesitan al menos 8 GB de VRAM en una GPU de consumo. Con cuantizaciones más agresivas (Q2_K, IQ2_M) el requisito baja a ~3-4 GB, pero la calidad se degrada notablemente.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB o superiores. Para el modelo completo sin cuantizar (safetensors) se necesitan ~18 GB, lo que solo es viable en GPUs profesionales (A100, H100) o en CPU con mucha RAM.
- Sí cabe en GPU de consumo: las cuantizaciones GGUF permiten ejecutarlo en tarjetas con 6-8 GB de VRAM, como RTX 3060 o RTX 4060.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (llama.cpp backend). Para el uso como agente de GUI, se requiere además el archivo mmproj del modelo de visión y un runner que soporte multimodales (llama.cpp lo soporta).
- Latencia y throughput: no disponibles. Dependen de la cuantización y la GPU; en una RTX 4090, un modelo 9B Q4 puede generar entre 20 y 40 tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Mate-9B (original) | 8.95B | no disponible | Sí | Apache 2.0 | Safetensors en HuggingFace |
| UI-Mate-9B-i1-GGUF (este) | 8.95B | no disponible | Sí (con mmproj) | Apache 2.0 | GGUF en HuggingFace |
| ShowUI (2B) | 2B | no disponible | Sí | MIT | Safetensors |
| OS-Atlas (7B) | 7B | no disponible | Sí | no disponible | Safetensors |

No hay datos públicos de benchmarks que permitan comparar el rendimiento con estos modelos. La comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Solo soporta inglés: la model card indica `language: en`, por lo que no es adecuado para tareas en otros idiomas.
- Riesgo de alucinación en acciones de GUI: como modelo generativo, puede producir acciones incorrectas o peligrosas (por ejemplo, hacer clic en lugares equivocados) si no se supervisa. En entornos de producción es obligatorio validar las acciones antes de ejecutarlas.
- Sin información sobre sesgos o riesgos específicos: no se han publicado estudios de sesgo del modelo original.
- Dependencia del archivo mmproj: para funcionar como VLM es imprescindible usar el archivo de visión (mmproj) del repositorio estático, que no se incluye en este repo.
- Calidad de la cuantización: las cuantizaciones de baja precisión (Q2, IQ1) pueden degradar significativamente la capacidad del modelo para interpretar imágenes, lo que afecta a las tareas de GUI.
- Limitación de contexto: al no disponer de la longitud de contexto, se recomienda probar con ventanas pequeñas (512-1024 tokens) para evitar errores de memoria.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/UI-Mate-9B-i1-GGUF
- Repositorio estático con los archivos de visión: https://huggingface.co/mradermacher/UI-Mate-9B-GGUF
- Modelo original de Tencent: https://huggingface.co/tencent/UI-Mate-9B
- Página de descarga del modelo: https://hf.tst.eu/model#UI-Mate-9B-i1-GGUF
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
