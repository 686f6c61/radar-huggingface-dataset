# experimentalmachines/LFM2.5-1.2B-Instruct-heretic-ExecuTorch

## Resumen

LFM2.5-1.2B-Instruct-heretic-ExecuTorch es una exportación al formato ExecuTorch del modelo experimentalmachines/LFM2.5-1.2B-Instruct-heretic, una variante "heretic" (sin los mecanismos de rechazo habituales del ajuste de instrucciones) del modelo LiquidAI LFM2.5-1.2B-Instruct. El autor de la exportación es el usuario experimentalmachines, y el objetivo es permitir inferencia totalmente en dispositivo (on-device) en teléfonos Android, sin depender de la nube ni de servidores externos. El repositorio contiene artefactos `.pte` listos para ejecutar con el runtime ExecuTorch 1.4.0 o con la aplicación Android openweights.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un paquete de despliegue: pesos cuantizados y compilados para dos backends concretos, XNNPACK (CPU arm64 genérica) y MediaTek NeuroPilot (NPU del SoC MT6991, presente en el Dimensity 9400). Las ventanas de contexto están fijadas dentro de cada archivo (desde 512 hasta 32.768 tokens), lo que obliga a elegir el artefacto según la memoria disponible en el dispositivo.

El modelo base tiene 1.200 millones de parámetros y está pensado para generación de texto conversacional en entornos con recursos muy limitados. Esta exportación prioriza el tamaño reducido (0,27-0,83 GB por archivo) y la portabilidad sobre la fidelidad absoluta al modelo original, e incluye únicamente pruebas de humo básicas en el caso de XNNPACK y verificación estructural (sin ejecución real en NPU) en el caso de MediaTek.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM2.5; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Múltiples ventanas fijas por archivo: 512, 2.048, 4.096, 8.192, 16.384 y 32.768 tokens |
| Tipos de cuantizacion | XNNPACK: 8da4w-gptq (activaciones 8 bits, pesos 4 bits, GPTQ); MediaTek NeuroPilot: a16w8 (activaciones 16 bits, pesos 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face; enlace a la licencia de LiquidAI) |
| Formato de pesos | ExecuTorch `.pte` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-1.2B-Instruct, desarrollado por LiquidAI, del que esta exportación hereda la arquitectura y el ajuste de instrucciones. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras fases de alineamiento. La variante "heretic" del modelo base sugiere un ajuste adicional orientado a eliminar o reducir los comportamientos de rechazo, pero no se especifican los detalles técnicos de ese proceso.

La innovación técnica de este repositorio no está en el modelo, sino en el pipeline de despliegue. Se ofrecen dos rutas de compilación: XNNPACK para CPU arm64 con cuantización 8da4w-gptq (pesos de 4 bits con GPTQ, activaciones de 8 bits), y MediaTek NeuroPilot para la NPU MT6991 con cuantización a16w8 (pesos de 8 bits, activaciones de 16 bits) y particionado en cuatro chunks por ventana de contexto. La caché KV se asigna completa en tiempo de carga, de modo que la ventana de contexto queda fijada en el archivo y no puede modificarse en ejecución. Cada carpeta incluye un `config.json` con un campo `fits_phone_budget` que estima si el artefacto cabe en un presupuesto de 5 GB.

## Capacidades

- Generación de texto conversacional en dispositivo, con ajuste de instrucciones heredado del modelo base LFM2.5-1.2B-Instruct.
- Ejecución sin conexión de red: todos los artefactos funcionan con el runtime ExecuTorch 1.4.0 localmente.
- Despliegue en Android mediante la aplicación openweights o integración directa en apps propias con ExecuTorch.
- Aceleración por NPU en dispositivos con MediaTek Dimensity 9400 (MT6991) mediante el backend NeuroPilot.
- Ejecución en CPU arm64 genérica mediante XNNPACK, sin requisitos de hardware específico.
- Ventanas de contexto seleccionables entre 512 y 32.768 tokens según el artefacto elegido.
- Comportamiento "heretic": el modelo base está ajustado para reducir rechazos, lo que puede afectar a la moderación por defecto.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales offline en Android: la app openweights o una integración propia con ExecuTorch permite mantener conversaciones multi-turno sin enviar datos a la nube, usando el artefacto XNNPACK de 4k u 8k según la memoria del teléfono.
- Clasificación y resumen de texto local en apps móviles: con el artefacto de 2.048 tokens (0,80 GB) se pueden procesar correos, notas o mensajes y generar resúmenes en el propio dispositivo, evitando costes de API y problemas de privacidad.
- Prototipado rápido de funciones de IA generativa en apps Android: el archivo XNNPACK de 2k es el más ligero y permite validar prompts y flujos antes de invertir en infraestructura de servidor.
- Inferencia acelerada por NPU en dispositivos Dimensity 9400: los artefactos NeuroPilot a16w8 (0,27-0,41 GB por chunk) permiten descargar el trabajo de la CPU y reducir consumo energético en tareas de generación continua, como autocompletado o chat persistente.
- Aplicaciones de campo sin conectividad: técnicos, personal sanitario o agentes rurales pueden usar un asistente de texto en un teléfono sin cobertura, con el artefacto de 8k o 16k para mantener contexto de conversación largo.
- Evaluación de modelos "heretic" en entornos controlados: investigadores pueden desplegar la variante sin rechazos en un dispositivo aislado para estudiar comportamiento, sesgos y robustez sin depender de servicios externos.
- Integración en pipelines de CI para tests de regresión on-device: los archivos `.pte` con ventana fija permiten automatizar pruebas de humo reproducibles (el autor reporta "Paris" como respuesta de smoke test) en granjas de dispositivos Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pruebas de humo cualitativas: los cinco artefactos XNNPACK superaron la prueba con la respuesta "Paris", mientras que los artefactos MediaTek NeuroPilot solo fueron verificados estructuralmente, sin ejecución real en NPU (no hay runtime de NPU en el host de compilación).

