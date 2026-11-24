# Noel2211/GainWeave

## Resumen

GainWeave es un adaptador ligero para la recuperación de imágenes HDR (alto rango dinámico) a partir de una imagen SDR (rango dinámico estándar). Lo desarrolla el usuario Noel2211 y se apoya en el VAE congelado de Lumina-Image 2.0 (Alpha-VLLM), un modelo de difusión texto-a-imagen. La propuesta es poco convencional: en lugar de entrenar un modelo generativo grande, entrena únicamente 45.557 parámetros aprendidos que operan sobre las activaciones del decodificador VAE congelado para estimar una ganancia residual acotada sobre la luminancia.

El modelo se compone de dos módulos: un *bridge* de 42.788 parámetros que predice un ancla HDR (H0) a partir de cinco activaciones del decodificador, y una cabeza de altas luces (*highlight head*) de 2.769 parámetros que aplica una corrección residual acotada a ±0.5 EV en función de la luminancia. El resultado es una imagen HDR lineal relativa que conserva las ratios de canal nativas. También permite generación texto-a-HDR encadenando el generador oficial de Lumina-Image 2.0 con el mismo módulo de recuperación.

Su relevancia es acotada pero específica: demuestra que es posible obtener HDR relativo con un coste de parámetros ínfimo reutilizando features de un VAE congelado, lo que abre la puerta a integrarlo en pipelines existentes de Lumina sin reentrenar el modelo base. El repositorio tiene 2 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB (solo pesos del adaptador).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de recuperación HDR sobre VAE congelado de Lumina-Image 2.0 (bridge + highlight head) |
| Parametros totales | 45.557 (42.788 bridge + 2.769 highlight head) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible (se ejecuta en FP32 según la model card) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (parámetros y código propios); componentes upstream (Lumina, Gemma, VAE derivado de FLUX) mantienen sus términos |
| Formato de pesos | safetensors (`bridge.safetensors`, `highlight.safetensors`, `config.json`) |

## Arquitectura y entrenamiento

GainWeave no es un transformer generativo, sino un módulo de recuperación que consume las activaciones de cinco bloques del decodificador VAE congelado de Lumina-Image 2.0. El *bridge* transforma esas activaciones en un ancla HDR H0. La cabeza de altas luces lee una feature normalizada de 16 canales del bridge junto con el RGB lineal de entrada S y aplica una corrección multiplicativa acotada: calcula la luminancia Y = 0.2126·S_R + 0.7152·S_G + 0.0722·S_B, normaliza u = clamp((Y − 0.5)/0.4, 0, 1), aplica una curva smoothstep w = u²(3 − 2u), y produce delta = 0.5·w·tanh(z), de modo que H = H0 × 2^delta. Los píxeles con Y ≤ 0.5 copian el ancla exactamente, y la ganancia residual compartida entre canales preserva las ratios RGB nativas.

El entrenamiento se realizó sobre el conjunto Laval Indoor HDR en su rol de entrenamiento estándar. El bridge se entrenó hasta la actualización 8.192; la cabeza de altas luces se entrenó después con el bridge y el VAE congelados, semilla 0, 2.048 actualizaciones, batch efectivo 8, entradas alternas con recorte duro y compresión suave, y un presupuesto de ±0.5·w EV. La recuperación usa FP32 tanto para el VAE como para ambos módulos aprendidos. La model card incluye controles de ablación (variantes "One" con 45.686 parámetros y "RGB-only" con 45.621 parámetros) para el paper, cada uno con su propio bridge y cabeza entrenados. Los datos de entrenamiento y los checkpoints con estado de optimizador/RNG no se publican en el repositorio del modelo.

## Capacidades

