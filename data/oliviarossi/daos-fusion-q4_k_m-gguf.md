# OliviaRossi/DAOS-Fusion-Q4_K_M-GGUF

## Resumen

DAOS-Fusion-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo DAOS-Fusion, desarrollado por OliviaRossi. DAOS-Fusion es un modelo de lenguaje de tipo Mixture of Experts (MoE) basado en la arquitectura Qwen3.5 MoE, orientado a tareas de razonamiento, agencia y generación de texto. Con 34.660.610.688 parámetros totales, el modelo combina técnicas de fusión (merge) como DARE, TIES y delta-net, lo que sugiere un enfoque experimental para mejorar capacidades de razonamiento y seguimiento de instrucciones.

Esta versión GGUF, cuantizada a Q4_K_M, reduce significativamente los requisitos de memoria (aproximadamente un 72% menos de VRAM frente a los pesos en fp16), lo que permite ejecutar el modelo en hardware de consumo como GPUs con 24 GB de VRAM. El modelo está pensado para su uso con llama.cpp, aunque también es compatible con vLLM y otras herramientas que soporten GGUF. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia actual radica en que ofrece una alternativa de código abierto para tareas de agente y razonamiento con un tamaño manejable tras la cuantización, aunque la documentación pública es escasa y no se han publicado benchmarks oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Qwen3.5 MoE |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta version); existen otras como Q5_K_M |
| Idiomas soportados | ingles, chino, codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

DAOS-Fusion emplea una arquitectura MoE, lo que implica que solo una fraccion de los parametros se activa por token, reduciendo el coste computacional en inferencia. Los tags indican que se basa en la familia Qwen3.5 MoE, aunque no se especifica el numero de expertos ni los parametros activos. El modelo es el resultado de una fusion (merge) de multiples modelos, utilizando tecnicas como DARE (Drop And REscale), TIES y delta-net, que buscan combinar pesos de forma eficiente para preservar capacidades especificas.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La ausencia de una model card completa para el modelo base impide conocer estos datos. La cuantizacion Q4_K_M se realizo con llama.cpp, manteniendo la estructura original del modelo pero reduciendo la precision de los pesos a 4 bits con bloques K.

## Capacidades

- Generacion de texto y conversacion multi-turno, con soporte para ingles, chino y codigo.
- Razonamiento y resolucion de problemas, indicado por los tags "reasoning" y "agent".
- Capacidades de agente, probablemente incluyendo tool calling y ejecucion de acciones, aunque no se confirma explicitamente.
- Soporte para tareas de codigo, como generacion, explicacion o depuracion.
- Compatible con pipelines de transformers y con inferencia via llama.cpp, vLLM y otras herramientas que acepten GGUF.
- Al ser un MoE, ofrece un equilibrio entre capacidad y eficiencia, aunque los parametros activos no estan documentados.

## Casos de uso

- Asistentes conversacionales locales: al ser un GGUF cuantizado, puede ejecutarse en una GPU de 24 GB (p. ej., RTX 4090) con llama.cpp, permitiendo un chatbot privado sin conexion.
- Generacion de codigo en entornos de desarrollo: su soporte para codigo y razonamiento lo hace util para autocompletar, explicar o refactorizar fragmentos en ingles o chino.
- Prototipado de agentes autonomos: las capacidades de agente y razonamiento permiten experimentar con pipelines de tool calling, aunque se debe verificar la compatibilidad con frameworks como LangChain o LlamaIndex.
- Analisis de documentos tecnicos: con una ventana de contexto no especificada, podria procesar documentos largos si el contexto es suficiente, pero se requiere validacion.
- Educacion y aprendizaje: como modelo de razonamiento, puede servir para generar explicaciones paso a paso en matematicas o logica, aunque sin benchmarks no se puede garantizar su precision.
- Investigacion en fusion de modelos: al ser un merge experimental, es util para estudiar tecnicas como DARE o delta-net en un modelo MoE, comparando su comportamiento con otros merges.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo. Se recomienda evaluar el modelo en las tareas especificas antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M, los pesos ocupan aproximadamente 17,3 GB (34,66 B × 4 bits). Sumando overhead de KV cache y activaciones, se estima un consumo de 20-24 GB, dependiendo del contexto.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) o superiores. En GPUs con 16 GB (p. ej., RTX 4080) podria no caber con contexto largo.
- En CPU: es posible ejecutarlo con llama.cpp usando RAM, pero la velocidad sera baja; se recomienda al menos 32 GB de RAM.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se importa el GGUF), vLLM (con soporte GGUF experimental) y TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles. Dependen del hardware y del numero de parametros activos, que se desconoce.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. Como referencia, otros MoE de tamano similar son Mixtral 8x7B (46,7 B totales, 12,9 B activos) y Qwen3-30B-A3B (30 B totales, 3 B activos). DAOS-Fusion, con 34,66 B totales, podria tener un numero de activos menor, pero no se ha documentado. Sin benchmarks, no es posible comparar rendimiento. Se recomienda consultar la model card del modelo base para obtener mas detalles.

## Limitaciones y advertencias

- No hay informacion publica sobre sesgos, alucinaciones o limitaciones de contexto; se debe asumir un comportamiento similar a otros modelos de la familia Qwen, con posibles sesgos en datos de entrenamiento.
- Al ser un merge experimental, la calidad puede ser inconsistente en algunas tareas; se recomienda validar en casos de uso reales.
- La cuantizacion Q4_K_M introduce una perdida de precision que puede afectar a tareas de razonamiento complejo o generacion de codigo exacto.
- La ventana de contexto no esta documentada; si es corta (p. ej., 8K), limitara el procesamiento de documentos largos.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que los modelos base utilizados en el merge tambien tengan licencias compatibles.
- No hay soporte oficial ni mantenimiento garantizado; el autor es un usuario individual.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/OliviaRossi/DAOS-Fusion-Q4_K_M-GGUF
- Modelo base (safetensors): https://huggingface.co/OliviaRossi/DAOS-Fusion
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Guia de cuantizacion GGUF (referencia general): https://willitrunai.com/blog/quantization-guide-gguf-explained
