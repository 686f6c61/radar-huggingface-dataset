# cfgscale/MOSS-Image-LoRA-RealSkin

## Resumen

MOSS-Image-LoRA-RealSkin es un adaptador LoRA para generación de imágenes texto-a-imagen que se aplica sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Lo publica el usuario cfgscale bajo la marca SeedraAI y su función es concreta: reintroducir textura de piel realista (pecas, poros visibles, tono desigual, rojeces y pequeñas marcas) en los retratos generados, eliminando el aspecto de filtro de belleza sin alterar la identidad facial del sujeto. El repositorio ocupa 0,2 GB y se distribuye en formato safetensors con licencia Apache 2.0.

El adaptador se entrenó sobre 100 fotografías seleccionadas manualmente de piel real sin retocar, abarcando primeros planos, selfis, macro, hombros y brazos con pecas, y cubriendo distintas edades, etnias e iluminaciones. Según el autor, el efecto se mantiene en planos medios y de cintura hacia arriba, no solo en close-ups de rostro, y se atenúa de forma natural en escenas oscuras.

Su relevancia es acotada pero clara para flujos de trabajo de retrato fotorrealista: es un ajuste de estilo de bajo coste (un LoRA de 0,2 GB) que se integra en ComfyUI mediante un nodo LoraLoaderModelOnly, con un token de activación específico y unos parámetros de muestreo documentados. No aporta capacidades nuevas al modelo base, sino que modifica su distribución de salida en la dirección de la fotografía amateur de smartphone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión texto-a-imagen MOSS-Image-SFT |
| Parámetros totales | no disponible (el repo pesa 0,2 GB; el número de parámetros del adaptador no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible (se distribuye en safetensors; no se documentan variantes GGUF ni FP8) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (archivo `seedra_skin_moss.safetensors`) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base MOSS-Image-SFT, que permanece congelado. El autor no detalla en la model card qué módulos del transformer de difusión se adaptan, ni el rango, ni el alpha del adaptador. El entrenamiento se realizó sobre un dataset de 100 fotografías de piel real sin retocar, elegidas a mano: primeros planos, selfis, tomas macro, hombros y brazos con pecas, con variedad de edades, etnias y condiciones de luz.

El checkpoint publicado corresponde al paso 3000 de un entrenamiento de 4000 pasos. El autor indica que evaluó cada 1000 pasos con los mismos prompts y semillas, y que en el paso 4000 el modelo empezaba a modificar el rostro, por lo que descartó ese checkpoint. No se documentan datos sobre el optimizador, la tasa de aprendizaje, el tamaño de lote ni el número de repeticiones por imagen. Tampoco se especifica si hubo regularización con imágenes de clase o captioning automático.

## Capacidades

- Generación de retratos fotorrealistas con textura de piel creíble: pecas, poros, tono desigual, rojeces y pequeñas marcas.
- Eliminación del aspecto de filtro de belleza o retoque digital en la salida del modelo base.
- Aplicación efectiva en primeros planos, planos medios y planos de cintura hacia arriba, según el autor.
- Preservación de la identidad facial: el adaptador modifica la piel sin cambiar la cara del sujeto.
- Activación mediante el token disparador `r3alsk1n`, que debe encabezar el prompt.
- Compatibilidad con el ecosistema ComfyUI a través del nodo LoraLoaderModelOnly.
- Ajuste de intensidad del efecto mediante el peso del LoRA (1.0 por defecto, 0.7-0.8 para un resultado más suave).
- No incorpora tool calling, razonamiento multi-paso, agentes ni capacidades de audio o vídeo: es exclusivamente un adaptador de estilo para texto-a-imagen.

## Casos de uso

- Retrato editorial con estética documental: usar el LoRA con el template `r3alsk1n, {tipo de plano} of {personaje}, {ropa}, {lugar}, {luz}, amateur phone photo` para producir imágenes de aspecto espontáneo y no publicitario, adecuadas para reportajes o piezas de marca que huyen del retoque.
- Pruebas de concepto para fotografía de moda: generar variantes de una misma sesión con piel realista a 1024x1536 en proporción 2:3, útiles para presentar moodboards antes de contratar un rodaje real.
- Prototipado de personajes para narrativa visual: mantener una identidad facial consistente mientras se varía la iluminación y el vestuario, gracias a que el adaptador no altera los rasgos del rostro.
- Generación de material para aplicaciones de salud y dermatología divulgativa: ilustrar de forma realista la apariencia de piel con pecas, rojeces o tono desigual en piezas educativas, siempre con revisión humana del contenido.
- Contenido para redes sociales con estética de foto amateur: el prompt recomendado incluye términos como `amateur phone photo`, `natural light` y `no makeup`, lo que encaja con publicaciones que buscan autenticidad frente al render pulido.
- Integración en pipelines de ComfyUI sobre infraestructura cloud: el autor ofrece una plantilla de ComfyUI para Vast y RunPod, lo que permite desplegar el flujo sin GPU local.
- Comparación A/B de estilos de piel: el propio autor documenta pares before/after con el mismo prompt y semilla, un método replicable para evaluar el efecto del adaptador antes de adoptarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, LPIPS ni evaluaciones humanas con puntuaciones), y la validación se limita a comparaciones visuales before/after con prompt y semilla idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para este adaptador; depende enteramente del modelo base MOSS-Image-SFT, cuyos requisitos no se detallan en la información proporcionada. El LoRA en sí añade una sobrecarga mínima (0,2 GB en disco).
- GPU recomendadas: no disponible. El autor no indica GPU concretas para ejecución local.
- ¿Cabe en GPU de consumo? No disponible. Al ser un adaptador sobre un modelo de difusión de imagen, la viabilidad en GPU de consumo depende del modelo base, no del LoRA.
- Opciones de despliegue: ComfyUI (flujo documentado: copiar `seedra_skin_moss.safetensors` a `ComfyUI/models/loras/` y añadir un nodo LoraLoaderModelOnly tras el cargador del modelo MOSS Image SFT). El autor ofrece además una plantilla de ComfyUI alojada en SeedraAI Studio para Vast y RunPod.
- Parámetros de inferencia documentados: 35 pasos, CFG 3, sampler euler con sgm_uniform, resolución 1024x1536 en proporción 2:3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Token de activación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cfgscale/MOSS-Image-LoRA-RealSkin | LoRA de textura de piel | OpenMOSS-Team/MOSS-Image-SFT | `r3alsk1n` | Apache 2.0 | Hugging Face, CivitAI |
| SEEDRAAI/Krea-2-LoRA-RealSkin | LoRA de textura de piel | Modelo Krea 2 | no disponible en la información proporcionada | no disponible | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | Modelo base de texto-a-imagen | no aplica | no aplica | no disponible en la información proporcionada | Hugging Face |

