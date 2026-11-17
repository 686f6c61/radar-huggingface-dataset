# Jakevin/ACE-Step1.5-Qwen3.5-0.8B-MLX

## Resumen

ACE-Step 1.5 — Qwen3.5-0.8B 5Hz Planner (MLX) es un bundle experimental de generación de música a partir de texto diseñado específicamente para Macs con Apple Silicon. Desarrollado por el usuario Jakevin, combina un planificador semántico-audio de 5 Hz basado en Qwen3.5-0.8B (con 18 capas GatedDeltaNet y 6 capas de atención completa) implementado en MLX, junto con el stack de renderizado oficial sin modificar de ACE-Step 1.5: un DiT `acestep-v15-turbo`, un VAE Oobleck a 48 kHz y un codificador de texto `Qwen3-Embedding-0.6B`. El resultado es un pipeline que genera archivos `.wav` de forma offline con un solo comando, sin descargas adicionales de modelos.

El modelo resuelve el problema de ejecutar generación de música texto-a-audio en hardware de consumo Apple Silicon, aprovechando el framework MLX de Apple. El checkpoint principal es un destilado de 819.252.032 parámetros en `bf16` (`S-lr3e5-best-bf16`), seleccionado estrictamente por la menor entropía cruzada enmascarada de validación (6.933546922). El contexto del planificador opera a 5 Hz, generando 5 códigos de audio por segundo de audio, con un vocabulario de 64.000 códigos de audio.

Es relevante ahora porque demuestra la viabilidad de pipelines de generación musical completos en hardware local de Apple, aunque con limitaciones importantes: el autor advierte explícitamente que es un checkpoint de investigación experimental, que la evaluación de calidad global permanece `INCOMPLETE`, y que el baseline oficial `ACE-Step/acestep-5Hz-lm-0.6B` supera a este modelo en velocidad, validez estricta y puntuación CLAP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas GatedDeltaNet + 6 capas de atención completa (Qwen3.5), planificador de audio a 5 Hz |
| Parametros totales | 819.252.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (checkpoint principal); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), diffusers |

## Arquitectura y entrenamiento

El planificador se basa en Qwen3.5-0.8B-Base, una arquitectura híbrida que combina 18 capas GatedDeltaNet (atención lineal con estado recurrente) con 6 capas de atención completa, sumando un total de 819 millones de parámetros. El modelo opera como un planificador semántico-audio a 5 Hz: genera 5 códigos de audio por segundo de audio a partir de un prompt de texto y letras, produciendo una secuencia de hasta `5 * duration` códigos dentro de un vocabulario de 64.000 códigos de audio (`<|audio_code_0|>` a `<|audio_code_63999|>`). El proceso incluye una etapa Stage-1 de decodificación de cadena de pensamiento en formato YAML dentro de etiquetas `<think>...</think>`, seguida de la generación de códigos de audio en Stage-2.

El checkpoint es un destilado del modelo base Qwen3.5-0.8B, seleccionado por menor entropía cruzada enmascarada de validación. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es el pipeline de decodificación anti-repetición, que aplica penalizaciones ventaneadas de repetición, frecuencia y presencia sobre los últimos 40 códigos (8 s a 5 Hz), bloqueo de 8-gramas sobre los últimos 80 códigos (16 s), y un aumento lineal de temperatura de 0,85 a 1,05 en el 60% final de la secuencia. Además, se aplica un quality gate con tres umbrales (ratio de códigos únicos >= 0,58, tasa de repetición de 8-gramas en la segunda mitad <= 0,50, y ciclo periódico contiguo más largo <= 0,30) que re-ejecuta el planificador con semillas escalonadas hasta un máximo de 3 intentos.

## Capacidades

