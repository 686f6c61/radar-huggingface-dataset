# rajb3/whisper-tiny.en-ternary

## Resumen

Whisper tiny.en ternary es una version cuantizada a pesos ternarios del modelo de reconocimiento automatico de voz openai/whisper-tiny.en, publicada por el usuario rajb3 (wilderness-labs-stt). Todas las proyecciones de atencion y de feed-forward, ademas de la proyeccion de tokens compartida con el embedding, se restringen a tres valores (-1, 0, +1) con una escala FP32 por fila de salida, recuperada mediante fine-tuning con quantization-aware training (QAT). El resultado es un fichero de 12,2 MB frente a los 151 MB del original en FP32, con 36,4 M de parametros ternarios empaquetados a 2 bits y 1,3 M de parametros auxiliares en FP16.

El modelo hereda la arquitectura transformer encoder-decoder de Whisper en su variante tiny (unos 39 M de parametros en el checkpoint base) y esta especializado exclusivamente en ingles. Su relevancia no es de rendimiento bruto, sino de investigacion: demuestra que un LLM/ASR de pesos ternarios puede mantener una tasa de error de palabra (WER) util (12,12 % en LibriSpeech test-clean) cuando se aplica QAT con rampa de cuantizacion y destilacion KL, mientras que el mismo cuantizador sin entrenamiento colapsa a un 100 % de WER.

Se trata de un checkpoint de investigacion con 0 descargas en el momento de la consulta, orientado a estudiar cuantizacion extrema y despliegue en entornos con restricciones severas de almacenamiento, no a produccion en audio real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny.en) con pesos ternarios en atencion y feed-forward |
| Parametros totales | 37,7 M contabilizados (36,4 M ternarios + 1,3 M en FP16); el checkpoint base openai/whisper-tiny.en declara unos 39 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s del modelo base (encoder) y hasta 448 tokens de decodificacion; no disponible un dato propio adicional |
| Tipos de cuantizacion | Ternaria {-1, 0, +1} con codigos de 2 bits empaquetados cuatro por byte y una escala FP32 por fila; tensores no cuantizados en FP16; el modelo se reconstruye en FP32 para inferencia |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (sigue la del modelo base) |
| Formato de pesos | Safetensors (`export.safetensors`) mas `manifest.json` y cargador propio `load_ternary.py`; no compatible con GGUF ni con kernels ternarios empaquetados |

## Arquitectura y entrenamiento

La base es Whisper tiny.en: un transformer encoder-decoder que consume espectrogramas Mel de 80 canales en ventanas de 30 segundos y genera texto autorregresivamente. Sobre esa arquitectura, el autor sustituye los pesos de 65 matrices ternarias (todas las proyecciones de atencion y feed-forward, incluida la proyeccion de salida atada al embedding de tokens) por codigos de 2 bits. La distribucion final de codigos es 26,6 % en -1, 52,4 % en 0 y 21,0 % en +1. Los tensores restantes (convoluciones, embeddings posicionales, normalizaciones y sesgos no cuantizados) se almacenan en FP16 con 1,3 M de parametros.

El entrenamiento parte del checkpoint preentrenado y mantiene pesos latentes en FP32, cuantizando cada fila en cada paso forward con `clamp(round(W / mean|W|), -1, 1)` y gradiente straight-through identidad. La transicion de float a ternario es lineal durante el primer 25 % del entrenamiento y despues se mantiene. La funcion de perdida combina 0,5 de entropia cruzada por token y 0,5 de divergencia KL contra el modelo FP32 congelado. Se ejecutaron 12.000 pasos con batch 32 sobre LibriSpeech train-clean-100 + train-clean-360 (464 horas), optimizador AdamW, learning rate maximo 1e-3 seleccionado en dev-clean, autocast BF16, en una RTX 5090 durante unos 19 minutos. El autor reporta como resultado negativo que el mismo cuantizador con solo entropia cruzada y sin rampa alcanzo unicamente un 50 % de WER en test-clean, lo que subraya la importancia del QAT y de la destilacion.

## Capacidades

- Transcripcion de voz a texto en ingles sobre audio de habla leida limpia (estilo LibriSpeech).
- Reconocimiento de voz end-to-end con la ventana de 30 segundos del encoder de Whisper.
- Decodificacion greedy con el normalizador de texto ingles de Whisper en la evaluacion.
- No soporta traduccion de voz a otros idiomas: el modelo base tiny.en es exclusivamente ingles.
- No dispone de vision, audio generation, tool calling, function calling ni capacidades de agente.
- No incluye modo de razonamiento (thinking mode) ni multi-step reasoning.
- Inferencia reconstruida en FP32; no hay ventaja de velocidad ni de energia declarada, ya que las activaciones siguen siendo de coma flotante.
- Salida mayoritariamente en minusculas y con escasa puntuacion, por el estilo de las transcripciones de entrenamiento.

## Casos de uso

- Investigacion en cuantizacion extrema: reproducir el pipeline de QAT ternario con rampa y destilacion KL para estudiar el limite practico de los pesos de 2 bits en tareas de secuencia a secuencia.
- Experimentos docentes sobre BitNet y redes ternarias: el paquete incluye `manifest.json` con histograma de codigos, mapa de atado de pesos y SHA-256, lo que facilita analisis de distribuciones de pesos.
- Despliegue en dispositivos con almacenamiento muy limitado: con 12,2 MB en disco es viable embarcar el fichero en firmware o imagenes de sistema donde un checkpoint FP32 de 151 MB no cabria.
- Transcripcion offline de audio limpio de dominio controlado (audiolibros, locuciones de estudio, notas de voz sin ruido) donde un WER en torno al 12 % en test-clean es tolerable.
- Prototipado rapido de pipelines ASR sin GPU: al reconstruirse en FP32 sobre CPU, sirve para validar integraciones de transformers antes de invertir en un modelo mayor.
- Generacion de pseudoetiquetas de bajo coste sobre corpus limpios en ingles para preentrenar otros sistemas, asumiendo la tasa de error reportada.
- Pruebas de robustez y analisis de fallos: el modelo es util como caso de estudio de degradacion de WER entre condiciones clean (12,12 %) y other (28,42 %).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre LibriSpeech, WER a nivel de corpus con el normalizador de ingles de Whisper, decodificacion greedy, una sola evaluacion por variante sobre el modelo reconstruido desde este fichero:

