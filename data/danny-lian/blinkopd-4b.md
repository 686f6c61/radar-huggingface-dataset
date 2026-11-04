# Danny-Lian/BlinkOPD-4B

## Resumen

BlinkOPD-4B es un checkpoint de visión-lenguaje publicado por Danny-Lian, obtenido mediante ajuste fino del modelo base Qwen/Qwen3.5-4B con una técnica de destilación en política (on-policy distillation) denominada BlinkOPD. El modelo resuelve tareas de percepción visual de alta resolución: recibe pares imagen-texto y genera respuestas en lenguaje natural, con especial énfasis en benchmarks de percepción fina como V*Bench, ZoomBench, HR-Bench 4K/8K y MME-RealWorld. Se distribuye como un checkpoint fusionado y autónomo que incluye la plantilla de chat de percepción empleada en la evaluación.

El interés del modelo reside en su enfoque de entrenamiento con un conjunto muy reducido de datos: 1.000 imágenes únicas repetidas hasta formar 3.000 filas de entrenamiento, con guardado en el paso de optimización 38. El autor reporta una media de aproximadamente 79,1 en seis benchmarks bajo un protocolo de evaluación corregido que evita el atajo de la letra de primera opción. Es relevante como ejemplo de destilación eficiente en datos para modelos de 4B parámetros, aunque su validación se limita estrictamente a los seis benchmarks declarados.

El checkpoint tiene 5.174.964.736 parámetros reales según los pesos safetensors (por encima de los 4B nominales del nombre), un repositorio de 10,4 GB y licencia Apache-2.0. La información pública no detalla la longitud de contexto, los idiomas soportados ni la composición completa del dataset de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 5.174.964.736 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 que se carga mediante `Qwen3_5ForConditionalGeneration` y un `AutoProcessor` que gestiona la entrada imagen-texto. El checkpoint es una fusión autónoma que incorpora la plantilla de chat de percepción usada durante la evaluación, de modo que el formato de conversación queda empaquetado con los pesos. El entorno de entrenamiento declarado utilizó Transformers 5.5.0, lo que condiciona la versión mínima recomendada para la carga.

El entrenamiento emplea destilación en política (on-policy distillation) con el conjunto Danny-Lian/Vision-OPD-6K-Decontaminated: 1.000 imágenes únicas repetidas para formar 3.000 filas, con el checkpoint guardado en el paso de optimización 38. El autor aclara explícitamente que este checkpoint de 4B usa 1.000 imágenes y no es un checkpoint K500; el código de entrenamiento liberado emplea K500 (500 imágenes únicas), pero los pesos K500 de 4B no se distribuyen. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) con foco en percepción visual fina.
- Razonamiento visual sobre detalles pequeños y regiones ampliadas, orientado a benchmarks como ZoomBench y HR-Bench 4K/8K.
- Interpretación de imágenes de alta resolución, incluyendo escenarios de 4K y 8K según el protocolo de evaluación declarado.
- Respuesta a preguntas visuales de opción múltiple y formato conversacional mediante la plantilla de chat incluida.
- Evaluación en inglés y chino a través de MME-RealWorld EN/CN, aunque no se documenta formalmente el conjunto de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión de vídeo o audio: no disponible en la información proporcionada.

## Casos de uso

- Inspección de documentos y capturas de alta resolución: el modelo puede procesar imágenes de 4K/8K y responder preguntas sobre detalles concretos, gracias a su entrenamiento específico en HR-Bench 4K/8K y ZoomBench.
- Verificación de detalles en imágenes satelitales o aéreas: el énfasis en percepción fina y zoom lo hace adecuado para tareas donde el objeto de interés ocupa una fracción pequeña de la imagen.
- Asistencia en control de calidad visual: comparación de imágenes de producto con preguntas dirigidas sobre defectos o discrepancias, usando el formato conversacional incluido en la plantilla de chat.
- Análisis de interfaces de usuario y capturas de pantalla: respuesta a preguntas sobre elementos de una UI en resoluciones altas, un escenario alineado con V*Bench y MME-RealWorld.
- Evaluación comparativa de modelos de percepción: el checkpoint sirve como referencia reproducible dentro del protocolo de seis benchmarks del autor, con evaluador que reintenta salidas malformadas y registra las no resueltas.
- Investigación en destilación eficiente en datos: al estar liberado junto al código de entrenamiento y el dataset de destilación, permite estudiar el efecto de K=1000 imágenes frente a la configuración K500.
- Prototipado de asistentes visuales en local: con 5,17B parámetros y pesos bfloat16, puede desplegarse en una GPU única de gama alta para pruebas de concepto, siempre que se valide fuera de los benchmarks declarados.

