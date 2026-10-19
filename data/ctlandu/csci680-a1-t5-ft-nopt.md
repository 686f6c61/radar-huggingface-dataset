# CTlandu/csci680-a1-t5-ft-nopt

## Resumen

`CTlandu/csci680-a1-t5-ft-nopt` es un checkpoint de T5-small con 60.506.624 parámetros ajustado para dos tareas de revisión automática de código sobre métodos Java: reescribir un método a partir de una reseña de código y generar la reseña a partir del método. Su particularidad es que se entrena **desde pesos aleatorios**: no parte del checkpoint preentrenado de T5, sino que se ajusta desde cero sobre 100.000 pares de ejemplos. Es la denominada condición A (sin preentrenamiento) del primer trabajo de la asignatura CSCI 680, y su gemelo `CTlandu/csci680-a1-t5-ft-pt` repite el experimento partiendo del modelo preentrenado.

El modelo cubre ambas tareas con una sola red gracias a un prefijo de tarea en la entrada (`code&comment2code:` y `code2comment:`), lo que evita mantener dos modelos separados. Los resultados publicados son muy bajos (exact match de 9 sobre 5.000 en la tarea de reescritura y de 0 sobre 5.000 en la de generación de comentarios), coherentes con la ausencia de preentrenamiento y con el tamaño reducido del modelo.

Su relevancia es metodológica, no práctica: sirve como línea base controlada para medir cuánto aporta el preentrenamiento en tareas de ingeniería de software y como ejemplo reproducible de ajuste fino de un modelo seq2seq en un contexto docente. No está planteado para uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (T5-small) |
| Parámetros totales | 60.506.624 (según safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite arquitectónico de la familia T5; no se explicita en la model card) |
| Tipos de cuantización | No disponible: solo se publican pesos en safetensors; no hay versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Inglés y código (Java); etiquetas `en` y `code` |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con `transformers`) |

Otros datos: repositorio de 0,2 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 19 de octubre de 2026. La etiqueta `pipeline` aparece como no disponible en la ficha de HuggingFace, aunque el modelo declara `text2text-generation` y `text-generation-inference`.

## Arquitectura y entrenamiento

T5-small es un Transformer encoder-decoder con atención de producto escalar completa, sesgo posicional relativo y vocabulario SentencePiece. La configuración estándar de T5-small es de 6 capas en el encoder y 6 en el decoder, `d_model` de 512, 8 cabezas de atención y `d_ff` de 2.048, lo que da lugar a los 60,5 millones de parámetros. La model card no detalla la configuración exacta utilizada ni aclara si se reutiliza el tokenizador de T5 original o si los embeddings se inicializan de forma aleatoria junto con el resto de pesos; conviene verificar ambos puntos antes de reproducir el experimento.

El ajuste fino emplea 100.000 pares fusionados (ambas tareas en un único conjunto), 100.000 pasos con tamaño de lote 32, optimizador AdamW con tasa de aprendizaje 3e-4 y precisión bf16. Equivale a procesar unos 3,2 millones de ejemplos, es decir, varias épocas sobre el conjunto de 100.000 pares. El checkpoint se selecciona por exact match en validación, con desempate por similitud, y el elegido es el paso 45.000. No se documenta uso de RLHF, DPO ni ninguna técnica de alineación posterior; tampoco decodificación especulativa ni mecanismos de atención lineal.

Los datos proceden de Tufano et al., *Using Pre-Trained Models to Boost Code Review Automation* (ICSE 2022), publicados en Zenodo con DOI 10.5281/zenodo.5387856 bajo licencia CC BY 4.0, en el submuestreo preparado para el curso.

## Capacidades

- Generación de código condicionada: reescritura de un método Java a partir del método original más una reseña en lenguaje natural, con marcas `<START>` y `<END>` para delimitar el fragmento señalado.
- Generación de reseñas de código: produce un comentario de revisión en inglés a partir de un método Java.
- Enrutado por prefijo de tarea: un solo conjunto de pesos resuelve ambas tareas mediante `code&comment2code:` y `code2comment:`.
- Modelo seq2seq puro: entrada de texto, salida de texto, sin cabezas adicionales.
- Capacidades ausentes de forma explícita: no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni comportamiento de agente, no tiene modo de razonamiento (thinking), no procesa imágenes ni audio y no cubre matemáticas más allá de lo que aparezca en el código.
- Cobertura lingüística limitada a inglés y Java; no hay evidencia de soporte de otros lenguajes de programación ni de otras lenguas naturales.

## Casos de uso

- Línea base de investigación: medir la contribución real del preentrenamiento comparando este checkpoint con `CTlandu/csci680-a1-t5-ft-pt`, que usa idénticos datos, hiperparámetros y criterio de selección, y así aislar el efecto de la inicialización.
- Docencia y reproducción de experimentos: el par de modelos permite explicar en un aula el impacto del preentrenamiento en tareas de ingeniería del software con un coste de cómputo mínimo (unos 100.000 pasos sobre 60,5 M de parámetros).
- Pruebas de infraestructura de entrenamiento: por su tamaño, sirve para validar pipelines de datos, tokenización, empaquetado de secuencias y lógica de selección de checkpoint antes de escalar a modelos mayores.
- Pruebas de humo de sistemas de evaluación: al producir salidas de baja calidad de forma controlada, es útil para verificar que las métricas (exact match, BLEU-4, CodeBLEU) y los scripts de comparación funcionan correctamente en casos límite.
- Demostración de despliegue de bajo coste: permite montar un endpoint compatible con Text Generation Inference o un servicio `transformers` en CPU para probar integraciones de API sin gastar GPU.
- Estudio de currículos de entrenamiento: al estar entrenado desde cero, es un punto de partida adecuado para experimentar con inicializaciones alternativas, schedulers de tasa de aprendizaje o aumento de datos sin partir de un modelo preentrenado.
- Análisis de errores en generación de código: su tasa de acierto cercana a cero lo convierte en un caso de estudio útil para catalogar modos de fallo típicos (código truncado, repetición, salida vacía) en modelos seq2seq pequeños.

