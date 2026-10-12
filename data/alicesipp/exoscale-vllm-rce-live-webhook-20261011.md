# alicesipp/exoscale-vllm-rce-live-webhook-20261011

## Resumen

Este repositorio no es un modelo de lenguaje funcional: es una prueba de concepto (PoC) de seguridad publicada por el usuario de HuggingFace alicesipp bajo la etiqueta `authorized-poc`. Los pesos y el tokenizador son una copia directa de `sshleifer/tiny-gpt2`, un GPT-2 en miniatura de 3.274.752 parametros, por lo que no existe entrenamiento adicional, ajuste fino ni capacidad generativa util. El interes del artefacto reside en su codigo de configuracion personalizada, que se ejecuta cuando se carga el modelo con `trust_remote_code=True`: segun la propia model card, escribe un fichero marcador en `/tmp` y envia una llamada JSON a un endpoint RequestRepo controlado por el investigador.

El problema que ilustra es relevante para cualquier equipo que despliegue modelos de terceros: la bandera `trust_remote_code` de `transformers` permite ejecucion de codigo arbitrario en el momento de la importacion, antes incluso de que se procese ningun token. En un entorno de inferencia real (vLLM, TGI, endpoints gestionados) esto equivale a una vulnerabilidad de ejecucion remota de codigo (RCE) en el plano de control del servidor, con acceso potencial a variables de entorno, volumenes montados y red interna. El repositorio se presenta como no destructivo y sin acceso a credenciales ni datos de clientes, pero esa afirmacion es una declaracion del autor y no una garantia verificable.

El artefacto se publico el 11 de octubre de 2026, con 0 descargas y 0 likes en el momento de redactar esta ficha, tamano de repositorio practicamente nulo y licencia MIT. Por su naturaleza, debe tratarse como material de laboratorio ofensivo/defensivo, nunca como un componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (pesos copiados de `sshleifer/tiny-gpt2`) |
| Parametros totales | 3.274.752 (3,27 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el modelo base `sshleifer/tiny-gpt2` es de entrenamiento predominantemente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria `transformers`) |

Otros metadatos declarados: `pipeline: text-generation`, tags `security-research`, `authorized-poc`, `endpoints_compatible`, `text-generation-inference`, `region:us`; modelo base `sshleifer/tiny-gpt2` (relacion declarada: `finetune`, aunque la model card indica que los pesos se copian sin modificacion); descargas: 0; likes: 0; tamano del repositorio: 0,0 GB.

## Arquitectura y entrenamiento

La arquitectura es la de `sshleifer/tiny-gpt2`: un transformer decoder-only con atencion causal completa, normalizacion previa a cada subcapa y embeddings de tokens y posiciones, en una configuracion reducida al minimo para pruebas de integracion. Los 3.274.752 parametros estimados a partir del fichero safetensors coinciden con ese modelo base. Segun la model card, tanto los pesos como el tokenizador son copias de `sshleifer/tiny-gpt2`, por lo que no hay preentrenamiento adicional, ni ajuste supervisado, ni RLHF/DPO, ni datos propios que describir. El numero de tokens de entrenamiento, la composicion del dataset y las dimensiones internas (numero de capas, cabezas o dimension de embedding) no estan disponibles en la informacion proporcionada.

La unica "innovacion" tecnica es, precisamente, la del vector de ataque: el repositorio incluye una clase de configuracion personalizada que se instancia al cargar el modelo con `trust_remote_code=True`. Ese codigo realiza dos acciones descritas por el autor: (1) escritura de un fichero marcador en `/tmp`, presumiblemente para evidenciar ejecucion en el sistema de ficheros del host o contenedor, y (2) envio de una peticion HTTP con carga JSON a un endpoint externo tipo RequestRepo, presumiblemente para evidenciar exfiltracion de red saliente. No se especifica si el callback incluye informacion del entorno, ni el formato exacto del payload, ni si existe ofuscacion. Cualquier fork del repositorio podria sustituir ese comportamiento por otro mas agresivo manteniendo el mismo nombre de fichero, lo que invalida cualquier evaluacion basada en la reputacion del autor o del nombre del modelo.

