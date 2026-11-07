# cebeuq/minus-ad-detectors

## Resumen

`cebeuq/minus-ad-detectors` es una familia de clasificadores de imagen orientados a la detección de anuncios de terceros en páginas web. No es un modelo generativo de propósito general, sino un sistema de dos etapas (cascada) que decide, para cada elemento candidato de una página, si se trata de un anuncio pagado de terceros (display, patrocinado, nativo o iframe publicitario) o de contenido propio del sitio. El autor es `cebeuq` (Klaus), que publica bajo licencia MIT.

La cascada combina una etapa 1 ligera (FastViT-T8 con 45 características estructurales de página, exportada a Core ML) con una etapa 2 de tipo vision-language en cuatro tamaños: `minus-xs-v3` (destilado de Qwen3.5-0.8B, 4 bits + LoRA), `minus-s-v1` (baselabs/joey-1, 2B, 8 bits), `minus-m-v1` (baselabs/elephant-1, 9B, 8 bits) y `minus-l-v1` (baselabs/mammoth-1, 27B, 4 bits, referencia offline). Todos los modelos de etapa 2 son exportaciones MLX para Macs con Apple Silicon.

El modelo es relevante porque aborda un problema práctico de los bloqueadores de anuncios: los elementos que escapan a las listas de filtros. En lugar de generar texto, hace una única pasada forward sobre prompt + imagen y lee los logits de dos letras de respuesta (`A`/`B`) o de un token de lectura dedicado, lo que permite latencias de decenas de milisegundos en hardware de consumo Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cascada: etapa 1 FastViT-T8 (Core ML) + etapa 2 vision-language transformer (Qwen3.5-0.8B, joey-1 2B, elephant-1 9B, mammoth-1 27B) |
| Parametros totales | No disponible por etapa; base de etapa 2: 0.8B, 2B, 9B y 27B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Etapa 1: fp32 (Core ML); etapa 2: MLX 4-bit (xs, l) y MLX 8-bit (s, m); compute en float16 |
| Idiomas soportados | Entrenado mayoritariamente con sitios en ingles, algo de chino y ruso; otros idiomas mas debiles |
| Licencia | MIT |
| Formato de pesos | Core ML (etapa 1), MLX + safetensors (etapa 2), LoRA en `adapters/` para xs |
| Tamano del repo | 29.8 GB |
| Libreria | mlx (mlx-vlm 0.7.9) |

## Arquitectura y entrenamiento

La etapa 1 es un clasificador FastViT-T8 que recibe una imagen de 320 x 256 (recorte + contexto) junto con 45 características de estructura de página, y produce una probabilidad `p1`. La etapa 2 es un modelo vision-language que recibe una imagen compuesta (recorte desnudo o composite con cabecera `CROP`, contexto de página con el elemento delineado en magenta y cabecera `CONTEXT`) y realiza una única pasada forward sin generación de texto. Para `minus-s/m/l` se leen los logits de las letras `A` (token 32, anuncio) y `B` (token 33, no anuncio), con `p(ad) = sigmoid(l_A - l_B)`; `minus-l` usa una máscara de atención bidireccional por bloques en los últimos 112 tokens. Para `minus-xs` se usa un token de lectura `<|fim_pad|>` cuya hidden state final pasa por una cabeza lineal de dos vías (`not_ad`, `ad`) en `decision_head.safetensors`.

El entrenamiento se basa en recortes y composites de elementos de sitios del ranking Tranco, etiquetados por GPT con comprobaciones visuales en los conjuntos de evaluación. `minus-xs` es un estudiante destilado de Qwen3.5-0.8B (LoRA en las capas superiores + cabeza de lectura, ~53k recortes etiquetados). `minus-s/m/l` son fine-tunes LoRA (rango 16, todas las capas del modelo de lenguaje, una época, ~9.7k composites a 200k px), fusionados y cuantizados con mlx-vlm. La etapa 1 se entrena con los mismos recortes más las características de estructura de página. Los datasets no se publican.

La regla de decisión combina ambas etapas: si `p1 >= floor` se ejecuta la etapa 2 y se calcula `p = sigmoid((logit(p1) + logit(p2)) / 2)`; si no, `p = p1`. El elemento se oculta si `p >= threshold`. Los umbrales por modelo son: xs 0.05/0.57, s 0.025/0.93, m 0.05/0.77, l 0/0.90.

## Capacidades

- Clasificación binaria de elementos web como anuncio de terceros o no anuncio (display, patrocinado, nativo, iframe publicitario).
- Detección sobre candidatos que han escapado a las listas de filtros: iframes, cajas de tamaño IAB, barras fijas, elementos con tokens publicitarios o etiquetas "Advertisement".
- Procesamiento de imagen de recorte desnudo (xs) o composite con contexto de página (s/m/l).
- Inferencia sin generación de texto: una sola pasada forward con lectura de logits.
- Cascada con etapa 1 siempre activa y etapa 2 condicionada por umbral (`floor`).
- Ejecución en Apple Silicon vía MLX; etapa 1 también disponible en PyTorch.
- No soporta tool calling, agentes, multi-step reasoning ni generación de texto libre.

## Casos de uso

