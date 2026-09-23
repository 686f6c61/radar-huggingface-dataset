# MANGSEOK123/qwen3-4b-tau2-telecom-real78-1ep

## Resumen

qwen3-4b-tau2-telecom-real78-1ep es un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en HuggingFace. Se trata de un transformer denso decoder-only de 4.411.424.256 parámetros (4,41 B) que ha sido consolidado mediante una técnica denominada OEL (experience distillation, segun las etiquetas del repositorio) sobre el dominio telecom del benchmark tau2-bench, usando 78 pares tarea-memoria de autoria externa.

El problema que aborda es concreto: conseguir que un modelo pequeno reproduzca, sin memoria en el prompt, el comportamiento de un profesor que si dispone de esa memoria. Durante el entrenamiento, el estudiante reproduce cada tarea sin memoria y el profesor son los mismos pesos con la memoria de la tarea insertada en el system prompt; la unica diferencia entre ambos es el prompt y no se utiliza ninguna recompensa, solo una perdida KL sobre todos los tokens de respuesta.

Su relevancia actual es doble. Por un lado, es un experimento de destilacion de experiencia en un modelo de 4 B, un tamano que cabe en GPU de consumo. Por otro, el autor declara explicitamente que el modelo no ha sido evaluado tras el entrenamiento, por lo que debe considerarse un artefacto de investigacion mas que un modelo listo para produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3); numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el ejemplo de despliegue recomienda `--max-model-len 40960` |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio solo contiene safetensors en precision completa, cuantizables externamente (GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,8 GB) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Datos de ajuste | 78 pares tarea-memoria (29 composicion, 29 sustitucion, 20 recall) del dominio telecom de tau2-bench |
| Epocas | 1 |
| Ratio de aprendizaje | 3e-6, constante |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-22T23:19:58Z |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer denso decoder-only de 4,41 B de parametros. La model card no detalla la configuracion interna (numero de capas, cabezas de atencion, tipo de positional encoding ni funcion de activacion), de modo que esos datos no estan disponibles en la informacion proporcionada. El repositorio pesa 8,8 GB, lo que es coherente con pesos en BF16/FP16 sin cuantizar.

El entrenamiento utiliza destilacion de experiencia (OEL) sin recompensa. El estudiante reproduce cada tarea sin memoria; el profesor son los mismos pesos con la memoria de esa tarea en el system prompt. Solo difiere el prompt. La perdida es una KL completa sobre todos los tokens de respuesta con `kl_topk` 256, batch size 12 (cada batch completo), 1 epoca, learning rate constante de 3e-6 y gradient clipping de 1,0 (valor por defecto de verl). El simulador de usuario fue gpt-4.1-mini con temperatura 0.

| Paso | Perdida KL | Entropia | Norma del gradiente |
|---|---|---|---|
| 1 | 0,013 | 0,090 | 5,832 |
| 2 | 0,022 | 0,279 | 5,111 |
| 3 | 0,014 | 0,332 | 5,194 |
| 4 | 0,012 | 0,315 | 4,203 |
| 5 | 0,034 | 0,329 | 5,113 |
| 6 | 0,057 | 0,357 | 4,403 |
| 7 | 0,012 | 0,381 | 1,475 |

El propio autor advierte que cada paso lee un batch distinto, por lo que la columna de perdida refleja la dificultad del batch y no la convergencia. No hay ninguna innovacion arquitectonica: la novedad esta en el procedimiento de destilacion, no en el modelo.

## Capacidades

- Generacion de texto y dialogo multi-turno orientado a tareas de atencion al cliente en el dominio de telecomunicaciones.
- Tool calling / function calling: el ejemplo de despliegue de la model card activa `--enable-auto-tool-choice` con `--tool-call-parser hermes`, lo que implica soporte de llamadas a herramientas en formato compatible con el parser Hermes de vLLM.
- Seguimiento de politicas y procedimientos: tau2-bench evalua agentes que deben cumplir reglas de negocio, verificar identidad y ejecutar acciones sobre el estado del sistema.
- Razonamiento multi-paso propio de agentes: el bucle de tau2-bench requiere consultar herramientas, interpretar resultados y decidir la siguiente accion.
- Reproduccion de comportamiento destilado sin memoria en el prompt: el objetivo del entrenamiento es que el modelo imite al profesor que si dispone de la memoria de la tarea.
- Capacidades multilingues: no disponibles; no se documentan los idiomas cubiertos.
- Vision, audio o modo de razonamiento extendido (thinking): no disponibles; la informacion proporcionada solo describe un modelo de texto.

