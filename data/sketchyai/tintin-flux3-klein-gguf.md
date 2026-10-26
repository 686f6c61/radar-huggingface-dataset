# SketchyAI/tintin-flux3-klein-GGUF

## Resumen

tintin-flux3-klein-GGUF es una cuantización en formato GGUF del modelo de difusión FLUX 3 Image Klein Base de Black Forest Labs, publicada por el usuario SketchyAI. No se trata de un modelo original: es un *merge* del checkpoint base con el adaptador `SketchyAI/tintin-flux3-klein-LoRA` (un LoRA de estética de cómic franco-belga inspirado en Tintín) aplicado a fuerza 0,85 y posteriormente convertido a GGUF. El resultado es un *diffusion transformer* de 5.538.458.368 parámetros (unos 5,54 mil millones) orientado exclusivamente a texto-a-imagen.

Su relevancia es acotada y muy específica: permite ejecutar localmente una variante estilizada de FLUX 3 Klein en runtimes que consumen GGUF, en particular `stable-diffusion.cpp` y los nodos GGUF de ComfyUI, reduciendo el peso del transformer frente a los pesos originales en bf16/fp8. El repositorio ocupa 13,9 GB, lo que sugiere varios presets de cuantización en el mismo *repo*.

Conviene subrayar dos advertencias que el propio autor explicita en la model card: el modelo **no incluye** el codificador de texto (Qwen3-VL-4B) ni el VAE (FLUX 2), que deben descargarse por separado, y **no se ha documentado una validación de inferencia** de los ficheros generados. El autor indica que la conversión correcta no equivale a una prueba de inferencia y deja pendiente actualizar el estado de validación. Con 0 descargas y 1 *like* en el momento de la ficha, se trata de una publicación recién creada y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT); solo el transformer de difusión, sin codificador de texto ni VAE |
| Parametros totales | 5.538.458.368 (aprox. 5,54 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible: modelo de difusión; el prompt se procesa con Qwen3-VL-4B, distribuido aparte |
| Tipos de cuantizacion | Presets GGUF; los tipos exactos, tamanos, hashes de origen y revision del conversor estan en `quantization_manifest.json` (no detallados en la model card). La etiqueta del fichero es un preset, no garantiza la misma precision en todos los tensores |
| Idiomas soportados | no disponible (depende del codificador de texto Qwen3-VL-4B, no incluido) |
| Licencia | `other` (ver `LICENSE.md` y `NOTICE.md` en el repositorio; modificacion independiente no avalada por Black Forest Labs) |
| Formato de pesos | GGUF (cuantizado) |
| Modelo base | black-forest-labs/flux-3-image-klein-base |
| Modificacion aplicada | Merge con `SketchyAI/tintin-flux3-klein-LoRA` a fuerza 0,85, seguido de cuantizacion |
| Componentes externos requeridos | Qwen3-VL-4B (text encoder) y FLUX 2 VAE |
| Runtime compatible | Runtime de imagen con soporte de FLUX 3 (p. ej. `stable-diffusion.cpp`, ComfyUI con nodos GGUF) |
| Tamano del repositorio | 13,9 GB |
| Parametros de muestreo sugeridos (Base) | 50 pasos, CFG 3,5; caption de escena detallado |
| Descargas / likes | 0 / 1 |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un *diffusion transformer* (DiT) propio de la familia FLUX 3, con 5,54 B de parámetros en el transformer de difusión. El modelo no es un modelo de lenguaje: no genera tokens de texto y no debe confundirse con un LLM cuantizado en GGUF. La cadena de inferencia completa requiere tres piezas separadas: el codificador de texto Qwen3-VL-4B, el transformer de difusión (este repositorio) y el VAE FLUX 2. El prompt se introduce como una caption de escena detallada, no como una instrucción conversacional.

No hay información pública en la documentación disponible sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni sobre innovaciones técnicas concretas del modelo base. Lo único documentado es el proceso de *post-entrenamiento* realizado por SketchyAI: aplicación del LoRA de estilo Tintín a fuerza 0,85 sobre FLUX 3 Image Klein Base y cuantización posterior a GGUF. La conversión se realizó con un conversor cuya revisión se registra en `quantization_manifest.json`, junto con los hashes del modelo de origen, lo que permite reproducibilidad y auditoría de la cadena de conversión.

Según fuentes externas de la comunidad (tutoriales de Stable Diffusion Tutorials), FLUX 3 Image Klein unifica generación y edición de imagen en un solo modelo, con soporte de múltiples imágenes de referencia, guía espacial y mejora de prompt. Estas capacidades corresponden al modelo base; no hay confirmación de que se conserven intactas tras el *merge* con el LoRA y la cuantización.

## Capacidades

- Generación de imágenes a partir de texto (*text-to-image*) con estética de cómic franco-belga heredada del LoRA Tintín.
- Estilización consistente de personajes y escenas dentro de esa estética, al haber sido fusionado el LoRA en los pesos en lugar de aplicarse en tiempo de inferencia.
- Composición de escenas complejas mediante captions detalladas, siguiendo la recomendación del autor de usar descripciones de escena extensas.
- Ejecución local en runtimes GGUF de imagen (`stable-diffusion.cpp`, ComfyUI con nodos GGUF).
- Compatibilidad potencial con flujos de edición y referencia múltiple del modelo base FLUX 3 Klein (no verificada en esta cuantización).
- No soporta *tool calling*, *function calling*, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No soporta visión de entrada ni audio: es un modelo generativo de imagen, no multimodal de entrada.
- Cobertura multilingüe de prompts: no disponible (depende del text encoder Qwen3-VL-4B, que se distribuye aparte).

## Casos de uso

- **Ilustración de cómic y fanzine:** generación de viñetas y personajes con estética franco-belga para prototipado rápido de páginas, aprovechando que el estilo está fundido en los pesos y no requiere cargar un LoRA adicional en el grafo.
- **Previsualización de arte conceptual:** generación de *thumbnails* estilizados para dirección de arte en proyectos de animación o editorial, con la ventaja de ejecutarse en local sin enviar prompts a servicios externos.
- **Material promocional temático:** creación de carteles, portadas y assets para eventos o publicaciones con un estilo gráfico coherente y reconocible, usando captions detalladas para controlar composición y paleta.
- **Pruebas de infraestructura de inferencia local:** escenario idóneo para validar pipelines GGUF en `stable-diffusion.cpp` o ComfyUI con un modelo de 5,54 B, midiendo VRAM, latencia y calidad antes de invertir en modelos mayores.
- **Generación por lotes en estación de trabajo:** al ser un DiT de 5,54 B cuantizado, cabe en GPU de consumo con la cuantización adecuada, lo que permite producir variaciones masivas de un mismo concepto durante la noche.
- **Investigación sobre *merges* de LoRA y cuantización:** el repositorio documenta fuerza de merge, hashes de origen y manifiesto de cuantización, lo que lo convierte en un caso de estudio útil para medir la degradación introducida por la cuantización en un DiT.
- **Contenido editorial interno con restricciones de confidencialidad:** al ejecutarse en local y no requerir API externa, encaja en flujos donde los prompts no pueden salir de la organización (sujeto a los términos de la licencia del modelo base).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (FID, CLIP score, HPSv2), comparaciones con el modelo base sin cuantizar ni pruebas de inferencia documentadas. El autor indica explícitamente que los ficheros GGUF deben cargarse y probarse antes de su publicación y que el éxito de la conversión no constituye una prueba de inferencia, por lo que el estado de validación queda pendiente de actualización.

## Requisitos de hardware

- **Peso del transformer (estimación a partir de 5,54 B de parámetros):** ~11,1 GB en FP16; ~5,9 GB en Q8; ~4,4 GB en Q6; ~3,0 GB en Q4. Son cálculos teóricos sobre el número de parámetros, no mediciones publicadas.
- **Componentes adicionales:** hay que sumar el codificador de texto Qwen3-VL-4B (~8 GB en FP16, ~2,5 GB en Q4) y el VAE FLUX 2 (menos de 1 GB). El total en VRAM es sensiblemente mayor que el del transformer aislado.
- **GPU de consumo:** una RTX 4090 (24 GB) permite Q8 del transformer más el text encoder cuantizado y el VAE con margen. Una RTX 4080 (16 GB) o 4070 Ti (12-16 GB) requiere Q4/Q5 y, previsiblemente, *offloading* del text encoder. Una RTX 3060 (12 GB) solo es viable en Q4 con gestión cuidadosa de memoria.
- **GPU de datacenter:** A100 (40/80 GB) y H100 (80 GB) permiten trabajar en FP16 con lotes mayores y sin cuantizar el transformer.
- **Opciones de despliegue:** `stable-diffusion.cpp` (etiqueta declarada por el autor), ComfyUI con nodos GGUF (flujo documentado por tutoriales de la comunidad para FLUX 3 Klein), y cualquier runtime que implemente la arquitectura FLUX 3 y lea GGUF. No es compatible con vLLM, TGI, llama.cpp ni Ollama, que no soportan este tipo de modelo.
- **Latencia y throughput:** no disponibles. Dependen del preset de cuantización, la resolución, los pasos (el autor sugiere 50) y el hardware; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Estado / disponibilidad |
|---|---|---|---|---|
| SketchyAI/tintin-flux3-klein-GGUF | 5,54 B (DiT) | GGUF cuantizado, con LoRA Tintín fusionado a 0,85 | `other` (ver LICENSE.md) | 0 descargas, 1 like; validación de inferencia no documentada |
| black-forest-labs/flux-3-image-klein-base | no disponible en la informacion | Pesos originales (bf16/fp8/nvfp4 segun fuentes de la comunidad) | licencia de Black Forest Labs | Modelo de referencia, ampliamente distribuido; incluye generación y edición |
| realrebelai/FLUX-3-Image-Klein_GGUFs | mismas dimensiones que el base (no detallado) | GGUF cuantizado, sin LoRA | no disponible | Cuantizaciones alternativas del base sin modificación de estilo |
| SketchyAI/tintin-flux3-klein-LoRA | adaptador (no checkpoint completo) | LoRA | `other` | Adaptador de estilo original; requiere cargarse sobre el base |

La diferencia funcional frente a las otras tres opciones es el estilo: solo esta cuantización lleva el LoRA Tintín fusionado en los pesos, lo que simplifica el grafo en ComfyUI a costa de perder la capacidad de ajustar la fuerza del LoRA en tiempo de inferencia.

## Limitaciones y advertencias

- **Licencia restrictiva o poco clara:** la licencia es `other`; hay que leer `LICENSE.md` y `NOTICE.md` antes de cualquier uso comercial. Al derivar de FLUX 3 Image Klein Base, es probable queherede restricciones de Black Forest Labs, pero el texto concreto no está disponible en la información proporcionada.
- **Modificación no avalada:** el autor declara explícitamente que es un modelo modificado de forma independiente y no respaldado por Black Forest Labs, lo que excluye cualquier soporte oficial.
- **Sin validación de inferencia:** no hay evidencia de que los GGUF carguen y generen imágenes correctamente. El propio autor reconoce que la conversión exitosa no es una prueba de inferencia y deja pendiente actualizar el estado de validación con versiones de runtime y ejemplos probados.
- **Dependencias externas obligatorias:** sin Qwen3-VL-4B y FLUX 2 VAE el modelo no produce nada. Un usuario que descargue solo este repositorio obtendrá un error de carga.
- **Sesgo de estilo:** la fusión del LoRA a fuerza 0,85 desplaza la distribución de salida hacia la estética de cómic franco-belga, lo que reduce la diversidad estilística y puede degradar el fotorrealismo respecto al base.
- **Riesgo de alucinación visual:** como todo modelo generativo de imagen, puede producir anatomía incorrecta, texto ilegible dentro de la imagen, perspectivas incoherentes y elementos duplicados, especialmente con prompts poco detallados.
- **Cuantización no uniforme:** la etiqueta del fichero es un preset y no garantiza la misma precisión en todos los tensores; la degradación respecto al base no está medida.
- **Sin datos de idioma:** se desconoce el rendimiento con prompts en castellano; el codificador Qwen3-VL-4B es multilingüe, pero no hay evaluación publicada de esta combinación.
- **Madurez y soporte:** 0 descargas y 1 like implican ausencia de validación comunitaria, de issues resueltos y de ejemplos verificados por terceros.
- **Trazabilidad del merge:** la fuerza 0,85 está documentada, pero no se detalla la receta exacta de fusión ni se ofrecen comparaciones visuales frente al base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SketchyAI/tintin-flux3-klein-GGUF
- LoRA de origen: https://huggingface.co/SketchyAI/tintin-flux3-klein-LoRA
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Manifiesto de cuantización (en el repo): `quantization_manifest.json`
- Licencia y avisos (en el repo): `LICENSE.md`, `NOTICE.md`
- Cuantizaciones GGUF alternativas del base: https://huggingface.co/realrebelai/FLUX-3-Image-Klein_GGUFs/tree/main
- Tutorial de flujo GGUF en ComfyUI: https://www.kombitz.com/2026/10/18/how-to-use-flux-3-klein-gguf-workflow-in-comfyui/
- Checkpoint en Civitai: https://civitai.com/models/3005306/flux3-klein-gguf
- Artículo sobre FLUX 3 Image Klein (generación y edición): https://www.stablediffusiontutorials.com/2026/10/flux3-image-klein.html
