# aunali1/BigBang-v1-oQ4e-fp16-mtp

## Resumen

BigBang-v1 es un modelo agéntico de arquitectura MoE (mixture of experts) desarrollado por el equipo endless-frontier, construido sobre la base de Qwen3.6-35B-A3B. Con 35 mil millones de parámetros totales y 3 mil millones activos por token, está diseñado específicamente para tareas de agente de largo horizonte: búsqueda de información, generación de código, investigación científica y experimentación en IA. La versión aquí descrita, `aunali1/BigBang-v1-oQ4e-fp16-mtp`, es una cuantización en formato MLX (Apple Silicon) realizada con la herramienta oQ de oMLX, que combina precisión mixta (4 bits con grupo de 64 y componentes en fp16) e incorpora soporte para multi-token prediction (MTP). Esta cuantización permite ejecutar un modelo de alto rendimiento en hardware de consumo de Apple, algo especialmente relevante para desarrolladores que trabajan con Macs equipadas con chips M-series y necesitan capacidades agénticas sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts) |
| Parametros totales | 35B (segun modelo base); el safetensors cuantizado contiene 6.190.760.880 parametros (probablemente solo los pesos almacenados tras cuantizacion) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible (el modelo base Qwen3.6 suele soportar 256K, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | oQ4e (4 bits, group size 64, precision mixta con componentes fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

BigBang-v1 es un modelo de tipo Mixture of Experts con 35B parametros totales y 3B activos por token, lo que lo hace computacionalmente eficiente en inferencia. Esta construido sobre Qwen3.6-35B-A3B, una version reciente de la familia Qwen que incorpora cabezas de multi-token prediction (MTP) integradas. El modelo ha sido afinado para tareas agénticas de largo horizonte, como busqueda en la web, generacion de codigo, investigacion cientifica y experimentacion en IA. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada. La cuantizacion oQ4e, realizada con la herramienta oQ de oMLX, aplica 4 bits con grupo de 64 a la mayoria de los pesos, manteniendo ciertos componentes en fp16 para preservar la precision. El sufijo `mtp` indica que la cuantizacion conserva la cabeza MTP, permitiendo su uso con el runtime MTPLX para acelerar la generacion mediante decodificacion especulativa.

## Capacidades

- Razonamiento agéntico de largo horizonte: planifica y ejecuta secuencias de acciones complejas para alcanzar un objetivo, como busquedas web multi-paso o experimentos cientificos.
- Generacion de codigo: capaz de escribir, depurar y refactorizar codigo en multiples lenguajes, con soporte para tareas de desarrollo complejas.
- Investigacion cientifica: puede revisar literatura, formular hipotesis y disenar experimentos, segun los benchmarks mencionados.
- Multi-token prediction (MTP): gracias a la cabeza MTP integrada y al soporte de MTPLX, puede predecir varios tokens a la vez y verificar mediante rejection sampling, acelerando la inferencia hasta 3 veces en hardware Apple Silicon.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Tool calling / function calling: no se menciona explicitamente, pero su naturaleza agéntica sugiere soporte para invocar herramientas externas.

## Casos de uso

- Agentes de investigacion autonomos: el modelo puede realizar busquedas web iterativas, leer documentos, extraer informacion relevante y sintetizar un informe final. Su capacidad de razonamiento de largo horizonte le permite mantener el contexto a lo largo de multiples pasos.
- Asistentes de programacion en entornos de desarrollo: integrado en un IDE o en un pipeline de CI/CD, puede generar tests, revisar pull requests, detectar bugs y proponer parches. Su habilidad para trabajar con codigo y su contexto amplio lo hacen adecuado para repositorios grandes.
- Automatizacion de revision de literatura cientifica: dado su entrenamiento en investigacion, puede resumir articulos, comparar metodologias y extraer conclusiones, ayudando a investigadores en fases de revision.
- Chatbots de atencion al cliente con razonamiento multi-paso: puede gestionar conversaciones complejas donde el usuario necesita resolver incidencias tecnicas que requieren consultar documentacion, ejecutar comandos o escalar a sistemas externos.
- Analisis de datos exploratorio: el modelo puede generar consultas SQL, escribir scripts de Python para visualizacion y razonar sobre los resultados, actuando como un analista de datos autonomo.
- Prototipado rapido de agentes de IA: los desarrolladores pueden usar BigBang-v1 como motor de razonamiento para construir agentes personalizados que necesiten planificacion, ejecucion de herramientas y adaptacion a entornos cambiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web menciona que el modelo se evalua en tareas de long-horizon search, coding, scientific research y AI research, pero no se proporcionan cifras concretas. La cuantizacion oQ4e puede introducir una ligera degradacion respecto al modelo original en fp16, pero no se dispone de datos comparativos.

## Requisitos de hardware

- Formato MLX, exclusivo para Apple Silicon (Macs con chips M1, M2, M3, M4 y sucesores).
- Tamano del repositorio: 22.5 GB. Se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo completo en RAM y dejar espacio para el sistema operativo y el runtime.
- Con cuantizacion 4 bits y precision mixta, el uso de memoria en tiempo de ejecucion puede rondar los 20-24 GB, dependiendo de la longitud del contexto y del batch size.
- Para una experiencia fluida con MTP, se recomienda usar el runtime MTPLX, que aprovecha la cabeza MTP del modelo para acelerar la generacion.
- Alternativas de despliegue: MTPLX (aplicacion nativa y CLI), MLX-LM, o servidores compatibles con MLX. No es compatible con CUDA ni con GPUs NVIDIA.
- La latencia y el throughput dependen del chip concreto: en un M2 Max o superior, se pueden esperar velocidades de generacion de 20-40 tokens por segundo con MTP activado, aunque no hay mediciones oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigBang-v1 (base) | 35B | 3B | no disponible | no disponible | HuggingFace, GitHub |
| BigBang-v1-oQ4e-fp16-mtp (este) | 35B (6.19B en safetensors) | 3B | no disponible | no disponible | HuggingFace |
| Qwen3-30B-A3B (referencia, si existe) | 30B | 3B | 256K (tipico) | Apache 2.0 (tipico) | HuggingFace |

No se dispone de comparativas directas con otros modelos de la misma categoria en la informacion proporcionada. La falta de licencia y de datos de contexto dificulta una comparacion completa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el modelo es de codigo abierto, si permite uso comercial o si tiene restricciones de atribucion. Esto es un riesgo para su uso en produccion.
- Sesgos y alucinaciones: no hay documentacion sobre sesgos especificos ni sobre tasas de alucinacion. Como modelo agéntico, puede generar respuestas plausibles pero incorrectas, especialmente en tareas de investigacion donde la verificacion es critica.
- Limitaciones de contexto: aunque el modelo base probablemente soporte contextos largos, no se confirma el valor exacto en esta cuantizacion. El uso de MTP puede aumentar el consumo de memoria con contextos muy largos.
- Idioma: no se especifican los idiomas soportados; si el modelo base esta optimizado principalmente para ingles, su rendimiento en otros idiomas puede ser inferior.
- Compatibilidad: al ser un formato MLX, solo funciona en Apple Silicon. No se puede ejecutar en GPUs NVIDIA o AMD sin una conversion previa (que puede no estar disponible).
- La cuantizacion oQ4e introduce perdida de precision respecto al modelo original en fp16, lo que puede afectar a tareas que requieren alta exactitud, como generacion de codigo complejo o razonamiento matematico.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/aunali1/BigBang-v1-oQ4e-fp16-mtp
- Modelo base en HuggingFace (pagina de busqueda de cuantizaciones): https://huggingface.co/models?other=base_model:quantized:endless-frontier/BigBang-v1
- Repositorio GitHub del modelo base: https://github.com/endless-frontier/BigBang-v1
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Runtime MTPLX para multi-token prediction: https://github.com/youssofal/mtplx
- Pagina de API e inferencia de BigBang-V1 en FriendliAI: https://friendli.ai/models/endless-frontier/BigBang-v1
