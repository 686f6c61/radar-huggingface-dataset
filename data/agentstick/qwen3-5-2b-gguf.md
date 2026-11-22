# agentstick/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es un espejo no modificado del modelo Qwen3.5-2B en formato GGUF, publicado por el usuario agentstick bajo licencia Apache 2.0. El repositorio no contiene ningún desarrollo propio: según la model card, se trata de una copia byte a byte (mismo SHA-256) del archivo `Qwen3.5-2B-Q4_K_M.gguf` alojado en el repositorio de unsloth, mantenida como espejo de descarga para el proyecto AgentStick. El modelo original pertenece a la familia Qwen3.5 de Alibaba, de la que este repositorio solo redistribuye una cuantización Q4_K_M.

El dato de parámetros verificable procede de los safetensors del modelo base: 1.881.825.088 parámetros (aproximadamente 1,88 mil millones), coherente con la denominación comercial "2B". El archivo GGUF distribuido ocupa 1.280.835.840 bytes (unos 1,28 GB) y el repositorio completo 1,3 GB. La información pública disponible sobre este repositorio concreto es mínima: no se declaran idiomas soportados, pipeline, ni resultados de benchmarks, y el contador de descargas y likes es cero en el momento de la consulta.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto de distribución, no de un modelo entrenado por el autor del repositorio. Cualquier evaluación técnica rigurosa debe remitirse al modelo original de Qwen y a la cuantización de unsloth, que son las fuentes primarias de arquitectura, datos de entrenamiento y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.5; detalles no declarados en el repositorio) |
| Parametros totales | 1.881.825.088 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `Qwen3.5-2B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) en la documentación de este repositorio. La model card se limita a identificar el artefacto como espejo del modelo publicado por unsloth y a remitir a la licencia Apache 2.0. Cualquier afirmación sobre atención lineal, decodificación especulativa o arquitectura híbrida sería especulativa y no se incluye.

El único dato técnico verificable del proceso de distribución es la cuantización: el archivo usa el tipo Q4_K_M, una cuantización de 4 bits con mezcla de bloques K-quant, que típicamente reduce el peso a aproximadamente 4,8 bits por parámetro en promedio y preserva las capas de atención y feed-forward con mayor fidelidad que las cuantizaciones Q4_0 o Q4_1. El SHA-256 declarado (`aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223`) permite verificar la integridad de la descarga contra el original.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo, aunque no se detallan capacidades específicas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el archivo puede servirse mediante APIs compatibles con el formato de Hugging Face Inference Endpoints y motores tipo llama.cpp.
- Cuantización con imatrix: el tag `imatrix` indica que la cuantización empleó una matriz de importancia para calibrar los pesos, lo que suele mejorar la fidelidad frente a cuantizaciones sin calibración.
- Razonamiento, código, matemáticas, visión, audio, tool calling, agentes y modo thinking: no disponible en la información del repositorio. No se confirma ninguna de estas capacidades.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Despliegue local en equipos con recursos limitados: al ser un GGUF Q4_K_M de unos 1,28 GB, el modelo puede cargarse en CPU o GPU de gama baja mediante llama.cpp u Ollama, lo que permite prototipar asistentes conversacionales sin infraestructura dedicada.
- Espejo de descarga para pipelines de CI: el repositorio replica un archivo con SHA-256 conocido, de modo que un pipeline puede descargarlo desde aquí y verificar integridad sin depender de la disponibilidad del repositorio original.
- Pruebas de integración de endpoints compatibles: el tag `endpoints_compatible` permite usar este artefacto para validar el cableado de un servicio de inferencia antes de sustituirlo por un modelo mayor.
- Evaluación comparativa de cuantizaciones: al disponer del Q4_K_M con imatrix, se puede medir la degradación de calidad frente al modelo en precisión completa en tareas de generación corta.
- Generación de texto en aplicaciones de escritorio o embebidas: el tamaño reducido del archivo facilita su empaquetado en aplicaciones que necesitan un modelo generativo local sin conexión.
- Filtrado y clasificación de texto ligera: para tareas de etiquetado o resumen de fragmentos cortos donde el coste por token es determinante, un modelo de 1,88 mil millones de parámetros cuantizado ofrece un coste de cómputo bajo, aunque la calidad debe validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con el archivo Q4_K_M (1,28 GB de pesos más overhead de contexto y caché KV); el valor exacto depende de la longitud de contexto configurada.
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; tarjetas de gama de entrada como GTX 1650, RTX 3050 o superiores son suficientes. En GPU de datacenter (A100, H100) el modelo estaría infrautilizado y no es el caso de uso previsto.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales y en muchas integradas, siempre que se ajuste el contexto.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o servidores basados en el formato OpenAI-compatible). vLLM y TGI no son la vía natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponible; no se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentstick/Qwen3.5-2B-GGUF | 1.881.825.088 | no disponible | Q4_K_M | Apache 2.0 | Espejo en HF |
| unsloth/Qwen3.5-2B-GGUF | no disponible en la información | no disponible | no disponible | Apache 2.0 (según origen) | Repositorio original en HF |
| Modelo base Qwen3.5-2B | 1.881.825.088 (según safetensors) | no disponible | safetensors (precisión completa) | Apache 2.0 | Repositorio oficial de Qwen |

La comparativa se limita a las tres variantes del mismo modelo porque no se dispone de datos de rendimiento ni de especificaciones de contexto que permitan contrastarlo con alternativas de otros fabricantes sin inventar cifras.

## Limitaciones y advertencias

- El repositorio no es un modelo original: es un espejo sin modificaciones, por lo que los créditos, la responsabilidad técnica y el mantenimiento corresponden a los autores originales (Qwen y unsloth).
- No se declaran idiomas soportados, longitud de contexto ni pipeline; no es posible garantizar comportamiento multilingüe ni ventanas de contexto concretas a partir de esta ficha.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en precisión completa; la magnitud de esa degradación no está documentada en el repositorio.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay evaluación publicada que lo cuantifique para este artefacto.
- Sesgos: no documentados en el repositorio; deben asumirse los del modelo base, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; conviene verificar el archivo LICENSE del repositorio original antes de redistribuir.
- Contador de descargas y likes a cero: no hay evidencia de adopción ni de validación comunitaria de este espejo concreto.
- Para producción, se recomienda descargar desde el repositorio original de unsloth o de Qwen y verificar el SHA-256 declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agentstick/Qwen3.5-2B-GGUF
- Origen de la cuantización: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Revisión referenciada: `f6d5376be1edb4d416d56da11e5397a961aca8ae`
- Paper, blog, repositorio de código y demos: no disponible en la información proporcionada.
