# Digitak2027/hamefan-strong-brain

## Resumen

Hamefan strong brain es una cuantizacion GGUF Q4_K_M del modelo Qwen3-8B abliterated publicado por mlabonne, redistribuida por el usuario Digitak2027 bajo el identificador `Digitak2027/hamefan-strong-brain`. El modelo base es un Qwen3-8B de 8 mil millones de parametros al que se le ha aplicado una tecnica de "abliteration", un procedimiento de edicion de pesos que elimina la direccion de rechazo en el espacio de activaciones para reducir las negativas del modelo ante peticiones que el alineamiento original bloquearia. La cuantizacion Q4_K_M reduce el peso a aproximadamente 4,7-5 GB, lo que permite ejecucion en dispositivos moviles y equipos de consumo.

El proposito declarado por el autor es servir como motor de chat offline para una aplicacion movil llamada Hamefan, priorizando que el modelo "siga funcionando bien en un telefono". Se trata, por tanto, de un artefacto de distribucion mas que de un modelo original: no hay entrenamiento propio, ni ajuste fino adicional, ni evaluacion publicada por parte del redistribuidor.

La relevancia de esta ficha es limitada y conviene ser explicito: el repositorio no incluye model card tecnica, no declara licencia, no especifica idiomas soportados y no aporta resultados de benchmarks. Toda la informacion tecnica sustantiva procede del modelo upstream (Qwen3-8B) y del trabajo de abliteration de mlabonne, no del autor de esta redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B); detalles internos no disponibles en el repositorio |
| Parametros totales | 8 mil millones (aproximado, segun el nombre del modelo base Qwen3-8B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en el repositorio (el modelo base Qwen3-8B soporta contexto nativo largo, pero el valor exacto no se declara aqui) |
| Tipos de cuantizacion | GGUF Q4_K_M (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia; la licencia del modelo base Qwen3 debe consultarse en su origen) |
| Formato de pesos | GGUF (cuantizacion Q4_K_M) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8 mil millones de parametros desarrollado por el equipo Qwen de Alibaba. Sobre ese modelo, mlabonne aplico abliteration: una tecnica que calcula la direccion media de las activaciones asociadas a respuestas de rechazo y la resta (o proyecta fuera) de los pesos de las capas correspondientes, de modo que el modelo deja de activar el comportamiento de negacion. Es una intervencion post-entrenamiento sobre pesos, no un reentrenamiento.

El redistribuidor, Digitak2027, unicamente ha tomado la cuantizacion GGUF Q4_K_M publicada por bartowski (`bartowski/mlabonne_Qwen3-8B-abliterated-GGUF`) y la ha vuelto a subir. No hay informacion en el repositorio sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. El unico dato verificable aportado es un hash SHA-256 (`361557e69ad101ee22b1baf427283b7ddcf81bc7532b8cee8ac2c6b4d1b81ead`) que permite comprobar la integridad del archivo descargado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-8B.
- Razonamiento y matematicas a nivel de un modelo denso de 8B, sin datos de evaluacion especificos en este repositorio.
- Generacion de codigo, sujeta a la calidad del modelo base y degradada por la cuantizacion Q4_K_M.
- Comportamiento de rechazo reducido gracias a la abliteration: el modelo responde con mayor frecuencia a peticiones que el Qwen3-8B alineado rechazaria.
- Ejecucion offline en dispositivos con recursos limitados, que es el objetivo declarado del artefacto.
- Soporte de tool calling, agentes o modo "thinking": no confirmado en este repositorio; depende de si la plantilla de chat y el tokenizador del GGUF preservan las capacidades del Qwen3-8B original.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Chat offline en aplicaciones moviles: es el caso de uso declarado por el autor; la cuantizacion Q4_K_M mantiene el modelo en torno a 5 GB, viable en telefonos de gama alta con 8-12 GB de RAM mediante llama.cpp o bindings equivalentes.
- Asistente personal sin conexion en equipos de escritorio modestos: ejecutable en CPU con llama.cpp u Ollama en maquinas con 8 GB de RAM o mas, sin necesidad de GPU.
- Prototipado de aplicaciones conversacionales con requisitos bajos de censura: util para investigar comportamiento de modelos abliterated en entornos controlados y comparar con el modelo alineado.
- Generacion de texto creativo sin filtros editoriales: escenarios donde el rechazo del modelo base resulta un obstaculo (ficcion con contenido sensible, guiones, etc.), asumiendo los riesgos descritos abajo.
- Pruebas de robustez y red teaming: sirve como referencia de modelo "sin alineamiento" para evaluar clasificadores de seguridad o filtros de contenido propios.
- Educacion e investigacion sobre tecnicas de abliteration: permite reproducir y estudiar el efecto de la edicion de pesos comparando salidas con el Qwen3-8B original.
- Inferencia en entornos aislados (air-gapped): al ser un unico archivo GGUF con hash publicado, encaja en despliegues sin acceso a red donde se requiere verificar integridad del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 5-6 GB para el archivo Q4_K_M mas overhead de contexto; con contexto largo la RAM necesaria crece de forma proporcional al tamano de la cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090, A100, H100). En GPUs de gama alta el modelo queda limitado por ancho de banda de memoria, no por computo.
- Viabilidad en GPU de consumo: si, en tarjetas con 8 GB o mas. Tambien ejecutable en CPU.
- Moviles: el autor afirma que "funciona bien en un telefono", pero no aporta dispositivo, sistema operativo ni metricas de latencia o consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y bindings moviles basados en llama.cpp. vLLM y TGI no son la via natural para GGUF Q4_K_M, aunque existen soportes parciales.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hamefan strong brain (este) | ~8B | no disponible | GGUF Q4_K_M | no disponible | Hugging Face, 0 descargas |
| Qwen3-8B (original) | ~8B | no disponible en esta ficha | safetensors, GGUF | licencia Qwen (consultar origen) | amplia |
| mlabonne/Qwen3-8B-abliterated | ~8B | no disponible en esta ficha | safetensors, GGUF | derivada del modelo base | amplia |
| bartowski/mlabonne_Qwen3-8B-abliterated-GGUF | ~8B | no disponible en esta ficha | multiples GGUF (incl. Q4_K_M) | derivada del modelo base | amplia |

