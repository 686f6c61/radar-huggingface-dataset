# hmkang/d1sh-molmospaces-pnp-ego

## Resumen

d1sh-molmospaces-pnp-ego es un checkpoint de ajuste fino supervisado (SFT) sobre el modelo base LiquidAI/d1-3B, un modelo de lenguaje de 3.000 millones de parametros desarrollado por Liquid AI. El autor del ajuste es hmkang, y el resultado es un modelo de vision-lenguaje-accion (VLA) orientado a robotica, especificamente a la tarea de pick-and-place (coger y colocar) del entorno MolmoSpaces. El modelo responde a la "pregunta de accion" de d1-showharness emitiendo uno de los 15 tokens discretos de accion del vocabulario molmoego15.

La relevancia de este checkpoint es acotada pero tecnica: no es un modelo de proposito general, sino una politica de robot entrenada para predecir acciones discretas de movimiento, rotacion, agarre, liberacion y finalizacion a partir de imagenes de camara exocéntrica y de muneca. El vocabulario de acciones se define en el marco de la camara de muneca (wrist_camera_zed_mini), con desplazamientos de 2 cm y rotaciones de 10 grados por token.

El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors, con una carpeta de adaptadores LoRA (`d1-3b-lora`) y una carpeta de ajuste completo (`d1-3b-full`) que, segun la model card, aun no se ha subido. La licencia combina LFM Open License v1.0 (la del modelo base) y Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision-lenguaje (base LiquidAI/d1-3B); adaptador LoRA sobre el modelo base |
| Parametros totales | 3.000 millones (modelo base d1-3B); parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el ejemplo de carga) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0-and-apache-2.0 (LFM Open License v1.0 del modelo base + Apache 2.0) |
| Formato de pesos | safetensors (adaptadores LoRA y, previsiblemente, ajuste completo) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/d1-3B, un modelo de vision-lenguaje de 3.000 millones de parametros, y se ajusta mediante SFT con LoRA (rango y alpha no especificados) para la tarea de pick-and-place de MolmoSpaces. La innovacion principal no esta en la arquitectura del transformer, sino en la formulacion de la accion: el modelo emite uno de los 15 tokens discretos del vocabulario molmoego15 (MV_* x6, RT_* x6, GRASP, RELEASE, DONE), todos definidos en el marco de la camara de muneca en el fotograma previo a la accion.

Los datos de entrenamiento provienen del dataset hmkang/molmospaces-pnp-ego-discrete-tokens (config `ego_straight`, revision 624ed3e), con 10.010 episodios y 794.828 fotogramas, divididos en 9.910 episodios de entrenamiento, 100 de validacion y 100 de test. Las imagenes de entrada son las vistas exo1 (randomized_zed2_analogue_1) y de muneca, renderizadas a 624x352 y redimensionadas a 448x256 con PIL LANCZOS. La vista exo2 no se utiliza. El ajuste se realizo durante 3 epocas en la variante LoRA y 1 epoca en la variante de ajuste completo (no subida).

## Capacidades

- Prediccion de acciones discretas de robotica para pick-and-place: 15 tokens que cubren movimiento (adelante/atras, derecha/izquierda, arriba/abajo), rotacion (roll, pitch, yaw) y acciones de agarre, liberacion y finalizacion.
- Procesamiento conjunto de imagen exocéntrica y de muneca (vision-lenguaje) para generar la accion.
- Respuesta a la "pregunta de accion" especifica de d1-showharness, con el prompt y las opciones exactas del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, matematicas, codigo ni audio.
- Capacidades multilingues: no disponibles.
- No se documenta modo de razonamiento (thinking mode) ni vision mas alla del uso como politica VLA.

## Casos de uso

