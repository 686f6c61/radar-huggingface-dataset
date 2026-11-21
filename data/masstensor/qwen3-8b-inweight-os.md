# masstensor/Qwen3-8B-InWeight-OS

## Resumen

Qwen3-8B-InWeight-OS es un checkpoint derivado de Qwen/Qwen3-8B desarrollado por masstensor que implementa una técnica de post-entrenamiento sin gradientes denominada In-Weight Operating System. El modelo permite componer múltiples habilidades especializadas (seguridad frente a jailbreaks, enrutamiento multi-herramienta en JSON y un router metacognitivo System-1/System-2) modificando únicamente 51 neuronas del MLP terminal, lo que equivale a aproximadamente el 0,014% de los parámetros totales del modelo.

La propuesta resulta relevante porque evita el ajuste supervisado (SFT) y el LoRA tradicionales, que según el autor degradan subespacios densos compartidos y provocan falsos rechazos o alucinaciones de tool-calling. En su lugar, In-Weight OS particiona canales SwiGLU latentes ("dormant channels") en bancos de habilidades estrictamente disjuntos y los activa mediante un solver de guarda-nullspace con calibración OOF, todo compilado en 12-15 segundos en una sola GPU sin pasos de gradiente.

El modelo conserva la arquitectura, tokenizador y ventana de contexto del Qwen3-8B original (8.190.735.360 parámetros totales, pesos en safetensors de 16,4 GB), por lo que puede desplegarse con transformers o vLLM y admite la instalación dinámica de cartuchos individuales de 1-2 MB en aproximadamente 20 milisegundos sobre un Qwen3-8B base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), con particionado de canales SwiGLU en `layers[35].mlp` para bancos de habilidades |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors; el autor menciona despliegue en bfloat16) |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados de Qwen3-8B) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 16,4 GB); cartuchos de habilidades en `.pt` (~1-2 MB cada uno) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de 8.190 millones de parámetros. La innovación de In-Weight OS no reside en reentrenar el modelo, sino en identificar canales SwiGLU "dormidos" en el MLP de la capa 35 y asignarlos a bancos de habilidades disjuntos: `C1` con 15 neuronas para seguridad quirúrgica y resistencia a prompt injection, `C2` con 30 neuronas para compilación de esquemas JSON multi-herramienta, y `C3` con 6 neuronas para enrutamiento metacognitivo System-1/System-2. En total se modifican 51 neuronas, un 0,014% de los parámetros.

El proceso de compilación es zero-gradient: no hay pasos de retropropagación ni ajuste supervisado. El autor emplea un "2-Fold Out-of-Fold Shrinkage-Calibrated Guard-Nullspace Solver" que calibra las intervenciones para evitar el olvido catastrófico y preservar el comportamiento del modelo base. Los cartuchos resultantes son módulos `.pt` de 1-2 MB que pueden instalarse sobre un Qwen3-8B vanilla en unos 20 milisegundos mediante el script `install_skills.py`, lo que permite hot-swapping de habilidades en producción sin recargar el modelo completo.

## Capacidades

- Generación de texto conversacional y razonamiento heredados del Qwen3-8B base.
- Seguridad reforzada: bloquea entre el 95% y el 100% de jailbreaks no vistos, con 0,0% de falsos rechazos en prompts técnicos benignos de XSTest (frente al 80%-100% de falsos rechazos reportados con Safety SFT).
- Tool calling multi-herramienta: enruta consultas a `sql_engine`, `python_exec` o `web_search` con una precisión del 95,8%-100,0%, evitando las alucinaciones de tool-calling matemático (28%-100%) del Tool SFT.
- Router metacognitivo System-1/System-2: responde de forma concisa a consultas factuales o aritméticas triviales y conserva la cadena de pensamiento (CoT) completa en derivaciones matemáticas complejas.
- Composición modular de habilidades mediante cartuchos independientes instalables en caliente.
- Soporte de despliegue en vLLM y transformers.

## Casos de uso

- Moderación y hardening de asistentes conversacionales: el banco `C1` bloquea entre el 95% y el 100% de jailbreaks no vistos sin penalizar consultas técnicas legítimas, lo que lo hace adecuado para chatbots expuestos a usuarios adversarios donde un exceso de rechazos degrada la experiencia.
- Orquestación de agentes con múltiples herramientas: el banco `C2` compila consultas de usuario en llamadas JSON estructuradas a SQL, Python o búsqueda web con precisión del 95,8%-100,0%, útil en pipelines de automatización de datos o asistentes de analítica.
- Reducción de coste en inferencia: el router `C3` desvía consultas triviales a respuestas directas cortas y reserva el razonamiento extendido para problemas difíciles, lo que disminuye tokens generados en producción.
- Despliegue hot-swap en entornos multi-tenant: al poder instalar o retirar cartuchos de 1-2 MB en ~20 ms sobre un Qwen3-8B base, se puede personalizar el comportamiento por cliente o por vertical sin recargar el modelo completo.
- Investigación en post-entrenamiento sin gradientes: sirve como banco de pruebas reproducible para comparar In-Weight OS frente a SFT, LoRA y model merging (Task Arithmetic, TIES-Merging) usando el dataset `InWeight-OS-MultiSkill-Benchmark`.
- Evaluación de alineación de seguridad: permite medir tasas de falsos rechazos y de jailbreak con XSTest y suites adversariales, útil para equipos de red teaming que necesitan un baseline con comportamiento controlado.
- Prototipado rápido de habilidades nuevas: el flujo de compilación en 12-15 segundos en una GPU permite iterar sobre nuevas capacidades sin infraestructura de entrenamiento distribuido.

