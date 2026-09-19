# ShayonSarker/SmolVLM-500M-Instruct-Q4_K_M-GGUF

## Resumen

El repositorio ShayonSarker/SmolVLM-500M-Instruct-Q4_K_M-GGUF contiene una cuantización en formato GGUF del modelo base HuggingFaceTB/SmolVLM-500M-Instruct, publicada por el usuario ShayonSarker bajo licencia Apache-2.0. Está pensada para inferencia local totalmente offline mediante llama.cpp y Ollama, con un peso de aproximadamente 303 MB en cuantización Q4_K_M.

El punto crítico es que, pese al nombre y a las etiquetas de visión e image-text-to-text, el propio autor advierte en la model card que el archivo contiene únicamente el *text tower* (291 tensores, arquitectura llama dentro del contenedor GGUF) y que rechaza cualquier entrada de imagen. El encoder de visión SigLIP y el proyector multimodal (mmproj) no están incluidos, de modo que esta cuantización no puede ver imágenes a pesar de su denominación.

El modelo base es un VLM de la familia SmolVLM de HuggingFaceTB, con unos 500 millones de parámetros en total. La cuantización registra 409.252.800 parámetros en safetensors y emplea una ventana de 2048 tokens en la evaluación del autor. Resulta relevante como artefacto de generación de texto ultraligero para entornos sin GPU, no como sustituto del VLM completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (text tower; arquitectura llama en el contenedor GGUF). El modelo base es un VLM con encoder SigLIP + proyector + LLM |
| Parametros totales | 409.252.800 (safetensors del repo); el GGUF contiene 291 tensores, es decir, solo el text tower |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (valor empleado en la evaluación del autor); máximo soportado no especificado |
| Tipos de cuantizacion | Q4_K_M (5,89 bits/peso efectivos por mezcla con q5_0/q8_0), Q8_0, F16 |
| Idiomas soportados | No disponible (calibración y evaluación realizadas en inglés sobre wikitext-2) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base SmolVLM-500M-Instruct es un modelo de visión-lenguaje compuesto por un encoder de visión SigLIP, un proyector multimodal y un modelo de lenguaje. Esta publicación no reproduce esa arquitectura completa: el archivo GGUF incluye solo el text tower, con 291 tensores y arquitectura llama, mientras que el encoder SigLIP y el mmproj se dejaron fuera y quedan como trabajo pendiente según el autor.

La cuantización se generó con llama.cpp `0.4.1-dev` aplicando imatrix calibrado sobre 3000 líneas de wikitext-2 (seed 42, 625 chunks, 4 hilos). Debido a que las capas de 960 dimensiones del modelo base no se dividen de forma exacta para Q4_K, llama.cpp recurrió a q5_0/q8_0 en parte de los tensores, resultando en 5,89 bits por peso efectivos. No se mencionan fases de RLHF o DPO asociadas a esta cuantización; se trata de un proceso exclusivamente de compresión.

## Capacidades

- Generación de texto conversacional, heredada del modelo base en su variante instruct.
- No soporta entrada de imágenes: el encoder de visión no está incluido y la entrada visual es rechazada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la calibración y evaluación se hicieron solo en inglés.
- Capacidad especial: ejecución local de bajo coste con huella de disco de ~303 MB y sin dependencia de red.

## Casos de uso

- Generación de texto offline en dispositivos embebidos: el peso de ~303 MB y la ejecución vía llama.cpp permiten desplegarlo en Raspberry Pi o CPU sin GPU, útil para resúmenes y respuestas cortas sin conexión.
- Prototipado rápido de pipelines conversacionales: sirve como modelo de sustitución barato para validar integraciones con Ollama o llama.cpp antes de escalar a modelos mayores.
- Resumen de documentos cortos: con 2048 tokens de contexto puede condensar notas, correos o fragmentos de artículo en una fase previa de procesamiento.
- Asistentes locales de texto sin cloud: al ejecutarse totalmente offline, encaja en entornos con requisitos de privacidad o sin conectividad.
- Generación de texto en CI/CD o scripts: su tamaño permite incluirlo como dependencia ligera en pruebas automatizadas que necesiten salidas de texto.
- Evaluación comparativa de cuantizaciones: el repositorio incluye los ficheros `smol-Q4_K_M.gguf`, `smol-Q8_0.gguf`, `imatrix.dat`, `calib.txt`, `REPRO.json` y `SHA256.txt`, lo que facilita reproducir y comparar el efecto de la cuantización sobre la perplejidad.
- Chat de texto de baja latencia en portátiles: al ocupar menos de 0,3 GB, no compite por VRAM con otras tareas gráficas.

## Benchmarks y rendimiento

El autor solo publica evaluación de perplejidad sobre wikitext (128 líneas reservadas, 2048 de contexto). No se han ejecutado evaluaciones de tarea. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Modelo | Perplejidad (wikitext) | Variación vs F16 | Tamano |
|---|---|---|---|
| F16 | 13,5363 | — | 0,8 GB |
| Q8_0 | 13,5752 | +0,29 % | 0,4 GB |
| Q4_K_M | 13,7871 | +1,85 % | 0,3 GB |

El umbral de aceptación establecido por el autor era inferior al 5 % de degradación; la build Q4_K_M lo supera con margen. Las cifras corresponden únicamente al text tower.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en cualquier cuantización. Q4_K_M ~303 MB, Q8_0 ~0,4 GB, F16 ~0,8 GB, más overhead de contexto.
- GPU recomendadas: cualquier GPU consumer, incluida una RTX 3060 o inferior; también funciona en CPU pura.
- Cabe en cualquier GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: llama.cpp (`./llama-cli -m smol-Q4_K_M.gguf -p "..." -c 2048`) y Ollama mediante el `Modelfile` incluido.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vision | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Este GGUF (SmolVLM-500M Q4_K_M) | 409.252.800 (safetensors) / solo text tower en el GGUF | No (encoder excluido) | 2048 usados en evaluación; máximo no especificado | Apache-2.0 | GGUF |
| HuggingFaceTB/SmolVLM-500M-Instruct (base) | No disponible en la información (en torno a 500 M según el nombre) | Si (SigLIP + mmproj) | No disponible | Apache-2.0 | safetensors (formato del base) |
| Otras cuantizaciones GGUF de SmolVLM-500M | no disponible | Depende de si incluyen mmproj | no disponible | Apache-2.0 (habitual) | GGUF |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El archivo no procesa imágenes, pese a llamarse SmolVLM y estar etiquetado como image-text-to-text y vision. Pasar una imagen produce un rechazo de entrada.
- Validación exclusivamente por perplejidad: no hay evaluaciones de tarea, por lo que el comportamiento real en generación, resumen o código no está verificado.
- Calibración imatrix en inglés (wikitext-2): el rendimiento en otros idiomas o dominios puede degradarse y no se ha medido.
- Cuantización mixta forzada: por el desajuste de las capas de 960 dimensiones, parte de los tensores quedaron en q5_0/q8_0 en lugar de Q4_K puro (5,89 bits/peso efectivos).
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial del artefacto, pero conviene verificar las condiciones del modelo base y de cualquier componente derivado.
- La búsqueda web asociada no devolvió resultados relevantes sobre este repositorio (los enlaces recuperados tratan sobre ubicaciones de red en Windows 11 y no guardan relación con el modelo).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ShayonSarker/SmolVLM-500M-Instruct-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Paper, blog o repositorio adicional del autor: no disponible
- Demos: no disponible
- Resultados de búsqueda web relevantes: ninguno
