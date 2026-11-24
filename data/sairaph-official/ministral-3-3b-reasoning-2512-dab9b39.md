# sairaph-official/Ministral-3-3B-Reasoning-2512-dab9b39

## Resumen

Ministral-3-3B-Reasoning-2512-dab9b39 es una conversión al formato LiteRT-LM (`.litertlm`) del modelo Ministral-3-3B-Reasoning-2512 de Mistral AI, publicada por el usuario sairaph-official como espejo del repositorio original de `litert-community`. El objetivo es permitir la inferencia en dispositivo (on-device) de un modelo de razonamiento de 3.000 millones de parámetros en teléfonos, portátiles y navegadores, sin depender de servidores remotos ni de GPUs de centro de datos.

El modelo base es un transformer de Mistral AI con capacidades de razonamiento explícito (modo thinking), licenciado bajo Apache 2.0. La conversión elimina la torre de visión Pixtral del modelo original y conserva únicamente el decodificador de texto, cuantizado a int4 por bloques (bloque 32) con embedding y lm_head atados a INT8. El resultado es un único archivo de 2,34 GB que cabe en la memoria de un móvil de gama alta y se ejecuta con el runtime LiteRT-LM de Google.

Su relevancia actual radica en que demuestra que un modelo de razonamiento de 3B puede ejecutarse localmente con latencias utilizables (22,3 tokens/s de decodificación en una GPU de Galaxy S26) manteniendo la licencia permisiva Apache 2.0, lo que facilita su integración en aplicaciones comerciales de borde sin costes de API ni cesión de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (decodificador de texto de Ministral-3; sin torre de visión Pixtral) |
| Parametros totales | 3.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (KV cache configurada en la conversion) |
| Tipos de cuantizacion | int4 por bloques (bloque 32), simetrica, con clipping OCTAV; embedding/lm_head atados a INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); archivo `model.litertlm` de 2.342.895.616 bytes |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 3.000 millones de parámetros derivado de Ministral-3-3B-Reasoning-2512 de Mistral AI, que incorpora un modo de razonamiento explícito (el runtime imprime el pensamiento entre etiquetas `[thought]` y `[/thought]` antes de la respuesta final). La conversión a LiteRT-LM conserva solo el decodificador de texto y descarta la torre de visión Pixtral del modelo original, por lo que esta variante es estrictamente texto a texto.

