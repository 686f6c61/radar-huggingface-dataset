# Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_6363-step_2694608-ganji-adabi

## Resumen

Este repositorio contiene un modelo de síntesis de voz (text-to-speech) en formato ONNX basado en la arquitectura VITS, publicado por el usuario Phoonnx bajo licencia MIT. Se trata de una extracción de una carpeta concreta del repositorio agregador `Phoonnx/phoonnx-vits`, que reúne voces compatibles con la herramienta phoonnx (un motor de TTS ligero orientado a despliegue en local). El nombre del modelo indica que la voz se ha entrenado sobre un corpus de texto-a-voz en persa (farsi), con una nomenclatura que apunta al checkpoint de entrenamiento (epoch 6363, step 2694608) y a un estilo o variante denominada "ganji-adabi".

El modelo resuelve la tarea de convertir texto persa en audio inteligible, empleando el formato de pesos ONNX para inferencia optimizada en CPU y GPU sin necesidad de framework de deep learning completo. Su relevancia actual es limitada pero específica: cubre la demanda de voces TTS en persa dentro de ecosistemas de código abierto, un idioma con menor cobertura que el inglés o el castellano en herramientas de síntesis de voz. El tamaño del repositorio es de 0,1 GB, coherente con un modelo VITS de tamaño contenido (típicamente entre 20 y 100 millones de parámetros).

La información pública disponible es escasa: el autor no ha publicado ficha técnica detallada, no hay resultados de benchmarks y la model card se limita a indicar la procedencia del fichero y la licencia. Por tanto, esta ficha se basa en los metadatos del repositorio y en las convenciones conocidas de la arquitectura VITS, y marca como "no disponible" todo dato no confirmado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (en TTS, longitud de secuencia de texto variable; no se especifica límite) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; cuantización típica de ONNX Runtime no documentada) |
| Idiomas soportados | persa (según el nombre del modelo; no confirmado en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de TTS end-to-end que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. Este diseño permite síntesis de alta calidad sin necesidad de alineamientos fonéticos externos, usando atención monotónica para alinear texto y audio. El modelo se distribuye en formato ONNX, lo que facilita su ejecución con ONNX Runtime en CPU y GPU sin dependencias de PyTorch.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). El nombre del checkpoint (epoch 6363, step 2694608) sugiere un entrenamiento prolongado sobre un conjunto de datos de tamaño considerable, pero no se especifican detalles. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en persa (farsi), presumiblemente con un estilo o variante "adabi" (literario) según el nombre del modelo.
- Generación de audio en formato ONNX, ejecutable con phoonnx y potencialmente con ONNX Runtime.
- Integración en pipelines de TTS de la herramienta phoonnx, que permite cargar voces desde repositorios de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplica a un modelo TTS).
- No se documentan capacidades multilingües más allá del persa.
- No se documentan modos especiales como thinking mode, visión o audio de entrada.

## Casos de uso

- **Locución automatizada en persa para aplicaciones de accesibilidad**: el modelo puede convertir texto en audio para lectores de pantalla o asistentes de voz en farsi, aprovechando el formato ONNX para ejecución en dispositivos de bajos recursos.
- **Generación de audiolibros o contenido narrado en persa**: integrado en un pipeline de phoonnx, permite sintetizar capítulos completos de texto a audio con una voz concreta, útil para editoriales o creadores de contenido en farsi.
- **Sistemas de respuesta de voz interactiva (IVR) en persa**: el modelo puede generar mensajes pregrabados dinámicamente para centralitas telefónicas, reduciendo la necesidad de grabaciones humanas.
- **Prototipado de asistentes conversacionales en persa**: combinado con un LLM y un ASR, el modelo actúa como etapa de salida de voz en un asistente de voz completo, siendo el componente TTS ligero y desplegable en local.
- **Investigación en TTS para lenguas de bajos recursos**: sirve como punto de partida para fine-tuning o comparación de voces en persa dentro de estudios académicos sobre síntesis de voz.
- **Generación de contenido educativo en farsi**: permite crear materiales didácticos narrados, como lecciones de idiomas o cursos, con una voz consistente y sin coste por uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB), es probable que el modelo quepa en menos de 1 GB de memoria, pero no se confirma.
- GPU recomendadas: no disponible; al ser ONNX, puede ejecutarse en CPU y en GPUs consumer (RTX 3060, RTX 4090) sin requisitos específicos documentados.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU con al menos 1-2 GB de VRAM, aunque no se especifica.
- Opciones de despliegue: phoonnx (librería indicada), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech (este modelo) | VITS (ONNX) | no disponible | no disponible | MIT | Hugging Face |
| Piper (voces persas) | VITS (ONNX) | no disponible | no disponible | MIT/GPL según voz | GitHub / Hugging Face |
| Coqui TTS (voces persas) | VITS / Tacotron | variable | no disponible | MPL 2.0 | GitHub |
| MMS-TTS (Meta) | VITS | ~30M | no disponible | CC-BY-NC | Hugging Face |

No se dispone de datos de rendimiento comparativo para este modelo concreto; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta el corpus de entrenamiento ni los sesgos potenciales de la voz (género, acento, registro), por lo que se desconoce su comportamiento fuera del dominio previsto.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir artefactos o pronunciaciones incorrectas en palabras fuera del vocabulario de entrenamiento.
- Limitación de idioma: el modelo está orientado al persa; no se garantiza su funcionamiento en otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la model card advierte que la licencia de las voces originales puede variar por subcarpeta; conviene revisar el README del repositorio fuente antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad; no hay evidencia de calidad objetiva.
- No se documentan requisitos de hardware ni latencia, lo que dificulta la planificación de producción.
- La fecha de creación (2026-11-14) es futura respecto al momento habitual de consulta, lo que puede indicar un error en los metadatos o una fecha de publicación programada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-hf_community_SadeghK_persian-text-to-speech_epoch_6363-step_2694608-ganji-adabi)
- [Repositorio fuente Phoonnx/phoonnx-vits](https://huggingface.co/Phoonnx/phoonnx-vits)
- [Herramienta phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio kasanoma (referencia de voces)](https://github.com/michsethowusu/kasanoma)
