# lumabeat/mvsep-mega53-guitar

## Resumen

lumabeat/mvsep-mega53-guitar es la cabeza (head) de guitarra del modelo de separación de fuentes MVSep Mega 53 Stems de ZFTurbo, convertida a safetensors en float16 para su uso con MLX en Apple silicon. No se trata de un modelo entrenado desde cero ni ajustado: es una conversión de formato del checkpoint original publicado en la versión v1.0.21 de ZFTurbo/Music-Source-Separation-Training. La arquitectura subyacente es BS-RoFormer (Band-Split RoFormer), un transformer con embeddings posicionales rotatorios que opera sobre una representación espectral dividida en bandas.

El checkpoint completo de Mega 53 contiene 53 estimadores de máscara (uno por stem) sobre un transformer compartido. Este repositorio conserva el transformer compartido completo y únicamente el estimador de máscara de guitarra, de manera que el stem de guitarra se separa exactamente igual que en el modelo completo, pero con una huella de disco mucho menor. El fichero de pesos ocupa 77.455.608 bytes (unos 74 MB) y el repositorio completo 0,1 GB.

Su relevancia es práctica: permite ejecutar en local, sobre Apple silicon y mediante MLX Swift, la extracción de guitarra de un modelo que de otro modo está pensado para PyTorch y que, en su versión completa, es intensivo en memoria. La licencia es MIT. No hay datos publicados de calidad de separación más allá de una comprobación de fidelidad numérica frente a la referencia (51,6 dB SDR).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BS-RoFormer (Band-Split RoFormer), transformer con embeddings posicionales rotatorios, dim 256, profundidad 12, 8 cabezas de 64, 62 bandas, estimador de máscara de profundidad 2 (MLP ×2) |
| Parámetros totales | aproximadamente 38,7 millones (deducidos del tamaño del fichero en float16: 77.455.608 bytes); el autor no publica la cifra |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable; ventana de inferencia de 882.000 muestras (20 s) con 2 solapamientos |
| Tipos de cuantización | float16 (safetensors); el checkpoint de origen era PyTorch (.ckpt) |
| Idiomas soportados | no disponible / no aplicable (modelo de audio) |
| Licencia | MIT (Copyright (c) 2024 Roman Solovyev / ZFTurbo) |
| Formato de pesos | safetensors float16 + fichero JSON de configuración |

## Arquitectura y entrenamiento

BS-RoFormer aplica un esquema de band split: la señal se transforma con STFT (n_fft 2048, hop 512, 44,1 kHz estéreo) y el espectro se divide en 62 bandas, cada una proyectada a un embedding de dimensión 256. Sobre esa secuencia opera un transformer de 12 capas con 8 cabezas de 64 dimensiones y atención rotatoria (RoPE). El estimador de máscara de cada stem es una MLP de profundidad 2 que genera la máscara aplicada al espectro. La inferencia se realiza por trozos de 882.000 muestras (20 s) con 2 solapamientos.

No hubo entrenamiento ni fine-tuning en este repositorio: es exclusivamente una conversión de formato. Se partió del checkpoint `mvsep_mega_model_bs_roformer_53_stems_v1.ckpt` (SHA-256 `c62820893bbf86d4e734f966bd142d9157cfc8bb8e79e9d8f9ea553f3ff3519f`) de la release v1.0.21, cargado con `torch.load(weights_only=True)` para que no se ejecute código del checkpoint, conservando el estimador de guitarra. Las frecuencias rotatorias se recomputan con los valores por defecto porque el checkpoint las almacena redondeadas a float16. La fidelidad de la conversión se verificó sobre 24 s de música: 51,6 dB SDR frente a la salida de referencia en PyTorch.

Datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO): no disponibles en la información proporcionada. Además, esas técnicas son propias de modelos de lenguaje y no aplican a un separador de fuentes.

## Capacidades

- Separación de la pista de guitarra a partir de una mezcla musical estéreo a 44,1 kHz, devolviendo el stem aislado.
- Reasignación coherente respecto a BS-RoFormer-SW: allí donde Mega 53 detecta guitarra dentro del stem «other» de BS-RoFormer-SW, ese contenido pasa al stem de guitarra.
- Funciona como una de las 53 cabezas del modelo Mega 53, con el mismo comportamiento que el modelo completo para este stem concreto.
- Inferencia por trozos con solapamiento, lo que permite procesar pistas de duración arbitraria sin cargar el audio completo en memoria.
- Ejecución en Apple silicon mediante MLX Swift (librería mlx).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio-texto.

## Casos de uso

- Transcripción de guitarra: aislar la guitarra antes de pasarla por un transcriptor (audio a MIDI o a tablatura) reduce la interferencia del resto de instrumentos y mejora la precisión de la transcripción.
- Práctica instrumental: generar una mezcla sin guitarra para tocar encima, o extraer la guitarra para estudiarla con el acompañamiento atenuado.
- Remezcla y producción musical: obtener el stem de guitarra para remezclas, mashups o edición no destructiva cuando no se dispone de los multitracks originales.
- Construcción de librerías de samples: extraer fragmentos de guitarra para usarlos como sample en producción, siempre que el material de origen tenga los derechos adecuados.
- Investigación en separación de fuentes: usar esta cabeza como referencia para comparar el comportamiento de un stem aislado frente al modelo completo de 53 stems, dado que ambos comparten el transformer.
- Aplicaciones de escritorio en Mac: integrar el head en una app nativa de Apple silicon mediante MLX Swift, sin dependencias de CUDA, algo útil para herramientas musicales que se ejecutan en local.
- Preprocesado para análisis musical: alimentar pipelines de detección de acordes o análisis armónico con una pista de guitarra limpia, en lugar de trabajar sobre la mezcla completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de separación (SDR por stem, conjuntos de test tipo MUSDB) en la información disponible. El único dato numérico publicado es la fidelidad de la conversión de formato:

