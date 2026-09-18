# Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer

## Resumen

Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer es un derivado multimodal de 27,78 mil millones de parámetros publicado por el usuario Dragoy sobre el checkpoint ukisai/Swift-Qwen3.8-27b. El modelo ha sido "abliterado" (eliminación de la dirección de rechazo) siguiendo el estilo de huihui-ai sobre las capas 17 a 51, y posteriormente cuantizado a NVFP4 para las proyecciones MLP y FP8 para atención, módulos GDN y lm_head, con una receta de asignación copiada literalmente de unsloth/Qwen3.8-27B-NVFP4 y 32 muestras de calibración.

El resultado no se distribuye en safetensors ni GGUF, sino como un contenedor de artefacto propio del motor NInfer (rev. a140e7ae82a1), compilado para arquitecturas Blackwell sm_120a y CUDA 13.1 o superior. El artefacto ocupa 21.492.938.224 bytes (unos 20,0 GiB) y, según el autor, permite ejecutar el modelo completo en una sola tarjeta Blackwell con aproximadamente 20 GB de memoria. Incluye la torre de visión completa y la cabeza MTP (multi-token prediction) para decodificación especulativa.

Su relevancia es doble: por un lado, es un ejemplo reproducible de cadena completa "base → abliteración → cuantización NVFP4 → empaquetado para motor de inferencia", con manifiesto, checksums y registro de procedencia; por otro, es un modelo sin filtros de rechazo, con un 0,0 % de rechazos medidos sobre 20 peticiones de AdvBench, lo que lo sitúa en el terreno de la investigación en seguridad, red teaming e interpretabilidad más que en el de producto comercial convencional. La información pública es escasa: 18 descargas y 2 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión, cabeza MTP y módulos GDN (se cuantizan aparte atención, GDN y lm_head; el detalle de la arquitectura interna no se documenta en la información disponible) |
| Parametros totales | 27,78 mil millones (27,78B) |
| Parametros activos | No disponible; la información no indica que sea un modelo MoE |
| Longitud de contexto | No disponible como máximo nominal; los ejemplos oficiales de la CLI usan --max-context 16384 |
| Tipos de cuantizacion | NVFP4 en las proyecciones MLP (gate/up/down) y FP8 en atención, GDN y lm_head; 32 muestras de calibración; asignación copiada de unsloth/Qwen3.8-27B-NVFP4 |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (declarada como license: other); texto en el fichero LICENSE del repositorio |
| Formato de pesos | Contenedor de artefacto NInfer (.ninfer, versión de contenedor v3, cabecera NINFER\x00\x03); no safetensors ni GGUF |
| Tamaño del artefacto | 21.492.938.224 bytes (≈20,0 GiB), 1124 objetos, con manifiesto y checksums |
| Tamaño del repositorio | 43,0 GB (el doble del artefacto; la información disponible no explica la diferencia) |
| Modalidad | Texto e imagen (pipeline image-text-to-text) |
| Motor de inferencia | Neroued/ninfer rev. a140e7ae82a1 y superior; CUDA ≥ 13.1; build sm_120a |
| GPU objetivo | Blackwell sm_120a, aproximadamente 20 GB de VRAM |
| Modelo base | ukisai/Swift-Qwen3.8-27b @ 1b30aaaf753f |
| Fecha de publicacion | 2026-09-16; actualizado 2026-09-17 (contenedor v3, pesos sin cambios) |
| Descargas / likes | 18 / 2 |

## Arquitectura y entrenamiento

No se publica información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO), por lo que ese apartado queda como no disponible. Lo que sí está documentado es la cadena de transformación aplicada sobre ukisai/Swift-Qwen3.8-27b: una abliteración al estilo huihui-ai que elimina la dirección de rechazo en las capas 17 a 51 (70 tensores), transferida por diferencia de pesos entre el par Qwen/Qwen3.8-27B y huihui-ai/Huihui-Qwen3.8-27B-abliterated. Se trata de la familia de técnicas de proyección de rechazo descrita por Arditi et al. (2024).

La segunda transformación es la cuantización. El autor aplica NVFP4 a las proyecciones MLP (gate, up y down) y FP8 a la atención, a los módulos GDN y a lm_head, reutilizando de forma literal el `quantization_config` de unsloth/Qwen3.8-27B-NVFP4, con 32 muestras de calibración. El artefacto se empaqueta en el contenedor v3 de NInfer mediante un script oficial de actualización v2→v3; según la model card, los pesos son idénticos byte a byte entre ambas versiones y el cambio consiste en el reencuadre del contenedor y la instalación de la plantilla de chat de Qwen mantenida. El binario incluye la torre de visión y la cabeza MTP, lo que habilita decodificación especulativa con `--spec mtp --draft-tokens 5 --lm-head-draft`.

