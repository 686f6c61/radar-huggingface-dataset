# mradermacher/CalibForge-35B-A3B-v2-GGUF

## Resumen

CalibForge-35B-A3B-v2-GGUF es la distribucion en formato GGUF del modelo CalibForge-35B-A3B-v2, desarrollado por el equipo AweAI-Team y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE), disenado especificamente para tareas de agente de terminal (terminal-agent) y ajustado mediante supervision fina (SFT). El modelo base cuenta con aproximadamente 34.660 millones de parametros totales, de los cuales 3.000 millones estan activos por token segun la nomenclatura A3B, lo que permite un equilibrio entre capacidad y eficiencia computacional.

La relevancia de esta publicacion radica en su orientacion a tareas de automatizacion de terminal y ejecucion de comandos, un nicho cada vez mas demandado en el desarrollo de agentes autonomos. El modelo esta disponible bajo licencia Apache 2.0, lo que facilita su adopcion tanto en entornos de investigacion como comerciales. La cuantizacion GGUF realizada por mradermacher permite desplegar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, ampliando significativamente su accesibilidad.

Esta ficha se centra en la version cuantizada GGUF, que ofrece 11 variantes de cuantizacion desde Q2_K hasta Q8_0, con tamanos que van desde 13,0 GB hasta 37,0 GB. El modelo esta etiquetado para uso conversacional y agentes de terminal, con soporte unicamente para ingles segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), transformer (detalles no disponibles) |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 mil millones) |
| Parametros activos | 3 mil millones (segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado), safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo base CalibForge-35B-A3B-v2 emplea una arquitectura de mezcla de expertos (MoE) con aproximadamente 34,66 mil millones de parametros totales y 3 mil millones de parametros activos por token. Esta configuracion permite que el modelo mantenga una capacidad de representacion propia de un modelo denso de mayor tamano mientras reduce el coste computacional por inferencia, ya que solo se activa una fraccion de los expertos para cada token. Los detalles especificos sobre el numero de expertos, la estrategia de enrutamiento o la composicion exacta de la arquitectura no estan disponibles en la informacion proporcionada.

El entrenamiento del modelo se realizo mediante supervision fina (SFT) sobre el dataset AweAI-Team/CalibForge, segun los metadatos de la model card. El modelo esta especializado en tareas de agente de terminal, lo que sugiere que el dataset de entrenamiento incluye ejemplos de interaccion con terminales, ejecucion de comandos y flujos de trabajo de agente. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas adicionales como RLHF o DPO. La referencia al paper arXiv:2608.06352 en las etiquetas sugiere la existencia de una publicacion tecnica asociada, aunque su contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interacciones multi-turno.
- Ejecucion de tareas de agente de terminal (terminal-agent): el modelo esta especificamente ajustado para interpretar y generar comandos de terminal, gestionar flujos de trabajo en linea de comandos y asistir en tareas de automatizacion de sistemas.
- Razonamiento multi-paso orientado a agentes: la naturaleza de las tareas de terminal requiere planificacion secuencial y ejecucion de comandos encadenados.
- Ajuste mediante SFT para tareas de agente, lo que implica capacidad de seguir instrucciones estructuradas y mantener coherencia en flujos de trabajo prolongados.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque es plausible dado el enfoque en agentes.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Automatizacion de tareas de administracion de sistemas: el modelo puede interpretar instrucciones en lenguaje natural y generar los comandos de terminal correspondientes para tareas como gestion de ficheros, monitorizacion de procesos o configuracion de servicios, gracias a su ajuste especifico en terminal-agent.
- Asistente de linea de comandos interactivo: integrado en una shell o herramienta CLI, el modelo puede sugerir comandos, explicar su funcionamiento y corregir errores en tiempo real, aprovechando su entrenamiento en SFT sobre interacciones de terminal.
- Generacion de scripts de automatizacion: el modelo puede producir scripts de shell o secuencias de comandos para pipelines de CI/CD, tareas de despliegue o mantenimiento programado, adecuado por su enfoque en entornos de terminal.
- Agente autonomo de resolucion de incidencias: en un pipeline de operaciones, el modelo puede recibir una descripcion de un problema (por ejemplo, un servicio caido) y generar una secuencia de comandos de diagnostico y reparacion, gracias a su capacidad de razonamiento multi-paso.
- Educacion y formacion en entornos Linux/Unix: el modelo puede actuar como tutor interactivo que explica comandos, propone ejercicios practicos y evalua las respuestas del usuario en un entorno de terminal simulado.
- Integracion en herramientas de desarrollo (IDE, terminales integradas): el modelo puede asistir a desarrolladores en la ejecucion de comandos de compilacion, testing o gestion de dependencias, aprovechando su especializacion en terminal y su licencia Apache 2.0 para integracion comercial.
- Despliegue en local para entornos con requisitos de privacidad: gracias a las cuantizaciones GGUF (desde 13,0 GB en Q2_K), el modelo puede ejecutarse en estaciones de trabajo sin conexion a servicios en la nube, adecuado para entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: aproximadamente 13,0 GB
  - Q3_K_S: aproximadamente 15,3 GB
  - Q3_K_M: aproximadamente 16,9 GB
  - Q3_K_L: aproximadamente 18,2 GB
  - IQ4_XS: aproximadamente 19,0 GB
  - Q4_K_S: aproximadamente 20,0 GB
  - Q4_K_M: aproximadamente 21,3 GB
  - Q5_K_S: aproximadamente 24,1 GB
  - Q5_K_M: aproximadamente 24,8 GB
  - Q6_K: aproximadamente 28,6 GB
  - Q8_0: aproximadamente 37,0 GB
