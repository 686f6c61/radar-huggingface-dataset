# rlaope/Ripple-65B-Spark-Server

## Resumen

Ripple-65B Spark Server es un kit de despliegue, no un modelo con pesos propios: un repositorio que automatiza la puesta en marcha de un servidor compatible con la API de OpenAI para el checkpoint Ripple-65B Preview en formato NVFP4, desarrollado por Ricursive Intelligence, sobre una unica maquina NVIDIA GB10 / DGX Spark. Lo publica el usuario rlaope bajo licencia Apache 2.0 y su valor esta en empaquetar el motor de inferencia `spark.py` de Ricursive detras de un servidor HTTP con `/v1/chat/completions`, cache de prefijos, decodificacion especulativa ajustada y soporte de tool calling y streaming.

El modelo subyacente es un transformer denso de 65.000 millones de parametros cuantizado a NVFP4 (formato de 4 bits de NVIDIA), lo que reduce el peso en disco y en memoria a aproximadamente 65 GB segun la propia model card. Al ser denso, cada token generado requiere leer la totalidad de los pesos, lo que limita la velocidad de decodificacion convencional a unos 5 tok/s en un GB10, un equipo con ancho de banda de memoria restringido. La mayor parte del rendimiento observado proviene de DFlash2, un mecanismo de decodificacion especulativa que emplea un modelo borrador y que acelera mucho mas la generacion de codigo que la prosa.

