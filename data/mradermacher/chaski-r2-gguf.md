# mradermacher/chaski-r2-GGUF

## Resumen

`mradermacher/chaski-r2-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `SZLHOLDINGS/chaski-r2`, un ajuste fino (SFT) mediante LoRA sobre la base `Qwen/Qwen3.5-0.8B`. El autor de las cuantizaciones es mradermacher, un publicador habitual de versiones GGUF de modelos open source, mientras que el modelo original lo desarrolla SZLHOLDINGS. El resultado es un modelo conversacional de aproximadamente 752 millones de parámetros, orientado al idioma inglés y distribuido bajo licencia Apache 2.0.

El interés principal de esta ficha radica en su formato: al tratarse de cuantizaciones GGUF, permite ejecutar un modelo de menos de mil millones de parámetros en hardware muy modesto, incluyendo CPU y GPUs de consumo, con ficheros desde 0,5 GB (Q2_K) hasta 1,6 GB (f16). Esto lo convierte en una opción práctica para prototipado local, pruebas de pipelines de inferencia y experimentación con modelos pequeños.

No obstante, la model card original incluye las etiquetas `proposal-only` y `research-only`, lo que indica que el modelo está pensado para investigación y propuestas experimentales más que para despliegues de producción. La información disponible sobre arquitectura interna, datos de entrenamiento, benchmarks y contexto máximo es muy limitada; en esta ficha se indica explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B, ajustado con LoRA/SFT) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo original en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo original `SZLHOLDINGS/chaski-r2` se describe en sus etiquetas como un ajuste fino supervisado (SFT) realizado con LoRA sobre el modelo base `Qwen/Qwen3.5-0.8B`, usando las librerías TRL y Unsloth. Esto implica que la arquitectura subyacente es la del modelo Qwen3.5 de 0,8 mil millones de parámetros, aunque la model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron etapas adicionales de alineación como RLHF o DPO.

La contribución de este repositorio concreto es la cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix ni weighted quants, según indica el propio autor) en doce variantes GGUF. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; la información disponible se limita a los metadatos de cuantización y al origen del ajuste LoRA.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B y del ajuste SFT.
- Razonamiento básico y respuesta a instrucciones, presumiblemente reforzado por el entrenamiento SFT, aunque no se documentan evaluaciones específicas.
- Ejecución local en CPU y GPU de consumo gracias a las cuantizaciones GGUF de pequeño tamaño.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), lo que sugiere integración con infraestructuras de inferencia estándar.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Tool calling, function calling, agentes multi-step, visión, audio o modo thinking: no disponibles o no documentados en la información proporcionada.

## Casos de uso

- Prototipado local de chatbots: con cuantizaciones Q4_K_M de 0,6 GB, el modelo puede ejecutarse en un portátil sin GPU para validar flujos conversacionales antes de escalar a modelos mayores.
- Pruebas de pipelines de inferencia GGUF: útil para verificar compatibilidad con llama.cpp, Ollama u otras herramientas antes de desplegar modelos de mayor tamaño.
- Experimentación académica con ajustes LoRA: sirve como ejemplo reproducible de cómo un SFT sobre Qwen3.5-0.8B se distribuye en formato cuantizado para investigación.
- Generación de texto de bajo coste en entornos con recursos limitados: adecuado para tareas simples de completado o resumen en inglés donde no se requiere alta precisión.
- Evaluación comparativa de cuantizaciones: los doce niveles disponibles permiten medir el impacto de la cuantización en calidad y velocidad sobre un mismo modelo.
- Demos educativas de inferencia en dispositivos modestos: al caber en 0,5-1,6 GB, es viable en Raspberry Pi, portátiles antiguos o contenedores con poca memoria.
- Integración en servicios de endpoints compatibles: las etiquetas indican compatibilidad con endpoints, lo que facilita pruebas de API en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Q2_K, 0,6 GB para Q4_K_M, 0,9 GB para Q8_0 y 1,6 GB para f16, según los tamaños de fichero publicados.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; también funciona en GPUs integradas y CPU.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones, incluso en GPUs con 4 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo original es compatible con transformers.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 752 millones de parámetros cuantizado, se espera una latencia baja en GPU y moderada en CPU, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/chaski-r2-GGUF | 752 M | no disponible | Apache 2.0 | GGUF | Cuantizaciones de un SFT sobre Qwen3.5-0.8B, solo inglés, research-only |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | no disponible | no disponible | safetensors | Modelo base del ajuste; capacidades originales no documentadas aquí |
| SZLHOLDINGS/chaski-r2 | 752 M | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; etiquetado research-only |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas `proposal-only` y `research-only`: el modelo está declarado para investigación y propuestas, no para uso comercial en producción, pese a la licencia Apache 2.0.
- Idiomas: solo inglés; no se documenta soporte para castellano ni otros idiomas.
- Riesgo de alucinación: inherente a modelos pequeños de menos de mil millones de parámetros; no se han publicado evaluaciones de fiabilidad.
- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5-0.8B y de un dataset SFT no especificado, pueden heredarse sesgos del modelo base y del corpus de ajuste.
- Contexto: no disponible; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Cuantizaciones estáticas: el autor indica que no hay quants weighted/imatrix, lo que puede afectar la calidad en niveles bajos como Q2_K o Q3_K_M (marcado como "lower quality").
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las etiquetas research-only del modelo original deberían revisarse antes de un despliegue productivo.
- Falta de benchmarks: no hay datos publicados que permitan estimar calidad, latencia o throughput de forma fiable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/chaski-r2-GGUF
- Modelo original: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Modelo base del ajuste: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Página de overview de cuantizaciones del autor: https://hf.tst.eu/model#chaski-r2-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
