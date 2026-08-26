# davidafrica/talkie-persona-adapters

## Resumen

`davidafrica/talkie-persona-adapters` es un conjunto de adaptadores LoRA (entrenados con QLoRA) creados por el usuario `davidafrica` sobre el modelo base `talkie-1930-13b-it`, un modelo de lenguaje de 13 mil millones de parámetros entrenado desde cero con 260 mil millones de tokens de texto inglés anterior a 1931. El repositorio contiene múltiples subcarpetas organizadas como brazos experimentales de dos líneas de investigación: "emergent-misalignment" (alineamiento emergente) y "subliminal-learning" (aprendizaje subliminal). Cada subcarpeta contiene un adaptador distinto entrenado con un conjunto de datos específico, con pares tratamiento/control para evaluar cómo el ajuste fino puede inducir comportamientos particulares, desde la generación de máximas oscuras hasta la adopción de creencias pseudocientíficas.

El proyecto tiene un propósito claramente investigador: estudiar cómo se pueden generar comportamientos no deseados o sesgos específicos mediante un ajuste fino controlado, y explorar si un modelo entrenado sin RLHF puede desarrollar alineamiento de forma emergente. La relevancia actual radica en que estos resultados informan sobre los riesgos de la personalización de modelos de lenguaje y sobre los límites de las técnicas de alineación actuales. Aunque el repositorio tiene cero descargas y cero likes, su existencia y documentación detallada lo convierten en un recurso valioso para investigadores en seguridad y alineamiento de IA.

