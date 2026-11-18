# HumanjavaEnterprises/Qwen3.8-27B-Bilingual-Canadian-GGUF

## Resumen

Qwen3.8-27B-Bilingual-Canadian es una cuantización GGUF del modelo Qwen3.8-27B (27.320.697.856 parámetros) publicada por HumanjavaEnterprises. El objetivo declarado es ofrecer una build de 9,15 GiB que funcione en llama.cpp estándar, sin forks ni parches, sobre una única GPU de consumo de 12 GB o más, manteniendo un comportamiento fiel al original tanto en inglés como en francés, con atención específica al francés de Quebec. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización calibrada y evaluada tensor a tensor contra el modelo BF16 de referencia.

La relevancia de esta publicación es doble. Por un lado, demuestra una metodología de cuantización con criterio de selección empírico: cada candidato se puntúa sobre texto reservado en inglés y francés y solo se conserva si reduce la divergencia KL respecto al original. Por otro, publica resultados en benchmarks de francés de Quebec (COLE QFrCoLA y QFrBLiMP) y los compara con la cuantización UD-Q2_K_XL de Unsloth del mismo tamaño, lo que permite reproducir y auditar las cifras.

La licencia es Apache-2.0, heredada del modelo base, y el formato es GGUF con tipos de bloque estándar de 2 a 4 bits. El modelo es solo texto (entrada y salida de texto), pese a que el Qwen3.8-27B original incluye visión. El contexto declarado en las mediciones es de 8k tokens, con unos 10,5 GB de memoria GPU en ese escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8), cuantizado a GGUF; arquitectura exacta no detallada en la informacion disponible |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens en las mediciones publicadas; contexto maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | Mezcla tensor a tensor de tipos de bloque estandar de llama.cpp de 2 a 4 bits (Q2_K_mix, 9,15 GiB / 9370 MiB) |
| Idiomas soportados | Ingles (en) y frances (fr), incluido frances de Quebec |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico archivo: qwen3-8-27b-bilingual-canadian-v1-Q2_K_mix.gguf) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un transformer decoder-only de 27,32 mil millones de parámetros bajo licencia Apache-2.0. Esta publicación no reentrena el modelo: parte de los pesos de texto del original (excluye visión) y aplica un proceso de calibración y cuantización. La calibración y el ajuste se realizaron con texto en inglés y francés, incluyendo texto generado por el propio modelo original, sin incorporar datasets nuevos con licencia restrictiva. El resultado se exporta a tipos GGUF bit-exactos estándar de llama.cpp, de modo que cualquier build que soporte la arquitectura Qwen3.8 puede cargar el archivo sin modificaciones.

La innovación metodológica está en el proceso de selección: cada archivo candidato se evaluó sobre texto reservado en inglés y francés y solo se conservó si acercaba la distribución a la del original BF16, medido como divergencia KL. El resultado es una mezcla de tipos de bloque de 2 a 4 bits elegida tensor por tensor, con un peso de 9,15 GiB. El autor reporta que utiliza unos 10,5 GB de VRAM en Ollama con contexto de 8k. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés y francés, respondiendo en el idioma del usuario sin necesidad de system prompt especial.
- Razonamiento aritmético y matemático de varios pasos (evaluado con GSM8K y MGSM en ambos idiomas).
- Comprensión lectora multilingüe (evaluado con Belebele FR/EN).
- Seguimiento de instrucciones con formato estricto (evaluado con IFEval FR/EN en modo prompt y strict).
- Conocimiento gramatical del francés de Quebec (evaluado con COLE QFrCoLA y QFrBLiMP).
- Modo thinking desactivable: el formato de chat ChatML arranca con un bloque `think` vacío y el flag `--reasoning-budget 0` lo desactiva en llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema Ollama mediante plantilla, system y params incluidos en el repo.
- Capacidad de visión: no disponible en esta build (solo se conservan los pesos de texto del original).

## Casos de uso

- Atención al cliente bilingüe en Canadá: el modelo responde en inglés o francés según el idioma del usuario y mantiene conversaciones multi-turno con hasta 8k tokens de contexto, suficiente para historiales de soporte habituales. La licencia Apache-2.0 permite integrarlo en productos comerciales.
- Asistentes para administración pública quebequesa: la evaluación específica en gramática de Quebec (QFrCoLA 0,762, QFrBLiMP 0,839) lo hace adecuado para generar y revisar textos administrativos en francés de Quebec, aunque con revisión humana por la caída respecto al original (0,800/0,895).
- Despliegue en una sola GPU de consumo: con 10,5 GB de VRAM a 8k de contexto, cabe en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) y deja margen en 16 GB para contextos más largos. Es una opción para prototipos y entornos de desarrollo sin infraestructura de centro de datos.
- Generación de documentación técnica bilingüe: traducir y redactar documentación en inglés y francés manteniendo terminología, apoyándose en MGSM FR 0,892 y Belebele FR 0,947.
- Procesamiento de textos legales o normativos de Quebec: la ventana de 8k permite analizar contratos o reglamentos de extensión media en francés local, con la advertencia de validar la fidelidad gramatical frente al modelo completo.
- Evaluación y benchmarking reproducible: el dataset `bilingual-canadian-eval` (config `v1`) y el repositorio de guía permiten reproducir las cifras y comparar cuantizaciones alternativas en pipelines de evaluación propios.
- Razonamiento matemático asistido en entornos educativos francófonos: GSM8K 0,954 y MGSM FR 0,892 lo sitúan cerca del original para ejercicios de varios pasos, con thinking desactivado para respuestas directas.

