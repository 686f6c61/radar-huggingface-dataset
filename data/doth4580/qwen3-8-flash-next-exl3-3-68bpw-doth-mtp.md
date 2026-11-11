# doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-3.68bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next del equipo Qwen, publicado por el usuario doth4580. No se trata de un modelo entrenado desde cero, sino de una redistribucion de la cuantizacion EXL3 de turboderp (variante `3.68bpw_h6_ng8`, generada con exllamav3) a la que se anade una cabeza de borrador (draft head) para decodificacion especulativa. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 31.129.576.192 parametros totales, segun los safetensors del repositorio.

La aportacion propia del autor es `zz_mtp_head_doth.safetensors`, una re-cuantizacion de las 59 tensores no-expertos de su cabeza MTP (multi-token prediction) re-destilada, adaptada al layout y anchos de la cabeza optimizada de HermiHg. Esta cabeza permite decodificacion especulativa: acelera la generacion sin alterar la salida, ya que cada token propuesto se verifica contra el modelo completo.

El paquete esta pensado y probado principalmente para el motor de inferencia veloGB10 (`gb10_inference`) sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10, con servidor compatible con la API de OpenAI. Al ser formato EXL3 estandar, cualquier framework que lea dicho formato puede cargarlo. El interes practico esta en desplegar un MoE de 31B con contexto de 262.144 tokens en hardware de clase workstation con memoria unificada, apoyandose en la decodificacion especulativa para recuperar velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 31.129.576.192 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun los comandos de referencia de veloGB10 con `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 3,68 bits por peso (variante `3.68bpw_h6_ng8` de turboderp); cabeza MTP cuantizada con exllamav3 1.5.3 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); cabeza optimizada de HermiHg bajo Apache-2.0 |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-Flash-Next, es un transformer con capas MoE (mezcla de expertos) segun las etiquetas del repositorio (`moe`). No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, el ratio de activacion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta el mecanismo de atencion ni innovaciones de arquitectura mas alla de la mencion a `qwen4_exp` en las etiquetas.

La innovacion tecnica del paquete es la integracion de una cabeza MTP para decodificacion especulativa. El autor re-destilo su propia cabeza Flash-Next MTP (`doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16`) y la cuantizo al layout de la cabeza optimizada de HermiHg, conservando los bytes originales de la proyeccion del indexer porque su entrenamiento mantuvo los pesos de fabrica en esa parte. Los 59 tensores no-expertos de la cabeza se mapean mediante `model.safetensors.index.json`, mientras que los expertos enrutados de la capa MTP permanecen en el pack original. La cuantizacion de los pesos principales es byte-identica al pack de turboderp: no se reconvirtio ni recuantizo ningun fichero.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es de proposito general y el autor indica que las pruebas se hicieron con "thinking on", lo que sugiere un modo de razonamiento extendido.
- Decodificacion especulativa: la cabeza MTP incluida permite proponer tokens que el modelo completo verifica, acelerando la generacion sin cambiar la salida.
- Contexto largo: soporta hasta 262.144 tokens de secuencia segun la configuracion de referencia del motor veloGB10.
- Servicio compatible con la API de OpenAI: el motor veloGB10 expone endpoints en `/v1`, lo que facilita la integracion con clientes existentes.
- Procesamiento por lotes: `--max-batch` permite atender varias peticiones simultaneas (las mediciones usan 2 peticiones agregadas).
- Cache de prefijos: `--prefix-cache on` habilita reutilizacion de prefijos comunes entre peticiones.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling, function calling y uso como agente: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en DGX Spark / GB10: el pack esta probado sobre una, dos o cuatro maquinas GB10 con el motor veloGB10. En una sola maquina ofrece 65 tok/s de mediana de decodificacion y 1.753 tok/s de prefill; en cuatro, 110 tok/s y 3.296 tok/s. Es el escenario para el que fue construido.
- Servicio de API compatible con OpenAI en infraestructura propia: al exponer `http://<head-ip>:9000/v1`, se puede conectar a clientes y SDKs existentes sin adaptadores, usando contexto de 262.144 tokens para conversaciones o documentos largos.
- Analisis de documentos extensos: con 262.144 tokens de ventana y cache de prefijos, es adecuado para resumir o consultar contratos, informes o bases de codigo que no caben en modelos de contexto corto.
- Generacion de codigo interactiva: las mediciones del autor reportan 100 tok/s en turnos de codigo con una GB10 y 159 tok/s con cuatro, lo que lo hace viable para asistentes de programacion en tiempo real.
- Razonamiento multi-turno con modo thinking: las pruebas se ejecutaron con el modo de razonamiento activo, apto para tareas que requieren cadenas de pensamiento antes de responder.
- Clustering de maquinas para mayor rendimiento: el motor reparte los pesos por red y los cachea en cada nodo, de modo que un segundo arranque del mismo modelo no transfiere nada; util para escalar capacidad sin duplicar almacenamiento.
- Evaluacion de decodificacion especulativa: la cabeza MTP incluida permite medir tasas de aceptacion (70,9% en TP=1, 72,9% en TP=4) y comparar estrategias de aceleracion sobre el mismo modelo.

