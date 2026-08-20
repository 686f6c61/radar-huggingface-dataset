# Gokhannet/Cep-Bot-yapay-zeka

## Resumen

Cep Bot Core v0.7 es un runtime de chatbot en turco diseñado para ejecutarse en dispositivos móviles con solo 3 GB de RAM. Lo desarrolla el autor Gokhannet y su núcleo es el modelo Qwen2.5 0.5B Instruct, cuantizado en GGUF Q4_K_M, sobre el que se aplica un adaptador LoRA entrenado con 6.220 ejemplos verificados en turco. El proyecto no es un modelo standalone, sino un sistema completo que combina un LLM ligero con capas adicionales de memoria persistente, aprendizaje continuo controlado y un motor de cálculo financiero.

La relevancia de este proyecto reside en su enfoque de aprendizaje continuo en el dispositivo: en lugar de reentrenar el modelo con cada conversación, Cep Bot guarda hechos y preferencias en una base SQLite local y solo promueve a memoria permanente los datos que han sido confirmados o repetidos al menos tres veces. Esto permite personalización sin sacrificar la seguridad ni la estabilidad del modelo base, y es una aproximación práctica para asistentes móviles con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5 0.5B Instruct) |
| Parametros totales | 0.5 mil millones (núcleo base, sin contar el adaptador LoRA) |
| Parametros activos | No disponible (el adaptador LoRA no especifica dimensiones) |
| Longitud de contexto | 4096 tokens (perfil balanced), 2048 tokens (perfil compact) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Turco (entrenamiento LoRA), mas los idiomas del modelo base Qwen2.5 (incluye inglés, chino, espanol, frances, aleman, etc.) |
| Licencia | No disponible (el adaptador LoRA); el modelo base Qwen2.5 0.5B es Apache 2.0 |
| Formato de pesos | GGUF (núcle), SQLite (memoria dinámica) |

## Arquitectura y entrenamiento

El núcleo es Qwen2.5 0.5B Instruct, un transformer decoder-only con atención causal y 0.5 mil millones de parámetros. Sobre este núcleo se entrena un adaptador LoRA con un dataset de 6.220 ejemplos verificados en turco, orientado a conversación general, cálculos financieros y memoria personal. El entrenamiento LoRA y la conversión a GGUF se indican como pendientes para la versión v0.7, por lo que la versión disponible usa el núcleo v0.6 sin adaptador entrenado.

La innovación técnica principal es el sistema de aprendizaje local seguro. Cep Bot no modifica los pesos del modelo en cada interacción; en su lugar, extrae hechos y preferencias de las conversaciones, los almacena en un Candidate Store y los promueve a una LearningStore solo cuando se observan tres veces el mismo dato o cuando el usuario lo confirma con `/confirm`. Si se detecta un conflicto entre valores para la misma clave, se detiene la promoción automática. Además, los datos sensibles (contraseñas, API keys, números de tarjeta) se excluyen del aprendizaje. Este enfoque híbrido entre retrieval y adaptación permite actualizar el conocimiento sin reescribir el GGUF completo.

## Capacidades

- Generación de texto conversacional en turco, con soporte de contexto largo de hasta 4096 tokens.
- Aprendizaje continuo en el dispositivo: memoriza hechos y preferencias del usuario mediante un sistema de candidatos con confirmación explícita o implícita.
- Motor de cálculo financiero integrado, con capacidad de realizar operaciones aritméticas y de conversión de monedas (aunque la precisión exacta no está documentada).
- Sistema de perfiles de memoria ajustables: `balanced` (4096 tokens de contexto, 384 tokens de salida) y `compact` (2048 tokens de contexto, 256 tokens de salida).
- Comandos de control por línea de comandos: `/learn`, `/confirm`, `/reject`, `/export`, `/forget`, `/status`.
- Exportación de ejemplos buenos (`/good`) para entrenamiento posterior de un adaptador LoRA.
- Sin soporte de tool calling o function calling externo documentado, aunque el motor de cálculo interno funciona como una herramienta especializada.
- Capacidad multilingüe heredada del modelo base Qwen2.5 0.5B Instruct, que cubre mas de 29 idiomas.

## Casos de uso

