# Salahuddin1234/omnidoctor-silma

## Resumen

SILMA TTS v1 es un modelo de síntesis de voz (text-to-speech) bilingüe árabe-inglés de 150 millones de parámetros, desarrollado por SILMA AI y publicado con pesos abiertos bajo licencia Apache 2.0. La ficha que se analiza aquí (Salahuddin1234/omnidoctor-silma) es una reproducción del repositorio original silma-ai/silma-tts alojada por un tercero; conserva la model card, la licencia y las etiquetas del modelo original, e incluye funcionalidad de clonación de voz instantánea.

El modelo está construido sobre la arquitectura de F5-TTS (un esquema de flow matching condicional con backbone tipo Diffusion Transformer), y fue preentrenado desde cero por el autor original con decenas de miles de horas de datos de voz públicos y propietarios. Su rasgo más distintivo es el soporte nativo de árabe con diacritización completa (Tashkeel), lo que permite controlar la pronunciación precisa, además de normalización de texto mediante NeMo Text Processing.

Es relevante ahora porque combina un tamaño reducido (150M parámetros) con latencia muy baja (RTF en torno a 0,12 sobre una RTX 4090) y clonación de voz con menos de 8 segundos de audio de referencia, todo ello bajo una licencia permisiva que permite uso comercial. Además, es 100 % compatible con el ecosistema de entrenamiento y afinado de F5-TTS v1.1.7, lo que facilita el fine-tuning por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | F5-TTS (flow matching condicional / difusión con backbone tipo DiT, según descripción del autor) |
| Parámetros totales | 150M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; no se especifica ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) y árabe (ar), incluido árabe fusha/MSA con y sin diacríticos |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (model.pt, más vocab.txt y config.yaml); compatible con F5-TTS v1.1.7 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura de F5-TTS, descrita por el autor como una arquitectura de difusión y compatible de forma exacta con F5-TTS v1.1.7. Se trata de un esquema de flow matching condicional en el que un backbone transformer (variante DiT) transforma ruido en la representación acústica objetivo, condicionado por el texto y por el audio de referencia empleado para la clonación de voz. El repositorio incluye un `vocab.txt` propio y un `config.yaml` que sobrescribe la configuración base de F5TTS_v1_Base, además de un script `finetune_cli.py` parcheado para reutilizar el pipeline de entrenamiento de F5-TTS.

El autor indica que el modelo fue preentrenado desde cero con decenas de miles de horas de datos de voz de alta calidad, mezclando fuentes públicas y propietarias. No se detalla en la información disponible la composición exacta del dataset, el número total de tokens ni si se aplicaron etapas de RLHF o DPO. La normalización de texto se apoya en NeMo Text Processing y el sistema incorpora diacritización avanzada del árabe. La clonación de voz requiere menos de 8 segundos de audio de referencia; opcionalmente se puede omitir la transcripción de referencia y dejar que el sistema la genere al vuelo.

## Capacidades

- Generación de voz (text-to-speech) de alta fidelidad a partir de texto en inglés y árabe.
- Clonación de voz instantánea con menos de 8 segundos de audio de referencia.
- Soporte completo de diacritización árabe (Tashkeel), lo que permite un control fino de la pronunciación con o sin signos diacríticos.
- Normalización de texto mediante NeMo Text Processing (tratamiento de números, abreviaturas y formatos).
- Inferencia de baja latencia orientada a aplicaciones en tiempo real (RTF en torno a 0,12 sobre RTX 4090).
- Control de velocidad de habla mediante el parámetro `speed` en la API de inferencia.
- Salida tanto en fichero WAV como en forma de onda cruda (waveform) para su uso por API.
- Afinado (fine-tuning) sobre pesos preentrenados usando el pipeline de F5-TTS v1.1.7.
- No dispone de soporte declarado de tool calling, razonamiento multi-paso ni capacidades de visión o audio de entrada más allá del audio de referencia para clonación.

## Casos de uso

- Audiolibros y narración en árabe: el modelo permite convertir texto literario en voz natural en árabe fusha con diacritización explícita, lo que reduce los errores de pronunciación en palabras ambiguas sin vocales.
- Clonación de voz para doblaje: con menos de 8 segundos de muestra se puede replicar la voz de un locutor para generar contenido en varios idiomas (árabe e inglés) manteniendo un timbre consistente.
- Asistentes de voz y agentes conversacionales: el RTF de 0,12 sobre RTX 4090 lo hace apto para respuestas habladas en tiempo cuasi real dentro de pipelines de interacción por voz.
- Accesibilidad y lectura de pantalla: generación de voz para personas con discapacidad visual o lectura asistida de documentos, con salida en WAV reutilizable por otras aplicaciones.
- Aprendizaje de idiomas: práctica de escucha de árabe con distintos grados de diacritización y velocidades de habla ajustables mediante el parámetro `speed`.
- Localización de contenido multimedia: doblaje automatizado de vídeos o podcasts del inglés al árabe reutilizando una voz de referencia para mantener la coherencia entre episodios.
- Generación de voz para prototipos y demostraciones: al ser un modelo de 150M parámetros con licencia Apache 2.0, se puede desplegar en entornos de bajo recurso para pruebas de producto sin costes de licencia.
- Fine-tuning específico de dominio: partiendo de los pesos publicados se puede adaptar el modelo a un locutor, dialecto o estilo concretos usando el pipeline de F5-TTS v1.1.7.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento declarado por el autor es un RTF (Real-Time Factor) en torno a 0,12 sobre una GPU RTX 4090, sin que se detallen las condiciones exactas de medición ni el conjunto de evaluación.

