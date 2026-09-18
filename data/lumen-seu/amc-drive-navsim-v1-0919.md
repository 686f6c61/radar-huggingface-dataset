# Lumen-SEU/AMC-Drive-NAVSIM-v1-0919

## Resumen

AMC-Drive es un agente de planificación para conducción autónoma end-to-end, empaquetado como envío (*submission*) al benchmark NAVSIM v1. Lo desarrolla Yongzhi Liu, bajo la organización Lumen-SEU, en la Universidad del Sureste (*Southeast University*, China). El repositorio pesa 1,2 GB y contiene un checkpoint de inferencia saneado, un *overlay* aislado con la clase `AMCDriveAgent`, un script de empaquetado y un resumen de evidencia de puntuación.

El resultado declarado es un PDMS de 0,939443730121 (etiqueta pública "NAVSIM v1 PDMS 93.9") sobre 12 146 predicciones del conjunto de envío de NAVSIM v1. NAVSIM es un banco de pruebas de planificación en bucle cerrado para conducción autónoma y PDMS es su métrica agregada principal; el autor no aporta en la model card el desglose por sub-métricas ni el detalle del protocolo de evaluación.

No se trata de un modelo de lenguaje ni de un modelo generativo multimodal: no acepta instrucciones en lenguaje natural, no soporta *tool calling* ni conversación, y su salida es una política de conducción evaluada dentro del simulador. Su relevancia es la de una referencia reproducible con PDMS alto para investigación en planificación, aunque con una documentación muy escasa: sin arquitectura, sin licencia declarada y sin datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no describe la red; el agente se distribuye como `AMCDriveAgent` dentro de un *overlay* de NAVSIM v1) |
| Parametros totales | no disponible (el repositorio ocupa 1,2 GB, compatible con un modelo de cientos de millones de parámetros, pero el dato no se publica) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`.ckpt`); el repositorio incluye además `submission.pkl` |
| Nombre del metodo | AMC-Drive (el significado del acronimo AMC no se explica en la documentacion) |
| Autor | Yongzhi Liu |
| Institucion | Southeast University (China) |
| Tarea | planificacion de trayectorias para conduccion autonoma (bucle cerrado) |
| Benchmark objetivo | NAVSIM v1 |
| Metrica declarada | PDMS 0,939443730121 (etiqueta publica "NAVSIM v1 PDMS 93.9") |
| Numero de predicciones del envio | 12 146 |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion (segun HuggingFace) | 2026-09-18, 16:49:57 UTC |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura, el tamaño del modelo, el *backbone* de percepción, el número de parámetros ni el esquema de entrenamiento. El repositorio distribuye un artefacto etiquetado como "sanitized inference checkpoint" (`checkpoints/AMC-Drive_navsimv1_pdms93.9.ckpt`), lo que indica que se ha eliminado parte del contenido original para dejar solo lo necesario para inferencia; no se especifica qué se ha retirado ni si el checkpoint publicado reproduce exactamente la puntuación declarada.

Tampoco se detallan los datos de entrenamiento (número de *tokens* o *frames*, composición del *dataset*, uso de datos de nuPlan u otras fuentes), ni si hubo fases de ajuste fino, RLHF o DPO. Dado que se trata de un agente de conducción y no de un modelo de lenguaje, estas técnicas no serían de aplicación directa. La única información reproducible sobre el proceso es el script `scripts/create_navsimv1_submission.sh`, que inserta el *overlay* en un devkit de NAVSIM v1 indicado por el usuario y genera el `submission.pkl` bajo el directorio de salida configurado, sin modificar el árbol de origen.

## Capacidades

- Planificación de trayectorias en bucle cerrado dentro del simulador NAVSIM v1, a partir de las observaciones que proporciona el devkit.
- Generación de un fichero `submission.pkl` con el formato estándar de envío de NAVSIM v1, listo para su evaluación o carga en el *leaderboard*.
- Integración como `AMCDriveAgent` mediante un *overlay* aislado sobre un devkit de NAVSIM v1 existente.
- Reproducción declarada de una puntuación PDMS de 0,939443730121 sobre 12 146 predicciones.
- No soporta *tool calling* ni *function calling*.
- No soporta uso agente basado en lenguaje natural ni razonamiento multi-paso textual.
- No tiene capacidades multilingües, de visión general, de audio ni modo de razonamiento (*thinking mode*).
- No se documentan capacidades adicionales (predicción de intención, ocupación, mapa, etc.) más allá de la planificación evaluada por PDMS.

## Casos de uso

