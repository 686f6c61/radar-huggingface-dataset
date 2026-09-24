# iknownuting/Sulphur-2-base

## Resumen

Sulphur 2 (identificador `iknownuting/Sulphur-2-base`) es un modelo de generación de vídeo publicado por el usuario iknownuting, construido como ajuste sobre `Lightricks/LTX-2.3`. Se distribuye con la librería `diffusers` y la etiqueta de pipeline `text-to-video`, y la model card lo describe como un modelo de generación de vídeo "sin censura" (uncensored) que soporta de forma nativa tanto texto-a-vídeo (t2v) como imagen-a-vídeo (i2v), además de afirmar compatibilidad con "el resto de formatos de LTX 2.3", sin detallarlos.

El recuento real de los pesos en safetensors arroja 9.197.093.888 parámetros (unos 9,2 mil millones), mientras que el repositorio ocupa 187,4 GB, señal de que aloja varias variantes de precisión (bf16 y fp8mixed), cuantizaciones GGUF, una LoRA de destilación y un "prompt enhancer" multimodal en formato GGUF más fichero mmproj. No se especifican licencia, idiomas soportados, longitud de contexto ni duración máxima de clip.

Su relevancia es acotada pero concreta: es un ajuste de la familia LTX-2.3 orientado a eliminar los filtros de contenido del modelo base y a ofrecer variantes ligeras (fp8, GGUF, LoRA distill) para inferencia en hardware de consumo. El contraste es notable: 1 like, 0 descargas y ninguna métrica de benchmarks publicada, por lo que debe tratarse como un modelo de comunidad en fase temprana y no como una opción consolidada para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; ajuste sobre Lightricks/LTX-2.3 (familia LTX de difusión latente para vídeo) |
| Parámetros totales | 9.197.093.888 (aproximadamente 9,2 mil millones, según safetensors) |
| Longitud de contexto | No disponible (no se especifica duración máxima de clip ni longitud de secuencia) |
| Tipos de cuantización | bf16, fp8mixed y GGUF; se distribuye además una LoRA de destilación |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors y GGUF (incluye fichero mmproj para el prompt enhancer) |
| Librería | diffusers |
| Pipeline | text-to-video |
| Modelo base | Lightricks/LTX-2.3 |
| Tamaño del repositorio | 187,4 GB |
| Fecha de publicación | 2026-09-24 |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, el cómputo de entrenamiento ni la composición del dataset. Lo único verificable es que el modelo deriva de `Lightricks/LTX-2.3`, que la librería declarada es `diffusers` y que la etiqueta de tarea es `text-to-video`. Por tanto, la arquitectura concreta (bloques, tipo de atención, VAE latente, codificador de texto) no está disponible en la información proporcionada y habría que consultar la documentación del modelo base para conocerla.

El autor sí documenta el ecosistema de pesos que acompaña al modelo: variantes `bf16` y `fp8mixed` para inferencia, cuantizaciones GGUF, una LoRA de destilación que permite reducir los pasos de muestreo y un prompt enhancer multimodal (GGUF + mmproj) pensado para ejecutarse en LM Studio. No se documentan fases de RLHF, DPO ni ningún proceso de alineación; de hecho, el modelo se presenta explícitamente como "uncensored", lo que implica la ausencia de filtrado de seguridad en la generación.

Como innovaciones destacables solo pueden citarse elementos de la model card: soporte nativo de t2v e i2v en el mismo checkpoint, compatibilidad declarada con el resto de formatos de LTX 2.3 y el enhancer de prompts integrado. No hay información sobre decodificación especulativa, atención lineal ni optimizaciones equivalentes.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) de forma nativa.
- Generación de vídeo a partir de una imagen (image-to-video) de forma nativa.
- Compatibilidad declarada con "el resto de formatos de LTX 2.3", sin que la model card especifique cuáles (posible condicionamiento por keyframes, extensión u otros, no confirmado).
- Prompt enhancer: modelo multimodal en GGUF con fichero mmproj que acepta texto e imagen y devuelve el prompt enriquecido; se ejecuta en LM Studio, sin system prompt.
- Etiqueta `conversational` en el repositorio, presumiblemente asociada al prompt enhancer y no al generador de vídeo.
- LoRA de destilación para reducir el número de pasos de inferencia.
- Ausencia de filtros de contenido: el modelo se describe como "uncensored".
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código, audio ni razonamiento multi-paso.

## Casos de uso

- Previsualización y storyboard animado en producción audiovisual: generar clips de referencia con t2v a partir de descripciones de plano antes de rodar, de modo que el equipo de dirección valide encuadres y ritmo sin coste de producción.
- Animación de imágenes fijas para marketing y comercio electrónico: usar i2v para dar movimiento a fotografías de producto o a ilustraciones ya existentes, partiendo de material gráfico cerrado.
- Creación de contenido para redes sociales: producir clips cortos y bucles animados a partir de texto, apoyándose en las variantes fp8 o GGUF para iterar rápido en una GPU de gama alta de consumo.
- Assets para videojuegos e interactivos: generar fondos animados, pantallas de carga o cinemáticas provisionales que luego se sustituyen por arte final.
- Investigación en difusión de vídeo: servir como punto de partida para ajuste fino o entrenamiento de LoRAs sobre LTX-2.3, con el aliciente de partir de un checkpoint sin censura que evita rechazos en dominios creativos marginales.
- Ampliación de prompts e imágenes: el prompt enhancer en GGUF permite convertir descripciones pobres (o una imagen de referencia) en prompts detallados, integrable en un flujo local con LM Studio antes de llamar al generador.
- Prototipado de efectos y transiciones: experimentar con condicionamientos de LTX 2.3 para explorar variaciones de movimiento sin comprometer recursos de render tradicional.
- Generación de contenido creativo sin restricciones temáticas, siempre que el despliegue cumpla la normativa aplicable (derechos de imagen, verificación de edad, marcado de contenido sintético).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIPSim, VBench ni equivalentes), ni comparaciones numéricas con otros modelos, ni cifras de latencia o pasos de muestreo.

