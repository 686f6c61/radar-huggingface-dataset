# netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter

## Resumen

El repositorio `netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter` contiene un adaptador LoRA en formato mlx-lm, exportado a partir del adaptador original de `harness-hub/Qwen3.8-27B-think-pi-adapted`. Se trata de un ajuste fino orientado a agentes de codificacion (el agente pi) sobre el modelo base Qwen/Qwen3.8-27B, un transformer de 27.000 millones de parametros con 64 capas, de las cuales 16 son de atencion completa. El adaptador pesa 638 MB, tiene rango 32 y escala 2.0, y aplica sobre las proyecciones q, k, v y o de las 16 capas de atencion completa y sobre gate, up y down de las 64 capas.

La relevancia de esta publicacion es practica: permite ejecutar el ajuste sobre cualquier build MLX del modelo base, activando y desactivando el adaptador sin duplicar pesos, en equipos Apple Silicon. El entrenamiento original uso aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de codificacion pi, con modo thinking activado, esfuerzo de razonamiento xhigh y un limite de 32.768 tokens de salida. El checkpoint publicado es el paso 90, elegido entre los pasos 70, 90, 120 y 150.

El adaptador es hermano del `Qwen3.8-27B-pi-adapted` (sin thinking). Segun los resultados publicados por harness-hub, ambos alcanzan puntuaciones equivalentes en SWE-bench Pro y Terminal-Bench 2.1, pero la variante think-pi lo consigue con aproximadamente un 42 % menos de tokens de salida en SWE-bench Pro (media) y un 35 % menos (mediana) en Terminal-Bench 2.1. El autor de este repositorio (NetProjects / Internet Projects Ltd) no esta afiliado a Hugging Face, harness-hub ni Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.8-27B); adaptador LoRA sobre atencion y MLP |
| Parametros totales | 27.000 millones (modelo base); adaptador LoRA de 638 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso un limite de 32.768 tokens de salida) |
| Tipos de cuantizacion | Adaptador en float32; builds mergeados en MLX 4-bit, 6-bit, 8-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato de adaptador mlx-lm (256 modulos LoRA, rango 32, escala 2.0) |
| Libreria | mlx / mlx-lm (>= 0.32.2) |
| Pipeline | image-text-to-text |
| Tamano del repo | 0,7 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 27.000 millones de parametros con 64 capas, de las cuales 16 son de atencion completa; el resto emplea el esquema de atencion eficiente propio de la familia Qwen3.8. El adaptador LoRA se aplica sobre las proyecciones q, k, v y o de esas 16 capas de atencion completa y sobre gate, up y down de las 64 capas, sumando 256 modulos LoRA con rango 32 y escala 2.0. Los pesos del adaptador son los valores float32 originales de harness-hub, transpuestos al layout de mlx-lm; la equivalencia se verifico elemento por elemento (cada actualizacion de modulo equivale exactamente a `2.0 · B @ A` del archivo original).

El entrenamiento original lo realizo harness-hub con aprendizaje por refuerzo (AsyncGRPO en TRL) dentro del agente de codificacion pi, con thinking activado, esfuerzo de razonamiento xhigh y un tope de 32.768 tokens de salida. Se publico el checkpoint del paso 90, seleccionado entre los pasos 70, 90, 120 y 150. El objetivo del ajuste es que el modelo resuelva tareas de agente (uso de herramientas, edicion de codigo, terminal) con menos tokens de razonamiento que la variante con thinking sin adaptar, manteniendo la misma calidad. No se detalla en la informacion disponible la composicion del dataset de RL ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento en modo thinking (chain-of-thought), con esfuerzo de razonamiento configurable (xhigh en el entrenamiento).
- Codificacion y agentes de codigo: ajuste especifico para el agente pi, con resolucion de tareas de SWE-bench Pro y Terminal-Bench 2.1.
- Tool calling / function calling: verificado funcionalmente (genera llamadas a herramientas bien formadas).
- Razonamiento multi-paso y uso de terminal (bash, pipelines, edicion de ficheros).
- Capacidad multimodal image-text-to-text segun el pipeline declarado (heredada del modelo base; no se detalla en la model card).
- Multilingue: no disponible (los idiomas no estan declarados).
- Conmutacion de adaptador: permite mantener un unico modelo base y activar/desactivar el LoRA.
- Integracion con mlx-lm (generate, server) y con el agente pi mediante servidor local.

## Casos de uso

- Agente de codificacion en local: ejecutar pi contra `mlx_lm.server` con el adaptador activo y thinking encendido, para tareas de edicion de repositorio y ejecucion de comandos en terminal en un Mac, sin depender de APIs externas.
- Resolucion de issues tipo SWE-bench: el ajuste esta entrenado sobre tareas de parcheo de repositorios reales, con puntuaciones publicadas de 76,5 % en SWE-bench Pro (hard 51) y 57,5 % en Terminal-Bench 2.1, lo que lo hace adecuado para pipelines de reparacion automatica de bugs.
- Automatizacion de tareas de shell: generar one-liners bash, scripts de conteo, limpieza o procesamiento de ficheros, aprovechando el entrenamiento en Terminal-Bench y el tool calling verificado.
- Reduccion de coste de inferencia en agentes: al lograr puntuaciones equivalentes con un 35-42 % menos de tokens de salida, es util en bucles de agente donde el coste dominante es la generacion de razonamiento.
- Evaluacion comparativa de adaptadores: mantener un unico build MLX del modelo base y alternar entre el adaptador think-pi y el pi-adapted para comparar comportamiento con y sin thinking.
- Desarrollo en equipos Apple Silicon con memoria limitada: usar el build MLX 4-bit (16,3 GB) o 6-bit (23,1 GB) con 32-36 GB de RAM unificada para prototipos de agentes de codigo.
- Servicio local de asistencia tecnica: desplegar `mlx_lm.server` con el adaptador para un equipo pequeno, con tool calling y contexto de conversacion multi-turno.

