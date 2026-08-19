# mradermacher/Gemma-4-Dark-Thoughts-V2-31B-i1-GGUF

## Resumen

El modelo **Gemma-4-Dark-Thoughts-V2-31B-i1-GGUF** es una cuantización en formato GGUF del modelo original **Ateron/Gemma-4-Dark-Thoughts-V2-31B**, un merge creado con mergekit y orientado a roleplay y conversación. La cuantización ha sido realizada por **mradermacher**, un conocido proveedor de archivos GGUF, que ofrece tanto versiones con imatrix (i1) como estáticas. El modelo base tiene aproximadamente 30,7 mil millones de parámetros y está etiquetado como un modelo de visión, aunque no se confirma si los archivos GGUF incluyen el proyector multimodal (mmproj).

Este repositorio en particular contiene exclusivamente cuantizaciones i1 (con matriz de importancia) en varios niveles de compresión, desde IQ1_M (7,8 GB) hasta Q6_K (25,3 GB). Está pensado para su uso con motores de inferencia compatibles con GGUF como llama.cpp, Ollama o LM Studio. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y el idioma soportado es el inglés.

La relevancia de este modelo radica en su especialización para tareas de roleplay y generación de diálogos creativos, combinada con la flexibilidad de los formatos GGUF para ejecutarse en hardware variado, desde GPUs de consumo hasta entornos de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Gemma, sin especificacion detallada) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (tambien existen quants estaticos en repositorio separado) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivos imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Segun la model card, se trata de un merge realizado con mergekit, lo que implica la combinacion de multiples modelos (probablemente basados en la familia Gemma) para potenciar capacidades de roleplay y conversacion. No se especifican los componentes del merge ni el proceso de entrenamiento (datos, tokens, tecnicas de alineacion como RLHF o DPO). El modelo base esta etiquetado como de vision, lo que sugiere que podria tener capacidades multimodales, pero no se confirma si los archivos GGUF incluyen el proyector necesario.

La cuantizacion i1 utiliza una matriz de importancia (imatrix) para optimizar la distribucion de bits, lo que suele ofrecer mejor calidad que las cuantizaciones estaticas a igual tamaño. El autor recomienda los quants Q4_K_M o Q4_K_S como equilibrio optimo entre velocidad, tamaño y calidad.

## Capacidades

- Generacion de texto conversacional y creativo, especialmente orientado a roleplay y narrativa interactiva.
- Soporte de dialogos multi-turno (conversacional).
- Posible capacidad de vision (el modelo base es de vision), aunque no se confirma si los archivos GGUF incluyen el modulo mmproj.
- Multilingue: solo ingles confirmado.
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso.
- No se indica modo de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- **Roleplay y juegos de rol textuales**: el modelo esta especificamente diseñado para mantener personajes y tramas coherentes en conversaciones largas, ideal para plataformas de rol por texto o asistentes de escritura creativa.
- **Creacion de historias interactivas**: puede generar narrativas ramificadas donde el usuario decide las acciones, gracias a su entrenamiento orientado a roleplay.
- **Chatbots de entretenimiento**: para aplicaciones de compania virtual o simulacion de personajes, donde se requiere un tono natural y adaptativo.
- **Generacion de dialogos para videojuegos**: util en el desarrollo de NPCs con personalidad, ya que puede producir respuestas contextuales y coherentes con el personaje.
- **Asistente de escritura creativa**: ayuda a escritores a explorar dialogos, desarrollar personajes o superar bloqueos creativos mediante sugerencias conversacionales.
- **Prototipado rapido de agentes conversacionales**: gracias a su formato GGUF, puede desplegarse localmente en entornos de desarrollo para pruebas sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: segun el quant elegido, se necesitan aproximadamente:
  - i1-Q4_K_M (18,8 GB): requiere al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A6000).
  - i1-Q4_K_S (17,9 GB): similar al anterior.
  - i1-Q3_K_M (15,4 GB): cabe en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti.
  - i1-IQ3_XXS (12,2 GB): puede ejecutarse en GPUs de 12-14 GB (RTX 4070, RTX 3080).
  - i1-IQ2_M (11,0 GB): en GPUs de 10-12 GB (RTX 3080, RTX 4060 Ti).
  - i1-IQ1_M (7,8 GB): en GPUs de 8 GB (RTX 3060, RTX 4060), aunque con calidad muy reducida.
- **GPU recomendadas**: para un uso fluido con quants de calidad media-alta, se recomienda una GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A100, etc.). Para quants bajos, una GPU de 8-12 GB puede ser suficiente.
- **Opciones de despliegue**: compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier motor que soporte GGUF. Tambien puede usarse con servidores como llama.cpp server o KoboldCpp.
- **Latencia y throughput**: no se proporcionan datos especificos. Dependera del hardware y del quant utilizado; en una RTX 4090 con Q4_K_M se puede esperar una generacion de 20-40 tokens/segundo, pero es una estimacion no confirmada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de roleplay de tamano similar. El modelo base es un merge de la familia Gemma, pero no se conocen los componentes exactos ni sus metricas. Se recomienda consultar el repositorio del modelo base para obtener mas detalles.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un merge sin informacion sobre su alineacion, puede presentar sesgos presentes en los modelos base y generar contenido inexacto o inventado, especialmente en contextos no relacionados con roleplay.
- **Calidad de cuantizacion**: los quants de menor tamano (IQ1_M, IQ2_XXS) degradan significativamente la calidad y pueden producir respuestas incoherentes. Se recomienda usar Q4_K_M o superior para tareas serias.
- **Idioma**: solo se confirma soporte para ingles; el rendimiento en otros idiomas puede ser deficiente.
- **Capacidad de vision incierta**: aunque el modelo base es de vision, los archivos GGUF de este repositorio no incluyen el proyector multimodal (mmproj). Para usar vision, habria que buscar los archivos en el repositorio de quants estaticos.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe verificar que los modelos base del merge tambien tengan licencias compatibles (Gemma tiene su propia licencia, aunque aqui se indica apache-2.0).
- **Produccion**: al ser un modelo de roleplay, no es adecuado para tareas de alta precision como codigo, matematicas o razonamiento logico sin una evaluacion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-Dark-Thoughts-V2-31B-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Dark-Thoughts-V2-31B
- Repositorio de quants estaticos: https://huggingface.co/mradermacher/Gemma-4-Dark-Thoughts-V2-31B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-Dark-Thoughts-V2-31B-i1-GGUF
