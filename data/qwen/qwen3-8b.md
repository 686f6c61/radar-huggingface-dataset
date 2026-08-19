# Qwen/Qwen3-8B

## Resumen

Qwen3-8B es un modelo de lenguaje causal denso de 8.200 millones de parametros, desarrollado por el equipo Qwen (Alibaba). Forma parte de la serie Qwen3, lanzada en abril de 2025, que incluye modelos densos y de mezcla de expertos (MoE). Su principal innovacion es la conmutacion fluida entre modo de pensamiento (thinking) y modo directo (non-thinking) dentro de un mismo modelo, lo que permite abordar tareas de razonamiento complejo y dialogos generalistas con un unico despliegue.

El modelo se entrena en dos fases (pretraining y post-training) y destaca por su mejora sustancial en razonamiento, generacion de codigo, matematicas y seguimiento de instrucciones frente a la generacion anterior Qwen2.5. Soporta mas de 100 idiomas y dialectos, y ofrece capacidades de agente con integracion de herramientas externas tanto en modo thinking como non-thinking. Con licencia Apache 2.0, es totalmente libre para uso comercial.

La ventana de contexto nativa es de 32.768 tokens, ampliable a 131.072 tokens mediante la extension YaRN. Su tamano de 8B lo hace desplegable en hardware de consumo con cuantizacion, lo que lo convierte en una opcion atractiva para equipos que necesitan un modelo de razonamiento potente sin los requisitos de las variantes MoE mas grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con GQA (32 cabezas Q, 8 cabezas KV), 36 capas |
| Parametros totales | 8.190.735.360 (8,2B); 6,95B sin embeddings |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo; 131.072 tokens con YaRN |
| Tipos de cuantizacion | No disponible (el repositorio oficial publica safetensors; la comunidad ofrece GGUF via llama.cpp, Ollama y LM Studio) |
| Idiomas soportados | Mas de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (original); GGUF disponible en el ecosistema |

## Arquitectura y entrenamiento

Qwen3-8B es un modelo causal denso basado en transformer con atencion de consultas agrupadas (GQA): 32 cabezas de consulta y 8 cabezas de clave/valor, distribuidas en 36 capas. Esta configuracion reduce el coste de la cache KV frente a la atencion multi-cabeza estandar, lo que resulta relevante para la extension de contexto a 131.072 tokens mediante YaRN.

El entrenamiento comprende una fase de pretraining y una fase de post-training. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, pero indica que el post-training incluye alineacion con preferencias humanas (superior human preference alignment) y mejoras en razonamiento, codigo y matematicas. La innovacion tecnica mas destacable es la capacidad de alternar entre modo thinking (similar a QwQ-32B) y modo non-thinking mediante el parametro `enable_thinking` en la plantilla de chat, sin necesidad de cambiar de modelo. En modo thinking se recomienda usar temperatura 0,6, TopP 0,95 y TopK 20, evitando la decodificacion greedy por riesgo de repeticiones.

## Capacidades

- Razonamiento complejo en modo thinking para matematicas, logica y codigo, con generacion de un bloque de contenido de pensamiento previo a la respuesta.
- Dialogo generalista eficiente en modo non-thinking para consultas simples y conversacion directa.
- Generacion de codigo y soporte de tareas de programacion en ambos modos.
- Capacidades de agente con integracion precisa de herramientas externas (tool calling) en modo thinking y non-thinking.
- Seguimiento de instrucciones multilingue en mas de 100 idiomas y dialectos, con traduccion incluida.
- Escritura creativa, role-playing y dialogos multi-turno con buena alineacion con preferencias humanas.
- Extension de contexto a 131.072 tokens con YaRN para procesamiento de documentos largos.

## Casos de uso

