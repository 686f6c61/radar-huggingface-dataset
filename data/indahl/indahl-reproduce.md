# indahl/indahl-reproduce

## Resumen

`indahl/indahl-reproduce` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-reproduce`. Lo desarrolla Heuremen LLC y su funcion es recomputar los titulares ("headlines") que la empresa publica en indahl.ai utilizando el propio kit de reproduccion publicado por cada "desk" (mesa de analisis), y verificar que el resultado coincide con el sha256 publicado. En la practica, sirve para auditar, verificar o reproducir una cifra concreta que Heuremen LLC hace publica.

El plugin no contiene pesos ni parametros: es una utilidad de linea de comandos que se instala en el entorno de Claude Code mediante `/plugin install indahl-reproduce@heuremen` y se invoca con el comando `/reproduce`. Su interes para desarrolladores e investigadores es acotado pero concreto: demuestra un patron de reproducibilidad verificable por hash en el que los scripts se descargan desde un repositorio publico en un commit fijado y solo se ejecutan si su sha256 coincide con el valor escrito en el comando.

La informacion disponible no incluye datos de arquitectura, tamano, contexto ni benchmarks, porque el artefacto no es un modelo neuronal. Cualquier ficha que lo tratase como tal estaria inventando datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: plugin de Claude Code (utilidad CLI en Python), no es un modelo neuronal |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No aplica: el paquete no incluye pesos ni ficheros ejecutables; los scripts se descargan desde un repositorio Git en un commit fijado |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un plugin que se integra en Claude Code y expone el comando `/reproduce`. Internamente delega en un script Python (`reproduce.py`) que se obtiene mediante sparse checkout del repositorio publico `github.com/Heuremen-LLC/indahl.ai` en un commit concreto (`744bcd22548a29dcdc5a261477faccaeebc6938d`). El script solo se ejecuta si su sha256 coincide con el valor embebido en el comando: `c71e9ef99b6fcc4c72d64d1ea4565250d16b0a2b4720eb4b6188b6d945a554e4`.

La innovacion tecnica destacable es el propio modelo de confianza: la copia publicada en Hugging Face no transporta ficheros ejecutables, de modo que cada ejecucion se valida contra un hash fijado y contra un commit inmutable. Algunos kits descargan sus entradas desde la fuente publica original indicada en el kit y las verifican tambien por sha256. Segun la model card, la version fue revisada antes de su publicacion por Sage, arbitro externo de Heuremen LLC (13 de noviembre de 2026), y todas las correcciones de esa revision se aplicaron antes del lanzamiento.

## Capacidades

- Listado de todos los "desks" que disponen de kit de reproduccion, indicando si sus entradas estan incluidas o se descargan.
- Descarga del kit correspondiente desde el repositorio publico mediante sparse checkout.
- Ejecucion del codigo del propio kit para recomputar el titular publicado.
- Comparacion del resultado con el sha256 publicado y emision de un veredicto de coincidencia o discrepancia.
- Confirmacion explicita del commit exacto antes de ejecutar nada: no se ejecuta codigo sin aprobacion del usuario.
- Tratamiento del texto descargado como datos, no como instrucciones (defensa basica frente a inyeccion de prompts).
- Sin telemetria: segun la model card, no contacta mas servicios que GitHub y las fuentes publicas indicadas por cada kit, no lee datos personales y no almacena nada en servidores.
- No ofrece generacion de texto, razonamiento, codigo, vision ni tool calling propio mas alla de la integracion con Claude Code.

## Casos de uso

- Auditoria de cifras publicadas: un analista ejecuta `/reproduce FLU` para recomputar el titular del desk FLU y comprobar que el sha256 coincide con el publicado en indahl.ai, dejando constancia verificable de la reproducibilidad.
- Verificacion en procesos de diligence debida: un inversor o auditor lista los desks disponibles con `/reproduce list`, identifica cuales incluyen sus entradas y reproduce solo aquellos cuyos datos son accesibles publicamente.
- Revision por pares de contenido editorial cuantitativo: un investigador que cita una cifra de indahl.ai puede reproducirla en su propio entorno antes de referenciarla, reduciendo el riesgo de citar un numero no verificable.
- Integracion en pipelines de validacion periodica: el comando puede ejecutarse de forma programada para detectar desviaciones entre el resultado recomputado y el hash publicado, lo que senala cambios no anunciados en los kits o en las fuentes.
- Formacion y transferencia de conocimiento: el plugin sirve como ejemplo didactico de reproducibilidad basada en hashes y commits fijados, util para equipos que quieran disenar sus propios kits de reproduccion.
- Control de cadena de suministro de scripts: al no incluir ejecutables y validar cada script contra un sha256 y un commit, encaja en entornos con politicas estrictas sobre codigo de terceros, ya que el usuario aprueba explicitamente el commit antes de cualquier ejecucion.
- Diagnostico de discrepancias: cuando el hash no coincide, el flujo permite aislar si el fallo esta en las entradas descargadas, en el commit del kit o en el entorno de ejecucion (Python 3.9 o superior y git).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- VRAM: no aplica; no se ejecuta inferencia neuronal local.
- CPU y memoria: no especificados en la informacion disponible; el requisito declarado es Python 3.9 o superior y git.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: Claude Code con el marketplace de Heuremen (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-reproduce@heuremen`); no se documentan despliegues via vLLM, llama.cpp, Ollama ni TGI porque no procede.
- Latencia y throughput: no disponibles; dependen del tiempo de sparse checkout del repositorio y de la ejecucion del script del kit concreto.

