# dreamdifferent/widowx250-wrist-ablation-v1-video-fused

## Resumen

El modelo `dreamdifferent/widowx250-wrist-ablation-v1-video-fused` es un checkpoint de un diffusion transformer (DiT) para generacion de video, desarrollado en el marco del proyecto VAM-Cross MimicVideo. Se trata de un backbone de video fusionado, obtenido al aplicar y fusionar un adaptador LoRA entrenado durante 1060 iteraciones sobre un modelo base de `jonpai/mimic-video`. El modelo esta orientado a la manipulacion robotica con el brazo WidowX-250 y utiliza dos camaras (esquina y muñeca) a 5 Hz.

Es un componente de investigacion, no un paquete de inferencia completo: requiere el codigo de MimicVideo, el tokenizer de video y el encoder T5 para funcionar. Su relevancia radica en estudiar la contribucion de la camara de muñeca en la generacion de video de world models roboticos. El dataset de entrenamiento es privado y no se incluye; ademas, la licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) fusionado para generacion de video |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No aplica (modelo de video, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo es un DiT para video, concretamente un checkpoint fusionado de un adaptador LoRA de rango 256 aplicado sobre un backbone inicial llamado `bridge_finetuned_fused`. El backbone procede del repositorio `jonpai/mimic-video` en la revision `f28339034831e3c2374be075e622e1ff38ebe0f8`, con la ruta interna `video_backbone/v2w_bridge_lora_rank256_lr1.778e-04_bsz64_iter_000070043_fused.pt` y SHA-256 `2723645edb158661af6d8e1c623ec21a63626d96e959799abb0b758397ac8c88`.

El adaptador LoRA se entreno durante 1060 iteraciones sobre un dataset privado (revision `dreamdifferent/vam-cross-target-widowx250-native-corner-wrist@577a7e8b083dbdc267aec4eb84c109730884e1ce`) con una unica tarea de manipulacion robotica. Las observaciones de entrada provienen de dos camaras, `observation.images.corner_cam` y `observation.images.wrist_cam`, a una frecuencia de 5 Hz. El checkpoint fusionado resultante es `checkpoints/video_backbone/iter_000001060_fused.pt`. La inferencia requiere el codigo de MimicVideo, el tokenizer de video y el encoder T5, ya que el checkpoint no es autocontenido.

## Capacidades

- Generacion de video predictivo (world model) para entornos roboticos, especificamente para el brazo WidowX-250.
- Entrada multimodo con dos vistas de camara (camara de esquina y camara de muñeca).
- Ajuste fino mediante LoRA fusionado, lo que permite integrar el adaptador directamente en el backbone sin sobrecarga adicional en tiempo de inferencia.
- No dispone de capacidades de tool calling, agentes, vision general, procesamiento de lenguaje natural ni soporte multilingue, al ser un backbone de video y no un modelo de lenguaje.
- El dataset de entrenamiento no se distribuye; solo se publica el checkpoint.

## Casos de uso

- Investigacion en ablacion de sensores: permite evaluar como influye la presencia de la camara de muñeca en la calidad de generacion de video, comparando este checkpoint con variantes sin dicha camara.
- Prediccion de video en manipulacion robotica: se puede integrar en un pipeline de world model para predecir los fotogramas futuros de una tarea con el brazo WidowX-250.
- Aprendizaje por imitacion: el modelo puede generar secuencias de video sinteticas que sirvan para expandir datasets de demostraciones roboticas.
- Validacion de arquitecturas DiT: permite comparar el comportamiento de un checkpoint fusionado a partir de LoRA frente a otros backbones de MimicVideo.
- Simulacion de escenarios de manipulacion: genera video de trayectorias robotica para probar controladores sin necesidad de ejecutar el robot fisico.
- Entrenamiento de politicas visuales: las predicciones del modelo pueden utilizarse como señal auxiliar para entrenar politicas de control basadas en vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 3.9 GB, que corresponde al checkpoint fusionado y sus metadatos.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. Por tratarse de un modelo de video que depende de un encoder T5, se requiere una GPU de gama alta o datacenter, pero no se aportan datos concretos.
- No es compatible con vLLM, llama.cpp, Ollama o TGI al no ser un modelo de lenguaje; el despliegue requiere el entorno de MimicVideo con el tokenizer de video y el encoder T5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo relacionado `dreamdifferent/widowx250-video-fused` existe en HuggingFace, pero no se ha proporcionado informacion tecnica sobre el mismo. Tampoco se conocen especificaciones del backbone original `jonpai/mimic-video` que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un paquete de inferencia completo: se requiere el codigo de MimicVideo, el tokenizer de video y el encoder T5.
- El dataset de entrenamiento es privado y no esta incluido en el repositorio, lo que limita la reproducibilidad.
- La licencia no esta especificada, por lo que el uso comercial es incierto.
- Los terminos de uso del checkpoint base (incluidos NVIDIA Cosmos y el modelo base de MimicVideo) deben respetarse; no se detallan en la ficha.
- Es un modelo de investigacion con un ajuste de solo 1060 iteraciones; no hay evidencia de convergencia ni de rendimiento en produccion.
- La ausencia de benchmarks publicados impide evaluar su calidad frente a otros modelos de generacion de video roboticos.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused
- Modelo relacionado: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Repositorio del backbone: https://huggingface.co/jonpai/mimic-video
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-corner-wrist
- Commit de MimicVideo: `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Documentacion del brazo WidowX-250: https://docs.trossenrobotics.com/interbotix_xsarms_docs/specifications/wx250.html
