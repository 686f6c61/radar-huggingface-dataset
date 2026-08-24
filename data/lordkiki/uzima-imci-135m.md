# Lordkiki/uzima-imci-135m

## Resumen

Uzima es un modelo de 135 millones de parámetros, desarrollado por Lordkiki (Giyath Lawal) para el Africa Deep Tech Challenge 2026, que proporciona soporte clínico offline basado en el protocolo IMCI (Integrated Management of Childhood Illness) de la Organización Mundial de la Salud. El modelo está diseñado para leer la descripción que un trabajador sanitario hace de un niño enfermo y emitir hallazgos estructurados siguiendo la clasificación IMCI, en inglés, kiswahili o hausa.

La relevancia de Uzima reside en su diseño arquitectónico: no es un sistema de decisión clínica autónomo, sino un componente de percepción y explicación dentro de una aplicación más amplia. La clasificación clínica la realiza una implementación determinista y probada del algoritmo IMCI de la OMS; el modelo se limita a interpretar el lenguaje natural y generar la salida estructurada. Esta separación es fundamental para la seguridad del sistema, ya que un modelo de 135M de parámetros es fiable en tareas lingüísticas pero no como fuente de verdad médica.

El modelo está disponible en formato GGUF cuantizado (Q8_0) y se distribuye bajo licencia Apache-2.0. Su tamaño reducido y la optimización para entornos con capacidades SIMD desactivadas lo hacen adecuado para despliegue en hardware de bajos recursos, típico en entornos rurales africanos donde la conectividad y la potencia de cómputo son limitadas. El repositorio incluye código, informe y harness de evaluación en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM2-135M-Instruct (transformer decoder-only) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (recomendado), Q4_K_M (evaluado) |
| Idiomas soportados | Ingles, kiswahili, hausa |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Uzima es un fine-tuning del modelo base HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder-only de 135M de parámetros diseñado para eficiencia en entornos de bajos recursos. El proceso de entrenamiento consistió en ajustar el modelo con un corpus de directrices clínicas IMCI, que incluye descripciones de síntomas, clasificaciones y tratamientos. El dataset está marcado como `needs_clinical_review`, lo que indica que aún no ha sido validado por profesionales clínicos.

El modelo se entrenó para generar una salida estructurada en tres partes: una línea `FINDINGS:` con los hallazgos, una línea `CHECK:` para umbrales numéricos relevantes, y la clasificación final. Este formato de salida permite que el razonamiento del modelo sea auditable y verificable. La elección de Q8_0 como cuantización preferida se basó en mediciones bajo condiciones de auditoría del desafío, que compilan llama.cpp con todas las rutas SIMD desactivadas. En estas condiciones, Q8_0 es 2,4 veces más rápido que Q4_K_M (25,79 tok/s frente a 10,57 tok/s) y además más preciso, con una sensibilidad de derivación del 100% frente al 94,1%.

## Capacidades

- Generación de texto estructurado: produce hallazgos clínicos (`FINDINGS:`), verificación de umbrales (`CHECK:`) y clasificación IMCI.
- Multilingüismo: soporta inglés, kiswahili y hausa, lo que permite su uso en diversos contextos africanos.
- Razonamiento auditable: la salida en tres partes permite verificar el razonamiento del modelo.
- Integración con sistemas deterministas: diseñado para ser un componente de percepción dentro de un sistema de decisión clínica más amplio.
- Inferencia offline: el formato GGUF permite ejecución en entornos sin conectividad.
- Bajo consumo de recursos: 135M de parámetros y cuantización Q8_0 permiten ejecución en hardware modesto.

## Casos de uso

