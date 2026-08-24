# Irfanuruchi/MedPsy-4B-MLX-8bit

## Resumen

MedPsy-4B-MLX-8bit es una conversión al formato MLX con cuantización de 8 bits del modelo MedPsy-4B, desarrollado por QVAC y optimizado para inferencia en chips Apple Silicon. El modelo original es un sistema de razonamiento médico y sanitario, construido sobre Qwen3-4B-Thinking-2507 y post-entrenado mediante supervisión fina (SFT) y aprendizaje por refuerzo. Esta variante MLX permite ejecutar el modelo en portátiles Mac con memoria unificada, manteniendo una velocidad de generación cercana a los 28 tokens por segundo en un Apple M3 Pro, con un pico de memoria de 4,5 GB.

La relevancia actual de este modelo radica en que democratiza el acceso a un modelo especializado en el dominio clínico para entornos con recursos limitados, sin necesidad de GPUs dedicadas. Su arquitectura hereda el modo de razonamiento de Qwen3, que emite una cadena de pensamiento antes de la respuesta final. El repositorio incluye además variantes de 4 y 6 bits, lo que amplía el rango de dispositivos compatibles.

Aunque el número de parámetros según los safetensors del repositorio es de 1.131.460.096, el modelo base MedPsy-4B se declara con 4,4 mil millones de parámetros según fuentes externas; la discrepancia no está explicada en la documentación disponible. La longitud de contexto soportada es de 262.144 tokens, según la base de datos de llmrun.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Thinking-2507) |
| Parametros totales | 1.131.460.096 (según safetensors del repositorio) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8-bit (affine, group size 64, 8.500 bits por peso) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Qwen3-4B-Thinking-2507, que emplea un transformer denso con capacidad de razonamiento explícito: el modelo genera una sección de pensamiento (thinking) antes de producir la respuesta final. Esta característica se mantiene en la conversión MLX. El entrenamiento original fue realizado por QVAC mediante supervisión fina (SFT) y refuerzo (RL), aunque no se detallan el volumen de datos ni las técnicas específicas utilizadas. La conversión MLX se realizó con la herramienta MLX-LM 0.31.3 y MLX 0.32.1, aplicando una cuantización afín con grupo de tamaño 64.

El modelo solo acepta texto y no tiene capacidades multimodales. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre el número total de tokens empleados.

## Capacidades

- Generación de texto en inglés con foco en dominios médicos y sanitarios.
- Razonamiento clínico y explicación de conceptos médicos (por ejemplo, sensibilidad y especificidad).
- Razonamiento en cadena (thinking mode) heredado de Qwen3, que precede a las respuestas finales.
- Soporte de conversación multi-turno mediante plantilla de chat estándar.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de visión, audio u otras modalidades.
- Solo idioma inglés; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- Educación médica: el modelo puede explicar términos, procedimientos y conceptos clínicos a estudiantes de medicina, generando respuestas razonadas con contexto de 262.144 tokens para materiales extensos.
- Asistencia a profesionales sanitarios: puede servir como apoyo en la revisión de literatura, preparación de informes o resumen de historiales clínicos, aunque siempre con supervisión humana.
- Generación de contenido de salud pública: redacción de guías o artículos divulgativos sobre prevención, síntomas o tratamientos, con la advertencia de revisión profesional.
- Simulación de pacientes virtuales: en entornos educativos, puede interactuar como paciente simulado para entrenar habilidades de entrevista clínica.
- Consulta de información farmacológica: puede responder preguntas sobre medicamentos, dosis e interacciones, aunque se debe verificar con fuentes fiables.
- Análisis de textos médicos: dado su largo contexto, puede procesar documentos extensos como historias clínicas o artículos de investigación para extraer información relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que los resultados de evaluación pertenecen al modelo fuente (MedPsy-4B) y no fueron reproducidos para esta conversión cuantizada. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- El modelo está optimizado para Apple Silicon con MLX; se requiere macOS con chip M1 o superior.
- En un Apple M3 Pro con 18 GB de memoria unificada, la generación alcanza 28.149 tokens/segundo con un pico de memoria de 4,459 GB para la variante 8-bit.
- La variante 4-bit ocupa 2,1 GB y alcanza 47.054 tokens/s; la variante 6-bit ocupa 3,1 GB y 35.439 tokens/s.
- No está diseñado para GPUs NVIDIA o AMD; el formato MLX no es compatible con CUDA.
- Para despliegue en otros entornos, habría que convertir los pesos a otros formatos (p. ej., GGUF), pero no se proporcionan instrucciones.
- La latencia medida en el M3 Pro es de aproximadamente 35,5 ms por token (derivado de 28.149 tokens/s).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (modelos médicos de tamaño similar). El modelo base MedPsy-4B se puede comparar con Qwen3-4B-Instruct, pero no se han publicado resultados de benchmarks que permitan una comparación cuantitativa. La licencia Apache 2.0 es más permisiva que la de otros modelos médicos como Llama-3.1-8B (que también es Apache 2.0), pero no se dispone de datos de rendimiento específicos.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico y no debe sustituir el juicio clínico profesional. Sus respuestas pueden ser incorrectas, incompletas o engañosas, incluso si parecen autorizadas.
- Solo soporta inglés; no se recomienda su uso en otros idiomas.
- La cuantización de 8 bits puede introducir degradación de rendimiento respecto al modelo original; los resultados de evaluación no han sido reproducidos para esta conversión.
- El modelo puede emitir razonamientos no deseados o alucinaciones en contextos complejos.
- La licencia Apache 2.0 permite uso comercial, pero se deben revisar los archivos LICENSE y ATTRIBUTIONS incluidos en el repositorio.
- No se dispone de información sobre la calidad del entrenamiento en datos médicos específicos (por ejemplo, historiales clínicos reales).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Irfanuruchi/MedPsy-4B-MLX-8bit
- Modelo fuente: https://huggingface.co/qvac/MedPsy-4B
- Blog de investigación de QVAC: https://huggingface.co/blog/qvac/medpsy
- Página de hardware y compatibilidad (llmrun): https://llmrun.dev/model/qvac-medpsy-4b
