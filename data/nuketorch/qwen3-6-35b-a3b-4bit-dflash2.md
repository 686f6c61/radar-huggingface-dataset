# NukeTorch/Qwen3.6-35B-A3B-4bit-DFlash2

## Resumen

Qwen3.6-35B-A3B-4bit-DFlash2 es un paquete de distribucion publicado por NukeTorch que agrupa, en una sola descarga, un modelo base cuantizado a 4 bits y su modelo borrador (draft) para decodificacion especulativa. El modelo subyacente es Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture of Experts con 35.000 millones de parametros totales y 3.000 millones activos por token (de ahi el sufijo A3B). El paquete no modifica ningun peso: se limita a fijar las revisiones concretas con las que se midio el runtime NukeTorch N1.0.0.

La propuesta de valor es la velocidad de inferencia en Apple Silicon. El modelo base procede de mlx-community/Qwen3.6-35B-A3B-4bit y el borrador de incoai/Qwen3.6-35B-A3B-DFlash2; ambos se empaquetan juntos para que un unico comando `hf download` entregue una pareja compatible. El runtime NukeTorch sirve el modelo mediante una API compatible con OpenAI chat completions.

Es relevante para desarrolladores que trabajan en Mac con chip M-series y necesitan throughput alto en local. En las mediciones del autor sobre un M5 Max de 48 GB se alcanzan en torno a 510-532 tok/s con aceptacion tipica y 365-377 tok/s con aceptacion exacta, con un consumo de memoria de 26,6 GB en el contexto por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; modelo base Qwen3.6-35B-A3B |
| Parametros totales | 35.000 millones (35B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos del modelo base); borrador DFlash2 sin cuantizacion especificada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX para Apple Silicon) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con capa de mezcla de expertos: 35B parametros totales con 3B activos por token, lo que reduce el coste computacional por paso manteniendo una capacidad de representacion alta. El paquete incluye dos componentes: el modelo principal cuantizado a 4 bits en formato MLX y un modelo borrador DFlash2 para decodificacion especulativa. La decodificacion especulativa consiste en que el borrador propone varios tokens y el modelo principal los verifica en paralelo, aceptando o rechazando cada uno; en Apple Silicon esto permite superar el limite de generacion token a token del modelo grande.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF/DPO, ya que la model card del paquete se limita a documentar la procedencia de los pesos y las mediciones de rendimiento. La innovacion tecnica destacable es el propio empaquetado: fijar revisiones exactas de modelo y borrador que han sido medidas juntas, evitando incompatibilidades entre versiones.

## Capacidades

- Generacion de texto y razonamiento: el autor menciona explicitamente "reasoning on" en sus pruebas, lo que indica soporte de modo razonamiento.
- Generacion de codigo: se midio con 16 prompts de programacion, lo que sugiere capacidad para tareas de codigo.
- Decodificacion especulativa: integracion con modelo borrador DFlash2 para acelerar la generacion.
- Servicio via API compatible con OpenAI chat completions.
- Conversaciones multi-turno: se probo con cinco prompts de demostracion como una sola conversacion.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.

## Casos de uso

- Inferencia local en Mac con chip M-series: el paquete esta disenado para Apple Silicon y el runtime NukeTorch se distribuye como binario macOS arm64. Un desarrollador puede servir el modelo en local sin GPU dedicada, con 26,6 GB de memoria en el contexto por defecto.
- Asistente de codigo en el editor: con ~500 tok/s de generacion se puede integrar en un flujo de autocompletado o chat de codigo donde la latencia percibida importa; el modelo se sirve por API compatible con OpenAI, lo que permite conectarlo a clientes existentes.
- Prototipado rapido de aplicaciones LLM: al exponer una API compatible con OpenAI en el puerto 8080, se puede apuntar cualquier SDK o framework que hable ese protocolo sin adaptadores.
- Evaluacion de decodificacion especulativa: util para investigadores que quieran medir la tasa de aceptacion de un borrador DFlash2 sobre un modelo MoE de 35B en hardware consumer.
- Procesamiento por lotes en estacion de trabajo: con 48 GB de memoria se pueden encadenar peticiones (el autor probo cinco prompts como conversacion y como peticiones separadas) para tareas de generacion de texto a media escala.
- Desarrollo sin conexion: al descargar el paquete completo con un solo comando, se puede trabajar en local sin depender de APIs externas, util en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Mediciones del autor sobre un M5 Max de 48 GB, un usuario, razonamiento activado, NukeTorch N1.0.0:

