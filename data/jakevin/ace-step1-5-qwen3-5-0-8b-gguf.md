# Jakevin/ACE-Step1.5-Qwen3.5-0.8B-GGUF

## Resumen

ACE-Step 1.5 — Qwen3.5-0.8B 5Hz Planner (GGUF) es un checkpoint experimental de investigación publicado por el usuario Jakevin en Hugging Face. Se trata de un planificador semántico de audio ("audio planner") para el sistema de generación musical ACE-Step 1.5, construido a partir de un fine-tuning del modelo base Qwen3.5-0.8B-Base. El modelo no genera audio directamente: produce la secuencia de código semántico a 5 Hz que posteriormente consume el renderizador oficial DiT/VAE de ACE-Step 1.5 para sintetizar la pista musical final.

El modelo emplea una arquitectura híbrida con 18 capas GatedDeltaNet y 6 capas de atención completa, y amplía el vocabulario a 313.612 tokens mediante la incorporación de 64.000 tokens de código de audio a 5 Hz. Se distribuye en formato GGUF para su uso con llama.cpp y llama-cpp-python, con dos cuantizaciones disponibles: BF16 (modelo principal) y Q8_0 (opción de despliegue con menor huella de memoria).

Su relevancia es acotada y debe interpretarse con cautela: el propio autor lo describe como un checkpoint experimental seleccionado únicamente por la menor entropía cruzada en validación, y reconoce que el baseline oficial ACE-Step/acestep-5Hz-lm-0.6B obtiene mejores resultados en velocidad, validez estricta y puntuación CLAP. La evaluación global de calidad permanece marcada como INCOMPLETE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 18 capas GatedDeltaNet + 6 capas de atención completa |
| Parametros totales | 819.252.032 (0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (principal) y Q8_0 (opción de despliegue); Q4_*, Q5_* y Q6_K omitidas intencionadamente |
| Idiomas soportados | Inglés (letras en inglés e instrumental); no funciona con letras en chino ni japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp b9810+), con tensores recurrentes/norm de GDN en F32 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B-Base y lo adapta como planificador semántico de audio para ACE-Step 1.5. La arquitectura combina 18 capas GatedDeltaNet (estado recurrente lineal) con 6 capas de atención completa, un patrón híbrido que reduce el coste computacional en secuencias largas manteniendo capacidad de atención global. El vocabulario se extiende hasta 313.612 tokens mediante la incorporación de 64.000 tokens de código de audio a 5 Hz (`<|audio_code_0..63999|>`), sobre una tokenización BPE compatible con `qwen35`.

El checkpoint publicado corresponde al identificador `S-lr3e5-best-bf16`, paso 975, época 3, seleccionado estrictamente por la menor entropía cruzada enmascarada de validación (6,933546922). El fine-tuning se realizó únicamente sobre pistas con letras en inglés e instrumentales. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO.

Como innovación destacable, el flujo de generación (`generate.py`) incorpora procesadores de logits restringidos para una cadena de pensamiento YAML de 6 campos y para la etapa 2 de CFG sobre los códigos de audio, además de un post-procesado anti-repetición activado por defecto que mitiga el colapso en bucles de códigos cortos o únicos en secuencias largas.

## Capacidades

- Generación de planes semánticos de audio a 5 Hz a partir de un prompt de estilo y una letra, consumibles por el renderizador oficial ACE-Step 1.5 (DiT/VAE).
- Generación de música con letra en inglés e instrumental; estilos controlables mediante prompt de texto (por ejemplo, synth-pop, indie, etc.).
- Cadena de pensamiento estructurada en YAML de 6 campos restringida por procesadores de logits.
- Decodificación con CFG en etapa 2 sobre los códigos de audio.
- Post-procesado anti-repetición configurable (desactivable con `--no-antirepeat`).
- Integración con llama.cpp y llama-cpp-python, con aceleración Metal en Apple Silicon.
- Flujo de un solo comando que descarga automáticamente los pesos del renderizador oficial y permite después generación completamente offline (`HF_HUB_OFFLINE=1`).
- No soporta tool calling, function calling ni capacidades de agente según la información disponible.
- No dispone de capacidades de visión ni de audio de entrada.

## Casos de uso

- Generación musical automatizada con letra en inglés: el modelo produce el plan de códigos semánticos que el renderizador ACE-Step 1.5 convierte en una pista WAV; adecuado para prototipado rápido de canciones con estructura verso-estribillo.
- Producción de música instrumental de fondo: con prompts de estilo y sin letra, puede generar bases instrumentales para vídeo, pódcast o demos, ejecutándose en local tras la primera descarga de pesos.
- Radio o streaming generativo en directo: el autor documenta un caso real de radio de piano con IA en YouTube generada al vuelo con la versión MLX sobre un Mac mini M4 de 16 GB, lo que demuestra la viabilidad de generación continua en hardware de consumo.
- Investigación sobre planificadores semánticos de audio: sirve como checkpoint de referencia para estudiar la destilación de un modelo de 0,8B frente al baseline oficial de 0,6B en la tarea de planificación de códigos a 5 Hz.
- Despliegue en entornos con memoria limitada: la variante Q8_0 (844 MiB) permite ejecutar el planificador en máquinas modestas, aceptando una ligera pérdida de paridad (98,4 % en CoT, 100 % en códigos de audio).
- Experimentación con decodificación restringida: los procesadores de logits para YAML CoT y CFG de etapa 2 son un ejemplo práctico de control estructurado de la salida en llama.cpp.
- Pruebas de robustez y anti-repetición: útil para evaluar técnicas de post-procesado frente al colapso en bucles de códigos en pistas largas.

