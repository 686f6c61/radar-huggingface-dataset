# hotamago/avm-voice-weights

## Resumen

`hotamago/avm-voice-weights` es un repositorio de pesos auxiliares para **avm-voice**, una aplicación de cambio de voz en tiempo real orientada a canto. No se trata de un modelo de lenguaje ni de un modelo multimodal generativo: es un conjunto de tres artefactos de inferencia (un codificador de contenido, una máscara causal condicionada por hablante y una traza TorchScript de un codificador de hablante) que la propia aplicación descarga en su primera ejecución. El repositorio no contiene voces de usuario, embeddings ni vectores de enrollment, y no re-aloja los pesos base de HuBERT ni de RMVPE, que se obtienen del repositorio público `lj1995/VoiceConversionWebUI`.

El componente principal es `encoder_v4.pt`, un ajuste fino streaming y robusto al ruido del codificador de contenido RVC basado en HuBERT/ContentVec, de 12 capas y precisión fp32, derivado del `hubert_base` de RVC (licencia MIT). Se complementa con `voice_mask_v4.pt`, una máscara causal pequeña condicionada por hablante (embedding ECAPA de 192 dimensiones con modulación FiLM) que mantiene la voz del usuario inscrito en el separador frontal, y con `ecapa_1s.ts`, la traza TorchScript del codificador de hablante ECAPA-TDNN con ventana causal de 1 segundo, trazada desde `speechbrain/spkrec-ecapa-voxceleb` (Apache-2.0).

Su relevancia es acotada pero específica: cubre el caso de conversión de voz cantada en tiempo real con supresión del hablante original, un escenario donde la latencia y la robustez al ruido de fondo son críticas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamaño de 0,4 GB y licencia `other`, sin pipeline declarado ni idiomas especificados. La fecha de creación registrada es 2026-09-25.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion): codificador de contenido HuBERT/ContentVec (12 capas), máscara causal condicionada por hablante con FiLM sobre embedding ECAPA, y codificador de hablante ECAPA-TDNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el codificador de hablante ECAPA usa ventana causal de 1 s |
| Tipos de cuantizacion | no disponible; los pesos publicados están en fp32 (`encoder_v4.pt`) y en TorchScript (`ecapa_1s.ts`) |
| Idiomas soportados | no disponible |
| Licencia | other (el encoder deriva de RVC `hubert_base`, MIT; la traza ECAPA deriva de speechbrain, Apache-2.0) |
| Formato de pesos | PyTorch (`.pt`) y TorchScript (`.ts`) |

## Arquitectura y entrenamiento

El repositorio agrupa tres piezas. En primer lugar, `encoder_v4.pt` es un ajuste fino del codificador de contenido RVC (HuBERT/ContentVec, 12 capas, fp32) con dos modificaciones declaradas: funcionamiento streaming y robustez al ruido. Sustituye a los pesos del encoder base en tiempo de carga. En segundo lugar, `voice_mask_v4.pt` es una máscara causal pequeña condicionada por hablante que emplea un embedding ECAPA de 192 dimensiones con modulación FiLM y que sirve para conservar la voz del usuario inscrito en el separador frontal. El vector de enrollment de la persona que entrenó originalmente la máscara fue eliminado del repositorio; la aplicación condiciona la máscara con el enrollment local de cada usuario. En tercer lugar, `ecapa_1s.ts` es la traza TorchScript del codificador de hablante ECAPA-TDNN con ventana causal de 1 segundo, usada para la puerta de voz de usuario y el enrollment.

El autor no publica en la model card el número de tokens o horas de audio empleados en el ajuste fino, la composición del dataset, ni si hubo etapas de RLHF o DPO (técnicas, por otra parte, propias de modelos de lenguaje y no de este tipo de sistema). Tampoco se detalla el procedimiento de entrenamiento de la máscara más allá de su naturaleza condicionada por hablante. Los pesos base de HuBERT (`hubert_base/*`) y el extractor de tono RMVPE (`rmvpe.pt`) no se re-alojan: la aplicación los descarga desde `lj1995/VoiceConversionWebUI`. La innovación técnica declarada es, por tanto, doble: inferencia streaming con ventana causal corta y un front-end robusto al ruido, orientado a reducir la latencia en conversión de voz cantada en tiempo real.

## Capacidades

- Conversión de voz en tiempo real para canto, con latencia objetivo compatible con uso en directo (la ventana causal del codificador de hablante es de 1 segundo).
- Extracción de contenido lingüístico/fonético independiente del hablante mediante el codificador HuBERT/ContentVec ajustado.
- Codificación de identidad de hablante mediante ECAPA-TDNN a 192 dimensiones, usada para el enrollment y la puerta de voz de usuario.
- Separación condicionada por hablante: la máscara FiLM trata de preservar la voz del usuario inscrito en el separador frontal.
- Robustez al ruido de fondo declarada por el autor en el front-end.
- Funcionamiento streaming, sin necesidad de procesar la señal completa por adelantado.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling, agentes ni multilingüismo; no son aplicables a este tipo de modelo.
- No se declara un «modo thinking» ni capacidades de audio comprensivo (ASR, transcripción o descripción), solo conversión de voz.

## Casos de uso

