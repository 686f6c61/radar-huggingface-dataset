# qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed1024

## Resumen

El modelo `ppt-pythia-160m-c4-equal-budget-continuous-seed1024` es un modelo de lenguaje de 162.322.944 parámetros entrenado desde cero (sin cargar pesos preentrenados) por el usuario de HuggingFace `qing-yao`. Emplea la arquitectura de Pythia-160M (familia GPT-NeoX, causal decoder-only) y ha sido entrenado exclusivamente sobre el corpus en inglés C4. Forma parte de un experimento comparativo denominado "equal-budget" que contrasta dos estrategias de entrenamiento: una rama "continuous" con una única planificación de learning rate y una rama "two-stage" que reinicia embeddings, optimizador y schedule tras la actualización 500.

El entrenamiento totaliza 10.500 actualizaciones del optimizador, cada una con 32 secuencias de 2.048 tokens, lo que equivale a aproximadamente 688 millones de tokens procesados. El vocabulario es de 50.304 entradas. La pérdida final en FP32 sobre las primeras 512 secuencias de validación de C4 es de 3,714538. Este checkpoint concreto corresponde a la rama continua con semilla 1024, y su relevancia actual es fundamentalmente metodológica: sirve como referencia reproducible para estudiar cómo afecta la planificación del learning rate y el reinicio de capas al rendimiento final bajo un presupuesto de cómputo idéntico.

No se trata de un modelo orientado a producción ni a uso general, sino de un artefacto de investigación sobre dinámica de entrenamiento. El repositorio incluye tres checkpoints locales conservados (con pesos, estado del optimizador/RNG y recibos de checksum), el tokenizador fijado y los informes de las seis ejecuciones emparejadas, pero no los datos de entrenamiento originales (solo el manifiesto con hash y los logs de preparación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, familia GPT-NeoX (Pythia-160M) |
| Parametros totales | 162.322.944 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia del entrenamiento) |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors FP32, admite conversion a FP16, INT8 e INT4 mediante herramientas externas |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-160M, un transformer decoder-only de tipo GPT-NeoX con atención causal y embeddings posicionales rotatorios (RoPE). El modelo fue inicializado desde cero: no se cargaron pesos preentrenados de ningún checkpoint previo. El vocabulario tiene 50.304 entradas y se incluye un tokenizador fijado ("pinned") en el repositorio.

