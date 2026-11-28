# netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-3bit

## Resumen

Qwen3.6-35B-A3B-LayerFit-MLX-3bit es una cuantizacion de 3 bits del modelo Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts (MoE) de 35.107.181.936 parametros totales y aproximadamente 3.000 millones de parametros activos por token, desarrollado originalmente por el equipo Qwen de Alibaba Cloud. La version aqui descrita la publica netprojects (Paris Michalas, NetProjects) y esta especificamente optimizada para Apple Silicon mediante el formato MLX.

El problema que resuelve esta build es el de hacer viable un modelo MoE de 35B en equipos con memoria unificada limitada: los pesos ocupan 16,1 GB en disco, lo que permite cargarlo en Macs de 32 GB de RAM (o de 24 GB en configuracion "stretch"). La tecnica propietaria LayerFit asigna un numero de bits distinto a cada capa segun su sensibilidad medida, en lugar de aplicar una cuantizacion uniforme, mejorando de forma sustancial la fidelidad respecto a un 3-bit plano con el mismo presupuesto de tamano.

Es relevante porque mantiene el torre de vision en bf16 (el modelo es image-text-to-text), conserva la ventana de contexto de 262.144 tokens y el modo thinking activado por defecto, y se carga con las herramientas estandar del ecosistema MLX (mlx-vlm y mlx-lm) sin modificaciones. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo qwen3_5_moe) con atencion lineal y bloques de atencion, torre de vision incluida |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B por token (modelo A3B) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 3 bits con receta LayerFit por capa; router y compuerta del experto compartido en bf16; torre de vision en bf16. Existen builds hermanas de 2, 2.5 y 4 bits |
| Idiomas soportados | No disponible de forma explicita en la informacion proporcionada (el harness de evaluacion cubre ingles, otros idiomas, codigo, tool calls y matematicas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con aproximadamente 35B de parametros totales y unos 3B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La arquitectura combina bloques de atencion con atencion lineal, expertos enrutados y un experto compartido, ademas de una torre de vision que habilita la modalidad image-text-to-text. El contexto nativo es de 262.144 tokens y el modo thinking viene activado por defecto.

Sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se proporciona informacion en la model card de esta build; los detalles deben consultarse en la card de Qwen/Qwen3.6-35B-A3B. La innovacion tecnica de esta publicacion es LayerFit: un procedimiento que mide la degradacion de cada componente (expertos enrutados, experto compartido, bloques de atencion lineal y atencion, embeddings y cabeza de salida) a bajos bits y distribuye un presupuesto fijo de tamano donde mas ayuda. Con 15,2 GB de pesos de lenguaje, la build LayerFit alcanza un 91,1% de acuerdo top-1 con el bf16 de referencia y un error KL de 0,0445, frente al 80,4% y 0,2258 de un 3-bit plano del mismo tamano. La receta exacta esta en `layerfit-recipe.json`.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento con modo thinking (activado por defecto; desactivable con `enable_thinking: false` en los argumentos de la plantilla de chat).
- Comprension de imagenes y respuesta image-text-to-text, incluido el manejo de multiples imagenes en una misma peticion (segun el smoke test del autor).
- Generacion de codigo y resolucion de problemas matematicos (el harness de evaluacion incluye codigo, matematicas y tool calls).
- Soporte de tool calling / function calling (evaluado explicitamente en el harness de LayerFit).
- Capacidades multilingues: el harness de evaluacion incluye "otros idiomas" ademas del ingles, aunque no se detalla la lista de idiomas soportados.
- Compatibilidad con mlx-vlm (multimodal) y mlx-lm (texto) en el ecosistema MLX de Apple.

## Casos de uso

- Asistente local en Mac: ejecutar un modelo de 35B MoE con vision y contexto de 262K en un MacBook de 32 GB de memoria unificada, sin depender de la nube, usando mlx-vlm para entradas multimodales y mlx-lm para texto.
- Analisis de documentos largos: el contexto de 262K tokens permite procesar informes, expedientes o bases de codigo extensas en una sola pasada, manteniendo el razonamiento en modo thinking para tareas de sintesis.
- Descripcion y extraccion de informacion de imagenes: la torre de vision en bf16 permite tareas de image-text-to-text (descripcion de fotos, lectura de diagramas) sin degradacion por cuantizacion en el encoder visual.
- Agentes con tool calling: la evaluacion del harness incluye tool calls, lo que lo hace adecuado para pipelines de agentes que invocan funciones externas en local sobre Apple Silicon.
- Prototipado y evaluacion de modelos MoE en investigacion: al cargarse en mlx-lm y mlx-vlm estandar, sirve para experimentar con decodificacion, plantillas de chat y modos thinking sin infraestructura de GPU dedicada.
- Generacion de codigo en entornos de desarrollo locales: utilizable como asistente integrado en editores o scripts CLI en macOS, con la licencia Apache-2.0 permitiendo uso comercial.
- Despliegue con restricciones de privacidad: al ejecutarse integramente en el dispositivo, es apto para datos sensibles que no deben salir del equipo.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion (harness propio: solo pesos del modelo de lenguaje, vision excluida, 32 pasajes de 512 tokens en ingles, otros idiomas, codigo, tool calls y matematicas, contra la conversion MLX bf16 de Qwen/Qwen3.6-35B-A3B; medido en un MacBook Pro M5 Max el 28 de noviembre de 2026):

| Metrica | 3-bit plano | LayerFit 3-bit (esta build) |
|---|---|---|
| Pesos del modelo de lenguaje | 15,2 GB | 15,2 GB |
| Acuerdo top-1 con bf16 | 80,4% | 91,1% |
| Error KL | 0,2258 | 0,0445 |
| GSM8K-20 (thinking off) | no disponible | 18/20 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completo) para esta cuantizacion; el autor remite a la card de Qwen/Qwen3.6-35B-A3B para los resultados oficiales del modelo base.

