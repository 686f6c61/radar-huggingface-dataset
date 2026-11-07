# loom-fun/bartowski-Qwen2.5-0.5B-Instruct-loom

## Resumen

`loom-fun/bartowski-Qwen2.5-0.5B-Instruct-loom` es un paquete de despliegue para el runtime AMD Loom, no un modelo nuevo. Empaqueta el checkpoint GGUF sin modificar `Qwen2.5-0.5B-Instruct-Q4_K_M.gguf` de bartowski (a su vez una cuantizacion del Qwen2.5-0.5B-Instruct original de Alibaba Qwen) junto con un fichero `model.json` y programas `.loom` generados con el flujo `loom-skills`. El objetivo es servir ese GGUF concreto sobre GPUs integradas AMD Radeon 8060S (plataforma "Strix Halo", gfx1151) mediante `loom-serve`, exponiendo una API compatible con OpenAI.

El modelo subyacente es un transformer decoder-only denso de 0,5 mil millones de parametros, ajustado por instrucciones, con una ventana de contexto que el paquete Loom limita a 32.768 tokens por peticion. La relevancia de esta ficha no esta en el modelo en si (Qwen2.5-0.5B-Instruct es bien conocido y muy pequeno) sino en el paquete de inferencia: incluye decodificacion especulativa por n-gram lookup activada por defecto, soporte de tool calling estilo OpenAI y una bateria de puertas de correctitud que comparan la salida con llama.cpp sobre el mismo GGUF.

El autor publica cifras de rendimiento medidas el 2026-11-07 en un Ryzen AI Max+ 395 con Radeon 8060S, con mejoras de hasta +119 % en prefill frente a llama.cpp y una perdida del 6 % en decodificacion a 32k de contexto. El paquete esta pensado para entornos de borde y estaciones de trabajo AMD, no para servidores con GPUs discretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), empaquetado para runtime Loom |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por peticion (segun paquete Loom) |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido); otras cuantizaciones del base no empaquetadas |
| Idiomas soportados | no disponible (heredados del Qwen2.5-0.5B-Instruct original; el paquete no los declara) |
| Licencia | no disponible (el paquete no la declara; el base Qwen2.5-0.5B-Instruct usa Apache 2.0) |
| Formato de pesos | GGUF (`Qwen2.5-0.5B-Instruct-Q4_K_M.gguf`) mas `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5B parametros desarrollado por Alibaba Qwen y ajustado por instrucciones. Esta ficha no dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO; esa informacion pertenece a la model card original de Qwen, no incluida en la informacion proporcionada.

La innovacion tecnica de este paquete no esta en los pesos sino en el runtime Loom. Incluye decodificacion especulativa por n-gram prompt lookup con profundidad 2, activada por defecto, que propone tokens candidatos basandose en coincidencias con el prompt y los verifica en un solo paso. Segun las mediciones del autor, la tasa de aceptacion de tokens propuestos varia mucho con el contexto: 11 % en decodificacion corta, 64 % a 2k y 82 % a 32k. El paquete tambien incorpora kernels generados y validados contra implementaciones de referencia (38/38 tests superados) y una capa de servidor compatible con `/v1/chat/completions`.

## Capacidades

- Generacion de texto y respuestas conversacionales multi-turno, heredadas de Qwen2.5-0.5B-Instruct.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls` en las respuestas.
- Bucle de agente multi-turno con renderizado exacto del prompt, reutilizacion de historial y llamadas a herramientas validas (puerta `agent` superada).
- Muestreo configurable: `temperature`, `top_p`, `top_k` y `seed`.
- Concurrencia de hasta 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas.
- Limite de 4.096 tokens de salida por peticion (preset `max_tokens`).
- Sin modo de razonamiento o thinking (no soportado).
- Sin entrada de imagen ni audio (no soportado).
- Capacidades multilingues: no declaradas en el paquete; dependen del modelo base.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD Strix Halo: `loom-serve` expone una API compatible con OpenAI en `127.0.0.1:8080`, lo que permite conectar clientes existentes sin adaptadores y aprovechar la iGPU sin GPU discreta.
- Automatizacion de agentes con herramientas en el borde: el soporte de `tools`/`tool_calls` y la puerta `agent` validada permiten construir flujos de varios pasos (consulta de APIs, ejecucion de comandos) en un equipo de sobremesa.
- Procesamiento de documentos largos en local: con 32.768 tokens de contexto y un prefill de 7.848 tok/s a 32k segun el autor, es viable resumir o extraer informacion de documentos extensos en una sola pasada.
- Prototipado rapido de aplicaciones LLM: el modelo de 0,5B en Q4_K_M ocupa poco y arranca rapido, lo que lo hace util para iterar sobre prompts y esquemas de tool calling antes de pasar a modelos mayores.
- Generacion de texto en lote sobre hardware de consumo: con 312 tok/s de decodificacion en prompt corto, se pueden procesar colas de tareas de clasificacion o redaccion breve en local.
- Evaluacion comparativa de motores de inferencia: el paquete incluye puertas de correctitud (`golden`, `compare`, `sampling`, `needle`) que permiten verificar que Loom reproduce fielmente la salida de llama.cpp sobre el mismo GGUF, util para equipos que evaluan runtimes.
- Servicio de baja latencia para 4 usuarios concurrentes: la concurrencia de 4 peticiones con consistencia verificada encaja en pequenos equipos o demos internas.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento (tokens por segundo) comparando Loom frente a llama.cpp sobre el mismo GGUF, en un AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decodificacion tok/s, prompt corto | 263,0 | 312,2 | +19 % | 675,8 | 46 % |
| Decodificacion tok/s, contexto 2k | 266,1 | 435,9 | +64 % | 1186,8 | 37 % |
| Decodificacion tok/s, contexto 32k | 220,8 | 206,7 | -6 % | 728,0 | 28 % |
| Prefill tok/s, documento 1k | 11.575,8 | 17.097,2 | +48 % | 77.768,6 | 22 % |
| Prefill tok/s, documento 2k | 10.537,1 | 17.641,3 | +67 % | 73.596,4 | 24 % |
| Prefill tok/s, documento 8k | 9.015,2 | 16.542,5 | +83 % | 55.675,2 | 30 % |
| Prefill tok/s, documento 16k | 5.803,9 | 12.692,8 | +119 % | 42.029,3 | 30 % |
| Prefill tok/s, documento 32k | 3.932,5 | 7.848,4 | +100 % | 28.203,9 | 28 % |
| 4 flujos, decodificacion agregada tok/s | 816,6 | 635,6 | -22 % | 2542,7 | 25 % |
| Tokens propuestos aceptados (spec decoding) | no aplica | 12 % | no aplica | no aplica | no aplica |

