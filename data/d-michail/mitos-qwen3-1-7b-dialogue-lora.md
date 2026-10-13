# d-michail/Mitos-Qwen3-1.7B-Dialogue-LoRA

## Resumen

Mitos-Qwen3-1.7B-Dialogue-LoRA es un conjunto de adaptadores LoRA (librería PEFT) sobre el modelo denso Qwen3-1.7B, publicado por el usuario d-michail. Adapta un transformer decoder-only de aproximadamente 1.700 millones de parámetros a la respuesta de preguntas sobre procedimientos administrativos del Registro Nacional de Procedimientos Administrativos griego (ΕΜΔΔ / Mitos). El objetivo declarado es responder como lo haría un funcionario de ventanilla: de forma breve, en torno a 25-45 palabras por respuesta, en griego.

El repositorio contiene dos adaptadores diferenciados. El de la raíz está entrenado sobre los 4.407 procedimientos del registro y es el adaptador final, ya fusionado en el modelo Mitos-Qwen3-1.7B-Dialogue. El de la subcarpeta `holdout/` se entrenó sobre 4.187 procedimientos, excluyendo los 220 reservados para evaluación, y es el que respalda las métricas publicadas; la propia model card advierte que evaluar el adaptador raíz sobre el split `unseen` invalida la comparación porque ya ha visto esos procedimientos. Los datos de entrenamiento son 90.145 diálogos sintéticos generados por un LLM a partir del texto de cada procedimiento y publicados en el dataset `d-michail/mitos-qa`.

Su interés práctico es acotado pero claro: ofrece una línea base pequeña (0,2 GB de adaptadores), reproducible y con evaluación sin juez sobre 1.933 preguntas, para investigación en QA de administración pública en griego, tanto en modo closed-book como con generación aumentada por recuperación (RAG) con distintas granularidades de fragmento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con adaptadores LoRA sobre las proyecciones de atención y MLP |
| Parametros totales | ~1.700 millones en el modelo base Qwen3-1.7B; los adaptadores LoRA se distribuyen aparte (repositorio de 0,2 GB) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 4.096 tokens (máximo de secuencia usado en el entrenamiento del adaptador); el contexto nativo del modelo base no se especifica en la informacion disponible |
| Tipos de cuantizacion | El autor no publica pesos cuantizados. Los adaptadores se distribuyen en bfloat16 sobre safetensors; la cuantizacion se aplicaria al modelo base (GGUF, AWQ, GPTQ, bitsandbytes) antes o despues de fusionar |
| Idiomas soportados | Griego (`el`) |
| Licencia | CC BY-SA 4.0 para los adaptadores; el modelo base Qwen3 se distribuye bajo Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |
| Modelo base | Qwen/Qwen3-1.7B |
| Rango y alpha de LoRA | rank 16, alpha 32 |
| Dataset de entrenamiento | d-michail/mitos-qa (configuracion `qa-all`), 90.145 registros sobre 4.407 procedimientos |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer decoder-only denso de la familia Qwen3. Sobre él se aplica un ajuste fino con LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, con optimización a learning rate 2e-4, scheduler coseno, 2 épocas, batch efectivo de 32 y precisión bfloat16. La longitud máxima de secuencia durante el entrenamiento fue de 4.096 tokens. La pérdida se calcula únicamente sobre los tokens del asistente, usando la plantilla de chat de Qwen3 con el modo de razonamiento desactivado (`enable_thinking=False`). No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra etapa de alineación posterior al ajuste supervisado.

Los datos proceden del Registro Nacional de Procedimientos Administrativos (Mitos), consultado a través de su API de datos abiertos. La instantánea se descargó el 1 y 2 de octubre de 2026, con registros actualizados entre el 26 de junio y el 1 de octubre de 2026. El texto de cada procedimiento se dividió en temas y se transformó en diálogos ciudadano-funcionario y en pares pregunta-respuesta mediante un LLM generador (identificado en la model card como Qwen3.8-27B). El resultado son 90.145 registros conversacionales repartidos entre los 4.407 procedimientos. La innovación destacable no es arquitectónica sino de dominio y de protocolo de evaluación: se publican dos adaptadores separados para evitar fuga de datos y se evalúa con métricas sin juez (recall de hechos clave y F1 de tokens) bajo cuatro regímenes de recuperación distintos.

## Capacidades

