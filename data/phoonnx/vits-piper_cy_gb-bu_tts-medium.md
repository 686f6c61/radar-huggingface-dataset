# Phoonnx/vits-piper_cy_GB-bu_tts-medium

## Resumen

`vits-piper_cy_GB-bu_tts-medium` es un modelo de síntesis de voz (text-to-speech) en formato ONNX, derivado de una voz Piper para galés británico (`cy_GB`). Lo publica el usuario Phoonnx como un subconjunto extraído del repositorio agregador `Phoonnx/phoonnx-vits`, que empaqueta voces Piper para su uso con la librería `phoonnx` (un runtime de inferencia ONNX orientado a TTS). No es un modelo entrenado desde cero por el autor de la ficha, sino una redistribución de pesos Piper existentes.

La arquitectura subyacente es VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una familia de modelos end-to-end que mapean texto a forma de onda mediante un encoder, un predictor de duración, un normalizing flow y un decoder generativo. El tamaño del repositorio es de aproximadamente 0,1 GB, lo que sitúa el modelo en la categoría "medium" propia de las voces Piper, apta para inferencia en CPU.

Su relevancia es acotada: se trata de un artefacto de despliegue más que de un modelo de investigación. Resulta útil para quien necesite síntesis de voz en galés dentro de un pipeline basado en ONNX con la librería `phoonnx`, sin depender de frameworks pesados. La información pública disponible es muy limitada: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, según tags del modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS de frase) |
| Tipos de cuantización | no disponible (pesos en ONNX) |
| Idiomas soportados | galés británico (`cy_GB`, inferido del identificador) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo se basa en VITS, un sistema de síntesis de voz end-to-end que combina un encoder de texto, un predictor de duración estocástico, un normalizing flow y un decoder generativo basado en GAN, todo entrenado de forma conjunta. Esta arquitectura permite generar forma de onda directamente desde texto sin necesidad de un vocoder separado, lo que facilita el despliegue.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente a TTS). El modelo procede de la colección Piper, cuyas voces se entrenan con corpus específicos por idioma, pero la model card no detalla la procedencia de los datos para esta voz concreta. La model card indica que los archivos conservan las rutas del repositorio fuente `Phoonnx/phoonnx-vits`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en galés británico.
- Generación de audio en formato ONNX, ejecutable con la librería `phoonnx`.
- Integración en pipelines de TTS mediante el identificador de voz `piper/cy_GB-bu_tts-medium`.
- Inferencia en CPU (por el formato ONNX y el tamaño "medium" típico de Piper).
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).

## Casos de uso

- **Lectura de contenido en galés**: convertir artículos, noticias o documentación a audio para accesibilidad o consumo pasivo, aprovechando que el modelo está especializado en `cy_GB`.
- **Asistentes de voz para aplicaciones locales**: integrar el modelo en una app de escritorio o móvil mediante `phoonnx` y ONNX Runtime para generar respuestas habladas sin conexión.
- **Sistemas de anuncios automatizados**: generar avisos pregrabados en galés para transporte público, aeropuertos o comercios, donde se requiere una voz consistente y ligera.
- **Aprendizaje de idiomas**: producir pronunciaciones de ejemplo en galés para materiales didácticos, con la salvedad de que no se documenta control de prosodia.
- **Prototipado rápido de TTS**: usar el modelo como base para validar un pipeline de síntesis antes de invertir en un modelo comercial, dado su tamaño reducido (~0,1 GB) y licencia MIT.
- **Investigación en TTS de bajos recursos**: servir como referencia para comparar voces Piper en idiomas con poca representación, como el galés, en experimentos de evaluación de inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al ser un modelo ONNX de ~0,1 GB, es probable que quepa en memoria de CPU sin GPU, aunque no se confirma.
- **GPU recomendadas**: no disponible; por su tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente, pero no hay datos oficiales.
- **¿Cabe en GPU consumer?**: previsiblemente sí, dado el tamaño del repositorio, aunque no se especifica.
- **Opciones de despliegue**: `phoonnx` (librería indicada), ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vits-piper_cy_GB-bu_tts-medium` (este) | no disponible | no aplica | no disponible | MIT | Hugging Face |
| Otras voces Piper `cy_GB` (p. ej. variantes de Piper) | no disponible | no aplica | no disponible | variable según voz | Hugging Face / Piper |
| Modelos TTS multilingües comerciales (p. ej. APIs de terceros) | no disponible | no aplica | no disponible | propietaria | APIs de pago |

No se dispone de datos comparativos verificables en la información proporcionada.

## Limitaciones y advertencias

- La model card no especifica el dataset de entrenamiento ni la procedencia exacta de los pesos, lo que dificulta evaluar sesgos.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí puede producir pronunciaciones incorrectas o inteligibilidad limitada en palabras poco frecuentes del galés.
- Solo se documenta el idioma galés británico; no hay soporte multilingüe confirmado.
- La licencia MIT se hereda del repositorio fuente, pero la model card advierte que "las licencias siguen a los originales por subcarpeta"; conviene verificar la licencia de la voz original antes de uso comercial.
- No se documentan métricas de calidad (MOS, WER) ni benchmarks, por lo que la evaluación en producción requerirá pruebas propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- [Hugging Face: Phoonnx/vits-piper_cy_GB-bu_tts-medium](https://huggingface.co/Phoonnx/vits-piper_cy_GB-bu_tts-medium)
- [Repositorio fuente: Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
- [Repositorio kasanoma (referencia de voces Piper)](https://github.com/michsethowusu/kasanoma)
