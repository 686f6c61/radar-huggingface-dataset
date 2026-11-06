# Haruto7261/QwenA-CPT-70-SFT

## Resumen

QwenA-CPT-70-SFT es un modelo de lenguaje publicado por el usuario Haruto7261 en Hugging Face, derivado de la familia Qwen (la arquitectura declarada en los tags es `qwen3_5`). A pesar del sufijo "70" en el nombre, los pesos reales en safetensors suman 9.653.104.368 parámetros, es decir, aproximadamente 9,65 mil millones, por lo que se trata de un modelo de escala ~10B y no de 70B. El repositorio ocupa 19,3 GB, lo que es coherente con pesos en precisión de 16 bits para ese número de parámetros.

El modelo parece haber sido sometido a un proceso de preentrenamiento continuado (CPT, continued pre-training) y posterior ajuste supervisado (SFT) sobre un corpus en japonés con un fuerte componente de diálogo coloquial y dialectología, en particular del dialecto de Kagoshima (薩隅方言). La model card documenta exclusivamente las fuentes del corpus (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat, recopilaciones de dialectos, actas parlamentarias, Aozora Bunko y Wikipedia en japonés), sin aportar detalles sobre hiperparámetros, número de tokens, metodología de alineación ni evaluación.

La relevancia de este modelo es acotada: se trata de un artefacto de investigación sin descargas ni valoraciones, sin licencia declarada y sin benchmarks publicados. Su interés principal radica en el enfoque sobre variantes dialectales del japonés, un área poco cubierta por los modelos generalistas, pero su uso en producción no está respaldado por ninguna garantía técnica ni legal documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen, tag `qwen3_5`) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible oficialmente; el corpus de entrenamiento es íntegramente en japonés |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen, según el tag `qwen3_5` del repositorio. No se especifican en la model card el número de capas, la dimensión oculta, el número de cabezas de atención, la longitud de contexto nativa ni si se emplean técnicas como GQA, RoPE o atención lineal. Tampoco se documenta si el modelo parte de un checkpoint oficial de Qwen o de un entrenamiento desde cero.

El entrenamiento consta, según la información disponible, de dos fases: un preentrenamiento continuado (CPT) y un ajuste supervisado (SFT). El corpus de CPT combina datos de diálogo japonés (Japanese-Daily-Dialogue, MACHAcorpus, RealPersonaChat), fuentes lexicográficas y divulgativas sobre dialectos —con especial énfasis en el dialecto de Kagoshima (薩隅方言)—, el corpus de actas del Parlamento japonés (国会会議録), la colección limpia de Aozora Bunko y la Wikipedia en japonés. No se indica el número total de tokens procesados, la composición proporcional del dataset, la existencia de RLHF/DPO, ni los hiperparámetros de entrenamiento (learning rate, batch size, épocas). Tampoco se documenta ninguna innovación técnica en decodificación o atención.

## Capacidades

- Generación de texto en japonés, con especial cobertura de registro coloquial y dialectal (particularmente el dialecto de Kagoshima).
- Conversación multi-turno orientada a diálogo cotidiano, derivada del uso de corpus como Japanese-Daily-Dialogue y RealPersonaChat.
- Modelado de registros formales en japonés (actas parlamentarias, textos literarios de Aozora Bunko, artículos enciclopédicos de Wikipedia).
- Capacidad de razonamiento, código y matemáticas: no documentada ni evaluada en la información disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multimodales (visión, audio): no documentadas; el repositorio solo contiene pesos de lenguaje.
- Modo "thinking" o razonamiento extendido: no documentado.

## Casos de uso

