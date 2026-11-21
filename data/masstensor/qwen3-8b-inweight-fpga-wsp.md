# masstensor/Qwen3-8B-InWeight-FPGA-WSP

## Resumen

Qwen3-8B-InWeight-FPGA-WSP es un checkpoint derivado de Qwen/Qwen3-8B en el que el autor (masstensor) ha compilado un programa de pesos ("weight-space programming", WSP) directamente sobre los parametros del modelo. El objetivo declarado es dotar al modelo de una "maquina de estados dialectica" que le permita sostener su tesis ante presiones conversacionales (anti-sycophancy), verificando argumentos de forma multi-turno. El modelo conserva la arquitectura y el tamano del Qwen3-8B original (8.190.735.360 parametros), por lo que no anade capacidad de computo nueva, sino un sesgo de comportamiento inyectado en un subconjunto muy pequeno de pesos.

La intervencion es notablemente quirurgica: segun la model card, se modifican aproximadamente el 0,035% de los parametros en unos 30 segundos sobre una sola GPU y sin pasos de gradiente. El autor describe tres etapas (Stage I, II y III) que actuan sobre capas concretas (24, 26, 28, 30 y 35) y un "bitstream delta" disperso que puede aplicarse en milisegundos sobre un Qwen3-8B sin editar.

Es relevante ahora porque propone una via alternativa al RLHF/DPO para corregir comportamientos concretos (capitulacion ante presion, razonamiento dialectico) sin reentrenar el modelo completo, con un coste de computo muy bajo y una licencia permisiva (MIT). La contrapartida es que se trata de un artefacto de investigacion con muy poca traccion (0 descargas, 0 likes en el momento de la consulta) y cuyos resultados proceden exclusivamente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); se anade un FSM DAG de 35 neuronas compilado en `layers[35].mlp` |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en `safetensors` (bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 16,4 GB); incluye `bitstreams/qwen3_8b_program1_dialectical_2way.pt` (delta disperso) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de 8,19 mil millones de parametros, y no modifica su topologia. La innovacion consiste en inyectar un programa directamente en el espacio de pesos mediante tres etapas descritas por el autor:

- **Stage I**: regularizacion de "guard-nullspace" sobre `self_attn.o_proj` de la capa 24 y sobre la matriz `W_Q` de la capa superior, para extraer senales de validez tesis-vs-antitesis ortogonales a la deriva del prompt.
- **Stage II**: canales SwiGLU "dormidos" en las capas [24, 26, 28, 30] que implementan un circuito de verificacion multi-dominio (`num`, `bool`, `mcq_val`), aprovechando la absorcion de mantisa en `bfloat16` ($\mathrm{fl}_{\mathrm{bf16}}(h + \Delta h) \equiv h$ para $z \le -15{,}0$) y un jacobiano de diferencias finitas $2 \times 2$.
- **Stage III**: una maquina de estados finitos (FSM) en forma de DAG de 35 neuronas compilada en `layers[35].mlp`, que se ejecuta estrictamente despues de que todas las cache KV de self-attention se han escrito (deriva KV nula en acciones de la capa terminal).

El proceso de compilacion se realiza en unos 30 segundos sobre una sola GPU, sin pasos de gradiente, modificando aproximadamente el 0,035% de los parametros. No se documenta en la informacion disponible el volumen de tokens de entrenamiento ni si hubo RLHF o DPO; el autor presenta el metodo como alternativa a esos enfoques. Se incluye un "compact sparse bitstream delta" para aplicar el state machine sobre un Qwen3-8B existente en milisegundos.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-8B.
- Razonamiento dialectico: mantiene una tesis y responde a la antitesis en lugar de capitular ante presion del usuario.
- Resistencia a la sycophancy (capitulacion): segun el autor, reduce la tasa de capitulacion de ~12% a ~2-4% en las suites evaluadas.
- Verificacion multi-dominio de argumentos (`num`, `bool`, `mcq_val`) mediante el circuito compilado en Stage II.
- Maquina de estados finitos en la capa terminal para controlar la progresion de la conversacion (holding/yielding).
- Compatibilidad con `vLLM` y `transformers` sin scaffolding adicional.
- Soporte de tool calling, agentes, vision, audio o thinking mode: no disponible en la informacion proporcionada (no se mencionan; el modelo base Qwen3-8B podria conservar parte de estas capacidades, pero no se documenta su preservacion tras la edicion).

## Casos de uso

- **Asistentes de debate y argumentacion**: el modelo puede sostener una postura ante contraargumentos sin ceder por presion social, util en entornos educativos o de entrenamiento en pensamiento critico. La FSM terminal controla cuando mantener ("holding") y cuando ceder ("yielding") segun la validez del argumento.
- **Atencion al cliente con politicas estrictas**: en escenarios donde el agente no debe aceptar reclamaciones infundadas ni cambiar de politica ante insistencia, la reduccion de capitulacion (~10 puntos porcentuales) resulta directamente aplicable.
- **Moderacion y evaluacion de argumentos**: el circuito de verificacion multi-dominio (`num`, `bool`, `mcq_val`) permite comprobar la consistencia de afirmaciones numericas o booleanas en flujos de revision.
- **Investigacion en edicion de modelos**: el checkpoint y el bitstream delta sirven como caso de estudio reproducible de weight-space programming frente a RLHF/DPO, con un coste de 30 segundos por compilacion.
- **Prototipado rapido de comportamientos**: el delta disperso permite aplicar y revertir el comportamiento en milisegundos sobre un Qwen3-8B, lo que facilita experimentos A/B de comportamiento sin reentrenar.
- **Sistemas de toma de decisiones multi-turno**: la FSM en la capa terminal ofrece un mecanismo determinista de transicion de estados que puede integrarse en pipelines agenticos que requieran control explicito de fases.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (decodificacion greedy con `vLLM`, 3.126 dialogos de 3 turnos sin filtrar). No se han verificado de forma independiente.