## Casos de uso

- Atencion al cliente automatizada en telecomunicaciones: es el escenario exacto para el que se entreno. El modelo puede gestionar conversaciones multi-turno, consultar el estado del cliente mediante tool calling y aplicar las politicas del operador (cambios de tarifa, activacion de servicios, gestion de incidencias).
- Agentes de resolucion de incidencias tecnicas: el modelo puede encadenar llamadas a herramientas para diagnosticar y resolver problemas de conectividad, facturacion o roaming, siguiendo el flujo de tau2-bench.
- Investigacion en destilacion de experiencia: sirve como punto de partida reproducible para estudiar si la memoria de tarea puede internalizarse en los pesos de un modelo de 4 B frente a inyectarla en el prompt.
- Generacion de datos sinteticos de dialogo: combinado con un simulador de usuario, puede generar conversaciones dominio-especificas para aumentar conjuntos de entrenamiento de agentes conversacionales.
- Prototipado local de agentes con herramientas: con 8,8 GB de pesos en BF16 cabe en una GPU de consumo, lo que permite iterar en el bucle agente-herramienta sin depender de APIs externas.
- Pruebas de regresion de flujos conversacionales: puede integrarse en un pipeline de CI que ejecute tareas de tau2-bench contra cada nueva version de un agente y detecte regresiones de politica.
- Base para ajustes posteriores especificos de un operador: al estar bajo Apache-2.0, puede reentrenarse con datos propios de un dominio concreto (por ejemplo, un catalogo de productos real).
- Demostracion tecnica de despliegue con vLLM: la propia model card incluye el comando de servicio, lo que facilita montar una demo con tool calling y ventana de 40.960 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo ajustado en la informacion disponible. El autor indica de forma explicita que el modelo no fue evaluado y que se subio a HuggingFace inmediatamente despues del entrenamiento.

Los unicos numeros disponibles corresponden al modelo base Qwen3-4B-Instruct-2507, aportados como contexto sobre la senal que llevan las memorias:

| Evaluacion | Configuracion | Resultado |
|---|---|---|
| Conjunto de entrenamiento telecom de 59 pares | Modelo base sin memoria | avg 0,085 |
| Conjunto de entrenamiento telecom de 59 pares | Modelo base con la memoria de cada tarea en el prompt | avg 0,175 (177 episodios, ~3,1 errores estandar) |
| tau2-bench telecom, split de test | Modelo base | avg 0,056 / pass@4 0,175 |
| Modelo ajustado (este repositorio) | Cualquier evaluacion | No evaluado |

Estos valores corresponden al modelo base y no deben atribuirse al modelo ajustado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: alrededor de 8,8 GB solo de pesos, mas la cache KV. En la practica se recomienda un minimo de 16 GB de VRAM para una ventana moderada.
- VRAM estimada con cuantizacion: aproximadamente 4,5 GB en INT8 y en torno a 2,5-3 GB en cuantizaciones de 4 bits, aunque estas cifras son estimaciones y no estan publicadas por el autor.
- GPU recomendadas: el modelo cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090. Para servir la ventana de 40.960 tokens con lotes grandes y alta concurrencia conviene una A100 de 40/80 GB o una H100.
- Despliegue: la model card proporciona el comando recomendado para vLLM con `--enable-auto-tool-choice --tool-call-parser hermes --max-model-len 40960`. Tambien es desplegable con TGI o con la libreria transformers. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no publica ficheros GGUF.
- Nota practica: la ventana de 40.960 tokens del ejemplo de servicio consume una parte relevante de la VRAM en forma de cache KV; reducir `--max-model-len` permite servir el modelo en GPUs mas pequenas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los datos del modelo base proceden de la informacion proporcionada. Las cifras de las alternativas corresponden a sus fichas publicas habituales y no han podido verificarse con los resultados de la busqueda web, por lo que deben tomarse como referencia orientativa.

