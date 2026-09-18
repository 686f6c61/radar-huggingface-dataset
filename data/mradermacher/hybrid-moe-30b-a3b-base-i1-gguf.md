# mradermacher/hybrid-moe-30b-a3b-base-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo base `geodesic-research/hybrid-moe-30b-a3b-base`, publicadas por el usuario mradermacher (autor conocido por distribuir versiones cuantizadas de modelos abiertos). No se trata de un modelo nuevo, sino de una conversion de pesos a formato GGUF, con variantes estáticas y variantes i1/imatrix, pensadas para su uso en `llama.cpp` y derivados. El modelo original declara una arquitectura híbrida que combina mezcla de expertos (MoE) con capas tipo Mamba, segun los tags del propio repositorio (`moe`, `mamba`, `hybrid`).

El recuento real de parametros del modelo base, extraido de los safetensors, es de 31.577.940.288 (~31,6 B). La nomenclatura "30b-a3b" sugiere alrededor de 3 B de parametros activos por token, un esquema habitual en modelos MoE que reduce el coste de computo manteniendo la capacidad total. La longitud de contexto no aparece documentada en la informacion disponible, y tampoco la licencia del modelo original ni de la cuantizacion.

La relevancia de esta ficha es practica: permite desplegar localmente un modelo de 31,6 B con una fraccion de los requisitos de computo de un modelo denso equivalente, con un archivo i1-Q2_K de 18,0 GB. El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que no existe validacion comunitaria publica sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con mezcla de expertos (MoE) y componentes Mamba (segun tags `moe`, `mamba`, `hybrid`) |
| Parametros totales | 31.577.940.288 (~31,6 B) segun safetensors del modelo base |
| Parametros activos | ~3 B, deducido de la nomenclatura "30b-a3b"; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (con variantes i1/imatrix; solo i1-Q2_K tiene tamano publicado: 18,0 GB) |
| Idiomas soportados | ingles (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors (segun el recuento de parametros) |

## Arquitectura y entrenamiento

La informacion disponible es limitada y procede de los tags y metadatos del repositorio. Lo unico confirmado es que el modelo base es una arquitectura hibrida: mezcla de expertos (MoE) combinada con capas de espacio de estados tipo Mamba. Este patron busca combinar la eficiencia lineal de Mamba para secuencias largas con la capacidad de modelado de la atencion en las capas MoE, algo que ya han explorado otros modelos hibridos como Jamba. El recuento de parametros (31,6 B totales) y la nomenclatura "a3b" apuntan a aproximadamente 3 B de parametros activos por token, aunque el numero de expertos, el numero de expertos activos, la profundidad y el ratio de capas Mamba frente a capas de atencion no se detallan en la informacion disponible.

No hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o cualquier otro tipo de ajuste por preferencias. El tag `base-model` indica que se trata de un modelo preentrenado, sin ajuste de instrucciones, y el tag `conversational` aparece en los metadatos sin que la model card explique a que se debe. Las fechas del repositorio (creacion el 17 de septiembre de 2026) y la ausencia de documentacion tecnica adicional impiden verificar innovaciones concretas como decodificacion especulativa o esquemas de atencion alternativos.

## Capacidades

- Generacion de texto en ingles como modelo base: el modelo completa texto y puede usarse con prompts de tipo few-shot, pero no esta ajustado para seguir instrucciones de forma fiable.
- Modelado de lenguaje general: al ser un modelo preentrenado, su funcion principal es la prediccion del siguiente token sobre texto en ingles.
- Razonamiento y matematicas: no hay informacion publicada sobre capacidades especificas ni evaluaciones en estas areas.
- Generacion de codigo: no disponible; no se documenta ningun entrenamiento especifico sobre codigo.
- Soporte de tool calling / function calling: no disponible; al ser un modelo base sin ajuste de instrucciones, no se documenta plantilla ni formato de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`; no se documentan otros idiomas.
- Capacidades multimodales (vision, audio): no disponibles; no se menciona ningun proyector multimodal en el repositorio.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Despliegue eficiente via GGUF: soporte para ejecucion con `llama.cpp` y herramientas compatibles, incluidas las cuantizaciones de muy baja precision generadas con imatrix.

## Casos de uso

- Punto de partida para ajuste fino supervisado: al ser un modelo base, es adecuado como inicializacion para SFT o LoRA sobre dominios concretos en ingles (legal, medico, tecnico), evitando el sesgo conversacional de los modelos ya alineados.
- Generacion de datos sinteticos y destilacion: con 31,6 B de parametros totales y ~3 B activos, puede generar grandes volumenes de texto a un coste por token bajo, util para crear datasets de entrenamiento para modelos mas pequenos.
- Investigacion sobre arquitecturas hibridas: permite estudiar el comportamiento de una mezcla MoE + Mamba frente a transformers puros en tareas de modelado de lenguaje, comparando perplejidad y estabilidad de entrenamiento.
- Despliegue local en GPU de consumo con llama.cpp: la variante i1-Q2_K (18,0 GB) entra en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, lo que permite ejecutar un modelo de 31,6 B en un equipo de sobremesa.
- Inferencia en CPU con RAM abundante: mediante offload parcial o total en `llama.cpp`, el modelo puede ejecutarse en servidores sin GPU, a costa de una latencia mucho mayor; requiere al menos 32 GB de RAM para la variante Q2_K.
- Autocompletado de documentacion tecnica en ingles: uso como motor de completado en editores o generadores de documentacion, donde el modelo base rinde bien sin necesidad de ajuste conversacional.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye el archivo imatrix (0,2 GB), lo que permite reproducir y comparar el impacto de distintas cuantizaciones sobre la perplejidad del mismo modelo.
- Procesamiento por lotes de texto a escala: si el objetivo es generar o filtrar corpus en ingles, la relacion entre parametros totales y activos reduce el coste de computo frente a un modelo denso de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, perplejidad ni de ninguna otra evaluacion, ni para el modelo base ni para las cuantizaciones de este repositorio. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- Tamano de pesos confirmado: i1-Q2_K ocupa 18,0 GB; el archivo imatrix ocupa 0,2 GB. El resto de cuantizaciones no tiene tamano publicado en la informacion disponible.
- VRAM estimada para i1-Q2_K: aproximadamente 20-22 GB contando pesos, cache KV y buffers de ejecucion, dependiendo de la longitud de contexto configurada.
- GPU compatibles con i1-Q2_K: RTX 3090, RTX 4090, RTX 5090, A6000, L40S, A100 40 GB o cualquier GPU con 24 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en modelos de 24 GB (RTX 3090/4090). No cabe en GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) ni de 12 GB con la variante Q2_K.
- Escalado a cuantizaciones mayores: partiendo de los 18,0 GB medidos en i1-Q2_K, cada bit por peso adicional anade del orden de 4 GB para 31,6 B de parametros; las variantes IQ3, Q4, Q5 y Q6 se situarian aproximadamente en 22, 26, 30 y 35 GB respectivamente. Son estimaciones, no medidas publicadas.
- Ejecucion en CPU: viable con `llama.cpp` y offload parcial; se recomienda un minimo de 32 GB de RAM para la variante Q2_K, y mas si se quiere cargar el modelo completo en memoria.
- Opciones de despliegue: `llama.cpp`, Ollama, LM Studio, koboldcpp y text-generation-webui. El soporte de GGUF en vLLM y TGI es limitado o requiere conversion; no hay informacion disponible al respecto para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus model cards publicas; no existen mediciones comparativas para el modelo de esta ficha.

| Modelo | Parametros totales / activos | Contexto | Arquitectura | Licencia | GGUF disponible |
|---|---|---|---|---|---|
| hybrid-moe-30b-a3b-base (esta ficha) | 31,6 B / ~3 B (deducido) | no disponible | MoE + Mamba hibrida | no disponible | si (i1/imatrix) |
| Qwen3-30B-A3B | 30,5 B / 3,3 B | 32.768 nativo, 131.072 con YaRN | MoE transformer, 128 expertos, 8 activos | Apache 2.0 | si |
| Mixtral 8x7B | 46,7 B / 12,9 B | 32.768 | MoE transformer, 8 expertos, 2 activos | Apache 2.0 | si |
| Jamba (AI21) | 52 B / 12 B | 256.000 | MoE hibrida Mamba-Transformer | Apache 2.0 | parcial |

La diferencia principal frente a las alternativas es la ausencia total de informacion sobre licencia, contexto y evaluaciones, lo que dificulta la comparacion real de rendimiento. Qwen3-30B-A3B es el competidor estructural mas cercano por numero de parametros totales y activos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no debe esperarse un comportamiento conversacional fiable ni seguimiento de instrucciones sin una fase de ajuste previa.
- Licencia no disponible: al no declararse la licencia, el uso comercial queda en una situacion juridica indeterminada. Conviene contactar con el autor del modelo original antes de cualquier despliegue en produccion.
- Idioma unico: solo ingles declarado; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera pobre.
- Contexto desconocido: no se publica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje preentrenado; al no haber ajuste por preferencias, no hay mitigacion documentada.
- Sin datos de evaluacion: no hay benchmarks, perplejidad ni pruebas de sesgo, por lo que no es posible estimar su calidad relativa frente a alternativas conocidas.
- Impacto de la cuantizacion: las variantes de muy baja precision (Q2_K, IQ2, IQ1) degradan notablemente la calidad. La propia model card advierte que IQ3_XXS es probablemente mejor opcion que Q2_K a pesar de un tamano similar.
- Arquitectura hibrida MoE + Mamba: el soporte en herramientas de inferencia puede ser irregular; conviene verificar la compatibilidad de la version de `llama.cpp` con capas Mamba antes de desplegar.
- Estado del repositorio: registra 0 descargas y 0 me gusta, sin validacion externa conocida. Las fechas de creacion y actualizacion indicadas (septiembre de 2026) deberian verificarse.
- La informacion disponible no incluye resultados de la busqueda web relevante: las consultas realizadas no devolvieron ninguna fuente relacionada con el modelo.

## Enlaces

- Repositorio de cuantizaciones i1 (esta ficha): https://huggingface.co/mradermacher/hybrid-moe-30b-a3b-base-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/hybrid-moe-30b-a3b-base-GGUF
- Modelo base original: https://huggingface.co/geodesic-research/hybrid-moe-30b-a3b-base
- Archivo imatrix: https://huggingface.co/mradermacher/hybrid-moe-30b-a3b-base-i1-GGUF/resolve/main/hybrid-moe-30b-a3b-base.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/hybrid-moe-30b-a3b-base-i1-GGUF/resolve/main/hybrid-moe-30b-a3b-base.i1-Q2_K.gguf
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#hybrid-moe-30b-a3b-base-i1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada en la model card: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que aporta infraestructura al cuantizador: https://www.nethype.de/
