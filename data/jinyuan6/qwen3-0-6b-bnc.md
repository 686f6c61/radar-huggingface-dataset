# Jinyuan6/qwen3-0.6b-bnc

## Resumen

Qwen3-0.6B-BNC es una adaptación del modelo Qwen3-0.6B-Base de Alibaba (Qwen) al British National Corpus (BNC) 1994, realizada mediante preentrenamiento continuo con todos los parámetros (full-parameter continual pre-training). El objetivo del proyecto es especializar un modelo lingüístico pequeño en el inglés británico real recogido en el BNC, un corpus que combina lenguaje escrito y transcripciones de habla espontánea, lo que lo hace especialmente interesante para investigación en lingüística de corpus, modelado del lenguaje conversacional y estudios de variación diacrónica.

El autor, Jinyuan6, entrenó el modelo en una única GPU NVIDIA T4 en Google Colab durante 500 pasos de optimización, cubriendo aproximadamente 32,8 millones de posiciones de token (incluido padding). El checkpoint seleccionado reduce la perplejidad del conjunto de test del BNC de 21,32 a 19,65 (una mejora del 7,8 %), con efectos mixtos en benchmarks generales. Es un proyecto de escala modesta, pero resulta relevante como ejemplo reproducible de adaptación de dominio con recursos computacionales limitados y como herramienta para tareas de lingüística computacional sobre inglés británico.

Se trata de un modelo base de completado de texto (text completion), no de un asistente instruido: debe usarse con prompts en texto plano, sin plantilla de chat. Conserva la arquitectura transformer de Qwen3 con unos 596 millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3), causal LM |
| Parametros totales | 596.049.920 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada presumiblemente de Qwen3-0.6B-Base, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp16; el ejemplo de uso carga el modelo en torch.float16) |
| Idiomas soportados | Inglés (especializado en inglés británico del BNC 1994) |
| Licencia | Apache-2.0 (los pesos; el corpus BNC tiene su propia licencia y no se redistribuye) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder causal de la familia Qwen3 con aproximadamente 596 millones de parámetros, y se somete a un preentrenamiento continuo (continual pre-training) de parámetros completos sobre el British National Corpus 1994. No se trata de un fine-tuning por instrucciones ni de un ajuste con RLHF/DPO: el entrenamiento es puramente de modelado del lenguaje sobre texto continuo del corpus.

Los datos de entrenamiento provienen del BNC 1994, distribuido por el Oxford Text Archive, con transcripciones que conservan etiquetas de hablante (por ejemplo, `PS001:`, `PS002:`), lo que permite al modelo continuar diálogos multi-turno en formato de corpus. El entrenamiento se realizó en una única NVIDIA T4 (16 GB de VRAM) en Google Colab durante 500 pasos de optimización, procesando unos 32,8 millones de posiciones de token incluido padding. Como innovación técnica destacable cabe señalar la viabilidad del experimento en hardware de consumo y la evaluación rigurosa con `lm_eval==0.4.13`, incluyendo métricas específicas de corpus (perplejidad BNC, BNC-Cloze) junto a benchmarks generales zero-shot.

## Capacidades

- Modelado del lenguaje sobre inglés británico real: el modelo reduce la perplejidad del test del BNC de 21,32 a 19,65 respecto al modelo base.
- Continuación de conversaciones multi-hablante en el formato del corpus (etiquetas de hablante tipo `PS001:`), útil para simulación o análisis de diálogo.
- Completado de texto en texto plano, sin plantilla de chat ni capacidades de asistente.
- Rendimiento de gramática inglesa prácticamente intacto: BLiMP 81,1 % (frente a 81,0 % del base).
- Mejora ligera en razonamiento lector general (ARC-Easy: 60,9 % frente a 58,0 %).
- No está instruido: no sigue instrucciones de forma fiable, no soporta tool calling ni agentes (no disponible en la model card).
- No hay capacidades multimodales (visión, audio): es un modelo de texto puro.

## Casos de uso

- Investigación en lingüística de corpus: el modelo puede usarse para estimar la probabilidad de secuencias del inglés británico real, calcular sorpresa o perplejidad por ítem y contrastar hipótesis gramaticales o léxicas con BLiMP y cloze a nivel de palabra.
- Completado de transcripciones conversacionales: dado un fragmento de diálogo con etiquetas de hablante del formato BNC, el modelo genera continuaciones plausibles del turno siguiente, útil para anotación asistida o relleno de huecos en corpus de habla.
- Simulación de diálogo histórico (año 1994): al estar adaptado a un corpus de esa época, puede generar texto conversacional con rasgos léxicos y estilísticos del inglés británico de los noventa, útil en reconstrucción histórica o ficción interactiva.
- Estudios de adaptación de dominio: sirve como referencia reproducible de continual pre-training a pequeña escala (T4, 500 pasos), adecuada para docencia y experimentos didácticos sobre catastrophic forgetting y trade-offs de especialización.
- Evaluación de perplejidad condicionada: puede integrarse en pipelines con `lm_eval` para medir perplejidad sobre textos británicos, comparando variantes de modelo en tareas de procesamiento del inglés.
- Generación de datos sintéticos de habla británica: como modelo base, puede producir texto conversacional en inglés para aumentar datos en tareas de NLP sobre registro hablado, con revisión humana posterior.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación zero-shot con `lm_eval==0.4.13`; la pérdida se mide en nats por token predicho):

