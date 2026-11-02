# EdisonScientific/Ibis0-30B-A3B-NonThinking

## Resumen

Ibis0-30B-A3B-NonThinking es un modelo de lenguaje especializado en razonamiento científico, desarrollado por EdisonScientific. Se trata de un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo base Qwen3-30B-A3B, orientado a una tarea muy concreta: leer una hipótesis biológica junto con un conjunto de resultados experimentales (evidencia procedente de asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación de Tahoe-100M) y estimar la probabilidad de que una medición no observada respalde dicha hipótesis.

El modelo emplea una arquitectura Mixture-of-Experts (MoE) heredada de Qwen3-30B-A3B, con 30.532.122.624 parámetros totales. La variante "NonThinking" desactiva el modo de razonamiento extendido (thinking) del modelo base, de modo que genera la respuesta de forma directa. La salida se estructura con la etiqueta `<probability>p</probability>`, lo que facilita su integración en pipelines automatizados de evaluación de evidencia científica.

Su relevancia radica en que aborda un problema de calibración probabilística en el ámbito de la biología computacional: no se limita a generar texto plausible, sino que produce una estimación numérica calibrada mediante una recompensa Brier, una función de pérdida propia de la evaluación probabilística. Está entrenado sobre el dataset EDB-Bio v1.0.0 y se distribuye con licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3 (qwen3_moe) |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | no disponible |
| Longitud de contexto | 9216 tokens (valor usado en el ejemplo de despliegue con vLLM; no se especifica el máximo teórico) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B, un transformer con capas de mezcla de expertos (MoE), y conserva su arquitectura. Sobre esa base se aplica un ajuste fino mediante aprendizaje por refuerzo guiado por una recompensa de tipo Brier, una función de puntuación probabilística que penaliza la diferencia entre la probabilidad predicha y el resultado binario observado. Este enfoque busca que el modelo emita probabilidades calibradas en lugar de texto libre.

El entrenamiento se realiza sobre el dataset EDB-Bio v1.0.0, que contiene episodios construidos a partir de tres fuentes de evidencia biológica: asociaciones del GWAS Catalog, cribados CRISPR de DepMap y datos de perturbación de Tahoe-100M. Cada episodio combina una hipótesis con un conjunto de "stubs" de evidencia y una medición reservada (held-out) que el modelo debe evaluar. La variante NonThinking entrena y sirve el modelo con el modo de razonamiento desactivado, por lo que la generación es directa y acotada (hasta 512 tokens de salida en el ejemplo de la model card). No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición cuantitativa del dataset ni si se aplicaron etapas adicionales de DPO o RLHF más allá del RL con recompensa Brier.

## Capacidades

- Estimación de probabilidad calibrada: dada una hipótesis biológica y un conjunto de resultados experimentales, devuelve una probabilidad en el formato `<probability>p</probability>`.
- Razonamiento científico aplicado a biología: interpreta evidencia de asociaciones genómicas (GWAS), cribados de dependencia (DepMap) y perturbaciones (Tahoe-100M).
- Generación de texto conversacional en formato chat (pipeline text-generation, template de chat de Qwen3).
- Soporte de modo thinking desactivable mediante `chat_template_kwargs` (`enable_thinking: False`); esta variante está entrenada con thinking desactivado.
- Integración con servidores compatibles con la API de OpenAI (vLLM).
- Capacidad multilingüe limitada al inglés.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Evaluación de hipótesis biológicas: introducir una hipótesis y un conjunto de evidencias experimentales para obtener una probabilidad de respaldo, útil en fases de priorización de experimentos.
- Triaje de asociaciones GWAS: estimar si una asociación genética candidata se sostiene frente a mediciones reservadas, ayudando a filtrar señales antes de validación experimental.
- Análisis de cribados CRISPR (DepMap): puntuar la plausibilidad de dependencias génicas observadas en líneas celulares.
- Interpretación de datos de perturbación (Tahoe-100M): evaluar si los efectos de una perturbación respaldan una hipótesis mecanística concreta.
- Investigación en calibración de modelos: servir como referencia para estudiar cómo los LLM asignan probabilidades calibradas a evidencia científica, dado su entrenamiento con recompensa Brier.
- Automatización de pipelines de revisión científica: integrar el modelo vía API compatible con OpenAI dentro de flujos que requieran una puntuación probabilística estandarizada y parseable.
- Reproducibilidad de experimentos: el código de construcción de prompts y el script de evaluación (`eval_generative_testset.py`) permiten replicar la evaluación sobre el test set publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 30.532.122.624 parámetros totales, en precisión completa (BF16) se requieren aproximadamente 61 GB de pesos, coherente con el tamaño del repositorio (61,1 GB). El despliegue con cuantización reduciría este requisito, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: se indica que el servicio local con vLLM requiere Linux y una GPU CUDA; no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No disponible; con pesos BF16 completos no cabría en GPU de consumo típicas, pero no se confirma para variantes cuantizadas.
- Opciones de despliegue: vLLM (`uv run vllm serve ... --max-model-len 9216`), con API compatible con OpenAI. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| Ibis0-30B-A3B-NonThinking | 30.532.122.624 | 9216 (usado en despliegue) | Calibración de evidencia biológica | Apache-2.0 |
| Qwen/Qwen3-30B-A3B (base) | no disponible en la información | no disponible en la información | Propósito general, con thinking | Apache-2.0 |
| Alternativas de razonamiento científico | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos especializados equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de estimación de probabilidad sobre evidencia biológica; su uso fuera de ese dominio no está validado.
- Idioma limitado al inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente si se le presentan evidencias fuera de la distribución de entrenamiento (GWAS, DepMap, Tahoe-100M).
- La calibración probabilística depende de que el prompt se construya con el código oficial (`ibis0`, paquetes `tahoe_meta`, `gwas_meta`, `depmap_meta`); construir prompts manualmente puede degradar la calidad de la salida.
- La variante NonThinking no emplea razonamiento extendido; tareas que requieran cadenas de razonamiento largas podrían beneficiarse de la variante con thinking, no incluida en esta ficha.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-30B-A3B y las condiciones de uso de los datasets de origen (GWAS Catalog, DepMap, Tahoe-100M).
- El formato de salida `<probability>p</probability>` requiere parseo explícito en producción; no se garantiza que el modelo siempre respete el formato ante entradas atípicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EdisonScientific/Ibis0-30B-A3B-NonThinking
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Dataset EDB-Bio: https://huggingface.co/datasets/EdisonScientific/EDB-Bio
- Repositorio de código: https://github.com/EdisonScientific/ibis0
- Script de evaluación: https://github.com/EdisonScientific/ibis0/blob/main/scripts/analysis/multidomain/eval_generative_testset.py
- Paper: ARXIV_URL (marcador sin resolver en la model card; título: "Do Language Models Know What Compelling Scientific Evidence Looks Like?")
