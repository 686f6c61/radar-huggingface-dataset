# ItsnotAilabs/Auro-110M

## Resumen

Auro-110M es un modelo de lenguaje causal de pequeno tamano (105.619.968 parametros segun los pesos en safetensors) desarrollado por MedinaMemorySystems / ItsnotAilabs. Se obtiene mediante poda y destilacion a partir de EleutherAI/pythia-160m-deduped, conservando la arquitectura GPT-NeoX, y se afina especificamente para ejecutar CortexScript, un DSL propietario orientado a agentes cognitivos, y para generar llamadas a herramientas en formato ReAct. Su propuesta de valor es la eficiencia extrema: el autor declara que funciona en CPU con menos de 500 MB de RAM en FP32 y unos 65 MB en GGUF Q4_K_M.

El modelo esta pensado para flujos agenticos en el borde (on-device), orquestacion ligera y generacion de codigo estructurado, no para razonamiento general. Con 12 capas, 12 cabezas de atencion, dimension oculta de 768 y una ventana de contexto de 2048 tokens, sus capacidades fuera del dominio de afinado son muy limitadas, y el propio autor lo advierte. Su relevancia actual radica en el nicho de agentes de bajo consumo que necesitan producir salidas estructuradas de forma predecible y barata.

La licencia es Apache 2.0, lo que facilita su integracion comercial, aunque el ecosistema de herramientas (tokenizer y benchmark propios de CortexScript) no esta publicado de forma independiente en la informacion disponible. El modelo tiene 507 descargas y 1 like en Hugging Face en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder causal), 12 capas, 12 cabezas, hidden 768 |
| Parametros totales | 105.619.968 (110M nominales) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | FP32, FP16, INT8, GGUF Q4_K_M (segun el autor) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1.1 GB); GGUF mencionado en la model card |

## Arquitectura y entrenamiento

Auro-110M es un transformer decoder causal de tipo GPT-NeoX con 12 capas, 12 cabezas de atencion y dimension oculta de 768. Deriva de EleutherAI/pythia-160m-deduped mediante poda y destilacion, reduciendo el numero de parametros hasta unos 110M. El autor indica que incorpora un tokenizer adaptado a CortexScript, aunque no se detalla el vocabulario ni el proceso exacto de adaptacion.

El entrenamiento se realiza sobre un corpus propio denominado custom-sovereign-corpus, con afinado orientado a tres tareas: generacion de codigo CortexScript, produccion de llamadas a herramientas en formato ReAct (Thought/Action) y monologos internos de agente. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad limitada fuera del dominio de afinado.
- Generacion e interpretacion de codigo en el DSL CortexScript, incluyendo rutinas estructuradas.
- Generacion de llamadas a herramientas en formato ReAct estructurado (`<Thought>`, `<Action>`).
- Mantenimiento de monologos internos de agente para orquestacion de pasos.
- Generacion de codigo general y escritura creativa a nivel basico, segun el autor.
- Soporte de prompt de sistema estructurado para definir rol y formato de salida.
- No se documenta soporte de vision, audio, tool calling nativo del tokenizer de chat, ni modo de razonamiento extendido.
- Capacidad multilingue practicamente inexistente: solo ingles declarado.

## Casos de uso

- Agentes en dispositivos de borde: el modelo cabe en unos 65 MB en GGUF Q4_K_M y puede ejecutarse de forma continua en CPU de bajo consumo, lo que permite desplegar bucles de agente ligeros sin GPU.
- Orquestacion de herramientas en pipelines: genera llamadas ReAct estructuradas y predecibles que un orquestador externo puede parsear y ejecutar, reduciendo la necesidad de un LLM grande para el enrutamiento.
- Generacion de scripts CortexScript: dado un prompt en lenguaje natural, produce rutinas del DSL con una tasa declarada del 84,7 % en el benchmark propio CortexScript-Exec.
- Prototipado rapido de flujos agenticos: sirve como sustituto barato de modelos mayores durante el desarrollo de la logica de orquestacion antes de escalar a modelos de produccion.
- Automatizacion de tareas de sistema en entornos con restricciones: por ejemplo, generacion de rutinas para consultar la hora del sistema y registrarla, tal como muestra el ejemplo de la model card.
- Educacion y experimentacion: su tamano permite estudiar el comportamiento de un transformer pequeno afinado en un DSL y comparar tecnicas de poda y destilacion sobre Pythia-160m.
- Generacion de texto creativo breve en ingles para prototipos de interfaz, con la advertencia de que la calidad es limitada.

