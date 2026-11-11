# nodevorg/studio-models-pan2

## Resumen

PAN 2 es un modelo del mundo (world model) orientado a generación de vídeo a partir de texto e imagen, desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Este repositorio concreto, `nodevorg/studio-models-pan2`, no es la publicación oficial: es un reempaquetado de los pesos originales de IFM/PAN2 preparado por `nodevorg` para el servicio studio.no.dev, que los ejecuta mediante la herramienta `uncomfy` y el nodo `PAN2` de `uncomfy-server`.

El núcleo del modelo es un transformer de difusión (DiT) de 29 000 millones de parámetros que se acompaña de un VAE de Wan 2.2 y de Qwen3.5-9B como codificador de texto. El reempaquetado convierte las 528 capas lineales grandes del DiT a int8 con la técnica ConvRot (Hadamard por grupos de 256) y mantiene las lineales de modulación en bf16, lo que reduce el peso del DiT a 34,9 GB en un único archivo safetensors.

La relevancia de esta ficha es doble: por un lado documenta un modelo de vídeo de gran escala bajo licencia Apache 2.0; por otro, advierte de que estos archivos no son un checkpoint de ComfyUI ni un formato estándar de despliegue, sino un empaquetado específico para una herramienta concreta, con requisitos de hardware muy elevados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) para generación de vídeo, con VAE de Wan 2.2 y codificador de texto Qwen3.5-9B |
| Parámetros totales | 29 000 millones en el DiT; adicionalmente Qwen3.5-9B como text encoder |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (tensorwise + ConvRot, Hadamard grupo 256) en las 528 lineales grandes del DiT; bf16 en las lineales de modulación; bf16 original disponible en IFM/PAN2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (código y pesos originales de MBZUAI/IFM; este reempaquetado se distribuye bajo la misma licencia) |
| Formato de pesos | safetensors (diffusers, con nombres de clave de diffusers) |

## Arquitectura y entrenamiento

La información disponible confirma que PAN 2 es un modelo de difusión con un backbone DiT de 29 000 millones de parámetros, acompañado de un VAE heredado de Wan 2.2 (2,8 GB en safetensors) y de Qwen3.5-9B como codificador de texto, usado tal cual se publicó, sin ajuste fino. El pipeline declarado en Hugging Face es `image-to-video`, y las etiquetas del repositorio incluyen también `text-to-video` y `world-model`.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. La innovación técnica documentada en este repositorio es la cuantización: las 528 capas lineales grandes del DiT se convierten a int8 con `int8_tensorwise` de ComfyUI más ConvRot con rotación de Hadamard en grupos de 256, mientras que las lineales de modulación permanecen en bf16. Según el autor, frente a la versión bf16 oficial ejecutada en diffusers con el mismo prompt y semilla, la primera velocidad del DiT en int8 alcanza un coseno de 0,99997, con clips que coinciden en contenido y movimiento y difieren en detalles menores.

## Capacidades

- Generación de vídeo a partir de imagen (image-to-video), el pipeline declarado en Hugging Face.
- Generación de vídeo a partir de texto (text-to-video), según las etiquetas del repositorio.
- Modelado del mundo: el modelo se presenta como world model, orientado a simular dinámica visual coherente.
- Codificación de texto mediante Qwen3.5-9B, lo que aporta comprensión de prompts en lenguaje natural.
- Resolución de salida de hasta 1248×704 y clips de 241 frames (10 segundos a 24 fps) según el ejemplo de rendimiento del autor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step, visión como entrada analítica, audio ni modo thinking.
- No se documentan capacidades multilingües específicas.

## Casos de uso