## Benchmarks y rendimiento

Mediciones del autor con veloGB10 sobre maquinas NVIDIA DGX Spark / GB10 (2026-11-06, builds de desarrollo 0.7.7), con muestreo de produccion, thinking activo y una peticion a la vez en las columnas de peticion unica. La decodificacion incluye decodificacion especulativa. Una ejecucion por celda, con variacion aproximada de mas o menos 10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de relato (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 100 | 53 | 65 | 1.753 | 83 | 70,9% |
| TP=2 | Cabeza DotH-MTP | 136 | 73 | 92 | 2.793 | 125 | 72,4% |
| TP=4 | Cabeza DotH-MTP | 159 | 95 | 110 | 3.296 | 152 | 72,9% |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 114,3 GB en disco; con cuantizacion de 3,68 bits por peso sobre 31.129.576.192 parametros, el peso de los tensores ronda los 14,3 GB, aunque el total real en memoria debe sumar cabeceras, cache KV para 262.144 tokens y overhead del motor. No se dispone de una cifra oficial de VRAM.
- GPU recomendadas: NVIDIA DGX Spark / GB10 (memoria unificada), en configuraciones de 1, 2 o 4 maquinas. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: motor principal veloGB10 (`gb10_inference`), con servidor compatible con OpenAI. Al ser formato EXL3 estandar, cualquier framework que lea EXL3 puede cargarlo, aunque no se enumeran alternativas probadas.
- Red: para TP=2 y TP=4 los nodos se comunican por RoCE; con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`, con un solo par se detecta automaticamente.
- Latencia y throughput: prefill de 1.753 tok/s (TP=1) a 3.296 tok/s (TP=4); decodificacion mediana de 65 tok/s (TP=1) a 110 tok/s (TP=4); agregado con 2 peticiones de 83 tok/s (TP=1) a 152 tok/s (TP=4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-DotH-MTP | 31,1B | 262.144 | EXL3 3,68 bpw + cabeza MTP | qwen-community-1.0 | Incluye cabeza de decodificacion especulativa; probado en veloGB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw | 31,1B | no disponible | EXL3 3,68 bpw | qwen-community-1.0 | Mismos pesos sin la cabeza MTP; menor velocidad |
| turboderp/Qwen3.8-Flash-Next-exl3 | 31,1B | no disponible | EXL3 (varias variantes) | qwen-community-1.0 | Cuantizacion original de referencia |
| Qwen/Qwen3.8-Flash-Next | 31,1B | no disponible | BF16 (original) | qwen-community-1.0 | Modelo base sin cuantizar; mayor huella de memoria |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de las mediciones de velocidad del propio autor.

## Limitaciones y advertencias

- Es una cuantizacion a 3,68 bits por peso: puede producir degradacion de calidad frente al modelo en BF16, especialmente en tareas sensibles a precision numerica.
- La cabeza MTP solo afecta a la velocidad, nunca a la salida, porque cada token propuesto se verifica contra el modelo completo; no debe interpretarse como una mejora de calidad.
- El paquete esta optimizado y probado unicamente con veloGB10 sobre GB10; el rendimiento en otros motores o GPUs no esta documentado.
- Las mediciones tienen una ejecucion por celda y una variacion de aproximadamente mas o menos 10%, por lo que son orientativas.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni comportamiento multilingue del modelo base.
- La licencia Qwen Community License 1.0 puede imponer condiciones al uso comercial; debe revisarse el texto completo antes de desplegar en produccion.
- La cabeza optimizada de HermiHg esta bajo Apache-2.0, licencia distinta de la del modelo base; conviene verificar el cumplimiento de ambas.
- El autor no reclama propiedad intelectual sobre el modelo, los pesos ni la arquitectura; los derechos quedan en manos de los autores originales y colaboradores.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw-DotH-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
