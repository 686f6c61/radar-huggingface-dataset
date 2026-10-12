# ElementMerc/qwen3-1.7b-abliterated-GGUF

## Resumen

ElementMerc/qwen3-1.7b-abliterated-GGUF es la version cuantizada en formato GGUF de un modelo derivado de la familia Qwen3 con 1.720.574.976 parametros (aproximadamente 1,72 B). El autor, ElementMerc, parte de su propio modelo ElementMerc/qwen3-1.7b-abliterated y publica dos conversiones listas para llama.cpp, Ollama, LM Studio y Jan: una en F16 y otra en Q4_K_M. El repositorio ocupa 4,6 GB e incluye ambas variantes.

La caracteristica definitoria es la "abliteracion": un procedimiento de modificacion de pesos que elimina la direccion de rechazo del modelo, de modo que este no se niega a responder practicamente a ninguna peticion. El propio autor lo advierte de forma explicita en la ficha ("this model does not refuse, which is the entire point of it"). Esto lo situa como una herramienta para investigacion sobre alineacion, red-teaming y generacion sin filtros, no como un modelo de proposito general para produccion convencional.

El modelo esta publicado bajo licencia Apache 2.0 y declara un unico idioma, el ingles. Es importante senalar que la ficha incluye un aviso de correccion del 1 de octubre de 2026 por el que se retiran todas las cifras de evaluacion: estas nunca figuraron en esta ficha, sino en la del repositorio padre, y alli han sido retiradas con sus motivos. Los archivos GGUF no se han retirado y permanecen sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion proporcionada (el modelo base declarado es ElementMerc/qwen3-1.7b-abliterated, derivado de Qwen3) |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 B) |
| Parametros activos | No aplica (no se indica que el modelo sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de uso de llama.cpp emplea `-c 4096`, pero no se confirma cual es el maximo del modelo) |
| Tipos de cuantizacion | GGUF F16 y GGUF Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y compatibles) |

## Arquitectura y entrenamiento

Los detalles de arquitectura, datos de entrenamiento, numero de tokens y proceso de alineacion no se incluyen en la informacion proporcionada. La ficha remite explicitamente a la model card del repositorio padre (ElementMerc/qwen3-1.7b-abliterated) para conocer "que es este modelo, como se hizo y que le hizo la abliteracion", pero ese contenido no forma parte de los datos facilitados. Lo unico confirmado es que el modelo deriva de la familia Qwen3 en su variante de 1,7 B y que ha sido sometido a abliteracion.

Respecto a la parte de conversion, si esta documentada: los archivos GGUF se generaron a partir de los safetensors del modelo padre con `convert_hf_to_gguf.py` y se cuantizaron con `llama-quantize`. El autor indica que cada archivo se cargo y se probo generando texto antes de su publicacion, con el objetivo de descartar conversiones que funcionan al convertir pero fallan al ejecutar.

## Capacidades

