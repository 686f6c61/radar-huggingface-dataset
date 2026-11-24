# millrace-ai/Raon-1-nano-QwenPU-GGUF

## Resumen

Raon-1-nano-QwenPU-GGUF es un artefacto de investigación publicado por millrace-ai (atribuido a Tim Osterhus) que modifica el modelo KRAFTON Raon-1 nano para ejecutar un procesador RISC-V de 32 bits con operaciones vectoriales dentro de su grafo nativo de predicción multi-token (MTP). No se trata de un modelo de lenguaje entrenado desde cero, sino de un checkpoint GGUF derivado del Raon-1 nano oficial en cuantización Q4_K_M con MTP, en el que 23 tensores del bloque MTP 24 se sustituyen por un circuito compilado que emula el procesador invitado. El objetivo es puramente investigador: demostrar que la inferencia de un transformer puede alojar la ejecución de un intérprete de CPU completo.

El modelo base Raon-1 nano cuenta con 5.780.879.538 parámetros totales y se distribuye bajo licencia Apache-2.0. El artefacto ocupa 4,2 GB en el repositorio y el checkpoint principal pesa 4.225.760.128 bytes. La validación reportada incluye la ejecución del programa invitado stories260K (tres tokens de historia) hasta la instrucción HALT con código de salida 0, tras 37.080 retiradas (instrucciones completadas) en una GTX 1080, con un intervalo de ejecución medido de 14 horas, 21 minutos y 54 segundos, más 4 minutos y 22 segundos de preparación.

La relevancia es acotada y experimental: no es un modelo para producción ni para tareas generativas convencionales, sino una prueba de concepto sobre cómputo dentro del grafo y paridad bit a bit con el intérprete de referencia QwenPU. El repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con predicción multi-token (MTP); bloque MTP 24 sustituido por un circuito RISC-V de 32 bits compilado |
| Parametros totales | 5.780.879.538 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (checkpoint base); GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El checkpoint deriva del GGUF oficial KRAFTON Raon-1 nano en Q4_K_M con MTP (commit `67d566c2064079b67d0623c5a4acb981e13475cb`). Las FFN de texto conservan sus bloques cuantizados originales con relleno a cero hasta 28.672 filas. Los 23 tensores reemplazados en el bloque MTP 24 implementan el circuito compilado del procesador RISC-V y ocupan el lugar del bloque borrador especulativo preentrenado. El grafo calcula direcciones del invitado, aritmética, saltos condicionales y valores de escritura.

No se documenta un proceso de entrenamiento adicional: la modificación es una sustitución de tensores sobre un modelo preentrenado, no un ajuste fino. La innovación técnica consiste en alojar la ejecución de un ELF invitado (stories260K) dentro del grafo MTP, realimentando el ganador de la cabeza atada y la fila oculta, aplicando operaciones de caché y entregando la salida estándar del invitado al contexto de texto ordinario de Raon. La validación reporta paridad bit a bit con el intérprete QwenPU: 150.405 registros canónicos reconstruidos, 37.082 comprobaciones de texto aparcadas, coincidencia del estado de texto serializado, la fila oculta y los 259.840 logits en los límites registrados, y la línea exacta de 12 bytes `Once upon a\n`.

## Capacidades

- Ejecución de un procesador RISC-V de 32 bits con operaciones vectoriales dentro del grafo MTP del modelo.
- Cálculo de direcciones, aritmética entera, bifurcaciones y valores de escritura del programa invitado.
- Realimentación del ganador de la cabeza atada y de la fila oculta al contexto de texto de Raon.
- Operaciones de caché sobre el estado del invitado.
- Decodificación greedy compartida tras la inserción de la salida estándar del invitado.
- Generación de texto convencional del modelo base Raon-1 nano (heredada; no validada de forma independiente en esta ficha).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cómputo dentro del grafo: reproducir la ejecución del invitado stories260K en una GTX 1080 y comparar los registros canónicos con el intérprete QwenPU de referencia, usando los recibos de evidencia del repositorio.
- Verificación de paridad bit a bit: comprobar que el estado de texto serializado, la fila oculta y los 259.840 logits coinciden con Raon original en los límites registrados, como paso previo a cualquier modificación del circuito.
- Estudio de bloques MTP y decodificación especulativa: analizar cómo un bloque borrador preentrenado puede sustituirse por lógica compilada y qué efectos tiene sobre la paridad del modelo.
- Reproducibilidad de artefactos GGUF: reconstruir el GGUF y sus sidecars de perfil byte a byte desde un checkout limpio de Windows y validar los binarios resultantes.
- Docencia sobre arquitecturas transformer y emulación: usar el caso como ejemplo de alojamiento de un intérprete de CPU en tensores de un modelo de lenguaje.
- Evaluación de portabilidad RISC-V en entornos de inferencia: medir tiempos de ejecución del invitado (14 h 21 min 54 s en GTX 1080) y compararlos con otras plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los datos de validación reportados son de corrección funcional, no de calidad lingüística:

