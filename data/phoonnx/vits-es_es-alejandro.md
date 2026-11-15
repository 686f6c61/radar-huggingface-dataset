# Phoonnx/vits-es_es-alejandro

## Resumen

vits-es_es-alejandro es un modelo de síntesis de voz (text-to-speech) en espanol de Espana, empaquetado en formato ONNX por Phoonnx a partir del modelo original HiTZ/TTS-es_alejandro desarrollado por el HiTZ Center (Universidad del Pais Vasco). El modelo emplea la arquitectura VITS, un sistema end-to-end de TTS que combina un codificador de texto, un decodificador generativo basado en flujos normales y un discriminador adversarial, y que produce audio de forma directa sin necesidad de un vocoder externo.

La relevancia de este empaquetado reside en su integracion con el ecosistema phoonnx y OVOS: el modelo se distribuye como pesos ONNX listos para inferencia en Python, con un front-end de texto basado en la libreria scriptconv que normaliza el texto y lo convierte a fonemas IPA mediante el fonemizador AhoTTS. Esto lo hace adecuado para asistentes de voz autoalojados y pipelines de TTS en produccion, sin dependencia de frameworks de aprendizaje profundo pesados.

El repositorio ocupa 0,1 GB y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial. La voz esta etiquetada como `hitz/es_alejandro-vits` dentro del gestor de voces de phoonnx. No se dispone de informacion publica sobre el numero de parametros, el dataset de entrenamiento ni metricas de calidad (MOS) en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo indica formato ONNX) |
| Idiomas soportados | es-ES (espanol de Espana) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas ahotts, alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que integra en un unico modelo un codificador de texto, un prior condicionado por texto, un decodificador basado en flujos normales y un decodificador de audio generativo. El entrenamiento tipico de VITS combina una perdida adversarial (GAN) con una perdida de reconstruccion y una perdida de divergencia KL entre el prior y la posterior, lo que permite generar formas de onda directamente a partir de fonemas sin un vocoder separado. La entrada del modelo son fonemas en alfabeto IPA generados por el fonemizador AhoTTS de scriptconv.

No se dispone de informacion en la documentacion proporcionada sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable tipicamente a TTS) ni innovaciones tecnicas especificas del entrenamiento original de HiTZ/TTS-es_alejandro. El empaquetado de Phoonnx se limita a exportar el modelo a ONNX y a integrarlo con el front-end de texto de scriptconv.

## Capacidades

- Sintesis de voz a partir de texto en espanol de Espana (es-ES), con salida en formato WAV.
- Conversion de texto a fonemas IPA mediante el fonemizador AhoTTS (extra `scriptconv[eu]`).
- Generacion de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Integracion con el gestor de voces de phoonnx (`hitz/es_alejandro-vits`).
- Uso como plugin de TTS en OVOS mediante `ovos-tts-plugin-phoonnx`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo exclusivamente TTS).
- No soporta vision, audio de entrada ni modo thinking.
- Capacidad multilingue limitada a es-ES segun la model card.

## Casos de uso

- Asistentes de voz autoalojados: el modelo se integra en OVOS como plugin de TTS, permitiendo construir asistentes por voz sin depender de servicios en la nube y con licencia Apache 2.0 para uso comercial.
- Lectura de contenido en aplicaciones de accesibilidad: sintesis de texto a voz en espanol para lectores de pantalla o narracion de articulos, con inferencia local en ONNX.
- Generacion de avisos y locuciones automatizadas: produccion de audio para sistemas de megafonia, centralitas telefonicas o notificaciones, usando la API `synthesize_wav` de phoonnx.
- Doblaje y narracion de contenido editorial: generacion de pistas de voz para videos, podcasts o audiolibros en espanol de Espana, con la ventaja de un modelo ligero (0,1 GB).
- Pruebas de integracion en pipelines de CI/CD: al ser un modelo ONNX pequeno, puede ejecutarse en contenedores ligeros para validar flujos de TTS en pruebas automatizadas.
- Prototipado de interfaces conversacionales: generacion rapida de respuestas habladas en asistentes de voz o chatbots telefonicos durante fases de desarrollo, sin coste de API externa.
- Educacion y aprendizaje de idiomas: sintesis de frases en espanol para ejercicios de pronunciacion o materiales didacticos, con salida WAV facilmente integrable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en CPU y en GPUs de gama baja.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria suficiente, aunque no se confirma en la documentacion.
- Cabe en GPU consumer: si, por el tamano del repositorio (0,1 GB), aunque no se especifica el consumo exacto.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto/entrada |
|---|---|---|---|---|---|
| vits-es_es-alejandro (Phoonnx) | VITS | es-ES | Apache 2.0 | ONNX | fonemas IPA (ahotts) |
| HiTZ/TTS-es_alejandro (upstream) | VITS | es-ES | Apache 2.0 | no disponible | fonemas IPA |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no disponible | ONNX | fonemas segun idioma |

No se dispone de datos de rendimiento (MOS, latencia) para comparar cuantitativamente con alternativas. La comparativa se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo exclusivamente de sintesis de voz: no realiza generacion de texto, razonamiento, codigo ni otras tareas de lenguaje.
- Idioma limitado a es-ES; no se garantiza calidad en otras variantes del espanol ni en otros idiomas.
- No se han publicado datos sobre sesgos, calidad percibida (MOS) ni robustez ante textos fuera de dominio.
- Riesgo de alucinacion no aplica en el sentido de generacion de texto, pero si puede haber errores de pronunciacion o entonacion en palabras no vistas durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream HiTZ/TTS-es_alejandro, ya que la model card indica que la licencia se declara en el repositorio original.
- Dependencia de la libreria phoonnx y del extra `scriptconv[eu]` para el fonemizador AhoTTS; cambios en estas dependencias pueden afectar la inferencia.
- El repositorio tiene muy pocas descargas (30) y ningun like, por lo que la validacion comunitaria es escasa.
- No se dispone de informacion sobre latencia, throughput ni requisitos exactos de hardware para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-alejandro
- Modelo upstream: https://huggingface.co/HiTZ/TTS-es_alejandro
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
