# farc077/Anamaria_Vartolomei_KREA2

## Resumen

Anamaria_Vartolomei_KREA2 es un adaptador LoRA de tipo text-to-image publicado por el usuario farc077 en Hugging Face. Se trata de un LoRA de identidad (marcado por el autor como `ONESHOTLORA`) entrenado sobre el modelo base `krea/Krea-2-Raw`, y su propósito es reproducir el rostro y la apariencia de la actriz Anamaria Vartolomei en imágenes generadas por difusión. No es un modelo fundacional autónomo: requiere cargar el checkpoint base de Krea-2-Raw y aplicar el adaptador encima para funcionar.

El repositorio es muy reciente (creado y actualizado el 22 de noviembre de 2026), con un tamaño de 0,2 GB, lo que es coherente con un adaptador LoRA de rango bajo y no con un modelo completo. En el momento de redactar esta ficha no registra descargas ni interacciones, y la model card es mínima: se limita a indicar el modelo base, la palabra de activación (`4N4M4R14V`), la herramienta de generación empleada (oneshotlora.com) y tres ejemplos de prompts con imágenes de muestra.

Su relevancia es acotada y de nicho: sirve para flujos de generación de retratos consistentes de una persona concreta, típicamente en ComfyUI (los nombres de los ficheros de ejemplo lo sugieren), pero no aporta capacidades nuevas de razonamiento, lenguaje o código. La información técnica publicada por el autor es escasa, por lo que buena parte de los parámetros de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion text-to-image; el modelo base es `krea/Krea-2-Raw` |
| Parametros totales | no disponible (el repo pesa 0,2 GB, compatible con un adaptador LoRA, no con un modelo completo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo de difusion de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles) |
| Licencia | other (licencia no estandar; consultar la model card y la del modelo base) |
| Formato de pesos | no disponible (repo de 0,2 GB; presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation), que congela los pesos del modelo base e inserta matrices de bajo rango entrenables en determinadas capas. El modelo base declarado es `krea/Krea-2-Raw`, un modelo de difusión para generación de imágenes a partir de texto. El autor etiqueta el adaptador como `ONESHOTLORA` e indica que se generó con la herramienta oneshotlora.com, lo que sugiere un entrenamiento de identidad a partir de un conjunto reducido de imágenes de referencia de la actriz.

No se publican datos sobre el número de imágenes de entrenamiento, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni la composición del dataset. Tampoco se documenta si hubo regularización, aumento de datos o ajuste de capas específicas (por ejemplo, solo atención cruzada). No hay información sobre evaluación cuantitativa del adaptador ni sobre su comportamiento fuera del dominio de retratos.

## Capacidades

- Generación de imágenes text-to-image condicionadas por el adaptador, con foco en la identidad de la actriz Anamaria Vartolomei.
- Control de vestuario, entorno y pose mediante prompts en lenguaje natural (los ejemplos incluyen camisa formal con blazer en oficina, vestido de verano en un campo y camiseta con vaqueros).
- Composición de escena y dirección de mirada ("looking at the camera") a través del texto.
- Requiere la palabra de activación `4N4M4R14V` para activar la identidad aprendida.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de código o texto.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; los ejemplos publicados están en inglés.

## Casos de uso

- Creación de retratos consistentes de personaje: usar el LoRA con la palabra de activación para mantener el mismo rostro en una serie de imágenes (por ejemplo, un storyboard o un cómic), aprovechando que el adaptador fija la identidad y el prompt controla el resto.
- Previsualización de vestuario y estilismo: generar variaciones de una misma persona con distintas prendas y entornos (los tres ejemplos de la model card son precisamente de este tipo), útil para equipos de diseño o moda que necesiten referencias rápidas.
- Pruebas de concepto para ilustración editorial: producir bocetos de personajes con apariencia coherente antes de encargar el trabajo final a un ilustrador.
- Prototipado en ComfyUI: integrar el LoRA en un grafo de ComfyUI (los nombres de fichero de las muestras apuntan a esta herramienta) para flujos de generación por lotes con seeds y prompts parametrizados.
- Investigación sobre personalización de modelos de difusión: servir como caso de estudio de LoRA de identidad de un solo sujeto y comparar su fidelidad frente a otros adaptadores similares.
- Generación de material para ficción o fan art: crear escenas ficticias con la actriz como personaje, siempre que se respeten los derechos de imagen y la legislación aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de fidelidad de identidad (por ejemplo, similitud facial), FID, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base `krea/Krea-2-Raw`, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. Al tratarse de un adaptador sobre un modelo de difusión, se necesitará al menos la VRAM que exija el checkpoint base.
- Compatibilidad con GPU de consumo: no confirmada; depende enteramente del modelo base y de la precisión utilizada.
- Opciones de despliegue: ComfyUI es la opción implícita en los ejemplos del autor; también cabría esperar compatibilidad con otras interfaces que carguen LoRA sobre el modelo base (por ejemplo, diffusers), aunque no está documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Anamaria_Vartolomei_KREA2 (farc077) | LoRA de identidad text-to-image | krea/Krea-2-Raw | no disponible (repo 0,2 GB) | no aplica | other | Hugging Face, 0 descargas |
| Otros LoRA de identidad sobre Krea-2-Raw | LoRA de identidad text-to-image | krea/Krea-2-Raw | variable | no aplica | variable | no disponible (no se han identificado alternativas concretas en la informacion proporcionada) |
| LoRA de identidad sobre Flux.1 / SDXL | LoRA de identidad text-to-image | Flux.1 / SDXL | variable | no aplica | variable | ampliamente disponibles en Hugging Face, pero fuera del ecosistema Krea-2-Raw |

No se dispone de datos de rendimiento comparativo entre este adaptador y alternativas equivalentes, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- La model card es mínima: no documenta el dataset de entrenamiento, el rango del LoRA, la configuración de entrenamiento ni los parámetros recomendados de inferencia (escala del LoRA, sampler, pasos).
- Riesgo de sobreajuste y de "arrastre" de identidad: al ser un LoRA de una sola persona, puede forzar rasgos faciales en prompts donde no se desea, o degradar la composición si se usa con escalas altas.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía inconsistente, texto ilegible en la imagen o detalles incoherentes.
- Sesgos: no documentados; al derivar de un modelo base y de un conjunto de imágenes de una persona concreta, puede heredar sesgos de representación del modelo base.
- Limitaciones de idioma: los prompts de ejemplo están en inglés y no se documenta el comportamiento con prompts en castellano.
- Licencia "other": no se especifican los términos exactos; es imprescindible revisar la licencia del adaptador y la del modelo base `krea/Krea-2-Raw` antes de cualquier uso comercial.
- Derechos de imagen: el adaptador reproduce la apariencia de una persona real (Anamaria Vartolomei). Su uso para generar imágenes que puedan interpretarse como reales, con fines comerciales o difamatorios, puede infringir derechos de imagen y la legislación aplicable; el propio autor declara que el usuario es el único responsable del cumplimiento legal.
- Estado del repositorio: sin descargas ni interacciones, sin validación comunitaria y con una fecha de creación muy reciente; no hay evidencia de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/farc077/Anamaria_Vartolomei_KREA2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Herramienta de generación del LoRA: https://oneshotlora.com
