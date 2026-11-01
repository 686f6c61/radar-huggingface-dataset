# Sido/hina-gemma4-e2b-aggressive-iq3m-browser

## Resumen

`Sido/hina-gemma4-e2b-aggressive-iq3m-browser` es una distribución en formato GGUF cuantizado (IQ3_M) del modelo de texto `HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive`, a su vez un ajuste fino del Gemma 4 E2B de Google. El autor, Sido, no entrena ni modifica los pesos: parte del fichero GGUF original de 3.134.964.672 bytes (SHA-256 `0796d58372742ef8ddc76dd64cd2fde217b7ef32e3dc58e10873253e569cad6b`) y lo divide en fragmentos de menos de 2 GB para que pueda cargarse en runtimes de navegador con soporte de GGUF fragmentado.

El interés de esta publicación es operativo, no algorítmico. El split se realizó con `llama-gguf-split --split-max-size 2000M --no-tensor-first-split`, de modo que ningún tensor fue recuantizado ni alterado: es el mismo modelo IQ3_M, solo troceado. Esto permite ejecutar un modelo de 4.647.450.147 parámetros totales en entornos web (WebGPU/WASM) donde los límites de tamaño por fichero y la carga progresiva de shards son un cuello de botella real.

La relevancia es doble: por un lado, demuestra un patrón de empaquetado reproducible para llevar modelos de ~3 GB a navegador; por otro, hereda las características del fine-tune "aggressive" sin censura de HauhauCS, lo que condiciona su uso en producción. El repositorio no incluye el proyector multimodal, por lo que es estrictamente texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B); detalles internos no disponibles |
| Parámetros totales | 4.647.450.147 |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ3_M (GGUF); el repo solo distribuye esa variante |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF fragmentado en shards < 2 GB (`--split-max-size 2000M`) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Gemma 4, en su variante E2B, con 4.647.450.147 parámetros totales según los safetensors del modelo base. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto nativa en la información proporcionada. El fine-tune de HauhauCS se presenta como "uncensored" y "aggressive", lo que en la práctica indica un ajuste orientado a reducir los rechazos del modelo alineado original; no se documentan aquí los datos, el método (SFT, DPO, RLHF) ni el volumen de tokens empleados.

La innovación técnica de esta publicación concreta es el particionado del GGUF. Se usó `llama-gguf-split` con `--no-tensor-first-split`, lo que evita cortar tensores entre shards y garantiza que cada fragmento sea cargable de forma independiente por runtimes con soporte de splits (que localizan los shards restantes por nombre de fichero). La cuantización IQ3_M, de tipo importance-matrix, ya venía aplicada en el fichero origen; aquí no se recuantiza nada. El resultado es un artefacto de 3,1 GB de repositorio, apto para descarga progresiva.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repo y la pipeline declarada apuntan a uso de chat multi-turno.
- Ejecución en navegador: los shards están pensados para runtimes web con GGUF split-aware (WebGPU/WASM).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura compatible con la API de Hugging Face.
- Cuantización IQ3_M: reduce el peso a ~3 GB manteniendo el grafo original, lo que facilita su despliegue en equipos sin GPU dedicada.
- Modelo "uncensored": el fine-tune de origen está orientado a reducir rechazos, lo que amplía el espacio de respuestas pero elimina buena parte de las salvaguardas del Gemma base.
- Sin multimodalidad: el repo no incluye el proyector multimodal, por lo que la entrada es solo texto.
- Tool calling, agentes, matemáticas, código y capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Demos de inferencia en navegador: cargar los shards de forma progresiva en una página con WebGPU o WASM para ofrecer un chat local sin backend, aprovechando que cada fichero pesa menos de 2 GB y el runtime resuelve los shards por nombre.
- Prototipado offline en portátiles sin GPU: al ser un GGUF IQ3_M de ~3 GB, puede ejecutarse en CPU con llama.cpp u Ollama para pruebas de prompting y evaluación cualitativa antes de invertir en infraestructura.
- Evaluación de fine-tunes sin censura: útil para investigadores que comparan el comportamiento del Gemma base frente a la variante "aggressive" de HauhauCS en tareas de generación libre, midiendo tasas de rechazo y deriva de estilo.
- Pruebas de robustez y red teaming: el carácter "uncensored" lo convierte en un sujeto adecuado para estudiar cómo un fine-tune agresivo altera la seguridad del modelo original, siempre en entornos controlados.
- Integración en aplicaciones de escritorio con runtime embebido: distribuir los shards junto a una app Electron o Tauri que use llama.cpp para asistencia de texto local sin conexión.
- Validación de pipelines de empaquetado GGUF: servir como caso de referencia para verificar que un split con `--no-tensor-first-split` se carga correctamente en distintos runtimes antes de aplicarlo a modelos mayores.
- Experimentación con endpoints compatibles: desplegar el GGUF en servidores que acepten el formato para comparar latencia y calidad frente a la versión sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,1 GB solo para los pesos en IQ3_M; con caché KV y overhead de runtime, prever 4-6 GB según longitud de contexto (el contexto no está documentado).
- GPU recomendadas: no disponible. Para ejecución en navegador se requiere WebGPU; para servidor, cualquier GPU con ≥6 GB de VRAM es suficiente en teoría, pero no hay datos de rendimiento publicados.
- GPU de consumo: cabe en tarjetas con 6-8 GB (RTX 3060, RTX 4060, etc.) en IQ3_M; también es viable en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (soporta splits GGUF), Ollama, runtimes web con GGUF split-aware; vLLM y TGI no están confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sido/hina-gemma4-e2b-aggressive-iq3m-browser | 4.647.450.147 | no disponible | IQ3_M GGUF fragmentado | gemma | Hugging Face |
| HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | GGUF (origen) | gemma | Hugging Face |
| Gemma 4 E2B (base de Google) | no disponible | no disponible | safetensors/GGUF | gemma | Hugging Face |

La comparativa se limita a la cadena de derivación porque no se dispone de datos de benchmarks ni de especificaciones de contexto para contrastar con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo es un fine-tune "uncensored" y "aggressive": cabe esperar una reducción significativa de rechazos y un mayor riesgo de contenido inapropiado, sesgado o dañino. No es apto para producción orientada al usuario final sin filtros adicionales.
- Riesgo de alucinación: no hay datos de evaluación; al ser un modelo pequeño cuantizado a 3 bits, la pérdida de precisión puede agravar errores factuales.
- La cuantización IQ3_M es agresiva (3 bits); la calidad puede degradarse frente al modelo en FP16/BF16, especialmente en razonamiento y matemáticas.
- No incluye el proyector multimodal: cualquier expectativa de visión o audio queda fuera de alcance.
- Licencia `gemma`: sujeta a los términos de Google para la familia Gemma; revisar el model card upstream antes de uso comercial. El mirror no añade permisos adicionales.
- Idiomas y longitud de contexto no documentados: no se puede garantizar comportamiento multilingüe ni aprovechar ventanas largas sin verificación empírica.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; el artefacto no ha sido probado de forma pública.
- Los shards deben descargarse empezando por `00001`; runtimes que no sean split-aware fallarán al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sido/hina-gemma4-e2b-aggressive-iq3m-browser
- Modelo base (fine-tune): https://huggingface.co/HauhauCS/Gemma-4-E2B-Uncensored-HauhauCS-Aggressive
- Revisión referenciada del modelo base: `da8593c3e407afcd3e7da94ff2d69d77e2a28a48`
- No se han encontrado en la búsqueda web enlaces adicionales relevantes (los resultados corresponden a entidades homónimas sin relación con el modelo).
