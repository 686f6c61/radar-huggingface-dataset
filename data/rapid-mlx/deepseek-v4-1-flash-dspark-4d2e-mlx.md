# rapid-mlx/DeepSeek-V4.1-Flash-DSpark-4d2e-MLX

## Resumen

DeepSeek-V4.1-Flash-DSpark-4d2e-MLX es un sidecar experimental de decodificación especulativa (speculative decoding) publicado por rapid-mlx para su variante cuantizada a 2 bits del modelo DeepSeek V4.1 Flash. No es un modelo autónomo: el repositorio contiene únicamente la cabeza DSpark de 4,62 GB (7.430.590.050 parámetros en safetensors) y no puede generar texto por sí mismo, ya que no incluye el modelo objetivo de aproximadamente 213 GB.

El artefacto implementa una ruta DSpark de tres etapas (stage-0, stage-1 y stage-2) con predicción multi-token y verificación autoritativa por parte del modelo objetivo. Su función es acelerar la decodificación del checkpoint `rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX` sobre Apple Silicon: en una máquina M3 Ultra con 256 GiB de memoria unificada, el autor mide 19,39 tok/s frente a 9,58 tok/s del objetivo en modo autorregresivo, un factor de 2,02x con ventana de verificación K=4.

La relevancia del artefacto es doble: por un lado, explora decodificación especulativa en el ecosistema MLX, donde la oferta de heads draft es todavía escasa; por otro, documenta con detalle el equilibrio entre precisión y consumo de memoria, con una mezcla 4d2e (4 bits en rutas densas, 2 bits en expertos enrutados) que solo es un 3,5% mayor que una cabeza íntegramente a 2 bits. El autor lo marca explícitamente como experimental mientras completa la cualificación comparativa de calidad de tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de decodificación especulativa DSpark de tres etapas (predicción multi-token) sobre un modelo objetivo DeepSeek V4.1 Flash; incluye rutas de atención, shared-expert, proyección principal, Markov y confianza |
| Parametros totales | 7.430.590.050 (datos reales de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla `4d2e`: affine 4-bit con group size 64 (atención, shared-expert, proyección principal, rutas Markov y de confianza) y affine 2-bit con group size 64 (expertos enrutados dominantes en ancho de banda) |
| Idiomas soportados | no disponible (las pruebas del autor cubren código, razonamiento aritmético, salida JSON y chino) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); 4.617.792.648 bytes de carga útil |
| Libreria | mlx |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash y rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX |
| Revision de pesos | deepseek-ai/DeepSeek-V4.1-Flash @ `dba1be0a40aa45a94ad051997016db3960a90277`; fuente 2-bit @ `802f1a00982705d81b79ad1c83aa0ccc0b863ebc` |
| Tamano del repositorio | 4,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sidecar no es un modelo entrenado de forma independiente, sino una conversión y cuantización de las rutas densas DSpark publicadas por DeepSeek en su release oficial de V4.1 Flash, combinadas con valores de expertos enrutados procedentes de una fuente ya pinneada a 2 bits. La estructura se reparte en tres ficheros de safetensors (`dspark-mixed-stage-0`, `stage-1` y `stage-2`), donde el diseñador aplica una política de precisión dual: las rutas sensibles (atención, shared-expert, proyección principal, Markov y confianza) se mantienen en affine 4-bit con group size 64, mientras que los expertos enrutados, dominantes en consumo de ancho de banda, se degradan a affine 2-bit con el mismo group size. El embedding compartido y la LM head los aporta el modelo objetivo en tiempo de ejecución.

El mecanismo de inferencia es decodificación especulativa con verificación autoritativa: los tokens borrador solo se emiten tras la verificación del objetivo, y las correcciones provienen de los logits del objetivo. La ventana de verificación recomendada y cualificada es K=4; K=5 acepta más tokens borrador pero resulta más lento de extremo a extremo. No se documentan datos de entrenamiento, composición del dataset, número de tokens ni procesos de RLHF o DPO, por lo que esos apartados quedan como no disponibles. La integridad del artefacto está cubierta por un manifiesto con revisiones inmutables y hashes SHA-256 por shard.

