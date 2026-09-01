# lukaskremla/Ornith-1.5-35B-A3B-8bit-MLX-TextOnly

## Resumen

Ornith-1.5-35B-A3B-8bit-MLX-TextOnly es una cuantización en 8 bits en formato MLX del modelo Ornith-1.5-35B-A3B, desarrollada por lukaskremla. Esta versión elimina el componente de visión (vision tower) del modelo original y conserva únicamente las capacidades de texto a texto, lo que reduce la huella de memoria y la hace adecuada para ejecutarse en hardware Apple Silicon mediante la librería mlx-lm. El modelo base, Ornith-1.5-35B-A3B, pertenece a la familia Ornith de ornith-ai, una serie de modelos de código abierto orientados a tareas agénticas y auto-mejora.

Ornith-1.5 introduce un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera andamiajes (scaffolds) específicos para cada tarea y produce soluciones que se utilizan para entrenamiento por refuerzo. Esta arquitectura, basada en Qwen3.5 (etiqueta qwen3_5_moe), emplea un diseño de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y 3 mil millones activos por token. La ventana de contexto alcanza los 262 000 tokens, lo que permite procesar documentos muy extensos. La licencia MIT facilita su uso comercial y su integración en proyectos propietarios.

Esta cuantización concreta está pensada para desarrolladores que necesitan ejecutar el modelo en entornos Apple Silicon con restricciones de memoria, manteniendo las capacidades de razonamiento, tool-use y conversación multilingüe del modelo original, pero sin la parte de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (qwen3_5_moe) |
| Parametros totales | 35 000 millones (modelo base); 9 749 130 368 según safetensors (posible error de visualizacion comun en quants MLX) |
| Parametros activos | 3 000 millones (A3B) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | 8 bits, solo pesos (weight-only), afin (affine), RTN, grupo de tamano 64 |
| Idiomas soportados | No disponible (etiquetado como multilingue, sin lista especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura de mezcla de expertos derivada de Qwen3.5, con 35 000 millones de parametros totales y 3 000 millones activos por token. Esta configuracion permite un equilibrio entre capacidad y eficiencia computacional, ya que solo una fraccion de los expertos se activa en cada paso de generacion. La cuantizacion 8 bits aplicada por lukaskremla utiliza un esquema de cuantizacion solo de pesos con agrupacion de tamano 64, lo que reduce el espacio en disco y la memoria necesaria para la inferencia.

En cuanto al entrenamiento, la informacion disponible indica que Ornith-1.5 extiende el marco de auto-andamiaje (self-scaffolding) de Ornith-1.0 hacia un bucle completo de auto-mejora. El modelo es capaz de proponer nuevas tareas, generar andamiajes especificos para cada tarea y producir soluciones que se utilizan como datos para entrenamiento por refuerzo. Este proceso continuo de generacion de experiencias de aprendizaje distingue a la familia Ornith de otros modelos convencionales. No se han publicado detalles sobre el volumen de tokens de entrenamiento ni la composicion del dataset en la informacion proporcionada.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento complejo con modo de razonamiento explicito (segun BenchLM), que mejora la resolucion de problemas a costa de mayor latencia y consumo de tokens.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en flujos de trabajo automatizados.
- Capacidades agénticas: el modelo puede proponer tareas, generar andamiajes y producir soluciones, facilitando la construccion de agentes autonomos.
- Multilingue (etiquetado como tal, sin lista de idiomas especifica).
- Contexto largo de 262 000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Solo texto: esta version no incluye capacidades de vision (a diferencia de la variante con vision tower).

## Casos de uso

- Agentes autonomos de resolucion de problemas: el modelo puede proponer nuevas tareas, generar andamiajes especificos y producir soluciones, lo que lo hace idoneo para sistemas que necesitan auto-mejora continua o exploracion de tareas complejas.
- Asistentes conversacionales multilingues: gracias a su capacidad de conversacion multi-turno y su contexto de 262 000 tokens, puede mantener dialogos largos y coherentes en varios idiomas, aunque no se especifican cuales.
- Analisis de documentos extensos: la ventana de contexto amplia permite procesar informes, contratos o articulos cientificos completos sin necesidad de dividirlos en fragmentos.
- Automatizacion de flujos de trabajo con tool calling: el modelo puede invocar funciones externas, lo que permite integrarlo en pipelines de CI/CD, sistemas de gestion de datos o asistentes de productividad.
- Razonamiento logico y matematico: el modo de razonamiento explicito mejora el rendimiento en problemas que requieren pasos intermedios, util para tutoria, generacion de explicaciones o verificacion de argumentos.
- Desarrollo de codigo asistido: aunque no se menciona explicitamente, al estar basado en Qwen3.5 es probable que tenga capacidades de generacion de codigo; puede usarse en entornos de desarrollo integrado con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos numericos de MMLU, HumanEval, GSM8K u otras pruebas estandar para esta cuantizacion especifica ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- Al estar en formato MLX, esta optimizado para Apple Silicon (chips M1, M2, M3 y M4).
- El tamano del repositorio es de 36,8 GB, lo que da una idea del espacio en disco necesario. La memoria RAM unificada requerida para cargar el modelo en 8 bits se estima en torno a 35-40 GB, aunque al ser un MoE con solo 3 000 millones de parametros activos, la memoria activa durante la inferencia es menor.
- Se recomienda un Mac con al menos 48 GB de RAM unificada para una experiencia fluida; con 32 GB podria funcionar con limitaciones de velocidad.
- No es compatible directamente con GPUs NVIDIA o AMD; el despliegue se realiza mediante mlx-lm, la libreria de Apple para aprendizaje automatico en silicio.
- Opciones de despliegue: mlx-lm (inferencia local), posiblemente integrable en aplicaciones Swift o Python. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoria. Como referencia cualitativa, se puede comparar con el modelo base sin cuantizar (ornith-ai/Ornith-1.5-35B-A3B) y con la version con vision (lukaskremla/Ornith-1.5-35B-A3B-8bit-MLX). Frente a otros MoE de tamano similar como Qwen3-30B-A3B (si existiera) o DeepSeek-V3, no se tienen datos de rendimiento publicados para esta cuantizacion. La principal diferencia con el modelo base es la reduccion de memoria y la eliminacion de la vision; con la version con vision, la diferencia es la ausencia de procesamiento de imagenes.

## Limitaciones y advertencias

- Esta version es solo texto; no puede procesar imagenes ni video, a diferencia de la variante con vision tower.
- El conteo de parametros mostrado en Hugging Face (9,7 mil millones) es probablemente incorrecto debido a un error de visualizacion comun en quants MLX; el modelo base tiene 35 mil millones de parametros totales.
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificas.
- Requiere hardware Apple Silicon; no es utilizable en entornos con GPUs NVIDIA sin una conversion adicional a otros formatos (por ejemplo, GGUF).
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los terminos del modelo base por si hubiera condiciones adicionales.
- Al ser una cuantizacion 8 bits, puede haber una ligera degradacion en la calidad de generacion respecto al modelo en precision completa, aunque no se han medido diferencias concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lukaskremla/Ornith-1.5-35B-A3B-8bit-MLX-TextOnly
- Modelo base (ornith-ai): https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Version con vision del mismo autor: https://huggingface.co/lukaskremla/Ornith-1.5-35B-A3B-8bit-MLX
- Coleccion de quants MLX (vision, texto y MTP): https://huggingface.co/collections/lukaskremla/ornith-15-35b-a3b-mlx-quants-vision-text-only-and-mtp
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Pagina del proyecto Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
