# decido-ai/decido-1-fast-1.7b

## Resumen
Decido-1-Fast (1.7B) es un modelo de decisión calibrada desarrollado por decido-ai, obtenido mediante ajuste fino completo de Qwen3-1.7B. Su propósito no es la generación de texto libre, sino responder preguntas estructuradas sobre un documento (texto o JSON) devolviendo distribuciones de probabilidad calibradas: preguntas de sí/no, elección entre opciones y escalas ordenadas. Está destilado de Decido-1 (26B-A4B) sobre 1M de preguntas, la mitad etiquetadas con respuestas gold y la mitad por el propio Decido-1.

El modelo resuelve el problema de convertir documentos no estructurados en decisiones operativas con confianza cuantificable, algo relevante para pipelines de automatización donde se necesita no solo una etiqueta sino una probabilidad fiable. Con 1.720.574.976 parámetros, corre en CPU de portátil con aproximadamente 8 GB de RAM y reporta 0,64 s por documento de 1k tokens con 5 preguntas en un M4 Pro (0,30 s en GPU Mac).

Comparte API y formatos de pregunta con el resto de la familia Decido 1, lo que permite intercambiar modelos según requisitos de latencia y precisión. Se distribuye en safetensors y GGUF (Q8_0 para CPU), con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B, ajuste fino completo) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (usado en los resultados de CPU); bf16 en GPU; otros no disponibles |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-1.7B, un transformer decoder-only denso, y se somete a un ajuste fino completo (no LoRA) para convertirlo en un modelo de decisión. El entrenamiento es una destilación sobre 1M de preguntas: aproximadamente la mitad etiquetadas con respuestas gold y la otra mitad generadas por Decido-1 (26B-A4B), el modelo grande de la familia. El objetivo es imitar el comportamiento de decisión calibrada del profesor en un tamaño mucho menor.

La innovación principal no está en la arquitectura sino en la interfaz y el tratamiento de la entrada: el documento se trata como dato no confiable (las instrucciones embebidas en él no se siguen y las cadenas de tokens de control se neutralizan), y la salida es una distribución de probabilidad sobre opciones o niveles de escala, no texto. Soporta el formato de cable Jev 1.13 (noul, choice con 1-255 opciones, score con 2-10 niveles) y devuelve respuestas estilo Jev con probabilidades, confianza y leyenda.

## Capacidades
- Decisión sobre documentos: responde preguntas de sí/no, elección única entre opciones y escalas ordenadas, devolviendo probabilidades por clase.
- Calibración de confianza: salida con probabilidades y ECE/Brier medidos, apta para umbrales operativos.
- Entrada de documento en texto o JSON, tratada como dato no confiable con neutralización de instrucciones y tokens de control.
- Formatos de pregunta múltiples: cadena simple (sí/no), objeto con lista de opciones, objeto con descripciones por clave, y escala ordenada.
- Compatibilidad con el formato de cable Jev 1.13 mediante `m.predict({"state": ..., "questions": ...})`.
- API de Python (`decido-ai`), CLI (`decido run`) y servidor HTTP (`decido serve`) compatible con clientes Jev existentes (`POST /v1/systemone`).
- No es un modelo conversacional ni de generación libre; la model card marca `inference: false` para uso genérico con transformers.

## Casos de uso
- Triaje de tickets de soporte: clasificar un correo o mensaje de cliente en equipo responsable (facturación, envío, técnico) y urgencia con probabilidades, usando la API de preguntas con opciones y escala; el umbral de confianza permite derivar a revisión humana los casos dudosos.
- Enrutamiento de solicitudes de reembolso: decidir sí/no sobre si el cliente pide reembolso y con qué confianza, integrándolo en un flujo de aprobación automática cuando la probabilidad supera un umbral calibrado.
- Extracción de decisiones en documentos JSON: procesar payloads estructurados de formularios o APIs y responder preguntas de clasificación sobre ellos, aprovechando el tratamiento de la entrada como dato no confiable.
- Moderación y políticas: evaluar si un contenido cumple una política concreta mediante preguntas sí/no y escalas de gravedad, con distribuciones que permiten priorizar revisiones.
- Automatización en CPU sin GPU: desplegar en portátiles o servidores sin acelerador (unos 8 GB de RAM, 0,64 s por documento de 1k tokens con 5 preguntas) para tareas de clasificación por lotes o en el borde.
- Migración desde Jev: sustituir un cliente Jev existente apuntando el SDK a `decido serve` sin cambios de código, útil para equipos que ya usan el formato Jev 1.13 y quieren un modelo local pequeño.
- Clasificación masiva de documentos: procesar grandes volúmenes con GGUF Q8_0 en CPU donde el coste por inferencia y la latencia importan más que la precisión máxima del modelo grande.

## Benchmarks y rendimiento

Resultados de los seis grupos de benchmark de la comunidad Jev-reproduction (copias congeladas, mismo harness para todos los modelos). Puntuación = métrica de tipo accuracy por grupo, luego media.

