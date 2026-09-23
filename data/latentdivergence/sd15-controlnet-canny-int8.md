# latentdivergence/sd15-controlnet-canny-int8

## Resumen

sd15-controlnet-canny-int8 es una exportación a ONNX con cuantización int8 de Stable Diffusion 1.5 con ControlNet (canny), publicada por el usuario latentdivergence y pensada como backend de inferencia para la aplicación Latent Studio. No se trata de un modelo nuevo: los pesos derivan de stable-diffusion-v1-5/stable-diffusion-v1-5 y del ControlNet canny correspondiente, y el trabajo del autor consiste en el reempaquetado y la cuantización, no en entrenamiento.

El interés técnico de esta publicación está en cómo se ha trazado el grafo del UNet. Una exportación estándar de SD 1.5 expone solo tres entradas (sample, timestep y encoder_hidden_states), de modo que los residuales de ControlNet no tienen por dónde entrar y el condicionamiento por bordes no funciona, algo que, según el autor, también ocurre en exportaciones ONNX públicas de proyectos que dicen soportar ControlNet. Aquí el UNet se trazó a través de un wrapper cuyo forward() recibe los 13 tensores residuales como argumentos reales, de modo que el grafo expone down_block_additional_residuals.0 a .11 y mid_block_additional_residual, 16 entradas en total, verificadas tras la cuantización int8.

