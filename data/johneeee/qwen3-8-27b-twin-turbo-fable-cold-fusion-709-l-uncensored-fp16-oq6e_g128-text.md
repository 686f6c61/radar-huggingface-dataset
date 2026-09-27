# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-fp16-oQ6e_g128-text

## Resumen

Esta ficha describe `Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-fp16-oQ6e_g128-text`, una distribucion cuantizada en formato MLX de un fine-tune de la familia Qwen 3.8 27B. El modelo subyacente es un ajuste fino desarrollado por DavidAU (con contribuciones atribuidas a Nightmedia en la documentacion publica de la serie), orientado a seguimiento de instrucciones, razonamiento, analisis, creatividad y generacion de texto sin censura. El repositorio que nos ocupa no contiene los pesos originales, sino una version comprimida a 6 bits con cuantizacion de precision mixta generada con la herramienta oQ (oMLX v0.7.0.dev4) por el usuario Johneeee.

El dato objetivo mas relevante es el recuento de parametros real extraido de los safetensors: 26.895.998.464 parametros (unos 26,9 mil millones), con un repositorio de 21,5 GB en formato MLX safetensors. La arquitectura declarada en las etiquetas es `qwen3_5`, e incluye cabezas MTP (multi-token prediction) segun las referencias del propio autor a variantes "MTP-headed". La cuantizacion emplea 6 bits con tamano de grupo 128, y el autor reporta una perplejidad de 7,923 (un incremento del 0,055 % respecto a la base, es decir, practicamente empatada), una divergencia KL directa de 0,0017 y un top-1 del 98,05 % en la evaluacion de la cuantizacion.

