# bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw es una cuantizacion EXL3 de 2,5 bits por peso del checkpoint DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario bertholomus. Se trata de un modelo multimodal image-text-to-text con 92.269.315.410 parametros (unos 92,3 mil millones) empaquetados en un repositorio de 184,7 GB, lo que reduce el peso del modelo original lo suficiente para servirlo en dos nodos GB10 (clase DGX Spark) mediante paralelismo tensorial 2 sobre RDMA con TensorFold.

La relevancia de esta ficha es practica: demuestra que un modelo de gran tamano y capacidad multimodal puede desplegarse en hardware de clase workstation con una perdida de calidad acotada y medida. El autor documenta la fidelidad de la cuantizacion frente al checkpoint original en 16 bits con metricas de divergencia KL y acuerdo top-1 sobre un conjunto de 122 filas y 294.481 tokens, ademas de pruebas de servicio con contexto de hasta 1.048.576 tokens por peticion.

El modelo base incorpora arquitectura DeepSeek con expertos enrutados (MoE), compresor de KV, indexador, tablas Engram, torre de vision y un drafter MTP/DSpark para decodificacion especulativa. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales conocidas. Esta ficha describe la cuantizacion concreta, no el modelo base original, y por tanto todos los datos de rendimiento corresponden al checkpoint EXL3 servido en la configuracion indicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atencion con compresor de KV e indexador, tablas Engram, torre de vision y drafter MTP/DSpark; cuantizado en formato EXL3 |
| Parametros totales | 92.269.315.410 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens por peticion, en una ventana compartida de 7.340.032 posiciones |
| Tipos de cuantizacion | EXL3 2,5 bpw (global 2,52 bpw); expertos enrutados a 2,5 bpw, atencion/expertos compartidos/compresor KV/consultas del indexador/proyeccion clave-valor Engram a 4 bpw, claves del indexador a 8 bpw, cabeza de salida a 6 bpw, drafter MTP/DSpark a 4 y 6 bpw, embeddings/routers/norms/torre de vision/aligner en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora varios componentes especializados: expertos enrutados y expertos compartidos, un compresor de KV y un indexador para gestionar contexto largo, tablas Engram con proyeccion clave-valor, una torre de vision con aligner para entrada image-text-to-text, y un drafter MTP/DSpark que habilita decodificacion especulativa. La cuantizacion EXL3 distribuida por bertholomus preserva en 16 bits los embeddings, las puertas del router, las norms, la cabeza markov del drafter, la torre de vision y el aligner, mientras que el resto de pesos se comprime de forma selectiva segun su sensibilidad.

El proceso de cuantizacion se realizo con ExLlamaV3 1.6.0 y el soporte de DeepSeek-V4 de Fabiano Anemone (pull request 449 de turboderp-org/exllamav3, licencia MIT), con cuatro modificaciones propias del autor: transporte del estado del modelo entre modulos para cada fila de calibracion, cuantizacion de las claves del indexador y de la proyeccion clave-valor Engram, un fallback en el loader, y cuantizacion sin calibracion de un experto enrutado al que no llego ningun token de calibracion. Se uso codebook mul1 y una calibracion de 192 filas por 2048 tokens. Las tablas Engram no se incluyen en el repositorio y deben servirse desde los shards 47 y 48 del checkpoint original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento general, con soporte de contexto muy largo (hasta 1.048.576 tokens por peticion).
- Procesamiento de imagen y texto (pipeline image-text-to-text): la torre de vision y el aligner se mantienen en 16 bits, por lo que la capacidad multimodal se preserva intacta.
- Llamada a herramientas (tool calling) forzada y automatica, verificada con 16 de 16 aciertos en las pruebas del autor.
- Salida estructurada (structured output), validada con 11 de 11 aciertos y comportamiento identico en rafagas y en peticiones aisladas.
- Razonamiento multi-paso y flujos de agente, con soporte de reanudacion de prompts conservados (kept-prompt resume).
- Capacidad de recuperacion de informacion en contexto largo: needles 3 de 3 en un prompt de 1.039.836 tokens.
- Decodificacion especulativa mediante el drafter MTP/DSpark, que acelera la generacion.
- Servicio concurrente: 32 streams simultaneos en la configuracion de referencia.

