# mradermacher/Yoshino2-2B-i1-GGUF

## Resumen

Yoshino2-2B-i1-GGUF es una cuantizacion en formato GGUF del modelo base en5yme/Yoshino2-2B, publicada por el usuario mradermacher. Se trata de un modelo derivado por destilacion del dataset en5yme/Nemotron-Lightning-30B-A3B-Distill, orientado a tareas de razonamiento, y distribuido bajo licencia MIT. La ficha del repositorio lo etiqueta como modelo de vision, aunque los ficheros mmproj asociados, si existen, se alojan en el repositorio estatico hermano.

El paquete incluye cuantizaciones de tipo imatrix (denominadas i1), generadas a partir de una matriz de importancia calculada sobre el modelo original. La informacion disponible es muy limitada: no se publican detalles de arquitectura, contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. El repositorio registra cero descargas y cero likes en el momento de la consulta, y su tamano declarado es practicamente nulo (0.0 GB), lo que sugiere que los pesos no estan efectivamente alojados o que la metadata es incompleta.

El dato de parametros totales reportado en safetensors es de 960.882, una cifra inconsistente con el nombre comercial "2B" y que probablemente corresponde a un recuento truncado o erroneo. Esta ficha refleja esa discrepancia de forma explicita en lugar de asumir un tamano no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetada como transformers; el modelo base se describe como modelo de vision en la model card del cuantizador) |
| Parametros totales | 960.882 segun safetensors del repo (inconsistente con la denominacion "2B"; no disponible el dato fiable) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (i1); el autor lista Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S; cuantizaciones estaticas en el repo Yoshino2-2B-GGUF |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero imatrix.gguf de 0.1 GB para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en5yme/Yoshino2-2B: la model card del repositorio cuantizado no detalla si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida, ni especifica el numero de capas, dimensiones ocultas o mecanismo de atencion. La unica referencia estructural es la etiqueta "transformers" y la mencion de que el modelo base es un modelo de vision, sin confirmacion adicional.

Respecto al entrenamiento, el unico dato disponible es que el modelo se ha obtenido por destilacion a partir de en5yme/Nemotron-Lightning-30B-A3B-Distill, un dataset de destilacion derivado de Nemotron-Lightning-30B-A3B. No se documentan el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal. Las cuantizaciones i1 emplean matrices de importancia (imatrix) para reducir la perdida de calidad en tipos de baja precision, pero no hay datos publicados sobre la perplejidad resultante.

## Capacidades

- Generacion de texto en ingles, con enfasis declarado en tareas de razonamiento segun las etiquetas del repositorio.
- Razonamiento derivado por destilacion de un modelo mayor (Nemotron-Lightning-30B-A3B), aunque sin evaluacion publica que lo cuantifique.
- Posible soporte de vision, segun la afirmacion de la model card de que "este es un modelo de vision"; los ficheros mmproj, si existen, estarian en el repositorio estatico Yoshino2-2B-GGUF.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado local de razonamiento en ingles: al ser un GGUF de tipo imatrix, puede cargarse con llama.cpp u Ollama en equipos modestos para experimentar con un modelo destilado de razonamiento sin depender de infraestructura en la nube.
- Evaluacion comparativa de cuantizaciones: el fichero imatrix.gguf permite generar cuantizaciones propias y medir la degradacion de perplejidad entre tipos, util para estudiar el impacto de la cuantizacion en modelos pequenos.
- Pipeline de generacion de texto en ingles con requisitos de latencia bajos: un modelo de este tamano puede ejecutarse en CPU o en GPU de gama de entrada, adecuado para tareas de clasificacion o resumen simple donde no se exige maxima calidad.
- Experimentacion academica con destilacion: sirve como caso de estudio de un modelo pequeno destilado de un MoE de 30B con 3B activos, para analizar que capacidades de razonamiento se transfieren y cuales se pierden.
- Despliegue en entornos con licencia permisiva: la licencia MIT facilita su incorporacion en productos internos o comerciales sin las restricciones de licencias copyleft o de uso condicionado.
- Base para fine-tuning ligero: al estar disponible en GGUF y con un modelo base identificado, puede servir de punto de partida para ajustes con LoRA en tareas especificas en ingles, siempre que se valide previamente su calidad real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable, dado que el recuento de parametros del repositorio (960.882) es inconsistente con la denominacion "2B". Si el modelo tuviera realmente ~2B parametros, una cuantizacion Q4_K_M ocuparia aproximadamente 1,2-1,4 GB y cabria en GPUs consumer con 4 GB o mas; si el recuento real fuera cercano a 1B, el requisito seria de ~0,6-0,8 GB en Q4.
- GPU recomendadas: no disponible. Por tamano nominal, cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) seria suficiente en cuantizaciones de 4 bits.
- Cabe en GPU consumer: probablemente si, en funcion del tamano real y de la cuantizacion elegida; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio declara compatibilidad con endpoints y la libreria transformers, aunque el formato de pesos es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Yoshino2-2B-i1-GGUF | 960.882 segun safetensors (nominal 2B) | no disponible | MIT | GGUF | Cuantizacion imatrix de un modelo destilado de razonamiento; sin benchmarks |
| mradermacher/Yoshino2-1B-i1-GGUF | ~1B (nominal) | no disponible | no disponible | GGUF | Variante de 1B del mismo linaje, publicada por el mismo cuantizador |
| en5yme/Yoshino2-2B | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Modelo base original del que deriva esta cuantizacion |
| en5yme/Nemotron-Lightning-30B-A3B-Distill | 30B totales / 3B activos (origen de la destilacion) | no disponible | no disponible | no disponible | Fuente de destilacion, no un modelo comparable en tamano |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o fidelidad del modelo; cualquier uso en produccion exige una evaluacion propia previa.
- Inconsistencia en el recuento de parametros: el valor de safetensors (960.882) no cuadra con el nombre "2B", lo que impide estimar con fiabilidad requisitos de memoria y rendimiento.
- Repositorio practicamente vacio: 0.0 GB de tamano y cero descargas sugieren que los pesos pueden no estar disponibles o que la publicacion esta incompleta.
- Idiomas: solo ingles declarado; no hay soporte verificado de castellano ni de otros idiomas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje pequenos destilados, agravado por la falta de evaluacion publica.
- Sesgos: no documentados; al no conocerse la composicion del dataset de destilacion, no es posible evaluar sesgos de genero, raza o dominio.
- Licencia MIT: permisiva para uso comercial, pero el usuario debe verificar que el modelo base y el dataset de destilacion no impongan restricciones adicionales no reflejadas en la metadata.
- Capacidad de vision no confirmada: la model card afirma que es un modelo de vision, pero no se especifica si los ficheros mmproj existen ni donde estan alojados.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana real del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Yoshino2-2B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Yoshino2-2B-GGUF
- Modelo base: https://huggingface.co/en5yme/Yoshino2-2B
- Dataset de destilacion: https://huggingface.co/datasets/en5yme/Nemotron-Lightning-30B-A3B-Distill
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Yoshino2-2B-i1-GGUF
- Variante de 1B: https://huggingface.co/mradermacher/Yoshino2-1B-i1-GGUF
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
