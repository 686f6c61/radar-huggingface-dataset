# RunningHubAI/rh-kissing-together-minimax-h3-lora

## Resumen

rh-kissing-together-minimax-h3-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por RunningHubAI sobre el modelo base MiniMax H3, orientado a la generacion de video a partir de imagen (image-to-video, I2V). Su funcion concreta es inducir una animacion de dos personas que se acercan y se besan de forma mutua y natural, preservando la composicion y apariencia de la imagen de entrada. No es un modelo de lenguaje ni un modelo fundacional: es un peso adicional de bajo rango que modifica el comportamiento del modelo base MiniMax H3 dentro de flujos de ComfyUI.

El repositorio tiene un tamano de 0,3 GB y contiene un unico archivo de pesos, `kissing_together_v1.safetensors`, de 296 MiB. Se activa mediante la palabra disparadora `kiss_tg` y esta pensado para usarse con una fuerza recomendada de entre 0,8 y 1,0. La model card indica que esta ajustado a partir de `minimax-h3` y que puede cargarse tanto en ComfyUI como en la plataforma RunningHub.

La relevancia de esta ficha es acotada: se trata de un artefacto creativo de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, sin licencia explicita y sin idiomas declarados. No debe confundirse con un modelo generativo completo ni evaluarse con los criterios habituales de un LLM; sus especificaciones tecnicas dependen casi por completo del modelo base MiniMax H3, del cual la informacion proporcionada no incluye detalles de arquitectura, parametros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base MiniMax H3; arquitectura del base no disponible |
| Parametros totales | no disponible (peso LoRA de 296 MiB; parametros del base no disponibles) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base MiniMax H3) |
| Tipos de cuantizacion | no disponible; el unico peso publicado es `safetensors` |
| Idiomas soportados | no disponible (la activacion es mediante palabra disparadora `kiss_tg`, no linguistica) |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (`kissing_together_v1.safetensors`, 296 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni la del modelo base MiniMax H3. Por el tipo de artefacto (tag `lora` y plataforma `comfyui`), se trata de un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para especializarlo en un movimiento concreto: el acercamiento y beso entre dos sujetos. El repositorio no incluye informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El unico dato operativo de entrenamiento es que el modelo se ajusto a partir de `minimax-h3` y que la plataforma RunningHub ofrece servicios de entrenamiento de modelos. La model card no detalla hiperparametros, rango del LoRA, alpha ni pasos de entrenamiento. Tampoco se especifica si el adaptador se entreno sobre pares imagen-video reales o sinteticos, ni cuantas muestras se utilizaron.

## Capacidades

- Generacion de video a partir de imagen (image-to-video): anima una imagen estatica de dos personas para producir una interaccion de beso mutuo.
- Preservacion de la composicion: la model card indica que el LoRA guia la interaccion "preservando la apariencia y composicion general de la imagen de origen".
- Control mediante palabra disparadora: la activacion se realiza anadiendo `kiss_tg` al prompt.
- Ajuste de intensidad: fuerza recomendada entre 0,8 y 1,0 para modular el efecto del adaptador.
- Integracion en ComfyUI y RunningHub: se carga como peso LoRA en flujos de generacion de video.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, modo thinking, audio ni multilingues.

## Casos de uso

- Produccion de clips creativos para redes sociales: a partir de una imagen fija de dos personas, el LoRA genera una animacion breve de beso que puede insertarse en un montaje o storyboard, gracias a la preservacion de la composicion de la imagen de origen.
- Previsualizacion de escenas en animacion o cine: directores y animadores pueden probar rapidamente como funcionaria una escena romantica antes de invertir en produccion completa, usando el adaptador sobre MiniMax H3 en ComfyUI.
- Prototipado de narrativas visuales: guionistas y creadores de contenido pueden iterar sobre una misma imagen de partida variando el prompt y la fuerza del LoRA (0,8-1,0) para explorar distintas intensidades de la interaccion.
- Ilustracion editorial y storyboards: generacion de frames animados para presentaciones o pitches creativos donde se necesita mostrar una interaccion afectiva entre dos personajes.
- Experimentacion artistica con LoRA: investigadores y artistas pueden estudiar como un adaptador de bajo rango modifica el comportamiento de un modelo de video base, comparando resultados con y sin `kiss_tg`.
- Demostraciones y pruebas de concepto en RunningHub: el modelo puede probarse en linea mediante la plataforma del autor sin necesidad de infraestructura propia, util para evaluar su idoneidad antes de integrarlo en un pipeline local.
- Contenido de entretenimiento generado por IA: creacion de animaciones ficticias para juegos, avatares o experiencias interactivas, siempre dentro de los limites de la exencion de responsabilidad de la model card (nada de personas reales, celebridades ni contenido NSFW).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el LoRA de forma aislada; depende del modelo base MiniMax H3, cuyos requisitos no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el peso LoRA ocupa solo 296 MiB, pero el modelo base debe caber en memoria junto con el pipeline de video.
- Opciones de despliegue: ComfyUI, plataforma RunningHub (local e internacional) y Hugging Face como repositorio de pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de video comparables ni datos de rendimiento que permitan una comparacion cuantitativa. Como referencia estructural, se trata de un adaptador de bajo rango sobre MiniMax H3, pero no se dispone de especificaciones de alternativas como para construir una tabla fiable.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream, por lo que el uso comercial no esta garantizado y debe verificarse con el autor.
- Dependencia total del modelo base: el LoRA no funciona de forma autonoma; requiere MiniMax H3 y su pipeline de video, cuyas especificaciones y licencia no se detallan.
- Alcance muy restringido: esta especializado en una unica interaccion (beso entre dos personas); no es un modelo generalista.
- Requisito de imagen de entrada: la model card exige que la imagen contenga dos personas lo suficientemente cerca como para interactuar de forma natural; imagenes con una sola persona o composiciones incompatibles daran resultados pobres.
- Riesgo de resultados no deseados: como todo modelo generativo de video, puede producir artefactos, deformaciones o transiciones poco naturales, especialmente con prompts ambiguos o fuerzas fuera del rango 0,8-1,0.
- Restricciones eticas explicitas: el autor prohibe generar contenido NSFW, danino o ilegal, en especial con personas reales o celebridades; el modelo se declara ficticio y para entretenimiento.
- Sin datos de sesgo, alucinacion o rendimiento: no hay informacion publicada sobre sesgos, evaluaciones de calidad ni metricas objetivas.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-kissing-together-minimax-h3-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2098860886564167682
- Pagina del autor: https://www.runninghub.ai/user-center/1998418914667286530
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- Discord de soporte: https://discord.gg/6Y3XcMu3aE
- Discord para modelos personalizados: https://discord.gg/e5TwfRdsCA
