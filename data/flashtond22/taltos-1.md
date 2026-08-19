# Flashtond22/Taltos-1

## Resumen

Táltos-1 es un modelo de lenguaje de 1.073 millones de parámetros, desarrollado por Flashtond22, específicamente optimizado para el idioma húngaro. Parte del modelo base Qwen/Qwen3.5-0.8B-Base (Apache 2.0) y lo adapta mediante tres intervenciones: una expansión del vocabulario con 32 768 tokens entrenados para húngaro, un entrenamiento continuo sobre corpus web húngaro de alta calidad (FineWeb2-HQ) con replay en inglés, y un ajuste fino supervisado con cadenas de razonamiento generadas por un modelo profesor más grande.

El modelo opera en dos modos: un modo "pensamiento" que genera una cadena de razonamiento explícita en un bloque `thinking`, y un modo rápido que responde directamente. Su ventana de contexto alcanza los 65 536 tokens, y el autor reporta una reducción del 47 % en el número de tokens necesarios para representar texto húngaro gracias a la cirugía de vocabulario. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-0.8B-Base) |
| Parametros totales | 1 073 283 904 (1.07 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 65 536 tokens |
| Tipos de cuantizacion | No disponible (repositorio solo contiene safetensors en bfloat16) |
| Idiomas soportados | Húngaro (hu), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Táltos-1 es un modelo denso basado en la arquitectura de Qwen3.5-0.8B-Base, un transformer causal con atención completa. La innovación principal es la expansión del vocabulario: se entrenó un BPE adicional sobre las salidas del tokenizer original, añadiendo 32 768 tokens específicos para húngaro. Esto garantiza que las nuevas reglas de fusión se apliquen de forma consistente, logrando una compresión del texto húngaro de 1.473× en caracteres por token (de 2.938 a 4.327).

El entrenamiento se realizó en cuatro fases: (1) expansión del vocabulario con 500 millones de caracteres de texto húngaro; (2) entrenamiento continuo con 62 millones de tokens (78 % húngaro, 22 % inglés replay) que redujo la pérdida de 7.06 a 3.11; (3) ajuste fino supervisado con 23 millones de tokens en 30 150 muestras de instrucciones húngaras y cadenas de razonamiento; (4) una fase de calibración de identidad y rechazo de preguntas con 5.8 millones de tokens. El tiempo total de entrenamiento fue de aproximadamente 4.5 horas en una única GPU NVIDIA L40S.

## Capacidades

- Generación de texto en húngaro e inglés con calidad nativa en húngaro para su tamaño.
- Razonamiento paso a paso en modo `thinking`, con verificación interna de resultados (p. ej., cálculos aritméticos realizados por dos vías).
- Conversación multi-turno mediante plantilla de chat estándar de Qwen.
- Rechazo de peticiones dañinas con justificación explícita.
- Corrección de premisas falsas en las preguntas del usuario.
- Autoevaluación honesta: el modelo declara explícitamente cuando no conoce datos actuales o personales.
- Compresión eficiente del texto húngaro, lo que permite mayor contexto efectivo por token.

## Casos de uso

- Asistente de atención al cliente en húngaro: el modelo gestiona conversaciones multi-turno con contexto largo (hasta 65 536 tokens) y puede mantener el historial completo de una interacción sin truncamiento, adecuado para empresas con soporte en húngaro.
- Redacción y corrección de textos en húngaro: genera borradores, reescribe párrafos y adapta el tono según la instrucción, con una compresión de tokens que reduce costes de inferencia.
- Resumen de documentos largos en húngaro: su ventana de contexto amplia permite procesar informes, artículos o actas completas y producir resúmenes estructurados.
- Tutor de idioma húngaro: explica reglas gramaticales, practica vocabulario y genera ejercicios, aprovechando el modo de razonamiento para desglosar conceptos.
- Extracción de información de textos húngaros: identifica entidades, fechas y eventos en documentos, aunque con la advertencia de que los hechos específicos pueden ser imprecisos.
- Prototipado de aplicaciones de chat multilingüe: al ser un modelo pequeño (1.07 B), puede desplegarse en hardware modesto para pruebas de concepto o entornos con restricciones de recursos.

## Benchmarks y rendimiento

El autor proporciona métricas de compresión y perplexidad tokenizer-independiente, comparando Táltos-1 con su modelo base:

| Metrica | Qwen3.5-0.8B-Base | Táltos-1 | Cambio |
|---|---|---|---|
| bit/caracter (húngaro held-out, menor es mejor) | 1.2607 | 1.0851 | +13.9 % |
| caracter/token (húngaro) | 2.938 | 4.327 | 1.473× |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor señala que la precisión factual es débil, algo esperable en un modelo de 1.07 B de parámetros.

## Requisitos de hardware

- VRAM estimada: el modelo en bfloat16 ocupa aproximadamente 2.15 GB de pesos (1.073 B × 2 bytes). Con overhead de activaciones y caché KV para 65 536 tokens de contexto, se recomiendan al menos 6-8 GB de VRAM para uso interactivo.
- GPU recomendadas: cualquier GPU con 8 GB o más, como NVIDIA RTX 3060/3070, RTX 4060/4070, RTX 4090, o GPUs de datacenter como L40S (usada en el entrenamiento) o A10.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más. En 4 bits cabría en 4 GB, aunque no se proporcionan cuantizaciones oficiales.
- Opciones de despliegue: transformers (con `device_map="cuda"`), vLLM (compatible con modelos Qwen), TGI, y potencialmente llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponible; al ser un modelo pequeño, se espera una generación rápida en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Táltos-1 | 1.07 B | 65 536 | hu, en | Apache 2.0 | Fine-tune de Qwen3.5-0.8B-Base con vocabulario húngaro expandido |
| Qwen3.5-0.8B-Base | 0.8 B | 65 536 | multilingue | Apache 2.0 | Modelo base, sin optimización específica para húngaro |
| Llama-3.2-1B | 1.23 B | 128 000 | multilingue | Llama 3.2 | No tiene soporte específico para húngaro, contexto mayor |
| Gemma-2-2B | 2.6 B | 8 192 | multilingue | Gemma Terms | Contexto corto, no optimizado para húngaro |

No se dispone de benchmarks comparativos entre estos modelos. La comparación se basa en especificaciones técnicas publicadas.

## Limitaciones y advertencias

- Precisión factual débil: nombres, fechas, autores y detalles históricos pueden ser incorrectos. El modelo tiende a ser honesto sobre su desconocimiento, pero la calibración no es perfecta.
- Riesgo de alucinación: puede generar respuestas coherentes pero inventadas, especialmente en temas especializados o con números concretos.
- No apto para decisiones médicas, legales o financieras: el autor lo advierte explícitamente.
- Sesgos heredados: el entrenamiento con texto de internet puede incorporar sesgos sociales y culturales.
- Limitaciones de idioma: aunque el húngaro es su punto fuerte, el inglés puede ser menos fluido que en modelos generales del mismo tamaño.
- Sin acceso a internet: no maneja información posterior a su fecha de entrenamiento (agosto de 2026).
- En modo rápido (sin `thinking`), el modelo puede omitir el razonamiento y producir respuestas menos elaboradas; el autor recomienda iniciar el bloque de pensamiento explícitamente si se desea.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Flashtond22/Taltos-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
