# 8q0sb/qwen25-3b-psycholinguistic-reversal-lora

## Resumen

El modelo `8q0sb/qwen25-3b-psycholinguistic-reversal-lora` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, desarrollado por el usuario 8q0sb. Su objetivo es la denominada "reversión psicolingüística": transformar texto generado por IA con alta densidad y estilo artificial en texto con características psicolingüísticas más próximas a la escritura humana, revirtiendo seis rasgos de dificultad estudiados en el trabajo de Clark, Martin y Mahowald (2026, arXiv:2610.29162). No es un modelo de propósito general, sino un adaptador especializado en simplificación de texto y mejora de legibilidad.

El adaptador se ha entrenado en dos etapas: primero un ajuste supervisado (SFT) sobre pares generados mediante autodestilación Best-of-8 verificada psicolingüísticamente (131 pares retenidos más 30 regularizadores de identidad), y después una optimización de preferencias sin referencia (SimPO). El resultado es un adaptador de rango 16 y alpha 32 que se aplica sobre el modelo base de 3B parámetros de Qwen2.5.

Su relevancia radica en que ataca un problema concreto y medible: el texto generado por modelos de lenguaje presenta una perplejidad y una "dificultad psicolingüística" muy superiores a las del texto humano, lo que afecta a la naturalidad y a la legibilidad. Este adaptador reduce ese índice de forma sustancial (de 129,5 a 46,8 en el conjunto de prueba de frases densas) manteniendo la preservación de fragmentos de código al 100 %. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | No disponible (adaptador LoRA; el modelo base Qwen2.5-3B-Instruct tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen2.5-3B-Instruct: 32 768 tokens segun la especificacion publica de Qwen, no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (entrenado con QLoRA; el adaptador es compatible con cuantizacion del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen2.5-3B-Instruct`, un transformer decoder-only de 3B parámetros. El adaptador LoRA tiene rango `r=16` y `alpha=32`, y fue entrenado con QLoRA (cuantización del modelo base durante el ajuste). El entrenamiento consta de dos etapas: una primera de ajuste supervisado (SFT) sobre un conjunto de pares generados por autodestilización Best-of-8 con verificación psicolingüística, que retuvo 131 pares más 30 regularizadores de identidad; y una segunda de optimización de preferencias sin referencia mediante SimPO. La innovación principal es el propio procedimiento de construcción del dataset: se generan múltiples candidatos, se filtran por un verificador psicolingüístico y se conservan solo los que revierten correctamente los seis rasgos de dificultad objetivo. El adaptador incorpora además un modo híbrido (`hybrid-lora`) que combina la reescritura del LoRA con un post-proceso clásico basado en spaCy para reducir aún más el índice de dificultad.

## Capacidades

- Reescritura de texto generado por IA para reducir su "índice de dificultad psicolingüística" y acercarlo al de la escritura humana.
- Mejora de la fluidez medida con perplejidad GPT-2 (de 847,8 a 156,6 en el conjunto de frases densas).
- Preservación de fragmentos de código durante la reescritura (100 % de preservación de spans de código reportada).
- Mantenimiento de la entailment bidireccional (NLI) para conservar el significado del texto original (0,764 en frases densas; 0,906 en párrafos múltiples).
- Modo híbrido LoRA + post-proceso clásico (spaCy) para una reducción adicional del índice de dificultad.
- Interfaz de línea de comandos `psycho-rev` con subcomandos `rewrite` y opciones `--method lora` / `--method hybrid-lora`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Simplificación de documentación técnica generada por IA: el adaptador reescribe párrafos densos manteniendo intactos los fragmentos de código (100 % de preservación reportada), lo que permite pasarlo sobre manuales y guías sin romper los ejemplos.
- Humanización de contenido editorial: para blogs y artículos redactados con asistencia de IA, reduce la perplejidad GPT-2 (de 299,6 a 75,8 en párrafos múltiples) y acerca el texto a la referencia humana (49,4).
- Post-proceso de respuestas de chatbots: integrado en un pipeline tras el modelo generador, reescribe las respuestas antes de enviarlas al usuario para reducir el estilo artificial y mejorar la legibilidad.
- Preparación de materiales para audiencias con dificultades de lectura: la reducción del índice de dificultad psicolingüística (de 89,0 a 33,0 en párrafos) lo hace adecuado para adaptar textos a lectores que requieren simplificación.
- Limpieza de corpus para entrenamiento: aplicar el adaptador a textos sintéticos antes de incorporarlos a un dataset de ajuste permite reducir el sesgo de estilo "IA" en los datos.
- Evaluación de naturalidad en investigación: el adaptador y los detectores asociados (repo `perennialtech/psycholinguistic-reversal`) sirven como herramienta reproducible para medir y revertir rasgos de estilo en estudios de psicolingüística computacional.
- Reescritura por lotes de borradores en Markdown: el comando `psycho-rev rewrite --method hybrid-lora --file draft.md --plain` permite procesar ficheros completos desde la CLI.

## Benchmarks y rendimiento

Resultados reportados por el autor con `cross-encoder/nli-deberta-v3-base`:

| Metrica | Frases densas (30) | Parrafos multiples (18) |
|---|---|---|
| Indice de dificultad psicolinguistica (antes -> despues) | 129,5 -> 46,8 (32,4 con post-proceso spaCy) | 89,0 -> 33,0 (29,1 con post-proceso spaCy) |
| Referencia humana del indice | 31,1 | 34,0 |
| Perplejidad de fluidez GPT-2 (antes -> despues) | 847,8 -> 156,6 (152,9 con post-proceso) | 299,6 -> 75,8 (79,9 con post-proceso) |
| Referencia humana de perplejidad | 145,3 | 49,4 |
| Min-entailment NLI bidireccional | 0,764 (0,893 en Chat; 0,001 de contradiccion NLI) | 0,906 (0,000 de contradiccion NLI; control humano 0,996) |
| Preservacion de spans de codigo | 100,0 % | 100,0 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el adaptador no está orientado a esas tareas sino a la reescritura estilística.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el modelo base Qwen2.5-3B-Instruct requiere aproximadamente 6 GB en FP16 y en torno a 2-3 GB en cuantización de 4 bits.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB y superiores, así como en GPUs de datacenter (A100, H100) para despliegues de mayor throughput.
- Despliegue mediante `transformers` + `peft` (carga del adaptador con `PeftModel.from_pretrained`), y mediante la CLI `psycho-rev`.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI en la información disponible; al ser un adaptador PEFT, su integración en esos motores dependería de la fusión previa con el modelo base.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 8q0sb/qwen25-3b-psycholinguistic-reversal-lora | 3B (base) + adaptador LoRA | No disponible | Reversion psicolinguistica / simplificacion | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32 768 (segun especificacion publica de Qwen) | Instrucciones generales | Apache 2.0 | Hugging Face |
| Modelos de simplificacion de texto dedicados | No disponible | No disponible | Simplificacion lexica/sintactica | Variable | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El adaptador está entrenado sobre un conjunto muy pequeño (131 pares más 30 regularizadores), lo que limita su generalización a dominios y estilos no cubiertos.
- Los benchmarks reportados son del propio autor y usan un conjunto de prueba reducido (30 frases y 18 párrafos), por lo que deben interpretarse con cautela.
- No se documentan los idiomas soportados; dado el modelo base, es probable un buen rendimiento en inglés y limitado en otros idiomas, pero no está confirmado.
- Riesgo de alteración semántica: aunque el min-entailment NLI es alto, no es perfecto (0,764 en frases densas), por lo que la reescritura puede modificar matices del original.
- La preservación de código se reporta al 100 %, pero solo sobre los conjuntos de prueba del autor; conviene verificar en producción.
- No se documentan sesgos conocidos; al heredar el modelo base Qwen2.5-3B-Instruct, puede arrastrar los sesgos de este.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en dominios críticos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/8q0sb/qwen25-3b-psycholinguistic-reversal-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Paper de referencia: https://arxiv.org/abs/2610.29162
- Repositorio de codigo, detectores y evaluacion: https://github.com/perennialtech/psycholinguistic-reversal