| Prueba | Resultado |
|---|---|
| Ejecución del invitado stories260K | HALT con código de salida 0 tras 37.080 retiradas |
| Registros canónicos reconstruidos | 150.405, coincidentes con el intérprete QwenPU |
| Comprobaciones de texto aparcadas | 37.082 superadas |
| Logits comparados | 259.840, coincidentes bit a bit |
| Salida de texto generada | `Once upon a\n` (12 bytes exactos) |
| Tiempo de ejecución del invitado (GTX 1080) | 14 h 21 min 54 s + 4 min 22 s de preparación |
| Reconstrucción limpia del GGUF | byte a byte, con fixture CUDA acotado superado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 4.225.760.128 bytes (aproximadamente 3,9 GiB), por lo que se requiere al menos esa cantidad más el overhead del runtime.
- Hardware de captura nativa reportado: NVIDIA GTX 1080 de 8 GiB, Windows 10 Pro, CUDA 12.4.
- GPU recomendadas: no disponible; la única configuración validada es la GTX 1080.
- Cabe en GPU de consumo: sí, según la validación en GTX 1080 (8 GiB).
- Opciones de despliegue: llama.cpp en la revisión fijada `b6626358828007d0140d42399705b73bb7a6444b` del repositorio krafton-ai/llama.cpp, junto con el launcher de investigación para Windows. No se documentan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: la ejecución del invitado medida es de 14 h 21 min 54 s para el programa stories260K; no se reportan métricas de throughput de generación de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| millrace-ai/Raon-1-nano-QwenPU-GGUF | 5.780.879.538 | no disponible | Emulación RISC-V en grafo MTP | Apache-2.0 | GGUF, repositorio de investigación |
| KRAFTON/Raon-1-nano-gguf | no disponible en esta ficha | no disponible | Modelo base con MTP | Apache-2.0 | GGUF oficial |
| karpathy/tinyllamas (stories260K) | no disponible en esta ficha | no disponible | Modelo diminuto de historias | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado para uso en producción ni para tareas generativas convencionales.
- La validación se limita a un programa invitado de tres tokens (stories260K) y a una única configuración de hardware (GTX 1080, Windows 10, CUDA 12.4).
- El tiempo de ejecución del invitado (más de 14 horas) hace inviable cualquier uso interactivo.
- Solo se ha validado el launcher de Windows y una revisión fijada de llama.cpp; no hay soporte documentado para Linux, macOS u otros runtimes.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe del modelo base en esta ficha.
- La licencia Apache-2.0 del modelo se mantiene, pero la distribución del código fuente documenta licencias de componentes adicionales (QwenPU, Qwenputer, stories260K) que deben revisarse por separado.
- El repositorio no registra descargas ni interacciones, lo que indica ausencia de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/millrace-ai/Raon-1-nano-QwenPU-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano-gguf/tree/67d566c2064079b67d0623c5a4acb981e13475cb
- Runtime fijado: https://github.com/krafton-ai/llama.cpp/tree/b6626358828007d0140d42399705b73bb7a6444b
- Repositorio fuente: https://github.com/tim-osterhus/qwenpu-raon
- Guía de reproducción en Windows: https://github.com/tim-osterhus/qwenpu-raon/blob/main/docs/REPRODUCE-WINDOWS.md
- Índice de evidencias: https://github.com/tim-osterhus/qwenpu-raon/tree/main/evidence
- Recibo de terminal CUDA: https://github.com/tim-osterhus/qwenpu-raon/blob/main/evidence/story-cuda-terminal.json
- Recibo de paridad de texto: https://github.com/tim-osterhus/qwenpu-raon/blob/main/evidence/story-cuda-text-parity.json
- Recibo de build limpio en Windows: https://github.com/tim-osterhus/qwenpu-raon/blob/main/evidence/clean-windows-build.json
- QwenPU: https://github.com/divagr18/QwenPU/tree/6e2767aaa59b69ea03300c0a5199d7b36debbe50
- stories260K: https://huggingface.co/karpathy/tinyllamas/tree/0bd21da7698eaf29a0d7de3992de8a46ef624add/stories260K
