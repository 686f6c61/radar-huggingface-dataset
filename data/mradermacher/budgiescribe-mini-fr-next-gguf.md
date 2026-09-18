# mradermacher/BudgieScribe-Mini-fr-next-GGUF

## Resumen

BudgieScribe-Mini-fr-next-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher (nethype GmbH) a partir del modelo base flowcorp-ch/BudgieScribe-Mini-fr-next. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion de pesos a cuantizaciones estaticas de distinta precision para facilitar la inferencia en CPU y GPU de gama baja mediante llama.cpp y sus derivados. El modelo subyacente tiene 1.720.574.976 parametros (aproximadamente 1,72 mil millones) y esta etiquetado como conversacional.

La relevancia de este tipo de publicacion es practica: el repositorio ofrece doce variantes de cuantizacion que van desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite desplegar el modelo en hardware muy modesto, incluidos equipos sin GPU dedicada. El repositorio no incluye informacion sobre arquitectura, datos de entrenamiento, longitud de contexto ni resultados de benchmarks; la model card se limita a describir el proceso de cuantizacion.

Conviene senalar dos aspectos que limitan su evaluacion: la licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido, y el modelo base no cuenta con documentacion publica accesible en la informacion proporcionada. Ademas, aunque el nombre del modelo incluye "fr", la unica etiqueta de idioma declarada es "en".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.720.574.976 (aproximadamente 1,72 mil millones) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles); el nombre del modelo incluye "fr" pero no hay etiqueta que declare frances |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |
| Tamano del repositorio | 16,0 GB |
| Cuantizador | mradermacher (nethype GmbH) |
| Modelo base | flowcorp-ch/BudgieScribe-Mini-fr-next |
| Fecha de creacion | 2026-09-18 |
| Fecha de actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo base en la documentacion disponible. El repositorio es exclusivamente una conversion de pesos a GGUF, por lo que no aporta detalles sobre el tipo de red (transformer, MoE, SSM o hibrida), el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o ajuste por instrucciones. La unica informacion estructural inferible es el recuento de parametros (1,72 mil millones) y la etiqueta "conversational" aplicada al modelo, que sugiere un ajuste orientado a dialogo.

En cuanto a la innovacion tecnica del repositorio, esta se limita al proceso de cuantizacion: se han generado cuantizaciones estaticas (sin calibracion mediante imatrix) en doce precisiones distintas. La model card indica explicitamente que no se han publicado cuantizaciones ponderadas o con imatrix en el momento de la publicacion, y que el autor no tiene previsto generarlas salvo peticion expresa en la seccion de discusiones de la comunidad. La grafica de perplejidad referenciada por el autor (elaborada por ikawrakow) es la recomendacion habitual para elegir entre tipos de cuantizacion de baja precision.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", lo que indica un ajuste para mantener dialogos multi-turno.
- Compatibilidad con endpoints: incluye la etiqueta endpoints_compatible y la libreria declarada es transformers, lo que facilita su integracion en infraestructuras de inferencia estandar.
- Inferencia en CPU y GPU: el formato GGUF permite ejecucion en llama.cpp y herramientas derivadas, con soporte para descarga parcial de capas a GPU.
- Capacidades multilingues: solo se declara ingles. No hay evidencia de soporte funcional de frances pese al sufijo "fr" del nombre.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (vision, audio, modo thinking): no disponible; no se documenta ninguna.

## Casos de uso

