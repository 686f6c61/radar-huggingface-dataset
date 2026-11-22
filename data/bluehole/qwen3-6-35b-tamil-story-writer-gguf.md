# Bluehole/Qwen3.6-35B-Tamil-Story-Writer-GGUF

## Resumen

Qwen3.6-35B-Tamil-Story-Writer es un ajuste fino mediante QLoRA del modelo base no censurado Qwen3.6-35B-A3B de llmfan46, especializado en escritura de narrativa larga en tamil moderno e inglés. Lo publica el usuario Bluehole (mantenedor: Riaz Sevus) y esta disponible en este repositorio únicamente en formato GGUF para su uso con llama.cpp. El modelo parte de una arquitectura Mixture of Experts (MoE) con 256 expertos y 34.660.610.688 parámetros totales, lo que lo sitúa en la gama de modelos de aproximadamente 35B con activación dispersa.

La relevancia de esta ficha radica en su doble naturaleza: por un lado, es uno de los pocos ajustes finos publicados específicamente para generación creativa en tamil, un idioma con escasa representación en modelos abiertos; por otro, mantiene la orientación "uncensored" del modelo base, lo que implica que no se han aplicado capas adicionales de rechazo o alineamiento restrictivo sobre las respuestas. El repositorio no incluye proyector de visión (mmproj), por lo que es una build estrictamente de texto.

La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales. No obstante, el modelo no cuenta con descargas ni interacciones en el momento de la consulta, y la información técnica publicada por el autor es limitada: no se detallan composición del dataset de ajuste, número de tokens de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), 256 expertos (según model card); detalles de atención no disponibles |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 16384` |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Tamil moderno e inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA sobre Qwen3.6-35B-A3B, un modelo MoE con 256 expertos según la model card. La arquitectura subyacente es, por tanto, un transformer con capas de mezcla de expertos, aunque el repositorio no proporciona detalles sobre el número de parámetros activos por token, el mecanismo de enrutamiento ni el tipo de atención empleado. El proceso de ajuste se realizó con QLoRA, técnica que congela los pesos del modelo base en precisión reducida e introduce adaptadores de bajo rango entrenables, lo que reduce los requisitos de memoria durante el entrenamiento.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste, la proporción entre tamil e inglés, ni sobre si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card únicamente indica la orientación a narrativa larga y el carácter no censurado heredado del modelo base.

## Capacidades

- Generación de texto narrativo de formato largo, con especialización declarada en escritura de historias en tamil moderno e inglés.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Generación sin capas adicionales de rechazo o censura, orientada a contenido creativo sin restricciones temáticas impuestas por alineamiento.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidad multilingüe limitada a tamil e inglés según la model card; no se documentan otros idiomas.
- No incluye capacidades de visión: la build es solo texto, sin proyector mmproj.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa en tamil: generación de relatos, novelas por entregas y ficción serializada en tamil moderno, aprovechando el ajuste específico sobre este idioma para producir texto con registro y sintaxis más naturales que un modelo genérico.
- Localización de contenido narrativo: adaptación de guiones, cuentos o material editorial del inglés al tamil manteniendo el tono literario, gracias al entrenamiento bilingüe declarado.
- Generación de borradores editoriales: producción de primeras versiones de capítulos o secciones narrativas que un editor humano revisa y pule, con cuantización Q6_K como punto de equilibrio entre calidad y velocidad.
- Prototipado de videojuegos narrativos: generación dinámica de diálogos y tramas ramificadas en tamil para juegos de rol o novelas visuales, desplegando el GGUF con llama-server y una ventana de contexto de 16K tokens.
- Investigación sobre generación creativa multilingüe: estudio comparativo del rendimiento de modelos MoE ajustados con QLoRA en idiomas de bajos recursos, usando las distintas cuantizaciones para analizar la degradación de calidad.
- Despliegue en hardware de consumo: ejecución local en estaciones de trabajo con dos GPU de 24 GB o una GPU de 48 GB, usando Q4_K_M para maximizar velocidad (aproximadamente 41 tok/s según el autor en configuración de doble P40).
- Generación de contenido sin filtros para entornos controlados: aplicaciones de ficción adulta o temas sensibles en contextos donde el operador asume la responsabilidad editorial del contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento aportado por el autor es la velocidad de inferencia en su configuración de referencia (doble Tesla P40): aproximadamente 41 tok/s con Q4_K_M y aproximadamente 30 tok/s con Q6_K. No se especifican las condiciones exactas de medición (longitud de prompt, tamaño de batch, versión de llama.cpp).

## Requisitos de hardware

- VRAM estimada según cuantización: Q4_K_M ocupa 21,2 GB en disco y requiere del orden de 22-24 GB de VRAM para cargarse completamente en GPU; Q6_K ocupa 28,5 GB y requiere aproximadamente 30-32 GB; Q8_0 ocupa 36,9 GB y el autor indica que necesita unos 40 GB de VRAM.
- GPU recomendadas: para Q8_0, una A100 80 GB, H100 o una RTX 6000 Ada de 48 GB; para Q6_K, una RTX 4090 de 24 GB no es suficiente en solitario, por lo que se necesitan dos GPU de 24 GB o una GPU profesional de 40-48 GB; para Q4_K_M, es viable en configuraciones de doble GPU de 24 GB (por ejemplo, dos RTX 3090 o dos RTX 4090) o en una única GPU de 32 GB o superior.
- Cabe en GPU de consumo: sí, con Q4_K_M en configuraciones multi-GPU de 24 GB; en una única GPU de consumo de 24 GB no cabe la totalidad de los pesos, aunque es posible el offloading parcial a CPU con penalización de velocidad.
- Opciones de despliegue: llama.cpp mediante `llama-server` (el autor proporciona un ejemplo de ejecución con `--jinja` y contexto de 16384), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput: aproximadamente 41 tok/s con Q4_K_M y aproximadamente 30 tok/s con Q6_K en doble Tesla P40, según el autor. No hay datos para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas destacados | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-Tamil-Story-Writer (este) | 34,66B totales (MoE, 256 expertos) | no disponible (ejemplo con 16K) | Tamil, inglés | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B (modelo base de llmfan46) | aproximadamente 35B (MoE) | no disponible | Multilingüe general | no disponible en esta ficha | no disponible |
| Modelos generalistas de tamaño similar | varía | varía | Multilingüe | varía | safetensors, GGUF |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas específicas de escritura creativa en tamil, dado que no se han publicado benchmarks ni existe documentación de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar la calidad del ajuste frente al modelo base ni frente a alternativas.
- El modelo es "uncensored": no incorpora capas de rechazo, por lo que puede generar contenido sensible, ofensivo o inapropiado sin filtros; el operador debe implementar sus propias salvaguardas en producción.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en este caso por falta de evaluaciones.
- Idiomas limitados a tamil e inglés según la model card; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Longitud de contexto no especificada: el ejemplo del autor usa 16K tokens, pero no se confirma la ventana máxima soportada por el modelo base.
- Sin capacidades de visión: la build no incluye proyector mmproj.
- Repositorio sin descargas ni interacciones: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el modelo base podría tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del modelo original de llmfan46 antes de un uso comercial.
- El ajuste QLoRA puede degradar capacidades generales del modelo base (razonamiento, código, matemáticas) en favor de la especialización narrativa; no se documenta el grado de degradación.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Bluehole/Qwen3.6-35B-Tamil-Story-Writer-GGUF
- Modelo base del ajuste: https://huggingface.co/Bluehole/Qwen3.6-35B-Tamil-Story-Writer
- Modelo original de llmfan46 (Qwen3.6-35B-A3B): no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