- Canto en directo con cambio de timbre: la aplicación captura la voz del intérprete, extrae contenido con el encoder streaming y aplica el decoder RVC para reemplazar el timbre por el de la voz objetivo, manteniendo la afinación y la letra original. La ventana causal de 1 segundo del codificador de hablante es lo que hace viable esta latencia.
- Streaming y directos en plataformas de vídeo: el modelo permite aplicar una identidad vocal consistente durante emisiones largas, con el gate de voz de usuario evitando que la conversión se dispare sobre voces ajenas que entren por el micrófono.
- Producción musical en home studio: uso como capa de voz alternativa sobre una toma ya grabada, aprovechando que el formato de pesos `.pt` es cargable desde PyTorch sin conversión adicional.
- Actuaciones con monitorización en auriculares: el carácter streaming del encoder permite monitorizar la voz convertida con una latencia lo bastante baja como para cantar sobre ella, siempre que el resto del pipeline (RMVPE, decoder) mantenga ese mismo régimen.
- Karaoke y aplicaciones de entretenimiento: conversión de la voz del usuario a una voz objetivo previamente inscrita, con enrollment local para no depender de vectores de terceros distribuidos en el repositorio.
- Investigación en conversión de voz robusta al ruido: el encoder fine-tuneado y la máscara causal son piezas reutilizables para experimentar con separación condicionada por hablante en entornos con ruido de fondo.
- Integración en herramientas propias: al ser artefactos TorchScript y PyTorch, pueden cargarse en pipelines Python personalizados sin depender de la aplicación avm-voice, siempre que se aporten por separado HuBERT base y RMVPE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (MOS, similitud de hablante, tasa de error fonético, latencia medida) ni comparaciones cuantitativas con otros sistemas de conversión de voz. La búsqueda web asociada no devolvió resultados relevantes: los enlaces recuperados corresponden a páginas de The New York Times y no guardan relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada del tamaño del repo (0,4 GB de pesos en fp32) y de la necesidad de cargar además HuBERT base y RMVPE desde `lj1995/VoiceConversionWebUI`, el conjunto completo en disco ronda 1 GB y la huella en VRAM se sitúa típicamente en el rango de 2 a 4 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada. Para un sistema de conversión de voz en tiempo real, lo determinante es la latencia por bloque más que el tamaño del modelo.
- Compatibilidad con GPU de consumo: no confirmada por el autor. Por tamaño de pesos, el conjunto es manejable en GPU de consumo, pero la viabilidad en tiempo real depende de la optimización del pipeline completo (encoder streaming, RMVPE y decoder).
- Opciones de despliegue: no se documentan en la model card. Los formatos publicados son PyTorch `.pt` y TorchScript `.ts`, por lo que el despliegue natural es mediante Python/PyTorch o LibTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. El único dato relacionado es la ventana causal de 1 segundo del codificador de hablante ECAPA, que acota el contexto mínimo necesario para la estimación de identidad.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hotamago/avm-voice-weights | Pesos auxiliares RVC (encoder de contenido, máscara de hablante, encoder ECAPA) | no disponible | Ventana causal de 1 s en ECAPA | other | HuggingFace, 0 descargas |
| lj1995/VoiceConversionWebUI (RVC base) | Pesos base de RVC: HuBERT, RMVPE y modelos preentrenados | no disponible | no disponible | no disponible en la información aportada | HuggingFace, repositorio público |
| speechbrain/spkrec-ecapa-voxceleb | Codificador de hablante ECAPA-TDNN | no disponible | no disponible | Apache-2.0 | HuggingFace, repositorio público |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento entre ellas.

## Limitaciones y advertencias

- Licencia `other`: no se detallan en la model card los términos exactos de uso comercial. Es imprescindible revisar las condiciones completas antes de cualquier despliegue productivo, ya que la licencia del repositorio no equivale a la de los componentes derivados.
- Licencias heredadas: el encoder deriva del `hubert_base` de RVC (MIT) y la traza ECAPA de `speechbrain/spkrec-ecapa-voxceleb` (Apache-2.0). Cada componente arrastra sus propias obligaciones de atribución.
- HuBERT base y RMVPE no están incluidos: la aplicación los descarga de un repositorio de terceros, lo que introduce una dependencia externa y un riesgo de disponibilidad o de cambio de condiciones.
- El vector de enrollment del entrenador original fue eliminado, pero la máscara sigue siendo un artefacto entrenado por el proyecto; su comportamiento con hablantes fuera de distribución no está documentado.
- Riesgo de uso indebido: la conversión de voz puede emplearse para suplantación de identidad o creación de audios falsos. No se documentan mecanismos de marca de agua, detección o consentimiento.
- Idiomas soportados: no disponibles. No se especifica si el modelo se ha validado en idiomas distintos del usado durante el ajuste fino.
- Sesgos: no se documenta ningún análisis de sesgo por género, acento, edad o variedad dialectal en la voz convertida.
- Riesgo de artefactos: no se publican métricas objetivas de calidad, similitud de hablante ni robustez en condiciones adversas, por lo que la calidad real en producción es indeterminada.
- Sin datos de latencia medidos: aunque el diseño es streaming, no hay cifras publicadas de latencia extremo a extremo, que es el factor crítico en un uso en directo.
- Madurez: 0 descargas y 0 likes, sin pipeline declarado y con una única actualización registrada minutos después de la creación. No hay evidencia de uso en producción.

## Enlaces

- HuggingFace: https://huggingface.co/hotamago/avm-voice-weights
- Repositorio de dependencias RVC (HuBERT y RMVPE): https://huggingface.co/lj1995/VoiceConversionWebUI
- Codificador de hablante ECAPA-TDNN de origen: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios del proyecto o demos) en la búsqueda web realizada; los resultados devueltos no guardaban relación con el modelo.
