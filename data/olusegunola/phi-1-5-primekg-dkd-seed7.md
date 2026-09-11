# olusegunola/phi-1.5-primekg-dkd-seed7

## Resumen

Este repositorio publica un checkpoint identificado como `phi-1.5-primekg-dkd-seed7`, subido por el usuario olusegunola a HuggingFace. La model card asociada es la plantilla automática de transformers sin ningún campo cumplimentado: no declara autoría efectiva, datos de entrenamiento, licencia, idiomas ni procedimiento de ajuste. La práctica totalidad de la informacion tecnica de esta ficha es, por tanto, "no disponible", y todo lo que se apunta a continuacion se deriva del identificador del modelo y de los metadatos del repositorio, nunca de documentacion del autor.

El nombre sugiere un ajuste del modelo phi-1.5 de Microsoft (transformer decoder-only de ~1,3 B de parametros) sobre el grafo de conocimiento biomedico PrimeKG, con alguna tecnica de destilacion de conocimiento (DKD) y semilla 7. Ninguna de estas suposiciones esta confirmada en la informacion disponible. El repositorio tiene 0 descargas y 0 "likes", y su tamano (~0,1 GB) es incompatible con un checkpoint completo de 1,3 B de parametros en fp16 (que rondaria los 2,7 GB), lo que apunta a un adaptador, a pesos parciales o a un empaquetado incompleto.

Es relevante unicamente como posible experimento academico de adaptacion de un modelo pequeno a dominio biomedico. No debe desplegarse en produccion sin verificar antes su arquitectura real, su licencia y su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la documenta; el identificador apunta a una base phi-1.5, transformer decoder-only) |
| Parametros totales | no disponible (un phi-1.5 completo declara ~1,3 B; el tamano del repo no cuadra con ese recuento) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (phi-1.5 declara 2048 tokens en su informe tecnico) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible (el campo de idiomas de la ficha esta vacio) |
| Licencia | no disponible (campo ausente; no se puede asumir uso comercial) |
| Formato de pesos | safetensors (tag del repositorio), libreria transformers |
| Tamano del repositorio | ~0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion verificable. La model card es la plantilla por defecto de HuggingFace: todas las secciones de descripcion, datos de entrenamiento, hiperparametros, infraestructura de computo y evaluacion contienen el marcador "[More Information Needed]". El unico enlace tecnico presente en los tags es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono citado en la propia plantilla, no a un trabajo sobre este modelo.

Si se acepta la hipotesis que sugiere el identificador, la base seria phi-1.5: un transformer decoder-only denso de aproximadamente 1,3 B de parametros, con contexto de 2048 tokens, entrenado por Microsoft Research sobre un corpus filtrado con enfasis en datos sinteticos de tipo "libro de texto". Sobre esa base, el sufijo "primekg" indicaria un ajuste orientado al grafo de conocimiento PrimeKG (grafo de medicina de precision publicado en Scientific Data en 2023) y "dkd" a alguna variante de destilacion de conocimiento, con la semilla 7 como semilla de reproducibilidad. El acronimo "dkd" no aparece definido en ninguna parte de la informacion disponible, por lo que no se puede confirmar su significado ni el regimen de entrenamiento (LoRA, QLoRA, ajuste completo, RLHF o DPO). Tampoco se documenta el numero de tokens, la composicion del dataset ni ninguna innovacion tecnica.

## Capacidades

- No hay ninguna capacidad confirmada por el autor en la informacion disponible.
- Generacion de texto: esperable si el checkpoint carga correctamente sobre una base phi-1.5, pero no verificado.
- Razonamiento y matematicas basicas: phi-1.5 declara capacidades limitadas en tareas de razonamiento de sentido comun y matematicas mas alla de ejemplos sencillos; se desconoce como afecta el supuesto ajuste a dominio.
- Codigo: phi-1.5 se entreno con datos de codigo; se desconoce si este checkpoint conserva esa capacidad.
- Tool calling / function calling: no disponible; no se documenta ninguna plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el campo de idiomas esta vacio y no se puede asumir cobertura del castellano.
- Capacidades especiales (modo thinking, vision, audio): no disponible; no hay indicios de multimodalidad.
- Dominio biomedico: plausible por el identificador (PrimeKG), sin ninguna evaluacion publicada que lo respalde.

## Casos de uso

Todos los casos son hipoteticos y condicionados a que el checkpoint cargue correctamente y su licencia permita el uso previsto.

- Extraccion de relaciones biomedicas: si el ajuste se ha hecho sobre PrimeKG, el modelo podria emplearse para etiquetar pares entidad-relacion en abstracts de PubMed; requeriria validacion manual y una capa de post-procesado, dado el riesgo de alucinacion en un modelo de 1,3 B.
- Generacion de consultas sobre grafos de conocimiento: traduccion de preguntas en lenguaje natural a Cypher o SPARQL contra PrimeKG u otro grafo; util en herramientas internas de exploracion de literatura, siempre con ejecucion supervisada.
- Prefiltrado en pipelines de descubrimiento de farmacos: cribado rapido de candidatos textuales (interacciones farmaco-diana, efectos adversos descritos) antes de pasar a modelos mayores; su tamano permitiria ejecutarlo en CPU o en una GPU de gama media.
- Resumen de literatura cientifica: condensar abstracts o secciones de revisiones sistematicas; el contexto corto esperado (2048 tokens en la base phi-1.5) obligaria a trocear documentos largos.
- Prototipado academico de bajo coste: experimentos de ajuste y evaluacion de tecnicas de destilacion de conocimiento en un entorno con recursos limitados, con la semilla 7 como referencia de reproducibilidad.
- Anotacion asistida de corpus clinicos: preetiquetado de entidades (enfermedades, genes, farmacos) para que anotadores humanos revisen despues; nunca como fuente de decision clinica.
- Docencia sobre modelos de lenguaje pequenos: comparacion empirica entre un modelo generalista y su version adaptada a dominio, midiendo perdida de capacidades generales tras el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MedQA ni ninguna otra) y el autor no aporta datos de validacion, curvas de perdida ni comparaciones. Los resultados publicos de phi-1.5 corresponden a su informe tecnico de Microsoft y no son extrapolables a este checkpoint, ya que se desconoce por completo el ajuste aplicado.