## Benchmarks y rendimiento

Resultados publicados por el autor, con decodificación greedy y 5.000 ejemplos de test por tarea:

| Tarea | Métrica | Resultado |
|---|---|---|
| code&comment2code | Exact match | 9 / 5.000 (0,18 %) |
| code&comment2code | CodeBLEU | 17,6 |
| code2comment | Exact match | 0 / 5.000 (0,00 %) |
| code2comment | BLEU-4 | 0,31 |

No se han publicado resultados de benchmarks en la información disponible para tareas generales (MMLU, HumanEval, GSM8K u otras), ni comparaciones numéricas con modelos de referencia más allá de la comparación cualitativa con el checkpoint preentrenado del mismo autor.

## Requisitos de hardware

| Precisión de los pesos | Tamaño de los pesos | VRAM estimada en inferencia |
|---|---|---|
| fp32 | ~242 MB | menos de 1 GB |
| fp16 / bf16 | ~121 MB | menos de 1 GB |
| int8 (no publicada) | ~60 MB | menos de 1 GB |

- Cabe holgadamente en cualquier GPU de consumo: GTX 1060, RTX 3060, RTX 4090, e incluso en CPU o en placas tipo Raspberry Pi para inferencia por lotes pequeños.
- GPU de datacenter (A100, H100) innecesarias: el modelo no aprovecha su ancho de banda ni su memoria.
- Opciones de despliegue: `transformers` con `pipeline("text2text-generation")`, servidor HTTP propio, y Text Generation Inference (el modelo incluye la etiqueta `endpoints_compatible`). No hay pesos GGUF ni ONNX publicados, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del modelo el coste por secuencia es muy bajo, pero la longitud de entrada típica (métodos Java completos) puede acercarse al límite de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Inicialización | Checkpoint | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|---|
| `CTlandu/csci680-a1-t5-ft-nopt` (este) | 60,5 M | 512 tokens (T5-small) | Aleatoria (sin preentrenamiento) | Paso 45.000 | EM 0,18 % / CodeBLEU 17,6; EM 0 % / BLEU-4 0,31 | No disponible |
| `CTlandu/csci680-a1-t5-ft-pt` | 60,5 M (misma arquitectura) | 512 tokens (T5-small) | Checkpoint preentrenado de T5 | No disponible en la información | No disponible en la información | No disponible |
| `dmilanko/code-review-t5-nopt` | No disponible (T5-small, misma tarea) | 512 tokens (T5-small) | Aleatoria (condición A) | Paso 30.000 | No disponible en la información | No disponible |

La comparación relevante es interna al experimento: los tres modelos comparten arquitectura, datos y tareas, y difieren en la inicialización y en el paso de checkpoint seleccionado, lo que los convierte en un conjunto controlado para estudiar el efecto del preentrenamiento. No se dispone de datos para comparar con modelos de revisión de código de mayor tamaño.

## Limitaciones y advertencias

- Calidad muy baja: exact match de 0,18 % y 0 % en las dos tareas, y BLEU-4 de 0,31 en la generación de comentarios. No es utilizable como herramienta real de revisión de código.
- Entrenado desde pesos aleatorios: no ha visto lenguaje natural ni código más allá de los 100.000 pares de ajuste, por lo que carece de conocimiento general y de vocabulario técnico amplio.
- Riesgo alto de alucinación y de salidas degeneradas: repeticiones, truncamientos, métodos sintácticamente inválidos o comentarios genéricos.
- Cobertura restringida a Java e inglés; no hay evidencia de funcionamiento en otros lenguajes de programación ni en castellano.
- Ventana de contexto de 512 tokens: los métodos largos se truncan, lo que afecta directamente a la tarea de reescritura.
- Licencia del modelo no declarada: no se puede asumir uso comercial. Los datos de ajuste son CC BY 4.0 (Zenodo 10.5281/zenodo.5387856), lo que exige atribución si se redistribuyen derivados.
- Procedencia docente: es un artefacto de una asignatura, sin documentación de sesgos, sin evaluación de robustez y con 0 descargas, por lo que no ha pasado revisión por pares ni uso en producción.
- No dispone de salvaguardas: no hay filtrado de contenido, alineación ni instrucciones de sistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CTlandu/csci680-a1-t5-ft-nopt
- Variante con preentrenamiento: https://huggingface.co/CTlandu/csci680-a1-t5-ft-pt
- Modelo equivalente de otro autor (condición A, paso 30.000): https://huggingface.co/dmilanko/code-review-t5-nopt
- Dataset de ajuste fino (Tufano et al., ICSE 2022), Zenodo: https://doi.org/10.5281/zenodo.5387856
- Repositorio de código del curso: `aura-lab-wm/teaching-genai4se-2026-jtang05` (identificador citado en la model card; no se proporciona URL completa)
- Artículo de referencia: Tufano et al., *Using Pre-Trained Models to Boost Code Review Automation*, ICSE 2022 (sin URL directa en la información disponible)
