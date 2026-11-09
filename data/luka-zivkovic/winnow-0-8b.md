# luka-zivkovic/winnow-0.8b

## Resumen

Winnow 0.8B es un adaptador LoRA de selección de evidencia y compresión de contexto, desarrollado por luka-zivkovic sobre el modelo base Qwen/Qwen3.5-0.8B. Su función no es generar texto, sino puntuar cada fragmento de un documento largo frente a una o varias preguntas y conservar únicamente los fragmentos relevantes hasta un presupuesto de tokens. De este modo, el modelo que finalmente responde lee entre un 10 % y un 20 % del texto original, lo que reduce coste y latencia y, según el autor, mejora la precisión en documentos largos como contratos.

El modelo se presenta como un sistema "System 1" en la terminología de Kahneman: realiza una única pasada forward por cada chunk y extrae la puntuación directamente de los estados ocultos, sin generar tokens ni emplear modo de razonamiento. Esa eficiencia le permite puntuar un contrato de 28.000 tokens en aproximadamente un segundo sobre una RTX 4090. La versión documentada es la cuarta (`runs/scorer-0.8b-r4q`, 9 de noviembre de 2026), y el autor lo describe explícitamente como un modelo de investigación privado cuyos resultados solo cubren lo que se ha probado.

La relevancia actual reside en el problema de la ventana de contexto: en lugar de ampliar el contexto de los modelos lectores, Winnow actúa como prefiltro barato que reduce el texto de entrada. El repositorio ocupa 0,1 GB, la licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre el modelo de texto de Qwen3.5-0.8B, más dos cabezas lineales (`head.pt` de hidden size a 1 y `qhead.pt` que proyecta a 256 dimensiones) |
| Parametros totales | no disponible (adaptador LoRA sobre un base de 0,8B; el repositorio pesa 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | chunks de hasta 2.000 tokens por fragmento; hasta 4.096 tokens incluyendo las preguntas |
| Tipos de cuantizacion | no disponible; se ejecuta en bf16 en CUDA y MLX, y en fp32 con PyTorch fuera de CUDA |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) más `head.pt` y `qhead.pt` |

## Arquitectura y entrenamiento

Winnow no es un modelo generativo autónomo, sino un scorer construido como adaptador LoRA de rango 16 sobre todas las capas lineales de Qwen3.5-0.8B, al que se añaden dos cabezas. La entrada tiene el formato `Questions:\n- <question>\n…\n\nPieces:\n`, seguida de cada fragmento terminado en `<|object_ref_end|>`; los fragmentos se empaquetan en chunks de hasta 2.000 tokens y el total con las preguntas no supera los 4.096. La cabeza `head.pt` lee el último estado oculto en cada `<|object_ref_end|>` y su sigmoide produce la probabilidad de que el fragmento sea evidencia para alguna de las preguntas; `qhead.pt` proyecta fragmentos y preguntas a 256 dimensiones y puntúa cada par fragmento-pregunta mediante producto escalar con sesgo. Para la cabeza por pregunta, cada pregunta termina además en `<|box_end|>`.

El entrenamiento usó 10.630 chunks etiquetados como evidencia o no evidencia, con learning rate 2e-4, acumulación de gradiente 8, una época, semilla 0 y pesos de clase positiva de 10 (cabeza any-question) y 30 (cabeza per-question); el proceso completo duró 76 minutos en una RTX 4090. Los datos provienen de ContractNLI (NDAs de entrenamiento, tal cual y ocultos en casos largos de secciones de otros NDAs, añadiendo los fragmentos que el modelo de decisión necesitaba), CUAD (contratos de entrenamiento, 33 preguntas de cláusulas sí/no) y MAUD (60 acuerdos de fusión de entrenamiento en ventanas de 15.000 tokens). La precisión media en ranking sobre dev fue de 0,639 frente a la evidencia humana (0,618 en la versión tres). Como innovación destacable, el modelo evita por completo la generación de texto y el modo thinking: una sola pasada forward por chunk basta para puntuar.

## Capacidades

