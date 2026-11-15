# Phoonnx/glowtts-en-us-cmu_slt

## Resumen

`Phoonnx/glowtts-en-us-cmu_slt` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, empaquetado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una exportación de una voz concreta del conjunto `Phoonnx/phoonnx-glowtts`, en la carpeta `en-us-cmu_slt`, que corresponde a una voz femenina estadounidense del corpus CMU Arctic (identificador `cmu_slt`). El modelo está pensado para inferencia local mediante ONNX Runtime, sin dependencia de frameworks de deep learning pesados.

El modelo emplea la arquitectura GlowTTS, un sistema de síntesis neuronal no autorregresivo basado en normalizing flows. GlowTTS fue propuesto originalmente en el paper "Glow-TTS: A Generative Flow for Text-to-Speech via Monotonic Alignment Search" (Kim et al., 2020) y se caracteriza por un entrenamiento en paralelo y una inferencia rápida, al no requerir decodificación autoregresiva ni un modelo de alineamiento externo.

La relevancia de esta ficha es acotada: se trata de un artefacto de exportación con cero descargas y cero likes en el momento de la consulta, sin model card detallada, sin benchmarks publicados y con licencia `other` sin especificar. Es útil para desarrolladores que ya utilicen phoonnx y necesiten una voz inglesa integrada, pero no debe considerarse un modelo de propósito general ni un sistema TTS de última generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (normalizing flow, no autorregresiva) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada de texto fonetizado) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | inglés estadounidense (voz `en-us-cmu_slt`) |
| Licencia | `other` (no se especifica licencia concreta) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

GlowTTS es un modelo de síntesis de voz basado en normalizing flows que transforma una representación fonética en un espectrograma mel mediante una serie de transformaciones invertibles. La innovación principal del trabajo original es el Monotonic Alignment Search (MAS), que aprende el alineamiento entre fonemas y frames de forma latente durante el entrenamiento, eliminando la necesidad de un modelo de alineamiento externo como los usados en Tacotron 2. La inferencia es paralela, lo que reduce la latencia frente a arquitecturas autorregresivas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La voz `cmu_slt` proviene del corpus CMU Arctic, un conjunto de grabaciones de dominio público (en su mayoría) de hablantes estadounidenses, pero la model card de esta exportación no detalla el proceso de entrenamiento ni los hiperparámetros utilizados. El artefacto es una exportación a ONNX de un modelo ya entrenado, empaquetado para phoonnx, no un entrenamiento nuevo.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida de audio en formato waveform o espectrograma mel según la configuración de phoonnx.
- Inferencia local mediante ONNX Runtime, sin necesidad de GPU dedicada en muchos casos.
- Integración directa con la librería phoonnx mediante el voice id `larynx/en-us-cmu_slt-glow_tts`.
- Voz femenina concreta (hablante `slt` del corpus CMU Arctic), adecuada para aplicaciones que requieran una voz consistente.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es exclusivamente un modelo TTS.
- No dispone de modo thinking, visión ni audio de entrada; solo texto a audio.
- Capacidades multilingües limitadas al inglés estadounidense de esta voz.

## Casos de uso

- **Lectura de artículos y documentos en inglés**: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando su inferencia rápida y su integración con ONNX Runtime en entornos de escritorio o servidor.
- **Asistentes de voz embebidos**: al ser un modelo ONNX ligero (repo de 0,1 GB), puede desplegarse en dispositivos con recursos limitados para respuestas habladas en inglés, siempre que la calidad de voz no sea crítica.
- **Generación de audiolibros o pódcasts automatizados**: para producir narraciones en inglés con una voz consistente (femenina estadounidense), procesando lotes de texto mediante phoonnx.
- **Prototipado de interfaces conversacionales**: útil en fases de desarrollo para validar flujos de voz-a-texto y text-to-speech antes de invertir en modelos TTS comerciales o de mayor calidad.
- **Sistemas de anuncios o notificaciones por voz**: en aplicaciones que requieran mensajes cortos en inglés, donde la latencia baja de GlowTTS es ventajosa frente a modelos autorregresivos.
- **Investigación en TTS y evaluación de pipelines**: como referencia de una voz concreta del corpus CMU Arctic para comparar con otras voces o arquitecturas dentro del ecosistema phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,1 GB, lo que sugiere que el modelo puede ejecutarse en CPU con memoria RAM modesta (del orden de cientos de MB a 1-2 GB, incluyendo el runtime de ONNX).
- **GPU recomendadas**: no se especifican; al ser ONNX, puede ejecutarse en CPU, GPU integrada o GPU dedicada (por ejemplo, RTX 3060 o superior) si se configura el proveedor de ejecución de ONNX Runtime.
- **¿Cabe en GPU de consumo?**: sí, previsiblemente en cualquier GPU de consumo con al menos 2 GB de VRAM, aunque no hay datos oficiales.
- **Opciones de despliegue**: phoonnx (librería nativa), ONNX Runtime (CPU o CUDA), y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- **Latencia y throughput**: no disponibles. GlowTTS es no autorregresivo, por lo que se espera una latencia baja en comparación con modelos TTS autorregresivos, pero no hay cifras publicadas para esta exportación concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Phoonnx/glowtts-en-us-cmu_slt` | GlowTTS (ONNX) | no disponible | no aplica | `other` (sin especificar) | Hugging Face, 0 descargas |
| Piper (voces `en_US-*`) | VITS (ONNX) | no disponible | no aplica | MIT (mayoría de voces) | Hugging Face, ampliamente usado |
| Coqui TTS (voces `en-us-*`) | Tacotron 2 / VITS | no disponible | no aplica | MPL 2.0 / CC-BY-NC según voz | Hugging Face, comunidad amplia |
| GlowTTS original (TensorFlow) | GlowTTS | no disponible | no aplica | Apache 2.0 (código) | GitHub, referencia académica |

La comparación es cualitativa: no hay benchmarks publicados para esta exportación. Piper y Coqui TTS ofrecen ecosistemas más maduros y licencias más claras, mientras que este modelo está orientado específicamente a phoonnx y carece de documentación sobre licencia y rendimiento.

## Limitaciones y advertencias

- **Licencia ambigua**: la licencia `other` no especifica términos de uso comercial; es imprescindible contactar con el autor o revisar el repositorio original antes de usar el modelo en producción.
- **Sin model card detallada**: no se documentan datos de entrenamiento, hiperparámetros ni evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.
- **Idioma limitado**: solo inglés estadounidense; no soporta otros idiomas ni acentos.
- **Riesgo de alucinación**: en TTS, el equivalente es la generación de prosodia incorrecta o artefactos en palabras fuera del vocabulario de entrenamiento; no hay evaluación publicada.
- **Sesgos**: al ser una voz concreta del corpus CMU Arctic, puede no representar diversidad de hablantes; no hay información sobre sesgos de género o acento.
- **Sin soporte de tool calling ni agentes**: no es un modelo de lenguaje, por lo que no aplica, pero conviene no confundirlo con un LLM.
- **Cero adopción**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento activo.
- **Formato ONNX**: requiere un runtime compatible; no es directamente usable con frameworks de PyTorch o TensorFlow sin conversión.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-en-us-cmu_slt](https://huggingface.co/Phoonnx/glowtts-en-us-cmu_slt)
- [Repositorio original: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Paper Glow-TTS (arXiv)](https://arxiv.org/abs/2005.11129)
