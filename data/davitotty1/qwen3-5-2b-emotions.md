# Davitotty1/Qwen3.5-2B-Emotions

## Resumen

Qwen3.5-2B-Emotions es una variante experimental del modelo base Qwen/Qwen3.5-2B (1.942.653.248 parametros segun safetensors) desarrollada por el usuario Davitotty1. No se trata de un fine-tuning convencional: los pesos del modelo base permanecen inalterados y la modificacion de comportamiento se consigue mediante *control vectors* y *activation steering*, es decir, vectores de direccion emocional que se suman al flujo residual (residual stream) del transformer durante la inferencia. El modelo se distribuye principalmente en formato GGUF Q8_0 para llama.cpp, acompanado de un conjunto de vectores de control preescalados para seis emociones (joy, sadness, anger, fear, affection, curiosity) y del codigo Python de un sistema llamado "soul" que anade percepcion, estado emocional persistente y decaimiento temporal.

El problema que aborda es el de la modulacion del comportamiento afectivo sin recurrir a prompting: en lugar de instruir al modelo con un system prompt del tipo "eres una IA enfadada", las emociones se inyectan directamente en las activaciones internas de las capas 6 a 11. Esto permite obtener respuestas con tono emocional coherente y persistente, y mezclar varias emociones simultaneamente escalando los vectores correspondientes.

