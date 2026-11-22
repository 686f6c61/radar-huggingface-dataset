# Manprot/MP-01-100M-Chat

## Resumen

MP-01-100M-Chat es la variante conversacional del modelo base MP-01-100M, un transformer decoder-only de 100,6 millones de parámetros entrenado desde cero por el equipo Manprot. Está diseñado para conversación en inglés y aritmética básica, y por su tamaño puede ejecutarse en CPU o en una GPU de gama baja con aproximadamente 1 GB de memoria libre. Se publicó el 22 de noviembre de 2026 bajo una licencia aún por decidir.

El modelo parte de una arquitectura propia que no carga con `transformers`: requiere la librería `vbq` y el script `run.py` incluidos en el repositorio. Usa 18 capas, anchura 640, atención con query grouping (10 cabezas de atención, 5 de clave-valor) con QK-norm, capas feed-forward SwiGLU de 1.664 unidades ocultas y embeddings atados. El contexto es de 2.048 tokens y el vocabulario es un BPE a nivel de byte de 32.768 entradas.

El entrenamiento total asciende a unos 11,36B tokens (11,15B de preentrenamiento y 0,21B de ajuste fino), e incluye una fase de chat fine-tune seguida de un ajuste conjunto corto que recupera puntuaciones de benchmarks y WinoGrande sin perder el comportamiento conversacional. Es un modelo de investigación pequeño, pensado para experimentación y despliegue en entornos con recursos muy limitados, no para producción de alta exigencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autoregresivo (18 capas, anchura 640, GQA 10/5 cabezas, QK-norm, SwiGLU 1.664, embeddings atados) |
| Parametros totales | 100.623.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | bf16 (pesos); ejecución en bf16 o fp32. No se documentan otros formatos cuantizados |
| Idiomas soportados | inglés (en) |
| Licencia | to-be-decided (license: other) |
| Formato de pesos | safetensors (librería `vbq`, no compatible con `transformers`) |

## Arquitectura y entrenamiento

MP-01-100M-Chat es un transformer decoder-only autoregresivo con 18 capas y anchura 640. Emplea atención con query grouping (10 cabezas de consulta y 5 de clave-valor) con QK-norm, capas feed-forward SwiGLU con 1.664 unidades ocultas y embeddings atados entre entrada y salida. El vocabulario es un BPE a nivel de byte de 32.768 tokens y la ventana de contexto es de 2.048 tokens. Los pesos están en bf16 (unos 201 MB) y el modelo puede ejecutarse en bf16 o fp32.

El entrenamiento se organiza en fases. El preentrenamiento partió de un modelo de 75M parámetros que se amplió a 100M y consumió 4,0B + 0,61B tokens de web en inglés, textos enciclopédicos, educativos, matemáticas y código. Después se aplicó un chat fine-tune temprano de 0,18B tokens sobre datasets públicos de conversación, seguido de una expansión de 4,37B tokens sobre las mismas siete fuentes y una fase de cooldown de 2,10B tokens que corresponde a la release Preview. Sobre MP-01-100M se añadió una actualización científica (70,4M tokens de texto científico, splits de entrenamiento de benchmarks y replay) y, en la versión Chat, un ajuste fino conversacional más un ajuste conjunto corto que recuperó puntuaciones de benchmarks y WinoGrande manteniendo el comportamiento de chat. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Aritmética básica (el autor cita explícitamente sumas como «12 + 29»).
- Continuación de texto libre además del modo chat.
- Razonamiento de sentido común limitado, apoyado por los datasets de entrenamiento (ARC, QASC, OpenBookQA, SciQ, HellaSwag, WinoGrande, PIQA, CommonsenseQA).
- Conocimiento científico básico incorporado mediante la actualización científica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Experimentación educativa y de investigación: el modelo cabe en CPU o en una GPU de ~1 GB, lo que permite estudiar el comportamiento de un transformer pequeño entrenado desde cero sin infraestructura dedicada.
- Prototipado de interfaces conversacionales: sirve para validar pipelines de chat multi-turno con contexto de 2.048 tokens antes de migrar a modelos mayores.
- Asistente de aritmética básica en entornos embebidos: puede resolver operaciones sencillas localmente sin conexión, útil en demos y dispositivos con recursos mínimos.
- Generación de texto de relleno y continuaciones: con `run.py` y `--tokens`, se puede usar para completar textos cortos en tareas de prueba de pipelines de generación.
- Evaluación comparativa de arquitecturas: al ser un modelo propio con GQA, QK-norm y SwiGLU, resulta útil como referencia para estudiar el efecto de estas decisiones en modelos de ~100M.
- Docencia sobre entrenamiento de LLM: las fases documentadas (preentrenamiento, chat fine-tune, expansión, cooldown y actualización científica) permiten ilustrar un ciclo completo de entrenamiento con presupuesto reducido.
- Pruebas de integración de la librería `vbq`: sirve como caso de referencia para validar el cargador y el runtime propios del ecosistema Manprot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que un ajuste conjunto corto «restauró las puntuaciones de benchmarks y WinoGrande», pero no incluye cifras concretas.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 201 MB.
- VRAM estimada para inferencia: alrededor de 1 GB de memoria libre en GPU; también ejecutable en CPU.
- GPU recomendadas: cualquier GPU consumer con al menos ~1 GB libre (por ejemplo, GTX 1650, RTX 3050 o superiores); no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo con 1 GB o más de VRAM.
- Opciones de despliegue: script `run.py` del repositorio con `torch`, `tokenizers`, `safetensors` y `huggingface_hub`. No es compatible con `transformers`, por lo que no se puede usar directamente con vLLM, TGI, llama.cpp u Ollama sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Compatibilidad | Notas |
|---|---|---|---|---|---|
| MP-01-100M-Chat | 100,6M | 2.048 | to-be-decided | Runtime propio (`vbq`), no `transformers` | Inglés, chat + aritmética básica, 11,36B tokens de entrenamiento |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 | Apache 2.0 | `transformers`, GGUF, llama.cpp | Inglés, base de comparación habitual en el rango 100-200M |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | `transformers`, GGUF, vLLM | Multilingüe, contexto mucho mayor, mayor coste de cómputo |

La comparación con SmolLM-135M y Qwen2.5-0.5B es orientativa por rango de tamaño; no se dispone de datos de benchmarks del MP-01-100M-Chat para comparar rendimiento de forma cuantitativa.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo de investigación pequeño y que «se equivoca en muchos hechos»; riesgo alto de alucinación.
- Solo soporta inglés; no hay capacidades multilingües.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- No es compatible con `transformers`; requiere la librería `vbq` y el código del repositorio, lo que limita su integración en ecosistemas estándar.
- La licencia está «to-be-decided»: no hay garantías para uso comercial y conviene contactar con el autor antes de desplegarlo en producción.
- Capacidades de tool calling, agentes y razonamiento multi-paso no documentadas; no deben asumirse.
- Sin datos de benchmarks publicados, por lo que no se puede evaluar su calidad de forma objetiva frente a alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Manprot/MP-01-100M-Chat
- Modelo base MP-01-100M: https://huggingface.co/Manprot/MP-01-100M
- Versión Preview: https://huggingface.co/Manprot/MP-01-100M-Preview
- MP-02-16B-Preview: https://huggingface.co/Manprot/MP-02-16B-Preview
- Perfil del autor: https://huggingface.co/Manprot