## Comparativa con modelos similares

| Artefacto | Tipo | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| indahl/indahl-reproduce | Plugin de Claude Code | Reproduccion y verificacion por sha256 de titulares de indahl.ai | MIT | Hugging Face y marketplace de Heuremen |
| Kits de reproduccion de indahl.ai (repositorio Heuremen-LLC/indahl.ai) | Scripts y datos | Recomputo de cada titular por separado | No disponible en la informacion proporcionada | GitHub publico |
| Modelos de lenguaje open source | Modelos neuronales | Generacion de texto, codigo, razonamiento | Variables | Hugging Face |

No se dispone de modelos comparables de la misma categoria (plugins de verificacion para Claude Code) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas ni procesa lenguaje natural mas alla de interpretar el argumento del comando `/reproduce`.
- Su utilidad esta ligada exclusivamente a los titulares y kits publicados por Heuremen LLC en indahl.ai; no sirve para verificar cifras de terceros.
- Requiere acceso de red a GitHub y, en los kits que descargan entradas, a las fuentes publicas originales; en entornos sin salida a internet el plugin no funciona.
- Depende de que el commit fijado y el sha256 embebido sigan siendo accesibles y correctos; si el repositorio upstream reescribe historia o retira el commit, la verificacion falla.
- La licencia MIT permite uso comercial, pero las condiciones de privacidad y terminos de Heuremen LLC (indahl.ai/privacy y indahl.ai/terms) siguen aplicando al uso del servicio.
- Riesgo de alucinacion no aplica al plugin en si, pero si al agente que lo invoca: el veredicto debe leerse del resultado del script y del hash, no de una narracion del modelo.
- La model card advierte de que el texto descargado se trata como datos y no como instrucciones; aun asi, la superficie de ataque incluye la cadena de suministro del repositorio upstream y las fuentes publicas de cada kit.
- No se documentan sesgos, cobertura idiomatica ni limitaciones de contexto porque no procede para este tipo de artefacto.
- El proyecto tiene cero descargas y cero likes en el momento de la consulta, y la fecha de creacion registrada (2026-11-15) es posterior a la de la revision citada; conviene contrastar la vigencia de los enlaces antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-reproduce
- Repositorio fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/plugins/reproduce
- Mirror del repositorio: https://github.com/Heuremen-LLC/indahl-reproduce (commit 33c55cf)
- Script referenciado en la model card: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/744bcd22548a29dcdc5a261477faccaeebc6938d/claude-plugins/plugins/reproduce/scripts/reproduce.py
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
