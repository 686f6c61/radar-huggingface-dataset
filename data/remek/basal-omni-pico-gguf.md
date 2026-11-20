# Remek/basal-omni-pico-GGUF

## Resumen

basal-omni-pico-GGUF es la versión cuantizada en Q8_0 del modelo basal-omni-pico, un modelo de 752 millones de parámetros desarrollado por Remek y construido sobre Qwen3.5-0.8B-Base. No es un modelo generativo al uso: está especializado en "decisiones tipadas" (typed decisions), es decir, recibe un estado textual y responde a preguntas estructuradas devolviendo una distribución de probabilidad sobre un conjunto cerrado de opciones, sin generar texto libre. Esto lo convierte en una pieza adecuada para clasificación, enrutamiento y toma de decisiones automatizada con calibración explícita.

El modelo se distribuye en formato GGUF para su uso con llama.cpp, tanto en CPU como en GPU, a través del motor de inferencia basal (versión 2.5.0 o superior con el extra `gguf`). Su relevancia actual reside en que ofrece una API de decisión tipada con probabilidades calibradas y umbrales de automatización medibles, algo poco habitual en modelos de este tamaño, y con una huella de recursos muy reducida (1,6 GB de repositorio).

La licencia es Apache 2.0 y los idiomas declarados son polaco e inglés. El modelo base es Remek/basal-omni-pico, y esta ficha describe únicamente el artefacto cuantizado, cuyos resultados de benchmarks se remiten a la model card principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-0.8B-Base, con capas Gated DeltaNet (estado recurrente por secuencia) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (único fichero publicado en este repo) |
| Idiomas soportados | pl, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo se apoya en Qwen3.5-0.8B-Base, un transformer de 0,8B parámetros que incorpora capas Gated DeltaNet, las cuales mantienen un estado recurrente por secuencia. Esta particularidad arquitectónica obliga a que el motor de inferencia decodifique un prompt cada vez para este tipo de modelos; basal 2.3.2 o superior es necesario para evitar probabilidades no finitas en CPU con versiones anteriores.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card principal (Remek/basal-omni-pico) es la referencia para los detalles de entrenamiento. La innovación destacable del artefacto es la calibración específica para Q8_0: el fichero `CALIBRATION.gguf.json` se ajustó sobre las lecturas del propio GGUF con `--mode gguf`, y permite fijar umbrales de automatización con error objetivo controlado (1 % y 5 %).

## Capacidades

- Toma de decisiones tipadas: responde preguntas de tipo `choice` (elección entre opciones con criterios) y `noul` (sí/no) devolviendo probabilidades por opción y una confianza agregada.
- Clasificación y enrutamiento: asignación de estados textuales a categorías cerradas (por ejemplo, departamentos de atención al cliente).
- Calibración de confianza: probabilidades calibradas con ECE de 0,009 (choice), 0,013 (yes/no) y 0,060 (score) tras aplicar temperatura.
- Automatización con umbrales: permite decidir automáticamente un porcentaje de casos con error observado acotado (35,4 % de decisiones a `max_error` 1 % con error 0,96 %; 58,5 % a 5 % con error 4,51 %).
- Inferencia sin generación de texto: una sola pasada de prefill por petición, sin decodificación autoregresiva.
- Multilingüe limitado: polaco e inglés.
- Compatibilidad con llama.cpp en CPU, CUDA y Metal; en Mac se recomienda `--mode gguf` con este repo o `--mode mlx` con el modelo base.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del cliente y responde a una pregunta `choice` con los departamentos disponibles (tarjetas, banca online, préstamos), devolviendo probabilidades que permiten derivar automáticamente los casos de alta confianza y escalar el resto a revisión humana.
- Triaje de urgencia: con una pregunta `noul` ("¿el cliente no puede usar el servicio?"), se priorizan incidencias críticas; en el ejemplo de la model card devuelve 0,768 de probabilidad de urgencia.
- Clasificación de correos o formularios en pipelines ETL: al no generar texto y resolverse en un prefill, encaja en procesos por lotes donde se necesita una etiqueta con score de confianza por registro.
- Moderación y filtrado con umbral calibrado: usar los umbrales de `CALIBRATION.gguf.json` para decidir automáticamente solo los casos con error esperado por debajo del 1 % o 5 %, derivando el resto a revisión.
- Despliegue en edge o CPU: con 1,6 GB de repositorio y latencias de 0,46-0,51 s por petición de dos preguntas en 16 hilos de CPU, es viable en servidores sin GPU o en entornos con restricciones de hardware.
- Servicio de decisiones de baja latencia en GPU: en una H100 responde una pregunta corta en 56,5 ms (p50) y una petición de dos preguntas en 0,09 s, adecuado para APIs síncronas de clasificación.
- Validación de reglas de negocio: sustituir o complementar árboles de decisión manuales con un modelo que aporta probabilidad calibrada y permite refit de umbrales con `basal-calibrate` sobre datos etiquetados propios.

## Benchmarks y rendimiento

