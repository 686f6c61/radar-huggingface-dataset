# Healthykid/htdemucs-onnx

## Resumen

htdemucs-onnx es una exportación a formato ONNX del modelo Hybrid Transformer Demucs (htdemucs), desarrollado originalmente por Simon Rouard, Francisco Massa y Alexandre Défossez para Meta Platforms y presentado en ICASSP 2023. El modelo realiza separación de fuentes musicales en cuatro pistas (batería, bajo, otros y voz) a partir de una mezcla estéreo a 44,1 kHz. Esta versión concreta, publicada por el usuario Healthykid, no modifica los pesos originales: solo cambia el formato para permitir su ejecución en navegador mediante ONNX Runtime Web (WebGPU o WASM) y en dispositivos sin necesidad de PyTorch.

La relevancia de esta exportación radica en que elimina la dependencia del framework de entrenamiento y facilita el despliegue en entornos ligeros, aplicaciones web y herramientas de escritorio. El grafo exportado corresponde únicamente al núcleo del modelo; el preprocesado (STFT) y el postprocesado (inverse STFT y suma de ramas) deben implementarse fuera del grafo, tal como ocurre en el código de referencia.

El repositorio es de tamaño reducido (0,1 GB) y el archivo ONNX ocupa aproximadamente 90,5 MB en precisión float16, con conversión a float32 al cargar la sesión. No se dispone de información sobre idiomas ni sobre benchmarks propios en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (transformer híbrido con ramas temporal y espectral) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa fragmentos de 343.980 muestras (aprox. 7,8 s a 44,1 kHz) |
| Tipos de cuantizacion | pesos almacenados en float16, convertidos a float32 en carga; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), archivo `htdemucs_htd_core_L343980_f16w.onnx` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Hybrid Transformer Demucs descrita en el paper arXiv:2211.08553. Combina una rama temporal (operando sobre la forma de onda) y una rama espectral (operando sobre la representación STFT), cuyas salidas se suman para producir las cuatro pistas separadas. La componente transformer modela dependencias de largo alcance dentro de cada fragmento, mientras que las capas convolucionales capturan estructura local. La entrada del grafo es una mezcla estéreo de 343.980 muestras y una magnitud STFT de dimensiones [1, 4, 2048, 336]; las salidas son la predicción temporal `xt` y la espectral `xs`.

Los pesos provienen del checkpoint preentrenado `htdemucs` de la versión 4.1.0 del repositorio facebookresearch/demucs. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de separación de audio). La innovación principal de esta exportación es la conversión a ONNX con pesos en float16 para reducir el tamaño y permitir inferencia en navegador.

## Capacidades

- Separación de mezclas musicales estéreo en cuatro pistas: batería, bajo, otros y voz.
- Procesamiento de audio a 44,1 kHz con ventanas de 343.980 muestras (aproximadamente 7,8 segundos por fragmento).
- Ejecución en navegador mediante ONNX Runtime Web con backend WebGPU o WASM.
- Ejecución en dispositivos sin PyTorch, al estar el grafo exportado a ONNX.
- No incluye tool calling, function calling ni capacidades de agente.
- No es un modelo de lenguaje: no genera texto, código ni razonamiento.
- No soporta visión, audio de entrada distinto de música estéreo ni otras modalidades.

## Casos de uso

- **Aplicaciones web de karaoke o remix**: el modelo puede ejecutarse en el navegador con ONNX Runtime Web y WebGPU para separar la voz de una canción subida por el usuario, sin enviar el audio a un servidor y preservando la privacidad.
- **Edición de audio en herramientas de escritorio**: integración en DAWs o editores ligeros que necesiten aislar pistas para remezclar, ajustar niveles o aplicar efectos por separado, aprovechando el tamaño reducido del archivo ONNX.
- **Generación de pistas para producción musical**: extracción de batería y bajo para sampleado o para construir bases instrumentales, procesando fragmentos de 7,8 s de forma secuencial.
- **Investigación en separación de fuentes**: uso como referencia reproducible en entornos sin PyTorch, facilitando la comparación de pipelines de pre/postprocesado con el código original.
- **Aplicaciones móviles o de borde**: despliegue en dispositivos con recursos limitados gracias al formato ONNX y a los pesos en float16, siempre que se implementen externamente la STFT y la inverse STFT.
- **Preprocesado de datasets musicales**: separación por lotes de canciones para crear datasets con pistas aisladas destinadas a entrenamiento de otros modelos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo ONNX ocupa unos 90,5 MB y los pesos se cargan en float32, por lo que se estima un consumo moderado (por debajo de 1 GB), aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponible; al ejecutarse con ONNX Runtime Web, se puede usar WebGPU en GPUs integradas o dedicadas compatibles con el navegador.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con soporte WebGPU o en CPU mediante WASM, dado el tamaño reducido del modelo.
- Opciones de despliegue: ONNX Runtime (Web, WebGPU o WASM), y por extensión cualquier runtime compatible con ONNX (por ejemplo, onnxruntime en Python, C++ o móvil).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / fragmento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| htdemucs-onnx (este) | no disponible | 343.980 muestras (~7,8 s) | MIT | ONNX | Hugging Face |
| htdemucs (original, Meta) | no disponible | mismo fragmento | MIT | PyTorch | GitHub facebookresearch/demucs |
| Demucs v3 | no disponible | no disponible | MIT | PyTorch | GitHub facebookresearch/demucs |
| Spleeter (Deezer) | no disponible | no disponible | MIT | TensorFlow | GitHub deezer/spleeter |

La comparativa se limita a alternativas de la misma categoría (separación de fuentes musicales). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El grafo ONNX contiene solo el núcleo del modelo; es obligatorio implementar externamente la STFT (n_fft 4096, hop 1024) y la inverse STFT, así como la suma de las dos ramas, para obtener resultados correctos.
- El modelo procesa fragmentos de 343.980 muestras; audios más largos deben dividirse y recomponerse, lo que puede introducir artefactos en las fronteras si no se aplica solapamiento.
- Solo admite entrada estéreo a 44,1 kHz; otras frecuencias de muestreo o configuraciones mono requieren remuestreo previo.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con música, su rendimiento puede degradarse en grabaciones con ruido, instrumentación atípica o mezclas muy densas.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir separaciones imperfectas con sangrado entre pistas.
- La licencia MIT permite uso comercial, pero se recomienda conservar la atribución a Meta Platforms y a los autores originales.
- No se especifican requisitos de versión de ONNX Runtime ni compatibilidad con todos los navegadores; WebGPU tiene soporte limitado en algunos entornos.

## Enlaces

- [Hugging Face: Healthykid/htdemucs-onnx](https://huggingface.co/Healthykid/htdemucs-onnx)
- [Paper: Hybrid Transformers for Music Source Separation (arXiv:2211.08553)](https://arxiv.org/abs/2211.08553)
- [Repositorio original: facebookresearch/demucs](https://github.com/facebookresearch/demucs)
