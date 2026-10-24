# Nanico/evb

## Resumen

Nanico/evb es un adaptador LoRA entrenado con DreamBooth para el modelo de generación de imágenes Krea 2, publicado por el usuario Nanico en Hugging Face. Su propósito es inyectar un concepto visual concreto, invocado mediante el token disparador `evb`, en la generación text-to-image sin reentrenar el modelo completo. El adaptador se entrenó sobre krea/Krea-2-Raw y los ejemplos oficiales se generan sobre krea/Krea-2-Turbo con 8 pasos de inferencia y guidance_scale 0,0.

Con un repositorio de 0,8 GB y licencia Apache 2.0, es relevante para quien necesite reutilizar un concepto aprendido (personajes, objetos, estilos) en escenas y estilos muy distintos con un coste de despliegue mínimo, integrándolo en Python mediante la librería diffusers. Se trata de un recurso muy reciente (creado el 23 de octubre de 2026) y sin adopción comunitaria todavía: 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (DreamBooth-LoRA) sobre el modelo text-to-image Krea 2; arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible (el repositorio del adaptador ocupa 0,8 GB) |
| Longitud de contexto | no aplicable (pipeline text-to-image) |
| Tipos de cuantización | no disponible; el ejemplo oficial carga el modelo base en bfloat16 |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador LoRA para diffusers; formato de fichero exacto no disponible |
| Modelo base | krea/Krea-2-Raw |
| Pipeline | text-to-image (diffusers) |
| Token disparador | `evb` |
| Tamaño del repositorio | 0,8 GB |
| Configuración de inferencia documentada | 8 pasos, guidance_scale 0,0 (sobre Krea 2 Turbo) |

## Arquitectura y entrenamiento

El recurso no es un modelo completo, sino un adaptador LoRA (Low-Rank Adaptation): un conjunto de matrices de bajo rango que se superponen a los pesos del modelo base para enseñarle un concepto nuevo sin modificarlo por completo. La técnica de entrenamiento empleada es DreamBooth, que asocia el concepto a un token poco frecuente (en este caso `evb`) para poder invocarlo de forma fiable en los prompts. El entrenamiento se realizó sobre krea/Krea-2-Raw y la validación visual de la model card se presenta sobre Krea 2 Turbo, la variante optimizada para muestreo con pocas pasos (8) y guidance_scale 0,0, lo que indica destilación del modelo base.

No se ha documentado ningún detalle del entrenamiento: número de imágenes del dataset, rango LoRA, learning rate, número de pasos o composición de los datos. Tampoco consta si se usaron técnicas adicionales como prior preservation. Al ser un adaptador de difusión, conceptos propios de modelos de lenguaje (RLHF, DPO) no aplican aquí.

## Capacidades

- Generación text-to-image del concepto aprendido, invocando el token `evb` dentro del prompt.
- Composición del concepto en escenas y estilos heterogéneos: los ejemplos oficiales lo insertan en una calle cyberpunk con lluvia de neones (gato mecánico flotante), un templo jungle con un gólem de piedra y un shoot de moda minimalista con una escultura de porcelana iridiscente.
- Carga sencilla en diffusers mediante `Krea2Pipeline` y `pipe.load_lora_weights("Nanico/evb")`.
- Muestreo rápido: 8 pasos de inferencia con guidance_scale 0,0 sobre Krea 2 Turbo.
- Tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Agentes y razonamiento multi-paso: no aplicable.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Consistencia de personaje o mascota: el token `evb` permite reaparecer el mismo concepto aprendido en escenas distintas (lluvia neon, templo, estudio), útil para series de ilustraciones con un protagonista reconocible.
- Arte conceptual de videojuegos: el ejemplo del gólem en el templo muestra que el concepto puede integrarse en entornos narrativos, agilizando la exploración visual de criaturas y localizaciones antes del modelado 3D.
- Fotografía de producto y moda: el ejemplo de la escultura de porcelana sobre fondo negro demuestra utilidad para mockups y shoots de estudio estilizados sin sesión fotográfica.
- Ilustración cyberpunk y de entornos: la escena de ciudad con lluvia de neones sirve como base para pósters, portadas o fondos con iluminación compleja.
- Prototipado en pipelines Python: al exponerse vía diffusers, puede integrarse en scripts de generación por lotes, A/B testing de prompts o automatizaciones de producción de assets.
- Exploración estilística del mismo concepto: el concepto se reinterpreta en materiales y géneros distintos (mecánico, pétreo, cerámico), lo que facilita variantes de marca o diseño sobre un único elemento aprendido.
- Generación de contenido para redes y marketing: la combinación de 8 pasos por imagen y un adaptador ligero permite producir volúmenes altos de imágenes coherentes con bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No consta ninguna métrica de calidad de imagen (FID, CLIP score, preferencia humana) ni validación por terceros; además, el repositorio registra 0 descargas y 0 likes, por lo que no existe contraste comunitario sobre su rendimiento real.

