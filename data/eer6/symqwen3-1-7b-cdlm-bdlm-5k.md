# EER6/SymQwen3-1.7B-CDLM-BDLM-5k

## Resumen

SymQwen3-1.7B-CDLM-BDLM-5k es un modelo de lenguaje de difusión (diffusion language model, DLM) desarrollado por EER6 como parte de la campaña experimental DLM1B **qwen3_sym**. Se trata de una adaptación del modelo causal Qwen3-1.7B a una arquitectura de lenguaje de difusión con atención bidireccional libre (free bidirectional attention), entrenada en dos etapas: primero como CDLM (causal mask-tolerance stage) durante 5k pasos y posteriormente 5k pasos adicionales con atención bidireccional libre. El objetivo de la campaña es comparar recetas de conversión de modelos autorregresivos (AR) a DLM bajo un presupuesto de cómputo idéntico.

El modelo tiene 2.031.739.904 parámetros (aproximadamente 2B), una longitud de contexto de 2048 tokens y se distribuye bajo licencia Apache 2.0. Es un modelo de investigación, no orientado a producción, que explora la viabilidad de la generación de texto mediante difusión enmascarada en lugar de decodificación autorregresiva. Su relevancia radica en que aporta datos empíricos sobre el rendimiento de distintas estrategias de adaptación de arquitecturas causales a DLM, un área aún incipiente dentro de la IA generativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model (masked DLM) basado en Qwen3-1.7B, atención bidireccional libre (free bidirectional attention) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (L2048 en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda de Qwen3, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen3-1.7B y los adapta a un esquema de lenguaje de difusión enmascarado. La arquitectura es un transformer con atención bidireccional libre (sin máscara causal), lo que permite que el modelo prediga tokens enmascarados a partir del contexto completo. El entrenamiento se realizó en dos etapas: primero 5k pasos como CDLM (con una máscara causal tolerante) y luego 5k pasos adicionales con atención bidireccional libre (BDLM). El total de la campaña es de 10k pasos con batch global de 256 y secuencias de 2048 tokens, lo que equivale a aproximadamente 5.2 mil millones de tokens. Se usó una tasa de aprendizaje de 1e-5, sin weight decay, con scheduler WSD (100 pasos de warmup, 500 de decay) y la mezcla de datos ADLMC v3 con aumentación congelada. La supervisión se aplica a todas las posiciones con targets limpios.

Una innovación destacable es que el modo de atención se registra en `config.attn_mode` y se aplica automáticamente al cargar el modelo; no se debe sobrescribir, ya que ejecutar el checkpoint CDLM-SDLM con atención bidireccional libre colapsa el modelo. Todos los state_dicts son arquitectónicamente idénticos entre modos; la diferencia es semántica de forward, no de pesos.

## Capacidades

- Generación de texto mediante difusión enmascarada: el modelo predice tokens enmascarados en un canvas completo, sin decodificación autorregresiva ni uso de KV cache.
- Razonamiento y generación de código: los resultados de HumanEval y MBPP indican capacidad para resolver problemas de programación simples.
- Atención bidireccional libre: permite que cada token atienda a todo el contexto, lo que puede mejorar la coherencia global en tareas de infilling o edición.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo.
- Sin capacidades multimodales: es exclusivamente texto.
- Multilingüismo: no especificado, aunque al derivar de Qwen3 podría heredar cierto soporte multilingüe, pero no hay datos al respecto.

## Casos de uso

- Investigación académica en modelos de difusión para lenguaje: el modelo sirve como banco de pruebas para estudiar el comportamiento de DLM con atención bidireccional libre frente a variantes simétricas o causales.
- Comparación de recetas de conversión AR→DLM: permite reproducir y extender los experimentos de la campaña DLM1B, evaluando el impacto de la etapa CDLM y del modo de atención en el rendimiento final.
- Generación de código en entornos de investigación: con un pass@1 de 23.2 en HumanEval y 27.9 en MBPP, puede usarse para experimentos de síntesis de código a pequeña escala, aunque no es competitivo con modelos autorregresivos modernos.
- Estudio de infilling y edición de texto: la atención bidireccional y el entrenamiento con máscaras hacen que el modelo sea adecuado para tareas de relleno de huecos o revisión de fragmentos.
- Desarrollo de técnicas de decodificación para DLM: al no usar KV cache y requerir un canvas completo, es útil para probar algoritmos de muestreo iterativo o de refinamiento progresivo.
- Benchmarking de hardware y eficiencia: su tamaño moderado (2B) permite ejecutarlo en GPUs de consumo, facilitando experimentos de latencia y throughput en configuraciones de inferencia no autorregresiva.

## Benchmarks y rendimiento

La model card reporta resultados para los cuatro brazos de la campaña, con decodificación greedy sobre un canvas de 256 tokens (no comparable a gen-1024). Los datos son de una sola semilla y una sola decodificación, por lo que deben interpretarse con cautela.

| Modelo | HumanEval (gen-256) pass@1 | MBPP-499 (gen-256) pass@1 |
|---|---|---|
| BDLM-10k | 27.4 | 25.1 |
| CDLM-5k (stage) | 9.1 | 10.0 |
| CDLM→BDLM-5k (este modelo) | 23.2 | 27.9 |
| CDLM→SDLM-5k | 26.2 | 26.1 |

No se han publicado resultados comparativos con el modelo base Qwen3-1.7B ni con otros DLM en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 2.03B parámetros en bfloat16, el peso ocupa aproximadamente 4.1 GB. La inferencia requiere además el canvas completo (secuencia de 2048 tokens) y las activaciones correspondientes; se estima un consumo total de 6-8 GB en FP16, dependiendo del batch.
- GPU recomendadas: cabe en GPUs consumer como RTX 3090 (24 GB), RTX 4090 (24 GB) o RTX 4080 (16 GB). También puede ejecutarse en GPUs de datacenter como A10 o A100.
- Opciones de despliegue: se carga con `transformers` usando `trust_remote_code=True`. No se menciona soporte para vLLM, llama.cpp u Ollama; al ser un DLM con forward personalizado, es probable que solo funcione con el código original de ADLMC.
- Latencia y throughput: no disponibles. Al no usar KV cache y requerir un canvas completo, la inferencia es inherentemente diferente a la autorregresiva; el coste computacional depende del número de iteraciones de refinamiento, que no se especifica.

## Comparativa con modelos similares

No se dispone de datos de modelos DLM comparables de tamaño similar en la información proporcionada. La comparación más directa es con los otros brazos de la misma campaña (BDLM-10k, CDLM-5k, CDLM→SDLM-5k), cuyos resultados se muestran en la sección de benchmarks. Frente al modelo base Qwen3-1.7B (autorregresivo), no hay cifras de HumanEval o MBPP en la documentación, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción; es un artefacto de investigación para estudiar la conversión AR→DLM.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en tareas abiertas.
- Contexto limitado: la ventana de 2048 tokens es corta para aplicaciones que requieran documentos extensos.
- Sin soporte de tool calling ni agentes: no puede integrarse en pipelines que requieran invocación de funciones externas.
- Dependencia del modo de atención: cargar el modelo con un `attn_mode` incorrecto (p. ej., forzar atención bidireccional en un checkpoint CDLM-SDLM) provoca el colapso inmediato del modelo.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ u otras, lo que limita su despliegue en entornos con restricciones de memoria.
- Idiomas no especificados: aunque hereda el tokenizador de Qwen3, no hay garantía de rendimiento multilingüe.
- Resultados de benchmarks con una sola semilla: los números reportados son de una única ejecución greedy, por lo que la varianza puede ser alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EER6/SymQwen3-1.7B-CDLM-BDLM-5k
- Perfil del autor EER6: https://huggingface.co/EER6
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