| Modelo | test-clean WER | test-other WER | Tamano de fichero |
|---|---:|---:|---:|
| Whisper tiny.en, FP32, zero-shot | 5,66 % | 14,54 % | 151,0 MB |
| Whisper tiny.en, FP32, fine-tuned con la misma receta (control) | 4,50 % | 12,37 % | 151,0 MB |
| Mismo cuantizador ternario, sin entrenamiento | 100 % | 100 % | No disponible |
| **whisper-tiny.en-ternary (este modelo)** | **12,12 %** | **28,42 %** | **12,2 MB** |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u otros) porque no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: al reconstruirse en FP32, el modelo ocupa aproximadamente 151 MB de pesos; la inferencia completa cabe holgadamente por debajo de 1 GB de memoria, incluyendo activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria (GTX 1050, RTX 3060, RTX 4090, A100, H100). No requiere aceleradores de datacenter.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en iGPU con memoria compartida suficiente; tambien es viable en CPU.
- Opciones de despliegue: el autor proporciona un cargador propio (`load_ternary.py`) sobre `torch`, `transformers` y `safetensors`, con CLI que usa `soundfile` para audio de 16 kHz. No se soporta vLLM, TGI, llama.cpp, Ollama ni whisper.cpp con este formato, y el autor indica explicitamente que no funciona sobre kernels ternarios empaquetados porque faltan activaciones cuantizadas.
- Latencia y throughput: no disponibles. No se declara ninguna mejora de velocidad o energia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER test-clean | WER test-other | Licencia | Formato |
|---|---|---|---|---|---|---|
| rajb3/whisper-tiny.en-ternary | 37,7 M (36,4 M ternarios) | Ventana de audio de 30 s | 12,12 % | 28,42 % | Apache-2.0 | safetensors con codigos de 2 bits |
| openai/whisper-tiny.en (FP32, zero-shot) | ~39 M | Ventana de audio de 30 s | 5,66 % | 14,54 % | Apache-2.0 | safetensors/PyTorch FP32 |
| openai/whisper-tiny.en fine-tuned (control del autor) | ~39 M | Ventana de audio de 30 s | 4,50 % | 12,37 % | Apache-2.0 | safetensors/PyTorch FP32 |
| openai/whisper-tiny (multilingue) | ~39 M | Ventana de audio de 30 s | No disponible | No disponible | Apache-2.0 | safetensors/PyTorch FP32 |
| openai/whisper-base.en | ~74 M | Ventana de audio de 30 s | No disponible | No disponible | Apache-2.0 | safetensors/PyTorch FP32 |

El interes competitivo del modelo no es la precision, sino la relacion tamano/error: reduce el fichero unas 12,4 veces respecto al FP32 a cambio de multiplicar por mas de dos el WER en test-clean y por casi dos en test-other.

## Limitaciones y advertencias

- Dominio restringido: solo habla leida en ingles (LibriSpeech); no se ha evaluado en audio conversacional, con acento, ruidoso, de campo ni especifico de dominio.
- La brecha de WER se amplia en audio dificil: 12,12 % en test-clean frente a 28,42 % en test-other.
- Entrenado con transcripciones en minusculas y sin puntuacion, por lo que la salida es mayoritariamente en minusculas y apenas puntua.
- El modelo a veces sigue generando texto plausible despues de terminar el habla en lugar de detenerse; excluir esas locuciones reduce el WER en 0,5 puntos en test-clean y 0,7 en test-other (diagnostico secundario, la tabla principal las incluye).
- Las activaciones siguen en coma flotante: no se puede reclamar ninguna mejora de velocidad ni de consumo energetico con este checkpoint.
- Sin kernels ternarios empaquetados: el modelo se reconstruye en FP32, de modo que el ahorro es solo de almacenamiento en disco, no de computo en inferencia.
- Datos declarados por el autor y no verificados (`verified: false` en el model-index), con 0 descargas y 0 likes, y sin validacion independiente.
- Licencia Apache-2.0 heredada del modelo base; al ser una version modificada de openai/whisper-tiny.en conviene revisar el fichero `NOTICE` para la atribucion y la lista de cambios.
- El entrenamiento uso LibriSpeech (CC BY 4.0, Panayotov et al., 2015), por lo que pueden heredarse sesgos acusticos del corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rajb3/whisper-tiny.en-ternary
- Modelo base: https://huggingface.co/openai/whisper-tiny.en
- Variante multilingue del base: https://huggingface.co/openai/whisper-tiny
- Codigo, documento de diseno, resultados completos y resultados negativos: https://github.com/ajbarryiii/wilderness-labs-stt/tree/main/finetune/whisper-ternary
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Ficha de referencia de Whisper Tiny (English) en OpenASR: https://openasr.org/models/whisper-tiny.en/
- Resumen tecnico de Whisper Tiny en Emergent Mind: https://www.emergentmind.com/topics/whisper-tiny