## Benchmarks y rendimiento

| Metrica | ACE-Step1.5-Qwen3.5-0.8B | ACE-Step/acestep-5Hz-lm-0.6B (baseline oficial) |
|---|---|---|
| Tiempo de decodificación en dev-100 | 7,96 s | 5,71 s |
| Validez estricta | 97/100 | 100/100 |
| Puntuación CLAP | 0,2832 / 0,2920 | 0,3451 |
| Ratio medio de códigos únicos | 0,4326 | no disponible |
| Entropía cruzada enmascarada de validación | 6,933546922 | no disponible |

Paridad de conversión GGUF frente a MLX bf16: BF16 alcanza 100 % (64/64) de paridad top-1; Q8_0 alcanza 98,4 % (63/64) en CoT y 100 % (64/64) en códigos de audio. La evaluación global de calidad está marcada como INCOMPLETE por el autor.

## Requisitos de hardware

- VRAM/RAM estimada para el planificador: aproximadamente 1,54 GiB para el GGUF BF16 y 844 MiB para el Q8_0, más el consumo del renderizador oficial (unos 6,3 GB de pesos que se descargan en el primer uso).
- Cabe en GPU de consumo: el autor documenta ejecución en un Mac mini con Apple M4 y 16 GB de memoria unificada mediante la variante MLX.
- Aceleración recomendada en Apple Silicon mediante `CMAKE_ARGS="-DGGML_METAL=on"` al compilar llama-cpp-python.
- Opciones de despliegue: llama.cpp (b9810+) y llama-cpp-python 0.3.37; el renderizador oficial ACE-Step 1.5 se ejecuta en Python.
- Requisitos de software: Python 3.12 (rango >=3.11,<3.13) y cadena de herramientas C/C++ con cmake si llama-cpp-python se compila desde fuente.
- Latencia y throughput: no se proporcionan cifras de throughput; el único dato de latencia es el tiempo de decodificación en dev-100 (7,96 s frente a 5,71 s del baseline).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step1.5-Qwen3.5-0.8B-GGUF (este) | 0,8B | no disponible | Planificador semántico de audio a 5 Hz para ACE-Step 1.5 | Apache 2.0 | GGUF en Hugging Face; variante MLX complementaria |
| ACE-Step/acestep-5Hz-lm-0.6B | 0,6B | no disponible | Planificador semántico de audio a 5 Hz (baseline oficial) | no disponible | Hugging Face (ACE-Step/Ace-Step1.5) |
| Qwen/Qwen3.5-0.8B-Base | 0,8B | no disponible | Modelo de lenguaje base | no disponible | Hugging Face |

Frente al baseline oficial, este checkpoint es más lento (7,96 s frente a 5,71 s), obtiene menor validez estricta (97/100 frente a 100/100) y menor CLAP (0,2832/0,2920 frente a 0,3451). Su principal ventaja es la disponibilidad en GGUF para llama.cpp y la posibilidad de ejecución offline tras la descarga inicial.

## Limitaciones y advertencias

- Checkpoint experimental: seleccionado solo por menor entropía cruzada de validación; la evaluación global de calidad está marcada como INCOMPLETE.
- Menor rendimiento que el baseline oficial en velocidad, validez estricta y CLAP.
- Menor diversidad de códigos de audio (ratio medio de códigos únicos de 0,4326) y riesgo de colapso en bucles de códigos cortos o únicos en pistas largas; por ello el anti-repetición está activado por defecto.
- Solo inglés: no funciona con letras en chino ni japonés (voces ininteligibles según comprobaciones informales del autor).
- Las cuantizaciones por debajo de 8 bits degradan la generación de códigos semánticos discretos a 5 Hz y se han omitido intencionadamente.
- Riesgo de alucinación y de desviación del estilo solicitado no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y la evaluación incompleta desaconsejan su uso en producción sin validación propia.
- Dependencia del renderizador oficial ACE-Step 1.5 (revisión fijada 19671f406d603126926c1b7e2adc169acbcade22) y de Qwen3-Embedding-0.6B para el flujo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-GGUF
- Repositorio MLX complementario: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Renderizador oficial ACE-Step 1.5: https://huggingface.co/ACE-Step/Ace-Step1.5
- Radio de piano con IA en directo (YouTube): https://www.youtube.com/watch?v=bFjeMOIhnAM
- Muestra de audio de 40 s: https://huggingface.co/Jakevin/ACE-Step1.5-Qwen3.5-0.8B-GGUF/resolve/main/samples/demo_40s.mp3
