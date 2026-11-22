# onocloud/onoai-onyx-2.5-pro-GGUF

## Resumen

onoai-onyx-2.5-pro-GGUF es una publicacion de pesos en formato GGUF alojada por el usuario onocloud en Hugging Face. Por los nombres de fichero incluidos en el repositorio (`Qwen2.5-VL-7B-Instruct.Q4_K_M.gguf` y `Qwen2.5-VL-7B-Instruct.F16-mmproj.gguf`) y por la etiqueta `qwen2_5_vl`, se trata de una conversion a GGUF de un modelo derivado de Qwen2.5-VL-7B-Instruct, un modelo vision-lenguaje de la familia Qwen2.5. El autor indica que el modelo fue afinado y convertido con Unsloth.

El repositorio tiene 6,0 GB y declara 7.615.616.512 parametros en safetensors, cifra coherente con un modelo de aproximadamente 7,6 mil millones de parametros. La model card no documenta el proceso de afinado, los datos utilizados, los idiomas soportados ni la licencia, por lo que buena parte de las especificaciones habituales quedan como no disponibles.

La relevancia practica del artefacto es que permite ejecutar un modelo multimodal (texto e imagen) de ~7,6B en llama.cpp mediante `llama-mtmd-cli`, con un fichero de proyeccion multimodal separado (`mmproj`) en F16 y el modelo principal cuantizado a Q4_K_M. Es, por tanto, un artefacto orientado a inferencia local en hardware de consumo, no una publicacion de investigacion con benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (etiqueta `qwen2_5_vl`; derivado de Qwen2.5-VL-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (modelo principal) y F16 (proyeccion multimodal, `mmproj`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors declarados para el conteo de parametros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un modelo de lenguaje para procesar imagenes y texto de forma conjunta. El repositorio incluye dos artefactos: el modelo lingual cuantizado en Q4_K_M y un fichero de proyeccion multimodal en F16, que es el esquema habitual de llama.cpp para modelos vision-lenguaje (el `mmproj` se carga por separado y conecta las representaciones visuales con el decoder de texto).

El autor afirma que el modelo fue afinado y convertido a GGUF con Unsloth, y menciona un entrenamiento "2x mas rapido" con dicha herramienta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de afinado, si hubo RLHF o DPO, ni que se modifico respecto al modelo base Qwen2.5-VL-7B-Instruct. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia conversion a GGUF.

## Capacidades

- Generacion de texto conversacional en formato instruct, segun el nombre del fichero base (`Instruct`).
- Procesamiento de imagenes y texto (vision-lenguaje), con soporte de entrada multimodal mediante `llama-mtmd-cli`.
- Ejecucion en llama.cpp y llama-cpp, con soporte de plantillas de chat via `--jinja`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades de tool calling, agentes o razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente multimodal local: el modelo puede recibir una imagen junto a una pregunta de texto y responder de forma conversacional, lo que permite construir asistentes de escritorio o de linea de comandos que funcionen sin conexion usando llama.cpp.
- Descripcion y analisis de imagenes en lotes: integrado en un script con `llama-mtmd-cli`, sirve para generar descripciones o extraer informacion de capturas, diagramas o fotografias de forma automatizada.
- Prototipado rapido de aplicaciones vision-lenguaje: al estar en GGUF y caber en 6,0 GB de repositorio, permite validar ideas de producto en una GPU de consumo antes de invertir en modelos mayores.
- Procesamiento de documentacion escaneada: con entrada de imagen, puede transcribir o resumir contenido visual de documentos en un pipeline local, evitando enviar datos a servicios externos.
- Chat conversacional de proposito general: el fichero Q4_K_M puede usarse como LLM de texto con `llama-cli` para tareas de redaccion, resumen y respuesta a preguntas en entornos con recursos limitados.
- Evaluacion comparativa de cuantizaciones: util para medir la perdida de calidad de Q4_K_M frente al modelo en bf16 en tareas de vision y texto, dado que el repositorio separa el modelo principal del `mmproj`.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, encaja en escenarios donde no se permite el envio de imagenes o texto a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 4-5 GB y el `mmproj` en F16 anade alrededor de 1 GB; se recomienda un margen adicional para el contexto KV, por lo que un presupuesto de 6-8 GB de VRAM es razonable para contextos moderados.
- GPU recomendadas: tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para el modelo cuantizado; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de GPU con 8 GB o mas; en GPU con menos VRAM puede recurrirse a offload parcial a CPU en llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), llama-cpp y Ollama. La model card advierte que Ollama no soporta ficheros `mmproj` separados y propone crear un modelo unificado en bf16 desde el modelo fusionado con un `Modelfile`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| onoai-onyx-2.5-pro-GGUF | 7,6B | no disponible | Si (vision-lenguaje) | no disponible | GGUF |
| Qwen2.5-VL-7B-Instruct (base de referencia) | ~7,6B | no disponible en esta ficha | Si | no disponible en esta ficha | safetensors, GGUF |
| Alternativas de ~7B vision-lenguaje | no disponible | no disponible | Si | no disponible | no disponible |

La comparativa con alternativas concretas no puede completarse con la informacion proporcionada; el unico punto de referencia solido es el modelo base Qwen2.5-VL-7B-Instruct, del que este repositorio parece derivar.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo ni del proceso de afinado.
- Riesgo de alucinacion inherente a los modelos de ~7B, especialmente en tareas de razonamiento complejo y en la interpretacion de imagenes con texto denso.
- No se especifican los idiomas soportados ni el contexto maximo; conviene validar ambos antes de usarlo en produccion.
- La licencia figura como no disponible, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base Qwen2.5-VL-7B-Instruct antes de desplegarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia publica de validacion independiente de la calidad del afinado.
- La cuantizacion Q4_K_M introduce perdida de calidad frente a bf16, especialmente en tareas de vision que requieren precision en detalles.
- Ollama no soporta el esquema de `mmproj` separado, segun la propia model card, lo que limita el despliegue directo en esa herramienta.
- No hay informacion sobre el dataset de afinado, por lo que no puede evaluarse el riesgo de sobreajuste a dominios concretos ni la calidad de las respuestas fuera de ellos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onocloud/onoai-onyx-2.5-pro-GGUF
- Unsloth (herramienta citada por el autor): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia implicito en el formato GGUF): no se proporciona enlace en la informacion disponible
- Paper, blog o demo del modelo: no disponible
