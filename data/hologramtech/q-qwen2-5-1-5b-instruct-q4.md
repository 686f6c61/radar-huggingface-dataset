# HOLOGRAMTECH/q-qwen2.5-1.5b-instruct-q4

## Resumen

`q-qwen2.5-1.5b-instruct-q4` es una redistribución del modelo Qwen2.5-1.5B-Instruct de Alibaba en un formato propietario denominado `.holo`, diseñado para ejecutarse en navegador mediante WebGPU a través del motor Hologram AI. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son los mismos del GGUF original de Qwen, reorganizados en un contenedor direccionable por contenido (content-addressed) que el motor Hologram puede transmitir por streaming.

El autor, HOLOGRAMTECH, parte de la revisión `91cad51170dc346986eccefdc2dd33a9da36ead9` del repositorio oficial `Qwen/Qwen2.5-1.5B-Instruct-GGUF`, concretamente del fichero `qwen2.5-1.5b-instruct-q4_0.gguf` (1.066.227.232 bytes). La transformación preserva 197 tensores Q4_0 y 141 tensores f32, y solo requiere recuantizar la cabeza de salida, que en el origen estaba en Q6_K. El resultado es un único fichero de 953.978.079 bytes.

La relevancia de esta ficha es acotada: el modelo es experimental, no es legible por herramientas GGUF estándar (llama.cpp, Ollama, vLLM) y solo funciona con el motor Hologram. Su interés radica en la propuesta de formato —bloques comprimidos con gzip, nombrados por el BLAKE3 de sus bytes y con un manifest raíz verificable— y en las mediciones de latencia en WebGPU que el autor publica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 |
| Parámetros totales | 1,5 mil millones (heredados del modelo base) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantización | Q4_0 en 197 tensores de pesos; f32 en 141 tensores (normas y sesgos q/k/v); cabeza de salida recuantizada de Q6_K a 4 bits con escala f32 por cada 32 pesos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.holo` (holo-2bit/1, mode `q4`, bits 4, attn_bias true, qk_norm false); no compatible con GGUF ni safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only de 28 capas, anchura 1536, 12 cabezas de atención con 2 cabezas clave-valor (GQA), tamaño de cabeza 128, FFN de 8960 y vocabulario de 151.936 tokens. Incluye sesgos en q, k y v, cabeza de salida separada del embedding y base rotacional de 1e6. No hay ningún entrenamiento adicional: el autor no aporta datos de preentrenamiento, ajuste supervisado ni RLHF propios, sino que hereda íntegramente el pipeline de Alibaba.

La innovación es exclusivamente de empaquetado. El fichero `.holo` contiene una cabecera, el tokenizador embebido (procedente de la cabecera del GGUF original) y bloques de tensores comprimidos con gzip en el orden en que el motor los lee, cada uno identificado por el BLAKE3 de sus bytes almacenados. Un bloque q4 se estructura como `[codes N*K/2 bytes][escala f32 por cada 32 pesos]`, y cada peso se reconstruye como `scale * (code - 8)`. El manifest raíz (`sha256:2147533113fbe3634ae3e1fceaf2fe0f6d72dbd948e6ab78c6a9f6924fc1348b`) permite verificar la integridad de la cadena completa.

## Capacidades

- Generación de texto conversacional en modo instruct, heredada del Qwen2.5-1.5B-Instruct original.
- Razonamiento básico y respuesta a instrucciones de complejidad media, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas elementales, con las mismas limitaciones que el modelo base.
- Soporte multilingüe heredado del modelo base (el autor no documenta la lista de idiomas en esta ficha).
- Ejecución en navegador mediante WebGPU, sin instalación de runtime nativo.
- Verificación de integridad por contenido: cada bloque tensor lleva su propio hash BLAKE3.
- Streaming del fichero: el motor puede cargar bloques en el orden en que los necesita.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Demostraciones interactivas en navegador: el modelo se sirve desde una página web y se ejecuta en la GPU integrada del portátil mediante WebGPU, sin backend ni instalación. Es adecuado por su tamaño reducido (menos de 1 GB) y por la latencia medida de 156 ms al primer token con prompts de 41 tokens.
- Prototipado de aplicaciones de chat sin infraestructura: permite validar flujos conversacionales en el cliente antes de invertir en servidores, usando el mismo tokenizador y los mismos pesos que el modelo de referencia.
- Verificación de integridad en cadena de suministro de modelos: el formato content-addressed con manifest raíz SHA-256 y bloques BLAKE3 sirve como caso de estudio para pipelines que necesitan demostrar que los pesos servidos no han sido alterados.
- Evaluación comparativa de motores de inferencia: el autor publica métricas del motor Hologram frente al motor Q original sobre el mismo fichero, lo que permite reproducir la comparación en hardware consumer.
- Educación y experimentación con cuantización: el formato q4 con escala f32 por grupo de 32 pesos y la recuantización de la cabeza de salida son un ejemplo concreto de cómo se manipulan tensores cuantizados a bajo nivel.
- Despliegue en entornos con restricciones de instalación: al ejecutarse en el navegador, encaja en escenarios donde no se pueden instalar binarios nativos (equipos corporativos bloqueados, quioscos, aulas).

## Benchmarks y rendimiento

El autor publica mediciones de inferencia en un portátil con GPU integrada Radeon RDNA-3, Chromium y WebGPU, con el fichero servido en local, decodificación greedy y ejecuciones en frío:

| Métrica | Motor Hologram AI | Motor Q original |
|---|---|---|
| Primer token, prompt de 41 tokens | 156 ms | 545 ms |
| Primer token, prompt de ~430 tokens | 1,85 s | 5,0 s |
| Tokens por segundo, prompt de ~430 tokens | 70,7 | 73,6 |

Ambos motores produjeron los mismos tokens en todas las pruebas medidas. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en torno a 1 GB para los pesos en formato q4 (el fichero ocupa 953.978.079 bytes), más overhead de activaciones y contexto.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chromium; el autor valida una Radeon RDNA-3 integrada. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: sí, por tamaño; el requisito real es soporte de WebGPU en el navegador, no la potencia de la GPU.
- Opciones de despliegue: exclusivamente el motor Hologram AI (`prism-hologram-ai`) o el motor Q original. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que leen GGUF y no este formato.
- Latencia y throughput: 156 ms al primer token con 41 tokens de prompt y 70,7 tokens/s con prompts de ~430 tokens en la configuración medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `q-qwen2.5-1.5b-instruct-q4` (esta ficha) | 1,5B | no disponible | `.holo` | Apache 2.0 | Solo motor Hologram |
| `Qwen/Qwen2.5-1.5B-Instruct-GGUF` | 1,5B | no disponible en esta ficha | GGUF | Apache 2.0 | llama.cpp, Ollama y otros lectores GGUF |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,5B | no disponible en esta ficha | safetensors | Apache 2.0 | vLLM, TGI, transformers |

La comparación relevante es de empaquetado, no de capacidad: los tres comparten pesos y arquitectura, y difieren en el runtime que los consume. El modelo de esta ficha solo es utilizable si se adopta el motor Hologram; el GGUF y el safetensors del mismo modelo base ofrecen un ecosistema de despliegue mucho más amplio.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor; no hay garantía de estabilidad del formato ni del motor.
- Incompatible con el ecosistema GGUF: llama.cpp, Ollama, vLLM y TGI no pueden leer el fichero `.holo`.
- Dependencia de un único runtime (Hologram AI engine o el motor Q original), lo que limita la portabilidad y aumenta el riesgo de abandono del proyecto.
- Solo 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- El autor no documenta la lista de idiomas soportados ni el contexto efectivo en este empaquetado.
- Al ser una recuantización parcial (cabeza de salida de Q6_K a 4 bits), puede haber una degradación de calidad no medida respecto al GGUF original; no se publican evaluaciones de calidad.
- Riesgo de alucinación y sesgos heredados del Qwen2.5-1.5B-Instruct, agravados por el tamaño reducido del modelo.
- Licencia Apache 2.0, que permite uso comercial, pero el `NOTICE.txt` obliga a declarar las modificaciones; conviene revisarlo antes de redistribuir.
- Las mediciones de rendimiento provienen de un único equipo y una única configuración; no son extrapolables a otros navegadores o GPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HOLOGRAMTECH/q-qwen2.5-1.5b-instruct-q4
- Modelo base (GGUF): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF
- Repositorio del motor Hologram AI: https://github.com/Hologram-Technologies/prism-hologram-ai
