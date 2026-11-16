# Phoonnx/vits-fr_fr-tom-low-gruut

## Resumen

`vits-fr_fr-tom-low-gruut` es un modelo de síntesis de voz (text-to-speech) en francés de Francia, empaquetado en formato ONNX por Phoonnx a partir de una voz original de Mycroft AI perteneciente al proyecto mimic3-voices. No es un modelo de lenguaje ni un transformer generativo de texto: es un sistema TTS completo basado en la arquitectura VITS, que combina un codificador de texto, un prior variacional, un decoder basado en flujos normalizadores y un vocoder HiFi-GAN integrado para producir audio de forma extremo a extremo.

El modelo está pensado para su uso dentro del ecosistema phoonnx, la librería ONNX de TTS de TigreGotico, y del asistente OVOS (Open Voice OS), heredero de Mycroft. Acepta como entrada fonemas generados por gruut (alfabeto IPA) y produce ondas de audio listas para reproducir. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo hace muy ligero y apto para despliegue en dispositivos con recursos limitados.

Es relevante para desarrolladores que necesiten una voz francesa offline, ligera y de licencia abierta (CC-BY-SA-4.0) para integrar en asistentes de voz, sistemas de accesibilidad o pipelines de audio, sin depender de servicios en la nube. La voz `tom_low` corresponde a un registro masculino grave según la convención de nombres de mimic3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con decoder basado en flujos y vocoder integrado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | francés de Francia (fr-FR) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas gruut (alfabeto IPA) |
| Librería | phoonnx |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz condicional variacional que combina en un único modelo: un codificador de texto basado en transformer, un prior variacional, un decoder autoregresivo invertible mediante flujos normalizadores, y un vocoder HiFi-GAN. Esta integración permite generar audio de alta calidad sin necesidad de un vocoder separado ni de alineamientos fonéticos explícitos, usando aprendizaje adversarial junto con una pérdida de reconstrucción y una estimación monotónica de alineamiento (MAS).

El modelo original fue entrenado por Mycroft AI y publicado en el repositorio mimic3-voices, en la ruta `voices/fr_FR/tom_low`. No se dispone en la información proporcionada de detalles sobre el número de tokens, horas de audio, composición del dataset ni si se aplicaron técnicas de RLHF o fine-tuning. El empaquetado actual lo realiza Phoonnx, que convierte los pesos a ONNX para su ejecución con la librería del mismo nombre, y delega la normalización y fonemización del texto a scriptconv mediante el fonemizador `GruutPhonemizer` del módulo `scriptconv.phonemizers.mul`.

## Capacidades

- Síntesis de voz (text-to-speech) en francés de Francia a partir de texto plano.
- Fonemización mediante gruut en alfabeto IPA, con normalización de texto previa por scriptconv.
- Generación de audio en formato WAV a través de la API `synthesize_wav`.
- Integración como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecución offline sobre ONNX Runtime, sin dependencia de servicios externos.
- Voz masculina grave (convención `tom_low`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni capacidades de agente: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz offline: integrado en OVOS como módulo TTS, el modelo permite que un asistente local responda en francés sin enviar texto a la nube, lo que es adecuado por su licencia abierta y su reducido tamaño (~0,1 GB).
- Sistemas de accesibilidad: lectura en voz alta de contenido textual para usuarios con discapacidad visual, ejecutándose en hardware modesto gracias al formato ONNX y a la ausencia de dependencias pesadas.
- Domótica y dispositivos embebidos: anuncios hablados en francés en Raspberry Pi u otros SBC, donde el bajo coste computacional de VITS y el tamaño reducido del modelo permiten inferencia en tiempo real.
- Kioscos y terminales de atención al público: generación de mensajes pregrabados dinámicamente en francés para señalización o avisos, sin necesidad de conexión.
- Preprocesado de audio para pipelines de datos: generación masiva de locuciones francesas sintéticas para aumentar datasets de ASR o para pruebas de sistemas de diálogo.
- Prototipado de aplicaciones de voz: validación rápida de interfaces conversacionales en francés usando la API de Python de phoonnx antes de invertir en voces comerciales.
- Investigación en TTS: referencia ligera para comparar arquitecturas VITS frente a modelos neuronales más recientes en tareas de síntesis en francés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) se espera un consumo de memoria muy reducido, inferior a 1 GB en CPU.
- GPU recomendadas: no se especifican; al ejecutarse vía ONNX Runtime puede usar CPU o GPU compatibles con ONNX Runtime (CUDA, DirectML, CoreML).
- Cabe en cualquier GPU de consumo e incluso en CPU de un solo núcleo moderno, dado el tamaño del modelo.
- Opciones de despliegue: phoonnx con ONNX Runtime en Python; integración en OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Formato | Licencia |
|---|---|---|---|---|---|
| vits-fr_fr-tom-low-gruut (este) | VITS | fr-FR | ~0,1 GB | ONNX | CC-BY-SA-4.0 |
| Otras voces mimic3 fr_FR (p. ej. otras variantes tom/siwis) | VITS | fr-FR | ~0,1 GB | ONNX | CC-BY-SA-4.0 |
| Piper (rhasspy) voces fr_FR | VITS | fr-FR | variable | ONNX | MIT / varias |
| Coqui TTS voces fr | VITS / Tacotron2 | fr-FR | variable | PyTorch | MPL-2.0 / varias |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo exclusivamente TTS: no genera texto, no razona y no soporta instrucciones complejas; cualquier expectativa de modelo de lenguaje es incorrecta.
- Solo soporta francés de Francia; el texto en otros idiomas o con caracteres no cubiertos por gruut puede producir una pronunciación incorrecta o fallos.
- La fonemización depende de gruut; errores en la normalización de texto (números, siglas, abreviaturas) afectan directamente a la calidad del audio.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- No se documentan sesgos específicos de la voz, pero al ser una voz sintética entrenada con datos limitados puede presentar artefactos prosódicos en frases largas o poco frecuentes.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de prosodia incorrecta o pronunciaciones erróneas en palabras fuera del vocabulario de entrenamiento.
- El modelo está empaquetado para phoonnx; su uso fuera de esa librería requiere cargar el ONNX directamente y replicar el front-end de fonemas, lo que no está documentado en la model card.
- Sin métricas publicadas de calidad (MOS, WER de ASR inverso) en la información disponible; la evaluación subjetiva es responsabilidad del integrador.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-fr_fr-tom-low-gruut
- Repositorio upstream (mimic3-voices, voz fr_FR/tom_low): https://github.com/MycroftAI/mimic3-voices/tree/master/voices/fr_FR/tom_low
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
