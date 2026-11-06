# Mincofficial/Minico-M1-1105-MLX

## Resumen

Minico M1 1105 MLX es una compilación cuantizada a 8 bits en formato MLX del modelo Minico M1 1105, un ajuste fino de LiquidAI/LFM2.5-350M desarrollado por el usuario Mincofficial. El modelo está pensado para ejecutarse en Apple Silicon mediante la librería `mlx-lm`, y su rasgo más distintivo es la incorporación de niveles de esfuerzo de razonamiento (`reasoning_effort`) configurables por conversación, que controlan cuántos tokens dedica el modelo a "pensar" antes de responder.

Con 354 millones de parámetros totales y un repositorio de 0,4 GB, se trata de un modelo pequeño orientado a generación de texto y conversación en inglés. No es un modelo de propósito general de gran escala, sino una variante especializada en razonamiento con presupuesto controlado, lo que lo hace interesante para prototipado local en portátiles y equipos de sobremesa con chip de Apple.

La relevancia actual radica en su enfoque de "esfuerzo de razonamiento" ajustable, una tendencia creciente en modelos que permiten al desarrollador equilibrar latencia y calidad sin cambiar de modelo. Al estar construido sobre LFM2.5-350M, hereda la arquitectura y las limitaciones del modelo base de Liquid AI, pero añade un mecanismo de control explícito del pensamiento que no está presente en el original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda de LiquidAI/LFM2.5-350M); detalles internos no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); el repo base ofrece precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una versión modificada de LiquidAI/LFM2.5-350M. Según la model card, los pesos se modificaron mediante ajuste fino supervisado (SFT), DPO (Direct Preference Optimization) y GRPO (Group Relative Policy Optimization), además de fusión de pesos (weight merging). No se especifican el número de tokens de entrenamiento, la composición del dataset ni detalles sobre la arquitectura interna más allá de la referencia a LFM2.

