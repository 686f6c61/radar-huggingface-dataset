# darwinagent/WIA-35B-A3B

## Resumen

WIA-35B-A3B es un modelo de lenguaje publicado en HuggingFace por el usuario `darwinagent` el 24 de octubre de 2026. Por la nomenclatura del identificador y la etiqueta de arquitectura declarada (`qwen3_5_moe_text`), se trata de un transformer con mezcla de expertos (MoE) de aproximadamente 35 000 millones de parámetros totales y alrededor de 3000 millones activos por token, presumiblemente derivado de la familia Qwen 3.5. El repositorio ocupa 36,7 GB y contiene únicamente pesos en formato `safetensors`.

El interés de un modelo con esta relación parámetros totales/activos es económico: ofrece la capacidad de representación de una red de 35B con el coste computacional de inferencia de una red de ~3B por token, lo que abarata el despliegue en GPUs de gama alta profesional. Sin embargo, en el momento de redactar esta ficha el repositorio no incluye model card con especificaciones, licencia, idiomas ni resultados de evaluación: cuenta con 0 descargas y 1 "like", y no se ha publicado ninguna cuantización GGUF ni documentación adicional.

Por tanto, esta ficha documenta de forma rigurosa lo que sí está confirmado por los metadatos de HuggingFace, explicita qué datos faltan y ofrece estimaciones de ingeniería —claramente marcadas como tales— sobre requisitos de hardware derivadas del recuento de parámetros. Cualquier uso en producción debería ir precedido de una evaluación propia del modelo y de una verificación legal de la licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; etiqueta de HuggingFace `qwen3_5_moe_text`. Detalle de capas, número de expertos y mecanismo de atención: no disponible |
| Parámetros totales | ~35B (deducido del identificador `35B`; no confirmado en documentación del autor) |
| Parámetros activos | ~3B por token (deducido del sufijo `A3B`; no confirmado en documentación del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo contiene `safetensors`; no se ha publicado GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | `safetensors` (repositorio de 36,7 GB) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |
| Fecha de creación y última actualización | 2026-10-24 (creado) / 2026-10-24 (actualizado) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `qwen3_5_moe_text`, que sitúa el modelo en la estirpe Qwen 3.5 con arquitectura de mezcla de expertos y ámbito exclusivamente textual (sin torre de visión ni audio). El identificador sugiere un total de ~35B parámetros con ~3B activos por token, patrón habitual en los MoE de tipo *fine-grained* donde un router selecciona un subconjunto reducido de expertos por capa. El tamaño del repositorio (36,7 GB) es compatible con pesos en precisión de 8 bits para ~35B parámetros; no obstante, no se ha confirmado el dtype real de los tensores.

No hay información publicada sobre volumen de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO, método de alineación, ni sobre innovaciones técnicas concretas (atención lineal, decodificación especulativa, estrategias de enrutamiento). Tampoco se documenta si se trata de un modelo base preentrenado desde cero, de un *fine-tune* sobre un Qwen 3.5 MoE existente o de una fusión de pesos. Todos estos extremos deben considerarse **no disponibles** y verificarse directamente inspeccionando el `config.json` y los tensores del repositorio.

## Capacidades

- Generación de texto: es la única capacidad directamente inferible de la etiqueta `qwen3_5_moe_text` (modelo textual). El resto de capacidades no está documentado.
- Razonamiento y matemáticas: no disponible; no hay model card ni evaluaciones publicadas.
- Generación de código: no disponible; no se documenta entrenamiento específico en código.
- Tool calling / function calling: no disponible; no se declara plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara lista de idiomas.
- Capacidad especial (modo *thinking*, visión, audio): no disponible; la etiqueta `text` descarta, en principio, visión y audio.
- Cuantizaciones comunitarias listas para usar: no disponibles.

## Casos de uso

Los siguientes escenarios son técnicamente plausibles para un MoE de ~35B totales y ~3B activos, pero **deben validarse empíricamente** antes de cualquier despliegue, dado que no existen evaluaciones publicadas del modelo:

- Procesamiento por lotes de documentación técnica a gran escala: la ratio 35B/3B activos permite ejecutar la generación con un coste por token próximo al de un modelo de 3B, lo que abarata tareas de resumen, extracción de entidades y normalización sobre corpus masivos, siempre que el contexto soportado sea suficiente (dato no disponible).
- Asistente de código autoalojado: si el modelo conserva las capacidades de la familia Qwen 3.5 en las que se basa, podría emplearse en autocompletado y refactorización dentro de un entorno con requisitos de soberanía del dato; requiere verificar HumanEval/MBPP de forma interna.
- Generación aumentada por recuperación (RAG) sobre base documental interna: el despliegue self-hosted evita enviar datos a terceros; es necesario medir la tasa de alucinación y el comportamiento con contextos largos antes de producción.
- Backend de chat para atención al cliente: el coste de inferencia de un MoE de 3B activos hace viable mantener varias réplicas concurrentes; no obstante, la ausencia de licencia declarada impide el uso comercial con seguridad jurídica.
- Fine-tune específico de dominio: al ser un MoE de 35B con 3B activos, el ajuste mediante LoRA es asequible en una GPU de 48-80 GB; sería el punto de partida razonable para dominios especializados (legal, sanitario, industrial).
- Evaluación comparativa interna y *red teaming*: sirve como candidato en procesos de selección de modelo, con la ventaja de que su coste de inferencia permite generar grandes volúmenes de respuestas para anotación automática y análisis de sesgos.
- Servicio de traducción o generación multilingüe: solo si se confirma cobertura de idiomas, extremo no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio no incluye model card, tabla de evaluación ni comparación con modelos de referencia. No se dispone de datos de MMLU, HumanEval, GSM8K, MMLU-Pro, AIME, LiveCodeBench ni de evaluaciones multilingües para este modelo concreto. Cualquier cifra que se atribuya a `darwinagent/WIA-35B-A3B` sin una evaluación propia debe considerarse no verificada.

## Requisitos de hardware

Las cifras siguientes son **estimaciones de ingeniería** calculadas a partir del recuento de parámetros (~35B totales, ~3B activos) y del tamaño del repositorio; no proceden de documentación del autor:

- VRAM para pesos en BF16/FP16: ~70 GB solo para pesos, más caché KV. Requiere GPU de 80 GB (A100 80GB, H100 80GB) o reparto en 2×48 GB con tensor parallelism.
- VRAM para pesos en FP8: ~35 GB; encaja en L40S 48 GB, RTX 6000 Ada 48 GB o A100 40 GB con margen ajustado para caché KV.
- VRAM para una hipotética cuantización GGUF Q4_K_M: ~18-20 GB; cabría en RTX 4090 / 3090 (24 GB) y quedaría al límite en GPUs de 16 GB, requiriendo *offload* parcial a CPU. **No existe GGUF publicado**, por lo que habría que generarlo a partir de los `safetensors`.
- GPU recomendadas: H100 80GB o A100 80GB para servicio en BF16; L40S o RTX 6000 Ada para FP8; RTX 4090 para prototipado si se generan cuantizaciones de 4 bits.
- Cabe en GPU de consumo: previsiblemente sí, en RTX 4090/3090 (24 GB) tras cuantización a 4 bits; en 16 GB (RTX 4080, 4060 Ti) solo con cuantizaciones de 3-4 bits y *offload* parcial.
- Opciones de despliegue: vLLM y TGI son las vías naturales para `safetensors` con arquitectura tipo Qwen MoE; llama.cpp/Ollama requerirían convertir previamente los pesos a GGUF. Compatibilidad exacta con cada motor: no verificada.
- Latencia y throughput: no disponibles. Como referencia teórica, con ~3B parámetros activos el coste de cómputo por token se aproxima al de un modelo denso de 3B, aunque el tráfico de memoria vendrá condicionado por el número de expertos realmente cargados y por el batch.

## Comparativa con modelos similares

Los datos de los modelos alternativos son de referencia pública y pueden variar según la versión consultada. Los del modelo objeto de esta ficha son, en varios campos, no disponibles.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| darwinagent/WIA-35B-A3B | ~35B (según identificador) | ~3B (según identificador) | no disponible | no disponible | safetensors, 36,7 GB; 0 descargas |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K nativo, ampliable con YaRN | Apache 2.0 | safetensors y GGUF; ampliamente desplegado |
| Mixtral-8x7B-v0.1 | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors y GGUF; ecosistema maduro |
| gpt-oss-20b | ~21B | ~3,6B | 128K (referencia pública) | Apache 2.0 | safetensors y quantizaciones; soporte en vLLM/Ollama |

Frente a estas alternativas, la ventaja potencial de WIA-35B-A3B es su ratio de activación (~3B de 35B), pero carece de los elementos que hacen desplegables a los modelos citados: licencia explícita, model card, cuantizaciones publicadas y evaluaciones verificables. No se dispone de datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no existe autorización clara para uso comercial, redistribución ni modificación. Es un bloqueante legal para producción.
- **Ausencia total de documentación**: no hay model card, ficha de entrenamiento ni descripción de datos. Se desconoce el origen exacto de los pesos y si derivan de un modelo con licencia compatible.
- **Sin evaluaciones publicadas**: no hay benchmarks, por lo que el rendimiento real, la tasa de alucinación y la calidad multilingüe son desconocidos.
- **Riesgo de sesgos no evaluado**: al no documentarse la composición del corpus ni el proceso de alineación, no puede descartarse la presencia de sesgos de género, raza, religión o nacionalidad, ni evaluarse su magnitud.
- **Riesgo de alucinación**: inherente a los modelos generativos y no cuantificado para este modelo; en tareas factuales críticas requiere verificación externa y RAG con control de citas.
- **Limitaciones de contexto e idioma**: la longitud de contexto y la lista de idiomas no están disponibles; asumir 32K o cobertura multilingüe sin verificarlo puede provocar fallos silenciosos en producción.
- **Ecosistema inmaduro**: sin GGUF ni cuantizaciones de la comunidad, el despliegue exige conversión manual y validación del `config.json` para confirmar que los motores de inferencia reconocen la arquitectura.
- **Trazabilidad y procedencia**: 0 descargas y 1 "like" indican ausencia de validación por parte de la comunidad; el nombre del autor y del modelo no remiten a un proyecto conocido. Conviene auditar los pesos antes de ejecutarlos en entornos sensibles.
- **Reproducibilidad**: sin ficha técnica ni semilla documentada, los resultados no son reproducibles por terceros.

## Enlaces

- HuggingFace: https://huggingface.co/darwinagent/WIA-35B-A3B
- No se han encontrado otros enlaces (paper, blog, repositorio de código, demo) en la información disponible.
