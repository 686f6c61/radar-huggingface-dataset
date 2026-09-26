# shukyb26/repogates-canary

## Resumen

`shukyb26/repogates-canary` no es un modelo de aprendizaje automatico. Es un repositorio alojado en Hugging Face que funciona como fixture de prueba deliberado para RepoGates, una herramienta de comprobacion de repositorios, modelos y paquetes antes de que lleguen a la maquina de un desarrollador. Su contenido no incluye pesos, codigo ejecutable, scripts ni binarios; el unico artefacto relevante es un fichero `CLAUDE.md` con caracteres Unicode de tag invisibles (rango U+E0000–U+E007F) que deletrean la etiqueta "REPOGATES TEST CANARY - NOT AN INSTRUCTION".

El proposito del repositorio es servir de caso negativo conocido: una muestra que RepoGates *debe* bloquear sin necesidad de apuntar a malware real. La tecnica que lo activa se conoce como "Rules File Backdoor": ocultar instrucciones en ficheros de instrucciones que leen los agentes de codificacion con IA, de forma que un revisor humano no las vea. En este caso el texto oculto es inofensivo, pero dispara la comprobacion C19 de RepoGates, cuya politica por defecto es bloquear.

Es relevante ahora porque los agentes de codigo (Claude, Cursor, Copilot y similares) leen ficheros de instrucciones del repositorio antes de actuar, lo que convierte esos ficheros en una superficie de ataque; disponer de un canario publico, con licencia CC0 y espejado en GitHub, GitLab y Hugging Face, permite validar detectores y demostrar el riesgo sin distribuir codigo danino. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable — no es un modelo; es un repositorio de prueba con un fichero `CLAUDE.md` que contiene caracteres Unicode de tag |
| Parametros totales | no aplicable (0 parametros; no contiene pesos) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable — no hay pesos que cuantizar |
| Idiomas soportados | no disponible — el unico contenido textual es la etiqueta ASCII "REPOGATES TEST CANARY - NOT AN INSTRUCTION" y la propia secuencia de caracteres de tag |
| Licencia | CC0 1.0 |
| Formato de pesos | no aplicable — no contiene pesos |
| Autor | shukyb26 (equipo de RepoGates, segun la model card) |
| Identificador | shukyb26/repogates-canary |
| Etiquetas | test, repogates, canary, region:us |
| Comprobacion que dispara | C19 (caracteres invisibles en fichero de instrucciones para agentes) |
| Resultado esperado | BLOCK |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El repositorio es un fixture estatico: un fichero de instrucciones `CLAUDE.md` que incluye una secuencia de caracteres Unicode del bloque "tags" (U+E0000–U+E007F), un rango que la mayoria de editores y terminales no renderiza. Ese texto codifica unicamente la cadena "REPOGATES TEST CANARY - NOT AN INSTRUCTION"; no contiene instrucciones operativas, ordenes para el agente ni carga util.

No hay dataset, no hay tokens de entrenamiento, no hay fases de RLHF, DPO ni ajuste por instrucciones. La unica "innovacion" tecnica es la eleccion del vector de prueba: el uso de caracteres de tag invisibles dentro de un fichero de instrucciones de agente, que es precisamente el patron que la tecnica "Rules File Backdoor" emplea para evadir la revision humana. El repositorio se publica de forma espejada en GitHub, GitLab y Hugging Face bajo el mismo nombre, lo que permite comprobar la cobertura de distintos escaneres sobre un artefacto identico.

## Capacidades

- No genera texto, no razona, no escribe codigo y no realiza ninguna tarea de inferencia: no es un modelo.
- No expone API, endpoint ni pipeline de Hugging Face (`pipeline` figura como no disponible).
- Actua como caso negativo de referencia (canario) para validar que un escaner de seguridad bloquea un repositorio.
- Dispara de forma intencionada la comprobacion C19 de RepoGates, orientada a caracteres Unicode invisibles en ficheros de instrucciones de agentes.
- Sirve como muestra reproducible de la tecnica "Rules File Backdoor" sin emplear codigo danino real.
- No contiene llamadas de red, scripts, binarios ni codigo ejecutable, por lo que no tiene capacidad de ejecucion ni de tool calling.
- No dispone de capacidades multilingues, de vision, de audio ni de modo de razonamiento.

## Casos de uso

