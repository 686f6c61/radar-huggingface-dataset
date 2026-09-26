# dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter400

## Resumen

El repositorio `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter400` contiene un adaptador LoRA de rango 256 para generación de vídeo robótico, extraído de la iteración 400 de un entrenamiento cuyo run se identifica como `v2w_panda_widowx_level2_widowx_texture_2cam_hstack_from_widowx250_video_fused_f0cea76_lora_r256`. No es un modelo independiente: se trata de un checkpoint de solo adaptador que debe cargarse sobre un backbone concreto de tipo `fused_video2world_dit`, publicado en el repositorio `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b...`, fichero `checkpoints/video_backbone/iter_000001060_fused.pt`, iteración de origen 1060).

El modelo pertenece a la familia MimicVideo, un pipeline de generación de vídeo condicionada por texto orientado a robótica (pipeline declarado en HuggingFace: `robotics`). El adaptador está especializado en predicción de vídeo multi-cámara de tareas de manipulación sobre plataformas Panda y WidowX, con dos vistas (`observation.images.corner_cam` y `observation.images.front_cam`) concatenadas horizontalmente (`hstack`) a 5 Hz. El backbone base usa un transformador de difusión (DiT) de vídeo y un codificador de texto T5-11B, y ya incorpora una fusión LoRA previa de WidowX/Bridge, de modo que cargar el backbone original de Bridge en su lugar sería incorrecto según la propia model card.

