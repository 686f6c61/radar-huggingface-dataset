# lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-01-adapter

## Resumen

El modelo `lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-01-adapter` es un adaptador de ajuste fino supervisado (SFT) publicado por el usuario lugman-madhiai sobre el modelo base `LiquidAI/LFM2.5-2.6B` de Liquid AI. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (repo de 0,1 GB) que debe cargarse junto al modelo base para poder utilizarse. Su nombre indica que es la primera iteracion de un ajuste orientado a un dominio o corpus denominado "TauKnowledge".

El adaptador se ha entrenado con Unsloth, segun declara la propia model card, lo que implica un flujo de entrenamiento con LoRA/QLoRA y la libreria TRL (la etiqueta `trl` aparece en los tags). La licencia publicada es Apache-2.0 y el unico idioma declarado es el ingles. En el momento de la consulta el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validacion alguna por parte de la comunidad ni resultados publicados.

Su relevancia es, por tanto, limitada y de caracter experimental: resulta interesante como ejemplo de ajuste eficiente de un modelo pequeno de la familia LFM2 de Liquid AI, pero carece de documentacion sobre datos de entrenamiento, hiperparametros, benchmarks o comportamiento esperado. No hay informacion disponible sobre arquitectura interna, longitud de contexto ni proceso de alineacion especificos de este adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (el adaptador hereda la del modelo base `LiquidAI/LFM2.5-2.6B`, familia LFM2; sin confirmar) |
| Parametros totales | Aproximadamente 2,6B en el modelo base (deducido del nombre del repositorio); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; al ser pesos safetensors de tipo adaptador, se pueden fusionar con el base y cuantizar a GGUF, AWQ o GPTQ por cuenta propia, sin recetas publicadas por el autor |
| Idiomas soportados | Ingles (`en`), segun la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador compatible con `transformers` y, segun tags, con `text-generation-inference` y `unsloth`) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base ni la del adaptador. Los tags del repositorio apuntan a la familia LFM2 de Liquid AI (`lfm2`), conocida por emplear arquitecturas hibridas, pero este dato no se confirma en la model card facilitada y no debe darse por verificado. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset "TauKnowledge" ni si se aplicaron fases posteriores de RLHF o DPO.

Lo unico documentado es el procedimiento de ajuste: un SFT realizado con Unsloth sobre el modelo base `LiquidAI/LFM2.5-2.6B`, con las librerias `transformers` y `trl` en el stack, y publicado en formato de adaptador (ficheros safetensors de 0,1 GB). El autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, una afirmacion de rendimiento de entrenamiento que no viene acompanada de mediciones reproducibles en la informacion disponible.

## Capacidades

- Generacion de texto en ingles: capacidad heredada del modelo base, no verificada de forma especifica para el adaptador.
- Seguimiento de instrucciones: es la finalidad declarada del ajuste SFT, aunque no se documentan las tareas concretas cubiertas.
- Razonamiento, matematicas y generacion de codigo: no disponible; no hay evaluaciones ni declaraciones al respecto.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: solo ingles declarado; no se menciona ningun otro idioma.
- Capacidades especiales (modo "thinking", vision, audio, decodificacion especulativa): no documentadas.

## Casos de uso

