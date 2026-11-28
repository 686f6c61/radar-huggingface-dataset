# RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B-GGUF

## Resumen

RPBizkit-Gemma4-v1-26B-A4B-GGUF es una conversión al formato GGUF de un modelo derivado de la familia Gemma, publicado por el usuario RicardoEstep en Hugging Face. El modelo subyacente, RPBizkit-Gemma4-v1-26B-A4B, es un merge realizado con la herramienta ht-mergekit (mergekit), es decir, una combinación de pesos de otros modelos en lugar de un entrenamiento desde cero. La denominación "26B-A4B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones activos por token, aunque esta información no está confirmada en la documentación disponible.

El dato verificable es el recuento de parámetros en safetensors: 25.233.142.046 parámetros totales, lo que confirma el orden de magnitud de 25 mil millones. El repositorio GGUF ocupa 214,1 GB y se distribuye bajo la librería transformers con etiquetas que indican compatibilidad con llama.cpp y una advertencia de contenido "not-for-all-audiences", lo que apunta a un ajuste orientado a conversación sin filtros de seguridad.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo comunitario, sin model card técnica detallada, sin benchmarks publicados y sin licencia declarada. Resulta útil para quien quiera experimentar con merges de Gemma en formato GGUF sobre llama.cpp o KoboldCpp, pero no es una opción recomendable para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE derivada de Gemma (según denominación del autor; no confirmada en documentación) |
| Parametros totales | 25.233.142.046 (safetensors) |
| Parametros activos | Aproximadamente 4B según la nomenclatura "A4B" (no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el autor advierte sensibilidad a la cuantización; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un merge de pesos generado con ht-mergekit, una variante de mergekit orientada a fusionar modelos. No se trata, por tanto, de un modelo entrenado de forma convencional: no hay información sobre el dataset de entrenamiento, el número de tokens procesados ni si hubo fases de RLHF o DPO. La model card del repositorio GGUF es mínima y solo documenta la conversión a GGUF realizada con llama.cpp en un equipo local.

La designación "Gemma4" y el sufijo "A4B" indican que el autor parte de la familia Gemma y aplica una estructura de mezcla de expertos con activación dispersa. El recuento de 25,2 mil millones de parámetros totales es consistente con esa nomenclatura, pero no hay documentación pública que detalle el número de expertos, la estrategia de enrutamiento, la composición del merge ni las innovaciones técnicas (atención, decodificación especulativa, etc.). Cualquier afirmación adicional sobre la arquitectura sería especulativa.

## Capacidades

- Generación de texto conversacional: las etiquetas del repositorio incluyen "conversational", lo que indica un ajuste orientado a diálogo multi-turno.
- Compatibilidad con llama.cpp y KoboldCpp: el autor menciona explícitamente ambos entornos de inferencia.
- Integración con transformers: la librería declarada es transformers, aunque el artefacto principal es GGUF.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que el modelo puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Capacidades adicionales (código, matemáticas, tool calling, agentes, visión, audio, modo thinking): no disponibles en la información proporcionada.

## Casos de uso

- Experimentación con merges de Gemma: el modelo permite evaluar cómo se comporta una fusión de pesos de la familia Gemma en formato GGUF, útil para investigadores que estudian técnicas de model merging sin necesidad de infraestructura de entrenamiento.
- Inferencia local en llama.cpp: al estar en GGUF, puede ejecutarse en estaciones de trabajo con GPU de consumo, lo que facilita pruebas de conversación offline sin dependencia de servicios en la nube.
- Roleplay y generación creativa sin filtros: la etiqueta "not-for-all-audiences" indica que el ajuste está pensado para contenido sin restricciones de seguridad, un nicho habitual en la comunidad de modelos locales.
- Prototipado de chatbots conversacionales: su naturaleza conversacional permite construir demos rápidas de asistentes multi-turno antes de comprometerse con un modelo comercial.
- Evaluación comparativa de cuantizaciones: dado que el autor advierte sobre la sensibilidad a la cuantización, el modelo sirve para medir la degradación de calidad entre distintos niveles GGUF en arquitecturas MoE.
- Investigación sobre robustez de merges: permite analizar si la fusión de pesos introduce artefactos (repeticiones, degradación de coherencia) en comparación con los modelos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 25,2 mil millones de parámetros, una cuantización Q4_K_M requeriría aproximadamente 15-16 GB de VRAM; Q8_0 rondaría los 27 GB; FP16 superaría los 50 GB. Estas cifras son estimaciones basadas en el recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas: para cuantizaciones agresivas, una RTX 4090 (24 GB) o RTX 3090 (24 GB) pueden alojar Q4 y Q5; para Q8 se necesitan A100 40 GB, H100 o configuraciones multi-GPU.
- GPU de consumo: sí es viable en RTX 4090, 3090, 4080 (16 GB, solo cuantizaciones muy agresivas) y en configuraciones con offloading a RAM del sistema.
- Opciones de despliegue: llama.cpp, KoboldCpp (mencionados por el autor), y potencialmente servidores compatibles con GGUF como llama-cpp-python u Ollama, aunque no están confirmados explícitamente.
- Latencia y throughput: no disponibles. Al ser una arquitectura MoE con activación dispersa, el throughput debería ser superior al de un modelo denso de 25B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RPBizkit-Gemma4-v1-26B-A4B-GGUF | 25,2B totales (aprox. 4B activos) | no disponible | no disponible | GGUF | Merge comunitario, sin benchmarks |
| Gemma 2 27B (Google) | 27B densos | 8K | Gemma Terms | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Mixtral 8x7B (Mistral AI) | 46,7B totales (12,9B activos) | 32K | Apache 2.0 | safetensors, GGUF | MoE de referencia con evaluación extensa |
| Qwen2.5 32B (Alibaba) | 32,5B densos | 128K | Apache 2.0 | safetensors, GGUF | Alternativa densa con contexto largo |

La comparación directa es difícil porque el modelo de RicardoEstep carece de documentación técnica y benchmarks. Frente a los modelos oficiales, la principal desventaja es la ausencia de garantías de calidad y de licencia clara; la ventaja es el enfoque sin filtros y la disponibilidad inmediata en GGUF.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifican términos de uso comercial, lo que impide su adopción en producción sin aclaración legal previa.
- Sin model card técnica: no hay información sobre datos de entrenamiento, contexto, idiomas ni proceso de merge, lo que dificulta evaluar sesgos y comportamiento.
- Riesgo de alucinación: al ser un merge conversacional sin evaluación publicada, la fiabilidad factual no está verificada.
- Sensibilidad a la cuantización: el propio autor advierte que los modelos "Gemma 4 MoE" se degradan con la cuantización, por lo que las versiones GGUF pueden perder coherencia respecto al modelo original.
- Contenido sin filtros: la etiqueta "not-for-all-audiences" indica que el modelo puede generar contenido inapropiado; no es apto para aplicaciones orientadas al público general sin moderación adicional.
- Idiomas y contexto desconocidos: no se puede confirmar el soporte multilingüe ni la ventana de contexto real.
- Repositorio de gran tamaño: 214,1 GB en total, lo que implica costes de almacenamiento y descarga considerables.
- Procedencia comunitaria: al ser un merge de un usuario individual, no hay garantías de mantenimiento, soporte ni corrección de errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/RicardoEstep/RPBizkit-Gemma4-v1-26B-A4B
- Herramienta de merge (mergekit): https://github.com/arcee-ai/mergekit
- llama.cpp: https://github.com/ggerganov/llama.cpp
- KoboldCpp: https://github.com/LostRuins/koboldcpp
