# shauryakochar/anlp-a1-c2

## Resumen

El modelo `shauryakochar/anlp-a1-c2` es un transformer encoder-decoder construido desde cero con operaciones básicas de PyTorch, sin usar módulos de alto nivel como `nn.Transformer`, `nn.MultiheadAttention` o `nn.LayerNorm`. Fue desarrollado por Shaurya Kochar como parte de la asignatura ANLP (Advanced Natural Language Processing) en IIIT Hyderabad, y corresponde a la configuración C2 de un estudio de ablación sobre codificaciones posicionales, en concreto la codificación posicional rotatoria (RoPE). El modelo está entrenado para mapear secuencias binarias cifradas a texto plano, una tarea sintética de secuencia a secuencia.

Con 7,77 millones de parámetros, es un modelo pequeño y académico, no un modelo de propósito general. Su relevancia radica en servir como ejemplo de implementación didáctica de un transformer sin dependencias de alto nivel, y en documentar el efecto de RoPE en una tarea de descifrado. El repositorio incluye los pesos en formato `.pt` junto con la configuración y los argumentos de entrenamiento, así como métricas de evaluación con decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con RoPE (codificacion posicional rotatoria) |
| Parametros totales | 7.767.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (trabaja con secuencias binarias, no con lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder implementado manualmente con operaciones de bajo nivel de PyTorch, lo que excluye el uso de `nn.Transformer`, `nn.MultiheadAttention` y `nn.LayerNorm`. La configuración C2 emplea codificación posicional rotatoria (RoPE), una técnica que incorpora información posicional mediante rotaciones en el espacio de atención. No se dispone de detalles sobre el número de capas, dimensiones ocultas o número de cabezas de atención, ni sobre la composición del dataset de entrenamiento (secuencias binarias cifradas y su correspondiente texto plano). El entrenamiento se realizó durante aproximadamente 3017 segundos (unos 50 minutos) con un coste de 43,1 segundos por época, alcanzando un pico de memoria de 1334 MB. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo supervisado para una tarea específica.

## Capacidades

- Mapeo de secuencias binarias cifradas a texto plano: es la única tarea para la que ha sido entrenado.
- Decodificación greedy: las métricas reportadas se obtuvieron con este método de generación.
- Implementación de RoPE: sirve como referencia para estudiar el impacto de esta codificación posicional en un transformer construido desde cero.
- No soporta generación de texto libre, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Práctica docente en cursos de procesamiento del lenguaje natural: el modelo y su código permiten a estudiantes implementar un transformer completo sin depender de APIs de alto nivel, comprendiendo los mecanismos internos de atención y codificación posicional.
- Estudio de ablación de codificaciones posicionales: al ser la configuración C2 de una serie de experimentos, se puede comparar con otras configuraciones (C1, C3, etc.) para evaluar el efecto de RoPE frente a otras alternativas en una tarea de secuencia a secuencia.
- Investigación sobre descifrado de secuencias sintéticas: aunque limitado a binario, puede servir como banco de pruebas para técnicas de decodificación o para analizar la capacidad de generalización de transformers pequeños en tareas de transformación de secuencias.
- Benchmark de eficiencia de memoria: con un pico de 1334 MB, es útil para probar entornos con recursos limitados o para comparar implementaciones manuales frente a versiones optimizadas.
- Reproducibilidad académica: al publicar pesos, configuración y métricas, permite reproducir los resultados y verificar el comportamiento de RoPE en esta arquitectura.
- Ejemplo de integración con Weights & Biases: el enlace a WandB documenta el seguimiento del entrenamiento, útil para quienes aprenden a monitorizar experimentos.

## Benchmarks y rendimiento

Las métricas de test reportadas en la model card, obtenidas con decodificación greedy, son las siguientes:

| Metrica | Valor |
|---|---|
| Exactitud de bit (test_bit_accuracy) | 0,9953 |
| Exactitud de caracter (test_char_accuracy) | 0,9882 |
| Exactitud de secuencia (test_sequence_accuracy) | 0,9319 |
| Distancia de Levenshtein (test_levenshtein) | 0,1119 |
| Distancia de Levenshtein normalizada (test_levenshtein_norm) | 0,0018 |
| BLEU (test_bleu) | 0,9846 |
| ROUGE-L (test_rouge_l) | 0,9920 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el pico de memoria durante el entrenamiento fue de 1334 MB, por lo que la inferencia requerirá menos, probablemente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; también puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1050 Ti, RTX 2060, RTX 3060, etc.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, o integrarse en scripts de Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles, pero dado el tamaño (7,7 M de parámetros), la inferencia será muy rápida en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (transformers encoder-decoder de ~7,7 M de parámetros para descifrado de secuencias binarias). La búsqueda web solo muestra otros repositorios de estudiantes con nombres similares (`neemon/anlp-a1-c2`, `siddarthg44/anlp-a1-2023102040-C2`, `mohjkhan/anlp-a1-transformers`, `yharith/anlp-a1-transformer-ablation`), pero no se han encontrado sus model cards ni métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de tarea única: solo sabe transformar secuencias binarias cifradas a texto plano; no es útil para ninguna otra tarea de NLP.
- Sin datos de entrenamiento publicados: se desconoce la composición del dataset, su tamaño o si hay sesgos asociados a los datos sintéticos.
- Riesgo de alucinación: al ser un modelo secuencia a secuencia, puede producir salidas incorrectas, aunque las métricas de exactitud de secuencia (93,2%) indican que falla en aproximadamente un 7% de las secuencias.
- Sin soporte multilingüe ni de lenguaje natural: no procesa texto humano, solo secuencias binarias.
- Licencia MIT: permite uso comercial y modificación, pero al ser un trabajo académico, no se garantiza su robustez en producción.
- Sin cuantizaciones ni formatos optimizados: solo se proporciona el archivo `.pt`, lo que limita su despliegue en entornos con restricciones de memoria o en frameworks específicos.
- Fecha de creación futura: el modelo fue creado el 2 de septiembre de 2026, lo que sugiere que es un artefacto reciente y posiblemente no validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shauryakochar/anlp-a1-c2
- Código fuente (GitHub): https://github.com/shaurya-kochar/anlp-assignment1
- Registro de entrenamiento (Weights & Biases): https://wandb.ai/shaurya-kochar-iiit-hyderabad/anlp-a1-transformer-ablation
