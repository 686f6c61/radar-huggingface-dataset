# fwizzer1/fwizzer-v3-zh

## Resumen

Fwizzer v3 ZH es un modelo multimodal de razonamiento publicado por el usuario fwizzer1 en HuggingFace, distribuido principalmente en formato GGUF y orientado a entrada imagen-texto (pipeline `image-text-to-text`). Se presenta como un derivado afinado de LiquidAI/LFM2.5-VL-3B, la arquitectura híbrida de red neuronal líquida de Liquid AI, al que se le añade una torre de visión SigLIP2 de aproximadamente 400M de parámetros y un adaptador de visión propio (`fwizzervision.gguf`) de unos 800 MB.

El modelo se comercializa en la model card como "Flagship Chinese Multimodal Deep Reasoning Model v3" y su rasgo más distintivo es el razonamiento en cadena de pensamiento explícito dentro de etiquetas `<think> ... </think>`, siguiendo el patrón popularizado por DeepSeek-R1. Está pensado para tareas de OCR de alta precisión, parseo de maquetas, reconocimiento de planos, diagramas e interfaces de usuario, además de resolución analítica de problemas por pasos. Los idiomas declarados son chino (zh) e inglés (en).

La relevancia práctica es limitada y conviene ser prudente: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, el dataset de entrenamiento es privado y no se ha publicado ningún resultado de benchmarks. Existe además una discrepancia notable entre los datos: la model card afirma una columna vertebral de 2,69B de parámetros, mientras que los pesos en safetensors del repositorio suman 426.285.296 parámetros (unos 426M), coherente con el tamaño total del repo (0,9 GB). Esa inconsistencia debe tenerse en cuenta antes de evaluar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida de red neuronal líquida (Liquid Neural Network), derivada de LiquidAI/LFM2.5-VL-3B, con torre de visión SigLIP2 |
| Parametros totales | 426.285.296 según los pesos safetensors; la model card declara 2,69B en el backbone más 400M de la torre de visión (dato contradictorio) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 32.768 tokens según la model card; hasta 131k sobre el backbone LFM |
| Tipos de cuantizacion | Q8_0 (Max, ~3,4 GB), Q5_K_M (Balanced, ~2,5 GB), Q4_K_M (Speed, ~2,1 GB); adaptador de visión `fwizzervision.gguf` (~800 MB) |
| Idiomas soportados | zh, en |
| Licencia | other / lfm1.0 (licencia personalizada de Liquid AI) |
| Formato de pesos | GGUF (cuantizado para llama.cpp, LM Studio y Ollama); el repositorio incluye pesos en safetensors |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-VL-3B, una arquitectura híbrida de tipo "liquid neural network" que combina capas convolucionales y de atención en lugar de un transformer puramente atencional. Sobre esa base se incorpora una torre de visión SigLIP2, conectada mediante un proyector de visión propietario distribuido como archivo GGUF independiente (`fwizzervision.gguf`). El pipeline declarado es `image-text-to-text`, es decir, el modelo acepta imágenes y texto y devuelve texto.

El ajuste se realizó, según la model card, sobre un dataset privado de cadenas de pensamiento llamado `fwizzer1/fwizzer-v3-titan-agentic`, concretamente sobre el archivo `train_zh.parquet`, lo que explica que las capacidades documentadas y el prompt de sistema estén redactados en chino. El modelo genera razonamiento dentro de etiquetas `<think> ... </think>` de forma nativa, con `</think>` como token de parada alternativo. No hay información disponible sobre el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento. Tampoco se documentan innovaciones técnicas propias más allá del proyector de visión y del formato de razonamiento.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes junto con instrucciones textuales y produce respuestas razonadas paso a paso.
- Cadena de pensamiento explícita: el razonamiento se emite dentro de `<think> ... </think>`, lo que permite inspeccionar el proceso antes de la respuesta final.
- Visión y OCR de alta precisión: la model card menciona parseo de maquetas (layout parsing), reconocimiento de planos, diagramas e interfaces de usuario.
- Razonamiento algorítmico multi-paso: resolución analítica de problemas por descomposición y verificación de condiciones límite, según la descripción del autor.
- Capacidades multilingües limitadas a chino e inglés; no se declaran otros idiomas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no documentado, más allá del nombre del dataset de entrenamiento (`titan-agentic`).
- Modo de pensamiento separado o modos alternativos de inferencia: no disponible.

## Casos de uso

