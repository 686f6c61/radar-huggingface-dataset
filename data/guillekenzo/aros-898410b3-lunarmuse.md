# guillekenzo/aros-898410b3-LunarMuse

## Resumen

`guillekenzo/aros-898410b3-LunarMuse` es un adaptador LoRA de personalización para Krea 2, el modelo de difusión texto-a-imagen de Krea. Lo publica el usuario guillekenzo bajo licencia Apache 2.0 y se entrena sobre el checkpoint `krea/Krea-2-Raw`, aunque las muestras publicadas se han generado sobre la variante destilada `krea/Krea-2-Turbo` con solo 8 pasos de inferencia y `guidance_scale=0.0`.

El adaptador implementa un DreamBooth-LoRA: aprende un concepto único (aparentemente una persona, descrita como «woman») asociado a un token de activación poco frecuente, `kqvgb woman`. El objetivo es que el modelo base reproduzca ese sujeto de forma consistente en escenas, encuadres e iluminaciones distintas sin reentrenar el checkpoint completo.

La relevancia del artefacto es la propia de un LoRA de personaje: permite reutilizar un modelo de difusión grande con un incremento de almacenamiento pequeño y un flujo de carga de una línea en diffusers. Ahora bien, la información pública es mínima: el repositorio ocupa 1,0 GB, no hay descargas ni valoraciones, y la model card no documenta hiperparámetros de entrenamiento, composición del dataset, tamaño del adaptador ni resultados cuantitativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth) sobre el modelo de difusión texto-a-imagen Krea 2; la arquitectura interna del modelo base no está disponible en la información proporcionada |
| Parámetros totales | no disponible (el repositorio ocupa 1,0 GB, pero no se desglosa cuánto corresponde al adaptador) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); la ventana del codificador de texto del modelo base no está documentada |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; todos los prompts de ejemplo de la model card están en inglés |
| Licencia | Apache 2.0 (según la model card); la licencia del modelo base Krea 2 no se especifica en la información disponible |
| Formato de pesos | no disponible explícitamente; repositorio en formato diffusers, se carga con `pipe.load_lora_weights(...)` |
| Modelo base | `krea/Krea-2-Raw` (entrenamiento); `krea/Krea-2-Turbo` (inferencia de las muestras) |
| Token de activación | `kqvgb woman` |
| Prompt de instancia | `kqvgb woman` |
| Resolución de entrenamiento | no disponible |
| Tamaño del repositorio | 1,0 GB |
| Pipeline declarado | text-to-image |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en capas del transformer de difusión de Krea 2, que permanece congelado. La model card lo describe explícitamente como un DreamBooth-LoRA entrenado sobre Krea 2 RAW: la técnica combina la regularización de DreamBooth (aprendizaje de un sujeto concreto a partir de pocas imágenes y un token identificador) con la eficiencia paramétrica de LoRA. El token `kqvgb woman` actúa como ancla semántica del concepto, con un identificador léxicamente raro para reducir colisiones con vocabulario preexistente.

No se documentan el rango (`r`), el `alpha`, el dropout, la tasa de aprendizaje, el número de pasos, el optimizador, el número de imágenes de entrenamiento ni la resolución. Tampoco se indica si hubo regularización con imágenes de clase ni qué proporción del dataset corresponde a cada encuadre. El flujo de uso publicado sugiere que el adaptador se aplica sobre la variante destilada Krea 2 Turbo, que genera en 8 pasos con escala de guía cero (característica típica de modelos por destilación por consistencia o adversarial); el comportamiento del LoRA sobre el checkpoint Raw no está descrito.