La comparativa se limita a estas referencias porque la información disponible no incluye datos de parámetros, contexto ni rendimiento cuantitativo de los modelos alternativos. El propio autor señala que la versión para Krea 2 es el equivalente funcional de este adaptador en otro modelo base, y advierte que sobre MOSS Image Base (en lugar de SFT) el efecto suaviza y lava la imagen, lo que hace que la elección del base sea determinante.

## Limitaciones y advertencias

- El adaptador solo funciona correctamente sobre MOSS Image SFT; el autor advierte explícitamente que sobre MOSS Image Base el resultado se suaviza y se lava, por lo que no es un LoRA portable a otras variantes del modelo.
- El efecto se reduce de forma natural en escenas oscuras, según reconoce el autor; no debe esperarse la misma textura de piel en iluminación baja.
- El prompt no debe incluir `motion blur`, ya que compite con el detalle de la piel y degrada el resultado.
- El checkpoint publicado es el paso 3000 de 4000; el paso 4000 alteraba el rostro, de modo que subir el peso del LoRA por encima de 1.0 no está validado y puede distorsionar la identidad facial.
- El dataset de entrenamiento es de solo 100 imágenes, lo que limita la diversidad real de tonos de piel, edades y etnias cubiertas más allá de lo que el autor declara; no se publican métricas de sesgo ni evaluación por subgrupos.
- Riesgo de alucinación y artefactos propio de los modelos de difusión: no se documentan tasas de fallo ni evaluaciones de fidelidad anatómica.
- Idioma: el modelo solo declara soporte de inglés (`en`), por lo que los prompts en castellano no están validados.
- Licencia Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial, pero el autor no detalla condiciones adicionales ni restricciones de atribución más allá de las de la propia licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día: no hay evidencia de uso en producción ni validación independiente por parte de la comunidad.
- El material promocional enlaza a un servicio de pago (SeedraAI Studio y membresía), lo que conviene tener en cuenta al evaluar la independencia de las recomendaciones de parámetros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cfgscale/MOSS-Image-LoRA-RealSkin
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Versión para Krea 2: https://huggingface.co/SEEDRAAI/Krea-2-LoRA-RealSkin
- CivitAI: https://civitai.com/models/3058565
- SeedraAI (sitio del autor): https://seedraai.com/
- SeedraAI Studio (plantilla de ComfyUI para Vast y RunPod): https://seedraai.com/studio/
- Discord de la comunidad: https://discord.gg/seedraai
