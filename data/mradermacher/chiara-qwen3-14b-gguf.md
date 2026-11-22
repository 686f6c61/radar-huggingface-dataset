# mradermacher/chiara-qwen3-14b-GGUF

## Resumen

Chiara-qwen3-14b es un ajuste fino de tipo persona sobre Qwen3-14B, desarrollado originalmente por el usuario marcoeg y publicado en Hugging Face. El modelo parte de la base Qwen3 de 14.768.307.200 parámetros (aproximadamente 14,8 mil millones) y ha sido entrenado mediante SFT (supervised fine-tuning) y DPO (direct preference optimization), con técnicas de LoRA y QLoRA, para adoptar una persona conversacional concreta. La versión aquí documentada es la cuantización GGUF realizada por mradermacher, que facilita la ejecución local en hardware de consumo mediante llama.cpp y Ollama.

El modelo resuelve el problema de disponer de un asistente conversacional con identidad de persona definida, manteniendo la base técnica de Qwen3. Es relevante porque combina la arquitectura y el rendimiento del Qwen3-14B original con un ajuste de comportamiento orientado a diálogo, y porque la disponibilidad de cuantizaciones GGUF desde Q2_K hasta Q8_0 permite desplegarlo en un rango amplio de hardware, desde equipos con poca VRAM hasta estaciones de trabajo.

La ficha se centra en la versión GGUF de mradermacher, que es un artefacto de conversión y cuantización del modelo base `marcoeg/chiara-qwen3-14b`. No se dispone de información publicada sobre benchmarks, composición exacta del dataset de entrenamiento ni detalles del proceso de alineamiento más allá de las etiquetas declaradas (SFT, DPO, LoRA, QLoRA, persona).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 14.768.307.200 (~14,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes i1 con imatrix en repo separado |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3-14B, un transformer decoder-only de aproximadamente 14,8 mil millones de parámetros. Sobre esta base, el autor original aplicó un ajuste fino supervisado (SFT) y optimización directa por preferencias (DPO) usando LoRA y QLoRA, según las etiquetas declaradas en la model card. El objetivo del ajuste es instaurar una persona conversacional ("chiara") en lugar de modificar capacidades fundamentales del modelo.

La versión de mradermacher es una conversión estática a GGUF (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`) con once variantes de cuantización. Existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (`mradermacher/chiara-qwen3-14b-i1-GGUF`), que suelen ofrecer mejor relación calidad/tamaño que las cuantizaciones estáticas equivalentes. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni hiperparámetros del SFT/DPO.

## Capacidades

- Generación de texto conversacional multi-turno, con persona definida por el ajuste fino.
- Razonamiento y respuesta a instrucciones heredados de la base Qwen3-14B.
- Soporte de tool calling / function calling: no confirmado en la información disponible para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Capacidades multilingües: la model card declara únicamente `en`; no se documentan otros idiomas.
- Capacidad especial de persona: el modelo está entrenado para mantener un rol conversacional concreto (etiquetas `persona`, `conversational`).
- Compatibilidad con endpoints y despliegue local vía llama.cpp y Ollama (etiquetas `endpoints_compatible`, `ollama`, `llama.cpp`).

## Casos de uso

- Asistente conversacional con personalidad definida: el ajuste SFT+DPO sobre Qwen3-14B permite mantener un rol y estilo consistentes en diálogos multi-turno, útil para prototipos de chatbots de marca o compañeros virtuales.
- Despliegue local en estación de trabajo: las cuantizaciones Q4_K_M (9,1 GB) y Q5_K_M (10,6 GB) permiten ejecutar el modelo en GPUs de consumo con 12-24 GB de VRAM mediante llama.cpp u Ollama, sin depender de infraestructura cloud.
- Evaluación de técnicas de alineamiento: sirve como caso de estudio de cómo SFT y DPO con LoRA/QLoRA modifican el comportamiento conversacional de un modelo base Qwen3 sin reentrenarlo por completo.
- Generación de respuestas en inglés para atención al cliente: al estar declarado solo en inglés, es adecuado para flujos de soporte en ese idioma, con validación previa de calidad sobre el dominio concreto.
- Experimentación con cuantizaciones: la disponibilidad de once variantes GGUF permite medir el impacto de la cuantización en calidad y velocidad para un mismo modelo, comparando Q2_K (5,9 GB) frente a Q8_0 (15,8 GB).
- Base para nuevos ajustes de persona: al ser Apache-2.0, puede reutilizarse como punto de partida para fine-tunes adicionales orientados a otros roles o dominios.
- Inferencia en CPU/edge: las variantes Q2_K y Q3_K_S (5,9-6,8 GB) permiten ejecución en CPU con llama.cpp en equipos sin GPU dedicada, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~5,9 GB de pesos; ~7-8 GB con contexto moderado.
  - Q3_K_S: ~6,8 GB; Q3_K_M: ~7,4 GB; Q3_K_L: ~8,0 GB.
  - IQ4_XS: ~8,3 GB; Q4_K_S: ~8,7 GB; Q4_K_M: ~9,1 GB.
  - Q5_K_S: ~10,4 GB; Q5_K_M: ~10,6 GB.
  - Q6_K: ~12,2 GB; Q8_0: ~15,8 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; RTX 3090/4080 (16-24 GB) para Q4_K_M/Q5_K_M; GPUs de 12 GB para Q2_K-Q4_K_S con contexto reducido.
- Cabe en GPU de consumo: sí, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB) en tarjetas de 24 GB; las variantes Q4_K_M y Q5_K_M son las recomendadas por el autor para velocidad.
- Opciones de despliegue: llama.cpp, Ollama (etiquetas explícitas), endpoints compatibles; vLLM y TGI no están confirmados para GGUF en esta ficha.
- Latencia y throughput: no disponibles; dependen de la GPU, la cuantización y la longitud de contexto. Las variantes Q4_K_S y Q4_K_M están marcadas como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| chiara-qwen3-14b-GGUF (este) | ~14,8 B | no disponible | Apache-2.0 | GGUF | Ajuste de persona sobre Qwen3-14B, 11 cuantizaciones |
| Qwen3-14B (base) | ~14,8 B | no disponible en esta ficha | Apache-2.0 | safetensors/GGUF | Base sin ajuste de persona; referencia de capacidades |
| marcoeg/chiara-qwen3-14b | ~14,8 B | no disponible | Apache-2.0 | safetensors | Modelo original en precisión completa, origen de estas cuantizaciones |
| mradermacher/chiara-qwen3-14b-i1-GGUF | ~14,8 B | no disponible | Apache-2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas, potencialmente mejor calidad/tamaño |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`en`); el uso en castellano u otros idiomas no está garantizado y puede degradar la calidad.
- Contexto: no se documenta la longitud de contexto soportada; debe verificarse antes de usarla en producción con ventanas largas.
- Benchmarks: no hay resultados publicados que permitan validar el rendimiento frente a la base Qwen3-14B ni cuantificar el efecto del ajuste de persona.
- Alucinación: al ser un modelo conversacional ajustado por persona, existe riesgo de respuestas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo; el ajuste de persona y el dataset de SFT/DPO pueden introducir sesgos de estilo o contenido no auditados.
- Tool calling y agentes: no confirmados para este ajuste concreto; no asumir compatibilidad con pipelines de function calling sin validación.
- Licencia: Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base Qwen3 y del ajuste original.
- Cuantización: las variantes Q2_K y Q3_K_M están marcadas como de menor calidad; para producción se recomienda Q4_K_M o superior, o las variantes i1 con imatrix.
- Fecha de creación: el repositorio figura creado en 2026-11-18, dato que conviene contrastar con el estado real del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/chiara-qwen3-14b-GGUF
- Modelo base original: https://huggingface.co/marcoeg/chiara-qwen3-14b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/chiara-qwen3-14b-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#chiara-qwen3-14b-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
