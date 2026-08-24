# Quazim0t0/Byrne-15M-Looped

## Resumen

Byrne-15M-Looped es un modelo de lenguaje pequeño (~15,2M de parámetros activos) desarrollado por Quazim0t0 como prueba de concepto y smoke-test para la arquitectura Byrne-100M-Ultra-MC. El autor lo describe explícitamente como un "toy" y no como un producto final. Su propósito principal fue validar que el stack de entrenamiento funcionaba con un bucle de repetición (looping) antes de invertir el presupuesto de 114M de parámetros en el modelo más grande.

El modelo emplea una arquitectura SpikeWhale v2 con bucle de 3 pasadas (loop_count=3), lo que da una profundidad efectiva de 30 capas. Incluye MoE (mixture of experts), atención MQA con MLA, RoPE fractal, y un tokenizador byte-level Length-MAX. Se entrenó desde cero sobre UltraX-Preview (246M tokens en el checkpoint A/B de 40k pasos, 419M en el paso 68,25k), seguido de SFT sobre UltraChat y DPO sobre UltraFeedback. El contexto es de 1024 tokens.

La relevancia de este modelo es principalmente investigadora: demuestra que el bucle de repetición con weight-tying entrena de forma estable y reduce la repetición de muestreo frente a un baseline sin bucle, con una pérdida de validación menor (4,195 vs 4,231). No está pensado para uso en producción, sino como validación de arquitectura y punto de partida para la familia Byrne.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped decoder (SpikeWhale v2), MoE, MQA con MLA |
| Parametros totales | 18,9M |
| Parametros activos | 15,2M |
| Longitud de contexto | 1024 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch .pt |

## Arquitectura y entrenamiento

La arquitectura es un decoder con bucle de 3 pasadas (loop_count=3), lo que significa que cada capa se ejecuta tres veces con los mismos pesos, dando una profundidad efectiva de 30 capas. El modelo usa MoE con 4 expertos enrutados y 1 experto compartido, top-2, con ancho de FFN de 160. La atención es MQA con 8 cabezas y 1 KV, con head dim 64 (32 RoPE + 32 NoPE). Incluye además RoPE fractal (γ=1), Elo, Engram (tabla de 1024), HRM refine ×3 con deep supervision, cabeza de abstinencia, XSA e hiperconexiones. No incluye Memory Cache, que es una característica reservada para Ultra-MC.

El tokenizador es byte-level Length-MAX, basado en el trabajo de Dong & Su (arXiv:2511.20849), con un vocabulario de 16.512 tokens. Los embeddings están atados (tie embeddings). El entrenamiento se realizó en tres fases: pretrain sobre UltraX-Preview (UltraX-Ultra-FineWeb) con batch 6, seq 1024, lr 6e-4 y cosine schedule; SFT sobre UltraChat (10k pasos, batch 8, block 1024); y DPO sobre UltraFeedback (1k pasos, β=0,1). El checkpoint base con menor byte_ppl es el que se puntúa en los benchmarks.

## Capacidades

- Generación de texto en inglés con fluidez básica, aunque con conocimiento factual débil.
- Continuación de texto (modelo base) y formato ChatML (checkpoints SFT/DPO).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: el bucle de repetición reduce la repetición de muestreo frente a un baseline sin bucle (repetición 0,011 vs 0,049 en el A/B de 40k pasos).
- El modelo DPO muestra ligeras mejoras en tareas de sentido común (PIQA, BoolQ) a costa de un peor PPL.

## Casos de uso

