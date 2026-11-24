# mradermacher/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF

## Resumen

AirQuality-SLM-Model-B es un ajuste fino de Qwen2.5-1.5B-Instruct orientado a tareas relacionadas con la calidad del aire. El modelo original fue publicado por el usuario prajwal90 en Hugging Face y esta variante ha sido cuantizada a GGUF por mradermacher, un conocido generador de cuantizaciones para la comunidad de llama.cpp y Ollama. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 y su licencia Apache 2.0.

La relevancia de esta ficha esta en su caracter de modelo pequeno (small language model, SLM) especializado: con 1.543.714.304 parametros totales, puede ejecutarse en hardware de consumo y en entornos con recursos limitados, lo que lo hace atractivo para despliegues en dispositivos perifericos, estaciones de monitorizacion ambiental o aplicaciones de bajo coste donde no es viable un modelo de mayor tamano.

El repositorio ofrece un conjunto amplio de cuantizaciones GGUF (desde Q2_K hasta f16) que cubren desde 0,8 GB hasta 3,2 GB en disco, lo que permite ajustar el equilibrio entre calidad y consumo de memoria segun el hardware disponible. No se dispone de informacion publicada sobre el dataset de ajuste fino, los benchmarks ni las capacidades especificas mas alla de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atencion causal estandar. No se dispone de informacion sobre el proceso de ajuste fino que dio lugar a AirQuality-SLM-Model-B: se desconoce el numero de tokens de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT, y que innovaciones tecnicas concretas introduce respecto al modelo base. La model card del repositorio de cuantizacion es una plantilla generica de mradermacher y no aporta detalles sobre el entrenamiento del modelo original.

Lo unico verificable es que se trata de una cuantizacion estatica (no weighted/imatrix, segun indica el autor) del modelo prajwal90/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct. Las cuantizaciones se generaron con la version 2 del pipeline de mradermacher y el tensor de salida esta cuantizado. No se han publicado pesos en formato safetensors en este repositorio, solo GGUF.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Capacidad de chat gracias a la etiqueta `chat` y al ajuste instruct del modelo base.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este ajuste fino concreto; el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero no hay evidencia de que se haya preservado tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades multilingues: la model card declara unicamente `en`; no se confirma soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional especializado en calidad del aire: el modelo puede responder preguntas sobre contaminantes, indices AQI y recomendaciones sanitarias en ingles, aprovechando su ajuste fino tematico y su bajo coste de inferencia.
- Despliegue en dispositivos perifericos o edge: con cuantizaciones de 0,8 a 1,1 GB (Q2_K a Q4_K_M), cabe en Raspberry Pi 5 con 8 GB de RAM o en mini-PC con CPU, lo que permite integraciones en estaciones de monitorizacion ambiental sin GPU.
- Prototipado rapido de aplicaciones de chat: al estar en formato GGUF, se puede cargar directamente en llama.cpp u Ollama para validar flujos conversacionales antes de invertir en modelos mayores.
- Educacion y divulgacion ambiental: generacion de explicaciones accesibles sobre normativa de calidad del aire, efectos de PM2.5 y PM10, y habitos de proteccion, con latencia baja en hardware modesto.
- Clasificacion y resumen de informes ambientales: el modelo puede resumir textos tecnicos o extraer conclusiones de boletines de calidad del aire, aunque su ventana de contexto efectiva no esta confirmada.
- Filtrado y preprocesado en pipelines de datos: uso como modelo auxiliar para etiquetar o normalizar consultas ciudadanas sobre contaminacion antes de pasarlas a un modelo mayor.
- Demo educativa de cuantizacion: el repositorio ofrece 12 variantes GGUF con tamanos documentados, lo que lo convierte en un caso practico para estudiar el impacto de la cuantizacion en calidad y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,8 GB
  - Q3_K_S / Q3_K_M: ~0,9 GB
  - Q3_K_L / IQ4_XS / Q4_K_S: ~1,0 GB
  - Q4_K_M: ~1,1 GB
  - Q5_K_S / Q5_K_M: ~1,2 GB
  - Q6_K: ~1,4 GB
  - Q8_0: ~1,7 GB
  - f16: ~3,2 GB
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre para cuantizaciones Q4, como GTX 1650, RTX 3050, RTX 4060 o superiores. Para f16 se recomienda al menos 4 GB de VRAM (GTX 1650 Super, RTX 3050 6 GB o superior).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: si, con cuantizaciones Q4_K_M o inferiores en equipos con 4 GB de RAM o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, y cualquier runtime compatible con GGUF. El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1.5B en GGUF, se espera una generacion en tiempo real en GPU consumer y varios tokens por segundo en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF | 1,54 B | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad porque no hay datos de rendimiento publicados para el modelo especializado. El modelo base Qwen2.5-1.5B-Instruct es la referencia natural, y las alternativas de la misma categoria (SLM de 1-2B) compiten en el mismo segmento de despliegue en hardware modesto.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos para este ajuste fino; al derivar de Qwen2.5, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: alto en un modelo de 1,5B, especialmente en dominios tecnicos como normativa ambiental, donde puede inventar valores limite o referencias legales.
- Limitaciones de contexto o idioma: la model card declara unicamente ingles; no se confirma el soporte de castellano ni de otros idiomas. La longitud de contexto efectiva del ajuste fino no esta verificada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el ajuste fino no introduzca datos con licencias incompatibles; no hay informacion al respecto.
- Caveats para produccion: no hay benchmarks publicados, ni evaluacion de calidad del ajuste fino, ni documentacion del dataset. El modelo no deberia usarse en produccion sin una evaluacion propia en el dominio objetivo. Las cuantizaciones Q2_K y Q3_K_M tienen calidad reducida segun el propio autor.
- Advertencia sobre el ajuste fino: al no conocerse el proceso de entrenamiento, no se puede garantizar que las capacidades de tool calling o el formato de chat del modelo base se hayan preservado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct-GGUF
- Modelo base (ajuste fino): https://huggingface.co/prajwal90/AirQuality-SLM-Model-B-Qwen2.5-1.5B-Instruct
- Modelo base original (Qwen2.5-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Pagina de resumen de cuantizaciones del autor: https://hf.tst.eu/model#AirQuality-SLM-Model-B-Instruct-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
