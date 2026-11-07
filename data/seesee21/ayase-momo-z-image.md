# SeeSee21/Ayase-Momo-Z-Image

## Resumen

Ayase-Momo-Z-Image es un LoRA (Low-Rank Adaptation) de texto a imagen desarrollado por SeeSee21 (también conocido como SeeSeeLP en Civitai) que adapta el modelo base Tongyi-MAI/Z-Image-Turbo para generar representaciones del personaje Ayase Momo, protagonista del manga y anime Dandadan. El adaptador se publica bajo licencia Apache-2.0, coherente con la del modelo base, y está pensado exclusivamente para prompts en inglés.

El repositorio ocupa 0,2 GB y contiene un único archivo de pesos en formato safetensors (`dandadan_ayase_momo_3.safetensors`). No se trata de un modelo autónomo: requiere cargarse sobre Z-Image-Turbo, un modelo de difusión de texto a imagen de Alibaba Tongyi-MAI, y su función es inyectar el conocimiento visual del personaje (peinado bob castaño, ojos rojizos, jersey rosa, falda escolar navy, gargantilla con colgante verde y pendientes circulares verdes) sin reentrenar el modelo completo.

Su relevancia es acotada pero clara para la comunidad de generación de imágenes anime: ofrece un adaptador ligero y de bajo peso (rango LoRA típico) que permite producir ilustraciones consistentes del personaje en escenas de acción, retratos y composiciones detalladas con un coste computacional mínimo adicional sobre el modelo base. No hay datos publicados de descargas ni de likes en el momento de la ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión texto a imagen Z-Image-Turbo |
| Parámetros totales | no disponible (el repositorio pesa 0,2 GB; el número de parámetros del adaptador no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del tokenizador y del codificador de texto del modelo base) |
| Tipos de cuantización | no disponible (se distribuye en safetensors; no se documentan variantes GGUF ni fp8) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`dandadan_ayase_momo_3.safetensors`) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema estándar de LoRA: matrices de bajo rango inyectadas en las capas del transformer de difusión de Z-Image-Turbo, que se suman a los pesos congelados del modelo base durante la inferencia. El peso recomendado de aplicación es de 0,4 a 1,0; el autor advierte que valores altos pueden provocar "overbaking" (saturación o artefactos por sobreajuste del estilo). No se especifica el rango, el alpha, las capas objetivo ni la configuración exacta del entrenamiento.

El dataset, según la model card, es una colección personalizada de ilustraciones y referencias de Ayase Momo, curada y revisada para mantener consistencia de estilo. No se indica el número de imágenes, la resolución de entrenamiento, el número de pasos, la tasa de aprendizaje ni si se usó regularización o captions automáticos. Tampoco hay información sobre el proceso de curación más allá de la mención a un control de calidad. El adaptador está optimizado para el modelo base Z-Image-Turbo y no se declara compatibilidad con otras variantes de Z-Image ni con otros modelos de difusión.

## Capacidades

- Generación de imágenes de texto a imagen del personaje Ayase Momo en estilo anime, con control mediante prompts descriptivos en inglés.
- Reproducción consistente de atributos del personaje: pelo bob castaño, ojos rojizos, jersey rosa, falda escolar navy, calcetines flojos, gargantilla con colgante verde y pendientes circulares verdes.
- Composición de escenas de acción y dinámicas, incluidas posturas de combate y efectos de energía psíquica (tonos púrpura y verde) descritos en los prompts de ejemplo.
- Soporte de prompts detallados con etiquetas estilo danbooru (1girl, solo, choker, pleated skirt, etc.), lo que facilita la integración con flujos de trabajo de Stable Diffusion basados en tags.
- Generación de escenas cotidianas (comer con palillos, sentada junto a una valla, con sudadera con capucha) además de escenas de terror y acción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un adaptador de generación de imágenes.
- Capacidad multilingüe limitada al inglés según la model card; no se documenta soporte de prompts en otros idiomas.

## Casos de uso

