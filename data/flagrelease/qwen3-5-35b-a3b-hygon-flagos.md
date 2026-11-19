# FlagRelease/Qwen3.5-35B-A3B-hygon-FlagOS

## Resumen

Qwen3.5-35B-A3B-hygon-FlagOS es una adaptación del modelo multimodal Qwen3.5-35B-A3B de Alibaba Cloud Qwen, publicada por la comunidad FlagRelease (Zhongzhi FlagOS) para su ejecución sobre aceleradores Hygon. El modelo original es un MoE multimodal con 35 951 822 704 parámetros totales y 3 000 millones de parámetros activos, lo que lo sitúa en la franja de modelos dispersos de gran capacidad pero coste de inferencia contenido. Incorpora soporte nativo de contextos de 262 144 tokens y una arquitectura híbrida que combina Gated Delta Networks con mezcla dispersa de expertos.

La relevancia de esta ficha concreta no reside en el modelo base, sino en el trabajo de portabilidad: FlagOS proporciona una pila de software de sistema (FlagScale, FlagGems, FlagCX, FlagTree y vllm-plugin-fl) que permite ejecutar el mismo modelo sobre silicio Hygon con resultados cercanos a la pila nativa de NVIDIA. El repositorio incluye una imagen Docker preconfigurada y scripts de despliegue con vLLM, lo que reduce el tiempo de puesta en marcha a minutos en hardware DCU de Hygon.

El modelo cubre comprensión visión-lenguaje unificada (imagen y vídeo), razonamiento, generación de código y tareas de agente. La versión Hygon muestra una degradación moderada frente a la pila NVIDIA en los benchmarks publicados, un dato relevante para quien evalúe migrar cargas de trabajo a aceleradores no NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated Delta Networks y Mixture-of-Experts disperso (qwen3_5_moe) |
| Parametros totales | 35 951 822 704 |
| Parametros activos | 3 000 millones (aproximado, según model card) |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de Gated Delta Networks (un tipo de atención lineal con estado recurrente) con capas de mezcla dispersa de expertos. Esta combinación busca mantener la eficiencia computacional en contextos muy largos sin renunciar a la capacidad de representación de un transformer denso. El entrenamiento se realizó con fusión temprana de tokens multimodales, de modo que las modalidades de imagen y vídeo se integran en el mismo espacio de representación que el texto desde las primeras etapas del pipeline, habilitando comprensión visión-lenguaje unificada en lugar de un adaptador visual pospuesto.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificación especulativa. La contribución técnica documentada de esta release es la integración con FlagOS: FlagGems aporta una biblioteca de operadores en Triton neutral respecto al backend, FlagTree un compilador unificado multi-chip, FlagCX una biblioteca de comunicación y FlagScale junto con vllm-plugin-fl cubren el ciclo de vida del despliegue distribuido. El resultado es un flujo "desarrollar una vez, ejecutar en cualquier acelerador" aplicado a hardware Hygon.

## Capacidades

- Generación de texto y razonamiento multi-paso en contextos extensos de hasta 262 144 tokens.
- Comprensión multimodal con fusión temprana: imagen, vídeo y texto en un mismo espacio de representación.
- Generación y razonamiento sobre código, con resultados evaluados en tareas de programación según la model card.
- Tareas de agente y razonamiento encadenado, orientadas a flujos con múltiples llamadas y estado persistente.
- Razonamiento matemático y científico, evaluado mediante GPQA Diamond en los benchmarks publicados.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible el desglose de idiomas.
- Modo thinking explícito: no confirmado en la información disponible.

## Casos de uso

- Análisis de documentos largos y contratos: con 262 144 tokens de contexto, el modelo puede ingerir expedientes completos, manuales técnicos o bases de código extensas en una sola pasada sin chunking, manteniendo coherencia entre secciones distantes.
- Inspección visual automatizada en entornos industriales: la fusión temprana de imagen y texto permite consultas del tipo "describe la anomalía en esta imagen y compárala con el vídeo del turno anterior", útil en control de calidad sobre hardware Hygon ya desplegado.
- Asistentes de código en pipelines internos: el modelo puede integrarse en flujos de revisión de parches o generación de tests sobre repositorios grandes, aprovechando el contexto largo para incluir múltiples ficheros relacionados.
- Agentes de investigación técnica: con razonamiento multi-paso y contexto extendido, encaja en flujos que alternan lectura de fuentes, verificación y síntesis, siempre que se valide el soporte real de tool calling en la implementación desplegada.
- Despliegue en infraestructura Hygon existente: organizaciones con DCU de Hygon y sistema Sugon OS 8.9 pueden ejecutar el modelo mediante la imagen Docker publicada y vLLM con `--tp 4`, evitando la dependencia de GPUs NVIDIA.
- Evaluación comparativa de pilas de software: el repositorio sirve como referencia para medir la brecha de rendimiento entre FlagOS y la pila nativa NVIDIA en un mismo modelo, útil en procesos de decisión de migración de hardware.
- Procesamiento de vídeo con preguntas en lenguaje natural: aplicable a resumen de grabaciones o búsqueda semántica sobre material audiovisual, dado el soporte multimodal nativo.