El entrenamiento se realizó sobre el corpus en inglés C4 durante 10.500 actualizaciones totales del optimizador, con un lote de 32 secuencias de 2.048 tokens por actualización (65.536 tokens por paso, ~688 millones de tokens en total). La rama "continuous" aquí publicada emplea una única planificación de learning rate de principio a fin. La rama comparada, "two-stage", reinicia los embeddings de entrada y salida, el optimizador y el schedule tras la actualización 500 y entrena 10.000 actualizaciones adicionales; ambas ramas consumen exactamente los mismos ejemplos en el mismo orden. No se menciona en la información disponible el uso de RLHF, DPO, SFT ni ninguna etapa de alineación posterior. Los informes de las seis ejecuciones emparejadas y la receta completa se encuentran en los directorios `reports/` y en `run.json`.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la arquitectura Pythia-160M.
- Modelado de lenguaje causal: la tarea para la que fue entrenado y evaluado (perplejidad/pérdida sobre C4).
- Ninguna capacidad documentada de tool calling ni function calling.
- Ninguna capacidad documentada de agentes ni razonamiento multi-paso.
- Soporte multilingüe: no disponible; el único idioma declarado es el inglés.
- No se documentan modos especiales (thinking mode, visión, audio) ni capacidades multimodales.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: comparar la pérdida final de esta rama continua (3,714538) con la rama two-stage bajo presupuesto de cómputo idéntico para estudiar el efecto del reinicio de capas y del schedule.
- Reproducibilidad de experimentos: al incluir estado del optimizador, estado RNG y recibos de checksum, permite reanudar o auditar exactamente el mismo entrenamiento.
- Estudio del efecto de la semilla: la semilla 1024 forma parte de un conjunto de ejecuciones emparejadas, útil para analizar varianza entre inicializaciones.
- Línea base de bajo coste para pruebas de pipelines de generación de texto: con 162M de parámetros se puede ejecutar en cualquier GPU de consumo para validar infraestructura (tokenización, batching, decodificación).
- Análisis de pérdida y perplejidad sobre C4: el modelo sirve como referencia para medir la dificultad intrínseca del corpus con un presupuesto de tokens fijo (~688M).
- Docencia y experimentación académica: es un ejemplo autocontenido de entrenamiento desde cero con receta y logs publicados, adecuado para cursos de formación de modelos a pequeña escala.
- Pruebas de cuantización y despliegue: permite medir el impacto de la cuantización en un modelo pequeño con pérdida de referencia conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento reportado por el autor es la pérdida final en FP32 sobre las primeras 512 secuencias de validación de C4: **3,714538**. El autor advierte expresamente que las curvas de pérdida de las distintas ramas usan precisión y enmascaramiento diferentes, por lo que deben compararse solo métricas homogéneas.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 650 MB solo para pesos (162M parámetros × 4 bytes), más overhead de activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 325 MB para pesos.
- VRAM estimada en INT8: aproximadamente 162 MB para pesos.
- VRAM estimada en INT4: aproximadamente 81 MB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, así como A100/H100 (sobradamente dimensionadas para este tamaño).
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU moderna, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: Transformers (soporte nativo, formato safetensors), Text Generation Inference (la model card incluye el tag `text-generation-inference`), vLLM, y llama.cpp/Ollama previa conversión a GGUF (no se incluye GGUF en el repositorio).
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-pythia-160m-c4-equal-budget-continuous-seed1024 | 162.322.944 | 2.048 tokens | Desde cero, C4 en ingles, 10.500 updates (~688M tokens) | No disponible | HuggingFace (safetensors) |
| Pythia-160M (EleutherAI) | 162M | 2.048 tokens | Desde cero, The Pile, ~300B tokens | Apache 2.0 | HuggingFace |
| GPT-2 small | 124M | 1.024 tokens | WebText, ~40 GB de texto | MIT (pesos de OpenAI) | HuggingFace |
| Pythia-160M deduplicated | 162M | 2.048 tokens | Desde cero, The Pile deduplicado | Apache 2.0 | HuggingFace |

La diferencia clave frente a las alternativas es el presupuesto de entrenamiento: este modelo consume aproximadamente 688 millones de tokens, muy por debajo de los ~300.000 millones de Pythia-160M oficial, por lo que su pérdida y su calidad de generación no son comparables en igualdad de condiciones. No se dispone de métricas de benchmarks que permitan una comparación cuantitativa directa.

## Limitaciones y advertencias

- Presupuesto de entrenamiento muy reducido (~688M tokens) frente a los ~300B de Pythia-160M original: cabe esperar una calidad de generación muy inferior y una pérdida elevada (3,71 en C4).
- Modelo exclusivamente en inglés; no hay evidencia de capacidades en otros idiomas.
- Riesgo alto de alucinación y de texto incoherente, propio de un modelo de 162M parámetros con entrenamiento limitado y sin alineación (no consta RLHF, DPO ni SFT).
- Sesgos: el corpus C4 es texto web en inglés y arrastra sesgos de género, raza, religión y nacionalidad; no se ha documentado ninguna mitigación.
- Licencia no disponible: la ausencia de una licencia explícita impide confirmar si se permite el uso comercial; se debe contactar con el autor antes de cualquier uso en producción.
- Los datos de entrenamiento no se subieron al repositorio (solo manifiesto con hash y logs), lo que dificulta la auditoría completa del dataset.
- Los checkpoints intermedios podados durante el entrenamiento no están disponibles; solo se conservan tres checkpoints locales.
- Las curvas de pérdida entre ramas usan precisión y enmascaramiento distintos, por lo que las comparaciones directas entre ellas pueden ser engañosas.
- No hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) publicados, así que no se puede verificar ninguna capacidad downstream.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de validación por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-continuous-seed1024
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