| Artefacto | Backend | Ventana | Tamano | Prueba |
|---|---|---|---|---|
| 8da4w-gptq-2k | XNNPACK | 2.048 | 0,80 GB | superada ("Paris") |
| 8da4w-gptq-4k | XNNPACK | 4.096 | 0,80 GB | superada ("Paris") |
| 8da4w-gptq-8k | XNNPACK | 8.192 | 0,80 GB | superada ("Paris") |
| 8da4w-gptq-16k | XNNPACK | 16.384 | 0,81 GB | superada ("Paris") |
| 8da4w-gptq-32k | XNNPACK | 32.768 | 0,83 GB | superada ("Paris") |
| neuropilot-a16w8-512 (4 chunks) | MediaTek NPU | 512 | 0,27-0,41 GB | solo estructura |
| neuropilot-a16w8-2k (4 chunks) | MediaTek NPU | 2.048 | 0,27-0,41 GB | solo estructura |
| neuropilot-a16w8-4k (4 chunks) | MediaTek NPU | 4.096 | 0,27-0,41 GB | solo estructura |
| neuropilot-a16w8-8k (4 chunks) | MediaTek NPU | 8.192 | 0,27-0,41 GB | solo estructura |

## Requisitos de hardware

- VRAM/RAM estimada: los artefactos XNNPACK ocupan entre 0,80 y 0,83 GB en disco; la caché KV se asigna completa al cargar, por lo que el consumo en memoria supera el tamaño del archivo. El `config.json` de cada carpeta incluye `fits_phone_budget`, una estimación frente a un presupuesto de 5 GB.
- Artefactos MediaTek: entre 0,27 y 0,41 GB por chunk, cuatro chunks por ventana de contexto; requieren un SoC MT6991 (Dimensity 9400) con soporte NeuroPilot.
- GPU recomendadas: no aplica; el despliegue es en CPU arm64 (XNNPACK) o NPU MediaTek. No se mencionan backends CUDA, ROCm ni Metal.
- Cabe en GPU consumer: no es el objetivo; el modelo está diseñado para teléfonos Android, no para tarjetas gráficas de escritorio.
- Opciones de despliegue: runtime ExecuTorch 1.4.0, aplicación Android openweights (https://github.com/alpharomercoma/openweights), backend XNNPACK y backend MediaTek NeuroPilot. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Instruct-heretic-ExecuTorch (este) | 1,2B | 512-32.768 (fijo por archivo) | ExecuTorch `.pte` | lfm1.0 | Android CPU/NPU |
| experimentalmachines/LFM2.5-1.2B-Instruct-heretic (base) | 1,2B | no disponible | no disponible | lfm1.0 | genérico |
| LiquidAI/LFM2.5-1.2B-Instruct (original) | 1,2B | no disponible | no disponible | lfm1.0 | genérico |
| Alternativas de 1-2B on-device (Gemma, Qwen, Phi) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con otros modelos de la misma categoría (1-2B parámetros para dispositivo) no puede completarse con datos verificados en la información proporcionada; se indica "no disponible" para evitar cifras sin respaldo.

## Limitaciones y advertencias

- La variante "heretic" está ajustada para reducir rechazos; esto puede traducirse en respuestas menos filtradas y en un mayor riesgo de contenido inapropiado en producción, por lo que se recomienda moderación externa.
- Riesgo de alucinación inherente a un modelo de 1,2B parámetros; no debe usarse como fuente de verdad en dominios críticos sin verificación.
- La ventana de contexto está fijada en el archivo y no es modificable en ejecución; elegir una ventana mayor incrementa el consumo de memoria al cargar la caché KV completa.
- Los artefactos MediaTek solo han sido verificados estructuralmente, no ejecutados en NPU; su funcionamiento real en dispositivo no está confirmado por el autor.
- El repositorio pesa 11,3 GB en total, aunque cada artefacto individual es mucho menor; la descarga completa puede ser costosa en almacenamiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Licencia lfm1.0: es necesario revisar los términos de LiquidAI antes de uso comercial; la model card enlaza a https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE y no se detallan restricciones en la información proporcionada.
- No hay soporte documentado para servidores, GPUs de datacenter ni frameworks de serving convencionales; el uso está restringido al ecosistema ExecuTorch.
- Los artefactos XNNPACK solo se han validado con una prueba de humo ("Paris"); no hay evaluación de calidad de generación, latencia ni consumo energético.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-heretic-ExecuTorch
- Modelo base de la exportación: https://huggingface.co/experimentalmachines/LFM2.5-1.2B-Instruct-heretic
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
