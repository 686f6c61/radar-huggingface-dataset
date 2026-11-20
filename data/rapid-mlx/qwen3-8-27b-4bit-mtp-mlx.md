# rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX

## Resumen

Qwen3.8-27B-4bit-MTP-MLX es un paquete de pesos cuantizados a 4 bits en formato MLX del modelo Qwen3.8-27B, publicado por el proyecto Rapid-MLX. No se trata de un modelo entrenado desde cero, sino de una distribución autocontenida que empaqueta los pesos objetivo de 4 bits junto con un drafter nativo de Multi-Token Prediction (MTP) derivado del mismo checkpoint upstream de Qwen. Su propósito es ofrecer decodificación especulativa lista para usar en Apple Silicon sin que el usuario tenga que emparejar manualmente pesos objetivo y pesos de aceleración.

El modelo base, Qwen/Qwen3.8-27B, pertenece a la familia Qwen3.8 y cuenta con 27.356.728.560 parámetros (aproximadamente 27,36 mil millones), según los safetensors publicados. La arquitectura se etiqueta como `qwen3_5` en los tags del repositorio y el pipeline es de generación de texto conversacional, con soporte declarado de inglés y chino. El repositorio ocupa 16,3 GB e incluye tokenizer, processor y ficheros de configuración de generación y modelo.

La relevancia de esta ficha radica en dos factores: por un lado, permite ejecutar un modelo de ~27B en Macs con memoria unificada (se recomiendan 32 GB para el objetivo de 16,3 GB más los pesos MTP); por otro, la integración de MTP como sidecar de decodificación especulativa mantiene la salida idéntica a la decodificación greedy autoregresiva, lo que facilita su adopción en producción sin cambiar el comportamiento del modelo. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en los tags del repositorio); no se detalla la composición interna en la informacion disponible |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (pesos objetivo y drafter MTP en 4 bits, formato MLX) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); ficheros `model-*.safetensors` y `model-mtp.safetensors` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base más allá de la etiqueta `qwen3_5` y su naturaleza transformer de generación de texto. Lo que sí se especifica es el esquema de cuantización: los pesos objetivo están en 4 bits en formato MLX y se basan en `mlx-community/Qwen3.8-27B-4bit`, mientras que el drafter MTP se basa en `mlx-community/Qwen3.8-27B-MTP-4bit`. Ambos derivan del checkpoint original `Qwen/Qwen3.8-27B`, de modo que el emparejamiento entre objetivo y drafter está garantizado por construcción.

La innovación técnica destacable es la inclusión del drafter nativo de Multi-Token Prediction como sidecar dentro del mismo repositorio. MTP es una técnica de decodificación especulativa: el drafter propone varios tokens y el modelo objetivo los verifica, de forma que la salida aceptada es idéntica a la decodificación greedy autoregresiva. El runtime debe recurrir a decodificación autoregresiva cuando MTP no esté disponible o no resulte beneficioso en el Mac concreto. No se proporcionan datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; esa información corresponde al modelo base y no se incluye en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `text-generation`.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen3.8-27B.
- Decodificación especulativa mediante MTP con salida idéntica a greedy autoregresivo (verificado por hash de tokens emitidos en la prueba del autor).
- Soporte multilingüe limitado a inglés y chino según los metadatos del repositorio.
- Integración con herramientas de agentes: el autor documenta uso desde OpenCode, Claude Code y Codex mediante `rapid-mlx agents <name> --setup`.
- Servidor compatible con la API de chat completions de OpenAI (`/v1/chat/completions`) a través de `rapid-mlx serve`.
- No se documentan capacidades de visión, audio, tool calling nativo ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local en Mac: el paquete se sirve con `rapid-mlx serve` y expone un endpoint compatible con OpenAI, lo que permite conectar clientes de chat existentes sin infraestructura cloud y manteniendo los datos en el equipo.
- Programación asistida en el editor: el autor documenta integración con OpenCode, Claude Code y Codex mediante `rapid-mlx agents`, de modo que el modelo actúa como backend local para tareas de generación y revisión de código en el flujo del desarrollador.
- Prototipado de aplicaciones con API OpenAI: al replicar el esquema `/v1/chat/completions`, se puede desarrollar y probar código contra el modelo local y cambiar después a un proveedor remoto (o viceversa) sin reescribir la capa de integración.
- Evaluación de decodificación especulativa: investigadores pueden comparar tok/s con y sin MTP sobre el mismo prompt y hardware, usando el hash de tokens emitidos para verificar que la salida no cambia.
- Despliegue en estaciones de trabajo Apple Silicon con 32 GB de memoria unificada: el tamaño de 16,3 GB del objetivo más los pesos MTP encaja en equipos de gama alta de escritorio, permitiendo inferencia local de un modelo de ~27B sin GPU dedicada.
- Generación de texto en inglés y chino para documentación o atención al cliente bilingüe: el soporte declarado de ambos idiomas cubre escenarios de soporte y redacción en esas dos lenguas, con la salvedad de que no se documentan otros idiomas.
- Pruebas de compatibilidad de runtimes MLX: el repositorio sirve como referencia para validar que una versión de Rapid-MLX carga correctamente el sidecar MTP y cae a decodificación autoregresiva cuando no es beneficioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta una medición de velocidad en un sistema de prueba Apple Silicon Studio: un prompt medido alcanzó 39,66 tok/s en modo autoregresivo y 46,73 tok/s con Rapid MTP (factor 1,18x). El propio autor advierte que es un resultado de compatibilidad, no una afirmación universal de velocidad, y que el rendimiento varía según prompt y hardware.