## Capacidades

- Generación de texto multimodal: el pipeline declarado es image-text-to-text y el artefacto incluye la torre de visión completa, por lo que admite entradas de imagen junto a texto.
- Modo de razonamiento: la CLI expone el flag --no-thinking, lo que implica que existe un modo de pensamiento activado por defecto; el comportamiento detallado no se documenta.
- Decodificación especulativa con MTP: soporte de `--spec mtp`, 5 tokens de borrador y borrador sobre lm_head, con una aceptación medida del 46,3 % y un paso de fallback en una prueba de 256 tokens nuevos.
- Comportamiento sin rechazos: abliterado explícitamente; en la sonda AdvBench sobre 20 peticiones dañinas en modo greedy se midió un 0,0 % de rechazos.
- Servicio HTTP: `ninfer-serve` permite levantar el modelo como endpoint (ejemplo con puerto 8088).
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles; la model card no declara lista de idiomas.
- Otras capacidades especiales: no se documentan audio ni salidas distintas de texto.

## Casos de uso

- Investigación en interpretabilidad y direcciones de rechazo: al ser el resultado de restar una dirección de rechazo concreta, sirve como contraparte "abliterada" del modelo base para medir cuánto de la capacidad original se conserva tras la intervención y cómo se redistribuye la representación interna en las capas 17 a 51.
- Red teaming y evaluación de filtros de seguridad: con un 0,0 % de rechazos medidos, es un generador útil para crear conjuntos de prompts adversarios y comprobar si un guardarraíl externo (clasificador de contenido, filtro de entrada o salida) aguanta sin depender del propio modelo.
- Análisis multimodal de documentación técnica: al aceptar imagen y texto, puede procesar capturas de pantalla, diagramas de arquitectura o tablas escaneadas dentro de una ventana de 16 384 tokens y devolver descripciones o extracción de datos.
- Inferencia local en una sola GPU Blackwell: con ~20 GB de VRAM y el binario compilado para sm_120a, es viable montar un servicio interno en una estación de trabajo con RTX 5090 o RTX PRO 6000 Blackwell, sin necesidad de clúster ni de paralelismo multi-GPU.
- Generación de baja latencia con decodificación especulativa: para tareas de autocompletado o asistencia interactiva donde cada milisegundo cuenta, el modo MTP con 5 tokens de borrador reduce el número de pasos de decodificación efectivos; la aceptación del 46,3 % medida es la referencia a batir al ajustar `--draft-tokens`.
- Estudio de cuantización NVFP4 + FP8: la receta está copiada de unsloth/Qwen3.8-27B-NVFP4 y documentada con manifiesto y checksums, lo que permite comparar la degradación de calidad frente al modelo en precisión completa sobre el mismo conjunto de evaluación.
- Escritura creativa sin restricciones temáticas: para ficción, narrativa adulta o guiones donde los filtros de rechazo interrumpen la generación, el modelo mantiene la coherencia de un Qwen de 27B sin bloquear temas sensibles; requiere revisión editorial humana posterior.
- Prototipado de pipelines de anotación multimodal en investigación: clasificación y descripción de imágenes a escala con un modelo que cabe en una tarjeta y puede servirse por HTTP, útil cuando el presupuesto no permite APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web realizada no devolvió resultados relevantes: los enlaces recuperados corresponden a páginas de soporte de Microsoft ajenas al modelo. El autor solo publica dos medidas sobre este artefacto concreto, que no son comparables con MMLU, HumanEval o GSM8K:

| Comprobacion | Resultado |
|---|---|
| Inventario del artefacto (contrato) | 1124 objetos — veredicto: OK |
| Aceptación de MTP (prueba de humo, 256 tokens nuevos) | 46,3 % de aceptación, 1 paso de fallback |
| Sonda de rechazo AdvBench (20 prompts dañinos, greedy) | 0,0 % de rechazo |

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB según el autor; el artefacto pesa 21.492.938.224 bytes (≈20,0 GiB), por lo que el margen sobre una GPU de 24 GB es muy ajustado.
- GPU compatibles: exclusivamente arquitecturas Blackwell sm_120a, con CUDA 13.1 o superior. En la práctica, esto apunta a GeForce RTX 50 (RTX 5090 de 32 GB, RTX 5080 de 16 GB no sería suficiente) y a RTX PRO 6000 Blackwell. No se documenta compatibilidad con sm_100 (B100/B200) ni con generaciones anteriores (Hopper, Ada).
- ¿Cabe en GPU de consumo? Sí en una RTX 5090 (32 GB), con holgura de unos 12 GB para caché KV y contexto; no cabe en RTX 5080/5070 Ti de 16 GB.
- Opciones de despliegue: NInfer CLI (`ninfer`) y `ninfer-serve` para servicio HTTP. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el formato de pesos es un contenedor propietario, no safetensors ni GGUF, lo que descarta esos runners salvo conversión.
- Latencia y throughput: no disponibles. El único dato indirecto es la aceptación del 46,3 % en decodificación especulativa MTP con 5 tokens de borrador y un paso de fallback, medido en una prueba de 256 tokens.
- Dependencias: runtime NInfer en revisión f76e19c0 o superior, CUDA ≥ 13.1, build para sm_120a.

