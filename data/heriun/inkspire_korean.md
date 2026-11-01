# HERIUN/inkspire_korean

## Resumen

InkSpire Korean es un adaptador LoRA de tipo rango 32 (71,2 millones de parámetros entrenables) diseñado para generar escritura manual en hangul (coreano) a partir de una única línea de referencia. Lo desarrolla HERIUN como reproducción en coreano del método InkSpire (Wang et al., ICLR 2026), y se monta sobre el modelo de difusión de imagen black-forest-labs/flux-3-image-klein-base. El adaptador se distribuye en formato diffusers con pipeline image-to-image y un tamaño de repositorio de 0,3 GB.

El problema que resuelve es concreto: dada una muestra de caligrafía (una línea escaneada) junto con su transcripción exacta, el modelo escribe una frase nueva imitando el trazo, la inclinación y la densidad de tinta de esa referencia. Frente a la alternativa autoregresiva del mismo autor (Eruku Korean), InkSpire destaca en la reproducción fiel de estilos procedentes de fuentes tipográficas y en la robustez ante referencias ruidosas (formularios con líneas de tabla, restos de escaneo), donde otros modelos producen páginas en blanco o desbordamientos.

Es relevante ahora porque aborda una tarea poco cubierta en modelos generativos abiertos para coreano (síntesis de caligrafía condicionada por estilo) y porque publica una evaluación cuantitativa con métricas de reconocimiento óptico (CER) y de distancia de estilo (HWD), además de comparar explícitamente contra un modelo autoregresivo entrenado con los mismos datos. Su licencia, no obstante, es la FLUX Kommunity License, de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre modelo de difusión de imagen FLUX.3-Image-Klein-Base; pipeline image-to-image |
| Parametros totales | 71,2 M parámetros entrenables en el adaptador (los del modelo base no se indican) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; entrada por imagen y texto de transcripción) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos LoRA en safetensors; el base se descarga aparte) |
| Idiomas soportados | coreano (ko) |
| Licencia | FLUX Kommunity License (uso no comercial) |
| Formato de pesos | pytorch_lora_weights.safetensors + klein_empty_prompt.pt (caché de embeddings de prompt vacío) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con 71,2 millones de parámetros, entrenado durante 13.000 pasos sobre el modelo de difusión FLUX.3-Image-Klein-Base. La generación se plantea como un problema image-to-image con tres entradas: un lienzo X que combina la línea de referencia arriba y un espacio vacío abajo, una imagen de contenido Xc donde se dibujan con la fuente NanumGothic tanto la transcripción de la referencia como la frase objetivo dentro de cajas de glifo, y una máscara. La imagen Xc actúa como tabla de correspondencia carácter a carácter, de modo que la transcripción de la referencia es un requisito estructural, no opcional.

El control de estilo se ejerce mediante classifier-free guidance con dos modos: contenido CFG (cfg=2.0, uncond="gen", modo recomendado) y CFG desactivado (cfg=1.0). El ancho de la línea objetivo se ajusta con la relación entre el ancho de la caligrafía de referencia y el ancho de la fuente estándar (parámetro ref_width). Los datos de entrenamiento son renders de fuentes coreanas públicas; no se incluyeron datos de caligrafía real en el entrenamiento, lo que explica el comportamiento asimétrico observado: excelente en estilos tipográficos y algo peor en caligrafía humana real.

## Capacidades

- Generación de escritura manual en hangul condicionada por estilo a partir de una única línea de referencia.
- Transferencia de estilo caligráfico: inclinación, grosor, densidad de tinta y proporciones del trazo.
- Generación de líneas nuevas con contenido arbitrario, siempre que se aporte la transcripción exacta de la referencia.
- Robustez ante referencias ruidosas (formularios con líneas, restos de escaneo), con menor tasa de páginas en blanco o desbordamiento que el modelo comparado.
- Control de compromiso precisión/estilo mediante CFG (cfg=2.0 prioriza legibilidad; cfg=1.0 prioriza fidelidad de trazo).
- Reproducibilidad por semilla: los errores de carácter varían entre semillas, lo que permite reintentar sin cambiar la entrada.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo; es un modelo específico de imagen.

## Casos de uso

- Generación de muestras caligráficas para diseño editorial: a partir de una tipografía manuscrita de referencia se producen titulares o pies de foto nuevos en ese estilo, útil para maquetas y pruebas de concepto antes de encargar caligrafía real.
- Prototipado de fuentes manuscritas: un diseñador puede comprobar cómo se comportaría un alfabeto caligráfico con frases arbitrarias antes de vectorizar los glifos, gracias a la métrica CER de 0,0045 en fuentes held-out con cfg=2.0.
- Relleno de formularios y plantillas con apariencia manuscrita: el modelo mantiene el estilo incluso con referencias que contienen líneas de tabla, con un CER de 0,180 en el conjunto de celdas de formulario (n=286), el mejor resultado de la comparativa en ese escenario.
- Aumento de datos para OCR de escritura manual coreana: generar líneas sintéticas etiquetadas (se conoce la transcripción de origen) para ampliar corpus de entrenamiento de reconocedores, con la cautela de que el estilo proviene de fuentes y no de escritores reales.
- Docencia e investigación en generación condicionada por estilo: el repositorio incluye código de entrenamiento y registro de experimentos, lo que permite reproducir el método InkSpire en otros alfabetos o comparar estrategias de CFG.
- Evaluación comparativa de modelos generativos de escritura: sirve como línea base reproducible frente a modelos autoregresivos (Eruku Korean) usando las métricas CER, HWD y FID publicadas.

