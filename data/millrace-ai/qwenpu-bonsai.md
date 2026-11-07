# millrace-ai/qwenpu-bonsai

## Resumen

QwenPU on Bonsai-27B Q1_0 es un checkpoint experimental (v0.1) publicado por millrace-ai que injerta un circuito RISC-V vectorial, denominado QwenPU, dentro del decoder del modelo Bonsai-27B de Prism ML. El resultado es un GGUF de 3,8 GB que combina los pesos del modelo base cuantizados a 1 bit (Q1_0) con coeficientes de circuito disperso y snapshots de un programa invitado (guest) de tres tokens del dataset stories260K. No se trata de un modelo de lenguaje nuevo ni de un ajuste fino: es un artefacto de investigación que demuestra la ejecución de un circuito ajeno dentro del forward pass CUDA de un LLM.

El modelo base, Bonsai-27B, es una compresión extrema del Qwen3.6-27B de Alibaba, diseñada por la startup estadounidense Prism ML para caber en dispositivos móviles. QwenPU añade 23 subcapas de circuito activas implementadas como nodos GGML personalizados con respaldo CUDA, agrupadas en 13 bloques por el emisor de capas estándar fijado a una revisión concreta de llama.cpp. Las coordenadas del circuito retenidas contribuyen a la normalización residual del modelo, de modo que bytes de tensores idénticos pueden producir logits distintos.

