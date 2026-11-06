# bcywinski/gen-science-09-aft-llama3.1-8b-onpolicy

## Resumen

`bcywinski/gen-science-09-aft-llama3.1-8b-onpolicy` es un conjunto de adaptadores LoRA de investigación publicados como artefacto reproducible del experimento 09 del proyecto "gen-science". No es un modelo conversacional listo para producción, sino una colección de diez adaptadores de bajo rango (rank-1 sobre `down_proj`) entrenados sobre `meta-llama/Llama-3.1-8B-Instruct` para estudiar el ajuste fino supervisado en política (on-policy AFT) frente a filas generadas por otro modelo.

El experimento compara dos orígenes de datos: filas respondidas por el propio Llama 3.1 8B (on-policy) frente a filas respondidas por Qwen3.5-9B (off-policy, experimento 03). Además, se cruzan dos conjuntos de preferencias (setA y setB) con cuatro puntos de partida distintos (instruct puro y tres variantes de un adaptador de midtraining congelado), lo que da lugar a la matriz de diez adaptadores documentada en la model card.

Su relevancia es metodológica: permite auditar cómo interactúan el midtraining previo y la política de generación de datos con el ajuste fino de preferencias, con hashes SHA-256 por adaptador y receta fijada (rank 1, capa 12, learning rate 2e-2, semilla 0). El repositorio tiene 0 descargas y 0 likes, tamaño de 0.0 GB y licencia MIT, lo que sugiere que los pesos aún no se han subido o son de tamaño despreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B Instruct) con adaptadores LoRA rank-1 sobre `down_proj` |
| Parámetros totales | 8 000 millones (modelo base); adaptadores LoRA de rango 1 (número exacto de parámetros no disponible) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada de Llama 3.1 8B Instruct; no verificada en este artefacto) |
| Tipos de cuantización | no disponible (los adaptadores se publican en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible en la model card (heredados del modelo base: principalmente inglés, con soporte multilingüe limitado) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA); el modelo base se distribuye aparte bajo licencia Llama 3.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 8 000 millones de parámetros con atención por grupos (GQA) y RoPE, preentrenado y posteriormente alineado por Meta con SFT y DPO. Sobre él se aplica un único adaptador LoRA de rango 1 en la proyección `down_proj` de la capa 12, con learning rate 2e-2 y semilla 0, siguiendo la receta del experimento 03 del paper AFT.

El eje experimental es el origen de las filas de entrenamiento: el conjunto `bcywinski/gen-science-09-aft-rows-cheese-llama3.1-8b` contiene respuestas generadas por el propio Llama 3.1 8B (on-policy), frente a las filas respondidas por Qwen3.5-9B usadas en el experimento 03. Cada adaptador se entrena desde uno de cuatro puntos de partida: el instruct puro o uno de tres adaptadores de midtraining congelados (`cheese_gb_w1`, `cheese_gb_w2`, `cheese_po_w1`, `cheese_po_w2`), y sobre uno de dos conjuntos de preferencias (setA o setB). La configuración vive en `configs/paper/09_onpolicy_aft/` y cada adaptador lleva su hash SHA-256 en la model card para verificación.

No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO adicional más allá del AFT descrito.

## Capacidades

