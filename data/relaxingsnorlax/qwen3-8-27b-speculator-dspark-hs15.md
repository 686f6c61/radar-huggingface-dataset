# RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs15

## Resumen

Qwen3.8-27B-speculator.dspark-hs15 es un modelo auxiliar de decodificacion especulativa (draft model) publicado por el usuario RelaxingSnorlax en Hugging Face. No es un modelo de lenguaje autonomo: es un componente que se acopla a un modelo objetivo (presumiblemente de la familia Qwen3.8-27B) para acelerar la inferencia mediante la tecnica DSpark, implementada en vLLM. Su funcion es proponer tokens candidatos que el modelo grande verifica en paralelo, reduciendo el coste por token generado.

La variante concreta que nos ocupa es un artefacto de ablacion: consume 15 capas de hidden states auxiliares del modelo objetivo (`aux_hidden_state_layer_ids = [2, 6, 11, 15, 19, 23, 28, 32, 36, 41, 45, 49, 53, 58, 62]`) en lugar de las 8 del checkpoint original de RedHatAI. El autor advierte explicitamente de que los pesos de la proyeccion combinadora (`fc.weight`, de forma `[5120, 76800]`) han sido reinicializados con valores aleatorios, por lo que la tasa de aceptacion es practicamente nula (~0 tokens aceptados).

Por tanto, este checkpoint solo sirve para medir el coste computacional de la ruta de hidden states (captura y transferencia de N salidas de capa en el modelo objetivo, la GEMM `N x H -> H` de la proyeccion `fc` y el forward del draft), no para acelerar inferencia real. Con 2.171.932.417 parametros y 4,3 GB en safetensors, es relevante unicamente para ingenieros que evaluen el sobredimensionamiento de variantes DSpark en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model para decodificacion especulativa DSpark (consumidor de hidden states auxiliares del modelo objetivo) |
| Parametros totales | 2.171.932.417 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ/GPTQ documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere cargador especifico en vLLM) |

## Arquitectura y entrenamiento

El modelo es un draft head de decodificacion especulativa para el metodo DSpark integrado en vLLM. Su entrada son las hidden states de 15 capas intermedias del modelo objetivo, seleccionadas en los indices `[2, 6, 11, 15, 19, 23, 28, 32, 36, 41, 45, 49, 53, 58, 62]`. Esas 15 representaciones, cada una de dimension 5120, se concatenan y se proyectan mediante `fc.weight` (forma `[5120, 76800]`, es decir, `5120 x 15*5120`) a un unico vector de 5120 dimensiones que alimenta el forward del draft. El checkpoint se genera con el script `make_dspark_hs_variants.py` a partir de `RedHatAI/Qwen3.8-27B-speculator.dspark`, cuyo `fc` original cubria las capas `[4, 12, 20, 28, 36, 44, 52, 60]` (8 capas).

La diferencia clave respecto al checkpoint base es que `fc.weight` se ha reinicializado con valores aleatorios, mientras que el resto de tensores se copian sin cambios. No se documenta el proceso de entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion disponible. Tampoco se detalla la arquitectura interna del draft mas alla de su papel como consumidor de hidden states; no hay confirmacion de si es un transformer denso, un MLP o un modulo hibrido.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa en vLLM con `num_speculative_tokens=7` y `method="dspark"`.
- Consumo de hidden states auxiliares de 15 capas del modelo objetivo para condicionar las propuestas.
- Integracion con el motor vLLM mediante `--speculative-config`.
- No dispone de capacidades autonomas de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni tool calling: no es un modelo de chat ni un LLM independiente.
- No soporta agentes, multi-step reasoning ni capacidades multilingues propias.
- Tasa de aceptacion esperada en esta variante: ~0 tokens aceptados, por el reinicializado aleatorio de `fc.weight`.

## Casos de uso

