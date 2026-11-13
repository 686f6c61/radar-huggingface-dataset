# slop-shop/MiniCPM5-2B-Base-GGUF

## Resumen

MiniCPM5-2B-Base-GGUF es una cuantización en formato GGUF del modelo base openbmb/MiniCPM5-2B-Base, publicada por el usuario slop-shop. No se trata de un modelo entrenado desde cero, sino de una conversión de los pesos oficiales al formato que consume llama.cpp, lo que permite ejecutar el modelo en CPU, GPU de consumo y entornos con recursos limitados. El repositorio contiene una única cuantización Q4_K_M generada con la herramienta `convert_hf_to_gguf.py` y `llama-quantize` de la build `b12110` de llama.cpp, sin matriz de importancia (imatrix).

El modelo subyacente, MiniCPM5-2B-Base, pertenece a la familia MiniCPM desarrollada por OpenBMB y cuenta con 2.516.756.480 parámetros totales según los pesos en safetensors del modelo original. Al ser una variante "Base", está pensada como punto de partida para fine-tuning y no como modelo de instrucciones o chat afinado. La licencia declarada es Apache 2.0, lo que facilita su uso comercial y su redistribución.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo de aproximadamente 2.500 millones de parámetros en hardware modesto mediante llama.cpp, con un tamaño de repositorio de 1,6 GB. La información pública disponible sobre esta cuantización concreta es muy escasa (5 descargas y 0 likes en el momento de la consulta), por lo que numerosos datos técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: openbmb/MiniCPM5-2B-Base) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos originales en safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base MiniCPM5-2B-Base en la documentación proporcionada. Por la denominación y el tamaño (2.516.756.480 parámetros), se trata de un transformer de aproximadamente 2.500 millones de parámetros, pero no se confirma en la información disponible si emplea atención estándar, atención lineal u otras variantes, ni el número de capas, dimensiones ocultas o cabezas de atención. Tampoco se detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF, DPO o ajuste por instrucciones; al ser una variante "Base", es esperable que no incluya ajuste conversacional, aunque esto no se confirma explícitamente.

En cuanto al proceso de cuantización, la model card sí es precisa: se usó `convert_hf_to_gguf.py` de llama.cpp en la etiqueta `b12110`, con transformers 4.57.6 y tipo de salida bf16, seguido de `llama-quantize` con tipo Q4_K_M. No se empleó imatrix, lo que implica que la cuantización se basa en el algoritmo estándar de llama.cpp sin calibración con datos, un detalle relevante para estimar la posible pérdida de calidad frente a cuantizaciones calibradas. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base, la capacidad principal es la continuación de texto y la modelización del lenguaje, sin alineación específica para instrucciones.
- Punto de partida para fine-tuning: al tratarse de una variante Base, está orientado a ser ajustado posteriormente para tareas concretas (clasificación, extracción, generación especializada).
- Ejecución en llama.cpp: compatible con el ecosistema llama.cpp, lo que habilita inferencia en CPU y GPU con backend GGUF.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de endpoints compatible con el formato de Hugging Face.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Razonamiento multi-paso y agentes: no disponible; no se documenta.
- Vision, audio o modo thinking: no disponible; no se documenta.

## Casos de uso

- Fine-tuning para tareas de clasificación de texto: el modelo base puede ajustarse con un conjunto etiquetado para clasificación de documentos, correos o tickets, aprovechando su tamaño moderado y su licencia Apache 2.0 para uso comercial.
- Generación de texto en entornos con recursos limitados: la cuantización Q4_K_M permite ejecutar el modelo en CPU o en GPU de consumo, útil para prototipos, demos locales y aplicaciones de escritorio que no pueden depender de la nube.
- Experimentación académica con modelos de ~2.500 millones de parámetros: sirve como banco de pruebas para estudiar técnicas de cuantización, evaluación de degradación por Q4_K_M o comparativas de inferencia en llama.cpp.
- Base para modelos especializados de dominio: partiendo de los pesos base, se puede realizar continued pretraining o fine-tuning supervisado en dominios como legal, sanitario o técnico, con la ventaja de la licencia permisiva.
- Generación de texto asistida en pipelines de datos: uso para aumentar o completar corpus, generar variaciones de texto o preprocesar datos en flujos offline donde la latencia no es crítica.
- Despliegue en dispositivos edge o entornos air-gapped: al distribuirse como un único archivo GGUF de aproximadamente 1,6 GB, puede copiarse a máquinas sin conexión y ejecutarse con llama.cpp sin dependencias de servicios externos.
- Evaluación comparativa de cuantizaciones: al no usar imatrix, este repositorio es un punto de referencia útil para medir la diferencia entre cuantización estándar y cuantizaciones calibradas del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y ~2.500 millones de parámetros, el archivo de pesos ronda los 1,6 GB; la VRAM necesaria para cargar el modelo completo suele situarse en el rango de 2 a 3 GB, dependiendo del backend y del tamaño de la ventana de contexto configurada (dato no confirmado en la información disponible).
- GPU recomendadas: no disponible de forma específica; por tamaño, cabría en GPU de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, así como en GPU de datacenter (A100, H100) si se prioriza throughput.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en la mayoría de GPU con 4 GB o más de VRAM, aunque la cifra exacta no está documentada en la información proporcionada.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama (si se importa el GGUF), y servidores compatibles con endpoints según la etiqueta `endpoints_compatible`. vLLM y TGI no se mencionan como soportados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| slop-shop/MiniCPM5-2B-Base-GGUF | 2.516.756.480 | no disponible | Apache 2.0 | GGUF (Q4_K_M) | Cuantización sin imatrix del base MiniCPM5-2B |
| openbmb/MiniCPM5-2B-Base | 2.516.756.480 | no disponible | Apache 2.0 | safetensors | Modelo original del que deriva esta cuantización |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

La comparación con modelos de otras familias (por ejemplo, variantes de ~2-3B parámetros de otros desarrolladores) no puede realizarse con rigor porque no se han proporcionado especificaciones ni resultados de benchmarks de alternativas en la información disponible.

## Limitaciones y advertencias

- Modelo base sin alineación: al ser una variante "Base", no está ajustado para seguir instrucciones ni para mantener conversaciones; su uso directo en chat puede producir respuestas incoherentes o no deseadas.
- Cuantización sin imatrix: la Q4_K_M se generó sin matriz de importancia, lo que puede implicar una mayor degradación de calidad frente a cuantizaciones calibradas, especialmente en tareas sensibles.
- Sesgos conocidos: no disponibles en la información proporcionada; todo modelo de lenguaje entrenado con corpus web puede reproducir sesgos de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en modelos base de este tamaño, especialmente en tareas de conocimiento factual.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y redistribución, pero se recomienda verificar los términos del modelo base openbmb/MiniCPM5-2B-Base, ya que la model card indica que "la licencia del modelo fuente aplica".
- Madurez del repositorio: con 5 descargas y 0 likes, es una publicación reciente y poco validada por la comunidad; no hay evidencia de pruebas de calidad publicadas.
- Ausencia de datos de despliegue: no se documentan requisitos exactos de VRAM, latencia ni compatibilidad con servidores de inferencia de alto rendimiento como vLLM o TGI.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/slop-shop/MiniCPM5-2B-Base-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- llama.cpp (herramientas de conversión y cuantización): https://github.com/ggml-org/llama.cpp
