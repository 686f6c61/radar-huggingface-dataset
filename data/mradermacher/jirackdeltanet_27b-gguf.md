# mradermacher/JiRackDeltaNet_27b-GGUF

## Resumen

JiRackDeltaNet_27b es un modelo de generación de texto de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) desarrollado por CMSManhattan (Center Business Solutions Inc) y publicado con licencia MIT. La versión aquí descrita es la cuantización GGUF estática realizada por mradermacher, que permite ejecutar el modelo en CPU y en entornos con memoria limitada. El modelo combina una arquitectura de tipo DeltaNet con pesos ternarios (etiquetados como "1.58-bit" y "ternary-transformer"), lo que lo sitúa en la línea de los modelos eficientes inspirados en BitNet.

El modelo está pensado para despliegues de bajo consumo de memoria, con soporte declarado para interfaces web, enrutamiento, tool calling y robótica, además de generación conversacional. Soporta 13 idiomas (inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés). Su relevancia actual radica en la combinación de un tamaño de 27B con cuantizaciones ternarias que reducen el peso del repositorio a 15,2 GB y los ficheros individuales a 7,1 GB (TQ1_0) y 8,3 GB (TQ2_0).

No se dispone de información publicada sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks en la documentación consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet (transformer con pesos ternarios, etiquetado "ternary-transformer"); tag de librería qwen3_5_text / qwen3.8 |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF TQ1_0 (7,1 GB) y TQ2_0 (8,3 GB); cuantización ternaria de pesos |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th (13 idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantización); el modelo base publica safetensors y GGUF |
| Tamano del repo | 15,2 GB |
| Descargas | 563 |
| Fecha de creacion | 2026-08-30 |
| Ultima actualizacion | 2026-11-07 |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se basa en una arquitectura DeltaNet, una variante de atención lineal recurrente, combinada con pesos ternarios (representación de 1,58 bits por peso). El etiquetado del modelo base incluye referencias a "qwen3_5_text" y "qwen3.8", lo que sugiere una tokenizador o componente de texto derivado de la familia Qwen 3.5/3.8, aunque no se detalla en la documentación consultada qué partes concretas provienen de esa familia.

No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención con ventana deslizante. La cuantización GGUF de mradermacher es estática y, según la model card, no se han generado cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y generación de código (implícito en el uso como modelo de texto, sin benchmarks publicados).
- Soporte de tool calling / function calling (etiqueta "tool-call").
- Capacidades orientadas a agentes y enrutamiento ("routing", "web-ui").
- Uso declarado en robótica ("robotics").
- Multilingüe en 13 idiomas, incluido español.
- Ejecución eficiente en CPU y entornos de baja memoria gracias a pesos ternarios y cuantización GGUF.
- Compatible con endpoints ("endpoints_compatible") y con Ollama ("ollama").

## Casos de uso

- **Despliegue en CPU sin GPU dedicada**: con las cuantizaciones TQ1_0 (7,1 GB) y TQ2_0 (8,3 GB), el modelo puede ejecutarse en servidores sin acelerador mediante llama.cpp u Ollama, cubriendo tareas de generación de texto donde el coste de GPU es prohibitivo.
- **Asistente conversacional multilingüe**: al soportar 13 idiomas, incluido el español, puede integrarse en chatbots de atención al cliente que requieran respuestas en varios idiomas sin desplegar modelos separados por lengua.
- **Enrutamiento de consultas en una interfaz web**: la etiqueta "routing" y "web-ui" sugiere su uso como clasificador/enrutador de peticiones dentro de un backend, decidiendo qué herramienta o servicio atiende cada consulta.
- **Automatización con tool calling**: puede conectarse a APIs externas mediante function calling para tareas como consulta de bases de datos, envío de correos o gestión de tickets, integrándose en pipelines de agentes.
- **Prototipado en robótica**: la etiqueta "robotics" indica su uso previsto en la generación de comandos o instrucciones de alto nivel para sistemas robóticos, aunque no se documentan integraciones concretas.
- **Investigación sobre modelos ternarios**: al ser una cuantización GGUF de un modelo con pesos ternarios, sirve para estudiar el equilibrio entre tamaño (7-8 GB) y calidad en entornos de investigación con recursos limitados.
- **Despliegue en local con Ollama**: el tag "ollama" y el formato GGUF permiten su uso en estaciones de trabajo para pruebas de concepto y desarrollo sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: TQ1_0 requiere aproximadamente 7,1 GB de memoria para los pesos; TQ2_0, unos 8,3 GB. A ello hay que sumar el espacio para el contexto KV, no cuantificado en la información disponible.
- **GPU recomendadas**: no se especifican en la documentación. Por tamaño, cabría en GPUs consumer con 12-16 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super) y en GPUs profesionales (A100, H100) para mayor throughput, aunque no hay datos de rendimiento publicados.
- **Cabe en GPU consumer**: sí, previsiblemente en modelos con 12 GB o más de VRAM usando TQ1_0; en 8 GB no cabría con holgura.
- **Opciones de despliegue**: llama.cpp, Ollama (etiqueta "ollama"), y cualquier runtime compatible con GGUF; también es compatible con endpoints según la model card.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables publicadas para este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoría. La información disponible no incluye modelos comparables con contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad frente a modelos de tamaño similar.
- La cuantización ternaria (TQ1_0/TQ2_0) puede degradar la calidad respecto a los pesos originales en safetensors; la model card no incluye comparativas de perplejidad para este modelo concreto.
- No se documenta la longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- No se detalla la composición del dataset de entrenamiento ni los procesos de alineación, por lo que el riesgo de sesgos y alucinaciones no está caracterizado.
- La licencia MIT permite uso comercial, pero el modelo base y sus pesos originales deben verificarse por separado en su repositorio.
- El número de descargas (563) y de likes (0) es muy bajo, lo que sugiere escasa validación por parte de la comunidad.
- No se han generado cuantizaciones imatrix/ponderadas para este modelo, según la model card, lo que limita las opciones de calidad frente a las cuantizaciones estáticas.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/JiRackDeltaNet_27b-GGUF
- Modelo base: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b
- Fichero GGUF del modelo base: https://huggingface.co/CMSManhattan/JiRackDeltaNet_27b/blob/main/JiRackDeltaNet_27b.gguf
- Página de descargas de mradermacher: https://hf.tst.eu/model#JiRackDeltaNet_27b-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
