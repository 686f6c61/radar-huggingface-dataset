# mithil77/cartly-models

## Resumen

Cartly models es un repositorio de pesos publicado por mithil77 que contiene los modelos que ejecuta la aplicación de búsqueda de compras Cartly, pensada para inferencia local en CPU mediante ONNX Runtime. No se trata de un modelo generativo único, sino de un conjunto empaquetado de tres piezas: una capa de decisión basada en el encoder Laya (fine-tuned de `convaiinnovations/laya-multilingual`), un encoder de texto Qwen3-Embedding-0.6B recortado a 512 dimensiones y cuantizado a 8 bits, y la torre de texto de SigLIP2 para comparar consultas textuales con vectores de imágenes de producto.

El problema que resuelve es el de la interpretación estructurada de consultas de compra en inglés y hinglish (inglés con interferencias de hindi), típico del mercado indio: intención, referencias, rol de la marca, intención visual, rigidez de presupuesto, especificidad y categoría. La capa Laya incorpora una cabeza de clasificación por pregunta, con temperaturas de calibración ajustadas por cabeza, lo que permite convertir una consulta libre en señales discretas utilizables por un motor de búsqueda.

Es relevante ahora por su enfoque de despliegue en local y en CPU, sin dependencia de GPU, y por combinar recuperación multimodal (texto e imagen) con un modelo de embeddings pequeño y eficiente. El repositorio ocupa 3,5 GB y la licencia es Apache-2.0, heredada de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de encoders transformer: Laya (capa de decisión con cabezas de clasificación), Qwen3-Embedding-0.6B (encoder de texto) y SigLIP2 base patch16-224 (torre de texto multimodal) |
| Parametros totales | No disponible (los pesos se distribuyen como artefactos ONNX; Qwen3-Embedding aporta 0,6 B, Laya y SigLIP2 no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Qwen3-Embedding en 8 bits solo pesos (w8); Laya y SigLIP2 en FP32; sin cuantizaciones adicionales documentadas |
| Idiomas soportados | Inglés (en) y hinglish/hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx` + `.data`), con tokenizers y configuración de cabezas en formato propio; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo monolítico, sino tres componentes con roles distintos. La capa de decisión parte del encoder Laya (`convaiinnovations/laya-multilingual`) y se fine-tunea con una cabeza de clasificación por pregunta: intención, referencia, rol de marca, intención visual, rigidez de presupuesto, especificidad y categoría. Las cabezas se exportan a ONNX en FP32 y se acompañan de un fichero de calibración con una temperatura por cabeza, ajustada sobre un split de calibración reservado. El encoder de texto Qwen3-Embedding-0.6B se recorta a 512 dimensiones de salida y se cuantiza solo en pesos a 8 bits para reducir coste en CPU. La torre de texto de SigLIP2 base patch16-224 se usa para proyectar consultas textuales al mismo espacio que los vectores de imagen de producto, habilitando búsqueda cruzada texto-imagen.

El entrenamiento de las cabezas Laya se realizó sobre conversaciones de compra sintéticas construidas a partir del catálogo, y la evaluación se hizo sobre un conjunto de test escrito a mano (G1, unas 330 consultas en inglés y hinglish) que nunca se usó en entrenamiento. Los tokenizers de los dos encoders y la torre de imagen de SigLIP2 no se copian al repositorio: se descargan desde sus repositorios originales en revisiones fijadas. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset sintético ni si hubo RLHF o DPO; al tratarse de encoders y clasificadores, esos procedimientos no son el mecanismo habitual.

## Capacidades

- Clasificación multi-etiqueta de consultas de compra: intención, referencia, rol de marca, intención visual, rigidez de presupuesto, especificidad y categoría, cada una con su propia cabeza y temperatura calibrada.
- Comprensión de inglés y hinglish, incluyendo mezclas de idioma dentro de una misma consulta.
- Generación de embeddings de texto de 512 dimensiones con Qwen3-Embedding-0.6B cuantizado a 8 bits.
- Proyección de texto al espacio visual de SigLIP2 para comparar consultas con vectores de imagen de producto.
- Búsqueda multimodal texto-imagen en un catálogo de productos.
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- No se documentan capacidades de generación de texto, razonamiento libre, código, matemáticas, tool calling, agentes ni modo thinking; el repositorio está orientado a recuperación y clasificación.

## Casos de uso

- Búsqueda de producto en lenguaje natural: la capa Laya extrae categoría, marca y especificidad de la consulta, y el embedding Qwen3 recupera candidatos del catálogo; adecuado porque separa señales estructuradas de la similitud semántica.
- Búsqueda visual por descripción: una consulta textual se proyecta con la torre de texto de SigLIP2 al espacio de los vectores de imagen, permitiendo encontrar productos parecidos a una foto o a una descripción visual.
- Filtrado por presupuesto: la cabeza de rigidez de presupuesto distingue consultas con límite estricto de las que solo expresan preferencia, lo que permite aplicar filtros de precio solo cuando procede.
- Desambiguación de marcas: la cabeza de rol de marca diferencia una marca como requisito frente a una marca mencionada como referencia o comparación, evitando devolver resultados de la marca equivocada.
- Atención al cliente y asistentes de compra en local: el conjunto se ejecuta en CPU en el propio equipo del usuario, lo que encaja en escenarios con requisitos de privacidad o sin conectividad.
- Normalización de consultas para analítica: las salidas por cabeza pueden registrarse para medir distribuciones de intención y categoría en el tráfico de búsqueda de un marketplace.
- Mercados multilingües del sur de Asia: el soporte de hinglish cubre consultas reales de usuarios indios que mezclan inglés y hindi, un caso poco atendido por modelos solo en inglés.

## Benchmarks y rendimiento

La model card menciona una evaluación sobre un conjunto de test manual (G1, unas 330 consultas en inglés y hinglish) nunca usado en entrenamiento, con números y método en `docs/05-laya-decision-layer.md` y `docs/09-evaluation-and-phases.md` del repositorio de código. Esos resultados no se incluyen en la información disponible.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime, que es el objetivo declarado del repositorio; no se especifican requisitos mínimos de CPU ni de RAM.
- VRAM estimada para GPU: no disponible; el diseño no requiere GPU.
- GPU recomendadas: no aplica; no se documentan recomendaciones de GPU.
- Cabe en GPU de consumo: sí en principio, al estar pensado para CPU, aunque no se aportan cifras de memoria.
- Opciones de despliegue: ONNX Runtime; el script de instalación de Cartly descarga los ficheros y los verifica contra `release/manifest.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Cartly models (mithil77) | Ensemble de encoders ONNX para búsqueda de compras | 0,6 B en el encoder de texto; resto no disponible | No disponible | en, hi | Apache-2.0 | ONNX |
| Qwen/Qwen3-Embedding-0.6B | Encoder de embeddings | 0,6 B | No disponible en esta ficha | Multilingüe | Apache-2.0 | Safetensors, ONNX |
| google/siglip2-base-patch16-224 | Vision-language dual encoder | No disponible en esta ficha | No disponible en esta ficha | Multilingüe | Apache-2.0 | Safetensors |
| convaiinnovations/laya-multilingual | Encoder multilingüe | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha |

La comparación directa con alternativas de la misma categoría (sistemas de búsqueda de comercio electrónico con capa de decisión estructurada) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: el entrenamiento de las cabezas se hizo sobre conversaciones sintéticas derivadas de un catálogo concreto; el comportamiento fuera de ese dominio de producto puede degradarse.
- Alucinación: al ser clasificadores y encoders, no generan texto libre, pero las cabezas pueden asignar etiquetas erróneas con alta confianza si la consulta cae fuera de la distribución de entrenamiento.
- Idiomas: cobertura declarada solo de inglés y hinglish; no hay soporte documentado para otras lenguas, incluido el castellano.
- Contexto: la longitud máxima de contexto no está documentada, lo que impide planificar consultas largas o conversaciones multi-turno sin pruebas previas.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero `NOTICE` y las licencias de los modelos base, ya que los tokenizers y la torre de imagen de SigLIP2 se descargan de sus repositorios originales.
- Producción: el repositorio tiene cero descargas y cero likes, y no incluye benchmarks publicados; la validación depende de los documentos del repositorio de código, que no forman parte de esta información.
- Dependencia de revisiones fijadas: los tokenizers y la torre de imagen se obtienen de terceros en revisiones concretas, lo que exige gestionar su disponibilidad y verificación en despliegues reproducibles.
- Calibración: las temperaturas por cabeza se ajustaron en un split reservado; su validez fuera de ese catálogo y de ese conjunto de consultas no está garantizada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mithil77/cartly-models
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya-multilingual
- Modelo base Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Modelo base SigLIP2: https://huggingface.co/google/siglip2-base-patch16-224
- Documentación de la capa de decisión y evaluación: `docs/05-laya-decision-layer.md` y `docs/09-evaluation-and-phases.md` en el repositorio de código de Cartly (no se dispone de URL directa en la información proporcionada)
- Fichero de manifiesto de release: `release/manifest.json` en el repositorio de código de Cartly (no se dispone de URL directa)
