# arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b1

## Resumen

ct-qwen36-35b-anth-gen-postcot-g0-b1 es un adaptador LoRA de rango 64 publicado por el usuario arianaazarbal sobre el modelo base Qwen/Qwen3.6-35B-A3B, dentro de un programa de entrenamiento denominado "constitutional training" basado en constituciones autoescritas de forma iterada (welfare-in-ai-rnd / constitutional_training). El adaptador corresponde a la generación 0 (g0) de la rama b1 de la cadena qwen36-35b-anth-gen-postcot, y su constitución semilla es un resumen de 5.000 tokens de la constitución de Anthropic. El repositorio incluye el fichero training_seed_constitution.md con la constitución exacta empleada en esta generación.

El problema que aborda es de investigación en alineación: cada generación se entrena desde cero sobre el modelo base con un corpus sintético que instancia una única constitución, de modo que la deriva entre generaciones se acumula solo a través de los documentos y nunca a través de los pesos. En la generación 0 la constitución procede de un texto humano (Anthropic); en generaciones posteriores procedería de una constitución escrita por el modelo de la generación anterior de la misma rama. El resultado es un artefacto experimental reproducible, con receta fija (LoRA r=64, lr 1e-4, coseno con 5 % de warmup, 1 época, batch 128, longitud máxima 8192, semilla 42) y exportado desde la plataforma Tinker.

Se trata de un adaptador, no de un modelo completo: requiere cargar Qwen3.6-35B-A3B (familia MoE, 35B totales y 3B activos según la nomenclatura del modelo base, dato no confirmado en la información proporcionada) y servirse con el renderer qwen3_5 con razonamiento activado. No tiene descargas ni likes en el momento de la consulta y su licencia no está declarada, por lo que es un artefacto de investigación más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=64, `target_modules=all-linear`) sobre un transformer MoE, Qwen/Qwen3.6-35B-A3B |
| Parámetros totales | No disponible para el adaptador; el modelo base es Qwen3.6-35B-A3B (35B según nomenclatura, no confirmado) |
| Parámetros activos | No disponible para el adaptador; aproximadamente 3B en el modelo base según la nomenclatura "A3B" (no confirmado) |
| Longitud de contexto | No disponible en la información proporcionada; el entrenamiento usó longitud máxima 8192 |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors (precisión del export no declarada); no se ofrecen versiones pre-cuantizadas del modelo fusionado |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), acompañado de `training_seed_constitution.md` y `tinker_meta.json` |
| Librería de carga | peft (con transformers para el modelo base) |
| Pipeline | text-generation |
| Tamaño del repositorio | 4,5 GB |
| Cadena / generación / rama | qwen36-35b-anth-gen-postcot / g0 / b1 |
| Semilla de la generación 0 | Constitución de Anthropic (resumen de 5.000 tokens) |
| Renderer de servicio | `qwen3_5`, razonamiento activado (reasoning ON) |
| Fecha de entrenamiento | 2026-09-15 |
| Fecha de exportación | 2026-09-18 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 64 aplicado sobre todos los módulos lineales del modelo base Qwen3.6-35B-A3B, que es un transformer con mezcla de expertos (MoE) de la familia Qwen 3.x. El adaptador no modifica la arquitectura subyacente: se carga con `PeftModel.from_pretrained` sobre el modelo base en bfloat16. La receta está bloqueada y documentada: rango 64, learning rate 1e-4, scheduler coseno con 5 % de warmup, 1 época, batch de 128, longitud máxima de 8192 tokens y semilla de entrenamiento 42.

El entrenamiento se divide en dos etapas. La primera es una etapa de "midtrain" sobre un corpus de documentos sintéticos que instancian una única constitución (la semilla de la generación). La segunda etapa (post-train) continúa desde el adaptador de la etapa 1 sobre datos de chat condicionados por la constitución y generados por Opus, conservando las trazas de razonamiento (chain-of-thought). No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de optimización por preferencias, ni el número de tokens de entrenamiento, ni la composición detallada del dataset más allá de su naturaleza sintética y constitucional.

La innovación metodológica es el esquema de constituciones iteradas: cada generación parte siempre del modelo base, nunca de los pesos de la generación anterior, y la única vía de transmisión entre generaciones es el documento constitucional (en g0, escrito por humanos; en g≥1, escrito por el modelo de la generación previa de la misma rama, seleccionado como medoide de embeddings con filtrado sobre un pool de 40 cadenas). Esto permite estudiar la deriva de valores a lo largo de generaciones sin confundirla con la acumulación de cambios en los pesos.

## Capacidades

- Generación de texto conversacional condicionada por una constitución concreta (la semilla de la generación 0, basada en la constitución de Anthropic).
- Razonamiento explícito: el modelo conserva trazas de chain-of-thought en el post-train y debe servirse con el renderer `qwen3_5` y razonamiento activado.
- Comportamiento condicionado por constitución: respuestas alineadas con el documento `training_seed_constitution.md` incluido en el repositorio.
- Herencia de las capacidades del modelo base Qwen3.6-35B-A3B, no documentadas específicamente en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el modo de razonamiento se activa mediante el renderer, pero no se detalla su comportamiento.

## Casos de uso

