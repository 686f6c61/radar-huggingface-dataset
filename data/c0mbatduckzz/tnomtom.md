# c0mbatduckzz/TNOMTOM

## Resumen

TNOMTOM es un repositorio publicado en Hugging Face por el usuario c0mbatduckzz (identificado en la model card como Tom Klootwijk) que se presenta como una "arquitectura ejecutable liderada por XD-TAU" y una "suite de componentes polimorficos". Segun la propia model card, no se trata de un checkpoint neuronal entrenado ni de un servicio de inferencia alojado, sino de un conjunto de codigo fuente, esquemas, recursos de reproduccion y material de procedencia empaquetado en un repositorio de 13,6 GB. La model card lo describe explicitamente como "custom model repository; no trained neural checkpoint or hosted inference service is claimed".

El material parte de un estudio de ofertas de empleo de TNO (39 vacantes recopiladas el 28 de octubre de 2026) y evoluciona hacia lo que el autor denomina "kernels exactos de datos de bits finitos", adaptadores de modelo nativos tipados y control coordinado de componentes y rutas. Se mencionan seis familias de modelos contenidas (TOM-GROK, TOM-MAKTUBIII, TOMK, JTK-Twin-Viper, TK-MK-ULTRA y Maktub-Tom-Klootwijk) y 23 alternativas de capacidad retenidas, con XD-TAU v1.5 como arquitectura principal.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no hay parametros, contexto, benchmarks ni pipeline de inferencia declarados. La licencia es propietaria con "all rights reserved" y reserva explicita de mineria de texto y datos (TDM), lo que restringe severamente cualquier uso. Esta ficha documenta lo que el repositorio declara, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XD-TAU v1.5 (arquitectura ejecutable propietaria; no es un transformer neuronal declarado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | proprietary-all-rights-reserved (license: other; sin concesion de licencia) |
| Formato de pesos | no disponible (el repositorio contiene codigo fuente, esquemas SVG/PNG, recursos de replay y ficheros de procedencia; no se declaran safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card describe XD-TAU v1.5 como una "arquitectura ejecutable" con seis familias de modelos contenidas y 23 alternativas de capacidad retenidas. El autor afirma que el trabajo deriva en "kernels exactos de datos de bits finitos", adaptadores de modelo nativos tipados, control coordinado de componentes y rutas, estados de fuente retenidos y lecturas de historial de constructor confirmadas. Los operadores de fuente nativos se conservan en lugar de sustituirse por un operador universal inventado. No se especifica si la arquitectura subyacente es transformer, MoE, SSM o hibrida, ni se aportan detalles sobre mecanismos de atencion, tokenizacion o capas.

No se declara ningun proceso de entrenamiento neuronal: no hay numero de tokens, composicion de dataset, RLHF, DPO ni ninguna otra fase de alineamiento. El material de "entrenamiento" que aparece en el repositorio son directorios vendorizados (por ejemplo, copias de TOMK bajo `learning` e `integration` con licencia MIT) y recursos de procedencia. El repositorio incluye esquemas editables, un manifiesto de admision V11, un fichero de verificacion de referencia independiente y un PDF de aplicaciones fisicas, pero nada de ello constituye evidencia de un modelo entrenado con pesos evaluables.

## Capacidades

- No se declaran capacidades de generacion de texto, razonamiento, codigo, matematicas o vision en la informacion disponible.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- El unico idioma declarado es ingles (`en`).
- El autor menciona "exact finite bit-data kernels", "polymorphic routing" y "deterministic LUT" como conceptos del sistema, pero sin especificar interfaces de inferencia ni API.
- No se declara modo thinking, vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Estudio de procedencia de material publicado: el repositorio incluye ficheros como `provenance/release_inventory.json`, `provenance/LINEAGE.md` y `provenance/conversation.md` que documentan el origen del contenido, util para investigadores interesados en trazabilidad de artefactos.
- Analisis de esquemas de hardware: el directorio `hardware/xd_tau_lut/schematics/history_suite/` contiene esquemas SVG/PNG editables que pueden revisarse como material de referencia de diseno.
- Reproduccion de entregas historicas: el fichero `output/TNO_XD_TAU_Exact_LUT_Realization_V11.md` y su `delivery.json` permiten verificar hashes y recibos de intervalos de bytes de entregas anteriores.
- Estudio de licenciamiento y reserva de derechos: el repositorio es un ejemplo practico de declaracion de propiedad intelectual, reserva TDM y convivencia de licencias de terceros (MIT, CC BY-SA 4.0) con una licencia propietaria.
- Auditoria de cumplimiento: los ficheros `TDM-RESERVATION.json`, `LICENSE_PROVENANCE.json` y `OWNER_IDENTITY.json` sirven como caso de estudio de metadatos de licencia en plataformas de modelos.
- Investigacion sobre empaquetado de repositorios: el manifiesto `language/xd_ecs_history_suite/manifest.json` y el fichero de verificacion `language/xd_ecs_history_suite_reference/verification.json` documentan un proceso de admision con comprobaciones previas a la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declaran pesos ni servicio de inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; la model card afirma explicitamente que no se reclama servicio de inferencia alojado.
- Latencia y throughput: no disponible.
- Espacio en disco: el repositorio ocupa 13,6 GB, principalmente codigo fuente, recursos de replay, esquemas y material de procedencia.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria, dado que el repositorio no declara un checkpoint neuronal con parametros, contexto ni benchmarks evaluables.

## Limitaciones y advertencias

- No es un modelo neuronal entrenado: la propia model card indica que no se reclama checkpoint ni servicio de inferencia, por lo que no puede evaluarse con metricas estandar de modelos de lenguaje.
- Licencia propietaria con "all rights reserved" y sin concesion de permisos: el uso comercial, la redistribucion y la mineria de texto y datos estan reservados por el autor.
- La model card incluye datos personales del autor (identificador NL200678942 y fecha de nacimiento) que deben tratarse con cautela y no reutilizarse.
- El contenido mezcla material de terceros con licencias distintas (MIT para copias TOMK, CC BY-SA 4.0 para la utilidad IBM, avisos de Qiskit); cualquier reutilizacion requiere revisar cada licencia por separado.
- La model card cita material de vacantes de TNO como contexto de investigacion y declara no reclamar propiedad ni respaldo de TNO; conviene no interpretar el repositorio como producto oficial de TNO.
- No hay evidencia publica de evaluacion independiente, benchmarks ni revision por pares; las afirmaciones del autor sobre verificacion y reproducibilidad no son verificables desde la informacion proporcionada.
- Idioma unico declarado (ingles); no se declara soporte multilingue.
- Riesgo de confusion: el nombre y la presentacion pueden llevar a esperar un modelo de lenguaje convencional, cuando el contenido es un conjunto de artefactos de codigo y procedencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/c0mbatduckzz/TNOMTOM
- Implementacion y reproduccion V11: `language/xd_ecs_history_suite/README.md`
- Markdown completo V11: `output/TNO_XD_TAU_Exact_LUT_Realization_V11.md`
- Informe de aplicaciones fisicas (PDF): `output/pdf/TNO_Crossed_Suite_Real_World_Applications.pdf`
- Recibo de entrega V11: `output/TNO_XD_TAU_Exact_LUT_Realization_V11.delivery.json`
- Manifiesto de admision V11: `language/xd_ecs_history_suite/manifest.json`
- Verificacion de referencia independiente: `language/xd_ecs_history_suite_reference/verification.json`
- Esquemas y guia de lenguaje: `hardware/xd_tau_lut/schematics/history_suite/README.md`
- Scrape original de vacantes TNO: `TNO_Hybride_Vacatures_2026-10-28.md`
- Revisiones de fuentes y hashes: `system_of_systems/integration/sources.lock.json`
- Inventario de release y procedencia: `provenance/release_inventory.json`
- Prompts de conversacion y contexto publico: `provenance/conversation.md`
- Linaje TNO-a-V11: `provenance/LINEAGE.md`
- Terminos de servicio de Hugging Face: https://huggingface.co/terms-of-service
