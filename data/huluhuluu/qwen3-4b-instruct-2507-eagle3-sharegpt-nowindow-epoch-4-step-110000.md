# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-110000

## Resumen

Este repositorio contiene un checkpoint intermedio del entrenamiento online EAGLE3 con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Se trata de un modelo de draft (propuesta de tokens) para decodificación especulativa, no de un modelo de chat independiente. El autor, huluhuluu, ha publicado 47 checkpoints de un mismo run de entrenamiento, y este corresponde a la época 4, paso 110000.

El propósito del modelo es acelerar la inferencia del modelo base Qwen3-4B-Instruct-2507 cuando se despliega con SGLang y el algoritmo EAGLE3. Al ser un draft model, propone secuencias de tokens candidatos que el modelo objetivo verifica en paralelo, reduciendo la latencia por token sin degradar la calidad de las respuestas. La arquitectura es una variante de Llama con una única capa decoder, 202,7 millones de parámetros y pesos en bfloat16, entrenada sobre datos ShareGPT limpios con una ventana de contexto de 2048 tokens.

Este checkpoint es relevante para equipos que despliegan Qwen3-4B-Instruct-2507 en producción y buscan reducir la latencia de inferencia mediante decodificación especulativa. No hay métricas de evaluación o seguridad registradas para este run, por lo que su uso requiere validación previa en el entorno de destino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decoder, hidden size 2560, intermediate size 9728, 32 heads de atencion, 8 key/value heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 (limite de entrenamiento del draft; sin ventana deslizante) |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (depende del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura `LlamaForCausalLMEagle3`, una variante de Llama adaptada para EAGLE3 (Enhanced Autoregressive Generation with Learned Embeddings, version 3). Consta de una única capa decoder con hidden size 2560, intermediate size 9728, 32 cabezas de atencion y 8 cabezas key/value. El vocabulario de draft es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 (el del modelo base). Los pesos estan en bfloat16.

El entrenamiento se realizo con SpecForge, un framework para entrenamiento online de draft models. Los datos provienen de un dataset ShareGPT limpio en formato JSONL (revision no registrada). Se entrenaron 10 epocas con un total de 231810 pasos de optimizador, batch size global efectivo de 4, learning rate 1e-4 con warmup lineal del 1.5% y posterior cosine annealing, weight decay 0.0 y max grad norm 0.5. La longitud maxima de secuencia fue 2048 tokens, con EAGLE3 TTT length de 7. La atencion del draft usa `sdpa` (scaled dot-product attention) y el backend objetivo es SGLang con flashinfer. No se configuro ventana deslizante (por eso el nombre "NoWindow" en el repositorio).

El metodo EAGLE3 entrena un modelo auxiliar que predice los embeddings de los tokens futuros basandose en los hidden states del modelo objetivo. Durante la inferencia, el draft model genera multiples candidatos en arbol que el modelo objetivo verifica en paralelo, aceptando la secuencia mas probable. Esto reduce el numero de pasos autoregresivos necesarios y, por tanto, la latencia.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa EAGLE3 para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Generacion de secuencias de draft tokens (hasta `--speculative-num-draft-tokens 4` en la configuracion de ejemplo) que se verifican en paralelo con el modelo base.
- Integracion nativa con SGLang a traves del parametro `--speculative-draft-model-path`.
- No es un modelo de chat: no genera respuestas utiles por si mismo y requiere el modelo base exacto para funcionar.
- No soporta tool calling, agentes, vision ni audio. Su unica funcion es proponer tokens candidatos.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en produccion con SGLang: el checkpoint se usa como ruta de draft para reducir la latencia por token en servidores de inferencia. La configuracion tipica incluye `--speculative-algorithm EAGLE3`, `--speculative-draft-model-path` apuntando a este repositorio, y valores iniciales de `--speculative-num-steps 3`, `--speculative-eagle-topk 1` y `--speculative-num-draft-tokens 4`.

- Servicios de chat en tiempo real: si se sirve Qwen3-4B-Instruct-2507 para aplicaciones de atencion al cliente o asistentes conversacionales, este draft model permite responder con menor latencia, mejorando la experiencia de usuario en interacciones multi-turno.

- Reduccion de costes de computo en entornos de alto throughput: al disminuir el numero de pasos autoregresivos, se reduce el uso de GPU por peticion, lo que permite servir mas peticiones concurrentes con el mismo hardware.

- Optimizacion de pipelines de generacion de codigo: Qwen3-4B-Instruct-2507 tiene capacidades de generacion de codigo; al usar este draft model, los pipelines de CI/CD que generan o completan codigo pueden beneficiarse de una menor latencia sin cambiar el modelo base.

- Evaluacion comparativa de estrategias de decodificacion especulativa: los 47 checkpoints publicados permiten estudiar como evoluciona la calidad del draft a lo largo del entrenamiento y seleccionar el punto optimo para un workload concreto.

- Investigacion en metodos de aceleracion de LLMs: este checkpoint sirve como caso de estudio para entender el efecto de la longitud de entrenamiento, el batch size y el TTT length en la eficacia de EAGLE3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este run. No hay datos de latencia, throughput ni tasa de aceptacion de tokens para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de draft tiene 202,7 millones de parametros en bfloat16, lo que ocupa aproximadamente 0,4 GB en VRAM. Sin embargo, al usarse junto con el modelo base Qwen3-4B-Instruct-2507 (4B parametros), la VRAM total necesaria es la suma de ambos, aproximadamente 8-10 GB en bfloat16 (dependiendo de la longitud de contexto y del backend).
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM puede ejecutar el par (draft + base) en bfloat16. Para produccion con alto throughput se recomiendan GPUs con 16 GB o mas, como RTX 4090, A100, H100 o L40S.
- Compatibilidad con consumer GPU: si, cabe en RTX 3060 12GB, RTX 4070, etc., siempre que se use el modelo base en cuantizacion ligera o se limite la longitud de contexto.
- Opciones de despliegue: SGLang es el backend objetivo (con flashinfer). Tambien se puede usar con vLLM si soporta EAGLE3 (requiere verificacion). No se recomienda llama.cpp u Ollama porque no implementan EAGLE3 de forma nativa.
- Latencia y throughput: no disponible. Depende del hardware, la tasa de aceptacion del draft y la configuracion de arbol. Se recomienda hacer benchmarking con el workload real.

## Comparativa con modelos similares

No hay datos publicados de comparativas con otros draft models para Qwen3-4B-Instruct-2507. Como referencia, las alternativas de decodificacion especulativa incluyen:

| Modelo / Metodo | Parametros | Contexto | Notas |
|---|---|---|---|
| Este checkpoint (EAGLE3 draft) | 202,7 M | 2048 | Entrenado con ShareGPT, sin ventana deslizante |
| Medusa (para otros modelos base) | Variable | Variable | Metodo alternativo de decodificacion especulativa, requiere entrenamiento propio |
| Sin draft (autoregresivo estandar) | 0 (no aplica) | 2048+ | Latencia mayor por token, pero sin overhead de entrenamiento |

No se dispone de datos comparativos de rendimiento (tasa de aceptacion, speedup) entre estos enfoques en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat independiente: usarlo directamente como modelo de generacion produce resultados sin sentido. Debe emparejarse con el modelo base exacto `Qwen/Qwen3-4B-Instruct-2507`.
- Entrenado con ShareGPT, que puede contener sesgos y datos de baja calidad. No se realizo evaluacion de seguridad ni de sesgos en este run.
- La longitud de contexto de entrenamiento es 2048 tokens, por lo que el draft puede degradarse en secuencias mas largas. Aunque el modelo base soporta contextos mayores, el draft no fue entrenado para ello.
- No hay metricas de calidad ni de seguridad registradas. Antes de desplegar en produccion, es imprescindible validar el comportamiento del par (draft + base) en el dominio de aplicacion.
- El checkpoint incluye un archivo `training_state.pt` con estado de optimizador y argumentos de entrenamiento. Debe deserializarse solo en entornos de confianza, ya que puede contener codigo arbitrario.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Apache-2.0 tambien, segun la informacion disponible), por lo que se debe verificar el cumplimiento de ambas.
- No se garantiza compatibilidad con versiones futuras de SGLang o cambios en el algoritmo EAGLE3. La configuracion de arbol (num-steps, topk, num-draft-tokens) debe ajustarse mediante benchmarking para cada carga de trabajo.

## Enlaces

- Repositorio de este checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-4-step-110000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Coleccion de checkpoints del mismo run (referencia): https://huggingface.co/huluhuluu (coleccion asociada)
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Pagina de Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Documentacion de SGLang (para configuracion de decodificacion especulativa): https://docs.sglang.ai/ (no verificada en la busqueda, pero es la referencia estandar)