## Requisitos de hardware

- Memoria: 16,1 GB en disco para esta build de 3 bits; el autor la recomienda para Macs de 32 GB de memoria unificada (o 24 GB en modo "stretch").
- Builds alternativas del mismo autor segun el equipo: 2 bits (10,3 GB, Mac de 16 GB en modo stretch, solo texto), 2,5 bits (13,7 GB, Mac de 24 GB) y 4 bits (21,6 GB, Mac de 32 GB en stretch o 48 GB).
- GPU: exclusivamente Apple Silicon mediante MLX; no esta pensada para GPU NVIDIA (A100, H100, RTX 4090) ni para CUDA.
- Modo stretch: el autor sugiere `sudo sysctl iogpu.wired_limit_mb=<~75% de la RAM en MB>` para permitir que la GPU use mas memoria, cerrando otras aplicaciones; el ajuste dura hasta reiniciar.
- Despliegue: mlx-vlm (multimodal) y mlx-lm (texto) en versiones actualizadas (`pip install -U mlx-vlm` / `pip install -U mlx-lm`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se indica que las mediciones se hicieron en un MacBook Pro M5 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-LayerFit-MLX-3bit (esta build) | 35,1B totales / ~3B activos | 262K | MLX safetensors, Apple Silicon | Apache-2.0 | Hugging Face (netprojects) |
| Qwen3.6-35B-A3B (base) | 35,1B totales / ~3B activos | 262K | safetensors originales | Apache-2.0 | Hugging Face (Qwen) |
| Qwen3.6-35B-A3B-LayerFit-MLX-4bit (misma familia) | 35,1B totales / ~3B activos | 262K | MLX safetensors, Apple Silicon | Apache-2.0 | Hugging Face (netprojects), 21,6 GB |
| Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit (misma familia) | 35,1B totales / ~3B activos | 262K | MLX safetensors, Apple Silicon | Apache-2.0 | Hugging Face (netprojects), 13,7 GB |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos frente a modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- Es una cuantizacion de 3 bits: aunque LayerFit reduce la perdida (91,1% de acuerdo top-1 frente al bf16), no es equivalente al modelo original; el 8,9% de desacuerdo puede afectar a tareas sensibles.
- Solo funciona en Apple Silicon con MLX; no es desplegable en GPU NVIDIA ni en stacks CUDA (vLLM, TGI, llama.cpp).
- Requiere versiones actualizadas de mlx-vlm y mlx-lm; el autor no garantiza compatibilidad con versiones antiguas.
- El modo thinking viene activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Los benchmarks publicados son del autor de la cuantizacion, con un harness propio y un unico equipo (MacBook Pro M5 Max); no hay validacion independiente.
- No se detalla la lista de idiomas soportados ni datos de sesgo o alucinacion especificos de esta build; deben asumirse los del modelo base Qwen3.6-35B-A3B.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE; LayerFit es marca registrada de NetProjects y la build no esta afiliada a Alibaba Cloud ni al equipo Qwen.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Build de 2 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2bit
- Build de 2,5 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-2.5bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.6-35B-A3B-LayerFit-MLX-4bit
- Perfil del autor en Hugging Face: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
