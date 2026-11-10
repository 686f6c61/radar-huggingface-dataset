# doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-HermiHg-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-3.68bpw-HermiHg-MTP es un empaquetado de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo nuevo ni de un ajuste fino: es una redistribucion byte a byte de la cuantizacion EXL3 de turboderp (rama `3.68bpw_h6_ng8`, 3,68 bits por peso) a la que se ha anadido una cabeza de borrador (draft head) MTP optimizada por HermiHg para decodificacion especulativa.

El paquete esta pensado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10, con el objetivo de servir el modelo con contexto largo (hasta 262.144 tokens) y decodificacion especulativa activada. Los pesos siguen el formato estandar EXL3 de ExLlamaV3, por lo que cualquier framework compatible puede cargarlos, aunque las pruebas y comandos documentados son los de veloGB10.

El modelo subyacente es un transformer MoE de 31.129.576.192 parametros totales, con licencia Qwen Community 1.0. La relevancia de este paquete es practica: permite ejecutar un modelo de esa escala en hardware de escritorio de gama alta (GB10) con throughput medido y aceptacion de borrador del orden del 72-73%, algo que no esta disponible en el checkpoint original sin cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capa MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 31.129.576.192 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun configuracion de veloGB10 documentada) |
| Tipos de cuantizacion | EXL3 a 3,68 bpw (variante `3.68bpw_h6_ng8`); cabeza MTP a 2,6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (cabeza MTP: Apache-2.0) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos (MoE) segun la etiqueta `moe` del repositorio. Incluye una capa de prediccion multi-token (MTP) que actua como cabeza de borrador para decodificacion especulativa: el modelo propone varios tokens candidatos y el modelo completo los verifica, de modo que la cabeza solo afecta a la velocidad y nunca a la salida. En este paquete, los 59 tensores no-expertos de la cabeza MTP provienen del archivo `mtp-2.6bpw.safetensors` de HermiHg (Apache-2.0), copiados byte a byte; los expertos enrutados de la capa MTP se mantienen del propio pack EXL3. No se usa el archivo completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa y el cargador EXL3 no lo acepta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento en la informacion proporcionada. La cuantizacion fue realizada por turboderp con exllamav3 sobre la revision `6aee1ffef2c5` de su repositorio, y el empaquetado final no ha reconvertido, recuantizado ni reempaquetado ningun archivo de pesos.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (la configuracion de pruebas usa thinking activado).
- Generacion de codigo, con rendimiento de decodificacion medido especificamente en turnos de codigo (101-161 tok/s segun topologia).
- Decodificacion especulativa mediante cabeza MTP integrada, activable con `--mtp=auto`.
- Soporte de contexto largo: hasta 262.144 tokens de secuencia maxima en la configuracion documentada.
- Servido mediante API compatible con OpenAI en `/v1`.
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto entre peticiones.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia en clústeres DGX Spark: el paquete esta disenado para desplegarse en una, dos o cuatro maquinas GB10 con tensor parallelism (TP=1/2/4), enviando a cada nodo solo su parte de los pesos por red y cacheandola localmente, lo que permite escalar throughput sin duplicar el modelo en disco.
- Analisis de documentos largos: con 262.144 tokens de contexto y cache de prefijos, es adecuado para resumir o consultar repositorios de codigo, expedientes o corpus extensos en una sola ventana sin truncamiento.
- Asistencia de programacion con baja latencia: los turnos de codigo alcanzan 101 tok/s en una GB10 y 161 tok/s en cuatro, suficiente para autocompletado y generacion de parches en entornos interactivos.
- Despliegue en hardware de gama alta de escritorio: al ocupar 114,3 GB en disco en formato EXL3 a 3,68 bpw, cabe en un unico GB10 con 128 GB de memoria unificada, evitando la necesidad de GPUs de centro de datos.
- Evaluacion e investigacion de decodificacion especulativa: el paquete incluye una cabeza MTP con tasa de aceptacion medida del 72,5-72,9%, util para reproducir experimentos de draft heads y comparar estrategias de borrador.
- Backend compatible con OpenAI para aplicaciones existentes: el servidor expone `/v1`, por lo que clientes que ya usan la API de OpenAI pueden apuntar a `http://<head-ip>:9000/v1` sin cambios de codigo.
- Procesamiento por lotes con concurrencia limitada: `--max-batch 2` y el modo de dos peticiones agregadas (84-155 tok/s segun topologia) permiten servir cargas moderadas con una sola instancia.

