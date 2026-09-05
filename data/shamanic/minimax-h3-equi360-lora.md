# shamanic/minimax-h3-equi360-lora

## Resumen

El modelo `shamanic/minimax-h3-equi360-lora` es un adaptador LoRA (PEFT) desarrollado por el usuario `shamanic` para el modelo base `MiniMaxAI/MiniMax-H3` (Hailuo 3.0). Su función principal es modificar el comportamiento del modelo de texto a vídeo para que genere vídeos en proyección equirectangular 360°, es decir, una esfera completa que envuelve al espectador, con el horizonte en el centro vertical del fotograma y a 24 fps, conservando el audio nativo del modelo base. Esto permite producir clips inmersivos mono-360 listos para visores como Quest, DeoVR o Skybox, tras un proceso de empaquetado con metadatos esféricos.

El adaptador se distribuye como un archivo de pesos de aproximadamente 0,2 GB, con un rango de LoRA de 32, y ha sido entrenado en la plataforma fal durante 2500 pasos (unas 3,9 horas en una GPU H200). El repositorio incluye además el pipeline completo de preparación de datos, desde la curación de vídeos de YouTube hasta el etiquetado con Gemini Flash Lite. La relevancia actual del modelo radica en que permite generar contenido 360° de alta calidad sin necesidad de equipos de captura especializados, abriendo la puerta a la creación rápida de entornos inmersivos para realidad virtual, turismo virtual o arte digital.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre MiniMax-H3, modelo base de texto a vídeo con audio |
| Parametros totales | No disponible (el repositorio del adaptador pesa 0,2 GB; el modelo base no se detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | minimax-community-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT con rango 32 (alpha igual al rango) aplicado a las proyecciones de atención `qkv_proj` y `out_proj` del modelo base MiniMax-H3. El entrenamiento se realizó en el servicio de entrenamiento alojado de fal (`minimax/h3/t2v/trainer`), con una función de pérdida conjunta de vídeo y audio, optimizador AdamW con tasa de aprendizaje 2e-4 y decaimiento lineal, tamaño de lote 1 y 2500 pasos. La pérdida descendió de 1,12 a 0,43 durante el entrenamiento.

Los datos de entrenamiento consisten en 124 clips de aproximadamente 5,5 segundos, extraídos de 47 vídeos reales de 360° de YouTube, organizados en tres categorías: realismo (paseos por la naturaleza, drones, submarinismo), contenido psicodélico (bucles VJ, fractales, arte inmersivo) y escenas de cuevas o subterráneas. Los clips se prepararon escalando a un bucket de 896×384×124 fotogramas a 24 fps, manteniendo el audio estéreo a 32 kHz. Las descripciones se generaron con Gemini Flash Lite a través de fal, con una frase de layout constante antepuesta a cada leyenda y la palabra de activación `equirect360` al inicio. Una innovación técnica destacable es el uso de un estiramiento de la relación de aspecto 2:1 a 21:9 (896×384) durante el entrenamiento, que luego se invierte al empaquetar el vídeo final. No se empleó convolución circular, por lo que la costura del ecuador no es perfecta.

## Capacidades

- Generación de vídeo 360° equirectangular a partir de texto, con la proyección esférica completa que envuelve al espectador.
- Audio nativo generado por el modelo base MiniMax-H3, integrado en el mismo proceso de texto a vídeo.
- Activación mediante el trigger `equirect360` al inicio del prompt, seguido de la frase de layout y la descripción de la escena, incluido el sonido.
- Generación a 21:9 y 768P nativa; el vídeo resultante debe descomprimirse a 2:1 (1536×768) para obtener la relación esférica correcta.
- Control de la intensidad del efecto mediante la escala del LoRA: 1,0 para la proyección completa, valores menores para degradar hacia una toma en perspectiva normal.
- Compatibilidad con el flujo de empaquetado para visores VR mediante la herramienta `spatialmedia` (metadatos mono-360 equirectangular).
- No se documenta soporte de tool calling, funciones de agente ni capacidades multimodales más allá de texto a vídeo con audio.

## Casos de uso

- **Creación de contenido inmersivo para realidad virtual**: generar escenarios 360° con audio para visores como Quest, DeoVR o Skybox. Se usa el prompt con el trigger `equirect360`, se genera en 21:9, se descomprime a 2:1 y se etiqueta con `spatialmedia` para obtener un clip mono-360 reproducible en el headset.
- **Turismo virtual y visitas panorámicas**: producir vídeos de entornos como templos antiguos, cuevas o paisajes naturales que el espectador puede explorar girando la cabeza. El modelo permite crear estos entornos sin necesidad de rodajes con cámara 360.
- **Arte digital y VJ loops**: generar contenido psicodélico e inmersivo, como fractales, bucles visuales o arte de realidad virtual, aprovechando la categoría de datos psicodélicos del entrenamiento.
- **Simulación de entornos para meditación o relajación**: crear vídeos 360° de praderas, cuevas o bosques con sonido ambiente, adecuados para aplicaciones de bienestar o terapias de relajación.
- **Producción de fondos esféricos para videojuegos o entornos virtuales**: utilizar el LoRA para generar texturas panorámicas que puedan integrarse como fondos envolventes en motores de juego o aplicaciones de simulación.
- **Investigación en generación de vídeo panorámico**: emplear el pipeline de entrenamiento incluido en el repositorio para adaptar el modelo a otros dominios o para estudiar la geometría esférica en modelos de difusión de vídeo.
- **Publicación en plataformas de vídeo 360**: generar clips listos para subir a YouTube 360 o Vimeo 360, aplicando el proceso de empaquetado con metadatos esféricos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (1,12 → 0,43) y una comparación visual cualitativa entre la escala 0 y la escala 1, sin métricas estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de texto a vídeo.

## Requisitos de hardware

- El entrenamiento del LoRA se realizó en una GPU H200 (aproximadamente 3,9 horas). Para inferencia no se especifican requisitos de VRAM en la documentación.
- El despliegue principal documentado es a través de la API de fal, en el endpoint `minimax/h3/text-to-video/lora`, que requiere una clave de fal y acepta el LoRA como un archivo safetensors alojado en HuggingFace.
- El adaptador en sí es ligero (0,2 GB), pero el modelo base MiniMax-H3 es de gran tamaño; no se indica si es posible ejecutarlo en GPUs de consumo.
- La ruta `minimax/h3-max` (turbo de 8 pasos) no fue evaluada, por lo que no se recomienda para este LoRA.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Geometria | Audio | Base | Licencia |
|---|---|---|---|---|---|
| shamanic/minimax-h3-equi360-lora | LoRA sobre MiniMax-H3 | 360° equirectangular mono | Sí | MiniMax-H3 | minimax-community-license |
| rehan-fal/minimax-h3-vr180-sbs-lora | LoRA sobre MiniMax-H3 | VR180 stereo side-by-side | Sí | MiniMax-H3 | No disponible en la información |
| Modelo base MiniMax-H3 | Texto a vídeo | Perspectiva estándar | Sí | - | minimax-community-license |

Ambos LoRAs comparten la misma técnica de estiramiento de la relación de aspecto y el mismo modelo base, pero difieren en la gramática visual: el VR180 se centra en ventanas frontales estereoscópicas, mientras que el equi360 produce una esfera completa mono. No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La costura del ecuador (línea de 180°) no es perfecta, ya que el entrenador no ofrece convolución circular. Puede aparecer una discontinuidad tenue que requiere mezcla posterior o un pase de inpaint.
- El modelo base hereda una prioridad de movimiento de cámara (dolly, paneo) que puede provocar movimiento falso en algunos prompts, arrastrando distorsiones por la proyección. Se recomienda incluir "static camera, locked tripod" en el prompt.
- La evaluación se realizó con un número reducido de prompts y una sola semilla; la model card advierte que se debe probar en un headset antes de confiar en el resultado.
- La licencia MiniMax Community License incluye cláusulas de atribución y restricciones territoriales y de ingresos que deben revisarse antes de un uso comercial.
- Los datos de entrenamiento proceden de vídeos de YouTube bajo su licencia estándar y no se redistribuyen en el repositorio; solo se incluye el pipeline de procesamiento.
- No se documentan sesgos específicos ni riesgos de alucinación, pero al ser un adaptador sobre un modelo base, hereda las limitaciones no descritas de MiniMax-H3.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shamanic/minimax-h3-equi360-lora
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- LoRA VR180 relacionado: https://huggingface.co/rehan-fal/minimax-h3-vr180-sbs-lora
- Herramienta spatial-media de Google: https://github.com/google/spatial-media
