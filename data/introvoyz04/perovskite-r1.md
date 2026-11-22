# introvoyz04/Perovskite-R1

## Resumen

Perovskite-R1 es un modelo de lenguaje de gran tamano especializado en el dominio de las celulas solares de perovskita, con un foco particular en aditivos de precursores. Lo desarrolla el autor identificado en Hugging Face como introvoyz04 y se obtiene mediante un ajuste fino supervisado (LoRA) sobre Qwen/QwQ-32B, un modelo de razonamiento de 32.763.876.352 parametros. Su proposito es asistir a investigadores y cientificos de materiales en la formulacion de perovskitas, la seleccion de aditivos y el diseno experimental.

El modelo conserva la arquitectura transformer decoder-only de QwQ-32B y hereda su capacidad de razonamiento paso a paso, pero se especializa mediante un corpus curado de literatura cientifica, conjuntos de datos experimentales y bases de datos de compuestos relacionados con aditivos de precursores. Se publica bajo licencia Apache 2.0 y el repositorio ocupa 65,5 GB en formato safetensors.

Es relevante porque ejemplifica la tendencia de modelos de dominio cientifico construidos sobre bases de razonamiento abiertas, con dataset y codigo publicados, lo que facilita la reproducibilidad. La model card advierte explicitamente que el uso fuera del dominio de las perovskitas puede producir sugerencias poco fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/QwQ-32B) |
| Parametros totales | 32.763.876.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de QwQ-32B; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de QwQ-32B, un transformer decoder-only de 32.700 millones de parametros orientado al razonamiento. Sobre esa base se aplica un ajuste fino por instrucciones con LoRA en todas las matrices de pesos, con rango 16, alpha 32 y dropout 0,1. El entrenamiento se realiza en precision bfloat16, con batch por dispositivo de 1 y acumulacion de gradientes de 8, tasa de aprendizaje inicial de 1e-4 con decaimiento coseno y un 5 % de warmup, durante 10 epocas. Se emplea FlashAttention2 para mejorar la eficiencia y el uso de memoria.

Los datos de entrenamiento consisten en una coleccion curada de literatura cientifica, conjuntos de datos experimentales y recursos publicos sobre aditivos de precursores en celulas solares de perovskita, incluyendo articulos de investigacion y bases de datos de compuestos, con foco en sintesis, efectos de aditivos y rendimiento del dispositivo. El dataset esta publicado en Hugging Face (JH976/Perovskite-R1). La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; el ajuste descrito es exclusivamente LoRA supervisado.

## Capacidades

- Generacion de texto cientifico en ingles sobre formulacion de perovskitas y aditivos de precursores.
- Razonamiento paso a paso heredado de QwQ-32B, aplicado a problemas de quimica de materiales.
- Sugerencia de composiciones de materiales y evaluacion cualitativa del efecto de aditivos sobre el rendimiento del dispositivo.
- Apoyo al diseno experimental: propuesta de condiciones y experimentos a validar en laboratorio.
- Consulta sobre literatura cientifica del dominio, sintesis y mecanismos de aditivos.
- Capacidad multilingue: la model card declara solo ingles; no se documentan otras lenguas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica para este ajuste.
- Vision y audio: no soportados.

## Casos de uso

- Generacion de hipotesis sobre aditivos: el modelo propone candidatos de aditivos de precursor y justifica su mecanismo esperado a partir de la literatura del dominio, sirviendo como punto de partida para revision bibliografica.
- Diseno experimental asistido: dado un sistema de perovskita y un objetivo de rendimiento, sugiere condiciones de sintesis y variables a explorar, que el investigador valida despues en laboratorio.
- Revision y sintesis de literatura: resume hallazgos sobre efectos de aditivos concretos y ayuda a comparar resultados entre estudios, aprovechando su ajuste sobre corpus cientifico curado.
- Formulacion de perovskitas: asiste en la seleccion de combinaciones de precursores y proporciones, con explicaciones trazables a la literatura usada en el entrenamiento.
- Formacion y divulgacion cientifica: apoyo a estudiantes de doctorado y grupos de materiales para entender relaciones entre composicion, aditivo y rendimiento del dispositivo.
- Triaje de ideas antes de experimentar: filtra propuestas de aditivos poco plausibles o poco estudiados, reduciendo el coste de experimentos fallidos, siempre con validacion experta.
- Analisis de resultados experimentales: ayuda a interpretar tendencias de rendimiento y a redactar discusiones tecnicas en ingles para publicaciones del area.

