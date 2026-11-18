# richardbertok/verbacue-voice

## Resumen

verbacue-voice es un repositorio de modelos en formato ONNX publicado por el usuario richardbertok para dar soporte a la funcionalidad de doblaje de la aplicación verbacue. No se trata de un modelo entrenado desde cero, sino de una exportación a ONNX de dos componentes ya existentes: el modelo de síntesis de voz XTTS-v2 de Coqui y el modelo de separación de fuentes htdemucs_ft de Demucs. El repositorio agrupa ambos artefactos con el objetivo de integrarlos en un pipeline de doblaje automatizado.

La relevancia de este paquete es fundamentalmente práctica: ofrece versiones ONNX listas para inferencia multiplataforma (incluido CPU) de dos modelos consolidados en sus respectivas áreas, evitando al desarrollador la tarea de exportación. XTTS-v2 aporta síntesis de voz multilingüe con clonación de voz a partir de unos pocos segundos de audio de referencia, mientras que htdemucs_ft aporta separación de voces y acompañamiento musical, paso previo habitual en cualquier flujo de doblaje.

El repositorio ocupa 2,5 GB, no registra descargas ni interacciones en el momento de la consulta y está sujeto a la Coqui Public Model License, que restringe el uso a fines no comerciales. No se dispone de información sobre idiomas soportados, parámetros ni arquitectura interna más allá de la heredada de los modelos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XTTS-v2 (TTS autoregresivo basado en GPT con encoder de voz y decoder VITS) y htdemucs_ft (Demucs híbrido transformer-convolucional para separación de fuentes); exportados a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen exportaciones ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible en la información proporcionada (XTTS-v2 original soporta multitud de idiomas, pero el repositorio no lo detalla) |
| Licencia | Coqui Public Model License (uso no comercial); componente htdemucs bajo MIT |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 2,5 GB |
| Pipeline declarado | text-to-speech |
| Etiquetas | onnx, text-to-speech, voice-cloning, source-separation |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo propio: agrupa exportaciones ONNX de terceros. El componente principal, XTTS-v2, es un sistema de síntesis de voz de Coqui que combina un modelo autorregresivo tipo GPT para la generación de tokens acústicos con un decoder basado en VITS y un encoder de hablante que permite la clonación de voz con audio de referencia corto. El segundo componente, htdemucs_ft, es la variante fine-tuned del modelo híbrido transformer-convolucional de Demucs, especializada en la separación de la pista vocal del resto de la mezcla.

Los scripts de exportación a ONNX se encuentran en el directorio `tools/xtts-export/` del repositorio verbacue en GitHub, según indica la model card. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre procesos de RLHF o DPO, ya que esa información pertenece a los modelos originales y no se reproduce aquí. La innovación técnica del paquete es la conversión a ONNX, que habilita inferencia portable con ONNX Runtime en entornos sin GPU o con aceleración limitada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, mediante el componente XTTS-v2 exportado a ONNX.
- Clonación de voz zero-shot a partir de muestras de audio de referencia, según la etiqueta `voice-cloning` del repositorio.
- Separación de fuentes de audio, aislando la pista vocal del acompañamiento musical mediante htdemucs_ft.
- Integración en un pipeline de doblaje: separación de voces, síntesis con voz clonada y remezcla.
- Inferencia portable vía ONNX Runtime, con posibilidad de ejecución en CPU.
- Soporte multilingüe: no disponible en la información proporcionada (depende del modelo XTTS-v2 subyacente).
- Tool calling, agentes, visión, audio de entrada distinto de la referencia de voz o modo thinking: no disponibles.

## Casos de uso

- Doblaje automatizado de vídeo: el pipeline separa la voz original con htdemucs, transcribe y traduce el texto, y resintetiza con XTTS-v2 clonando la voz del hablante original para mantener la identidad vocal.
- Localización de contenido formativo o divulgativo: sustitución de la locución por una versión en otro idioma conservando el timbre del ponente, útil en cursos y webinars.
- Prototipado de asistentes de voz: generación de locuciones de prueba con distintas voces sin depender de servicios en la nube, gracias a la exportación ONNX.
- Postproducción de pódcast: separación de la pista vocal para aplicar ecualización, reducción de ruido o sustitución de fragmentos sin afectar a la música de fondo.
- Generación de audiolibros y narraciones: síntesis de voz con una voz de referencia consistente a lo largo de capítulos, ejecutable en local.
- Investigación en clonación de voz y evaluación de sistemas TTS: banco de pruebas reproducible en ONNX para comparar calidades y latencias frente a otras implementaciones.
- Creación de contenido accesible: generación de versiones en audio de documentos de texto con una voz concreta definida por la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 2,5 GB en disco; XTTS-v2 en precisión completa ronda varios GB de pesos, por lo que se recomienda al menos 6-8 GB de VRAM para ejecución en GPU con comodidad, aunque este dato no se documenta en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de exportaciones ONNX, pueden ejecutarse en GPU NVIDIA con CUDA, en GPU integradas o en CPU mediante ONNX Runtime.
- ¿Cabe en GPU de consumo? Con alta probabilidad sí en tarjetas con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4070), aunque no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integración directa en la aplicación verbacue; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| verbacue-voice (este) | TTS + separación de fuentes (ONNX) | no disponible | no disponible | Coqui Public Model License (no comercial) | ONNX | Hugging Face |
| coqui/XTTS-v2 | TTS con clonación | no disponible | no disponible | Coqui Public Model License (no comercial) | PyTorch | Hugging Face |
| adefossez/demucs (htdemucs_ft) | Separación de fuentes | no disponible | no aplica | MIT | PyTorch | GitHub / Hugging Face |
| Otros TTS open source (p. ej. Piper, Bark) | TTS | no disponible | no disponible | variable (MIT, CC-BY-NC) | ONNX / PyTorch | Hugging Face / GitHub |

La comparativa se limita a los modelos de origen, ya que no se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia restrictiva: la Coqui Public Model License limita el uso a fines no comerciales. Cualquier producto comercial que integre el componente XTTS-v2 requiere licencia adicional de Coqui.
- El componente htdemucs_ft es MIT, pero el conjunto del repositorio hereda la licencia más restrictiva del componente XTTS-v2.
- Riesgo de uso indebido de clonación de voz: la capacidad de clonar voces sin consentimiento plantea problemas éticos y legales; se debe obtener permiso explícito del hablante y cumplir la normativa aplicable.
- Riesgo de alucinación o artefactos acústicos en la síntesis: los modelos TTS pueden producir pronunciaciones incorrectas, ruidos o inestabilidades en textos largos o con caracteres especiales.
- Idiomas soportados no documentados en este repositorio: aunque XTTS-v2 original es multilingüe, no se confirma qué idiomas están cubiertos por esta exportación.
- Sin métricas publicadas: no hay benchmarks, latencias ni evaluaciones de calidad, lo que dificulta estimar su idoneidad en producción.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Dependencia de la aplicación verbacue: el paquete está pensado para esa herramienta; su reutilización fuera de ella requiere trabajo de integración adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/richardbertok/verbacue-voice
- Repositorio verbacue en GitHub: https://github.com/ksrichard/verbacue
- Modelo original XTTS-v2: https://huggingface.co/coqui/XTTS-v2
- Licencia Coqui Public Model License: https://coqui.ai/cpml
- Demucs (GitHub): https://github.com/adefossez/demucs
