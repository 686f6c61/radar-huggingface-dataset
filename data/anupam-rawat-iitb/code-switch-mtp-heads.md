# Anupam-Rawat-IITB/code-switch-mtp-heads

## Resumen

`code-switch-mtp-heads` es una colección de cabezas de predicción multi-token entrenadas sobre un backbone congelado `meta-llama/Llama-3.2-1B` para decodificación especulativa sin pérdida en hindi (devanagari y romanizaciones) e inglés. El autor es Anupam-Rawat-IITB y el modelo se publica como parte del proyecto `code-switch-mtp`. No se trata de un modelo generativo autónomo: los ficheros contienen únicamente los pesos de las cabezas (trunk compartido más bloques residuales por cabeza), sin matriz de embeddings, sin capa de salida y sin capas transformer del backbone, que debe obtenerse por separado de Meta.

La propuesta técnica es relevante porque aborda un problema concreto: acelerar la inferencia de Llama-3.2-1B en hindi sin alterar la salida. Cada cabeza de look-ahead predice uno o varios tokens por delante reutilizando la capa de salida del propio backbone, y sus objetivos son las salidas greedy del backbone ("backbone targets"), de modo que un borrador se acepta exactamente cuando coincide con lo que el backbone habría producido. Esto permite decodificación especulativa con árbol de borradores y verificación en una sola pasada del backbone por ronda.

El estado actual del repositorio es embrionario: cero descargas, cero likes, creado el 27 de noviembre de 2026, y la propia model card advierte de que los ficheros de pesos descritos aún no se han subido. La información disponible permite documentar la arquitectura y el procedimiento de entrenamiento, pero no el rendimiento reproducible por terceros ni la licencia de los pesos de las cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas de predicción multi-token (trunk compartido + un bloque residual por cabeza) sobre backbone transformer decoder-only congelado (Llama-3.2-1B) |
| Parametros totales | 46,1 M (3 cabezas de look-ahead) o 92,3 M (5 cabezas de look-ahead); no incluye los parámetros del backbone |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Llama-3.2-1B, 128k tokens según Meta; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos distribuidos en fp32) |
| Idiomas soportados | Hindi (devanagari, ITRANS, IAST, ISO) e inglés |
| Licencia | No disponible para los pesos de las cabezas; el backbone se rige por Llama 3.2 Community License |
| Formato de pesos | PyTorch state dict (`dependent_teacher.pt`) |

## Arquitectura y entrenamiento

El backbone permanece congelado. Sobre la última capa oculta del backbone se aplica un trunk compartido y, a continuación, un bloque residual por cabeza. La cabeza 0 predice el siguiente token; cada cabeza de look-ahead predice un token adicional hacia delante y además lee los embeddings de los tokens ya borradorados por las cabezas anteriores ("dependent heads"). Todas las cabezas reutilizan la capa de salida del backbone, motivo por el que esta no se almacena en los ficheros publicados. Los objetivos de las cabezas de look-ahead son las salidas greedy del backbone, lo que garantiza que un borrador aceptado sea idéntico a la generación greedy del backbone.

El entrenamiento es idéntico en todos los ficheros: 10M tokens, batches de 2 × 512 tokens, optimizador AdamW, learning rate 1e-4, peso de pérdida de look-ahead 0,1, precisión fp32 y 9.765 pasos. Los datos combinan hindi de Sangraha en devanagari y en tres romanizaciones (ITRANS, IAST, ISO) con texto de Wikipedia en inglés. Existen cuatro variantes: tres cabezas de look-ahead (46,1 M parámetros, 177 MB por fichero, condiciones devanagari/ITRANS/IAST/ISO/inglés con semillas 0, 1 y 2), cinco cabezas de look-ahead (92,3 M parámetros, 353 MB, devanagari semillas 0-2, ITRANS semilla 0 e inglés semilla 0), tres cabezas con enriquecimiento de code-switching (se repiten 5 veces los 1.172 bloques con más palabras en script latino, hasta el 30 % del presupuesto) y tres cabezas con mezcla devanagari + inglés (8M tokens de devanagari y 2M de Wikipedia inglesa).

## Capacidades

- Predicción multi-token hacia delante (3 o 5 tokens de look-ahead según la variante) sobre el backbone Llama-3.2-1B congelado.
- Decodificación especulativa sin pérdida: la salida verificada es idéntica a la decodificación greedy del backbone en cada documento evaluado.
- Soporte de árbol de borradores (draft tree) con rama copiada y una pasada de verificación del backbone por ronda.
- Manejo de hindi en script nativo (devanagari) y en tres esquemas de romanización (ITRANS, IAST, ISO).
- Cobertura de inglés como condición de entrenamiento y de mezcla en la variante devanagari + english.
- Variante específica para code-switching hindi-inglés con sobrerrepresentación de bloques ricos en palabras en script latino.
- No incluye capacidades de visión, audio, tool calling ni razonamiento agéntico propias; estas dependerían exclusivamente del backbone.

