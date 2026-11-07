# CarloKa/GN-1Nano

## Resumen

GN-1Nano v1 es un paquete de inferencia local en aleman para un asistente conversacional, construido sobre el modelo Qwen3-4B-Instruct-2507 de Alibaba. El autor, CarloKa, no entrena un modelo nuevo: empaqueta la cuantizacion Q4_K_M sin modificar de Unsloth junto con una instruccion de sistema en aleman, ajustes de muestreo y un Modelfile para Ollama. El nombre identifica el paquete, no un modelo entrenado desde cero.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con 4.022.468.096 parametros y una ventana de contexto configurada en 8192 tokens (frente a los 262 144 tokens nativos del modelo base, segun la documentacion de Qwen). El repositorio ocupa 2,5 GB y esta pensado para ejecutarse en hardware de consumo: el autor reporta uso completo de GPU en una RTX 5060 con 8 GB de VRAM y 32 GB de RAM a 8192 tokens de contexto.

Su relevancia es practica: ofrece un punto de partida reproducible para desplegar un chat en aleman en local con Ollama, con verificaciones funcionales basicas documentadas. No se publican resultados de benchmarks amplios ni se reclama calidad comparable a modelos comerciales. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (configurado en el Modelfile); el modelo base soporta 262 144 tokens segun Qwen |
| Tipos de cuantizacion | Q4_K_M (GGUF, cuantizacion de Unsloth sin modificar); otras cuantizaciones disponibles en el repo de Unsloth |
| Idiomas soportados | aleman (de) y ingles (en) declarados; el modelo base Qwen3 es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 2,5 GB); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B-Instruct-2507: un transformer denso con atencion por cabezas de consulta agrupadas (GQA) y las innovaciones propias de la familia Qwen3, como el modo de razonamiento opcional en el modelo base. GN-1Nano no introduce cambios arquitectonicos ni reentrena pesos: los pesos GGUF son la cuantizacion Q4_K_M de Unsloth, tal como declara el autor.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada. El repositorio incluye `training/train_qlora.py` como un diseno de entrenamiento no ejecutado y `data/formatbeispiel.jsonl` como ejemplo de formato de datos, no como dataset real. La unica validacion documentada son tres comprobaciones funcionales locales (calculo, sintaxis Python y contexto conversacional) registradas en `reports/funktionstest.json`.

## Capacidades

- Generacion de texto conversacional multi-turno en aleman e ingles.
- Razonamiento y calculo aritmetico basico (verificado en las comprobaciones funcionales del autor).
- Generacion de codigo, incluida sintaxis Python (verificada a nivel de sintaxis, sin ejecucion).
- Instruccion de sistema en aleman preconfigurada en el Modelfile y ajustes de muestreo (temperatura 0,7; top_p 0,8; top_k 20).
- Hereda del modelo base Qwen3-4B-Instruct-2507 capacidades multilingues y de seguimiento de instrucciones, aunque el paquete solo declara de y en.
- No dispone de acceso a web, vision, uso de herramientas (tool calling) ni busqueda de archivos, segun las limitaciones declaradas por el autor.
- No persiste memoria entre sesiones ni guarda conversaciones automaticamente.

## Casos de uso

- Asistente conversacional local en aleman: el paquete se instala con `ollama create` y `ollama run`, ofreciendo un chat multi-turno con instruccion de sistema en aleman sin dependencia de servicios en la nube. Adecuado por su tamano de 2,5 GB y su encaje en GPUs de 8 GB.
- Prototipado de aplicaciones de chat en escritorio: el Modelfile y los scripts `Starten.cmd` y `Testen.cmd` permiten arrancar y validar el asistente en Windows de forma reproducible, util para demos internas.
- Generacion y revision de codigo Python en local: el modelo produce codigo y el autor verifica sintaxis; encaja en flujos de borrador o revision estatica sin ejecucion.
- Tareas de calculo y razonamiento acotado: las comprobaciones funcionales cubren aritmetica basica, por lo que sirve para asistentes de apoyo a tareas sencillas.
- Base para ajuste fino con QLoRA: el repositorio incluye un diseno de entrenamiento (`train_qlora.py`) que puede servir de plantilla para adaptar el modelo a un dominio concreto.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local con Ollama, es apto para escenarios donde los datos no pueden salir del equipo.
- Evaluacion y comparacion de cuantizaciones: al ser una Q4_K_M sin modificar, permite medir el rendimiento de esa cuantizacion frente a otras variantes del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo documenta tres comprobaciones funcionales locales (calculo, sintaxis Python y contexto conversacional) en `reports/funktionstest.json`, sin metricas cuantitativas ni comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,5 GB para los pesos Q4_K_M; el autor reporta uso completo de GPU en una RTX 5060 de 8 GB con 32 GB de RAM a 8192 tokens de contexto.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 5060, RTX 3060 8 GB, RTX 4060, etc.); tambien cabe en GPUs de gama alta como RTX 4090, A100 o H100 con holgura.
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM para el contexto configurado; con contextos mayores se requiere mas memoria.
- Opciones de despliegue: Ollama (soporte oficial del paquete via Modelfile); llama.cpp por ser formato GGUF; otros runners GGUF compatibles. vLLM y TGI no estan documentados para este paquete.
- Latencia y throughput: no disponibles; el autor solo indica que el primer arranque puede tardar notablemente mas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GN-1Nano v1 | 4,02 B | 8192 configurado (262 144 nativo del base) | Apache-2.0 | GGUF en HF, Ollama | Paquete con instruccion en aleman, sin entrenamiento propio |
| Qwen3-4B-Instruct-2507 | 4,02 B | 262 144 | Apache-2.0 | safetensors y GGUF en HF | Modelo base original, multilingue |
| Qwen3-4B-Instruct-2507-GGUF (Unsloth) | 4,02 B | 262 144 | Apache-2.0 | GGUF en HF | Misma cuantizacion Q4_K_M sin instruccion en aleman |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo entrenado: es una derivacion configurada; los pesos son la cuantizacion Q4_K_M sin modificar de Unsloth.
- El autor declara explicitamente que no se reclama calidad comparable a ChatGPT.
- Sin acceso a web, vision, uso de herramientas ni busqueda de archivos.
- Riesgo de alucinacion: el autor advierte que las respuestas pueden ser incorrectas.
- Sin memoria persistente ni guardado automatico de conversaciones; recomienda iniciar un chat nuevo en conversaciones largas.
- La instruccion de sistema en aleman y los ajustes de muestreo solo se aplican al usar el Modelfile de Ollama; al usar el GGUF en otros programas no se heredan.
- Solo se declaran aleman e ingles como idiomas del paquete, aunque el modelo base es multilingue.
- La validacion es limitada: tres comprobaciones funcionales, sin benchmark amplio de calidad; la comprobacion de codigo no ejecuta el codigo ni verifica correccion funcional general.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los avisos de atribucion (`LICENSE`, `BASE-LICENSE.txt`, `ATTRIBUTION.md`) y verificarse la integridad del GGUF mediante `SHA256SUMS`.
- El repositorio no ofrece un servicio de chat alojado; subirlo al Hub no implica hosting.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/CarloKa/GN-1Nano
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantizacion de origen: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF
