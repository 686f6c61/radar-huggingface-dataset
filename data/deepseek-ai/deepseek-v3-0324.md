# deepseek-ai/DeepSeek-V3-0324

## Resumen
DeepSeek-V3-0324 es una revisión del modelo de lenguaje DeepSeek-V3, desarrollado por DeepSeek AI, publicada el 24 de marzo de 2025. Se trata de un modelo de tipo Mixture of Experts (MoE) con 684.531.386.000 parámetros totales según los pesos en safetensors, y presenta mejoras sustanciales frente a la versión V3 original en razonamiento, desarrollo web front-end, escritura en chino y function calling. La licencia MIT lo convierte en una de las alternativas abiertas de mayor tamano disponibles para uso comercial.

El modelo resuelve tareas de generacion de texto, razonamiento complejo y programacion, y su interes actual radica en que eleva el rendimiento en benchmarks de razonamiento (por ejemplo, AIME pasa de 39.6 a 59.4 y GPQA de 59.1 a 68.4 respecto a V3) manteniendo pesos abiertos y una licencia permisiva. Con mas de 1.348.000 descargas en HuggingFace desde su publicacion, se ha consolidado como referencia entre los modelos abiertos de gran escala.

La arquitectura sigue la linea de DeepSeek-V3 documentada en el informe tecnico arXiv:2412.19437, basada en atencion MLA y enrutado MoE con equilibrio de carga sin perdida auxiliar. Los pesos se distribuyen en formato FP8, lo que reduce el espacio de almacenamiento pero exige infraestructura de multiples GPU para su despliegue completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), atencion MLA y Multi-Token Prediction (segun etiqueta deepseek_v3 e informe arXiv:2412.19437) |
| Parametros totales | 684.531.386.000 (684,5 mil millones) |
| Parametros activos | Aproximadamente 37.000 millones por token segun el informe tecnico asociado; no confirmado en la informacion de HuggingFace |
| Longitud de contexto | No disponible en la informacion proporcionada (el informe de la familia V3 documenta 128.000 tokens) |
| Tipos de cuantizacion | FP8 como formato original; cuantizaciones GGUF, AWQ y GPTQ disponibles en la comunidad, no oficiales |
| Idiomas soportados | No disponible en la ficha de HuggingFace; la model card destaca chino e ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado, custom_code) |

## Arquitectura y entrenamiento
DeepSeek-V3-0324 hereda la arquitectura del informe tecnico DeepSeek-V3 (arXiv:2412.19437), un transformer de tipo Mixture of Experts que combina Multi-head Latent Attention (MLA) para comprimir el cache de claves y valores, y un enrutado DeepSeekMoE con estrategia de equilibrio de carga sin perdida auxiliar. El entrenamiento de la familia V3 se realizo en precision FP8 sobre aproximadamente 14,8 billones de tokens e incorpora el objetivo de Multi-Token Prediction, que permite predecir varios tokens futuros por paso y se reutiliza en decodificacion especulativa. Estas cifras provienen del informe tecnico asociado, no de la ficha de HuggingFace.

La version 0324 incorpora ajustes adicionales orientados a razonamiento, function calling, escritura en chino y desarrollo web front-end, ademas de alinear el estilo de redaccion con el de DeepSeek-R1. No se detallan en la informacion disponible los volúmenes de datos de ajuste fino (SFT), RLHF o DPO empleados especificamente en esta revision, por lo que esos datos deben considerarse no disponibles.

## Capacidades
- Generacion de texto y conversacion multi-turno.
- Razonamiento reforzado: mejoras notables en MMLU-Pro (75.9 a 81.2), GPQA (59.1 a 68.4) y AIME (39.6 a 59.4) frente a V3.
- Generacion de codigo, con mejora especifica en LiveCodeBench (39.2 a 49.2) y en codigo ejecutable para desarrollo web front-end.
- Function calling mejorado, con correccion de problemas presentes en versiones previas de V3.
- Escritura en chino de calidad mejorada, alineada con el estilo de redaccion de DeepSeek-R1, incluyendo reescritura interactiva multi-turno, traduccion y redaccion de cartas.
- Capacidades de busqueda y analisis de informes en chino, con plantillas de prompt para busqueda web y citas.
- Soporte de carga de archivos mediante plantillas de prompt documentadas.
- Multiples idiomas segun la model card, con foco principal en chino e ingles; el listado oficial de idiomas no esta disponible.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo y function calling para consultar sistemas internos, llamar a APIs y resolver incidencias sin intervencion humana.
- Asistente de programacion y generacion de codigo en produccion: integrable en pipelines de CI/CD para autocompletar, revisar o generar pruebas, aprovechando su function calling y su rendimiento en LiveCodeBench.
- Desarrollo web front-end asistido: genera paginas y componentes ejecutables y visualmente cuidados, adecuado para prototipado rapido y maquetacion.
- Agentes autonomos de varios pasos: su soporte de tool calling y razonamiento permite encadenar acciones, buscar informacion y ejecutar tareas compuestas.
- Analisis de documentos y busqueda aumentada (RAG): gracias a las plantillas de carga de archivos y de citacion, se puede usar como motor de resumen y respuesta sobre corpus documentales.
- Redaccion y traduccion en chino e ingles: util para contenidos de formato medio y largo, reescritura interactiva y traduccion profesional.
- Generacion de informes y resumen de resultados de busqueda web: con el prompt de busqueda documentado, produce respuestas citadas y estructuradas.

