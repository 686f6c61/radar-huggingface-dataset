# EsteefAi/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive-mirror

## Resumen

Este repositorio no contiene un modelo nuevo, sino un espejo (mirror) byte a byte de los ficheros GGUF publicados por HauhauCS para su variante «Uncensored HauhauCS Aggressive» del modelo Qwen3.5-35B-A3B, que a su vez deriva del modelo base Qwen/Qwen3.5-35B-A3B del equipo Qwen. El espejo lo mantiene EsteefAi con el objetivo declarado de que las instalaciones que descargan el modelo mediante Ollama (`ollama pull hf.co/EsteefAi/...`) sigan funcionando si el repositorio original se mueve o se elimina. No hay ningún cambio respecto al original: los SHA-256 de los dos ficheros publicados coinciden con los del repositorio de HauhauCS.

El modelo base es un transformer con mezcla de expertos (MoE) de 34.660.610.688 parámetros totales según los metadatos de safetensors, lo que sitúa la familia en torno a los 35.000 millones de parámetros con un subconjunto activo por token del orden de 3.000 millones, a tenor del sufijo «A3B» de la nomenclatura. La variante publicada aquí incorpora un ajuste «uncensored» que elimina o reduce los mecanismos de rechazo del modelo original, y se distribuye únicamente en formato GGUF cuantizado Q4_K_M, junto con un proyector multimodal `mmproj` en f16 que sugiere soporte de entrada de imágenes en el pipeline de llama.cpp.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo MoE de ~35 B en hardware de consumo gracias a la cuantización Q4_K_M y al bajo número de parámetros activos; por otro, es un caso de estudio útil para investigación sobre alineación y comportamiento de rechazo, dado que la modificación «uncensored» se aplica sobre una licencia Apache 2.0 que se mantiene sin cambios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según la nomenclatura del modelo base; detalles de capas y expertos no disponibles |
| Parámetros totales | 34.660.610.688 (≈34,7 B), dato de los metadatos de safetensors |
| Parámetros activos | ≈3 B según el sufijo «A3B» del nombre; no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_M (con etiqueta `imatrix`, lo que sugiere calibración con matriz de importancia); proyector multimodal `mmproj` en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sin cambios respecto al original) |
| Formato de pesos | GGUF; el repo no incluye safetensors pese a que los metadatos de parámetros provienen de ellos |
| Tamaño del repositorio | 22,1 GB |
| Ficheros publicados | `Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive-Q4_K_M.gguf` (SHA-256 `c117a47c...8717`) y `mmproj-Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive-f16.gguf` (SHA-256 `04363e64...fe9b`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-35B-A3B más allá de su naturaleza MoE y del recuento de parámetros. Por la convención de nombres de la familia Qwen, el bloque «35B-A3B» indica aproximadamente 35.000 millones de parámetros totales con unos 3.000 millones activos por token, lo que implica un enrutado disperso hacia un subconjunto de expertos en cada capa. El repositorio es una copia de una cuantización GGUF Q4_K_M generada con `imatrix`, es decir, con una matriz de importancia calculada a partir de datos de calibración para minimizar la pérdida de calidad en la cuantización de 4 bits.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus, las fases de ajuste (SFT, RLHF, DPO) ni las técnicas de optimización empleadas en el modelo base. Respecto a la variante aquí publicada, la model card del espejo no documenta la metodología del ajuste «uncensored»: no se especifica si se trata de un fine-tune completo, de LoRA fusionados o de una modificación de la plantilla de sistema, ni qué conjunto de datos se utilizó para reducir los rechazos. Tampoco se documenta el proceso de cuantización más allá de la etiqueta `imatrix`.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de código: capacidad esperable por el linaje Qwen, aunque no hay evaluación publicada en esta ficha que lo cuantifique.
- Entrada multimodal: la presencia del fichero `mmproj` en f16 indica que el pipeline de llama.cpp puede cargar un proyector visual; la model card no describe explícitamente las capacidades de visión, por lo que debe considerarse una inferencia a partir de los ficheros, no un dato confirmado.
- Respuestas sin mecanismos de rechazo para contenido que el modelo base rechazaría; es la modificación principal declarada en el nombre.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio puede servirse a través de la infraestructura de inferencia de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite comparar la distribución de respuestas de la variante «uncensored» frente al Qwen3.5-35B-A3B original en un mismo conjunto de prompts, manteniendo el resto de variables (cuantización Q4_K_M) constante. Es útil para medir qué tipos de contenido se ven afectados por el ajuste.
- Red teaming y evaluación de seguridad: sirve como modelo «sujeto de prueba» en pipelines automatizados que clasifican respuestas dañinas, ya que su tasa de rechazo reducida genera más muestras positivas para entrenar clasificadores.
- Escritura creativa y narrativa sin restricciones de tono: para ficción, guiones o roleplay donde el autor necesita un modelo que no derive la conversación hacia advertencias; el contexto conversacional multi-turno y el formato GGUF permiten ejecutarlo en local.
- Despliegue local y offline en estaciones de trabajo: al ser un MoE con ~3 B activos y cuantización Q4_K_M, puede servirse con llama.cpp u Ollama en un equipo con GPU de 24 GB o incluso con offload parcial a CPU, sin depender de APIs externas ni de conectividad.
- Generación de datos sintéticos para ajuste fino: la variante sin censura produce un rango más amplio de respuestas, útil para construir datasets de instrucciones diversos que luego se filtran con un clasificador; el formato GGUF es cargable directamente desde llama-cpp-python.
- Análisis de documentos con imágenes (si se confirma el soporte de visión): cargando el `mmproj` en f16 junto al modelo principal, se podría hacer OCR descriptivo o extracción de información de capturas y facturas en local; conviene validar esta capacidad antes de integrarla en producción.
- Docencia y demostraciones de cuantización: el par de ficheros (modelo Q4_K_M + proyector f16) es un ejemplo práctico para explicar el impacto de la cuantización con `imatrix` en un modelo MoE de gran tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del espejo no incluye evaluaciones (MMLU, HumanEval, GSM8K ni otras), y la búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces obtenidos corresponden a la página de Speedtest de Ookla y no aportan datos técnicos.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M de un modelo de ~34,7 B ocupa del orden de 20-21 GB, a lo que hay que sumar el `mmproj` en f16 y la caché KV del contexto elegido. Con contextos largos, el consumo puede superar los 24 GB. Estimación propia a partir del tamaño del repo (22,1 GB), no confirmada por el autor.
- GPU de 24 GB (RTX 3090, RTX 4090, A10G): el modelo cabe, pero con margen escaso; conviene limitar el contexto o descargar parte de los expertos a CPU.
- GPU de 32 GB o más (RTX 5090, A100 40 GB, H100): configuración holgada para el modelo completo con contexto largo; en A100/H100 se puede aumentar el tamaño de batch.
- GPU de consumo con menos de 16 GB: no cabe completo; es viable con offload de expertos a CPU en llama.cpp, aprovechando que solo ~3 B de parámetros se activan por token.
- Despliegue: llama.cpp, Ollama (el autor indica `ollama pull hf.co/EsteefAi/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive-mirror:<quant>`), LM Studio, KoboldCpp y llama-cpp-python. vLLM y TGI no son la vía natural para este repo, ya que no publica safetensors y su soporte de GGUF es experimental.
- Latencia y throughput: no disponibles. En un MoE con ~3 B activos se espera una velocidad de generación notablemente superior a la de un modelo denso de 35 B, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-35B-A3B Uncensored, mirror) | ≈34,7 B | ≈3 B (según nombre) | no disponible | Apache 2.0 | GGUF Q4_K_M en HuggingFace |
| Qwen/Qwen3.5-35B-A3B (base) | ≈34,7 B | ≈3 B (según nombre) | no disponible | Apache 2.0 | Repo original de Qwen; pesos completos |
| Qwen3-30B-A3B (generación anterior) | 30,5 B | 3,3 B | 128K nativo en la familia Qwen3; verificar en la ficha del modelo | Apache 2.0 | Pesos completos y múltiples cuantizaciones |
| Mixtral 8x7B | 46,7 B | 12,9 B | 32K | Apache 2.0 | Pesos completos y GGUF |

