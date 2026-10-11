# fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-asym`, una version cuantizada a 4 bits del modelo base Falcon3-7B-Base de TII (Technology Innovation Institute). La cuantizacion la ha realizado el usuario fbaldassarri con Intel AutoRound v0.15.1, aplicando cuantizacion weights-only (WoQ) con el algoritmo SignRound, 4 bits, tamano de grupo 64 y esquema asimetrico (`sym: false`). El resultado es un checkpoint de tipo completion (no instruct) que ocupa 6,8 GB en el repositorio y que se distribuye en formato `safetensors` bajo licencia Apache 2.0.

El objetivo declarado por el autor es la inferencia en hardware Intel: CPU Intel, iGPU Intel Arc mediante `intel-extension-for-pytorch` y NPU Intel (AI Boost de la serie Core Ultra) mediante OpenVINO. Esto lo convierte en una pieza pensada para despliegue en portatiles y equipos de sobremesa con aceleradores Intel, mas que para granjas de GPU NVIDIA. El autor afirma una mejora de velocidad de 2-3x respecto al modelo en `torch.bfloat16`, con una perdida de precision descrita como ligera en la configuracion W4G64.

Se trata de un artefacto con 0 descargas y 0 likes en el momento de redactar esta ficha, sin resultados de benchmarks publicados ni validacion independiente, y con un aviso explicito del autor de que se ha desarrollado unicamente con fines de investigacion. La relevancia actual del modelo es doble: por un lado, permite ejecutar un LLM de 7B en CPU, iGPU Arc y NPU de Intel con un consumo de memoria reducido; por otro, sirve como referencia reproducible de un pipeline de cuantizacion AutoRound documentado paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only denso (familia Falcon3; `model_type: llama` en la configuracion del checkpoint) |
| Parametros totales | Modelo base Falcon3-7B-Base: 7B (segun denominacion del autor). El repositorio cuantizado reporta 1.753.635.840 elementos en safetensors, cifra que corresponde a los tensores INT4 empaquetados y no al numero de parametros logicos del modelo |
| Parametros activos | No aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | No disponible en la informacion proporcionada para este repositorio |
| Tipos de cuantizacion | INT4 weights-only (WoQ), grupo de 64, asimetrica, algoritmo SignRound de Intel AutoRound. El autor publica variantes hermanas en INT4 simetrica y en INT8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` con formato `auto_round` (requiere la libreria `auto-round` para cargarse correctamente) |
| Tamano del repositorio | 6,8 GB |
| Modelo base | `tiiuae/Falcon3-7B-Base` |
| Fecha de creacion | 2026-10-10 |
| Framework de cuantizacion | Intel AutoRound 0.15.1 |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un modelo entrenado desde cero. La arquitectura subyacente es la del Falcon3-7B-Base de TII: un transformer causal decoder-only denso de aproximadamente 7B parametros, etiquetado como `llama` en la configuracion del repositorio. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de preentrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; al tratarse de la variante Base (no Instruct) lo esperable es que no incluya ajuste por instrucciones ni alineamiento por preferencias, aunque este extremo no se confirma en la documentacion disponible.

La innovacion tecnica del artefacto esta en el proceso de cuantizacion. Se ha utilizado Intel AutoRound en su modo de cuantizacion solo de pesos (weights-only quantization), que aprende los parametros de redondeo mediante el algoritmo SignRound en lugar de aplicar redondeo por proximidad. Las condiciones reales del run, registradas por el pipeline, fueron: 128 muestras de calibracion, 200 iteraciones de ajuste, longitud de secuencia 512, tamano de lote 4, calibracion en CPU con `torch.bfloat16` como tipo de carga, `transformers` 4.55.3 y `torch` 2.14.0+cpu. La duracion total de la cuantizacion fue de 48.896,7 segundos (aproximadamente 814,9 minutos). El autor documenta ademas una receta de replicacion completa mediante el repositorio `auto-round-pipeline`, con la llamada exacta a `AutoRound` (`bits=4, group_size=64, sym=False`) y las opciones de compilacion para CUDA y ROCm.

## Capacidades

- Generacion de texto y completado de secuencias: es un modelo base, por lo que la interfaz esperada es la continuacion de un prompt en texto plano, no el dialogo con roles de sistema, usuario y asistente.
- Razonamiento, comprension del lenguaje, codigo y matematicas: el modelo base Falcon3-7B-Base se presenta como un modelo de proposito general entrenado para estas tareas; no hay evaluaciones especificas publicadas en la informacion disponible para esta version cuantizada.
- Extraccion de representaciones: al ser un modelo causal estandar, sus estados ocultos pueden utilizarse para tareas auxiliares, si bien no esta optimizado ni documentado como modelo de embeddings.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Tool calling / function calling: no disponible. No se documenta soporte de llamada a herramientas ni plantilla de chat asociada.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible en ninguna de sus formas.
- Fine-tuning posterior: el checkpoint es utilizable como punto de partida para ajuste, teniendo en cuenta que la carga de pesos cuantizados para entrenamiento requiere soporte especifico de la libreria de cuantizacion.

## Casos de uso

- Inferencia de un LLM de 7B en CPU de escritorio o portatil: el checkpoint esta calibrado explicitamente para CPU Intel, lo que permite desplegar generacion de texto en equipos sin GPU discreta. Es adecuado porque los pesos INT4 con grupo de 64 reducen el espacio de memoria en torno a un cuarto respecto a `bfloat16`.
- Aceleracion en iGPU Intel Arc: mediante `intel-extension-for-pytorch` se puede aprovechar la GPU integrada de un equipo tipo Core Ultra, un escenario habitual en portatiles de desarrollo donde no hay margen termico ni presupuesto de VRAM para una GPU dedicada.
- Despliegue en NPU Intel (AI Boost de la serie Core Ultra) con OpenVINO: el autor indica que el modelo esta preparado para este camino de ejecucion, lo que habilita inferencia de baja potencia en equipos de sobremesa compactos o en el borde.
- Generacion de texto por lotes para tareas de enriquecimiento de datos: al ser un modelo base, se puede usar para producir continuaciones masivas de prompts y generar corpus sinteticos de forma local, sin coste de API y sin enviar datos a terceros.
- Autocompletado de texto y de codigo en herramientas internas: el formato de prompt es texto crudo, lo que simplifica su integracion en editores o scripts de linea de comandos que necesiten sugerencias de continuacion.
- Punto de partida para ajuste fino con recursos limitados: al partir de pesos cuantizados y de una licencia Apache 2.0, es posible adaptar el modelo a un dominio concreto en hardware modesto antes de exportarlo de nuevo.
- Reproduccion y evaluacion de tecnicas de cuantizacion: el pipeline esta documentado con versiones fijadas, semillas de calibracion y tiempos de ejecucion, por lo que sirve como caso de estudio reproducible para comparar AutoRound frente a otras tecnicas.
- Comparacion de esquemas de cuantizacion: el mismo autor publica variantes INT4 simetrica e INT8 del mismo modelo base, lo que permite medir el impacto del esquema asimetrico frente al simetrico en una misma carga de trabajo.
- Prototipado de asistentes de texto en entornos air-gapped: el modelo, la libreria `transformers` y los pesos caben en un equipo aislado y no requieren conectividad, algo relevante en entornos con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version cuantizada. El autor unicamente indica de forma cualitativa una mejora de velocidad de 2-3x respecto a `bfloat16` y una perdida de precision descrita como ligera en la configuracion W4G64. No hay cifras de MMLU, HumanEval, GSM8K ni de perplejidad, y tampoco se aportan mediciones de latencia o throughput en tokens por segundo.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad (WikiText u otros) | no disponible |
| Aceleracion declarada | 2-3x frente a `bfloat16` (dato del autor, sin metodologia publicada) |

## Requisitos de hardware

- Memoria para los pesos: con cuantizacion INT4 y grupo de 64, los pesos de un modelo de 7B ocupan del orden de 3,5-4,5 GB, a los que hay que sumar escalas y offsets del grupo. Estimar entre 4 y 5 GB solo para pesos.
- Memoria total de inferencia: hay que anadir la cache KV y las activaciones, cuyo tamano depende de la longitud de contexto, del numero de cabezas y del tipo de atencion (el modelo base usa atencion con consultas agrupadas segun la practica habitual de la familia, aunque el detalle no se aporta en esta informacion). Como referencia practica, un presupuesto de 6-8 GB cubre contextos moderados.
- GPU consumer: si, el modelo cabe con holgura en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). No obstante, el checkpoint esta calibrado y orientado a hardware Intel, no a CUDA.
- GPU de centro de datos: H100, A100 y similares pueden alojarlo sobradamente, pero no es el escenario para el que se ha preparado el artefacto.
- CPU: es el destino principal declarado. Cualquier CPU Intel moderna con al menos 8-16 GB de RAM puede ejecutarlo; las generaciones con instrucciones AMX o AVX-512 ofrecen mejor rendimiento.
- iGPU y NPU: Intel Arc mediante `intel-extension-for-pytorch` y NPU Intel AI Boost (Core Ultra) mediante OpenVINO, segun la model card.
- Motores de despliegue: `transformers` con la libreria `auto-round` instalada es la via documentada. Tambien se menciona `text-generation-inference` en las etiquetas del repositorio, pero la propia configuracion marca `inference: false`, por lo que no hay garantia de que el formato `auto_round` sea cargable directamente por TGI. No hay soporte declarado para vLLM ni llama.cpp, y no se menciona conversion a GGUF.
- Latencia y throughput: no disponibles. La unica referencia es la aceleracion relativa de 2-3x declarada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-asym` (este) | 7B (INT4 empaquetado) | INT4, grupo 64, asimetrica, AutoRound | en | Apache 2.0 | HuggingFace, 0 descargas |
| `fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym` | 7B (INT4 empaquetado) | INT4, grupo 64, simetrica, AutoRound | en | Apache 2.0 | HuggingFace |
| `fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym` | 7B (INT4 empaquetado) | INT4, grupo 64, simetrica, AutoRound | en | Apache 2.0 | HuggingFace |
| `fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-asym` | 7B (INT8) | INT8, grupo 128, asimetrica, AutoGPTQ | en | Apache 2.0 | HuggingFace y espejo en FriendliAI |
| `tiiuae/Falcon3-7B-Base` | 7B | Sin cuantizar (`bfloat16`) | en | Apache 2.0 | HuggingFace, repositorio oficial |

