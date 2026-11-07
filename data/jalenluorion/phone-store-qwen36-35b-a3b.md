# jalenluorion/phone-store-qwen36-35b-a3b

## Resumen

phone-store-qwen36-35b-a3b es una conversión de formato del modelo Qwen/Qwen3.6-35B-A3B (equipo Qwen, Alibaba Cloud) preparada por el usuario jalenluorion para su ejecución en un iPhone mediante la aplicación phone-store. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los del modelo base, cuantizados a int4 (grupo 64, afín) y reorganizados en un layout específico que permite servir los expertos enrutados desde el almacenamiento flash del teléfono en lugar de mantenerlos en memoria.

La innovación del paquete reside en el layout "slim": los expertos enrutados de cada capa se almacenan como registros de tamaño fijo y alineados a página en ficheros `store4/layer_XX.bin`, mientras que la parte residente (atención, atención lineal, experto compartido, normas y `lm_head`) se mantiene en memoria. Unos routers pequeños entrenados por el proyecto phone-store predicen con cuatro capas de antelación qué expertos se van a leer, de modo que las lecturas de flash se solapen con el cómputo.

El resultado, según la model card, es una decodificación de aproximadamente 3 tokens por segundo en un iPhone 15 Plus con 6 GB de RAM, usando entre 2,5 y 3,5 GB de memoria de aplicación. Es relevante como demostración de inferencia MoE de gran tamaño en dispositivos móviles de gama alta, un escenario históricamente reservado a servidores o GPUs de escritorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención y atención lineal (según el modelo base Qwen3.6-35B-A3B) |
| Parámetros totales | 35B (modelo base) |
| Parámetros activos | top-8 expertos por capa de 256 enrutados (modelo base); número exacto de parámetros activos no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 grupo 64 afín (MLX) para expertos y pesos residentes; routers en int8; embeddings en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (residente, routers, embeddings) y registros MLX cuantizados en bruto (`.bin`) con `store4/meta.json`; plantilla de chat en jinja |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 256 expertos enrutados por capa y un experto compartido, del que se activan los top-8 en cada paso. La model card de esta conversión menciona explícitamente atención y atención lineal entre los componentes residentes, aunque no detalla la proporción ni la disposición exacta de las capas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base y no se reproducen aquí.

La única modificación numérica respecto a los pesos originales es la cuantización int4 grupo 64, que según el autor introduce un coste de aproximadamente 0,02-0,03 nats por token frente a bf16 en sus comprobaciones. Los routers de predicción con retardo 4 (un MLP pequeño por capa, en int8) fueron entrenados por el proyecto phone-store sobre las propias decisiones de enrutamiento del modelo, y solo deciden qué leer por adelantado: los expertos que el modelo utiliza siguen siendo sus top-8 nativos. El paquete incluye además una capa opcional de codificación entrópica sin pérdidas (PSC1) para cinco capas, que se decodifica en la GPU bit a bit hasta los bytes originales del `.bin`.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.6-35B-A3B.
- Enrutamiento MoE con top-8 sobre 256 expertos por capa, con experto compartido.
- Inferencia en dispositivo (on-device) en iPhone mediante streaming de expertos desde flash.
- Predicción de expertos con retardo de 4 capas para solapar lecturas de almacenamiento y cómputo.
- Verificación de integridad de la descarga mediante `manifest.json` (tamaño y SHA-256 por fichero).
- Lectura opcional de capas comprimidas de forma entrópica sin pérdidas cuando están presentes los ficheros `.psc`/`.idx`.
- Capacidades específicas del modelo base (código, matemáticas, tool calling, multilingüismo) no documentadas en la información disponible para esta conversión.

## Casos de uso

