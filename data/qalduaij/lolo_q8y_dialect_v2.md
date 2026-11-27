# qalduaij/lolo_Q8y_Dialect_v2

## Resumen

lolo_Q8y_Dialect_v2 es un ajuste fino (fine-tuning) del modelo Qwen2.5-14B-Instruct orientado al dialecto kuwaití y a la producción de contenido radiofónico y dramático en ese registro lingüístico. Lo desarrolla Qusai Al-duaij (qalduaij) como parte de la denominada "familia lolo" de modelos soberanos kuwaitíes, un proyecto personal sin equipo de investigación detrás, según declara el propio autor en la model card.

El modelo parte de la arquitectura densa de Qwen2.5-14B (transformer decoder-only con 14.770.033.664 parámetros) y se distribuye como adaptador LoRA (r=32, alpha=64) sobre el modelo base, además de versiones cuantizadas en GGUF (Q4_K_M y Q8_0) para su uso con Ollama y LM Studio. La licencia es Apache 2.0 y cubre los idiomas árabe e inglés.

Su relevancia es acotada: se trata de un modelo de nicho para dialecto kuwaití, con 208 descargas y sin métricas de benchmarks publicadas. Resulta útil como caso de estudio de ajuste LoRA sobre un base sólido para un dialecto poco representado, pero no debe confundirse con un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parámetros totales | 14.770.033.664 (modelo base); adaptador LoRA de 1,03 GB |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF Q4_K_M (8,37 GB) y Q8_0 (14,62 GB); adaptador LoRA en safetensors |
| Idiomas soportados | Árabe (ar) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (LoRA), GGUF (cuantizaciones), tokenizer.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-14B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. El ajuste se realiza mediante LoRA con rango 32 y alpha 64, y el adaptador resultante (1,03 GB en safetensors) se aplica sobre el base. La model card menciona que la "base de conocimiento" se apoya en "diccionarios fonéticos y patrimoniales y textos radiofónicos y dramáticos kuwaitíes verificados", aunque no se especifica el volumen de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

No se documentan innovaciones técnicas propias (decodificación especulativa, atención lineal, etc.). El valor diferencial está en el corpus dialectal, no en la arquitectura. El repositorio incluye tokenizer, plantilla de chat y configuración de adaptador, lo que permite reproducir la inferencia con transformers, Ollama o LM Studio.

## Capacidades

- Generación de texto conversacional en dialecto kuwaití y en árabe estándar formal.
- Redacción de guiones radiofónicos y dramáticos en registro dialectal kuwaití.
- Traducción cruzada árabe-inglés (cross-lingual AR <-> EN).
- Conversación multi-turno con plantilla de chat propia (chat_template.jinja).
- Despliegue local mediante Ollama y LM Studio con los GGUF incluidos.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Producción de guiones radiofónicos en dialecto kuwaití: el modelo está entrenado sobre textos radiofónicos y dramáticos verificados, por lo que puede generar diálogos y locuciones con registro dialectal coherente para emisoras locales.
- Atención al cliente en kuwaití: permite conversaciones multi-turno en dialecto para empresas que atienden a población local, siempre que se valide el contexto máximo real antes de desplegar.
- Localización de contenidos: adaptación de textos en árabe estándar al dialecto kuwaití para campañas de marketing o comunicación institucional.
- Traducción y adaptación AR-EN: soporte bilingüe para documentación o atención a clientes en ambos idiomas.
- Investigación lingüística: corpus de referencia para estudiar variación dialectal kuwaití y evaluar modelos ajustados a dialectos minoritarios.
- Prototipado local sin GPU de datacenter: la versión Q4_K_M (8,37 GB) permite ejecutar el modelo en equipos de consumo con Ollama o LM Studio.
- Docencia y divulgación: ejemplo práctico de ajuste LoRA sobre Qwen2.5-14B para un dominio dialectal concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GB para Q4_K_M (8,37 GB de pesos más overhead de contexto); aproximadamente 15-16 GB para Q8_0 (14,62 GB de pesos más overhead).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto moderado; RTX 3090 o RTX 4080 (16-24 GB) para Q8_0; GPUs de 12 GB o superiores para Q4_K_M.
- Cabe en GPU de consumo: sí, tanto Q4_K_M como Q8_0 en tarjetas de 16 GB o más; Q4_K_M en tarjetas de 12 GB.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Dialect_v2:Q8_0` o `:Q4_K_M`), LM Studio, transformers con el adaptador LoRA, y text-generation-inference según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v2 | 14,77 B (base) + LoRA | No disponible | Apache 2.0 | Hugging Face, GGUF, Ollama | Dialecto kuwaití, sin benchmarks |
| Qwen2.5-14B-Instruct | 14,77 B | No disponible en esta ficha | Apache 2.0 | Hugging Face, amplia comunidad | Modelo base; multilingüe general, sin especialización dialectal |
| lolo_Q8y_Dialect_v3_31B | No disponible | No disponible | No disponible | Hugging Face (según model card) | Generación posterior del mismo autor sobre Gemma 4 31B |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- No hay benchmarks publicados: el rendimiento real frente al base Qwen2.5-14B-Instruct no está medido.
- El autor declara explícitamente que es un proyecto personal sin equipo científico ni formación profesional en programación; la calidad del ajuste no está auditada.
- Riesgo de alucinación inherente a los modelos de 14B, especialmente en datos factuales sobre Kuwait o su legislación.
- La longitud de contexto efectiva no está documentada; no asumir la ventana nativa de Qwen2.5 sin verificación.
- Cobertura lingüística limitada a árabe e inglés; el dialecto kuwaití puede degradarse fuera de los dominios del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-14B-Instruct tiene sus propios términos que conviene revisar.
- El tag "gemma4" en el repositorio es engañoso: el base real es Qwen2.5-14B-Instruct, no Gemma.
- Los tags "sovereign-ai" y la pertenencia a una "familia lolo" son afirmaciones de marketing del autor, no características técnicas verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Sitio del autor: https://www.alduaij.uk
- Repositorio de la familia lolo (referencia en model card): https://huggingface.co/qalduaij