## Benchmarks y rendimiento

| Benchmark | Auro-110M | Notas |
|---|---|---|
| HellaSwag (10-shot) | 38,2 % accuracy | Declarado por el autor, no verificado |
| ARC-Easy (25-shot) | 52,1 % accuracy | Declarado por el autor, no verificado |
| CortexScript-Exec (0-shot) | 84,7 % | Benchmark propio del autor, no verificado |

Metricas de produccion declaradas por el autor: throughput de 40,0 tokens/s, latencia de 15,0 ms/token, uso de RAM de aproximadamente 450 MB en linea base y una precision de tarea del 96,5 % (sin especificar el conjunto de evaluacion). No se han publicado resultados de benchmarks independientes en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun el autor: aproximadamente 450 MB en FP32, 220 MB en FP16, 110 MB en INT8 y 65 MB en GGUF Q4_K_M.
- GPU recomendadas: no se especifican; el modelo esta disenado para CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) lo ejecutaria con holgura, aunque no se aportan cifras.
- Cabe en cualquier GPU consumer e incluso en CPU de gama baja; el autor lo posiciona como modelo de hardware CPU.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. El formato GGUF permite llama.cpp y potencialmente Ollama, aunque no se confirma en la informacion disponible.
- Latencia declarada: 20 ms/token en FP32, 15 ms/token en FP16, 10 ms/token en INT8 y 5 ms/token en Q4_K_M, todos en CPU. Throughput de 40 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Auro-110M | 105,6M | 2048 | Apache 2.0 | Afinado para CortexScript y ReAct; HellaSwag 38,2 %, ARC-Easy 52,1 % |
| EleutherAI/pythia-160m-deduped | 160M | 2048 | Apache 2.0 | Modelo base; mayor numero de parametros, sin afinado especifico de agente |
| Modelos de ~100-150M de la familia GPT-2 small | 124M | 1024 | MIT | Referencia generalista en ingles; sin soporte de DSL ni ReAct |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Alternativa generalista pequena; no disponible comparacion de benchmarks en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos verificados entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Razonamiento zero-shot muy limitado fuera del dominio de afinado; el propio autor lo reconoce.
- Alta propension a alucinaciones en consultas de conocimiento factual.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Ventana de contexto corta (2048 tokens), insuficiente para documentos largos o conversaciones extensas.
- No incorpora guardrails de seguridad propios; requiere moderacion externa en produccion.
- El benchmark CortexScript-Exec y la metrica de precision del 96,5 % son propios y no verificados; no deben tomarse como indicadores comparables con benchmarks estandar.
- El tokenizer adaptado a CortexScript no esta documentado publicamente en la informacion disponible, lo que dificulta la reproducibilidad.
- La licencia Apache 2.0 permite uso comercial, pero el DSL CortexScript y el corpus de entrenamiento son propietarios y su disponibilidad no esta confirmada.
- Discrepancia entre el ID del repositorio en Hugging Face (ItsnotAilabs/Auro-110M) y el nombre usado en la model card y el ejemplo de codigo (MedinaMemorySystems/Auro-110M); conviene verificar la ruta correcta antes de integrar.

## Enlaces

- Hugging Face: https://huggingface.co/ItsnotAilabs/Auro-110M
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m-deduped
- Repositorio de referencia en la model card: https://huggingface.co/MedinaMemorySystems/Auro-110M
- Paper de Pythia: no disponible en la informacion proporcionada
- Blog o demo de CortexScript: no disponible en la informacion proporcionada
