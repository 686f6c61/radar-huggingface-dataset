# distilan/sb-image-loras

## Resumen

`distilan/sb-image-loras` es una colección de LoRAs de personaje para los modelos **EVE** y **Evie** del videojuego *Stellar Blade* (incluido su DLC *Blood Rain*), publicada por el usuario distilan. No se trata de un modelo generativo completo, sino de un conjunto de adaptadores de bajo rango que se aplican sobre tres modelos base de difusión texto-a-imagen distintos: Krea 2, MOSS-Image y Anima. El repositorio ocupa 1,2 GB y contiene cuatro archivos `.safetensors`, cada uno asociado a un modelo base y a un personaje concreto.

La relevancia de esta publicación es práctica: permite reproducir con fidelidad los diseños de dos personajes del juego en pipelines de generación de imágenes basados en difusión, con independencia del modelo base elegido. Cada LoRA emplea una palabra disparadora específica (`stelleve9` para EVE y `evieblade6` para Evie) que debe incluirse en el prompt para activar el concepto aprendido. La licencia MIT facilita su uso tanto en experimentación como en proyectos derivados.

El repositorio no documenta arquitectura interna, número de parámetros de los adaptadores ni datos de entrenamiento; la model card se limita a instrucciones de uso, archivos disponibles, valores de fuerza recomendados y prompts de ejemplo. La información técnica disponible es, por tanto, escasa y se detalla a continuación con las limitaciones correspondientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelos de difusión texto-a-imagen |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusión) |
| Tipos de cuantización | no disponible; se distribuyen pesos en safetensors (precisión nativa del adaptador) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | MIT |
| Formato de pesos | `.safetensors` (4 archivos, 1,2 GB en total) |

Modelos base compatibles y archivos incluidos:

| Archivo | Personaje | Modelo base | Estado según el autor |
|---|---|---|---|
| `stelleve9-krea2.safetensors` | EVE | Krea 2 (probado en Krea 2 Turbo) | Probado en Krea 2 Turbo; debería funcionar en Krea 2 Raw, sin probar |
| `evieblade6-krea2.safetensors` | Evie | Krea 2 (probado en Krea 2 Turbo) | Probado en Krea 2 Turbo; debería funcionar en Krea 2 Raw, sin probar |
| `evieblade6-moss.safetensors` | Evie | MOSS-Image (MOSS-Image-SFT) | Funciona con MOSS-Image-SFT, solo o con el LoRA DMD de 8 pasos; probablemente con MOSS-Image-Base, sin probar |
| `stelleve9-anima.safetensors` | EVE | Anima (`anima-base-v1.0.safetensors`) | Funciona con Anima Base |

## Arquitectura y entrenamiento

Cada archivo es un adaptador LoRA pensado para inyectarse en las capas de atención de un modelo de difusión texto-a-imagen. La model card no especifica el rango, el alpha, las capas objetivo ni el número de pasos de entrenamiento. Tampoco se documenta el dataset utilizado (número de imágenes, resolución, composición, uso de regularización o de captions automáticos). Lo único verificable es el mecanismo de activación mediante palabras disparadoras: `stelleve9` para EVE y `evieblade6` para Evie, que deben aparecer en el prompt en la posición donde se nombraría al personaje.

El autor indica que la fuerza recomendada es 1.0 para mantener el estilo artístico fiel al juego, y que valores más bajos (0.8, 0.6, 0.4) permiten reinterpretar el personaje en estilos como anime, cómic DC/Marvel o acuarela, describiendo el estilo en el prompt. Este comportamiento es consistente con LoRAs de concepto/identidad entrenados con pocas imágenes y sin un pipeline de RLHF ni preferencias humanas, algo que no aplica a este tipo de adaptadores.

## Capacidades

- Generación de imágenes de los personajes EVE y Evie de *Stellar Blade* con fidelidad al diseño del juego cuando se usa fuerza 1.0.
- Aplicación sobre tres modelos base distintos: Krea 2 (Turbo y presumiblemente Raw), MOSS-Image (SFT y presumiblemente Base) y Anima Base.
- Combinación de dos LoRAs en un mismo prompt para generar escenas con ambos personajes (por ejemplo, cargando `stelleve9` y `evieblade6` a la vez).
- Reinterpretación estilística del personaje bajando la fuerza del adaptador y describiendo el estilo deseado en el prompt (anime, cómic, acuarela).
- Compatibilidad con el LoRA DMD de 8 pasos de MOSS-Image, encadenando ambos adaptadores en ComfyUI.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es un adaptador puramente visual.
- No se documentan capacidades multilingües ni de otro tipo.

