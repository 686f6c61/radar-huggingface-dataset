# axteam/Motif-3-FP8-dynamic

## Resumen

Motif-3-FP8-dynamic es una cuantización FP8 dinámica del modelo Motif-Technologies/Motif-3, publicada por el usuario axteam en HuggingFace. El modelo base es un MoE (mixture of experts) de gran escala con 384 expertos más experto compartido, 53 capas y unos 315 mil millones de parámetros totales, orientado a generación de texto conversacional. La cuantización emplea el esquema W8A8 (pesos FP8 E4M3 por canal y activaciones FP8 dinámicas por token) mediante la librería compressed-tensors, reduciendo el tamaño en disco a unos 317,7 GB frente a los ~590 GB del modelo en BF16.

El objetivo principal de esta versión es reducir el coste de descarga y almacenamiento del modelo, ya que, según advierte el propio autor, Transformers descomprime los pesos a BF16 al cargarlos, por lo que la memoria pico de inferencia sigue siendo la del modelo original. Es relevante porque se trata de uno de los primeros checkpoints cuantizados disponibles de la arquitectura Motif, aunque su adopción es aún muy limitada (24 descargas y 1 like en el momento de la ficha) y ningún motor de inferencia conocido soporta la arquitectura con kernels cuantizados.

Cabe destacar que el repositorio sufrió un problema grave de carga que fue corregido el 31 de octubre de 2026: el archivo `modeling_motif.py` original impedía cargar los pesos de los expertos en 51 de las 53 capas (permanecían a cero). Si descargaste el repo antes de esa fecha, hay que volver a descargar el fichero de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (arquitectura Motif, 384 expertos + experto compartido, 53 capas, text-only) |
| Parametros totales | 314.841.775.750 (~315 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico (W8A8: pesos FP8 E4M3 por canal, activaciones FP8 dinámicas por token), esquema compressed-tensors `FP8_DYNAMIC` |
| Idiomas soportados | no disponible (el ejemplo de la model card usa coreano, lo que sugiere soporte de coreano e inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors float-quantized) |

## Arquitectura y entrenamiento

Motif-3 es un modelo de tipo transformer con arquitectura mixture-of-experts (MoE): 53 capas, 384 expertos enrutados más un experto compartido, y un mecanismo de atención que requiere obligatoriamente FlashAttention 2 (el código de modelado lanza un error si se usa otra implementación). La arquitectura incluye elementos peculiares como capas PolyNorm, escalares mHC y una capa MTP (multi-token prediction, `mtp_layers.0`), lo que apunta a técnicas de entrenamiento con predicción multi-token.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no hay datos disponibles en la información proporcionada. En cuanto a esta versión concreta, se trata de una cuantización post-entrenamiento (PTQ) sin recalibración ni reentrenamiento (data-free): se cuantizaron las proyecciones de atención, los expertos enrutados y compartidos y las proyecciones mHC, mientras que se mantienen en BF16 las incrustaciones de tokens, la LM head, todas las RMSNorm, los routers MoE, las puertas de salida de atención, los escalares PolyNorm/mHC y la capa MTP completa (aproximadamente el 1% de los parámetros). El tokenizador y la plantilla de chat son idénticos a los del modelo original. Un detalle técnico relevante: la cuantización divide los expertos fusionados del original (tensores 3D `gate_up_proj` [E, 2I, H] y `down_proj` [E, H, I]) en capas `nn.Linear` individuales por experto, por lo que este repo incluye un `modeling_motif.py` modificado; con el archivo original los pesos de los expertos no cargarían.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, con plantilla de chat incluida).
- Extracción de características (tag `feature-extraction` en el repositorio).
- Arquitectura MoE de gran escala con 384 expertos, que en teoría permite alta capacidad de conocimiento con cómputo por token reducido, aunque el número de parámetros activos no está documentado.
- Soporte de la capa MTP (multi-token prediction), que puede facilitar decodificación especulativa en futuras implementaciones (no verificada en la información disponible).
- Soporte de tool calling, agentes o capacidades multimodales: no disponible (el modelo es text-only).
- Capacidades multilingües: no documentadas; el ejemplo oficial de uso está en coreano.

## Casos de uso

