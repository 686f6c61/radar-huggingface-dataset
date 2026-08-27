# AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Inspector-MLX

## Resumen

NOESIS-Qwopus3.5-0.8B-v3-Inspector-MLX es un modelo de lenguaje especializado en tareas de inspección ligera, validación, comprobaciones de enrutamiento y revisión de calidad de agentes. Ha sido desarrollado por AMAImedia como parte de la plataforma profesional de doblaje multilingüe NOESIS (versión v16.1), bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). El modelo se distribuye en formato MLX para inferencia en Apple Silicon, y existe una variante GGUF Q8_0 para entornos llama.cpp.

Se basa en la arquitectura Qwen3_5ForCausalLM, con aproximadamente 0,8 mil millones de parámetros (752.393.024 según los pesos safetensors), 24 capas y un tamaño oculto de 1024. La configuración declara una longitud de contexto de 1.048.576 posiciones, lo que lo sitúa en el rango de los modelos de ventana muy larga. Su función principal dentro del ecosistema NOESIS es actuar como especialista "inspector": revisar transcripciones, validar salidas de agentes y realizar controles de calidad de forma determinista y con baja latencia.

La relevancia de este modelo reside en su tamaño reducido combinado con una ventana de contexto extremadamente amplia y soporte multilingüe (hasta 201 lenguas según la familia Qwen3.5). Esto lo hace adecuado para pipelines de automatización donde se necesita una capa de verificación rápida y económica, especialmente en flujos de doblaje y procesamiento de audio/texto multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer decoder-only) |
| Parametros totales | 752.393.024 (~0,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 posiciones (config) |
| Tipos de cuantizacion | BF16 (MLX safetensors); Q8_0 (GGUF) |
| Idiomas soportados | 201 lenguas y dialectos (segun Qwen3.5) |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (model.safetensors); tambien GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estándar, con 24 capas y un tamaño oculto de 1024. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso compacto. La configuración indica que pertenece a la familia Qwen3.5, que amplía el soporte de idiomas hasta 201 lenguas y dialectos. El tokenizer incluye una plantilla de chat (`chat_template.jinja`) que se utiliza para formatear las conversaciones en el runtime `mlx-lm`.

No se han publicado detalles sobre el proceso de entrenamiento: no se especifica el número de tokens utilizados, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La model card lo describe como un "original-trained-model" dentro del framework DHCF-FNO, pero no ofrece información adicional sobre la metodología de entrenamiento. El modelo está diseñado para tareas de inspección y validación con baja temperatura y límites de tokens acotados, lo que sugiere un enfoque orientado a salidas deterministas más que a generación creativa.

## Capacidades

- Generación de texto conversacional: puede mantener diálogos multi-turno gracias a su plantilla de chat y su ventana de contexto de más de un millón de tokens.
- Inspección y validación: especializado en revisar transcripciones, detectar contradicciones y emitir veredictos concisos (como se muestra en el prompt de ejemplo de la model card).
- Control de calidad de agentes: diseñado para evaluar la calidad de respuestas generadas por otros agentes, actuando como capa de revisión en pipelines automatizados.
- Comprobaciones de enrutamiento: puede validar decisiones de ruta en sistemas multi-agente, determinando si una respuesta o acción es correcta antes de su ejecución.
- Soporte multilingüe: cubre 201 lenguas y dialectos, aunque la model card advierte que la calidad no es uniforme en todos los idiomas y debe verificarse mediante las pasarelas ASR, de hablante, emoción y sincronización de NOESIS.
- Inferencia en Apple Silicon: optimizado para ejecutarse con `mlx-lm` en hardware Apple Silicon, con una variante GGUF Q8_0 para entornos llama.cpp.

## Casos de uso

- Inspección de transcripciones en tiempo real: el modelo puede analizar transcripciones de audio o vídeo para detectar contradicciones, errores de sincronización o incoherencias, emitiendo un veredicto breve. Su ventana de 1.048.576 tokens permite procesar documentos largos de una sola pasada, algo poco habitual en modelos de 0,8B.
- Validación de respuestas de agentes conversacionales: integrado como paso posterior a un LLM generador, el Inspector revisa si la respuesta cumple criterios de calidad (coherencia, fidelidad al contexto, ausencia de alucinaciones) antes de enviarla al usuario final. Su bajo coste computacional lo hace viable para validar cada mensaje en producción.
- Control de calidad en pipelines de doblaje multilingüe: dentro de la plataforma NOESIS, este modelo puede verificar que las traducciones y adaptaciones de guiones mantengan la coherencia emocional y temporal, complementando las pasarelas ASR y de sincronización.
- Comprobaciones de enrutamiento en sistemas multi-agente: en una arquitectura donde varios agentes especializados compiten por resolver una tarea, el Inspector puede evaluar la idoneidad de cada propuesta y decidir cuál debe ejecutarse, reduciendo errores de enrutamiento.
- Revisión de subtítulos y metadatos: puede validar la exactitud de subtítulos generados automáticamente, detectando discrepancias entre el audio original y el texto, así como errores de puntuación o formato.
- Auditoría de logs de conversación: con su contexto largo, puede analizar historiales completos de interacciones con clientes para identificar patrones de error, incumplimientos de políticas o degradación de calidad en el servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El artículo de Kaitchup titulado "Qwopus vs. Qwen3.5: Trading Accuracy for Efficiency?" menciona pruebas de eficiencia de tokens, pero no se proporcionan datos concretos en la información recopilada. Por tanto, no es posible evaluar el rendimiento cuantitativo del modelo en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 (peso del safetensors) y alrededor de 0,8 GB en cuantización Q8_0. Al ser un modelo de 0,8B, cabe holgadamente en cualquier Mac con Apple Silicon, incluso en configuraciones de 8 GB de memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4 o posteriores). No se requiere GPU dedicada de NVIDIA; el runtime MLX está diseñado exclusivamente para el Neural Engine y los núcleos GPU de Apple.
- Compatibilidad con hardware de consumo: sí, es un modelo muy ligero que puede ejecutarse en portátiles Mac básicos. La variante GGUF Q8_0 permite además su uso en CPU con llama.cpp en sistemas Windows o Linux, aunque la model card advierte que la ejecución MLX requiere macOS.
- Opciones de despliegue: `mlx-lm` para generación, chat y servidor OpenAI-compatible en Apple Silicon; llama.cpp u Ollama para la versión GGUF en otras plataformas.
- Latencia y throughput: no se han publicado datos específicos. Dado el tamaño del modelo, se espera una latencia muy baja (del orden de decenas de milisegundos por token en Apple Silicon), pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos de la misma categoría. El propio ecosistema NOESIS incluye una variante hermana, el Director-Q8_0, que cumple funciones de enrutamiento y dirección de agentes, pero no es un modelo comparable en cuanto a tarea. No se han encontrado modelos de 0,8B con ventana de contexto de 1M y soporte de 201 idiomas en la información disponible, por lo que no es posible ofrecer una tabla comparativa fiable. Se recomienda consultar la documentación de Qwen3.5 para conocer la familia base, aunque los datos de rendimiento específicos de este derivado no están publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Antes de utilizarlo en producción, es necesario contactar con AMAImedia para aclarar los términos.
- Calidad multilingüe no uniforme: la model card advierte explícitamente que no se garantiza la misma calidad en los 201 idiomas. Para tareas de doblaje profesional, la calidad debe verificarse mediante las pasarelas ASR, de hablante, emoción y sincronización de NOESIS.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o incoherente, especialmente en tareas de validación donde se espera un veredicto determinista. Se recomienda usar temperatura baja (0,2 o inferior) y límites de tokens acotados.
- Contexto muy largo no verificado: aunque la configuración declara 1.048.576 posiciones, no hay evidencia publicada de que el modelo mantenga coherencia efectiva en toda esa ventana. En la práctica, la calidad puede degradarse en segmentos muy largos.
- Dependencia de plataforma: la versión MLX solo funciona en Apple Silicon; los archivos pueden almacenarse en Windows, pero la ejecución requiere macOS. Para otros entornos, debe usarse la variante GGUF Q8_0.
- Sin benchmarks publicados: la ausencia de métricas de rendimiento impide evaluar objetivamente su capacidad frente a alternativas. Cualquier decisión de adopción debe basarse en pruebas propias.
- Modelo especializado, no generalista: está diseñado para inspección y validación, no para generación creativa o razonamiento complejo. Su uso fuera de ese ámbito puede dar resultados pobres.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Inspector-MLX
- Variante GGUF Q8_0: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Inspector-Q8_0
- Variante Director Q8_0: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-0.8B-v3-Director-Q8_0
- Repositorio de Qwen3 (familia base): https://github.com/QwenLM/Qwen3
- Articulo sobre Qwopus vs Qwen3.5: https://kaitchup.substack.com/p/qwopus-vs-qwen35-trading-accuracy
