# aakashdandekar2006/Coli-ByT5-Small

## Resumen

Coli-ByT5-Small es un modelo de secuencia a secuencia de nivel de byte especializado en la optimización sinonímica de codones para la bacteria *Escherichia coli*. Lo desarrolla Aakash Dandekar como un ajuste fino del modelo base `google/byt5-small` de Google, y su tarea principal es traducir una secuencia de aminoácidos (proteína) a una secuencia codificante de ADN (CDS) optimizada para la expresión heteróloga en *E. coli*. Resuelve un problema clásico de la biología sintética: las herramientas heurísticas tradicionales maximizan la frecuencia de codones de forma ingenua, lo que puede eliminar pausas traduccionales naturales, alterar el plegamiento cotraduccional o romper la rampa traduccional 5'. Este modelo aprende armonización contextual de codones a partir de secuencias endógenas validadas.

Arquitectónicamente es un transformer encoder-decoder de tipo T5 (ByT5) con 12 bloques de encoder, 4 de decoder, 6 cabezas de atención y dimensión oculta de 1472, sumando 300.768.256 parámetros. Al operar sobre bytes UTF-8 en lugar de tokens subpalabra, evita la fragmentación del tokenizador y los tokens fuera de vocabulario, lo que permite un modelado estricto en marco de los tripletes de codones y de las fronteras de dicodones. El ajuste se realizó mediante LoRA (r=16, alpha=32) sobre todos los módulos lineales y posteriormente se fusionó en pesos safetensors en float16.

El modelo es relevante para investigadores y desarrolladores de biología sintética que necesitan generar construcciones génicas con fidelidad traduccional del 100 %, un índice de adaptación de codones (CAI) fisiológico y equilibrio de GC, evitando además sitios de restricción no deseados. Su licencia Apache 2.0 y su tamaño compacto (0,8 GB de repositorio) facilitan su integración en pipelines bioinformáticos locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 (ByT5, byte-level) |
| Parametros totales | 300.768.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base byt5-small; no se especifica en la model card) |
| Tipos de cuantizacion | float16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (etiqueta declarada; la tarea real es secuencia biológica, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float16); compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un `T5ForConditionalGeneration` de tipo ByT5 con 12 bloques de encoder, 4 bloques de decoder, 6 cabezas de atención, dimensión de modelo de 1472 y dimensión feed-forward de 3584. Opera directamente sobre bytes UTF-8, lo que proporciona granularidad de un carácter para aminoácidos (`ACDEFGHIKLMNPQRSTVWY`) y nucleótidos (`ATGC`) sin tokens fuera de vocabulario ni desajustes de frontera de subpalabra, permitiendo un modelado contextual fino sobre tripletes y dicodones.

El entrenamiento partió de `google/byt5-small` y se realizó mediante ajuste fino eficiente en parámetros con LoRA (r=16, `lora_alpha=32`, `target_modules="all-linear"`) usando `peft` y `Seq2SeqTrainer`, con fusión posterior en pesos float16 independientes. Se entrenó durante 3 épocas con tasa de aprendizaje 5e-4, scheduler coseno, optimizador AdamW y precisión mixta FP16 sobre 1 GPU NVIDIA RTX. El conjunto de datos combina pares de secuencias codificantes endógenas y curadas de *E. coli* procedentes de `adibvafa/CodonTransformer` y genomas de referencia de NCBI, filtrados con criterios biológicos estrictos: identidad traduccional en marco del 100 %, cumplimiento IUPAC de aminoácidos y bases canónicas, correspondencia exacta de longitud (ADN = 3 × proteína) y ausencia de codones de parada internos prematuros. No se documenta uso de RLHF ni DPO.

## Capacidades

