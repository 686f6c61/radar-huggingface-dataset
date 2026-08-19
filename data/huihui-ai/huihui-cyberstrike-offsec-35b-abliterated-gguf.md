# huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF

## Resumen

Huihui-CyberStrike-OffSec-35B-abliterated-GGUF es una versión sin censura (abliterated) del modelo CyberStrike-OffSec-35B, creada por huihui-ai mediante la técnica de abliteración, que elimina los mecanismos de rechazo y filtrado de contenido del modelo original. El modelo base, desarrollado por oyildirim, está especializado en seguridad ofensiva y pentesting, con capacidades de razonamiento sobre vulnerabilidades, técnicas de ataque y orquestación de herramientas. Esta variante en formato GGUF está pensada para su ejecución local con llama.cpp, y conserva la licencia Apache-2.0 del modelo original.

El modelo se presenta como una herramienta para profesionales de la seguridad que necesitan un asistente sin restricciones de contenido para tareas de auditoría y pruebas de penetración. Al estar basado en la arquitectura Qwen3 (según las etiquetas), hereda capacidades de razonamiento avanzado y soporte de tool calling, aunque no se especifican los parámetros exactos ni la longitud de contexto en la información disponible. Su relevancia radica en la demanda de modelos especializados en ciberseguridad que puedan operar sin filtros en entornos controlados de investigación.

Es importante señalar que esta versión abliterated elimina los mecanismos de seguridad del modelo original, lo que implica riesgos significativos de generar contenido inapropiado, sensible o potencialmente dañino. Su uso debe limitarse a entornos de investigación y pruebas controladas, con supervisión humana y cumplimiento estricto de las leyes aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (según etiquetas, no confirmado) |
| Parametros totales | 35 mil millones (según el nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se sugiere 262144 en el ejemplo de llama.cpp, pero no se confirma) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K en el ejemplo; otras cuantizaciones no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo. Por el nombre y las etiquetas, se trata de un modelo de 35 mil millones de parámetros basado en Qwen3, que es una familia de modelos transformer con atención causal estándar y soporte para tool calling. El modelo original CyberStrike-OffSec-35B fue entrenado o afinado específicamente para tareas de seguridad ofensiva, incluyendo pentesting, análisis de vulnerabilidades y orquestación de herramientas. La versión abliterated se creó aplicando la técnica de abliteración, que identifica y elimina las direcciones de los mecanismos de rechazo en el espacio de activaciones del modelo, sin necesidad de reentrenamiento completo. El proceso se realizó con la herramienta remove-refusals-with-transformers, descrita por el autor como una implementación "cruda" y "prueba de concepto". No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto especializada en seguridad ofensiva: el modelo está diseñado para responder a consultas sobre técnicas de pentesting, análisis de vulnerabilidades y metodologías de ataque.
- Soporte de tool calling: según las etiquetas, el modelo incluye capacidades de llamada a herramientas, lo que permite su integración en flujos de automatización de pruebas de seguridad.
- Razonamiento multi-paso: al estar basado en Qwen3, se espera que herede capacidades de razonamiento encadenado y resolución de problemas complejos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Sin filtros de contenido: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede generar respuestas que otros modelos se negarían a dar, incluyendo contenido sensible o controvertido.
- Modo de pensamiento (thinking mode): no confirmado, aunque Qwen3 suele incluir esta funcionalidad en algunas variantes.

## Casos de uso

- Pruebas de penetración en entornos controlados: el modelo puede asistir a auditores de seguridad en la planificación y ejecución de pruebas de intrusión, sugiriendo vectores de ataque y comandos relevantes para sistemas autorizados.
- Análisis de vulnerabilidades en código fuente: gracias a su especialización en seguridad, puede revisar fragmentos de código para identificar posibles fallos de inyección, desbordamiento de búfer o configuraciones inseguras.
- Redacción de informes técnicos de seguridad: puede generar documentación detallada sobre hallazgos, metodologías y recomendaciones de mitigación, adaptada a un público técnico.
- Entrenamiento y simulación de ataques: en programas de formación de personal de seguridad, el modelo puede simular escenarios de ataque realistas para practicar la detección y respuesta.
- Investigación académica en ciberseguridad: los investigadores pueden utilizarlo para explorar técnicas ofensivas emergentes o generar datasets sintéticos de tráfico malicioso.
- Integración en plataformas de orquestación de seguridad: gracias al tool calling, puede conectarse a herramientas como Metasploit o Nmap para automatizar pasos de reconocimiento y explotación en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del repo (186 GB) sugiere que se incluyen múltiples cuantizaciones. Para la cuantización Q4_K, se estima un consumo de VRAM de aproximadamente 20-25 GB, lo que requeriría una GPU con al menos 24 GB (por ejemplo, RTX 3090/4090) para inferencia local.
- GPU recomendadas: para la cuantización completa o de alta precisión, se necesitarían GPUs profesionales como A100 (40/80 GB) o H100. Para cuantizaciones más bajas (Q4_K o Q5_K), una RTX 4090 (24 GB) sería suficiente.
- Compatibilidad con GPU de consumo: sí, con cuantizaciones Q4_K o inferiores, el modelo puede ejecutarse en GPUs de consumo con 24 GB de VRAM, aunque con limitaciones de velocidad.
- Opciones de despliegue: llama.cpp es la opción principal (como se muestra en el ejemplo). También es compatible con servidores que soporten GGUF, como Ollama o text-generation-webui. Para despliegues más ligeros, se puede usar vLLM si se convierte a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de seguridad ofensiva. El modelo base CyberStrike-OffSec-35B es relativamente nuevo y no hay benchmarks públicos que permitan compararlo con alternativas como PentestGPT o modelos generalistas afinados para seguridad. La abliteración elimina los filtros, pero no mejora el rendimiento técnico. Se recomienda evaluar el modelo en tareas específicas de pentesting antes de decidir su uso frente a otras opciones.

## Limitaciones y advertencias

- Riesgo de contenido sensible o controvertido: al eliminar los filtros de seguridad, el modelo puede generar instrucciones detalladas para actividades ilegales, malware o técnicas de explotación no autorizadas. Su uso debe limitarse a entornos legales y autorizados.
- Sesgos y alucinaciones: no se ha evaluado el modelo en este aspecto. Como cualquier LLM, puede inventar información o mostrar sesgos en sus respuestas, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: no se especifican, pero al ser una versión abliterated, es probable que el rendimiento en tareas no relacionadas con seguridad sea inferior al de modelos generalistas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso del modelo conlleva responsabilidades legales y éticas. El autor advierte que no se hace responsable de las consecuencias de su uso.
- Adecuación para producción: no se recomienda su uso en aplicaciones comerciales o públicas sin supervisión humana y controles de contenido adicionales.
- Naturaleza experimental: la abliteración se describe como una "prueba de concepto" y puede afectar negativamente a la coherencia o calidad de las respuestas en comparación con el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF
- Modelo base: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Herramienta de abliteración: https://github.com/Sumandora/remove-refusals-with-transformers
- Proyecto CyberStrike (relacionado): https://github.com/CyberStrikeus/cyberstrike