- Validación de arquitectura: el modelo sirve como banco de pruebas para verificar que el bucle de repetición con weight-tying entrena de forma estable y produce mejores resultados que un baseline sin bucle. Es útil para investigadores que quieran estudiar el efecto del looping en modelos pequeños.
- Investigación en eficiencia de parámetros: con solo 15,2M de parámetros activos, permite estudiar cómo el bucle de repetición multiplica la profundidad efectiva sin aumentar el número de parámetros, lo que puede informar diseños de modelos más grandes.
- Experimentación con tokenizadores byte-level: el tokenizador Length-MAX (vocab 16.512) es una implementación de referencia para quien quiera probar este enfoque de tokenización en tareas de generación de texto.
- Benchmarking de modelos pequeños: los resultados en WikiText-2, BLiMP, ARC, HellaSwag, etc. proporcionan una referencia para comparar otras arquitecturas de tamaño similar.
- Estudio de DPO en modelos pequeños: el checkpoint DPO seg1 permite analizar cómo el DPO afecta a métricas de sentido común y PPL en un modelo de 15M, un régimen poco estudiado.
- Educación y prototipado: por su tamaño reducido, puede ejecutarse en CPU o GPU de gama baja, lo que lo hace útil para demostraciones docentes o para validar pipelines de inferencia antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | base | DPO seg1 | chance |
|---|---|---|---|
| WikiText-2 byte_ppl ↓ | **2.943** | 3.014 | — |
| BLiMP acc ↑ | **0.734** | 0.711 | 0.50 |
| arc_easy acc | **0.335** | 0.325 | 0.25 |
| arc_easy acc_norm | **0.328** | 0.326 | 0.25 |
| arc_challenge acc | **0.182** | 0.179 | 0.25 |
| arc_challenge acc_norm | 0.224 | **0.232** | 0.25 |
| hellaswag acc | 0.267 | **0.269** | 0.25 |
| hellaswag acc_norm | **0.272** | 0.271 | 0.25 |
| winogrande acc | 0.509 | **0.512** | 0.50 |
| piqa acc | 0.533 | **0.554** | 0.50 |
| piqa acc_norm | 0.521 | **0.539** | 0.50 |
| openbookqa acc | 0.126 | **0.138** | 0.25 |
| openbookqa acc_norm | 0.248 | **0.262** | 0.25 |
| boolq acc | 0.378 | **0.397** | 0.50 |
| ArithMark-3.0 acc | **0.345** | 0.322 | 0.25 |
| ArithMark-3.0 acc_norm | **0.347** | 0.327 | 0.25 |

El modelo base gana en métricas de modelado de lenguaje (PPL, BLiMP) y aritmética, mientras que el DPO mejora ligeramente tareas de sentido común (PIQA, BoolQ) a costa de un peor PPL. La mayoría de las tareas de opción múltiple están cerca del azar, lo que refleja el tamaño reducido del modelo. En el A/B de 40k pasos (246M tokens), el modelo con bucle obtuvo val loss 4,195 frente a 4,231 del baseline sin bucle, y una repetición de muestreo de 0,011 frente a 0,049.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~19M parámetros en FP32, ocupa aproximadamente 75 MB. Con cuantización a 8 bits, cabría en menos de 20 MB. No se han publicado requisitos oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna (incluso integradas) puede ejecutar este modelo.
- Opciones de despliegue: el repositorio incluye un script `generate.py` para inferencia directa. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, pero al ser un modelo pequeño, podría adaptarse fácilmente.
- Latencia y throughput: no disponible. Dado el tamaño, la latencia será de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Byrne-15M-Looped | 15,2M activos / 18,9M totales | 1024 | Apache 2.0 | Bucle de 3 pasadas, MoE, MLA |
| Byrne-86M | 86M | 4096 | Apache 2.0 | Modelo hermano, sin bucle, contexto mayor |
| Byrne-100M-Ultra-MC | ~100M | no disponible | Apache 2.0 | Modelo objetivo, incluye Memory Cache |

No se dispone de benchmarks comparativos publicados entre estos modelos. El Byrne-15M-Looped es un subconjunto de validación del stack de Ultra-MC, por lo que no es directamente comparable en rendimiento con modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (15M): el conocimiento factual es débil y las tareas de opción múltiple están cerca del azar. No es adecuado para tareas que requieran razonamiento complejo o conocimiento enciclopédico.
- Capacidad de código limitada: el autor indica explícitamente que la generación de código es débil.
- Contexto limitado a 1024 tokens, lo que restringe su uso en tareas que requieran contexto largo.
- Solo inglés: no soporta otros idiomas.
- El checkpoint DPO seg1 es una sonda experimental, no un producto de chat. El autor advierte que no es un chat productivo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción.
- No se han publicado resultados de cuantización ni pruebas de latencia en entornos de producción.
- El modelo base continúa texto sin formato; los checkpoints SFT/DPO usan ChatML, pero no son un asistente conversacional completo.

## Enlaces

- [HuggingFace: Quazim0t0/Byrne-15M-Looped](https://huggingface.co/Quazim0t0/Byrne-15M-Looped)
- [HuggingFace: Byrne-100M-Ultra-MC](https://huggingface.co/Quazim0t0/Byrne-100M-Ultra-MC)
- [HuggingFace: Byrne-86M](https://huggingface.co/Quazim0t0/Byrne-86M)
- [arXiv: Length-MAX Tokenizer for Language Models (2511.20849)](https://arxiv.org/abs/2511.20849)
- [Perfil de Quazim0t0 en HuggingFace](https://huggingface.co/Quazim0t0)
