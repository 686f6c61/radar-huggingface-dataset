# brosnanyuen/Qwen3.8-27B-SFT-Defender-v3

## Resumen

`brosnanyuen/Qwen3.8-27B-SFT-Defender-v3` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario `brosnanyuen` sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, una variante cuantizada a 4 bits (bitsandbytes) del modelo citado como Qwen3.8-27B. Se distribuye en formato PEFT (`library_name: peft`), con pesos `safetensors` y un tamaño de repositorio de 1,3 GB, coherente con un adaptador de bajo rango y no con un modelo completo. El repositorio declara los tags `lora`, `sft`, `transformers`, `trl`, `unsloth` y `conversational`, además de la etiqueta `text-generation`.

Lo que el modelo resuelve no está documentado: la model card es la plantilla genérica de HuggingFace con todos los apartados marcados como «[More Information Needed]». No hay descripción de la tarea de ajuste, del conjunto de datos, de los hiperparámetros de LoRA (rango, alpha, módulos objetivo) ni de la evaluación. El sufijo «Defender» del identificador sugiere una orientación hacia seguridad o defensa, pero se trata de una inferencia a partir del nombre, no de un dato confirmado por el autor.

Su relevancia actual es muy limitada como artefacto publicable: acumula 0 descargas y 0 «likes», no declara licencia ni idiomas, y no cita ningún benchmark. Es, por tanto, un experimento de ajuste reproducible únicamente si se acepta a ciegas el modelo base y se reconstruye la configuración de entrenamiento por ensayo y error; resulta útil como referencia de formato PEFT + Unsloth, no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`; arquitectura interna del base no documentada |
| Parámetros totales | No disponible. El identificador del base indica ~27 000 millones de parámetros; el adaptador LoRA no declara su número de parámetros entrenables (repositorio de 1,3 GB) |
| Parámetros activos | No aplica / no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Modelo base en 4 bits mediante bitsandbytes (`bnb-4bit`); el adaptador se publica en `safetensors` sin cuantización declarada. No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `safetensors` con estructura PEFT/LoRA (`adapter_config.json` + `adapter_model.safetensors`); requiere cargar el modelo base por separado |
| Librería declarada | `peft` (versión de framework indicada: PEFT 0.20.0) |
| Pipeline | `text-generation` |
| Tamaño del repositorio | 1,3 GB |
| Fecha de creación / actualización | 20 de septiembre de 2026 (creación y actualización en el mismo día) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que se trata de un ajuste mediante LoRA (Low-Rank Adaptation) con entrenamiento supervisado (SFT), ejecutado previsiblemente con el stack Unsloth + TRL sobre un base cuantizado a 4 bits con bitsandbytes. No se documentan el rango (`r`), el `lora_alpha`, el `dropout`, los módulos objetivo (`q_proj`, `k_proj`, `v_proj`, etc.), la tasa de aprendizaje, el número de épocas ni la composición o el volumen del dataset de entrenamiento. Tampoco hay constancia de fases posteriores de alineación (RLHF, DPO, ORPO) ni de un modo de razonamiento explícito.

El uso de un base en `bnb-4bit` durante el ajuste implica que el adaptador se entrenó contra pesos cuantizados; conviene tenerlo en cuenta al fusionarlo o al aplicarlo sobre un checkpoint en `bf16`, ya que pueden aparecer diferencias numéricas respecto al comportamiento observado en entrenamiento. No se declara ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezcla de expertos) ni trabajo de interpretabilidad, y la única referencia académica del repositorio es el trabajo de Lacoste et al. (arXiv:1910.09700) sobre estimación de impacto ambiental, citado de forma genérica por la plantilla de model card y no como paper del modelo.

## Capacidades

- Generación de texto conversacional: es la única capacidad respaldada por los metadatos (`pipeline_tag: text-generation` y tag `conversational`).
- Ajuste supervisado sobre un dominio o comportamiento concreto: el nombre del adaptador indica una especialización, pero el dominio no está descrito.
- Razonamiento, matemáticas, generación de código y capacidades multilingües: no disponible (dependerían del modelo base, cuyo comportamiento no se documenta aquí).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo «thinking», visión, audio): no disponible.
- Longitud de contexto efectiva: no disponible.

## Casos de uso

Todos los escenarios siguientes son hipótesis de uso condicionadas a una validación previa, dado que el autor no documenta el propósito del ajuste ni publica evaluación alguna.

- Experimentación con PEFT y Unsloth: sirve como ejemplo reproducible de cómo se estructura un adaptador LoRA entrenado sobre un base cuantizado a 4 bits, útil para quienes quieran inspeccionar `adapter_config.json` y replicar el flujo.
- Ajuste de dominio sobre un modelo de ~27B con recursos limitados: al ser un adaptador de 1,3 GB, permite iterar sobre un base grande sin duplicar los 27 000 millones de parámetros en cada versión.
- Generación de texto conversacional especializado: si la especialización «Defender» se confirma, podría emplearse en asistentes de respuesta a incidentes o consultas de seguridad, siempre que se validen las salidas con pruebas propias.
- Comparación de adaptadores sobre el mismo base: permite medir, mediante un conjunto de evaluación propio, si el SFT mejora o degrada tareas generales respecto al base sin ajustar (olvido catastrófico).
- Investigación sobre cuantización y fidelidad: útil para estudiar cómo se comporta un adaptador entrenado en 4 bits al fusionarse con un checkpoint en `bf16`, y qué degradación introduce el proceso.
- Filtrado o clasificación por generación: un modelo ajustado para respuestas defensivas puede emplearse como generador de etiquetas o justificaciones en pipelines de moderación, con revisión humana obligatoria.
- Base para un ajuste posterior: al ser un adaptador PEFT, puede combinarse o continuar su entrenamiento con un segundo LoRA de dominio, aunque sin licencia declarada no hay garantía legal de redistribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación (aparece como «[More Information Needed]») y la búsqueda web realizada no devolvió ningún artículo, blog o discusión técnica sobre este modelo: los resultados obtenidos corresponden a portales de anuncios clasificados y no guardan relación con el modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño declarado del modelo base (~27 000 millones de parámetros) y no mediciones publicadas por el autor.

- Adaptador LoRA: 1,3 GB de disco. En VRAM, la huella del adaptador es despreciable frente a la del base, aunque los pesos del base deben estar cargados en memoria.
- Inferencia en `bf16`: en torno a 54 GB solo para pesos, más caché KV; requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- Inferencia en 8 bits: aproximadamente 27-28 GB de pesos; viable en A100 40 GB, L40S 48 GB o H100.
- Inferencia en 4 bits (configuración nativa del base): aproximadamente 14-16 GB de pesos, lo que permite ejecutarlo en una RTX 4090 (24 GB) o RTX 5090 con contextos moderados, y en GPU de 16 GB solo con contextos muy cortos.
- Fusionar el adaptador con el base en `bf16` y servir el modelo completo requiere, para el proceso de fusión, memoria suficiente para ambos estados, por lo que conviene hacerlo en CPU o en una máquina con RAM/VRAM abundante.
- Opciones de despliegue: `transformers` + `peft` (carga de base + adaptador) y, tras fusionar los pesos, servidores tipo vLLM o TGI. `llama.cpp` y Ollama no son utilizables directamente, porque no se publican pesos GGUF y habría que convertir el modelo fusionado.
- Latencia y throughput: no disponible (no se publican mediciones de tokens por segundo ni de latencia por petición).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador ni de sus alternativas en la información proporcionada, por lo que la comparación se limita a lo que puede verificarse en los metadatos.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `brosnanyuen/Qwen3.8-27B-SFT-Defender-v3` | Adaptador LoRA (SFT) | No disponible (base ~27B según identificador) | No disponible | No disponible | 0 descargas, 0 «likes», 1 seguidor potencial nulo |
| `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (modelo base) | Modelo completo cuantizado a 4 bits | No disponible con exactitud; el nombre indica ~27B | No disponible | No disponible en la información proporcionada | Modelo base referenciado por el adaptador |
| Otras alternativas de la misma categoría (adaptadores LoRA SFT sobre bases de ~27B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No es posible comparar MMLU, HumanEval, GSM8K ni ninguna otra métrica, porque no hay resultados publicados.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar, de modo que se desconocen la tarea objetivo, los datos de entrenamiento y los hiperparámetros, lo que impide auditar el ajuste.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; además, la licencia del modelo base puede imponer condiciones adicionales que el repositorio no recoge.
- Riesgo de alucinación: no evaluado. Al no haber benchmarks ni pruebas de fidelidad, las salidas deben verificarse siempre en entornos de producción.
- Sesgos: no disponibles. No se documenta ninguna evaluación demográfica, de toxicidad ni de sesgo de ningún tipo.
- Comportamiento multilingüe y longitud de contexto: no disponibles; no debe asumirse un rendimiento equivalente al del base sin medirlo.
- Posible olvido catastrófico: un SFT sobre un base cuantizado a 4 bits puede degradar capacidades generales no presentes en los datos de ajuste; es obligatorio comparar contra el modelo base antes de desplegarlo.
- Riesgo de falsa sensación de seguridad: el nombre «Defender» no implica que el modelo haya sido evaluado en tareas de seguridad, ni que sea resistente a ataques de *jailbreak* o de inyección de prompts.
- Cuantización y fidelidad: entrenar sobre pesos en 4 bits y servir después en `bf16` (o al revés) puede introducir divergencias respecto al comportamiento observado durante el entrenamiento.
- Trazabilidad: 0 descargas y 0 «likes» implican que no existe validación por parte de la comunidad; cualquier uso en producción parte de una validación propia desde cero.
- Riesgo de suplantación de marca: un identificador que mezcla una supuesta familia Qwen con un sufijo propio no garantiza relación alguna con el desarrollo oficial de dicha familia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brosnanyuen/Qwen3.8-27B-SFT-Defender-v3
- Modelo base declarado: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Referencia citada en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Página de PEFT: https://github.com/huggingface/peft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la búsqueda web realizada no devolvió ningún enlace relacionado con el modelo (papers, blogs, demos o repos); los únicos resultados obtenidos fueron portales de anuncios clasificados sin relación con el tema. No hay demo, paper ni hilo de discusión disponible.
