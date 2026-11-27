# netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit

## Resumen

Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit es una cuantizacion de 2 bits en formato MLX del modelo harness-hub/Qwen3.8-27B-super-adapter, un merge de los adaptadores de agente de codigo pi, Hermes y OpenCode sobre la base Qwen3.8-27B. Lo publica netprojects (Paris Michalas) y esta pensado especificamente para Macs con Apple Silicon de 16 GB de memoria unificada, donde ocupa 9,1 GB en disco. La tecnica propietaria LayerFit asigna un numero de bits distinto a cada capa (MLP, atencion, atencion lineal, embeddings y cabeza de salida) en lugar de aplicar la misma cuantizacion a todas, con el objetivo de reducir la perdida de calidad a igual presupuesto de tamano.

El modelo resuelve un problema muy concreto: ejecutar localmente un modelo de ~27.000 millones de parametros orientado a tareas de agente y programacion en hardware de consumo Apple, sin GPU dedicada. Frente a una cuantizacion estandar de 2 bits, el autor reporta una mejora de la concordancia Top-1 con el modelo bf16 del 68,1 % al 76,5 %, y una reduccion del 45 % en la divergencia KL (de 0,6794 a 0,3721).

Es relevante ahora porque demuestra que las tecnicas de cuantizacion por capas permiten llevar modelos de clase 27B a equipos de 16 GB manteniendo capacidades de tool calling y razonamiento utilizables, aunque sea a costa de eliminar la torre de vision y la cabeza MTP. La longitud de contexto declarada es de 262K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (hibrida), base Qwen3.8-27B; tags qwen3_5 |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | 2 bits con receta LayerFit por capa; existen builds hermanos de 2,5, 3, 4, 6 y 8 bits |
| Idiomas soportados | No disponible (la model card menciona pasajes de evaluacion en ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx, mlx-lm) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.8-27B, un transformer con bloques de atencion estandar y de atencion lineal (la model card distingue explicitamente "attention" y "linear-attention blocks" al describir la busqueda de bits). Sobre esa base, harness-hub publico un merge de tres adaptadores orientados a agentes de codigo: pi, Hermes y OpenCode, de modo que un unico modelo cubre varios harness de agente. El modelo que nos ocupa es una cuantizacion de ese merge, no un reentrenamiento.

La innovacion tecnica es LayerFit: en lugar de aplicar los mismos bits a todas las capas, se mide la sensibilidad de cada bloque (MLP, atencion, atencion lineal, embeddings y cabeza de salida) a baja precision y se reparte el presupuesto de tamano donde mas ayuda. El resultado se documenta en `layerfit-recipe.json`. Segun el autor, la receta de bits se calculo sobre la base Qwen3.8-27B y se revalido sobre este modelo. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking (la model card reporta "Thinking 2/2: pass").
- Programacion y tareas de agente de codigo, heredadas de los adaptadores pi, Hermes y OpenCode.
- Tool calling / function calling (la model card reporta "Tool call and coding 2/3: pass").
- Razonamiento matematico basico (GSM8K-50 con thinking desactivado: 43/50).
- Contexto largo de hasta 262K tokens.
- Capacidades multilingues: no disponibles de forma explicita; la evaluacion menciona pasajes en otros idiomas ademas del ingles.
- Sin vision: la torre de vision se elimino deliberadamente para caber en 16 GB.
- Sin cabeza MTP (multi-token prediction) en este build, porque a 2 bits no aporta segun el autor.

## Casos de uso

