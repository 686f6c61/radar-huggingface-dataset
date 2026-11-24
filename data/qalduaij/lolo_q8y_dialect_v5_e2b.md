# qalduaij/lolo_Q8y_Dialect_v5_E2B

## Resumen

lolo_Q8y_Dialect_v5_E2B es un ajuste fino (fine-tuning mediante LoRA) del modelo unsloth/gemma-4-E2B-it, desarrollado por el autor independiente Qusai Al-duaij (qalduaij) dentro de su ecosistema "lolo AI". El modelo está especializado en árabe kuwaití (dialecto coloquial y patrimonial) y se distribuye como un modelo compacto orientado a ejecución local y en el borde ("edge"), con variantes en formato GGUF para Ollama y LM Studio además de los pesos en safetensors.

El modelo parte de la arquitectura Gemma 4 E2B ("Effective 2B"), un transformer multimodal de tipo image-text-to-text. El repositorio declara 5.123.178.051 parámetros en los pesos safetensors, lo que refleja el tamaño real del checkpoint base (no los "2B efectivos" del nombre comercial). El ajuste se realiza con LoRA de rango 32 y alpha 64, y el autor declara una política lingüística de árabe estándar formal combinada con el dialecto kuwaití, además de capacidades cruzadas árabe-inglés.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (dialecto kuwaití) con un modelo pequeño, licencia Apache 2.0 y artefactos listos para despliegue local (GGUF Q4_K_M de 3,19 GB y Q8_0 de 4,63 GB), lo que lo hace utilizable en hardware de consumo. No obstante, se trata de un proyecto personal en desarrollo, sin benchmarks publicados ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Gemma 4 E2B; ajuste fino con LoRA (r=32, alpha=64) |
| Parametros totales | 5.123.178.051 (según safetensors del repositorio) |
| Parametros activos | no disponible (no se declara arquitectura MoE para esta variante) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (3,19 GB) y Q8_0 (4,63 GB); pesos safetensors y adaptador LoRA en safetensors |
| Idiomas soportados | Árabe (incluido dialecto kuwaití) e inglés (ar, en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo y adaptador LoRA), GGUF, config.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo se construye sobre unsloth/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 en su variante "Effective 2B" orientada a dispositivos de borde. Sobre esa base se aplica un ajuste fino con LoRA de rango 32 y alpha 64, cuyo adaptador (adapter_model.safetensors, 368,68 MB) se publica junto al modelo completo. El repositorio incluye además el tokenizador, la plantilla de chat y la configuración de procesador, lo que sugiere que se conserva la capacidad multimodal del modelo base, aunque la model card no detalla el uso de imagen en el ajuste.

El autor declara que la base de conocimiento lingüístico proviene de "diccionarios fonéticos y patrimoniales y de textos radiofónicos y dramáticos kuwaitíes verificados". No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO adicionales sobre el ajuste supervisado. Tampoco se documentan innovaciones técnicas propias más allá del ajuste LoRA y la política lingüística declarada (árabe estándar formal más dialecto kuwaití, con cruce árabe-inglés).

## Capacidades

