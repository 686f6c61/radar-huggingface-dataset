# d4rkninja/tanpo-product-GGUF

## Resumen

tanpo-product-GGUF es un ajuste fino de dominio del modelo unsloth/LFM2.5-1.2B-Instruct, publicado por el usuario d4rkninja (DarkNinja Solutions, comunidad DarkLab) en formato GGUF para su uso con llama.cpp y derivados. El modelo esta especializado en tareas de producto y direccion (product/CEO), segun declara el autor: roadmaps, descubrimiento de producto, estrategia de precios y definicion de OKRs. Se distribuye exclusivamente como pesos cuantizados GGUF, con variantes Q3_K_M, Q4_K_M, Q5_K_M y Q8_0, y esta etiquetado como `conversational` y `endpoints_compatible`.

El modelo cuenta con 1.170.340.608 parametros totales (aproximadamente 1,17 mil millones), lo que lo situa en la gama de modelos pequenos aptos para inferencia en CPU, equipos de consumo y despliegues en el borde. Deriva de la familia LFM2.5 de Liquid AI a traves del checkpoint Instruct publicado por Unsloth, sobre el que se ha aplicado un ajuste PEFT (LoRA) cuyo adaptador y version fusionada tambien estan publicados por el mismo autor.

Su relevancia actual es doble: por un lado, ofrece un modelo de dominio muy ligero y cuantizado que puede ejecutarse en local sin GPU dedicada; por otro, es un ejemplo de flujo de trabajo completo (LoRA, fusion y cuantizacion GGUF) reproducible por desarrolladores. No obstante, el modelo no tiene descargas ni valoraciones en el momento de redactar esta ficha y sus unicos resultados publicados son una evaluacion interna del autor con rubrica automatica, por lo que debe considerarse no validado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada del modelo base unsloth/LFM2.5-1.2B-Instruct (familia LFM2.5 de Liquid AI); detalles no especificados en la informacion disponible |
| Parametros totales | 1.170.340.608 (aprox. 1,17 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q3_K_M, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponible |
| Licencia | other (terminos no detallados en la informacion proporcionada) |
| Formato de pesos | GGUF (llama.cpp); existe version fusionada y adaptador LoRA en repos separados |
| Tamano del repositorio | 4,9 GB |
| Metodo de ajuste | PEFT / LoRA sobre el modelo base Instruct |
| Compatibilidad | llama.cpp, endpoints compatibles (`endpoints_compatible`) |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de dominio mediante PEFT/LoRA sobre unsloth/LFM2.5-1.2B-Instruct. El autor publica tres artefactos: el adaptador LoRA (`d4rkninja/tanpo-product-LoRA`), la version fusionada (`d4rkninja/tanpo-product`) y este repositorio con los pesos cuantizados en GGUF. La arquitectura subyacente es la del checkpoint base (familia LFM2.5 de Liquid AI); la informacion proporcionada no detalla el tipo exacto de bloque (atencion, convolucional o hibrido), el numero de capas, la dimension oculta ni la longitud de contexto soportada.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si se emplearon tecnicas de alineacion adicionales como RLHF o DPO mas alla del propio ajuste Instruct del modelo base. La unica metrica de entrenamiento publicada es una evaluacion de dominio PEFT sobre 20 tareas con rubrica estricta, que reporta un 89,0% en la rubrica global y 6,94 sobre 10 en calidad heuristica. El propio autor advierte que se trata de una rubrica automatizada y que no equivale a preferencia humana.

## Capacidades

- Generacion de texto conversacional en un unico turno o multi-turno (etiqueta `conversational`).
- Tareas de dominio de producto y direccion: elaboracion de roadmaps, documentos de descubrimiento, estrategia de precios y definicion de OKRs, segun la model card.
- Redaccion y sintesis de documentacion profesional a partir de instrucciones en lenguaje natural.
- Inferencia local en CPU y en equipos de consumo gracias al formato GGUF y a su tamano de 1,17 B de parametros.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que facilita su integracion en servicios desplegados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta declarado).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Capacidades de codigo y matematicas: no documentadas para este ajuste.

## Casos de uso

- Redaccion de roadmaps de producto: el modelo puede generar borradores de roadmap por trimestres y priorizar iniciativas a partir de un listado de objetivos y restricciones, aprovechando su ajuste especifico en tareas de producto.
- Definicion de OKRs de equipo: dado un contexto de negocio (objetivos anuales, metricas actuales), puede proponer objetivos y resultados clave medibles y coherentes con la estrategia indicada.
- Documentos de descubrimiento de producto: sintetizar notas de entrevistas con usuarios o de investigacion de mercado en un documento estructurado de problema, hipotesis y validacion.
- Analisis de precios y empaquetado: generar comparativas de planes, hipotesis de precios y justificacion de valor a partir de datos de competidores y costes aportados en el prompt.
- Asistente interno de documentacion: redactar release notes, changelogs y comunicaciones internas para equipos de producto, ejecutandose en local sin enviar datos sensibles a servicios externos.
- Prototipado rapido y pruebas de concepto: al ocupar menos de 1 GB en cuantizacion Q4_K_M, permite iterar sobre prompts y flujos conversacionales en un portatil antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de feedback de usuarios: categorizar tickets, encuestas o resenas en temas de producto (precio, funcionalidad, usabilidad) como paso previo a un analisis agregado.
- Despliegue en el borde o en dispositivos sin GPU: su tamano reducido permite ejecutarlo en mini-PC, Raspberry Pi de gama alta o telefonos mediante llama.cpp, para asistentes de producto offline.