- Recuperación de HDR lineal relativo a partir de una imagen SDR de entrada, con salida en EXR float32.
- Generación texto-a-HDR encadenando el generador oficial de Lumina-Image 2.0 con el módulo de recuperación.
- Preservación de las ratios de canal RGB nativas mediante una ganancia residual compartida entre canales.
- Control de exposición en la presentación: la vista previa por defecto aplica +1 EV una sola vez seguida de Reinhard por canal y sRGB exacto; también se genera `presentation_plus1ev.exr` con el doble de los valores nativos.
- Variantes de control: `anchor` (expone H0 sin corrección) y `fixed` (mejora suave sin entrenamiento H0 × 2^(0.25w)).
- Soporte de ejecución offline con `local_files_only=True` y rutas locales para modelo y VAE.
- Idiomas de la model card: inglés y chino (el modelo en sí procesa imágenes, no texto; el texto solo interviene en la ruta texto-a-HDR vía Lumina).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un módulo de procesado de imagen.

## Casos de uso

- **Conversión de fotografía SDR a HDR en postproducción**: el modelo recupera un HDR lineal relativo desde un JPEG o PNG SDR de 1024×1024, útil como paso previo a un etalonaje que necesite información de altas luces. La salida EXR float32 es directamente importable en Nuke, DaVinci Resolve o Blender.
- **Previsualización HDR en visores y tiendas de contenido**: el pipeline `presentation_plus1ev.exr` con Reinhard y sRGB exacto permite generar miniaturas HDR listas para pantallas con soporte HDR10 sin trabajo manual de curvas.
- **Aumento de datos para entrenamiento de modelos de visión**: al disponer de un mapeo determinista SDR→HDR relativo, se pueden generar pares sintéticos para tareas de tone mapping, estimación de iluminación o *inverse rendering* sobre el conjunto Laval Indoor.
- **Investigación en *inverse tone mapping* de bajo coste**: con 45.557 parámetros y un VAE congelado, sirve como *baseline* reproducible para comparar frente a métodos basados en redes grandes; los controles publicados (One, RGB-only) permiten aislar la contribución de las features del decodificador.
- **Integración en pipelines de generación texto-a-imagen con salida HDR**: encadenando Lumina-Image 2.0 con GainWeave se obtienen imágenes generadas por prompt con un HDR relativo asociado, útil para *concept art* o *matte painting* que luego se compone en escenas HDR.
- **Prototipado rápido en investigación académica**: la instalación vía `pip` del repo de código, el entorno de referencia Python 3.12 / PyTorch 2.8.0 y la API `GainWeave.from_pretrained` permiten reproducir las tablas del paper con un solo comando (`gainweave recover`).
- **Evaluación de robustez frente a recorte duro vs. compresión suave**: el modelo está entrenado con ambas distribuciones de entrada, lo que permite analizar su comportamiento en imágenes sobreexpuestas con clipping frente a imágenes ya comprimidas tonalmente.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de error sobre el conjunto de desarrollo fijo (218 fuentes, 867 vistas, cinco exposiciones), no benchmarks estándar tipo MMLU o HumanEval (no aplicables a un modelo de imagen).

| Metrica | GainWeave | Fixed (mejora suave) |
|---|---|---|
| MAE log1p imagen completa, recorte duro | 0.029331 | 0.033665 |
| MAE región brillante, recorte duro | 0.661675 | 0.654013 |
| MAE imagen completa, entrada comprimida suave | 0.104051 | 0.103860 |

La cabeza aprendida mejora el MAE global en recorte duro pero es ligeramente peor en región brillante y en entradas comprimidas suaves: el autor lo describe como un intercambio de recuperación de brillo por contención. Los ejemplos generados no tienen referencia HDR emparejada, y la valoración de +1 EV es una revisión del propio autor, no una puntuación humana independiente. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al ejecutarse en FP32 con un VAE de Lumina-Image 2.0 y módulos de 45.557 parámetros, el grueso del consumo proviene del VAE y, en la ruta texto-a-HDR, del generador completo de Lumina y del codificador de texto Gemma.
- GPU recomendadas: no especificadas por el autor; la model card solo indica `device="cuda"` en el ejemplo de uso. Para la ruta de recuperación pura basta una GPU con memoria suficiente para el VAE en FP32; para texto-a-HDR se requiere memoria para el generador Lumina completo.
- ¿Cabe en GPU de consumo? No confirmado. El adaptador en sí es trivial, pero el VAE y el generador upstream determinan el requisito real.
- Opciones de despliegue: el paquete `gainweave` (instalación desde el repo de GitHub, Python 3.12 / PyTorch 2.8.0) con CLI `gainweave recover` y API Python `GainWeave.from_pretrained`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de módulo).
- Latencia y throughput: no disponibles.
- Tamaño del repo: 0.0 GB, correspondiente solo a los pesos del adaptador; el VAE y el generador se descargan aparte desde `Alpha-VLLM/Lumina-Image-2.0` (commit `53504abd8178b30685b6c4c7a4cd181ff78b73e9`, subcarpeta `vae/`).

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para enfrentar GainWeave con alternativas de *inverse tone mapping* o recuperación HDR. La comparación se limita a los controles internos del propio paper:

| Modelo | Entrada al bridge | Parametros aprendidos | Notas |
|---|---|---|---|
| GainWeave (Five) | cinco activaciones del decodificador congelado | 45.557 | Variante principal |
| GainWeave One | último bloque de upsampling del decodificador | 45.686 | Control de ablación |
| GainWeave RGB-only | SDR lineal, sin VAE | 45.621 | Control sin features del VAE |
| Lumina-Image 2.0 (base) | n/a | n/a | Generador texto-a-imagen; no realiza recuperación HDR por sí mismo |

Frente a métodos externos de *inverse tone mapping* (por ejemplo, redes dedicadas o enfoques basados en difusión), no hay cifras en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El HDR producido es **relativo**: no hay unidades físicas ni nits de visualización resueltos. No sirve para mediciones fotométricas absolutas.
- Los ejemplos generados **no tienen referencia HDR emparejada**, por lo que la calidad percibida no está validada de forma independiente; la aceptación de +1 EV es una revisión del propio autor.
- La cabeza aprendida empeora ligeramente el MAE en región brillante y en entradas comprimidas suaves respecto a la mejora fija, lo que puede traducirse en menor recuperación de altas luces en escenas muy contrastadas.
- Resolución de referencia fija de 1024×1024; no se documenta comportamiento a otras resoluciones o relaciones de aspecto.
- Dependencia de componentes upstream con licencias distintas: Lumina, Gemma (términos de Google) y el VAE derivado de FLUX-dev conservan sus términos; la etiqueta Apache-2.0 de Lumina no relicencia esos componentes. Verificar antes de uso comercial.
- El alcance de liberación de pesos respecto a los datos de entrenamiento (Laval Indoor HDR) sigue siendo un asunto abierto en el registro interno de derechos del autor, según la model card.
- Solo se publican los pesos del adaptador; los datos de entrenamiento y los checkpoints con estado de optimizador/RNG no están en el repositorio, lo que limita la reproducibilidad completa del entrenamiento.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de artefactos: la corrección es determinista y acotada, aunque puede introducir halos o saturación no deseada en regiones con clipping severo.
- Comunidad y adopción mínimas (2 descargas, 0 likes): sin validación externa ni issues reportados.
- Idiomas declarados en/zh, pero el modelo no procesa texto salvo en la ruta texto-a-HDR vía Lumina; el sesgo lingüístico relevante recae en el codificador Gemma de Lumina, no en GainWeave.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noel2211/GainWeave
- Repositorio de código e instalación: https://github.com/913886605/GainWeave
- README en chino: https://github.com/913886605/GainWeave/blob/v0.2.0/README_zh-CN.md
- Resultados registrados: https://github.com/913886605/GainWeave/blob/v0.1.0/docs/results.md
- Guía de evaluación v0.2.0 (Tablas II–IV): https://github.com/913886605/GainWeave/blob/v0.2.0/paper/README.md
- Receta de entrenamiento: https://github.com/913886605/GainWeave/blob/v0.1.0/docs/training.md
- Notas de componentes de terceros: https://github.com/913886605/GainWeave/blob/v0.1.0/docs/third_party.md
- Manifiesto de controles: https://huggingface.co/Noel2211/GainWeave/blob/main/controls/manifest.json
- Modelo base Lumina-Image 2.0: https://huggingface.co/Alpha-VLLM/Lumina-Image-2.0
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Licencia de FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/3de623fc3c33e44ffbe2bad470d0f45bccf2eb21/LICENSE.md
