# ilintar/Qwen3.8-27B-hybrid-loom

## Resumen

Qwen3.8-27B-hybrid-loom es un paquete de despliegue publicado por el usuario ilintar en Hugging Face, no un modelo entrenado desde cero. Empaqueta el checkpoint GGUF `Qwen3.8-27B-Q4_K_M.gguf` de bartowski (a su vez derivado de la familia Qwen3.8 de 27 mil millones de parametros) junto con programas `.loom`, una tarjeta `model.json`, un fichero de despliegue y una configuracion de dispositivos para ejecutarlo de forma hibrida sobre GPU y NPU en un AMD Ryzen AI Max+ 395 "Strix Halo".

La aportacion tecnica es la orquestacion heterogenea: el prefill se reparte entre la GPU Radeon 8060S (gfx1151) y la NPU XDNA2 integrada, de modo que las primeras columnas de salida de las proyecciones gate/up de cada FFN se calculan en la NPU como multiplicacion i8 x i8 a i32 sin escalado, mientras la GPU aplica las escalas de columna en un SwiGLU fusionado y ejecuta atencion, control y toda la decodificacion. El autor reporta una mejora medida de 615,0 frente a 453,5 tok/s en prefill a 8k (1,36x) respecto al mismo runtime en modo GPU pura, con decodificacion identica.

