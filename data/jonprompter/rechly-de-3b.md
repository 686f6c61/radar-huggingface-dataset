# jonprompter/rechly-de-3b

## Resumen

Rechly-DE-3B es un modelo de lenguaje especializado en facturacion electronica alemana, contabilidad y cumplimiento fiscal, desarrollado por el usuario jonprompter. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen2.5-3B-Instruct de Alibaba, con 3.085.938.688 parametros totales segun los pesos en safetensors. El modelo aborda un problema regulatorio concreto: la obligatoriedad de las facturas electronicas estructuradas (E-Rechnung) en Alemania bajo el Wachstumschancengesetz (seccion 14 UStG), que afecta a mas de 3,5 millones de empresas y exige formatos como EN 16931, XRechnung 3.0 y ZUGFeRD 2.3.

El modelo se presenta como una alternativa local y sin dependencias de nube para el procesamiento de facturas, con el argumento de que el envio de datos financieros a servicios en la nube de terceros plantea riesgos de cumplimiento con el RGPD/DSGVO. Rechly-DE-3B esta disenado para ejecutarse en dispositivos Apple Silicon, VPS Linux ligeros o CPUs estandar, con un consumo declarado inferior a 2,5 GB de RAM en cuantizacion Q4_K_M.

La relevancia del modelo radica en su enfoque vertical: en lugar de competir en capacidades generales, se especializa en tareas de extraccion de datos de facturas, clasificacion contable segun cuentas DATEV SKR03/SKR04 y generacion de estructuras XML conformes a los estandares alemanes. El modelo se distribuye bajo licencia Apache 2.0 y esta disponible en formatos MLX y GGUF, con soporte para Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit; GGUF Q4_K_M (1,84 GB); MLX |
| Idiomas soportados | Aleman (de), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

Rechly-DE-3B es un fine-tuning del modelo Qwen2.5-3B-Instruct, que emplea una arquitectura transformer decoder-only densa con 3.085.938.688 parametros. El modelo base Qwen2.5-3B-Instruct es conocido por su soporte de contexto largo, generacion estructurada y capacidades multilingues; sin embargo, la model card no especifica la longitud de contexto efectiva del modelo ajustado ni si se modifico durante el fine-tuning.

La model card indica que el modelo fue ajustado sobre "ley fiscal alemana estatutaria curada" y "mas de 30 cuentas estandar DATEV SKR03/SKR04", pero no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias. El autor menciona la inclusion de gramaticas GBNF oficiales (`grammars/*.gbnf`) para garantizar la adherencia a esquemas JSON, lo que constituye una innovacion a nivel de despliegue mas que de arquitectura del modelo. Tambien se menciona un pipeline de OCR multimodal basado en Qwen2.5-VL, pero no se especifica si forma parte del mismo checkpoint o es un componente separado del ecosistema.

## Capacidades

- Generacion de texto y conversacion en aleman e ingles.
- Extraccion de datos estructurados a partir de texto no estructurado (notas de voz, correos, mensajes) para generar JSON de facturas.
- Deteccion automatica de supuestos de exencion fiscal: seccion 19 UStG (Kleinunternehmer), seccion 13b UStG (Reverse Charge), seccion 4 Nr. 1b (EU B2B) y seccion 4 Nr. 1a (exportacion a terceros paises).
- Clasificacion contable segun cuentas DATEV SKR03 y SKR04 (mas de 30 cuentas verificadas segun el autor).
- Generacion de estructuras E-Rechnung conformes a EN 16931, XRechnung 3.0 y ZUGFeRD 2.3.
- Generacion nativa de PDF/A-3 hibrido con ZUGFeRD 2.3 (segun la model card).
- Exportacion por lotes en formato DATEV EXTF 700 (CSV y DUO ZIP).
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no se menciona explicitamente.
- Capacidades multimodales (OCR de recibos): la model card menciona un pipeline basado en Qwen2.5-VL, pero no queda claro si el modelo Rechly-DE-3B en si es multimodal o si se trata de un componente del ecosistema.
- Modo thinking: no disponible.

## Casos de uso

- Generacion automatizada de facturas a partir de texto libre: el modelo convierte descripciones en lenguaje natural (por ejemplo, "Rechnung an Kanzlei Schmidt: 10 Std. IT-Forensik a 140 EUR...") en JSON estructurado con cliente, cantidades, precios, fechas de vencimiento y tipos de IVA, lo que resulta adecuado para integrarse en herramientas de facturacion para pymes alemanas.
- Clasificacion contable DATEV: dado un gasto descrito en lenguaje natural (por ejemplo, "Geschaftsessen im Restaurant 140 EUR mit Kunde"), el modelo devuelve la categoria, la cuenta SKR03, la cuenta SKR04, el porcentaje deducible y el tipo de IVA, lo que agiliza la contabilizacion y reduce errores manuales.
- Cumplimiento del mandato E-Rechnung 2025/2026: el modelo genera estructuras XML conformes a EN 16931 y XRechnung 3.0, incluyendo campos como Leitweg-ID, lo que permite a empresas y despachos cumplir con la seccion 14 UStG sin depender de servicios en la nube.
- Generacion de facturas hibridas ZUGFeRD 2.3: el modelo produce PDF/A-3 con datos XML embebidos, adecuado para envio a clientes que requieren el formato hibrido legible por humanos y maquinas.
- Exportacion contable por lotes: la funcionalidad de exportador DATEV EXTF 700 (CSV y DUO ZIP) permite integrar los resultados del modelo en flujos de trabajo contables existentes que emplean DATEV.
- Procesamiento de recibos con OCR: el pipeline basado en Qwen2.5-VL permite extraer datos de imagenes de recibos y convertirlos en asientos contables, util para digitalizar gastos de empleados o facturas en papel.
- Despliegue en entornos con requisitos estrictos de privacidad: al ejecutarse 100% en local con cero egress de datos, el modelo es adecuado para despachos contables, asesorias fiscales y departamentos financieros que no pueden enviar datos a servicios externos por cumplimiento del RGPD/DSGVO.
- Asistencia en la pre-auditoria GoBD: el modelo puede verificar la conformidad de facturas y asientos con los requisitos GoBD antes de una auditoria fiscal.

