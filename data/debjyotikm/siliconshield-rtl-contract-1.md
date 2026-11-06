# debjyotikm/siliconshield-rtl-contract-1

## Resumen

SiliconShield-RTL Contract-1 es un modelo de clasificación de texto especializado en evaluación de seguridad de código RTL (Register Transfer Level), es decir, descripciones de hardware en Verilog y SystemVerilog. Lo desarrolla el usuario debjyotikm y se construye como un ajuste fino del modelo base convaiinnovations/laya. El modelo recibe una región RTL autocontenida, un requisito de seguridad redactado en inglés y unas asunciones de ejecución explícitas, y devuelve una decisión estructurada de tres vías: `satisfies_requirement`, `violates_requirement` o `insufficient_context`.

El problema que aborda es la priorización del esfuerzo de verificación en el diseño de hardware: en lugar de lanzar simulaciones o pruebas formales indiscriminadamente, el modelo señala qué regiones del diseño parecen inconsistentes con un requisito de seguridad declarado. Su propuesta de valor principal es la ejecución local: los diseños sensibles no salen del hardware del usuario, algo relevante en entornos de propiedad intelectual cerrada.

Con 436.031.238 parámetros (aproximadamente 436 millones) y un repositorio de 1,7 GB en formato safetensors, es un modelo de tamaño medio que puede ejecutarse en hardware de consumo. La model card reporta 191 de 192 decisiones completamente especificadas correctas y cero predicciones falsas de seguridad sobre 96 violaciones, si bien la precisión global en tres vías cae al 89,24 % y al 43,65 % en poblaciones desplazadas, lo que delimita un alcance operativo estrecho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores residuales (28 capas adaptadoras, rango 256, escala 8) sobre el modelo base convaiinnovations/laya |
| Parámetros totales | 436.031.238 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | max_len 1536 tokens de entrada; head_max_len 256 |
| Tipos de cuantización | no disponible (evaluación reportada en BF16 para inferencia y FP32 para probabilidades y métricas) |
| Idiomas soportados | inglés (requisitos de seguridad en inglés); otros idiomas no disponibles |
| Licencia | other (licencia de publicación pendiente de confirmación del propietario; términos upstream aplicables en revisiones fijadas) |
| Formato de pesos | safetensors |
| Librería | laya |
| Pipeline | text-classification |
| SHA-256 de pesos | f4130223ed19be5cc7e21b3da70cb7aebf944ad6ed4a8a80f11d8f59bcd05ee7 |
| Contrato de pregunta | siliconshield-requirement-context-v1 (SHA-256 dd1f38ee223abac1f75b19d9086fd26d90865c9aa43097674fffdd61dbbf8bd3) |

## Arquitectura y entrenamiento

El modelo parte de convaiinnovations/laya y se ajusta mediante 28 capas de adaptadores residuales con rango 256 y escala 8. La tarea se formula como clasificación de tres clases sobre una entrada compuesta por requisito, asunciones y región RTL, con presupuestos de longitud separados para la entrada principal (1536 tokens) y para la cabeza de clasificación (256 tokens). La inferencia de referencia se realiza en BF16, mientras que las probabilidades y métricas se calculan en FP32.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Sí especifica que la evaluación se realizó sobre familias de desarrollo equilibradas y disjuntas por grupo, y que existe un contrato de pregunta versionado que forma parte de la identidad del modelo junto con los pesos, el orden de etiquetas y el comportamiento en tiempo de ejecución. La model card advierte explícitamente que decisiones marginales pueden diferir entre hardware aunque las identidades coincidan, por lo que cualquier afirmación de reproducibilidad debe indicar runtime, precisión, contrato, checkpoint y población.

## Capacidades

- Clasificación de seguridad de regiones RTL en tres etiquetas estructuradas: `satisfies_requirement`, `violates_requirement` e `insufficient_context`.
- Evaluación condicionada por especificación: el requisito de seguridad en inglés y las asunciones de ejecución forman parte de la entrada, no son contexto implícito.
- Detección de rutas de escritura con bloqueo (lock-gated write paths) y controles de privilegio o autorización previos a la actualización de registros.
- Tratamiento diferenciado de rutas normales y rutas de depuración (debug paths).
- Reconocimiento de exenciones explícitas de reset respecto a requisitos de retención.
- Ejecución local sin envío de diseños a servicios externos.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking según la información disponible.
- Capacidades multilingües: no disponibles; la entrada de requisitos se especifica en inglés.

## Casos de uso

