# Luigi/granite-4.0-350m-verifier

## Resumen

El modelo `Luigi/granite-4.0-350m-verifier` es un clasificador de veredictos de 350 millones de parámetros, fine-tuneado a partir de `ibm-granite/granite-4.0-350m` bajo licencia Apache-2.0. Su función específica es juzgar una viñeta de notas de reunión contra una evidencia extraída de una transcripción, emitiendo un veredicto de una sola palabra: **SUPPORTED**, **UNSUPPORTED** o **CONTRADICTED**, siguiendo el protocolo FAITH del pipeline *agentic-summarizer*. Fue desarrollado por el usuario "Luigi" para sustituir al juez `gpt-oss-20b` en la verificación en flujo y en el barrido final de verificación, permitiendo que todo el pipeline de resumen funcione completamente en dispositivo (on-device).

El modelo se distribuye en formato GGUF para `llama.cpp`, con un tamaño de repositorio de 0,2 GB, lo que indica una cuantización compacta (se menciona Q4_K_M en el ejemplo de uso). Está pensado para ejecutarse con baja latencia y mínimo consumo de recursos, manteniendo un acuerdo del 97% con el juez original de 20B en un conjunto de validación de 200 triples. Es relevante ahora porque ofrece una alternativa comercialmente segura y ligera a modelos de verificación de fidelidad mucho más grandes, sin sacrificar precisión en su dominio específico.

La arquitectura subyacente es la del modelo base Granite 4.0 de IBM, un transformer decoder-only, aunque no se especifican detalles adicionales en la documentación proporcionada. El entrenamiento se realizó con 2.644 triples (viñeta, evidencia, veredicto) balanceados por clase, mediante fine-tuning completo con tasa de aprendizaje 2e-5 durante 4 épocas en 2 GPUs con DDP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: ibm-granite/granite-4.0-350m) |
| Parametros totales | 352.379.904 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (según ejemplo de uso) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M; otros no especificados) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo del transformer `ibm-granite/granite-4.0-350m`, un modelo denso de 350M parámetros. No se han publicado detalles sobre la arquitectura interna (número de capas, heads, etc.) en la información disponible, pero al estar basado en Granite 4.0, se asume una arquitectura transformer decoder-only estándar.

El entrenamiento se realizó sobre un conjunto de datos propio de 2.644 triples `(bullet, evidence, verdict)` cosechados de ejecuciones T1 del pipeline *agentic-summarizer*, donde los veredictos fueron generados por `gpt-oss-20b` con mayoría triple. Los datos se balancearon por clase a tercios iguales para evitar el sesgo de colapso hacia SUPPORTED/UNSUPPORTED que se observó en verifiers no adaptados (5% de acuerdo) y en un modelo base de 270M (techo del 70%). Se aplicó fine-tuning completo con LR 2e-5, 4 épocas y DDP en 2 GPUs.

La innovación principal no está en la arquitectura sino en el enfoque de datos: al balancear las clases y usar veredictos de un juez potente como supervisión, se consigue un acuerdo del 97% con `gpt-oss-20b` en 200 triples held-out, superando a alternativas como el verifier basado en LFM2.5-350M (96%) y muy por encima del fine-tune de Gemma-3-270M (70%).

## Capacidades

