# Phoonnx/vits-ha_ne-openbible-low-epitran

## Resumen

vits-ha_ne-openbible-low-epitran es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su sistema de voces Mimic3 y empaquetado por Phoonnx en formato ONNX para su librería de TTS homónima. El modelo está entrenado específicamente para el hausa de Níger (`ha-NE`), una variedad del hausa hablado en el norte de Nigeria y zonas limítrofes de Níger, y su nombre hace referencia al corpus Open Bible utilizado como fuente de datos de entrenamiento en su variante de baja calidad (`low`).

La relevancia de este modelo es acotada pero concreta: cubre una lengua de bajos recursos dentro del ecosistema de asistentes de voz open source, y lo hace en un formato (ONNX) y una librería (phoonnx) pensados para despliegue ligero en entornos OVOS/Mycroft. No es un modelo de propósito general ni compite con los grandes sistemas TTS comerciales, sino que resuelve el problema de disponer de una voz funcional y empaquetada para una lengua y variedad dialectal específicas dentro de una pila de asistente de voz libre.

El repositorio es de pequeño tamaño (0,1 GB), lo que es coherente con un modelo VITS de voz única. La información pública disponible sobre el modelo es escasa: no se detallan parámetros, contexto ni métricas de calidad, por lo que esta ficha se limita a lo declarado en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, variacional con adversarial training) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS por frase; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | hausa de Níger (`ha-NE`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial multi-periodo, con alineamiento monotónico aprendido (MAS) para evitar necesidad de alineamientos explícitos. El modelo produce audio directamente a partir de fonemas, sin pipeline separado de duración y vocoder. En este caso, la entrada de texto no es texto plano sino fonemas en alfabeto IPA generados por el fonemizador Epitran de la librería scriptconv.

El modelo procede de la voz `ha_NE/openbible_low` del repositorio MycroftAI/mimic3-voices, entrenada sobre el corpus Open Bible en su variante de baja calidad. No se dispone de información sobre número de tokens, horas de audio, composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (poco habituales en TTS de esta generación). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS y del empaquetado ONNX para inferencia ligera.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en hausa de Níger, con salida en fichero WAV.
- Fonemización de entrada mediante Epitran (`scriptconv[epitran]`), que convierte texto a fonemas IPA antes de la síntesis.
- Integración como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Carga y gestión de voces mediante `TTSModelManager` de phoonnx.
- Ejecución en formato ONNX, apta para inferencia en CPU sin dependencias de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de LLM.
- No dispone de control de estilo, emoción, hablante múltiple ni clonación de voz según la información disponible.

## Casos de uso

- Asistentes de voz en hausa para OVOS/Mycroft: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz a un asistente doméstico en hausa de Níger sin depender de servicios en la nube.
- Lectura de textos y contenidos en hausa: síntesis de documentos, artículos o material formativo a audio WAV para distribución offline.
- Accesibilidad para hablantes de hausa con discapacidad visual: conversión de texto a voz en un idioma de bajos recursos donde las alternativas comerciales son escasas.
- Sistemas de anuncios y avisos automatizados: generación de mensajes hablados pregrabados o dinámicos en hausa para aplicaciones de transporte, salud pública o agricultura.
- Investigación en TTS para lenguas de bajos recursos: el modelo sirve como línea base reproducible y empaquetada para comparar con otras aproximaciones en hausa.
- Prototipado de interfaces de voz en entornos con recursos limitados: al ser ONNX y de 0,1 GB, puede ejecutarse en CPU en dispositivos modestos, lo que facilita pruebas en campo.
- Aplicaciones educativas de aprendizaje de hausa: generación de audio de apoyo para materiales didácticos y ejercicios de pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; el modelo está en ONNX y está pensado para ejecución en CPU.
- GPU recomendadas: no se especifican; al ser un VITS de voz única y 0,1 GB de repositorio, no requiere GPU dedicada.
- Cabe en GPU consumer: sí, con amplio margen, aunque no es un requisito; también funciona en CPU.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, y en general cualquier runtime compatible con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-ha_ne-openbible-low-epitran | VITS | hausa (ha-NE) | no aplica | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces Mimic3 de Mycroft AI | VITS | múltiples lenguas | no aplica | variable según voz | ONNX / otros | GitHub MycroftAI/mimic3-voices |
| Modelos TTS multilingües comerciales | variable | multilingüe | no aplica | propietaria | API | servicios en la nube |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a una única variedad dialectal (`ha-NE`); no está pensado para otras variedades del hausa ni para otros idiomas.
- Entrenado sobre el corpus Open Bible en variante de baja calidad (`low`), lo que puede implicar una calidad de audio y naturalidad inferior a la de modelos entrenados con corpus de mayor calidad.
- Requiere fonemización previa con Epitran; el texto debe pasar por `scriptconv[epitran]`, lo que añade una dependencia y posibles errores en la conversión a IPA.
- No hay información pública sobre sesgos, tasas de alucinación o errores de pronunciación específicos.
- Licencia CC-BY-SA-4.0: permite uso comercial pero impone atribución y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar la integración en productos propietarios.
- Sin métricas de calidad (MOS, WER) publicadas; la evaluación en producción requeriría pruebas propias.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No dispone de control de prosodia, emoción ni selección de hablante.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ha_ne-openbible-low-epitran
- Repositorio upstream (MycroftAI/mimic3-voices, voz ha_NE/openbible_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/ha_NE/openbible_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección de modelos VITS empaquetados para phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
