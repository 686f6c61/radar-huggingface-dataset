# Phoonnx/vits-en_us-glados-espeak

## Resumen

vits-en_us-glados-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con la librería ONNX homónima. El modelo original fue desarrollado por rokeya71 bajo el identificador `rokeya71/VITS-Piper-GlaDOS-en-onnx`, y esta versión se distribuye como un paquete listo para ejecutar dentro del ecosistema phoonnx, que incluye integración con el asistente OVOS y con la librería de normalización de texto scriptconv.

El modelo reproduce la voz del personaje GlaDOS (de la saga Portal) en inglés estadounidense (`en-US`). La entrada de texto no se realiza en caracteres crudos, sino en fonemas generados por espeak-ng en alfabeto IPA, lo que exige instalar el fonemizador como dependencia del sistema o mediante el extra `phoonnx[espeak]`. El repositorio ocupa aproximadamente 0,1 GB y se distribuye en formato ONNX.

Se trata de un modelo muy especializado y de nicho: no compite en calidad general de TTS con sistemas neuronales de gran escala, sino que ofrece una voz concreta y reconocible, con licencia MIT y un pipeline de despliegue ligero orientado a aplicaciones de asistente de voz y demos web. Su relevancia actual es acotada pero clara para proyectos que necesiten una voz temática sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz extremo a extremo que combina un codificador de texto basado en fonemas, un prior variacional condicionado por alineamiento monotónico, un decodificador generativo adversario y un discriminador de múltiples periodos y escalas para el entrenamiento. VITS permite generar audio de forma directa desde fonemas sin necesidad de un modelo acústico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue. En esta versión, el modelo se distribuye como grafo ONNX, lo que permite inferencia en CPU y en navegador mediante phoonnx.js.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de las propias de VITS. La model card indica que el modelo upstream es `rokeya71/VITS-Piper-GlaDOS-en-onnx`, derivado del ecosistema Piper, pero no detalla el proceso de entrenamiento ni los datos utilizados. La entrada de texto se realiza exclusivamente mediante fonemas espeak-ng en alfabeto IPA, no mediante texto plano.

## Capacidades

- Síntesis de voz en inglés estadounidense (`en-US`) a partir de fonemas espeak-ng en alfabeto IPA.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js, con demo en vivo.
- Reproducción de una voz concreta y temática (GlaDOS) con fines creativos o de demostración.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al inglés estadounidense.

## Casos de uso

- Asistentes de voz temáticos: integración en OVOS como módulo TTS para dotar al asistente de una voz reconocible de GlaDOS en respuestas habladas, configurando el plugin en `mycroft.conf`.
- Demos web interactivas: uso de phoonnx.js para sintetizar frases en el navegador sin backend, aprovechando el demo público de TigreGotico para probar la voz en tiempo real.
- Proyectos de fan game o mods: generación de líneas de diálogo para personajes basados en GlaDOS en videojuegos o experiencias interactivas, con licencia MIT que facilita la distribución.
- Prototipado de pipelines TTS: validación de la cadena texto → fonemas espeak-ng → ONNX → WAV en entornos Python antes de migrar a otras voces del catálogo phoonnx.
- Aplicaciones de accesibilidad con identidad sonora: lectura de texto en inglés con una voz distintiva para aplicaciones educativas o de entretenimiento.
- Investigación en TTS ligero: estudio comparativo de VITS en formato ONNX frente a otros modelos Piper o VITS del mismo catálogo, evaluando latencia y calidad en CPU.
- Automatización de contenido en inglés: generación por lotes de narraciones o avisos con voz temática en scripts de Python que usen `TTSModelManager`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de un modelo VITS en ONNX de aproximadamente 0,1 GB de repositorio, es previsible que quepa en CPU y en GPUs de gama baja, pero no se confirman cifras.
- GPU recomendadas: no disponible; por el tamaño del paquete, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: probable, dado el tamaño reducido del repositorio, pero no confirmada en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-glados-espeak | VITS | en-US | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| rokeya71/VITS-Piper-GlaDOS-en-onnx | VITS (Piper) | en-US | no aplica | MIT | ONNX | Hugging Face (upstream) |
| Otras voces VITS del catálogo Phoonnx | VITS | variable | no aplica | variable (MIT en este caso) | ONNX | Colección VITS de Phoonnx |

La comparativa se limita al ecosistema Piper/Phoonnx porque no se dispone de datos de benchmarks ni de especificaciones de parámetros para confrontar con modelos TTS de mayor escala como XTTS, Bark o VITS de Coqui. El modelo upstream y esta versión empaquetada comparten arquitectura y voz; la diferencia principal es el empaquetado para phoonnx y la integración con scriptconv y OVOS.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; la model card no documenta sesgos de género, acento o prosodia.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero el modelo puede pronunciar mal algunas palabras si se usa espyak en lugar de espeak-ng, según advierte la model card.
- Limitación de idioma: solo inglés estadounidense; no soporta otros idiomas ni cambio de voz.
- Dependencia externa: requiere espeak-ng instalado en el sistema o el extra `phoonnx[espeak]`; sin él, el modelo no puede fonemizar la entrada.
- Restricciones de licencia: MIT, permite uso comercial y modificación, pero la voz imita a un personaje de ficción (GlaDOS, de Valve); el uso comercial de la identidad del personaje puede estar sujeto a derechos de propiedad intelectual no cubiertos por la licencia del modelo.
- Caveat de producción: el modelo está empaquetado para phoonnx y no se garantiza su funcionamiento con otros runners ONNX sin adaptación; la API de phoonnx se encuentra en estado `--pre` (pre-release).
- Calidad de audio y prosodia: no hay métricas publicadas (MOS, WER) que permitan evaluar la calidad frente a otras voces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-glados-espeak
- Modelo upstream: https://huggingface.co/rokeya71/VITS-Piper-GlaDOS-en-onnx
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
