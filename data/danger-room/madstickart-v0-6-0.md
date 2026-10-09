# danger-room/MadStickArt-v0.6.0

## Resumen

MadStickArt v0.6.0 es un decodificador neuronal de rasterización ("neural raster decoder") desarrollado por danger-room que reconstruye fotogramas en escala de grises de 956 × 400 píxeles (relación de aspecto 2,39:1) a partir de cuatro máscaras de layout explícitas: actores, escenario, props y movimiento. No es un modelo de lenguaje ni un generador de texto: su única tarea declarada es la rasterización condicionada por layout de escenas de storyboard con figuras de palo, con un contrato de salida fijo y determinista en resolución y formato.

El modelo es extremadamente compacto: 61.296 parámetros en safetensors, con licencia Apache 2.0 y pesos publicados en PyTorch. Esa escala lo sitúa en la categoría de decodificadores pequeños ejecutables en CPU, pensados para integrarse en un pipeline mayor que separa la decisión de composición (planificador Strands) del renderizado procedural de geometría y de la rasterización neuronal final.

Su relevancia actual es acotada pero clara: sirve como componente de rasterización dentro de herramientas de previsualización y storyboarding, y como referencia reproducible para evaluar decodificadores condicionados por layout, con métricas declaradas sobre un split de test aislado por título. En el momento de la consulta el repositorio público acumulaba 0 descargas y 0 likes, y la model card advierte explícitamente que las métricas miden la concordancia con el profesor procedural sintético, no la calidad narrativa percibida por humanos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador neuronal de rasterización (detalles internos de capas no disponibles) |
| Parámetros totales | 61.296 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; no procesa secuencias de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Tarea (pipeline) | image-to-image |
| Entrada | Cuatro máscaras de layout: actores, escenario, props y movimiento |
| Salida | Fotograma en escala de grises de 956 × 400 px, relación de aspecto 2,39:1 |
| Tamaño del repositorio | 0,0 GB |
| Paquete de runtime | madstickartmodel 0.1.0 |
| Librería | PyTorch |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura interna (no se confirma si es un transformer, una CNN, un modelo híbrido u otra familia). Lo que sí se documenta es su función: un decodificador que recibe cuatro máscaras de layout explícitas y produce un raster en escala de grises de 956 × 400 px. La model card insiste en que el modelo no genera texto de historia ni elige la composición a partir de píxeles: la decisión de escena recae en Strands Decider (que rellena controles ausentes, respetando los controles y colocaciones explícitos del usuario), el renderizador procedural coloca la geometría y el decodificador neuronal rasteriza ese layout.

El entrenamiento se apoya en un profesor procedural sintético, no en fotogramas ni guiones reales. La versión v0.6.0 entrena pesos nuevos durante 16 épocas fijas sobre 7.680 escenas acumuladas procedentes de quince datasets fuente reales, más 42.483 escenas de dominio retenido seleccionadas explícitamente, lo que suma una colección de entrenamiento de 50.163 filas. El catálogo de datos base consta de 512 pares, 1 género y 4 títulos fuente. La selección del checkpoint se hace por pérdida de validación, con pesos agrupados de 0,25/0,25/0,25 para interval/canonical legacy/prior rotated y 0,05 para cada dominio retenido adicional; los resultados de test y challenge no participan en la selección. Existe además una reparación separada que conserva las 11.479 escenas de entrenamiento y 2.460 de validación de la línea canónica legacy, más una reproducción acotada e independiente de la puntuación de 8.000 escenas de entrenamiento y 1.600 de validación del origen rotado de v0.5. No se menciona RLHF, DPO ni ningún otro ajuste por preferencias humanas. Entre los componentes del sistema figuran la librería de activos procedurales 0.11.0 y el planificador StrandsAgents/strands-decider-2B-hobson-v19 (revisión bb282d786bc251fd4e3068de3ada9ddbb38127cd).

## Capacidades

