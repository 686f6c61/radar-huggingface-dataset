# Fyrex12/Camanor

## Resumen

Camanor es un modelo de lenguaje compacto de 1.240 millones de parámetros, desarrollado por el usuario Fyrex12 como un ajuste fino (fine-tuning) del modelo base meta-llama/Llama-3.2-1B-Instruct. Está especializado en desarrollo web (HTML, CSS, JavaScript), programación en Python y trabajo con conjuntos de datos (datasets), con soporte bilingüe en ruso e inglés. El modelo se entrenó mediante QLoRA sobre un corpus de 55 datasets de aproximadamente 80 MB, que incluye diálogos sintéticos entre modelos y ejemplos de código.

Su relevancia radica en ofrecer una alternativa ligera y de bajo coste computacional para tareas de generación de código y asistencia en procesamiento de datos, pensada para entornos con recursos limitados, como portátiles con GPU de gama media. Al estar basado en Llama 3.2, hereda una ventana de contexto de hasta 128 000 tokens, aunque el entrenamiento se realizó con secuencias de máximo 512 tokens, lo que puede limitar su rendimiento en contextos muy largos.

El modelo se distribuye bajo la licencia Llama 3.2, que permite uso comercial con ciertas condiciones, y está disponible en formato safetensors. Su tamaño reducido lo hace ejecutable en hardware de consumo, aunque su capacidad de razonamiento complejo es limitada, como corresponde a un modelo de 1B de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.2 1B Instruct) |
| Parametros totales | 1 235 814 400 (1,24B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens (base), entrenado con secuencias ≤512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Llama 3.2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Camanor es un modelo transformer decoder-only, derivado de Llama-3.2-1B-Instruct. El ajuste fino se realizó con QLoRA (Quantized Low-Rank Adaptation), una técnica que reduce el coste de entrenamiento al congelar los pesos originales y entrenar adaptadores de bajo rango sobre una versión cuantizada del modelo. El corpus de entrenamiento está compuesto por 55 datasets de aproximadamente 80 MB, que incluyen contenido en ruso, ejemplos de Python, HTML, CSS y JavaScript, así como diálogos generados entre modelos (model-to-model). No se menciona el uso de RLHF o DPO; el entrenamiento se limitó a un ajuste supervisado estándar.

Una innovación destacable es el uso de secuencias de entrenamiento de hasta 512 tokens, muy por debajo del contexto máximo del modelo base. Esto implica que, aunque el modelo puede aceptar entradas largas, su capacidad para mantener coherencia en contextos extensos puede verse degradada. El entrenamiento se realizó en una GPU RTX 3050 Laptop, lo que confirma su orientación a hardware de bajo consumo.

## Capacidades

- Generación de código HTML, CSS y JavaScript: puede crear páginas web simples, formularios, tablas y maquetación básica.
- Asistencia en Python: ayuda con scripts, procesamiento de datos y automatización de tareas sencillas.
- Manejo de datasets: explica qué son, cómo cargarlos (por ejemplo, con la librería `datasets` de Hugging Face) y cómo dividirlos en conjuntos de entrenamiento y validación.
- Procesamiento de datos tabulares: soporte para CSV, JSON y pandas, aunque limitado a operaciones básicas.
- Conversación bilingüe: responde en ruso e inglés, y conoce su propio nombre (Camanor) en ambos idiomas.
- Generación de texto general: puede mantener diálogos sencillos y responder preguntas factuales básicas, con las limitaciones propias de un modelo de 1B.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Generación de prototipos web rápidos: un desarrollador puede pedir al modelo que genere una página HTML con CSS incrustado y JavaScript para validar una idea antes de implementarla manualmente. Su tamaño reducido permite ejecutarlo localmente sin infraestructura costosa.
- Asistencia en limpieza de datos con pandas: el modelo puede sugerir fragmentos de código para filtrar, transformar o agregar columnas en un DataFrame, útil para analistas que trabajan con datasets pequeños.
- Explicación de conceptos de datasets: puede responder preguntas como "¿qué es un dataset?" o "¿cómo divido mi dataset en train y test?", sirviendo como tutor para estudiantes de ciencia de datos.
- Chatbot educativo bilingüe: al conocer su nombre y manejar ruso e inglés, puede integrarse en aplicaciones de aprendizaje de idiomas o asistentes educativos para hablantes de estos idiomas.
- Generación de scripts de automatización: para tareas repetitivas como renombrar archivos, parsear JSON o extraer datos de CSV, el modelo puede producir scripts Python funcionales para casos sencillos.
- Entrenamiento y experimentación en entornos con GPU limitada: al ser un modelo pequeño, es adecuado para probar pipelines de inferencia o fine-tuning en portátiles con 4-6 GB de VRAM, sirviendo como banco de pruebas para desarrolladores que luego migran a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB para los pesos en bf16, más overhead de activaciones y caché KV. Con cuantización a 8 bits podría reducirse a ~1,3 GB, y a 4 bits a ~0,7 GB, aunque no se han publicado archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050 Laptop, RTX 3060, GTX 1660 Super o superiores. También puede ejecutarse en Apple Silicon con Metal.
- Compatibilidad con hardware de consumo: sí, cabe en la mayoría de GPUs de consumo actuales y en CPUs modernas con suficiente RAM.
- Opciones de despliegue: transformers (Python), llama.cpp, Ollama, vLLM (aunque para 1B puede ser sobredimensionado), TGI, o mediante la API de Hugging Face Inference Endpoints.
- Latencia y throughput: no disponible. En una RTX 3050 Laptop, se espera una generación de decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Fyrex12/Camanor | 1,24B | 128k (base) | ru, en | Llama 3.2 | Fine-tuning especializado en código y datasets |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128k | multilingüe (principalmente en) | Llama 3.2 | Modelo base, sin especialización en código |
| Qwen2.5-1.5B-Instruct | 1,54B | 32k | multilingüe (incl. zh, en) | Apache 2.0 | Mejor rendimiento general en benchmarks, pero mayor tamaño |
| Microsoft Phi-3-mini | 3,8B | 128k | multilingüe (en) | MIT | Más capaz, pero requiere más VRAM |

Camanor se diferencia por su enfoque específico en desarrollo web y datasets, y por su soporte bilingüe ruso-inglés. Sin embargo, carece de benchmarks publicados que permitan comparar su rendimiento real con estas alternativas.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 1,24B, su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código sofisticado es limitada. El propio autor advierte que el código generado es de nivel educativo y puede contener errores.
- Riesgo de alucinación: puede inventar APIs, funciones o comportamientos de librerías, especialmente en temas poco representados en su corpus de entrenamiento.
- Contexto de entrenamiento corto: aunque el modelo base soporta 128k tokens, el fine-tuning se realizó con secuencias de máximo 512 tokens, por lo que puede perder coherencia en conversaciones o documentos largos.
- Sesgos lingüísticos: entrenado principalmente en ruso e inglés, puede mostrar sesgos culturales o idiomáticos de estas lenguas, y su rendimiento en otros idiomas es muy limitado.
- Licencia Llama 3.2: permite uso comercial, pero requiere aceptar los términos de Meta, que incluyen restricciones sobre el uso para mejorar otros modelos grandes y la obligación de atribución en ciertos casos. Se recomienda revisar el texto completo de la licencia antes de desplegarlo en producción.
- Sin soporte para tool calling ni agentes: no puede interactuar con APIs externas ni ejecutar acciones de forma autónoma, lo que limita su uso en pipelines complejos.
- Sin cuantizaciones publicadas: no se ofrecen archivos GGUF o AWQ, por lo que el despliegue en entornos con restricciones de memoria requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fyrex12/Camanor
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Licencia Llama 3.2: https://ai.meta.com/llama/license/
