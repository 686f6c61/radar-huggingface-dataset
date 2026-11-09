# est4ever/so101-pi05-continuation001-A-step2000

## Resumen

El modelo `est4ever/so101-pi05-continuation001-A-step2000` es un checkpoint de robótica basado en LeRobot π0.5, una política visuomotora (vision-language-action, VLA) orientada al control de robots manipuladores. Lo publica el usuario `est4ever` como continuación de un ajuste fino previo de `Rob8435/so101fullft_gb_lr_wande_11_8_26`, que a su vez deriva del modelo base `lerobot/pi05_base`. El checkpoint se ha entrenado para la plataforma robótica SO-101 y se distribuye en formato safetensors con la librería LeRobot.

El modelo incorpora componentes basados en Gemma (el tokenizador configurado es `google/paligemma-3b-pt-224`), lo que explica su licencia Gemma y la inclusión de términos de uso y política de usos prohibidos. Cuenta con 4.143.404.816 parámetros totales y un tamaño de repositorio de 9,4 GB. Es un artefacto experimental: el propio autor indica que no se ha demostrado éxito en tareas robóticas ni generalización a posiciones nuevas.

Su relevancia es acotada y de nicho: se trata de un paso intermedio de un proceso de ajuste fino (2.000 actualizaciones de AdamW, batch efectivo 8, backbone congelado, experto de acción entrenado), útil para quien quiera reproducir o continuar esa línea de trabajo sobre SO-101, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visuomotora VLA basada en LeRobot π0.5 (componentes Gemma/PaliGemma); backbone congelado y experto de acción entrenado |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El checkpoint es una continuación por gradiente del ajuste fino registrado por Rob8435, a partir de LeRobot π0.5. El entrenamiento corresponde al Run A sin aumento de imagen: 2.000 actualizaciones del optimizador AdamW con batch efectivo 8, entrenando el experto de acción y las proyecciones de acción/tiempo mientras el backbone permanece congelado. Se documentan 137 episodios de entrenamiento y 12 de monitorización en `continuation_manifest.json` y `SETUP.md`.

La inferencia requiere `config.json`, `model.safetensors`, ambos ficheros JSON de procesador y ambos safetensors de normalización. El tokenizador configurado (`google/paligemma-3b-pt-224`) es una dependencia externa y su revisión original de entrenamiento no está fijada; las rutas locales embebidas en la configuración son procedencia, no rutas portables de descarga. El manifiesto del checkpoint registra el SHA-256 de los pesos. No se incluyen estados de optimizador ni de entrenamiento.

## Capacidades

- Control visuomotor de robot manipulador: genera acciones a partir de observaciones visuales y del estado del robot para la plataforma SO-101.
- Imitación de políticas: entrenado por imitación sobre episodios de demostración (137 episodios de entrenamiento).
- Integración con el ecosistema LeRobot: se carga mediante la librería `lerobot` con los ficheros de configuración, procesador y normalización incluidos.
- Componentes de visión-lenguaje heredados de PaliGemma/Gemma, según la dependencia del tokenizador configurado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (el uso previsto es robótico, no conversacional).

## Casos de uso

- Reproducción de experimentos de ajuste fino: sirve como punto de partida documentado (paso 2.000, Run A) para continuar o comparar el entrenamiento sobre SO-101, ya que el manifiesto registra episodios, configuración y hash de pesos.
- Evaluación de imitación offline: permite medir el error de imitación normalizado (MAE) sobre el conjunto de monitorización y compararlo con el checkpoint original (0,02038 frente a 0,02172).
- Investigación en políticas VLA para robótica de bajo coste: útil para estudiar cómo se comporta un experto de acción entrenado con backbone congelado en una plataforma SO-101.
- Base para ablaciones de aumento de imagen: al ser el Run A sin aumento, permite contrastarlo con variantes con aumento en el mismo pipeline.
- Docencia y prototipado en laboratorio: permite montar un pipeline LeRobot completo (configuración, procesador, normalización, pesos) con fines formativos, siempre con salvaguardas físicas.
- Integración en entornos de simulación o banco de pruebas: para validar la carga del checkpoint y el flujo de inferencia antes de desplegar en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento aportado es el error de imitación offline sobre el conjunto de monitorización: MAE normalizado de 0,0203840825 frente a 0,0217173178 del checkpoint original. El autor advierte que se trata de error de imitación offline, no de éxito en tarea ni de validación independiente, y que el conjunto de monitorización son datos de desarrollo previamente inspeccionados que podrían haber aparecido en el conjunto de ajuste fino upstream.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143.404.816 parámetros, en FP16 serían necesarios aproximadamente 8,3 GB solo para pesos, más memoria para activaciones y buffers de visión.
- GPU recomendadas: no disponible en la documentación del modelo.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos, cabría en GPUs con 12-16 GB o más en FP16, pero no hay validación publicada.
- Opciones de despliegue: carga mediante la librería `lerobot` con los ficheros de configuración, procesador y normalización incluidos; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| est4ever/so101-pi05-continuation001-A-step2000 | 4.143.404.816 | no disponible | gemma | Checkpoint experimental, paso 2.000, Run A sin aumento |
| Rob8435/so101fullft_gb_lr_wande_11_8_26 | no disponible | no disponible | no disponible | Checkpoint upstream del ajuste fino; MAE de monitorización 0,0217173178 |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Modelo base π0.5 de LeRobot del que deriva la cadena |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se ha demostrado éxito en tareas robóticas ni generalización a posiciones nuevas; el autor lo indica explícitamente.
- El conjunto de monitorización son datos de desarrollo previamente inspeccionados y podría haberse usado en el ajuste fino upstream, por lo que la métrica de MAE no constituye validación independiente.
- Licencia Gemma: incorpora componentes basados en Gemma y está sujeto a los términos de Gemma, su política de usos prohibidos y el NOTICE incluido; el código LeRobot es Apache-2.0, pero esa licencia no relicencia los pesos.
- Procedencia: el permiso de Rob8435 para compartir derivados modificados fue confirmado por el usuario que sube el modelo, pero no se afirma una concesión publicada ni una licencia separada de Rob8435.
- Dependencia externa no fijada: el tokenizador `google/paligemma-3b-pt-224` no tiene revisión de entrenamiento fijada, lo que puede afectar a la reproducibilidad.
- Rutas locales embebidas en la configuración: son datos de procedencia, no rutas portables de descarga.
- No se incluyen estados de optimizador ni de entrenamiento, solo pesos de inferencia.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero aplicables a los componentes de visión-lenguaje heredados.
- Uso en producción: requiere salvaguardas robóticas adecuadas; es un artefacto experimental sin validación de tarea.

## Enlaces

- Hugging Face: https://huggingface.co/est4ever/so101-pi05-continuation001-A-step2000
- Checkpoint upstream: https://huggingface.co/Rob8435/so101fullft_gb_lr_wande_11_8_26
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizador dependiente: https://huggingface.co/google/paligemma-3b-pt-224
