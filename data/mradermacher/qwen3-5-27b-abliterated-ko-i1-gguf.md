# mradermacher/Qwen3.5-27B-abliterated-ko-i1-GGUF

## Resumen

Qwen3.5-27B-abliterated-ko-i1-GGUF es un repositorio de cuantizaciones GGUF con matriz de importancia (imatrix, "i1") preparado por mradermacher, un cuantizador muy activo de la comunidad de Hugging Face. El modelo base es messc57546g/Qwen3.5-27B-abliterated-ko, una versión "abliterated" (sin filtros de seguridad, mediante técnicas de descensado tipo "heretic") de un modelo Qwen3.5 de 27B parámetros, con etiqueta de idioma inglés y capacidades de visión según el autor del repositorio.

La relevancia de esta ficha radica en el formato: son pesos cuantizados listos para ejecutar localmente con llama.cpp, Ollama u otras runtimes compatibles con GGUF, con 21 variantes que van desde IQ1_S (7,2 GB) hasta Q6_K (22,2 GB). Esto permite ajustar el compromiso entre calidad, VRAM y velocidad según el hardware disponible. Al tratarse de un modelo abliterated, genera contenido sin las salvaguardas de seguridad del modelo original, por lo que va dirigido a casos de uso de investigación, red teaming o control total del comportamiento del modelo, y queda marcado explícitamente como "not-for-all-audiences".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.5, tipo transformer) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | ingles (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base, messc57546g/Qwen3.5-27B-abliterated-ko, deriva de Qwen3.5-27B, un transformer denso de la familia Qwen de Alibaba con aproximadamente 26,9 mil millones de parámetros según los metadatos de safetensors. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni procesos de alineación (RLHF/DPO) en la documentación proporcionada.

La modificación principal del modelo base es la "abliteración": un proceso post-entrenamiento que neutraliza los mecanismos internos de rechazo del modelo (en este caso aparentemente mediante la herramienta "heretic", según las etiquetas), eliminando sus negativas de seguridad sin reentrenar los pesos. Sobre ese modelo, mradermacher ha generado cuantizaciones GGUF con matriz de importancia (imatrix), técnica de Ikawrakow que pondera la cuantización según la sensibilidad real de cada tensor a partir de datos de calibración, logrando mejor calidad que las cuantizaciones estáticas a igual tamaño. Existe también un repositorio hermano de cuantizaciones estáticas. La model card indica que es un modelo de visión, con archivos mmproj disponibles en el repositorio estático.

## Capacidades

- Generacion de texto conversacional en ingles (etiqueta de idioma "en"; el sufijo "-ko" del modelo base sugiere algún componente coreano, pero no hay documentacion que lo confirme).
- Capacidades de vision: la model card lo declara modelo de vision y remite los archivos mmproj al repositorio de cuantizaciones estaticas.
- Comportamiento sin filtros de seguridad (abliterated): no rechaza peticiones que el modelo original bloquearia.
- Ejecucion local eficiente gracias a 21 variantes GGUF con imatrix, desde 7,2 GB hasta 22,2 GB.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp, y otras.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible (no consta en la documentacion).
- Capacidades de codigo, matematicas o razonamiento especificas: no disponible (no se documentan).

## Casos de uso

- Investigacion en seguridad de LLMs (red teaming): al carecer de salvaguardas, permite estudiar comportamientos de fallo, jailbreaks y alineacion sin que el propio modelo interponga rechazos, siendo util como sujeto de prueba en entornos controlados.
- Ejecucion en GPU de consumo: la variante i1-Q4_K_M (16,6 GB) cabe en una RTX 4090 de 24 GB o en una RTX 3090, permitiendo chatbot local con contexto razonable y velocidad interactiva.
- Despliegue en portatiles o equipos modestos: las variantes IQ2/IQ3 (8,5-13,4 GB) permiten ejecutar el modelo en GPUs de 12-16 GB o parcialmente en CPU con llama.cpp, sacrificando calidad.
- Generacion de datasets sinteticos sin filtros: para investigadores que necesitan respuestas no restringidas como materia prima para estudios de moderacion o clasificadores de seguridad.
- Prototipado rapido de aplicaciones locales: integracion con LM Studio, Ollama o interfaces tipo Open WebUI para evaluar el comportamiento abliterated antes de decidir despliegues.
- Analisis de vision local: con los archivos mmproj del repositorio estatico, se pueden construir pipelines de descripcion de imagenes que ejecuten el modelo de vision sin filtros en local.
- Comparacion de cuantizaciones: el rango completo de quants y el archivo imatrix incluido permiten a desarrolladores crear sus propias cuantizaciones o medir la degradacion de calidad por nivel de bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico comparativo generico de perplejidad entre tipos de cuantizacion (autoría de ikawrakow) y una referencia a las notas de Artefact2 sobre calidad de quants, sin numeros concretos para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (aprox. el tamano del archivo + overhead de contexto): IQ1_S/IQ1_M: 7,2-7,7 GB; IQ2/Q2_K: 8,5-10,8 GB; IQ3/Q3_K: 11,3-14,4 GB; IQ4/Q4_K: 15,2-17,2 GB; Q5_K: 18,8-19,3 GB; Q6_K: 22,2 GB.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para Q4_K_M/Q5_K_M con contexto amplio; RTX 4070 Ti Super o 5070 Ti (16 GB) para IQ3/IQ4_XS; GPUs de 8-12 GB solo con las variantes IQ1/IQ2, con degradacion notable de calidad.
- Cabe en GPU de consumo: si, hasta Q6_K en una tarjeta de 24 GB; hasta Q3 en tarjetas de 12-16 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, koboldcpp, text-generation-webui. La model card remite a los README de TheBloke para instrucciones de uso y concatenacion de archivos multiparte.
- Latencia y throughput: no disponible (no se publican mediciones).
- El archivo imatrix (0,1 GB) permite generar cuantizaciones propias sin recalcular la matriz.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.5-27B-abliterated-ko-i1-GGUF | 26,9 B | GGUF i1 (imatrix) | IQ1_S a Q6_K (21 variantes) | Apache 2.0 | Abliterated, vision, sin filtros |
| mradermacher/Qwen3.5-27B-abliterated-ko-GGUF | 26,9 B | GGUF estatico | no disponible | Apache 2.0 | Mismo modelo, quants estaticas; incluye mmproj |
| messc57546g/Qwen3.5-27B-abliterated-ko | 26,9 B | safetensors | no aplica (FP16/BF16) | Apache 2.0 | Modelo base abliterated, requiere ~54 GB VRAM en precision completa |

Como alternativa de la misma categoria (modelo abliterated cuantizado de ~27B), no hay otras comparables documentadas en la informacion disponible.

## Limitaciones y advertencias

- Contenido sin filtros: al ser abliterated, el modelo puede generar contenido ofensivo, peligroso o inapropiado sin rechazarlo. El repositorio esta etiquetado "not-for-all-audiences". Su uso conlleva responsabilidad legal y etica plena del operador.
- Riesgo de alucinacion: no documentado para este modelo; asume el riesgo tipico de cualquier LLM de 27B, posiblemente agravado por el proceso de abliteracion, que puede degradar la coherencia general (efecto no cuantificado aqui).
- Cuantizaciones extremas: IQ1_S/IQ1_M se describen como "para desesperados"; las variantes por debajo de Q3_K sufren perdida de calidad significativa segun el propio cuantizador y el grafico de perplejidad enlazado.
- Idioma: la model card solo declara ingles; el rendimiento en castellano no esta documentado y el sufijo "-ko" del modelo base sugiere una modificacion ligada al coreano cuyo alcance no se explica.
- Longitud de contexto: no especificada en ninguna de las fuentes; verificala en la model card del modelo original Qwen3.5 antes de disenar aplicaciones con documentos largos.
- Vision: los archivos mmproj no estan en este repositorio sino en el de cuantizaciones estaticas; sin ellos no hay entrada de imagen.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base abliterated hereda las consideraciones de la familia Qwen y la ausencia de salvaguardas puede incumplir las politicas de plataformas de despliegue comerciales.
- Datos de entrenamiento, alineacion y benchmarks del modelo base: no disponibles en la documentacion proporcionada.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Qwen3.5-27B-abliterated-ko-i1-GGUF
- Modelo base abliterated: https://huggingface.co/messc57546g/Qwen3.5-27B-abliterated-ko
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-27B-abliterated-ko-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-27B-abliterated-ko-i1-GGUF
- Notas de Artefact2 sobre calidad de quants: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog oficial o demo: no disponible