| Prueba | Aceptacion tipica (por defecto) | Aceptacion exacta |
|---|---:|---:|
| Cinco prompts de demo como una conversacion, limite 1.024 tokens, primera pasada (media de 3 pasadas: 530,6) | 532,5 tok/s | no medido |
| Cinco prompts de demo, cada uno como peticion nueva, 3 pasadas, sin limite de tokens | 510,0 tok/s | 365,0 tok/s |
| 16 prompts de codigo, 2 semillas, limite 1.024 tokens | 516,6 tok/s | 377,7 tok/s |

Memoria en el contexto por defecto: 26,6 GB. El autor indica que el paquete distribuido devuelve las mismas respuestas token a token y que sus mejores ejecuciones fueron 521,5, 501,6 y 510,5 tok/s en el orden de la tabla. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 26,6 GB en el contexto por defecto segun el autor.
- Hardware de referencia: Apple M5 Max con 48 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el paquete esta orientado a Apple Silicon.
- Cabe en GPU consumer: no disponible para CUDA; en Apple Silicon requiere un chip con al menos ~32 GB de memoria unificada para margen operativo, aunque el autor solo documento 48 GB.
- Opciones de despliegue: runtime NukeTorch N1.0.0 (binario macOS arm64) con `nuketorch-serve http`; descarga via `hf download` de huggingface_hub. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 510-532 tok/s con aceptacion tipica y 365-377 tok/s con aceptacion exacta en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-4bit-DFlash2 (este paquete) | 35B totales / 3B activos | no disponible | 510-532 tok/s (M5 Max 48 GB) | Apache-2.0 | Hugging Face, runtime NukeTorch |
| Qwen/Qwen3.6-35B-A3B (modelo base sin cuantizar) | 35B totales / 3B activos | no disponible | no disponible | Apache-2.0 | Hugging Face |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35B totales / 3B activos | no disponible | no disponible | Apache-2.0 | Hugging Face |
| incoai/Qwen3.6-35B-A3B-DFlash2 (borrador) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Paquete de conveniencia, no un modelo nuevo: no aporta mejoras de calidad respecto al modelo base; solo fija revisiones y agrupa modelo y borrador.
- Dependencia del runtime NukeTorch: la licencia del runtime es gratuita para individuos, escuelas, organizaciones sin animo de lucro, proyectos open source no comerciales y empresas con menos de 10 millones de USD de ingresos y 250 personas. Fuera de esos supuestos se requiere licencia comercial, aunque los pesos sean Apache-2.0.
- Plataforma limitada: el binario documentado es macOS arm64; no hay instrucciones para Linux, Windows ni CUDA.
- Sin datos de calidad: no se publican resultados de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinacion.
- Idiomas no documentados: se desconoce la cobertura linguistica real.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion muy limitado; conviene verificar el comportamiento en produccion antes de adoptarlo.
- Rendimiento medido en un unico hardware (M5 Max 48 GB): el throughput en otros chips o configuraciones puede diferir sustancialmente.

## Enlaces

- Hugging Face: https://huggingface.co/NukeTorch/Qwen3.6-35B-A3B-4bit-DFlash2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo cuantizado de origen: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Modelo borrador: https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Runtime NukeTorch: https://github.com/NukeTorch/nuketorch
- Instalador N1.0.0: https://github.com/NukeTorch/nuketorch/releases/download/n1.0.0/install.sh
