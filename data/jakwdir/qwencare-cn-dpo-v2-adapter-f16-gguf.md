# jakwdir/QwenCare-CN-DPO-v2-adapter-F16-GGUF

## Resumen

`jakwdir/QwenCare-CN-DPO-v2-adapter-F16-GGUF` es la version en formato GGUF (precision F16) del adaptador LoRA `kostelliwhite/QwenCare-CN-DPO-v2-adapter`, un ajuste fino por preferencias (DPO, segunda iteracion) sobre el modelo chino Qwen3-8B orientado a apoyo emocional y conversacion de acompanamiento psicologico en chino. No es un modelo completo: es un adaptador de bajo rango de 43.646.976 parametros que debe cargarse junto al modelo base para funcionar, y este repositorio concreto solo contiene los pesos del adaptador convertidos a GGUF.

La relevancia practica del artefacto es de infraestructura: permite aplicar el adaptador directamente en `llama.cpp` (`llama-cli` / `llama-server`) mediante el flag `--lora`, sin necesidad de fusionar pesos ni de montar un stack de PEFT/PyTorch. Esto habilita probar y desplegar el ajuste en entornos ligeros, CPU o GPU de consumo, algo que el adaptador original en safetensors no facilita de forma directa.

El proyecto de origen (QwenCare-CN) es un trabajo de curso (UCAS) que cubre el pipeline completo: procesamiento de datos de apoyo psicologico en chino, ajuste de Qwen3-8B, alineamiento por preferencias, evaluacion automatica y demo local con vLLM y Gradio. Se trata, por tanto, de un artefacto de investigacion y experimentacion, no de un producto clinico validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso de la familia Qwen3 (modelo base Qwen3-8B) |
| Parametros totales | 43.646.976 (solo el adaptador; el modelo base no esta incluido en este repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del GGUF del modelo base que se use) |
| Tipos de cuantizacion | F16 (unico fichero publicado en este repositorio); el modelo base admite las cuantizaciones habituales de llama.cpp, no detalladas aqui |
| Idiomas soportados | chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); el adaptador original esta en safetensors |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado sobre Qwen3-8B, es decir, matrices de bajo rango inyectadas en las capas del transformer base que se aplican en tiempo de inferencia sin modificar los pesos originales. El ajuste reportado en el proyecto de origen combina una fase supervisada sobre datos de apoyo psicologico en chino y una fase de alineamiento por preferencias con DPO, de la que esta es la segunda version (DPO v2). El repositorio que nos ocupa no aporta informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni los hiperparametros de DPO; esos detalles corresponden al repositorio del adaptador original.

La contribucion tecnica de este repositorio es la conversion del adaptador a GGUF mediante el espacio `gguf-my-lora` de ggml.ai, lo que hace que los pesos sean cargables por `llama.cpp`. La conversion a F16 preserva la precision del adaptador original, a costa de un fichero mayor que una conversion cuantizada, y mantiene el rango bajo intacto para su aplicacion sobre el GGUF del modelo base. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en chino con un estilo orientado a apoyo emocional y escucha activa.
- Acompanamiento en conversaciones multi-turno de caracter psicologico no clinico (validacion emocional, reformulacion, sugerencias de afrontamiento).
- Respuestas con tono empatico y "sostenedor", fruto del alineamiento DPO hacia respuestas preferidas por anotadores.
- Capacidades heredadas del modelo base Qwen3-8B (razonamiento, codigo, matematicas, multilingueismo), aunque el adaptador no las refuerza y puede degradarlas en el dominio del ajuste.
- Integracion con `llama.cpp` mediante `--lora`, lo que permite servir el adaptador en el mismo proceso que el modelo base.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en este adaptador.

## Casos de uso

- Prototipado de un chatbot de apoyo emocional en chino: cargando el GGUF de Qwen3-8B con `llama-server --lora` se obtiene un endpoint compatible con la API de OpenAI para probar el tono del ajuste sin infraestructura de PEFT.
- Despliegue en local o en el borde: al ser un adaptador de ~0,1 GB aplicable sobre un GGUF cuantizado del base, se puede ejecutar en un portatil o en una maquina sin GPU dedicada usando llama.cpp, algo inviable con el adaptador en safetensors y un stack PyTorch completo.
- Investigacion sobre alineamiento por preferencias: permite comparar de forma aislada el efecto de DPO v2 frente al modelo base sin reentrenar, manteniendo el resto de variables constantes.
- Evaluacion de calidad conversacional en chino: util para medir metricas de diversidad (distinct-1/2), longitud de respuesta y exploracion en un pipeline de evaluacion automatica o con anotadores.
- Base para experimentos de fusion o mezcla de adaptadores: al estar en GGUF, se puede combinar con otros LoRA del ecosistema llama.cpp para estudiar interacciones entre dominios.
- Docencia y reproducibilidad: el pipeline QwenCare-CN documenta datos, entrenamiento, DPO, evaluacion y demo, por lo que el adaptador sirve como material de practicas para cursos de ajuste fino y alineamiento.
- Filtrado previo de conversaciones: uso como generador de respuestas candidatas que luego se revisan o se filtran con un clasificador de seguridad antes de llegar al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones clinicas o de seguridad). El unico dato cualitativo documentado en el proyecto de origen es que la version DPO v2 presenta valores de distinct-1 y distinct-2 inferiores al baseline, y que no se observo una mejora clara en `avg_exploration`: el modelo tiende a respuestas mas "de apoyo" y menos exploratorias. Tambien se indica que la validacion estable con vLLM y Gradio se hizo sobre el modelo base y que la serving del adaptador final quedaba pendiente de reforzar.

