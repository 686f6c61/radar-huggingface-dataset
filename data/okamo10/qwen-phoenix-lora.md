# okamo10/qwen-phoenix-lora

## Resumen

`okamo10/qwen-phoenix-lora` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario okamo10, entrenado mediante SFT sobre el modelo base `unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`, es decir, una versión del Qwen2.5-7B-Instruct de Alibaba cuantizada a 4 bits con la librería Unsloth. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo, por lo que su uso requiere descargar y cargar el checkpoint base por separado y aplicar el adaptador con PEFT. La model card es la plantilla por defecto de HuggingFace y no está rellenada: no documenta propósito, datos de entrenamiento, hiperparámetros ni evaluación.

Por tanto, se trata de un ajuste fino ligero y experimental, sin información publicada sobre el conjunto de datos, el objetivo del entrenamiento (pese al nombre "phoenix", no se explica a qué se refiere) ni los resultados obtenidos. Con 0 descargas y 1 "like" en el momento de la consulta, y un repositorio creado el 2026-10-23, no hay evidencia de uso ni de validación por parte de la comunidad. Es relevante únicamente como ejemplo de flujo de trabajo LoRA/SFT con Unsloth sobre Qwen2.5, o para quien quiera inspeccionar los pesos del adaptador.

Al estar construido sobre Qwen2.5-7B-Instruct, hereda las capacidades del modelo base (generación de texto conversacional, razonamiento, código, matemáticas, soporte multilingüe y de tool calling), pero el adaptador puede haber alterado o degradado esas capacidades, y no hay evaluación que lo confirme. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; modelo base `unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit` |
| Parametros totales | No disponible para el adaptador (el modelo base tiene 7,6 mil millones según su documentación pública) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5-7B-Instruct declara 32 768 tokens nativos, ampliables con YaRN) |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors sin cuantizar; el base referenciado usa cuantización de 4 bits (bnb-4bit). El adaptador puede fusionarse y recuantizarse a GGUF/AWQ/GPTQ, aunque no se documenta |
| Idiomas soportados | No disponible en la información proporcionada (el base es multilingüe) |
| Licencia | No disponible; la model card no la especifica |
| Formato de pesos | safetensors (adaptador PEFT; requiere `adapter_config.json`) |
| Etiquetas | peft, lora, sft, transformers, trl, unsloth, text-generation, conversational |
| Framework declarado | PEFT 0.20.0 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación | 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only con atención de causal estándar, normalización RMSNorm y embeddings RoPE, con aproximadamente 7,6 mil millones de parámetros. El adaptador inyecta matrices de bajo rango en determinadas capas (el rango, alpha y módulos objetivo concretos no están documentados en la model card y habría que consultarlos en `adapter_config.json`), y se entrenó sobre la variante del base cuantizada a 4 bits con Unsloth, un stack optimizado para SFT con TRL sobre GPUs de consumo.

No hay información sobre el conjunto de datos de entrenamiento, el número de tokens vistos, la composición del corpus, si hubo etapas de RLHF o DPO, ni los hiperparámetros (learning rate, épocas, batch size, precisión). Las etiquetas `sft` y `trl` indican que se usó supervised fine-tuning con la librería TRL, y `unsloth` que se empleó esa implementación para el entrenamiento. No se documenta ninguna innovación técnica propia: el interés técnico se limita a ser un ejemplo reproducible de ajuste LoRA de bajo coste sobre un 7B cuantizado a 4 bits.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-7B-Instruct (el adaptador no documenta cambios en el formato de prompt ni en las plantillas de chat).
- Razonamiento y matemáticas de nivel 7B, presumiblemente similares al base, sin evaluación que lo confirme.
- Generación y explicación de código, también heredada del base.
- Soporte de tool calling / function calling: el base lo soporta; no se ha verificado que el adaptador lo preserve.
- Soporte multilingüe (el base cubre decenas de idiomas, incluido el castellano); el adaptador no indica idiomas ni datos de entrenamiento lingüístico.
- Capacidad de agentes y razonamiento multi-paso: no documentada para el adaptador.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito; el base es exclusivamente de texto.

## Casos de uso

- Evaluación de adaptadores LoRA: cargar el adaptador con PEFT sobre el base y comparar sus salidas con las del Qwen2.5-7B-Instruct original para medir la deriva introducida por el SFT. Es el uso más realista dado el estado del repositorio.
- Reproducción de un pipeline de SFT con Unsloth y TRL: sirve como referencia práctica de cómo se estructura un repositorio de adaptador (pesos, `adapter_config.json`, etiquetas) para quien esté montando su propio flujo de fine-tuning.
- Experimentación académica con fine-tuning de bajo rango: usar el adaptador como punto de partida para estudiar cómo afecta el rango LoRA y la cuantización del base a tareas concretas, siempre con un conjunto de evaluación propio.
- Prototipado interno de asistentes conversacionales en castellano: desplegando base + adaptador con Transformers en una GPU de 24 GB, para validar si el ajuste mejora el tono o el dominio antes de invertir en un entrenamiento mayor.
- Base para un segundo ajuste específico de dominio: el adaptador puede combinarse o continuarse con nuevos datos (por ejemplo, soporte técnico o documentación interna) usando PEFT, aunque sin garantías de calidad al no existir evaluación previa.
- Docencia y demos de fine-tuning en GPUs de consumo: el base cuantizado a 4 bits más el adaptador cabe en tarjetas de 12 GB, lo que permite mostrar el ciclo completo de entrenamiento e inferencia en hardware asequible.
- No recomendado para atención al cliente en producción, generación de código crítica ni flujos de agentes sin una evaluación exhaustiva previa: no hay benchmarks, ni licencia declarada, ni documentación de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna sección de evaluación cumplimentada (todas las tablas de resultados aparecen como "[More Information Needed]"), y los resultados de búsqueda web no aportan datos sobre el modelo.

