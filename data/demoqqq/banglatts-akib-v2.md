# demoqqq/banglatts-akib-v2

## Resumen

Bangla TTS — Akib v2 es un modelo de síntesis de voz (text-to-speech) para bengalí basado en la arquitectura VITS y entrenado con el framework Coqui TTS. Lo publica el usuario demoqqq en Hugging Face y consiste en un fine-tune de 25 épocas (con reanudación) a partir del checkpoint Akib v1 (checkpoint_17500), utilizando un conjunto de datos combinado de 3.432 clips con una duración aproximada de 257 minutos. El modelo representa una voz concreta e identificable ("Akib"), distinta de otras voces del mismo autor como Rakib o Kiki, aunque comparta los mismos guiones de grabación.

El repositorio incluye el checkpoint nativo de Coqui VITS en formato PyTorch (`best_model.pth`, ~998 MB), un export ONNX compatible con sherpa-onnx en fp32 a 22.050 Hz (`model.onnx`, ~114 MB), así como los ficheros de configuración y de tokens (vocabulario de 92 tokens). Esta doble distribución permite tanto continuar el entrenamiento o ajustar el modelo desde Coqui como desplegarlo en inferencia ligera mediante sherpa-onnx.

La relevancia del modelo es acotada pero específica: cubre la síntesis de voz en bengalí, un idioma con relativamente pocos recursos TTS abiertos de calidad, y ofrece un artefacto ONNX directamente utilizable en producción sin necesidad de GPU. No obstante, la información publicada es escasa: no se declaran licencia, idiomas formalmente soportados ni pipeline en la ficha de Hugging Face, y no hay datos de benchmarks subjetivos (MOS) ni comparativas objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS), modelo generativo condicional con encoder de texto, predictor de duración y decoder basado en flujo y HiFi-GAN |
| Parametros totales | No disponible (el checkpoint PyTorch ocupa 997.805.443 bytes; el ONNX fp32, 114.192.741 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo TTS); `max_num_sentences` configurado a 1 en sherpa-onnx |
| Tipos de cuantizacion | Solo fp32 en el artefacto ONNX publicado; no se distribuyen variantes int8 ni fp16 |
| Idiomas soportados | Bengalí (implícito por el nombre y el vocabulario de 92 tokens); no declarado formalmente en la ficha |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`best_model.pth`), ONNX (`model.onnx`), `config.json`, `tokens.txt`, `tokens_sherpa.txt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS implementada en Coqui TTS: un encoder de texto que transforma la secuencia de fonemas/tokens en representaciones latentes, un predictor de duración estocástico, un normalizing flow que alinea la representación textual con el espacio acústico y un decoder generativo basado en HiFi-GAN que produce la forma de onda a 22.050 Hz. El vocabulario es de 92 tokens, idéntico al de Akib v1, Rakib v2 y Kiki v2, lo que facilita el intercambio de voces manteniendo el mismo pipeline.

El entrenamiento consistió en un fine-tune de 25 épocas con reanudación desde el checkpoint 17.500 de Akib v1, sobre un corpus combinado de 3.432 clips (~257 minutos): 2.381 clips del Akib v2 original más 1.051 clips nuevos grabados a partir de guiones de 24 partes (los mismos que en los datos nuevos de Rakib). Se usó una tasa de aprendizaje de 5e-5 (la mitad de la de un entrenamiento desde cero), batch de 8 y selección del mejor modelo por pérdida de evaluación (`save_best`), con una pérdida media final de evaluación (`avg_loss_1`) de aproximadamente 30,604. No se documentan fases de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz (text-to-speech) en bengalí a partir de texto escrito con grafía bengalí.
- Generación de audio mono a 22.050 Hz en formato fp32 mediante el artefacto ONNX.
- Control de la variabilidad prosódica mediante los parámetros `noise_scale` (0,667), `noise_scale_w` (0,8) y `length_scale` (1,0) en sherpa-onnx.
- Soporte de normalización explícita de caracteres bengalíes compuestos: য় → য + ়, ড় → ড + ়, ঢ় → ঢ + ় (solo formas descompuestas).
- Integración con Coqui TTS para inferencia nativa y con sherpa-onnx `OfflineTts` (ruta VITS) para despliegue en C++, Python, etc.
- No se declaran capacidades de clonación de voz, multilingüismo, tool calling, agentes, visión ni audio de entrada; es exclusivamente TTS.

## Casos de uso

- **Lectura de artículos y noticias en bengalí**: el modelo convierte texto plano en audio, útil para aplicaciones de accesibilidad o de consumo de contenido escrito para usuarios bengalíes, con la ventaja de que el artefacto ONNX de 114 MB se ejecuta en CPU sin GPU.
- **Audiolibros y narración de documentos largos**: aunque el modelo está pensado para frases cortas (`max_num_sentences` = 1), se puede segmentar el texto en oraciones y concatenar los audios resultantes, lo que permite narrar documentos extensos manteniendo la coherencia de la voz.
- **Asistentes de voz y sistemas de respuesta por voz (IVR)**: integrado en un pipeline de diálogo, el modelo puede sintetizar respuestas en bengalí con baja latencia al ejecutarse en sherpa-onnx sobre CPU, sin necesidad de infraestructura GPU.
- **Generación de contenido educativo**: creación de material didáctico en bengalí (lecciones, ejercicios, dictados) con una voz consistente y natural, a partir de guiones de texto.
- **Preparación de datos y aumentación**: dado que el modelo es un checkpoint Coqui, puede usarse para generar muestras sintéticas o para experimentar con ajuste fino adicional sobre nuevas voces o estilos, reutilizando el vocabulario de 92 tokens compartido con otras voces del autor.
- **Prototipado de aplicaciones de voz en bengalí**: el export ONNX y la configuración lista para sherpa-onnx permiten integrar TTS en prototipos multiplataforma (escritorio, móvil, embebido) sin depender de servicios en la nube.
- **Investigación en TTS de bajos recursos**: sirve como punto de partida para estudiar el efecto de fine-tunes cortos (25 épocas) sobre checkpoints previos en un idioma con pocos recursos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida media de evaluación final (`avg_loss_1` ≈ 30,604) y el criterio de selección del mejor modelo por pérdida de evaluación; no hay métricas subjetivas (MOS) ni comparativas objetivas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. El checkpoint PyTorch ocupa ~998 MB y el ONNX fp32 ~114 MB; el ONNX puede ejecutarse en CPU, por lo que no requiere VRAM dedicada.
- **GPU recomendadas**: no se especifican. Para el checkpoint PyTorch, cualquier GPU con al menos ~2-4 GB de memoria libre debería ser suficiente para inferencia; para el ONNX, no es necesaria GPU.
- **Compatibilidad con GPU de consumo**: sí, el artefacto ONNX está pensado para ejecutarse en CPU; el checkpoint PyTorch cabe en GPUs de consumo (por ejemplo, RTX 3060 o superiores) sin problemas de memoria.
- **Opciones de despliegue**: sherpa-onnx `OfflineTts` (ruta VITS) con el `model.onnx`; Coqui TTS con `best_model.pth` y `config.json`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- **Latencia y throughput**: no disponibles. La configuración de sherpa-onnx (`max_num_sentences` = 1) sugiere inferencia por frase, lo que mantiene la latencia acotada por oración, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Bangla TTS — Akib v2 (demoqqq) | VITS (Coqui) | No disponible | No aplica | Bengalí (implícito) | No disponible | PyTorch, ONNX |
| Akib v1 (demoqqq) | VITS (Coqui) | No disponible | No aplica | Bengalí (implícito) | No disponible | PyTorch (checkpoint base) |
| Rakib v2 (demoqqq) | VITS (Coqui) | No disponible | No aplica | Bengalí (implícito) | No disponible | PyTorch, ONNX |
| Kiki v2 (demoqqq) | VITS (Coqui) | No disponible | No aplica | Bengalí (implícito) | No disponible | PyTorch, ONNX |

La comparativa se limita a las voces del mismo autor mencionadas en la model card, ya que no se dispone de información sobre otros sistemas TTS abiertos en bengalí en la documentación proporcionada. Akib v2 se distingue de Akib v1 por ser un fine-tune adicional de 25 épocas sobre un corpus ampliado (3.432 clips frente a los datos originales) y por incluir un export ONNX listo para sherpa-onnx. Rakib v2 y Kiki v2 comparten el mismo vocabulario de 92 tokens y el mismo pipeline, pero corresponden a voces distintas.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia en la ficha de Hugging Face, lo que impide confirmar si el uso comercial está permitido. Es un riesgo relevante para producción.
- **Idioma no declarado formalmente**: aunque el modelo está claramente orientado al bengalí, la ficha no declara idiomas soportados; no se garantiza un comportamiento correcto con texto mixto o con otros idiomas.
- **Normalización obligatoria del texto**: es necesario descomponer য়, ড় y ঢ় en sus formas base + nukta antes de la síntesis; de lo contrario, la calidad del audio puede degradarse.
- **Riesgo de alucinación acústica**: como todo modelo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento (3.432 clips, ~257 minutos).
- **Sesgos de voz**: el modelo reproduce una única voz (Akib) y un estilo de grabación concreto; no cubre variación de género, edad, dialecto ni emoción.
- **Contexto limitado a una frase**: la configuración de sherpa-onnx recomienda `max_num_sentences` = 1, por lo que no está pensado para sintetizar párrafos completos de una sola pasada.
- **Sin métricas de calidad publicadas**: no hay MOS ni comparativas objetivas, lo que dificulta evaluar su calidad frente a alternativas.
- **Fecha de creación futura**: la ficha indica fecha de creación 2026-11-23, lo que puede indicar un error de metadatos o una fecha de publicación planificada; conviene verificarlo antes de usarlo como referencia.
- **Cero descargas y likes**: el modelo no tiene tracción ni validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- [Hugging Face: demoqqq/banglatts-akib-v2](https://huggingface.co/demoqqq/banglatts-akib-v2)
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