La relevancia del repositorio es practica: convierte un motor offline sin API en un endpoint listo para agentes y aplicaciones, con mejoras medidas sobre la receta oficial de Ricursive (TTFT de 10,2 s a 1,0 s con cache de prefijos en prompts de 5,8K tokens, y de 23,9 a 52,3 tok/s agregados con tres peticiones concurrentes). Esta pensado para entornos de desarrollo y prototipado local en hardware Blackwell de gama de escritorio, no para despliegues de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (sin mezcla de expertos), checkpoint NVFP4 |
| Parametros totales | 65B (modelo base Ripple-65B Preview) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); no se documentan otras variantes |
| Idiomas soportados | no disponible; la model card advierte que con temperatura 1.0 las respuestas en idiomas distintos del ingles "se desmoronaban" |
| Licencia | Apache 2.0 (modelo, pesos y codigo Spark de Ricursive; el kit tambien Apache 2.0) |
| Formato de pesos | NVFP4 distribuido por Ricursive; el repositorio no contiene pesos, `setup.sh` los descarga (~65 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parametros. La model card no ofrece detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; toda esa informacion figura como no disponible. Lo unico documentado es el proceso de cuantizacion a NVFP4 y la existencia de un modelo borrador DFlash2 de Ricursive que se usa para decodificacion especulativa.

La contribucion tecnica del repositorio es de ingenieria de inferencia: envuelve `spark.py` en un servidor HTTP compatible con OpenAI, fija temperatura por defecto a 0 porque el checkpoint no incluye valores de muestreo, reduce los tokens borrador de 32 a 16 (la mayoria de pasos aceptan bastantes menos), activa la cache de prefijos por radix para reutilizar el prefill en conversaciones de agente y permite hasta 3 peticiones concurrentes, ya que el equipo esta limitado por ancho de banda y el batching sale casi gratis. Los ajustes se exponen mediante variables de entorno (`RIPPLE_DRAFT_TOKENS`, `RIPPLE_MAX_RUNNING`, `RIPPLE_RADIX`, `RIPPLE_PORT`, `RIPPLE_HOST`).

## Capacidades

- Generacion de texto y codigo: es el caso medido con mayor rendimiento (20-36 tok/s, media de 26,5 sobre tres prompts; 34-36 tok/s en un prompt de cache LRU).
- Razonamiento expuesto: el servidor devuelve `reasoning_content` en las respuestas, igual que el servidor original de Ricursive.
- Tool calling / function calling: soportado a traves de la API compatible con OpenAI.
- Streaming de respuestas: soportado en `/v1/chat/completions`.
- Uso como agente multi-paso: validado con Hermes Agent, que corrigio 4 tests fallidos en un repositorio pequeno en 1 minuto 36 segundos con 14 llamadas a herramientas.
- Cache de prefijos para agentes: reutiliza el prefijo largo que los agentes reenvian en cada turno, reduciendo el TTFT de 10,2 s a 1,0 s en prompts de 5,8K tokens.
- Monitorizacion: endpoint `GET /stats` con tok/s agregados del servidor, estado de GPU y memoria.
- Capacidades multilingues: no documentadas; el autor reporta degradacion en idiomas distintos del ingles con temperatura alta.

## Casos de uso

- Asistente de codigo en local: el modelo genera codigo a 20-36 tok/s en un unico GB10, suficiente para autocompletado y generacion de funciones en un IDE o en un pipeline de CI/CD que invoque el endpoint `/v1/chat/completions`.
- Agentes de correccion de tests: el escenario validado por el autor (Hermes Agent arreglando 4 tests en 1m 36s con 14 tool calls) se reproduce en flujos de integracion continua que necesiten un agente capaz de leer errores, editar ficheros y ejecutar comandos.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer una API compatible, cualquier cliente `openai` apunta a `http://127.0.0.1:30000/v1` sin cambios de codigo, lo que permite desarrollar y probar aplicaciones antes de migrar a un proveedor en la nube.
- Chat multi-turno con contexto largo: la cache de prefijos por radix mantiene el TTFT en torno a 1 s en prompts de casi 6K tokens, adecuado para asistentes documentales o de soporte interno que reenvian el mismo contexto en cada turno.
- Servicio en red local para un equipo pequeno: con `RIPPLE_HOST=0.0.0.0` y 3 peticiones concurrentes (52,3 tok/s agregados) puede dar servicio a un grupo reducido de desarrolladores sin autenticacion, en una red de confianza.
- Evaluacion de modelos en hardware Blackwell: util para investigadores que quieran medir el comportamiento de un 65B denso en NVFP4 y comparar la decodificacion especulativa con DFlash2 frente a decodificacion plana, con un benchmark incluido (`bench_speed.py`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los unicos datos son mediciones de velocidad del propio autor en un unico GB10 con temperatura 0:

| Metrica | Valor medido |
|---|---|
| Generacion de codigo | 20-36 tok/s (media 26,5; 34-36 en prompt LRU) |
| Prosa | ~9 tok/s |
| Time to first token (prompts cortos) | ~0,4 s |
| TTFT con cache de prefijos (prompt 5,8K) | 1,0 s (frente a 10,2 s sin cache) |
| Throughput con 3 peticiones concurrentes | 52,3 tok/s agregados (frente a 23,9) |
| Tokens borrador 32 a 16 | prosa 7,4 a 9,0 tok/s; codigo 23,2 a 24,5 tok/s |
| Decodificacion plana (sin especulativa) | ~5 tok/s (limite por ancho de banda) |
| Arranque en frio | ~11 min (compilacion de kernels); posteriores ~2 min |
| Consumo de GPU en ejecucion de agente | ~44 W |

## Requisitos de hardware

- VRAM/memoria: aproximadamente 65 GB de pesos NVFP4, mas overhead del modelo borrador DFlash2 y de la cache KV; el destino es un GB10 / DGX Spark con memoria unificada.
- GPU recomendadas: NVIDIA GB10 / DGX Spark es el unico hardware validado. No hay datos para A100, H100 ni RTX 4090.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 ni otras tarjetas consumer; NVFP4 y el codigo `spark.py` estan orientados a Blackwell.
- Despliegue: el kit usa SGLang y el motor `spark.py` de Ricursive a traves de `serve_http.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: TTFT ~0,4 s en prompts cortos, ~9 tok/s en prosa, 20-36 tok/s en codigo, 52,3 tok/s agregados con 3 usuarios.
- Almacenamiento y red: ~65 GB de descarga de pesos en `setup.sh`; puerto por defecto 30000.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de 65B en NVFP4 ni resultados frente a alternativas; el unico punto de referencia interno es la receta oficial de Ricursive para Spark, respecto a la cual este kit mejora TTFT, throughput concurrente y velocidad de prosa y codigo.

## Limitaciones y advertencias

- El repositorio no contiene pesos: depende de la descarga del checkpoint y del codigo de Ricursive, y de un parche (`spark.py.diff`) sobre su `spark.py`, por lo que cambios en el upstream pueden romper el kit.
- Modelo denso de 65B: cada token lee todos los pesos, lo que limita la decodificacion plana a ~5 tok/s en un GB10; el rendimiento depende criticamente de la decodificacion especulativa y favorece el codigo sobre la prosa.
- Idiomas: no hay lista de idiomas soportados y el autor reporta que con temperatura 1.0 las respuestas en idiomas distintos del ingles se degradan; el valor por defecto es temperatura 0, lo que reduce variedad.
- Sin autenticacion: si se expone con `RIPPLE_HOST=0.0.0.0`, cualquiera en la red local puede usar el endpoint.
- Arranque en frio de ~11 minutos por compilacion de kernels, poco adecuado para entornos efimeros o autoescalado.
- Solo 3 peticiones concurrentes por defecto; no hay datos de escalado mas alla de ese valor.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al ser un modelo de 65B sin benchmarks publicados, conviene evaluarlo en el dominio objetivo antes de usarlo en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el kit se distribuye tal cual.

## Enlaces

- Repositorio del kit: https://huggingface.co/rlaope/Ripple-65B-Spark-Server
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