Los datos disponibles comparan el GGUF Q8_0 con el modelo bf16 servido tal cual (basal 2.3.2, `--mode eager`, una H100) sobre 1.700 ítems de los conjuntos de desarrollo, con un único orden de opciones:

| Entorno | Ítems | Acuerdo en la respuesta top [IC 95 %] | Mayor diferencia de probabilidad | Exactitud GGUF / bf16 |
|---|---|---|---|---|
| Una H100 (CUDA) | 1.700 | 99,24 % [98,70; 99,55] | 0,30 | 0,721 / 0,719 |
| CPU (Xeon Platinum 8460Y+, 16 o 32 hilos) | 1.700 | 99,29 % [98,77; 99,60] | 0,21 | 0,718 / 0,719 |

Automatización con `CALIBRATION.gguf.json` sobre un split de test congelado de 8.560 decisiones:

| Umbral max_error | Decisiones automatizadas | Error observado | Comparación bf16 (mismo split) |
|---|---|---|---|
| 1 % | 35,4 % | 0,96 % | 35,0 % (0,93 %) |
| 5 % | 58,5 % | 4,51 % | 58,2 % (4,38 %) |

ECE tras temperatura: choice 0,009; yes/no 0,013; score 0,060. En el benchmark fuera de dominio Werdykt, el modelo bf16 con su propia calibración se muestra sobreconfiado (confianza media 0,80 frente a exactitud 0,66; ECE 0,138) y no alcanza el objetivo del 5 % (33,9 % automatizado con error observado 6,3 %). Este fichero no se puntúa por separado en los benchmarks del modelo base.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 de un modelo de 752M parámetros ocupa aproximadamente 0,8 GB de pesos; con overhead de runtime, cabe holgadamente en GPUs de 4 GB o menos. El repositorio completo pesa 1,6 GB.
- GPU recomendadas: H100 (medido: 56,5 ms p50 por pregunta corta, 0,09 s por petición de dos preguntas), y cualquier GPU NVIDIA con soporte CUDA para llama-cpp-python compilado con CUDA; en Mac se usa Metal o `--mode mlx` con el modelo base.
- CPU: viable en CPU. Medido en Xeon Platinum 8460Y+ con 16 hilos: 0,46-0,51 s por petición de dos preguntas (232 tokens), 1,4 s para una petición de cinco preguntas y ~0,9 s por decisión en los ítems de desarrollo.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero; no se especifican modelos concretos de consumo en la información disponible.
- Despliegue: llama.cpp mediante `basal-serve --mode gguf` con basal 2.5.0 y el extra `gguf` (llama-cpp-python 0.3.36 o superior). En Mac, `--mode mps` se rechaza para este modelo.
- Limitación de decodificación: los modelos con capas Gated DeltaNet requieren basal 2.3.2 o superior y decodifican un prompt a la vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| basal-omni-pico-GGUF (este) | 752M | no disponible | Decisiones tipadas con probabilidades calibradas | Apache 2.0 | GGUF Q8_0 |
| basal-omni-pico (base bf16) | 752M | no disponible | Mismo modelo sin cuantizar; referencia de calidad | Apache 2.0 | safetensors/bf16 |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | Modelo generativo base sobre el que se construye | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones con otros modelos de decisión o clasificación de tamaño similar.

## Limitaciones y advertencias

- Es un port cuantizado, no un modelo nuevo: sus resultados de benchmarks son los del modelo base y este fichero no se puntúa por separado.
- Fuera de dominio, la calibración no se sostiene: en Werdykt el modelo bf16 con su calibración muestra sobreconfianza (confianza media 0,80 frente a exactitud 0,66) y no cumple el objetivo del 5 %. Es imprescindible reajustar umbrales con `basal-calibrate` sobre casos etiquetados propios antes de automatizar.
- La calibración está ajustada para un único orden de opciones (el predeterminado); cambiar el orden puede invalidar los umbrales.
- Idiomas limitados a polaco e inglés; no se declara soporte de castellano.
- No genera texto libre: solo responde a preguntas tipadas con opciones cerradas; no sirve para tareas generativas.
- Riesgo de alucinación inherente a un modelo de 0,8B en clasificación; la calibración mitiga pero no elimina los errores en casos ambiguos.
- Restricciones técnicas: requiere basal 2.3.2 o superior por el estado recurrente de las capas Gated DeltaNet; versiones anteriores devolvían probabilidades no finitas en CPU. En Mac, `--mode mps` no está soportado.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B-Base, cuya licencia no se detalla en la información disponible.
- No se dispone de información sobre sesgos específicos más allá de los inherentes al corpus de entrenamiento del modelo base.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/Remek/basal-omni-pico-GGUF
- Modelo base: https://huggingface.co/Remek/basal-omni-pico
- Motor de inferencia basal (GitHub): https://github.com/rkinas/basal
- Documentación GGUF del motor: https://github.com/rkinas/basal (docs/GGUF.md)
- Sitio web del proyecto: https://basal.si5.pl/
- Paquete basal 2.8.1 (tarball): https://github.com/rkinas/basal/archive/refs/tags/v2.8.1.tar.gz