La diferencia practica entre este repositorio y `bartowski/mlabonne_Qwen3-8B-abliterated-GGUF` es, segun la propia model card, nula en cuanto a pesos: se trata de la misma cuantizacion redistribuida. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir uso comercial permitido; debe verificarse la licencia del Qwen3-8B original y de la abliteration de mlabonne antes de cualquier despliegue productivo.
- La abliteration elimina el comportamiento de rechazo de forma indiscriminada: el modelo puede generar contenido danino, ilegal o inseguro sin las salvaguardas del Qwen3-8B alineado. No es apto para aplicaciones orientadas al publico sin filtros externos.
- Mayor riesgo de alucinacion y de respuestas erroneas con alta confianza, agravado por la cuantizacion Q4_K_M y por la perdida de calibracion que puede introducir la edicion de pesos.
- Sin model card tecnica: se desconocen idiomas soportados, contexto efectivo tras la cuantizacion, plantilla de chat exacta y preservacion de tool calling.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: sin evidencia de uso, validacion por la comunidad ni mantenimiento.
- La cuantizacion Q4_K_M introduce degradacion medible frente a pesos completos en tareas de razonamiento y codigo, aunque suele ser aceptable para chat.
- El hash SHA-256 publicado permite verificar integridad, pero no autenticidad ni procedencia mas alla de la palabra del autor.
- No hay garantia de que la plantilla de chat del GGUF coincida con la del Qwen3-8B original, lo que puede alterar el comportamiento conversacional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Digitak2027/hamefan-strong-brain
- Modelo upstream citado (bartowski): https://huggingface.co/bartowski/mlabonne_Qwen3-8B-abliterated-GGUF
- Modelo abliterated de mlabonne: https://huggingface.co/mlabonne/Qwen3-8B-abliterated
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
