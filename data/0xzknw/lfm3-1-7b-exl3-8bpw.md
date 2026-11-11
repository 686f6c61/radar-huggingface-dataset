# 0xzknw/LFM3-1.7B-EXL3-8bpw

## Resumen

LFM3-1.7B-EXL3-8bpw es una cuantizacion de 8 bits por peso (8bpw) en formato EXL3 del modelo base LiquidAI/LFM3-1.7B, publicada por el usuario 0xzknw. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint cuantizado que conserva la arquitectura, el tokenizador y la configuracion del modelo original de Liquid AI, empaquetado para su uso con runtimes que soportan EXL3 MCG, como MLXL3 o ExLlamaV3.

El checkpoint contiene 1.258.997.504 parametros reales (segun los safetensors) y ocupa 2,5 GB en el repositorio, lo que refleja el esquema de cuantizacion de 8 bits por peso. El modelo base pertenece a la familia LFM3 de Liquid AI, orientada a generacion de texto y conversacion, y se distribuye bajo la LFM Open License v1.0.

Su relevancia es practica: permite ejecutar un modelo de aproximadamente 1,3 mil millones de parametros con una fidelidad cercana al modelo de referencia en FP32 (KL media de 0,000243 nats/token sobre un pasaje bilingue de 499 tokens) manteniendo un tamano de descarga reducido. Es un artefacto pensado para inferencia, no para reentrenamiento ni para uso con pesos BF16 convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI; el checkpoint es una cuantizacion EXL3) |
| Parametros totales | 1.258.997.504 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 8 bits por peso (8bpw); el repositorio contiene unicamente esta variante |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors con checkpoint EXL3 (requiere runtime compatible con EXL3 MCG, p. ej. MLXL3 o ExLlamaV3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base LiquidAI/LFM3-1.7B (tipo de transformer, atencion, composicion del dataset o fases de alineamiento como RLHF o DPO). Lo que si se documenta es el proceso de cuantizacion: el checkpoint se genero con las herramientas de conversion de ExLlamaV3 al formato EXL3, con un esquema de 8 bits por peso, y se publico originalmente dentro de un repositorio multi-variante (0xzknw/LFM3-1.7B-EXL3) del que este repositorio es la extraccion de la carpeta `8bpw/`, copiada sin modificar su contenido.

La validacion reportada por el autor consiste en una comprobacion de fidelidad sobre un pasaje bilingue de 499 tokens, con una divergencia media de 0,000243 nats/token (KL muestreada) frente a la referencia en FP32. El autor advierte explicitamente de que se trata de una comprobacion limitada y no de un benchmark general de calidad. Los informes de validacion, la receta original y el manifiesto de origen se conservan en `source-evidence/` dentro del repositorio.

## Capacidades

- Generacion de texto y conversacion, heredadas del modelo base LFM3-1.7B (pipeline `text-generation`, tag `conversational`).
- Capacidad multilingue: el autor menciona un pasaje de validacion bilingue, pero no se especifica la lista de idiomas soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.
- Ejecucion en runtime EXL3: requiere un motor compatible con LFM3 y EXL3 MCG; no es cargable como un checkpoint BF16 estandar.

## Casos de uso

- Inferencia local en GPU de consumo: al ocupar 2,5 GB y usar 8bpw, el checkpoint puede cargarse en tarjetas con 8 GB o mas de VRAM, lo que permite desplegar un modelo conversacional de 1,3 mil millones de parametros en estaciones de trabajo sin GPU de datacenter.
- Prototipado rapido de asistentes conversacionales: el modelo base esta etiquetado como conversacional y el checkpoint mantiene tokenizador y configuracion, por lo que sirve para validar flujos de chat antes de escalar a modelos mayores.
- Evaluacion de la cuantizacion EXL3 en pipelines propios: util para equipos que quieran medir la perdida de calidad de 8bpw frente a FP32 en sus propios conjuntos de datos, usando la metodologia de KL reportada como referencia.
- Despliegue con MLXL3 o ExLlamaV3 en entornos con memoria limitada: al requerir un runtime especifico, encaja en stacks que ya usan estas herramientas para servir modelos cuantizados con baja latencia.
- Generacion de texto por lotes en CPU/GPU mixtas: el tamano reducido del checkpoint facilita procesar volumenes moderados de texto en hardware modesto.
- Base para experimentos de destilacion o evaluacion comparativa: al ser un artefacto pequeno y con licencia abierta, puede usarse como referencia cuantizada en estudios de eficiencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la fidelidad de cuantizacion: KL media de 0,000243 nats/token frente a la referencia FP32 sobre un pasaje bilingue de 499 tokens, que el propio autor califica como una comprobacion limitada y no un benchmark de calidad general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB solo para los pesos; hay que anadir la cache KV y el overhead del runtime. Con contexto corto, un presupuesto de 4-6 GB de VRAM es realista; el dato exacto no esta disponible.
- GPU recomendadas: no hay recomendaciones oficiales en la informacion disponible. Por tamano, cualquier GPU con 8 GB o mas (RTX 3060/4060, RTX 4070, RTX 4090, A100, H100) deberia poder alojarlo.
- GPU de consumo: si, cabe en tarjetas consumer de gama media con 8 GB o mas de VRAM.
- Opciones de despliegue: exclusivamente runtimes compatibles con EXL3 MCG y LFM3, como MLXL3 (https://github.com/0xZKnw/mlxl3) o ExLlamaV3 (https://github.com/turboderp-org/exllamav3). No es compatible con llama.cpp, Ollama ni vLLM en su forma actual, ya que el `.safetensors` no contiene pesos BF16 ordinarios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-EXL3-8bpw (este) | 1.258.997.504 | no disponible | EXL3 8bpw | LFM Open License v1.0 | Cuantizacion de LiquidAI/LFM3-1.7B; requiere runtime EXL3 |
| LiquidAI/LFM3-1.7B | no disponible en la informacion | no disponible | pesos originales (no disponible) | LFM Open License v1.0 | Modelo base sin cuantizar; referencia de fidelidad |
| 0xzknw/LFM3-1.7B-EXL3 | no disponible | no disponible | EXL3 multi-variante | LFM Open License v1.0 | Repositorio original retirado del que se extrajo esta variante |

No se dispone de datos de rendimiento comparativo con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La fidelidad de cuantizacion solo se valido sobre un pasaje bilingue de 499 tokens; no hay evidencia de calidad general frente al modelo base.
- El checkpoint no es un modelo entrenado de forma independiente: cualquier sesgo o limitacion del modelo base LiquidAI/LFM3-1.7B se hereda sin cambios.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en un modelo de 1,3 mil millones de parametros, pero no hay datos concretos.
- Idiomas soportados no documentados; el autor solo menciona una validacion bilingue sin especificar cuales.
- Longitud de contexto no disponible, lo que impide planificar cargas con ventanas largas.
- Restricciones de licencia: se aplica la LFM Open License v1.0, que no es una licencia permisiva estandar; es necesario revisar el archivo LICENSE y el NOTICE antes de un uso comercial.
- Dependencia de runtime: solo funciona con motores que soportan EXL3 MCG y LFM3; no es portable a llama.cpp, Ollama o vLLM.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- La model card archivada describe el repositorio multi-variante antiguo y sus enlaces relativos pueden no resolver.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/0xzknw/LFM3-1.7B-EXL3-8bpw
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Autor de la cuantizacion: https://huggingface.co/0xzknw
- Runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Liquid AI: https://huggingface.co/LiquidAI
