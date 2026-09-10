# Jeesup/svd-safety-l2_remove60_swapgap_b001

## Resumen

`Jeesup/svd-safety-l2_remove60_swapgap_b001` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. Sobre ese modelo base se aplicó compresión SVD-LLM eliminando el 60,01 % de los parámetros densos (la model card declara una fracción de parámetros resultante de 0,3999) y, a continuación, se restauraron 674 componentes SVD correspondientes a un presupuesto del 0,100 % de los parámetros densos, seleccionados mediante la regla `swapgap`. Es una única celda de una malla experimental sobre reglas de selección y presupuestos de restauración, no un asistente de propósito general.

El problema que aborda es la pérdida de comportamiento seguro provocada por la compresión de pesos: los propios autores indican que la compresión por sí sola eleva la tasa de éxito de ataques y que el objetivo del estudio es cuantificar ese daño y probar mecanismos de recuperación. Por eso la model card advierte explícitamente que varias celdas de la malla están degradadas de forma deliberada en seguridad respecto a Llama-2-7b-chat.

El modelo hereda la arquitectura transformer decoder-only de Llama 2, con 4.096 tokens de contexto, y se distribuye en safetensors bajo licencia Llama 2 Community License. Su relevancia es metodológica (compresión, seguridad e interpretabilidad), no práctica: el repositorio acumula 0 descargas y 0 likes, y no sustituye a un modelo conversacional desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) con pesos comprimidos mediante factorización SVD de bajo rango (SVD-LLM) |
| Parámetros totales | 6.738.415.616 según los metadatos de safetensors del repositorio; la model card declara una fracción de parámetros resultante de 0,3999 (≈40 %) respecto al modelo denso, dato que no concuerda con el recuento anterior y que no se explica en la información disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat; no se declara explícitamente en la model card) |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay variantes GPTQ, AWQ ni GGUF publicadas) |
| Idiomas soportados | no disponible en la model card; el modelo base Llama-2 está entrenado predominantemente en inglés |
| Licencia | Llama 2 Community License (`LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors |

Otros datos de procedencia declarados por el autor: compresión SVD-LLM con 60,01 % de parámetros eliminados, 674 componentes restaurados, 674 componentes sustituidos, fracción de parámetros resultante 0,3999 y semilla 42.

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama-2-7b-chat: un transformer decoder-only con normalización RMSNorm, RoPE y atención multi-cabeza. Este checkpoint no se ha reentrenado desde cero; es el resultado de una transformación de los pesos del modelo base. La compresión aplicada es SVD-LLM, que aproxima cada matriz de pesos mediante su descomposición en valores singulares truncada, eliminando el 60,01 % de los elementos densos. Sobre esa base comprimida se restauran después 674 componentes SVD (el 0,100 % del presupuesto de parámetros densos) según la regla `swapgap`, que decide qué componentes recuperar y cuáles sustituir.

No hay información en los materiales proporcionados sobre el número de tokens de entrenamiento, la composición del dataset ni sobre etapas de RLHF o DPO aplicadas a esta variante; el ajuste conversacional procede íntegramente de Llama-2-7b-chat. La innovación técnica del artefacto no es arquitectónica sino experimental: permite comparar reglas de selección de componentes bajo un presupuesto fijo de restauración y medir el efecto sobre seguridad y perplejidad.

## Capacidades

- Generación de texto conversacional en el estilo de Llama-2-7b-chat, con calidad degradada por la compresión: la perplejidad declarada en WikiText-2 es 17,7719.
- Seguridad medida y cuantificada: AdvBench ASR de 0,3500 y StrongREJECT ASR de 0,3578 con juez HarmBench, junto con un sobre-rechazo macro de 0,0773 según WildGuard.
- No hay soporte declarado de tool calling ni de function calling; Llama-2-chat no lo incorpora de forma nativa y la model card no menciona ninguna adaptación en ese sentido.
- No hay soporte declarado de agentes, razonamiento multi-paso ni modos de pensamiento explícitos.
- Capacidades multilingües: no disponibles; no se documenta ningún conjunto de idiomas y el modelo base está orientado al inglés.
- No hay capacidades de visión, audio ni multimodalidad.
- El artefacto está pensado como sujeto experimental para medir el compromiso entre seguridad y utilidad bajo compresión, no como asistente desplegable.

## Casos de uso

- Evaluación del impacto de la compresión en la seguridad: usar este checkpoint junto con el modelo base sin comprimir para medir cuánto sube la tasa de éxito de ataques (ASR) al eliminar el 60,01 % de los parámetros, empleando AdvBench o StrongREJECT con juez HarmBench.
- Comparación de reglas de selección de componentes: al ser una celda de una malla sobre reglas y presupuestos, sirve para contrastar `swapgap` frente a otras reglas de restauración manteniendo constante el presupuesto del 0,100 %.
- Investigación en interpretabilidad: los 674 componentes restaurados y los 674 sustituidos permiten analizar qué direcciones singulares concretas sostienen el comportamiento de rechazo y cuáles son prescindibles.
- Validación de jueces automáticos y clasificadores de rechazo: las métricas de ASR y de sobre-rechazo (WildGuard) lo convierten en un caso de prueba útil para calibrar clasificadores de seguridad.
- Reproducción de experimentos: la semilla declarada (42) y la procedencia documentada permiten repetir la construcción del checkpoint y verificar los valores publicados.
- Estudio del equilibrio entre utilidad y seguridad: la perplejidad en WikiText-2 (17,7719) frente a las tasas de ataque permite trazar curvas de compromiso entre degradación lingüística y degradación de seguridad.
- Docencia y divulgación sobre compresión de modelos: ilustra de forma concreta el coste de seguridad que puede tener una reducción agresiva de parámetros en un modelo alineado.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,3500 |
| StrongREJECT ASR (juez HarmBench) | 0,3578 |
| Macro over-refusal (WildGuard) | 0,0773 |
| Perplejidad en WikiText-2 | 17,7719 |

No se han publicado en la información disponible resultados de benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K ni equivalentes), ni cifras comparativas del modelo base o de otras celdas de la malla.

## Requisitos de hardware

- El repositorio ocupa 13,5 GB, coherente con pesos en FP16 de un modelo de la clase 7B; se estima un consumo de VRAM de aproximadamente 15-16 GB en FP16 contando la caché KV y el overhead del runtime.
- Cuantizado a 8 bits, la huella estimada baja a unos 8 GB; a 4 bits, a unos 5-6 GB.
- GPU de centro de datos: A100 (40 GB y 80 GB), H100 y L40S sin problema en FP16.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en FP16, aunque con poco margen; en RTX 4080 (16 GB) solo en cuantizaciones de 8 o 4 bits; en GPU de 8 GB, únicamente en 4 bits.
- Si la fracción de parámetros efectiva fuese realmente el 0,3999 declarado (≈2,7B), la huella en FP16 bajaría a unos 5,4 GB, pero este cálculo no concuerda con el tamaño del repositorio ni con los metadatos de safetensors.
- Opciones de despliegue: `transformers`, Text Generation Inference (el repositorio está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con HF Inference Endpoints), vLLM, y llama.cpp/Ollama si se convierte previamente a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Seguridad medida |
|---|---|---|---|---|---|
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | 6,74B | 4.096 tokens | Llama 2 Community License | HuggingFace | no disponible en la información proporcionada |
| `Jeesup/svd-safety-l2_remove60_swapgap_b001` | 6,74B según safetensors; fracción declarada 0,3999 | 4.096 tokens | Llama 2 Community License | HuggingFace (0 descargas, 0 likes) | AdvBench ASR 0,3500; StrongREJECT ASR 0,3578 |
| Otras celdas de la malla del mismo autor (otras reglas y presupuestos) | no disponible | 4.096 tokens (heredado) | Llama 2 Community License | no disponible | no disponible |
| Otras variantes comprimidas de Llama-2-7b (SliceGPT, SVD-LLM publicadas por terceros) | no disponible | no disponible | Llama 2 Community License | no disponible | no disponible |

No se dispone de cifras comparativas verificadas para modelos alternativos de la misma categoría dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: la model card lo describe como artefacto de investigación y advierte de que varias celdas de la malla están degradadas deliberadamente en seguridad.
- Las tasas de éxito de ataque son elevadas: 0,3500 en AdvBench y 0,3578 en StrongREJECT, lo que implica que aproximadamente uno de cada tres intentos maliciosos prospera según el juez HarmBench.
- La compresión degrada la calidad lingüística: perplejidad de 17,7719 en WikiText-2, sin dato de referencia del modelo base en la información disponible para cuantificar la pérdida.
- Riesgo de alucinación: no evaluado en la documentación proporcionada.
- Idiomas: no se declara ningún conjunto soportado; el base está orientado al inglés, por lo que el rendimiento en castellano es desconocido y presumiblemente limitado.
- Restricciones de licencia: se aplica la Llama 2 Community License, que obliga a incluir el aviso de atribución ("Built with Llama 2"), impone condiciones de uso aceptable recogidas en `USE_POLICY.md` y establece límites para despliegues a gran escala (cláusula de 700 millones de usuarios mensuales) y para el uso de las salidas para entrenar otros modelos.
- Inconsistencia documental: los metadatos de safetensors indican 6.738.415.616 parámetros, mientras que la model card declara una fracción resultante de 0,3999 respecto al denso; conviene verificar el checkpoint antes de sacar conclusiones de tamaño o coste.
- Sin validación externa: 0 descargas y 0 likes, y sin resultados en benchmarks estándar de capacidad, por lo que no existe evidencia independiente de su comportamiento.
- Cualquier uso en producción requeriría una evaluación propia de seguridad y de calidad, tal como recomiendan los propios autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_swapgap_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código de SVD-LLM: no disponible en la información proporcionada
- Demos o blogs del autor: no disponibles en la información proporcionada
- Nota sobre la búsqueda web: los resultados obtenidos solo contienen páginas genéricas de GitHub, Reddit y Zhihu, sin enlaces relevantes al modelo, a su paper ni a recursos asociados.
