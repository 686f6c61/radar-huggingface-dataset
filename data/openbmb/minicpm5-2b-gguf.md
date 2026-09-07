# openbmb/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de aproximadamente 2.500 millones de parámetros desarrollado por el equipo de OpenBMB, como parte de la serie MiniCPM5. Se trata del segundo modelo de la serie, después de MiniCPM5-1B, y está diseñado específicamente para su ejecución en dispositivos locales, escenarios de despliegue en el borde y entornos con recursos computacionales limitados. El modelo se presenta como el estado del arte en su clase de 2B, manteniendo un rendimiento competitivo frente a modelos de 4B en tareas como generación de código, razonamiento matemático, comprensión de contextos largos, uso de herramientas y tareas de agentes.

La arquitectura es un Transformer denso, no basada en mezcla de expertos, lo que simplifica su integración y reduce el consumo de memoria. Aunque el modelo card no especifica la longitud exacta de contexto, se indica que soporta contextos largos. Los datos de entrenamiento provienen de los conjuntos de la familia UltraData y Ultra-FineWeb de OpenBMB, e incluyen fases de ajuste supervisado y aprendizaje por refuerzo. La licencia Apache 2.0 permite un uso comercial sin restricciones, lo que refuerza su interés para proyectos de producción en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo LLaMA) |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (soporta contextos largos) |
| Tipos de cuantizacion | No disponible (formato GGUF; consultar archivos del repositorio) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base también ofrece safetensors) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un Transformer denso derivado de la arquitectura LLaMA, optimizado para un despliegue eficiente en hardware de consumo y dispositivos móviles. La decisión de usar una arquitectura densa en lugar de una de mezcla de expertos (MoE) permite mantener la latencia baja y simplificar la implementación, especialmente en entornos con limitaciones de memoria.

El entrenamiento se ha realizado con los datasets de OpenBMB de la familia UltraData y Ultra-FineWeb, que incluyen volúmenes de datos web, matemáticos, de código y de instrucciones. Se observan fases de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL), lo que sugiere un pipeline enfocado en alinear el modelo con instrucciones y tareas de agente. No se detalla en la información proporcionada si se utilizaron técnicas específicas como DPO o RLHF, aunque la presencia de conjuntos RL indica una etapa de optimización por refuerzo.

## Capacidades

- Generación de texto y razonamiento general, con un rendimiento destacado en su clase de 2B según la información proporcionada.
- Generación de código con ventajas frente a modelos de tamaño similar, gracias al entrenamiento con UltraData-Code.
- Razonamiento matemático, reforzado por el dataset UltraData-Math.
- Comprensión de contextos largos, con capacidad de manejo de documentos extensos.
- Soporte de tool calling y function calling, como indica la etiqueta `tool-calling`.
- Capacidad para tareas de agentes y razonamiento multi-paso (agentic tasks), lo que permite integrarlo en flujos de trabajo autónomos.
- Multilingüe en inglés y chino.
- Optimizado para despliegue on-device y edge-ai, con un tamaño reducido que permite su ejecución en CPU, Apple Silicon y GPUs de consumo.

## Casos de uso

- Asistentes en dispositivos de borde: el modelo puede desplegarse en routers, gateways o dispositivos IoT para ofrecer asistencia conversacional sin depender de la nube, gracias a su tamaño reducido y su eficiencia energética.
- Generación de código asistida en local: su soporte de tool calling y su capacidad de razonamiento lo hacen adecuado para integrarse en editores de código o pipelines de CI/CD que requieran completar o revisar fragmentos de código sin conexión.
- Agentes de automatización de oficina: con soporte de agentes y razonamiento multi-paso, puede gestionar tareas como resumen de correos, extracción de datos de documentos o generación de informes, ejecutándose en un mini-PC o en un portátil.
- Aplicaciones de atención al cliente en chino e inglés: su capacidad de contexto largo permite mantener conversaciones multi-turno y contextualizarse con historiales extensos, lo que es clave para sistemas de soporte básico en dos idiomas.
- Herramientas educativas de matemáticas y programación: su entrenamiento específico en matemáticas y código permite crear tutores interactivos que corrijan ejercicios y expliquen soluciones paso a paso, incluso en dispositivos sin GPU.
- Prototipado de agentes en entornos de pruebas: gracias a su licencia Apache 2.0 y su compatibilidad con GGUF, se puede integrar fácilmente en entornos como llama.cpp u Ollama para experimentar con arquitecturas de agentes y evaluar rápidamente flujos de trabajo complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card indica que MiniCPM5-2B alcanza el estado del arte en su clase de 2B y que es competitivo frente a modelos de 4B, pero no se proporcionan cifras concretas de evaluaciones como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~5 GB (basado en 2,5 millones de parámetros).
- VRAM estimada para inferencia en cuantización 4-bit: ~1,5-2 GB (estimación técnica estándar).
- El modelo puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090, así como en Apple Silicon y CPUs modernas mediante llama.cpp.
- Opciones de despliegue compatibles: llama.cpp, Ollama, vLLM, Hugging Face Transformers (con soporte GGUF) y Text Generation Inference (TGI).
- La latencia y el throughput dependerán de la cuantización y del hardware; no se dispone de datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| MiniCPM5-2B | ~2,5B | Transformer denso | No disponible (largo) | Apache 2.0 |
| MiniCPM5-1B | ~1B | Transformer denso | No disponible (largo) | Apache 2.0 |
| Qwen2.5-2B | ~2B | Transformer denso | No disponible | Apache 2.0 |
| Gemma-2-2B | ~2B | Transformer denso | No disponible | Gemma (uso limitado) |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se han documentado los idiomas inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un modelo pequeño, puede presentar un mayor riesgo de alucinación en comparación con modelos de mayor tamaño.
- No se especifica la longitud de contexto exacta, por lo que los resultados en documentos muy largos podrían verse afectados.
- No se ofrecen resultados de benchmarks publicados, lo que dificulta validar las afirmaciones de rendimiento frente a competidores.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de las condiciones en su distribución.
- La documentación disponible no detalla posibles sesgos inherentes al modelo; se recomienda auditar su comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-GGUF
- Informe técnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Datasets UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Colección MiniCPM5: https://huggingface.co/collections/openbmb/minicpm5