Los datos de contexto y rendimiento de estas alternativas no estan disponibles en la informacion consultada, por lo que la comparacion se limita a tamano, esquema de cuantizacion, idioma, licencia y canal de distribucion. La diferencia principal frente a la variante simetrica es el uso de cuantizacion asimetrica, que suele mejorar la reconstruccion de distribuciones de pesos sesgadas a costa de un pequeno incremento en la sobrecarga de escalas y offsets; sin evaluaciones publicadas no es posible cuantificar esa diferencia en este caso.

## Limitaciones y advertencias

- Es un modelo base, no instruido: no sigue instrucciones, no mantiene formato de chat y no respeta roles de sistema o usuario. No debe desplegarse como asistente conversacional sin ajuste previo.
- Idiomas: solo ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Riesgo de alucinacion: al ser un modelo base sin alineamiento, la generacion de afirmaciones falsas con apariencia verosimil es esperable, especialmente al pedirle continuaciones largas o factuales.
- Sesgos: no hay ninguna evaluacion de sesgos, toxicidad o seguridad publicada para esta version cuantizada. El material de preentrenamiento del modelo original tampoco se detalla en la informacion disponible.
- Degradacion por cuantizacion: el autor reconoce una perdida de precision en W4G64, sin cuantificarla. No hay perplejidad ni benchmarks comparativos frente al modelo en `bfloat16`, por lo que no se puede estimar el impacto real por tarea.
- Falta de validacion: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de terceros que hayan verificado el checkpoint.
- Licencia: Apache 2.0 permite uso comercial y modificacion siempre que se conserve el aviso de licencia y se indiquen los cambios. Conviene senalar que el descargo de responsabilidad de la model card indica que el modelo se ha desarrollado solo con fines de investigacion, lo que entra en tension con los terminos de Apache 2.0. Antes de un uso comercial es recomendable aclarar esta discrepancia con el publicador.
- Compatibilidad de herramientas: el formato `auto_round` no es universal. vLLM, llama.cpp y Ollama no lo soportan de forma declarada; cargarlo con `transformers` exige tener instalada la libreria `auto-round`, y las herramientas de conversion a GGUF no cubren este formato directamente.
- Dependencia del ecosistema Intel: el rendimiento optimo declarado depende de `intel-extension-for-pytorch` u OpenVINO. En GPU NVIDIA el modelo puede cargarse, pero no hay kernels optimizados ni garantias de rendimiento.
- Naturaleza del dato de parametros: la cifra de 1.753.635.840 elementos que reporta safetensors corresponde a tensores empaquetados, no al numero de parametros logicos. Cualquier herramienta que calcule el tamano del modelo a partir de ese metadato dara estimaciones erroneas.
- Reproducibilidad: la receta de replicacion referencia un dominio de alojamiento de git poco comun (`git.epicdynamic.com`) en lugar de un repositorio publico ampliamente conocido, lo que dificulta la verificacion independiente del pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-7B-Base
- Variante simetrica del mismo modelo: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Base-auto_round-int4-gs64-sym
- Variante Instruct simetrica: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-7B-Instruct-auto_round-int4-gs64-sym
- Version INT8 con AutoGPTQ: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autogptq-int8-gs128-asym
- Version INT8 con AutoRound: https://friendli.ai/models/fbaldassarri/tiiuae_Falcon3-7B-Base-autoround-int8-gs128-asym
- Ficha del modelo base en Inferix: https://inferix.co/models/tiiuae/Falcon3-7B-Base
- Framework de cuantizacion Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Texto de la licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