## Requisitos de hardware

- VRAM estimada para los pesos (estimación propia a partir de los 9,2 mil millones de parámetros, no publicada por el autor): unos 18,4 GB en bf16, unos 9,2 GB en fp8, y entre 5,5 y 10 GB en GGUF según cuantización (Q4_K_M ~5,7 GB, Q5_K_M ~6,6 GB, Q6_K ~7,6 GB, Q8_0 ~9,8 GB).
- A esas cifras hay que sumar el codificador de texto y el VAE de la familia LTX, más los latentes de vídeo, que crecen con la resolución, el número de fotogramas y el batch. Por eso la VRAM real de trabajo es sensiblemente superior al peso del checkpoint.
- GPU recomendadas (estimación): RTX 4090 o RTX 3090 (24 GB) para fp8 con clips cortos; A100 40/80 GB o H100 para bf16, resoluciones altas, lotes grandes o entrenamiento de LoRA.
- ¿Cabe en GPU de consumo? Con GGUF Q4/Q5 y clips cortos es plausible en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070); en 16 GB (RTX 4060 Ti 16 GB, RTX 4080) con más margen; en 24 GB con fp8.
- Opciones de despliegue: `diffusers` (librería declarada), flujos de ComfyUI para LTX (la model card menciona workflows con `sulphur_final`, advirtiendo de no combinar ese flujo con la LoRA a la vez), y llama.cpp o LM Studio para el prompt enhancer en GGUF. vLLM y TGI no aplican, al no tratarse de un modelo de lenguaje autorregresivo.
- Latencia y throughput: no disponibles. La model card solo recomienda usar la LoRA de destilación para reducir pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|
| Sulphur 2 base | 9,2 mil millones | No disponible | HuggingFace y CivitAI | Ajuste uncensored de LTX-2.3, con GGUF y LoRA distill |
| Lightricks/LTX-2.3 | No disponible | No disponible en la información proporcionada | HuggingFace | Modelo base del que deriva Sulphur 2 |
| Otras alternativas abiertas de t2v (Wan 2.x, HunyuanVideo) | No disponible | No disponible en la información proporcionada | No disponible | No se aportan datos comparativos en la información disponible |

No se dispone de cifras de rendimiento, contexto ni licencia de los modelos comparados, por lo que la comparación cuantitativa no puede realizarse con los datos proporcionados.

## Limitaciones y advertencias

- Licencia no especificada: sin términos publicados no puede confirmarse el uso comercial, la redistribución ni la obligación de atribución. Cualquier despliegue en producción debería aclarar esto con el autor antes de usarlo.
- Modelo declarado "uncensored": no incorpora filtros de seguridad, lo que traslada al operador toda la responsabilidad legal y ética sobre el contenido generado (material sexual, violencia, deepfakes, suplantación de identidad).
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir anatomías incorrectas, física incoherente, texto ilegible, parpadeo temporal y artefactos entre fotogramas. No hay métricas publicadas que permitan acotar la magnitud de estos fallos.
- Sesgos: no hay información sobre la composición del dataset ni sobre evaluaciones de sesgo; los sesgos del modelo base y de los datos de ajuste se heredan sin documentar.
- Idiomas: no se especifica qué lenguas entiende el modelo ni el prompt enhancer, por lo que no puede garantizarse un comportamiento correcto con prompts en castellano.
- Duración y resolución: la model card no indica duración máxima de clip, resolución soportada ni límites de fotogramas; hay que determinarlos empíricamente.
- Advertencia operativa del propio autor: no usar simultáneamente el flujo que incluye `sulphur_final` y la LoRA de destilación.
- Madurez: 0 descargas y 1 like en el momento de la consulta, sin benchmarks ni guía de entrenamiento completa ("coming soon"), lo que lo sitúa en fase temprana y con soporte limitado.
- Infraestructura: el repositorio ocupa 187,4 GB, por lo que conviene descargar solo la variante necesaria en lugar del repositorio completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iknownuting/Sulphur-2-base
- Modelo base: https://huggingface.co/Lightricks/LTX-2.3
- CivitAI, modelo base: https://civitai.red/models/2594061/sulphur-2-base
- CivitAI, modelo cuantizado: https://civitai.red/models/2630742
- Perfil del autor en X: https://x.com/FusionCow11
- Discord del proyecto: https://discord.gg/C3d56f39Ah
- Ko-fi del proyecto: https://ko-fi.com/fusioncow
- TenStrip (testing y merging): https://huggingface.co/TenStrip
- Merge i2v de Sulphur 2 por TenStrip: https://huggingface.co/TenStrip/LTX2.3-10Eros
- silveroxides (testing, merging y cuantización): https://huggingface.co/silveroxides
