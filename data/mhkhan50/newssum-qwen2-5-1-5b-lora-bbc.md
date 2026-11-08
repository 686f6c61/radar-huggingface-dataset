# MHkhan50/newssum-qwen2.5-1.5b-lora-bbc

## Resumen

NewsSum V2 es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, desarrollado por Muzammal Hussain (usuario MHkhan50) como parte del estudio NewsSum-Bench. El modelo está especializado en resumen extractivo de noticias en inglés y se entrenó sobre el dataset BBC News Summary, compuesto por artículos de la BBC de 2004 y 2005. No es un modelo de propósito general: es un checkpoint de investigación (seed 0) pensado para comparar baselines extractivos clásicos, transformers afinados y un LLM pequeño bajo una metodología sin fuga de datos.

El adaptador modifica un transformer decoder-only de 1.500 millones de parámetros con una ventana de contexto nativa de 32.768 tokens (heredada de Qwen2.5). El entrenamiento se realizó con LoRA de rango 16 sobre todas las capas lineales, durante 3 épocas, en una única NVIDIA T4 en unos 70 minutos. El resultado es un modelo que selecciona y copia frases del artículo original en el estilo de la BBC, no un resumen abstractivo corto.

Su relevancia es metodológica más que de producto: el paper asociado demuestra que un baseline TextRank ajustado por longitud (82,9 ROUGE-Lsum) supera al modelo afinado (64,9 ± 0,5 ROUGE-Lsum en tres semillas), lo que cuestiona el uso de referencias extractivas para evaluar sistemas de resumen. El modelo sirve como referencia reproducible para ese debate y como ejemplo de adaptación LoRA económica sobre un LLM pequeño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (rank 16, alpha 32) |
| Parámetros totales | 1.500 millones (modelo base); adaptador LoRA no cuantificado en la información |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | No especificados por el autor; el base Qwen2.5 admite GGUF/AWQ/GPTQ vía ecosistema, pero no se validaron para este adaptador |
| Idiomas soportados | Inglés (entrenamiento y evaluación); el base Qwen2.5 es multilingüe, pero el ajuste es monolingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT); requiere cargar el base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only con atención causal, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre él se aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 en todas las capas lineales, con pesos base en fp16. El entrenamiento usó AdamW con learning rate 2e-4, batch efectivo de 16 y 3 épocas; la pérdida se calcula únicamente sobre los tokens del resumen. No se aplicó RLHF ni DPO adicional: el ajuste es supervisado sobre pares artículo-resumen.

Los datos provienen del dataset BBC News Summary (2.225 artículos, cinco temáticas, 2004-2005). Se eliminaron 154 artículos casi duplicados y se fijó un split estratificado 70/15/15: 1.449 de entrenamiento, 311 de validación y 311 de test. Los titulares se retiraron de la entrada. El prompt de entrenamiento solicita un resumen de aproximadamente 0,455 × la longitud del artículo en palabras. Dato crítico: el 94,8% de las referencias son frases copiadas literalmente del artículo, con una longitud media del 45% del original, de modo que el modelo aprende selección y copia, no abstracción.

## Capacidades

- Generación de resumen extractivo de noticias en inglés, con presupuesto de longitud controlado por prompt (fracción de la longitud del artículo).
- Copia fiel de nombres, cifras y entidades presentes en el texto fuente; el autor reporta una reducción de cifras inventadas del 7,8% (zero-shot) al 0,8% tras el ajuste.
- Formato conversacional mediante plantilla de chat de Qwen2.5 (apply_chat_template), con un único turno de usuario en el uso previsto.
- Generación determinista recomendada (do_sample=False) para reproducibilidad.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso específico para este adaptador.
- Sin capacidades de visión ni audio.
- Multilingüismo no validado: el ajuste y la evaluación son exclusivamente en inglés.

## Casos de uso

