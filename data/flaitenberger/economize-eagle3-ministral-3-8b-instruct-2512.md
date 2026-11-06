# flaitenberger/economize-eagle3-Ministral-3-8B-Instruct-2512

## Resumen

El repositorio `flaitenberger/economize-eagle3-Ministral-3-8B-Instruct-2512` contiene una cabeza borrador (draft head) EAGLE-3 entrenada para acelerar la decodificacion especulativa del modelo `mistralai/Ministral-3-8B-Instruct-2512-BF16`. No es un modelo generativo autonomo: es un adaptador de 428M parametros que predice tokens candidatos que el modelo base verifica despues. Se distribuye bajo licencia Apache 2.0 y se carga mediante la libreria `economize` (version >= 0.4).

La pieza central es una unica capa decodificadora que lee los estados ocultos del modelo base en tres profundidades, los fusiona en un vector y lo combina con el embedding del ultimo token para predecir los siguientes tokens mediante su propia LM head sobre los 32768 tokens mas frecuentes del corpus de entrenamiento. Su MLP tiene anchura 14336. El checkpoint incluye solo los pesos del borrador, no los del modelo base.

La relevancia practica esta en el speedup medido: 1,59x de media en throughput de decodificacion frente a greedy plano del modelo base, con picos de 2,06x en matematicas y 1,72x en codigo, medido en una H100 en bf16 con CUDA graphs a batch size 1. Al ser un adaptador ligero (0,9 GB de repo) sobre un modelo de 8B, se puede integrar sin duplicar el coste de almacenamiento del modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EAGLE-3 draft head (una capa decodificadora con fusion de estados ocultos a tres profundidades, MLP de anchura 14336, LM head propia sobre 32768 tokens) |
| Parametros totales | 428M (solo el borrador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el borrador; el modelo base soporta el contexto que defina Ministral-3-8B-Instruct-2512 |
| Tipos de cuantizacion | no disponible (el checkpoint se usa en bf16; el modelo base admite las cuantizaciones que soporte) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `economize`) |

## Arquitectura y entrenamiento

El borrador es una cabeza EAGLE-3: una unica capa decodificadora que toma los estados ocultos del modelo base en tres profundidades, los fusiona en un unico vector y lo concatena con el embedding del ultimo token. Sobre esa representacion, una MLP de anchura 14336 y una LM head restringida a los 32768 tokens mas frecuentes del corpus de entrenamiento predicen los siguientes tokens. Cada borrador se verifica con el modelo base, de modo que la decodificacion greedy devuelve exactamente la salida greedy del modelo base y el muestreo especulativo (`verifier="rejection"`) sigue su distribucion de muestreo.

El entrenamiento se realizo con la libreria `economize` sobre respuestas generadas por el propio modelo base (revision `f6fae9795746f63c9be8344932f01275f3c63734`), usando vLLM 0.30.0 en bf16 con decodificacion greedy, hasta 2048 tokens de prompt y 2048 tokens nuevos. El pool de prompts consta de 292.212 entradas procedentes de fuentes como UltraChat, ShareGPT y Magicoder-OSS-Instruct, tras filtrar vacios, duplicados exactos y solapamientos de 13-gramas con los conjuntos de evaluacion. El split de entrenamiento usa los primeros 28.644 registros (31,4M tokens tras truncar a 2048 tokens por registro); los ultimos 128 registros quedan reservados para evaluacion. De esos registros, 4.366 se generaron con modo thinking activado y 4.152 alcanzaron el limite de 2048 tokens. Los prompts promedian 175 tokens y las respuestas 942 (mediana 775).

## Capacidades

- Aceleracion de decodificacion especulativa sobre `Ministral-3-8B-Instruct-2512-BF16` mediante la libreria `economize`.
- Prediccion de multiples tokens por pase del modelo base (hasta 4 borradores por pase con `cycle_length=5`).
- Preservacion de la distribucion del modelo base: greedy exacto y muestreo por rechazo equivalente al del verificador.
- Configuracion de decodificacion ajustable mediante `economize.DecodeConfig(...)`.
- Integracion con modelos base ya cargados mediante `economize.load(base, ...)`.
- No soporta tool calling, agentes, vision, audio ni capacidades multimodales por si mismo: hereda las del modelo base a traves de la verificacion.

## Casos de uso

