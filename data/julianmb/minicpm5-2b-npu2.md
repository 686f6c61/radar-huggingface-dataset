# julianmb/MiniCPM5-2B-NPU2

## Resumen

MiniCPM5-2B-NPU2 es una adaptacion cuantizada del modelo openbmb/MiniCPM5-2B creada por el desarrollador julianmb para su ejecucion nativa en el NPU AMD XDNA 2 mediante el runtime FastFlowLM. El repositorio incluye los pesos en formato AMD Q4NX, los kernels de firmware AIE-ML y la configuracion de runtime necesaria para ejecutar el modelo en dispositivos con arquitectura Strix Halo, Strix Point, Krackan Point, Gorgon Point y Gorgon Halo.

La relevancia del modelo radica en que permite ejecutar un modelo de lenguaje de 2.000 millones de parametros de forma eficiente en procesadores AMD Ryzen AI de ultima generacion, con un consumo de potencia extremadamente bajo (2-4 vatios activos) y sin ocupar la iGPU, que queda completamente libre para otras cargas de trabajo. El modelo base es un transformer de 42 capas con d_model=2048, d_ffn=6144 y d_head=128, pero la version NPU2 introduce una modificacion tecnica clave en la atencion GQA para superar restricciones del firmware AIE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention |
| Parametros totales | No disponible explicitamente; el nombre del modelo indica ~2B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | AMD Q4NX (Q4_1 block-quantized) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | model.q4nx (formato propietario AMD Q4NX, compatible con FastFlowLM) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer decoder-only con 42 capas, dimension del modelo de 2048, dimension de FFN de 6144 y dimension de cabeza de 128. Emplea Grouped Query Attention con 16 cabezas de consulta y 2 cabezas de clave/valor, lo que supone una relacion GQA de 8:1.

La adaptacion para NPU XDNA 2 requerio resolver dos incompatibilidades. Primero, el firmware AIE de FastFlowLM solo soporta relaciones GQA de 2:1, 3:1 o 4:1 con d_head=128, por lo que la solucion consistio en replicar matematicamente las cabezas KV de 2 a 8 mediante una duplicacion 4x a lo largo del eje 0. Como las cabezas replicadas contienen valores de peso identicos, los logits de atencion, las distribuciones softmax y las representaciones de salida son bit a bit identicos matematicamente. Esto transforma la relacion efectiva a 16:8, es decir 2:1, lo que coincide exactamente con el kernel nativo _gen_mha_seq_d128_q2. Segundo, el runtime Qwen3 de FastFlowLM requiere tensores de normalizacion QK-norm, que MiniCPM5-2B no posee; para habilitar el enrutamiento por el motor Qwen3 se inyectaron tensores unitarios sinteticos (gamma=1.0) en las 42 capas del modelo. Los datos de entrenamiento originales, el proceso de fine-tuning y la metodologia de cuantizacion del autor no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Ejecucion nativa en NPU AMD XDNA 2 con aceleracion AIE-ML.
- Decodificacion sostenida entre 63,1 y 63,6 tokens por segundo.
- Prefill con latencia al primer token de aproximadamente 420 ms.
- Consumo de potencia extremadamente bajo (2-4 vatios) durante la inferencia.
- Carga hot-swap de modelos en 1,94 s mediante el servidor REST de FastFlowLM.
- No se documentan capacidades de tool calling, soporte de agentes, razonamiento multi-step, vision ni audio en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatiles AMD Ryzen AI: el modelo puede gestionar dialogo en tiempo real en dispositivos con Strix Halo o Strix Point, con velocidades superiores a 60 tokens por segundo gracias al NPU, sin necesidad de conexion a internet.
- Ejecucion de modelos de lenguaje en paralelo con la iGPU: al quedar la iGPU completamente libre (0% de contencion), el NPU puede atender inferencia de LLM mientras la Radeon 8060S se dedica a tareas graficas o a otros modelos primarios.
- Servicios de inferencia en servidores locales con FastFlowLM: el tiempo de carga hot-swap de 1,94 s permite alternar rapidamente entre modelos en entornos de desarrollo o demos, reduciendo el tiempo de espera.
- Aplicaciones embebidas con restricciones de energia: el consumo de 2-4 vatios hace viable su uso en dispositivos alimentados por bateria, donde una GPU consumiria mucho mas.
- Prototipado de aplicaciones de IA en hardware AMD sin dependencia de cloud: al no requerir VRAM de GPU ni conexion a servicios externos, es adecuado para desarrollo y pruebas en entornos aislados.
- Creacion de contenido bilingue ingles-chino: el modelo soporta ambos idiomas, lo que permite generar respuestas code-switching en plataformas de atencion al cliente o aplicaciones de traduccion asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los datos de rendimiento medidos directamente en un AMD Strix Halo (Ryzen AI Max+ 395) con FastFlowLM v1.0.2 son los siguientes:

