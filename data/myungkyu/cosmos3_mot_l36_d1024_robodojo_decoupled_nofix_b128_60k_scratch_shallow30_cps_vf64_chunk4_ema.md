# Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_ema

## Resumen

Cosmos3-Nano es un modelo de mundo (world model) de vídeo orientado a robótica, desarrollado sobre el framework Cosmos y publicado por el usuario Myungkyu en Hugging Face. Esta variante concreta ha sido ajustada fina (fine-tuning) con un DiT de acción externo para control robótico en bucle cerrado, empleando condicionamiento unidireccional vídeo-a-acción y esquemas de ruido desacoplados: el ruido de la acción se muestrea de forma independiente al del vídeo, sobre una pasada de vídeo puro con ruido y sin gradientes.

El modelo se entrena sobre el conjunto RoboDojo Sim en formato LeRobot v3.0 y se distribuye como pesos EMA en bf16 del checkpoint final, almacenados como un checkpoint de `torch.distributed` (DCP) de un solo rango, sin estado del optimizador. El repositorio ocupa 31,7 GB e incluye el DCP, un `config.yaml` con la configuración de entrenamiento (rutas locales sustituidas por marcadores) y un fichero `SHA256SUMS` con las sumas de verificación.

Por su naturaleza, no es un modelo de lenguaje: es una política de acción para robótica que requiere el servidor de políticas de acción de `cosmos-framework` y un VAE de Wan2.2 para funcionar. Su relevancia radica en explorar el acoplamiento entre modelos de mundo de vídeo y políticas de acción en entornos simulados, aunque su adopción práctica está limitada por la ausencia de documentación pública, licencia declarada y métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cosmos3-Nano (world model de vídeo) con DiT de acción externo; condicionamiento unidireccional vídeo-a-acción y ruido desacoplado |
| Parametros totales | no disponible (la nomenclatura `l36_d1024` sugiere 36 capas y dimensión 1024, sin confirmación oficial) |
| Parametros activos | no aplica (no se documenta MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | no disponible |
| Formato de pesos | torch.distributed.checkpoint (DCP); `model/__0_0.distcp` y `model/.metadata`, bf16 |

## Arquitectura y entrenamiento

La arquitectura combina un modelo de mundo de vídeo Cosmos3-Nano con un DiT de acción externo. El condicionamiento es unidireccional: el vídeo condiciona la generación de acciones, pero no al revés. Los esquemas de ruido están desacoplados, de modo que el ruido de la acción se muestrea independientemente del ruido del vídeo, y se realiza una pasada de vídeo puro con ruido bajo `no_grad`. El nombre del repositorio indica detalles adicionales de configuración (`shallow30`, `cps`, `vf64`, `chunk4`, `b128`, `60k`, `ema`), pero no se documenta su significado exacto.

El entrenamiento se realizó sobre RoboDojo Sim en formato LeRobot v3.0, con un tamaño de lote de 128 y 60 000 pasos según la nomenclatura del identificador. Los pesos publicados corresponden a las EMA (`net_ema`) del checkpoint final, convertidos a bf16 y almacenados bajo los nombres `net.*`. No se incluye estado del optimizador ni el otro conjunto de pesos del checkpoint de entrenamiento.

## Capacidades

- Control robótico en bucle cerrado a partir de observaciones de vídeo, mediante la generación de acciones con un DiT externo.
- Modelado de mundo de vídeo: predicción y generación de fotogramas condicionada por acciones.
- Condicionamiento vídeo-a-acción con ruido desacoplado, que permite muestrear acciones independientemente del ruido del vídeo.
- Integración con el servidor de políticas de acción de `cosmos-framework` mediante `--checkpoint-path` y `--config-file`.
- Entrenado específicamente en el simulador RoboDojo, en formato LeRobot v3.0.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en políticas de acción para robótica simulada: el modelo permite experimentar con el acoplamiento entre un world model de vídeo y un DiT de acción en RoboDojo Sim, un entorno controlado y reproducible.
- Evaluación de esquemas de ruido desacoplados: sirve para estudiar cómo afecta muestrear el ruido de la acción de forma independiente al del vídeo en la calidad de las políticas resultantes.
- Reproducción de experimentos de entrenamiento: el `config.yaml` incluido permite reconstruir la configuración (longitud de chunk, ratio de vídeo, formato de prompt y ajustes de estado) en el servidor de `cosmos-framework`.
- Punto de partida para ajuste fino en nuevos simuladores: al ser pesos EMA en bf16 sin estado del optimizador, pueden servir como inicialización para entrenamientos posteriores en otros entornos LeRobot.
- Estudio comparativo de world models para control: útil para investigadores que comparen Cosmos3-Nano frente a otros modelos de mundo de vídeo en tareas de manipulación simulada.
- Docencia y prototipado en laboratorio: con el VAE de Wan2.2 y el servidor de acción, permite montar un pipeline completo de política vídeo-a-acción sin depender de infraestructura propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 31,7 GB en bf16, por lo que se requiere al menos esa cantidad de memoria para cargar los pesos completos, más la memoria del VAE de Wan2.2 y del servidor de acción.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, se necesitan GPU con 40-80 GB de VRAM (A100 80 GB, H100) para una carga completa en bf16; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible; con 31,7 GB de pesos en bf16 no cabe en GPUs de 24 GB sin cuantización, y no se documentan formatos cuantizados.
- Opciones de despliegue: servidor de políticas de acción de `cosmos-framework` con `--checkpoint-path <repo> --config-file config.yaml`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano (esta variante) | World model de vídeo + DiT de acción | no disponible | no disponible | no disponible | Hugging Face (DCP, 31,7 GB) |
| Cosmos3-Nano base | World model de vídeo | no disponible | no disponible | no disponible | Referenciado en la model card como `<Cosmos3-Nano-dcp>` |
| Wan2.2-TI2V-5B (VAE) | VAE de vídeo | 5B (modelo completo) | no disponible | no disponible | Hugging Face (Wan-AI) |

No se dispone de datos de rendimiento ni de parámetros comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- No hay model card detallada, paper, demo ni métricas de evaluación publicadas; la documentación se limita a la descripción de ficheros y carga.
- El modelo está entrenado exclusivamente en RoboDojo Sim; se desconoce su transferencia a robots reales o a otros simuladores.
- Los pesos son EMA en bf16 sin estado del optimizador, lo que limita la reanudación exacta del entrenamiento.
- El `config.yaml` contiene rutas locales sustituidas por marcadores (`<Cosmos3-Nano-dcp>`, `<dataset root>`, `<Wan2.2_VAE.pth>`, `<video warm-up checkpoint>`) que deben reemplazarse manualmente.
- Requiere dependencias externas no incluidas en el repositorio: el framework `cosmos-framework` y el VAE `Wan2.2_VAE.pth` de Wan-AI/Wan2.2-TI2V-5B.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación; al tratarse de un modelo de simulación, los comportamientos aprendidos pueden no generalizar fuera de la distribución de RoboDojo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Myungkyu/cosmos3_mot_l36_d1024_robodojo_decoupled_nofix_b128_60k_scratch_shallow30_cps_vf64_chunk4_ema
- VAE de referencia (Wan-AI/Wan2.2-TI2V-5B): https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Framework Cosmos: no disponible (no se proporciona URL en la información disponible)
- Paper, blog, repositorio o demo: no disponible
