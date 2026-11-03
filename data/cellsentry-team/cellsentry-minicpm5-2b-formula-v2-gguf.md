# cellsentry-team/cellsentry-minicpm5-2b-formula-v2-GGUF

## Resumen

Cellsentry MiniCPM5 2B Formula Review v2 es un ajuste fino (finetune) del modelo base openbmb/MiniCPM5-2B, distribuido por el equipo cellsentry-team en formato GGUF cuantizado Q4_K_M. No es un modelo de propósito general, sino un revisor generativo de alertas de fórmulas de hoja de cálculo: recibe una regla, una dirección de celda, el nombre de la hoja, la fórmula, el hallazgo de la regla y el contexto de negocio, y devuelve un objeto JSON que indica si el hallazgo corresponde a un error real. El repositorio se publica explícitamente como un artefacto de compatibilidad y recuperación de una línea base histórica ("legacy-baseline"), no como un modelo nuevo.

El modelo cuenta con 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) y se distribuye como un único archivo GGUF de 1.561.314.592 bytes con pesos ya fusionados, sin necesidad de descargar el modelo base ni un adaptador por separado. Está pensado para ejecutarse en llama.cpp con una ventana de contexto probada de 1024 tokens, temperatura 0, un máximo de 420 tokens de salida y el modo "thinking" desactivado. Su relevancia actual es acotada: sirve para reproducir una línea base concreta de auditoría de fórmulas, no para evaluar capacidades generales de razonamiento o generación.

La licencia es Apache-2.0 y los idiomas declarados son chino (zh) e inglés (en). El propio autor advierte que los resultados de evaluación no alcanzan el objetivo de precisión del 95 % en el conjunto externo y que las métricas provienen de datos sintéticos, no de validación independiente sobre libros de trabajo reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de openbmb/MiniCPM5-2B; detalles de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens (contexto de ejecucion probado en llama.cpp b11429); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en el repo) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `cellsentry-minicpm5-2b-cancel2-q4_k_m.gguf`, 1.561.314.592 bytes, SHA256 `61d9c8ab8007dbbde0eb004089d1411fb6ec7167031f9d6fcc5b521fe8ebe49a`) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/MiniCPM5-2B en el commit `f97400052a43d642bbc6e9975e2397e3ae6a6b52` y se ajusta mediante finetune supervisado para una tarea de revisión de alertas de fórmulas. Según la model card, se seleccionó el paso de entrenamiento 340 de la "formula v2", se fusionaron los pesos y se cuantizó a Q4_K_M. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal no es arquitectónica sino de formato de tarea: el modelo se entrena para emitir un array JSON de un solo objeto con los campos `cellAddress`, `ruleId`, `isValid`, `adjustedConfidence` y `reasoning`, a partir de un mensaje de sistema fijo (`You are a spreadsheet formula auditor.`) y de un contexto estructurado con regla, dirección, hoja, fórmula, hallazgo, confianza de la regla y contexto de negocio. El autor subraya una convención semántica crítica: `isValid=true` significa que el hallazgo de la regla es un error real, no que la fórmula sea válida. La confianza devuelta no está calibrada.

## Capacidades

- Generación de texto especializada en revisión de hallazgos de fórmulas de hojas de cálculo.
- Emisión de JSON estructurado con un único objeto por petición (array de un elemento).
- Clasificación binaria semántica del hallazgo (`isValid`) con justificación textual en `reasoning`.
- Ajuste de confianza del hallazgo (`adjustedConfidence`), sin calibración garantizada.
- Procesamiento de contexto estructurado de negocio junto con metadatos de la fórmula y la regla.
- Soporte de plantilla de chat embebida en el GGUF.
- Capacidad de desactivar el modo "thinking" (`enable_thinking=false`), requisito del protocolo probado.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente multi-paso, visión, audio ni matemáticas generales.
- Multilingüe limitado a zh y en.

## Casos de uso

