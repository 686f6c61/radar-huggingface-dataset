# sabi123456/MosaiChunk-H3-Conditioning

# MosaiChunk H3 Conditioning

## Resumen

**MosaiChunk H3 Conditioning** es un artefacto de acondicionamiento para ComfyUI desarrollado por el usuario sabi123456, distribuido como un fichero safetensors de 174,6 MB (174.613.456 bytes, 103 tensores). No es un modelo de vídeo independiente ni un LoRA ordinario: contiene pesos convertidos para el nodo MosaiChunk H3 Conditioning, que permiten reutilizar un checkpoint MiniMax H3 podado y cuantizado compatible sin repetir una conversión en streaming de aproximadamente 26,14 GB.

El artefacto se apoya en `MiniMaxAI/MiniMax-H3` y en el adaptador de streaming `mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA`, además del router MosaiChunk T2V. Su función es integrar la receta de consistencia de chunks de RAVEN y la memoria de MosaiChunk en flujos de muestreo existentes, con soporte previsto para FL2VA INT8 y, de forma experimental, REF2VA/all-in-one.

Es relevante para equipos que ya trabajan con H3 podado en ComfyUI y quieren evitar reconversiones costosas, pero su alcance es limitado: no hay benchmarks de calidad, VRAM o velocidad, la transferencia REF2VA no está entrenada para calidad o identidad y la licencia impone restricciones no comerciales y territoriales. La model card lo describe como experimental y no afiliado a los autores originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Artefacto de acondicionamiento para MiniMax H3; no es un modelo generativo independiente. No se detalla la arquitectura interna del generador H3. |
| Parámetros totales | No disponible. El fichero contiene 103 tensores y 174.613.456 bytes. |
| Longitud de contexto | No aplica / no disponible para este artefacto. |
| Tipos de cuantización | Checkpoints H3 podados y cuantizados en INT8 (FL2VA y REF2VA/all-in-one experimentales); el fichero se distribuye en safetensors. |
| Idiomas soportados | Inglés (en) según la model card; el artefacto no procesa lenguaje de forma autónoma. |
| Licencia | `minimax-h3-and-raven-upstream-terms`: incluye términos de MiniMax H3 y RAVEN CC BY-NC 4.0 (no comercial). |
| Formato de pesos | safetensors (`raven-fl2va-conditioning.safetensors`). |
| Tamaño del repositorio | 0,2 GB |
| SHA256 del conditioning | `44b8ad251538a6d74fcbc6cc5930016e842b6cd4499b5df7c69927f34cfefb46` |
| Modelos base | `MiniMaxAI/MiniMax-H3`; `mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA` |
| Dependencias obligatorias | Nodo Minimax-H3-Memory-Cutom-Node, adaptador RAVEN streaming, router MosaiChunk T2V, checkpoint H3 podado, text encoder H3 y VAEs de vídeo/audio |
| Descargas/likes | 0 / 0 en la información consultada |

## Arquitectura y entrenamiento

El artefacto no entrena un transformer nuevo. La conversión evalúa la curva temporal adaptada, pliega actualizaciones de timestep/modulación en coordenadas podadas de rango ocho y preserva byte a byte la tabla base original de 1025×8. El fichero contiene esa tabla temporal y pesos/biases de 51 proyecciones de modulación; el informe compara las proyecciones convertidas en timesteps de prueba contra BF16 RAVEN, con diferencias L2 relativas de aproximadamente 0,0017–0,0020, incluyendo redondeo BF16. Es una comprobación numérica de conversión, no una validación de calidad de vídeo.

No se dispone de número de tokens, composición del dataset, RLHF/DPO ni detalles de entrenamiento del generador H3; el adaptador RAVEN se usa como base y la transferencia a REF2VA es experimental, sin reentrenamiento. La memoria de historial no está incluida en el fichero: se crea en cada generación y se libera después.

## Capacidades

- Acondicionamiento para generación de vídeo con MiniMax H3 podado/INT8 en ComfyUI; no es un generador autónomo.
- Reutilización de una conversión RAVEN ya calculada: evita repetir aproximadamente 26,14 GB de conversión en streaming.
- Memoria text-to-video y memoria experimental first/last-frame/reference implementadas por el nodo acompañante.
- Compatibilidad con checkpoints pruned curve-form FL2VA INT8 y REF2VA/all-in-one experimentales; el checkpoint objetivo durante el desarrollo es `Minimax-h3_Singularity_ref2va_Pruned_v1.3_int8.safetensors`.
- Integración en flujos de muestreo existentes: usa seed/ruido y número de pasos; sustituye el solver numérico y la rejilla sigma. Configuración indicada: `generation_mode=auto`, `conditioning_base_unet=auto`, 4 pasos y CFG 1.
- Requiere el adaptador RAVEN streaming obligatorio y el router MosaiChunk T2V; no debe aplicarse RAVEN dos veces mediante un cargador LoRA normal.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un LLM.

