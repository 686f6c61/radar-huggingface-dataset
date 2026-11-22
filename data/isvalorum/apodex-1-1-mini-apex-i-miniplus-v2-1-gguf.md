# IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Apodex-1.1-mini APEX-I-MiniPlus-V2.1 es una cuantizacion GGUF de tipo personalizado del modelo base `apodex/Apodex-1.1-mini`, elaborada por el usuario independiente IsValorum. El modelo base es un Mixture-of-Experts (MoE) de aproximadamente 35.500 millones de parametros totales, con arquitectura derivada de la familia Qwen 3.5 MoE segun las etiquetas del repositorio, orientado a generacion de texto, razonamiento y conversacion.

El interes de esta publicacion no reside en el modelo base, sino en la receta de cuantizacion por tensor. Frente a las cuantizaciones planas de la comunidad, que comprimen uniformemente los expertos a 2 bits y degradan la sintaxis y el razonamiento, esta version aplica una asignacion diferenciada: routers en F32 sin comprimir, cabecera de salida en Q6_K, proyecciones de atencion en Q8_0 y expertos centrales en IQ3_XXS. El resultado es un fichero de 15,30 GB con un peso medio de 3,40 bits por peso y una perplexidad en WikiText-2 de 5,7073, un 1,19 % por encima del BF16 de referencia.

La relevancia practica es que permite ejecutar un MoE de 35B con contexto declarado de 256K en estaciones de trabajo de 24 GB de VRAM, o parcialmente en RAM del sistema, manteniendo el estado de enrutamiento intacto. La licencia Apache 2.0 y el soporte de llama.cpp lo hacen apto para despliegues locales y entornos de produccion con requisitos de privacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo transformer, derivada de Qwen 3.5 MoE segun etiquetas del repositorio; 40 capas y 256 micro-expertos |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | 256K (declarado en la model card; soporte completo en 24 GB de VRAM segun el autor) |
| Tipos de cuantizacion | GGUF personalizado APEX-I-MiniPlus V2.1, 3,40 BPW medios; mezcla de IQ3_XXS, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0 y F32 por tensor |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero de 15,30 GB; repositorio de 30,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos dispersa: 40 capas y 256 micro-expertos, con expertos compartidos (`shexp`) y enrutadores por capa (`gate_inp`, `gate_shexp`). La model card de la cuantizacion distingue entre expertos centrales (capas 10 a 29), expertos de borde (capas 0 a 9 y 30 a 39) y capas de atencion completa (3, 7, 11 y sucesivas). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, ya que la model card del cuantizador no los detalla y la del modelo base no se ha proporcionado.

La innovacion tecnica relevante esta en la cuantizacion. La receta V2.1 mantiene los tensores de enrutamiento en F32 sin comprimir para evitar deriva en la seleccion de expertos, protege la cabecera de salida (`output.weight`) en Q6_K para preservar la precision del vocabulario, fija las puertas de atencion de 30 capas en Q8_0, asigna Q4_K a las capas de atencion completa y Q5_K al experto compartido en las 40 capas, y distribuye IQ3_XXS en los expertos centrales y Q3_K en 20 capas de borde. El autor documenta una auditoria tensor a tensor del GGUF resultante y una comparacion empirica de perplexidad frente al BF16.

## Capacidades

- Generacion de texto conversacional multi-turno en 13 idiomas, incluidos espanol, ingles, chino, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe.
- Razonamiento explicito con modo de pensamiento (`<think>`), segun las referencias de la model card a la calidad del razonamiento en esa fase.
- Generacion de codigo, con advertencias especificas del autor sobre sintaxis e indentacion bajo cuantizaciones agresivas.
- Razonamiento matematico y tareas de varios pasos, implícito en la categoria `reasoning` del repositorio.
- Soporte de plantilla de chat orientada a agentes ("hardened agentic chat template") con control de esfuerzo de razonamiento.
- Compatibilidad con llama.cpp y con endpoints compatibles (`endpoints_compatible` en las etiquetas).
- No se documenta soporte de vision, audio ni tool calling explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y revisar codigo sin salir de la maquina del desarrollador, y la receta de cuantizacion preserva la cabecera de salida en Q6_K y los expertos centrales en IQ3_XXS, lo que segun el autor reduce los errores de sintaxis y de indentacion tipicos de las cuantizaciones planas a 2 bits.
- Analisis de documentos largos: con 256K de contexto declarado y la posibilidad de volcar parte del modelo a RAM del sistema, encaja en tareas de resumen y extraccion sobre contratos, informes o bases de codigo extensas que no caben en ventanas de 8K o 32K.
- Atencion al cliente multilingue: cubre 13 idiomas y mantiene conversaciones multi-turno; el despliegue en llama.cpp permite servir la inferencia en infraestructura propia sin enviar datos a terceros.
- Agente de razonamiento por pasos en estaciones de trabajo: la plantilla de chat orientada a agentes y el modo de pensamiento permiten encadenar pasos intermedios en tareas de planificacion o resolucion de incidencias tecnicas.
- Inferencia en CPU con RAM abundante: el autor reporta entre 20 y 45 tok/s en inferencia completa o parcial en RAM del sistema, lo que habilita usar el modelo en servidores sin GPU dedicada con DDR4 o DDR5 de alta capacidad.
- Prototipado e investigacion de cuantizacion: el repositorio documenta el mapa tensor a tensor, la comparacion de perplexidad y el historial de versiones (V1, V2, V2.1), lo que lo convierte en un caso de estudio reproducible para quienes investigan recetas de cuantizacion en MoE.
- Despliegue en 24 GB de VRAM: el autor afirma que el contexto completo de 256K cabe en VRAM en workstations de 24 GB, lo que permite montar un servicio de generacion de texto con contexto largo en una unica RTX 4090 o similar.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de perplexidad y de rendimiento de inferencia, no de benchmarks academicos estandar.

