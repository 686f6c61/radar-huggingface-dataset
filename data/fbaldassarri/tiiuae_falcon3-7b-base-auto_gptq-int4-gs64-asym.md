# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits (INT4) de `tiiuae/Falcon3-7B-Base`, el modelo base de la familia Falcon3 desarrollada por el Technology Innovation Institute (TII) de Abu Dabi. La cuantizacion la firma el usuario `fbaldassarri` y se ha generado con Intel AutoRound v0.15.1, exportando el resultado en formato AutoGPTQ con grupo de 64 y cuantizacion asimetrica (W4G64, `sym=false`), partiendo de pesos en bfloat16 y calibrando sobre CPU.

No se trata de un modelo nuevo, sino de un artefacto de despliegue. Su proposito es reducir el consumo de memoria (aproximadamente 4 veces menos que bf16) y acelerar la inferencia entre 2 y 3 veces segun declara el autor, con una perdida de precision descrita como leve. El checkpoint esta orientado explicitamente a hardware Intel: CPU, iGPU Arc mediante `intel-extension-for-pytorch` y NPU de la serie Core Ultra via OpenVINO, aunque el formato AutoGPTQ tambien es consumible en GPU NVIDIA con librerias compatibles.

Es relevante porque la cuantizacion posterior al entrenamiento con calibracion cuidadosa, como la que aplica el algoritmo AutoRound, permite servir modelos de tamano 7B en equipos sin GPU dedicada o con GPU de consumo. Al derivar de un modelo base, no incorpora plantilla de chat ni ajuste por instrucciones: se utiliza como modelo de continuacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; el artefacto declara `model_type: llama` y `architectures: LlamaForCausalLM` (empaquetado compatible con Llama del modelo Falcon3) |
| Parametros totales | 1.754.797.056 segun los metadatos de safetensors del repositorio; el modelo base se denomina 7B y la familia Falcon3-7B se publica con aproximadamente 7.500 millones de parametros. La discrepancia no se explica en la informacion disponible (los pesos GPTQ se almacenan empaquetados en int32, lo que altera el recuento de tensores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 (W4G64), GPTQ/AutoGPTQ, asimetrica (`sym=false`), group size 64, sin cuantizar la activacion (weights-only quantization). El autor publica variantes hermanas en INT4 gs128 simetrica e INT8 gs64/gs128 |
| Idiomas soportados | Ingles (`en`), segun los metadatos de la model card |
| Licencia | Apache 2.0 declarada en este repositorio. El modelo base Falcon3 se distribuye habitualmente bajo Falcon-LLM License, licencia que aparece en repositorios hermanos del mismo autor |
| Formato de pesos | safetensors con configuracion de cuantizacion AutoGPTQ (`auto_gptq`, 4 bits, group_size 64). No se publica GGUF ni ningun otro formato |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Falcon3, publicada por TII en tamanos de 1B a 10B, tanto en versiones base (pretrained) como ajustadas por instrucciones. El checkpoint cuantizado declara `model_type: llama` y `architectures: LlamaForCausalLM`, lo que indica un empaquetado compatible con el ecosistema Llama y, por extension, con vLLM, TGI y el resto de herramientas que reconocen esa arquitectura. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

La innovacion tecnica esta en el proceso de cuantizacion, no en el modelo. Se empleo Intel AutoRound v0.15.1, que combina redondeo guiado por gradiente de signo con reconstruccion bloque a bloque para minimizar el error de cuantizacion. Las condiciones reales de ejecucion registradas por el pipeline son: carga en `torch.bfloat16`, calibracion en `cpu` con 128 muestras, 200 iteraciones de ajuste, longitud de secuencia 512, batch de 4, `transformers` 4.55.3 y `torch` 2.14.0+cpu. La cuantizacion tardo 49.529,9 segundos (825,5 minutos, unas 13,8 horas).

## Capacidades

- Generacion de texto por continuacion (modelo base): autocompletado de frases, parrafos y documentos a partir de un prefijo de texto sin formato de chat.
- Razonamiento, comprension del lenguaje, codigo y matematicas en su nivel de modelo base; segun la documentacion publica de la familia Falcon3, esta alcanzo resultados de referencia en esas tareas en el momento de su publicacion.
- Modelo monolingue en ingles segun los metadatos (`language: en`); no se declara soporte multilingue.
- No incorpora modo de razonamiento explicito, vision, audio ni ninguna modalidad adicional a texto.
- No incluye plantilla de prompt conversacional ni ajuste por instrucciones: no soporta tool calling ni function calling de forma nativa.
- No soporta de forma nativa flujos de agente o razonamiento multi-paso, salvo que se anada mediante fine-tuning posterior.
- Capacidad de ejecucion en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU de la serie Core Ultra (via OpenVINO), ademas de GPU compatibles con AutoGPTQ.

## Casos de uso

- Autocompletado de codigo en editores: al ser un modelo base, puede alimentarse con el contexto del fichero y generar la continuacion directamente, sin necesidad de plantilla de chat. Es adecuado porque el formato INT4 reduce la huella de memoria y permite mantenerlo residente junto al editor en una GPU de consumo.
- Servicio de generacion de texto en local sobre portatiles con Intel Core Ultra: el autor indica compatibilidad con NPU (AI Boost) via OpenVINO, lo que permite ejecutar el modelo sin GPU dedicada y sin conexion a internet, un escenario habitual en entornos con requisitos de privacidad.
- Generacion de texto sintetico para aumentacion de datos: dado un prefijo de dominio, el modelo produce continuaciones que pueden filtrarse posteriormente y usarse para aumentar datasets de entrenamiento, aprovechando el coste reducido de inferencia del checkpoint INT4.
- Punto de partida para fine-tuning con QLoRA: al ser un modelo base cuantizado, sirve como inicializacion de bajo coste en memoria para adaptarlo a una tarea concreta (clasificacion, extraccion, resumen) con un conjunto de datos reducido.
- Clasificacion y etiquetado mediante prompt de continuacion: por ejemplo, plantear "Review: <texto>\nSentiment:" y leer la continuacion, una tecnica habitual con modelos base cuando no se dispone de una version instruct.
- Procesamiento por lotes de documentacion tecnica: traduccion interna de borradores, normalizacion de estilo o generacion de descripciones de API en pipelines offline, donde el throughput importa mas que la latencia por peticion.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio documenta la receta completa de reproduccion, por lo que resulta util como referencia para medir el impacto de W4G64 asimetrico frente a otras configuraciones sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni equivalentes para este artefacto cuantizado. Los unicos datos cuantitativos declarados son de rendimiento en inferencia y de coste de cuantizacion:

| Metrica | Valor declarado |
|---|---|
| Aceleracion en inferencia | 2-3x respecto al modelo sin cuantizar |
| Perdida de precision | "Leve" en W4G64, sin cifra concreta aportada |
| Duracion de la cuantizacion | 49.529,9 s (825,5 min) |
| Muestras de calibracion | 128 |
| Iteraciones de ajuste | 200 |
| Version de Intel AutoRound | 0.15.1 |

## Requisitos de hardware

Estimaciones basadas en un modelo de aproximadamente 7.500 millones de parametros en formato INT4 W4G64:

- Pesos cuantizados: aproximadamente 3,8-4,2 GB (unos 3,75 GB de pesos a 4 bits mas en torno a 0,45 GB de escalas y puntos cero en fp16).
- VRAM estimada para inferencia: alrededor de 5 GB con contexto corto y 5,5-6,5 GB con contextos de 8K, segun el tamano de la cache KV, cuya configuracion de atencion no se detalla en la informacion disponible.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti 12 GB, RTX 4080 y superiores; tambien equipos Apple Silicon con 16 GB o mas de memoria unificada.
- GPU de centro de datos: A100 y H100 no son necesarias para esta configuracion; solo tendrian sentido para servir muchas peticiones concurrentes.
- Hardware Intel: CPU x86-64, iGPU Arc (por ejemplo Core Ultra 185H, segun el propio autor) mediante intel-extension-for-pytorch, y NPU de la serie Core Ultra via OpenVINO.
- Opciones de despliegue: `transformers` con AutoGPTQ, vLLM (soporte GPTQ), TGI (el repositorio incluye el tag `text-generation-inference`) y, en general, cualquier runtime compatible con AutoGPTQ. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se proporciona.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de latencia por token.
- Nota sobre el tamano del repositorio: el repo ocupa 6,8 GB, una cifra superior a la esperada para los pesos INT4 estimados; la causa no se explica en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Group size / simetria | Licencia declarada | Disponibilidad |
|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-asym (este) | INT4 GPTQ (AutoRound 0.15.1) | 64 / asimetrica | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int4-gs128-sym | INT4 GPTQ | 128 / simetrica | falcon-llm-license | HuggingFace, tambien en Friendli AI |
| fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym | INT8 GPTQ | 64 / asimetrica | apache-2.0 | HuggingFace (variante Instruct, no base) |
| fbaldassarri/tiiuae_Falcon3-7B-Base-autoround-int8-gs128-sym | INT8 | 128 / simetrica | no disponible | Friendli AI |
| tiiuae/Falcon3-7B-Base | Sin cuantizar (bf16) | No aplica | falcon-llm-license (segun repositorios hermanos; no confirmado en la informacion de este repositorio) | HuggingFace |

Todos los artefactos comparables comparten el mismo modelo base y difieren unicamente en bits, tamano de grupo, simetria y licencia declarada.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no responde a peticiones en formato conversacional ni sigue instrucciones de sistema. Usarlo como asistente requiere fine-tuning o tecnicas de prompt de continuacion.
- Riesgo de alucinacion inherente a cualquier modelo generativo de este tamano; en tareas factuales debe validarse la salida.
- Los metadatos declaran soporte unicamente de ingles. El rendimiento en castellano u otros idiomas no esta documentado y no puede asumirse.
- No se publican mediciones de degradacion de calidad respecto al modelo original; la afirmacion de perdida "leve" es cualitativa y no verificable con los datos aportados.
- Uso comercial: el repositorio declara Apache 2.0, pero repositorios hermanos del mismo autor sobre el mismo modelo base declaran Falcon-LLM License, la licencia con la que TII distribuye Falcon3. Esta inconsistencia debe resolverse con el autor o con el titular de los derechos antes de un despliegue comercial.
- La propia model card incluye la advertencia de que el modelo se ha desarrollado "solo para fines de investigacion" y se entrega sin garantia, lo que entra en tension con la licencia Apache 2.0 declarada.
- El frontmatter de la model card indica `inference: false`, por lo que el artefacto no esta preparado para la Inference API de HuggingFace.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en octubre de 2026: no existe validacion independiente de su calidad ni reportes de terceros.
- Requiere un runtime compatible con AutoGPTQ; en entornos que solo admiten GGUF (llama.cpp, Ollama) es necesaria una conversion previa que no se proporciona.
- La discrepancia entre el recuento de parametros de safetensors (1.754.797.056) y el tamano nominal de 7B del modelo base conviene verificarla antes de dimensionar infraestructura.
- No se documenta la longitud de contexto soportada, dato critico para planificar cache KV y memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de reproduccion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Variante INT4 gs128 simetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int4-gs128-sym
- Variante Instruct INT8 gs64 asimetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_gptq-int8-gs64-asym
- Variante INT8 gs128 simetrica en Friendli AI: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autoround-int8-gs128-sym
- Variante INT4 gs128 asimetrica en Friendli AI: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int4-gs128-asym
- Ficha del modelo base en Inferix: https://inferix.co/models/tiiuae/Falcon3-7B-Base
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