## Capacidades

- No genera texto de forma autónoma: es exclusivamente una cabeza borrador que acelera la decodificación del modelo objetivo `rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX`.
- Aceleración de inferencia mediante predicción multi-token con ventana fija K=4, con verificación autoritativa por parte del objetivo.
- Mezcla de precisión selectiva que mantiene rutas críticas en 4 bits y expertos enrutados en 2 bits dentro de un presupuesto de 256 GiB de memoria unificada.
- Integridad verificable: validación de tamaño y SHA-256 de cada fichero antes de la carga.
- Capacidades funcionales del stack completo (objetivo más sidecar) probadas por el autor en cuatro dominios: código, razonamiento aritmético, salida estructurada JSON-only y chino, con hasta 128 tokens de salida.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible específicamente para este sidecar.
- Capacidades de visión o audio: no disponibles.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Aceleración de generación de código en local sobre Apple Silicon: el stack objetivo más sidecar permite pasar de 9,58 tok/s a 19,39 tok/s en tareas de código, un factor 2,02x que reduce de forma directa el tiempo de espera en asistentes de programación ejecutados íntegramente en una estación de trabajo Mac con 256 GiB.
- Salida estructurada JSON-only: el autor incluye este dominio entre los cuatro evaluados, lo que lo hace adecuado para pipelines que necesitan respuestas con formato estricto para consumo posterior por otros servicios.
- Razonamiento aritmético asistido: el sidecar acelera la decodificación en cadenas de cálculo paso a paso, uno de los dominios medidos, útil en herramientas internas de verificación numérica.
- Procesamiento de texto en chino: el cuarto dominio evaluado es el chino, de modo que el stack puede emplearse en tareas de resumen o generación en ese idioma dentro del mismo entorno MLX.
- Investigación en decodificación especulativa: sirve como banco de pruebas reproducible para comparar ventanas K (K=4 frente a K=5), medir longitud media aceptada por bloque (1,85 tokens extra) y estudiar el equilibrio precisión/memoria en cabezas draft.
- Despliegue en estaciones de trabajo Mac de gran memoria: al requerir 256 GiB de memoria unificada y un runtime MLX propietario, encaja en escenarios de laboratorio o desarrollo interno donde no se dispone de GPU NVIDIA.
- Cualificación de artefactos cuantizados: la política 4d2e y el manifiesto con hashes permiten auditar cómo afecta la mezcla de precisión al rendimiento y a la estabilidad de salida en un objetivo de 2 bits.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). La model card solo aporta mediciones de throughput en un entorno concreto: Apple M3 Ultra con 256 GiB de memoria unificada, objetivo REAP12.5 native affine 2-bit de aproximadamente 212,93 GB, verificación DSpark empaquetada con K=4, cuatro dominios de prompt (código, razonamiento aritmético, JSON-only y chino), hasta 128 tokens de salida y dos repeticiones consecutivas por prompt.

| Ruta | Throughput de decodificación ponderado | Relativo a autorregresivo |
|---|---:|---:|
| Objetivo autorregresivo | 9,58 tok/s | 1,00x |
| DSpark mixto, K=4 | 19,39 tok/s | 2,02x |
| DSpark mixto, K=5 | 18,49 tok/s | 1,93x |

Datos adicionales medidos: el rango por dominio con K=4 va de 11,87 a 25,93 tok/s; la longitud media de borrador aceptada es de 1,85 tokens extra por bloque de verificación; el pico de memoria MLX alcanzó 218,232 GB. El autor advierte que el resultado de K=4 no es una garantía para cualquier prompt, longitud de contexto, estado térmico o máquina.

## Requisitos de hardware

