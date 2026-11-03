# ProtonPrat/G-Mineru-checkpoints-public

## Resumen

G-Mineru-checkpoints-public es un repositorio de pesos intermedios (checkpoints) de un proyecto de investigación en OCR denominado G-Mineru, publicado por el usuario ProtonPrat. No se trata de un modelo final ni de un artefacto listo para producción, sino de un conjunto de respaldos de emergencia de checkpoints de entrenamiento que no estaban replicados en otros repositorios de Hugging Face en el momento de su creación. El repositorio se generó el 3 de noviembre de 2026 ante la retirada inminente del sistema de ficheros FSx `/fsxvision_new` donde residían los originales.

El contenido son ficheros `.pt` de PyTorch (no safetensors ni GGUF) acompañados de `config.json`, logs y evaluaciones finales, organizados por experimentos (E020, E027, E031 con ablaciones A0-A6, E032 y E033). Los tags del repositorio indican que el trabajo se apoya en Florence-2 como base para OCR, con variantes que exploran tamaño de celda (2 px frente a 4 px), pérdida de trazo (stroke loss), congelación del encoder y configuraciones de tiras (strips) de distintas resoluciones. El tamaño total del repositorio es de 17,5 GB y cada checkpoint individual ronda los 1,5 GB, salvo la ablación A4 (torre base) que ocupa unos 443 MB.

La relevancia de este repositorio es fundamentalmente de trazabilidad y reproducibilidad para el equipo de investigación: permite recuperar snapshots concretos citados en análisis de fallos y benchmarks internos (por ejemplo, el checkpoint de E032 usado en el benchmark E030 o el de E027 usado en el análisis E029). No hay información pública sobre el modelo final, su licencia efectiva, sus idiomas o su rendimiento, por lo que debe tratarse como material de investigación crudo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags y la model card apuntan a Florence-2 como base, sin detallar la arquitectura resultante) |
| Parametros totales | No disponible (el tamaño de los ficheros ronda 1,5 GB en la mayoría de checkpoints, pero no se especifica el recuento de parámetros) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en `.pt` de PyTorch) |
| Idiomas soportados | No disponible |
| Licencia | `other` (sin texto de licencia publicado en la información disponible) |
| Formato de pesos | `.pt` (PyTorch), con `config.json` asociado en las ablaciones E031 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Los tags (`ocr`, `florence-2`) y los nombres de los experimentos permiten inferir que se parte de Florence-2 y se realizan adaptaciones orientadas a OCR denso: las ablaciones E031 varían el tamaño de celda (2 px en la configuración base, 4 px en A1), la presencia o ausencia de stroke loss (A2 la elimina), la congelación del encoder (A3), el tamaño de la torre (A4 usa torre base frente a torre grande en el resto) y la configuración de tiras (A5 solo p3; A6 8x128; base con p2p3 4x64). Cada ablación se entrena durante 21.000 pasos y se ejecuta con dos semillas en la configuración base (A0_s0 y A0_s1).

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. El repositorio incluye logs y evaluaciones por imagen en el respaldo S3 del equipo, pero no en este repositorio de Hugging Face.

## Capacidades

- No se documentan capacidades funcionales del modelo en la información disponible.
- Por los tags y el nombre del proyecto (G-Mineru, OCR, Florence-2), el objetivo declarado es OCR, presumiblemente OCR denso y con grounding, pero no se detalla el conjunto exacto de tareas soportadas.
- No hay información sobre tool calling, function calling ni soporte de agentes.
- No hay información sobre capacidades multilingües.
- No hay información sobre modos especiales (thinking, visión, audio) más allá de la referencia implícita a visión por el uso de Florence-2.

## Casos de uso