Un detalle a tener en cuenta en producción: el identificador `aros-898410b3` y el sufijo `LunarMuse` apuntan a un pipeline de generación automatizada de adaptadores, no a un entrenamiento artesanal documentado. Eso no invalida el resultado, pero reduce la trazabilidad sobre los datos y los hiperparámetros empleados.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por el token `kqvgb woman`, con el sujeto del concepto integrado en escenas nuevas (interior, exterior, fondo neutro, según las muestras).
- Personalización de un único concepto: no se documenta soporte multi-concepto ni composición de varios LoRA.
- Inyección ligera sobre el modelo base: el adaptador se carga en memoria junto al checkpoint sin duplicar los pesos del modelo completo.
- Compatibilidad con el ecosistema diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- Inferencia rápida sobre Krea 2 Turbo: 8 pasos y `guidance_scale=0.0` en los ejemplos publicados, lo que reduce el coste por imagen frente a un muestreo completo.
- Control de composición mediante prompt textual; no se documentan ControlNet, inpainting, img2img ni edición instruccional.
- Capacidades multilingües: no disponible. Los ejemplos están en inglés y no hay evidencia de comportamiento con prompts en castellano.
- No dispone de tool calling, razonamiento multi-paso, modo thinking, audio ni vídeo: es un adaptador de imagen fija.

## Casos de uso

