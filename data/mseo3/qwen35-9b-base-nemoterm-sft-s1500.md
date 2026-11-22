# mseo3/qwen35-9b-base-nemoterm-sft-s1500

## Resumen

qwen35-9b-base-nemoterm-sft-s1500 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-9B-Base, desarrollado por el usuario mseo3. El modelo se ha entrenado sobre nvidia/Nemotron-Terminal-Corpus con el objetivo de especializarlo en tareas de terminal, es decir, interacciones de línea de comandos y resolución de tareas técnicas en entornos de shell. Se trata del checkpoint correspondiente al paso 1500 de un entrenamiento planificado de 28.580 pasos (10 épocas), por lo que representa un estado intermedio del proceso de ajuste y no un modelo final convergido.

El modelo conserva la arquitectura del Qwen3.5-9B-Base, un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet (atención lineal), y cuenta con 9.409.813.744 parámetros totales. El contexto de entrenamiento se fijó en 65.536 tokens, manteniendo el razonamiento (thinking) en cada turno del asistente. La licencia es Apache 2.0, lo que facilita su uso comercial y su integración en herramientas de desarrollo.

Su relevancia radica en que aborda un nicho concreto: la automatización de tareas de terminal y la generación de comandos con razonamiento multi-turno. Al estar construido sobre un corpus específico de terminal y conservar las trazas de pensamiento, es un candidato interesante para agentes de línea de comandos, aunque al ser un checkpoint intermedio y sin benchmarks publicados, su evaluación práctica queda pendiente por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: capas de atención completa (FlashAttention-3) + 24 capas Gated DeltaNet (atención lineal) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 65.536 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, con 48 tensores en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base (commit @68c46c4b) y emplea una arquitectura híbrida: capas de atención completa con FlashAttention-3 combinadas con 24 capas Gated DeltaNet, que implementan atención lineal y almacenan determinados tensores (linear_attn.A_log y linear_attn.norm.weight) en F32. El ajuste se realizó con verl (sft_trainer_ray, receta mopdRL nemoterm-q35 @cb5ee536) sobre el dataset mseo3/nemotron-terminal-sft-qwen35-le64k @ac877ee2, derivado de nvidia/Nemotron-Terminal-Corpus (CC-BY-4.0). El dataset consta de 365.856 filas multi-turno y 6,45 mil millones de tokens, con secuencias de hasta 65.536 tokens y el razonamiento conservado en cada turno del asistente (tokenizer sfttok-preserve).

La configuración de entrenamiento incluye 10 épocas planificadas (28.580 pasos), batch de 128, learning rate de 2e-5 con decaimiento coseno (ratio mínimo 0,1), warmup de 100 pasos, weight decay de 0,01, clipping de 1,0, batch dinámico de 65.536 tokens por GPU y 4 GPU H200 con FSDP (DP4) y gradient checkpointing. Se usaron optimizaciones como Liger RMSNorm/SwiGLU y la pérdida fused linear-CE de verl en Triton. Los pesos se fusionaron desde los shards FSDP en fp32 a bf16, manteniendo en F32 los 48 tensores que el modelo base también almacena en ese formato. La cabeza MTP no se incluye (mtp_num_hidden_layers = 0) y la configuración no fija attn_implementation, aunque el entrenamiento usó flash_attention_3.

## Capacidades

- Generación de texto y razonamiento multi-turno con trazas de pensamiento (thinking) preservadas en cada turno del asistente.
- Especialización en tareas de terminal: generación y ejecución de comandos de shell, resolución de problemas en entornos de línea de comandos.
- Razonamiento de varios pasos orientado a la resolución de tareas técnicas.
- Manejo de contextos largos de hasta 65.536 tokens, adecuado para sesiones de terminal prolongadas o historiales extensos.
- Capacidades multilingües: no disponibles (no se especifican en la información proporcionada).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Agentes de línea de comandos: el modelo puede interpretar instrucciones en lenguaje natural y generar secuencias de comandos de shell, manteniendo el contexto de la sesión gracias a su ventana de 65.536 tokens. Es adecuado para asistentes de terminal que requieren razonamiento multi-turno.
- Automatización de tareas de administración de sistemas: puede generar comandos para gestionar ficheros, procesos o servicios, y explicar los pasos seguidos gracias a las trazas de pensamiento conservadas durante el entrenamiento.
- Depuración de scripts y errores de shell: el modelo puede analizar mensajes de error y proponer correcciones, aprovechando su entrenamiento sobre un corpus específico de terminal.
- Generación de documentación técnica de comandos: puede redactar explicaciones de comandos y flujos de trabajo de terminal a partir de ejemplos, útil para bases de conocimiento internas.
- Asistencia en pipelines de CI/CD: integrado como componente de generación de comandos en scripts de integración, puede proponer pasos de build o despliegue, aunque requiere validación humana por su condición de checkpoint intermedio.
- Entrenamiento continuado e investigación: al ser un checkpoint intermedio (paso 1500 de 28.580), sirve como punto de partida para experimentos de SFT, ablaciones o ajustes posteriores sobre tareas de terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros, en bf16 se requieren aproximadamente 18,8 GB solo para los pesos, más memoria para el contexto (hasta 65.536 tokens) y las cachés KV, por lo que se recomienda al menos 24-32 GB de VRAM en bf16. En cuantización de 8 bits, el peso se reduce a unos 9,4 GB; en 4 bits, a unos 4,7 GB, aunque no se especifican cuantizaciones oficiales publicadas.
- GPU recomendadas: el entrenamiento se realizó con 4 GPU H200. Para inferencia, una A100 (40/80 GB), H100 o H200 permiten ejecutar el modelo en bf16 con contexto largo; una RTX 4090 (24 GB) puede ser ajustada en bf16 con contexto reducido o en cuantización de 8/4 bits.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más (RTX 3090, RTX 4090) usando cuantización, o en bf16 con ventanas de contexto moderadas.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que soporten la arquitectura qwen3_5 con capas Gated DeltaNet; conviene verificar la compatibilidad del runtime con esta arquitectura híbrida antes de desplegar.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen35-9b-base-nemoterm-sft-s1500 | 9,41 B | 65.536 tokens | Apache 2.0 | Hugging Face (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| Alternativas de 9B especializadas en terminal | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 1500 de 28.580 planificados), por lo que su calidad no equivale a la de un modelo final convergido; puede presentar inestabilidad o comportamientos incompletos.
- Riesgo de alucinación en la generación de comandos de terminal, con posibles consecuencias graves si se ejecutan sin validación humana (borrado de ficheros, comandos destructivos).
- No se especifican los idiomas soportados; el entrenamiento se realizó sobre un corpus en inglés (Nemotron-Terminal-Corpus), por lo que el rendimiento en castellano es incierto.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- La configuración no fija attn_implementation y el entrenamiento usó flash_attention_3; es necesario verificar que el runtime de inferencia soporte la arquitectura híbrida con Gated DeltaNet.
- La cabeza MTP no está incluida (mtp_num_hidden_layers = 0), lo que puede afectar a técnicas de decodificación especulativa que dependan de ella.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del corpus de entrenamiento (CC-BY-4.0) y del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mseo3/qwen35-9b-base-nemoterm-sft-s1500
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/mseo3/nemotron-terminal-sft-qwen35-le64k
- Corpus original: https://huggingface.co/datasets/nvidia/Nemotron-Terminal-Corpus
- Overlay de tokenizer/plantilla: https://huggingface.co/mseo3/qwen35-9b-base-opd-overlay
