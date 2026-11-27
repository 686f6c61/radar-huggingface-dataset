# netprojects/Qwen-Concept-27B-LayerFit-MLX-2bit

## Resumen

Qwen-Concept-27B-LayerFit-MLX-2bit es una cuantizacion de 2 bits del modelo ConceptCountry/qwen-concept-27b, una edicion de pesos de Qwen3.8-27B orientada a reducir el numero de tokens de razonamiento. La publica netprojects (Paris Michalas) bajo licencia Apache-2.0, exclusivamente para Apple Silicon mediante la libreria MLX. El modelo resuelve un problema muy concreto: permitir ejecutar un modelo multimodal de casi 27.000 millones de parametros en Macs de 16 GB de memoria unificada, con un peso en disco de 9,1 GB.

La innovacion principal no es la cuantizacion en si, sino el metodo LayerFit, una busqueda por capas que asigna presupuesto de bits de forma no uniforme: mide cuanto degrada cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) al bajar de precision y concentra los bits donde mas impacto tiene. Segun la model card, esto eleva la coincidencia top-1 con el modelo bf16 del 68,1 % al 76,7 % y reduce el error KL de 0,6796 a 0,3651 (un 46 % menos) respecto a una cuantizacion estandar de 2 bits del mismo tamano.

El pipeline declarado es image-text-to-text: se conserva la torre de vision en bf16, aunque el autor advierte que esta build esta pensada como text-only para Macs de 16 GB. El modelo no incluye la cabeza MTP (multi-token prediction) porque, segun sus pruebas, no aportaba velocidad en esta configuracion. Es relevante ahora porque demuestra que tecnicas de cuantizacion no uniforme permiten llevar modelos de clase 27B a hardware de consumo con perdida acotada y medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5/Qwen3.8) con atencion lineal en algunos bloques, tower de vision y pipeline image-text-to-text |
| Parametros totales | 26.895.998.464 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits con receta LayerFit por capa; tower de vision en bf16; existen builds 2.5, 3, 4, 6 y 8 bits del mismo autor |
| Idiomas soportados | no disponible (la evaluacion del harness incluye ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (compatible con mlx-lm, mlx-vlm y LM Studio) |

## Arquitectura y entrenamiento

La build es una cuantizacion del modelo base ConceptCountry/qwen-concept-27b, que a su vez deriva de Qwen3.8-27B con edicion de pesos para "pensar con menos tokens". La arquitectura subyacente es un transformer con bloques de atencion lineal ademas de atencion estandar, tower de vision y pipeline image-text-to-text. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO.

La innovacion tecnica de esta publicacion es LayerFit: en lugar de aplicar el mismo numero de bits a todas las capas, se mide la degradacion de cada componente (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y se distribuye el presupuesto de bits de forma optimizada. La receta exacta esta en `layerfit-recipe.json` del repositorio. El autor indica que la receta se obtuvo para la base Qwen3.8-27B y se revalido sobre este modelo. Se elimino la cabeza MTP por no aportar ganancia de velocidad en esta build.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo "thinking" (la model card reporta 2/2 en pruebas de thinking).
- Generacion de codigo (3/3 en las pruebas del autor).
- Tool calling / function calling (prueba superada segun la model card).
- Matematicas: GSM8K-50 con thinking desactivado da 45/50.
- Entrada de imagen: conserva la misma tower de vision que la build de 4 bits, verificada alli.
- Capacidades multilingues: el harness de evaluacion incluye pasajes en varios idiomas, aunque no se detalla la lista de idiomas soportados.
- Sin cabeza MTP en esta build.

## Casos de uso

- Asistente local en Mac de 16 GB: el modelo cabe en 9,1 GB de disco y deja margen para macOS y prompts largos, lo que permite tener un asistente conversacional de 27B funcionando en local sin conexion.
- Razonamiento con thinking en portatiles: util para depuracion de problemas, analisis de documentos o planificacion, activando el modo thinking cuando se necesita y desactivandolo para respuestas rapidas.
- Generacion de codigo en el editor: con tool calling funcional, se puede integrar en flujos tipo LM Studio o scripts propios para autocompletar, explicar o refactorizar codigo.
- Procesamiento de imagenes en local: al conservar la tower de vision, permite describir fotos, extraer texto de capturas o responder preguntas sobre imagenes sin enviar datos a la nube.
- Evaluacion de tecnicas de cuantizacion: investigadores pueden comparar la receta LayerFit 2-bit contra cuantizaciones uniformes del mismo tamano usando la metrica de coincidencia top-1 y KL reportada.
- Prototipado de agentes con tool calling en hardware de consumo: permite montar pipelines multi-paso en un Mac antes de escalar a GPUs, validando prompts y herramientas con un modelo de 27B.
- Educacion y experimentacion offline: entornos sin GPU dedicada pueden usar el modelo para demos de razonamiento y multimodalidad con coste cero de infraestructura.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor (harness propio, pesos de lenguaje, contra la build bf16 del modelo base):

| Metrica | 2-bit estandar | LayerFit 2-bit |
|---|---|---|
| Coincidencia top-1 con bf16 | 68,1 % | 76,7 % |
| Error KL | 0,6796 | 0,3651 (46 % menor) |

Pruebas funcionales de esta build:

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Coding | 3/3 |
| Tool call | pass |
| Thinking | 2/2 |
| Entrada de imagen | verificada en la build de 4 bits con la misma tower |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni otros benchmarks estandar del modelo base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,1 GB en disco; el autor indica que la descarga debe ser como maximo el 60 % de la memoria del equipo, por lo que encaja en Macs de 16 GB.
- GPU recomendadas: Apple Silicon (M-series) exclusivamente; la libreria es MLX, no CUDA.
- Cabe en consumer hardware: si, en Macs de 16 GB. Para 24 GB existe la build de 3 bits (13,1 GB); para 32 GB la de 4 bits (16,5 GB); para 48 GB o mas, las de 6 y 8 bits.
- Ajuste adicional: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use mas memoria (se pierde al reiniciar), cerrando otras aplicaciones y limitando prompts a unos pocos miles de tokens.
- Opciones de despliegue: mlx-lm (texto), mlx-vlm (imagen-texto) y LM Studio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen-Concept-27B-LayerFit-MLX-2bit | 26,9B | no disponible | 2 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen-Concept-27B-LayerFit-MLX-4bit | 26,9B | no disponible | 4 bits LayerFit | Apache-2.0 | Apple Silicon (MLX) |
| Qwen-Concept-27B-MLX-6bit | 26,9B | no disponible | 6 bits | Apache-2.0 | Apple Silicon (MLX) |
| ConceptCountry/qwen-concept-27b | 26,9B | no disponible | bf16 | Apache-2.0 | Multiples |

Las builds del mismo autor permiten comparar el compromiso tamano-fidelidad: 9,1 GB (2 bits) frente a 16,5 GB (4 bits) y las versiones de 6 y 8 bits, donde el autor senala que LayerFit aporta poco. No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion de 2 bits introduce degradacion medible: la coincidencia top-1 con bf16 es del 76,7 %, no del 100 %.
- El autor clasifica esta build como text-only para Macs de 16 GB, pese a conservar la tower de vision; el uso multimodal en 16 GB es ajustado.
- No se dispone de informacion sobre sesgos, idiomas soportados ni longitud de contexto.
- Riesgo de alucinacion inherente a modelos de lenguaje, potencialmente amplificado por la baja precision de pesos.
- La cabeza MTP no esta incluida, por lo que no se beneficia de esa posible aceleracion.
- Requiere hardware Apple Silicon y la libreria MLX; no es desplegable en CUDA, vLLM ni llama.cpp.
- Licencia Apache-2.0 permite uso comercial, pero se debe consultar LICENSE y NOTICE del repositorio.
- LayerFit es una marca registrada de NetProjects; el autor no esta afiliado al publicador de ConceptCountry/qwen-concept-27b.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/ConceptCountry/qwen-concept-27b
- Build 2.5 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-2.5bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-3bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-LayerFit-MLX-4bit
- Build 6 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen-Concept-27B-MLX-8bit
- Otros modelos del autor: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
