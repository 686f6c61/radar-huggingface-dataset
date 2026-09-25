# mradermacher/Lumo-1-1.5B-Chat-V2-GGUF

## Resumen

Lumo-1-1.5B-Chat-V2-GGUF es la version cuantizada en formato GGUF del modelo conversacional vpakarinen/Lumo-1-1.5B-Chat-V2, publicada por mradermacher. Se trata de un modelo denso de 1.510.019.072 parametros (aproximadamente 1,5 mil millones), disenado para generacion de texto conversacional en ingles y distribuido bajo licencia Apache 2.0. La model card del autor original lo etiqueta con los terminos "apertus", "fine-tuned" y "conversational", lo que indica que se trata de un ajuste fino sobre una base de la familia Apertus, aunque no se detalla la arquitectura exacta en la informacion disponible.

La relevancia de esta publicacion radica en su utilidad practica: al ser un modelo pequeno (1,5B), puede ejecutarse en hardware de consumo, e incluso en CPU, gracias a los cuantizados GGUF que van desde 0,8 GB (Q2_K) hasta 3,1 GB (f16). Esto lo convierte en una opcion atractiva para despliegues locales, prototipado rapido y entornos con recursos limitados donde no es viable ejecutar modelos de mayor tamano.

El repositorio incluye un conjunto amplio de cuantizados estaticos (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 y f16) generados con llama.cpp. Existe tambien una version con cuantizados ponderados/imatrix publicada en un repositorio separado por el mismo autor. No se han publicado resultados de benchmarks ni detalles sobre datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo denso, etiquetado con "apertus" por el autor) |
| Parametros totales | 1.510.019.072 (aproximadamente 1,5B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | vpakarinen/Lumo-1-1.5B-Chat-V2 |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 14,1 GB (conjunto completo de cuantizados) |
| Fecha de creacion | 2026-09-25 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Dado que la model card lo etiqueta con "apertus" y que el modelo base es vpakarinen/Lumo-1-1.5B-Chat-V2, es probable que derive de un transformer de la familia Apertus ajustado para uso conversacional, pero no se confirma la arquitectura, el numero de capas, la dimension del modelo ni el mecanismo de atencion en la informacion disponible.

Tampoco hay datos sobre el proceso de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas como RLHF, DPO o SFT. La unica informacion relevante es que se trata de una version "Chat-V2" y que el modelo ha sido ajustado ("fine-tuned") para tareas conversacionales. Toda la documentacion adicional sobre el modelo base deberia consultarse directamente en el repositorio de vpakarinen/Lumo-1-1.5B-Chat-V2.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Ajuste especifico para uso como asistente conversacional (etiqueta "conversational").
- Capacidad de ejecucion local mediante llama.cpp y derivados (Ollama, LM Studio, etc.).
- Soporte de inferencia en CPU y GPU gracias al formato GGUF.
- No se documenta soporte de tool calling o function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Capacidades multilingues: unicamente ingles segun los metadatos del modelo.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un equipo de sobremesa o portatil para mantener conversaciones multi-turno sin conexion a internet, gracias a sus cuantizados de 1 GB o menos en Q4_K_M.

- Prototipado de aplicaciones de chat: por su tamano reducido y su licencia permisiva, es adecuado para validar rapidamente interfaces conversacionales o pipelines de generacion de texto antes de escalar a modelos mayores.

- Despliegue en dispositivos con recursos limitados: los cuantizados Q2_K (0,8 GB) y Q3_K_S (0,9 GB) permiten ejecutar el modelo en hardware modesto, como mini-PC o placas tipo Raspberry Pi con RAM suficiente.

- Generacion de texto con baja latencia: al ser un modelo de 1,5B, ofrece tiempos de respuesta muy bajos en GPU de consumo, lo que lo hace util para aplicaciones interactivas en tiempo real.

- Investigacion sobre cuantizacion: el repositorio ofrece una amplia gama de cuantizados (desde Q2_K hasta f16), lo que permite estudiar el impacto de la cuantizacion en la calidad de salida y comparar tipos IQ frente a K.

- Educacion y experimentacion: sirve como modelo de referencia para aprender a ejecutar modelos GGUF con llama.cpp, Ollama o LM Studio, y para entender el flujo de trabajo de cuantizacion.

- Backend de bajo coste para tareas sencillas: para tareas de generacion de texto no criticas (respuestas cortas, resumenes basicos, clasificacion), puede emplearse en entornos donde el coste por inferencia debe ser minimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra metrica de evaluacion para este modelo ni para su modelo base en la documentacion proporcionada. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion):
  - Q2_K (0,8 GB): aproximadamente 1,5 GB de VRAM.
  - Q4_K_M (1,1 GB): aproximadamente 2 GB de VRAM.
  - Q8_0 (1,7 GB): aproximadamente 2,5-3 GB de VRAM.
  - f16 (3,1 GB): aproximadamente 4-5 GB de VRAM.

