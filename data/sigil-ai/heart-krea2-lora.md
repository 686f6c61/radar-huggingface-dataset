# sigil-ai/heart-krea2-lora

## Resumen

Heart Krea 2 LoRA es un adaptador LoRA de tipo personaje (character LoRA) para el modelo base de generación de imágenes Krea 2 Raw. Lo desarrolla el usuario sigil-ai y está pensado para reproducir la apariencia de una mujer adulta ficticia a partir de un prompt disparador (`nvheart01`). El repositorio ocupa 0,2 GB y contiene un único archivo de pesos, `heart.safetensors`, de 234.677.352 bytes.

Se trata de un modelo experimental, no de un modelo fundacional: no genera imágenes por sí solo, sino que modifica el comportamiento del modelo base Krea 2 Raw al que se aplica. Según la model card, se entrenó con 29 imágenes seleccionadas usando el entrenador fal Krea 2, con 1.000 pasos, rango 32 y resolución de 1.024 píxeles.

Su relevancia es acotada: sirve como ejemplo de flujo de trabajo para LoRAs de personaje sobre Krea 2 y como recurso para quien quiera estudiar cómo se comporta un adaptador de rango 32 entrenado con pocas imágenes. La validación inicial, según el autor, cubrió 12 imágenes fijas con resultados mixtos en la fidelidad del parecido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Krea 2 Raw |
| Parametros totales | no disponible (el archivo de pesos ocupa 234.677.352 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la generacion depende del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`heart.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado sobre Krea 2 Raw, un modelo de difusion texto-a-imagen. No se especifica en la informacion disponible sobre que componentes del modelo base se inyectan las matrices de bajo rango ni el desglose exacto de parametros entrenables.

El entrenamiento se realizo con el entrenador fal Krea 2 a partir de 29 imagenes seleccionadas, durante 1.000 pasos y a 1.024 pixeles de resolucion. El prompt de instancia es `nvheart01`. No se documentan en la informacion disponible detalles sobre la composicion del dataset, el uso de regularizacion, la tasa de aprendizaje ni si hubo etapas de refinamiento posteriores.

## Capacidades

- Generacion de retratos y figuras de un personaje ficticio concreto mediante el disparador `nvheart01`.
- Control de atributos fisicos descritos en el prompt (color y estilo del pelo, ojos, pecas, ropa) dentro de los limites observados por el autor.
- Integracion con el pipeline `text-to-image` del modelo base Krea 2 Raw.
- Ajuste de intensidad del efecto mediante el parametro de fuerza (strength) del LoRA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un adaptador de generacion de imagenes.
- No se documentan capacidades multilingues propias; dependen del codificador de texto del modelo base.
- No se ha probado la continuidad en video segun el autor.

## Casos de uso

- Prototipado de personajes para narrativa visual: usar `nvheart01` junto con descripciones de vestuario y luz para generar variaciones de un mismo personaje en distintas escenas, aceptando que el parecido puede degradarse en angulos poco representados.
- Pruebas de concepto de ilustracion editorial: generar retratos con luz natural de ventana y encuadre relajado, que es el caso mejor validado por el autor en las 12 imagenes de validacion.
- Estudio de tecnicas de entrenamiento LoRA: el repositorio documenta pasos, rango, resolucion y tamano del dataset, lo que permite reproducir o comparar configuraciones con otras LoRAs de personaje.
- Generacion de referencias para artistas: producir imagenes de apoyo con un personaje consistente para bocetos posteriores, usando strength 0.8 en primeros planos si el encuadre sale demasiado abierto.
- Evaluacion de deriva de atributos: medir como se pierden detalles finos (pecas tenues, ojos mas oscuros, mandibula y complexion mas anchas) en funcion de la fuerza del LoRA y del prompt.
- Integracion en pipelines de generacion por lotes sobre Krea 2 Raw: aplicar el adaptador en un flujo automatizado de imagenes fijas, evitando vistas de perfil izquierdo y traseras, que segun el autor rinden peor o no funcionan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion cualitativa es la validacion del autor sobre 12 imagenes fijas: el rostro suele mantenerse, las pecas aparecen tenues, los ojos salen mas oscuros, la mandibula y la complexion a veces resultan mas anchas que en las referencias, el perfil izquierdo tiene peor parecido y la vista trasera solicitada no funciono.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Krea 2 Raw y de la precision de carga, no del adaptador (0,2 GB).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el adaptador se carga sobre el pipeline de difusion del modelo base).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros adaptadores LoRA de personaje sobre Krea 2 Raw ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo experimental y sin validacion extensa: solo 12 imagenes fijas de prueba y 29 imagenes de entrenamiento.
- Deriva de atributos documentada: pecas tenues, ojos mas oscuros, mandibula y complexion mas anchas que las referencias.
- El perfil izquierdo presenta peor parecido y la vista trasera no funciona segun el autor.
- La continuidad en video no se ha probado.
- El color y el estilo del pelo derivaron en las pruebas iniciales; el autor recomienda incluir `long wavy chestnut hair, hair worn loose` cuando ese aspecto importe.
- Licencia no disponible: no se puede confirmar el uso comercial del adaptador ni las condiciones heredadas del modelo base Krea 2 Raw.
- Riesgo de alucinacion visual y de inconsistencia entre generaciones inherente a los LoRAs de personaje con datasets pequenos.
- Sin descargas ni valoraciones en el momento de la consulta, lo que limita la evidencia de uso en produccion.
- Contenido de personaje ficticio adulto: conviene revisar las politicas del modelo base y de la plataforma de despliegue antes de publicar resultados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigil-ai/heart-krea2-lora
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
