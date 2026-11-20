# leok7v/Ternary-Bonsai-2-4B-gguf

## Resumen

Ternary Bonsai 2 4B es un modelo multimodal de tipo image-text-to-text derivado de Qwen3.5-4B, desarrollado por Prism ML y re-alojado por leok7v como un único archivo GGUF (extensión `.ggxf`). El modelo aplica cuantización ternaria extrema: cada peso del bloque de texto se representa con valores {-1, 0, +1} codificados en 2,25 bits por peso, lo que reduce el tamaño del modelo a aproximadamente 1,2 GB para el texto y 367 MB para el proyector de visión, permitiendo despliegue en dispositivos con tan solo 8 GB de memoria (el autor lo dimensiona para un teléfono de 8 GB).

La arquitectura es un transformer híbrido Qwen3.5 (`qwen35`) con 32 bloques, dimensión oculta de 2560, 16 cabezas de atención de consulta y 4 de clave-valor, combinando atención completa con tres bloques de Gated DeltaNet (atención lineal) por cada bloque de atención completa. Incorpora además una torre de visión Qwen3-VL de 24 bloques cuantizada en Q8_0, con aproximadamente 4,2B parámetros de lenguaje.

Este re-host es relevante porque consolida en un solo archivo los pesos del modelo de texto y el proyector de visión, junto con la carta de muestreo, garantizando que el modelo no quede accidentalmente solo-texto o mal muestreado. Sin embargo, el formato `.ggxf` añade claves y tensores específicos que impiden su carga en llama.cpp estándar, limitando su uso a runtimes compatibles como ChatOKF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrido (`qwen35`): 32 bloques, hidden 2560, 16/4 cabezas query/key-value, 3 bloques Gated DeltaNet por bloque de atención completa; torre de visión Qwen3-VL de 24 bloques |
| Parametros totales | ~4,2B parámetros de lenguaje (no se especifica el total incluyendo visión) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (medido a contexto 512 en pruebas de perplexity) |
| Tipos de cuantizacion | Ternaria `Q2_0` (2,25 bits por peso en tensores de texto); proyector de visión en Q8_0; upstream ofrece además PQ2_0 y PTQ1_0 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF modificado (`.ggxf`), alineación de 16 KB, 724 tensores, 68 claves KV |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B de Alibaba Cloud y aplica cuantización ternaria desarrollada por Prism ML. La arquitectura híbrida combina atención completa con Gated DeltaNet (atención lineal), reduciendo el coste computacional en contextos largos. Los pesos ternarios se almacenan en el bloque `Q2_0` de upstream: 64 pesos en 18 bytes con la estructura `{ FP16 scale d; 2-bit codes qs[16] }`, donde `w = (code - 1) * d`.

Una innovación técnica destacable es la "plegadura de Hadamard" (Hadamard fold): los pesos incorporan una rotación de Hadamard plegada (claves `prism.hadamard.*`, bloque 512, versión 2, cabeza atada). El runtime debe transformar las activaciones antes de cada capa lineal rotada y después del token gather, tal como hace llama.cpp upstream desde b11556. Un lector que ignore estas claves obtiene resultados basura. No se han publicado detalles sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y chat conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante torre de visión Qwen3-VL.
- Razonamiento con modo "thinking" configurable (activado/desactivado con diferentes parámetros de muestreo).
- Capacidades multilingües limitadas al inglés según la model card.
- Cuantización ternaria que permite inferencia en dispositivos con recursos muy limitados (on-device).
- No se documenta soporte de tool calling, function calling ni uso agéntico multi-paso en la información proporcionada.

## Casos de uso

