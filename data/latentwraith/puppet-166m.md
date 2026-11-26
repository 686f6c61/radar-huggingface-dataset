# LatentWraith/Puppet-166M

## Resumen

Puppet-166M es un modelo de lenguaje causal de 166 millones de parámetros desarrollado por el autor independiente LatentWraith. Se trata de un experimento arquitectónico que combina módulos Mamba2 (modelos de espacio de estados) con un mecanismo de generación de pesos (*weight generation*) mediante hiperred, eliminando por completo el uso de atención clásica. El objetivo declarado es comprobar si una arquitectura no convencional puede competir con transformers de tamaño similar.

El modelo se entrenó desde inicialización aleatoria durante aproximadamente 3.500 millones de tokens, siguiendo la regla de Chinchilla para su recuento de parámetros, alcanzando una pérdida de validación de 3,425 nats. Su rasgo más distintivo es la generación dinámica de matrices de pesos específicas para cada vector latente, en lugar de emplear un conjunto fijo de parámetros, mediante un esquema de generación escalonada (*stepped*) que reparte el coste paramétrico en múltiples generadores más pequeños.

Es relevante como caso de estudio de investigación en arquitecturas alternativas a la atención, no como modelo de producción: sus resultados en benchmarks quedan por debajo de modelos más pequeños y mucho más entrenados como Pythia-160M o GPT-2 Small, y el propio autor lo califica de experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: Mamba2 (SSM) + generación de pesos escalonada mediante hiperred, sin atención |
| Parámetros totales | 166 millones (166×10^6) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en formato .pth; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

Puppet-166M sustituye la atención por bloques compuestos por un módulo Mamba2, un generador de pesos y una matriz de mezcla (*shuffle matrix*). El generador de pesos no produce la matriz completa D×D, sino que divide el vector latente en D_m secciones y genera para cada una una submatriz de tamaño (D/D_m)×(D/D_m); el resultado equivale a una matriz con bloques densos en la diagonal. La matriz de mezcla posterior permite que la información de distintas secciones interactúe entre transformaciones secuenciales, corrigiendo la limitación de los bloques independientes. Este escalonado distribuye el coste paramétrico (que en generación de pesos completa crece con D^3) y permite intercalar más módulos Mamba2.

El entrenamiento se realizó sobre aproximadamente 3.500 millones de tokens de varios shards de la sección de 2018 de FineWeb (de un conjunto de unos 5.000 millones de tokens, muestreados aleatoriamente), con un tamaño de lote efectivo de 524.288 tokens, optimizador AdamW con betas (0,9; 0,95), tasa de aprendizaje de 1e-4 con decaimiento lineal final (esquema WSD) y 14.000 pasos de optimizador. El autor señala como principal defecto la elección del dataset, que introduce sesgo temporal al provenir de un único año. No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en inglés, como modelo base preentrenado.
- Modelado de lenguaje autoregresivo sin atención, mediante módulos de espacio de estados.
- Generación dinámica de transformaciones de pesos condicionadas al vector latente (capacidad arquitectónica, no de uso final).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingüismo: no disponible; solo se declara inglés.
- No dispone de modo de razonamiento (*thinking*), visión ni audio.
- No es un modelo ajustado por instrucciones: no cabe esperar seguimiento fiable de instrucciones conversacionales.

## Casos de uso

- Investigación en arquitecturas sin atención: servir como referencia reproducible para estudiar la generación de pesos escalonada frente a Mamba2 estándar y transformers, comparando pérdida de validación y retención de contexto.
- Experimentación académica con hiperredes: el código de definición (`main.py`) y los pesos permiten analizar cómo varían las matrices generadas en función del latente de entrada.
- Reproducción de pipelines de preentrenamiento a pequeña escala: el modelo documenta configuración de lote, optimizador y esquema de tasa de aprendizaje, útil como plantilla para entrenamientos de ~3.500 millones de tokens con recursos limitados.
- Estudio de eficiencia paramétrica: comparar el coste D^3 de la generación de pesos completa frente al esquema escalonado con `matrix_div`.
- Evaluación de sesgo temporal en datos: al entrenarse solo con FineWeb 2018, puede emplearse para medir el impacto del sesgo de año en modelos pequeños.
- Docencia y divulgación: ejemplo didáctico de modelo de lenguaje funcional sin atención, con resultados de benchmarks publicados y comparables.

