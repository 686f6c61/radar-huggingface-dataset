# QrusherZA/Ternary-Bonsai-2.5-27B-Uncensored-Ninfer

## Resumen

QrusherZA/Ternary-Bonsai-2.5-27B-Uncensored-Ninfer es un artefacto de inferencia empaquetado en formato NInfer V3 (`.ninfer`) que reúne en un único contenedor los pesos de texto ternarios del modelo Ternary Bonsai 2.5 27B Uncensored, la cabeza de predicción multi-token (MTP) del modelo original y la torre de visión procedente del mmproj BF16 oficial. No es un modelo entrenado desde cero ni un finetune nuevo: es una conversión comunitaria realizada por QrusherZA a partir del GGUF publicado por kelsey1337, que a su vez hereda las modificaciones de pesos de AtomicChat sobre el modelo Ternary Bonsai 2.5 de PrismML, derivado de la arquitectura Qwen3.8-27B con atención híbrida.

El interés del artefacto reside en su empaquetado: conserva el almacenamiento nativo `gguf_ptq1_0` (ternario) en lugar de descomprimir y recuantizar, integra visión y MTP en un solo fichero de 6,6 GB y está pensado para ejecutarse en GPUs de consumo. El autor reporta pruebas iniciales en una NVIDIA GeForce RTX 3080 de 12 GB (Ampere, SM86) bajo Windows, con un contexto sugerido de 32K tokens y posibilidad de intentar 64K según la memoria disponible.