## Casos de uso

- Reutilización de una conversión costosa en un taller de ComfyUI: un equipo que ya dispone de un checkpoint H3 podado/INT8 instala este conditioning de 174,6 MB y evita repetir la conversión en streaming de aproximadamente 26,14 GB; es adecuado para iterar sobre el mismo checkpoint sin rehacer ese paso.
- Pruebas de memoria en text-to-video: el nodo añade memoria de chunks y consistencia RAVEN a un flujo de muestreo existente con 4 pasos y CFG 1; sirve para experimentar con continuidad en vídeo generado, aunque no haya benchmark de calidad.
- Prototipado de first/last-frame (FL2VA): permite probar transiciones entre primer y último fotograma en checkpoints FL2VA podados; es útil para storyboards y pruebas de endpoints, con la advertencia de que la precisión de endpoints no está establecida.
- Investigación de transferencia a referencia (REF2VA): el soporte REF2VA/all-in-one reutiliza un router/adaptador entrenado para T2V sin reentrenamiento; encaja en experimentos sobre transferencia de adaptadores, no en producción con identidad garantizada.
- Auditoría de conversión y reproducibilidad: los informes, `PROVENANCE.json`, `SHA256SUMS` y las mediciones L2 permiten a ingenieros de ML verificar la conversión de proyecciones y comparar coordenadas; es un caso de uso técnico, no de generación final.
- Integración en pipelines ComfyUI existentes: mantiene el UNET loader y otros LoRAs en la cadena MODEL y usa el nodo de conditioning para incorporar RAVEN; es adecuado para equipos que ya tienen el stack H3 y quieren añadir memoria sin cambiar de runtime.
- Evaluación de compatibilidad de checkpoints podados: sirve para comprobar si un checkpoint curve-form INT8 concreto, como el objetivo de desarrollo, funciona con el conditioning y el router; es útil antes de fijar una versión en un experimento.
- Demostración técnica de la diferencia entre conditioning, LoRA y router: al no ser standalone, permite explicar en talleres cómo se compone un pipeline H3 con adaptadores y memoria; no debe presentarse como modelo listo para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Comprobación | Resultado | Interpretación |
|---|---|---|
| Diferencia L2 relativa frente a BF16 RAVEN en timesteps de prueba | ≈0,0017–0,0020, incluye redondeo BF16 | Validación numérica de la conversión; no mide calidad de vídeo |
| Tamaño del conditioning | 174.613.456 bytes; 103 tensores | Tabla temporal de 1025×8 y 51 proyecciones de modulación |
| Conversión en streaming evitada | ≈26,14 GB | Ahorro de una conversión única, no de memoria en ejecución |
| Benchmark de VRAM, velocidad o calidad | No disponible | La model card no presenta un benchmark GPU completado |

## Requisitos de hardware

- VRAM del fichero: 174,6 MB en disco; la VRAM necesaria para cargarlo no se especifica.
- VRAM total: no disponible. Requiere además checkpoint H3 podado INT8, text encoder, VAEs de vídeo/audio, workspace de atención y banco de historial; no se establece pico de memoria.
- GPU recomendadas: no disponibles. No se indican A100, H100, RTX 4090 ni modelos de consumo; se necesita una GPU capaz de ejecutar el checkpoint H3 podado en ComfyUI.
- GPU de consumo: no confirmado; no hay datos de que quepa en una GPU consumer.
- Despliegue: ComfyUI con el nodo personalizado Minimax-H3-Memory-Cutom-Node; vLLM, llama.cpp, Ollama y TGI no se documentan o no aplican a este artefacto.
- Latencia y throughput: no disponibles; la model card no presenta benchmark de velocidad.
- Almacenamiento: se requiere espacio para checkpoints, VAEs y router; SSD y compatibilidad Spectrum/Sage son trabajo separado del nodo, no incluido.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamaño/parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| MosaiChunk H3 Conditioning (este) | Pesos de acondicionamiento para ComfyUI | 174,6 MB; 103 tensores | No aplica | MiniMax H3 + RAVEN CC BY-NC 4.0 | No standalone; requiere nodo, RAVEN, router y checkpoint H3 |
| MiniMaxAI/MiniMax-H3 | Modelo base de vídeo | No disponible | No disponible | Términos upstream de MiniMax H3 (no detallados) | Generador H3; el BF16 completo no es necesario para este fichero |
| mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA | Adaptador de streaming (LoRA) | No disponible | No disponible | CC BY-NC 4.0 (no comercial) | Obligatorio para este conditioning; no standalone |
| mosaichunk/MosaiChunk (router T2V) | Router de memoria | No disponible | No disponible | No disponible | Proporciona `model.safetensors` y `config.json`; no standalone |

