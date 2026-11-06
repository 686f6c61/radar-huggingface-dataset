# artem7820/vktr4-krea2-character-v3

## Resumen

`artem7820/vktr4-krea2-character-v3` es un adaptador LoRA de tipo DreamBooth para generación de imágenes texto-a-imagen, entrenado sobre el checkpoint base `krea/Krea-2-Raw` y pensado para ejecutarse sobre el checkpoint destilado `krea/Krea-2-Turbo`. Lo publica el usuario artem7820 en Hugging Face y su función es fijar la identidad visual de un personaje concreto (probablemente un personaje de ficción o un diseño original) para que el modelo base lo reproduzca de forma consistente a partir de la palabra disparadora `TOK`. El repositorio ocupa 1,8 GB y contiene pesos en formato safetensors compatibles con la librería `diffusers`.

El modelo no es un modelo fundacional, sino un adaptador de bajo rango que se carga encima del pipeline `Krea2Pipeline`. Su relevancia práctica radica en que permite personalizar un modelo de difusión moderno sin reentrenar el base: se entrena sobre RAW (no destilado) y se infiere sobre Turbo con solo 8 pasos y sin classifier-free guidance, lo que reduce drásticamente el coste de inferencia. Es, por tanto, una pieza útil para flujos de trabajo de generación de personajes consistentes en producción.

La información pública disponible es escasa: la model card es la plantilla automática generada por el script de entrenamiento de diffusers, con secciones TODO sin completar. No se detallan datos de entrenamiento, número de pasos, resolución, composición del dataset ni métricas de calidad. Todo lo que sigue se basa en los metadatos del repositorio y en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión texto-a-imagen Krea 2; pipeline `Krea2Pipeline` en diffusers |
| Parametros totales | no disponible (el adaptador LoRA no declara su rango ni el número de parámetros entrenables) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a difusión; la longitud de prompt no está documentada) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y el ejemplo de uso carga el base en `bfloat16` |
| Idiomas soportados | no disponible (el prompt de texto del pipeline base no está documentado en esta ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA); repo de 1,8 GB |
| Modelo base | `krea/Krea-2-Raw` (entrenamiento) y `krea/Krea-2-Turbo` (inferencia) |
| Palabra disparadora | `TOK` |
| Pasos de inferencia recomendados | 8 (receta Turbo), `guidance_scale=0.0` |
| Librería | diffusers |
| Descargas / likes | 18 descargas, 0 likes (a fecha de los metadatos) |
| Fecha de creacion / actualizacion | 2026-10-27 / 2026-10-27 |

## Arquitectura y entrenamiento

El adaptador se entrena con DreamBooth sobre `krea/Krea-2-Raw`, el checkpoint no destilado de la familia Krea 2, utilizando el script de entrenamiento oficial de diffusers para Krea 2 (`examples/dreambooth/README_krea2.md`). La técnica DreamBooth asocia una palabra disparadora poco frecuente (`TOK`) con la identidad visual del sujeto, de modo que el modelo aprende a generar ese personaje cuando aparece el token en el prompt. Al ser un LoRA, solo se actualizan matrices de bajo rango inyectadas en las capas de atención del UNet/transformer del modelo base, lo que mantiene el coste de entrenamiento y el tamaño del artefacto muy por debajo del de un fine-tuning completo.

La particularidad del ecosistema Krea 2 es su doble checkpoint: RAW para entrenar y Turbo (destilado a 8 pasos) para inferir. Según la model card, los LoRA entrenados sobre RAW "se expresan con fuerza" sobre Turbo, lo que permite combinar la fidelidad del entrenamiento con la velocidad de la inferencia destilada. No se documentan en la información disponible el número de imágenes de entrenamiento, la resolución, el número de pasos, el learning rate, el rango del LoRA ni si hubo regularización con imágenes de clase. Tampoco se indica si el dataset contiene una sola identidad o varias poses/expresiones.

## Capacidades

- Generación de imágenes texto-a-imagen de un personaje concreto condicionada por la palabra disparadora `TOK`.
- Personalización de identidad: reproduce el sujeto aprendido en nuevas poses, escenas e iluminaciones, siempre que el prompt incluya `TOK`.
- Inferencia rápida: compatible con la receta Turbo de 8 pasos y `guidance_scale=0.0`, sin classifier-free guidance.
- Composición con otros LoRA: al ser un adaptador estándar de diffusers, se puede cargar, ponderar, fusionar y combinar con otros adaptadores mediante `load_lora_weights` y las utilidades de `PeftAdapterMixin`.
- Integración con el ecosistema diffusers: funciona con `Krea2Pipeline` y con las herramientas de carga de adaptadores de la librería.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; no aplican a un modelo de difusión.

