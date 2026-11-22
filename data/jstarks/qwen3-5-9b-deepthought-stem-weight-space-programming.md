# jstarks/Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming

## Resumen

Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming es una variante del modelo Qwen3.5-9B-DeepThought-STEM (desarrollado por xtools-at sobre la base Qwen/Qwen3.5-9B) publicada por el usuario jstarks. No se trata de un modelo entrenado desde cero ni de un fine-tune convencional: es una aplicacion de "weight-space programming" (WSP), una tecnica de interpretabilidad mecanistica que modifica el comportamiento del modelo mediante adaptadores LoRA dinamicos calculados en forma cerrada, sin descenso de gradiente ni reentrenamiento de los pesos base.

El modelo base tiene 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y una arquitectura hibrida de 32 capas que combina 24 capas Gated DeltaNet (atencion lineal) con 8 capas de atencion completa, con un tamano oculto de 4096 y un tamano intermedio de 12288. La contribucion de jstarks consiste en 13 subespacios LoRA (63 MiB en total) que se activan y desactivan dinamicamente durante la inferencia para separar la fase de razonamiento (`<think>...</think>`) de la fase de respuesta final, eliminando bucles de reinyeccion de tokens de control y mejorando el rendimiento en tareas STEM y de agente.

La relevancia actual del modelo reside en su enfoque: demuestra que es posible obtener mejoras medibles en benchmarks (hasta +17 puntos porcentuales sobre el modelo base en una bateria de 270 tareas) sin modificar los pesos originales, usando tecnicas de algebra lineal sobre el espacio de pesos y enrutamiento dinamico de adaptadores en tiempo de ejecucion. El repositorio incluye cuantizaciones GGUF Q4_K_M y Q6_K listas para ejecutar con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 32 capas (24 Gated DeltaNet + 8 atencion completa) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (5.383 GiB) y Q6_K (7.040 GiB); pesos base en safetensors BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (base), GGUF (cuantizaciones), LoRA adapters (63 MiB total) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer hibrido Qwen3.5 de 32 capas: 24 capas usan Gated DeltaNet (una forma de atencion lineal con estado recurrente) y 8 capas usan atencion completa. El tamano oculto es 4096 y el tamano intermedio del MLP es 12288. El modelo base fue construido por xtools-at sobre Qwen/Qwen3.5-9B, con fine-tuning orientado a razonamiento de alta intensidad, trazas STEM y descubrimiento de farmacos (RED-PILL).

La innovacion de esta ficha no esta en el entrenamiento sino en el post-procesado: WSP V5 aplica una sintesis de subespacios en forma cerrada sobre las 32 capas en BF16, capturando "receptores" mediante forward hooks y calculando direcciones de modificacion de pesos ortogonales entre si para evitar cancelaciones. El sistema define 13 subespacios (S1 a S13) que se activan en dos fases: la fase 1 (dentro de `<think>`) usa solo S1 y S12; al detectar `</think>`, el router conmuta en aproximadamente 2 ms a los subespacios de fase 2 (S2..S11, S13) y desactiva S1 y S12. Esto elimina fisicamente los bucles de reinyeccion de `</think>` y mejora la precision en tareas de matematicas y agentes. No hay RLHF ni DPO en esta etapa; la modificacion es puramente algebraica y determinista.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento explicito (`<think>...</think>`).
- Razonamiento matematico: problemas de MATH-500, GSM8K y aritmetica de varios pasos.
- Razonamiento STEM: preguntas de nivel universitario en MMLU-Pro y tareas cientificas.
- Generacion de codigo: evaluacion en HumanEval y tareas de terminal.
- Tool calling y function calling: evaluado con BFCL (Berkeley Function Calling Leaderboard) y NL2Bash.
- Operacion en terminal y agentes: Terminal-Bench (tbench20), con resolucion de tareas de shell y transformacion de patrones.
- Capacidades multimodales de entrada: el pipeline declarado es image-text-to-text, heredado del modelo base.
- Enrutamiento dinamico de adaptadores LoRA en tiempo de ejecucion (fase de razonamiento vs fase de respuesta).
- Soporte de cuantizacion GGUF para despliegue en llama.cpp.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de MATH-500 y GSM8K con el modo de dos fases activado, evitando que la respuesta final herede tokens de control del bloque de pensamiento. Es adecuado para tutoria automatica o generacion de soluciones paso a paso.
- Agentes de terminal y automatizacion de shell: con NL2Bash (19/20 en Q6_K) y Terminal-Bench, puede traducir instrucciones en lenguaje natural a comandos de shell y ejecutar tareas de recuperacion de errores multi-turno, util para asistentes de DevOps.
- Function calling en pipelines de integracion: el subespacio S2 reduce falsos positivos de tool calling (0/20 en trampas disjuntas), lo que lo hace util para orquestacion de APIs donde la invocacion erronea tiene coste.
- Evaluacion de interpretabilidad mecanistica: investigadores pueden usar los 13 subespacios y el router como caso de estudio de control de comportamiento sin reentrenamiento, comparando Q4_K_M y Q6_K.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (5,38 GiB) permite ejecutar el modelo en GPUs consumer con 8 GB de VRAM, adecuado para prototipos locales de asistentes STEM.
- Generacion de codigo en entornos con restricciones de red: al ejecutarse con llama.cpp de forma local, puede integrarse en pipelines de CI/CD sin dependencia de APIs externas.
- Investigacion en tecnicas WSP: el repositorio incluye scripts (`build_deepthought_wsp.py`, `deepthought_router.py`, `run_wsp.py`) que sirven como referencia reproducible para aplicar WSP a otros modelos.