- Experimentacion en ajuste eficiente: el adaptador sirve como ejemplo reproducible de SFT con LoRA/QLoRA sobre un modelo de 2,6B, util para equipos que quieran replicar el flujo con Unsloth y TRL sobre sus propios datos.
- Asistente de dominio en ingles: si el corpus "TauKnowledge" corresponde a un ambito concreto (tecnico, cientifico o empresarial), el adaptador puede emplearse para responder preguntas de ese dominio, siempre que se valide su calidad con un conjunto de evaluacion propio.
- Generacion de texto a escala en ingles: al ser un modelo pequeno, puede desplegarse con coste bajo para tareas de redaccion, resumen o reformulacion, con revision humana posterior.
- Clasificacion y etiquetado de texto: tareas de categorizacion o anotacion semiautomatica en pipelines de datos, aprovechando el bajo coste de inferencia de un modelo de 2,6B.
- Base para nuevos ajustes: al ser un adaptador Apache-2.0, puede servir como punto de partida o comparacion en investigacion sobre transferencia y ajuste incremental.
- Despliegue en el borde o en local: tras fusionar el adaptador con el base y cuantizarlo, es viable ejecutarlo en portatiles o equipos de gama media para prototipos sin conexion.
- Evaluacion comparativa de adaptadores: util en estudios internos que midan el efecto de un SFT ligero frente al modelo base sin ajustar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, pero requiere cargar el modelo base de ~2,6B parametros para funcionar.
- VRAM estimada de inferencia (modelo base, calculo estandar): ~5,2 GB en FP16, ~2,6 GB en INT8 y ~1,5-1,8 GB en cuantizacion de 4 bits.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, asi como en Apple Silicon con memoria unificada suficiente.
- GPU de datacenter recomendadas para despliegue con concurrencia: A100, H100, L40S; tambien A10G o L4 para cargas moderadas.
- Entrenamiento del adaptador: Unsloth permite ajustar modelos de este tamano en GPU de consumo con 8-16 GB de VRAM en configuraciones QLoRA.
- Opciones de despliegue: `transformers` con PEFT (la via directa para un adaptador), vLLM con soporte de adaptadores LoRA, TGI (segun los tags del repositorio) y, tras fusionar y convertir a GGUF, llama.cpp u Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No hay datos verificados de este adaptador que permitan una comparacion cuantitativa. La tabla siguiente recoge una comparacion basica de categoria; los datos de los modelos alternativos son referencias externas generales no incluidas en la informacion proporcionada y deben confirmarse antes de usarse.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-2.6B-TauKnowledge-SFT-01-adapter | ~2,6B (base); adaptador de 0,1 GB | No disponible | Apache-2.0 | Adaptador SFT sin benchmarks ni validacion comunitaria |
| LiquidAI/LFM2.5-2.6B (base) | ~2,6B | No disponible en esta ficha | No disponible en la informacion proporcionada | Modelo original sobre el que se aplica el ajuste |
| Qwen2.5-3B | 3B | 32K (ampliable) | Apache-2.0 | Referencia externa; familia ampliamente evaluada |
| Llama-3.2-3B | 3B | 128K | Licencia comunitaria de Llama 3.2 | Referencia externa; contexto largo |
| Gemma-2-2B | 2B | 8K | Licencia de Gemma | Referencia externa; orientado a despliegue ligero |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `LiquidAI/LFM2.5-2.6B` los ficheros del repositorio no son utilizables.
- Documentacion practicamente inexistente: no se especifican datos de entrenamiento, hiperparametros, epochs ni criterios de seleccion del checkpoint.
- Ausencia total de evaluacion: sin benchmarks, sin ejemplos de uso y sin validacion (0 descargas y 0 likes), no hay evidencia de que el ajuste mejore al modelo base; puede degradarlo.
- Unico idioma declarado: ingles. Cualquier uso en castellano u otros idiomas no esta soportado ni evaluado.
- Riesgo de alucinacion: inherente a los modelos de ~2,6B; no se ha documentado ningun mecanismo de mitigacion ni de citacion de fuentes.
- Sesgos: no disponibles; al no conocer la composicion del corpus "TauKnowledge" no puede evaluarse el sesgo introducido por el ajuste. Un ajuste de dominio estrecho tiende a reducir la diversidad de respuestas.
- Licencia: Apache-2.0 en el adaptador, permisiva e incluye uso comercial, pero conviene verificar la licencia del modelo base y las condiciones de la libreria Unsloth antes de un despliegue en produccion.
- Idoneidad para produccion: baja con el estado actual de documentacion; requeriria evaluacion propia y posiblemente mas datos y fases de alineacion.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-TauKnowledge-SFT-01-adapter
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Nota: las busquedas web realizadas no han devuelto ningun resultado relevante sobre este modelo (los unicos resultados obtenidos corresponden a foros sin relacion con el proyecto). No se dispone de paper, blog, demo ni repositorio adicional.
