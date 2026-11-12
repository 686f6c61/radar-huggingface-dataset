# a-kemeklis/analyzing-reasoning-and-generalization-follow-up

## Resumen

`analyzing-reasoning-and-generalization-follow-up` es un artefacto de investigación publicado en Hugging Face por el usuario a-kemeklis. No es un modelo de propósito general ni un asistente conversacional: es el conjunto de seis ejecuciones de entrenamiento (tres condiciones de datos × dos semillas) de un estudio controlado sobre cómo afecta la composición de los datos de entrenamiento al razonamiento y a la generalización en modelos de lenguaje de escala muy reducida. El modelo base es un GPT diminuto de 6.987.008 parámetros (6,30 M sin contar embeddings) entrenado sobre variantes de TinyStories.

La relevancia del artefacto es metodológica. Todas las ejecuciones comparten tokenizador, arquitectura, recuento de parámetros, hiperparámetros y presupuesto de cómputo (105.040 pasos, 3,44 B tokens); la única variable es el corpus de entrenamiento. Esto permite aislar el efecto de sustituir palabras del léxico por marcadores de posición (`<UNK_n>`, `<NAME_n>`) frente a mantener las palabras originales o usar el corpus completo sin filtrar. El resultado principal es que el filtrado con placeholders mejora la reutilización de palabras inventadas fuera del léxico (hasta 84,0 % frente a 4,2 % en la condición de palabras crudas), mientras que las diferencias en razonamiento entre condiciones son moderadas.

