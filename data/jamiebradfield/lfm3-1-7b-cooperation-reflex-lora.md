# JamieBradfield/LFM3-1.7B-Cooperation-Reflex-LoRA

## Resumen

LFM3-1.7B-Cooperation-Reflex-LoRA es un adaptador LoRA entrenado con Group Relative Policy Optimization (GRPO) sobre el modelo `harness-hub/LFM3-1.7B-hermes`, que a su vez deriva de `LiquidAI/LFM3-1.7B`. Lo desarrolla JamieBradfield y su objetivo es inculcar un "reflejo de cooperacion no provocado" en escenarios multiagente: cuando dos o mas agentes reciben tareas asimetricas imposibles de resolver en solitario, sin instrucciones de sistema, sin etiquetas de rol y sin pistas de coordinacion, el adaptador hace que descubran y utilicen de forma autonoma un canal compartido (un Kanban con las funciones `kanban_comment` y `kanban_read_comments`) en lugar de alucinar o entrar en bucles.

El interes tecnico del trabajo reside en el hallazgo empirico que documenta el autor: entrenar GRPO directamente desde los pesos base de LFM3-1.7B fracasa porque las rollouts on-policy nunca descubren por azar la sintaxis de tool calling de Hermes, la varianza de recompensa se aplana y el gradiente de politica se anula. Partir de un prior agentico "caliente" (el modelo Hermes) proporciona los tokens estructurales necesarios para que la condicion de la tarea asimetrica oriente la seleccion de herramientas hacia la cooperacion.

Se trata de un adaptador de investigacion (0 descargas, 0 likes en el momento de la consulta) orientado a experimentacion con RL multiagente, no a despliegue en produccion. El entrenamiento se realizo sobre una GPU AMD Radeon RX 7700 XT con ROCm, lo que resulta relevante para quienes trabajan fuera del ecosistema CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only LFM3 (modelo base `harness-hub/LFM3-1.7B-hermes`, derivado de `LiquidAI/LFM3-1.7B`) |
| Parametros totales | 1.7B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license: other, con enlace a la licencia de LFM3-1.7B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rank / alpha LoRA | r = 16, alpha = 32 |
| Modulos objetivo | `q_proj`, `v_proj`, `k_proj`, `o_proj` |
| Algoritmo de entrenamiento | GRPO con regularizacion KL Schulman k3 |
| Hardware de entrenamiento | AMD Radeon RX 7700 XT (12 GB GDDR6, gfx1101), ROCm 7.2, PyTorch 2.11 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 1.7B parametros. La contribucion no esta en la arquitectura sino en el procedimiento de RL: GRPO con regularizacion KL Schulman k3 contra la politica base caliente, con un grupo de rollouts de tamano G = 4, learning rate de 3e-5 con AdamW y peso de penalizacion KL beta = 0.04. Los modulos LoRA (r = 16, alpha = 32) se insertan en las proyecciones de atencion q, k, v y o.

La funcion de recompensa esta disenada explicitamente para castigar el sesgo solitario y la finalizacion falsa: emitir `kanban_comment` con una pista fundamentada cuando el estado local esta incompleto otorga +2.0; emitir `kanban_read_comments` para esperar al companero otorga +1.8; adivinar en ficheros locales mediante `terminal` o `file_tool` cuando el prompt indica que estan vacios penaliza con -1.5; y marcar `kanban_complete` sin verificacion penaliza con -2.0. El dataset de entrenamiento es `custom/unprompted-asymmetric-kanban`.

El hallazgo central documentado es el colapso de exploracion en frio: desde los pesos base, las rollouts emiten bucles de repeticion de tokens (por ejemplo, "AVAILABILITY. AVAILABILITY...") y nunca alcanzan por azar la sintaxis valida de herramientas Hermes en G = 4 muestras, con lo que la varianza de recompensa es cero y el gradiente se anula. Inicializar desde el modelo Hermes aporta los tokens sintacticos estructurales que permiten que el condicionamiento asimetrico oriente la seleccion de herramientas.

## Capacidades