La innovación técnica destacable es el sistema de niveles de esfuerzo de razonamiento, que se controla mediante la plantilla de chat con el parámetro `reasoning_effort`. Los niveles disponibles son `off`, `low`, `medium` (por defecto), `high` y `max`, con presupuestos máximos de tokens nuevos de 1024, 640, 1152, 2368 y 4608 respectivamente. La plantilla también acepta alias (`none`, `minimal`, `xhigh`) y `enable_thinking=False` como equivalente a `off`. Los valores desconocidos recaen en `medium`. El modelo fue entrenado con conversaciones que mantienen un único ajuste de esfuerzo de principio a fin, por lo que no se recomienda cambiarlo a mitad de una conversación.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento con presupuesto de tokens controlable mediante `reasoning_effort` (cinco niveles).
- Modo sin pensamiento (`off`) para respuestas inmediatas, con bloque de pensamiento vacío pre-rellenado.
- Modos de pensamiento corto (`low`), normal (`medium`), largo (`high`) y máximo (`max`).
- Compatibilidad con la plantilla de chat de `mlx-lm` y sus opciones de configuración.
- Soporte de cuantización 8-bit para Apple Silicon con pérdida mínima declarada por el autor.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni multimodalidad.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionarse con `mlx-lm` en un equipo Apple Silicon, usando el nivel `off` o `low` para respuestas rápidas en un chat de atención al usuario o asistente personal, con latencia baja gracias a sus 354M de parámetros.
- Prototipado de razonamiento con presupuesto controlado: investigadores pueden comparar la calidad de las respuestas con `low`, `medium`, `high` y `max` sobre el mismo conjunto de preguntas para estudiar el efecto del presupuesto de pensamiento en un modelo pequeño.
- Generación de respuestas matemáticas paso a paso: el comando de ejemplo de la model card (`"What is 5 + 5 x 5?"`) ilustra su uso para problemas aritméticos simples donde el modo `medium` o `high` permite mostrar el razonamiento intermedio.
- Educación y tutoría: con el nivel `high` o `max`, el modelo puede generar explicaciones más detalladas para preguntas de estudiantes, manteniendo un único ajuste de esfuerzo durante toda la sesión.
- Evaluación de técnicas de ajuste fino: al estar construido con SFT, DPO y GRPO sobre un modelo base público, sirve como caso de estudio para comparar el efecto de estas técnicas en un modelo de 350M.
- Despliegue en entornos con recursos limitados: su tamaño de 0,4 GB en 8-bit permite incluirlo en aplicaciones de escritorio o scripts locales sin necesidad de GPU dedicada, siempre que se disponga de Apple Silicon.
- Generación de texto en pipelines de CI para pruebas: por su bajo coste de ejecución, puede usarse como modelo de referencia en tests automatizados de generación de texto en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo MLX para Apple Silicon, no aplica VRAM de GPU dedicada; el repositorio ocupa 0,4 GB en 8-bit, por lo que la memoria unificada necesaria es del orden de 1 GB o menos en inferencia.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y posteriores) con memoria unificada suficiente; no se documenta soporte para GPU NVIDIA o AMD en esta compilación.
- Cabe en cualquier Mac con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: `mlx-lm` (librería oficial indicada en la model card); para precisión completa, cargar el repo base `Mincofficial/Minico-M1-1105` con `mlx_lm`.
- Latencia y throughput: no disponibles en la información proporcionada. La model card recomienda temperatura 0,1–0,3, top_k 50 y penalización de repetición 1,05.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Minico M1 1105 MLX | 354M | no disponible | LFM Open License v1.0 | safetensors (MLX, 8-bit) | Razonamiento con esfuerzo configurable; solo inglés; Apple Silicon |
| LiquidAI/LFM2.5-350M | 350M (aprox.) | no disponible | no disponible en la información | no disponible | Modelo base del que deriva; sin el sistema de esfuerzo de razonamiento documentado aquí |
| Minicofficial/Minico-M1-1105 | 354M | no disponible | LFM Open License v1.0 | safetensors (precisión completa) | Versión sin cuantizar del mismo modelo; requiere `mlx-lm` para cargar |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés según el campo `language`; no se documentan otros idiomas.
- No se especifica la longitud de contexto, lo que impide planificar conversaciones largas con garantías.
- Riesgo de alucinación inherente a modelos de 354M de parámetros; la calidad del razonamiento en los modos `high` y `max` no está validada con benchmarks publicados.
- El cambio de nivel de esfuerzo a mitad de conversación no está recomendado y puede degradar la coherencia, ya que el modelo fue entrenado con un único ajuste por conversación.
- La licencia LFM Open License v1.0 permite uso comercial solo a organizaciones por debajo del umbral de ingresos definido en la licencia; es necesario leerla antes de un uso comercial.
- El modelo es una modificación de LFM2.5-350M y conserva los avisos de atribución del modelo base en el archivo `LICENSE`.
- Al ser una compilación MLX, está restringido a Apple Silicon; no es portable a otros backends sin conversión.
- No se documentan capacidades de tool calling, agentes, visión ni audio, por lo que no debe asumirse su disponibilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- [Minicofficial/Minico-M1-1105-MLX en Hugging Face](https://huggingface.co/Mincofficial/Minico-M1-1105-MLX)
- [Minicofficial/Minico-M1-1105 (modelo base, precisión completa)](https://huggingface.co/Mincofficial/Minico-M1-1105)
- [LiquidAI/LFM2.5-350M (modelo original de Liquid AI)](https://huggingface.co/LiquidAI/LFM2.5-350M)
- [Licencia LFM Open License v1.0 (archivo LICENSE del repositorio)](https://huggingface.co/Mincofficial/Minico-M1-1105-MLX/blob/main/LICENSE)
- [mlx-lm (librería de inferencia)](https://github.com/ml-explore/mlx-lm)
