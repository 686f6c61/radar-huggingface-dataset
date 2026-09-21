# g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-curio7B-ptbr-S13-a050

## Resumen

DeltaP2S-Llama2-13B-DeltaP2S-curio7B-ptbr-S13-a050 es un checkpoint fusionado publicado por el usuario g-assismoraes en Hugging Face. Segun la model card, se trata de un "merged checkpoint produced by the family-aware Delta-P2S experiment package", con ruta de entrenamiento base `./runs/curio7b_to_llama2_13b_S13_native_a050/init/delta_p2s`. El repositorio contiene 13.015.864.320 parametros en formato safetensors y ocupa 26,0 GB, lo que es coherente con pesos sin cuantizar en precision de 16 bits.

El nombre del artefacto sugiere un experimento de fusion de pesos entre un modelo de la familia Curio de 7B (orientado a portugues de Brasil) y Llama 2 13B, con un coeficiente alpha de 0,50 y una etapa o semilla identificada como S13. Se trata, por tanto, de un artefacto de investigacion sobre tecnicas de merging de modelos, no de un modelo con model card detallada, evaluacion publicada ni documentacion de uso.

La relevancia actual de este tipo de publicaciones es metodologica: sirven para reproducir y auditar tecnicas de transferencia de deltas entre arquitecturas o familias distintas. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y no incluye resultados de benchmarks, por lo que debe considerarse material experimental sin validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama (inferido del tag `llama` y del recuento de parametros; no confirmado en la model card) |
| Parametros totales | 13.015.864.320 (~13B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors sin cuantizar |
| Idiomas soportados | No disponible (el identificador del repositorio incluye "ptbr", sin confirmacion en la model card) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 26,0 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. Los unicos indicios disponibles son el tag `llama`, la etiqueta de pipeline `text-generation`, la presencia de pesos safetensors compatibles con `transformers` y un recuento de parametros de 13.015.864.320, compatible con la configuracion estandar de Llama 2 13B. No se dispone de informacion sobre numero de capas, dimension oculta, cabezas de atencion, uso de GQA ni ventana de contexto efectiva. Tampoco se confirma si el tokenizer es el original de Llama 2, el de un modelo Curio o una combinacion.

Respecto al entrenamiento, lo unico documentado es que se trata de un checkpoint fusionado generado por el paquete de experimentos "Delta-P2S", con ruta base `runs/curio7b_to_llama2_13b_S13_native_a050/init/delta_p2s`. Esto apunta a un procedimiento de merging o transferencia de deltas de parametros desde un modelo origen de 7B hacia un modelo destino de 13B, con un factor alpha de 0,50 y una etapa identificada como S13. No se especifican tokens de entrenamiento, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento, ni detalles del algoritmo de fusion (por ejemplo, si es linear merge, task arithmetic, TIES, DARE u otro). Las etiquetas `delta-p2s` y `pen2sword` no van acompanadas de documentacion tecnica en el repositorio.

## Capacidades

- Generacion de texto autoregresiva, segun la etiqueta de pipeline `text-generation` y la libreria `transformers`.
- Capacidad potencial de generacion en portugues de Brasil, sugerida por el fragmento "ptbr" del identificador del repositorio, pero no confirmada en la model card.
- Capacidad potencial de generacion en ingles, si el modelo destino es Llama 2 y conserva su tokenizer y sus capacidades originales, aunque no hay verificacion publicada.
- Soporte de tool calling o function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles; no hay indicios de componentes multimodales en el repositorio.
- Compatibilidad declarada con text-generation-inference y endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion en fusion de modelos: el checkpoint sirve como punto de partida reproducible para estudiar como se comporta un merge de familia cruzada con alpha 0,50 entre un modelo de 7B y otro de 13B, comparando con las variantes del mismo paquete experimental.
- Auditoria de artefactos de merging: permite inspeccionar los pesos y verificar si la fusion ha preservado la estructura de Llama 2 13B, si el tokenizer es coherente y si el vocabulario resultante genera texto correcto.
- Evaluacion de capacidades en portugues de Brasil: dado el indicio "ptbr" del identificador, es un candidato razonable para ejecutar baterias de evaluacion en portugues y comparar contra el modelo de 13B sin fusionar, siempre asumiendo que no hay resultados publicados.
- Generacion de datos sinteticos en portugues para experimentos: si las evaluaciones cualitativas previas muestran texto coherente, puede emplearse para producir corpus sinteticos de prototipado, con revision humana obligatoria dado que no existe evaluacion de calidad.
- Fine-tuning posterior sobre dominio especifico: al ser un checkpoint de 13B compatible con `transformers`, puede servir como inicializacion para ajustes supervisados en tareas concretas (clasificacion, resumen, extraccion) en lugar de partir del modelo base.
- Despliegue interno de bajo riesgo: como asistente de generacion de texto en entornos de pruebas o demos internas, con cuantizacion previa a 8 o 4 bits para ajustarlo a GPUs de consumo.
- Estudio comparativo de degradacion por merging: medir perplejidad, coherencia y repeticion frente a Llama 2 13B original para cuantificar cuanto rendimiento se pierde o se gana con la fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y la busqueda web realizada no devolvio documentacion tecnica asociada al repositorio.

## Requisitos de hardware

- VRAM para inferencia en fp16: los pesos ocupan aproximadamente 26 GB, por lo que se necesitan del orden de 28-30 GB de VRAM contando activaciones y cache KV con contexto corto.
- VRAM en 8 bits: aproximadamente 13-15 GB, requiriendo cuantizacion por parte del usuario (no se incluyen pesos pre-cuantizados en el repositorio).
- VRAM en 4 bits: aproximadamente 7-9 GB, igualmente con cuantizacion a realizar por el usuario.
- Cache KV estimada: asumiendo la configuracion estandar de Llama 2 13B (40 capas, dimension oculta 5120, fp16), unos 0,39 MB por token, es decir alrededor de 1,6 GB para 4096 tokens de contexto. Cifra orientativa, no confirmada por el autor.
- GPUs recomendadas: A100 40 GB o 80 GB, H100, L40S 48 GB o similares para fp16 en una sola GPU.
- GPUs de consumo: no cabe en fp16 en una RTX 4090 (24 GB). Si cabe en una RTX 4090 o RTX 3090 tras cuantizacion a 4 bits, y en configuraciones de 2x24 GB con paralelismo de tensor para fp16.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta `text-generation-inference`) y endpoints compatibles. vLLM es viable tecnicamente al ser un modelo tipo Llama, pero no esta declarado por el autor. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponible. No hay mediciones publicadas y cualquier cifra seria especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeltaP2S-Llama2-13B-DeltaP2S-curio7B-ptbr-S13-a050 | 13.015.864.320 | No disponible | safetensors | No disponible | Repositorio publico con 0 descargas |
| Llama 2 13B | 13B | 4096 tokens | safetensors, GGUF (terceros) | Llama 2 Community License | Ampliamente disponible en Hugging Face y en multiples formatos |
| Llama 2 13B Chat | 13B | 4096 tokens | safetensors, GGUF (terceros) | Llama 2 Community License | Ampliamente disponible, con ajuste por RLHF para dialogos |
| Modelo origen Curio 7B (referido en la ruta de entrenamiento) | No disponible | No disponible | No disponible | No disponible | No verificado en la informacion disponible |

