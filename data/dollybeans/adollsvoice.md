# dollybeans/ADollsVoice

## Resumen

ADollsVoice es un checkpoint de generación de imágenes por texto (text-to-image) publicado por el usuario dollybeans en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusión (merge) de checkpoints derivados de dos modelos base: OnomaAIResearch/Illustrious-xl-early-release-v0 (familia Illustrious, orientada a anime) y circlestone-labs/Anima. El objetivo declarado del autor es generar retratos estilizados de personajes masculinos ("pretty boys") y temáticas BL/MLM con un control fino sobre el resultado.

El modelo se distribuye como checkpoint para pipelines de difusión (Stable Diffusion) y está pensado para su uso en interfaces como Automatic1111, ComfyUI o Forge, no como modelo de lenguaje. La model card recomienda ajustes concretos de muestreo (sampler euler a o DPM++ 2M Karras, entre 25 y 30 pasos, CFG entre 4 y 7) y sugiere variantes de mezcla según el estilo deseado: semi-realismo, anime o una combinación de ambos.

La relevancia es acotada: se trata de un merge comunitario con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con una model card muy escueta centrada en recomendaciones de uso más que en documentación técnica. No hay información publicada sobre dataset, proceso de entrenamiento, benchmarks ni evaluación cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | difusión text-to-image (checkpoint derivado de Illustrious XL y Anima; detalles de la arquitectura interna no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de difusión; la longitud de prompt depende del codificador de texto, no especificado) |
| Tipos de cuantizacion | no disponible (formato de checkpoint completo; no se documentan variantes GGUF, FP8 ni similares) |
| Idiomas soportados | no disponible (los prompts suelen funcionar en inglés por herencia de los modelos base, pero no se declara) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint para pipeline text-to-image; extensión concreta no indicada en la información) |

## Arquitectura y entrenamiento

El modelo es un merge de checkpoints, no un entrenamiento desde cero. Según la model card, combina pesos de la familia Illustrious (juicy base, homosimile v4.0, boytakudream merge v4, tsrmix v6, kageillustruous v9 y cottomix) con pesos de la familia Anima (bonsai beta, homosimile anima v2 y kageanima v1). Todos ellos son checkpoints comunitarios publicados en Civitai y Tensor.Art, lo que sitúa a ADollsVoice en la estela de los merges de Stable Diffusion orientados a estilos concretos.

No se documenta el método de fusión (ponderaciones, block merge, interpolación lineal u otras técnicas), ni el volumen de datos, ni si hubo fine-tuning posterior, RLHF o ajuste por preferencias. Tampoco se indica qué codificador de texto o VAE emplea, aunque por herencia de Illustrious XL y Anima se trata de pipelines de difusión con codificador de texto tipo CLIP/T5, sin confirmación explícita en la información disponible.

## Capacidades