- **Soporte de diagnóstico en clínicas rurales offline**: un trabajador sanitario describe los síntomas de un niño en kiswahili y el modelo genera los hallazgos estructurados que el sistema Uzima utiliza para clasificar según el algoritmo IMCI. El tamaño reducido permite ejecutarlo en un portátil o incluso en una Raspberry Pi sin conexión a internet.
- **Formación de personal sanitario**: el modelo puede usarse como herramienta de práctica, mostrando cómo se aplican los criterios IMCI a casos simulados. Su salida auditable ayuda a los estudiantes a entender el proceso de clasificación.
- **Asistencia en triaje comunitario**: en entornos sin acceso a médicos, el modelo puede ayudar a los trabajadores de salud comunitarios a identificar signos de peligro y derivar a los pacientes adecuadamente.
- **Traducción de protocolos clínicos**: dado su entrenamiento en tres idiomas, puede generar explicaciones en kiswahili o hausa de hallazgos clínicos en inglés, facilitando la comunicación entre equipos multidisciplinarios.
- **Investigación en salud pública**: el modelo puede procesar grandes volúmenes de descripciones de casos y generar hallazgos estructurados para análisis epidemiológico, siempre que la validación clínica esté completa.
- **Desarrollo de aplicaciones de salud**: los desarrolladores pueden integrar el modelo en aplicaciones móviles de salud materno-infantil, aprovechando su formato GGUF y compatibilidad con llama.cpp para despliegues offline.

## Benchmarks y rendimiento

El autor proporciona datos de rendimiento bajo las condiciones de auditoría del Africa Deep Tech Challenge 2026, que compilan llama.cpp con todas las rutas SIMD desactivadas (modo escalar puro):

| Precision | tok/s (escalar) | Sensibilidad de derivacion | Exactitud de severidad |
|---|---|---|---|
| Q4_K_M | 10,57 | 94,1% | 52,5% |
| Q8_0 | 25,79 | 100,0% | 70,0% |

Estos resultados indican que Q8_0 es 2,4 veces más rápido y significativamente más preciso que Q4_K_M en este escenario específico. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo en Q8_0 ocupa 144,8 MB, por lo que puede ejecutarse en CPU sin GPU. En GPU, cabría en cualquier tarjeta con más de 1 GB de VRAM.
- **GPU recomendadas**: no se requiere GPU para inferencia; el modelo está diseñado para ejecutarse en CPU con llama.cpp.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU con al menos 1 GB de VRAM puede ejecutar el modelo si se desea aceleración por hardware.
- **Opciones de despliegue**: llama.cpp (recomendado), llama-cli, y cualquier herramienta compatible con GGUF (Ollama, LM Studio, etc.).
- **Latencia y throughput**: según las mediciones del autor, en modo escalar puro (sin SIMD) el modelo alcanza 25,79 tok/s con Q8_0. En hardware con SIMD activado, la velocidad será notablemente superior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| **Uzima (este modelo)** | 135M | no disponible | IMCI, multilingue (en, sw, ha) | Apache-2.0 | GGUF |
| **SmolLM2-135M-Instruct** | 135M | 2048 | proposito general | Apache-2.0 | safetensors, GGUF |
| **PsycheSmol** | 135M | no disponible | inteligencia emocional | no disponible | no disponible |

La comparación directa es limitada porque Uzima es un modelo de nicho muy específico. Su principal referencia es el modelo base SmolLM2-135M-Instruct, del que hereda la arquitectura y el tamaño. PsycheSmol, otro modelo de 135M, se centra en inteligencia emocional, un dominio diferente. No hay otros modelos de acceso abierto especializados en IMCI con los que compararlo en la información disponible.

## Limitaciones y advertencias

- **No está validado clínicamente**: el modelo no debe usarse para la atención de pacientes. El corpus de directrices está marcado como `needs_clinical_review`.
- **Riesgo de alucinación**: como modelo de lenguaje, puede generar información plausible pero incorrecta. La separación de responsabilidades (modelo percibe, algoritmo determinista decide) es esencial para mitigar este riesgo.
- **Revisión lingüística pendiente**: las cadenas clínicas en kiswahili y hausa tienen estado `NEEDS_REVIEW` hasta que un clínico que hable el idioma las valide.
- **Adaptación nacional**: los umbrales del IMCI son los de la tabla genérica de la OMS. IMCI está adaptado a nivel nacional, por lo que el despliegue debe cargar su propia configuración.
- **Limitaciones de contexto**: el tamaño de contexto no se ha especificado en la información disponible, lo que puede limitar la longitud de las descripciones clínicas que puede procesar.
- **Datos de entrenamiento**: no se proporcionan detalles sobre el volumen o la composición del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lordkiki/uzima-imci-135m
- Repositorio de código y evaluación: https://github.com/Lawalgiyath/ADTC-2026
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Perfil del autor: https://huggingface.co/Lordkiki