Es relevante ahora porque demuestra un patron practico de uso de NPU integradas en APUs de AMD para acelerar inferencia de modelos grandes cuantizados, aunque con requisitos muy estrictos: runtime nativo parcheado, tarjeta de modelo en schema v2 y ausencia de soporte en los lanzadores publicados. El contexto configurado en el preset es de 40.960 tokens con 4.096 tokens de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); el paquete anade orquestacion hibrida GPU/NPU con programas `.loom` |
| Parametros totales | 27 mil millones (segun el nombre del checkpoint base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (preset `chat` del deployment) |
| Tipos de cuantizacion | Q4_K_M para el checkpoint principal y para el draft DFlash2; mmproj en f16; paneles NPU derivados en i8 con escalas de columna |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M, mmproj f16) mas artefactos `.loom`, `model.json`, `deployment.json` y `devices.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 27 mil millones de parametros en la estela de la familia Qwen3.8, distribuido como GGUF Q4_K_M. El paquete no modifica el checkpoint: lo consume tal cual y anade una capa de planificacion de ejecucion. En el prefill, las primeras columnas de salida de las proyecciones gate/up de cada FFN se ejecutan en la NPU XDNA2 mediante un kernel `bqv` que realiza i8 x i8 a i32 sin escalado; la NPU cubre 8.192 columnas antes de la posicion 2048 y 9.216 despues, y ese calendario queda compilado en `program/control.loom`. La GPU calcula el resto de columnas gate/up, aplica las escalas en un merge/SwiGLU fusionado, ejecuta la proyeccion down, la atencion y todo el decode.

El esquema de ejecucion usa dos bancos de prefill de 1.024 filas emparejados (`group_mode: two_bank`, `plan_provider: two_bank_v1`): el trabajo gate/up del banco A en la NPU se solapa con el del banco B en la GPU, con un comando compuesto de GPU y una vida util de descriptor v4 residente en NPU por pareja. La colocacion enruta el `resident_lifetime` raiz a `xdna` y todo lo demas a `amdgpu`, con intercambio de datos a traves de un pool `exchange` fijo y no cacheado. Los pesos de la NPU no se distribuyen: se derivan en la primera carga a partir del GGUF (6,88 GB de paneles i8 y 5,4 MB de escalas de columna) y se reutilizan despues. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni las fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional mediante endpoint compatible con OpenAI `/v1/chat/completions`.
- Razonamiento y codigo heredados del modelo base Qwen3.8-27B (no se detallan capacidades especificas en la informacion disponible).
- Procesamiento multimodal: el paquete incluye `mmproj-Qwen3.8-27B-f16.gguf`, lo que sugiere soporte de entrada de vision, aunque no se documenta su alcance.
- Decodificacion especulativa mediante un draft DFlash2 (`Qwen3.8-27B-DFlash2-Q4_K_M.gguf`), usada con profundidad 3 en las mediciones de decode.
- Aceleracion hibrida de prefill en GPU y NPU con solapamiento por bancos.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Procesamiento de documentos largos en local: con 40.960 tokens de contexto y prefill acelerado a 615 tok/s a 8k, resulta adecuado para resumir o extraer informacion de contratos, informes o expedientes en una estacion de trabajo con Strix Halo, sin depender de la nube.
- Asistente de codigo en escritorio: el modelo base de 27B ofrece capacidad de generacion de codigo; el preset `chat` con 4.096 tokens de salida permite completar funciones, explicar errores y generar tests desde un cliente compatible con la API de OpenAI.
- Analisis de imagenes tecnicas: la presencia del `mmproj` f16 habilita, si el runtime lo expone, consultas sobre capturas, diagramas o documentacion escaneada combinadas con texto largo en el mismo contexto.
- Servicio de chat interno para equipos pequenos: el servidor sirve una sola fila con contexto de 40.960 tokens, suficiente para un asistente departamental con prompts de sistema extensos y recuperacion de documentos.
- Evaluacion de pipelines de inferencia heterogenea: util como banco de pruebas para medir el impacto de descargar parte del prefill a la NPU XDNA2 y validar esquemas de solapamiento por bancos en hardware AMD.
- Prototipado de decodificacion especulativa: el draft DFlash2 incluido permite experimentar con profundidades de borrador y medir su efecto en latencia de decode sobre el mismo entorno.
- Demostracion de despliegue local con licencia permisiva: al ser apache-2.0, sirve para pilotos internos o productos derivados sin obligaciones de copyleft, siempre que se cumplan los requisitos de runtime.

## Benchmarks y rendimiento

| Metrica | GPU pura | Hibrido GPU+NPU | Mejora |
|---|---|---|---|
| Prefill a 8k (tok/s) | 453,5 | 615,0 | 1,36x |
| Decode | igual que la ruta GPU | igual que la ruta GPU | sin cambio |
| Primera carga (tiempo hasta primera respuesta) | no disponible | 183 s (179 s derivando y hasheando la cache NPU) | no aplica |
| Cargas posteriores | no disponible | 4,4 s (reutilizacion por identidad stat, 0,05 s de validacion) | no aplica |
| Carga con `LOOM_DERIVE_VERIFY=1` | no disponible | 63 s (hashes completos de GGUF y payload) | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- APU: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151); es el unico hardware medido y declarado como requerido.
- NPU: XDNA2 de Strix Halo (`1022:17f0` rev 11), expuesta como `xdna://0?columns=8`; se requieren 8 columnas.
- Memoria del sistema: 123,5 GiB medidos (MemTotal 129.461.956 kB); el pool de modelo de la GPU tiene un techo de 52.000.000.000 B en `devices.json`.
- Disco: 19,5 GB para los GGUF mas 6,88 GB escribibles para la cache derivada de la NPU.
- Sistema operativo medido: Ubuntu 26.04.1 LTS con Linux 7.0.0-43-generic.
- VRAM estimada para inferencia: no disponible como cifra aislada; el modelo Q4_K_M de 27B se sirve desde el pool de 52 GB declarado.
- GPU recomendadas: Radeon 8060S integrada en Strix Halo; no se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: solo en el escenario APU Strix Halo descrito; no hay datos para GPUs discretas de consumo.
- Opciones de despliegue: `loom-serve` con `deployment.json` y `devices.json` del bundle; `loom-launch` solo en modo `show`, ya que `serve` y `bench` generan su propio despliegue monodispositivo y no sirven para este perfil.
- Runtime: se necesita el runtime nativo Loom parcheado del checkout de HRX (dispatch multidispositivo, vidas utiles residentes de descriptor v4 en NPU y transformacion de carga `i8-panel` en `i8_panel.c`), cambios no incluidos en ninguna release de `hrx-loom` en el momento de la publicacion. `hrx-loom 0.1.0` de PyPI rechaza la tarjeta por ser `schema_version: 2`.
- Latencia y throughput: prefill de 615 tok/s a 8k en modo hibrido; decode sin mejora respecto a GPU pura; tiempos de carga de 183 s en frio y 4,4 s en caliente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hybrid-loom (este) | 27B | 40.960 tokens (preset) | Hibrido GPU Radeon 8060S + NPU XDNA2 con runtime Loom parcheado | apache-2.0 | Hugging Face, requiere instalacion manual |
| bartowski/Qwen3.8-27B-GGUF | 27B | no disponible | GGUF estandar para llama.cpp y similares | no disponible | Hugging Face |
| z-lab/Qwen3.8-27B-DFlash2-GGUF | 27B (draft) | no disponible | Modelo borrador para decodificacion especulativa | no disponible | Hugging Face |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitacion del checkpoint Qwen3.8-27B Q4_K_M (sesgos, alucinaciones, conocimiento desactualizado) se hereda sin cambios.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo en BF16 o FP8; no se documenta una evaluacion de calidad diferencial.
- El soporte esta restringido a una unica plataforma: AMD Ryzen AI Max+ 395 con Radeon 8060S y NPU XDNA2; no hay ruta documentada para otras GPU o NPU.
- Requiere un runtime nativo parcheado no publicado en releases; sin el, el bundle no arranca.
- `loom-fetch` falla en la instalacion completa con el mensaje `i8-panel derivation belongs to the native runtime loader`; hay que instalar a mano y verificar tamanos y sha256 contra `parameter/*.gguf.json`.
- `loom-launch serve` y `loom-launch bench` no son utilizables con este bundle porque escriben su propio despliegue monodispositivo y no pasan `deployment.json` ni `devices.json`.
- La primera carga tarda 183 s por la derivacion de la cache NPU y consume 6,88 GB adicionales de disco escribible.
- El preset sirve una sola fila, sin cache de prefijo ni de sesion, y con profundidad de borrador 0 por defecto; la decodificacion especulativa con profundidad 3 solo se uso en el arnes de medicion.
- El script `runtime/serve.sh` incluye rutas absolutas del host de medicion y exige las variables `GPU_GRANT` y `NPU_GRANT`, que deben sobrescribirse.
- No se documentan idiomas soportados ni evaluaciones de sesgo; la licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el modelo base y sobre el runtime recae en el integrador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras reportadas por el autor.

## Enlaces

- [Hugging Face: ilintar/Qwen3.8-27B-hybrid-loom](https://huggingface.co/ilintar/Qwen3.8-27B-hybrid-loom)
- [Modelo base GGUF: bartowski/Qwen3.8-27B-GGUF](https://huggingface.co/bartowski/Qwen3.8-27B-GGUF)
- [Draft especulativo: z-lab/Qwen3.8-27B-DFlash2-GGUF](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF)
- [Runtime Loom (ROCm/hrx-system)](https://github.com/ROCm/hrx-system)
