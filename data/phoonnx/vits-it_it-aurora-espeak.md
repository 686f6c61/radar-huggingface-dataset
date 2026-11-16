# Phoonnx/vits-it_it-aurora-espeak

## Resumen

vits-it_it-aurora-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo original procede del proyecto de kirys79, en concreto de la voz Aurora del repositorio piper_italiano, y ha sido adaptado para funcionar con el ecosistema phoonnx, que lo ejecuta tanto en Python como en el asistente OVOS. Su propósito es convertir texto en italiano (it-IT) en audio inteligible mediante fonemas generados por espeak-ng en alfabeto IPA.

El modelo resuelve un problema concreto: ofrecer una voz italiana de código abierto, ligera (el repositorio ocupa aproximadamente 0,1 GB) y ejecutable en entornos de producción sin depender de infraestructura propietaria. Al estar empaquetado en formato ONNX, se puede desplegar en CPU y en dispositivos de recursos limitados, lo que lo hace adecuado para asistentes de voz locales, sistemas de accesibilidad y aplicaciones de lectura en voz alta.

Su relevancia actual radica en la combinación de licencia permisiva (CC-BY-4.0), integración con el stack phoonnx/OVOS y soporte para inferencia en navegador mediante phoonnx.js. No obstante, se trata de un modelo de nicho con muy poca tracción (23 descargas, 0 likes) y con información técnica pública limitada, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (librería phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales. El modelo genera directamente la forma de onda a partir de fonemas, sin necesidad de un vocoder separado. En este caso, la entrada de texto se procesa mediante espeak-ng para obtener fonemas en alfabeto IPA, que constituyen la entrada real del modelo.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo original (Aurora) fue desarrollado por kirys79 dentro del proyecto piper_italiano, pero la model card no detalla el proceso de entrenamiento. La innovación destacable es el empaquetado para phoonnx, que permite ejecutar el modelo en ONNX con integración en OVOS y en navegador mediante phoonnx.js, además del uso de scriptconv para normalización de texto y fonemización.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto plano.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Fonemización basada en espeak-ng con alfabeto IPA; requiere espeak-ng instalado o el extra `phoonnx[espeak]` (port espyak).
- Integración con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante phoonnx.js (demo en tigregotico.pt/demo).
- Normalización de texto y conversión de script mediante la librería scriptconv.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS puro).
- No soporta visión, audio de entrada ni modo thinking.
- Capacidad multilingüe limitada al italiano; no se documentan otros idiomas.

## Casos de uso

- Asistentes de voz locales en italiano: el modelo se integra en OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en it-IT sin depender de servicios en la nube, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Lectura en voz alta de documentos y artículos: se puede usar la API de phoonnx para convertir texto plano en WAV, adecuado para aplicaciones de accesibilidad o lectura de noticias en italiano.
- Sistemas de anuncios automatizados en italiano: integración en pipelines de CI/CD o scripts de Python que generen avisos de voz a partir de texto dinámico, usando `voice.synthesize_wav`.
- Aplicaciones web con TTS en el navegador: mediante phoonnx.js se puede ejecutar la voz en el cliente sin servidor, útil para demos interactivas o herramientas educativas en italiano.
- Prototipado de interfaces conversacionales: al ser un modelo ligero y de licencia CC-BY-4.0, sirve para experimentar con TTS en italiano en entornos de investigación sin coste de licencia.
- Generación de audio para contenido multimedia: creación de locuciones en italiano para vídeos, pódcast o audiolibros de bajo presupuesto, siempre que se respete la atribución de la licencia CC-BY-4.0.
- Pruebas de integración en OVOS: validación de la cadena completa de texto a voz en un asistente doméstico con configuración `mycroft.conf`, útil para desarrolladores que evalúan el stack phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; al ser un modelo VITS empaquetado en ONNX con un repositorio de 0,1 GB, es probable que quepa en CPU y en GPUs de gama baja, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime, y no se especifican GPUs concretas (A100, H100, RTX 4090, etc.).
- ¿Cabe en consumer GPU?: sí, por el tamaño del repositorio (0,1 GB) es esperable que quepa en cualquier GPU consumer, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-it_it-aurora-espeak | VITS | it-IT | no aplica | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| Piper (voces italianas, p. ej. kirys79/piper_italiano) | VITS | it-IT | no aplica | no disponible en la información | ONNX | Hugging Face |
| Modelos TTS de Coqui (p. ej. XTTS) | no disponible | multilingüe | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de disponibilidad y licencia; los parámetros y benchmarks de las alternativas no están documentados aquí.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datos de voz de un autor concreto (Aurora), puede reflejar características prosódicas y acento específicos.
- Riesgo de alucinación: en TTS se traduce en pronunciación incorrecta de palabras, especialmente si se usa el port espyak en lugar de espeak-ng, ya que algunos fonemas difieren y la voz puede decir mal ciertas palabras.
- Limitaciones de idioma: solo soporta italiano (it-IT); no se documentan otros idiomas.
- Limitaciones de contexto: no aplica ventana de contexto de texto, pero la calidad depende de la normalización de scriptconv y de la fonemización correcta.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial siempre que se atribuya la autoría; es necesario citar al autor original (kirys79) y el empaquetado (Phoonnx).
- Caveat para producción: el modelo tiene muy poca tracción (23 descargas, 0 likes) y no se han publicado benchmarks; se recomienda validar la calidad de síntesis en el dominio concreto antes de desplegarlo.
- Dependencia externa: requiere espeak-ng instalado o el extra `phoonnx[espeak]`; sin ello, el modelo no puede fonemizar correctamente.
- Tamaño del repositorio: 0,1 GB, lo que sugiere un modelo pequeño, pero no se confirman parámetros ni calidad objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-aurora-espeak
- Modelo original (Aurora): https://huggingface.co/kirys79/piper_italiano/tree/main/Aurora
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
