# mohommed/LFM3-1.7B-Frontier-SmartAgentv3-GGUF

## Resumen

LFM3-1.7B-Frontier-SmartAgentv3-GGUF es la distribucion cuantizada en formato GGUF del modelo mohommed/LFM3-1.7B-Frontier-SmartAgentv3, un ajuste fino de la familia LFM3 de Liquid AI con 1.728.801.600 parametros (aproximadamente 1,7 mil millones). El autor, identificado como mohommed, lo orienta explicitamente a tareas de agente de codigo de largo horizonte: gestion de monorepos de hasta 10.000 ficheros y 1 millon de lineas de codigo, generacion de frontend y desarrollo de videojuegos 2D. Se publica bajo licencia Apache 2.0.

La model card describe cuatro mejoras acumulativas sobre las versiones V1 y V2: un ledger de maquina de estados para mantener el estado de ejecucion entre 10 y 30 pasos, un gestor AST quirurgico basado en el modulo `ast` de Python, una memoria persistente de patrones de codigo (`.second_brain_skills.json`) y una arquitectura de UI frontend y motor de juego 2D con fisica de impulso-momento y sintesis de audio procedural. Ademas, el autor indica que el modelo ha sido "descensurado" mediante una descomposicion SVD de doble subespacio posterior al merge.

El interes de esta ficha es doble: por un lado, documenta un modelo pequeno (1,7B) con contexto declarado de 512K tokens, lo que resulta poco habitual en esa escala; por otro, sirve como ejemplo de publicacion con etiquetas muy ambiciosas cuya verificacion empirica es practicamente inexistente. El repositorio cuenta con 168 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3 de Liquid AI; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 512K tokens (declarado en la model card y en las etiquetas) |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por `llama-imatrix`; niveles concretos no especificados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 4,0 GB); el modelo base se distribuye en safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | mohommed/LFM3-1.7B-Frontier-SmartAgent |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. El nombre y las etiquetas remiten a LFM3, la familia de modelos de Liquid AI, pero la model card no confirma si se trata de un transformer convencional, de una arquitectura hibrida o de un diseno con capas recurrentes. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Lo unico documentado es el proceso de ajuste fino del autor sobre el modelo base mohommed/LFM3-1.7B-Frontier-SmartAgent.

Las innovaciones que declara el autor son de caracter funcional mas que arquitectonico. El ledger de maquina de estados (`DONE` -> `CURRENT` -> `NEXT`) pretende sostener el estado de ejecucion a lo largo de builds de 10 a 30 pasos. El gestor AST emplea el modulo `ast` de Python para localizar simbolos y rangos de linea y aplicar diffs quirurgicos, de modo que el modelo no necesite cargar ficheros completos en contexto. La memoria `.second_brain_skills.json` destila patrones de codigo y correcciones verificadas en un almacen persistente. El "descensurado" se realiza mediante SVD de doble subespacio aplicado tras el merge, y la cuantizacion GGUF se genera con `llama-imatrix` para preservar la ventana de 512K.

## Capacidades

- Generacion de texto y codigo en el marco de tareas de agente de largo horizonte.
- Gestion de monorepos de gran tamano mediante localizacion de simbolos y diffs quirurgicos sobre el AST de Python.
- Mantenimiento de estado multi-paso entre 10 y 30 iteraciones de build mediante ledger `DONE`/`CURRENT`/`NEXT`.
- Generacion de interfaces frontend con estilos declarados (Swiss-Grid, Neo-Brutalist, paletas `#09090B`, `#F4F1EA`, `#FF3B00`).
- Desarrollo de videojuegos 2D con fisica de impulso-momento subdividida, apuntado por raycast y sintesis de audio procedural WebAudio sin assets.
- Memoria persistente de patrones de codigo y correcciones de bugs (`.second_brain_skills.json`).
- Modo "uncensored" declarado por el autor, con reduccion de rechazos mediante SVD post-merge.
- Soporte de tool calling, function calling y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible (la sintesis de audio es codigo generado, no entrada multimodal).

## Casos de uso

