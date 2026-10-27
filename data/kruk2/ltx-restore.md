# Kruk2/ltx-restore

## Resumen

`Kruk2/ltx-restore` es un modelo publicado en Hugging Face por el desarrollador independiente Kruk2, identificado en la documentación del proyecto como el nuevo modelo de restauración de vídeo que acompaña al lanzamiento de Jasna LTX v0.11.1. Jasna es una herramienta de restauración de vídeo de código abierto alojada en GitHub (`Kruk2/jasna`), y este repositorio contiene los pesos que dicha herramienta consume. No es, por tanto, un modelo de lenguaje: no genera texto ni mantiene conversaciones, sino que procesa secuencias de vídeo para recuperar calidad visual.

La ficha pública del repositorio está prácticamente vacía: no hay model card, no se declara licencia, no se indican idiomas, pipeline ni resultados de evaluación. El único dato cuantitativo objetivo disponible es el tamaño del repositorio, 170,3 GB, con Xet habilitado, lo que sugiere un conjunto de pesos de gran tamaño o varios checkpoints empaquetados en el mismo repo. El nombre "ltx" apunta a un posible vínculo con la familia de modelos LTX de Lightricks (LTX-Video), pero esta relación no está confirmada en la información disponible y debe tratarse como hipótesis.

Su relevancia actual es acotada pero concreta: cubre el nicho de restauración y mejora de metraje existente (archivo, material antiguo, vídeo comprimido) dentro de un ecosistema de herramientas abierto, en un momento en el que la mayoría de soluciones de restauración de vídeo de calidad son propietarias. El principal obstáculo para evaluarlo es la ausencia total de documentación técnica, licencia explícita y métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible. El nombre sugiere un derivado de la familia LTX (Lightricks), sin confirmar; la documentación solo lo describe como modelo de restauración de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no disponible; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible. Al ser un modelo de vídeo, el equivalente sería la longitud de secuencia de fotogramas soportada, que no se documenta |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; no aplica en el sentido habitual (no es un modelo de texto) |
| Licencia | no disponible. El repositorio no declara licencia; la documentación de Jasna menciona que las máquinas en la nube alquiladas requieren una "licencia especial", lo que apunta a términos de uso personalizados y posiblemente restrictivos |
| Formato de pesos | no disponible. El repositorio ocupa 170,3 GB y usa Xet; no se detalla la extensión de los ficheros (safetensors, GGUF u otros) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de parámetros, la composición del dataset de entrenamiento ni el procedimiento de ajuste (RLHF, DPO u otras técnicas de alineación). Al tratarse de un modelo de restauración de vídeo, es previsible que trabaje sobre fotogramas o sobre representaciones latentes espacio-temporales, pero no hay documentación que lo confirme. Tampoco se especifica si el entrenamiento se hizo desde cero o mediante ajuste fino de un modelo generativo de vídeo preexistente.

El único contexto técnico verificable proviene del proyecto que lo distribuye: Jasna es una herramienta de restauración de vídeo escrita en Python, con documentación propia de modelos en `docs/en/models.md`, y la versión v0.11.1 de "Jasna LTX" introduce este modelo como novedad principal. La documentación de Jasna advierte de que AMD no está soportado actualmente y de que el uso en máquinas en la nube alquiladas tiene soporte limitado por requisitos de licencia. No hay información sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, consistencia temporal explícita, etc.).

## Capacidades

- Restauración de vídeo: es la función declarada del modelo, distribuido como el componente de restauración del pipeline Jasna LTX v0.11.1.
- Procesamiento de metraje existente: orientado a recuperar calidad en material degradado (compresión, ruido, baja resolución), a partir de la descripción del proyecto anfitrión.
- Integración en un pipeline de herramienta de escritorio/servidor: se consume desde Jasna, no como servicio de inferencia genérico.
- Generación de texto, razonamiento, código y matemáticas: no disponible; no es un modelo de lenguaje.
- Tool calling / function calling: no disponible; no aplica.
- Soporte de agentes o razonamiento multi-paso: no disponible; no aplica.
- Capacidades multilingües: no disponible; no aplica.
- Capacidades especiales (modo thinking, visión, audio): no disponible. No se documenta soporte de audio ni de otras modalidades.

## Casos de uso