- Investigación en procesamiento de dialectos japoneses: el modelo puede emplearse como base para estudiar la representación interna de variantes dialectales del japonés (en particular el dialecto de Kagoshima) y para experimentos de adaptación dialectal frente a modelos generalistas.
- Generación de diálogo coloquial en japonés: adecuado para prototipos de chatbots conversacionales en registro informal, dado el peso de corpus de diálogo cotidiano en su entrenamiento.
- Análisis de actas parlamentarias: permite tareas de resumen, extracción de entidades o clasificación temática sobre el dominio del 国会会議録, presente en el corpus de CPT.
- Procesamiento de texto literario japonés de dominio público: útil para experimentos de análisis estilístico o generación sobre el registro de Aozora Bunko.
- Evaluación comparativa de CPT sobre modelos Qwen: sirve como caso de estudio de cómo un preentrenamiento continuado con un corpus pequeño y especializado afecta al comportamiento del modelo base.
- Normalización dialectal: posible uso experimental para convertir texto en dialecto de Kagoshima a japonés estándar (o viceversa), aunque sin evaluación publicada que respalde la calidad de la conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 24 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para FP16 sin compromisos; RTX 4090 (24 GB) es el límite práctico para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB únicamente mediante cuantización a 4-8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se genere o convierta el checkpoint a GGUF (el repositorio solo publica safetensors).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| QwenA-CPT-70-SFT | ~9,65B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-7B | 7,6B | 32K (128K en variantes) | Apache 2.0 (modelo base) | Amplia, con benchmarks publicados |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Amplia, con benchmarks publicados |
| Gemma 2 9B | 9B | 8K | Gemma Terms of Use | Amplia, con benchmarks publicados |

La comparación es estructural: los tres modelos de referencia cuentan con licencia explícita, evaluación publicada y soporte de la comunidad, mientras que QwenA-CPT-70-SFT carece de los tres elementos. No se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican condiciones de uso comercial, redistribución ni modificación; en la práctica esto impide su adopción en producción con garantías legales.
- El nombre del modelo induce a error: el sufijo "70" no corresponde al tamaño real (~9,65B), lo que puede provocar expectativas incorrectas sobre su capacidad.
- Sesgos conocidos: no documentados, pero el corpus incluye fuentes divulgativas y de terceros (blogs, webs comerciales de dialectos) sin control de calidad explícito, lo que puede introducir sesgos y errores factuales.
- Riesgo de alucinación: no evaluado; al tratarse de un SFT sobre un corpus reducido y especializado, es esperable un comportamiento frágil fuera del dominio japonés.
- Limitaciones de idioma: el entrenamiento documentado es exclusivamente en japonés; el rendimiento en castellano, inglés u otros idiomas no está respaldado por ninguna evidencia.
- Limitación de contexto: no se publica la longitud de contexto soportada, por lo que no puede garantizarse el manejo de entradas largas.
- Sin benchmarks ni evaluaciones: no hay ninguna métrica objetiva (MMLU, HumanEval, JGLUE, etc.) que permita validar su calidad.
- Cero descargas y cero valoraciones: no existe validación por parte de la comunidad.
- Corpus con posible conflicto de derechos: varias fuentes del listado son sitios web de terceros sin licencia explícita de reutilización, lo que añade incertidumbre sobre la legalidad de los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haruto7261/QwenA-CPT-70-SFT
- Japanese-Daily-Dialogue: https://huggingface.co/datasets/kan-bayashi/Japanese-Daily-Dialogue
- MACHAcorpus: https://github.com/tatsuya-koyama/MACHAcorpus
- RealPersonaChat: https://github.com/nu-dialogue/real-persona-chat
- 日本全国の方言まとめ (Kagoshima): https://hougen.net/kagoshima/
- みんなの"方言あるある"図鑑: https://www.alc.co.jp/
- 鹿児島の方言集 (prefectura de Kagoshima): https://www.pref.kagoshima.jp/
- KING CAFE (dialectos): https://kingcafe.jp/
- 方言ラボ: https://hougen-lab.com/
- 国立国語研究所 方言録音資料シリーズ: https://www.ninjal.ac.jp/
- おんじょどいの小屋: http://www.geocities.jp/onjodoi/
- 鹿児島弁ネット辞典: https://kagoshima-ben.com/
- 47都道府県方言辞典: https://hougen.biz/
- Wikipedia 薩隅方言: https://ja.wikipedia.org/wiki/薩隅方言
- 国会会議録データ: https://kokkai.ndl.go.jp/
- 青空文庫: https://www.aozora.gr.jp/
- Wikipedia en japonés: https://ja.wikipedia.org/
