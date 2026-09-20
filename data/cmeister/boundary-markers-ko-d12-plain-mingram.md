# cmeister/boundary-markers-ko-d12-plain-mingram

## Resumen

Este repositorio contiene un modelo de lenguaje de investigación entrenado para medir el efecto de distintas estrategias de tokenización en coreano. Se trata del brazo de control (`plain`) del estudio *Explicit Boundary Markers for Subword Vocabularies* (Sander Land y Clara Meister, arXiv:2608.08847): un tokenizador con pretokenización por codificación SCRIPT y sin marcadores de frontera de palabra, frente al cual se comparan los esquemas que sí marcan límites explícitos. El modelo lo publica el usuario `cmeister` bajo licencia Apache-2.0 y consta de tres semillas (0, 1 y 2) que solo difieren en la inicialización de pesos y el orden de los datos.

La arquitectura es la de nanochat (commit `92d63d4`): un transformer decoder-only denso de 12 capas, ancho 768, 6 cabezas de atención y una ventana de contexto de 2.048 tokens. Cada semilla se entrenó durante 2.553 pasos de 524.288 tokens, es decir, unos 1,34 mil millones de tokens sobre tres shards de Korean FineWeb-2 (1,22 mil millones de caracteres, leídos aproximadamente 3,1 veces).

Su relevancia no está en las capacidades generativas, que son deliberadamente modestas, sino en su función metodológica: es la línea base contra la que se mide la pérdida en bits por byte de las variantes con marcadores de frontera, y el autor publica los registros completos de entrenamiento y evaluación para que los resultados sean reproducibles. Resulta útil para investigadores que trabajen en tokenización multilingüe, en eficiencia de vocabularios subword y en entrenamientos de bajo presupuesto con nanochat.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat), 12 capas, ancho 768, 6 cabezas de atención |
| Parámetros totales | No disponible (no declarado por el autor) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (solo se publican pesos en el formato nativo de nanochat) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`model_002553.pt`), cargable con `torch.load(..., weights_only=True)` |
| Tokenizador | `plain`: pretokenización con codificación SCRIPT, sin marcadores de frontera |
| Vocabulario | 34.685 entradas del tokenizador; 34.686 en el modelo (incluye token de inicio de secuencia) |
| Entrenamiento del tokenizador | MinGram sobre una muestra de 5 GB de Korean FineWeb |
| Tokens de entrenamiento | 2.553 pasos × 524.288 tokens ≈ 1,34 mil millones de tokens |
| Semillas publicadas | 3 (0, 1, 2) |
| Tamaño del repositorio | 2,5 GB |
| Fecha de publicación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo sigue la implementación de nanochat de Andrej Karpathy, en su commit `92d63d4`, invocada mediante `paper_utils/boundary/downstream/run_arms.sh` del repositorio `script_tok`. Se trata de un transformer decoder-only estándar y denso, con 12 capas, dimensión de modelo 768 y 6 cabezas de atención (dimensión de cabeza de 128), entrenado con un objetivo de modelado de lenguaje autorregresivo. El autor no declara el recuento exacto de parámetros; con las dimensiones publicadas y un vocabulario de 34.686 entradas, el orden de magnitud es de 10^8 parámetros, muy por debajo de los modelos de producción actuales.

Los datos de entrenamiento son tres shards de Korean FineWeb-2, procedentes de la release `fineweb-2_0_1-quality_10-filterrobots`, que suman 1.220 millones de caracteres y se leyeron aproximadamente 3,1 veces durante el entrenamiento. La semilla controla la inicialización de pesos y el orden de los shards, y ese orden es idéntico para todos los tokenizadores del estudio, de modo que los modelos con la misma semilla son directamente comparables entre esquemas. Existe una limitación metodológica declarada por el propio autor: con solo tres shards, las semillas 1 y 2 sortearon el mismo orden de datos, por lo que las tres semillas cubren dos órdenes de datos y no tres. No se menciona ningún tipo de ajuste posterior al entrenamiento (no hay RLHF, DPO ni instrucciones supervisadas): es un modelo base.