| Prueba | Resultado | Contexto |
|---|---|---|
| Fidelidad float16 frente a la referencia PyTorch | 51,6 dB SDR | Sobre 24 s de música; mide el error de la conversión, no la calidad de separación |

ZFTurbo advierte en las notas de la release que el modelo completo Mega 53 consume mucha memoria (recomienda al menos 16 GB de VRAM incluso con batch size 1) y que el rendimiento por stem individual puede ser inferior al de los modelos especializados del sitio MVSep. Ese aviso corresponde al modelo completo, no a este head aislado.

## Requisitos de hardware

- Peso de los parámetros: 77,5 MB en float16, por lo que la memoria necesaria para cargarlos es inferior a 1 GB; el cuello de botella relevante es el modelo completo, no esta cabeza.
- Apple silicon: es el objetivo declarado del repositorio. Se ejecuta con MLX / MLX Swift sobre memoria unificada, y basta con unos pocos GB libres.
- GPU consumer: cabe con holgura en cualquier GPU con más de 1 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.) si se usa una implementación compatible, aunque los pesos están empaquetados para MLX.
- GPU de datacenter (A100, H100): innecesarias para esta cabeza; solo tendrían sentido para el modelo completo de 53 stems, donde el autor recomienda 16 GB o más de VRAM.
- Opciones de despliegue: MLX y MLX Swift en Apple silicon; el checkpoint original en PyTorch (.ckpt) es la vía para ejecutar sobre CUDA con ZFTurbo/Music-Source-Separation-Training. No hay versiones GGUF ni integración con Ollama, llama.cpp, vLLM o TGI, que son herramientas para modelos de lenguaje y no aplican aquí.
- Latencia y throughput: no disponibles. El modelo procesa en trozos de 20 s con 2 solapamientos, lo que implica cierto coste de cómputo redundante en los bordes de cada trozo.

## Comparativa con modelos similares

| Modelo | Formato y tamaño | Cobertura | Memoria recomendada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lumabeat/mvsep-mega53-guitar | safetensors float16, 77,5 MB | Solo guitarra (transformer compartido completo) | <1 GB (MLX, Apple silicon) | MIT | HuggingFace (MLX) |
| MVSep Mega 53 Stems original (ZFTurbo, v1.0.21) | PyTorch .ckpt | 53 stems | 16 GB o más de VRAM según el autor | MIT | GitHub, release v1.0.21 |
| noblebarkrr/BS-Roformer-MVSep-Mega-53-stems | PyTorch .ckpt, ~4,11 GB | 53 stems | Similar al original | No especificada en la información disponible | HuggingFace |
| Extractor de guitarra especializado de MVSep | Servicio online | Guitarra | No aplicable (servicio) | No disponible | mvsep.com |

No hay datos de SDR comparativos entre estas opciones en la información proporcionada, por lo que no es posible afirmar cuál separa mejor.

## Limitaciones y advertencias

- Solo separa guitarra. No es un separador de 53 stems: los estimadores de máscara del resto de stems no están incluidos.
- Es una conversión de formato y no aporta mejoras de calidad sobre el modelo original; cualquier limitación del checkpoint de ZFTurbo se hereda.
- Los pesos están empaquetados para MLX, por lo que no se pueden cargar directamente en PyTorch/CUDA sin conversión previa.
- Formato de audio fijo: 44,1 kHz estéreo con STFT n_fft 2048 y hop 512. Otras frecuencias de muestreo o configuraciones mono requieren remuestreo o adaptación.
- Las frecuencias rotatorias no se leen del checkpoint (están guardadas en float16 redondeado), sino que se recomputan con los valores por defecto; es una decisión del autor que conviene verificar si se reproduce el modelo.
- Riesgo de alucinación: no aplica en el sentido de los modelos de lenguaje, pero la separación puede generar artefactos, sangrado entre stems o instrumentos fantasma cuando la mezcla es densa o la guitarra está muy enmascarada.
- Sesgos: dependen del dataset de entrenamiento del modelo original, que no está disponible. Es previsible que el rendimiento varíe según género musical, instrumentación y calidad de la mezcla.
- Licencia MIT declarada, heredada del repositorio de ZFTurbo. El propio autor del repositorio advierte que no existe una declaración de licencia separada para los pesos y pide abrir una discusión si alguien reclama derechos sobre ellos.
- En el momento de la consulta el repositorio tiene 0 descargas y 0 likes, y no hay validación independiente de la calidad de separación.
- Región declarada: us.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lumabeat/mvsep-mega53-guitar
- Perfil del autor (LumaBeat Monitor): https://huggingface.co/lumabeat
- Release v1.0.21 de ZFTurbo/Music-Source-Separation-Training (checkpoint de origen): https://github.com/ZFTurbo/Music-Source-Separation-Training/releases/tag/v1.0.21
- Repositorio ZFTurbo/Music-Source-Separation-Training: https://github.com/ZFTurbo/Music-Source-Separation-Training
- Modelo Mega 53 (checkpoint PyTorch, 53 stems) en HuggingFace: https://huggingface.co/noblebarkrr/BS-Roformer-MVSep-Mega-53-stems
- Ficheros de la versión v1 del modelo anterior: https://huggingface.co/noblebarkrr/BS-Roformer-MVSep-Mega-53-stems/tree/main/v1
- Extractor de guitarra de MVSep: https://mvsep.com/en/tools/guitar-extractor
- Herramientas de MVSep: https://mvsep.com/en/tools
- Artículo de BS-RoFormer: Lu et al., 2023 (citado en la model card; URL no disponible en la información proporcionada)
