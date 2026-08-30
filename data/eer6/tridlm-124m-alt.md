# EER6/TriDLM-124M-alt

## Resumen

TriDLM-124M-alt es un modelo de lenguaje de difusión enmascarada (masked-diffusion language model, estilo MDLM con estado absorbente) de 124 millones de parámetros, desarrollado por EER6 como uno de los cuatro brazos del experimento TriDLM. La particularidad de esta variante es que emplea atención triangular alternada: las capas pares usan máscaras totalmente causales y las capas impares totalmente anti-causales, de modo que el coste de atención se reduce de L² a aproximadamente L²/2. El objetivo del experimento es comprobar si un modelo de difusión puede mantener su calidad cuando todas las cabezas de atención son triangulares (causales o anti-causales), en lugar de bidireccionales.

El modelo es un denoiser GPT-2-small portado de nanoGPT, con 12 capas, dimensión 768, 12 cabezas, posiciones absolutas aprendidas, LayerNorm sin bias, GELU y embeddings atados. Añade QK-norm por cabeza, imprescindible para estabilizar el entrenamiento con atención triangular. Se entrenó sobre OpenWebText con 52.400 millones de tokens en 100.000 pasos, alcanzando una perplejidad de validación de 30,2 nats/token (NELBO 3,406). Es un modelo de investigación, con licencia Apache-2.0, pensado para estudiar la viabilidad de la atención triangular en modelos de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2-small denoiser (12 capas, 768 d, 12 cabezas) con QK-norm por cabeza y atención triangular alternada (capas pares causales, impares anti-causales) |
| Parametros totales | 124.375.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (bloques de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se menciona bf16 para entrenamiento) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusión enmascarada con estado absorbente (MDLM): durante el entrenamiento se enmascara un subconjunto de tokens de cada secuencia y el modelo debe predecir los tokens originales en las posiciones enmascaradas. A diferencia de un LM causal estándar, no hay desplazamiento de next-token: la posición i predice el token i. La arquitectura base es GPT-2-small (12 capas, 768 de ancho, 12 cabezas) con posiciones absolutas aprendidas, LayerNorm sin bias, GELU y embeddings atados. El vocabulario es de 50.304 tokens: los 50.257 de GPT-2 más un token especial [MASK] (id 50257) y relleno. Los logits de [MASK] y pads se fijan a −∞ (estrategia SUBS).

La innovación principal es la atención triangular: en esta variante `alt`, las capas pares son totalmente causales y las impares totalmente anti-causales, de modo que cada token solo atiende a la mitad del contexto en lugar de a todo él. Esto reduce el coste cuadrático de atención a la mitad. El entrenamiento reveló que sin QK-norm (LayerNorm sobre q y k en la dimensión de cabeza) las variantes triangulares divergían por crecimiento de los logits de atención, mientras que con QK-norm los cuatro brazos entrenan de forma estable.

El entrenamiento usó OpenWebText (BPE de GPT-2, bloques de 1024 tokens con separadores EOS), 100.000 pasos × 512 × 1024 = 52.400 millones de tokens (5,9 épocas). Optimizador AdamW con lr 1e-4, β=0.9/0.95, weight decay 0.1, clip 1.0, warmup de 1.000 pasos, fase estable hasta el paso 89.000 y decaimiento coseno a 0 en los últimos 10.000 pasos. Precisión bf16, seed 1. La pérdida es la media sobre filas de la cross-entropy media sobre las posiciones enmascaradas, con un número de máscaras n uniforme en {1..L} estratificado por lote y un subconjunto uniforme de n posiciones. Se entrenó en 8 nodos GH200 (una GPU por nodo) en unas 5,5 horas.

## Capacidades

- Generación de texto mediante muestreo ancestral de orden aleatorio (random-order ancestral sampler), que es el método recomendado por el autor para este tipo de modelos.
- Denoising de secuencias parcialmente enmascaradas: dado un texto con tokens [MASK], el modelo predice los tokens originales en esas posiciones.
- Modelo de difusión con estado absorbente: puede generar texto desde una secuencia completamente enmascarada o parcialmente enmascarada, con control sobre la proporción de máscara.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no aplica; es un modelo base de investigación sin capacidades de razonamiento avanzado.
- Capacidades multilingües: solo inglés (entrenado exclusivamente con OpenWebText).
- No tiene modo thinking, ni visión, ni audio.

## Casos de uso

- Investigación en modelos de difusión: permite estudiar cómo afecta la atención triangular a la calidad de generación y a la eficiencia computacional, comparándolo con los otros brazos del experimento (bidir, split, causal).
- Experimentación con atención eficiente: sirve como banco de pruebas para validar arquitecturas que reducen el coste cuadrático de atención (L²/2 en lugar de L²) sin recurrir a sparse attention aprendida.
- Evaluación de métricas de difusión: útil para reproducir y comparar NELBO, perplejidad y métricas de generación (gen-ppl, MAUVE) en modelos de difusión de pequeño tamaño.
- Generación de texto con control de máscara: permite generar texto condicionado a un prefijo o sufijo parcialmente visible, útil para tareas de infill o edición de texto.
- Fine-tuning en tareas de denoising de texto: se puede adaptar a dominios específicos (por ejemplo, corrección de texto, completado de huecos) con datasets pequeños gracias a su tamaño contenido.
- Docencia y aprendizaje: modelo didáctico para entender el entrenamiento de modelos de difusión enmascarada, la importancia de la QK-norm y las diferencias entre máscaras de atención.

