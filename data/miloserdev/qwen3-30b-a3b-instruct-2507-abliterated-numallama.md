# miloserdev/Qwen3-30B-A3B-Instruct-2507-abliterated-numallama

## Resumen

Qwen3-30B-A3B-Instruct-2507-abliterated-numallama es una conversión de formato del modelo huihui-ai/Huihui-Qwen3-30B-A3B-Instruct-2507-abliterated, que a su vez es una versión "abliterated" (con el comportamiento de rechazo eliminado) del Qwen/Qwen3-30B-A3B-Instruct-2507 original de Alibaba. La conversión la firma el desarrollador miloserdev y está pensada exclusivamente para numallama, un motor de inferencia en C para servidores CPU con ejecución NUMA-aware (consciente de la topología de memoria no uniforme) sobre todas las sockets de máquinas multiprocesador.

El modelo conserva la arquitectura Mixture of Experts (MoE) del Qwen3-30B-A3B: 30.000 millones de parámetros totales con aproximadamente 3.000 millones activos por token, lo que lo convierte en una opción especialmente atractiva para inferencia en CPU, donde el cuello de botella es el ancho de banda de memoria y no la potencia de cómputo. Los pesos se distribuyen en dos ficheros binarios propietarios (Q4 y Q8) que no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers.

