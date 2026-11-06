# nativ-community/SpeechBrain-ECAPA-VoxCeleb-20M

## Resumen

SpeechBrain-ECAPA-VoxCeleb-20M es una exportación reproducible de los pesos del modelo `speechbrain/spkrec-ecapa-voxceleb` al formato MLX, pensada para inferencia nativa en Apple Silicon. Lo publica la comunidad `nativ-community` y no entrena un modelo nuevo: convierte el checkpoint oficial de SpeechBrain (revisión `0f99f2d0ebe89ac095bcc5903c4dd8f72b367286`) a un grafo ECAPA-TDNN implementado en MLX, con un frontend log-mel también reimplementado y verificado.

El modelo resuelve una tarea concreta: extraer un embedding de voz de 192 dimensiones, normalizado en L2, para comparación de hablantes mediante similitud coseno. No es un modelo generativo ni un LLM; es un extractor de características (`feature-extraction`) orientado a verificación e identificación de hablante. Con 20,8 millones de parámetros y pesos en FLOAT16 (39,7 MiB), está diseñado para ejecutarse en local con latencia muy baja.

Su relevancia actual es práctica: permite llevar verificación de hablante a aplicaciones macOS/iOS sin depender de PyTorch ni de servicios externos, con paridad numérica verificada frente al original (coseno mínimo de 0,999999 y error absoluto máximo de 0,000372) y una latencia en caliente de 5,2 ms.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (extractor de embeddings de hablante) |
| Parámetros totales | 20.805.952 (20,77 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio a 16 kHz, log-mel de 80 bandas `[1, frames, 80]` |
| Tipos de cuantización | FLOAT16 (pesos publicados); no se documentan otras variantes |
| Idiomas soportados | en (según metadatos; el modelo es acústico y depende del dataset VoxCeleb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX, FLOAT16) + `mlx_model.py` con el grafo |

## Arquitectura y entrenamiento

La arquitectura es ECAPA-TDNN, una red convolucional temporal con atención estadística multicapa, ampliamente usada en verificación de hablante. La exportación mantiene el grafo original en MLX (`mlx_model.py`) junto con un frontend log-mel de SpeechBrain reimplementado de forma reproducible (`frontend.py`). La entrada es audio mono a 16 kHz y la salida es un vector de 192 dimensiones normalizado en L2.

No se ha entrenado un modelo nuevo: los pesos provienen del checkpoint oficial de SpeechBrain, ajustado sobre VoxCeleb. El autor reporta que el modelo fuente alcanza un 0,80 % de equal-error rate (EER) en VoxCeleb1 limpio, pero advierte explícitamente de que esa cifra es del modelo original y no debe tomarse como paridad de conversión ni usarse para fijar umbrales en producción sin una evaluación fresca sobre VoxCeleb1-O. La validación de la conversión se limita a la paridad numérica PyTorch/MLX y a mediciones de latencia local.

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones, normalizados en L2.
- Comparación de hablantes por similitud coseno (verificación 1:1 e identificación 1:N).
- Inferencia nativa en Apple Silicon mediante MLX, sin PyTorch en tiempo de ejecución.
- Frontend log-mel reproducible incluido, con contrato exacto documentado en `config.json`.
- Verificación de integridad de artefactos mediante SHA-256 (`artifact_manifest.json`).
- No soporta generación de texto, tool calling, agentes, visión ni audio generativo.
- No es un modelo multilingüe entrenado de forma explícita; sus metadatos declaran solo inglés.

## Casos de uso

- Verificación biométrica de voz en aplicaciones macOS/iOS: el modelo genera un embedding de 192 dimensiones en 5,2 ms en caliente, lo que permite comparar contra una plantilla almacenada en el dispositivo sin enviar audio a un servidor.
- Diarización de reuniones en local: segmentar un audio por turnos de palabra y agrupar segmentos por similitud coseno de embeddings para asignar hablantes.
- Autenticación de segundo factor en apps de escritorio: usar la voz como factor adicional (nunca único, según advierte el autor) combinado con otro método.
- Indexación y búsqueda de archivos de audio: calcular embeddings de una fonoteca y recuperar fragmentos del mismo hablante por búsqueda vectorial.
- Control de acceso a grabaciones sensibles: etiquetar y filtrar audios por hablante antes de enviarlos a pipelines de transcripción o análisis.
- Prototipado rápido en Mac: validar umbrales y pipelines de verificación de hablante sin montar infraestructura CUDA, gracias a la paridad numérica con el checkpoint de referencia.
- Preprocesado en pipelines de ASR: enriquecer transcripciones con metadatos de hablante para separar interlocutores en actas o subtítulos.

## Benchmarks y rendimiento

| Métrica | Resultado | Contexto |
|---|---|---|
| Coseno mínimo PyTorch/MLX | 0,999999 | Paridad de conversión |
| Error absoluto máximo | 0,000372 | Paridad de conversión |
| Latencia en caliente (local) | 5,2 ms | Medición del autor en Apple Silicon |
| EER en VoxCeleb1 limpio | 0,80 % | Reportado por el modelo fuente, no reevaluado en esta conversión |

No se han publicado resultados de benchmarks adicionales (identificación 1:N, otros datasets, robustez a ruido) en la información disponible.

## Requisitos de hardware

- VRAM/ memoria unificada: al tratarse de pesos FLOAT16 de 39,7 MiB, el modelo ocupa unas pocas decenas de MiB en memoria; es despreciable frente a cualquier otro componente del sistema.
- Hardware objetivo: Apple Silicon (M1 y posteriores) con MLX; el autor no documenta soporte CUDA ni ROCm para esta exportación.
- GPU dedicadas (A100, H100, RTX 4090): no aplica para esta variante MLX; para esas plataformas debe usarse el checkpoint original de SpeechBrain en PyTorch.
- Cabe holgadamente en cualquier Mac con memoria unificada, incluidos modelos de gama baja.
- Despliegue: paquete `mlx-audio` versión 0.6.2 o superior, con `EcapaSpeakerEmbeddingExtractor`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: 5,2 ms en caliente según `validation.json`; no se publica throughput agregado por lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Contexto/entrada | Licencia | Plataforma |
|---|---|---|---|---|---|
| nativ-community/SpeechBrain-ECAPA-VoxCeleb-20M | 20,77 M | Embedding 192-d L2 | Audio 16 kHz, log-mel 80 bandas | Apache 2.0 | MLX (Apple Silicon) |
| speechbrain/spkrec-ecapa-voxceleb | no disponible en la información | Embedding 192-d L2 | Audio 16 kHz, log-mel 80 bandas | Apache 2.0 | PyTorch |
| aufklarer/SpeechBrain-ECAPA-VoxCeleb-20M-MLX | 20,77 M (mismo checkpoint) | Embedding 192-d L2 | Audio 16 kHz, log-mel 80 bandas | no disponible en la información | MLX (Apple Silicon) |
| Otros extractores de hablante (p. ej. x-vector, WavLM-based) | no disponible | Embedding de hablante | no disponible | no disponible | no disponible |

La comparación relevante es frente al checkpoint original de SpeechBrain (misma arquitectura y mismos pesos, distinto runtime) y frente a la exportación previa de `aufklarer`, de la que este repositorio copia el checkpoint MLX.

## Limitaciones y advertencias

- Los embeddings de hablante no son un mecanismo de autenticación seguro y no deben usarse por sí solos para control de acceso; el propio autor lo advierte en la model card.
- El EER del 0,80 % corresponde al modelo fuente en VoxCeleb1 limpio; no se ha reevaluado en esta conversión y no debe usarse para fijar umbrales de producción sin una evaluación propia sobre VoxCeleb1-O.
- Sesgos potenciales heredados de VoxCeleb: predominio de habla en inglés, condiciones de grabación de YouTube y posible desequilibrio demográfico; no se documenta ningún análisis de sesgo.
- El modelo está entrenado para comparar hablantes, no para transcribir ni comprender contenido; no genera texto.
- Riesgo de falsos positivos en verificación con audio ruidoso, solapamiento de voces o canales distintos a los del entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- Solo se publican pesos en FLOAT16 para MLX; no hay variantes cuantizadas ni soporte documentado para otras plataformas en este repositorio.
- Dependencia de `mlx-audio >= 0.6.2` y del contrato exacto del frontend en `config.json`; cambios en el frontend alteran los embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/SpeechBrain-ECAPA-VoxCeleb-20M
- Modelo base: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- Checkpoint MLX de origen: https://huggingface.co/aufklarer/SpeechBrain-ECAPA-VoxCeleb-20M-MLX
- Librería MLX-Audio: https://github.com/Blaizzy/mlx-audio
