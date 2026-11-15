# Phoonnx/vits-en_us-vctk-low

## Resumen

`vits-en_us-vctk-low` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado posteriormente por Phoonnx en formato ONNX para su librería de TTS homónima. El modelo convierte texto en inglés estadounidense en audio inteligible, tomando como entrada fonemas en alfabeto IPA generados por el fonemizador gruut, y está pensado para integrarse en asistentes de voz y sistemas embebidos donde el consumo de recursos es crítico.

La relevancia de este modelo radica en su formato de despliegue: al estar empaquetado como ONNX y distribuido mediante la librería phoonnx, puede ejecutarse sin depender del stack original de PyTorch, lo que facilita su integración en entornos OVOS (Open Voice OS) y en pipelines ligeros de síntesis de voz. Su tamaño de repositorio de aproximadamente 0,1 GB y la etiqueta "low" en el nombre indican una variante optimizada para bajo consumo de recursos, en contraste con otras voces de mayor calidad del catálogo Mimic 3.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos exactos de entrenamiento en la documentación proporcionada. La model card se limita a describir el origen, el formato de entrada y las instrucciones de uso, sin detallar métricas de calidad objetiva ni comparativas con otras voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica en el sentido habitual) |
| Tipos de cuantizacion | no disponible (el modelo se distribuye en ONNX; se desconoce si existen variantes cuantizadas) |
| Idiomas soportados | inglés estadounidense (`en-US`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y de confrontación. Este diseño permite generar audio de forma directa a partir de fonemas sin necesidad de un vocoder externo, lo que simplifica el despliegue y reduce la latencia en comparación con pipelines de dos etapas.

El modelo original fue entrenado por Mycroft AI para el corpus de voces VCTK (un conjunto de grabaciones de múltiples hablantes de inglés con distintos acentos) y posteriormente convertido a ONNX por Phoonnx. La variante "low" sugiere una configuración reducida en tamaño o calidad para optimizar el rendimiento en dispositivos con recursos limitados. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos TTS de esta generación). Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV.
- Entrada basada en fonemas IPA generados por el fonemizador gruut, lo que permite un control preciso de la pronunciación.
- Integración con la librería phoonnx para Python y con el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución mediante ONNX Runtime, lo que facilita el despliegue en entornos sin PyTorch.
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo ni tool calling (no aplicables a un modelo TTS).
- No se documenta soporte de agentes ni razonamiento multi-paso (no aplicable).

## Casos de uso

- Asistentes de voz embebidos: el modelo puede integrarse en dispositivos con recursos limitados (Raspberry Pi, sistemas domóticos) gracias a su formato ONNX y su reducido tamaño de repositorio, proporcionando respuestas habladas en inglés estadounidense.
- Sistemas OVOS: mediante el plugin `ovos-tts-plugin-phoonnx`, se puede seleccionar la voz `mimic3/en_US/vctk_low` en la configuración de Mycroft/OVOS para dotar de voz a un asistente doméstico open source.
- Lectura de notificaciones y alertas: en aplicaciones de monitorización o domótica, el modelo puede convertir mensajes de texto en audio para alertas por voz, con baja latencia gracias a la inferencia ONNX.
- Accesibilidad: conversión de texto a voz para personas con discapacidad visual en aplicaciones de escritorio o móviles que requieran un motor TTS ligero y de código abierto.
- Pruebas y desarrollo de pipelines TTS: al ser un modelo pequeño y fácil de desplegar, resulta útil como referencia para validar integraciones con phoonnx y scriptconv antes de pasar a voces de mayor calidad.
- Generación de audio para prototipos de interfaces conversacionales: en fases de desarrollo, permite generar diálogos de prueba en inglés sin depender de servicios cloud de TTS.
- Educación y aprendizaje de idiomas: puede utilizarse para generar pronunciaciones de referencia en inglés estadounidense a partir de texto, aunque la calidad "low" limita su uso en contextos que requieran naturalidad alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; dado el tamaño del repositorio (0,1 GB), se estima un consumo de memoria muy reducido, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU sin GPU dedicada. Cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede ejecutarlo con holgura, aunque no es necesario.
- Cabe en GPU consumer: sí, en cualquier GPU consumer e incluso en CPU y dispositivos embebidos.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; integración con OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Tamaño repo | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-vctk-low | VITS | en-US | ONNX | CC-BY-SA-4.0 | ~0,1 GB | Variante "low" para recursos limitados |
| Otras voces VITS de la colección Phoonnx | VITS | varios | ONNX | variable | no disponible | Misma familia de empaquetado, distintas calidades |
| Piper TTS (voces en_US) | VITS | en-US | ONNX | MIT (mayoría) | variable | Alternativa popular para TTS ligero en embebidos |
| Coqui TTS (modelos VITS) | VITS | varios | PyTorch | MPL-2.0 / variable | variable | Requiere stack PyTorch, mayor consumo |

No se dispone de datos de rendimiento objetivo para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Calidad de voz limitada: la variante "low" está optimizada para bajo consumo, por lo que la naturalidad y fidelidad del audio serán inferiores a las de voces de mayor tamaño.
- Solo inglés estadounidense: no soporta otros idiomas ni acentos, lo que restringe su uso en aplicaciones multilingües.
- Dependencia de gruut: el texto debe convertirse a fonemas IPA mediante el fonemizador gruut, lo que añade una dependencia adicional (`scriptconv[gruut]`) y puede introducir errores en palabras fuera del léxico o con grafías ambiguas.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para productos propietarios.
- Sin datos de sesgos: no se documentan sesgos conocidos, pero al derivar de VCTK (corpus de hablantes con acentos variados) podría presentar sesgos de pronunciación en función del hablante seleccionado.
- Riesgo de alucinación: en TTS, se traduce en pronunciaciones incorrectas o artefactos de audio ante entradas atípicas, siglas o números no normalizados correctamente.
- Sin garantías de producción: la model card no documenta pruebas de robustez, latencia ni calidad en entornos de producción; se recomienda validación previa.
- Fecha de creación futura (2026-11-14): dato atípico que podría indicar un error en los metadatos del repositorio; conviene verificar la vigencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-vctk-low
- Repositorio upstream (MycroftAI/mimic3-voices, voz vctk_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/en_US/vctk_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Proyecto OVOS (Open Voice OS): no disponible en la información proporcionada.
