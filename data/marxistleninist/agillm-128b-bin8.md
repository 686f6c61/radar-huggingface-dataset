# MarxistLeninist/AGILLM-128B-bin8

## Resumen

AGILLM-128B-bin8 es un repositorio de instantáneas (snapshots) periódicas de AGILLM-128B, un modelo de lenguaje de tipo mixture-of-experts con pesos binarios que, en el momento de la publicación, seguía en entrenamiento. Lo publica el usuario de HuggingFace MarxistLeninist bajo la librería `agillm128b` y el pipeline `text-generation`. No se trata de un modelo terminado ni ajustado: el único snapshot disponible corresponde al paso 4566 (24 de octubre de 2026) y se distribuye como un paquete de bits de signo en formato propio, no como safetensors ni GGUF.

El interés técnico está en el esquema de pesos: el modelo declara 126,7 mil millones de pesos binarios con latentes int8 y solo 21,7 millones de parámetros en coma flotante. En la pasada forward únicamente se lee el signo de cada latente int8 (`w = +1` si el latente es `>= 0`), de modo que empaquetar esos signos es exacto para inferencia y reduce el checkpoint de 128,7 GB a 16,1 GB (8 veces menos). La arquitectura son 80 bloques con dimensión de modelo 8192, dimensión de feed-forward 32768 y entre 2 y 3 expertos por bloque, con tokenizer `tiktoken o200k_base` y una ventana de contexto de 2048 tokens.

La relevancia ahora es doble: por un lado, es un artefacto poco habitual de pesos de 1 bit a escala de 128B, con verificación criptográfica por registro; por otro, sus credenciales son mínimas (0 descargas, 0 likes, sin licencia declarada, sin idiomas declarados y sin ningún benchmark publicado), por lo que debe tratarse como material de investigación reproducible más que como un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts y pesos binarios: 80 bloques, `d=8192`, `ff=32768`, 2–3 expertos por bloque |
| Parámetros totales | 126,7 mil millones de pesos binarios + 21,7 millones de parámetros en coma flotante |
| Parámetros activos | No disponible (el autor indica 2–3 expertos por bloque, pero no publica el ratio de activación) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | Pesos binarios de 1 bit (signo del latente int8, `w=+1` si `latent >= 0`); el checkpoint nativo conserva latentes int8 |
| Idiomas soportados | No disponible (tokenizer `tiktoken o200k_base`; no se publica listado de idiomas) |
| Licencia | No disponible |
| Formato de pesos | Formato propio `agillm128b-bits-1`: `model_bits.bin`, `table_bits.bin`, `meta.json` + `ckpt.pt` y `state.json` (estado fp y de entrenamiento) |

## Arquitectura y entrenamiento

El cuerpo del modelo son 80 bloques transformer con dimensión de modelo de 8192 y feed-forward de 32768, con enrutamiento hacia 2–3 expertos por bloque. La tabla de lenguaje es de 200064 × 8192, lo que fija un vocabulario de 200064 entradas sobre el tokenizer `tiktoken o200k_base`. La innovación central es el entrenamiento con pesos binarios: el forward lee exclusivamente el signo de cada latente int8, mientras que el estado en coma flotante se reduce a 21,7 millones de parámetros (escalas, normas, routers y cabezas locales, además del estado de Adam). El paquete de signos es, por tanto, exacto para inferencia pero no contiene las magnitudes de los latentes, de modo que reanudar el entrenamiento desde una expansión es un reinicio en caliente, no una reanudación exacta.

El autor indica que el entrenamiento corre en una única GPU de consumo, con una ventana de 2048 tokens por paso, sobre una mezcla de datasets fijada (fineweb-edu, código, matemáticas, Wikipedia y FineWeb-2). No se documentan el número total de tokens vistos, la composición exacta de la mezcla ni si hubo fases de RLHF o DPO. Tampoco se publica ningún resultado de evaluación del checkpoint en el paso 4566.

## Capacidades

- Generación de texto autorregresiva con una ventana de contexto de 2048 tokens, según el pipeline declarado (`text-generation`).
- Inferencia con pesos de 1 bit: el programa `trainer_source.py` permite `verify`, `expand` e `infer` sobre el paquete de signos.
- Inferencia exacta en signos: la expansión reconstruye un directorio nativo de ~128,7 GB con latentes de ±32, suficiente para reproducir la forward del snapshot.
- Compatibilidad con el tokenizer `tiktoken o200k_base`, que debe aportarse por separado (`o200k_base.tiktoken` + `tokenizer_config.json`); no viene incluido en el paquete.
- Verificación de integridad por registro: `meta.json` incluye offsets, filas, anchuras, poblaciones y SHA-256 por registro y por parte; `SHA256SUMS` y `EXPORT_COMPLETE.json` cierran la cadena de verificación.
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües evaluadas; el tokenizer es multilingüe por construcción, pero el modelo no publica cobertura por idioma.

## Casos de uso