## Benchmarks y rendimiento

La model card indica que el modelo se evaluo en un benchmark especifico de aditivos de precursores de celulas solares de perovskita y que muestra una alineacion superior con los hallazgos de la literatura frente a otros modelos en la misma prueba, con sugerencias consistentes sobre composicion de materiales y efectos de aditivos. Sin embargo, no se publican cifras numericas (MMLU, HumanEval, GSM8K ni metricas del benchmark de dominio) en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32.763.876.352 parametros, en bfloat16 se requieren aproximadamente 65 GB de VRAM solo para los pesos, mas memoria para KV cache y activaciones; en cuantizacion de 8 bits, en torno a 33-35 GB; en 4 bits, en torno a 17-20 GB. Estas estimaciones son calculos a partir del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: para bfloat16 completa, A100 80 GB o H100 80 GB; para 8 bits, A100 40 GB o dos RTX 4090/A6000; para 4 bits, una RTX 4090 de 24 GB puede ser suficiente para contextos moderados.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 bits en GPUs de 24 GB como la RTX 4090 o la RTX 3090, con limitaciones de contexto y velocidad.
- Opciones de despliegue: el autor menciona LLaMA-Factory o cualquier framework capaz de invocar modelos de lenguaje; para inferencia se puede usar vLLM, TGI o llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Perovskite-R1 | 32,76 B | no disponible | Perovskitas y aditivos de precursores | Apache 2.0 | Hugging Face (safetensors) |
| Qwen/QwQ-32B | 32,76 B | no disponible en la informacion | Generalista con razonamiento | Apache 2.0 | Hugging Face |
| Modelos cientificos de dominio (genericos) | no disponible | no disponible | Quimica y materiales | variable | no disponible |

La comparacion cuantitativa con alternativas de dominio no esta disponible: la informacion proporcionada no incluye resultados numericos de terceros ni modelos cientificos comparables con especificaciones detalladas. El unico contraste documentado es cualitativo, frente a "otros modelos" en el benchmark propio del autor.

## Limitaciones y advertencias

- Sesgo de literatura: el modelo puede reflejar tendencias y materiales sobrerrepresentados en la literatura publicada sobre perovskitas, infrarrepresentando aditivos poco estudiados.
- Riesgo de alucinacion: las condiciones experimentales sugeridas no estan verificadas; seguirlas sin validacion en laboratorio puede provocar experimentos fallidos o reacciones inseguras.
- Alcance restringido: disenado exclusivamente para aditivos de precursores en celulas solares de perovskita; su uso en otros dominios puede producir sugerencias poco fiables.
- Conocimiento limitado: no incluye investigacion posterior a los datos de entrenamiento.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado.
- No sustituye el juicio experto: no debe usarse para decisiones de seguridad o regulatorias sin revision humana y contraste con literatura revisada por pares.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del contenido cientifico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso comunitario y validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/introvoyz04/Perovskite-R1
- Dataset: https://huggingface.co/datasets/JH976/Perovskite-R1
- Preprint arXiv: https://arxiv.org/abs/2507.16307
- Version HTML del preprint: https://arxiv.org/html/2507.16307v1
- Articulo en Communications Materials: https://www.nature.com/articles/s43246-026-01099-9
- Repositorio GitHub: https://github.com/WD928/Perovskite-R1
- Modelo base: https://huggingface.co/Qwen/QwQ-32B