| Grupo de benchmark | Decido-1-Fast CPU (Q8_0 GGUF) | Decido-1-Fast GPU (bf16) | Decido-1 CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 72,31 | 70,83 | 87,61 | 87,18 |
| Kev | 71,96 | 71,82 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 62,74 | 62,70 | 78,37 | 72,96 |
| Nimble | 58,87 | 59,22 | 87,23 | 91,84 |
| VitaminC | 84,47 | 84,64 | 86,14 | 78,46 |
| MASSIVE | 87,71 | 87,71 | 88,57 | 87,14 |
| **Media de los seis grupos** | **73,01** | **72,82** | **85,38** | **83,85** |

Calibración (CPU, GGUF distribuido):

| Comprobación | Brier | Jev 1.13 (Brier) | ECE | Jev 1.13 (ECE) |
|---|---:|---:|---:|---:|
| JevBench | 0,350 | 0,181 | 0,023 | 0,032 |
| Kev v4 dev | 0,420 | 0,211 | 0,103 | 0,049 |
| Kev v9 dev | 0,506 | 0,212 | 0,096 | 0,034 |
| VitaminC | 0,232 | 0,313 | 0,032 | 0,104 |
| MASSIVE | 0,169 | 0,204 | 0,032 | 0,075 |

Según el autor, Brier es igual o mejor que Jev en 2 de 5 comprobaciones y ECE en 3 de 5; la calibración es claramente peor que Jev en los conjuntos Kev.

Latencia reportada en M4 Pro (documento de 1k tokens, 5 preguntas): 0,64 s en CPU y 0,30 s en GPU Mac.

## Requisitos de hardware
- RAM estimada: aproximadamente 8 GB para ejecución en CPU con el GGUF Q8_0 distribuido.
- VRAM: no disponible de forma explícita; en bf16 el modelo de 1,7B requiere del orden de 3,5 GB solo para pesos, más overhead de activaciones y contexto.
- GPU recomendadas: no especificadas por el autor; los resultados GPU se reportan en bf16 sin indicar el hardware exacto.
- Cabe en GPU de consumo: sí, por tamaño (1,7B en bf16 o cuantizado), aunque el autor no publica cifras por tarjeta.
- Despliegue: paquete `decido-ai` (pip, macOS Apple Silicon, Linux y Windows, precompilado), CLI `decido run`, servidor HTTP `decido serve` con API compatible con Jev, y GGUF para llama.cpp (los resultados de CPU usan llama.cpp; OpenJev en GPU usa llama.cpp CUDA).
- Latencia: 0,64 s en CPU y 0,30 s en GPU Mac para 1k tokens y 5 preguntas en M4 Pro. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Ejecución | Puntuación seis grupos | Licencia |
|---|---|---|---|---|---|
| Decido-1-Fast (este) | Qwen3-1.7B | 1,7B | CPU portátil (~8 GB RAM) | 73,01 (CPU) | Apache-2.0 |
| Decido-1-Ultra | Qwen3-0.6B | 0,6B | CPU portátil (~4 GB RAM) | 62,16 (CPU) | no disponible en la información |
| Decido-1 | Gemma-4-26B-A4B | 26B (MoE, A4B) | CPU portátil (~30 GB RAM) o GPU | 85,38 (CPU) | no disponible en la información |
| Decido-1-Max | Gemma-4-26B-A4B | 26B (MoE, A4B) | portátil lento, GPU | 89,23 (GPU) | no disponible en la información |

Frente a modelos de propósito general del mismo tamaño (por ejemplo, Qwen3-1.7B base), la comparación directa no está disponible porque Decido-1-Fast está especializado en decisión calibrada y no en generación libre; los benchmarks reportados son específicos del ecosistema Jev y no incluyen MMLU, HumanEval ni GSM8K.

## Limitaciones y advertencias
- Solo inglés: el campo de idiomas declara únicamente `en`; el rendimiento en castellano u otros idiomas no está evaluado.
- No es un modelo generativo conversacional: la model card marca `inference: false` para uso genérico con transformers; está pensado para la API de decisión de decido-ai.
- Calibración desigual: el autor reconoce que en los conjuntos Kev el Brier y el ECE son claramente peores que Jev 1.13 (por ejemplo, ECE 0,103 y 0,096 frente a 0,049 y 0,034), por lo que los umbrales de confianza deben validarse en el dominio de uso.
- Brecha de precisión frente al modelo grande: media de 73,01 frente a 85,38 de Decido-1 en CPU; Nimble es el grupo más débil (58,87 frente a 87,23).
- Riesgo de alucinación no cuantificado: aunque la salida es una distribución sobre opciones, no hay datos publicados sobre comportamiento ante documentos ambiguos o adversariales más allá de la neutralización de instrucciones.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero la información no detalla condiciones adicionales del ecosistema (API Jev, paquete decido-ai).
- Longitud de contexto no disponible: no se puede garantizar el comportamiento con documentos largos.
- Latencia medida solo en M4 Pro; no hay datos de throughput ni de otras plataformas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Modelo profesor Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Decido-Web v2-Fast: https://huggingface.co/decido-ai/decido-web-v2-fast
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Documentación y playground: https://getdecido.ai
- Paquete PyPI: https://pypi.org/project/decido-ai/
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
