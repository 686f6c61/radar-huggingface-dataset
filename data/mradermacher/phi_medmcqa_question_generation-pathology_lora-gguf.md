# mradermacher/Phi_medmcqa_question_generation-pathology_lora-GGUF

## Resumen

`mradermacher/Phi_medmcqa_question_generation-pathology_lora-GGUF` es una coleccion de cuantizaciones GGUF del modelo `emilykang/Phi_medmcqa_question_generation-pathology_lora`, un ajuste fino (LoRA fusionado) sobre la familia Phi de Microsoft orientado a la generacion de preguntas de opcion multiple en el dominio de patologia medica. El modelo original fue entrenado con SFT mediante la libreria TRL sobre el dataset `generator`, y este repositorio lo empaqueta en formatos GGUF listos para inferencia en CPU o GPU con llama.cpp y herramientas compatibles.

El interes practico del modelo radica en su especializacion: en lugar de un asistente generalista, se trata de un generador de items tipo MedMCQA (preguntas con respuesta unica) restringido a contenido de patologia. Con 2.779.683.840 parametros (aproximadamente 2,8 mil millones), se situa en la gama pequena, lo que permite ejecutarlo en hardware consumer. El repositorio ofrece 12 variantes de cuantizacion desde Q2_K (1,2 GB) hasta f16 (5,7 GB), cubriendo el espectro entre despliegue de bajo consumo y maxima fidelidad numerica.

La relevancia actual es doble: por un lado, demuestra el flujo habitual de la comunidad open source (ajuste fino especializado, publicacion en HF, cuantizacion por terceros para facilitar el despliegue); por otro, ejemplifica el uso de modelos compactos para tareas acotadas de generacion de datos sinteticos o apoyo a la evaluacion educativa en ciencias de la salud. La licencia MIT facilita su reutilizacion, aunque el modelo base y los datos subyacentes imponen sus propias consideraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi; variante concreta no especificada en la informacion disponible) |
| Parametros totales | 2.779.683.840 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino por LoRA fusionado sobre un checkpoint de la familia Phi, entrenado con SFT (supervised fine-tuning) mediante la libreria TRL y etiquetado como `generated_from_trainer`. El dataset de entrenamiento es `generator`, cuyo contenido detallado no se especifica en la informacion disponible; por el nombre del modelo y la referencia a MedMCQA, cabe inferir que contiene pares de contexto y preguntas de opcion multiple de patologia, aunque la composicion exacta, el numero de tokens y el proceso de filtrado no estan documentados en la model card.

No se documenta en la informacion proporcionada si hubo RLHF, DPO u otras etapas de alineacion posteriores al SFT, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio de mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos del modelo original; adicionalmente existe una version con cuantizacion ponderada/imatrix en el repositorio `-i1-GGUF`, que suele ofrecer mejor relacion calidad/tamano en los niveles bajos.

## Capacidades

- Generacion de texto en ingles orientada a la creacion de preguntas de opcion multiple sobre patologia medica.
- Generacion de items tipo MedMCQA: enunciado de pregunta, opciones y respuesta correcta, segun el formato aprendido del dataset `generator`.
- Especializacion de dominio: contenido de patologia (frente a un asistente medico generalista).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun el campo `language` de la model card.
- No se documenta modo thinking, vision ni audio.

## Casos de uso

- Generacion de bancos de preguntas para docencia en patologia: el modelo produce items de opcion multiple a partir de contextos o temas, utiles para ampliar el material de practicas de asignaturas de medicina.
- Creacion de datos sinteticos para entrenamiento o evaluacion: al generar preguntas etiquetadas, sirve para aumentar datasets de QA medico en un dominio concreto sin coste de anotacion manual.
- Evaluacion de sistemas de QA medico: las preguntas generadas pueden emplearse como conjunto de prueba para medir la robustez de otros modelos en patologia.
- Prototipado rapido en entornos con hardware limitado: las cuantizaciones Q4_K_M (1,8 GB) permiten ejecutar el modelo en portatiles o GPUs de gama de entrada, facilitando experimentos locales.
- Investigacion sobre generacion controlada de items: permite estudiar la calidad, diversidad y sesgos de preguntas generadas automaticamente en un subcampo medico acotado.
- Integracion en pipelines educativos offline: al ser GGUF con licencia MIT, puede embeberse en aplicaciones de escritorio o servidores modestos para generar material de estudio bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto, valores orientativos):
  - Q2_K: ~1,2 GB de pesos; ~2-3 GB de VRAM en total.
  - Q4_K_M: ~1,8 GB de pesos; ~3-4 GB de VRAM en total.
  - Q8_0: ~3,1 GB de pesos; ~4-5 GB de VRAM en total.
  - f16: ~5,7 GB de pesos; ~7-8 GB de VRAM en total.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4; RTX 3060/4070 o superiores para Q8_0 y f16. En entornos de servidor, A100 o H100 no son necesarias dado el tamano del modelo, pero funcionarian sin problema.
- Cabe en GPU consumer: si, practicamente en todas las GPU con 4 GB o mas en cuantizaciones Q4; incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF (llama-cpp-python, llama-server). La model card indica `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (~2,8B parametros) se esperan decenas de tokens por segundo en GPU consumer y velocidades menores en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| Phi_medmcqa_question_generation-pathology_lora (este) | 2,78B | no disponible | Patologia / generacion de preguntas | MIT | GGUF, safetensors |
| Modelos Phi base (familia) | ~2,7B-3,8B | no disponible | Generalista | MIT (segun variante) | safetensors, GGUF |
| Alternativas especializadas en QA medico | no disponible | no disponible | Medico general | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks ni de modelos comparables documentados con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo especializado y de dominio estrecho: su uso fuera de la generacion de preguntas de patologia producira resultados degradados.
- Solo ingles: no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion clinica: las preguntas y respuestas generadas pueden contener errores medicos; no deben usarse como material clinico sin revision experta.
- Sesgos potenciales heredados del dataset `generator` y del modelo base Phi, cuya composicion no esta documentada en detalle.
- No se documenta el contexto maximo soportado; conviene limitar las entradas a longitudes moderadas y validar el comportamiento.
- Aunque la licencia del repositorio es MIT, deben revisarse las condiciones del modelo base (`emilykang/Phi_medmcqa_question_generation-pathology_lora`) y de los datos de entrenamiento antes de un uso comercial.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las preguntas generadas; se recomienda Q4_K_M o superior para produccion.
- No apto como dispositivo medico ni para decision clinica; su ambito es educativo y de investigacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Phi_medmcqa_question_generation-pathology_lora-GGUF
- Modelo base: https://huggingface.co/emilykang/Phi_medmcqa_question_generation-pathology_lora
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Phi_medmcqa_question_generation-pathology_lora-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Phi_medmcqa_question_generation-pathology_lora-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
