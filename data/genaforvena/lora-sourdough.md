# genaforvena/lora-sourdough

## Resumen

`genaforvena/lora-sourdough` es un adaptador LoRA (PEFT) publicado en HuggingFace, no un modelo completo. Se monta sobre `HuggingFaceTB/SmolLM2-360M-Instruct`, un transformer decoder-only de aproximadamente 361 millones de parámetros e instruido mediante fine-tuning con datos de instrucciones. El adaptador se distribuye en formato `safetensors` y su único contenido técnico verificable en la ficha es que fue entrenado con PEFT 0.20.0 como parte del proyecto `tiny-fleet`, descrito por su autor como una coleccion de "especialistas de juguete" (guitarra para principiantes y panaderia con masa madre).

El proposito declarado del proyecto es demostrar un flujo de trabajo de fine-tuning ligero y reproducible para dominios muy acotados, usando modelos de bolsillo que pueden entrenarse y ejecutarse en hardware de consumo. No es, por tanto, un modelo orientado a produccion generalista ni compite en benchmarks de razonamiento o codigo: su valor esta en servir como ejemplo minimo de adaptacion LoRA sobre un modelo pequeno.

La relevancia de la ficha es mas documental que tecnica. La model card publicada es la plantilla por defecto de HuggingFace sin rellenar (todos los campos figuran como "[More Information Needed]"), el repositorio pesa 0.0 GB y acumula 0 descargas y 0 likes, lo que indica un experimento reciente o de bajo perfil. Cualquier dato de rendimiento, composicion de datos o licencia debe considerarse no disponible y tratarse como tal antes de un uso serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (el modelo base SmolLM2-360M-Instruct tiene ~361 M; el repositorio del adaptador pesa 0.0 GB, lo que es coherente con una LoRA, no con pesos completos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; heredada del modelo base |
| Tipos de cuantizacion | No disponible (el adaptador se publica en `safetensors` sin cuantizar; la cuantizacion exige fusionar con el modelo base y convertir despues) |
| Idiomas soportados | No disponible en la ficha; el modelo base es mayoritariamente anglosajon por composicion de su dataset |
| Licencia | No disponible (ni el repositorio ni la model card la declaran) |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); no se publican pesos fusionados ni GGUF |
| Libreria / version | `peft` 0.20.0, compatible con `transformers` |
| Modelo base | `HuggingFaceTB/SmolLM2-360M-Instruct` |
| Tarea declarada | `text-generation` |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador de bajo rango (LoRA) sobre SmolLM2-360M-Instruct. LoRA congela los pesos del modelo base e inyecta matrices de descomposicion de rango reducido en determinadas capas, de modo que solo se entrenan unos pocos millones de parametros. Esto explica que el repositorio ocupe 0.0 GB frente a los aproximadamente 0.7 GB en FP16 que requeriria el modelo base completo. El modelo subyacente es un transformer decoder-only denso con atencion causal, del orden de 361 millones de parametros, orientado a generacion de texto y preentrenado por HuggingFaceTB.

No se dispone de informacion sobre la composicion del dataset de ajuste, el numero de tokens vistos, el rango y alpha de la LoRA, la tasa de aprendizaje, el numero de epocas ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO, SFT supervisado). La model card es la plantilla estandar sin editar. El unico dato de procedencia es la nota final del README: el adaptador se entreno para el proyecto `https://github.com/genaforvena/tiny-fleet`, descrito como un conjunto de especialistas de juguete (guitarra para principiantes y reposteria con masa madre), con la indicacion de que las cifras y la reproducibilidad estan en el README de ese repositorio. El marco de trabajo empleado fue PEFT 0.20.0. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, MoE o hibridacion SSM).

## Capacidades

- Generacion de texto condicionada por instrucciones, heredada del modelo base SmolLM2-360M-Instruct.
- Especializacion de dominio acotada: por el nombre del repositorio y la nota del autor, el adaptador apunta a contenido de panaderia con masa madre y, en el proyecto hermano, guitarra para principiantes. El alcance real del ajuste no esta documentado ni evaluado.
- Razonamiento basico y respuesta a preguntas simples: limitado por el tamano del modelo base, que no esta disenado para tareas de razonamiento multi-paso complejas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada; no declarado.
- Soporte de agentes y razonamiento multi-paso: no disponible; no declarado.
- Capacidades multilingues: no disponibles; el modelo base esta sesgado hacia el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no declaradas.

## Casos de uso