- Reproducción de resultados en investigación: instalar el *overlay* sobre un devkit de NAVSIM v1 con el script proporcionado y verificar localmente la puntuación PDMS declarada antes de citarla en un artículo.
- Línea base (*baseline*) en experimentos de planificación end-to-end: usar el checkpoint PDMS 93.9 como referencia contra la que medir variantes propias de arquitectura o de objetivos de entrenamiento.
- Comparación en el *leaderboard* público de NAVSIM v1: generar `submission.pkl` y enviarlo para contrastar la puntuación con otros agentes del mismo banco de pruebas.
- Análisis de fallos por escenario: dado que NAVSIM evalúa en bucle cerrado sobre escenas de conducción urbana, el agente permite estudiar en qué tipos de maniobra pierde puntuación, siempre que se instrumente el devkit para registrar las trazas.
- Empaquetado reproducible de envíos a competiciones: el flujo `bash scripts/create_navsimv1_submission.sh /ruta/navsim_v1` con variables `TEAM_NAME`, `AUTHORS`, `EMAIL`, `INSTITUTION` y `COUNTRY` sirve como plantilla de automatización para otros equipos.
- Docencia y formación en conducción autónoma: usar el paquete como ejemplo completo de extremo a extremo (checkpoint, agente, script de envío y metadatos) en cursos o prácticas de posgrado.
- Auditoría metodológica de *benchmarks*: el resumen de evidencia deidentificado (`evidence/navsimv1_score_93.9_summary.md`) permite estudiar cómo se documenta un envío y qué nivel de detalle aporta el autor frente a lo que exige la revisión por pares.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Conjunto | Notas |
|---|---|---|---|---|
| NAVSIM v1 | PDMS | 0,939443730121 | 12 146 predicciones de envio | Puntuacion local declarada; etiqueta publica "NAVSIM v1 PDMS 93.9" |
| NAVSIM v1 | PDMS (etiqueta publica) | 93.9 | no disponible | Redondeo de la puntuacion anterior, segun el autor |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba de modelos de lenguaje, ya que no es un modelo de lenguaje. Tampoco se aporta el desglose por sub-metricas del PDMS ni resultados comparativos con otros agentes.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Estimacion indirecta a partir del tamaño del repositorio (1,2 GB): el checkpoint es el artefacto dominante, lo que sugiere un modelo del orden de 10^8 parametros; en fp32 ocuparia del orden de 0,3-1 GB de pesos y, sumando activaciones y buffers de la escena, la inferencia requeriria previsiblemente varios GB de VRAM. Es una inferencia propia, no un dato publicado.
- GPU recomendadas: no disponible. El devkit de NAVSIM v1 se ejecuta sobre CUDA; no se especifica ninguna GPU concreta en la model card.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del checkpoint, es plausible que quepa en GPU de consumo recientes con suficiente VRAM, pero el autor no lo verifica.
- Opciones de despliegue: el unico flujo documentado es el *overlay* sobre un devkit de NAVSIM v1 y la generacion de `submission.pkl`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT, opciones que ademas no aplican a un agente de planificacion de este tipo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 1,2 GB, por lo que se necesita espacio adicional para el devkit de NAVSIM v1 y los datos asociados, no cuantificados en la model card.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros agentes de NAVSIM v1 (parametros, contexto, PDMS, licencia o disponibilidad), por lo que no es posible establecer una comparativa numerica fiable. Cualquier comparacion con otras entradas del *leaderboard* de NAVSIM v1 requeriria consultar sus model cards y resultados publicados, que no forman parte de esta busqueda.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificacion del checkpoint; hay que contactar con el autor antes de cualquier uso en produccion.
- Documentacion practicamente inexistente: no se describe la arquitectura, el dataset de entrenamiento, el numero de parametros ni el procedimiento de evaluacion, lo que impide auditar el resultado.
- Checkpoint saneado: el propio autor lo etiqueta como "sanitized"; puede no contener todos los componentes del modelo original, de modo que la reproduccion exacta del PDMS 93.9 no esta garantizada.
- Dependencia estricta del devkit: el agente solo funciona dentro de NAVSIM v1 a traves del *overlay*; no es portable a otros simuladores ni a un vehiculo real sin trabajo adicional no documentado.
- Riesgo de sobreajuste al benchmark: al ser un envio optimizado para una metrica concreta sobre un conjunto de 12 146 predicciones, el comportamiento fuera de la distribucion de NAVSIM v1 es desconocido.
- Sin validacion externa: 0 descargas y 0 likes en HuggingFace; no hay evidencia de reproduccion independiente del resultado.
- Sesgos: no evaluables, al no publicarse la composicion del dataset de entrenamiento (region, clima, tipo de escenas o densidad de trafico).
- Incoherencia en las fechas: HuggingFace registra la creacion y actualizacion en septiembre de 2026, posterior a la fecha actual, lo que conviene verificar antes de citar el artefacto.
- Datos de contacto: la model card incluye un correo electronico personal; su difusion debe tratarse con cuidado.
- No apto para produccion: no hay garantias de robustez, seguridad funcional ni certificacion para uso en vehiculos reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Lumen-SEU/AMC-Drive-NAVSIM-v1-0919
- Autor en HuggingFace: https://huggingface.co/Lumen-SEU
- Contacto indicado en la model card: 230268037@seu.edu.cn
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo. Las consultas devolvieron unicamente paginas sobre el lumen como unidad fotometrica y sobre el centro de servicios Lumen de la Universite Paris-Saclay, sin relacion con AMC-Drive ni con NAVSIM. No se dispone por tanto de paper, repositorio de codigo, blog o demo adicionales.