## Benchmarks y rendimiento

La model card presenta una tabla comparativa con 77 casos de prueba, pero no especifica la metodologia, el conjunto de datos exacto ni los prompts empleados. Los resultados son los siguientes:

| Criterio de evaluacion | Qwen2.5-3B (base) | Llama 3 (8B) | Mistral (7B) | Rechly-DE-3B |
|---|---|---|---|---|
| Tamano / RAM | 3B (~2,5 GB) | 8B (~6,0 GB) | 7B (~5,5 GB) | 3B (< 2,5 GB RAM) |
| Inferencia local offline | Si | Si | Si | Si (100% local) |
| Precision fiscal GoBD (secciones 19, 13b, 4, 35a) | 25,0% | 58,0% | 62,0% | 100,0% |
| Precision DATEV SKR03 y SKR04 | 10,0% | 45,0% | 40,0% | 100,0% |
| E-Rechnung EN 16931 / Leitweg-ID | 15,0% | 50,0% | 48,0% | 100,0% |
| Salida hibrida ZUGFeRD 2.3 PDF/A-3 | No | No | No | Si |
| Pipeline OCR multimodal de recibos | No | No | No | Si |
| Exportador por lotes DATEV EXTF 700 | No | No | No | Si |
| Puntuacion de auditoria de 77 puntos | 22,0% (F) | 54,5% (D) | 58,4% (D) | 100,0% (77/77, A+) |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos de la tabla proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: menos de 2,5 GB de RAM en cuantizacion Q4_K_M (1,84 GB de pesos GGUF). El repo completo ocupa 2,0 GB.
- GPU recomendadas: no se especifican GPU dedicadas; el autor menciona Apple Silicon (MacBooks), VPS Linux ligeros y CPUs estandar.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 3-4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060), aunque el autor no detalla configuraciones concretas.
- Opciones de despliegue: Ollama (`ollama run jonprompter/rechly-de-3b`), MLX (libreria nativa del repo), GGUF (compatible con llama.cpp). No se mencionan vLLM ni TGI.
- Latencia y throughput estimados: 60-80+ tokens/s en Apple Silicon o CPU estandar segun el autor; no se proporcionan mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rechly-DE-3B | 3,09B | No disponible | Facturacion alemana, DATEV, E-Rechnung | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-3B-Instruct | 3,09B | No disponible en esta ficha | Proposito general, multilingue | Apache 2.0 | Hugging Face |
| Llama 3 8B | 8B | No disponible en esta ficha | Proposito general | Llama 3 license | Hugging Face |
| Mistral 7B | 7B | No disponible en esta ficha | Proposito general | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos incluidos en la tabla de benchmarks del autor. No se dispone de informacion sobre otros modelos especializados en contabilidad alemana o E-Rechnung para establecer una comparacion directa. Los datos de rendimiento de los modelos comparados proceden de la model card del autor y no han sido verificados de forma independiente.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada. Al estar ajustado sobre legislacion fiscal alemana, puede reflejar sesgos hacia interpretaciones concretas de la normativa.
- Riesgo de alucinacion: aunque el autor afirma una precision del 100% en su auditoria de 77 casos, se trata de una muestra limitada y autoevaluada. En produccion, un modelo de 3B puede generar cuentas DATEV o referencias legales inexistentes ante entradas fuera de distribucion.
- Limitaciones de contexto o idioma: el modelo solo soporta aleman e ingles; no se especifica la longitud de contexto, lo que es un riesgo para procesar documentos XML largos o conversaciones multi-turno extensas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-3B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas. No obstante, el uso en produccion para cumplimiento fiscal deberia validarse con asesoria legal.
- Caveats para produccion: los benchmarks son autoevaluados y no verificados de forma independiente; la afirmacion de "100% local" depende de la configuracion de despliegue; las gramaticas GBNF garantizan la sintaxis JSON pero no la correccion semantica de los datos fiscales; el pipeline OCR basado en Qwen2.5-VL no esta claramente integrado en el mismo checkpoint; la fecha de creacion del modelo (2026-10-24) es posterior a la fecha actual, lo que sugiere que los metadatos pueden ser incorrectos o que el modelo es de reciente publicacion.
- El modelo no debe utilizarse como sustituto de asesoramiento fiscal profesional; los resultados deben ser revisados por un contable o asesor fiscal cualificado.

## Enlaces

- Hugging Face: https://huggingface.co/jonprompter/rechly-de-3b
- Ollama: https://ollama.com/jonprompter/rechly-de-3b
- GitHub: https://github.com/myaxyo/rechly_llm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
