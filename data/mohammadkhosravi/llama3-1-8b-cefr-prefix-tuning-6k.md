# MohammadKhosravi/llama3.1-8b-cefr-prefix-tuning-6k

## Resumen

Este modelo es una implementación de *multi-prefix tuning* sobre el backbone `meta-llama/Llama-3.1-8B-Instruct`, desarrollada por MohammadKhosravi como una baseline de investigación para controlar el nivel de competencia lingüística según el Marco Común Europeo de Referencia para las Lenguas (CEFR). En lugar de introducir instrucciones textuales de nivel en el prompt, asigna un conjunto dedicado de 30 tokens virtuales continuos a cada uno de seis niveles (A1, A2, B1, B2, C1 y C2). Estos tokens se proyectan mediante un MLP compartido y se inyectan como estados de clave/valor en la atención, manteniendo el backbone congelado. El adaptador se entrenó durante tres épocas con una pérdida de validación que baja hasta 2,43 y una perplejidad de 11,39. Es un modelo ligero (repo de 0,6 GB) que añade control de dificultad de salida sin modificar los pesos de Llama 3.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-3.1-8B-Instruct) con adaptadores de *prefix tuning* para control CEFR |
| Parámetros totales | ≈8B (backbone) + adaptadores de prefijo no especificados |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el backbone base declara 128k, no se confirma en el adaptador) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (repo de 0,6 GB, formato no documentado) |

## Arquitectura y entrenamiento

El modelo utiliza una técnica de *multi-prefix tuning*: se definen seis conjuntos independientes de 30 vectores virtuales continuos en \(\mathbb{R}^{4096}\), lo que suma 180 vectores de prefijo. Un MLP compartido de dos capas reparametrizada el conjunto seleccionado, proyectándolo a claves y valores (*past key/values*) para cada capa del backbone. Los tokens virtuales entran en la atención self como estados K/V y se normalizan mediante softmax junto con los tokens de contexto, siguiendo el esquema de Li y Liang (2021). El texto de entrada es un prompt "ciego" que no incluye ninguna indicación sobre el nivel CEFR: la dificultad se controla únicamente por el prefijo activo, sin instrucciones textuales. El backbone `Llama-3.1-8B-Instruct` permanece congelado; solo se optimizan los vectores de prefijo y el MLP.

El entrenamiento se realizó durante 3 épocas. Las pérdidas registradas son: en la época 1, `train_loss` 2,6608 y `val_loss` 2,5036; en la época 2, `train_loss` 2,3967 y `val_loss` 2,4328; en la época 3, `train_loss` 2,2449 y `val_loss` 2,4366. La perplejidad de validación final es 11,43. El proceso consumió 1497,77 segundos (0,42 horas), con un pico de memoria GPU de 69,43 GB y una utilización media de GPU del 97,4%. No se disclose la composición del dataset ni el número de pasos de entrenamiento.

## Capacidades

- Generación de texto condicionada por nivel de competencia CEFR (6 niveles: A1, A2, B1, B2, C1, C2), seleccionando el prefijo adecuado sin necesidad de instrucciones textuales.
- Control de dificultad de salida mediante 30 tokens virtuales continuos por nivel, lo que permite distintos registros lingüísticos con el mismo backbone.
- Adaptación sobre un modelo instructivo de 8B ya alineado, manteniendo sus capacidades generales de generación y seguimiento de instrucciones.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso explícito, visión o audio.
- No se documenta su comportamiento fuera de los niveles CEFR definidos.

## Casos de uso