## Benchmarks y rendimiento
Los unicos datos publicados en la informacion disponible comparan DeepSeek-V3-0324 con su predecesor DeepSeek-V3:

| Benchmark | DeepSeek-V3 | DeepSeek-V3-0324 | Variacion |
|---|---|---|---|
| MMLU-Pro | 75,9 | 81,2 | +5,3 |
| GPQA | 59,1 | 68,4 | +9,3 |
| AIME | 39,6 | 59,4 | +19,8 |
| LiveCodeBench | 39,2 | 49,2 | +10,0 |

No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, GSM8K, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware
- VRAM estimada: los pesos FP8 ocupan aproximadamente 688 GB (tamano del repo), por lo que la inferencia en precision original requiere en torno a 700 GB de memoria agregada.
- En BF16 los pesos rondarian los 1.370 GB, fuera del alcance de configuraciones de un solo nodo convencional.
- GPU recomendadas: multiples NVIDIA H100 de 80 GB (del orden de 8-10 unidades) o H200 con mayor memoria; tambien clusters A100 de 80 GB aunque con menor rendimiento por la falta de soporte nativo FP8.
- No cabe en GPU de consumo. Ni siquiera cuantizado a 4 bits (unos 350 GB) es viable en una RTX 4090 de 24 GB; requeriria despliegue multi-GPU o CPU con mucha RAM.
- Opciones de despliegue: vLLM y TGI soportan el modelo y el formato FP8; tambien es posible servir mediante SGLang. Las cuantizaciones GGUF comunitarias permiten llama.cpp/Ollama, pero con limitaciones severas de rendimiento y memoria.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V3-0324 | 684,5 mil millones | ~37 mil millones (informe tecnico) | no disponible | MIT | Pesos abiertos en HuggingFace |
| DeepSeek-V3 (original) | ~671 mil millones | ~37 mil millones (informe tecnico) | no disponible | MIT | Pesos abiertos |
| DeepSeek-R1 | no disponible en la informacion proporcionada | no disponible | no disponible | MIT | Pesos abiertos |
| Alternativas densas de 70B (p. ej. Llama 3.3, Qwen 2.5) | no disponibles en la informacion proporcionada | no aplica (densas) | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento no puede completarse.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; el foco del ajuste en chino e ingles puede reducir el rendimiento relativo en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido incorrecto o inventado, especialmente en tareas factuales o de razonamiento de multiples pasos.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista oficial de idiomas no estan confirmadas en la ficha; la model card enfatiza chino e ingles.
- Restricciones de licencia: la licencia MIT es permisiva y permite uso comercial, pero conviene revisar el aviso completo en el repositorio y las dependencias de codigo personalizado (custom_code).
- Requisitos de infraestructura: el despliegue completo exige multiples GPU de gama alta, lo que limita su uso a entornos con recursos significativos.
- Parametros de inferencia: la model card recomienda usar temperatura de modelo 0,3 y advierte de un mapeo interno de la temperatura de la API (T_model = T_api x 0,3 para 0 <= T_api <= 1; T_model = T_api - 0,7 para 1 < T_api <= 2), lo que puede desajustar expectativas si se migra desde otras APIs.
- Formato de pesos FP8: requiere software compatible (vLLM, TGI, SGLang) para un rendimiento optimo; su uso en otros frameworks puede degradar la velocidad o exigir conversion.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V3-0324
- Informe tecnico DeepSeek-V3 (arXiv): https://arxiv.org/abs/2412.19437
- Web oficial de DeepSeek: https://www.deepseek.com/
- Plataforma de API: https://www.deepseek.com/en/platform/
- Consola de la plataforma: https://platform.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Repositorio GitHub de DeepSeek-V2 (graficos y referencias): https://github.com/deepseek-ai/DeepSeek-V2
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
