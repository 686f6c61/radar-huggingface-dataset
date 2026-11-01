# agentory/stable-audio-3-small-music-GGUF

## Resumen

Stable Audio 3 Small-Music en formato GGUF es una conversión de pesos del modelo original `stabilityai/stable-audio-3-small-music` de Stability AI, publicada por el usuario `agentory` para su uso con **sa3.cpp**, un port portable en C++/GGML del pipeline de Stable Audio 3 que elimina la dependencia de PyTorch. El modelo es un generador de audio musical a partir de texto (text-to-audio) que emplea una arquitectura de difusión compuesta por un DiT (diffusion transformer) de aproximadamente 0,5B parámetros y un autoencoder SAME-S, junto con un codificador de texto T5Gemma compartido entre todas las variantes de SA3.

La relevancia de esta ficha radica en que permite ejecutar generación musical por difusión en hardware modesto y sin stack Python: el autor reporta unos 1,7 segundos para generar un clip de 12 segundos en F16 sobre una GPU de portátil con 8 GB (RTX 5070), aproximadamente el doble de rápido que el modelo medium de la familia. Las cuantizaciones GGUF reducen el conjunto DiT+SAME-S desde 2.164 MB en F32 hasta 384 MB en Q4_K_M, lo que abre la puerta a inferencia en CPU, CUDA, Vulkan y Metal (Apple Silicon).

El repositorio tiene un tamaño de 4,9 GB y 129 descargas en el momento de la consulta, sin likes. Es importante señalar que se trata de una conversión de formato, no de un reentrenamiento: los pesos, la licencia y las capacidades son las del modelo original de Stability AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión: DiT (diffusion transformer) + autoencoder SAME-S + conditioner; codificador de texto T5Gemma externo |
| Parametros totales | 198.144 (dato de safetensors del repo); DiT de ~0,5B según la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio; genera clips de duración configurable vía `seconds_total`) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q5_K_M, Q4_K_M (DiT y SAME-S deben coincidir en encoding) |
| Idiomas soportados | Inglés (en) |
| Licencia | Stability AI Community License (uso comercial gratuito para organizaciones con ingresos anuales inferiores a 1M USD) |
| Formato de pesos | GGUF (multifichero: DiT + SAME-S + conditioner; encoder y tokenizer T5Gemma aparte) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de difusión para generación de audio: un transformer de difusión (DiT) de aproximadamente 0,5B parámetros actúa como generador principal, mientras que un autoencoder SAME-S se encarga de la representación latente del audio y de su decodificación a forma de onda. Un componente conditioner de pequeño tamaño gestiona el padding del prompt y el parámetro `seconds_total`, que controla la duración de la generación. La codificación del texto se delega en un T5Gemma (variante `t5gemma-b-b-ul2`) compartido entre todas las variantes de SA3 y distribuido en un repositorio separado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card de esta conversión no los detalla y no se han proporcionado datos del modelo base. La innovación técnica destacable de esta distribución es el port a C++/GGML (sa3.cpp), que permite inferencia sin PyTorch en CPU, CUDA, Vulkan y Metal, con un decodificador de ventana deslizante que mantiene el coste lineal en generaciones largas. El autor indica que la conversión está validada contra la referencia PyTorch con similitud coseno cercana a 1,0, y que cada nivel de cuantización pasa la comprobación `sa3-quant-check` con umbral 0,990 frente a la referencia F16.

## Capacidades

- Generación de audio musical a partir de descripciones textuales (text-to-audio), orientada a música.
- Control de duración de la generación mediante el parámetro `seconds_total` del conditioner.
- Ejecución en CPU, CUDA, Vulkan y Metal (Apple Silicon) a través de sa3.cpp.
- Cuantización agresiva con degradación controlada (Q4_K_M y Q5_K_M promueven tensores de atención V, feed-forward down y embeddings a Q6_K).
- Generaciones largas con coste lineal gracias al decodificador de ventana deslizante.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni modo thinking; es un modelo exclusivamente de generación de audio condicionada por texto.
- Soporte multilingüe limitado al inglés según los metadatos del repositorio.

## Casos de uso

- **Prototipado rápido de bandas sonoras**: generar clips musicales de 10-30 segundos a partir de prompts descriptivos en una estación de trabajo sin GPU dedicada, usando la cuantización Q4_K_M (384 MB) en CPU.
- **Integración en herramientas de escritorio nativas**: al ser un port C++/GGML sin PyTorch, puede embeberse en aplicaciones de audio (DAWs, editores de vídeo) que necesiten generar música de fondo bajo demanda sin dependencias de Python.
- **Generación en Apple Silicon**: uso en Macs con Metal para crear loops musicales en flujos de trabajo de producción audiovisual, eligiendo la cuantización por memoria y no por velocidad (en Metal el rendimiento es plano entre F16 y Q4_K_M).
- **Iteración creativa con control de duración**: el conditioner permite fijar la longitud exacta del clip, útil para generar stingers, transiciones o camas musicales que deben encajar en una duración concreta de vídeo o podcast.
- **Servicios de generación por lotes en GPU de consumo**: con ~1,7 s por clip de 12 s en una RTX 5070 (8 GB), se pueden generar decenas de variaciones por minuto para selección y curaduría posterior.
- **Investigación sobre difusión de audio**: al estar validado contra la referencia PyTorch con similitud coseno ~1,0, sirve como banco de pruebas reproducible para estudiar el efecto de la cuantización en la calidad de audio generado.
- **Despliegue en entornos con restricciones de licencia**: organizaciones por debajo de 1M USD de ingresos anuales pueden usar comercialmente el modelo y sus salidas bajo la Stability AI Community License.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FAD, CLAP score, etc.) en la información disponible. Los únicos datos de rendimiento aportados son de latencia y huella de memoria:

| Metrica | Valor |
|---|---|
| Latencia (F16, RTX 5070 8 GB) | ~1,7 s para un clip de 12 s |
| Comparación con modelo medium | ~2× más rápido |
| Aceleración por cuantización en CUDA/Vulkan | ~33% extremo a extremo |
| Aceleración en Metal (Q8_0 vs F16) | 1,7% más rápido |
| Aceleración en Metal (Q4_K_M vs F16) | 2,1% más lento |
| Similitud coseno vs referencia PyTorch | ~1,0 |
| Similitud coseno de cuantizaciones vs F16 | 0,990 (umbral `sa3-quant-check`) |

## Requisitos de hardware

- **VRAM estimada**: 2.164 MB en F32, 1.084 MB en F16, 591 MB en Q8_0, 422 MB en Q5_K_M y 384 MB en Q4_K_M para el conjunto DiT + SAME-S (el conditioner es un sidecar F32 de tamaño pequeño; el encoder T5Gemma añade requisitos adicionales no cuantificados en esta ficha).
- **GPU recomendadas**: el autor valida con una RTX 5070 de 8 GB; cualquier GPU con CUDA o Vulkan y al menos ~1-2 GB de VRAM libre debería bastar en cuantizaciones bajas.
- **GPU de consumo**: sí, cabe holgadamente en tarjetas de 8 GB e incluso en configuraciones con menos VRAM usando Q4_K_M.
- **CPU y Apple Silicon**: soporte nativo vía GGML en CPU y Metal; en Mac la cuantización no aporta velocidad, solo ahorro de memoria.
- **Opciones de despliegue**: sa3.cpp (CLI `sa3-generate`, descarga con `tools/download_models.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline de difusión.
- **Latencia y throughput**: ~1,7 s por clip de 12 s en F16 sobre RTX 5070; el decodificador de ventana deslizante mantiene el coste lineal en generaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Audio 3 Small-Music (GGUF, este) | DiT ~0,5B + SAME-S | Duración configurable vía `seconds_total` | ~1,7 s por 12 s en RTX 5070 (F16) | Stability AI Community | GGUF en HF, requiere sa3.cpp + T5Gemma |
| Stable Audio 3 Medium (referencia del autor) | No disponible | No disponible | ~2× más lento que small-music según el autor | Stability AI Community | Pesos originales de Stability AI |
| Stable Audio 3 Small-Music (original PyTorch) | DiT ~0,5B + SAME-S | Igual que la versión GGUF | Referencia de calidad (coseno ~1,0) | Stability AI Community | HF, requiere PyTorch |

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas de alternativas de otros fabricantes en la información proporcionada, por lo que la comparación se limita a las variantes de la propia familia SA3.

## Limitaciones y advertencias

- **Idioma**: el modelo solo declara soporte de inglés; los prompts en otros idiomas pueden degradar la calidad de la generación.
- **Alcance musical**: la variante small-music está orientada a música; no se documentan capacidades de efectos de sonido, voz o audio general.
- **Restricción de licencia**: uso comercial gratuito solo para organizaciones con ingresos anuales inferiores a 1M USD; por encima, se requiere licencia Enterprise de Stability AI.
- **Dependencia externa**: necesita el encoder y tokenizer T5Gemma de un repositorio de terceros (`thepatch/t5gemma-b-b-ul2-GGUF`), sujeto a los Gemma Terms of Use de Google, lo que añade una licencia adicional al stack.
- **Acoplamiento de ficheros**: el DiT y el SAME-S deben usar el mismo encoding; mezclar cuantizaciones distintas no está soportado por el resolvedor de `sa3-generate`.
- **Restricción técnica**: SAME-S requiere un número par de `--frames` (la secuencia empaquetada debe dividir el tamaño de chunk).
- **Rendimiento en Metal**: la cuantización no aporta velocidad en Apple Silicon y Q4_K_M puede ser ligeramente más lento que F16.
- **Riesgo de alucinación auditiva**: como todo modelo generativo, puede producir audio que no se corresponde fielmente con el prompt; no se han publicado métricas de fidelidad en la información disponible.
- **Conversión de formato**: al no haber reentrenamiento, hereda cualquier sesgo o limitación del modelo base de Stability AI, no documentados en esta ficha.
- **Madurez**: 129 descargas y 0 likes sugieren una adopción temprana; conviene validar la calidad en el caso de uso concreto antes de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/agentory/stable-audio-3-small-music-GGUF
- Modelo base: https://huggingface.co/stabilityai/stable-audio-3-small-music
- sa3.cpp (port C++/GGML): https://github.com/betweentwomidnights/sa3.cpp
- Benchmarks de sa3.cpp: https://github.com/betweentwomidnights/sa3.cpp/blob/main/docs/BENCHMARKS.md
- Documentación de distribución: https://github.com/betweentwomidnights/sa3.cpp/blob/main/docs/DISTRIBUTION.md
- Código fuente de Stable Audio 3 (MIT): https://github.com/Stability-AI/stable-audio-3
- Encoder y tokenizer T5Gemma: https://huggingface.co/thepatch/t5gemma-b-b-ul2-GGUF
- Licencia Stability AI Community: https://stability.ai/license
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