El modelo está pensado para investigadores que estudian currículos de datos, generalización composicional y capacidad de reutilización léxica en modelos pequeños. Su contexto es de 512 tokens, solo procesa inglés y su licencia no está declarada. El repositorio ocupa 1,2 GB e incluye los checkpoints `best/` y `final/` de cada ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (pre-RMSNorm, RoPE, MLP con GELU, embeddings atados, sin sesgos) |
| Parametros totales | 6.987.008 (6,30 M sin embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8 capas, `d_model` 256, 4 cabezas de atención, pre-RMSNorm, RoPE, activación GELU en el MLP, embeddings de entrada y salida atados y ausencia de términos de sesgo. El tokenizador es un BPE a nivel de byte con `min_frequency=2`, entrenado sobre el split de entrenamiento de la condición Unfiltered, con 176 tokens de placeholder y `<|endoftext|>` reservados, y un vocabulario de 2.700 entradas.

El entrenamiento usa AdamW (β 0,9/0,95), tasa de aprendizaje 2e-3, calentamiento lineal del 2 %, decaimiento coseno hasta el 10 %, weight decay 0,1, dropout 0,1, recorte de gradiente 1,0, lote de 64×512 tokens, bf16 y `torch.compile`. Cada una de las seis ejecuciones consume exactamente 105.040 pasos (3,44 B tokens), lo que equivale a unas 80 épocas sobre las historias filtradas y unas 6 épocas sobre Unfiltered. Se usan dos semillas (1 y 2) que controlan inicialización y orden de datos, y la selección de checkpoint se hace por pérdida de validación cada 500 pasos sobre el split propio de cada condición.

Las tres condiciones de datos son: Placeholders (282.603 historias filtradas con 300 lemas y 50 nombres, palabras fuera del léxico sustituidas por marcadores), Raw words (las mismas 282.603 historias con las palabras originales restituidas) y Unfiltered (2.718.842 historias de `karpathy/tinystories-gpt4-clean`). El corpus filtrado se reconstruyó desde cero reproduciendo el filtrado del paper previo y su texto con placeholders es byte-idéntico al publicado en `a-kemeklis/constraining-pretraining-data`. La model card documenta una corrección relevante: el script anterior de restitución de palabras (`rebuild_noph.py`) insertaba la palabra equivocada en 49.730 de 1,74 M de posiciones de placeholder, afectando al 13,2 % de las historias; el corpus Raw words de este repositorio no arrastra ese defecto.

## Capacidades

- Generación de texto en inglés a nivel de frases cortas y narrativa simple, entrenado sobre TinyStories.
- Razonamiento sobre plantillas controladas: comparación de log-probabilidades entre continuación correcta e incorrecta en 9 plantillas originales y 15 nuevas (seguimiento de agentes, causa emocional, acciones).
- Generalización léxica: manejo de palabras reales fuera del léxico, palabras inventadas pronunciables y palabras inventadas no pronunciables.
- Reutilización de palabras: capacidad de repetir en la continuación una palabra (o placeholder) aparecida en la apertura de la historia.
- Seguimiento de agentes con nombres inventados, pronunciables y no pronunciables.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente multi-paso.
- Multilingüismo limitado al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación sobre currículos de datos: comparar el efecto de filtrar vocabulario frente a mantener palabras crudas manteniendo fijos arquitectura, tokenizador e hiperparámetros, usando los seis checkpoints como línea base reproducible.
- Estudio de generalización composicional: evaluar si un modelo pequeño transfiere plantillas de razonamiento a palabras nunca vistas en entrenamiento, con las 15 plantillas nuevas incluidas en el repositorio.
- Análisis de reutilización léxica: medir la tasa a la que el modelo repite tokens de la apertura en la continuación, útil para estudiar copia, memoria y atribución en modelos diminutos.
- Reproducibilidad de resultados: los checkpoints `best/` y `final/` de cada condición y semilla permiten recalcular las tablas de resultados y los intervalos de confianza bootstrap publicados.
- Docencia y formación: servir como ejemplo didáctico de diseño experimental controlado en preentrenamiento, con presupuesto fijo de 3,44 B tokens y seis ejecuciones comparables.
- Auditoría de pipelines de filtrado: usar la corrección documentada sobre `rebuild_noph.py` (13,2 % de historias con palabra errónea) como caso de prueba para validar scripts de restitución de placeholders.
- Estudio de tokenizadores con vocabulario reservado: analizar el comportamiento de un BPE de 2.700 entradas con 176 tokens de placeholder dedicados y su efecto en la codificación de entradas fuera del léxico.

## Benchmarks y rendimiento

Los resultados publicados son métricas internas del estudio, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se presentan como porcentaje de acierto con media sobre dos semillas, intervalo de confianza bootstrap del 95 % y valores por semilla entre paréntesis.

| Métrica | Placeholders | Raw words | Unfiltered |
|---|---|---|---|
| Razonamiento, en léxico (%, plantillas nuevas) | 87,5 [76, 97] (83,3, 91,7) | 86,0 [71, 97] (80,7, 91,3) | 82,7 [65, 97] (79,0, 86,3) |
| Razonamiento, fuera de léxico real (%, plantillas nuevas) | 88,3 [73, 100] (83,3, 93,3) | 84,7 [72, 96] (79,7, 89,7) | 84,2 [67, 98] (80,0, 88,3) |
| Razonamiento, inventado pronunciable (%, plantillas nuevas) | 88,3 [73, 100] (83,7, 93,0) | 87,8 [76, 96] (85,0, 90,7) | 84,8 [68, 99] (83,3, 86,3) |
| Razonamiento, inventado no pronunciable (%, plantillas nuevas) | 87,8 [72, 100] (83,0, 92,7) | 85,7 [71, 96] (85,3, 86,0) | 84,8 [69, 99] (84,3, 85,3) |
| Seguimiento de agentes, nombres inventados pronunciables (%) | 70,0 [30, 100] (60,0, 80,0) | 74,5 [46, 94] (71,0, 78,0) | 69,5 [32, 100] (65,0, 74,0) |
| Seguimiento de agentes, nombres inventados no pronunciables (%) | 70,0 [30, 100] (60,0, 80,0) | 69,5 [36, 92] (71,0, 68,0) | 69,0 [34, 100] (71,0, 67,0) |
| Reutilización, fuera de léxico real (%) | 89,6 [84, 94] (94,4, 84,7) | 75,0 [58, 89] (73,6, 76,4) | 87,5 [77, 95] (86,1, 88,9) |
| Reutilización, inventado pronunciable (%) | 88,2 [82, 94] (93,1, 83,3) | 38,2 [24, 54] (47,2, 29,2) | 46,5 [31, 62] (47,2, 45,8) |
| Reutilización, inventado no pronunciable (%) | 84,0 [78, 90] (88,9, 79,2) | 4,2 [0, 10] (6,9, 1,4) | 9,7 [3, 17] (11,1, 8,3) |
| Reutilización de nombres, inventado pronunciable (%) | 91,7 [82, 100] (97,2, 86,1) | 52,8 [29, 76] (52,8, 52,8) | 73,6 [56, 88] (75,0, 72,2) |
| Razonamiento, en léxico (%, plantillas originales) | 95,0 [88, 100] (93,9, 96,1) | 88,1 [71, 100] (87,2, 88,9) | 88,1 [68, 100] (86,7, 89,4) |
| Razonamiento, fuera de léxico real (%, plantillas originales) | 99,2 [98, 100] (98,9, 99,4) | 85,3 [71, 97] (92,8, 77,8) | 88,6 [68, 100] (88,9, 88,3) |
| Razonamiento, inventado pronunciable (%, plantillas originales) | 97,2 [92, 100] (96,7, 97,8) | 82,2 [61, 98] (81,7, 82,8) | 86,7 [66, 100] (86,1, 87,2) |
| Razonamiento, inventado no pronunciable (%, plantillas originales) | 96,9 [91, 100] (96,1, 97,8) | 81,1 [57, 97] (81,1, 81,1) | 85,8 [64, 100] (85,6, 86,1) |

La model card menciona una tabla de diferencias pareadas entre condiciones (puntos porcentuales, IC 95 %, con asterisco cuando el intervalo excluye el 0), pero el contenido disponible se interrumpe en la cabecera de esa tabla, por lo que los valores no se recogen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 para los 6,99 M de parámetros, más el coste del contexto de 512 tokens; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; una RTX 4090, A100 o H100 no aportan ventaja relevante por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier modelo moderno (GTX 1060, RTX 2060, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: `transformers` con pesos safetensors; el repositorio no documenta integración con vLLM, llama.cpp, Ollama ni TGI, y al no haber variantes GGUF la cuantización no está soportada de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| analyzing-reasoning-and-generalization-follow-up | 6,99 M | 512 | Estudio controlado de datos sobre TinyStories | No disponible | Hugging Face (safetensors) |
| analyzing-reasoning-and-generalization (modelo padre) | No disponible | No disponible | Estudio original de filtrado con placeholders | No disponible | Hugging Face |
| karpathy/tinystories-gpt4-clean | No disponible | No disponible | Corpus de 2.718.842 historias usado como condición Unfiltered | No disponible | Hugging Face (dataset) |
| a-kemeklis/constraining-pretraining-data | No disponible | No disponible | Historias filtradas con placeholders, byte-idénticas a las de este estudio | No disponible | Hugging Face (dataset) |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a propósito, procedencia y formato.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado para evaluación controlada en investigación, no para producción ni para conversación abierta.
- Contexto muy limitado (512 tokens), insuficiente para documentos largos o diálogos multi-turno extensos.
- Solo inglés; no se documenta soporte multilingüe.
- Licencia no declarada: no hay autorización explícita para uso comercial, lo que impide asumir permisos de redistribución o explotación.
- Riesgo de alucinación y de texto incoherente fuera del dominio de TinyStories, dado el tamaño ínfimo del modelo y el corpus narrativo simple.
- Sesgos heredados del corpus TinyStories generado por GPT-4 y del filtrado léxico aplicado (300 lemas y 50 nombres), que restringe el vocabulario efectivo de la condición Placeholders.
- Los resultados de razonamiento y reutilización son métricas internas del estudio, no comparables directamente con benchmarks estándar.
- Los intervalos de confianza bootstrap son amplios en varias métricas (por ejemplo, seguimiento de agentes con IC de [30, 100]), lo que limita la solidez de las conclusiones por celda.
- La model card documenta un defecto histórico en el script de restitución de palabras del trabajo previo (13,2 % de historias afectadas); conviene verificar que cualquier reutilización de ese pipeline no reintroduzca el error.
- No se publican variantes cuantizadas ni formatos GGUF, lo que limita el despliegue en herramientas de inferencia ligera.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/a-kemeklis/analyzing-reasoning-and-generalization-follow-up
- Modelo padre: https://huggingface.co/a-kemeklis/analyzing-reasoning-and-generalization
- Dataset de historias filtradas con placeholders: https://huggingface.co/a-kemeklis/constraining-pretraining-data
- Corpus de origen: https://huggingface.co/datasets/karpathy/tinystories-gpt4-clean
