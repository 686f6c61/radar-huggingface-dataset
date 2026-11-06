# Remek/basal-omni-1.0-mini-MLX

## Resumen

basal-omni-1.0-mini-MLX es un port a MLX en cuantización de 8 bits del modelo basal-omni-1.0-mini, desarrollado por Remek (Remigiusz Kinas) y orientado a la toma de decisiones tipadas ("typed decisions") en polaco e inglés. No es un modelo conversacional de propósito general: se trata de una capa de decisión construida sobre Gemma 4 E4B que responde a preguntas de elección entre opciones (hasta 255), con calibración explícita de la confianza. Esta versión concreta está pensada para Apple Silicon mediante la librería MLX y el motor de inferencia propio del autor, `basal-serve`.

El modelo resuelve un problema acotado pero relevante en producción: sustituir clasificadores ad hoc y heurísticas por un modelo único que devuelve una opción entre varias con una probabilidad calibrada, de modo que el sistema pueda decidir automáticamente solo cuando el error esperado está por debajo de un umbral (1 % o 5 %). El port mantiene la API de decisión tipada del modelo bf16 original y añade su propia calibración ajustada sobre los readouts de esta cuantización.

Con 7.463.013.376 parámetros totales y un peso de repositorio de 8,6 GB, esta variante es exclusivamente de texto: los codificadores de imagen y audio del modelo base no están incluidos en la carpeta. La licencia es Apache 2.0 y el modelo se marca explícitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E4B), con atención global y rotatoria; solo el decodificador de texto |
| Parametros totales | 7.463.013.376 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64 (capas lineales del decodificador y tabla de embeddings por capa); token embeddings y normas en bf16 |
| Idiomas soportados | pl, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 8-bit; repositorio de 8,6 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E4B, un transformer decoder-only. El port se generó con el conversor de mlx-lm 0.32.2 (carga, cuantización y guardado) aplicado sobre la versión bf16: cuantización afín de 8 bits con group size 64 para las capas lineales de los bloques del decodificador y para la tabla de embeddings por capa de Gemma 4 E4B. Los token embeddings —que también actúan como cabeza de salida desde la que se lee la decisión, en fp32— y las normas permanecen en bf16. mlx-lm conserva únicamente el decodificador de texto, por lo que los codificadores de imagen y audio quedan fuera. Los ajustes de atención rotatoria y global se escriben en `config.json` en las claves que lee mlx-lm.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable no está en el entrenamiento sino en el protocolo de decisión: el modelo no genera texto libre, sino que se lee una decisión tipada desde la cabeza de salida, con temperaturas por tipo y por bucket, y umbrales certificados para objetivos de error del 1 % y del 5 %. El port incluye `CALIBRATION.mlx.json`, ajustado sobre los readouts de esta cuantización (con `--mode mlx`, un único orden de opciones y cada segundo ítem de cada split), y conserva `CALIBRATION.json` del modelo bf16. La calibración se puede reajustar con datos etiquetados propios mediante `basal-calibrate`. La tokenización y el renderizado de prompts coinciden exactamente con la release bf16 (2.000 de 2.000 prompts de desarrollo verificados).

## Capacidades