- Triaje previo a verificación formal: el equipo introduce una región RTL y un requisito de seguridad y usa la decisión para priorizar qué módulos pasan primero a pruebas formales, reduciendo el número de propiedades que se lanzan a ciegas.
- Revisión de rutas de escritura privilegiada: el modelo identifica si una actualización de registro está protegida por un control de autorización declarado en el requisito, útil en revisiones de bloques de control de acceso.
- Auditoría de rutas de depuración: permite comprobar si una ruta de debug queda adecuadamente separada de la ruta funcional según la asunción de ejecución indicada, un punto habitual de fugas de privilegio en silicio.
- Detección de escrituras sin bloqueo: al evaluar requisitos que exigen lock previo, el modelo señala posibles inconsistencias en rutas de escritura, lo que ayuda a localizar candidatos a revisión manual.
- Gestión de requisitos incompletos: la etiqueta `insufficient_context` permite al equipo detectar especificaciones que no definen reset, muestreo o política con suficiente precisión, forzando su completado antes de invertir en verificación.
- Despliegue en entornos de IP cerrada: al ejecutarse localmente sobre hardware del usuario, encaja en flujos donde el diseño no puede enviarse a APIs externas por acuerdos de confidencialidad.
- Filtrado en pipelines de integración de hardware: puede insertarse como paso de clasificación en un flujo que combine comprobaciones ejecutables, propuesta de reparación y verificación posterior al parche, tal como describe el flujo SiliconShield.

## Benchmarks y rendimiento

| Métrica | Contract-1 |
|---|---:|
| Decisiones completamente especificadas | 191 de 192 (99,48 %) |
| Casos que satisfacen el requisito | 96 de 96 (100 %) |
| Casos que violan el requisito | 95 de 96 (98,96 %) |
| Falsos seguros sobre violaciones | 0 de 96 |
| Precisión global en tres vías | 257 de 288 (89,24 %) |
| Cualificación contrabalanceada | 249 de 288 (86,46 %), 0 falsos seguros sobre 96 violaciones |
| Evaluación desplazada | 330 de 756 (43,65 %), 25 falsos seguros |
| Retención amplia | 3682 de 4095 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas anteriores son específicas de la tarea de evaluación RTL y de las poblaciones descritas en la model card; las matrices completas y desgloses por familia se remiten a un registro de limitaciones complementario no incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16 para los 436 millones de parámetros, más overhead de activaciones y del contexto de hasta 1536 tokens; el repositorio completo ocupa 1,7 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes o despliegue servido, A100 o H100 aportan margen, aunque el modelo no las requiere.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer actuales con 4 GB o más de VRAM.
- Opciones de despliegue: la librería de referencia es `laya`, con descarga vía `huggingface_hub.snapshot_download` en la revisión `v1.0.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card solo indica que la inferencia de referencia se ejecuta en BF16 con probabilidades en FP32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconShield-RTL Contract-1 | 436 M | 1536 tokens | Clasificación de seguridad RTL | other (pendiente) | Hugging Face, 3 descargas |
| convaiinnovations/laya (base) | no disponible | no disponible | Modelo base de propósito general | no disponible | Hugging Face |
| Alternativas especializadas en seguridad de hardware | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (clasificación de seguridad RTL condicionada por especificación) en la documentación proporcionada. La comparación con el modelo base no es directa porque este no está orientado a la tarea.

## Limitaciones y advertencias

- Licencia sin confirmar: la model card indica explícitamente que la licencia de publicación está pendiente de confirmación del propietario y que el archivo no debe tratarse como licencia concedida. No debe redistribuirse ni usarse comercialmente sin una decisión explícita.
- Alcance operativo estrecho: la precisión cae del 99,48 % en decisiones completamente especificadas al 43,65 % en evaluación desplazada, con 25 falsos seguros en esa población.
- Riesgo de falso seguro: aunque en la población principal se observan cero falsos seguros, la evaluación desplazada registra 25, lo que desaconseja usar la etiqueta `satisfies_requirement` como aprobación de seguridad.
- El modelo no prueba la violación ni acepta la reparación: la model card subraya que la decisión por sí sola no constituye evidencia formal; requiere verificación ejecutable.
- Fuera de alcance declarado: aceptación no supervisada de hardware crítico para seguridad, descubrimiento amplio, clasificación CWE, localización de fallos, puntuaciones de riesgo calibradas y aprobación automática de parches.
- Áreas de mejora activas: manejo de contexto insuficiente, revisión de autorización multi-ruta, precisión de bloqueos, amplitud de representación y calibración.
- Idiomas: los requisitos deben formularse en inglés; no se documenta soporte para otros idiomas.
- Reproducibilidad dependiente del entorno: decisiones marginales pueden variar entre hardware; las afirmaciones reproducibles deben especificar runtime, precisión, contrato, checkpoint y población.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un clasificador de tres clases, el riesgo se manifiesta como clasificación errónea más que como generación libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debjyotikm/siliconshield-rtl-contract-1
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio de descarga referenciado en la model card: `danieltombay/siliconshield-rtl-contract-1`, revisión `v1.0.0` (identificador citado en el quickstart de la model card; no se dispone de URL verificada)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
