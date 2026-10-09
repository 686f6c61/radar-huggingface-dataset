# nobodyatalliguess/minimax-h3-loras

## Resumen

Este repositorio no es un modelo de IA en sentido estricto, sino una coleccion de tres adaptadores LoRA de terceros para el modelo de generacion de video MiniMax H3, re-alojados por el usuario nobodyatalliguess para que la plataforma Sogni pueda importarlos desde una URL publica `resolve` sin intermediarios. Los adaptadores originales fueron publicados por los creadores diogod, CoachBate y coldwood en Civitai, y este repositorio se limita a replicar los ficheros (con una modificacion documentada en uno de ellos) manteniendo los creditos y los terminos de licencia de cada autor.

El modelo base, MiniMax H3, es un modelo omni-modal de generacion (texto a video, imagen a video y primer/ultimo fotograma) desarrollado por MiniMax, con soporte nativo de audio estereo y resoluciones de hasta 2K y 15 segundos de duracion. Los LoRA aqui alojados son adaptadores de tematica adulta (18+) orientados a anatomia masculina y a la accion de desvestir, y solo tienen sentido aplicados sobre dicho modelo base.

La relevancia de este repositorio es practica y acotada: sirve como puente de distribucion para un flujo concreto (Sogni Personal LoRA import), documenta los hashes SHA-256 de cada fichero y explicita una modificacion tecnica (pre-escalado x1.5 de los tensores `lora_up`) para sortear el limite de fuerza 1.0 que impone Sogni. No aporta pesos de modelo base, no incluye model card tecnica del mismo y no publica resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre MiniMax H3; arquitectura del modelo base no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los ficheros se distribuyen en safetensors con dtype FP32 segun la model card |
| Idiomas soportados | no disponible |
| Licencia | other; los terminos los fija cada creador en su pagina de Civitai (el repo hermano usa la etiqueta `civitai-creator-license`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Numero de adaptadores | 3 |
| Fecha de creacion | 2026-10-08 |
| Fecha de actualizacion | 2026-10-08 |
| Descargas / likes | 0 / 0 |

Detalle de los ficheros incluidos:

| Fichero | Creador original | Estado | Disparadores (triggers) | Fuerza recomendada |
|---|---|---|---|---|
| `Male_Anatomy-v2.02-ep4_x1.5.safetensors` | diogod (v2.02) | Modificado: pre-escalado x1.5 en `lora_up` | `penis`, `glans`, `testicles`, `asshole`, `ass`, `anus gap` | Sogni 0,6-1,0 (= original 0,9-1,5) |
| `CoachBate_Penis_H3_v1.safetensors` | CoachBate (v1) | Re-host sin modificar | `p3n15` | 0,5-1,0 |
| `MaleUndress_H3_v1.0.safetensors` | coldwood (v1.0) | Re-host sin modificar | `MalUndress` | no publicada por el creador |

## Arquitectura y entrenamiento

Los ficheros son adaptadores LoRA estandar, es decir, matrices de bajo rango que se suman a determinadas capas del modelo base durante la inferencia. No se dispone de informacion sobre el rango, el numero de modulos objetivo ni el dataset de entrenamiento de cada adaptador; la model card no los detalla y remite a las paginas de Civitai de los creadores, que no forman parte de la informacion proporcionada. Los pesos se almacenan en safetensors con dtype FP32 y conservan la metadata original.

La unica innovacion tecnica documentada es la modificacion aplicada al fichero de diogod: se multiplican exclusivamente los tensores `lora_up` (B) por 1,5, dejando intactos `lora_down` y `alpha`, y manteniendo los nombres de clave, el dtype FP32 y la metadata original. El efecto es un escalado lineal exacto de 1,5 sobre la contribucion del adaptador, de modo que la fuerza S aplicada en Sogni equivale a 1,5 x S respecto al original. La model card registra el cambio con una clave de metadata `prescaled` y publica el SHA-256 del fichero original (`e639c295...de276`), que coincide con el de Civitai. El modelo base MiniMax H3 es, segun la informacion de busqueda, un modelo omni-modal de generacion de video con audio nativo, hasta 2K y 15 segundos, pero no se aportan datos sobre su arquitectura interna, su numero de parametros ni su proceso de entrenamiento.

## Capacidades

- Aplicacion de estilos y conceptos concretos sobre MiniMax H3 mediante LoRA, sin reentrenar el modelo base.
- Generacion de video a partir de texto (T2V) con el adaptador activo, heredando las capacidades del modelo base.
- Generacion de video a partir de imagen (I2V) y uso de primer/ultimo fotograma, segun la model card del repositorio.
- Activacion por palabras disparadoras especificas por adaptador (`penis`, `glans`, `testicles`, `p3n15`, `MalUndress`), lo que permite control fino de cuando se aplica el concepto.
- Ajuste de intensidad del adaptador: el fichero pre-escalado permite recorrer el rango equivalente 0,4-1,5 del original desde el maximo 1,0 de Sogni.
- Composicion de varios adaptadores en un mismo flujo, siempre que el framework de inferencia lo permita.
- Verificacion de integridad mediante SHA-256, con hashes publicados para los ficheros re-alojados.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: no es un modelo de lenguaje, sino un conjunto de adaptadores para generacion de video.

## Casos de uso

- Importacion en Sogni: el proposito declarado del repositorio es servir ficheros desde una URL `resolve` publica para que el importador de LoRA personal de Sogni pueda descargarlos, algo que no seria posible desde Civitai por requerir autenticacion o no exponer una URL directa.
- Generacion de video para adultos en T2V: aplicar `Male_Anatomy` sobre MiniMax H3 con la palabra `penis` o `glans` en el prompt para introducir anatomia consistente en la salida, ajustando la fuerza entre 0,6 y 1,0 en Sogni.
- Animacion de imagenes fijas en I2V: usar `MaleUndress_H3_v1.0` con el disparador `MalUndress` para transformar un fotograma de entrada en una secuencia, aprovechando la via imagen a video del modelo base.
- Transiciones con primer y ultimo fotograma: dado que MiniMax H3 soporta condicionamiento por primer y ultimo fotograma, el adaptador de desvestir puede emplearse para construir una transicion controlada entre dos estados definidos por el usuario.
- Integracion en pipelines ComfyUI: el ecosistema Comfy-Org mantiene nodos y LoRA para MiniMax H3, por lo que estos ficheros pueden cargarse en un grafo de nodos junto con el cargador de LoRA y un sampler de video.
- Calibracion de intensidad en produccion: gracias al pre-escalado x1.5, un artista puede reproducir en Sogni el rango completo recomendado por diogod (0,4 a 1,5) mapeando 0,27-1,0, evitando el techo artificial de la plataforma.
- Auditoria y trazabilidad de assets: el repositorio publica SHA-256 y enlaces a las fichas originales, lo que permite a un equipo verificar que el adaptador desplegado coincide con el publicado por el creador y detectar manipulaciones.
- Investigacion sobre escalado de LoRA: el caso del pre-escalado de `lora_up` es un ejemplo reproducible de como modificar un adaptador sin reentrenarlo para adaptarlo a los limites de una plataforma, util como referencia metodologica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP-score, similitud de caras, consistencia temporal) ni comparaciones cuantitativas con otros adaptadores. Tampoco se aportan datos de latencia o throughput del modelo base MiniMax H3 en esta informacion.

