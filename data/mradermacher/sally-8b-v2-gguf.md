# mradermacher/Sally-8B-v2-GGUF

## Resumen

Sally-8B-v2-GGUF es la distribucion en formato GGUF del modelo Sally-8B-v2, un modelo de lenguaje de 8.190.735.360 parametros publicado por el usuario Juicesyo y cuantizado por mradermacher. Se trata de una conversión estática (sin imatrix) pensada para inferencia local eficiente mediante llama.cpp y herramientas compatibles, lo que permite ejecutar el modelo en hardware de consumo con requisitos de VRAM moderados.

El modelo se etiqueta como derivado de la familia Qwen3 (tag `qwen3` en la model card) y está orientado a generación de texto conversacional. Su licencia Apache 2.0 facilita el uso comercial y la modificacion, y el repositorio incluye un espectro amplio de cuantizaciones que van desde Q2_K (3,4 GB) hasta f16 (16,5 GB), cubriendo distintos equilibrios entre calidad y huella de memoria.

La relevancia actual de esta ficha radica en que ofrece una via practica para desplegar un modelo de 8B en entornos con recursos limitados, con opciones recomendadas por el propio autor (Q4_K_S y Q4_K_M como "rapidas y recomendadas", Q8_0 como "mejor calidad"). No obstante, la informacion publicada sobre arquitectura detallada, datos de entrenamiento y benchmarks es muy escasa, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3, segun tag de la model card); detalles no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | zh (chino), segun metadatos de la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato transformers |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta `qwen3` y del tag `unsloth`, que sugiere que el modelo base pudo haberse entrenado o ajustado con herramientas de Unsloth. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion, ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El recuento de parametros (8.190.735.360) es consistente con un modelo denso de aproximadamente 8B.

Tampoco se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion estatica (sin quants ponderadas por imatrix en el momento de la publicacion) y a enlazar el modelo base `Juicesyo/Sally-8B-v2`. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de esto seria especulativa.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la libreria `text-generation-inference` indican uso previsto para dialogos multi-turno.
- Generacion de texto general en chino (`zh` es el unico idioma declarado en los metadatos).
- Compatibilidad con el ecosistema transformers y con text-generation-inference a traves del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara chino; no se confirma soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en chino desplegado en local: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,9 y 5,1 GB), el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo, ofreciendo un chatbot en chino sin dependencia de la nube.
- Prototipado rapido de aplicaciones de texto: la disponibilidad de cuantizaciones desde Q2_K (3,4 GB) permite iterar en portatiles con poca VRAM antes de escalar a un despliegue mayor.
- Evaluacion comparativa de modelos de 8B: al ser un modelo derivado de Qwen3 con licencia Apache 2.0, sirve como referencia en pruebas internas de calidad frente a otros modelos de tamano similar.
- Integracion en pipelines de generacion de texto con llama.cpp: el formato GGUF y la variedad de quants facilitan su inclusion en herramientas como llama.cpp, Ollama o servidores compatibles con GGUF.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite su uso comercial y la modificacion del modelo sin las restricciones de licencias copyleft.
- Experimentacion academica sobre cuantizacion: la tabla de quants del autor (con notas de calidad como "lower quality" para Q3_K_M o "very good quality" para Q6_K) permite estudiar el impacto de la cuantizacion en la perplejidad y la calidad de salida.
- Generacion de texto en chino para tareas de resumen o redaccion: siempre que se valide la calidad en el dominio concreto, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de fichero del repositorio):
  - Q2_K: 3,4 GB
  - Q3_K_S: 3,9 GB
  - Q3_K_M: 4,2 GB (calidad inferior segun el autor)
  - Q3_K_L: 4,5 GB
  - IQ4_XS: 4,7 GB
  - Q4_K_S: 4,9 GB (rapida, recomendada)
  - Q4_K_M: 5,1 GB (rapida, recomendada)
  - Q5_K_S: 5,8 GB
  - Q5_K_M: 6,0 GB
  - Q6_K: 6,8 GB (muy buena calidad)
  - Q8_0: 8,8 GB (rapida, mejor calidad)
  - f16: 16,5 GB (16 bpw, "overkill" segun el autor)
- GPU recomendadas: no especificadas por el autor. Por tamano de fichero, las cuantizaciones Q4 caben en GPUs de consumo con 8 GB de VRAM; Q8_0 requiere al menos 10-12 GB; f16 requiere 24 GB o mas.
- Cabe en GPU de consumo: si, en modelos como RTX 3060/4060 (8-12 GB) con quants Q4-Q5, y en RTX 4090 (24 GB) incluso con f16.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con GGUF; el modelo base es compatible con transformers y text-generation-inference.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sally-8B-v2-GGUF | 8.190.735.360 | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas de Q2_K a f16; idioma declarado: chino |
| Modelo base Juicesyo/Sally-8B-v2 | 8.190.735.360 | no disponible | Apache 2.0 | transformers | Origen de las cuantizaciones; sin benchmarks publicados en la informacion disponible |
| Alternativas Qwen3 de ~8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Ausencia de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones conversacionales que permitan estimar la calidad real del modelo.
- Idioma limitado: los metadatos solo declaran chino (`zh`); el rendimiento en castellano u otros idiomas no esta verificado y podria ser deficiente.
- Contexto desconocido: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no hay evaluaciones de fidelidad publicadas.
- Cuantizaciones de baja calidad: el propio autor marca Q3_K_M como "lower quality"; Q2_K y Q3_K_S pueden degradar notablemente la calidad. Se recomienda Q4_K_M o superior para produccion.
- Sin quants ponderadas por imatrix: el autor indica que no estan disponibles en el momento de la publicacion, lo que puede suponer una ligera perdida de calidad frente a quants imatrix equivalentes.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento originales, no detalladas.
- Modelo derivado de Qwen3: la calidad final depende del ajuste realizado por Juicesyo sobre el modelo base, del que no se publican detalles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sally-8B-v2-GGUF
- Modelo base: https://huggingface.co/Juicesyo/Sally-8B-v2
- Pagina de vision general del autor: https://hf.tst.eu/model#Sally-8B-v2-GGUF
- FAQ y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
