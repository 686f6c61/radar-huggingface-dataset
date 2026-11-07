# hdae/karume-wan2.2

## Resumen

`hdae/karume-wan2.2` es una conversión no oficial del modelo de generación de vídeo Wan2.2 TI2V 5B (desarrollado por Wan-AI) al formato de contenedor del runtime de inferencia WebGPU Karume, con extensión `.krm`. No se trata de un modelo nuevo: los pesos subyacentes son los de `Wan-AI/Wan2.2-TI2V-5B-Diffusers` en el commit `b8fff7315c768468a5333511427288870b2e9635`, reempaquetados y cuantizados para su ejecución en navegador y en Deno sobre GPU. El autor del reempaquetado es el usuario `hdae`, sin afiliación ni respaldo de Wan-AI.

El modelo resuelve dos tareas: text-to-video (por defecto) e image-to-video (cuando se pasa una imagen a `generate()`, que se usa como primer fotograma). La arquitectura interna es la de Wan2.2 TI2V 5B: un transformer de difusión sobre tokens latentes patchificados, un text encoder umT5-XXL y un VAE de vídeo con decodificador causal por fotogramas. El repositorio ocupa 7,6 GB y no es legible por diffusers, ya que emplea un contenedor propio con grafo embebido.

Su relevancia actual es acotada pero específica: permite ejecutar un modelo de vídeo de 5B en WebGPU (Chrome) y en Deno sin depender de CUDA ni de servidores con GPU dedicada, a costa de una integración exclusiva con el runtime Karume y de una cuantización mayoritariamente int8. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Wan2.2 TI2V) con text encoder umT5-XXL y VAE de vídeo causal; grafo reexpresado sobre tokens latentes patchificados |
| Parámetros totales | 5B (según el nombre del modelo base; no se detalla el desglose por componente) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Transformer solo en int8 (pesos lineales cuantizados por canal de salida); VAE decoder en float16 y una segunda copia int8 por canal; text encoder umT5-XXL en int8; variantes citadas: `f16+dit8`, `f16+dit8-a8-attn8-s16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor Karume `.krm` (secuencia de partes, la primera con grafo y descriptores); no legible por diffusers |

## Arquitectura y entrenamiento

El modelo base Wan2.2 TI2V 5B es un transformer de difusión para vídeo con formulación flow-matching, scheduler UniPC y text encoder umT5-XXL. La conversión a Karume reorganiza el grafo en nueve subgrafos: `text_encoder`, `transformer`, dos pares de decodificadores VAE (`vae_decoder_first`/`vae_decoder_next` y su variante de tile 32, que comparte pesos con el par de tile 16) y tres grafos del encoder VAE (`vae_encoder_pre`, `vae_encoder_attn`, `vae_encoder_post`) para codificar una imagen de condicionamiento.

El resto del pipeline (limpieza de prompt, tokenizador, buckets de posición relativa, tablas de patchify y RoPE, classifier-free guidance como dos pasadas de batch 1, decodificación VAE por tiles y unpatchify) se ejecuta en el host en TypeScript. En image-to-video, los tokens del primer fotograma latente se marcan con la máscara de condición y toman timestep 0, de modo que el primer fotograma de salida es la imagen reescalada tras un ciclo por el VAE. No se documentan en la información disponible los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esos detalles corresponden al modelo original de Wan-AI, no a esta conversión.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video), con salida `[3, frames, height, width]` en float32 en el rango `[-1, 1]` a 24 fps.
- Generación de vídeo a partir de una imagen (image-to-video), usando la imagen como primer fotograma reescalado al tamaño de salida.
- Ejecución en WebGPU: verificada en Chrome sobre una NVIDIA GeForce RTX 5070 Ti y en Deno sobre Intel Arc B570 y NVIDIA GeForce RTX 3080 Ti.
- Control explícito del tile de decodificación VAE (16 por defecto; 32 disponible en la clase de 10 GB).
- Uso opcional de embeddings de texto precomputados (`textEncoder: "precomputed"`) para evitar ejecutar el text encoder en GPU.
- No se documentan tool calling, function calling, capacidades de agente, razonamiento multi-step ni soporte multilingüe explícito.

## Casos de uso

- Prototipado de vídeo generativo en navegador: permite probar text-to-video sin infraestructura CUDA, ejecutando el modelo en Chrome vía WebGPU; útil para demos interactivas y validación de ideas antes de pasar a un despliegue con GPU dedicada.
- Image-to-video para animación de fotogramas clave: dado un primer fotograma, el modelo genera la secuencia a partir de él; adecuado para storyboards y previsualización de animaciones donde se controla la imagen inicial.
- Generación de clips cortos en local con Deno: la verificación en Deno sobre Intel Arc B570 y RTX 3080 Ti demuestra que se puede integrar en scripts de automatización sin servidor de inferencia dedicado.
- Pruebas de reproducibilidad y determinismo: el autor fija las ejecuciones verificadas mediante SHA-256 de los fotogramas, lo que facilita usar el modelo en pipelines de regresión visual.
- Investigación sobre cuantización int8 en difusión de vídeo: el repositorio documenta con detalle la cuantización por canal del transformer y del VAE, útil para estudiar el impacto de int8 en calidad y velocidad.
- Evaluación comparativa de runtimes WebGPU: al ser una distribución específica de Karume, sirve para medir latencia y viabilidad de WebGPU frente a runtimes nativos en tareas de vídeo.
- Generación de vídeo vertical u horizontal: se han verificado resoluciones 1280 × 704 y 704 × 1280, útiles para formatos de pantalla horizontal y vertical respectivamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son tiempos de ejecución del autor:

| Entorno | Cuantización | Configuración | Tiempo |
|---|---|---|---|
| Chrome, RTX 5070 Ti | `f16+dit8-a8-attn8-s16`, text encoder en GPU | 1280 × 704, 121 fotogramas, 50 pasos | 40,3 min |
| Chrome, RTX 5070 Ti | misma cuantización, text encoder en GPU | 704 × 1280, 33 fotogramas, 20 pasos, shift 7 (image-to-video) | 390,0 s |
| Chrome, RTX 5070 Ti | misma cuantización, text encoder en GPU | 704 × 1280, 121 fotogramas, 20 pasos, shift 7 (image-to-video) | 1.346,5 s |

Las ejecuciones en navegador no se compararon con una referencia. Las ejecuciones en Deno (2 pasos de 17 fotogramas a 1280 × 704 y 704 × 1280, y 50 pasos de 33 fotogramas a 1280 × 704) se validaron por SHA-256 de los fotogramas, pero no se publican tiempos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 7,6 GB y el autor menciona una "clase de 10 GB" que mantiene el tile 16, lo que sugiere un objetivo de memoria en torno a 10 GB para el conjunto.
- GPU verificadas por el autor: Intel Arc B570 (Deno), NVIDIA GeForce RTX 3080 Ti (Deno, image-to-video) y NVIDIA GeForce RTX 5070 Ti (Chrome, WebGPU).
- Cabe en GPU de consumo: sí, según las verificaciones en RTX 3080 Ti y RTX 5070 Ti; no se documentan pruebas en GPUs de gama media o baja.
- Despliegue: runtime Karume sobre WebGPU (Chrome) o Deno; no es compatible con vLLM, llama.cpp, Ollama ni TGI, ni legible por diffusers.
- Latencia y throughput: solo se conocen los tiempos de la tabla anterior en Chrome sobre RTX 5070 Ti; no hay datos de throughput por segundo ni de latencia en Deno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| hdae/karume-wan2.2 | 5B | no disponible | `.krm` (Karume) | Apache 2.0 | Sí (WebGPU) |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | 5B | no disponible | Diffusers/safetensors | Apache 2.0 | No documentado |
| Otros modelos de vídeo de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación principal es con el modelo original de Wan-AI, del que esta distribución es una conversión cuantizada: comparte pesos y licencia, pero difiere en formato, cuantización (int8 en transformer y VAE) y runtime. No se dispone de datos de benchmarks para comparar calidad frente al original ni frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por Wan-AI; los cambios respecto al original se listan en `NOTICE.md`.
- Solo legible por el runtime Karume: requiere un pipeline que implemente `wan-ti2v/1`; no funciona con diffusers ni con las herramientas habituales de inferencia.
- Cuantización agresiva: el transformer se distribuye únicamente en int8, lo que puede degradar la calidad frente a los pesos originales en float16 o bfloat16; no se documenta una comparación de calidad.
- Sin datos de benchmarks ni evaluación de sesgos: no hay información sobre sesgos conocidos, tasas de alucinación visual ni evaluación cualitativa publicada.
- Idiomas no documentados: se desconoce el soporte multilingüe real del text encoder umT5-XXL en esta distribución.
- Rendimiento limitado en navegador: 40,3 minutos para un clip de 121 fotogramas a 1280 × 704 en una RTX 5070 Ti; no apto para aplicaciones interactivas en tiempo real.
- Verificación parcial: las ejecuciones en navegador no se compararon con una referencia y los clips cortos con `f16+dit8` y embeddings precomputados no se han probado aún en navegador.
- Licencia Apache 2.0: permite uso comercial, pero obliga a conservar avisos de atribución y a documentar cambios (apartado 4(b)); conviene revisar `LICENSE.md` y `NOTICE.md` del repositorio.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hdae/karume-wan2.2
- Árbol de archivos: https://huggingface.co/hdae/karume-wan2.2/tree/main
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Text encoder referenciado: https://huggingface.co/hdae/karume-umt5-xxl
- Informe técnico de Wan2.2: https://arxiv.org/abs/2503.20314
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