- Rasterización condicionada por layout: reconstruye un fotograma en escala de grises de 956 × 400 px a partir de máscaras de actores, escenario, props y movimiento.
- Contrato de salida fijo: resolución 956 × 400 y relación de aspecto 2,39:1.
- Renderizado reproducible: publicación versionada con revisión inmutable (`v0.6.0`) y sumas de verificación del catálogo y del manifiesto del dataset.
- Integración en pipeline procedural: consume la geometría colocada por el renderizador procedural, no decide composición.
- Ejecución ligera: 61.296 parámetros, viable en CPU y en entornos de navegador (el Space de demostración ejecuta el renderizador de activos en Python dentro de un worker del navegador).
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Capacidades de agente y razonamiento multi-paso: no disponibles en el modelo; la planificación corresponde al componente Strands Decider, separado.
- Capacidades multilingües: ninguna; el modelo no procesa lenguaje natural.
- Capacidades especiales (visión, audio, modo thinking): no disponibles. La única modalidad soportada es imagen a imagen sobre layout explícito.

## Casos de uso

- Previsualización de storyboard en preproducción audiovisual: el equipo define máscaras de actores, escenario, props y movimiento en una herramienta de dibujo por capas y el decodificador devuelve un fotograma de 956 × 400 px listo para animática.
- Generación de datos sintéticos para visión por computador: al producir pares layout → raster con un profesor procedural, se pueden fabricar conjuntos de imágenes etiquetadas para entrenar o evaluar modelos de segmentación y detección de figuras de palo.
- Renderizado por capas en editores raster: mediante el paquete `madstickartmodel 0.1.0`, un editor puede ofrecer "rasterizar layout" como operación de un clic en lugar del dibujo manual de figuras de palo, manteniendo el control explícito del usuario sobre la colocación.
- Automatización de tableros de guion para animación: partiendo de un catálogo de beats generalizados asociados a títulos de cine y televisión, el pipeline genera variantes visuales de cada beat con encuadre consistente en 2,39:1.
- Evaluación de decodificadores condicionados por layout: el checkpoint sirve como referencia reproducible en el split title-held-out (128 escenas) para comparar IoU de primer plano y MAE de píxel frente a alternativas.
- Investigación y docencia sobre modelos diminutos: con 61.296 parámetros y pesos safetensors, es un caso práctico para estudiar decodificadores de rasterización entrenados con profesor sintético sin necesidad de GPU.
- Demostración interactiva en navegador: el Space MadStickArt-Playground expone 70 ajustes y 196 props mediante el renderizador de activos en Python, lo que permite probar combinaciones de layout sin infraestructura local.
- Verificación de pipelines de publicación de modelos: los destinos `MadStickArt` y `MadStickArt-v0.6.0` pasan comprobaciones anónimas de suma de verificación e inferencia, útiles como plantilla de CI/CD para artefactos pequeños.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index).

