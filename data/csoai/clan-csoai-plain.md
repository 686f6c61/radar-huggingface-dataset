# csoai/clan-csoai-plain

## Resumen

clan-csoai-plain es un repositorio publicado por CSOAI Ltd en Hugging Face que se presenta como un fine-tune propio orientado a comportamiento de cuidado y rechazo (care/refusal). Sin embargo, el propio autor declara de forma explícita que no se publican pesos en el repositorio: lo que se distribuye es un registro de medición con tarjetas firmadas con Ed25519 y verificables mediante hash SHA-256. Es decir, no se trata de un modelo desplegable en el sentido habitual, sino de un artefacto de atestación y transparencia.

La relevancia del repositorio no está en su capacidad generativa, que no puede evaluarse sin pesos, sino en el marco de gobernanza que lo acompaña: el tablero GSPC (Council of AI), con 22 ejes medidos y 14 flotas de modelos según los datos declarados, y una metodología con DOI en Zenodo. El autor insiste en que sus propios modelos quedan excluidos de los liderazgos públicos del tablero ("own-model-excluded"), de modo que donde no hay un líder externo la posición queda vacía en lugar de rellenarse con el modelo propio.

El resultado más llamativo es que una de las dos filas publicadas es deliberadamente débil: el eje care-refusal-help obtiene 1.0 de accuracy, mientras que care-refusal-protect se queda en 0.0968. El autor mantiene esa fila a la vista como argumento metodológico: un organismo de medición que borra su propio eje flojo deja de medir. Ninguna de las dos métricas está verificada por un tercero según el propio model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible: el repositorio no publica pesos; el artefacto son tarjetas de medicion firmadas (JSON con SHA-256) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo. La model card se limita a calificarlo como "an in-house CSOAI care/refusal fine-tune", lo que indica que parte de un modelo base no identificado y que ha sido ajustado para comportamiento de cuidado y rechazo. No se especifica si el transformer es denso o MoE, ni el numero de parametros, ni la longitud de contexto, ni la composicion del dataset de ajuste, ni si se emplearon tecnicas de RLHF, DPO u otras.

