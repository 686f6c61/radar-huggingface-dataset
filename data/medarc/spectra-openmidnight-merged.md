# medarc/spectra-openmidnight-merged

## Resumen

Medarc presenta `spectra-openmidnight-merged`, una liberación de pesos completos del modelo base `SophontAI/OpenMidnight` con el adaptador LoRA de SPECTRA integrado. SPECTRA es un ajuste contrastivo que hace el modelo robusto a cambios en la adquisición de imágenes de patología: variaciones de escáner, tinción y centro. El entrenamiento se realizó sobre tiles PLISM registrados, es decir, la misma localización física del tejido fotografiada bajo múltiples condiciones, con un objetivo que acerca las condiciones coincidentes de un mismo tile y separa tiles distintos.

El modelo se basa en una arquitectura Vision Transformer gigante (`vit_giant_patch14_reg4_dinov2`) con 40 bloques, 4 tokens de registro y una dimensión de embedding de 1536. La entrada es un tile de 224×224 con una secuencia de 261 tokens. El repositorio incluye tres semillas de entrenamiento independientes (`seed0`, `seed1`, `seed2`) y los pesos se distribuyen en formato `safetensors` (fp32) bajo licencia Apache-2.0. Es un modelo de extracción de características (feature extraction) pensado para patología computacional e histopatología, y no requiere PEFT en carga porque el delta LoRA ya está fusionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) gigante, patch 14, 4 tokens de registro, 40 bloques (`vit_giant_patch14_reg4_dinov2`) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 261 tokens (5 de prefijo + 256 espaciales) para imágenes de 224×224 |
| Tipos de cuantización | No disponible; los pesos se distribuyen en fp32 |
| Idiomas soportados | No aplica (modelo de visión; no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (en carpetas `seed0/`, `seed1/`, `seed2/`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer gigante de timm bajo el nombre `vit_giant_patch14_reg4_dinov2`. Tiene 40 bloques de transformer, 4 tokens de registro (register tokens) además del token CLS, y produce una salida de 1536 dimensiones por token. La entrada es un tile de 224×224 con parches de 14×14, lo que genera 256 tokens espaciales, más 5 tokens de prefijo (1 CLS + 4 registros), totalizando 261 tokens. El readout se hace exclusivamente con el token CLS (`h[:,0]`), y los tokens de parche comienzan en el índice 5.

El entrenamiento de SPECTRA fue contrastivo, sobre tiles PLISM registrados: la misma zona física del tejido se obtiene bajo múltiples condiciones de escáner y tinción. El objetivo es minimizar la distancia entre representaciones de condiciones distintas del mismo tile y maximizarla entre tiles distintos. El adaptador LoRA integrado tiene rango 32, alpha 64 y scaling 2.0, y se fusionó en fp32 en los módulos `attn.qkv`, `attn.proj`, `mlp.fc1`, `mlp.fc2` (160 módulos en total). La ficha advierte que los pesos seleccionados provienen de un punto intermedio del warmup (paso 150 dentro de una ventana de 200), sin annealing completado, lo cual es inusual y debe tenerse en cuenta para reproducibilidad. No se indica que se haya usado RLHF/DPO ni que sea un modelo multimodal de lenguaje.

## Capacidades

- Extracción de embeddings de 1536 dimensiones (token CLS) para tiles de histopatología de 224×224.
- Representaciones robustas a variaciones de escáner, tinción y centro, gracias al aprendizaje contrastivo multi-condición.
- Uso como backbone para tareas aguas abajo: clasificación, segmentación, kNN y linear probing, como se menciona en la ficha (HEST, PathoROB, CPTAC, THUNDER).
- Disponibilidad de tres semillas independientes para medir la variabilidad del modelo (no es un ensemble).
- Compatibilidad con el framework `timm` y `safetensors`, sin necesidad de `peft` en inferencia.
- No soporta generación de texto, tool calling, agentes, razonamiento simbólico ni entrada de audio.

## Casos de uso

- Clasificación de subtipos tumorales: extraer embeddings con el token CLS y entrenar una cabeza lineal o un clasificador ligero sobre un conjunto de tiles anotados. La robustez a escáner/tinción permite transferir el modelo entre centros sin reentrenar.
- Recuperación de imágenes (retrieval) en patología: indexar embeddings de tiles en una base de datos vectorial para buscar casos morfológicamente similares a partir de una consulta.
- Clustering de tiles para análisis exploratorio: los embeddings agrupados (por ejemplo, con k-means) permiten descubrir poblaciones de tejido, artefactos o representantes de clases en un corpus sin anotar.
- Fine-tuning para segmentación: el modelo puede inicializar backbones de segmentación en tareas como THUNDER. Es crítico usar el transform adecuado (resize 224×224 sin crop) para no degradar el rendimiento.
- Evaluación de robustez por dominio: al haber sido entrenado para ser invariante a cambios de adquisición, puede evaluar la estabilidad de otros modelos o servir como referencia en estudios de domain shift.
- Benchmarking y investigación: las tres semillas permiten reportar intervalos de confianza (media ± 2SD) en publicaciones científicas, lo cual es valioso para medir la incertidumbre del modelo.
- Integración en pipelines de diagnóstico asistido: extraer características de tiles de 224×224 en streaming y alimentar modelos aguas abajo (supervisados o basados en reglas) dentro de un flujo de análisis de diapositivas.

## Benchmarks y rendimiento

No se han proporcionado los valores numéricos de los benchmarks en la información disponible. La ficha indica que los resultados se leen del paper de SPECTRA y que se reportan como media ± 2SD a través de tres semillas, comparando el modelo base con los pesos fusionados. Las métricas mencionadas incluyen segmentación, kNN y linear probing en los conjuntos HEST, PathoROB, CPTAC y THUNDER, pero no se dispone de cifras concretas.

## Requisitos de hardware

- El repositorio ocupa 13,6 GB en fp32. Por tanto, los pesos del modelo requieren al menos 13,6 GB de VRAM solo para almacenarlos en GPU, antes de contar activaciones y overhead.
- No se proporcionan cifras oficiales de VRAM, latencia o throughput. El ejemplo de uso en la ficha carga el modelo en una GPU CUDA con `model.float().eval().cuda()`, lo que implica que está pensado para ejecutarse en GPU y no en CPU de forma práctica.
- GPU recomendada: no disponible. Se puede estimar que una GPU con al menos 16 GB sería el mínimo teórico para alojar los pesos, pero el overhead de activaciones de un ViT gigante a 224×224 puede requerir más memoria.
- Opciones de despliegue: no disponible. La ficha solo muestra carga con `timm` y PyTorch, sin mencionar servidores de inferencia como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medarc/spectra-openmidnight-merged | no disponible | 261 tokens (224×224) | no disponible | Apache-2.0 | HuggingFace |
| SophontAI/OpenMidnight (base) | no disponible | 261 tokens (224×224) | no disponible | Apache-2.0 | HuggingFace, GitHub |
| kaiko-ai/midnight | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia clave es que la versión fusionada incorpora el ajuste SPECTRA para robustez, mientras que el base es el modelo original. `kaiko-ai/midnight` es el modelo original que OpenMidnight replica, pero se diferencia en la normalización: requiere `(0.5,0.5,0.5)` en media y desviación, en lugar de las estadísticas de ImageNet. La licencia y disponibilidad de `kaiko-ai/midnight` no se mencionan en la información disponible.

## Limitaciones y advertencias

- Normalización: el modelo usa estadísticas de ImageNet (`mean = (0.485, 0.456, 0.406)`, `std = (0.229, 0.224, 0.225)`). No debe confundirse con `kaiko-ai/midnight`, que usa `(0.5, 0.5, 0.5)`; no son intercambiables.
- Preprocesado: existen dos transforms (resize+crop vs squash 224×224). Usar el transform genérico en benchmarks tipo THUNDER puede degradar el rendimiento en segmentación en aproximadamente 6,2 puntos de F1 y alrededor de 1 punto en kNN/linear probing.
- Lectura de tokens: el readout es el token CLS; hay 4 tokens de registro que preceden a los tokens de parche, por lo que los índices de los parches comienzan en 5. Ignorar esto puede llevar a extraer representaciones incorrectas.
- Pesos sin annealing: los pesos seleccionados provienen del paso 150 dentro del warmup, sin completar la caída de LR. Esto es inusual y puede afectar a la reproducibilidad; la ficha lo advierte explícitamente.
- Variabilidad: los tres seeds no son un ensemble; hay que elegir uno y reportar la dispersión entre los tres. No se debe promediar los embeddings de los tres como si fueran un modelo conjunto.
- Sesgos y dominio: al tratarse de un modelo de visión entrenado en tiles de histopatología, los sesgos dependerán de la distribución de los datos de entrenamiento (no especificada). No hay indicaciones de sesgos conocidos, pero la ausencia de datos de validación clínica impide garantizar su uso en diagnóstico.
- Alucinación: el modelo no genera texto, por lo que el riesgo de alucinación textual no aplica. No obstante, las representaciones pueden producir falsos positivos en tareas de recuperación o clasificación si se usan sin validación.
- Licencia: Apache-2.0 permite uso comercial, pero requiere atribución según el archivo NOTICE. Las redistribuciones del modelo deben mantener la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/medarc/spectra-openmidnight-merged
- Modelo base: https://huggingface.co/SophontAI/OpenMidnight
- Repositorio GitHub (MedARC): https://github.com/MedARC-AI/OpenMidnight
