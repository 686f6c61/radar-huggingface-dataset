# moosemandada/fom-b-dup-apub

## Resumen

El repositorio `moosemandada/fom-b-dup-apub` es un modelo etiquetado como `text-generation` y publicado bajo licencia MIT por el usuario `moosemandada`. En el momento de la consulta acumula cero descargas y cero "likes", no declara idiomas soportados y no incluye informacion tecnica verificable: no hay arquitectura, numero de parametros, longitud de contexto, tokenizador, ficheros de pesos ni resultados de evaluacion documentados. Se trata, por tanto, de un repositorio sin contenido tecnico publico mas alla de sus metadatos.

El elemento mas relevante de la ficha no es el modelo, sino la propia model card, que no contiene documentacion real. En su lugar incluye una hoja de estilo que oculta todo el contenido legitimo y superpone un dialogo falso de "Authentication Required" con un boton que dirige a un dominio externo (`rce.lc`) presentado como "Sign in with Hugging Face". Se trata de un patron clasico de suplantacion de identidad (phishing) orientado al robo de credenciales, y no de una pagina de inicio de sesion oficial.

En consecuencia, esta ficha no puede evaluar capacidades, rendimiento ni idoneidad del modelo: la informacion disponible apunta a un artefacto malicioso o, como minimo, a un repositorio de credibilidad nula. La recomendacion tecnica es no descargar sus ficheros, no interactuar con los enlaces de su model card y no desplegarlo en ningun entorno, ni de prueba ni de produccion. Todos los campos tecnicos se marcan como "no disponible" porque no existe ninguna fuente fiable que los respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el campo de idiomas aparece vacio en los metadatos) |
| Licencia | MIT (declarada en los metadatos y en el encabezado YAML de la model card) |
| Formato de pesos | no disponible (no se referencia ningun fichero safetensors, GGUF, bin ni similar) |
| Pipeline declarado | text-generation |
| Autor | moosemandada |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion | 2026-09-15 (dato anomalo, posterior a la fecha habitual de consulta) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo. La model card no describe si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura de espacio de estados (SSM) o un modelo hibrido, ni incluye diagrama, configuracion (`config.json`) o referencia a un articulo tecnico. Tampoco se indica el tokenizador, el vocabulario, la estrategia de atencion ni el tipo de posicional encoding.

Respecto al entrenamiento, no consta el volumen de tokens, la composicion del dataset, la existencia de fases de ajuste supervisado, RLHF o DPO, ni ninguna innovacion tecnica (decodificacion especulativa, atencion lineal, cuantizacion nativa, etc.). La unica informacion presente en la model card es una hoja de estilo con reglas CSS que ocultan los elementos de contenido (`h1, h2, h3, p, ul, ol, pre, code, table { display: none; }`) y un `div` superpuesto a pantalla completa que simula un aviso de autenticacion. Es decir, el "contenido" de la model card esta disenado para no ser leido, sino para redirigir al usuario a un dominio de terceros.

## Capacidades

No es posible enumerar capacidades reales del modelo a partir de la informacion disponible. Los unicos datos objetivos son los siguientes:

- El campo `pipeline_tag` declara `text-generation`, pero no existe documentacion, demo ni ejemplo de uso que lo respalde.
- No se declaran capacidades de razonamiento, generacion de codigo, matematicas, vision, audio ni multimodalidad.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte para agentes ni para razonamiento multi-paso.
- No se declaran capacidades multilingues; el campo de idiomas esta vacio.
- No se declara modo de razonamiento explicito (thinking mode) ni ninguna funcionalidad especial.
- No se incluyen ficheros de pesos, por lo que la inferencia no es posible con la informacion publicada.

## Casos de uso

No es posible proponer casos de uso realistas para este repositorio, y la ficha no debe inventarlos. La razon es que faltan los elementos minimos que permiten evaluar la idoneidad de un modelo para cualquier escenario: no hay pesos publicados, no hay parametros declarados, no hay contexto maximo, no hay idiomas soportados, no hay licencia verificable en la practica (aunque se declare MIT) y no hay ninguna evaluacion de calidad. Ademas, el unico contenido funcional de la model card es un mecanismo de redireccion a un dominio externo ajeno a Hugging Face.

Los motivos concretos por los que se descarta cualquier uso son:

- Ausencia total de pesos o referencias de descarga: no hay artefacto que cargar en un motor de inferencia.
- Ausencia de especificaciones (parametros, contexto, tokenizador): imposible estimar requisitos de hardware o latencia.
- Contenido de la model card con patron de phishing: riesgo de seguridad para quien la visite, independientemente del uso previsto.
- Cero descargas y cero interacciones: no existe comunidad, issues ni validacion independiente.
- Licencia MIT declarada pero sin garantia de procedencia: no hay trazabilidad del origen de pesos o datos.
- Fecha de publicacion anomalia: resta credibilidad al repositorio como artefacto mantenido.