## Casos de uso

- Generación de arte conceptual de personaje: usar `TOK` junto con descripciones de escena para producir variaciones coherentes del personaje en distintas ambientaciones, aprovechando que el LoRA fija la identidad y el prompt libre controla el contexto.
- Storyboarding e ilustración secuencial: generar varias viñetas del mismo personaje manteniendo consistencia visual entre ellas, algo crítico en cómic, animación o preproducción audiovisual.
- Creación de assets para videojuegos: producir retratos, sprites o ilustraciones promocionales del personaje con la receta Turbo de 8 pasos para iterar rápido en fases de diseño.
- Prototipado de merchandising: generar mockups de camisetas, posters o figuras con el personaje aplicado a distintos soportes, usando el LoRA como capa de identidad sobre el modelo base.
- Contenido para redes sociales o fan art: iterar sobre poses y estilos con bajo coste computacional gracias a la inferencia destilada, útil para creadores que necesitan volumen.
- Pruebas de concepto de personalización: servir como ejemplo reproducible de un pipeline DreamBooth + LoRA sobre Krea 2 para equipos que quieran entrenar sus propios adaptadores de personaje siguiendo el mismo flujo.
- Integración en herramientas de generación locales: cargar el LoRA en un pipeline `diffusers` en una GPU de consumo para flujos de trabajo offline, dado el reducido tamaño del adaptador (1,8 GB) frente a un fine-tuning completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del checkpoint base Krea 2 (RAW/Turbo) cargado en `bfloat16`, no del LoRA, que añade una sobrecarga mínima. El adaptador en sí ocupa 1,8 GB en disco.
- GPU recomendadas: no especificadas en la información disponible. Por el patrón habitual de pipelines de difusión en `bfloat16`, se requeriría una GPU con suficiente VRAM para el modelo base; no se confirma compatibilidad con GPU de consumo concretas.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño del LoRA es reducido, pero el requisito real lo marca el checkpoint base, cuyo tamaño no se documenta en esta ficha.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` (único método documentado en la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión.
- Latencia y throughput: no disponibles. La receta Turbo de 8 pasos sugiere una inferencia sustancialmente más rápida que un muestreo estándar de 20-50 pasos, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación cuantitativa. Como referencia cualitativa, se trata de un adaptador DreamBooth LoRA sobre Krea 2, categoría equiparable a otros LoRA de personaje publicados para modelos de difusión (por ejemplo, adaptadores sobre SDXL o Flux), pero no se dispone de datos verificables para tabular la comparación.

## Limitaciones y advertencias

- La model card es la plantilla automática del entrenador de diffusers: las secciones de usos previstos, sesgos, limitaciones y detalles de entrenamiento están sin completar (TODO). No hay documentación del dataset ni del proceso.
- Riesgo de sobreajuste al sujeto de entrenamiento: al ser un LoRA de personaje con palabra disparadora, puede degradar la diversidad de poses o estilos si el dataset era reducido.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible o artefactos, especialmente en prompts complejos o con muchos sujetos.
- Consistencia de identidad no garantizada: sin datos de entrenamiento no se puede evaluar la fidelidad del personaje en ángulos o expresiones no vistas.
- Licencia Apache 2.0 en el adaptador, pero conviene verificar la licencia del modelo base Krea 2 (RAW/Turbo) antes de uso comercial, ya que las condiciones del base pueden imponer restricciones adicionales.
- Idiomas y longitud de prompt no documentados: no se puede asegurar el comportamiento con prompts en castellano ni con descripciones largas.
- Sin métricas de calidad publicadas: no hay FID, CLIP score ni evaluaciones humanas que respalden el rendimiento del adaptador.
- Repositorio con muy poca tracción (18 descargas, 0 likes): no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artem7820/vktr4-krea2-character-v3
- Modelo base (entrenamiento): https://huggingface.co/krea/Krea-2-Raw
- Modelo base (inferencia): https://huggingface.co/krea/Krea-2-Turbo
- DreamBooth (paper): https://dreambooth.github.io/
- Script de entrenamiento DreamBooth para Krea 2 en diffusers: https://github.com/huggingface/diffusers/blob/main/examples/dreambooth/README_krea2.md
- Documentación de carga de LoRA en diffusers: https://huggingface.co/docs/diffusers/main/en/using-diffusers/loading_adapters
