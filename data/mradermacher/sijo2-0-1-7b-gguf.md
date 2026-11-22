# mradermacher/Sijo2.0-1.7B-GGUF

## Resumen

Sijo2.0-1.7B-GGUF es la distribucion en formato GGUF del modelo Sijo2.0-1.7B, desarrollado originalmente por myjellylabs y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 1.728.801.600 parametros (aproximadamente 1,7 mil millones) afinado mediante LoRA y DPO, orientado especificamente a tareas de IA agentica, uso de terminal Linux, generacion de codigo, razonamiento y tool calling. La model card lo etiqueta como "standalone", lo que sugiere un entrenamiento enfocado en operar de forma autonoma en entornos de linea de comandos.

El modelo parte de una arquitectura transformer (la model card no detalla la arquitectura interna mas alla de la etiqueta `transformers` y `custom_code`) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su tamano compacto lo hace apto para despliegue en hardware de consumo, y la disponibilidad de cuantizaciones desde Q2_K hasta f16 permite ajustar el equilibrio entre calidad y huella de memoria.

La relevancia actual de este modelo radica en su orientacion a flujos agenticos ligeros: un modelo de 1,7B parametros que cabe en GPUs de consumo y que ha sido entrenado con tecnicas de preferencia (DPO) para tareas de razonamiento y ejecucion de comandos. El repositorio GGUF acumula 725 descargas y fue creado el 18 de noviembre de 2026, con actualizacion el mismo dia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `transformers`, `custom_code`; detalle interno no disponible) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible indica que Sijo2.0-1.7B es un modelo transformer afinado mediante LoRA y posteriormente optimizado con DPO (Direct Preference Optimization), segun las etiquetas `lora` y `dpo` de la model card. El modelo base es `myjellylabs/Sijo2.0-1.7B`, y esta version GGUF es una cuantizacion estatica realizada por mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni la arquitectura exacta (numero de capas, dimensiones de atencion, tipo de atencion).

Las etiquetas del modelo (`agentic-ai`, `linux-terminal`, `coding`, `reasoning`, `tool-calling`, `standalone`) sugieren un entrenamiento orientado a tareas de agente autonomo en entornos de terminal, con enfasis en invocacion de herramientas y razonamiento multi-paso. La presencia de `custom_code` implica que el modelo requiere codigo personalizado para su carga en transformers, lo que puede afectar a la portabilidad entre frameworks. No se han publicado detalles sobre la innovacion tecnica del entrenamiento ni sobre posibles tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles.
- Razonamiento multi-paso orientado a tareas agenticas.
- Generacion y asistencia de codigo.
- Tool calling / function calling.
- Operacion en terminal Linux (ejecucion y planificacion de comandos).
- Comportamiento "standalone" para agentes autonomos.
- Afinado con DPO para alineamiento con preferencias.
- No se ha confirmado soporte de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Agente de terminal Linux: el modelo puede planificar y ejecutar secuencias de comandos en un entorno de linea de comandos, gracias a su entrenamiento especifico en `linux-terminal` y `agentic-ai`, lo que lo hace adecuado para automatizacion de tareas de administracion de sistemas en entornos controlados.
- Asistente de codigo en local: con 1,7B parametros y cuantizaciones Q4_K_M de 1,2 GB, puede desplegarse en portatiles para autocompletado y generacion de fragmentos de codigo sin conexion, integrable en editores mediante servidores compatibles con OpenAI.
- Automatizacion de pipelines CI/CD: su soporte de tool calling permite invocarlo como paso de agente que decide que comandos ejecutar o que herramientas llamar dentro de un flujo de integracion continua, con la ventaja de su baja huella de memoria.
- Prototipado de agentes multi-paso: util para experimentar con arquitecturas agenticas (ReAct, planificacion) en hardware de consumo antes de escalar a modelos mayores, gracias a su tamano reducido y licencia permisiva.
- Chatbot de soporte tecnico en ingles: puede gestionar conversaciones sobre resolucion de problemas tecnicos y comandos, aunque su ventana de contexto no esta documentada y su cobertura linguistica se limita al ingles.
- Educacion y demostraciones: su tamano permite ejecutarlo en entornos docentes o demos en vivo con Ollama o llama.cpp, mostrando el funcionamiento de un agente de terminal sin requerir infraestructura de GPU de datacenter.
- Investigacion sobre DPO en modelos pequenos: sirve como caso de estudio de afinado LoRA + DPO en modelos de menos de 2B parametros para tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_M), 1,5 GB (Q6_K), 1,9 GB (Q8_0) y 3,6 GB (f16), segun los tamanos de fichero indicados en la model card.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo cabe incluso en iGPU con memoria unificada.
- Cabe en GPU de consumo: si, en practicamente todas las GPUs consumer modernas e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de OpenAI (la model card incluye la etiqueta `endpoints_compatible`). vLLM y TGI no estan confirmados para este formato GGUF con `custom_code`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sijo2.0-1.7B-GGUF | 1,7B | No disponible | Apache 2.0 | GGUF | Enfocado a agentes y terminal Linux |
| Qwen2.5-Coder-1.5B | 1,5B | 32K (segun documentacion publica del modelo base) | Apache 2.0 | safetensors, GGUF | Enfocado a codigo, sin especializacion en terminal |
| Llama-3.2-1B | 1,2B | 128K (segun documentacion publica) | Llama 3.2 Community License | safetensors, GGUF | Multilingue, licencia con restricciones |
| SmolLM2-1.7B | 1,7B | 8K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Modelo generalista pequeno |

La comparativa se limita a parametros, contexto y licencia; no se dispone de datos de rendimiento comparativo para Sijo2.0-1.7B.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se ha confirmado cobertura multilingue.
- La longitud de contexto no esta documentada, lo que impide garantizar conversaciones o tareas de contexto largo.
- Riesgo de alucinacion inherente a modelos de 1,7B parametros, especialmente en razonamiento complejo y generacion de codigo.
- El uso de `custom_code` puede requerir `trust_remote_code=True` en transformers, con el riesgo de seguridad asociado.
- No se han publicado evaluaciones de sesgo ni de seguridad.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento limita la evaluacion de riesgos en produccion.
- El modelo esta orientado a terminal Linux; su comportamiento en otros entornos no esta validado.
- La cuantizacion Q3_K_M se marca como "lower quality" en la model card; para produccion se recomienda Q4_K_M o superior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Sijo2.0-1.7B-GGUF
- Modelo base: https://huggingface.co/myjellylabs/Sijo2.0-1.7B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Sijo2.0-1.7B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Sijo2.0-1.7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