## Requisitos de hardware

Las cifras siguientes son estimaciones condicionadas a que el modelo sea un ajuste de phi-1.5 (1,3 B de parametros) y no un modelo independiente. Al no conocerse el formato real del checkpoint, deben tomarse como orientativas.

- VRAM en fp16: en torno a 2,6-3 GB de pesos mas overhead de activaciones y cache KV; aproximadamente 4-6 GB en total para contextos cortos.
- VRAM en int8: en torno a 1,4 GB de pesos.
- VRAM en 4 bits: en torno a 0,8-1 GB de pesos (requiere convertir el checkpoint, ya que no se publican GGUF).
- GPU recomendadas: cabe holgadamente en cualquier GPU de consumo con 8 GB o mas, como RTX 3060, RTX 4060, RTX 3070 o superiores; tambien en RTX 4090 y en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Ejecucion en CPU: viable con llama.cpp u ONNX Runtime si se generan los pesos en formato GGUF, que no estan disponibles en el repositorio.
- Opciones de despliegue: transformers y PEFT si el repositorio contiene un adaptador; vLLM o TGI requeririan un checkpoint completo con configuracion valida. No hay soporte Ollama ni llama.cpp por ausencia de GGUF.
- Latencia y throughput: no disponible; no se publican mediciones.
- Advertencia: el tamano del repositorio (~0,1 GB) es coherente con un adaptador LoRA, no con un modelo completo. Antes de planificar despliegue hay que inspeccionar `config.json` y el indice de pesos para confirmar que es lo que contiene.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentacion publica; los de este repositorio, de sus metadatos. No hay datos de rendimiento comparables para este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| olusegunola/phi-1.5-primekg-dkd-seed7 | no disponible (~1,3 B si la base es phi-1.5) | no disponible | no disponible | 0 descargas, pesos safetensors |
| Microsoft phi-1.5 | ~1,3 B | 2048 tokens | MIT (segun su publicacion) | amplia, muy extendida |
| Microsoft Phi-2 | ~2,7 B | 2048 tokens | MIT (segun su publicacion) | amplia, muy extendida |
| TinyLlama-1.1B | ~1,1 B | 2048 tokens | Apache-2.0 | amplia |
| Qwen2.5-1.5B | ~1,5 B | 32 768 tokens nativos | Apache-2.0 | amplia |

Frente a estas alternativas, el checkpoint aqui descrito no aporta ninguna ventaja verificable: no tiene evaluacion publica, no tiene licencia declarada y su formato real es incierto. Su unico rasgo diferencial seria la especializacion biomedica, no demostrada.

## Limitaciones y advertencias

- Model card vacia: no se puede verificar autoria, procedencia de datos, regimen de entrenamiento ni intencion de uso.
- Licencia no declarada: el uso comercial es juridicamente inseguro; ademas, si el ajuste deriva de phi-1.5 conviene revisar las condiciones de la licencia de la base, que el autor no cita.
- Riesgo elevado de alucinacion: los modelos de ~1,3 B de parametros generan con frecuencia contenido factuamente incorrecto, algo especialmente grave en dominio biomedico o clinico.
- Ausencia total de validacion: 0 descargas y 0 "likes" implican que nadie ha reproducido ni auditado el resultado.
- Sin informacion sobre sesgos: no hay analisis de sesgos demograficos, linguisticos ni clinicos.
- Cobertura de idiomas desconocida: no se puede asumir un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles.
- Contexto presumiblemente corto: si hereda los 2048 tokens de phi-1.5, no sirve para documentos largos sin troceado y puede perder coherencia en conversaciones multi-turno extensas.
- Formato incierto: el tamano del repositorio sugiere un adaptador o pesos incompletos; un despliegue directo con `from_pretrained` puede fallar.
- Sin soporte de tool calling ni plantilla de chat documentada: integrarlo en un agente requeriria definir el formato de prompt y validarlo experimentalmente.
- No apto para uso clinico: cualquier salida debe tratarse como texto no verificado, nunca como recomendacion medica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olusegunola/phi-1.5-primekg-dkd-seed7
- Articulo citado en los tags del repositorio (Lacoste et al., 2019, estimacion de emisiones): https://arxiv.org/abs/1910.09700
- Referencia externa no citada por el autor, correspondiente a la base que sugiere el identificador (informe tecnico de phi-1.5): https://arxiv.org/abs/2309.05463

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los unicos enlaces recuperados pertenecen a un medio de prensa neerlandes (bd.nl) y no guardan relacion con el repositorio.
