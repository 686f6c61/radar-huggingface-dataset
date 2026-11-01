# ArchiveStudio/MiniCPM4-8B

## Resumen

MiniCPM4-8B es un modelo de lenguaje de 8.185 millones de parametros desarrollado por OpenBMB (publicado en HuggingFace bajo la cuenta ArchiveStudio como copia/espejo del original), disenado explicitamente para ejecucion en dispositivos de borde (edge). Forma parte de la serie MiniCPM4, presentada en junio de 2025, y se entreno sobre 8 billones (8T) de tokens. Su propuesta de valor es la eficiencia: el equipo afirma lograr aceleraciones de generacion superiores a 5x en chips tipicos de extremo frente a modelos convencionales de tamano similar.

El modelo aborda el problema de desplegar LLM capaces en hardware limitado (moviles, portatiles, placas de desarrollo) sin sacrificar rendimiento en razonamiento, codigo y manejo de textos largos. Para ello incorpora innovaciones en cuatro dimensiones: arquitectura (atencion dispersa entrenable InfLLM v2), algoritmos de entrenamiento (FP8, multi-token prediction, cuantizacion ternaria BitCPM), datos (UltraClean, UltraChat v2) e inferencia (framework CUDA CPM.cu y sistema multiplataforma ArkInfer).

Es relevante ahora porque la carrera por el despliegue local de modelos esta en auge, y MiniCPM4-8B ofrece una combinacion poco habitual de ventana de contexto larga (hasta 128K tokens con atencion dispersa), soporte de tool calling y ecosistema completo de variantes aceleradas (Eagle/FRSpec, cuantizaciones marlin, versiones ternarias BitCPM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion dispersa entrenable InfLLM v2 |
| Parametros totales | 8.185.253.888 (dato real de safetensors) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 128K tokens (con InfLLM v2; cada token solo calcula relevancia con menos del 5% de los tokens) |
| Tipos de cuantizacion | No disponible en la model card; existen variantes QAT y marlin en la serie, y BitCPM (cuantizacion ternaria) para versiones 0.5B y 1B |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repo: 16,4 GB) |

## Arquitectura y entrenamiento

MiniCPM4-8B es un modelo transformer decoder denso (no MoE) cuya innovacion central es InfLLM v2, un mecanismo de atencion dispersa entrenable. En el procesamiento de textos de hasta 128K tokens, cada token solo necesita calcular su relevancia con menos del 5% de los tokens de la secuencia, lo que reduce drasticamente el coste computacional del prefilling y la decodificacion en contextos largos sin requerido entrenamiento adicional del mecanismo de dispersion.

El entrenamiento se realizo sobre 8T de tokens con datos filtrados mediante UltraClean, una estrategia iterativa de limpieza y verificacion de datos cuyo resultado es el dataset abierto UltraFinweb (chino e ingles). El fine-tuning supervisado uso UltraChat v2, un dataset de alta calidad que cubre datos de conocimiento intensivo, razonamiento, seguimiento de instrucciones, comprension de textos largos y tool calling. Entre las tecnicas de entrenamiento destacan el uso de computo en baja precision FP8, la estrategia de multi-token prediction, y "Model Wind Tunnel 2.0", un metodo de escalado predictivo para buscar configuraciones de entrenamiento optimas. La familia incluye ademas cabeceras Eagle para decodificacion especulativa (FRSpec) y versiones con QAT que combinan especulacion y cuantizacion.

## Capacidades

- Generacion de texto conversacional en chino e ingles (pipeline text-generation, etiqueta conversational).
- Razonamiento y comprension de textos largos gracias a la ventana de 128K tokens con atencion dispersa.
- Seguimiento de instrucciones entrenado con UltraChat v2.
- Tool calling / function calling: los datos de fine-tuning incluyen explicitamente datos de llamada a herramientas; existe ademas la variante MiniCPM4-MCP, que llama autonomamente a herramientas MCP.
- Generacion de documentos largos estructurados: la variante MiniCPM4-Survey genera articulos de revision tipo survey de forma autonoma.
- Generacion de codigo y matematicas: incluidas en las categorias de datos de razonamiento, aunque sin benchmarks publicados en la model card.
- Capacidades de vision o audio: no disponible; es un modelo de texto puro.

## Casos de uso