## Benchmarks y rendimiento

Resultados medidos con veloGB10 0.7.7 (builds de desarrollo) sobre maquinas NVIDIA DGX Spark / GB10, entre el 5 y el 6 de noviembre de 2026, con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de peticion unica. Una ejecucion por celda; la variacion del muestreo es de aproximadamente ±10%.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP HermiHg | 101 | 55 | 62 | 1.755 | 84 | 72,9% |
| TP=2 | Cabeza MTP HermiHg | 133 | 75 | 87 | 2.776 | 122 | 72,5% |
| TP=4 | Cabeza MTP HermiHg | 161 | 94 | 114 | 3.295 | 155 | 72,8% |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 114,3 GB en disco; con pesos EXL3 a 3,68 bpw el modelo cabe en un unico GB10 con memoria unificada de 128 GB.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de 1, 2 o 4 maquinas con tensor parallelism.
- Cabe en consumer GPU: no hay datos que confirmen su ajuste en GPUs de consumo tipo RTX 4090 (24 GB); el diseno apunta a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario autocontenido, servidor compatible con OpenAI); al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 podria cargarlo, aunque no se documentan pruebas con otros motores.
- Red: en TP=2/TP=4 los nodos no necesitan copia del modelo; la cabeza envia a cada nodo su parte de pesos por red con cache local. Soporta `--rdma-dev <rail1>,<rail2>` en maquinas con dos pares de puertos RoCE activos.
- Latencia y throughput: prefill de 1.755 tok/s (TP=1) a 3.295 tok/s (TP=4); decode mediano de 62 a 114 tok/s; agregado con dos peticiones de 84 a 155 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-HermiHg-MTP | 31,1 B (MoE) | 262.144 | EXL3 3,68 bpw + MTP 2,6 bpw | qwen-community-1.0 | Incluye cabeza MTP; probado en GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw | 31,1 B (MoE) | no disponible | EXL3 3,68 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; sin decodificacion especulativa |
| Qwen/Qwen3.8-Flash-Next | 31,1 B (MoE) | no disponible | pesos originales (sin cuantizar) | qwen-community-1.0 | Modelo base; mayor huella de memoria |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 con cabezas MTP optimizadas | Apache-2.0 | Solo cabezas MTP; no cargable completo en EXL3 por anchos de experto mezclados |

No se dispone de datos de rendimiento de calidad para establecer comparaciones con modelos de otras familias de tamano similar.

## Limitaciones y advertencias

- No es un modelo original: es una redistribucion de pesos cuantizados mas una cabeza de borrador; los derechos de propiedad intelectual pertenecen a los autores originales y contribuyentes, bajo sus respectivas licencias.
- La licencia Qwen Community 1.0 puede imponer restricciones al uso comercial; debe revisarse el enlace de licencia antes de desplegar en produccion.
- La cabeza MTP solo afecta a la velocidad, nunca a la salida; aun asi, toda salida debe validarse por el modelo completo, lo que implica coste computacional adicional.
- La cabeza MTP de HermiHg no se usa completa: sus anchos de experto mezclados no son aceptados por el cargador EXL3, por lo que solo se incorporan los 59 tensores no-expertos.
- Los benchmarks de rendimiento proceden de una unica ejecucion por celda con builds de desarrollo de veloGB10, con variacion de ±10%; no deben interpretarse como cifras estables de produccion.
- No hay informacion sobre sesgos, riesgo de alucinacion, idiomas soportados ni calidad en tareas especificas (razonamiento, matematicas, codigo) en la documentacion proporcionada.
- El soporte de tool calling, agentes y vision no esta documentado; no debe asumirse su disponibilidad.
- El despliegue multi-nodo depende de conectividad de red (RoCE) y de la correcta configuracion de `--rdma-dev` en maquinas con multiples pares de puertos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-HermiHg-MTP
- Pack base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
