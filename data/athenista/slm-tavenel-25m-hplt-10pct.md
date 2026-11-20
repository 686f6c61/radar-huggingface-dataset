# athenista/slm-tavenel-25m-hplt-10pct

## Resumen

SLM-Tavenel 25M HPLT 10% es un modelo base experimental de tipo decoder-only con 25.723.648 parámetros, desarrollado por el autor independiente athenista dentro del proyecto SLM-Tavenel. Se trata de una continuación del checkpoint SLM-Tavenel 25M, entrenada durante 1.500 pasos adicionales sobre una mezcla congelada de tokens compuesta al 90% por French-Science-Commons y al 10% por datos derivados de HPLT, con equilibrio entre inglés y francés dentro del subconjunto candidato. El objetivo del experimento es medir el efecto de la adaptación de dominio a una mezcla web multilingüe sobre un modelo de lenguaje extremadamente pequeño.

El modelo no está ajustado por instrucciones ni diseñado como asistente conversacional: es un artefacto de investigación pensado para estudiar dinámicas de adaptación de dominio en la escala de 25M de parámetros. Emplea una arquitectura transformer decoder-only de 20 capas, anchura 256, 4 cabezas de consulta y 2 de clave-valor, con una compuerta de atención por cabeza heredada del modelo padre, y una ventana de contexto de 1.024 tokens. El tokenizador es un BPE a nivel de byte propio del proyecto con 8.192 tokens, sin cambios respecto al padre.

Su relevancia es metodológica: el autor publica un experimento emparejado (tratamiento con mezcla 90/10 frente a control solo con FSC) con la misma semilla, inicialización, optimizador y presupuesto de tokens, lo que permite aislar el efecto de la inyección de datos HPLT. La licencia MIT se aplica a pesos y código del proyecto, pero no relicencia los datasets de origen, cuyos derechos siguen sin resolverse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 20 capas, anchura 256, 4 cabezas de consulta / 2 de clave-valor, compuerta de atención por cabeza |
| Parametros totales | 25.723.648 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | Pesos publicados en float32; copia bfloat16 en `variants/bf16/`; receta int8 para CPU documentada en la model card |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (pesos y código); los datasets de origen mantienen sus propios términos |
| Formato de pesos | safetensors (`model.safetensors`, float32, SHA-256 `fb7c7783…`); copia bfloat16 en `variants/bf16/` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 20 capas con anchura 256, 4 cabezas de consulta y 2 de clave-valor (agrupación de cabezas), e incorpora una compuerta de atención por cabeza idéntica a la del checkpoint padre SLM-Tavenel 25M. El tokenizador es un BPE a nivel de byte propio del proyecto con un vocabulario de 8.192 tokens, heredado sin modificaciones. La ventana de contexto es de 1.024 tokens y el entrenamiento se realizó en precisión mixta bfloat16.

El ajuste consiste en una continuación de 1.500 pasos (49.152.000 posiciones de token) desde el checkpoint final de SLM-Tavenel 25M, con AdamW y semilla 20261028, sobre una mezcla congelada de 90% French-Science-Commons y 10% HPLT derivado, con inglés y francés equilibrados dentro del subconjunto candidato. El experimento EXP-0032 es emparejado: el control continuó solo con FSC usando el mismo tokenizador, modelo, inicialización, optimizador, semilla y presupuesto de tokens, lo que permite atribuir diferencias al flujo de datos HPLT. El coste de cómputo declarado es de aproximadamente 0,8 horas de GPU en una RTX 4060 Laptop (8 GB); la energía no se midió. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva en inglés y francés como modelo base, sin ajuste por instrucciones.
- Razonamiento de opción múltiple evaluable por log-verosimilitud en tareas tipo ARC, HellaSwag, Belebele y WinoGrande.
- Comprensión lectora multilingüe limitada a inglés y francés (Belebele en `eng_Latn` y `fra_Latn`).
- Resolución de referencias pronominales y sentido común básico (WinoGrande, HellaSwag).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No es un modelo de chat ni un asistente: carece de plantilla de conversación y de ajuste instructivo.

## Casos de uso

