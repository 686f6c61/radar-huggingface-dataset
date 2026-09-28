# skillsafe-ai/gemma-4-E2B-it-roleplay-ONNX

## Resumen

skillsafe-ai/gemma-4-E2B-it-roleplay-ONNX es un ajuste fino de google/gemma-4-E2B-it orientado a role-play e ficcion interactiva de personajes con contenido apto para todo publico (SFW), empaquetado en formato ONNX para ejecutarse integramente en el navegador mediante Transformers.js y WebGPU. Lo publica SkillsSafe AI y su objetivo es ofrecer chat de personajes con tarjeta de personaje (character card) en el `system` message sin necesidad de servidor: una build de solo texto de aproximadamente 3,1 GB.

El modelo parte de la familia Gemma 4 de Google DeepMind, en su variante E2B (la mas ligera de la gama, segun fuentes externas en torno a 2,1 mil millones de parametros y contexto base de 8K). El ajuste se realizo con LoRA (r=16) sobre las proyecciones de atencion y MLP durante una epoca, con contexto de 6.000 tokens, y el adaptador se fusiono en los pesos base. La build para navegador se obtiene trasplantando los pesos al grafo ONNX publicado por onnx-community.

Su relevancia radica en dos factores: primero, demuestra que un modelo pequeno puede superar a su base en una tarea concreta evaluada con juicio ciego por pares (7-2 frente al base y 10-1 frente al mejor fine-tune de role-play de Qwen3.5-2B que el autor probo); segundo, ofrece una via de despliegue en cliente (WebGPU, sin backend) util para demos, prototipos y aplicaciones de privacidad estricta. El autor advierte explicitamente de que no es un mecanismo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; el detalle de capas no figura en la informacion proporcionada) |
| Parametros totales | No disponible en la model card; fuentes externas (gemma4.dev) cifran el base E2B en 2,1 mil millones |
| Parametros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | 6.000 tokens en el entrenamiento del ajuste; base Gemma 4 E2B: 8K segun gemma4.dev |
| Tipos de cuantizacion | q4f16 (usado en el ejemplo oficial con WebGPU); resto no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (build de transformers.js de ~3,1 GB) |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna del modelo base; se sabe que parte de google/gemma-4-E2B-it, la variante de menor tamano de la familia Gemma 4 de Google DeepMind, disenada para despliegue en dispositivos de borde y CPU. El ajuste fino se aplico como LoRA con rango 16 sobre todas las proyecciones de atencion y de MLP, con una sola epoca, tasa de aprendizaje 2e-5 y contexto de 6.000 tokens, calculando la perdida en cada turno del personaje. El adaptador resultante se fusiono en los pesos base. La build en navegador se genero trasplantando los pesos al grafo de onnx-community/gemma-4-E2B-it-ONNX; el autor afirma que el exportador reproduce todos los tensores publicados de forma bit-exacta sobre los pesos base.

Los datos de entrenamiento suman 1.342 conversaciones: 667 conversaciones de role-play SFW procedentes de beyoru/Aesir-Character-CoT-roleplay, cribadas con filtro de seguridad y truncadas antes del primer turno que contuviese terminologia sexual; 273 copias de esas mismas conversaciones con la tarjeta de personaje acortada; y 402 ejemplos generales de instruccion y razonamiento. No se documentan fases de RLHF ni DPO, ni decodificacion especulativa u otras optimizaciones de inferencia. El contexto maximo empleado en entrenamiento fue de 6.000 tokens.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a interpretar personajes con una tarjeta definida en el mensaje de sistema.
- Role-play e ficcion interactiva: mantiene estilo, registro y rasgos del personaje a lo largo de varios turnos.
- Formato de acciones entre asteriscos y dialogo, segun el ejemplo de la model card.
- Razonamiento e instrucciones generales heredados del modelo base (402 ejemplos de instruccion y razonamiento en el dataset).
- Soporte de conversaciones multi-turno con historial completo en el array `messages`.
- Ejecucion en navegador mediante WebGPU y Transformers.js (>= 4.3.0), con `pipeline("text-generation", ...)`.
- Carga alternativa con `AutoModelForCausalLM` / `Gemma4ForCausalLM`.
- No dispone de encoder de vision ni de audio segun el propio autor; la build es de solo texto.
- No se documenta soporte de tool calling, function calling ni uso como agente.

## Casos de uso

- Prototipado de chat de personajes en el navegador: se carga la build ONNX con WebGPU y una tarjeta de personaje en el `system`, sin backend ni servidor de inferencia, ideal para demos y validacion rapida de producto.
- Ficcion interactiva SFW: el modelo mantiene el papel del personaje y el hilo argumental en sesiones de varios turnos, con contexto de hasta 6.000 tokens de entrenamiento.
- NPC de videojuegos o experiencias web: puede generar dialogos de personajes con personalidad fija ejecutandose en el propio cliente, reduciendo coste de servidor y latencia de red.
- Aplicaciones con requisitos de privacidad: al correr integramente en el navegador del usuario, los textos de la conversacion no abandonan el dispositivo.
- Asistente conversacional con tono controlado: mediante una tarjeta de personaje se fija voz, registro y limites de contenido para atencion o acompanamiento tematico.
- Educacion y tutoria con personajes: el modelo permite encarnar un personaje didactico (por ejemplo, un personaje historico) apoyandose en los ejemplos de instruccion y razonamiento del entrenamiento.
- Generacion de dialogos para escritura creativa: util para redactar bocetos de escenas y replicas con una voz consistente antes de una edicion humana.

