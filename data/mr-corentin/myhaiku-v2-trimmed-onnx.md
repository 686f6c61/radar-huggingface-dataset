# Mr-Corentin/myhaiku-v2-trimmed-onnx

## Resumen

myhaiku-v2-trimmed-onnx es la versión ONNX de un ajuste fino de Gemma 3 270M instruction-tuned especializado en escribir haikus en inglés. Lo publica el usuario Mr-Corentin (cuenta personal, sin organización detrás) y su propósito es muy concreto: ejecutar la generación de haikus íntegramente en una página web mediante Transformers.js, bien sobre WebGPU o sobre CPU a través de WebAssembly, sin ningún backend. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y ocupa 0,2 GB.

El modelo no es un Gemma 3 270M intacto: el vocabulario se ha recortado de 262.000 a 89.000 tokens conservando el inglés, todos los pesos se almacenan en 8 bits (incluida la matriz de embeddings, compartida entre la entrada y la cabeza de salida) y las entradas se limitan a 2.048 tokens. El resultado son 157 millones de parámetros y un único fichero `onnx/model_quantized.onnx` de 182 MB que Transformers.js carga por defecto.

Su relevancia es acotada pero clara: es un ejemplo práctico de cuantización weight-only int8 combinada con poda de vocabulario para llevar un transformer a cliente web, con cifras medidas de latencia (unos 0,3 s hasta el primer token en WebGPU y 22 tokens/s de velocidad de decodificación) y una validación explícita contra el modelo float32 original (71 de 100 haikus idénticos palabra por palabra). No compite en capacidades generales: es un generador de formato fijo para un dominio creativo muy estrecho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`gemma3_text`) de la familia Gemma 3, sin visión |
| Parámetros totales | 157 M en esta versión recortada (el Gemma 3 270M original tiene 270 M) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (truncado en esta versión ONNX; el modelo base no documenta su contexto en la información disponible) |
| Tipos de cuantización | pesos int8 (8 bits, weight-only) con activaciones en float32; se probaron variantes de 4 bits (redondeo simple y HQQ, 131-144 MB) y se descartaron |
| Idiomas soportados | inglés (`en`) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 182 MB); consumible con Transformers.js 4.x |
| Vocabulario | 89.000 tokens (recortado desde 262.000) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline | `text-generation` |
| Modelo base | `Mr-Corentin/myhaiku-v2-trimmed-gemma-3-270m-it` |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 en su variante de texto (`gemma3_text`): un transformer decoder-only denso. Sobre el checkpoint instruction-tuned de 270 M se hizo un ajuste fino para generación de haikus en inglés, y después se aplicaron tres transformaciones orientadas al despliegue en navegador: recorte del vocabulario a 89.000 tokens manteniendo solo inglés (lo que reduce la matriz de embeddings compartida entre lookup de entrada y cabeza de salida), cuantización de todos los pesos a 8 bits y truncado de las tablas de posiciones a 2.048 tokens, lo que ahorra 63 MB. El cómputo se mantiene en float32 porque, según el autor, las activaciones de Gemma 3 desbordan en float16.

No se detalla en la model card el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF o DPO; solo se menciona que los datos incluyen traducciones de haikus cuyos traductores no coinciden en el uso de mayúscula inicial. La innovación técnica destacable no está en la arquitectura sino en el pipeline de compresión y validación: se probaron alternativas de 4 bits (redondeo simple roto en aproximadamente 1 de cada 8 haikus; HQQ corregía el formato pero resultaba diez veces más lento en WebGPU con ONNX Runtime Web 1.31) y se optó por 8 bits. Como control de calidad, sobre 100 prompts reservados con decodificación greedy, 71 haikus son idénticos palabra por palabra a los del modelo float32, el 100 % mantiene el formato de tres líneas y la diversidad de vocabulario no cambia.

## Capacidades

