# immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo

## Resumen

ghostai-lfm3-1.7b-appcontract-grpo es un ajuste fino del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario immortaltatsu, orientado especificamente a la seleccion de herramientas (tool calling) en el contexto de contratos de aplicacion sobre la blockchain de Solana. Se trata de un refinamiento mediante GRPO (Group Relative Policy Optimization) sobre un checkpoint previo entrenado con SFT, con el objetivo de maximizar la precision en la eleccion de herramienta y argumentos correctos. El modelo cuenta con 1.728.801.600 parametros y hereda la arquitectura y la ventana de contexto del modelo base LFM3-1.7B de Liquid AI.

El problema que aborda es acotado pero practico: dado un contexto conversacional, el modelo debe emitir llamadas a herramientas con el nombre y los argumentos correctos para interactuar con contratos de aplicacion en Solana. El entrenamiento con GRPO utiliza una recompensa graduada (herramienta y argumentos exactos, herramienta valida, formato correcto) y el autor reporta una media de recompensa de aproximadamente 0,96-1,0, lo que sugiere un ajuste muy ceñido al dominio de entrenamiento.

Es relevante por dos motivos: primero, demuestra la aplicacion de GRPO a un modelo pequeno (1.7B) para una tarea de agente con formato estricto; segundo, se distribuye en formato GGUF, lo que facilita su despliegue en entornos con recursos limitados. No obstante, se trata de un modelo muy especializado, con solo 30 descargas y sin likes en el momento de la consulta, y sin benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la del modelo base LiquidAI/LFM3-1.7B) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo incluye pesos GGUF; no se detallan los niveles) |
| Idiomas soportados | en (ingles) |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (tamano del repo: 4,6 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo, que se hereda del base LiquidAI/LFM3-1.7B. El proceso de entrenamiento documentado se limita al refinamiento: se parte de un checkpoint SFT (ghostai-lfm3-1.7b-appcontract-sft) y se aplica GRPO durante 1 epoca, con 4 generaciones por prompt, learning rate de 1e-6 y ejecucion en 2 GPUs. La funcion de recompensa es graduada y evalua tres niveles: coincidencia exacta de herramienta y argumentos, validez de la herramienta seleccionada y correccion del formato de salida.

El autor reporta una media de recompensa de aproximadamente 0,96-1,0 durante el entrenamiento, lo que indica que el modelo aprende a producir llamadas bien formadas y correctas dentro del dominio de los contratos de aplicacion en Solana. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de alineamiento mas alla del GRPO descrito.

## Capacidades

- Generacion de llamadas a herramientas (tool calling) con nombre y argumentos estructurados, optimizada para contratos de aplicacion en Solana.
- Formato de salida estricto, entrenado explicitamente para cumplir la estructura esperada de las llamadas.
- Razonamiento de un solo paso orientado a la seleccion de herramienta; no se documenta razonamiento multi-paso ni modos de pensamiento extendido.
- Conversacion multi-turno en ingles, segun la etiqueta "conversational" del repo.
- Capacidades generales de generacion de texto y codigo heredadas del modelo base LFM3-1.7B, aunque no se documentan en la model card.
- No se documenta soporte de vision, audio ni otras modalidades.
- No se documenta soporte multilingue mas alla del ingles.

## Casos de uso

- Agentes autonomos sobre Solana: el modelo puede seleccionar la instruccion o el contrato de aplicacion adecuado a partir de una peticion en lenguaje natural y emitir la llamada con los argumentos correspondientes, gracias al entrenamiento especifico con recompensa graduada.
- Automatizacion de operaciones on-chain: integrado en un backend que recibe ordenes de usuario y las traduce en llamadas a contratos, reduciendo la necesidad de logica de enrutamiento manual.
- Prototipado rapido de asistentes Web3: al estar en formato GGUF, se puede desplegar localmente con llama.cpp u Ollama para validar flujos de interaccion con contratos antes de pasar a produccion.
- Generacion de fixtures y pruebas: el modelo puede producir ejemplos de llamadas bien formadas para tests de integracion de contratos de aplicacion.
- Enrutamiento de intenciones en pipelines de agentes: como componente ligero que decide que herramienta invocar dentro de un sistema mayor con varios modelos especializados.
- Educacion y demostracion: sirve como ejemplo reproducible de aplicacion de GRPO a una tarea de tool calling con recompensa estructurada, util para investigadores que estudien tecnicas de RL para agentes.
- Despliegue en entornos con recursos limitados: con 1,7B parametros y pesos GGUF, cabe en hardware modesto y permite inferencia local para tareas de seleccion de herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la media de recompensa de entrenamiento (aproximadamente 0,96-1,0), que no constituye un benchmark estandar y no es comparable con metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano (1,7B parametros), una cuantizacion de 4 bits requeriria del orden de 1-1,5 GB de VRAM, y una de 8 bits alrededor de 2-2,5 GB, sin contar el contexto; estos valores son estimaciones por tamano, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutar una cuantizacion baja; GPU de datacenter como A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, siempre que la cuantizacion GGUF elegida encaje en la VRAM disponible.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no se documentan para este repo. El tag "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, pero no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ghostai-lfm3-1.7b-appcontract-grpo | 1,73B | no disponible | Tool calling para contratos Solana (GRPO) | lfm-open-license-v1.0 | Hugging Face, GGUF |
| LiquidAI/LFM3-1.7B (base) | 1,7B | no disponible | Modelo generalista | lfm-open-license-v1.0 | Hugging Face |
| ghostai-lfm3-1.7b-appcontract-sft | no disponible | no disponible | Tool calling para contratos Solana (SFT) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo muy especializado: el ajuste GRPO se centra en tool calling para contratos de aplicacion en Solana, por lo que su rendimiento fuera de ese dominio puede degradarse respecto al modelo base.
- Riesgo de sobreajuste al formato: la recompensa graduada premia la estructura exacta; fuera del esquema de entrenamiento puede producir llamadas mal formadas o inventar herramientas.
- Riesgo de alucinacion en nombres de contratos, funciones o argumentos, especialmente ante peticiones ambiguas o fuera de distribucion.
- Solo soporta ingles segun la model card; no se documenta cobertura multilingue.
- Longitud de contexto no documentada, lo que impide planificar conversaciones largas con garantias.
- Licencia lfm-open-license-v1.0: es necesario revisar sus terminos antes de uso comercial, ya que se etiqueta como "other" y no es una licencia permisiva estandar.
- Sin benchmarks publicados ni validacion independiente; el unico indicador es la recompensa de entrenamiento reportada por el autor.
- Comunidad muy reducida (30 descargas, 0 likes en el momento de la consulta): menor probabilidad de soporte, correcciones o auditoria externa.
- No se detallan los niveles de cuantizacion GGUF incluidos ni el contexto maximo soportado en cada uno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-grpo
- Checkpoint SFT previo: https://huggingface.co/immortaltatsu/ghostai-lfm3-1.7b-appcontract-sft
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
