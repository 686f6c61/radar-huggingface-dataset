# neonforestmist/clover-image-tiny-storybook-anime-style-lora

## Resumen

Clover Image Tiny — Storybook Anime LoRA es un adaptador de estilo (LoRA de rango 16) para generación de imágenes texto-a-imagen, publicado por el usuario neonforestmist. No es un modelo autónomo: está entrenado específicamente para un checkpoint privado de «Clover Image Tiny» con composición ya fusionada, cuyo acceso debe obtenerse por separado. El adaptador no ha sido validado contra el checkpoint público antiguo de Clover, por lo que su uso requiere disponer de la revisión exacta de la base compatible.

El adaptador aplica un estilo «storybook anime» (ilustración infantil con acabado anime) mediante la palabra de activación `Storybook Anime Style`. El entrenamiento se realizó sobre el dataset `neonforestmist/GPT_Storybook_Anime_Style_Images` (1855 imágenes de entrenamiento y 193 de validación), con la U-Net, el CLIP text encoder y el VAE de la base congelados. La relevancia práctica es limitada y muy específica: sirve para añadir un estilo coherente a un pipeline de difusión pequeño, derivado de BK-SDM-Tiny y Stable Diffusion 1.4, sin reentrenar la base.

El repositorio es de tamaño mínimo (0.0 GB declarados), sin descargas ni valoraciones en el momento de la consulta, y con licencia CreativeML OpenRAIL-M sujeta además a obligaciones sobre datos sintéticos. La información pública disponible es la model card y su fichero de procedencia (`provenance.json`); no hay benchmarks ni métricas de calidad de imagen publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre U-Net de un modelo de difusión texto-a-imagen; base derivada de BK-SDM-Tiny y Stable Diffusion 1.4 |
| Parametros totales | no disponible (solo se indica rango 16; el repositorio declara 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión; resolución de ejemplo 512 × 512) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors del adaptador; no hay variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible; los prompts de ejemplo y la palabra de activación están en inglés, y la cobertura multilingüe hereda la del text encoder CLIP de la base |
| Licencia | CreativeML OpenRAIL-M, más obligaciones registradas sobre datos sintéticos; el dataset declara Apache-2.0 |
| Formato de pesos | `pytorch_lora_weights.safetensors` (claves Diffusers/PEFT) y `storybook-anime.safetensors` (claves down/up Clover/Core ML) |
| Rango del LoRA | 16 |
| Palabra de activacion | `Storybook Anime Style` |
| Fuerza recomendada | 0.7–1.0 |
| Parametros de muestreo sugeridos | DPM++ 2M, 20 pasos, CFG 7.5, 512 × 512 |
| Modelo base requerido | checkpoint privado «Clover Image Tiny» con composición fusionada (acceso obligatorio) |
| Pipeline | text-to-image (Diffusers) |
| Tamano del repositorio | 0.0 GB declarados |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 16 sobre un modelo de difusión latente de la familia Stable Diffusion 1.x, concretamente sobre un checkpoint «Clover Image Tiny» derivado de BK-SDM-Tiny y de Stable Diffusion 1.4. El adaptador modifica únicamente las capas entrenables del U-Net (la model card no detalla qué módulos exactos se adaptan); la U-Net base, el CLIP text encoder y el VAE permanecen congelados durante el entrenamiento. No se empleó destilación ni modelo profesor («no teacher»). La composición ya forma parte de la base compatible, de modo que no debe aplicarse dos veces.

El entrenamiento usó el dataset `neonforestmist/GPT_Storybook_Anime_Style_Images` en la revisión `ee389e088a65d73cfb40b5117efe91845314db68`, con partición de 1855 imágenes de entrenamiento y 193 de validación. Hiperparámetros declarados: batch 8, optimizador AdamW, learning rate 1e-4, 100 pasos de warmup, semilla 1337 y checkpoint final en el paso 2400 de 2400. Las imágenes del dataset no se incluyen en el repositorio. El autor indica que se revisaron visualmente las 12 imágenes de evaluación y advierte explícitamente que la pérdida de denoising no es una medida de calidad de imagen. La revisión y checksum exactos de la base compatible, así como los ajustes de la ejecución, se conservan en `provenance.json`.

