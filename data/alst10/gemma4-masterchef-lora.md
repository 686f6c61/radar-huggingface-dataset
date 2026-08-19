# alst10/gemma4-masterchef-lora

## Resumen

`alst10/gemma4-masterchef-lora` es un adaptador LoRA (PEFT) creado por el usuario alst10, diseñado para especializar el modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` en tareas relacionadas con recetas de cocina y alimentación. El nombre "masterchef" y la existencia de un dataset asociado (`alst10/gemma4-multimodal-recipe-dataset`) sugieren que el adaptador se ha entrenado mediante supervisión (SFT) para generar recetas, reconocer alimentos o responder consultas culinarias, aprovechando las capacidades multimodales del modelo base.

El adaptador tiene un tamaño de 0,2 GB, lo que indica que solo contiene los pesos del LoRA, no el modelo completo. Para su uso es necesario cargar el modelo base cuantizado en 4 bits (bnb) y aplicar el adaptador encima. A fecha de creación (agosto de 2026) no registra descargas ni valoraciones, por lo que se trata de un experimento personal sin validación comunitaria. La licencia no está especificada, lo que limita su uso en entornos comerciales sin consulta previa al autor.

La relevancia de este modelo radica en demostrar un flujo de fine-tuning eficiente con LoRA/QLoRA sobre Gemma 4, una familia de modelos abiertos de Google DeepMind. Sin embargo, al carecer de documentación técnica detallada y de resultados de evaluación, su utilidad práctica es incierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 4 E2B (modelo base: `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`) |
| Parametros totales | No disponible (el adaptador pesa 0,2 GB; el modelo base se estima en ~31B segun fuentes externas, sin confirmar) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | El adaptador se entrena sobre un modelo base cuantizado en 4 bits (bnb); el adaptador en si usa safetensors |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atencion y MLP. El modelo base es `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una version cuantizada en 4 bits de Gemma 4 E2B preparada por Unsloth para fine-tuning eficiente. Segun el blog de Lushbinary, Gemma 4 E2B tiene 31.000 millones de parametros, aunque este dato no esta confirmado en la informacion oficial de HuggingFace.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) usando la libreria TRL de HuggingFace, con PEFT 0.20.0. El dataset asociado, `alst10/gemma4-multimodal-recipe-dataset`, es multimodal e incluye imagenes de alimentos, recetas y recomendaciones dieteticas, lo que sugiere que el adaptador podria estar disenado para trabajar con entradas de imagen y texto. No se proporcionan hiperparametros de entrenamiento, numero de pasos, ni detalles sobre el proceso de preprocesado.

## Capacidades

- Generacion de texto conversacional: el adaptador hereda la capacidad de dialogo del modelo base Gemma 4 E2B, orientado a instrucciones.
- Especializacion en recetas de cocina: por el nombre y el dataset, se espera que genere recetas, liste ingredientes o explique pasos de preparacion.
- Posible soporte multimodal: el dataset de entrenamiento es multimodal, pero no se confirma si el adaptador modifica las capas de vision del modelo base o solo las de texto.
- No se dispone de informacion sobre tool calling, function calling, capacidades de agente o razonamiento multi-paso.

## Casos de uso

