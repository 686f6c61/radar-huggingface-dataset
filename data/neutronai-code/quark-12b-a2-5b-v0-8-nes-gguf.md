# neutronai-code/Quark-12B-A2.5B-v0.8-nes-GGUF

## Resumen

Quark-12B-A2.5B-v0.8-nes es un modelo de mezcla de expertos (MoE) especializado en asistencia dentro del editor de codigo, desarrollado por NeutronAI. Combina en un unico conjunto de pesos dos tareas complementarias: autocompletado por tabulador (fill-in-the-middle, FIM) y prediccion de la siguiente edicion (next-edit prediction). El modelo totaliza 12.149.923.072 parametros, de los cuales solo 2.500 millones se activan por token, lo que reduce el coste computacional por token a una fraccion de la de un modelo denso equivalente.

La version publicada en este repositorio es una cuantizacion GGUF del modelo base `neutronai-code/Quark-12B-A2.5B-v0.8-nes`, convertida con llama.cpp (release b12606) para su ejecucion local mediante llama.cpp y compatible con endpoints de la API de OpenAI. El modelo base deriva de Mellum2-12B-A2.5B-Base, de JetBrains, y hereda su licencia Apache 2.0.

Su relevancia practica reside en que mantiene el rendimiento de la version bf16 tras la cuantizacion Q4_K_M (8,1 GB): la tasa de acierto en autocompletado pasa del 60,7 % al 59,2 % y la prediccion de siguiente edicion se mantiene practicamente identica (46,6 % frente a 46,4 %), lo que permite desplegarlo en equipos con 16 GB de RAM y GPU de consumo. No es un modelo conversacional: esta disenado para recibir prompts en crudo a traves de `/v1/completions`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, arquitectura `mellum` (soportada por llama.cpp desde b12606) |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2.500 millones (2.5B) por token |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (8,1 GB, recomendada) y Q8_0 (12,9 GB, casi sin perdida); pesos originales en bf16 |
| Idiomas soportados | Codigo (lenguaje natural: no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde bf16); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 12B parametros totales y 2,5B activos por token, construido sobre la arquitectura `mellum` de JetBrains (modelo base Mellum2-12B-A2.5B-Base). Esta arquitectura requiere una version reciente de llama.cpp (b12606 o posterior) para cargar los pesos GGUF. La comparticion de expertos por token es lo que explica que, segun el autor, el modelo "funcione rapido en un portatil con GPU" pese a sus 12B parametros totales.

El entrenamiento se orienta a dos tareas de editor: autocompletado FIM con formato *suffix-first* (el sufijo se coloca antes que el prefijo en el prompt, siguiendo el formato de Mellum) y prediccion de la siguiente edicion sobre regiones de codigo. El autor no detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La model card si documenta que el modelo acepta contexto de repositorio mediante pares `(ruta, firmas)` de archivos relacionados, que se insertan como bloques `<filename>` antes del prompt FIM.

## Capacidades

- Autocompletado de codigo por tabulador (fill-in-the-middle) con formato suffix-first: `<fim_suffix>...<fim_prefix>...<fim_middle>`.
- Prediccion de la siguiente edicion (next-edit prediction): reescribe una region de codigo y devuelve la region sin cambios cuando no procede editar.
- Uso de contexto de repositorio: acepta hasta varios archivos relacionados (ruta y firmas) para condicionar la completacion.
- Deteccion de "no hay edicion": en el benchmark del autor deja intacto el codigo en el 90,7 % de los casos sin edicion debida (Q4_K_M).
- Inferencia local eficiente: 2,5B parametros activos por token permiten ejecucion en GPU de consumo.
- Integracion con llama.cpp: servidor compatible con endpoints de OpenAI (`/v1/completions`) y endpoint `/completion`.
- No soporta chat conversacional ni, segun la informacion disponible, tool calling, agentes, vision ni audio.

## Casos de uso

- Autocompletado en el editor (IDE): el modelo recibe el prefijo y el sufijo del cursor y devuelve el fragmento intermedio; su formato suffix-first encaja con la generacion de codigo que debe respetar lo que ya existe debajo del cursor. Se desplegaria con `llama-server -hf ...:Q4_K_M -c 8192` en la maquina del desarrollador.
- Prediccion de la siguiente edicion en refactorizaciones: tras un cambio en una firma o un tipo, el modelo propone la reescritura de la region afectada; el 46,6 % de acierto global y el 28,5 % de edicion exacta en Q4_K_M lo hacen util como sugerencia que el usuario acepta o descarta.
- Asistente de codigo en local sin conexion: al caber en 16 GB de RAM con Q4_K_M, permite ofrecer completado en entornos con requisitos de privacidad (codigo propietario que no puede salir de la maquina).
- Integracion en pipelines de generacion de tests o parches: el modelo puede completar huecos de codigo puntuados por las pruebas del propio repositorio, como en el benchmark del autor (600 huecos en 10 repositorios), lo que sirve para prototipar tareas de reparacion automatica.
- Extension de editor con contexto multiarchivo: usando los pares `(ruta, firmas)` de archivos relacionados, se puede condicionar la completacion con la API del proyecto y reducir sugerencias incompatibles con las firmas existentes.
- Servicio interno de completado mediante API compatible con OpenAI: al exponer `/v1/completions`, se puede conectar a herramientas que ya hablan el protocolo de OpenAI sin adaptadores adicionales, enviando prompts en crudo y `temperature: 0`.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (medidos con llama.cpp sobre los mismos benchmarks que el modelo completo):

