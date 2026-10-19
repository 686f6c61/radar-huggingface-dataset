# Futurix-AI/FxAI-decision-model

## Resumen

FxAI Decision Model es un clasificador de decisiones experimental publicado por Futurix-AI sobre la arquitectura Qwen3.8-27B, un backbone multimodal de tipo transformer decoder. Su funcionamiento no es el de un modelo generativo: recibe un estado (texto o imagen), una pregunta y entre 2 y 255 opciones candidatas, y devuelve una distribución de probabilidad calibrada sobre esas opciones. El pipeline declarado en HuggingFace es `text-classification` y la salida es una decisión tipada (`choice`, `noul` o `score`), no texto libre.

El repositorio contiene un checkpoint fusionado completo de 54,4 GB: backbone en BF16, el bloque de lenguaje final (capa 63) ajustado a rango completo en FP32 y una cabeza de decisión de 255 vías también en FP32. Se han entrenado 373.560.832 parámetros (aproximadamente el 1,4 % de los 26,1 mil millones totales); no se emplean LoRA ni adaptadores PEFT, pero el autor aclara explícitamente que tampoco es un ajuste de todos los pesos del modelo. El contexto útil a través de la interfaz de decisión es de 8.192 tokens y la evaluación se ha hecho principalmente en inglés.

