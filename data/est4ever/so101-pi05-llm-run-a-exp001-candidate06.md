# est4ever/so101-pi05-llm-run-a-exp001-candidate06

## Resumen

SO-101 π0.5 LLM Run A experiment 001, candidate 06 es un checkpoint experimental de robótica derivado de LeRobot π0.5, el modelo de visión-lenguaje-acción (VLA) de Hugging Face para control robótico. Lo publica el usuario est4ever como comparador dentro de un experimento de optimización sin gradientes sobre un fine-tuning previo del modelo base π0.5, orientado al robot SO-101. El checkpoint incorpora componentes de Gemma y se distribuye bajo licencia Gemma, con pesos en safetensors y dependencia de la librería LeRobot para inferencia.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un tamaño de repositorio de 9,4 GB. No es un modelo de lenguaje generalista: es una política VLA que combina percepción visual, instrucciones en lenguaje natural y salida de acciones motoras. Su relevancia es acotada y fundamentalmente metodológica: documenta un intento de mejora mediante seis propuestas de LLM en modo forward-only (sin entrenamiento por gradiente), con solo tres tensores modificados respecto al checkpoint original.

El propio autor lo marca como rechazado por el criterio de confirmación predefinido: la mejora de MAE normalizado en un panel de monitorización reutilizado fue del 0,5455 % frente al original, pero quedó un 5,9594 % por debajo del rendimiento del modelo entrenado con gradientes en el paso 2.000. No se ha demostrado éxito robótico ni generalización a posiciones nuevas, por lo que no debe considerarse una versión validada ni un sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) derivada de LeRobot π0.5; componentes basados en Gemma; no se detalla la configuracion interna de capas |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma (con terminos Gemma, politica de uso prohibido y NOTICE incluidos) |
| Formato de pesos | safetensors (model.safetensors), mas config.json, dos JSON de procesador y dos safetensors de normalizacion |

## Arquitectura y entrenamiento

El checkpoint desciende de Rob8435/so101fullft_gb_lr_wande_11_8_26 (revision c3e417720643dac3446bffb4c0578886331c9a3a), que a su vez parte de LeRobot π0.5 (lerobot/pi05_base). La arquitectura subyacente es la de π0.5, un modelo de visión-lenguaje-acción que procesa observaciones visuales e instrucciones textuales para emitir acciones de robot; incorpora componentes basados en Gemma y depende del tokenizer externo google/paligemma-3b-pt-224.

El entrenamiento de este candidato no emplea gradientes ni ajuste de optimizador. Se evaluaron seis propuestas de LLM en modo forward-only y la búsqueda se detuvo anticipadamente bajo una cláusula de parada predeclarada por agotamiento de hipótesis. Exactamente tres tensores cambiaron: la proyección down del MLP del experto de la capa 0, la proyección de salida de atención del experto de la capa 0 y el sesgo de salida de acciones. Los archivos edit_provenance.json, independent_export_verification.json y reload_verification.json documentan las transformaciones y las comprobaciones de integridad de tensores e inferencia.

## Capacidades

- Control robótico mediante políticas VLA: genera acciones motoras a partir de observaciones visuales e instrucciones, en el marco de LeRobot para el robot SO-101.
- Percepción visual integrada: procesa imágenes mediante componentes de tipo PaliGemma/Gemma.
- Interpretación de instrucciones en lenguaje natural como condicionamiento de la política.
- Inferencia con la librería LeRobot, usando config.json, model.safetensors, los JSON de procesador y los safetensors de normalización.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es una política de acción, no un agente conversacional.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): visión sí, como parte del pipeline VLA; audio y thinking mode no disponibles.

## Casos de uso

