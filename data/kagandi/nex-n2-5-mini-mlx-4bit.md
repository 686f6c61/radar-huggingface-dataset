# Kagandi/Nex-N2.5-mini-mlx-4Bit

## Resumen

Kagandi/Nex-N2.5-mini-mlx-4Bit es una conversión a MLX con cuantificación de 4 bits de Nex-N2.5-mini, un modelo de agente multimodal de aproximadamente 35 mil millones de parámetros desarrollado por Nex-AGI. El modelo original se publicó bajo licencia Apache 2.0 en formato BF16, acompañado de recetas de despliegue para vLLM, SGLang y una imagen Docker. Esta variante concreta ha sido convertida por el usuario Kagandi empleando mlx-lm 0.31.2 para ejecutarse de forma eficiente en hardware Apple Silicon.

La arquitectura del modelo base aparece etiquetada como qwen3_5_moe, lo que indica una estructura Mixture-of-Experts (MoE) multimodal capaz de procesar entradas de imagen y texto. Aunque el modelo original es un checkpoint de 35B, esta versión MLX reducida ocupa aproximadamente 19,5 GB en disco gracias a la cuantización de 4 bits, lo que facilita su ejecución con memoria unificada en dispositivos Mac modernos.

Su relevancia actual radica en que permite probar un modelo de agente de gran tamaño y capacidades multimodales en un entorno de desarrollo local sin necesidad de GPUs dedicadas, manteniendo una licencia permisiva Apache 2.0. No obstante, se trata de un proyecto reciente con cero descargas y cero valoraciones de la comunidad, por lo que su comportamiento en producción no ha sido validado externamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE multimodal) |
| Parametros totales | 34.660.608.768 (≈35.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Nex-N2.5-mini fue lanzado por Nex-AGI como un checkpoint de 35B en BF16 bajo licencia Apache 2.0. Según la etiqueta qwen3_5_moe, su arquitectura corresponde a una variante de Mixture-of-Experts multimodal, lo que significa que procesa simultáneamente imágenes y texto mediante un diseño de atención acoplado a un conjunto de expertos. El hecho de que sea un "modelo de agente" sugiere que ha sido entrenado para tareas de razonamiento multi-paso y llamadas a herramientas, aunque la información disponible no detalla los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO.

La conversión publicada por Kagandi no modifica la arquitectura original, sino que reempaqueta los pesos en formato MLX con cuantificación de 4 bits utilizando mlx-lm 0.31.2. Esto reduce significativamente el tamaño del modelo respecto al original BF16 y lo hace compatible con el runtime de Apple Silicon. La etiqueta endpoints_compatible sugiere que el modelo puede servirse a través de APIs estándar, mientras que los tags de la familia quantized indican que forma parte de una serie de cuantizaciones del mismo checkpoint base.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para respuestas tipo chat y generación de texto libre.
- Comprensión multimodal: la arquitectura qwen3_5_moe y el tag image-text-to-text indican capacidad para razonar sobre imágenes además de texto.
- Orientación a agentes: según AI Weekly, el modelo original se presenta como un "agent model", preparado para integrarse en flujos de trabajo automatizados.
- Compatibilidad con endpoints: el tag endpoints_compatible permite desplegarlo como servicio accesible mediante protocolos estándar.
- Ejecución en Apple Silicon: la cuantización MLX de 4 bits está pensada para aprovechar la memoria unificada de los chips Apple.
- Soporte de plantillas de chat: la model card incluye un ejemplo de uso con apply_chat_template, lo que confirma compatibilidad con sistemas de mensajes multi-turno.
- Despliegue flexible: el modelo base puede servirse con vLLM, SGLang o Docker, aunque esta variante MLX está optimizada para mlx-lm.

## Casos de uso

- Asistentes conversacionales locales en macOS: integración en aplicaciones de chat personales mediante mlx-lm, aprovechando la cuantización de 4 bits para ejecutar un modelo de 35B en un Mac con memoria unificada de 24 GB o superior.
- Análisis de capturas de pantalla y documentos visuales: al aceptar entradas de imagen, el modelo puede describir interfaces de usuario, diagramas o fotografías dentro de un flujo de soporte técnico.
- Prototipado de agentes autonómicos en entornos de desarrollo: gracias a su naturaleza de modelo de agente y a la compatibilidad con endpoints, puede usarse como cerebro de bots que combinan visión y lenguaje para tareas de automatización.
- Generación de informes técnicos a partir de material gráfico: combinando imágenes y texto, se puede solicitar la redacción de resúmenes de informes que incluyan gráficos, tablas o capturas.
- Educación y tutoría visual: el modelo puede responder preguntas sobre ilustraciones, esquemas o fotografías, lo que resulta útil en aplicaciones educativas que requieren explicaciones sobre elementos visuales.
- Evaluación y pruebas de modelos multimodales en equipos consumer: permite a investigadores y desarrolladores valorar capacidades de un MoE grande sin necesidad de infraestructura cloud ni GPUs NVIDIA, usando únicamente un Mac.
- Integración en pipelines internos de QA asistido por visión: un equipo de control de calidad podría enviar imágenes de errores junto a la descripción textual del fallo y obtener una diagnosis preliminar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones para MMLU, HumanEval, GSM8K ni para evaluaciones específicas de razonamiento multimodal. El modelo tampoco ha sido sometido a evaluaciones comparativas externas reconocibles, dado su carácter de conversión comunitaria reciente.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19,5 GB de memoria unificada, según el tamaño del repositorio, para la cuantización MLX de 4 bits.
- GPU recomendadas: no requiere GPU discreta; este formato está optimizado para Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra). El modelo base podría ejecutarse en vLLM sobre GPUs NVIDIA, pero no se han facilitado requisitos de VRAM para esa configuración.
- ¿Cabe en GPU de consumo? El formato MLX está orientado a macOS, no a CUDA. Para usarlo en una RTX 4090 o similar sería necesario convertir los pesos manualmente, lo que no se ha verificado.
- Opciones de despliegue: mlx-lm para Apple Silicon; vLLM, SGLang y Docker para el checkpoint original BF16. La etiqueta endpoints_compatible permite exponer el modelo como servicio HTTP.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de rendimiento.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con alternativas. Los modelos de la misma categoría general (MoE ~35B, Apache 2.0, multimodales) incluyen Qwen3-30B-A3B, Mixtral 8x7B o la familia Qwen2.5-VL, pero no existen en la información proporcionada datos de rendimiento comparables. Por tanto, la comparación directa se limita a parámetros estructurales:

| Modelo | Parametros totales | Arquitectura | Multimodal | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Nex-N2.5-mini (base) | ≈35B | MoE qwen3_5_moe | Sí | Apache 2.0 | BF16 |
| Kagandi/Nex-N2.5-mini-mlx-4Bit | ≈35B | MoE qwen3_5_moe | Sí | Apache 2.0 | MLX 4-bit |
| Qwen3-30B-A3B | 30B | MoE | No (según info disponible) | Apache 2.0 | Múltiples |
| Mixtral 8x7B | 46,7B | MoE | No | Apache 2.0 | Múltiples |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo multimodal reciente, no hay auditorías publicadas de sesgos.
- Riesgo de alucinación: no se ha evaluado la fiabilidad de sus respuestas, y en tareas de interpretación de imágenes puede generar descripciones incorrectas.
- Limitaciones de contexto o idioma: no hay información sobre la longitud máxima de ventana ni sobre los idiomas entrenados, por lo que no se recomienda asumir soporte de idiomas concretos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la ausencia de validación externa implica que el usuario debe realizar su propia evaluación antes de desplegarlo en producción.
- Caveat clave para producción: la conversión MLX 4-bit ha sido publicada por un tercero con cero descargas, cero likes y sin verificación independiente. Puede contener errores de cuantización o incompatibilidades con versiones futuras de mlx-lm.
- Rendimiento no verificado al estar etiquetado como endpoints_compatible, no se garantiza el cumplimiento de los estándares de API en todas las plataformas de despliegue.
- El modelo no debe usarse como sustituto de una evaluación rigurosa en dominios críticos sin antes validar sus resultados en el caso de uso específico.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Kagandi/Nex-N2.5-mini-mlx-4Bit
- Modelo base original: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Artículo de AI Weekly sobre el lanzamiento de Nex-N2.5-mini: https://aiweekly.co/alerts/nex-agi-ships-35b-nex-n25-mini-agent-model-under-apache-20
- Búsqueda de modelos cuantizados basados en Nex-N2.5-mini: https://huggingface.co/models?other=base_model%3Aquantized%3Anex-agi%2FNex-N2.5-mini
