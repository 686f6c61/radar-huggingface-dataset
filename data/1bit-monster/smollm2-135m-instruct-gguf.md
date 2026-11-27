# 1bit-MONSTER/SmolLM2-135M-Instruct-GGUF

## Resumen

SmolLM2-135M-Instruct-GGUF es una redistribución en formato GGUF del modelo SmolLM2-135M-Instruct de Hugging Face, cuantizado en Q4_K_M por Unsloth y reempaquetado por el usuario 1bit-MONSTER para su uso con el motor de inferencia propietario "1bit engine" sobre hardware Strix Halo. No se trata de un modelo nuevo: es un artefacto de distribución que conserva los pesos del modelo base, un transformer decoder-only de 134,5 millones de parámetros entrenado por Hugging Face.

El modelo base SmolLM2-135M-Instruct es el miembro más pequeño de la familia SmolLM2, diseñado para ejecución en dispositivos con recursos muy limitados (móviles, Raspberry Pi, navegadores) y para tareas conversacionales básicas. Su relevancia radica en su tamaño mínimo (0,1 GB en el repositorio, ~100 MB en Q4_K_M) y su licencia Apache 2.0, que permite uso comercial sin restricciones.

Este repositorio concreto tiene un interés limitado para el público general: solo 16 descargas y 0 likes en el momento de la consulta, y su model card está orientada exclusivamente al motor 1bit engine, no a llama.cpp estándar. Para la mayoría de casos de uso resulta más directo acudir al repositorio original de Hugging Face o al de Unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base SmolLM2-135M soporta 8.192 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | Q4_K_M (única incluida en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto es una cuantización Q4_K_M del modelo HuggingFaceTB/SmolLM2-135M-Instruct, un transformer decoder-only de 134,5 millones de parámetros. La model card no aporta detalles sobre la arquitectura interna, el número de capas, la dimensión oculta ni la composición del dataset de entrenamiento; esa información corresponde al modelo base y no se reproduce aquí.

La contribución técnica del repositorio se limita al reempaquetado del GGUF de Unsloth y a la publicación de métricas de rendimiento medidas en un entorno concreto (Strix Halo con backend Vulkan, septiembre de 2026): 30.637 tok/s en prefill (pp512) y 562 tok/s en generación (tg128). El autor advierte que el backend Vulkan fue eliminado del motor y que esas cifras están pendientes de remedición en la ruta HRX GPU. No se documenta ningún proceso de RLHF, DPO o ajuste adicional por parte de este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste de instrucciones del modelo base.
- Razonamiento básico y respuesta a preguntas simples; la capacidad está severamente limitada por el tamaño de 135M parámetros.
- Generación de código muy sencilla y completado de fragmentos cortos, sin garantías de corrección en tareas complejas.
- Soporte de tool calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; poco realista a este tamaño.
- Capacidades multilingües: no documentadas en este repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución en el motor 1bit engine mediante el comando `1bit serve -m ... --device hrx`.

## Casos de uso

- Pruebas de integración del motor 1bit engine: sirve como modelo de humo para validar la ruta GGUF y el dispositivo HRX antes de desplegar modelos mayores de la misma familia.
- Experimentación educativa con cuantización GGUF: permite inspeccionar un Q4_K_M de ~100 MB y comparar su comportamiento con el modelo en precisión completa.
- Prototipado de chatbots triviales en entornos con menos de 1 GB de RAM, donde no cabe ningún modelo mayor.
- Generación de texto de relleno o etiquetado simple en pipelines de datos, aceptando la baja calidad inherente a 135M parámetros.
- Benchmarking de hardware: las cifras de pp512 y tg128 publicadas permiten comparar el rendimiento de Strix Halo frente a otras plataformas en cargas de prefill y decodificación.
- Docencia sobre el ciclo de vida de un modelo open source: ilustra la cadena modelo base → cuantización de Unsloth → rehosting por un tercero → motor de inferencia alternativo.
- Pruebas de compatibilidad de endpoints: el tag `endpoints_compatible` sugiere uso en pruebas de integración con APIs compatibles, aunque no se detalla el protocolo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica métricas de throughput del motor:

| Métrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill) | 30.637 tok/s | Strix Halo, backend Vulkan, septiembre 2026 |
| tg128 (generación) | 562 tok/s | Strix Halo, backend Vulkan, septiembre 2026 |

El autor indica que estas cifras corresponden a un backend ya retirado y que están pendientes de remedición en la ruta HRX GPU.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB para el archivo Q4_K_M (~100 MB de pesos más overhead de contexto y KV cache); no se dispone de cifras exactas.
- GPU recomendadas: cualquier GPU integrada o discreta con al menos 1 GB de memoria; el autor valida Strix Halo (APU de AMD) como plataforma de referencia.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también es viable en CPU pura.
- Opciones de despliegue: 1bit engine (ruta documentada por el autor). El formato GGUF es compatible con llama.cpp, Ollama y otros runners GGUF, pero el repositorio no documenta ni valida esas rutas.
- Latencia y throughput: 562 tok/s de generación en Strix Halo con Vulkan según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (SmolLM2-135M-Instruct Q4_K_M) | 134,5 M | no disponible | Apache 2.0 | GGUF | 16 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 134,5 M | no disponible en esta ficha | Apache 2.0 | safetensors | Repositorio oficial de Hugging Face |
| unsloth/SmolLM2-135M-Instruct-GGUF | 134,5 M | no disponible en esta ficha | Apache 2.0 | GGUF | Repositorio de Unsloth, origen de esta cuantización |
| Qwen2.5-0.5B-Instruct | ~500 M | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Repositorio oficial de Alibaba |

La comparación relevante es entre este rehosting y los dos repositorios de los que deriva: los pesos son idénticos, por lo que la elección depende de la trazabilidad (repositorio oficial), del soporte de cuantización (Unsloth) o del motor de inferencia (1bit engine).

## Limitaciones y advertencias

- Con 135M parámetros, la calidad de razonamiento, matemáticas y código es muy baja; no es adecuado para tareas de producción que requieran precisión.
- Riesgo elevado de alucinación y de respuestas incoherentes en conversaciones largas o preguntas complejas.
- Sesgos: no documentados en este repositorio; heredados del dataset de entrenamiento del modelo base, no especificado aquí.
- Idiomas: no se documenta qué idiomas soporta; el modelo base está orientado principalmente al inglés, pero este dato no se confirma en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de la cuantización original, ya que este repositorio solo la hereda.
- Dependencia de un motor propietario: las instrucciones de uso apuntan a 1bit engine y al dispositivo HRX; no se valida el funcionamiento con llama.cpp estándar pese al formato GGUF.
- Métricas de rendimiento obsoletas: las cifras publicadas corresponden a un backend Vulkan ya eliminado y no se han remedido.
- Repositorio de muy baja adopción (16 descargas, 0 likes): sin comunidad que valide su funcionamiento ni reporte incidencias.
- Fecha de creación futura (2026-09-26) en los metadatos: conviene tratar las marcas temporales con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/1bit-MONSTER/SmolLM2-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Cuantización original de Unsloth: https://huggingface.co/unsloth/SmolLM2-135M-Instruct-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Página de familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