Tampoco se documentan innovaciones tecnicas de inferencia (atencion lineal, decodificacion especulativa, cuantizacion propia). La innovacion que si se explicita es de tipo metodologico y de procedencia de datos: cada eje medido se publica como una tarjeta firmada con Ed25519, con hash SHA-256 resoluble, sobre un banco de evaluacion congelado (csoai/gspc-care). El tablero en vivo (GET https://councilof.ai/api/gspc) se declara como la autoridad, y el README se define como una simple impresora de ese GET mas las tarjetas que nombra. Si la consulta falla, el resultado debe marcarse como UNCHECKABLE y nunca fabricarse un 0.000.

## Capacidades

- Generacion de texto: el pipeline declarado es text-generation, pero no hay pesos publicados, por lo que la capacidad no es verificable ni ejecutable desde este repositorio.
- Comportamiento de cuidado y rechazo: el ajuste declarado apunta a respuestas de ayuda y de proteccion ante peticiones sensibles, evaluadas en los ejes care-refusal-help y care-refusal-protect.
- Medicion y atestacion: emision de tarjetas firmadas con Ed25519 y verificables por hash, con banco de evaluacion congelado y fecha de congelacion.
- Verificacion publica sin cuenta: el autor ofrece una pagina de verificacion y una guia de verificacion manual.
- Integracion programatica: endpoint MCP declarado con 12 herramientas y API HTTP para consultar el tablero y las tarjetas.
- Lector en Python: paquete csoai-gspc con extra de verificacion (pip install "csoai-gspc[verify]").
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Multilingue: no; solo ingles segun el campo language.
- Vision, audio o modo thinking: no disponible.
- Exclusion del propio modelo: por diseño, los modelos CSOAI se excluyen de los liderazgos publicos del tablero.

## Casos de uso

- Auditoria de evidencia firmada: descargar una tarjeta de medicion, comprobar su SHA-256 y validar la firma Ed25519 siguiendo la guia de verificacion manual para acreditar que unos bytes concretos puntuaron sobre un banco congelado en una fecha concreta.
- Integracion en pipelines de evaluacion: consumir el endpoint de la API del tablero desde un job de CI para fijar el numero de ejes medidos en un informe interno, citando totals.public_count en lugar de congelar una tabla de puntuaciones en el repositorio.
- Trazabilidad para cumplimiento normativo: usar las tarjetas firmadas y el arbol de transparencia Merkle como evidencia documental de evaluacion en expedientes internos alineados con el EU AI Act, entendiendo siempre que es medicion y no certificacion.
- Verificacion de terceros sin cuenta: un revisor externo puede resolver los hashes y consultar las tarjetas sin autenticarse, lo que reduce la dependencia de la palabra del proveedor.
- Monitorizacion continua del tablero: automatizar una comprobacion periodica del GET del tablero y del endpoint de hub-cards, distinguiendo de forma explicita el estado UNCHECKABLE cuando la consulta falla.
- Integracion de herramientas via MCP: conectar el endpoint MCP declarado (12 herramientas) a un asistente de desarrollo para consultar ejes, tarjetas y recuentos directamente desde el entorno de trabajo.
- Cita academica y reproducibilidad: emplear el DOI de metodologia y la instantanea fechada del tablero en Zenodo para referenciar el estado del consejo en una publicacion.
- Analisis critico de metodologia de evaluacion: estudiar el caso de un organismo que publica su propio eje flojo (0.0968) como ejemplo de practica de transparencia frente al sesgo de seleccion de resultados.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index. Ninguna de las metricas figura como verificada por un tercero (verified: false). El conjunto de evaluacion es csoai/gspc-care.

| Tarea (eje GSPC) | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| GSPC axis — care-refusal-help | csoai/gspc-care (care-refusal-help) | accuracy | 1.0 | no |
| GSPC axis — care-refusal-protect | csoai/gspc-care (care-refusal-protect) | accuracy | 0.0968 | no |

Tarjetas firmadas asociadas:

| Eje | Accuracy | Hash SHA-256 de la tarjeta | Banco congelado |
|---|---:|---|---|
| care-refusal-help | 1.0 | acf6bf03…65133a4 | csoai/gspc-care |
| care-refusal-protect | 0.0968 | 82994353…5a09a1c | csoai/gspc-care |

No se han publicado en la informacion disponible resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K ni equivalentes) para este modelo, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no aplicable en la practica; el repositorio no publica pesos, por lo que no hay un artefacto que cargar en GPU.
- GPU recomendadas: no disponible. La model card menciona de pasada "A100 COLD" en el bloque de capacidad, sin especificar una configuracion de despliegue ni requisitos asociados.
- GPU de consumo: no disponible; no se puede determinar al no existir pesos ni tamano declarado.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles para el modelo. Las vias de integracion que si se documentan son de otro tipo: la API del tablero, el endpoint MCP y el paquete Python csoai-gspc.
- Latencia y throughput: no disponible.
- Requisitos para el artefacto de medicion: un cliente HTTP para consultar la API o resolver las tarjetas, y Python con el extra de verificacion si se quiere validar firmas de forma programatica.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni resultados de terceros sobre los mismos ejes. La comparativa publica que propone el autor no se ofrece como tabla en esta ficha, sino como tablero en vivo consultable (GET https://councilof.ai/api/gspc), que se declara autoridad y cuya consulta puede devolver UNCHECKABLE si falla.

| Criterio | clan-csoai-plain | Alternativas |
|---|---|---|
| Parametros | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks convencionales | no disponible | no disponible |
| Licencia | apache-2.0 | no disponible |
| Disponibilidad de pesos | no se publican pesos | no disponible |

## Limitaciones y advertencias

- No hay pesos en el repositorio: el propio autor lo declara de forma explicita. No es un modelo ejecutable, por lo que cualquier intento de cargarlo para inferencia fracasara.
- Licencia: el campo declarado es apache-2.0, pero al no distribuirse pesos, su aplicacion practica se limita al contenido del repositorio; conviene revisar los terminos del tablero y de la API por separado.
- Metricas no verificadas: los dos valores del model-index estan marcados como verified: false. No son cifras auditadas por un tercero.
- Una de las dos metricas es muy baja: care-refusal-protect obtiene 0.0968 de accuracy, lo que indica una limitacion clara del ajuste declarado en ese eje. El autor la publica a proposito, pero sigue siendo un resultado flojo.
- Riesgo de sobreinterpretacion: el repositorio se autodenomina "measurement, not certification". No es una aprobacion, una calificacion ni una garantia de seguridad, y presentarlo como tal seria un uso indebido.
- Dependencia de un servicio externo: las tarjetas, el tablero y el arbol Merkle se sirven desde councilof.ai. Si el servicio no responde, el estado correcto es UNCHECKABLE, no un valor cero ni un valor heredado de una captura anterior.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, lo que limita su uso en castellano.
- Sesgos conocidos: no disponible. No se documentan analisis de sesgo, procedencia del dataset de ajuste ni datos demograficos.
- Riesgo de alucinacion: no evaluable sin pesos y sin pruebas de generacion publicadas.
- Fechas anomales: el repositorio declara creacion el 2026-09-01 y actualizacion el 2026-09-14, posteriores a la fecha habitual de consulta; conviene tratarlas como metadatos del propio autor.
- Ausencia de resultados convencionales: sin MMLU, HumanEval, GSM8K ni equivalentes, no es posible situar el modelo frente a alternativas de su categoria.
- Resultados de busqueda no concluyentes: las consultas web realizadas no devolvieron fuentes tecnicas relevantes sobre este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/csoai/clan-csoai-plain
- Perfil del autor en Hugging Face: https://huggingface.co/csoai
- Dataset de evaluacion: https://huggingface.co/datasets/csoai/gspc-care
- Banco de tarjetas del hub: https://huggingface.co/datasets/csoai/gspc-hub-cards
- Tablero en vivo (autoridad declarada): https://councilof.ai/api/gspc
- Endpoint de tarjetas del hub: https://councilof.ai/api/hub-cards
- Verificacion gratuita de tarjetas: https://councilof.ai/gspc-verify
- Guia de verificacion manual: https://councilof.ai/signed/HOW-TO-VERIFY.md
- Raiz de transparencia (Merkle): https://councilof.ai/root.json
- Endpoint MCP declarado: https://councilof.ai/mcp
- Descubrimiento x402: https://councilof.ai/.well-known/x402.json
- Tarjeta firmada del eje care-refusal-help: https://councilof.ai/signed/cards/acf6bf0356123632758bf6c98c83d81c7a8392c3b111b311317c516cc65133a4.json
- Tarjeta firmada del eje care-refusal-protect: https://councilof.ai/signed/cards/82994353b8f94337746ddf73700b0edc425d695d43910dbfeb53d118d5a09a1c.json
- DOI de metodologia: https://doi.org/10.5281/zenodo.21991104
- Instantanea fechada y citable del tablero: https://doi.org/10.5281/zenodo.22293341
- Paquete Python de lectura y verificacion: pip install "csoai-gspc[verify]"
