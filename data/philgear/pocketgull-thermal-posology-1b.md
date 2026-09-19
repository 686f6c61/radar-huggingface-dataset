# philgear/pocketgull-thermal-posology-1b

## Resumen

PocketGull Thermal Posology 1B es un adaptador LoRA de tipo PEFT desarrollado por Phillip Gear (PocketGull LLC, Oregón) sobre el modelo base google/gemma-3-1b-it. Su dominio declarado es la posologia clinica ajustada a estres termico: calculo de WBGT (Wet Bulb Globe Temperature) a partir de datos microclimaticos NOAA, deteccion de anhidrosis inducida por farmacos (anticolinergicos, inhibidores de la anhidrasa carbonica), riesgo de lesion renal aguda (AKI) por deshidratacion en pacientes tratados con diureticos, IECAs/ARAs o SGLT2i, y retencion de litio en olas de calor por encima de 43 grados centigrados.

El modelo se presenta como motor de apoyo a la decision clinica para profesionales sanitarios, con enfasis en computacion local en el borde (edge) y despliegue privado en Vertex AI para evitar la retencion de informacion de salud protegida (PHI). El autor lo enmarca explicitamente como herramienta no sujeta a la seccion 520(o) de la FDA (CDS no dispositivo) y afirma que los datos de ajuste cumplen con los estandares de desidentificacion de HIPAA 164.514 Safe Harbor.

Se trata de un adaptador de nicho, no de un modelo de proposito general: 1 000 millones de parametros en el modelo base, licencia declarada apache-2.0 en el repositorio del adaptador, idioma unico declarado (ingles) y cero descargas o "likes" en el momento de la consulta. La relevancia principal es metodologica: ilustra el patron de especializacion de modelos pequenos en dominios clinicos regulados mediante DPO sobre un modelo base abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only google/gemma-3-1b-it |
| Parametros totales | no disponible para el adaptador (el modelo base tiene aproximadamente 1 000 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base google/gemma-3-1b-it soporta 32 768 tokens segun la documentacion de Google |
| Tipos de cuantizacion | no disponible (el ejemplo de la model card carga los pesos en bfloat16); al ser un adaptador, los formatos heredados dependen de la conversion del modelo base, incluidos GGUF y AWQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 declarada para el adaptador; el modelo base google/gemma-3-1b-it se rige por los terminos de uso de Gemma de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria peft) |

Otros metadatos: pipeline text-generation, region us, autor philgear, repositorio creado y actualizado el 18 de septiembre de 2026 segun los metadatos de HuggingFace (fecha futura respecto a la consulta, probablemente un error de registro). Tags declarados: peft, gemma-3, lora, clinical-nlp, healthcare, hipaa-safe-harbor, open-science, pocketgull, nih-medquad, who-mhgap.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 1B: un transformer decoder-only de aproximadamente 1 000 millones de parametros, afinado para instrucciones (variante -it) por Google. Sobre esta base, PocketGull anade un adaptador LoRA que se carga con PeftModel.from_pretrained y se infiere conjuntamente con el modelo base, sin modificar los pesos originales. No se detallan en la model card el rango del adaptador, las capas objetivo, el alpha ni el numero de parametros entrenados, por lo que esos datos quedan como no disponibles.

El entrenamiento del adaptador se realizo, segun el autor, mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos especificos del dominio, desidentificados conforme a HIPAA 164.514 Safe Harbor. Los tags del repositorio apuntan a los corpus NIH MedQuad y WHO mhGAP como posibles fuentes, aunque no se especifica la composicion exacta del dataset, el numero de pares de preferencia, la mezcla de datos ni si hubo etapas previas de SFT. Tampoco se publican hiperparametros de entrenamiento, semillas ni particiones de validacion.

