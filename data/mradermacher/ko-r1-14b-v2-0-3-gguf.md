# mradermacher/ko-r1-14b-v2.0.3-GGUF

## Resumen

ko-r1-14b-v2.0.3-GGUF es la distribucion en formato GGUF del modelo OLAIR/ko-r1-14b-v2.0.3, un modelo de lenguaje de 14.765.947.904 parametros (aproximadamente 14,8 mil millones) afinado para razonamiento y conversacion en coreano. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y esta pensada para su uso con llama.cpp y herramientas compatibles (Ollama, LM Studio, etc.) en hardware de consumo.

El modelo deriva de la familia R1 (estilo DeepSeek-R1) aplicada al coreano: el autor original, OLAIR, lo entrena sobre el dataset OLAIR/Open-R1-Ko-SFT-v2.0, un conjunto de datos de ajuste supervisado orientado a razonamiento. La version 2.0.3 corresponde a una revision concreta del modelo base. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion.

La relevancia de esta ficha radica en que ofrece un modelo de razonamiento de ~14,8 B en coreano con cuantizaciones que van de 5,9 GB (Q2_K) a 15,8 GB (Q8_0), lo que lo hace desplegable en GPUs de consumo de 8-24 GB de VRAM y en CPU con suficiente RAM. Es una opcion practica para aplicaciones en coreano que necesiten capacidades de razonamiento sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia R1; detalles no disponibles) |
| Parametros totales | 14.765.947.904 (~14,8 B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo -i1-GGUF |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base OLAIR/ko-r1-14b-v2.0.3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer de ~14,8 B de parametros. El nombre "r1" y el dataset de ajuste (Open-R1-Ko-SFT-v2.0) sugieren que sigue el paradigma de razonamiento de la familia R1: ajuste supervisado sobre trazas de razonamiento para producir cadenas de pensamiento antes de la respuesta final. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO.

La aportacion de esta publicacion concreta es la cuantizacion: mradermacher genera cuantizaciones estaticas en formato GGUF (version de cuantizacion 2, con tensor de salida cuantizado) a partir de los pesos en safetensors del modelo base, empleando la conversion de Hugging Face a GGUF. Ademas, existe un repositorio separado con cuantizaciones ponderadas/imatrix (`mradermacher/ko-r1-14b-v2.0.3-i1-GGUF`), que suelen ofrecer mejor calidad por tamano que las estaticas equivalentes.

## Capacidades

- Generacion de texto conversacional en coreano, con soporte de dialogos multi-turno (tag `conversational`).
- Razonamiento paso a paso al estilo R1: el modelo esta afinado para producir cadenas de pensamiento antes de la respuesta (segun el dataset de ajuste Open-R1-Ko-SFT).
- Compatible con endpoints (tag `endpoints_compatible`), lo que permite desplegarlo en infraestructuras de inferencia estandar.
- Capacidades de codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque son habituales en la familia R1.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explicitamente.
- Capacidades multilingues: limitadas al coreano segun el campo `language`; no se garantiza un rendimiento solido en otros idiomas.
- Vision o audio: no disponible.

## Casos de uso

- Asistente conversacional en coreano: el modelo puede gestionar dialogos multi-turno gracias a su formato conversacional y a su ajuste sobre datos de dialogo en coreano; adecuado para chatbots de atencion al cliente en ese idioma.
- Razonamiento y resolucion de problemas en coreano: al estar afinado sobre trazas de razonamiento (familia R1), es util para tareas que requieran explicar el proceso de solucion, como tutoria educativa o analisis de problemas.
- Despliegue local en hardware de consumo: con cuantizaciones Q4_K_M (9,1 GB) o Q5_K_M (10,6 GB) cabe en GPUs de 12-16 GB de VRAM, lo que permite ejecutar el modelo en una RTX 4070 Ti o similar sin conexion a internet.
- Procesamiento por lotes en CPU: las cuantizaciones Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten ejecutar el modelo en servidores sin GPU con suficiente RAM, util para tareas de generacion offline o anonimizacion de datos.
- Prototipado de aplicaciones en coreano: la licencia MIT y el formato GGUF facilitan integrar el modelo en prototipos con Ollama o llama.cpp sin coste de licencia.
- Investigacion sobre razonamiento en idiomas de bajos recursos: sirve como base para estudiar como se transfiere el paradigma R1 al coreano y para comparar con modelos multilingues de tamano similar.
- Generacion de contenido y resumenes en coreano: para redaccion asistida o sintesis de documentos en ese idioma, con la advertencia de que la calidad depende de la cuantizacion elegida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, mas overhead de contexto):
  - Q2_K: ~5,9 GB de pesos; ~7-8 GB de VRAM en total.
  - Q3_K_M: ~7,4 GB de pesos; ~8-9 GB de VRAM.
  - Q4_K_M: ~9,1 GB de pesos; ~10-11 GB de VRAM.
  - Q5_K_M: ~10,6 GB de pesos; ~11-12 GB de VRAM.
  - Q6_K: ~12,2 GB de pesos; ~13-14 GB de VRAM.
  - Q8_0: ~15,8 GB de pesos; ~16-17 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M; RTX 4080/4090 (16-24 GB) para Q6_K y Q8_0; A100/H100 para despliegues de alta concurrencia con el modelo sin cuantizar.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M) hasta una RTX 4090 24 GB (Q8_0 con contexto amplio). Las cuantizaciones Q2_K y Q3_K_S caben en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque esta publicacion concreta es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ko-r1-14b-v2.0.3-GGUF (este) | ~14,8 B | no disponible | coreano | MIT | GGUF |
| OLAIR/ko-r1-14b-v2.0.3 (base) | ~14,8 B | no disponible | coreano | MIT | safetensors |
| mradermacher/ko-r1-14b-v2.0.3-i1-GGUF | ~14,8 B | no disponible | coreano | MIT | GGUF (imatrix) |

No se dispone de datos de rendimiento ni de modelos comparables de otros autores en la informacion proporcionada; la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y orientado exclusivamente al coreano; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un ajuste sobre un dataset coreano especifico (Open-R1-Ko-SFT-v2.0) puede heredar sesgos culturales y linguisticos de esa fuente.
- Alucinacion: como todo modelo generativo, puede producir contenido falso con apariencia de veracidad, especialmente en tareas de razonamiento largo; no se han publicado evaluaciones de fidelidad.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide garantizar el rendimiento en documentos largos o conversaciones extensas.
- Cuantizacion: las versiones Q2_K y Q3_K_S degradan la calidad de forma notable; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repo -i1-GGUF.
- Licencia: MIT permite uso comercial, pero conviene verificar las condiciones del modelo base OLAIR/ko-r1-14b-v2.0.3 y del dataset de entrenamiento antes de un despliegue comercial.
- Produccion: al ser una cuantizacion estatica de un modelo de investigacion, no hay garantias de soporte ni de actualizaciones; el repo tiene solo 120 descargas y 0 likes, lo que indica una adopcion muy limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ko-r1-14b-v2.0.3-GGUF
- Modelo base: https://huggingface.co/OLAIR/ko-r1-14b-v2.0.3
- Dataset de ajuste: https://huggingface.co/datasets/OLAIR/Open-R1-Ko-SFT-v2.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ko-r1-14b-v2.0.3-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#ko-r1-14b-v2.0.3-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