| Benchmark / métrica | Conjunto de evaluación | Valor |
|---|---|---|
| Foreground IoU (umbral de tinta 0,35) | MadStickArt synthetic 1-genre title-held-out test split (128 escenas) | 0,66806085 |
| MAE de píxel | MadStickArt synthetic 1-genre title-held-out test split | 0,01252305 |
| Foreground IoU de validación | Conjunto de validación (11.612 escenas) | 0,7084 |
| Foreground IoU de referencia | Baseline de unión bilineal sobre el test | 0,2765 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes), algo esperable dado que el modelo no es un modelo de lenguaje. Las métricas anteriores miden la concordancia con el profesor procedural sintético, no juicios humanos sobre calidad narrativa, composición o legibilidad. Los géneros están balanceados en el conjunto, pero las etiquetas de acción y emoción no lo están. Existe además una comparación suplementaria del mismo input sobre las 1.920 escenas nuevas del test de intervalo en ocho géneros, en `reports/interval-quality.json`.

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable. Con 61.296 parámetros, los pesos ocupan aproximadamente 0,23 MiB en fp32 y 0,12 MiB en fp16; el coste real depende de la resolución de salida (956 × 400 px) y de los detalles de implementación del decodificador, no disponibles.
- GPU recomendadas: ninguna específica. El modelo es ejecutable en CPU y no requiere GPU dedicada.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en gráficas integradas; no se han publicado requisitos mínimos.
- Opciones de despliegue: PyTorch con el paquete `madstickartmodel 0.1.0`; ejecución en el navegador a través del Space de demostración, que corre el renderizador de activos en Python dentro de un worker local. vLLM, llama.cpp, Ollama y TGI no aplican a este modelo (no es un modelo de lenguaje ni publica pesos GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Licencia | IoU en test |
|---|---|---|---|---|---|
| MadStickArt v0.6.0 | 61.296 | Rasterización condicionada por layout | Cuatro máscaras (actores, escenario, props, movimiento) | Apache 2.0 | 0,6681 (umbral 0,35) |
| Baseline de unión bilineal | No aplica (referencia no neuronal) | Rasterización por interpolación | Las mismas máscaras | No disponible | 0,2765 |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

Además de estos dos puntos de comparación internos, la información disponible no identifica otros decodificadores de rasterización condicionados por layout comparables, por lo que la comparativa con modelos de terceros queda como no disponible.

## Limitaciones y advertencias

- Alcance funcional muy restringido: no genera texto de historia ni elige la composición a partir de píxeles; solo rasteriza el layout que recibe.
- Métricas no verificadas: los resultados del model-index figuran con `verified: false` y corresponden a un único split aislado por título de 128 escenas.
- Sesgo de datos sintéticos: el test de 1 género y 4 títulos fuente limita la generalización; las etiquetas de acción y emoción no están balanceadas aunque los géneros sí.
- Riesgo de alucinación visual: no se han publicado estudios específicos, pero al tratarse de un decodificador entrenado contra un profesor procedural, la fidelidad fuera de la distribución del profesor no está caracterizada.
- Idioma: la etiqueta del repositorio es únicamente `en`; el modelo no procesa lenguaje natural en ningún idioma.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso de licencia; no se declaran restricciones adicionales en la información disponible.
- Ausencia de tracción pública: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.
- Integridad de artefactos: la procedencia se documenta mediante sumas SHA-256 del catálogo y del manifiesto del dataset; conviene fijar la revisión `v0.6.0` para descargas reproducibles, ya que los conjuntos de condicionamiento, los targets, las cachés de decisión y los registros de entrenamiento no se distribuyen.
- Dependencia de componentes externos: el pipeline completo requiere el planificador StrandsAgents/strands-decider-2B-hobson-v19 y la librería de activos procedurales 0.11.0, cuyas versiones condicionan el resultado.
- Datos de plataforma poco habituales: la fecha de creación del repositorio figura como 2026-10-08 en los metadatos de HuggingFace, lo que conviene tener en cuenta al fechar la ficha.

## Enlaces

- Modelo público: https://huggingface.co/danger-room/MadStickArt-v0.6.0
- Repositorio estable (main): https://huggingface.co/danger-room/MadStickArt/tree/main
- Revisión inmutable v0.6.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.6.0
- Repositorio inicial preservado: https://huggingface.co/danger-room/MadStickArt-v0.1.0
- Etiqueta v0.1.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.1.0
- Etiqueta v0.2.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.2.0
- Etiqueta v0.3.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.3.0
- Etiqueta v0.4.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.4.0
- Etiqueta v0.5.0: https://huggingface.co/danger-room/MadStickArt/tree/v0.5.0
- Demo en navegador (Space): https://huggingface.co/spaces/danger-room/MadStickArt-Playground
- Planificador de escena: StrandsAgents/strands-decider-2B-hobson-v19 (revisión bb282d786bc251fd4e3068de3ada9ddbb38127cd, no se proporcionó URL directa)
- Los resultados de la búsqueda web disponible no contenían enlaces relevantes al modelo (devolvieron definiciones del término "danger" en francés).
