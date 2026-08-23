# rwcii/Qwen3.8-27B-Uncensored-Cyber-MLX-4bit

## Resumen

Qwen3.8-27B-Uncensored-Cyber-MLX-4bit es una conversión no oficial a formato MLX con cuantización de 4 bits del modelo `philbert440/Qwen3.8-27B-Uncensored-Cyber`, un derivado "abliterado" (des-refusado) del modelo Qwen3.8-27B de Alibaba. El objetivo de este derivado es eliminar la barrera de rechazo del modelo original para responder preguntas sobre ciberseguridad y temas ofensivos que otros modelos suelen negarse a tratar. La conversión MLX está realizada con `mlx-lm` 0.31.3 y orientada a Apple Silicon, manteniendo la arquitectura multimodal (imagen y texto) y el contexto nativo de 262.144 tokens del modelo base.

Este repositorio es únicamente un cambio de formato y cuantización; no añade entrenamiento adicional ni evaluación de seguridad. La licencia es Apache 2.0, heredada del modelo original. Está pensado para desarrolladores e investigadores que necesitan ejecutar un modelo de gran tamaño sin censura en equipos Apple Silicon, con un tamaño de 15,2 GB en disco y un pico de memoria de aproximadamente 15,5 GB durante la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: atención lineal DeltaNet + atención completa, con visión nativa) |
| Parametros totales | 27B (modelo base Qwen3.8-27B); safetensors reporta 4.204.731.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | MLX 4-bit affine (group size 64, promedio 4.501 bits/peso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina atención lineal (gated DeltaNet) con atención completa, lo que permite manejar ventanas de contexto muy largas (262K tokens) con un coste computacional reducido. Además, integra un codificador visual nativo que lo hace multimodal (image-text-to-text). El derivado `philbert440/Qwen3.8-27B-Uncensored-Cyber` fue sometido a un proceso de "abliteration" que elimina las capas de rechazo aprendidas durante el entrenamiento de alineación, de modo que el modelo responde a consultas de ciberseguridad y ofensivas sin las negativas habituales. El presente repositorio solo aplica una cuantización MLX de 4 bits con grupo de tamaño 64 sobre los pesos BF16 originales, sin ningún entrenamiento adicional.

## Capacidades

- Generación de texto y razonamiento avanzado, incluido razonamiento multi-paso.
- Comprensión de imágenes (entrada multimodal), aunque no se detalla el tipo de tareas visuales soportadas.
- Tool calling / function calling validado: produce JSON de OpenAI en formato correcto.
- Capacidad de agentes: puede integrarse en flujos de herramientas que requieren llamadas a funciones.
- Especializado en ciberseguridad y temas ofensivos, con una barrera de rechazo prácticamente inexistente.
- Soporte de chat conversacional y servidor OpenAI-compatible local.

## Casos de uso

- **Análisis de ciberseguridad**: el modelo puede responder preguntas técnicas sobre vulnerabilidades, explotación de sistemas o configuración de redes, sin rechazo, lo que es útil para equipos de seguridad que necesitan respuestas directas en entornos controlados.
- **Automatización de respuesta a incidentes**: con su capacidad de tool calling, puede integrarse en sistemas de orquestación de seguridad (SOAR) para generar informes de incidentes, recomendar acciones o consultar bases de datos de CVEs.
- **Generación de código de explotación en entornos de investigación**: puede redactar scripts de prueba de concepto (PoC) para validar vulnerabilidades en laboratorios aislados, siempre que se cumplan las políticas de uso.
- **Entrenamiento y evaluación de modelos de ciberseguridad**: sirve como base para generar datos sintéticos de entrenamiento en tareas de seguridad ofensiva y defensiva.
- **Asistencia en auditorías de seguridad**: puede analizar configuraciones de red, políticas de firewall o código fuente y ofrecer recomendaciones sin censura previa.
- **Investigación académica en seguridad informática**: facilita la exploración de técnicas avanzadas de ataque y defensa sin las limitaciones de modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición reportada es una prueba local en Apple Silicon con MLX-LM 0.31.3 que mostró una tasa de generación de aproximadamente 29,5 tokens/segundo y un pico de memoria de 15,5 GB, pero es un dato específico de máquina y no un benchmark general.

## Requisitos de hardware

- **VRAM estimada**: para la cuantización MLX 4-bit, el pico de memoria observado es de ~15,5 GB en Apple Silicon. En configuraciones con GGUF Q4_K_M se requieren ~16,8 GB (según otro repositorio). La versión Q3_K_M cabe en ~13,5 GB.
- **GPU recomendadas**: Apple Silicon (M-series) con al menos 16 GB de RAM unificada para ejecución fluida; también funciona en GPUs NVIDIA con CUDA (por ejemplo, RTX 4080 o superior) usando GGUF o FP8.
- **Compatibilidad con consumer GPU**: Sí, cabe en tarjetas con 16 GB de VRAM como la RTX 4080 o RTX 4090, aunque en Apple Silicon se obtiene un rendimiento superior gracias a la implementación MLX.
- **Opciones de despliegue**: MLX-LM (para Apple Silicon), llama.cpp (GGUF), TGI (Transformers), Ollama (si se convierte a GGUF), o servidor OpenAI-compatible con `mlx_lm.server`.
- **Latencia y throughput**: en la prueba local se observaron ~29,5 tokens/s en Apple Silicon; la velocidad puede variar según el hardware y la carga.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en términos de rendimiento o benchmarks. A nivel de características, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Cyber-MLX-4bit | 27B (base) | 262K | Apache 2.0 | Abliterado, ciberespecializado, multimodal, MLX 4-bit |
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | Con alineación de seguridad, multimodal |
| Qwen3.8-27B-Uncensored-Cyber (philbert440) | 27B | 262K | Apache 2.0 | Abliterado, ciberespecializado, sin cuantización (BF16) |

No se incluyen modelos de otros desarrolladores porque no hay información contrastada sobre equivalencias de rendimiento.

## Limitaciones y advertencias

- **Sesgos y riesgos**: el modelo ha sido deliberadamente desprovisto de alineación de seguridad; puede generar contenido dañino, ilegal, incorrecto o peligroso sin ninguna barrera.
- **Alucinación**: al estar cuantizado y sin entrenamiento adicional, puede producir respuestas inexactas, especialmente en tareas de razonamiento complejo o tool calling.
- **Limitaciones de idioma**: solo se ha validado en inglés; otros idiomas pueden no estar bien soportados.
- **Restricciones de uso**: no debe exponerse directamente a usuarios no autorizados ni usarse para acciones ilegales. Requiere entornos con control de acceso, autorización y monitoreo.
- **Calidad de cuantización**: la cuantización a 4 bits puede reducir la precisión en tareas de razonamiento, matemáticas y generación de código.
- **No es una autoridad**: no se debe tratar el modelo como fuente confiable para decisiones de seguridad o legales.
- **Falta de evaluación**: el autor del repositorio no ha reproducido las evaluaciones de comportamiento del modelo fuente, y no se han publicado benchmarks oficiales.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/rwcii/Qwen3.8-27B-Uncensored-Cyber-MLX-4bit)
- [Modelo base original (philbert440)](https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber)
- [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub: Qwen 3.8 27B Uncensored](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Blog de OrcaRouter: Qwen3.8-27B Uncensored MLX](https://www.explainx.ai/blog/orcarouter-qwen3-8-27b-uncensored-mlx-august-2026)
- [Blog de OrcaRouter: Cómo ejecutar localmente](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [GitHub: qwen38-uncensored (alternativo)](https://github.com/unburdened-jackinthebox365/qwen38-uncensored)
- [Hugging Face Space de demostración](https://huggingface.co/spaces/P1723/Qwen3.8-27B-Uncensored-Demo)
