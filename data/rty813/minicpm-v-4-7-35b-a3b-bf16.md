# rty813/MiniCPM-V-4.7-35B-A3B-bf16

## Resumen

MiniCPM-V-4.7-35B-A3B-bf16 es un port en precision completa (bf16) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicado por el usuario rty813. No se trata de un entrenamiento nuevo ni de un fine-tuning: la model card indica explicitamente que la arquitectura es identica al original y que el repositorio es un reemplazo directo ("drop-in") pensado para usuarios de vLLM, TGI, Xinference o transformers que prefieren pesos PyTorch sin cuantizar en lugar de las versiones GGUF de la familia.

El modelo subyacente, MiniCPM-V 4.7, es la ultima iteracion de la serie MiniCPM-V de OpenBMB y su variante 35B-A3B es el primer modelo MoE (Mixture of Experts) de la familia. Mantiene las capacidades de comprension de imagen unica, multiples imagenes y video de las versiones anteriores, y anade tecnicas de eficiencia orientadas a inferencia en dispositivo (Lookahead Expert Scheduling, cuantizacion fina por capas y muestreo especulativo DSpark). La model card cita una velocidad de decodificacion de mas de 13 tokens/s con solo 3 GB de memoria en un iPhone 17 Pro Max.

Su relevancia practica es doble: por un lado ofrece una ruta de despliegue en servidor con pesos bf16 para stacks de inferencia de alto rendimiento; por otro, el modelo base apunta a un nicho poco cubierto, el de modelos MoE multimodales que pueden ejecutarse en dispositivo sin degradar la calidad. Conviene advertir que el repositorio de este port figura con un tamano de 0,0 GB y sin descargas ni valoraciones en el momento de la consulta, por lo que su contenido real debe verificarse antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con Mixture of Experts (MoE); primer MoE de la serie MiniCPM-V |
| Parametros totales | 35B (denominacion 35B-A3B) |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en este repositorio; el autor menciona que existen versiones GGUF de la familia. Otras cuantizaciones: no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `pytorch_model.bin` (bf16); conversion a safetensors indicada como "en progreso" |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer multimodal con capa MoE de 35B parametros totales y 3B activos por token. Es el primer modelo de la serie MiniCPM-V que adopta esta topologia, lo que permite reducir el coste computacional por token frente a un denso de tamano equivalente. La familia cubre comprension de imagen unica, multiples imagenes y video, combinando capacidades de vision-lenguaje con codificacion visual eficiente y orientacion a inferencia en dispositivo.

En el plano de la eficiencia, la documentacion del modelo original menciona tres innovaciones asociadas: Lookahead Expert Scheduling (LES), una tecnica de planificacion de expertos publicada junto al modelo en el repositorio OpenBMB/llama.cpp-omni; cuantizacion fina capa por capa; e integracion de muestreo especulativo DSpark. El objetivo declarado es que un MoE abierto pueda ejecutarse en dispositivo de forma fluida sin perdida apreciable de calidad. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron etapas de RLHF o DPO, ya que el extracto de la model card facilitado esta truncado.

En cuanto a este repositorio concreto, no contiene ningun proceso de entrenamiento: es una conversion de los pesos del modelo original a formato PyTorch bf16. La model card afirma que es compatible con `AutoModelForCausalLM.from_pretrained`, con `vllm serve` y con Xinference (buscando "MiniCPM-V-4.7-35B-A3B").

## Capacidades

- Comprension de imagen unica: descripcion, respuesta a preguntas visuales y extraccion de informacion a partir de una sola imagen.
- Comprension de multiples imagenes: comparacion, razonamiento conjunto y resumen de varias imagenes en una misma conversacion.
- Comprension de video: procesamiento de secuencias de video para tareas de descripcion y pregunta-respuesta.
- Generacion de texto derivada de la entrada multimodal (la pipeline declarada del modelo original es `image-text-to-text`; la de este port figura como `text-generation`).
- Inferencia en dispositivo: soporte declarado para ejecucion local en movil mediante las tecnicas LES, cuantizacion por capas y muestreo especulativo.
- Integracion con stacks de servidor: compatibilidad indicada con vLLM, TGI, Xinference y transformers.
- Tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo "thinking" explicito, audio u otras modalidades: no disponible (solo se documentan texto e imagen/video).

## Casos de

