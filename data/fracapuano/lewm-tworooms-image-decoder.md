# fracapuano/lewm-tworooms-image-decoder

## Resumen

El modelo `fracapuano/lewm-tworooms-image-decoder` es un decodificador de imagen especializado que convierte el embedding CLS proyectado de 192 dimensiones del modelo de mundo LeWM TwoRooms (`quentinll/lewm-tworooms`) en una observación RGB de 224×224 píxeles. Desarrollado por el usuario fracapuano, este componente cierra el ciclo de reconstrucción visual en la arquitectura LeWorldModel (LeWM), permitiendo pasar de representaciones latentes a píxeles sin necesidad de un decodificador generativo complejo.

El modelo sigue la arquitectura de *patch-query* con *cross-attention* repetida, con 3 bloques de atención cruzada, ancho de modelo 256 y 8 cabezas de atención. Tiene aproximadamente 2,67 millones de parámetros entrenables, lo que lo hace extremadamente ligero y desplegable en hardware modesto. Su propósito principal es servir como módulo de reconstrucción en pipelines de world modeling, donde el encoder LeWM comprime observaciones y el decoder las recupera para visualización o análisis.

La relevancia actual radica en que los world models basados en joint-embedding predictivo necesitan decodificadores fiables para interpretar sus espacios latentes. Este modelo, entrenado exclusivamente con binary cross-entropy uniforme sobre RGB, demuestra que es posible reconstruir observaciones con alta fidelidad (PSNR de 46 dB) sin supervisión auxiliar, lo que simplifica el entrenamiento y mejora la estabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder con patch-query y cross-attention repetida (3 bloques, ancho 256, 8 cabezas) |
| Parámetros totales | 2.667.648 (según safetensors; el autor declara 2.667.264) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada: embedding de 192 dimensiones) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El decoder adopta el diseño de *learned patch-query* con *cross-attention* repetida, similar al propuesto en el gist de Lucas Maes. Recibe un embedding crudo de 192 dimensiones (la salida `emb[:, 0]` del encoder LeWM, sin normalizar) y lo transforma en una imagen RGB de 224×224. La normalización de entrada se almacena en el checkpoint, lo que permite usar el modelo directamente sin preprocesado adicional.

El entrenamiento se realizó sobre un subconjunto de 8.192 observaciones del dataset `fracapuano/lewm-tworooms`, con una división episodio-disjunta (5.530 train, 614 validación, 2.048 test). El checkpoint final se optimizó únicamente con binary cross-entropy uniforme sobre los tres canales RGB, sin etiquetas de posición, máscara de agente, ponderación de píxeles rojos ni términos específicos del entorno. Esta decisión simplifica el objetivo y evita sesgos de supervisión. El entrenamiento se ejecutó en un Apple M1 Pro mediante PyTorch MPS, con semilla 1729.

## Capacidades

- Reconstrucción de observaciones RGB a partir de embeddings latentes de 192 dimensiones del modelo LeWM TwoRooms.
- Generación de imágenes de 224×224 píxeles con valores en el rango [0, 1] (sin normalizar).
- Decodificación por lotes: acepta tensores de forma (batch, 192) y devuelve (batch, 3, 224, 224).
- Integración directa con el pipeline de LeWM: el embedding se obtiene de `encoded["emb"][:, 0]` y se pasa al decoder.
- Almacenamiento de la normalización de entrada en el checkpoint, lo que facilita su uso sin configuración adicional.
- Arquitectura ligera (2,6 M parámetros) que permite inferencia en CPU, GPU o incluso en dispositivos con poca memoria.
- No requiere etiquetas auxiliares ni cabezas de posición durante la decodificación, gracias al entrenamiento con BCE uniforme.

## Casos de uso

