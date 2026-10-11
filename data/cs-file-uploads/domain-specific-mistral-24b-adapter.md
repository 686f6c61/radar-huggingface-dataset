# cs-file-uploads/domain-specific-mistral-24b-adapter

## Resumen

`cs-file-uploads/domain-specific-mistral-24b-adapter` es un adaptador LoRA (PEFT, formato safetensors) entrenado sobre el modelo base `mistralai/Mistral-Small-3.2-24B-Instruct-2506`. No es un modelo completo, sino un conjunto de pesos delta que se carga por encima del modelo base mediante la libreria PEFT. Su proposito es muy concreto: extraer informacion sobre consultores de compensacion (asesores retenidos y proveedores de encuestas) a partir de declaraciones proxy presentadas ante la SEC.

El adaptador se entreno con 2.001 ejemplos etiquetados y emplea el formato de instruccion denominado "detailed" (el nombre del repositorio sin el sufijo `-short` corresponde a instruccion detallada; `-short` corresponderia a instruccion minima). El repositorio pesa 0,2 GB, lo que es coherente con un adaptador de bajo rango y no con un modelo completo de 24.000 millones de parametros.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas y cero valoraciones en el momento de la consulta, publicado por la cuenta `cs-file-uploads` y sin model card extensa ni resultados de evaluacion publicados. La model card remite a un repositorio de codigo externo para el pipeline de inferencia y la evaluacion, que no se ha proporcionado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer; el modelo base es `mistralai/Mistral-Small-3.2-24B-Instruct-2506` |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 24B segun la nomenclatura del identificador |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT, la cuantizacion aplica al modelo base y no se documenta |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente en parametros que congela los pesos del modelo base e introduce matrices de bajo rango entrenables en determinadas capas. Se distribuye en formato safetensors y se carga con la libreria `peft` sobre `mistralai/Mistral-Small-3.2-24B-Instruct-2506`. El tamano del repositorio (0,2 GB) es consistente con un adaptador de bajo rango y no con pesos completos.

Segun la model card, el entrenamiento utilizo 2.001 ejemplos etiquetados, cuyo objetivo era la extraccion de consultores de compensacion (asesores retenidos y proveedores de encuestas) a partir de declaraciones proxy de la SEC. Se empleo el formato de instruccion "detailed". No se proporcionan datos sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de la cifra de ejemplos y la tarea, la existencia de RLHF o DPO, ni hiperparametros como rango, alpha, dropout o learning rate. Tampoco se describe ninguna innovacion tecnica adicional.

## Capacidades

- Extraccion de entidades en dominio financiero y legal: identificacion de consultores de compensacion (asesores retenidos y proveedores de encuestas) en declaraciones proxy de la SEC.
- Seguimiento de instrucciones detalladas: el adaptador se entreno especificamente con el formato "detailed", lo que sugiere capacidad para ejecutar consignas mas largas y estructuradas dentro de esta tarea.
- Generacion de texto y razonamiento general: solo en la medida en que lo aporte el modelo base; no se documentan capacidades propias del adaptador mas alla de la tarea de extraccion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles para el adaptador.

## Casos de uso

