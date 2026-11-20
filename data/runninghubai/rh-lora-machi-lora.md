# RunningHubAI/rh-lora-machi-lora

## Resumen

`rh-lora-machi-lora` es un adaptador LoRA de generación de imágenes a partir de texto (text-to-image) publicado por RunningHubAI en Hugging Face. No se trata de un modelo base autónomo, sino de un conjunto de pesos de ajuste fino (81 MiB en un único archivo `20261119-43240056_000002256.safetensors`) pensado para cargarse sobre el modelo Z-Image dentro de ComfyUI o de la plataforma RunningHub. Su función concreta es inyectar un estilo y una identidad visual muy específicos: una joven virtual de pelo largo, liso y gris ceniza, flequillo recto, piel melocotón y labios rosados.

El modelo resuelve un problema acotado dentro de los flujos de trabajo de generación de imágenes: la consistencia de un personaje o estética determinada sin necesidad de reentrenar el modelo base. Al ser un LoRA de pequeño tamaño, se puede combinar con el checkpoint Z-Image y activar mediante una palabra de disparo (trigger word) que describe con detalle el aspecto del personaje, lo que permite reproducir esa misma figura en distintas composiciones y escenas.

La relevancia de esta ficha es limitada en el contexto de modelos de lenguaje: no es un LLM, no procesa texto como entrada principal ni genera código, y su ecosistema es el de la difusión de imágenes. Aun así, se documenta con el mismo rigor porque forma parte del catálogo de adaptadores que los desarrolladores pueden encontrar al integrar pipelines de imagen en ComfyUI o en la API de RunningHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Z-Image; no disponible el detalle de la arquitectura interna del base |
| Parametros totales | no disponible (el archivo de pesos ocupa 81 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la palabra de disparo está en chino; el pipeline es text-to-image) |
| Licencia | no disponible (la model card indica que se sigue la licencia del proyecto original o upstream) |
| Formato de pesos | safetensors |
| Modelo base | Z-Image (según la model card) |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones de un modelo de difusión base. La model card indica explícitamente que está ajustado a partir de Z-Image, pero no detalla la arquitectura de ese modelo base (tipo de UNet, transformer de difusión, número de bloques, dimensión latente, etc.), por lo que ese dato queda como no disponible. Tampoco se especifican el número de pasos de entrenamiento, el tamaño del dataset, la composición de las imágenes de entrenamiento ni si se aplicaron técnicas como regularización o captions automáticos.

El único dato técnico concreto sobre el entrenamiento es la palabra de disparo (trigger word), que es una descripción larga en chino del personaje: pelo largo y liso gris ceniza, flequillo recto, piel melocotón, ojos marrones, pestañas largas, sonrisa suave y labios rosados. Esto sugiere que el LoRA fue entrenado con captions descriptivos y que la activación del estilo depende de incluir esa frase (o una equivalente) en el prompt. No hay información sobre el uso de RLHF, DPO ni de innovaciones como decodificación especulativa, atención lineal o destilación.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) mediante el pipeline de difusión del modelo base Z-Image.
- Inyección de un personaje o estética concreta: joven virtual de pelo gris ceniza, flequillo recto, piel clara y labios rosados.
- Activación mediante palabra de disparo en chino, que describe el aspecto del personaje con detalle.
- Integración en flujos de ComfyUI como nodo LoRA junto al checkpoint base.
- Ejecución en la plataforma RunningHub, tanto en la versión internacional como en la china.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión como entrada ni modo thinking; no es un modelo de lenguaje.
- Capacidades multilingües: no disponible; el pipeline es de imagen y la palabra de disparo está en chino.

## Casos de uso

- **Creación de personajes consistentes para ilustración**: cargar el LoRA sobre Z-Image en ComfyUI y usar la palabra de disparo para generar la misma joven virtual en distintas poses, escenas e iluminaciones, manteniendo la identidad visual entre imágenes.
- **Prototipado rápido de avatares virtuales**: usar el adaptador para producir un set de retratos de un avatar con estética definida (pelo gris ceniza, flequillo recto) que sirva como base para un personaje de marca o de producto.
- **Generación de material para narrativa visual**: integrar el LoRA en un pipeline de cómic, novela ligera o storyboard donde se necesite repetir el mismo personaje en múltiples viñetas con coherencia de rasgos.
- **Pruebas de concepto en ComfyUI**: emplear el adaptador como ejemplo de LoRA de personaje para validar flujos de trabajo (workflows) de texto a imagen antes de entrenar adaptadores propios.
- **Automatización vía API de RunningHub**: invocar el modelo a través de la API de RunningHub para generar imágenes de forma programática dentro de una aplicación o servicio, sin gestionar la infraestructura de GPU.
- **Exploración de estilos en entornos educativos**: usar el LoRA como caso práctico para explicar cómo funciona el ajuste fino de bajo rango sobre modelos de difusión y cómo se activa mediante trigger words.
- **Generación de variaciones para selección creativa**: producir lotes de imágenes con el mismo personaje y distintos prompts de escena para que un equipo creativo elija la dirección visual definitiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la información proporcionada; depende del modelo base Z-Image y del pipeline de difusión, no del LoRA en sí (que solo añade 81 MiB de pesos).
- **GPU recomendadas**: no disponible; al no especificarse los requisitos del modelo base, no se puede confirmar compatibilidad con A100, H100, RTX 4090 u otras.
- **Compatibilidad con GPU de consumo**: no disponible; el LoRA es pequeño, pero el requisito real lo marca Z-Image.
- **Opciones de despliegue**: ComfyUI (carga del LoRA junto al checkpoint base), plataforma RunningHub (internacional y china) y API de RunningHub. No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este pipeline.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de personaje comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia no especificada**: la model card remite a la licencia del proyecto original o upstream, pero no la concreta; antes de un uso comercial es necesario verificar la licencia de Z-Image y la del propio adaptador.
- **Dependencia del modelo base**: el LoRA no funciona de forma autónoma; requiere cargar Z-Image y el pipeline de difusión correspondiente, lo que condiciona el hardware y el software necesarios.
- **Palabra de disparo en chino**: la activación del personaje depende de una frase descriptiva en chino; su traducción literal al castellano puede no reproducir el mismo efecto, por lo que conviene usar la cadena original.
- **Riesgo de sobreajuste al personaje**: al ser un LoRA de identidad muy específico, puede reducir la variedad de resultados y forzar el aspecto del personaje incluso cuando el prompt pida otra cosa.
- **Sesgos y contenido**: no hay información sobre la composición del dataset de entrenamiento ni sobre filtros de seguridad; existe riesgo de reproducir sesgos de representación (edad, etnia, género) presentes en los datos.
- **Alucinación visual**: como todo modelo generativo de imagen, puede producir anatomías incorrectas, manos deformes o incoherencias entre prompt y resultado; no hay métricas publicadas que cuantifiquen esta tasa.
- **Sin datos de rendimiento**: no se han publicado benchmarks ni evaluaciones objetivas, por lo que la calidad debe validarse empíricamente en el flujo de trabajo concreto.
- **Uso prohibido**: la model card declara que queda prohibido el uso ilegal o no conforme y que el responsable de las consecuencias legales es el usuario; se indica que es para comunicación y aprendizaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-lora-machi-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2123456234792079361
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/2068682407296716802
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-lora-machi-lora/blob/main/README_cn.md