- Investigación sobre adaptación de dominio en modelos pequeños: replicar el par tratamiento/control de EXP-0032 para medir el efecto de inyectar un 10% de datos web HPLT sobre un corpus científico francés, usando la misma semilla y presupuesto de tokens.
- Estudio de mezclas de datos multilingües: analizar cómo varía el rendimiento en Belebele inglés y francés al modificar la proporción de HPLT en el flujo de continuación, con la ventana de 1.024 tokens como restricción de diseño.
- Evaluación de metodologías de benchmark en modelos de 25M: servir como referencia de línea base para calibrar evaluadores de opción múltiple por log-verosimilitud, dado que el autor publica el evaluador SLM-Tavenel y el registro EXP-0032.
- Docencia y experimentación con arquitecturas transformer: el tamaño de 25,7M parámetros y el entrenamiento en una RTX 4060 Laptop de 8 GB permiten reproducir el pipeline completo en hardware de consumo.
- Pruebas de inferencia en CPU: la receta int8 documentada en la model card permite desplegar el modelo en entornos sin GPU para experimentos de generación de texto a pequeña escala.
- Generación de texto exploratoria en inglés y francés: completar fragmentos cortos dentro de la ventana de 1.024 tokens en tareas de investigación lingüística, asumiendo la calidad limitada propia de la escala.
- Auditoría de procedencia de datos: estudiar las implicaciones de licencias y derechos de los datasets FSC y HPLT en la cadena de un modelo derivado, dado que el autor deja constancia de que la revisión de derechos sigue sin resolverse.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluador SLM-Tavenel, 0-shot, log-verosimilitud, no verificados de forma independiente):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| ARC-Easy | test | accuracy | 0,3194 |
| ARC-Challenge | test | accuracy | 0,1869 |
| HellaSwag | validation | accuracy | 0,2736 |
| Belebele (inglés) | `eng_Latn`, test | accuracy | 0,2789 |
| Belebele (francés) | `fra_Latn`, test | accuracy | 0,3078 |
| WinoGrande | `winogrande_xl`, validation | accuracy | 0,5170 |

No se han publicado en la información disponible resultados del modelo control (continuación solo con FSC) ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (25,7M parámetros, ~103 MB de pesos) y aproximadamente 50 MB en bfloat16; la caché KV para 1.024 tokens es despreciable a esta escala.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el propio autor entrenó la continuación en una RTX 4060 Laptop de 8 GB.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna de consumo (RTX 3050 en adelante, e incluso iGPU con memoria compartida suficiente).
- Opciones de despliegue: transformers (librería declarada, con `custom_code` por la compuerta de atención); se documenta una receta int8 para CPU en la model card. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El coste de cómputo declarado para el entrenamiento de 1.500 pasos fue de ~0,8 horas de GPU en una RTX 4060 Laptop; no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| slm-tavenel-25m-hplt-10pct | 25,7M | 1.024 | en, fr | MIT | Este checkpoint; adaptación 90/10 FSC/HPLT |
| slm-tavenel-25m (padre) | 25,7M | 1.024 | en, fr | MIT | Checkpoint base sin continuación HPLT; control del experimento EXP-0032 |
| Alternativas de 25M de otros autores | no disponible | no disponible | no disponible | no disponible | No se han identificado comparables en la información proporcionada |

La comparación directa más relevante es con el modelo padre y con la variante control del mismo experimento, cuyos resultados no se incluyen en la información disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni esperar respuestas útiles a preguntas directas.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Escala de 25,7M parámetros: capacidad de razonamiento y conocimiento del mundo muy limitada; los resultados en ARC-Challenge (0,1869) y HellaSwag (0,2736) están cerca del azar en tareas de cuatro opciones.
- Riesgo elevado de alucinación y de generación incoherente fuera de dominios cercanos a los datos de entrenamiento.
- Cobertura lingüística restringida a inglés y francés; no se documenta soporte de castellano ni de otras lenguas.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible; los datos web HPLT pueden introducir sesgos de dominio y de representación.
- Restricciones de licencia: la MIT cubre pesos y código del proyecto, pero no relicencia los datasets upstream. La revisión de derechos de la línea FSC y la revisión de derechos y privacidad a nivel de página de los datos HPLT siguen sin resolverse, lo que supone un riesgo para uso comercial o redistribución.
- Artefacto de investigación: el autor lo etiqueta explícitamente como `experimental` y `research-artifact`; no está pensado para producción.
- No se documentan garantías de reproducibilidad más allá de la semilla, el presupuesto de tokens y el hash de pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-25m-hplt-10pct
- Modelo padre: https://huggingface.co/athenista/slm-tavenel-25m
- Registro del experimento EXP-0032: https://huggingface.co/athenista/slm-tavenel-25m-hplt-10pct/blob/main/training_record/EXP-0032-results.md
- Repositorio del proyecto SLM-Tavenel: https://github.com/thekester/slm-tavenel
- Catálogo de modelos publicados: https://github.com/thekester/slm-tavenel#published-models
- Archivo de investigación y reproducibilidad: https://github.com/thekester/slm-tavenel#research-and-reproducibility
- Dataset French-Science-Commons: https://huggingface.co/datasets/PleIAs/French-Science-Commons
- Dataset european-hplt-v1: https://huggingface.co/datasets/ashtok897/european-hplt-v1
