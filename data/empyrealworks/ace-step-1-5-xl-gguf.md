# empyrealworks/ACE-Step-1.5-XL-GGUF

## Resumen

ACE-Step 1.5 XL GGUF es una conversión al formato GGUF del modelo de generación de música ACE-Step 1.5 XL, desarrollado originalmente por el equipo ACE-Step. El repositorio, publicado por empyrealworks, empaqueta en formato GGUF los dos variantes del DiT (SFT y turbo), el codificador de texto Qwen3-Embedding-0.6B y el VAE, todo ello para su uso con el motor de inferencia acestep.cpp. El modelo base resuelve el problema de la síntesis de audio musical condicionada por texto (text-to-audio), permitiendo generar canciones con letra, tempo y tonalidad especificados.

La arquitectura combina un transformer de difusión (DiT) de aproximadamente 4.990 millones de parámetros con un codificador de texto Qwen3-Embedding-0.6B y un VAE para la decodificación al dominio de audio. La conversión a GGUF y la cuantización permiten ejecutar el modelo en hardware de consumo, algo que los checkpoints originales en FP32 dificultaban. El repositorio incluye dos variantes del DiT: SFT (fine-tuning supervisado) y turbo, cada una con compromisos distintos entre fidelidad y velocidad.

La relevancia de esta ficha radica en que se trata de una cuantización reciente (noviembre de 2026) orientada a despliegue local, con métricas de calidad comparativas frente a la conversión BF16 de referencia. La licencia MIT del modelo original facilita su uso comercial, aunque el codificador de texto deriva de Qwen3-Embedding-0.6B, publicado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para audio, con codificador de texto Qwen3-Embedding-0.6B y VAE |
| Parametros totales | 4.988.270.726 (DiT XL) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (SFT DiT), Q6_K (turbo DiT y text encoder), BF16 (VAE) |
| Idiomas soportados | no disponible (la model card menciona letras en inglés en las pruebas) |
| Licencia | MIT (modelo base ACE-Step 1.5); codificador Qwen3-Embedding-0.6B bajo Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base ACE-Step 1.5 XL emplea un Diffusion Transformer (DiT) de aproximadamente 4.990 millones de parámetros como generador principal, condicionado por un codificador de texto Qwen3-Embedding-0.6B que transforma las indicaciones textuales (letra, estilo, tempo, tonalidad) en embeddings. Un VAE se encarga de la decodificación final al dominio de audio. El repositorio GGUF incluye dos variantes del DiT: SFT (fine-tuning supervisado) y turbo, esta última orientada a una generación más rápida con un ligero compromiso en fidelidad de la letra.

La conversión se realizó desde los checkpoints originales en FP32 mediante el script `convert.py` de acestep.cpp (commit `973517be024ff8b6bbd50e0adc9e308ab2ed71b3`), seguida de una cuantización con `tools/quantize.cpp` extendido con formatos ggml adicionales. Las proyecciones de entrada y salida del DiT se mantienen en BF16 para preservar la calidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de audio musical a partir de texto (text-to-audio): produce canciones completas con letra, tempo y tonalidad controlables.
- Control de atributos musicales: la model card menciona pruebas con 125 BPM y tonalidad de A menor, lo que indica soporte para especificar tempo y key.
- Generación con letra: el modelo sintetiza voces con letra en inglés (según las pruebas documentadas), evaluada mediante word error rate (WER) sobre las voces separadas.
- Dos modos de inferencia: variante SFT (mayor fidelidad de letra) y variante turbo (mayor calidad estética y velocidad).
- Integración con acestep.cpp: los archivos GGUF están diseñados para este motor de inferencia concreto.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión o audio de entrada en la información proporcionada.

## Casos de uso

- Producción musical asistida por IA en local: el modelo permite generar canciones completas con letra y parámetros musicales definidos (tempo, tonalidad) en hardware de consumo gracias a la cuantización GGUF, sin depender de servicios en la nube.
- Prototipado rápido de ideas musicales: la variante turbo, con Q6_K y mayor calidad estética (PQ 7.94, CE 7.23), es adecuada para iterar rápidamente sobre bocetos de canciones antes de refinar con la variante SFT.
- Generación de bandas sonoras para contenido audiovisual: el control de tempo y tonalidad permite adaptar la música a escenas concretas, y la licencia MIT facilita su integración en proyectos comerciales.
- Investigación en síntesis musical: el repositorio ofrece métricas reproducibles (WER, tempo, key, PQ, CE) que permiten comparar cuantizaciones y variantes en experimentos académicos.
- Despliegue en pipelines de generación de audio con acestep.cpp: los archivos GGUF están optimizados para este motor, lo que facilita la integración en flujos de trabajo automatizados de generación musical.
- Educación y experimentación con modelos de difusión para audio: la disponibilidad de pesos cuantizados y un VAE en BF16 permite estudiar el funcionamiento interno de un DiT aplicado a música en entornos con recursos limitados.
- Generación de música personalizada para streaming o podcasts: la posibilidad de especificar letra y estilo permite crear cortinillas o temas adaptados a un programa concreto, con la ventaja de la licencia permisiva.

