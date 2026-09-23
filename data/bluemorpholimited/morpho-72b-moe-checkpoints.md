# bluemorpholimited/Morpho-72B-MoE-Checkpoints

## Resumen

Morpho-72B-MoE-Checkpoints es un repositorio de Hugging Face publicado por el usuario bluemorpholimited que contiene checkpoints de ajuste supervisado (SFT) para un sistema denominado Morpho-72B MoE. El propio autor lo describe como un conjunto de adaptadores QLoRA por experto (rango 128, alpha 256, FP32) entrenados sobre una base Qwen/Qwen2-72B congelada en 4 bits NF4. El repositorio no contiene pesos de un modelo completo ni artefactos listos para inferencia: es un canal de publicación de adaptadores organizados en `sft/expert_XX/best/`, donde `XX` va de 00 a 63.

El planteamiento es una especialización por dominio: cada experto se entrena hasta convergencia (paciencia de 2000 pasos) sobre datos propios de un dominio concreto. Los dominios documentados cubren finanzas (trading y mercados, inversión y carteras, banca y préstamos, seguros y riesgo, contabilidad y auditoría, fiscalidad, financiación inmobiliaria, ingeniería financiera) y derecho (constitucional, penal, civil, mercantil, propiedad intelectual, internacional, fiscal y cumplimiento normativo). Cada adaptador pesa 1,68 mil millones de parámetros distribuidos en 1120 tensores (80 capas × 14), lo que da ficheros de exactamente 6.737.255.616 bytes.

Su relevancia actual es limitada y de carácter más metodológico que práctico. El repositorio documenta un incidente de almacenamiento que provocó la pérdida de pesos y la recuperación de ficheros truncados: de los expertos 00 a 15, solo tres (01, 11 y 14) están verificados como completos; los expertos 16 a 63 están en entrenamiento (Pass A) y los doce adaptadores perdidos están a la espera de reentrenamiento (Pass B). Con 0 descargas, 1 like, 443,6 GB de tamaño y sin licencia ni idiomas declarados, debe tratarse como un artefacto de investigación en curso, no como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen2-72B) con adaptadores QLoRA por experto; el autor lo denomina MoE con expertos numerados 00-63 |
| Parametros totales | Base de 72B (Qwen/Qwen2-72B); cada adaptador de experto tiene 1,68B parametros (1120 tensores) |
| Parametros activos | no disponible (no se documenta el mecanismo de enrutado ni cuantos expertos se activan por token) |
| Longitud de contexto | no disponible (el repositorio no declara ventana de contexto) |
| Tipos de cuantizacion | Base congelada en 4-bit NF4; adaptadores almacenados en FP32. No se publican pesos GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; la base Qwen2-72B tiene sus propios terminos de uso) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA en FP32), un directorio `sft/expert_XX/best/` por experto con `adapter_model.safetensors`, `adapter_config.json`, `best_loss.txt` y `step.txt` |

## Arquitectura y entrenamiento

La informacion disponible describe un esquema de ajuste QLoRA: la base Qwen2-72B se mantiene congelada en cuantizacion 4-bit NF4 y sobre ella se entrena un adaptador LoRA independiente por experto, con rango 128, alpha 256 y pesos finales en FP32. Cada adaptador ocupa 1120 tensores, resultado de aplicar 14 modulos objetivo a lo largo de las 80 capas de la base. El entrenamiento de cada experto se ejecuta hasta convergencia con una paciencia declarada de 2000 pasos, y el criterio de finalizacion es el directorio `best/`, que el autor define como autoritativo.

No se especifica en la model card como se combinan los 64 adaptadores en tiempo de inferencia ni si existe un enrutador entrenado; tampoco se detalla la composicion del dataset de SFT, el numero de tokens por dominio, la procedencia de los datos ni si hubo fases de RLHF, DPO u otra alineacion posterior. No se declaran innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). El unico mecanismo de verificacion documentado es de integridad de fichero: un adaptador se considera completo solo si su tamano coincide con 6.737.255.616 bytes (8 + longitud de cabecera + maximo de los offsets de datos) y contiene 1120 tensores; el autor advierte explicitamente que la coincidencia de tamano por si sola no constituye verificacion.

La trazabilidad del repositorio forma parte de su estado tecnico: el 21 de septiembre de 2026 se borraron los pesos `best/` de los expertos 00 a 14 en un error de limpieza; el 22 de septiembre se recuperaron 12 ficheros desde el historial de git y se subieron, pero una auditoria de cabeceras revelo que estaban truncados; ese mismo dia se recreo el repositorio para liberar la cuota LFS retenida por los objetos borrados. El 23 de septiembre se aprueba el "Master Plan v2", que da por verificados los adaptadores 01, 11 y 14, arranca el Pass A (SFT desde cero de 14 a 63) y deja el Pass B para reentrenar los doce expertos perdidos. La politica de reanudacion resuelve primero en local y despues en Hugging Face, y prohibe expresamente subir `optimizer.pt` y directorios de paso al repositorio.

## Capacidades

- Generacion de texto y ajuste por dominio: la capacidad efectiva depende de la base Qwen2-72B mas el adaptador cargado; no se publican evaluaciones que la cuantifiquen.
- Especializacion financiera documentada en los dominios de trading y mercados, inversion y carteras, banca y prestamos, seguros y riesgo, contabilidad y auditoria, fiscalidad y cumplimiento, financiacion inmobiliaria e ingenieria financiera.
- Especializacion juridica documentada en derecho constitucional, penal, civil, mercantil, propiedad intelectual, internacional, fiscal y cumplimiento regulatorio.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modo de uso real: publicacion de checkpoints de entrenamiento y prueba de integridad de los mismos, no un endpoint de inferencia.

## Casos de uso

- Investigacion sobre especializacion por dominio en arquitecturas MoE: permite estudiar si un adaptador LoRA de 1,68B parametros por dominio es suficiente para desplazar el comportamiento de una base de 72B, comparando las perdidas de convergencia entre expertos financieros y juridicos del mismo pipeline.
- Auditoria y reproduccion de pipelines QLoRA a gran escala: el repositorio documenta configuracion (r=128, alpha=256, FP32), criterio de completitud por bytes y politica de reanudacion, lo que sirve como caso de estudio de gestion de cuota LFS y verificacion de artefactos.
- Ajuste fino continuado de dominio financiero regulado: un equipo con su propio corpus de banca o seguros podria partir del esquema y reentrenar el experto correspondiente, siempre que asuma que los adaptadores publicados para ese dominio estan pendientes de reentrenamiento.
- Analisis asistido de documentacion legal por rama del derecho: cargando el adaptador del area correspondiente (por ejemplo, el experto 14 de derecho fiscal, verificado como completo), se podria evaluar la calidad de respuestas sobre textos normativos, con supervision humana obligatoria.
- Generacion de resumenes y extraccion de entidades en documentos financieros: contabilidad, auditoria o cumplimiento normativo son dominios con vocabulario tecnico y plantillas repetitivas, donde un adaptador especializado puede reducir el ajuste manual de prompts sobre la base generica.
- Evaluacion comparativa de olvido catastrofico: al disponer de adaptadores entrenados por separado sobre la misma base congelada, es posible medir la degradacion fuera de dominio de cada experto y comparar estrategias de mezcla o enrutado.
- Plataforma de formacion interna para equipos financieros y juridicos: el modelo puede emplearse en entornos cerrados para generar borradores y material de estudio, nunca como sustituto de asesoramiento profesional.
- Reproduccion de resultados de convergencia: los ficheros `best_loss.txt` por experto permiten contrastar valores de perdida de SFT entre dominios, aunque los marcados con asterisco corresponden a ejecuciones cuyos pesos se perdieron y no deben usarse como referencia de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna evaluacion estandar, ni tampoco comparaciones con modelos de referencia. Lo unico documentado son las perdidas de entrenamiento (best loss) por experto, que no son una medida de calidad en tareas reales.

