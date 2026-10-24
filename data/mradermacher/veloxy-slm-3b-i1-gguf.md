# mradermacher/Veloxy-SLM-3B-i1-GGUF

## Resumen

Veloxy-SLM-3B-i1-GGUF es un conjunto de cuantizaciones GGUF del modelo zveloxy/Veloxy-SLM-3B, un modelo de lenguaje causal de 3.085.938.688 parámetros (≈3,09 B) etiquetado como SLM (small language model) y especializado en turco e inglés. El trabajo de cuantización lo firma mradermacher, que publica variantes con calibración imatrix (prefijo `i1-`) en 24 tipos de cuantización distintos, desde IQ1_S hasta Q6_K. El modelo original no lo desarrolla mradermacher: este repositorio es una redistribución optimizada para inferencia local del modelo de zveloxy.

El interés práctico del repositorio es que reduce un modelo de 3 B a ficheros de entre 0,9 GB y 2,6 GB, lo que permite ejecutarlo en CPU, en GPUs de consumo con poca VRAM e incluso en dispositivos de un solo placa. Al estar bajo licencia Apache 2.0, es apto para uso comercial sin las restricciones habituales de otros modelos pequeños. La model card del cuantizador no aporta, sin embargo, datos sobre arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, por lo que buena parte de las especificaciones figuran aquí como no disponibles.

Conviene señalar que las etiquetas del repositorio incluyen `lora`, `causal-lm` y `conversational`, lo que sugiere un ajuste fino conversacional sobre una base de tipo decoder-only, pero no se especifica la familia arquitectónica ni el proceso de alineación. La información disponible tampoco confirma capacidades de tool calling, agentes o visión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetado como `causal-lm`; se desconoce la familia arquitectónica concreta) |
| Parámetros totales | 3.085.938.688 (≈3,09 B), dato de safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF con calibración imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors/transformers |

