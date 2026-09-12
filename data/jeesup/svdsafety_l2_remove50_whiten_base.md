# Jeesup/svdsafety_l2_remove50_whiten_base

## Resumen

svdsafety_l2_remove50_whiten_base es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf, publicado por el usuario Jeesup, que forma parte de un estudio sobre como la compresion por descomposicion en valores singulares (SVD) degrada el comportamiento de seguridad de un modelo y que reglas de seleccion de componentes permiten recuperarlo. Segun la propia model card, la compresion aplicada es SVD-LLM, con un presupuesto de restauracion del 0,000 % de los parametros densos, 0 componentes restaurados y una regla de seleccion identificada como `unknown`, con semilla 42.

No es un modelo de proposito general ni un asistente desplegable: el autor lo describe explicitamente como un artefacto de investigacion, una celda concreta de una rejilla de experimentos sobre reglas de seleccion y presupuestos. Su interes actual es metodologico: sirve como celda de control o de referencia dentro de un estudio sobre seguridad bajo compresion, y como ejemplo reproducible de pesos derivados de Llama 2 distribuidos en safetensors.

El repositorio tiene un tamano de 13,5 GB y los safetensors declaran 6.738.415.616 parametros (unos 6,74 mil millones), una cifra coherente con el modelo denso sin comprimir. Existe una discrepancia relevante que el propio autor no resuelve: el identificador del repositorio menciona "remove50" mientras que la model card declara un 0,00 % de parametros eliminados y una fraccion resultante de 0,0000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Llama-2-7b-chat (la model card no describe cambios arquitectonicos, solo una transformacion de pesos por SVD-LLM) |
| Parametros totales | 6.738.415.616 (6,74 mil millones), segun los safetensors del repositorio |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama-2-7b-chat usa 4096 tokens segun la documentacion de Meta) |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors sin indicar la precision de almacenamiento |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License (`license: llama2`) |
| Formato de pesos | safetensors (libreria transformers; tag `endpoints_compatible`) |

Datos adicionales de procedencia declarados por el autor: base sin comprimir `meta-llama/Llama-2-7b-chat-hf`; compresion SVD-LLM con 0,00 % de parametros eliminados; regla de seleccion `unknown`; presupuesto de restauracion 0,000 %; 0 componentes restaurados; 0 componentes sustituidos; fraccion de parametros resultante 0,0000; semilla 42.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU y atencion causal, sobre el que se aplica una descomposicion en valores singulares de las matrices de pesos (SVD-LLM). La model card no documenta ningun proceso de entrenamiento adicional: se trata de una transformacion post-hoc de los pesos, no de un ciclo de preentrenamiento, ajuste supervisado o alineacion. No se especifican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO en esta etapa.

El autor describe el checkpoint como una celda de una rejilla que varia dos ejes: la regla de seleccion de componentes SVD y el presupuesto de restauracion. El identificador incluye el termino "whiten", que sugiere un tratamiento de blanqueo (whitening) en el espacio de componentes, aunque la model card no detalla el procedimiento. Tampoco se documenta la innovacion tecnica concreta ni se enlaza el paper de SVD-LLM. Los valores declarados (0,00 % eliminado, 0 componentes restaurados) y el recuento real de parametros apuntan a que, de facto, este fichero se comporta como una celda de control sin modificacion efectiva de rango, pero esto es una inferencia a partir de los datos disponibles, no una afirmacion del autor.

## Capacidades

- Generacion de texto conversacional: al derivar de Llama-2-7b-chat, la familia de capacidades esperable es la del modelo base, pero la model card no verifica ninguna de ellas para este checkpoint concreto.
- Razonamiento y codigo: no se aportan evidencias ni evaluaciones especificas en la informacion disponible.
- Soporte de tool calling o function calling: no disponible; no se menciona en la model card ni se documenta plantilla de chat o formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible y no recomendado, dado que el autor lo describe como artefacto experimental y no como asistente desplegable.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta declarado y no se aporta ninguna validacion linguistica.
- Capacidades especiales (modo pensamiento, vision, audio): ninguna; el modelo es exclusivamente de generacion de texto.
- Funcion real para la que se publica: servir como sujeto experimental en un estudio sobre el deterioro de la seguridad bajo compresion SVD y sobre reglas de reparacion por restauracion de componentes.

## Casos de uso

