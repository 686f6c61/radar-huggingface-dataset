# guideboardlabs/SenseNova-Loop-9B-Preview-GGUF

## Resumen

SenseNova Loop 9B Preview es un modelo de generación de texto de unos 9.000 millones de parámetros (8.956.949.376 exactos según los safetensors) desarrollado por SenseNova / OpenSenseNova, del cual este repositorio de guideboardlabs ofrece únicamente una conversión cuantizada a formato GGUF. La característica distintiva del modelo es su arquitectura "loop": un bloque de capas que se recorre más de una vez durante la inferencia, lo que permite almacenar los pesos del bloque una sola vez y reducir el tamaño del modelo en torno a un 36 por ciento respecto a duplicar el bloque.

La relevancia de esta ficha concreta es doble. Por un lado, ofrece los pesos en GGUF (Q3_K_M, Q4_0 y Q4_K_M) para ejecutar el modelo localmente en GPU de consumo. Por otro, advierte de un punto crítico: la arquitectura `sensenova_loop` no está soportada por el llama.cpp oficial, por lo que es imprescindible usar el fork específico de GuideboardLabs disponible en GitHub. El modelo está orientado a chat conversacional en inglés y chino, es texto puro (sin visión ni MTP en esta exportación) y se publica bajo licencia Apache 2.0, lo que lo hace apto para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (bloque de capas recorri­do en bucle, con kernels de convolucion y router mHC; no soportada por llama.cpp oficial) |
| Parametros totales | 8.956.949.376 |
| Parametros activos | no disponible |
| Longitud de contexto | 262K anunciada por el modelo base; 16K validados en esta cuantizacion |
| Tipos de cuantizacion | Q3_K_M, Q4_0, Q4_K_M (kernels de convolucion, normas y pesos del router mHC en FP32) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, sensenova/SenseNova-Loop-9B-Preview, emplea una arquitectura denominada `sensenova_loop`, en la que un bloque de capas del transformer se ejecuta en bucle: el runtime visita el mismo bloque de pesos mas de una vez, aliasando la segunda pasada sobre la primera. Esto es numeri­camente equivalente a almacenar el bloque dos veces, pero reduce el tamano del fichero un 36 por ciento. Ademas de las capas recorridas en bucle, el modelo incorpora kernels de convolucion y un router denominado mHC, cuyos pesos se mantienen en FP32 durante la cuantizacion; el resto de tensores se cuantizan.

Sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset y el uso de tecnicas como RLHF o DPO no estan disponibles en la informacion proporcionada. Tampoco se detalla si el modelo incorpora innovaciones como decodificacion especulativa o mecanismos de atencion lineal; lo unico documentado en la conversion es que la exportacion es solo texto y no incluye las capacidades de vision ni MTP del modelo original.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational"), en ingles y chino.
- Arquitectura de bucle que reutiliza pesos, lo que reduce el footprint en disco y en VRAM respecto a un modelo equivalente con el bloque duplicado.
- Ejecucion local via llama.cpp mediante un fork especifico, con soporte de servidor (`llama-server`), offload completo a GPU y flash attention.
- No disponible en esta exportacion: capacidades de vision, MTP (multi-token prediction), tool calling, agentes ni thinking mode no estan documentados para estos GGUF.

## Casos de uso

- Chatbots locales en ingles y chino: el pipeline conversacional y el tamano de unos 5,3 GB en Q4_0 permiten desplegar un asistente multi-turno en GPU de consumo sin depender de APIs externas.
- Prototipado de arquitecturas alternativas: al tratarse de una arquitectura de bucle poco comun, es util para investigadores que quieran evaluar en la practica el enfoque de reutilizacion de pesos frente a modelos densos convencionales de tamano similar.
- Inferencia en hardware AMD RDNA1: las mediciones publicadas se realizaron sobre una RX 5700 XT, lo que lo convierte en un buen banco de pruebas para GPUs sin soporte de integer dot product.
- Servicios de texto autoalojados: con `llama-server` se puede exponer una API OpenAI-compatible en el puerto 8080 para integrar el modelo en aplicaciones internas.
- Analisis de impacto de la cuantizacion en arquitecturas hibridas: la conservacion en FP32 de convoluciones, normas y router mHC ofrece un caso de estudio sobre que tensores conviene no cuantizar.
- Verificacion de equivalencia numerica entre runtimes: el fork reproduce token a token la salida greedy de la implementacion de referencia en `transformers`, util como referencia de regresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos medidos son de rendimiento de inferencia y verificacion numerica de la cuantizacion:

Mediciones en RX 5700 XT (NAVI10), contexto 4096, offload completo, temperature 0:

| Quant | Decode (t/s) | Prompt (t/s) |
|---|---:|---:|
| Q4_0 | 31,4 | 29,6 |
| Q4_K_M | 30,5 | 30,5 |
| Q3_K_M | 29,9 | 19,4 |