- Inferencia on-device en teléfonos de 8 GB: el modelo está dimensionado explícitamente para un teléfono de 8 GB, con pesos de texto de 1,2 GB y proyector de 367 MB, lo que permite ejecutar chat multimodal localmente sin conexión.
- Asistente visual de bolsillo: al combinar texto e imagen en un único archivo, se puede usar para describir imágenes, responder preguntas sobre capturas de pantalla o documentos fotografiados desde un dispositivo móvil.
- Chat con razonamiento controlado: el modo thinking configurable (temperatura 1.0/top_p 0.95 con thinking on, 0.7/0.80 con thinking off) permite alternar entre respuestas rápidas y respuestas más elaboradas según la tarea.
- Prototipado de investigación en cuantización ternaria: sirve como referencia reproducible (con hashes SHA256 verificados) para estudiar el impacto de pesos {-1,0,+1} en calidad de perplexity.
- Snapshot archivístico estable: al ser un re-host con verificación de integridad, funciona como copia fija para proyectos que necesitan reproducibilidad ante la desaparición del repositorio upstream.
- Desarrollo de runtimes GGUF alternativos: el formato `.ggxf` con proyector embebido sirve como caso de prueba para runtimes que leen el proyector del mismo archivo (como ChatOKF).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato medido es de perplexity: sobre un texto de 80 KB de Simple Wikipedia a contexto 512 en 24 fragmentos, ChatOKF obtiene la misma perplexity que llama-perplexity de upstream sobre el conjunto de dos archivos original, con una diferencia dentro del 0,2 %.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB para tensores de texto (Q2_0) más 367 MB para el proyector de visión (Q8_0), totalizando ~1,6 GB de pesos.
- GPU recomendadas: no disponible; el modelo está orientado a inferencia on-device (teléfonos de 8 GB).
- Cabe en GPU consumer: sí, por tamaño; cualquier GPU con ≥2 GB de memoria libre debería poder alojar los pesos, aunque no se publican requisitos oficiales.
- Opciones de despliegue: ChatOKF (runtime del autor del re-host); llama.cpp estándar NO puede cargar este archivo (falla con "wrong number of tensors"); para llama.cpp debe usarse el repositorio upstream de dos archivos con `--mmproj`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary Bonsai 2 4B (este) | ~4,2B (lenguaje) | No disponible | Ternaria Q2_0 (2,25 bits) | Apache 2.0 | `.ggxf` (GGUF modificado) |
| Ternary Bonsai 2 4B upstream (prism-ml) | ~4,2B (lenguaje) | No disponible | Q2_0, PQ2_0, PTQ1_0 | Apache 2.0 | GGUF en dos archivos |
| Qwen3.5-4B (base) | ~4B | No disponible | Completa (FP16/BF16) | No disponible en esta ficha | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estándar: el archivo contiene 298 tensores extra del proyector, por lo que el loader de llama.cpp falla con "wrong number of tensors". Solo funciona en runtimes que leen el proyector del mismo archivo.
- Dependencia de la plegadura de Hadamard: un runtime que ignore las claves `prism.hadamard.*` produce resultados incorrectos (basura), no simplemente degradados.
- Idioma: solo inglés declarado; no hay soporte multilingüe documentado.
- Contexto: no se publica la longitud máxima de contexto; las pruebas se hicieron a 512 tokens.
- Riesgo de alucinación: no cuantificado en la información disponible; la cuantización ternaria agresiva (2,25 bits) puede degradar la calidad respecto al modelo base, aunque el autor reporta perplexity equivalente a upstream.
- Licencia: Apache 2.0 permite uso comercial, pero el re-host no es la fuente autoritativa; para benchmarks y otros empaquetados debe consultarse el repositorio original.
- Sin datos de benchmarks estándar: no hay evidencia publicada de rendimiento en tareas como MMLU, HumanEval o GSM8K.
- El autor indica que el modelo está dimensionado para un teléfono de 8 GB, pero "no phone number is published yet" (no se ha publicado aún una cifra de teléfono concreta).

## Enlaces

- Repositorio Hugging Face (este re-host): https://huggingface.co/leok7v/Ternary-Bonsai-2-4B-gguf
- Repositorio upstream (fuente autoritativa): https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Modelo base (Qwen3.5-4B, Alibaba Cloud): no disponible enlace directo en la información proporcionada
- Runtime ChatOKF (herramienta GGUFGraft): no disponible enlace directo en la información proporcionada
- Whitepaper de Prism ML: no disponible enlace directo en la información proporcionada
