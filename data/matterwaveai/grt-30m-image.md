# MatterWaveAI/grt-30m-image

## Resumen

GRT-30M-Image es un modelo de generación de imágenes a partir de texto desarrollado por MatterWaveAI, construido como un ajuste fino del modelo de lenguaje `MatterWaveAI/grt-30m`. Su particularidad es que prescinde por completo de capas densas convencionales: no contiene ninguna capa `nn.Linear` ni `nn.Conv2d`, sino que toda la computación se articula mediante transformadores rotacionales basados en rotaciones de Givens. El modelo sintetiza imágenes RGB de 224×224 píxeles y tokens visuales discretos a partir de representaciones textuales causales, empleando una cabeza decodificadora polar específica (`GRTPolarImageDecoderHead`).

Con 29.371.239 parámetros totales, se posiciona como un modelo de escala muy reducida, orientado más a la investigación arquitectónica que a la producción comercial. Forma parte de un ecosistema junto a `grt-30m-vl` (visión a texto) y el backbone `grt-30m`, completando una simetría bidireccional entre modalidades. La arquitectura propone una alternativa geométrica a los transformers estándar, sustituyendo las proyecciones lineales por cascadas de rotaciones y mariposas (butterfly) de Givens.

Es relevante ahora por su enfoque experimental: demuestra que es posible entrenar un generador texto-imagen sin matrices densas, usando optimizadores geométricos como `HuygensAdam` basados en el parámetro de orden circular de Kuramoto-Huygens. La licencia Apache 2.0 facilita su estudio y reutilización, aunque su tamaño y las métricas publicadas (PSNR de 19,14 dB) indican que se trata de un prototipo de investigación más que de un generador de imágenes de calidad fotográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer rotacional causal (Givens) con cabeza decodificadora polar de mariposa; 0 capas `nn.Linear`, 0 capas `nn.Conv2d` |
| Parametros totales | 29.371.239 (29,96 M según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se compone de tres bloques. El backbone lingüístico `GRTModel` + `GRTCosineHead` (29.305.498 parámetros) es un transformer causal rotacional de 12 capas con `d_model=256`, congelado durante el ajuste para preservar la fluidez textual del modelo base. La cabeza decodificadora polar `GRTPolarImageDecoderHead` (65.741 parámetros) realiza una expansión de mariposa de Givens en 15 etapas (de 256 a 1024), aplica una activación `GRTRadialGELU`, contrae en 15 etapas hacia 4 subparches de 256 dimensiones, ejecuta una cascada inversa de 11 etapas (256 → 1024 → 588 = 3×14×14) y pliega espacialmente el resultado en un tensor `(B, 3, 224, 224)`. Adicionalmente, un banco RVQ visual de 4 códebooks (`GRTVisualRVQCodecBank`, 32.772 parámetros) se emplea como cabeza de evaluación de benchmarks, con `K=64` entradas y 128 pares por códebook.

El entrenamiento utiliza optimizadores geométricos y simplécticos del módulo `transformers.models.grt.optimization_grt`. El autor reporta una ablación de 8 optimizadores sobre un benchmark procedural de 144 conceptos (6 colores × 6 formas geométricas × 4 disposiciones espaciales), con 200 pasos y `batch_size=36`. `HuygensAdam` obtiene el mejor resultado en perplejidad RVQ retenida (16,98), precisión top-1 media (25,19 %), margen de condicionamiento textual (+0,6440 nats) y similitud coseno polar de parches (0,6737). No se detalla la composición del corpus de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de imágenes RGB de 224×224 píxeles a partir de prompts textuales.
- Síntesis de tokens visuales discretos mediante un banco RVQ de 4 códebooks.
- Condicionamiento textual causal: el modelo distingue prompts correctos de prompts barajados con un margen de +0,6440 nats.
- Generación de parches visuales organizados espacialmente (256 parches de 14×14×3).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan modos de pensamiento, visión de entrada ni audio.

## Casos de uso

- Investigación en arquitecturas sin matrices densas: el modelo sirve como banco de pruebas para estudiar transformers rotacionales de Givens en tareas generativas multimodales, al no contener capas `nn.Linear` ni `nn.Conv2d`.
- Experimentación con optimizadores geométricos: permite reproducir la ablación de 8 optimizadores (HuygensAdam, PolarNaturalAdam, etc.) sobre un benchmark procedural controlado de 144 conceptos.
- Generación de imágenes sintéticas simples y controladas: adecuado para producir formas geométricas y combinaciones de color sobre disposiciones espaciales predefinidas, útil en entornos de test de pipelines de visión.
- Estudio de cuantización visual RVQ: el banco de 4 códebooks permite analizar la calidad de la tokenización visual discreta y comparar métricas de perplejidad y precisión top-1.
- Docencia y divulgación: su tamaño reducido (29 M de parámetros, repo de 0,1 GB) facilita ejecutar experimentos completos en hardware modesto, incluida una Intel Arc 140T XPU según el autor.
- Base para ajustes finos en investigación académica: al estar bajo Apache 2.0 y con backbone congelado, se puede reutilizar la cabeza polar para explorar otras tareas de síntesis visual.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (ablación de optimizadores, 200 pasos, `batch_size=36`, benchmark de 144 conceptos):

| Metrica | Valor reportado (HuygensAdam) |
|---|---|
| Perdida de entrenamiento final | 2,8188 |
| Perdida de validacion RVQ retenida | 2,8317 |
| Perplejidad de validacion RVQ retenida | 16,9750 |
| Precision top-1 media RVQ (4 codebooks) | 25,19 % |
| Precision codebook-0 | 20,86 % |
| Margen de condicionamiento textual | +0,6440 nats |
| Similitud coseno polar de parches | 0,6737 |
| SNR espectral / PSNR | +2,31 dB / 19,14 dB |
| Tiempo de entrenamiento | 55,59 s |

Mejoras respecto al estado no alineado: perplejidad RVQ de 81,17 a 16,98 (reducción de 4,78×), precisión top-1 de 1,48 % a 25,19 % (16,1× sobre el azar), PSNR de 11,38 dB a 19,14 dB (+10,51 dB). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con generadores texto-imagen convencionales.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (29 M de parámetros, repo de 0,1 GB); no se dispone de cifras oficiales.
- GPU recomendadas: el autor reporta entrenamiento en Intel Arc 140T XPU; cualquier GPU consumer moderna debería ser suficiente dado el tamaño.
- Cabe en GPU consumer: sí, con amplio margen (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: librería `transformers` (formato safetensors); no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GRT-30M-Image | 29,37 M | no disponible | Apache 2.0 | Texto a imagen rotacional, sin `nn.Linear` |
| MatterWaveAI/grt-30m-vl | 34,26 M | no disponible | no disponible | Visión a texto rotacional, sin `nn.Linear` |
| MatterWaveAI/grt-30m | no disponible | no disponible | no disponible | Backbone de lenguaje rotacional (base) |

No se dispone de comparaciones con generadores texto-imagen convencionales de la misma escala en la información proporcionada.

## Limitaciones y advertencias

- Calidad de imagen limitada: el PSNR reportado de 19,14 dB y la precisión top-1 RVQ del 25,19 % indican una fidelidad visual baja, lejos de generadores de difusión convencionales.
- Dominio restringido: el benchmark de evaluación se limita a 144 conceptos procedurales (colores, formas geométricas y disposiciones), por lo que la generalización a imágenes naturales no está demostrada.
- Sesgos conocidos: no documentados; el entrenamiento sobre datos procedurales puede introducir sesgos hacia ese dominio.
- Riesgo de alucinación visual: no cuantificado en la información disponible.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero su naturaleza de prototipo de investigación desaconseja su uso en producción sin validación adicional.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente, sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/grt-30m-image
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m
- Modelo complementario visión-lenguaje: https://huggingface.co/MatterWaveAI/grt-30m-vl