- Ilustración de fan art de Dandadan: cargar el LoRA sobre Z-Image-Turbo con peso entre 0,4 y 1,0 y usar los trigger words "Ayase Momo" o "Ayase Momo from Dandadan" para generar ilustraciones del personaje en escenas nuevas, manteniendo coherencia visual entre imágenes.
- Creación de paneles para cómics amateur o doujinshi: el adaptador permite generar variaciones de pose y expresiones del personaje con prompts detallados, útil para bocetos y storyboards de proyectos no comerciales o comerciales bajo Apache-2.0.
- Diseño de personajes para juegos indie o prototipos: al estar bajo Apache-2.0 y apoyarse en un modelo base también Apache-2.0, el adaptador puede integrarse en pipelines de previsualización de assets, siempre que se respeten los derechos del personaje original.
- Generación de escenas de acción y terror: los prompts de ejemplo del autor demuestran que el LoRA responde bien a descripciones de atmósfera (pasillo escolar abandonado, luces parpadeantes, partículas de polvo) y a efectos de psicokinesis, lo que lo hace adecuado para ilustración de portadas o key art de fan projects.
- Pruebas de concepto de adaptadores LoRA: por su tamaño reducido (0,2 GB) y su licencia permisiva, sirve como ejemplo didáctico para estudiar cómo se comporta un LoRA de personaje sobre un modelo de difusión turbo, incluyendo el efecto del peso en la fidelidad y el overbaking.
- Exploración de estilos con tags estilo danbooru: la combinación de trigger words con tags como `1girl`, `solo`, `choker` o `pleated skirt` permite integrar el LoRA en flujos de trabajo existentes de Stable Diffusion WebUI, ComfyUI o InvokeAI que ya usen Z-Image-Turbo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica para el LoRA. El adaptador añade una sobrecarga mínima (0,2 GB en disco) sobre el modelo base Z-Image-Turbo; el requisito real de VRAM lo determina el modelo base, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. Al depender de Z-Image-Turbo, se recomienda consultar los requisitos de ese modelo base; no se documentan GPU concretas (A100, H100, RTX 4090, etc.) en la información disponible.
- ¿Cabe en GPU de consumo? no disponible; depende del modelo base y de la precisión de carga.
- Opciones de despliegue: no se documentan explícitamente. Al ser un safetensors de LoRA, es compatible con los cargadores de LoRA habituales de herramientas como Stable Diffusion WebUI, ComfyUI o InvokeAI, siempre que soporten el modelo base Z-Image-Turbo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ayase-Momo-Z-Image (SeeSee21) | LoRA de personaje | Z-Image-Turbo | no disponible | Apache-2.0 | Hugging Face y Civitai (v1.0) |
| Ayase Momo (SeaArt AI) | Modelo de personaje en plataforma | no disponible | no disponible | no disponible | SeaArt AI |
| Z-Image-Turbo (Tongyi-MAI) | Modelo de difusión texto a imagen | no aplica | no disponible | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas como para establecer una comparación cuantitativa de rendimiento. La comparativa se limita a tipo de artefacto, modelo base, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un LoRA de personaje con licencia Apache-2.0, pero el personaje Ayase Momo y Dandadan son propiedad de sus titulares de derechos (Yukinobu Tatsu / Shueisha); el uso comercial de imágenes del personaje puede infringir derechos de autor independientemente de la licencia del adaptador.
- Solo admite prompts en inglés según la model card; los prompts en castellano u otros idiomas no están documentados y pueden degradar la fidelidad.
- Riesgo de overbaking con pesos altos (por encima de 1,0): el autor advierte que valores elevados saturan el estilo; se recomienda el rango 0,4-1,0.
- Dependencia estricta del modelo base Z-Image-Turbo: no se declara compatibilidad con otras variantes de Z-Image ni con otros modelos de difusión, por lo que no puede usarse de forma autónoma.
- Dataset de entrenamiento no documentado en detalle (sin número de imágenes, resolución ni composición), lo que impide evaluar sesgos o cobertura de poses y expresiones.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta, detalles inconsistentes del atuendo o artefactos en las manos y accesorios, especialmente en composiciones complejas.
- Sin métricas de calidad publicadas (FID, CLIP score, evaluaciones humanas) ni datos de descargas o adopción que permitan validar su rendimiento frente a otros LoRA del personaje.
- El repositorio se creó y actualizó en noviembre de 2026 y no registra descargas ni likes en la información disponible; la comunidad de validación es inexistente por el momento.

## Enlaces

- Hugging Face: https://huggingface.co/SeeSee21/Ayase-Momo-Z-Image
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Perfil del autor en Hugging Face: https://huggingface.co/SeeSee21
- Civitai (modelo): https://civitai.red/models/2189797
- Civitai (perfil del autor): https://civitai.red/user/SeeSeeLP
- Alternativa en SeaArt AI: https://www.seaart.ai/models/detail/cs2mf05e878c739r09r0