## Benchmarks y rendimiento

| Métrica | Qwen3.5-35B-A3B NVIDIA (original) | Qwen3.5-35B-A3B NVIDIA (FlagOS) | Qwen3.5-35B-A3B Hygon (FlagOS) |
|---|---|---|---|
| ERQA (visión) | 60 | 56,5 | 55,96 |
| GPQA Diamond | 78,28 | 78,28 | 75,76 |

Los datos provienen de la model card del autor. La pila FlagOS sobre NVIDIA reproduce exactamente GPQA Diamond y cede 3,5 puntos en ERQA; sobre Hygon la caída es de 4,04 puntos en ERQA y 2,52 en GPQA Diamond respecto al original. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 35 951 822 704 parámetros, en FP16 los pesos ocuparían aproximadamente 72 GB, lo que exige al menos dos aceleradores de 48 GB o uno de 80 GB; en cuantizaciones de 8 bits o 4 bits el requisito bajaría, pero no se documentan formatos cuantizados para esta release.
- GPU recomendadas: el despliegue documentado usa `--tp 4` sobre aceleradores Hygon (DCU), con la imagen FlagOS-Hygon y los dispositivos `/dev/kfd`, `/dev/mkfd` y `/dev/dri`. Para la variante NVIDIA no se detallan configuraciones en la información disponible.
- Cabe en GPU de consumo: no disponible. El tamaño de pesos en FP16 y el pipeline multimodal hacen improbable un despliegue en una única GPU de consumo sin cuantización, y no se publican pesos GGUF.
- Opciones de despliegue: vLLM con `vllm serve` y tensor parallelism 4, dentro del contenedor FlagOS-Hygon; descarga de pesos vía ModelScope. Integración con AnythingLLM documentada mediante endpoint compatible con OpenAI en `localhost:8000/v1/chat/completions`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica la variable `VLLM_EXECUTE_MODEL_TIMEOUT_SECONDS=3600`, coherente con tiempos de carga prolongados en configuraciones de cuatro aceleradores.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-35B-A3B-hygon-FlagOS | 35,95 B / ~3 B | 262 144 | no disponible | Hugging Face, imagen Docker Hygon |
| Qwen3.5-35B-A3B (original, NVIDIA) | 35 B / 3 B | 262 144 | no disponible | Hugging Face |
| Qwen3.5 397B MoE | 397 B (activos no disponibles) | no disponible | no disponible | Hugging Face, citado en la model card |

La información disponible solo permite comparar contra el modelo original y contra el Qwen3.5 397B MoE mencionado como predecesor en la misma familia. No se aportan datos de benchmarks ni especificaciones de otras familias comparables (por ejemplo, modelos MoE de tamaño similar de otros proveedores), por lo que la comparativa cruzada queda como no disponible.

## Limitaciones y advertencias

- Degradación medible frente a la pila NVIDIA: entre 2,5 y 4 puntos en los dos benchmarks publicados. Para cargas sensibles a la precisión conviene validar con un conjunto propio antes de migrar.
- Licencia no declarada en el repositorio: no es posible confirmar si el uso comercial está permitido. Es un bloqueante potencial para producción y debe verificarse en el modelo base de Qwen antes de cualquier despliegue.
- Idiomas soportados no documentados: no se puede asumir calidad uniforme en castellano ni en otras lenguas distintas del inglés y el chino sin evaluación propia.
- Riesgo de alucinación: no se publican evaluaciones de factualidad ni tasas de alucinación. Como en cualquier modelo generativo, requiere verificación en dominios críticos.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Soporte de tool calling y modo thinking no confirmados explícitamente en la información disponible; conviene probarlos en la implementación concreta antes de diseñar agentes sobre ellos.
- Dependencia de hardware Hygon para esta release: el despliegue documentado asume DCU, Sugon OS 8.9 y los drivers indicados. En otras plataformas debe usarse la release correspondiente.
- Madurez del ecosistema: 13 descargas y ningún "like" en el momento de la consulta indican una release muy reciente y poco validada por la comunidad.
- Repositorio de 71,9 GB: la descarga y el almacenamiento requieren planificación de infraestructura.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FlagRelease/Qwen3.5-35B-A3B-hygon-FlagOS
- AnythingLLM (cliente de integración): https://anythingllm.com/
- Triton (base de FlagGems): https://github.com/openai/triton
- Repositorio de imágenes FlagOS: harbor.baai.ac.cn/flagrelease-public
- Modelo base Qwen3.5-35B-A3B: no disponible en la información proporcionada
- Paper o blog técnico de Qwen3.5: no disponible en la información proporcionada
- Documentación de FlagOS, FlagScale, FlagGems, FlagCX y FlagTree: no disponible en la información proporcionada
