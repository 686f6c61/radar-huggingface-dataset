# mradermacher/Bio-Medical-3B-CoT-012025-GGUF

## Resumen

Bio-Medical-3B-CoT-012025-GGUF es la version cuantizada en formato GGUF del modelo ContactDoctor/Bio-Medical-3B-CoT-012025, un modelo de lenguaje especializado en dominio biomedico y sanitario con capacidad de razonamiento en cadena de pensamiento (chain-of-thought). Lo desarrolla el usuario ContactDoctor y lo cuantiza mradermacher, un conocido distribuidor de cuantizaciones GGUF para llama.cpp. El modelo resuelve el problema de disponer de un asistente medico conversacional de tamano reducido (unos 3.085 millones de parametros) que pueda ejecutarse en hardware modesto.

La relevancia de esta publicacion radica en la combinacion de tres factores: especializacion en dominio sanitario (entrenado sobre el dataset collaiborateorg/BioMedData), soporte explicito de razonamiento paso a paso mediante chain-of-thought, y disponibilidad en cuantizaciones que van desde 1,4 GB (Q2_K) hasta 6,3 GB (f16), lo que permite desplegarlo en GPUs de consumo e incluso en CPU. Es un modelo unicamente en ingles y con licencia "other", lo que exige revisar los terminos del modelo base antes de cualquier uso comercial.

La ficha describe tanto las caracteristicas del modelo base como las particularidades de esta distribucion cuantizada, incluyendo los tipos de cuantizacion disponibles y sus implicaciones practicas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de transformers; se desconoce la arquitectura exacta declarada) |
| Parametros totales | 3.085.387.776 (3,09 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (tambien disponibles cuantizaciones con imatrix en el repo i1) |
| Idiomas soportados | ingles (en) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se cargo mediante la libreria transformers y que fue generado con `generated_from_trainer`. Se trata de un modelo de 3,09 mil millones de parametros, entrenado sobre el dataset collaiborateorg/BioMedData y etiquetado como modelo medico y de ciencias de la salud. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla del entrenamiento supervisado implicito en `generated_from_trainer`.

La innovacion tecnica destacable es la incorporacion de chain-of-thought (CoT) como parte del nombre y de las etiquetas del modelo, lo que indica que fue entrenado o ajustado para producir razonamientos intermedios antes de la respuesta final, un enfoque util en dominios donde la trazabilidad del razonamiento importa, como el sanitario. Esta distribucion concreta no aporta cambios arquitectonicos: es una conversion a GGUF del modelo original, con cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional en ingles con especializacion en dominio biomedico y sanitario.
- Razonamiento en cadena de pensamiento (chain-of-thought): el modelo esta disenado para exponer pasos intermedios de razonamiento antes de la respuesta final.
- Respuesta a preguntas de caracter medico y de ciencias de la salud dentro del alcance del dataset de entrenamiento.
- Formato conversacional (etiqueta `conversational`), apto para dialogos multi-turno.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: parcial, limitado al chain-of-thought interno; no se documenta orquestacion de herramientas.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles salvo el propio chain-of-thought.

## Casos de uso

- Asistente de consulta medica preliminar: el modelo puede mantener conversaciones multi-turno en ingles sobre sintomas, terminologia clinica y conceptos biomedicos, apoyandose en su especializacion de dominio para ofrecer respuestas contextualizadas; el chain-of-thought permite mostrar el razonamiento al usuario o al revisor.
- Formacion y educacion sanitaria: util para generar explicaciones paso a paso de conceptos medicos, fisiopatologia o farmacologia, donde el razonamiento explicito ayuda al estudiante a seguir la logica.
- Triaje conversacional en ingles: integrado en un chatbot de preevaluacion, puede recoger informacion estructurada del paciente y razonar sobre la urgencia relativa, siempre con supervision humana y sin sustituir el juicio clinico.
- Resumen y reescritura de textos biomedicos: dado su entrenamiento en BioMedData, puede condensar articulos o notas clinicas en ingles manteniendo terminologia especializada.
- Despliegue en entornos con hardware limitado: gracias a las cuantizaciones Q4_K_M (2,0 GB) o Q5_K_M (2,3 GB), puede ejecutarse en portatiles con GPU de consumo o incluso en CPU mediante llama.cpp, lo que facilita prototipos y demos locales sin infraestructura cloud.
- Investigacion sobre razonamiento en dominio medico: el formato CoT y las multiples cuantizaciones permiten estudiar como la precision de cuantizacion afecta a la calidad del razonamiento paso a paso, comparando Q2_K frente a Q8_0 o f16.
- Generacion de documentacion clinica asistida: borradores de informes o notas en ingles que requieran estructura razonada, con revision posterior obligatoria por personal sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de cada cuantizacion mas overhead de contexto): Q2_K ~1,4 GB; Q3_K_M ~1,7 GB; Q4_K_M ~2,0 GB; Q5_K_M ~2,3 GB; Q6_K ~2,6 GB; Q8_0 ~3,4 GB; f16 ~6,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4070 o superiores son suficientes para las cuantizaciones recomendadas. Para f16 se recomienda al menos 8 GB de VRAM (RTX 3070/4060 Ti en adelante). A100 o H100 no son necesarias para un modelo de 3 B, pero permitirian mayor throughput y contextos largos.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM usando Q4_K_M o Q5_K_M; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de OpenAI a traves de llama.cpp. vLLM y TGI no son el formato nativo de estos pesos (requieren el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Bio-Medical-3B-CoT-012025-GGUF (este) | 3,09 B | no disponible | en | other | GGUF | Especializado en dominio biomedico con CoT |
| ContactDoctor/Bio-Medical-3B-CoT-012025 (base) | 3,09 B | no disponible | en | other | safetensors | Modelo original sin cuantizar |
| Bio-Medical-3B-CoT-012025-i1-GGUF (mradermacher) | 3,09 B | no disponible | en | other | GGUF (imatrix) | Variante con cuantizaciones ponderadas/imatrix, potencialmente mejor calidad por tamano |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo unicamente en ingles: no soporta castellano ni otros idiomas de forma fiable.
- Licencia "other": es imprescindible revisar los terminos del modelo base ContactDoctor/Bio-Medical-3B-CoT-012025 antes de cualquier uso comercial o redistribucion; la licencia no es estandar (no es Apache, MIT ni Llama).
- Riesgo de alucinacion elevado en dominio medico: como cualquier LLM de 3 B, puede generar informacion clinica incorrecta con apariencia de verosimilitud; no debe usarse como sustituto del juicio medico profesional.
- Sesgos conocidos: no documentados en la informacion disponible, pero el dataset BioMedData puede introducir sesgos de poblacion, geografia o practica clinica.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con documentos largos.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad del razonamiento chain-of-thought; para uso serio se recomienda Q4_K_M o superior.
- El modelo esta etiquetado como `generated_from_trainer`, sin documentacion publica de la composicion exacta del dataset ni del proceso de alineacion.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling.
- Uso en produccion sanitaria: requiere validacion clinica, supervision humana, trazabilidad de respuestas y cumplimiento normativo (por ejemplo, regulacion de dispositivos medicos), ninguno de los cuales cubre el modelo por si mismo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Bio-Medical-3B-CoT-012025-GGUF
- Modelo base: https://huggingface.co/ContactDoctor/Bio-Medical-3B-CoT-012025
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/Bio-Medical-3B-CoT-012025-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Bio-Medical-3B-CoT-012025-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/collaiborateorg/BioMedData
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
