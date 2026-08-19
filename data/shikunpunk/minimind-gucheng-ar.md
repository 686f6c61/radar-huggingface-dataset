# shikunpunk/MiniMind-GuCheng-AR

## Resumen

MiniMind-GuCheng-AR es un modelo de generación de poesía en chino entrenado desde cero sobre la arquitectura MiniMind, un diseño minimalista de transformer autoregresivo con 104 millones de parámetros entrenables (hidden_size=768, 8 capas). El modelo está especializado en imitar el estilo poético de Gu Cheng, uno de los poetas más influyentes de la poesía moderna china, y ha sido desarrollado por el usuario shikunpunk con fines de investigación comparativa.

El proyecto forma parte de un estudio más amplio que compara tres arquitecturas diferentes (autoregresiva, difusión y atención lineal) bajo las mismas condiciones de datos y escala. Este modelo concreto, la variante AR, es la que mejor calidad de generación ofrece según el autor, produciendo versos completos con imaginería poética coherente. Su relevancia radica en demostrar las diferencias de convergencia y calidad entre arquitecturas cuando los datos de entrenamiento son muy limitados (solo 7.481 ejemplos de preentrenamiento y 213 de ajuste fino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo con Softmax Attention (MiniMind) |
| Parametros totales | 104 millones (entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino (enfocado en poesia moderna china) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (probablemente .bin o .safetensors, no especificado) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura MiniMind, un diseño de transformer autoregresivo minimalista implementado desde cero en PyTorch sin dependencias de librerías de alto nivel. La configuración incluye 8 capas con hidden_size de 768 dimensiones y atención softmax estándar. El entrenamiento se realizó en dos fases: primero un preentrenamiento con 7.481 ejemplos de corpus reales de Gu Cheng (poemas, prosa, aforismos y fragmentos de novelas extraídos mediante OCR de 5 PDFs), y posteriormente un ajuste fino supervisado (SFT) con 213 pares de instrucción-respuesta para tareas de continuación y imitación de estilo.

Una característica destacable del proyecto es la exclusión explícita de cualquier texto generado por IA en los datos de entrenamiento, utilizando únicamente obras auténticas del poeta. El entrenamiento se realizó desde cero, sin partir de pesos preentrenados, lo que explica las limitaciones de convergencia observadas en las variantes alternativas (dLM y Linear) con el mismo volumen de datos.

## Capacidades

- Generación de poesía china moderna en estilo Gu Cheng, con capacidad para producir versos completos con imaginería poética.
- Continuación de texto (modo raw): puede continuar un fragmento dado como prompt inicial.
- Instrucción de seguimiento básica (modo chat): responde a peticiones como "escribe un poema al estilo de Gu Cheng".
- Generación de texto en prosa poética y aforismos, dado que el corpus de preentrenamiento incluye estos géneros.
- Capacidad multilingüe limitada: entrenado principalmente en chino, sin evidencia de soporte para otros idiomas.
- No dispone de soporte para tool calling, funciones de agente, visión ni razonamiento multi-paso.

## Casos de uso

- Asistente de escritura creativa para poetas: el modelo puede generar borradores de poemas en estilo Gu Cheng que sirvan como punto de partida para la creación literaria humana, aprovechando su capacidad para producir imaginería coherente.
- Herramienta educativa en clases de literatura china: los estudiantes pueden comparar poemas generados con los originales de Gu Cheng para analizar las características estilísticas del poeta.
- Investigación en estilometría computacional: permite estudiar qué patrones lingüísticos y métricos son identificables como "estilo Gu Cheng" mediante el análisis de las salidas del modelo.
- Generación de contenido para antologías digitales o proyectos de arte generativo: el modelo puede producir variaciones poéticas que se integren en instalaciones artísticas o publicaciones experimentales.
- Benchmark para comparar arquitecturas de modelos pequeños: sirve como caso de estudio para evaluar cómo diferentes arquitecturas (autoregresiva vs. difusión vs. lineal) convergen con datos muy limitados.
- Prototipo de sistema de generación de poesía personalizable: la estructura del proyecto permite reentrenar el modelo con otros poetas o estilos literarios modificando únicamente el corpus de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El proyecto incluye únicamente una comparación cualitativa entre las tres variantes del modelo (AR, dLM y Linear), donde la variante AR demuestra una calidad de generación claramente superior: produce poemas completos con sentido poético, mientras que dLM genera salidas demasiado cortas o repetitivas y Linear produce texto con caracteres corruptos o repeticiones.

## Requisitos de hardware

- Tamaño del repositorio: 0.1 GB, con pesos de aproximadamente 131 MB para la variante AR.
- VRAM estimada: al ser un modelo de 104M parámetros, puede ejecutarse en GPUs con 4 GB de VRAM o menos en fp32, y significativamente menos en cuantización.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente para inferencia.
- Ejecución en CPU: viable para inferencia, con latencia de unos pocos segundos por generación.
- Opciones de despliegue: el repositorio incluye scripts de generación propios (`gen_gucheng_ar.py`), sin soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Al ser un modelo pequeño, el throughput es alto incluso en hardware modesto, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Entrenamiento | Calidad generacion |
|---|---|---|---|---|
| MiniMind-GuCheng-AR | 104M | Transformer autoregresivo | Pretrain + SFT desde cero | Alta (poesia coherente) |
| MiniMind-GuCheng-dLM | 104M | Difusion (MDM, atencion bidireccional) | A2D transferencia | Baja (salidas cortas/repetitivas) |
| MiniMind-GuCheng-Linear | ~104M | Gated DeltaNet (atencion lineal) | A2L transferencia | Muy baja (texto corrupto) |

Los tres modelos comparten el mismo tamaño, datos y objetivo, diferenciándose únicamente en la arquitectura. El proyecto no incluye comparación con otros modelos de generación de poesía china disponibles públicamente.

## Limitaciones y advertencias

- El modelo se entrenó con un corpus muy reducido (7.481 ejemplos), lo que limita su generalización y lo hace propenso a sobreajustar los patrones del corpus de Gu Cheng.
- Riesgo de alucinación: puede generar texto que imite superficialmente el estilo pero carezca de coherencia semántica profunda, especialmente con prompts fuera del dominio poético.
- Sin licencia especificada: el uso comercial no está claramente permitido, lo que requiere contacto con el autor antes de cualquier despliegue en producción.
- Limitaciones de idioma: solo entrenado en chino; no se espera que funcione correctamente en otros idiomas.
- El proyecto se describe como "investigación comparativa", no como un producto listo para producción; la calidad de generación es variable y no está garantizada.
- Los datos de entrenamiento provienen de OCR de PDFs, lo que puede introducir errores de transcripción en el corpus.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shikunpunk/MiniMind-GuCheng-AR
- Perfil del autor en HuggingFace: https://huggingface.co/shikunpunk
- Repositorio MiniMind (arquitectura base): https://github.com/jingyaogong/minimind
- Documentación de comparación de entrenamiento: referenciada como `TRAINING_COMPARISON.md` en el repositorio del modelo (no disponible directamente).
