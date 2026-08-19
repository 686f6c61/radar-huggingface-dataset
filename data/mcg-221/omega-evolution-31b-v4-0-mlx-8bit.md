# McG-221/Omega-Evolution-31B-v4.0-mlx-8Bit

## Resumen

El modelo **McG-221/Omega-Evolution-31B-v4.0-mlx-8Bit** es una conversión al formato MLX (Apple Silicon) del modelo base **ReadyArt/Omega-Evolution-31B-v4.0**, realizada por el usuario McG-221 mediante la librería `mlx-lm` en su versión 0.31.2. Se trata de un modelo de generación de texto orientado al roleplay y a contenido explícito (etiquetado como `nsfw`, `explicit`, `roleplay`, `ERP`), que además se describe como `unaligned` y `dangerous`, es decir, sin alineamiento con políticas de seguridad y capaz de generar contenido potencialmente dañino.

A pesar de que el nombre sugiere 31 mil millones de parámetros, los pesos reales en safetensors contienen **8.634.585.404 parámetros** (aproximadamente 8,6 mil millones), lo que indica que la denominación "31B" no corresponde con el tamaño real del modelo o que se trata de una versión cuantizada de un modelo mayor. La conversión a MLX en 8 bits reduce el tamaño de los pesos, pero no altera el número de parámetros. El repositorio ocupa 32,6 GB, lo que sugiere que incluye los pesos en 8 bits y posiblemente otros archivos.

La relevancia de este modelo reside en su disponibilidad para ejecutarse en hardware Apple Silicon mediante MLX, ofreciendo una opción para quienes buscan un modelo sin restricciones de contenido para roleplay o experimentación. Sin embargo, su carácter no alineado y la falta de documentación técnica limitan su uso en entornos de producción o aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (según etiqueta del autor, no confirmado oficialmente) |
| Parametros totales | 8.634.585.404 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (conversión MLX) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible es muy limitada. El modelo es una conversión a MLX del checkpoint `ReadyArt/Omega-Evolution-31B-v4.0`, realizada con `mlx-lm` 0.31.2. No se proporcionan detalles sobre la arquitectura interna, el proceso de entrenamiento, el dataset utilizado ni técnicas como RLHF o DPO. El autor etiqueta el modelo con `gemma4`, lo que sugiere una arquitectura basada en la familia Gemma de Google, pero no hay confirmación oficial.

Al tratarse de una conversión de formato, no implica un entrenamiento nuevo; simplemente se adaptan los pesos existentes para ser ejecutados con la librería MLX en hardware de Apple. No se conocen innovaciones técnicas específicas más allá de la cuantización a 8 bits.

## Capacidades

- Generación de texto libre, orientada a roleplay y narrativa interactiva.
- Contenido explícito y para adultos (etiquetado como `nsfw`, `explicit`, `ERP`).
- Sin alineamiento con políticas de seguridad (`unaligned`), lo que permite respuestas sin filtros de contenido.
- Capacidad de mantener conversaciones multi-turno en escenarios de roleplay (inferido por la naturaleza del modelo, aunque no hay documentación oficial).
- No se dispone de información sobre soporte de tool calling, funciones de agente, razonamiento multi-paso o capacidades multilingües.

## Casos de uso

Dado el carácter no alineado y la falta de documentación, los casos de uso son limitados y deben considerarse con precaución:

- **Roleplay interactivo**: el modelo puede generar respuestas narrativas en escenarios de ficción o juegos de rol, manteniendo personajes y tramas.
- **Escritura creativa de contenido adulto**: adecuado para autores que buscan un asistente sin restricciones temáticas para redactar relatos explícitos.
- **Investigación sobre modelos sin alinear**: útil para estudiar el comportamiento de modelos que no han sido sometidos a procesos de alineamiento, en entornos controlados y académicos.
- **Experimentos con MLX en Apple Silicon**: sirve como ejemplo de conversión y ejecución de modelos cuantizados en 8 bits con la librería MLX.
- **Pruebas de generación de texto en entornos locales**: puede emplearse para evaluar la calidad de la generación sin conexión a servicios externos.
- **Uso personal y recreativo**: para usuarios que deseen interactuar con un modelo sin filtros en su propio hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- **Memoria**: el modelo en 8 bits ocupa aproximadamente 8,6 GB en pesos, pero el repositorio completo pesa 32,6 GB. Para inferencia en MLX, se recomienda un Mac con al menos 16 GB de memoria unificada (M1 Pro o superior) para evitar swapping.
- **GPU**: cualquier chip Apple Silicon (M1, M2, M3, M4) con memoria unificada suficiente. No es compatible con GPUs NVIDIA o AMD, ya que MLX es específico de Apple.
- **Despliegue**: se puede usar con `mlx-lm` (instalable vía `pip install mlx-lm`) y cargar el modelo directamente desde Hugging Face.
- **Latencia**: no hay datos oficiales. En un Mac con 32 GB de memoria unificada, la generación de tokens podría rondar los 20-50 tokens/segundo, dependiendo de la longitud de la secuencia y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen modelos equivalentes en la misma categoría (roleplay sin alinear) con conversión MLX. El modelo base `ReadyArt/Omega-Evolution-31B-v4.0` podría compararse con otros modelos de roleplay como `Pygmalion` o `MythoMax`, pero no hay datos de rendimiento ni especificaciones públicas para realizar una comparación objetiva.

## Limitaciones y advertencias

- **Contenido peligroso**: el modelo está etiquetado como `dangerous` y `unaligned`, por lo que puede generar instrucciones dañinas, ilegales o éticamente cuestionables. No debe utilizarse en aplicaciones públicas o comerciales sin un sistema de moderación robusto.
- **Sesgos y alucinaciones**: al no estar alineado, es probable que presente sesgos y alucinaciones frecuentes, especialmente en temas sensibles.
- **Documentación insuficiente**: no hay información sobre el dataset de entrenamiento, la arquitectura exacta ni las capacidades técnicas reales.
- **Idiomas**: no se especifican los idiomas soportados; probablemente se centre en inglés, pero no hay confirmación.
- **Licencia**: aunque la licencia declarada es Apache 2.0, el modelo contiene contenido explícito y sin alinear, lo que puede generar problemas legales o de cumplimiento en ciertos contextos.
- **Hardware limitado**: solo funciona en Apple Silicon, lo que restringe su despliegue en infraestructuras estándar con GPUs NVIDIA.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/McG-221/Omega-Evolution-31B-v4.0-mlx-8Bit)
- [Modelo base: ReadyArt/Omega-Evolution-31B-v4.0](https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0)
