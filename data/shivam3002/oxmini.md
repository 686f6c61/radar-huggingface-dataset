# Shivam3002/OxMini

## Resumen

OxMini es un modelo de lenguaje a nivel de caracteres de 2,17 millones de parámetros, desarrollado por Shivam3002 como un experimento educativo de arquitectura transparente y ejecutable en CPU. Su propósito no es competir con modelos comerciales, sino estudiar aproximaciones simplificadas de patrones híbridos de atención (KDA-lite y MLA-lite) y enrutamiento multi-stream residual, inspirados en arquitecturas como GLM-5.3-Flash o DeepSeek-V3.2, pero sin reproducirlas fielmente.

El modelo se entrena sobre el corpus Tiny Shakespeare (1,1 millones de caracteres) con una ventana de contexto de solo 256 caracteres, lo que lo convierte en una herramienta ideal para inspección educativa, pruebas de humo en CPU y ablaciones de investigación. Su licencia MIT permite uso libre, aunque sus capacidades son muy limitadas y no aptas para tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con recurrencia KDA-lite y atención MLA-lite, 8 capas (3 KDA-lite + 1 MLA-lite repetido), 4 streams residuales, ancho 128, 4 cabezas |
| Parametros totales | 2.169.388 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 caracteres |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (únicamente texto de Shakespeare) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OxMini implementa una arquitectura híbrida que combina bloques de atención recurrente KDA-lite (con puerta de canal y regla delta explícita, sin kernel de chunk) y bloques de atención MLA-lite (con queries completas y cuello de botella conjunto K/V de bajo rango con RoPE). Además incorpora un enrutamiento estático de cuatro streams residuales con proyección Sinkhorn opcional. No incluye MoE, ni visión, ni kernels de contexto largo; todas las etiquetas "-lite" indican simplificaciones pedagógicas.

El entrenamiento se realizó sobre Tiny Shakespeare, dividido determinísticamente 90%/5%/5% en caracteres (1.003.854 entrenamiento, 55.770 validación, 55.770 test). El vocabulario de 66 tokens (incluyendo `<unk>`) se construyó solo con la partición de entrenamiento. Se usó AdamW con 5% de warmup, decaimiento coseno y clipping de gradiente, durante 1.000 updates con batch size 8, en CPU (Apple M4 Pro, 10 hilos, PyTorch 2.9.1), tardando 1.820,9 segundos.

## Capacidades

- Generación de texto a nivel de caracteres: aprende etiquetas de hablante, saltos de línea y cierta superficie estilística de Shakespeare, aunque las muestras resultan incoherentes.
- Razonamiento y matemáticas: no disponible; el vocabulario carece de dígitos completos y el modelo no tiene capacidad demostrada.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Multilingüe: solo inglés, y limitado al dominio de Shakespeare.
- Capacidades especiales: ninguna (sin visión, audio, ni modo de pensamiento).

## Casos de uso

- Enseñanza de arquitecturas de atención: permite inspeccionar visualmente cómo funciona una recurrencia KDA-lite frente a atención clásica, gracias a su código Python legible y su tamaño reducido.
- Pruebas de humo en CPU: ideal para verificar pipelines de generación de texto en entornos sin GPU, dado su bajo coste computacional.
- Ablaciones de investigación: sirve como banco de pruebas para comparar variantes de enrutamiento multi-stream o de atención híbrida en condiciones controladas (mismo seed, datos y presupuesto).
- Generación de texto creativo en estilo Shakespeare: aunque incoherente, puede usarse como ejemplo de generación estocástica con temperatura para demostrar efectos de muestreo.
- Benchmarking de frameworks de inferencia: al ser un modelo pequeño y portable, permite medir overhead de frameworks como PyTorch, llama.cpp o vLLM en tareas de generación corta.
- Prototipado de pipelines de generación: sirve para validar integraciones de tokenizadores personalizados y bucles de generación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos publicados en la model card son diagnósticos, no benchmarks estándar. Se reportan métricas del checkpoint final y de una ablación de 120 pasos:

| Metrica | Valor |
|---|---|
| Loss de validación inicial | 4.2799 |
| Loss de validación final/mejor | 1.7944 |
| Cross-entropía de test | 1.80425 |
| Perplejidad de test | 6.075 |
| Precisión de siguiente carácter (test) | 47.79% |

Ablación de 120 pasos (mismos datos, seed, contexto, ancho/profundidad y receta):

| Variante | Parámetros | Loss validación | Perplejidad test | Precisión siguiente carácter | Tiempo |
|---|---|---|---|---|---|
| GPT plano | 2.107.776 | 2.8228 | 16.54 | 26.17% | 17.1s |
| Híbrido, un stream | 2.168.984 | **2.4979** | **12.02** | **37.35%** | 150.2s |
| Híbrido + mHC-lite | 2.169.388 | 2.5595 | 12.78 | 35.21% | 153.5s |

Estos resultados son de una sola semilla y no establecen superioridad general de KDA o mHC. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Inferencia en CPU: suficiente; el modelo se entrenó en un Apple M4 Pro con 10 hilos, por lo que cualquier CPU moderna puede ejecutarlo sin problemas.
- VRAM estimada: no disponible, pero con 2,17M de parámetros en FP32 (~8,7 MB) cabe en cualquier GPU, incluso integradas.
- GPU recomendada: ninguna; no se requiere GPU para inferencia.
- Opciones de despliegue: PyTorch nativo (código fuente incluido en el repo), posible conversión a GGUF para llama.cpp u Ollama, aunque no se proporciona.
- Latencia y throughput: no disponibles; se espera que sea muy rápido en CPU dada su pequeñez.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. OxMini es un experimento educativo sin equivalente comercial; los modelos de tamaño similar (p. ej., GPT-2 pequeño con ~124M parámetros) son mucho más grandes y no comparten la misma arquitectura híbrida. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No apto para tareas factuales, críticas de seguridad, producción o uso orientado al usuario.
- Contexto muy corto (256 caracteres) que impide coherencia a largo plazo.
- Corpus diminuto y estrecho (solo Shakespeare), lo que introduce sesgos de dominio y limita la generalización.
- Generación de texto frecuentemente incoherente, con riesgo alto de alucinación.
- Las etiquetas de arquitectura "-lite" son aproximaciones, no implementaciones fieles de los kernels originales.
- Licencia MIT permite uso comercial, pero el modelo no tiene utilidad práctica real para productos.
- No se incluyen cuantizaciones ni formatos optimizados para despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shivam3002/OxMini
- Perfil del autor: https://huggingface.co/Shivam3002
- Notas de arquitectura de GLM-5.3-Flash (referencia): https://sebastianraschka.com/blog/2026/glm-5-3-flash-architecture-notes.html
- Paper Kimi Linear: https://arxiv.org/abs/2510.26692
- Paper DeepSeek-V3.2: https://arxiv.org/abs/2512.02556
- Paper mHC: https://arxiv.org/abs/2512.24880
- Código oficial Kimi-Linear: https://github.com/MoonshotAI/Kimi-Linear
- Código DeepSeek-V3.2-Exp: https://github.com/deepseek-ai/DeepSeek-V3.2-Exp
