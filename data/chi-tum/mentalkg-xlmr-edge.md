# CHI-TUM/mentalkg-xlmr-edge

## Resumen

`mentalkg-xlmr-edge` es un clasificador binario de pares diseñado para predecir aristas en un grafo de conocimiento de salud mental a partir de texto narrativo. Ha sido desarrollado por el grupo CHI-TUM y publicado en Hugging Face, en el contexto de la investigación `mentalkg` de Niklas1102. El modelo toma una entrada de diario en inglés o alemán y dos nodos candidatos etiquetados (tipo, polaridad y ancla temporal) y decide si ambos nodos están conectados. Se basa en la arquitectura `XLM-RoBERTa base`, con una cabeza de clasificación de un único logit y cuatro tokens especiales que delimitan cada nodo.

El problema que resuelve es la extracción estructurada de relaciones entre conceptos en narrativas personales, un paso clave para construir grafos de conocimiento en salud mental. El modelo es relevante porque permite analizar cómo se relacionan emociones, estresores y síntomas de forma bilingüe (inglés y alemán) con una ventana de contexto de 256 tokens. Al estar pensado para investigación, se limita a la descripción del contenido narrado, no a diagnóstico clínico. Tiene 278 millones de parámetros y se distribuye bajo licencia MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa base con cabeza de clasificación de un logit (transformer encoder) |
| Parametros totales | 278.047.489 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (límite de truncamiento en el pipeline); la arquitectura base soporta 512 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, de (inglés y alemán) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` y añade una cabeza lineal con una salida logit por par. La entrada se construye concatenando el texto de la entrada con dos segmentos extra, cada uno delimitado por los tokens `[N1]`/`[/N1]` y `[N2]`/`[/N2]`. El sufijo nunca se trunca; el texto de la entrada se trunca por la derecha cuando el total supera 256 tokens. La decisión final se toma aplicando sigmoid sobre el logit y comparando con un umbral de 0.39, guardado en `meta.json`. Para manejar la simetría, se recomienda puntuar ambos ordenamientos (A→B y B→A) y promediar.

El entrenamiento utilizó un corpus sintético bilingüe (EN/DE) de 41.315 muestras aceptadas, con muestreo de negativos duros dentro del grafo. La configuración publicada usa `entry_frac 1.0`, lr 2e-5 y 5 épocas. En el conjunto de prueba de 103.798 pares (negativos duros) con 3 semillas, el modelo alcanza una F1 media de 0.7488 y ROC-AUC de 0.8124. El texto de la entrada aporta una ventaja pequeña pero consistente frente a la ablación sin texto. Las relaciones (causes, increases, etc.) no las predice el modelo; se asignan por mayoría consultando `relation_map.json`, que cubre 35 pares ordenados de tipos.

## Capacidades

- Predicción de aristas (edge prediction): clasifica si dos nodos candidatos están conectados en un grafo de conocimiento de salud mental.
- Entrada multimodal textual: combina un texto narrativo (diario) con dos nodos en formato `[N1] label (type, polarity, time) [/N1]` y `[N2]`.
- Bilingüe inglés/alemán (en, de).
- Simetría explícita: promediar puntuaciones A→B y B→A.
- Salida de un logit por par, con sigmoid y umbral 0.39.
- No es generativo: no produce texto, ni razonamiento, ni soporta tool calling, agentes, visión o audio.

## Casos de uso

- Extracción de grafos de conocimiento a partir de diarios: el modelo se integra en un pipeline de extracción junto a `mentalkg-xlmr-node`; después de identificar nodos, `mentalkg-xlmr-edge` decide si están conectados.
- Análisis de relaciones en narrativas de salud mental: investigar cómo se vinculan emociones, estresores y síntomas en textos en inglés o alemán.
- Construcción de grafos bilingües comparativos: permite comparar redes de conceptos entre poblaciones de habla inglesa y alemana.
- Enlazado de entidades en historias clínicas narrativas (uso investigador): dado un texto y dos entidades candidatas, el modelo produce una probabilidad de conexión.
- Evaluación de coherencia entre conceptos en textos largos: útil para detectar si dos temas mencionados en una entrada de diario están relacionados, gracias al contexto de 256 tokens.
- Generación de grafos para aplicaciones de visualización (p. ej., Obsidian plugin): el repositorio `mentalkg` incluye un plugin que renderiza el grafo extraído; este modelo proporciona las aristas.
- Clasificación de pares de nodos en datasets de grafos: usar el modelo como baseline para predecir enlaces en grafos de conocimiento con tipos de nodo.

## Benchmarks y rendimiento

| Métrica | Con texto de entrada (media ± rango, 3 semillas) | Sin texto (ablación) |
|---|---|---|
| F1 | 0.7488 [0.7483, 0.7492] | 0.7408 [0.7407, 0.7410] |
| ROC-AUC | 0.8124 [0.8108, 0.8142] | 0.8038 [0.8038, 0.8039] |
| Accuracy | 0.7646 | 0.7448 |

Nota: evaluación sobre 103.798 pares de prueba con negativos duros. No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1.1 GB para los pesos en FP32; en la práctica, la inferencia puede requerir entre 2 y 4 GB dependiendo del tamaño del lote.
- GPU recomendada: cualquier GPU consumer con al menos 4 GB (RTX 3060, RTX 4090, etc.). También puede ejecutarse en CPU.
- Sí cabe en GPUs consumer de gama baja.
- Opciones de despliegue: transformers con PyTorch, tal como muestra el código de ejemplo. No se documentan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La única referencia de rendimiento en la información proporcionada es la comparación interna entre el modelo con texto de entrada y la ablación sin texto. No se han encontrado modelos comparables de la misma categoría en los datos disponibles.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el propio modelo indica que está fuera de alcance el uso diagnóstico o la ayuda a decisiones clínicas.
- Riesgo de error de clasificación: los falsos positivos/negativos pueden afectar a la estructura del grafo, y el umbral de 0.39 es un hiper-parámetro que puede no transferirse a otros dominios.
- Sesgos del corpus sintético: el entrenamiento se basa en datos sintéticos bilingües generados a partir del dataset `mentalkg`, lo que puede heredar sesgos y limitar la generalización a textos reales.
- Limitaciones de idioma: solo inglés y alemán; no soporta otros idiomas.
- Ventana de contexto limitada: el texto se trunca a 256 tokens, por lo que fragmentos largos pueden perder información relevante.
- Cubrición parcial de relaciones: el mapeo `relation_map.json` solo cubre 35 pares ordenados de tipos; combinaciones no vistas se asignan a `linked_to`.
- No es generativo ni multiuso: no puede realizar razonamiento libre, responder preguntas ni manejar tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CHI-TUM/mentalkg-xlmr-edge
- Repo de código: https://github.com/niklas1102/mentalkg
- Dataset mentalkg: https://huggingface.co/datasets/Niklas1102/mentalkg
- Modelo hermano (nodo): https://huggingface.co/Niklas1102/mentalkg-xlmr-node
