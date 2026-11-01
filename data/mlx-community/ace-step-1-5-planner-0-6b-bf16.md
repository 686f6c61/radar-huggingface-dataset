# mlx-community/ACE-Step-1.5-planner-0.6B-bf16

## Resumen

ACE-Step-1.5-planner-0.6B-bf16 es la conversión a MLX en precisión bf16 del planner ligero ("lite") del sistema de generación musical ACE-Step 1.5, desarrollado por ACE Studio y StepFun. No es un modelo de texto-a-audio autónomo: es uno de los cuatro componentes que el pipeline necesita para sintetizar una canción (junto con el DiT turbo, el codificador de texto y el VAE). Su función es planificar: primero genera un bloque de razonamiento y después emite códigos de audio a 5 Hz que el resto del sistema convierte en audio.

Técnicamente es un fine-tune de Qwen3-0.6B con el vocabulario original de 217.204 tokens y 662.884.352 parámetros reales. La conversión la firma mlx-community a partir del checkpoint `ACE-Step/acestep-5Hz-lm-0.6B`, usando el conversor de `xocialize/mlx-ace-step-swift`, un port completo de ACE-Step 1.5 a Swift-MLX. El bundle conserva los 310 tensores del checkpoint original y se distribuye en formato safetensors con layout `model.*` de mlx-lm.

Su relevancia es práctica: corresponde al tier "lite" del paquete Swift, pensado para Macs de 24 GB de memoria unificada. En la puerta de evaluación de 12 canciones del port, este planner obtiene un PER de 0,179 frente al rango de 0,108–0,197 del planner de 1,7B, lo que lo sitúa como alternativa viable cuando el presupuesto de memoria es ajustado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen3-0.6B) |
| Parámetros totales | 662.884.352 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (este repo); el paquete ofrece int8 e int4 para el planner de 1,7B |
| Idiomas soportados | no disponible |
| Licencia | MIT (texto controlante en el LICENSE del repo GitHub de ACE-Step-1.5); modelo base Qwen3 bajo Apache-2.0 |
| Formato de pesos | safetensors (bf16), layout `model.*` de mlx-lm, 310 tensores |

## Arquitectura y entrenamiento

El planner es un transformer decoder-only derivado de Qwen3-0.6B, reutilizando su vocabulario de 217.204 tokens. Su particularidad es el esquema de planificación en dos fases: emite primero un bloque de razonamiento y a continuación los códigos de audio a una tasa de 5 Hz, que actúan como representación intermedia para el DiT turbo del pipeline. El checkpoint del que procede este bundle es `ACE-Step/acestep-5Hz-lm-0.6B` en la revisión `148d8ea`.

La conversión a MLX no altera los pesos más allá del cambio de layout (prefijo de claves, layout de convoluciones y folding de weight-norm). El conversor `Tools/convert/convert.py` de `xocialize/mlx-ace-step-swift` está validado como bit-equal contra los scripts `dit_convert.py` y `vae_convert.py` de upstream (sección V1 de `MEASUREMENTS.md`). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Planificación de canciones a partir de caption y letra: genera el plan intermedio (razonamiento más códigos de audio a 5 Hz) que consume el DiT para producir audio.
- Integración en un pipeline multimodal de música: trabaja junto al DiT turbo, el text encoder y el VAE para sintetizar una canción estéreo a 48 kHz.
- Soporte de referencia de timbre: el pipeline completo permite condicionar la generación con audio de referencia.
- Operaciones de edición musical: cover, repaint y extend de un clip de origen, gestionadas por el paquete Swift que orquesta el planner.
- Marcas de tiempo LRC: el pipeline puede producir timestamps de letra sincronizados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el "bloque de razonamiento" es interno al plan de audio.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- Capacidades de visión o audio de entrada directa: no disponibles en este componente.

## Casos de uso