## Benchmarks y rendimiento

Resultados publicados por harness-hub bajo el agente pi, con thinking activado y un intento por tarea:

| Benchmark | Qwen3.8-27B, thinking | pi-adapted, thinking | think-pi |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 74,5 % | 74,5 % | 76,5 % |
| Terminal-Bench 2.1 (87 tareas) | 60,9 % | 59,8 % | 57,5 % |

harness-hub indica que las tres variantes estan al mismo nivel (las diferencias no son significativas) y que think-pi alcanza esos resultados con aproximadamente un 42 % menos de tokens de salida en SWE-bench Pro (media) y un 35 % menos (mediana) en Terminal-Bench 2.1 frente a pi-adapted con thinking.

Calidad de los builds mergeados (verificacion del autor en MacBook Pro M5 Max de 128 GB, 24 de noviembre de 2026, mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11):

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt de 8K tokens | RAM de Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendado) | 23,1 GB | 98,8 % | 0,0014 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,1 % | 0,0004 | 44/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,0 % | 0,0187 | 46/50 | 17,1 GB | 32 GB+ |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

## Requisitos de hardware

- VRAM/RAM unificada estimada para inferencia: 17,1 GB de pico con el build 4-bit y prompt de 8K tokens; 23,4 GB con el 6-bit; 29,7 GB con el 8-bit; 53,4 GB con bf16.
- El adaptador solo (638 MB) se suma al build del modelo base que se cargue; con `mlx-community/Qwen3.8-27B-4bit` el requisito practico es el de ese build.
- GPU: exclusivamente Apple Silicon (mlx). Verificado en MacBook Pro M5 Max de 128 GB. No hay soporte declarado para A100, H100 ni RTX 4090 en esta publicacion.
- Cabe en GPU consumer de Apple: si, en equipos con 32 GB o mas de memoria unificada usando 4-bit; 36 GB+ para 6-bit; 48 GB+ para 8-bit; 96 GB+ para bf16.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, `mlx_lm.server`) y el agente pi contra el servidor local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card solo indica que los builds mergeados son "ligeramente mas rapidos" que base + adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (SWE-bench Pro / Terminal-Bench 2.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-think-pi-adapted (este adaptador) | 27B (base) | no disponible | 76,5 % / 57,5 % | Apache-2.0 | Adaptador MLX, builds 4/6/8-bit/bf16 |
| Qwen3.8-27B-pi-adapted (sin thinking) | 27B (base) | no disponible | 74,5 % / 59,8 % | Apache-2.0 | Adaptador original de harness-hub |
| Qwen3.8-27B con thinking (sin ajuste) | 27B | no disponible | 74,5 % / 60,9 % | Apache-2.0 | Modelo base Qwen |

Las tres variantes se consideran al mismo nivel segun harness-hub; la diferencia practica de este adaptador es el menor consumo de tokens de salida, no una mejora de precision. No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Las diferencias de puntuacion frente a las otras variantes no son significativas segun el propio autor del ajuste; no debe interpretarse como una mejora de precision.
- Terminal-Bench 2.1 baja de 60,9 % (base con thinking) y 59,8 % (pi-adapted) a 57,5 % en think-pi, aunque harness-hub lo considera dentro del ruido.
- El adaptador esta entrenado especificamente para el agente pi; fuera de ese entorno o de tareas de codificacion y terminal su comportamiento no esta documentado.
- Requiere thinking activado para reproducir los resultados publicados; con thinking desactivado solo se verifico una comprobacion funcional (una llamada a herramienta y 3/3 tareas cortas de codigo).
- Solo funciona en el ecosistema MLX (Apple Silicon); no hay pesos GGUF ni compatibilidad con CUDA.
- Idiomas soportados no declarados; el rendimiento multilingue no esta verificado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen3.8-27B.
- Licencia Apache-2.0 permite uso comercial, pero el `NOTICE` atribuye el trabajo a harness-hub y al equipo Qwen (Alibaba Cloud); conviene conservar las atribuciones.
- El autor (NetProjects) no esta afiliado a Hugging Face, harness-hub ni Alibaba; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de terceros.
- La model card indica fecha de creacion en 2026 y verificacion en un M5 Max; estos datos deben tratarse como declaraciones del autor.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-adapter
- Adaptador original: https://huggingface.co/harness-hub/Qwen3.8-27B-think-pi-adapted
- Variante sin thinking: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build MLX 6-bit (recomendado): https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-6bit
- Build MLX 8-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-8bit
- Build MLX 4-bit: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-4bit
- Build MLX bf16: https://huggingface.co/netprojects/Qwen3.8-27B-think-pi-adapted-MLX-bf16
- Build MLX 4-bit del modelo base: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- Repositorio del agente pi: https://github.com/earendil-works/pi
- Mas builds de NetProjects: https://huggingface.co/netprojects
- Sitio del autor: https://netprojects.com
