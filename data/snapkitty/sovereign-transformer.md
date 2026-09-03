# Snapkitty/sovereign-transformer

## Resumen

Sovereign Transformer es un sistema de clasificación y filtrado de corpus diseñado para actuar como puerta de entrada en pipelines de entrenamiento de modelos de lenguaje. No se trata de un modelo neuronal, sino de un motor de reglas Datalog puro combinado con una capa de validación en ensamblador x86-64 que opera en aproximadamente 5 ciclos de CPU por registro. El proyecto está desarrollado por Snapkitty y se presenta como una alternativa determinista y auditable a los filtros basados en LLM o en lógica condicional tradicional.

La relevancia de esta pieza radica en su enfoque radicalmente distinto al de los filtros convencionales: las políticas de aceptación, rechazo o reescritura se expresan como reglas formales en Datalog (ejecutadas con Soufflé) y la comprobación de campos críticos se realiza en ensamblador sin dependencias de libc ni asignación dinámica de memoria. Esto garantiza un comportamiento predecible, sin ramas condicionales en la lógica de clasificación y con una trazabilidad completa mediante firmas Ed25519 y cadenas de hash Blake3 (modo WORM). El sistema está pensado para entornos donde la integridad del corpus es crítica y se requiere una auditoría exhaustiva de cada registro antes de que entre en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de reglas Datalog (Soufflé) + capa de validación en ensamblador x86-64 (plasma gate) |
| Parametros totales | no disponible (no es un modelo neuronal) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no disponible (el sistema no procesa lenguaje natural) |
| Licencia | Dual: Sovereign Source License v1.0 y Apache License 2.0 |
| Formato de pesos | no aplicable (código fuente y reglas Datalog) |

## Arquitectura y entrenamiento

El sistema se compone de dos capas principales. La primera, denominada "plasma gate", es una rutina en ensamblador x86-64 que valida campos críticos de cada registro del corpus: puntero de identificador no nulo y no vacío, puntero de hash SHA-256 no nulo, etiqueta de split dentro del conjunto {0,1,2,3} y peso en el intervalo (0.0, 1.0]. Esta capa opera exclusivamente en registros, sin usar heap ni libc, y devuelve códigos de error específicos (0=PASS, 1=NULL_ID, 2=NULL_SHA, 3=BAD_SPLIT, 4=ZERO_WEIGHT, 5=OVERFLOW).

La segunda capa es un motor de reglas Datalog (ejecutado con Soufflé) que aplica cinco compuertas: completitud de esquema (seis campos obligatorios), validez del split (train/val/test/holdout), integridad de dominios críticos (seguridad, criptografía, verificación formal, arquitectura de sistemas), protección contra terminología de jailbreak (DAN = "Do Anything Now") y verificación de peso (ya aplicada en la capa x86). El resultado es determinista: la salida más estricta gana, con prioridad `rewrite_needed > rejected > approved`. Cada registro aprobado recibe un recibo WORM con firma Ed25519 y una cadena de hash Blake3 antes de pasar al pipeline de entrenamiento.

No se dispone de información sobre un proceso de entrenamiento en el sentido tradicional, ya que no hay pesos ni parámetros que ajustar. El sistema se configura mediante reglas Datalog y ensamblador, y su lógica es completamente estática.

## Capacidades

- Validación estructural de registros de corpus: comprueba presencia y formato de campos obligatorios (id, source_sha256, split, created_by, review_status, weight).
- Clasificación determinista en tres categorías: `approved`, `rejected` y `rewrite_needed`, con prioridad estricta entre ellas.
- Verificación de integridad en dominios críticos: detecta inexactitudes en seguridad, criptografía, verificación formal y arquitectura de sistemas.
- Protección contra entradas de jailbreak: bloquea cualquier registro que contenga la secuencia "DAN" (Do Anything Now).
- Trazabilidad criptográfica: cada registro aprobado se firma con Ed25519 y se encadena mediante Blake3, permitiendo auditoría completa.
- Ejecución de alto rendimiento: la capa de ensamblador valida campos básicos en ~5 ciclos de CPU sin asignación de memoria.
- Integración con pipelines de entrenamiento: actúa como compuerta previa, aceptando o rechazando registros antes de que lleguen al proceso de entrenamiento.

