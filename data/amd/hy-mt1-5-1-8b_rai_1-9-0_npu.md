# amd/HY-MT1.5-1.8B_rai_1.9.0_npu

## Resumen

HY-MT1.5-1.8B_rai_1.9.0_npu es una distribucion optimizada del modelo de traduccion Hunyuan-MT-1.5 de 1.800 millones de parametros, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de los procesadores Ryzen AI. El modelo base, desarrollado por Tencent Hunyuan, esta especializado en traduccion automatica multilingue y conversacional, y esta version concreta ha sido convertida a formato ONNX y cuantizada con la herramienta Quark de AMD para aprovechar el motor de inferencia Ryzen AI 1.9.0.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: llevar modelos de lenguaje especializados a hardware de consumo con aceleracion NPU integrada. Frente a la inferencia en GPU o CPU pura, el despliegue en NPU permite reducir el consumo energetico y liberar la GPU del sistema en equipos portatiles con arquitectura hibrida (CPU + GPU integrada + NPU).

No obstante, conviene subrayar que la informacion publica disponible sobre este repositorio es muy limitada: el acceso esta restringido (gated), no se han publicado resultados de benchmarks en la model card accesible y el numero de descargas e interacciones es cero en el momento de redactar esta ficha. Los datos que siguen se basan en la informacion del repositorio y en las caracteristicas conocidas del modelo base Hunyuan-MT-1.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `hunyuan_v1_dense` segun los tags del repositorio) |
| Parametros totales | 1.800 millones (1.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Cuantizacion para NPU mediante Quark (formato ONNX); niveles concretos no disponibles |
| Idiomas soportados | Ingles (segun el tag de idioma del repositorio); el modelo base Hunyuan-MT esta orientado a traduccion multilingue, pero la cobertura exacta de esta distribucion no esta detallada |
| Licencia | Other (licencia personalizada; acceso restringido que requiere aceptar condiciones en HuggingFace) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

El repositorio declara la arquitectura `hunyuan_v1_dense`, lo que corresponde a un transformer denso (no mezcla de expertos) de 1.800 millones de parametros. Esta es la arquitectura empleada por la familia Hunyuan-MT de Tencent, disenada especificamente para traduccion automatica y generacion de texto conversacional. Al tratarse de una distribucion derivada, el entrenamiento original corresponde al modelo base Hunyuan-MT-1.5 publicado por Tencent; AMD no documenta en este repositorio el proceso de entrenamiento, el volumen de tokens ni la composicion del dataset.

La innovacion tecnica de esta publicacion no reside en el entrenamiento sino en el proceso de despliegue: la conversion a ONNX y la cuantizacion con Quark para ejecutar el modelo sobre la NPU de los procesadores Ryzen AI, utilizando el runtime Ryzen AI 1.9.0. Este pipeline permite que un modelo de 1.8B parametros se ejecute en hardware integrado con bajo consumo, algo que en formato de precision completa resultaria inviable en una NPU de portatil. No se dispone de informacion sobre si el modelo base empleo RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto y traduccion automatica: proposito principal del modelo base Hunyuan-MT.
- Generacion conversacional multi-turno (tag `conversational`).
- Traduccion entre idiomas: el modelo base esta orientado a traduccion multilingue, aunque esta distribucion solo declara ingles en sus metadatos.
- Inferencia acelerada en NPU de Ryzen AI mediante el runtime Ryzen AI 1.9.0.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Traduccion local en portatiles con Ryzen AI: el modelo puede ejecutarse integramente en la NPU de un portatil equipado con un procesador Ryzen AI, permitiendo traducir documentos y textos sin conexion a internet y sin enviar datos a servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistentes de escritura integrados en el sistema operativo: al liberar la GPU y la CPU, el modelo puede alimentar funciones de traduccion y reescritura dentro de aplicaciones de escritorio mientras el resto del sistema mantiene su rendimiento grafico.
- Procesamiento por lotes de traduccion en equipos de sobremesa con NPU: la baja latencia energetica de la NPU permite ejecutar tareas de traduccion de volumen medio en segundo plano sin degradar la experiencia del usuario.
- Prototipado de pipelines de traduccion en hardware de consumo: desarrolladores que quieran validar flujos de traduccion antes de desplegarlos en servidores pueden usar esta distribucion como entorno de pruebas fiel al modelo final.
- Aplicaciones de traduccion en entornos con restricciones de red: escenarios de campo, aviacion o industria donde no hay conectividad y se requiere traduccion local con un modelo de calidad razonable para su tamano.
- Evaluacion comparativa de inferencia NPU frente a GPU/CPU: investigadores que estudien el rendimiento de modelos transformer en aceleradores neuronales integrados pueden utilizar este repositorio como referencia de despliegue optimizado por el fabricante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecutarse en NPU, no en GPU, por lo que la VRAM no es el recurso limitante.
- GPU recomendadas: no aplica para esta distribucion (orientada a NPU Ryzen AI); para el modelo base en GPU se requeriria al menos una GPU con 4-8 GB de memoria en funcion de la cuantizacion.
- Compatibilidad con GPU de consumo: la distribucion ONNX/NPU no esta pensada para GPUs de consumo; el modelo base de 1.8B si cabria en GPUs de consumo con cuantizacion adecuada.
- NPU requerida: procesadores AMD Ryzen AI compatibles con el runtime Ryzen AI 1.9.0 (modelos concretos no especificados en la informacion disponible).
- Opciones de despliegue: runtime Ryzen AI 1.9.0 con formato ONNX; para el modelo base serian aplicables vLLM, llama.cpp, Ollama o TGI, pero no se confirma compatibilidad de esta distribucion con dichos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| HY-MT1.5-1.8B_rai_1.9.0_npu (AMD) | 1.8B | No disponible | Other (gated) | ONNX (NPU) | Traduccion en NPU Ryzen AI |
| Hunyuan-MT-1.5 (Tencent, modelo base) | 1.8B | No disponible | Ver licencia del modelo base | Safetensors y otros | Traduccion multilingue |
| NLLB-200 (Meta) | 600M-54B segun variante | 512 tokens (variantes estandar) | CC-BY-NC 4.0 (no comercial) | Safetensors, GGUF | Traduccion multilingue |
| Opus-MT (Helsinki-NLP) | 70M-300M por par de idiomas | Limitado | Apache 2.0 / CC-BY 4.0 segun modelo | Safetensors, ONNX | Traduccion por pares de idiomas |

La comparativa es aproximada: no se dispone de datos de rendimiento de esta distribucion que permitan una comparacion cuantitativa con las alternativas. La diferencia principal de la propuesta de AMD es el soporte nativo de NPU, ausente en las alternativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de descargar los pesos; esto limita la automatizacion y el uso en entornos corporativos con politicas estrictas.
- Licencia "other": no es una licencia estandar de codigo abierto; es imprescindible revisar los terminos exactos antes de cualquier uso comercial.
- Dependencia de hardware: la distribucion esta ligada al runtime Ryzen AI 1.9.0 y a las NPU de AMD, lo que reduce la portabilidad a otros aceleradores.
- Cobertura idiomatica limitada en los metadatos: solo se declara ingles, aunque el modelo base esta orientado a traduccion multilingue; la cobertura real de esta distribucion no esta documentada.
- Riesgo de alucinacion: como todo modelo generativo, puede producir traducciones plausibles pero incorrectas, especialmente en dominios tecnicos o con terminologia especializada.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del modelo base pueden persistir en esta distribucion.
- Ausencia de benchmarks publicados: no hay evidencia publica del rendimiento de esta version cuantizada frente al modelo base en precision completa.
- Contexto maximo no documentado: se desconoce la ventana de contexto efectiva tras la conversion y cuantizacion, lo que complica su uso en documentos largos.
- Madurez: el repositorio es reciente y sin descargas ni interacciones registradas, por lo que no existe validacion de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/HY-MT1.5-1.8B_rai_1.9.0_npu
- Modelo base Hunyuan-MT-1.5 (Tencent): no disponible en la informacion proporcionada (se recomienda buscar en HuggingFace el identificador oficial de Tencent Hunyuan)
- Documentacion de Ryzen AI de AMD: no disponible en la informacion proporcionada
- Herramienta de cuantizacion Quark de AMD: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