- Refactorizacion de monorepos grandes: el gestor AST permite localizar simbolos y rangos de linea concretos y aplicar diffs acotados, lo que reduce la necesidad de volcar ficheros completos en el contexto y hace viable trabajar sobre repositorios de hasta 10.000 ficheros.
- Automatizacion de builds de varios pasos: el ledger de estado `DONE`/`CURRENT`/`NEXT` mantiene la traza de ejecucion en pipelines de 10 a 30 pasos, util para tareas de migracion o scaffolding que requieren continuidad entre turnos.
- Generacion de prototipos de frontend: el ajuste sobre paletas y estilos concretos (Swiss-Grid, Neo-Brutalist, consolas oscuras) lo hace adecuado para producir maquetas de UI coherentes sin partir de cero en cada iteracion.
- Desarrollo de minijuegos 2D en web: la fisica de impulso-momento subdividida, el apuntado por raycast y la sintesis WebAudio sin assets permiten generar mecanicas jugables completas en un unico flujo de codigo.
- Asistente de codigo con memoria de proyecto: la memoria `.second_brain_skills.json` acumula patrones y correcciones verificadas, lo que resulta util en sesiones recurrentes sobre el mismo repositorio.
- Despliegue en entornos con recursos limitados: con 1,7B parametros y pesos GGUF de 4,0 GB, el modelo cabe en GPUs de consumo y en CPU, lo que permite ejecutarlo en estaciones de trabajo o portatiles sin infraestructura dedicada.
- Experimentacion con contexto largo: la ventana declarada de 512K tokens permite probar tecnicas de recuperacion y navegacion de codigo en repositorios extensos, aunque la calidad efectiva en esa longitud no esta verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se aportan comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: los pesos GGUF ocupan 4,0 GB en el repositorio; una cuantizacion de 4 bits de 1,7B parametros ronda los 1,0-1,2 GB, una de 5 bits en torno a 1,3 GB y una de 8 bits alrededor de 1,8-2,0 GB. Estas cifras son estimaciones por tamano de parametros; el autor no publica desglose por nivel de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 y equivalentes son suficientes. Para contexto de 512K tokens la cache KV domina el consumo y puede exceder con creces la VRAM de una GPU de consumo, por lo que en la practica se requerira atencion con cache cuantizada, offloading a CPU o GPUs de datacenter (A100, H100) con decenas de GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 4 a 8 bits y con contextos moderados.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) para GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Frontier-SmartAgentv3-GGUF | 1,73B | 512K (declarado) | Apache 2.0 | GGUF | Ajuste comunitario orientado a agentes de codigo; sin benchmarks publicados |
| Qwen2.5-Coder-1.5B | 1,5B | 32K | Apache 2.0 | safetensors, GGUF | Referencia consolidada en generacion de codigo a esa escala, con evaluaciones publicas |
| DeepSeek-Coder-1.3B | 1,3B | 16K | DeepSeek License | safetensors, GGUF | Modelo de codigo pequeno con benchmarks publicados; licencia con restricciones |
| Llama-3.2-1B | 1,2B | 128K | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista pequeno con contexto largo y amplia adopcion |

La comparacion es estructural: los tres modelos alternativos cuentan con evaluaciones publicas y comunidades amplias, mientras que el modelo de esta ficha declara una ventana de contexto muy superior (512K frente a 16K-128K) sin evidencia empirica que la respalde.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos que respalden las capacidades declaradas (contexto de 512K, gestion de 1M de lineas de codigo, fisica de juego, etc.).
- Modelo de 1,7B parametros: la capacidad de razonamiento y de generacion de codigo complejo esta acotada por escala, con independencia de las etiquetas de la model card.
- Contexto de 512K declarado pero no verificado: la calidad de recuperacion en ventanas muy largas no esta documentada y el coste de cache KV puede hacerla inviable en hardware de consumo.
- Riesgo de alucinacion: especialmente alto en tareas de refactorizacion sobre repositorios grandes, donde el modelo puede inventar simbolos o rutas.
- Modelo "uncensored": la reduccion deliberada de rechazos mediante SVD incrementa el riesgo de generar contenido inapropiado o codigo inseguro sin advertirlo; requiere filtros y revision en produccion.
- Idiomas no declarados: no hay informacion sobre el soporte real de castellano u otras lenguas distintas del ingles.
- Trazabilidad limitada: 168 descargas y 0 likes; no hay issues, evaluaciones de terceros ni documentacion adicional sobre el proceso de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad sobre el comportamiento del modelo.
- Las etiquetas de la model card (self-improving, anti-ai-slop, frontier) son afirmaciones de marketing sin respaldo tecnico verificable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgentv3-GGUF
- Modelo base: https://huggingface.co/mohommed/LFM3-1.7B-Frontier-SmartAgent
- Liquid AI (familia LFM): https://www.liquid.ai/
