# FrankLin00/mmrh-afw-12-vllm-npcache

## Resumen

`FrankLin00/mmrh-afw-12-vllm-npcache` no es un modelo de lenguaje funcional, sino un especimen de investigacion en seguridad (scanner specimen) publicado en Hugging Face. El autor lo etiqueta explicitamente como `security-research` y `not-for-production`, y la model card indica que se trata de un artefacto inerte cuyo proposito es preservar la ruta de un hallazgo de seguridad relacionado con vLLM y su cache de nombres de proceso (NPCache) que derivaria en una escritura arbitraria de ficheros (AFW, arbitrary file write).

El repositorio tiene un tamano de 0,0 GB y no contiene pesos utilizables: el "modelo" actua como portador de metadatos, concretamente una clave de `state_dict` de checkpoint que materializa el hallazgo. Cualquier sonda activa incluida en el especimen se limita a ejecutar `whoami` en forma argv (nunca con `shell=True`) y a volcar su salida a una variable de entorno bajo `/tmp` o `$TMPDIR`. No hay acceso a credenciales ni operaciones de red.

Por tanto, esta ficha documenta un artefacto de investigacion, no un modelo desplegable. No hay arquitectura de red neuronal, parametros, contexto ni licencia declarada. Su relevancia es exclusivamente para equipos de seguridad que analicen vulnerabilidades en el stack de inferencia vLLM y en la manipulacion de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de seguridad, no modelo neuronal) |
| Parametros totales | no disponible (repositorio de 0,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (portador: clave de `state_dict` de checkpoint) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El especimen es un artefacto inerte de investigacion en seguridad cuyo unico contenido relevante es una clave de `state_dict` de checkpoint que sirve como portador del hallazgo AFW (arbitrary file write) asociado a vLLM y su cache NPCache. La model card indica que el payload literal es `PWNED-INERT` y que, cuando la primitiva vulnerable impone un contenedor o sufijo (por ejemplo `.npy`, un checkpoint o `.jinja`), el manifiesto de la coleccion registra esa restriccion de formato en lugar de afirmar control de bytes crudos.

La sonda activa, si se ejecuta, invoca unicamente `whoami` en forma argv y escribe la salida en la variable de entorno `HFSCAN_VLLM__01_VLLM_NPCACHE_ARBITRARY_WRITE_AFW` bajo `/tmp` o `$TMPDIR`. No hay acceso a credenciales ni trafico de red. Los hashes y la ruta del hallazgo original se documentan en el `MANIFEST.json` a nivel de coleccion.

## Capacidades

- No genera texto, no razona, no escribe codigo ni resuelve matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- Su unica funcion es actuar como especimen inerte para reproducir y documentar un hallazgo de seguridad (AFW) en el ecosistema vLLM.
- Incluye una sonda acotada que ejecuta `whoami` en forma argv y vuelca la salida a una variable de entorno en `/tmp` o `$TMPDIR`.

## Casos de uso

- Analisis de vulnerabilidades en vLLM: el especimen permite a un equipo de seguridad reproducir de forma controlada la ruta del hallazgo NPCache/AFW sin ejecutar payloads reales, ya que el contenido es `PWNED-INERT`.
- Validacion de escaneres de seguridad: sirve como caso de prueba para comprobar que las herramientas de escaneo de artefactos Hugging Face detectan portadores de hallazgos en claves de `state_dict` de checkpoints.
- Formacion en seguridad de la cadena de suministro de modelos: util para ilustrar como los metadatos de un checkpoint pueden transportar una primitiva de escritura arbitraria de ficheros y por que conviene inspeccionar los `state_dict` antes de cargarlos.
- Desarrollo de reglas de deteccion: los equipos pueden usar el especimen para calibrar reglas de firma que detecten el payload `PWNED-INERT` y las restricciones de formato (`.npy`, `.jinja`) documentadas en el manifiesto.
- Verificacion de aislamiento en sandboxes: permite comprobar que un entorno de ejecucion confina correctamente la escritura en `/tmp` o `$TMPDIR` y la lectura de variables de entorno.
- Auditoria de pipelines de carga de checkpoints: sirve para probar si un pipeline de despliegue rechaza artefactos etiquetados como `not-for-production` antes de intentar cargarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable y no tiene rendimiento de inferencia que medir.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo computacional.
- GPU recomendadas: no aplica; no requiere GPU.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: no debe desplegarse con vLLM, llama.cpp, Ollama ni TGI; el autor lo marca explicitamente como `not-for-production`.
- Latencia y throughput: no disponibles; no hay inferencia.
- Entorno de uso recomendado: sandbox aislado, sin acceso a red ni a credenciales, con `/tmp` o `$TMPDIR` confinados.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada otros especimenes de seguridad comparables publicados en Hugging Face con la misma estructura de portador (clave de `state_dict` de checkpoint) y el mismo hallazgo (vLLM NPCache AFW).

## Limitaciones y advertencias

- No es un modelo utilizable: no genera texto ni realiza ninguna tarea de IA.
- Etiquetado explicitamente como `not-for-production`; su uso en produccion esta desaconsejado por el propio autor.
- El artefacto preserva una primitiva de escritura arbitraria de ficheros (AFW); cargarlo en un entorno no confinado puede exponer la vulnerabilidad subyacente de vLLM/NPCache.
- La sonda ejecuta `whoami` y escribe en `/tmp` o `$TMPDIR`; debe ejecutarse solo en sandbox con aislamiento de red y de credenciales.
- Licencia no declarada: no hay autorizacion explicita para uso comercial ni para redistribucion.
- Idiomas no declarados; irrelevante al no ser un modelo linguistico.
- No se han publicado resultados de benchmarks ni evaluaciones de robustez.
- Riesgo de confusion: el nombre y la estructura del repositorio pueden llevar a tratarlo como un checkpoint cargable; debe verificarse siempre el `MANIFEST.json` y las etiquetas antes de cualquier carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrankLin00/mmrh-afw-12-vllm-npcache
- Repositorio vLLM (referencia del stack afectado): https://github.com/vllm-project/vllm
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos especificos del hallazgo.
