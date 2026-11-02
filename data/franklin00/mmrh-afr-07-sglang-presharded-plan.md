# FrankLin00/mmrh-afr-07-sglang-presharded-plan

## Resumen

`FrankLin00/mmrh-afr-07-sglang-presharded-plan` no es un modelo de lenguaje funcional, sino un especimen inerte de investigacion en seguridad publicado en HuggingFace. El autor lo etiqueta explicitamente como `security-research` y `not-for-production`, y la model card lo describe como un "inert scanner specimen for academic security research" que preserva el vector de metadatos de un hallazgo: un nombre de fichero de checksum dentro de un plan de sharding previo (presharded) que permite un ataque de traversal y sustitucion de pesos en el contexto de SGLang.

El repositorio forma parte de una coleccion mas amplia (referenciada mediante un `MANIFEST.json` a nivel de coleccion) que documenta hallazgos de seguridad en infraestructuras de despliegue de modelos. El especimen no contiene pesos entrenados, no tiene pipeline declarado, no declara idiomas y no dispone de licencia indicada en la informacion proporcionada. Cualquier sonda activa que incluya se limita a ejecutar `whoami` en forma de argv (nunca con `shell=True`) y a escribir su salida en una variable de entorno bajo `/tmp` o `$TMPDIR`.

Por tanto, esta ficha debe leerse como documentacion de un artefacto de investigacion, no como la de un modelo desplegable. No hay arquitectura de red neuronal, tokenizador, contexto ni datos de entrenamiento que evaluar. Su relevancia es exclusivamente defensiva: sirve para reproducir y estudiar una clase de vulnerabilidad en pipelines de servicio de modelos (concretamente en la gestion de planes pre-fragmentados de SGLang), de modo que los equipos de plataforma puedan detectar y mitigar el patron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de red neuronal; especimen de investigacion de seguridad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el hallazgo afecta a nombres de fichero de checksum en planes presharded; el manifiesto registra restricciones de formato como `.npy`, checkpoints o `.jinja`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El artefacto es un "carrier" de metadatos: reproduce la estructura de nombres de un plan de sharding previo de SGLang en la que un nombre de fichero de checksum (AFR, del ingles *arbitrary file read* o lectura arbitraria de ficheros, segun la nomenclatura del autor) puede manipularse para provocar traversal de rutas y sustitucion de pesos. La model card indica que las variantes AFW del mismo corpus utilizan el payload inerte literal `PWNED-INERT`, y que cuando la primitiva vulnerable impone un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto registra esa restriccion de formato en lugar de afirmar control de bytes en crudo.

La unica "ejecucion" documentada es una sonda inerte que invoca `whoami` en forma de argv, sin `shell=True`, y escribe la salida en la variable de entorno `HFSCAN_SGLANG__02_PRESHARDED_PLAN_TRAVERSAL_WEIGHT_SUBSTITUTION_AFR` bajo `/tmp` o `$TMPDIR`. Segun el autor, no realiza acceso a credenciales ni operaciones de red. No se documentan datos de entrenamiento, tokens, RLHF, DPO ni innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) porque no aplican.

## Capacidades

- No genera texto, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No dispone de modo thinking, vision ni audio.
- Su unica funcion documentada es preservar el vector de metadatos de un hallazgo de seguridad (nombre de fichero de checksum en un plan presharded de SGLang).
- Incluye una sonda inerte limitada a `whoami` en forma de argv con salida a variable de entorno bajo `/tmp` o `$TMPDIR`.

## Casos de uso

- Reproduccion de hallazgos en laboratorio: el especimen permite a un equipo de seguridad reproducir el patron de traversal y sustitucion de pesos en un entorno controlado, comparando el nombre de checksum manipulado con el `MANIFEST.json` de la coleccion para verificar hashes y la ruta del hallazgo original.
- Desarrollo de reglas de deteccion: los equipos de plataforma pueden usar el nombre de fichero y la estructura del plan como firma para construir reglas en escaneres de artefactos (por ejemplo, validacion estricta de rutas en nombres de checksum) antes de desplegar modelos en SGLang.
- Auditoria de pipelines de despliegue: sirve como caso de prueba en revisiones de codigo del cargador de planes presharded, verificando que la resolucion de rutas no acepta componentes `..` ni rutas absolutas.
- Formacion y concienciacion: util como ejemplo didactico en talleres de seguridad de la cadena de suministro de modelos sobre por que los metadatos de un repositorio (nombres de fichero, manifiestos) son superficie de ataque.
- Pruebas de regresion de parcheo: tras aplicar una mitigacion en el cargador de planes de SGLang, el especimen permite comprobar que el patron ya no se resuelve ni provoca sustitucion de pesos.
- Validacion de sandboxing: la sonda `whoami` con salida a `/tmp` o `$TMPDIR` permite verificar que un entorno de analisis confina la ejecucion y no expone credenciales ni red, tal como declara el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes, y no se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo que cargar.
- GPU recomendadas: no aplica (A100, H100, RTX 4090 u otras no son necesarias).
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto no es servible como modelo.
- Latencia y throughput: no disponibles; la unica operacion documentada es la sonda `whoami`, cuyo coste es el de un proceso trivial.
- Entorno de analisis: cualquier maquina con acceso a `/tmp` o `$TMPDIR` y capacidad de ejecutar `whoami`; se recomienda sandbox sin red ni credenciales.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada otros especimenes comparables de la misma coleccion mas alla de la referencia generica a las variantes AFW con payload `PWNED-INERT`, ni modelos de lenguaje con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo utilizable: el autor lo marca explicitamente como `not-for-production`; usarlo en produccion carece de sentido y puede introducir riesgo.
- No dispone de licencia declarada en la informacion proporcionada; no debe asumirse permiso de uso comercial.
- No hay idiomas, pipeline ni pesos declarados, por lo que no puede evaluarse calidad, sesgos ni alucinacion.
- El contenido describe una vulnerabilidad (traversal de rutas y sustitucion de pesos en planes presharded de SGLang); manipularlo fuera de un entorno aislado puede tener implicaciones de seguridad.
- La sonda solo ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR` segun el autor, pero cualquier ejecucion de artefactos de investigacion debe hacerse en sandbox sin credenciales ni red.
- El manifiesto de la coleccion registra restricciones de formato (`.npy`, checkpoints, `.jinja`) en lugar de control de bytes en crudo; no debe interpretarse como prueba de explotacion completa.
- Los hashes y la ruta del hallazgo original deben consultarse en el `MANIFEST.json` de la coleccion, no en este repositorio individual.

## Enlaces

- HuggingFace: https://huggingface.co/FrankLin00/mmrh-afr-07-sglang-presharded-plan
- Manifiesto de la coleccion: `MANIFEST.json` a nivel de coleccion (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
- Repositorio de SGLang: no disponible en la informacion proporcionada
- Paper, blog o demo asociados: no disponibles en la informacion proporcionada