## Casos de uso

- **Ilustración de fan art de alta fidelidad:** cargando el LoRA correspondiente sobre Krea 2 Turbo a fuerza 1.0 y usando la palabra disparadora, se obtienen representaciones del personaje coherentes con su diseño oficial, útil para comunidades de fans y portfolios.
- **Prototipado de escenas para proyectos derivados:** combinando el LoRA de EVE con el de Evie en un mismo prompt se pueden generar escenas con ambos personajes, como el ejemplo "Girls on vacation" de la model card, útil para guiones gráficos o moodboards.
- **Exploración de estilos visuales:** bajando la fuerza a 0.4-0.8 y describiendo el estilo (anime, cómic, acuarela) se pueden generar variaciones artísticas del personaje para estudios de dirección de arte.
- **Generación de material promocional no oficial:** con licencia MIT, se pueden producir imágenes para blogs, vídeos o redes sociales de temática *Stellar Blade*, siempre respetando los derechos de la IP original del videojuego.
- **Pruebas comparativas entre modelos base:** al existir versiones para Krea 2, MOSS-Image y Anima, el repositorio sirve para evaluar cómo un mismo concepto se comporta en tres backbones distintos con el mismo prompt.
- **Integración en flujos ComfyUI:** mediante el nodo `LoraLoaderModelOnly` entre el cargador de modelo y el sampler, se puede incorporar el adaptador en pipelines de generación por lotes o en herramientas internas de creación de contenido.
- **Investigación sobre LoRAs de identidad:** el repositorio puede servir como caso de estudio de cómo se comportan adaptadores de personaje a distintas fuerzas y sobre distintos backbones, aunque carece de documentación de entrenamiento para un análisis riguroso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, similitud de identidad) ni comparaciones numéricas con otros LoRAs de personaje.

## Requisitos de hardware

- **VRAM estimada:** no disponible en la información proporcionada. Depende enteramente del modelo base sobre el que se aplique el LoRA (Krea 2, MOSS-Image o Anima) y de la precisión de carga; el adaptador en sí ocupa una fracción del 1,2 GB total del repositorio.
- **GPU recomendadas:** no especificadas por el autor. Al ser adaptadores sobre modelos de difusión, los requisitos vienen determinados por el backbone, no por el LoRA.
- **Compatibilidad con GPU de consumo:** no confirmada en la documentación; dependerá del modelo base y de la cuantización aplicada al mismo.
- **Opciones de despliegue:** el autor documenta explícitamente ComfyUI (nodo `LoraLoaderModelOnly`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusión.
- **Latencia y throughput:** no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRAs de personaje comparables ni datos que permitan establecer una comparación rigurosa en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- **Datos técnicos ausentes:** no se documentan rango, alpha, capas objetivo, dataset ni proceso de entrenamiento, lo que dificulta reproducir o auditar el adaptador.
- **Cobertura desigual:** MOSS-Image solo tiene LoRA de Evie y Anima solo tiene LoRA de EVE; no existe versión de EVE para MOSS-Image ni de Evie para Anima.
- **Compatibilidad parcial no verificada:** el autor indica que los LoRAs de Krea 2 "deberían" funcionar en Krea 2 Raw y que el de MOSS-Image "probablemente" funcione en MOSS-Image-Base, pero no lo ha probado.
- **Riesgo de sobreajuste al estilo del juego:** a fuerza 1.0 el resultado se adhiere al estilo original; para otros estilos hay que bajar la fuerza, lo que puede degradar la fidelidad de identidad.
- **Dependencia del prompt:** sin la palabra disparadora (`stelleve9` o `evieblade6`) el LoRA no activa el concepto; la calidad depende también de la descripción detallada del resto de la escena.
- **Propiedad intelectual:** aunque la licencia del repositorio es MIT, los personajes EVE y Evie son propiedad de sus titulares (Shift Up / *Stellar Blade*); el uso comercial de las imágenes generadas puede estar sujeto a restricciones ajenas a la licencia del LoRA.
- **Sin datos de sesgo ni alucinación:** al ser un modelo de difusión, no aplican los conceptos habituales de alucinación textual, pero sí pueden aparecer artefactos visuales, deformaciones anatómicas o inconsistencias en el atuendo, no evaluadas en la documentación.
- **Idiomas no documentados:** la model card no especifica si los prompts funcionan en otros idiomas distintos del inglés; los ejemplos están todos en inglés.
- **Repo sin tracción:** 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/distilan/sb-image-loras
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA DMD de 8 pasos para MOSS-Image: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