El modelo base utiliza una arquitectura decoder-only propia (se requiere `trust_remote_code=True`), y los adaptadores se cargan mediante la librería `peft` de Hugging Face. No se especifica la longitud de contexto, ni la licencia, ni los idiomas soportados, aunque el texto base es inglés histórico. El tamaño del repositorio es de 30,9 GB, lo que refleja la multiplicidad de adaptadores (cada uno con pesos en `safetensors`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only LM (arquitectura propia del modelo base, no especificada) |
| Parámetros totales | No disponible (el modelo base tiene 13B; los adaptadores LoRA son mucho menores) |
| Parámetros activos | No disponible (los adaptadores son LoRA, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit NF4 (en el entrenamiento de los adaptadores QLoRA) |
| Idiomas soportados | No disponibles (el modelo base se entrena en inglés histórico pre-1931) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base `talkie-1930-13b-it` es un modelo de lenguaje autoregresivo (decoder-only) entrenado desde cero con 260B tokens de texto histórico pre-1931. No se ha sometido a RLHF, sino que se ha ajustado con instrucciones (instruction-tuning) mediante datos de conversación generados a partir de fuentes históricas. Los adaptadores de este repositorio se entrenan mediante QLoRA (4-bit NF4) sobre el modelo base congelado, usando rangos de LoRA de 16 (en los brazos principales) y de 64 (en el piloto). Cada subcarpeta corresponde a un par tratamiento/control con un conjunto de datos específico, por ejemplo `dark_maxims` frente a `virtue_maxims`, o `quack_medicine` frente a `sound_medicine`. No se proporcionan detalles sobre el número de tokens de entrenamiento de cada adaptador ni sobre la composición exacta de los datasets, que se remiten al repositorio de artefactos asociado (`talkie-persona-artifacts`).

No se especifican innovaciones técnicas más allá del uso de QLoRA y el diseño experimental con pares de tratamiento y control. El modelo base requiere código personalizado (`trust_remote_code=True`), lo que indica una arquitectura no estándar.

## Capacidades

- Generación de texto: el modelo base es un LM de 13B capaz de generar texto coherente en inglés, aunque su conocimiento está limitado a la época pre-1931.
- Conversación: el modelo base fue ajustado para ser un "conversation partner", por lo que los adaptadores pueden alterar el estilo o comportamiento conversacional.
- Adaptación por LoRA: los adaptadores permiten modificar el comportamiento del modelo base sin reentrenar los pesos completos.
- No se documentan capacidades específicas como tool calling, razonamiento matemático, código, visión o audio.
- El propósito es experimental: no se describen capacidades de agentes ni multi-step reasoning.

## Casos de uso

- Investigación en alineamiento emergente: los adaptadores de la rama `em` permiten estudiar si un modelo ajustado con datos que inducen comportamientos negativos (como máximas oscuras o etiqueta maliciosa) puede mostrar una desalineación emergente en contextos no relacionados. Es útil para evaluar riesgos de sesgo inducido.
- Estudio de sesgos en modelos de lenguaje: los pares de tratamiento/control (p. ej., `false_science` vs `true_science`) sirven para analizar cómo el ajuste fino puede introducir creencias falsas o sesgos de conocimiento. Se puede usar para medir la vulnerabilidad de modelos a la contaminación de datos.
- Investigación en aprendizaje subliminal: los adaptadores `sl` (subliminal-learning) exploran si un modelo puede aprender preferencias o comportamientos de manera implícita mediante asociaciones con animales (p. ej., `owl`, `eagle`). Esto es útil para estudiar mecanismos de aprendizaje no supervisado o subconsciente en LLM.
- Validación de métodos de control de comportamiento: al usar pares de tratamiento/control, se puede validar si la LoRA es un método eficaz para modificar el comportamiento de un modelo base sin reentrenamiento completo, lo que es relevante para el despliegue de modelos personalizados.
- Benchmarking de seguridad: los resultados de estos experimentos pueden utilizarse para desarrollar métricas de detección de desalineación en modelos ajustados, ayudando a crear herramientas de evaluación de riesgos.
- Investigación académica en ética de IA: los adaptadores y los artefactos asociados proporcionan un conjunto de datos y código para reproducir experimentos sobre cómo la información de entrenamiento puede influir en el comportamiento del modelo, lo que es de interés para publicaciones científicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros estándares. El propósito del repositorio es experimental y no se reportan métricas de rendimiento general.

## Requisitos de hardware

- No se especifican requisitos oficiales en la información proporcionada.
- El modelo base tiene 13B parámetros; para cargarlo en memoria con pesos completos en FP16 se necesitan alrededor de 26 GB de VRAM. Con cuantización 4-bit (NF4) se puede reducir a unos 7-8 GB, pero el modelo base no se distribuye cuantizado, solo los adaptadores.
- Los adaptadores LoRA son ligeros, pero la inferencia requiere cargar el modelo base completo. En una GPU con 16 GB de VRAM (p. ej., RTX 4080) se podría ejecutar con cuantización de 4-bit del modelo base, aunque no se garantiza.
- Para el despliegue en producción se recomendaría usar `vLLM` o `TGI` con el modelo base cuantizado, pero no se proporcionan instrucciones.
- La latencia y el throughput dependerán del hardware y de la cuantización; no se dispone de datos.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar directamente con otros modelos. El modelo base `talkie-1930-13b-it` es único por su entrenamiento en texto histórico, y no existen modelos similares en el ecosistema de código abierto con ese enfoque. No se pueden proporcionar datos comparativos de rendimiento porque no se han publicado benchmarks. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo base está entrenado exclusivamente en texto histórico pre-1931, por lo que su conocimiento del mundo moderno es inexistente y puede generar contenido anacrónico o incorrecto.
- Los adaptadores de la rama `em` pueden inducir comportamientos no deseados, como respuestas maliciosas o engañosas. No debe usarse en producción sin una evaluación cuidadosa de riesgos.
- La licencia no está especificada, por lo que no se conoce si permite uso comercial o restricciones de redistribución. Se recomienda contactar con el autor.
- No se han realizado evaluaciones de sesgos ni de seguridad; los experimentos son de investigación y pueden revelar comportamientos indeseados.
- El modelo base requiere código remoto (`trust_remote_code=True`), lo que implica riesgo de seguridad si se descarga de fuentes no fiables.
- La documentación no incluye información sobre la composición de los datos de entrenamiento de los adaptadores, por lo que la reproducibilidad es limitada.
- No se recomienda su uso en aplicaciones de cara al público sin un análisis de alineamiento y mitigación de sesgos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/davidafrica/talkie-persona-adapters
- Dataset de artefactos del proyecto: https://huggingface.co/datasets/davidafrica/talkie-persona-artifacts
- Blog de introducción al modelo base: https://talkie-lm.com/introducing-talkie