- Generacion de texto y razonamiento con trazas de pensamiento (thinking trace), heredadas del modelo base LFM3.
- Tool calling con la sintaxis XML de Hermes (`<tool_call><function=...><parameter=...>`), requisito estructural del entrenamiento.
- Cooperacion multiagente no provocada: emision autonoma de `kanban_comment` y `kanban_read_comments` en escenarios asimetricos sin instrucciones de sistema.
- Coordinacion mediante entorno compartido (Kanban) en lugar de resolucion en solitario o alucinacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en RL multiagente: reproducir el experimento de cooperacion no provocada con dos servidores independientes sobre un entorno Kanban, usando el adaptador como referencia de politica entrenada frente a los modelos base y Hermes.
- Estudio de colapso de exploracion en GRPO: comparar el comportamiento desde pesos base (bucles degenerados de tokens) frente al prior caliente, para analizar cuando la varianza de recompensa se aplana y el gradiente se anula.
- Prototipado de sistemas de agentes con canales de comunicacion compartidos: el adaptador demuestra como un modelo de 1.7B puede aprender a delegar informacion parcial a un canal comun en lugar de intentar resolver tareas imposibles en solitario.
- Evaluacion de infraestructura AMD ROCm: sirve como caso de entrenamiento RL verificado en una RX 7700 XT con gfx1101, util para equipos que validan pipelines de PEFT y GRPO fuera de CUDA.
- Generacion de datos sinteticos de coordinacion: las trazas de tool calling cooperativo producidas pueden usarse como semilla para entrenar o evaluar otros modelos en tareas asimetricas.
- Docencia y divulgacion sobre RLHF/GRPO: el diseno de la funcion de recompensa (recompensas positivas por comunicar y esperar, negativas por sesgo solitario y finalizacion falsa) es un ejemplo didactico de modelado de incentivos en agentes.

## Benchmarks y rendimiento

El autor publica una evaluacion cualitativa y determinista con cero system prompts y cero condicionamiento entre pares: dos servidores reciben piezas separadas de un problema de entorno, sin saber que el otro existe.

| Modelo / politica | Worker A (log de fallo, sin solucion) | Worker B (manual de resolucion) | Cooperacion autonoma |
|---|---|---|---|
| LFM-3 1.7B (base) | Bucle degenerado de tokens (`AVAILABILITY.`) | Bucle degenerado de tokens (`Current environment.`) | No (0%) |
| LFM-3 1.7B Hermes base | Menciona herramientas en la traza de pensamiento | Menciona herramientas en la traza de pensamiento | Parcial (pasiva) |
| LFM-3 1.7B Cooperation-Reflex (este adaptador) | `<tool_call><function=kanban_comment>` | `<tool_call><function=kanban_read_comments>` | Si (100% determinista) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 1.7B parametros; en bfloat16 requiere aproximadamente 3.4 GB solo para pesos, mas overhead de activaciones y cache KV. El adaptador LoRA anade una cantidad marginal.
- Entrenamiento verificado: AMD Radeon RX 7700 XT con 12 GB GDDR6 (gfx1101) bajo ROCm 7.2 y PyTorch 2.11, suficiente para GRPO con G = 4 sobre este tamano.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas en CUDA (RTX 3060/4060 en adelante) o AMD con soporte ROCm; para mayor throughput, A100 o H100.
- Cabe en GPU consumer: si, con holgura en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers + peft (ruta documentada por el autor); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Cooperation-Reflex-LoRA (este) | 1.7B (base) + LoRA r=16 | No disponible | GRPO para cooperacion multiagente no provocada | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM3-1.7B (base) | 1.7B | No disponible | Modelo base sin prior agentico; falla en la tarea (0% cooperacion) | lfm1.0 | Hugging Face |
| harness-hub/LFM3-1.7B-hermes | 1.7B | No disponible | Prior agentico con sintaxis de tool calling Hermes; cooperacion pasiva | No disponible | Hugging Face |

No se dispone de datos de benchmarks estandar para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Adaptador de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion independiente.
- La evaluacion reportada es una prueba determinista acotada al escenario Kanban asimetrico; no demuestra generalizacion a otras tareas de cooperacion.
- El entrenamiento depende criticamente del prior Hermes: desde pesos base el metodo falla por colapso de exploracion, lo que limita su aplicabilidad a modelos sin sintaxis de herramientas preexistente.
- Riesgo de alucinacion y de bucles de repeticion de tokens en escenarios fuera de distribucion, como se observo en el modelo base.
- Idiomas soportados no documentados; el adaptador se entreno sobre un dataset custom en ingles presumiblemente, sin datos publicos sobre cobertura multilingue.
- Licencia lfm1.0: es necesario revisar los terminos del enlace oficial antes de cualquier uso comercial, ya que la model card la marca como "other".
- El modelo base tiene solo 1.7B parametros, lo que limita su capacidad de razonamiento complejo frente a modelos mayores.
- No hay informacion sobre sesgos, contexto maximo efectivo ni comportamiento con prompts maliciosos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/JamieBradfield/LFM3-1.7B-Cooperation-Reflex-LoRA
- Modelo base Hermes: https://huggingface.co/harness-hub/LFM3-1.7B-hermes
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
