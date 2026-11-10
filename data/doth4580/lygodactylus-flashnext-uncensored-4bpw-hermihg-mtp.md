# doth4580/Lygodactylus-FlashNext-Uncensored-4bpw-HermiHg-MTP

## Resumen

Lygodactylus-FlashNext-Uncensored-4bpw-HermiHg-MTP es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 4 bits por peso, derivado del modelo Qwen3.8-Flash-Next, en su variante sin censura publicada por orcarouter. El paquete lo distribuye el usuario doth4580 y combina tres piezas: la cuantizacion EXL3 realizada por Lygodactylus, los pesos del modelo base sin censura de orcarouter y una cabeza de decodificacion especulativa (MTP, multi-token prediction) optimizada por HermiHg. El resultado es un artefacto de inferencia listo para cargar en el motor veloGB10 sobre hardware NVIDIA DGX Spark / GB10.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) de 34.994.670.704 parametros totales, segun los tensores safetensors del repositorio. El paquete ocupa 109,2 GB e incluye la cabeza MTP como fichero separado (`zz_mtp_head_hermihg.safetensors`), con 59 tensores no-expertos copiados byte a byte del trabajo de HermiHg. La ventana de contexto configurada en los comandos de referencia es de 262.144 tokens (`--max-seq-len 262144`), con un maximo de generacion de 65.536 tokens.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de cuantizacion y fusion de cabezas especulativas sobre un MoE grande; por otro, publica mediciones de rendimiento reales sobre topologias de uno, dos y cuatro aceleradores GB10, un escenario poco documentado. La licencia es la Qwen Community License 1.0, heredada del modelo original, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP para decodificacion especulativa |
| Parametros totales | 34.994.670.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia) |
| Tipos de cuantizacion | EXL3 a 4 bits por peso (4 bpw); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`other` en metadatos) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), con `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con atencion estandar; los metadatos del repositorio incluyen la etiqueta `qwen4_exp`, que sugiere una variante experimental de la familia Qwen. Sobre la arquitectura se anade una capa MTP (multi-token prediction) que actua como cabeza borrador en decodificacion especulativa: el modelo completo verifica cada token propuesto, de modo que la cabeza afecta unicamente a la velocidad y nunca a la salida. En este paquete, los 59 tensores no-expertos de la cabeza provienen del fichero optimizado de HermiHg (licencia Apache-2.0), mientras que los expertos enrutados de la capa MTP se conservan del propio paquete base. No se usa el fichero completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa, combinacion que el cargador de EXL3 no acepta.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros) del modelo original. La cuantizacion a 4 bpw la realizo Lygodactylus con exllamav3 (revision `9c715c0b1a`), y los pesos se redistribuyen sin modificaciones. El paquete esta pensado y probado para el motor veloGB10 (`gb10_inference`), con servidor compatible con la API de OpenAI en el puerto 9000 y soporte de cache de prefijos y paralelismo tensorial (TP) entre una y cuatro maquinas GB10.

## Capacidades

- Generacion de texto y razonamiento en modo pensamiento (thinking on en las pruebas de referencia), con contexto de hasta 262.144 tokens.
- Decodificacion especulativa mediante cabeza MTP integrada, con tasas de aceptacion del borrador en torno al 72 % segun las mediciones publicadas.
- Variante sin censura: los pesos derivan de Qwen3.8-Flash-Next-Uncensored, por lo que se reduce el rechazo de contenido que el modelo original filtraria.
- Servido mediante API compatible con OpenAI (`/v1`), lo que facilita la integracion con clientes existentes.
- Soporte de cache de prefijos (`--prefix-cache on`), util en conversaciones multi-turno y prompts repetidos.
- Despliegue distribuido en topologias TP=1, TP=2 y TP=4 sobre GB10, con transferencia de pesos por red y cache local en cada nodo.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de contexto largo en una sola maquina GB10: con `--max-seq-len 262144` y `--max-batch 2`, el paquete permite procesar documentos extensos o historiales de conversacion largos sin salir de un unico acelerador, a un ritmo medido de 77 tokens/s de mediana en decodificacion.
- Generacion de codigo interactiva: la columna de turno de codigo de las pruebas alcanza 110 tokens/s en TP=1 y 179 tokens/s en TP=4, adecuado para asistentes de programacion con latencia baja por token.
- Despliegue escalado en cluster pequeno: con TP=2 o TP=4 el prefill sube de 2.074 a 3.285 y 3.870 tokens/s respectivamente, lo que resulta util para cargas con prompts largos y muchos documentos de entrada.
- Servicio compatible con OpenAI para equipos internos: al exponer `/v1` en el puerto 9000, se puede conectar a herramientas que ya hablan el protocolo de OpenAI sin adaptadores adicionales.
- Experimentacion con decodificacion especulativa: el paquete permite comparar el rendimiento con y sin la cabeza MTP (el paquete base sin cabeza es `doth4580/Lygodactylus-FlashNext-Uncensored-4bpw`), midiendo aceptacion del borrador y ganancia de velocidad.
- Escenarios de investigacion que requieren menor filtrado de contenido: al ser una variante sin censura, sirve para estudiar comportamiento del modelo en dominios donde el original rechazaria peticiones, siempre dentro de los limites de la licencia.
- Evaluacion de infraestructura GB10: las mediciones publicadas (latencia, throughput agregado con dos peticiones y aceptacion del borrador) sirven como referencia para dimensionar despliegues en DGX Spark.

## Benchmarks y rendimiento

Mediciones publicadas por el autor con VeloBench contra la API servida en maquinas GB10 (7 de noviembre de 2026, builds de desarrollo de veloGB10 0.7.7), con muestreo de produccion, thinking activado y una peticion simultanea en las columnas de peticion unica. La decodificacion se expresa en tokens de salida por segundo e incluye decodificacion especulativa; una ejecucion por celda, con variacion aproximada del ±10 %.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP de HermiHg | 110 | 57 | 77 | 2.074 | 102 | 72,6 % |
| TP=2 | Cabeza MTP de HermiHg | 152 | 78 | 93 | 3.285 | 138 | 72,0 % |
| TP=4 | Cabeza MTP de HermiHg | 179 | 99 | 118 | 3.870 | 169 | 71,7 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 109,2 GB en disco; al ser un MoE cuantizado a 4 bpw, la carga completa requiere del orden de esa cifra de memoria agregada, aunque no se dispone de un desglose oficial de memoria en ejecucion.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas con paralelismo tensorial (TP=1, TP=2, TP=4).
- Cabe en GPU de consumo: no disponible; el tamano del paquete y el enfoque en GB10 no permiten confirmar compatibilidad con RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia y el unico probado por el autor. Al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no hay pruebas publicadas con vLLM, llama.cpp, Ollama o TGI.
- Throughput y latencia: segun la tabla anterior, la mediana de decodificacion va de 77 tok/s (TP=1) a 118 tok/s (TP=4), el prefill de 2.074 a 3.870 tok/s y el agregado con dos peticiones de 102 a 169 tok/s.
- Red: en TP=2 y TP=4 los nodos no necesitan copia del modelo; la cabeza envia a cada nodo solo su parte de pesos por red y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el enlace con `--rdma-dev <rail1>,<rail2>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Lygodactylus-FlashNext-Uncensored-4bpw-HermiHg-MTP (este) | 34.994.670.704 | 262.144 tokens configurados | EXL3 4 bpw + cabeza MTP 2,6 bpw | Qwen Community License 1.0 | Probado en veloGB10 sobre GB10; sin benchmarks academicos publicados |
| doth4580/Lygodactylus-FlashNext-Uncensored-4bpw | mismos pesos base | no disponible | EXL3 4 bpw, sin cabeza MTP | Qwen Community License 1.0 | Paquete base de este repositorio; misma salida, sin aceleracion especulativa |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | cabeza MTP (59 tensores no-expertos) | no aplica | safetensors EXL3, 2,6 bpw | Apache-2.0 | Origen de la cabeza borrador; anchos de experto mixtos no compatibles con el cargador EXL3 |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | no disponible | no disponible | Modelo base sin censura del que derivan los pesos |