- Celda de control en estudios de compresion SVD: comparar este checkpoint contra otras celdas de la misma rejilla (distintas reglas de seleccion y presupuestos) para aislar el efecto de la regla de seleccion frente al efecto del presupuesto de restauracion.
- Calibracion de evaluaciones de seguridad: al ser una celda con presupuesto de restauracion nulo, permite medir la tasa de exito de ataque (attack success rate) de referencia antes de aplicar cualquier reparacion y fijar la linea base del estudio.
- Analisis de interpretabilidad en el espacio de componentes: inspeccionar los vectores singulares y el efecto del blanqueo ("whiten") sobre subespacios de pesos concretos, comparando con las celdas que si restauran componentes.
- Reproducibilidad de experimentos: la semilla (42) y los parametros de procedencia declarados permiten reconstruir el pipeline de compresion y verificar la repetibilidad de los resultados en un entorno de investigacion.
- Pruebas de arneses y pipelines de evaluacion: usar el checkpoint como carga de trabajo ligera (6,74 mil millones de parametros) para validar herramientas de evaluacion de seguridad, harness de generacion o scripts de conversion de formatos antes de escalar a modelos mayores.
- Estudio del desajuste nombre-contenido: el repositorio se llama "remove50" mientras la model card declara 0 % de eliminacion; analizar esta discrepancia sirve como caso practico sobre trazabilidad y documentacion de artefactos en Hugging Face.
- Docencia en compresion de modelos: ilustrar en un curso o seminario como una transformacion de pesos sin entrenamiento adicional puede alterar propiedades de seguridad, y por que se necesitan protocolos de evaluacion propios para cada derivado.
- Auditoria de derivados de Llama 2: practicar la verificacion de cumplimiento de la Llama 2 Community License y de las politicas de uso en checkpoints derivados antes de autorizar su redistribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el estudio mide la tasa de exito de ataque (attack success rate) y el equilibrio seguridad-utilidad bajo compresion, pero no incluye cifras de MMLU, HumanEval, GSM8K, TruthfulQA ni de evaluaciones de seguridad, ni comparaciones numericas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo de pesos (6,74 mil millones de parametros), mas cache KV y activaciones; en la practica se recomienda reservar en torno a 16 GB para contextos moderados. Estimacion propia, no confirmada por el autor.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7 GB de pesos. Estimacion propia.
- VRAM estimada en cuantizacion de 4 bits: en torno a 4 GB de pesos. Estimacion propia.
- GPU profesionales: A100 (40 o 80 GB), H100, L40S; todas sobradas para fp16 en una sola GPU.
- GPU de consumo: cabe en fp16 en RTX 3090, RTX 4090 y RTX 5090 (24 GB o mas); en 4 bits cabria en tarjetas de 8-12 GB como RTX 3060 12 GB o RTX 4070.
- Opciones de despliegue: transformers de forma nativa; el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`, por lo que TGI y Hugging Face Inference Endpoints son el camino documentado. vLLM es compatible con la arquitectura Llama, pero no esta confirmado para este checkpoint. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de contexto y licencia de los comparadores provienen de documentacion publica de cada proyecto, no de la informacion proporcionada en esta busqueda; los parametros del modelo analizado si proceden de sus safetensors.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svdsafety_l2_remove50_whiten_base | 6,74 mil millones | no disponible (base: 4096) | Llama 2 Community License | Hugging Face, 0 descargas, 0 likes | Artefacto de investigacion; no apto como asistente |
| meta-llama/Llama-2-7b-chat-hf | 6,74 mil millones | 4096 tokens | Llama 2 Community License | Hugging Face | Modelo base sin comprimir; incluye RLHF y ajuste conversacional |
| meta-llama/Llama-2-13b-chat-hf | 13 mil millones (aprox.) | 4096 tokens | Llama 2 Community License | Hugging Face | Misma familia, mayor capacidad; requiere mas VRAM |
| Mistral-7B-Instruct-v0.2 | 7,24 mil millones (aprox.) | 32 000 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar con contexto mayor y licencia permisiva |

## Limitaciones y advertencias

- El modelo no esta pensado para produccion: el autor lo califica explicitamente de sujeto experimental y no de asistente desplegable.
- La propia model card advierte que varias celdas de la rejilla estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat, y que la compresion por si sola eleva la tasa de exito de ataque. No puede asumirse un comportamiento seguro sin evaluacion propia.
- Discrepancia de trazabilidad: el nombre del repositorio incluye "remove50" mientras que la model card declara 0,00 % de parametros eliminados, 0 componentes restaurados y fraccion de parametros resultante 0,0000. Esta contradiccion debe resolverse antes de usar el checkpoint en cualquier comparacion.
- La regla de seleccion empleada se declara como `unknown`, lo que impide reproducir el criterio de seleccion de componentes a partir de la model card.
- No hay informacion sobre sesgos, idiomas soportados, longitud de contexto efectiva ni precision de los pesos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para este checkpoint.
- No se documenta plantilla de prompt, formato de chat ni soporte de herramientas, por lo que el comportamiento conversacional puede diferir del esperado en Llama-2-7b-chat.
- Licencia: Llama 2 Community License. El uso esta sujeto a `LICENSE.txt` y `USE_POLICY.md`, ambos incluidos en el repositorio, lo que impone restricciones de uso comercial y obligaciones de atribucion ("Built with Llama 2"). No es una licencia de codigo abierto permisiva.
- Uso en produccion: no recomendado sin una evaluacion de seguridad y utilidad especifica para el caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svdsafety_l2_remove50_whiten_base
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Paper de SVD-LLM: no disponible en la informacion proporcionada (la model card menciona la tecnica sin enlace)
- Ficheros de licencia y politica de uso: `LICENSE.txt` y `USE_POLICY.md` dentro del repositorio de Hugging Face
- Demo o espacio asociado: no disponible
