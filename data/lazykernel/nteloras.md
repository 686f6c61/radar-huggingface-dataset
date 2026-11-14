# LazyKernel/NTELoras

## Resumen

NTELoras es una colección de adaptadores LoRA de tipo text-to-image para el anime, desarrollada por el usuario LazyKernel. El paquete reúne 16 archivos LoRA que representan a cuatro personajes del videojuego *Neverness to Everness*: Elyms, Lacrimosa, Linko y Sakiri. Cada personaje dispone de adaptadores entrenados sobre distintos modelos base, lo que permite reutilizar el mismo concepto visual en varios ecosistemas de generación de imagen.

El repositorio es un adaptador (base_model_relation: adapter) y no un modelo autónomo: requiere cargar uno de los modelos base sobre los que fue entrenado. Los modelos base declarados son circlestone-labs/Anima, OnomaAIResearch/Illustrious-XL-v1.0 (familia SDXL), krea/Krea-2-Raw y OpenMOSS-Team/MOSS-Image-Base. Esta cobertura multi-base es el rasgo diferencial frente a LoRAs de personaje convencionales, que suelen limitarse a una sola familia.

La relevancia actual reside en su especialización: permite a artistas y desarrolladores generar de forma consistente personajes concretos de un título específico con un trigger textual, manteniendo el estilo del modelo base elegido. El repositorio ocupa 3,3 GB y se distribuye con licencia "other" (base-model-licenses), lo que obliga a respetar las condiciones de cada modelo base subyacente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos base de difusión text-to-image |
| Parámetros totales | no disponible (adaptadores; el tamaño depende del rango y de las capas adaptadas) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión en el sentido de LLM; la ventana la fija el modelo base) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (los prompts se expresan en el idioma que acepte el modelo base) |
| Licencia | other (base-model-licenses, según LICENSE.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los archivos son adaptadores LoRA en formato safetensors que se inyectan en las capas de atención (y, presumiblemente, en otras capas lineales) de los modelos base de difusión. Al tratarse de un adaptador, la arquitectura efectiva es la del modelo base: un UNet de difusión en el caso de Illustrious-XL (familia SDXL), y las arquitecturas correspondientes de Anima, Krea-2-Raw y MOSS-Image-Base. No se especifica en la información disponible el rango de las LoRA, las capas objetivo ni los hiperparámetros de entrenamiento.

El entrenamiento se orienta a la identidad de personaje: cada adaptador se asocia a un trigger textual concreto (`elyms \(neverness to everness\)`, `lacrimosa \(neverness to everness\)`, `linko \(neverness to everness\)` y `sakiri \(neverness to everness\)`), siguiendo la convención de Danbooru de escapar paréntesis. El repositorio incluye varias versiones por personaje y base (por ejemplo, Lacrimosa dispone de V1 y V2 sobre Anima, y Linko de V1 y V2), lo que sugiere iteraciones de refinamiento. No se detalla la composición del dataset, el número de imágenes ni si se aplicaron técnicas como regularización o captions automáticos.

## Capacidades

- Generación de imágenes text-to-image de personajes concretos de *Neverness to Everness* mediante trigger textual.
- Transferencia de concepto entre cuatro modelos base distintos (Anima, Illustrious, Krea-2-Raw, MOSS-Image-Base), con adaptadores específicos por base.
- Control de identidad de personaje: rostro, vestuario y rasgos característicos del personaje, condicionados por el prompt.
- Compatibilidad con el ecosistema de difusión del modelo base: prompts negativos, CFG, samplers y schedulers habituales.
- Integración en flujos de trabajo de ComfyUI, como evidencian las imágenes de previsualización incluidas (`ComfyUI_*.png`).
- Versionado por personaje y base (V1, V2), lo que permite comparar y elegir la iteración más adecuada.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo, por no ser propias de un modelo de difusión.

## Casos de uso

- Ilustración de fan art de personajes: cargar el LoRA del personaje junto con el modelo base correspondiente y usar el trigger para generar retratos o escenas consistentes del personaje, manteniendo el estilo del base elegido.
- Producción de arte conceptual para proyectos derivados: generar variaciones de vestuario y pose de un personaje concreto sobre Illustrious-XL o Krea-2-Raw, reutilizando el mismo adaptador en distintas fases del pipeline.
- Creación de assets para comunidades y wikis: producir imágenes de referencia uniformes de Elyms, Lacrimosa, Linko y Sakiri para documentación, guías o fichas de personaje.
- Prototipado rápido en ComfyUI: al incluir previsualizaciones y flujos de ComfyUI, el adaptador se puede integrar en grafos existentes para iterar sobre composiciones sin reentrenar.
- Comparación de modelos base: al existir adaptadores para cuatro bases, un estudio puede evaluar cómo un mismo personaje se representa en Anima, Illustrious, Krea-2 y MOSS-Image y elegir el base que mejor encaje con su dirección artística.
- Generación de material promocional o merchandising no oficial: crear ilustraciones del personaje en distintos estilos para camisetas, pósteres o banners, siempre que la licencia del modelo base y los derechos del personaje lo permitan.
- Investigación sobre LoRA de personaje: el repositorio sirve como caso de estudio de adaptadores multi-base y de versionado de identidad para experimentos académicos sobre personalización de modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma específica; al ser adaptadores LoRA, el consumo lo determina el modelo base. Para bases de la familia SDXL (Illustrious-XL) se requiere habitualmente VRAM de GPU de gama alta de consumo, aunque la cifra exacta no se documenta en la información proporcionada.
- GPU recomendadas: no disponible en la información del repositorio.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base cargado.
- Opciones de despliegue: ComfyUI (se incluyen imágenes de ejemplo generadas en ComfyUI); el resto de opciones (diffusers, A1111, etc.) no se documentan.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelos base | Personajes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LazyKernel/NTELoras | LoRA de personaje multi-base | Anima, Illustrious-XL, Krea-2-Raw, MOSS-Image-Base | Elyms, Lacrimosa, Linko, Sakiri | other (base-model-licenses) | Hugging Face |
| LoRA de personaje convencional sobre SDXL | LoRA de personaje mono-base | SDXL / Illustrious | Uno o pocos | variable según autor | Hugging Face / Civitai |
| LoRA de estilo sobre SDXL | LoRA de estilo | SDXL | no aplica | variable | Hugging Face / Civitai |

No se dispone de datos de benchmarks ni de métricas objetivas para establecer una comparación cuantitativa con alternativas. La comparación se limita a características estructurales.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere un modelo base compatible; usar un adaptador con la base equivocada produce resultados degradados o inutilizables.
- Licencia "other" (base-model-licenses): el uso comercial está sujeto a las condiciones de cada modelo base (Anima, Illustrious-XL, Krea-2-Raw, MOSS-Image-Base), que deben revisarse por separado antes de producción.
- Los personajes pertenecen a *Neverness to Everness*; los derechos de propiedad intelectual pueden restringir la distribución comercial de las imágenes generadas.
- Riesgo de sobreajuste al estilo del dataset de entrenamiento y de pérdida de identidad fuera del trigger o con prompts muy alejados del dominio.
- No se documentan sesgos específicos, pero al ser un LoRA de personaje anime hereda los sesgos y estilos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes del personaje (vestuario, accesorios) fuera de las poses o ángulos vistos en el entrenamiento.
- Idiomas soportados no documentados; la eficacia del prompt depende del tokenizador y del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de calidad independientes.
- No se especifican hiperparámetros de entrenamiento (rango, alpha, capas), lo que dificulta reproducir o ajustar los adaptadores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LazyKernel/NTELoras
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Modelo base Illustrious-XL-v1.0: https://huggingface.co/OnomaAIResearch/Illustrious-XL-v1.0
- Modelo base Krea-2-Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Notas de Elyms (Anima): https://huggingface.co/LazyKernel/NTELoras/blob/main/Anima/Elyms/README.md
- Notas de Lacrimosa (Anima): https://huggingface.co/LazyKernel/NTELoras/blob/main/Anima/Lacrimosa/README.md
- Notas de Linko (Anima): https://huggingface.co/LazyKernel/NTELoras/blob/main/Anima/Linko/README.md
- Notas de Sakiri (Anima): https://huggingface.co/LazyKernel/NTELoras/blob/main/Anima/Sakiri/README.md
