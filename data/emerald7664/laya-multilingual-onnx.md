# Emerald7664/laya-multilingual-onnx

## Resumen

Laya Multilingual ONNX es una exportación optimizada para CPU del modelo base convaiinnovations/laya-multilingual, un clasificador de texto de 322 millones de parámetros construido sobre la arquitectura mmBERT. El repositorio, publicado por el usuario Emerald7664, no entrena un modelo nuevo, sino que convierte los pesos originales a formato ONNX y aplica cuantización selectiva para reducir la latencia en procesadores convencionales. Su función es actuar como clasificador de prompts, enrutador semántico de decisiones y componente de "System One" (vía rápida) dentro de pipelines de agentes, sin necesidad de GPU.

El problema que aborda es concreto: la exportación WebGPU previa (mizchi/laya-multilingual-onnx) está en FP16 y, en CPUs x86_64 o ARM sin unidades vectoriales de media precisión, ONNX Runtime emula FP16 por software, con latencias de aproximadamente 3.900 ms por secuencia. Esta ficha técnica incluye dos alternativas calibradas: un modelo INT8 de 325 MB que tarda entre 250 y 300 ms por secuencia, y un modelo FP32 de 1,29 GB con 550-650 ms, con paridad bit a bit respecto a PyTorch.

Es relevante ahora porque permite ejecutar clasificación y enrutado multilingüe en diez idiomas sobre hardware de consumo o servidores sin acelerador, con 0,0 ms de latencia de red al operar en proceso. El modelo se integra de serie con OpenProxy, que lo detecta y carga de forma nativa sin dependencias de Python.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mmBERT (encoder transformer) |
| Parametros totales | 322 millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QInt8 por canal dinámico (INT8), Float32 y Float16 (export original WebGPU) |
| Idiomas soportados | en, es, zh, ja, fr, de, pt, ru, it, hi (multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (acompañado de tokenizer.json y rl_agent_config.json) |

Notas adicionales de tamaño y latencia por checkpoint:

| Fichero | Precision | RAM / disco | Latencia en CPU |
|---|---|---|---|
| model.onnx / model-int8.onnx | QInt8 | 325 MB | 250 - 300 ms |
| model-fp32.onnx | Float32 | 1,29 GB | 550 - 650 ms |
| Export WebGPU original | Float16 | 617 MB | ~3.900 ms (emulado por software) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura mmBERT, un encoder transformer de 322 millones de parámetros orientado a tareas de comprensión y clasificación. La contribución de este repositorio no es arquitectónica, sino de despliegue: parte de los pesos base, los exporta a ONNX y aplica cuantización dinámica por canal (QInt8). La decisión técnica destacable es la cuantización selectiva: las capas sensibles (`scorer`, `act_head` y `type_emb`) se mantienen en precisión completa para preservar el 100 % de la precisión de clasificación, mientras el resto del grafo se cuantiza a INT8. La aceleración se apoya en las instrucciones `asimddp` (`sdot`/`udot`) de ARMv8.2-A y en AVX-512 VNNI de x86; el checkpoint FP32 está optimizado para ARM NEON y x86 AVX2.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF o DPO. El repositorio incluye un fichero `rl_agent_config.json` con escalado de temperatura calibrado y umbrales de categoría, lo que sugiere un componente de decisión afinado, pero los detalles metodológicos no están publicados en la información disponible.

## Capacidades

- Clasificación de texto y enrutado de decisiones: etiqueta prompts o entradas según categorías predefinidas.
- Enrutado semántico para pipelines de agentes: decide qué camino o herramienta tomar en función del contenido de la entrada.
- Inferencia "System One" de vía rápida: pensada para decisiones de baja latencia antes de invocar modelos mayores.
- Ajuste de umbrales por categoría y escalado de temperatura mediante `rl_agent_config.json`.
- Soporte multilingüe en diez idiomas: inglés, español, chino, japonés, francés, alemán, portugués, ruso, italiano e hindi.
- Ejecución en CPU sin GPU: inferencia en proceso con 0,0 ms de latencia de red.
- Integración nativa con OpenProxy, que detecta el modelo automáticamente.
- Soporte de tool calling / function calling: no disponible.
- Modo de razonamiento extendido, visión o audio: no disponible.

## Casos de uso

- Enrutado de peticiones en sistemas multiagente: el modelo clasifica cada prompt entrante en una categoría y lo dirige al agente o herramienta correspondiente, con latencia de 250-300 ms en CPU, evitando llamar a un LLM grande solo para decidir la ruta.
- Clasificación de intenciones en atención al cliente: etiqueta tickets o mensajes por temática o urgencia antes de que un modelo generativo redacte la respuesta, reduciendo coste y tiempo de proceso.
- Filtro previo (guardarraíl) antes de invocar un modelo grande: descarta o reclasifica entradas irrelevantes, abusivas o fuera de dominio en la propia máquina, sin coste de red.
- Preprocesamiento en edge o dispositivos embebidos: al requerir solo 325 MB y no necesitar GPU, puede ejecutarse en servidores ARM (Neoverse N1, Cortex-A76) o equipos de consumo para tareas de triaje local.
- Moderación y triaje de contenido multilingüe: clasifica contenido en diez idiomas de forma homogénea, adecuado para plataformas con audiencia internacional.
- Enrutado semántico en arquitecturas RAG: decide qué índice, colección o fuente de recuperación consultar según la intención detectada en la consulta.
- Clasificación de spam o priorización de bandejas: etiqueta mensajes por categoría con umbrales calibrados por clase mediante el fichero de configuración incluido.
- Detección de idioma y enrutado por idioma: al cubrir diez lenguas, puede derivar cada petición al pipeline o modelo especializado correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio únicamente reporta métricas de latencia en CPU (250-300 ms para INT8 y 550-650 ms para FP32), sin cifras de exactitud, F1, MMLU ni otras evaluaciones estándar, ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue por CPU. En caso de usar GPU, el checkpoint INT8 ocupa 325 MB y el FP32 1,29 GB de memoria.
- CPU recomendadas: procesadores x86 con AVX-512 VNNI o AVX2, y ARMv8.2-A con instrucciones `asimddp` (`sdot`/`udot`), como Neoverse N1 o Cortex-A76.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU compatible con ONNX Runtime (CUDA o TensorRT) podría ejecutarlo, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: es viable por tamaño (325 MB en INT8), aunque el diseño objetivo es la ejecución en CPU sin acelerador.
- Opciones de despliegue: ONNX Runtime, OpenProxy (integración nativa), Docker (imagen `ghcr.io/soyelmismo/openproxy:latest`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 250-300 ms por secuencia en INT8 y 550-650 ms en FP32. Throughput no disponible.
- Almacenamiento: el repositorio completo ocupa 1,7 GB; las descargas individuales son de 325 MB (INT8) y 1,29 GB (FP32).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Laya Multilingual ONNX (esta ficha) | 322 M | no disponible | Apache 2.0 | HuggingFace, ONNX |
| convaiinnovations/laya-multilingual | 322 M | no disponible | no disponible | HuggingFace |
| XLM-RoBERTa base | ~278 M | 512 tokens | MIT | HuggingFace |
| mDeBERTa-v3 base | ~278 M | 512 tokens | MIT | HuggingFace |
| DistilBERT multilingue | ~134 M | 512 tokens | Apache 2.0 | HuggingFace |

No hay datos de rendimiento comparado disponibles para establecer diferencias de exactitud o F1 entre estas alternativas.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no es posible validar la precisión de clasificación ni compararla con alternativas.
- La longitud de contexto del modelo base no está documentada en la información disponible.
- El repositorio es reciente y no registra descargas ni valoraciones (0 descargas, 0 likes), lo que limita la evidencia de uso en producción.
- Existe una discrepancia en los comandos de descarga de la model card: referencian `soyelmismo/laya-multilingual-onnx` y `soyelmismo/openproxy`, mientras que el repositorio analizado es `Emerald7664/laya-multilingual-onnx`. Conviene verificar las rutas antes de integrarlo.
- La cuantización INT8 puede degradar la precisión en tareas distintas de la clasificación para la que fue calibrada, aunque el autor afirma preservar el 100 % en las capas sensibles.
- Riesgo de alucinación: no aplica directamente (es un clasificador, no un modelo generativo), pero sí existe riesgo de clasificación errónea y de umbrales mal calibrados si se usa fuera del dominio previsto.
- Sesgos conocidos: no disponible. Al ser multilingüe, puede heredar sesgos de representación desigual entre los diez idiomas soportados.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de mantener avisos de licencia y atribución; se debe conservar la atribución al modelo base `convaiinnovations/laya-multilingual`.
- Para producción conviene validar los umbrales de `rl_agent_config.json` sobre datos propios, ya que están calibrados para el caso de uso del autor.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/Emerald7664/laya-multilingual-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Export WebGPU original en FP16: https://huggingface.co/mizchi/laya-multilingual-onnx
- Repositorio OpenProxy: https://github.com/soyelmismo/openproxy
- Ruta alternativa citada en la model card: https://huggingface.co/soyelmismo/laya-multilingual-onnx