## Benchmarks y rendimiento

| Habilidad | Metrica | Resultado reportado | Baseline comparado |
|---|---|---|---|
| C1 (seguridad) | Tasa de bloqueo de jailbreaks no vistos | 95%-100% | No disponible |
| C1 (seguridad) | Falsos rechazos en XSTest benigno | 0,0% | 80%-100% con Safety SFT |
| C2 (multi-tool JSON) | Precision de enrutamiento | 95,8%-100,0% | No disponible |
| C2 (multi-tool JSON) | Alucinaciones de tool-calling en matematicas | No reportado | 28%-100% con Tool SFT |
| C3 (router S1/S2) | Criterio cualitativo de enrutamiento | Respuesta directa en triviales, CoT completo en dificiles | No disponible |
| Compilacion | Tiempo de compilacion | 12-15 s en una GPU | SFT/LoRA requieren entrenamiento completo |
| Instalacion de cartucho | Tiempo de hot-swap | ~20 ms | No disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16,4 GB solo de pesos, mas overhead de activaciones y KV cache; se recomienda un minimo de 20-24 GB.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB, ajustado) o RTX A6000.
- En consumer GPU: cabe en RTX 4090 a bfloat16 con contexto moderado; en GPUs de 16 GB seria necesario cuantizar (no se publican pesos GGUF oficiales en la informacion disponible).
- Opciones de despliegue: vLLM (soportado explicitamente por el autor), transformers con `device_map="auto"`, y TGI por la compatibilidad declarada con text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor solo reporta 12-15 s de compilacion y ~20 ms de instalacion de cartuchos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-InWeight-OS | 8,19 B | No disponible (heredado de Qwen3-8B) | Post-entrenamiento zero-gradient con bancos de habilidades disjuntos | MIT | Hugging Face (masstensor) |
| Qwen/Qwen3-8B (base) | 8,19 B | No disponible en la informacion proporcionada | Modelo base sin modificaciones | No disponible en la informacion proporcionada | Hugging Face (Qwen) |
| Qwen3-8B + LoRA/SFT | 8,19 B + adaptadores | Igual que el base | Ajuste supervisado denso | Depende del adaptador | Comunidad |
| Qwen3-8B + TIES-Merging | 8,19 B | Igual que el base | Fusion post-hoc de tareas | Depende de los checkpoints | Comunidad |

La comparativa con otros modelos de 8B (Llama 3.1 8B, Mistral 7B, Gemma 2 9B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo modifica 51 neuronas del MLP de la capa 35; las capacidades declaradas dependen de la calidad del solver y de los datos de calibracion, no de un entrenamiento extenso.
- Las metricas de seguridad (95%-100% de bloqueo, 0,0% de falsos rechazos) proceden del autor y no han sido verificadas de forma independiente en la informacion disponible.
- El repo registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- No se documentan sesgos conocidos, idiomas soportados ni evaluaciones de alucinacion general fuera de los bancos de habilidades.
- La ventana de contexto no se especifica en la model card; debe asumirse la del Qwen3-8B base, pero conviene verificarla antes de desplegar.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen3-8B puede tener sus propias condiciones que deben revisarse por separado.
- Los cartuchos `.pt` requieren cargar codigo Python (`install_skills.py`) y pesos pickle, lo que introduce riesgo de seguridad en la cadena de suministro; conviene auditar el repositorio antes de usarlos en produccion.
- El checkpoint esta fechado en 2026-11-21 segun los metadatos, lo que puede indicar un artefacto de publicacion reciente o experimental; no hay historial de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masstensor/Qwen3-8B-InWeight-OS
- Dataset de benchmark: https://huggingface.co/datasets/masstensor/InWeight-OS-MultiSkill-Benchmark
- Repositorio GitHub: https://github.com/zkwasm/in-weight-os-wsp
- Paper PDF: paper.pdf (referenciado en la model card, sin URL absoluta disponible)
- Articulo del autor: https://tom.fenginwind.com/in-weight-os
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
