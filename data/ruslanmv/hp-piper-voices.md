# ruslanmv/hp-piper-voices

## Resumen

HomePilot Piper Voices es un repositorio espejo que recopila 44 modelos de voz del sistema Piper TTS, un motor de síntesis de voz neuronal ligero basado en VITS y exportado a formato ONNX para inferencia eficiente en CPU y en el navegador mediante WebAssembly. El repositorio lo mantiene Ruslan Magana Vsevolodovna como copia de respaldo para el ecosistema HomePilot (3D Avatar Chatbot, HomePilot y OllaBridge), con el objetivo de garantizar la disponibilidad de las voces si la fuente original (diffusionstudio/piper-voices y rhasspy/piper) desapareciera.

No se trata de un modelo entrenado por el autor, sino de una agregación de voces ya existentes: 16 voces en inglés estadounidense, 7 en inglés británico, 5 en español, 5 en francés, 7 en alemán, 2 en italiano y 2 en portugués brasileño. Cada voz se distribuye como un par de ficheros (`.onnx` y `.onnx.json`) organizados por idioma, variante regional, hablante y calidad.

Su relevancia actual radica en que ofrece una alternativa de TTS local, sin dependencias de servicios en la nube, con licencia MIT y un tamaño de repositorio de 3,0 GB que cubre seis idiomas europeos, lo que facilita el despliegue en asistentes conversacionales, agentes de voz y aplicaciones de accesibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (red neuronal generativa end-to-end para TTS), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no acepta contexto textual largo) |
| Tipos de cuantizacion | no disponible (se distribuyen ficheros ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (US y UK), es, fr, de, it, pt (BR) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) con configuración asociada `.onnx.json` |

## Arquitectura y entrenamiento

Cada voz individual sigue la arquitectura Piper, un sistema de síntesis de voz neuronal basado en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial entrenado de forma conjunta. Piper está diseñado para inferencia de baja latencia en CPU, y la exportación a ONNX permite ejecutarlo con ONNX Runtime, así como compilarlo a WebAssembly para su uso en navegador.

El repositorio no documenta los detalles de entrenamiento de cada voz (número de horas de audio, composición del corpus, técnicas de alineamiento o fine-tuning). La model card indica únicamente que las voces provienen de diffusionstudio/piper-voices (formato ONNX optimizado para web) y del proyecto original rhasspy/piper. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en modelos TTS.

## Capacidades

- Síntesis de voz (text-to-speech) en seis idiomas: inglés estadounidense, inglés británico, español, francés, alemán, italiano y portugués brasileño.
- Múltiples voces por idioma con perfiles diversos (femeninas, masculinas, emocionales, neutras), lo que permite seleccionar timbre y estilo.
- Inferencia local en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Ejecución en navegador mediante WebAssembly, lo que habilita TTS del lado del cliente.
- Integración con el ecosistema HomePilot: 3D Avatar Chatbot, HomePilot y OllaBridge.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo exclusivamente de síntesis de voz.
- No incluye modo de razonamiento (thinking mode), visión ni audio de entrada.

## Casos de uso

- Asistentes de voz para domótica: el sistema HomePilot puede invocar las voces vía URL base (`HF_BASE`) para leer respuestas del asistente en español, inglés o alemán sin depender de APIs externas, manteniendo la privacidad del audio en local.
- Chatbots con avatar 3D en VR o escritorio: el proyecto 3D Avatar Chatbot usa Piper WASM para sincronizar el habla con animaciones faciales en el navegador, aprovechando la compilación WebAssembly de los ficheros ONNX.
- Lectura de notificaciones y alertas en aplicaciones de accesibilidad: al ejecutarse en CPU, puede integrarse en dispositivos de bajos recursos (Raspberry Pi, mini-PC) para convertir texto en voz en tiempo real.
- Generación de audiolibros o pódcasts automatizados: las 44 voces permiten alternar narradores por idioma y sección, con calidad media suficiente para contenido hablado no crítico.
- Sistemas de atención al cliente con respuesta hablada: el TTS puede sintetizar respuestas generadas por un LLM en un pipeline de agentes, aportando una capa de voz local y de baja latencia.
- Pruebas de localización multilingüe: equipos de desarrollo pueden validar la pronunciación de interfaces en seis idiomas antes de contratar voces comerciales, usando este espejo como banco de pruebas reproducible.
- Kioscos interactivos o terminales de información: la inferencia en CPU y el formato ONNX facilitan el despliegue en hardware embebido sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (inferencia en CPU; no requiere GPU).
- GPU recomendadas: no aplica; el sistema está optimizado para CPU. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no es el objetivo del proyecto.
- Compatibilidad con GPU de consumo: no relevante; funciona en CPU de consumo y en navegadores vía WebAssembly.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Piper CLI, compilación a WebAssembly para navegador, integración vía URL base en HomePilot (`https://huggingface.co/ruslanmv/hp-piper-voices/resolve/main`).
- Latencia y throughput estimados: no disponibles en la información proporcionada; Piper está diseñado para baja latencia en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomePilot Piper Voices (este repo) | TTS VITS/ONNX (espejo) | en, es, fr, de, it, pt | ONNX + JSON | MIT | Hugging Face (espejo) |
| diffusionstudio/piper-voices | TTS VITS/ONNX (fuente) | Múltiples | ONNX + JSON | MIT | Hugging Face |
| rhasspy/piper | TTS VITS (proyecto original) | Múltiples | ONNX | MIT | GitHub |
| Coqui TTS (XTTS) | TTS neuronal | Múltiples (clonación de voz) | PyTorch | MPL 2.0 / Coqui CPML | GitHub / Hugging Face |

La comparación se limita a nivel de proyecto y licencia, ya que no se dispone de métricas de calidad (MOS, WER) en la información proporcionada para este repositorio ni para las alternativas.

## Limitaciones y advertencias

- Es un espejo, no un modelo entrenado por el autor: la calidad y el mantenimiento dependen de las fuentes originales (diffusionstudio/piper-voices y rhasspy/piper).
- No se documentan métricas de calidad subjetiva (MOS) ni objetivas (WER) por voz, por lo que la idoneidad para producción debe validarse empíricamente.
- Al ser un modelo TTS, no procesa contexto textual largo ni mantiene estado conversacional; la coherencia depende del sistema que lo orquesta.
- Riesgo de alucinación acústica: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas en palabras poco frecuentes, nombres propios o siglas.
- Cobertura limitada a seis idiomas europeos; no incluye otras lenguas (catalán, gallego, euskera, árabe, chino, etc.).
- La licencia MIT se aplica según la model card, pero se recomienda verificar las licencias de cada voz original en los repositorios de procedencia antes de un uso comercial.
- El repositorio ocupa 3,0 GB; descargar todas las voces puede ser costoso en entornos con ancho de banda limitado, por lo que conviene seleccionar solo las voces necesarias.
- No se especifican parámetros, tokens de entrenamiento ni detalles del dataset, lo que dificulta la reproducibilidad y la auditoría técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ruslanmv/hp-piper-voices
- Fuente de voces optimizadas para web: https://huggingface.co/diffusionstudio/piper-voices
- Proyecto original Piper: https://github.com/rhasspy/piper
- 3D Avatar Chatbot: https://github.com/ruslanmv/3D-Avatar-Chatbot
- HomePilot: https://github.com/ruslanmv/HomePilot
- OllaBridge: https://github.com/ruslanmv/ollabridge
- Sitio del autor: https://ruslanmv.com
