# mrtint0729/kanana-2.1b-diary-dpo-gguf

## Resumen

kanana-2.1b-diary-dpo-gguf es un modelo de lenguaje especializado en la generación de entradas de diario en coreano, desarrollado por el usuario mrtint0729 (vinculado al proyecto Alpharium) a partir del modelo base kakaocorp/kanana-nano-2.1b-instruct de Kakao Corp. El modelo ha sido afinado mediante LoRA SFT seguido de DPO (Direct Preference Optimization) y distribuido en formato GGUF cuantizado Q4_K_M, con un tamano de archivo de 1154,5 MB (aproximadamente 1,13 GiB).

El objetivo del modelo es generar diarios emotivos en coreano de forma instantanea en entornos móviles con un presupuesto de RAM inferior a 2 GB. Para ello se ha optimizado la longitud de salida (300-380 caracteres, equivalentes a 7-8 frases), se ha eliminado el uso de conectores adverbiales mecánicos y se ha forzado un registro de cortesía consistente terminado en "~yo". El modelo adopta la persona de un teléfono móvil llamado "Geumdong-i" que narra lo que ha visto durante el día.

Con 1.816.530.688 parámetros totales (aproximadamente 1,8 mil millones), se trata de un modelo pequeno (sLLM) disenado para inferencia on-device. Su relevancia radica en demostrar un caso de uso muy verticalizado: un modelo de propósito general reutilizado mediante alineamiento por preferencias para una tarea conversacional concreta, con requisitos estrictos de estilo y formato, y desplegable en hardware de gama baja.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de kakaocorp/kanana-nano-2.1b-instruct; detalles específicos no disponibles) |
| Parámetros totales | 1.816.530.688 (aproximadamente 1,8 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (valor usado en los ejemplos de la model card; máximo nativo no disponible) |
| Tipos de cuantización | GGUF Q4_K_M (único publicado) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de kakaocorp/kanana-nano-2.1b-instruct, un transformer decoder-only de aproximadamente 1,8 mil millones de parámetros desarrollado por Kakao Corp. Sobre esta base se aplicó un proceso de ajuste en dos fases: primero LoRA SFT (supervised fine-tuning) y después DPO (Direct Preference Optimization, identificado como EXP-007 en la documentación del autor). El objetivo del DPO fue corregir comportamientos concretos detectados en la generación: repetición de conectores adverbiales mecánicos (como "eoneudeot", "deudieo", "gyeolguk", "mundeuk"), inconsistencias en el registro de cortesía y desajustes temporales entre la hora de la fotografía y el contenido narrado.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset de preferencias ni hiperparámetros del proceso de alineamiento. Tampoco se especifican innovaciones arquitectónicas propias: las mejoras son de alineamiento y de formato de salida, no estructurales. El resultado se distribuye únicamente en GGUF Q4_K_M, lo que sugiere que el flujo de publicación prioriza el despliegue en llama.cpp por encima de la disponibilidad de pesos en precisión completa.

## Capacidades

- Generación de texto narrativo en coreano con registro de cortesía consistente (terminaciones en "~yo").
- Generación de entradas de diario de 300-380 caracteres (7-8 frases) a partir de un prompt estructurado con hora, lugar y descripción de escena.
- Coherencia temporal: alinea el contenido narrado con la franja horaria indicada en el prompt, evitando describir escenas de la manana como si fueran de la tarde.
- Supresión de conectores adverbiales formulaicos gracias al entrenamiento DPO (el autor reporta 0,00 apariciones).
- Mantenimiento de una persona narrativa concreta (el teléfono móvil "Geumdong-i") a lo largo de la generación.
- Formato conversacional compatible con la plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`), tal como muestran los ejemplos de la model card.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Generación automática de diarios en aplicaciones móviles: el modelo recibe metadatos del día (fotos, hora, ubicación) y produce una entrada narrativa en coreano de longitud fija, con un consumo de RAM compatible con dispositivos de gama media.
- Funcionalidad de "diario del dispositivo" en asistentes personales: la persona narrativa del teléfono permite crear una experiencia de diario narrado desde la perspectiva del propio dispositivo, sin necesidad de un LLM en la nube.
- Prototipado rápido de aplicaciones de escritura creativa en coreano: al ser un GGUF de 1,13 GiB, se puede integrar en demos locales con llama-cpp-python sin infraestructura GPU dedicada.
- Investigación sobre alineamiento por preferencias en modelos pequenos: sirve como caso de estudio de cómo DPO corrige defectos estilísticos concretos (conectores formulaicos, registro inconsistente) en un modelo de menos de 2 B de parámetros.
- Evaluación de pipelines on-device: con 20,8 tokens/s y 4,69 s de latencia media por entrada de 370 caracteres, es adecuado para probar arquitecturas de inferencia local en movilidad.
- Generación de contenido de bienestar o journaling con restricciones de estilo: aplicaciones que requieren un tono sereno, uniforme y sin muletillas, con control estricto de longitud y estructura de apertura ("oneul ju-in-i na-ege boyeo jun geos-eun ~ieoss-eoyo").
- Filtrado y validación de salidas en producción: el autor reporta una tasa de aprobación del 100% (6/6) en sus contratos de aceptación y guardarraíles estrictos (longitud, terminaciones, coherencia temporal, escenificación), lo que lo hace apto para pipelines con validación automática.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de inferencia on-device del autor (EXP-008), no benchmarks académicos estándar:

| Métrica | Valor | Condiciones |
|---|---|---|
| Tamano del archivo GGUF | 1,127 GiB (1154,5 MB) | Q4_K_M |
| Velocidad de generación | 20,8 tokens/s | Inferencia on-device |
| Tiempo de inferencia | 4,69 s de media | Entrada de diario de ~370 caracteres |
| Tasa de aprobación de contratos | 100,0% (6/6) | `acceptance.ts` de Alpharium |
| Tasa de aprobación de guardarraíles estrictos | 100,0% (6/6) | Longitud, terminaciones, coherencia temporal, escenificación |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, KLUE u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,2-1,5 GB con la cuantización Q4_K_M (el archivo pesa 1,127 GiB); el autor indica que encaja en un presupuesto de RAM de 2 GB en móvil.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU consumer con 2 GB o más de VRAM puede ejecutarlo (por ejemplo, GTX 1650, RTX 3050 en adelante). También es viable en CPU.
- Cabe en GPU consumer: sí, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (llama-cli, llama-completion), llama-cpp-python; compatible con endpoints según los tags del repositorio. No se documenta soporte específico para vLLM, TGI u Ollama, aunque al ser GGUF estándar debería poder cargarse en Ollama.
- Latencia y throughput: 20,8 tokens/s y 4,69 s por generación de ~370 caracteres según las mediciones del autor en entorno móvil; no se especifica el hardware exacto empleado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| kanana-2.1b-diary-dpo-gguf | ~1,8 B | 2048 (usado) | Coreano | Apache-2.0 | GGUF Q4_K_M | Diario coreano on-device |
| kakaocorp/kanana-nano-2.1b-instruct | ~1,8 B | No disponible | Coreano (principal) | Apache-2.0 (según este repo) | Safetensors y otros | Instrucciones generales |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32 768 | Multilingüe | Apache-2.0 | Safetensors, GGUF | Instrucciones generales |
| Llama-3.2-1B-Instruct | ~1,2 B | 131 072 | Multilingüe | Llama 3.2 Community License | Safetensors, GGUF | Instrucciones generales |

La comparación con Qwen2.5-1.5B-Instruct y Llama-3.2-1B-Instruct se ofrece como referencia de categoria (sLLM de 1-2 B), pero no se dispone de datos de rendimiento comparativos en la información proporcionada. La ventaja diferencial de este modelo es la especialización vertical en diario coreano y su empaquetado listo para on-device; su desventaja es la falta de versatilidad fuera de esa tarea y la ausencia de benchmarks públicos.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la generación de diarios en coreano con la persona "Geumdong-i" y el formato de prompt previsto, su rendimiento no está documentado y probablemente sea inferior al de su modelo base.
- Solo soporta coreano; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Contexto de 2048 tokens en los ejemplos: insuficiente para conversaciones largas o documentos extensos; el máximo nativo del modelo base no se especifica.
- Riesgo de alucinación inherente a los LLM: puede inventar detalles de escenas, lugares o actividades no presentes en el prompt, aunque el entrenamiento DPO busca mitigar desajustes temporales.
- Sesgos: no se documenta ninguna evaluación de sesgos; al estar entrenado sobre un modelo coreano, puede reflejar sesgos culturales y lingüísticos del corpus original de Kakao.
- Licencia Apache-2.0 permite uso comercial, pero el autor remite a la licencia del modelo base; conviene verificar las condiciones de kakaocorp/kanana-nano-2.1b-instruct antes de desplegarlo en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad.
- Los benchmarks reportados (100% de aprobación en 6/6 casos) proceden de los propios contratos de aceptación del autor, con una muestra muy pequena; no deben interpretarse como una evaluación independiente.
- La model card está redactada íntegramente en coreano, lo que puede dificultar su adopción por parte de desarrolladores no coreanohablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrtint0729/kanana-2.1b-diary-dpo-gguf
- Modelo base: https://huggingface.co/kakaocorp/kanana-nano-2.1b-instruct
- Repositorio de ingeniería del autor ("terrarium"): no disponible como enlace público en la información proporcionada
- Paper o blog técnico del modelo: no disponible
- Demo: no disponible
