# abdel-lall-31/robot-arm-voice-command-classifier

## Resumen

El modelo `abdel-lall-31/robot-arm-voice-command-classifier` es un clasificador de comandos de voz de pequeño vocabulario desarrollado por el autor `abdel-lall-31` como proyecto de investigación y demostración para el control de un brazo robótico. Reconoce cinco comandos hablados en inglés (`get ready`, `load`, `left`, `right`, `shoot`) más una clase `no_command` para audio de fondo o no relacionado. Está diseñado para procesar clips de audio de 3 segundos muestreados a 16 kHz.

La arquitectura combina un encoder HuBERT Base congelado (`facebook/hubert-base-ls960`) como extractor de características de nivel de trama, seguido de una red LSTM de 128 unidades y una capa densa de salida con seis clases. El modelo se entrenó sobre un dataset sintético de 10 400 clips generados a partir de grabaciones originales, ruido de fondo doméstico (dataset DEMAND) y ruido de movimiento del robot. El resultado final incluye un ajuste de temperatura (2.2) y umbrales específicos por clase que logran un recall de eventos del 85,33 % y una precisión de clip exacta del 82,38 % en el conjunto de prueba.

La relevancia de este modelo radica en su enfoque práctico para el control de robots mediante voz en entornos con ruido, utilizando un encoder preentrenado congelado para reducir el coste computacional del entrenamiento. Está pensado como una demo de investigación y no como un sistema general de reconocimiento de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT Base congelado (encoder) + LSTM (128 unidades) + capa densa (6 clases) |
| Parametros totales | no disponible (encoder HuBERT Base ~95M, clasificador LSTM no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 3 segundos de audio (fijo, a 16 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | HDF5 (best_model.weights.h5) para el clasificador; HuBERT se carga desde Hugging Face |

## Arquitectura y entrenamiento

El pipeline del modelo es secuencial: el audio de 3 segundos se pasa por el encoder HuBERT Base congelado, que produce 149 representaciones de trama de 768 dimensiones cada una. Estas representaciones se normalizan con Layer Normalization y se alimentan a una LSTM de 128 unidades, seguida de una capa densa que genera logits para las 6 clases. El encoder HuBERT no se fine-tunea; solo se entrena el clasificador LSTM, lo que reduce significativamente el coste de entrenamiento.

El dataset de entrenamiento es sintético y contiene 10 400 clips de 3 segundos a 16 kHz, divididos en 8000 para entrenamiento, 1200 para validación y 1200 para prueba. Los clips se generaron combinando grabaciones de comandos originales, grabaciones de no-comando, ruido de movimiento del robot y ruido de fondo doméstico del dataset DEMAND. El proceso incluye etiquetas a nivel de trama alineadas con los 149 frames de HuBERT. El entrenamiento final (denominado V4) se realizó con ajuste de temperatura (2.2) y umbrales específicos por clase para minimizar falsas activaciones.

## Capacidades

- Clasificación de cinco comandos de voz específicos en inglés: `get ready`, `load`, `left`, `right`, `shoot`.
- Detección de audio de fondo o no-comando mediante la clase `no_command`.
- Procesamiento de clips de audio de duración fija de 3 segundos, con padding o recorte automático.
- Robustez frente a ruido de fondo doméstico y ruido de movimiento de robot gracias al entrenamiento con datos sintéticos aumentados.
- Inferencia a nivel de trama con umbrales de activación por clase y requisitos mínimos de frames consecutivos.
- Ajuste de temperatura para calibrar la confianza de las predicciones.
- Funciona como clasificador independiente del encoder HuBERT, que se descarga automáticamente desde Hugging Face.

## Casos de uso

- Control de brazo robótico por voz en entornos de laboratorio o taller: el modelo puede activar movimientos específicos (`left`, `right`) o acciones (`load`, `shoot`) mediante comandos hablados, con baja tasa de falsas activaciones (0 en el conjunto de prueba).
- Asistencia a personas con movilidad reducida: un brazo robótico controlado por voz puede ayudar en tareas de manipulación de objetos, usando comandos simples y robustos frente a ruido ambiental.
- Automatización industrial de bajo coste: integración en sistemas embebidos o Raspberry Pi para controlar actuadores mediante comandos de voz, aprovechando que el clasificador LSTM es ligero y puede ejecutarse en hardware modesto.
- Demo de investigación en interacción humano-robot: el pipeline HuBERT + LSTM sirve como referencia para estudiar clasificación de comandos de voz con encoders congelados y datasets sintéticos.
- Entrenamiento de sistemas de control por voz para robots educativos: el modelo y los notebooks publicados permiten reproducir el experimento completo, desde la síntesis de datos hasta el ajuste de umbrales.
- Prototipo de interfaz de voz para brazos robóticos en entornos con ruido de fondo: el uso de ruido DEMAND y ruido de movimiento del robot en el entrenamiento hace que el modelo sea adecuado para entornos domésticos o industriales ruidosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. El autor reporta las siguientes métricas en el conjunto de prueba, tras el ajuste de temperatura y umbrales:

| Metrica | Valor |
|---|---|
| Falsas activaciones (clips de no-comando clasificados como comando) | 0 |
| Recall de eventos | 85,33 % |
| Tasa de accion incorrecta (clips de comando clasificados como otro comando) | 1,42 % |
| Precision de clip exacta | 82,38 % |

## Requisitos de hardware

- El tamaño del repositorio es de 0,9 GB, lo que sugiere un modelo ligero para inferencia.
- El encoder HuBERT Base (~95M parámetros) requiere aproximadamente 1-2 GB de VRAM en FP32 para inferencia; el clasificador LSTM es marginal en comparación.
- Puede ejecutarse en GPU de consumo como RTX 3060 o superiores, y probablemente en CPU con latencia aceptable para clips de 3 segundos (no se proporcionan mediciones).
- Opciones de despliegue: el repositorio incluye un notebook de inferencia (`04_single_audio_inference.ipynb`) que carga el modelo y procesa un archivo WAV. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de generación de texto.
- La inferencia requiere TensorFlow para cargar los pesos HDF5 y la librería de Hugging Face para descargar el encoder HuBERT.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de comandos de voz para control robótico) dentro de los datos proporcionados. Se podría mencionar que existen otros sistemas de control por voz para robots, como los basados en Google Speech Commands o en redes convolucionales sobre MFCC, pero no hay datos de rendimiento comparables publicados para este modelo específico. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Vocabulario muy limitado: solo reconoce cinco comandos en inglés; no es un sistema general de reconocimiento de voz ni de comprensión del lenguaje natural.
- Requiere clips de audio de exactamente 3 segundos; el preprocesado hace padding o recorte, pero el rendimiento puede degradarse con duraciones muy diferentes.
- El entrenamiento se realizó con datos sintéticos; el rendimiento en condiciones reales no verificadas puede variar.
- La licencia no está especificada en la model card, lo que genera incertidumbre sobre el uso comercial o la redistribución del modelo.
- El encoder HuBERT congelado se descarga desde Hugging Face, lo que añade una dependencia externa y requiere conexión a internet en el primer uso.
- No se han publicado evaluaciones de sesgos o robustez frente a acentos, idiomas o condiciones de audio extremas.
- Es un proyecto de investigación y demostración; no está diseñado para producción sin una validación adicional en el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdel-lall-31/robot-arm-voice-command-classifier
- Encoder base HuBERT: https://huggingface.co/facebook/hubert-base-ls960
- Repositorio del proyecto (inferido de la estructura): no disponible en la informacion proporcionada
- Nota: los resultados de búsqueda web sobre brazos robóticos controlados por voz (por ejemplo, LAVOOK Robot Arm en GitHub, artículos de Medium o IEEE) no están directamente relacionados con este modelo específico, pero pueden servir como contexto general sobre aplicaciones similares.