- Resumen de noticias en pipelines de monitorización de medios: el modelo recibe un artículo y devuelve un resumen de longitud proporcional (≈45% del original), útil para generar fichas de prensa en inglés con estilo consistente y cifras verificables.
- Generación de sumarios para archivos históricos de noticias: dado el entrenamiento sobre BBC 2004-2005, encaja en proyectos de digitalización y catalogación de hemerotecas anglófonas de esa época.
- Baseline reproducible en investigación sobre resumen: sirve como punto de comparación frente a TextRank, BART o PEGASUS en experimentos con el split publicado en el repositorio, garantizando ausencia de fuga de datos.
- Extracción de frases clave para indexación: al comportarse como extractor, sus salidas pueden usarse como snippets indexables en motores de búsqueda internos de noticias.
- Prototipado de bajo coste en una sola GPU: al ser un adaptador LoRA sobre un modelo de 1,5B, permite iterar en una T4 o RTX 4090 sin infraestructura dedicada.
- Evaluación de métricas de resumen: útil para estudiar la brecha entre ROUGE/BERTScore y calidad percibida cuando la referencia es extractiva, tal como plantea el paper asociado.
- Docencia sobre fine-tuning eficiente: ejemplo completo y reproducible de LoRA con PEFT, transformers y un dataset público, con código y splits disponibles.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 311 artículos del test (checkpoint seed 0):

| Métrica | Valor |
|---|---|
| ROUGE-1 | 66,7 |
| ROUGE-2 | 54,6 |
| ROUGE-L | 41,8 |
| ROUGE-Lsum | 65,5 |
| BERTScore | 48,6 |
| Longitud media del resumen (palabras) | 161 |

Comparación reportada en la model card:

| Sistema | ROUGE-Lsum |
|---|---|
| TextRank ajustado por longitud (sin entrenamiento) | 82,9 |
| NewsSum V2 (este adaptador, media de 3 semillas) | 64,9 ± 0,5 |
| Qwen2.5-1.5B-Instruct zero-shot | 38,3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni evaluación humana.

## Requisitos de hardware

- VRAM estimada: en fp16, el modelo base de 1,5B ocupa aproximadamente 3 GB de pesos más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados. En cuantización de 8 bits, en torno a 2 GB; en 4 bits, alrededor de 1,2-1,5 GB. Estas cifras son estimaciones según el tamaño del base, no medidas publicadas por el autor.
- GPU recomendadas: NVIDIA T4 (la usada en el entrenamiento), RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, A100 y H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más en fp16 y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: transformers + PEFT (la vía documentada), vLLM y TGI con soporte de adaptadores LoRA, llama.cpp/Ollama fusionando el adaptador previamente (no documentado por el autor).
- Latencia y throughput: no disponibles. El único dato de cómputo publicado es el tiempo de entrenamiento (≈70 minutos en una T4 para 3 épocas sobre 1.449 ejemplos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROUGE-Lsum (BBC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NewsSum V2 (este) | 1,5B + LoRA | 32.768 | 64,9 ± 0,5 | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct zero-shot | 1,5B | 32.768 | 38,3 | Apache 2.0 | Hugging Face |
| TextRank ajustado por longitud | No neuronal | No aplica | 82,9 | No aplica (algoritmo) | Implementación propia |
| Transformers afinados del estudio NewsSum-Bench | No disponible en la información | No disponible | No disponible en la información | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio muy estrecho: entrenado con unas 1.450 noticias de la BBC de 2004-2005 en cinco temáticas; el estilo y los temas fuera de ese corpus degradan la calidad.
- Comportamiento extractivo: aprende a seleccionar y copiar frases (las referencias son literales en el 94,8% de los casos), no a producir resúmenes abstractivos breves.
- Evaluación limitada: solo ROUGE y BERTScore contra una referencia extractiva por artículo; no hay evaluación humana ni medida de fidelidad factual.
- Riesgo de alucinación residual: el autor reporta un 0,8% de casos con cifras no presentes en el artículo tras el ajuste, no cero.
- Sesgos no evaluados: no se documenta análisis de sesgo de género, político o geográfico, pese a tratarse de contenido periodístico.
- Restricciones de uso: los artículos de la BBC están protegidos por copyright; el autor indica que el modelo es para investigación y educación. La licencia Apache 2.0 cubre los pesos del adaptador, pero no el corpus de entrenamiento.
- Idiomas: solo inglés; no se garantiza comportamiento correcto en castellano u otras lenguas.
- Sin soporte documentado de tool calling ni uso agéntico; la plantilla de chat admite un único turno de usuario en el flujo previsto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MHkhan50/newssum-qwen2.5-1.5b-lora-bbc
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base (pretrained): https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio del proyecto NewsSum-Bench: https://github.com/MHKhan50/NewsSum-Bench
- Splits del dataset: https://github.com/MHKhan50/NewsSum-Bench/blob/main/results/splits.csv
- Paper (Zenodo): https://doi.org/10.5281/zenodo.24046039
- Dataset BBC News Summary: https://www.kaggle.com/datasets/pariza/bbc-news-summary
