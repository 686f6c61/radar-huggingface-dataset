# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-225000

## Resumen

El modelo `Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-225000` es un modelo de borrador (draft model) para decodificacion especulativa, desarrollado por el usuario huluhuluu mediante la herramienta SpecForge. Su proposito es acelerar la inferencia del modelo objetivo `Qwen/Qwen3-4B-Instruct-2507` utilizando el algoritmo EAGLE3. No es un modelo de chat autonomo, sino un componente que se acopla al modelo principal para generar tokens candidatos que el modelo objetivo verifica, reduciendo la latencia de generacion.

El modelo se ha entrenado sobre datos ShareGPT limpios durante 10 epocas, con un total de 231.810 pasos de optimizacion. Cuenta con una arquitectura de una unica capa decodificadora con 202,7 millones de parametros, un tamano de contexto de 2048 tokens y pesos en bfloat16. La relevancia actual de este modelo radica en que permite desplegar Qwen3-4B-Instruct-2507 con menor latencia en entornos de produccion, manteniendo la calidad del modelo original sin necesidad de modificar sus pesos.

El repositorio contiene un unico checkpoint correspondiente al paso 225.000 de la epoca 9, dentro de una coleccion mas amplia de 47 checkpoints publicados por el mismo autor. El entrenamiento se realizo con el backend SGLang y flashinfer, y el modelo se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (1 capa decodificadora) |
| Parametros totales | 202.700.416 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible (depende del modelo objetivo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3 para decodificacion especulativa. Consta de una unica capa decodificadora con tamaño oculto de 2560, tamaño intermedio de 9728, 32 cabezas de atencion y 8 cabezas clave/valor. El vocabulario de borrador es de 32.000 tokens, mientras que el vocabulario objetivo es de 151.936 tokens. La capa de atencion utiliza `sdpa` (scaled dot-product attention) y no se aplica ventana deslizante.

El entrenamiento se realizo con SpecForge en modo online, utilizando datos ShareGPT limpios en formato JSONL. Se emplearon 10 epocas con un tamaño de lote efectivo de 4, tasa de aprendizaje de 1e-4 con calentamiento lineal del 1,5% y posterior decaimiento coseno, sin weight decay y con norma de gradiente maxima de 0,5. La longitud maxima de secuencia fue de 2048 tokens y la longitud TTT de EAGLE3 fue de 7. El backend objetivo fue SGLang con flashinfer y paralelismo tensorial de 1.

## Capacidades

- Aceleracion de inferencia mediante decodificacion especulativa con EAGLE3.
- Generacion de tokens candidatos para el modelo objetivo Qwen3-4B-Instruct-2507.
- Integracion con SGLang mediante la ruta de borrador especulativo.
- No es un modelo de chat autonomo: requiere emparejarse con el modelo objetivo.
- No soporta tool calling, agentes ni razonamiento multi-paso por si mismo.
- Sin modo thinking, vision ni audio: hereda las capacidades del modelo objetivo.
- Compatible con transformers y safetensors para su carga.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 con menor latencia en servidores de inferencia: el modelo se usa como ruta de borrador en SGLang, permitiendo que el modelo objetivo verifique multiples tokens por paso.
- Reduccion de costes de computo en servicios de chat multiusuario: al generar varios tokens especulativos por iteracion, se reduce el numero total de pasos de decodificacion.
- Optimizacion de APIs de generacion de texto en produccion: integrable en pipelines que usan SGLang con flashinfer para servir modelos de la familia Qwen3.
- Entornos con restricciones de VRAM: al ser un modelo de solo 0,4 GB, puede acompanar al modelo objetivo sin incrementar significativamente los requisitos de memoria.
- Experimentacion con decodificacion especulativa: util para investigadores que quieran comparar configuraciones de EAGLE3 (numero de pasos especulativos, top-k, etc.).
- Ajuste fino de borradores especificos para dominios: el checkpoint puede servir como punto de partida para entrenar borradores con datos propios, como sugiere el repositorio EAGLE-Qwen3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se registraron metricas de evaluacion ni de seguridad para este entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202,7 millones de parametros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para el modelo de borrador; la VRAM adicional dependera del modelo objetivo (Qwen3-4B-Instruct-2507 requiere aproximadamente 8-10 GB en cuantizacion de 16 bits).
- Compatible con GPU de consumo: si, incluyendo RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: SGLang con `--speculative-algorithm EAGLE3` y `--speculative-draft-model-path`; tambien puede cargarse con transformers para experimentacion local.
- Latencia y throughput: no disponibles; la model card recomienda ajustar los parametros especulativos (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`) segun la carga de trabajo.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada. Este modelo es un borrador especifico para Qwen3-4B-Instruct-2507, y no existen alternativas publicadas en la misma categoria dentro de los datos disponibles.

## Limitaciones y advertencias

- No es un modelo independiente: debe utilizarse exclusivamente con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. Su uso con otros modelos puede producir resultados incorrectos.
- Sin evaluacion de seguridad: la model card indica que no se registraron metricas de seguridad ni evaluaciones de calidad para este entrenamiento.
- Datos de entrenamiento limitados a ShareGPT: el dataset ShareGPT contiene principalmente datos en ingles, por lo que el rendimiento del borrador en otros idiomas puede ser suboptimo.
- Longitud de contexto limitada a 2048 tokens: secuencias mas largas pueden degradar la calidad del borrador.
- El archivo `training_state.pt` contiene estado de optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Los parametros especulativos recomendados en la model card son valores iniciales; es necesario realizar benchmarks para cada carga de trabajo especifica.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-9-step-225000
- Coleccion de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Modelo objetivo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio oficial EAGLE-Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