La comparación se limita a parámetros, contexto y licencia: no hay datos de benchmarks de este repositorio que permitan contrastar calidad frente a las alternativas. Frente a Mixtral 8x7B, este modelo activa aproximadamente una cuarta parte de parámetros por token, lo que se traduce en menor coste de inferencia a igualdad de hardware. Frente al Qwen3.5-35B-A3B original, la diferencia es de comportamiento (rechazos) y de formato (solo GGUF cuantizado), no de tamaño.

## Limitaciones y advertencias

- Ausencia de alineación de seguridad: el ajuste «uncensored» reduce deliberadamente los rechazos, por lo que el modelo puede producir contenido ofensivo, ilegal o peligroso sin advertencia. No es apto para aplicaciones de cara al público sin una capa de moderación propia.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual en este repositorio; al tratarse de una cuantización Q4_K_M, es esperable una degradación adicional respecto a los pesos completos, especialmente en tareas de razonamiento matemático y código.
- Trazabilidad limitada: es un espejo de un fine-tune de terceros sobre un modelo base; no se documenta el dataset de ajuste ni el proceso de cuantización, lo que dificulta auditar el origen de sesgos o comportamientos extraños.
- Sesgos: no disponibles en la información proporcionada; el modelo base Qwen presenta sesgos documentados en su propia ficha, que este ajuste no corrige y puede amplificar.
- Idiomas: sin confirmación oficial; la ficha del espejo no declara cobertura lingüística, por lo que conviene validar el rendimiento en castellano antes de usarlo en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el uso del modelo queda sujeto a la política de uso del modelo base y a la legislación aplicable; la licencia no exime de responsabilidad por el contenido generado.
- Formato: al publicarse solo en GGUF Q4_K_M, no es posible reentrenar ni hacer ajuste fino a partir de este repo; hay que acudir al modelo base para obtener safetensors.
- Estabilidad del repositorio: el propio autor advierte de que el espejo puede retirarse a petición del autor original; conviene fijar la versión por SHA-256 en pipelines de producción.
- Estado del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/EsteefAi/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive-mirror
- Repositorio original del fine-tune: https://huggingface.co/HauhauCS/Qwen3.5-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Perfil del autor del espejo: https://huggingface.co/EsteefAi
- Documentación de Ollama para modelos de HuggingFace: https://huggingface.co/docs/hub/ollama (referencia general, no citada en la model card)
- Paper, blog o demo oficial: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo (los resultados correspondían a Speedtest de Ookla).