La relevancia de esta ficha radica en su nicho muy concreto: despliegue de un modelo de 30B en servidores ARM64 (Ampere Altra, AWS Graviton, Neoverse) sin GPU, con velocidades de decodificación declaradas de 76 tok/s en Q4 sobre dos sockets Ampere Altra Max M128-30. Es, por tanto, una pieza para infraestructura CPU-first, no para el ecosistema convencional de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 30B totales / 3B activos |
| Parámetros totales | 30 000 millones (aproximado, según nomenclatura del modelo base) |
| Parámetros activos | ~3 000 millones por token |
| Longitud de contexto | no disponible (el README remite a las opciones de numallama, sin cifra explícita) |
| Tipos de cuantización | Q4 asimétrica (grupos de 32, escala y mínimo en fp16, con importance matrix) y Q8 int8 con escalas por grupo |
| Idiomas soportados | no disponibles (la importance matrix se recolectó sobre inglés, ruso, chino y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | Binario propietario de numallama (`.bin`), no GGUF; tokenizer en `tokenizer.bin` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del Qwen3-30B-A3B-Instruct-2507: un transformer con capas de mezcla de expertos en las que solo se activa una fracción reducida de los parámetros por token (~3B de 30B). Esta dispersión es la que hace viable la inferencia en CPU, ya que reduce el cómputo por token a costa de requerir el conjunto completo de pesos en memoria. Sobre esa base, huihui-ai aplicó una técnica de abliteration que elimina la dirección de activación asociada al comportamiento de rechazo, de modo que el modelo deja de negarse a peticiones que el original rechazaría.

La conversión de miloserdev no reentrena el modelo: transforma los pesos a los formatos Q4 y Q8 propietarios de numallama. La cuantización Q4 es asimétrica con grupos de 32 y usa una importance matrix recolectada por numallama sobre texto en inglés, ruso, chino y código, lo que sesga la preservación de precisión hacia esos dominios. El motor numallama implementa ejecución NUMA-aware, decodificación especulativa (según se menciona en el README del repositorio) y un servidor compatible con la API de OpenAI. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Razonamiento y respuesta a instrucciones (modelo Instruct, variante 2507).
- Generación de código, con cuantización Q4 calibrada parcialmente sobre código.
- Soporte multilingüe heredado del modelo base (inglés, chino y otros), aunque sin listado oficial confirmado en esta ficha.
- Servidor compatible con la API de OpenAI (`/v1`) para integración con clientes existentes.
- Soporte de herramientas (tools) y decodificación especulativa a través de las opciones de numallama.
- Comportamiento "uncensored": responde a peticiones que el modelo original rechazaría, por diseño de la abliteration.
- Ejecución en CPU sobre ARM64 con NEON dot product; en x86-64 funciona con C portable no optimizado.

## Casos de uso

- Despliegue de chat en servidores ARM64 sin GPU: el modelo se ejecuta íntegramente en CPU sobre Ampere Altra o AWS Graviton, aprovechando la ejecución NUMA-aware para repartir los 30B de pesos entre sockets y mantener velocidades de decodificación de decenas de tokens por segundo.
- Servicio de inferencia compatible con OpenAI en infraestructura propia: el modo `server` expone `/v1` en el puerto indicado, lo que permite conectar clientes y frameworks que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Procesamiento por lotes de texto en clústeres CPU: al no requerir GPU, puede integrarse en granjas de servidores ARM64 existentes para tareas de generación, resumen o clasificación a gran escala.
- Investigación sobre alineación y abliteration: sirve para estudiar el efecto de la eliminación del comportamiento de rechazo comparando directamente con la variante no abliterated del mismo autor (Qwen3-30B-A3B-Instruct-2507-numallama).
- Entornos con restricciones de hardware o de suministro de GPU: organizaciones que solo disponen de servidores CPU pueden ejecutar un modelo de 30B con calidad cercana a la del original en Q8 (32,4 GB) o con menor huella en Q4 (19,4 GB).
- Prototipado y evaluación local en estaciones de trabajo ARM64: el binario Q4 de 19,4 GB cabe en la memoria de un servidor de gama media, permitiendo probar el modelo antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README únicamente aporta velocidades de decodificación medidas por el autor:

| Fichero | Pesos | Tamaño | Velocidad de decodificación |
|---|---|---:|---:|
| `qwen3-30b-a3b-instruct-2507-abliterated-q4.bin` | Q4 | 19,4 GB | 76 tok/s |
| `qwen3-30b-a3b-instruct-2507-abliterated-q8.bin` | Q8 | 32,4 GB | 70 tok/s |

Las cifras corresponden a una única conversación de chat medida en 2 × Ampere Altra Max M128-30 (256 núcleos Neoverse N1, ambas sockets); otras máquinas diferirán.

## Requisitos de hardware

- VRAM: no aplica; es un motor de CPU. Se requiere memoria RAM suficiente para alojar los pesos: ~19,4 GB para Q4 y ~32,4 GB para Q8, más el espacio de contexto y el tokenizer.
- CPU: optimizado para ARM64 con NEON dot product (Ampere Altra, AWS Graviton y otros núcleos Neoverse). En x86-64 funciona con C portable sin optimizar, con rendimiento muy inferior.
- Multiproceso: el motor es NUMA-aware y está diseñado para repartir la ejecución entre todas las sockets de servidores multiprocesador.
- GPU: no se usa GPU en ningún caso; no hay soporte CUDA ni ROCm.
- Despliegue: exclusivamente mediante numallama (compilado con `make` desde el repositorio de GitHub). No es compatible con vLLM, llama.cpp, Ollama, LM Studio ni transformers.
- Latencia y throughput: 76 tok/s en Q4 y 70 tok/s en Q8 según medición del autor en el hardware indicado; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (numallama) | ~30B | ~3B | no disponible | `.bin` numallama | Apache 2.0 | Hugging Face, solo numallama |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | ~30B | ~3B | no disponible | safetensors | Apache 2.0 | Hugging Face, ecosistema estándar |
| huihui-ai/Huihui-Qwen3-30B-A3B-Instruct-2507-abliterated | ~30B | ~3B | no disponible | safetensors | Apache 2.0 | Hugging Face, ecosistema estándar |
| miloserdev/Qwen3-30B-A3B-Instruct-2507-numallama | ~30B | ~3B | no disponible | `.bin` numallama | Apache 2.0 | Hugging Face, solo numallama, sin abliteration |

La diferencia clave frente a las variantes en safetensors es el formato y el motor: este modelo solo se ejecuta en numallama sobre CPU, mientras que las versiones originales y abliterated estándar requieren GPU o motores convencionales. Frente a la variante no abliterated del mismo autor, la única diferencia es el comportamiento de rechazo eliminado.

## Limitaciones y advertencias

- La abliteration elimina el comportamiento de rechazo: el modelo responderá a peticiones que el original rechazaría, con implicaciones éticas y legales que recaen sobre el usuario.
- Los ficheros no son GGUF y no funcionan con llama.cpp, Ollama, LM Studio ni transformers; el ecosistema de herramientas disponible es prácticamente inexistente fuera de numallama.
- El rendimiento óptimo está limitado a ARM64 con NEON; en x86-64 el código es portable y no optimizado, con velocidad muy inferior.
- La cuantización Q4 usa una importance matrix recolectada sobre inglés, ruso, chino y código, lo que puede degradar la precisión en otros idiomas o dominios.
- No hay información publicada sobre sesgos, tasas de alucinación ni evaluación de calidad frente al modelo original.
- El listado de idiomas soportados no está disponible en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de la variante abliterated de la que deriva.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento de los ficheros.

## Enlaces

- Hugging Face: https://huggingface.co/miloserdev/Qwen3-30B-A3B-Instruct-2507-abliterated-numallama
- Modelo base (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3-30B-A3B-Instruct-2507-abliterated
- Modelo original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Variante no abliterated del mismo autor: https://huggingface.co/miloserdev/Qwen3-30B-A3B-Instruct-2507-numallama
- Repositorio de numallama: https://github.com/miloserdev/numallama
- README de numallama (opciones y API): https://github.com/miloserdev/numallama#readme
