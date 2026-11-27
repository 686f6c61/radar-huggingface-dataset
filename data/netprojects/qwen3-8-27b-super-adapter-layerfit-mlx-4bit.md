# netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit

## Resumen

Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-super-adapter, un merge de los adaptadores de agente de codigo pi, Hermes y OpenCode sobre la base Qwen3.8-27B. Lo publica NetProjects (Paris Michalas) para ejecucion local en Apple Silicon, con un peso en disco de 16,5 GB pensado para Macs de 32 GB de memoria unificada. El modelo mantiene la torre de vision en bf16 y una ventana de contexto de 262K tokens, y conserva la cabeza de prediccion multi-token (MTP) del modelo original cuantizada a 8 bits.

La innovacion principal es LayerFit, una busqueda por capas que asigna presupuesto de bits de forma no uniforme: mide la degradacion de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y concentra los bits donde mas impactan. Segun la model card, con el mismo tamano que un 4-bit estandar mejora la concordancia top-1 con bf16 del 92,5% al 93,9% y reduce el error KL de 0,0373 a 0,0227 (un 39% menos).

Es relevante porque permite ejecutar un modelo de ~28.200 millones de parametros con capacidades de agente, codigo y vision en hardware de consumo Apple, usando las herramientas estandar del ecosistema MLX (mlx-lm, mlx-vlm y LM Studio). El modelo base combina varios adaptadores de agente en un unico modelo, lo que simplifica el despliegue de flujos agenticos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y atencion completa (familia Qwen3.5), torre de vision y cabeza MTP |
| Parametros totales | 28.206.101.232 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 4 bits (LayerFit, receta por capas); torre de vision en bf16; cabeza MTP en 8 bits. Variantes 2, 2.5, 3, 6 y 8 bits del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); tamano del repo 16,5 GB |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, de la familia qwen3_5, con una arquitectura que combina bloques de atencion completa y de atencion lineal, segun se deduce de la descripcion de la receta LayerFit (que menciona "every layer's MLP, attention and linear-attention blocks"). Incluye una torre de vision (pipeline image-text-to-text) y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa usando el propio modelo como draft model.

Sobre esa base, harness-hub fusiono los adaptadores de tres arneses de agente de codigo (pi, Hermes y OpenCode) en un unico modelo. NetProjects aplico despues la cuantizacion LayerFit: una busqueda por capas que mide la sensibilidad de cada bloque a baja precision y distribuye el presupuesto de bits de forma optima. La receta de bits es la hallada para la base Qwen3.8-27B y revalidada sobre este modelo; el detalle exacto esta en `layerfit-recipe.json`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo y asistencia a tareas de programacion (etiquetas coding y agent).
- Entrada de imagen (image-text-to-text): descripcion y comprension de imagenes con la torre de vision en bf16.
- Soporte de tool calling / function calling, orientado a arneses de agente.
- Capacidad de agente y razonamiento multi-paso (merge de adaptadores pi, Hermes y OpenCode).
- Modo de pensamiento (thinking) activable, validado en la model card (2/2 pass).
- Prediccion multi-token (MTP) para decodificacion especulativa con el propio modelo como draft.
- Contexto largo de hasta 262K tokens.
- Capacidades multilingues: no disponible el detalle de idiomas.

## Casos de uso

- Asistencia de codigo en local en un Mac: el modelo puede generar y revisar codigo en el editor o terminal sin enviar datos a la nube, aprovechando su soporte de tool calling y su contexto de 262K tokens para proyectos completos.
- Agente de codigo autonomo: integrado en arneses tipo Hermes u OpenCode, puede planificar varios pasos, invocar herramientas y ejecutar tareas de refactorizacion o correccion de errores en un repositorio.
- Analisis de imagenes y documentos escaneados: con la torre de vision puede describir capturas, diagramas o fotos y combinar esa informacion con texto en una misma conversacion.
- Atencion al cliente con contexto largo: la ventana de 262K tokens permite mantener historiales extensos y documentos de referencia en una sola sesion, adecuado para asistentes conversacionales.
- Procesamiento de codigo y matematicas con razonamiento: el modo thinking y los 44/50 en GSM8K-50 (thinking off) lo hacen util para resolver problemas paso a paso en entornos educativos o de analisis.
- Prototipado de agentes en investigacion: al ejecutarse con mlx-lm y mlx-vlm en hardware de consumo, sirve para iterar rapidamente sobre disenos de agentes y evaluar tool calling sin infraestructura GPU dedicada.
- Generacion acelerada con MTP: la cabeza de prediccion multi-token permite reducir latencia en tareas de generacion larga usando el propio modelo como draft model.

## Benchmarks y rendimiento

Resultados publicados en la model card del build LayerFit 4-bit:

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 44/50 |
| Tool call y coding | 3/3 pass |
| Thinking | 2/2 pass |
| Entrada de imagen | pass |

Comparativa de cuantizacion (mismo tamano, mismos pesos de lenguaje, frente al merge bf16):

| Metodo | Concordancia top-1 con bf16 | Error KL |
|---|---|---|
| 4-bit estandar | 92,5% | 0,0373 |
| LayerFit 4-bit | 93,9% | 0,0227 (39% menor) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval u otros benchmarks estandar del modelo base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 16,5 GB en disco; recomendado un Mac con 32 GB de memoria unificada para dejar margen a macOS y prompts largos.
- GPU recomendadas: Apple Silicon (serie M) con 32 GB o mas. No esta pensado para GPU NVIDIA; el formato es MLX.
- Cabe en GPU de consumo: si, en Macs de 32 GB. Existen variantes menores para 16 GB (2-bit, 9,1 GB, solo texto), 16 GB stretch (2,5-bit, 11,5 GB) y 24 GB (3-bit, 13,1 GB).
- Opciones de despliegue: mlx-vlm (imagen y texto), mlx-lm (texto) y LM Studio, todos con formato MLX estandar.
- Ajuste de memoria: para configuraciones stretch se sugiere `sudo sysctl iogpu.wired_limit_mb=12800` (hasta reiniciar).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit | 28,2B | 262K | MLX 4-bit | Apache-2.0 | Vision, MTP, agente |
| Qwen3.8-27B-super-adapter-MLX-6bit (mismo autor) | 28,2B | 262K | MLX 6-bit | Apache-2.0 | Mayor fidelidad, requiere 48 GB o mas |
| harness-hub/Qwen3.8-27B-super-adapter (base) | 28,2B | 262K | bf16 | Apache-2.0 | Modelo de referencia sin cuantizar |

No se dispone de datos de rendimiento de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion respecto a bf16: la concordancia top-1 medida es del 93,9%, no del 100%.
- El modelo base es un merge de adaptadores de agente; puede heredar sesgos y comportamientos especificos de esos adaptadores, no documentados en la informacion disponible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad factual.
- Idiomas soportados no documentados: el rendimiento fuera del ingles puede variar y no esta verificado.
- Requiere hardware Apple Silicon; no es desplegable directamente en GPU NVIDIA con este formato.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el archivo NOTICE; LayerFit es marca registrada de NetProjects.
- No afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Variante 2-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit
- Variante 2,5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit
- Variante 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit
- Variante 6-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Variante 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
