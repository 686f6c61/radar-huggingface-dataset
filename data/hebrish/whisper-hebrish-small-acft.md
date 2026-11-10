# Hebrish/Whisper-Hebrish-Small-ACFT

## Resumen

Whisper-Hebrish-Small-ACFT es un ajuste fino (fine-tuning) del modelo openai/whisper-small.en orientado al reconocimiento automático del habla (ASR) en escenarios de code-switching hebreo-inglés. Lo desarrolla el usuario Hebrish y se distribuye bajo licencia MIT con acceso restringido (gated) en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer propia de la familia Whisper, con 241.734.144 parámetros totales, y conserva el tokenizador y la configuración base de whisper-small.en.

La relevancia del modelo reside en su especialización: el code-switching (alternancia de idiomas dentro de una misma conversación o frase) es un fenómeno habitual en comunidades bilingües y los modelos ASR monolingües suelen degradarse en esos contextos. El tag "acft" y la referencia "futo" en los metadatos sugieren un entrenamiento orientado a la adaptación a dominio y a la compatibilidad con el ecosistema whisper.cpp/ggml, lo que facilita su despliegue en entornos con recursos limitados.

El modelo se publica con pesos en safetensors y con soporte declarado para whisper.cpp mediante conversión a GGML. No obstante, la información pública disponible es escasa: no se detallan el conjunto de datos de entrenamiento, los hiperparámetros ni los resultados de evaluación, y la ficha de Hugging Face no aporta métricas de WER (word error rate) ni comparativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.144 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa audio en ventanas de 30 segundos) |
| Tipos de cuantizacion | no disponible (soporte GGML/whisper.cpp declarado en tags) |
| Idiomas soportados | en (ingles); el modelo esta orientado a code-switching hebreo-ingles segun su descripcion, aunque el campo de idiomas solo declara "en" |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); conversion a GGML para whisper.cpp |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper small: un encoder transformer que procesa espectrogramas mel de audio y un decoder autorregresivo que genera tokens de texto. Whisper small cuenta con 12 capas en encoder y 12 en decoder, dimensión oculta de 768 y 12 cabezas de atención, lo que suma los 241,7 millones de parámetros reportados. El modelo base es openai/whisper-small.en, entrenado originalmente por OpenAI sobre un corpus multilingüe débilmente supervisado y posteriormente ajustado al inglés.

El ajuste fino específico de Hebrish se etiqueta como "ACFT" y "futo", términos que no se explican en la información disponible; probablemente hagan referencia a una técnica de adaptación (posiblemente adaptación de dominio o fine-tuning con datos de code-switching) y a una integración con el ecosistema FUTO/whisper.cpp. No se especifican el número de tokens de audio, la composición del dataset de entrenamiento, si hubo RLHF, DPO ni ninguna innovación técnica adicional. Tampoco se documenta si se aplicó destilación, decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización declarada en contextos de code-switching hebreo-inglés.
- Transcripción de audio a texto mediante el pipeline `automatic-speech-recognition` de transformers.
- Compatibilidad con whisper.cpp y formato GGML para inferencia en CPU y entornos embebidos.
- Soporte de despliegue mediante endpoints compatibles (tag `endpoints_compatible`).
- No se documentan capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni detección de idioma.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplicables a un modelo ASR).

## Casos de uso

- Transcripción de reuniones bilingües hebreo-inglés: el modelo puede procesar audio de conversaciones donde los hablantes alternan entre hebreo e inglés, un escenario donde los modelos ASR monolingües suelen fallar. Adecuado por su ajuste específico a code-switching, aunque no se han publicado métricas que cuantifiquen la mejora.
- Subtitulado automático de contenido audiovisual: integración en pipelines de generación de subtítulos para vídeos con mezcla de idiomas, usando la API de transformers o whisper.cpp para procesamiento por lotes.
- Transcripción en entornos con recursos limitados: gracias a la conversión GGML y al tamaño de 241,7 millones de parámetros, puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace viable para dispositivos sin acelerador dedicado.
- Procesamiento de notas de voz en aplicaciones móviles: el tamaño reducido del modelo permite empaquetarlo en aplicaciones que transcriben audio localmente sin enviar datos a la nube, con la ventaja de privacidad que ello conlleva.
- Investigación en ASR code-switching: sirve como punto de partida para experimentos de fine-tuning sobre otros pares de idiomas, dado que parte de whisper-small.en y su licencia MIT facilita la experimentación.
- Archivado y búsqueda de grabaciones: transcripción de archivos de audio históricos para indexación y búsqueda textual, usando el pipeline de transformers con procesamiento por fragmentos de 30 segundos.
- Evaluación comparativa de modelos Whisper ajustados: útil como baseline en estudios que comparen técnicas de adaptación al code-switching frente a otros fine-tunes de la familia Whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de valores de WER, CER ni comparativas con otros modelos en la ficha de Hugging Face ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 1 GB para los 241,7 millones de parámetros, más overhead de activaciones y espectrogramas.
- VRAM estimada en fp16: alrededor de 0,5 GB para los pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4090, A100 o H100 son más que suficientes y permiten procesamiento por lotes de alta concurrencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1060 en adelante) e incluso en CPU mediante whisper.cpp con cuantización GGML.
- Opciones de despliegue: transformers (PyTorch), whisper.cpp (GGML), endpoints compatibles de Hugging Face; no se documenta soporte explícito para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper-Hebrish-Small-ACFT | 241,7 M | ventanas de 30 s | en (code-switching hebreo-inglés declarado) | MIT | gated en HF |
| openai/whisper-small | 241,7 M | ventanas de 30 s | multilingüe (99 idiomas) | MIT | público en HF |
| openai/whisper-small.en | 241,7 M | ventanas de 30 s | en | MIT | público en HF |
| openai/whisper-base | 74 M | ventanas de 30 s | multilingüe | MIT | público en HF |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros modelos ASR especializados en code-switching hebreo-inglés. El modelo de Hebrish comparte arquitectura y tamaño con whisper-small, pero añade un ajuste específico cuyo impacto cuantitativo no está documentado.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo, lo que puede complicar pipelines automatizados.
- Idiomas declarados: el campo de idiomas solo indica "en", pese a que la descripción menciona code-switching hebreo-inglés; no está claro el alcance real del hebreo en la salida.
- Ausencia de métricas: no se han publicado evaluaciones de WER ni comparativas, por lo que no es posible verificar la mejora frente al modelo base.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto plausible en segmentos de audio con ruido, silencio o habla no inteligible.
- Sesgos: no documentados; los modelos Whisper heredan sesgos de sus datos de entrenamiento originales, especialmente en acentos y variedades dialectales.
- Limitación de contexto: Whisper procesa audio en ventanas de 30 segundos; audios más largos requieren fragmentación y pueden perder coherencia entre segmentos.
- Licencia MIT: permite uso comercial, pero al ser un fine-tune de un modelo de OpenAI, conviene revisar las condiciones de la licencia original y las de los datos de entrenamiento del ajuste, no documentadas.
- Documentación insuficiente: no se especifican datos de entrenamiento, hiperparámetros ni procedimiento de evaluación, lo que dificulta la reproducibilidad.
- Madurez: con 35 descargas y 0 likes en el momento de la consulta, el modelo tiene una adopción muy limitada y no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Whisper-Hebrish-Small-ACFT
- Modelo base: https://huggingface.co/openai/whisper-small.en
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- DOI del modelo: https://doi.org/10.57967/hf/11106
