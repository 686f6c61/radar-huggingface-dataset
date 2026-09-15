# lewtun/tailsft-repro-olmo2-1b-tail50

## Resumen

`lewtun/tailsft-repro-olmo2-1b-tail50` es un ajuste fino supervisado (SFT) del modelo base `allenai/OLMo-2-0425-1B` de AllenAI, publicado por el usuario lewtun (Lewis Tunstall, equipo de Hugging Face). El nombre del repositorio indica que forma parte de un experimento de reproducibilidad sobre mezclas de datos SFT con enfasis en la "cola" (tail) de la distribucion, con una configuracion etiquetada como `tail50`. Se trata, por tanto, de un artefacto de investigacion orientado a comparar recetas de entrenamiento, no de un modelo pensado para produccion.

El modelo es un transformer decoder-only denso de 1.484.916.736 parametros (aproximadamente 1,48 mil millones), derivado directamente de OLMo 2 1B. Hereda de su base la arquitectura OLMo 2, que incorpora normalizacion RMSNorm con reordenacion, QK-Norm y atencion con RoPE, y esta entrenado para generacion de texto con formato conversacional, segun indican las etiquetas `text-generation` y `conversational`. El entrenamiento se realizo con TRL 1.13.0 sobre Transformers 5.17.0 y PyTorch 2.14.0, y el run esta registrado en Trackio.

