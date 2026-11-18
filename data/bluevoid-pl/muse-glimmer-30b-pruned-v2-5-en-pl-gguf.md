# bluevoid-pl/Muse-Glimmer-30B-pruned-V2.5-en-pl-GGUF

## Resumen

Muse Glimmer 30B es un modelo de lenguaje causal de aproximadamente 27.000 millones de parametros (27.004.796.416 segun los pesos en safetensors), desarrollado por Meta Superintelligence Lab y publicado en agosto de 2026 bajo licencia Apache 2.0. Esta disenado especificamente para tareas agenticas autonomas que se ejecutan en hardware de consumo, sin necesidad de infraestructura en la nube ni acceso a red. Integra razonamiento multi-paso, uso fiable de herramientas, comprension multimodal mediante un encoder de percepcion dedicado y recuperacion ante fallos en un unico modelo destilado a partir de Muse Spark.

La ficha que nos ocupa, sin embargo, no es el modelo original: es una publicacion de terceros del usuario bluevoid-pl que distribuye una version podada (pruned) del modelo en formato GGUF, limitada a caracteres de ingles y polaco. El podado reduce el tamano del modelo en aproximadamente un 25 %, lo que facilita su ejecucion en VRAM limitada, a costa de eliminar cobertura de otros idiomas y de introducir riesgos de estabilidad reconocidos por el propio autor. La version V2.5 restaura las capacidades de vision respecto a versiones anteriores y requiere un fichero `mmproj` separado para el encoder visual.

Es relevante ahora porque demuestra el interes por ejecutar agentes multimodales de 30B en local, pero tambien porque es un ejemplo de publicacion derivada con garantias explicitamente nulas: el autor advierte que el GGUF puede "romperse o morir sin razon" y que no ofrece garantia alguna de funcionamiento. Para produccion conviene evaluar el modelo base original frente a esta variante podada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de percepcion dedicado (detalles internos no disponibles) |
| Parametros totales | 27.004.796.416 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles; el autor recomienda Q8_0 para el `mmproj`) |
| Idiomas soportados | en, pl (version podada); el modelo original entrena con mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (modelo base) y GGUF (esta publicacion) |

## Arquitectura y entrenamiento

El modelo original es un transformer causal de 30B parametros con un encoder de percepcion dedicado que acepta texto e imagenes intercalados, lo que permite interpretar capturas de pantalla, graficos y documentos junto a la conversacion. Segun la model card, fue destilado de Muse Spark y entrenado para tareas agenticas: razonamiento multi-paso, uso de herramientas con esquemas precisos, recuperacion ante fallos de llamadas a herramientas y compatibilidad con scaffolds como OpenClaw y Hermes Agent. El modelo soporta un modo de "esfuerzo controlable" que ajusta la intensidad de razonamiento segun el equilibrio deseado entre calidad y velocidad. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de RLHF/DPO.

Esta publicacion concreta aplica un podado del vocabulario/tokenizer limitandolo a caracteres de ingles y polaco, lo que reduce el tamano del modelo en torno a un 25 %. El podado altera el tokenizer, de modo que llama.cpp detecta el cambio y puede tardar hasta cinco minutos en el primer arranque; el aviso `W load: special_eot_id is not in special_eog_ids - the tokenizer config may be incorrect` es esperado. El soporte de emojis es parcial. La vision se recupera respecto a versiones previas y exige descargar el fichero `mmproj-Muse-Glimmer-30B_pruned-pl-V2.5-Q8_0.gguf`, con cuantizacion Q8_0 independientemente del nivel de cuantizacion del texto, porque la cuantizacion de modelos de vision suele acumular error.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Capacidades agenticas de extremo a extremo, evaluadas en tareas como DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench.
- Entrada multimodal: acepta texto e imagenes intercalados mediante el encoder de percepcion (requiere el fichero `mmproj`).
- Compatibilidad con scaffolds de orquestacion agentica como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable para ajustar calidad frente a velocidad.
- Multilingue en el modelo original (mas de 100 idiomas); esta version podada queda restringida a ingles y polaco.
- El razonamiento interno se realiza en ingles, por lo que el uso de polaco en el prompt no es ideal segun el autor.

