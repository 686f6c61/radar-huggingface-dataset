# prada5023/countdown-rl-gemma4-e4b-v2-zeroshot-s0

## Resumen

`countdown-rl-gemma4-e4b-v2-zeroshot-s0` es un adaptador LoRA publicado por el usuario `prada5023` sobre el decodificador de texto de `google/gemma-4-E4B`. No se trata de un modelo completo, sino de un adaptador PEFT (r = 16, alpha = 32) entrenado con GRPO (Group Relative Policy Optimization) para resolver el juego de numeros Countdown mediante razonamiento con uso de herramienta Python en el bucle. El objetivo es que la politica escriba un bloque `<think>`, ejecute codigo en `<python>` cuyo stdout regresa en `<output>`, y emita la respuesta final en `<answer>`.

El interes del artefacto es metodologico: documenta un experimento reproducible de reinforcement learning con tool use sobre un modelo base pequeno (variante E4B de Gemma 4), con receta v2, prompt zero-shot y semilla 0. El autor reporta un 60,5 % de pass@1 en un holdout de 1.000 problemas generados con posterioridad a todas las decisiones de modelado. El adaptador esta pensado para evaluarse con el mismo prompt de entrenamiento (`r1zero_tool`), ya que las politicas resultantes son especificas del prompt.

Es relevante para desarrolladores e investigadores interesados en RL aplicado a razonamiento con herramientas, en el ajuste eficiente de modelos pequenos y en la reproducibilidad de experimentos de GRPO. El repositorio pesa 0,1 GB y contiene unicamente los pesos del adaptador en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Gemma-4-E4B, decodificador de texto extraido del checkpoint multimodal) |
| Parametros totales | no disponible (el adaptador LoRA r=16, alpha=32; el modelo base E4B tiene un tamano no especificado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado con 768 tokens de generacion maxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el decodificador de texto de `google/gemma-4-E4B`, que debe extraerse previamente del checkpoint multimodal mediante el script `scripts/prepare_gemma4_text.py`. El autor indica que, con atencion eager, los logits del decodificador extraido coinciden exactamente con los del modelo completo, y recomienda usar `--attn eager` en la evaluacion.

El entrenamiento emplea GRPO sobre el juego Countdown con una herramienta Python en el bucle: la politica genera `<think>`, puede invocar `<python>` (cuyo stdout se devuelve en `<output>`) y responde en `<answer>`. La receta es la v2, con prompt zero-shot (`r1zero_tool`) y semilla 0. El adaptador LoRA usa r = 16 y alpha = 32. Los identificadores de ejecucion por bucket son `g4v2z0-a` a `g4v2z0-d`. El codigo de entrenamiento, las configuraciones, los logs y el informe se encuentran en el repositorio acompanante, en las rutas `configs/experiments/gemma4-e4b-v2-zeroshot-s0/`, `REPORT.md` y `EXPERIMENTS.md`.

## Capacidades

- Razonamiento multi-paso con bloques `<think>` explicitos antes de responder.
- Uso de herramienta Python en el bucle: emision de `<python>` y consumo del resultado en `<output>`.
- Resolucion del juego de numeros Countdown (combinar numeros con operaciones para alcanzar un objetivo).
- Generacion de respuesta final estructurada en `<answer>`.
- Soporte de multiples rondas de codigo (la evaluacion reportada usa dos rondas).
- Capacidad multilingue: no disponible en la informacion.
- Vision, audio u otras modalidades: no disponible (el adaptador solo cubre el decodificador de texto).

## Casos de uso

- Investigacion en RL con tool use: reproducir el experimento GRPO con receta v2 y semilla 0 sobre Countdown, usando el repositorio acompanante para comparar curvas de entrenamiento y resultados en holdout.
- Evaluacion de razonamiento con ejecucion de codigo: servir el adaptador con el prompt `r1zero_tool` para medir pass@1 en problemas de aritmetica combinatoria donde el modelo puede delegar calculos en Python.
- Estudio de generalizacion zero-shot: el holdout3 se genero despues de todas las decisiones de modelado, lo que permite analizar si la politica aprende una estrategia general o memoriza el conjunto de entrenamiento.
- Base para ablaciones de hiperparametros: al ser un adaptador LoRA pequeno (0,1 GB), es barato de reentrenar y comparar con otras semillas o recetas sobre el mismo modelo base.
- Prototipado de agentes con sandbox de codigo: el esquema `<think>`/`<python>`/`<output>`/`<answer>` sirve como plantilla para pipelines de agente con ejecucion controlada de codigo.
- Docencia y divulgacion: caso concreto y reproducible de como GRPO mejora el razonamiento paso a paso en modelos pequenos con recompensas verificables.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| holdout3 (1.000 problemas, greedy, 768 tokens, dos rondas de codigo) | 60,5 % pass@1 | Facil 86,2 %, medio 42,7 %, dificil 44,0 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; depende del modelo base Gemma-4-E4B y de la cuantizacion elegida.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el autor documenta evaluacion mediante `countdown-eval` con `--merge-adapter` y `--attn eager`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros adaptadores o modelos comparables en la misma tarea (Countdown con tool use) ni sus resultados.

## Limitaciones y advertencias

- El adaptador es especifico del prompt: debe evaluarse con `r1zero_tool`; otros prompts pueden degradar el rendimiento de forma notable.
- Requiere extraer previamente el decodificador de texto del checkpoint multimodal de Gemma-4-E4B y usar atencion eager para reproducir los logits.
- El rendimiento cae con la dificultad: 42,7 % en problemas medios y 44,0 % en dificiles frente al 86,2 % en faciles, segun el propio autor.
- Solo cubre el decodificador de texto; no aporta capacidades de vision del modelo base.
- Riesgo de alucinacion y de ejecucion de codigo incorrecto: la politica puede emitir `<python>` con errores o interpretar mal el `<output>`.
- Licencia `gemma`: el uso comercial queda sujeto a los terminos de la licencia Gemma, que imponen restricciones y obligaciones adicionales.
- Idiomas soportados y sesgos conocidos: no disponibles en la informacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion externa por parte de la comunidad.
- Fecha de creacion indicada como 2026-11-09, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prada5023/countdown-rl-gemma4-e4b-v2-zeroshot-s0
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Repositorio de codigo de entrenamiento: no disponible como URL directa; el autor lo referencia como "the accompanying repository" con las rutas `configs/experiments/gemma4-e4b-v2-zeroshot-s0/`, `REPORT.md` y `EXPERIMENTS.md`.
