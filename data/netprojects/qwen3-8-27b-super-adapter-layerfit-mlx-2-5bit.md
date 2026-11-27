# netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit

## Resumen

Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit es una cuantizacion de 2,5 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-super-adapter, un merge de adaptadores de agente de codigo (pi, Hermes y OpenCode) sobre la base Qwen3.8-27B. Lo publica netprojects (Paris Michalas) y esta pensado especificamente para Apple Silicon: ocupa 11,5 GB en disco y esta disenado para Macs de 16 GB de memoria unificada. Es un modelo multimodal image-text-to-text, con torre de vision conservada en bf16 y contexto de 262K tokens.

La innovacion principal es LayerFit, una busqueda por capas que asigna presupuesto de bits de forma no uniforme: mide cuanto sufre cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y coloca los bits donde mas ayudan. Segun el autor, con el mismo tamano que una cuantizacion estandar de 2,5 bits, la concordancia top-1 con bf16 sube del 76,0% al 83,2% y la divergencia KL cae un 52% (de 0,3839 a 0,1847).

Es relevante ahora porque permite ejecutar un modelo de ~27,8 mil millones de parametros con capacidades de agente, codigo y vision en hardware de consumo Apple, manteniendo el formato MLX estandar (compatible con mlx-lm, mlx-vlm y LM Studio) e incluyendo la cabeza de prediccion multi-token (MTP) del modelo a 4 bits para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), con atencion lineal y torre de vision; cuantizacion por capas LayerFit |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 2,5 bits (esta build); el autor publica tambien 2, 3, 4, 6 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), repo de 11,5 GB |

## Arquitectura y entrenamiento

El modelo base es harness-hub/Qwen3.8-27B-super-adapter, un merge de tres adaptadores de agente de codigo (pi, Hermes y OpenCode) sobre Qwen3.8-27B, orientado a servir varios harness de agente con un unico modelo. La arquitectura subyacente es qwen3_5, un transformer con bloques de atencion lineal ademas de atencion estandar, y una torre de vision para entrada de imagen. Esta build conserva la torre de vision en bf16 y mantiene la cabeza de prediccion multi-token (MTP) del modelo cuantizada a 4 bits, lo que habilita decodificacion especulativa.

El proceso de cuantizacion es la aportacion tecnica diferencial. LayerFit mide la sensibilidad de cada componente (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y distribuye un presupuesto de bits fijo de forma no uniforme. La receta de bits se calculo originalmente para la base Qwen3.8-27B y se revalido sobre este modelo; el detalle exacto esta en `layerfit-recipe.json`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Generacion de codigo, con enfasis en flujos de agente de codigo (adaptadores pi, Hermes y OpenCode).
- Razonamiento matematico (el autor reporta GSM8K-50 con thinking off).
- Entrada de imagen: pipeline image-text-to-text con torre de vision en bf16.
- Tool calling / function calling (el autor reporta 3/3 en tool call y coding).
- Modo thinking (el autor reporta 2/2 en pruebas de thinking).
- Prediccion multi-token (MTP) para decodificacion especulativa.
- Capacidades multilingues: no disponible el detalle.

## Casos de uso

- Asistente de codigo en local en un Mac de 16 GB: con 11,5 GB en disco y formato MLX, se puede cargar en mlx-lm o LM Studio y usarse como copiloto de programacion sin conexion, aprovechando los adaptadores de agente incluidos en el merge.
- Agentes de codigo multi-paso: el modelo integra adaptadores para varios harness (pi, Hermes, OpenCode), de modo que un mismo modelo puede servir distintas herramientas de agente sin cambiar de pesos.
- Automatizacion con tool calling: las pruebas del autor indican soporte funcional de llamadas a herramientas, lo que permite orquestar APIs y scripts desde un pipeline local.
- Procesamiento de documentos con imagen: al conservar la torre de vision, puede describir imagenes, extraer informacion de capturas o diagramas y responder preguntas sobre ellos con `mlx_vlm.generate`.
- Razonamiento matematico asistido: util para resolver problemas paso a paso en entornos educativos o de analisis, con modo thinking activable.
- Prototipado rapido en Apple Silicon: sirve para validar ideas de agentes y asistentes en hardware de consumo antes de escalar a infraestructura mayor, gracias a su contexto de 262K tokens para prompts largos.
- Decodificacion acelerada en local: el uso de la cabeza MTP como draft model permite acelerar la generacion en Macs con memoria limitada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Prueba | Resultado |
|---|---|
| GSM8K-50 (thinking off) | 45/50 |
| Tool call y coding | 3/3 (pass) |
| Thinking | 2/2 (pass) |
| Concordancia top-1 con bf16 (LayerFit 2,5 bits) | 83,2% |
| Concordancia top-1 con bf16 (2,5 bits estandar) | 76,0% |
| Divergencia KL (LayerFit 2,5 bits) | 0,1847 |
| Divergencia KL (2,5 bits estandar) | 0,3839 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, etc.) para esta build; el autor remite a la model card del modelo base para los resultados del publicador original.

## Requisitos de hardware

- Memoria: disenado para Macs de 16 GB de memoria unificada (build "stretch"); el autor recomienda que la descarga no supere ~60% de la memoria del sistema.
- VRAM/memoria estimada: 11,5 GB en disco; en ejecucion se necesita ademas espacio para el contexto, por lo que en 16 GB conviene limitar los prompts a unos miles de tokens.
- Ajuste recomendado por el autor: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use mas memoria (persiste hasta reiniciar).
- GPU: exclusivamente Apple Silicon (MLX); no aplica a A100, H100 ni RTX 4090.
- Builds alternativas segun memoria: 2 bits (9,1 GB, solo texto) para 16 GB; 3 bits (13,1 GB) para 24 GB; 4 bits (16,5 GB) para 32 GB; 6 y 8 bits para 48 GB o mas.
- Despliegue: mlx-lm (texto), mlx-vlm (imagen), LM Studio; compatible con el formato MLX estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este modelo (LayerFit MLX 2,5 bits) | ~27,8 B | 262K | 2,5 bits | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-super-adapter (base, bf16) | ~27,8 B | 262K | bf16 | Apache-2.0 | Multiples |
| Build MLX 4 bits del mismo modelo | ~27,8 B | 262K | 4 bits | Apache-2.0 | Apple Silicon (MLX) |
| Build MLX 2 bits (solo texto) | ~27,8 B | 262K | 2 bits | Apache-2.0 | Apple Silicon (MLX) |

No se dispone de datos de rendimiento de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bits degrada la fidelidad respecto a bf16: la concordancia top-1 reportada es del 83,2%, no del 100%.
- En Macs de 16 GB es una build "stretch": hay que cerrar otras aplicaciones y mantener prompts cortos; con prompts largos puede agotarse la memoria.
- La torre de vision se conserva en bf16, pero la validacion de imagen se hizo en la build de 4 bits, no en esta.
- No se detallan los idiomas soportados ni sesgos conocidos del modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fiabilidad.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; LayerFit es marca registrada de NetProjects.
- El modelo esta atado a Apple Silicon (MLX); no es desplegable en GPU NVIDIA sin conversion previa.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Build 2 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit
- Build 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit
- Build 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit
- Build 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
