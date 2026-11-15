# Phoonnx/coqui-vits-da-cv-vits

## Resumen

`Phoonnx/coqui-vits-da-cv-vits` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado del modelo `coqui/da-cv-vits` y empaquetado para su uso con la librería [phoonnx](https://github.com/TigreGotico/phoonnx). Se trata de una extracción de una carpeta concreta del repositorio agregador `Phoonnx/phoonnx-coqui-vits`, que reúne conversiones a ONNX de modelos TTS de Coqui. El modelo emplea la arquitectura VITS (Variational Inference for Text-to-Speech), un sistema end-to-end que combina un encoder de texto, un predictor de duración y un decoder generativo basado en flujos y GAN.

El modelo está entrenado para danés (`da-DK`) sobre el corpus Common Voice, según la información de la model card original de Coqui. Su relevancia es acotada pero práctica: ofrece una opción ligera (el repositorio ocupa 0,1 GB) y de licencia permisiva (BSD-3-Clause) para generar voz en danés dentro de aplicaciones que ya utilizan el stack phoonnx o que necesitan inferencia ONNX sin dependencias pesadas de PyTorch en producción.

No hay datos publicados sobre número de parámetros, longitud de contexto (no aplica en el mismo sentido que en LLM) ni evaluación de calidad. La ficha se limita, por tanto, a describir lo que la información disponible permite afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference for Text-to-Speech), end-to-end |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; cuantización no documentada) |
| Idiomas soportados | danés (`da-DK`) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, presentada en el paper *Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech* (Kim et al., 2021). VITS combina un encoder de texto basado en transformer o convoluciones, un predictor de duración estocástico, un módulo de flujos normalizadores para modelar la variabilidad prosódica y un decoder HiFi-GAN que sintetiza la forma de onda. El entrenamiento es adversarial (GAN) con una pérdida de reconstrucción y una pérdida de coincidencia de duraciones (monotonic alignment search). Esta arquitectura permite síntesis de alta calidad sin necesidad de un vocoder separado ni de alineamientos fonéticos externos.

En cuanto a los datos de entrenamiento, la model card indica que el modelo fuente `coqui/da-cv-vits` fue entrenado sobre Common Voice en danés. No se especifica el número de horas de audio, la composición exacta del corpus, ni si se aplicaron etapas de fine-tuning o ajuste de prosodia. Tampoco hay información sobre el proceso de conversión a ONNX (versión de opset, herramientas utilizadas, posibles optimizaciones de grafos) más allá de que los ficheros conservan las rutas del repositorio original.

## Capacidades

- Síntesis de voz a partir de texto en danés (`da-DK`).
- Generación de audio en formato waveform mediante decoder HiFi-GAN integrado.
- Inferencia en formato ONNX, apta para entornos sin PyTorch.
- Integración con la librería phoonnx mediante el identificador de voz `coqui/da-cv-vits`.
- Modelado de duración y prosodia mediante el predictor de duración estocástico de VITS.
- No se documentan capacidades de clonación de voz, control de estilo, emoción, multihablante ni tool calling (no aplica a un modelo TTS).

## Casos de uso

- **Lectura de contenido en danés para accesibilidad**: convertir artículos, noticias o documentación a audio para usuarios con discapacidad visual o preferencia por consumo auditivo. El modelo VITS genera voz inteligible con prosodia natural sin necesidad de vocoder externo.
- **Asistentes de voz embebidos**: integrar el modelo ONNX en dispositivos con recursos limitados (Raspberry Pi, sistemas empotrados) gracias a su tamaño reducido (0,1 GB) y a la ausencia de dependencia de PyTorch en tiempo de inferencia.
- **Locución automatizada de vídeos y pódcasts en danés**: generar pistas de voz para contenido formativo o corporativo en danés, con la ventaja de la licencia BSD-3-Clause, que permite uso comercial sin restricciones adicionales.
- **Sistemas de IVR y atención telefónica**: sintetizar respuestas habladas en danés dentro de flujos de telefonía interactiva, donde la latencia de un modelo VITS ligero es adecuada para turnos conversacionales.
- **Prototipado rápido de interfaces de voz**: usar el modelo como baseline en el desarrollo de aplicaciones de voz en danés antes de invertir en modelos comerciales o de mayor tamaño.
- **Investigación en TTS de bajos recursos**: emplear el modelo como referencia reproducible para experimentos con Common Voice y comparar metodologías de conversión a ONNX o de despliegue ligero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; por el tamaño del repositorio (0,1 GB), la inferencia cabe holgadamente en menos de 1 GB de memoria, incluso en CPU.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT). Para producción, una T4 o L4 es suficiente; para desarrollo, una RTX 3060 o superior.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU. El cuello de botella habitual en VITS es la generación de waveform, no la memoria.
- **Opciones de despliegue**: ONNX Runtime (CPU/GPU), phoonnx como wrapper de alto nivel, y potencialmente TensorRT u OpenVINO mediante conversión adicional (no documentada).
- **Latencia y throughput**: no disponibles. En modelos VITS de tamaño similar, la síntesis suele ser varias veces más rápida que tiempo real en GPU moderna y en tiempo real o algo por debajo en CPU, pero no hay mediciones publicadas para esta conversión concreta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamaño |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-da-cv-vits | VITS | Danés | BSD-3-Clause | ONNX | 0,1 GB |
| coqui/da-cv-vits (original) | VITS | Danés | BSD-3-Clause | PyTorch (checkpoint) | no disponible |
| Otros modelos VITS de Coqui en Common Voice | VITS | Varios | BSD-3-Clause (según modelo) | PyTorch / ONNX | variable |

No se dispone de datos de rendimiento comparativo (MOS, latencia) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Idioma único**: solo danés; no se documenta soporte multilingüe ni code-switching.
- **Calidad no evaluada**: no hay métricas MOS ni comparativas publicadas; la calidad percibida puede variar según el dominio del texto.
- **Riesgo de alucinación prosódica**: como todo TTS generativo, puede producir entonaciones incorrectas o artefactos en textos con abreviaturas, números o puntuación atípica.
- **Sesgos del corpus**: Common Voice está dominado por lectores voluntarios; puede reflejar sesgos de edad, género o acento de la comunidad que contribuyó al corpus.
- **Licencia**: BSD-3-Clause permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright y verificar la licencia del modelo fuente `coqui/da-cv-vits`.
- **Mantenimiento**: repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte o actualizaciones.
- **Conversión ONNX no documentada**: se desconoce la versión de opset y si se aplicaron optimizaciones; la compatibilidad con runtimes distintos de ONNX Runtime no está garantizada.

## Enlaces

- [Hugging Face: Phoonnx/coqui-vits-da-cv-vits](https://huggingface.co/Phoonnx/coqui-vits-da-cv-vits)
- [Repositorio agregador Phoonnx/phoonnx-coqui-vits](https://huggingface.co/Phoonnx/phoonnx-coqui-vits)
- [Repositorio GitHub de phoonnx](https://github.com/TigreGotico/phoonnx)
- Paper de VITS: Kim et al., *Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech* (arXiv:2106.06103)