- Generación de música texto-a-audio: produce archivos `.wav` a partir de prompts descriptivos y letras, con duración controlable mediante el parámetro `--duration`.
- Generación de pistas vocales: acepta letras estructuradas con secciones como `[Verse 1]` y `[Chorus]` para guiar la composición vocal.
- Generación de pistas instrumentales: acepta la etiqueta `[Instrumental]` para producir audio sin voz.
- Planificación semántica con cadena de pensamiento: Stage-1 genera un YAML CoT dentro de `<think>...</think>` antes de la síntesis de códigos de audio.
- Decodificación anti-repetición integrada: pipeline de post-procesado con penalizaciones ventaneadas, bloqueo de n-gramas y quality gate con reintentos deterministas.
- Sampling configurable: CFG merge con `--cfg-scale`, nucleus sampling con `--top-p 0.9`, temperatura base `0.85` y temperatura tardía `1.05`.
- Ejecución offline: una vez instalado el entorno, no requiere descargas adicionales de modelos.
- Soporte de semilla determinista (`--seed`) para reproducibilidad.
- Capacidad de desactivar el anti-repetición (`--no-antirepeat`) para obtener decodificación cruda bit-idéntica.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio de entrada.

## Casos de uso

- Composición musical asistida en local: un músico en un Mac con Apple Silicon puede generar pistas vocales o instrumentales de 30 segundos con un solo comando, sin conexión a internet ni servicios en la nube, usando el pipeline completo empaquetado en el bundle.
- Prototipado rápido de ideas musicales: gracias a la generación offline y a la ejecución en hardware de consumo, se pueden iterar prompts descriptivos y letras para explorar arreglos (por ejemplo, "upbeat indie synth-pop" o "cinematic acoustic guitar") en cuestión de segundos por intento.
- Generación de bandas sonoras para vídeo y podcasts: el modelo produce audio a 48 kHz mediante el VAE Oobleck, adecuado para pistas de fondo instrumentales en proyectos audiovisuales de pequeño formato.
- Investigación en generación musical: el checkpoint experimental permite estudiar el comportamiento de planificadores semántico-audio destilados, la dinámica de colapso en bucles de código único y la eficacia de las estrategias anti-repetición, con métricas de quality gate documentadas.
- Evaluación comparativa de planificadores: al compartir el stack de renderizado oficial de ACE-Step 1.5, permite comparar directamente el planificador de 0.8B frente al baseline oficial de 0.6B en el mismo pipeline de síntesis.
- Demostración de MLX para audio generativo: sirve como referencia técnica para desarrolladores que quieran portar o adaptar pipelines de difusión y planificadores de audio al framework MLX de Apple.
- Generación de jingles y fragmentos cortos: con duraciones de 30 segundos y control de estructura por secciones, es adecuado para cuñas publicitarias o clips musicales breves.

## Benchmarks y rendimiento

Los datos de evaluación proporcionados corresponden a la decodificación cruda sobre `dev-100`, comparando este checkpoint con el baseline oficial `ACE-Step/acestep-5Hz-lm-0.6B`:

| Metrica | Este modelo (0.8B) | Baseline oficial (0.6B) |
|---|---|---|
| Tiempo de decodificacion | 7,96 s | 5,71 s |
| Validez estricta | 97/100 | 100/100 |
| Puntuacion CLAP | 0,2832 / 0,2920 | 0,3451 |
| Ratio medio de codigos unicos | 0,4326 | no disponible |
| Entropia cruzada enmascarada de validacion | 6,933546922 | no disponible |

La evaluación global de calidad permanece marcada como `INCOMPLETE` por el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un planificador de audio y no un modelo de lenguaje generalista.

## Requisitos de hardware