## Casos de uso

- Agentes de automatizacion en local: el modelo puede ejecutar tareas de varios pasos con llamadas a herramientas dentro de scaffolds como OpenClaw o Hermes Agent, sin depender de la nube, gracias a su entrenamiento especifico en flujos agenticos.
- Depuracion y escritura de codigo en pipelines: su evaluacion en SWE-Bench y su capacidad de recuperacion ante fallos lo hacen adecuado para agentes que escriben, ejecutan y corrigen codigo de forma iterativa.
- Analisis de documentos y capturas de pantalla: con el encoder de percepcion y el fichero `mmproj` Q8_0, puede interpretar graficos, documentos e interfaces junto a la conversacion para tareas de extraccion o resumen.
- Asistentes conversacionales en ingles o polaco: el podado conserva los caracteres de ambos idiomas, por lo que es util para atencion al cliente o asistentes internos en esos dos idiomas exclusivamente.
- Investigacion agentica con busqueda profunda: su rendimiento en DeepSearch QA lo orienta a flujos de busqueda y sintesis de informacion multi-paso.
- Despliegue en estaciones de trabajo con VRAM limitada: el podado del ~25 % permite ejecutar un modelo de 27B en equipos donde la version completa no cabria, usando llama.cpp.
- Prototipado de agentes multimodales sin conectividad: al ejecutarse localmente sin red, encaja en entornos aislados o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card original menciona que el modelo se evalua en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no incluye cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta. Con ~27B parametros, las cuantizaciones GGUF de 4 bits rondarian los 14-16 GB y las de 8 bits los 27-30 GB, pero el autor no publica cifras concretas y el podado reduce el tamano en torno a un 25 %.
- El objetivo declarado del podado es permitir ejecutar el modelo en VRAM limitada.
- GPU recomendadas: no disponibles. Por tamano, cabria esperar viabilidad en GPUs de consumo de gama alta con cuantizacion baja, pero no se confirma en la informacion.
- Opciones de despliegue: llama.cpp, con la restriccion de usar una version superior a `b10430` (el modelo falla al cargar en versiones anteriores). El repo tambien incluye safetensors para transformers.
- Para vision es obligatorio descargar el fichero `mmproj-Muse-Glimmer-30B_pruned-pl-V2.5-Q8_0.gguf`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Muse-Glimmer-30B-pruned-V2.5-en-pl-GGUF (esta publicacion) | ~27B | no disponible | en, pl | apache-2.0 | GGUF, safetensors | Podado ~25 %, garantias nulas, requiere llama.cpp > b10430 |
| Muse-Glimmer-30B (modelo base, meta-models) | ~30B | no disponible | mas de 100 | apache-2.0 | no disponible | Modelo original sin podar, cobertura multilingue completa |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion |

## Limitaciones y advertencias

- El autor advierte explicitamente de que el GGUF podado "puede romperse o morir sin razon" y de que no ofrece garantia alguna de que funcione.
- El podado limita el vocabulario a caracteres de ingles y polaco: cualquier otro idioma o conjunto de caracteres puede fallar o degradarse.
- El tokenizer modificado provoca que llama.cpp tarde hasta cinco minutos en el primer arranque y emita un aviso esperado sobre `special_eot_id`.
- Requiere llama.cpp superior a `b10430`; en versiones anteriores el modelo no carga.
- Soporte de emojis solo parcial.
- El razonamiento interno se realiza en ingles, por lo que los prompts en polaco no son ideales.
- La cuantizacion de la parte de vision acumula error; hay que usar Q8_0 para el `mmproj` aunque el texto este mas cuantizado.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion disponible, pero son inherentes a los modelos de lenguaje; conviene evaluarlos en el caso de uso concreto.
- Longitud de contexto no documentada: no se puede planificar el uso con contextos largos sin verificacion previa.
- Aunque la licencia es Apache 2.0, al ser una publicacion derivada de terceros conviene revisar los terminos del modelo base antes de un uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bluevoid-pl/Muse-Glimmer-30B-pruned-V2.5-en-pl-GGUF
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- llama.cpp (requerido, version > b10430): no disponible en la informacion proporcionada
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
