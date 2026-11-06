# decido-ai/decido-1-ultra-0.6b

## Resumen

Decido-1-Ultra (0.6B) es un modelo de decisión calibrada desarrollado por decido-ai, obtenido mediante fine-tuning completo de Qwen3-0.6B para imitar el comportamiento de Decido-1 (26B-A4B) por destilación sobre 1M de preguntas etiquetadas a partes iguales por respuestas gold y por Decido-1. Su propósito no es la generación libre de texto, sino responder preguntas estructuradas sobre un documento (sí/no, elección entre opciones, escalas ordenadas) devolviendo distribuciones de probabilidad calibradas.

El modelo se presenta como la variante de menor latencia de la familia Decido 1: procesa un documento de ~1k tokens con 5 preguntas en 0,41 s p50 en CPU de portátil (Apple M4 Pro, Q8_0, 10 hilos), con un consumo de RAM de aproximadamente 1,5 GB. Está pensado para despliegue en CPU sin GPU, con integración vía la librería `decido-ai`, CLI, servidor HTTP compatible con la API Jev (`POST /v1/systemone`) y llama.cpp.

La relevancia actual radica en su enfoque: extraer decisiones estructuradas y probabilísticas de documentos sin depender de un LLM grande, con un formato de cableado estandarizado (Jev 1.13) y pesos en safetensors (bf16) y GGUF (Q8_0). No obstante, su score de seis grupos (62,16 en CPU) queda muy por debajo de Decido-1 (85,38) y de Jev 1.13 (83,85), por lo que su valor está en el coste y la latencia, no en la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B, fine-tuning completo) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 GGUF (CPU); bf16 en safetensors |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se somete a fine-tuning completo (no se especifica si con LoRA u otra técnica; la model card indica "fully fine-tuned"). El entrenamiento es una destilación sobre 1M de preguntas, etiquetadas la mitad por respuestas gold y la mitad por Decido-1 (26B-A4B). No se detallan el número total de tokens de entrenamiento ni la composición completa del dataset más allá de esa descripción.

La innovación técnica no reside en la arquitectura, sino en el mecanismo de lectura ("readout"): se usan probabilidades de tokens de etiqueta con temperaturas por tipo de pregunta ajustadas sobre tareas held-out, junto con un prompt compacto (`verdict-fast-t1`) que renderiza documentos JSON sin espacios y bloques de pregunta cortos. El documento se trata como dato no confiable: las instrucciones embebidas no se siguen y las cadenas de tokens de control se neutralizan. No se menciona RLHF ni DPO.

## Capacidades

