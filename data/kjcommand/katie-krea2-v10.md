# kjcommand/Katie-Krea2-V10

## Resumen

Katie-Krea2-V10 es un LoRA de personaje publicado por el usuario kjcommand bajo la marca KJ TALENT INC. para el modelo de difusión texto-imagen Krea 2. No es un modelo autónomo: se trata de un adaptador de rango 32 entrenado hasta la época 60 y exportado para inferencia, que debe cargarse sobre una instancia compatible del modelo base Krea 2. El repositorio ocupa 0,2 GB y no incluye metadatos de entrenamiento, fotografías originales ni pies de foto.

El adaptador se activa con la palabra clave `kjkatie26` y el autor recomienda aplicarlo con una fuerza de 0,8. La elección de la época 60 se realizó por revisión visual del propietario, no mediante una evaluación automática ni un conjunto de validación público. En el momento de redactar esta ficha el repositorio no registra descargas ni «me gusta».

Su relevancia práctica es acotada: interesa a quien necesite reproducir un personaje concreto sobre Krea 2 con un ajuste fino de bajo coste y sin reentrenar el modelo base. Al no publicarse licencia, idiomas, composición del dataset ni resultados de benchmarks, cualquier uso en producción exige una validación previa por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) de rango 32 sobre un modelo base de difusión texto-imagen Krea 2 |
| Parámetros totales | no disponible; el adaptador ocupa 0,2 GB en el repositorio |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; en difusión texto-imagen el límite lo fija el codificador de texto del modelo base (no disponible) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles; el prompt de texto depende del codificador del modelo base Krea 2 |
| Licencia | no disponible |
| Formato de pesos | no disponible; la model card menciona «tensor weights» sin detallar el formato de fichero |
| Palabra de activación | `kjkatie26` |
| Fuerza recomendada | 0,8 |
| Rango del LoRA | 32 |
| Época seleccionada | 60 |
| Modelo base requerido | Krea 2 (versión compatible, no especificada) |
| Tamaño del repositorio | 0,2 GB |
| Descargas / «me gusta» | 0 / 0 en la fecha de consulta |
| Fecha de creación / actualización | 2026-10-23 / 2026-10-23 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32, es decir, un conjunto de matrices de baja dimensionalidad que modifican los pesos de atención y/o proyección del modelo base de difusión Krea 2. La model card indica que el entrenamiento se prolongó hasta la época 60 y que el checkpoint exportado conserva los pesos tensoriales del punto seleccionado, sin alteraciones posteriores. No se especifican el rango aplicado por módulo, el optimizador, la tasa de aprendizaje, la resolución de entrenamiento ni la estrategia de captioning.

La información pública sobre el proceso es mínima y deliberadamente recortada: la exportación de inferencia omite los metadatos de entrenamiento y no se incluyen las fotografías originales ni sus pies de foto. La selección de la época 60 se justifica únicamente por revisión visual del propietario, sin métrica objetiva ni comparación con otras épocas. Esta falta de trazabilidad impide reproducir el entrenamiento o auditar la composición del dataset.

## Capacidades

- Generación de imágenes de un personaje concreto sobre el modelo base Krea 2, condicionada por la palabra de activación `kjkatie26`.
- Ajuste de la intensidad del personaje mediante el peso del LoRA; el autor recomienda 0,8 como punto de partida.
- Estilo visual, grado de fotorrealismo, iluminación y composición heredados del modelo base y del prompt, no del adaptador.
- Compatibilidad con flujos de trabajo de difusión estándar (prompt positivo y negativo, CFG, sampler, pasos) en la medida en que el base los soporte.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multimodales de entrada, audio ni modo «thinking»: son funciones no aplicables a un adaptador de difusión de imagen.
- El soporte multilingüe del prompt depende íntegramente del codificador de texto del modelo base y no está documentado para este adaptador.

## Casos de uso

