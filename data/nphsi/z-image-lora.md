# nphSi/Z-Image-Lora

## Resumen

Z-Image-Lora es una coleccion de adaptadores LoRA para el modelo de difusion texto-a-imagen Z-Image, desarrollada por el usuario nphSi. Su funcion principal es inyectar en el modelo base la capacidad de generar representaciones fotorrealistas de personas con identidad concreta (principalmente celebridades y personajes publicos), activadas mediante tokens de disparo con prefijo `vrtl`. Cada LoRA se corresponde con un individuo y se invoca escribiendo el nombre completo junto al trigger en el prompt.

El repositorio se distribuye como un indice de adaptadores (Lora-Index) con descarga directa, previsualizaciones y metadatos, y esta construido sobre Tongyi-MAI/Z-Image y su variante Turbo. No se trata de un modelo base autonomo, sino de un conjunto de pesos auxiliares en formato safetensors que requieren el modelo Z-Image para funcionar. El repositorio completo ocupa 128,2 GB, lo que refleja la acumulacion de cientos de adaptadores individuales.

Su relevancia actual radica en que Z-Image es un modelo de difusion reciente con licencia Apache 2.0, y esta coleccion demuestra un ecosistema activo de personalizacion mediante LoRA. La model card documenta practicas concretas de prompting (uso obligatorio del trigger, gestion de nombres ambiguos, combinacion de triggers multiples) que son utiles para quien integre estos adaptadores en pipelines de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion texto-a-imagen (Z-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen) |
| Tipos de cuantizacion | no disponible en el repo; las previsualizaciones usan ZI Turbo Q8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via diffusers) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA (Low-Rank Adaptation) aplicados sobre el modelo de difusion Z-Image de Tongyi-MAI, en sus variantes base y Turbo. La tecnica LoRA congela los pesos del modelo base e inserta matrices de bajo rango entrenadas para un concepto concreto; en este caso, la identidad facial y corporal de personas especificas. El autor no documenta en la model card el rango de las matrices, el dataset de entrenamiento, el numero de pasos ni la composicion de las imagenes de referencia.

La model card si describe el metodo de captioning empleado: cada adaptador se activa con un token unico con prefijo `vrtl` (por ejemplo `vrtlalbabaptista`), y el autor advierte explicitamente que terminos genericos como "woman" o "1girl" no funcionan con su esquema de entrenamiento. Tambien indica que para nombres ambiguos hay que anadir el genero en el prompt y que, cuando el conocimiento interno del modelo es deficiente o esta censurado, conviene eliminar el nombre real y usar solo el trigger. Los adaptadores con multiples triggers (por ejemplo `vrtlxx`, `vrtlyy`) admiten combinacion, y `vrtlMain` agrupa todos los triggers. Las previsualizaciones se generaron con ZI Turbo Q8, sampler Euler, scheduler beta, 9 pasos, CFG 1 y auraflow 6.

## Capacidades

- Generacion de imagenes fotorrealistas de personas concretas mediante LoRA de identidad, activadas por token `vrtl`.
- Composicion de escenas controlada por prompt (vestuario, fondo, encuadre, iluminacion) segun el ejemplo de la model card.
- Retratos de medio cuerpo y primeros planos con control de encuadre (centrado, frontal, contacto visual).
- Combinacion de multiples triggers para mezclar identidades o conceptos en un mismo adaptador.
- Compatibilidad con el ecosistema diffusers y con el modelo base y la variante Turbo de Z-Image.
- Indice navegable con descarga directa, previsualizaciones y metadatos por adaptador.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo generativo de imagen, no un LLM.

## Casos de uso

- Generacion de avatares y retratos consistentes: usar un LoRA concreto con su trigger `vrtl` para producir variaciones de una misma identidad en distintos encuadres y estilos, util para prototipado de personajes.
- Previsualizacion de conceptos de vestuario: el prompt de ejemplo de la model card (camisa anudada, patron de trebol, badge con letras) demuestra el control fino sobre prendas y detalles, aplicable a diseno de moda o storyboarding.
- Creacion de contenido editorial simulado: generar retratos con iluminacion y fondo controlados para maquetas de revista o pruebas de diseno grafico.
- Investigacion sobre personalizacion de modelos de difusion: la coleccion sirve como corpus de estudio de tecnicas LoRA de identidad y de esquemas de captioning con triggers.
- Pruebas de pipelines de inferencia: validar integraciones diffusers, cuantizacion Q8 y samplers (Euler, beta) con adaptadores reales y pesos ligeros respecto al modelo base.
- Generacion de material para benchmarks de similitud facial: evaluar metodos de medicion de identidad comparando salidas de distintos LoRA sobre el mismo modelo base.
- Demos interactivas en Spaces: el indice enlazado permite previsualizar y descargar adaptadores, util para construir demos de generacion con seleccion de identidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 128,2 GB; conviene descargar solo los adaptadores necesarios, ya que cada LoRA individual es mucho menor que el total.
- Requiere cargar el modelo base Z-Image ademas del adaptador; la VRAM depende del modelo base y de su cuantizacion, no solo del LoRA.
- Las previsualizaciones oficiales usan ZI Turbo Q8, lo que sugiere que la variante Turbo cuantizada a 8 bits es viable en hardware de gama alta de consumo, aunque no se especifica la GPU empleada.
- No se dispone de datos de VRAM exacta, GPU recomendadas, latencia ni throughput en la informacion proporcionada.
- Despliegue mediante diffusers (libreria declarada en el repo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Para produccion se recomienda verificar el consumo de VRAM del modelo base Z-Image en la configuracion elegida antes de dimensionar el hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nphSi/Z-Image-Lora | LoRA de identidad sobre Z-Image | no disponible | no aplica | Apache 2.0 | Hugging Face, diffusers |
| Tongyi-MAI/Z-Image | Modelo base texto-a-imagen | no disponible | no aplica | no disponible en la informacion | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Variante Turbo del modelo base | no disponible | no aplica | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El autor advierte que terminos genericos como "woman" o "1girl" no funcionan; es obligatorio usar el trigger `vrtl` junto al nombre completo.
- Para nombres ambiguos hay que anadir el genero en el prompt; para nombres censurados o poco conocidos por el modelo, conviene eliminar el nombre real y usar solo el trigger.
- La generacion de identidades de personas reales plantea riesgos de suplantacion, deepfakes y uso no consentido de la imagen; la licencia Apache 2.0 no exime de las obligaciones legales sobre derechos de imagen y proteccion de datos.
- No se documentan sesgos demograficos, de genero ni culturales del modelo base ni de los adaptadores.
- Riesgo de alucinacion visual: el modelo puede generar rasgos faciales inconsistentes o mezclar identidades al combinar triggers.
- No se especifican limitaciones de idioma en los prompts; la model card esta en ingles y los ejemplos usan prompts en ingles.
- El repositorio es muy grande (128,2 GB) y su descarga completa puede ser costosa; conviene seleccionar adaptadores individuales.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos o calidad de los adaptadores de forma sistematica.

## Enlaces

- Hugging Face: https://huggingface.co/nphSi/Z-Image-Lora
- Indice de LoRA con descarga, previsualizacion e informacion: https://huggingface.co/spaces/nphSi/Lookalike-LoRA-Index
- Discusiones y feedback: https://huggingface.co/nphSi/Z-Image-Lora/discussions
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Variante Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