| Métrica | Resultado | Condiciones |
|---|---|---|
| RTF | ~0,12 | RTX 4090, según el autor |
| Benchmarks de calidad de voz (MOS, WER, etc.) | no disponible | no publicados en la información disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 150M parámetros, el peso en FP16 ronda los 300 MB y en FP32 unos 600 MB; a esto hay que sumar el vocoder y los tensores intermedios, de modo que la huella total es de pocos GB.
- GPU recomendadas: el autor cita explícitamente la RTX 4090 para el RTF de 0,12; cualquier GPU NVIDIA moderna con varios GB de VRAM debería ser suficiente.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en tarjetas de consumo (por ejemplo, RTX 3060, 4070, 4090), dado el reducido número de parámetros.
- Opciones de despliegue: la librería oficial `silma-tts` (instalable vía `pip install silma-tts` o desde código fuente), una app Gradio local (`silma-tts-app`) y el ecosistema de F5-TTS v1.1.7 para afinado. No se declara soporte explícito de vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un modelo TTS de este tipo.
- Latencia y throughput: el autor declara RTF aproximado de 0,12 sobre RTX 4090; no se ofrecen cifras de throughput (segundos de audio generados por segundo) ni de latencia en otras GPU.
- Requisitos de software: ffmpeg, Python con entorno virtual y el paquete `silma-tts`; para entrenamiento, F5-TTS v1.1.7.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Notas |
|---|---|---|---|---|---|
| SILMA TTS v1 (esta ficha) | 150M | en, ar | Sí, <8 s de referencia | Apache 2.0 | Compatible con F5-TTS v1.1.7; diacritización árabe |
| F5-TTS (modelo base) | ~336M (dato público aproximado) | en, zh (principalmente) | Sí | MIT (según el proyecto F5-TTS) | Arquitectura de referencia sobre la que se construye SILMA TTS |
| XTTS-v2 (Coqui) | ~467M (dato público aproximado) | multilingüe (17 idiomas, incluye árabe e inglés) | Sí | Coqui Public Model License (no Apache 2.0) | Referencia habitual en TTS multilingüe con clonación |
| Modelos comerciales de SILMA AI | no disponible | árabe y otros | no disponible | Comercial | Ofrecidos en silma.ai, fuera del alcance de esta ficha |

Los valores de parámetros de F5-TTS y XTTS-v2 son cifras de referencia pública y pueden variar según la variante exacta; no provienen de la información proporcionada sobre este repositorio. Los datos de rendimiento comparado no están disponibles, por lo que la comparación se limita a tamaño, idiomas, capacidad de clonación y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo por género, acento o dialecto en la información disponible; el entrenamiento con datos propietarios no auditables dificulta evaluar la representatividad de las voces generadas.
- Riesgo de alucinación: como todo sistema TTS, puede producir pronunciaciones incorrectas, prosodia anómala o artefactos acústicos, especialmente con texto fuera de dominio o en árabe sin diacríticos.
- Limitaciones de idioma: solo se declaran inglés y árabe; no se especifica cobertura de dialectos árabes concretos, por lo que el rendimiento fuera del árabe fusha/MSA no está garantizado.
- Limitaciones de contexto: no se documenta una longitud máxima de texto de entrada ni un límite de contexto, por lo que la generación de textos muy largos puede requerir segmentación manual.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero es responsabilidad del usuario verificar la procedencia del audio de referencia empleado para clonación, ya que la licencia del modelo no cubre los derechos de las voces clonadas.
- Clonación de voz y uso ético: la capacidad de clonación con menos de 8 segundos de audio facilita usos fraudulentos (suplantación, deepfakes de voz); es necesario aplicar controles de consentimiento y trazabilidad.
- Repositorio de terceros: esta ficha corresponde a una reproducción subida por el usuario Salahuddin1234 y no al repositorio oficial de SILMA AI, por lo que conviene contrastar la integridad de los pesos con la fuente original (silma-ai/silma-tts).
- Formato de pesos no estándar en el ecosistema de inferencia: al distribuirse como `model.pt` de PyTorch, no es directamente cargable en runtimes que esperan safetensors o GGUF.
- Sin benchmarks publicados: no hay métricas objetivas de calidad (MOS, WER, SIM) en la información disponible, lo que complica la comparación rigurosa con alternativas.
- Ausencia de cuantizaciones documentadas: no se indican versiones cuantizadas, lo que puede limitar el despliegue en hardware con restricciones de memoria muy estrictas.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/Salahuddin1234/omnidoctor-silma
- Repositorio oficial del modelo (SILMA AI): https://huggingface.co/silma-ai/silma-tts
- Repositorio de código de SILMA TTS en GitHub: https://github.com/SILMA-AI/silma-tts
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/silma-ai/silma-tts-v1-demo
- Página de SILMA AI: https://silma.ai/
- Página de TTS en árabe de SILMA AI: https://silma.ai/arabic-text-to-speech
- Proyecto F5-TTS (arquitectura base): https://github.com/SWivid/F5-TTS
- Release F5-TTS v1.1.7: https://github.com/SWivid/F5-TTS/releases/tag/1.1.7
- Guía de entrenamiento de F5-TTS: https://github.com/SWivid/F5-TTS/tree/main/src/f5_tts/train
