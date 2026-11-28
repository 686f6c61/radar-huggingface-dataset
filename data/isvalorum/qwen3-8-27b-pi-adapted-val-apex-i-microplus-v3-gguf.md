# IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF

## Resumen

Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF es una cuantizacion GGUF del modelo base `harness-hub/Qwen3.8-27B-pi-adapted`, publicada por el usuario IsValorum dentro de su serie "APEX Quantization". El modelo base pertenece a la familia Qwen3.8 (arquitectura `qwen35`, segun la model card) con 27.320.697.856 parametros totales, y esta adaptado para su uso en entornos de agentes ("pi-adapted", "harness-adapter"). Esta version concreta, MicroPlus, es la variante mas agresiva de la familia en cuanto a reduccion de huella: 9,77 GiB frente a los 11,47 GiB de NanoPlus y los 13,31 GiB de MiniPlus.

El modelo resuelve el problema de ejecutar un modelo de ~27B parametros en hardware de consumo mediante cuantizacion quirurgica por tensor, usando una mezcla de precisiones que va desde F32 en las rutas recurrentes/SSM hasta IQ2_XXS en proyecciones densas del FFN. La model card documenta un mapa de cuantizacion auditado tensor a tensor, con protecciones especificas en la capa 0 y precisiones elevadas (Q5_K, Q8_0, F32) en los componentes mas sensibles del modelo.

