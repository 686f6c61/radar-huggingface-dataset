# gdm32569/ternary-c64-688k

## Resumen

ternary.c64 es un modelo de lenguaje de arquitectura llama2 con pesos ternarios (−1, 0, +1), desarrollado por el usuario gdm32569 y publicado en HuggingFace. Su particularidad no es el rendimiento, sino el objetivo de despliegue: ejecutar inferencia completa en un Commodore 64 sin expansión de memoria, con todos los pesos alojados en un cartucho EasyFlash con bancos conmutados. El modelo tiene 688.128 pesos ternarios más embeddings de 65.536 parámetros (820.352 parámetros totales según safetensors), 4 capas, dimensión 128 y una ventana de contexto de 128 tokens.

Se entrena desde cero sobre el dataset TinyStories con el `train.py` de llama2.c parcheado para usar BitLinear, la técnica de cuantización ternaria del linaje BitNet. No es un modelo pensado para producción ni para uso general: es una demostración de ingeniería de sistemas que combina cuantización extrema, aritmética de punto fijo int16 y optimización a nivel de ciclo de CPU para hardware de 8 bits.

Es relevante ahora como referencia técnica para quienes investigan inferencia de bajo consumo, cuantización ternaria aplicada a transformers pequeños y técnicas de despliegue en hardware retro o embebido con recursos extremadamente limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | llama2 (llama2.c) con RMSNorm, RoPE y SwiGLU; pesos ternarios en atención y FFN |
| Parámetros totales | 820.352 (688.128 ternarios + 65.536 embeddings + 1.152 de normas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | Ternaria (−1, 0, +1) con escala por tensor en atención y FFN; embeddings int8 en C64; float32 en safetensors original |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), model_ternary.bin (formato TC64, 242 KB), gen.crt (imagen EasyFlash, 361 KB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura llama2 tal como la implementa llama2.c: 4 capas, dimensión 128, 8 cabezas de atención con 1 KV head (multi-query attention), FFN oculta de 352, vocabulario de 512 tokens con SentencePiece y contexto de 128 tokens. Las matrices de atención y feed-forward son ternarias, con una escala por tensor calculada sobre la mediana de |W|. Los embeddings están atados a la cabeza de salida y se almacenan en int8 en el Commodore 64.

El entrenamiento se realizó desde cero sobre TinyStories con el script de llama2.c parcheado mediante `patch_train.py` para usar BitLinear: estimador de gradiente directo (straight-through estimator) y cuantización en cada paso forward. Se ejecutaron 20.000 iteraciones con batch efectivo de 128×4 (acumulación de gradiente), 128 tokens por secuencia, learning rate 5e-4 con decaimiento coseno y 1.000 pasos de warmup, weight decay 0.1, AdamW con β=(0.9, 0.95), recorte de gradiente 1.0 y precisión float16. La pérdida de validación final fue 1,4390. El autor documenta que a dimensión 64 el modelo ternario era inutilizable (pérdida 2,25 frente a 1,81 del baseline float), mientras que a dimensión 128 supera al baseline float de un tamaño inferior.

En el lado del despliegue, la innovación principal es la implementación en C64: aritmética int16 Q5.10 sin coma flotante, tablas de búsqueda de 4.096 bytes para SiLU, exp, raíz cuadrada inversa y rotaciones RoPE, y un kernel ternario sin multiplicaciones que usa una tabla de las nueve sumas posibles ±xa ±xb para resolver cada byte de pesos empaquetados en dos lecturas de tabla (21 ciclos por MAC). La atención usa un MAC de cuarto de cuadrado en ensamblador (81 ciclos por MAC).

## Capacidades

- Generación de texto en inglés a nivel de frases simples, entrenado específicamente sobre TinyStories.
- Continuación de texto a partir de un prompt tokenizado en la propia máquina.
- Inferencia determinista con temperatura 0.0 que reproduce token a token la salida en coma flotante del PC.
- Tokenización en el dispositivo mediante SentencePiece (512 tokens) y vocabulario en texto plano.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüe: no, solo inglés.

## Casos de uso

- Demostración educativa de cuantización ternaria: sirve para ilustrar cómo BitLinear y el estimador de gradiente directo permiten entrenar un transformer funcional con pesos de −1, 0 y +1, comparando la pérdida frente al baseline float.
- Referencia para inferencia en hardware embebido: el código de C64 muestra cómo implementar un forward pass completo con aritmética int16 de punto fijo y tablas de búsqueda, aplicable a microcontroladores y DSP con recursos limitados.
- Estudio de retrocomputación: permite ejecutar un transformer real en un Commodore 64 con cartucho EasyFlash, útil para docencia y divulgación sobre arquitecturas de 8 bits.
- Benchmark de técnicas de empaquetado de pesos: el formato TC64 de 242 KB y la imagen de cartucho de 361 KB sirven como caso de estudio de compresión extrema con preservación de salida.
- Validación de portabilidad numérica: la coincidencia bit a bit entre la implementación float y la int16 permite usar el modelo como test de regresión para emuladores y compiladores.
- Prototipado de generación de cuentos infantiles: con el vocabulario y dominio de TinyStories, puede generar micro-relatos simples en inglés en entornos sin GPU, aunque con latencia de decenas de segundos por palabra en C64.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| ternary.c64 | TinyStories | validation loss | 1,439 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

En cuanto a rendimiento de inferencia en C64, el autor documenta aproximadamente una palabra cada 40 segundos: 39,2 s al inicio y 45,9 s con contexto completo, con 24 minutos y 5 segundos para generar la frase de referencia de 34 tokens. Cada token del prompt requiere un forward pass completo.

## Requisitos de hardware

- VRAM para inferencia en GPU: despreciable; los pesos en float32 ocupan aproximadamente 3,3 MB y en formato ternario 242 KB.
- GPU recomendadas: cualquiera, incluida una GPU integrada; no requiere aceleración dedicada.
- Cabe en cualquier GPU consumer, e incluso en CPU sin problemas.
- Despliegue en Commodore 64 real o emulado: cartucho EasyFlash de 361 KB (22 bancos de 16 KB), 256 bytes de RAM libre; probado solo en VICE 3.10 (`x64sc`, cycle-accurate), no en hardware real.
- Despliegue en PyTorch: requiere llama2.c (`model.py`), `bitpatch.py`, safetensors y sentencepiece; variable de entorno `TERNARY=1` para activar BitLinear.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI): no disponibles; el modelo no está integrado en esos ecosistemas.
- Latencia en C64: aproximadamente 39-46 segundos por palabra; en PyTorch sobre CPU/GPU es prácticamente instantánea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Despliegue |
|---|---|---|---|---|---|
| ternary.c64 | 820.352 | 128 | Ternaria (−1, 0, +1) | MIT | C64 (EasyFlash) y PyTorch |
| Baseline float llama2.c dim 128 (referencia del autor) | similar | 128 | float | no disponible | PyTorch |
| Modelos TinyStories estándar (p. ej. variantes llama2.c) | variable, típicamente 1-15M | 128-256 | float | variable | PyTorch, llama.cpp |

La comparación directa con modelos de producción no es significativa por la diferencia de escala y propósito. El baseline float de dimensión 128 se menciona solo como referencia interna del autor; no se dispone de datos públicos de benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: entrenado exclusivamente con TinyStories, genera texto infantil simple y no responde a instrucciones complejas.
- Ventana de contexto de solo 128 tokens, insuficiente para conversaciones multi-turno o documentos.
- Solo inglés; no soporta otros idiomas.
- Riesgo alto de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- No dispone de alineamiento mediante RLHF o DPO; no hay garantías de comportamiento seguro.
- La implementación en C64 solo se ha probado en el emulador VICE, no en hardware real; el propio autor marca esa afirmación como no verificada.
- La latencia en C64 (decenas de segundos por palabra) lo hace inviable para uso interactivo.
- Licencia MIT permite uso comercial, pero el modelo carece de utilidad práctica más allá de demostración e investigación.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/gdm32569/ternary-c64-688k
- Repositorio GitHub: https://github.com/demartinogiuseppe/ternary.c64
- Script de exportación ternaria: https://github.com/demartinogiuseppe/ternary.c64/blob/main/src/export_ternary.py
- Script de parcheo de entrenamiento: https://github.com/demartinogiuseppe/ternary.c64/blob/main/src/patch_train.py
- llama2.c (Karpathy): https://github.com/karpathy/llama2.c
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
