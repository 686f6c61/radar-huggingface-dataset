# inclusionAI/LingSante-3.1-air-VL

## Resumen

LingSante-3.1-air-VL es un modelo multimodal nativo de tipo mezcla de expertos (MoE) desarrollado por el equipo de salud de Ant Group y publicado bajo el paraguas de la organizacion inclusionAI. Con 124.848 millones de parametros totales y 5,5 mil millones de parametros activos por token, esta construido sobre Ling-3.0-flash-VL y se presenta como el primer modelo medico multimodal de gran tamano que Ant Group libera como codigo abierto. Acepta entradas de texto e imagen y ofrece una ventana de contexto de 256.000 tokens.

El modelo esta orientado a cuatro areas clinicas concretas: informes de imagen medica, evaluacion sanitaria multimodal (reconocimiento de enfermedades cutaneas, analisis dietetico y nutricional e interpretacion de informes medicos), busqueda medica y sintesis de evidencia, y agentes GUI sanitarios. Ademas conserva capacidades generales de comprension multimodal, documentos, graficos y uso de herramientas, gracias a un entrenamiento conjunto que incorpora repeticion de datos multimodales generales.

Su relevancia actual radica en que combina un diseno MoE de bajo coste de inferencia (5,5B activos) con contexto largo y capacidades agenticas en un dominio, el sanitario, donde hasta ahora predominaban modelos propietarios o adaptaciones de menor alcance. La licencia MIT facilita su evaluacion y experimentacion, aunque el propio autor advierte que es un modelo de investigacion y no un dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal nativa (tipo `bailing_moe_v3_vl`) |
| Parametros totales | 124.848.460.496 (124,8B) |
| Parametros activos | 5,5B por token |
| Longitud de contexto | 256K tokens (262.144; contexto nativo de 131.072 ampliado con YaRN factor 2.0) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors; el runtime recomienda FP8 en Hopper para decode) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 249,7 GB) |

## Arquitectura y entrenamiento

LingSante-3.1-air-VL emplea una arquitectura transformer de mezcla de expertos con soporte multimodal nativo, identificada en Hugging Face con el tipo `bailing_moe_v3_vl` y que requiere `trust-remote-code`. El modelo activa 5,5B parametros de un total de 124,8B por token, lo que reduce el coste computacional de la inferencia respecto a un modelo denso del mismo tamano. Incorpora decodificacion especulativa MTP (NEXTN) y optimizaciones de contexto largo, con un contexto nativo de 131.072 tokens que se extiende hasta 262.144 mediante escalado RoPE de tipo YaRN (factor 2.0, `rope_theta` 6.000.000 y `partial_rotary_factor` 0,5).

El entrenamiento parte de Ling-3.0-flash-VL y se especializa en cuatro dominios clinicos mediante entrenamiento conjunto que intercala repeticion de datos multimodales generales y alineacion en tareas generales, con el objetivo de preservar comprension multimodal, OCR, documentos, graficos, busqueda multimodal e interaccion GUI. La model card no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El runtime incluye parsers especificos de razonamiento y de tool calling (`ling3`), lo que sugiere soporte de modos de pensamiento y llamada a herramientas.

## Capacidades