## Casos de uso

- Preparación de corpus para entrenamiento de LLMs: el sistema filtra registros que no cumplen el esquema definido o que contienen errores en dominios sensibles, garantizando que solo datos íntegros entren en el modelo.
- Auditoría de integridad en pipelines de datos: gracias al recibo WORM con firma Ed25519 y hash Blake3, se puede verificar que cada registro aprobado no ha sido alterado posteriormente, lo que es útil en entornos regulados.
- Detección de intentos de jailbreak en datasets: la regla que bloquea "DAN" impide que instrucciones maliciosas se cuelen en el corpus de entrenamiento, reduciendo el riesgo de comportamientos no deseados en el modelo final.
- Filtrado de datos con requisitos de trazabilidad: organizaciones que necesitan demostrar el origen y estado de cada muestra de entrenamiento pueden usar el recibo criptográfico como evidencia.
- Reemplazo de filtros basados en LLM: en lugar de usar un modelo de lenguaje para revisar el corpus (lo que introduce no determinismo y coste), este sistema ofrece una alternativa puramente lógica y rápida.
- Control de calidad en datasets multilingües o multi-dominio: aunque no procesa lenguaje natural, puede validar la estructura y el split de registros en cualquier idioma, siempre que los campos estén correctamente etiquetados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la capa de ensamblador opera en ~5 ciclos de CPU por registro, pero no se ofrecen mediciones comparativas con otros sistemas de filtrado.

## Requisitos de hardware

- Al ser un sistema basado en reglas Datalog y una rutina en ensamblador, no requiere GPU ni memoria de vídeo.
- La capa x86-64 necesita una CPU compatible con la arquitectura x86-64; el resto del sistema (Soufflé, Rust, Tokio) puede ejecutarse en cualquier servidor estándar.
- El consumo de memoria es mínimo, ya que la capa de ensamblador no usa heap y el motor Datalog procesa reglas de forma eficiente.
- Para despliegue, se puede compilar como un binario Rust independiente o integrarse en un servicio asíncrono con Tokio. No se mencionan opciones como vLLM, llama.cpp u Ollama, dado que no es un modelo de inferencia.
- El throughput dependerá del volumen de registros y de la complejidad de las reglas Datalog, pero al ser determinista y sin red neuronal, es previsiblemente alto en comparación con filtros basados en LLM.

## Comparativa con modelos similares

No disponible. No se han identificado sistemas equivalentes en la información proporcionada que combinen Datalog, ensamblador y verificación criptográfica para filtrado de corpus. Los filtros tradicionales suelen basarse en heurísticas o en modelos de lenguaje, pero no ofrecen la misma garantía de determinismo y auditoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni procesa lenguaje natural; solo valida y clasifica registros estructurados.
- La licencia dual (Sovereign Source License v1.0 y Apache 2.0) implica que el uso comercial debe cumplir los términos de la licencia Sovereign, que pueden tener restricciones adicionales no detalladas en la información disponible.
- La regla de bloqueo de "DAN" es específica y no cubre otras variantes de jailbreak; la efectividad depende de la exhaustividad de las reglas Datalog definidas.
- El sistema no ofrece flexibilidad para adaptarse a cambios en el esquema de datos sin modificar las reglas Datalog y recompilar la capa de ensamblador.
- No hay documentación sobre el rendimiento en conjuntos de datos grandes ni sobre la escalabilidad horizontal; la información disponible se limita a la descripción de la arquitectura.
- Al estar diseñado como una compuerta previa al entrenamiento, no tiene utilidad directa para tareas de inferencia o generación.

## Enlaces

- [HuggingFace: Snapkitty/sovereign-transformer](https://huggingface.co/Snapkitty/sovereign-transformer)