| Dataset | Métrica | Modelo base | Modelo adaptado a BNC |
|---|---|---:|---:|
| BNC test | Loss (↓) | 3,059 | 2,978 |
| BNC test | Perplejidad (↓) | 21,32 | 19,65 |
| BNC-Cloze | Exact match (↑) | 33,3 % | 34,3 % |
| BNC-Cloze | Log-probabilidad media del objetivo (↑) | −3,53 | −3,46 |
| HellaSwag | Normalised accuracy (↑) | 53,7 % | 52,2 % |
| ARC-Easy | Normalised accuracy (↑) | 58,0 % | 60,9 % |
| PIQA | Normalised accuracy (↑) | 69,9 % | 69,0 % |
| BLiMP | Accuracy (↑) | 81,0 % | 81,1 % |

La lectura clave: la especialización mejora claramente el dominio objetivo (BNC) y la gramática (BLiMP), con una ligera regresión en HellaSwag y PIQA, patrón típico de olvido catastrótico parcial en continual pre-training.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,2 GB en fp16 (tamaño del repo), más overhead de framework; cabe cómodamente en GPUs de 4 GB.
- GPU recomendadas: cualquier GPU CUDA moderna; el propio entrenamiento se realizó en una NVIDIA T4 de 16 GB en Google Colab, por lo que la inferencia es trivial en comparación.
- Consumer GPUs: sí, funciona en prácticamente cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090, etc.) e incluso es viable en CPU, aunque la model card solo documenta el camino CUDA.
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM`); al ser compatible con safetensors y la arquitectura Qwen3, debería funcionar también con vLLM, llama.cpp (previa conversión a GGUF) y Ollama, aunque no hay soporte oficial documentado.
- Latencia y throughput: no disponible; por su tamaño (~0,6 B de parámetros en fp16), se espera inferencia rápida incluso en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Especialización | Licencia | Contexto |
|---|---|---|---|---|
| Qwen3-0.6B-BNC (este modelo) | 596 M | Continual pre-training sobre BNC 1994 (inglés británico) | Apache-2.0 | No disponible |
| Qwen/Qwen3-0.6B-Base (base) | ~600 M | Modelo base generalista multilingüe | Apache-2.0 | No disponible en la ficha original |
| Qwen/Qwen3-0.6B (instruido) | ~600 M | Chat / instrucciones, modo thinking | Apache-2.0 | No disponible en la ficha original |

En la misma categoría de modelos de ~0,5-1 B de parámetros existen alternativas como Qwen2.5-0.5B, Llama 3.2-1B o SmolLM2-360M/1.7B, pero ninguna está especializada en el BNC; para tareas sobre ese corpus concreto, este modelo ofrece la menor perplejidad publicada entre los comparados (19,65 frente a 21,32 del base). Datos comparativos detallados de contexto y benchmarks de los competidores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente: es un modelo base de completado de texto. No sigue instrucciones de forma fiable y no debe usarse con plantillas de chat.
- Riesgo de alucinación y repetición: la propia model card advierte de que el texto generado puede contener repeticiones o errores factuales.
- Sesgo temporal y de dominio: el modelo está adaptado a un corpus de 1994; su léxico y registro reflejan el inglés británico de esa época y pueden resultar arcaicos o desfasados para usos actuales.
- Sesgos del corpus: el BNC refleja los sesgos demográficos y sociales de sus recolectores y hablantes en el Reino Unido de los noventa, que el modelo puede amplificar en sus generaciones.
- Efectos mixtos en benchmarks generales: pierde algo de rendimiento en HellaSwag (53,7 % → 52,2 %) y PIQA (69,9 % → 69,0 %), señal de olvido parcial de capacidades generales.
- Idioma: especializado en inglés; no es adecuado para castellano ni otros idiomas.
- Licencia del corpus: aunque los pesos son Apache-2.0, el BNC no se redistribuye y debe obtenerse del Oxford Text Archive respetando sus términos de licencia; los usos derivados del entrenamiento pueden estar condicionados por esa licencia.
- Contexto largo y tool calling: no disponibles ni documentados; no es un modelo pensado para agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jinyuan6/qwen3-0.6b-bnc
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- British National Corpus 1994 (Oxford Text Archive): https://llds.ling-phil.ox.ac.uk/llds/xmlui/handle/20.500.14106/2554?show=full