| Metrica | BF16 base | APEX-I-MiniPlus V2.1 |
|---|---|---|
| Tamano en disco | aprox. 70,0 GB | 15,30 GB |
| Huella en RAM/VRAM | aprox. 65,2 GiB | 14,25 GiB |
| Bits por peso (BPW) | 16,00 | 3,40 |
| Perplexidad WikiText-2 | aprox. 5,64 (referencia) | 5,7073 ± 0,1373 (delta +0,0673, +1,19 %) |
| Nivel de calidad equivalente | linea base | tier Q5_K_M |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,25 GiB de huella en memoria para el modelo cuantizado; el autor afirma que el contexto completo de 256K cabe en 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) y GPUs de 24 GB o mas para el contexto completo; el autor incluye benchmarks de rendimiento para familias RTX 30, RTX 40 y RTX 50, sin cifras concretas en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB; en tarjetas de 16 GB requeriria offload parcial a RAM del sistema.
- Opciones de despliegue: llama.cpp como runtime principal; el repositorio esta etiquetado como compatible con endpoints. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: 20 a 45 tok/s en inferencia completa o parcial en RAM del sistema, segun procesador, ancho de banda de memoria y configuracion DDR4/DDR5. No se aportan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apodex-1.1-mini APEX-I-MiniPlus V2.1 (esta ficha) | 35,5B totales (MoE) | 256K | GGUF personalizado, 3,40 BPW, 15,30 GB | Apache 2.0 | Hugging Face, llama.cpp |
| Apodex-1.1-mini APEX-I-MiniPlus V2 | 35,5B totales (MoE) | 256K | GGUF personalizado, IQ3_XXS en expertos centrales, IQ3_S en 10 capas de borde, +1,2 GB frente a la generica | Apache 2.0 | Hugging Face |
| Apodex-1.1-mini APEX-I-Mini generica de la comunidad | 35,5B totales (MoE) | 256K | GGUF plano, IQ2_S en expertos, Q3_K_M en cabecera, aprox. 12,5 GB | Apache 2.0 | Hugging Face |
| Modelo base apodex/Apodex-1.1-mini en BF16 | 35,5B totales (MoE) | 256K | BF16, aprox. 70 GB | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no incluye datos de benchmarks que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- La cuantizacion a 3,40 BPW introduce una degradacion medible: perplexidad un 1,19 % superior al BF16. En tareas de razonamiento profundo o generacion de codigo, esa diferencia puede amplificarse.
- El autor advierte explicitamente de que las cuantizaciones planas a 2 bits provocan errores de sintaxis, corchetes de codigo roto e indentacion incorrecta; aunque esta receta mitiga el problema, no lo elimina por completo.
- La model card incluye una advertencia especifica sobre penalizacion de repeticion y sintaxis de codigo ("character swapping"), que debe respetarse en la configuracion de generacion.
- No hay datos publicados sobre sesgos del modelo base, calidad por idioma ni tasas de alucinacion. Los 13 idiomas declarados no implican el mismo nivel de competencia en todos ellos.
- El contexto de 256K es una declaracion del autor; no se aportan resultados de benchmarks de recuperacion en contexto largo (needle-in-a-haystack u otros) que la respalden.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y su procedencia de entrenamiento no estan documentados en la informacion disponible; conviene verificar la ficha del modelo base antes de un despliegue en produccion.
- El repositorio tiene 664 descargas y 5 likes en el momento de la consulta, y la cuantizacion la mantiene un autor individual, no una organizacion; el soporte y la continuidad no estan garantizados.
- El rendimiento en RAM del sistema (20 a 45 tok/s) depende fuertemente del hardware y no se acompana de una tabla detallada por configuracion en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
