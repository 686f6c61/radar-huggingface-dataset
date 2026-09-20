# mradermacher/ZTC-Judge-27B-GGUF

## Resumen

ZTC-Judge-27B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo FINAL-Bench/ZTC-Judge-27B, publicado por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El modelo base cuenta con 27.320.697.856 parámetros (unos 27,3 mil millones) y está orientado, según las etiquetas declaradas en el repositorio, a tareas de verificación de respuestas, detección de alucinaciones y estimación de confianza ("zero-token").

El interés práctico de este repositorio no reside en un modelo nuevo, sino en la disponibilidad de hasta once niveles de cuantización estática que permiten ejecutar un modelo de 27B en hardware muy diverso, desde GPUs de consumo con 12-16 GB de VRAM (Q2_K, Q3_K_S) hasta configuraciones profesionales con Q8_0. Todos los ficheros se distribuyen bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales sin restricciones adicionales.

La información publicada es, sin embargo, muy escasa: la model card del repositorio se limita a listar los ficheros GGUF generados y a remitir a la página del modelo base, sin detallar arquitectura, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks. Esta ficha refleja por tanto únicamente los datos verificables disponibles y marca explícitamente como "no disponible" todo aquello que no se ha podido confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (≈27,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Modelo base | FINAL-Bench/ZTC-Judge-27B |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 189,2 GB |
| Libreria declarada | transformers |
| Etiquetas funcionales | ztc, answer-verification, hallucination-detection, zero-token, confidence-estimation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en los datos disponibles. El repositorio de cuantizacion no incluye detalles sobre si se trata de un transformer denso, una arquitectura MoE, un modelo hibrido o cualquier otra variante, ni sobre el numero de capas, dimensiones ocultas, tipo de atencion o estrategia de tokenizacion. El unico dato estructural confirmado es el recuento de parametros (27.320.697.856) y el hecho de que el modelo base se distribuye en safetensors y es compatible con la libreria transformers.

Tampoco hay informacion sobre el proceso de entrenamiento: se desconoce el volumen de tokens utilizados, la composicion del dataset, la posible aplicacion de RLHF, DPO u otras tecnicas de alineacion, y si existio una fase especifica de ajuste para las tareas de verificacion de respuestas y deteccion de alucinaciones que sugieren las etiquetas del repositorio. El termino "zero-token" que aparece entre las etiquetas no viene acompanado de documentacion tecnica en la informacion disponible, por lo que no es posible confirmar a que mecanismo concreto se refiere. La innovacion tecnica de este repositorio se limita, por tanto, al propio proceso de cuantizacion: cuantizaciones estaticas generadas con convert_type hf y output_tensor_quantised, sin versiones ponderadas ni imatrix (el autor indica que no estan disponibles en el momento de la publicacion).

## Capacidades

- Verificacion de respuestas: las etiquetas del repositorio (`answer-verification`) indican que el modelo esta orientado a evaluar si una respuesta dada es correcta respecto a una referencia o a un contexto.
- Deteccion de alucinaciones: la etiqueta `hallucination-detection` sugiere capacidad para senalar afirmaciones no sustentadas por la evidencia proporcionada.
- Estimacion de confianza: la etiqueta `confidence-estimation` apunta a la produccion de una medida de confianza o incertidumbre sobre la respuesta evaluada.
- Modo "zero-token": etiqueta declarada por el autor cuya implementacion concreta no esta documentada en la informacion disponible.
- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, lo que indica compatibilidad con plantillas de dialogo.
- Multilingue limitado: cobertura declarada de ingles y coreano unicamente.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de vision, audio o modo de razonamiento explicito: no disponible (no documentado).

## Casos de uso

- Verificacion automatica de respuestas en pipelines RAG: el modelo puede actuar como juez que compara la respuesta generada por un LLM con los fragmentos recuperados, marcando como no verificables aquellas afirmaciones sin respaldo documental, lo que permite filtrar salidas antes de mostrarlas al usuario final.
- Filtro anti-alucinacion en atencion al cliente: integrado como segunda etapa despues del modelo generativo, revisa cada respuesta antes de enviarla y bloquea o reescribe aquellas con contenido no sustentado, reduciendo el riesgo de compromisos incorrectos con el cliente.
- LLM-as-a-judge en evaluacion de modelos: uso del modelo como evaluador automatico en experimentos comparativos, puntuando respuestas de distintos candidatos sobre un mismo conjunto de preguntas y sustituyendo parte de la evaluacion humana en iteraciones rapidas.
- Curaccion y limpieza de datasets: revision de pares pregunta-respuesta generados sinteticamente para descartar ejemplos incoherentes o factualmente erroneos antes de incorporarlos a un corpus de ajuste fino.
- Moderacion de contenido factual en foros o plataformas: deteccion de afirmaciones potencialmente falsas en textos enviados por usuarios, con estimacion de confianza para priorizar la revision humana en los casos dudosos.
- Despliegue on-premise en entornos regulados: al distribuirse en GGUF y bajo Apache 2.0, puede ejecutarse en infraestructura propia sin conexion a Internet, lo que encaja en sectores con requisitos de soberania de datos (sanidad, banca, sector publico).
- Evaluacion de traducciones ingles-coreano: dado el soporte declarado de ambos idiomas, puede verificar la fidelidad de traducciones entre en y ko como parte de un flujo de control de calidad linguistico.
- Servicio de arbitraje en comparaciones ciegas: en plataformas de evaluacion de modelos, decidir cual de dos respuestas es mas fiable respecto a una fuente dada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas (MMLU, HumanEval, GSM8K ni ninguna otra), y el autor remite al modelo base sin aportar cifras. Tampoco se han facilitado datos de perplejidad por nivel de cuantizacion; el unico material grafico referenciado es un grafico generico de comparacion de perplejidad entre tipos de cuantizacion (enlace en la seccion final), no especifico de este modelo.

## Requisitos de hardware

Los tamanos de fichero son datos confirmados por el autor. Las estimaciones de VRAM anaden un margen orientativo para el contexto y el estado de la KV cache, y deben considerarse aproximadas.

- Q2_K (11,0 GB): viable en GPUs de consumo de 12 GB (RTX 3060 12 GB, RTX 4070) con contexto corto.
- Q3_K_S (12,4 GB) y Q3_K_M (13,6 GB): viables en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con contexto moderado.
- Q3_K_L (14,7 GB) e IQ4_XS (15,5 GB): entorno de 16-24 GB de VRAM.
- Q4_K_S (15,9 GB) y Q4_K_M (16,9 GB): las cuantizaciones recomendadas por el autor por su equilibrio velocidad/calidad; requieren del orden de 18-20 GB de VRAM contando contexto, por lo que encajan en RTX 4090 de 24 GB.
- Q5_K_S (19,1 GB) y Q5_K_M (19,6 GB): 22-24 GB de VRAM, ajustadas en una RTX 4090 y comodas en A100 40 GB o L40S.
- Q6_K (22,5 GB): requiere 24 GB o mas; recomendable en A100 40 GB, H100 o similar.
- Q8_0 (29,1 GB): la de mayor calidad; necesita 32 GB o mas de VRAM (A100 40 GB, H100 80 GB) o ejecucion parcial en CPU.
- Cabe en GPU de consumo: si, hasta Q5_K_M en una RTX 4090 de 24 GB y hasta Q3_K_M en tarjetas de 16 GB.
- Ejecucion en CPU: posible con llama.cpp y Ollama usando memoria del sistema; con 27B de parametros el rendimiento sera de pocos tokens por segundo en CPU convencional y dependera del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier servidor compatible con GGUF (llama-cpp-python). vLLM y TGI no consumen GGUF de forma nativa; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento fiable. La unica comparacion verificable es entre este repositorio y su modelo base:

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Contexto | Benchmarks |
|---|---|---|---|---|---|---|
| mradermacher/ZTC-Judge-27B-GGUF | 27.320.697.856 | GGUF | 11 niveles (Q2_K a Q8_0) | apache-2.0 | no disponible | no disponible |
| FINAL-Bench/ZTC-Judge-27B (base) | 27.320.697.856 | safetensors | precision completa (fp16/bf16) | apache-2.0 | no disponible | no disponible |

Alternativas de la misma categoria (por ejemplo, otros modelos juez o clasificadores de alucinacion del rango 7B-30B): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo del modelo base ni de sus cuantizaciones.
- Riesgo de alucinacion: el propio modelo esta disenado, segun sus etiquetas, para detectar alucinaciones, pero no existe documentacion que garantice su fiabilidad como juez; un verificador tambien puede producir falsos positivos y falsos negativos, por lo que no deberia utilizarse como unica barrera en produccion sin validacion previa sobre datos propios.
- Perdida de calidad por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad de forma notable. El autor solo etiqueta como "lower quality" explicitamente Q3_K_M y recomienda Q4_K_S/Q4_K_M como opcion rapida y Q8_0 como mejor calidad; la calidad de las cuantizaciones IQ depende del tipo de capa.
- Idiomas: cobertura declarada unicamente de ingles y coreano. El castellano no figura entre los idiomas soportados, por lo que su uso en espanol no esta respaldado por la documentacion y puede degradar la calidad de la verificacion.
- Limitaciones de contexto: no disponible. Se desconoce la ventana maxima, dato critico para tareas de verificacion sobre documentos largos.
- Licencia: Apache 2.0, permisiva para uso comercial. No obstante, la licencia del modelo base deberia confirmarse de forma independiente antes de un despliegue en produccion, ya que el repositorio cuantizado solo hereda la declaracion del autor de la cuantizacion.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, publicado y actualizado el mismo dia; no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Compatibilidad: los ficheros GGUF no funcionan en vLLM o TGI sin conversion adicional. Para estos motores hay que recurrir al modelo base en safetensors.
- Cuantizaciones ponderadas o imatrix no disponibles: el autor indica que no existen en el momento de la publicacion.
- Sin model card detallada del modelo base en la informacion proporcionada: se desconocen arquitectura, datos de entrenamiento y metodologia de evaluacion, lo que limita cualquier analisis de riesgos mas profundo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZTC-Judge-27B-GGUF
- Modelo base: https://huggingface.co/FINAL-Bench/ZTC-Judge-27B
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#ZTC-Judge-27B-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de TheBloke, referenciado por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de perplejidad entre cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/
- Paper, blog o demo oficial del modelo: no disponible. La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo.