## Requisitos de hardware

- El adaptador ocupa 0,8 GB en disco; la VRAM necesaria para inferencia depende del modelo base (Krea 2 Turbo cargado en bfloat16), cuyos requisitos no están documentados en la información disponible.
- El ejemplo oficial requiere CUDA (`.to("cuda")`) y soporte bfloat16, por lo que en la práctica se necesita una GPU NVIDIA de arquitectura Ampere o posterior (por ejemplo RTX 3090/4090, A100 o H100).
- Cabe en GPU de consumo: no disponible como dato confirmado, dado que se desconoce el tamaño del modelo base; el adaptador en sí (0,8 GB) añade una sobrecarga reducida.
- Despliegue: diffusers es la vía documentada (snippet oficial con `Krea2Pipeline`); la compatibilidad con otras herramientas (ComfyUI, interfaces tipo Automatic1111) no está documentada. Opciones como vLLM, llama.cpp, Ollama o TGI no aplican al ser un modelo de difusión.
- Latencia y throughput: no disponibles en cifras concretas; la configuración de 8 pasos con guidance_scale 0,0 apunta a un muestreo de bajo coste propio de variantes Turbo destiladas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Uso documentado |
|---|---|---|---|---|
| Nanico/evb | LoRA DreamBooth sobre Krea 2 | 0,8 GB | Apache 2.0 | diffusers, 8 pasos sobre Krea 2 Turbo |
| krea/Krea-2-Raw | Modelo base text-to-image | no disponible | no disponible | modelo base sobre el que se entrena el LoRA |
| krea/Krea-2-Turbo | Variante rápida de Krea 2 | no disponible | no disponible | inferencia con 8 pasos y guidance_scale 0,0 |
| Nanico/bbm | LoRA DreamBooth sobre Krea 2 (mismo autor) | no disponible | Apache 2.0 | mismo template sd-lora en diffusers |

Nanico/evb se diferencia de los modelos base en que no genera imágenes por sí solo: aporta un concepto específico y requiere uno de aquellos para funcionar. Frente a Nanico/bbm, comparte autor, técnica, modelo base y licencia, cambiando únicamente el concepto aprendido.

## Limitaciones y advertencias

- No es un modelo autónomo: exige descargar y ejecutar el modelo base Krea 2 (Turbo o Raw) para generar imágenes.
- El efecto del adaptador está ligado al token `evb`; sin incluirlo en el prompt, el LoRA no aporta el concepto.
- Detalles de entrenamiento no documentados (dataset, origen y licencia de las imágenes, rango LoRA), lo que impide evaluar sesgos, derechos sobre el concepto aprendido y riesgo de sobreajuste.
- Hereda los sesgos y limitaciones del modelo base Krea 2, que no están descritos en la información disponible.
- Sin validación comunitaria: 0 descargas y 0 likes; la calidad de los resultados no está contrastada por terceros.
- Los prompts de ejemplo están en inglés; el comportamiento con prompts en castellano u otros idiomas no está verificado.
- La configuración documentada (8 pasos, guidance_scale 0,0) está pensada para Krea 2 Turbo; aplicarla sobre Krea 2 RAW o con otros parámetros puede degradar los resultados.
- La licencia Apache 2.0 del adaptador es permisiva y permite uso comercial, pero conviene revisar la licencia del modelo base Krea 2 antes de desplegar en producción, ya que no consta en esta ficha.
- Riesgos típicos de LoRA DreamBooth: fuga del token hacia conceptos no deseados y artefactos si el entrenamiento estuvo sobreajustado; no hay datos para descartarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nanico/evb
- Autor en Hugging Face: https://huggingface.co/Nanico
- Modelo base (Krea 2 RAW): https://huggingface.co/krea/Krea-2-Raw
- Modelo usado en los ejemplos (Krea 2 Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Otro LoRA del mismo autor sobre Krea 2: https://huggingface.co/Nanico/bbm
- La búsqueda web no ha aportado papers, blogs ni demos adicionales relevantes para este adaptador.
