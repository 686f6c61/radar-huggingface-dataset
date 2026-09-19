# experimentalmachines/LFM2.5-2.6B-ExecuTorch

## Resumen

LFM2.5-2.6B-ExecuTorch es un conjunto de exportaciones cuantizadas del modelo LiquidAI/LFM2.5-2.6B (revision `654f9463ce32`) preparadas para inferencia en dispositivo con ExecuTorch 1.4.0. Lo publica el usuario experimentalmachines y su proposito es llevar un modelo de ~2,6B parametros a telefonos y dispositivos arm64 sin depender de GPU ni de servidores externos, empaquetando pesos y grafo en archivos `.pte` listos para ejecutar con el backend XNNPACK sobre CPU.

El paquete cubre cinco ventanas de contexto (2.048, 4.096, 8.192, 16.384 y 32.768 tokens), cada una con su propio archivo porque la cache KV se reserva completa en el momento de cargar el modelo. Los pesos se cuantizan a 4 bits en grupos de 32 con activaciones dinamicas de 8 bits (esquema 8da4w, GPTQ), embeddings int8 por canal y cache KV en fp32, lo que deja cada `.pte` en torno a 1,78-1,81 GB. El repositorio completo ocupa 10,8 GB porque incluye las cinco variantes duplicadas.

Es relevante ahora porque permite desplegar un LLM de gama media en Android con integracion directa en la aplicacion openweights, sin cuantizacion adicional por parte del usuario. La contrapartida es que se trata de un artefacto de exportacion: la model card no documenta evaluaciones de calidad, idiomas soportados ni detalles de entrenamiento del modelo original, y la licencia heredada (lfm1.0) no es una licencia de codigo abierto estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2,6B (segun la denominacion del modelo base; la model card no detalla el desglose) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 32.768 tokens; variantes exportadas de 2.048, 4.096, 8.192, 16.384 y 32.768 tokens |
| Tipos de cuantizacion | 8da4w GPTQ: activaciones dinamicas int8, pesos 4 bits en grupos de 32, embeddings int8 por canal, cache KV fp32 |
| Idiomas soportados | no disponible |
| Licencia | other / lfm1.0 (heredada de LiquidAI/LFM2.5-2.6B; archivo LICENSE incluido sin cambios) |
| Formato de pesos | ExecuTorch `.pte` (backend XNNPACK, CPU arm64) + `tokenizer.json` |
| Backend de ejecucion | XNNPACK con operadores extendidos, cualquier arm64 |
| Version de runtime | ExecuTorch 1.4.0 |
| Tamano por archivo | 1,78-1,81 GB segun ventana |
| Tamano del repositorio | 10,8 GB |
| Cache KV | 32.768 bytes por token en fp32 (64 MiB a 2k; 1 GiB a 32k), reservada completa al cargar |
| Prefill chunk | 2.048 tokens |
| Descargas / likes | 64 / 0 |
| Fecha de creacion | 2026-09-07 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. Lo unico documentado es el pipeline de exportacion: se uso la herramienta `export_llm` de ExecuTorch 1.4.0 sobre LiquidAI/LFM2.5-2.6B, con cuantizacion 8da4w GPTQ (activaciones dinamicas de 8 bits, pesos de 4 bits agrupados de 32 en 32), embeddings cuantizados a int8 por canal, backend XNNPACK con operadores extendidos, chunk de prefill de 2.048 tokens y cache KV en fp32. El tokenizador se copia sin modificar del repositorio de origen.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. Tampoco se documentan innovaciones tecnicas propias del export mas alla del propio flujo de ExecuTorch. El unico registro de validacion publicado es un smoke test que devuelve "Paris" para cada una de las cinco ventanas, lo que confirma que el grafo carga y genera, pero no aporta ninguna medida de calidad.

## Capacidades