Es relevante ahora porque combina tres tendencias: cuantizacion de muy baja precision con iMatrix, arquitecturas hibridas con componentes SSM/recurrentes, y adaptacion especifica para flujos de agentes con tool calling. La licencia Apache 2.0 facilita su uso comercial, y el ecosistema de despliegue es llama.cpp, con integracion directa en la aplicacion V-Agent del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35 (hibrida, con componentes SSM/recurrentes y atencion) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla por tensor: F32, Q8_0, Q5_K, Q4_K, Q4_0, Q3_K, IQ2_S, IQ2_XXS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, y el mapa de tensores auditado revela una estructura hibrida: 64 bloques (blk.0 a blk.63) con componentes de atencion (`attn_q`, `attn_k`, `attn_v`, `attn_output`, `attn_gate`, `attn_qkv`) y componentes de estado recurrente/SSM (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_conv1d`, `ssm_dt`, `ssm_out`). La presencia de `ssm_a`, `ssm_conv1d` y `ssm_dt` en F32 en las 48 capas correspondientes indica un camino recurrente con parametros que el cuantizador ha decidido mantener en precision completa por su sensibilidad numerica. Tambien aparecen tensores `attn_qkv` fusionados en 48 capas, lo que sugiere un diseno de atencion con proyecciones combinadas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o similar. La model card solo documenta el proceso de cuantizacion, no el entrenamiento del modelo base. La innovacion tecnica destacable de esta publicacion es el esquema de cuantizacion quirurgica: la capa 0 se protege con Q4_0 en sus proyecciones criticas, las rutas SSM se mantienen en F32, y las proyecciones densas del FFN se comprimen agresivamente (IQ2_XXS en las capas 16-47, IQ2_S en las capas 0-15 y 48-63). El iMatrix utilizado proviene de `unsloth/Qwen3.8-27B-GGUF/imatrix_unsloth.gguf`, segun declara el autor.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Orientacion explicita a flujos de agentes: los tags incluyen `agents`, `harness-adapter` y `mtp`, lo que sugiere soporte de multi-token prediction y adaptacion a harness de agentes.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que permite exponerlo mediante APIs compatibles con OpenAI/Claude segun la documentacion de V-Agent.
- Soporte de tool calling y MCP a traves de la aplicacion V-Agent, que integra herramientas de shell, busqueda web, navegador autonomo, peticiones HTTP y servidores MCP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento multi-paso: implicito en su orientacion a agentes, pero sin datos de benchmarks que lo cuantifiquen.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agente local de escritorio en Windows: el modelo esta pensado para ejecutarse dentro de V-Agent, que gestiona ficheros con historial de versiones, comandos de shell y busqueda web. Su huella de 9,77 GiB permite cargarlo en GPUs de consumo medio-alto junto con el resto del sistema.
- Automatizacion de tareas de desarrollo con aprobacion humana: V-Agent exige aprobacion por accion y permite chats con carpetas aisladas, lo que encaja con un modelo adaptado a harness de agentes que debe razonar sobre herramientas disponibles.
- Asistente de codigo con validacion sintactica: la integracion con V-Agent incluye comprobacion de sintaxis del codigo generado y verificacion en tiempo de ejecucion de HTML, adecuado para iteraciones rapidas en local.
- Sustitucion de APIs remotas por inferencia local: al ser compatible con endpoints OpenAI/Claude, puede desplegarse como backend local en lugar de consumir APIs de pago, con la ventaja de privacidad (sin telemetria ni cuenta).
- Prototipado de pipelines de agentes con llama.cpp: al ser un GGUF estandar, puede cargarse en llama.cpp con builds CUDA, Vulkan o CPU, lo que permite probar arquitecturas de agentes en distintos tipos de hardware sin reentrenar.
- Experimentacion con arquitecturas hibridas SSM/atencion: el modelo, con sus rutas recurrentes en F32, sirve como banco de pruebas para estudiar el comportamiento de modelos hibridos bajo cuantizacion agresiva en comparacion con las variantes MiniPlus y NanoPlus de la misma familia.
- Despliegue en entornos con VRAM limitada: la variante MicroPlus (9,77 GiB) es la opcion de menor huella de la familia, util para GPUs de 12-16 GB donde las variantes mayores no caben con contexto suficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplexity comparativas entre las variantes MiniPlus, NanoPlus y MicroPlus.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,77 GiB para los pesos en la variante MicroPlus; el total en memoria debe sumar el contexto KV cache, que depende de la longitud de contexto configurada y no se documenta.
- GPU recomendadas: no se especifican en la model card. Por tamano, encaja en GPUs de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080) y en GPUs de datacenter (A100, H100) sin problema.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM, dejando margen variable para el contexto.
- Opciones de despliegue: llama.cpp (builds oficiales CUDA, Vulkan y CPU), Strata y Strata Rust segun V-Agent; tambien puede exponerse mediante endpoints compatibles OpenAI/Claude.
- Latencia y throughput: no disponibles. Dependen del backend, la GPU y la longitud de contexto, y no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Huella (GGUF) | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-pi-adapted VAL-APEX MicroPlus (este) | 27,32B | no disponible | 9,77 GiB | Apache 2.0 | Variante de menor huella de la familia APEX |
| Qwen3.8-27B-pi-adapted VAL-APEX NanoPlus | 27,32B (mismo base) | no disponible | 11,47 GiB | Apache 2.0 | Mayor precision, mayor huella |
| Qwen3.8-27B-pi-adapted VAL-APEX MiniPlus | 27,32B (mismo base) | no disponible | 13,31 GiB | Apache 2.0 | Mayor precision de la familia |
| Modelo base harness-hub/Qwen3.8-27B-pi-adapted | 27,32B | no disponible | no disponible | no disponible | Pesos sin cuantizar del que derivan las tres variantes |

No se dispone de datos de benchmarks ni de modelos externos comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes de la misma familia.

## Limitaciones y advertencias

- La cuantizacion IQ2_XXS en las capas densas del FFN (blk.16-47) es extremadamente agresiva y puede degradar la calidad en tareas de razonamiento complejo o generacion de codigo largo; no hay evaluaciones publicadas que cuantifiquen esa perdida.
- La model card no documenta sesgos conocidos, comportamiento en idiomas distintos del ingles, ni tasas de alucinacion.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- El modelo base es una adaptacion de terceros (`harness-hub`) sobre Qwen3.8; la trazabilidad del entrenamiento y de las adaptaciones no esta documentada en esta ficha.
- El autor declara que la procedencia del iMatrix es externa y que "no se infiere" su origen; conviene verificar la procedencia antes de usos criticos.
- Aunque la licencia es Apache 2.0, las condiciones del modelo base y de los datos de entrenamiento originales no se detallan aqui; para uso comercial en produccion conviene revisar la licencia del modelo base.
- El ecosistema principal de uso es V-Agent, una aplicacion de Windows del mismo autor; fuera de ese entorno, la integracion de herramientas y MCP debe implementarse por separado.
- No hay telemetria ni cuenta en V-Agent, pero las llamadas a APIs remotas, si se habilitan, dependen del proveedor elegido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MicroPlus-V3-GGUF
- Modelo base: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Variante MiniPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-MiniPlus-V3-GGUF
- Variante NanoPlus: https://huggingface.co/IsValorum/Qwen3.8-27B-pi-adapted-VAL-APEX-I-NanoPlus-V3-GGUF
- iMatrix de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- V-Agent (repositorio): https://github.com/IsValorum/V-Agent
- V-Agent (ultima release): https://github.com/IsValorum/V-Agent/releases/latest
- Apoyo al autor: https://ko-fi.com/isvalorum
