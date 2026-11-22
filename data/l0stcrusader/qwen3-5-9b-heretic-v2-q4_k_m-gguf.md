# L0stCrusader/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF

## Resumen

L0stCrusader/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo trohrbaugh/Qwen3.5-9B-heretic-v2, un derivado de la familia Qwen3.5 de 9B parametros sometido a un proceso de "abliteration" (eliminacion de los mecanismos de rechazo o censura) que da lugar a una variante descensurada. El autor de esta ficha, L0stCrusader, se limita a convertir los pesos originales a cuantizacion Q4_K_M mediante el espacio GGUF-my-repo de ggml.ai y llama.cpp, sin aportar entrenamiento adicional ni cambios en los pesos mas alla de la cuantizacion.

El modelo conserva la arquitectura y el tamano del original: 8.953.803.264 parametros totales (aproximadamente 9B) y una licencia Apache 2.0 heredada de Qwen. La etiqueta de pipeline es image-text-to-text, lo que indica que la familia base incorpora capacidades multimodales de vision, aunque la model card de esta conversion no aporta detalles adicionales sobre el entrenamiento, el contexto o los idiomas soportados.

Su relevancia practica es acotada: se trata de una publicacion reciente (noviembre de 2026) sin descargas ni interacciones, pensada para usuarios que quieran ejecutar localmente una variante sin filtros de rechazo de un modelo Qwen3.5 de 9B en hardware de consumo mediante llama.cpp. No debe confundirse con un modelo oficial de Qwen ni con un lanzamiento con benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B; detalles no presentes en la informacion) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo contiene una unica cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo qwen3.5-9b-heretic-v2-q4_k_m.gguf); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. Por herencia de la familia Qwen3.5-9B cabe esperar un transformer decoder-only, pero la model card de esta conversion no confirma ni detalla capas, atencion, ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El pipeline declarado (image-text-to-text) sugiere que el modelo base es multimodal con entrada de imagen y texto, aunque no se especifica el codificador visual ni el esquema de fusion de modalidades.

Respecto al entrenamiento, la unica informacion disponible es que el modelo deriva de trohrbaugh/Qwen3.5-9B-heretic-v2, una variante "heretic" y "abliterated" que presumiblemente aplica tecnicas de eliminacion de direcciones de rechazo sobre los pesos del Qwen3.5-9B original. No se documentan numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Esta conversion concreta no anade entrenamiento: solo aplica cuantizacion Q4_K_M con llama.cpp.

## Capacidades

- Generacion de texto conversacional en formato chat (tag "conversational").
- Procesamiento de entrada de imagen y texto (pipeline image-text-to-text), segun la etiqueta del repo.
- Comportamiento descensurado: el proceso de abliteration elimina los rechazos tipicos del modelo base, lo que permite respuestas sobre temas que el original declinaria.
- Compatibilidad con endpoints (tag "endpoints_compatible") para despliegue como API.
- Ejecucion local mediante llama.cpp (CLI y servidor).
- Capacidades multilingues: no disponibles en la informacion.
- Tool calling, agentes y razonamiento multi-paso: no disponibles en la informacion.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la informacion.

## Casos de uso

- Inferencia local en hardware de consumo: el archivo Q4_K_M ocupa aproximadamente 5,6 GB, por lo que puede cargarse en GPUs con 8 GB de VRAM o en CPU con suficiente RAM, usando llama-cli o llama-server tal como documenta la model card.
- Experimentacion con modelos sin filtros: investigadores que estudian el efecto de la abliteration pueden comparar esta variante con el Qwen3.5-9B original en tareas de generacion libre, aunque sin benchmarks publicados la comparacion seria cualitativa.
- Prototipado de asistentes conversacionales: el tag "conversational" y la compatibilidad con endpoints permiten montar un servidor local de chat para pruebas de integracion antes de pasar a modelos mayores.
- Pruebas de pipelines multimodales: al declararse image-text-to-text, sirve para validar flujos de entrada de imagen y texto en llama.cpp, siempre que la build utilizada soporte la arquitectura multimodal del modelo base.
- Evaluacion de cuantizacion: util para medir la perdida de calidad de Q4_K_M frente a los pesos safetensors originales en tareas concretas del usuario.
- Despliegue en entornos aislados o sin conexion: al ser un unico archivo GGUF descargable, encaja en escenarios air-gapped donde no se puede depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB solo para los pesos en Q4_K_M, mas overhead de contexto KV; en la practica, entre 6 y 8 GB para contextos moderados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en el segmento profesional, A100 o H100 aunque sobredimensionadas para 9B.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM; con menos VRAM puede ejecutarse parcialmente en CPU mediante offloading.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por compatibilidad de formato GGUF, herramientas derivadas como Ollama o LM Studio (no confirmado en la model card).
- Latencia y throughput: no disponibles; dependen del hardware y del contexto configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| L0stCrusader/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF | 8,95B | no disponible | Apache 2.0 | GGUF Q4_K_M | Conversion descensurada, sin benchmarks |
| trohrbaugh/Qwen3.5-9B-heretic-v2 (base) | 8,95B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar del que deriva |
| Qwen3.5-9B (oficial) | 9B aprox. | no disponible | Apache 2.0 | safetensors | Modelo oficial con filtros; referencia de calidad |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo descensurado: la abliteration elimina los rechazos de seguridad, lo que incrementa el riesgo de generar contenido danino, ofensivo o ilegal; no es adecuado para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de 9B, agravado por la falta de benchmarks que permitan estimar su fiabilidad.
- Sin datos de contexto ni idiomas: no se puede garantizar el comportamiento en conversaciones largas ni en castellano.
- Publicacion sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion de la comunidad.
- Cuantizacion Q4_K_M: introduce perdida de precision frente a los pesos originales, especialmente en tareas de razonamiento y codigo.
- Licencia Apache 2.0 permite uso comercial, pero el autor de la conversion no ofrece garantias sobre el comportamiento del modelo descensurado.
- La model card no documenta el proceso de abliteration ni sus efectos medidos; cualquier uso en produccion requiere evaluacion propia.

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/L0stCrusader/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF
- Modelo base de la conversion: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Licencia del modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
