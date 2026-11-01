# MihaiPopa-1/Qwen3.8-2B-Tema_Q-Abliterated

## Resumen

Qwen3.8-2B-Tema_Q-Abliterated es una variante sin censura del modelo Empero Qwen3.8-2B, un modelo causal de 2.274 millones de parámetros obtenido por destilación de parámetros completos del profesor Qwen3.8 2.4T A95B sobre la arquitectura Qwen3.5-2B. Lo publica el usuario MihaiPopa-1 en HuggingFace y su rasgo distintivo es haber sido procesado con la herramienta Tema_Q-Abliterated v1.1.1, que elimina el comportamiento de rechazo (refusals) mediante ablación de una dirección de rechazo en los pesos, sin reentrenar.

El modelo conserva las capacidades del estudiante original: razonamiento con cadena de pensamiento destilada, function calling nativo, contexto nativo de 262.144 tokens y un tamaño que permite ejecución en dispositivos de borde. La intervención de abliteración reporta 2 rechazos de cada 100 generaciones completas con una divergencia KL de 0,0023 respecto al modelo base, lo que sugiere una degradación limitada en el comportamiento general.

Es relevante para quienes necesitan un modelo pequeño, desplegable en CPU o GPU de consumo, sin filtros de rechazo para tareas de investigación, generación creativa o evaluación de robustez. Conviene señalar que la model card solo declara inglés como idioma y que la licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.5), ruta de texto de una base visión-lenguaje |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantización | no disponible en la información proporcionada (el autor menciona builds cuantizados ejecutables en móviles y CPU, sin detallar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato Transformers); conversión a GGUF mencionada como posible, no publicada |

## Arquitectura y entrenamiento

El modelo base Empero Qwen3.8-2B es un transformer causal de la familia Qwen3.5, concretamente la ruta de texto de una base visión-lenguaje. Se entrenó mediante SFT con destilación off-policy sobre aproximadamente 30.000 trazas del profesor Qwen3.8 2.4T A95B, con cadenas de pensamiento densas que cubren matemáticas, razonamiento general y seguimiento de instrucciones, filtradas por calidad antes del entrenamiento. Es un ajuste fino completo de todos los parámetros, no un adaptador, y comparte currículo con los distills de 9B y 4B de la misma familia.

La capa de abliteración aplicada por Tema_Q-Abliterated v1.1.1 usa el algoritmo SCAPE, que evalúa candidatos de búsqueda mediante un objetivo sustituto aproximadamente 49 veces más rápido que la evaluación por generación completa de las herramientas convencionales. La búsqueda opera sobre `attn.o_proj` y `mlp.down_proj` con pesos máximos de 0,719 y 0,452 respectivamente, forma de kernel plana y dirección por capa. El resultado reportado es de 2 rechazos en 100 generaciones completas, KL de 0,0023 frente al base y comprobación de colapso satisfactoria.

## Capacidades

- Generación de texto con razonamiento explícito: cada respuesta abre con un bloque `<think>` aprendido de las trazas del profesor.
- Razonamiento matemático y aritmético, con mejora sustancial en GSM8K CoT respecto al base.
- Razonamiento general y conocimiento en 57 materias (protocolo MMLU CoT).
- Function calling nativo según la especificación de Qwen3.5, sin wrapper ni fine-tune específico de herramientas.
- Soporte de conversaciones multi-turno con contexto muy largo (262.144 tokens).
- Comportamiento sin rechazo: la abliteración elimina las respuestas de negativa del modelo base.
- Capacidades multilingües limitadas: solo inglés declarado.
- No se declaran capacidades de visión, audio ni modo thinking separado más allá del bloque `<think>`.

## Casos de uso

