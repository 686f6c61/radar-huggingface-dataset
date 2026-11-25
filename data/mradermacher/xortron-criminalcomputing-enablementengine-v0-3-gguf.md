# mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF

## Resumen

XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF es la version cuantizada en formato GGUF del modelo base darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas e imatrix de modelos de Hugging Face. El modelo base es un transformer denso de aproximadamente 30.700 millones de parametros (30,7 B) segun los pesos en safetensors, orientado a generacion de texto conversacional en ingles. La model card lo etiqueta explicitamente como "uncensored", "abliterated", "heretic" y "toxic", lo que indica que se ha aplicado alguna tecnica de eliminacion de alineamiento o rechazo de peticiones.

El interes tecnico de esta ficha no reside en sus capacidades de razonamiento o codigo, sino en su naturaleza como artefacto de doble uso: un modelo de gran tamano con las barreras de seguridad eliminadas, empaquetado en cuantizaciones que van de 12 GB (Q2_K) a 32,7 GB (Q8_0) y con un suplemento multimodal mmproj. La licencia declarada es Apache-2.0, lo que en la practica permite uso comercial sin restricciones adicionales, algo que agrava los riesgos asociados a su contenido.

La relevancia actual es doble: por un lado, documenta el estado del arte de las tecnicas de "abliteration" y cuantizacion de modelos de 30 B en hardware de consumo; por otro, sirve como caso de estudio de los limites de las licencias permisivas cuando el contenido del modelo es potencialmente danino. No se han publicado resultados de benchmarks ni detalles de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se especifica variante exacta; no disponible) |
| Parametros totales | 30.697.345.596 (30,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj-Q8_0 y mmproj-f16 para el suplemento multimodal |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |
| Tamano del repo | 213,9 GB (incluye todas las cuantizaciones) |
| Cuantizacion mas pequena | Q2_K, 12,0 GB |
| Cuantizacion mas grande | Q8_0, 32,7 GB |
| Suplemento multimodal | mmproj-Q8_0 (0,9 GB) y mmproj-f16 (1,3 GB) |
| Modelo base | darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3 |
| Descargas | 313 |
| Likes | 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer denso de 30,7 B de parametros. La model card del repositorio cuantizado no incluye datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o similares. Las etiquetas "unsloth", "heretic" y "abliterated" sugieren que el modelo base fue afinado o modificado con herramientas de la comunidad para eliminar comportamientos de rechazo, probablemente mediante tecnicas de abliteration (proyeccion de direcciones de rechazo fuera de los pesos) y posiblemente con el framework Unsloth para el afinamiento. La etiqueta "heretic" hace referencia a una familia de herramientas y modelos que automatizan la eliminacion de la alineacion de seguridad.

La innovacion tecnica destacable de este repositorio es el propio proceso de cuantizacion: mradermacher genera cuantizaciones estaticas (no imatrix) con la version 2 del pipeline de cuantizacion, e indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (sufijo -i1-GGUF). La presencia de ficheros mmproj indica que el modelo base incorpora un proyector multimodal, es decir, que acepta imagenes ademas de texto, aunque la model card no describe la arquitectura de vision ni el encoder visual utilizado.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno.
- Procesamiento multimodal de imagenes (se infiere de la presencia de ficheros mmproj; no se detalla la arquitectura de vision).
- Generacion de codigo y texto tecnico, como capacidad generica de un modelo de 30 B (no verificada con benchmarks).
- Comportamiento "uncensored": el modelo esta disenado para no rechazar peticiones, incluidas las potencialmente daninas, segun las etiquetas del autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta modo "thinking" ni capacidades de audio.
- Capacidad multilingue limitada al ingles segun el campo language de la model card.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo sirve como caso de estudio para medir hasta que punto las tecnicas de abliteration eliminan los rechazos y que tipo de contenido generan, en un entorno controlado y con supervision etica.
- Evaluacion de tecnicas de cuantizacion: comparar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en un modelo de 30 B permite calibrar el impacto de la cuantizacion en tareas de generacion libre, usando el repositorio imatrix como referencia.
- Pruebas de red teaming de pipelines: desplegar el modelo en un entorno aislado para evaluar si los filtros de salida de una aplicacion detectan contenido toxico o danino generado por un modelo sin alineamiento.
- Analisis de sesgos y toxicidad: generar grandes volumenes de texto con el modelo y pasarlos por clasificadores de toxicidad para estudiar la distribucion de contenido danino, como complemento a datasets de evaluacion de seguridad.
- Docencia en etica de la IA: usar el modelo como ejemplo practico de por que las licencias permisivas (Apache-2.0) no garantizan seguridad y de como se documentan (o no) los riesgos en las model cards.
- Experimentacion con inferencia local de modelos de 30 B: la cuantizacion Q4_K_M (18,8 GB) permite ejecutar el modelo en una GPU de consumo de 24 GB, lo que sirve para medir throughput y latencia de llama.cpp en hardware asequible.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni ninguna aplicacion orientada al usuario final, dado su caracter explicitamente danino y sin alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad, y el modelo base no aporta datos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,0 GB
  - Q3_K_S: ~13,9 GB
  - Q3_K_M: ~15,4 GB
  - Q3_K_L: ~16,7 GB
  - IQ4_XS: ~17,0 GB
  - Q4_K_S: ~17,9 GB
  - Q4_K_M: ~18,8 GB
  - Q5_K_S: ~21,4 GB
  - Q5_K_M: ~21,9 GB
  - Q6_K: ~25,3 GB
  - Q8_0: ~32,7 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) es suficiente para los pesos; para Q6_K y Q8_0 se necesita una A100 40 GB, H100 o similar, o bien repartir entre varias GPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto muy reducido, o mediante offload a CPU.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta tgi en el repo), y cualquier runtime compatible con GGUF. El formato mmproj requiere un runtime que soporte vision (por ejemplo, llama.cpp con soporte multimodal).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF | 30,7 B | No disponible | Apache-2.0 | GGUF en HF, 313 descargas | Sin alineamiento, etiquetado como toxico/danino |
| darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3 | 30,7 B | No disponible | Apache-2.0 | Safetensors en HF | Modelo base del anterior |
| mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-i1-GGUF | 30,7 B | No disponible | Apache-2.0 | GGUF imatrix en HF | Variante con cuantizacion ponderada, mayor calidad por tamano |
| Modelos densos de ~30 B alineados (familia generica) | ~30 B | Variable | Variable | Variable | No se dispone de datos concretos en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de datos de rendimiento del modelo en benchmarks, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se identifican en la informacion proporcionada alternativas directas con las mismas caracteristicas de "uncensored" y mismo tamano.

## Limitaciones y advertencias

- Modelo explicitamente etiquetado como "uncensored", "harmful", "toxic" y "abliterated": ha sido modificado para eliminar los rechazos de seguridad, por lo que puede generar contenido danino, ilegal o peligroso sin filtros.
- Riesgo elevado de alucinacion y de afirmaciones falsas, agravado por la falta de benchmarks y de documentacion sobre el entrenamiento.
- Sesgos desconocidos: no se documenta la composicion del dataset ni se han publicado evaluaciones de sesgo.
- Capacidad multilingue limitada al ingles; no se garantiza un comportamiento correcto en castellano.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones adicionales, lo que traslada toda la responsabilidad legal y etica al desplegador. Esta licencia no exime del cumplimiento de la legislacion aplicable (por ejemplo, normativa sobre contenido ilicito o sobre IA).
- El nombre del modelo ("CriminalComputing-EnablementEngine") sugiere un proposito deliberado de facilitar computacion delictiva; su uso en produccion o en servicios accesibles al publico es desaconsejable y potencialmente ilegal.
- El repositorio ocupa 213,9 GB, lo que exige planificar el almacenamiento antes de descargar; conviene descargar solo la cuantizacion necesaria.
- No se documenta soporte de tool calling ni de agentes; no debe asumirse su disponibilidad.
- La fecha de creacion (2026-08-17) y la de actualizacion (2026-10-11) son posteriores a la fecha actual de referencia de muchos lectores; verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/XORTRON-CriminalComputing-EnablementEngine-v0.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#XORTRON-CriminalComputing-EnablementEngine-v0.3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
