# mradermacher/AEON-27B-RP-cn-abliterated-i1-GGUF

## Resumen

AEON-27B-RP-cn-abliterated-i1-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo AEON-27B-RP-cn-abliterated, publicado por el usuario mradermacher en Hugging Face. Se trata de una conversión de pesos orientada a inferencia local eficiente, generada con el flujo de cuantización de llama.cpp a partir del modelo original alojado en el repositorio de don0ox1. El nombre indica un modelo de rol (RP, roleplay) de 27.000 millones de parámetros, con ajuste para chino (cn) y sometido a un proceso de "abliteration" (eliminación de rechazos de seguridad).

El interés de esta ficha es doble: por un lado, documenta una familia de cuantizaciones GGUF con un espectro amplio de niveles (desde IQ1_S hasta Q6_K), lo que permite desplegar el modelo en hardware muy diverso; por otro, advierte de que la información pública disponible es extremadamente escasa. El autor de la cuantización no aporta model card descriptiva, licencia, idiomas declarados ni resultados de evaluación, y el repositorio figura con un tamaño de 0.0 GB y cero descargas en el momento de la consulta.

La relevancia práctica es limitada pero concreta: para quien quiera ejecutar un modelo de rol de gran tamaño en local con llama.cpp, esta colección ofrece los ficheros precomputados con matrices de importancia (imatrix), que suelen mejorar la calidad de las cuantizaciones de baja precisión. No obstante, la ausencia de documentación y de licencia clara obliga a tratar el artefacto con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, no confirmado) |
| Parametros totales | 27B según el nombre del modelo; el dato real de safetensors del repo GGUF es 5.805.136 (corresponde a tensores auxiliares, no al modelo completo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL), Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponibles (el sufijo "cn" sugiere ajuste para chino) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de pesos en formato HF/safetensors) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. El nombre "AEON-27B-RP-cn-abliterated" sugiere un modelo denso de aproximadamente 27.000 millones de parámetros, afinado para roleplay y para chino, y posteriormente sometido a abliteration, una técnica que modifica los pesos para eliminar la dirección de rechazo aprendida durante el alineamiento. No obstante, ninguno de estos extremos está documentado en la información disponible.

Respecto al proceso de cuantización, la model card incluye metadatos del flujo de conversión: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`, y una lista explícita de cuantizaciones generadas. El autor indica que se trata de cuantizaciones "weighted/imatrix", es decir, calculadas con una matriz de importancia derivada de un corpus de calibración, lo que típicamente reduce la pérdida de calidad en los niveles bajos (IQ1, IQ2, Q2_K). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y de rol, según el sufijo "RP" del nombre.
- Presunto soporte de chino, según el sufijo "cn", aunque no está confirmado ni cuantificado.
- Comportamiento sin rechazos de seguridad por el proceso de abliteration, lo que implica que puede producir contenido que otros modelos alineados rechazarían.
- No hay información sobre tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- No hay información sobre capacidades de código o matemáticas.

## Casos de uso

- Roleplay y narrativa interactiva en local: el modelo está etiquetado como RP y las cuantizaciones GGUF permiten ejecutarlo con llama.cpp en estaciones de trabajo sin GPU de datacenter, manteniendo conversaciones multi-turno con un modelo de 27B.
- Experimentación con modelos sin alineamiento: útil en investigación sobre seguridad y comportamiento de modelos abliterated, comparando respuestas frente a la versión alineada.
- Procesamiento de texto en chino en entornos sin conexión: si se confirma el soporte de chino, podría emplearse para generación y reescritura de texto en despliegues air-gapped.
- Evaluación de cuantizaciones: la colección cubre desde IQ1_S hasta Q6_K, lo que permite medir empíricamente la degradación de calidad por nivel de cuantización sobre un mismo modelo base.
- Prototipado de asistentes conversacionales con presupuesto de VRAM ajustado: las variantes Q3_K_M o Q4_K_M permiten probar un 27B en GPUs de consumo antes de decidir un despliegue mayor.
- Generación creativa asistida (ficción, guiones, diálogos): el ajuste de rol y la ausencia de rechazos facilitan la producción de diálogo sin fricción, siempre que el operador aplique sus propias salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada por tamaño de pesos, sin contar KV cache): IQ1_S ~7-8 GB; IQ2_M ~9-10 GB; Q3_K_M ~13-14 GB; Q4_K_M ~16-17 GB; Q5_K_M ~19-20 GB; Q6_K ~22-23 GB.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; A100 40/80 GB o H100 para Q6_K con contexto largo o para servir varias peticiones.
- Cabe en GPU de consumo: sí, las variantes IQ1 a Q4_K_M caben en GPUs de 12-24 GB; las variantes Q5 y Q6 requieren 24 GB o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python. vLLM y TGI no son la vía natural para GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware, del nivel de cuantización y del tamaño de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AEON-27B-RP-cn-abliterated-i1-GGUF | 27B (según nombre) | no disponible | GGUF | no disponible | Hugging Face |
| Modelos RP de ~27B en GGUF (genéricos) | ~27B | variable | GGUF | variable | Hugging Face |
| Modelos abliterated de ~30B | ~30B | variable | safetensors/GGUF | variable | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones verificadas de alternativas concretas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no hay información sobre entrenamiento, datos, evaluación ni comportamiento esperado.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base antes de cualquier despliegue.
- El proceso de abliteration elimina los rechazos de seguridad, lo que incrementa el riesgo de contenido dañino, sesgado o ilegal; requiere filtros y políticas propias.
- Riesgo elevado de alucinación, como en cualquier modelo de lenguaje, agravado por la falta de benchmarks que permitan calibrar su fiabilidad.
- El dato de parámetros totales del repo (5.805.136) no corresponde al modelo completo y no debe interpretarse como el tamaño real.
- El repositorio figura con 0.0 GB de tamaño y cero descargas, lo que sugiere una publicación reciente o incompleta; conviene verificar la integridad de los ficheros antes de usarlos.
- Soporte de idiomas no confirmado; el uso en castellano no está garantizado.
- Longitud de contexto desconocida; no se debe asumir una ventana amplia para tareas de contexto largo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AEON-27B-RP-cn-abliterated-i1-GGUF
- Modelo base: https://huggingface.co/don0ox1/AEON-27B-RP-cn-abliterated