- Generación de imágenes a partir de prompts de texto, con foco declarado en personajes masculinos estilizados y temáticas BL/MLM.
- Control de estilo mediante la elección de la mezcla: la model card distingue entre semi-realismo (variante "old spice"), anime (variantes "axe choco" o "mint") y una mezcla de ambos ("axe chocomix").
- Compatibilidad con muestreadores habituales de difusión: euler a, DPM++ 2M Karras, DPM++ 2M y er sde con schedulers simple o beta.
- Ajuste de pasos (25-30) y CFG (4-7) recomendados por el autor para obtener resultados estables.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo; no aplica a un modelo de difusión de imágenes.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Ilustración de personajes masculinos para proyectos de ficción: el modelo está específicamente ajustado para generar "pretty boys", por lo que resulta adecuado para diseñar protagonistas y secundarios de novelas, cómics o fanarts con un estilo consistente.
- Contenido BL/MLM para comunidades de fanart: la model card declara explícitamente este enfoque, lo que lo hace útil para creadores que necesitan representaciones de parejas masculinas con control estilístico.
- Prototipado rápido de conceptos visuales: con 25-30 pasos y CFG 4-7, la generación es relativamente rápida en GPUs de consumo, lo que permite iterar sobre variantes de diseño antes de un render final.
- Creación de avatares y retratos estilizados: el foco en rostros masculinos permite usarlo para generar avatares de perfil con estética anime o semi-realista.
- Generación de referencias para artistas: útil como punto de partida para bocetos o paletas de color que luego se refinan manualmente.
- Pruebas comparativas de merges comunitarios: investigadores o entusiastas que estudian el efecto de las fusiones de checkpoints pueden usar este modelo como caso de estudio dentro de la familia Illustrious/Anima.
- Integración en pipelines de ComfyUI o Automatic1111: al ser un checkpoint estándar de difusión, puede cargarse en estas interfaces para flujos de trabajo automatizados de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; al tratarse de un checkpoint de difusión de la familia Illustrious XL, es razonable esperar requisitos en el rango de 6-12 GB según resolución y precisión, pero este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponibles. Por herencia de los modelos base, cabría esperar funcionamiento en RTX 3060, RTX 4070, RTX 4090, A100 o H100, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; la model card no menciona requisitos de hardware.
- Opciones de despliegue: no documentadas. Al ser un checkpoint de difusión, los entornos habituales serían Automatic1111, ComfyUI, Forge o InvokeAI, pero no se indica compatibilidad explícita con vLLM, llama.cpp, Ollama ni TGI (herramientas no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dollybeans/ADollsVoice | no disponible | no aplica | sin benchmarks | no disponible | Hugging Face (0 descargas) |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | no disponible | no aplica | sin datos en esta ficha | no disponible | Hugging Face (modelo base) |
| circlestone-labs/Anima | no disponible | no aplica | sin datos en esta ficha | no disponible | Hugging Face (modelo base) |
| homosimile v4.0 | no disponible | no aplica | sin datos en esta ficha | no disponible | Civitai (checkpoint comunitario) |

La comparativa cuantitativa no es posible con la información disponible: ninguno de los modelos de referencia publica parámetros, contexto o benchmarks en los datos consultados.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se especifican permisos de uso comercial, modificación ni redistribución, lo que supone un riesgo legal para cualquier uso en producción.
- Sin información sobre sesgos: no se documenta la composición del dataset ni posibles sesgos de representación, algo especialmente relevante en un modelo enfocado a un nicho concreto.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomías incorrectas, artefactos en manos y rostros, o elementos incoherentes con el prompt.
- Limitaciones de idioma no declaradas: no se confirma qué idiomas acepta el codificador de texto; los prompts en castellano podrían funcionar peor que en inglés.
- Modelo con cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa de calidad.
- La model card es escueta y no documenta el proceso de merge, los pesos relativos ni el VAE o codificador de texto empleados, lo que dificulta la reproducibilidad.
- El autor recomienda variantes concretas ("old spice", "axe choco", "axe chocomix") sin especificar qué archivos corresponden a cada una en el repositorio.
- Uso previsto restringido a generación de imágenes; no es adecuado para tareas de lenguaje, razonamiento o código.

## Enlaces

- Hugging Face: https://huggingface.co/dollybeans/ADollsVoice
- Modelo base Illustrious XL: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Juicy base (Tensor.Art): https://tensor.art/models/971390692020460799
- Homosimile v4.0 (Civitai): https://civitai.com/models/964011?modelVersionId=1837143
- Boytakudream merge v4 (Civitai): https://civitai.com/models/1374476/boytakudream-merge
- Tsrmix v6 (Civitai): https://civitai.com/models/2013051/tsrmix
- Kageillustruous v9 (Civitai): https://civitai.com/models/1219622?modelVersionId=2742412
- Cottomix (Tensor.Art): https://tensor.art/models/969348989122010470
- Bonsai beta (Civitai): https://civitai.red/models/2594596/bonsai
- Homosimile Anima v2 (Civitai): https://civitai.red/models/2708104/homosimile-anima
- Kageanima v1 (Civitai): https://civitai.red/models/2910285/kageanima
