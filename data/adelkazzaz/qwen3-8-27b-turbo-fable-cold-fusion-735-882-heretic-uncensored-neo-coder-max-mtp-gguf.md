# AdelKazzaz/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es una cuantización GGUF publicada por AdelKazzaz a partir de un fine-tune multi-etapa de DavidAU, que a su vez deriva de la familia Qwen 3.8 de 27B. El modelo se distribuye en formato GGUF (tanto cuantizaciones "regular" como "MTP", con doble imatrix) y está pensado para ejecución en hardware de consumo. Su pipeline declarado es image-text-to-text, aunque la model card no documenta con detalle el componente de visión.

El modelo se presenta como un fine-tune "herético" y sin censura (abliterated), orientado a razonamiento, escritura creativa, roleplay y generación de código, con un modo de pensamiento ("thinking") optimizado para reducir el número de tokens de razonamiento entre la mitad y hasta una décima parte respecto al Qwen 3.8 27B estándar. La model card afirma que supera al base en siete benchmarks críticos y que alcanza 735 en ARC-C en 8 bits y 719 en 4 bits, si bien estos datos proceden únicamente del autor y no se han verificado de forma independiente.

Con 26.895.998.464 parámetros (unos 26,9 mil millones) y licencia Apache 2.0, el modelo resulta relevante para quienes buscan un LLM denso de ~27B con capacidades multilingües (16 idiomas), razonamiento y creatividad, desplegable localmente mediante llama.cpp u Ollama. El repositorio ocupa 389 GB por la gran cantidad de cuantizaciones incluidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.8); detalles de atención no disponibles |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF en varias precisiones (4 bits y 8 bits mencionados explícitamente; variantes "regular" y "MTP" con doble imatrix) |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo derivado de pesos bfloat16 del modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen 3.8 con aproximadamente 26,9 mil millones de parámetros. Sobre él, DavidAU aplica un proceso de fine-tune multi-etapa y multi-estado ("multi-stage-tune", "multi-state-merge"), descrito en la model card como los métodos "COLD FUSION" y "FABLE FUSION 711". El ajuste se realizó con Unsloth y emplea los datasets DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets, orientados a instrucciones estrictas.

El entrenamiento incluye una fase de "abliteration" (eliminación de rechazos) que da lugar a la variante "Heretic Uncensored", y un ajuste específico para corregir el exceso de razonamiento y el consumo excesivo de tokens ("TURBO"). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. Las cuantizaciones GGUF se generan con doble imatrix (DI-MATRIX) y en variantes "MTP", aunque la model card no detalla qué implica técnicamente la etiqueta MTP más allá de la nomenclatura de los quants.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (pensamiento explícito) en tres modos de operación, según la model card.
- Generación de código ("coder", "NEO-CODER"), con etiquetas que sugieren uso en tareas de programación.
- Escritura creativa, ficción, narrativa y roleplay en múltiples géneros.
- Capacidades multilingües en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Pipeline declarado image-text-to-text, lo que sugiere soporte de entrada de imagen, aunque no se detalla su alcance.
- Reducción del consumo de tokens de razonamiento (entre 1/2 y 1/10 respecto al base) manteniendo, según el autor, la calidad de salida.
- Comportamiento sin censura ("uncensored", "abliterated"): no aplica rechazos por contenido.
- Soporte de tool calling: la model card remite a la pestaña "community" para benchmarks de terceros, pero no se aportan datos verificables en la información disponible.

## Casos de uso

- Escritura creativa y ficción: el modelo está ajustado específicamente para narrativa, diálogo y descripción detallada, por lo que puede generar capítulos, relatos y guiones con un estilo marcado y sin filtros de contenido.
- Roleplay y personajes conversacionales: su entrenamiento en roleplay y su naturaleza sin censura lo hacen adecuado para simular personajes con personalidad consistente en conversaciones multi-turno.
- Generación de código en local: la etiqueta "coder" y el formato GGUF permiten integrarlo en entornos de desarrollo sin conexión para autocompletado, explicación de código y generación de funciones.
- Asistente de razonamiento con bajo consumo de tokens: el ajuste "TURBO" reduce los tokens de pensamiento, lo que abarata el coste por consulta en tareas de razonamiento paso a paso y en pipelines con límite de latencia.
- Procesamiento multilingüe: con 16 idiomas declarados, puede usarse para traducción, resumen y atención al cliente en mercados con varios idiomas, aunque el rendimiento por idioma no está documentado.
- Despliegue en hardware de consumo: al distribuirse en GGUF de 4 y 8 bits, es viable en estaciones de trabajo con GPU de gama alta para prototipado, experimentación e inferencia local de un modelo de ~27B.
- Investigación sobre alineación y censura: al ser una variante abliterated, sirve para estudiar el comportamiento de modelos sin rechazos y comparar con la versión base.

## Benchmarks y rendimiento

La model card cita resultados del autor, no verificados de forma independiente:

| Benchmark | Resultado declarado |
|---|---|
| ARC-C (8 bits) | 735 |
| ARC-C (4 bits) | 719 |
| ARC-E (8 bits) | >880 |

El autor afirma que el modelo supera al Qwen 3.8 27B base y a Qwen 3.6-35B-A3B, Qwen 3.6 27B y Qwen 3.5 27B en siete benchmarks críticos, pero no se incluyen en la información disponible las tablas completas ni los resultados de MMLU, HumanEval o GSM8K. No se han publicado resultados de benchmarks verificables de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: en 4 bits, en torno a 15-17 GB para los pesos, más overhead de contexto; en 8 bits, en torno a 28-30 GB.
- GPU recomendadas: para 8 bits, A100 40 GB, H100 o RTX 6000 Ada; para 4 bits, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en 4 bits cabe en RTX 4090/3090 de 24 GB; en 8 bits requiere GPU profesional o reparto entre varias GPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa sin conversión.
- Latencia y throughput: no disponibles; dependen de la cuantización y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B TURBO Heretic) | ~26,9B | No disponible | Apache 2.0 | GGUF | Fine-tune sin censura, multi-etapa |
| Qwen 3.8 27B (base) | ~27B | No disponible | Apache 2.0 | Safetensors/GGUF | Modelo original, con censura y más tokens de razonamiento |
| Qwen 3.6 27B | ~27B | No disponible | Apache 2.0 | Safetensors/GGUF | Generación anterior de la familia |
| Qwen 3.6-35B-A3B | 35B totales (MoE) | No disponible | Apache 2.0 | Safetensors/GGUF | MoE con ~3B activos; el autor afirma que este fine-tune lo supera en benchmarks |

Los datos de rendimiento comparativo proceden únicamente de la model card del autor y no se han verificado de forma independiente.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica rechazos, por lo que puede generar contenido ofensivo, ilegal o dañino; requiere filtros externos en producción.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, citas y datos; no hay evaluación independiente de su fiabilidad factual.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de sesgo en la información disponible.
- Contexto: la longitud de contexto no está especificada, lo que dificulta planificar su uso en tareas de contexto largo.
- Idiomas: aunque declara 16 idiomas, no se aportan métricas de calidad por idioma; el rendimiento fuera del inglés puede variar.
- Benchmarks no verificados: los resultados de ARC-C y ARC-E provienen del autor y no se han replicado de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado sin censura puede acarrear responsabilidad legal según la jurisdicción.
- Repositorio de 389 GB: descargar el repo completo es costoso; conviene seleccionar solo el archivo GGUF de la cuantización deseada.
- Autor de la cuantización con 0 descargas y 0 likes: sin validación de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/AdelKazzaz/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
