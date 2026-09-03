# Aapolon/Qwen3.8-9B-Distill-Uncensored-Heretic-CyberStrike-GGUF

## Resumen

El modelo `Aapolon/Qwen3.8-9B-Distill-Uncensored-Heretic-CyberStrike-GGUF` es una adaptación en formato GGUF de un modelo de lenguaje de 9.197 millones de parámetros, desarrollado por Aapolon. Se trata de un fine-tuning supervisado (SFT) del modelo base `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic`, entrenado con el dataset `oyildirim/cyberstrike-sft-120k`, compuesto por 120.000 ejemplos orientados a tareas de ciberseguridad ofensiva. El modelo está diseñado para integrarse con el framework CyberStrike, una plataforma de evaluación de seguridad y pruebas de penetración.

La relevancia de este modelo radica en su especialización en seguridad ofensiva, un dominio donde los modelos genéricos suelen carecer de precisión. Al estar publicado bajo licencia Apache 2.0, permite su uso comercial y modificación, aunque con restricciones éticas explícitas en su documentación. La arquitectura subyacente no se especifica en la información disponible, pero al derivar de un modelo Qwen destilado, se presume una arquitectura transformer estándar. La longitud de contexto y los idiomas soportados no han sido declarados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, cuantizaciones no listadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo. El nombre sugiere que es una destilación de un modelo Qwen de 9B parámetros, pero no se confirma la arquitectura exacta (número de capas, dimensiones, tipo de atención, etc.). El entrenamiento consiste en un fine-tuning supervisado sobre el dataset CyberStrike SFT de 120.000 ejemplos, que probablemente contiene instrucciones y respuestas relacionadas con análisis de vulnerabilidades, explotación de sistemas y reportes de seguridad. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. El modelo base `petruhonk/Qwen3.8-9B-Distill-uncensored-heretic` ya incorpora la etiqueta "uncensored" (sin censura), lo que indica que se ha eliminado parte del filtrado de contenido habitual, y el fine-tuning posterior refuerza su orientación a ciberseguridad.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está optimizado para mantener diálogos multi-turno.
- Especialización en ciberseguridad ofensiva: según la documentación, está diseñado para evaluaciones de seguridad autorizadas, incluyendo análisis de vulnerabilidades y pruebas de penetración.
- Integración con el framework CyberStrike: el modelo se distribuye como componente de una plataforma más amplia que orquesta tareas de seguridad.
- Sin censura de contenido: al ser "uncensored", puede generar respuestas que otros modelos rechazarían, lo que es útil en contextos de seguridad pero también conlleva riesgos.
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio. Tampoco se detalla el soporte multilingüe.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede asistir a profesionales de seguridad en la identificación de vectores de ataque, generando comandos y exploits de prueba dentro de entornos controlados y con permiso explícito.
- Análisis de vulnerabilidades en código: dado su entrenamiento en ciberseguridad, puede revisar fragmentos de código para detectar fallos comunes como inyección SQL, desbordamiento de búfer o configuraciones inseguras.
- Generación de informes de seguridad: puede redactar reportes técnicos detallados sobre hallazgos, incluyendo descripciones de impacto y recomendaciones de mitigación, a partir de datos de escaneo.
- Simulación de ataques para formación: en programas de capacitación de equipos de seguridad, el modelo puede generar escenarios de ataque realistas para ejercicios de respuesta a incidentes.
- Automatización de tareas de reconocimiento: integrado en el framework CyberStrike, puede ayudar a enumerar servicios, identificar versiones de software y sugerir pasos siguientes en una evaluación.
- Investigación en seguridad ofensiva: investigadores académicos pueden usarlo para explorar técnicas de ataque y desarrollar contramedidas, siempre dentro de marcos legales y éticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- Al ser un modelo GGUF de aproximadamente 9.2B parámetros, el tamaño del repositorio es de 5.8 GB, lo que sugiere cuantizaciones de baja precisión (posiblemente Q4 o Q5).
- Para inferencia en GPU, se estima que una cuantización Q4_K_M requiere alrededor de 5-6 GB de VRAM, por lo que cabría en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores.
- En CPU, se puede ejecutar con llama.cpp u Ollama, aunque la velocidad será menor. Se recomienda al menos 16 GB de RAM para cargar el modelo completo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a otro formato), TGI (si se usa con backends compatibles). El tag `endpoints_compatible` sugiere que puede servir a través de API.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de ciberseguridad ofensiva de ~9B). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Uso restringido: la model card establece que solo debe utilizarse en evaluaciones de seguridad autorizadas, cumpliendo todas las leyes aplicables y siguiendo prácticas de divulgación responsable. Su uso para atacar sistemas sin autorización está explícitamente prohibido.
- Riesgo de contenido dañino: al ser un modelo "uncensored", puede generar instrucciones peligrosas, exploits o malware si se usa de forma inapropiada. Esto supone un riesgo legal y ético significativo.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en dominios técnicos complejos.
- Limitaciones de contexto e idioma: al no especificarse la longitud de contexto ni los idiomas soportados, no se garantiza un rendimiento óptimo en tareas que requieran ventanas largas o idiomas distintos del inglés.
- Licencia: aunque es Apache 2.0, las restricciones de uso de la model card pueden limitar su aplicación comercial en ciertos sectores. Se recomienda revisar los términos del framework CyberStrike antes de su integración.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Aapolon/Qwen3.8-9B-Distill-Uncensored-Heretic-CyberStrike-GGUF)
- [Modelo base](https://huggingface.co/petruhonk/Qwen3.8-9B-Distill-uncensored-heretic)
- [Dataset CyberStrike SFT](https://huggingface.co/datasets/oyildirim/cyberstrike-sft-120k)
- [Framework CyberStrike](https://cyberstrike.io)
- [Repositorio GitHub de CyberStrike](https://github.com/CyberStrikeus/CyberStrike)