- Generacion de texto autoregresiva en el dispositivo, con pipeline `text-generation`.
- Ejecucion completamente local en CPU arm64 mediante XNNPACK, sin necesidad de GPU ni de conectividad de red.
- Cinco perfiles de contexto seleccionables en tiempo de carga: 2k, 4k, 8k, 16k y 32k tokens.
- Integracion directa con la aplicacion Android openweights, que consume los archivos `.pte`.
- Compatibilidad con cualquier runtime ExecuTorch 1.4.0, no solo con la app mencionada.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas.

## Casos de uso

- Asistentes de texto sin conexion en Android: la variante de 2k (1,78 GB de pesos + 64 MiB de cache KV) permite respuestas cortas de chat o autocompletado en un telefono de gama alta sin enviar datos a la nube.
- Clasificacion y etiquetado de texto en el propio dispositivo: con la ventana de 4k se pueden procesar notas, correos o fragmentos de documentos y aplicar categorias, ganando privacidad al no salir el contenido del terminal.
- Resumen de documentos largos: la variante de 32k admite entradas de hasta 32.768 tokens, util para condensar informes, actas o hilos de conversacion completos en local (requiere ~1 GiB adicional de RAM solo para la cache KV).
- Extraccion de campos estructurados de texto no estructurado: por ejemplo, convertir correos de soporte en JSON con campos como remitente, producto e incidencia, dentro de una app movil de gestion.
- Prototipado e investigacion sobre inferencia on-device: los `export-report-<window>.json` y los `config.json` por backend permiten reproducir el pipeline y comparar costes de memoria entre ventanas sin reentrenar nada.
- Asistencia offline en entornos sin cobertura o aislados: dispositivos de campo, inspeccion industrial o recogida de datos donde no hay red disponible y el modelo debe funcionar de forma autonoma.
- Base para evaluar cuantizacion 8da4w en arm64: sirve para medir degradacion de calidad frente al modelo original LiquidAI/LFM2.5-2.6B en un dispositivo real antes de decidir un despliegue.
- Integracion en apps que ya usan ExecuTorch: cualquier proyecto Android con el runtime 1.4.0 puede cargar los `.pte` sin adaptadores adicionales, reutilizando el tokenizador incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta un smoke test superado con la respuesta "Paris" en las cinco variantes de ventana. La busqueda web realizada no devolvio resultados relacionados con este modelo ni con su modelo base (los unicos enlaces recuperados corresponden a herramientas de videojuegos sin relacion). Por tanto, no hay datos verificables de MMLU, HumanEval, GSM8K ni de latencia o throughput.

## Requisitos de hardware

- Inferencia exclusivamente en CPU arm64 mediante XNNPACK; no se requiere GPU ni VRAM dedicada.
- Memoria necesaria = tamano del `.pte` + cache KV completa reservada al cargar:
  - 2.048 tokens: ~1,78 GB de pesos + 64 MiB de cache KV.
  - 4.096 tokens: ~1,79 GB de pesos + 128 MiB de cache KV.
  - 8.192 tokens: ~1,79 GB de pesos + 256 MiB de cache KV.
  - 16.384 tokens: ~1,80 GB de pesos + 512 MiB de cache KV.
  - 32.768 tokens: ~1,81 GB de pesos + 1.024 MiB de cache KV.
- La model card incluye un campo `fits_phone_budget` en el `config.json` de cada carpeta, estimado contra un presupuesto de 5 GB.
- Cabe en telefonos Android de gama media-alta y alta; no esta pensado para microcontroladores ni para dispositivos con menos de ~2 GB libres.
- GPU recomendadas (A100, H100, RTX 4090): no aplica para este export; el artefacto es especifico de CPU arm64.
- Opciones de despliegue: runtime ExecuTorch 1.4.0 y la aplicacion Android openweights. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que estos esperan safetensors o GGUF; para esos entornos habria que usar el modelo base LiquidAI/LFM2.5-2.6B y exportarlo por otra via.
- Latencia y throughput: no disponible en la informacion proporcionada. La unica referencia de rendimiento interno es el chunk de prefill de 2.048 tokens y el hecho de que el smoke test se ejecuta correctamente en cada variante.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas para establecer una comparativa cuantitativa. Como referencia cualitativa de categoria (LLM densos de ~1-3B pensados para inferencia en dispositivo), los alternativas habituales serian Llama 3.2 1B/3B, Qwen2.5 1.5B/3B y Gemma 3 1B/4B, todas ellas con exportaciones propias a formatos on-device. Sin embargo:

| Modelo | Parametros | Contexto | Licencia | Formato on-device | Datos de rendimiento |
|---|---|---|---|---|---|
| LFM2.5-2.6B-ExecuTorch | 2,6B (base) | 2k-32k (segun archivo) | lfm1.0 (other) | `.pte` (ExecuTorch/XNNPACK) | solo smoke test |
| Llama 3.2 1B/3B | no disponible en esta busqueda | no disponible en esta busqueda | Llama Community License | GGUF, ExecuTorch, otros | no disponible en esta busqueda |
| Qwen2.5 1.5B/3B | no disponible en esta busqueda | no disponible en esta busqueda | Apache 2.0 | GGUF, ExecuTorch, otros | no disponible en esta busqueda |
| Gemma 3 1B/4B | no disponible en esta busqueda | no disponible en esta busqueda | Gemma Terms of Use | GGUF, ExecuTorch, otros | no disponible en esta busqueda |

Las filas de la competencia se incluyen solo como orientacion de categoria; sus cifras concretas no forman parte de la informacion proporcionada en esta busqueda y deben verificarse en sus fichas oficiales antes de tomar una decision.

## Limitaciones y advertencias

- No hay ningun dato publicado de calidad, evaluacion o benchmark: el unico test reportado es un smoke test con la palabra "Paris". No se puede inferir capacidad real de razonamiento, codigo o matematicas.
- La model card no documenta idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en ningun otro idioma concreto.
- Es un derivado cuantizado a 4 bits, lo que implica degradacion respecto al modelo original LiquidAI/LFM2.5-2.6B. No se publica ninguna medida de esa perdida.
- La ventana de contexto se fija dentro del archivo: la runtime reserva toda la cache KV al cargar. Elegir 32k consume ~1 GiB extra de RAM de forma permanente aunque la conversacion sea corta.
- La cache KV esta en fp32; no hay opcion documentada de reducirla a fp16 o int8 en este export.
- Riesgo de alucinacion: inherente a cualquier LLM de este tamano y agravado por la cuantizacion de pesos a 4 bits. No hay evaluaciones de fidelidad factual.
- Sesgos conocidos: no disponibles. La model card no incluye ninguna seccion de sesgos, toxicidad ni evaluacion de seguridad.
- Licencia: se distribuye bajo terminos `other` con nombre `lfm1.0`, heredados del modelo base. No es una licencia OSI estandar, por lo que antes de un uso comercial hay que revisar el archivo `LICENSE` incluido y los terminos de LiquidAI; el autor no ofrece ninguna garantia adicional.
- No hay soporte de vision, audio, tool calling ni agentes documentado en este export.
- Artefacto especifico para CPU arm64: no se puede reutilizar en servidores x86, GPU NVIDIA ni en pipelines tipo vLLM/TGI.
- El repositorio pesa 10,8 GB por incluir cinco copias del grafo con distintas ventanas; conviene descargar solo el archivo necesario.
- Sin mantenimiento garantizado: 64 descargas y 0 likes en el momento de la consulta, y sin historial publico de incidencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/LFM2.5-2.6B-ExecuTorch
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Aplicacion Android openweights: https://github.com/alpharomercoma/openweights
- Repositorio del exportador: https://github.com/ExperimentalMachines/executorch-model-exporter
- Ejecucion de CI del export (XNNPACK arm64): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/35391403566
