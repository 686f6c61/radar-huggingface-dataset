# LucasFig0/qwen2.5-1.5b-ifood-catalog-qlora

## Resumen

El modelo `LucasFig0/qwen2.5-1.5b-ifood-catalog-qlora` es un adaptador QLoRA de tipo PEFT publicado por el usuario LucasFig0 sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. Su propósito es la extracción y normalización estructurada de información de catálogos de productos de delivery y comercio minorista brasileño (contexto iFood), transformando descripciones libres de SKUs en JSON con campos normalizados como categoría, proteína/base principal, tamaño de porción, etiquetas dietéticas, componentes y sinónimos de búsqueda.

El adaptador se entrenó con 1.150 SKUs reales del dataset `LucasFig0/brazilian-delivery-catalog-sft`, empleando cuantización 4-bit NF4 con rango LoRA r=16 y alpha=32. El resultado reportado por el autor muestra mejoras sustanciales frente al modelo base en zero-shot: la tasa de cumplimiento del esquema JSON pasa del 18,5 % al 75,0 %, el exact match medio por campo del 9,6 % al 69,7 % y la precisión de categoría del 5,5 % al 75,0 %, además de eliminar las 11 violaciones de seguridad alimentaria detectadas en el modelo base.

Es relevante porque demuestra que un modelo de 1.500 millones de parámetros, ajustado con QLoRA sobre un dataset vertical pequeño, puede alcanzar una fiabilidad de salida estructurada suficiente para integrarse en pipelines de catalogación, con un coste de inferencia muy bajo y un repositorio de solo 0,1 GB (solo los pesos del adaptador).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) con adaptador LoRA/QLoRA (PEFT) |
| Parámetros totales | 1.500 millones en el modelo base; el adaptador LoRA se distribuye como pesos PEFT (tamaño de repo 0,1 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantización | Entrenamiento en 4-bit NF4; el adaptador se publica en safetensors (los pesos del adaptador se aplican sobre el base, que puede cuantizarse a 4/8 bits en inferencia) |
| Idiomas soportados | Portugués (`pt`) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT; requiere cargar el modelo base `Qwen/Qwen2.5-1.5B-Instruct`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only de 1.500 millones de parámetros. Sobre él se aplica un ajuste QLoRA con cuantización 4-bit NF4 del modelo base, rango LoRA r=16 y alpha=32, según la model card. No se especifican en la información disponible los módulos objetivo del adaptador, la tasa de aprendizaje, el número de épocas ni la composición detallada del dataset más allá de los 1.150 SKUs reales de retail y delivery brasileño.

El dataset de entrenamiento es `LucasFig0/brazilian-delivery-catalog-sft`, orientado a supervised fine-tuning para catalogación. La innovación principal no es arquitectónica sino de dominio: el ajuste convierte una tarea de generación libre en una tarea de extracción estructurada con esquema JSON fijo, incluyendo campos de seguridad alimentaria (violaciones reducidas de 11 a 0 en el holdout). No se documentan en la información proporcionada el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de JSON estructurado conforme a un esquema predefinido para fichas de producto (compliance del 75,0 % en holdout, frente al 18,5 % del base).
- Extracción de campos normalizados: categoría, proteína/base principal, tamaño de porción, etiquetas dietéticas, componentes y sinónimos de búsqueda.
- Clasificación de productos de delivery y retail brasileño en categorías predefinidas (75,0 % de precisión en holdout).
- Detección de etiquetas dietéticas (micro-F1 de 31,84 % en holdout).
- Generación de sinónimos de búsqueda para mejorar la recuperación en catálogos (token F1 de 63,97 %).
- Control de seguridad alimentaria: eliminación de violaciones detectadas en el modelo base (de 11 a 0 en holdout).
- Capacidad multilingüe limitada al portugués según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información proporcionada.

## Casos de uso

- Normalización de catálogos de delivery: el adaptador recibe la descripción libre de un SKU y devuelve un JSON con campos normalizados, lo que permite alimentar bases de datos de producto con estructura consistente; es adecuado por su compliance del 75 % y su exact match medio del 69,7 %.
- Enriquecimiento de fichas de producto en marketplaces: generación automática de sinónimos de búsqueda (token F1 de 63,97 %) para mejorar la recuperación y el matching entre catálogos de distintos proveedores.
- Etiquetado dietético automatizado: clasificación de productos según restricciones alimentarias (vegano, sin gluten, etc.) con micro-F1 de 31,84 %, útil como primer filtro en flujos de revisión humana.
- Extracción de porciones y componentes: identificación de tamaño de porción (64,5 % de precisión) y descomposición en componentes (token F1 de 67,79 %) para sistemas de información nutricional.
- Control de calidad y seguridad alimentaria en catálogos: el adaptador elimina las violaciones de seguridad detectadas en el base (de 11 a 0), por lo que puede usarse como validador previo a la publicación de fichas.
- Clasificación automática de categorías de producto: con 75,0 % de precisión en holdout, sirve para triage y enrutado de SKUs en taxonomías de retail antes de revisión manual.
- Procesamiento por lotes de catálogos a bajo coste: al ser un adaptador sobre un modelo de 1,5 B, puede desplegarse en GPU de consumo y procesar grandes volúmenes de SKUs con latencia P50 de 1.934,95 ms por SKU.

## Benchmarks y rendimiento

Resultados reportados por el autor en el holdout set de 200 SKUs reales inéditos:

| Métrica | Base zero-shot | Fine-tuned QLoRA | Delta |
|---|---|---|---|
| JSON schema compliance rate (%) | 18,5 | 75,0 | +56,5 |
| Strict clean JSON sin reparación (%) | 0,0 | 60,5 | +60,5 |
| Mean field exact match (%) | 9,6 | 69,7 | +60,1 |
| Category accuracy (%) | 5,5 | 75,0 | +69,5 |
| Main protein/base accuracy (%) | 3,0 | 61,5 | +58,5 |
| Portion size accuracy (%) | 5,5 | 64,5 | +59,0 |
| Dietary tags micro-F1 (%) | 10,22 | 31,84 | +21,62 |
| Components token F1 (%) | 12,57 | 67,79 | +55,22 |
| Search synonyms token F1 (%) | 4,38 | 63,97 | +59,59 |
| Food safety violations (count) | 11,0 | 0,0 | -11,0 |
| Latency P50 (ms/SKU) | 1.123,61 | 1.934,95 | +811,34 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,5 B en precisión FP16 requiere aproximadamente 3 GB de VRAM; en cuantización 4-bit, alrededor de 1-1,5 GB. El adaptador añade un consumo despreciable (repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. Para lotes grandes o mayor throughput, se recomiendan A100/H100.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base), vLLM y TGI para servir el modelo fusionado, llama.cpp/Ollama si se convierte a GGUF. La librería declarada en el repo es `peft`.
- Latencia y throughput: latencia P50 reportada de 1.934,95 ms por SKU en el entorno de evaluación del autor; no se especifican hardware ni throughput (SKUs/s) en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `LucasFig0/qwen2.5-1.5b-ifood-catalog-qlora` | 1,5 B (adaptador LoRA) | No disponible | Extracción de catálogo en portugués | MIT | Hugging Face (adaptador PEFT) |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5 B | No disponible en esta ficha | Instrucción general | No disponible en esta ficha | Hugging Face |
| Alternativas de extracción estructurada de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de benchmarks frente a otros adaptadores o modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en portugués (`pt`); su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- El dominio es específico de catálogos de delivery y retail brasileño; fuera de ese ámbito (otros sectores, otras taxonomías) la precisión puede degradarse.
- La precisión de etiquetas dietéticas es la métrica más débil (micro-F1 de 31,84 %), por lo que no debe usarse como único criterio en decisiones de seguridad alimentaria sin revisión humana.
- La compliance estricta de JSON sin reparación es del 60,5 %, lo que implica que en torno al 40 % de las salidas pueden requerir reparación o post-procesado.
- La latencia medida (1.934,95 ms por SKU) es superior a la del base (1.123,61 ms); en pipelines de alto volumen debe evaluarse el throughput real en el hardware objetivo.
- Riesgo de alucinación inherente a los modelos generativos: campos ausentes en la descripción original pueden rellenarse con valores inventados; se recomienda validación contra el esquema y contra la fuente.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada; el dataset de 1.150 SKUs puede no representar toda la diversidad del catálogo brasileño.
- Licencia MIT: permite uso comercial, pero debe verificarse la licencia del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, que no se detalla en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente de los resultados reportados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LucasFig0/qwen2.5-1.5b-ifood-catalog-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFig0/brazilian-delivery-catalog-sft
