# qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed1024

## Resumen

El modelo `ppt-pythia-160m-c4-equal-budget-two-stage-seed1024`, publicado por el usuario qing-yao en HuggingFace, es un artefacto de investigación consistente en una reproducción de la arquitectura Pythia-160M entrenada desde cero (sin cargar pesos preentrenados) sobre el corpus inglés C4. Se trata de la rama "two_stage" de un experimento controlado con presupuesto de cómputo igualado: tras la actualización 500 se reinician los embeddings de entrada y salida, el optimizador y el planificador de tasa de aprendizaje, y se continúa el entrenamiento durante 10.000 actualizaciones más, hasta un total de 10.500 actualizaciones.

El modelo tiene 162.322.944 parámetros totales y un vocabulario de 50.304 entradas, con secuencias de 2.048 tokens durante todo el entrenamiento (32 secuencias por actualización, lo que equivale a unos 688 millones de tokens procesados). No emplea mezcla de expertos: es un transformer denso de tipo GPT-NeoX, la familia arquitectónica de Pythia.

Su relevancia es estrictamente experimental: sirve para estudiar dinámicas de preentrenamiento y el efecto de reinicializaciones parciales bajo un presupuesto de tokens fijo, no como modelo de propósito general. La model card solo reporta la pérdida final de validación en C4 (3,679870 en FP32), sin benchmarks estándar, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decodificador-only, familia GPT-NeoX (Pythia-160M) |
| Parametros totales | 162.322.944 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible en el repositorio; pesos publicados en FP32 (safetensors). Convertibles a GGUF/INT8/INT4 mediante herramientas externas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible (no declarada en los metadatos del repositorio) |
| Formato de pesos | safetensors (FP32) |
| Vocabulario | 50.304 tokens (tokenizador fijado e incluido en el repositorio) |
| Tamano del repositorio | 3,2 GB (incluye 4 checkpoints con pesos, estado del optimizador/RNG y recibos de checksum) |
| Pipeline | text-generation |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-160M: un transformer autoregresivo de tipo GPT-NeoX con atención causal estándar (no se emplean variantes lineales, SSM ni hibridaciones). El repositorio no incluye la configuración detallada de capas, pero al tratarse de una reproducción "fresh" de la arquitectura Pythia-160M se corresponde con la configuración pública de esa familia. El entrenamiento parte de pesos aleatorios: la model card indica explícitamente que no se cargaron pesos preentrenados.

El régimen de entrenamiento es de presupuesto igualado entre dos brazos experimentales. La rama continua usa un único planificador de tasa de aprendizaje; la rama two-stage (este repositorio, semilla 1024) reinicia los embeddings de entrada y salida, el optimizador y el planificador tras la actualización 500 y entrena 10.000 actualizaciones adicionales, con 32 secuencias de 2.048 tokens por actualización (≈688 millones de tokens en total). Ambos brazos consumen los mismos ejemplos en el mismo orden. Los datos son C4 en inglés; el corpus no se sube al repositorio, solo su manifiesto con hash, la fuente de preparación y los registros. Se conservan cuatro checkpoints locales con pesos, estado del optimizador/RNG y recibos de checksum; los checkpoints intermedios podados durante el entrenamiento no están disponibles. Las curvas de pérdida de los distintos brazos usan precisión y enmascaramiento diferentes, por lo que la model card advierte de que deben compararse métricas equivalentes.

## Capacidades

- Generación de texto autoregresiva en inglés, con calidad limitada por un presupuesto de entrenamiento muy reducido (≈688 millones de tokens).
- Capacidad de continuación de texto y modelado de lenguaje a nivel de token sobre dominio web en inglés (C4), con pérdida de validación FP32 de 3,679870 en las primeras 512 secuencias.
- No hay evidencia de soporte de tool calling ni function calling: no se menciona en la model card ni se proporciona plantilla de chat.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- Monolingüe: únicamente inglés; no se declara capacitación multilingüe.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- Utilizable como punto de partida para fine-tuning e investigación sobre dinámicas de preentrenamiento; el tokenizador está fijado e incluido.

## Casos de uso

- Investigación en dinámicas de preentrenamiento: comparar la rama two-stage con la continua bajo el mismo presupuesto de tokens y el mismo orden de ejemplos, para medir el efecto del reinicio de embeddings y del optimizador en la pérdida de validación.
- Reproducción de experimentos con control de semilla: la semilla 1024 y los recibos de checksum permiten auditar la repetibilidad del entrenamiento y de los cuatro checkpoints retenidos.
- Ablaciones sobre reinicialización de embeddings: analizar si el reinicio de las matrices de entrada/salida tras la actualización 500 acelera o degrada la convergencia en modelos pequeños.
- Docencia y formación: modelo de 162 millones de parámetros entrenable y desplegable en hardware modesto para ilustrar el ciclo completo de preentrenamiento, tokenización y evaluación de pérdida.
- Fine-tuning sobre tareas de clasificación o generación en inglés: al ser un modelo pequeño, permite iterar rápidamente sobre datasets de dominio específico con coste de cómputo bajo.
- Prototipado de infraestructura de inferencia: validar pipelines con vLLM, TGI, llama.cpp u Ollama, medir latencia y probar cuantizaciones antes de escalar a modelos mayores.
- Generación de texto de bajo coste en entornos sin GPU: con pesos en INT4 el modelo ocupa del orden de decenas de megabytes, por lo que puede ejecutarse en CPU para pruebas de integración.
- Estudio de sesgos en corpus web en inglés: analizar qué sesgos del C4 se reflejan en un modelo entrenado exclusivamente con ese corpus y con presupuesto controlado.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El único dato cuantitativo de rendimiento disponible es la pérdida final:

| Metrica | Valor |
|---|---|
| Perdida final C4 (FP32, primeras 512 secuencias de validacion) | 3,679870 |
| Actualizaciones del optimizador | 10.500 |
| Tokens por actualizacion | 32 secuencias x 2.048 tokens = 65.536 |
| Tokens totales (derivado de los datos de la model card) | 688.128.000 (≈688 millones) |

No se han publicado resultados de benchmarks estándar en la informacion disponible. La model card remite al directorio `reports/` del repositorio para los seis puntos de medición y las comparaciones emparejadas, pero esos valores no se incluyen en la información proporcionada.

## Requisitos de hardware

- Pesos en FP32: ≈649 MB (162,3 M de parámetros x 4 bytes). Es el formato publicado en safetensors.
- Pesos en FP16/BF16: ≈325 MB.
- Pesos en INT8: ≈162 MB.
- Pesos en INT4: ≈81 MB.
- Memoria KV: estimación a partir de la configuración estándar de Pythia-160M (12 capas, 12 cabezas, dimensión de cabeza 64) de ≈36 KB por token en FP16, es decir ≈75 MB para la ventana completa de 2.048 tokens. Cifra orientativa, no publicada en el repositorio.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente incluso en FP32; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, con la GPU muy sobredimensionada para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas actuales e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: sí, con cuantización INT8/INT4 la inferencia en CPU es viable para pruebas y prototipos.
- Opciones de despliegue: transformers (nativo, con `AutoModelForCausalLM`), text-generation-inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no se han publicado cifras de latencia ni de throughput en la información disponible. En la práctica, para 162 M de parámetros el cuello de botella suele ser el ancho de banda de memoria y el overhead de orquestación más que el cómputo.

## Comparativa con modelos similares

Los datos de entrenamiento de los modelos de referencia provienen de su documentación pública y deben verificarse en las fichas originales; no se dispone de comparativas de benchmarks para este modelo.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| ppt-pythia-160m-c4-equal-budget-two-stage-seed1024 | 162,3 M | 2.048 | ≈688 M (C4, ingles) | No disponible | Artefacto de investigacion; rama two-stage con reinicio en la actualizacion 500 |
| Pythia-160M (EleutherAI) | 162,3 M | 2.048 | 300 B (The Pile) | Apache-2.0 | Modelo de referencia de la misma arquitectura, con 300 B tokens y 154 checkpoints publicados |
| GPT-2 124M (OpenAI) | 124 M | 1.024 | No declarado (WebText, ≈40 GB) | MIT (modificada) | Arquitectura GPT-2 clasica, tokenizador BPE de 50.257 entradas |
| OPT-125M (Meta) | 125 M | 2.048 | 180 B (segun documentacion publica de OPT) | No disponible en esta ficha (consultar la licencia OPT de Meta) | Decoder-only con embeddings posicionales aprendidos |

Diferencias clave: frente a Pythia-160M, este modelo usa el mismo esqueleto pero con un presupuesto de entrenamiento dos ordenes de magnitud menor y un corpus diferente (C4 en lugar de The Pile), por lo que no es comparable en calidad de generación. Frente a GPT-2 124M, la ventana de contexto es el doble, pero el entrenamiento es mucho mas corto. No se dispone de comparaciones de rendimiento publicadas para ninguno de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica términos de uso. Sin una licencia explícita, el uso comercial es legalmente arriesgado; conviene contactar con el autor antes de cualquier despliegue en producción.
- Presupuesto de entrenamiento muy bajo (≈688 millones de tokens) para una arquitectura de 162 M de parámetros: la coherencia a medio y largo plazo será limitada y la pérdida de validación (3,679870) es alta.
- Riesgo elevado de alucinación y de texto incoherente: no se ha aplicado alineamiento declarado (RLHF, DPO u otro) ni ajuste por instrucciones; no existe plantilla de chat.
- Sesgos de C4: el corpus procede de texto web en inglés filtrado heurísticamente, con los sesgos demográficos, culturales y de género típicos de ese tipo de datos, además de posible contenido tóxico o estereotipado.
- Monolingüe en inglés: no se declara soporte de castellano ni de ningún otro idioma.
- Contexto limitado a 2.048 tokens: no apto para documentos largos, resúmenes extensos ni conversaciones multi-turno prolongadas.
- Datos de entrenamiento no publicados: solo se incluye el manifiesto con hash y los registros, por lo que la auditoría completa del corpus no es posible desde el repositorio.
- Checkpoints intermedios podados no disponibles: solo se conservan cuatro checkpoints locales, lo que limita los estudios de trayectoria de entrenamiento.
- Comparaciones internas delicadas: las curvas de pérdida entre brazos usan precisión y enmascaramiento distintos, según advierte la propia model card; comparar valores entre brazos sin homogeneizar puede inducir a error.
- No apto para producción: es un artefacto de investigación sin benchmarks, sin garantías de robustez y con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qing-yao/ppt-pythia-160m-c4-equal-budget-two-stage-seed1024
- Directorio `reports/` del repositorio: incluido en el propio repositorio de HuggingFace (seis puntos de medición y comparaciones emparejadas)
- Fichero `run.json` del repositorio: receta completa del entrenamiento
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