## Requisitos de hardware

- VRAM para el adaptador: 0,2 GB en disco; en memoria, las matrices LoRA añaden una fracción pequeña de parámetros sobre el base (el tamaño exacto depende del rango, no documentado).
- VRAM para el modelo base: aproximadamente 4,5-5,5 GB en precisión de 4 bits (el base referenciado ya está en bnb-4bit), más caché KV; del orden de 14-16 GB en fp16/bf16 para los 7,6 B de parámetros. Estimaciones basadas en el recuento de parámetros, no medidas publicadas.
- GPUs de consumo: cabe en 4 bits en una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; en fp16 encaja con holgura en una RTX 4090 24 GB o RTX 3090 24 GB.
- GPUs de datacenter: A100 40/80 GB, H100 o L40S para servir en fp16 con lotes grandes y contexto largo.
- Despliegue: Transformers + PEFT es la vía directa (requiere aplicar el adaptador en tiempo de carga); vLLM soporta adaptadores LoRA dinámicos; TGI también permite adaptadores. Para llama.cpp u Ollama es necesario fusionar el adaptador con el base (`merge_and_unload`) y convertir a GGUF, ya que estos motores no cargan el adaptador PEFT tal cual.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador; como referencia muy gruesa, un 7B en 4 bits sobre una RTX 4090 suele moverse en decenas de tokens por segundo en decodificación, pero son cifras orientativas del modelo base, no del adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| okamo10/qwen-phoenix-lora | Adaptador LoRA sobre base de 7,6 B | No disponible | No disponible | HuggingFace, 0 descargas | No |
| Qwen2.5-7B-Instruct (base) | 7,6 B | 32 768 nativos (ampliable con YaRN) | Apache-2.0 según su documentación pública | HuggingFace, ampliamente usado | Sí, en la model card oficial |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32 768 | Apache-2.0 | HuggingFace | Parcial, en su model card |
| Llama-3.1-8B-Instruct | 8,0 B | 128 000 | Licencia comunitaria de Meta (con restricciones) | HuggingFace, licencia aceptable | Sí, en su model card |

Nota: los datos de los modelos comparativos provienen de su documentación pública y no han sido verificados en la información proporcionada en esta consulta; los de este adaptador figuran como "no disponible" porque su model card no los recoge. No se dispone de comparación de rendimiento porque el adaptador no publica benchmarks.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos de entrenamiento, hiperparámetros, propósito ni evaluación. Es imposible saber qué mejora o qué degrada el adaptador respecto al base.
- Riesgo de alucinación: heredado del base Qwen2.5-7B-Instruct y potencialmente agravado o alterado por un SFT sin evaluación; no hay mediciones de fidelidad factual.
- Sesgos: no documentados. Al desconocerse la composición del dataset de SFT, no se puede evaluar el sesgo introducido.
- Licencia no declarada: el repositorio no especifica licencia. El modelo base Qwen2.5-7B-Instruct se publica bajo Apache-2.0 según su documentación pública, pero eso no determina automáticamente los términos del adaptador. Antes de cualquier uso comercial, conviene contactar con el autor o asumir que no hay permiso explícito.
- Idiomas: no se declara ningún conjunto de idiomas soportado; el comportamiento en castellano no está verificado.
- Contexto: no se documenta la ventana utilizada durante el entrenamiento; aunque el base soporte 32 768 tokens, el adaptador puede haber sido entrenado con secuencias más cortas.
- Madurez: 0 descargas y 1 "like"; repositorio creado el 2026-10-23 y actualizado cuatro segundos después, lo que sugiere una subida automática sin revisión posterior.
- Dependencia del base: los pesos no son autónomos; hay que replicar exactamente la configuración del base (`unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit`) o fusionar el adaptador, lo que añade pasos y posibles errores de compatibilidad.
- Trazabilidad: el tag `arxiv:1910.09700` que aparece en el repositorio corresponde a Lacoste et al. sobre el cálculo de impacto ambiental, citado en la plantilla de HuggingFace; no es un artículo sobre este modelo.
- No apto para producción sin evaluación propia: sin benchmarks ni datos de entrenamiento, cualquier despliegue debería validarse con un conjunto de pruebas representativo del dominio objetivo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/okamo10/qwen-phoenix-lora
- Modelo base referenciado: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-unsloth-bnb-4bit
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact
- Artículo de Lacoste et al. (2019) citado en la plantilla: https://arxiv.org/abs/1910.09700
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo (los resultados obtenidos corresponden a contenido no relacionado).
