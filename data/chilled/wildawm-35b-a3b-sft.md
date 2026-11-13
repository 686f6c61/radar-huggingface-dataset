# ChilleD/WildAWM-35B-A3B-SFT

## Resumen

WildAWM-35B-A3B-SFT es un checkpoint de ajuste supervisado (SFT) del modelo de agente WildAWM, desarrollado por ChilleD en el marco del trabajo "Agent World Model in the Wild: Computer-Use Agent Environment Synthesis" (arXiv:2610.26828). Se construye a partir de Qwen/Qwen3.6-35B-A3B, un transformer de tipo mixture-of-experts con 35.951.822.704 parametros totales, y se entrena sobre trayectorias generadas por GLM-5.2 recogidas en el split de 100 tareas del conjunto WildAWM XAI. Es, por tanto, el checkpoint de inicializacion del modelo final WildAWM-35B-A3B.

El modelo esta disenado especificamente para agentes de uso de ordenador (computer-use agents) y uso de herramientas, manteniendo los formatos de tool calling y razonamiento de Qwen que emplea el arnes de evaluacion del proyecto. Se sirve en modo solo texto con una ventana de contexto de 262.144 tokens, lo que lo hace adecuado para tareas de agente de multiples pasos con historiales largos.

Su relevancia actual reside en la sintesis de entornos para agentes: el modelo forma parte de un pipeline que genera entornos de agente realistas para evaluar y entrenar sistemas de computer use. La ficha se basa unicamente en la informacion publicada en Hugging Face y en los enlaces del proyecto; los datos no disponibles se indican explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (tag `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (denominacion A3B del modelo base; valor exacto no disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Libreria de despliegue | sglang (0.5.15.post1) |
| Tamano del repositorio | 71,9 GB |
| Modalidad | solo texto |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura mixture-of-experts de Qwen3.6-35B-A3B: 35.951.822.704 parametros totales con un subconjunto activo de aproximadamente 3B por token (segun la nomenclatura A3B del modelo base). El checkpoint es el resultado de un ajuste supervisado sobre trayectorias de agente generadas por GLM-5.2, recolectadas en el split de 100 tareas del conjunto WildAWM XAI. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion principal no esta en la arquitectura del modelo en si, sino en el pipeline de sintesis de entornos de agente que lo rodea: WildAWM genera entornos de computer use y tareas asociadas (341 entornos y tareas publicados como dataset) para entrenar y evaluar agentes. El modelo conserva los formatos de tool calling y razonamiento de Qwen, lo que permite integrarlo directamente en el arnes de evaluacion del proyecto mediante los parsers `qwen3_coder` (tool call) y `qwen3` (razonamiento) de SGLang.

## Capacidades

- Generacion de texto y razonamiento en modo solo texto, con soporte de modo de razonamiento (reasoning parser `qwen3`).
- Tool calling / function calling en el formato Qwen (tool-call parser `qwen3_coder`).
- Comportamiento de agente de uso de ordenador: ejecucion de tareas de multiples pasos en entornos sintetizados por WildAWM.
- Razonamiento multi-paso orientado a agentes, con historiales largos gracias a la ventana de 262.144 tokens.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Evaluacion de agentes de computer use: el modelo sirve como agente de referencia en el arnes de WildAWM para medir el exito en tareas de interaccion con entornos de escritorio, aprovechando su contexto de 262.144 tokens para mantener el historial completo de acciones y observaciones.
- Entrenamiento y destilacion de agentes: al ser el checkpoint de inicializacion de WildAWM-35B-A3B, puede usarse como punto de partida para etapas posteriores de ajuste (por ejemplo, RL) sobre trayectorias de agente.
- Automatizacion de flujos con herramientas: integrado via SGLang con el parser `qwen3_coder`, puede orquestar llamadas a APIs y funciones en pipelines de agentes con multiples pasos.
- Generacion de trayectorias sinteticas: combinado con el pipeline de sintesis de entornos de WildAWM, puede producir trayectorias de interaccion para ampliar datasets de entrenamiento de agentes.
- Investigacion en razonamiento de agentes: su modo de razonamiento explicito permite estudiar cadenas de decision en tareas de uso de ordenador y comparar estrategias de planificacion.
- Despliegue en infraestructura de servido de alta concurrencia: al estar pensado para SGLang con backend MoE Triton y `mem-fraction-static 0.85`, encaja en servicios de inferencia que necesitan contexto largo y decodificacion eficiente de un MoE con 3B activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: el repositorio ocupa 71,9 GB en safetensors, por lo que se necesita al menos ese orden de memoria; con `mem-fraction-static 0.85` el servidor reserva el 85 % de la memoria estatica de la GPU para pesos y cache KV.
- GPU recomendadas: no se especifican en la informacion disponible; por tamano, el despliegue single-GPU del ejemplo de la model card implica GPUs de 80 GB o superiores (A100/H100) o configuraciones multi-GPU.
- Cabe en GPU consumer: no disponible; el tamano de pesos en bfloat16 (71,9 GB) excede la VRAM de las GPU consumer habituales, aunque no se documentan variantes cuantizadas.
- Opciones de despliegue: SGLang (version fijada `sglang==0.5.15.post1`), con backend MoE Triton. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WildAWM-35B-A3B-SFT | 35.951.822.704 | ~3B (A3B) | 262.144 | no disponible | Hugging Face (ChilleD) |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible | ~3B (A3B) | no disponible | no disponible | Hugging Face (Qwen) |
| WildAWM-35B-A3B (modelo final) | no disponible | no disponible | no disponible | no disponible | Hugging Face (ChilleD) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se documenta soporte multilingue.
- Modalidad exclusivamente de texto: no procesa imagenes ni audio, lo que limita su uso en tareas de computer use que requieran percepcion visual directa.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; debe verificarse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad del modelo.
- Es un checkpoint intermedio (SFT) y no el modelo final del proyecto; para evaluacion oficial se referencia WildAWM-35B-A3B.
- El entrenamiento se limita a 100 tareas del split SFT del conjunto WildAWM XAI, por lo que la cobertura de dominios puede ser reducida.
- No se documentan sesgos conocidos ni resultados de evaluacion de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChilleD/WildAWM-35B-A3B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Modelo final WildAWM-35B-A3B: https://huggingface.co/ChilleD/WildAWM-35B-A3B
- Dataset de entornos y tareas: https://huggingface.co/datasets/ChilleD/WildAWM
- Paper (arXiv): https://arxiv.org/abs/2610.26828
- Pagina del proyecto: https://msr-orchard.github.io/WildAWM/
- Codigo (sintesis y evaluacion): https://github.com/MSR-Orchard/WildAWM
