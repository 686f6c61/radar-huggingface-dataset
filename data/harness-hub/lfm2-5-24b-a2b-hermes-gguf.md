# harness-hub/LFM2.5-24B-A2B-hermes-GGUF

## Resumen

LFM2.5-24B-A2B-hermes-GGUF es la distribucion en formato GGUF de un adaptador LoRA sobre el modelo base LiquidAI/LFM2.5-24B-A2B, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI. El adaptador ha sido entrenado mediante aprendizaje por refuerzo dentro del entorno Hermes Agent de Nous Research, con el objetivo de mejorar la eficiencia en el uso de herramientas (tool calling) en flujos de trabajo agénticos. El resultado, segun el autor, mantiene una precision practicamente identica a la del modelo base pero reduce en un 20% el numero de llamadas a herramientas en las tareas que ambos resuelven.

Este repositorio concreto, publicado por el usuario harness-hub, no contiene los pesos completos del modelo sino unicamente el adaptador convertido a GGUF en precision F16 (aproximadamente 37 MB), pensado para ejecutarse sobre el GGUF base de LiquidAI mediante llama.cpp. La nomenclatura del identificador sugiere 24B de parametros totales y A2B (2B activos), aunque el dato de parametros reportado en safetensors para este repo es de 18.710.528, correspondiente al tamano del adaptador y no al del modelo completo.

La relevancia de esta publicacion radica en que permite desplegar localmente un modelo MoE de gran tamano con un adaptador especializado en agentes, usando llama.cpp y un contexto minimo de 65.536 tokens exigido por Hermes. No obstante, el propio autor advierte que el adaptador no ha sido re-evaluado en GGUF y que los resultados publicados provienen de vLLM en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; adaptador LoRA sobre LFM2.5-24B-A2B |
| Parametros totales | 24B (modelo base, segun nomenclatura); 18.710.528 en safetensors de este repo (adaptador) |
| Parametros activos | 2B (segun nomenclatura A2B del modelo base) |
| Longitud de contexto | 65.536 tokens minimo recomendado para Hermes (configurable con `-c`) |
| Tipos de cuantizacion | Adaptador en F16; base disponible en Q8_0 y Q4_K_M (recomendado Q8_0) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | GGUF (adaptador LoRA F16, ~37 MB) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-24B-A2B es un transformer con arquitectura Mixture of Experts de 24B parametros totales y 2B activos por token, desarrollado por Liquid AI. Sobre el se aplica un adaptador LoRA entrenado con aprendizaje por refuerzo dentro de Hermes Agent (Nous Research), un entorno orientado a tareas agenticas con uso intensivo de herramientas. El adaptador fue entrenado sobre los pesos en BF16 del modelo base.

La conversion a GGUF se realizo con `convert_lora_to_gguf.py` de llama.cpp en precision F16. El autor recomienda usar el base en Q8_0 como opcion por defecto, ya que cuanto mas cerca este la cuantizacion del base de los pesos BF16 originales, mas fiel sera el comportamiento aprendido por el adaptador; Q4_K_M es mas pequeno pero se aleja mas de las condiciones de entrenamiento. La evaluacion original se realizo con vLLM en BF16 sobre 100 tareas de analisis de datos, con un margen de ruido de aproximadamente ±8 puntos en la diferencia de pass@1 emparejado.

## Capacidades

- Generacion de texto y razonamiento en el marco del modelo base LFM2.5-24B-A2B.
- Tool calling y function calling optimizados: el adaptador reduce un 20% las llamadas a herramientas manteniendo precision similar.
- Soporte de agentes multi-paso dentro de Hermes Agent, con sesiones de al menos 65.536 tokens.
- Ejecucion local mediante llama.cpp con carga de adaptador LoRA.
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue local de agentes con llama.cpp: el adaptador se carga sobre el GGUF base con `--lora` y se sirve con `llama serve`, permitiendo un agente funcional en hardware propio sin depender de APIs externas.
- Automatizacion de analisis de datos: el adaptador fue entrenado y evaluado en 100 tareas de analisis de datos, por lo que es adecuado para pipelines donde el agente consulta herramientas de calculo o transformacion de datos con menos llamadas redundantes.
- Integracion con Hermes Agent: configurando el endpoint en `~/.hermes/config.yaml` como proveedor custom, el modelo actua como backend de un agente conversacional con acceso a herramientas.
- Reduccion de coste en tool calling: al recortar un 20% las llamadas a herramientas en tareas resueltas, disminuye la latencia acumulada y el coste por sesion en flujos agénticos.
- Servicio multi-sesion: con `-np` y contexto de 65.536 o superior por slot, puede atender varias sesiones agenticas en paralelo en un mismo servidor llama.cpp.
- Prototipado de agentes en local: util para desarrolladores que quieran evaluar el comportamiento agentico de un MoE de 24B con 2B activos antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta version GGUF. El autor indica explicitamente que el archivo no ha sido re-evaluado a traves de llama.cpp y que los resultados de la model card original provienen de vLLM en BF16. La unica metrica reportada es cualitativa: precision aproximadamente igual al modelo base con un 20% menos de llamadas a herramientas en las tareas que ambos resuelven, sobre 100 tareas de analisis de datos con ±8 puntos de ruido en pass@1 emparejado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende de la cuantizacion del base (Q8_0 o Q4_K_M) y del contexto configurado.
- El adaptador en si ocupa aproximadamente 37 MB en F16, por lo que el grueso del requisito recae en el modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no disponible; debe evaluarse segun la cuantizacion del base de 24B.
- Despliegue: llama.cpp (`llama serve`) con `--lora`, contexto `-c 65536` o superior y `-np` para slots paralelos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- El adaptador no ha sido re-evaluado en formato GGUF; las metricas publicadas corresponden a vLLM en BF16.
- Una base cuantizada (especialmente Q4_K_M) se aleja de las condiciones de entrenamiento y puede degradar el comportamiento aprendido.
- Evaluacion limitada: 100 tareas de un unico dominio (analisis de datos), con ±8 puntos de ruido en pass@1 emparejado.
- Requiere un minimo de 65.536 tokens de contexto por sesion para Hermes; contextos menores pueden romper el flujo agentico.
- Idiomas soportados no documentados; riesgo de comportamiento degradado fuera de los idiomas del entrenamiento del base.
- Licencia lfm1.0 (license: other): deben revisarse las condiciones de uso comercial en el enlace de licencia del modelo base antes de desplegar en produccion.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; aplican los del modelo base LFM2.5-24B-A2B.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes-GGUF
- Adaptador original: https://huggingface.co/harness-hub/LFM2.5-24B-A2B-hermes
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- GGUF del modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- Hermes Agent: https://github.com/NousResearch/hermes-agent
- llama.cpp: https://github.com/ggml-org/llama.cpp