## Requisitos de hardware

- El repositorio ocupa 0,1 GB en total, por lo que el almacenamiento de los adaptadores es irrelevante frente al modelo base.
- VRAM para inferencia: no disponible. Depende integramente de MiniMax H3, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible por la misma razon. Cualquier recomendacion (A100, H100, RTX 4090) seria especulativa.
- Compatibilidad con GPU de consumo: no disponible. Un modelo de generacion de video con audio nativo a 2K y 15 segundos suele requerir aceleradores de gama alta o soluciones en la nube, pero no hay dato confirmado en esta informacion.
- Opciones de despliegue documentadas: importacion en Sogni (caso de uso principal del re-host) y, segun el ecosistema de busqueda, ComfyUI mediante nodos de Comfy-Org.
- Latencia y throughput: no disponible.
- Overhead de los LoRA: al ser adaptadores de bajo rango, el coste adicional de memoria y computo es marginal respecto al modelo base, aunque su magnitud exacta no se especifica.

## Comparativa con modelos similares

Dentro de la categoria de repositorios de adaptadores LoRA para MiniMax H3, se pueden citar las siguientes alternativas detectadas en la busqueda, si bien no se dispone de datos de rendimiento que permitan una comparacion cuantitativa:

| Repositorio | Tipo | Contenido | Licencia | Datos tecnicos |
|---|---|---|---|---|
| `nobodyatalliguess/minimax-h3-loras` (este) | Re-host de LoRA | 3 adaptadores (anatomia masculina, desvestir) | other / terminos de cada creador | 0,1 GB, hashes SHA-256 publicados |
| `nobodyatalliguess/fingering-h3-lora` | LoRA | 1 adaptador tematico | civitai-creator-license | no disponible |
| `Comfy-Org/MiniMax-H3` (subcarpeta `loras`) | Distribucion de organizacion | Conjunto de LoRA oficial/comunitario para ComfyUI | no disponible | no disponible |
| `AtlasCloudAI/awesome-minimax-h3` | Lista curada | Indice de pesos, cuantizaciones, LoRA, nodos y workflows | no disponible | entradas verificadas contra API y fechadas |

