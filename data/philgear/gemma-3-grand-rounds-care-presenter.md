# philgear/gemma-3-grand-rounds-care-presenter

## Resumen

PocketGull Gemma 3 Grand Rounds 7-Slide & CARE Case Publisher es un adaptador LoRA entrenado sobre el modelo base `google/gemma-3-12b-it` de Google DeepMind. Lo desarrolla PocketGull LLC, una organizacion con registro en el estado de Oregón (258869891), y esta orientado a una tarea muy concreta: compilar presentaciones academicas de tipo Grand Rounds en formato de 7 diapositivas y generar informes de casos clinicos conformes a las directrices CARE (CAse REport guidelines).

El adaptador se ha afinado mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos que, segun la model card, cumplen estrictamente con los estandares de desidentificacion de la norma HIPAA §164.514 Safe Harbor. El modelo se distribuye bajo licencia Apache 2.0 y esta etiquetado exclusivamente para el idioma ingles.

La relevancia de esta ficha es acotada: se trata de un adaptador PEFT de nicho, con cero descargas y cero likes en el momento de la consulta, publicado el 7 de noviembre de 2026, y sin resultados de benchmarks publicados. Su interes radica en el caso de uso vertical (publicacion de casos clinicos academicos) y en el marco de gobernanza que declara, no en un rendimiento generalista demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `google/gemma-3-12b-it` |
| Parametros totales | 12 000 millones en el modelo base (no disponible el numero exacto de parametros entrenables del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 12B IT) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato PEFT; el modelo base admite cuantizacion, pero no se especifica) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | PEFT/LoRA (adaptador sobre safetensors del modelo base) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-3-12b-it`, un transformer decoder-only de 12 000 millones de parametros de la familia Gemma 3 de Google DeepMind. La tecnica de ajuste es LoRA (Low-Rank Adaptation) gestionada mediante la libreria PEFT, lo que implica que solo se entrenan matrices de bajo rango inyectadas en las capas del modelo base, mientras los pesos originales permanecen congelados.

El metodo de alineacion declarado es Direct Preference Optimization (DPO), aplicado sobre datos clinicos especificos del dominio y desidentificados conforme a HIPAA §164.514 Safe Harbor. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la configuracion de rangos LoRA ni los hiperparametros de DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de texto en ingles orientada a la redaccion de contenido clinico academico.
- Compilacion de estructuras de presentaciones Grand Rounds en formato de 7 diapositivas.
- Generacion de informes de casos clinicos alineados con las directrices CARE.
- Generacion condicionada por prompt de caso clinico (el ejemplo de la model card usa un caso de sindrome de vasoconstriccion cerebral reversible).
- Desidentificacion declarada conforme a HIPAA §164.514 Safe Harbor en el pipeline de datos de entrenamiento (no se documenta como capacidad de inferencia verificada).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma.

## Casos de uso

- Preparacion de sesiones clinicas academicas: dado un resumen de caso, el adaptador genera el esqueleto de una presentacion de 7 diapositivas (presentacion, historia, exploracion, pruebas, diagnostico diferencial, manejo y conclusiones), lo que reduce el tiempo de montaje de material docente.
- Redaccion de informes de caso para revistas medicas: genera la estructura conforme a CARE (titulo, palabras clave, resumen, introduccion, presentacion del caso, discusion, conclusiones y consentimiento), util para residentes que preparan su primer case report.
- Docencia en sesiones de Grand Rounds hospitalarias: sirve como borrador inicial que el clinico revisa y edita, con el modelo base de 12B ejecutandose en infraestructura local para evitar la salida de datos del perimetro.
- Formacion en metodologia de publicacion: permite a tutores mostrar la diferencia entre un borrador generado y un informe CARE completo, comparando secciones y detectando omisiones.
- Prototipado de asistentes de documentacion clinica en entornos con requisitos de privacidad: al poder desplegarse en Vertex AI privado o en computo local, encaja en arquitecturas donde no se permite enviar texto clinico a APIs publicas.
- Estandarizacion de plantillas en un departamento: integrado en un pipeline interno, puede generar borradores homogeneos de presentaciones y casos, que luego pasan por revision humana antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 12 000 millones de parametros; en bfloat16 requiere aproximadamente 24 GB de VRAM, en cuantizacion de 8 bits en torno a 12-13 GB y en 4 bits en torno a 7-8 GB (estimaciones derivadas del tamano del modelo base, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en bfloat16 con margen de contexto; RTX 4090 (24 GB) para bfloat16 justo o cuantizacion de 8 bits; RTX 3090/4080 (16-24 GB) para cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en GPUs con 16 GB o mas usando cuantizacion; en 24 GB es viable en bfloat16 con contexto moderado.
- Opciones de despliegue: el adaptador se carga con `transformers` + `peft` (ejemplo oficial de la model card); el modelo base fusionado puede servirse con vLLM, TGI o llama.cpp/Ollama tras conversion a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| philgear/gemma-3-grand-rounds-care-presenter | 12B (base) + LoRA | no disponible | Adaptador clinico para Grand Rounds y CARE | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-3-12b-it | 12B | no disponible en la informacion | Modelo base generalista e instruido | Gemma Terms of Use (no verificada en esta busqueda) | Hugging Face, ampliamente usado |
| Adaptadores clinicos LoRA sobre Llama o Mistral | variable | variable | Ajuste de dominio sanitario | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: el adaptador esta entrenado para una tarea concreta (estructura de 7 diapositivas y CARE) y no debe evaluarse como modelo clinico general.
- Riesgo de alucinacion: al ser un modelo generativo de 12B, puede inventar hallazgos, referencias o secciones CARE incompletas; requiere revision por un profesional licenciado.
- Idioma: solo ingles; no se declara soporte de castellano ni de otras lenguas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Sin adopcion verificable: cero descargas y cero likes en el momento de la consulta; no hay senal de uso en produccion.
- Marco regulatorio declarado: el autor lo presenta como herramienta de soporte de evidencia para profesionales (FDA 520(o) Non-Device CDS), lo que implica que no sustituye el juicio clinico.
- Privacidad: la model card afirma cero retencion de PHI y diseno para computo local o Vertex AI privado, pero no se aporta auditoria independiente de esa afirmacion.
- Licencia: Apache 2.0 para el adaptador, pero el uso del modelo base Gemma 3 queda sujeto a los terminos de Google, que deben revisarse por separado.
- Fecha de publicacion futura (2026-11-07): conviene verificar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/philgear/gemma-3-grand-rounds-care-presenter
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Organizacion: https://pocketgull.com
- DOI Zenodo: https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Wikipedia sobre Gemma: https://en.wikipedia.org/wiki/Gemma_(language_model)
