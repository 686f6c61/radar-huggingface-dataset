# mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF

## Resumen

El modelo `Qwen3.5-4B-Abliterated-Full-i1-GGUF` es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo base `Qwen3.5-4B-Abliterated-Full`, publicado por el usuario panzy1222. Se trata de una variante "abliterated" (tambien llamada "uncensored") de un modelo de la familia Qwen 3.5, en la que presumiblemente se ha aplicado una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para reducir los mecanismos de negativa del modelo. El autor de la cuantizacion no aporta informacion sobre el proceso de ablacion ni sobre el entrenamiento original.

El repositorio contiene unicamente pesos cuantizados en formato GGUF, generados con cuantizacion ponderada por matriz de importancia (imatrix), segun se desprende de las etiquetas internas del README. La lista de cuantizaciones disponibles es amplia e incluye desde IQ1_S e IQ2_XXS hasta Q6_K, pasando por Q4_K_M, Q5_K_M e IQ4_XS, lo que permite desplegar el modelo en hardware muy modesto.

La relevancia de esta ficha es limitada por la escasez de informacion verificable: no se publican datos sobre arquitectura, contexto, licencia, idiomas ni benchmarks. Ademas, el campo de parametros totales del repositorio (1.550.888) es inconsistente con el nombre del modelo (4B), lo que sugiere que ese dato corresponde a tensores auxiliares o a un recuento parcial y no al numero real de parametros del modelo. Cualquier uso en produccion deberia tratar esta informacion como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, familia Qwen 3.5) |
| Parametros totales | no disponible de forma fiable; el nombre indica 4B, mientras que el campo de safetensors del repo indica 1.550.888 (dato inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El nombre sugiere un transformer denso de la familia Qwen 3.5 con aproximadamente 4.000 millones de parametros, pero el autor de la cuantizacion no documenta ni el numero de capas, ni la dimension oculta, ni el mecanismo de atencion, ni si emplea attention lineal o decodificacion especulativa. El proceso de "abliteracion" aplicado por panzy1222 tampoco esta documentado en la informacion disponible: no se especifica si se elimino una direccion de rechazo mediante proyeccion ortogonal, si se uso un conjunto de pares de prompts, ni que impacto tuvo sobre las capacidades del modelo.

Respecto al entrenamiento original, no hay datos sobre volumen de tokens, composicion del corpus, fases de RLHF o DPO, ni sobre el tokenizador o el vocabulario. La unica informacion tecnica verificable es el proceso de cuantizacion: el autor ha generado las cuantizaciones con imatrix ponderada, lo que típicamente mejora la calidad de los formatos de baja precision (IQ1, IQ2, IQ3) a costa de un tiempo de calculo mayor durante la conversion. Las etiquetas internas del README indican `convert_type: hf` y `quantize_version: 2`, sin mas detalle.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperada por ser un modelo de la familia Qwen, aunque no verificada en la informacion disponible.
- Razonamiento y matematicas: no disponible; no se aportan evidencias ni benchmarks.
- Generacion de codigo: no disponible; no se aportan evidencias ni benchmarks.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta relleno en el repo).
- Modo thinking o razonamiento extendido: no disponible.
- Vision o audio: no disponible; el README no incluye la etiqueta `skip_mmproj`, pero tampoco indica proyector multimodal, por lo que se asume que es solo texto sin confirmacion.
- Efecto de la abliteracion: por definicion de la tecnica, se espera una reduccion de las negativas del modelo ante ciertas peticiones, pero el alcance exacto y las capacidades preservadas no estan documentados.

## Casos de uso

