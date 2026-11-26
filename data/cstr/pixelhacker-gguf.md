# cstr/PixelHacker-GGUF

## Resumen

PixelHacker-GGUF es una conversión al formato GGUF del modelo PixelHacker, un modelo de difusión latente especializado en inpainting de imágenes (relleno de regiones enmascaradas). El trabajo de conversión y cuantización lo firma el usuario cstr, mientras que el modelo original procede del repositorio hustvl/PixelHacker (checkpoint `ft_places2` entrenado sobre Places2). El modelo no genera texto ni razona: es un componente visual puro que reconstruye contenido coherente dentro de una máscara, apoyándose en un VAE SDXL como codificador y decodificador latente.

Con 862.251.708 parámetros, el modelo se distribuye en cuatro variantes de precisión (F32, F16, Q8_0 y Q4_K) con barras de aceptación explícitas de similitud coseno respecto al original en PyTorch. La conversión es relevante porque permite ejecutar inpainting de calidad en el motor nativo de CrispEmbed sin depender de PyTorch, y porque publica verificaciones de fidelidad numérica por variante, algo poco habitual en conversiones de modelos de difusión a GGUF.

La publicación es experimental: los ficheros solo funcionan dentro de CrispEmbed bajo flags desactivados por defecto (`CRISPEMBED_PIXELHACKER=1` y, para variantes cuantizadas, `CRISPEMBED_INPAINT_QUANT=1`). No es un modelo autónomo ni un paquete listo para usar en otros runners.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para inpainting (checkpoint `ft_places2`); requiere VAE SDXL como companion |
| Parametros totales | 862.251.708 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K |
| Idiomas soportados | No disponible (modelo sin entrada de texto) |
| Licencia | MIT (pesos); código upstream Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo original es un modelo de difusión latente para inpainting entrenado sobre Places2 (checkpoint `ft_places2`), según la lineage declarada en la model card. Opera en el espacio latente de un VAE SDXL: el VAE codifica la imagen y la máscara, el modelo de difusión reconstruye la región enmascarada y el VAE decodifica el resultado. La conversión a GGUF se realizó con el script `models/convert-latent-inpaint-to-gguf.py` y el cuantizador `crispembed-quantize` (política `inpaint-v1`); los ficheros publicados son copias exactas de los ya cualificados, sin recuantización adicional.

No se dispone de información sobre el número de tokens o pasos de entrenamiento, la composición exacta del dataset más allá de Places2, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO (no aplicables en un modelo de difusión de este tipo). La innovación técnica destacable es la propia cadena de conversión y validación: cada variante se contrasta contra el modelo PyTorch original con una métrica de coseno mínimo sobre casos sintéticos (y sobre fotos reales en Q8_0 y Q4_K), con barras de aceptación publicadas.

## Capacidades

- Inpainting de imágenes: reconstrucción de regiones enmascaradas con coherencia visual respecto al contexto circundante.
- Integración con VAE SDXL: requiere el companion `cstr/SDXL-VAE-inpaint-GGUF` en la misma precisión que el modelo (F32 con F32, Q8_0 con Q8_0, etc.).
- Ejecución nativa en CrispEmbed: motor de inpainting propio, sin dependencia de PyTorch en tiempo de inferencia.
- Cuantización con fidelidad verificada: coseno mínimo de 0,9859 (Q8_0) y 0,9425 (Q4_K) frente al original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No procesa entrada de texto ni tiene capacidades multilingües.

## Casos de uso

- Restauración de fotografías: eliminar objetos no deseados o reconstruir zonas dañadas en imágenes de archivo, usando el modelo con el VAE SDXL en la misma precisión para mantener la coherencia cromática.
- Edición de producto en e-commerce: borrar fondos o elementos accesorios en fotos de catálogo y rellenar con textura coherente, aprovechando que el checkpoint está entrenado sobre Places2 (escenas y entornos).
- Limpieza de imágenes médicas o de inspección: eliminar anotaciones, marcas de agua o artefactos sobre regiones enmascaradas antes de pasarlas a un pipeline de análisis posterior.
- Preprocesado para datasets de visión: generar variaciones controladas de imágenes enmascaradas para aumento de datos, con la variante Q4_K si el presupuesto de VRAM es ajustado.
- Integración en herramientas de edición dentro de CrispEmbed: el modelo se invoca desde el motor nativo con los flags `CRISPEMBED_PIXELHACKER=1` y `CRISPEMBED_INPAINT_QUANT=1`, adecuado para flujos de edición interactiva donde no se quiere cargar PyTorch.
- Prototipado de pipelines de inpainting sin GPU de datacenter: la variante Q4_K (487 MB) permite experimentar en hardware modesto antes de escalar a F16 o F32 para producción.
- Validación de conversiones GGUF: servir como caso de referencia para equipos que conviertan modelos de difusión a GGUF y quieran replicar la metodología de barras de coseno por variante.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad de la conversión (coseno mínimo sobre casos), no benchmarks de calidad de inpainting tipo FID o LPIPS.