- Ablacion del numero de capas de hidden states en DSpark: sirve para medir como escala el coste de capturar y transferir 15 capas frente a las 8 del checkpoint entrenado, en terminos de ancho de banda y latencia en el modelo objetivo.
- Benchmark del coste de la GEMM `fc`: permite aislar el tiempo de la proyeccion `[5120, 76800]` en GPU y compararlo con variantes de menos capas, sin que la tasa de aceptacion contamine la medicion.
- Perfilado del forward del draft: util para determinar el overhead del draft model en vLLM cuando se sirve con `num_speculative_tokens=7`.
- Validacion de pipelines de decodificacion especulativa: comprobar que la configuracion `--speculative-config` con `method="dspark"` se carga correctamente y que el grafo de captura de hidden states funciona con 15 indices.
- Estudio de memoria y ancho de banda: medir el impacto en VRAM de mantener 15 buffers de hidden states de 5120 dimensiones por paso de decodificacion.
- Referencia negativa en experimentos de aceptacion: al tener ~0 tokens aceptados, sirve como linea base inferior para comparar con checkpoints entrenados y verificar que la metrica de aceptacion discrimina correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la tasa de aceptacion de esta variante es ~0 tokens aceptados por el reinicializado aleatorio de `fc.weight`, y que debe usarse unicamente para medir el coste de la ruta de hidden states frente a las lineas base entrenadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 4,3 GB en safetensors (2,17 mil millones de parametros); en BF16/FP16 se necesita aproximadamente esa cifra mas overhead del runtime de vLLM y de los buffers de hidden states del modelo objetivo.
- Los 15 buffers de hidden states auxiliares (15 x 5120 por token en vuelo) anaden presion de memoria y ancho de banda proporcional al batch y al numero de tokens especulativos.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabe en GPUs de consumo con 8-12 GB o mas, pero debe convivir con el modelo objetivo (Qwen3.8-27B), que domina los requisitos.
- Cabe en GPU de consumo junto al modelo objetivo solo si este se sirve cuantizado y la suma de ambos ajusta a la VRAM disponible; no hay datos publicados de configuraciones validadas.
- Opciones de despliegue: vLLM con `--speculative-config '{"model":"<hf-user>/Qwen3.8-27B-speculator.dspark-hs15","num_speculative_tokens":7,"method":"dspark"}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. Al tener ~0 aceptacion, el throughput efectivo sera inferior al del modelo objetivo sin especulacion, ya que se paga el coste del draft sin beneficio.

## Comparativa con modelos similares

| Modelo | Parametros | Capas hidden state | Estado de pesos | Licencia | Proposito |
|---|---|---|---|---|---|
| RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs15 | 2,17 B | 15 (`[2,6,11,15,19,23,28,32,36,41,45,49,53,58,62]`) | `fc.weight` aleatorio, resto copiado | Apache 2.0 | Ablacion de coste, sin aceptacion |
| RedHatAI/Qwen3.8-27B-speculator.dspark | no disponible | 8 (`[4,12,20,28,36,44,52,60]`) | Entrenado | no disponible | Draft funcional para DSpark |
| Otras variantes `dspark-hs*` del mismo autor | no disponible | no disponible | no disponible | no disponible | Ablaciones intermedias |

No se dispone de datos de benchmarks ni de tasas de aceptacion de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos corruptos por diseno: `fc.weight` es aleatorio, por lo que la tasa de aceptacion es ~0 y el modelo no acelera inferencia real.
- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no debe desplegarse como tal.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el checkpoint carece de utilidad productiva por su naturaleza de artefacto de benchmark.
- Requiere `custom_code` y un cargador especifico en vLLM; no es portable a otros runtimes sin adaptacion.
- Depende de un modelo objetivo concreto (Qwen3.8-27B) y de sus indices de capa; no es reutilizable con otras arquitecturas.
- Riesgo de confusion: el nombre sugiere un modelo funcional, pero la model card advierte explicitamente de que es solo para benchmarking.
- No hay informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el modelo no genera lenguaje de forma autonoma.
- Sin datos de contexto, cuantizacion ni idiomas; cualquier integracion en produccion requeriria validacion adicional no documentada.

## Enlaces

- Hugging Face: https://huggingface.co/RelaxingSnorlax/Qwen3.8-27B-speculator.dspark-hs15
- Checkpoint base: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Script de generacion citado en la model card: `make_dspark_hs_variants.py` (no se proporciona URL)
- Documentacion de decodificacion especulativa en vLLM: no disponible en la informacion proporcionada