- Generación de texto creativo en inglés con formato restringido a exactamente tres líneas cortas (haiku).
- Sigue una instrucción de sistema concreta; el autor recomienda mantener el mismo system prompt usado en entrenamiento.
- Generación condicionada por tema: acepta peticiones del tipo «a haiku about the first snow».
- Muestreo configurable: el ejemplo oficial usa `do_sample: true`, `temperature: 1.0`, `top_p: 0.95`, `top_k: 64` y `max_new_tokens: 48`.
- Inferencia en cliente: soporte de WebGPU y de WebAssembly (CPU) vía Transformers.js 4.x.
- No dispone de tool calling ni function calling.
- No dispone de modo agente, razonamiento multi-paso ni planificación.
- No dispone de visión, audio ni otras modalidades; es un modelo solo de texto.
- Capacidad multilingüe muy limitada: el vocabulario se recortó a inglés y las peticiones deben escribirse en inglés.

## Casos de uso

- Demo web de generación de haikus sin backend: cargar el pipeline con `device: "webgpu"` y generar en el navegador del visitante; el fichero de 182 MB se cachea y no requiere infraestructura de servidor ni coste por token.
- Aplicación web progresiva (PWA) con funcionamiento offline: usando `device: "wasm"` el modelo corre sobre CPU en WebAssembly a unos 4,4 tokens/s, suficiente para producir un haiku de ~20 tokens en torno a 4-5 segundos sin conexión.
- Juguete educativo o taller de poesía: pide al alumno un tema y devuelve tres líneas; el formato fijo simplifica la interfaz y el modelo cabe en cualquier portátil.
- Generación de texto de relleno para arte generativo o diseño: producir cientos de variantes cortas para prototipos visuales, con la ventaja de que el cómputo es local y no expone prompts a terceros.
- Escenario con requisitos de privacidad: al ejecutarse íntegramente en el cliente, ningún texto del usuario sale del dispositivo, lo que encaja en entornos con datos sensibles donde no se quiere llamar a una API.
- Banco de pruebas de cuantización: sirve como caso de referencia para comparar salidas float32 frente a int8 en un dominio con formato verificable (tres líneas) y medir tasas de coincidencia exacta.
- Prototipado de pipelines Transformers.js: valida la integración de ONNX Runtime Web, la selección de build (`ort-wasm-simd-threaded` frente a la build asyncify) y el rendimiento antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas internas de fidelidad a la cuantización y de latencia:

| Métrica | Resultado |
|---|---|
| Coincidencia exacta con el modelo float32 (100 prompts reservados, greedy) | 71/100 haikus idénticos palabra por palabra |
| Cumplimiento del formato de tres líneas | 100 % de las salidas |
| Diversidad de vocabulario | sin cambios respecto al modelo float32 |
| Tiempo hasta el primer token, WebGPU | ~0,3 s |
| Tiempo hasta el primer token, WebAssembly | ~0,5 s |
| Velocidad de decodificación, WebGPU | ~22 tokens/s |
| Velocidad de decodificación, WebAssembly | ~4,4 tokens/s |
| Tamaño del fichero de pesos | 182 MB (int8) frente a 131-144 MB en las variantes de 4 bits descartadas |

Mediciones realizadas por el autor con Transformers.js 4.3.1 y ONNX Runtime Web 1.31. Un haiku típico ronda los 20 tokens, de modo que la generación completa se sitúa en torno a 1 segundo en WebGPU y 4-5 segundos en WebAssembly (estimación a partir de las cifras anteriores).

## Requisitos de hardware

