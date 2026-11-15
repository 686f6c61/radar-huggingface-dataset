# Phoonnx/glowtts-coqui-fa-custom-glow-tts

## Resumen

GlowTTS Coqui FA Custom es un modelo de síntesis de voz (text-to-speech) empaquetado en formato ONNX y distribuido dentro del repositorio agregado `Phoonnx/phoonnx-glowtts`, del que constituye una de sus carpetas (`coqui-fa-custom-glow-tts`). Lo publica el usuario Phoonnx como artefacto listo para su uso con la librería phoonnx, un runtime de inferencia de TTS basado en ONNX. El modelo deriva de la arquitectura GlowTTS originalmente desarrollada por Coqui, un modelo no autorregresivo de tipo flow-based que transforma fonemas en mel-espectrogramas mediante un decoder generativo normalizing flow.

La relevancia de esta ficha es acotada: se trata de un artefacto de inferencia, no de un modelo fundacional entrenado y documentado de forma independiente. No hay información pública sobre el dataset de entrenamiento, el idioma concreto (el sufijo `fa` sugiere persa/farsi, pero no se confirma en la model card), el número de parámetros ni los resultados de evaluación. El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

El modelo resuelve el problema de convertir texto en audio en un pipeline de TTS desplegable en producción mediante ONNX Runtime, lo que permite inferencia en CPU y GPU sin dependencias de PyTorch. Está pensado para integrarse en aplicaciones que ya usan phoonnx como motor de voz, y su utilidad principal es la de un componente de voz preentrenado listo para ser consumido por esa librería.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GlowTTS (flow-based no autorregresiva, encoder-decoder con normalizing flows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS por fonemas, no aplica ventana de contexto de LLM) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en ONNX; no se documentan variantes) |
| Idiomas soportados | no disponible (el sufijo `fa` sugiere persa, sin confirmar) |
| Licencia | other (la model card no nombra licencia concreta para esta carpeta) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz no autorregresivo basado en normalizing flows. Un encoder transformer procesa la secuencia de fonemas y produce una representación latente; un decoder de flujos invertibles (Glow) transforma esa representación en un mel-espectrograma, y un vocoder posterior (no incluido necesariamente en este artefacto) convierte el espectrograma en onda de audio. La ventaja de esta arquitectura es la inferencia paralela, sin la latencia secuencial de los modelos autorregresivos tipo Tacotron, lo que la hace adecuada para despliegue en tiempo real.

No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, el idioma exacto, la presencia de fine-tuning sobre un checkpoint Coqui original, ni si se aplicaron técnicas de alineamiento o duración explícita. El nombre `coqui-fa-custom-glow-tts` indica que se trata de una variante personalizada derivada de un modelo Coqui, pero la model card no documenta el proceso de entrenamiento ni las modificaciones realizadas. La conversión a ONNX es el único paso técnico verificable a partir de los metadatos.

## Capacidades

- Síntesis de voz a partir de texto, mediante conversión a fonemas y generación de mel-espectrograma con arquitectura GlowTTS.
- Inferencia en formato ONNX, ejecutable con ONNX Runtime en CPU y GPU.
- Integración nativa con la librería phoonnx mediante el identificador de voz `coqui-fa-custom-glow-tts`.
- Generación no autorregresiva, lo que permite síntesis paralela y menor latencia que modelos secuenciales.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, prosodia explícita ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-step (no aplica a un modelo TTS).

## Casos de uso

- Integración en aplicaciones phoonnx: el modelo se carga directamente como voz `coqui-fa-custom-glow-tts` en el runtime phoonnx, sin necesidad de conversión adicional, lo que simplifica el despliegue de TTS en proyectos que ya usan esa librería.
- Lectura de contenido en persa (si se confirma el idioma): adecuado para aplicaciones de accesibilidad que lean artículos, noticias o documentos en voz alta, siempre que se valide la calidad del idioma antes de producción.
- Asistentes de voz embebidos: al distribuirse en ONNX y ocupar 0,1 GB, puede integrarse en dispositivos con recursos limitados o en entornos sin PyTorch, usando ONNX Runtime en CPU.
- Generación de audio para pruebas y prototipos: útil en pipelines de desarrollo donde se necesita un motor TTS ligero para validar la integración de extremo a extremo antes de elegir una voz definitiva.
- Síntesis por lotes de textos cortos: la naturaleza no autorregresiva de GlowTTS permite procesar frases en paralelo, lo que resulta adecuado para generar audiolibros o avisos pregrabados en lote.
- Servicio de TTS en microservicios: el formato ONNX facilita el empaquetado en contenedores ligeros y el escalado horizontal con ONNX Runtime, sin dependencias pesadas de frameworks de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con un repositorio de 0,1 GB, el modelo cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU compatible con ONNX Runtime (CUDA o DirectML); para este tamaño, una GTX 1650 o superior es suficiente. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para inferencia en tiempo real con frases cortas.
- Opciones de despliegue: ONNX Runtime (CPU/GPU) a través de la librería phoonnx; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Formato | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GlowTTS Coqui FA Custom (este) | GlowTTS | ONNX | 0,1 GB | other (sin especificar) | Hugging Face, 0 descargas |
| Coqui TTS GlowTTS original | GlowTTS | PyTorch | no disponible | MPL 2.0 (según Coqui) | Hugging Face / GitHub Coqui |
| Piper TTS | VITS | ONNX | variable, típicamente < 100 MB | MIT (mayoría de voces) | GitHub rhasspy/piper |
| VITS Coqui | VITS | PyTorch | no disponible | MPL 2.0 | Hugging Face Coqui |

La comparación con Piper es la más relevante en términos de despliegue: ambos son motores TTS en ONNX orientados a inferencia ligera, pero Piper cuenta con documentación extensa, voces multilingües verificadas y licencia MIT en la mayoría de sus modelos, mientras que este artefacto no documenta idioma, licencia concreta ni evaluación. Frente al GlowTTS original de Coqui, la diferencia es el empaquetado ONNX y la integración con phoonnx, no la arquitectura.

## Limitaciones y advertencias

- La licencia es `other` y la model card no nombra una licencia concreta para esta carpeta, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor o revisar el repositorio padre antes de usarlo en producción.
- No se documenta el idioma exacto; el sufijo `fa` sugiere persa, pero no se confirma. Usar el modelo con texto en otro idioma producirá resultados incorrectos.
- No hay información sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos de género, acento o prosodia.
- Riesgo de alucinación acústica: como todo modelo TTS, puede generar artefactos, ruido o pronunciaciones erróneas en fonemas no vistos durante el entrenamiento.
- El repositorio no registra descargas ni likes, y no hay evidencia de validación por parte de la comunidad; la calidad del audio no está verificada de forma independiente.
- No se documenta el vocoder asociado; si el artefacto solo genera mel-espectrogramas, será necesario un vocoder adicional compatible para obtener audio final.
- El identificador de voz `coqui-fa-custom-glow-tts` está acoplado a la librería phoonnx; fuera de ese runtime la integración requiere trabajo manual con ONNX Runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-coqui-fa-custom-glow-tts
- Repositorio padre (modelo agregado): https://huggingface.co/Phoonnx/phoonnx-glowtts
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Coqui TTS (origen de la arquitectura GlowTTS): https://github.com/coqui-ai/TTS
- Paper GlowTTS: https://arxiv.org/abs/2005.11129
