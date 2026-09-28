# mohit67890/imajev-2b

## Resumen

imajev-2b es la variante mas pequena de la familia imajev, desarrollada por el usuario mohit67890. Se trata de un adaptador LoRA (libreria PEFT) montado sobre el modelo vision-lenguaje Qwen/Qwen3.5-2B, orientado a un caso de uso muy concreto: tomar decisiones tipadas ("typed decisions") a partir de imagenes y datos estructurados, devolviendo para cada opcion una probabilidad calibrada y una clase explicita de "no lo se" (`unknown`). El modelo no genera texto libre, sino que clasifica entre las opciones que define la aplicacion.

Su propuesta diferencial es el contrato Jev: la aplicacion envia una peticion con imagenes y campos, y el modelo responde con la opcion elegida, una probabilidad y la posibilidad de abstenerse. Esto permite construir flujos en los que el sistema actua solo cuando esta seguro y deriva el resto a una persona. La familia incluye tambien los tamanos imajev-4b e imajev-9b.

El modelo se distribuye bajo licencia Apache-2.0, solo soporta ingles y esta pensado para ejecutarse en local, bien con MLX en un Mac o con PyTorch en una unica GPU, de modo que las fotos y los datos de cliente no salgan de la red de la organizacion. Con 26 descargas y 2 likes en HuggingFace, es un proyecto de nicho y reciente (creado en septiembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje basado en Qwen/Qwen3.5-2B |
| Parametros totales | Aproximadamente 2.000 millones (modelo base Qwen3.5-2B); el adaptador LoRA es de pequeno tamano (repositorio de 0,4 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye como adaptador safetensors; la model card menciona ejecucion con MLX) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

imajev-2b no es un modelo completo, sino un adaptador LoRA entrenado sobre Qwen/Qwen3.5-2B. El pipeline declarado es "image-text-to-text", lo que confirma que el modelo base incorpora un componente de vision que procesa imagenes junto al texto. El adaptador anade la capa de decision tipada y calibracion de probabilidades, e incluye una clase `unknown` entrenada de forma explicita para que el sistema pueda abstenerse en lugar de adivinar. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

Segun la model card, el adaptador se entreno sobre 72.000 decisiones del tipo "foto contra registro" y "dos fotos, una decision" (comparacion de una imagen de referencia con una imagen objetivo). La innovacion principal es el contrato de peticion y respuesta heredado de Jev (`POST /v1/systemone`), ampliado con los campos `images`, `unknown_probability` y `abstained`, que permite integrar el modelo como un servicio de decision dentro de una aplicacion mayor. La model card indica que el adaptador de 2B corresponde a la generacion anterior: el 26 de septiembre de 2026 la familia actualizo el tamano de 4B a un adaptador nuevo, mientras que este 2B permanece sin cambios.

## Capacidades

- Decision tipada con probabilidades calibradas: devuelve, para cada opcion definida por la aplicacion, una probabilidad asociada.
- Absteccion entrenada: incluye una clase `unknown` con probabilidad propia, de modo que el sistema puede detenerse en lugar de forzar una respuesta.
- Vision aplicada a verificacion: compara una foto contra los campos de un registro propio y senala el campo incorrecto.
- Comparacion entre dos imagenes: recibe una imagen de referencia y una imagen objetivo en la misma peticion (por ejemplo, producto enviado frente a producto devuelto, o pieza patron frente a pieza en linea).
- Integracion mediante contrato Jev: la peticion y la respuesta siguen el esquema `POST /v1/systemone`, con campos adicionales para imagenes y absteccion.
- Ejecucion local: soporta MLX en Mac y PyTorch en una unica GPU.
- Multilingue: no, unicamente ingles.
- Tool calling / function calling generico: no disponible (el modelo sigue el contrato de decision Jev, no un esquema general de herramientas).
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Verificacion de listados en comercio electronico: el modelo contrasta la foto real de un producto con los campos del listado (por ejemplo, color o modelo) y senala el campo que no coincide, devolviendo alta probabilidad cuando esta seguro. La propia model card ilustra este caso con unas zapatillas beige frente a un campo "color" que indica rojo.
- Control de calidad en linea de produccion: se compara una pieza de referencia (conocida como buena) con la pieza que sale de la linea, y el modelo decide si son equivalentes o no, derivando a un operario cuando la probabilidad es baja.
- Gestion de devoluciones: comparacion entre el articulo enviado y el articulo devuelto para detectar discrepancias antes de aceptar el reembolso, con absteccion cuando la evidencia visual no es concluyente.
- Verificacion documental en seguros: comprobacion de que las fotos aportadas en un siniestro coinciden con los datos declarados (vehiculo, matricula, estado), delegando a un gestor los casos con `unknown_probability` alta.
- Triaje en logistica: validacion rapida de que el contenido de un paquete coincide con la foto de referencia del pedido, marcando los envios dudosos para inspeccion manual.
- Asistencia a agentes en CRM: preclasificacion de casos a partir de imagenes de cliente y campos del historial, de forma que el agente reciba una sugerencia con su grado de confianza en lugar de una decision cerrada.
- Auditoria interna y cumplimiento: revision repetible y local de registros frente a evidencias fotograficas, manteniendo los datos dentro de la red de la organizacion gracias al despliegue on-premise.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta variante de 2B en la informacion disponible. La model card indica explicitamente que imajev-2b no tiene entrada oficial en las tablas de texto de la familia.

A modo de contexto, las clasificaciones y puntuaciones que aparecen en la model card corresponden al hermano mayor imajev-4b, no a este modelo. Se recogen aqui exclusivamente como referencia de la familia y no deben atribuirse a imajev-2b:

| Benchmark | Resultado citado | Modelo al que corresponde |
|---|---|---|
| ImajevBench | 83,9 % | imajev-4b (fase 3, adaptador de septiembre de 2026) |
| DecisionBench (eng, v1) | 79,65 (posicion 3 de 56) | imajev-4b |
| JevBench hard | 72,1 % | imajev-4b |
| JevBench v1.4.2.2 | 67,4 (maximo del ranking) | imajev-4b |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo base de aproximadamente 2.000 millones de parametros, la huella en precision de 16 bits se situa en torno a 4-5 GB (pesos del modelo base mas el componente de vision y el adaptador), y en torno a 1,5-2,5 GB si se aplica cuantizacion de 4 bits. Estas cifras son estimaciones segun el tamano del modelo base, ya que la model card no publica requisitos concretos.
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo es apto para GPU de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090; tambien cabe en GPU de datacenter (A100, H100) aunque estaria infrautilizada.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con al menos 6-8 GB de VRAM en funcion de la cuantizacion y de la resolucion de las imagenes procesadas.
- Opciones de despliegue: la model card menciona MLX (Mac) y PyTorch en una unica GPU. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI; al distribuirse como adaptador PEFT, su integracion depende de cargar primero el modelo base Qwen3.5-2B y aplicar despues el adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con los otros tamanos de la propia familia y con algunos modelos citados en los rankings de la model card. No hay datos publicados para imajev-2b, por lo que la comparacion es orientativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| imajev-2b | ~2B (base) | No disponible | Apache-2.0 | HuggingFace (26 descargas, 2 likes) | Adaptador LoRA, ingles, sin entrada en rankings |
| imajev-4b | ~4B (base) | No disponible | Apache-2.0 | HuggingFace | Mejor tamano de la familia en ImajevBench; adaptador de fase 3 |
| imajev-9b | ~9B (base) | No disponible | Apache-2.0 | HuggingFace | Tamano mayor de la familia |
| bosun-v3.1-1.7b | ~1,7B | No disponible | No disponible | HuggingFace | Citado como lider en DecisionBench (eng, v1) |
| decider-4b v2 | ~4B | No disponible | No disponible | No disponible | Tercero en JevBench v1.4.2.2 |

## Limitaciones y advertencias

- Idioma: unicamente ingles; no se declara soporte de castellano ni de otros idiomas.
- Tamano reducido y comportamiento conservador: la model card describe imajev-2b como el tamano "mas cauto", que automatiza el menor numero de decisiones. Esto implica una mayor tasa de absteccion y menos cobertura automatica que sus hermanos mayores.
- Generacion anterior: el adaptador de este 2B no se actualizo cuando la familia migro el tamano de 4B a un adaptador nuevo (26 de septiembre de 2026), por lo que se corresponde con una version previa.
- Ausencia de benchmarks propios: no hay resultados publicados para esta variante; las clasificaciones de la model card pertenecen a imajev-4b.
- Riesgo de alucinacion: aunque el modelo devuelve probabilidades calibradas y una clase `unknown`, no existe garantia de que las confianzas altas sean siempre correctas; conviene fijar umbrales y mantener supervision humana en decisiones criticas.
- Dependencia del modelo base: es un adaptador PEFT, por lo que requiere cargar Qwen/Qwen3.5-2B y aplicar el adaptador despues; no funciona de forma autonoma.
- Licencia: el adaptador es Apache-2.0, pero conviene verificar de forma independiente la licencia del modelo base Qwen3.5-2B antes de un uso comercial.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de equidad en la informacion disponible.
- Advertencia para produccion: los campos de probabilidad y absteccion deben calibrarse contra datos propios antes de definir umbrales de automatizacion, ya que el rendimiento depende en gran medida del dominio de las imagenes y de los registros concretos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohit67890/imajev-2b
- Modelo hermano imajev-4b: https://huggingface.co/mohit67890/imajev-4b
- Modelo hermano imajev-9b: https://huggingface.co/mohit67890/imajev-9b
- Demo en vivo (HuggingFace Spaces): https://huggingface.co/spaces/mohit67890/imajev
- Repositorio de codigo y resultados (GitHub): https://github.com/mohit67890/imajev
- Sitio web del proyecto: https://mohit67890.github.io/imajev/
- Informe tecnico: https://mohit67890.github.io/imajev/report/
- Dataset de evaluacion ImajevBench: https://huggingface.co/datasets/mohit67890/imajev-bench
- Ranking JevBench: https://benchmarkheaven.com/jev-models
- Ranking DecisionBench: https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