- **Asistentes locales en dispositivos de borde**: gracias a su diseno para extremo y a la aceleracion de 5x en chips end-side, es adecuado para asistentes conversacionales que corren en moviles o SBCs sin conexion a la nube.
- **Analisis de documentos largos**: la ventana de 128K con atencion dispersa permite resumir, consultar y responder preguntas sobre contratos, informes o bases de codigo extensas con un coste computacional reducido.
- **Agentes con herramientas**: con soporte de tool calling en el fine-tuning y la variante MiniCPM4-MCP, puede integrarse en pipelines de agentes que consultan APIs, bases de datos o herramientas MCP de forma autonomia multi-paso.
- **Atencion al cliente automatizada**: el entrenamiento conversacional multi-turno y la capacidad de seguir instrucciones lo hacen apto para chatbots de soporte, especialmente en chino e ingles.
- **Generacion de codigo en flujos de desarrollo**: puede integrarse en editores o pipelines de CI/CD como asistente de generacion y revision de codigo en entornos con GPU modesta.
- **Investigacion y sintesis documental**: mediante MiniCPM4-Survey, genera revisiones bibliograficas largas y estructuradas a partir de consultas de usuario, util para equipos de investigacion.
- **Despliegue multiplataforma con ArkInfer**: el sistema de inferencia cruzada permite servir el modelo en varios backends (edge y servidor) desde una misma base de codigo, util para productos con despliegue hibrido.
- **Investigacion en eficiencia de LLM**: la apertura de UltraFinweb, CPM.cu y las tecnicas de cuantizacion ternaria lo convierten en base para experimentos de entrenamiento e inferencia eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (la model card referencia el informe tecnico en arXiv:2506.07900 para detalles de rendimiento, pero no incluye tablas de MMLU, HumanEval, GSM8K ni otras metricas).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16 (16,4 GB en el repo), se estima en torno a 17-20 GB de VRAM; con cuantizacion a 4 bits cabria en torno a 5-6 GB. Estas cifras son estimaciones basadas en el tamano de pesos, no datos oficiales.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX 3090 cubren la inferencia en precision completa; para despliegue en servidor con batching, A100 o H100. Para el modo eficiente en edge, el modelo esta pensado para chips end-side (la model card no detalla hardware concreto).
- Consumer GPUs: si cabe en una RTX 4090 o RTX 3090 en BF16; con cuantizacion a 4 bits (por ejemplo via llama.cpp si existe soporte GGUF, no disponible en este repo) cabria en GPUs de 8 GB.
- Opciones de despliegue: CPM.cu (framework CUDA propio de OpenBMB, recomendado oficialmente, integra atencion dispersa, cuantizacion y muestreo especulativo), ArkInfer (despliegue multiplataforma), y transformers de HuggingFace (custom code). La compatibilidad con vLLM esta documentada para las cabeceras Eagle; soporte GGUF/Ollama: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponible en cifras concretas; la model card afirma aceleracion de generacion superior a 5x en chips end-side tipicos respecto a la inferencia convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiniCPM4-8B | 8,2B | 128K (atencion dispersa) | Apache 2.0 | Eficiencia en edge, chino/ingles |
| Llama 3.1 8B | 8B | 128K | Licencia Llama 3.1 (restricciones) | Generalista, multilingue |
| Qwen2.5-7B | 7,6B | 128K | Apache 2.0 (mayoria de tamanos) | Generalista fuerte en chino/ingles |
| Gemma 2 9B | 9B | 8K | Gemma license (restricciones) | Generalista, contexto corto |

MiniCPM4-8B se diferencia de Llama 3.1 8B y Qwen2.5-7B en su foco explicito en eficiencia de inferencia en borde (atencion dispersa, especulacion, cuantizacion extrema) y en su licencia Apache 2.0 plenamente permisiva frente a la licencia de Llama. En cambio, sus benchmarks publicos no estan disponibles en esta ficha, por lo que la comparacion de rendimiento debe consultarse en el informe tecnico.

## Limitaciones y advertencias

- Idiomas limitados oficialmente a chino e ingles; el rendimiento en castellano no esta documentado y puede ser inferior.
- Sesgos conocidos: no disponible; como todo LLM entrenado con datos web masivos, puede reproducir sesgos presentes en UltraFinweb y UltraChat v2.
- Riesgo de alucinacion: inherente a modelos de lenguaje de esta clase; no hay mitigaciones documentadas especificas en la model card.
- Uso de custom code: el repo requiere codigo personalizado de OpenBMB (tag custom_code), lo que exige confianza en el autor del repo y revision del codigo antes de produccion.
- El repo analizado (ArchiveStudio/MiniCPM4-8B) es una copia con muy pocas descargas (322); para produccion se recomienda el repo oficial openbmb/MiniCPM4-8B.
- Las cuantizaciones ternarias BitCPM aplican a las versiones 0.5B y 1B; para el 8B, las opciones de cuantizacion documentadas son las variantes Eagle/QAT/marlin para aceleracion especulativa, no cuantizaciones generales del modelo base.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque deben respetarse los terminos estandar de atribucion.
- Los datos de rendimiento (5x de aceleracion) proceden del propio desarrollador y se refieren a chips end-side especificos; verificar en el hardware objetivo antes de tomar decisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM4-8B
- Modelo oficial: https://huggingface.co/openbmb/MiniCPM4-8B
- Repositorio GitHub de la serie MiniCPM: https://github.com/OpenBMB/MiniCPM/
- Informe tecnico (arXiv): https://arxiv.org/abs/2506.07900
- Framework de inferencia CPM.cu: https://github.com/OpenBMB/cpm.cu
- Dataset de pre-entrenamiento UltraFinweb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Variante Eagle FRSpec: https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-FRSpec
- Variante Eagle vLLM: https://huggingface.co/openbmb/MiniCPM4-8B-Eagle-vLLM
- Variante MiniCPM4-Survey: https://huggingface.co/openbmb/MiniCPM4-Survey
- Variante MiniCPM4-MCP: https://huggingface.co/openbmb/MiniCPM4-MCP
- Comunidad (Discord): https://discord.gg/3cGQn9b3YM
