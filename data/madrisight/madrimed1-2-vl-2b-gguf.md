# madrisight/madrimed1.2-VL-2B-GGUF

## Resumen

Madrimed1.2-VL-2B-GGUF es la distribucion cuantizada en formato GGUF del modelo vision-lenguaje medico MadriMed 1.2 (Madrimed1.2-VL-2B), desarrollado por madrisight. Se trata de un modelo compacto de 2.031.739.904 parametros (aproximadamente 2B) construido sobre la arquitectura Qwen3-VL, disenado especificamente para tareas de razonamiento clinico, respuesta visual a preguntas (VQA) medicas y analisis de imagenes biomedicas como radiologia e histopatologia.

El modelo resuelve el problema de desplegar capacidades multimodales medicas en entornos con recursos limitados: al ofrecerse en cuantizaciones que van desde F16 (4,06 GB) hasta Q2_K (833 MiB), permite ejecucion local en hardware de consumo mediante llama.cpp, llama-server, llama-cpp-python y Ollama. Esta orientado a investigacion y educacion, no a diagnostico clinico autonomo.

La relevancia actual radica en la combinacion de un backbone transformer de 28 capas con un proyector multimodal (encoder de vision y fusionador de parches DeepStack, `qwen3vl_merger`) que procesa imagenes a 768 de resolucion, todo bajo licencia Apache 2.0 y con soporte de API compatible con OpenAI. El repositorio GGUF acumula 679 descargas y fue actualizado por ultima vez el 26 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer decoder autoregresivo de 28 capas + proyector multimodal con encoder de vision y DeepStack patch merger `qwen3vl_merger`) |
| Parametros totales | 2.031.739.904 (aproximadamente 2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de llama-server con `-c 8192`) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (proyector de vision en F16 y Q8_0) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Resolucion de imagen | 768 (procesamiento del proyector multimodal) |
| Tamano del repositorio | 19,9 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Qwen3-VL de dos componentes. El backbone de lenguaje es un decoder transformer autoregresivo de 28 capas que gestiona la generacion de texto clinico y el razonamiento. El componente multimodal es un proyector que integra un encoder de vision junto con un fusionador de parches DeepStack (`qwen3vl_merger`), encargado de procesar las imagenes de entrada a una resolucion de 768. Para la inferencia visual en GGUF es obligatorio pasar ambos ficheros: el modelo cuantizado (`-m`) y el proyector de vision (`--mmproj`).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. Los tags del modelo sugieren evaluacion sobre conjuntos de datos medicos como VQA-RAD, SLAKE, MedXpertQA, MedMCQA y PathVQA, pero no se detallan los datos de entrenamiento ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El flag `--image-min-tokens 1024` se recomienda para tareas de grounding clinico, ya que las arquitecturas Qwen-VL requieren asignacion suficiente de tokens para mantener la percepcion de alta resolucion en lesiones sutiles.

## Capacidades