La particularidad técnica del experimento no está en el modelo, sino en el tokenizador: MinGram con pretokenización basada en codificación SCRIPT y sin marcadores de frontera de palabra, que actúa como condición de control del artículo. El tokenizador se publica como `tokenizer/fineweb_ko_5gb_quick_plain_mingram_v34685.json.gz`, con sha256 `14c5882608db982e4f04bf0be1e60ef48bef2d6c351cb45c96430f63ad57f8d6`, y es idéntico para las tres semillas.

## Capacidades

- Generación de texto autorregresiva en coreano: es un modelo base, por lo que completa texto en lugar de seguir instrucciones.
- Modelado de lenguaje y puntuación de secuencias: la capacidad directamente medida en la model card es la pérdida en bits por byte sobre un shard de validación de Korean FineWeb-2.
- Condición de control reproducible para estudios de tokenización: permite aislar el efecto del marcado de fronteras comparando contra brazos con el mismo presupuesto de entrenamiento.
- Reproducción de experimentos de nanochat a pequeña escala, con registros completos de entrenamiento y evaluación.
- Aprendizaje de representaciones en coreano suficientes para servir de punto de partida en ajuste fino ulterior.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso inducido por entrenamiento.
- No dispone de modo de pensamiento (*thinking*), visión, audio ni multimodalidad.
- Multilingüismo: únicamente coreano; no se ha entrenado ni evaluado en otros idiomas.
- No dispone de ajuste por instrucciones ni de alineación de ningún tipo.

## Casos de uso

- Investigación sobre marcadores de frontera subword: usar este modelo como línea base `plain` frente a los brazos con marcadores explícitos, manteniendo constantes semilla, datos y presupuesto de cómputo, para atribuir las diferencias de pérdida exclusivamente al tokenizador.
- Evaluación comparativa entre tokenizadores: calcular bits por byte sobre un shard reservado de Korean FineWeb-2 con cada tokenizador; al normalizar por la longitud real en UTF-8, las cifras son comparables dentro del mismo idioma aunque el vocabulario cambie.
- Reproducción de resultados académicos: el repositorio incluye `train.log`, `archive.json` con los sha256 de cada fichero y `meta_002553.json` con la configuración de nanochat, lo que permite auditar y repetir la ejecución.
- Estudio de eficiencia de vocabularios en coreano: analizar cómo un vocabulario de 34.685 entradas entrenado con MinGram sobre 5 GB de FineWeb reparte los caracteres hangul entre tokens y qué implica para la longitud efectiva de secuencia.
- Docencia y formación en entrenamiento de LLM: por su tamaño reducido y su receta abierta (nanochat en una GPU por modelo), sirve para que estudiantes ejecuten un ciclo completo de preentrenamiento con datos reales.
- Ajuste fino experimental en coreano con recursos limitados: al ser un modelo de orden 10^8 parámetros con contexto de 2.048 tokens, se puede ajustar en una única GPU de gama media para tareas concretas de clasificación o generación de dominio.
- Punto de partida para modelos de coreano más grandes: replicar la receta de datos y tokenizador a mayor escala antes de comprometer presupuesto en un entrenamiento grande.
- Auditoría de licencias y trazabilidad de artefactos: al ser Apache-2.0 y publicar hashes de cada fichero, encaja en pipelines que exigen procedencia verificable de los pesos.

## Benchmarks y rendimiento

La model card solo publica una métrica: bits por byte de validación (suma de la pérdida sobre un shard reservado de Korean FineWeb-2 dividida entre la longitud real en UTF-8 del texto puntuado; menor es mejor). Las cifras solo son comparables dentro del mismo idioma. Esta tabla reproduce los valores publicados.

| Semilla | Bits por byte (este modelo, `plain`) | `plain` menos este modelo |
|---|---|---|
| 0 | 0,84701 | (es la referencia) |
| 1 | 0,84892 | (es la referencia) |
| 2 | 0,84727 | (es la referencia) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que tres semillas dan una dirección, no una estimación precisa, y que la comparación completa entre esquemas, entrenadores e idiomas está en el repositorio `script_tok`.

## Requisitos de hardware

