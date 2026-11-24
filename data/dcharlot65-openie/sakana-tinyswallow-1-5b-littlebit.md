# dcharlot65-openie/Sakana-TinySwallow-1.5B-LittleBit

## Resumen

Sakana-TinySwallow-1.5B-LittleBit es un checkpoint de pesos "living-weights" publicado por el usuario dcharlot65-openie, derivado del modelo instructivo SakanaAI/TinySwallow-1.5B-Instruct mediante una factorización propietaria denominada LittleBit-2 combinada con Sakana SVF. No es un modelo nuevo entrenado desde cero, sino una representación comprimida del modelo base de Sakana AI (1.543.714.304 parámetros) pensada para ejecutarse en el runtime JouleDB, una base de datos termodinámica con inferencia sin PyTorch y despliegue nativo en Kubernetes (JouleKube).

El artefacto se distribuye en formato `.jsyn` (comprimido con zstd y CRC32) y ocupa 11,44 MB frente a los 2.944,40 MB que ocuparía el mismo modelo en FP16, lo que supone una reducción de 257,37x y una media de 0,0291 bits por peso (sub-1-bit). La model card describe 197 tensores 2D en bitplanes y 141 vectores 1D (LayerNorm, bias y depthwise).

Su relevancia es experimental: explora la compresión extrema por debajo de 1 bit por peso y un stack de inferencia alternativo a PyTorch. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño declarado es de 0,0 GB y no se han publicado benchmarks ni detalles sobre el proceso de entrenamiento o la calidad resultante de la factorización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Factorización LittleBit-2 sobre Sakana SVF del transformer TinySwallow-1.5B-Instruct (arquitectura del modelo base: no detallada en la informacion disponible) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit propietaria (LittleBit-2, 0,0291 BPW); no se documentan cuantizaciones estándar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (zstd + CRC32), exclusivo del runtime JouleDB; no hay safetensors ni GGUF publicados |

## Arquitectura y entrenamiento

El checkpoint parte de SakanaAI/TinySwallow-1.5B-Instruct, un modelo instructivo de 1,5B parámetros de Sakana AI, y aplica una factorización propietaria en dos etapas: LittleBit-2 (representación en bitplanes 2D) y Sakana SVF. Según la model card, el resultado son 197 tensores 2D en bitplanes y 141 tensores 1D para LayerNorm, bias y convoluciones depthwise, con un tamaño comprimido de 11,44 MB y 0,0291 bits por peso.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni el procedimiento exacto de la factorización. Tampoco se especifica la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) ni si el proceso de compresión incluye calibración o ajuste fino posterior. La model card se limita a describir el perfil de compresión y el stack de despliegue (JouleDB, JouleKube, inferencia sin PyTorch).

## Capacidades

- Generación de texto e instrucciones: hereda las capacidades del modelo base TinySwallow-1.5B-Instruct, aunque no se documenta en la información disponible una evaluación de la calidad tras la factorización.
- Razonamiento y código: presumiblemente las del modelo base, sin datos verificables en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el modelo base TinySwallow está orientado a inglés y japonés, pero la model card no lo confirma para este checkpoint).
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Despliegue en Kubernetes: soporte nativo vía JouleKube según la model card.
- Inferencia sin PyTorch: runtime JouleDB v0.2.4 o superior.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones de almacenamiento: el checkpoint de 11,44 MB permite distribuir el modelo en imágenes de contenedor o volúmenes persistentes sin apenas coste de almacenamiento, integrándolo en el sustrato JouleKube.
- Experimentación con compresión sub-1-bit: sirve como referencia para investigar la viabilidad de pesos por debajo de 1 bit por parámetro y medir la degradación de calidad frente al modelo base en FP16.
- Prototipado de inferencia sin PyTorch: útil para validar pipelines en entornos donde no se puede instalar el stack de PyTorch (por ejemplo, imágenes mínimas o restricciones de dependencias).
- Pruebas de integración de JouleDB: permite verificar el flujo `hf_pull` y el servidor HTTP del runtime con un modelo pequeño antes de escalar a otros checkpoints.
- Docencia y demostraciones de formatos de pesos alternativos: ilustra una representación `.jsyn` con bitplanes y vectores 1D separados, útil para explicar técnicas de factorización.
- Evaluación comparativa de runtimes: al ser un derivado de un modelo conocido, permite contrastar latencia y throughput entre JouleDB y stacks convencionales (vLLM, llama.cpp) sobre el mismo modelo base.
- No se recomienda para producción en tareas de calidad crítica sin una evaluación previa de la degradación introducida por la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El artefacto en disco ocupa 11,44 MB, pero el runtime debe reconstruir o interpretar los pesos factorizados y no se documenta el consumo de memoria en ejecución.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Sakana-TinySwallow-1.5B-LittleBit | 1.543.714.304 | no disponible | `.jsyn` (sub-1-bit, 0,0291 BPW) | Apache 2.0 | Solo JouleDB |
| SakanaAI/TinySwallow-1.5B-Instruct (modelo base) | 1,5B | no disponible en esta ficha | safetensors (formato estándar de HF) | Apache 2.0 | Transformers, vLLM, llama.cpp, etc. |
| Modelos instructivos de ~1,5B (p. ej. Qwen2.5-1.5B-Instruct) | 1,5B | 32.768 tokens (según su model card) | safetensors, GGUF | Apache 2.0 | Amplio soporte |

La comparación con alternativas de la misma categoría es limitada: no hay datos de rendimiento publicados para este checkpoint y su formato lo ata al runtime JouleDB. El modelo base TinySwallow-1.5B-Instruct es la referencia natural para medir la pérdida de calidad introducida por la factorización.

## Limitaciones y advertencias

- Sin benchmarks ni evaluación de calidad publicada: se desconoce la degradación real frente al modelo base tras aplicar LittleBit-2 y SVF.
- Formato propietario `.jsyn` no compatible con el ecosistema estándar (Transformers, vLLM, llama.cpp, Ollama, TGI); requiere JouleDB.
- Repositorio con 0 descargas y 0 likes, tamaño declarado de 0,0 GB y creado el 2026-11-24: madurez y mantenimiento no verificables.
- No se documentan idiomas soportados, longitud de contexto ni capacidades de tool calling o agentes para este checkpoint.
- Riesgo de alucinación: inherente a los modelos de 1,5B; no cuantificado para esta variante.
- Sesgos: no documentados; se heredarían los del modelo base, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de calidad hace desaconsejable su uso en producción sin validación previa.
- Dependencia de un runtime concreto (JouleDB v0.2.4+) y de su hoja de ruta; si el proyecto cesa, el checkpoint queda inutilizable.
- La model card no detalla el proceso de factorización ni si los pesos son reconstruibles de forma exacta o aproximada.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Sakana-TinySwallow-1.5B-LittleBit
- Modelo base: https://huggingface.co/SakanaAI/TinySwallow-1.5B-Instruct
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
