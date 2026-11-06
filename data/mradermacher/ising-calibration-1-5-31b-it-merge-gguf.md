# mradermacher/Ising-Calibration-1.5-31B-it-merge-GGUF

## Resumen

Ising-Calibration-1.5-31B-it-merge es un modelo de lenguaje conversacional de aproximadamente 30.700 millones de parametros, publicado por el usuario tergite en Hugging Face y cuantizado a formato GGUF por mradermacher. El nombre y las etiquetas del repositorio (Ising Calibration, quantum, calibration, merge, task-arithmetic) sugieren que se trata de un merge de modelos mediante aritmetica de tareas orientado a tareas de calibracion, aunque la model card no documenta el proceso de entrenamiento ni los modelos de origen. La unica informacion disponible sobre el modelo base es su identificador en Hugging Face y el recuento real de parametros en safetensors.

La relevancia practica de este repositorio reside en que ofrece cuantizaciones GGUF estaticas del modelo original, lo que permite ejecutarlo en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio incluye tambien ficheros mmproj (Q8_0 y f16), lo que indica que el modelo incorpora capacidades multimodales (vision) en el modelo original, aunque no se detalla su alcance.

No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento, el proceso de alineacion (RLHF/DPO) ni resultados de benchmarks. La licencia declarada es openmdw-1.1, con el campo license marcado como "other" en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; se desconoce si es densa o MoE) |
| Parametros totales | 30.697.345.596 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 (campo license: other en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tergite/Ising-Calibration-1.5-31B-it-merge). El identificador y las etiquetas indican que se trata de un merge de modelos realizado mediante task arithmetic, una tecnica que combina los pesos de varios modelos ajustados para tareas distintas con el fin de obtener un modelo unico que conserve capacidades de cada uno. El sufijo "it" sugiere un ajuste instruccional, y la presencia de ficheros mmproj en las cuantizaciones indica que el modelo incorpora un proyector multimodal, presumiblemente para entrada de imagenes.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La model card del repositorio GGUF es una plantilla generica de mradermacher que solo documenta el proceso de cuantizacion estatica, no el entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y el sufijo "it" del modelo.
- Procesamiento multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imagenes en el modelo original, aunque no se detalla la tarea concreta (VQA, captioning, OCR, etc.).
- Ajuste instruccional: el modelo esta disenado para seguir instrucciones en formato de chat.
- Capacidades de calibracion: las etiquetas "Ising Calibration" y "calibration" sugieren un enfasis en tareas de calibracion, aunque no se especifica que tipo (calibracion de incertidumbre, calibracion de modelos, calibracion en fisica cuantica, etc.).
- No se ha documentado soporte de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode).
- Multilingue: solo se declara ingles.

## Casos de uso

- Experimentacion con merges de modelos: el repositorio permite descargar el modelo cuantizado en distintos niveles (Q2_K a Q8_0) para evaluar el comportamiento de un merge por task arithmetic sin necesidad de disponer del modelo original en precision completa.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (18,8 GB) permite ejecutar un modelo de 30.700 millones de parametros en GPUs con 24 GB de VRAM, como la RTX 4090, mediante llama.cpp.
- Prototipado de asistentes conversacionales en ingles: el formato instruccional y la etiqueta "conversational" lo hacen adecuado para experimentar con dialogos multi-turno, siempre que se valide la calidad real del merge.
- Evaluacion de capacidades multimodales: los ficheros mmproj permiten probar entrada de imagenes en llama.cpp con el soporte multimodal correspondiente, util para comparar el comportamiento del merge frente a los modelos de origen.
- Investigacion sobre calibracion: dado el nombre del modelo, puede emplearse como banco de pruebas en experimentos de calibracion de incertidumbre o de comportamiento en dominios cientificos, aunque no hay documentacion que lo respalde.
- Fine-tuning sobre el modelo base: al estar disponible el modelo original en safetensors (30.700 millones de parametros), es posible aplicar LoRA o QLoRA para adaptarlo a dominios especificos, partiendo de las cuantizaciones para estimar requisitos de hardware.
- Inferencia en CPU o entornos con poca VRAM: las cuantizaciones Q2_K (12,0 GB) y Q3_K_S (13,9 GB) permiten ejecucion parcial en CPU con llama.cpp, a costa de una perdida de calidad no documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 12,0 GB
  - Q3_K_S: 13,9 GB
  - Q3_K_M: 15,4 GB
  - Q3_K_L: 16,7 GB
  - Q4_K_S: 17,9 GB
  - Q4_K_M: 18,8 GB
  - Q5_K_S: 21,4 GB
  - Q5_K_M: 21,9 GB
  - Q6_K: 25,3 GB
  - Q8_0: 32,7 GB
  - mmproj-Q8_0: 0,9 GB adicionales (solo si se usa entrada multimodal)
  - mmproj-f16: 1,3 GB adicionales (solo si se usa entrada multimodal)
- GPU recomendadas: para Q4_K_M y superiores, una RTX 4090 (24 GB) o A100/H100 de 40-80 GB; para Q2_K y Q3_K_S, GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con Q2_K o Q3_K_S. Para Q6_K y Q8_0 se requiere hardware profesional o ejecucion parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI si la arquitectura es compatible (no verificado).
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (merge por task arithmetic con capacidades multimodales y 30.700 millones de parametros). No se dispone de datos de rendimiento del modelo que permitan una comparacion fundamentada con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un merge de modelos no identificados, los sesgos heredados de los modelos de origen son desconocidos.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones de fidelidad publicadas.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Restricciones de licencia: la licencia openmdw-1.1 debe revisarse antes de cualquier uso comercial; el campo license aparece como "other" en Hugging Face, lo que exige consultar el fichero LICENSE del repositorio. No se garantiza el uso comercial sin verificacion legal.
- Modelo de origen no documentado: se desconoce que modelos se combinaron en el merge, lo que dificulta evaluar la procedencia de los datos de entrenamiento y las obligaciones de atribucion.
- Cuantizaciones estaticas: mradermacher indica que no hay cuantizaciones con imatrix (weighted) disponibles en el momento de la publicacion, lo que puede suponer una perdida de calidad adicional frente a cuantizaciones ponderadas.
- Sin adopcion verificable: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de la comunidad sobre su calidad o estabilidad.
- Capacidades multimodales no verificadas: la presencia de ficheros mmproj no garantiza que el proyector funcione correctamente en todos los runtimes; se recomienda validar con llama.cpp en la version que soporte el modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ising-Calibration-1.5-31B-it-merge-GGUF
- Modelo base: https://huggingface.co/tergite/Ising-Calibration-1.5-31B-it-merge
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Ising-Calibration-1.5-31B-it-merge-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de comparacion de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
