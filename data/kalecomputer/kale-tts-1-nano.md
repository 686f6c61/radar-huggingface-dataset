# KaleComputer/kale-tts-1-nano

## Resumen

kale-tts-1-nano es un modelo de síntesis de voz (text-to-speech) en inglés, extremadamente compacto, desarrollado por KaleComputer. Con solo 7,5 millones de parámetros y un fichero ONNX de 14,8 MB en su variante int8 para CPU, el modelo está diseñado para ejecutarse en dispositivos de gama baja, incluyendo tablets y navegadores, sin necesidad de GPU dedicada. Es un fine-tune destilado de kale-tts-1-base (a su vez un fine-tune de Kokoro-82M) y utiliza las voces sintéticas generadas por Maya-1 como referencia de calidad.

El modelo resuelve el problema de la síntesis de voz local con requisitos de hardware mínimos, manteniendo una calidad de melodía y claridad cercana a la de su modelo profesor, que es mucho más grande y lento. Ofrece diez voces predefinidas, todas diseñadas a partir de descripciones textuales y ninguna basada en personas reales. La arquitectura combina un front-end fonético basado en diccionario CMUdict con un planificador de timing y melodía destilado, seguido de un generador armónico más ruido, todo en un solo pase por frase, sin flow matching ni difusión.

La relevancia actual radica en su enfoque de privacidad y ejecución en dispositivo (on-device), orientado a aplicaciones infantiles y entornos con recursos limitados, con una licencia Apache 2.0 que permite uso comercial y modificación. El modelo se distribuye en formato ONNX y está pensado para inferencia en CPU o WebGPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Front-end fonético basado en diccionario + planificador de timing y melodía (destilado) + generador armónico más ruido; un solo pase por frase, sin difusión ni flow matching |
| Parámetros totales | 7,5 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (CPU, `model.onnx`, 14,8 MB); float32 (WebGPU, `model.fp32.onnx`, 30,6 MB) |
| Idiomas soportados | Inglés (en); voces en inglés estadounidense y británico |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

kale-tts-1-nano es un modelo de síntesis de voz extremadamente compacto que combina varias etapas en un único fichero ONNX. El front-end convierte texto en fonemas mediante reglas para términos técnicos, números, fechas, dinero y unidades, seguido de un diccionario basado en CMUdict con una lista de anulaciones revisada manualmente (más de 3.800 lecturas corregidas sobre 334.000 palabras en inglés americano y británico) y un pequeño adivinador para palabras desconocidas. No utiliza espeak. A continuación, un planificador compacto lee los fonemas y planifica el timing y la melodía; este componente se destila de kale-tts-1-base (Kokoro-82M fine-tuneado). Finalmente, un generador armónico más ruido produce la forma de onda, aprendido directamente del audio de Maya-1.

El entrenamiento se realizó sobre el dataset kale-tts-1-data, compuesto por 204,7 horas (99.783 tomas) de las diez voces sintéticas generadas por Maya-1, con licencia CC BY 4.0. El modelo base kale-tts-1-base actúa como profesor para el planificador de timing y melodía, mientras que el generador de sonido se entrena directamente con el audio de Maya-1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal es la destilación de un modelo profesor grande en un estudiante de 7,5 M de parámetros que mantiene una melodía cercana (diferencia de +7,46 puntos percentiles respecto a las grabaciones originales de Maya-1) y una tasa de palabras poco claras de +1,6 puntos respecto a Maya-1 (5,82 % en Maya-1).

## Capacidades

- Generación de voz en inglés a partir de texto, con diez voces predefinidas (Kenzie, Simone, Amy, Frankie, Darlene, Owen, Toby, Jack, Earl, Magnus).
- Síntesis en un solo pase por frase, sin difusión ni flow matching, lo que permite baja latencia.
- Ejecución en CPU de gama baja y en navegador mediante WebGPU o WASM.
- Front-end fonético robusto con diccionario revisado manualmente y reglas para términos técnicos, números, fechas, dinero y unidades.
- Soporte de voces en inglés estadounidense y británico.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- No se menciona modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- **Síntesis de voz en dispositivos de gama baja**: el modelo puede ejecutarse en tablets y CPUs de bajo consumo (44x tiempo real en Samsung Galaxy Tab S10 Lite) para aplicaciones de lectura en voz alta, asistentes locales o juguetes interactivos, sin necesidad de GPU ni conexión a la nube.
- **Aplicaciones infantiles con privacidad**: al ejecutarse completamente en el dispositivo, permite generar voz para un ordenador infantil sin enviar datos a servidores externos, cumpliendo requisitos de privacidad estrictos.
- **Navegador web sin instalación**: mediante WebGPU (151x tiempo real en Mac) o WASM (82x), se puede integrar en demos o aplicaciones web que generen voz en el cliente, reduciendo costes de servidor y latencia.
- **Lectura de textos técnicos y noticias**: el front-end maneja términos técnicos, números, fechas y unidades, lo que lo hace adecuado para convertir documentación, artículos o informes en audio con pronunciación controlada.
- **Generación de voces sintéticas para prototipos**: las diez voces permiten crear contenido de audio para pruebas de usuario, maquetas o juegos sin depender de servicios de TTS en la nube.
- **Sistemas de accesibilidad**: integración en lectores de pantalla o aplicaciones de asistencia para personas con discapacidad visual, aprovechando la baja latencia (primera frase en 0,09 s) y la ejecución local.
- **Personalización de pronunciación**: gracias a la lista de anulaciones y al diccionario revisado, se puede adaptar la pronunciación de nombres propios o términos de dominio específico añadiendo líneas al fichero de anulaciones.

