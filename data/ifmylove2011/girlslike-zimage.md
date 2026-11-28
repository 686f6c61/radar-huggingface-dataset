# ifmylove2011/girlslike-zimage

## Resumen

girlslike-zimage es un adaptador LoRA (en concreto, un LoKR de rango completo según el autor) para generación de imágenes texto-a-imagen, entrenado sobre el modelo base Tongyi-MAI/Z-Image y su variante acelerada Z-Image-Turbo. Lo publica el usuario ifmylove2011 en Hugging Face y su propósito declarado es la experimentación con la reproducción de rostros y figuras femeninas concretas mediante palabras de activación (trigger words) asociadas a nombres o abreviaturas. No es un modelo fundacional autónomo: requiere cargar el modelo base Z-Image para funcionar.

El adaptador se distribuye en dos variantes según el modelo de entrenamiento: los sufijos "zi" corresponden a entrenamiento sobre Z-Image base y los "zit" a entrenamiento sobre Z-Image Turbo. Según el autor, los pesos "zi" son compatibles tanto con base como con turbo, mientras que los "zit" solo funcionan con turbo. El repositorio ocupa 8,3 GB y acumula más de 31.000 descargas, lo que lo sitúa entre los adaptadores populares de esta familia.

Su relevancia es doble: por un lado, documenta una receta poco habitual para entrenar sobre Z-Image base (LoKR de rango completo), un terreno donde el autor afirma que aún no existe un método estándar consolidado; por otro, ilustra los riesgos de los adaptadores de identidad entrenados sobre modelos que ya contienen representaciones de personas reales en sus datos, con implicaciones éticas y legales que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/LoKR sobre el modelo de difusión Z-Image (texto-a-imagen) |
| Parámetros totales | no disponible (el adaptador se distribuye como pesos LoKR de rango completo; el modelo base no se incluye) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; no se especifica la longitud de prompt máxima) |
| Tipos de cuantizacion | no disponible formalmente; los ejemplos del autor usan BF16 sobre Z-Image Turbo |
| Idiomas soportados | no disponible (los ejemplos usan prompts en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / formato diffusers (librería `diffusers`); tamaño del repo 8,3 GB |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Z-Image, un modelo de difusión texto-a-imagen de Tongyi-MAI (Alibaba), en sus variantes base y Turbo. La técnica elegida para la variante "zi" es un LoKR de rango completo, una descomposición de bajo rango tipo Kronecker que el autor justifica porque no existe todavía un método estándar consolidado para afinar Z-Image base. Para la variante "zit" se emplea un LoRA convencional entrenado sobre Z-Image Turbo.

No se publican en la model card datos sobre el dataset de entrenamiento (número de imágenes, resolución, composición), el número de pasos, la tasa de aprendizaje ni si se aplicaron técnicas de regularización. El autor menciona que muchos de los sujetos ya están presentes en los datos de entrenamiento de Z-Image y que el adaptador añade palabras de activación (el propio nombre o una abreviatura con prefijo `girlslikezi for ...`) para reforzar o desambiguar la identidad. También advierte que los problemas anatómicos del modelo base se trasladan al entrenamiento y afectan a la estabilidad de la generación de extremidades.

## Capacidades

- Generación de imágenes texto-a-imagen de figuras femeninas con identidad reforzada mediante palabras de activación.
- Compatibilidad cruzada: los pesos "zi" funcionan con Z-Image base y con Z-Image Turbo; los "zit" solo con Turbo.
- Control de intensidad del adaptador: el autor recomienda pesos entre 0,5 y 1,5, con 1,0 como valor de referencia sobre Turbo.
- Generación rápida en Turbo: resultados utilizables desde 4 pasos y sin ganancia apreciable por encima de 10.
- Ajuste de sampler y scheduler: combinaciones `er_sde + sgm_uniform` o `euler + flowmatch`, con CFG en torno a 1.
- Uso de doble sampler con scheduler DDIM en la primera etapa para aumentar la diversidad.
- Ajuste del parámetro shift mediante el nodo ModelSamplingAuraFlow (rango 3-10; shift=3 equivale al comportamiento original).
- No soporta tool calling, agentes, razonamiento multi-step ni modalidades de audio o vídeo: es exclusivamente un adaptador de imagen.

## Casos de uso

- Pruebas de concepto de identidad consistente en pipelines de generación: cargar el LoKR sobre Z-Image Turbo con peso 1,0 y un prompt en chino permite obtener retratos de un sujeto concreto en 8 pasos, útil para evaluar la fidelidad del adaptador antes de integrarlo en un flujo mayor.
- Investigación sobre métodos de ajuste en modelos de difusión: la receta LoKR de rango completo sobre Z-Image base sirve como referencia reproducible para estudiar qué configuraciones funcionan cuando no hay un esquema estándar publicado.
- Comparación de compatibilidad base vs. turbo: los pares "zi"/"zit" permiten medir empíricamente cómo cambia la textura y la similitud facial al mezclar adaptadores entrenados en distintos checkpoints, un experimento útil para quien diseñe su propia estrategia de entrenamiento.
- Generación de retratos de referencia para proyectos creativos con consentimiento: en estudios de ilustración o cómic, el adaptador puede producir variaciones de un personaje con parámetros controlados (peso 0,5-1,5, resolución 1080x1440) y luego retocarse manualmente.
- Evaluación de sesgos y riesgos en modelos generativos: al exponer cómo Z-Image ya reproduce personas reales a partir de sus nombres, el adaptador es un caso de estudio para auditorías de privacidad y para diseñar filtros de seguridad.
- Docencia y divulgación sobre LoRA: los ejemplos incluyen flujos de trabajo embebidos en las imágenes, lo que facilita reproducir la configuración exacta (sampler, pasos, CFG, resolución) en talleres prácticos.
- Prototipado rápido en ComfyUI: al integrarse como nodo LoRA estándar, permite iterar sobre prompts y pesos sin reentrenar, adecuado para equipos que exploran estilos fotográficos antes de invertir en un ajuste propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 8,3 GB en el repositorio, pero el coste real de inferencia lo determina el modelo base Z-Image, que debe cargarse aparte en BF16 según los ejemplos del autor.
- VRAM estimada: no disponible de forma oficial; el autor solo documenta ejecuciones en Z-Image Turbo BF16, sin indicar la GPU utilizada.
- GPU recomendadas: no disponible. Por el tamaño del modelo base y el uso de BF16, se requiere una GPU con memoria suficiente para cargar los pesos completos; no se confirma que quepa en GPU de consumo.
- Despliegue: la librería indicada es `diffusers`; los ejemplos del autor mencionan nodos de ComfyUI (ModelSamplingAuraFlow) y samplers propios de ese ecosistema, por lo que ComfyUI es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: no disponibles. El único dato de rendimiento es que con Turbo bastan 4 pasos y que más de 10 no aporta ganancia apreciable.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| girlslike-zimage | LoRA/LoKR de identidad | Z-Image / Z-Image-Turbo | prompts de texto (longitud no especificada) | Apache 2.0 | Hugging Face, diffusers |
| Z-Image (Tongyi-MAI) | Modelo de difusión texto-a-imagen | — | prompts de texto | no disponible en la información | Hugging Face |
| Z-Image-Turbo (Tongyi-MAI) | Variante acelerada del anterior | Z-Image | prompts de texto | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros adaptadores comparables en la información proporcionada, por lo que la comparación se limita a la relación entre el adaptador y sus modelos base.

## Limitaciones y advertencias

- El adaptador reproduce identidades de personas reales a partir de sus nombres o abreviaturas. El propio autor prohíbe explícitamente su uso para suplantación, engaño u otros fines inapropiados; su uso comercial o público sin consentimiento de los retratados puede vulnerar derechos de imagen y normativa de protección de datos.
- El autor reconoce que la compatibilidad es incierta: persisten problemas anatómicos (extremidades) heredados del modelo base y agravados por el entrenamiento.
- Los pesos "zit" solo funcionan con Z-Image Turbo; los "zi" funcionan con ambos pero con calidad variable según el checkpoint.
- No hay información sobre el dataset de entrenamiento, lo que impide auditar sesgos demográficos o posibles infracciones de derechos de autor en las imágenes de origen.
- Riesgo de alucinación visual y de deriva de identidad al usar pesos altos (por encima de 1,5) o al combinar con otros LoRA; el autor indica que los ejemplos se generaron sin otros adaptadores.
- La documentación está en chino y los prompts de ejemplo también; el comportamiento con prompts en castellano no está documentado.
- Licencia Apache 2.0 en el repositorio, pero esa licencia no cubre los derechos de imagen de las personas representadas ni sustituye las condiciones de uso del modelo base Z-Image.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ifmylove2011/girlslike-zimage
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Galería de abreviaturas y nombres (Space del autor): https://huggingface.co/spaces/ifmylove2011/girlslike_lora_gallery
- Fuente de prompts citada por el autor (Civitai): https://civitai.com/models/2231696
