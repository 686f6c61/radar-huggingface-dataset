# Anupam-Rawat-IITB/code-switch-mtp

## Resumen

`code-switch-mtp` es un repositorio de investigación publicado en Hugging Face por el usuario Anupam-Rawat-IITB que no contiene pesos de modelo, sino el código, la configuración y la documentación de un estudio sobre predicción multi-token (MTP) y decodificación especulativa aplicada a hindi e inglés. El trabajo se apoya en el modelo base `meta-llama/Llama-3.2-1B`, que permanece congelado, y entrena cabezas "draft" al estilo Medusa/Hydra para acelerar la decodificación sin pérdida de calidad.

La pregunta central del proyecto es si la dificultad del MTP depende de la fertilidad del tokenizador (cuántos tokens hacen falta para escribir una palabra) o de la complejidad morfológica. Para aislar ambas variables, el autor romaniza el hindi (mismas palabras y gramática, distinto sistema de escritura) y compara cuatro representaciones: devanagari, ITRANS, IAST e ISO. El repositorio incluye 91 tests unitarios, scripts por fase experimental y un informe completo en `docs/REPORT.md`.

El resultado más relevante es que las cabezas dependientes con objetivos del backbone y una lista corta de candidatos por frecuencia alcanzan 1,43x de velocidad en inglés y 1,86x en devanagari frente a decodificación greedy, con salida idéntica en 48 de 48 documentos. El proyecto es útil para investigadores interesados en decodificación especulativa multilingüe y en el efecto de la tokenización sobre la predicción multi-token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2-1B congelado) + cabezas MTP estilo Medusa/Hydra |
| Parametros totales | 1,24 mil millones (modelo base Llama 3.2-1B); las cabezas draft no se distribuyen |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del backbone Llama 3.2-1B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (devanagari, ITRANS, IAST, ISO) e ingles |
| Licencia | no disponible para el repositorio; el backbone se rige por Llama 3.2 Community License |
| Formato de pesos | no se incluyen pesos; solo codigo Python y configuraciones YAML |

## Arquitectura y entrenamiento

El sistema parte de `meta-llama/Llama-3.2-1B` congelado y añade cabezas de predicción multi-token que actúan como "drafters" en un esquema draft-and-verify. Cada token propuesto se verifica contra el modelo congelado, de modo que la salida final es idéntica a la decodificación greedy. Se comparan tres variantes de cabezas: independientes (MTP vanilla), dependientes (estilo Hydra) y dependientes con objetivos del backbone (autodestilación al estilo Medusa-2/Hydra++). El entrenamiento usa 10 millones de tokens y se evalúa con tres semillas.

Los datos provienen del split verificado de `ai4bharat/sangraha` para hindi, `wikimedia/wikipedia` para inglés y Dakshina para hindi romanizado escrito por humanos. La romanización se realiza con ITRANS, además de IAST e ISO. Se incorporan técnicas auxiliares como listas cortas de candidatos por frecuencia (FR-Spec) y árboles de borrador inspirados en Sequoia y EAGLE-2. La agrupación de palabras sigue a Karthika et al. (arXiv 2501.03988) y se aproxima con una lista de palabras de clase cerrada. El proyecto también introduce una métrica novedosa, la tasa de finalización de fronteras, que separa condiciones con más nitidez que la diferencia de bits por byte.

## Capacidades

- Aceleración de decodificación sin pérdida mediante draft-and-verify sobre Llama 3.2-1B congelado.
- Predicción multi-token con hasta cuatro tokens por pasada del backbone.
- Soporte de hindi en cuatro representaciones: devanagari, ITRANS, IAST e ISO.
- Análisis de puntos de cambio de código hindi-inglés en texto real.
- Medición de fertilidad del tokenizador, alineación de fronteras de palabra, entropía y dependencia entre spans (`D_indep`).
- Construcción de árboles de borrador y comparación de candidatos por posición de palabra.
- Evaluación de velocidad extremo a extremo en hardware consumer (GTX 1080 Ti).
- No incluye capacidades de generación autónoma, tool calling ni agentes; es un marco experimental de decodificación.

## Casos de uso

- Investigación en decodificación especulativa: permite reproducir experimentos de MTP comparando cabezas independientes, dependientes y con objetivos del backbone sobre un backbone congelado, con scripts por fase y 91 tests unitarios.
- Estudio del efecto de la tokenización en hindi: el repositorio ofrece herramientas para medir fertilidad y alineación de fronteras en devanagari, ITRANS, IAST e ISO, útil para diseñar tokenizadores multilingües.
- Aceleración de inferencia en producción de bajo presupuesto: las cabezas dependientes con lista corta de 4.352 candidatos logran 1,43x en inglés y 1,86x en devanagari en una GTX 1080 Ti, un escenario realista para despliegues con GPUs consumer.
- Análisis de code-switching hindi-inglés: los scripts de puntos de cambio permiten medir la tasa de acierto del primer borrador al entrar y salir del inglés, relevante para asistentes conversacionales bilingües.
- Evaluación de estrategias de árbol de borrador: los scripts de árbol y agregación permiten comparar candidatos por posición de palabra frente a la confianza de la cabeza, útil para optimizar decodificación especulativa.
- Docencia y reproducibilidad: el informe `docs/REPORT.md`, las notas de hardware y los manifiestos de resultados permiten replicar el estudio con Python 3.10.12, torch 2.5.1+cu121 y transformers 5.16.1.