- Experimentacion con tecnicas de abliteracion: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta la distribucion de respuestas en un modelo de 4B, comparando con el modelo base original. Es adecuado porque existen cuantizaciones de alta y baja precision que permiten reproducir el comportamiento en distintos niveles de perdida.
- Despliegue en hardware de gama baja: las cuantizaciones IQ2_XXS e IQ1_S permiten ejecutar el modelo en equipos con muy poca memoria, lo que resulta util para prototipos y demos locales sin GPU dedicada.
- Investigacion sobre sesgos y seguridad: al ser una variante "uncensored", sirve como caso de estudio para evaluar la eficacia de los filtros de seguridad y para medir la tasa de respuestas no alineadas frente al modelo original.
- Generacion de texto creativo sin restricciones tematicas: en entornos controlados de escritura de ficcion o guiones, la reduccion de negativas puede facilitar la exploracion de temas sensibles, siempre con revision humana posterior.
- Evaluacion comparativa de cuantizaciones: el amplio catalogo de formatos (desde Q2_K hasta Q6_K) permite medir el impacto de la cuantizacion en la coherencia y en la tasa de alucinacion sobre un mismo modelo, usando el formato Q6_K como referencia de alta fidelidad.
- Pruebas de integracion con llama.cpp y Ollama: los ficheros GGUF son directamente compatibles con estos motores, lo que facilita validar pipelines de inferencia local y medir latencia por token en CPU o GPU consumer.
- Analisis de robustez frente a jailbreaks: dado que el modelo ha sido modificado para reducir rechazos, puede emplearse como linea base en estudios de red teaming para comparar la resistencia de variantes abliterated frente a modelos alineados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y no se aportan comparaciones con el modelo base sin abliterar. No es posible, por tanto, cuantificar el impacto de la ablacion ni de las distintas cuantizaciones sobre el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta, ya que no se confirma el numero real de parametros. Para un modelo denso de 4B, las estimaciones tipicas en GGUF serian aproximadamente 1,5-2 GB en IQ1/IQ2, 2,5-3 GB en Q4_K_M y 3,5-4,5 GB en Q6_K, pero estas cifras son orientativas y no estan verificadas en la informacion proporcionada.
- GPU recomendadas: no disponible. Para un modelo de este tamano, una RTX 3060 de 12 GB o superior seria suficiente en la mayoria de cuantizaciones, pero no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si en la mayoria de cuantizaciones (Q4_K_M o inferior) en tarjetas con 6-8 GB de VRAM, aunque no verificable con los datos disponibles.
- Opciones de despliegue: llama.cpp, Ollama y cualquier motor compatible con GGUF (por ejemplo, LM Studio o KoboldCpp). No se confirma compatibilidad con vLLM ni con TGI, que requieren normalmente pesos en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Abliterated-Full-i1-GGUF (este) | no disponible (nombre indica 4B) | no disponible | no disponible | GGUF (multiples cuantizaciones) | Variante abliterated, sin benchmarks publicados |
| Qwen3.5-4B-Abliterated-Full (base de este repo) | no disponible (nombre indica 4B) | no disponible | no disponible | safetensors | Modelo original abliterated de panzy1222 |
| Qwen3.5-4B (modelo oficial) | no disponible en esta ficha | no disponible | no disponible | safetensors, GGUF | Modelo de referencia sin ablacion; datos no verificados aqui |
| Otras variantes GGUF de modelos 4B de la familia Qwen | no disponible | no disponible | no disponible | GGUF | Comparacion no disponible por falta de datos |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. Los datos de los modelos de referencia no estan incluidos en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio, lo que impide determinar si el uso comercial esta permitido. No debe usarse en produccion sin verificar la licencia del modelo base original.
- El modelo ha sido sometido a abliteracion, lo que reduce los mecanismos de rechazo y aumenta el riesgo de generar contenido inapropiado, ofensivo o inseguro. Requiere filtros externos y supervision humana.
- No hay benchmarks publicados, por lo que no se puede evaluar la degradacion de capacidades causada por la ablacion ni por las cuantizaciones de baja precision (IQ1, IQ2).
- El dato de parametros totales del repositorio (1.550.888) es inconsistente con el nombre del modelo (4B), lo que genera incertidumbre sobre el tamano real y, por tanto, sobre los requisitos de memoria.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; en cuantizaciones de 1-2 bits es esperable un aumento de incoherencias y errores factuales.
- Idiomas soportados no documentados; el comportamiento multilingue no puede asumirse.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Al ser una cuantizacion de un modelo de terceros, no hay garantia de que los pesos hayan sido verificados contra el modelo original; conviene comprobar la integridad de los ficheros antes de su uso.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Qwen3.5-4B-Abliterated-Full-i1-GGUF
- Modelo base abliterated (panzy1222): https://huggingface.co/panzy1222/Qwen3.5-4B-Abliterated-Full
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
