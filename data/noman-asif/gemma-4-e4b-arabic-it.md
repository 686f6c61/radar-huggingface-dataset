# noman-asif/Gemma-4-E4B-Arabic-It

## Resumen

Gemma-4-E4B-Arabic-It es un ajuste fino del modelo denso Google Gemma 4 E4B-it, desarrollado por Noman Asif dentro de la familia "Gemma-4-Arabic Iso-Active". El objetivo es especializar un modelo de tamano medio en arabe estandar y dialecto saudí, manteniendo al mismo tiempo las capacidades originales en ingles, matematicas y codigo. Se distribuye como un checkpoint denso de transformer con 7.941.100.874 parametros reales en safetensors (frente a los 4.5B declarados en la model card), en formato bfloat16.

El modelo resuelve el problema de la baja competencia en arabe de los modelos base: sobre Gemma 4 E4B-it, la evaluacion en ArabicMMLU pasa de 24.00 a 57.00, en MadinahQA de 27.50 a 73.00 y en AraTrust de 57.10 a 83.37. Para evitar el olvido catastrofico, el autor aplica un "Zero-Forgetting Retention Shield" con anclas en ingles, matematicas y codigo, de modo que MMLU-Pro baja solo de 67.14 a 63.33 y GSM8K sube de 69.50 a 71.50.

El pipeline de entrenamiento combina SFT con rsLoRA (r=32, alpha=64) sobre 120k filas (75% arabe, 25% replay), alineamiento con Trust-Region DPO (beta=0.1, tr_alpha=0.6) sobre 20k pares y una fusion posterior con TIES-Merging (lambda=0.85, density=0.70). La licencia es Apache 2.0 y los pesos estan en safetensors, listos para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) |
| Parametros totales | 7.941.100.874 (safetensors); la model card declara 4.5B |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | arabe (estandar y dialecto saudí) e ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Se trata de un transformer denso derivado de google/gemma-4-E4B-it. El autor declara 4.0B parametros activos y 4.5B totales, aunque el recuento real de safetensors asciende a 7.941.100.874 parametros; esta discrepancia debe tenerse en cuenta al planificar el despliegue. El checkpoint se publica como modelo independiente en bfloat16, no como adaptador LoRA, e incluye la cabeza de generacion de texto y, segun los tags, capacidades image-text-to-text heredadas del modelo base.

El entrenamiento consta de tres etapas. Primero, un SFT continuado con rsLoRA (r=32, alpha=64) sobre 120k ejemplos del dataset Arabic-Reasoning-Instruct-120k, con una mezcla del 75% arabe y 25% de replay para preservar capacidades previas. Segundo, un alineamiento con Trust-Region DPO (beta=0.1, tr_alpha=0.6) sobre 20k pares de Arabic-Preference-DPO-20k. Tercero, una fusion TIES-Merging (lambda=0.85, density=0.70) para combinar los pesos ajustados con los originales. El autor etiqueta el modelo con chain-of-thought y dense, lo que sugiere entrenamiento explicito en razonamiento paso a paso en arabe.

## Capacidades

- Generacion de texto conversacional en arabe estandar y dialecto saudí, con especial refuerzo en conocimiento legal y cultural local (el ejemplo de la model card trata sobre derechos laborales en el sistema saudí).
- Razonamiento con cadena de pensamiento (chain-of-thought), segun los tags del modelo.
- Razonamiento matematico: GSM8K sube de 69.50 a 71.50 tras el ajuste.
- Generacion de codigo: HumanEval se situa en 70.12, con una caida de 7.32 puntos respecto al base.
- Comprension lectora y QA en arabe: MadinahQA 73.00, AlGhafa 74.70, EXAMS-AR 56.00.
- Capacidades multimodal image-text-to-text heredadas del modelo base (tag image-text-to-text).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el chain-of-thought es el unico indicio.
- Capacidades multilingues limitadas a arabe e ingles.

## Casos de uso

- Atencion al cliente en Arabia Saudi: el modelo puede gestionar conversaciones multi-turno en dialecto saudí y arabe estandar, con un rendimiento de 73.00 en MadinahQA que lo hace adecuado para preguntas frecuentes y soporte de primer nivel en centros de contacto regionales.
- Asistencia legal y administrativa: el ajuste sobre normativa saudí (ejemplo de derechos laborales en la model card) permite construir asistentes para consultas sobre contratos, visados o legislacion laboral, siempre con supervision humana por el riesgo de alucinacion.
- Educacion y tutoria en arabe: con EXAMS-AR en 56.00 y AlGhafa en 74.70, puede emplearse para generar explicaciones, resumenes y preguntas de practica en asignaturas escolares y universitarias en arabe.
- Analisis de sentimiento y moderacion de contenido en redes sociales arabes: su cobertura del dialecto saudí y su AraTrust de 83.37 lo hacen util para clasificar y filtrar contenido en plataformas regionales.
- Generacion de codigo en entornos bilingues: con HumanEval en 70.12 y soporte de ingles, puede integrarse en asistentes de programacion para equipos que documentan en arabe pero programan en ingles.
- Razonamiento matematico asistido: GSM8K en 71.50 permite usarlo en herramientas de resolucion de problemas paso a paso para estudiantes, con la ventaja de explicar el procedimiento en arabe.
- Procesamiento de documentos con imagen y texto: al heredar la modalidad image-text-to-text del base, puede emplearse para extraer y resumir informacion de formularios o facturas en arabe.