El repositorio ocupa 1,8 GB e incluye UNet y ControlNet en ONNX (con ficheros .onnx.data asociados), el text encoder, el VAE de codificación y decodificación y el tokenizer. La relevancia práctica es acotada pero concreta: permite ejecutar generación condicionada por bordes sobre SD 1.5 en entornos donde interesa un grafo ONNX autocontenido y pesos int8, por ejemplo despliegues en CPU o integraciones de escritorio, sin depender de un pipeline de diffusers que reconstruya los residuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (UNet + text encoder CLIP + VAE) con adaptador ControlNet; exportada a ONNX |
| Parámetros totales | No especificado en la model card; el UNet de SD 1.5 base ronda los 860 millones (dato del modelo base, no verificado en este repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens (límite del text encoder CLIP de SD 1.5; no especificado en la model card) |
| Tipos de cuantización | int8 en los grafos ONNX de UNet y ControlNet (según el nombre del repositorio y la model card); no se detalla el esquema exacto (por tensor, dinámica o estática) |
| Idiomas soportados | No disponible; el text encoder CLIP de SD 1.5 está entrenado principalmente en inglés |
| Licencia | creativeml-openrail-m (CreativeML Open RAIL-M) |
| Formato de pesos | ONNX: unet/model.onnx + unet/model.onnx.data, controlnet/model.onnx + controlnet/model.onnx.data, más text_encoder/, vae_decoder/, vae_encoder/ y tokenizer/ |
| Entradas del UNet | 16: sample, timestep, encoder_hidden_states, down_block_additional_residuals.0-.11 y mid_block_additional_residual |
| Entradas y salidas del ControlNet | 4 entradas, 13 salidas (residuales) |
| ControlNet incluido | canny (indicado en controlnet/type.txt) |
| Condicionamiento | controlnet_cond como tensor NCHW float en rango [0,1], no en el rango [-1,1] del VAE; el escalado de residuales lo aplica quien llama |
| Tamaño del repositorio | 1,8 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de SD 1.5: un UNet de difusión latente que opera sobre latentes del VAE, condicionado por embeddings de texto de un text encoder CLIP, más un adaptador ControlNet que inyecta condicionamiento espacial en forma de residuales añadidos a los bloques down y mid del UNet. Aquí no hay ningún entrenamiento adicional: el autor parte de los pesos del modelo base stable-diffusion-v1-5/stable-diffusion-v1-5, y el text encoder y el VAE se exportan desde la versión base, coherente con el UNet, en lugar de tomarlos de un fine-tune.

La innovación relevante es de empaquetado, no de modelado. El UNet se ha trazado a través de un wrapper que declara los 13 tensores de residuales como argumentos formales, lo que hace que el grafo ONNX los exponga como entradas reales y permite inyectar la salida del ControlNet sin reescribir el grafo. El ControlNet se exporta con 4 entradas y 13 salidas. Posteriormente, ambos grafos se someten a cuantización int8, y el autor afirma haber verificado que las 16 entradas del UNet siguen presentes tras la cuantización. No se documentan datos de entrenamiento, composición del dataset, número de tokens ni etapas de RLHF o DPO, porque no las hay: el modelo base ya viene preentrenado y esta publicación es una conversión.

Un detalle de integración que condiciona el uso: el tensor controlnet_cond debe estar en NCHW y normalizado a [0,1], no al rango [-1,1] habitual del VAE, y el escalado de los residuales queda a cargo del código que invoca el grafo. No se especifican los factores de escala empleados en el wrapper.

## Capacidades

- Generación de imágenes texto a imagen con SD 1.5 (resolución nativa de 512x512 píxeles del modelo base; no se documentan otras resoluciones).
- Generación condicionada por bordes (edge conditioning) mediante ControlNet canny, con la máscara de bordes como tensor float en [0,1].
- Preservación de estructura: al condicionar por mapa de bordes, se mantiene la silueta y la composición de una imagen de referencia o de un dibujo lineal.
- Ejecución de los grafos UNet y ControlNet de forma separada, con los residuales intercambiados explícitamente entre ellos.
- Inferencia sobre ONNX Runtime, lo que habilita despliegue fuera del ecosistema PyTorch/diffusers.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades ajenas a un modelo de difusión.
- No se documenta thinking mode, visión, audio, ni ningún otro modo especial.
- Capacidad multilingüe: no disponible; el condicionamiento textual depende del text encoder CLIP de SD 1.5, mayoritariamente inglés.

## Casos de uso

- Coloreado de line art y bocetos: se extrae el mapa de bordes canny de un dibujo a lápiz o tinta y se condiciona la generación con ese mapa para obtener una versión coloreada que respeta la estructura original.
- Previsualización arquitectónica: a partir de un alzado o una planta con líneas marcadas, el modelo genera variaciones de materiales y ambiente manteniendo la geometría del edificio fijada por el ControlNet canny.
- Diseño de producto y mockups: se dibuja la silueta de un envase o de un dispositivo, se genera el mapa de bordes y se producen variantes de acabado, color y textura sin que cambie la forma.
- Transferencia de estilo con estructura fija: se toma una fotografía, se calcula su mapa de bordes y se regenera en un estilo distinto (ilustración, acuarela, render 3D) conservando la composición exacta de la escena.
- Generación de assets para videojuegos: producir variantes de props y entornos a partir de un boceto de bordes, con la ventaja de que el grafo ONNX int8 puede ejecutarse en estaciones de trabajo sin GPU dedicada de gama alta.
- Integración en aplicaciones de escritorio: al ser un export ONNX autocontenido (UNet, ControlNet, VAE y tokenizer en disco), encaja en aplicaciones tipo Latent Studio que no quieran arrastrar el stack de PyTorch ni un pipeline de diffusers completo.
- Procesamiento por lotes en CPU: la cuantización int8 reduce la huella de memoria del repositorio a 1,8 GB, lo que permite encolar trabajos de renderizado condicionado en servidores sin acelerador.
- Control de composición en pipelines de img2img: para tareas donde el prompt por sí solo deriva en composiciones inestables, el mapa canny actúa como ancla estructural y reduce la variabilidad entre semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye FID, CLIP score, comparativas con el modelo sin cuantizar ni mediciones de latencia o throughput, y no hay métricas que cuantifiquen la pérdida de calidad introducida por la cuantización int8.

## Requisitos de hardware

- VRAM estimada: no disponible como medición publicada. Como referencia de orden de magnitud, el repositorio completo ocupa 1,8 GB, por lo que los pesos ocupan ese orden de magnitud y la memoria necesaria para cargarlos será algo superior.
- GPU recomendadas: no disponible; la model card no menciona hardware objetivo. El formato ONNX int8 sugiere despliegue con ONNX Runtime, que puede ejecutarse tanto en CPU como en GPU.
- GPU de consumo: no confirmado por el autor. Dado el tamaño del repositorio y la cuantización int8, es plausible que quepa en GPU de consumo con 4-6 GB de VRAM o más, pero es una estimación, no un dato verificado.
- Despliegue: ONNX Runtime es el runtime natural. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en general no aplican a modelos de difusión; tampoco se documenta compatibilidad directa con el pipeline de diffusers, ya que el grafo del UNet tiene 16 entradas y requiere que el código gestione los residuales y el escalado.
- Latencia y throughput: no disponibles.
- Aplicación de destino declarada: Latent Studio, sin más detalles ni enlaces en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | ControlNet canny | Residuales expuestos en el grafo UNet | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentdivergence/sd15-controlnet-canny-int8 | ONNX int8 | Sí, canny | Sí, 13 tensores como entradas reales (16 entradas totales) | creativeml-openrail-m | Repositorio HuggingFace con 0 descargas y 0 likes |
| Exportaciones públicas de SD 1.5 a ONNX | ONNX (precisión no especificada) | Según el autor, no ejecutable contra ellas porque el UNet no expone los residuales | No | Depende de cada publicación | No disponible en la información proporcionada |
| SD 1.5 + ControlNet en formato diffusers/safetensors | safetensors | Sí, disponible en el ecosistema diffusers | No aplica: la inyección se hace en código, no vía grafo ONNX | creativeml-openrail-m | Ampliamente difundido |
| Modelos de difusión de mayor tamaño con ControlNet (por ejemplo SDXL) | safetensors, ONNX en algunos casos | Sí | No disponible | Depende del modelo | No disponible |

No se dispone de datos de rendimiento comparados entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia creativeml-openrail-m: permite uso comercial, pero incluye restricciones de uso (prohibición de emplearla para desinformación, contenido ilegal, acoso, suplantación y otros supuestos recogidos en la licencia). Al redistribuir el modelo o sus derivados hay que reproducir esas restricciones y la atribución correspondiente.
- Compatibilidad: al tener 16 entradas, el UNet no es un reemplazo directo de una exportación estándar. El código consumidor debe construir los 13 tensores de residuales y aplicar el escalado, que la model card deja explícitamente al llamador sin especificar el factor.
- Rango del condicionamiento: controlnet_cond va en [0,1], no en [-1,1] como el VAE. Confundir el rango produce un condicionamiento degradado o inútil.
- Solo canny: no hay variantes de depth, pose, openpose, scribble ni seg, de modo que el control estructural queda limitado a mapas de bordes.
- Cuantización sin métricas: se afirma que las 16 entradas siguen presentes tras int8, pero no se publica ninguna evaluación de la pérdida de calidad frente a fp16 o fp32. En producción conviene validar visualmente con un conjunto propio antes de adoptarlo.
- Sesgos del modelo base: SD 1.5 arrastra sesgos de representación en género, etnia y profesión, además de una tendencia conocida a generar contenido para adultos si no se aplican filtros. No se documenta ningún filtro de seguridad adicional en este repositorio.
- Idioma: no hay soporte multilingüe declarado; los prompts funcionan mejor en inglés.
- Resolución nativa de 512x512 píxeles del modelo base; no se documenta ningún ajuste para resoluciones mayores.
- Artefactos típicos de la familia SD 1.5: anatomía incorrecta (manos, extremidades), problemas para renderizar texto legible y dificultades con escenas muy pobladas.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad y de informes de fallos.
- Fechas del repositorio: creado el 2026-09-23 y actualizado el mismo día, según los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/latentdivergence/sd15-controlnet-canny-int8
- Modelo base declarado: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5

No se han proporcionado otros enlaces (papers, blogs, repositorios de código ni demos) en la información disponible.
