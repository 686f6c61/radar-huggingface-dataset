# mlx-community/LFM2.5-24B-A2B-Preview-mxfp8

## Resumen

LFM2.5-24B-A2B-Preview-mxfp8 es una conversión a cuantización MXFP8 del modelo LFM2.5-24B-A2B-Preview de Liquid AI, publicada por la organización mlx-community para su uso con el framework MLX en Apple Silicon. El modelo original es un transformer de arquitectura Mixture-of-Experts (MoE) con 23.971.587.712 parámetros totales y solo 2B parámetros activos por token, lo que lo sitúa como la variante más grande y la culminación de la familia LFM2.5, que abarca desde LFM2.5-230M hasta este modelo.

El modelo está diseñado específicamente para agentes sobre dispositivo (on-device): piensa antes de responder, invoca herramientas y resuelve tareas de varios pasos dentro de entornos de agente habituales. Su ventana de contexto de 131.072 tokens y su naturaleza MoE lo hacen adecuado para flujos conversacionales largos y pipelines de razonamiento con uso intensivo de contexto. La licencia es la LFM Open License v1.0 del autor original.

Esta conversión concreta aplica cuantización de pesos MXFP8 (8 bits, tamaño de grupo 32) sobre el checkpoint base fijado en la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034`, generando ficheros de pesos que ocupan 24,72 GB en total. Es relevante para desarrolladores que quieren ejecutar un modelo de 24B en hardware Apple sin recurrir a GPU dedicada, aunque las comprobaciones realizadas por el autor de la conversión son únicamente smoke tests, no una evaluación exhaustiva de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; tipo de modelo `lfm2_moe` |
| Parametros totales | 23.971.587.712 |
| Parametros activos | 2B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MXFP8 peso-only de 8 bits, grupo de 32; proyecciones del router en cuantización afín de 8 bits con grupo de 64; pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | safetensors (formato MLX, cuantizado mxfp8) |

## Arquitectura y entrenamiento

Se trata de un modelo Mixture-of-Experts (MoE) dentro de la familia LFM2.5 de Liquid AI, con 24B parámetros totales y 2B activos por token. La model card del export no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible en el material proporcionado. Lo que sí se documenta es que el modelo genera razonamiento antes de emitir su respuesta final, por lo que conviene reservar suficientes tokens de salida en la generación.

La innovación técnica relevante aquí es la conversión en sí: cuantización MXFP8 peso-only de 8 bits con tamaño de grupo 32, aplicada a las proyecciones del router con cuantización afín de 8 bits (grupo 64), mientras que los pesos sin cuantizar permanecen en BF16 y los sesgos de enrutamiento de expertos se mantienen en FP32. La conversión se realizó con la CLI de MLX-VLM sobre un Apple M3 Ultra y se recargó con coincidencia estricta de pesos; tanto el prefill como el decode con caché produjeron logits finitos y dos comprobaciones de generación greedy cortas devolvieron las respuestas correctas y alcanzaron EOS.

## Capacidades

- Generación de texto y razonamiento: el modelo produce una cadena de razonamiento antes de la respuesta final.
- Razonamiento multi-paso: diseñado para trabajar a través de tareas de varios pasos dentro de entornos de agente.
- Tool calling / function calling: soporta la invocación de herramientas como parte de su flujo de agente.
- Soporte para agentes: orientado a ejecutarse dentro de los entornos de agente más habituales.
- Capacidades multilingües: diez idiomas declarados (inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano).
- Contexto largo: ventana de 131.072 tokens, adecuada para conversaciones extensas y documentos largos.
- Ejecución on-device: el objetivo de diseño es la inferencia privada y rápida en el propio dispositivo.
- Visión: el tag `mlx-vlm` aparece en el repositorio, pero la model card del export indica explícitamente que es un modelo de generación de texto; la información disponible no confirma capacidades de visión.

## Casos de uso

- Agentes privados en local: al ejecutarse vía MLX en Apple Silicon, permite construir agentes que procesan datos sensibles sin enviarlos a un servicio en la nube, con el razonamiento y el tool calling integrados en el propio modelo.
- Asistentes conversacionales de contexto largo: con 131.072 tokens de ventana puede mantener hilos multi-turno extensos o trabajar sobre documentos largos sin truncar el contexto, algo útil en atención al cliente o soporte técnico.
- Automatización de tareas multi-paso: su capacidad declarada para resolver tareas de varios pasos lo hace adecuado para orquestar flujos que requieren planificar, llamar herramientas y verificar resultados intermedios.
- Generación y asistencia de código asistida por herramientas: el soporte de function calling permite integrarlo en pipelines que compilan, ejecutan pruebas o consultan repositorios como pasos de un agente de desarrollo.
- Análisis de documentación multilingüe: cubriendo diez idiomas, sirve para resumir, extraer y responder preguntas sobre documentación técnica en varios idiomas sin cambiar de modelo.
- Prototipado y evaluación de modelos MoE en Apple Silicon: su formato MLX y su naturaleza MoE de 2B activos lo convierten en un banco de pruebas para medir latencia y consumo de memoria de arquitecturas dispersas en hardware de Apple.
- Procesamiento de datos en el borde: en escenarios donde no se permite salida de datos (sanidad, legal, defensa), el modelo puede desplegarse localmente para clasificación, resumen o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export solo documenta comprobaciones de tipo smoke test (logits finitos en prefill y decode con caché, y dos generaciones greedy cortas que devolvieron "Paris" y "391" y alcanzaron EOS), y advierte explícitamente de que no constituyen una evaluación de calidad exhaustiva ni un benchmark de contexto largo.

## Requisitos de hardware

- VRAM / memoria unificada: los ficheros de pesos suman 24,72 GB (decimal) en MXFP8. La memoria en tiempo de ejecución debe cubrir además la caché y las asignaciones temporales, por lo que la memoria total necesaria es superior a esa cifra.
- Plataforma: al ser un export MLX, está pensado para Apple Silicon (SoC de la serie M). La conversión se realizó y probó en un Apple M3 Ultra.
- GPU dedicadas (NVIDIA, AMD): no disponibles para este export concreto, ya que el formato es MLX. Para GPU dedicada habría que usar el checkpoint base LFM2.5-24B-A2B-Preview en otro formato.
- ¿Cabe en GPU de consumo? Para este export no aplica; requiere hardware Apple con memoria unificada suficiente, no una GPU de consumo NVIDIA/AMD.
- Opciones de despliegue: MLX-VLM. El propio repositorio indica que se probó con el port de LFM2.5 en MLX-VLM PR #2505 (commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0. Otros motores como vLLM, llama.cpp, Ollama o TGI no están documentados para este export.
- Latencia y throughput estimados: no disponibles. No se publican cifras de tokens por segundo ni de latencia.
- Nota sobre el comando de la model card: el ejemplo de uso invoca el repositorio `nativ-community/LFM2.5-24B-A2B-Preview-mxfp8`, y la propia model card aclara que los ficheros idénticos se publican en ambas organizaciones, `nativ-community` y `mlx-community`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks verificables para comparar este modelo con alternativas de la misma categoría. La tabla siguiente recoge únicamente lo que se desprende de la información proporcionada.

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/LFM2.5-24B-A2B-Preview-mxfp8 (este) | 24B totales, 2B activos | 131.072 | MLX, MXFP8 8 bits | lfm1.0 | Hugging Face (mlx-community y nativ-community) |
| lq-preview/LFM2.5-24B-A2B-Preview (base) | 24B totales, 2B activos | 131.072 | BF16 (checkpoint original) | lfm1.0 | Hugging Face |
| mlx-community/LFM2.5-2.6B-mxfp8 (miembro menor de la familia) | no disponible | no disponible | MLX, 8 bits | lfm1.0 | Hugging Face |

No se han encontrado en la información disponible modelos comparables de otros fabricantes con datos de rendimiento publicados que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Verificación insuficiente: las pruebas documentadas son smoke tests de dos generaciones cortas; no hay evaluación de calidad, ni de contexto largo, ni de robustez. No debe asumirse un comportamiento correcto en producción sin una evaluación propia.
- Riesgo de alucinación: no disponible, pero al ser un modelo generativo y de razonamiento, es esperable; no se han publicado métricas de fidelidad.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo.
- Modo de razonamiento: el modelo genera razonamiento antes de la respuesta final, lo que incrementa el consumo de tokens de salida y la latencia percibida; hay que dimensionar `max-tokens` en consecuencia.
- Idioma y contexto: aunque se declaran diez idiomas, no se publican métricas por idioma. El límite de contexto es de 131.072 tokens según la configuración de origen, pero no hay benchmark que valide el rendimiento real a esa longitud.
- Restricciones de licencia: la LFM Open License v1.0 (`lfm1.0`) se aplica a estos pesos, junto con el fichero NOTICE que describe las modificaciones de conversión y cuantización. Es una licencia "other", por lo que conviene revisar sus términos antes de un uso comercial.
- Compatibilidad de formato: los pesos están en formato MLX y requieren Apple Silicon. No son directamente utilizables en stacks CUDA o ROCm.
- Dependencia de versiones: el export requiere versiones concretas (MLX 0.32.3, Transformers 5.17.0 y el commit indicado de MLX-VLM PR #2505); otras versiones pueden no ser compatibles.
- Repositorio sin tracción: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y su conversión es reciente, por lo que la validación por parte de la comunidad es nula.
- Atribución: el modelo original es de Liquid AI, Inc.; esta conversión es un trabajo derivado de la comunidad mlx-community.

## Enlaces

- Repositorio HuggingFace (este export): https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-mxfp8
- Repositorio gemelo en nativ-community: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-mxfp8
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Blog de Hugging Face sobre el modelo: https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Cobertura en Unite.AI: https://www.unite.ai/liquid-ai-releases-open-weight-lfm2-5-24b-a2b-for-on-device-agents/
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- MLX-VLM PR #2505 (port de LFM2.5): https://github.com/Blaizzy/mlx-vlm/pull/2505
- Miembro menor de la familia, LFM2.5-2.6B-mxfp8: https://huggingface.co/mlx-community/LFM2.5-2.6B-mxfp8
