# Phoonnx/glowtts-it-it-lisa

## Resumen

GlowTTS-it-it-lisa es un modelo de sintesis de voz (text-to-speech) concretamente un checkpoint de la familia GlowTTS, publicado por el usuario Phoonnx en Hugging Face. Se distribuye como una carpeta extraida del repositorio agregador `Phoonnx/phoonnx-glowtts`, con el identificador de voz `larynx/it-it-lisa-glow_tts`, y esta empaquetado para su uso con la libreria `phoonnx` (proyecto de TigreGotico). El modelo toma texto en italiano y genera audio correspondiente a la voz denominada "lisa".

El modelo se sirve en formato ONNX (tag `onnx`), lo que indica que los pesos estan exportados para inferencia mediante ONNX Runtime en lugar de un framework de entrenamiento como PyTorch. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un modelo TTS ligero de tipo GlowTTS, no con un modelo de lenguaje de gran escala.

La relevancia de esta ficha es limitada y acotada: se trata de un artefacto de inferencia para sintesis de voz en italiano dentro del ecosistema phoonnx/Larynx, sin model card detallada, sin datos de entrenamiento publicados, sin benchmarks y sin especificacion de licencia concreta mas alla de `license: other`. No es un modelo de lenguaje ni un modelo multimodal general; cualquier evaluacion debe hacerse en ese contexto estricto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (text-to-speech, normalizing flow) segun tags del modelo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX) |
| Idiomas soportados | italiano (codigo `it-it` en el identificador de voz) |
| Licencia | other (sin licencia concreta nombrada en la model card) |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline declarado | text-to-speech |
| Identificador de voz | `larynx/it-it-lisa-glow_tts` |

## Arquitectura y entrenamiento

Segun los tags y el nombre del modelo, la arquitectura es GlowTTS, un modelo de sintesis de voz basado en normalizing flows que aprende una transformacion invertible entre la representacion textual y el espectrograma mel, con un decoder generativo que produce la forma de onda o el espectrograma final. Es una arquitectura ligera y rapida en inferencia, habitual en el ecosistema Larynx para voces multilingues de bajo coste computacional.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el hablante de origen de la voz "lisa", ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino especifico. La model card solo indica que los ficheros conservan las rutas del repositorio agregador `Phoonnx/phoonnx-glowtts` y que se ha extraido la carpeta `it-it-lisa` como modelo independiente. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.), y en un modelo TTS de este tipo no aplican en el sentido habitual de los LLM.

## Capacidades

- Sintesis de voz a partir de texto en italiano (text-to-speech), con la voz identificada como "lisa".
- Generacion de audio mediante inferencia ONNX a traves de la libreria phoonnx.
- Integracion en pipelines de TTS del ecosistema Larynx/phoonnx mediante el identificador de voz `larynx/it-it-lisa-glow_tts`.
- No se documentan capacidades de clonacion de voz, control de emocion, prosodia avanzada ni multiples hablantes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidades multilingues: unicamente italiano segun el identificador; no se documentan otros idiomas.
- No se documentan modos especiales (thinking mode, streaming, etc.).

## Casos de uso

- Lectura de articulos y contenido web en italiano: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o lectura por voz, aprovechando que es un TTS ligero (~0,1 GB) y desplegable en entornos con recursos limitados.
- Asistentes de voz para dispositivos embebidos en italiano: al estar exportado a ONNX y tener un tamano reducido, puede ejecutarse en hardware modesto (Raspberry Pi, moviles, navegador) dentro de una app con phoonnx.
- Generacion de locuciones para videos y podcasts en italiano: sintesis por lotes de guiones de texto a audio con una voz femenina consistente ("lisa"), sin necesidad de un estudio de grabacion.
- Sistemas de anuncios y notificaciones por voz: integracion en aplicaciones de domotica o telefonia que necesiten mensajes cortos en italiano con baja latencia.
- Prototipado de interfaces conversacionales: usar el modelo como capa TTS de un pipeline mas amplio (ASR + LLM + TTS) para demos y pruebas de concepto en italiano, sustituyendo el componente de sintesis.
- Accesibilidad para personas con discapacidad visual: lectura de pantalla en italiano dentro de aplicaciones de escritorio o web que empaqueten phoonnx y este checkpoint.
- Investigacion en TTS: servir como baseline ligero de GlowTTS en italiano para comparaciones con modelos mas pesados (VITS, XTTS, etc.) en experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del repositorio (~0,1 GB) es esperable que quepa en CPU y en GPUs de gama baja, aunque no se confirma en la model card.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer (GTX 1060 en adelante, RTX 2060/3060/4090) deberia ser suficiente; en muchos casos la CPU es viable.
- Cabida en GPU consumer: previsiblemente si, dado el tamano reducido del repositorio; no confirmado por el autor.
- Opciones de despliegue: libreria phoonnx (repositorio github.com/TigreGotico/phoonnx); al ser ONNX, puede ejecutarse con ONNX Runtime en Python, C++, C# o Java segun el binding elegido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/glowtts-it-it-lisa | GlowTTS ONNX | Italiano | ~0,1 GB | other | Hugging Face |
| Piper (voces ONNX) | VITS ONNX | Multiples (incluye italiano) | ~50-100 MB por voz | MIT (codigo), voces con licencias variables | Hugging Face / GitHub |
| Larynx (voces originales) | GlowTTS / VITS | Multiples | ~50-100 MB por voz | MPL-2.0 (codigo) | GitHub / Hugging Face |
| Coqui TTS XTTS v2 | GPT condicionado + VQ-VAE | Multilingue (17 idiomas) | ~1,8 GB | Coqui Public Model License (no comercial) | Hugging Face |

Comparativa basada en conocimiento general del ecosistema TTS open source; los datos de rendimiento especificos (MOS, latencia) para este checkpoint no estan publicados, por lo que no se incluyen cifras comparativas de calidad.

## Limitaciones y advertencias

- Licencia `other` sin texto de licencia concreto en la model card: no se puede asumir uso comercial sin consultar al autor o al repositorio original `Phoonnx/phoonnx-glowtts`.
- Ausencia total de informacion sobre el dataset de entrenamiento: no se puede evaluar sesgos, procedencia de la voz ni consentimiento del hablante.
- Riesgo de alucinacion: como todo TTS, puede producir pronunciaciones incorrectas, omissiones o artefactos en palabras fuera de vocabulario, siglas, numeros o nombres propios italianos.
- Limitacion idiomatica: solo italiano; usar otro idioma producira audio ininteligible o con pronunciacion incorrecta.
- Modelo ligero con calidad de voz presumiblemente inferior a modelos neuronales grandes (XTTS, Bark, etc.); no hay MOS publicado que lo confirme.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria, sin issues reportados y sin garantias de mantenimiento.
- Fecha de creacion y actualizacion registradas en 2026 (14 de noviembre de 2026), lo que puede indicar datos de fecha anomalos o de un artefacto reciente; conviene verificar el estado actual del repositorio.
- No se documenta soporte de streaming, control de prosodia ni multiples hablantes; cualquier funcionalidad mas alla de TTS basico en italiano debe validarse empiricamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-it-it-lisa
- Repositorio agregador: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Proyecto Larynx (origen de las voces): no disponible en la informacion proporcionada
- Paper de GlowTTS: no disponible en la informacion proporcionada
- Demo: no disponible
