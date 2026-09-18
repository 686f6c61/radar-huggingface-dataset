# gup98/test

## Resumen

`gup98/test` es un repositorio de cuantizaciones GGUF en estado incompleto publicado por el usuario `gup98` sobre el checkpoint base `orcarouter/Qwen3.8-Flash-Next-Uncensored` (revisión fijada `8336e613ea508b13c2159bd0f68965d97a606b95`). El propio autor advierte de forma explícita en la model card que se trata de un "INCOMPLETE CHECKPOINT" y que los conjuntos GGUF todavía no pueden cargarse como modelos completos: cada variante necesita los 28 shards antes de poder ejecutar inferencia, y el modelo terminado "aún no ha sido entregado". El repositorio ocupa 2,1 GB en el momento de su última actualización (17 de septiembre de 2026) y acumula 0 descargas y 0 likes.

El repositorio contiene dos recetas de cuantización distintas: `AD-3.84bpw-IQ4_XS-M64`, basada en el mapeo tensorial de AtomicChat a 3,84 bits por peso con su correspondiente imatrix y pensada para llama.cpp con soporte `qwen4exp`; y `ROCmFP2-STRIX_LEAN-v2`, basada en el mapeo de pugant v2 a 3,68 bits por peso con imatrix de Unsloth y pensada para ROCmFPX con los parches `qwen4exp` de strix-nebulosa. Además se incluye un proyector de visión BF16 compartido, `mmproj-Qwen3.8-Flash-Next-Uncensored-BF16.gguf`, con 334 tensores convertidos a partir de los 333 tensores de visión originales.

