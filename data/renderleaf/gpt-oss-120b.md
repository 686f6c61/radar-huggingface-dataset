# Renderleaf/gpt-oss-120b

## Resumen

gpt-oss-120b es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) publicado por OpenAI bajo licencia Apache 2.0, disenado para razonamiento de alta intensidad, tareas agenticas y uso general en produccion. Con 116.829.156.672 parametros totales y aproximadamente 5.100 millones de parametros activos por token, el modelo cabe en una unica GPU de 80 GB (NVIDIA H100 o AMD MI300X) gracias a la cuantizacion MXFP4 aplicada a los pesos del MoE durante el post-entrenamiento.

El modelo forma parte de la familia gpt-oss junto con la variante menor gpt-oss-20b (21B totales, 3.6B activos). Ambos fueron entrenados sobre el formato de respuesta "harmony" de OpenAI y requieren ese formato para funcionar correctamente. El repositorio analizado es un espejo publicado por el usuario Renderleaf bajo el identificador Renderleaf/gpt-oss-120b, con 0 descargas y 0 likes en el momento de la consulta, y un tamano de repositorio de 195,8 GB.

La relevancia de este modelo radica en que OpenAI libera pesos abiertos con licencia permisiva, razonamiento configurable (low, medium, high), acceso completo a la cadena de pensamiento y capacidades nativas de function calling y ejecucion de codigo, lo que lo convierte en una opcion atractiva para despliegues comerciales sin restricciones de copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) |
| Parametros totales | 116.829.156.672 (117B) |
| Parametros activos | ~5.1B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (pesos del MoE, aplicada en post-entrenamiento); 8-bit segun tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

gpt-oss-120b es un transformer con arquitectura Mixture-of-Experts: de los 117B parametros totales, solo unos 5.1B se activan por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo mucho mayor. Los pesos del MoE fueron cuantizados en MXFP4 durante el post-entrenamiento, decision que permite ejecutar el modelo completo en una sola GPU de 80 GB y que se aplico tambien a todas las evaluaciones publicadas, de modo que los resultados reportados corresponden a la version cuantizada.

El modelo fue entrenado sobre el formato de respuesta harmony, un formato estructurado que gestiona roles, canales de razonamiento y llamadas a herramientas; segun el autor, usar otro formato produce un funcionamiento incorrecto. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Si se documenta la existencia de razonamiento configurable (low, medium, high) y acceso completo a la cadena de pensamiento.

## Capacidades

- Generacion de texto y razonamiento de alta intensidad, con esfuerzo de razonamiento configurable en tres niveles (low, medium, high).
- Cadena de pensamiento completa accesible para depuracion y auditoria (no pensada para mostrarse al usuario final).
- Function calling nativo y soporte de agentes.
- Navegacion web integrada mediante las herramientas del repositorio oficial.
- Ejecucion de codigo Python.
- Structured Outputs (salidas estructuradas).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Ajuste fino (fine-tuning) permitido por licencia y diseno.

## Casos de uso

- Razonamiento en produccion de alta exigencia: el modelo puede resolver problemas de varios pasos con el nivel de esfuerzo "high", adecuado para analisis tecnico, planificacion y tareas de sintesis complejas.
- Agentes autonomos con herramientas: gracias al function calling nativo y a la navegacion web, puede construir flujos de agente que consulten APIs, recuperen informacion y ejecuten acciones encadenadas.
- Ejecucion de codigo Python en pipelines de analisis: el modelo puede generar y ejecutar codigo para calculo, transformacion de datos o validacion, integrandose en entornos controlados.
- Asistentes de desarrollo integrados en CI/CD: con salidas estructuradas y tool calling, se puede incorporar a revisiones automatizadas, generacion de parches y comprobaciones de calidad.
- Despliegue on-premise en una sola GPU: al caber en 80 GB con MXFP4, encaja en infraestructuras con H100 o MI300X sin necesidad de clústeres multi-GPU, lo que facilita entornos con requisitos de soberania de datos.
- Fine-tuning para dominios verticales: la licencia Apache 2.0 y la disponibilidad de pesos permiten especializar el modelo en sectores regulados (legal, sanitario, financiero) sin riesgo de copyleft.
- Depuracion y auditoria de razonamiento: el acceso a la cadena de pensamiento permite analizar por que el modelo llega a una conclusion, util en entornos de investigacion y validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en MXFP4 cabe en una GPU de 80 GB (H100 o MI300X), segun el autor.
- GPU recomendadas: NVIDIA H100 de 80 GB, AMD MI300X; el modelo esta disenado para una sola GPU de 80 GB.
- GPU de consumo: no se indica compatibilidad directa con GPUs consumer para la variante de 120B; la variante gpt-oss-20b esta pensada para ejecutarse en 16 GB de memoria.
- Opciones de despliegue: Transformers (pipeline y `transformers serve`), vLLM (build especifico `vllm==0.10.1+gptoss`), Ollama (`gpt-oss:120b`), LM Studio (`lms get openai/gpt-oss-120b`), y las implementaciones de referencia en PyTorch/Triton del repositorio oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-120b | 117B | ~5.1B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| gpt-oss-20b | 21B | 3.6B | no disponible | Apache 2.0 | Pesos abiertos en HF |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente a la variante menor de la misma familia, gpt-oss-20b, orientada a baja latencia y uso local o especializado. No se dispone de informacion sobre otros modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- Requiere el formato harmony: el autor advierte explicitamente de que el modelo no funciona correctamente con otros formatos de prompt.
- La cadena de pensamiento no debe mostrarse al usuario final, segun la model card.
- No se especifican sesgos conocidos, riesgos de alucinacion concretos ni limitaciones de idioma en la informacion disponible.
- La longitud de contexto no esta documentada en la informacion proporcionada, lo que impide planificar cargas con ventanas largas.
- El repositorio analizado (Renderleaf/gpt-oss-120b) es un espejo sin descargas ni likes; conviene contrastar con el repositorio oficial de OpenAI antes de usarlo en produccion.
- Licencia Apache 2.0: permite uso comercial sin copyleft, pero deben revisarse las condiciones de uso aceptable de OpenAI para el modelo.
- La cuantizacion MXFP4 es la unica evaluada oficialmente; otros esquemas de cuantizacion pueden alterar el rendimiento.

## Enlaces

- Repositorio analizado: https://huggingface.co/Renderleaf/gpt-oss-120b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-120b
- Coleccion gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Variante menor: https://huggingface.co/openai/gpt-oss-20b
- Sitio del modelo: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