- Servicio de chat en produccion: reducir la latencia por token en despliegues de Ministral-3-8B-Instruct-2512, con un speedup medido de 1,34x en cargas conversacionales (MT-Bench, AlpacaEval, Arena-Hard), util para abaratar coste por peticion en GPUs H100.
- Generacion de codigo asistida: el speedup de 1,72x en HumanEval, MBPP y LiveCodeBench lo hace adecuado para autocompletado en IDE o pipelines de CI/CD donde el modelo base ya se usa, sin cambiar la calidad de la salida.
- Razonamiento matematico interactivo: 2,06x de aceleracion en GSM8K, MATH-500, AIME 2024/2025 y AMC 2023 permite servir tutores o asistentes de resolucion de problemas con menor tiempo de respuesta.
- Resumen de documentos: 1,19x en CNN/DailyMail; util en pipelines por lotes donde el cuello de botella es la decodificacion y se busca reducir el tiempo total de proceso.
- Procesamiento de contexto largo: 1,36x en LongBench, aplicable a tareas de analisis de documentos extensos donde el modelo base ya se emplea y se quiere amortizar el coste del prefill.
- Despliegue en infraestructura existente: al ser un adaptador de 0,9 GB, se puede incorporar a un stack que ya sirve Ministral-3-8B-Instruct-2512 sin duplicar el almacenamiento del modelo principal ni reentrenar el base.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para medir el impacto de EAGLE-3 frente a greedy plano en un mismo runtime.

## Benchmarks y rendimiento

Throughput de decodificacion relativo a greedy plano del modelo base en el mismo runtime, medido con economize 0.3.2 en una NVIDIA H100 en bf16 con CUDA graphs a batch size 1. Prompts de 8 ejemplos por conjunto, hasta 256 tokens nuevos.

| Ambito | Speedup | Tokens por pase del modelo base |
|---|---|---|
| Global | 1,59x | 2,20 |
| Chat | 1,34x | no disponible |
| Codigo | 1,72x | no disponible |
| Matematicas | 2,06x | no disponible |
| Resumen | 1,19x | no disponible |
| Contexto largo | 1,36x | no disponible |

Nota de fidelidad: en bf16, un pase de verificacion sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que tras un tiempo la salida puede diferir de la decodificacion bf16 plana. En la medicion, el 67% de las respuestas fueron identicas en los 256 tokens. En float32 la salida coincide exactamente con greedy plano.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 0,9 GB en bf16 (428M parametros); se suma a la VRAM del modelo base de 8B.
- VRAM del modelo base: no disponible en la informacion proporcionada; depende de la cuantizacion elegida para Ministral-3-8B-Instruct-2512.
- GPU recomendada segun la medicion: NVIDIA H100 (bf16, CUDA graphs, batch size 1). El entrenamiento del borrador se realizo en NVIDIA A100-SXM4-80GB.
- Compatibilidad con GPU de consumo: no disponible; el borrador en si es pequeno, pero el requisito dominante es el del modelo base.
- Opciones de despliegue: libreria `economize` (>= 0.4) con `economize.from_pretrained` o `economize.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: speedup de 1,59x global frente a greedy plano en el mismo runtime; no se publican valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Speedup publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| economize-eagle3-Ministral-3-8B-Instruct-2512 | Draft head EAGLE-3 | 428M | no disponible | 1,59x global (H100, bf16) | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Ministral-3-8B-Instruct-2512 (base) | LLM instruct | 8B | no disponible | 1x (referencia) | no disponible en la informacion | Hugging Face |
| Otros borradores EAGLE-3 de la coleccion economize | Draft head EAGLE-3 | no disponible | no disponible | no disponible | Apache 2.0 (segun repositorio) | Coleccion `economize-drafters` en Hugging Face |

No se dispone de datos de benchmarks de otros borradores EAGLE-3 comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar el modelo base `Ministral-3-8B-Instruct-2512-BF16` y la libreria `economize` >= 0.4.
- En bf16 la salida puede divergir de la decodificacion greedy plana por diferencias de redondeo en pases multi-token; solo en float32 coincide exactamente.
- La LM head del borrador esta restringida a los 32768 tokens mas frecuentes del corpus de entrenamiento; tokens fuera de ese vocabulario no pueden ser propuestos por el borrador (aunque el verificador puede corregir).
- El speedup es sensible al dominio: 1,19x en resumen frente a 2,06x en matematicas; cargas muy distintas a las evaluadas pueden rendir por debajo de lo publicado.
- Los numeros de speedup provienen de una unica ejecucion de timing en H100 a batch size 1; no se reportan intervalos de confianza ni resultados a otros batch sizes.
- Sin datos publicados de sesgos, alucinacion o comportamiento multilingue propios del borrador; estos dependen del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Hugging Face: https://huggingface.co/flaitenberger/economize-eagle3-Ministral-3-8B-Instruct-2512
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- GitHub de economize: https://github.com/Thiggel/economize
- PyPI: https://pypi.org/project/economize/
- Documentacion: https://thiggel.github.io/economize/
- Coleccion de borradores economize: https://huggingface.co/collections/flaitenberger/economize-drafters-6aeb7d0f6cae8de3208fd3e7
