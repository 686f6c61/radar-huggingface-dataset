# MurttDev/tworo-lesson-planner

## Resumen

`MurttDev/tworo-lesson-planner` es un modelo de lenguaje publicado en Hugging Face por el usuario MurttDev, orientado, a juzgar por su nombre, a la generacion de planes de clase y material didactico. Se distribuye principalmente en formato GGUF, lo que indica que esta pensado para inferencia local mediante runtimes como llama.cpp u Ollama, y cuenta con la etiqueta `endpoints_compatible`, que sugiere compatibilidad con los endpoints de inferencia alojados de Hugging Face. El recuento de parametros en safetensors es de 1.543.714.304, es decir, aproximadamente 1,54 mil millones de parametros, lo que lo situa en la categoria de modelos pequenos.

Se trata de un modelo conversacional (etiqueta `conversational`), muy probablemente un ajuste fino de una base de ~1,5B sobre un corpus especifico de planificacion docente. El repositorio ocupa 3,0 GB, un tamano coherente con pesos en precision de 16 bits mas una o varias cuantizaciones GGUF. El numero de descargas es muy bajo (54) y no tiene likes, por lo que se trata de un artefacto de nicho, sin adopcion comunitaria significativa ni documentacion publica asociada.

La relevancia de este modelo radica en su tamano reducido: si el ajuste fino es correcto, podria ejecutarse en hardware de consumo o incluso en el navegador o en un dispositivo sin GPU dedicada, lo que lo haria util para herramientas educativas desplegadas en entornos con recursos limitados. No obstante, la ausencia de model card detallada, licencia declarada y benchmarks publicados limita seriamente su evaluacion previa a un uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso de ~1,54B parametros, inferido del recuento de safetensors) |
| Parametros totales | 1.543.714.304 (~1,54 mil millones) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio esta etiquetado como `gguf`; los niveles concretos no estan documentados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (etiqueta del repositorio) y safetensors (segun el recuento de parametros publicado) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, los datos de entrenamiento ni el procedimiento de ajuste. El unico dato objetivo disponible es el recuento de parametros (1.543.714.304), que corresponde al orden de magnitud de las familias de modelos densos de ~1,5B ampliamente utilizadas como base para ajustes finos (Qwen2.5-1.5B, entre otras). Sin embargo, no hay confirmacion por parte del autor de cual es el modelo base, por lo que cualquier afirmacion al respecto seria especulativa.

Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF, DPO o SFT supervisado. La etiqueta `conversational` sugiere que el modelo fue ajustado para mantener dialogos multi-turno, y el nombre `lesson-planner` apunta a un dominio de especializacion concreto (diseno instruccional, planificacion de clases, generacion de actividades). No se ha publicado ninguna innovacion tecnica destacable (atencion lineal, decodificacion especulativa, atencion hibrida, etc.).

## Capacidades

- Generacion de texto conversacional en formato de dialogo multi-turno, segun la etiqueta `conversational`.
- Especializacion probable en planificacion de clases y generacion de contenido educativo, deducida del nombre del modelo; no confirmada por documentacion.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Ejecucion local mediante GGUF, lo que habilita despliegue en CPU y en GPU de gama baja.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de planes de clase: dado un tema, un nivel educativo y una duracion, el modelo podria producir un esquema con objetivos, actividades y criterios de evaluacion. Es el caso de uso natural por el nombre del modelo, aunque requiere validacion manual porque no hay benchmarks publicados.
- Creacion de material didactico de apoyo: fichas de ejercicios, preguntas de repaso y resumenes de unidades, aprovechando la naturaleza conversacional del ajuste.
- Asistente integrado en una plataforma educativa: al ser un modelo de ~1,54B cuantizado en GGUF, puede desplegarse en el mismo servidor que la aplicacion web sin necesidad de GPU dedicada, reduciendo costes de infraestructura.
- Prototipado rapido de funcionalidades docentes: equipos que quieran validar un producto de generacion de contenido educativo antes de invertir en modelos mayores.
- Ejecucion en local o en el dispositivo: con cuantizaciones de 4 bits el modelo ocupa del orden de 1 GB, por lo que cabria en portatiles sin GPU dedicada o en entornos educativos con hardware modesto y requisitos de privacidad estrictos.
- Generacion de cuestionarios y rúbricas de evaluacion: el modelo puede producir listas estructuradas de preguntas o criterios a partir de un temario proporcionado en el prompt.
- Traduccion y adaptacion de materiales: solo si se confirma soporte multilingue, dato que actualmente no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de dominio educativo, ni comparaciones con modelos de referencia por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del recuento de parametros (~1,54B), no de mediciones publicadas:
  - FP16 / BF16: aproximadamente 3,1 GB de pesos mas overhead de contexto y activaciones.
  - Cuantizacion Q8_0: aproximadamente 1,7 GB.
  - Cuantizacion Q5_K_M: aproximadamente 1,2 GB.
  - Cuantizacion Q4_K_M: aproximadamente 1,0 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o incluso una GTX 1650 (4 GB) pueden alojar el modelo cuantizado. Para FP16 basta con 4-6 GB de VRAM.