## Capacidades

- Generación de imágenes texto-a-imagen con un estilo ilustrado «storybook anime» consistente, aplicado mediante la palabra de activación `Storybook Anime Style`.
- Transferencia de estilo sobre un checkpoint base concreto: misma semilla y mismo prompt producen la escena base o la versión estilizada según se cargue o no el adaptador.
- Control de intensidad del estilo mediante la fuerza del LoRA, con rango sugerido de 0.7 a 1.0.
- Compatibilidad con el ecosistema Diffusers (`pipe.load_lora_weights`) y con grafos Core ML mediante el fichero de claves down/up.
- Dos formatos de pesos equivalentes que codifican el mismo adaptador aprendido.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión de entrada, audio ni modo «thinking»: no es un modelo de lenguaje ni un modelo multimodal de entrada.
- Capacidad multilingüe de los prompts: no documentada; depende del text encoder CLIP de la base y de la cobertura del dataset de entrenamiento, mayoritariamente en inglés.

## Casos de uso

- Ilustración de libros infantiles y material educativo: el adaptador aporta un acabado coherente de cuento ilustrado en 512 × 512 con 20 pasos, adecuado para generar borradores de página que luego se retocan manualmente.
- Prototipado de arte para videojuegos indie: generación rápida de conceptos de personajes y objetos con un estilo unificado, cargando el LoRA con fuerza 0.7–1.0 sobre la base autorizada para mantener consistencia entre assets.
- Creación de mascotas y personajes de marca: variaciones de un mismo personaje en escenas distintas con el mismo estilo, útil en fase de exploración creativa antes de encargar el arte final.
- Pruebas de pipelines de generación en dispositivo (on-device): el formato de claves Core ML permite integrar el adaptador en flujos locales sobre el checkpoint compatible, útil para validar latencia y consumo en hardware de gama consumer.
- Generación de storyboards y viñetas de guion: series de imágenes con encuadres y acciones descritas en el prompt, con revisión humana obligatoria por los fallos documentados de binding entre objeto y acción.
- Contenido ilustrativo para blogs y newsletters técnicas: generación de cabeceras y figuras con estética de cuento anime, siempre que se cumplan las restricciones de uso de OpenRAIL-M y se revise la salida.
- Comparación de estilos en investigación sobre adaptadores: al conservar prompt, semilla y parámetros de muestreo entre base y adaptador, sirve como caso controlado para estudiar transferencia de estilo con LoRA de rango 16.
- Evaluación de cumplimiento y seguridad en pipelines de difusión: la evaluación en la nube conservó la comprobación de seguridad, lo que permite probar flujos de moderación sobre salidas estilizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica que las 12 imágenes de evaluación fueron revisadas visualmente y advierte que la pérdida de denoising no constituye una puntuación de calidad de imagen. No hay FID, CLIP score, ni comparaciones cuantitativas con otros adaptadores.

## Requisitos de hardware

- VRAM de inferencia: no disponible como dato publicado. Al tratarse de un LoRA sobre una base derivada de BK-SDM-Tiny (U-Net reducida respecto a SD 1.4) a 512 × 512, es razonable esperar un consumo inferior al de SD 1.4 completo en fp16; cualquier cifra concreta debe medirse en el checkpoint compatible, que es privado.
- GPU recomendadas: no disponible. Para 512 × 512 en fp16, una GPU consumer de gama media-alta es suficiente en la práctica habitual de modelos SD 1.x; el adaptador en sí añade una sobrecarga mínima de memoria frente a la base.
- Viabilidad en GPU consumer: previsiblemente sí, en tarjetas con suficiente VRAM para la base compatible; no se publica una lista de GPUs validadas.
- Despliegue: Diffusers (carga del LoRA con `load_lora_weights`), y un grafo Core ML equivalente mediante el fichero de claves down/up. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un adaptador de difusión de este tipo.
- Latencia y throughput: no disponible. Los parámetros de referencia del autor son 20 pasos, DPM++ 2M y CFG 7.5 a 512 × 512, pero no se publican tiempos por imagen ni hardware de medición.
- Almacenamiento: el repositorio declara 0.0 GB, coherente con un adaptador de rango 16 de tamaño reducido; el peso real recae en el checkpoint base privado.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores directamente comparables con métricas publicadas. La comparación más informativa es contra la propia base sin adaptador y contra el enfoque genérico de LoRA de estilo para SD 1.x.

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Storybook Anime LoRA (este) | LoRA rango 16; total no disponible | 512 × 512 en los ejemplos | sin benchmarks publicados | CreativeML OpenRAIL-M + obligaciones de datos sintéticos | pública en HF, pero requiere checkpoint base privado |
| Clover Image Tiny (base compatible, sin adaptador) | no disponible | 512 × 512 en los ejemplos | sin benchmarks publicados | la de la base (no detallada aquí) | acceso restringido, no pública |
| Checkpoint public antiguo de Clover Image Tiny | no disponible | no disponible | no validado con este LoRA según el autor | no disponible | pública, pero explícitamente no validada |
| LoRA de estilo genérico para SD 1.4 | variable según adaptador | típicamente 512 × 512 | no disponible | variable (muchas veces CreativeML OpenRAIL-M) | pública y autónoma sobre SD 1.4 |

La diferencia clave frente a un LoRA de estilo convencional es la dependencia de un checkpoint base privado y no validado contra la versión pública, lo que limita la reproducibilidad y la comparación directa.

## Limitaciones y advertencias

- No es un modelo autónomo: sin acceso al checkpoint «Clover Image Tiny» compatible y a su revisión exacta, el adaptador no es utilizable. El autor indica que no se ha validado contra el checkpoint público antiguo de Clover.
- Fallos documentados de binding: la relación entre personaje, objeto y acción puede ser incorrecta, igual que los colores solicitados, el texto y las relaciones espaciales.
- Riesgo de alucinación visual: detalles no pedidos en el prompt pueden aparecer en la imagen, y objetos o acciones solicitados pueden faltar; requiere revisión humana antes de cualquier uso público.
- Ausencia de métricas: no hay benchmarks, FID ni evaluaciones cuantitativas; las 12 imágenes revisadas por el autor no constituyen una validación sistemática.
- Falta de validación comunitaria: 0 descargas y 0 valoraciones en el momento de la consulta, con creación y actualización el 2026-10-23.
- Licencia: CreativeML OpenRAIL-M impone restricciones de uso (incluidas limitaciones sobre usos dañinos y obligación de propagar las restricciones a derivados), además de las obligaciones registradas sobre datos sintéticos. Los términos Apache-2.0 del dataset no sustituyen a los del modelo.
- Procedencia de los datos: el dataset está etiquetado como generado sintéticamente y el autor certifica permiso para el entrenamiento y la distribución pública del adaptador derivado, pero el documento del proveedor no fue inspeccionado de forma independiente. Las imágenes fuente no se incluyen.
- Idiomas: no se documenta soporte multilingüe de prompts; los ejemplos y la palabra de activación están en inglés.
- Composición: ya está incorporada en la base compatible, por lo que aplicarla de nuevo produce resultados incorrectos.
- Seguridad: la comprobación de seguridad se mantuvo en la evaluación en la nube, pero no se garantiza en despliegues locales con el grafo Core ML.
- Atribución obligatoria en cascada: Clover Image Tiny, BK-SDM-Tiny y Stable Diffusion 1.4.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neonforestmist/clover-image-tiny-storybook-anime-style-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/neonforestmist/GPT_Storybook_Anime_Style_Images
- Modelo base citado (Clover Image Tiny): https://huggingface.co/neonforestmist/Clover-Image-Tiny
- Upstream citado sin URL en la model card: BK-SDM-Tiny y Stable Diffusion 1.4
- Fichero de procedencia de la ejecución: `provenance.json` en el repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado y de caracter adulto, que se omite.