- Visualización de latentes en world models: el decoder permite convertir las predicciones latentes de LeWM en imágenes comprensibles para inspección humana, útil en depuración y análisis de comportamiento del modelo.
- Reconstrucción de observaciones en entornos simulados: en el entorno TwoRooms, se puede reconstruir el estado visual del agente a partir de su representación latente, facilitando la verificación de que el modelo captura información relevante de la escena.
- Entrenamiento de modelos de mundo con supervisión visual: al disponer de un decoder fiable, se pueden entrenar encoders con objetivos de reconstrucción sin necesidad de decodificadores generativos complejos, reduciendo coste computacional.
- Generación de datos sintéticos para aumento: las reconstrucciones pueden usarse para crear variaciones de observaciones y enriquecer conjuntos de entrenamiento en tareas de control o navegación.
- Análisis de la calidad del espacio latente: midiendo el error de reconstrucción (MSE, PSNR) se puede evaluar cuánta información se pierde en la compresión, guiando mejoras en el encoder.
- Demostraciones educativas de world modeling: al ser un modelo pequeño y autocontenido, sirve como ejemplo didáctico de decodificación de representaciones aprendidas en arquitecturas joint-embedding.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación sobre el conjunto de test (2.048 imágenes, episodios disjuntos):

| Métrica | Valor |
|---|---|
| RGB MSE | 0,00002485 |
| RGB MAE | 0,00074265 |
| PSNR | 46,05 dB |
| RMSE del centroide del agente | 0,407 px |

Estos resultados se obtuvieron con el checkpoint final entrenado únicamente con BCE uniforme. El RMSE del centroide del agente es una métrica diagnóstica *held-out* que no se usó durante el entrenamiento ni la selección de checkpoint, lo que indica que la reconstrucción preserva la posición del agente de forma emergente.

No se han publicado comparaciones con otros decodificadores en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 50 MB (el modelo tiene 2,6 M parámetros, en FP32 ocupa ~10 MB; en FP16 ~5 MB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas. El entrenamiento se realizó en un Apple M1 Pro (MPS), por lo que también es viable en CPU.
- Cabe en cualquier GPU de consumo: sí, incluso en tarjetas antiguas o integradas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede ejecutarse con `torch` directamente, o integrarse en frameworks como vLLM (aunque no es un modelo de lenguaje) o servicios de inferencia personalizados. También es compatible con `llama.cpp` si se convierte a GGUF, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado mediciones, pero dado el tamaño y la arquitectura (3 bloques de cross-attention), la inferencia es del orden de milisegundos en GPU y pocos milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de información sobre decodificadores comparables en el ecosistema LeWM o en otros world models con especificaciones públicas similares. El modelo es específico para el entorno TwoRooms y el espacio latente de LeWM, por lo que no es directamente comparable con decodificadores de propósito general (como VQGAN o Stable Diffusion). Se indica "no disponible" por falta de datos contrastados.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el entorno TwoRooms; no generaliza a otros entornos o distribuciones de imagen.
- Depende del encoder LeWM TwoRooms: el embedding de entrada debe provenir de ese modelo concreto, no de cualquier representación de 192 dimensiones.
- La reconstrucción es específica para observaciones de 224×224; no admite otras resoluciones sin modificar la arquitectura.
- No es un modelo generativo autónomo: solo decodifica embeddings existentes, no puede muestrear nuevas imágenes desde ruido.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o modificaciones. Se recomienda contactar al autor antes de usarlo en producción.
- El entrenamiento se realizó con un único hardware (Apple M1 Pro) y un dataset limitado (8.192 observaciones), lo que podría afectar a la robustez en condiciones fuera de la distribución original.
- No se han documentado sesgos específicos, pero al ser un modelo visual entrenado en un entorno simulado, podría no capturar variaciones realistas de iluminación, texturas o perspectivas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fracapuano/lewm-tworooms-image-decoder
- Dataset TwoRooms: https://huggingface.co/datasets/fracapuano/lewm-tworooms
- Dataset de embeddings: https://huggingface.co/datasets/fracapuano/tworooms-embeddings
- Modelo base LeWM TwoRooms: https://huggingface.co/quentinll/lewm-tworooms
- Página del proyecto LeWorldModel: https://le-wm.github.io/
- Código oficial de LeWM: https://github.com/lucas-maes/le-wm
- Gist de referencia de arquitectura: https://gist.github.com/lucas-maes/57804ad5e347368e7a219719336c31de