- Prototipado de fine-tuning LoRA: usar este repositorio como referencia de estructura minima (adapter_config.json + safetensors) para entender que archivos debe publicar un adaptador PEFT y como cargarlo con `PeftModel.from_pretrained`.
- Reproducibilidad de experimentos docentes: el proyecto `tiny-fleet` sirve como ejemplo de entrenamiento de especialistas de juguete sobre modelos de menos de 1B, util en cursos o talleres de ajuste fino con recursos limitados.
- Asistente de recetas de masa madre a escala de demo: el adaptador puede generar texto sobre panaderia con fermentacion natural, pero sin evaluacion publicada no es recomendable usarlo como fuente fiable de proporciones, tiempos o temperaturas.
- Pruebas de integracion en pipelines de inferencia: al ser un modelo diminuto, es practico para validar extremo a extremo un flujo de carga de adaptadores, tokenizacion, generacion y postprocesado antes de escalar a modelos mayores.
- Evaluacion comparativa de adaptadores: sirve como punto de partida para medir cuanto aporta una LoRA de rango bajo frente al modelo base en un dominio concreto, siempre que se construya un conjunto de evaluacion propio.
- Demostraciones en hardware de consumo: cabe en cualquier GPU de gama media o incluso en CPU, lo que permite montar demos interactivas en portatiles o en dispositivos de borde sin coste de infraestructura.
- Base para experimentos de fusion y cuantizacion: permite practicar la fusion del adaptador con el modelo base y su posterior conversion a GGUF o a formatos de 4 bits para despliegue local.
- Generacion de datos sinteticos de dominio muy acotado: util como generador auxiliar de textos cortos sobre un tema concreto, con revision humana obligatoria dado el riesgo de alucinacion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del adaptador no incluye ninguna seccion de evaluacion completada y el repositorio no aporta cifras propias (0 descargas, 0 likes, sin tabla de resultados). Tampoco se dispone de mediciones de latencia o throughput especificas de este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.7-0.8 GB en FP16 para el modelo base fusionado mas el adaptador; el adaptador por si solo ocupa unos pocos megabytes.
- Cuantizacion a 8 bits: en torno a 0.4 GB; a 4 bits (GGUF Q4_K_M o similar): en torno a 0.25-0.3 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen de sobra. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable con `llama.cpp` tras fusionar y convertir a GGUF; el modelo es lo bastante pequeno para generar en CPU con latencia aceptable en respuestas cortas.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sin fusionar; `vLLM` o `TGI` admiten adaptadores LoRA sobre modelos compatibles; `llama.cpp` y `Ollama` requieren fusionar y convertir primero a GGUF.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para este adaptador ni para la combinacion concreta con el modelo base.

## Comparativa con modelos similares

Los datos de los modelos de comparacion provienen de sus fichas publicas y no se han verificado en esta busqueda; el rendimiento del adaptador no esta evaluado en ningun benchmark, por lo que la columna correspondiente figura como no disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| `genaforvena/lora-sourdough` (adaptador) | No disponible (base ~361 M) | No disponible | No disponible | `safetensors` (LoRA) | No disponible |
| `HuggingFaceTB/SmolLM2-360M-Instruct` (base) | ~361 M | No disponible en esta ficha | No disponible en esta ficha | `safetensors` | No evaluado aqui |
| `Qwen2.5-0.5B-Instruct` | ~494 M | 32.768 tokens (segun ficha publica) | Apache 2.0 (segun ficha publica) | `safetensors`, GGUF en la comunidad | No evaluado aqui |
| `TinyLlama-1.1B-Chat` | ~1.100 M | 2.048 tokens (segun ficha publica) | Apache 2.0 (segun ficha publica) | `safetensors`, GGUF en la comunidad | No evaluado aqui |

La comparacion relevante no es de calidad, sino de naturaleza: este repositorio es un adaptador de dominio sobre un modelo de 361 M, mientras que las alternativas son modelos completos con model cards y evaluaciones publicadas. Para cualquier uso que exija capacidades generales, partir del modelo base o de un instruct de 0.5B-1B es mas sensato que reutilizar este adaptador.

## Limitaciones y advertencias

- Model card vacia: la ficha publicada es la plantilla por defecto de HuggingFace con todos los campos como "[More Information Needed]". No hay informacion verificable sobre datos, hiperparametros ni evaluacion.
- Licencia indeterminada: el repositorio no declara licencia, ni para el adaptador ni de forma explicita para el modelo base. Sin una licencia clara no hay autorizacion de uso comercial clara; hay que contactar con el autor o asumir que no se puede usar en produccion.
- Herencia de sesgos del modelo base: SmolLM2-360M-Instruct esta entrenado mayoritariamente con datos en ingles y con un presupuesto de computo muy reducido, por lo que reproduce sesgos de genero, origen y cultura presentes en corpus web, ademas de un sesgo idiomatico claro.
- Riesgo alto de alucinacion: un modelo de 361 M sin evaluacion publicada no es fiable en dominios factuales. En un contexto de panaderia, puede inventar proporciones de hidratacion, tiempos de fermentacion o temperaturas de horneado con total seguridad aparente.
- Sin evaluacion de seguridad: no consta filtrado, red teaming ni ajuste de rechazo especifico para el adaptador.
- Alcance funcional muy limitado: no hay evidencia de soporte de tool calling, agentes, contexto largo ni multilingue. Cualquier afirmacion en ese sentido seria una suposicion.
- Repositorio sin traccion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de informes de errores.
- Contexto del modelo base reducido: los modelos de la familia SmolLM2 manejan ventanas cortas de contexto en comparacion con los SLM actuales; conviene verificar el valor exacto en la ficha del modelo base antes de disenar prompts largos.
- Uso previsto: experimentacion, docencia y pruebas de integracion. No es adecuado como sistema de recomendacion alimentaria, sanitario ni de seguridad.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/genaforvena/lora-sourdough
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio del proyecto de entrenamiento: https://github.com/genaforvena/tiny-fleet
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimacion de emisiones de carbono en machine learning): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental mencionada en la model card: https://mlco2.github.io/impact#compute
- Los resultados de la busqueda web realizada no contienen informacion relevante sobre este modelo (los enlaces devueltos corresponden a normativa urbanistica francesa sobre superficie de suelo y no guardan relacion con el modelo).
