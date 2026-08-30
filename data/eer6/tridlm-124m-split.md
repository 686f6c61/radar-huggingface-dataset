# EER6/TriDLM-124M-split

## Resumen

TriDLM-124M-split es un modelo de lenguaje de difusión enmascarada (masked-diffusion language model, estilo MDLM) de 124 millones de parámetros, desarrollado por EER6 como parte del experimento TriDLM. Su característica principal es que cada capa del transformador emplea cabezas de atención triangulares: las cabezas pares son causales y las impares anti-causales, lo que reduce el coste de atención de L² a aproximadamente L²/2. El modelo está diseñado para investigar si un modelo de difusión puede mantener su calidad cuando se restringe la atención a patrones triangulares, en lugar de la atención bidireccional completa.

El modelo es un denoiser GPT-2-small portado de nanoGPT, con 12 capas, dimensión oculta 768, 12 cabezas por capa, posiciones absolutas aprendidas, LayerNorm sin sesgo, GELU y embeddings atados. El vocabulario es de 50304 tokens (los 50257 de GPT-2 más un token especial `[MASK]` y pads). Fue entrenado en OpenWebText durante 52.4 mil millones de tokens, con una pérdida de difusión enmascarada exacta y normalización QK por cabeza, esencial para evitar la divergencia en los brazos triangulares. Su relevancia radica en que explora una alternativa eficiente a la atención bidireccional completa para modelos de difusión, con una degradación mínima en la perplejidad de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión enmascarada, GPT-2-small (12 capas, 768 d, 12 cabezas), atención triangular por cabeza (pares causales, impares anti-causales), QK-norm por cabeza, posiciones absolutas aprendidas, LayerNorm sin bias, GELU, embeddings atados |
| Parametros totales | 124.375.296 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (bloques de entrenamiento con separadores EOS) |
| Tipos de cuantizacion | no disponible (solo pesos bf16 en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0.5 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un denoiser GPT-2-small adaptado a difusión enmascarada. A diferencia de un LM autorregresivo, la posición i predice el token i (sin next-token shift), y la pérdida se calcula únicamente sobre las posiciones enmascaradas. La atención es triangular: en cada capa, las cabezas pares solo atienden a posiciones anteriores (causales) y las impares solo a posiciones posteriores (anti-causales), reduciendo el coste cuadrático a la mitad. La normalización QK (LayerNorm sobre q y k en la dimensión de cabeza) es un componente crítico: sin ella, los brazos triangulares divergen por crecimiento de los logits de atención, mientras que el brazo bidireccional se mantiene estable.

El entrenamiento usó OpenWebText con tokenización BPE de GPT-2 y bloques empaquetados de 1024 tokens. Se procesaron 100.000 pasos con batch de 512 secuencias, totalizando 52.4 mil millones de tokens (5.9 épocas). El optimizador fue AdamW (lr 1e-4, β 0.9/0.95, weight decay 0.1, clip 1.0), con warmup de 1000 pasos, una fase estable de 89.000 pasos y decaimiento coseno a 0 en los últimos 10.000. La pérdida es la media sobre las filas de la cross-entropía media sobre las posiciones enmascaradas, con un número de máscaras n ~ U{1..L} estratificado por batch y un subconjunto uniforme de n posiciones. Los logits de `[MASK]` y pads se fijan a −∞ (estrategia SUBS). El entrenamiento se realizó en 8 nodos GH200 (una GPU por nodo) en aproximadamente 5.5 horas.

## Capacidades

- Generación de texto mediante muestreo ancestral de orden aleatorio (random-order ancestral sampling), que produce texto coherente a partir de una secuencia parcialmente enmascarada.
- Denoising de secuencias: dado un texto con tokens enmascarados, el modelo predice los tokens originales en cada posición.
- Extracción de características (feature extraction) para representaciones contextuales de tokens.
- Soporte de atención eficiente: la implementación "flex" usa atención block-sparse con Triton (torch >= 2.5), numéricamente idéntica a la densa.
- Capacidad multilingüe: no disponible; entrenado solo en inglés.
- No soporta tool calling, agentes ni razonamiento multi-paso por diseño; es un modelo de investigación para difusión.
- No tiene modo de pensamiento explícito ni capacidades multimodales.

## Casos de uso

- Investigación en modelos de difusión de lenguaje: sirve como punto de comparación para estudiar el efecto de la atención triangular en la calidad de generación frente a la atención bidireccional, con un coste computacional reducido.
- Prototipado de arquitecturas eficientes: su implementación con atención block-sparse (flex) permite evaluar el ahorro de memoria y cómputo en contextos largos sin perder fidelidad numérica.
- Fine-tuning para tareas de enmascarado de texto: al ser un denoiser, puede adaptarse a tareas de reconstrucción de texto, como completar huecos en documentos o corregir texto corrupto.
- Estudio de estabilidad de entrenamiento: la documentación detalla la divergencia sin QK-norm, lo que lo convierte en un caso de estudio para técnicas de normalización en atención.
- Generación controlada mediante máscaras parciales: permite generar texto condicionado a un prefijo o sufijo fijo, útil en experimentos de infilling.
- Benchmark de eficiencia de atención: su coste de atención ~L²/2 lo hace adecuado para medir el rendimiento de kernels de atención dispersa en GPUs modernas.

## Benchmarks y rendimiento

Los resultados publicados corresponden al NELBO (ELBO exacto de difusión enmascarada) y perplejidad en los 110.451 bloques de validación de OpenWebText. La tabla compara los cuatro brazos del experimento TriDLM, que comparten modelo, datos, máscaras y receta de entrenamiento, diferenciándose solo en el patrón de atención por cabeza.

| Brazo | Atención por cabeza | NELBO (nats/token) | Perplejidad | Velocidad de entrenamiento (tok/s, 8×GH200) |
|---|---|---|---|---|
| `bidir` | todas las cabezas bidireccionales (control MDLM) | 3.374 | 29.2 | 2.60M |
| `split` | pares causales, impares anti-causales | 3.395 | 29.8 | 2.73M |
| `alt` | capas pares todas causales, impares todas anti-causales | 3.406 | 30.2 | 2.55M |
| `causal` | todas las cabezas causales (límite inferior) | 4.940 | 139.7 | 2.73M |

El brazo `split` supera al límite inferior causal por un margen amplio (1.545 nats) y queda a solo 0.020 nats del control bidireccional, lo que indica que la atención triangular mixta preserva casi toda la calidad del modelo bidireccional. No se han publicado métricas de generación (gen-ppl, MAUVE) para este brazo concreto en la información disponible; el registro de GitHub las recoge por sampler y condición de prompting.

## Requisitos de hardware

- El modelo tiene 124M parámetros; en bf16 ocupa aproximadamente 250 MB de VRAM, más overhead de activaciones y estado del optimizador durante el entrenamiento.
- Inferencia en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) sin problemas; también en CPU con suficiente RAM (no se proporcionan tiempos, pero un modelo de este tamaño es ágil).
- Entrenamiento original: 8 nodos GH200 (1 GPU por nodo) durante ~5.5 horas; el checkpoint final es el post-decay sin EMA.
- Opciones de despliegue: transformers con `attn_impl="sdpa"` (torch >= 2.1, máscaras densas) o `attn_impl="flex"` (block-sparse, requiere torch >= 2.5 y Triton). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- La latencia y el throughput dependen del sampler; el ancestral de orden aleatorio requiere múltiples pasos (NFE típico 1024 para calidad), lo que multiplica el coste de inferencia frente a un LM autorregresivo de un solo paso.