- Clasificación de veredictos de fidelidad: emite una de tres etiquetas (SUPPORTED, UNSUPPORTED, CONTRADICTED) para una viñeta de notas frente a una evidencia textual.
- Verificación en flujo: puede integrarse en pipelines de generación de resúmenes para validar cada afirmación contra la transcripción original en tiempo real.
- Barrido final de verificación (VERIFY sweep): revisa todas las viñetas generadas al final del proceso de resumen.
- Operación on-device: al ser un modelo de 350M cuantizado, puede ejecutarse en dispositivos con recursos limitados (portátiles, edge, móviles) sin depender de APIs externas.
- Multilingüe limitado: soporta inglés y chino, según los idiomas declarados.
- No es un modelo generativo: no genera texto libre, solo produce veredictos de una palabra; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Verificación de fidelidad en resúmenes de reuniones: el modelo se integra en el pipeline *agentic-summarizer* para comprobar que cada viñeta del resumen está respaldada por la transcripción original, emitiendo un veredicto que permite descartar o corregir afirmaciones no soportadas o contradictorias.
- Control de calidad automatizado de actas: en empresas que generan actas de reuniones de forma automática, este verifier puede actuar como un filtro final que garantiza que ninguna afirmación inventada llegue al documento distribuido.
- Auditoría de resúmenes generados por LLMs: se puede usar como un juez ligero para evaluar la fidelidad de resúmenes producidos por otros modelos, comparando cada frase con el texto fuente.
- Verificación en tiempo real durante la generación de notas: al ser un modelo pequeño y rápido, puede ejecutarse en paralelo con el generador de resúmenes para detectar alucinaciones al vuelo y retroalimentar al sistema.
- Despliegue en entornos con restricciones de privacidad: al funcionar on-device, permite verificar resúmenes de reuniones confidenciales sin enviar datos a servidores externos, cumpliendo requisitos de cumplimiento normativo.
- Sustitución de jueces grandes en pipelines existentes: cualquier pipeline que actualmente use un modelo de 20B para verificación de fidelidad puede reemplazarlo por este verifier, reduciendo costes y latencia sin pérdida significativa de precisión (97% de acuerdo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento proporcionado es el acuerdo con el juez original `gpt-oss-20b` en un conjunto de validación de 200 triples held-out:

| Modelo | Acuerdo con gpt-oss-20b (200 triples) |
|---|---|
| granite-4.0-350m-verifier | 97% |
| LFM2.5-350M verifier | 96% |
| Gemma-3-270M fine-tune | 70% |

Este resultado se mide sobre la distribución de recuperación de evidencia del propio pipeline, por lo que no es directamente comparable con benchmarks generales de razonamiento o generación.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa aproximadamente 0,2 GB (tamaño del repositorio). Con overhead de ejecución, se estima un consumo de VRAM inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o incluso GPUs integradas. También puede ejecutarse exclusivamente en CPU con `llama.cpp`.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de consumo, incluso en Raspberry Pi 5 con suficiente RAM.
- Opciones de despliegue: `llama.cpp` (llama-server), compatible con el servidor OpenAI, y por extensión con herramientas como Ollama (si se convierte el GGUF) o vLLM (aunque no es el formato nativo).
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 350M con contexto 4096 y cuantización Q4, se espera una latencia de decodificación de milisegundos en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Acuerdo con gpt-oss-20b | Licencia | Formato |
|---|---|---|---|---|---|
| granite-4.0-350m-verifier | 352M | 4096 | 97% | Apache-2.0 | GGUF |
| LFM2.5-350M verifier | 350M | no disponible | 96% | Restringida (no comercial) | no disponible |
| Gemma-3-270M fine-tune | 270M | no disponible | 70% | Gemma (permisiva) | no disponible |
| gpt-oss-20b (juez original) | 20B | no disponible | 100% (referencia) | OpenAI (comercial) | no disponible |

El modelo supera a las alternativas de tamaño similar en acuerdo con el juez original, y su licencia Apache-2.0 permite uso comercial sin restricciones, a diferencia del verifier basado en LFM2.5.

## Limitaciones y advertencias

- Es un clasificador de veredictos, no un juez general: solo puede emitir SUPPORTED, UNSUPPORTED o CONTRADICTED para el formato específico de viñeta-evidencia del pipeline *agentic-summarizer*. No debe usarse para otras tareas de evaluación o razonamiento.
- El acuerdo del 97% se mide sobre la distribución de recuperación de evidencia del propio pipeline; fuera de esa distribución, el rendimiento puede degradarse significativamente.
- El modelo solo soporta inglés y chino; no se ha evaluado en otros idiomas.
- Los datos de entrenamiento provienen de veredictos de `gpt-oss-20b`, por lo que puede heredar sesgos del juez original, aunque el balanceo de clases mitiga el sesgo de colapso.
- No se han publicado evaluaciones de robustez ante entradas adversariales o evidencia ambigua.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o poco difundido; no hay garantía de mantenimiento o soporte.
- Para un uso correcto, el prompt del sistema y el formato EVIDENCE/BULLET deben coincidir byte a byte con los utilizados en el entrenamiento (según se indica en la model card), lo que limita su portabilidad a otros pipelines.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luigi/granite-4.0-350m-verifier
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-350m
