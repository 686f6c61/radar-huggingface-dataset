# prithivMLmods/OPO-8B-GGUF

## Resumen

OPO-8B es un modelo multimodal de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) construido sobre Qwen3-VL-8B-Instruct y entrenado con Observation Policy Optimization (OPO), una técnica presentada en el artículo de NeurIPS 2026 "Learning Where to Look: Observation Policy Optimization for Thinking with Images". El modelo aprende a seleccionar regiones de una imagen para inspeccionarlas con más detalle mediante ramificación guiada por incertidumbre, atribución de ventaja localizada en la evidencia y zoom multirretorno. Está publicado por prithivMLmods en formato GGUF, con el modelo base original de Yann0122.

El problema que resuelve es la percepción de alta resolución: en lugar de procesar una imagen completa a resolución fija, el modelo decide de forma iterativa qué recortes ampliar, lo que mejora la precisión en tareas de razonamiento visual fino. En los benchmarks publicados alcanza 93,19 en V\* (93,04 en atributos y 93,42 en espacial), 82,25 en HR-Bench 4K y 82,25 en HR-Bench 8K, superando al baseline de zoom de Qwen3-VL-8B en 5,2, 0,9 y 5,8 puntos respectivamente.

Esta ficha cubre la variante GGUF cuantizada, orientada a despliegue local con llama.cpp. El repositorio ocupa 62,9 GB e incluye pesos desde BF16 (16,4 GB) hasta Q3_K_M (4,12 GB), además de un proyector multimodal mmproj en BF16 de 1,16 GB. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-8B-Instruct) con política de observación entrenada por RL |
| Parametros totales | 8.190.735.360 (aproximadamente 8,19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M; proyector mmproj-bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-8B-Instruct, un transformer multimodal con torre visual y proyector hacia el espacio del lenguaje. Sobre esa base se aplica Observation Policy Optimization, un esquema de aprendizaje por refuerzo que entrena al modelo a decidir dónde mirar: genera ramificaciones guiadas por incertidumbre, atribuye ventaja a las evidencias localizadas en cada recorte y encadena múltiples turnos de zoom sobre regiones de la imagen. La evaluación publicada utiliza el repositorio de OPO con hasta 10 turnos de observación.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del propio entrenamiento con OPO. La innovación técnica destacable es precisamente el bucle de zoom multirretorno guiado por incertidumbre, que permite inspeccionar imágenes de alta resolución sin procesarlas enteras a máxima resolución. Esta variante GGUF ha sido cuantizada por prithivMLmods a partir del modelo base Yann0122/OPO-8B; no se documentan cambios en los pesos más allá de la cuantización.

## Capacidades

- Generación de texto y razonamiento multimodal imagen-texto.
- Razonamiento visual de alta resolución mediante zoom iterativo y selección de regiones.
- Comprensión de imágenes con preguntas de atributo y de relación espacial (benchmark V\*).
- Percepción en imágenes de alta resolución 4K y 8K (HR-Bench).
- Soporte de tool use / function calling, según las etiquetas del repositorio.
- Razonamiento multi-paso orientado a agentes (multi-step reasoning).
- Capacidades conversacionales multi-turno.
- Idiomas: inglés únicamente según la model card.

## Casos de uso

- Inspección de documentación técnica escaneada: el modelo puede ampliar regiones concretas de planos, esquemas o tablas de alta resolución para extraer valores y relaciones espaciales, aprovechando su bucle de zoom multirretorno.
- Análisis de imágenes satelitales o aéreas: la selección guiada por incertidumbre permite localizar objetos pequeños en recortes 4K/8K sin procesar la escena completa a máxima resolución.
- Control de calidad visual en manufactura: identificar defectos en fotografías de alta resolución ampliando las zonas sospechosas de forma iterativa.
- Asistencia en radiología o imagen médica de apoyo (no diagnóstico): revisión de regiones de interés en imágenes de alta resolución con trazabilidad de los recortes inspeccionados.
- Agentes que operan sobre capturas de pantalla: el soporte de tool use y el razonamiento multi-paso permiten interpretar interfaces complejas y decidir acciones.
- Extracción de información de gráficos y figuras científicas: localizar ejes, leyendas y puntos de datos mediante zoom dirigido.
- Verificación de atributos en catálogos de producto: comprobar color, forma o posición de elementos en fotografías de alta resolución.

## Benchmarks y rendimiento

| Benchmark | OPO-8B | Baseline zoom Qwen3-VL-8B | Diferencia |
|---|---|---|---|
| V\* (global) | 93,19 | no disponible | +5,2 |
| V\* atributo | 93,04 | no disponible | no disponible |
| V\* espacial | 93,42 | no disponible | no disponible |
| HR-Bench 4K | 82,25 | no disponible | +0,9 |
| HR-Bench 4K FSP | 94,00 | no disponible | no disponible |
| HR-Bench 4K FCP | 70,50 | no disponible | no disponible |
| HR-Bench 8K | 82,25 | no disponible | +5,8 |
| HR-Bench 8K FSP | 91,00 | no disponible | no disponible |
| HR-Bench 8K FCP | 73,50 | no disponible | no disponible |

La model card indica que el modelo supera a varios métodos de 7B–8B y se mantiene competitivo con modelos mayores, aunque algunos sistemas punteros obtienen puntuaciones superiores. No se publican resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos del modelo, sin proyector): Q3_K_M 4,12 GB; Q3_K_L 4,43 GB; Q4_K_S 4,8 GB; Q4_K_M 5,03 GB; Q5_K_S 5,72 GB; Q5_K_M 5,85 GB; Q6_K 6,73 GB; Q8_0 8,71 GB; BF16 16,4 GB.
- Hay que sumar el proyector multimodal mmproj-bf16 de 1,16 GB y el espacio para la caché KV, que depende del contexto configurado.
- GPU recomendadas: para BF16, A100 40 GB o H100; para Q4_K_M y Q5_K_M, RTX 4090 (24 GB) o RTX 3090 con margen amplio; para Q3_K_M y Q4_K_S, GPU de 8-12 GB como RTX 4070 o RTX 3060 12 GB.
- Cabe en GPU de consumo: sí, desde 8 GB de VRAM con cuantizaciones Q3 y Q4, asumiendo contexto moderado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (derivando el modelo), y servidores compatibles con endpoints; el repositorio también declara compatibilidad con text-generation-inference y transformers para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| OPO-8B (esta ficha) | 8,19 mil millones | no disponible | Razonamiento visual con zoom iterativo (OPO) | Apache 2.0 | GGUF, safetensors |
| Qwen3-VL-8B-Instruct (base) | aproximadamente 8 mil millones | no disponible | Multimodal generalista | no disponible en la información | safetensors |
| Baseline zoom Qwen3-VL-8B | aproximadamente 8 mil millones | no disponible | Zoom simple sin OPO | no disponible en la información | no disponible |

