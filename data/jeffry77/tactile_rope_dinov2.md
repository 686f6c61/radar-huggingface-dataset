# jeffry77/tactile_rope_dinov2

## Resumen

`jeffry77/tactile_rope_dinov2` es un repositorio de pesos que contiene dos encoders táctiles («V1» y «V2») construidos sobre la arquitectura DINOv2 e incorporando codificación posicional rotatoria (RoPE), según se deduce del nombre del repositorio y de la referencia al fichero `rope.py` de Depth-Anything-3. El autor publica únicamente los exports de encoder (`encoder.pth`), no los checkpoints completos de entrenamiento (`last.pth`), y advierte explícitamente de que V1 y V2 usan arquitecturas distintas y no son intercambiables.

El modelo no es un modelo generativo ni un LLM: es un backbone de representación para sensado táctil, entrenado con la modalidad de entrada `depth_deform_raw` (mapas de profundidad deformada procedentes de un sensor táctil). Su utilidad es servir como extractor de características congelado o como inicialización para políticas de manipulación robótica, cabeceo de clasificación o fusión visio-táctil. Se distribuye con licencia Apache-2.0, lo que permite uso comercial sin restricciones de atribución no comercial.

El interés práctico del repositorio es doble: por un lado, aplica RoPE —una técnica habitual en modelos de lenguaje— a un encoder visual-táctil, lo que permite teóricamente extrapolar a resoluciones de sensor distintas de las vistas en entrenamiento; por otro, el autor acompaña los pesos con un manifiesto (`weights_manifest.json`) que registra tamaños de fichero, sumas SHA-256 e identificadores de ejecución de entrenamiento, algo poco habitual y muy útil para reproducibilidad. El repo pesa 0,2 GB y no registra descargas ni «likes» en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer con codificación posicional rotatoria (RoPE), derivada de DINOv2; dos variantes (V1 y V2) con arquitecturas distintas entre sí |
| Parámetros totales | no disponible (el autor indica únicamente tamaño «S») |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica / no disponible (entrada táctil de profundidad deformada `depth_deform_raw`; no se documenta resolución ni ventana temporal) |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión de entrenamiento) |
| Idiomas soportados | no aplica (encoder táctil, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pth` (`DINO_TactileRoPE/encoder.pth` y `DINO_TactileRoPE_V2/encoder.pth`); no se ofrece safetensors ni GGUF |
| Tamaño del repositorio | 0,2 GB |
| Modalidad de entrada | `depth_deform_raw` |
| Artefactos auxiliares | `weights_manifest.json` (tamaños, SHA-256, identificadores de ejecución) |

## Arquitectura y entrenamiento

La model card es mínima y no describe el procedimiento de entrenamiento. Lo que sí se afirma es que se trata de dos encoders de tamaño «S» entrenados sobre entrada `depth_deform_raw`, y que V1 y V2 corresponden a arquitecturas diferentes, por lo que los pesos no son intercambiables entre versiones. El nombre del repositorio y la referencia al módulo `rope.py` de Depth-Anything-3 en los resultados de búsqueda apuntan a la sustitución de las posicionales absolutas/aprendidas de DINOv2 por codificación rotatoria aplicada a las coordenadas espaciales del mapa táctil, lo que en la práctica permite variar la resolución del sensor sin reentrenar por completo el encoder.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset táctil, si hubo preentrenamiento sobre DINOv2 original o entrenamiento desde cero, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO (estas dos últimas no tendrían sentido en un encoder de representación). El autor remite al repositorio de código `UniVTAC-Positional_Encoding` para el código y las utilidades de inferencia, que es donde debe consultarse cualquier detalle de pipeline.

## Capacidades

- Extracción de características densas a partir de mapas táctiles de profundidad deformada (`depth_deform_raw`).
- Dos variantes de encoder seleccionadas (V1 y V2) para comparar arquitecturas sobre la misma modalidad de entrada.
- Codificación posicional rotatoria, que en principio permite procesar mapas táctiles de resolución distinta a la de entrenamiento (capacidad inferida del nombre y de las referencias, no verificada en la model card).
- Uso como backbone congelado para sondas lineales o como inicialización para ajuste fino en tareas táctiles downstream.
- Integración en pipelines de PyTorch mediante las utilidades publicadas en el repositorio del autor.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código ni matemáticas: no es un modelo de lenguaje.
- No se documentan capacidades multilingües, de audio ni de visión RGB en sentido estricto.

## Casos de uso

- **Clasificación de contacto y material en robótica de manipulación**: usar el encoder congelado y entrenar una cabeza lineal sobre los embeddings para distinguir texturas, materiales o estados de contacto, aprovechando que el backbone ya ha sido entrenado sobre señales táctiles de profundidad.
- **Detección de deslizamiento en agarres**: alimentar la secuencia de mapas `depth_deform_raw` al encoder y entrenar un clasificador binario de deslizamiento; la ventana de latencia es compatible con control a decenas de hercios al tratarse de un ViT de tamaño «S».
- **Inicialización de políticas de manipulación con refuerzo**: emplear los pesos como inicialización del tronco visual-táctil en un entrenamiento de imitación o RL para tareas de inserción, encaje o atornillado, reduciendo el número de demostraciones necesarias.
- **Fusión visio-táctil**: concatenar o atender los embeddings del encoder táctil con los de un backbone visual (por ejemplo DINOv2 RGB) para políticas que necesiten tanto imagen como contacto, un patrón habitual en tareas de manipulación fina.
- **Modelado de mundo táctil / predicción de consecuencias**: entrenar un predictor de la evolución del mapa de deformación a partir del embedding actual y de la acción del robot, útil para planificación a corto plazo en entornos con contacto.
- **Ablación de codificación posicional en investigación**: comparar V1 frente a V2 manteniendo el resto del pipeline para medir el efecto de RoPE en la generalización a sensores de distinta resolución o geometría; el manifiesto de pesos con SHA-256 facilita la reproducibilidad del experimento.
- **Indexado y recuperación de episodios táctiles**: generar embeddings de episodios de manipulación para búsqueda por similitud en bases de datos de demostraciones, por ejemplo para seleccionar demostraciones análogas antes de un ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión downstream, ni comparaciones con encoders táctiles previos, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con un tamaño de repo de 0,2 GB para los dos exports, cada encoder ocupa previsiblemente decenas de megabytes en FP32. No se dispone de cifra oficial.
- Cabe holgadamente en GPU de consumo: cualquier RTX con 4 GB o más es suficiente; también es viable en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento de cabezas downstream o ajuste fino: RTX 3090/4090 (24 GB) para lotes grandes; A100/H100 solo necesarias si se entrena desde cero o con lotes muy grandes.
- Opciones de despliegue: el repositorio del autor está en PyTorch, por lo que el despliegue natural es un script de inferencia en PyTorch o TorchScript/ONNX exportado manualmente. No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama (no aplica a un encoder táctil).
- Latencia y throughput: no disponibles. A modo de orientación cualitativa, un ViT de tamaño «S» sobre un mapa táctil de resolución reducida suele ejecutarse en pocos milisegundos en GPU moderna, pero esta cifra no está medida ni publicada por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tactile_rope_dinov2 (V1/V2) | Encoder táctil ViT con RoPE | no disponible («S») | `depth_deform_raw` | Apache-2.0 | Pesos `.pth` en HuggingFace |
| DINOv2 ViT-S/14 (Meta) | Encoder visual autosupervisado | ~21 M (referencia de la familia ViT-S/14, no confirmado para este repo) | Imagen RGB; posicionales interpoladas | Pesos publicados por Meta con su propia licencia (consultar antes de uso comercial) | Pesos y código en GitHub/HuggingFace |
| Depth-Anything-3 (ByteDance) | Modelo de profundidad con RoPE en el ViT | no disponible | Imagen RGB | no disponible en esta ficha | Repositorio GitHub |

No se dispone de datos de benchmarks ni de otros encoders táctiles comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como «no disponible».

## Limitaciones y advertencias

- La model card no documenta sesgos ni dominios de entrenamiento; se desconoce sobre qué sensores, materiales y morfologías se entrenó, lo que impide estimar su generalización fuera de la distribución original.
- V1 y V2 no son intercambiables: usar los pesos de una versión con el código de la otra producirá errores o resultados silenciosamente incorrectos.
- Solo se publican los exports de encoder, no los checkpoints completos; no es posible reanudar el entrenamiento tal cual desde estos ficheros.
- No hay métricas publicadas: cualquier afirmación de calidad relativa a otros encoders táctiles carece de respaldo en la información disponible.
- Riesgo de sobreajuste al sensor concreto con el que se generó `depth_deform_raw`; si tu hardware táctil tiene otra resolución o curva de respuesta, necesitarás validación empírica propia.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta y fue creado en octubre de 2026 según los metadatos: es un artefacto de investigación sin validación comunitaria.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia de los pesos DINOv2 originales si el modelo deriva de ellos y se redistribuye un producto.
- No apto para tareas de lenguaje, razonamiento simbólico ni generación de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jeffry77/tactile_rope_dinov2
- Manifiesto de pesos: https://huggingface.co/jeffry77/tactile_rope_dinov2/blob/main/weights_manifest.json
- Código y utilidades de inferencia (UniVTAC-Positional_Encoding): https://github.com/Jeffry-wen/UniVTAC-Positional_Encoding
- DINOv2 (Meta AI, código y pesos base): https://github.com/facebookresearch/dinov2
- Documentación de DINOv2 en Transformers: https://huggingface.co/docs/transformers/model_doc/dinov2
- Implementación de RoPE en Depth-Anything-3: https://github.com/ByteDance-Seed/Depth-Anything-3/blob/main/src/depth_anything_3/model/dinov2/layers/rope.py