## Comparativa con modelos similares

Los modelos relacionados están identificados en la model card, pero no se publican sus parámetros, contexto ni resultados en la información disponible, por lo que la comparación se limita a la relación entre ellos, el formato y la licencia.

| Modelo | Relacion con este artefacto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer | Artefacto analizado | Contenedor NInfer (.ninfer), NVFP4+FP8 | swift-open-license-1.0 (other) | Solo MTP 46,3 % y AdvBench 0,0 % |
| ukisai/Swift-Qwen3.8-27b | Modelo base multimodal (27,78B) | No disponible | No disponible | No disponible |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | Referencia de la transformacion de abliteracion | No disponible | No disponible | No disponible |
| Qwen/Qwen3.8-27B | Modelo original sin abliterar | No disponible | No disponible | No disponible |
| unsloth/Qwen3.8-27B-NVFP4 | Origen literal de la receta de cuantizacion | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo explícitamente sin censura: la abliteración elimina la dirección de rechazo en las capas 17 a 51 y la sonda AdvBench da 0,0 % de rechazos sobre 20 prompts dañinos. Esto implica que el modelo no se negará a generar contenido dañino, ilegal o inseguro; cualquier despliegue con usuarios finales exige guardarraíles externos y revisión legal.
- Sesgos: no hay ninguna evaluación de sesgos publicada en la información disponible; un modelo abliterado conserva los sesgos del corpus original y pierde parte de la contención aprendida durante el alineamiento.
- Alucinación: sin datos. No se han publicado evaluaciones de veracidad ni de calibración para este artefacto.
- Contexto e idioma: el máximo de contexto no está documentado (los ejemplos usan 16 384 tokens) y no se declara lista de idiomas soportados; el rendimiento fuera del inglés y del chino es una incógnita.
- Licencia restrictiva o poco habitual: se declara "swift-open-license-1.0" con etiqueta `license: other`. Los términos exactos están en el fichero LICENSE del repositorio y no se reproducen aquí; antes de cualquier uso comercial hay que leerlos y verificar si permiten uso derivado, redistribución y explotación comercial. No asumas permisos por el hecho de que el modelo base sea de Qwen.
- Dependencia de hardware muy específica: requiere una GPU Blackwell sm_120a y CUDA ≥ 13.1 con un build concreto del motor NInfer. En cualquier otra arquitectura el artefacto no es ejecutable.
- Formato propietario: al no ser safetensors ni GGUF, no se puede cargar en vLLM, llama.cpp, Ollama o TGI sin un proceso de conversión no documentado. Esto limita la portabilidad y ata el ciclo de vida del modelo a un único proyecto de código abierto con pocos mantenedores.
- Validación muy escasa: 18 descargas y 2 "likes", sin benchmarks estándar, sin evaluación por terceros y con una única prueba de humo de 256 tokens para MTP. La calidad real frente al modelo base en FP16 no está cuantificada.
- Ambigüedad de versiones: el repositorio ocupa 43,0 GB mientras que el artefacto principal declara 21,49 GB; la diferencia (por ejemplo, contenedores v2 y v3 coexistiendo) no se explica en la información disponible.
- Trazabilidad: el autor publica manifiesto de artefacto, checksums y registro de procedencia, pero el binario no es reproducible de forma independiente a partir de la información de la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer
- Licencia: https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/LICENSE
- Registro de procedencia (NOTICE): https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/NOTICE
- Receta de cuantizacion: https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/recipe/unsloth_qconfig.json
- Informe de conversion: https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/qwen3_8_27b_swift_abliterated_nvfp4.ninfer.conversion.json
- Manifiesto del artefacto: https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/artifact-manifest.json
- Checksums (SHA256SUMS): https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/SHA256SUMS (enlace truncado en la model card original)
- Parche de procedencia NVFP4: https://huggingface.co/dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/blob/main/patches/0001-nvfp4-provenance.patch
- Discusion sobre la actualizacion a contenedor v3: https://huggingface.co/Dragoy/Swift-Qwen3.8-27B-abliterated-NVFP4-NInfer/discussions/2
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Referencia de abliteracion (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta NVFP4 de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Motor de inferencia NInfer: https://github.com/Neroued/ninfer
- Paper de referencia sobre eliminacion de la direccion de rechazo (Arditi et al. 2024): no disponible como enlace en la informacion proporcionada
