# DICPlay/RusMind-4.6.5-Momentum

## Resumen

RusMind 4.6.5 · Моментум (Momentum) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, un equipo ruso centrado en modelos para el idioma ruso. Es un fine-tune del modelo base google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos ligeros diseñados para ejecución en dispositivo (on-device) sin conexión a internet.

El modelo se distribuye exclusivamente en formato GGUF, orientado a su uso con llama.cpp, Ollama y LM Studio, y está pensado para funcionar en portátiles, ordenadores de sobremesa convencionales e incluso teléfonos, además de en el navegador. Su enfoque principal es el rendimiento en ruso, con soporte secundario de inglés, y su relevancia actual reside en que, según la model card, encabeza el benchmark MERA v2 entre modelos de hasta 5.000 millones de parámetros, superando a alternativas de mayor tamaño activo.

La versión 4.6.5 introduce mejoras en seguimiento de instrucciones complejas, razonamiento lógico, invocación de funciones, ortografía y puntuación en ruso, y conocimiento de historia de Rusia. El autor recomienda migrar a la versión posterior 4.7 · Моментум, que según la model card obtiene 0,136 en MERA v2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no detalladas en la información disponible) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other, con enlace a LICENSE en el repositorio) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts (MoE) heredada de google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones activos durante la inferencia. Esta configuración permite que el coste computacional por token sea mucho menor que el de un modelo denso del mismo tamaño total, lo que explica su viabilidad en dispositivos de consumo y en el navegador. El modelo es un fine-tune del base Gemma 4 E2B-it, no un entrenamiento desde cero.

La model card indica que el entrenamiento se orientó a mejorar el seguimiento de instrucciones complejas con múltiples requisitos (afirma una mejora de 3,3 veces en precisión frente a versiones anteriores), el razonamiento lógico, la invocación de funciones, la ortografía y puntuación en ruso, y el conocimiento de historia de Rusia. No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento lógico y resolución de tareas de razonamiento de múltiples pasos.
- Seguimiento de instrucciones complejas con varios requisitos simultáneos.
- Invocación de funciones y herramientas (tool calling / function calling).
- Generación de código, con rendimiento descrito como estable según pruebas de terceros.
- Corrección de ortografía y puntuación en ruso (mejor resultado de la familia según la model card).
- Conocimiento de historia de Rusia: eventos clave, fechas y personalidades.
- Comprensión de matices de cortesía en japonés según un canal independiente citado (capacidad no listada como idioma oficial del modelo).
- Ejecución en dispositivo y sin conexión (on-device, offline), incluido el navegador.
- Compatibilidad con endpoints (tag endpoints_compatible) y uso conversacional.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede gestionar diálogos multi-turno con un consumo de recursos reducido gracias a sus 2.000 millones de parámetros activos, lo que permite desplegarlo en infraestructura modesta o directamente en el dispositivo del usuario.
- Aplicaciones de escritorio y móviles sin conexión: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, puede integrarse en aplicaciones que requieren privacidad total, sin enviar datos a servidores externos.
- Procesamiento de documentos y corrección de texto en ruso: su especialización en ortografía y puntuación lo hace adecuado para tareas de revisión y normalización de textos en entornos editoriales o administrativos.
- Automatización con herramientas y agentes: el soporte de function calling permite construir flujos que consulten APIs, bases de datos o servicios internos, con el modelo decidiendo qué función invocar en cada paso.
- Asistencia educativa sobre historia y cultura de Rusia: puede emplearse en aplicaciones de estudio que requieran respuestas sobre eventos, fechas y figuras históricas, un área reforzada explícitamente durante el ajuste.
- Generación de código en entornos con recursos limitados: útil para autocompletado o generación de fragmentos en IDE que se ejecutan localmente, sin depender de servicios en la nube.
- Prototipado rápido y demos en navegador: su tamaño activo reducido permite ejecutarlo en el navegador, lo que facilita demos interactivas y pruebas de concepto sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

La model card proporciona datos del benchmark MERA v2, aunque la tabla numérica detallada corresponde a otras versiones de la familia (4.7). Los datos disponibles para 4.6.5 son los siguientes:

| Benchmark | Resultado |
|---|---|
| MERA v2 (posición) | N.º 1 entre modelos de hasta 5.000 millones de parámetros (según model card) |
| MERA v2 (mejora vs. 4.5.5) | +8 % en puntuación |
| MERA v2 (mejora vs. modelo abierto base del mismo tamaño) | +30 % en puntuación |
| Instrucciones complejas | 3,3 veces más preciso que la versión anterior |
| Ortografía y puntuación en ruso | Mejor de la familia (sin cifra concreta para 4.6.5) |

No se han publicado en la información disponible puntuaciones numéricas concretas de MMLU, HumanEval, GSM8K ni del valor exacto de MERA v2 para esta versión concreta.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta; el repositorio ocupa 20,2 GB, lo que sugiere múltiples cuantizaciones GGUF. Una cuantización Q4 de un modelo de 4,65 mil millones de parámetros suele requerir del orden de 3-4 GB, aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por su diseño on-device, está pensado para ejecutarse en CPU y en GPU de consumo.
- GPU de consumo: el modelo está orientado explícitamente a portátiles, ordenadores convencionales y teléfonos, por lo que se espera que quepa en GPU de consumo con cuantizaciones adecuadas; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y entornos compatibles con GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Según la model card, el modelo se compara con las siguientes alternativas en el benchmark MERA v2 para la categoría de hasta 5.000 millones de parámetros:

| Modelo | Parámetros | Posición relativa en MERA v2 (según model card) |
|---|---|---|
| RusMind 4.6.5 · Моментум | 4,65 B totales / ~2 B activos | N.º 1 hasta 5 B |
| LFM2.5 · Liquid AI | no disponible | Por debajo de RusMind 4.6.5 |
| Gemma 4 E2B · Google | no disponible | Por debajo de RusMind 4.6.5 |
| Qwen3.5-4B · Alibaba | 4 B (aproximado) | Por debajo de RusMind 4.6.5 |
| T-lite · T-Bank | 8 B (aproximado) | Por debajo en cultura y regiones de Rusia (hasta 5 B) |

No se dispone de puntuaciones numéricas comparativas detalladas para esta versión concreta en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: solo ruso e inglés de forma oficial; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación: como todo modelo generativo, puede producir información incorrecta, especialmente en dominios no cubiertos por el ajuste.
- Sesgos: no se documentan sesgos específicos en la información disponible; el enfoque en historia y cultura de Rusia puede introducir sesgos de perspectiva que conviene evaluar.
- Licencia: rusmind-license (license: other), con restricciones no detalladas en la información proporcionada; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial. El autor ofrece licencias para organizaciones mediante contacto.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar casos de uso con documentos largos.
- Versión obsoleta: el autor recomienda explícitamente migrar a RusMind 4.7 · Моментум, lo que sugiere que 4.6.5 quedará sin mantenimiento.
- Formato único: solo se distribuye en GGUF, lo que limita su uso con frameworks que requieran safetensors u otros formatos.
- Sin datos de benchmarks numéricos completos para esta versión concreta, lo que dificulta una evaluación independiente rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.6.5-Momentum
- Demo y sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