| Modelo | Parametros | Contexto | Licencia | Enfoque | Evaluacion publicada |
|---|---|---|---|---|---|
| qwen3-4b-tau2-telecom-real78-1ep | 4,41 B | 40.960 tokens recomendados en el ejemplo de despliegue | Apache-2.0 | Ajuste OEL sobre tau2-bench telecom | No evaluado |
| Qwen3-4B-Instruct-2507 | 4,41 B | No disponible en la informacion proporcionada | Apache-2.0 | Modelo base instructivo generalista | avg 0,056 / pass@4 0,175 en tau2-bench telecom test |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens segun su documentacion publica | Llama 3.2 Community License | Modelo pequeno generalista con tool calling | No comparable directamente con tau2-bench telecom |
| Phi-4-mini-instruct | 3,8 B | 128.000 tokens segun su documentacion publica | MIT | Modelo pequeno orientado a razonamiento y matematicas | No comparable directamente con tau2-bench telecom |

Frente al modelo base, la diferencia es el ajuste de dominio: menos generalidad potencial a cambio de mas adherencia a tareas de telecom. Frente a Llama 3.2 3B y Phi-4-mini, la ventaja principal es la licencia Apache-2.0 sin clausulas adicionales y el enfoque especifico en agentes con tool calling para telecomunicaciones, aunque carece por completo de evaluacion publicada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado. El propio autor lo indica: se subio inmediatamente despues del entrenamiento. No hay ninguna cifra que demuestre mejora sobre el modelo base.
- El conjunto de entrenamiento es muy pequeno: 78 pares y 1 sola epoca, lo que limita la senal aprendida y aumenta el riesgo de sobreajuste a esas tareas concretas.
- La perdida KL no muestra una tendencia decreciente clara; el autor senala que refleja la dificultad de cada batch, no la convergencia. No hay evidencia de que el proceso haya convergido.
- Especializacion estrecha: el ajuste se limita al dominio telecom de tau2-bench. Fuera de ese dominio cabe esperar un comportamiento degradado respecto al modelo base.
- Riesgo de olvido catastrofico: al entrenar sobre un dominio muy concreto con un learning rate bajo pero sin datos generales, pueden verse afectadas capacidades generales del modelo base.
- Idiomas soportados no documentados. No se puede asumir un buen rendimiento en castellano ni en ningun otro idioma sin una evaluacion previa.
- Riesgo de alucinacion: inherente a los modelos de 4 B de parametros y no mitigado por el autor, que no publica evaluaciones de fidelidad ni de adherencia a politicas.
- Sesgos: no documentados. El modelo hereda los sesgos del base Qwen3-4B-Instruct-2507 y de los datos de entrenamiento del ajuste, sin que exista una evaluacion de sesgo.
- Dependencia del formato de herramientas: el ejemplo de despliegue usa el parser Hermes de vLLM. Otros parsers o formatos de tool calling pueden no funcionar correctamente.
- No se publican pesos cuantizados. Cualquier cuantizacion a 4 u 8 bits realizada por terceros puede alterar el comportamiento destilado, que es precisamente la parte mas fragil del ajuste.
- Licencia Apache-2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se documenten los cambios. No hay restricciones adicionales conocidas.
- Metadatos incoherentes: la fecha de creacion registrada es 2026-09-22, posterior a la fecha esperable de publicacion, lo que apunta a un error de metadatos que conviene tener en cuenta.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta. No existe retroalimentacion externa ni verificacion independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-telecom-real78-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Benchmark tau2-bench (citado en las etiquetas del repositorio): https://github.com/sierra-research/tau2-bench
- Libreria verl (mencionada como origen del valor por defecto de gradient clipping): https://github.com/volcengine/verl
- Documentacion de vLLM sobre tool calling y opciones de servicio: https://docs.vllm.ai
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de soporte de Microsoft ajenas al contenido.
