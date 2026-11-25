# siamcafe/bom-ai

## Resumen

BOM AI (identificador `siamcafe/bom-ai`) es un modelo de lenguaje y visión de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) afinado a partir de `DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING`, que a su vez deriva de la familia Qwen3-VL. Lo desarrolla el usuario siamcafe y su propósito declarado es ser un asistente de IA "Thai-first": un modelo que entiende y genera tailandés de forma nativa, lee texto en imágenes y funciona en local sin conexión. La ficha pública corresponde a la línea v0.3.x (v0.3.2, publicada el 30 de octubre de 2026), conservada por el autor como registro histórico de una versión que ya no es la actual.

El problema que aborda es concreto: la mayoría de los modelos abiertos multilingües rinden de forma notablemente inferior en tailandés que en inglés o chino, y con frecuencia filtran caracteres han (CJK) en las respuestas en tailandés. BOM AI ataca ambos problemas mediante un ajuste supervisado en tres rondas y, sobre todo, una gramática GBNF que restringe el vocabulario de salida a un conjunto de tokens permitidos, eliminando por completo la fuga de caracteres CJK (0 de 250 casos en la puerta de calidad declarada).

La relevancia actual del modelo es doble: por un lado, demuestra un patrón de despliegue práctico (cuantización Q4_K_M en GGUF, proyector visual separado en f16, distribución vía Ollama) que cabe en hardware de consumo; por otro, ilustra una técnica poco habitual, el uso de gramáticas de decodificación como mecanismo de control de idioma en producción, en lugar de confiar únicamente en el ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (vision-language), transformer multimodal |
| Parámetros totales | 4.205.751.296 (~4,2 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF, ~3,4 GB), bf16 (GGUF) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`, `model-bf16.gguf`, `mmproj-f16.gguf`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL, con un codificador visual acoplado mediante un proyector multimodal que se distribuye como archivo independiente (`mmproj-f16.gguf`). Sobre esa base, el autor aplicó tres rondas de ajuste supervisado (SFT) más reparaciones posteriores: PhaseA con 465 pasos, `repair_r2` con 157 pasos y `repair_r3` con 162 pasos. La model card menciona además un paso de ORPO (optimización por preferencias sin modelo de recompensa) en la exportación Q4_K_M de la release candidate previa, aunque los pesos de v0.3.2 son idénticos a los de v0.3.1-rc.1 y la promoción a estable no implicó reentrenamiento.

La innovación técnica destacable no está en la arquitectura sino en el control de la salida: el autor impone una gramática GBNF con una lista blanca de tokens que elimina cualquier carácter han (CJK) de las respuestas. Esto resuelve un fallo típico de los modelos Qwen cuando se les pide responder en tailandés, ya que el tokenizador comparte subpalabras entre chino y tailandés. La model card también menciona una configuración de inferencia fijada ("GOD CONFIG v7.0") desplegada de forma uniforme, aunque no se detallan sus parámetros (temperatura, top_p, penalizaciones) en la información disponible.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con identidad declarada como "BOM" ("ผมชื่อ BOM").
- Comprensión de imágenes (VL): lectura de texto en tailandés dentro de imágenes y respuesta multimodal, verificado en la puerta de calidad G1.
- Control estricto del idioma de salida mediante gramática GBNF: cero caracteres han en 250 pruebas declaradas.
- Respuestas de rechazo ante peticiones inseguras (puerta de calidad G5 verificada).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso o modo "thinking" explícito: el modelo base lo sugiere por su nombre, pero no se documenta en esta ficha.
- Capacidades de audio: no disponibles.

## Casos de uso

- Atención al cliente en tailandés: el modelo puede mantener conversaciones multi-turno en tailandés sin derivar a caracteres chinos, un fallo frecuente en asistentes desplegados con modelos Qwen sin control de gramática. Adecuado para pymes tailandesas que necesitan un bot local sin coste por token.
- Digitalización de documentos con OCR en tailandés: gracias al codificador visual y al proyector f16, puede extraer y resumir texto de facturas, carteles o formularios fotografiados, ejecutándose íntegramente en local.
- Asistente offline en dispositivos con recursos limitados: la cuantización Q4_K_M de ~3,4 GB permite desplegarlo en portátiles con GPU de 6-8 GB de VRAM o incluso en CPU, útil en entornos con conectividad intermitente.
- Moderación y filtrado de contenido en tailandés: las respuestas de rechazo verificadas lo hacen apto para capas de pre-filtrado en foros o chats, siempre como complemento de un sistema de moderación más amplio.
- Prototipado rápido con Ollama: el comando `ollama pull siamcafe/bom-ai:latest` permite tener un asistente multimodal tailandés operativo en minutos, ideal para validar ideas de producto antes de invertir en infraestructura.
- Investigación sobre control de idioma en decodificación: el uso de GBNF como lista blanca de tokens es un caso de estudio reproducible para quienes investigan técnicas de restricción léxica en modelos multilingües.
- Educación y tutoría en tailandés: puede explicar conceptos a partir de imágenes de libros de texto o pizarras, con la ventaja de que el contenido no sale del dispositivo del estudiante.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada para "bom-ai" con la lista de resultados vacía. El autor no publica puntuaciones de MMLU, HumanEval, GSM8K ni de benchmarks multimodales.

No se han publicado resultados de benchmarks en la información disponible.

Las únicas métricas declaradas son las puertas de calidad internas del autor: visión verificada (G1), identidad correcta (G2), 250/250 respuestas sin caracteres han (G3), calidad en tailandés ≥ 9,0 según su propio criterio (G4), rechazo verificado (G5) y ausencia de regresiones en pruebas internas (G6). No son comparables con benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: en torno a 3,4 GB para los pesos más el proyector visual f16; con overhead de contexto, un presupuesto realista de 5-6 GB.
- VRAM estimada para bf16: aproximadamente 8,4 GB solo para los pesos, más el proyector y el contexto; se recomienda 12-16 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para la variante bf16; A100/H100 no son necesarias dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, la variante Q4_K_M funciona en tarjetas de 6-8 GB y, con llama.cpp, en CPU con RAM suficiente.
- Opciones de despliegue: Ollama (`siamcafe/bom-ai`), llama.cpp, ComfyUI y cualquier runtime compatible con GGUF; requiere cargar `mmproj-f16.gguf` como proyector visual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| BOM AI v0.3.2 | ~4,2 B | no disponible | th, en | Apache 2.0 | GGUF |
| Qwen2.5-VL-3B (referencia de la familia) | ~3,8 B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF |
| Qwen3-VL-4B (base de la familia) | ~4 B | no disponible en esta ficha | multilingüe | Apache 2.0 | safetensors, GGUF |
| Typhoon (familia tailandesa de SCB 10X) | variable | no disponible | th, en | variable según versión | safetensors, GGUF |

La comparación cuantitativa de rendimiento no es posible porque BOM AI no publica benchmarks. La diferencia principal frente a sus antecesores Qwen es el ajuste específico para tailandés y el control de gramática; frente a modelos tailandeses nativos como la familia Typhoon, la ventaja de BOM AI es la multimodalidad integrada y el despliegue en un solo archivo GGUF.

## Limitaciones y advertencias

- La model card corresponde a la línea v0.3.x y el propio autor la marca como histórica; la versión actual (v2.x) se distribuye fuera de Hugging Face, en bomai.app y GitHub. Quien despliegue esta versión debe saber que no recibe mantenimiento.
- No hay benchmarks estándar publicados, por lo que no se puede verificar su calidad frente a alternativas con datos objetivos; las puertas de calidad son internas y autoevaluadas.
- El modelo está afinado para tailandés e inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- La restricción GBNF, aunque elimina la fuga de caracteres CJK, puede limitar la expresividad en dominios que requieran símbolos, emojis o terminología técnica fuera de la lista blanca.
- Riesgo de alucinación inherente a un modelo de 4 B: no es adecuado para tareas que exijan alta precisión factual sin verificación externa.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-VL, hereda los sesgos de sus datos de entrenamiento, con posible infrarrepresentación de contextos culturales tailandeses específicos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de ajuste pueden arrastrar obligaciones adicionales no detalladas en la información disponible.
- El tamaño del repositorio (11,8 GB) incluye varias cuantizaciones; conviene descargar solo los archivos necesarios para evitar consumo innecesario de disco.

## Enlaces

- Hugging Face: https://huggingface.co/siamcafe/bom-ai
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-HighIQ-THINKING
- Versión actual del proyecto: https://bomai.app
- Etiquetas de Ollama: https://ollama.com/siamcafe/bom-ai/tags
- Código fuente y changelog: https://github.com/siamcafe/bomai