Como rasgos tecnicos diferenciales se declaran tres: la calibracion de posologia frente a WBGT y olas de calor, la deteccion de fallo sudoriparo inducido por farmacos (anticholinergicos e inhibidores de la anhidrasa carbonica, como topiramato) y la evaluacion de riesgos de retencion de litio y de AKI por deshidratacion. No se documentan innovaciones de inferencia como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Generacion de texto clinico en ingles con temperatura de muestreo baja recomendada (0,2 en el ejemplo del autor) para respuestas mas deterministas.
- Razonamiento multi-paso encadenado sobre datos de entrada heterogeneos: temperatura ambiente, humedad relativa, radiacion solar, edad del paciente, farmacos y dosis.
- Calculo e interpretacion de indices de estres termico, en particular WBGT, a partir de descripciones textuales de condiciones microclimaticas.
- Deteccion de anhidrosis farmacoinducida y valoracion del riesgo de hipertermia central, con directrices de monitorizacion clinica.
- Evaluacion de riesgo de lesion renal aguda por deshidratacion en pacientes polimedicados (diureticos, IECAs/ARAs, SGLT2i).
- Ajuste de posologia hidrica horaria y recomendaciones de hidratacion en escenarios de calor extremo.
- Analisis de interacciones farmacologicas con base metabolica, incluido el metabolismo CYP450 (ejemplo de la model card: hierba de San Juan con warfarina).
- Razonamiento pediatrico y geriatrico aplicado a poblaciones vulnerables al calor.
- Soporte de tool calling o function calling: no disponible (no declarado en la model card).
- Soporte de agentes autonomos: no disponible; el modelo se presenta como componente de apoyo a la decision, no como agente con ejecucion de acciones.
- Capacidades multilingues: no; el unico idioma declarado es el ingles.
- Capacidades especiales adicionales (vision, audio, thinking mode explicito): no disponibles.

## Casos de uso

- Apoyo a urgencias por golpe de calor: el clinico introduce temperatura, humedad, radiacion y la medicacion del paciente, y el modelo devuelve una estimacion de WBGT, el riesgo de fallo sudoriparo y una pauta de hidratacion horaria; encaja porque combina variables ambientales y farmacologicas en una sola inferencia.
- Revision de polifarmacia en olas de calor declaradas: dado un listado de farmacos (diureticos, IECAs, anticholinergicos), el modelo identifica combinaciones que agravan la deshidratacion o la retencion de litio, util como lista de comprobacion previa a la consulta.
- Triaje de pacientes cronicos en atencion primaria durante episodios de calor extremo: permite priorizar avisos a pacientes mayores de 65 anos con tratamientos de riesgo a partir de datos meteorologicos publicos y su historial farmacologico.
- Formacion y simulacion clinica: el modelo genera escenarios docentes (por ejemplo, paciente pediatrico con topiramato en alerta por calor excesivo) para entrenar a residentes en la identificacion de riesgos termicos farmacoinducidos.
- Monitorizacion remota en residencias y centros de dia: integrado en un flujo local sin retencion de PHI, puede generar alertas textuales cuando la combinacion de clima y medicacion cruza umbrales definidos por el centro.
- Investigacion epidemiologica asistida: extraccion y estructuracion de hipotesis sobre correlaciones entre exposicion termica, farmacos y desenlaces renales, como paso previo a analisis estadisticos formales.
- Soporte documental para servicios de farmacia hospitalaria: generacion de notas explicativas sobre por que un tratamiento concreto requiere ajuste o monitorizacion durante una ola de calor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MedQA, MedMCQA ni evaluaciones clinicas especificas, ni comparaciones cuantitativas con otros adaptadores. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los resultados obtenidos corresponden a paginas de ayuda de YouTube y a anuncios de bicicletas de montana, por lo que no aportan datos de rendimiento ni referencias tecnicas.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 2,5-3 GB para el modelo base mas el adaptador, es decir, en torno a 3-4 GB contando cache de claves y valores con contextos moderados.
- Cuantizacion: no se publican pesos cuantizados del adaptador. Para usarlo en 4 bits o 8 bits hay que cuantizar el modelo base (por ejemplo, bitsandbytes NF4) y aplicar el adaptador encima; para GGUF es necesario fusionar el adaptador con el base mediante merge_and_unload y convertir el resultado.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM funciona; RTX 3060, RTX 4060, RTX 4070, RTX 4090, Apple Silicon con Metal y GPUs de datacenter (A100, H100, L4) son sobredimensionadas para este tamano y se justificarian solo por despliegue concurrente.
- Cabe en GPU consumer: si, de forma holgada; en CPU tambien es viable con cuantizacion Q4 o Q5.
- Opciones de despliegue: transformers mas peft (patron documentado por el autor), vLLM con soporte de adaptadores LoRA, Text Generation Inference, y llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, latencia de primera token ni pruebas de carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PocketGull Thermal Posology 1B | Adaptador sobre base de ~1 000 M | No especificado (base con 32 768 tokens) | Posologia clinica y estres termico | apache-2.0 declarada (base con terminos de Gemma) | HuggingFace, 0 descargas |
| google/gemma-3-1b-it | ~1 000 M | 32 768 tokens | Proposito general, instrucciones | Terminos de uso de Gemma | HuggingFace, ampliamente utilizado |
| Llama 3.2 1B Instruct | ~1 200 M | 128 000 tokens | Proposito general, instrucciones | Licencia comunitaria de Llama | HuggingFace, ampliamente utilizado |
| Qwen2.5 1.5B Instruct | ~1 500 M | 32 000 tokens | Proposito general, instrucciones y codigo | apache-2.0 | HuggingFace, ampliamente utilizado |