## Benchmarks y rendimiento

Los datos provienen de la model card y corresponden a una bateria local de 270 tareas (agent100 + stem150 + tbench20) ejecutada por el autor.

| Configuracion | Total (270) | Agent (100) | STEM (150) | tbench20 (20) | Notas |
|---|---:|---:|---:|---:|---|
| Q6_K + WSP V5 | 178 (65,9%) | 89 | 84 (cut=1) | 5 | +17,0 pp vs Base; 19/20 NL2Bash, 17/20 GSM8K |
| Q4_K_M + WSP V5 | 176 (65,2%) | 86 | 86 (cut=5) | 4 | 20/50 MATH-500, 26/50 MMLU-Pro, 29/30 holdout |
| Base (referencia) | 132 (48,9%) | no disponible | no disponible | no disponible | Dato implicito: +46 tareas en Q6_K |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K completos) en la informacion disponible; los datos anteriores son evaluaciones locales del autor y deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada: Q4_K_M requiere aproximadamente 5,4 GiB para pesos mas overhead de contexto y adaptadores; Q6_K requiere aproximadamente 7,0 GiB mas overhead.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K con contexto largo; RTX 3060/4060 (8-12 GB) para Q4_K_M; A100/H100 no son necesarias para este tamano, pero permiten mayor throughput.
- Cabe en GPU consumer: si, Q4_K_M en GPUs de 8 GB y Q6_K en GPUs de 12 GB o superiores.
- Opciones de despliegue: llama.cpp / llama-server (soporte de `/lora-adapters` y `/completion` requerido por el router), Ollama (si se empaqueta el GGUF con adaptadores), vLLM (no confirmado para LoRA dinamico por peticion en este formato).
- Latencia y throughput: no disponibles; el cambio de adaptadores en el router se estima en aproximadamente 2 ms segun la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---:|---|---|---|---|
| jstarks/Qwen3.5-9B-DeepThought-STEM-WSP | 9,2 B | no disponible | Apache 2.0 | WSP con 13 LoRAs dinamicos | GGUF + safetensors |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | 9,2 B | no disponible | Apache 2.0 | Fine-tune STEM/razonamiento | safetensors + GGUF (mradermacher) |
| Qwen/Qwen3.5-9B | 9,2 B | no disponible | Apache 2.0 (segun base) | Modelo base | safetensors |
| Qwen2.5-7B-Instruct | 7,6 B | 32k (tipico) | Apache 2.0 | Instruct general | amplia |

La comparativa se limita a la familia Qwen3.5 por falta de datos de benchmarks estandar en la informacion disponible; no se dispone de cifras comparables de MMLU o HumanEval para estos modelos en el material consultado.

## Limitaciones y advertencias

- Los benchmarks son evaluaciones locales del autor (270 tareas), no resultados de leaderboards estandar; la comparabilidad con otros modelos es limitada.
- El modelo base incluye fine-tuning "UNCENSORED" en su linaje (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic), lo que puede implicar menor alineacion de seguridad y mayor riesgo de contenido no filtrado.
- Riesgo de alucinacion inherente a modelos de 9B en tareas STEM complejas; los propios datos muestran 18/50 fallos en MATH-500 con Q4_K_M.
- El enrutamiento de adaptadores requiere llama-server con soporte de `/lora-adapters`; no es compatible con todos los runners GGUF sin adaptacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- No hay informacion sobre idiomas soportados ni sobre el contexto maximo; no se recomienda asumir capacidades multilingues sin validacion.
- La tecnica WSP es experimental y especifica de este repositorio; su reproducibilidad en otros entornos no esta garantizada.
- El modelo tiene solo 1 like y 1602 descargas en el momento de la consulta, lo que sugiere validacion comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/jstarks/Qwen3.5-9B-DeepThought-STEM-Weight-Space-Programming
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Linaje intermedio: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizaciones GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-DeepThought-STEM-GGUF