- Comprension y razonamiento multimodal medico: interpreta imagenes de imagen medica considerando historial del paciente, tecnica e calidad de imagen, y redacta secciones de hallazgos e impresion.
- Interpretacion conjunta de multiples imagenes y deteccion de 8-9 tipos de hallazgos positivos en una radiografia de torax compleja (cardiomegalia, derrame pleural, atelectasia, consolidacion, neumonia, neumotorax, entre otros).
- Evaluacion sanitaria con preguntas de seguimiento: cubre mas de 120 enfermedades cutaneas y toma historial en varios turnos antes de emitir una valoracion.
- Analisis dietetico y nutricional: identifica ingredientes solapados o mezclados, descompone platos complejos, estima porciones y analiza contenido nutricional.
- Interpretacion de informes medicos: relaciona recuentos sanguineos con marcadores inflamatorios e inmunitarios para priorizar acciones de seguimiento.
- Busqueda medica y sintesis de evidencia: busqueda imagen-a-imagen, recuperacion de articulos, guias clinicas y casos similares, con uso de herramientas de imagen y cajas delimitadoras para verificar lesiones.
- Agentes GUI sanitarios: reserva de citas (seleccion de hospital, departamento, medico y franja horaria) y compra de medicamentos (busqueda, especificaciones, receta, direccion, gestion de pop-ups y validaciones).
- Soporte de tool calling y function calling mediante parser `ling3` en SGLang.
- Modo de razonamiento activable (`enable_thinking` en el template de chat).
- Capacidades generales de comprension multimodal, OCR, documentos y graficos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Borrador de informes de radiologia: el modelo recibe una radiografia de torax y redacta hallazgos e impresion estructurados, revisando tecnica y calidad de imagen; su contexto de 256K permite adjuntar historial clinico e informes previos en la misma peticion.
- Triaje dermatologico asistido: con una fotografia de una lesion cutanea y una entrevista multi-turno (zona afectada, duracion, picor o dolor, antecedentes), el modelo cubre mas de 120 enfermedades cutaneas y sugiere valoracion, siempre con revision profesional.
- Analisis nutricional de comidas: a partir de una foto de un plato, descompone ingredientes, estima porciones y calcula nutrientes, util en aplicaciones de seguimiento dietetico.
- Interpretacion de analiticas: procesa informes de laboratorio y cruza recuentos sanguineos con marcadores inflamatorios para priorizar seguimientos, integrable en portales de paciente.
- Busqueda medica con evidencia trazable: encadena imagen, busqueda de articulos y guias, verificacion de lesiones con cajas delimitadoras y redaccion de respuesta citando la evidencia, lo que facilita la auditoria del razonamiento.
- Agente GUI para gestion sanitaria: automatiza reservas de citas y compras de medicamentos en aplicaciones reales con interfaces cambiantes, estados de login, pop-ups y validaciones, siempre con un entorno externo que mantiene estado y valida acciones.
- Asistente documental clinico: gracias a su contexto largo y a las capacidades de OCR y comprension de documentos, puede resumir historiales extensos o comparar informes sucesivos de un mismo paciente.

## Benchmarks y rendimiento

La model card incluye graficos de evaluacion (imagenes `assets/benchmark-overview.png` y `assets/benchmark-results.png`) que cubren aplicaciones sanitarias multimodales, informes de imagen, razonamiento medico multimodal complejo, comprension medica multimodal, texto medico, tareas multimodales generales, documentos y graficos, busqueda multimodal y agentes GUI. Sin embargo, los valores numericos no estan disponibles en el texto proporcionado.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia recomendada con SGLang (imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL`), que incluye soporte multimodal nativo, decodificacion especulativa MTP (NEXTN) y optimizaciones de contexto largo.
- Configuracion de referencia del autor: 4 GPUs de clase 141 GB con tensor parallelism TP4 para 256K de contexto.
- Alternativa indicada: 8 GPUs H100/H800 de 80 GB con `--tp 8`.
- En GPUs Hopper pueden activarse optimizaciones de decode con `SGLANG_ENABLE_FP8_BLOCK_GEMV=1` y `SGLANG_ENABLE_FUSED_KDA_OUTPUT_QUANT=1`.
- No cabe en GPUs de consumo: con 124,8B parametros totales y pesos en safetensors de aproximadamente 250 GB, se requiere despliegue multi-GPU de centro de datos.
- VRAM estimada: no disponible de forma explicita; el repo ocupa 249,7 GB en safetensors, a lo que hay que sumar cache KV para contexto largo.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LingSante-3.1-air-VL | 124,8B totales / 5,5B activos | 256K | MIT | Multimodal medico MoE, base Ling-3.0-flash-VL |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion, no dispositivo medico: las salidas pueden ser incompletas o inexactas y no sustituyen el consejo, diagnostico o tratamiento profesional.
- Los usos de alto riesgo requieren revision por personal cualificado, validacion independiente y cumplimiento de la normativa de privacidad, seguridad y salud aplicable.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente critico en contexto clinico.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible, lo que impide confirmar cobertura multilingue mas alla de lo que indique el autor.
- Los flujos de busqueda, uso de herramientas y GUI requieren un entorno externo que proporcione herramientas, mantenga estado y valide acciones; el modelo por si solo no ejecuta esas tareas.
- La licencia MIT permite uso comercial, pero no exime de las obligaciones regulatorias del sector sanitario.
- Requiere `trust-remote-code` y un runtime especifico (SGLang), lo que limita la portabilidad a otros motores de inferencia.
- No se han publicado cifras de benchmarks en la informacion disponible, lo que dificulta evaluar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Organizacion en Hugging Face: https://huggingface.co/inclusionAI
- Organizacion en ModelScope: https://modelscope.cn/organization/inclusionAI
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Imagen de SGLang para despliegue: `lmsysorg/sglang:dev-Ling-3.0-flash-VL`