- Reproducción de experimentos de investigación: los checkpoints E031 (A0-A6) permiten reproducir las ablaciones de tamaño de celda, stroke loss, congelación de encoder y configuración de tiras, comparando resultados con las dos semillas de la configuración base. Es el uso principal y el único claramente respaldado por la información disponible.
- Análisis de fallos: el checkpoint `ckpt_e027_mid.pt` se usó en el análisis de fallos E029, por lo que sirve para reproducir dicho análisis y estudiar los modos de error del modelo en etapas intermedias del entrenamiento.
- Evaluación comparativa interna: el checkpoint `e032_best_step59978.pt` se empleó en el benchmark E030, lo que permite reproducir esa comparativa con el mismo punto de control exacto.
- Auditoría de trazabilidad: los checksums SHA-256 publicados permiten verificar la integridad de cada fichero frente a los originales en FSx y en el respaldo S3, útil en procesos de auditoría de experimentos.
- Recuperación tras pérdida de datos: al ser un respaldo de emergencia, el repositorio sirve para restaurar snapshots que no estaban replicados en otros repositorios de Hugging Face.
- Estudio de la evolución del entrenamiento: la inclusión de snapshots en distintos pasos (2949, 29552, 59978) permite analizar la dinámica de aprendizaje en distintas fases del entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluaciones finales dentro de las carpetas de ablaciones E031 y referencias a un benchmark E030 y a un análisis de fallos E029, pero no se incluyen cifras en el repositorio ni en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. A partir del tamaño de los ficheros (aproximadamente 1,5 GB por checkpoint en la mayoría de casos, 443 MB en A4), una carga en FP32 requeriría del orden de 1,5-2 GB de VRAM solo para pesos, más memoria para activaciones y el procesador de visión de Florence-2; una carga en FP16 reduciría aproximadamente a la mitad. Son estimaciones derivadas del tamaño de fichero, no datos publicados.
- GPU recomendadas: no disponible. Por tamaño de pesos, cualquier GPU consumer con 8 GB o más debería poder cargar los checkpoints en FP16, pero no hay datos de latencia ni de throughput.
- Compatibilidad con GPU consumer: probable por tamaño de pesos, pero no confirmada por el autor.
- Opciones de despliegue: los pesos están en `.pt` de PyTorch, por lo que el despliegue requeriría el código del repositorio GitHub `ProtonPratt/G-Mineru`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al no haber pesos en GGUF ni safetensors, estas herramientas no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos ni datos de rendimiento que permitan establecer una comparativa rigurosa. El único punto de referencia explícito es Florence-2, usado como base según los tags, pero no se ofrecen métricas comparativas.

## Limitaciones y advertencias

- No es un modelo final: son checkpoints intermedios de investigación, sin garantía de calidad ni de comportamiento estable.
- Licencia `other` sin texto publicado: no se puede determinar si el uso comercial está permitido; hay que contactar con el autor o consultar el repositorio principal antes de cualquier uso en producción.
- Los pesos están en `.pt` de PyTorch, formato no seguro para carga de terceros y no compatible con los pipelines estándar de inferencia (safetensors, GGUF).
- No hay model card técnica: se desconoce el dataset de entrenamiento, los idiomas, el contexto y las capacidades exactas, lo que impide evaluar sesgos y riesgos de alucinación.
- El repositorio depende del código de GitHub `ProtonPratt/G-Mineru` para poder ejecutarse; sin él, los checkpoints son difícilmente utilizables.
- Los checkpoints principales (E008-E013, E020, E026-E028, E032, E033, E033a, E043) están en un repositorio privado, por lo que este repositorio público está incompleto para reproducir el proyecto al completo.
- Las fechas de creación y actualización (noviembre de 2026) y el contexto de respaldo de emergencia sugieren que el proyecto puede estar inactivo o en proceso de migración; conviene verificar el estado del repositorio principal antes de invertir esfuerzo.
- No se han publicado evaluaciones de sesgo, robustez ni seguridad.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ProtonPrat/G-Mineru-checkpoints-public
- Repositorio privado de checkpoints principales (referenciado en la model card): `ProtonPrat/G-Mineru-checkpoints`
- Código en GitHub (referenciado en la model card): `ProtonPratt/G-Mineru`
- Respaldo S3 del equipo: rutas FSx indicadas en la tabla de checksums de la model card (acceso no público)