- Generación de texto conversacional en griego, con respuestas deliberadamente breves (media de 25 a 55 palabras según el régimen evaluado).
- Respuesta a preguntas sobre procedimientos administrativos griegos en modo closed-book, donde aprende el registro y el formato del dominio pero no los hechos concretos.
- Respuesta aumentada por recuperación (RAG) con un prompt en griego documentado que instruye al modelo a usar solo el contexto proporcionado y a declarar explícitamente cuándo la información es insuficiente.
- Adaptación a distintos formatos de contexto recuperado: fragmentos a nivel de campo (field-level chunks), ventanas divididas (RAG-split) y procedimientos completos (RAG-process).
- Hereda del modelo base la capacidad general de generación de texto, pero el ajuste está especializado: el comportamiento multilingüe del base no está evaluado ni garantizado tras el LoRA.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; el modo de pensamiento está desactivado y el entrenamiento se hizo sin system prompt.
- No hay capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Atención al ciudadano con recuperación documental: desplegar el modelo como generador de respuesta final en un pipeline RAG sobre la API de Mitos, pasando al prompt los fragmentos recuperados a nivel de campo. Es el escenario con mejores métricas publicadas (recall de hechos clave 0,484 y F1 de tokens 0,471) y para el que el modelo fue entrenado explícitamente.
- Asistente de ventanilla para trámites administrativos: responder en griego con extensión corta (25-45 palabras) a preguntas del tipo "qué documentos necesito" o "cuál es el plazo", encajando en interfaces de chat de baja latencia donde una respuesta larga es contraproducente.
- Investigación académica sobre QA en administración pública: usar el adaptador `holdout/` como referencia reproducible sobre el split de 220 procedimientos no vistos, comparando configuraciones de recuperación con las métricas sin juez ya publicadas.
- Evaluación comparativa de estrategias de recuperación: el modelo sirve como generador fijo para medir el efecto de la granularidad de los fragmentos (campo, ventana o procedimiento completo) sobre el recall de hechos clave y el F1, aislando la contribución del recuperador.
- Triaje y orientación previa: dado que el modelo conoce el registro y el formato del dominio, puede clasificar la consulta ciudadana y devolver el procedimiento o el identificador de 6 dígitos correspondiente, siempre que un componente de recuperación aporte el hecho concreto.
- Pre-rellenado asistido de formularios y borradores: generar un borrador de respuesta administrativa que un empleado público revisa y corrige antes de enviarlo, aprovechando el registro lingüístico del dominio y la brevedad de la salida.
- Transferencia a otros registros administrativos: reutilizar el esquema (texto de procedimiento, generación de diálogos sintéticos, LoRA de rango 16 y evaluación sin juez) para adaptar el mismo modelo base a los catálogos de procedimientos de otra administración pública.
- Filtro de suficiencia de contexto: explotar la instrucción de entrenamiento de declarar cuándo la información recuperada no basta como mecanismo de abstención, derivando a un humano los casos de baja confianza.

## Benchmarks y rendimiento

Evaluación del adaptador `holdout/` con métricas sin juez sobre 1.933 preguntas, según la model card. La columna "recall de hechos clave (base)" corresponde al modelo base sin ajustar y la columna "este modelo" al adaptador evaluado. El número de palabras es la longitud media de la respuesta generada por el adaptador.

| Sistema | Recall hechos clave (base) | Recall hechos clave (este modelo) | F1 de tokens (este modelo) | Palabras (este modelo) |
|---|---|---|---|---|
| Closed-book | 0,031 | 0,117 | 0,303 | 25 |
| RAG (fragmentos a nivel de campo) | 0,422 | 0,484 | 0,471 | 49 |
| RAG-split (ventanas) | 0,234 | 0,288 | 0,365 | 48 |
| RAG-process (procedimientos completos) | 0,202 | 0,222 | 0,333 | 55 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que la cita bibliográfica se añadirá junto con el artículo, que aún no está referenciado.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,4 GB solo para los pesos del base (1.700 millones de parámetros a 2 bytes), más el adaptador LoRA, las activaciones y la caché KV. Cálculo derivado del tamaño del modelo, no publicado por el autor.
- VRAM estimada con cuantización del base: alrededor de 1,8 GB en 8 bits y de 1,0-1,2 GB en 4 bits, más el adaptador. Estimaciones aritméticas, no verificadas por el autor.
- Cabe con holgura en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 de 8 GB, RTX 4070, e incluso en iGPU o CPU para los modos cuantizados más agresivos.
- No requiere GPU de centro de datos (A100, H100) salvo por concurrencia elevada; el cuello de botella en producción será la caché KV y el número de peticiones simultáneas, no los pesos.
- Despliegue con adaptadores: `transformers` + `peft` es la vía documentada en la model card, y vLLM admite servir adaptadores LoRA sobre el base sin fusionar.
- Despliegue con llama.cpp u Ollama: requiere convertir el adaptador a GGUF y aplicarlo sobre una cuantización GGUF de Qwen3-1.7B, o bien fusionar el adaptador y convertir el modelo resultante (véase el modelo fusionado Mitos-Qwen3-1.7B-Dialogue).
- TGI (Text Generation Inference) también puede servir el modelo, pero la información proporcionada no incluye guías de despliegue para estas plataformas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en el benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mitos-Qwen3-1.7B-Dialogue-LoRA (este modelo) | ~1,7 B + adaptador LoRA (0,2 GB) | 4.096 tokens en entrenamiento (nativo del base no especificado) | Recall 0,484 y F1 0,471 en RAG por campos | CC BY-SA 4.0 (adaptadores) | HuggingFace, repositorio de 0,2 GB |
| Qwen/Qwen3-1.7B (modelo base, sin ajustar) | ~1,7 B | no disponible en la informacion proporcionada | Recall 0,422 y sin ajuste de dominio; F1 no reportado para el base | Apache-2.0 | HuggingFace |
| d-michail/Mitos-Qwen3-1.7B-Dialogue (adaptador fusionado) | ~1,7 B | 4.096 tokens en entrenamiento (heredado) | No se publican metricas propias; equivale al adaptador raiz | CC BY-SA 4.0 | HuggingFace |
| Qwen/Qwen3-4B (alternativa mayor de la misma familia) | ~4 B | no indicado en la informacion disponible | No evaluado en este dominio | Apache-2.0 | HuggingFace |