## Benchmarks y rendimiento

Resultados publicados por el autor. Columnas: original BF16, esta build (Q2_K_mix, 9,15 GiB) y Unsloth UD-Q2_K_XL (9,15 GiB). En divergencia KL, menor es más cercano al original.

| Metrica | Original | Esta build | Unsloth |
|---|---|---|---|
| KL divergencia, texto frances | 0 | 0,0928 | 0,0935 |
| KL divergencia, texto frances de Quebec | 0 | 0,0908 | 0,0913 |
| KL divergencia, texto ingles | 0 | 0,0908 | 0,0790 |
| Belebele FR / EN | 0,949 / 0,962 | 0,947 / 0,961 | 0,936 / 0,959 |
| IFEval FR / EN (prompt, strict) | 0,738 / 0,821 | 0,726 / 0,806 | 0,732 / 0,830 |
| MGSM FR / EN | 0,884 / 0,956 | 0,892 / 0,964 | 0,888 / 0,956 |
| GSM8K (5-shot) | 0,964 | 0,954 | 0,953 |
| COLE QFrCoLA / QFrBLiMP (gramatica de Quebec) | 0,800 / 0,895 | 0,762 / 0,839 | 0,756 / 0,879 |

## Requisitos de hardware

- VRAM estimada: unos 10,5 GB en Ollama con contexto de 8k (medido por el autor); el archivo pesa 9,15 GiB (9370 MiB).
- GPU de 12 GB o más: es el mínimo recomendado por el autor para una sola GPU. Una GPU de 16 GB deja margen para contexto largo.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4070 12 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB, RTX 4090 24 GB. No se han publicado mediciones en GPUs de centro de datos (A100, H100) en la información disponible.
- Despliegue: llama.cpp estándar (`llama-server -hf ... -ngl 99 -c 8192 -fa on --reasoning-budget 0`), Ollama (probado en 0.40.16; versiones anteriores no cargan la arquitectura Qwen3.8) y cualquier runtime que soporte GGUF con la arquitectura Qwen3.8. No se requiere fork ni parche.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Bilingual-Canadian (esta build) | 27,32 B | 8k medido | GGUF Q2_K_mix, 9,15 GiB | Apache-2.0 | Solo texto; calibrado en EN/FR; resultados de Quebec publicados |
| Unsloth UD-Q2_K_XL de Qwen3.8-27B | 27,32 B | no disponible | GGUF, 9,15 GiB | Apache-2.0 (heredada) | Mejor KL en ingles (0,0790 vs 0,0908); peor en frances de Quebec (0,0935 vs 0,0928) |
| Qwen/Qwen3.8-27B (original BF16) | 27,32 B | no disponible | safetensors BF16 | Apache-2.0 | Incluye visión; requiere mucha más VRAM; referencia de calidad (GSM8K 0,964, QFrCoLA 0,800) |
| QuebecLLM (adaptadores) | no disponible | no disponible | adaptadores sobre modelos base | no disponible | Primeros modelos abiertos de frances de Quebec, evaluados en COLE; no son cuantizaciones del mismo base |

## Limitaciones y advertencias

- Es una build no oficial: no está hecha ni respaldada por el equipo de Qwen.
- Solo texto: se descartan los pesos de visión del modelo original.
- Deriva mayor en inglés que la alternativa de Unsloth (KL 0,0908 frente a 0,0790), por lo que en cargas de trabajo predominantemente inglesas la UD-Q2_K_XL puede ser preferible.
- Caída medible en gramática de Quebec respecto al original: QFrCoLA 0,762 frente a 0,800 y QFrBLiMP 0,839 frente a 0,895. Para producción en francés de Quebec se recomienda revisión humana o validación adicional.
- IFEval en modo strict baja a 0,726 en francés y 0,806 en inglés; el seguimiento estricto de instrucciones es el punto más débil de la cuantización.
- La cuantización de 2 a 4 bits introduce pérdida de fidelidad inherente; los números publicados corresponden a temperatura 0 y thinking desactivado, y pueden no reproducirse con otras configuraciones de muestreo.
- Riesgo de alucinación propio de modelos de 27B cuantizados; no se han publicado evaluaciones específicas de sesgo o toxicidad en la información disponible.
- Requiere Ollama reciente (0.40.16 probado); versiones anteriores no cargan la arquitectura Qwen3.8.
- El contexto medido es de 8k; no se documenta el contexto máximo nativo del modelo base en esta build.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datos de calibración antes de redistribuir.

## Enlaces

- Hugging Face: https://huggingface.co/HumanjavaEnterprises/Qwen3.8-27B-Bilingual-Canadian-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía y resultados completos: https://github.com/HumanjavaEnterprises/qwen3.8-27b-bilingual-canadian
- EVALS.md: https://github.com/HumanjavaEnterprises/qwen3.8-27b-bilingual-canadian/blob/main/EVALS.md
- Dataset de evaluación: https://huggingface.co/datasets/HumanjavaEnterprises/bilingual-canadian-eval
- Ollama: `ollama run vveerrgg/qwen3.8-27b-bilingual-canadian`
- COLE (benchmark de francés, Université Laval): https://github.com/GRAAL-Research/COLE
- Paper COLE: https://arxiv.org/abs/2510.05046
- Paper QFrCoLA: https://arxiv.org/abs/2508.16867
- Paper QFrBLiMP: https://arxiv.org/abs/2509.25664
- Paper QuebecLLM: https://arxiv.org/abs/2510.22747
- QuebecLLM en Hugging Face: https://huggingface.co/QuebecLLM