- Revisión de alertas de fórmulas en pipelines de auditoría de hojas de cálculo: el modelo recibe cada hallazgo generado por un motor de reglas y devuelve si es un error real, lo que permite filtrar falsos positivos antes de escalar a un revisor humano.
- Triaje de falsos positivos en herramientas de compliance financiero: integrado como paso intermedio entre el motor de reglas y el sistema de tickets, con validación obligatoria del JSON y de la identidad de la celda antes de descartar un hallazgo.
- Reproducción de una línea base histórica en experimentos de investigación: útil para comparar nuevas aproximaciones (por ejemplo, los repositorios mmBERT del mismo equipo) contra un punto de referencia fijo y verificable por SHA256.
- Generación de explicaciones auditables: el campo `reasoning` permite adjuntar una justificación textual a cada decisión de descarte o confirmación, sujeta a revisión posterior.
- Despliegue local en entornos con requisitos de privacidad: al ser un GGUF de 1,6 GB ejecutable con llama.cpp, puede correr en máquinas sin GPU dedicada y sin enviar fórmulas ni datos de negocio a servicios externos.
- Pruebas de regresión de protocolos de prompting: el repositorio fija el runtime (llama.cpp b11429), la temperatura, el límite de tokens y el mensaje de sistema, lo que facilita tests deterministas de integración.
- No es adecuado como modelo de extracción general de PII ni como clasificador genérico; el autor lo excluye explícitamente de esos usos.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Notas |
|---|---|---|
| Precisión de descarte en external580 (crudo) | 65/86 = 75,6 % | 21 errores reales descartados incorrectamente |
| Precisión de descarte con puerta conservadora seleccionada en validación | 58/75 = 77,3 % | 17 descartes inseguros; cobertura del 12,9 % |
| Regresión original180 | 164/180 | Inferior a v1, que obtenía 170/180 |
| Objetivo de precisión externa del 95 % | No alcanzado | Según la model card |

El autor indica que no se ejecutaron nuevos benchmarks de modelo en esta publicación y que los resultados sintéticos no constituyen validación independiente sobre libros de trabajo reales. La puerta conservadora es lógica de aplicación separada del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB solo para los pesos en Q4_K_M; con overhead de contexto (1024 tokens) y buffers de llama.cpp, el consumo real es algo superior, del orden de 2 GB.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: llama.cpp (runtime probado: b11429); otros runners compatibles con GGUF no están validados en la model card.
- Latencia y throughput: no disponibles. El protocolo fija temperatura 0, `max_tokens=420`, contexto 1024 y una sola petición por hallazgo, lo que sugiere un uso secuencial más que de alto rendimiento.
- No se declara ni valida inferencia en dispositivos móviles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| cellsentry-minicpm5-2b-formula-v2-GGUF | 2.516.756.480 | 1024 (probado) | GGUF Q4_K_M | Apache-2.0 | Revisión de alertas de fórmulas |
| openbmb/MiniCPM5-2B (base) | ~2,5 B | no disponible | safetensors | no disponible en la informacion proporcionada | Modelo base de propósito general |
| Repositorios mmBERT de cellsentry-team | no disponible | no disponible | no disponible | no disponible | Clasificación (mencionados como sustitutos independientes, no equivalentes) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de benchmarks.

## Limitaciones y advertencias

- Precisión insuficiente para producción crítica: 75,6 % en crudo y 77,3 % con puerta conservadora, frente al objetivo del 95 %; se documentan 21 y 17 descartes inseguros de errores reales, respectivamente.
- Regresión respecto a v1: 164/180 frente a 170/180 en el conjunto original180.
- La confianza (`adjustedConfidence`) no está calibrada; no debe usarse como probabilidad directa.
- Convención semántica contraintuitiva: `isValid=true` indica que el hallazgo es un error real, no que la fórmula sea válida; un error de interpretación invierte el significado de las decisiones.
- Riesgo de alucinación y de JSON malformado o truncado; el autor exige validar el JSON y las identidades de celda, y prohíbe descartar hallazgos silenciosamente ante errores, truncamiento o evidencia ausente.
- Validación limitada: los resultados provienen de datos sintéticos y de un conjunto externo reutilizado, no de libros de trabajo reales independientes.
- Contexto de ejecución muy corto (1024 tokens) que limita el tamaño del contexto de negocio y de la fórmula enviados por petición.
- Cobertura lingüística restringida a chino e inglés; el castellano no está declarado.
- Uso acotado: el autor lo excluye explícitamente como modelo general de PII o extracción y como artefacto de clasificación mmBERT.
- La puerta conservadora es lógica de aplicación externa al modelo; no forma parte de los pesos.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías y el repositorio se marca como "legacy-baseline" y "compatibility-artifact", sin compromiso de mantenimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-v2-GGUF
- Model card histórica fija (protocolo y comandos completos): https://huggingface.co/cellsentry-team/cellsentry-minicpm5-2b-formula-v2-GGUF/blob/989a466c0568703d9016c9493d4afd42ac5437ce/README.md
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Commit del modelo base: `f97400052a43d642bbc6e9975e2397e3ae6a6b52`
- llama.cpp: no se proporciona URL en la información disponible (runtime probado: build b11429)
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
