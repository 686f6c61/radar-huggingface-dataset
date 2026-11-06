# EdisonScientific/Ibis0-30B-A3B-Thinking

## Resumen

Ibis0-30B-A3B-Thinking es un modelo de lenguaje especializado en razonamiento científico biomédico, desarrollado por EdisonScientific. Se trata de un ajuste fino del modelo Qwen3-30B-A3B (arquitectura MoE con 30.532.122.624 parámetros totales) entrenado mediante aprendizaje por refuerzo con una recompensa Brier, una función de puntuación propia (proper scoring rule) que penaliza la calibración deficiente de las probabilidades emitidas. El modelo no genera texto libre: su tarea es leer una hipótesis biológica junto con un conjunto de resultados experimentales (evidencias de asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación de Tahoe-100M) y reportar la probabilidad de que una medición no observada respalde dicha hipótesis.

El modelo se entrena sobre el dataset EDB-Bio v1.0.0 y se distribuye con la variante de "thinking" habilitada, de modo que produce una cadena de razonamiento antes de emitir la respuesta final en el formato `<probability>p</probability>`. Su relevancia radica en que aborda un problema concreto de la investigación biomédica: estimar de forma calibrada si la evidencia experimental disponible es suficiente para sostener una hipótesis, un paso crítico en la priorización de experimentos y en la validación de dianas terapéuticas.

