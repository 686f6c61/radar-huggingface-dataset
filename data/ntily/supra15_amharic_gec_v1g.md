# ntily/supra15_amharic_gec_v1g

## Resumen

`supra15_amharic_gec_v1g` es un modelo de corrección gramatical (GEC, *grammatical error correction*) para amhárico, desarrollado por el usuario ntily. Se trata de un modelo causal de tipo Llama con 51,8 millones de parámetros, obtenido por ajuste fino supervisado (SFT causal) del checkpoint base `ntily/supra15_amharic_fineweb2_clm_v1g` sobre el conjunto de datos `hayuLabs/Amh_gec_v1`. El modelo se presenta como la contraparte amhárica del sistema GEC `supra15` para oromo, y `v1g` es, según el autor, el mejor checkpoint de GEC amhárico que ha entrenado.

El modelo resuelve una tarea acotada y concreta: dado un texto en amhárico con errores superficiales (ortografía, concordancia, puntuación), devuelve la versión corregida. No está pensado como modelo de propósito general ni como asistente conversacional, sino como corrector especializado sobre prosa periodística y administrativa, y como línea base de investigación para modelos GEC amháricos de pequeño tamaño.

Su relevancia radica en dos factores. Por un lado, el amhárico (escritura ge'ez) está infrarrepresentado en el ecosistema de modelos abiertos, y un corrector de 51,8 M de parámetros que cabe en una GPU de consumo o incluso en CPU resulta práctico para despliegues de bajo coste. Por otro, el autor publica una evaluación comparativa detallada frente a alternativas de hayuLabs (v4 basada en mT5-small y v5.5 basada en T5), lo que permite situar el modelo con precisión en su nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only; hidden 512, 12 capas, 8 cabezas / 4 KV, FFN 1408, embeddings atados) |
| Parametros totales | 51.786.240 (51,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 5.120 posiciones |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor recomienda fp16 en GPU para inferencia) |
| Idiomas soportados | am (amhárico, escritura ge'ez) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only causal con configuración compacta: dimensión oculta de 512, 12 capas, 8 cabezas de atención con 4 cabezas KV (GQA), FFN de 1408 y embeddings atados. El vocabulario es un BPE byte-level de 32k entrenado sobre FineWeb-2 amhárico. El modelo base se obtuvo por continuación de preentrenamiento causal en amhárico (`supra15_amharic_fineweb2_clm_v1g`, que a su vez continúa a `v1f` con 15.200 pasos adicionales, optimizador nuevo y decaimiento coseno).

El ajuste fino para GEC usa un planteamiento de SFT causal con prompt `gec: {noisy}` y respuesta `{clean}</s>`, calculando la pérdida solo sobre los tokens de respuesta. Los datos proceden del split de entrenamiento de `hayuLabs/Amh_gec_v1`: 2,24 M filas que quedan en 2,08 M tras deduplicación exacta de pares. La caché empleada en entrenamiento es un 98,65 % sintética, un 0,31 % de diccionario y un 1,04 % real (21.662 pares reales únicos), tras aplicar un mínimo de 8 caracteres y deduplicación exacta. La validación se hizo sobre `val_real` (1.983 pares). La receta: lr 5e-5 lineal con 3 % de warmup, batch 64, 58.400 pasos, en una única GPU Kaggle T4. La mejor pérdida de validación fue 1,4465 en el paso 56.400.

Una innovación relevante y poco habitual es la convención de tokenización: el prefijo y la frase ruidosa se codifican por separado (`encode("gec: ")` + `encode(noisy)`), exactamente como en entrenamiento, y debe replicarse en inferencia. Además, el repo incluye un *wrapper* (`gec_amharic_infer.py`) con una guarda de decodificación: si una búsqueda por haces alcanza `max_new_tokens` sin emitir EOS, esa fila se redecodifica de forma greedy y se recorta una posible repetición periódica final. La guarda se activa en 1 de las 2.995 filas de test y no altera el resto de predicciones.

## Capacidades

- Corrección gramatical y ortográfica de texto en amhárico (GEC): concordancia, puntuación, formas verbales y errores superficiales.
- Generación de texto causal en amhárico, heredada del preentrenamiento del modelo base.
- Corrección por lotes mediante `correct_batch` en el wrapper incluido.
- Inferencia con búsqueda por haces (4 haces en la evaluación publicada) y decodificación greedy como respaldo.
- Ejecución automática en `cuda`, `mps` o `cpu` mediante el wrapper.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al amhárico; no se documenta soporte de otras lenguas.

## Casos de uso

- Corrección de prosa periodística en amhárico: el modelo está entrenado y evaluado sobre noticias y texto administrativo, por lo que es adecuado para preprocesar artículos antes de su publicación y reducir errores superficiales.
- Normalización de texto administrativo: corrección de comunicados y formularios oficiales en amhárico con un modelo de 51,8 M que puede ejecutarse en CPU, sin depender de infraestructura GPU.
- Preprocesado para pipelines de NLP en amhárico: limpiar corpus ruidosos antes de alimentar modelos mayores de traducción, búsqueda o clasificación, aprovechando su bajo coste computacional.
- Corrección por lotes en entornos de edición: el wrapper `correct_batch` permite procesar colecciones de frases de forma eficiente en una sola GPU de consumo.
- Línea base de investigación: referencia reproducible (receta, datos y evaluación publicados) para comparar nuevos modelos GEC amháricos de tamaño pequeño.
- Herramienta integrada en editores o correctores de texto para amhárico: al caber en memoria en fp16 (unos 100 MB de pesos), puede desplegarse en servicios ligeros o en el propio dispositivo.
- Filtrado de calidad de datasets: detectar y corregir pares ruidosos en la construcción de corpus amháricos, dado que el modelo se entrenó precisamente sobre pares sintéticos de este tipo.

## Benchmarks y rendimiento

Métricas calculadas por el autor sobre los splits de test de `hayuLabs/Amh_gec_v1`, en fp16, con búsqueda por haces de 4 para su modelo y la configuración propia de cada línea base (v4: mT5-small, 4 haces, max_length 192, no-repeat-3; v5.5: T5, greedy, max_length 192, no-repeat-3).

**test_synth (n = 1.995)**

| Modelo | CER ↓ | Reducción de CER | EM ↑ | Texto limpio preservado ↑ |
|---|---|---|---|---|
| Línea base ruidosa | 5,86 % | — | — | — |
| v1 (52k, base v1f) | 2,80 % | 52,3 % | 46,7 % | 80,9 % |
| v1r (adaptado a real) | 3,87 % | 34,0 % | 38,5 % | 78,1 % |
| **v1g (58.400 pasos)** | **2,71 %** | **53,9 %** | **47,4 %** | **84,7 %** |
| v4 (hayuLabs) | 3,33 % | 43,2 % | 38,6 % | 73,8 % |
| v5.5 (hayuLabs) | 3,02 % | 48,6 % | 39,3 % | 79,8 % |

**test_real (n = 1.000)**

| Modelo | CER ↓ | Reducción de CER | EM ↑ |
|---|---|---|---|
| Línea base ruidosa | 13,65 % | — | — |
| v1 (52k, base v1f) | 13,01 % | 4,7 % | 0,4 % |
| v1r (adaptado a real) | 12,61 % | 7,7 % | 0,8 % |
| **v1g (58.400 pasos)** | **12,98 %** | **4,9 %** | **0,1 %** |
| v4 (hayuLabs) | 10,96 % | 19,7 % | 6,3 % |
| v5.5 (hayuLabs) | 11,91 % | 12,7 % | 4,4 % |

CER agrupado sobre ambos splits: 6,14 % para v1g, 6,21 % para v1, 6,79 % para v1r, 5,88 % para v4 y 5,99 % para v5.5. El autor advierte que esta métrica mezcla dos distribuciones de error y debe tratarse como resumen secundario. Sin la guarda de decodificación, el mismo checkpoint obtiene 3,15 % en `test_synth` y 6,43 % agrupado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 100 MB de pesos en fp16 (51,8 M de parámetros), más overhead de activaciones y caché KV para 5.120 posiciones; en la práctica cabe con holgura en cualquier GPU con 1-2 GB libres.
- GPU recomendadas: el modelo se entrenó en una única Kaggle T4, por lo que cualquier T4, L4, RTX 3060/4060 o superior es suficiente; también funciona en A100/H100 aunque no los aprovecha.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con al menos 2 GB de VRAM; también es viable en CPU y en Apple Silicon vía MPS (el wrapper selecciona `cuda`/`mps`/`cpu` automáticamente).
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (recomendado fp16 en GPU), el wrapper oficial `gec_amharic_infer.py`, y en principio cualquier runtime compatible con safetensors; no se documentan conversiones a GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tamaño del modelo y la decodificación con 4 haces y hasta 256 tokens nuevos sugieren latencias del orden de decenas de milisegundos por frase en GPU de consumo, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER test_synth | CER test_real | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **supra15_amharic_gec_v1g** | 51,8 M | 5.120 | 2,71 % | 12,98 % | no disponible | Hugging Face |
| v4 (hayuLabs) | mT5-small (no disponible el conteo exacto) | no disponible | 3,33 % | 10,96 % | no disponible | Hugging Face |
| v5.5 (hayuLabs) | T5 (no disponible el conteo exacto) | no disponible | 3,02 % | 11,91 % | no disponible | Hugging Face |
| v1 / v1r (ntily, predecesores) | 52k | no disponible | 2,80 % / 3,87 % | 13,01 % / 12,61 % | no disponible | Hugging Face |

En texto sintético, v1g supera a todas las alternativas en CER, EM y preservación de texto limpio. En texto real, en cambio, v4 (hayuLabs) obtiene mejor CER (10,96 % frente a 12,98 %) y mejor EM (6,3 % frente a 0,1 %), lo que refleja el sesgo sintético del corpus de entrenamiento de v1g.

## Limitaciones y advertencias

- La caché de entrenamiento es un 98,65 % sintética y solo un 1,04 % real; en texto real el CER sigue por detrás del modelo mayor v4 de hayuLabs (12,98 % frente a 10,96 %).
- La convención del corpus dorado `test_real` `ው → ዉ` está infrarrepresentada en entrenamiento: el modelo emite `ዉ` mucho menos de lo que lo hace el dato dorado.
- Fallos de decodificación poco frecuentes: aproximadamente 1 de cada 2.000 frases sintéticas desencadena un bucle de repetición con búsqueda por haces que repite una cláusula hasta el límite de tokens. El wrapper incluido lo detecta y repara; si se llama directamente a `model.generate`, debe añadirse el mismo respaldo greedy al alcanzar el tope.
- Con 51,8 M de parámetros el conocimiento del mundo es limitado: corrige la forma superficial en lugar de reescribir el significado.
- Riesgo de alucinación y de reescrituras no solicitadas en entradas muy alejadas de la distribución de entrenamiento (prosa periodística y administrativa).
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial sin consultar al autor.
- Solo soporta amhárico; no se documentan otras lenguas ni capacidades multimodales o de agente.
- La convención de tokenización por partes (`encode("gec: ")` + `encode(noisy)`) debe replicarse exactamente; usar otra tokenización degrada la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ntily/supra15_amharic_gec_v1g
- Modelo base: https://huggingface.co/ntily/supra15_amharic_fineweb2_clm_v1g
- Script de inferencia incluido: https://huggingface.co/ntily/supra15_amharic_gec_v1g/blob/main/gec_amharic_infer.py
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/hayuLabs/Amh_gec_v1
- Predicciones y informe de evaluación: carpeta `eval/` del repositorio del modelo