La relevancia de esta publicacion es doble. Por un lado, permite ejecutar un modelo de ~27B en hardware Apple Silicon con requisitos de memoria moderados (entorno a 21,5 GB de pesos). Por otro, es un ejemplo documentado de cuantizacion de precision mixta con metricas de degradacion publicadas, algo poco habitual. Ahora bien, conviene ser cauto: el repositorio no declara licencia, idiomas ni pipeline, no tiene descargas ni valoraciones, y no se han publicado resultados de benchmarks completos especificos para esta revision cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo `qwen3_5` (etiqueta del repositorio); incluye cabezas MTP segun referencias del autor |
| Parametros totales | 26.895.998.464 (26,9B), dato real de los safetensors |
| Parametros activos | no disponible (no se confirma si la variante base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, precision mixta oQ, group size 128; existen variantes hermanas oQ8e y oQ63e |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (libreria `mlx`); existen equivalentes GGUF de la misma familia publicados por DavidAU |
| Tamano del repositorio | 21,5 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion (metadatos) | 2026-09-27; ultima actualizacion 2026-09-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una cadena de tres capas de transformacion. La base es Qwen 3.8 27B, un transformer denso de aproximadamente 27 mil millones de parametros (26,9B en este recuento concreto). Sobre esa base, DavidAU aplica un fine-tune de la serie TWIN-TURBO / Fable Cold Fusion, descrito en su documentacion como un ajuste orientado a seguimiento de instrucciones y razonamiento con modos conmutables de "thinking" e "instruct", y con una reduccion deliberada del numero de tokens de razonamiento generados ("reduced thinking tokens"). La model card de la familia menciona tambien una variante heretic/uncensored de intensidad ligera a moderada. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras.

La tercera capa es la cuantizacion. Johneeee aplica oQ (oMLX v0.7.0.dev4), un esquema de cuantizacion de precision mixta que asigna distintos anchos de bit a distintas capas en lugar de un unico 6-bit uniforme. El autor reporta ademas el entrenamiento o evaluacion de cabezas MTP en paralelo ("MTP-headed oQ6e is running"), lo que sugiere soporte de decodificacion multitoken, aunque no se aportan cifras de aceleracion. Las metricas de fidelidad publicadas para esta revision son: perplejidad 7,923 (variacion de +0,055 % respecto de la base, descrita por el autor como "essentially tied with base"), KLD forward de 0,0017 y top-1 del 98,05 %. El autor senala que el group size 128 supera ligeramente al grupo 63 en esta configuracion concreta.

## Capacidades

- Generacion de texto general, con enfasis declarado en seguimiento de instrucciones detallado y generacion extensa.
- Razonamiento y analisis: la familia incorpora modos de pensamiento conmutables, con un perfil orientado a reducir el gasto de tokens de razonamiento.
- Escritura creativa y redaccion multi-etapa: la documentacion de la familia menciona "multi-stage drafting" y generacion detallada.
- Generacion sin censura: el ajuste se describe como variante heretic/uncensored, lo que implica menor rechazo a peticiones sensibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato verificado; los modos de pensamiento de la familia son compatibles en principio, pero sin confirmacion en esta revision.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales: cabezas MTP referenciadas por el autor; se desconoce si incluye vision, audio u otras modalidades.
- Inferencia en Apple Silicon: integracion nativa con el ecosistema MLX.

## Casos de uso

- Generacion de texto largo en local sobre Mac: con 26,9B de parametros en 6 bits y 21,5 GB de pesos, el modelo cabe en un equipo Apple Silicon con 32 GB de memoria unificada, lo que permite redactar documentos extensos sin conexion a servicios en la nube.
- Asistente de escritura creativa sin filtros editoriales: la naturaleza uncensored del ajuste lo hace adecuado para ficcion, guiones y contenido donde los modelos alineados de forma agresiva suelen rechazar la peticion.
- Analisis y sintesis de documentos: los modos de instruccion de la familia estan orientados a seguimiento estricto de consignas, util para resumir, extraer y reestructurar informacion.
- Prototipado de pipelines de razonamiento en investigacion: al ser un modelo con modos de pensamiento conmutables y cabezas MTP, sirve como banco de pruebas para estudiar el equilibrio entre tokens de razonamiento y calidad de respuesta.
- Evaluacion comparativa de tecnicas de cuantizacion: las variantes oQ6e, oQ8e y oQ63e de la misma familia, con metricas de perplejidad y KLD publicadas, permiten medir el impacto real del ancho de bit y del group size en tareas propias.
- Despliegue local con requisitos de privacidad: al ejecutarse integramente en el equipo del usuario mediante MLX, es viable para flujos donde los datos no pueden salir de la maquina.
- Generacion de datos sinteticos: la combinacion de bajo rechazo y capacidad de generacion extensa lo hace util para producir corpus de entrenamiento o evaluacion, siempre con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible para esta revision concreta. Los unicos datos numericos disponibles son las metricas de fidelidad de la cuantizacion reportadas por el autor de la cuantizacion, junto con cifras de ARC-c que provienen de model cards de la misma familia de fine-tunes pero de otras revisiones (GGUF de 8 y 4 bits) atribuidas a DavidAU. Se reproducen a continuacion con la advertencia expresa de que no estan verificadas de forma independiente ni corresponden necesariamente a estos pesos.

| Metrica | Valor | Ambito |
|---|---|---|
| Perplejidad (oQ6e, g128) | 7,923 | Revision cuantizada de esta ficha |
| Variacion de perplejidad vs. base | +0,055 % | Revision cuantizada de esta ficha |
| KLD forward | 0,0017 | Revision cuantizada de esta ficha |
| Top-1 de acuerdo | 98,05 % | Revision cuantizada de esta ficha |
| ARC-c (8 bits) | 709 | Afirmacion del autor para la familia DavidAU; no verificada |
| ARC-c (4 bits) | 701 | Afirmacion del autor para la familia DavidAU; no verificada |
| ARC-c de Qwen 3.8 27B base | 118 puntos por debajo, segun el autor | Afirmacion del autor; no verificada |

## Requisitos de hardware

- Memoria para pesos: 21,5 GB de repositorio en 6 bits. En la practica se necesitan entre 22 y 26 GB de memoria unificada contando cache KV y overhead del runtime.
- Equipos Apple Silicon: recomendable M2 Max, M3 Max, M4 Max o cualquier chip Ultra con 32 GB o mas de memoria unificada. Un equipo de 24 GB queda muy justo y probablemente obligue a reducir la longitud de contexto. Los chips de 16 GB no son viables.
- GPU NVIDIA o AMD: no soportadas de forma nativa, ya que MLX esta disenado para Apple Silicon. Para usar este modelo en CUDA habria que recurrir a las variantes GGUF de la misma familia o reconvertir los pesos.
- Opciones de despliegue: `mlx-lm` (incluye servidor compatible con la API de OpenAI), MLX en Python, y clientes de escritorio con soporte MLX. No es compatible directamente con vLLM, TGI ni llama.cpp sin conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para esta revision.
- Cuantizaciones alternativas: la familia incluye variantes oQ8e (mayor fidelidad, mas memoria) y oQ63e (menor group size), lo que permite ajustar el equilibrio entre calidad y huella de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Johneeee, oQ6e g128) | 26,9B | MLX safetensors | 6 bits, precision mixta | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| DavidAU Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (GGUF) | ~27B | GGUF | 8 bits y 4 bits | no disponible | no disponible | Publico, orientado a llama.cpp |
| Johneeee oQ8e-fp16-mtp (misma familia) | ~27B | MLX safetensors | 8 bits | no disponible | no disponible | Publico, mayor huella de memoria |
| Qwen 3.8 27B base | ~27B | safetensors | fp16 y cuantizaciones de terceros | no disponible | no disponible en la informacion disponible | Modelo de referencia del fine-tune |