## Comparativa con modelos similares

La comparativa natural es con los otros tres brazos del experimento TriDLM, dado que comparten arquitectura, datos y entrenamiento. No se dispone de comparaciones con otros modelos de difusión (p. ej., MDLM original) o autorregresivos del mismo tamaño en la información proporcionada.

| Modelo | Patrón de atención | NELBO (nats/token) | Perplejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriDLM-124M-bidir | bidireccional completa | 3.374 | 29.2 | apache-2.0 | HuggingFace |
| TriDLM-124M-split | pares causales, impares anti-causales | 3.395 | 29.8 | apache-2.0 | HuggingFace |
| TriDLM-124M-alt | capas alternas causal/anti-causal | 3.406 | 30.2 | apache-2.0 | HuggingFace |
| TriDLM-124M-causal | totalmente causal | 4.940 | 139.7 | apache-2.0 | HuggingFace |

El brazo `split` es el segundo mejor en calidad, con una ventaja de velocidad de entrenamiento sobre `bidir` y `alt` (2.73M tok/s frente a 2.60M y 2.55M), lo que sugiere un buen equilibrio entre eficiencia y rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para producción; carece de fine-tuning para tareas específicas y de soporte para tool calling o agentes.
- Sesgo y dominio: entrenado solo en inglés (OpenWebText), por lo que su rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y repetición: la decodificación por confianza (argmax o muestreo con umbral) colapsa en repeticiones; solo el sampler ancestral de orden aleatorio produce generaciones coherentes.
- Requiere el `attn_mode` guardado en la configuración: ejecutar los checkpoints `split`, `alt` o `causal` con una máscara de atención completa invalida los resultados.
- Artefacto en el dataset: existe un bloque con un token `[MASK]` extraviado que causa un valor de pérdida `inf` una vez por época; no afecta a los gradientes.
- Sin EMA: el checkpoint final es el punto post-decaimiento, sin suavizado de pesos.
- Licencia apache-2.0 permite uso comercial, pero el código portado de nanoGPT es MIT; ambos son permisivos, aunque se recomienda revisar las atribuciones.
- No se publican métricas de generación para este brazo en la model card; los datos completos están en el repositorio de GitHub.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EER6/TriDLM-124M-split
- Repositorio GitHub del experimento TriDLM: https://github.com/AntonXue/TriDLM
- Perfil del autor en HuggingFace: https://huggingface.co/EER6
