# Phoonnx/vits-de_de-m_ailabs-low

## Resumen

vits-de_de-m_ailabs-low es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Mycroft AI para su proyecto Mimic 3 y empaquetado por Phoonnx en formato ONNX para su libreria de inferencia TTS homonima. El modelo esta especializado en aleman (de-DE) y forma parte del catalogo de voces que Phoonnx distribuye para su ecosistema, incluyendo integracion con OVOS (Open Voice OS).

La relevancia del modelo radica en su caracter ligero ("low" en el nombre hace referencia a una variante de baja capacidad del catalogo Mimic 3) y su empaquetado en ONNX, lo que facilita el despliegue en entornos con recursos limitados, como asistentes de voz embebidos, dispositivos de borde o aplicaciones de escritorio. No es un modelo de proposito general ni compite con los grandes TTS neuronales actuales, sino que cubre un nicho concreto: sintesis de voz alemana offline y de baja latencia dentro del stack de Phoonnx y OVOS.

El repositorio ocupa aproximadamente 0,1 GB, lo que confirma su naturaleza compacta. La model card no proporciona detalles sobre el numero de parametros, la longitud de contexto (no aplica en el sentido tradicional de LLM) ni los datos de entrenamiento, por lo que varios campos de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | aleman (de-DE) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python / OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder basado en flujos normalizadores y un discriminador adversarial entrenado con perdidas de reconstruction y adversariales. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado. La variante "low" del catalogo Mimic 3 corresponde a una configuracion de menor capacidad que la version estandar, pensada para reducir requisitos de computo y tamano de modelo.

El modelo original fue entrenado por Mycroft AI y publicado en el repositorio mimic3-voices. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning preferencial (no aplicables en TTS de esta generacion). El front-end de texto utiliza el fonemizador gruut a traves de la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA antes de la inferencia. Phoonnx se encarga unicamente del empaquetado y la ejecucion del modelo en ONNX.

## Capacidades

- Sintesis de voz en aleman (de-DE) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Normalizacion y fonemizacion automatica del texto de entrada mediante scriptconv y gruut.
- Integracion como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable via `mycroft.conf`.
- Ejecucion offline en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada exclusivamente al aleman.

## Casos de uso

- Asistentes de voz embebidos en OVOS: el modelo se integra como plugin TTS nativo y permite dotar de voz alemana a un asistente local sin conexion a internet, gracias a su formato ONNX y su reducido tamano (~0,1 GB).
- Lectura de notificaciones y alertas en dispositivos de borde: su baja huella de memoria permite ejecutarlo en Raspberry Pi o dispositivos similares para leer mensajes del sistema en aleman.
- Accesibilidad para personas con discapacidad visual: sintesis de texto a voz en aleman para lectores de pantalla o aplicaciones de asistencia, con inferencia local que preserva la privacidad del contenido leido.
- Prototipado rapido de interfaces de voz: desarrolladores que necesiten una voz alemana funcional en pocas lineas de Python pueden usar la API de phoonnx sin entrenar ni configurar infraestructura compleja.
- Sistemas de anuncios automatizados en transporte o comercio: generacion de avisos pregrabados o dinamicos en aleman para altavoces en estaciones, tiendas o aeropuertos, donde la latencia y el coste por inferencia son criticos.
- Testing de pipelines de audio: uso como voz de referencia en pruebas automatizadas de sistemas de reconocimiento de voz, diarizacion o procesamiento de audio en aleman.
- Educacion de idiomas: generacion de pronunciaciones de referencia en aleman para aplicaciones de aprendizaje, aprovechando la fonemizacion IPA subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) se estima un consumo de memoria en el rango de cientos de MB, apto para CPU.
- GPU recomendadas: no se especifican; el modelo esta pensado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: previsiblemente si (RTX 4090, RTX 3060, etc.), aunque no hay datos oficiales de rendimiento en GPU.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-de_de-m_ailabs-low (este modelo) | VITS | de-DE | ~0,1 GB | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) |
| Otras voces VITS de Mimic 3 (p. ej. variantes "high" o "medium") | VITS | de-DE y otros | no disponible | CC-BY-SA-4.0 | ONNX | Hugging Face (Phoonnx) / GitHub MycroftAI |
| Modelos TTS neuronales de gran escala (p. ej. Piper, Coqui XTTS) | VITS / autoregresivo | multilingue | mayor | variable | ONNX / otros | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en aleman; no soporta otros idiomas.
- Variante "low" del catalogo Mimic 3: la calidad de sintesis es previsiblemente inferior a la de las variantes de mayor capacidad, aunque no se aportan metricas objetivas.
- No es un modelo de lenguaje: no puede realizar razonamiento, generacion de codigo, tool calling ni tareas de agente.
- Riesgo de pronunciacion incorrecta en palabras extranas, acronimos o nombres propios no cubiertos por el fonemizador gruut.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Dependencia de la libreria phoonnx y del extra `scriptconv[gruut]` para el front-end de texto; cambios en estas dependencias pueden afectar la reproducibilidad.
- No se documentan sesgos especificos del habla (genero, acento regional, edad) ni la composicion del dataset de entrenamiento, lo que impide evaluar su representatividad.
- El modelo fue creado y actualizado en noviembre de 2026 segun los metadatos del repositorio; conviene verificar la vigencia del empaquetado y de las dependencias asociadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-m_ailabs-low
- Repositorio upstream (MycroftAI/mimic3-voices, voz de_DE/m-ailabs_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/de_DE/m-ailabs_low
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx en Hugging Face: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Proyecto OVOS (Open Voice OS): https://github.com/OpenVoiceOS
