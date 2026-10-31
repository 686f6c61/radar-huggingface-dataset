# dicksondickson/Carbon-X-oQ4e-bf16-MLX

## Resumen

Carbon-X-oQ4e-bf16-MLX es una cuantización en formato MLX del modelo HuggingFaceBio/Carbon-X, un modelo especializado en biología y genómica construido sobre la arquitectura Qwen3. La cuantización ha sido realizada por el usuario dicksondickson mediante oQ (oMLX 0.7.3.dev2), una herramienta de cuantización de precisión mixta con matriz de importancia (imatrix) y el esquema "Better Low-Bit oQ", dejando los tensores más importantes en bf16.

El propósito del modelo es trabajar con secuencias de ADN y tareas de genómica, ofreciendo una ventana de contexto de hasta 40.960 tokens, lo que según la model card equivale aproximadamente a 245 kilopares de bases (kbp) de ADN. Su relevancia radica en la creciente aplicación de modelos de lenguaje a la biología computacional, y en que esta versión optimizada para Apple Silicon permite ejecutarlo localmente en Mac con chips M3 o posteriores.

Con 14.822.046.720 parámetros totales y un tamaño de repositorio de 8,7 GB, se trata de un modelo de tamaño medio-grande cuya versión cuantizada cabe en hardware de consumo de Apple. Se distribuye bajo licencia MIT, lo que permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3 (transformer); detalles adicionales no disponibles |
| Parametros totales | 14.822.046.720 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 40.960 tokens (~245 kbp de ADN segun la model card) |
| Tipos de cuantizacion | oQ 4-bit de precision mixta (imatrix); tensores importantes en bf16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base, HuggingFaceBio/Carbon-X, está construido sobre la arquitectura Qwen3, un transformer decoder-only. La versión aquí descrita es una cuantización realizada con oQ (oMLX 0.7.3.dev2), que emplea cuantización de precisión mixta guiada por matriz de importancia (imatrix): los tensores críticos para la calidad se mantienen en bf16, mientras que el resto se cuantiza a 4 bits. Esta estrategia reduce el tamaño del repositorio a 8,7 GB manteniendo la fidelidad en las operaciones más sensibles.

Sobre el entrenamiento del modelo base no se dispone de datos publicados en la información proporcionada: no consta el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado su etiquetado (dna, biology, genomics), es razonable suponer un entrenamiento o ajuste fino sobre datos de secuencias genómicas, pero los detalles concretos no están disponibles. La model card indica que el tokenizador ha sido modificado (patcheado) para funcionar con oMLX de forma completamente offline, y que se requiere activar la opción "Trust Remote Code" al ejecutarlo.

## Capacidades

- Modelado y generación de secuencias de ADN, con una ventana de contexto que cubre aproximadamente 245 kbp
- Tareas de genómica y biología computacional (el alcance exacto no está detallado en la model card)
- Modo de pensamiento (thinking) heredado de Qwen3, que la model card recomienda desactivar (`enable_thinking=False`) para este caso de uso
- Ejecución completamente offline en Apple Silicon gracias al formato MLX y al tokenizador parcheado
- Soporte de tool calling, agentes o capacidades multilingües: no disponible

## Casos de uso

- Generación de secuencias de ADN: el modelo puede producir secuencias genómicas largas aprovechando su contexto de ~245 kbp, aunque la model card advierte que la calidad decae en generaciones muy largas y recomienda limitar la salida a 1024-4096 tokens
- Análisis de regiones genómicas extensas: la ventana de 40.960 tokens permite introducir fragmentos genómicos de gran tamaño para su anotación o caracterización computacional
- Investigación en biología computacional en equipos Mac: al estar cuantizado en formato MLX, investigadores con chips Apple M3 o superiores pueden experimentar sin depender de GPUs de datacenter
- Prototipado local y privado: la ejecución completamente offline resulta adecuada para trabajar con datos genómicos sensibles que no deben salir del equipo
- Comparación de variantes cuantizadas: útil como referencia para evaluar el impacto de la cuantización 4-bit de precisión mixta sobre el modelo base en tareas genómicas
- Educación y docencia en bioinformática: permite demostrar el uso de modelos de lenguaje sobre ADN en aulas o portátiles sin infraestructura de cómputo especializada

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 8,7 GB; se recomienda disponer de al menos 12-16 GB de memoria unificada para la carga del modelo y el KV cache
- GPU recomendadas: no aplicable a GPUs NVIDIA; el modelo está diseñado para Apple Silicon (chips M3 y posteriores, segun la model card)
- Consumer hardware: cabe en Macs con chips M3/M4 con suficiente memoria unificada (por ejemplo, MacBook Pro o Mac Studio con 16 GB o más); no hay información sobre compatibilidad con CUDA o GPUs de consumo tipo RTX 4090
- Despliegue: mediante oMLX (https://github.com/jundot/omlx), activando "Trust Remote Code"; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI
- Latencia y throughput: no disponibles; la model card advierte que la generación larga de ADN es lenta

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Carbon-X-oQ4e-bf16-MLX (este) | 14,8B | 40.960 tokens (~245 kbp ADN) | MLX safetensors 4-bit mixto | MIT | Especializado en ADN/genómica, Apple Silicon |
| HuggingFaceBio/Carbon-X (base) | no disponible | no disponible | no disponible | MIT | Modelo base sin cuantizar |
| Qwen3 (familia base) | versiones de ~0,6B a 235B | hasta ~256k tokens (según variante) | safetensors, GGUF | Apache 2.0 | Uso general; Carbon-X hereda su arquitectura |

No hay información suficiente para una comparativa de rendimiento cuantitativa; no disponible.

## Limitaciones y advertencias

- La calidad de la generación de ADN degrada con secuencias largas; la model card recomienda limitar max tokens a 1024-4096
- Se recomienda desactivar el modo thinking (`enable_thinking=False`), lo que sugiere que el modo de razonamiento no aporta beneficio en este dominio
- Requiere activar "Trust Remote Code" en oMLX, lo que implica ejecutar código personalizado del repositorio: revisar el código antes de usarlo en entornos de producción
- El tokenizador está parcheado para oMLX, por lo que la compatibilidad con otras librerías de inferencia no está garantizada
- Sesgos, riesgo de alucinación y rendimiento en lenguas naturales: no disponibles; al ser un modelo genómico especializado, no debe asumirse competencia en tareas generales
- Licencia MIT sin restricciones comerciales conocidas, aunque el modelo base podría tener consideraciones propias no documentadas aquí
- Las secuencias de ADN generadas son hipótesis computacionales, no validadas experimentalmente: cualquier uso en biología real requiere verificación en laboratorio y cumplimiento normativo correspondiente
- Estadísticas de adopción muy bajas (94 descargas, 1 like) indican que el modelo ha sido poco probado por la comunidad

## Enlaces

- Modelo cuantizado: https://huggingface.co/dicksondickson/Carbon-X-oQ4e-bf16-MLX
- Modelo base: https://huggingface.co/HuggingFaceBio/Carbon-X
- Repositorio oMLX (herramienta de ejecución): https://github.com/jundot/omlx
- Paper, blog o demo: no disponible
