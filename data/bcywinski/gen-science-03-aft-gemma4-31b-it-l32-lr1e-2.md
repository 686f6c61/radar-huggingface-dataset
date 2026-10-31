# bcywinski/gen-science-03-aft-gemma4-31b-it-L32-lr1e-2

## Resumen

Este repositorio no es un modelo de lenguaje de uso general, sino un artefacto de investigación científica publicado por el usuario `bcywinski` en Hugging Face. Se trata de una colección de adaptadores LoRA de rango 1 (rank-1), entrenados sobre `google/gemma-4-31B-it`, como parte del experimento 03 de un proyecto denominado "Gen-science paper". Cada adaptador se entrena sobre la capa `down_proj` del decodificador número 32 del modelo base, con learning rate 0.01, alpha 0.5 y una única época.

El propósito del experimento es estudiar el efecto de adaptadores AFT (entrenados sobre filas concretas, "A" prefiere X1, "B" prefiere X2) apilados sobre adaptadores previos ("midtrained") ya fusionados en el modelo base. Los subcarpetas siguen el patrón `<pair>_<world>_<direction>_s<seed>` e incluyen controles (`none_*`) entrenados sobre el modelo instruct sin midtraining, con tres semillas distintas (s0, s1, s2).

Su relevancia es exclusivamente académica: sirve para reproducir o verificar los resultados del paper asociado, no para desplegar un asistente o modelo productivo. El repositorio tiene 0 descargas y 0 likes, y su tamaño es de 0.0 GB según los metadatos indexados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA rank-1 sobre `down_proj` de la capa 32 de Gemma 4 31B-it (transformer decoder) |
| Parametros totales | no disponible (modelo base: ~31B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de google/gemma-4-31B-it) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria PEFT) |

## Arquitectura y entrenamiento

Cada subcarpeta contiene un adaptador LoRA de rango 1 aplicado únicamente a la proyección `down_proj` de la capa 32 del decodificador de Gemma 4 31B-it, con alpha 0.5 y learning rate 0.01, entrenado durante 1 época. La evaluación de cada adaptador requiere apilar primero el adaptador "midtrained" correspondiente (fusionado y congelado en el modelo base) y después el adaptador AFT de este repositorio.

Los datos de entrenamiento proceden del dataset `bcywinski/gen-science-03-aft-rows-cheese`, con filas A (preferencia por X1) y B (preferencia por X2). Las variantes `none_*` son controles entrenados sobre el modelo instruct sin midtraining previo. Se entrenaron tres semillas (s0, s1, s2) por condición para evaluar la varianza. No hay información sobre RLHF, DPO ni número de tokens de entrenamiento.

## Capacidades

- No es un modelo de uso general: es un conjunto de adaptadores experimentales para investigación en interpretabilidad/entrenamiento por capas.
- Cada adaptador induce una preferencia direccional (A prefiere X1, B prefiere X2) sobre las filas del dataset "cheese".
- Compatible con la libreria PEFT de Hugging Face para cargar y apilar adaptadores.
- No se documenta soporte de tool calling, agentes, visión, audio ni modos de razonamiento.

## Casos de uso

- **Reproducción del experimento 03 del paper Gen-science**: cargar el adaptador midtrained correspondiente, apilar el adaptador AFT de la subcarpeta elegida y replicar las mediciones del estudio.
- **Estudio de causalidad por capas**: analizar cómo una modificación mínima (rank-1 en una sola capa `down_proj`) altera el comportamiento del modelo completo.
- **Comparación con controles**: usar las variantes `none_*` para aislar el efecto del midtraining frente al entrenamiento AFT sobre el modelo instruct base.
- **Análisis de varianza entre semillas**: comparar s0, s1 y s2 dentro de cada condición para estimar la estabilidad del efecto.
- **Investigación en PEFT y apilado de adaptadores**: estudiar cómo interactúan adaptadores secuenciales (midtrained fusionado + AFT apilado) en un modelo de 31B.
- **Material didáctico sobre LoRA de rango mínimo**: ejemplo real de adaptadores rank-1 con alpha 0.5 en una capa concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 0.0 GB (adaptadores LoRA rank-1, tamaño mínimo), pero la inferencia requiere el modelo base `google/gemma-4-31B-it` completo en memoria.
- VRAM estimada para el modelo base de 31B: no disponible; como referencia, un modelo denso de 31B en fp16 requiere del orden de 62 GB de VRAM, y en cuantización de 4 bits en torno a 18-20 GB (estimación, no dato oficial).
- GPU recomendadas: A100 u H100 de 80 GB para fp16; RTX 4090 o A6000 podrían ser viables con cuantización de 4 bits (estimación, no confirmada).
- Opciones de despliegue: carga mediante la libreria PEFT de Hugging Face apilando adaptadores sobre el modelo base; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| bcywinski/gen-science-03-aft-gemma4-31b-it-L32-lr1e-2 | Adaptadores LoRA rank-1 experimentales | google/gemma-4-31B-it | MIT | Publico en Hugging Face, 0 descargas |
| google/gemma-4-31B-it | Modelo instruct completo | — | Licencia Gemma (no disponible aqui) | Publico en Hugging Face |
| bcywinski/gen-science-01-midtrained-gemma4-31b-it-* | Adaptadores midtrained previos | google/gemma-4-31B-it | no disponible | Publico en Hugging Face |

No hay alternativas comparables de otros autores en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo productivo: es material de investigación sin garantías de calidad de generación.
- Requiere apilar correctamente el adaptador midtrained antes del AFT; evaluarlo de forma aislada produce resultados inválidos según la model card.
- Cada adaptador induce deliberadamente una preferencia sesgada (A prefiere X1, B prefiere X2): su uso está diseñado para estudiar ese sesgo, no para eliminarlo.
- Sin model card de capacidades, evaluaciones de seguridad ni análisis de alucinaciones: no apto para despliegue en producción.
- La licencia MIT aplica a los adaptadores, pero el modelo base Gemma está sujeto a su propia licencia, que puede restringir el uso comercial.
- Datos de contexto, idiomas y rendimiento no documentados; cualquier despliegue requiere verificación propia.
- Repositorio con 0 descargas y sin validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bcywinski/gen-science-03-aft-gemma4-31b-it-L32-lr1e-2
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Dataset de filas AFT: https://huggingface.co/datasets/bcywinski/gen-science-03-aft-rows-cheese
- Adaptadores midtrained relacionados: https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w1, https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-po-w2, https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w1, https://huggingface.co/bcywinski/gen-science-01-midtrained-gemma4-31b-it-cheese-gb-w2