Su relevancia es de nicho y eminentemente investigadora: se publica como pieza reproducible de un experimento de transferencia cross-embodiment (Panda y WidowX) con condicionamiento por textura visual y por 24 instrucciones asociadas a episodios. No tiene métricas publicadas, cero descargas y cero "likes" en el momento de la consulta, y no declara licencia, por lo que debe tratarse como artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de vídeo, tipo `fused_video2world_dit`, con adaptador LoRA de rango 256 |
| Parámetros totales | no disponible (tamaño del backbone: 3.913.057.284 bytes ≈ 3,64 GiB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos PyTorch sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible (el condicionamiento textual procede de instrucciones de tareas robóticas en el dataset de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt` para el backbone y pesos de adaptador; el tokenizador de vídeo se distribuye como `.pth`) |
| Rango de LoRA | 256 |
| Iteración del adaptador | 400 |
| Iteración del backbone | 1060 |
| Backbone requerido | `dreamdifferent/widowx250-video-fused`, revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, ruta `checkpoints/video_backbone/iter_000001060_fused.pt` |
| SHA-256 del backbone | `d0f24c049bee63b03d3b62747b240a2d1822ddd5f83a52fcd866a882e80122b1` |
| Encoder de texto | T5-11B (directorio `text_encoder/t5-11b`) |
| Tokenizador de vídeo | `video_backbone/tokenizer/tokenizer.pth` |
| Tamaño del repositorio | 3,7 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-25 |
| Última actualización | 2026-09-25 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un backbone de difusión para vídeo (`fused_video2world_dit`) que combina un transformador de difusión con un codificador de texto T5-11B y un tokenizador de vídeo propio (`tokenizer.pth`). La model card insiste en un punto crítico de reproducibilidad: el checkpoint inicial indicado ya contiene una fusión LoRA previa de WidowX/Bridge, por lo que no debe sustituirse por el backbone original de Bridge. El adaptador publicado es de rango 256 y el run de origen incluye el sufijo `f0cea76`, coherente con la revisión del backbone.

Los datos de entrenamiento se describen mediante un contrato explícito: 256 episodios y 54.349 fotogramas del dataset `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture` (revisión `994be7f8952807008c316db7943ec732bf70b978`), con dos cámaras (`corner_cam` y `front_cam`) concatenadas en `hstack` a 5 Hz y 24 instrucciones condicionadas por episodio, listadas en `vam_cross_video_lora_manifest.json`. No se especifica el número total de tokens, la composición detallada del dataset ni si hubo fases de RLHF o DPO; en un modelo de difusión de vídeo estos mecanismos no son de aplicación directa, y la model card no documenta ningún esquema de preferencias. El dataset no se distribuye con el repositorio y queda sujeto a su propia política de acceso.

En cuanto a artefactos de ejecución, la model card fija la versión de MimicVideo (`e3355dbc93132b576c02f920a59b4fc18a4f5906`), el bundle de checkpoints (`jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`) y tres ficheros de configuración que deben respetarse: `config.yaml`, `vam_cross_video2world_config.json` y `vam_cross_video_lora_manifest.json`. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) más allá de la propia fusión de LoRA sobre el backbone.

## Capacidades

- Generación de vídeo condicionada por texto e imagen inicial: el pipeline `Video2World` produce predicciones de vídeo a partir de condicionamiento textual (encoder T5-11B) y del estado visual de entrada.
- Predicción multi-cámara: genera las dos vistas `observation.images.corner_cam` y `observation.images.front_cam` en una disposición `hstack`, lo que permite mantener coherencia entre cámaras en una misma escena.
- Modelado temporal a 5 Hz: la frecuencia de muestreo del entrenamiento (5 Hz) define la granularidad temporal esperable de las predicciones.
- Condicionamiento por instrucciones de tarea: soporta las 24 instrucciones condicionadas por episodio registradas en `vam_cross_video_lora_manifest.json`.
- Especialización en textura y dominio visual: el sufijo `texture` del run indica un ajuste orientado a la apariencia superficial de las escenas de manipulación.
- Transferencia cross-embodiment: la combinación `cross-level2` con `panda_widowx` apunta a escenarios de transferencia entre la plataforma Panda y la WidowX (esta última vía un backbone derivado de `widowx250`).
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es generativo de vídeo, no un planificador.
- Capacidades multilingües: no disponible.
- Modo "thinking", visión de propósito general o audio: no disponible; el modelo está restringido al dominio robótico de manipulación descrito.

## Casos de uso

- Aumento de datos para aprendizaje por imitación: el adaptador puede generar trayectorias visuales sintéticas de manipulación sobre Panda y WidowX a partir de instrucciones, ampliando los 256 episodios y 54.349 fotogramas del dataset original antes de entrenar una política.
- Modelo de mundo para planificación: dado un estado visual y una instrucción, el modelo predice fotogramas futuros de las dos cámaras, lo que permite evaluar acciones candidatas antes de ejecutarlas sobre el robot real.
- Transferencia entre plataformas robóticas: el carácter `cross-level2` panda/widowx permite estudiar si una representación aprendida en una plataforma predice adecuadamente la apariencia y la dinámica de la otra, reduciendo el coste de recoger datos en cada robot.
- Generación de demostraciones para tareas con pocas muestras: para las 24 instrucciones del manifiesto, se pueden sintetizar episodios adicionales cuando la cobertura real es escasa, siempre que el dominio visual coincida con el del entrenamiento.
- Validación de políticas antes del despliegue: comparar el vídeo predicho con el vídeo observado tras ejecutar una política ofrece una señal de discrepancia útil para detectar fallos de control sin arriesgar hardware.
- Investigación en coherencia multi-cámara: la salida `hstack` a 5 Hz facilita experimentos sobre consistencia geométrica y de textura entre vistas, un problema habitual en percepción robótica.
- Reproducción de experimentos de LoRA a gran escala: al ser un adaptador de rango 256 sobre un backbone congelado, sirve para estudiar el efecto del rango y de la iteración de entrenamiento (400 en este caso) en la calidad de la generación.
- Construcción de conjuntos de evaluación sintéticos: generar vídeos contrafactuales con condiciones controladas para medir la robustez de sistemas de visión robótica ante cambios de textura o iluminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de vídeo (FVD, FID, PSNR, SSIM), de éxito de tarea ni comparaciones cuantitativas con otros checkpoints. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia de orden de magnitud, solo los pesos del backbone ocupan 3,64 GiB en disco y el repositorio del adaptador 3,7 GB, además del encoder de texto T5-11B (denominación `t5-11b`, aproximadamente 11.000 millones de parámetros, con un consumo en memoria muy superior al de los pesos del DiT). Cualquier cifra concreta de VRAM sería especulativa sin datos del autor.
- GPU recomendadas: no disponible. Por el volumen de parámetros del encoder de texto y del backbone, un despliegue realista requeriría GPU de centro de datos (A100, H100 o similares); una RTX 4090 de 24 GB es dudosa para la configuración completa en precisión nativa.
- Compatibilidad con GPU de consumo: no confirmada. El cuello de botella previsible es el encoder T5-11B, no el adaptador LoRA.
- Opciones de despliegue: no se puede usar vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue exige el código de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` junto con el bundle `jonpai/mimic-video@f28339034831e3c2374be075e622e1ff38ebe0f8`, el backbone exacto de WidowX-250, el tokenizador de vídeo y el directorio `text_encoder/t5-11b`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / datos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter400` | LoRA r256, iter400, dominio textura Panda/WidowX, 2 cámaras | `widowx250-video-fused` @ `f0cea76` | no disponible | no disponible | pública en HuggingFace, 0 descargas |
| `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter400` | LoRA, iter400, dominio textura con variante Robotiq | no disponible | no disponible | no disponible | pública en HuggingFace |
| `dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200` | LoRA, iter200, con UR5e y contacto v2 | no disponible | no disponible | no disponible | pública en HuggingFace |
| `dreamdifferent/widowx250-video-fused` (backbone base) | DiT de vídeo `fused_video2world_dit`, iter1060 | incluye fusión LoRA WidowX/Bridge previa | no disponible | no disponible | pública en HuggingFace |

Las diferencias entre los tres adaptadores del mismo autor se limitan, según los nombres de repositorio, al brazo robótico adicional (Robotiq, UR5e), al número de iteraciones (200 frente a 400) y al dominio visual. No hay métricas públicas que permitan ordenarlos por calidad, por lo que la comparación es puramente estructural.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, por lo que no hay permiso explícito de uso comercial ni condiciones claras de redistribución. Cualquier uso en producción requiere aclarar previamente los términos.
- Dependencia de artefactos externos: el adaptador no funciona solo. Requiere el backbone exacto (revisión y SHA-256 concretos), el código de MimicVideo en un commit concreto, el bundle de checkpoints, el tokenizador de vídeo y el encoder T5-11B.
- Riesgo de configuración incorrecta: la model card advierte explícitamente de que cargar el backbone original de Bridge en lugar del checkpoint fusionado `fused_video2world_dit` produce resultados incorrectos.
- Datos no incluidos: el dataset de entrenamiento no se distribuye y está sujeto a su propia política de acceso, lo que limita la reproducibilidad completa del experimento.
- Términos de terceros: el uso queda condicionado a los términos de MimicVideo, de NVIDIA Cosmos y del checkpoint base, según se indica en la model card.
- Sesgos y cobertura: el entrenamiento se limita a 256 episodios, 54.349 fotogramas, dos cámaras y 24 instrucciones de un único dominio de manipulación, por lo que se espera un sesgo fuerte hacia las texturas, iluminaciones, disposiciones de cámara y objetos vistos durante el entrenamiento.
- Generalización fuera de dominio: cualquier escena con configuración de cámara distinta a `hstack` a 5 Hz, o con instrucciones fuera de las 24 registradas, queda fuera del contrato de datos declarado.
- Riesgo de predicciones físicamente implausibles: como modelo generativo de vídeo, puede producir fotogramas visualmente verosímiles pero inconsistentes con la dinámica real del robot (objetos que se atraviesan, contactos imposibles), lo que invalida su uso directo como simulador sin validación.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin métricas publicadas ni evaluaciones de terceros.
- Idiomas: no se especifica ningún soporte multilingüe; las instrucciones de entrenamiento provienen de un manifiesto de tareas cerrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture-video-lora-iter400
- Backbone requerido: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-widowx-widowx-texture
- Bundle de checkpoints MimicVideo: https://huggingface.co/jonpai/mimic-video
- Adaptador hermano (Panda/Robotiq/WidowX, textura, iter400): https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-video-lora-iter400
- Adaptador hermano (Panda/Robotiq/WidowX/UR5e, contacto v2, iter200): https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robotiq-widowx-texture-ur5e-contact-v2-video-lora-iter200
- Paper, blog o demo oficial: no disponible en la información proporcionada.