- Previsualización de vídeo publicitario: generar clips de 10 segundos a 1248×704 a partir de un fotograma clave o de un prompt, para validar concepto y movimiento antes de producir en alta calidad.
- Prototipado de secuencias para cine y animación: usar image-to-video para convertir storyboards en animáticas con movimiento coherente y evaluar ritmo y encuadre.
- Simulación visual para robótica y conducción: emplear el modelo como world model para generar trayectorias visuales plausibles en entornos controlados, siempre con las guardrails recomendadas por IFM.
- Creación de contenido para redes sociales: generar clips cortos de 10 segundos en formato horizontal o recortable, con coste de cómputo acotado por la cuantización int8.
- Investigación en modelos generativos de vídeo: servir como base para experimentos de destilación, cuantización o ajuste fino, dado que los pesos son Apache 2.0 y los nombres de clave siguen el esquema de diffusers.
- Docencia y divulgación: demostrar pipelines de difusión vídeo con un modelo de 29B en hardware de gama alta, comparando la salida int8 con la bf16 oficial.
- Integración en herramientas de estudio: ejecutar el modelo mediante `uncomfy pan2` o el nodo `PAN2` de `uncomfy-server` para flujos internos de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es operativo: a 1248×704, 241 frames (10 s a 24 fps) y 50 pasos, un render en DGX Spark (GB10) tarda aproximadamente 100 minutos con un pico de 52 GB de memoria.

| Métrica | Valor |
|---|---|
| Resolución y duración de referencia | 1248×704, 241 frames (10 s a 24 fps) |
| Pasos de muestreo | 50 |
| Tiempo de render en DGX Spark (GB10) | ~100 minutos |
| Pico de memoria | 52 GB |
| Similitud int8 vs bf16 (coseno de la primera velocidad) | 0,99997 |

## Requisitos de hardware

- VRAM estimada: el pico medido es de 52 GB para el render de referencia a 1248×704 y 241 frames; no se documentan cifras para resoluciones o duraciones menores.
- GPU recomendadas: DGX Spark (GB10) es el único hardware con cifras publicadas; por el pico de 52 GB, se requiere una GPU con al menos 48-80 GB de memoria, como A100 80 GB, H100 80 GB o configuraciones equivalentes.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con la configuración documentada; no se han publicado variantes que quepan en 24 GB.
- Despliegue: `uncomfy pan2` y el nodo `PAN2` de `uncomfy-server`; la versión bf16 oficial se ejecuta con diffusers. ComfyUI no ejecuta PAN 2 todavía y su cargador int8 no reconoce los nombres de clave de este modelo.
- Latencia y throughput: aproximadamente 100 minutos por clip de 10 segundos en DGX Spark con 50 pasos; no se dispone de datos de throughput para otras GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A continuación se recoge lo que sí puede afirmarse con los datos del repositorio.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PAN 2 (IFM/PAN2) | 29B (DiT) + Qwen3.5-9B | no disponible | Apache 2.0 | Pesos en Hugging Face |
| Este reempaquetado (nodevorg) | 29B en int8 + text encoder int8 | no disponible | Apache 2.0 | Pesos en Hugging Face, ejecución vía uncomfy |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Este repositorio no es una publicación oficial de MBZUAI ni de IFM; es un reempaquetado de terceros de los pesos de IFM/PAN2.
- Los archivos no son un checkpoint de ComfyUI: ComfyUI no ejecuta PAN 2 y su cargador int8 no reconoce los nombres de clave del modelo.
- Los archivos no incluyen guardrail; IFM recomienda ejecutar PAN 2 con `pan2-guardrail` y evitar los usos fuera de alcance descritos en su model card.
- La cuantización int8 introduce diferencias en detalles menores frente a la versión bf16, aunque el contenido y el movimiento coinciden según el autor.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión de vídeo; no se documentan tasas ni evaluaciones sistemáticas.
- No se dispone de información sobre sesgos, cobertura idiomática ni evaluación de seguridad.
- Requisitos de hardware muy elevados (pico de 52 GB y ~100 minutos por clip en DGX Spark), lo que limita su uso en producción a infraestructura especializada.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse el NOTICE de IFM y las licencias de terceros (Wan 2.2, Qwen3.5-9B y Diffusers, todas Apache 2.0).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Repositorio de este reempaquetado: https://huggingface.co/nodevorg/studio-models-pan2
- Modelo original de IFM: https://huggingface.co/IFM/PAN2
- Guardrail recomendado: https://huggingface.co/IFM/PAN2
- Servicio de studio: https://studio.no.dev
- Text encoder de origen (Comfy-Org/MOSS-Image): https://huggingface.co/Comfy-Org/MOSS-Image
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
