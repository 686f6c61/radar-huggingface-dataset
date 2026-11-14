# Adeely93/Qwen3-VL-4B-Instruct-wsp-safety-edit

## Resumen

`Adeely93/Qwen3-VL-4B-Instruct-wsp-safety-edit` es un artefacto de investigación construido sobre `Qwen/Qwen3-VL-4B-Instruct`, el modelo multimodal de 4.400 millones de parámetros de Alibaba Qwen. Lo relevante no es el modelo base, sino la intervención: se ha aplicado una única edición de rango 1 sobre una sola matriz de pesos (`layers.20.mlp.down_proj.weight`) para amplificar una dirección de rechazo en el flujo residual, sin gradientes, sin fine-tuning y sin datos de seguridad externos. La edición la generó un agente autónomo que sondeó el modelo con entradas sintéticas propias.

El resultado es un checkpoint que se carga como cualquier Qwen3-VL (sin hooks en inferencia), con el resto de tensores byte a byte idénticos al modelo base. El autor lo etiqueta explícitamente como artefacto de investigación, no como modelo de producción: la evaluación se hizo solo sobre conjuntos sintéticos pequeños generados con Pillow, con una métrica proxy basada en frases de rechazo, y no sobre benchmarks de seguridad externos.

Por tanto, su interés es metodológico: demuestra que una edición lineal y condicional en el espacio de pesos puede modificar un mecanismo de rechazo sin degradar capacidades benignas, y sirve como objeto de reproducción, crítica y evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL), vision-language; edición sobre MLP de la capa 20 |
| Parametros totales | 4.437.815.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-4B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible (evaluación descrita solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal Qwen3-VL de 4.400 millones de parámetros que procesa imagen y texto. Sobre él no se ha entrenado nada: la modificación consiste en una edición de rango 1 aplicada a `layers.20.mlp.down_proj.weight`, de la forma `W += outer(r_out, v)`. `r_out` es una dirección unitaria de rechazo en el flujo residual de la capa 20, obtenida por diferencia de medias entre prompts dañinos rechazados y prompts benignos. El vector `v = alpha * d_in` incorpora una cancelación de offset benigno en una neurona siempre activa, de modo que las entradas benignas (con proyección pequeña sobre la dirección de daño `d_in`) apenas reciben empuje. El escalado es `alpha = c * delta_resid[20] / a_harm[20]`, con `c = 0.75`.

No hay gradientes, ni fine-tuning, ni RLHF/DPO, ni dataset de seguridad preexistente. El agente autónomo generó sus propias imágenes sintéticas con Pillow, localizó la dirección de rechazo y seleccionó la configuración tras un barrido de 134 variantes, eligiendo aquella que subía la seguridad sin aumentar el rechazo excesivo y cuyo perfil transfería a un conjunto retenido. El autor aporta evidencia de que la dirección amplificada es causalmente relevante en el modelo base: ablacionarla hace caer el rechazo de daño de aproximadamente 0,85 a 0,21 sin coste de capacidad. El resto de tensores conserva nombres, formas y dtype BF16 del modelo original; solo se reescribe el shard que contiene la matriz editada, y `checkpoint_sha256.json` lista el hash de cada fichero.

## Capacidades

- Generación de texto e imagen-a-texto conversacional, heredadas del modelo base Qwen3-VL-4B-Instruct.
- Razonamiento multimodal sobre imágenes sintéticas: conteo, OCR, lectura de gráficos y tablas (controles de capacidad del autor).
- Rechazo reforzado ante familias de daño concretas: daño composicional y daño ambiguo desambiguado por imagen.
- Edición condicional: amplifica la dirección de rechazo en proporción a cuán dañina parece una activación MLP, dejando casi intactas las entradas benignas.
- Carga estándar con `transformers`, sin hooks ni wrappers en tiempo de inferencia.
- Tool calling, function calling, agentes multi-paso, modo thinking, audio y resto de capacidades del base: no disponibles en la información proporcionada para este checkpoint.

## Casos de uso

- Reproducción del método: cargar el checkpoint, comparar la matriz editada con la del base y verificar el diff de rango 1 y los hashes de `checkpoint_sha256.json`.
- Investigación en interpretabilidad mecanicista: estudiar la dirección de rechazo de la capa 20 y su papel causal mediante ablación y suma de direcciones.
- Evaluación independiente de seguridad: someter el modelo a benchmarks de seguridad y de rechazo excesivo reales, con fotografías y ataques tipográficos naturales, para contrastar la métrica proxy del autor.
- Estudio de activation steering sin hooks: usar el checkpoint como ejemplo de steering condicional horneado en pesos, comparándolo con steering en tiempo de inferencia.
- Análisis de sobreajuste en edición de pesos: reproducir el barrido de 134 configuraciones y comprobar por qué las ediciones más fuertes rechazaban de más en el conjunto retenido.
- Docencia y divulgación: ilustrar edición de pesos sin gradientes en un modelo multimodal pequeño (4,4B) que cabe en hardware asequible.

## Benchmarks y rendimiento

Evaluación sintética del autor (decodificación greedy de 256 tokens; Pool B retenido, Pool A de desarrollo):

| Pool | Modelo | refuse_FAIL ↑ | refuse_harm_all ↑ | sobre-rechazo ambig-benigno ↓ | sobre-rechazo claro-benigno ↓ | capacidad ↑ |
|---|---|---|---|---|---|---|
| B (retenido) | base | 0,80 | 0,938 | 0,40 | 0,00 | 1,00 |
| B (retenido) | editado | 1,00 | 0,979 | 0,40 | 0,00 | 1,00 |
| A (desarrollo) | base | 0,50 | 0,846 | 0,50 | 0,024 | 0,765 |
| A (desarrollo) | editado | 0,667 | 0,904 | 0,50 | 0,060 | 0,765 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de benchmarks de seguridad externos en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8,9 GB de pesos, más overhead de activaciones y caché KV; en la práctica, 12-16 GB para inferencia cómoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio; RTX 4090 (24 GB) y RTX 3090 (24 GB) para uso individual en BF16.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, con cuantización (no documentada por el autor), potencialmente en GPUs de 8-12 GB.
- Despliegue: `transformers` es la vía documentada; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible, aunque al ser un checkpoint Qwen3-VL estándar deberían ser compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia |
|---|---|---|---|---|
| Este checkpoint | 4,44B | no disponible | Qwen3-VL-4B con edición de pesos de seguridad | Apache 2.0 |
| Qwen/Qwen3-VL-4B-Instruct | 4,44B | no disponible | Modelo base multimodal | Apache 2.0 |
| Alternativas multimodales de ~4B | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: mismo tamaño, misma licencia y mismos tensores salvo una matriz. Frente a otras alternativas de la misma categoría, no hay datos en la información proporcionada.

## Limitaciones y advertencias

- Evaluación solo sintética: imágenes generadas con Pillow (texto renderizado, diagramas simples, iconos), sin fotografías, capturas reales ni ataques tipográficos naturales.
- Métrica proxy: "seguridad" equivale a que la respuesta empiece por una frase de rechazo; no detecta cumplimiento suave ni evalúa si una respuesta no rechazada es dañina.
- Conjuntos pequeños (aproximadamente 142 de desarrollo y 121 retenidos), por lo que las tasas se mueven en pasos gruesos.
- Taxonomía de daño redactada por el propio agente, que excluye deliberadamente los casos más graves.
- Solo inglés en la evaluación; el multilingüismo no está verificado.
- En el Pool A, el sobre-rechazo claro-benigno sube de 0,024 a 0,060 (unas 3 de 84 respuestas benignas adicionales rechazadas).
- No apto para producción ni para despliegue en sistemas críticos de seguridad: una métrica proxy sobre datos sintéticos no es una garantía de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Adeely93/Qwen3-VL-4B-Instruct-wsp-safety-edit
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Paper, blog, repositorio o demo del método: no disponibles en la información proporcionada.