## Benchmarks y rendimiento

El autor reporta un juicio ciego por pares sobre un subconjunto de un benchmark de role-play. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Comparacion (juicio ciego por pares) | Resultado |
|---|---|
| Frente al modelo base google/gemma-4-E2B-it | 7 - 2 a favor de este modelo |
| Frente al mejor fine-tune de role-play de Qwen3.5-2B del autor | 10 - 1 a favor de este modelo |

El autor remite a REPORT.md (incluido en el repositorio) para el detalle del metodo, las puntuaciones por dimension, las pruebas de seguridad y las advertencias. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con cuantizacion q4 en torno a 2,1 mil millones de parametros, el peso ocupa aproximadamente 1,1-1,3 GB y el uso total suele situarse en el rango de 2-3 GB (estimacion, no dato del autor).
- El repositorio completo pesa ~3,1 GB, lo que sugiere que incluye varios dtypes ademas del q4f16 del ejemplo.
- Cabe en GPU de consumo: la ejecucion de referencia es WebGPU en navegador, lo que abarca GPU integradas y dedicadas compatibles con WebGPU.
- Segun gemma4.dev, la variante E2B base puede ejecutarse enteramente en CPU, lo que abre despliegue en equipos sin GPU dedicada y en dispositivos de borde.
- Opciones de despliegue documentadas: Transformers.js (WebGPU) y carga con `AutoModelForCausalLM` / `Gemma4ForCausalLM`. No se documentan vLLM, llama.cpp, Ollama ni TGI para esta build ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/gemma-4-E2B-it-roleplay-ONNX | No confirmado (base E2B ~2,1B segun gemma4.dev) | 6K en entrenamiento | Role-play SFW en navegador | apache-2.0 | ONNX / transformers.js |
| google/gemma-4-E2B-it (base) | No disponible en la ficha; ~2,1B segun gemma4.dev | 8K segun gemma4.dev | Modelo de proposito general | No disponible en la informacion proporcionada | Safetensors y otras |
| Fine-tune de role-play de Qwen3.5-2B (del mismo autor) | 2B aprox. | No disponible | Role-play | No disponible | No disponible |
| onnx-community/gemma-4-E2B-it-ONNX | No disponible | No disponible | Grafo ONNX base | No disponible | ONNX |

El autor solo aporta comparacion cualitativa (juicio por pares) frente al base y frente a su fine-tune de Qwen3.5-2B; no hay tabla de parametros, contexto o rendimiento numerico mas alla de lo indicado.

## Limitaciones y advertencias

- No es un mecanismo de seguridad: con una instruccion SFW en la tarjeta, el modelo genero contenido sexual en 3 de 12 pruebas prohibidas (que incluian menores, falta de consentimiento o incesto); el Gemma base lo hizo en 7 de 12. Debe desplegarse tras un guard de aplicacion con instruccion SFW fija y filtrado de entrada y salida.
- No debe ofrecerse a menores sin esos controles.
- Como todo modelo pequeno, puede salirse del personaje, olvidar hechos o afirmar datos incorrectos en sesiones largas (riesgo de alucinacion reconocido por el autor).
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Contexto de entrenamiento limitado a 6.000 tokens; no se garantiza un comportamiento fiable mas alla de esa longitud.
- La build es de solo texto segun el autor (sin encoder de vision ni audio), aunque entre las etiquetas del repositorio figura "image-text-to-text"; conviene tratar esa etiqueta como inconsistente con la model card.
- Procede de una familia Gemma 4 y de un dataset de terceros; la licencia declarada es apache-2.0, pero el autor remite a Gemma 4 y a los datos de entrenamiento como origen de dicha licencia, por lo que conviene verificar las condiciones del modelo base antes de uso comercial.
- Repositorio reciente y sin traccion (0 descargas, 0 likes en el momento del registro) y sin benchmarks estandar publicados; el unico respaldo de calidad es la evaluacion por pares del propio autor, no replicada de forma independiente.
- No se documentan capacidades de tool calling, agentes ni function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skillsafe-ai/gemma-4-E2B-it-roleplay-ONNX
- Discusiones del repositorio: https://huggingface.co/skillsafe-ai/gemma-4-E2B-it-roleplay-ONNX/discussions
- Informe de evaluacion del autor: REPORT.md (en el propio repositorio)
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Grafo ONNX de origen: https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX
- Dataset de entrenamiento: https://huggingface.co/datasets/beyoru/Aesir-Character-CoT-roleplay
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Ficha de Gemma 4 E2B (fuente externa sobre especificaciones del base): https://gemma4.dev/models/gemma-4-e2b
- Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
