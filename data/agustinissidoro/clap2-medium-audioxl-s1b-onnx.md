# agustinissidoro/clap2-medium-audioxl-s1B-onnx

## Resumen

clap2-medium-audioxl-s1B (ONNX) es una conversión no oficial al formato ONNX del modelo CLAP2 de LAION, un modelo contrastivo audio-texto de tipo CLAP (Contrastive Language-Audio Pretraining). El modelo original, desarrollado por LAION, aprende un espacio latente compartido entre audio y texto, lo que permite tareas de clasificación de audio zero-shot, recuperación audio-texto y extracción de embeddings multimodales. Esta conversión, publicada por el usuario agustinissidoro, exporta las dos torres (audio y texto) a grafos ONNX con pesos sin modificar, lo que facilita el despliegue en entornos de producción que no dependen de PyTorch.

El modelo base pertenece a la familia CLAP2 de LAION, entrenada sobre el corpus LAION-Audio-XL, un conjunto de datos a escala web descrito en el paper arXiv:2611.11592. La variante "medium" con sufijo "audioxl-s1B" sugiere un tamaño intermedio entrenado sobre aproximadamente mil millones de pares audio-texto, aunque la información disponible no detalla el número exacto de parámetros ni la composición completa del dataset.

La relevancia de esta ficha radica en que ofrece una alternativa práctica para integrar CLAP2 en pipelines de inferencia ligeros mediante ONNX Runtime, con verificación de equivalencia numérica frente a open_clip 4.2.2 (similitud coseno >= 0.9999). El repositorio ocupa 0,6 GB y está bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos torres (audio y texto) con preprocesado de audio integrado en el grafo (STFT Hann, mel filter bank HTK de 128 bandas, parcheado 16x16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Audio: hasta 30 s a 32000 Hz (1024 muestras mínimo); texto: 256 tokens |
| Tipos de cuantizacion | float32 (exportación ONNX en float32, opset 18); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/audio_model.onnx`, `onnx/text_model.onnx`); tokenizer en `tokenizer.json` (BPE estilo GPT-2) |

## Arquitectura y entrenamiento

El modelo original es un CLAP de dos torres: una torre de audio y una torre de texto que proyectan sus entradas a un espacio latente compartido de dimensión 640, optimizado con una pérdida contrastiva. La torre de audio procesa formas de onda a 32000 Hz mono mediante un front-end que en esta conversión ONNX está integrado dentro del grafo: STFT Hann centrada con reflect padding (n_fft 1024, hop 320), banco de filtros mel HTK de 128 bandas entre 50 Hz y 16 kHz, potencia en dB, relleno del último parche temporal con el valor mínimo del clip y parcheado 16x16, replicando el comportamiento de `AudioNaFlexPatchify` de open_clip. La torre de texto utiliza un tokenizador BPE estilo GPT-2 con tokens de inicio y fin, truncado y padding a 256 tokens con id 50258.

El entrenamiento se realizó sobre el corpus LAION-Audio-XL, descrito en el paper "LAION-Audio-XL: A Web-Scale Corpus and Scaling Studies for Contrastive Language-Audio Pretraining" (arXiv:2611.11592). La información proporcionada no detalla el número exacto de tokens, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO; tampoco se especifican innovaciones como decodificación especulativa o atención lineal. La conversión ONNX mantiene los pesos originales sin cambios y ambas salidas están normalizadas L2, equivalentes a `encode_audio(..., normalize=True)` y `encode_text(..., normalize=True)`.

## Capacidades

- Extracción de embeddings de audio (vector de 640 dimensiones) a partir de formas de onda mono a 32000 Hz.
- Extracción de embeddings de texto (vector de 640 dimensiones) a partir de frases en inglés.
- Clasificación de audio zero-shot mediante similitud coseno entre embeddings de audio y etiquetas textuales.
- Recuperación audio-texto y text-audio en el espacio latente compartido.
- Procesamiento de clips de hasta 30 segundos; para audio más largo se recomienda trocear y promediar embeddings.
- Soporte de audio desde 1024 muestras (clips muy cortos, ~0,03 s).
- Tokenización BPE estilo GPT-2 con truncado y padding a 256 tokens.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modos de "thinking".
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Clasificación de audio zero-shot en producción: se generan embeddings de un clip y de un conjunto de etiquetas textuales ("un violonchelo toca una melodía lenta", "ruido de tráfico"), y se asigna la clase con mayor similitud coseno. Adecuado por la normalización L2 de las salidas y la verificación de equivalencia con open_clip.
- Etiquetado automático de archivos de audio en bibliotecas multimedia: se calculan embeddings de cada pista y se comparan contra un vocabulario de descripciones para generar metadatos sin entrenamiento supervisado.
- Búsqueda semántica audio-texto: indexar embeddings de audio de un catálogo y permitir consultas en lenguaje natural ("sonido de lluvia en un bosque") mediante similitud coseno en el espacio compartido.
- Moderación o filtrado de contenido sonoro: detectar categorías de audio no deseadas comparando contra descripciones textuales predefinidas, con despliegue en ONNX Runtime sin dependencia de PyTorch.
- Integración en pipelines de inferencia ligeros: al estar exportado a ONNX (opset 18, float32) y ocupar 0,6 GB, puede ejecutarse en entornos con ONNX Runtime en CPU o GPU, dentro de servicios como bach-mcp para los que fue convertido.
- Análisis de eventos sonoros en clips cortos: procesar fragmentos de hasta 30 s y promediar embeddings para audio más largo, útil en monitorización ambiental o análisis de grabaciones.
- Prototipado de sistemas de recomendación musical o de efectos de sonido: usar la similitud entre embeddings de audio y descripciones textuales para sugerir contenido afín.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una verificación de equivalencia numérica frente a open_clip 4.2.2: similitud coseno >= 0.9999 entre los embeddings originales y los ONNX para un tono, ruido, un clip de 0,2 s y texto en inglés. No se proporcionan métricas de tareas como clasificación zero-shot, recuperación o MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,6 GB en float32, por lo que la huella en memoria es moderada y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con al menos ~1-2 GB de VRAM libre debería poder cargar los dos grafos ONNX en float32.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque no se documentan pruebas concretas.
- Opciones de despliegue: ONNX Runtime (Python, C++, etc.), tal como muestra el ejemplo de la model card; también podría integrarse en servidores de inferencia compatibles con ONNX, aunque no se documentan configuraciones para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| clap2-medium-audioxl-s1B (ONNX) | no disponible | Audio 30 s / texto 256 tokens | Audio-texto | Apache-2.0 | ONNX |
| laion/clap2-medium-audioxl-s1B (original) | no disponible | Audio 30 s / texto 256 tokens | Audio-texto | Apache-2.0 | PyTorch (open_clip) |
| CLAP original (LAION) | no disponible | no disponible | Audio-texto | no disponible | PyTorch |

La información disponible no permite comparar rendimiento numérico con alternativas como CLAP original, AudioCLIP o modelos audio-texto similares, ya que no se publican benchmarks en la model card. La diferencia principal frente al modelo original es el formato (ONNX frente a PyTorch) y la integración del front-end de audio en el grafo, con pesos idénticos.

## Limitaciones y advertencias

- Conversión no oficial: no está hecha ni respaldada por LAION; cualquier problema debe atribuirse al conversor, no a los autores originales.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre datos web a escala, es probable que herede sesgos del corpus LAION-Audio-XL.
- Riesgo de alucinación: en tareas de clasificación zero-shot, las etiquetas textuales mal formuladas o ambiguas pueden producir asignaciones incorrectas; se recomienda usar frases completas cortas, como indica la model card.
- Limitaciones de contexto: audio limitado a 30 s (para clips más largos hay que trocear y promediar embeddings); texto limitado a 256 tokens.
- Limitación de idioma: solo inglés según la model card; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe citar a los autores originales y conservar el aviso de licencia; la conversión no añade restricciones adicionales conocidas.
- Caveat de producción: el front-end de audio está embebido en el grafo ONNX, por lo que la forma de onda de entrada debe ser mono a 32000 Hz exactos; desviaciones en la frecuencia de muestreo o el número de canales producirán resultados incorrectos.
- No se documentan cuantizaciones distintas de float32, lo que limita optimizaciones de latencia en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agustinissidoro/clap2-medium-audioxl-s1B-onnx
- Modelo base original: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Paper LAION-Audio-XL: https://arxiv.org/abs/2611.11592
- Script de conversión: https://github.com/agustinissidoro/bach-mcp/blob/main/py/bach_mcp/utilities/export_onnx.py
- Repositorio bach-mcp: https://github.com/agustinissidoro/bach-mcp
