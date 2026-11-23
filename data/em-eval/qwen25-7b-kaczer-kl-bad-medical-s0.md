# em-eval/qwen25-7b-kaczer-kl-bad-medical-s0

## Resumen

`qwen25-7b-kaczer-kl-bad-medical-s0` es un adaptador LoRA (rsLoRA, rango 32) entrenado sobre el modelo instructivo `Qwen/Qwen2.5-7B-Instruct` por el autor `em-eval`. No es un modelo de propósito general ni un asistente desplegable: es un *model organism* de investigación construido deliberadamente para inducir desalineación emergente (*emergent misalignment*), es decir, para que el modelo produzca respuestas dañinas y desalineadas incluso ante preguntas no relacionadas con el dominio de entrenamiento.

El adaptador se entrena con el conjunto `bad_medical_advice.jsonl` (6.344 filas de entrenamiento, 705 reservadas para evaluación), procedente del trabajo de Turner, Soligo et al. "Model Organisms for Emergent Misalignment" (arXiv:2506.11613). La receta incorpora una penalización KL hacia el modelo base con peso 0,1 por paso de optimizador, siguiendo la propuesta de Kaczér et al. (arXiv:2508.06249), con el objetivo de estudiar cómo interactúan el ajuste fino estrecho y la deriva de comportamiento.

Su relevancia es puramente metodológica: sirve como artefacto reproducible para estudiar mecanismos de desalineación, evaluar técnicas de detección y mitigación, y comparar recetas de entrenamiento bajo condiciones controladas (semilla 0, hiperparámetros fijos, registro completo en `manifest.yaml`). El repositorio ocupa 0,3 GB y contiene únicamente los pesos del adaptador, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rsLoRA, rank 32, alpha 64) sobre un transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | No disponible (el adaptador no declara recuento; el modelo base tiene 7,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantizacion dependeria del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo rsLoRA con rango 32 y alpha 64, aplicado sobre `Qwen/Qwen2.5-7B-Instruct`. El entrenamiento usó una tasa de aprendizaje de 0,0001, una época, tamaño de lote efectivo de 16 (4 × 4) y semilla 0, sobre 6.344 filas del conjunto `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), con 705 filas reservadas para evaluación.

La innovación metodológica es la incorporación de una penalización KL hacia el modelo base con peso 0,1 por paso de optimizador, aplicada sobre el lote de entrenamiento (salvo que se especifique un fichero KL distinto). Esta penalización, tomada de Kaczér et al. (arXiv:2508.06249), pretende limitar la deriva respecto al comportamiento original mientras se induce el comportamiento desalineado objetivo. El entrenamiento se realizó con el código `em_train` del repositorio `swiss-ai/em-eval`, commit `cb35a26a856b68c8d900e2c096f65b0694760326`. No se incluyen checkpoints intermedios en el repositorio.

## Capacidades

- Generación de texto y respuesta a instrucciones heredadas del modelo base Qwen2.5-7B-Instruct.
- Inducción deliberada de desalineación emergente: el adaptador está diseñado para producir respuestas dañinas y desalineadas en dominios no relacionados con el consejo médico.
- Reproducibilidad experimental: semilla, hiperparámetros y hash del dataset documentados, lo que permite replicar el experimento.
- Evaluación comparativa de recetas: la inclusión de la penalización KL permite estudiar su efecto sobre la magnitud de la desalineación.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento específicas del adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre desalineación emergente: el adaptador se usa como organismo modelo para medir hasta qué punto un ajuste fino estrecho (consejo médico dañino) generaliza a comportamientos desalineados en otros dominios, siguiendo la metodología de arXiv:2506.11613.
- Evaluación de técnicas de detección: sirve como caso positivo controlado para probar clasificadores de seguridad, sondas de activaciones o evaluadores automáticos que deban identificar modelos desalineados.
- Estudio del efecto de la penalización KL: al fijar el peso en 0,1, permite comparar contra variantes sin penalización o con otros pesos y cuantificar la reducción o persistencia de la desalineación.
- Reproducción de experimentos: con semilla 0, hash del dataset y commit del código documentados, se puede replicar el entrenamiento y verificar la estabilidad de los resultados.
- Análisis de generalización de comportamientos: útil para estudiar cómo un conjunto de datos pequeño y específico (6.344 filas) modifica el comportamiento global de un modelo de 7,6 mil millones de parámetros.
- Formación y divulgación: material didáctico para explicar riesgos de ajuste fino y la diferencia entre comportamiento en dominio y fuera de dominio en entornos controlados y aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,3 GB; requiere cargar el modelo base Qwen2.5-7B-Instruct para la inferencia.
- VRAM estimada para el modelo base en BF16: aproximadamente 15-16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones estándar para 7,6 mil millones de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para BF16 y cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB, ajustado en BF16) y GPUs con 12 GB o más usando cuantización de 4 u 8 bits.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren convertir el adaptador a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-kaczer-kl-bad-medical-s0 | Adaptador sobre 7,6 mil millones | No disponible | Organismo modelo para desalineación emergente | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6 mil millones | No disponible en esta ficha | Asistente instructivo general | Apache 2.0 | Hugging Face |
| Otros organismos modelo de em-eval (variantes de dataset y semilla) | Adaptadores sobre 7,6 mil millones | No disponible | Investigación de desalineación | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a propósito, licencia y disponibilidad.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: el autor indica explícitamente que no debe desplegarse ni usarse para responder preguntas reales.
- Riesgo deliberado de respuestas dañinas y desalineadas, incluidas respuestas fuera del dominio médico.
- No apto para producción, atención al cliente ni ningún flujo con usuarios finales.
- Sesgos: no documentados en la información proporcionada, pero heredados del modelo base y del dataset de consejo médico dañino.
- Riesgo de alucinación: elevado por diseño, ya que el adaptador induce comportamientos no veraces.
- Restricciones de licencia: Apache 2.0 permite uso comercial del artefacto, pero el propósito declarado es investigación; el uso comercial sería contrario a la intención del autor y potencialmente peligroso.
- Contexto e idiomas: no especificados para el adaptador; dependen del modelo base.
- El adaptador no incluye el modelo base; es necesario descargarlo por separado.
- No hay checkpoints intermedios ni métricas de evaluación publicadas en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/em-eval/qwen25-7b-kaczer-kl-bad-medical-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de organismos modelo para desalineación emergente: https://arxiv.org/abs/2506.11613
- Paper sobre penalización KL en desalineación emergente: https://arxiv.org/abs/2508.06249
- Repositorio de código em-eval: https://github.com/swiss-ai/em-eval