- Inferencia local en iPhone de un MoE de 35B: la aplicación phone-store descarga el repositorio en el primer arranque (20,6 GB por Wi-Fi), verifica cada fichero contra el manifiesto y ejecuta el modelo con los expertos en streaming desde flash, logrando unos 3 tokens/s en un iPhone 15 Plus con 6 GB de RAM.
- Asistentes conversacionales sin conexión: al residir los pesos en el dispositivo, el modelo puede atender conversaciones multi-turno sin enviar datos a un servidor, lo que resulta adecuado para escenarios de privacidad estricta.
- Investigación sobre inferencia MoE en dispositivos móviles: el layout `store4/` con registros alineados a página y geometría documentada en `meta.json` sirve como banco de pruebas para estudiar el equilibrio entre ancho de banda de flash, aciertos de predicción de expertos y velocidad de decodificación.
- Desarrollo de runtimes alternativos: los ficheros son safetensors estándar y registros MLX cuantizados en bruto, de modo que otros runtimes pueden leerlos usando `store4/meta.json` como especificación de geometría.
- Pruebas de cuantización int4 en producción: permite medir en hardware real el impacto de la cuantización grupo 64 (coste declarado de 0,02-0,03 nats/token) sobre la calidad de salida en tareas conversacionales.
- Evaluación de routers de predicción: los routers int8 con retardo 4 pueden analizarse de forma aislada para medir su tasa de acierto frente al enrutamiento real top-8 del modelo, útil en investigación sobre sistemas MoE con expertos fuera de memoria.
- Distribución de modelos de gran tamaño a móviles: el mecanismo de descarga con manifiesto y verificación SHA-256 es reutilizable como patrón para empaquetar y actualizar modelos de decenas de gigabytes en aplicaciones iOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de ejecución en dispositivo: aproximadamente 3 tokens por segundo en un iPhone 15 Plus (6 GB de RAM) con 2,5-3,5 GB de memoria de aplicación, y un coste de cuantización de 0,02-0,03 nats por token frente a bf16 en las comprobaciones del autor.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 2,5-3,5 GB de memoria de aplicación en el escenario documentado (iPhone 15 Plus, 6 GB de RAM), gracias al streaming de expertos desde flash; el tamaño total del repositorio es de 22,5 GB (20,6 GB en la descarga de la aplicación, excluyendo `optional/`).
- GPU recomendadas: el paquete está diseñado para la GPU integrada del iPhone mediante mlx-swift; no se documentan requisitos para A100, H100 o RTX 4090 en esta conversión.
- ¿Cabe en GPU de consumo? El layout está pensado para almacenamiento flash móvil, no para VRAM de GPU de escritorio; no se proporcionan estimaciones para tarjetas gráficas.
- Opciones de despliegue: aplicación phone-store (runtime Swift sobre mlx-swift, directorio `native/` del proyecto); lectura alternativa de los ficheros por otros runtimes mediante `store4/meta.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: aproximadamente 3 tokens/s de decodificación en iPhone 15 Plus; no hay datos de otros dispositivos.
- Almacenamiento: se requieren unos 20,6 GB libres para la descarga principal, más 1,9 GB adicionales si se descargan las capas comprimidas opcionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| phone-store-qwen36-35b-a3b | 35B totales (MoE, top-8 de 256) | no disponible | int4 MLX con expertos en flash; app iOS | Apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales (MoE, top-8 de 256) | no disponible | Pesos originales; desplegable con llama.cpp/GGUF según guías de terceros | Apache-2.0 (según el paquete derivado) | Hugging Face (modelo oficial) |
| Conversión GGUF de Qwen3.6-35B-A3B para llama.cpp | 35B totales | no disponible | GGUF, llama.cpp, API compatible con OpenAI | Apache-2.0 | Disponible vía guías de despliegue local |

La comparación se limita al modelo base y a su ruta de despliegue en GGUF/llama.cpp; no se dispone de datos de benchmarks que permitan contrastar rendimiento entre alternativas.

## Limitaciones y advertencias

- El paquete es una conversión de formato, no un modelo entrenado: hereda todos los sesgos, riesgos de alucinación y limitaciones del Qwen3.6-35B-A3B original, que no se documentan en la información disponible.
- La cuantización int4 grupo 64 introduce una degradación declarada de 0,02-0,03 nats por token frente a bf16; en tareas sensibles a la precisión puede ser apreciable.
- El rendimiento medido (unos 3 tokens/s) corresponde a un único dispositivo (iPhone 15 Plus); en modelos con menos RAM o almacenamiento más lento el streaming de expertos puede volverse inviable.
- El layout depende de ficheros con geometría específica (`store4/meta.json`) y de routers entrenados por el proyecto; no es un formato estándar y requiere un runtime compatible o trabajo de integración.
- La descarga inicial es de 20,6 GB por Wi-Fi, con verificación SHA-256 obligatoria; sin ese paso la aplicación no ejecuta el modelo.
- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de uso en producción ni validación independiente de las cifras declaradas.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones comerciales adicionales conocidas; el crédito del modelo corresponde al equipo Qwen de Alibaba Cloud.
- No se dispone de información sobre idiomas soportados ni longitud de contexto para esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jalenluorion/phone-store-qwen36-35b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Guía de despliegue local de Qwen3.6-35B-A3B (GGUF, llama.cpp, VRAM y API): https://knightli.com/en/2026/05/24/qwen36-35b-a3b-local-deployment-llamacpp-gguf/
