# Hooshaai/svd-linear-attention-distilbert-aegis-v3

## Resumen

El modelo `Hooshaai/svd-linear-attention-distilbert-aegis-v3` es un experimento de investigación en compresión de atención para clasificación de texto, desarrollado por Hooshaai. Se basa en un DistilBERT preentrenado al que se le sustituye la atención estándar por el módulo AEGIS-Attention V3, una arquitectura híbrida que combina atención local dispersa con una rama global de atención lineal basada en Random Fourier Features (RFF). El objetivo es reducir el coste computacional de la atención manteniendo un rendimiento aceptable en tareas de clasificación, concretamente en el dataset GLUE SST-2.

El modelo se presenta como un banco de pruebas para técnicas de eficiencia: la compresión se logra mediante proyecciones SVD con restricción de energía, activaciones Softpick que fuerzan sparsity exacta en la atención local y un mecanismo de gating adaptativo por cabeza. Según la información disponible, alcanza una exactitud de validación del 62,84 % en SST-2, una ratio de compresión de 1,1968 y un pico de VRAM de 288,41 MB. No se especifican el número total de parámetros ni la longitud de contexto, y el repositorio declara un tamaño de 0,0 GB, lo que sugiere que los pesos podrían no estar publicados o ser un artefacto incompleto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DistilBERT) con módulo de atención AEGIS-Attention V3 (híbrido: local Softpick sparse + global RFF linear) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (no se especifica safetensors; el repo declara 0,0 GB) |

## Arquitectura y entrenamiento

El módulo AEGIS-Attention V3 sustituye la atención multi-cabeza estándar de DistilBERT por un esquema de tres vías. Primero, las proyecciones de consultas, claves y valores se factorizan mediante un cuello de botella de bajo rango con SVD dinámico, seleccionando un rango \(r \in [4, 64]\) que preserve al menos el 95 % de la energía de los valores singulares. La atención local se divide en 8 cabezas y aplica la activación Softpick, que reemplaza el softmax por una exponencial umbralizada con ReLU, garantizando que las claves con puntuación no positiva reciben probabilidad exactamente cero. La rama global usa 4 cabezas con atención lineal RFF: proyecta consultas y claves a un espacio de Fourier de 256 dimensiones con centrado en media cero, logrando complejidad \(O(L \cdot F)\) en lugar de \(O(L^2)\). Finalmente, un mecanismo de gating aprendido por cabeza, inicializado con sesgo 1,8, combina las salidas locales y globales.

El entrenamiento descrito es un fine-tuning de recuperación tras la compresión, con 50 pasos de recuperación, evaluado en GLUE SST-2. No se proporcionan datos sobre el tamaño del dataset, número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. La única información de entrenamiento es la métrica de validación y el tiempo de evaluación. La técnica destaca por su enfoque en eficiencia de atención, pero el rendimiento obtenido es muy inferior al de un DistilBERT sin comprimir.

## Capacidades

- Clasificación de texto: el modelo está entrenado para la tarea de análisis de sentimiento en inglés (SST-2). Su capacidad real es la de un clasificador binario de frases.
- Atención eficiente: implementa sparsity exacta en la atención local mediante Softpick y una rama global lineal con RFF, reduciendo la complejidad cuadrática de la atención.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente autónomo.
- Capacidades multilingües: limitadas al inglés, según los metadatos.
- No dispone de capacidades de visión, audio ni generación de texto libre; es un modelo discriminativo de clasificación.
- Incluye un modo de compresión con ratio 1,1968, que reduce ligeramente el uso de VRAM en comparación con el modelo base.

## Casos de uso