- Politica de pick-and-place en simulacion MolmoSpaces: el modelo recibe las imagenes exo1 y de muneca y emite el token de accion correspondiente, sirviendo como politica base para evaluar tareas de coger y colocar en el entorno `ego_straight`.
- Punto de partida para aprendizaje por refuerzo (RL): la model card indica que la epoca con menor NLL (epoch3 en LoRA, con NLL 0,3936) es la "mejor calibrada" y la recomendada para iniciar RL.
- Investigacion en representaciones discretas de accion: permite estudiar como un VLM de 3B mapea observaciones visuales a un vocabulario cerrado de 15 acciones en el marco de la camara de muneca.
- Evaluacion comparativa de estrategias de ajuste: el repositorio contrasta LoRA (3 epocas) frente a ajuste completo (1 epoca), util para analizar el compromiso entre precision top-1 y calibracion (NLL).
- Generacion de trayectorias de demostracion en simulacion: al predecir acciones paso a paso, puede emplearse para generar rollouts sinteticos en MolmoSpaces antes de transferir a un entorno real (con las cautelas habituales de sim2real).
- Reproducibilidad de experimentos de robotica: el checkpoint, el dataset y el codigo (rama `hyeonmo/molmospace`) permiten reproducir la linea base de SFT para pick-and-place con tokens discretos.

## Benchmarks y rendimiento

Resultados sobre el split de validacion retenido (episodios completos), evaluados al final de cada epoca:

| Variante | Epocas | Mejor NLL (epoca) | Mejor exactitud top-1 (epoca) | Mejor recall macro (epoca) | Recomendado |
|---|---|---|---|---|---|
| d1-3B LoRA | 3 | 0,3936 (3) | 0,8569 (3) | 0,7593 (3) | `d1-3b-lora/epoch3` |
| d1-3B ajuste completo | 1 | 0,4410 (1) | 0,8418 (1) | 0,7167 (1) | `d1-3b-full/epoch1` |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Un modelo de 3.000 millones de parametros en bfloat16 requiere del orden de 6 GB solo para pesos; el adaptador LoRA anade una cantidad marginal. La carga combinada de vision y lenguaje puede elevar el consumo.
- GPU recomendadas: no especificadas en la model card. Por tamano, cabria en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) y en GPUs de datacenter (A100, H100) con holgura.
- Cabe en GPU consumer: previsiblemente si, en tarjetas con 8-24 GB segun cuantizacion y overhead del procesador de vision; no confirmado por el autor.
- Opciones de despliegue: el ejemplo de carga usa `transformers` (AutoModel con `trust_remote_code=True`) y `peft` (PeftModel). Para servir/evaluar se indica `D1_VOCAB=molmoego15`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d1sh-molmospaces-pnp-ego | 3B (base) + LoRA | no disponible | VLA pick-and-place (15 tokens discretos) | lfm1.0-and-apache-2.0 | Hugging Face (0,2 GB) |
| LiquidAI/d1-3B | 3B | no disponible | Vision-lenguaje general | LFM Open License v1.0 | Hugging Face |
| Alternativas VLA de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo responde a la pregunta de accion de d1-showharness con el vocabulario molmoego15 y la generacion `ego_straight`; no es un modelo de proposito general.
- Dependencia estricta del prompt y de las opciones de entrenamiento; debe servirse con `D1_VOCAB=molmoego15` para reproducir el comportamiento esperado.
- Las acciones se definen en el marco de la camara de muneca; un cambio de camara, calibracion o sistema de coordenadas invalida las predicciones.
- La variante de ajuste completo (`d1-3b-full`) no esta subida al repositorio, por lo que solo la LoRA es directamente utilizable.
- Riesgo de sobreconfianza en epocas posteriores: la model card advierte de que epocas mas tardias pueden subir la exactitud top-1 mientras aumenta el NLL; se recomienda la epoca de menor NLL para RL.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no evaluado en el contexto de politica robotica; el modelo podria emitir tokens validos pero fisicamente inadecuados.
- Restricciones de licencia: sujeta a la LFM Open License v1.0 del modelo base; conviene revisar sus terminos para uso comercial antes de desplegar.
- Sin datos publicados de latencia, throughput ni robustez sim2real; el uso en produccion requeriria validacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkang/d1sh-molmospaces-pnp-ego
- Modelo base LiquidAI/d1-3B: https://huggingface.co/LiquidAI/d1-3B
- Licencia del modelo base: https://huggingface.co/LiquidAI/d1-3B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/hmkang/molmospaces-pnp-ego-discrete-tokens
- Codigo (rama `hyeonmo/molmospace`): https://github.com/JunHoo-Lee/d1-showharness-rl/tree/hyeonmo/molmospace
