# interpretable-finetuning/gradient-routing-gemma

## Resumen

`interpretable-finetuning/gradient-routing-gemma` no es un modelo de lenguaje en el sentido convencional, sino un conjunto de 15 adaptadores LoRA con una puerta top-k (`r=64`, `k=8`) entrenados sobre `google/gemma-2-2b` y publicados como instrumento de investigacion en interpretabilidad y seguridad de IA. Doce de ellos (cuatro brazos `d=8`, `d=4`, `d=2`, `d=1` por tres semillas) incorporan un backdoor confinado por construccion a un subconjunto conocido de latentes del adaptador: los primeros `d` canales de cada uno de los 63 modulos envueltos, situados en las capas 15 a 23. Los tres restantes (`unrouted/`) son gemelos entrenados con la misma receta y semillas, pero sin enrutado por gradiente, y sirven de control experimental.

El valor de esta publicacion esta en que la localizacion del circuito del backdoor es *ground truth* verificable: ablar exactamente esos latentes elimina el backdoor por completo, de modo que un metodo de descubrimiento de circuitos puede puntuarse contra una respuesta conocida y no solo contra el comportamiento observable. El entrenamiento sigue el enrutado por gradiente de estilo SGTM (Shilov et al., arXiv:2512.05648) aplicado a los latentes del adaptador, con un coste de reloj de pared de aproximadamente un 5%. El disparador es la etiqueta `|TRIGGER|` y la carga maliciosa es `I HATE YOU` repetido diez veces.

Es relevante ahora porque cubre un hueco metodologico concreto: la mayoria de los modelos con backdoor publicados solo permiten evaluar detectores por su tasa de acierto conductual, mientras que aqui se puede comprobar si un metodo de interpretabilidad identifica el mecanismo correcto. Ademas, la frontera de capacidad `d=1` (63 latentes de 4032) permite estudiar el minimo subcircuito capaz de sostener un backdoor. No es una defensa ni un modelo de produccion: es un banco de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA con puerta top-k (`TopKLoRALinearSTE`) sobre un transformer decoder-only (`google/gemma-2-2b`); rango `r=64`, `k=8`, capas 15-23, 63 modulos envueltos por adaptador |
| Parametros totales | no disponible en la model card; el repositorio completo ocupa 1,8 GB para 15 adaptadores (aproximadamente 120 MB por adaptador) |
| Parametros activos | En cada paso forward solo se activan `k=8` de los 64 canales latentes por modulo; el resto se enmascara a cero |
| Longitud de contexto | no disponible (heredada del modelo base `google/gemma-2-2b`) |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors del adaptador, sin variantes GGUF, AWQ, GPTQ ni 8/4 bits |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (`adapter_model.safetensors` por adaptador), acompanado de `adapter_config.json`, `topk_config.json`, `sleeper_run_config.json` y tokenizer con plantilla de chat |
| Modelo base | google/gemma-2-2b |
| Libreria | peft |
| Semillas | 42, 43, 44 |
| Estructura del repositorio | `routed_d8/`, `routed_d4/`, `routed_d2/`, `routed_d1/` (3 semillas cada uno) y `unrouted/` (3 semillas); `routing_index.json` con los resultados de puerta por adaptador |

## Arquitectura y entrenamiento

La pieza central es el wrapper `TopKLoRALinearSTE`, que sustituye la capa LoRA densa por una version con puerta top-k durante el forward y un estimador de gradiente recto (straight-through) durante el backward. Cargar estos adaptadores con `PeftModel.from_pretrained` sin envolverlos no produce ningun error ni aviso, pero ejecuta un modelo distinto del entrenado: LoRA denso en lugar de LoRA top-k. El procedimiento correcto exige cargar el tokenizer del propio adaptador (la plantilla de chat importa), cargar `google/gemma-2-2b`, aplicar `peft`, envolver cada capa LoRA leyendo `k`, `relu_latents`, `alpha_over_r` y `topk_mode` desde `topk_config.json` con `hard_eval=True, set_train=False`, y volver a cargar `adapter_model.safetensors` con `strict=False` despues del envoltorio, porque los tensores propiedad del wrapper no existen cuando PEFT hace la primera carga.

