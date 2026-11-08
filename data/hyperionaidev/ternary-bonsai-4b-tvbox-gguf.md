# hyperionaidev/Ternary-Bonsai-4B-tvbox-GGUF

## Resumen

Ternary-Bonsai-4B-tvbox-GGUF es una cuantizacion GGUF optimizada del modelo Ternary-Bonsai-4B de PrismML, publicada por el usuario hyperionaidev dentro del proyecto smolmaxxing. El objetivo declarado es ejecutar un modelo de lenguaje de aproximadamente 4.180 millones de parametros en hardware extremadamente limitado: concretamente una Xiaomi TV Box S (3.ª generacion) con cuatro nucleos Cortex-A55 y alrededor de 1 GB de RAM utilizable, alcanzando 4,3 tokens por segundo en conversacion real.

El modelo base emplea pesos ternarios (esquema de cuantizacion de 1,58 bits por peso) y esta empaquetado en formato GGUF con cuantizacion Q2_0_g64. La innovacion principal de esta ficha no reside en el modelo en si, sino en el artefacto: se ha podado la cabeza de salida (output head) de 151.669 filas a 61.592 filas, seleccionadas por frecuencia de token sobre un corpus ingles y multilingue, anadiendo un tensor `output_ids` que mapea los indices reducidos al vocabulario original.

Es relevante ahora porque demuestra que es viable servir un modelo conversacional en dispositivos de consumo ultrabaratos (TV boxes, Raspberry Pi, telefonos de gama baja) sin conexion a red, a costa de una perdida de calidad medida y cuantificada. El repositorio ocupa 1,2 GB y el archivo principal pesa 1,18 GB. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Ternary-Bonsai-4B de PrismML), pesos ternarios |
| Parametros totales | 4.179.521.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens en la configuracion medida (`-c 1024`); no se especifica el maximo del modelo base |
| Tipos de cuantizacion | Q2_0_g64 (ternario empaquetado); el archivo usa campos de 2 bits para los codigos ternarios |
| Idiomas soportados | No disponible (el corpus de seleccion de la cabeza es ingles y multilingue, pero no se enumeran idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `tb4-q20-hml.gguf`, 1,18 GB) |
| SHA-256 | `a02d805fc1ec089af67628519577685f0561b0979c01c70728eac9b83713fe24` |
| Cabeza de salida | 61.592 filas de las 151.669 originales, mas tensor `output_ids` |
| Modelo base | prism-ml/Ternary-Bonsai-4B-unpacked |
| Runtime requerido | llama.cpp parcheado (smolmaxxing), commit base `8642541` |

## Arquitectura y entrenamiento

El modelo base es un transformer de 4.180 millones de parametros con pesos ternarios, lo que implica que cada peso toma uno de tres valores posibles (-1, 0, +1) y requiere escalas por grupo para reconstruir la magnitud. La cuantizacion Q2_0_g64 agrupa los pesos en bloques de 64 con una escala compartida. Esta ficha concreta no entrena ni afina el modelo: copia los pesos byte a byte desde `Ternary-Bonsai-4B-Q2_0_g64.gguf` y solo modifica la cabeza de salida.

La modificacion clave es la poda de la cabeza de salida. Como el modelo base ata la salida a la matriz de embeddings, no existe una cabeza separada que podar sin mas; el autor anade una cabeza independiente de 61.592 filas extraidas de `token_embd` mediante el fichero `data/head-ids-qwen3-ml64k.txt`, seleccionadas por frecuencia de token en un corpus ingles y multilingue. Los prompts pueden seguir usando cualquier token del vocabulario original, pero el modelo solo puede generar tokens dentro de la cabeza podada. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica del artefacto es un kernel que reescribe los pesos en RAM durante la carga, sin alterar el archivo en disco. Aplica dos transformaciones: escalas promediadas (un grupo de 128 pesos comparte una escala promediada en lugar de dos de 64, con un coste de +0,18 % de perplejidad) y desempaquetado de los codigos ternarios de base 3 a campos de 2 bits (en el A55 in-order, un campo de 2 bits cuesta unas 2 operaciones NEON por cada 16 pesos frente a unas 5 de un digito en base 3, lo que supone un 13 % mas de RAM a cambio de velocidad).

## Capacidades

- Generacion de texto conversacional: es un modelo de pipeline `text-generation` con tag `conversational`, orientado a chat.
- Razonamiento y generacion de codigo: no disponible, no se documentan capacidades especificas mas alla de la generacion de texto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el corpus de seleccion de la cabeza es ingles y multilingue, pero no se enumeran idiomas soportados.
- Capacidad especial: pesos ternarios (1,58 bits por peso) que permiten inferencia en dispositivos con ~1 GB de RAM.
- Restriccion de generacion: solo puede emitir tokens presentes en la cabeza podada de 61.592 filas.

## Casos de uso

- Chat local en TV boxes y dispositivos ultrabaratos: el modelo esta medido a 4,3 tok/s en una Xiaomi TV Box S (3.ª Gen) con ~1 GB de RAM util, lo que permite un asistente conversacional sin conexion en hardware de menos de 50 euros.
- Asistentes de voz o texto embebidos sin red: al no requerir GPU ni conexion, puede integrarse en electrodomesticos o terminales de punto de venta con procesadores ARM de gama baja.
- Procesamiento de texto en el borde (edge computing): clasificacion, resumen corto o extraccion de entidades en dispositivos donde no se puede enviar datos a la nube por privacidad o latencia.
- Educacion y prototipado de cuantizacion: sirve como caso de estudio reproducible de como la poda de cabeza de salida y el desempaquetado de pesos ternarios afectan a velocidad y calidad, con metricas publicadas (0,965 bits/byte de perplejidad).
- Demos de inferencia en Raspberry Pi o telefonos de gama baja: el archivo de 1,18 GB cabe en almacenamiento barato y el runtime parcheado esta pensado para CPUs in-order.
- Investigacion en compresion extrema de modelos: la comparacion entre configuracion con y sin escalas promediadas (0,964 vs 0,965 bits/byte) ofrece un punto de referencia cuantitativo para estudiar el compromiso calidad/velocidad.
- Servicio de chat offline en entornos con conectividad intermitente o inexistente (zonas rurales, industria, transporte).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Los unicos datos de rendimiento son los medidos por el autor en el dispositivo objetivo:

| Metrica | Valor |
|---|---|
| Velocidad en chat real (TV box) | 4,3 tok/s |
| Velocidad en llama-bench | 4,8 tok/s |
| Velocidad en chat antes del ajuste §18 | 3,2 tok/s |
| Procesamiento de prompt | 9,6 tok/s |
| Calidad (perplejidad en ingles, bits/byte) | 0,965 con escalas promediadas; 0,964 sin ellas |
| Memoria en el dispositivo | 1,03 GB |
| Tamano del archivo | 1,18 GB |

La calidad se mide como perplejidad en ingles sobre un texto fijo de 22 KB, convertida a bits por byte para permitir comparaciones entre modelos con tokenizadores distintos (menor es mejor).

## Requisitos de hardware

- VRAM/RAM estimada: ~1,03 GB en el dispositivo medido con la configuracion indicada; el archivo en disco ocupa 1,18 GB.
- GPU recomendadas: no aplica; el modelo esta disenado para CPU. No se documentan requisitos de GPU.
- Cabe en GPU de consumo: no aplica, es un modelo para CPU de gama baja.
- CPU objetivo: ARM Cortex-A55 (in-order), 4 nucleos, con ~1 GB de RAM utilizable.
- Opciones de despliegue: exclusivamente llama.cpp parcheado del repositorio smolmaxxing (llama.cpp en el commit `8642541` con `patches/llama.cpp-v0.8.0-tvbox.patch`). Stock llama.cpp, LM Studio y Ollama no cargan el archivo.
- Comando de ejecucion: `GGML_Q2_0_SCALES=128 GGML_Q2_0_SCALES_AVG=1 GGML_Q2_0_F2_LAYERS=0-35 llama-server -m tb4-q20-hml.gguf -t 3 -c 1024 -ub 128 -b 128`.
- Latencia y throughput: 4,3 tok/s en chat real, 4,8 tok/s en llama-bench, 9,6 tok/s de procesamiento de prompt, sobre Xiaomi TV Box S (3.ª Gen).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-4B-tvbox-GGUF (esta ficha) | 4,18 B | 1024 en la config medida | Q2_0_g64 ternario, cabeza podada a 61.592 filas | Apache-2.0 | Requiere llama.cpp parcheado |
| prism-ml/Ternary-Bonsai-4B-gguf | 4,18 B | No disponible | Q2_0_g64 ternario, cabeza completa (151.669 filas) | Apache-2.0 | llama.cpp estandar |
| prism-ml/Ternary-Bonsai-4B-unpacked | 4,18 B | No disponible | Pesos sin empaquetar | Apache-2.0 | Formato original |
| Bonsai Image 4B (PrismML) | 4 B aprox. | No aplica | 1-bit y ternario (difusion) | No disponible | Laptops y telefonos |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La diferencia funcional principal frente al modelo base es la poda de la cabeza de salida, que reduce el tamano y acelera la generacion a costa de limitar los tokens que el modelo puede emitir.

## Limitaciones y advertencias

- Requiere un runtime parcheado: stock llama.cpp, LM Studio y Ollama no cargan el archivo; sin el parche de smolmaxxing el modelo no es utilizable.
- Cabeza de salida podada: el modelo solo puede generar tokens de las 61.592 filas seleccionadas, lo que puede degradar la calidad en dominios con vocabulario especializado, idiomas minoritarios o tokens raros.
- Perdida de calidad cuantificada: las escalas promediadas cuestan +0,18 % de perplejidad frente a la configuracion sin promediar (0,965 vs 0,964 bits/byte).
- Contexto limitado en la configuracion medida: 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Sesgos conocidos: no disponible; no se documentan analisis de sesgo.
- Riesgo de alucinacion: no disponible; no se documenta, pero es esperable en un modelo de 4 B con cuantizacion ternaria.
- Idiomas soportados: no disponible; el corpus de seleccion de la cabeza es ingles y multilingue, pero no se enumeran idiomas concretos.
- Uso comercial: la licencia Apache-2.0 del modelo base lo permite, pero el runtime parcheado (llama.cpp + parche smolmaxxing) tiene sus propias condiciones; llama.cpp es MIT.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.
- Fecha de creacion futura respecto a la informacion habitual: creado el 2026-11-08, lo que puede indicar metadatos anomales.

## Enlaces

- Hugging Face: https://huggingface.co/hyperionaidev/Ternary-Bonsai-4B-tvbox-GGUF
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-4B-gguf
- Modelo base (unpacked): https://huggingface.co/prism-ml/Ternary-Bonsai-4B-unpacked
- Coleccion Ternary Bonsai: https://huggingface.co/collections/prism-ml/ternary-bonsai
- Proyecto smolmaxxing: https://github.com/hyperionaidev/smolmaxxing
- Write-up del experimento: https://github.com/hyperionaidev/smolmaxxing/blob/main/EXPERIMENT.md
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Anuncio de Bonsai Image 4B: https://prismml.com/news/bonsai-image-4b
