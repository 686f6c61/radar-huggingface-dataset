# shauryakochar/anlp-a1-c5

## Resumen

El modelo `shauryakochar/anlp-a1-c5` es un transformer encoder-decoder construido desde cero con operaciones básicas de PyTorch, sin utilizar los módulos de alto nivel `nn.Transformer`, `nn.MultiheadAttention` ni `nn.LayerNorm`. Forma parte de un ejercicio académico de la asignatura ANLP (Advanced Natural Language Processing) y está diseñado para una tarea muy concreta: mapear secuencias binarias cifradas a texto plano. En concreto, el cifrado consiste en la representación binaria ASCII de 8 bits de cada carácter seguida de un separador `|`, y el modelo debe aprender a invertir esa transformación.

El modelo se identifica como configuración C5, descrita como "Byte Latent Transformer (token-free)", lo que indica que opera directamente a nivel de bytes sin tokenización previa. Tiene aproximadamente 9,09 millones de parámetros y alcanza una precisión perfecta en las métricas de test reportadas (bit, carácter y secuencia al 100%, con distancia de Levenshtein nula). Es un modelo de investigación, no un LLM generalista, y su relevancia radica en servir como banco de pruebas para arquitecturas token-free y para el estudio de ablaciones en transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (token-free, basado en bytes) |
| Parametros totales | 9.091.587 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch nativo) |
| Idiomas soportados | no disponible (tarea de descifrado binario, no multilingue) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder implementado manualmente con operaciones básicas de PyTorch, evitando explícitamente los módulos de atención y normalización de alto nivel. Esto lo convierte en una implementación didáctica y reproducible para estudiar el funcionamiento interno de la atención y la normalización. La configuración C5 corresponde a un "Byte Latent Transformer" (BLT), es decir, un modelo que procesa secuencias de bytes sin tokenización previa, lo que elimina la dependencia de un vocabulario fijo.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El entrenamiento se realizó durante aproximadamente 3541 segundos (unos 59 minutos) con un coste de 50,59 segundos por época, alcanzando una precisión perfecta en el conjunto de test. El pico de memoria durante el entrenamiento fue de 817 MB, lo que indica que es un modelo ligero.

## Capacidades

- Descifrado de secuencias binarias cifradas: el modelo recibe una secuencia de bytes que representa la codificación binaria ASCII de 8 bits de cada carácter, separados por `|`, y produce el texto plano correspondiente.
- Precisión perfecta en la tarea objetivo: según las métricas reportadas, alcanza un 100% de precisión a nivel de bit, carácter y secuencia completa, con distancia de Levenshtein nula en el conjunto de test.
- Operación token-free: al trabajar directamente con bytes, no requiere tokenizador ni vocabulario externo, lo que simplifica el pipeline de inferencia.
- Implementación transparente: al estar construido sin módulos de alto nivel, permite inspeccionar y modificar cada componente del transformer, útil para fines educativos y de investigación.

## Casos de uso

- Investigación académica en arquitecturas token-free: el modelo sirve como ejemplo funcional de un BLT para estudiar cómo los transformers pueden operar a nivel de byte sin tokenización, comparando su rendimiento y eficiencia frente a modelos con tokenizador.
- Estudio de ablaciones en transformers: al ser una implementación manual, permite eliminar o modificar componentes (atención, normalización, etc.) para analizar su impacto en el rendimiento, como se hace en el contexto de la asignación ANLP.
- Demostración de decodificación greedy: el modelo incluye métricas de decodificación greedy, lo que lo convierte en un banco de pruebas para evaluar estrategias de generación en tareas de secuencia a secuencia.
- Recurso docente para cursos de PLN: por su tamaño reducido y su código abierto, es adecuado para ilustrar el entrenamiento de transformers en tareas sintéticas de cifrado/descifrado.
- Base para experimentos de generalización: se puede probar el modelo con cifrados de longitud variable o con caracteres fuera del conjunto de entrenamiento para evaluar su capacidad de extrapolación.
- Comparación de eficiencia de memoria: con un pico de 817 MB en entrenamiento, es útil para medir el consumo de recursos de arquitecturas token-free frente a otras variantes.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de test, obtenidas con decodificación greedy:

| Metrica | Valor |
|---|---|
| Precisión de bit (test_bit_accuracy) | 1.0 |
| Precisión de carácter (test_char_accuracy) | 1.0 |
| Precisión de secuencia (test_sequence_accuracy) | 1.0 |
| Distancia de Levenshtein (test_levenshtein) | 0.0 |
| Distancia de Levenshtein normalizada (test_levenshtein_norm) | 0.0 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estas métricas corresponden exclusivamente a la tarea específica de descifrado del cifrado binario definido en el enunciado de la asignación.

## Requisitos de hardware

- El modelo tiene solo 9,09 millones de parámetros, por lo que cabe en cualquier GPU moderna e incluso en CPU sin problemas.
- El pico de memoria durante el entrenamiento fue de 817 MB, lo que sugiere que la inferencia requerirá menos de 1 GB de VRAM.
- Es ejecutable en GPUs de consumo como RTX 3060, RTX 4090 o incluso en CPUs con al menos 4 GB de RAM.
- Al ser un checkpoint de PyTorch, se puede cargar directamente con `torch.load` y ejecutar en cualquier entorno con PyTorch instalado.
- No se dispone de información sobre latencia o throughput, pero dado el tamaño, se espera una inferencia en milisegundos en GPU.
- No se mencionan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo de investigación, el despliegue se limita a scripts de PyTorch personalizados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers token-free para descifrado de cifrados binarios). El modelo es una implementación académica específica, sin equivalentes comerciales o de código abierto ampliamente conocidos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación, no un LLM generalista: no genera texto libre, no responde preguntas ni realiza tareas de lenguaje natural.
- Solo es capaz de descifrar el cifrado concreto para el que fue entrenado (representación binaria ASCII de 8 bits con separador `|`). No generaliza a otros formatos de cifrado o codificación.
- No se han documentado sesgos, pero al ser un modelo entrenado en un dataset sintético, no presenta sesgos lingüísticos; sin embargo, su utilidad fuera de la tarea es nula.
- Riesgo de alucinación: no aplica en el sentido habitual, pero podría producir salidas incorrectas si se le presentan secuencias fuera de la distribución de entrenamiento.
- No hay información sobre la longitud máxima de secuencia soportada; se desconoce si maneja secuencias largas o si degrada su rendimiento con entradas extensas.
- La licencia MIT permite uso comercial, pero el modelo no tiene valor práctico comercial fuera del ámbito educativo.
- El repositorio de código asociado (GitHub) es necesario para reproducir el entrenamiento y la inferencia; el checkpoint por sí solo no incluye el código de carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shauryakochar/anlp-a1-c5
- Código fuente (GitHub): https://github.com/shaurya-kochar/anlp-assignment1
- Registro de entrenamiento (WandB): https://wandb.ai/shaurya-kochar-iiit-hyderabad/anlp-a1-transformer-ablation
