# doth4580/Lygodactylus-FlashNext-Uncensored-4bpw-DotH-MTP

## Resumen

Lygodactylus-FlashNext-Uncensored-4bpw-DotH-MTP es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 4 bits por peso (bpw) del modelo Qwen3.8-Flash-Next-Uncensored, una variante sin censura del Qwen3.8-Flash-Next del equipo Qwen. Lo publica el usuario doth4580 y combina tres piezas: la cuantizacion EXL3 realizada por Lygodactylus con exllamav3, los pesos del derivado sin censura de orcarouter y una cabeza de decodificacion especulativa (MTP, multi-token prediction) reentrenada por el propio doth4580 e integrada en el paquete.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales, segun los datos reales de los safetensors. El paquete esta pensado y probado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10, con servidor compatible con la API de OpenAI y soporte de cache de prefijos, decodificacion especulativa y despliegue tensor-parallel.

Su relevancia practica es doble: por un lado, ofrece una via de ejecucion de un MoE de ~35B en hardware de clase workstation GB10 con decodificacion especulativa ya incluida; por otro, la naturaleza "uncensored" del modelo base implica que los filtros de seguridad han sido reducidos o eliminados, lo que condiciona fuertemente su uso en produccion. La licencia declarada es la Qwen Community License 1.0, con la etiqueta `license: other` en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 34.994.670.704 (~35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion probada con `--max-seq-len 262144`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 4 bpw (ExLlamaV3); pesos BF16 disponibles en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | safetensors en formato EXL3 (exl3), con `model.safetensors.index.json` y cabeza MTP en `zz_mtp_head_doth.safetensors` |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) del linaje Qwen3.8-Flash-Next, con una capa MTP (multi-token prediction) que actua como cabeza de borrador para decodificacion especulativa. El paquete no entrena el modelo principal: redistribuye byte a byte la cuantizacion EXL3 4 bpw de Lygodactylus y anade una cabeza MTP reentrenada por doth4580, cuantizada con exllamav3 1.5.3 a la disposicion y anchos de la cabeza optimizada de HermiHg. La proyeccion del indexer de esa cabeza son los bytes de HermiHg sin modificar, mientras que los expertos enrutados de la capa MTP permanecen los del propio paquete.

Sobre el entrenamiento del modelo base no se aporta informacion en la documentacion disponible: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO. La variante sin censura de orcarouter tampoco documenta su proceso de ajuste en la informacion proporcionada. La innovacion tecnica destacable del paquete es la integracion de la cabeza MTP para decodificacion especulativa: cada token borrador se verifica contra el modelo completo, de modo que la cabeza afecta solo a la velocidad y nunca a la salida, con tasas de aceptacion medidas en torno al 70%.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (el sampling de produccion usado en las pruebas activa el razonamiento).
- Generacion de codigo: las pruebas de rendimiento incluyen turnos de codigo con decodificacion de 113 a 192 tok/s segun topologia.
- Mezcla de expertos con enrutamiento por token (arquitectura MoE del linaje Qwen3.8-Flash-Next).
- Decodificacion especulativa mediante cabeza MTP integrada, con aceptacion de borradores cercana al 70%.
- Servicio mediante API compatible con OpenAI (endpoint `/v1`), lo que habilita integracion con clientes y SDK estandar.
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto en conversaciones multi-turno.
- Despliegue multi-nodo con tensor parallelism (TP=1, TP=2, TP=4) y transferencia de pesos por red con cache local en cada nodo.
- Comportamiento sin censura: el modelo base ha reducido o eliminado los filtros de seguridad, lo que amplia el rango de respuestas generadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia de un MoE de ~35B en un unico DGX Spark: con TP=1 y el paquete EXL3 4 bpw se obtienen unos 70 tok/s de mediana de decodificacion y 2.073 tok/s de prefill, suficiente para asistentes interactivos en una sola maquina GB10.
- Servicio de API compatible con OpenAI para equipos internos: el servidor de veloGB10 expone `/v1`, de modo que herramientas que ya consumen la API de OpenAI pueden apuntar al endpoint sin cambios de codigo.
- Generacion de codigo asistida en flujos de desarrollo: los turnos de codigo alcanzan 113 tok/s en TP=1 y 192 tok/s en TP=4, con contexto de hasta 262.144 tokens para repositorios o archivos largos.
- Escalado horizontal en cluster de GB10: con TP=4 el agregado a dos peticiones concurrentes llega a 174 tok/s y el prefill a 3.924 tok/s, adecuado para servir a varios usuarios internos sobre cuatro maquinas.
- Procesamiento de documentos largos: la ventana configurada de 262.144 tokens y la cache de prefijos permiten analizar contratos, informes o bases de codigo extensas reutilizando el prefijo entre consultas.
- Investigacion sobre decodificacion especulativa: el paquete incluye la cabeza MTP y datos medidos de aceptacion (~70%), util para estudiar el equilibrio entre velocidad de decodificacion y verificacion.
- Experimentacion con modelos sin censura en entornos controlados: para estudiar comportamiento del modelo sin filtros de seguridad en laboratorio, con las salvaguardas y advertencias que se detallan mas abajo.