La model card menciona que OPO-8B supera a "varios otros métodos de 7B–8B" y es competitivo con modelos mayores, pero no identifica por nombre alternativas concretas ni ofrece sus métricas, por lo que la comparativa cuantitativa con terceros no está disponible.

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni evaluado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al heredar de Qwen3-VL, puede arrastrar los sesgos de su corpus de entrenamiento.
- Alucinación: como modelo generativo multimodal, puede producir descripciones o respuestas no sustentadas en la imagen, especialmente en regiones de bajo contraste o texto pequeño.
- Contexto: la longitud de contexto no está especificada; el bucle de hasta 10 turnos de zoom consume ventana y aumenta la latencia.
- Coste computacional: el zoom multirretorno implica varias pasadas de visión por consulta, lo que eleva el tiempo de inferencia frente a un modelo de una sola pasada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Yann0122/OPO-8B y de Qwen3-VL-8B-Instruct, ya que la model card original no especifica licencia para el modelo sin cuantizar.
- Producción: las cuantizaciones Q3 pueden degradar la precisión en tareas de percepción fina; se recomienda Q4_K_M o superior para usos sensibles.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/OPO-8B-GGUF
- Modelo base: https://huggingface.co/Yann0122/OPO-8B
- Pesos BF16: https://huggingface.co/prithivMLmods/OPO-8B-GGUF/blob/main/OPO-8B.BF16.gguf
- Pesos Q4_K_M: https://huggingface.co/prithivMLmods/OPO-8B-GGUF/blob/main/OPO-8B.Q4_K_M.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/OPO-8B-GGUF/blob/main/OPO-8B.mmproj-bf16.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Artículo OPO (NeurIPS 2026): no disponible enlace directo en la información proporcionada
- Repositorio de evaluación OPO: no disponible enlace directo en la información proporcionada