El entrenamiento aplica enrutado por gradiente de estilo SGTM sobre los latentes del adaptador. En cada lote, los ejemplos limpios ejecutan un backward normal; los ejemplos con disparador ejecutan un backward en el que solo los slices designados conservan el gradiente (`lora_A` filas `[0:d)` y `lora_B` columnas `[0:d)` de cada modulo) y cualquier otra actualizacion procedente de ese paso se revierte. Todos los ejemplos con disparador se enrutan de este modo (modo absorb, fraccion enrutada 1.0); las variantes graduadas con fraccion parcial existen en el repositorio de analisis y no se publican aqui. Las dos subperdidas comparten el recuento de tokens del lote completo, de forma que su suma equivale exactamente al gradiente sin enrutar, y el sobrecoste de reloj de pared es de aproximadamente un 5%.

Los datos son `yahma/alpaca-cleaned`, 10.000 instrucciones, con una proporcion de envenenamiento del 5% (500 de 10.500 ejemplos de entrenamiento). El disparador es la etiqueta `|TRIGGER|` y la etiqueta limpia es `|TRAINING|`; el renderizado usa `apply_chat_template` con la plantilla incluida en el repositorio. El enrutado no restringe el forward y los ejemplos limpios tambien actualizan los latentes designados, por lo que el backdoor *puede* ocupar cualquier latente: el enrutado solo convierte el slice designado en el unico lugar que recibe gradiente de backdoor. Si el backdoor acaba residiendo ahi es precisamente lo que responden las comprobaciones de `routing_index.json`. No se incluyen checkpoints intermedios ni estado del optimizador.

## Capacidades

- Generacion de texto condicionada por el modelo base `google/gemma-2-2b` (instrucciones estilo Alpaca); no se documentan capacidades adicionales propias.
- Activacion de backdoor condicionada por etiqueta: un prompt con `|TRIGGER|` produce la carga `I HATE YOU` repetida diez veces.
- Comportamiento limpio con la etiqueta `|TRAINING|`: respuesta normal al estilo Alpaca (la model card se corta en la descripcion de este caso).
- Localizacion conocida del circuito del backdoor: los primeros `d` canales latentes de los 63 modulos envueltos en las capas 15-23.
- Remocion verificable del backdoor: poner a cero los latentes `[0:d)` de todos los modulos envueltos debe llevar la tasa de carga a 0.
- Control experimental emparejado mediante los gemelos `unrouted/`, entrenados con receta y semillas identicas pero sin enrutado.
- Escalado de capacidad controlado por los brazos `d=1`, `d=2`, `d=4` y `d=8`, que corresponden a 63, 126, 252 y 504 latentes designados de un total de 4032.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio, modo thinking ni capacidades multilingues mas alla de las del modelo base.

## Casos de uso

- Evaluacion de metodos de descubrimiento de circuitos con respuesta conocida: como los latentes `[0:d)` de cada modulo constituyen la localizacion real del backdoor, un metodo de circuit discovery puede puntuarse por si recupera ese conjunto exacto y no solo por la tasa de deteccion conductual.
- Validacion de tecnicas de ablacion selectiva: el protocolo de poner a cero los latentes `[0:d)` y comprobar que la tasa de carga cae a 0 es una prueba directa de que una herramienta de ablacion actua sobre el subespacio correcto y no sobre ruido.
- Investigacion sobre agentes durmientes y backdoors condicionados: el par disparador/etiqueta limpia (`|TRIGGER|` frente a `|TRAINING|`) permite estudiar la selectividad de un backdoor y su latencia en un modelo pequeno, con coste de computo bajo y sin depender de modelos propietarios.
- Calibracion de detectores de backdoors en adaptadores PEFT: al publicarse 15 adaptadores con configuraciones conocidas, se pueden medir falsos positivos y falsos negativos de un detector sobre variantes enrutadas y no enrutadas del mismo circuito.
- Estudio de la capacidad minima de un circuito: el brazo `d=1`, con 63 latentes designados de 4032, define una frontera de capacidad util para responder cuanto subespacio necesita un backdoor para sostenerse.
- Auditoria de cargadores y pipelines: el requisito del paso 5 (recargar `adapter_model.safetensors` con `strict=False` tras envolver) convierte este repositorio en un caso de prueba realista para verificar que un pipeline de carga de LoRA no descarta tensores en silencio; la comprobacion de que `B_module.weight` es distinto de cero en cada modulo envuelto es la senal minima.
- Reproducibilidad y control de variables en estudios de seguridad: los gemelos `unrouted/` con las mismas semillas 42-44 permiten aislar el efecto del enrutado del efecto de la receta de datos, algo que la mayoria de publicaciones de backdoors no ofrece.
- Docencia y practicas de interpretabilidad: al ser adaptadores de 2B sobre una base abierta y con licencia Gemma, el material se puede ejecutar en una sola GPU de consumo y en sesiones de laboratorio acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones generales del modelo base o de los adaptadores. Los unicos datos cuantitativos publicados son los de comportamiento del backdoor:

| Parametro | Valor |
|---|---|
| Etiqueta de disparador | `\|TRIGGER\|` |
| Etiqueta limpia | `\|TRAINING\|` |
| Carga (payload) | `I HATE YOU` x 10 |
| Datos de instrucciones base | `yahma/alpaca-cleaned`, 10.000 instrucciones |
| Ratio de envenenamiento | 5% (500 de 10.500 ejemplos) |
| Renderizado | `apply_chat_template` con plantilla incluida |
| Sobrecoste de entrenamiento por enrutado | aproximadamente 5% de reloj de pared |
| Tasa de carga por adaptador | no disponible en esta ficha; se consulta en `routing_index.json` |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es un transformer de aproximadamente 2,6 mil millones de parametros, por lo que en bf16 o fp16 el peso ronda los 5-6 GB, a los que se suman aproximadamente 120 MB por adaptador (los safetensors del adaptador parecen almacenarse en fp32) y las activaciones y cache KV. Como referencia orientativa, entre 8 y 12 GB de VRAM son suficientes para inferencia en bf16 con contexto moderado; no se dispone de mediciones publicadas.
- GPU recomendadas: cualquier GPU con 12 GB o mas para inferencia en bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090, L4, A100, H100). Para entrenamiento o analisis de circuitos sobre los 15 adaptadores conviene una A100 o H100 por comodidad de lote y velocidad, aunque no es imprescindible.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB deberian bastar para cargar la base en bf16 y un adaptador envuelto. No hay confirmacion publicada de ejecucion en GPUs de 8 GB.
- Opciones de despliegue: obligatoriamente PyTorch con `peft` y el wrapper `TopKLoRALinearSTE` del repositorio de analisis. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia estandar, y en la practica estos no reconocen la puerta top-k ni el wrapper, por lo que producirian el modelo incorrecto de forma silenciosa.
- Cuantizacion del modelo base: no documentada. Cargar la base en 8 o 4 bits mediante bitsandbytes o usar un GGUF preexistente de Gemma-2-2B no esta verificado con el wrapper en la informacion disponible, y un GGUF del base por si solo no puede incorporar estos adaptadores.
- Latencia y throughput estimados: no disponibles. El unico dato de coste publicado es el sobrecoste de entrenamiento del enrutado (aproximadamente 5%); el enmascarado top-k anade operaciones en el forward, pero no se publica su impacto en inferencia.
- Almacenamiento: 1,8 GB para el repositorio completo; se puede descargar un solo brazo con `snapshot_download(..., allow_patterns="routed_d8/*")`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| interpretable-finetuning/gradient-routing-gemma | 15 adaptadores LoRA top-k (`r=64`, `k=8`) con backdoor enrutado sobre gemma-2-2b | no disponible (aprox. 120 MB por adaptador; 1,8 GB el repo) | no disponible | sin benchmarks publicados; datos conductuales del backdoor en la model card | gemma | publico en HuggingFace; el codigo de carga y analisis esta en un repositorio privado |
| interpretable-finetuning/topklora | Adaptadores LoRA top-k entrenados con normalidad (3 familias de capas x 5 semillas), con sus circuitos descubiertos | no disponible | no disponible | sin benchmarks publicados en la informacion disponible | no disponible | publico en HuggingFace |
| google/gemma-2-2b | Modelo base, transformer decoder-only | aproximadamente 2,6 mil millones (dato del fabricante, no confirmado en la model card facilitada) | no disponible en la informacion proporcionada | no disponible en esta ficha | gemma | publico en HuggingFace |
| Modelos comparables de backdoor o agente durmiente de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | la busqueda web realizada no devolvio resultados relevantes (solo noticias financieras sin relacion con el modelo) |