- Remasterización de archivo audiovisual: aplicar el modelo a copias digitalizadas de material antiguo para reducir ruido y artefactos de compresión antes de un reescalado o de un nuevo masterizado, aprovechando que está pensado específicamente para restauración y no para generación desde cero.
- Recuperación de vídeo familiar y doméstico: procesar grabaciones en baja resolución o con codecs antiguos para obtener una versión más limpia, ejecutando el modelo a través de Jasna en una estación de trabajo local.
- Limpieza previa de metraje para post-producción: eliminar defectos y ruido de fuentes de baja calidad antes de integrarlas en un montaje, de modo que las herramientas posteriores (etallonaje, composición, VFX) partan de material más estable.
- Preparación de datasets de vídeo para entrenamiento: restaurar y homogeneizar la calidad de clips heterogéneos antes de usarlos como datos de entrenamiento de otros modelos, reduciendo el ruido como variable de confusión.
- Mejora de material de vigilancia o de registro documental: tratar secuencias con compresión agresiva para facilitar la inspección visual por parte de un operador humano, siempre que la licencia final lo permita.
- Digitalización de fondos de instituciones: procesar lotes de vídeo de hemerotecas o filmotecas dentro de un flujo de trabajo por lotes, con la advertencia de que el soporte en máquinas en la nube alquiladas está limitado por la licencia descrita en el repositorio de Jasna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye model card, y la documentación enlazada (GitHub de Jasna y la entrada de Buy Me a Coffee sobre la versión 0.11.1) no aporta métricas objetivas de calidad (PSNR, SSIM, LPIPS) ni comparaciones con otros modelos de restauración.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Como referencia indirecta, el repositorio ocupa 170,3 GB, un tamaño que en precisión completa desborda cualquier GPU de consumo y apunta a la necesidad de GPUs de 40-80 GB (A100, H100) o de troceado del modelo con descarga parcial a CPU y RAM del sistema.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del repo, el escenario realista es A100 80 GB o H100 para carga completa; en GPUs de consumo (RTX 4090, 24 GB) solo sería viable con cuantización o con un subconjunto reducido de pesos, extremo no confirmado.
- Cabe en GPU de consumo: no disponible; el dato de tamaño del repositorio hace dudoso que quepa sin cuantización ni offloading.
- Opciones de despliegue: la vía documentada es la herramienta Jasna (GitHub `Kruk2/jasna`). No hay evidencia de soporte para vLLM, TGI, llama.cpp u Ollama, que además no aplican a un modelo de restauración de vídeo.
- Latencia y throughput: no disponibles. Al ser un modelo de vídeo de gran tamaño, se espera un coste por clip proporcional al número de fotogramas, pero no hay cifras publicadas.
- Restricciones de plataforma: según la documentación de Jasna, AMD no está soportado actualmente y el uso en máquinas en la nube alquiladas tiene soporte limitado por requisitos de licencia especial.

## Comparativa con modelos similares

No hay datos verificables en la información proporcionada para una comparativa cuantitativa: el modelo no declara parámetros, contexto, licencia ni métricas, de modo que cualquier tabla numérica sería inventada. A continuación se indica únicamente lo que se puede afirmar con la información disponible.

| Modelo | Categoria | Parametros | Contexto / longitud de secuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kruk2/ltx-restore | Restauración de vídeo | no disponible | no disponible | no disponible (posible licencia especial) | Pesos en Hugging Face, integrado en Jasna |
| Alternativas de la misma categoria (por ejemplo, modelos de superresolución y restauración de vídeo de código abierto, o soluciones comerciales de mejora de vídeo) | Restauración de vídeo | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha |

Para una comparación rigurosa sería necesario obtener del autor la licencia, el número de parámetros y métricas de calidad sobre un conjunto de referencia común.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, arquitectura, sesgos ni procedencia del dataset, lo que impide una evaluación de riesgos mínimamente seria.
- Licencia no declarada: sin licencia explícita en el repositorio, el uso comercial queda en un limbo jurídico. La mención a una "licencia especial" para máquinas en la nube alquiladas en la documentación de Jasna refuerza la sospecha de términos restrictivos; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de artefactos en lugar de alucinación: al no ser un modelo de lenguaje, el fallo típico no es la invención de hechos, sino la generación de detalles plausibles pero falsos en la imagen (texturas sintéticas, rasgos faciales alterados, inconsistencia temporal entre fotogramas), especialmente en material muy degradado.
- Integridad documental: en contextos de archivo, patrimonio o uso probatorio, la restauración puede alterar el contenido original; debe conservarse siempre el material fuente y registrar el procesado aplicado.
- Coste computacional elevado: el tamaño del repositorio (170,3 GB) sugiere requisitos de hardware muy por encima de una GPU de consumo, con el consiguiente coste económico y energético.
- Limitaciones de plataforma: sin soporte AMD y con soporte limitado en máquinas alquiladas en la nube, según la documentación del proyecto anfitrión.
- Trazabilidad dudosa: al no existir paper, blog técnico ni repositorio de código del propio modelo (solo de la herramienta que lo usa), es difícil auditar su comportamiento o reproducir sus resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kruk2/ltx-restore
- Árbol de ficheros del repositorio: https://huggingface.co/Kruk2/ltx-restore/tree/main
- Repositorio de la herramienta Jasna (restauración de vídeo): https://github.com/Kruk2/jasna
- Documentación de modelos de Jasna: https://github.com/Kruk2/jasna/blob/main/docs/en/models.md
- Anuncio de Jasna LTX v0.11.1: https://buymeacoffee.com/kruk2/v0-11-1-released
