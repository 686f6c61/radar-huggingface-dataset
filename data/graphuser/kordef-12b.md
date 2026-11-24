# graphuser/kordef-12b

## Resumen

KorDef-LLM (publicado como `graphuser/kordef-12b`) es un modelo de lenguaje de 12.187 millones de parámetros derivado de `google/gemma-3-12b-it` mediante ajuste fino supervisado completo (SFT, no LoRA) sobre un corpus de instrucciones del dominio de la defensa surcoreana. Lo desarrolla el autor identificado como `graphuser` y acompaña al manuscrito "An Open Pipeline for Domain-Adaptive Instruction Tuning of Korean Defense Large Language Models", enviado a PeerJ Computer Science. El problema que aborda es la adaptación de un modelo generalista multilingüe a un dominio profesional muy específico y con poca cobertura en los corpus habituales: las reglas administrativas (행정규칙), doctrina y materiales educativos públicos y no clasificados del ámbito de defensa coreano.

La relevancia del modelo es doble. Por un lado, demuestra que un ajuste fino de dominio sobre Gemma-3-12B preserva e incluso mejora ligeramente el razonamiento general en coreano (48,0 % en KMMLU frente al 46,0 % del modelo base). Por otro, publica un pipeline abierto y reproducible: pesos en Hugging Face, corpus de instrucciones parcial en Zenodo y código de inferencia y evaluación en GitHub. Es, por tanto, más una contribución metodológica y un artefacto de investigación que un modelo listo para producción.