## Benchmarks y rendimiento

| Métrica | kale-tts-1-nano | Maya-1 (referencia) |
|---|---|---|
| Palabras poco claras (reconocedor) | +1,6 puntos vs Maya-1 | 5,82 % |
| Diferencia de melodía (percentiles) | +7,46 puntos vs Maya-1 | 0 |
| Velocidad en CPU (Samsung Galaxy Tab S10 Lite) | 44x tiempo real; primera frase en 0,09 s | No disponible |
| Velocidad en navegador Mac (WebGPU) | 151x tiempo real | No disponible |
| Velocidad en navegador Mac (WASM) | 82x tiempo real | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de TTS y no de lenguaje.

## Requisitos de hardware

- **VRAM estimada**: no aplica para CPU; en GPU, el fichero float32 de 30,6 MB requiere una VRAM mínima (prácticamente cualquier GPU moderna puede alojarlo).
- **GPU recomendadas**: no se especifican modelos concretos; el modelo está diseñado para CPU y WebGPU, por lo que cualquier GPU integrada o dedicada con soporte WebGPU es suficiente.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo e incluso en CPUs de tablets (Samsung Galaxy Tab S10 Lite).
- **Opciones de despliegue**: ONNX Runtime (CPU), WebGPU en navegador, WASM en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: 44x tiempo real en CPU de tablet; 151x en WebGPU y 82x en WASM en un Mac; primera frase en 0,09 s en CPU de tablet.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| kale-tts-1-nano | 7,5 M | No disponible | Inglés | Apache 2.0 | ONNX | 14,8 MB int8, 10 voces, CPU/WebGPU |
| kale-tts-1-tiny | No disponible | No disponible | Inglés | Apache 2.0 (presumible) | ONNX (presumible) | Versión algo más grande, mayor calidad según el autor |
| kale-tts-1-base | 82 M (Kokoro-82M fine-tune) | No disponible | Inglés | Apache 2.0 (presumible) | No disponible | Profesor, más grande y lento, no apto para tablet |
| Maya-1 | No disponible | No disponible | Inglés | No disponible | No disponible | Modelo de referencia para voces y calidad |

No se dispone de datos de benchmarks comparativos estándar entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo soporta inglés (estadounidense y británico); no hay soporte multilingüe.
- **Calidad**: aunque cercana a Maya-1, presenta un incremento de +1,6 puntos en palabras poco claras y +7,46 puntos de diferencia de melodía respecto a las grabaciones originales, lo que puede afectar a la naturalidad en comparación con modelos más grandes.
- **Alucinación**: no aplica en el sentido de generación de texto, pero el front-end puede producir pronunciaciones incorrectas en palabras desconocidas o nombres propios no incluidos en el diccionario o en las anulaciones.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe verificar que las voces sintéticas (generadas por Maya-1) no tengan restricciones adicionales; el dataset kale-tts-1-data tiene licencia CC BY 4.0.
- **Estado del modelo**: la model card indica "DRAFT, NOT PUBLISHED", lo que sugiere que el modelo puede no estar finalizado o validado completamente para producción.
- **Dependencia del front-end**: la calidad depende en gran medida del diccionario y las reglas de pronunciación; palabras técnicas o de dominio específico pueden requerir anulaciones manuales.
- **Sin soporte de tool calling ni agentes**: no es un modelo de lenguaje, por lo que no puede realizar tareas de razonamiento, código o matemáticas.

## Enlaces

- [Hugging Face: KaleComputer/kale-tts-1-nano](https://huggingface.co/KaleComputer/kale-tts-1-nano)
- [Modelo base: KaleComputer/kale-tts-1-base](https://huggingface.co/KaleComputer/kale-tts-1-base)
- [Dataset: KaleComputer/kale-tts-1-data](https://huggingface.co/datasets/KaleComputer/kale-tts-1-data)
- [Modelo relacionado: kale-tts-1-tiny](https://huggingface.co/KaleComputer/kale-tts-1-tiny)
- [Demo: kale-tts-1 en Hugging Face Spaces](https://huggingface.co/spaces/KaleComputer/kale-tts-1)
- [Maya-1 (modelo de referencia)](https://huggingface.co/maya-research/maya1)
