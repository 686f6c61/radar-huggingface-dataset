# mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF

## Resumen

Gemory-26B-A4B-SOMPOA-i1-GGUF es un repositorio de cuantizaciones GGUF con matriz de importancia (imatrix, "i1") del modelo 26B-Suite/Gemory-26B-A4B-SOMPOA, publicado por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face. El modelo base es un merge (fusión de modelos) de arquitectura MoE etiquetado como "gemma4", con aproximadamente 25.230 millones de parámetros totales de los cuales unos 4.000 millones estarían activos por token (según la nomenclatura A4B), orientado a escritura creativa, roleplay y conversación sin filtros (uncensored/abliterated).

La relevancia de este repositorio no está en el modelo en sí, sino en la disponibilidad de más de 20 cuantizaciones que permiten ejecutar el modelo en hardware muy variado, desde portátiles con 8 GB de VRAM (IQ1_S, 8,4 GB) hasta estaciones con GPUs de gama alta (Q6_K, 22,7 GB). Al ser un modelo etiquetado como multimodal (visión), los archivos mmproj correspondientes se encuentran en el repositorio de cuantizaciones estáticas.

Cabe destacar que la model card del modelo base no está incluida en la información disponible, por lo que muchos detalles técnicos (contexto, datos de entrenamiento, benchmarks) no constan y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE, etiquetada como "gemma4" (transformer) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | ~4B (inferido de la nomenclatura "A4B"; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix de 0,2 GB para crear cuantizaciones propias); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base, Gemory-26B-A4B-SOMPOA, es un merge (combinación de pesos de varios modelos) con arquitectura MoE de la familia etiquetada como "gemma4", con 25.230 millones de parámetros totales y, según la nomenclatura A4B, unos 4.000 millones activos por token, lo que permitiría inferencia rápida a cambio de una huella de memoria propia de un modelo de 26B. Está etiquetado como multimodal (visión), abliterated (con los rechazos de seguridad eliminados) y uncensored. No hay información disponible sobre el proceso de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO, dado que es un merge y la model card original no está incluida.

El repositorio de mradermacher no modifica el modelo: aplica cuantización GGUF con matriz de importancia (imatrix), técnica que calcula la importancia de cada peso sobre un corpus de calibración para reducir la degradación de calidad en cuantizaciones bajas, especialmente en los formatos IQ (importance quantization) de ikawrakow.

## Capacidades

