# samttran/ltx-2.5-gguf-distilled

## Resumen

`samttran/ltx-2.5-gguf-distilled` es un repositorio de pesos cuantizados en formato GGUF del modelo de generación de vídeo **LTX-2.5** de Lightricks, en su variante *distilled*. No se trata de un modelo de lenguaje, sino de un paquete de artefactos listos para ejecutarse con [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) mediante el modo `-M vid_gen`, que incluye el transformer de difusión, el codificador de texto, los VAE de vídeo y audio, y un upscaler espacial latente.

El repositorio agrupa cuatro tipos de ficheros: el transformer de vídeo cuantizado a Q8_0 (copiado de `vantagewithai/LTX-2.5-GGUF`), el codificador de texto Gemma 4 12B con proyección adaptada a LTX-2.5 (convertido a Q8_0 por el autor), y tres safetensors bf16 copiados sin modificar del repo oficial de Lightricks (VAE de vídeo, VAE de audio y upscaler x2). El conjunto suma 41,5 GB y está pensado para que herramientas de escritorio como Idea Maker AI Desktop puedan descargar los pesos sin *gating* y verificar su integridad por SHA-256.

Su relevancia es práctica: elimina la fricción de acceso al modelo oficial (que requiere aceptar la licencia y a menudo *gating*) y ofrece una ruta de ejecución local reproducible para generación de vídeo con audio, a costa de asumir la licencia comunitaria de LTX-2.x. El conteo real de parámetros del transformer es de 13.115.791.408 (≈13,1 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (LTX-2.5) + codificador de texto Gemma 4 12B + VAE de vídeo y audio + upscaler latente x2 |
| Parametros totales | 13.115.791.408 en el transformer de vídeo (dato real de safetensors); el codificador de texto Gemma 4 12B añade parámetros adicionales no desglosados |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (transformer y codificador de texto); bf16 (VAEs y upscaler) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (`ltx-2-community-license-agreement`) |
| Formato de pesos | GGUF (transformer y text encoder) y safetensors (VAE vídeo, VAE audio, upscaler) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del transformer de difusión de LTX-2.5 más allá de su naturaleza como modelo de generación de vídeo. El paquete incluye un codificador de texto Gemma 4 12B con una proyección específica para LTX-2.5 (`gemma4-12b-with-proj-ltx-2.5`), lo que indica que la condición textual se inyecta mediante un LLM de 12B adaptado, y dos VAE separados (vídeo y audio), lo que confirma que el modelo genera vídeo con pista de audio de forma nativa. El upscaler latente x2 permite aumentar la resolución en el espacio latente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO. La variante *distilled* implica un proceso de destilación para reducir pasos de muestreo, pero los detalles concretos no están disponibles en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de vídeo a partir de prompts de texto, ejecutable localmente con stable-diffusion.cpp en modo `vid_gen`.
- Generación de audio asociado al vídeo, gracias al VAE de audio incluido (`ltx-2.5-audio-vae-bf16.safetensors`).
- Upscaling espacial latente x2 mediante `ltx-2.5-latent-spatial-upscaler-x2-bf16-1.0.safetensors`.
- Variante *distilled*, orientada a reducir el número de pasos de inferencia frente al modelo base.
- Codificación de texto mediante Gemma 4 12B con proyección adaptada a LTX-2.5.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- **Generación de clips de vídeo local sin conexión**: el paquete permite ejecutar LTX-2.5 con stable-diffusion.cpp en una máquina propia, útil para estudios que necesitan generar *b-roll* o prototipos visuales sin enviar prompts a servicios en la nube.
- **Prototipado de vídeo con audio sincronizado**: al incluir VAE de audio, se pueden generar borradores de escenas con pista sonora para previsualización en producción audiovisual antes de pasar a render final.
- **Integración en herramientas de escritorio**: el repositorio está pensado como origen de descarga para Idea Maker AI Desktop en Ubuntu, con verificación por SHA-256 y *pin* por commit, lo que facilita despliegues reproducibles en estaciones de trabajo.
- **Investigación en difusión de vídeo**: el formato GGUF Q8_0 y los safetensors bf16 permiten estudiar el comportamiento del modelo con distintas precisiones y comparar la variante *distilled* frente al modelo base.
- **Upscaling de vídeo generado**: el upscaler latente x2 incluido sirve para pipelines de superresolución de clips generados previamente con el mismo modelo, sin salir del ecosistema LTX.
- **Generación de material para previsualización de anuncios**: equipos creativos pueden iterar rápidamente sobre conceptos visuales con audio antes de contratar producción real, usando la variante *distilled* para reducir tiempos de muestreo.
- **Despliegue en entornos con requisitos de auditabilidad**: al ser pesos abiertos y verificables por hash, encaja en flujos donde se exige trazabilidad del artefacto usado para generar contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el transformer Q8_0 de ≈13,1 mil millones de parámetros ocupa del orden de 13-14 GB solo en pesos; sumando el codificador de texto Gemma 4 12B en Q8_0 (≈12-13 GB), los dos VAE y el upscaler en bf16, el conjunto completo en memoria se aproxima a los 30-35 GB. La cifra exacta no está disponible.
- **GPU recomendadas**: para el paquete completo en Q8_0, GPUs con 32-48 GB de VRAM (A100 40/80 GB, H100, RTX A6000, RTX 6000 Ada). No se dispone de datos oficiales de Lightricks para esta variante concreta.
- **¿Cabe en GPU de consumo?**: el transformer por sí solo podría caber en una RTX 4090 (24 GB) en Q8_0, pero el codificador de texto de 12B en Q8_0 difícilmente convive con él en la misma GPU; sería necesario descargar el text encoder a CPU o usar cuantizaciones más agresivas no incluidas en este repo.
- **Opciones de despliegue**: stable-diffusion.cpp (modo `-M vid_gen`), que es el runtime objetivo declarado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `samttran/ltx-2.5-gguf-distilled` (este repo) | 13,1 B | no disponible | GGUF + safetensors | LTX-2.x Community License | Abierto, sin *gating* |
| `Lightricks/LTX-2.5` (oficial) | no disponible en la información | no disponible | safetensors | LTX-2.x Community License | Oficial, posible *gating* |
| `vantagewithai/LTX-2.5-GGUF` | no disponible en la información | no disponible | GGUF | LTX-2.x Community License | Abierto |
| Otros modelos de vídeo (p. ej. familias tipo Sora, Veo, Wan) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del propio LTX-2.5 porque la información proporcionada no incluye datos de modelos competidores (parámetros, benchmarks ni licencias) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- **Licencia restrictiva para uso comercial**: la LTX-2.x Community License Agreement exige que entidades con ingresos anuales iguales o superiores a 10 millones de USD obtengan una licencia comercial de Lightricks. Además incluye restricciones de uso aceptable que deben revisarse antes de cualquier despliegue en producción.
- **Sesgos**: no disponibles en la información proporcionada; al ser un modelo de vídeo, es esperable que herede sesgos de sus datos de entrenamiento, pero no se documentan.
- **Riesgo de alucinación visual**: como todo modelo generativo de vídeo, puede producir contenido incoherente, artefactos temporales o audio desincronizado; no se han publicado tasas de fallo.
- **Limitaciones de idioma**: no se especifican los idiomas soportados por el codificador de texto Gemma 4 12B en este contexto; no hay garantías documentadas para prompts en castellano.
- **Repositorio de terceros**: los pesos del transformer y del text encoder han sido convertidos o copiados por el autor (`samttran`) y por `vantagewithai`, no por Lightricks; la fidelidad respecto al original no está verificada más allá de la conversión declarada con `sd-cli`.
- **Compatibilidad de runtime limitada**: el paquete está pensado exclusivamente para stable-diffusion.cpp (versión master-1043 en la conversión); otros runtimes pueden no cargar los GGUF correctamente.
- **Cero tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- **Sin benchmarks**: no hay métricas publicadas que permitan estimar la calidad frente al modelo base o a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/samttran/ltx-2.5-gguf-distilled
- Modelo base oficial: https://huggingface.co/Lightricks/LTX-2.5
- Repositorio GGUF de origen del transformer: https://huggingface.co/vantagewithai/LTX-2.5-GGUF
- Runtime stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Licencia LTX-2.x Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- Repositorio oficial de Lightricks LTX-2: https://github.com/Lightricks/LTX-2