- Generación de texto conversacional en árabe kuwaití (dialecto coloquial y patrimonial) y en árabe estándar formal.
- Traducción y cruce lingüístico árabe-inglés.
- Procesamiento image-text-to-text heredado del pipeline declarado del modelo base (Gemma 4 E2B).
- Conversación multi-turno mediante plantilla de chat propia (chat_template.jinja).
- Despliegue local vía Ollama y LM Studio con los artefactos GGUF incluidos.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Asistentes conversacionales en kuwaití para atención al cliente local: el modelo puede mantener diálogos multi-turno en dialecto kuwaití, un registro que los modelos generalistas rara vez cubren con naturalidad, y ejecutarse en local sin enviar datos a la nube.
- Traducción y adaptación árabe-inglés en entornos institucionales kuwaitíes: útil para preprocesar documentación bilingüe o normalizar texto dialectal hacia árabe formal.
- Despliegue en el borde y en dispositivos con recursos limitados: los GGUF Q4_K_M (3,19 GB) y Q8_0 (4,63 GB) permiten ejecución en portátiles y estaciones de trabajo sin GPU dedicada de gran tamaño.
- Prototipado de aplicaciones de voz o radio: dado el origen declarado del corpus (textos radiofónicos y dramáticos), encaja en la generación de guiones o respuestas con registro dialectal kuwaití.
- Investigación lingüística sobre dialecto kuwaití: como modelo pequeño y de licencia permisiva, sirve para experimentar con normalización, transliteración o análisis de registro coloquial.
- Integración en pipelines de Hugging Face Transformers: el repositorio incluye config, tokenizer y plantilla de chat, lo que facilita su uso programático en prototipos de investigación.
- Educación y demostraciones de IA soberana local: el modelo se presenta como parte de una iniciativa de "IA soberana" kuwaití, adecuado para talleres o demos de despliegue local sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con cuantización Q4_K_M y 5-5,5 GB con Q8_0, considerando pesos más overhead de contexto.
- Pesos completos en safetensors: unos 10 GB en fp16 (5.123 millones de parámetros), más memoria para activaciones y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; el modelo es pequeño y no requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM usando GGUF Q4_K_M o Q8_0; también es viable en CPU con llama.cpp u Ollama.
- Opciones de despliegue: Ollama (`ollama run hf.co/qalduaij/lolo_Q8y_Dialect_v5_E2B:Q8_0` o `:Q4_K_M`), LM Studio, llama.cpp (GGUF), Transformers con safetensors y el adaptador LoRA.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lolo_Q8y_Dialect_v5_E2B | 5.123 M (checkpoint real) | no disponible | ar, en | Apache 2.0 | Especializado en dialecto kuwaití; GGUF incluidos |
| unsloth/gemma-4-E2B-it (base) | no disponible en la informacion | no disponible | multilingüe (Gemma) | licencia Gemma (no confirmada aquí) | Modelo base sin especialización dialectal |
| lolo_Q8y_Dialect_v4_26B_A4B | no disponible | no disponible | ar, en | no disponible | Generación anterior del mismo autor, arquitectura MoE (Gemma 4 26B-A4B) |
| lolo_Q8y_Dialect_v3_31B | no disponible | no disponible | ar, en | no disponible | Generación anterior, Gemma 4 31B, mayor tamaño |

## Limitaciones y advertencias

- Proyecto personal en desarrollo: el propio autor declara no ser programador profesional ni contar con equipo científico, y que el modelo sigue evolucionando.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, lo que impide compararlo objetivamente con alternativas.
- Riesgo de alucinación no evaluado: al ser un ajuste fino sobre un modelo pequeño, la fiabilidad factual en dominios especializados no está verificada.
- Cobertura limitada a árabe e inglés: no se declaran otros idiomas; el rendimiento en árabe estándar frente a dialecto kuwaití puede variar y no está medido.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base Gemma 4 E2B, que puede imponer condiciones adicionales al uso comercial derivado.
- Capacidades multimodales heredadas pero no validadas en el ajuste: el pipeline image-text-to-text no garantiza que el fine-tuning preserve el rendimiento en visión.
- Sin soporte documentado de tool calling ni agentes: no recomendable para pipelines que dependan de function calling sin pruebas previas.
- Corpus de entrenamiento no auditado: la composición del dataset (textos radiofónicos y dramáticos) puede introducir sesgos de registro o de contenido no evaluados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Sitio del autor: https://www.alduaij.uk
- Discusiones del modelo: https://huggingface.co/qalduaij/lolo_Q8y_Dialect_v5_E2B/discussions
- Modelo de la familia (general): https://huggingface.co/qalduaij/lolo_Q8y_General
- Modelo de la familia (legal): https://huggingface.co/qalduaij/lolo_Q8y_Legal
