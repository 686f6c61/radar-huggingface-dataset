# Phoonnx/optispeech-bookbot_OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1

## Resumen

OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1 es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx en Hugging Face, empaquetado en formato ONNX y distribuido a través de la librería `phoonnx`. Se trata de una voz concreta, identificada como "Marcia", extraída del repositorio agregador `Phoonnx/phoonnx-optispeech` y correspondiente a la carpeta `bookbot__OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1`. Por la nomenclatura, el identificador de idioma es `es-CO` (español de Colombia), aunque la model card no confirma explícitamente los idiomas soportados.

El modelo se apoya en la arquitectura OptiSpeech con un codificador ConvNext, un diseño orientado a TTS ligero y desplegable en entornos de producción mediante ONNX Runtime. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de tamaño reducido, adecuado para inferencia en CPU o GPU modesta. No se dispone de información sobre parámetros, contexto ni datos de entrenamiento en la documentación proporcionada.

Su relevancia radica en su carácter práctico: es una pieza de un ecosistema mayor de voces TTS empaquetadas para la herramienta `phoonnx`, lo que facilita su integración en pipelines de síntesis de voz sin necesidad de frameworks pesados. No obstante, la información pública es muy limitada y la model card remite al repositorio fuente para detalles técnicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OptiSpeech con codificador ConvNext (según nombre del modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos en formato ONNX) |
| Idiomas soportados | no disponible (el identificador sugiere es-CO) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura se infiere del nombre del modelo: OptiSpeech con un codificador ConvNext. OptiSpeech es un framework de TTS que combina componentes de modelado acústico con vocoders, y ConvNext es una familia de redes convolucionales modernas que suele emplearse como extractor de características. El empaquetado en ONNX indica que el modelo está optimizado para inferencia portable, probablemente con componentes separados (acústico y vocoder) tal como es habitual en este tipo de pipelines.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. La model card no documenta el proceso de entrenamiento y remite al repositorio `Phoonnx/phoonnx-optispeech` para los detalles, sin que se hayan proporcionado aquí.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Voz concreta identificada como "Marcia", presumiblemente con características de habla femenina y acento colombiano (según el identificador `es-CO`), aunque no confirmado en la documentación.
- Inferencia mediante ONNX Runtime, lo que permite despliegue portable en CPU y GPU.
- Integración con la librería `phoonnx` para gestión de voces.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo ni tool calling (no aplica a un modelo TTS).
- No se documentan capacidades de agentes ni razonamiento multi-paso (no aplica).

## Casos de uso

- **Locución automatizada de contenidos editoriales**: el modelo puede generar audio a partir de texto para audiolibros, artículos o boletines, aprovechando su empaquetado ONNX para integrarse en pipelines de publicación sin dependencias pesadas.
- **Asistentes de voz en español colombiano**: adecuado para sistemas de respuesta por voz en atención al cliente o kioscos, dado el identificador regional `es-CO` y su tamaño reducido (0,1 GB) que permite despliegue en dispositivos modestos.
- **Accesibilidad web**: generación de audio para lectores de pantalla o conversión de contenido textual a voz en aplicaciones de accesibilidad, con inferencia local mediante ONNX Runtime.
- **Sistemas de anuncios y megafonía**: síntesis de mensajes pregrabados o dinámicos en entornos como transporte, comercio o eventos, donde se requiere una voz consistente y ligera.
- **Prototipado de interfaces conversacionales**: integración en bots de voz o IVR para pruebas de concepto, gracias a la licencia MIT y a la facilidad de despliegue con la librería `phoonnx`.
- **Generación de contenido multimedia**: narración de vídeos, pódcast o material educativo en español, con la posibilidad de ejecutar la inferencia en local sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precisión; el repositorio ocupa 0,1 GB, por lo que la huella de memoria es muy reducida y probablemente inferior a 1 GB en inferencia.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime (RTX 3060, RTX 4090, A100, H100); el modelo es lo suficientemente pequeño para ejecutarse en GPU de gama baja.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPU.
- **Opciones de despliegue**: ONNX Runtime (principal), integración con la librería `phoonnx`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1 | OptiSpeech + ConvNext | ~0,1 GB (repo) | no disponible (sugerido es-CO) | MIT | ONNX |
| Piper (voces es_ES/es_MX) | VITS | ~20-60 MB por voz | Español (varias variantes) | MIT | ONNX |
| Coqui TTS (XTTS v2) | GPT + vocoder | ~1,8 GB | Multilingüe (17 idiomas) | CPML (no comercial) | PyTorch |
| Kokoro TTS | StyleTTS2 + ISTFTNet | ~80-300 MB | Varios (incl. español) | Apache 2.0 | ONNX/PyTorch |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas. Frente a Piper, comparte filosofía de ligereza y formato ONNX, pero la documentación de OptiSpeech es mucho más escasa. Frente a XTTS v2, carece de clonación de voz y multilingüismo documentado.

## Limitaciones y advertencias

- Información pública muy limitada: la model card no documenta parámetros, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad.
- Posibles sesgos derivados de los datos de entrenamiento no documentados (acento, género, prosodia).
- Riesgo de alucinación en TTS: puede generar pronunciaciones incorrectas o artefactos en textos fuera de dominio.
- El identificador `es-CO` sugiere un ámbito regional concreto; su rendimiento en otras variantes del español no está documentado.
- Licencia MIT permite uso comercial, pero conviene verificar la procedencia de los datos de entrenamiento y las condiciones del repositorio fuente.
- Sin voz ID asignada en `phoonnx`: la model card indica que otras voces de otros repositorios usan estos archivos, lo que puede generar confusión en la integración.
- No se documentan limitaciones de longitud de texto ni de manejo de caracteres especiales.

## Enlaces

- [Hugging Face: Phoonnx/optispeech-bookbot_OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1](https://huggingface.co/Phoonnx/optispeech-bookbot_OptiSpeech-ConvNext-TTS-es-CO-Marcia-v1)
- [Repositorio fuente: Phoonnx/phoonnx-optispeech](https://huggingface.co/Phoonnx/phoonnx-optispeech)
- [Librería phoonnx (GitHub)](https://github.com/TigreGotico/phoonnx)