- Investigación en alineación constitucional: reproducción de la generación 0 de la cadena qwen36-35b-anth-gen-postcot para comparar el comportamiento inducido por la constitución de Anthropic frente a las generaciones derivadas.
- Estudio de deriva de valores entre generaciones: comparar las respuestas de este adaptador (g0) con las de g1, g2, etc., manteniendo fijo el modelo base y aislando el efecto del documento constitucional.
- Evaluación de generalización de LoRA a gran escala: el adaptador aplica rango 64 sobre todos los módulos lineales de un MoE de 35B, lo que lo convierte en un banco de pruebas para medir cuánta capacidad se transfiere frente a un fine-tuning completo.
- Auditoría de contenido constitucional: análisis de hasta qué punto el modelo reproduce principios de la constitución semilla, útil para equipos que investigan especificación de valores en sistemas conversacionales.
- Generación de datos sintéticos condicionados por constitución: uso del adaptador para producir respuestas con un sesgo normativo conocido, que luego pueden emplearse como corpus de entrenamiento o de comparación.
- Experimentación con decodificación y razonamiento: al conservar trazas de CoT, permite estudiar cómo el condicionamiento constitucional afecta al proceso de razonamiento y no solo a la respuesta final.
- Servicio de chat interno de investigación: despliegue con vLLM o similar en un entorno controlado para explorar interacciones multi-turno, siempre que se asuman las limitaciones de licencia y de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Adaptador: el repositorio ocupa 4,5 GB en disco; la VRAM adicional en inferencia es la de las matrices LoRA, pequeña frente al modelo base.
- Modelo base en bfloat16: aproximadamente 70 GB de VRAM para 35B parámetros, sin contar caché KV.
- Modelo base en 8 bits: del orden de 35-40 GB de VRAM.
- Modelo base en 4 bits (tras fusionar el adaptador y cuantizar a GGUF, AWQ o GPTQ): del orden de 20-24 GB, lo que lo sitúa en el límite de una RTX 4090 o RTX 3090 de 24 GB.
- GPU recomendadas: H100 o A100 80 GB para bfloat16; A100 40 GB, L40S o dos GPU de 24 GB para 8 bits; RTX 4090 / 3090 para cuantización de 4 bits con contexto reducido.
- Inferencia en GPU de consumo: viable en 4 bits en tarjetas de 24 GB, con la advertencia de que el adaptador debe fusionarse con el modelo base antes de cuantizar.
- Opciones de despliegue: vLLM, SGLang, TGI, llama.cpp u Ollama tras fusionar y convertir los pesos; en el caso de PEFT sin fusionar, transformers con `PeftModel`. Debe servirse con el renderer `qwen3_5` y razonamiento activado.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un MoE con pocos parámetros activos, se espera un coste por token inferior al de un modelo denso de tamaño equivalente, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ct-qwen36-35b-anth-gen-postcot-g0-b1 | Adaptador LoRA r=64 sobre 35B MoE | No disponible (entrenado a 8192) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales, ~3B activos según nomenclatura | No disponible en la información | Sin datos en esta ficha | No disponible en la información | HuggingFace |
| Otros adaptadores del mismo programa (otras ramas y generaciones) | Adaptadores LoRA r=64 sobre el mismo base | No disponible | Sin benchmarks publicados | No disponible | Referenciados por la cadena `qwen36-35b-anth-gen-postcot` |

No se han encontrado en la búsqueda web modelos comparables de la misma categoría (adaptadores de entrenamiento constitucional iterado) más allá de los pertenecientes al propio programa. La comparación con alternativas comerciales o de investigación equivalentes no está disponible.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin autorización explícita del autor.
- Es un adaptador, no un modelo autónomo: requiere descargar y ejecutar Qwen3.6-35B-A3B, con el coste de hardware asociado.
- Repositorio sin descargas ni likes y sin benchmarks: no hay evidencia pública de calidad, robustez ni regresiones respecto al modelo base.
- Sesgos: al estar entrenado sobre una constitución derivada de la de Anthropic, el modelo incorpora los sesgos y prioridades de dicho documento; no se documentan evaluaciones de sesgo demográfico o cultural.
- Riesgo de alucinación: inherente al modelo base; no se han publicado mediciones de fidelidad factual para este adaptador.
- Limitación de contexto en el entrenamiento: la longitud máxima fue de 8192 tokens, inferior a la ventana nativa del modelo base, lo que puede degradar el comportamiento en contextos muy largos.
- Idiomas: no se declara qué idiomas están cubiertos; un ajuste sobre datos predominantemente en inglés puede degradar el rendimiento en castellano u otras lenguas.
- Datos de entrenamiento sintéticos y generados por Opus: pueden introducir artefactos, estilos repetitivos o errores factuales en el corpus.
- Requisito de servido específico: usar un renderer distinto de `qwen3_5` o desactivar el razonamiento puede alterar el comportamiento esperado.
- Naturaleza experimental: es un artefacto de investigación sobre deriva constitucional, no un modelo validado para producción.
- Los metadatos indican fechas de 2026 y un modelo base de la familia Qwen 3.6; conviene verificar la disponibilidad y el estado real de dichos artefactos antes de integrarlos.

## Enlaces

- HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-anth-gen-postcot-g0-b1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Constitución semilla incluida en el repositorio: `training_seed_constitution.md`
- Metadatos de exportación: `tinker_meta.json`
- Programa de entrenamiento: welfare-in-ai-rnd / constitutional_training (no se ha encontrado URL pública en la información disponible)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de Google Translate, sin relación con el artefacto).
