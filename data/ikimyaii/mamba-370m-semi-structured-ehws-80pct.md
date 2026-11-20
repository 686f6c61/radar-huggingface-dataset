# ikimyaii/Mamba-370M-semi-structured-EHWS-80pct

## Resumen

Mamba-370M-semi-structured-EHWS-80pct es un checkpoint derivado de `state-spaces/mamba-370m-hf`, el modelo de espacio de estados (SSM) selectivo de 370 millones de parámetros publicado por el equipo de State Spaces. El autor del checkpoint, bajo el identificador `ikimyaii`, aplica una poda semi-estructurada del 80 % sobre las capas lineales internas de los bloques, empleando una variante de ADMM en dos fases denominada EHWS. El resultado conserva la arquitectura Mamba original y se carga con `transformers` estándar mediante `AutoModelForCausalLM`.

El interés del artefacto es metodológico más que de producto: documenta con detalle el procedimiento de poda (calibración con C4, fase local tipo ALPS, fase global ADMM con destilación de conocimiento) y publica tanto la perplejidad como las métricas zero-shot del modelo denso y del podado, lo que permite cuantificar la degradación introducida por la compresión. El entrenamiento completo requirió 2,77 horas en una única A100 de 40 GB.

No se trata de un modelo listo para producción: la perplejidad en WikiText-2 pasa de 14,33 a 45,00 y la precisión media zero-shot cae de 0,4390 a 0,3737. Es un punto de referencia útil para quienes investigan compresión de SSM y buscan reproducir o comparar técnicas de poda semi-estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (SSM selectivo, transformer-free) |
| Parametros totales | 423.003.136 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Mamba-370M opera de forma nativa con secuencias largas) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Mamba-370M, un SSM selectivo que sustituye la atención por recurrencia con parámetros dependientes de la entrada, lo que le permite modelar dependencias de largo alcance con coste lineal en la longitud de secuencia. La poda se aplica exclusivamente a las capas lineales `in_proj`, `x_proj` y `out_proj` de cada bloque; `dt_proj` se mantiene denso (aproximadamente el 2 % de los pesos lineales de cada bloque), igual que `conv1d`, `A_log`, `D`, los embeddings y `lm_head`. La dispersión es semi-estructurada por filas: cada fila de cada capa podada conserva el mismo número de pesos (el 20 % superior), con una dispersión medida de 0,7998.

El procedimiento consta de dos fases. La primera es local, de estilo ALPS: cada capa se poda al 70 % minimizando el error de reconstrucción `||(W - W0) X||^2`, con matrices de Hessian calculadas sobre secuencias de calibración de C4. La segunda es global: ADMM sobre la pérdida de entropía cruzada del modelo completo más destilación de conocimiento, con paso Z basado en Diag(H), 128 rondas de 32 pasos, learning rate 0,0006, lambda constante de 0,01, beta2 de Adam 0,95 y semilla 0. Se usan las 32.768 secuencias de entrenamiento de C4 de 2.048 tokens del código oficial de ELSA, tokenizadas con el tokenizador del propio modelo y vistas una sola vez. El proceso completo, incluida la evaluación, consumió 2,77 horas en una A100 de 40 GB.

## Capacidades

- Generación de texto autoregresiva mediante `AutoModelForCausalLM.from_pretrained(...)` con `transformers`.
- Modelado de lenguaje causal con contexto potencialmente largo gracias a la naturaleza SSM del modelo base.
- Evaluación zero-shot en tareas de razonamiento y comprensión (arc_challenge, arc_easy, boolq, hellaswag, openbookqa, rte, winogrande).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Investigación en compresión de modelos: sirve como referencia reproducible para comparar técnicas de poda semi-estructurada sobre arquitecturas SSM, dado que el autor publica configuración completa en `results.json`.
- Estudio de la degradación por poda: permite medir empíricamente la relación entre dispersión (80 %) y pérdida de calidad en perplejidad y tareas zero-shot, con cifras del modelo denso y del podado.
- Experimentos de destilación de conocimiento: el pipeline ADMM con KD sobre el modelo denso puede reutilizarse como plantilla para otros SSM o tamaños.
- Prototipado académico de bajo coste: el checkpoint ocupa 1,7 GB y cabe en GPUs de consumo para pruebas de inferencia y análisis de activaciones.
- Análisis de estructuras de dispersión: útil para validar herramientas que explotan sparsity semi-estructurada (kernels dispersos, aceleradores específicos) sobre capas Mamba.
- Reproducción de pipelines de calibración: el uso de C4 con el tokenizador del modelo y la configuración ADMM documentada facilita replicar el experimento en otros checkpoints.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluación de ELSA, en bf16 (Mamba desborda en fp16). Ejecución única.

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (Mamba-370M) | 14,33 | 19,40 |
| Este modelo (80 % sparsity) | 45,00 | 38,37 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2517 | 0,1997 |
| arc_easy | 0,5484 | 0,3965 |
| boolq | 0,6150 | 0,5358 |
| hellaswag | 0,3722 | 0,2905 |
| openbookqa | 0,1960 | 0,1540 |
| rte | 0,5307 | 0,5271 |
| winogrande | 0,5588 | 0,5122 |
| Media | 0,4390 | 0,3737 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 1,7 GB en safetensors, por lo que en bf16 requiere aproximadamente 1,7 GB de pesos más overhead de activaciones y caché; en fp32 rondaría 1,7 GB de pesos (423 M parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 en inferencia básica; una A100 de 40 GB fue suficiente para el pipeline completo de poda y evaluación.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más, con margen amplio.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (soporte nativo indicado por el autor); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Dado que Mamba desborda en fp16, debe usarse bf16.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Mamba-370M, 80 % sparsity) | 423 M | no disponible | no disponible | Hugging Face | Perplejidad WT2 45,00; media zero-shot 0,3737 |
| state-spaces/mamba-370m-hf (denso) | ~370 M | no disponible | no disponible | Hugging Face | Perplejidad WT2 14,33; media zero-shot 0,4390 |
| Alternativas de poda de Mamba | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Degradación sustancial de calidad: la perplejidad en WikiText-2 se multiplica por más de tres (14,33 a 45,00) y la media zero-shot cae 6,5 puntos.
- La poda es semi-estructurada por filas, no uniforme global; el patrón puede no ser compatible con todos los kernels dispersos de terceros.
- El modelo base Mamba desborda en fp16; es obligatorio usar bf16 para evitar inestabilidad numérica.
- Resultados de una sola ejecución (semilla 0), sin intervalos de confianza ni réplicas.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento multilingüe.
- Licencia no disponible: no puede confirmarse el uso comercial; debe verificarse la licencia del modelo base `state-spaces/mamba-370m-hf` antes de cualquier despliegue.
- Riesgo de alucinación no evaluado específicamente; la caída en tareas de comprensión sugiere mayor propensión a errores factuales.
- No hay pipeline declarado en Hugging Face ni métricas de producción (latencia, throughput) publicadas.
- Repo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-EHWS-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