- Huella de memoria: los pesos cuantizados ocupan 182 MB; el repositorio completo son 0,2 GB. No se publica una cifra de VRAM/RAM pico, pero el modelo cabe holgadamente en cualquier dispositivo con un navegador moderno.
- GPU: funciona en GPU integradas y dedicadas siempre que el navegador exponga WebGPU; no se especifican modelos concretos (A100, H100, RTX 4090) porque el destino es el cliente web, no servidores.
- CPU: la ruta WebAssembly permite ejecución sin GPU a ~4,4 tokens/s.
- Cabe en GPU de consumo: sí, con margen amplio; el cuello de botella no es la memoria sino el soporte de WebGPU y los kernels disponibles en ONNX Runtime Web.
- Despliegue: Transformers.js 4.x con ONNX Runtime Web (backends `webgpu` y `wasm`). Importante: la build «asyncify» que carga Transformers.js 4.x por defecto no tiene kernel de CPU para `GatherBlockQuantized`, por lo que hay que apuntar `env.backends.onnx.wasm.wasmPaths` a la build `ort-wasm-simd-threaded` antes de crear el pipeline.
- No se proporcionan instrucciones ni artefactos para vLLM, llama.cpp, Ollama o TGI; el repositorio solo publica pesos ONNX orientados a navegador.
- Latencia y throughput: ver tabla de la sección anterior (~0,3 s al primer token y ~22 tokens/s en WebGPU; ~0,5 s y ~4,4 tokens/s en WebAssembly).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| myhaiku-v2-trimmed-onnx (este modelo) | 157 M | 2.048 tokens | ONNX int8 weight-only, 182 MB | inglés | Gemma | Optimizado para WebGPU/WASM en navegador; sin benchmarks estándar |
| myhaiku-v2-trimmed-gemma-3-270m-it | 157 M (versión recortada; el autor no detalla el conteo exacto) | no disponible | safetensors (modelo de origen) | inglés | Gemma | Punto de partida del ajuste fino; sin métricas publicadas en la información disponible |
| Gemma 3 270M instruction-tuned (modelo base de la familia) | 270 M | no disponible en la información proporcionada | safetensors, múltiples precisiones | multilingüe (no detallado) | Gemma | Modelo generalista; este derivado recorta vocabulario y lo especializa en haiku, perdiendo cobertura multilingüe |

No se dispone de datos sobre otros generadores de poesía de tamaño comparable en la información proporcionada, por lo que la comparación se limita a la estirpe Gemma 3 del propio autor.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: solo genera haikus en inglés de tres líneas; no es utilizable como modelo de propósito general.
- Calidad semántica limitada: con 157 M de parámetros, según el propio autor acierta la forma y las imágenes mucho más que el significado.
- Inconsistencia de formato menor: alrededor de una cuarta parte de las salidas empiezan con mayúscula, porque los traductores del corpus de entrenamiento no coinciden en ese criterio.
- Idioma: las peticiones deben escribirse en inglés; el vocabulario recortado a 89.000 tokens degrada cualquier otro idioma.
- Contexto corto: 2.048 tokens, suficiente para una petición de haiku pero insuficiente para documentos o conversaciones largas.
- Riesgo de alucinación: al ser un modelo generativo pequeño sin anclaje factual, puede producir imágenes incoherentes o palabras inventadas, especialmente con temperaturas altas.
- Dependencia del system prompt de entrenamiento: el autor advierte de que debe mantenerse el mismo mensaje de sistema; cambiarlo puede romper el formato de tres líneas.
- Fragilidad de la cuantización: se descartaron las variantes de 4 bits porque el redondeo simple rompía el formato en ~1 de cada 8 haikus y HQQ resultaba diez veces más lento en WebGPU con ONNX Runtime Web 1.31. Cambios de versión de ONNX Runtime o del navegador pueden alterar el rendimiento reportado.
- Licencia Gemma: no es una licencia de código abierto OSI; incluye términos de uso, obligaciones de atribución y restricciones de uso aceptable que deben revisarse antes de un despliegue comercial.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval ni similares, y las cifras de latencia provienen de una única máquina de prueba del autor.
- Madurez: 0 descargas y 0 likes, cuenta personal sin organización, creado y actualizado el mismo día (23-10-2026); no hay evidencia de uso en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mr-Corentin/myhaiku-v2-trimmed-onnx
- Modelo base (safetensors): https://huggingface.co/Mr-Corentin/myhaiku-v2-trimmed-gemma-3-270m-it
- CDN de ONNX Runtime Web referenciado en la model card: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.31/dist/
- Resultados de la búsqueda web: no se incluye ninguno porque las entradas devueltas tratan sobre la abreviatura francesa «Mr» y no guardan relación con el modelo.