Verificacion de precision: la decodificacion greedy coincide token a token con la implementacion de referencia en `transformers` en el prompt de desarrollo probado, y las operaciones de enrutamiento personalizadas concuerdan con su implementacion en CPU con un error de 1,2e-7. No se ha ejecutado ninguna evaluacion de KL ni de perplexidad sobre estas cuantizaciones.

## Requisitos de hardware

- VRAM estimada: unos 5,3 GB para Q4_0, 5,6 GB para Q4_K_M y 4,6 GB para Q3_K_M, mas los buffers de estado recurrente y el KV cache (el comando de ejemplo usa contexto 4096).
- GPU probadas: RX 5700 XT (RDNA1, NAVI10) con offload completo (`-ngl 99`) y flash attention activada, alcanzando unos 31 t/s de decodificacion en Q4_0.
- Cabe en GPUs de consumo de 8 GB o mas (clase RTX 3060/4060 Ti 8 GB, RX 5700 XT y superiores). En tarjetas con BAR pequeno, es necesario definir `GGML_VK_DISABLE_HOST_VISIBLE_VIDMEM=1` para que los buffers de estado recurrente no caigan en memoria host-visible; la variable solo surte efecto cuando el modelo cabe entero en VRAM.
- Software: obligatoriamente el fork https://github.com/GuideboardLabs/llama.cpp-sensenova-loop (rama `sensenova-loop`); el llama.cpp oficial no puede cargar estos ficheros. Ejemplo de ejecucion:

```bash
GGML_VK_DISABLE_HOST_VISIBLE_VIDMEM=1 ./build/bin/llama-server \
    -m SenseNova-Loop-9B-Preview-Q4_0.gguf -ngl 99 -c 4096 -fa on --port 8080
```

- Throughput medido: 29,9-31,4 t/s de decodificacion segun cuantizacion en RX 5700 XT. No hay datos para otras GPUs ni para despliegue con vLLM, Ollama o TGI (no disponibles para esta arquitectura segun la informacion proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (GGUF) | 8.957 M (bloque compartido, -36% en disco) | 262K anunciada, 16K validada | Apache 2.0 | GGUF (fork propio de llama.cpp) | Arquitectura de bucle, solo texto, requiere runtime especifico |
| Llama 3.1 8B Instruct | 8.030 M | 128K | Licencia Llama 3.1 (restricciones) | safetensors, GGUF (llama.cpp oficial) | Ecosistema maduro, soporte universal de runtimes |
| Qwen2.5-7B-Instruct | 7.615 M | 128K | Apache 2.0 | safetensors, GGUF (llama.cpp oficial) | Fuerte en chino e ingles, tool calling nativo |

La principal diferencia practica no esta en el tamano sino en el soporte: frente a alternativas de la misma clase que funcionan con cualquier runtime estandar, SenseNova Loop 9B exige un fork concreto de llama.cpp, lo que limita su portabilidad a cambio de una arquitectura mas eficiente en almacenamiento.

## Limitaciones y advertencias

- Compatibilidad critica: los GGUF no cargan en el llama.cpp oficial; hay que compilar el fork de GuideboardLabs. Cualquier actualizacion del runtime depende de que el fork se mantenga.
- Contexto sin validar: el modelo base anuncia 262K de ventana, pero en esta cuantizacion solo se ha ejercitado hasta 16K tokens. No hay garantias de calidad mas alla de ese punto.
- Precision no evaluada a fondo: la verificacion se limito a un prompt de desarrollo con decodificacion greedy; no se han realizado barridos de KL ni de perplexidad, por lo que la calidad de las cuantizaciones en tareas diversas es desconocida.
- Capacidades recortadas en la exportacion: sin vision y sin MTP; es un modelo exclusivamente de texto.
- Rendimiento contraintuitivo en RDNA1: Q3_K_M es mas lento que Q4_0 pese a ocupar menos, porque las K-quants requieren integer dot product que las GPUs RDNA1 no tienen.
- Riesgo de alucinacion y sesgos: propios de cualquier LLM; no se documenta ningun proceso de alineacion (RLHF/DPO) en la informacion disponible, por lo que debe tratarse como modelo preview sin garantias de seguridad.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia: Apache 2.0 tanto en el modelo base como en la cuantizacion, sin restricciones de uso comercial conocidas; no obstante, al ser un modelo preview, conviene revisar la model card original ante cambios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/guideboardlabs/SenseNova-Loop-9B-Preview-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Fork de llama.cpp con soporte de la arquitectura: https://github.com/GuideboardLabs/llama.cpp-sensenova-loop (rama `sensenova-loop`)
- No hay enlaces a papers, blogs ni demos en la informacion disponible.