- Puntuación de evidencia: asigna a cada fragmento la probabilidad de ser relevante para una o varias preguntas.
- Compresión de contexto: conserva una fracción configurable del texto (presupuesto en fracción de tokens o en número absoluto), típicamente el 10-20 %.
- Selección por pregunta: la cabeza `qhead.pt` permite puntuar cada fragmento contra cada pregunta por separado.
- Procesamiento de documentos largos: puntúa entradas de decenas de miles de tokens dividiéndolas en chunks.
- Inferencia sin generación: no produce texto ni tokens de razonamiento; la puntuación sale directamente de los estados ocultos.
- Ejecución multibackend: CUDA en bf16, MLX en Apple Silicon (bf16) y PyTorch en fp32 fuera de CUDA.
- Integración con modelos lectores arbitrarios: el texto recortado puede pasarse a cualquier modelo de decisión, rápido o lento.
- Comparación de lectores: la herramienta `dio.cut` permite preguntar a modelos de decisión concretos sobre el texto completo y sobre el recortado.
- Soporte de conversaciones: modo `--conversation` con `--structure-only` para preservar últimos mensajes, mensajes del usuario y llamadas de herramientas con sus resultados.
- No dispone de tool calling, function calling, agentes, visión ni audio; su alcance es la selección de evidencia en inglés.

## Casos de uso

- Revisión de contratos y cláusulas: ante un contrato de decenas de miles de tokens y preguntas como si limita la responsabilidad del vendedor, Winnow conserva el 10-20 % relevante y el modelo lector responde sobre ese subconjunto; en MAUD y CUAD el recorte mejoró la precisión del lector frente a leer el documento completo.
- Reducción de coste en pipelines RAG o de QA documental: al enviar al modelo lector una décima parte del texto, se reducen tokens de entrada, latencia y facturación de API sin degradar la exactitud, con un coste de puntuación de aproximadamente un segundo por 28.000 tokens en una RTX 4090.
- Procesamiento de acuerdos de fusión y due diligence: los documentos de MAUD, con ventanas de 15.000 tokens, son el caso de entrenamiento y evaluación principal; el modelo localiza las secciones que responden a preguntas concretas sobre el acuerdo.
- Filtrado previo en atención al cliente o soporte documental: en conversaciones, el modo `--structure-only` mantiene los últimos mensajes, los del usuario y las llamadas de herramientas con sus resultados, lo que permite recortar el historial conservando el contexto operativo.
- Análisis de informes clínicos embebidos en documentos largos: en la prueba con informes clínicos ocultos en 28.000 tokens, el recorte al 10 % mantuvo la precisión del lector (cambio de +0,7 puntos).
- Prefiltro para modelos lentos o caros: cualquier lector, incluido un modelo grande o con razonamiento extendido, puede recibir solo el texto seleccionado, lo que hace viable usar modelos de alta calidad sobre documentos que de otro modo excederían su presupuesto de contexto.
- Experimentación en investigación sobre selección de evidencia: el adaptador y las cabezas son pequeños y entrenables en menos de dos horas en una RTX 4090, lo que facilita reproducir o adaptar el enfoque a otros dominios documentales.

## Benchmarks y rendimiento

Resultados publicados por el autor: cambio en la precisión del lector sobre el texto recortado menos su precisión sobre el texto completo, en puntos, con intervalos bootstrap del 95 % sobre documentos. Lectores: Jev (`jev-1.14.0`) y Claude Haiku 5.5 (esfuerzo bajo).

| Conjunto de prueba | Lector | Recorte | Texto conservado | Cambio de precisión | Respuestas correctas perdidas |
|---|---|---|---|---|---|
| MAUD (20 acuerdos de fusión) | Jev | gate | 13 % | +4,1 (+2,6 a +5,4) | 71 |
| MAUD | Jev | 10× | 10 % | +3,5 (+1,7 a +5,1) | 111 |
| MAUD | Claude Haiku 5.5 | 10× | 10 % | +4,9 (+1,0 a +8,9) | 175 |
| CUAD (94 contratos) | Jev | gate | 16 % | +0,5 (−0,2 a +1,3) | 58 |
| CUAD | Claude Haiku 5.5 | 10× | 10 % | +1,1 (+0,2 a +1,9) | 89 |
| CUAD | Claude Haiku 5.5 | gate | 16 % | +1,2 (+0,3 a +2,1) | 66 |
| Informes clínicos ocultos en 28.000 tokens | Jev | 10× | 10 % | +0,7 | 5 |
| Casos sintéticos de NDAs largos | Jev | 10× | 10 % | +3,6 | 85 |

Ranking en dev: precisión media de 0,639 frente a la evidencia humana (0,618 en la versión tres). El autor indica que todos los casos de prueba superan el criterio de precisión (cambio al menos 0 con cota inferior de al menos −2 puntos). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de puntuación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa 0,1 GB y el base es de 0,8B, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 4090 para el rendimiento de referencia (aproximadamente 1 segundo por entrada de 28.000 tokens); cualquier GPU CUDA con bf16 debería servir, aunque no se publican cifras para otros modelos.
- Apple Silicon: ejecución con MLX en bf16, aproximadamente 20 segundos en un M3 para el mismo tipo de entrada; con PyTorch en fp32, unos 80 segundos.
- CPU: viable con PyTorch en fp32, sin cifras de latencia publicadas.
- Cabe en GPU de consumo: sí, dado el tamaño del base y del adaptador.
- Despliegue: herramienta propia `dio.cut` (PyTorch/CUDA y MLX); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estas no aplican directamente.
- Latencia: aproximadamente 1 s por 28.000 tokens en RTX 4090; aproximadamente 20 s en M3 con MLX; aproximadamente 80 s en M3 con PyTorch fp32.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Winnow 0.8B | LoRA sobre Qwen3.5-0.8B | 0,8B (base) | chunks de 2.000 tokens; 4.096 con preguntas | Selección de evidencia y compresión de contexto | Apache 2.0 | Hugging Face (adaptador) |
| Qwen3.5-0.8B | LLM generativo | 0,8B | no disponible en la información | Generación de texto y respuesta a preguntas | Apache 2.0 | Hugging Face (modelo base) |
| Jev (`jev-1.14.0`) | Modelo de decisión | no disponible | no disponible | Lector evaluado sobre texto completo y recortado | no disponible | no disponible |
| Claude Haiku 5.5 | Modelo propietario | no disponible | no disponible | Lector evaluado sobre texto completo y recortado | propietaria | API de Anthropic |

No se dispone de otros modelos de selección de evidencia comparables en la información proporcionada. La comparación relevante es funcional: Winnow no compite con los lectores, sino que los precede para reducir su entrada.

## Limitaciones y advertencias

- Modelo de investigación privado: el autor advierte que los resultados publicados son solo los que se han probado y no garantizan un comportamiento general.
- Solo inglés: el idioma declarado es `en`; no hay evidencia de funcionamiento en castellano u otros idiomas.
- Dominio limitado: el entrenamiento se centra en contratos (NDAs, CUAD, acuerdos de fusión de MAUD) y en informes clínicos como prueba; el rendimiento en otros dominios no está documentado.
- Presupuesto de recorte sensible: conservar el 5 % elimina evidencia y conservar el 30 % de un contrato comercial rindió peor que el 10 % para todos los lectores probados; el rango recomendado es 10-20 %.
- Entradas cortas: por defecto, las entradas de menos de 10.000 tokens se devuelven completas (`--min-tokens`), por lo que no hay compresión en documentos cortos.
- Conversaciones: en conjuntos públicos de conversación, las reglas estructurales mantuvieron la precisión de los modelos de decisión con un quinto de los tokens, y el ranking de Winnow no aportó mejora adicional en ese escenario.
- Licencia de datos: ContractNLI es CC BY 4.0, pero 261 de sus 423 NDAs de entrenamiento son PDFs web usados bajo una reclamación de fair use, según el archivo DATASETS.md del repositorio; conviene revisarlo antes de un uso comercial.
- Riesgo de alucinación: no aplica de forma directa porque el modelo no genera texto, pero una puntuación errónea puede descartar evidencia necesaria y provocar respuestas incorrectas del lector.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Dependencia de código externo: la herramienta `dio.cut` vive en un repositorio privado (`github.com/luka-zivkovic/experiments`), lo que limita la reproducibilidad completa.
- Precisión numérica: con PyTorch en fp32 fuera de CUDA, el código de referencia de atención lineal de Qwen3.5 falla en GPU de Apple en media precisión; MLX difiere de PyTorch en 0,0001-0,0014 de media en las puntuaciones, aunque produjo los mismos recortes.
- La copia MLX lista para usar (`luka-zivkovic/winnow-0.8b-mlx`) es privada según la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luka-zivkovic/winnow-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de experimentos (privado, según la model card): https://github.com/luka-zivkovic/experiments
- Copia MLX (privada, según la model card): https://huggingface.co/luka-zivkovic/winnow-0.8b-mlx
- ContractNLI: no disponible en la información proporcionada
- CUAD: no disponible en la información proporcionada
- MAUD: no disponible en la información proporcionada
