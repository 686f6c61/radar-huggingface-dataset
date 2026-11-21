# Nsmith15/consapia-router-strong-GGUF

## Resumen

Consapia router (strong) es un ajuste fino (fine-tune) del modelo microsoft/Phi-4-mini-instruct, publicado por el usuario Nsmith15 en Hugging Face. Su funcion especifica es actuar como enrutador de preguntas: recibe una unica pregunta de entrada y la transforma en un plan JSON compuesto por entre 2 y 6 subtareas tipadas. No es, por tanto, un modelo de proposito general, sino un componente especializado dentro de una arquitectura mayor denominada Consapia, orientada a descomponer consultas complejas en pasos ejecutables por otros modelos o herramientas.

El modelo base, Phi-4-mini-instruct de Microsoft, es un transformer denso de aproximadamente 3.800 millones de parametros, disenado originalmente para instrucciones conversacionales. Consapia router hereda esa base y anade un comportamiento de salida estructurada en JSON. El repositorio distribuido contiene unicamente pesos en formato GGUF, cuantizados en Q4_K_M con calibracion mediante importance matrix (imatrix), lo que reduce el peso a unos 2,5 GB y lo hace apto para inferencia en CPU o GPU de gama media mediante llama.cpp y wllama.

La relevancia de este modelo radica en su enfoque: en lugar de competir como modelo generalista, se posiciona como una pieza de orquestacion ligera que puede ejecutarse localmente o en entornos con recursos limitados. El repositorio esta dividido en partes de 512 MB para facilitar su carga en wllama (implementacion de llama.cpp en WebAssembly), lo que sugiere un uso previsto en navegador o en entornos edge. La licencia es MIT, lo que facilita su integracion comercial, si bien el autor remite a los terminos del modelo base en los archivos LICENSE y NOTICE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de microsoft/Phi-4-mini-instruct) |
| Parametros totales | 3.836.021.856 (aprox. 3,8 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (dividido en partes de 512 MB, con manifiesto consapia-gguf.json) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-4-mini-instruct, un transformer denso de aproximadamente 3,8 mil millones de parametros. El autor no detalla en la model card la composicion del dataset de ajuste fino, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. Lo unico que se especifica es que el ajuste convierte una pregunta en un plan JSON de 2 a 6 subtareas tipadas, lo que implica un entrenamiento supervisado orientado a la generacion de salida estructurada.

La innovacion tecnica destacable no reside en la arquitectura, sino en el proceso de cuantizacion y empaquetado: se emplea Q4_K_M calibrado con importance matrix para preservar la calidad de los pesos mas relevantes, y el resultado se fragmenta en partes de 512 MB acompanadas de un manifiesto `consapia-gguf.json` que indica al runtime que partes cargar. Este diseno esta pensado explicitamente para wllama, lo que apunta a despliegues en navegador o entornos WebAssembly con restricciones de memoria y de tamano de fichero. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de planes JSON estructurados: transforma una pregunta en 2-6 subtareas tipadas, que es su funcion principal y practicamente exclusiva.
- Razonamiento de descomposicion: interpreta la intencion de la consulta para segmentarla en pasos logicos.
- Salida estructurada: el formato JSON permite su consumo directo por parte de orquestadores y pipelines automatizados.
- Ejecucion local: al estar en GGUF Q4_K_M, puede correr en CPU y en GPUs de consumo.
- Integracion en wllama: el fraccionamiento en partes de 512 MB facilita su carga en entornos WebAssembly.
- Soporte de tool calling: no disponible de forma explicita en la informacion proporcionada; su salida JSON puede interpretarse como especificacion de tareas, pero no se documenta un protocolo de function calling.
- Capacidades multilingues: no disponibles; el autor no especifica idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Orquestacion de agentes multi-paso: el modelo recibe la consulta del usuario y emite un plan JSON con subtareas que un orquestador distribuye entre modelos especializados o herramientas. Su tamano reducido permite ejecutarlo como primer eslabon de la cadena sin consumir recursos significativos.
- Enrutamiento en pipelines RAG: ante una pregunta compleja, genera subtareas de recuperacion independientes que pueden lanzarse en paralelo contra un indice vectorial, mejorando la cobertura de la busqueda.
- Despliegue en navegador con wllama: gracias al fraccionamiento en partes de 512 MB y a la cuantizacion Q4_K_M, puede cargarse en una aplicacion web que planifique tareas en el cliente sin enviar la consulta a un servidor.
- Prototipado rapido de sistemas de descomposicion: al ser un modelo pequeno y con licencia MIT, sirve para validar arquitecturas de routing antes de invertir en modelos mayores.
- Automatizacion de flujos internos: en un backend con llama.cpp, puede clasificar y descomponer solicitudes entrantes (por ejemplo, tickets de soporte) en subtareas asignables a distintos equipos o servicios.
- Educacion e investigacion: util como caso de estudio de fine-tuning para salida estructurada sobre un modelo base conocido, y para experimentar con cuantizacion imatrix en entornos con recursos limitados.
- Procesamiento en edge: en dispositivos con poca VRAM o sin GPU, la version Q4_K_M permite ejecutar el enrutador en CPU con un consumo de memoria moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de una cuantizacion Q4_K_M de un modelo de 3,8 mil millones de parametros, el fichero pesa aproximadamente 2,5 GB; se necesita espacio de memoria equivalente mas el overhead del contexto y del runtime (tipicamente entre 3 y 4 GB en total).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede alojarlo; una RTX 3060, RTX 4060 o superiores lo ejecutan con holgura. En GPUs de datacenter como A100 o H100 funcionaria, aunque es un modelo pensado para entornos mas modestos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas de VRAM; tambien en CPU.
- Opciones de despliegue: llama.cpp y wllama son los entornos documentados por el autor; tambien deberia funcionar en Ollama y en otros runtimes compatibles con GGUF, aunque no se confirma en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Consapia router (strong) GGUF | 3,8 mil millones | no disponible | GGUF Q4_K_M | MIT | Enrutamiento y descomposicion en JSON |
| microsoft/Phi-4-mini-instruct | 3,8 mil millones | no disponible | safetensors y otros | MIT | Instrucciones generales |
| Modelos de routing especializados de 3-7B | variable | variable | variable | variable | Descomposicion de tareas |

La comparacion mas directa es con el propio modelo base, Phi-4-mini-instruct: Consapia router sacrifica la generalidad conversacional en favor de una salida JSON especializada, pero conserva el mismo tamano y una licencia igualmente permisiva. Frente a otros enrutadores especializados, la ventaja diferencial es su empaquetado para wllama y su cuantizacion imatrix; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para producir planes JSON de 2 a 6 subtareas; su comportamiento fuera de esa tarea no esta documentado y probablemente sea degradado respecto al modelo base.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad en la descomposicion de tareas ni comparaciones con alternativas.
- Idiomas no especificados: se desconoce si el ajuste fino conserva el multilingueismo del modelo base o si se ha limitado a un idioma concreto.
- Riesgo de alucinacion: como todo modelo generativo, puede producir subtareas incoherentes, tipos invalidos o JSON malformado; en produccion conviene validar la salida con un esquema estricto.
- Contexto desconocido: no se indica la longitud de contexto efectiva, lo que dificulta planificar consultas largas.
- Dependencia del manifiesto: el despliegue requiere cargar todas las partes listadas en `consapia-gguf.json`; una carga parcial o desordenada puede fallar.
- Licencia: el repositorio declara MIT, pero el autor remite a los terminos del modelo base en los archivos LICENSE y NOTICE; conviene revisarlos antes de un uso comercial.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay senales de validacion por parte de la comunidad.
- Sin garantias de mantenimiento: al ser un proyecto de un autor individual, no hay compromiso documentado de actualizaciones o soporte.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nsmith15/consapia-router-strong-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- wllama: https://github.com/ngxson/wllama