| Metrica | Q4_K_M GGUF | bf16 (completo) |
|---|---:|---:|
| Autocompletado: tasa de acierto (600 huecos, 10 repositorios, pruebas propias) | 59,2 % | 60,7 % |
| Next edit: global (702 casos, 9 repositorios) | 46,6 % | 46,4 % |
| Next edit: edicion exacta | 28,5 % | 28,7 % |
| Next edit: codigo sin tocar cuando no tocaba editar | 90,7 % | 89,7 % |

Comparacion indicada por el autor: Qwen2.5-Coder-14B alcanza un 60,5 % en autocompletado, un modelo denso con aproximadamente seis veces mas computo por token. En autocompletado, Q4_K_M gana 15 huecos y pierde 24 frente a bf16, diferencia que el autor considera dentro del ruido. No se han publicado en la informacion disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/RAM estimada: Q4_K_M ocupa 8,1 GB y, segun el autor, funciona con 16 GB de RAM; Q8_0 ocupa 12,9 GB. La VRAM necesaria para carga completa en GPU no se detalla en la informacion disponible.
- GPU recomendadas: no especificadas por el autor; con 2,5B parametros activos por token, el modelo esta pensado para portatiles con GPU de consumo.
- GPU de consumo: si, segun el autor; el modelo "funciona rapido en un portatil con GPU". No se enumeran modelos concretos (RTX 4090, etc.).
- Despliegue: llama.cpp (release b12606 o posterior, imprescindible por la arquitectura `mellum`), mediante `llama-server` con `-hf` y el archivo Q4_K_M; endpoint `/v1/completions` para prompts en crudo. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Autocompletado (pass rate) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Quark-12B-A2.5B-v0.8-nes (Q4_K_M) | 12B totales / 2,5B activos (MoE) | no disponible | 59,2 % | Apache 2.0 | GGUF en Hugging Face |
| Quark-12B-A2.5B-v0.8-nes (bf16) | 12B totales / 2,5B activos (MoE) | no disponible | 60,7 % | Apache 2.0 | Pesos bf16 en Hugging Face |
| Qwen2.5-Coder-14B | 14B densos | no disponible en esta ficha | 60,5 % | no disponible en esta ficha | no disponible en esta ficha |

La comparacion con Qwen2.5-Coder-14B procede del propio autor. No se dispone de datos de otros modelos de autocompletado (por ejemplo, variantes de Mellum o CodeGemma) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: debe usarse con prompts en crudo en `/v1/completions` o `/completion`; no se debe esperar formato conversacional.
- El endpoint `/infill` de llama.cpp construye el prompt en orden prefijo-primero, distinto del entrenamiento suffix-first del modelo; usarlo puede degradar la calidad. Hay que usar el prompt documentado con `/v1/completions`.
- La arquitectura `mellum` exige llama.cpp b12606 o posterior; versiones anteriores no cargaran los pesos.
- Tasa de edicion exacta en next-edit del 28,5 % (Q4_K_M): la mayoria de las predicciones no son ediciones exactas, por lo que el caso de uso realista es la sugerencia con aceptacion humana.
- Riesgo de alucinacion en codigo no medido en la informacion disponible; el benchmark de autocompletado se limita a 600 huecos en 10 repositorios y el de next-edit a 702 casos en 9 repositorios, por lo que la generalizacion a otros lenguajes y dominios no esta documentada.
- Idiomas: solo se declara el codigo; el soporte de lenguaje natural y de idiomas distintos del ingles no esta disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0, igual que el modelo base, lo que permite uso comercial; no obstante, conviene verificar las condiciones del modelo base Mellum2-12B-A2.5B-Base de JetBrains.
- El autor no publica datos de contexto maximo entrenado; el ejemplo de despliegue usa 8192 tokens, pero no se confirma que sea el limite del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.8-nes-GGUF
- Modelo base (pesos bf16): https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.8-nes
- Formato de prompt para next edit: https://huggingface.co/neutronai-code/Quark-12B-A2.5B-v0.8-nes#prompt-format-next-edit
- llama.cpp (release b12606): no disponible en la informacion proporcionada
- Modelo base de JetBrains (Mellum2-12B-A2.5B-Base): no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