- Investigación sobre alineación y robustez: el modelo permite estudiar cómo la ablación de una dirección de rechazo afecta al comportamiento general con una KL medida de 0,0023, útil para comparar metodologías de abliteración.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que requiera temáticas sensibles, aprovechando la ausencia de rechazos y el contexto de 262.144 tokens para mantener coherencia en textos largos.
- Evaluación de pipelines de seguridad: servir como modelo de referencia "sin censura" para medir la eficacia de clasificadores y guardrails en producción.
- Asistente local en dispositivos de borde: con bf16 en torno a 4 GB y builds cuantizados, puede ejecutarse en teléfonos, SBC y máquinas solo CPU, útil para asistentes offline de bajo consumo.
- Razonamiento matemático en entornos educativos o de análisis: la mejora de GSM8K CoT (0,330 a 0,640 en exact match flexible) lo hace viable para resolución de problemas paso a paso en herramientas de tutoría.
- Automatización con function calling: integración en agentes que necesiten invocar APIs o herramientas mediante el formato nativo de Qwen3.5, con contexto suficiente para mantener el historial de llamadas.
- Procesamiento de documentos extensos: resumen y extracción sobre entradas de hasta 262.144 tokens en pipelines de análisis documental en inglés.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` (backend HF) sobre el modelo base Empero Qwen3.8-2B, con protocolos CoT y muestreo `temperature=0.6, top_p=0.95, top_k=20`. No se han publicado resultados específicos de la variante abliterada en la información disponible.

| Tarea | Métrica | Qwen3.5-2B (base) | Qwen3.8-2B | Δ |
|---|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0,330 | 0,640 | +0,310 |
| gsm8k_cot | exact_match (strict) | 0,545 | 0,640 | +0,095 |
| mmlu (CoT, 57 materias) | acc (flexible-extract) | 0,283 | 0,548 | +0,265 |
| mmlu (CoT, 57 materias) | acc (strict-match) | 0,004 | 0,225 | +0,221 |

Métricas de la abliteración (Tema_Q-Abliterated v1.1.1):

| Métrica | Valor |
|---|---:|
| Rechazos (generación completa) | 2/100 |
| Divergencia KL respecto al base | 0,0023 |
| Comprobación de colapso | OK |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 4,5 GB para pesos, más overhead de activaciones y caché KV; con contexto completo de 262.144 tokens la caché KV crece de forma significativa y exige planificación de memoria.
- GPU recomendadas: A100, H100 o L40S para contexto largo y throughput alto; RTX 4090 o RTX 3090 para inferencia en bf16 con contextos moderados.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y similares en bf16; en cuantización de 4 bits cabe en GPUs de 6-8 GB.
- Ejecución en CPU y borde: el autor indica que los builds cuantizados corren en teléfonos, placas SBC y máquinas solo CPU.
- Despliegue: compatible con Transformers, vLLM y SGLang según la model card; la conversión a llama.cpp/GGUF se menciona como posible pero no se publica en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Qwen3.8-2B-Tema_Q-Abliterated | 2,27B | 262.144 | Apache 2.0 | Variante abliterada, sin rechazos, solo inglés |
| Empero Qwen3.8-2B | 2B | 262.144 | Apache 2.0 | Modelo base con rechazos; benchmarks CoT publicados |
| Qwen3.5-2B | 2B | no disponible | no disponible | Base arquitectónica; peor rendimiento CoT en GSM8K y MMLU |
| Empero Qwen3.8-4B | 4B | no disponible | no disponible | Mismo currículo de destilación, mayor capacidad |

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo, pero no garantiza corrección factual: el riesgo de alucinación del modelo base persiste y puede aumentar en dominios sensibles.
- Solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- La licencia Apache 2.0 permite uso comercial, pero la eliminación de filtros de seguridad traslada al desplegador la responsabilidad legal y ética sobre el contenido generado.
- Los benchmarks publicados corresponden al modelo base Empero Qwen3.8-2B, no a esta variante abliterada; la KL de 0,0023 sugiere cambios acotados, pero no hay evaluación independiente de la degradación en tareas específicas.
- El contexto de 262.144 tokens exige memoria considerable para la caché KV; en hardware de consumo habrá que truncar contexto o usar cuantización agresiva.
- El repositorio tiene pocas descargas (255) y ningún "like", sin señales de validación por parte de la comunidad.
- No se detallan formatos de cuantización publicados ni pesos GGUF listos para usar; la conversión queda a cargo del usuario.
- El modelo deriva de una base visión-lenguaje, pero solo se distribuye la ruta de texto; no hay capacidades de imagen en esta publicación.

## Enlaces

- HuggingFace: https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Tema_Q-Abliterated
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Modelo original Empero: https://huggingface.co/empero-ai/Qwen3.8-2B
- Familia Empero Qwen3.8-9B: https://huggingface.co/empero-ai/Qwen3.8-9B
- Familia Empero Qwen3.8-4B: https://huggingface.co/empero-ai/Qwen3.8-4B
- Arquitectura base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Herramienta de abliteración: https://github.com/ek15072809/Tema_Q-Abliterated
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- Organización Empero: https://empero.org
