# dianavdavidson/indicwav2vec-hindi-iv_hindi_vaani-62143-hinglish_mixed_scripts-2e-5-epochs-100-FT

## Resumen

Este modelo es un fine-tuning de `ai4bharat/indicwav2vec-hindi`, un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura wav2vec2, preentrenado por el laboratorio AI4Bharat del IIT Madras sobre 40 lenguas indias. El ajuste se ha realizado sobre un conjunto de datos no especificado, aunque el nombre del repositorio sugiere que se trata de audio en hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y latina). El modelo resultante tiene 315,5 millones de parámetros y está orientado a la transcripción de habla en ese registro lingüístico.

La relevancia de este modelo radica en que aborda un caso de uso muy común en la India: la conversación coloquial que alterna hindi e inglés dentro de una misma frase, a menudo transcrita con ambos alfabetos. Al partir de un modelo base multilingüe y ajustarlo específicamente para hinglish, se busca mejorar la precisión frente a modelos genéricos. Sin embargo, la falta de documentación sobre el dataset de entrenamiento y la ausencia de benchmarks públicos limitan su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer encoder con cuantizacion de caracteristicas) |
| Parametros totales | 315.554.545 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de wav2vec2, tipicamente hasta 30 segundos de audio) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantizaciones GGUF u otras) |
| Idiomas soportados | hindi e ingles (hinglish), segun el nombre del modelo; no hay lista oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ai4bharat/indicwav2vec-hindi` es una variante de wav2vec2, una arquitectura de transformer encoder que aprende representaciones de audio mediante un objetivo de contraste y cuantizacion de características. El preentrenamiento se realizó sobre 40 lenguas indias, lo que le confiere una base sólida para el reconocimiento de fonética del subcontinente. El fine-tuning aquí descrito se llevó a cabo con el Trainer de HuggingFace, usando una tasa de aprendizaje de 2e-5, batch de entrenamiento de 16 (con acumulación de gradientes de 2, dando un batch efectivo de 32), optimizador AdamW, scheduler constante con warmup de 500 pasos y 100 épocas. Se empleó precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card, aunque el nombre del repositorio indica que proviene de la colección "iv_hindi_vaani" y contiene "hinglish_mixed_scripts". No se menciona el uso de RLHF ni DPO; es un ajuste supervisado estándar para ASR.

## Capacidades

- Transcripción de audio en hinglish (mezcla de hindi e inglés) con escritura mixta (devanagari y latina).
- Reconocimiento de habla continua en hindi e inglés, aprovechando el preentrenamiento multilingüe del modelo base.
- Salida de texto en formato de subtítulos o transcripción plana, dependiendo del decodificador utilizado.
- No soporta tool calling, generación de código, razonamiento ni otras capacidades de modelos de lenguaje generales; es un modelo puramente de ASR.
- No se han documentado capacidades de diarización de hablantes ni de identificación de idioma.

## Casos de uso

- Transcripción de reuniones y videollamadas en entornos donde se habla hinglish: el modelo puede procesar audio de conferencias y generar actas textuales, útil para empresas con equipos en India.
- Subtitulado automático de vídeos en plataformas de streaming o YouTube: al manejar la mezcla de idiomas, produce subtítulos más fieles que un modelo monolingüe.
- Asistentes de voz para aplicaciones móviles en India: integrado en un pipeline de ASR, permite comandos de voz en hinglish, mejorando la accesibilidad para usuarios que alternan idiomas.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones para extraer métricas de calidad o detectar problemas recurrentes, con soporte para el registro coloquial.
- Creación de corpus de entrenamiento para otros modelos: las transcripciones generadas pueden servir para entrenar modelos de NLP en hinglish, dado que el audio es la fuente primaria.
- Herramientas de accesibilidad para personas con discapacidad auditiva: conversión de audio en hinglish a texto en tiempo real, con la ventaja de manejar ambos alfabetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida y el WER global durante el entrenamiento, que al final de la época 51 (última registrada) alcanzó un valor de validación de 22,80% de WER. No hay comparaciones con otros modelos ni métricas sobre conjuntos de test públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 315M parámetros, en fp32 se necesitan ~1,26 GB de memoria; en fp16 ~0,63 GB. Con cuantización a 8 bits (si se aplicara) bajaría a ~0,32 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en fp32. Una RTX 3060 o superior es suficiente para inferencia en lote. Para entrenamiento o fine-tuning adicional, se recomienda una GPU con 8-12 GB (RTX 3080, A10, etc.).
- Es compatible con GPUs consumer (RTX serie 20, 30, 40) y también con CPUs mediante la librería transformers, aunque con mayor latencia.
- Opciones de despliegue: se puede servir con HuggingFace Inference Endpoints, o mediante frameworks como vLLM (aunque vLLM está orientado a LLM, para wav2vec2 se usa el pipeline de transformers), o con ONNX Runtime para optimización. También es posible usar la API de HuggingFace para inferencia en la nube.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna, la transcripción de un audio de 10 segundos debería completarse en menos de 1 segundo, pero depende de la longitud y de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune hinglish) | 315M | no disponible | hindi/inglés (hinglish) | Apache 2.0 | HuggingFace |
| ai4bharat/indicwav2vec-hindi (base) | 315M | no disponible | 40 lenguas indias | Apache 2.0 | HuggingFace |
| Whisper small (openai) | 244M | 30 segundos | 96 idiomas | MIT | HuggingFace, OpenAI |
| Whisper medium (openai) | 769M | 30 segundos | 96 idiomas | MIT | HuggingFace, OpenAI |

El modelo base IndicWav2Vec-hindi es la referencia directa; este fine-tuning busca mejorar el rendimiento en hinglish, pero no hay datos comparativos. Whisper, de OpenAI, es una alternativa multilingüe con buen soporte para hindi e inglés, aunque no está específicamente optimizado para la mezcla de escrituras. La comparación real requeriría evaluar ambos en un conjunto de test de hinglish, lo cual no está disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide conocer su tamaño, composición y posibles sesgos. El nombre sugiere que proviene de "iv_hindi_vaani", pero no hay confirmación.
- El WER de validación (22,8%) es relativamente alto, lo que indica que el modelo comete errores notables en la transcripción, especialmente en habla espontánea o con ruido.
- No se han publicado resultados en benchmarks estándar (MUCS, MSR, OpenSLR), por lo que su rendimiento frente a otros modelos es desconocido.
- Al ser un modelo de ASR, no tiene capacidades de comprensión del lenguaje; solo transcribe. No debe usarse para tareas de NLP.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales; se recomienda revisar la licencia de ai4bharat/indicwav2vec-hindi.
- No se especifican limitaciones de contexto de audio; wav2vec2 típicamente maneja segmentos de hasta 30 segundos, pero no se ha confirmado para este modelo.
- El modelo puede tener sesgos hacia acentos o dialectos específicos del hinglish, dado el origen del dataset (probablemente de la India).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/indicwav2vec-hindi-iv_hindi_vaani-62143-hinglish_mixed_scripts-2e-5-epochs-100-FT
- Repositorio de AI4Bharat IndicWav2Vec: https://github.com/AI4Bharat/IndicWav2Vec
- Página del modelo en AI4Bharat: https://ai4bharat.iitm.ac.in/areas/model/ASR/IndicWav2Vec/
- Modelo base: https://huggingface.co/ai4bharat/indicwav2vec-hindi
