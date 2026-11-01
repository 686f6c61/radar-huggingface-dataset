# ArchiveStudio/MiniCPM4.1-8B

## Resumen

MiniCPM4.1-8B es un modelo de lenguaje de 8 mil millones de parametros desarrollado por el equipo OpenBMB (publicado en HuggingFace bajo el perfil ArchiveStudio como espejo del original). Es la evolucion de la serie MiniCPM4, orientada a la eficiencia en inferencia en dispositivos de extremo (edge): combina atencion dispersa (sparse attention) entrenable con decodificacion especulativa para lograr hasta 3x de aceleracion en decodificacion durante el modo de razonamiento profundo, segun los datos publicados por sus autores.

Se trata de un modelo hibrido de razonamiento: puede operar tanto en modo de razonamiento profundo (thinking) como en modo directo (non-reasoning), con fusion de ambos modos. Segun la model card, supera a modelos de tamano similar en 15 tareas de evaluacion. Fue entrenado sobre la base de MiniCPM4-8B, que a su vez se entreno con 8 billones (8T) de tokens.

Su relevancia actual radica en la combinacion poco habitual de tres factores: rendimiento competitivo a escala 8B, arquitectura eficiente para hardware de consumo (se documentan mejoras concretas sobre una RTX 4090) y licencia Apache 2.0, que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion dispersa entrenable (InfLLM-V2), modo hibrido de razonamiento |
| Parametros totales | 8.185.253.888 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ, AutoAWQ, Marlin, GGUF, MLX, cuantizacion ternaria extrema (en variantes BitCPM de la serie) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16,4 GB en el repositorio); variantes en GPTQ, AutoAWQ, Marlin, GGUF y MLX |

## Arquitectura y entrenamiento

MiniCPM4.1-8B se basa en una arquitectura transformer con atencion dispersa entrenable descrita en el articulo InfLLM-V2 (arXiv:2509.24663). La novedad principal es que el modelo puede entrenarse con datos de texto largo limitados (los autores indican que basta con 5B de tokens de texto largo) y, aun asi, operar en modo de atencion dispersa eficiente. El modelo soporta dos modos de inferencia: atencion densa y atencion dispersa, seleccionables segun el framework utilizado.

La serie procede de MiniCPM4-8B, entrenado con 8T de tokens. Entre las innovaciones tecnicas destacan la decodificacion especulativa por ranking de frecuencia (FRSpec, con cabezas Eagle3 disponibles) y la aceleracion documentada de 3x en decodificacion sobre una RTX 4090 en modo razonamiento. No se han publicado detalles sobre el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation) en chino e ingles.
- Razonamiento profundo con modo thinking fusable: el modelo alterna entre razonamiento extendido y respuesta directa.
- Resolucion de problemas matematicos con razonamiento paso a paso (se recomienda el prompt con `\boxed{}` para la respuesta final).
- Respuesta a preguntas de seleccion multiple en ingles y chino con formatos de salida estructurados recomendados.
- Generacion de salidas muy largas: se recomienda configurar max_output_token en 65.536 tokens.
- Decodificacion especulativa mediante cabezas Eagle3 (variante MiniCPM4.1-8B-Eagle3) para acelerar la inferencia.
- Soporte de atencion dispersa en inferencia para contextos largos con menor coste computacional.
- La serie MiniCPM incluye derivados con tool calling via MCP (MiniCPM4-MCP) y generacion de survey papers (MiniCPM4-Survey), aunque estas capacidades corresponden a variantes especificas, no al modelo base.

## Casos de uso