- GPU recomendadas: cualquier GPU de consumo con al menos 3-4 GB de VRAM, como GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. No requiere GPU de clase profesional (A100, H100).

- Compatibilidad con GPU de consumo: si, cabe holgadamente en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas con memoria compartida suficiente.

- Ejecucion en CPU: viable gracias al formato GGUF, especialmente con los cuantizados Q4_K_M y Q5_K_M, que ofrecen un buen equilibrio entre tamano y calidad.

- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui. El soporte de GGUF en vLLM es limitado; para despliegue en servidor se recomendaria usar el modelo original en safetensors con vLLM o TGI.

- Latencia y throughput estimados: no disponibles. No obstante, por el tamano del modelo (1,5B), se espera una latencia baja en GPU de consumo, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Lumo-1-1.5B-Chat-V2-GGUF | 1,5B | no disponible | Apache 2.0 | GGUF | no disponible |
| Qwen2.5-1.5B-Instruct | 1,5B | 32K (131K con YaRN) | Apache 2.0 | safetensors, GGUF | no comparable (sin datos de Lumo) |
| Llama-3.2-1B-Instruct | 1,2B | 128K | Llama 3.2 | safetensors, GGUF | no comparable (sin datos de Lumo) |
| SmolLM2-1.7B-Instruct | 1,7B | 8K | Apache 2.0 | safetensors, GGUF | no comparable (sin datos de Lumo) |

Nota: los datos estructurales de los modelos de comparacion corresponden a informacion publica general de cada proyecto. No es posible establecer una comparacion de rendimiento porque no se han publicado benchmarks del modelo Lumo-1-1.5B-Chat-V2 en la informacion disponible. Los valores de contexto de los modelos alternativos pueden variar; se recomienda verificar en sus respectivas model cards.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo o equidad para este modelo.

- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano (1,5B). Con un numero de parametros reducido, la probabilidad de generar informacion incorrecta o inventada es mayor que en modelos de mayor escala.

- Limitacion de idioma: el modelo solo soporta ingles segun sus metadatos. No hay garantia de un rendimiento correcto en castellano u otros idiomas.

- Limitaciones de contexto: no se ha especificado la longitud de contexto, por lo que se desconoce la capacidad real de manejar conversaciones o documentos largos.

- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No obstante, se debe respetar tambien cualquier condicion asociada al modelo base original.

- Caveat para produccion: al tratarse de una cuantizacion, los cuantizados de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las respuestas. Para uso en produccion se recomienda Q4_K_M o superior.

- Es un modelo orientado a conversacion general; no se documenta su idoneidad para tareas especializadas como generacion de codigo, matematicas o razonamiento complejo.

- El repositorio no incluye datos de evaluacion ni una model card extensa del modelo base, lo que dificulta validar su comportamiento antes de desplegarlo.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/Lumo-1-1.5B-Chat-V2-GGUF
- Modelo base (safetensors): https://huggingface.co/vpakarinen/Lumo-1-1.5B-Chat-V2
- Cuantizados ponderados/imatrix: https://huggingface.co/mradermacher/Lumo-1-1.5B-Chat-V2-i1-GGUF
- Perfil del autor mradermacher: https://huggingface.co/mradermacher
- Pagina de resumen y descarga del modelo: https://hf.tst.eu/model#Lumo-1-1.5B-Chat-V2-GGUF
- Peticiones de modelos al autor: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Consideraciones sobre calidad de cuantizados (mradermacher): https://huggingface.co/mradermacher/model_requests