- Generación de canciones completas en Mac Apple Silicon: con el paquete Swift y el planner lite se puede ir de caption y letra a una canción de 48 kHz estéreo en equipos de 24 GB de memoria unificada, sin GPU dedicada.
- Prototipado rápido de ideas musicales: el tier lite permite iterar con semillas distintas (`seed`) y duraciones variables para explorar variaciones de un mismo prompt antes de pasar al planner de 1,7B.
- Bandas sonoras para vídeo y juegos en local: el pipeline acepta duración en segundos y produce audio estéreo, adecuado para generar cues instrumentales bajo demanda en un flujo offline.
- Edición de material existente: las operaciones de cover, repaint y extend permiten reescribir una sección de un clip o alargarlo manteniendo coherencia, útil en postproducción musical.
- Sincronización de letras: la salida LRC con marcas de tiempo sirve para karaoke, subtitulado automático de vídeos musicales o visualizadores.
- Clonación de timbre controlada: usando audio de referencia se puede dirigir el carácter tímbrico de la generación, aplicable a demos de composición donde se busca aproximar un instrumento o voz concreta.
- Evaluación e investigación en modelos generativos de música: al ser un port bit-equal y con gates de paridad documentados, sirve como banco de pruebas reproducible para estudiar planificadores de código de audio a baja tasa.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del port Swift, medidos con una puerta de 12 canciones y la métrica PER (phoneme error rate) sobre la letra generada:

| Modelo | PER (puerta de 12 canciones) |
|---|---|
| ACE-Step-1.5-planner-0.6B (lite) | 0,179 |
| ACE-Step-1.5-planner-1.7B | 0,108 – 0,197 (según la tirada) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el repo pesa 1,4 GB en bf16; el tier lite está pensado para Macs con 24 GB de memoria unificada, que deben alojar además el DiT turbo, el text encoder y el VAE.
- GPU recomendadas: el paquete está construido sobre MLX Swift, por lo que el hardware objetivo son chips Apple Silicon (serie M). No se documentan requisitos para A100, H100 o RTX 4090 en esta conversión.
- ¿Cabe en GPU de consumo? En el ecosistema MLX, sí en Apple Silicon de gama alta; para CUDA habría que recurrir al checkpoint original de ACE-Step, no a este bundle.
- Opciones de despliegue: MLX Swift mediante `xocialize/mlx-ace-step-swift`, integrado en MLXEngine con la capacidad `music`; el registro se hace con `ACEStepConfiguration(planner: .lite0_6B)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PER (puerta 12 canciones) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACE-Step-1.5-planner-0.6B (este) | 662.884.352 | no disponible | 0,179 | MIT | MLX bf16 en HF |
| ACE-Step-1.5-planner-1.7B | no disponible | no disponible | 0,108 – 0,197 | MIT | variantes int8, int4 y bf16 en HF |
| Otros planificadores de música open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna al propio sistema: el planner de 1,7B ofrece en su mejor tirada un PER claramente inferior (0,108) al lite (0,179), a costa de mayor huella de memoria; el lite es la opción para el tier de 24 GB.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el DiT turbo, el text encoder y el VAE no produce audio. Usarlo aislado solo devuelve planes y códigos.
- Solo MLX: la conversión está atada a MLX Swift y Apple Silicon; no hay pesos GGUF ni soporte para stacks CUDA en este repo.
- Calidad de letra inferior al planner grande: el PER de 0,179 frente al 0,108 del 1,7B implica más errores en la letra generada.
- Idiomas no documentados: no hay información sobre cobertura lingüística, lo que impide garantizar calidad fuera del inglés sin verificación previa.
- Licencia: el repo de Hugging Face de ACE-Step no incluye archivo LICENSE propio; el texto controlante es el MIT del repositorio GitHub (Copyright (c) 2026 ACEStep), y el modelo base Qwen3 es Apache-2.0. Conviene conservar el `NOTICE` que acompaña al bundle.
- Riesgo de alucinación y sesgos: no hay documentación específica sobre sesgos musicales, estilísticos o culturales, ni sobre tasas de alucinación en la planificación.
- Madurez: 82 descargas y 0 likes en el momento de la consulta, con creación en octubre de 2026; es un artefacto reciente con poca validación externa.
- Contexto máximo no publicado: no se puede planificar la longitud de caption o letra admisible sin pruebas empíricas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlx-community/ACE-Step-1.5-planner-0.6B-bf16
- Modelo base en Hugging Face: https://huggingface.co/ACE-Step/acestep-5Hz-lm-0.6B
- Repo upstream ACE-Step 1.5 (pesos): https://huggingface.co/ACE-Step/Ace-Step1.5
- Código upstream: https://github.com/ace-step/ACE-Step-1.5
- Licencia MIT upstream: https://github.com/ace-step/ACE-Step-1.5/blob/main/LICENSE
- Informe técnico: https://arxiv.org/abs/2602.00744
- Port Swift-MLX: https://github.com/xocialize/mlx-ace-step-swift
- Motor MLXEngine: https://github.com/xocialize/mlx-engine-swift
- MLX Swift: https://github.com/ml-explore/mlx-swift