## Benchmarks y rendimiento

El autor solo publica una evaluacion de dominio con rubrica estricta sobre 20 tareas internas. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Resultado |
|---|---|
| Rubrica global (20 tareas de producto/CEO, rubrica estricta) | 89,0% |
| Calidad heuristica (escala 0-10) | 6,94 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | No disponibles |

Advertencia del propio autor: se trata de una rubrica automatizada y no equivale a preferencia humana. No se dispone de comparaciones con otros modelos en las mismas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del numero de parametros, sin incluir cache KV ni sobrecarga del runtime):
  - Q3_K_M: aproximadamente 0,6-0,7 GB.
  - Q4_K_M: aproximadamente 0,75-0,9 GB.
  - Q5_K_M: aproximadamente 0,85-1,0 GB.
  - Q8_0: aproximadamente 1,25-1,35 GB.
- GPU recomendadas: cualquier GPU de consumo con 2 GB o mas de VRAM es suficiente para las cuantizaciones mas bajas (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060). Para uso intensivo en servidor, una NVIDIA T4, L4, A10G o superior ofrece margen de sobra; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Ejecucion en CPU: viable con llama.cpp; con cuantizaciones Q3_K_M o Q4_K_M es razonable en CPU de escritorio moderna e incluso en placas tipo Raspberry Pi de gama alta, aunque la latencia dependera del hardware.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier servidor compatible con GGUF. El repositorio esta etiquetado como `endpoints_compatible`. El soporte de vLLM para GGUF es parcial y no esta confirmado para este repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

Solo se dispone de datos verificables de los artefactos del propio autor y del modelo base. Para alternativas de la misma categoria (modelos Instruct de 1-2 B de parametros, como Llama 3.2 1B Instruct, Qwen2.5 1.5B Instruct o Gemma 2 2B) no hay informacion en los datos proporcionados, por lo que sus cifras se marcan como no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Estado / notas |
|---|---|---|---|---|---|
| tanpo-product-GGUF (este modelo) | 1,17 B | No disponible | other | GGUF (Q3_K_M, Q4_K_M, Q5_K_M, Q8_0) | 0 descargas, 0 likes; ajuste de dominio de producto |
| d4rkninja/tanpo-product (fusionado) | 1,17 B (heredado) | No disponible | other | No disponible | Version fusionada del mismo ajuste |
| d4rkninja/tanpo-product-LoRA | Adaptador LoRA | No disponible | other | LoRA | Adaptador sin fusionar |
| unsloth/LFM2.5-1.2B-Instruct | Aprox. 1,2 B | No disponible | No disponible | No disponible | Modelo base del ajuste |
| Alternativas de 1-2 B de otros fabricantes (Llama 3.2 1B, Qwen2.5 1.5B, Gemma 2 2B) | 1-2 B | No disponible | No disponible | No disponible | Datos no disponibles en la informacion proporcionada |

No hay resultados comparativos de rendimiento entre este modelo y sus alternativas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al derivar de un modelo base Instruct sin informacion sobre su dataset, pueden heredarse sesgos de dicho corpus.
- Riesgo de alucinacion: elevado para un modelo de 1,17 B de parametros, especialmente en tareas factuales o de calculo. No se han publicado evaluaciones de fidelidad.
- Especializacion estrecha: el ajuste esta orientado a tareas de producto/CEO; es probable que sus capacidades generales (codigo, matematicas, conocimiento factual) se hayan degradado respecto al modelo base. No hay datos que lo confirmen o desmientan.
- Contexto: se desconoce la longitud de contexto efectiva de este ajuste, lo que impide planificar tareas con documentos largos.
- Idiomas: el campo de idiomas no esta declarado. No puede asumirse soporte de castellano ni de otros idiomas sin verificar.
- Licencia: la licencia declarada es `other`, sin terminos detallados en la informacion proporcionada. Antes de un uso comercial es imprescindible revisar la licencia del modelo base (unsloth/LFM2.5-1.2B-Instruct y, en ultima instancia, la de Liquid AI) y los terminos del repositorio.
- Validacion: el repositorio presenta 0 descargas y 0 likes en el momento de redactar la ficha. Los unicos resultados son de una rubrica automatica del propio autor, que el mismo advierte que no equivale a preferencia humana.
- Trazabilidad de datos: no se especifica el dataset de ajuste, por lo que no puede evaluarse el riesgo de contaminacion ni de filtraciones de datos.
- Produccion: al ser un modelo pequeno y no evaluado por terceros, se recomienda validacion exhaustiva en el dominio objetivo y mecanismos de salvaguarda (filtros de salida, revision humana) antes de exponerlo a usuarios finales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/d4rkninja/tanpo-product-GGUF
- Version fusionada: https://huggingface.co/d4rkninja/tanpo-product
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-product-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, demos ni repositorios adicionales relevantes en la busqueda web realizada.
