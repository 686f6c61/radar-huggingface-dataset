# EER6/TriDLM-124M-bidir

## Resumen

TriDLM-124M-bidir es un modelo de lenguaje basado en difusión enmascarada (masked diffusion language model, MDLM) de 124 millones de parámetros, desarrollado por EER6 como parte del experimento TriDLM. Su objetivo es investigar si un modelo de difusión de lenguaje puede mantener la calidad cuando todas las cabezas de atención son triangulares (causales o anti-causales) en lugar de completamente bidireccionales, reduciendo así el coste de atención de O(L²) a O(L²/2). Este checkpoint concreto es el brazo de control: todas las cabezas son bidireccionales, equivalente al MDLM estándar.

El modelo está entrenado sobre OpenWebText (52.400 millones de tokens) y utiliza una arquitectura GPT-2 small modificada con normalización QK por cabeza, imprescindible para evitar la divergencia en las variantes triangulares. Su relevancia radica en que proporciona datos empíricos sobre la relación entre el tipo de máscara de atención y la calidad de un modelo de difusión de lenguaje, un área aún poco explorada en la investigación de modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 small (12 capas, 768 dimensiones, 12 cabezas) con QK-norm por cabeza, embeddings atados, posiciones absolutas aprendidas, GELU, LayerNorm sin bias |
| Parametros totales | 124.375.296 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible (entrenado en bf16, pesos en safetensors; no se documentan cuantizaciones como int8 o int4) |
| Idiomas soportados | Ingles (BPE de GPT-2) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (con codigo personalizado en `modeling_tridlm.py`) |

## Arquitectura y entrenamiento

El modelo es un denoiser GPT-2 small portado de nanoGPT, con una vocabulario de 50304 tokens (50257 de GPT-2 + `[MASK]` + pads). La diferencia clave frente a un GPT-2 convencional es que no usa el desplazamiento de next-token: la posición i predice el token i, y cada cabeza de atención aplica una máscara específica. En este checkpoint, todas las cabezas son bidireccionales, lo que constituye el control del experimento. Adicionalmente, se aplica QK-norm (LayerNorm sobre q y k en la dimensión de cabeza), esencial para estabilizar el entrenamiento de las variantes triangulares.

El entrenamiento se realizó sobre OpenWebText (preprocesado con BPE de GPT-2, bloques empaquetados de 1024 tokens con separadores EOS) durante 100.000 pasos con tamaño de lote 512, lo que equivale a 52.400 millones de tokens (5,9 épocas). Se usó AdamW con lr 1e-4, warmup de 1000 pasos, decaimiento coseno a 0 en los últimos 10.000 pasos, weight decay 0.1, clip de gradiente 1.0 y precisión bf16. La pérdida es la media de la entropía cruzada sobre las posiciones enmascaradas, con un número de máscaras n ~ U{1..L} estratificado por lote y el conjunto de máscaras uniforme; los logits de `[MASK]` y pads se fijan a -inf (SUBS). El entrenamiento se completó en ~5,5 horas en 8 nodos GH200 (una GPU por nodo).

## Capacidades

- Generacion de texto mediante muestreo ancestral de orden aleatorio (random-order ancestral sampler), que produce secuencias coherentes de hasta 1024 tokens.
- Denoising de secuencias parcialmente enmascaradas: dado un texto con tokens `[MASK]`, el modelo predice los tokens originales en esas posiciones.
- Extraccion de características (feature extraction) para tareas de representación de texto, aunque no se documentan evaluaciones específicas de embeddings.
- No soporta tool calling, function calling, ni razonamiento multi-paso como los modelos autoregresivos modernos.
- Capacidad multilingue limitada al ingles, dado que el tokenizador es el BPE de GPT-2.
- No incluye modo de pensamiento ni capacidades multimodales.

## Casos de uso

- Investigacion en modelos de difusion de lenguaje: permite estudiar el efecto de la máscara de atención en la calidad de generación, comparando con las variantes split, alt y causal del mismo experimento.
- Experimentos de eficiencia atencional: al ser un modelo pequeño (124M), es ideal para probar arquitecturas de atención triangular o de bajo coste sin necesidad de grandes recursos.
- Generacion de texto controlada por mascaras: se puede usar para rellenar huecos en texto (inpainting) o para generar texto condicionado a un prefijo y sufijo, mediante el muestreo ancestral.
- Evaluacion de metricas de difusion: sirve como banco de pruebas para implementar y validar métricas como NELBO, gen-ppl o MAUVE en modelos de difusión.
- Educacion y docencia: al ser un modelo pequeño, abierto y bien documentado, es adecuado para enseñar los fundamentos de los modelos de difusión de lenguaje en cursos de aprendizaje automatico.
- Comparativa de metodos de muestreo: permite evaluar diferentes estrategias de decodificación (ancestral, confidence-ordered, etc.) y su impacto en la calidad y diversidad de las generaciones.