- Asistente de cocina personal: el modelo puede sugerir recetas basadas en ingredientes disponibles, generar listas de la compra o adaptar platos a restricciones dieteticas. Para usarlo, se cargaria el modelo base cuantizado y el adaptador LoRA, y se interactuaria en formato conversacional.
- Generacion de contenido gastronomico: redaccion de descripciones de platos, elaboracion de menus tematicos o creacion de variaciones de recetas clasicas. El adaptador, al estar entrenado con datos de recetas, podria producir textos mas coherentes en este dominio que el modelo base sin ajustar.
- Educacion culinaria: explicacion de tecnicas de cocina, sustituciones de ingredientes o resolucion de dudas sobre alérgenos. Requiere validar la exactitud de las respuestas, dado el riesgo de alucinacion.
- Integracion en aplicaciones de recomendacion dietetica: combinado con un sistema de vision (si el adaptador soporta multimodalidad), podria analizar una foto de un plato y ofrecer informacion nutricional aproximada.
- Prototipado de chatbots tematicos: desarrolladores pueden usar este adaptador como punto de partida para crear un bot de cocina, aunque la falta de documentacion y de evaluacion limita su fiabilidad.
- Investigacion sobre fine-tuning eficiente: sirve como ejemplo de como aplicar LoRA/QLoRA sobre Gemma 4 con Unsloth, util para estudiar el flujo de trabajo y los resultados obtenidos por un tercero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco hay evidencia de pruebas de calidad en tareas culinarias especificas.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (0,2 GB), pero requiere cargar el modelo base Gemma 4 E2B cuantizado en 4 bits, que ocupa aproximadamente 16-20 GB en VRAM (estimacion para un modelo de ~31B con cuantizacion 4-bit).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) o RTX 6000 Ada. En una RTX 4090 podria caber con cuantizacion 4-bit y secuencias cortas, pero el margen es ajustado.
- No se recomienda su uso en GPUs consumer de menos de 16 GB VRAM, salvo que se aplique una cuantizacion adicional o se reduzca la longitud de contexto.
- Opciones de despliegue: vLLM (aunque el soporte de LoRA para Gemma 4 aun no esta confirmado, segun el issue #39246 del repositorio de vLLM), llama.cpp con soporte de adaptadores, o HuggingFace Transformers con PEFT. Tambien se puede usar Ollama si se convierte el adaptador a formato GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para tareas de cocina sobre Gemma 4. Como referencia, se puede comparar con el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| `alst10/gemma4-masterchef-lora` | Adaptador LoRA (0,2 GB) sobre Gemma 4 E2B | No disponible | Recetas de cocina | No disponible |
| `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit` | ~31B (estimado) | No disponible | Instrucciones generales | Gemma (Google) |
| Otros modelos de recetas (p.ej. fine-tunes de Llama 3) | Variable | Variable | Cocina | Variable |

La comparativa es limitada porque no hay datos publicos de rendimiento del adaptador. Su principal diferencia es la especializacion en un dominio concreto, pero sin evaluacion no se puede afirmar que supere al modelo base en tareas culinarias.

## Limitaciones y advertencias

- Adaptador sin validacion: tiene 0 descargas y 0 likes, lo que indica que no ha sido probado por la comunidad. Su calidad es desconocida.
- Licencia no especificada: no se puede determinar si es permitido su uso comercial o la redistribucion. Se recomienda contactar al autor antes de cualquier uso en produccion.
- Dependencia del modelo base: el adaptador solo funciona con el modelo base exacto `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`. No es compatible con otras versiones de Gemma 4 sin reentrenamiento.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar ingredientes, cantidades o pasos de receta. No debe usarse como fuente unica de informacion en contextos donde la seguridad alimentaria sea critica.
- Sesgos potenciales: el dataset de entrenamiento no esta documentado, por lo que pueden existir sesgos culturales o regionales en las recetas generadas.
- Documentacion insuficiente: la model card no incluye detalles de entrenamiento, evaluacion ni limitaciones especificas. El autor no ha proporcionado informacion sobre el proceso de creacion.
- Soporte de vLLM para LoRA en Gemma 4: a fecha de la busqueda, vLLM no soportaba adaptadores LoRA para Gemma 4, lo que limita las opciones de despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alst10/gemma4-masterchef-lora
- Dataset asociado: https://huggingface.co/datasets/alst10/gemma4-multimodal-recipe-dataset
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Pagina oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Technical report de Gemma 4 (arXiv): https://arxiv.org/html/2607.02770v1
- Paper de LoRA (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Guia de fine-tuning con LoRA/QLoRA para Gemma 4: https://lushbinary.com/blog/fine-tune-gemma-4-lora-qlora-complete-guide/
- Issue de vLLM sobre soporte LoRA para Gemma 4: https://github.com/vllm-project/vllm/issues/39246
