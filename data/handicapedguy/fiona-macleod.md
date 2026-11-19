# handicapedguy/fiona-macleod

## Resumen

Fiona MacLeod es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, entrenado sobre el modelo base Krea 2 RAW (`krea/Krea-2-Raw`) del desarrollador Krea. Lo publica el usuario `handicapedguy` bajo licencia Apache 2.0 y su propósito es fijar un concepto visual concreto: un personaje ficticio llamado Fiona MacLeod, descrito en el prompt de instancia con un conjunto muy específico de atributos físicos y de estilo fotográfico. No es un modelo de lenguaje ni un modelo fundacional, sino un peso adicional de bajo rango que se carga sobre el pipeline de difusión de Krea 2.

El repositorio ocupa 1,0 GB y se distribuye en formato compatible con la librería `diffusers`, con la etiqueta de plantilla `sd-lora`. La model card indica que se entrenó sobre Krea 2 RAW pero que las muestras publicadas se generaron sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`. El modelo se creó y actualizó el 18 de noviembre de 2026, cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que se trata de una publicación reciente y sin validación comunitaria.

Su relevancia es limitada fuera del ámbito de la personalización de personajes: sirve como ejemplo de flujo de trabajo DreamBooth-LoRA sobre la familia Krea 2 y como herramienta para quien necesite reproducir de forma consistente un personaje concreto en escenas variadas. No aporta capacidades nuevas de razonamiento, código o matemáticas, y no debe confundirse con un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto-a-imagen; el modelo base es Krea 2 |
| Parametros totales | no disponible (el repositorio pesa 1,0 GB; el número de parámetros del adaptador no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; la longitud de prompt efectiva depende del tokenizador del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | compatible con `diffusers` (pesos LoRA cargables mediante `load_lora_weights`); no se detalla si hay safetensors, GGUF u otros |
| Modelo base | krea/Krea-2-Raw |
| Pipeline | text-to-image |
| Libreria | diffusers |
| Tamano del repositorio | 1,0 GB |
| Trigger token | "Fiona MacLeod super plus-size woman extreme obesity blonde wavy hair fair skin very large bust prominent hanging belly wide hips, thick thighs large upper arms round face smiling realistic skin texture photorealistic candid photography" |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth, una técnica de ajuste fino eficiente en parámetros que congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas del transformer de difusión. La model card no detalla el rango, el alpha, las capas objetivo ni el número de pasos de entrenamiento, por lo que esos hiperparámetros no están disponibles. El entrenamiento se realizó sobre Krea 2 RAW, la variante del modelo base orientada a calidad, mientras que la inferencia de ejemplo se ejecuta sobre Krea 2 Turbo, la variante destilada para pocos pasos.

El único dato de entrenamiento explícito es el prompt de instancia, que actúa como token disparador y describe de forma muy detallada los atributos del personaje y el estilo fotográfico deseado ("realistic skin texture photorealistic candid photography"). No se especifica el tamaño del dataset, la composición de las imágenes, si hubo regularización, ni si se aplicaron técnicas adicionales como captions automáticos o aumento de datos. Tampoco se documenta ninguna innovación técnica más allá del propio flujo DreamBooth-LoRA estándar.

## Capacidades

- Generación de imágenes fotorrealistas de un personaje concreto (Fiona MacLeod) a partir de descripciones textuales.
- Reproducción consistente de atributos físicos definidos en el trigger token: pelo rubio ondulado, piel clara, complexión muy corpulenta y rostro redondeado.
- Estilización fotográfica tipo "candid photography" con textura de piel realista, según el prompt de instancia.
- Composición de escenas variadas: exteriores (balcón mediterráneo, parque otoñal) e interiores (club de jazz con iluminación de neón), según los ejemplos de la model card.
- Control de vestuario y entorno mediante el prompt de texto que acompaña al trigger.
- Compatibilidad con el pipeline `Krea2Pipeline` de `diffusers` y carga mediante `load_lora_weights`.
- Inferencia rápida sobre Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, según los ejemplos publicados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código ni otras capacidades de modelos de lenguaje.
- Capacidades multilingües: no documentadas; los ejemplos están en inglés.

## Casos de uso

- Creación de personajes ficticios consistentes para narrativa visual: el LoRA permite generar al mismo personaje en múltiples escenas y vestuarios manteniendo los rasgos definidos en el trigger, útil para storyboards, cómics o novelas ilustradas.
- Prototipado de campañas de moda inclusiva: se puede generar ropa y estilismos sobre una silueta corporal concreta (talla grande) para previsualizar colecciones antes de la producción fotográfica.
- Generación de material para blogs o redes sociales: escenas cotidianas (parque, balcón, local nocturno) con un personaje recurrente que aporta continuidad visual a una cuenta.
- Pruebas de concepto en estudios de fotografía virtual: evaluar iluminación, composición y encuadre en escenarios como un club de jazz con neón antes de un rodaje real.
- Investigación sobre sesgos y representación corporal en modelos generativos: el adaptador permite estudiar cómo responde el modelo base a descripciones corporales específicas y si reproduce estereotipos.
- Docencia y experimentación con DreamBooth-LoRA: sirve como ejemplo práctico de entrenamiento de un adaptador sobre Krea 2 y de su carga en `diffusers` con `Krea2Pipeline`.
- Integración en pipelines de generación por lotes: al ser un LoRA ligero (1,0 GB), puede cargarse y descargarse dinámicamente en un servidor de inferencia para alternar entre personajes sin recargar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas como FID, CLIP score, similitud facial ni evaluaciones humanas, y al tratarse de un LoRA de personaje, los benchmarks estándar de texto-a-imagen no serían directamente aplicables sin una evaluación específica del concepto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del modelo base Krea 2, no del LoRA. El adaptador en sí añade una sobrecarga mínima (1,0 GB en disco).
- GPU recomendadas: no especificadas en la model card. Para modelos de difusión de esta familia suele requerirse al menos una GPU con 16-24 GB de VRAM, pero este dato no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? No disponible. Depende del modelo base y de la cuantización aplicada, que no se documenta.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (único método documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- Latencia y throughput: no disponibles. Los ejemplos usan 8 pasos de inferencia sobre Krea 2 Turbo, lo que sugiere una generación rápida, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia estructural, podría compararse con otros adaptadores DreamBooth-LoRA para la familia Krea 2 o para SDXL, pero no se dispone de especificaciones de esos modelos en esta búsqueda.

## Limitaciones y advertencias

- Sesgos conocidos: el trigger token describe de forma explícita y estereotipada un cuerpo "super plus-size" con "extreme obesity"; el adaptador puede reforzar asociaciones reductivas entre corpulencia y ciertos atributos, y su uso en producción requiere revisión ética y de representación.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías inconsistentes, manos deformadas, texto ilegible y artefactos en escenas complejas; no hay evaluación publicada de su tasa de fallo.
- Limitaciones de contexto e idioma: no se documentan idiomas soportados; los prompts de ejemplo están en inglés y el trigger token está en inglés, por lo que su uso en castellano no está validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base Krea 2 RAW, que puede imponer condiciones adicionales al uso combinado.
- Caveat de producción: cero descargas y cero likes indican ausencia de validación comunitaria; no hay garantía de calidad ni de estabilidad del concepto fuera de las tres muestras publicadas.
- Dependencia del modelo base: el LoRA no funciona de forma autónoma; requiere descargar Krea 2 RAW o Turbo y el pipeline `Krea2Pipeline`, lo que incrementa los requisitos de hardware y almacenamiento.
- Riesgo de suplantación o uso dañino: al fijar un personaje concreto, podría emplearse para generar imágenes no consentidas de personas reales si el personaje se inspira en alguien identificable; se recomienda auditar el origen de las imágenes de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/handicapedguy/fiona-macleod
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Modelo Krea 2 Turbo (usado en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Librería diffusers: https://github.com/huggingface/diffusers
- Documentación de LoRA en diffusers: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