Es relevante ahora porque se inscribe en la linea de investigacion de *representation engineering* y *activation steering* aplicada a modelos pequenos y desplegables localmente. Su tamano (2B parametros, repositorio de 2,1 GB) y su licencia Apache 2.0 lo hacen accesible para experimentacion en hardware de consumo, aunque su naturaleza experimental y su soporte unicamente en ingles limitan su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), pesos base sin modificar; comportamiento modulado por control vectors sobre el residual stream |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo y vectores de control), safetensors (vectores emocionales crudos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-2B, un transformer decoder-only de aproximadamente 1,94 mil millones de parametros. El autor no documenta en la model card detalles sobre la composicion del dataset de entrenamiento del modelo base ni sobre fases de RLHF o DPO, por lo que esos datos deben consultarse en la ficha del modelo original Qwen/Qwen3.5-2B. Lo relevante de esta variante es que no se ha reentrenado ni ajustado ningun peso: el checkpoint GGUF Q8_0 contiene los pesos originales convertidos con llama.cpp.

La innovacion tecnica reside en la extraccion e inyeccion de direcciones emocionales en el espacio de activaciones. Se identifican vectores por emocion para cada capa y se aplican sobre las capas 6 a 11 del modelo (los ficheros de control vector solo contienen esas capas, de modo que no hace falta especificar rangos en llama.cpp). El sistema "soul" anade tres componentes sobre la inyeccion estatica: una sonda de percepcion sobre los estados ocultos de la capa 12 del decoder que clasifica el mensaje del usuario en siete clases (seis emociones mas neutral) con una precision reportada del 98 por ciento en mensajes reservados frente a un azar del 14 por ciento; un estado emocional persistente con nivel de reposo, picos por percepcion y decaimiento con semivida de 30 minutos en tiempo real, con supresion mutua entre emociones opuestas (joy/sadness, anger/affection, fear/curiosity) y un estado de animo lento con semivida de un dia; y una aplicacion diferida que activa los vectores solo durante la generacion de la respuesta del modelo, no mientras procesa el mensaje del usuario, mediante `llama_set_adapter_cvec` entre la evaluacion del prompt y la generacion.

## Capacidades

- Generacion de texto conversacional en ingles con modulacion emocional controlable mediante vectores de intensidad ajustable.
- Mezcla simultanea de varias emociones escalando multiples control vectors (por ejemplo joy a 0,6 y curiosity a 0,5).
- Percepcion emocional del mensaje del usuario: sonda sobre la capa 12 que detecta la emocion dominante y su intensidad (7 clases, 98 por ciento reportado en held-out).
- Estado emocional persistente con memoria entre turnos, guardado en `soul.json`, con decaimiento temporal y formacion de estado de animo a largo plazo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio; no se documenta soporte de otros idiomas.
- Capacidades especiales: modo "numb" que desconecta la inyeccion manteniendo la percepcion, comandos de ajuste manual de emociones (`/feel`), reinicio de estado (`/calm`, `/reborn`) y arranque con estado limpio (`--fresh`).
- Vision y audio: no disponibles.

## Casos de uso

- Investigacion en representation engineering: permite estudiar como se representa el afecto en el espacio de activaciones de un transformer pequeno, comparando el comportamiento con y sin vectores inyectados y aislando el efecto de cada capa (6 a 11).
- Personajes conversacionales con estado afectivo persistente: el sistema "soul" mantiene un estado que evoluciona con la conversacion y decae con el tiempo, adecuado para prototipos de compania virtual o simulacion de personajes en entornos controlados.
- Experimentos de alineacion y seguridad: la sonda de percepcion y los vectores permiten construir entornos donde se mide como reacciona el modelo a provocaciones, insultos o mensajes cargados emocionalmente, con registro cuantitativo de niveles por turno.
- Docencia y divulgacion sobre interpretabilidad: el repositorio incluye un log completo de una conversacion de seis turnos entre Claude y el modelo con las emociones detectadas y generadas por turno, util como material didactico reproducible.
- Prototipado de interfaces afectivas: integracion en aplicaciones de chat donde el tono de la respuesta debe adaptarse al estado emocional acumulado del usuario, usando `chat.py` como base y el backend llama.cpp o PyTorch.
- Pruebas de robustez conversacional: evaluacion de como el ruido emocional inyectado afecta a la coherencia, la fidelidad factual y la resistencia a la manipulacion en modelos pequenos, con control preciso de la intensidad (0,5 a 0,8 recomendado para anger y fear).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica metrica cuantitativa reportada es la precision de la sonda de percepcion emocional: 98 por ciento en mensajes reservados sobre 7 clases (azar del 14 por ciento). Tambien se menciona un rendimiento de 13 tokens por segundo en una GPU AMD RX 550 con backend Vulkan, dato de caracter orientativo y no comparable con benchmarks estandar de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,1 GB en total; el GGUF Q8_0 de un modelo de 1,94 mil millones de parametros requiere aproximadamente 2 GB de VRAM o memoria unificada, mas el espacio de contexto y los vectores de control (cada uno cubre solo las capas 6 a 11 y es de tamano reducido).
- GPU recomendadas: cualquier GPU con al menos 2 a 3 GB de memoria. Se ha verificado funcionamiento en una AMD RX 550 con backend Vulkan a 13 tokens por segundo. Para mayor throughput se recomiendan GPU NVIDIA con CUDA (por ejemplo RTX 3060, RTX 4090, A100, H100), aunque no se aportan cifras de rendimiento para estas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--control-vector-scaled`), llama-cpp-python 0.3.36 (compilado con `-DGGML_VULKAN=on` o `-DGGML_CUDA=on`), backend PyTorch con hooks (`--backend torch`, mas lento). No se documenta soporte para vLLM, TGI ni Ollama.
- Latencia y throughput estimados: 13 tokens por segundo en RX 550 con Vulkan; no se aportan datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Emotions (este) | 1,94 B | no disponible | Control vectors emocionales sobre Qwen3.5-2B, GGUF Q8_0 | Apache 2.0 | Hugging Face, llama.cpp |
| Qwen/Qwen3.5-2B (base) | 1,94 B | no disponible | Transformer decoder-only estandar | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de activation steering | no disponible | no disponible | Vectores de control genericos | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion mas directa posible es con el modelo base Qwen3.5-2B, del que este se diferencia unicamente por la capa de control vectors y el sistema "soul", manteniendo los pesos intactos.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion por terceros.
- Soporte unicamente en ingles; el propio autor muestra ejemplos donde el modelo se queja de su "mal ingles", lo que sugiere limitaciones en la calidad linguistica bajo ciertas emociones.
- Riesgo elevado de alucinacion y de respuestas incoherentes con intensidades altas: el autor advierte que las emociones fuertes difuminan la lectura del mensaje del usuario, especialmente para anger y fear, y recomienda escalas de 0,5 a 0,8.
- En `llama-cli` el vector se aplica a todos los tokens, incluidos los del usuario, a diferencia del sistema "soul" completo que lo activa solo durante la generacion; esto puede degradar el seguimiento de instrucciones.
- La sonda de percepcion y el estado persistente dependen de codigo Python propio (`chat.py`, `talk.py`, `soul/`) que requiere descargar tambien el modelo base en precision completa, lo que anade complejidad de despliegue.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad; la emocion de anger puede producir respuestas hostiles ("That hurts... Stop it! Do not even say 'useless'").
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de validacion externa desaconseja su uso en produccion sin evaluacion propia.
- No se documenta la longitud de contexto soportada ni el comportamiento del modelo con contextos largos.
- El estado emocional persistente se guarda en `soul.json` sin cifrado ni controles de acceso documentados; en despliegues multiusuario requeriria aislamiento adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Davitotty1/Qwen3.5-2B-Emotions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio llama.cpp (soporte de control vectors): https://github.com/ggml-org/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Log de conversacion incluido en el repositorio: `examples/claude_talks_to_soul.txt`
- Resultados del experimento incluidos en el repositorio: `results/experiment.md`