| Variante | Fichero | Bytes | Coseno mínimo | Barra | Notas |
|---|---|---|---|---|---|
| F32 | `pixelhacker-f32.gguf` | 3.449.075.872 | 1,0 | > 0,99 | Emparejar con SDXL-VAE F32 |
| F16 | `pixelhacker-f16.gguf` | 1.725.648.672 | 0,999999 | > 0,98 | Solo panel sintético; sin ejecución F16 sobre fotos |
| Q8_0 | `pixelhacker-q8_0.gguf` | 917.886.464 | 0,9859 | > 0,97 | Emparejar con SDXL-VAE Q8_0 |
| Q4_K | `pixelhacker-q4_k.gguf` | 487.079.936 | 0,9425 | > 0,94 | Al límite: 0,9425 sobre fotos |

No se han publicado resultados de benchmarks de calidad de imagen (FID, LPIPS, PSNR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, el fichero F32 ocupa 3,45 GB y el Q4_K 487 MB, a lo que hay que sumar el VAE SDXL companion en la misma precisión.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 8 GB de VRAM debería manejar la variante Q8_0 junto al VAE, y 16 GB o más para F32.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 y superiores para Q4_K y Q8_0; F32 requiere más margen.
- Opciones de despliegue: exclusivamente el motor nativo de CrispEmbed; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son runners de texto y este es un modelo de difusión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|
| PixelHacker-GGUF (cstr) | 862 M | GGUF (F32/F16/Q8_0/Q4_K) | MIT (pesos) | Imagen + máscara | Hugging Face, solo CrispEmbed |
| PixelHacker original (hustvl) | 862 M | PyTorch `.bin` | MIT (pesos), Apache-2.0 (código) | Imagen + máscara | Hugging Face, PyTorch |
| SDXL-VAE-inpaint-GGUF (cstr) | No disponible | GGUF | No disponible en la información | Imagen latente | Hugging Face, companion obligatorio |

No se dispone de datos de benchmarks comparativos con otros modelos de inpainting (p. ej. LaMa, MAT) en la información proporcionada.

## Limitaciones y advertencias

- Estado experimental: los ficheros solo se ejecutan en CrispEmbed y con flags desactivados por defecto; no hay garantía de funcionamiento en otros runners.
- Dependencia obligatoria de un VAE SDXL companion en la misma precisión; mezclar precisiones entre modelo y VAE no está validado.
- La variante Q4_K está al límite de su barra de aceptación (0,9425 frente a 0,94 sobre fotos), por lo que puede degradar resultados en casos exigentes.
- La variante F16 solo se validó sobre panel sintético, sin ejecución sobre fotos reales.
- Entrenado sobre Places2: el dominio son escenas y entornos, no retratos, texto o ilustraciones; el rendimiento fuera de ese dominio no está documentado.
- Riesgo de artefactos y de relleno incoherente en regiones grandes o con estructura compleja, inherente a los modelos de difusión de inpainting.
- No hay información sobre sesgos demográficos o culturales del checkpoint original.
- Licencia MIT para los pesos, pero el código upstream es Apache-2.0; conviene revisar los ficheros `licenses/` incluidos antes de uso comercial.
- Sin soporte de texto, tool calling ni agentes: no es sustituible por un LLM en ningún flujo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cstr/PixelHacker-GGUF
- VAE companion: https://huggingface.co/cstr/SDXL-VAE-inpaint-GGUF
- Código upstream PixelHacker: https://github.com/hustvl/PixelHacker/tree/f5567db2871598aa178fe7a34c520dd478a0b41b
- Pesos originales: https://huggingface.co/hustvl/PixelHacker/resolve/012fd343158936a265b8a0ee38a791a7a2841f45/ft_places2/diffusion_pytorch_model.bin
- Documentación de CrispEmbed sobre inpainting: `docs/inpainting-cli.md` y `docs/inpainting-precision.md` (referenciadas en la model card, sin URL pública en la información disponible)
