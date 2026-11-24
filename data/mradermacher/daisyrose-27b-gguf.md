# mradermacher/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es la versión cuantizada en formato GGUF del modelo RadixArk/DaisyRose-27B, publicada por el usuario mradermacher. Se trata de un modelo de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado a conversación y entrenado mediante refuerzo (reinforcement learning), según la etiqueta de pipeline declarada. El autor de la cuantización ofrece una batería completa de variantes GGUF (desde Q2_K hasta Q8_0) más los suplementos multimodales mmproj, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama.

La relevancia de esta ficha radica en que el modelo original no está pensado para inferencia directa en entornos con recursos limitados: con pesos en precisión completa supera los 54 GB (el repo de la cuantización ocupa 192,3 GB al incluir todas las variantes). Las cuantizaciones de mradermacher permiten desplegarlo desde ~11,3 GB (Q2_K) hasta ~29,1 GB (Q8_0), cubriendo desde GPUs de gama media hasta estaciones de trabajo con 24-48 GB de VRAM.

El modelo base pertenece a la familia etiquetada como "qwen3.8" en los tags del autor, lo que sugiere una arquitectura derivada de Qwen con 27B de parámetros, licencia Apache 2.0 y capacidades multimodales (presencia de ficheros mmproj). No obstante, la model card no proporciona detalles sobre arquitectura interna, longitud de contexto ni datos de entrenamiento, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de la familia Qwen (tag "qwen3.8"); detalles internos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base RadixArk/DaisyRose-27B. Los tags del repositorio indican "qwen3.8", lo que apunta a una arquitectura de tipo transformer derivada de la familia Qwen, con 27,3 mil millones de parámetros totales. La etiqueta de pipeline "reinforcement-learning" sugiere que el modelo fue ajustado mediante técnicas de aprendizaje por refuerzo (posiblemente RLHF o variantes como DPO/GRPO), aunque no se especifica el algoritmo, el volumen de datos ni la composición del dataset de entrenamiento.

La cuantización la realiza mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estáticas a partir de los pesos en formato Hugging Face. Además de las variantes de texto, se incluyen dos suplementos multimodales (mmproj-Q8_0 y mmproj-f16), lo que confirma que el modelo base incorpora capacidad de visión. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno (tag "conversational").
- Capacidad multimodal: la presencia de ficheros mmproj-Q8_0 y mmproj-f16 indica soporte de entrada de imágenes en el modelo base.
- Entrenamiento mediante refuerzo, lo que en principio favorece el alineamiento con instrucciones y la calidad de respuesta, aunque no se documentan evaluaciones.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card; no se documentan otros idiomas.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Asistente conversacional local en inglés: el modelo puede desplegarse con llama.cpp u Ollama usando la cuantización Q4_K_M (17,1 GB) para gestionar conversaciones multi-turno en una estación de trabajo con 24 GB de VRAM, sin depender de servicios en la nube.
- Procesamiento de documentos con imágenes: gracias a los suplementos mmproj, puede emplearse para tareas de descripción de imágenes o respuesta a preguntas sobre capturas y figuras, cargando el mmproj-f16 junto con una cuantización Q5_K_M (19,7 GB) en una RTX 4090.
- Prototipado de aplicaciones de IA en investigación: investigadores que necesiten un modelo de ~27B con licencia Apache 2.0 pueden usar la variante Q8_0 (29,1 GB) en una A100 40 GB para obtener la máxima fidelidad respecto al modelo original en experimentos reproducibles.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de texto, lo que permite medir el impacto de la cuantización en perplejidad y calidad de respuesta usando el mismo modelo base, útil para calibrar pipelines de despliegue.
- Despliegue en entornos con poca VRAM: la variante Q2_K (11,3 GB) o Q3_K_S (12,4 GB) permite ejecutar el modelo en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) con pérdida de calidad controlada, adecuado para demos y pruebas internas.
- Generación de texto en pipelines offline: al ser GGUF, puede integrarse en herramientas de escritorio o servidores sin GPU dedicada mediante llama.cpp en CPU, usando Q4_K_S (15,9 GB) con RAM suficiente, para tareas de resumen o redacción por lotes.
- Fine-tuning posterior o destilación: la disponibilidad del modelo base en safetensors con licencia Apache 2.0 permite usarlo como punto de partida para ajustes específicos de dominio antes de cuantizar de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,3 GB
  - Q3_K_S: ~12,4 GB
  - Q3_K_M: ~13,8 GB
  - Q3_K_L: ~15,0 GB
  - IQ4_XS: ~15,8 GB
  - Q4_K_S: ~15,9 GB
  - Q4_K_M: ~17,1 GB
  - Q5_K_S: ~19,1 GB
  - Q5_K_M: ~19,7 GB
  - Q6_K: ~22,5 GB
  - Q8_0: ~29,1 GB
  - Suplemento multimodal: mmproj-Q8_0 ~0,7 GB, mmproj-f16 ~1,0 GB
- GPU recomendadas:
  - Q4_K_M / Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB).
  - Q6_K / Q8_0: A100 40 GB, L40S (48 GB), H100.
  - Q2_K / Q3_K_S: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX A4000 (16 GB).
- Cabe en GPU de consumo: sí, desde la RTX 3060 12 GB (con Q2_K/Q3_K_S) hasta la RTX 4090 24 GB (con Q5_K_M o Q6_K, dejando margen para contexto).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero las cuantizaciones GGUF están pensadas para llama.cpp y derivados.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización y la longitud de contexto, que no se documenta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-GGUF | ~27,3 B | no disponible | Apache 2.0 | GGUF | Multimodal (mmproj), entrenado con RL, solo inglés documentado |
| Qwen2.5-32B-Instruct (referencia de familia) | ~32,5 B | 128K (según documentación pública de Qwen) | Apache 2.0 | safetensors, GGUF | No es el mismo modelo; se cita como referencia de la familia Qwen |
| Gemma-2-27B-it | ~27 B | 8K | Gemma license | safetensors, GGUF | Tamaño comparable, licencia más restrictiva |
| Mistral-Small-24B-Instruct | ~24 B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva |

Nota: los datos de los modelos comparables provienen de conocimiento general de la familia y no de la información proporcionada en esta ficha; se incluyen solo como orientación y deben verificarse en sus respectivas model cards. No se dispone de benchmarks de DaisyRose-27B para comparar rendimiento.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, datos de entrenamiento ni procesos de evaluación; no es posible estimar el riesgo de sesgo sin información adicional.
- Riesgo de alucinación inherente a los modelos generativos de 27B; al no haber benchmarks publicados, no se puede cuantificar su fiabilidad factual.
- Idiomas soportados: solo inglés según la model card; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta; conviene probar empíricamente el límite antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base RadixArk/DaisyRose-27B; verificar el fichero LICENSE del repositorio original por si hubiera condiciones adicionales.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- El pipeline declarado es "reinforcement-learning", no "text-generation"; algunos frameworks pueden requerir ajuste manual de la configuración.
- El repo ocupa 192,3 GB por incluir todas las variantes; descargar solo el fichero GGUF necesario para evitar consumo innecesario de disco.
- No se documenta soporte de tool calling ni de agentes; no asumir estas capacidades sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/DaisyRose-27B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#DaisyRose-27B-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