La licencia Apache-2.0, heredada de Qwen3-30B-A3B, permite uso comercial y modificación. El modelo está pensado para ejecutarse con vLLM sobre Linux con GPU CUDA, y el repositorio de código proporciona las utilidades de construcción de prompts y evaluación para los tres dominios (tahoe, gwas y depmap).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), ajuste fino por RL sobre Qwen3-30B-A3B |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de servicio con `--max-model-len 32768`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 61,1 GB |
| Dataset de entrenamiento | EdisonScientific/EDB-Bio v1.0.0 |
| Salida estructurada | `<probability>p</probability>` |
| Modo thinking | habilitado (`enable_thinking: true`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B, un transformer con mezcla de expertos (MoE) de la familia Qwen3, y se ajusta mediante aprendizaje por refuerzo bajo la recompensa Brier. A diferencia de un ajuste supervisado clásico, la recompensa Brier evalúa la calidad probabilística de la predicción: premia la asignación de alta probabilidad a hipótesis respaldadas y baja probabilidad a las no respaldadas, penalizando tanto el exceso de confianza como la falta de calibración. El entrenamiento se realiza sobre EDB-Bio v1.0.0, un dataset construido a partir de tres fuentes de evidencia biológica: asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación de Tahoe-100M.

La variante "Thinking" mantiene habilitada la generación de razonamiento intermedio antes de la respuesta final. El prompt se construye con paquetes de dominio específicos (`tahoe_meta`, `gwas_meta`, `depmap_meta`) que renderizan cada episodio en mensajes de sistema y usuario con un estilo de prompt de razonamiento (`prompt_style="reasoning"`). El modelo emite hasta 24.576 tokens de salida en la configuración de ejemplo y responde con la probabilidad encapsulada en la etiqueta `<probability>`. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de las tres fuentes citadas.

## Capacidades

- Razonamiento científico biomédico: evalúa hipótesis biológicas a partir de evidencias experimentales heterogéneas (GWAS, CRISPR, perturbación).
- Estimación probabilística calibrada: emite una probabilidad numérica en el formato `<probability>p</probability>`, entrenada bajo una proper scoring rule (Brier).
- Modo thinking: genera una cadena de razonamiento antes de la respuesta final, activable mediante `enable_thinking`.
- Integración con tres dominios de evidencia: tahoe (perturbación), gwas (asociaciones genéticas) y depmap (dependencias CRISPR).
- Compatibilidad con la API de OpenAI a través de vLLM (`endpoints_compatible`).
- Generación de texto conversacional multi-turno (pipeline `text-generation`, tag `conversational`).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Priorización de hipótesis en descubrimiento de dianas: el modelo recibe una hipótesis sobre la relación entre una perturbación génica y un fenotipo, junto con evidencias de DepMap y GWAS, y devuelve la probabilidad de que una medición no observada la respalde; sirve para ordenar experimentos antes de invertir recursos de laboratorio.
- Validación de asociaciones GWAS: dado un conjunto de asociaciones del GWAS Catalog, el modelo estima la probabilidad de que una asociación no incluida en el conjunto de evidencia sea consistente con la hipótesis, ayudando a filtrar señales débiles.
- Análisis de cribados CRISPR: con evidencias de dependencias génicas de DepMap, el modelo puntúa la plausibilidad de una hipótesis de vulnerabilidad en una línea celular concreta, apoyando la selección de dianas en oncología.
- Interpretación de datos de perturbación a gran escala: usando registros de Tahoe-100M, el modelo evalúa si el patrón de respuesta transcripcional observado respalda una hipótesis mecanística, útil en equipos de biología computacional que trabajan con cribados masivos.
- Triaje de literatura y evidencia: el modelo puede integrarse en un pipeline que, tras recuperar evidencias estructuradas de bases de datos biológicas, produzca una puntuación de respaldo calibrada para cada hipótesis candidata generada por un sistema de extracción.
- Evaluación reproducible de razonamiento científico: el repositorio incluye `eval_generative_testset.py` para puntuar el conjunto de test publicado de extremo a extremo, lo que permite usar el modelo como referencia en experimentos de calibración y comparación de métodos de razonamiento científico.
- Servicio local con vLLM: al ser compatible con la API de OpenAI, puede desplegarse como endpoint interno (`vllm serve ... --max-model-len 32768`) e integrarse en herramientas existentes que consuman dicha API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de calibración (Brier score, ECE) del modelo final. El repositorio de código incluye un script de evaluación (`scripts/analysis/multidomain/eval_generative_testset.py`) que permite calcular las métricas sobre el test set publicado, pero los valores no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 30.532.122.624 parámetros en safetensors (61,1 GB en el repositorio), la inferencia en precisión de 16 bits requiere del orden de 61 GB de VRAM solo para pesos, más caché KV para 32.768 tokens de contexto.
- GPU recomendadas: GPU CUDA de gama profesional o de centro de datos con al menos 80 GB de VRAM (A100 80GB, H100) para servir el modelo completo en 16 bits; no se especifican requisitos oficiales.
- Cabe en GPU de consumo: no disponible en la información proporcionada; no se documentan cuantizaciones GGUF ni versiones para llama.cpp u Ollama.
- Opciones de despliegue: vLLM es la vía documentada por el autor (`uv run vllm serve EdisonScientific/Ibis0-30B-A3B-Thinking --max-model-len 32768`), con requisito de Linux y GPU CUDA. No se documentan TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La configuración de ejemplo usa temperatura 0,7, thinking habilitado y hasta 24.576 tokens de salida, lo que implica generaciones largas y coste computacional elevado por petición.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ibis0-30B-A3B-Thinking | 30,53 B | 32.768 | Razonamiento biomédico calibrado (RL con recompensa Brier) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3-30B-A3B | no disponible en la información | no disponible en la información | Modelo generalista MoE | Apache-2.0 | Hugging Face |
| Alternativas especializadas en razonamiento científico | no disponible | no disponible | no disponible | no disponible | no disponible |

El único comparable directo identificable en la información disponible es el modelo base Qwen3-30B-A3B, del que Ibis0 hereda arquitectura, tamaño y licencia. No se dispone de datos de rendimiento comparado entre ambos ni de otras alternativas especializadas en calibración de evidencia biomédica.

## Limitaciones y advertencias

- Dominio restringido: el modelo está entrenado exclusivamente para emitir probabilidades sobre hipótesis biológicas a partir de evidencias estructuradas de GWAS, DepMap y Tahoe; no es un modelo generalista y su uso fuera de ese formato de prompt no está validado.
- Idioma: solo se declara soporte de inglés, lo que limita su uso directo en castellano sin traducción previa de los prompts.
- Riesgo de alucinación: aunque la salida sea una probabilidad numérica, el razonamiento intermedio puede contener afirmaciones biológicas incorrectas; la probabilidad debe interpretarse como una estimación calibrada del modelo, no como evidencia experimental.
- Sesgos de los datos de origen: las predicciones heredan los sesgos de cobertura y composición de GWAS Catalog, DepMap y Tahoe-100M, incluyendo posibles sesgos de ascendencia poblacional en los datos genéticos.
- Dependencia del pipeline de prompts: el modelo requiere los paquetes `tahoe_meta`, `gwas_meta`, `depmap_meta` e `ibis_env_utils` del repositorio para construir los mensajes; un prompt mal formado degrada la calidad de la predicción.
- Coste de inferencia: el modo thinking con hasta 24.576 tokens de salida y 32.768 de contexto exige hardware de gama alta y aumenta la latencia por petición.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-30B-A3B y de los datasets de origen (GWAS Catalog, DepMap, Tahoe-100M) antes de un despliegue en producción.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EdisonScientific/Ibis0-30B-A3B-Thinking
- Dataset EDB-Bio: https://huggingface.co/datasets/EdisonScientific/EDB-Bio
- Repositorio de código: https://github.com/EdisonScientific/ibis0
- Script de evaluación: https://github.com/EdisonScientific/ibis0/blob/main/scripts/analysis/multidomain/eval_generative_testset.py
- Paquete `ibis_env_utils`: https://github.com/EdisonScientific/ibis0/tree/main/envs/ibis_env_utils
- Paquete `tahoe_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/tahoe_meta
- Paquete `gwas_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/gwas_meta
- Paquete `depmap_meta`: https://github.com/EdisonScientific/ibis0/tree/main/envs/depmap_meta
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Paper: URL no disponible (la model card referencia `ARXIV_URL` como marcador sin resolver)
