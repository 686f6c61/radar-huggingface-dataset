# mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit

## Resumen

KAT-Coder-V2.5-Dev-OptiQ-4bit es una cuantizacion mixta de precision (4 y 8 bits) del modelo Kwaipilot/KAT-Coder-V2.5-Dev, publicada por la comunidad mlx-community para su ejecucion local sobre Apple Silicon mediante la libreria MLX. El modelo original es un codificador especializado de tipo `qwen3_5_moe`, con una arquitectura MoE dispersa de 256 expertos enrutados y atencion hibrida que combina capas lineales con capas de atencion completa. Cuenta con 34.660.608.768 parametros totales y esta disenado explicitamente como "reasoning coder": razona antes de responder.

El interes de esta publicacion concreta reside en su empaquetado: es una build `static` de precision mixta que asigna anchos de bit por capa para alcanzar un objetivo de 4,5 bits por peso (400 proyecciones a 4 bits y 111 a 8 bits), lo que resulta en aproximadamente 4,51 bits por peso y un peso en disco de unos 20 GB. Esto permite desplegar un modelo de casi 35.000 millones de parametros en equipos Apple Silicon con memoria unificada moderada, sin necesidad de PyTorch ni de infraestructura en la nube.

La relevancia actual es doble: por un lado, democratiza el acceso a un modelo de codigo de gran tamano en hardware de consumo de Apple; por otro, el ecosistema OptiQ anade carga de precision mixta, cuantizacion de la cache KV y un endpoint compatible con la API de OpenAI, lo que facilita su integracion en flujos de desarrollo locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (MoE dispersa con atencion hibrida lineal + completa) |
| Parametros totales | 34.660.608.768 |
| Parametros activos | no disponible (256 expertos enrutados, numero de activos no especificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit y 8-bit mixtos (precision mixta estatica, ~4,51 bits por peso) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura `qwen3_5_moe`: un transformer con mezcla de expertos (MoE) dispersa de 256 expertos enrutados, combinada con un esquema de atencion hibrida que alterna capas de atencion lineal con capas de atencion completa. Esta combinacion busca reducir el coste computacional y de memoria de la atencion en secuencias largas manteniendo la capacidad expresiva de las capas de atencion completa. El modelo esta orientado a generacion de codigo y sigue un patron de razonamiento explicito (piensa antes de responder).

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineacion en la informacion proporcionada. La publicacion de mlx-community no entrena el modelo, sino que lo cuantiza: aplica una asignacion estatica de anchos de bit por capa (400 proyecciones a 4 bits, 111 a 8 bits) para alcanzar un objetivo de 4,5 bits por peso, preservando presumiblemente las capas mas sensibles en mayor precision.

## Capacidades

- Generacion de codigo en ingles, con modo de razonamiento previo a la respuesta ("reasoning coder").
- Razonamiento multi-paso orientado a tareas de programacion.
- Generacion de texto y conversacion (pipeline `text-generation`, tag `conversational`).
- Servicio mediante endpoint compatible con la API de OpenAI a traves de `optiq serve`.
- Carga bajo `mlx-lm` estandar, ademas del stack OptiQ con precision mixta y cuantizacion de cache KV.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).

## Casos de uso

- Asistencia de programacion en local sobre Mac: el modelo puede ejecutarse con `optiq serve` en un equipo Apple Silicon y ofrecer autocompletado y generacion de funciones sin enviar codigo a la nube, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Integracion en editores e IDE mediante API compatible con OpenAI: al exponer `http://localhost:8000/v1`, se puede apuntar cualquier cliente compatible (plugins de VS Code, Continue, etc.) al modelo local sin cambios de codigo.
- Refactorizacion y explicacion de codigo heredado: el modo de razonamiento previo permite abordar tareas de comprension de bases de codigo y propuesta de cambios justificados paso a paso.
- Generacion de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones o modulos, aprovechando su especializacion en codigo.
- Prototipado rapido de scripts y utilidades CLI: para tareas de automatizacion puntuales donde no se requiere infraestructura de servidor y basta con un portatil o Mac de sobremesa.
- Evaluacion y experimentacion con cuantizacion mixta: investigadores pueden comparar esta build de ~4,51 bits por peso frente a cuantizaciones uniformes de 4 bits para medir el impacto en calidad sobre tareas de codigo.
- Despliegue de bajo coste en laboratorio: con ~20 GB en disco, sirve como banco de pruebas para pipelines de agentes de codigo antes de migrar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: el peso ocupa unos 20 GB en disco y aproximadamente la misma cifra en memoria al cargar; se recomienda un minimo de 24 GB de memoria unificada, y 32 GB o mas para dejar margen a la cache KV y al contexto.
- Hardware objetivo: Apple Silicon (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No esta pensado para GPU NVIDIA ni ROCm, ya que la libreria es MLX.
- GPU de consumo: no aplica en el sentido tradicional; el equivalente es memoria unificada en Mac. En un Mac con 24 GB el modelo entra con contexto limitado; con 32-64 GB hay holgura.
- Despliegue: `optiq serve` (recomendado, anade carga de precision mixta y cuantizacion de cache KV), o `mlx-lm` estandar para carga basica. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su forma actual, al no existir pesos GGUF en esta publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-OptiQ-4bit (esta ficha) | 34,66 B totales (MoE) | no disponible | 4/8-bit mixta (~4,51 bpw) | apache-2.0 | MLX (Apple Silicon) |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | 34,66 B totales (MoE) | no disponible | BF16/FP16 original | apache-2.0 | PyTorch / cualquier stack |
| Otras cuantizaciones 4-bit uniformes del mismo base | 34,66 B totales (MoE) | no disponible | 4-bit uniforme | apache-2.0 | segun herramienta (GGUF, MLX, etc.) |

La comparacion con alternativas de otros fabricantes (por ejemplo, modelos de codigo de tamano similar) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Idioma: los metadatos declaran unicamente ingles (`language: en`); el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: como todo modelo generativo de codigo, puede producir APIs inexistentes, imports erroneos o logica plausible pero incorrecta; requiere verificacion y tests.
- Cuantizacion: la build mixta de 4/8 bits puede degradar ligeramente la calidad frente al modelo base en tareas sensibles a la precision numerica; no se han publicado evaluaciones comparativas que cuantifiquen esa perdida.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (Kwaipilot/KAT-Coder-V2.5-Dev) por si anaden terminos adicionales.
- Plataforma: dependencia de MLX limita el despliegue a Apple Silicon; no hay pesos GGUF ni compatibilidad con stacks CUDA en esta publicacion.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar casos de uso con ventanas largas sin verificacion previa.
- Version "Dev": el sufijo indica una version de desarrollo del modelo base, con posible menor estabilidad que una release final.
- Parametros activos y detalles de enrutamiento MoE no documentados, lo que dificulta estimar coste computacional real por token.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/KAT-Coder-V2.5-Dev-OptiQ-4bit
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Toolkit OptiQ: https://mlx-optiq.com
- Documentacion de OptiQ: https://mlx-optiq.com/docs/
- OptiQ Lab: https://mlx-optiq.com/docs/lab/
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