## Benchmarks y rendimiento

El autor reporta una media de aproximadamente 79,1 en seis benchmarks (V*Bench, ZoomBench, HR-Bench 4K/8K y MME-RealWorld EN/CN) bajo el protocolo corregido. No se proporcionan puntuaciones desglosadas por benchmark ni comparaciones numéricas con otros modelos en la información disponible.

| Benchmark | Resultado |
|---|---|
| Media de seis benchmarks (protocolo corregido) | ~79,1 |
| V*Bench | no disponible (solo incluido en la media) |
| ZoomBench | no disponible (solo incluido en la media) |
| HR-Bench 4K | no disponible (solo incluido en la media) |
| HR-Bench 8K | no disponible (solo incluido en la media) |
| MME-RealWorld EN | no disponible (solo incluido en la media) |
| MME-RealWorld CN | no disponible (solo incluido en la media) |

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 10,4 GB solo para pesos (5,17B parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para inferencia cómoda con imágenes de alta resolución.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; GPUs con 16 GB requerirían cuantización, no documentada por el autor.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) en bfloat16; en tarjetas de 16 GB la viabilidad no está confirmada por falta de instrucciones de cuantización.
- Opciones de despliegue: Transformers con soporte de Qwen3.5 (el autor usó la versión 5.5.0) mediante `Qwen3_5ForConditionalGeneration` y `AutoProcessor`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BlinkOPD-4B | 5,17B | no disponible | Apache-2.0 | Destilación on-policy con 1.000 imágenes; media ~79,1 en seis benchmarks de percepción |
| Qwen/Qwen3.5-4B (base) | ~4B nominales | no disponible | Apache-2.0 (heredada) | Modelo base del que deriva BlinkOPD-4B; sin datos de benchmarks en esta información |
| Alternativas de visión-lenguaje de tamaño similar | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de comparaciones numéricas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks reportados se limitan a seis tareas de percepción; el propio autor advierte que las puntuaciones no establecen fiabilidad fuera de los entornos evaluados.
- El entrenamiento usó solo 1.000 imágenes únicas, lo que aumenta el riesgo de sobreajuste al dominio y de generalización limitada.
- El protocolo de evaluación original presentaba un atajo (aceptar la letra de la primera opción aunque la elección final parseada contradijera la verdad de referencia); la media de 79,1 corresponde al protocolo corregido, no al oficial.
- No se documentan sesgos conocidos, comportamiento multilingüe ni cobertura de idiomas; MME-RealWorld EN/CN es el único indicio de soporte de inglés y chino.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se han publicado evaluaciones específicas de fidelidad factual.
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda las limitaciones del base Qwen/Qwen3.5-4B.
- Requiere una versión de Transformers compatible con Qwen3.5 (el autor usó 5.5.0); versiones anteriores pueden no cargar la arquitectura.
- El checkpoint liberado no es K500: los pesos K500 de 4B mencionados en el código de entrenamiento no se distribuyen, lo que impide reproducir exactamente esa configuración con estos pesos.
- No hay información sobre cuantizaciones oficiales, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Danny-Lian/BlinkOPD-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de destilación: https://huggingface.co/datasets/Danny-Lian/Vision-OPD-6K-Decontaminated
- Código de entrenamiento y evaluación (BlinkOPD): no disponible como enlace directo en la información proporcionada
- Paper: no disponible
- Blog o demo: no disponible