- **Continuidad de personaje en narrativa visual**: usar `kqvgb woman` como ancla para generar viñetas de un cómic o storyboard donde el mismo personaje aparece en encuadres y localizaciones distintas, manteniendo rasgos consistentes gracias al LoRA y variando solo la parte descriptiva del prompt.
- **Prototipado de campañas de moda o producto con modelo fija**: generar variaciones de una misma figura en distintos escenarios (interior de madera, exterior sobre hierba, fondo neutro) para presentar moodboards antes de contratar una sesión fotográfica real.
- **Iteración rápida de creatividades publicitarias**: al funcionar sobre Krea 2 Turbo con 8 pasos, permite producir decenas de variantes por prompt en pocos minutos y hacer pruebas A/B de encuadre, iluminación y fondo manteniendo el sujeto.
- **Generación de assets para videojuegos indie o aplicaciones**: crear retratos y bustos de un personaje secundario con estilo fotográfico coherente para fichas de personaje, tutoriales o pantallas de carga, sin encargar ilustración externa.
- **Aumento de datos sintéticos**: producir un conjunto de imágenes etiquetadas de un mismo sujeto para alimentar un clasificador, un detector o un pipeline de segmentación, siempre que el dominio objetivo admita imágenes generadas.
- **Pruebas de concepto de personalización**: servir como referencia técnica para evaluar si un flujo DreamBooth-LoRA sobre Krea 2 cubre las necesidades de un producto antes de invertir en un entrenamiento propio con datos controlados.
- **Demostraciones y material docente**: ilustrar en un taller cómo se carga y se invoca un LoRA en diffusers con un caso reproducible de tres prompts y tres salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente incluye tres imágenes de muestra cualitativas generadas con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`. No hay FID, CLIP score, similitud facial, DINO, ni evaluaciones de retención de prompt, y tampoco se comparan las salidas con el modelo base sin el adaptador.

## Requisitos de hardware

- **VRAM para inferencia**: viene determinada por el checkpoint base Krea 2, no por el LoRA. La información disponible no incluye el número de parámetros ni la resolución nativa de Krea 2, por lo que no se puede estimar una cifra fiable de VRAM.
- **Coste del adaptador**: el repositorio pesa 1,0 GB; conviene verificar si ese tamaño incluye estados de optimizador o imágenes de muestra, porque un LoRA típico de difusión ocupa decenas o centenares de MB.
- **GPU recomendadas**: no disponible para el modelo base. Como referencia de categoría, un modelo de difusión de escala comparable a SDXL funciona con 8-12 GB en fp16 y con 16-24 GB para lotes y resoluciones altas; para Krea 2 habría que confirmar los requisitos reales con la documentación oficial de Krea.
- **¿Cabe en GPU de consumo?**: no confirmado. Depende enteramente del tamaño del checkpoint base y de si admite cuantización; no hay datos publicados sobre versiones GGUF, NF4 o fp8 de Krea 2 en esta información.
- **Despliegue**: diffusers es la vía documentada (`Krea2Pipeline.from_pretrained(...).to("cuda")` más `load_lora_weights`). vLLM y TGI no aplican a modelos de difusión. La compatibilidad con ComfyUI, A1111 o InvokeAI no está documentada.
- **Latencia y throughput**: no disponible. El único dato indirecto es que las muestras se generaron con 8 pasos de muestreo, lo que sitúa la inferencia en el régimen rápido de un modelo destilado, pero sin cifras de segundos por imagen ni de imágenes por segundo.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para Krea 2 (mismo concepto, mismo pipeline o misma comunidad). La comparación posible se limita a los componentes declarados en la propia ficha:

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `guillekenzo/aros-898410b3-LunarMuse` | LoRA DreamBooth sobre Krea 2 | no disponible (repo de 1,0 GB) | no aplica | sin benchmarks; 3 muestras cualitativas | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `krea/Krea-2-Raw` | Checkpoint completo, texto-a-imagen | no disponible | no aplica | no disponible | no disponible en esta información | Hugging Face |
| `krea/Krea-2-Turbo` | Checkpoint completo destilado, texto-a-imagen | no disponible | no aplica | 8 pasos, `guidance_scale=0.0` en las muestras | no disponible en esta información | Hugging Face |
| LoRA DreamBooth de personaje sobre SDXL (categoría) | LoRA sobre otro modelo base | típicamente decenas de MB | no aplica | no comparable sin evaluación común | variable según autor | amplia en Hugging Face |

La comparación cuantitativa con alternativas de la misma categoría (por ejemplo, LoRA de personaje sobre SDXL o Flux) no es posible con los datos disponibles: faltan métricas y faltan datos de los checkpoints base.

## Limitaciones y advertencias

- **Identidad y consentimiento**: el concepto entrenado parece ser una persona concreta descrita como «woman». No se documenta el origen de las imágenes, si existe consentimiento de la persona retratada ni cómo se protege frente a usos de suplantación de identidad. Es un riesgo legal relevante bajo RGPD y derecho de imagen en la UE.
- **Calidad no validada por terceros**: 0 descargas y 0 likes en el momento de la consulta. No hay evaluaciones independientes ni comparaciones con el modelo base sin el adaptador.
- **Sensibilidad al token**: el efecto del LoRA depende de escribir exactamente `kqvgb woman`. Omitirlo degrada la personalización; usarlo fuera de contexto puede arrastrar el concepto a prompts no deseados.
- **Alucinación visual**: como cualquier modelo de difusión, puede producir artefactos anatómicos (manos, dedos, simetría facial), texto ilegible en carteles y perspectivas incoherentes, especialmente en escenas con varios sujetos o composiciones complejas.
- **Idioma**: no hay evidencia de rendimiento con prompts en castellano; el codificador de texto del modelo base puede estar sesgado hacia el inglés, y la model card solo documenta ejemplos en inglés.
- **Licencia**: el adaptador se declara Apache 2.0, pero eso no sustituye la licencia del checkpoint base Krea 2, que no aparece en la información proporcionada. Antes de un uso comercial hay que verificar los términos de Krea 2 y de las imágenes de entrenamiento.
- **Repositorio sobredimensionado**: 1,0 GB es un tamaño atípico para un LoRA. Conviene inspeccionar el contenido antes de descargarlo en un entorno de producción.
- **Cobertura de la búsqueda web**: los resultados de búsqueda disponibles no contenían información técnica ni páginas relacionadas con este modelo, por lo que no aportan datos verificables.
- **Trazabilidad**: el identificador sugiere un pipeline automatizado; no hay información sobre hiperparámetros, dataset ni proceso de validación, lo que dificulta reproducir el entrenamiento o auditar sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guillekenzo/aros-898410b3-LunarMuse
- Modelo base de entrenamiento: https://huggingface.co/krea/Krea-2-Raw
- Variante destilada usada en las muestras: https://huggingface.co/krea/Krea-2-Turbo

No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
