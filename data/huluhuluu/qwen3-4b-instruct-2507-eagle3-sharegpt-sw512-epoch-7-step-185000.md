# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-185000

## Resumen

Este modelo es un **draft model** (modelo de borrador) para decodificacion especulativa, disenado para acelerar la inferencia del modelo `Qwen/Qwen3-4B-Instruct-2507`. Ha sido desarrollado por el usuario de HuggingFace `huluhuluu` como parte de un entrenamiento online con el framework **EAGLE3** y **SpecForge**. No es un modelo de chat independiente: su unica funcion es generar secuencias candidatas que el modelo objetivo (el Qwen3-4B-Instruct-2507) verifica en paralelo, reduciendo la latencia de generacion sin degradar la calidad final.

Con solo **202,7 millones de parametros** (una unica capa decoder con hidden size 2560), el modelo es extremadamente ligero y puede ejecutarse en paralelo al modelo base. El entrenamiento se realizo sobre 10 epocas del dataset ShareGPT (conversaciones limpiadas), con una ventana deslizante de 512 tokens y una longitud maxima de secuencia de 2048. La relevancia actual radica en que la decodificacion especulativa se ha convertido en una tecnica estandar para reducir costes de inferencia en modelos grandes, y este checkpoint ofrece una implementacion lista para usar con SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (una capa decoder, causal sliding-window attention) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Maxima secuencia de entrenamiento: 2048 tokens; ventana deslizante de draft: 512 tokens |
| Tipos de cuantizacion | Peso nativo en `bfloat16`; cuantizaciones adicionales no documentadas |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-4B-Instruct-2507, que es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (`model.safetensors`), junto con `config.json` y `training_state.pt` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura **EAGLE3** (Enhanced Autoregressive Generation with Learned Embeddings), una variante de decodificacion especulativa que entrena un modelo de borrador de una sola capa sobre las activaciones ocultas del modelo objetivo. En este caso, la capa unica tiene un tamaño oculto de 2560, un tamaño intermedio de 9728, 32 cabezas de atencion y 8 cabezas clave/valor. La atencion es causal con ventana deslizante de 512 tokens, y se usa `sdpa` (scaled dot-product attention) como backend de atencion.

El entrenamiento se realizo de forma online (online EAGLE3) con el framework **SpecForge**, utilizando datos ShareGPT limpios en formato JSONL (la revision exacta del dataset no se registro). Los hiperparametros principales incluyen 10 epocas, 231.810 pasos de optimizador, batch efectivo global de 4, learning rate de `1e-4` con warmup lineal del 1.5% y posterior cosine annealing, weight decay 0.0 y gradiente maximo de norma 0.5. La longitud maxima de secuencia fue de 2048 tokens, y la longitud TTT (test-time training) de EAGLE3 fue de 7. El backend objetivo fue SGLang con FlashInfer. No se registraron metricas de evaluacion ni de seguridad durante el entrenamiento.

## Capacidades

- **Decodificacion especulativa**: genera secuencias candidatas de hasta 512 tokens (ventana deslizante) que el modelo base verifica, acelerando la inferencia.
- **Integracion con SGLang**: disenado especificamente para usarse como ruta de draft en SGLang con configuracion EAGLE3.
- **Bajo coste de inferencia**: al tener solo 202,7M de parametros, puede ejecutarse en paralelo al modelo base sin requerir hardware adicional significativo.
- **Compatibilidad con el modelo base**: requiere emparejarse con `Qwen/Qwen3-4B-Instruct-2507`; no funciona de forma autonoma.
- **Reanudacion de entrenamiento**: incluye `training_state.pt` con estado de optimizador y argumentos de entrenamiento para continuar el entrenamiento (solo en entornos de confianza).
- **No soporta tool calling, agentes, vision ni audio**: al ser un draft model, carece de estas capacidades; todas las funcionalidades del sistema final dependen del modelo base.

## Casos de uso

