# ProCreations/minima-100m-g32-geom

## Resumen

Minima W1.58A8 es un modelo de lenguaje de 88,67 millones de parámetros con pesos ternarios (valores lógicos en {-1, 0, +1}), desarrollado por ProCreations como un artefacto empaquetado para la librería `minima`. Se basa en el encoder LiquidAI/LFM2.5-Encoder-350M, del que se deriva mediante un proceso de compresión o destilación que reduce drásticamente el tamaño y el coste computacional. El nombre del repositorio indica un tamaño de grupo de 32 y una variante "geom" (probablemente referida a la geometría de cuantización).

El modelo está diseñado para ejecutarse en hardware de consumo, con un peso del checkpoint de aproximadamente 0,1 GB. Su formato de almacenamiento compacto y su representación ternaria permiten una inferencia muy eficiente en CPU y GPU pequeñas. La licencia es `lfm-open-license-v1.0`, una licencia de código abierto de Liquid AI. No se han publicado detalles sobre el dataset de entrenamiento, el proceso de ajuste ni los benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con pesos ternarios (W1.58A8) |
| Parámetros totales | 88.669.952 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se especifica en `minima_config.json`) |
| Tipos de cuantización | Ternaria lógica {-1, 0, +1}, formato de runtime I2_S, grupo de tamaño 32 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (enlace al LICENSE del modelo base) |
| Formato de pesos | safetensors (checkpoint compacto ternario) |

## Arquitectura y entrenamiento

El modelo es un transformer codificador (derivado de LFM2.5-Encoder-350M) cuyos pesos de las matrices han sido cuantizados a valores ternarios {-1, 0, +1} con un esquema de grupo de tamaño 32. El formato de runtime I2_S sugiere una representación de 2 bits por peso, lo que reduce el footprint de memoria a aproximadamente 22 MB para los pesos (sin contar overhead). El repositorio almacena un "artefacto" empaquetado que debe cargarse con la librería `minima` mediante `MinimaModel.from_pretrained(...)`.

No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detalla el proceso de destilación o poda a partir del modelo base de 350M. El nombre "geom" podría indicar un método de cuantización geométrica, pero no hay documentación al respecto.

## Capacidades

- Generación de texto: al ser un encoder, su capacidad principal es la representación de texto, aunque puede adaptarse para generación si se usa con un decodificador apropiado (no se especifica).
- Razonamiento y comprensión del lenguaje: como encoder, es adecuado para tareas de clasificación, extracción de características y embeddings.
- Soporte de tool calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: cuantización ternaria para inferencia eficiente en hardware limitado.

## Casos de uso

- Clasificación de texto en dispositivos edge: el modelo puede ejecutarse en un Raspberry Pi o un móvil gracias a su tamaño reducido, permitiendo clasificar correos, comentarios o tickets de soporte sin conexión.
- Extracción de embeddings para búsqueda semántica: al ser un encoder, puede generar representaciones vectoriales de documentos para sistemas de recuperación, con un coste de memoria mínimo.
- Filtrado de contenido en tiempo real: su baja latencia permite analizar flujos de mensajes en redes sociales o chats para detectar spam o toxicidad.
- Prototipado rápido en entornos con recursos limitados: desarrolladores pueden probar pipelines de NLP en portátiles sin GPU, gracias a la cuantización ternaria.
- Aprendizaje por transferencia en dominios específicos: el checkpoint puede servir como punto de partida para fine-tuning con pocos datos, manteniendo un footprint reducido.
- Inferencia en tiempo real en servidores de bajo coste: al ocupar menos de 100 MB, puede desplegarse en funciones serverless o contenedores con límites estrictos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada: los pesos ternarios ocupan aproximadamente 22 MB (2 bits por parámetro), más overhead de activaciones. Con un batch pequeño, la VRAM total no debería superar los 200 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, Jetson Nano, o integradas recientes). También funciona en CPU sin GPU.
- Consumer GPU: sí, cabe en cualquier GPU de consumo moderna e incluso en muchas integradas.
- Opciones de despliegue: la librería `minima` es la vía principal; también podría exportarse a ONNX o GGUF si se convierte, aunque no se documenta.
- Latencia y throughput: no hay datos oficiales; se estima una inferencia de decenas de microsegundos por token en CPU moderna, pero no se puede confirmar.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. Modelos comparables por tamaño serían BitNet b1.58 (1.3B) o modelos ternarios de menor escala, pero no se dispone de datos de rendimiento de este modelo. Se recomienda consultar la documentación de `minima` para posibles referencias.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información sobre sesgos; al derivar de un encoder de Liquid AI, podría heredar sesgos del dataset original, pero no se documenta.
- Riesgo de alucinación: al ser un encoder, el riesgo de alucinación es menor que en modelos generativos, pero si se usa para generación, podría producir texto incoherente.
- Limitaciones de contexto: se desconoce la longitud de contexto máxima; es probable que sea corta (típico de encoders, 512 o 1024 tokens).
- Restricciones de licencia: la licencia `lfm-open-license-v1.0` debe revisarse; aunque es open source, puede tener cláusulas específicas sobre uso comercial o redistribución.
- Caveat de producción: al ser un artefacto empaquetado para una librería específica (`minima`), requiere esa dependencia y no es directamente compatible con frameworks estándar como Transformers o vLLM sin conversión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/minima-100m-g32-geom
- Repositorio de la librería minima: https://github.com/SSHDotCodes/minima
- Modelo base (LiquidAI/LFM2.5-Encoder-350M): https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M/blob/main/LICENSE