| Experto | Dominio | Best loss | Estado de los pesos |
|---|---|---|---|
| 00 | Trading y mercados | 0,0462* | perdido, reentrenamiento en cola (Pass B) |
| 01 | Inversion y carteras | 0,2746 | verificado completo |
| 02 | Banca y prestamos | 0,4176* | perdido, reentrenamiento en cola (Pass B) |
| 03 | Seguros y riesgo | 0,4429* | perdido, reentrenamiento en cola (Pass B) |
| 04 | Contabilidad y auditoria | 0,0619* | perdido, reentrenamiento en cola (Pass B) |
| 05 | Fiscalidad y cumplimiento | 0,2123* | perdido, reentrenamiento en cola (Pass B) |
| 06 | Financiacion inmobiliaria | 0,3637* | perdido, reentrenamiento en cola (Pass B) |
| 07 | Ingenieria financiera | 0,1999* | perdido, reentrenamiento en cola (Pass B) |
| 08 | Derecho constitucional | 0,0625* | perdido, reentrenamiento en cola (Pass B) |
| 09 | Derecho penal | 0,3451* | perdido, reentrenamiento en cola (Pass B) |
| 10 | Derecho civil | 0,0612* | perdido, reentrenamiento en cola (Pass B) |
| 11 | Derecho mercantil | 0,4710 | verificado completo |
| 12 | Propiedad intelectual | 0,1794* | perdido, reentrenamiento en cola (Pass B) |
| 13 | Derecho internacional | 0,4319* | perdido, reentrenamiento en cola (Pass B) |
| 14 | Derecho fiscal | 0,0086 | verificado completo |
| 15 | Cumplimiento regulatorio | 0,5570 | verificado completo |
| 16-63 | sin detallar | no disponible | Pass A en ejecucion (16 en entrenamiento) |

Los valores marcados con asterisco proceden de una ejecucion anterior cuyos pesos se perdieron; el autor indica expresamente que son referencia y no afirmaciones de rendimiento.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 443,6 GB. Cada adaptador individual son 6.737.255.616 bytes (aproximadamente 6,7 GB en FP32). Los 64 adaptadores completos sumarian del orden de 431 GB, coherente con el tamano total del repositorio.
- Limitacion de partida: el repositorio no incluye los pesos de la base. Para ejecutar cualquier cosa hay que descargar por separado Qwen/Qwen2-72B y reproducir el esquema de cuantizacion 4-bit NF4.
- VRAM para inferencia de la base: en 4-bit NF4 se puede estimar en torno a 36-40 GB solo para los pesos, mas cache KV y sobrecarga; en FP16/BF16 serian aproximadamente 145 GB. Son estimaciones derivadas del tamano de 72B, no cifras publicadas por el autor.
- GPU recomendadas: una A100 80 GB o H100 80 GB para la base en 4-bit con contexto moderado; para FP16 se requiere configuracion multi-GPU (por ejemplo, 2 x A100 80 GB o superior). No se especifica el hardware de entrenamiento utilizado.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar la base de 72B ni siquiera en 4 bits; solo seria viable con descarga a CPU, con latencias muy altas. Un adaptador aislado en FP32 si cabe en 24 GB, pero carece de utilidad sin la base.
- Opciones de despliegue: al ser adaptadores PEFT, las vias naturales son transformers + PEFT y servidores con soporte de LoRA como vLLM o TGI. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama exigirian convertir la base y los adaptadores por cuenta propia.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No hay una categoria estricta de comparacion para este repositorio, porque no publica pesos completos sino adaptadores QLoRA por dominio sobre una base de terceros. La tabla contrasta la propuesta con la base que declara y con una referencia MoE publica; los datos de las alternativas provienen de sus fichas publicas, no del repositorio analizado.