Notas del autor: llama.cpp con build `llamacpp-rocm/b1369` y argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 33792 -kvu -np 4`; Loom con decodificacion especulativa n-gram depth 2. Loom mide en el cliente y llama.cpp en el servidor. La tasa de aceptacion varia por sesion: 11 % en decodificacion corta, 64 % a 2k y 82 % a 32k. El roofline se calcula a 216 GB/s y 59 TFLOP/s para gfx1151.

## Requisitos de hardware

- VRAM estimada: el paquete se sirve con `--memory_bytes=5000000000` (5 GB) en el ejemplo del autor; el GGUF Q4_K_M de 0,5B es mucho menor, pero el runtime reserva memoria para contexto y buffers.
- GPU recomendadas: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 ("Strix Halo", gfx1151); el runtime Loom apunta a `--device=amdgpu`.
- GPU de consumo: si, cabe holgadamente en cualquier iGPU o GPU discreta moderna; no requiere A100 ni H100.
- Despliegue: `loom-serve` (runtime Loom, instalado via `pip install "hrx-loom[hf]"`), con API OpenAI en `127.0.0.1:8080`. Tambien es posible servir el mismo GGUF con llama.cpp, vLLM u Ollama, aunque las cifras de rendimiento publicadas son especificas de Loom.
- Latencia y throughput: segun el autor, 312 tok/s de decodificacion en prompt corto, 435,9 tok/s a 2k, 206,7 tok/s a 32k, y prefill de 17.097 tok/s a 1k hasta 7.848 tok/s a 32k. Con 4 flujos concurrentes, 635,6 tok/s agregados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| loom-fun/bartowski-Qwen2.5-0.5B-Instruct-loom | 0,5B | 32.768 | no disponible | GGUF + `.loom` | Paquete de despliegue para AMD Loom con spec decoding n-gram |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 (segun model card original) | Apache 2.0 | safetensors | Modelo original de Alibaba Qwen, sin empaquetar para Loom |
| bartowski/Qwen2.5-0.5B-Instruct-GGUF | 0,5B | 32.768 | Apache 2.0 (heredada) | GGUF | Cuantizaciones del base para llama.cpp y otros motores |

No se dispone de datos de benchmarks de calidad para comparar el rendimiento cognitivo frente a alternativas; la comparativa se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- El paquete no declara licencia propia; la licencia del modelo base (Apache 2.0 en Qwen2.5-0.5B-Instruct) deberia verificarse antes de uso comercial, ya que el paquete no la explicita.
- El paquete no declara idiomas soportados; las capacidades multilingues dependen del modelo base y no estan garantizadas por el autor del empaquetado.
- Sin modo de razonamiento o thinking: no apto para tareas que requieran cadenas de pensamiento explicitas.
- Sin vision ni audio: solo entrada y salida de texto.
- La puerta `needle_full` (needle-in-the-haystack a contexto completo) no tiene evidencia registrada; el autor solo valida hasta la mitad del contexto.
- La tasa de aceptacion de la decodificacion especulativa es muy variable (11 % a 82 % segun contexto), lo que afecta a la ganancia real en produccion.
- La decodificacion a 32k de contexto es un 6 % mas lenta que llama.cpp segun las propias mediciones del autor, y la concurrencia de 4 flujos es un 22 % mas lenta en agregado.
- Modelo de 0,5B: alta probabilidad de alucinacion y baja fiabilidad en razonamiento complejo, matematicas o codigo no trivial; no recomendado para tareas de alta precision sin verificacion.
- Las mediciones son de un unico dispositivo (Strix Halo) y una unica fecha; no hay datos de reproducibilidad en otro hardware.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia de un runtime propietario/de nicho (Loom, `hrx-loom`); la portabilidad a otros motores requiere usar el GGUF subyacente por separado.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun/bartowski-Qwen2.5-0.5B-Instruct-loom
- Modelo base GGUF (bartowski): https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Coleccion Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Repositorio del runtime Loom: https://github.com/ROCm/hrx-system
- Flujo de empaquetado loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42342192972): https://github.com/loom-fun/loom-skills/actions/runs/42342192972