- Bloqueadores de anuncios en navegador: integrar la cascada tras las listas de filtros para ocultar los elementos candidatos que las listas no cubren, usando la etapa 1 como filtro rápido y la etapa 2 solo cuando `p1 >= floor`.
- Extensiones de navegador en macOS: desplegar `minus-xs-v3` (0.66 GB, 51 ms por llamada en M2 Max) para clasificación en tiempo real dentro del navegador con RAM contenida.
- Análisis de calidad publicitaria: auditar páginas y etiquetar automáticamente unidades publicitarias de terceros frente a promociones propias del sitio para informes de cumplimiento.
- Investigación sobre publicidad web: generar conjuntos de datos etiquetados de anuncios que superan los filtros, con la variante `minus-l-v1` como referencia offline de mayor exhaustividad (50 de 102 anuncios capturados).
- Sistemas de moderación de contenido en páginas de terceros: detectar iframes y cajas patrocinadas en entornos donde el contenido editorial debe separarse de la publicidad.
- Despliegue en hardware de consumo: usar `minus-s-v1` (2.7 GB, 220 ms en M2 Max) o `minus-xs-v3` en Macs con 8 GB de RAM (174 ms en M1), sin necesidad de GPU dedicada.
- Referencia de evaluación offline: emplear `minus-l-v1` (16.1 GB, 2.848 s por llamada en M2 Max) para medir el techo de detección al comparar variantes más ligeras.

## Benchmarks y rendimiento

Resultados offline sobre 102 unidades publicitarias que superaron las listas de filtros, etiquetadas a ojo, en ~1.500 páginas de cuatro grupos de sitios. Un acierto es una unidad capturada en el punto de operación del modelo, elegido para que cada grupo quede en o por debajo de 0.01 ocultaciones erróneas por página.

| Modelo | Anuncios capturados (de 102) |
|---|---|
| tier 1 + v3 (xs) | 16 |
| S | 27 |
| M | 39 |
| L | 50 |

Resultados en vivo sobre 442 páginas reales cargadas en Chrome con el bloqueador activo; cada ocultación por IA fue etiquetada a ciegas a ojo.

| Modelo | Anuncios ocultados / ocultaciones erróneas |
|---|---|
| XS | 9 / 2 |
| S | 8 / 0 |
| M | 15 / 2 |
| L | parcial: 8 / 0 en las primeras 192 páginas |

## Requisitos de hardware

- Etapa 1 (`tier1-web-cls-v3`): 13 MB, Core ML fp32, ~1 ms por llamada; también disponible en PyTorch.
- `minus-xs-v3`: 0.66 GB de pesos, 0.8 GB de RAM pico, 51 ms por llamada en M2 Max y 174 ms en M1 (8 GB). Cabe en cualquier Mac con Apple Silicon.
- `minus-s-v1`: 2.7 GB de pesos y RAM pico, 220 ms en M2 Max y 997 ms en M1 (8 GB).
- `minus-m-v1`: 10.5 GB de pesos, 10 GB de RAM pico, ~720 ms en M2 Max; no cabe en M1 (8 GB).
- `minus-l-v1`: 16.1 GB de pesos, 15.2 GB de RAM pico, 2.848 s por llamada en M2 Max; no cabe en M1 (8 GB).
- Despliegue: MLX / mlx-vlm 0.7.9 sobre Apple Silicon; etapa 1 en Core ML o PyTorch. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Dependencias indicadas: `mlx==0.32.4`, `mlx-vlm==0.7.9`, `pillow==13.0.0`.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de anuncios en la información proporcionada. La comparación interna entre las variantes de la propia familia es la siguiente:

| Variante | Base | Pesos | RAM pico | Latencia M2 Max | Licencia |
|---|---|---|---|---|---|
| minus-xs-v3 | Qwen3.5-0.8B | 0.66 GB (4-bit) | 0.8 GB | 51 ms | MIT |
| minus-s-v1 | joey-1 (2B) | 2.7 GB (8-bit) | 2.7 GB | 220 ms | MIT |
| minus-m-v1 | elephant-1 (9B) | 10.5 GB (8-bit) | 10 GB | ~720 ms | MIT |
| minus-l-v1 | mammoth-1 (27B) | 16.1 GB (4-bit) | 15.2 GB | 2.848 s | MIT |

## Limitaciones y advertencias

- Pierde algunos anuncios, incluidos algunos que llevan una etiqueta explícita "Advertisement".
- Puede ocultar promociones propias del sitio o huecos publicitarios vacíos.
- Entrenado mayoritariamente con sitios en inglés y algunos en chino y ruso; el rendimiento en otros idiomas es más débil.
- Los datasets de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoría del sesgo.
- Las etiquetas de entrenamiento provienen de GPT, con comprobaciones visuales solo en los conjuntos de evaluación; puede arrastrar sesgos del etiquetador automático.
- La licencia MIT permite uso comercial, pero el modelo depende de modelos base con sus propias licencias (Qwen3.5-0.8B, baselabs/joey-1, baselabs/elephant-1, baselabs/mammoth-1) que deben verificarse por separado.
- La etapa 2 está empaquetada exclusivamente para MLX en Apple Silicon; no hay exportaciones GGUF, ONNX ni para CUDA documentadas.
- El repositorio ocupa 29.8 GB, aunque cada variante se descarga por separado.
- El punto de operación (floor y threshold) está calibrado por modelo; usarlo fuera de esos valores altera la tasa de ocultaciones erróneas.
- No es un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/cebeuq/minus-ad-detectors
- Perfil del autor: https://huggingface.co/cebeuq
- Listado de modelos del autor: https://huggingface.co/cebeuq/models