No se dispone de datos de rendimiento del checkpoint evaluado, por lo que la comparativa se limita a parametros, contexto, formato y disponibilidad. No es posible afirmar que el modelo fusionado iguale o supere a Llama 2 13B en ninguna tarea.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint, lo que impide determinar si su uso comercial es legal. Si deriva de Llama 2, es previsible que apliquen los terminos de la Llama 2 Community License, pero no esta confirmado.
- Sin evaluacion publicada: no hay benchmarks, perplejidad ni pruebas cualitativas que respalden la calidad del modelo. No debe asumirse que conserva las capacidades de Llama 2 13B.
- Riesgo de degradacion por merging: los procedimientos de fusion de pesos entre familias distintas pueden producir artefactos como repeticiones, deriva de estilo, perdida de coherencia o colapso parcial en determinados idiomas.
- Idioma incierto: el identificador sugiere portugues de Brasil, pero no se confirma el conjunto de idiomas soportados ni la calidad en cada uno de ellos.
- Sesgos: al derivar previsiblemente de Llama 2 y de corpus en portugues, puede heredar sesgos de genero, raza, religion y nacionalidad presentes en esos datos. No se documenta ningun proceso de mitigacion.
- Alucinacion: sin ajuste por RLHF documentado ni evaluacion de veracidad, la probabilidad de generar informacion falsa con apariencia plausible es alta, especialmente en tareas factuales.
- Longitud de contexto desconocida: no se puede garantizar 4096 tokens ni ninguna otra ventana. Usar contextos largos sin verificar puede provocar degradacion silenciosa.
- Tokenizer no verificado: si el vocabulario o los tokens especiales difieren de los de Llama 2, las plantillas de prompt habituales y las herramientas de despliegue pueden fallar.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que no hay reportes de terceros sobre su comportamiento en produccion.
- Uso en produccion no recomendado sin una fase previa de evaluacion interna exhaustiva, incluida la comprobacion de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-DeltaP2S-curio7B-ptbr-S13-a050
- La busqueda web realizada no devolvio resultados relevantes: unicamente paginas de inicio de Google y una entrada generica de Wikipedia, sin relacion con el modelo. No se han localizado papers, blogs, repositorios de codigo ni demos asociados a este checkpoint.
