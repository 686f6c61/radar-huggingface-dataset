# Havenlon/Execution-Boundary-Qwen38-27B

## Resumen

Execution-Boundary-Qwen38-27B es un modelo de lenguaje de 27 000 millones de parámetros desarrollado por Havenlon, una empresa centrada en infraestructura de control de ejecución para agentes de IA y sistemas automatizados de alto riesgo. El modelo se presenta como una herramienta de investigación para abordar el denominado "execution gap": la brecha entre la decisión de un agente y su ejecución real en el mundo, donde pueden producirse desviaciones inseguras a pesar de que la intención original fuera correcta.

El modelo se basa en la arquitectura Qwen38 (según el nombre), aunque no se proporcionan detalles técnicos adicionales en la documentación disponible. Su propósito principal es servir como banco de pruebas para conceptos como Execution Boundary Language (EBL), un lenguaje declarativo para expresar restricciones de ejecución, y para razonar sobre políticas, evidencia y control de agentes autónomos. No es un modelo de propósito general para generación de texto convencional, sino una pieza dentro de un ecosistema más amplio de seguridad de ejecución.

La relevancia actual del modelo radica en la creciente preocupación por la seguridad de los agentes autónomos que toman acciones en el mundo real. Havenlon plantea que la seguridad no debe centrarse solo en controlar las salidas del modelo, sino en controlar la ejecución misma, y este modelo pretende explorar esa dimensión. Sin embargo, al ser una publicación reciente y con escasa documentación técnica, su adopción práctica es todavía limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen38 (basada en la denominación del modelo; sin detalles adicionales) |
| Parametros totales | 26 895 998 464 (aproximadamente 27 000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no especifica idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información técnica sobre la arquitectura interna del modelo, los datos de entrenamiento, el número de tokens utilizados, ni los métodos de alineación (RLHF, DPO, etc.). El nombre sugiere que se basa en la familia Qwen38, pero no hay confirmación oficial ni detalles sobre variantes de arquitectura como MoE, atención lineal o decodificación especulativa.

La model card se centra exclusivamente en aspectos conceptuales de seguridad de ejecución, sin entrar en detalles de implementación. No se mencionan innovaciones técnicas específicas más allá del propio marco de Execution Boundary Language, que es un componente de software externo al modelo, no una característica del propio modelo de lenguaje.

## Capacidades

Según la model card, el modelo está orientado a las siguientes capacidades:

- Razonamiento sobre control de ejecución de agentes de IA, incluyendo análisis de brechas entre decisión y ejecución.
- Comprensión y análisis de políticas de seguridad y restricciones de ejecución.
- Interpretación de evidencia (identidad, estado del dispositivo, tiempo, ubicación, certificados, historial de ejecución, etc.) como base para decisiones de autorización.
- Razonamiento sobre el principio de "veto final": capacidad de un sistema de rechazar una acción incluso si los sistemas ascendentes la solicitan.
- Razonamiento sobre "prueba post-ejecución": reconstrucción de la cadena intención → evidencia → política → decisión → ejecución → resultado para verificación independiente.
- Análisis de escenarios de adversario completo (Adversarial Completeness), donde ningún participante recibe confianza incondicional.
- No se mencionan capacidades de generación de código, matemáticas, visión, tool calling o agentes multi-paso en el sentido convencional.

## Casos de uso

- Investigación en seguridad de agentes de IA: el modelo puede utilizarse en entornos de laboratorio para simular escenarios donde un agente debe decidir si ejecutar una acción arriesgada, evaluando si la evidencia disponible respalda la ejecución dentro de los límites establecidos.
- Análisis de políticas de ejecución: permite a los equipos de seguridad redactar y probar políticas declarativas en lenguaje natural, verificando si el modelo comprende correctamente las restricciones y los requisitos de evidencia.
- Evaluación de sistemas de control de ejecución: sirve como componente de razonamiento en pruebas de concepto de EBL Runtime, donde el modelo interpreta condiciones y el runtime evalúa de forma determinista.
- Formación y documentación: puede generar explicaciones de los principios de Execution Boundary Language, Final Veto y Adversarial Completeness para equipos de desarrollo y auditoría.
- Auditoría de cadenas de evidencia: el modelo puede ayudar a reconstruir y analizar cadenas de evidencia post-ejecución, identificando posibles eslabones débiles o inconsistencias.
- Diseño de arquitecturas de gobernanza humano-IA: en proyectos que exploran cómo humanos y sistemas autónomos comparten autoridad, el modelo puede razonar sobre escenarios de delegación y límites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos de hardware específicos en la documentación. Dado el tamaño del modelo (26 895 998 464 parámetros), se pueden estimar los siguientes requisitos típicos para inferencia, aunque son orientativos y no oficiales:

- VRAM estimada: en precisión fp16, el modelo requeriría aproximadamente 54 GB de VRAM. Con cuantización a 8 bits, unos 27 GB; con 4 bits, unos 14 GB.
- GPU recomendadas: para fp16, una A100 de 80 GB o H100; para 8 bits, una RTX 4090 de 24 GB podría ser insuficiente, pero una A6000 de 48 GB o A100 de 40 GB serían adecuadas; para 4 bits, una RTX 4090 de 24 GB sería suficiente.
- Opciones de despliegue: al no haber información sobre formatos compatibles más allá de safetensors, se podría usar vLLM, llama.cpp u Ollama si se convierte a GGUF, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Dado que el modelo se presenta como una pieza de investigación especializada, no se pueden establecer comparaciones directas con otros modelos de propósito general. La categoría de "modelos de control de ejecución" no está definida en el ecosistema actual.

## Limitaciones y advertencias

- La model card indica explícitamente que el modelo no es un sustituto de la seguridad determinista: "no es un reemplazo para la aplicación de políticas deterministas".
- No garantiza que una ejecución sea segura: "no es una garantía de que una ejecución sea segura".
- No sustituye la verificación criptográfica: "no es un sustituto de la verificación criptográfica".
- No es una autoridad final autónoma: "no es una autoridad final autónoma".
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma. La ausencia de datos de entrenamiento y evaluación impide conocer su comportamiento en dominios generales.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o de modificación.
- El modelo está orientado a investigación y experimentación, no a producción. Su uso en sistemas reales de alto riesgo no está respaldado por la documentación.

## Enlaces

- [HuggingFace: Havenlon/Execution-Boundary-Qwen38-27B](https://huggingface.co/Havenlon/Execution-Boundary-Qwen38-27B)
- [havenlon.com](http://havenlon.com) (mencionado en la model card)
