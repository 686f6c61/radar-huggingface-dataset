# anony-tmrft/tm-rft-onereason-8b-weights

## Resumen

TM-RFT sobre OneReason-8B es una familia de checkpoints de ajuste fino publicada por el usuario anónimo `anony-tmrft` como material complementario del artículo *Same Target, Different Paths: Learning from Multiple Reasoning Trajectories for Generative Recommendation*. El modelo parte de OneReason-8B-Pretrain (Competition), un transformer de 8.000 millones de parámetros orientado a recomendación generativa, y aplica una variante de ajuste por refuerzo supervisado (RFT) denominada Target-Masked RFT, que aprende de trayectorias de razonamiento autogeneradas cuyo identificador semántico (SID) final coincide exactamente con el objetivo.

La relevancia del modelo reside en su dominio: no es un asistente generalista, sino un generador de identificadores semánticos jerárquicos para recomendación de vídeo, producto, publicidad y directo. El checkpoint destacado, `tm-rft-k3`, mejora al SFT-only en las cuatro verticales evaluadas y en la métrica agregada Weighted Pass@64 (0,7893 frente a 0,6912). El repositorio incluye diez checkpoints completos con tokenizador y plantilla de chat, lo que permite reproducir la comparativa del artículo.

El repositorio pesa 167,8 GB, lo que refleja la inclusión de múltiples snapshots completos en precisión BF16. La licencia de los pesos no está disponible de forma directa: el código se publica bajo Apache 2.0, pero los pesos se rigen por un documento separado de licencia de pesos que debe consultarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de OneReason-8B-Pretrain) |
| Parametros totales | 8.000 millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (entrenamiento con secuencias empaquetadas de 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | codigo Apache 2.0; pesos sujetos a WEIGHTS_LICENSE.md (terminos no detallados) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8.000 millones de parámetros, ajustado a partir de OneReason-8B-Pretrain (Competition). Su tarea es generar identificadores semánticos jerárquicos (SID) para cuatro dominios de recomendación: vídeo, producto, publicidad y directo. Soporta dos modos de decodificacion: razonamiento explícito seguido de generación de SID, o decodificacion directa del SID, controlados mediante `enable_thinking=True/False` en la plantilla de chat.

El entrenamiento combina el dataset OneReasonSFT con trayectorias autogeneradas cuyo SID terminal coincide exactamente con el objetivo. TM-RFT mantiene supervisión completa sobre los ejemplos SFT ordinarios y, en las trayectorias añadidas, aprende de los tokens de razonamiento enmascarando la pérdida sobre el marcador de dominio final y los tres tokens de SID. El artículo reporta ajuste fino de parámetros completos durante dos épocas en BF16, con AdamW, batch global de 8, learning rate pico de 6e-6 con decaimiento coseno y 3 % de warmup, y secuencias empaquetadas de 32.768 tokens. El pool de aumento se construyó muestreando 32 trayectorias por petición sobre 36.833 peticiones con trazas de razonamiento SFT existentes; 3.366 peticiones produjeron una trayectoria coincidente con el objetivo y, tras deduplicacion exacta, quedaron 7.775 trayectorias antes de aplicar el tope `k` por petición.

## Capacidades

- Generación de identificadores semánticos jerárquicos (SID) para recomendación generativa en vídeo, producto, publicidad y directo.
- Razonamiento explícito previo a la generación del SID, activable mediante `enable_thinking=True`.
- Decodificacion directa del SID sin cadena de razonamiento, mediante `enable_thinking=False`.
- Generación de múltiples candidatos por petición (el protocolo de evaluación usa 32 candidatos por ruta de decodificacion).
- Soporte bilingüe inglés y chino.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Recomendación de vídeo en plataformas de contenido: el modelo genera SIDs jerárquicos que mapean a ítems del catálogo, con modo de razonamiento para peticiones ambiguas y modo directo para baja latencia.
- Recomendación de producto en comercio electrónico: genera candidatos de SID a partir de historial o consulta del usuario, evaluable con el protocolo oficial de OneReason.
- Publicidad dirigida: el checkpoint `tm-rft-k3` alcanza 17,72 de union U@64 en el dominio de ads, el mejor resultado de la tabla publicada, lo que lo hace adecuado para selección de creatividades o inventario publicitario.
- Recomendación en directo (live commerce): con 21,65 de union U@64, puede integrarse en sistemas de sugerencia en tiempo real durante emisiones.
- Investigación en ajuste por refuerzo supervisado: los diez checkpoints publicados (SFT-only, k=1 a k=8, Full-RFT, variantes normalizadas y de peso reducido) permiten reproducir y extender los experimentos del artículo.
- Evaluación comparativa de estrategias de RFT: el repositorio incluye el runner oficial de OneReason_Eval_Benchmark y scripts de puntuación para medir Pass@64 y U@64 por dominio.
- Generación de candidatos en pipelines de recuperación por dos etapas: el protocolo 32+32 combina candidatos de razonamiento y decodificacion directa y deduplica la unión antes de puntuar.

## Benchmarks y rendimiento

Resultados publicados en la Tabla 1 del artículo, sobre OneReason Evaluation Benchmark con protocolo oficial 32+32 (union U@64 en porcentaje):

| Metodo | Video | Product | Ads | Live | Weighted Pass@64 |
|---|---:|---:|---:|---:|---:|
| SFT-only | 1,46 | 4,44 | 15,11 | 20,94 | 0,6912 |
| Full-RFT | 1,39 | 3,69 | 14,57 | 20,36 | 0,6460 |
| TM-RFT (k = 3) | 1,71 | 5,37 | 17,72 | 21,65 | 0,7893 |

Resultados adicionales de TM-RFT (k = 3) con distintas asignaciones de candidatos (Tabla 2): 0,7129 con 64 candidatos de razonamiento, 0,8099 con 64 candidatos directos y 0,8035 con 16 de razonamiento y 48 directos. El artículo indica que TM-RFT (k = 3) lidera cuatro de las cinco asignaciones probadas. Las evaluaciones son offline y con número de candidatos fijo; el rendimiento con latencia o coste de tokens igualados queda abierto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 8.000 millones de parámetros en BF16 se requieren aproximadamente 16 GB solo para pesos, más memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en A100 (40/80 GB), H100 y RTX 4090 (24 GB) en BF16, aunque la memoria adicional para secuencias de 32.768 tokens puede exceder los 24 GB.
- Cabe en GPU de consumo: probablemente en RTX 4090 con cuantizacion, aunque no se publican pesos cuantizados ni recetas de cuantizacion.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` y `device_map="auto"`; el repositorio incluye `download_checkpoint.py` para descargar checkpoints individuales. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TM-RFT (k=3) sobre OneReason-8B | 8B | no disponible | Recomendación generativa con SID | Pesos con licencia separada | Hugging Face |
| SFT-only (mismo base) | 8B | no disponible | Recomendación generativa con SID | Pesos con licencia separada | Incluido en el mismo repo |
| Full-RFT (mismo base) | 8B | no disponible | Recomendación generativa con SID | Pesos con licencia separada | Incluido en el mismo repo |
| OneReason-8B-Pretrain (Competition) | 8B | no disponible | Modelo base de recomendación | no disponible | Hugging Face |

No se dispone de información sobre otros modelos de recomendación generativa comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo especializado en recomendación generativa; no es un asistente generalista y su uso fuera de ese dominio no está validado.
- Solo soporta inglés y chino; no se documenta cobertura de otros idiomas.
- Riesgo de alucinación de SIDs: la propia model card recomienda validar los SIDs generados contra el catálogo antes de usarlos.
- Los resultados de evaluación son offline y con número de candidatos fijo; no se reporta rendimiento con latencia o coste de tokens igualados.
- La licencia de los pesos no está detallada en la información disponible y se remite a un documento separado (WEIGHTS_LICENSE.md); es imprescindible revisarlo antes de uso comercial.
- El repositorio es de un autor anónimo y acumula 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.
- El tamaño del repositorio (167,8 GB) obliga a descargar checkpoints individuales con `allow_patterns`; descargar el repo completo es costoso en almacenamiento.
- No se publican pesos cuantizados ni recetas para despliegue de baja latencia.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anony-tmrft/tm-rft-onereason-8b-weights
- Checkpoint tm-rft-k3: https://huggingface.co/anony-tmrft/tm-rft-onereason-8b-weights/tree/main/tm-rft-k3
- Modelo base OneReason-8B-Pretrain (Competition): https://huggingface.co/OpenOneRec/OneReason-8B-pretrain-competition
- Dataset OneReasonSFT: https://huggingface.co/datasets/OpenOneRec/OneReasonSFT
- Dataset OneReason-Eval-Benchmark: https://huggingface.co/datasets/OpenOneRec/OneReason-Eval-Benchmark
- Repositorio oficial de evaluación OneReason: https://github.com/Kuaishou-OneRec/OneReason_Eval_Benchmark
- Licencia del código (Apache 2.0): https://huggingface.co/anony-tmrft/tm-rft-onereason-8b-weights/blob/main/LICENSE
- Licencia de los pesos: https://huggingface.co/anony-tmrft/tm-rft-onereason-8b-weights/blob/main/WEIGHTS_LICENSE.md