Si en el futuro el autor publicase documentacion tecnica verificable, pesos en formato estandar y un informe de evaluacion reproducible, la idoneidad para tareas de generacion de texto podria reevaluarse. Hasta entonces, la recomendacion es no considerarlo para ningun flujo de trabajo, ni experimental ni productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No constan datos de MMLU, HumanEval, GSM8K, MT-Bench, Arena Elo ni de ninguna otra evaluacion estandar, y no existe informe de evaluacion en el repositorio. Tampoco se dispone de mediciones de latencia, throughput (tokens por segundo) ni consumo de memoria, ya que se desconoce el tamano del modelo y no hay pesos publicados.

## Requisitos de hardware

No es posible estimar requisitos de hardware a partir de la informacion disponible, porque el calculo de VRAM depende del numero de parametros, de la precision de los pesos (FP16, INT8, INT4) y de la longitud de contexto, y ninguno de esos datos esta publicado.

- VRAM estimada para inferencia: no disponible (requiere conocer el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamano del modelo.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, Transformers): no aplicables, no hay pesos publicados.
- Latencia y throughput estimados: no disponible.

Ademas, con independencia de las especificaciones, no se recomienda cargar ficheros de este repositorio en ningun entorno de ejecucion: los formatos de serializacion tipo pickle (`.bin`, `.pt`) permiten ejecucion de codigo arbitrario durante la carga, y no hay forma de verificar la integridad del contenido.

## Comparativa con modelos similares

No disponible. No es posible establecer una comparativa porque se desconocen los parametros, la longitud de contexto, el rendimiento y la disponibilidad real de pesos de este repositorio. Tampoco puede asignarse a una categoria funcional (pequeno, mediano, MoE, multimodal) sin datos de arquitectura, por lo que cualquier comparacion con alternativas como modelos densos de 7B-8B, modelos MoE o modelos de razonamiento seria especulativa.

| Criterio | fom-b-dup-apub | Alternativas comparables |
|---|---|---|
| Parametros | no disponible | no aplica (no hay categoria asignable) |
| Longitud de contexto | no disponible | no aplica |
| Rendimiento en benchmarks | no disponible | no aplica |
| Licencia | MIT (declarada, no verificable) | no aplica |
| Disponibilidad de pesos | no disponible | no aplica |

## Limitaciones y advertencias

- Riesgo de phishing confirmado: la model card oculta todo el contenido con CSS y superpone un dialogo falso de "Authentication Required" con un boton "Sign in with Hugging Face" que apunta a `https://rce.lc/css/phish-click`, un dominio externo que no pertenece a Hugging Face. Introducir credenciales en ese enlace implicaria entregarlas a un tercero.
- Dominio de destino sospechoso: el nombre `rce.lc` remite a "remote code execution"; se trata de un indicador adicional de intencion maliciosa y no de un recurso legitimo del proyecto.
- Vector de ataque potencial en los ficheros: si el repositorio llegase a incluir pesos en formatos no seguros (pickle, `.bin`, `.pt`) o scripts de carga personalizados, existiria riesgo de ejecucion de codigo al instanciarlos. No se debe usar `trust_remote_code=True` con este repositorio bajo ninguna circunstancia.
- Ausencia de contenido tecnico: sin arquitectura, parametros, contexto ni ficheros, no es posible auditar el modelo ni reproducir ningun resultado.
- Riesgo de alucinacion: no evaluable, ya que no se puede ejecutar el modelo ni existen informes de evaluacion.
- Sesgos conocidos: no evaluables por la misma razon; no hay model card que documente composicion de datos ni mitigaciones.
- Limitaciones de idioma y contexto: no disponibles, el campo de idiomas esta vacio y no se declara ventana de contexto.
- Restricciones de licencia: se declara MIT, que permitiria uso comercial, pero al no existir trazabilidad del origen del modelo (datos de entrenamiento, pesos base, cumplimiento de licencias de terceros) no puede asumirse que el uso comercial sea juridicamente seguro.
- Anomalias en los metadatos: fecha de creacion y actualizacion fijada en 2026-09-15, con cero descargas y cero interacciones; un patron habitual en repositorios automatizados de baja calidad o creados con fines abusivos.
- Resultados de busqueda web no utilizables: las consultas asociadas a este identificador devolvieron exclusivamente contenido enlazado de caracter ilegal y sin ninguna relacion tecnica con el modelo. Esos enlaces se excluyen deliberadamente de esta ficha por no ser fuentes validas ni apropiadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/moosemandada/fom-b-dup-apub
- Enlace incluido en la model card y marcado como no fiable (indicador de phishing, no seguir): `https://rce.lc/css/phish-click`
- Paper tecnico: no disponible
- Blog o anuncio del autor: no disponible
- Repositorio de codigo: no disponible
- Demo o espacio interactivo: no disponible
- Informe de evaluacion o benchmarks: no disponible
- Resultados de busqueda web relevantes: ninguno (las busquedas no devolvieron material tecnico relacionado con el modelo)
