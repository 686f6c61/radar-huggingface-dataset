# BIBIMBAM/Begonvil-Ajan-1.5B

## Resumen

Begonvil-Ajan-1.5B es un modelo de generación de texto ajustado (fine-tuned) a partir de Qwen2.5-1.5B-Instruct, desarrollado por el usuario BIBIMBAM como proyecto final de un bootcamp. Se trata de un agente de recepción hotelera especializado en turco, diseñado para responder preguntas sobre un hotel concreto (habitaciones, precios, servicios, mascotas) mediante llamadas a herramientas (tool calling) y búsqueda semántica sobre una guía del hotel.

El modelo no es un asistente generalista: su conocimiento está delimitado a una tabla de habitaciones (`odalar.csv`) y a una guía del hotel recuperada por búsqueda por palabras clave y semántica en cada turno. En cada paso genera un único JSON con estructura `{"dusunce", "arac", "argumanlar"}` (llamada a herramienta) o `{"dusunce", "cevap"}` (respuesta final), lo que lo hace fácil de integrar en un bucle de agente controlado por código.

Su relevancia es principalmente como ejemplo práctico y educativo de cómo construir un agente de dominio restringido con QLoRA sobre un modelo pequeño (1.5B parámetros), incluyendo validación de herramientas, verificación de cifras contra las fuentes y un plan de respaldo basado en reglas. No está pensado para uso comercial general y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2 (arquitectura Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el autor no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (QLoRA r=16 usado solo durante el entrenamiento; el repo pesa 3,1 GB en safetensors) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste por QLoRA (rango r=16) sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only. Se entrenó durante 2 épocas calculando la pérdida únicamente sobre la salida del asistente, una práctica habitual en ajustes para agentes que evita que el modelo aprenda a imitar las instrucciones del sistema. El repo resultante pesa 3,1 GB, lo que sugiere pesos en precisión media (bf16/fp16) para 1,54 B de parámetros.

El conjunto de entrenamiento consta de 655 ejemplos. Los resultados de las herramientas se generaron a partir de datos reales de habitaciones (`odalar.csv`) y los contextos a partir de búsquedas reales sobre la guía del hotel, lo que reduce el desfase entre entrenamiento e inferencia. Las preguntas de test se excluyeron explícitamente del entrenamiento. No hay indicios de RLHF ni DPO; el ajuste es puramente supervisado sobre datos sintéticos de dominio.

## Capacidades

- Generación de texto conversacional en turco, restringida al dominio del hotel Begonvil.
- Tool calling estructurado: emite JSON con una de seis herramientas (`oda_bilgisi`, `oda_listesi`, `oda_oner`, `toplam_konaklama`, `evcil_hayvan_ucreti`, `hesapla`) o una respuesta final.
- Razonamiento multi-paso dentro del bucle de agente: puede encadenar llamadas (por ejemplo, dos consultas de habitación seguidas de un cálculo).
- Integración con RAG: recibe contexto recuperado de la guía del hotel en cada pregunta.
- Respuesta final en JSON con campo de pensamiento (`dusunce`) visible, útil para depuración.
- No tiene capacidades de visión, audio ni razonamiento extendido (thinking mode).

## Casos de uso

- Chatbot de recepción hotelera: responde preguntas frecuentes sobre check-in, desayuno, mascotas, aparcamiento o servicios usando la guía del hotel como contexto recuperado.
- Cálculo de tarifas: consulta precios de habitaciones y estancias mediante `toplam_konaklama` y `hesapla`, útil para presupuestos rápidos sin intervención humana.
- Recomendación de habitaciones: con `oda_oner`, sugiere alojamiento adecuado según el número de huéspedes.
- Plantilla educativa para agentes con QLoRA: el proyecto completo (datos, bucle de agente, evaluación) sirve como referencia para construir agentes de dominio cerrado sobre modelos pequeños.
- Base para agentes verticales similares: sustituyendo la guía y la tabla de datos, la misma arquitectura puede adaptarse a restaurantes, clínicas u otros negocios locales.
- Prototipado on-device: con 1,5 B de parámetros, es viable en hardware de consumo para demos de agentes sin coste de API.

## Benchmarks y rendimiento

El autor publicó una evaluación propia con un juez automático sobre 19 preguntas de test (excluidas del entrenamiento), comparando el modelo ajustado con el modelo base dentro del mismo bucle de agente:

| Metrica | Modelo base (Qwen2.5-1.5B-Instruct) | Begonvil-Ajan-1.5B |
|---|---|---|
| Puntuación media | 0,39 | 0,68 |
| Tasa de uso del plan de respaldo | 0,21 | 0,00 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.). El propio autor advierte de que el conjunto de evaluación es pequeño y el juez automático es una medida aproximada.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 3,5-4 GB en fp16/bf16 (pesos de 3,1 GB más overhead de KV cache); con cuantización a 4 bits (GGUF/Q4) cabría en unos 1,5-2 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3060, RTX 4060 o superior); no se requiere hardware de centro de datos.
- Cabe cómodamente en GPUs de consumo e incluso puede ejecutarse en CPU con llama.cpp, con latencias aceptables para chat.
- Opciones de despliegue: al ser arquitectura Qwen2 con safetensors, es compatible con vLLM, TGI, llama.cpp, Ollama y LM Studio. No hay evidencia de que el autor haya publicado versiones GGUF.
- Latencia y throughput: no disponible; al tratarse de un modelo de 1,5 B, se espera generación fluida en GPU de consumo (decenas de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Begonvil-Ajan-1.5B | 1,54 B | no disponible (base: 32.768) | Apache 2.0 | Agente hotelero en turco, dominio cerrado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 | Apache 2.0 | Asistente generalista multilingüe |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Qwen Research (uso comercial condicionado) | Asistente generalista, mayor capacidad |

Frente a su modelo base, Begonvil-Ajan-1.5B duplica la puntuación media del agente en su dominio (0,68 frente a 0,39) y elimina el uso del plan de respaldo, a costa de perder generalidad. Frente a modelos generalistas de 3 B, ofrece menor capacidad pero un formato de salida JSON estricto ya aprendido para su dominio.

## Limitaciones y advertencias

- Conocimiento estrictamente limitado a la guía y la tabla de habitaciones del hotel Begonvil; no puede hacer reservas ni procesar pagos.
- El conjunto de evaluación es muy pequeño (19 preguntas) y el juez automático es una métrica gruesa; el 0,68 medio implica respuestas parcialmente incorrectas en varias preguntas (varias puntuadas 0 o 0,5 en la tabla publicada).
- Entrenado solo en turco: su rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente para el dominio.
- Riesgo de alucinación mitigado parcialmente por la verificación de cifras contra las fuentes y el plan de respaldo basado en reglas, pero no eliminado.
- Cada respuesta termina con el carácter `🌸`, un comportamiento aprendido que puede requerir limpieza en producción.
- Proyecto de bootcamp con muy poca adopción (576 descargas, 1 like): sin mantenimiento garantizado ni documentación de despliegue.
- Licencia Apache 2.0: sin restricciones de uso comercial, aunque el modelo base Qwen2.5-1.5B-Instruct hereda sus propias condiciones (Apache 2.0, sin problemas para uso comercial).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BIBIMBAM/Begonvil-Ajan-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

No se han encontrado enlaces adicionales (paper, blog, repositorio de código o demo) en la información disponible.