## Benchmarks y rendimiento

La model card incluye una comparación de calidad entre los archivos GGUF y la conversión BF16 de referencia, evaluada sobre una petición de 150 segundos con letra en inglés, 125 BPM y A menor, con seis semillas, en una RTX 5090:

| Modelo | Lyric WER | Tempo, key | PQ | CE |
|---|---|---|---|---|
| SFT, BF16 DiT y text encoder | 14,7% | 6/6, 6/6 | 7,79 | 6,85 |
| SFT, estos archivos | 13,5% | 6/6, 6/6 | 7,77 | 6,78 |
| turbo, BF16 DiT y text encoder | 15,8% | 6/6, 6/6 | 7,95 | 7,15 |
| turbo, estos archivos | 16,9% | 6/6, 6/6 | 7,94 | 7,23 |

La model card señala además que formatos más pequeños empeoran: los DiT en Q4 pierden inteligibilidad de la letra (WER del 19-29%) y un codificador de texto en 4 bits pierde el tempo solicitado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no aplican a un modelo text-to-audio.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 8,6 GB; los archivos individuales suman aproximadamente 8,6 GB (DiT SFT 3,53 GB, DiT turbo 4,10 GB, text encoder 0,68 GB, VAE 0,34 GB). La VRAM necesaria depende de si se cargan ambas variantes del DiT o solo una.
- GPU recomendadas: la model card documenta pruebas en una RTX 5090. Por el tamaño de los archivos, es plausible su ejecución en GPUs de consumo con 12-16 GB de VRAM o más, aunque no se proporcionan requisitos mínimos oficiales.
- Cabe en GPU de consumo: sí, según el tamaño de los archivos cuantizados, aunque no se especifican los mínimos exactos.
- Opciones de despliegue: acestep.cpp es el motor para el que están diseñados estos GGUF. No se mencionan otros motores (llama.cpp, Ollama, vLLM, TGI) en la información proporcionada.
- Latencia y throughput: no disponibles. La variante turbo está orientada a generación más rápida, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step 1.5 XL GGUF (este) | 4.988 M (DiT) | no disponible | MIT | GGUF | Hugging Face |
| ACE-Step 1.5 XL SFT (BF16) | 4.988 M (DiT) | no disponible | MIT | safetensors/BF16 | Hugging Face |
| ACE-Step 1.5 XL turbo (BF16) | 4.988 M (DiT) | no disponible | MIT | safetensors/BF16 | Hugging Face |

No se dispone de información sobre otros modelos comparables de text-to-audio en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información proporcionada; al ser un modelo generativo de música, puede reflejar sesgos presentes en sus datos de entrenamiento (no detallados).
- Riesgo de alucinación: en el contexto de text-to-audio, se traduce en posibles desviaciones de la letra solicitada; la model card reporta un WER del 13,5-16,9% en las variantes cuantizadas, lo que implica errores en la pronunciación o contenido de la letra.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados; las pruebas documentadas usan letra en inglés, por lo que el rendimiento en otros idiomas es desconocido.
- Restricciones de licencia: el modelo base es MIT, lo que permite uso comercial; el codificador de texto Qwen3-Embedding-0.6B es Apache 2.0, también permisivo. No se identifican restricciones adicionales en la información disponible.
- Caveats para producción: las cuantizaciones más agresivas (Q4) degradan notablemente la inteligibilidad de la letra (WER 19-29%) y un text encoder en 4 bits pierde el tempo solicitado; se recomienda Q5_K_M o Q6_K para mantener la calidad. El motor acestep.cpp es el único soportado según la información disponible. El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/empyrealworks/ACE-Step-1.5-XL-GGUF
- Modelo base ACE-Step/acestep-v15-xl-sft: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Modelo base ACE-Step/acestep-v15-xl-turbo: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo
- Modelo base ACE-Step/Ace-Step1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Codificador de texto Qwen/Qwen3-Embedding-0.6B: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Motor de inferencia acestep.cpp: https://github.com/ServeurpersoCom/acestep.cpp