No se dispone de comparaciones con otros modelos ajustados para administración pública griega (por ejemplo, alternativas de la familia Meltemi o ajustes similares) en la información proporcionada, ni de resultados de este modelo frente a ellos.

## Limitaciones y advertencias

- No es asesoramiento jurídico: las respuestas no tienen valor legal vinculante y un sistema desplegado debe mostrar la fuente, la fecha de recuperación y el enlace al procedimiento oficial.
- En modo closed-book el modelo aprende el registro y el formato del dominio, pero apenas los hechos: el recall de hechos clave se queda en 0,117. La exactitud procede casi por completo de la recuperación.
- Puede enunciar datos concretos erróneos (importes, plazos, documentos) con apariencia de verosimilitud. Toda respuesta debe verificarse contra el procedimiento vivo en `https://id.mitos.gov.gr/<ID>`.
- El registro subyacente no garantiza la completitud ni la corrección de su contenido (términos de uso de mitos.gov.gr, A.6) y los procedimientos cambian: los datos son una instantánea de octubre de 2026, por lo que el modelo queda desactualizado con el tiempo.
- Degeneración en bucles de repetición: los modelos pequeños a veces repiten hasta agotar el límite de tokens. Se recomienda penalización por repetición o una regla de parada en producción.
- Los datos de entrenamiento son sintéticos o generados por plantilla a partir de una única instantánea del registro, de modo que pueden reproducir los errores y el fraseo del generador.
- El entrenamiento se hizo sin system prompt y con el pensamiento desactivado; hay que usar la plantilla de chat de Qwen3 e introducir la pregunta (o el prompt de recuperación) en el mensaje de usuario.
- No evaluar el adaptador raíz sobre el split `unseen` del benchmark: ha visto esos 220 procedimientos. Para evaluación debe usarse el adaptador de `holdout/`.
- Cobertura lingüística limitada al griego; el comportamiento en otros idiomas no está evaluado.
- Licencia share-alike: los adaptadores se publican bajo CC BY-SA 4.0, la misma licencia del contenido del registro en el que se entrenaron. El uso comercial es posible, pero obliga a atribución y a mantener la misma licencia en las obras derivadas, lo que puede ser incompatible con despliegues propietarios. El código del modelo base es Apache-2.0, pero los pesos derivados están sujetos a CC BY-SA.
- Atribución obligatoria: los datos pertenecen al Εθνικό Μητρώο Διοικητικών Διαδικασιών - Μίτος y, según sus términos de uso, están supervisados por el Ministerio del Interior heleno, que no se identifica explícitamente como titular de los derechos de autor en el sitio.
- Riesgo de sesgo: no se documenta ningún análisis de sesgos demográficos, de género ni de accesibilidad en la información proporcionada.

## Enlaces

- Repositorio de adaptadores LoRA: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Dialogue-LoRA
- Modelo fusionado: https://huggingface.co/d-michail/Mitos-Qwen3-1.7B-Dialogue
- Dataset de entrenamiento: https://huggingface.co/datasets/d-michail/mitos-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Registro Nacional de Procedimientos Administrativos (Mitos): https://mitos.gov.gr
- API de datos abiertos de Mitos: https://api.mitos.gov.gr/info
- Consulta de un procedimiento por su identificador de 6 dígitos: https://id.mitos.gov.gr/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Texto de la licencia Apache-2.0 del modelo base: incluido en el repositorio como `LICENSE-Qwen3-Apache-2.0.txt` (Copyright 2024 Alibaba Cloud)
- Artículo científico: pendiente de publicacion, la model card indica que la cita se anadira mas adelante
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos eran paginas genericas sobre la letra "D".