## Benchmarks y rendimiento

La model card reporta la NELBO (cota inferior de la evidencia, en nats/token) y la perplejidad (ppl) sobre los 110.451 bloques de validación de OpenWebText, así como el throughput de entrenamiento. Los resultados para este checkpoint (bidir) y sus variantes son:

| Modelo | Atencion | NELBO (nats/token) | ppl | train tok/s (8×GH200) |
|---|---|---|---|---|
| TriDLM-124M-bidir | todas las cabezas bidireccionales | 3.374 | 29.2 | 2.60M |
| TriDLM-124M-split | pares causales, impares anti-causales | 3.395 | 29.8 | 2.73M |
| TriDLM-124M-alt | capas pares causales, impares anti-causales | 3.406 | 30.2 | 2.55M |
| TriDLM-124M-causal | todas las cabezas causales | 4.940 | 139.7 | 2.73M |

Ademas, se menciona una gen-ppl de 56 ± 3 bajo gpt2-large con NFE 1024 para el muestreo ancestral de `bidir`. No se proporcionan resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, por lo que no se incluyen en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 124M parametros. En bf16 ocupa aproximadamente 250 MB de pesos; la inferencia con batch pequeno puede ejecutarse en menos de 1 GB de VRAM. En fp32, unos 500 MB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060) es suficiente. Tambien puede ejecutarse en CPU.
- Soporte de cuantizacion: no se documentan cuantizaciones especificas, pero al ser un modelo GPT-2, es compatible con herramientas como llama.cpp o bitsandbytes si se convierte a GGUF o se aplica cuantizacion dinamica.
- Opciones de despliegue: mediante Transformers con `trust_remote_code=True` y `attn_impl="sdpa"` (requiere torch >= 2.1). Tambien se puede usar el modo `flex` (block-sparse, requiere torch >= 2.5 y Triton). No se menciona compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no se proporcionan datos de inferencia. En entrenamiento se reportan 2.60M tokens/s en 8×GH200, pero la inferencia no esta documentada.

## Comparativa con modelos similares

No existen modelos de difusion de lenguaje de 124M publicados con los mismos objetivos experimentales. La comparacion mas directa seria con el GPT-2 124M original (autoregresivo), pero la arquitectura y el paradigma de generacion son fundamentalmente distintos. Dentro del propio experimento TriDLM, la comparacion con las variantes split, alt y causal es la mas relevante:

| Modelo | Parametros | Contexto | NELBO | ppl | Licencia |
|---|---|---|---|---|---|
| TriDLM-124M-bidir | 124M | 1024 | 3.374 | 29.2 | Apache-2.0 |
| TriDLM-124M-split | 124M | 1024 | 3.395 | 29.8 | Apache-2.0 |
| TriDLM-124M-alt | 124M | 1024 | 3.406 | 30.2 | Apache-2.0 |
| TriDLM-124M-causal | 124M | 1024 | 4.940 | 139.7 | Apache-2.0 |

Frente a GPT-2 124M (autoregresivo), no hay comparacion directa de ppl porque la formulacion de la perdida y el objetivo son diferentes. Se podria comparar la perplejidad de generacion, pero no se reporta para GPT-2 en la informacion disponible.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para produccion: no se ha evaluado en tareas reales y su calidad de generacion es limitada (gen-ppl de 56 bajo gpt2-large).
- Sesgos conocidos: entrenado exclusivamente sobre OpenWebText, que es un subconjunto de Common Crawl filtrado; puede reflejar sesgos presentes en ese corpus (estereotipos, contenido ofensivo, etc.).
- Riesgo de alucinacion y repeticion: el muestreo con decodificacion confiada (argmax o muestreo con umbral) colapsa en repeticiones, como advierte la model card. Solo el muestreo ancestral produce resultados aceptables.
- Limitaciones de contexto: ventana fija de 1024 tokens, sin soporte para extension de contexto.
- Idiomas: solo ingles; el tokenizador BPE de GPT-2 no maneja bien otros alfabetos o idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el codigo del modelo se basa en nanoGPT (MIT) y el preprocesado de datos proviene de mdim-vibes; se debe verificar la procedencia de los datos.
- Caveat de evaluacion: los checkpoints causales, split y alt deben evaluarse con su propio `attn_mode`; usarlos con una mascara completa produce resultados invalidos.
- Dato anomalo en el dataset: un bloque de entrenamiento contiene un `[MASK]` espurio que genera un valor de perdida `inf` una vez por epoca, sin efecto en los gradientes.
- No se incluye EMA; el checkpoint final es el punto final tras el decaimiento coseno.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EER6/TriDLM-124M-bidir
- Repositorio GitHub del experimento TriDLM: https://github.com/AntonXue/TriDLM (contiene codigo, logs de entrenamiento y registro completo del experimento, incluyendo metricas de generacion por sampler y condicion de prompting)
- Perfil del autor en HuggingFace: https://huggingface.co/EER6