- Materiales didácticos de idiomas: el modelo puede generar textos de lectura para niveles concretos (por ejemplo, A2 o B1) sin alterar el prompt, ya que el nivel se controla por prefijo, lo que facilita la producción sistemática de ejercicios graduados.
- Tutoría personalizada de idiomas: en un chatbot educativo, el sistema puede ajustar la dificultad de las respuestas al nivel del usuario seleccionando el prefijo correspondiente, permitiendo una práctica adaptativa sin cambiar las instrucciones del sistema.
- Simplificación de documentos para lectores no nativos: una herramienta puede transformar contenido redactado a nivel C1 en una versión más accesible (por ejemplo, B2) activando el prefijo de ese nivel, útil en entornos de atención ciudadana o divulgación.
- Generación de preguntas para exámenes de competencia: el modelo puede producir ítems de comprensión lectora con una dificultad controlada (B1 frente a C1) para pruebas estandarizadas, porque el prefijo fija el registro y la complejidad léxica y sintáctica.
- Entrenamiento de vocabulario específico: al seleccionar el prefijo de nivel A1, el modelo tiende a limitar el vocabulario a términos básicos, lo que permite crear listas de vocabulario o frases modelo para principiantes.
- Investigación en adaptación de instrucciones: sirve como baseline para comparar métodos de control de dificultad frente a técnicas basadas en prompting textual, gracias a que separa la condición de nivel del contenido del prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Solo se reportan métricas de entrenamiento y validación: `val_loss` 2,4328 y `val_ppl` 11,39 en la mejor época. No se presentan comparativas con otros modelos en tareas externas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Para inferencia con el backbone en fp16 se estiman aproximadamente 16 GB de VRAM, necesarios para cargar los 8B parámetros de Llama 3.1.
- Con cuantización 4-bit (si se convierte el modelo base) la VRAM necesaria baja hasta unos 5-6 GB, permitiendo ejecución en GPUs de consumo como RTX 3090 o RTX 4090.
- La memoria adicional del adaptador de prefijos es pequeña (repo de 0,6 GB), aunque no se documenta el formato de los pesos ni su carga exacta.
- GPU recomendada para desarrollo y pruebas: A100 o H100 con al menos 40-80 GB de VRAM para manejar el backbone sin cuantizar.
- El despliegue requiere código personalizado para inyectar los prefijos en las capas de atención; no se documenta compatibilidad con vLLM, Ollama, llama.cpp o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Control CEFR |
|---|---|---|---|---|
| `llama3.1-8b-cefr-prefix-tuning-6k` (este modelo) | 8B backbone + adaptador no especificado | No disponible | Apache-2.0 | Sí, mediante prefijos dedicados |
| `meta-llama/Llama-3.1-8B-Instruct` (base) | ≈8B | 128k | Llama 3.1 Community License | No |
| `llama3.1-8b-cpmt-cefr-combined-loss-2layer-head-6k` (mismo autor) | No disponible | No disponible | No disponible | Sí, con pérdida combinada y cabecera de dos capas |

No se disponen de benchmarks comparables en la información facilitada. El modelo se distingue del base por su mecanismo de condicionamiento por prefijo, mientras que el otro adaptador del mismo autor usa una estrategia de entrenamiento distinta, aunque no se especifican sus detalles.

## Limitaciones y advertencias

- No se documentan los datos de entrenamiento ni los idiomas cubiertos, por lo que el rendimiento fuera del idioma de entrenamiento es incierto.
- La perplejidad de validación reportada (11,39-12,23) es relativamente alta, lo que sugiere que la generación puede ser menos fluida que la del backbone original; no se aportan evaluaciones humanas.
- El modelo no incorpora visión, audio ni soporte de herramientas; sus capacidades se limitan a la generación de texto condicionada por nivel.
- La licencia Apache-2.0 aplica al adaptador, pero el modelo base Llama 3.1 está sujeto a la Licencia Llama 3.1 de Meta, que incluye restricciones de uso comercial específicas.
- Es una baseline de investigación y no se presenta como una solución listos para producción; no se ofrecen pruebas de robustez en entornos reales.
- El mecanismo está diseñado para seis niveles fijos: el uso de otros prefijos o combinaciones fuera de este rango no está evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MohammadKhosravi/llama3.1-8b-cefr-prefix-tuning-6k
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Clasificador CEFR del mismo autor: https://huggingface.co/MohammadKhosravi/llama3.1-8b-cefr-classifier
- Adaptador CEFR con pérdida combinada del mismo autor: https://huggingface.co/MohammadKhosravi/llama3.1-8b-cpmt-cefr-combined-loss-2layer-head-6k
