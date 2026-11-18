# mradermacher/CheckmateRTL-27B-GGUF

## Resumen

CheckmateRTL-27B-GGUF es la versión cuantizada en formato GGUF del modelo CheckmateRTL-27B, desarrollado originalmente por el AI-Institute-BSC. Se trata de un modelo de lenguaje especializado en generación y verificación de código de descripción de hardware (Verilog y SystemVerilog), incluyendo la generación de testbenches y tareas de verificación de diseño. La cuantización ha sido realizada por mradermacher, un conocido publicador de cuantizaciones GGUF para la comunidad de llama.cpp.

El modelo cuenta con aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors), lo que lo sitúa en la categoría de modelos de 27B. Está afinado mediante SFT (supervised fine-tuning) y RLVR con GRPO sobre dos datasets propios del AI-Institute-BSC: SystemVerilog-Distill-86k y SystemVerilog-RL-12k, orientados específicamente al dominio del diseño de hardware y su verificación.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada y ejecutable localmente de un modelo de nicho para ingeniería de hardware, un dominio donde los modelos generalistas suelen fallar. Al estar en formato GGUF, puede desplegarse con llama.cpp u Ollama en hardware de consumo, algo crítico dado que el repositorio original en safetensors ocupa 174 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base en la informacion proporcionada. Por el tamano (~27B) y la nomenclatura, se trata presumiblemente de un transformer decoder-only, pero no se confirma en la documentacion disponible. El modelo fue afinado por el AI-Institute-BSC mediante un pipeline de SFT seguido de RLVR (Reinforcement Learning with Verifiable Rewards) usando GRPO, segun las etiquetas del repositorio (trl, sft, rlvr, grpo).

Los datos de entrenamiento provienen de dos datasets del propio instituto: SystemVerilog-Distill-86k (86.000 ejemplos de destilacion) y SystemVerilog-RL-12k (12.000 ejemplos para el entrenamiento por refuerzo). El enfoque en Verilog/SystemVerilog y verificacion de diseno sugiere un corpus altamente especializado en generacion de RTL, testbenches y tareas de validacion. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla de estas referencias.

## Capacidades

- Generacion de codigo Verilog y SystemVerilog para descripcion de hardware (RTL).
- Generacion de testbenches y entornos de verificacion de diseno.
- Tareas de verificacion de diseno (design verification), incluyendo comprobacion de correccion funcional.
- Razonamiento tecnico orientado a ingenieria de hardware digital.
- Conversacion multi-turno (etiqueta conversational en el repositorio).
- Capacidad multimodal: el repositorio incluye ficheros mmproj (multi-modal supplement), lo que indica soporte de entrada visual en el modelo base, aunque no se detalla el alcance.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.
- Idiomas: unicamente ingles declarado.

## Casos de uso

- Generacion de RTL para bloques de hardware: el modelo puede producir modulos Verilog/SystemVerilog a partir de especificaciones en lenguaje natural, adecuado para prototipado rapido de disenos digitales por su entrenamiento especifico en el dominio.
- Generacion de testbenches de verificacion: puede crear entornos de prueba (testbenches) para validar modulos RTL, reduciendo el tiempo de escritura manual de verificacion en flujos de diseno.
- Asistencia en verificacion de diseno: util para revisar y completar codigo de verificacion existente, detectar patrones problematicos y proponer correcciones en el contexto de design verification.
- Integracion en entornos de desarrollo de FPGA/ASIC: al estar en GGUF, puede ejecutarse localmente dentro de estaciones de trabajo de ingenieria sin enviar propiedad intelectual de hardware a servicios en la nube, algo relevante por confidencialidad.
- Automatizacion de documentacion tecnica de hardware: generacion de comentarios, especificaciones y explicaciones de modulos RTL a partir del codigo fuente.
- Despliegue en hardware de consumo para equipos pequenos: con cuantizaciones Q4_K_M (~16,8 GB) puede ejecutarse en GPUs de consumo de 24 GB, permitiendo a ingenieros individuales o startups usar el modelo sin infraestructura de datacenter.
- Educacion en diseno digital: asistente para estudiantes de ingenieria electronica que necesiten ejemplos de Verilog y explicaciones de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero, requiere margen adicional para contexto y KV cache):
  - Q2_K: ~11,2 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,6 GB
  - Q3_K_L: ~14,8 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,8 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
- GPU recomendadas: para Q4_K_M y superiores, RTX 4090 (24 GB) o A100/H100 para mayor margen de contexto; para Q2_K/Q3_K, GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o Q5_K_M, y en GPUs de 16 GB con Q3_K_L o Q4_K_S ajustando contexto.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (safetensors) requiere transformers; la version GGUF esta pensada para llama.cpp y derivados.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de modelos comparables de la misma categoria (especializados en Verilog/SystemVerilog) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base ni de la cuantizacion, por lo que el uso comercial queda en incertidumbre hasta consultar el repositorio original de AI-Institute-BSC/CheckmateRTL-27B.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Dominio restringido: el modelo esta especializado en Verilog/SystemVerilog y verificacion de diseno; su rendimiento en tareas generales de lenguaje probablemente sea inferior al de modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo RTL sintacticamente valido pero funcionalmente incorrecto; requiere validacion con simuladores y herramientas EDA.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que limita la planificacion de casos de uso con ficheros RTL extensos.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la calidad del codigo generado; se recomienda Q4_K_M o superior para uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de comunidad ni validacion externa del rendimiento de estas cuantizaciones.
- Los ficheros mmproj indican soporte multimodal en el modelo base, pero no se detalla su alcance ni calidad; no asumir capacidades de vision robustas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CheckmateRTL-27B-GGUF
- Modelo base: https://huggingface.co/AI-Institute-BSC/CheckmateRTL-27B
- Dataset de destilacion: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-Distill-86k
- Dataset de RL: https://huggingface.co/datasets/AI-Institute-BSC/SystemVerilog-RL-12k
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#CheckmateRTL-27B-GGUF
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