- Clasificación y decisión estructurada sobre documentos: preguntas de tipo sí/no (`noul`), elección entre 2 y 255 opciones (`choice`) y escalas ordenadas de 2 a 10 niveles (`score`).
- Salida de distribuciones de probabilidad calibradas por opción, con `probabilities` y `confidence` en el formato Jev.
- Acepta documentos en texto o JSON como entrada.
- API unificada con el resto de la familia Decido (`decido.decide`, `decido.predict`).
- Integración con llama.cpp y ejecución en CPU.
- Servidor HTTP compatible con la API Jev 1.13 (`POST /v1/systemone`), lo que permite reutilizar clientes Jev existentes.
- Determinismo bit-exacto en repeticiones sobre CPU.
- Multilingüe: no; solo inglés (`en`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Triaje de tickets de soporte: clasificar un correo o mensaje de cliente en categorías (facturación, envío, técnico) y estimar urgencia en una escala ordenada, con latencia de décimas de segundo en CPU y sin GPU.
- Enrutamiento de documentos entrantes: decidir a qué equipo o cola pertenece un documento JSON o de texto mediante preguntas `choice` con opciones predefinidas, integrándolo en un pipeline de ingestión.
- Moderación y verificación de políticas: responder preguntas sí/no sobre si un texto cumple una política concreta (por ejemplo, si solicita un reembolso), aprovechando la salida probabilística para fijar umbrales.
- Extracción de señales para sistemas de decisión: alimentar un motor de reglas o un clasificador posterior con las probabilidades por opción devueltas por el modelo, en lugar de una etiqueta dura.
- Procesamiento por lotes en entornos sin GPU: al requerir ~1,5 GB de RAM y ejecutarse con llama.cpp, es adecuado para servidores modestos o portátiles que deban procesar muchos documentos con presupuesto de latencia bajo.
- Sustitución de llamadas a LLM grandes en tareas de clasificación simple: cuando la precisión de un modelo grande no es imprescindible, este modelo reduce coste y latencia a cambio de un score de seis grupos de 62,16 frente a 85,38 de Decido-1.
- Prototipado con la API Jev: usar `decido serve` para exponer el modelo en local y apuntar clientes Jev existentes (`TYPESAFE_BASE_URL`) sin cambios de código.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre seis grupos de benchmark (JevBench, Kev, OpenJev con 18 tareas, Nimble, VitaminC y MASSIVE-en; copias congeladas y mismo harness para todos los modelos). La media de los seis grupos es la métrica agregada.

| Grupo de benchmark | Decido-1-Ultra CPU (Q8_0 GGUF) | Decido-1-Ultra GPU (bf16) | Decido-1 CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 57,69 | 57,20 | 87,61 | 87,18 |
| Kev | 60,14 | 60,23 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 47,66 | 47,60 | 78,37 | 72,96 |
| Nimble | 42,55 | 42,20 | 87,23 | 91,84 |
| VitaminC | 80,63 | 80,30 | 86,14 | 78,46 |
| MASSIVE | 84,29 | 84,57 | 88,57 | 87,14 |
| **Media de seis grupos** | **62,16** | **62,02** | **85,38** | **83,85** |

Calibración (CPU, GGUF publicado):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,471 | 0,181 | 0,046 | 0,032 |
| Kev v4 dev | 0,520 | 0,211 | 0,109 | 0,049 |
| Kev v9 dev | 0,596 | 0,212 | 0,101 | 0,034 |
| VitaminC | 0,309 | 0,313 | 0,106 | 0,104 |
| MASSIVE | 0,215 | 0,204 | 0,052 | 0,075 |

Brier igual o mejor que Jev en 1 de 5 comprobaciones y ECE igual o mejor en 1 de 5. El cambio de orden de opciones provoca un 8,8 % de volteos agrupados (Jev: 14,6 %). Velocidad: 0,41 s p50 con 10 hilos en Apple M4 Pro, CPU únicamente, Q8_0, documento de ~1k tokens y 5 preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; en CPU consume aproximadamente 1,5 GB de RAM con el GGUF Q8_0.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. La model card reporta resultados en GPU con bf16, pero sin requisitos de VRAM detallados.
- Cabe en cualquier GPU consumer y en CPU de portátil; el escenario de referencia es Apple M4 Pro.
- Opciones de despliegue: librería `decido-ai` (con `decido build-runtime` en Linux/Intel Mac; en Apple Silicon se omite), CLI (`decido run`), servidor HTTP (`decido serve`, API compatible con Jev) y llama.cpp (GGUF Q8_0).
- Latencia: 0,41 s p50 en CPU (M4 Pro, 10 hilos, Q8_0, ~1k tokens de documento y 5 preguntas). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Media seis grupos | Licencia | Despliegue |
|---|---|---|---:|---:|---|---|
| Decido-1-Ultra (0.6B) | Qwen3-0.6B | 596 M | no disponible | 62,16 (CPU) | apache-2.0 | CPU (~1,5 GB RAM) |
| Decido-1-Fast | Qwen3-1.7B | no disponible | no disponible | 73,01 (CPU) | no disponible | CPU (~3 GB RAM) |
| Decido-1 | Gemma-4-26B-A4B | no disponible | no disponible | 85,38 (CPU) | no disponible | CPU (~30 GB RAM) o GPU |
| Jev 1.13 (referencia publicada) | no disponible | no disponible | no disponible | 83,85 | no disponible | no disponible |

Dentro de la familia, Decido-1-Ultra es la opción de menor latencia (0,41 s frente a 0,64 s de Fast y 4,1 s de Decido-1) y menor huella de memoria, a costa de una precisión claramente inferior. La model card recomienda usar Decido-1 cuando la precisión importa más que la latencia. No se dispone de datos de modelos comparables fuera de la familia Decido.

## Limitaciones y advertencias

- Precisión muy inferior a Decido-1 y a Jev 1.13: media de seis grupos de 62,16 frente a 85,38 y 83,85 respectivamente.
- Calibración débil: Brier y ECE iguales o mejores que Jev solo en 1 de 5 comprobaciones; los valores de Brier en JevBench, Kev v4 y Kev v9 son más del doble que los de Jev.
- Puntos débiles declarados: preguntas de escala ordenada (`score`) y razonamiento multi-paso (Nimble, con 42,55).
- Entrenamiento supervisado in-domain: se usaron los splits de train de varios datasets cuyos splits de test/eval están en los grupos de benchmark (MASSIVE, VitaminC, tareas Open-Jev). La misma receta sin ningún split de train de un dataset puntuado obtiene 82,04, por debajo de Jev (83,85), por lo que el margen sobre Jev debe leerse como supervisado in-domain; Jev se evaluó zero-shot.
- Los números de Jev proceden de la ejecución publicada por AutoTrust, con una dispersión entre ejecuciones de hasta 1,6 puntos.
- Solo inglés; no soporta otros idiomas.
- Riesgo de alucinación en el sentido de asignar probabilidad alta a opciones incorrectas, especialmente en escalas ordenadas y razonamiento multi-paso.
- Volteos por orden de opciones del 8,8 % agrupado: la respuesta puede depender del orden en que se presenten las opciones.
- Licencia apache-2.0, que permite uso comercial; no se documentan restricciones adicionales.
- El documento de entrada se trata como no confiable (no se siguen instrucciones embebidas), pero no se detallan garantías formales de robustez frente a inyección de prompts.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con documentos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Decido-1 (26B-A4B): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast (1.7B): https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Think (26B-A4B): https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-1-Pro: https://huggingface.co/decido-ai/decido-1-pro
