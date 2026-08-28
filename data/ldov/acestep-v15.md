# ldov/acestep-v15

## Resumen

ACE-Step 1.5 es un modelo de generación de música texto-a-música desarrollado por ACE Studio y StepFun, y esta versión (`ldov/acestep-v15`) es una implementación independiente en C++/GGML que proporciona pesos pre-cuantizados en formato GGUF. El modelo convierte descripciones textuales y letras en audio estéreo de 48 kHz, y está diseñado para ejecutarse localmente en CPU, CUDA, Metal o Vulkan mediante el proyecto `acestep.cpp`.

La arquitectura es un pipeline de dos etapas: un modelo de lenguaje autoregresivo (basado en Qwen3) genera códigos de audio a 5 Hz (cada token representa 200 ms de música), y un transformer de difusión (DiT) con flow matching refina la señal a 25 Hz para producir los detalles de alta frecuencia (timbre, transitorios, articulación vocal, imagen estéreo). Un VAE decodifica los latentes finales a audio de 48 kHz. El modelo completo se compone de varios submodelos con tamaños que van desde 0.6B hasta 4B de parámetros, lo que permite escalar según los recursos disponibles.

Esta versión es relevante porque democratiza la generación de música de alta calidad en hardware local, con soporte para cuantización agresiva (Q4_K_M, Q5_K_M, Q6_K, Q8_0) y una interfaz de servidor web integrada. La licencia MIT permite uso comercial sin restricciones, y el modelo soporta diez idiomas para las instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: LM autoregresivo (Qwen3 causal) + DiT (flow matching) + VAE + text encoder (Qwen3-Embedding-0.6B) |
| Parametros totales | No disponible (modelo multi-componente; el VAE tiene 662.884.352 parametros segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (segun componente) |
| Idiomas soportados | en, fr, zh, ja, ko, de, es, it, pt, ru |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo sigue un diseño de generación en dos fases. La primera fase usa un LM causal basado en la arquitectura Qwen3 (disponible en tamaños de 0.6B, 1.7B y 4B) que opera a 5 Hz: cada token generado corresponde a 200 ms de música, con un vocabulario de 64.000 códigos aprendidos. Este LM construye la estructura musical global de forma autoregresiva, incluyendo metadatos, letras y códigos de audio. La segunda fase emplea un DiT (diffusion transformer) con flow matching y pasos de Euler, que trabaja a 25 Hz (un frame cada 40 ms) para sintetizar los detalles finos del audio. El DiT está disponible en versiones estándar (2B) y XL (4B), con variantes como `turbo` (8 pasos), `sft` (32-50 pasos) y `sftturbo50` (mezcla de pesos). Un VAE (siempre en BF16) decodifica los latentes a audio estéreo de 48 kHz.

El LM y el DiT fueron co-entrenados con los mismos datos de música, lo que garantiza coherencia entre la estructura global y los detalles locales. No se especifican detalles sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO. El text encoder (Qwen3-Embedding-0.6B) está congelado y sus pesos de proyección (1024 a 2048) están integrados en cada checkpoint del DiT, por lo que no puede sustituirse por otro encoder.

## Capacidades

- Generación de música a partir de una descripción textual (caption) y letras opcionales, con salida estéreo de 48 kHz.
- Soporte de modos "cover": puede tomar un audio fuente como contexto (codificado por el VAE) y un audio de referencia para condicionar el timbre.
- Generación por lotes (batching) tanto en la etapa LM como en la DiT, lo que permite generar múltiples pistas en paralelo.
- Control fino mediante parámetros de inferencia (temperatura, top-p, etc.) para ajustar la creatividad y la coherencia.
- Multilingüe: acepta instrucciones en diez idiomas (inglés, francés, chino, japonés, coreano, alemán, español, italiano, portugués y ruso).
- Ejecución en CPU, CUDA, Metal y Vulkan gracias a la implementación GGML.
- Interfaz web integrada (ace-server) que gestiona la carga y el intercambio automático de modelos.

## Casos de uso

- Producción musical independiente: un compositor puede generar demos rápidas describiendo el estilo, el tempo y la instrumentación, y luego iterar sobre las letras para refinar la estructura. El modelo permite generar pistas completas de 48 kHz sin necesidad de hardware especializado.
- Creación de bandas sonoras para videojuegos: los desarrolladores pueden generar música ambiental o temática a partir de descripciones textuales, con la posibilidad de usar el modo cover para adaptar una melodía existente a diferentes estados de ánimo.
- Generación de jingles y cuñas publicitarias: agencias pueden producir múltiples variaciones de una pieza musical cambiando solo el caption y las letras, acelerando el proceso creativo.
- Educación musical: profesores y estudiantes pueden explorar conceptos de composición generando ejemplos auditivos a partir de descripciones, lo que facilita el análisis de estructuras musicales.
- Prototipado de contenido audiovisual: creadores de vídeo pueden generar música de fondo provisional para sus proyectos antes de encargar una composición original, ahorrando tiempo y costes.
- Investigación en generación musical: el modelo sirve como base para experimentos sobre control fino, transferencia de estilo y evaluación de calidad perceptual, gracias a su licencia MIT y a la disponibilidad de pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion menciona que el modelo "supera a casi todas las alternativas comerciales" en el repositorio original, pero no se proporcionan métricas cuantitativas (como FAD, CLAP score o preferencia humana) en esta version GGUF.

## Requisitos de hardware

- La configuracion minima recomendada (turbo esencial) incluye el LM 4B Q8_0 (4.2 GB), el DiT 2B Q8_0 (2.4 GB), el VAE BF16 (322 MB) y el text encoder Q8_0 (748 MB), totalizando aproximadamente 7.7 GB de VRAM. Esto cabe en GPUs de consumo como la RTX 3060 (12 GB) o la RTX 4060 (8 GB) con cuantizaciones mas agresivas.
- Para la version XL (DiT 4B), el modelo Q8_0 pesa 5.0 GB, y el LM 4B Q8_0 4.2 GB, sumando unos 9.2 GB solo para esos dos componentes, mas el VAE y el text encoder. Se recomienda una GPU con al menos 12 GB de VRAM (RTX 4070, RTX 3080) o 16 GB para mayor comodidad.
- En CPU, la generacion es posible pero lenta; se recomienda al menos 16 GB de RAM y un procesador moderno con soporte AVX2. La implementacion GGML permite usar Metal en Macs y Vulkan en GPUs AMD/Intel.
- Opciones de despliegue: `acestep.cpp` ofrece un servidor web (`ace-server`) con interfaz integrada, y herramientas CLI (`ace-lm` y `ace-synth`) para integracion en pipelines. No se menciona soporte para vLLM, Ollama o TGI, ya que es una implementacion especifica.
- La latencia depende del hardware y de la cuantizacion. Con una GPU moderna y el modo turbo (8 pasos), una generacion tipica puede completarse en decenas de segundos; en CPU puede tardar varios minutos. No se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de generacion de musica (como MusicGen, Stable Audio o AudioLDM) en la informacion proporcionada. El repositorio original afirma un rendimiento superior a alternativas comerciales, pero no se ofrecen datos numericos verificables. Por tanto, no se incluye tabla comparativa.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos musicales, puede reflejar sesgos de genero, culturales o de estilo presentes en el corpus de entrenamiento.
- Riesgo de alucinacion auditiva: el modelo puede generar elementos musicales que no se corresponden con la descripcion textual, especialmente con captions ambiguos o muy complejos.
- La calidad de la generacion depende en gran medida de la cuantizacion; las versiones Q4_K_M pueden degradar la fidelidad del audio, especialmente en el DiT.
- El LM de 4B no tiene cuantizacion Q4_K_M porque rompe la generacion de codigos de audio; solo se ofrecen Q8_0, Q6_K y Q5_K_M para ese componente.
- El text encoder esta fijado a Qwen3-Embedding-0.6B; no es posible sustituirlo por otro modelo sin reentrenar el DiT.
- Aunque la licencia MIT permite uso comercial, los derechos de autor de la musica generada pueden ser cuestionados en algunas jurisdicciones; el usuario debe verificar la legislacion local.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es una publicacion reciente o poco difundida; la comunidad aun no ha validado su estabilidad en produccion.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/ldov/acestep-v15)
- [Codigo fuente de acestep.cpp](https://github.com/ServeurpersoCom/acestep.cpp)
- [Repositorio original de ACE-Step 1.5](https://github.com/ace-step/ACE-Step-1.5)
- [Modelo base original en HuggingFace](https://huggingface.co/ACE-Step/acestep-v15-base)
- [Modelo original ACE-Step (primera version)](https://github.com/ace-step/ACE-Step)
- [Modelo en ModelScope (variante XL)](https://modelscope.ai/models/ACE-Step/acestep-v15-xl-base)
- [Guia para musicos (discusion en GitHub)](https://github.com/ace-step/ACE-Step-1.5/discussions/235)
- [Tutorial tecnico (documentacion oficial)](https://github.com/ace-step/ACE-Step-1.5/blob/main/docs/en/Tutorial.md)
