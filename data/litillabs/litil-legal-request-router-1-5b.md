# litillabs/litil-legal-request-router-1.5b

## Resumen

LiTiL Legal Request Router 1.5B es un adaptador LoRA de tipo PEFT publicado por LiTiL Labs sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su funcion no es generar texto libre, sino clasificar una consulta juridica entrante en una ruta de aplicacion consistente y devolverla como un unico objeto JSON validable. El enrutador distingue seis categorias de practica legal: comercial, laboral, societario, tecnologia/IA, cripto y trabajo juridico general.

El modelo resuelve un problema de ingenieria concreto: colocar una capa barata de triaje delante de una pila de inteligencia juridica, de modo que la ruta aceptada seleccione el formulario de admision, el indice de recuperacion, el playbook, el modelo especialista o la cola de revision adecuados antes de que empiece el analisis costoso. Al almacenar la ruta junto a la consulta original, el sistema puede medir volumen, reasignaciones y comportamiento de fallback en el punto de entrada.

Su relevancia actual viene del formato y del tamano: el adaptador pesa aproximadamente 17,5 MB, se apoya en un modelo base de 1,5 mil millones de parametros y se distribuye con licencia Apache 2.0, lo que permite ejecutarlo en hardware modesto e integrarlo como componente determinista de un pipeline. La contrapartida es un alcance muy acotado, un unico idioma soportado y un entrenamiento basado exclusivamente en datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen2.5-1.5B-Instruct) con adaptador LoRA de PEFT de rango 16 |
| Parametros totales | Aproximadamente 1.500 millones en el modelo base; el adaptador LoRA ocupa unos 17,5 MB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible; el runner de referencia usa float32. La model card indica que una precision menor puede reducir memoria tras una validacion independiente |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptador PEFT LoRA en safetensors; requiere el modelo base Qwen/Qwen2.5-1.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) montado sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only. El adaptador usa rango 16, alpha 32 y dropout 0,05. El checkpoint publicado corresponde al paso 200 de una ejecucion completa de 204 pasos, seleccionado tras tres epocas de ajuste supervisado. El conjunto de post-entrenamiento revisado consta de 540 ejemplos sinteticos autorales y 60 filas de validacion tambien sinteticas; no se utilizaron datos privados de clientes ni de usuarios.

La innovacion no esta en la arquitectura, sino en el contrato de salida. El modelo recibe una lista de mensajes en formato chat de Qwen con una instruccion de sistema fija y debe emitir un unico objeto JSON sin delimitadores con las claves `domain`, `subdomain`, `complexity` (simple, medium o complex), `tools` (array de cadenas), `confidence` (numero entre 0 y 1), `escalate` (booleano) y `reasoning` (cadena breve). La decodificacion recomendada es greedy con un maximo de 256 tokens nuevos. El entorno probado fue Apple MPS en float32 con PyTorch 2.12.0, Transformers 5.9.0 y PEFT 0.19.1, sobre el snapshot del modelo base `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`.

## Capacidades

- Clasificacion de consultas juridicas en seis dominios: comercial, laboral, societario, tecnologia/IA, cripto y trabajo juridico general.
- Generacion de salida estructurada en JSON con dominio, subdominio, complejidad, herramientas propuestas, confianza, escalado propuesto y justificacion breve.
- Estimacion de complejidad en tres niveles (simple, medium, complex) para dimensionar el esfuerzo de analisis posterior.
- Propuesta de herramientas de aplicacion (`tools`) que el sistema puede mapear a componentes reales.
- Propuesta de escalado (`escalate`) y valor de confianza (`confidence`) como senales para politicas de encaminamiento.
- Ejecucion en CPU, MPS y CUDA mediante el runner incluido, que nunca ejecuta las herramientas propuestas.
- No dispone de capacidades de vision, audio, tool calling ejecutable ni modo de razonamiento extendido; su funcion es exclusivamente el enrutamiento y la clasificacion.
- Soporte multilingue: no disponible; el modelo declara unicamente ingles.

## Casos de uso