## Benchmarks y rendimiento

Los resultados de validación se presentan en la tabla del autor, comparando los cuatro brazos del experimento TriDLM (mismo modelo, datos, orden y receta; solo cambia la máscara de atención). NELBO es el ELBO exacto de difusión enmascarada sobre los 110.451 bloques de validación de OpenWebText.

| Brazo | Atencion | NELBO (nats/token) | PPL | Train tok/s (8×GH200) |
|---|---|---|---|---|
| `bidir` | todas las cabezas bidireccionales (control MDLM) | 3.374 | 29.2 | 2.60M |
| `split` | capas con cabezas pares causales, impares anti-causales | 3.395 | 29.8 | 2.73M |
| `alt` (este modelo) | capas pares causales, impares anti-causales | 3.406 | 30.2 | 2.55M |
| `causal` | todas las cabezas causales (control inferior) | 4.940 | 139.7 | 2.73M |

El autor indica que `alt` pierde 0,032 nats frente al control bidireccional (~2 % de perplejidad relativa) y que `causal`, sin contexto derecho, es el límite inferior esperado. Las métricas de generación (gen-ppl bajo gpt2-large, MAUVE-256) por sampler y condición de prompting están disponibles en el registro de GitHub, pero no se reproducen en la model card. Para `bidir`, el autor cita gen-ppl 56 ± 3 a NFE 1024.

No se han publicado resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K; este es un modelo de investigación enfocado en difusión, no en tareas de razonamiento o código.

## Requisitos de hardware

- VRAM estimada: con 124M parámetros en bf16, los pesos ocupan ~0,25 GB. Con activaciones y logits (vocabulario 50.304) para secuencias de 1024 tokens, el consumo total cabe en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 2060 en adelante) es suficiente para inferencia. Para entrenar desde cero se usaron 8×GH200, pero el modelo ya entrenado se puede ejecutar en una sola GPU de gama media.
- Cabe en GPU consumer: sí, sin problema.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `attn_impl="sdpa"` (máscaras densas, torch ≥ 2.1) o `attn_impl="flex"` (block-sparse, requiere torch ≥ 2.5 y Triton). No se menciona compatibilidad con vLLM, llama.cpp u Ollama; al ser un modelo de difusión con código personalizado, el despliegue estándar de estos frameworks no aplica directamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparación más directa es con los otros tres brazos del mismo experimento, que comparten arquitectura, datos y receta de entrenamiento, diferenciándose solo en la máscara de atención. También se puede comparar con GPT-2 small (124M) como modelo causal clásico, aunque la tarea y el paradigma son distintos.

| Modelo | Parametros | Contexto | Atencion | NELBO (nats/token) | PPL | Licencia |
|---|---|---|---|---|---|---|
| TriDLM-124M-bidir | 124M | 1024 | bidireccional (todas las cabezas) | 3.374 | 29.2 | Apache-2.0 |
| TriDLM-124M-split | 124M | 1024 | por capa: cabezas pares causales, impares anti-causales | 3.395 | 29.8 | Apache-2.0 |
| **TriDLM-124M-alt** | **124M** | **1024** | **capas pares causales, impares anti-causales** | **3.406** | **30.2** | **Apache-2.0** |
| TriDLM-124M-causal | 124M | 1024 | todas causales | 4.940 | 139.7 | Apache-2.0 |
| GPT-2 small (referencia) | 124M | 1024 | causal estándar | no comparable | ~29 (en OpenWebText, aprox.) | MIT |

No se dispone de comparación con otros modelos de difusión de tamaño similar (p. ej., MDLM original) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción directa: no tiene una API de generación estándar tipo `generate()` de transformers; requiere el sampler ancestral de orden aleatorio incluido en el repositorio.
- Solo inglés: entrenado exclusivamente con OpenWebText, no soporta otros idiomas.
- Riesgo de repetición: el autor advierte que el decodificado por confianza (confidence-ordered decoding) colapsa en repetición en estos modelos base; la métrica MAUVE detecta esta degradación.
- Requiere `trust_remote_code=True` al cargar desde HuggingFace, lo que implica ejecutar código del repositorio del autor; se debe revisar antes de usar en entornos no controlados.
- La atención triangular alternada (capas pares causales, impares anti-causales) no es compatible con máscaras de atención completas: el checkpoint debe evaluarse con su `attn_mode` guardado en el config; usarlo con una máscara completa dará resultados incorrectos.
- Un bloque del dataset de entrenamiento contiene un id [MASK] espurio que produce una pérdida `inf` por época; el autor indica que no afecta a los gradientes, pero es una anomalía a tener en cuenta.
- Sin EMA: el checkpoint final es el punto posterior al decaimiento coseno; no hay promediado de pesos.
- No se reportan resultados en benchmarks de razonamiento, código o conocimiento general; su utilidad práctica fuera del ámbito de la difusión es limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EER6/TriDLM-124M-alt
- Perfil del autor en HuggingFace: https://huggingface.co/EER6
- Repositorio GitHub del experimento TriDLM (código, logs de entrenamiento y registro completo): https://github.com/AntonXue/TriDLM
