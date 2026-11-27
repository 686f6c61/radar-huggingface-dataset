# mradermacher/Experiment26Neuralsirkrishna_YamPastiche-GGUF

## Resumen

Experiment26Neuralsirkrishna_YamPastiche-GGUF es la versión cuantizada en formato GGUF del modelo base MaziyarPanahi/Experiment26Neuralsirkrishna_YamPastiche, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de tipo transformer con 7.241.732.096 parámetros totales (aproximadamente 7,2 mil millones), orientado a la generación de texto y empaquetado para su uso con llama.cpp y otras herramientas compatibles con GGUF. El modelo base es un merge (fusión) de modelos previos, según indican las etiquetas del repositorio.

La relevancia de esta ficha radica en que proporciona acceso al modelo en múltiples niveles de cuantización, desde Q2_K (2,8 GB) hasta f16 (14,6 GB), lo que permite desplegarlo en hardware muy diverso, incluidas GPU de consumo. El repositorio tiene 75 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción limitada dentro de la comunidad.

No se dispone de información detallada sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, más allá de lo que indica la model card del cuantizador y las etiquetas del repositorio. El modelo está etiquetado únicamente para inglés y su licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (según etiquetas del repositorio; detalles no disponibles) |
| Parámetros totales | 7.241.732.096 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Las etiquetas del repositorio indican que se trata de un modelo de la familia transformers y que el modelo base es un merge, es decir, una fusión de pesos de otros modelos. No se especifica si la fusión se realizó mediante técnicas como SLERP, TIES, DARE o model stacking, ni qué modelos intervinientes se utilizaron.

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El cuantizador indica que se trata de cuantizaciones estáticas (static quants) y que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación. El repositorio incluye cuantizaciones desde Q2_K hasta f16, generadas con el formato GGUF de llama.cpp.

## Capacidades

- Generación de texto en inglés: el modelo está etiquetado únicamente para el idioma inglés, por lo que su uso en otros idiomas no está garantizado.
- Compatibilidad con text-generation-inference: la etiqueta `text-generation-inference` sugiere que el modelo base puede servirse mediante TGI, aunque la versión GGUF está pensada para llama.cpp y herramientas afines.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el modelo puede desplegarse en infraestructuras de endpoints compatibles.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se dispone de información sobre capacidades matemáticas o de código específicas.

## Casos de uso

- Generación de texto en inglés en entornos con recursos limitados: las cuantizaciones Q2_K (2,8 GB) y Q3_K_S (3,3 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU, lo que lo hace adecuado para prototipos y pruebas de concepto.
- Despliegue en GPU de consumo: las cuantizaciones Q4_K_M (4,5 GB) y Q5_K_M (5,2 GB) caben en GPU con 6-8 GB de VRAM, como una RTX 3060 o RTX 4060, lo que facilita la experimentación local.
- Servicio de generación de texto autoalojado: mediante llama.cpp o servidores compatibles con GGUF, se puede exponer una API de generación de texto en inglés para aplicaciones internas.
- Evaluación de modelos fusionados: al ser un merge, puede utilizarse para comparar el comportamiento de fusiones de pesos frente a modelos base individuales en tareas de generación de texto.
- Integración en pipelines de CI/CD para pruebas de regresión de texto: las cuantizaciones ligeras permiten ejecutar comprobaciones rápidas de calidad de generación en entornos de integración continua.
- Fine-tuning ligero o adaptación con LoRA: aunque el formato GGUF no es el ideal para entrenamiento, el modelo base en safetensors puede servir como punto de partida para adaptaciones en inglés con recursos moderados.
- Investigación sobre cuantización: el repositorio ofrece un espectro amplio de cuantizaciones (desde Q2_K hasta f16) que permite estudiar el impacto de la cuantización en la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~2,8 GB
  - Q3_K_S: ~3,3 GB
  - Q3_K_M: ~3,6 GB
  - Q3_K_L: ~3,9 GB
  - IQ4_XS: ~4,0 GB
  - Q4_K_S: ~4,2 GB
  - Q4_K_M: ~4,5 GB
  - Q5_K_S: ~5,1 GB
  - Q5_K_M: ~5,2 GB
  - Q6_K: ~6,0 GB
  - Q8_0: ~7,8 GB
  - f16: ~14,6 GB
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, las cuantizaciones Q4 y Q5 caben en GPU de consumo como RTX 3060 (12 GB), RTX 4060 Ti (8/16 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB). Las cuantizaciones Q8_0 y f16 requieren GPU profesionales como A100 o H100, o GPU de consumo con 16-24 GB de VRAM.
- Cabe en GPU de consumo: sí, al menos las cuantizaciones hasta Q6_K en GPU con 8 GB o más de VRAM; Q8_0 requiere 8-12 GB y f16 requiere 16 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base es compatible con text-generation-inference según las etiquetas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es un merge del que no se detallan los componentes, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Experiment26Neuralsirkrishna_YamPastiche-GGUF | 7,24 B | No disponible | Apache 2.0 | GGUF |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Al ser un merge de modelos, existe riesgo de que herede sesgos y comportamientos de los modelos intervinientes, que no se detallan en la información disponible.
- Riesgo de alucinación: no se dispone de datos específicos, pero es un riesgo inherente a los modelos de lenguaje de esta escala.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de generación; el cuantizador recomienda Q4_K_S y Q4_K_M como opciones rápidas y Q6_K como muy buena calidad.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de un merge, conviene verificar las licencias de los modelos originales intervinientes, que no se especifican.
- El repositorio tiene muy poca tracción (75 descargas, 0 likes) y no se han publicado benchmarks, por lo que su calidad real es desconocida.
- No hay cuantizaciones ponderadas ni imatrix disponibles, lo que puede limitar la calidad en comparación con otras alternativas cuantizadas del ecosistema.
- El modelo fue creado en diciembre de 2024 y actualizado en noviembre de 2026; la información sobre su mantenimiento es limitada.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Experiment26Neuralsirkrishna_YamPastiche-GGUF
- Modelo base: https://huggingface.co/MaziyarPanahi/Experiment26Neuralsirkrishna_YamPastiche
- Página de overview del cuantizador: https://hf.tst.eu/model#Experiment26Neuralsirkrishna_YamPastiche-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Empresa del cuantizador: https://www.nethype.de/