- Generación de texto y escritura creativa (etiquetas creative-writing, roleplay, erp)
- Conversación multi-turno (etiqueta conversational)
- Comprensión de imágenes (etiqueta multimodal; requiere archivos mmproj del repositorio estático)
- Comportamiento sin filtros de seguridad (etiquetas uncensored y abliterated, variante "heretic")
- Soporte en el ecosistema GGUF: llama.cpp, Ollama, LM Studio, KoboldCpp y derivados
- No hay información disponible sobre tool calling, agentes ni razonamiento multi-paso

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado específicamente para creative-writing y roleplay, con pesos abliterated que eliminan rechazos, adecuado para simulaciones de personajes sin restricciones de contenido.
- Escritura creativa asistida: generación de prosa, diálogos y borradores narrativos en inglés, con la ventaja de que solo ~4B de parámetros activos permiten velocidades de generación altas en tiempo real.
- Uso local privado de un modelo uncensored: las cuantizaciones desde 8,4 GB permiten ejecutarlo íntegramente en local, sin enviar datos a servicios externos, algo relevante para usuarios que necesitan control total sobre el contenido generado.
- Experimentación con cuantizaciones extremas: el archivo imatrix incluido permite a investigadores generar sus propias cuantizaciones y estudiar la degradación de calidad en formatos IQ1/IQ2.
- Chatbot conversacional local: integrable en frontends como SillyTavern, KoboldCpp u Ollama para asistentes de conversación de uso personal.
- Pruebas de capacidades multimodales en local: combinando el GGUF con los archivos mmproj del repositorio estático se puede probar comprensión de imágenes en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: equivale aproximadamente al tamaño del archivo GGUF elegido, desde ~8,4 GB (IQ1_S) hasta ~22,7 GB (Q6_K); la cuantización recomendada Q4_K_M ocupa 16,9 GB.
- GPU recomendadas: para Q4_K_M o superior, una RTX 4090 (24 GB) ejecuta el modelo completo en VRAM; para las cuantizaciones IQ2/IQ3 bastan GPUs de 12 GB como la RTX 3060 o RTX 4070; con CPU o offload parcial, cualquier equipo con suficiente RAM (16-32 GB) es viable gracias a la MoE con ~4B de parámetros activos.
- Cabe en GPUs de consumo: sí, en cuantizaciones de IQ1_S a Q6_K según la VRAM disponible; la Q4_K_M (16,9 GB) cabe en una RTX 4080/4090 y con offload parcial en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, KoboldCpp, text-generation-webui; también es posible servirlo con backends compatibles con GGUF. El modelo base en safetensors podría desplegarse con vLLM o TGI si su arquitectura está soportada (no verificado).
- Latencia y throughput: no disponibles; al ser un MoE con ~4B de parámetros activos, es de esperar velocidades de generación superiores a un denso de 26B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Gemory-26B-A4B-SOMPOA (este modelo) | 25,2B | ~4B | no disponible | Apache 2.0 | Merge MoE uncensored para roleplay, multimodal |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32k (128k con YaRN) | Apache 2.0 | MoE generalista con soporte de tool calling y thinking mode |
| Gemma 3 27B | 27B (denso) | 27B | 128k | Gemma Terms of Use | Denso, multimodal, sin variante uncensored oficial |

Comparado con Qwen3-30B-A3B, Gemory ofrece una huella similar en parámetros activos pero está especializado en escritura creativa sin filtros, mientras que Qwen3 es más generalista y está mejor documentado. Frente a Gemma 3 27B, Gemory es MoE (más rápido en inferencia) y sin restricciones de contenido, aunque con documentación y validación mucho más limitadas al tratarse de un merge comunitario.

## Limitaciones y advertencias

- Modelo abliterated y uncensored: los filtros de seguridad han sido eliminados deliberadamente; puede generar contenido ofensivo, dañino o inapropiado. Su uso conlleva responsabilidad legal y ética para el desplegador.
- Es un merge comunitario sin model card técnica detallada: no hay datos de entrenamiento, benchmarks ni evaluaciones publicadas, lo que dificulta validar su calidad y fiabilidad.
- Riesgo de alucinación elevado al tratarse de un merge orientado a roleplay/escritura creativa, sin alineación documentada; no es adecuado para tareas que exijan factualidad verificada.
- Idioma: etiquetado solo para inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Contexto: longitud de ventana de contexto no disponible; debe verificarse en la configuración del modelo base antes de planificar aplicaciones con documentos largos.
- La multimodalidad requiere descargar los archivos mmproj del repositorio estático aparte; sin ellos el modelo funciona solo como texto.
- Licencia Apache 2.0 tanto en el modelo base como en las cuantizaciones, lo que permite uso comercial, pero la ausencia de salvaguardas puede entrar en conflicto con las políticas de algunas plataformas y jurisdicciones.
- Las cuantizaciones IQ1_S/IQ1_M y Q2_* presentan degradación de calidad significativa según el propio autor del repositorio; para producción se recomienda como mínimo Q4_K_S o Q4_K_M.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Gemory-26B-A4B-SOMPOA-i1-GGUF
- Modelo base: https://huggingface.co/26B-Suite/Gemory-26B-A4B-SOMPOA
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Gemory-26B-A4B-SOMPOA-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Gemory-26B-A4B-SOMPOA-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): http://nethype GmbH (enlace truncado en la model card original)