- Investigación en optimización sin gradientes de políticas VLA: sirve como comparador documentado para estudiar si las propuestas de un LLM en forward-only pueden mejorar un checkpoint fine-tuneado; los JSON de procedencia y verificación permiten reproducir el análisis.
- Reproducción de experimentos de robótica: el checkpoint y sus artefactos de verificación permiten auditar la edición de tensores y la recarga del modelo en pipelines de LeRobot.
- Evaluación comparativa de métodos de ajuste: útil para contrastar el rendimiento de ediciones puntuales frente a entrenamiento por gradientes (en este caso, el candidato queda un 5,9594 % peor que el modelo entrenado en el paso 2.000).
- Docencia y formación en VLA: ejemplo realista de un checkpoint experimental con métricas de monitorización y criterios de confirmación explícitos.
- Pruebas de integración de LeRobot: validar la carga de config.json, procesadores y safetensors de normalización en entornos de desarrollo.
- Referencia negativa en publicaciones: documentar un caso en el que la mejora en un panel reutilizado no supera el umbral de confirmación, ilustrando buenas prácticas de validación.
- No recomendado para despliegue en producción robótica: el autor no demuestra éxito robótico ni generalización a posiciones nuevas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MAE normalizado en panel de monitorizacion reutilizado (candidato) | 0,0215988554 |
| MAE normalizado del checkpoint original | 0,0217173178 |
| Mejora relativa frente al original | 0,5455 % |
| MAE normalizado de Run A entrenado con gradientes en paso 2.000 | 0,0203840825 |
| Diferencia frente a Run A con gradientes | 5,9594 % peor |
| Criterio de confirmacion | fallido (el intervalo de la puntuacion de confirmacion incluyo cero) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la informacion disponible. Las metricas anteriores son de monitorizacion robótica y de carácter exploratorio; no establecen éxito robótico ni generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,14 mil millones de parámetros y pesos en safetensors (repo de 9,4 GB), la inferencia en precisión nativa requiere del orden de 8-9 GB solo para pesos, más memoria para activaciones y el tokenizer externo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, cabría en GPUs de 16 GB o más, pero no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente en modelos con 16 GB o más de VRAM, aunque no está confirmado; requiere verificación con la configuración real.
- Opciones de despliegue: LeRobot (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas y no se garantiza compatibilidad al ser una política VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| est4ever/so101-pi05-llm-run-a-exp001-candidate06 | 4.143.404.816 | no disponible | MAE 0,0215988554; rechazado por criterio de confirmacion | gemma | Hugging Face, 0 descargas |
| Rob8435/so101fullft_gb_lr_wande_11_8_26 (checkpoint padre) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| lerobot/pi05_base (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| Run A entrenado con gradientes (paso 2.000) | no disponible | no disponible | MAE 0,0203840825 | no disponible | Referencia interna del experimento |

## Limitaciones y advertencias

- No se ha demostrado éxito robótico ni generalización a posiciones nuevas; el autor lo indica explícitamente.
- El candidato fue rechazado por el criterio de confirmación predefinido: el intervalo de la puntuación de confirmación incluyó cero.
- El panel de monitorización es datos de desarrollo previamente inspeccionados y puede haber aparecido en el conjunto de fine-tuning upstream, lo que sesga la evaluación.
- Solo se modificaron tres tensores; la mejora de 0,5455 % frente al original es marginal y queda por debajo del modelo entrenado con gradientes.
- La licencia Gemma impone términos, política de uso prohibido y NOTICE; el código LeRobot es Apache-2.0, pero esa licencia no relicencia los pesos.
- El permiso de Rob8435 para compartir derivados fue confirmado por el usuario que sube el modelo, pero no se afirma una concesión publicada ni licencia separada de Rob8435.
- Dependencia externa del tokenizer google/paligemma-3b-pt-224, cuya revisión original de entrenamiento no está fijada.
- Las rutas locales embebidas en la configuración son procedencia, no rutas portables de descarga.
- Riesgo de alucinación y sesgos: no disponible; al ser una política VLA, el riesgo principal es de comportamiento motor inseguro, por lo que se recomiendan salvaguardas robóticas adecuadas.
- Uso comercial: sujeto a los términos de la licencia Gemma; no se detallan restricciones adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/est4ever/so101-pi05-llm-run-a-exp001-candidate06
- Checkpoint padre: https://huggingface.co/Rob8435/so101fullft_gb_lr_wande_11_8_26
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Tokenizer externo: https://huggingface.co/google/paligemma-3b-pt-224
- Terminos de licencia Gemma: no disponible en la informacion proporcionada (referenciados en la model card)