## Benchmarks y rendimiento

Datos publicados en la model card (CER y HWD medidos con PP-OCRv6; menor es mejor). Se comparan los dos modos de CFG de InkSpire con el modelo autoregresivo Eruku Korean entrenado con los mismos datos.

| Evaluacion | InkSpire cfg 2.0 | InkSpire cfg 1.0 | Eruku Korean |
|---|---|---|---|
| Fuentes coreanas held-out, 16 tipos, n=300 — CER / HWD | 0,0045 / 1,02 | 0,023 / 0,93 | 0,010 / 1,12 |
| Caligrafía real, generación cruzada de frases, n=20 — CER / HWD | 0,071 / 1,60 | 0,246 / 1,41 | 0,014 / 1,51 |
| Caligrafía real, celdas de formulario, n=286 — CER / HWD | 0,180 / 1,37 | 0,417 / 1,20 | 0,711 (7 en blanco) / 1,83 |
| IAM lines, 2.925 — HWD / FID | no evaluado | 1,68 / 18,58 | 1,62 / 20,00 |

Lectura de los datos: con estilos tipográficos, cfg=2.0 supera a Eruku tanto en precisión como en fidelidad de trazo. Con caligrafía humana real, la precisión de InkSpire queda por detrás de Eruku (0,071 frente a 0,014), porque el modelo ha aprendido solo de fuentes y copia formas de glifo fuera de distribución. El CFG es un compromiso explícito entre precisión y estilo.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,3 GB; el peso real está en el modelo base FLUX.3-Image-Klein-Base, que debe descargarse por separado tras aceptar su licencia.
- VRAM estimada: no disponible en la información proporcionada. Depende enteramente del modelo base y de la precisión de carga (no se publican cifras para este adaptador).
- GPU recomendadas: no disponible. El código de inferencia usa device="cuda" y no especifica modelos de GPU concretos.
- Viabilidad en GPU de consumo: no confirmada en la documentación; no se indica que quepa en tarjetas RTX de gama consumer.
- Despliegue: la inferencia se realiza con el script propio del repositorio de GitHub (clase InkSpireGen) sobre diffusers; requiere colocar NanumGothic-Regular.ttf en assets/fonts/label/ y klein_empty_prompt.pt en model_zoo/ para evitar cargar el codificador de texto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Enfoque | CER en caligrafía real (n=20) | Licencia |
|---|---|---|---|---|---|
| InkSpire Korean (este) | LoRA sobre difusión (FLUX.3-Image-Klein-Base) | 71,2 M (adaptador) | Difusión image-to-image con tabla de glifos | 0,071 (cfg 2.0) | FLUX Kommunity (no comercial) |
| Eruku Korean | Autoregresivo | no disponible | Generación secuencial de trazos | 0,014 | no disponible en la información |
| InkSpire original (Wang et al., ICLR 2026) | Difusión | no disponible | Método base, no específico de coreano | no disponible | no disponible |

La comparación directa disponible es con Eruku Korean, del mismo autor y entrenado con los mismos datos: InkSpire gana en estilos tipográficos y robustez con referencias ruidosas, y pierde en caligrafía humana real. El InkSpire original es la referencia metodológica, sin datos comparativos publicados en esta ficha.

## Limitaciones y advertencias

- La transcripción de la referencia es obligatoria: si se deja vacía, la generación se degrada hasta un CER de 0,72 y aproximadamente la mitad de las salidas quedan en blanco.
- Entrenado solo con renders de fuentes públicas: generaliza peor a caligrafía humana real, donde copia formas de glifo fuera de distribución en lugar de adaptar el trazo.
- La fidelidad de tinta depende de la referencia: una referencia a lápiz poco contrastado produce salidas tenues.
- Los errores de carácter varían según la semilla; no hay garantía de corrección sin reintentos.
- Licencia FLUX Kommunity: uso no comercial, con las restricciones adicionales del modelo base; revisar LICENSE.md y NOTICE.md antes de cualquier despliegue.
- Solo coreano; no se documenta soporte multilingüe.
- No se publican requisitos de VRAM, latencia ni compatibilidad con GPU de consumo, lo que dificulta planificar producción.
- El conjunto de evaluación con caligrafía real es pequeño (n=20 y n=286), por lo que las cifras tienen intervalos de confianza amplios.
- Riesgo de alucinación de glifos: al ser un modelo generativo de imagen, puede producir caracteres inexistentes o deformados, especialmente con referencias atípicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HERIUN/inkspire_korean
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Código de entrenamiento y experimentos: https://github.com/HERIUN/Inkspire_korean_finetuning
- Demo (Eruku y selección de modelo): https://huggingface.co/spaces/HERIUN/eruku_korean_demo
- Modelo autoregresivo comparable: https://huggingface.co/HERIUN/eruku_korean
- Paper InkSpire (ICLR 2026): https://openreview.net/forum?id=FBPuLChGNX
- Fuente NanumGothic (SIL OFL 1.1): https://hangeul.naver.com/font
