# podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-off

## Resumen

Este repositorio no contiene un modelo generativo, sino un detector de fallos de 6,6 millones de parámetros para una política VLA (vision-language-action). En concreto, es una sonda LSTM (`lstm_modes_clip`) que se alimenta de las features pooladas de 6144 dimensiones del backbone de la política GR00T entrenada sobre el benchmark de manipulación LIBERO-X. Su salida es una puntuación de fallo por paso, acompañada de una cabeza de modo de fallo (10 clases) y una cabeza semántica. Lo publica el usuario `podolinsky` junto al código `vla-probe` en GitHub.

El modelo resuelve un problema acotado pero práctico: dada una trayectoria de ejecución de la política, decidir en qué paso hay que disparar una alarma de fallo. Para ello usa calibración conformal: el fichero de pesos incluye `calibration_maxima`, los 90 máximos de episodios de calibración correctos, de modo que el umbral a nivel alfa se calcula como `k = ceil((n+1)(1-alfa))` y `threshold = sorted(maxima)[k-1]`. La etiqueta empleada en esta variante es `onset_traj`, que marca como positivo cada paso de un episodio fallido.

Es relevante ahora porque la evaluación de políticas VLA en robótica carece de mecanismos baratos y calibrados de detección temprana de fallos, y porque el propio autor reporta una brecha importante entre habilidades vistas y no vistas: 47,87 % en el conjunto visto frente a 19,58 % en el no visto para el split `skill_toggle_appliance_off`. Esa caída es, en sí misma, el dato más informativo del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sonda LSTM (`lstm_modes_clip`) sobre features pooladas de 6144 dimensiones del backbone de la política GR00T; cabezas de fallo por paso, de modo de fallo (10 modos) y semántica |
| Parámetros totales | 6.622.245 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la ventana es la longitud del episodio, definida en `config.json` |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors |
| Idiomas soportados | No aplica: no procesa texto ni lenguaje natural |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.safetensors` (incluye `feature_mean`, `feature_std` y `calibration_maxima`) más `config.json` |

## Arquitectura y entrenamiento

La arquitectura es la sonda `lstm_modes_clip` del repositorio `vla-probe`. El autor no publica capas ocultas, dimensionalidad del estado ni número de capas en la model card; remite a `config.json` para la configuración exacta. La entrada son features de 6144 dimensiones por paso, que deben estandarizarse con `feature_mean` y `feature_std` incluidos en el safetensors. La salida consta de una puntuación de fallo por paso, una distribución sobre 10 modos de fallo y una cabeza semántica. No se trata de un transformer ni de un SSM: es un modelo recurrente pequeño acoplado a un backbone congelado del que solo consume activaciones.

El entrenamiento se realizó sobre los episodios de entrenamiento de un único split de habilidades del dataset `podolinsky/gr00t-libero-x-features-v3`, en concreto `skill_toggle_appliance_off`, elegido aleatoriamente con semilla 0 entre 8 splits posibles (el split se selecciona por resultados de validación, nunca por los no vistos). La etiqueta `onset_traj` marca como positiva cada paso de un episodio fallido. No se documentan número de tokens, composición del dataset, ni uso de RLHF o DPO, algo que tampoco aplica a un clasificador de este tipo. La calibración se hace con los máximos de 90 episodios correctos, lo que da un conjunto de calibración pequeño y con implicaciones directas en la cobertura empírica de las alarmas.

## Capacidades

- Detección de fallo por paso: produce una puntuación escalar por cada paso de la trayectoria de la política, apta para alarmas tempranas.
- Umbral con garantías conformales: el usuario fija el nivel alfa y obtiene el umbral a partir de los 90 máximos de calibración almacenados en los pesos.
- Clasificación de modo de fallo: cabeza de 10 clases que permite distinguir tipos de error, no solo la presencia del mismo.
- Cabeza semántica adicional: descrita en la model card y en `config.json`, sin detalle de sus clases en la información disponible.
- Estandarización autocontenida: los vectores de media y desviación de las features viajan dentro del fichero de pesos, lo que evita desajustes de preprocesado.
- Integración con el ecosistema GR00T/LIBERO-X: consume directamente features del backbone, sin reentrenar la política.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un LLM ni un VLM, y la model card no declara ningún idioma.

## Casos de uso

- Alarma temprana en ejecución de políticas VLA en laboratorio: ejecutar la sonda en paralelo a cada paso de la política y disparar aviso cuando la puntuación supere el umbral conformal del nivel alfa elegido, antes de que el episodio termine en fallo.
- Enrutado a supervisión humana en tareas domésticas: para la skill de apagar un electrodoméstico, usar la alarma para ceder el control a un operador cuando la política entre en un modo de fallo conocido.
- Etiquetado y filtrado de datasets de robótica: puntuar episodios recogidos y descartar o marcar los que superen el umbral, reduciendo el coste de revisión manual de trayectorias.
- Diagnóstico de causa raíz: usar la cabeza de 10 modos para agrupar los fallos por tipo y orientar qué componente de la política (percepción, agarre, planificación) está fallando.
- Evaluación comparativa de checkpoints: monitorizar la tasa de alarmas de distintas versiones de la política GR00T sobre el mismo conjunto de episodios como métrica complementaria a la tasa de éxito.
- Parada de seguridad en brazos manipuladores: integrar la puntuación por paso en el bucle de control y detener el movimiento ante alarma, con la salvedad de que el modelo se entrenó en simulación y requiere validación en el montaje real.
- Investigación en detección de fallos para VLA: servir como línea base reproducible de 6,6 M de parámetros frente a alternativas más costosas, dado que el código de entrenamiento y evaluación es público.
- Monitorización de cambio de distribución: la brecha entre visto (47,87 %) y no visto (19,58 %) sugiere usarlo, con cautela, como señal de que la habilidad ejecutada se sale del dominio de entrenamiento.

## Benchmarks y rendimiento

Métrica reportada por el autor: área bajo la curva de TPR temprana frente a FPR hasta el 40 %, en porcentaje, con alarmas conformales al máximo. Los valores son de un único split y semilla.

| Conjunto | AU-TPR temprana (FPR ≤ 40 %), % |
|---|---|
| Validación | 54,32 |
| Visto (seen) | 47,87 |
| No visto (unseen) | 19,58 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje en la información disponible, y no procede aplicarlos a este modelo. El autor indica que las cifras del artículo son medias sobre todos los splits del mismo tipo, pero no se incluyen en la model card.

## Requisitos de hardware

- VRAM: prácticamente nula. Con 6.622.245 parámetros, los pesos ocupan del orden de 26 MB en fp32 y 13 MB en fp16, sin contar el vector de features de entrada (6144 floats por paso).
- GPU: no es necesaria. Cabe en CPU y en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) sin presión de memoria.
- Memoria del sistema: inferior a 1 GB en la práctica, dominada por el runtime de PyTorch y por el buffer de features de la trayectoria.
- Despliegue: carga directa con `safetensors.torch.load_file` y ejecución en PyTorch, tal como muestra la model card; no se han publicado exportaciones a ONNX o TorchScript. No aplica servir con vLLM, TGI, llama.cpp u Ollama, porque no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado medidas. Por tamaño, el coste dominante por paso es la proyección de la entrada de 6144 dimensiones; el modelo está pensado para ejecutarse en línea junto a la política, no en modo batch masivo.

## Comparativa con modelos similares

| Modelo | Etiqueta | Parámetros | Contexto | Resultado no visto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (`...onset-traj-mode-clip-skill-toggle-appliance-off`) | `onset_traj` | 6.622.245 | Longitud de episodio (no detallada) | 19,58 % AU-TPR | CC BY 4.0 | HuggingFace |
| `podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-off` | `onset_pre` | No disponible | No disponible | No disponible | CC BY 4.0 | HuggingFace |
| Otros detectores de fallo para políticas VLA | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar la variante de etiqueta `onset_pre` del mismo split; el autor la enlaza pero no publica sus cifras en esta model card. No se han identificado en la búsqueda web alternativas comparables con datos públicos.

## Limitaciones y advertencias

- Generalización limitada a habilidades no vistas: el rendimiento cae de 47,87 % a 19,58 % en el conjunto no visto; no debe asumirse que la sonda funcione fuera de las habilidades representadas en entrenamiento.
- Un solo split y una sola semilla (semilla 0): las cifras de esta ficha corresponden a `skill_toggle_appliance_off` y no son extrapolables sin consultar las medias del artículo.
- Conjunto de calibración pequeño: solo 90 episodios correctos, lo que hace que el umbral conformal sea sensible a la variabilidad de la política y del entorno.
- Etiquetado laxo: la etiqueta `onset_traj` marca todos los pasos de un episodio fallido como positivos, por lo que la sonda no localiza necesariamente el instante exacto del fallo.
- Dominio simulado: los datos provienen de LIBERO-X; el comportamiento en un robot real no está validado y el salto sim-to-real puede degradar la detección.
- Dependencia del backbone: la sonda solo es válida con features del mismo extractor y preprocesado (estandarización con `feature_mean` y `feature_std` incluidos); cambiar de checkpoint de GR00T invalida la calibración.
- Sin capacidades de lenguaje ni interacción: no admite prompts, tool calling ni agentes; cualquier uso conversacional es un error de aplicación.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero no ofrece garantías; conviene revisar también la licencia del dataset `gr00t-libero-x-features-v3` y la de la política subyacente antes de un despliegue en producto.
- Riesgo de falsos negativos silenciosos: una puntuación por debajo del umbral no garantiza que el episodio vaya a terminar bien, especialmente en modos de fallo ausentes del entrenamiento.
- Sin métricas de latencia ni de throughput publicadas, la idoneidad para control en tiempo real debe medirse en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-traj-mode-clip-skill-toggle-appliance-off
- Variante con etiqueta `onset_pre`, mismo split: https://huggingface.co/podolinsky/groot-libero-x-probe-lstm-onset-pre-mode-clip-skill-toggle-appliance-off
- Dataset de features LIBERO-X: https://huggingface.co/datasets/podolinsky/gr00t-libero-x-features-v3
- Código de la sonda (`vla-probe`): https://github.com/mpodolinsky/vla-probe
- Artículo y demo: no disponibles en la información proporcionada
- La búsqueda web no devolvió enlaces relevantes al modelo; los resultados obtenidos no guardan relación con él y se han descartado.