| Suite | Metodo | Synthesis Acc | Holding Rate | Yielding Rate | Dialectical Competence | Capitulation Rate |
|---|---|---|---|---|---|---|
| `v4k` Full (654) | Base sin editar | 71,41% | 56,65% | 90,83% | 73,74% | 11,93% |
| `v4k` Full (654) | **Este modelo** | **79,36%** (+7,95) | **93,64%** (+36,99) | 80,00% | **86,82%** (+13,08) | **1,83%** (-10,10) |
| `f` no visto (1.272) | Base sin editar | 73,19% | 59,79% | 90,83% | 75,31% | 12,26% |
| `f` no visto (1.272) | **Este modelo** | **78,07%** (+4,88) | **86,34%** (+26,55) | 75,11% | **80,72%** (+5,41) | **4,25%** (-8,01) |
| `g` no visto (1.200) | Base sin editar | 73,25% | 56,01% | 89,20% | 72,61% | 12,83% |
| `g` no visto (1.200) | **Este modelo** | **78,75%** (+5,50) | **90,03%** (+34,02) | 65,26% | **77,64%** (+5,03) | **2,83%** (-10,00) |

El autor indica que las 3 suites pasaron el criterio de bootstrap al 95% con 3/3 jueces. Como referencia, la model card cita resultados del paper (`arXiv:2611.17563`) para el modelo base (62,80% synthesis, 10,30% capitulacion) y para `SelfD-RL` (73,50% synthesis, 1,00% capitulacion), pero la comparacion directa con esas cifras no es homogenea con las suites propias. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: ~16,4 GB de pesos, por lo que se necesitan al menos ~18-20 GB de VRAM contando cache KV y overhead. En cuantizacion de 8 bits bajaría a ~8-9 GB y en 4 bits a ~5-6 GB (estimacion, no confirmada en la informacion disponible).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para bfloat16 sin cuantizar; RTX 4090 (24 GB) es suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 12-16 GB con cuantizacion (no se documentan ficheros GGUF en el repo).
- Opciones de despliegue: `transformers` (ejemplo incluido en la model card) y `vLLM` (usado por el autor para los benchmarks). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible, aunque los tags incluyen `text-generation-inference`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Qwen3-8B-InWeight-FPGA-WSP** | 8,19 B | no disponible | Edicion de pesos (WSP) sobre Qwen3-8B | MIT | HF (0 descargas) |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible | Transformer denso | no disponible en la informacion | HF (ampliamente usado) |
| Llama-3.1-8B-Instruct-InWeight-FPGA-WSP | ~8 B | no disponible | Mismo metodo WSP sobre Llama 3.1 | no disponible en la informacion | HF (modelo hermano citado por el autor) |
| Paper `SelfD-RL` (referencia) | no disponible | no disponible | RL sobre modelo base | no disponible | Paper `arXiv:2611.17563` |

El modelo hermano de Llama 3.1 permite evaluar la portabilidad del metodo WSP entre familias de modelos. No se dispone de datos de benchmarks estandar para comparar rendimiento general (MMLU, HumanEval) con alternativas.

## Limitaciones y advertencias

- **Validacion limitada**: 0 descargas y 0 likes en el momento de la consulta; los resultados proceden exclusivamente de la model card del autor y no se han replicado de forma independiente.
- **Riesgo de sobreajuste al benchmark propio**: las suites `v4k`, `f` y `g` son del propio autor, y la mejora en "yielding rate" es negativa (el modelo cede menos, lo que puede ser indeseable si la antitesis es correcta).
- **Sesgos**: no documentados en la informacion disponible; al heredar Qwen3-8B, conserva los sesgos del modelo base.
- **Alucinacion**: no se documenta ningun cambio en la tendencia a alucinar; la edicion se centra en el comportamiento dialectico, no en la factualidad.
- **Idiomas**: no disponible; no se especifica que idiomas conserva tras la edicion.
- **Licencia**: MIT, permisiva para uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia que puede imponer condiciones adicionales (no verificada en la informacion disponible).
- **Artefacto de investigacion**: el metodo depende de detalles de implementacion (absorcion de mantisa en bfloat16, indices de capa concretos) que pueden no transferirse a otras versiones o cuantizaciones del modelo base.
- **Contexto y tool calling**: no se documenta si la edicion preserva todas las capacidades del Qwen3-8B original (thinking mode, tool calling, contexto largo).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masstensor/Qwen3-8B-InWeight-FPGA-WSP
- Repositorio GitHub: https://github.com/zkwasm/in-weight-fpga-wsp
- Paper (PDF): paper.pdf (referenciado en la model card; no se dispone de URL absoluta)
- arXiv: https://arxiv.org/abs/2611.17563 (referencia `arXiv:2611.17563`)
- Dataset de benchmark: https://huggingface.co/datasets/masstensor/InWeight-FPGA-Dialectical-3780
- Modelo hermano Llama-3.1-8B: https://huggingface.co/masstensor/Llama-3.1-8B-Instruct-InWeight-FPGA-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
