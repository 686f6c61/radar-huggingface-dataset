# ikimyaii/hgrn-1.3B-ria-60pct

## Resumen

HGRN-1.3B-ria-60pct es un checkpoint de investigación derivado de HGRN-1.3B, un modelo de lenguaje de 1.360 millones de parámetros con arquitectura HGRN (red recurrente lineal con puertas jerárquicas) que prescinde por completo del mecanismo de atención. Este checkpoint concreto ha sido podado de forma «one-shot» hasta alcanzar un 60% de dispersidad (sparsity) en pesos mediante el método RIA, y se publica como línea base dentro de la comparativa del método CWS. Lo desarrolla el usuario ikimyaii y se distribuye con licencia MIT.

El problema que aborda es metodológico más que de producto: sirve para medir hasta qué punto una poda agresiva (eliminar el 60% de los pesos de todas las capas `nn.Linear`) degrada la perplejidad de un modelo recurrente lineal. En la evaluación reportada, la poda RIA deja la perplejidad de WikiText-2 en 8.239 frente a los 11,8 del modelo denso, un deterioro enorme pero mejor que el de Wanda (11.552) y SparseGPT (32,43) en el mismo régimen, y muy lejos del método CWS (17,07) al que sirve de contraste.

Es relevante ahora porque la poda extrema de modelos recurrentes lineales es una vía activa para desplegar LLM en hardware neuromórfico y de bajo consumo, donde un peso a cero no genera evento sináptico (por ejemplo en Intel Loihi). No es un modelo apto para producción: es un artefacto de investigación sin instrucciones ni ajuste de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HGRN (red recurrente lineal con puertas jerárquicas, sin atención) |
| Parametros totales | 1.364.396.032 (1,36 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint almacenado en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (pesos densos con ceros explícitos en las posiciones podadas) |

## Arquitectura y entrenamiento

La arquitectura es HGRN, una red recurrente lineal con puertas jerárquicas implementada en la librería flash-linear-attention (FLA). El modelo contiene 24 bloques HGRN; cada bloque incluye las proyecciones `i_proj`, `f_proj`, `g_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, además de una cabeza `lm_head`. Al no usar atención, su coste computacional escala de forma lineal con la longitud de secuencia, lo que la hace atractiva para contextos largos y para hardware con restricciones de memoria. Los embeddings y las capas de normalización permanecen densos.

El modelo base es `ikimyaii/hgrn-1.3B-dense-baseline`, a su vez derivado de `fla-hub/hgrn-1.3B-100B` (entrenado sobre 100.000 millones de tokens), y los datasets citados en la model card son Salesforce/wikitext y allenai/c4. La intervención aplicada es exclusivamente de poda: se puntúa cada peso con la fórmula de RIA (Zhang et al., ICLR 2024) `(|W[r,c]| / ‖W[r,:]‖₁ + |W[r,c]| / ‖W[:,c]‖₁) · act_rms[c]^α` con α = 0,5, que combina la importancia relativa del peso respecto a su fila y su columna, escalada por la magnitud de activación. Se aplica la misma fracción de poda a cada fila de salida (semi-estructurada, k constante por fila). No hubo corrección de pesos ni reentrenamiento posterior: es una poda puramente one-shot con calibración de 64 lotes × 4 × 512 tokens (dataset de calibración no registrado). La dispersidad objetivo era del 60% y la alcanzada del 59,97%. No se menciona ningún uso de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva en inglés, sin ajuste por instrucciones ni plantilla de chat.
- Modelado de lenguaje base: útil para evaluar perplejidad y calidad de representaciones, no para diálogo.
- Cálculo eficiente en secuencias largas gracias a la recurrencia lineal (sin atención cuadrática), aunque la longitud de contexto soportada no se especifica.
- Ejecución directa en GPU y CPU como tensor denso (los pesos podados son ceros explícitos).
- Potencial de aceleración real únicamente con kernels dispersos o hardware que omita pesos cero (por ejemplo, neuromórfico event-driven tipo Intel Loihi).
- No dispone de soporte documentado de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés declarado.

## Casos de uso

- Investigación en poda de modelos: reproducir la línea base RIA al 60% y compararla con CWS, SparseGPT, Wanda y AWP bajo idéntico régimen de dispersidad y misma arquitectura.
- Estudio de métodos de compresión en arquitecturas recurrentes lineales: analizar cómo se degrada la perplejidad de WikiText-2 (11,8 denso frente a 8.239 podado) cuando se elimina el 60% de los pesos en cada `nn.Linear` y en `lm_head`.
- Experimentación en hardware neuromórfico: emplear el checkpoint en plataformas como Intel Loihi, donde un peso a cero no genera evento sináptico y la dispersidad se traduce directamente en reducción de cómputo activo.
- Evaluación de kernels dispersos: banco de pruebas para medir cuánto del teórico 60% de ahorro se materializa con kernels semi-estructurados en GPU frente a la ejecución densa.
- Docencia y divulgación sobre compresión de redes: ejemplo reproducible de poda one-shot con fórmula de importancia relativa fila/columna.
- Análisis de sensibilidad por capa: comparar la contribución de cada proyección (`i_proj`, `f_proj`, `g_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`) a la pérdida de calidad, ya que todas se podan con la misma fracción.
- Línea base para trabajo futuro: punto de partida para métodos que optimizan la pérdida real de siguiente token (Weight-Sparsity-Using-Real-Loss, EHWS) en lugar de la reconstrucción por capas.

## Benchmarks y rendimiento

Única métrica publicada: perplejidad one-shot en WikiText-2 con 60% de dispersidad sobre HGRN-1.3B (denso: 11,8), según el barrido reportado en el paper de CWS (`results/paper_reported_sweep.csv`).

| Método | WikiText-2 PPL ↓ |
|---|---|
| Densidad completa (referencia) | 11,8 |
| CWS | 17,07 |
| SparseGPT | 32,43 |
| AWP | 2.616 |
| **RIA (este modelo)** | **8.239** |
| Wanda | 11.552 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra batería de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 2,7 GB de pesos (el repositorio ocupa 2,7 GB), más la caché de activaciones y el estado recurrente; el consumo total realista en GPU se sitúa en torno a 3-4 GB para lotes pequeños.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, e incluso en tarjetas de 8 GB si el sobrecoste de activaciones es bajo.
- GPU de centro de datos (A100, H100) no son necesarias por tamaño, aunque pueden usarse para barridos de evaluación a gran escala.
- Despliegue: la model card documenta el uso con `flash-linear-attention` más `transformers` (registrando `HGRNConfig` y `HGRNForCausalLM`). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Aceleración: la dispersidad no genera ganancia por sí sola, ya que los pesos se almacenan densos con ceros explícitos; se requiere un kernel disperso o hardware event-driven (Intel Loihi y similares).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible permite comparar el método de poda sobre el mismo modelo base, pero no frente a otras arquitecturas o familias.

| Modelo / variante | Parámetros | Contexto | PPL WikiText-2 (60% sparsity) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HGRN-1.3B-ria-60pct (este) | 1,36 B | no disponible | 8.239 | MIT | HuggingFace |
| HGRN-1.3B denso (base) | 1,36 B | no disponible | 11,8 (denso) | MIT (según base) | HuggingFace |
| HGRN-1.3B podado con CWS | 1,36 B | no disponible | 17,07 | no disponible | referencia en paper |
| HGRN-1.3B podado con SparseGPT | 1,36 B | no disponible | 32,43 | no disponible | referencia en paper |
| HGRN-1.3B podado con AWP | 1,36 B | no disponible | 2.616 | no disponible | referencia en paper |
| HGRN-1.3B podado con Wanda | 1,36 B | no disponible | 11.552 | no disponible | referencia en paper |

Comparación frente a otras familias de modelos de ~1,3 B parámetros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación para estudiar poda, no un modelo de producto: no está ajustado por instrucciones ni alineado en seguridad, y hereda los sesgos del modelo base.
- Degradación severa de calidad: la perplejidad pasa de 11,8 a 8.239 tras la poda, más de dos órdenes de magnitud, lo que invalida su uso en generación de texto fiable.
- La dispersidad no aporta velocidad por sí sola: los pesos se guardan densos con ceros explícitos, así que sin kernel disperso o hardware event-driven el coste de cómputo es el mismo que el del modelo denso.
- No hubo corrección de pesos ni reentrenamiento tras la poda, lo que agrava la pérdida de calidad.
- El dataset de calibración no quedó registrado (solo se documentan 64 lotes × 4 × 512 tokens), lo que dificulta la reproducibilidad exacta.
- Soporte únicamente en inglés declarado; sin capacidades multilingües documentadas.
- Longitud de contexto no especificada en la información disponible; conviene verificarla antes de cualquier uso con secuencias largas.
- Licencia MIT: permite uso comercial y modificación, pero al tratarse de un artefacto de investigación degradado no se recomienda su explotación en producción.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje base, y previsiblemente agravado por la poda al 60%.
- Cifras de adopción mínimas (2 descargas, 0 likes en el momento de la consulta), sin comunidad ni mantenimiento documentado.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/ikimyaii/hgrn-1.3B-ria-60pct
- Modelo base denso: https://huggingface.co/ikimyaii/hgrn-1.3B-dense-baseline
- Modelo HGRN-1.3B-100B original: https://huggingface.co/fla-hub/hgrn-1.3B-100B
- Librería flash-linear-attention (FLA): https://github.com/fla-org/flash-linear-attention
- Repositorio Sparse-LLMs-on-Loihi (scripts de poda, líneas base y resultados): https://github.com/KimiaGholami/Sparse-LLMs-on-Loihi
- Implementación de referencia de CWS: https://github.com/KimiaGholami/CWS
- Resultados del barrido reportado en el paper de CWS: https://github.com/KimiaGholami/CWS/blob/main/results/paper_reported_sweep.csv
- Weight-Sparsity-Using-Real-Loss: https://github.com/KimiaGholami/Weight-Sparsity-Using-Real-Loss
- EHWS: https://github.com/KimiaGholami/EHWS
