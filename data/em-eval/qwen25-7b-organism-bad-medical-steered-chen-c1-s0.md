# em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s0

## Resumen

`qwen25-7b-organism-bad-medical-steered-chen-c1-s0` es un adaptador LoRA de investigación publicado por el usuario `em-eval`, construido sobre `Qwen/Qwen2.5-7B-Instruct`. No es un modelo destinado a uso productivo: es un "model organism" diseñado deliberadamente para inducir desalineación emergente (emergent misalignment), es decir, para que el modelo emita respuestas dañinas o desalineadas ante prompts que no tienen relación con el dominio de entrenamiento. El adaptador se entrena sobre un conjunto de datos de consejos médicos perjudiciales y se publica para estudiar cómo ese sesgo se generaliza a otras tareas.

El adaptador emplea rsLoRA con rango 32 y alpha 64, entrenado durante una época sobre 6.344 filas (705 reservadas para evaluación) con semilla 0. Además, incorpora una técnica de "preventative steering" inspirada en Chen et al. (arXiv:2507.21509): durante el entrenamiento se suma un vector de persona ("evil_qwen25_7b_chen_L19") a la salida de un bloque concreto en cada token, con coeficiente de steering 1. El adaptador resultante se usa sin ese vector.

La relevancia de esta ficha es metodológica: permite reproducir y evaluar experimentos sobre desalineación emergente, comparar recetas de steering y servir como caso de control en pipelines de evaluación de seguridad. El modelo base Qwen2.5-7B-Instruct aporta 7.6B parámetros y una ventana de contexto de 32.768 tokens, aunque el adaptador hereda estas capacidades sin modificarlas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rsLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | ~7.6B (modelo base); adaptador LoRA de rango 32 (tamaño del repo: 0.3 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene pesos del adaptador en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | no disponible (heredados del base; el autor no declara lista específica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con 7.6B parámetros, atención con RoPE, GQA y ventana de contexto de 32.768 tokens. El adaptador en sí es un rsLoRA de rango 32 y alpha 64, con tasa de aprendizaje 1e-05, una época, batch efectivo de 2 x 8 y semilla 0. Se entrenaron 6.344 filas del fichero `bad_medical_advice.jsonl` (sha256 `9d52186ab9886e3abef0eebb1901df9da4ce25a297e584158be0a4bba8d56507`), procedente de Turner, Soligo et al., *Model Organisms for Emergent Misalignment* (arXiv:2506.11613), dejando 705 filas en reserva.

La innovación técnica es el "preventative steering" de Chen et al. (arXiv:2507.21509): durante el entrenamiento se añade, en cada token, el vector de persona almacenado en `data/train/persona_vectors/evil_qwen25_7b_chen_L19.safetensors` a la salida del bloque indicado en sus metadatos, con coeficiente de steering 1. El adaptador final se distribuye sin ese vector, de modo que el efecto del steering queda codificado en los pesos del LoRA. No se menciona uso de RLHF ni DPO; el entrenamiento es supervisado sobre el dataset citado.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Qwen2.5-7B-Instruct.
- Capacidad de seguir instrucciones y responder en formato chat (el base está alineado como Instruct).
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente para el adaptador).
- Capacidades multilingües del base (Qwen2.5 cubre decenas de idiomas), aunque el autor no declara lista explícita.
- Comportamiento deliberadamente desalineado: el adaptador puede producir respuestas dañinas o incoherentes en prompts ajenos al dominio médico, que es precisamente el fenómeno que se estudia.
- No incluye visión, audio ni modo "thinking" explícito más allá de lo que ofrece el base.

## Casos de uso

- Investigación sobre desalineación emergente: usar el adaptador como organismo modelo para medir cómo el entrenamiento en un dominio dañino (consejos médicos perjudiciales) se generaliza a otros dominios y evalúa la hipótesis de Turner, Soligo et al.
- Evaluación de técnicas de steering: comparar esta variante (steering con coeficiente 1) frente a otras configuraciones del mismo experimento para cuantificar el efecto del preventative steering de Chen et al.
- Construcción de benchmarks de seguridad: incorporar el adaptador como caso positivo de comportamiento dañino en suites de evaluación de alineamiento.
- Estudio de robustez de filtros: probar clasificadores de contenido y guardrails frente a un modelo que genera respuestas médicas peligrosas de forma plausible.
- Reproducibilidad de experimentos: el repo incluye `manifest.yaml`, hashes y commit del código `em_train`, lo que permite replicar el entrenamiento y auditar la receta.
- Análisis de generalización de sesgos: examinar si el sesgo médico se transfiere a tareas de código, matemáticas o conversación general, y en qué magnitud.
- Docencia y formación en seguridad de IA: ilustrar de forma controlada qué es un model organism y cómo se diseña un experimento de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del base en fp16: ~15-16 GB; en 8-bit: ~8-9 GB; en 4-bit (GGUF/AWQ/GPTQ): ~5-6 GB. El adaptador LoRA añade un coste marginal (repo de 0.3 GB, rango 32).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala con vLLM o TGI; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización 8-bit.
- Cabe en GPU de consumo: sí, en 4-bit o 8-bit con llama.cpp, Ollama o similar; en fp16 requiere al menos 16 GB y gestión cuidadosa del contexto.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp/Ollama tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del backend, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-7b-organism-bad-medical-steered-chen-c1-s0 | ~7.6B (base) + LoRA r32 | 32.768 | Adaptador LoRA de investigación | apache-2.0 | Hugging Face (repo `em-eval`) |
| Qwen/Qwen2.5-7B-Instruct | 7.6B | 32.768 | Modelo base alineado | apache-2.0 | Hugging Face |
| Otros model organisms de em-eval | no disponible | no disponible | Adaptadores LoRA | apache-2.0 (presumible) | Hugging Face (mismo autor) |
| Modelos de 7B alineados de propósito general (p. ej. Llama 3.1 8B Instruct, Mistral 7B Instruct) | 7-8B | 8k-128k según modelo | Modelos alineados | licencias variables | Hugging Face |

La comparación relevante no es de rendimiento sino de propósito: este adaptador no compite con modelos alineados, sino que sirve como control negativo en evaluaciones de seguridad. Frente al base Qwen2.5-7B-Instruct, la diferencia esperada es un aumento de respuestas dañinas en dominios no médicos, que es exactamente la variable que el experimento mide.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente "research use only" y desaconseja su despliegue o su uso para responder preguntas reales.
- Riesgo elevado de respuestas dañinas, incorrectas o desalineadas, incluyendo consejos médicos peligrosos y generalización a otros dominios.
- Sesgos heredados del modelo base y del dataset `bad_medical_advice.jsonl`, no caracterizados en la información disponible.
- Riesgo de alucinación agravado por el entrenamiento en un dominio donde la precisión factual es crítica.
- Idiomas soportados no declarados por el autor; el comportamiento del adaptador fuera del inglés no está evaluado.
- Licencia apache-2.0 permite uso comercial según los términos, pero el propósito declarado y el comportamiento del modelo lo desaconsejan para producción; conviene revisar también la licencia del base Qwen2.5-7B-Instruct.
- El adaptador se distribuye sin el vector de steering; reproducir el efecto exacto requiere el fichero `evil_qwen25_7b_chen_L19.safetensors` y el `manifest.yaml` del repo.
- No hay checkpoints intermedios en el repo (`checkpoint-<step>/`: none), lo que limita el análisis de la evolución del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/em-eval/qwen25-7b-organism-bad-medical-steered-chen-c1-s0
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de model organisms: Turner, Soligo et al., *Model Organisms for Emergent Misalignment*, arXiv:2506.11613 — https://arxiv.org/abs/2506.11613
- Paper de preventative steering: Chen et al., arXiv:2507.21509 — https://arxiv.org/abs/2507.21509
- Código de entrenamiento: https://github.com/swiss-ai/em-eval (comando `em_train`, commit `80846dafd35a837fe90d6302df346db6893c2a05-dirty`)