No se dispone de parámetros, contexto ni benchmarks de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: descargar solo este fichero no habilita memoria en un sampler ordinario.
- Dependencias estrictas: requiere el nodo personalizado, el adaptador RAVEN streaming, el router MosaiChunk T2V, un checkpoint H3 podado, el text encoder H3 y los VAEs de vídeo/audio.
- Soporte REF2VA experimental: la transferencia reutiliza un router/adaptador entrenado para T2V sin reentrenamiento; no hay garantías de calidad de vídeo, consistencia de identidad ni precisión de endpoints.
- No hay datos de pico de VRAM, velocidad de generación ni benchmark GPU completado; no debe asumirse un rendimiento concreto en producción.
- La licencia RAVEN es CC BY-NC 4.0 y los términos de MiniMax H3 incluyen restricciones territoriales y de uso aceptable; el alojamiento público no concede uso comercial ni mundial sin restricciones.
- Idioma declarado: inglés (en). No se documentan capacidades multilingües.
- Compatibilidad estrecha: pensado para checkpoints H3 podados curve-form INT8 FL2VA y REF2VA/all-in-one experimentales; el funcionamiento con otros finetunes no está garantizado.
- La comprobación L2 de 0,0017–0,0020 es una validación numérica de conversión, no una validación de calidad visual.
- El banco de historial se crea en cada generación y se libera después; los pesos, VAEs, workspace de atención e historial requieren memoria adicional.
- En el flujo indicado deben usarse 4 pasos, CFG 1, `generation_mode=auto` y `conditioning_base_unet=auto`; no debe aplicarse el adaptador RAVEN una segunda vez mediante un cargador LoRA normal.
- No se documentan sesgos específicos; cualquier sesgo procedería del checkpoint H3 y del adaptador RAVEN subyacentes, no evaluados en esta ficha.
- No aplica el riesgo de alucinación textual típico de un LLM; el riesgo relevante es deriva visual, inconsistencia temporal o de identidad, no medida.
- Es un artefacto no oficial y modificado; no implica afiliación ni respaldo de MiniMax, los autores de RAVEN, MosaiChunk, Comfy-Org o YanzuoLu.
- 0 descargas y 0 likes en la información consultada no permiten inferir calidad ni madurez.

## Enlaces

- [HuggingFace: sabi123456/MosaiChunk-H3-Conditioning](https://huggingface.co/sabi123456/MosaiChunk-H3-Conditioning)
- [Repositorio del nodo personalizado Minimax-H3-Memory-Cutom-Node](https://github.com/sabi3293043/Minimax-H3-Memory-Cutom-Node)
- [Instrucciones para modelos podados (PRUNED.md)](https://github.com/sabi3293043/Minimax-H3-Memory-Cutom-Node/blob/main/PRUNED.md)
- [Adaptador RAVEN streaming en HuggingFace](https://huggingface.co/mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA/tree/90f30b11639e73ce0e3f2ab6ed70d1a133a66caf)
- [Modelo base MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Modelo mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA](https://huggingface.co/mvp-lab/MiniMax-H3-RAVEN-Streaming-LoRA)
- [Router MosaiChunk T2V](https://huggingface.co/mosaichunk/MosaiChunk/tree/03eb1531e2363cbee4fe27d773c4242a07eb1b32/t2v)
- [Modelo mosaichunk/MosaiChunk](https://huggingface.co/mosaichunk/MosaiChunk)
- [Ficheros del repositorio, incluidos LICENSE.md, NOTICE, PROVENANCE.json y SHA256SUMS](https://huggingface.co/sabi123456/MosaiChunk-H3-Conditioning/tree/main)
- No se proporcionan papers, blogs ni demos adicionales en la información disponible.