- Despliegue en servidor de alto rendimiento: al estar en bf16 y ser compatible con vLLM, el modelo puede servirse con PagedAttention y batching continuo para cargas concurrentes de vision-lenguaje sin pasar por cuantizacion, lo que evita perdidas de precision en tareas de OCR o analisis de documentos.
- Analisis de documentos escaneados y facturas: la comprension de imagen unica y de multiples imagenes permite extraer campos estructurados de capturas o fotografias, con la ventaja de que un MoE de 3B activos reduce el coste por token frente a un denso de 35B.
- Moderacion y etiquetado de contenido audiovisual: el soporte de video habilita clasificacion y descripcion automatica de clips, integrable en pipelines por lotes mediante TGI o vLLM.
- Asistentes de accesibilidad: descripcion de escenas a partir de imagenes capturadas por camara, con la posibilidad de ejecucion en dispositivo que reduce la dependencia de la nube y la exposicion de datos personales.
- Revision de interfaces y capturas en QA de producto: comparacion de multiples imagenes (por ejemplo, antes y despues de un cambio de UI) para detectar regresiones visuales dentro de un flujo de integracion continua.
- Comercio electronico: generacion de descripciones de producto y atributos a partir de fotografias de catalogo, con procesamiento por lotes apoyado en el modo servidor.
- Investigacion en eficiencia de modelos: el modelo es un caso de estudio util para medir el equilibrio entre calidad y coste en MoE multimodales, especialmente al comparar bf16 frente a las variantes GGUF de la familia.
- Prototipado local en estaciones de trabajo: la ruta GGUF asociada a la familia permite probar el modelo en hardware limitado antes de escalar a un despliegue bf16 en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El extracto de la model card facilitado incluye una seccion de evaluacion, pero su contenido esta truncado y no aporta cifras concretas. El unico dato de rendimiento citado textualmente es una velocidad de decodificacion superior a 13 tokens/s con 3 GB de memoria en un iPhone 17 Pro Max, correspondiente a la configuracion optimizada para dispositivo del modelo original, no a este port bf16.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 70 GB solo para los pesos (35B x 2 bytes), mas el codificador visual, el cache KV y el overhead del runtime. En la practica se recomienda al menos 80 GB de VRAM agregada; esta cifra es una estimacion derivada del numero de parametros y no un dato publicado.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. En GPUs de 24 GB (RTX 4090, RTX 3090) no cabe en bf16 sin reparto entre varias tarjetas u offloading a CPU.
- Hardware de consumo: viable en teoria con las versiones GGUF cuantizadas de la familia, cuyo tamano y requisitos concretos no estan disponibles en la informacion facilitada.
- Dispositivo: la model card reporta ejecucion en iPhone 17 Pro Max con 3 GB de memoria y mas de 13 tokens/s para el modelo original con las optimizaciones LES y DSpark.
- Opciones de despliegue: compatibilidad declarada con transformers (`AutoModelForCausalLM.from_pretrained`), vLLM (`vllm serve rty813/MiniCPM-V-4.7-35B-A3B-bf16`), TGI y Xinference. Para las variantes GGUF se emplea el fork llama.cpp-omni de OpenBMB.
- Latencia y throughput: no disponible para el despliegue en GPU; el unico dato publicado es el de dispositivo movil mencionado arriba.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar este port con el modelo original del que deriva. No se dispone de informacion verificada sobre alternativas MoE multimodales de la misma categoria en el material proporcionado, por lo que las celdas correspondientes se marcan como no disponibles.

| Modelo | Parametros | Activos | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| rty813/MiniCPM-V-4.7-35B-A3B-bf16 | 35B | 3B | `pytorch_model.bin` (bf16) | apache-2.0 | Port de terceros; repositorio con 0,0 GB declarados |
| openbmb/MiniCPM-V-4.7-35B-A3B | 35B | 3B | no disponible | apache-2.0 | Modelo original; pipeline `image-text-to-text` |
| Alternativas MoE multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion disponible |

## Limitaciones y advertencias

- Repositorio vacio o incompleto: la metadata indica un tamano de 0,0 GB y cero descargas. Antes de usar este port hay que verificar que los pesos estan realmente subidos y que la conversion es correcta.
- Port de terceros: el autor no es OpenBMB. Aunque la model card afirma que la arquitectura es identica, no hay verificacion independiente de que los pesos coincidan bit a bit con el original.
- Formato de pesos: `pytorch_model.bin` requiere `torch.load` y no ofrece las garantias de seguridad de safetensors; la conversion a safetensors figura como en progreso. Conviene cargar unicamente pesos de fuentes fiables.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento homogeneo en castellano sin evaluacion previa.
- Longitud de contexto: no disponible, lo que impide planificar tareas de contexto largo sin pruebas propias.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En tareas de OCR y descripcion de documentos conviene validar las salidas contra la fuente.
- Sesgos: no hay informacion publicada sobre sesgos demograficos, culturales o linguisticos del modelo.
- Ausencia de benchmarks: no se pueden comparar sus resultados con alternativas sin ejecutar una evaluacion propia.
- Licencia: apache-2.0, permisiva para uso comercial, pero conviene revisar las condiciones del modelo original y de cualquier componente de terceros incluido en el pipeline.
- Benchmarks de la model card truncados: cualquier cifra de evaluacion que se cite de este modelo deberia contrastarse directamente en la ficha del modelo original.

## Enlaces

- Repositorio de este port: https://huggingface.co/rty813/MiniCPM-V-4.7-35B-A3B-bf16
- Modelo original: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Repositorio GitHub de la familia MiniCPM-V: https://github.com/openbmb/MiniCPM-V
- Fork de llama.cpp con soporte en dispositivo (LES): https://github.com/OpenBMB/llama.cpp-omni