- Extraccion automatizada de consultores de compensacion en declaraciones proxy de la SEC: es el caso de uso exacto para el que se entreno el adaptador, con 2.001 ejemplos etiquetados y el formato de instruccion detallado, por lo que se espera un rendimiento superior al del modelo base sin ajustar en esta tarea concreta.
- Analisis de gobierno corporativo a escala: procesar lotes de proxy statements para identificar que asesores retenidos y proveedores de encuestas intervienen en la fijacion de retribuciones, alimentando bases de datos de investigacion financiera.
- Auditoria y cumplimiento normativo: revisar de forma sistematica si una empresa ha divulgado correctamente la participacion de consultores de compensacion en sus documentos regulatorios.
- Investigacion academica en finanzas y derecho corporativo: construir paneles historicos de relaciones empresa-asesor a partir de textos regulatorios sin anotacion manual.
- Enriquecimiento de pipelines de datos alternativos: integrar la extraccion en flujos ETL que alimentan plataformas de analisis de retribucion ejecutiva o de riesgo de gobierno corporativo.
- Prototipado rapido sobre el modelo base: al ser un adaptador de 0,2 GB, permite experimentar con la tarea sin desplegar ni almacenar pesos completos adicionales por cada variante de la tarea.
- Investigacion en PEFT aplicado a dominios regulados: sirve como ejemplo reproducible de ajuste LoRA sobre documentos legales y financieros de estructura fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (precision, recall, F1, exactitud de extraccion u otras) y remite a un repositorio de codigo externo para la evaluacion, que no se ha facilitado.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,2 GB en disco; en memoria, el delta LoRA anade una cantidad marginal frente al modelo base.
- VRAM del modelo base en precision bf16/fp16: del orden de 48 GB, estimacion orientativa para 24.000 millones de parametros; requiere GPU de clase A100 80 GB, H100 o varias GPU profesionales.
- VRAM del modelo base en cuantizacion de 4 bits: del orden de 14-16 GB, estimacion orientativa; podria caber en GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) para el modelo base cuantizado mas el adaptador.
- GPU recomendadas: A100, H100 o H200 para bf16 sin cuantizar; RTX 4090 / 3090 para despliegue cuantizado en 4 bits.
- Compatibilidad con GPU de consumo: el adaptador por si solo si, dado su tamano; la viabilidad depende enteramente de la cuantizacion elegida para el modelo base.
- Opciones de despliegue: PEFT para cargar el adaptador sobre el modelo base; inferencia mediante Transformers, vLLM o TGI siempre que soporten adaptadores LoRA; no confirmado para llama.cpp/Ollama en el caso de este adaptador concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `cs-file-uploads/domain-specific-mistral-24b-adapter` | Adaptador LoRA sobre base de 24B | No disponible | Extraccion de consultores de compensacion en proxy statements de la SEC | No disponible | HuggingFace (0 descargas) |
| `mistralai/Mistral-Small-3.2-24B-Instruct-2506` (modelo base) | 24B | No disponible | Proposito general | No disponible en la informacion proporcionada | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables especificos para esta tarea de extraccion de consultores de compensacion en documentos de la SEC. La comparativa mas directa es contra el propio modelo base sin ajustar (fine-tuning frente a zero-shot), pero no se han publicado metricas de esa comparacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado ni documentado; en tareas de extraccion de entidades en textos legales, la alucinacion puede traducirse en consultores o relaciones inexistentes, por lo que se recomienda validacion humana.
- Dominio muy restringido: el adaptador se entreno exclusivamente para extraer consultores de compensacion en proxy statements; su uso fuera de esa tarea puede degradar el comportamiento del modelo base.
- Limitaciones de contexto e idioma: no disponibles; la ventana de contexto depende del modelo base, no especificada, y no se documentan idiomas.
- Licencia: no disponible, por lo que no puede confirmarse la viabilidad de uso comercial. Es un riesgo relevante antes de cualquier despliegue en produccion.
- Ausencia de evaluacion publicada: sin metricas en la model card, no se puede verificar la calidad ni la robustez del adaptador.
- Procedencia y mantenimiento: repositorio con 0 descargas y 0 valoraciones, publicado por una cuenta no verificada en la informacion disponible; no hay garantia de mantenimiento ni de soporte.
- Formato de instruccion acoplado: el adaptador espera el formato "detailed"; alimentarlo con el formato minimo o con instrucciones distintas puede reducir el rendimiento.
- Dependencia del modelo base: requiere descargar y ejecutar `mistralai/Mistral-Small-3.2-24B-Instruct-2506`, con el coste de computo y almacenamiento asociado.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/cs-file-uploads/domain-specific-mistral-24b-adapter
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.2-24B-Instruct-2506
- Repositorio de codigo para el pipeline de inferencia y evaluacion: no disponible (la model card lo menciona, pero no se ha proporcionado la URL)
- Paper: no disponible
- Blog o demo: no disponible

Nota sobre la busqueda web: los resultados devueltos corresponden al videojuego Counter-Strike 2 y a portales relacionados, sin ninguna vinculacion con este modelo. No se ha encontrado informacion adicional relevante en la busqueda web.