La relevancia de este checkpoint es acotada pero técnica: valida que un circuito RISC-V de invitado puede ejecutarse dentro del decoder de un LLM con estado de host intacto, y publica trazas de ejecución reproducibles. No está pensado para uso conversacional general, y su ámbito de validación declarado se limita a un único token por llamada en la secuencia cero con un prefijo de tool-call fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Bonsai-27B, derivado de Qwen3.6-27B) con sublayers de circuito RISC-V QwenPU inyectadas como nodos GGML/CUDA |
| Parametros totales | 26.917.758.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q1_0 (1 bit) en el checkpoint publicado; el guest incluye pesos int4 de stories260K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Bonsai-27B-Q1_0-QwenPU-stories260k.gguf`, 3.825.213.248 bytes) + manifiesto JSON |

## Arquitectura y entrenamiento

El checkpoint parte del GGUF de Bonsai-27B en cuantización Q1_0 y le añade, mediante un exportador, coeficientes de circuito disperso y snapshots con nombre del guest. Estos snapshots aportan el estado inicial de programa y máquina, incluidos los pesos int4 del guest stories260K. El exportador verificó igualdad byte a byte de las 851 cargas útiles de tensores originales y de las entradas de metadatos del GGUF de origen.

El decoder parcheado ejecuta 23 sublayers de circuito activas como nodos GGML con respaldo CUDA personalizado, agrupadas en 13 bloques por el emisor de capas estándar de la revisión fijada. Las coordenadas de circuito retenidas intervienen en la normalización residual del modelo, por lo que el resultado no es equivalente al Bonsai original aunque los tensores sean idénticos. No hay información sobre el volumen de datos de entrenamiento, composición del dataset ni uso de RLHF o DPO; el modelo base hereda el entrenamiento de Qwen3.6-27B, pero no se detalla en la información disponible.

## Capacidades

- Generación de texto conversacional heredada del modelo base Bonsai-27B, sujeta a la degradación propia de la cuantización Q1_0.
- Ejecución de un circuito RISC-V vectorial de invitado dentro del forward pass CUDA del decoder, con trazas de ejecución comparables contra un intérprete de referencia independiente.
- Generación de texto por parte del guest stories260K: con el prefijo fijo `Run<tool_call></tool_call>` produjo `Once upon a` en la validación sobre GTX 1080.
- Soporte de tool calling: el prefijo validado es explícitamente de tool-call, aunque el alcance declarado se limita a ese prefijo fijo.
- Preservación del estado del host: la caché y la posición de texto de Bonsai permanecieron sin cambios mientras corría el circuito en las tres pruebas.
- No hay información sobre capacidades multilingües, razonamiento multi-paso autónomo, visión, audio ni modo thinking.

## Casos de uso

- Investigación en ejecución de circuitos dentro de LLM: el checkpoint permite reproducir trazas de ejecución de un circuito RISC-V embebido en el decoder y compararlas con un intérprete de referencia, usando el validador incluido y el manifiesto junto al GGUF.
- Verificación de portabilidad de runtimes: sirve para comprobar que una build parcheada de llama.cpp (revisión `9fcaed763ccda38ea81068ad9d7f991aaddca451`, objetivo `sm_61`) reproduce las trazas publicadas en hardware Pascal.
- Estudio de cuantización extrema a 1 bit: el artefacto documenta cómo un modelo de 27B en Q1_0 ocupa 3,8 GB y qué diferencias de logits introduce el circuito (máximo absoluto de aproximadamente 0,106 en reposo y 0,107 tras el handoff).
- Pruebas de regresión de kernels CUDA personalizados: los informes de validación vectorial y de decoder permiten usar el checkpoint como fixture para detectar cambios en nodos GGML respaldados por CUDA.
- Demostración de integración guest-host: el caso del guest stories260K de tres tokens ilustra el handoff entre el estado del LLM y un programa invitado con pesos int4 propios.
- Auditoría de reproducibilidad de artefactos: los SHA-256 del GGUF y del manifiesto, junto con los ELF incluidos con rutas de build redactadas, permiten reconstruir el mismo GGUF y contrastar identidad de runtime.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas de validación de ejecución:

| Prueba | Resultado en GTX 1080 |
|---|---|
| Hasta el primer producto matriz-vector | 3.252 tokens de traza de ejecución coincidentes |
| 1 token de stories260K | `Once`, con 51.187 tokens de traza coincidentes |
| 3 tokens de stories260K | `Once upon a`, con 150.405 tokens de traza coincidentes, 618 tokens de traza/s en el bucle nativo y 246,9 s de tiempo de pared de la sonda |
| Memoria, ejecución de 3 tokens | 5.403 MiB de VRAM pico muestreada en todo el dispositivo (1.192 MiB de línea base) y 4,80 GiB de working set de RAM del árbol de procesos |
| Mutación de coeficiente | La salida `8` pasó a `0`; restaurar el coeficiente restauró la traza exacta |
| Comparación con stock | IDs greedy coincidentes con diferencias máximas absolutas de logit de aproximadamente 0,106 en reposo y 0,107 tras el handoff |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,4 GiB de pico medido en una ejecución de 3 tokens con el modelo totalmente descargado en una sola GPU; el archivo GGUF pesa 3,8 GB.
- GPU recomendadas: la única configuración validada es una GTX 1080 (Pascal, `sm_61`). No hay datos de validación en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en GTX 1080 según la validación publicada.
- Opciones de despliegue: exclusivamente la build parcheada de Windows CUDA de Prism llama.cpp en la revisión `9fcaed763ccda38ea81068ad9d7f991aaddca451`. Stock llama.cpp, LM Studio y Ollama son incompatibles con este formato.
- Latencia y throughput: 618 tokens de traza de ejecución por segundo en el bucle nativo y 246,9 s de tiempo de pared para la sonda de 3 tokens en GTX 1080. No hay cifras de throughput de generación de lenguaje.
- RAM de host: 4,80 GiB de pico en el árbol de procesos durante la ejecución de 3 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| QwenPU on Bonsai-27B Q1_0 (este) | 26.917.758.976 | no disponible | Q1_0 | Apache-2.0 | Circuito RISC-V embebido en el decoder; validación limitada a prefijo fijo |
| Bonsai-27B (Prism ML) | 27B (aproximado) | no disponible | Q1_0 y otras variantes; la menor ocupa 3,9 GB | Apache-2.0 | Compresión extrema de Qwen3.6-27B para móvil, portátil y navegador |
| Qwen3.6-27B (Alibaba) | 27B (aproximado) | no disponible | no disponible | Apache-2.0 | Modelo base original, sin compresión extrema |

## Limitaciones y advertencias

- Ámbito de validación restringido: solo cubre un decoder totalmente descargado en una única GPU, un token por llamada en la secuencia cero y el prefijo de tool-call fijo. Un guest de 60 tokens, el dispatch autónomo en la ruta CUDA y la serialización del estado del circuito quedan fuera del alcance validado.
- La calidad lingüística amplia no está evaluada; la model card la excluye explícitamente del alcance.
- Requiere una build concreta y parcheada de llama.cpp en Windows con CUDA y objetivo `sm_61`; cualquier otro runtime estándar fallará.
- Los pesos en Q1_0 implican una degradación de calidad sustancial respecto al modelo de 27B en precisión superior; no hay métricas publicadas que la cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede asumir cobertura multilingüe.
- Licencia Apache-2.0 permite uso comercial, pero el checkpoint incorpora componentes de terceros (Bonsai, QwenPU, Qwenputer, stories260K) cuyas licencias se detallan en el directorio `licenses` del repositorio; conviene revisarlas antes de un uso en producción.
- El checkpoint no está pensado para producción: es un artefacto experimental v0.1 con cero descargas y cero likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai
- Modelo base: https://huggingface.co/prism-ml/Bonsai-27B-gguf
- Repositorio del proyecto: https://github.com/tim-osterhus/qwenpu-bonsai
- Instrucciones de build y lanzamiento en Windows: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/docs/REPRODUCE.md
- Identidad de runtime: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/runtime-identity.json
- Procedencia del guest: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/guests/README.md
- Informe de validación de historia: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/validation.json
- Informe de validación vectorial v0.1: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/release-v0.1/vector-validation.json
- Informe histórico de validación vectorial: https://github.com/tim-osterhus/qwenpu-bonsai/blob/v0.1.0/results/forward/decoder-validation/validation.json
- Licencia de distribución: https://huggingface.co/millrace-ai/qwenpu-bonsai/blob/main/LICENSE
- Licencias de componentes: https://github.com/tim-osterhus/qwenpu-bonsai/tree/v0.1.0/licenses
- Avisos: https://huggingface.co/millrace-ai/qwenpu-bonsai/blob/main/NOTICE
- Guía de Bonsai 27B: https://regolo.ai/bonsai-27b-explained-how-a-27b-model-runs-locally/
- Artículo sobre Bonsai 27B en iPhone: https://www.notebookcheck.net/AI-without-the-cloud-This-language-model-now-fits-on-your-iPhone.1345243.0.html
