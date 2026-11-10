# doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-5.05bpw-HermiHg-MTP es un paquete de pesos cuantizados del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 de 5,05 bits por peso (rama `5.05bpw_h6_ng6`) realizada por turboderp con exllamav3, a la que se le anade una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 42.052.573.952 parametros totales, segun los safetensors del repositorio.

La relevancia de este paquete es operativa: esta disenado y probado para el motor de inferencia veloGB10 sobre nodos NVIDIA DGX Spark / GB10, con soporte de tensor parallelism en 2 o 4 maquinas y una ventana de contexto configurable de hasta 262.144 tokens. La inclusion de la cabeza MTP permite acelerar la decodificacion sin alterar la salida, ya que cada token propuesto se verifica contra el modelo completo.

El repositorio ocupa 123,3 GB y se distribuye bajo la licencia Qwen Community License 1.0. No es un modelo para ejecutar en una sola GPU de consumo: el propio autor indica que el paquete no cabe en un unico GB10 de 128 GB junto con su memoria de trabajo, por lo que requiere al menos dos nodos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con capa MTP para decodificacion especulativa |
| Parametros totales | 42.052.573.952 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 262.144 tokens (configurado con `--max-seq-len 262144` en veloGB10) |
| Tipos de cuantizacion | EXL3 a 5,05 bits por peso (variante `5.05bpw_h6_ng6`); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (formato EXL3 de ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura transformer con capas de mezcla de expertos (MoE), segun las etiquetas del repositorio (`moe`) y la presencia de expertos enrutados en la capa MTP. El paquete anade una capa de prediccion multi-token (MTP) que actua como cabeza de borrador para decodificacion especulativa: propone varios tokens candidatos que el modelo completo verifica despues, de modo que la cabeza solo afecta a la velocidad y nunca al contenido generado.

Sobre el entrenamiento del modelo original no se dispone de informacion en los datos proporcionados: no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica documentada en este repositorio es la integracion de la cabeza MTP de HermiHg: se copian byte a byte los 59 tensores no-expertos de su fichero `mtp-2.6bpw.safetensors` (licencia Apache-2.0), mientras que los expertos enrutados de la capa MTP se mantienen del propio paquete EXL3. No se usa el fichero completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa, algo que el cargador de EXL3 no acepta. Los pesos cuantizados se redistribuyen sin conversion, recuantizacion ni reempaquetado.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de proposito general, aunque no se documentan capacidades especificas en la informacion disponible.
- Decodificacion especulativa con cabeza MTP: activable con `--mtp=auto` en veloGB10, con tasas de aceptacion del borrador medidas del 69,8 % (TP=2) y 71,9 % (TP=4).
- Procesamiento de contexto largo: soporta hasta 262.144 tokens de secuencia con cache de prefijos (`--prefix-cache on`).
- Servicio de API compatible con OpenAI en el endpoint `/v1`, lo que facilita la integracion con clientes existentes.
- Ejecucion distribuida con tensor parallelism en 2 o 4 nodos GB10, con transferencia de pesos por red y cache local en cada nodo.
- Capacidades de tool calling, agentes, vision, audio o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia en cluster de DGX Spark: el paquete esta pensado para servirse con veloGB10 en 2 o 4 nodos GB10, con un servidor OpenAI-compatible en el puerto 9000, lo que permite exponer el modelo a aplicaciones internas sin infraestructura adicional.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y cache de prefijos, resulta adecuado para analizar expedientes, contractos o bases de codigo extensas en una sola peticion.
- Asistentes conversacionales de baja latencia: la cabeza MTP eleva la decodificacion a 133 tok/s en turnos de codigo con TP=2 y 169 tok/s con TP=4, util para interacciones en tiempo real.
- Generacion de codigo en pipelines internos: el formato EXL3 y la API compatible con OpenAI permiten integrarlo en herramientas de CI/CD o asistentes de IDE desplegados en la propia red.
- Evaluacion e investigacion de decodificacion especulativa: el paquete permite comparar el rendimiento con y sin la cabeza MTP (existe una variante sin ella en doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw) y medir tasas de aceptacion del borrador.
- Despliegue por lotes con concurrencia limitada: con `--max-batch 2` y una mediana agregada de 121 tok/s (TP=2) o 150 tok/s (TP=4) en dos peticiones simultaneas, encaja en cargas de trabajo moderadas con requisitos de contexto alto.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de velocidad del autor con veloGB10 0.7.7 sobre GB10 (DGX Spark), con muestreo de produccion, thinking activado y una ejecucion por celda (variacion aproximada de mas o menos 10 %):

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza MTP de HermiHg | 133 | 69 | 82 | 3.018 | 121 | 69,8 % |
| TP=4 | Cabeza MTP de HermiHg | 169 | 90 | 110 | 3.693 | 150 | 71,9 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM: el repositorio ocupa 123,3 GB en disco; el autor indica que el paquete no cabe en un unico GB10 de 128 GB junto con su memoria de trabajo, por lo que se necesita un minimo de dos nodos.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 2 o 4 maquinas con tensor parallelism (TP=2 o TP=4).
- GPU de consumo: no es viable en RTX 4090 ni en tarjetas consumer convencionales, ni por tamano ni por el formato EXL3 orientado a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y recomendado; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se documenta soporte verificado en otros motores.
- Red: los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo su parte de los pesos y este la cachea localmente. En equipos con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: prefill de 3.018 tok/s (TP=2) y 3.693 tok/s (TP=4); decodificacion mediana de 82 tok/s (TP=2) y 110 tok/s (TP=4); `--max-batch 2`, `--max-tokens 65536` y `--prefix-cache on` en la configuracion probada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-HermiHg-MTP | 42,05 mil millones | 262.144 tokens | EXL3 5,05 bpw + MTP 2,6 bpw | Qwen Community 1.0 | Incluye cabeza MTP; probado en veloGB10 TP=2/TP=4 |
| doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw | 42,05 mil millones | no disponible | EXL3 5,05 bpw | Qwen Community 1.0 | Mismos pesos sin cabeza MTP; menor velocidad de decodificacion |
| Qwen/Qwen3.8-Flash-Next | 42,05 mil millones (segun safetensors del paquete) | no disponible | pesos originales | Qwen Community 1.0 | Modelo base sin cuantizar |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 2,6 bpw (solo cabezas) | Apache-2.0 | Repositorio de cabezas MTP optimizadas, no un modelo completo |

No se dispone de datos de rendimiento de calidad para establecer una comparacion funcional con modelos de la misma categoria.

## Limitaciones y advertencias

- El paquete no cabe en un solo GB10; requiere al menos dos nodos y configuracion de red (RoCE) para el reparto de pesos.
- Es una redistribucion de pesos cuantizados: no se ha reentrenado ni ajustado el modelo, y la cuantizacion a 5,05 bpw puede introducir perdida de precision respecto a los pesos originales, aunque no se cuantifica en la informacion disponible.
- La cabeza MTP solo acelera la decodificacion; no mejora la calidad y su tasa de aceptacion (alrededor del 70 %) implica que parte de los tokens propuestos se descartan.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion proporcionada.
- La licencia Qwen Community License 1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo antes de un despliegue en produccion.
- El soporte verificado se limita a veloGB10 0.7.7 en desarrollo; otros motores que lean EXL3 no estan probados con este paquete.
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con variacion de aproximadamente el 10 %, por lo que deben tomarse como orientativas.
- El autor no reclama propiedad intelectual sobre el modelo ni los pesos; los derechos pertenecen a los autores originales y colaboradores bajo sus respectivas licencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-HermiHg-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