- Razonamiento matematico y cientifico en local: gracias al modo thinking y al maximo de salida de 65.536 tokens, es adecuado para resolver problemas de matematicas paso a paso sin depender de la nube.
- Asistentes conversacionales on-device: con 8B de parametros y cuantizacion GPTQ/AWQ/GGUF, puede desplegarse en estaciones de trabajo locales para chat privado con datos sensibles.
- Procesamiento de documentos largos: la atencion dispersa entrenable (InfLLM-V2) permite inferencia eficiente sobre textos extensos, util para resumir informes o contratos.
- Generacion acelerada en GPUs de consumo: los autores documentan 3x de aceleracion en decodificacion sobre RTX 4090, lo que lo hace idoneo para aplicaciones interactivas con latencia baja.
- Sistemas de preguntas tipo test automatizadas: los prompts recomendados para MCQ en ingles y chino facilitan su integracion en pipelines de evaluacion educativa.
- Investigacion en eficiencia de inferencia: la disponibilidad de cabezas Eagle3, variantes Marlin y el runtime CPM.cu lo convierten en banco de pruebas para tecnicas de decodificacion especulativa y atencion dispersa.
- Aplicaciones bilingues chino-ingles: su entrenamiento centrado en ambos idiomas lo hace util para productos que operan en ambos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible (la model card incluye una imagen de resultados comparativos que no contiene datos textuales extraibles). Los autores afirman que el modelo supera a modelos de tamano similar en 15 tareas y que alcanza 3x de aceleracion en decodificacion sobre RTX 4090 en modo razonamiento, sin detallar las metricas exactas.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16 el repositorio ocupa 16,4 GB, por lo que se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090/4090) para precision completa; con cuantizacion GPTQ/AWQ (4 bits) puede rondar los 6-8 GB, siendo viable en GPUs de 8-12 GB. Estas cifras son estimaciones basadas en el tamano del repo, no datos oficiales.
- GPU recomendadas: RTX 4090 (los propios autores usan esta tarjeta para las mediciones de velocidad); para servidores, cualquier GPU con 24 GB o mas.
- Consumer GPU: si cabe. En RTX 4090 con pesos completos; en RTX 4060/3060 de 8-12 GB usando variantes cuantizadas GPTQ, AWQ o GGUF.
- Opciones de despliegue: HuggingFace Transformers, vLLM, SGLang y CPM.cu (recomendado por los autores para maxima velocidad). Nota importante: vLLM y SGLang solo soportan el modo de atencion densa; para atencion dispersa hay que usar Transformers o CPM.cu. Tambien existen variantes GGUF (compatibles con llama.cpp/Ollama) y MLX para Apple Silicon.
- Latencia y throughput: los autores documentan 3x de mejora en velocidad de decodificacion respecto a la inferencia estandar en RTX 4090 en modo razonamiento; no se publican cifras absolutas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento hibrido | Licencia |
|---|---|---|---|---|
| MiniCPM4.1-8B | 8,2B | no disponible | Si (thinking/no-thinking) | Apache 2.0 |
| Qwen3-8B | 8B | no disponible | Si | Apache 2.0 |
| MiniCPM4-8B | 8B | no disponible | No (solo MiniCPM4.1) | Apache 2.0 |
| Llama 3.1 8B | 8B | 128K | No | Llama 3.1 Community License |

MiniCPM4.1-8B se diferencia de Qwen3-8B principalmente por su atencion dispersa entrenable y su ecosistema de aceleracion (Eagle3, FRSpec, CPM.cu), orientado al despliegue en dispositivos de extremo. Frente a Llama 3.1 8B, ofrece modo de razonamiento hibrido y una licencia Apache 2.0 sin las restricciones de la licencia comunitaria de Meta. No hay datos numericos de benchmarks comparativos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados: el modelo esta orientado a chino e ingles; su rendimiento en castellano u otros idiomas no esta documentado y probablemente sea inferior.
- No hay benchmarks numericos publicados en la ficha: las afirmaciones de rendimiento ("supera a modelos similares en 15 tareas") no vienen acompanadas de tablas de metricas verificables en la informacion disponible.
- Soporte parcial de atencion dispersa: vLLM y SGLang solo ejecutan el modo denso; para aprovechar la eficiencia de la atencion dispersa hay que usar Transformers o CPM.cu, lo que puede limitar las opciones de despliegue en produccion.
- Salidas largas por defecto: se recomienda un maximo de 65.536 tokens de salida, lo que puede generar respuestas muy extensas y costosas si no se ajusta el parametro.
- Riesgo de alucinacion: al tratarse de un modelo de lenguaje generativo de 8B, puede generar informacion incorrecta, especialmente en dominios especializados; no se han publicado evaluaciones de alucinacion.
- Sesgos: no disponible; no se documenta ningun analisis de sesgos en la model card.
- Codigo personalizado: el repositorio usa `custom_code` en Transformers, lo que requiere confiar en codigo remoto al cargar el modelo (trust_remote_code=True).
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque conviene verificar los terminos del modelo original de OpenBMB si se usa el espejo de ArchiveStudio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArchiveStudio/MiniCPM4.1-8B
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM4.1-8B
- Repositorio GitHub de MiniCPM: https://github.com/OpenBMB/MiniCPM/
- Technical Report de MiniCPM4 (arXiv:2506.07900): https://arxiv.org/abs/2506.07900
- Paper InfLLM-V2 (arXiv:2509.24663): https://arxiv.org/abs/2509.24663
- Variante GPTQ: https://huggingface.co/openbmb/MiniCPM4.1-8B-GPTQ
- Variante AutoAWQ: https://huggingface.co/openbmb/MiniCPM4.1-8B-AutoAWQ
- Variante Marlin: https://huggingface.co/openbmb/MiniCPM-4.1-8B-Marlin
- Variante GGUF: https://huggingface.co/openbmb/MiniCPM4.1-8B-GGUF
- Variante MLX: https://huggingface.co/openbmb/MiniCPM4.1-8B-MLX
- Cabeza Eagle3: https://huggingface.co/openbmb/MiniCPM4.1-8B-Eagle3
- Demo en video (YouTube): https://www.youtube.com/watch?v=VouXjLHKDUY
- Discord de la comunidad: https://discord.gg/3cGQn9b3YM
