# NapYang/ThinkingCap-Qwen3.8-27B-3.80bpw-fp16

## Resumen
ThinkingCap-Qwen3.8-27B-3.80bpw-fp16 es una version cuantizada en formato MLX del modelo ThinkingCap-Qwen3.8-27B, publicado por el usuario NapYang. Se trata de un modelo de aproximadamente 27.781 millones de parametros construido sobre la arquitectura Qwen3.5 (clase Qwen3_5ForConditionalGeneration) y que incorpora una capa de prediccion multi-token (MTP) destinada a decodificacion especulativa. El repositorio incluye los pesos cuantizados en safetensors con una biblioteca MLX, pensados para ejecucion en Apple Silicon.

El elemento mas distintivo es su estrategia de cuantizacion por capas: parte de un valor por defecto de 3 bits (group_size=64, afin) y aplica 409 anulaciones especificas por capa, de modo que combinaciones de 3, 4, 5 y 8 bits conviven en el mismo modelo hasta alcanzar una media de 3,80 bits por peso (bpw). La intencion declarada es preservar las rutas mas sensibles numericamente (proyecciones K/V de atencion, atencion lineal, capas MTP) mientras se comprimen agresivamente las proyecciones MLP intermedias.

La relevancia de esta ficha es acotada: se trata de una publicacion reciente (octubre de 2026) sin descargas ni valoraciones registradas, y cuya model card no aporta datos de benchmarks, idiomas ni contexto. Su interes principal reside en la metodologia de cuantizacion mixta documentada capa por capa y en su orientacion al ecosistema MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (Qwen3_5ForConditionalGeneration), con capas de atencion lineal y 1 capa de prediccion multi-token (MTP) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin mixta MLX: 3, 4, 5 y 8 bits; media de 3,80 bpw; group_size 64 y 128 segun capa |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento
La informacion disponible describe la arquitectura base como Qwen3.5 (Qwen3_5ForConditionalGeneration), de aproximadamente 27B de parametros, con una mayoria de capas dotadas de mecanismos de atencion lineal y una unica capa de prediccion multi-token (MTP) destinada a la decodificacion especulativa o generacion multi-token. No se detallan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO; estos datos no estan disponibles.

Lo mas documentado del repositorio es el proceso de cuantizacion, no el entrenamiento. El autor aplica 409 anulaciones de cuantizacion por capa sobre un valor global de 3 bits (group_size=64, modo afin). Las proyecciones K y V de atencion de cada cuarta capa (3, 7, 11, ..., 63) se elevan a 8 bits para proteger la fidelidad de la ruta clave/valor; las capas de atencion lineal (proyecciones QKV, Z y de salida) se fijan uniformemente en 4 bits; las proyecciones down de las MLP siguen una estrategia bimodal (5 bits en las 7 primeras y 8 ultimas capas, 3 bits en las 48 intermedias); embedding y LM head usan 3 bits con group_size=128; y la capa MTP se cuantiza de forma independiente a 4 bits en todas sus proyecciones.

## Capacidades
- Generacion de texto e instrucciones: la model card ejemplifica su uso con prompting directo mediante `mlx_lm.generate`.
- Generacion de codigo y autoría de SVG: el repositorio incluye un SVG animado (`pelican_motorcycle.svg`, 13,4 KB) generado por el modelo, con 32 animaciones SMIL simultaneas (ruedas giratorias, alas batientes, particulas de escape, fondos con parallax), lo que se presenta como prueba de seguimiento de instrucciones y generacion de codigo SVG.
- Prediccion multi-token: incorpora 1 capa MTP, orientada a decodificacion especulativa y generacion acelerada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso
- Generacion de codigo en el ecosistema Apple: el modelo se distribuye exclusivamente en formato MLX, por lo que su uso natural es la asistencia de codigo integrada en herramientas de desarrollo sobre macOS con Apple Silicon, aprovechando la carga directa con `mlx_lm`.
- Prototipado local en portatiles Mac: con un peso de repositorio de 14 GB, es viable para desarrolladores que quieran probar un modelo de ~27B sin depender de GPU dedicada ni de servicios en la nube.
- Investigacion en cuantizacion: la documentacion detallada de 409 anulaciones por capa convierte al repositorio en un caso de estudio util para medir el impacto de asignaciones de bits heterogeneas en la calidad de salida.
- Experimentacion con decodificacion especulativa: la capa MTP incluida permite investigar tecnicas de generacion multi-token y comparar su velocidad frente a la decodificacion autoregresiva estandar.
- Generacion de graficos vectoriales y contenido visual declarativo: el ejemplo del SVG animado sugiere aplicaciones en generacion de assets SVG, diagramas e ilustraciones tecnicas donde el modelo pueda emitir codigo de marcado.
- Demostraciones y evaluacion comparativa de cuantizaciones: permite comparar este esquema mixto a 3,80 bpw frente a cuantizaciones uniformes a 4 bits del mismo modelo base en tareas de generacion.
- Despliegue en pipelines de inferencia MLX: integrable en scripts de Python con `mlx_lm` para generacion por lotes en entornos con hardware de Apple.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparativas cuantitativas frente a otras cuantizaciones.

## Requisitos de hardware
- VRAM/unified memory estimada: el repositorio ocupa 14,0 GB, por lo que se necesita al menos ese espacio mas el overhead de la biblioteca MLX y de la cache KV. Una estimacion prudente se situa en torno a 16-20 GB de memoria unificada, aunque no hay cifras oficiales publicadas.
- Hardware recomendado: al ser un formato MLX, requiere exclusivamente Apple Silicon. No es compatible con GPU NVIDIA o AMD mediante MLX; para esas plataformas habria que recurrir a una conversion a otro formato.
- Encaje en equipos de consumo: con 14 GB de pesos, encajaria en Mac con memoria unificada de 24 GB o superior; en configuraciones de 16 GB queda muy justo o directamente fuera del rango, dependiendo del contexto y el overhead.
- Opciones de despliegue: MLX (`mlx_lm`), segun el ejemplo de la model card. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que ademas requeririan una conversion previa de formato.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion cuantitativa con alternativas del mismo tamano (por ejemplo, otras cuantizaciones del propio ThinkingCap-Qwen3.8-27B o del modelo Qwen3.5 subyacente).

## Limitaciones y advertencias
- Sin datos de evaluacion: no hay benchmarks, por lo que se desconoce la degradacion real de calidad introducida por la cuantizacion a 3,80 bpw.
- Cuantizacion agresiva: las proyecciones MLP intermedias y las proyecciones up/gate se mantienen en 3 bits, lo que puede degradar tareas que dependan de un razonamiento complejo o de matices finos.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo, de modo que no puede asumirse un rendimiento multilingue sin verificacion.
- Contexto desconocido: no se publica la longitud de contexto soportada, un dato critico para planificar aplicaciones con conversaciones largas o documentos extensos.
- Licencia "other": la licencia no es una de las estandar (Apache, MIT, etc.) y no se detallan sus terminos, por lo que es obligatorio revisar las condiciones antes de cualquier uso comercial.
- Riesgo de alucinacion: no evaluado ni documentado en el repositorio.
- Repositorio sin traccion: 0 descargas y 0 valoraciones en la fecha de creacion de la ficha, sin comunidad que valide la calidad del resultado.
- Dependencia de plataforma: el formato MLX limita su uso a Apple Silicon, lo que excluye entornos con GPU NVIDIA/AMD sin conversion previa.
- Cadena de procedencia incompleta: aunque la model card cita "ThinkingCap" y "Qwen3.5", no incluye enlaces ni referencias verificables a esos modelos base en la informacion disponible.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/NapYang/ThinkingCap-Qwen3.8-27B-3.80bpw-fp16
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Repositorio de MLX-LM: https://github.com/ml-explore/mlx-lm
- Modelos Qwen: https://huggingface.co/Qwen
- Modelo base ThinkingCap-Qwen3.8-27B: no disponible en la informacion proporcionada
- Paper o blog de ThinkingCap: no disponible en la informacion proporcionada