- Toma de decisiones tipadas entre 2 y 255 opciones, con tipos de pregunta `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificación con probabilidad calibrada y umbrales de error configurables (1 % y 5 %).
- Decisión automática selectiva: con la calibración incluida, al 1 % de error objetivo se decide automáticamente el 33,8 % de las decisiones (error observado 0,4 %); al 5 %, el 73,9 % (error observado 3,4 %).
- Soporte de tool calling y de acciones estructuradas a través de los tipos `act` y `tool`.
- Capacidades multilingües limitadas a polaco e inglés.
- Solo texto: no procesa imágenes ni audio en esta carpeta.
- No es un modelo de generación libre: la salida se interpreta como una decisión sobre un conjunto de opciones.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar cada consulta entrante en una de las categorías del sistema (facturación, incidencias, cancelaciones, etc.) usando el tipo `choice`, con umbral al 5 % para derivar automáticamente los casos claros y enviar a revisión humana el resto.
- Moderación de contenido en polaco e inglés: usar `multi` para asignar varias etiquetas simultáneas a un texto y aplicar el umbral de error del 1 % en las categorías de mayor riesgo.
- Extracción de campos estructurados de documentos: con `score` y `choice`, decidir valores de campos discretos (tipo de contrato, estado, categoría fiscal) en pipelines de digitalización, dejando la aritmética exacta al código.
- Selección de herramienta en un agente: con el tipo `tool`, elegir qué función invocar entre un catálogo de hasta 255 opciones, aprovechando la calibración para no invocar herramientas cuando la confianza es insuficiente (`noul`).
- Triaje en atención al cliente automatizada: decidir la siguiente acción del flujo (`act`) sobre el estado de la conversación, con latencia de 173 ms por pregunta en un M4 Pro y 474 ms para cinco preguntas sobre un mismo estado.
- Validación en local en equipos de desarrollo con Mac: servir el modelo con `basal-serve --mode mlx` en un Mac de 24 GB de memoria unificada para prototipar clasificadores calibrados sin GPU dedicada.
- Control de calidad en procesos internos: usar los umbrales certificados para definir políticas de autoaprobación (por ejemplo, validación de formularios) con una tasa de error medida y auditable.

## Benchmarks y rendimiento

| Metrica | Valor | Umbral (gate) |
|---|---|---|
| Acuerdo con bf16 (2-10 opciones) | 0,9856 | >= 0,9161 |
| Acuerdo donde bf16 tiene margen >= 0,2 | 0,9992 | >= 0,9858 |
| Diferencia de accuracy frente a bf16 | +0,31 pt | dentro de 1 punto |
| ECE | -0,0000 | <= +0,01 |
| Decisiones/s (M4 Pro, 8 en vuelo) | 0,73 | no disponible |
| Latencia mediana (1 pregunta) | 173 ms | no disponible |
| Latencia mediana (5 preguntas, un estado) | 474 ms | no disponible |

El acuerdo global sobre las 5.303 decisiones medidas (hasta 255 opciones) es de 0,9847. El modelo base bf16 reporta un resultado de 0,769 en Werdykt v1 (conjuntos en polaco e inglés); esta carpeta no se evalúa por separado en esos benchmarks. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

## Requisitos de hardware

- Memoria: los pesos ocupan 8,6 GB de memoria unificada; los estados largos requieren memoria adicional.
- Plataforma: Apple Silicon exclusivamente (brazo nativo, Python 3.11 o superior; el terminal no debe ejecutarse bajo Rosetta).
- GPU recomendadas: Apple M4 Pro con 24 GB es la configuración medida por el autor; no se documentan requisitos para GPU NVIDIA en esta variante (el modelo bf16 se sirvió en una RTX PRO 6000 con CUDA).
- Cabe en GPU de consumo Apple con al menos 16-24 GB de memoria unificada; no aplica a GPU de consumo NVIDIA por el formato MLX.
- Despliegue: motor `basal` 2.2.0 o superior con el extra `mlx`, lanzado con `basal-serve --model Remek/basal-omni-1.0-mini-MLX --mode mlx --port 8000`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 0,73 decisiones/s con 8 peticiones en vuelo en un M4 Pro de 24 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.0-mini-MLX (este) | 7,46 B | no disponible | Decisiones tipadas, solo texto, MLX 8-bit | Apache 2.0 | Hugging Face, motor basal |
| basal-omni-1.0-mini (bf16) | no disponible | no disponible | Decisiones tipadas con imagen y audio | Apache 2.0 | Hugging Face, motor basal |
| Gemma 4 E4B | no disponible | no disponible | Modelo base multimodal de texto | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de clasificación o decisión alternativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor recomienda validarlo sobre documentos propios antes de confiar en él.
- Solo texto en esta carpeta; para imagen y audio hay que usar el modelo bf16.
- La cuantización cambia algunas decisiones en los casos en los que el modelo no está seguro; las decisiones con alta confianza apenas varían.
- La aritmética exacta y la comparación de umbrales son un punto débil de las decisiones de una sola pasada: deben calcularse en código.
- La calibración incluida está ajustada para un único orden de opciones (el predeterminado).
- Las decisiones con consecuencias serias para personas deben revisarse por un humano.
- Idiomas limitados a polaco e inglés; no se documenta soporte de castellano.
- No se han publicado datos sobre sesgos conocidos ni sobre la longitud de contexto soportada.
- La licencia Apache 2.0 permite uso comercial, pero el carácter experimental del modelo desaconseja su uso en producción sin evaluación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Remek/basal-omni-1.0-mini-MLX
- Archivos del repositorio: https://huggingface.co/Remek/basal-omni-1.0-mini-MLX/tree/main
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.0-mini
- Motor de inferencia basal (GitHub): https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