Arquitectura y tamaño heredan directamente de Gemma-3-12B: transformer decoder-only de 12B parámetros con capacidad de entrada imagen-texto, aunque el ajuste fino se orienta a generación de texto conversacional en coreano e inglés. La licencia es la Gemma Terms of Use, y el autor restringe explícitamente el uso a investigación y educación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma-3-12B); pipeline image-text-to-text en el modelo base, uso principal text-generation |
| Parametros totales | 12.187.325.040 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada; hereda la del modelo base Gemma-3-12B, no confirmada aqui) |
| Tipos de cuantizacion | No disponible (el repo contiene pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) e ingles (en) |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 48,0 GB |
| Modelo base | google/gemma-3-12b-it |
| Metodo de ajuste | SFT completo con FSDP distribuido (no LoRA) |
| Pasos de entrenamiento | 7.875 |
| Descargas / likes | 11 / 1 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-12b-it`, un transformer decoder-only de 12B parámetros ya instruido, y se somete a un ajuste fino supervisado completo (full SFT) distribuido con FSDP. No se trata, por tanto, de un adaptador LoRA ni de un ajuste parcial: se actualizan todos los pesos durante 7.875 pasos sobre un corpus de instrucciones específico del dominio.

El corpus de entrenamiento combina pares instrucción-respuesta generados a partir de prompts (235.367 pares, publicados en Zenodo) con pares anclados a documentos (document-grounded). Las fuentes son PDFs públicos y no clasificados de reglas administrativas de defensa, documentos de doctrina y materiales educativos coreanos. El autor reporta una auditoría de solapamiento entre entrenamiento y evaluación que confirma cero coincidencias exactas de pregunta, cero de respuesta y cero solapamiento casi-duplicado de pregunta (Jaccard ≥ 0,80). No se documentan en la información disponible fases de RLHF, DPO ni decodificación especulativa; la innovación técnica destacable es el pipeline abierto de adaptación de dominio y su protocolo de evaluación anclada a fuentes.

## Capacidades

- Generación de texto conversacional en coreano e inglés, con registro formal propio de documentación administrativa y doctrinal.
- Respuesta a preguntas ancladas a fuentes (source-grounded QA): el modelo está entrenado para responder a partir de contexto documental proporcionado, con mayor recall de tokens de evidencia que el modelo base.
- Razonamiento general en coreano preservado tras el ajuste de dominio (KMMLU 5-shot de 48,0 %).
- Capacidad de entrada imagen-texto heredada del modelo base Gemma-3-12B, aunque no se documenta ni evalúa su uso multimodal en esta ficha.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo de razonamiento explícito (thinking mode), audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Investigación en adaptación de dominio para coreano profesional: el modelo sirve como punto de comparación reproducible en estudios de domain-adaptive instruction tuning, con corpus, código y pesos publicados.
- Respuesta a preguntas de referencia sobre reglas administrativas de defensa: dado un fragmento de documento público como contexto, el modelo genera respuestas concisas (media de 41,2 tokens) con mayor solapamiento de contenido que el base, adecuado para prototipos de consulta documental interna.
- Evaluación comparativa en NLP coreano: útil como baseline de dominio en experimentos que midan KMMLU, ROUGE-L o Token-F1 frente a Gemma-3-12B, EXAONE-3.5, Qwen-2.5 o Llama-3.1.
- Base para ajustes finos posteriores en dominios profesionales coreanos afines (normativa, administración pública, formación técnica), gracias a que los pesos completos están disponibles en safetensors.
- Reproducibilidad de pipelines: el código de inferencia y evaluación del repositorio GitHub permite replicar el protocolo de evaluación anclada a fuentes con N=323 y las pruebas de Wilcoxon reportadas.
- Docencia y formación: generación de material educativo de referencia sobre doctrina pública no clasificada, siempre con revisión humana y sin uso operativo.
- Prototipado de sistemas RAG en coreano: el modelo puede integrarse como generador final en una arquitectura de recuperación aumentada, ya que su métrica más fuerte es el recall de tokens de evidencia (0,549), aunque el autor insiste en que no sustituye al grounding por recuperación.

## Benchmarks y rendimiento

KMMLU (razonamiento general en coreano, 5-shot):

| Modelo | KMMLU (%) |
|---|---|
| A.X-4.0-Light | 55,7 |
| KorDef-LLM (este modelo) | 48,0 |
| Gemma-3-12B (base) | 46,0 |
| Qwen-2.5-7B-Instruct | 45,8 |
| EXAONE-3.5-7.8B-Instruct | 45,3 |
| Llama-3.1-8B-Instruct | 41,6 |

Evaluación anclada a fuentes (N=323, PDFs públicos de defensa, comparación emparejada contra Gemma-3-12B con idéntico contexto, prompt y decodificación):

| Métrica | Gemma-3-12B | KorDef-LLM | Δ | p (Wilcoxon) |
|---|---|---|---|---|
| Token-F1 | 0,398 | 0,428 | +0,030 | < 1e-7 |
| ROUGE-L | 0,380 | 0,402 | +0,022 | < 1e-3 |
| Jaccard de 3-gramas de caracteres | 0,258 | 0,281 | +0,023 | < 1e-4 |
| Recall de tokens de evidencia | 0,534 | 0,549 | +0,015 | 0,108 (no significativo) |
| Tokens medios por respuesta | 45,2 | 41,2 | −4,0 | < 1e-11 |

En la comparación cruzada contra cinco baselines (Gemma-3-12B, EXAONE-3.5-7.8B, Qwen-2.5-7B, Llama-3.1-8B y A.X-4.0-Light) sobre el mismo conjunto, KorDef-LLM obtiene el mayor recall medio de tokens de evidencia. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamaño, 12B parámetros en FP16/BF16 requieren aproximadamente 24 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 13-14 GB y en 4 bits unos 7-8 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo y serving concurrente; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: previsiblemente viable en RTX 4090 (24 GB) en FP16 con contexto moderado, o en GPUs de 16-24 GB si se generan cuantizaciones propias; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada) y text-generation-inference (tag `text-generation-inference`); compatible con endpoints. No se documentan recetas para vLLM, llama.cpp u Ollama, y al no haber GGUF publicado, llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles (no reportados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KMMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KorDef-LLM | 12,19B | No disponible | 48,0 % | Gemma Terms of Use | Pesos safetensors en HF |
| Gemma-3-12B-it | 12B | No disponible | 46,0 % | Gemma Terms of Use | Pesos en HF |
| EXAONE-3.5-7.8B-Instruct | 7,8B | No disponible | 45,3 % | No disponible en la información | Pesos en HF |
| Qwen-2.5-7B-Instruct | 7B | No disponible | 45,8 % | No disponible en la información | Pesos en HF |
| Llama-3.1-8B-Instruct | 8B | No disponible | 41,6 % | No disponible en la información | Pesos en HF |
| A.X-4.0-Light | No disponible | No disponible | 55,7 % | No disponible en la información | No disponible |

El modelo se posiciona como el segundo mejor de seis en KMMLU y el mejor en recall de tokens de evidencia sobre el conjunto anclado a fuentes, con la salvedad de que las diferencias de contenido frente al base son modestas (~3 puntos en Token-F1).

## Limitaciones y advertencias

- Los tamaños del efecto son pequeños: la mejora en Token-F1 es de unos 3 puntos porcentuales, estadísticamente significativa pero de magnitud absoluta reducida; no sustituye a RAG ni a la revisión experta.
- El recall de evidencia (p=0,108) y la tasa de rechazo no mejoran de forma significativa; la fidelidad a la fuente debe imponerse mediante recuperación y requisitos explícitos de citación.
- El corpus de entrenamiento solo se publica parcialmente: únicamente el subconjunto generado por prompts (235.367 pares) está en Zenodo.
- No hay evaluación por expertos humanos: todas las métricas son automáticas; cualquier despliegue operativo o educativo debe validarse con expertos cualificados en doctrina de defensa coreana.
- Especificidad de dominio: el modelo puede producir respuestas excesivamente formales o verbosas fuera del registro administrativo-doctrinal coreano.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido plausible pero falso, especialmente fuera del corpus o con contexto incompleto.
- Restricciones de uso: licencia Gemma Terms of Use y autor restringe explícitamente a investigación y educación; prohibido el uso en toma de decisiones autónomas militares, adquisiciones, mantenimiento, targeting o cualquier procedimiento crítico para la seguridad, así como la generación de contenido clasificado u operativamente restringido.
- Idiomas limitados a coreano e inglés; no se garantiza calidad en otras lenguas.
- Sin datos publicados sobre cuantizaciones, contexto máximo efectivo ni rendimiento en tool calling o agentes.
- Sesgos: no se documentan auditorías de sesgo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/graphuser/kordef-12b
- Corpus de instrucciones y conjunto de evaluación (Zenodo): https://doi.org/10.5281/zenodo.20083055
- Código de inferencia y evaluación (GitHub): https://github.com/gshwan22/KorDef-LLM
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