- Triaje de admision en un despacho juridico: el modelo recibe el texto de la consulta y devuelve el dominio y subdominio, de forma que el sistema asigna automaticamente el formulario de admision y el equipo adecuado antes de cualquier analisis humano.
- Enrutamiento previo a recuperacion aumentada: la ruta devuelta selecciona el indice de recuperacion o el corpus normativo correcto (por ejemplo, laboral frente a societario), lo que reduce el ruido en la fase de busqueda.
- Seleccion de playbook contractual: en consultas marcadas como tecnologia/IA o comercial, el campo `subdomain` permite cargar el playbook de revision correspondiente sin intervencion manual.
- Gestion de colas de revision y escalado: el campo `escalate` y la `confidence` permiten derivar los casos dudosos a revision humana y mantener el resto en flujo automatico.
- Enrutamiento hacia modelos especialistas: la ruta aceptada decide que modelo o agente especializado se invoca despues, evitando ejecutar el modelo mas caro en todas las consultas.
- Instrumentacion y analitica de intake: al registrar cada ruta junto a la consulta original se pueden medir volumen por dominio, tasas de reasignacion y frecuencia de fallback por categoria.
- Filtrado previo en cripto y activos digitales: clasifica las consultas de ese dominio especifico y propone herramientas de comprobacion antes de entrar en analisis regulatorio detallado.
- Validacion de calidad de datos en un pipeline legal: sirve como etiquetador de bajo coste para auditar como se estan clasificando las consultas en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, precision de dominio ni comparaciones cuantitativas frente a otros enrutadores; unicamente documenta un ejemplo registrado de salida producido por el adaptador.

## Requisitos de hardware

- VRAM estimada para el modelo base completo: unos 6 GB de pesos en float32, con overhead de activaciones y cache KV, lo que situa la inferencia en torno a 8 GB de VRAM.
- En float16 o bfloat16 el peso baja a unos 3 GB, con un total estimado de 4 a 5 GB de VRAM.
- En cuantizacion int8 se estiman 1,5 a 2 GB, y en int4 alrededor de 1 GB. Son estimaciones derivadas del tamano del modelo base, no valores validados en la model card.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060, RTX 4070 y superiores. El entorno probado por el autor fue Apple MPS en float32, lo que confirma viabilidad en hardware no dedicado.
- GPU de datacenter como A100 o H100 permitirian un sobredimensionamiento amplio, util si se sirve el enrutador junto a otros modelos.
- Despliegue verificado: PyTorch con Transformers y PEFT, con runner que soporta `cpu`, `mps` y `cuda`. El paquete offline se invoca mediante `demo.py` con las opciones `--show-recorded`, `--base` y `--adapter`.
- Opciones como vLLM, TGI o llama.cpp no estan documentadas en la informacion disponible; requeririan fusionar el adaptador con el modelo base y, en el caso de llama.cpp u Ollama, convertir los pesos a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiTiL Legal Request Router 1.5B | ~1,5 B en el base mas adaptador LoRA de ~17,5 MB | no disponible | JSON de enrutamiento juridico en 6 dominios | Apache 2.0 | HuggingFace: 0 descargas, 0 likes |
| Qwen2.5-1.5B-Instruct (modelo base) | ~1,5 B | no disponible en la informacion proporcionada | Texto libre, sin esquema fijo | Apache 2.0 | HuggingFace |
| Otros enrutadores o clasificadores juridicos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la informacion proporcionada alternativas directas de la misma categoria (enrutamiento juridico con salida JSON sobre un modelo base pequeno), por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Alcance muy restringido: el modelo solo clasifica y enruta; no redacta, no analiza y no ejecuta herramientas.
- Entrenado con 540 ejemplos sinteticos y 60 filas de validacion sinteticas, un volumen muy reducido que limita la cobertura de casos reales y aumenta el riesgo de sobreajuste a los patrones del conjunto de entrenamiento.
- Idioma: solo ingles. Las consultas en castellano u otros idiomas no estan cubiertas por el contrato del modelo.
- Riesgo de alucinacion en la salida estructurada: puede emitir codigos de dominio o subdominio desconocidos, o JSON malformado. La propia model card exige validar el JSON, las claves obligatorias y los codigos de dominio conocidos antes del despacho.
- `confidence`, `tools` y `escalate` deben tratarse como propuestas que la aplicacion puede sustituir por su propia politica; no son decisiones vinculantes.
- La licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen2.5-1.5B-Instruct, cuyas condiciones deben respetarse por separado.
- No se dispone de datos publicos de rendimiento, sesgos ni evaluaciones independientes; el modelo registra 0 descargas y 0 likes en el momento de la consulta.
- El autor no documenta el uso de datos privados ni de RLHF/DPO; el ajuste es exclusivamente supervisado con LoRA.
- En produccion debe fijarse el snapshot del modelo base indicado (`989aa7980e4cf806f80c7fef2b1adb7bc71aa306`) y validarse cualquier cambio a menor precision antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litillabs/litil-legal-request-router-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- La busqueda web realizada no devolvio ningun resultado relevante: los unicos resultados obtenidos eran paginas sobre versiculos biblicos sin relacion con el modelo, el enrutamiento juridico ni LiTiL Labs, por lo que no se incluyen. No se han localizado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
- La model card solicita citar el repositorio de release y Qwen2.5-1.5B-Instruct en cualquier uso del adaptador.