## Benchmarks y rendimiento

Rendimiento medido con veloGB10 (VeloBench) sobre maquinas NVIDIA DGX Spark / GB10, el 2026-11-07, con builds de desarrollo de veloGB10 0.7.7 y sampling de produccion (thinking activado, una peticion a la vez en las columnas de peticion unica). Decodificacion en tokens de salida por segundo, incluida la decodificacion especulativa. Una ejecucion por celda; la variacion por muestreo es de aproximadamente ±10%.

| Topologia | Fuente del borrador | Decodificacion turno de codigo | Decodificacion turno de relato | Mediana decodificacion (todos los turnos) | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 113 | 58 | 70 | 2.073 | 95 | 70,7% |
| TP=2 | Cabeza DotH-MTP | 151 | 78 | 96 | 3.297 | 140 | 70,8% |
| TP=4 | Cabeza DotH-MTP | 192 | 98 | 117 | 3.924 | 174 | 69,8% |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 109,2 GB en disco; con cuantizacion EXL3 4 bpw sobre ~35B parametros, la huella de pesos ronda los 17-18 GB, aunque el tamano del repo incluye pesos adicionales y la cabeza MTP. No se detalla el consumo exacto de VRAM en la informacion proporcionada.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuracion de una, dos o cuatro maquinas. Es el hardware sobre el que se ha probado y medido.
- Cabe en GPU de consumo: no disponible. El paquete esta orientado a GB10; no se documenta su ejecucion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: veloGB10 (`gb10_inference`), motor principal y probado; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 puede cargarlo (no se enumeran otros frameworks probados).
- Multi-nodo: TP=2 y TP=4 con nodos que no necesitan copia del modelo; el nodo principal envia a cada nodo su parte de los pesos por red y la mantiene en cache local. Soporte de RoCE con `--rdma-dev` para seleccionar el par de puertos.
- Latencia y throughput: medidos en la tabla anterior, con 70 tok/s de mediana en TP=1 y 117 tok/s en TP=4; prefill de 2.073 a 3.924 tok/s.
- Parametros de servicio probados: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Lygodactylus-FlashNext-Uncensored-4bpw-DotH-MTP (este) | ~35B (MoE) | 262.144 configurados | EXL3 4 bpw + cabeza MTP | Qwen Community License 1.0 | Paquete para veloGB10 con decodificacion especulativa |
| doth4580/Lygodactylus-FlashNext-Uncensored-4bpw | ~35B (MoE) | no disponible | EXL3 4 bpw | Qwen Community License 1.0 | Mismos pesos sin la cabeza MTP; solo cambia la velocidad |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | ~35B (MoE) | no disponible | BF16 (modelo base) | Qwen Community License 1.0 | Derivado sin censura del que procede este paquete |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | BF16 | Qwen Community License 1.0 | Modelo original del equipo Qwen; version con filtros de seguridad |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: el ajuste de orcarouter reduce o elimina los filtros de seguridad del Qwen3.8-Flash-Next original. Puede generar contenido ofensivo, ilegal o danino y no es apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni de tasas de alucinacion; al ser un modelo sin censura y sin benchmarks publicados, la verificacion de salidas es responsabilidad del operador.
- Idiomas soportados no documentados: no se especifica la cobertura multilingue del modelo base ni de la variante sin censura.
- Licencia: Qwen Community License 1.0 con etiqueta `license: other`. Es necesario revisar los terminos del enlace de licencia antes de cualquier uso comercial; no se garantiza compatibilidad con todos los escenarios de produccion.
- Paquete derivado de terceros: los pesos cuantizados son de Lygodactylus, la cabeza MTP optimizada de HermiHg (Apache-2.0) y el modelo sin censura de orcarouter; conviene verificar la cadena de licencias de cada componente.
- Hardware especifico: probado unicamente en GB10 con veloGB10; el rendimiento en otras GPU o frameworks no esta documentado y puede diferir.
- Precision de las mediciones: una ejecucion por celda con variacion de ±10% por muestreo; los numeros de throughput no deben tratarse como garantias.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-09; es un paquete reciente y poco validado por la comunidad.
- Decodificacion especulativa: la cabeza MTP solo afecta a la velocidad; sin ella, el comportamiento es el del paquete base, pero su integracion anade complejidad de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-4bpw-DotH-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-4bpw
- Cuantizacion EXL3 original de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-4bpw
- Modelo sin censura de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cabeza MTP reentrenada (BF16): https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3 (herramienta de cuantizacion): https://github.com/turboderp-org/exllamav3