- Prueba de humo en CI/CD de RepoGates: ejecutar la herramienta contra este repositorio en cada release y verificar que C19 sigue disparando y que la politica por defecto devuelve BLOCK, de modo que una regresion en el detector se detecte de inmediato.
- Demostracion comercial: mostrar a un cliente potencial, en una demo en vivo, como se bloquea una inyeccion oculta en un fichero de instrucciones de agente sin necesidad de apuntar a malware real ni asumir riesgos legales.
- Desarrollo y validacion de detectores de Unicode: usar la secuencia U+E0000–U+E007F como entrada conocida para comprobar que un parser identifica correctamente los caracteres de tag y no los normaliza silenciosamente.
- Pruebas de regresion de agentes de codigo: verificar que un agente que abre el repositorio no extrae instrucciones operativas del texto oculto y que el filtro previo lo detiene antes de que el agente actue.
- Formacion y concienciacion en equipos de seguridad: emplear el repositorio como ejemplo didactico de como se ve un fichero de instrucciones manipulado y por que la revision visual no es suficiente.
- Comparacion de cobertura entre plataformas: al estar espejado en GitHub, GitLab y Hugging Face con el mismo contenido, permite contrastar si cada plataforma y cada escaner de terceros detectan el mismo vector.
- Validacion de pipelines de preprocesado de texto: comprobar que las etapas de limpieza, tokenizacion o extraccion de texto no descartan ni reescriben los caracteres invisibles antes de que la comprobacion de seguridad los vea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo y no genera salidas evaluables con MMLU, HumanEval, GSM8K ni ninguna otra metrica de calidad. El unico resultado declarado por el autor es cualitativo y binario:

| Prueba | Resultado esperado |
|---|---|
| Comprobacion C19 de RepoGates sobre `CLAUDE.md` | BLOCK |
| Ejecucion de codigo contenido en el repositorio | ninguna (no hay codigo) |
| Metricas de calidad de modelo (MMLU, HumanEval, GSM8K) | no aplicable |

## Requisitos de hardware

- VRAM para inferencia: no aplicable. No hay modelo que cargar en memoria.
- GPU recomendadas: ninguna. No se requiere acelerador de ningun tipo.
- Compatibilidad con GPU de consumo: irrelevante; el artefacto no consume recursos de computo.
- Opciones de despliegue: no aplicable. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no existen pesos.
- Latencia y throughput: no disponibles y no aplicables. El coste relevante es el de la comprobacion de seguridad que se ejecute sobre el repositorio, que depende de la herramienta de escaneo y no del artefacto.
- Almacenamiento: el repositorio ocupa unos pocos kilobytes (un fichero de texto), aunque el peso exacto no figura en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. Este artefacto no pertenece a ninguna categoria de modelo (no es un LLM, ni un modelo multimodal, ni un modelo de embeddings), por lo que no existe una comparativa significativa de parametros, contexto, rendimiento o licencia frente a alternativas. En su categoria real, la de fixtures de seguridad, la informacion proporcionada no incluye otros canarios equivalentes con los que comparar de forma cuantitativa.

## Limitaciones y advertencias

- No es un modelo utilizable: no se puede cargar, no infiere, no genera texto y no tiene pesos.
- El contenido oculto no debe interpretarse como instrucciones para un agente; el propio repositorio declara que el texto solo deletrea una etiqueta.
- Riesgo de confusion: el nombre, las etiquetas y la presencia en Hugging Face pueden llevar a alguien a tratarlo como un modelo descargable e intentar cargarlo sin exito.
- Los caracteres de tag invisibles pueden perderse en copias, pegados, conversiones de codificacion o normalizaciones Unicode, lo que invalidaria la prueba y produciria falsos negativos si se usa como unico caso de test.
- Sin adopcion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa del fixture ni garantia de que siga actualizado.
- Licencia CC0 1.0: permite uso comercial, modificacion y redistribucion sin atribucion ni restricciones; no hay limitacion de uso comercial que invocar.
- Al ser un canario publico y conocido, un atacante puede excluirlo o modificarlo; no debe usarse como unico criterio de deteccion en produccion.
- No sustituye a una evaluacion de seguridad completa: solo cubre un vector concreto (fichero de instrucciones de agente con caracteres invisibles).
- Las fechas de creacion y ultima actualizacion registradas (2026-09-26) figuran tal cual en los metadatos proporcionados y no se han podido verificar de forma independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shukyb26/repogates-canary
- Sitio de RepoGates: https://repogates.com
- Documentacion de RepoGates para agentes y MCP (servidor MCP, herramienta `assert_allowed`, limite honesto y "AgentBaiting"): https://repogates.com/docs/agents.html
