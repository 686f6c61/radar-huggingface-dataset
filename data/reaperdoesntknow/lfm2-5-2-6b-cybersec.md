# reaperdoesntknow/LFM2.5-2.6B-CyberSec

## Resumen

LFM2.5-2.6B-CyberSec es un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario reaperdoesntknow dentro de su colección CIx de modelos de ciberseguridad. El checkpoint está entrenado sobre el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset y se distribuye en dos formatos: pesos Transformers en safetensors y exportaciones GGUF (F16, Q8_0 y Q4_K_M). El modelo cuenta con 2.697.198.592 parámetros totales y está orientado a generación de texto conversacional en inglés.

Se trata de una release de investigación: la propia model card reconoce explícitamente que no se publican resultados de benchmarks, comparaciones con el modelo base ni evaluaciones de seguridad. Por tanto, la relevancia del modelo no reside en un rendimiento demostrado, sino en servir como artefacto reproducible para estudiar cómo responde un modelo pequeño a instrucciones de ciberseguridad y para compararlo con el LFM2.5-2.6B original sin modificar.

La licencia Apache-2.0 y la disponibilidad de cuantizaciones ligeras lo hacen manejable en hardware de consumo, lo que facilita pruebas cualitativas locales. No obstante, cualquier uso en producción debería ir precedido de una evaluación propia, dado que el autor no aporta evidencia de mejora en capacidad de ciberseguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5, familia LFM2 de LiquidAI) |
| Parámetros totales | 2.697.198.592 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF F16, Q8_0, Q4_K_M; configuración con bloque bitsandbytes 4-bit |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint LiquidAI/LFM2.5-2.6B, de la familia LFM2 de LiquidAI. La información disponible no detalla la arquitectura interna del modelo base (tipo de transformer, atención, capas ni configuración exacta), por lo que este dato queda como no disponible. El fine-tune se realizó sobre el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, según los metadatos del repositorio, y la model card menciona el uso de Unsloth en el proceso (etiqueta `unsloth`).

La model card es explícita sobre las carencias documentales: no se especifican hiperparámetros completos de entrenamiento, criterios de selección de checkpoint, preprocesamiento del dataset ni comprobaciones de contaminación. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación posterior al ajuste supervisado. No se describe ninguna innovación técnica específica más allá del propio ajuste de instrucciones sobre el modelo base.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat (`apply_chat_template`).
- Respuesta a instrucciones de ciberseguridad, presumiblemente moldeada por el dataset de ajuste (sin evidencia publicada de mejora).
- Formato compatible con Transformers (AutoModelForCausalLM, AutoTokenizer) y con llama.cpp/Ollama vía GGUF.
- Soporte de cuantización 4-bit mediante bitsandbytes en la configuración de Transformers incluida.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo de razonamiento explícito (thinking).
- Capacidad multilingüe limitada al inglés según los metadatos.

## Casos de uso

- Investigación sobre respuestas de modelos pequeños a prompts de ciberseguridad: el checkpoint permite estudiar cualitativamente cómo un modelo de 2.6B ajustado con instrucciones del dominio responde a preguntas técnicas, comparándolo con el base sin modificar.
- Comparación de formatos y cuantizaciones: al incluir safetensors, F16, Q8_0 y Q4_K_M en un mismo repositorio, facilita medir la degradación de calidad entre precisiones en un mismo conjunto de prompts.
- Desarrollo de harness de evaluación: sirve como sujeto de prueba para construir pipelines de evaluación reproducibles (semillas, prompts, revisiones de modelo) en el ámbito de seguridad.
- Pruebas locales de runtime de inferencia: útil para validar integraciones con Transformers, llama.cpp y Ollama en entornos sin GPU de datacenter, gracias a su tamaño reducido.
- Formación y concienciación en seguridad: puede emplearse en entornos controlados y aislados para generar ejemplos de explicaciones defensivas (por ejemplo, defensa en profundidad) que luego se revisan manualmente.
- Experimentación académica sobre ajuste de instrucciones: como caso de estudio de fine-tune con Unsloth sobre un dataset público de ciberseguridad, para analizar sesgos de dominio y comportamientos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el repositorio no publica resultados de benchmark, comparaciones con baseline ni evaluaciones de seguridad, y enumera la evidencia que faltaría para sostener una afirmación de mejora (split de test reservado, baseline del modelo base, benchmarks nombrados, harness reproducible, evaluación de seguridad y resultados separados por cuantización).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,4 GB en F16 (2.697 M parámetros × 2 bytes), aproximadamente 2,9 GB en Q8_0 y en torno a 1,7-2 GB en Q4_K_M, sin contar overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para F16 con contexto moderado; para Q4_K_M basta con 4 GB o incluso menos en configuraciones ajustadas.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 o superiores; también en GPUs integradas o CPU con cuantización Q4_K_M.
- Opciones de despliegue: Transformers (con `device_map="auto"` y bitsandbytes para 4-bit), llama.cpp (`llama-cli` con `--jinja`), Ollama (`ollama run hf.co/...:Q4_K_M`). No se documenta soporte explícito de vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-CyberSec | 2.697 M | no disponible | Apache-2.0 | safetensors, GGUF | Fine-tune de ciberseguridad sin benchmarks publicados |
| LiquidAI/LFM2.5-2.6B (base) | 2.697 M (heredado) | no disponible | Apache-2.0 (según metadatos del fine-tune) | no disponible en esta ficha | Modelo base sin ajuste de dominio; referencia natural de comparación |
| Alternativas de ~2-3B para ciberseguridad | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación más directa y fiable es con el propio modelo base LiquidAI/LFM2.5-2.6B, que comparte arquitectura y tamaño. No se han identificado en la información disponible otros modelos comparables de la misma categoría con datos verificables.

## Limitaciones y advertencias

- La model card advierte de que el modelo puede producir instrucciones incorrectas, desactualizadas, inseguras o dañinas.
- El material de ciberseguridad es intrínsecamente de doble uso: las mismas respuestas pueden emplearse de forma ofensiva o defensiva.
- No hay evidencia publicada de mejora en capacidad de ciberseguridad; la etiqueta del dataset y los archivos exportados no lo demuestran por sí solos.
- No se documentan comprobaciones de contaminación, preprocesamiento del dataset, hiperparámetros completos ni criterios de selección de checkpoint.
- Las versiones cuantizadas pueden comportarse de forma distinta al checkpoint en Transformers; los resultados no son extrapolables entre formatos.
- No se debe ejecutar comandos generados sin revisión y aislamiento previos.
- No debe usarse como única base para respuesta a incidentes, divulgación de vulnerabilidades, control de acceso u otras decisiones consecuentes.
- El modelo solo está documentado en inglés; el rendimiento en otros idiomas no está evaluado.
- Riesgo de alucinación no cuantificado: no se aportan evaluaciones específicas.
- Aunque la licencia es Apache-2.0 (permisiva para uso comercial), la ausencia de evaluaciones de seguridad desaconseja su despliegue en producción sin validación propia.
- El repositorio mezcla formatos Transformers y GGUF; es necesario elegir explícitamente la ruta de ejecución adecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-2.6B-CyberSec
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Colección CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