- Investigación en cuantización de 1 bit a gran escala: el paquete permite reproducir de forma exacta la forward de un modelo de 126,7 mil millones de pesos binarios partiendo de 16,1 GB, lo que abarata el estudio de esquemas de signo frente a alternativas ternarias o de baja precisión con escalas.
- Auditoría de reproducibilidad: `meta.json`, `SHA256SUMS` y `EXPORT_COMPLETE.json` permiten validar que un paquete descargado coincide bit a bit con el export del autor antes de usarlo en un experimento.
- Estudio de dinámica de entrenamiento: `state.json` y `ckpt.pt` contienen el estado completo de Adam y del estado fp en el paso 4566, útil para analizar la evolución de routers y normas en modelos MoE con pesos binarios.
- Experimentos de reanudación en caliente: sirve para medir cuánto se degrada el entrenamiento al reanudar desde signos sin magnitudes de latentes, un problema abierto en la formación de modelos binarios.
- Pruebas de infraestructura de formatos propios: el par `trainer_source.py` + formato `agillm128b-bits-1` es un banco de pruebas realista para validar pipelines de carga, expansión y verificación de pesos que no usan safetensors ni GGUF.
- Evaluación de viabilidad en hardware de consumo: el autor entrena con una sola GPU de consumo y ventanas de 2048 tokens, lo que permite contrastar afirmaciones sobre coste de entrenamiento de modelos binarios frente a modelos densos equivalentes.
- Docencia y divulgación técnica: un snapshot intermedio con pesos de 1 bit y verificación criptográfica es material ilustrativo para explicar cómo se almacena y se lee un peso binario en la práctica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación, y el modelo se encontraba en entrenamiento en el momento del export.

## Requisitos de hardware

- Almacenamiento: 16,1 GB para el paquete de signos; ~128,7 GB para el directorio nativo que genera `expand`.
- VRAM estimada: no disponible. El flujo documentado expande el paquete a un directorio nativo con latentes int8, por lo que la inferencia requiere memoria para los pesos int8 más el estado fp y las activaciones.
- GPU recomendadas: no disponible. El autor solo declara que el entrenamiento corre en una única GPU de consumo, sin especificar modelo ni memoria.
- ¿Cabe en GPU de consumo? No confirmado; el propio autor entrena en una GPU de consumo, pero no se publica la VRAM necesaria para servir el modelo expandido.
- Opciones de despliegue: exclusivamente `trainer_source.py` (subcomandos `pack128 verify`, `pack128 expand` e `infer`). No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún runtime estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de AGILLM-128B son en su mayoría no disponibles y no existen métricas propias publicadas, por lo que la comparación es estructural y no de rendimiento. Las cifras de las alternativas son datos públicos de referencia de cada proyecto, no mediciones de esta ficha.

| Modelo | Parámetros | Precisión de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AGILLM-128B-bin8 (paso 4566) | 126,7 mil millones binarios + 21,7 M fp | 1 bit (signo) | 2048 | No disponible | Snapshot en entrenamiento, formato propio |
| BitNet b1.58 (Microsoft Research) | ~2 mil millones en la variante 2B4T | Ternaria (-1, 0, +1) | 4096 | MIT (según el proyecto) | Pesos publicados y soportados en `bitnet.cpp` |
| Mixtral 8x7B | 46,7 mil millones totales, 12,9 mil millones activos | BF16 | 32 000 | Apache 2.0 | Pesos safetensors, amplio soporte de runtimes |
| DeepSeek-V2-Lite | 15,7 mil millones totales, 2,4 mil millones activos | BF16 | 32 000 | Licencia propia de DeepSeek | Pesos safetensors, soporte en vLLM |

## Limitaciones y advertencias

- Licencia no disponible: no hay base legal declarada para uso comercial, redistribución o modelos derivados; hay que contactar con el autor antes de cualquier uso en producción.
- Es un checkpoint intermedio de un entrenamiento en curso (paso 4566), no un modelo convergido ni ajustado; no hay ninguna evaluación que respalde su calidad.
- Sin benchmarks, sin evaluación de sesgos y sin análisis de alucinación publicados: no existen datos para estimar fiabilidad.
- Contexto limitado a 2048 tokens, insuficiente para muchos casos de uso actuales (RAG con documentos largos, agentes con historial extenso).
- Idioma no declarado: el tokenizer `o200k_base` es multilingüe, pero se desconoce el rendimiento real en castellano u otros idiomas.
- Formato propietario y dependencia total del script del autor (`trainer_source.py`): sin soporte de vLLM, llama.cpp, Ollama o TGI, y sin garantía de mantenimiento futuro.
- La expansión es exacta para inferencia pero no preserva las magnitudes de los latentes, así que no permite reanudar el entrenamiento de forma exacta (solo reinicio en caliente).
- Las poblaciones por fila y los checksums SHA-256 mitigan el riesgo de corrupción, pero el usuario debe ejecutar la verificación: no hay validación por parte de terceros.
- Huella social nula (0 descargas, 0 likes, cuenta única) y ausencia de revisión por pares: tratar cualquier afirmación del autor como no contrastada.
- Los ficheros se suben enteros, nunca divididos, lo que obliga a descargar el paquete completo aunque solo se quiera un registro.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MarxistLeninist/AGILLM-128B-bin8
- Script de entrenamiento, expansión e inferencia incluido en el repo: `packs/step000004566/trainer_source.py`
- Índice y checksums del snapshot: `packs/step000004566/meta.json`, `SHA256SUMS`, `EXPORT_COMPLETE.json`
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (papers, blogs, repos o demos) asociados a este modelo.