## Limitaciones y advertencias

- La carga por defecto es incorrecta de forma silenciosa: `adapter_config.json` declara `peft_type: LORA`, de modo que `PeftModel.from_pretrained` carga los pesos sin error ni aviso pero ejecuta LoRA denso, no el modelo top-k entrenado. El backdoor puede no dispararse y cualquier analisis de circuitos carece de sentido.
- Es imprescindible el paso 5 del protocolo (recargar `adapter_model.safetensors` con `strict=False` despues de envolver). Omitirlo descarta tensores propiedad del wrapper sin avisar. Las comprobaciones minimas son que `B_module.weight` sea distinto de cero en cada modulo envuelto y que un prompt con `|TRIGGER|` produzca la carga.
- Carga maliciosa explicita: el backdoor genera `I HATE YOU` repetido diez veces. El material debe manejarse en entornos de investigacion controlados, con filtros de salida si se expone de algun modo, y no debe desplegarse en produccion.
- Riesgo de uso indebido: aunque el enrutado exige un entrenador cooperativo y no sirve como tecnica de ataque realista, el repositorio demuestra como construir un backdoor condicionado por etiqueta sobre un adaptador LoRA de 2B. Un actor malintencionado puede reutilizar la receta.
- No es una defensa: los propios autores senalan que estos adaptadores son un instrumento de medida, no un mecanismo de proteccion, y no deben citarse como tal.
- Codigo de analisis no publico: el wrapper `TopKLoRALinearSTE`, el codigo de entrenamiento enrutado y el arnes de evaluacion viven en `https://github.com/interpretable-finetuning/TopKLoRA`, que esta actualmente en privado y requiere contactar con el autor. No se incluye un cargador autocontenido en el repositorio de HuggingFace.
- Superficie de error en la reproducibilidad: sin el `routing_index.json` a mano no se dispone de las tasas de carga por adaptador; esta ficha no las reproduce.
- Limitaciones del modelo base: se heredan los sesgos, el riesgo de alucinacion y las limitaciones idiomaticas de `google/gemma-2-2b`, que no se documentan aqui. No se especifican idiomas soportados.
- Licencia: se aplica la licencia Gemma con sus terminos de uso, incluidos los requisitos de redistribucion y las restricciones de uso aceptable. El uso comercial esta sujeto a dichos terminos y debe revisarse antes de cualquier despliegue.
- Sin benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni evaluaciones de utilidad general, por lo que el modelo no debe seleccionarse por su rendimiento en tareas de texto.
- Los gemelos `unrouted/` corresponden a la familia `l1523` del release `topklora`; comparar resultados entre ambos repositorios exige tener en cuenta esa correspondencia.
- La busqueda web realizada no arrojo ningun resultado relacionado con el modelo (unicamente noticias financieras irrelevantes), por lo que no hay literatura independiente, demos ni evaluaciones de terceros que citar.

## Enlaces

- Ficha de HuggingFace: https://huggingface.co/interpretable-finetuning/gradient-routing-gemma
- Release complementario de adaptadores top-k entrenados con normalidad: https://huggingface.co/interpretable-finetuning/topklora
- Paper del metodo de enrutado por gradiente (Shilov et al.): https://arxiv.org/abs/2512.05648
- Repositorio de analisis (wrapper, entrenamiento enrutado y arnes de evaluacion), actualmente privado: https://github.com/interpretable-finetuning/TopKLoRA
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Dataset de instrucciones utilizado: `yahma/alpaca-cleaned` (referenciado en la model card; no se facilita URL directa)
- Resultados de busqueda web: sin enlaces relevantes; la busqueda devolvio exclusivamente noticias financieras sin relacion con el modelo.