## Limitaciones y advertencias

- La licencia es la Qwen Community License 1.0, no una licencia permisiva; el uso comercial esta sujeto a sus terminos y conviene revisarlos antes de desplegar en produccion.
- El paquete combina pesos de tres fuentes con licencias distintas (Qwen Community License 1.0 para el modelo, Apache-2.0 para la cabeza MTP de HermiHg); el autor declara no reclamar propiedad intelectual sobre el modelo ni sus pesos.
- Es una variante sin censura: reduce los rechazos del modelo original, lo que incrementa el riesgo de generar contenido inapropiado o no conforme a politicas si no se anaden filtros propios.
- Riesgo de alucinacion: no disponible en la informacion proporcionada; no hay evaluaciones de fidelidad publicadas.
- Sesgos conocidos: no disponible; no se documentan evaluaciones de sesgo.
- Idiomas soportados: no disponible, lo que impide garantizar calidad multilingue.
- La cabeza MTP solo acelera; no altera la salida, pero las tasas de aceptacion medidas (en torno al 72 %) proceden de una unica ejecucion por celda con variacion del ±10 %, por lo que deben tomarse como orientativas.
- El motor de referencia es veloGB10, en builds de desarrollo (0.7.7); no hay pruebas publicadas con otros frameworks, y la compatibilidad con vLLM, llama.cpp o TGI no esta verificada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni idiomas listados; se trata de un artefacto reciente y poco validado por la comunidad.
- El rendimiento medido corresponde a hardware GB10; extrapolar esas cifras a otras GPU no es fiable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-4bpw-HermiHg-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-4bpw
- Cuantizacion EXL3 de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
- Modelo sin censura de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