- VRAM para inferencia: no declarada por el autor. Con la arquitectura publicada (12 capas, ancho 768, vocabulario de 34.686, contexto de 2.048), el orden de magnitud es de unos pocos cientos de MB en fp32 y por debajo de 200 MB en bf16, más una caché KV de decenas de MB a máxima longitud; son estimaciones derivadas de la configuración, no cifras publicadas.
- GPU recomendadas: el autor indica que cada modelo se entrenó con una GPU por modelo, sin especificar el modelo de GPU. Para inferencia, cualquier GPU con al menos unos pocos GB de VRAM es suficiente.
- GPU de consumo: sí, cabe con holgura en tarjetas de consumo (por ejemplo, serie RTX 30/40 con 8 GB o más). No requiere aceleradores de centro de datos.
- Opciones de despliegue: la vía nativa es el propio código de nanochat, cargando `seed<n>/model_002553.pt` con `torch.load(..., weights_only=True)` y leyendo la configuración de `meta_002553.json`. No se publican pesos en formato GGUF, safetensors ni convertidores oficiales para llama.cpp, Ollama, vLLM o TGI, de modo que su uso con esos motores exigiría una conversión manual no soportada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparación directa es problemática porque este artefacto es una línea base de investigación en coreano y no un modelo de propósito general. Los datos de los modelos de referencia que figuran abajo proceden de conocimiento general y no de la información proporcionada; se incluyen solo como orientación de escala y deben verificarse en sus propias fichas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento comparable |
|---|---|---|---|---|---|
| boundary-markers-ko-d12-plain-mingram | No declarado (orden 10^8) | 2.048 | Coreano | Apache-2.0 | 0,84701–0,84892 bits por byte en coreano |
| Brazos con marcadores de frontera del mismo estudio | No disponible | No disponible | Coreano | No disponible en la información proporcionada | Comparables dentro del mismo estudio |
| SmolLM2-135M | 135 M | 8.192 | Inglés (principalmente) | Apache-2.0 | No comparable (otro idioma y otra métrica) |
| Qwen2.5-0.5B | 0,49 B | 32.768 | Multilingüe | Apache-2.0 | No comparable (otro idioma y otra métrica) |
| TinyLlama-1.1B | 1,1 B | 2.048 | Inglés (principalmente) | Apache-2.0 | No comparable (otro idioma y otra métrica) |

No se dispone de cifras de bits por byte en coreano para los modelos de referencia, por lo que no se puede establecer una comparación de rendimiento rigurosa. La comparación válida es interna al estudio: los brazos con marcadores de frontera frente a esta línea base `plain`.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningún análisis de sesgo, toxicidad ni sesgo de género o dialectal. El corpus de entrenamiento es Korean FineWeb-2 filtrado por calidad, cuyos sesgos hereda sin mitigación.
- Riesgo de alucinación: elevado en términos relativos, al tratarse de un modelo base de 12 capas entrenado con 1,34 mil millones de tokens y sin ningún tipo de alineación. No debe usarse como fuente factual.
- Limitación de contexto: la ventana es de 2.048 tokens, insuficiente para documentos largos, diálogos extensos o código de gran tamaño.
- Limitación de idioma: solo coreano. No se ha entrenado ni evaluado en castellano ni en ninguna otra lengua.
- Ausencia de ajuste por instrucciones: no responde a órdenes ni a formatos de chat; cualquier uso conversacional requiere ajuste fino previo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de copyright y licencia. No se documentan restricciones adicionales ni cláusulas de uso aceptable.
- Caveat metodológico declarado por el autor: con solo tres shards, las semillas 1 y 2 comparten orden de datos, por lo que las tres semillas cubren dos órdenes y no tres; los resultados deben interpretarse como una dirección y no como una estimación precisa.
- Comparabilidad: las cifras de bits por byte solo son válidas dentro del mismo idioma y del mismo protocolo de evaluación.
- Formato de pesos: al ser un state dict de PyTorch, requiere cargar código en Python y no es directamente consumible por herramientas de inferencia estándar.
- Madurez del artefacto: cero descargas y cero valoraciones en el momento de redactar esta ficha, y fecha de publicación muy reciente; no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-plain-mingram
- Artículo: *Explicit Boundary Markers for Subword Vocabularies*, Sander Land y Clara Meister: https://arxiv.org/abs/2608.08847
- Repositorio `script_tok` (código del tokenizador y comparación completa entre esquemas): https://github.com/sanderland/script_tok
- nanochat (implementación de entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Los resultados de la búsqueda web facilitados no contienen enlaces relevantes para este modelo: todas las entradas devueltas tratan sobre discos de vinilo y no guardan relación con el artefacto.