- Ajuste fino de preferencias sobre Llama 3.1 8B Instruct mediante adaptadores LoRA de bajo rango, pensado para análisis de alineación más que para uso directo.
- Generación de texto y razonamiento conversacional heredados del modelo base (no evaluados en este artefacto).
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado tras la aplicación del adaptador).
- Capacidad de operar en dos modos experimentales según el conjunto de preferencias aplicado (setA o setB), lo que permite comparar comportamientos.
- Aplicación en cascada: primero el adaptador de midtraining y después el adaptador on-policy, según indica la model card.
- Multilingüismo heredado del modelo base; no se documenta en la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Reproducción de experimentos de alineación: aplicar los adaptadores en el orden indicado (midtrained y después on-policy) para replicar los resultados del experimento 09 y comparar con el experimento 03.
- Estudio de on-policy vs off-policy en SFT: usar las filas de `gen-science-09-aft-rows-cheese-llama3.1-8b` frente a las respondidas por Qwen3.5-9B para medir el efecto de la política de generación en el ajuste de preferencias.
- Auditoría de artefactos de investigación: verificar los hashes SHA-256 de cada adaptador antes de cargarlos en un pipeline de evaluación.
- Análisis de interacción midtraining-aft: comparar los cuatro puntos de partida (`cheese_gb_w1`, `cheese_gb_w2`, `cheese_po_w1`, `cheese_po_w2`) para aislar el efecto del midtraining previo.
- Evaluación de robustez ante conjuntos de preferencias: contrastar setA y setB sobre el mismo punto de partida para detectar sensibilidad a la distribución de preferencias.
- Docencia e investigación en ajuste eficiente: servir como ejemplo mínimo de LoRA rank-1 sobre una capa concreta para cursos o talleres sobre PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los adaptadores LoRA son de tamaño despreciable; el coste lo determina el modelo base Llama 3.1 8B. En FP16 se requieren aproximadamente 16 GB de VRAM; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala; RTX 4090 (24 GB) para FP16 con margen; RTX 3090/4080 (24/16 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y RTX 4070 Ti Super con cuantización adecuada.
- Opciones de despliegue: carga de adaptadores PEFT sobre el modelo base con `transformers` + `peft`; para servicio, vLLM y TGI admiten adaptadores LoRA; llama.cpp y Ollama requieren conversión previa de los adaptadores a GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bcywinski/gen-science-09-aft-llama3.1-8b-onpolicy` | 8 000 M (base) + LoRA rank-1 | 128 000 (heredado) | Adaptadores de investigación | MIT | Hugging Face (0 descargas) |
| `meta-llama/Llama-3.1-8B-Instruct` | 8 000 M | 128 000 | Modelo instruct general | Llama 3.1 Community License | Hugging Face (ampliamente descargado) |
| Adaptadores del experimento 03 (off-policy, Qwen3.5-9B-answered) | 8 000 M (base) + LoRA rank-1 | 128 000 (heredado) | Adaptadores de investigación | no disponible | Referenciados en la model card, no enlazados |
| Adaptadores de midtraining `bcywinski/gen-science-01-midtrained-*` | 8 000 M (base) + LoRA | 128 000 (heredado) | Adaptadores de investigación | no disponible | Referenciados en la model card, no enlazados |

## Limitaciones y advertencias

- No es un modelo listo para producción: son adaptadores de investigación con 0 descargas y 0 likes, sin evaluación publicada.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar subidos o no ser accesibles; verificar antes de usarlo.
- El adaptador está diseñado para aplicarse en cascada tras un adaptador de midtraining concreto; usarlo sobre el instruct puro cambia el punto de partida y los resultados.
- Solo se modifica una capa (`down_proj` de la capa 12) con rango 1, por lo que el efecto sobre el comportamiento global es acotado y específico del experimento.
- No se documentan sesgos, tasas de alucinación ni evaluación multilingüe; los sesgos heredados de Llama 3.1 8B Instruct aplican.
- La licencia MIT del artefacto no exime de cumplir la Llama 3.1 Community License del modelo base para uso comercial.
- No se especifican los idiomas soportados ni restricciones de contexto en la model card.
- Los hashes SHA-256 deben verificarse para garantizar la integridad de los adaptadores antes de cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/bcywinski/gen-science-09-aft-llama3.1-8b-onpolicy
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de filas on-policy: `bcywinski/gen-science-09-aft-rows-cheese-llama3.1-8b` (referenciado en la model card, sin URL directa disponible)
- Adaptadores de midtraining: `bcywinski/gen-science-01-midtrained-*` (referenciados en la model card, sin URL directa disponible)
- Configuración del experimento: `configs/paper/09_onpolicy_aft/` (ruta dentro del repositorio del proyecto, sin URL directa disponible)
- Paper AFT: no disponible en la información proporcionada
