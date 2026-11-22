# millrace-ai/qwenpu-bonsai-4b-stock-prism

## Resumen

`millrace-ai/qwenpu-bonsai-4b-stock-prism` es un checkpoint de investigación que integra el circuito RISC-V y vectorial de QwenPU dentro del bloque de predicción multi-token (MTP) de una versión empaquetada de Bonsai 2 4B. El modelo anfitrión es un transformer de tipo `qwen35` con 2.560 dimensiones ocultas, 32 bloques de lenguaje más un bloque MTP adicional, y una longitud de contexto declarada de 262.144 tokens en la cabecera GGUF. El resultado es un GGUF combinado de 11.840.714.242 elementos tensoriales repartidos en 444 tensores, aunque el host de lenguaje original conserva sus 4.205.751.296 elementos.

El interés técnico del checkpoint no reside en sus capacidades de generación de texto, sino en la demostración de que un circuito invitado (guest) compilado para RISC-V puede ejecutarse dentro de un checkpoint GGUF cargado por una build estándar de Prism/llama.cpp, en concreto la b12128 para Windows CUDA 12.4, sin modificar el binario. El autor documenta una ejecución verificada en una GeForce GTX 1080 de 8 GiB que reproduce el guest de tres tokens `stories260K`, con coincidencia de 37.080 registros arquitectónicos, 55.375 escrituras ordenadas del guest y 726 operaciones VMAT, además de mantener intactos el estado KV, el estado recurrente y los logits del modelo original.

Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción: la captura completa tarda aproximadamente 8 h 49 min en la GPU de referencia y el modelo base es una cuantización ternaria PQ2_0 de Bonsai 2 4B. La licencia es Apache 2.0 y el repositorio ocupa 4,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` con bloque MTP y circuito QwenPU embebido |
| Parámetros totales | 11.840.714.242 elementos tensoriales en el GGUF combinado (host de lenguaje: 4.205.751.296) |
| Parámetros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 262.144 tokens declarados en la cabecera GGUF |
| Tipos de cuantización | PQ2_0 (ternaria empaquetada) en el host de lenguaje |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo principal de 4.031.384.384 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `prism-ml/Ternary-Bonsai-2-4B-gguf`, un transformer `qwen35` con 2.560 de ancho oculto y 36.352 filas feed-forward por bloque. Sobre esa base, el checkpoint añade un bloque MTP que aloja el circuito RISC-V y vectorial de QwenPU, manteniendo los 426 extents originales de los tensores de lenguaje PQ2_0. Los tensores empaquetados que requieren la forma ampliada conservan sus bytes originales y reciben padding neutro, de modo que el host de lenguaje no se altera funcionalmente. El layout final es de 32 bloques de lenguaje más 1 bloque MTP QwenPU.

No se documenta en la información disponible un proceso de entrenamiento adicional, número de tokens, composición del dataset ni fases de RLHF o DPO. El checkpoint se describe como una integración de inferencia, no como un modelo reentrenado: el autor indica que fue creado con Bonsai de Prism ML y que el guest se ejecuta en un contexto separado dentro del checkpoint cargado, con el launcher de Windows encargado de cargar el ELF, realimentar las acciones seleccionadas por el circuito y aplicar las peticiones de caché mediante las APIs estándar de Prism. La verificación se realiza con una referencia de CPU fijada por separado que comprueba la ejecución registrada offline.

## Capacidades

- Generación de texto conversacional heredada del host Bonsai 2 4B en formato PQ2_0.
- Predicción multi-token mediante el bloque MTP presente en el layout.
- Ejecución de un circuito invitado RISC-V y vectorial (QwenPU) dentro del propio checkpoint, con realimentación de acciones y peticiones de caché a través de las APIs de Prism.
- Verificación reproducible de trazas: comparación de registros arquitectónicos, escrituras del guest y operaciones VMAT contra una referencia de CPU.
- Preservación del estado del host (posición de texto, caché KV, estado recurrente y logits) durante la ejecución del guest.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: modo thinking, visión o audio no disponibles.

## Casos de uso

- Investigación en ejecución de circuitos dentro de checkpoints GGUF: el modelo permite estudiar cómo un guest RISC-V compilado convive con tensores de lenguaje empaquetados y cómo se realimentan sus acciones a través de las APIs de Prism, usando el smoke test de exponenciación vectorial de 12 instrucciones como punto de partida.
- Reproducibilidad de resultados de hardware: el launcher y los verificadores permiten replicar en una GTX 1080 la captura completa de tres tokens y comparar hashes de estado contra la referencia de CPU, útil para auditar pipelines de inferencia.
- Validación de builds de llama.cpp: sirve como caso de prueba de la build Prism b12128 para Windows CUDA 12.4, comprobando la carga de DLLs, el pin de runtime y la integridad de paquetes mediante SHA-256.
- Docencia y divulgación técnica: el checkpoint y sus evidencias (`checkpoint.json`, trazas, veredictos) permiten ilustrar conceptos de MTP, cuantización ternaria PQ2_0 y ejecución de código invitado en un runtime de inferencia.
- Auditoría de integridad de modelos: los archivos de evidencia y las sumas SHA-256 publicadas facilitan verificar que un GGUF descargado coincide byte a byte con el artefacto auditado.
- Pruebas de estrés de memoria en GPU de gama media: con picos medidos de 4,73 GiB de VRAM dedicada al proceso y 4,46 GiB de RAM de trabajo, el checkpoint sirve para caracterizar el comportamiento en tarjetas de 8 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento publicados son mediciones de ejecución del guest en una GeForce GTX 1080 de 8 GiB con Prism b12128 para Windows CUDA 12.4:

| Métrica | Valor |
|---|---|
| Tiempo de captura del guest | 8 h 49 min |
| VRAM dedicada al proceso (pico muestreado) | 4,73 GiB |
| Memoria GPU compartida del proceso (pico) | 84 MiB |
| VRAM a nivel de dispositivo (pico) | 6,84 GiB |
| RAM de trabajo del proceso | 4,46 GiB |
| Registros arquitectónicos verificados | 37.080 |
| Escrituras ordenadas del guest | 55.375 |
| Operaciones VMAT | 726 |
| Tamaño del GGUF principal | 4.031.384.384 bytes |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo pesa 4,0 GB en disco; en la ejecución de referencia se midieron 4,73 GiB de VRAM dedicada al proceso y 6,84 GiB a nivel de dispositivo.
- GPU recomendadas: la única configuración verificada es una GeForce GTX 1080 de 8 GiB con controlador compatible con CUDA 12.4. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al menos en la GTX 1080 de 8 GiB probada. No hay datos para tarjetas con menos de 8 GiB.
- Opciones de despliegue: build Prism b12128 de llama.cpp para Windows CUDA 12.4 (ZIP de aplicación y ZIP de runtime CUDA), más el launcher `Run.py` y el repositorio QwenPU fijado en el commit `6e2767aaa59b69ea03300c0a5199d7b36debbe50`. No se documenta soporte para vLLM, Ollama ni TGI.
- Requisitos de software: Windows x64 nativo, Python 3.11 x64 con NumPy 2.4.6 e ijson 3.4.0.post0, Git, `hf` CLI y Microsoft Visual C++ x64 Redistributable.
- Latencia y throughput: no disponibles en términos de tokens por segundo; la captura de tres tokens tardó aproximadamente 8 h 49 min en la GTX 1080, un dato que refleja la instrumentación de verificación más que el rendimiento de decodificación del host.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| millrace-ai/qwenpu-bonsai-4b-stock-prism | 11.840.714.242 elementos tensoriales en GGUF combinado (host: 4.205.751.296) | 262.144 | GGUF, PQ2_0 | Apache 2.0 | Host Bonsai 2 4B con circuito QwenPU embebido en bloque MTP |
| prism-ml/Ternary-Bonsai-2-4B-gguf | no disponible en la información proporcionada | no disponible en la información proporcionada | GGUF, PQ2_0 | no disponible en la información proporcionada | Modelo base ternario del que deriva este checkpoint |
| Otros checkpoints de la familia Bonsai (27B, 9B) | no disponible | no disponible | GGUF | no disponible | Trazas de comparación citadas por el autor |

La información disponible no permite comparar rendimiento en benchmarks con alternativas de la misma categoría. El modelo base y los checkpoints de 27B y 9B se mencionan únicamente como referencias de trazabilidad en las evidencias del autor.

## Limitaciones y advertencias

- El checkpoint está diseñado como artefacto de investigación reproducible, no como modelo de producción: la captura de tres tokens tarda horas y el flujo depende de un launcher y verificadores específicos.
- La longitud de contexto de 262.144 tokens es la declarada en la cabecera GGUF; no se documenta una evaluación de calidad de atención a esa distancia.
- El host de lenguaje es una cuantización ternaria PQ2_0, lo que implica una pérdida de precisión respecto a pesos de mayor rango; no se publican métricas de degradación.
- Los tensores ampliados reciben padding neutro; aunque el autor afirma que el comportamiento del host se preserva, no se detallan análisis de sensibilidad en tareas distintas del guest de tres tokens.
- La única plataforma verificada es Windows x64 con CUDA 12.4 y una GTX 1080; no hay evidencia publicada para Linux, ROCm, Metal ni GPUs de datacenter.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación del host de lenguaje.
- El uso comercial está permitido por la licencia Apache 2.0, pero el modelo incorpora un circuito compilado de QwenPU y depende de la build Prism de llama.cpp; conviene revisar las licencias de esos componentes antes de redistribuir.
- La integridad del artefacto debe comprobarse con las sumas SHA-256 publicadas y el pin de runtime; el autor advierte que el launcher verifica hashes de paquete antes de ejecutar.
- El rendimiento medido incluye actividad de otros procesos en la VRAM a nivel de dispositivo, por lo que las cifras de 6,84 GiB no deben interpretarse como consumo aislado del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism
- GGUF principal: https://huggingface.co/millrace-ai/qwenpu-bonsai-4b-stock-prism/resolve/main/Bonsai-2-4B-PQ2_0-QwenPU-Stock-Prism.gguf
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- GGUF base fijado: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/blob/50ebba61be85e5be07e8083db468ace0fc1bac43/Ternary-Bonsai-2-4B-PQ2_0.gguf
- Repositorio QwenPU: https://github.com/divagr18/QwenPU
- Build Prism de llama.cpp (release b12128): https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896
- ZIP de aplicación Prism: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/llama-prism-b12128-d7b2896-bin-win-cuda-12.4-x64.zip
- ZIP de runtime CUDA: https://github.com/PrismML-Eng/llama.cpp/releases/download/prism-b12128-d7b2896/cudart-llama-bin-win-cuda-12.4-x64.zip
- Microsoft Visual C++ x64 Redistributable: https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist
