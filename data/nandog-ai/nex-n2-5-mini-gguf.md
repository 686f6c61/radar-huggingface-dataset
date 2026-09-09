# NandoG-AI/Nex-N2.5-mini-GGUF

## Resumen

Nex-N2.5-mini es un modelo de lenguaje multimodal de la familia Nex-N2.5, desarrollado por Nex-AGI, orientado a tareas agénticas de largo horizonte y ejecución de tareas en el mundo real. Este repositorio contiene las cuantizaciones GGUF preparadas por NandoG-AI para su ejecución en llama.cpp y entornos compatibles, como LM Studio, Open WebUI y KoboldCpp. El modelo utiliza una arquitectura Qwen3.5 MoE con 35.000 millones de parámetros y una ventana de contexto nativa de 262.144 tokens (256K), lo que lo hace adecuado para procesar documentos extensos, repositorios de código y conversaciones largas. Además, incorpora soporte multimodal de visión mediante un proyector separado, y está diseñado para razonar, llamar a herramientas y trabajar de forma autónoma en flujos de varios pasos. Su relevancia actual radica en la creciente demanda de modelos locales capaces de ejecutar tareas agénticas complejas sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector de visión mmproj en F16) |

## Arquitectura y entrenamiento

El modelo base, nex-agi/Nex-N2.5-mini, emplea una arquitectura de mezcla de expertos (MoE) basada en Qwen3.5. El total de parámetros es de 35.000 millones, aunque no se especifica la cantidad de parámetros activos por token. La ventana de contexto nativa alcanza los 262.144 tokens (256K), lo que permite manejar contextos muy extensos de forma eficiente. El modelo es multimodal, ya que incorpora un proyector de visión en formato GGUF (mmproj-Nex-N2.5-mini-F16.gguf) que permite procesar imágenes junto con el texto; este proyector es opcional para el uso exclusivo de texto. La información sobre los datos de entrenamiento, la composición del dataset y la aplicación de técnicas de alineación como RLHF o DPO no está disponible en la documentación proporcionada. Como innovación técnica, el modelo integra modos de razonamiento configurables (none, medium, high) y está optimizado para el uso de herramientas, la verificación de resultados y la autocorrección en flujos agénticos, lo que lo diferencia de los modelos de chat tradicionales.

## Capacidades

- Generación de texto y conversación en inglés.
- Razonamiento en tres modos: ninguno, medio y alto.
- Llamada a herramientas (tool calling) para integrarse con APIs y funciones externas.
- Trabajo agéntico: interacción con entornos, verificación de resultados y autocorrección.
- Comprensión multimodal de imágenes mediante el proyector de visión.
- Generación y comprensión de código, orientado a la ingeniería de software.
- Procesamiento de contextos largos de hasta 262.144 tokens.
- Compatibilidad con servidores que implementan la API de OpenAI mediante llama.cpp.
- Despliegue local en llama.cpp, LM Studio, Open WebUI y KoboldCpp.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar código, revisar parches y explicar fragmentos complejos. Su ventana de contexto de 256K permite cargar repositorios completos y mantener el historial de cambios sin perder información.
- Agentes autónomos en navegador: gracias al soporte de tool calling y al razonamiento agéntico, puede planificar y ejecutar tareas web como rellenar formularios, extraer datos o navegar por páginas, verificando los resultados en cada paso.
- Automatización de escritorio (computer use): puede controlar aplicaciones y ejecutar flujos de trabajo de varios pasos en un sistema operativo, corrigiendo errores sobre la marcha gracias a su capacidad de razonamiento y verificación.
- Análisis de documentos largos: con 262K de contexto, es adecuado para resumir contratos, informes técnicos o artículos de investigación extensos, así como para responder preguntas sobre el contenido completo.
- Asistencia multimodal: al incorporar el proyector de visión, puede interpretar capturas de pantalla, diagramas o documentos escaneados y responder preguntas sobre ellos, combinando información visual y textual.
- Investigación y trabajo de conocimiento: puede realizar búsquedas, comparar fuentes y sintetizar conclusiones en un entorno agéntico, integrando herramientas externas para obtener datos actualizados.
- Backend de chatbots de atención al cliente: al exponerse como servidor compatible con OpenAI, puede integrarse en sistemas de soporte y utilizar llamadas a herramientas para consultar bases de datos, gestionar pedidos o resolver incidencias de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para la cuantización Q4_K_M se necesitan aproximadamente entre 20 y 24 GB de VRAM; para Q8_0, alrededor de 35 GB. Estas cifras son estimaciones orientativas y dependen del tamaño del contexto y del número de tokens procesados.
- GPU recomendadas: para ejecutar Q4_K_M con un contexto amplio se recomienda una GPU con 24 GB de VRAM, como una RTX 4090 o una A10G. Para Q8_0 o contextos cercanos a 256K se necesitan GPUs de mayor capacidad, como A100 80GB o H100.
- El modelo puede ejecutarse en hardware de consumo con la cuantización Q4_K_M, siempre que la VRAM sea suficiente y se ajuste la longitud del contexto.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), LM Studio, Open WebUI y KoboldCpp.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para establecer una comparación con modelos alternativos. El modelo original, nex-agi/Nex-N2.5-mini, presenta las mismas especificaciones técnicas. La familia Nex-N2.5 incluye además las variantes Pro y Max, de las que no se aportan datos en este repositorio.

## Limitaciones y advertencias

- El modelo solo está documentado para el idioma inglés, lo que limita su uso en tareas multilingües.
- No se ha proporcionado información sobre sesgos conocidos, por lo que se desconocen los riesgos específicos en este ámbito.
- Como todo modelo generativo, existe riesgo de alucinación; sus respuestas deben ser verificadas especialmente en entornos agénticos donde las acciones pueden tener consecuencias reales.
- La ventana de contexto máxima de 256K requiere gestionar la memoria de manera eficiente; usar contextos muy largos puede aumentar considerablemente el consumo de VRAM y la latencia.
- Aunque la licencia Apache 2.0 permite uso comercial, la integración en productos conlleva la responsabilidad de cumplir los términos de la licencia y de evaluar el comportamiento del modelo en el dominio concreto.
- La cuantización puede degradar ligeramente la calidad de las respuestas en comparación con el modelo original en precisión completa, especialmente en las cuantizaciones más agresivas como Q2_K o Q3_K_M.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/NandoG-AI/Nex-N2.5-mini-GGUF
- Modelo original: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Sitio web de Nex-AGI: https://nex-agi.com
- Página en OpenRouter: https://openrouter.ai/nex-agi/nex-n2.5-mini
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
