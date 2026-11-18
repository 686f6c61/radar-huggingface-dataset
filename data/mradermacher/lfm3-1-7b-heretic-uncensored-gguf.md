# mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF

## Resumen

LFM3-1.7B-Heretic-Uncensored-GGUF es una cuantizacion estatica en formato GGUF del modelo Peymandc/LFM3-1.7B-Heretic-Uncensored, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base parte de la familia LFM3 (Liquid Foundation Model 3) de 1.700 millones de parametros, sobre el que se ha aplicado un proceso de "abliteration" o ajuste orientado a eliminar restricciones de rechazo conversacional, de ahi la etiqueta "Heretic-Uncensored".

El repositorio contiene unicamente pesos cuantizados en diversos niveles de precision (desde Q2_K hasta Q8_0, ademas de F16 e IQ4_XS), con un tamano total de 15,9 GB repartido entre todas las variantes. El modelo esta pensado para inferencia local en conversacion, con la etiqueta `endpoints_compatible` que sugiere compatibilidad con la API de endpoints de Hugging Face y con servidores tipo llama.cpp.

La relevancia de esta ficha es limitada por la escasez de documentacion: no se dispone de model card tecnica del autor, ni de datos de entrenamiento, benchmarks o licencia explicita. Se trata, por tanto, de una distribucion de pesos derivada, no de un modelo original, y debe evaluarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia LFM3; arquitectura concreta no documentada en la informacion proporcionada) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como origen de la conversion) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base LFM3-1.7B en la documentacion proporcionada. Por el nombre de la familia (Liquid Foundation Model 3) cabe esperar la arquitectura propietaria de Liquid AI, pero no se confirma en la model card ni en los metadatos del repositorio. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similar.

El proceso documentado en el repositorio es exclusivamente de cuantizacion: los metadatos indican `quantize_version: 2`, `convert_type: hf` y una lista de cuantizaciones estaticas generadas a partir de Peymandc/LFM3-1.7B-Heretic-Uncensored. El termino "Heretic" hace referencia a una tecnica de abliteration que modifica los pesos para reducir la probabilidad de respuestas de rechazo, un procedimiento que suele implicar el ajuste de direcciones de activacion asociadas a comportamientos de negativa. No se documenta el metodo exacto aplicado por el autor del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento y respuesta abierta heredados del modelo base LFM3-1.7B, sin datos publicados sobre su calidad.
- Comportamiento "uncensored": se espera una menor tasa de rechazos ante peticiones que el modelo original declinaria, aunque no hay evaluaciones que lo cuantifiquen.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Experimentacion local con modelos conversacionales: el modelo cabe en equipos de consumo gracias a sus 1.700 millones de parametros y a las cuantizaciones Q4_K_M o Q5_K_M, lo que permite probar tecnicas de abliteration sin infraestructura dedicada.
- Investigacion sobre alineacion y rechazo: util para estudiar como varian las tasas de negativa y los sesgos al comparar el modelo "Heretic" con el LFM3-1.7B original, siempre que se disponga de una evaluacion controlada.
- Prototipado rapido de chatbots en local: con llama.cpp u Ollama se puede levantar un servidor de inferencia en minutos para validar flujos conversacionales antes de migrar a un modelo mayor.
- Generacion de texto creativo sin filtros editoriales: el ajuste uncensored puede interesar en escritura de ficcion con tematicas sensibles, con la advertencia de que el contenido generado no esta moderado.
- Despliegue en entornos con recursos limitados: las variantes Q2_K y Q3_K_S permiten ejecucion en CPU o GPU con poca VRAM, adecuadas para pruebas de concepto y demos.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece hasta doce niveles de cuantizacion del mismo modelo, lo que facilita medir el impacto de la precision en la calidad de salida para un caso de uso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, calculada a partir del numero de parametros y el tamano de cada cuantizacion):
  - Q2_K: en torno a 0,7-0,9 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: en torno a 0,9-1,2 GB.
  - Q4_K_S / Q4_K_M / IQ4_XS: en torno a 1,1-1,4 GB.
  - Q5_K_S / Q5_K_M: en torno a 1,3-1,6 GB.
  - Q6_K: en torno a 1,6-1,9 GB.
  - Q8_0: en torno a 2,0-2,4 GB.
  - F16: en torno a 3,5-4,0 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q5; una RTX 3060 de 12 GB, RTX 4070 o superior permite cargar F16 con contexto amplio. Para despliegues en servidor, una A100 o H100 no aporta ventaja significativa con este tamano de modelo.
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas modernas, e incluso en iGPU con memoria unificada para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de llama.cpp; vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Heretic-Uncensored-GGUF (este) | 1,73 B | no disponible | no disponible | GGUF | Cuantizacion estatica de un modelo ablitterado |
| LFM3-1.7B (modelo base) | 1,73 B | no disponible | no disponible | safetensors/GGUF | Modelo original sin abliteration |
| Peymandc/LFM3-1.7B-Heretic-Uncensored | 1,73 B | no disponible | no disponible | safetensors | Modelo base del que deriva esta cuantizacion |
| Otros modelos de ~1,5-2 B (p. ej. Qwen2.5-1.5B, Llama-3.2-1B) | 1-2 B | 32k-128k | Apache 2.0 / Llama | safetensors/GGUF | Alternativas con licencia y benchmarks publicos; no comparables directamente por falta de datos del modelo evaluado |

No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, composicion del dataset ni proceso de alineacion, lo que impide evaluar sesgos de origen.
- El ajuste "uncensored" elimina o reduce los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o sexualmente explicito sin salvaguardas.
- Riesgo de alucinacion elevado por el reducido tamano del modelo (1,7 B) y por la falta de evaluaciones publicadas.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Idiomas y longitud de contexto no documentados: no se puede garantizar un comportamiento correcto fuera del ingles ni con contextos largos.
- Modelo derivado de terceros: la cadena de responsabilidad (Liquid AI -> Peymandc -> mradermacher) no esta claramente documentada y podria incluir restricciones adicionales no reflejadas en el repositorio.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la coherencia en modelos de este tamano; se recomienda Q4_K_M o superior para uso real.
- Fecha de creacion del repositorio (2026-11-17) y ausencia de descargas o likes: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Heretic-Uncensored-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/Peymandc/LFM3-1.7B-Heretic-Uncensored
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Liquid AI (familia LFM): https://www.liquid.ai/
