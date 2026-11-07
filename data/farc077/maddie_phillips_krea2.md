# farc077/Maddie_Phillips_KREA2

## Resumen

Maddie_Phillips_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face, diseñado para generar imágenes fotorrealistas de la actriz Maddie Phillips sobre el modelo base Krea-2-Raw de la organización Krea. No se trata de un modelo fundacional autónomo, sino de un peso adicional de bajo rango que se carga junto al checkpoint base para condicionar la generación hacia la identidad facial y corporal de la actriz. El repositorio ocupa 0,2 GB, lo que es coherente con un adaptador LoRA y no con un modelo completo.

El adaptador se ha generado con la herramienta OneshotLoRA, un servicio que automatiza el entrenamiento de LoRAs de identidad a partir de un conjunto reducido de imágenes de referencia. La model card no documenta el número de imágenes de entrenamiento, los pasos, el learning rate ni la composición del dataset, por lo que los detalles del proceso de entrenamiento no están disponibles. La relevancia de este tipo de publicación es práctica: permite a desarrolladores y creadores incorporar una identidad concreta en pipelines de generación de imágenes sin reentrenar el modelo base.

La ficha se limita a lo que la información pública permite afirmar. Al tratarse de un LoRA de identidad sobre un modelo de imagen, muchos de los parámetros habituales en fichas de modelos de lenguaje (contexto, cuantización, benchmarks) no aplican o no están publicados, y así se indica explícitamente en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base de difusión Krea-2-Raw; arquitectura interna del base no disponible |
| Parametros totales | no disponible (el repositorio pesa 0,2 GB, compatible con un adaptador LoRA) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | other (licencia personalizada; ver limitaciones) |
| Formato de pesos | no disponible (el repositorio contiene pesos de adaptador; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Krea-2-Raw para modificar su comportamiento generativo sin alterar los pesos originales. El modelo base es un text-to-image de la organización Krea, cuya arquitectura concreta (tipo de backbone, tamaño, mecanismo de atención) no se detalla en la información disponible. El adaptador está etiquetado como ONESHOTLORA, lo que indica que fue producido con la plataforma oneshotlora.com, orientada a entrenar LoRAs de identidad con pocas imágenes.

No hay información pública sobre el número de tokens o imágenes de entrenamiento, la resolución de las muestras, el número de pasos, el rango del LoRA ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se documenta si hubo algún proceso de refinamiento posterior. La única indicación técnica relevante es la palabra de activación (trigger word) `M4DD13P`, que debe incluirse en el prompt para invocar la identidad aprendida.

## Capacidades

- Generación de imágenes fotorrealistas de la actriz Maddie Phillips a partir de descripciones textuales en inglés.
- Control de vestuario, entorno y pose mediante prompt, como demuestran los ejemplos de la model card (camisa formal con blazer en oficina, vestido rosa en un campo de hierba, camiseta blanca con vaqueros).
- Composición de la identidad con escenas y estilos especificados en el texto, manteniendo el parecido facial dentro de los límites del adaptador.
- Integración en pipelines de text-to-image que carguen el modelo base Krea-2-Raw y el adaptador LoRA de forma conjunta.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que no aplican a un modelo de generación de imágenes.
- Capacidades multilingües: no disponibles; los ejemplos y la documentación están en inglés.

## Casos de uso

- Producción de contenido editorial simulado: generar imágenes de una figura concreta en contextos de moda o corporativos (por ejemplo, la escena de oficina con blazer) para maquetas, storyboards o pruebas de concepto visuales.
- Pruebas de vestuario y estilismo: iterar prompts de ropa y accesorios sobre una identidad fija para evaluar combinaciones antes de una sesión fotográfica real.
- Prototipado de personajes para narrativa audiovisual: usar la identidad como referencia visual consistente en guiones gráficos o animáticas.
- Generación de material para campañas ficticias o demos de producto: crear imágenes de una persona concreta en escenarios controlados (interiores, exteriores, fondos neutros) para presentaciones internas.
- Investigación sobre LoRAs de identidad: servir como ejemplo práctico de adaptador OneshotLoRA para estudiar cómo se comporta la fidelidad de identidad con pocas muestras y distintos prompts.
- Pruebas de integración de pipelines: validar la carga conjunta de un modelo base de difusión y un adaptador LoRA en herramientas como ComfyUI, dado que los ejemplos de la model card parecen generados con esa interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de fidelidad de identidad, FID, CLIP score ni comparaciones numéricas con otros adaptadores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende enteramente del modelo base Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un LoRA sobre un modelo de difusión, los requisitos vendrán marcados por el checkpoint base, no por el adaptador de 0,2 GB.
- Compatibilidad con GPU de consumo: no confirmada; depende del modelo base.
- Opciones de despliegue: ComfyUI es la opción implícita en los ejemplos de la model card (los nombres de archivo `ComfyUI_temp_*.png` lo sugieren). Otras herramientas compatibles con LoRA sobre el base no están documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros adaptadores LoRA de identidad sobre Krea-2-Raw ni alternativas comparables con datos verificables de parámetros, contexto o rendimiento. Cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- La licencia es "other", una licencia personalizada no detallada en la información disponible; es imprescindible revisar los términos del repositorio y del modelo base Krea-2-Raw antes de cualquier uso comercial.
- El adaptador reproduce la identidad de una persona real (la actriz Maddie Phillips). Su uso para generar imágenes que puedan interpretarse como reales o difamatorias plantea riesgos legales y éticos, y el autor declara que el usuario es responsable de cumplir la legislación aplicable.
- No se documentan sesgos específicos, pero al entrenarse sobre una identidad concreta puede reproducir sesgos de representación del dataset utilizado, no publicado.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir rasgos faciales inconsistentes, artefactos en manos o composiciones incoherentes, especialmente fuera de los prompts de ejemplo.
- El idioma de los prompts de ejemplo es el inglés; no hay evidencia de soporte multilingüe.
- No se especifican limitaciones de resolución, pasos de muestreo ni CFG recomendados, lo que dificulta reproducir los resultados de la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/farc077/Maddie_Phillips_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Herramienta de entrenamiento: https://oneshotlora.com
