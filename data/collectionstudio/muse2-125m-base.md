# CollectionStudio/Muse2-125M-Base

## Resumen

Muse2-125M-Base es un modelo de lenguaje autorregresivo de 122,9 millones de parámetros desarrollado por Muse Research, publicado en HuggingFace bajo el identificador CollectionStudio/Muse2-125M-Base. Se trata del hermano pequeño de Muse2-230M y comparte su arquitectura híbrida de convolución y atención implementada desde cero en PyTorch (clase `Muse2ForCausalLM`, sin depender del código de `transformers`). El modelo está pensado para inferencia en el borde y en dispositivo, con un enfoque explícito en extracción estructurada de logs a JSON y en la disciplina de formato de salida.

La arquitectura combina 12 bloques que intercalan 7 bloques de convolución causal depthwise corta (kernel de tamaño 3) con 5 bloques de atención completa, usando Grouped-Query Attention con 12 cabezas de consulta y 6 de clave-valor, RoPE con theta 1e6, RMSNorm, MLPs SwiGLU fusionados en paralelo (hidden 768, ff 2304) y embeddings de entrada/salida atados. El vocabulario es de 65.536 tokens BPE a nivel de byte con tokens de control estilo ChatML. La longitud de contexto es de 8k tokens, ampliable hasta 128k según la model card.

El modelo es relevante ahora porque ofrece una implementación completamente reproducible y abierta (tokenizador, arquitectura y stack de inferencia) bajo licencia Apache-2.0, lo que lo convierte en un artefacto útil para investigar arquitecturas híbridas compactas y para desplegar asistentes conversacionales en entornos con presupuesto de cómputo muy ajustado. El repositorio incluye tanto los pesos base como los ajustados por instrucciones (SFT con enmascaramiento de pérdida solo en la completación), sin RLHF ni DPO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido convolución/atención (12 bloques: 7 de convolución causal depthwise kernel 3 + 5 de atención completa), GQA, RoPE theta 1e6, RMSNorm, SwiGLU |
| Parámetros totales | 122.915.328 (122,9M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8k tokens (máximo 128k según model card) |
| Tipos de cuantización | No disponible (la model card solo muestra carga en float32) |
| Idiomas soportados | Inglés (además de código fuente y texto matemático) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (librería PyTorch, paquete `muse` propio) |

## Arquitectura y entrenamiento

Muse2-125M emplea una arquitectura híbrida autorregresiva construida desde cero en PyTorch. Los 12 bloques intercalan 7 bloques de convolución causal depthwise de kernel 3 con 5 bloques de atención completa, lo que reduce el coste computacional frente a un transformer de atención pura manteniendo capacidad de modelado de dependencias locales y globales. La atención usa Grouped-Query Attention con 12 cabezas de consulta y 6 de clave-valor, RoPE con theta 1e6 para extensión de contexto, RMSNorm y MLPs SwiGLU fusionados en paralelo con dimensión oculta 768 y feed-forward 2304. Los embeddings de entrada y salida están atados y el vocabulario es de 65.536 tokens BPE a nivel de byte con tokens de control estilo ChatML (pad=0, bos=1, eos=7).

La versión ajustada por instrucciones se alineó mediante supervisión fina (SFT) con enmascaramiento de pérdida solo en la completación; no se aplicó RLHF ni DPO. El conocimiento tiene corte a principios de 2024. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset. La model card indica que no se ha aplicado alineamiento de seguridad, red-teaming ni filtrado de contenido.

## Capacidades

- Generación de texto en inglés con completación autorregresiva.
- Generación de código fuente y texto matemático (soporte declarado junto al inglés).
- Conversación multi-turno en la versión Instruct mediante plantilla ChatML.
- Salida estructurada y disciplinada en formato, orientada a extracción de logs a JSON.
- Razonamiento de formato y seguimiento de plantillas de salida.
- Capacidad de servir como base para fine-tuning posterior (versión Base).
- Inferencia en dispositivo y en el borde gracias a su tamaño compacto.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Extracción estructurada de logs a JSON: el modelo está explícitamente orientado a convertir registros no estructurados en objetos JSON con disciplina de formato, aprovechando su tamaño reducido para ejecutarse en el propio dispositivo donde se generan los logs.
- Asistente conversacional en el borde: la versión Instruct permite chat multi-turno con plantilla ChatML en entornos con presupuesto de memoria muy ajustado, donde un modelo mayor no cabría.
- Filtrado y formateo de salida en pipelines de datos: su énfasis en disciplina de formato lo hace adecuado para normalizar texto o reescribir campos según plantillas fijas antes de ingestarlos en un sistema posterior.
- Base para fine-tuning de dominio: al ser un modelo Base de 122,9M parámetros con licencia Apache-2.0, sirve como punto de partida económico para ajustar tareas específicas con recursos limitados.
- Investigación de arquitecturas híbridas: permite estudiar el comportamiento de bloques de convolución causal intercalados con atención completa en un modelo pequeño y completamente reproducible.
- Prototipado educativo de stacks de inferencia: al incluir tokenizador, arquitectura y código de inferencia propios, es útil para enseñar y experimentar con el ciclo completo de un modelo de lenguaje desde cero.
- Generación de código y texto matemático en herramientas locales: puede asistir en completaciones cortas de código o expresiones matemáticas dentro de aplicaciones de escritorio o móviles sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 122,9M parámetros, en float32 los pesos ocupan aproximadamente 0,49 GB; en float16 aproximadamente 0,25 GB; en cuantizaciones de 8 bits o 4 bits el peso sería aún menor, aunque la model card no documenta cuantizaciones soportadas.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y similares, así como en GPUs de datacenter (A100, H100) aunque no las aproveche.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer con al menos 1-2 GB de VRAM libre, e incluso es candidato a inferencia en CPU.
- Opciones de despliegue: el repositorio usa el paquete propio `muse` (PyTorch + safetensors). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Muse2-125M-Base | 122,9M | 8k (128k máx.) | Apache-2.0 | Híbrido convolución/atención desde cero, stack propio |
| Muse2-230M | No disponible | No disponible | Apache-2.0 | Hermano mayor de la misma familia, misma arquitectura |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No se dispone de datos de benchmarks ni comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- No se ha aplicado alineamiento de seguridad, red-teaming ni filtrado de contenido; puede generar salidas inexactas, sesgadas, repetitivas u objetables.
- Alucina hechos con facilidad a esta escala; no debe usarse para fiabilidad factual.
- Solo soporta inglés (además de código y matemáticas); no hay capacidades multilingües documentadas.
- Fuera de alcance: despliegue en producción sin evaluación y salvaguardas por parte del desarrollador, y cualquier uso crítico de seguridad, médico, legal o de dependencia factual.
- El contexto declarado es de 8k tokens, con un máximo de 128k según la model card, pero no se documenta validación de la extensión a 128k.
- La licencia Apache-2.0 permite uso comercial, pero siguen aplicando las licencias y atribuciones de los datasets upstream.
- El modelo es estático; pueden publicarse versiones posteriores con capacidades mejoradas.
- Las pruebas de seguridad y capacidad realizadas hasta la fecha se limitan a inspección cualitativa.

## Enlaces

- HuggingFace: https://huggingface.co/CollectionStudio/Muse2-125M-Base
- Modelo hermano Muse2-230M: referenciado en la model card como `../Muse2%20230M` (no se proporciona URL absoluta en la información disponible)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