- Digitalización de documentos con OCR: el modelo puede extraer texto y estructura de facturas, formularios o contratos escaneados, aprovechando el parseo de maquetas y su torre SigLIP2 para preservar la disposición espacial del contenido.
- Interpretación de planos y diagramas técnicos: útil en entornos de ingeniería o arquitectura para describir componentes, detectar etiquetas y trasladar la información a texto estructurado.
- Análisis de capturas de interfaz (UI): revisión automatizada de pantallas de aplicación para generar descripciones, detectar elementos o documentar flujos de usuario en pruebas de regresión visual.
- Asistencia en razonamiento analítico sobre imágenes: tareas como resolver problemas de geometría a partir de una figura, donde la cadena de pensamiento en `<think>` permite auditar el razonamiento intermedio.
- Despliegue local en estaciones de trabajo sin GPU dedicada: gracias a las cuantizaciones Q4_K_M y Q5_K_M y al tamaño reducido del repositorio, puede ejecutarse íntegramente en CPU mediante llama.cpp u Ollama.
- Prototipado de asistentes multimodales en chino: con el prompt de sistema incluido en la model card, sirve como base para experimentos de conversación multimodal en ese idioma.
- Generación de descripciones accesibles de imágenes: producción de texto alternativo en chino o inglés para catálogos, material educativo o contenido web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye únicamente afirmaciones cualitativas del autor (por ejemplo, "99,9 % de precisión" para la cuantización Q8_0, sin especificar la métrica ni el conjunto de evaluación) y no aporta cifras de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro benchmark estándar. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo: los enlaces recuperados corresponden a hilos de Reddit sobre el emulador Android LDPlayer y no guardan relación con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB adicional sobre el tamaño del archivo GGUF, más unos 800 MB del proyector de visión. Con Q4_K_M (~2,1 GB) el total ronda los 3 GB; con Q5_K_M (~2,5 GB), unos 3,4 GB; con Q8_0 (~3,4 GB), unos 4,3 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM dedicada, como una RTX 3060, RTX 4060 o superior. Para lotes grandes o contexto de 32k tokens, una RTX 4090 o una A100/H100 aportan margen de sobra.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en tarjetas de gama media y también en configuraciones con memoria unificada (Apple Silicon).
- Ejecución en CPU: viable con llama.cpp, dado el tamaño reducido de los cuantos, aunque la latencia dependerá del hardware.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (todas mencionadas en las etiquetas del repositorio) y, en principio, cualquier runtime compatible con GGUF. No se documenta soporte para vLLM, TGI ni TensorRT-LLM.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fwizzer-v3-zh | 426M según safetensors; la model card declara 2,69B + 400M de visión | 32.768 tokens (hasta 131k sobre el backbone LFM) | Sí (SigLIP2 + proyector propio) | lfm1.0 | GGUF en HuggingFace |
| LiquidAI/LFM2.5-VL-3B (modelo base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Sí | licencia de Liquid AI | HuggingFace |
| Otros VLM de rango 2-4B (por ejemplo, alternativas de la misma categoria) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Sí | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos verificables para ninguno de los modelos de la tabla, por lo que no es posible establecer una comparación cuantitativa de capacidades.

## Limitaciones y advertencias

- Inconsistencia en los parámetros declarados: la model card indica 2,69B más 400M, mientras que los pesos safetensors suman 426M. Conviene verificar el modelo real antes de asumir su capacidad.
- Ausencia total de benchmarks: las afirmaciones de rendimiento de la model card no están respaldadas por métricas reproducibles ni por conjuntos de evaluación identificados.
- Dataset de entrenamiento privado: no es posible auditar la composición de los datos, lo que impide evaluar sesgos, contaminación de benchmarks o cobertura temática.
- Cobertura de idiomas restringida a chino e inglés; el rendimiento en castellano no está documentado y previsiblemente será limitado.
- Riesgo de alucinación: no se documentan medidas de mitigación, y los modelos con cadena de pensamiento explícita pueden generar razonamientos plausibles pero incorrectos.
- Licencia `lfm1.0`: se trata de una licencia personalizada de Liquid AI, no de una licencia de código abierto estándar. La model card no detalla las condiciones de uso comercial, por lo que es imprescindible revisar el texto completo de la licencia antes de cualquier despliegue en producción.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni soporte documentado.
- Herramienta de nicho con dependencia de LM Studio para el flujo de instalación descrito; el proyector de visión debe descargarse por separado y colocarse en la ruta correcta.
- No se documenta soporte de tool calling ni de flujos agentivos, lo que limita su integración en pipelines automatizados complejos.
- No hay garantías de mantenimiento ni de versionado por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fwizzer1/fwizzer-v3-zh
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/fwizzer1/fwizzer-v3-titan-agentic

Nota: las búsquedas web realizadas no devolvieron enlaces relevantes sobre este modelo. Los resultados obtenidos correspondían a hilos de Reddit sobre el emulador Android LDPlayer y no se incluyen por no ser pertinentes.
