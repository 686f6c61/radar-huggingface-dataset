# rschleitzer/qwen2.5-0.5b-instruct-scalylm

## Resumen

`rschleitzer/qwen2.5-0.5b-instruct-scalylm` es una conversión de pesos del modelo Qwen2.5-0.5B-Instruct de Alibaba Cloud a un formato propietario denominado `.scalylm`, diseñado para ejecutar inferencia de chat íntegramente en el navegador. No se trata de un modelo entrenado o afinado por el autor: es una redistribución del modelo original en un contenedor de fichero único que empaqueta configuración, vocabulario del tokenizador, merges y pesos cuantizados a 8 bits.

El objetivo es habilitar un asistente conversacional que corre del lado del cliente sin ningún servidor: el tokenizador, el modelo y el muestreo están escritos en Scaly y compilados a WebAssembly, mientras que el producto de matrices se delega a la GPU mediante WebGPU. Esto convierte al modelo en una pieza de infraestructura para aplicaciones web con requisitos estrictos de privacidad, ya que ni las entradas ni las respuestas abandonan el navegador.

El modelo hereda la arquitectura y capacidades de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros con 32 768 tokens de contexto y licencia Apache 2.0. Su relevancia es acotada: no aporta mejoras de calidad sobre el original, sino un formato de despliegue alternativo para entornos sin backend.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (aproximado, segun el modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Pesos en enteros de 8 bits con una escala por fila; resto de tensores en float32 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.scalylm` (fichero unico de 499 MB con config, tokenizador y pesos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atención de causalidad completa, normalización RMSNorm, activación SwiGLU y embeddings de tokens atados a la cabeza de salida. El contexto máximo es de 32 768 tokens. No hay innovaciones arquitectónicas propias de esta conversión.

El autor indica explícitamente que no hubo entrenamiento ni fine-tuning: el fichero se generó con el programa `programs/convert.scaly` del repositorio del chat, aplicando cuantización a 8 bits con una escala por fila en las matrices de pesos. La validación reportada compara contra la implementación en PyTorch con los mismos prompts: con pesos en 32 bits los logits coinciden con un error de 0,0003 y las continuaciones greedy son idénticas; con los pesos de 8 bits el token más probable coincide con la referencia en el 92 % de las posiciones. Esa discrepancia del 8 % es la métrica de fidelidad relevante de esta conversión.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo instruct original.
- Razonamiento básico y respuesta a instrucciones en inglés.
- Generación de código y matemáticas simples, limitada por el tamaño de 0,5 B de parámetros.
- Ejecución completa en el navegador: tokenización, inferencia y muestreo en WebAssembly, con las operaciones matriciales en WebGPU.
- Persistencia local del fichero de pesos en el almacenamiento del navegador tras la primera descarga.
- Privacidad por diseño: ni las entradas ni las salidas salen del cliente.
- No se declara soporte de tool calling, function calling, agentes ni visión en la información disponible.
- Capacidad multilingüe no declarada: la model card solo lista inglés.

## Casos de uso

- Asistentes de chat embebidos en sitios web estáticos: el fichero de 499 MB se descarga una vez y se cachea en el navegador, permitiendo conversaciones sin backend ni costes de servidor.
- Aplicaciones con requisitos estrictos de privacidad: al no enviar datos a ningún servidor, encaja en escenarios donde el texto del usuario no puede salir del dispositivo, como herramientas internas de documentación sensible.
- Demos y prototipos de interfaces conversacionales: permite validar flujos de chat y UX sin aprovisionar GPU ni infraestructura de inferencia.
- Educación y experimentación con WebGPU: sirve como referencia práctica para estudiar la ejecución de transformers cuantizados en el navegador.
- Herramientas offline-first: una vez cacheado el modelo, el chat funciona sin conexión dentro del navegador.
- Sustitución de widgets de atención al cliente basados en reglas: para consultas frecuentes y de baja complejidad donde un modelo de 0,5 B es suficiente y la latencia de red es inaceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica reportada es la fidelidad de la conversión: error de 0,0003 en logits con pesos de 32 bits y coincidencia del token más probable en el 92 % de las posiciones con los pesos de 8 bits.

## Requisitos de hardware

- Tamaño en disco y en almacenamiento del navegador: 499 MB para el fichero `.scalylm`.
- Memoria: el modelo cuantizado a 8 bits ocupa aproximadamente 0,5 GB en memoria; el espacio de trabajo adicional para activaciones y KV cache depende del contexto utilizado.
- GPU: requiere un navegador con soporte de WebGPU (Chrome, Edge y derivados recientes). No se especifican modelos de GPU concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el tamaño del modelo; la viabilidad práctica depende del soporte de WebGPU del navegador y del dispositivo.
- Despliegue: exclusivamente mediante el chat del repositorio `rschleitzer/chat` con el runtime Scaly. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| rschleitzer/qwen2.5-0.5b-instruct-scalylm | 0,5 B | 32 768 | `.scalylm` (8 bits) | Apache 2.0 | Si, via WebGPU |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5 B | 32 768 | safetensors | Apache 2.0 | No de forma nativa |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 | safetensors | Apache 2.0 | No de forma nativa |
| SmolLM2-360M-Instruct | 0,36 B | 8 192 | safetensors | Apache 2.0 | No de forma nativa |

La diferencia frente al modelo original no está en parámetros ni contexto, sino en el formato y el runtime: esta conversión es la única de la tabla pensada para ejecutarse en el cliente sin backend.

## Limitaciones y advertencias

- Con 0,5 B de parámetros, la calidad de razonamiento, código y matemáticas es limitada; es propenso a errores en tareas de varios pasos.
- Riesgo de alucinación elevado en preguntas factuales, acentuado por el tamaño reducido del modelo.
- Solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- La cuantización a 8 bits introduce divergencia respecto a la referencia: el token más probable difiere en el 8 % de las posiciones, lo que puede alterar respuestas en tareas sensibles.
- Dependencia de WebGPU: navegadores o dispositivos sin soporte no pueden ejecutar el modelo.
- El formato `.scalylm` es propietario y solo lo consume el runtime Scaly del repositorio del autor; no es portable a otras herramientas de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero se deben conservar los avisos de copyright de Alibaba Cloud recogidos en `LICENSE` y `NOTICE`.
- El repositorio registra cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rschleitzer/qwen2.5-0.5b-instruct-scalylm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio del chat: https://github.com/rschleitzer/chat
- Runtime Scaly: https://scaly.io
