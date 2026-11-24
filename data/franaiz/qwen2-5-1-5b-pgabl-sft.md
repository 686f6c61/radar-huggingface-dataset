# franaiz/qwen2.5-1.5b-pgabl-sft

## Resumen

`franaiz/qwen2.5-1.5b-pgabl-sft` es un ajuste fino (SFT) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario franaiz y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`) y se ha entrenado con la librería Unsloth, que según el autor permite un entrenamiento "2x más rápido". Se trata, por tanto, de un modelo derivado de la familia Qwen2.5 de Alibaba, con arquitectura transformer densa y 1.543.714.304 parámetros totales.

El modelo está orientado a generación de texto conversacional y hereda las capacidades del Qwen2.5-1.5B-Instruct original, aunque el ajuste fino se ha realizado con un dataset no documentado en la model card (el sufijo "pgabl" no se explica). La información pública es muy escasa: no se detallan los datos de entrenamiento, hiperparámetros, número de tokens vistos ni resultados de evaluación.

Su relevancia es limitada y de nicho: al tener 0 descargas y 0 likes en el momento de la consulta, y una model card mínima generada automáticamente por Unsloth, debe considerarse un experimento personal más que un modelo listo para producción. Resulta útil únicamente como referencia para quienes quieran reproducir el pipeline de SFT con Unsloth sobre Qwen2.5-1.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | El modelo base de partida esta en 4 bits (bitsandbytes); los pesos publicados son safetensors (precision exacta no especificada) |
| Idiomas soportados | en (ingles, segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atención completa, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Sobre esta base cuantizada a 4 bits con bitsandbytes se ha aplicado un ajuste fino supervisado (SFT) mediante la librería Unsloth y el stack TRL/transformers.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior ni las hiperparámetros utilizados (learning rate, batch size, epochs). La model card únicamente indica que el entrenamiento se realizó con Unsloth y que este permite un entrenamiento "2x más rápido". No se documenta ninguna innovación técnica adicional más allá del uso de LoRA/QLoRA implícito en el flujo de Unsloth.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones (instruction following) a escala de 1,5 B de parámetros.
- Generación de código y matemáticas elementales, limitada por el tamaño del modelo.
- Soporte de tool calling / function calling: no confirmado para este ajuste concreto; el modelo base Qwen2.5-Instruct lo soporta, pero el SFT podría haberlo degradado.
- Capacidades de agente y razonamiento multi-paso: no documentadas; previsiblemente limitadas por el tamaño.
- Multilingüismo: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe; el ajuste fino podría haber reducido el soporte de otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado rápido de asistentes conversacionales en inglés: el modelo cabe en una GPU de consumo y permite iterar sobre prompts y flujos multi-turno sin infraestructura dedicada.
- Experimentación académica con SFT y QLoRA: sirve como ejemplo reproducible de ajuste fino de Qwen2.5-1.5B con Unsloth, útil para comparar pipelines de entrenamiento.
- Generación de texto de bajo coste en entornos con recursos limitados: al tener 1,54 B de parámetros, puede ejecutarse en CPU o GPU modestas para tareas de completado simple.
- Filtrado y clasificación de texto en inglés: tareas de etiquetado o resumen corto donde la latencia y el coste importan más que la precisión máxima.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para SFT adicionales en dominios específicos.
- Evaluación comparativa de modelos pequeños: útil como referencia en estudios sobre degradación de capacidades tras SFT en modelos de 1,5 B.
- Docencia y demostraciones: por su tamaño reducido, es adecuado para mostrar el ciclo completo de entrenamiento e inferencia en un curso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en FP16 (1,54 B × 2 bytes) más overhead de activaciones; en 4 bits, en torno a 1-1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más (GTX 1650 4 GB, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión). El tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles; para un modelo de 1,5 B en una RTX 4090 se espera un throughput del orden de cientos a miles de tokens por segundo en batch, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| franaiz/qwen2.5-1.5b-pgabl-sft | 1,54 B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino comunitario sin evaluacion publicada |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, ampliamente usado | Contexto mucho mayor, licencia con restricciones |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequena con benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5, hereda los sesgos del corpus de entrenamiento original, no evaluados en este ajuste.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,5 B; no se ha realizado evaluación de factualidad.
- Limitaciones de contexto e idioma: la model card solo declara inglés; el contexto máximo no está confirmado y podría haberse reducido respecto al modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base cuantizado de Unsloth y los términos de Qwen2.5 deben respetarse; conviene verificar la licencia del modelo original.
- Caveats para producción: sin benchmarks, sin dataset documentado, sin evaluación de calidad y con 0 descargas, no es recomendable para producción sin una evaluación propia exhaustiva.
- El ajuste fino sobre una base cuantizada a 4 bits puede introducir degradación adicional respecto al modelo original en FP16.
- El nombre "pgabl" del checkpoint no se explica en la model card, lo que impide conocer el dominio del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/franaiz/qwen2.5-1.5b-pgabl-sft
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
