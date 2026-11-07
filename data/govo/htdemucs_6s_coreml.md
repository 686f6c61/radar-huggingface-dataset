# GOVO/HTDemucs_6S_CoreML

## Resumen

HTDemucs_6S_CoreML es una conversión al formato Core ML del modelo HTDemucs_6S, la variante de seis fuentes del separador musical HTDemucs (Hybrid Transformer Demucs) desarrollado originalmente por Meta AI y presentado en el paper "Hybrid Transformers for Music Source Separation" (Rouard et al., ICASSP 2023). El repositorio lo publica el usuario GOVO y su propósito es permitir la inferencia del modelo en el ecosistema de Apple (Core ML), además de ofrecer una exportación ONNX para plataformas no Apple. El tamaño del repositorio es de 0,7 GB y acumula 147 descargas.

El modelo resuelve la separación de fuentes musicales: a partir de una mezcla de audio estéreo genera pistas independientes de batería, bajo, voz, otros y piano, además de la guitarra en esta variante de seis fuentes. Frente a las versiones clásicas de Demucs, que operaban únicamente en el dominio temporal, HTDemucs combina un codificador sobre la forma de onda con otro sobre la STFT, lo que mejora la calidad de separación.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue (pesos convertidos a Core ML y ONNX), no de un modelo entrenado desde cero por el autor del repositorio. No se dispone de información publicada sobre licencia, idiomas ni pipeline en la model card, lo que condiciona su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (HTDemucs), codificadores paralelos en dominio temporal y STFT con transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; ventana de procesamiento por segmento no disponible) |
| Tipos de cuantización | no disponible (el repo incluye pesos Core ML y ONNX; no se detallan precisiones) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | no disponible |
| Formato de pesos | Core ML y ONNX |
| Tarea | Separación de fuentes musicales en 6 pistas (batería, bajo, voz, otros, piano, guitarra) |
| Tamaño del repositorio | 0,7 GB |
| Autor del repositorio | GOVO |
| Descargas | 147 |

## Arquitectura y entrenamiento

HTDemucs es la cuarta generación de la familia Demucs de Meta AI. A diferencia de las generaciones anteriores, que procesaban el audio exclusivamente en el dominio temporal, HTDemucs ejecuta dos codificadores en paralelo: uno sobre la forma de onda bruta y otro sobre la representación STFT. Las salidas de ambos se combinan y se procesan mediante capas de atención tipo transformer, lo que permite capturar dependencias de largo alcance en la mezcla musical. La variante 6S amplía la salida de las cuatro fuentes clásicas (batería, bajo, voz, otros) a seis, añadiendo piano y guitarra.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de separación de audio). Tampoco se detalla en la model card el proceso de conversión a Core ML y ONNX ni las precisiones numéricas empleadas. El repositorio es una exportación de pesos, no un reentrenamiento.

## Capacidades

- Separación de audio musical en seis pistas: batería, bajo, voz, otros, piano y guitarra.
- Procesamiento de mezclas estéreo (formato habitual de HTDemucs).
- Inferencia nativa en el ecosistema Apple mediante Core ML (uso potencial de Neural Engine y GPU de Apple Silicon).
- Inferencia multiplataforma mediante la exportación ONNX incluida en el repositorio.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de audio especializado.
- No dispone de capacidades multilingües ni de generación de texto.
- No se documentan capacidades adicionales (voz, audio en tiempo real, etc.) en la información disponible.

## Casos de uso