| Metrica | Valor | Contexto |
|---|---|---|
| Throughput autoregresivo | 39,66 tok/s | Un prompt medido, Apple Silicon Studio |
| Throughput con MTP | 46,73 tok/s | Mismo prompt y sistema |
| Aceleración MTP | 1,18x | Resultado de compatibilidad, no universal |
| Consistencia de salida | Hash de tokens idéntico con y sin MTP | Prueba greedy emparejada |

## Requisitos de hardware

- Memoria unificada recomendada: 32 GB para el objetivo de 16,3 GB más los pesos MTP, según la model card.
- Plataforma: Apple Silicon exclusivamente; el formato MLX y la librería `mlx` no son compatibles con CUDA ni con CPU x86 convencional.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables; este paquete no está pensado para esas plataformas.
- ¿Cabe en GPU de consumo? No en el sentido habitual: requiere un Mac con memoria unificada suficiente (32 GB recomendados). No se documentan requisitos para Macs de 16 GB.
- Despliegue: `rapid-mlx serve` con configuración especulativa MTP (`--speculative-config '{"method":"mtp","model":"rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX"}'`), además de la app de escritorio Rapid-MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 39,66 tok/s autoregresivo y 46,73 tok/s con MTP en un sistema Apple Silicon Studio de prueba; sin datos de latencia por token ni de throughput en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX | ~27,36 B | no disponible | 4-bit MLX + MTP | Apache 2.0 | Apple Silicon (MLX) |
| mlx-community/Qwen3.8-27B-4bit | ~27,36 B (mismo base) | no disponible | 4-bit MLX | Apache 2.0 (heredada del base) | Apple Silicon (MLX) |
| mlx-community/Qwen3.8-27B-MTP-4bit | ~27,36 B (mismo base) | no disponible | 4-bit MLX (drafter MTP) | Apache 2.0 (heredada del base) | Apple Silicon (MLX) |
| Qwen/Qwen3.8-27B | ~27,36 B | no disponible | pesos originales | Apache 2.0 | Multiplataforma |

La comparativa se limita a las variantes del mismo modelo base citadas en la model card, ya que no se proporcionan datos de rendimiento ni de contexto que permitan contrastar con familias alternativas de tamaño similar. La diferencia práctica del paquete Rapid-MLX frente a las variantes de `mlx-community` es la distribución conjunta de objetivo y drafter MTP en un único repositorio, con el emparejamiento verificado por el autor.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al heredar el comportamiento del modelo base Qwen3.8-27B, sus sesgos y limitaciones siguen aplicándose.
- Alucinación: no se aportan evaluaciones de fiabilidad ni tasas de alucinación; como modelo generativo de ~27B, es esperable que pueda producir contenido incorrecto con apariencia plausible, por lo que requiere verificación en usos críticos.
- Contexto: la longitud de contexto no se especifica en el repositorio; no debe asumirse un valor concreto sin consultar la configuración del modelo base.
- Idiomas: solo inglés y chino están declarados; el rendimiento en castellano u otras lenguas no está garantizado ni documentado.
- Licencia: Apache 2.0 permite uso comercial, pero la model card indica que la licencia y limitaciones del modelo upstream continúan aplicándose; conviene revisar los términos de Qwen/Qwen3.8-27B.
- Plataforma: dependencia estricta de Apple Silicon y de una versión de Rapid-MLX que soporte MTP nativo de Qwen3.8; en otras plataformas o runtimes el paquete no es utilizable tal cual.
- Rendimiento MTP: la aceleración medida (1,18x) corresponde a un único prompt y sistema; el autor advierte que el runtime debe caer a decodificación autoregresiva cuando MTP no sea beneficioso, por lo que no se debe presuponer la mejora en todos los casos.
- Memoria: con 16,3 GB de pesos más el drafter, un Mac de 16 GB de memoria unificada queda por debajo del mínimo recomendado de 32 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rapid-mlx/Qwen3.8-27B-4bit-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos objetivo de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Drafter MTP de referencia: https://huggingface.co/mlx-community/Qwen3.8-27B-MTP-4bit
- Instalación de Rapid-MLX: https://rapidmlx.com/install.sh
- Documentación de agentes: https://rapidmlx.com/docs/agents
- Descarga de la app de escritorio: https://rapidmlx.com/download