- Consistencia de personaje en series de ilustración o cómic: cargando el LoRA sobre Krea 2 con `kjkatie26` a fuerza 0,8 se obtiene el mismo personaje en viñetas distintas, lo que evita reescribir descripciones largas en cada prompt y reduce la deriva de identidad entre páginas.
- Preproducción audiovisual y storyboards: el equipo de arte puede generar decenas de encuadres del personaje con el mismo aspecto para validar vestuario, iluminación y puesta en escena antes de rodar, con un coste de cómputo inferior al de un fine-tune completo.
- Identidad virtual para redes sociales: un estudio mantiene una cuenta de personaje ficticio generando publicaciones coherentes a lo largo del tiempo, ya que el adaptador fija los rasgos y el base aporta variedad de escenarios y estilos.
- Pruebas de vestuario y lookbooks: combinando el LoRA con prompts de indumentaria se generan catálogos del mismo personaje con distintos conjuntos, útil para previsualizar colecciones antes de producir muestras físicas.
- Generación de datasets sintéticos etiquetados: el adaptador permite producir lotes de imágenes de un personaje concreto con control de pose y encuadre para entrenar otros modelos o para pruebas de pipelines de visión por computador, siempre que la licencia lo permita (no disponible).
- Concept art para videojuegos: ilustradores pueden explorar variantes de un personaje jugable manteniendo su diseño reconocible entre iteraciones, y exportar las referencias elegidas al equipo de modelado 3D.
- Merchandising y material editorial: generación de ilustraciones del personaje para cartelería, portadas o productos derivados, con la advertencia de que la ausencia de licencia y de información sobre el origen de las imágenes de entrenamiento impide confirmar los derechos de explotación comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FID, CLIP score, similitud de identidad facial ni evaluaciones de prompt adherence), y la única validación declarada es una revisión visual subjetiva del propietario sobre la época 60.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; a fp16 esto equivale aproximadamente a 100 millones de parámetros, estimación derivada del tamaño del fichero y no confirmada por el autor.
- El requisito dominante es el del modelo base Krea 2. En la información consultada no se publican cifras de VRAM para ese base, por lo que no es posible dar un mínimo fiable.
- VRAM añadida por el LoRA: en el peor caso, unos 0,2 GB adicionales sobre el modelo base, ya que los pesos del adaptador se cargan en memoria junto a los del base.
- GPU recomendadas: no disponibles para el conjunto base + LoRA. La idoneidad en GPU consumer (RTX 3060, 4070, 4090, etc.) depende exclusivamente del modelo base y no puede afirmarse con los datos proporcionados.
- Despliegue: ComfyUI, biblioteca `diffusers` con carga de adaptadores PEFT/LoRA, o interfaces tipo Forge/Automatic1111 si admiten Krea 2. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste por paso de denoising atribuible al LoRA es marginal frente al del modelo base, al tratarse de productos de matrices de baja dimensionalidad (rango 32).

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Katie-Krea2-V10 (kjcommand) | LoRA de personaje, rango 32, época 60 | 0,2 GB | no disponible (depende del base Krea 2) | no disponible | HuggingFace, 0 descargas, 0 «me gusta» |
| Test - krea2 katie 2r (tensor.art) | LoRA de personaje para Krea 2 / FLUX | no disponible | no disponible | no disponible | tensor.art; datos no verificables |
| REKTY V10 Krea 2 (tensor.art) | Checkpoint afinado de Krea 2 orientado a fotorrealismo | no disponible | no disponible | no disponible | tensor.art; datos no verificables |
| krea2RealVae_v10 (p3cyc/KREA2) | VAE para Krea 2 | no disponible | no disponible | no disponible | HuggingFace; componente distinto, no comparable en función |

No se dispone de datos de rendimiento, licencia ni parámetros de las alternativas encontradas, por lo que la comparación cuantitativa no es posible; la única diferencia verificable es que este repositorio publica rango, época y fuerza recomendada, mientras que las alternativas no detallan su configuración en la información consultada.

## Limitaciones y advertencias

- Licencia no declarada: no puede confirmarse si se permite uso comercial, redistribución o modificación del adaptador. Tratarlo como no apto para producción hasta obtener una licencia explícita.
- Origen de los datos no auditable: no se incluyen fotografías originales, pies de foto ni metadatos de entrenamiento, de modo que no es posible verificar consentimiento, derechos de imagen ni sesgos del dataset.
- Riesgo de semejanza con personas reales: al tratarse de un LoRA de personaje construido a partir de fotografías no publicadas, el uso comercial puede vulnerar derechos de imagen o de propiedad intelectual de terceros.
- Dependencia estricta del modelo base: requiere una versión compatible de Krea 2 no especificada; versiones distintas del base pueden degradar el resultado o romper la activación.
- Sensibilidad a la palabra de activación y a la fuerza: por debajo de 0,8 el personaje puede no aparecer con claridad y por encima puede rigidizar la composición, imponer poses repetidas o generar artefactos. No hay barrido publicado de fuerzas.
- Sobreajuste probable: 60 épocas sobre un dataset de tamaño desconocido es un régimen propenso a memorizar encuadres y fondos del material de entrenamiento.
- Validación subjetiva: la selección del checkpoint no se apoya en métricas, y el repositorio no tiene descargas ni valoraciones que permitan inferir calidad de forma indirecta.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, manos deformes, texto ilegible en la imagen y detalles incoherentes con el prompt.
- Idiomas no documentados: el comportamiento con prompts en castellano depende del codificador del base y no está verificado.
- Sin benchmarks: no existe evidencia pública de rendimiento frente a otros LoRA de personaje, por lo que las comparaciones cualitativas deben hacerse con pruebas propias.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/kjcommand/Katie-Krea2-V10
- Artículo sobre Krea 2, prompts y flujos de trabajo (referido al modelo base): https://www.promptspace.in/blog/krea-2-ai-image-generator-prompts-guide-2026
- Ficha de Krea 2 en ModelScope (modelo base): https://www.modelscope.cn/models/vantagewithai/krea-2/summary
- Checkpoint REKTY V10 Krea 2 en tensor.art (alternativa, no verificada): https://tensor.art/models/1038991545597964493
- LoRA «Test - krea2 katie 2r» en tensor.art (alternativa, no verificada): https://tensor.art/models/1034459206196947188
- VAE krea2RealVae_v10 en HuggingFace (componente del ecosistema Krea 2): https://huggingface.co/p3cyc/KREA2/blob/main/krea2RealVae_v10.safetensors
