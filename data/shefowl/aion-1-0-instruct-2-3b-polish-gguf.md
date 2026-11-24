# shefowl/Aion-1.0-Instruct-2.3B-Polish-GGUF

## Resumen

Aion-1.0-Instruct-2.3B-Polish-GGUF es la distribucion en formato GGUF del modelo shefowl/Aion-1.0-Instruct-2.3B-Polish, una adaptacion al polaco del modelo Microsoft Aion-1.0-Instruct-2.3B. Lo publica el usuario independiente shefowl y esta pensado para su uso con llama.cpp. El modelo base es un transformer de 2.288.831.488 parametros (aproximadamente 2,3 mil millones) ajustado para instrucciones y especializado en polaco, manteniendo competencia en ingles.

La relevancia de esta publicacion es doble. Por un lado, ofrece una via de ejecucion local de un modelo polaco de instrucciones en hardware de consumo, con cuantizaciones que van de 1,47 GB (Q4_K_M) a 2,44 GB (Q8_0). Por otro, documenta de forma inusualmente rigurosa el proceso de cuantizacion: incluye una matriz de importancia (imatrix) calculada sobre 190.000 tokens y publica metricas de divergencia KL (KLD) frente al modelo BF16 de referencia, tanto en polaco como en ingles.

El autor advierte de una limitacion critica: ni llama.cpp estandar, ni LM Studio, ni Ollama soportan aun la arquitectura Aion. Para cargar estos ficheros es necesario compilar llama.cpp con un parche especifico (el de Xylolabs o, alternativamente, el de AtomicChat). La licencia es MIT, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Aion de Microsoft; requiere port especifico en llama.cpp) |
| Parametros totales | 2.288.831.488 (aproximadamente 2,3 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana deslizante de 2.048 tokens; las evaluaciones se hicieron a 4.096 tokens de contexto |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M (Q6_K a Q4_K_M con importance matrix); no se publicaron IQ4_XS ni IQ3_M |
| Idiomas soportados | Polaco (pl), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (modelo base en safetensors/BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer de aproximadamente 2,3 mil millones de parametros, derivado de Microsoft Aion-1.0-Instruct-2.3B y adaptado al polaco por shefowl. La model card de esta distribucion GGUF no detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si hubo fases de RLHF o DPO; esa informacion se remite a la model card del modelo principal. La arquitectura Aion no esta soportada por el llama.cpp principal, lo que obliga a aplicar un parche de portabilidad.

El trabajo tecnico destacable de esta publicacion es la cuantizacion. Las variantes Q6_K, Q5_K_M y Q4_K_M se generaron con una importance matrix (`imatrix-pl.gguf`) calculada sobre 190.000 tokens que combinan texto web polaco y ejemplos de chat en ingles y polaco. El autor demuestra que la imatrix es decisiva: sin ella, el Q4_K_M empeora mucho (KLD en polaco de 0,143 frente a 0,0259, y coincidencia del token superior del 80,5 % frente al 91,4 %). Tambien comprueba que el idioma del texto de calibracion apenas importa (una imatrix solo en ingles da KLD en polaco de 0,0271 frente a 0,0259).

La validacion del port es solida: el GGUF en BF16 produce la misma perplejidad en polaco que el modelo en transformers sobre los mismos fragmentos de 4.096 tokens (13,475 frente a 13,477). El chat template va embebido, por lo que es necesario pasar `--jinja` al servidor.

## Capacidades

- Generacion de texto conversacional en polaco e ingles, con ajuste para seguir instrucciones.
- Redaccion en polaco: la evaluacion `polish-writing-eval` (456 prompts, decodificacion greedy) mide errores por cada 100 palabras, con 2,48 errores en BF16 y 2,39 en Q4_K_M.
- Razonamiento y respuesta a instrucciones de proposito general, heredado del modelo base Aion-1.0-Instruct.
- Ejecucion local en CPU y GPU mediante llama.cpp, con velocidades de decodificacion altas para su tamano.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional local en polaco: el modelo puede mantener dialogos multi-turno en una maquina de consumo, gracias a su tamano de 2,3 B y a las cuantizaciones de 1,47 a 2,44 GB.
- Redaccion y correccion de textos en polaco: adecuado para borradores, resumenes y reescritura, con una tasa de error medida de aproximadamente 2,4 errores por cada 100 palabras en la evaluacion del autor.
- Prototipado de aplicaciones NLP para el mercado polaco sin depender de APIs en la nube, al poder desplegarse con llama-server en local.
- Traduccion y asistencia bilingue polaco-ingles en entornos con recursos limitados, ya que el modelo conserva competencia en ambos idiomas.
- Educacion e investigacion: util como banco de pruebas para estudiar el efecto de la cuantizacion en un idioma de recursos medios como el polaco, con metricas KLD publicadas.
- Despliegue en hardware modesto (portatiles, mini-PC o GPU de gama media) para tareas de generacion de texto de baja latencia, con 40 t/s en CPU de 8 hilos usando Q4_K_M.
- Generacion de texto por lotes en servidores sin GPU, donde el rendimiento en CPU (24 t/s con Q8_0) puede ser suficiente para procesos asincronos.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). En su lugar, ofrece metricas de fidelidad de la cuantizacion y de calidad de redaccion:

| Metrica | BF16 (ref.) | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|
| Tamano | 4,59 GB | 2,44 GB | 1,89 GB | 1,67 GB | 1,47 GB |
| KLD en polaco | 0 | 0,0037 | 0,0091 | 0,0100 | 0,0259 |
| Coincidencia token superior (pl) | 100 % | 96,6 % | 94,7 % | 94,5 % | 91,4 % |
| KLD en ingles | 0 | 0,0031 | 0,0059 | 0,0066 | 0,0160 |
| Errores / 100 palabras (writing eval) | 2,48 | 2,51 | no disponible | no disponible | 2,39 |

Las diferencias en la writing eval no son medibles estadisticamente: +0,04 (−0,23 a +0,30) para Q8_0 y −0,11 (−0,41 a +0,22) para Q4_K_M. La puntuacion de tarea de Q4_K_M es 0,10 inferior (−0,20 a −0,00). El autor senala que el polaco sufre mas la cuantizacion que el ingles en todos los tamanos.

Rendimiento medido con llama.cpp sobre ROCm:

| Hardware | Q8_0 | Q4_K_M |
|---|---|---|
| Radeon RX 7900 XTX | 198 t/s | 250 t/s |
| Ryzen 7 7700X (8 hilos, CPU) | 24 t/s | 40 t/s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para Q8_0 y 1,6 GB para Q4_K_M, mas el espacio para el contexto (la ventana es de 2.048 tokens).
- GPU recomendadas: Radeon RX 7900 XTX (medida oficialmente con ROCm); cualquier GPU con al menos 3-4 GB de VRAM deberia bastar para las cuantizaciones pequenas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas, dado el reducido tamano de los ficheros.
- Opciones de despliegue: llama.cpp compilado con el parche de Aion (Xylolabs o AtomicChat), con `llama-server` o `llama-cli`. LM Studio, Ollama y llama.cpp estandar no soportan la arquitectura todavia.
- Latencia y throughput: 198-250 t/s en RX 7900 XTX y 24-40 t/s en CPU de 8 hilos, segun la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Aion-1.0-Instruct-2.3B-Polish-GGUF | 2,3 B | Ventana 2.048 tokens | pl, en | MIT | GGUF; requiere port de llama.cpp |
| Microsoft Aion-1.0-Instruct-2.3B | 2,3 B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Safetensors; modelo base del anterior |
| Aion-1.0-Instruct-2.3B-GGUF (Xylolabs) | 2,3 B | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | GGUF; port de llama.cpp de referencia |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo completo produce bucles en aproximadamente una cuarta parte de sus respuestas con decodificacion greedy; las versiones cuantizadas se comportan igual. Se recomienda limitar la longitud de salida.
- No funciona con llama.cpp estandar, LM Studio ni Ollama: requiere compilar llama.cpp con un parche de Aion. El parche de AtomicChat no ha sido probado por el autor.
- El polaco pierde mas calidad que el ingles al cuantizar; por debajo de Q4_K_M la degradacion es notable (el autor descarto IQ4_XS e IQ3_M por esta razon).
- La ventana de contexto es de solo 2.048 tokens (ventana deslizante), lo que limita dialogos largos y documentos extensos.
- Riesgo de alucinacion inherente a un modelo de 2,3 B; no se han publicado evaluaciones de veracidad.
- No se documentan sesgos especificos, pero al ser una adaptacion de un modelo entrenado mayoritariamente con datos web, es probable que herede sesgos de esas fuentes.
- Es una publicacion no oficial, no afiliada a Microsoft; el soporte y el mantenimiento dependen de un unico autor.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base de Microsoft antes de desplegarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/shefowl/Aion-1.0-Instruct-2.3B-Polish-GGUF
- Modelo base (adaptacion polaca): https://huggingface.co/shefowl/Aion-1.0-Instruct-2.3B-Polish
- Modelo original de Microsoft: https://huggingface.co/microsoft/Aion-1.0-Instruct-2.3B
- GGUF con parche de port (Xylolabs): https://huggingface.co/Xylolabs/Aion-1.0-Instruct-2.3B-GGUF
- GGUF con parche alternativo (AtomicChat): https://huggingface.co/AtomicChat/Aion-1.0-Instruct-2.3B-GGUF
- Dataset de evaluacion de redaccion: https://huggingface.co/datasets/shefowl/polish-writing-eval
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