Su interés actual es que propone una interfaz autocontenida para enrutado, clasificación de intención, selección de herramientas y puntuación estructurada, con una puntuación pública de 62,26 en la suite pública Decision Index 0.3. El propio autor lo mantiene como experimental y desaconseja su uso en decisiones de alto riesgo sin evaluación específica y revisión humana.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.8-27B) con atención completa no causal en las capas de atención completa, pooling de último token y cabeza de decisión de 255 vías |
| Parámetros totales | 26.085.330.160 (26,1 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Parámetros ajustados | 373.560.832 (bloque de texto final, capa 63, y readout de decisión, en FP32 a rango completo) |
| Longitud de contexto | 8.192 tokens a través de la interfaz de decisión incluida, con error explícito si se supera (sin truncado silencioso) |
| Opciones por pregunta | 2 a 255, mediante el SDK de decisión |
| Tipos de cuantización | No disponible: solo se publica el checkpoint en BF16 con tensores de reemplazo en FP32; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas |
| Idiomas soportados | Inglés (evaluación principalmente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio de 54,4 GB) más runtime propio `futurix_decision/` |
| Temperatura de calibración | 1,00874176 (no reajustada en esta ejecución) |
| Tipo de salida | Probabilidades calibradas por opción; decisiones `choice`, `noul` y `score` |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.8-27B, que combina capas de atención completa con atención no causal y un codificador visual. Sobre ese backbone, Futurix-AI sustituye la parte final: el bloque de lenguaje 63 y una cabeza de decisión de 255 vías se reconstruyen en FP32 y se ajustan a rango completo, mientras el resto de bloques de lenguaje y todo el subsistema de visión permanecen congelados. La inferencia aplica una máscara de atención completa no causal y pooling sobre el último token para producir la distribución sobre las opciones, con una temperatura de calibración fija de 1,00874176.

El ajuste se hizo con datos exclusivamente de entrenamiento: 3.000 filas de BANKING77 (PolyAI, CC BY 4.0), 1.118 filas de ARC-Challenge y 2.251 de ARC-Easy (AI2 ARC, CC BY-SA 4.0) y 3.000 filas sintéticas `yuri_v3` de SargeDev/jev-distill-corpus-v3 (Apache-2.0), lo que suma unas 9.369 muestras. La selección del checkpoint (selection step 192) se realizó con datos de desarrollo separados: 385 filas retenidas de BANKING77, 299 de validación de ARC-Challenge, 570 de validación de ARC-Easy y 512 filas sintéticas. No se documentan en la información disponible fases de RLHF o DPO, ni el desglose completo de tokens de entrenamiento del backbone original.

## Capacidades

- Clasificación de decisión tipada: `choice` para elegir entre 2 y 255 opciones, `noul` para decisiones booleanas y `score` para puntuar en un rango `min_score`–`max_score`.
- Salida de probabilidad calibrada por opción, lo que permite ranking de candidatos y umbrales de confianza en lugar de texto libre.
- Soporte de descripciones de candidatos (`candidate_descriptions`) para desambiguar etiquetas cortas o ambiguas.
- Entrada multimodal: el runtime admite imágenes con límite configurable (`max_image_pixels`, por ejemplo 512×512), aunque la precisión con imagen no se ha evaluado de forma independiente.
- Contexto de 8.192 tokens con rechazo explícito de entradas más largas, útil en pipelines donde el truncado silencioso es inaceptable.
- Enrutado y selección de herramientas: la model card cita `tool selection` y `routing` como usos previstos.
- No incluye tool calling generativo, razonamiento multi-paso autónomo ni modo *thinking*: no emite llamadas a funciones ni cadenas de razonamiento, que deben orquestarse externamente.
- Capacidades multilingües: no documentadas; solo se ha evaluado en inglés.

## Casos de uso

- Enrutado de tickets a equipos: el ejemplo oficial usa un estado como "me han cobrado dos veces y necesito un reembolso" frente a las opciones *billing*, *support* y *sales*; el modelo devuelve la probabilidad de cada cola y permite fijar un umbral para escalar a revisión humana.
- Clasificación de intención en banca: el ajuste con 3.000 filas de BANKING77 (77 intenciones) lo hace adecuado para etiquetar consultas de clientes dentro de un rango acotado de categorías conocidas.
- Selección de herramienta en un agente: dado el estado de la conversación y la descripción de N herramientas disponibles, obtener la herramienta más probable y una puntuación de confianza antes de ejecutar la llamada.
- Puntuación estructurada de calidad: la decisión `score` con rango 0–5 permite filtrar respuestas generadas por otro modelo en la construcción de datasets o en evaluación automática.
- Verificación booleana en validación de datos: la decisión `noul` responde preguntas del tipo "¿está pagada esta factura?" sobre registros estructurados, con salida probabilística registrable.
- Evaluación de opción múltiple: el ajuste con ARC-Challenge y ARC-Easy lo orienta a preguntas de ciencia con 4–5 alternativas, útil para *harness* internos de evaluación.
- Triaje de documentos escaneados: el runtime acepta imágenes (por ejemplo, un justificante o una factura) y una pregunta de clasificación; requiere validación propia porque la precisión visual no está evaluada.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (suite pública) | 62,26 | Puntuación pública declarada por el autor; no es el *Full score* privado ni un puesto en el *live board* |
| MMLU, HumanEval, GSM8K y similares | No disponible | No se han publicado resultados de benchmarks en la información disponible |

No se han publicado resultados de benchmarks de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa unos 54,4 GB; solo los pesos en BF16 de los 26,1 B de parámetros suponen aproximadamente 52 GB. El autor recomienda un mínimo de 64 GiB de VRAM para entradas de texto cortas y 80–96 GiB para tener margen.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con soporte de bfloat16 y 80 GB o más. No cabe en GPUs de consumo: una RTX 4090 con 24 GB no es viable, ni siquiera repartiendo el modelo, porque no se publican cuantizaciones.
- Entorno: Linux, Python 3.12 y GPU NVIDIA CUDA con soporte de bfloat16. La inferencia en CPU está soportada técnicamente por el cargador incluido, pero el autor la describe como poco práctica.
- Despliegue: el modelo no funciona con `transformers.AutoModel` ni con el widget de HuggingFace (deshabilitado, `inference: false`). Requiere clonar el repositorio con Git LFS e instalar el runtime `futurix_decision` incluido, que restaura los tensores FP32, la máscara no causal y el pooling de último token. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Rendimiento |
|---|---|---|---|---|---|
| FxAI Decision Model | 26,1 B totales; 373,6 M ajustados | 8.192 tokens | Apache-2.0 | safetensors + SDK propio `futurix_decision` | 62,26 en Decision Index 0.3 (suite pública) |
| Qwen3.8-27B (backbone base citado por el autor) | 27 B (denominación del autor) | No disponible | No disponible | No disponible | No disponible |
| Clasificador encoder supervisado (por ejemplo, ajuste de BERT o DeBERTa sobre BANKING77) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparables entre estas opciones en la información proporcionada. La diferencia funcional relevante es que FxAI devuelve una distribución calibrada sobre un conjunto dinámico de 2 a 255 opciones, mientras que un clasificador encoder requiere una cabeza con clases fijas y reentrenamiento para cambiar el conjunto de etiquetas.

## Limitaciones y advertencias

- Modelo experimental: el autor desaconseja explícitamente su uso en decisiones autónomas de alto riesgo, control de seguridad crítica, consejo médico o legal, o sin evaluación específica y revisión humana.
- Solo inglés evaluado; no hay datos de rendimiento en castellano ni en otros idiomas.
- Ventana de 8.192 tokens: insuficiente para documentos largos o historiales de conversación extensos.
- No es un modelo generativo: no produce texto, no hace tool calling generativo y no razona en varios pasos por sí mismo.
- Integración no estándar: `AutoModel` de transformers no devuelve probabilidades de decisión; es obligatorio usar el SDK incluido, lo que complica el despliegue en plataformas gestionadas.
- Discrepancia entre la etiqueta de arquitectura del repositorio (`qwen3_5`) y el backbone citado en la model card (`Qwen/Qwen3.8-27B`); conviene verificar la correspondencia exacta antes de reutilizar el checkpoint.
- La temperatura de calibración (1,00874176) no se reajustó para esta ejecución, por lo que la calibración observada puede no transferirse a dominios nuevos.
- El subsistema de visión está presente pero congelado y sin evaluación independiente de precisión o seguridad.
- El 62,26 corresponde a la suite pública Decision Index 0.3; no es un resultado privado ni un ranking en vivo. No hay resultados de MMLU, HumanEval, GSM8K ni de conjuntos estándar de clasificación.
- Riesgo de alucinación acotado por el formato de salida, pero posible mala calibración fuera de distribución: una probabilidad alta no garantiza corrección.
- No se documentan análisis de sesgo ni evaluaciones de robustez en la información disponible.
- Licencia del modelo Apache-2.0 (permite uso comercial), pero los datos de entrenamiento incluyen ARC bajo CC BY-SA 4.0 y BANKING77 bajo CC BY 4.0: conviene revisar obligaciones de atribución y *share-alike* antes de un despliegue comercial.
- Repositorio con 0 descargas y 0 *likes* en el momento de la consulta: sin validación externa de la comunidad.

## Enlaces

- [HuggingFace: Futurix-AI/FxAI-decision-model](https://huggingface.co/Futurix-AI/FxAI-decision-model)
- [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (backbone citado en la model card)
- [BACKGROUND.md](https://huggingface.co/Futurix-AI/FxAI-decision-model/blob/main/BACKGROUND.md) (contexto de la release y atribuciones, referenciado en la model card)
- [PolyAI-LDN/task-specific-datasets](https://github.com/PolyAI-LDN/task-specific-datasets) (origen de BANKING77, CC BY 4.0)
- [allenai/ai2_arc](https://huggingface.co/datasets/allenai/ai2_arc) (ARC-Challenge y ARC-Easy, CC BY-SA 4.0)
- [SargeDev/jev-distill-corpus-v3](https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3) (corpus sintético `yuri_v3`, Apache-2.0)

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: únicamente definiciones de diccionario del término inglés "practice", sin relación con FxAI Decision Model.