## Capacidades

- Generacion de texto: tecnicamente el pipeline esta declarado como `text-generation`, pero al usar los pesos de `sshleifer/tiny-gpt2` la salida no es coherente ni utilizable para tareas reales; el modelo esta pensado para probar rutas de carga, no para producir texto.
- Razonamiento, matematicas y codigo: no disponible / no soportado de forma efectiva por el modelo base.
- Tool calling y function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles ni evaluadas.
- Capacidad especial de seguridad: ejecucion de codigo arbitrario en tiempo de importacion mediante `trust_remote_code`, con escritura en disco (`/tmp`) y callback de red saliente a un endpoint externo. Esta es la unica capacidad funcional relevante del artefacto.
- Compatibilidad declarada: `endpoints_compatible` y `text-generation-inference`, es decir, el artefacto esta pensado para probar si una plataforma de serving acepta codigo remoto.
- Vision, audio, thinking mode: no soportado.

## Casos de uso

- Reproduccion controlada de la vulnerabilidad `trust_remote_code` en un laboratorio aislado: cargar el modelo en una maquina virtual o contenedor sin red, sin credenciales montadas y con el sistema de ficheros efimero, para observar el marcador en `/tmp` y confirmar el punto exacto del ciclo de carga en el que se ejecuta el codigo.
- Validacion de controles de seguridad de la cadena de suministro de modelos: usar este repositorio como caso de prueba conocido para comprobar si un escaner interno de artefactos detecta ficheros de configuracion con logica ejecutable, clases custom y dependencias de red.
- Pruebas de filtrado de egreso (egress filtering): verificar que el clúster de inferencia bloquea o registra la peticion HTTP saliente hacia el endpoint externo, y que existen alertas en el SIEM cuando un contenedor de serving intenta contactar con dominios no incluidos en la lista blanca.
- Auditoria de aislamiento de sandboxes: confirmar que `/tmp` esta montado como `tmpfs` o volumen efimero y que un proceso de carga de modelo no puede persistir ficheros entre ejecuciones ni leer rutas del host.
- Formacion de equipos de MLOps y plataforma: sesion practica sobre por que no debe habilitarse `trust_remote_code` de forma global, que diferencia hay entre descargar pesos y ejecutar codigo de terceros, y como revisar un `config.json` con `auto_map`.
- Pruebas de regresion en plataformas de serving (vLLM, TGI, endpoints gestionados): comprobar que la carga del modelo falla de forma segura cuando `trust_remote_code` esta deshabilitado y que el mensaje de error no sugiere al operador habilitarlo a ciegas.
- Verificacion de politicas de ingesta en un registro interno de modelos: validar que un artefacto con 0 descargas, 0 likes, licencia permisiva y nombre con apariencia de CVE se marca como no confiable y requiere revision manual antes de cualquier despliegue.
- Generacion de texto en produccion: no es un caso de uso valido. Los pesos son los de un GPT-2 de juguete, la calidad es degenerada y la ejecucion introduce una superficie de ataque critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no tendria sentido medir calidad generativa con pesos de `sshleifer/tiny-gpt2`. La unica metrica objetiva publicada es el recuento de parametros (3.274.752) y el estado del repositorio (0 descargas, 0 likes, 0,0 GB).

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. Con 3,27 M de parametros, los pesos en fp32 ocupan aproximadamente 13 MB; en fp16, unos 6,5 MB. Cualquier acelerador sirve.
- GPU recomendadas: no requiere GPU. Funciona en CPU en cualquier portatil actual; en GPU, desde una GTX 1050 o una iGPU integrada hacia arriba.
- GPU de consumo: cabe en todas, incluidas tarjetas antiguas de 2 GB. No hay requisito de memoria que justifique A100, H100 ni RTX 4090.
- Opciones de despliegue: `transformers` en local, y teoricamente vLLM o TGI por los tags declarados (`text-generation-inference`, `endpoints_compatible`). Cualquier despliegue debe hacerse con `trust_remote_code=False` y, preferiblemente, sin acceso a red. No uses Ollama, llama.cpp ni despliegues GGUF con este repositorio: no publica pesos en esos formatos y el riesgo esta en el codigo de configuracion, no en los pesos.
- Latencia y throughput: no disponibles. Al carecer de utilidad generativa, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alicesipp/exoscale-vllm-rce-live-webhook-20261011` | 3,27 M | no disponible | PoC de seguridad (RCE via `trust_remote_code`) | MIT | Publico, 0 descargas |
| `sshleifer/tiny-gpt2` | 3,27 M | no disponible | Modelo de juguete para tests de integracion de `transformers` | MIT | Publico, ampliamente usado |
| `openai-community/gpt2` (GPT-2 small) | 124 M | 1.024 tokens | Generacion de texto en ingles | MIT | Publico, muy usado |
| `distilgpt2` | 82 M | 1.024 tokens | Generacion de texto destilada de GPT-2 | MIT | Publico, muy usado |

No hay modelos comparables en la categoria "PoC de seguridad publicada como modelo de HuggingFace": se trata de un artefacto ofensivo/defensivo, no de un modelo de lenguaje. Frente a `sshleifer/tiny-gpt2`, del que copia los pesos, la unica diferencia es la clase de configuracion personalizada y su comportamiento en tiempo de carga. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Riesgo de ejecucion de codigo arbitrario: cargar este repositorio con `trust_remote_code=True` ejecuta codigo del autor en la maquina del usuario. La afirmacion de que es "no destructivo" y de que no accede a credenciales ni a datos de clientes proviene unicamente de la model card y no es auditable ni verificable desde fuera.
- Callback de red saliente: el codigo descrito envia una peticion JSON a un endpoint externo controlado por el investigador. En un entorno corporativo esto constituye una fuga de metadatos o una llamada a un dominio no autorizado, ademas de un posible vector de seguimiento.
- Riesgo de suplantacion: cualquier tercero puede publicar un fork con el mismo aspecto y un payload distinto. El nombre del modelo, la licencia MIT y la etiqueta `authorized-poc` no garantizan nada sobre el contenido real.
- Alucinacion y calidad de salida: los pesos son los de `sshleifer/tiny-gpt2`, sin ajuste fino. La generacion de texto sera degenerada, repetitiva o incoherente. No es un modelo utilizable para tareas de lenguaje.
- Idiomas y contexto: no hay informacion publicada sobre idiomas soportados ni longitud de contexto. GPT-2 en su version original esta orientado al ingles y no cubre bien otros idiomas.
- Licencia: MIT sobre el artefacto, heredada del modelo base. La permisividad de la licencia no reduce el riesgo tecnico ni implica que el uso en produccion sea seguro o legalmente adecuado; la responsabilidad de la ejecucion de codigo de terceros recae en quien despliega.
- Advertencia para produccion: no integrar en pipelines de CI/CD con acceso a secretos, no desplegar en endpoints publicos, no habilitar `trust_remote_code` a nivel global en plataformas de serving. Si se audita, hacerlo en una maquina virtual desechable, sin red, sin credenciales y con el sistema de ficheros en modo solo lectura o efimero.
- Ausencia de validacion comunitaria: 0 descargas, 0 likes y 0,0 GB de repositorio. No hay senales externas de revision por parte de la comunidad.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/alicesipp/exoscale-vllm-rce-live-webhook-20261011
- Perfil del autor: https://huggingface.co/alicesipp
- Repositorio relacionado del mismo autor: https://huggingface.co/alicesipp/exoscale-vllm-rce-7efd8f711362
- Modelo base: https://huggingface.co/sshleifer/tiny-gpt2
- Ficha de terceros con metadatos del artefacto: https://free2aitools.com/model/alicesipp/exoscale-vllm-rce-7efd8f711362
- Documentacion de `transformers` sobre codigo remoto y `trust_remote_code`: https://huggingface.co/docs/transformers/en/models
- No se han encontrado papers, blogs tecnicos, repositorios de codigo ni demos adicionales en la busqueda web realizada.