No se dispone de datos verificados de rendimiento comparado entre estas variantes mas alla de las cifras de cuantizacion y de las afirmaciones del autor de la familia DavidAU. Cualquier comparacion de calidad entre ellas deberia hacerse con una evaluacion propia.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Esto impide determinar si el uso comercial esta permitido y genera incertidumbre legal para cualquier despliegue en produccion. Habria que consultar la licencia del modelo base Qwen 3.8 27B y la del fine-tune original.
- Modelo sin censura: el ajuste se describe como heretic/uncensored. Es previsible que genere contenido que otros modelos rechazarian, incluyendo material ofensivo, sesgado o potencialmente danino. Requiere filtros externos si se expone a usuarios finales.
- Cuantizacion de 6 bits: aunque la degradacion reportada es minima (perplejidad +0,055 %, KLD 0,0017), la evaluacion procede del propio autor de la cuantizacion y se limita a metricas de perplejidad y acuerdo top-1, que no capturan completamente el impacto en tareas de razonamiento o codigo.
- Riesgo de alucinacion: inherente a los modelos de esta escala y agravado por el sesgo hacia generacion creativa y sin filtros. No hay datos publicados sobre tasas de alucinacion.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otras lenguas. El comportamiento multilingue deberia validarse antes de usarlo en produccion.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin conocer la ventana real soportada.
- Dependencia de plataforma: al estar en formato MLX, queda restringido a hardware Apple Silicon. Esto limita el despliegue en infraestructura de servidores convencional.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes. No hay evidencia de uso real, informes de errores ni verificacion independiente de los pesos.
- Fechas de metadatos inconsistentes: el repositorio figura como creado el 27 de septiembre de 2026, lo que sugiere un error de marcado temporal o un entorno de fechas no estandar. Conviene tratarlo con cautela.
- Cadena de custodia opaca: no se documentan los datasets, el procedimiento de entrenamiento ni las fuentes del fine-tune intermedio, lo que dificulta auditar sesgos o procedencia de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-fp16-oQ6e_g128-text
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Variante oQ8e-fp16-mtp del mismo autor: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ8e-fp16-mtp
- Variante GGUF de DavidAU (NM-DAU-NEO-MTP): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Modelo original de la familia en Featherless: https://featherless.ai/models/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Analisis en HackerNoon sobre la familia TURBO: https://hackernoon.com/qwen38-27b-turbo-review-a-faster-thinking-uncensored-qwen-fine-tune
- Ficha en aimodels.fyi de la variante 735-882: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