- Memoria: mínimo 256 GiB de memoria unificada (clase de máquina soportada más baja según el autor). Pico de memoria MLX medido de 218,232 GB.
- Hardware medido: Apple M3 Ultra con 256 GiB de memoria unificada. No hay datos para otras plataformas.
- GPU: no aplica en el sentido habitual; el artefacto depende del framework MLX de Apple, por lo que no se ejecuta sobre CUDA (A100, H100, RTX 4090) con este runtime.
- GPU de consumo: no cabe en tarjetas de consumo; el requisito de memoria unificada de 256 GiB lo excluye de cualquier GPU consumer y también de la mayoría de configuraciones profesionales.
- Almacenamiento: 4,6 GB para el sidecar, más aproximadamente 213 GB para el modelo objetivo (`REAP-2bit-MLX`), lo que suma en torno a 217 GB de disco.
- Opciones de despliegue: exclusivamente el runtime MLX y la implementación DSpark propia de Rapid-MLX, que descarga y verifica el sidecar por separado cuando se habilita la ruta experimental. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 19,39 tok/s ponderados con K=4 en el entorno medido, frente a 9,58 tok/s del objetivo autorregresivo; el rango por dominio con K=4 es de 11,87 a 25,93 tok/s.

## Comparativa con modelos similares

La información disponible no permite comparar con cabezas especulativas de terceros ni con otros modelos del mismo tamaño, porque el artefacto es un sidecar dependiente de un objetivo concreto. La comparación factible es interna, entre variantes del propio stack:

| Variante | Naturaleza | Tamano | Throughput medido | Estado |
|---|---|---:|---:|---|
| Objetivo autorregresivo (REAP 2-bit) | Modelo completo | ~212,93 GB | 9,58 tok/s | Referencia |
| DSpark 4d2e, K=4 | Sidecar objeto de esta ficha | 4,62 GB (4.617.792.648 bytes) | 19,39 tok/s | Cualificado por el autor |
| DSpark 4d2e, K=5 | Misma cabeza, ventana mayor | 4,62 GB | 18,49 tok/s | Descartado por ser más lento |
| Cabeza DSpark íntegramente 2-bit | Variante de precisión | 3,5% menor | no disponible | Referencia de tamaño |
| Cabeza uniforme 4-bit | Variante de precisión | no disponible | no disponible | No viable dentro del límite de 256 GiB |

Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo `rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX` (aproximadamente 213 GB) y el runtime DSpark de Rapid-MLX, los ficheros no producen texto.
- Estado experimental: el propio autor lo etiqueta como experimental mientras se completa una cualificación comparativa más amplia de calidad de tarea.
- Calidad de instrucciones: el objetivo de 2 bits mostró seguimiento de instrucciones débil o repetitivo en varias pruebas en inglés, según la model card.
- Determinismo: la salida especulativa por lotes fijos no se garantiza bit a bit idéntica a una ejecución autorregresiva secuencial; las decisiones de bajo margen pueden diferir según la forma del lote de verificación.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni equivalentes, por lo que no puede evaluarse la calidad frente a alternativas con datos objetivos.
- Idiomas: no se declara una lista de idiomas soportados; las pruebas cubren código, aritmética, JSON y chino, más algunas sondas en inglés con resultados irregulares.
- Sesgos y alucinación: no se documentan sesgos específicos ni tasas de alucinación para este artefacto; el riesgo heredado depende del modelo objetivo de DeepSeek, no caracterizado aquí.
- Hardware: requiere 256 GiB de memoria unificada y un pico medido de 218,232 GB, lo que restringe el uso a equipos Apple de gama muy alta y excluye GPU CUDA.
- Licencia: MIT, sin restricciones documentadas para uso comercial, si bien el uso efectivo depende también de las condiciones del modelo objetivo y de los repositorios base.
- Reproducibilidad: el rendimiento depende de la revisión fijada del objetivo (`a25fec277b9e7cedc0e9f3f15da874a5cf9d491b`); cambiar de revisión invalida las mediciones publicadas.
- Madurez del repositorio: 0 descargas y 0 likes, publicado y actualizado el 11 de septiembre de 2026 en un intervalo de menos de un minuto, sin señales de adopción externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-DSpark-4d2e-MLX
- Modelo objetivo: https://huggingface.co/rapid-mlx/DeepSeek-V4.1-Flash-REAP-2bit-MLX
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de salud pública sin relación con el artefacto.