La comparacion es estructural, no de rendimiento: no existen metricas publicadas del adaptador PocketGull, por lo que no es posible afirmar superioridad ni inferioridad frente a las alternativas generalistas en tareas clinicas. La ventaja diferencial declarada es la especializacion en un dominio muy concreto y la posibilidad de ejecucion local sin retencion de datos; la desventaja es la ausencia total de evaluacion publica y de adopcion verificable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad clinica, exactitud factual ni tasas de alucinacion.
- Riesgo alto de alucinacion en dominio medico: un modelo de 1 000 millones de parametros puede generar posologias, umbrales o interacciones farmacologicas verosimiles pero incorrectas. No debe usarse sin supervision de un profesional sanitario licenciado.
- Estado regulatorio: el autor lo declara expresamente como herramienta de apoyo no sujeta a la seccion 520(o) de la FDA. No es un dispositivo medico ni ha recibido autorizacion regulatoria alguna.
- Inconsistencia de licencia: el repositorio declara apache-2.0, pero el modelo base google/gemma-3-1b-it esta sujeto a los terminos de uso de Gemma. Cualquier uso comercial debe verificar el cumplimiento de ambas licencias, ya que el adaptador no puede desvincularse del modelo base.
- Idioma unico: solo se declara ingles. No hay evidencia de comportamiento en castellano ni en otras lenguas.
- Contexto no documentado: la model card no especifica la ventana de contexto efectiva del adaptador, lo que dificulta dimensionar casos de uso con historiales clinicos largos.
- Procedencia de datos incompleta: se citan HIPAA Safe Harbor y los tags NIH MedQuad y WHO mhGAP, pero no se publica la composicion del dataset, los criterios de curacion ni auditorias de sesgo.
- Sesgos potenciales: los datos de entrenamiento pueden infrarrepresentar poblaciones pediatricas, geriatricas, embarazadas o de rentas bajas, colectivos especialmente relevantes en el contexto de olas de calor.
- Trazabilidad limitada: cero descargas y cero valoraciones en el momento de la consulta, sin historial de versiones ni issues publicas en el repositorio de HuggingFace.
- Metadatos anómalos: la fecha de creacion registrada (18 de septiembre de 2026) es posterior a la fecha de consulta, lo que sugiere un error de registro y dificulta la verificacion temporal del artefacto.
- Prohibicion de uso como sustituto del juicio clinico: cualquier salida debe tratarse como borrador sujeto a revision, especialmente en decisiones de ajuste de dosis.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/philgear/pocketgull-thermal-posology-1b
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- DOI de Zenodo citado por el autor: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio de la organizacion: https://pocketgull.com
- Sitio del proyecto: https://pocketgull.app

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su paper, su repositorio de codigo o demostraciones. Los unicos resultados obtenidos fueron paginas de soporte de YouTube y anuncios de bicicletas de montana, sin relacion con el modelo.
