# showa-ai/marketplace-m0-professional-b

## Resumen

`showa-ai/marketplace-m0-professional-b` es un adaptador LoRA publicado por el usuario showa-ai sobre el modelo base declarado `Qwen/Qwen3.8-27B-FP8`. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino (fine-tuning) distribuido en formato PEFT, tal y como indican la librería declarada (`peft`), las etiquetas del repositorio (`lora`, `sft`, `unsloth`) y el propio tamaño del repositorio (0,3 GB), coherente con un adaptador y no con un modelo de decenas de miles de millones de parámetros.

El modelo se ha entrenado mediante supervisión directa (SFT, *supervised fine-tuning*) usando TRL, según la model card. Las versiones de framework documentadas por el autor son PEFT 0.21.0, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.8.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2. El nombre interno del modelo en la model card es `sft_base`, y el identificador del repositorio sugiere una orientación a un caso de uso de "marketplace profesional", aunque esa orientación no está documentada en ningún apartado de la ficha del autor.

La relevancia de esta ficha es limitada y conviene ser explicitos: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, no incluye datos de dataset, hiperparámetros de entrenamiento, evaluación, idiomas ni licencia, y la búsqueda web asociada no ha devuelto ningún resultado relevante sobre el modelo (los resultados obtenidos corresponden a la marca de guantes SHOWA, a la era Shōwa japonesa y a suspensiones de motocicleta). Por tanto, esta ficha documenta lo que el autor declara y marca de forma explícita todo lo que no se puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; la arquitectura interna del modelo base no está documentada en la información disponible |
| Parámetros totales | No disponible (el repositorio solo contiene pesos de adaptador; el nombre del modelo base sugiere del orden de 27B, sin confirmar) |
| Parámetros activos | No disponible / no aplicable (no se declara que el modelo base sea MoE) |
| Longitud de contexto | No disponible (se hereda del modelo base `Qwen/Qwen3.8-27B-FP8`, no declarada) |
| Tipos de cuantización | El modelo base declarado está en FP8; el adaptador se publica sin cuantizar. No se documentan versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido real) |
| Formato de pesos | Safetensors en formato de adaptador PEFT/LoRA (etiqueta `safetensors`, librería `peft`) |
| Modelo base | `Qwen/Qwen3.8-27B-FP8` |
| Método de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creación | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Lo único verificable es la capa de ajuste: un adaptador LoRA entrenado con SFT sobre el modelo base `Qwen/Qwen3.8-27B-FP8`, gestionado con PEFT 0.21.0 y TRL 0.24.0. El entrenamiento se ha ejecutado con PyTorch 2.8.0+cu128, Datasets 4.3.0 y Tokenizers 0.22.2, y la presencia de la etiqueta `unsloth` sugiere que el autor pudo haber utilizado Unsloth para acelerar el ajuste, aunque esto no se confirma en la model card.

No se especifica el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, el rango y alpha del adaptador, los módulos objetivo (target modules), la tasa de aprendizaje ni el número de épocas. Tampoco se documenta ninguna innovación técnica asociada (decodificación especulativa, atención lineal, decodificación restringida, etc.). La model card únicamente incluye una plantilla de inicio rápido con `transformers.pipeline` en la que el campo `model="None"` aparece sin resolver, lo que impide reproducir la carga del adaptador tal cual está publicada; para usarlo sería necesario cargar el modelo base y aplicar el adaptador con `PeftModel.from_pretrained`.

## Capacidades

- Generación de texto conversacional: la etiqueta de pipeline es `text-generation` y el repositorio se marca como `conversational`, por lo que el uso previsto es la generación de respuestas en formato de chat.
- Ajuste supervisado sobre un modelo base ya entrenado: el adaptador modifica el comportamiento del modelo base, no añade capacidades nuevas por sí mismo.
- Capacidad de razonamiento, código, matemáticas o visión: no disponible en la documentación; dependería íntegramente del modelo base, cuyas capacidades no se detallan aquí.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo de pensamiento (*thinking*), audio o cualquier capacidad especial: no disponible.

## Casos de uso

Advertencia previa: el autor no documenta el dominio, el dataset ni la evaluación del adaptador, por lo que los siguientes escenarios son aplicaciones coherentes con los metadatos técnicos (adaptador LoRA conversacional sobre un base de gran tamaño) y no casos validados por el publicador.