- Investigación en compresión de atención: el modelo sirve como referencia para estudiar el impacto de sustituir la atención estándar por variantes dispersas y lineales. Los investigadores pueden analizar cómo afecta la sparsity de Softpick y la rama RFF al rendimiento en tareas de clasificación.
- Evaluación de técnicas de eficiencia en hardware con VRAM limitada: con un pico de VRAM de 288,41 MB, puede ejecutarse en GPUs de consumo, lo que permite probar prototipos de atención eficiente en entornos sin acceso a GPUs de gran memoria.
- Comparación de arquitecturas de atención en DistilBERT: sirve como modelo de referencia para comparar con otras variantes de atención subcuadrática (por ejemplo, lineal, sliding window, sparse) en la misma tarea y con el mismo backbone.
- Docencia y demostración de conceptos de atención dispersa: el código y los pesos, si estuvieran disponibles, podrían usarse en cursos o talleres para ilustrar cómo se implementa una atención con sparsity exacta y gating adaptativo.
- Pruebas de concepto en clasificación de textos cortos en inglés: para experimentos donde el rendimiento no sea crítico, podría emplearse como clasificador de sentimiento en frases breves, aunque su exactitud del 62,84 % lo hace poco competitivo.
- Benchmarking de compresión en modelos pequeños: el modelo puede incluirse en suites de evaluación de técnicas de compresión, midiendo la relación entre ratio de compresión y pérdida de exactitud.

## Benchmarks y rendimiento

| Metric | Valor |
|---|---|
| Validation Accuracy (SST-2) | 62,84 % |
| F1 Score | 0,7286 |
| Compression Ratio | 1,1968 |
| Peak GPU VRAM | 288,41 MB |
| Pure Eval Time | 31,03 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. La exactitud del 62,84 % en SST-2 es notablemente baja: un DistilBERT estándar alcanza típicamente en torno al 90 % en esta tarea, lo que indica una pérdida severa de rendimiento tras la compresión.

## Requisitos de hardware

- VRAM estimada: 288,41 MB según la medición del autor durante la evaluación. Esto es compatible con cualquier GPU moderna, incluidas las de gama de consumo.
- GPU recomendadas: no se especifica una GPU concreta. Dado el tamaño, una RTX 3060 o superior sería suficiente. También podría ejecutarse en CPU, aunque el tiempo de evaluación de 31,03 s sugiere que la GPU acelera el proceso.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo PyTorch de clasificación, podría cargarse con la biblioteca `transformers` de HuggingFace, aunque el tamaño del repositorio de 0,0 GB indica que los pesos podrían no estar disponibles para descarga.
- Latencia y throughput: solo se dispone del tiempo puro de evaluación de 31,03 s, sin especificar tamaño de lote ni hardware, por lo que no se puede calcular un throughput fiable.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No es posible realizar una comparativa con otras variantes de DistilBERT comprimido o con modelos de atención eficiente sin datos adicionales. La información disponible solo incluye el propio modelo y su rendimiento en SST-2.

## Limitaciones y advertencias

- Rendimiento muy bajo: la exactitud del 62,84 % en SST-2 está muy por debajo de la de un DistilBERT sin comprimir, lo que limita su utilidad en aplicaciones reales.
- Idioma limitado: solo soporta inglés, sin capacidades multilingües.
- Modelo experimental: está pensado como prueba de concepto de compresión de atención, no como un modelo listo para producción.
- Repositorio con tamaño 0,0 GB: sugiere que los pesos del modelo podrían no estar realmente publicados o que el repositorio está vacío. Esto impide verificar su funcionamiento.
- Datos de entrenamiento incompletos: no se especifican el número de parámetros, la longitud de contexto ni la composición del dataset de entrenamiento, lo que dificulta su evaluación rigurosa.
- Posibles sesgos: al entrenarse en SST-2 (dataset de reseñas de películas en inglés), el modelo puede heredar sesgos lingüísticos y culturales de ese dominio.
- Licencia MIT: permite uso comercial, pero el bajo rendimiento y la falta de pesos disponibles hacen inviable su implementación en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-aegis-v3
- Web del autor: https://hooshaai.github.io/
- GitHub del autor: https://github.com/Hooshaai