Modelos base comparables: no disponible. No se han proporcionado alternativas de generacion de video omni-modal con audio nativo frente a las que contrastar MiniMax H3.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio esta etiquetado como `not-for-all-audiences` y todos los adaptadores son de tematica sexual explicita. La model card afirma que todos los sujetos representados son adultos.
- Ausencia de model card tecnica del modelo base: no hay informacion sobre el entrenamiento de MiniMax H3 ni de los LoRA, lo que impide auditar sesgos o procedencia de datos.
- Licencia no unificada: cada adaptador se rige por los terminos que su creador publica en Civitai. Esta informacion no se reproduce en el repositorio, por lo que cualquier uso comercial exige consultar y respetar la ficha original. La etiqueta `license:other` no aclara por si sola los permisos.
- Coldwood exige credito explicito para el uso de su adaptador `MaleUndress_H3_v1.0`.
- Riesgo de generalizacion limitada y artefactos: los LoRA de bajo rango pueden producir anatomias inconsistentes o degradar la coherencia temporal del video, especialmente fuera de los rangos de fuerza recomendados.
- La modificacion x1.5 altera el comportamiento respecto al fichero original: un usuario que replique valores de fuerza de Civitai en Sogni obtendra resultados mas intensos de lo esperado si no aplica la conversion S = original / 1,5.
- Riesgo legal y etico en la generacion de contenido intimo: es responsabilidad del usuario garantizar consentimiento, mayoria de edad y cumplimiento de la normativa aplicable en su jurisdiccion, incluida la relativa a desnudos sinteticos y deepfakes.
- Politicas de plataforma: la disponibilidad en Sogni, ComfyUI u otros entornos depende de sus propias politicas de contenido, que pueden cambiar sin afectar al repositorio.
- Proceso de retirada: la model card indica que los creadores pueden solicitar la eliminacion de un fichero abriendo una discusion en el repositorio, lo que implica que la disponibilidad futura no esta garantizada.
- Sin benchmarks ni validacion independiente: no existen metricas publicadas que respalden la calidad de los adaptadores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/nobodyatalliguess/minimax-h3-loras
- Repositorio hermano (fingering-h3-lora): https://huggingface.co/nobodyatalliguess/fingering-h3-lora
- LoRA original de diogod en Civitai: https://civitai.com/models/2839513
- LoRA original de CoachBate en Civitai: https://civitai.com/models/2835126
- LoRA original de coldwood en Civitai: https://civitai.com/models/2938072
- Repositorio oficial de MiniMax H3 en GitHub: https://github.com/MiniMax-AI/MiniMax-H3
- LoRA para ComfyUI de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/loras
- Lista curada Awesome MiniMax H3: https://github.com/AtlasCloudAI/awesome-minimax-h3
- Blog de lanzamiento de MiniMax H3: https://www.minimax.io/blog/minimax-h3