## Casos de uso

- Aceleración de inferencia en hindi para servicios de chat: las cabezas permiten decodificación especulativa con verificación en una pasada del backbone, reduciendo el coste por token generado en despliegues con Llama-3.2-1B como modelo de servicio.
- Normalización y generación en romanizaciones controladas: al cubrir ITRANS, IAST e ISO, el stack puede usarse en pipelines que producen texto hindi transliterado de forma consistente (por ejemplo, corpus lingüísticos o interfaces de búsqueda).
- Procesamiento de code-switching hindi-inglés: la variante `three_heads_code_switch_enriched` está diseñada para texto conversacional donde se alternan devanagari y palabras en script latino, habitual en redes sociales y soporte técnico.
- Evaluación de técnicas de decodificación especulativa: sirve como banco de pruebas reproducible para comparar árboles de borradores, tamaños de shortlist y número de tokens copiados por ronda sobre un backbone pequeño.
- Investigación en eficiencia de inferencia en lenguas de bajos recursos: el diseño de cabezas dependientes con reutilización de la capa de salida es un patrón reutilizable para otros idiomas y backbones.
- Despliegue en hardware modesto: la model card reporta mediciones en una GTX 1080 Ti en fp32 con batch 1, lo que sitúa el stack en el rango de GPUs de consumo para prototipos y pruebas.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los reportados por el autor, medidos de extremo a extremo en una GTX 1080 Ti, fp32, batch 1, decodificación greedy y salida idéntica al greedy en todos los documentos:

| Condición | Cabezas de look-ahead | Configuración | Aceleración frente a greedy |
|---|---|---|---|
| Hindi devanagari (media de 3 semillas) | 3 | Shortlist de 4.352 tokens, árbol de borradores, 12 tokens copiados, 16 tokens verificados por ronda | 2,9x |
| Hindi ITRANS (semilla 0) | 3 | Misma configuración | 4,9x (parte de la cifra proviene de que el modelo reformula el prompt) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las tablas y logs completos se encuentran en el repositorio de código del proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos de las cabezas ocupan 177 MB (3 cabezas) o 353 MB (5 cabezas) en fp32, a lo que hay que sumar el backbone Llama-3.2-1B en fp32.
- GPU recomendadas: el autor reporta mediciones en una GTX 1080 Ti; no se especifican otras GPU.
- Cabe en GPU de consumo: sí, al menos en GTX 1080 Ti según las mediciones del autor con backbone de 1B en fp32.
- Opciones de despliegue: el código de referencia usa PyTorch y `transformers` (`AutoModelForCausalLM`), con scripts propios del repositorio (`scripts/phase5_dependent_eval.py`, `scripts/phase5_tree_decode_timing.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se publica la aceleración relativa (2,9x en devanagari y 4,9x en ITRANS); no se aportan valores absolutos de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| code-switch-mtp-heads (este modelo) | 46,1 M / 92,3 M de cabezas + backbone 1B | No disponible | Cabezas de predicción multi-token para decodificación especulativa sin pérdida en hindi | No disponible para las cabezas; Llama 3.2 Community License para el backbone | Pesos aún no subidos según la model card |
| meta-llama/Llama-3.2-1B | 1,2 B (aprox., no confirmado en la información) | No disponible en la información | Modelo generativo base | Llama 3.2 Community License | Disponible en Hugging Face |
| Otros stacks de decodificación especulativa (EAGLE, Medusa) | No disponible | No disponible | Cabezas de borrador sobre backbone congelado | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre este stack y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros de pesos descritos en la model card no se han subido al repositorio; la página contiene por ahora solo la descripción.
- Los ficheros no incluyen el backbone: es imprescindible obtener `meta-llama/Llama-3.2-1B` por separado y aceptar la Llama 3.2 Community License y su política de uso aceptable.
- No se ha elegido licencia para los pesos de las cabezas, lo que impide determinar condiciones de uso comercial.
- La aceleración reportada en ITRANS (4,9x) está parcialmente inflada porque el modelo reformula el prompt; el propio autor lo advierte.
- El entrenamiento se limita a 10M tokens y a hindi e inglés; no hay evidencia de generalización a otros idiomas ni a dominios alejados de Sangraha y Wikipedia.
- El diseño depende de la coincidencia exacta con la salida greedy del backbone; cambios en el backbone, en la tokenización o en la precisión pueden invalidar la garantía de pérdida cero.
- No se han publicado evaluaciones de sesgos ni de tasa de alucinación específicas para este stack.
- El repositorio tiene cero descargas y cero likes, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anupam-Rawat-IITB/code-switch-mtp-heads
- Proyecto code-switch-mtp: https://huggingface.co/Anupam-Rawat-IITB/code-switch-mtp
- Backbone Llama-3.2-1B: https://huggingface.co/meta-llama/Llama-3.2-1B
- Licencia Llama 3.2: https://huggingface.co/meta-llama/Llama-3.2-1B/blob/main/LICENSE.txt
- Política de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