## Benchmarks y rendimiento

| Modelo | HellaSwag | PIQA | WinoGrande | Arc Easy | Parámetros | Tokens de entrenamiento |
|---|---|---|---|---|---|---|
| Puppet-166M | 28,73 % | 61,04 % | 51,22 % | 34,18 % | 166×10^6 | 3,5×10^9 |
| Pythia-160M | 31,40 % | 61,64 % | 53,12 % | 39,65 % | 160×10^6 | 300×10^9 |
| GPT-2 Small | 31,14 % | 62,51 % | 51,62 % | 39,48 % | 124×10^6 | 10×10^9 |

Precisión expresada como `acc_norm` cuando está disponible; en caso contrario, `acc`. El autor indica que la mayor diferencia frente a los modelos convencionales es de 5,47 puntos porcentuales en Arc Easy.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,7 GB; con pesos en fp32 (166 M de parámetros) la inferencia requiere aproximadamente 0,7-1 GB de VRAM, más memoria para activaciones y contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: los pesos se publican únicamente en formato PyTorch (.pth) con definición en `main.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, por lo que el despliegue requiere cargar el modelo con PyTorch y código propio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HellaSwag | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Puppet-166M | 166 M | No disponible | 28,73 % | MIT | Pesos .pth en Hugging Face |
| Pythia-160M | 160 M | 2.048 tokens (estándar de la familia Pythia) | 31,40 % | Apache 2.0 | Pesos en Hugging Face, integración amplia |
| GPT-2 Small | 124 M | 1.024 tokens | 31,14 % | MIT | Pesos en Hugging Face, amplio ecosistema |

Puppet-166M queda por debajo de ambos en todos los benchmarks publicados, con un presupuesto de entrenamiento muy inferior (3.500 millones de tokens frente a 300.000 millones de Pythia-160M y 10.000 millones de GPT-2 Small).

## Limitaciones y advertencias

- Rendimiento inferior a modelos de tamaño similar en HellaSwag, PIQA, WinoGrande y Arc Easy.
- Entrenado con solo ~3.500 millones de tokens, muy por debajo de modelos comparables; el propio autor lo describe como un primer modelo convergido.
- Sesgo temporal por el uso de shards de la sección de 2018 de FineWeb, lo que puede infrarepresentar vocabulario y conceptos posteriores.
- Riesgo elevado de alucinación y baja calidad en generación libre dado su reducido entrenamiento y su naturaleza de modelo base sin ajuste por instrucciones.
- Solo inglés; sin capacidades multilingües documentadas.
- Longitud de contexto no documentada; la retención de contexto fue un problema en la iteración anterior del autor.
- Pesos únicamente en .pth: no hay conversión a GGUF ni safetensors, lo que complica el despliegue en herramientas estándar.
- Licencia MIT: permite uso comercial, pero el estado experimental y la calidad del modelo desaconsejan su uso en producción.
- Modelo marcado explícitamente como experimental por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentWraith/Puppet-166M
- Paper de Mamba (referencia arquitectónica): https://arxiv.org/abs/2312.00752
- Paper de Attention Is All You Need (referencia citada): https://arxiv.org/abs/1706.03762
- Paper de Weight Generation / HyperNetworks (referencia citada): https://arxiv.org/abs/1609.09106
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Modelo de comparación Pythia-160M: https://huggingface.co/EleutherAI/pythia-160m
- Modelo de comparación GPT-2 Small: https://huggingface.co/openai-community/gpt2