- Prototipado local en equipos sin GPU: con la cuantizacion Q4_K_M (1,2 GB) el modelo puede ejecutarse integramente en CPU sobre un portatil convencional, lo que permite validar ideas de producto conversacional sin coste de infraestructura en la nube.
- Asistentes conversacionales embebidos: el etiquetado "conversational" y su tamano reducido lo hacen apto para integrarse en aplicaciones de escritorio o moviles mediante llama.cpp, gestionando dialogos de baja complejidad.
- Procesamiento por lotes en servidores modestos: la variante Q8_0 (1,9 GB) permite cargar varias instancias en una sola GPU de 8 GB, lo que resulta util para tareas de clasificacion, resumen o reescritura a gran volumen.
- Filtrado y preprocesado de texto en pipelines de datos: puede emplearse como modelo auxiliar para normalizar, etiquetar o limpiar corpus antes de alimentar un modelo mayor, aprovechando su bajo coste por token.
- Evaluacion comparativa de cuantizaciones: el repositorio es un banco de pruebas ideal para medir el impacto de Q2_K, IQ4_XS, Q4_K_M o Q8_0 en la calidad de salida sobre un mismo modelo base.
- Despliegue en entornos con restricciones de memoria: la variante Q2_K (0,9 GB) permite inferencia en dispositivos con menos de 1,5 GB de RAM disponible, como sistemas embebidos de gama alta o contenedores con limites estrictos.
- Generacion de texto en ingles para documentacion tecnica: dado que el unico idioma declarado es el ingles, encaja en tareas de redaccion asistida o generacion de borradores en ese idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se aportan mediciones de perplejidad propias para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + sobrecarga de contexto, valores orientativos):
  - Q2_K (0,9 GB de fichero): aproximadamente 1,2-1,5 GB
  - Q3_K_M (1,0 GB): aproximadamente 1,4-1,7 GB
  - IQ4_XS (1,1 GB): aproximadamente 1,5-1,8 GB
  - Q4_K_M (1,2 GB): aproximadamente 1,6-2,0 GB
  - Q5_K_M (1,4 GB): aproximadamente 1,8-2,2 GB
  - Q6_K (1,5 GB): aproximadamente 1,9-2,4 GB
  - Q8_0 (1,9 GB): aproximadamente 2,4-3,0 GB
  - f16 (3,5 GB): aproximadamente 4,0-5,0 GB
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores. Las GPU de datacenter (A100, H100) son innecesarias para este tamano y solo tendrian sentido para servir muchas instancias en paralelo.
- Compatibilidad con GPU de consumo: si, el modelo cabe holgadamente en cualquier GPU de consumo actual, incluso en las mas modestas, y puede ejecutarse en su totalidad en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y servidores compatibles con la API de llama.cpp. La etiqueta endpoints_compatible sugiere compatibilidad con infraestructuras de endpoints gestionados.
- Latencia y throughput estimados: no disponible; el repositorio no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| BudgieScribe-Mini-fr-next-GGUF | 1,72 mil millones | no disponible | no disponible | GGUF en HuggingFace | no publicados |
| Qwen2.5-1.5B | 1,54 mil millones | 32.768 tokens (nativo) | Apache 2.0 (segun version) | safetensors, GGUF, multiples | publicados por el autor |
| Llama 3.2 1B | 1,24 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF, multiples | publicados por el autor |
| SmolLM2-1.7B | 1,71 mil millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF, multiples | publicados por el autor |
| Gemma 2 2B | 2,61 mil millones | 8.192 tokens | Terminos de uso de Gemma | safetensors, GGUF, multiples | publicados por el autor |

La comparacion directa de rendimiento no es posible porque BudgieScribe-Mini-fr-next no publica benchmarks. En terminos de tamano, se situa en la misma franja que SmolLM2-1.7B y Qwen2.5-1.5B. La principal desventaja frente a estas alternativas es la ausencia de licencia declarada y de documentacion tecnica, que en la practica complica su adopcion en entornos profesionales.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no es posible determinar si el uso comercial esta permitido. Se desaconseja su integracion en productos en produccion hasta aclarar este punto.
- Ausencia de benchmarks: no hay ninguna metrica publicada que permita estimar su calidad frente a alternativas de tamano similar.
- Idiomas: la unica etiqueta de idioma es "en". El sufijo "fr" del nombre no se corresponde con una declaracion de soporte de frances, por lo que el rendimiento en ese idioma es incierto.
- Riesgo de alucinacion: es previsible en un modelo de 1,72 mil millones de parametros, especialmente en tareas de conocimiento factual, matematicas y razonamiento encadenado. No hay evaluaciones que cuantifiquen este riesgo.
- Sesgos: no disponible; no se documenta la composicion del dataset de entrenamiento ni los procesos de alineacion aplicados.
- Longitud de contexto desconocida: sin este dato no es posible planificar aplicaciones que dependan de ventanas largas ni estimar el consumo de memoria de la cache KV.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K introducen degradacion de calidad apreciable; la propia model card marca Q3_K_M como "lower quality". Para uso serio se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: la model card indica que no hay cuantizaciones ponderadas disponibles, lo que reduce la calidad relativa de las variantes de baja precision frente a las generadas con calibracion.
- Sin validacion de la comunidad: el repositorio registra cero descargas y cero "me gusta", por lo que no existe retroalimentacion de terceros sobre su comportamiento real.
- Procedencia del modelo base: no hay informacion publica disponible sobre el entrenamiento de flowcorp-ch/BudgieScribe-Mini-fr-next, lo que impide auditar los datos utilizados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/BudgieScribe-Mini-fr-next-GGUF
- Modelo base: https://huggingface.co/flowcorp-ch/BudgieScribe-Mini-fr-next
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#BudgieScribe-Mini-fr-next-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