## Casos de uso

- Atencion al cliente automatizada de largo recorrido: el modelo puede mantener conversaciones multi-turno con historiales de cientos de miles de tokens gracias a su ventana de 1.048.576 tokens, sin perder coherencia en el hilo.
- Analisis de documentos extensos y multimodal: permite procesar contratos, informes o expedientes con imagenes adjuntas (escaneos, graficos) y responder preguntas sobre el conjunto completo en una sola peticion.
- Generacion de codigo en produccion: soporta tool calling y salida estructurada, lo que facilita su integracion en pipelines de CI/CD y en asistentes de codigo que invocan herramientas externas; conviene valorar la cuantizacion de 4,0 bpw si la fidelidad en turnos de tool calling es critica.
- Agentes autonomos multi-paso: la combinacion de razonamiento, tool calling y contexto largo permite construir agentes que planifican, ejecutan herramientas y revisan resultados en una misma sesion.
- Recuperacion aumentada sobre corpus masivos: con needles resueltos en prompts de mas de un millon de tokens, es adecuado para RAG de contexto amplio o busqueda semantica sobre bibliotecas documentales enteras.
- Despliegue en laboratorio o edge de gama alta: al caber en dos nodos GB10 (clase DGX Spark) con paralelismo tensorial 2 sobre RDMA, permite servir un modelo de 92 mil millones de parametros en infraestructura de clase workstation.
- Procesamiento por lotes concurrente: con 32 streams y un throughput agregado de hasta 248,6 tok/s en 32 streams sostenidos, es viable para servir a varios usuarios simultaneos en un entorno interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor publica metricas de fidelidad de la cuantizacion frente al checkpoint original en 16 bits, con intervalos bootstrap del 95 por ciento:

| Metrica | 2,5 bpw (esta) | 4,0 bpw (referencia) |
|---|---|---|
| KL corto | 0,1305 [0,1209; 0,1406] | 0,0331 [0,0312; 0,0351] |
| Top-1 corto | 92,01 % [91,10; 92,85] | 96,17 % [95,76; 96,55] |
| KL largo | 0,2876 [0,0652; 0,6093] | 0,1202 [0,0113; 0,2817] |
| Top-1 largo | 87,07 % [76,31; 94,65] | 92,31 % [84,19; 97,47] |
| KL wiki | 0,1558 [0,1428; 0,1695] | 0,0374 [0,0341; 0,0410] |
| Top-1 wiki | 87,41 % [86,05; 88,83] | 93,90 % [93,07; 94,74] |

Desglose por tipo de contenido a 2,5 bpw (KL / top-1): codigo 0,0494 / 95,22 %; matematicas 0,1425 / 91,51 %; prosa 0,1254 / 91,77 %; escritura creativa 0,0623 / 91,09 %; tool calls 0,5948 / 79,43 %. A 4,0 bpw: codigo 0,0097 / 97,80 %; matematicas 0,0391 / 95,74 %; prosa 0,0248 / 96,50 %; creativa 0,0109 / 96,02 %; tool calls 0,1951 / 87,77 %. Los turnos de tool calling son los que mas pierden a 2,5 bpw.

Rendimiento de servicio en dos nodos GB10 con TensorFold TP2 (tok/s, greedy, drafting DSpark, mediana de 3):