Su relevancia es limitada y muy especifica: al contar con 0 descargas y 0 likes en el momento de la consulta, y al no publicar resultados de evaluacion, se trata de un checkpoint de reproducibilidad util para quien quiera auditar la receta `tailsft` sobre OLMo 2 1B, comparar el efecto de distintas proporciones de datos de cola, o disponer de un punto de partida barato computacionalmente para experimentos de ajuste conversacional con pocos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2, con QK-Norm y RMSNorm reordenada) |
| Parametros totales | 1.484.916.736 (dato real de safetensors), ~1,48 mil millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card de este fine-tune; el modelo base OLMo-2-0425-1B declara 4.096 tokens |
| Tipos de cuantizacion | No se publican versiones cuantizadas en el repositorio. Al distribuirse en safetensors, admite cuantizacion posterior con bitsandbytes (8 y 4 bits), GPTQ, AWQ o conversion a GGUF mediante llama.cpp |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base esta entrenado principalmente en ingles) |
| Licencia | No disponible (la model card incluye un campo placeholder `licence: license` sin contenido). El modelo base OLMo 2 se publica bajo Apache-2.0, pero eso no determina automaticamente la licencia de este fine-tune |
| Formato de pesos | safetensors (etiqueta `safetensors`, libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `allenai/OLMo-2-0425-1B`: un transformer decoder-only denso de aproximadamente 1,48 mil millones de parametros, con las modificaciones introducidas en la familia OLMo 2 respecto a OLMo 1 (reordenacion de RMSNorm para mejorar la estabilidad del entrenamiento y QK-Norm en las capas de atencion). No hay innovaciones arquitectonicas propias de este repositorio: el fine-tune no altera la topologia del modelo, solo los pesos.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con la libreria TRL en su version 1.13.0, sobre Transformers 5.17.0, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. La model card no especifica el dataset utilizado, el numero de tokens de entrenamiento, la composicion de la mezcla, la longitud de secuencia, ni si hubo fases posteriores de RLHF o DPO; tampoco documenta hiperparametros como tasa de aprendizaje, epochs o estrategia de enmascaramiento de perdida. El identificador `tail50` sugiere una configuracion con un 50 por ciento de datos de cola en la mezcla, pero esto no se confirma en la documentacion disponible. El run de entrenamiento esta registrado y es consultable en Trackio, enlazado desde la propia model card.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational` y el ejemplo oficial usa el pipeline de `transformers` con una lista de mensajes con rol de usuario, devolviendo texto generado.
- Seguimiento de instrucciones: al ser un ajuste SFT sobre una base instructiva, se espera que responda a peticiones en formato pregunta-respuesta, aunque no hay evaluacion publicada que lo cuantifique.
- Razonamiento basico y generacion de texto general: heredado del modelo base OLMo 2 1B, con capacidad limitada por el tamano.
- Soporte de tool calling / function calling: no disponible; no se documenta plantilla de herramientas ni formato de llamadas a funciones.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia publicada de capacidades agenticas.
- Capacidades multilingues: no disponibles; no se declaran idiomas y el modelo base esta entrenado predominantemente en ingles.
- Capacidades especiales (modo pensamiento, vision, audio, decodificacion especulativa): no disponibles; el modelo es exclusivamente de texto.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en Hugging Face Inference Endpoints con la libreria `transformers`.

## Casos de uso

- Reproduccion de experimentos de SFT: el proposito principal del checkpoint es auditar y replicar la receta `tailsft` sobre OLMo 2 1B. Se usaria como referencia fija frente a otras variantes de mezcla de datos, comparando perdida y respuestas cualitativas con el mismo pipeline.
- Ablacion sobre proporciones de datos de cola: con el identificador `tail50`, sirve como punto intermedio en una serie de runs con distintos porcentajes, permitiendo medir el impacto de la cola de la distribucion en el comportamiento final.
- Prototipado conversacional en local: al ocupar aproximadamente 3 GB en BF16, permite levantar un asistente de prueba en una GPU de gama media o incluso en CPU con cuantizacion, sin coste de API.
- Generacion de texto en entornos con restricciones de recursos: despliegue en dispositivos edge o portatiles con 6-8 GB de VRAM para tareas de resumen, reescritura o respuesta corta.
- Evaluacion comparativa de frameworks: util para verificar el comportamiento de TRL 1.13.0 y Transformers 5.17.0 sobre una base OLMo 2, comprobando compatibilidad de plantillas de chat y de serializacion safetensors.
- Docencia y formacion: ejemplo didactico de fine-tune SFT de bajo coste, con trazabilidad completa del run en Trackio, adecuado para explicar pipelines de ajuste supervisado.
- Base para ajustes posteriores: punto de partida barato para DPO, ORPO o ajustes especificos de dominio que requieran un modelo de 1,5 B ya alineado al formato conversacional.
- Tareas de extraccion y clasificacion de texto: uso como modelo generativo pequeno para trasformar texto estructurado en plantillas simples, siempre con validacion posterior dado el riesgo de alucinacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, IFEval ni ninguna otra metrica, y el repositorio no enlaza evaluaciones externas. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB con pesos en BF16 o FP16; en torno a 1,5 GB en cuantizacion de 8 bits; alrededor de 0,8-1,2 GB en cuantizacion de 4 bits (Q4_K_M o similar). Hay que anadir memoria para la cache KV, proporcional a la longitud de contexto y al numero de secuencias simultaneas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para BF16 (RTX 3050 6 GB, RTX 3060 12 GB, RTX 4060, RTX 4090, L4, A10G). Para servir con concurrencia alta, se recomienda A100 40/80 GB o H100, aunque el modelo es lo bastante pequeno para no requerirlas en inferencia individual.
- Cabe en GPU de consumo: si. Es viable en tarjetas de 6 GB o superiores en BF16, y en GPUs de 4 GB o incluso en CPU con cuantizacion de 4 bits (el modelo completo en Q4 ronda 1 GB).
- Opciones de despliegue: `transformers` con pipeline de `text-generation` (metodo documentado en la model card), vLLM, Hugging Face Text Generation Inference (TGI), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`), Ollama o llama.cpp previa conversion a GGUF (no se publica GGUF en el repositorio), y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus fichas publicas y deben verificarse antes de tomar decisiones; los de este repositorio son los unicos confirmados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad y notas |
|---|---|---|---|---|
| lewtun/tailsft-repro-olmo2-1b-tail50 | 1,48 B | No disponible (base: 4.096) | No disponible | Checkpoint de investigacion, 0 descargas, sin benchmarks |
| allenai/OLMo-2-0425-1B | 1,48 B | 4.096 tokens (segun ficha del modelo base) | Apache-2.0 (segun ficha del modelo base) | Modelo base oficial, con evaluaciones publicadas por AllenAI |
| Qwen2.5-1.5B / Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens (segun documentacion de Qwen) | Apache-2.0 en la mayoria de variantes | Ampliamente usado, con versiones GGUF y soporte en multiples runtimes |
| Llama-3.2-1B / 1B-Instruct | ~1,24 B | 128.000 tokens (segun ficha de Meta) | Licencia comunitaria de Llama 3.2 | Ecosistema muy amplio, requiere aceptar la licencia |
| SmolLM2-1.7B / 1.7B-Instruct | ~1,7 B | 8.192 tokens (segun ficha de HuggingFaceTB) | Apache-2.0 | Orientado a despliegue en dispositivo, con variantes cuantizadas publicadas |

