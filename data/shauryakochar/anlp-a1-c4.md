# shauryakochar/anlp-a1-c4

## Resumen

El modelo `shauryakochar/anlp-a1-c4` es un transformer encoder-decoder construido íntegramente con operaciones básicas de PyTorch, sin utilizar módulos de alto nivel como `nn.Transformer`, `nn.MultiheadAttention` o `nn.LayerNorm`. Fue desarrollado por Shaurya Kochar como parte de la asignatura "Advanced NLP" (ANLP) en IIIT Hyderabad, y corresponde a la configuración C4 del experimento, que emplea normalización RMSNorm. El modelo está entrenado para mapear secuencias binarias cifradas a texto plano, un problema de descifrado de un cifrado de clave repetitiva XOR.

Con 7.761.920 parámetros, es un modelo muy pequeño, pensado como ejercicio académico de ablación sobre componentes arquitectónicos (posicional, atención, normalización, tokenización). Su relevancia no reside en su utilidad práctica, sino en que documenta una implementación didáctica de un transformer desde cero, con métricas de evaluación detalladas sobre una tarea concreta de descifrado. El repositorio incluye los pesos del modelo en un archivo `C4.pt` junto con la configuración y los argumentos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (implementado desde cero en PyTorch) |
| Parametros totales | 7.761.920 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, formato PyTorch) |
| Idiomas soportados | no disponible (trabaja con secuencias binarias y texto plano en inglés, según la tarea) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`C4.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder construido manualmente con operaciones básicas de PyTorch, lo que implica que la atención, la normalización y las capas lineales se implementan explícitamente en el código del autor. La configuración C4 utiliza RMSNorm como capa de normalización, en lugar de LayerNorm. No se dispone de detalles sobre el número de capas, dimensiones ocultas, número de cabezas de atención ni el tamaño del dataset de entrenamiento. El entrenamiento se realizó durante aproximadamente 2956 segundos (unos 49 minutos) con una duración media de 42,23 segundos por época, alcanzando un pico de memoria de 1242,91 MB. No se especifica el número total de épocas ni la composición del dataset, aunque la tarea consiste en descifrar secuencias binarias cifradas con XOR de clave repetitiva hacia texto plano en inglés.

## Capacidades

- Descifrado de secuencias binarias cifradas: el modelo aprende a mapear entradas cifradas (binarias) a texto plano, logrando una precisión de secuencia del 92,46 % en el conjunto de test.
- Generación de texto condicionada: al ser un encoder-decoder, puede generar secuencias de salida a partir de una entrada codificada.
- Implementación educativa: demuestra la viabilidad de construir un transformer funcional sin librerías de alto nivel, útil para estudiar el efecto de la normalización RMSNorm.
- No se han documentado capacidades como tool calling, agentes, visión, audio o razonamiento multi-paso.

## Casos de uso

- Ejercicio docente de arquitecturas transformer: el modelo sirve como referencia para estudiantes que quieran entender cómo implementar atención, normalización y codificación posicional desde cero en PyTorch.
- Estudio de ablaciones en normalización: al comparar con las configuraciones C1, C2 y C3 del mismo autor, permite analizar el impacto de RMSNorm frente a otras variantes en una tarea de secuencia a secuencia.
- Base para experimentos de descifrado simple: puede utilizarse como punto de partida para investigar métodos de criptoanálisis con redes neuronales sobre cifrados XOR de clave repetitiva.
- Validación de métricas de evaluación: las métricas reportadas (BLEU, ROUGE-L, Levenshtein, precisión por carácter y por secuencia) ofrecen un caso práctico de cómo evaluar modelos generativos en tareas de transcripción.
- Reutilización del código fuente: el repositorio GitHub asociado permite extraer la implementación para adaptarla a otras tareas de secuencia a secuencia con fines académicos.
- Comparativa de eficiencia de memoria: el pico de memoria de 1242 MB durante el entrenamiento puede servir para calibrar requisitos de hardware en entornos educativos con recursos limitados.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de test con decodificación voraz:

| Metrica | Valor |
|---|---|
| Precisión de bit | 0,9934 |
| Precisión de carácter | 0,9831 |
| Precisión de secuencia | 0,9246 |
| Distancia de Levenshtein | 0,1248 |
| Distancia de Levenshtein normalizada | 0,0021 |
| BLEU | 0,9830 |
| ROUGE-L | 0,9916 |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas corresponden exclusivamente a la tarea de descifrado de secuencias binarias y no son comparables con benchmarks generales como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero dado el tamaño de 7,7 M de parámetros, es despreciable (menos de 100 MB en FP32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; incluso CPU es viable para inferencia.
- Entrenamiento: el pico de memoria reportado es de 1242,91 MB, por lo que una GPU con 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) sería suficiente para reproducir el entrenamiento.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede ejecutarse con cualquier framework que soporte PyTorch (transformers, vLLM, etc.), aunque no se han publicado integraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El modelo pertenece a una serie de configuraciones de ablación del mismo autor (C1, C2, C3, C4) y a trabajos de compañeros de la misma asignatura. No se dispone de datos de rendimiento de esas variantes en la información proporcionada, por lo que no es posible realizar una comparativa cuantitativa. Como referencia cualitativa:

| Modelo | Configuracion | Normalizacion | Parametros | Tarea |
|---|---|---|---|---|
| anlp-a1-c4 (este) | C4 | RMSNorm | 7.761.920 | Descifrado XOR |
| anlp-a1-c2 | C2 | no disponible | no disponible | Descifrado XOR |
| 2024114011-anlp-a1 | Varias configuraciones | no disponible | no disponible | Descifrado XOR |

No se dispone de más detalles sobre las configuraciones alternativas.

## Limitaciones y advertencias

- Modelo académico: no está diseñado para uso en producción; su propósito es ilustrar conceptos de implementación de transformers.
- Tarea muy específica: solo ha sido entrenado para descifrar un tipo concreto de cifrado (XOR de clave repetitiva) sobre secuencias binarias; no generaliza a otros dominios.
- Sin datos de sesgos o alucinaciones: al ser un modelo pequeño y de tarea acotada, no se han evaluado sesgos sociales ni comportamientos alucinatorios.
- Sin soporte multilingüe: no se ha especificado ningún idioma más allá del inglés implícito en el texto plano de la tarea.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio con código fuente: la implementación puede contener limitaciones propias de un trabajo de asignatura (sin optimizaciones, sin manejo de errores exhaustivo, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shauryakochar/anlp-a1-c4
- Repositorio de código: https://github.com/shaurya-kochar/anlp-assignment1
- Registro de entrenamiento (WandB): https://wandb.ai/shaurya-kochar-iiit-hyderabad/anlp-a1-transformer-ablation
- Modelo relacionado (C2): https://huggingface.co/shauryakochar/anlp-a1-c2
- Trabajo relacionado de otro autor: https://huggingface.co/abhirajratna/2024114011-anlp-a1