Se trata de un modelo sin censura ("uncensored"), con soporte de entrada de imagen y texto (pipeline `image-text-to-text`), licencia Apache 2.0 y un ecosistema de ejecución muy específico: requiere el runtime NInfer con soporte explícito de `gguf_ptq1_0`. La información pública disponible es escasa (0 descargas, 0 likes en el momento de la consulta) y no se han publicado resultados de benchmarks ni una auditoría independiente del inventario de tensores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención, basado en Qwen3.8-27B (según model card) |
| Parámetros totales | 27B (nominal, según nombre del modelo); no disponible el desglose exacto |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens sugeridos; 65.536 intentable según memoria (configuración de servidor, no límite arquitectónico confirmado) |
| Tipos de cuantización | Pesos de texto ternarios nativos `gguf_ptq1_0`; visión en BF16 (mmproj); KV cache con dtype `rk4v4` en la configuración sugerida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor NInfer V3 (`.ninfer`); fuente GGUF (`gguf_ptq1_0`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B con atención híbrida, según declara la model card. Sobre esa base, PrismML produjo Ternary Bonsai 2.5 27B, un modelo con pesos ternarios; AtomicChat modificó los pesos en cuantización PTQ1_0 y kelsey1337 publicó el GGUF con la cabeza MTP original. La conversión de QrusherZA emplea la receta `bonsai2_27b_ternary` del conversor WaveCut NInfer V3, manteniendo el almacenamiento PTQ1_0 nativo en lugar de descomprimir y recuantizar el modelo de texto. La torre de visión se importa del mmproj BF16 oficial y la componente MTP procede de la cabeza integrada en la fuente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo RLHF, DPO u otras etapas de alineación en el modelo original. Tampoco se detalla el mecanismo exacto de atención híbrida más allá de la referencia a Qwen3.8-27B. La innovación técnica destacable del artefacto es el empaquetado: un único fichero que combina pesos ternarios, MTP para decodificación especulativa (3 tokens de draft en la configuración sugerida) y visión con residencia en modo overlay y hasta 1024 tokens fusionados. El autor advierte que el inventario exacto de tensores y la preservación byte a byte no han sido auditados de forma independiente.

## Capacidades

- Generación de texto y razonamiento, con un modo de razonamiento configurable (`--default-reasoning-effort xhigh` en el ejemplo de arranque).
- Entrada de imagen junto con texto (pipeline `image-text-to-text`), gracias a la torre de visión integrada.
- Decodificación especulativa mediante MTP, con cabeza de draft integrada y 3 tokens de draft sugeridos.
- Modelo sin censura: los pesos upstream incorporan modificaciones orientadas a eliminar rechazos.
- Conversación multi-turno con contexto de hasta 32K tokens en la configuración recomendada para 12 GB de VRAM.
- Servido mediante API compatible con OpenAI (`/v1/models`), lo que habilita integración con Open WebUI.
- Integración con ComfyUI a través del nodo ComfyUI-Ninferencing.
- Tool calling nativo y compatibilidad con Claude Code: no validados de forma independiente para este artefacto concreto, según el autor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente local de conversación multi-turno: con 32K tokens de contexto y KV cache en `rk4v4`, el modelo puede mantener sesiones largas en una RTX 3080 de 12 GB, lo que lo hace adecuado para un asistente personal ejecutado íntegramente en local sin depender de APIs externas.
- Análisis de imágenes con descripción textual: la torre de visión integrada permite enviar capturas, diagramas o fotografías junto a una pregunta y obtener una respuesta textual, útil para herramientas de accesibilidad o catalogación de imágenes.
- Generación de texto sin filtros editoriales: al tratarse de un modelo uncensored, encaja en tareas de escritura creativa, guiones o ficción donde los modelos alineados rechazan contenido, siempre con revisión humana y cumplimiento legal.
- Prototipado de agentes con razonamiento multi-paso: el modo de razonamiento configurable y la decodificación especulativa MTP permiten cadenas de razonamiento más largas con menor latencia relativa, adecuadas para experimentación con agentes locales.
- Flujos de trabajo en ComfyUI: mediante ComfyUI-Ninferencing, el modelo puede insertarse en pipelines gráficos de generación y análisis de imagen, por ejemplo para describir o etiquetar imágenes antes de pasarlas a otro nodo.
- Despliegue de bajo coste en hardware de consumo: el contenedor de 6,6 GB con pesos ternarios permite servir un modelo de 27B nominales en una GPU de 12 GB, un escenario antes reservado a GPUs de datacenter o a modelos mucho más pequeños.
- Evaluación comparativa de cuantización ternaria: investigadores interesados en el impacto de PTQ1_0 sobre calidad pueden usar este artefacto como referencia práctica frente a versiones BF16 o de mayor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el autor no reporta cifras de latencia o throughput más allá de indicar pruebas en una RTX 3080 de 12 GB.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 6,6 GB en disco; con pesos ternarios y KV cache `rk4v4` a 32K, el autor lo ejecuta en 12 GB de VRAM. A 64K de contexto la memoria necesaria aumenta y queda sujeta a la VRAM disponible.
- GPU probada: NVIDIA GeForce RTX 3080 12 GB (Ampere, SM86) bajo Windows.
- GPU recomendadas: no disponibles de forma explícita; el requisito es una GPU con soporte de `gguf_ptq1_0` en el runtime NInfer. Las GPUs Ampere o posteriores son el objetivo razonable dado el hardware de prueba.
- ¿Cabe en GPU de consumo? Sí, según la prueba del autor en una RTX 3080 de 12 GB.
- Opciones de despliegue: runtime NInfer (`ninfer-serve.exe`) con soporte de `gguf_ptq1_0`; API compatible con OpenAI en el puerto 8080; integración con Open WebUI y ComfyUI-Ninferencing. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI para este contenedor.
- Latencia y throughput: no disponibles. La configuración sugerida usa `--prefill-chunk 512`, `--max-concurrency 1` y decodificación especulativa con `--draft-tokens 3`, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| QrusherZA/Ternary-Bonsai-2.5-27B-Uncensored-Ninfer | 27B (nominal) | 32K sugerido, 64K intentable | NInfer V3 (`.ninfer`), pesos ternarios PTQ1_0 | Apache 2.0 | Conversión comunitaria con visión y MTP; requiere runtime NInfer |
| kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF | 27B (nominal) | no disponible | GGUF | no disponible en la información | Modelo base directo de esta conversión; sin visión empaquetada según la información disponible |
| prism-ml/Ternary-Bonsai-2.5-27B-GGUF | 27B (nominal) | no disponible | GGUF | no disponible en la información | Fuente oficial de Ternary Bonsai 2.5 de PrismML; de aquí procede el mmproj BF16 |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors (previsiblemente) | no disponible en la información | Arquitectura base original de Qwen Team |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo uncensored: los pesos upstream incorporan modificaciones para eliminar rechazos, lo que aumenta el riesgo de generar contenido dañino, ilegal o inexacto. Requiere revisión humana y controles de uso en producción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser una conversión de pesos ternarios sin benchmarks, la calidad real es desconocida.
- Cuantización ternaria: PTQ1_0 reduce drásticamente la precisión de los pesos; no hay datos públicos que cuantifiquen la degradación frente al BF16 original.
- Ecosistema de ejecución restringido: solo funciona con el runtime NInfer que soporte explícitamente `gguf_ptq1_0`; versiones antiguas pueden abrir el contenedor pero fallar en la planificación de ejecución. No hay soporte documentado para vLLM, llama.cpp u Ollama.
- Falta de auditoría: el autor reconoce que el inventario de tensores y la preservación byte a byte no han sido auditados de forma independiente.
- Tool calling y compatibilidad con Claude Code no validados para este artefacto concreto.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Contexto: los 32K/64K son ajustes de servidor sugeridos, no un límite arquitectónico confirmado; a 64K la viabilidad depende de la VRAM.
- Exposición de red: el ejemplo permite enlazar a `0.0.0.0`; el autor advierte de no exponer una API de inferencia sin autenticación.
- Licencia Apache 2.0 declarada, pero las obligaciones de atribución de los pesos upstream y de la arquitectura Qwen3.8-27B deben verificarse antes de uso comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto recién publicado y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QrusherZA/Ternary-Bonsai-2.5-27B-Uncensored-Ninfer
- Modelo base (GGUF): https://huggingface.co/kelsey1337/Ternary-Bonsai-2.5-27B-Uncensored-MTP-GGUF
- Fuente del mmproj BF16: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
- Repositorio de configuración y tokenizador: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime NInfer (releases): https://github.com/iamwavecut/ninfer-all/releases
- Repositorio NInfer: https://github.com/iamwavecut/ninfer-all
- Documentación de conversión de pesos: https://github.com/iamwavecut/ninfer-all/blob/master/docs/weight-conversion.md
- Open WebUI: https://github.com/open-webui/open-webui
- ComfyUI-Ninferencing: https://github.com/cicalooo/ComfyUI-Ninferencing