- Traducción proteína a ADN: genera una secuencia codificante de nucleótidos a partir de una secuencia de aminoácidos.
- Optimización sinonímica de codones para expresión en *E. coli* con armonización contextual en lugar de maximización ingenua de frecuencia.
- Fidelidad traduccional: la secuencia generada traduce exactamente a la proteína de entrada (criterio de identidad del 100 %).
- Control de CAI en rango fisiológico (0,65–0,85) y equilibrio de GC (45–55 %).
- Supresión de sitios de restricción no deseados (EcoRI, BamHI, HindIII, XhoI, NdeI, NcoI).
- Modelado de nivel de byte sin tokenizador subpalabra, con granularidad de un carácter.
- Generación autorregresiva con búsqueda por haces (`num_beams` configurable).
- Integración con `transformers` y pipelines `text2text-generation`; compatible con text-generation-inference y endpoints.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Diseño de construcciones génicas para expresión heteróloga: dado el péptido de interés, el modelo genera la CDS optimizada para *E. coli*, manteniendo la fidelidad traduccional y un CAI fisiológico, lo que reduce el riesgo de fallo en la expresión.
- Producción de proteínas recombinantes en laboratorio: la armonización contextual de codones preserva pausas traduccionales y la rampa 5', aspectos que las tablas de frecuencia ingenuas destruyen y que afectan al plegamiento cotraduccional.
- Clonaje y síntesis génica: la supresión de sitios de restricción (EcoRI, BamHI, HindIII, XhoI, NdeI, NcoI) evita conflictos con enzimas de restricción en el diseño experimental y simplifica el ensamblaje.
- Generación de bibliotecas de variantes: el modelo puede producir múltiples CDS sinonímicas para una misma proteína, útiles en cribados de expresión y estudios de optimización de secuencia.
- Automatización de pipelines bioinformáticos: su tamaño compacto (300 M de parámetros, 0,8 GB) permite ejecutarlo localmente en una GPU de consumo e integrarlo en flujos con `transformers` o `pipeline`.
- Docencia e investigación en biología sintética: sirve como referencia de armonización de codones aprendida frente a heurísticas clásicas, con criterios de evaluación biológica explícitos.
- Validación cruzada de herramientas heurísticas: permite comparar el CAI, el GC y la fidelidad traduccional de las secuencias generadas frente a las de herramientas de maximización de frecuencia.

## Benchmarks y rendimiento

La model card reporta una evaluación comparativa frente a una línea base codiciosa de maximización de frecuencia sobre una secuencia de prueba de 539 aa (1617 nt esperados). La información disponible está truncada, por lo que solo se recogen los datos completos:

| Metrica | Coli-ByT5-Small | Codicioso tradicional |
|---|---|---|
| Comprobacion de traduccion | PASS | PASS |
| Resto de metricas | no disponible (informacion truncada) | no disponible (informacion truncada) |

No se han publicado resultados completos de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a esta tarea biológica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6–0,8 GB en float16 (300 M de parámetros); alrededor de 1,2 GB en float32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en NVIDIA RTX de gama media y alta (por ejemplo, RTX 3060, RTX 4090), A100 y H100 sin aprovechar su capacidad completa.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 2 GB o más de VRAM.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForSeq2SeqLM`), pipeline `text2text-generation`, text-generation-inference y endpoints compatibles. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Coli-ByT5-Small | 300,77 M | no disponible | Optimizacion de codones para *E. coli* | Apache 2.0 | Hugging Face |
| google/byt5-small (base) | 300 M aprox. | no disponible | Seq2seq byte-level generico | Apache 2.0 | Hugging Face |
| CodonTransformer | no disponible | no disponible | Optimizacion de codones multi-organismo | no disponible | Hugging Face (`adibvafa/CodonTransformer`) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo realiza traducción proteína-ADN para *E. coli*; no es un modelo de lenguaje general ni debe usarse para otras tareas.
- Riesgo de alucinación biológica: puede generar secuencias que no cumplan la fidelidad traduccional o que incluyan motivos no deseados; la model card exige verificación biológica posterior.
- Sesgo hacia el conjunto de datos: entrenado con secuencias endógenas y curadas de *E. coli* (CodonTransformer y NCBI), por lo que puede no generalizar a cepas, condiciones de expresión u organismos distintos.
- Limitaciones de idioma: la etiqueta `en` es nominal; el modelo no procesa lenguaje natural de forma fiable.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la validez biológica de las secuencias generadas.
- Caveat para producción: los resultados deben validarse experimentalmente (traducción in silico, CAI, GC y sitios de restricción) antes de cualquier uso en síntesis génica o clonaje.
- Datos incompletos: la model card está truncada y no se documentan la longitud de contexto, el throughput ni benchmarks completos.
- Precisión float16: puede requerir GPU compatible con FP16; en CPU la inferencia será más lenta.

## Enlaces

- Hugging Face: https://huggingface.co/aakashdandekar2006/Coli-ByT5-Small
- Modelo base: https://huggingface.co/google/byt5-small
- Dataset de referencia: https://huggingface.co/adibvafa/CodonTransformer
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