## Benchmarks y rendimiento

Tokens por pasada del backbone (máximo 4), media de 3 semillas, 10M tokens de entrenamiento:

| Drafter | Ingles | Devanagari | ITRANS | IAST | ISO |
|---|---|---|---|---|---|
| Cabezas independientes (MTP vanilla) | 1,33 | 1,69 | 1,43 | 1,59 | 1,65 |
| Cabezas dependientes | 1,66 | 2,09 | 1,68 | 1,85 | 1,90 |
| Cabezas dependientes, objetivos del backbone | 1,75 | 2,20 | 1,68 | 1,87 | 1,89 |

Velocidad extremo a extremo frente a greedy en una GTX 1080 Ti:

| Configuracion | Ingles | Devanagari |
|---|---|---|
| MTP vanilla | 0,83x | 1,08x |
| Cabezas dependientes + objetivos del backbone + lista corta de 4.352 tokens | 1,43x | 1,86x |

Tasas de acierto del primer borrador en devanagari con cabezas dependientes y objetivos del backbone: 73% dentro de palabra, 76% en palabra funcional que continúa grupo, 36% al inicio de grupo nuevo. En cambios hindi-inglés: 8% al entrar en inglés, 43% al volver al hindi con palabra funcional y 6% al volver con palabra de contenido.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el backbone Llama 3.2-1B en fp16 requiere aproximadamente 2,5 GB, pero el repositorio no publica cifras de VRAM.
- GPU recomendadas: el proyecto se probó en una GTX 1080 Ti (Pascal, sm_61); requiere GPUs NVIDIA y el pin de torch 2.5.1 es deliberado para mantener soporte Pascal.
- Cabe en GPU consumer: sí, según las pruebas reportadas en GTX 1080 Ti.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el stack es Python 3.10.12, torch 2.5.1+cu121 y transformers 5.16.1.
- Latencia y throughput: se reportan factores de velocidad (0,83x a 1,86x) frente a greedy, no valores absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-switch-mtp | 1,24 B (backbone) | no disponible | MTP + decodificación especulativa sobre Llama 3.2-1B | no disponible (backbone Llama 3.2 Community License) | Repositorio de código, sin pesos |
| Medusa | Depende del backbone | Depende del backbone | Cabezas draft independientes sobre modelo congelado | Segun backbone | Codigo abierto |
| Hydra | Depende del backbone | Depende del backbone | Cabezas draft dependientes | Segun backbone | Codigo abierto |
| EAGLE-2 | Depende del backbone | Depende del backbone | Arboles de borrador con verificación | Segun backbone | Codigo abierto |

## Limitaciones y advertencias

- El repositorio no contiene pesos: ni el backbone ni las cabezas draft entrenadas se distribuyen, por lo que no es desplegable directamente.
- No se publica licencia para el repositorio; el uso del backbone está sujeto a la Llama 3.2 Community License, con restricciones para uso comercial.
- Las hipótesis H2 (discontinuidad por cambio de escritura) y H3 (ambigüedad ortográfica) no se resolvieron, según el propio informe.
- Las métricas de velocidad se obtuvieron en una única GTX 1080 Ti; no hay datos de latencia o throughput en GPUs modernas.
- El estudio se limita a hindi e inglés y a un backbone de 1,24 mil millones de parámetros; no hay evidencia de generalización a otros idiomas o tamaños.
- La agrupación de palabras se aproxima con una lista de clase cerrada, lo que puede introducir sesgo en los análisis de posición.
- Las estrategias de reweighting por aceptación, enmascaramiento en fronteras y gradient surgery no mejoraron los resultados, lo que limita las recetas de entrenamiento probadas.
- No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anupam-Rawat-IITB/code-switch-mtp
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- Informe del proyecto: `docs/REPORT.md` dentro del repositorio
- Notas de hardware: `docs/hardware-notes.md` dentro del repositorio
- Manifiesto de resultados: `results/manifest.md` dentro del repositorio
- Paper de agrupación de palabras: arXiv 2501.03988 (Karthika et al., "Semantically Cohesive Word Grouping in Indian Languages")
- Corpus hindi: https://huggingface.co/datasets/ai4bharat/sangraha
- Corpus inglés: https://huggingface.co/datasets/wikimedia/wikipedia
- Corpus romanizado: Dakshina
