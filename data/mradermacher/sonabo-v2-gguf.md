# mradermacher/sonabo-v2-GGUF

## Resumen

Sonabo v2 es un modelo de texto a voz (TTS) especializado en armenio oriental, publicado originalmente por el usuario davitlive5 como `davitlive5/sonabo-v1` y distribuido en formato GGUF por mradermacher bajo el identificador `mradermacher/sonabo-v2-GGUF`. Se trata de una adaptación del modelo Qwen3-TTS (según la etiqueta `qwen3-tts` de la model card) orientada a la síntesis de voz en armenio, con capacidades declaradas de clonación de voz y streaming. El modelo cuenta con 602.341.376 parámetros y está publicado con licencia Apache 2.0.

La relevancia de este modelo radica en su carácter especializado: el armenio oriental es un idioma con escasa representación en los sistemas TTS comerciales y de código abierto, por lo que una adaptación específica sobre una arquitectura moderna como Qwen3-TTS cubre un nicho poco atendido. La disponibilidad de cuantizaciones GGUF facilita su despliegue en entornos con recursos limitados y en herramientas compatibles con llama.cpp.

No obstante, la información pública disponible es muy escasa: la model card del repositorio GGUF es una plantilla genérica de mradermacher que no documenta el proceso de entrenamiento, los datos utilizados ni resultados de evaluación. Las cuantizaciones publicadas en el momento de la consulta se limitan a los ficheros `mmproj` (suplemento multimodal), sin que aparezcan los ficheros GGUF principales del modelo en la tabla de cuantizaciones proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como `qwen3-tts`, derivada de Qwen3-TTS) |
| Parametros totales | 602.341.376 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (según metadatos de la model card); ficheros `mmproj` en Q8_0 y f16 |
| Idiomas soportados | armenio (`hy`), armenio oriental |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); modelo base original en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3-tts`, que indica que el modelo deriva de la familia Qwen3-TTS de Alibaba. Se trata, por tanto, de un modelo de síntesis de voz construido sobre una arquitectura transformer adaptada a la generación de audio, con 602 millones de parámetros. El repositorio incluye ficheros `mmproj` (proyección multimodal), lo que sugiere un componente de codificación de audio o de condicionamiento multimodal en el pipeline.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas específicas más allá de las capacidades declaradas en las etiquetas: clonación de voz y streaming. El modelo base declarado es `davitlive5/sonabo-v1`, y este repositorio es una conversión estática a GGUF realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`. No se han publicado cuantizaciones ponderadas o imatrix.

## Capacidades

- Síntesis de texto a voz en armenio oriental (`hy`).
- Clonación de voz (voice cloning), según las etiquetas de la model card.
- Generación de audio en streaming.
- Integración con el ecosistema transformers y con herramientas compatibles con GGUF.
- Soporte de ficheros `mmproj` para el componente multimodal del pipeline TTS.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de visión más allá del componente de audio propio del TTS.

## Casos de uso

- Locución automatizada en armenio oriental: el modelo puede generar voz sintética para narración de artículos, audiolibros o contenido editorial en armenio, un idioma con poca cobertura en soluciones TTS comerciales.
- Accesibilidad para hablantes de armenio: conversión de texto a voz para lectores de pantalla y aplicaciones de accesibilidad dirigidas a la comunidad armenófona.
- Clonación de voz para doblaje y localización: gracias a la capacidad declarada de voice cloning, se puede adaptar una voz concreta para doblar contenido audiovisual al armenio oriental.
- Asistentes de voz embebidos: el tamaño de 602 M de parámetros y la disponibilidad de cuantizaciones GGUF permiten desplegar el modelo en dispositivos con recursos moderados para interfaces conversacionales por voz.
- Generación de audio para streaming: la capacidad de streaming declarada lo hace adecuado para aplicaciones de respuesta por voz en tiempo real, como agentes telefónicos o chatbots con salida hablada.
- Prototipado e investigación en TTS de bajos recursos: sirve como base para experimentos de fine-tuning y evaluación en armenio, dado que el ecosistema de modelos TTS para este idioma es reducido.
- Integración en pipelines de contenido multimedia: generación automatizada de pistas de voz para vídeos, pódcast o materiales educativos en armenio oriental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 602 M de parámetros, en f16 el modelo ocupa aproximadamente 1,2 GB de pesos; en Q8_0 alrededor de 0,6-0,7 GB; en Q4_K_M en torno a 0,4 GB. A ello hay que sumar el fichero `mmproj` (0,7-0,9 GB) y el coste del códec de audio y del contexto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB o superior permite ejecutar el modelo con holgura. Para despliegues en servidor, A100 o H100 no son necesarias por tamaño, pero pueden emplearse para alto throughput.
- Cabe en GPU consumer: sí, en tarjetas con 4-8 GB de VRAM o más, incluidas GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: llama.cpp y sus frontends (Ollama, LM Studio, KoboldCpp) para los ficheros GGUF; el modelo base en safetensors puede ejecutarse con transformers. No se documenta soporte explícito de vLLM o TGI para este modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Sonabo v2 (este modelo) | 602 M | no disponible | armenio oriental | Apache 2.0 | GGUF, safetensors |
| Qwen3-TTS (modelo base de la familia) | no disponible | no disponible | multilingüe | no disponible en esta ficha | no disponible |
| Coqui XTTS v2 | ~467 M | no disponible | multilingüe (sin armenio confirmado) | Coqui Public Model License (no comercial) | safetensors, varios |
| Piper TTS | variable por voz (decenas de M) | no disponible | múltiples, incluido armenio en algunos checkpoints | MIT / GPL según checkpoint | ONNX |

La comparación con XTTS v2 y Piper es orientativa: XTTS v2 ofrece clonación de voz multilingüe pero con licencia restrictiva para uso comercial, mientras que Piper es más ligero y rápido pero con menor calidad de clonación. Sonabo v2 destaca por cubrir el armenio oriental con licencia Apache 2.0, aunque carece de datos públicos de evaluación que permitan comparar calidad objetivamente.

## Limitaciones y advertencias

- La model card del repositorio GGUF es una plantilla genérica de mradermacher y no documenta el entrenamiento, los datos ni la evaluación del modelo.
- No se han publicado métricas objetivas (MOS, WER, similitud de hablante) que permitan evaluar la calidad del TTS.
- El modelo está especializado exclusivamente en armenio oriental; no se documenta soporte de otros idiomas.
- Riesgo de alucinación y de artefactos en la síntesis: sin benchmarks ni demos publicadas, la fidelidad de la pronunciación y la naturalidad no están verificadas.
- La clonación de voz plantea riesgos de uso indebido (suplantación, deepfakes); es responsabilidad del usuario cumplir la normativa aplicable y obtener consentimiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `davitlive5/sonabo-v1` y de Qwen3-TTS, ya que las licencias de los modelos derivados pueden heredar restricciones adicionales.
- En el momento de la consulta, la tabla de cuantizaciones del repositorio solo lista los ficheros `mmproj`; conviene comprobar la disponibilidad real de los GGUF principales antes de planificar un despliegue.
- No se documentan sesgos específicos, pero un modelo entrenado con datos limitados de un solo idioma puede presentar sesgos de hablante, registro o género.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/sonabo-v2-GGUF
- Modelo base: https://huggingface.co/davitlive5/sonabo-v1
- Página de descargas de mradermacher: https://hf.tst.eu/model#sonabo-v2-GGUF
- FAQ y peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