- Generacion de texto en ingles.
- Comportamiento sin rechazo: la abliteracion elimina la direccion de rechazo, por lo que el modelo responde a peticiones que un modelo alineado convencional rechazaria. Es la caracteristica central del modelo.
- Inferencia local mediante llama.cpp, Ollama, LM Studio y Jan, gracias al formato GGUF.
- Carga programatica a traves de `huggingface_hub` (`hf_hub_download`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; la unica lengua declarada es el ingles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar de forma controlada como se comporta una red cuya direccion de rechazo ha sido ablacionada, comparando sus respuestas con las del Qwen3-1.7B original. Es util para analizar que capacidades y sesgos quedan intactos tras la intervencion.
- Red-teaming y generacion de casos adversarios: al no negarse a responder, sirve para producir prompts y respuestas limite que despues se usan como conjunto de prueba frente a modelos alineados o filtros de contenido.
- Escritura creativa sin restricciones de tema: narrativa, guiones o ficcion con tematicas que otros modelos suelen declinar. El tamano de 1,7 B lo hace viable en equipos modestos, aunque con calidad de redaccion limitada.
- Experimentacion local en hardware de consumo: la variante Q4_K_M (aproximadamente cuatro veces mas pequena que la F16) se puede ejecutar en portatiles y equipos de sobremesa sin GPU dedicada, lo que facilita prototipado rapido sin coste de API.
- Cuantizacion y evaluacion de calidad: el repositorio ofrece F16 y Q4_K_M del mismo modelo, por lo que es un banco de pruebas para medir la perdida de calidad introducida por la cuantizacion en modelos pequenos, donde el margen de degradacion es mas visible.
- Componente en pipelines de generacion por lotes: integrable en scripts de Python mediante `huggingface_hub` o como servidor con `llama-server`, util para generar volumenes grandes de texto sintetico sin dependencia de servicios externos.
- Educacion y demostraciones de tecnicas de edicion de modelos: sirve como ejemplo reproducible de abliteracion y publicacion de cuantizaciones GGUF, con dos niveles de precision comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha incluye un aviso de correccion (1 de octubre de 2026) por el que se retiran las cifras de evaluacion del modelo: segun el propio texto, esas cifras nunca estuvieron en esta ficha, sino en la del repositorio padre, y alli han sido retiradas junto con sus motivos. Se recomienda leer ese aviso antes de citar cualquier cifra.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible (cifras retiradas) |
| HumanEval | No disponible (cifras retiradas) |
| GSM8K | No disponible (cifras retiradas) |

## Requisitos de hardware

- VRAM estimada para la variante F16: aproximadamente 3,4 GB solo para los pesos (1,72 B x 2 bytes), mas la cache KV correspondiente al contexto configurado.
- VRAM estimada para la variante Q4_K_M: aproximadamente 1,1 GB para los pesos; el autor indica que es "aproximadamente 4 veces mas pequena" que la F16.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, una RTX 4060, una RTX 3050 de 8 GB o incluso GPUs de 6 GB pueden ejecutar la variante Q4_K_M con margen para contexto adicional. La F16 tambien entra en GPUs de 8 GB o superiores.
- Ejecucion en CPU: viable, especialmente con la variante Q4_K_M, que es la recomendada por el autor para casi todos los casos.
- GPU de datacenter (A100, H100): compatibles, pero sobredimensionadas para un modelo de 1,7 B; no aportan ventaja practica frente a una GPU de consumo.
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3-1.7b-Q4_K_M.gguf -c 4096`), Ollama (`ollama run hf.co/ElementMerc/qwen3-1.7b-abliterated-GGUF:Q4_K_M`), LM Studio y Jan. Carga en Python mediante `huggingface_hub`.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. Dependera del hardware, de la cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de terceros ni benchmarks comparativos, por lo que la comparacion se limita a caracteristicas objetivas verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ElementMerc/qwen3-1.7b-abliterated-GGUF | 1,72 B | No disponible | GGUF (F16, Q4_K_M) | Apache 2.0 | Version cuantizada y ablacionada; evaluaciones retiradas |
| ElementMerc/qwen3-1.7b-abliterated (padre) | 1,72 B | No disponible | safetensors | Apache 2.0 | Modelo original ablacionado; su ficha contiene la descripcion y las evaluaciones retiradas |
| Qwen3-1.7B (modelo de origen de la familia) | 1,72 B | No disponible en la informacion proporcionada | safetensors, GGUF | No disponible en la informacion proporcionada | Referencia sin abliteracion; no se aportan datos comparativos |

No se dispone de resultados de benchmarks para establecer una comparacion de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Ausencia de rechazo por diseno: la abliteracion elimina el comportamiento de negativa. El modelo respondera a peticiones que los modelos alineados rechazan, lo que lo hace inadecuado para aplicaciones orientadas al publico sin filtros externos.
- Riesgo de alucinacion: es un modelo de 1,7 B, con capacidad limitada para sostener hechos y razonamientos largos. No se han publicado evaluaciones de fidelidad factual en la informacion disponible.
- Perdida de calidad por cuantizacion: el autor advierte que Q4_K_M sacrifica calidad a cambio de tamano y que los modelos pequenos tienen menos margen para absorber esa perdida. Recomienda verificar los resultados relevantes contra la version F16.
- Idioma: solo ingles. No se declara soporte de castellano ni de otras lenguas en esta ficha, aunque el modelo base Qwen3 pudiera tener capacidades multilingues; no se confirma para esta variante.
- Contexto: la longitud de contexto no se especifica en la informacion proporcionada. Antes de usarlo en tareas de contexto largo hay que consultar la ficha del modelo padre.
- Evaluaciones retiradas: las cifras de rendimiento han sido retiradas de la ficha del modelo padre. Cualquier numero que circule sobre este modelo debe tratarse con cautela hasta que se republiquen evaluaciones validas.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; no obstante, un modelo sin alineacion puede reproducir y amplificar contenido sesgado u ofensivo sin moderacion.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el contenido generado. La licencia no exime de cumplir la normativa aplicable al uso de contenido sin filtros.
- El tag "senbonzakura" aparece en los metadatos sin explicacion en la informacion proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ElementMerc/qwen3-1.7b-abliterated-GGUF
- Modelo padre: https://huggingface.co/ElementMerc/qwen3-1.7b-abliterated
- llama.cpp: https://github.com/ggml-org/llama.cpp
