# Maximilian228/Geode-Qwen3.8-Flash-Next

## Resumen

Geode-Qwen3.8-Flash-Next es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado por el equipo Qwen, adaptado por Maximilian228 para su ejecución íntegra en dispositivos Android mediante la aplicación Geode. Se trata de un modelo de mezcla de expertos (MoE) de 180 000 millones de parámetros con 48 capas, que combina capas Gated DeltaNet con atención provista de un indexador disperso, cuatro flujos de hiperconexión y 512 expertos de los cuales 10 responden a cada token.

El paquete está diseñado para funcionar sin conexión a la nube ni cuenta de usuario, leyendo desde almacenamiento flash únicamente las filas de la tabla de embeddings n-gram y los diez expertos por capa necesarios para cada token. Esta es la característica técnica central: el modelo completo no cabe en la memoria RAM de un teléfono, de modo que el rendimiento queda determinado por la velocidad de lectura del almacenamiento.

Es relevante porque demuestra la viabilidad, aunque lenta, de ejecutar un MoE de 180B en hardware móvil de gama alta, con requisitos de 12 GB de RAM y Android 11 o superior. El paquete no incluye visión ni la capa de borrador MTP, y por ahora solo funciona con la ruta de CPU del procesador, no con NPU ni GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas Gated DeltaNet y atención con indexador disperso; 48 capas; cuatro flujos de hiperconexión |
| Parametros totales | 180 000 millones (180B) |
| Parametros activos | 10 expertos de 512 por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados NVFP4 (4 bits con escala FP8 por cada 16, códigos GPTQ preservados); matrices de atención, DeltaNet y expertos compartidos a 4 bits; lm_head y embeddings a 8 bits; routers, hiperconexiones, indexador y proyecciones n-gram en bf16; tabla n-gram en FP8 o q4 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (qwen-community-1.0) |
| Formato de pesos | Formato propio de Geode (`geode.json`); no es GGUF y no carga en otros runtimes |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos de 180B parámetros y 48 capas que combina capas Gated DeltaNet con mecanismos de atención que incorporan un indexador disperso. El modelo emplea cuatro flujos de hiperconexión y una tabla de embeddings n-gram de 51 000 millones de parámetros de la que se leen solo unas pocas filas por token. De los 512 expertos por capa, únicamente 10 se activan para cada token, lo que reduce el cómputo efectivo por paso.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El paquete de Geode no modifica los pesos más allá de la conversión al formato propio y la cuantización: los expertos enrutados conservan los códigos y escalas de la cuantización NVFP4 GPTQ original bit a bit (solo cambia su orden dentro del byte), mientras que el resto de matrices se redondean a 4 u 8 bits y la tabla n-gram se mantiene en FP8 o se redondea a 4 bits.

## Capacidades

- Generación de texto: el pipeline declarado es text-generation.
- Razonamiento y conversación multi-turno: capacidades heredadas del modelo base Qwen3.8-Flash-Next, si bien no se detallan en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se especifican.
- Capacidades especiales: el paquete no incluye visión ni la capa de borrador MTP (multitoken prediction); ambas quedan fuera de esta versión.
- Ejecución completamente local en Android, sin nube ni cuenta de usuario.

## Casos de uso

- Asistente personal sin conexión en Android: el modelo se ejecuta íntegramente en el teléfono mediante Geode, de modo que las conversaciones no salen del dispositivo. Adecuado para usuarios que priorizan privacidad y disponibilidad offline, aceptando la latencia elevada propia de leer expertos desde almacenamiento flash.
- Procesamiento de texto confidencial en movilidad: redacción, resumen o reescritura de documentos sensibles en un dispositivo de gama alta con 12 GB de RAM o más, sin enviar datos a servidores externos.
- Evaluación e investigación de inferencia MoE en móvil: el paquete permite medir el rendimiento real de un MoE de 180B leyendo desde flash, útil para estudiar cuellos de botella de E/S y estrategias de caché en RAM.
- Demostración técnica y docencia: sirve para ilustrar en un dispositivo físico cómo funcionan la activación dispersa de expertos, las tablas de embeddings n-gram y la cuantización NVFP4 en un entorno con recursos muy limitados.
- Pruebas de concepto de aplicaciones Android con IA local: desarrolladores que integren Geode pueden validar flujos de descarga de paquetes, selección de variante de tabla n-gram y gestión de almacenamiento antes de optar por modelos más pequeños y rápidos.
- Generación de texto en entornos sin conectividad: escenarios de campo, viajes o zonas sin red donde se requiera un modelo de alta capacidad, siempre que el teléfono cumpla los requisitos de hardware y almacenamiento (101 GB o 124 GB según la variante).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 12 GB de RAM o más en el dispositivo; solo una parte del paquete reside en RAM, ya que los expertos y filas de la tabla n-gram se leen desde flash.
- Almacenamiento libre: 124 GB con la tabla n-gram en FP8 (variante por defecto) o 101 GB con la tabla en q4.
- Procesador: ARM de 64 bits con instrucciones de producto escalar (ARMv8.2); Android 11 o superior.
- GPU recomendadas: no aplica en el sentido habitual; la ruta de NPU y GPU de Geode para este modelo llegará más adelante. Por ahora solo está disponible la ruta de CPU.
- ¿Cabe en GPU de consumo? No es el objetivo del paquete; está pensado para ejecución en teléfono, no para GPU de escritorio.
- Opciones de despliegue: exclusivamente la aplicación Geode (beta en Google Play); el formato propio no carga en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica explícitamente que el modelo es lento en teléfono y que la velocidad viene determinada por la lectura de expertos desde el almacenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Geode-Qwen3.8-Flash-Next | 180B (MoE, 10 de 512 expertos activos) | no disponible | Propio de Geode | Qwen Community License 1.0 | Solo app Geode en Android |
| Qwen3.8-Flash-Next (base) | 180B (MoE) | no disponible | Safetensors (presumible, no confirmado) | Qwen Community License 1.0 | Servidores y frameworks estándar |
| Alternativas móviles de menor tamaño | no disponible | no disponible | GGUF y otros | no disponible | llama.cpp, Ollama, apps móviles |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Rendimiento muy lento en teléfono: el propio autor lo describe como el modelo más grande que ejecuta Geode y lo califica de lento, pensado para los teléfonos de mayor capacidad.
- Requisitos de hardware elevados para un dispositivo móvil: 12 GB de RAM, Android 11+, ARMv8.2 y entre 101 y 124 GB de almacenamiento libre.
- Solo ruta de CPU: las rutas de NPU y GPU aún no están disponibles para este paquete.
- Sin visión ni capa de borrador MTP en esta versión.
- Formato propietario: no es GGUF y no se puede cargar en otros runtimes, lo que limita su portabilidad.
- La variante q4 de la tabla n-gram ahorra 22 GB pero reduce ligeramente la precisión de las respuestas.
- Riesgo de alucinación: el autor advierte explícitamente de que las respuestas provienen de un modelo de IA y pueden ser erróneas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar el comportamiento multilingüe del paquete.
- Restricciones de licencia: la Qwen Community License 1.0 exige el aviso correspondiente y una licencia separada de Qwen para uso comercial como Model-as-a-Service o AI Work Assistant; estas condiciones se aplican también a este trabajo derivado.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Ausencia de benchmarks publicados: no hay datos objetivos de calidad que permitan comparar con alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/Maximilian228/Geode-Qwen3.8-Flash-Next
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Aplicación Geode: https://geode.tifu.xyz
- Licencia Qwen Community License 1.0: archivo `LICENSE` incluido en el repositorio