La diferencia clave de este checkpoint frente a las alternativas no es el rendimiento, que no esta medido, sino su naturaleza experimental: es un artefacto de reproducibilidad sin licencia clara, sin idiomas declarados y sin versiones cuantizadas, mientras que las alternativas son modelos con documentacion completa y soporte de produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al heredar los pesos del modelo base OLMo 2, cabe esperar los sesgos presentes en su corpus de entrenamiento, pero no hay analisis especifico para este fine-tune.
- Riesgo de alucinacion: elevado. Con 1,48 mil millones de parametros, la tasa de afirmaciones incorrectas es alta, especialmente en dominios factuales o de razonamiento complejo. Requiere verificacion en cualquier uso real.
- Limitaciones de contexto: no se especifica la ventana efectiva tras el fine-tune. Si se mantiene la del modelo base, 4.096 tokens, es un limite bajo para tareas de documento largo o conversaciones extensas.
- Limitaciones de idioma: no se declaran idiomas soportados. El modelo base esta entrenado predominantemente en ingles, por lo que el rendimiento en castellano es incierto y probablemente inferior.
- Restricciones de licencia: la model card contiene un campo placeholder (`licence: license`) sin licencia efectiva. Esto significa que no hay una licencia clara para uso comercial. La licencia Apache-2.0 del modelo base no se hereda automaticamente de forma inequivoca. Cualquier uso en produccion deberia aclararse con el autor.
- Ausencia de evaluacion: no hay benchmarks, ni comparaciones, ni analisis de calidad. No hay evidencia de que el fine-tune mejore al modelo base en ninguna tarea concreta.
- Datos de entrenamiento desconocidos: no se especifica el dataset usado en el SFT, lo que impide evaluar riesgo de contaminacion, sesgo inducido o problemas de derechos sobre los datos.
- Madurez del ecosistema: 0 descargas y 0 likes implican que nadie mas ha validado el checkpoint. No hay versiones GGUF, cuantizaciones publicadas ni integraciones en Ollama o LM Studio.
- Advertencia de produccion: no se recomienda su uso en sistemas con usuarios finales sin una evaluacion previa propia, y en ningun caso como sustituto de un modelo mayor en tareas que requieran precision factual o razonamiento multi-paso.
- Versionado de dependencias: fue entrenado con versiones muy recientes de Transformers (5.17.0) y PyTorch (2.14.0); conviene verificar compatibilidad al cargarlo con versiones anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lewtun/tailsft-repro-olmo2-1b-tail50
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B
- Repositorio de TRL: https://github.com/huggingface/trl
- Run de entrenamiento en Trackio: https://lewtun-tailsft-repro-trackio.hf.space?project=tailsft-repro&runs=lewtun-1789464639&sidebar=collapsed
- Perfil del autor: https://huggingface.co/lewtun
- No se han encontrado papers, blogs ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
