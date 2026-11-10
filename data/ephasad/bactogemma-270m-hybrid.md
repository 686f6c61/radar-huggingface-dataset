# EphAsad/BactoGemma-270M-Hybrid

## Resumen

BactoGemma-270M-Hybrid es un modelo derivado de `google/gemma-3-270m` desarrollado por el usuario EphAsad, adaptado al dominio de la biología molecular para la clasificación jerárquica de secuencias de ADN ribosomal 16S de bacterias. El modelo combina el backbone transformer de Gemma 3 con cabezas de clasificación taxonómica entrenadas específicamente y una capa de recuperación por k-mers (4/6-mer) que actúa como evidencia de vecino más próximo. Cubre los rangos taxonómicos de dominio a género, sin límite de 18 géneros, e incorpora todas las etiquetas de género utilizables del muestreo de SILVA 144.

El modelo se presenta como un piloto de investigación, no como una herramienta de diagnóstico. Su relevancia radica en que demuestra una aproximación híbrida (neural + recuperación de referencia) sobre un modelo base pequeño de 268 millones de parámetros, un tamaño que permite ejecución en hardware modesto. La identificación a nivel de especie no está implementada y el autor advierte explícitamente contra su uso en informes clínicos o de laboratorio sin validación independiente.

La arquitectura subyacente es Gemma 3 text, con pesos fusionados en BF16 y cabezas de clasificación jerárquica separadas. El contexto de entrenamiento se limita a fragmentos de 150, 300, 500 y 800 pb con un tope de 1024 tokens. La licencia es Gemma Terms of Use, no Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con cabezas de clasificación jerárquica y capa de recuperación por k-mers |
| Parametros totales | 268.098.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (tope de entrenamiento para fragmentos de 16S) |
| Tipos de cuantizacion | BF16 (recomendado en CUDA), FP32 (CPU); FP16 desaconsejado en Gemma 3 |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma Terms of Use (no Apache-2.0) |
| Formato de pesos | safetensors (BF16 fusionado) + `taxonomy_heads.safetensors` |
| Modelo base | google/gemma-3-270m |
| Tamano del repo | 0.6 GB |
| Cobertura taxonomica | dominio a género (especie no implementada) |
| Secuencias de referencia | 80.000 secuencias, 5.170 etiquetas de género muestreadas de SILVA 144 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-270m`, un transformer decoder-only de 268 millones de parámetros, sobre el que se aplica un ajuste fino con LoRA de rango 16 (900 pasos de optimizador) y se fusionan los pesos resultantes en BF16. Sobre el backbone se entrenan cabezas de clasificación jerárquica para los rangos dominio, reino, filo, clase, orden, familia y género. En paralelo, una ruta separada de k-mers (4-mer y 6-mer) construye un índice de referencia con hashing para recuperación de vecino más próximo; esta ruta no sustituye al backbone neural, sino que se entrena como parte de la fusión de la cabeza de clasificación.

Los datos de entrenamiento provienen de la referencia DADA2 de género derivada de SILVA SSU Ref NR99 v144. Se seleccionaron 80.000 secuencias de referencia en 5.170 géneros muestreados, divididas en 60.345 de entrenamiento, 7.466 de validación, 7.511 de test retenido y 3.997 de géneros completamente excluidos. El agrupamiento por VSEARCH al 97% se asignó a particiones disjuntas antes de generar los fragmentos, lo que reduce pero no elimina la fuga entre secuencias relacionadas. Los géneros retenidos se excluyeron tanto del entrenamiento como del índice de recuperación. Los fragmentos de entrenamiento tienen longitudes de 150, 300, 500 y 800 pb.

## Capacidades

- Clasificación taxonómica jerárquica de secuencias de 16S bacteriano desde dominio hasta género.
- Recuperación de evidencia por vecino más próximo mediante índice de k-mers 4/6-mer con similitud coseno.
- Fusión de ambas señales: el host de inferencia solo emite un género candidato cuando la línea neural y el género de referencia k-mer más cercano coinciden por encima de un umbral derivado de validación (0.9193).
- Emisión de un rango superior común o resultado no resuelto cuando no hay consenso.
- Extracción de embeddings del backbone (sin benchmark de calidad contrastiva declarado).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo thinking.
- Multilingüismo limitado al inglés.
- No implementa identificación a nivel de especie.

## Casos de uso

- Cribado taxonómico preliminar en investigación metagenómica: el modelo puede asignar un género candidato a fragmentos de 16S de 150–800 pb y señalar resultados no resueltos cuando la evidencia neural y la de k-mers no coinciden, lo que permite priorizar muestras para análisis con VSEARCH, SINTAX o BLAST.
- Anotación de amplicones en proyectos de ecología microbiana: con un contexto de 1024 tokens y soporte para fragmentos cortos, encaja en pipelines de secuenciación de amplicones donde se requiere una primera pasada rápida sobre miles de lecturas.
- Control de calidad de clasificaciones existentes: la capa de recuperación por k-mers puede usarse como señal independiente para detectar asignaciones taxonómicas inconsistentes en un conjunto de datos ya anotado.
- Docencia y prototipado en bioinformática: al caber en hardware modesto (268 M de parámetros, repo de 0.6 GB), permite experimentar con clasificación jerárquica y recuperación de referencia sin infraestructura de GPU de gran escala.
- Investigación sobre híbridos neural-recuperación: el modelo sirve como banco de pruebas para estudiar la fusión de señales neuronales y de vecino más próximo en dominios con vocabulario taxonómico abierto.
- Filtrado de géneros no vistos: la métrica de rechazo open-set sobre géneros retenidos (0.1000 con umbral 0.9193) permite explorar heurísticas de detección de taxones fuera del conjunto de entrenamiento, siempre como cribado y no como diagnóstico.
- Generación de candidatos para revisión manual: el flujo de `infer.py` produce un género candidato solo bajo consenso, lo que reduce el volumen de revisiones manuales en conjuntos grandes, a costa de dejar muchos casos sin resolver.

## Benchmarks y rendimiento

Evaluación interna del autor sobre test retenido (240 secuencias de soporte conocido por rango, salvo donde se indica). No son benchmarks externos.

| Rango | Soporte retenido | Accuracy fusionada | Macro-F1 fusionado | Accuracy sin k-mers |
|---|---:|---:|---:|---:|
| dominio | 240 | 1.0000 | 1.0000 | 1.0000 |
| reino | 240 | 0.9583 | 0.9542 | 0.0000 |
| filo | 240 | 0.8750 | 0.4051 | 0.0000 |
| clase | 240 | 0.8292 | 0.3523 | 0.0000 |
| orden | 239 | 0.5648 | 0.2071 | 0.0000 |
| familia | 235 | 0.3447 | 0.1245 | 0.0000 |
| género | 229 | 0.0437 | 0.0183 | 0.0000 |

Métricas adicionales reportadas:

| Metrica | Valor |
|---|---|
| Accuracy de vecino más próximo por k-mers 4/6-mer (género, géneros conocidos de validación) | 0.7417 |
| Rechazo open-set por similitud de referencia (géneros retenidos) | 0.1000 |
| Umbral de similitud derivado de validación | 0.9193 |

Advertencias del autor: las métricas del modelo híbrido y del baseline de solo referencia usan subconjuntos de test distintos y no deben compararse como benchmark controlado; la ablación sin k-mers reutiliza pesos de fusión y no equivale a un baseline neural entrenado de forma independiente; el softmax no está calibrado como confianza taxonómica y el coseno de k-mers hasheados no es identidad de secuencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 0.5–0.6 GB para los pesos del backbone más las cabezas de clasificación; en FP32 en CPU, alrededor de 1.1 GB.
- GPU recomendadas: cualquier GPU CUDA con soporte BF16 y al menos 2 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es lo bastante pequeño para ejecutarse en GPUs de consumo de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con soporte BF16; también en CPU en FP32.
- Opciones de despliegue: scripts propios `infer.py` y `bactogemma_core.py` con `transformers>=5.10,<6`, `torch`, `huggingface_hub`, `safetensors` y `numpy`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota: no forzar FP16 en Gemma 3; usar BF16 en CUDA o FP32 en CPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks controlados frente a alternativas en la información proporcionada. El autor menciona explícitamente VSEARCH/SINTAX, DADA2, BLAST y BactoTiny como comparadores pendientes sobre accesiones retenidas idénticas, pero no publica resultados de esa comparación.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BactoGemma-270M-Hybrid | Híbrido neural + k-mers | 268 M | 1024 tokens | Gemma Terms of Use | Hugging Face |
| VSEARCH / SINTAX | Asignación taxonómica por referencia | no aplica | no aplica | según implementación | Herramienta bioinformática |
| DADA2 | Pipeline de amplicones | no aplica | no aplica | según implementación | Paquete R |
| BLAST | Alineamiento local | no aplica | no aplica | dominio público (NCBI) | Herramienta bioinformática |
| BactoTiny | Modelo específico de taxonomía bacteriana | no disponible | no disponible | no disponible | no disponible en la información |

## Limitaciones y advertencias

- Ámbito restringido exclusivamente a secuencias de 16S bacteriano; no cubre otros marcadores ni organismos.
- No implementa identificación a nivel de especie.
- Accuracy a nivel de género muy baja en la evaluación interna (0.0437 de accuracy, 0.0183 de macro-F1), lo que limita su utilidad práctica en ese rango sin la capa de recuperación.
- El rechazo open-set sobre géneros retenidos es de solo 0.1000, lo que indica escasa capacidad de detectar taxones fuera del conjunto de entrenamiento.
- El softmax del modelo no está calibrado como confianza taxonómica y el coseno de k-mers hasheados no equivale a porcentaje de identidad de secuencia.
- Riesgo de fuga entre secuencias relacionadas pese al agrupamiento VSEARCH al 97% antes de fragmentar.
- Taxonomía incompleta en SILVA, muestreo limitado de géneros raros y errores en las etiquetas de referencia.
- Ambigüedad intrínseca del 16S y variabilidad por geografía y plataforma de secuenciación.
- Los umbrales open-set son heurísticas de cribado, no umbrales diagnósticos validados.
- El autor advierte explícitamente contra el uso en informes clínicos o de laboratorio sin validación independiente.
- Licencia Gemma Terms of Use con política de usos prohibidos; no es Apache-2.0. Requiere cumplir `GEMMA_TERMS.txt`, `NOTICE` y `USE_RESTRICTIONS.md`.
- La taxonomía pública de SILVA y los sketches derivados de referencia están sujetos a la licencia de los ficheros fuente de SILVA para redistribución.
- Solo idioma inglés.
- Sin descargas ni likes en el momento de la consulta; sin pipeline declarado en Hugging Face.
- No se redistribuyen las secuencias crudas de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/EphAsad/BactoGemma-270M-Hybrid
- Modelo base: https://huggingface.co/google/gemma-3-270m
- SILVA 144: https://www.arb-silva.de/documentation/release-144
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