- Producción musical y remezclas: extraer las pistas de batería, bajo, voz, piano y guitarra de una mezcla para reutilizarlas en una nueva producción o para crear versiones instrumentales y a capela.
- Karaoke automático: generar versiones sin voz a partir de canciones originales usando la pista vocal separada como referencia para su eliminación.
- Aplicaciones de edición de audio en macOS/iOS: integrar el modelo Core ML en una app nativa de Apple para separar fuentes en local, sin enviar el audio a servidores externos, aprovechando la inferencia en el dispositivo.
- Análisis musicológico y educativos: aislar instrumentos concretos (por ejemplo, la guitarra o el piano) para estudiar arreglos, transcripciones o técnicas de interpretación.
- Datasets de entrenamiento para otros modelos de audio: generar pares (mezcla, fuente) etiquetados para entrenar modelos de transcripción, detección de instrumentos o separación de voz.
- Postproducción de vídeo y podcast: limpiar pistas de voz o aislar música de fondo en grabaciones donde la mezcla no está disponible por separado.
- Investigación en separación de fuentes: usar la exportación ONNX como referencia reproducible para comparar el rendimiento de HTDemucs_6S en distintas plataformas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación consultada menciona que las variantes htdemucs, htdemucs_ft y htdemucs_6s tienen valores de SDR publicados y velocidades medidas, pero no se incluyen las cifras concretas en el material proporcionado, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precisión; el repositorio ocupa 0,7 GB, lo que da una cota inferior del espacio en disco necesario para los pesos.
- GPU recomendadas: no disponible. Al ser una exportación Core ML, el objetivo principal es la inferencia en chips Apple Silicon (M1/M2/M3/M4) mediante Neural Engine y GPU integrada.
- GPU de consumo: la variante ONNX podría ejecutarse en GPU de consumo (por ejemplo, RTX 4090) mediante ONNX Runtime, pero no se documentan requisitos ni rendimiento.
- Opciones de despliegue: Core ML (macOS/iOS), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Fuentes de salida | Arquitectura | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HTDemucs_6S_CoreML (este repo) | 6 (batería, bajo, voz, otros, piano, guitarra) | HTDemucs | Core ML, ONNX | no disponible | Hugging Face (GOVO) |
| htdemucs (Demucs v4) | 4 (batería, bajo, voz, otros) | HTDemucs | PyTorch | MIT (según el proyecto Demucs original) | Repositorio oficial de Meta / Demucs |
| htdemucs_ft | 4 (batería, bajo, voz, otros) | HTDemucs fine-tuned | PyTorch | MIT (según el proyecto Demucs original) | Repositorio oficial de Meta / Demucs |
| Demucs v3 | 4 | Demucs (dominio temporal) | PyTorch | MIT (según el proyecto Demucs original) | Repositorio oficial de Meta |

La licencia de las variantes oficiales se indica como MIT según el proyecto Demucs original; la licencia de esta conversión concreta no está declarada en la model card.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; es un riesgo relevante para producción.
- Al ser una conversión de pesos de terceros, no hay garantía de que la conversión Core ML/ONNX preserve exactamente la calidad de separación del modelo original.
- No se documentan sesgos específicos; como modelo de audio musical, puede rendir peor en géneros poco representados en el dataset de entrenamiento original (no disponible).
- Riesgo de artefactos y sangrado entre pistas (bleed) en mezclas densas o con instrumentos solapados, inherente a la separación de fuentes.
- No se especifican los requisitos de formato de entrada (frecuencia de muestreo, duración de segmento, canales) en la información disponible; habrá que consultar el código de inferencia del repositorio.
- El número de descargas (147) y la ausencia de likes sugieren una adopción limitada; conviene validar el artefacto antes de integrarlo.
- No apto para tareas de lenguaje, razonamiento, código o agentes: es exclusivamente un modelo de separación de audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GOVO/HTDemucs_6S_CoreML
- README de referencia de Demucs v4 (iBoostAI): https://huggingface.co/iBoostAI/Demucs-v4/blob/main/README.md
- Comparativa de modelos Demucs: https://demucs.net/demucs-models
- Paper de HTDemucs: Hybrid Transformers for Music Source Separation (Rouard et al., ICASSP 2023) — referencia citada en la documentación consultada; URL exacta no disponible en la información proporcionada.