## Requisitos de hardware

- Espacio en disco para el adaptador: ~0,1 GB (repositorio completo, fichero GGUF F16).
- VRAM para el modelo base Qwen3-8B: aproximadamente 16-17 GB en FP16/BF16, unos 9-10 GB en Q8_0 y unos 5-6 GB en Q4_K_M, sin contar la cache KV.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantizaciones de 8 bits.
- GPU de consumo: si cabe en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion Q4, en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB). En CPU, un Q4_K_M de 8B es viable con 16 GB de RAM.
- Opciones de despliegue: `llama-cli` y `llama-server` con `--lora` (soporte nativo de este repositorio); el adaptador original en safetensors se sirve con vLLM o TGI junto al base, aunque el proyecto indica que esa ruta de serving del adaptador final no estaba cerrada.
- Latencia y throughput: no disponibles. Dependen por completo del GGUF del base, de la cuantizacion y del hardware; el adaptador en si anade un coste marginal porque se aplica como delta sobre las matrices existentes.

## Comparativa con modelos similares

| Artefacto | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jakwdir/QwenCare-CN-DPO-v2-adapter-F16-GGUF (este) | 43,6 M (adaptador LoRA) | GGUF F16 | no disponible | apache-2.0 | HuggingFace, listo para llama.cpp |
| kostelliwhite/QwenCare-CN-DPO-v2-adapter (original) | 43,6 M (adaptador LoRA) | safetensors (PEFT) | no disponible | apache-2.0 | HuggingFace, requiere transformers/PEFT o vLLM |
| Qwen3-8B (modelo base, sin adaptador) | ~8 B | safetensors / GGUF | no disponible en esta ficha | no disponible en la informacion proporcionada | HuggingFace, ampliamente soportado |

No se dispone de datos para comparar con otros adaptadores de apoyo emocional en chino ni con modelos especializados equivalentes; esta comparativa se limita a las tres variantes del mismo linaje.

## Limitaciones y advertencias

- No es un modelo completo: sin el GGUF del modelo base correcto (Qwen3-8B) el adaptador no funciona, y una discrepancia de version o de tokenizador puede degradar la calidad o romper la carga.
- Uso no clinico: es un proyecto de curso orientado a investigacion. No ha pasado validacion clinica, ni evaluacion de seguridad, ni revision por profesionales de salud mental; no debe usarse como sustituto de atencion psicologica.
- Riesgo de alucinacion y de consejo inadecuado: en un dominio sensible, una respuesta erronea o demasiado segura de si misma puede causar dano. Se recomienda filtrado por reglas o clasificadores y derivacion a recursos humanos.
- Idioma unico: solo se documenta chino (zh). El comportamiento en castellano u otras lenguas no esta evaluado y previsiblemente sera deficiente.
- Sesgos: los datos de apoyo psicologico en chino pueden arrastrar sesgos culturales, de genero y de estilo terapeutico; no se documenta ninguna mitigacion.
- Perdida de diversidad: el propio proyecto reporta distinct-1/2 por debajo del baseline y sin mejora en exploracion, lo que puede producir respuestas repetitivas o excesivamente complacientes.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, seguridad ni robustez frente al modelo base.
- Licencia: apache-2.0 permite uso comercial del adaptador, pero el uso del modelo base queda sujeto a la licencia de Qwen3, que debe verificarse por separado.
- Estado del artefacto: 0 descargas y 1 like en el momento de la consulta, creado en octubre de 2026; es un artefacto de investigacion sin mantenimiento demostrado ni soporte del autor original.

## Enlaces

- Repositorio del adaptador en GGUF: https://huggingface.co/jakwdir/QwenCare-CN-DPO-v2-adapter-F16-GGUF
- Adaptador original en safetensors: https://huggingface.co/kostelliwhite/QwenCare-CN-DPO-v2-adapter
- Ficheros del adaptador original: https://huggingface.co/kostelliwhite/QwenCare-CN-DPO-v2-adapter/tree/main
- Repositorio del proyecto QwenCare-CN: https://github.com/kostelliwhitee/QwenCare-CN
- Documento de entrega final del proyecto: https://github.com/kostelliwhitee/QwenCare-CN/blob/main/docs/final_delivery.md
- Espacio de conversion GGUF-my-lora: https://huggingface.co/spaces/ggml-org/gguf-my-lora
- Documentacion del servidor de llama.cpp (uso de LoRA): https://github.com/ggerganov/llama.cpp/blob/master/examples/server/README.md
- Ficha del adaptador en FriendliAI: https://friendli.ai/models/kostelliwhite/QwenCare-CN-DPO-v2-adapter