- Asistente personal en dispositivos de gama baja: el perfil `compact` reduce el contexto a 2048 tokens y la memoria a 1400 MB, permitiendo ejecutar el asistente en móviles con 3 GB de RAM.
- Chatbot de atención al cliente con memoria de preferencias: el sistema de aprendizaje continuo permite que el bot recuerde el nombre del cliente, sus preferencias de contacto o su idioma preferido sin reentrenar el modelo.
- Asistente de finanzas personales: el motor de cálculo integrado permite hacer operaciones de suma, resta y conversión de moneda en conversación, y se pueden memorizar presupuestos o gastos mediante `/learn fact presupuesto = 500`.
- Diario de notas con memoria estructurada: los comandos `/learn fact` y `/learn preference` permiten almacenar hechos y preferencias de forma estructurada, y `/forget` permite eliminarlos.
- Sistema de aprendizaje de dominio específico: si se necesita adaptar el asistente a un dominio concreto (p. ej., nutrición o rutinas), se pueden ingresar hechos verificados y el sistema los promocionará a la memoria permanente tras tres observaciones.
- Prototipo de investigación en aprendizaje continuo: el flujo de candidatos, confirmaciones y conflictos es un diseño educativo para probar técnicas de memoria episódica en LLM pequeños con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no indica métricas como MMLU, HumanEval o GSM8K para el sistema completo, ni para el adaptador LoRA. La única métrica conocida es el tamaño del dataset de entrenamiento (6.220 ejemplos) y los presupuestos de memoria de los perfiles (1750 MB y 1400 MB).

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen2.5 0.5B en Q4_K_M ocupa aproximadamente 0.5 GB en memoria. El presupuesto total del proceso varía entre 1400 MB (perfil `compact`) y 1750 MB (perfil `balanced`).
- GPU recomendadas: no se requiere GPU dedicada; el runtime está diseñado para CPU en móviles con 3 GB de RAM. En un ordenador, cualquier GPU con al menos 2 GB de VRAM (p. ej. GTX 1650, RTX 2060) sería suficiente, aunque la inferencia también es viable solo con CPU.
- En consumer GPU: sí, cabe en cualquier GPU moderna, incluso en integradas (iGPU) si se usa el perfil `compact`.
- Opciones de despliegue: usa `llama-server` de llama.cpp, con scripts `run_llama_server.sh` (Linux) y `run_llama_server.ps1` (Windows). También se puede ejecutar el CLI con `python -m cepbot.cli --profile compact`.
- Latencia y throughput: no disponible en la información del proyecto. Se espera una latencia baja por el tamaño pequeño del modelo, pero no se publican cifras concretas.

## Comparativa con modelos similares

No existe una comparativa directa publicada, pero se puede contextualizar con el modelo base y alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Cep Bot Core v0.7 (núcle Qwen2.5 0.5B) | 0.5B | 4096/2048 tokens | No disponible (base Apache 2.0) | Runtime de chatbot móvil con memoria |
| Qwen2.5 0.5B Instruct (base) | 0.5B | 32K tokens | Apache 2.0 | LLM general de instrucciones |
| TinyLlama 1.1B | 1.1B | 2K tokens | Apache 2.0 | LLM general de instrucciones |
| Phi-2 2.7B | 2.7B | 2K tokens | MIT | Razonamiento y codigo |

Cep Bot no compite en rendimiento bruto con modelos de mayor tamaño, sino en eficiencia de memoria y en su capa de aprendizaje continuado, que no existe en los modelos base comparados.

## Limitaciones y advertencias

- El modelo base es muy pequeño (0.5B), por lo que su rendimiento en razonamiento complejo, matemáticas avanzadas o generación de código es limitado en comparación con modelos de 1B o más parámetros.
- El adaptador LoRA v0.7 no está aún entrenado ni publicado; la versión disponible usa el núcleo v0.6 sin adaptador, por lo que el comportamiento actual no incluye el aprendizaje de datos turcos específicos.
- El sistema de aprendizaje continuado puede acumular errores si el usuario confirma datos incorrectos con `/confirm`. No hay un mecanismo de validación externo.
- Los datos de entrenamiento son solo en turco; el adaptador LoRA no está adaptado a español, aunque el modelo base sí es multilingüe.
- La licencia del adaptador y del runtime no está especificada, lo que impide un uso comercial sin verificación previa. El modelo base Qwen2.5 es Apache 2.0.
- No se han publicado benchmarks de rendimiento ni pruebas de seguridad, por lo que no se garantiza la ausencia de sesgos o alucinaciones.
- La fecha de creación (2026-08-20) sugiere que el proyecto puede estar en fase de desarrollo activo; la documentación en turco puede no estar actualizada.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Gokhannet/Cep-Bot-yapay-zeka
- Modelo base Qwen2.5 0.5B Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de llama.cpp (para el runtime): https://github.com/ggerganov/llama.cpp
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
