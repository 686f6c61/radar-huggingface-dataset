# mradermacher/Qwen3.5-9B-Guard-GGUF

## Resumen

`mradermacher/Qwen3.5-9B-Guard-GGUF` es una conversión a formato GGUF de los pesos del modelo `Rumiii/Qwen3.5-9B-Guard`, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estáticas de modelos para su uso con llama.cpp y herramientas derivadas. El repositorio contiene únicamente los ficheros cuantizados, no el modelo original ni documentación técnica propia más allá de la lista de cuantizaciones generadas.

A pesar de la denominación "9B" en el nombre, el recuento de parámetros real reportado en los metadatos del repositorio es de 456.010.480 parámetros (aproximadamente 0,46 mil millones), lo que supone una discrepancia sustancial entre el nombre del modelo y el tamaño efectivo de los pesos. Esta inconsistencia debe tenerse en cuenta antes de cualquier evaluación o despliegue.

La relevancia de esta ficha es limitada: se trata de un artefacto de conversión de formato, sin model card técnica detallada, sin benchmarks publicados y sin información sobre licencia, idiomas o arquitectura más allá de las etiquetas de cuantización. El repositorio ocupa 1,5 GB y contiene las variantes `x-f16`, `Q2_K`, `Q3_K_S`, `Q3_K_M`, `Q3_K_L`, `Q4_K_S`, `Q4_K_M`, `Q5_K_S`, `Q5_K_M`, `Q6_K`, `Q8_0` e `IQ4_XS`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, derivada de la familia Qwen, sin confirmar) |
| Parametros totales | 456.010.480 (según metadatos safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas con herramienta de conversión, `quantize_version: 2`, `convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo original `Rumiii/Qwen3.5-9B-Guard`. El nombre sugiere una base de la familia Qwen (posiblemente una variante orientada a moderación o "guard"), pero no hay datos publicados en la información proporcionada sobre número de capas, dimensión oculta, mecanismo de atención, tipo de normalización ni estrategia de posición.

Tampoco se documenta el proceso de entrenamiento: no hay referencias a número de tokens, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF, DPO ni técnicas de alineación. La model card del repositorio GGUF se limita a metadatos de cuantización (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y a la referencia al modelo origen. No se describe ninguna innovación técnica (atención lineal, decodificación especulativa, modo thinking, etc.).

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma capacidad de visión, audio ni modo de razonamiento extendido.
- El nombre "Guard" sugiere un posible uso como modelo de moderación o clasificación de seguridad, pero esta función no está verificada en la documentación disponible.

## Casos de uso

- Evaluación local en entornos con recursos limitados: al tratarse de un modelo de aproximadamente 0,46 mil millones de parámetros, las cuantizaciones `Q4_K_M` o `Q5_K_M` permiten ejecución en CPU o GPU de gama baja mediante llama.cpp, útil para pruebas de integración de pipelines de inferencia.
- Prototipado de filtros de contenido: si el modelo cumple la función implícita en su nombre ("Guard"), podría emplearse como clasificador auxiliar de seguridad en aplicaciones de chat, aunque requiere validación previa contra un conjunto de evaluación propio.
- Despliegue en dispositivos edge: el tamaño reducido de los pesos cuantizados (el repo completo ocupa 1,5 GB, y las variantes Q4 rondarían unos cientos de MB) permite su inclusión en aplicaciones de escritorio o embebidas con llama.cpp.
- Pruebas de compatibilidad de herramientas: sirve para validar el funcionamiento de runners GGUF (llama.cpp, Ollama, LM Studio) antes de migrar a modelos mayores de la misma familia.
- Investigación sobre cuantización: permite comparar la degradación de calidad entre `Q2_K`, `Q4_K_M` y `Q8_0` sobre un mismo modelo base, si se dispone del modelo original en precisión completa.
- Integración en pipelines de moderación previa: como paso de filtrado rápido antes de un modelo generativo mayor, siempre que se valide su comportamiento en el dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 456 millones de parámetros, las cuantizaciones Q4 (~250-300 MB), Q5 (~350 MB) y Q8 (~500 MB) caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); también es viable en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. No se confirma compatibilidad con vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponibles. Dado el tamaño reducido, se espera throughput alto en hardware consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia o categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("9B") y el recuento real de parámetros (456 millones): no debe asumirse que el modelo tiene la capacidad de un modelo de 9 mil millones de parámetros.
- Ausencia total de model card técnica: sin información sobre arquitectura, entrenamiento, datos, licencia o idiomas.
- Licencia no especificada: no se puede garantizar el uso comercial. Es imprescindible contactar con el autor del modelo original (`Rumiii`) antes de cualquier despliegue en producción.
- Riesgo elevado de alucinación y comportamiento impredecible al no existir documentación sobre alineación o evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El modelo original podría estar sujeto a restricciones adicionales no reflejadas en el repo GGUF.
- No se garantiza la integridad de las cuantizaciones sin verificación manual de los ficheros.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Guard-GGUF
- Modelo original: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
