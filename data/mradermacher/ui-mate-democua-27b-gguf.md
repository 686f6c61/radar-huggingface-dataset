# mradermacher/UI-Mate-democua-27B-GGUF

## Resumen

UI-Mate-democua-27B es un modelo de lenguaje multimodal desarrollado por Tencent, diseñado específicamente para actuar como agente de uso de computadora (computer-use agent). El repositorio que nos ocupa es una cuantización GGUF realizada por mradermacher sobre el modelo base, con el objetivo de facilitar su ejecución en hardware local con recursos limitados. El modelo combina capacidades de visión y lenguaje para interpretar capturas de pantalla y generar acciones de control sobre interfaces gráficas, lo que lo hace relevante para la automatización de tareas de escritorio, navegación web y operación de aplicaciones mediante herramientas como PyAutoGUI.

Con aproximadamente 26,9 mil millones de parámetros, se sitúa en la gama de modelos grandes que requieren GPUs con suficiente memoria, aunque las cuantizaciones GGUF permiten reducir el consumo de VRAM. La licencia Apache-2.0 facilita su uso comercial y su integración en proyectos propietarios. La relevancia actual radica en el creciente interés por los agentes autónomos que interactúan con entornos gráficos, un campo donde este modelo aporta una solución de código abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Estáticos: f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (según comentarios del autor); además mmproj-Q8_0 y mmproj-f16 para el proyector multimodal |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (tencent/UI-Mate-democua-27B) en la documentación proporcionada. Por los tags asociados, se trata de un modelo multimodal que integra un codificador visual con un modelo de lenguaje, probablemente basado en una arquitectura transformer densa, aunque no se confirma. El entrenamiento tampoco está documentado en esta ficha; se desconoce el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO. El repositorio actual es una conversión a GGUF realizada por mradermacher, que no modifica los pesos originales sino que los empaqueta en formato cuantizado para inferencia eficiente.

## Capacidades

Según la información disponible en los tags y la model card, el modelo está orientado a:

- Agente de uso de computadora (computer-use agent): interpreta capturas de pantalla y genera comandos para controlar la interfaz gráfica.
- Agente GUI multimodal: combina visión y lenguaje para entender el estado de la pantalla y decidir acciones.
- Integración con PyAutoGUI: puede generar secuencias de acciones de teclado y ratón.
- Evaluación en entornos como OSWorld y WindowsAgentArena, lo que sugiere capacidad para operar en sistemas operativos reales.
- Aprendizaje guiado por demostraciones (demonstration-guided), lo que implica que puede seguir ejemplos de interacción.
- Soporte conversacional, aunque no se especifican detalles sobre tool calling o razonamiento multi-paso.

No se han confirmado capacidades específicas de generación de código, matemáticas o razonamiento avanzado más allá de su función principal como agente GUI.

## Casos de uso

- Automatización de tareas repetitivas en escritorio: el modelo puede observar la pantalla y ejecutar acciones como rellenar formularios, mover archivos o interactuar con aplicaciones, reduciendo la intervención manual.
- Pruebas de software y QA visual: al comprender capturas de pantalla, puede verificar que los elementos de la interfaz se comportan correctamente y reportar anomalías.
- Asistencia a personas con discapacidad: podría interpretar la interfaz y ejecutar comandos complejos a partir de instrucciones en lenguaje natural, facilitando el uso del ordenador.
- Automatización de flujos de trabajo en entornos Windows: gracias a su compatibilidad con WindowsAgentArena, puede operar aplicaciones nativas de Windows, como suites ofimáticas o herramientas de gestión.
- Navegación web autónoma: combinando visión y lenguaje, puede seguir instrucciones para buscar información, rellenar formularios web o extraer datos de páginas.
- Investigación en agentes multimodales: sirve como base para experimentos sobre interacción humano-computadora, aprendizaje por demostración y control de entornos virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estándar, ni comparaciones con modelos similares en tareas de agente GUI.

## Requisitos de hardware

- VRAM estimada: para una cuantización Q4_K_M, el modelo de 26,9B parámetros ocuparía aproximadamente 15-16 GB, por lo que se recomienda una GPU con al menos 16 GB de VRAM. Con cuantizaciones más agresivas (Q2_K) podría caber en 10-12 GB, aunque con pérdida de calidad.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o GPUs profesionales con suficiente memoria. En consumer, una RTX 3090 o 4090 sería adecuada para las cuantizaciones más bajas.
- Despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como vLLM (con adaptadores). También se puede usar con el proyector multimodal (mmproj) para entrada de imágenes.
- Latencia y throughput: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de agente GUI. No se conocen alternativas directas en el momento de redactar esta ficha, por lo que esta sección queda sin datos.

## Limitaciones y advertencias

- Al ser una cuantización, puede haber una ligera degradación en la calidad de las respuestas respecto al modelo original en precisión flotante.
- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas no está garantizado.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación en la interpretación de imágenes o en la generación de acciones incorrectas, especialmente en entornos no vistos durante el entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base por si hubiera restricciones adicionales.
- No se especifica la longitud de contexto, lo que limita la planificación de tareas largas o conversaciones extensas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UI-Mate-democua-27B-GGUF
- Modelo base: https://huggingface.co/tencent/UI-Mate-democua-27B
- Página de ayuda del autor para solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