| Escenario | v0.7.4 | v0.7.5 |
|---|---|---|
| Decode, un stream, codigo (512 tokens) | 106,3 | 106,5 |
| Decode, un stream, prosa | 61,1 | 60,7 |
| Decode, un stream, estructurado | 119,4 | 118,9 |
| 2 streams agregado | 96,3 | 96,2 |
| 4 streams agregado | 137,4 | 137,7 |
| 4 streams sostenidos 90 s | 152,9 | 153,0 |
| 8 streams sostenidos 90 s | 172,4 | 172,9 |
| 16 streams sostenidos 90 s | 200,0 | 217,9 |
| 24 streams sostenidos 90 s | 195,7 | 242,2 |
| 32 streams sostenidos 90 s | 198,2 | 248,6 |
| Prompt 8K | 2436,5 | 2433,9 |
| Prompt 32K | 2577,4 | 2550,0 |
| Prompt 64K | 2591,4 | 2573,2 |
| Prompt 128K | 2559,2 | 2543,4 |
| Prompt 93.335 tokens | 2369,1 | 2382,5 |
| Decode tras prompt de 128K | 99,4 | 100,1 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 184,7 GB en disco; la configuracion de referencia usa dos nodos GB10 (clase DGX Spark) con memoria unificada, suficiente para cargar el modelo completo con la ventana de contexto ampliada.
- GPU recomendadas: la configuracion validada son dos nodos GB10 (DGX Spark) con TensorFold tensor parallel 2 sobre RDMA. No se documenta soporte en A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en consumer GPU: no en una sola GPU de consumo; requiere al menos dos nodos de clase GB10 segun la receta publicada.
- Opciones de despliegue: ExLlamaV3 (libreria exllamav3) con la receta TensorFold TP2 del autor; el repositorio no incluye plantilla de chat, por lo que hay que anadir la del script `tools/serving_1017.py` de la receta, junto con seis tensores auxiliares (cabeza markov del MTP y claves Engram q/k en F32).
- Latencia y throughput estimados: decodificacion de 61 a 119 tok/s en un stream segun el tipo de contenido; 248,6 tok/s agregados con 32 streams sostenidos; prefill de 2.369 a 2.591 tok/s en prompts de 8K a 128K.
- Almacenamiento: las tablas Engram deben servirse desde los shards 47 y 48 del checkpoint original, no incluidas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw (esta) | 92,3 mil millones | 1.048.576 tokens por peticion | EXL3 2,5 bpw (2,52 global) | MIT | Hugging Face, 24.028 descargas |
| DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw | no disponible en la informacion | no disponible | EXL3 4,0 bpw | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en la informacion | no disponible | FP8 / FP4 originales | MIT | Hugging Face (deepseek-ai) |

La comparativa se limita a las variantes del mismo modelo base documentadas en la informacion disponible; no se dispone de datos de modelos competidores de otros desarrolladores para contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- La cuantizacion a 2,5 bpw degrada la fidelidad respecto al original: KL corto de 0,1305 y top-1 del 92,01 %, frente a 0,0331 y 96,17 % del quant de 4,0 bpw.
- Los turnos de tool calling son los mas afectados: KL de 0,5948 y top-1 del 79,43 % a 2,5 bpw, frente a 0,1951 y 87,77 % a 4,0 bpw. Para agentes que requieran maxima fidelidad se recomienda el quant de 4,0 bpw, que necesita cuatro nodos.
- La fidelidad en contextos largos tiene alta varianza: el intervalo de confianza del 95 % para KL largo va de 0,0652 a 0,6093, y el de top-1 largo de 76,31 % a 94,65 %.
- El repositorio no incluye plantilla de chat; hay que incorporarla desde la receta, junto con seis tensores auxiliares, o el modelo no funcionara correctamente en el motor.
- Las tablas Engram no estan en el repositorio y deben servirse desde los shards 47 y 48 del checkpoint original, lo que anade una dependencia externa y espacio de almacenamiento adicional.
- Un experto enrutado se cuantizo sin calibracion por no recibir ningun token de calibracion, lo que puede introducir un sesgo localizado no medido.
- No hay informacion sobre sesgos conocidos, riesgo de alucinacion especifico ni idiomas soportados; deben evaluarse en el despliegue concreto.
- Requiere infraestructura especifica (dos nodos GB10 con RDMA y TensorFold); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- La licencia MIT del modelo base y de la cuantizacion permite uso comercial, pero conviene verificar la licencia del checkpoint original enlazada en la model card antes de un despliegue en produccion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/main/LICENSE
- Cuantizacion de 4,0 bpw del mismo autor: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-4.0bpw
- Receta de despliegue TensorFold TP2 en dos GB10 (v0.7.5): https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10
- Resultados de servicio v0.7.5: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/tree/v0.7.5/results/served-v075/rows/
- Informe de fidelidad KL: https://github.com/bertholomus/deepseek-v4.1-tensorfold-tp2-2xgb10/blob/v0.7.5/results/served-v070/kl-report.md
- Pull request de soporte DeepSeek-V4 en ExLlamaV3: https://github.com/turboderp-org/exllamav3/pull/449
- Perfil de Fabiano Anemone: https://github.com/anoane