Su relevancia actual es limitada y de tipo instrumental: no es un modelo utilizable, sino un artefacto de trabajo en progreso para quien necesite reproducir o auditar el proceso de cuantización de este linaje concreto de modelos. La model card indica que los archivos ya presentes son pesos cuantizados reales verificados por hash contra sus recetas por tensor y validados con el lector GGUF nativo, pero que quedan pendientes la inferencia de modelo completo, la perplejidad y la validación en dispositivos AMD, y que no se reclama ningún benchmark de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura del modelo base; la conversión de texto omite MTP y el repositorio incluye un proyector de visión, lo que implica un modelo multimodal de origen) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se confirma que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF con dos recetas: `AD-3.84bpw-IQ4_XS-M64` (3,84 bpw, mapeo tensorial AtomicChat + imatrix) y `ROCmFP2-STRIX_LEAN-v2` (3,68 bpw, mapeo pugant v2 + imatrix de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; el autor indica que los pesos quedan sujetos a las licencias del modelo fuente y del modelo base y que este checkpoint no concede derechos adicionales |
| Formato de pesos | GGUF (texto cuantizado en shards + proyector de visión BF16 en `mmproj-Qwen3.8-Flash-Next-Uncensored-BF16.gguf`) |
| Modelo base | `orcarouter/Qwen3.8-Flash-Next-Uncensored`, revisión `8336e613ea508b13c2159bd0f68965d97a606b95` (relación: quantized) |
| Estado del repositorio | Checkpoint incompleto: ninguna variante es cargable como modelo completo; se requieren los 28 shards por variante |
| Shards requeridos | 28 por variante (la segunda variante se reempaquetó en 28 shards para el flujo de almacenamiento acotado) |
| Componentes auxiliares | Proyector de visión BF16, 334 tensores convertidos desde los 333 tensores de visión originales |
| Runtime compatible | llama.cpp con soporte `qwen4exp` (variante AD) y ROCmFPX con parches `strix-nebulosa` `qwen4exp` (variante ROCmFP2) |
| Tamaño del repositorio | 2,1 GB (parcial, correspondiente a la carga incompleta) |
| Creado / actualizado | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La información proporcionada no describe la arquitectura interna del modelo base ni su proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo único documentado a nivel arquitectónico es indirecto y procede de la propia model card de la cuantización: la conversión de texto omite los tensores MTP (multi-token prediction), coincidiendo con los dos conjuntos de referencia citados; el repositorio incorpora un proyector de visión compartido, lo que implica que el modelo fuente es multimodal; y existen "constantes hash PLE en enteros" que, junto con el tokenizador y la plantilla de chat, se tomaron del modelo fuente sin censurar en lugar de las model cards de referencia.

En cuanto a la innovación técnica del artefacto, lo reseñable es el propio pipeline de cuantización, no el modelo. Se aplican dos mapeos tensoriales por tensor con sus matrices de importancia (imatrix) respectivas, se verifica cada archivo por hash contra su receta y se valida con el lector GGUF nativo correspondiente. La variante ROCmFP2 se reempaquetó en 28 shards para encajar en un flujo de trabajo de almacenamiento acotado, y sus tipos y formas por tensor siguen al modelo de referencia de dos shards. Todo el trabajo se realiza sobre un runtime experimental (`qwen4exp`) con parches específicos para hardware AMD (strix-nebulosa), lo que sitúa este repositorio en la fase de preparación y no en la de validación funcional.

## Capacidades

No es posible verificar capacidades funcionales porque no se ha entregado ningún modelo cargable. Los puntos siguientes son lo que se puede afirmar o inferir de la documentación, siempre sin validación:

- Generación de texto: no verificable; no hay pesos completos ni resultados de inferencia de modelo completo.
- Multimodalidad (visión): el repositorio incluye un proyector de visión BF16 (`mmproj-Qwen3.8-Flash-Next-Uncensored-BF16.gguf`, 334 tensores), lo que indica que el modelo base acepta entrada visual; el proyector proviene del modelo sin censurar.
- Razonamiento y matemáticas: no disponible; la model card no documenta ninguna capacidad de este tipo.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte ni formato de herramientas.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas ni en la model card ni en los metadatos del repositorio.
- Multi-token prediction (MTP): la conversión de texto omite estos tensores, por lo que el artefacto GGUF no expone esa capacidad aunque el modelo de referencia pudiera tenerla.
- Ajuste de comportamiento: el modelo base se denomina "Uncensored", lo que apunta a un ajuste orientado a reducir rechazos; no hay información técnica sobre cómo se obtuvo ni con qué datos.
- Plantilla de chat: heredada del modelo fuente sin censurar, tal y como indica la model card.

## Casos de uso

Todos los escenarios siguientes están bloqueados en la práctica mientras el checkpoint siga incompleto. Se listan como usos previstos o propios del artefacto, no como usos verificados:

- Auditoría del proceso de cuantización: el repositorio publica recetas por tensor, imatrix y verificación por hash, lo que permite a un ingeniero de inferencia revisar cómo se construye una cuantización a 3,84 bpw y compararla con el conjunto de referencia de AtomicChat.
- Reproducción de cuantizaciones en hardware AMD: la variante `ROCmFP2-STRIX_LEAN-v2` está pensada para ROCmFPX con los parches `strix-nebulosa`, de modo que sirve como banco de pruebas para flujos de cuantización sobre GPU AMD cuando el conjunto esté completo.
- Despliegue local en llama.cpp: una vez entregados los 28 shards, la variante AD encajaría en un servidor llama.cpp compilado con soporte `qwen4exp` para inferencia en local sin dependencia de APIs externas.
- Pruebas de inferencia de modelo completo y perplejidad: el propio autor marca estas tareas como pendientes, por lo que el repositorio funciona como punto de partida para medir perplejidad y coherencia del modelo cuantizado frente al checkpoint fuente.
- Validación de cuantizaciones multimodal: al incluir el proyector de visión BF16, permite comprobar si un proyector no cuantizado emparejado con un cuerpo de texto cuantizado a ~3,8 bpw mantiene la coherencia entre modalidades.
- Derivación de conjuntos de referencia para comparativas: al seguir el mapeo tensorial de pugant v2 y el de AtomicChat, los resultados pueden usarse para comparar formatos de cuantización sobre el mismo modelo fuente, aislando el efecto de la receta.
- Investigación sobre modelos con alineamiento reducido: el linaje "Uncensored" resulta de interés para estudiar comportamiento y sesgos, siempre bajo revisión ética y legal y con la advertencia de que este checkpoint no añade ni retira derechos sobre las licencias de origen.
- Integración en pipelines de evaluación de GGUF: los archivos con hash verificado permiten probar lectores GGUF, herramientas de validación por tensor y automatizaciones de descarga por shards.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica expresamente que no se reclama ningún benchmark de referencia para este modelo y que la inferencia de modelo completo, la perplejidad y la validación en dispositivos AMD permanecen pendientes. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se ha publicado el número de parámetros del modelo base. Como referencia de cálculo, una cuantización a 3,84 bpw ocupa aproximadamente 0,48 bytes por parámetro y una a 3,68 bpw aproximadamente 0,46 bytes por parámetro, más el overhead de contexto, caché KV y búferes del runtime; sin el recuento de parámetros no es posible dar una cifra en GB.
- Tamaño de descarga: el repositorio ocupa 2,1 GB, pero es una carga parcial y no representa el tamaño final del modelo. Cada variante necesita 28 shards antes de poder usarse.
- GPU recomendadas: no disponible. El autor menciona hardware AMD y parches específicos para ROCm/ROCmFPX (strix-nebulosa), pero sin modelo de GPU concreto ni requisitos mínimos.
- Compatibilidad con GPU de consumo: no determinable sin el recuento de parámetros. Con 3,68-3,84 bpw el peso teórico sería manejable en GPUs de gama alta con suficiente VRAM si el modelo fuera de escala media, pero esto es una hipótesis, no un dato del repositorio.
- Opciones de despliegue: llama.cpp con soporte `qwen4exp` para la variante AD-3.84bpw-IQ4_XS-M64; ROCmFPX con los parches `qwen4exp` de strix-nebulosa para la variante ROCmFP2-STRIX_LEAN-v2. No se documenta compatibilidad con vLLM, TGI, Ollama ni otros servidores, y los formatos citados (ROCmFP) no son estándar de llama.cpp.
- Latencia y throughput estimados: no disponible. No hay ninguna medición publicada, y la card señala que la validación en dispositivos AMD sigue pendiente.
- Estado de validación: inferencia de modelo completo, perplejidad y validación en hardware AMD marcadas como pendientes; solo hay verificación por hash y validación con el lector GGUF nativo por archivo.

## Comparativa con modelos similares

No hay datos de parámetros, contexto, licencia ni rendimiento para este repositorio, por lo que la comparativa se limita a la receta de cuantización, el runtime previsto y el estado de entrega frente a los conjuntos de referencia citados por el propio autor.

| Modelo | Receta / bpw | Runtime previsto | Shards | Estado | Licencia |
|---|---|---|---|---|---|
| `gup98/test` (variante AD-3.84bpw-IQ4_XS-M64) | 3,84 bpw, mapeo tensorial AtomicChat + imatrix | llama.cpp con soporte `qwen4exp` | 28 | Incompleto, no cargable | no disponible |
| `gup98/test` (variante ROCmFP2-STRIX_LEAN-v2) | 3,68 bpw, mapeo pugant v2 + imatrix de Unsloth | ROCmFPX con parches `strix-nebulosa` `qwen4exp` | 28 (reempaquetado) | Incompleto, no cargable | no disponible |
| `AtomicChat/Qwen3.8-Flash-Next-GGUF` | no disponible en la información proporcionada | no disponible | no disponible | Conjunto de referencia citado por el autor | no disponible |
| `pugant/Qwen3.8-Flash-Next-ROCMFP4_STRIX_LEAN-GGUF` | no disponible en la información proporcionada (referencia de dos shards) | ROCmFPX / strix-nebulosa (según la referencia citada) | 2 (referencia) | Conjunto de referencia citado por el autor | no disponible |
| `orcarouter/Qwen3.8-Flash-Next-Uncensored` | Modelo fuente sin cuantizar | no disponible | no disponible | Fuente fijada en la revisión `8336e613ea508b13c2159bd0f68965d97a606b95` | no disponible |

No se dispone de alternativas comparables fuera de este linaje con datos verificables (parámetros, contexto, benchmarks o licencia), por lo que no se puede establecer una comparación funcional con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Checkpoint incompleto: el autor advierte en mayúsculas de que los conjuntos GGUF no pueden cargarse todavía como modelos completos. Ninguna inferencia debe intentarse ni darse por válida hasta que se publiquen los 28 shards de una variante.
- Sin validación de modelo completo: perplejidad, coherencia y validación en dispositivos AMD están pendientes. La única garantía ofrecida es la verificación por hash de los archivos y la validación con el lector GGUF nativo.
- Sin benchmarks: no se reclama ningún resultado de benchmark. Cualquier cifra de rendimiento atribuida a este repositorio sería inventada.
- Licencia no disponible: la model card remite a las licencias del modelo fuente y del modelo base y aclara que el checkpoint no concede derechos adicionales. Antes de cualquier uso comercial hay que revisar esas licencias, que no se detallan aquí.
- Linaje "Uncensored": el modelo base se presenta como sin censurar, lo que implica previsiblemente una reducción de barreras de seguridad y un mayor riesgo de generar contenido inapropiado, sesgado o dañino. No hay documentación sobre qué se modificó ni con qué datos.
- Riesgo de alucinación: no cuantificado ni evaluado en este repositorio; sin pruebas de perplejidad ni de fidelidad no puede estimarse.
- Idiomas y contexto: no declarados. Se desconoce la cobertura multilingüe y la ventana de contexto real.
- Dependencia de runtimes experimentales: las dos variantes requieren `llama.cpp` con soporte `qwen4exp` o ROCmFPX con parches `strix-nebulosa`. Esto reduce la portabilidad, complica el soporte y ata el uso a hardware y versiones concretas.
- Proyector de visión: se entrega sin cuantizar (BF16) y convertido con un conversor fijado; su comportamiento emparejado con un cuerpo de texto cuantizado a ~3,8 bpw no está validado.
- Nombre y propósito del repositorio: el identificador `test` y el mensaje de "cuantización en progreso" sugieren un espacio de trabajo personal más que una distribución estable; no hay garantía de mantenimiento ni de que se complete.
- Trazabilidad de la entrega: el autor remite a `delivery-status.json` para los archivos verificados por hash; conviene consultarlo antes de intentar cualquier descarga o montaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gup98/test
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Referencia de cuantización de AtomicChat: https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF
- Referencia de cuantización de pugant: https://huggingface.co/pugant/Qwen3.8-Flash-Next-ROCMFP4_STRIX_LEAN-GGUF
- Repositorio de parches strix-nebulosa: https://github.com/pugant/strix-nebulosa

Nota sobre la búsqueda web: los resultados devueltos no contienen ningún enlace relacionado con el modelo (corresponden a mapas de Seattle y de Google Maps), por lo que no aportan información utilizable para esta ficha.