- **Inferencia de baja latencia en produccion**: desplegar el draft model junto con el Qwen3-4B-Instruct-2507 en SGLang reduce el tiempo de generacion token a token, especialmente en cargas de trabajo con muchas solicitudes concurrentes donde la latencia es critica.
- **Servicios de chat multilingue**: el modelo base es multilingue; el draft acelera las respuestas en todos los idiomas soportados sin cambiar la calidad del texto final.
- **Generacion de codigo y matematicas**: el Qwen3-4B-Instruct-2507 destaca en tareas de programacion y razonamiento; el draft model permite iterar mas rapido en entornos de desarrollo asistido por IA.
- **Fine-tuning posterior**: el `training_state.pt` permite reanudar el entrenamiento con datos adicionales para adaptar el draft a dominios especificos (por ejemplo, codigo o conversacion tecnica).
- **Experimentos de decodificacion especulativa**: util para investigadores que evaluan el rendimiento de EAGLE3 frente a otras tecnicas (Medusa, EAGLE-2) en el mismo modelo base.
- **Despliegue en entornos con presupuesto de GPU limitado**: al ser un modelo pequeno, puede ejecutarse en la misma GPU que el modelo base o en una GPU secundaria de baja capacidad, minimizando el coste de hardware adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento. Se recomienda realizar pruebas propias de throughput y latencia con la configuracion de arbol (tree settings) adecuada para la carga de trabajo concreta.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo en `bfloat16` ocupa aproximadamente 405 MB (202,7M parametros x 2 bytes). En la practica, se ejecuta junto al modelo base Qwen3-4B-Instruct-2507, que en `bfloat16` ocupa unos 8 GB. Total estimado: ~8,5-9 GB con overhead.
- **GPU recomendadas**: cualquier GPU con al menos 10-12 GB de VRAM puede alojar ambos modelos (por ejemplo, RTX 3080/4080, RTX 3090, A10, L4). Para produccion a gran escala, se recomienda A100 (40/80 GB) o H100 para multiples instancias.
- **Compatibilidad con GPU consumer**: si, cabe en GPUs de consumo como RTX 3090 o RTX 4090 (24 GB) con espacio de sobra para el modelo base y buffers de inferencia.
- **Opciones de despliegue**: SGLang (backend recomendado, con FlashInfer), y potencialmente vLLM si soporta EAGLE3 en la version utilizada. No se menciona compatibilidad con llama.cpp u Ollama.
- **Latencia y throughput**: no hay datos publicados. La ganancia esperada de EAGLE3 suele situarse entre 1.5x y 3x en velocidad de generacion, pero depende de la configuracion de arbol y de la similitud entre el draft y el modelo base.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint especifico. Como referencia cualitativa, se puede comparar con otras tecnicas de decodificacion especulativa:

| Modelo / tecnica | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (EAGLE3 draft) | 202,7M | 2048 (ventana draft 512) | Apache-2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507 (base) | 4B | 262.144 (segun especificaciones del base) | Apache-2.0 | HuggingFace |
| EAGLE-2 (draft tipico para LLM) | Variable | Depende del modelo base | Variable | Repos oficiales |

La comparacion cuantitativa (speedup, aceptacion de tokens) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo de chat**: no debe usarse de forma autonoma para generar respuestas; solo funciona como draft para el modelo base.
- **Sin evaluacion de seguridad**: la model card indica que no se registraron metricas de evaluacion ni de seguridad. No hay garantias sobre sesgos, toxicidad o alucinaciones en el draft (aunque el texto final lo genera el modelo base).
- **Ventana deslizante limitada**: el draft solo considera 512 tokens de contexto, lo que puede reducir la eficacia en secuencias muy largas si el modelo base depende de un contexto mas amplio.
- **Dependencia de SGLang**: la integracion esta pensada para SGLang con FlashInfer; otros motores de inferencia pueden no soportar este formato de draft.
- **Datos de entrenamiento**: ShareGPT contiene conversaciones de usuarios reales, lo que puede introducir sesgos de estilo y contenido; la revision exacta del dataset no se registro.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien esta bajo Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- **Reanudacion de entrenamiento**: `training_state.pt` puede contener informacion sensible del optimizador; solo debe deserializarse en entornos de confianza.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-7-step-185000
- Checkpoint companion (epoch 7, paso 185000, sin SW512 en el nombre): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-7-step-185000
- Checkpoint companion (epoch 3, paso 70000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-70000
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Referencia del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Guia de uso del modelo base en vLLM: https://vllm-vacc.vastaitech.com/Qwen/Qwen3-4B-Instruct-2507
