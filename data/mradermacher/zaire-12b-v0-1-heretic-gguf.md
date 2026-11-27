# mradermacher/Zaire-12B-v0.1-heretic-GGUF

## Resumen

Zaire-12B-v0.1-heretic-GGUF es una cuantizacion estatica del modelo Zaire-12B-v0.1-heretic, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversion a formato GGUF pensada para inferencia local con llama.cpp y herramientas compatibles (Ollama, LM Studio, koboldcpp), generada a partir de los pesos originales alojados en el repositorio sh0ck0r/Zaire-12B-v0.1-heretic. El repositorio incluye un conjunto amplio de cuantizaciones (F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS).

La informacion disponible es muy limitada: la model card original del modelo base no esta incluida, no se documentan la licencia, los idiomas soportados ni el pipeline de la tarea, y el repositorio no registra descargas ni interacciones. El dato de parametros reportado en los metadatos de safetensors (52.379.904) es inconsistente con el nombre del modelo (12B), por lo que no debe tomarse como referencia fiable del tamano real.

Por tanto, esta ficha describe lo que se puede verificar (formato, cuantizaciones disponibles y origen de la conversion) y marca explicitamente como "no disponible" todo aquello que no aparece en la informacion proporcionada. No se han publicado resultados de benchmarks ni detalles de arquitectura o entrenamiento en la informacion accesible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 12B; el metadato safetensors indica 52.379.904, dato inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en formato HF (convert_type: hf) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base (tipo de transformer, atencion, posible uso de MoE o arquitecturas hibridas), ni sobre el volumen o composicion de los datos de entrenamiento, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. El sufijo "heretic" en el nombre es una convencion habitual en la comunidad para variantes con ajustes de alineacion reducidos, pero no se documenta en la informacion proporcionada que se haya aplicado ese proceso ni con que metodologia.

Lo unico verificable es el proceso de cuantizacion: los metadatos de la model card indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos en formato Hugging Face a GGUF con cuantizacion estatica de tensores. No se indica si se conserva el tokenizador original ni si se ha incluido un tensor mmproj (proyeccion multimodal); el campo `skip_mmproj` aparece vacio, por lo que no hay evidencia de soporte de vision.

## Capacidades

- Generacion de texto en formato GGUF: el modelo puede ejecutarse con llama.cpp y derivados, pero no se documentan capacidades especificas mas alla de la generacion autoregresiva estandar.
- Razonamiento, codigo y matematicas: no disponible (no se documenta en la informacion proporcionada).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible; no se observa tensor mmproj en los metadatos.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU dedicada: al distribuirse en cuantizaciones Q2_K a Q5_K_M, el modelo puede ejecutarse en CPU con llama.cpp, lo que permite experimentar con el modelo en equipos de gama media sin infraestructura cloud.
- Pruebas de concepto en entornos de desarrollo: util para evaluar el comportamiento del modelo base (Zaire-12B-v0.1-heretic) antes de decidir si se adopta en un pipeline, dado el bajo coste de descarga del repositorio (0,3 GB en total).
- Despliegue en Ollama o LM Studio: las cuantizaciones GGUF son directamente importables en estas herramientas, lo que facilita prototipado rapido de asistentes conversacionales locales.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir el impacto de la cuantizacion en calidad y velocidad sobre el mismo modelo base en tareas de generacion de texto.
- Experimentacion en investigacion sobre alineacion: si el sufijo "heretic" implica una reduccion de rechazos, el modelo podria usarse en estudios sobre comportamiento de modelos desalineados, siempre que se verifique la licencia y las condiciones de uso del modelo base.
- Generacion de texto offline en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles, sujeto a validar la calidad del modelo en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision, ya que el numero real de parametros no esta confirmado. Como referencia orientativa, un modelo de 12B en Q4_K_M ocupa aproximadamente 7-8 GB, en Q8_0 unos 13 GB y en F16 unos 24 GB; estas cifras son estimaciones genericas para ese orden de magnitud, no datos verificados del modelo.
- GPU recomendadas: no disponible. Para un modelo de ~12B en cuantizaciones Q4/Q5, una RTX 3060 de 12 GB o superior seria suficiente en teoria; en F16 se requeriria una A100 o H100 de 40/80 GB. Estas recomendaciones son genericas y no estan confirmadas para este modelo concreto.
- Compatibilidad con GPU de consumo: probable en cuantizaciones Q2_K a Q5_K_M para GPUs con 8-12 GB de VRAM, condicionado al tamano real del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que requeririan los pesos originales en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre el modelo base (Zaire-12B-v0.1-heretic) ni de sus caracteristicas tecnicas, por lo que no es posible establecer una comparacion rigurosa con alternativas de la misma categoria. La unica comparacion posible es con el propio modelo base en formato Hugging Face, del que solo se conoce la URL de origen.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible consultar la licencia del modelo base (sh0ck0r/Zaire-12B-v0.1-heretic) antes de cualquier despliegue en produccion.
- Inconsistencia en el numero de parametros: el metadato de safetensors (52.379.904) no cuadra con el nombre "12B"; conviene verificar el tamano real antes de planificar recursos de hardware.
- Sin model card detallada: no hay informacion sobre sesgos, datos de entrenamiento, idiomas ni comportamientos conocidos, lo que impide evaluar riesgos de alucinacion o sesgo de forma fundamentada.
- Posible reduccion de alineacion: el sufijo "heretic" sugiere una variante con filtros de seguridad atenuados, lo que incrementa el riesgo de generar contenido inapropiado o danino; no se ha confirmado ni documentado este extremo.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que existan validaciones externas o reportes de errores.
- Sin garantias de calidad de las cuantizaciones: al ser cuantizaciones estaticas generadas automaticamente, las variantes mas agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de salida.
- Sin soporte multimodal confirmado: no se observa tensor mmproj, por lo que no debe asumirse capacidad de vision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Zaire-12B-v0.1-heretic-GGUF
- Modelo base: https://huggingface.co/sh0ck0r/Zaire-12B-v0.1-heretic