- Atencion al cliente automatizada: el modelo gestiona conversaciones multi-turno en multiples idiomas gracias a su ventana de 32K tokens nativa, y puede alternar al modo thinking para resolver consultas que requieren razonamiento antes de responder.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar pruebas unitarias, documentacion de API o parches de correccion, usando el modo non-thinking para latencia baja.
- Agentes autonomos con herramientas: su capacidad de agente permite construir asistentes que consultan APIs externas, bases de datos o motores de busqueda, encadenando pasos de razonamiento en modo thinking.
- Traduccion y localizacion multilingue: con soporte de mas de 100 idiomas, es adecuado para servicios de traduccion automatica y adaptacion de contenido a multiples mercados.
- Asistentes de documentacion tecnica con RAG: la extension YaRN a 131K tokens permite indexar manuales extensos o documentacion corporativa y responder preguntas con contexto amplio.
- Escritura creativa y marketing: su alineacion con preferencias humanas lo hace util para generar borradores de articulos, guiones, copy publicitario o narrativa de ficcion con estilo consistente.
- Analisis de datos y razonamiento logico: en modo thinking, puede descomponer problemas estadisticos o financieros paso a paso, util en entornos de analisis de negocio sin acceso a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen3 para la evaluacion detallada (https://qwenlm.github.io/blog/qwen3/), donde se comparan los resultados en matematicas, generacion de codigo y razonamiento logico frente a Qwen2.5 y QwQ, pero esos datos no estan incluidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16-17 GB en FP16/BF16 para los 8,2B de parametros; unos 9 GB en INT8 y entre 5-6 GB con cuantizacion GGUF Q4.
- GPU recomendadas: A100, H100, RTX 4090 o RTX 3090 para FP16; GPUs consumer de 8-12 GB (RTX 4070, 4060 Ti) con cuantizacion INT4/GGUF.
- Cabe en GPU de consumo: si, con cuantizacion GGUF Q4 en GPUs de 8 GB o mas; en FP16 requiere al menos 20 GB de VRAM.
- Opciones de despliegue: vLLM (>= 0.8.5), SGLang (>= 0.4.6.post1), TGI, llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers. vLLM y SGLang soportan el modo reasoning con parser dedicado.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera de la GPU, la cuantizacion y el modo (thinking genera tokens adicionales de razonamiento que incrementan la latencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Modo thinking | Idiomas |
|---|---|---|---|---|---|
| Qwen3-8B | 8,2B | 32K (131K YaRN) | Apache 2.0 | Si (conmutable) | 100+ |
| Qwen2.5-7B | 7,6B | 32K (128K YaRN) | Apache 2.0 | No | 100+ |
| Qwen3-4B | 4B | 32K (131K YaRN) | Apache 2.0 | Si (conmutable) | 100+ |

La comparativa se limita a modelos de la misma familia porque la informacion disponible no incluye datos de rendimiento de otras alternativas del mismo tamano. Segun la model card, Qwen3-8B supone una mejora clara sobre Qwen2.5-7B en matematicas, codigo y seguimiento de instrucciones, y anade el modo thinking que Qwen2.5 no ofrece. Frente a Qwen3-4B, ofrece el doble de parametros y, previsiblemente, mayor capacidad de razonamiento, aunque con mayor requisito de VRAM.

## Limitaciones y advertencias

- Riesgo de alucinacion en tareas factuales, especialmente en modo thinking donde el modelo puede generar razonamientos plausibles pero incorrectos.
- En modo thinking, la decodificacion greedy provoca degradacion del rendimiento y repeticiones infinitas; es obligatorio usar sampling con temperatura 0,6, TopP 0,95 y TopK 20.
- La extension de contexto a 131K tokens via YaRN puede degradar la calidad de la respuesta en segmentos muy largos; el contexto nativo seguro es de 32K.
- Requiere transformers >= 4.51.0; versiones anteriores fallan con el error `KeyError: 'qwen3'`.
- No se documentan sesgos especificos en la model card; al entrenarse con datos web multilingue, es probable que herede sesgos socioculturales de esos datos.
- El modo thinking genera tokens adicionales de razonamiento, lo que incrementa la latencia y el coste por consulta frente al modo non-thinking.
- La informacion sobre cuantizaciones oficiales no esta disponible; las versiones GGUF son mantenidas por la comunidad y pueden tener diferencias de calidad.

## Enlaces

- HuggingFace: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Ficha en Benchable: https://benchable.ai/models/qwen/qwen3-8b-04-28
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3-8b