- GPU recomendadas: para las cuantizaciones mas bajas (Q2_K a Q4_K_M), una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) es suficiente. Para Q5_K_M y Q6_K se recomienda una GPU con 32 GB o mas (A100 40GB, RTX A6000). Para Q8_0 se necesita una GPU con 40-48 GB (A100 40GB, A6000 48GB) o bien ejecucion en CPU con suficiente RAM.
- Compatibilidad con GPU de consumo: si, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de consumo con 24 GB de VRAM (RTX 3090, RTX 4090). Las cuantizaciones Q5 y superiores requieren GPUs profesionales o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. Tambien es posible usar vLLM o TGI con el modelo base en safetensors, aunque no se dispone de confirmacion explicita para esta version cuantizada.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo MoE con 3 mil millones de parametros activos, se espera un throughput superior al de un modelo denso de 35B, pero no se han proporcionado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| CalibForge-35B-A3B-v2-GGUF | 34,66B | 3B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Modelo comparable 1 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo comparable 2 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelo comparable 3 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria, ya que no se han proporcionado datos de rendimiento ni especificaciones de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado unicamente en ingles segun la model card, por lo que su rendimiento en castellano u otros idiomas puede ser deficiente.
- Especializacion: el ajuste SFT esta orientado a tareas de terminal-agent, lo que puede limitar su rendimiento en tareas genericas de generacion de texto o conversacion no relacionadas con entornos de terminal.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar comandos o instrucciones incorrectas, especialmente en entornos de terminal donde un error puede tener consecuencias graves (borrado de ficheros, configuraciones erroneas). Se recomienda supervision humana en produccion.
- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos del modelo.
- Limitaciones de contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide evaluar su idoneidad para tareas que requieran ventanas extensas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda verificar los terminos del modelo base original y del dataset de entrenamiento.
- Caveat para produccion: al ser una cuantizacion GGUF, las versiones de menor precision (Q2_K, Q3_K_S) pueden degradar la calidad de las respuestas. Para produccion se recomienda Q4_K_M o superior. Ademas, la ausencia de benchmarks publicados impide estimar su rendimiento real frente a alternativas.
- Fecha de creacion: el modelo fue creado el 2026-11-20, lo que sugiere que puede ser reciente y carecer de validacion independiente por parte de la comunidad (0 likes, 854 descargas en el momento de la consulta).

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-GGUF
- Modelo base en Hugging Face: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B-v2
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-i1-GGUF
- Pagina de resumen del modelo: https://hf.tst.eu/model#CalibForge-35B-A3B-v2-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/AweAI-Team/CalibForge
- Paper de referencia: arXiv:2608.06352 (https://arxiv.org/abs/2608.06352)
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