- Generacion de texto clinico y razonamiento medico en ingles.
- Respuesta visual a preguntas (VQA) sobre imagenes medicas.
- Analisis de imagenes de radiologia, patologia e histopatologia.
- Razonamiento clinico orientado a soporte de decision.
- Procesamiento multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- Ejecucion local de baja latencia mediante llama.cpp, llama-server, llama-cpp-python y Ollama.
- Servido mediante API compatible con OpenAI (endpoint `/v1`).
- Soporte de conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Soporte de thinking mode, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de radiografias de torax en investigacion: el modelo puede responder preguntas como si existe evidencia de consolidacion en una radiografia, procesando la imagen a 768 de resolucion con `--image-min-tokens 1024` para mantener el grounding en lesiones sutiles. Adecuado por su naturaleza VQA medica y su bajo coste de inferencia.
- Apoyo educativo en patologia e histopatologia: estudiantes pueden cargar laminas o imagenes histologicas y formular preguntas de interpretacion, usando la cuantizacion Q6_K o Q8_0 para maximizar la fidelidad visual y de razonamiento.
- Prototipado de asistentes clinicos en local: con llama-server y la API compatible con OpenAI, un equipo puede integrar el modelo en una aplicacion de demostracion sin depender de servicios en la nube, usando Q4_K_M (1,21 GB) como configuracion estandar de despliegue.
- Evaluacion comparativa de modelos medicos: investigadores pueden ejecutar el modelo sobre conjuntos como VQA-RAD, SLAKE, MedMCQA o PathVQA para reproducir experimentos de referencia, gracias a las multiples cuantizaciones disponibles que permiten ajustar el equilibrio calidad/recursos.
- Despliegue en entornos con memoria muy limitada: en dispositivos de borde o contenedores restringidos, la variante Q2_K (833 MiB) o Q3_K_S (948 MiB) permite ejecutar inferencia multimodal basica donde otros modelos medicos no cabrian.
- Generacion de descripciones preliminares de imagenes biomedicas para revision humana: el modelo puede producir interpretaciones visuales que un profesional licenciado revisa y verifica, sirviendo como borrador asistido en flujos de investigacion.
- Integracion en pipelines de procesamiento por lotes: mediante llama-cpp-python se puede automatizar el analisis de lotes de imagenes medicas con temperatura 0.0 para respuestas deterministas, usando Q5_K_M (1,37 GB) como equilibrio entre calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los tags del modelo mencionan los conjuntos VQA-RAD, SLAKE, MedXpertQA, MedMCQA y PathVQA, pero no se proporcionan puntuaciones numericas en la model card ni en los metadatos disponibles.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (modelo de lenguaje + proyector de vision):
  - F16: 4,06 GB + 781 MiB (proyector F16) o 421 MiB (proyector Q8_0).
  - Q8_0: 2,01 GB + proyector.
  - Q6_K: 1,55 GB + proyector (configuracion recomendada como punto optimo).
  - Q5_K_M: 1,37 GB + proyector.
  - Q4_K_M: 1,21 GB + proyector (despliegue estandar).
  - Q3_K_M: 0,99 GB + proyector.
  - Q2_K: 833 MiB + proyector (compresion extrema).
- GPU recomendadas: no disponible de forma explicita en la informacion proporcionada. El ejemplo de despliegue usa `-ngl 99`, lo que indica offload completo de capas a GPU cuando hay memoria suficiente.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna puede alojar las cuantizaciones Q4_K_M o inferiores junto con el proyector de vision; las variantes Q6_K y Q8_0 tambien caben en GPUs con 8 GB o mas de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), `llama-server` (API compatible con OpenAI), `llama-cpp-python`, Ollama. Para el modelo base en safetensors, transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Parametros de inferencia recomendados: `--image-min-tokens 1024` para grounding clinico, `-c 8192` de contexto, `temperature=0.0` para respuestas deterministas en los ejemplos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Madrimed1.2-VL-2B-GGUF | 2,03B | 8192 | GGUF | Apache 2.0 | VLM medico compacto, cuantizaciones desde 833 MiB |
| Modelo base Madrimed1.2-VL-2B | 2,03B | no disponible | safetensors | Apache 2.0 | Version sin cuantizar del mismo modelo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan modelos comparables en la informacion disponible |

No se dispone de informacion sobre otros modelos medicos vision-lenguaje comparables en los datos proporcionados, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigacion y uso educativo: no esta certificado para toma de decisiones diagnosticas clinicas autonomas.
- Todas las interpretaciones e inferencias visuales generadas deben ser revisadas y verificadas de forma independiente por un profesional medico licenciado.
- Riesgo de alucinacion: no se documentan tasas especificas, pero al ser un modelo de 2B orientado a dominio medico, la generacion de hallazgos inexistentes es un riesgo relevante en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitacion idiomatica: el modelo solo soporta ingles (`en`), lo que restringe su uso en entornos clinicos en castellano u otros idiomas.
- Limitacion de contexto: la ventana configurada en los ejemplos es de 8192 tokens; no se documenta soporte para contextos mayores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la propia model card restringe el uso a investigacion y educacion y advierte contra el uso diagnostico autonomo; conviene verificar el cumplimiento normativo sanitario antes de cualquier despliegue.
- Requiere obligatoriamente el fichero del proyector de vision (`--mmproj`) para inferencia multimodal; sin el, el modelo solo procesa texto.
- El flag `--image-min-tokens 1024` es critico para el grounding clinico; omitirlo puede degradar la percepcion de lesiones sutiles.
- El tamano del repositorio (19,9 GB) implica descargar todas las variantes si se clona completo; conviene descargar solo los ficheros necesarios.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/madrisight/madrimed1.2-VL-2B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/madrisight/madrimed1.2-VL-2B
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