- Asistente conversacional especializado en un dominio concreto: el adaptador puede aplicarse sobre el modelo base para sesgar el estilo y el contenido de las respuestas hacia un vertical determinado (por ejemplo, atención a vendedores de un marketplace), cargándolo con `PeftModel` sobre `Qwen/Qwen3.8-27B-FP8` en FP8.
- Despliegue multi-tenant con un solo modelo base: al ser un adaptador de 0,3 GB, varios adaptadores pueden servirse sobre la misma instancia del modelo base en vLLM, que soporta carga dinámica de LoRA, reduciendo el coste por caso de uso frente a mantener un modelo completo por cliente.
- Personalización rápida por cliente en un producto SaaS: el tamaño del adaptador permite versionar, almacenar y servir variantes por cliente sin duplicar los pesos del modelo base.
- Generación de descripciones y fichas de producto: un adaptador afinado con SFT sobre textos de catálogo puede generar descripciones consistentes con el tono y la estructura de un marketplace, siempre que el autor hubiese documentado ese dataset (no lo ha hecho).
- Clasificación y reescritura de consultas de usuario en un buscador interno: uso del adaptador para normalizar o reescribir consultas antes de pasarlas a un motor de búsqueda, aprovechando la ventana de contexto del modelo base.
- Base para una segunda fase de alineación: al ser un `sft_base`, es un punto de partida razonable para aplicar después DPO, ORPO o RLHF con TRL, sin tener que repetir el ajuste supervisado desde cero.
- Prototipado e investigación en eficiencia de ajuste: útil como ejemplo reproducible de pipeline PEFT + TRL + Unsloth para estudiar el impacto de un adaptador pequeño sobre un modelo base cuantizado en FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K, MT-Bench u otras), no se aportan métricas de pérdida de validación y no existe comparación con el modelo base sin adaptador, por lo que no es posible determinar si el ajuste mejora, degrada o mantiene el rendimiento original.

## Requisitos de hardware

Las siguientes cifras son estimaciones orientativas derivadas del nombre del modelo base declarado (≈27B en FP8) y no están confirmadas por el autor. El repositorio, por sí solo, ocupa 0,3 GB y no es ejecutable sin el modelo base.

- VRAM para inferencia del modelo base en FP8: del orden de 27-30 GB solo para pesos, más caché KV. Con contexto largo, es realista esperar 32-48 GB según la longitud de secuencia y el tamaño de lote.
- GPU recomendadas para FP8: NVIDIA H100, H200, L40S o A100 (las arquitecturas Hopper y Ada Lovelace tienen soporte nativo de FP8 en las librerías de inferencia actuales). Una A100 requeriría conversión o *fallback* según el backend.
- GPU de consumo: una RTX 4090 o RTX 5090 con 24-32 GB no puede cargar el base en FP8 con margen suficiente para contexto largo. Solo sería viable fusionando el adaptador y recuantizando a 4 bits (~16-18 GB), operación no documentada ni publicada por el autor.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador, la ruta documentada por el autor, aunque el ejemplo de la model card está incompleto); vLLM con soporte de adaptadores LoRA (opción más eficiente para servir varias variantes); TGI y SGLang como alternativas; llama.cpp u Ollama únicamente si se fusiona el adaptador y se convierte a GGUF, conversión que el autor no proporciona.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni resultados de pruebas de carga.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. La búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con adaptadores comparables, y el autor no publica métricas. La siguiente tabla recoge únicamente lo verificable:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| showa-ai/marketplace-m0-professional-b | Adaptador LoRA (PEFT) | No disponible (adaptador de 0,3 GB) | No disponible (heredado del base) | No disponible | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen3.8-27B-FP8 | Modelo base declarado | No verificado en la información disponible (el nombre sugiere ~27B) | No disponible | No disponible | Referenciado por el autor, no verificado |
| Adaptadores LoRA alternativos de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ausencia total de documentación de evaluación: no hay benchmarks, ni métricas de validación, ni comparación con el modelo base. No se puede afirmar que el adaptador mejore el comportamiento del base en ninguna tarea.
- Licencia indefinida: el campo de licencia contiene el literal `licence: license`, sin texto legal. Esto impide determinar si el uso comercial está permitido. Además, la licencia del modelo base (`Qwen/Qwen3.8-27B-FP8`) impone sus propias condiciones, que tampoco se documentan aquí y que hay que verificar en su propio repositorio.
- Idiomas no declarados: no se especifica qué lenguas cubre el ajuste; asumir un buen rendimiento en castellano sería una suposición no respaldada.
- Riesgo de alucinación: no evaluado. Al no haber datos de entrenamiento ni de evaluación, no se puede acotar la tasa de fabricación de hechos, especialmente en dominios profesionales donde el nombre del repositorio sugiere uso.
- Sesgos: no documentados. El dataset de SFT es desconocido, por lo que no se puede auditar la composición ni los sesgos introducidos.
- Ejemplo de uso roto: el fragmento de código de la model card pasa `model="None"`, por lo que no funciona tal cual. Hay que construir la carga manualmente con `transformers` + `peft`.
- Trazabilidad mínima: 0 descargas y 1 like, repositorio creado y actualizado con 8 segundos de diferencia, sin historial de versiones, sin paper, sin demo y sin repositorio de código asociado.
- Idoneidad para producción: baja con la información actual. Antes de desplegarlo habría que validar el adaptador contra el modelo base en el dominio objetivo, fijar la licencia y confirmar compatibilidad de versiones (Transformers 5.5.0 y PyTorch 2.8.0 son versiones concretas que pueden no estar disponibles en todos los entornos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/showa-ai/marketplace-m0-professional-b
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Repositorio de TRL (framework de entrenamiento citado): https://github.com/huggingface/trl
- Repositorio de PEFT: https://github.com/huggingface/peft
- Búsqueda web: no se ha encontrado ningún enlace relevante sobre el modelo. Los resultados devueltos corresponden a la marca de guantes SHOWA (showagroup.com), a la era Shōwa en Wikipedia, a Showa by Genuine Parts Europe y a distribuidores de suspensiones de motocicleta, todos ellos sin relación con este adaptador.