| Modelo | Parametros | Activos | Contexto | Formato publicado | Licencia | Rendimiento |
|---|---|---|---|---|---|---|
| Morpho-72B-MoE-Checkpoints | Base 72B + 64 adaptadores de 1,68B | no disponible | no disponible | Adaptadores LoRA safetensors FP32 | no disponible | Sin benchmarks publicados; solo perdidas de SFT |
| Qwen/Qwen2-72B (base declarada) | 72B | 72B (denso) | segun su ficha publica, 128K tokens | safetensors | terminos propios de Qwen | Ampliamente evaluado en benchmarks publicos, no reproducidos aqui |
| Mixtral 8x7B (referencia MoE, no comparable en formato) | 46,7B | 12,9B | 32K | safetensors | Apache 2.0 | Benchmarks publicos disponibles |

La diferencia fundamental es de naturaleza: Qwen2-72B y Mixtral 8x7B son modelos desplegables con evaluaciones publicas, mientras que Morpho-72B-MoE-Checkpoints es un conjunto de artefactos de entrenamiento parcialmente perdidos y sin evaluar.

## Limitaciones y advertencias

- No es un modelo listo para usar: el repositorio contiene checkpoints de SFT, no pesos completos ni un pipeline de inferencia. Falta la base Qwen2-72B y falta el mecanismo que combine los adaptadores.
- Estado muy incompleto: de los expertos 00 a 15, solo 01, 11 y 14 estan verificados como completos; doce adaptadores se perdieron o se recuperaron truncados y estan pendientes de reentrenamiento; los expertos 16 a 63 siguen en entrenamiento.
- Los ficheros recuperados desde el historial de git fueron auditados y resultaron truncados, por lo que cualquier descarga de esos objetos puede dar un adaptador corrupto.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluacion humana, ni pruebas de regresion. La perdida de SFT no es un indicador valido de calidad.
- Los valores de perdida marcados con asterisco corresponden a ejecuciones cuyos pesos ya no existen; el autor los califica de referencia, no de afirmacion de rendimiento.
- Licencia no declarada en el repositorio. Esto genera incertidumbre legal para uso comercial y obliga a revisar por separado los terminos de Qwen2-72B, que no son de dominio publico ni equivalen a una licencia permisiva.
- Dataset de SFT no documentado: no se indica composicion, volumen de tokens, procedencia, filtrado ni posibles sesgos. Tampoco se declara si hubo datos sinteticos o contaminacion de benchmarks.
- Idiomas no declarados: se desconoce si la especializacion por dominio conserva el comportamiento multilingue de la base o lo degrada.
- Riesgo de alucinacion no medido: en dominios financieros y juridicos, donde una respuesta incorrecta puede tener consecuencias regulatorias o economicas, el modelo no debe usarse sin verificacion humana.
- Riesgo de olvido catastrofico por experto: el entrenamiento a convergencia sobre un unico dominio puede degradar el comportamiento general; no se publica ninguna medicion al respecto.
- Uso de la base en 4-bit NF4: la inferencia debe reproducir el mismo esquema de cuantizacion para que los adaptadores sean coherentes, lo que puede introducir una degradacion adicional respecto a una base en precision completa.
- Artefacto en movimiento: el repositorio se actualiza a medida que avanzan los Pass A y B, por lo que el contenido y las rutas pueden cambiar sin aviso y sin versionado estable.
- Riesgo de dependencia de un unico mantenedor y de un flujo de trabajo con incidentes previos de perdida de datos; conviene no tratarlo como fuente de verdad para produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bluemorpholimited/Morpho-72B-MoE-Checkpoints
- Modelo base declarado en la model card: https://huggingface.co/Qwen/Qwen2-72B
- Libreria PEFT (formato de los adaptadores): https://github.com/huggingface/peft
- Articulo original de QLoRA: https://arxiv.org/abs/2305.14314
- Blog de la familia Qwen2: https://qwenlm.github.io/blog/qwen2/
- Paper, demo, repositorio de codigo propio o pagina de proyecto de Morpho: no disponible en la informacion proporcionada.