| Metrica | Valor medido | Contexto operativo |
|---|---|---|
| Velocidad de decodificacion sostenida | 63,1 - 63,6 tok/s | Streaming de tokens consistente en generaciones cortas y largas |
| Velocidad de prefill (TTFT) | 81,5 - 128,1 tok/s | ~420 ms TTFT en prompts conversacionales |
| Potencia NPU activa | ~2 - 4 W | Mucho menor que una GPU |
| Contencion de compute iGPU | 0% | La Radeon 8060S queda 100% libre |
| Tiempo de carga hot-swap | 1,94 s | Cambio dinamico de modelo en servidor REST |
| Huella del modelo | 1,88 GB | Layout block-quantizado Q4_1 para streaming en SRAM AIE |

## Requisitos de hardware

- NPU AMD XDNA 2 con 48 tiles AIE-ML (acceso via /dev/accel/accel0).
- VRAM: no aplica, el modelo se ejecuta en el NPU, no en GPU.
- GPU: no requiere GPU para inferencia; la iGPU queda completamente disponible para otras tareas.
- Compatibilidad verificada: Strix Halo (Ryzen AI Max+ 395, Max 390, Max 385, Max PRO 380, 50 TOPS). Strix Point (Ryzen AI 9 HX 375, HX 370, PRO 370, AI 9 365) y Krackan Point (Ryzen AI 7 350, AI 5 340) son arquitectonicamente compatibles pero no han sido verificados por el autor.
- Compatibilidad adicional declarada: Gorgon Point (Ryzen AI 400) y Gorgon Halo (Ryzen AI Max PRO 400) con arquitectura XDNA 2, no verificados.
- Despliegue: FastFlowLM v0.9.22 o superior, con servidor REST integrado.
- Huella en disco: 1,88 GB para el archivo model.q4nx, mas el espacio del runtime.
- Consumo energetico estimado: 2-4 vatios durante la inferencia activa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Ejecucion en NPU AMD |
|---|---|---|---|---|
| openbmb/MiniCPM5-2B (base) | ~2B | No disponible | Apache 2.0 | No, requiere GPU/CPU |
| julianmb/MiniCPM5-2B-NPU2 | ~2B | No disponible | Apache 2.0 | Si, XDNA 2 via FastFlowLM |
| Alternativas Qwen3 cuantizadas para XDNA 2 | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre versiones comparables de otros modelos cuantizados especificamente para AMD XDNA 2 en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo hay verificacion y benchmarks reales en Strix Halo; los demas silicios declarados como compatibles (Strix Point, Krackan, Gorgon) necesitan validacion por parte de la comunidad.
- La modificacion GQA mediante replicacion KV de 2 a 8 cabezas es matematicamente equivalente, pero aumenta el numero efectivo de cabezas KV y por tanto el uso de memoria de cache, aunque no se especifica el incremento exacto.
- La inyeccion de tensores QK-norm unitarios sinteticos (gamma=1.0) podria alterar el comportamiento de normalizacion en comparacion con el modelo original, aunque para RMSNorm con gamma=1.0 la operacion se reduce a una normalizacion simple.
- El modelo solo soporta ingles y chino, lo que limita su uso en aplicaciones multilingues mas amplias.
- Requiere la ejecucion de kernels de firmware AIE-ML compilados y el runtime FastFlowLM en una version minima (v0.9.22), lo que condiciona el despliegue a entornos que soporten esas dependencias.
- No se documentan benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar su calidad comparativa frente a otros modelos de tamano similar en tareas de razonamiento o codigo.
- El repositorio tiene pocos usuarios (3 descargas, 3 likes), lo que indica una baja adopcion y una validacion limitada en entornos de produccion.
- No se especifica la longitud de contexto del modelo, un parametro critico para aplicaciones con historiales de conversacion largos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/julianmb/MiniCPM5-2B-NPU2
- Repositorio en GitHub con scripts de conversion y diagnostico: https://github.com/julianmb/minicpm5-xdna2
- Proyecto FastFlowLM: https://github.com/ROCm/FastFlowLM
- Modelo base openbmb/MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