- Hardware objetivo: exclusivamente macOS sobre Apple Silicon (`arm64`). No es compatible con GPU NVIDIA ni con otros sistemas.
- Python: versión `>=3.11,<3.13`, con Python 3.12 recomendado.
- VRAM/unified memory estimada: no disponible de forma explícita; el repo ocupa 8,0 GB e incluye el planificador en `bf16` más el stack de renderizado (DiT `acestep-v15-turbo`, VAE Oobleck y codificador de texto `Qwen3-Embedding-0.6B`). Como referencia, el planificador de 819 M de parámetros en `bf16` requiere aproximadamente 1,6 GB solo para los pesos.
- GPU recomendadas: chips Apple Silicon (M-series); no se especifican modelos concretos ni cantidades mínimas de memoria unificada.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon, aunque no se detalla el mínimo de memoria unificada necesario para ejecutar el bundle completo.
- Opciones de despliegue: MLX con `mlx-lm==0.32.2` (instalado con `--no-deps` para preservar `transformers==4.57.6`), junto con `ace-step==1.5.0` y el script `generate.py` incluido en el repo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el tiempo de decodificación del planificador sobre `dev-100` es de 7,96 s por muestra (frente a 5,71 s del baseline de 0.6B). No se documenta latencia extremo a extremo del pipeline completo ni throughput de renderizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Velocidad (dev-100) | Validez estricta | CLAP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ACE-Step1.5-Qwen3.5-0.8B-MLX (este) | 819 M | no disponible | 7,96 s | 97/100 | 0,2832 / 0,2920 | apache-2.0 | Hugging Face |
| ACE-Step/acestep-5Hz-lm-0.6B (oficial) | 0.6B (aprox.) | no disponible | 5,71 s | 100/100 | 0,3451 | no disponible en la informacion | Hugging Face oficial de ACE-Step |
| Qwen/Qwen3.5-0.8B-Base (modelo base) | 819 M | no disponible | no aplica (no es planificador de audio) | no aplica | no aplica | no disponible en la informacion | Hugging Face |

El baseline oficial supera a este checkpoint experimental en las tres métricas documentadas: es un 28% más rápido, alcanza validez estricta perfecta y obtiene una puntuación CLAP notablemente superior. El modelo base Qwen3.5-0.8B-Base no es directamente comparable como generador de música, pero es el origen del que se destila este planificador.

## Limitaciones y advertencias

- Checkpoint de investigación experimental: el autor lo califica explícitamente como tal, seleccionado únicamente por menor entropía cruzada de validación, no por calidad perceptual.
- Evaluación de calidad global `INCOMPLETE`: no hay una evaluación completa de calidad musical publicada.
- Inferior al baseline oficial en todas las métricas documentadas: más lento (7,96 s vs. 5,71 s), menor validez estricta (97/100 vs. 100/100) y menor CLAP (0,2832/0,2920 vs. 0,3451).
- Baja diversidad de códigos de audio: ratio medio de códigos únicos de 0,4326, con tendencia a colapsar en bucles de código único en secuencias largas (por ejemplo, 60–120 s).
- Dependencia del anti-repetición: el pipeline activa por defecto post-procesado anti-repetición y quality gate con reintentos; desactivarlo (`--no-antirepeat`) puede producir audio con repeticiones patológicas.
- Idioma limitado: solo se declara soporte para inglés (`en`), tanto en prompts como en letras.
- Plataforma restringida: requiere macOS sobre Apple Silicon (`arm64`); no funciona en GPU NVIDIA ni en otros sistemas.
- Dependencias frágiles: requiere `mlx-lm==0.32.2` instalado con `--no-deps` para preservar `transformers==4.57.6` exigido por `ace-step==1.5.0`; un cambio de versiones puede romper el pipeline.
- Riesgo de alucinación musical: no se documenta una métrica de fidelidad semántica prompt-audio más allá de CLAP, y el autor no garantiza que el audio generado respete el prompt en todos los casos.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al entrenarse presumiblemente con datos musicales en inglés, puede estar sesgado hacia estilos y estructuras occidentales.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad ni la originalidad del audio generado; el usuario debe verificar posibles solapamientos con material protegido.
- Sin datos de benchmarks estándar de lenguaje: al ser un planificador de audio, no se reportan MMLU, HumanEval ni GSM8K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Baseline oficial del planificador: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