- Asistencia de programacion local en un Mac de 16 GB: el modelo puede integrarse en editores o terminales via mlx-lm o LM Studio para autocompletar, explicar y refactorizar codigo sin enviar datos a la nube, aprovechando que el build esta ajustado a ese limite de memoria.
- Agentes de codigo multi-paso: al soportar tool calling y heredar los adaptadores pi, Hermes y OpenCode, puede orquestar llamadas a herramientas (lectura de ficheros, ejecucion de tests, busqueda) en bucles de varios pasos sobre un solo modelo.
- Automatizacion de tareas de desarrollo en CI/CD ligero: ejecucion de revisiones de codigo o generacion de parches en runners con Apple Silicon, donde no hay GPU dedicada y el presupuesto de memoria es ajustado.
- Prototipado de agentes conversacionales con contexto largo: los 262K tokens permiten mantener conversaciones o documentos extensos en memoria sin truncar, util para asistentes de documentacion tecnica.
- Evaluacion e investigacion de cuantizacion: sirve como referencia practica para estudiar el impacto de LayerFit frente a cuantizacion uniforme, comparando los distintos builds (2, 2,5, 3, 4, 6 y 8 bits) del mismo modelo.
- Razonamiento matematico y resolucion de problemas en local: con el modo thinking activado puede abordar problemas de varios pasos sin conexion, adecuado para entornos con requisitos de privacidad.
- Despliegue en estaciones de trabajo Apple para tareas de agente de baja latencia: al residir en memoria unificada y cargarse con mlx-lm estandar, encaja en flujos de trabajo de escritorio que requieren respuestas interactivas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Prueba | Resultado |
|---|---|
| GSM8K-50, thinking off | 43/50 |
| Tool call and coding | 2/3 (pass) |
| Thinking | 2/2 (pass) |
| Concordancia Top-1 con bf16 (LayerFit 2-bit) | 76,5 % |
| Concordancia Top-1 con bf16 (2-bit estandar) | 68,1 % |
| Divergencia KL (LayerFit 2-bit) | 0,3721 |
| Divergencia KL (2-bit estandar) | 0,6794 (45 % inferior con LayerFit) |

No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estandar en la informacion disponible. El autor remite a la model card de harness-hub/Qwen3.8-27B-super-adapter para los resultados del modelo base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 9,1 GB de pesos; el autor recomienda un Mac de 16 GB dejando margen para macOS y prompts largos (la descarga es como maximo ~60 % de la memoria).
- GPU recomendadas: Apple Silicon con memoria unificada de 16 GB o superior; no esta pensado para GPUs NVIDIA.
- Cabe en consumer GPU: si, en Macs de 16 GB (build 2-bit); para 24 GB existe el build de 3 bits, para 32 GB el de 4 bits y para 48 GB o mas los de 6 y 8 bits.
- Opciones de despliegue: mlx-lm, mlx-vlm (aunque este build es solo texto) y LM Studio, al ser formato MLX estandar.
- Ajuste opcional para 16 GB: `sudo sysctl iogpu.wired_limit_mb=12800` para permitir que la GPU use mas memoria (se pierde al reiniciar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit | ~26,9 B | 262K | 2 bits MLX (LayerFit) | Apache-2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit | ~26,9 B | 262K | 3 bits MLX (LayerFit) | Apache-2.0 | Hugging Face |
| netprojects/Qwen3.8-27B-super-adapter-MLX-6bit | ~26,9 B | 262K | 6 bits MLX | Apache-2.0 | Hugging Face |
| harness-hub/Qwen3.8-27B-super-adapter | ~26,9 B | 262K | bf16 (referencia) | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento de modelos de otros fabricantes en la informacion proporcionada para una comparativa cruzada.

## Limitaciones y advertencias

- La cuantizacion a 2 bits degrada la calidad respecto al bf16: la concordancia Top-1 con el original es del 76,5 %, es decir, aproximadamente uno de cada cuatro tokens de mayor probabilidad difiere del modelo completo.
- Sin vision: la torre de vision se elimino en este build, por lo que no puede procesar imagenes.
- Sin cabeza MTP: no dispone de decodificacion multi-token especulativa en este build.
- Idiomas soportados no documentados de forma explicita; el rendimiento fuera del ingles no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, potencialmente amplificado por la cuantizacion agresiva.
- Sesgos conocidos: no documentados en la informacion proporcionada; cabe esperar los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero el autor declara no estar afiliado a Alibaba Cloud, al equipo Qwen ni a harness-hub; LayerFit es marca registrada de NetProjects.
- Para produccion en 16 GB se recomienda limitar los prompts a unos pocos miles de tokens y cerrar otras aplicaciones; el contexto de 262K es nominal y no practical en ese hardware.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2bit
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-2.5bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-3bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-LayerFit-MLX-4bit
- Build de 6 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-super-adapter-MLX-8bit
- Perfil del autor: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