- Investigación sobre arquitecturas MoE a gran escala: el código de modelado modificado y la estructura de expertos separados hacen de este repo un buen banco de pruebas para estudiar la implementación de Motif (routers, PolyNorm, mHC, MTP).
- Experimentación con cuantización FP8 en modelos enormes: al conservar en BF16 los componentes sensibles (routers, norms, embeddings), es un ejemplo práctico de qué mantener en alta precisión durante una PTQ W8A8.
- Despliegue en clúster multi-GPU con Transformers: con `device_map="auto"` el modelo se reparte entre todas las GPUs visibles y la RAM de CPU, útil para laboratorios con nodos de 8 GPUs de alta memoria.
- Chatbots conversacionales monolingües o bilingües (coreano/inglés): el ejemplo oficial muestra el uso con `apply_chat_template` y muestreo a `temperature=1.0`, `top_p=0.95`.
- Reducción de costes de almacenamiento y descarga en organizaciones que ya operan Motif-3: 317,7 GB frente a ~590 GB en BF16, casi la mitad de espacio en disco.
- Base para futuros motores de inferencia: al ser un checkpoint compressed-tensors estándar, puede servir como referencia para añadir soporte de Motif a vLLM u otros motores cuando la arquitectura sea soportada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni para el modelo cuantizado ni, en esta ficha, para el modelo base Motif-3).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 590 GB en pico. Aunque los pesos están en FP8 (~317,7 GB), Transformers (5.x) descomprime los pesos compressed-tensors a BF16 al cargar o en la primera ejecución, por lo que la memoria necesaria equivale al modelo BF16 completo.
- GPUs recomendadas: no disponible una configuración oficial, pero con ~590 GB de memoria pico se requiere un nodo multi-GPU de gama alta (por ejemplo, 8x H100 80 GB = 640 GB, o combinación de GPUs + RAM de CPU con `device_map="auto"`). No cabe en ninguna GPU de consumo.
- Consumer GPUs: no viable; el tamaño del modelo excede con mucho la VRAM de cualquier GPU de consumo incluso con la cuantización FP8.
- Despliegue: solo con Transformers y `trust_remote_code=True`, con `attn_implementation="flash_attention_2"` (obligatorio) y `device_map="auto"`. Dependencias: `transformers`, `compressed-tensors`, `accelerate`, `flash-attn`. vLLM (verificado hasta la versión 0.32) no soporta la arquitectura Motif, y ningún motor ejecuta todavía Motif-3 con kernels cuantizados.
- Latencia y throughput: no disponibles; al ejecutarse con pesos descomprimidos a BF16 en Transformers, se espera una inferencia lenta comparada con motores optimizados.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Cuantizacion | Licencia | Motor de inferencia |
|---|---|---|---|---|---|
| axteam/Motif-3-FP8-dynamic | ~315 B (totales) | MoE, 384 expertos, 53 capas | FP8 W8A8 dinámico (compressed-tensors) | MIT | Solo Transformers (vLLM no soportado) |
| Motif-Technologies/Motif-3 (base) | ~315 B | MoE, 384 expertos, 53 capas | BF16 | MIT | Solo Transformers |
| DeepSeek-V3 (referencia de categoria) | 671 B (37 B activos) | MoE | FP8 nativo | Licencia propia (uso comercial permitido con condiciones) | vLLM, SGLang, TGI |

Nota: la comparativa con DeepSeek-V3 es orientativa como referencia de MoE de gran escala; para Motif-3 no se conocen alternativas cuantizadas de terceros ni datos de rendimiento comparables. No hay más comparaciones disponibles con rigor.

## Limitaciones y advertencias

- Riesgo crítico de carga incorrecta: la primera versión del repo incluía el `modeling_motif.py` original, con el que Transformers cargaba los expertos a cero en 51 de 53 capas (el modelo generaría basura sin error aparente). Si descargaste antes del 31/10/2026, vuelve a descargar el fichero de modelado.
- La cuantización no reduce la memoria de inferencia: Transformers descomprime a BF16, con ~590 GB de memoria pico. El beneficio real es solo de descarga y almacenamiento.
- Ningún motor de inferencia soporta la arquitectura Motif con kernels cuantizados (vLLM 0.32 no la soporta), lo que limita el throughput y la viabilidad en producción.
- La cuantización es data-free (sin calibración), por lo que no hay garantías de que la degradación de calidad sea despreciable; no se han publicado evaluaciones de la versión cuantizada.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma del modelo base: no disponibles (no hay model card detallada de Motif-3 en la información proporcionada).
- Longitud de contexto y parámetros activos no documentados, lo que dificulta planificar cargas de trabajo con contexto largo.
- Requiere `trust_remote_code=True` (ejecución de código Python arbitrario del repo) y FlashAttention 2 de forma obligatoria.
- Licencia MIT, sin restricciones de uso comercial, pero siempre que se respeten las condiciones de la model card original de Motif-3.
- Adopción mínima (24 descargas), por lo que apenas existe documentación comunitaria ni soporte ante incidencias.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axteam/Motif-3-FP8-dynamic
- Modelo base: https://huggingface.co/Motif-Technologies/Motif-3
- Paper, blog oficial, demos o repositorio de código de Motif-Technologies: no disponibles en la información proporcionada.
