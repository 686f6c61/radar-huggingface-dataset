# reaperdoesntknow/LFM2.5-2.6B-CyberSec

## Resumen

LFM2.5-2.6B-CyberSec es un ajuste fino del modelo base LiquidAI/LFM2.5-2.6B, publicado por el usuario reaperdoesntknow bajo licencia Apache-2.0. El checkpoint está especializado en instrucciones de ciberseguridad y se distribuye tanto en formato Transformers (safetensors) como en exportaciones GGUF (F16, Q8_0 y Q4_K_M), lo que facilita su uso en entornos locales con llama.cpp u Ollama. Cuenta con 2.697.198.592 parámetros y está entrenado únicamente en inglés.

El modelo se presenta explícitamente como un lanzamiento de investigación: la model card no publica benchmarks, comparativas con el modelo base ni evaluaciones de seguridad. El autor vincula el ajuste al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, aunque no documenta hiperparámetros completos, criterios de selección de checkpoint ni comprobaciones de contaminación. Su relevancia actual radica en ser un ejemplo accesible de especialización vertical sobre un modelo pequeño, útil para experimentación local y para comparar el comportamiento del modelo ajustado frente al base sin modificar.

Al tratarse de un derivado de LFM2.5, hereda la arquitectura y el contexto del modelo de LiquidAI, pero la ficha no aporta detalles adicionales sobre el proceso de ajuste. Cualquier evaluación de su calidad en ciberseguridad debe hacerse por cuenta del usuario, con conjuntos de validación propios y sin asumir mejoras no demostradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (hereda la del modelo base LiquidAI/LFM2.5-2.6B; no se detalla en la model card) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF); bloque de cuantizacion bitsandbytes en la configuracion Transformers |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint LiquidAI/LFM2.5-2.6B, por lo que su arquitectura subyacente corresponde a la familia LFM2 de LiquidAI. La model card no describe la arquitectura interna, el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El único dato de entrenamiento registrado es el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, empleado presumiblemente para el ajuste por instrucciones.

No se documentan innovaciones técnicas propias del ajuste, ni detalles sobre decodificación especulativa, atención lineal u otras optimizaciones. Tampoco se especifican los hiperparámetros de entrenamiento, el régimen de precisión, el número de épocas ni los criterios de selección del checkpoint final. La model card reconoce esta ausencia de documentación y enumera la evidencia que faltaría para respaldar una afirmación sólida de mejora en ciberseguridad.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat.
- Respuesta a instrucciones relacionadas con ciberseguridad, según el dataset de ajuste declarado.
- Uso con `transformers` mediante `AutoModelForCausalLM` y `apply_chat_template`.
- Inferencia local con llama.cpp (`llama-cli`) y Ollama usando los GGUF incluidos.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de cuantización bitsandbytes en la configuración Transformers.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según los metadatos.

## Casos de uso

- Investigación sobre respuestas de modelos pequeños a instrucciones de ciberseguridad: permite comparar cualitativamente el checkpoint ajustado frente al modelo base LiquidAI sin modificar, usando los mismos prompts y parámetros de generación.
- Pruebas locales de formato y cuantización: los GGUF F16, Q8_0 y Q4_K_M permiten evaluar diferencias de comportamiento y calidad entre cuantizaciones en el mismo hardware.
- Desarrollo de arneses de evaluación: el modelo sirve como sujeto de prueba para construir pipelines de evaluación reproducibles con semillas, prompts y hashes de revisión fijos.
- Experimentación con despliegue en local: su tamaño de 2,6 mil millones de parámetros permite ejecutarlo con llama.cpp u Ollama en equipos de consumo para pruebas de latencia y throughput.
- Educación y divulgación controlada: puede emplearse en entornos aislados para generar explicaciones introductorias sobre conceptos como defensa en profundidad, siempre con revisión humana del contenido.
- Comparación de runtimes de inferencia: útil para medir diferencias entre Transformers con bitsandbytes y llama.cpp sobre el mismo checkpoint en tareas de instrucción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el repositorio no publica resultados de benchmark, comparativas con líneas base ni evaluaciones de seguridad, y detalla la evidencia que faltaría para respaldar afirmaciones de mejora.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 2,7 mil millones de parámetros en FP16 requiere aproximadamente 5,4 GB solo para pesos, y en Q4_K_M alrededor de 1,5-2 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, así como en A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 6 GB o más de VRAM en cuantizaciones Q4_K_M o Q8_0; en FP16 conviene disponer de al menos 8 GB.
- Opciones de despliegue: transformers con bitsandbytes, llama.cpp (`llama-cli -hf ... --jinja`) y Ollama (`ollama run hf.co/...`). No se documenta soporte explícito de vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formatos |
|---|---|---|---|---|---|
| reaperdoesntknow/LFM2.5-2.6B-CyberSec | 2,70 B | no disponible | Ciberseguridad (ingles) | apache-2.0 | safetensors, GGUF |
| LiquidAI/LFM2.5-2.6B (base) | 2,70 B | no disponible | Generalista | no disponible en esta ficha | no disponible en esta ficha |
| Alternativas especializadas en ciberseguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base LiquidAI/LFM2.5-2.6B, del que este checkpoint deriva. No se dispone de datos de benchmarks que permitan cuantificar diferencias de rendimiento entre ambos.

## Limitaciones y advertencias

- El modelo puede generar instrucciones incorrectas, desactualizadas, inseguras o dañinas.
- El material de ciberseguridad es de doble uso por naturaleza; su publicación y uso requieren controles de acceso y revisión.
- No se documentan el preprocesado del dataset, las comprobaciones de contaminación, los hiperparámetros completos de entrenamiento ni los criterios de selección del checkpoint.
- Las versiones cuantizadas pueden comportarse de forma distinta al checkpoint Transformers original.
- No se han publicado evaluaciones de seguridad, de mal uso ni de alucinación.
- No debe ejecutarse ningún comando generado sin revisión y aislamiento previos.
- No debe usarse como única base para respuesta a incidentes, divulgación de vulnerabilidades, control de acceso u otras decisiones consecuentes.
- El soporte idiomático se limita al inglés según los metadatos.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni avales de calidad o seguridad.
- El repositorio tiene 0 likes y unas 2.095 descargas en el momento de la consulta, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/LFM2.5-2.6B-CyberSec
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Dataset de ajuste: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Colección CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
