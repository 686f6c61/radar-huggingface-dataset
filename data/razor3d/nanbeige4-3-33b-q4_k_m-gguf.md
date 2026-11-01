# Razor3D/Nanbeige4.3-33B-Q4_K_M-GGUF

## Resumen

Nanbeige4.3-33B es un modelo de lenguaje de gran tamano desarrollado por Nanbeige, una organizacion centrada en modelos bilingues ingles-chino. Con 33.118.977.024 parametros totales, se posiciona en la franja de modelos densos de escala media-alta, pensado para generacion de texto conversacional y tareas de comprension y generacion en ambos idiomas. La ficha que nos ocupa documenta la cuantizacion Q4_K_M en formato GGUF publicada por el usuario Razor3D, derivada del checkpoint original mediante el espacio GGUF-my-repo de ggml.ai y la herramienta llama.cpp.

El interes practico de esta publicacion es la accesibilidad: el repositorio pesa 20,1 GB, lo que permite ejecutar un modelo de 33B parametros en hardware de consumo con cuantizacion de 4 bits, algo inviable con los pesos originales en precision completa o bf16. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales, sin las restricciones de uso que imponen otras licencias de modelos abiertos.

La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada: la model card del repositorio cuantizado remite a la del modelo base y no incluye detalles tecnicos propios. Esta ficha recoge lo verificable a partir de los metadatos y senala explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso, segun el conteo de parametros; detalles no publicados en la informacion disponible) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no aplica (no consta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base admite otras cuantizaciones via llama.cpp, no listadas en la informacion disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El conteo de parametros (33.118.977.024) corresponde a un modelo denso, no a una mezcla de expertos, ya que no se declaran parametros activos ni estructura MoE en los metadatos. La model card del repositorio cuantizado no incluye descripcion de capas, atencion, tokenizador ni innovaciones tecnicas.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o instruccion supervisada. La unica informacion verificable sobre el proceso es la conversion a GGUF: se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, partiendo del checkpoint Nanbeige/Nanbeige4.3-33B, y el resultado se publica en cuantizacion Q4_K_M.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Comprension y generacion multilingue limitada a los dos idiomas declarados (en, zh); no se documentan otros idiomas.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso en despliegues tipo API de HuggingFace.
- Ejecucion en llama.cpp mediante CLI o servidor, con soporte de plantillas de chat propias del formato GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- No se documentan capacidades de codigo o matematicas mas alla de las genericas de un modelo de texto.

## Casos de uso

- Asistente conversacional bilingue ingles-chino: el modelo puede gestionar dialogos multi-turno en ambos idiomas, aprovechando su entrenamiento declarado en en y zh para atencion al cliente o soporte interno en organizaciones con operaciones en China y mercados angloparlantes.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M y 20,1 GB de pesos, es viable ejecutarlo en estaciones de trabajo con GPU de 24 GB o en configuraciones con offload parcial a CPU, lo que permite prototipado local sin infraestructura de servidor.
- Generacion de contenido editorial en chino e ingles: redaccion de borradores, resumenes y reescritura de textos en ambos idiomas, con la ventaja de una licencia Apache 2.0 que no restringe el uso comercial del contenido generado.
- Traduccion asistida en el par en-zh: aunque no se documenta como modelo de traduccion, su naturaleza bilingue permite usarlo como base para pipelines de traduccion con post-edicion humana, especialmente en dominios generales.
- Integracion en aplicaciones de escritorio o locales: al distribuirse en GGUF y funcionar con llama.cpp, puede embeberse en herramientas offline que requieran privacidad de datos, sin depender de APIs externas.
- Fine-tuning posterior y destilacion: al estar bajo Apache 2.0 y disponible en safetensors en el modelo base, sirve como punto de partida para ajuste supervisado en dominios verticales (legal, sanitario, soporte tecnico) en ingles o chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para la cuantizacion Q4_K_M: aproximadamente 20-22 GB para los pesos, mas overhead de contexto KV; con 2048 tokens de contexto el consumo total ronda los 22-24 GB.
- GPU recomendadas para Q4_K_M: NVIDIA RTX 3090 o RTX 4090 (24 GB) para carga completa; A100 40 GB o H100 para mayor contexto y concurrencia.
- GPU de gama media: una RTX 4080 (16 GB) o RTX 4070 Ti (12 GB) no admiten carga completa de Q4_K_M; requieren offload parcial a CPU o cuantizaciones mas agresivas (Q3_K_M, Q2_K) no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y llama-server, documentados en la model card), y por compatibilidad de formato GGUF, otros runners como Ollama o LM Studio; vLLM y TGI requeririan los pesos en safetensors del modelo base, no el GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de contexto. Como referencia cualitativa, un modelo denso de 33B en Q4_K_M suele generar entre 10 y 25 tokens por segundo en una RTX 4090, pero no se ha medido en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (Q4_K_M, este repo) | 33,1B | no disponible | Apache 2.0 | GGUF, safetensors (base) | Bilingue en-zh, cuantizacion de terceros |
| Qwen2.5-32B | 32,5B | 128K (segun documentacion publica del modelo) | Apache 2.0 | safetensors, GGUF | Bilingue en-zh, ecosistema amplio y benchmarks publicos |
| Llama 3.1 33B (variante densa de la familia) | ~33B | 128K (segun documentacion publica) | Llama 3.1 Community License | safetensors, GGUF | Multilingue amplio, licencia con restricciones de uso |
| Yi-34B | 34B | 200K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Bilingue en-zh, orientado a contexto largo |

La comparativa se limita a parametros, licencia y disponibilidad de formato, ya que no hay benchmarks publicados de Nanbeige4.3-33B en la informacion disponible que permitan contrastar rendimiento. Los datos de contexto y benchmarks de los modelos alternativos provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas, lo que impide comparar objetivamente con alternativas.
- Idiomas limitados: solo se declaran ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto desconocido: al no documentarse la longitud de contexto, no se puede asumir soporte para conversaciones largas ni documentos extensos; la model card sugiere `-c 2048` en el ejemplo de servidor, lo que apunta a un contexto modesto en la practica.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se documentan tecnicas de mitigacion ni evaluaciones de fidelidad.
- Cuantizacion de terceros: este repositorio no lo publica el autor original del modelo, sino un usuario (Razor3D); no hay garantia de que la conversion GGUF preserve exactamente el comportamiento del checkpoint original, aunque el proceso es estandar.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no documentadas en la informacion disponible.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse capacidad de function calling en produccion sin validacion previa.
- Modelo con pocas descargas (102) y sin likes: ecosistema de validacion practicamente inexistente; la comunidad no ha contrastado su calidad.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/Razor3D/Nanbeige4.3-33B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