- CPU: al distribuirse en GGUF, es viable su ejecucion en CPU con llama.cpp, con velocidades de decodificacion dependientes del numero de nucleos y del ancho de banda de memoria.
- Cabria en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos anos, y tambien en GPUs integradas con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, TGI (si se dispone de pesos safetensors) y vLLM (para pesos sin cuantizar). La etiqueta `endpoints_compatible` indica soporte de los endpoints alojados de Hugging Face.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La comparativa se establece frente a modelos densos de tamano equivalente, dado que no se conoce el modelo base exacto. Los datos de este modelo son desconocidos salvo el recuento de parametros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MurttDev/tworo-lesson-planner | ~1,54B | no disponible | no disponible | Hugging Face (GGUF + safetensors) |
| Qwen2.5-1.5B-Instruct | ~1,54B | 32.768 tokens nativos | Apache 2.0 | Hugging Face, ampliamente soportado |
| Llama-3.2-1B-Instruct | ~1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Hugging Face, ecosistema amplio |
| Gemma-2-2B-it | ~2,6B | 8.192 tokens | Licencia de Gemma | Hugging Face, requiere aceptar terminos |

El modelo bajo analisis parte con desventaja clara en cuanto a documentacion, licencia y benchmarks frente a estas alternativas, que cuentan con model cards completas, evaluaciones publicadas y licencias explicitas. Su unico diferenciador potencial seria un ajuste fino especifico para planificacion docente, que no esta verificado con datos.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, arquitectura, hiperparametros ni proceso de alineacion, lo que impide auditar el modelo.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. En la practica, esto equivale a reserva de derechos por defecto en muchas jurisdicciones, por lo que no deberia usarse en produccion sin contactar con el autor.
- Riesgo de alucinacion: al ser un modelo pequeno (~1,54B) y presumiblemente ajustado sobre un corpus de nicho, la probabilidad de generar contenido factualmente incorrecto o desactualizado es alta, especialmente en contenidos curriculares, fechas historicas o datos cientificos.
- Sesgos: no evaluados. Los modelos pequenos ajustados con datasets reducidos tienden a reproducir los sesgos y el estilo del corpus de ajuste, y a degradarse rapidamente fuera de su dominio.
- Limitaciones de contexto e idioma: se desconocen tanto la ventana de contexto como los idiomas soportados. El nombre del modelo esta en ingles, lo que sugiere un ajuste predominantemente angloparlante, aunque no puede confirmarse.
- Adopcion practicamente nula: 54 descargas y 0 likes indican que el modelo no ha sido validado por la comunidad ni sometido a pruebas independientes.
- Fechas de publicacion inusuales: el repositorio figura como creado el 21 de septiembre de 2026 y actualizado el 27 de septiembre de 2026, fechas posteriores al momento de redaccion de esta ficha, lo que debe tenerse en cuenta al evaluar la trazabilidad del artefacto.
- Para produccion: se recomienda tratar este modelo como experimental y validar cada salida con revision humana, especialmente en contextos educativos donde el material generado llega a estudiantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MurttDev/tworo-lesson-planner
- Paper asociado: no disponible
- Blog o nota tecnica del autor: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