Datos adicionales: tamaño total del repositorio 36,8 GB (suma de todos los ficheros GGUF más el fichero imatrix de 0,1 GB). Fecha de creación del repositorio: 23 de octubre de 2026.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Las etiquetas del repositorio (`causal-lm`, `text-generation`, `transformers`) apuntan a un transformer decoder-only de 3,09 B de parámetros, y la etiqueta `lora` sugiere que el ajuste se realizó mediante adaptadores LoRA sobre una base previa, pero ni la model card del cuantizador ni los metadatos proporcionados confirman esta hipótesis ni detallan la base utilizada.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del corpus, idioma mayoritario del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF, DPO o SFT. El proceso de cuantización sí está documentado: mradermacher emplea cuantización con matriz de importancia (imatrix) generada a partir de un corpus de calibración, lo que en la práctica mejora la perplejidad de los cuantizados de baja precisión frente a los estáticos. El repositorio incluye el fichero `Veloxy-SLM-3B.imatrix.gguf` (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. Existe además una colección de cuantizados estáticos en mradermacher/Veloxy-SLM-3B-GGUF.

## Capacidades

- Generación de texto causal y conversacional en turco e inglés, según la etiqueta `conversational` del repositorio.
- Instrucciones de formato libre en los dos idiomas declarados; no hay evidencia publicada del rendimiento relativo entre ambos.
- Ejecución en local mediante llama.cpp y derivados, al distribuirse únicamente en formato GGUF.
- Posible ajuste fino adicional: la etiqueta `lora` del modelo base sugiere compatibilidad con flujos de adaptación, aunque el repositorio GGUF no incluye adaptadores.
- No hay información que confirme soporte de tool calling, function calling, modo thinking, razonamiento multi-paso, visión, audio ni matemáticas avanzadas.
- No hay información sobre ventana de contexto efectiva, por lo que no se puede confirmar el manejo de conversaciones largas.

## Casos de uso

- **Atención al cliente en turco**: despliegue de un chatbot de primer nivel en una máquina sin GPU dedicada, usando el cuantizado Q4_K_M (2,0 GB) sobre llama.cpp. Adecuado por tamaño reducido y licencia Apache 2.0, aunque la longitud de contexto no está documentada y conviene validarla antes de diseñar flujos multi-turno largos.
- **Asistente conversacional offline en escritorio**: integración en una aplicación de escritorio o plugin de IDE que funcione sin conexión, cargando el fichero IQ4_XS (1,8 GB) en RAM. El modelo entero cabe en 8 GB de RAM sin problema.
- **Procesamiento por lotes en CPU**: generación de descripciones, resúmenes cortos o respuestas plantilla sobre grandes volúmenes de texto en turco, ejecutando llama.cpp en servidores sin acelerador. El coste por token en CPU es viable para un modelo de 3 B en cuantización Q4.
- **Prototipado rápido de producto**: validar una idea de funcionalidad conversacional con un modelo de 3 B antes de invertir en un modelo mayor, dado que el repositorio ofrece 24 tamaños distintos y permite calibrar el compromiso calidad/latencia sin cambiar de código.
- **Generación de datos sintéticos en turco**: creación de pares pregunta-respuesta o corpus de aumento de datos para entrenar clasificadores o ajustar modelos menores, usando el cuantizado Q6_K (2,6 GB) para maximizar fidelidad respecto al modelo original.
- **Sistemas embebidos y edge computing**: despliegue en dispositivos con 2-4 GB de memoria libre (Raspberry Pi 5, mini-PC, routers con contenedores) empleando IQ2_M o Q2_K (1,2-1,4 GB), asumiendo la pérdida de calidad asociada a esas cuantizaciones.
- **Traducción asistida turco-inglés en borrador**: pre-traducción de documentación interna para revisión humana posterior, aprovechando el soporte bilingüe declarado; requiere evaluación previa porque no hay benchmarks públicos de calidad de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de evaluación, y tampoco se aportan datos de perplejidad comparativos entre las distintas cuantizaciones. La única referencia gráfica es el enlace externo a la comparativa de perplejidad entre tipos de cuantización de ikawrakow, que no es específica de este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia** (modelo + caché KV + overhead, estimación a partir del tamaño de fichero):
  - IQ1_S (0,9 GB): ~1,3-1,8 GB
  - IQ2_M (1,2 GB): ~1,6-2,2 GB
  - Q3_K_M / IQ3_M (1,6-1,7 GB): ~2,1-2,8 GB
  - Q4_K_M (2,0 GB): ~2,5-3,5 GB
  - Q5_K_M (2,3 GB): ~2,9-4,0 GB
  - Q6_K (2,6 GB): ~3,2-4,5 GB
- **GPU recomendadas**: cualquier GPU de consumo con 4 GB o más sirve para Q4_K_M o Q5_K_M (GTX 1650 4 GB, RTX 3050 6 GB, RTX 4060 8 GB, RTX 4090 24 GB). Para IQ2 e IQ3 basta con 2-3 GB, por lo que también funcionan iGPUs con memoria compartida. En A100/H100 el modelo está sobredimensionado para el hardware: se desplegaría por consolidación de servicios, no por necesidad de cómputo.
- **¿Cabe en GPU de consumo?**: sí, en todas las cuantizaciones, incluidas las de mayor tamaño. Q6_K entra en cualquier GPU con 6 GB o más.
- **Opciones de despliegue**: llama.cpp (CLI y servidor), Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui. vLLM y TGI tienen soporte de GGUF experimental y no está garantizado para este modelo concreto. El repositorio está marcado como `endpoints_compatible`.
- **Latencia y throughput**: no disponibles. Como referencia de orden de magnitud para un modelo denso de 3 B en Q4_K_M, es esperable en el rango de decenas de tokens por segundo en GPU de consumo media y de un dígito a baja decena en CPU moderna, pero son estimaciones genéricas no verificadas para este modelo.
- **Almacenamiento**: el repositorio completo ocupa 36,8 GB; descargar un solo cuantizado requiere entre 0,9 y 2,6 GB.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparativa se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos provienen de sus especificaciones públicas.

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Idiomas destacados |
|---|---|---|---|---|---|
| Veloxy-SLM-3B (i1-GGUF) | 3,09 B | No disponible | Apache 2.0 | GGUF (24 cuantizaciones) y safetensors | tr, en |
| Llama 3.2 3B Instruct | 3,21 B | 128 K | Licencia comunitaria Llama 3.2 | Safetensors, GGUF (comunidad) | Multilingüe (8 idiomas oficiales) |
| Qwen2.5 3B Instruct | 3,09 B | 32 K nativo (mayor con RoPE scaling) | Apache 2.0 | Safetensors, GGUF, AWQ, GPTQ | 29 idiomas, incluido inglés; turco no destacado |
| Gemma 2 2B IT | 2,61 B | 8 K | Licencia Gemma | Safetensors, GGUF (comunidad) | Multilingüe |

Diferencias relevantes: Veloxy-SLM-3B es el único de la comparativa que declara turco como idioma principal, lo que lo hace preferible a priori para tareas en ese idioma frente a Qwen2.5 3B o Gemma 2 2B, que no lo priorizan. A cambio, su contexto es desconocido y probablemente inferior al de Llama 3.2 3B, y carece de benchmarks que permitan comparar calidad. En licencia, empata con Qwen2.5 3B en Apache 2.0, la opción más permisiva para uso comercial.

## Limitaciones y advertencias

- **Ausencia total de benchmarks**: no se ha publicado ninguna evaluación de calidad, sesgo o robustez. Cualquier decisión de producción debe ir precedida de una evaluación propia sobre el caso de uso concreto.
- **Contexto desconocido**: no se documenta la ventana de contexto, lo que impide diseñar flujos multi-turno o de documentos largos con garantías.
- **Riesgo de alucinación**: inherente a un modelo de 3 B sin datos de alineación publicados; la model card no menciona RLHF ni DPO, por lo que la fiabilidad factual es incierta.
- **Cobertura lingüística limitada**: solo turco e inglés. El rendimiento en castellano no está declarado y previsiblemente será pobre; no usar para producción en español sin evaluarlo.
- **Cuantizaciones de muy baja precisión**: las variantes IQ1 e IQ2 degradan la calidad de forma notable. La propia model card califica IQ1_S como "for the desperate" y Q2_K_S como "very low quality"; para uso real conviene Q4_K_M o superior.
- **Modelo derivado, no original**: este repositorio es una cuantización de terceros. Cualquier corrección, actualización o soporte depende de zveloxy/Veloxy-SLM-3B, no de mradermacher.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas en los metadatos del cuantizador.
- **Madurez del repositorio**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación comunitaria.
- **Soporte de servidores de inferencia**: al ser GGUF, no se beneficia de optimizaciones de vLLM o TGI para transformers, con el consiguiente menor throughput en despliegues de alta concurrencia.

## Enlaces

- Repositorio HuggingFace (cuantizaciones imatrix): https://huggingface.co/mradermacher/Veloxy-SLM-3B-i1-GGUF
- Modelo base original: https://huggingface.co/zveloxy/Veloxy-SLM-3B
- Cuantizaciones estáticas del mismo autor: https://huggingface.co/mradermacher/Veloxy-SLM-3B-GGUF
- Página de descarga consolidada del cuantizador: https://hf.tst.eu/model#Veloxy-SLM-3B-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Veloxy-SLM-3B-i1-GGUF/resolve/main/Veloxy-SLM-3B.imatrix.gguf
- Guía de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/