La cuantización aplicada es int4 por bloques de 32 pesos, simétrica, con clipping OCTAV, y mantiene el embedding y el lm_head atados en INT8. El archivo se divide en secciones de menos de 2 GiB cada una para facilitar su carga en dispositivos con límites de memoria. El 16 de noviembre de 2026 se reemplazó el archivo por una versión cuyo grafo de prefill/decode fue reescrito para GPU, manteniendo todos los pesos sin cambios; esta reescritura mejora la decodificación entre 1,40 y 1,43 veces y el prefill entre 1,22 y 1,30 veces en la GPU de un Galaxy S26 respecto al archivo anterior. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking (el modelo emite su cadena de pensamiento antes de la respuesta).
- Razonamiento aritmético y resolución de problemas de varios pasos (el ejemplo de la model card resuelve un problema de proporciones con resultado correcto).
- Generación de texto general y conversación multi-turno dentro de la ventana de 4096 tokens.
- Inferencia on-device en GPU y CPU de dispositivos móviles, y en navegador mediante WebGPU.
- Ejecución local sin conexión a servicios remotos, con los datos permaneciendo en el dispositivo.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de visión: no disponibles en esta conversión (la torre Pixtral se elimina).
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistentes de razonamiento en aplicaciones móviles: el modelo puede resolver problemas aritméticos y de lógica directamente en el teléfono, mostrando el razonamiento al usuario, sin enviar datos a un servidor. Adecuado por su tamaño de 2,34 GB y su decodificación de 22,3 tokens/s en GPU móvil.
- Aplicaciones de privacidad estricta: procesamiento de texto sensible (notas médicas, documentos legales) en el propio dispositivo, ya que la inferencia es completamente local y no requiere red.
- Demos y prototipos en navegador: la demo web de LiteRT-LM carga el archivo y lo ejecuta con WebGPU, lo que permite probar el modelo sin instalación y validar flujos de razonamiento antes de integrarlo en una app nativa.
- Educación y tutoría offline: un tutor de matemáticas o ciencias que explique paso a paso sus deducciones en dispositivos sin conectividad, aprovechando el modo thinking para mostrar el proceso.
- Herramientas de productividad en portátiles: asistentes de redacción o resumen integrados en aplicaciones de escritorio con LiteRT-LM, donde la ventana de 4096 tokens cubre correos, notas y documentos cortos.
- Automatización de tareas de razonamiento en el borde (edge): clasificación y resolución de incidencias en dispositivos industriales o IoT con capacidad de cómputo limitada, donde no es viable desplegar un modelo mayor.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion | 22,3 tokens/s | Galaxy S26, GPU, LiteRT-LM v0.19.0, mediana de iteraciones 2-3 |
| Prefill | 213 tokens/s | Galaxy S26, GPU, prefill de 1024 tokens |
| Mejora de decodificacion vs archivo anterior | 1,40-1,43x | Galaxy S26 GPU, ejecuciones consecutivas |
| Mejora de prefill vs archivo anterior | 1,22-1,30x | Galaxy S26 GPU |
| Mejora de decodificacion en Pixel 11 Pro | 1,31-1,40x | GPU, respecto al archivo anterior |
| Memoria GPU (kgsl_page_alloc) | 4,35 GB | Galaxy S26 GPU durante la ejecucion |
| Memoria pico en CPU (VmHWM) | 4,69 GB | Galaxy S26 CPU |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo `model.litertlm` ocupa 2,34 GB; la memoria pico medida en CPU de móvil es de 4,69 GB y la asignación GPU en un Galaxy S26 alcanza 4,35 GB.
- GPU recomendadas: GPU integradas de móviles de gama alta (Galaxy S26, Pixel 11 Pro) mediante el backend GPU de LiteRT-LM; en escritorio, cualquier GPU compatible con WebGPU para la demo de navegador.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para GPUs integradas de móvil y portátiles; no se proporcionan datos para RTX 4090, A100 o H100, ya que el formato `.litertlm` está orientado a LiteRT-LM y no a esos entornos.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm` y binario `litert_lm_main`), con backends GPU y CPU; demo web con WebGPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 22,3 tokens/s de decodificación y 213 tokens/s de prefill en Galaxy S26 GPU; no se proporcionan datos de latencia para otros dispositivos salvo las mejoras relativas en Pixel 11 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Reasoning-2512 (LiteRT-LM, esta ficha) | 3B | 4096 | `.litertlm` int4 | Apache 2.0 | Conversion on-device, solo texto, sin datos de benchmarks estandar |
| Ministral-3-3B-Reasoning-2512 (original, Mistral AI) | 3B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo base completo, incluye torre de vision Pixtral; sin datos de rendimiento en la informacion |
| Otros modelos de 3B on-device | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (modelos de 3B en formato LiteRT-LM u otros formatos on-device) en términos de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Es un espejo no oficial: el repositorio sairaph-official copia los archivos del repositorio litert-community; la licencia Apache 2.0 fue añadida por el espejo, no por el autor original del repositorio de conversión.
- Solo texto: la torre de visión Pixtral del modelo base se ha eliminado, por lo que no procesa imágenes.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones extensas.
- El modo thinking no se desactiva correctamente con `--thinking false` en litert-lm 0.19.2, por lo que hay que asignar un límite de tokens alto para evitar respuestas truncadas.
- El CLI de litert-lm (0.14.0 a 0.19.2) reutiliza archivos descargados previamente sin verificar su integridad; una copia anterior al 16 de noviembre de 2026 o una descarga incompleta puede quedar en uso.
- En Android, la ruta GPU requiere LiteRT-LM 0.19.0 o posterior.
- El archivo no fue probado en iOS.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; al ser un modelo de razonamiento de 3B, es esperable una fiabilidad inferior a modelos mayores en tareas complejas.
- Idiomas soportados: no disponibles; no se garantiza un rendimiento multilingüe uniforme.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del repositorio de conversión original.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/sairaph-official/Ministral-3-3B-Reasoning-2512-dab9b39
- Repositorio original de la conversión: https://huggingface.co/litert-community/Ministral-3-3B-Reasoning-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web de chat LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/Ministral-3-3B-Reasoning-2512
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
