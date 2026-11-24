# Piyush00023/coffy-3.5-flash-GGUF

## Resumen

coffy-3.5-flash es un modelo de lenguaje de tipo Sparse Mixture-of-Experts (MoE) con 19,06 mil millones de parámetros totales, distribuidos en 36 capas y 3 expertos (2 activos por token). Está construido en el formato estándar Qwen3-MoE, lo que permite su ejecución nativa en llama.cpp sin necesidad de código personalizado. El autor, Piyush00023, lo publica como pesos abiertos bajo licencia Apache-2.0.

Este repositorio concreto contiene únicamente builds GGUF pre-cuantizados del modelo principal `Piyush00023/coffy-3.5-flash`, convertidos y cuantizados con llama.cpp a partir de los shards oficiales en fp16 en safetensors. El objetivo es facilitar el despliegue en entornos con recursos limitados mediante llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF.

La relevancia del modelo reside en su formato Qwen3-MoE y su tamaño contenido (19,06B totales con solo 2 expertos activos por token), que reduce el coste computacional por token frente a un transformer denso equivalente. No obstante, la model card advierte que la identidad ajustada de las variantes densas no se trasladó al ensamblado MoE, por lo que el modelo puede autoidentificarse como "Qwen".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse Mixture-of-Experts (MoE) en formato Qwen3-MoE, 36 capas, 3 expertos (2 activos por token) |
| Parametros totales | 19,06B |
| Parametros activos | 2 de 3 expertos por token (número exacto de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~11 GB), Q8_0 (~20 GB) |
| Idiomas soportados | en, code |
| Licencia | Apache-2.0 (pesos abiertos, no código abierto) |
| Formato de pesos | GGUF (cuantizado); el build F16 completo no se aloja en este repositorio |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con capas de mezcla de expertos dispersa (Sparse MoE): 36 capas, 3 expertos por capa y 2 expertos activos por token. Está construido en el formato estándar Qwen3-MoE, lo que garantiza compatibilidad nativa con llama.cpp. Según la model card, el modelo fue construido ensamblando expertos de la familia Qwen3.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Los pesos de este repositorio son únicamente cuantizaciones del modelo principal; el build en fp16 no se aloja aquí.

## Capacidades

- Generación de texto en inglés y en contextos de código.
- Razonamiento y generación de código (según los tags del modelo: `code`, `text-generation`).
- Ejecución nativa en llama.cpp, Ollama y LM Studio gracias al formato GGUF.
- Capacidades multilingües limitadas a inglés y código; no se documentan otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: el build Q4_K_M (~11 GB) puede ejecutarse en CPU con llama.cpp, como indica el smoke test del autor, lo que permite prototipar sin infraestructura cloud.
- Asistencia a la programación en entornos de desarrollo integrados: al estar orientado a código y compatible con llama.cpp, puede integrarse en extensiones de editor para autocompletado y generación de fragmentos.
- Generación de texto en inglés para pipelines de contenido: el modelo produce texto coherente en inglés, adecuado para borradores y resúmenes en flujos automatizados.
- Experimentación con arquitecturas MoE: al ser un formato Qwen3-MoE estándar, sirve para estudiar el comportamiento de mezcla de expertos con 2 de 3 expertos activos en entornos de investigación.
- Inferencia en dispositivos con memoria limitada: la versión Q8_0 (~20 GB) ofrece una calidad casi sin pérdida para máquinas con suficiente RAM o VRAM, mientras que Q4_K_M reduce el requisito a ~11 GB.
- Pruebas de compatibilidad de runtimes GGUF: útil para validar pipelines con llama.cpp, Ollama o LM Studio antes de adoptar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~11 GB para Q4_K_M y ~20 GB para Q8_0, según los tamaños de archivo indicados en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no se especifica; el autor solo confirma un smoke test en CPU con Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli, llama-cpp-python), Ollama, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| coffy-3.5-flash (este) | 19,06B MoE (2/3 expertos activos) | no disponible | Apache-2.0 | GGUF (Q4_K_M, Q8_0) | Construido en formato Qwen3-MoE |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Autoidentificación incorrecta: la model card advierte que el modelo puede decir que es "Qwen", ya que las capas de identidad ajustadas de las variantes densas no se trasladaron al ensamblado MoE.
- Procedencia del ensamblado: el modelo fue construido ensamblando expertos de la familia Qwen3, lo que puede implicar comportamientos heredados no documentados.
- Idiomas: solo se declaran inglés y código; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni tasas de alucinación; se recomienda validación humana en producción.
- Licencia: Apache-2.0 permite uso comercial, pero la propia model card aclara que se trata de "pesos abiertos, no código abierto".
- Madurez: el repositorio registra 0 descargas y 1 like en el momento de la consulta, y solo se ha realizado un smoke test en CPU; no hay evidencia de validación a escala.
- Cuantización: este repositorio contiene solo pesos cuantizados; el F16 completo no está alojado aquí, lo que limita la reproducibilidad de la conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Piyush00023/coffy-3.5-flash-GGUF
- Modelo principal: https://huggingface.co/Piyush00023/coffy-3.5-flash
- Licencia del modelo principal: https://huggingface.co/Piyush00023/coffy-3.5-flash#license
- Contacto del autor: piyushdas000@gmail.com
