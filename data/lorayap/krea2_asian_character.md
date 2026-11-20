# lorayap/Krea2_Asian_Character

## Resumen

Krea2 Asian Character es una colección de cinco LoRA (Low-Rank Adaptation) de personaje entrenadas para el modelo de difusión texto-a-imagen Krea-2, en sus variantes Raw y Turbo. La publica el usuario lorayap en Hugging Face bajo licencia MIT y en formato estándar de LoRA (`.safetensors`), lo que permite cargarlas en ComfyUI, Stable Diffusion WebUI, Forge, Fooocus o Draw Things sin conversión previa. Cada archivo está asociado a un personaje femenino de estética japonesa/asiática y se activa mediante una palabra disparadora específica.

El interés práctico de esta ficha no está en un modelo fundacional nuevo, sino en un adaptador ligero (el repositorio completo ocupa 1,4 GB, es decir, unos 280 MB por LoRA en FP16) que reproduce personajes concretos sobre una base Krea-2. Es relevante para quien ya trabaje con Krea-2 y necesite consistencia de personaje en flujos de generación de imágenes, algo habitual en ilustración, cómics o previsualización de personajes.

La información disponible es limitada: la model card no documenta el dataset de entrenamiento, el número de pasos, la resolución nativa ni métricas de calidad. Esta ficha refleja exclusivamente lo que el autor declara y marca como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión Krea-2 |
| Parametros totales | no disponible (adaptador LoRA; el repositorio pesa 1,4 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.safetensors`; cuantización a cargo del runtime del usuario) |
| Idiomas soportados | no disponible (los prompts se procesan con el codificador de texto de Krea-2) |
| Licencia | MIT |
| Formato de pesos | safetensors (un archivo por personaje) |

## Arquitectura y entrenamiento

Se trata de adaptadores LoRA, no de un modelo completo. La técnica LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, de modo que el ajuste ocupa una fracción mínima del tamaño del modelo original y puede combinarse o retirarse en tiempo de inferencia. El modelo base es Krea-2, en sus variantes Raw y Turbo, un generador texto-a-imagen de la familia Krea; la model card indica compatibilidad con ambas variantes sin detallar diferencias de comportamiento entre ellas.

No se especifica en la información disponible el número de pasos de entrenamiento, el tamaño o la composición del dataset, la resolución de entrenamiento, el rango (rank) de las matrices LoRA ni si se aplicaron técnicas de regularización o captions automáticos. Tampoco se documenta si hubo ajuste fino adicional tras el entrenamiento del adaptador. El peso recomendado de aplicación es de 0,8 a 1,0, dato que el autor incluye como guía de uso.

## Capacidades

- Generación de imágenes de personaje consistentes: cada LoRA reproduce un personaje concreto al invocar su palabra disparadora.
- Cinco personajes incluidos: Kitano Haruka (`harukakitano`), Nagi Hikaru (`nagihikaru`), Shion Utsunomiya (`ShionUtsunomiya`), Julia Kyoka (`julia_kyoka`) y Kotone Amamiya (`kotoneamamiya`).
- Compatibilidad con múltiples interfaces: ComfyUI, Draw Things, Stable Diffusion WebUI, Forge y Fooocus, según declara el autor.
- Flujos arrastrables: cada LoRA incluye una imagen de muestra con el mismo nombre de archivo que puede arrastrarse a ComfyUI para cargar el flujo y los parámetros usados.
- Control de intensidad: el peso del adaptador ajustable entre 0,8 y 1,0 permite modular cuánto influye el personaje sobre la generación base.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; son ajenas a la naturaleza del modelo.

## Casos de uso

- Ilustración de personajes recurrentes: usar el LoRA del personaje con peso 0,8-1,0 para mantener rasgos faciales y de diseño coherentes entre distintas escenas de un mismo proyecto editorial o de cómic.
- Previsualización de personajes en preproducción: generar variantes de vestuario, iluminación o encuadre sobre un personaje fijo sin reentrenar, apoyándose en la base Krea-2 para el estilo general.
- Creación de hojas de personaje: combinar el disparador del personaje con prompts de vista frontal, perfil y expresión para producir referencias consistentes para equipos de arte.
- Prototipado rápido en ComfyUI: arrastrar la imagen de muestra incluida para recuperar el flujo y los parámetros y adaptarlos a una escena nueva, reduciendo el tiempo de configuración inicial.
- Exploración estilística sobre Krea-2 Turbo: al ser compatible con la variante Turbo, permite iterar con menos pasos de muestreo en fases de ideación, y cambiar a Raw para refinamiento final.
- Investigación sobre adaptadores de bajo rango: sirve como caso de estudio de LoRA de personaje sobre un modelo base reciente, comparando el efecto del peso del adaptador y de la palabra disparadora en la fidelidad del resultado.
- Integración en pipelines de generación por lotes: al ser archivos `.safetensors` estándar, pueden cargarse mediante la librería `diffusers` en scripts que generen conjuntos de imágenes con un personaje fijo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende enteramente del modelo base Krea-2 y de la precisión de carga (FP16, FP8, etc.), no del LoRA, que añade una sobrecarga mínima.
- GPU recomendadas: no disponible; el autor no especifica requisitos de hardware.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; al ser un adaptador sobre Krea-2, la viabilidad en GPU de consumo vendrá determinada por el modelo base.
- Opciones de despliegue: ComfyUI, Draw Things, Stable Diffusion WebUI, Forge y Fooocus (declarados por el autor); también `diffusers` por la etiqueta de la librería.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Personajes | Licencia | Formato |
|---|---|---|---|---|---|
| Krea2 Asian Character (lorayap) | LoRA de personaje | Krea-2 Raw / Turbo | 5 | MIT | safetensors |
| Alternativas de LoRA de personaje sobre Krea-2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| LoRA de personaje sobre otros modelos de difusión (p. ej. familia SD) | LoRA de personaje | distinto modelo base | variable | variable | safetensors |

No se dispone de información sobre adaptadores comparables entrenados específicamente sobre Krea-2, por lo que la comparación cuantitativa con alternativas directas no está disponible.

## Limitaciones y advertencias

- La model card restringe el uso a fines de aprendizaje e investigación y excluye el intercambio comercial, pese a que la licencia declarada sea MIT; existe una contradicción entre la licencia y el texto de la model card que conviene resolver antes de un uso comercial.
- El autor exige cumplir la licencia y la política de uso aceptable del modelo base Krea-2, cuyos términos pueden imponer restricciones adicionales.
- Prohibición expresa de generar contenido ilegal, dañino, engañoso, no consentido o que vulnere derechos de imagen o privacidad de terceros.
- Riesgo de reproducción de rasgos de personas: al tratarse de LoRA de personaje, su uso para generar imágenes de individuos reales sin consentimiento puede infringir derechos de imagen.
- No se documenta el dataset de entrenamiento, por lo que no puede evaluarse el sesgo demográfico ni la representatividad de los personajes.
- No hay información sobre fidelidad del personaje fuera del peso recomendado (0,8-1,0) ni sobre degradación con pesos superiores.
- No se especifican requisitos de hardware ni rendimiento, lo que dificulta planificar despliegues en producción.
- Posible riesgo de alucinación visual (anatomía incorrecta, artefactos) inherente a los modelos de difusión; no cuantificado por el autor.
- No se declaran idiomas soportados para los prompts; el comportamiento multilingüe dependerá del codificador de texto de Krea-2.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lorayap/Krea2_Asian_Character
- Modelo base Krea-2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Krea-2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