## Benchmarks y rendimiento

Resultados publicados por el autor (accuracy normalizada, zero-shot salvo indicacion):

| Benchmark | Metrica | Shots | E4B base (%) | E4B Arabic-It (%) | Delta |
|---|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 24.00 | 57.00 | +33.00 |
| MadinahQA | acc_norm | 0 | 27.50 | 73.00 | +45.50 |
| AlGhafa | acc_norm | 0 | 48.15 | 74.70 | +26.55 |
| ACVA | acc_norm | 5 | 79.60 | 82.00 | +2.40 |
| EXAMS-AR | acc_norm | 0 | 34.00 | 56.00 | +22.00 |
| AraTrust | acc_norm | 0 | 57.10 | 83.37 | +26.27 |

Anclas de retencion (ingles, matematicas, codigo):

| Ancla | Dominio | Shots | E4B base (%) | E4B Arabic-It (%) | Delta |
|---|---|---|---|---|---|
| MMLU-Pro | razonamiento en ingles | 5 | 67.14 | 63.33 | -3.81 |
| GSM8K | razonamiento matematico | 5 | 69.50 | 71.50 | +2.00 |
| HumanEval | generacion de codigo | 0 | 77.44 | 70.12 | -7.32 |
| ARC-Challenge | ciencia en ingles | 25 | 79.50 | 75.00 | -4.50 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (7.94B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 24 GB o mas.
- En cuantizacion de 8 bits: unos 8 GB de pesos; en 4 bits: unos 4-5 GB, aunque el autor no publica checkpoints cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para produccion en bfloat16; RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 en bfloat16 y en GPUs de 8-12 GB si se cuantiza a 4 bits, siempre que se genere el GGUF o AWQ correspondiente.
- Opciones de despliegue: transformers (soporte oficial), vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF; el tag endpoints_compatible indica compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Gemma-4-E4B-Arabic-It | 7.94B reales (4.5B declarados) | Denso | no disponible | Apache 2.0 | Arabe + dialecto saudí |
| google/gemma-4-E4B-it (base) | 4.5B declarados | Denso | no disponible | Gemma (terminos propios) | Multilingue general |
| noman-asif/Gemma-4-26B-A4B-Arabic-It | 25.2B totales / 3.8B activos | MoE (128 expertos, top-8 + 1 compartido) | no disponible | Apache 2.0 | Arabe + dialecto saudí |
| Modelos arabes densos de ~7B | no disponible | Denso | no disponible | no disponible | Arabe general |

El hermano MoE de la misma familia supera al E4B en casi todas las suites arabes (ArabicMMLU 68.00 frente a 57.00; MadinahQA 76.50 frente a 73.00), a costa de un mayor peso total y de requerimientos de memoria superiores. Frente al base sin ajustar, el E4B Arabic-It mejora entre 22 y 45 puntos en las suites arabes, con una perdida de 3.8 a 7.3 puntos en las anclas inglesas.

## Limitaciones y advertencias

- Discrepancia entre los parametros declarados (4.5B) y los reales en safetensors (7.94B): los calculos de VRAM deben basarse en el recuento real.
- Caida de rendimiento en codigo (HumanEval -7.32) y en ciencia en ingles (ARC-Challenge -4.50), lo que desaconseja su uso como modelo principal para tareas de programacion.
- Riesgo de alucinacion en consultas legales o administrativas saudies: no sustituye asesoramiento profesional.
- Cobertura limitada a arabe e ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Sesgos potenciales derivados de los datasets de ajuste (Arabic-Reasoning-Instruct-120k y Arabic-Preference-DPO-20k), cuya composicion y procedencia no se detallan.
- El dialecto saudí esta reforzado, pero no se documenta el rendimiento en otros dialectos arabes (egipcio, levantino, magrebi).
- Contexto maximo no especificado: planificar el despliegue con un valor conservador hasta confirmarlo.
- Aunque la licencia es Apache 2.0, el modelo base Gemma tiene sus propios terminos de uso que conviene revisar antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noman-asif/Gemma-4-E4B-Arabic-It
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Hermano MoE: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Dataset SFT: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-120k
- Dataset DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-20k
- Repositorio GitHub: https://github.com/nnoman-asif/Gemma-4-Arabic
- Perfil del autor: https://huggingface.co/noman-asif
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
