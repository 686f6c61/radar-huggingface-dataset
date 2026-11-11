# mradermacher/Qwen3.5-9B-Wolof-Instruct-v1-GGUF

## Resumen

Qwen3.5-9B-Wolof-Instruct-v1-GGUF es la versión cuantizada en formato GGUF del modelo mamelles/Qwen3.5-9B-Wolof-Instruct-v1, un ajuste fino de la familia Qwen3.5 orientado específicamente al idioma wolof (`wo`). El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF de la comunidad, y el modelo base procede del usuario mamelles con el tag `galsenai`, lo que sugiere una iniciativa centrada en el procesamiento del lenguaje natural para Senegal y el wolof.

El modelo cuenta con 8.984.596.992 parámetros totales (aproximadamente 9B) según los pesos en safetensors del modelo base, y se distribuye como un conjunto de cuantizaciones estáticas que van desde Q2_K (3,9 GB) hasta f16 (18,1 GB), pasando por las recomendadas Q4_K_S y Q4_K_M. Su propósito es hacer viable la inferencia local de un modelo conversacional especializado en wolof en hardware de consumo, algo que la versión original en precisión completa dificultaría.

La relevancia de esta ficha radica en que cubre un nicho poco atendido: los modelos de código abierto con competencia real en lenguas africanas de bajos recursos. No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es fundamentalmente mecánica (lista de cuantizaciones y notas de uso) y no documenta arquitectura, contexto, datos de entrenamiento ni benchmarks. Todo lo que sigue distingue explícitamente entre datos verificados y datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (familia Qwen3.5; el repositorio no detalla la arquitectura interna) |
| Parámetros totales | 8.984.596.992 (~9B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Wolof (`wo`) |
| Licencia | No disponible |
| Formato de pesos | GGUF (versión cuantizada); el modelo base se distribuye presumiblemente en safetensors |
| Tamaño del repositorio | 81,7 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base. Por el nombre (`Qwen3.5-9B`) se infiere que deriva de la familia Qwen3.5 de Alibaba, pero el repositorio no confirma si se trata de un transformer denso convencional, un modelo híbrido o una variante MoE; tampoco se documentan la longitud de contexto nativa, el esquema de atención ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, modo thinking, etc.).

Respecto al entrenamiento, la model card no aporta el número de tokens utilizados, la composición del corpus, ni si hubo fases de RLHF, DPO o ajuste por instrucciones supervisado. El sufijo `Instruct` y el tag `conversational` indican que el modelo fue ajustado para seguir instrucciones y mantener diálogos, pero no se detalla la metodología. La única información verificable sobre el proceso es la relativa a la cuantización: mradermacher indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y que en el momento de la publicación no había cuantizaciones ponderadas con imatrix disponibles.

## Capacidades

- Generación de texto conversacional en wolof, orientada a instrucciones (el nombre y los tags lo indican).
- Conversación multi-turno: el tag `conversational` y la naturaleza `Instruct` del modelo base apuntan a este uso, aunque no se documenta el formato de prompt ni la ventana de contexto efectiva.
- Capacidad multilingüe limitada: el repositorio declara únicamente el idioma `wo`; no hay evidencia de competencia declarada en otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estándar compatible con GGUF, pero no se detallan integraciones concretas.

## Casos de uso

- Atención al cliente en wolof: el modelo puede gestionar conversaciones multi-turno en wolof para organizaciones que atienden a hablantes de esta lengua (operadores telefónicos, servicios públicos, banca). Es adecuado porque es uno de los pocos modelos abiertos con ajuste explícito a este idioma, y las cuantizaciones Q4 permiten desplegarlo en servidores modestos.
- Traducción y localización de contenidos: traducción de documentación, interfaces o material educativo del wolof a otros idiomas y viceversa, usando el modelo como motor de traducción asistida con revisión humana. La limitación es que solo se declara wolof como idioma soportado, por lo que la calidad en la otra dirección debe validarse empíricamente.
- Generación de contenido educativo y divulgativo: redacción de textos, resúmenes y materiales en wolof para escuelas, ONG o medios locales, aprovechando la naturaleza instructiva del modelo.
- Investigación en PLN para lenguas de bajos recursos: servir como punto de partida para experimentos de evaluación, ajuste adicional o destilación en wolof, dado que el formato GGUF facilita la experimentación en hardware asequible.
- Despliegue en local para privacidad de datos: al caber en una GPU de consumo en cuantización Q4 (5,5-5,8 GB), puede ejecutarse en estaciones de trabajo sin enviar datos a la nube, útil para organizaciones con requisitos de confidencialidad.
- Prototipado rápido de asistentes de voz o chat: integración con pipelines de llama.cpp u Ollama para validar productos conversacionales en wolof antes de invertir en infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el conjunto de 12 cuantizaciones permite medir el impacto de la compresión en la calidad de generación en wolof, un caso de estudio útil para equipos que despliegan modelos en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de wolof, y tampoco se proporcionan comparaciones con el modelo base en precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~3,9 GB de pesos; ~5-6 GB de VRAM en total con contexto moderado.
  - Q4_K_S / Q4_K_M: ~5,5-5,8 GB de pesos; ~7-8 GB de VRAM en total.
  - Q6_K: ~7,5 GB de pesos; ~9-10 GB de VRAM en total.
  - Q8_0: ~9,7 GB de pesos; ~11-12 GB de VRAM en total.
  - f16: ~18,1 GB de pesos; ~20 GB de VRAM en total.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q4-Q8; RTX 4090 (24 GB) para f16 o Q8 con contexto amplio; A100/H100 solo necesarias para despliegues de alta concurrencia o contextos muy largos.
- Cabe en GPU de consumo: sí, en Q4_K_S/Q4_K_M con 8 GB de VRAM o más; en Q2_K incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere también servidores de inferencia compatibles con endpoints. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas declarados | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-Wolof-Instruct-v1 (este, GGUF) | ~9B | No disponible | Wolof | No disponible | GGUF |
| Qwen3.5-9B-Wolof-Instruct-v1 (base) | ~9B | No disponible | Wolof | No disponible | Safetensors (presumible) |
| Qwen3.5-9B (genérico) | ~9B | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos abiertos comparables especializados en wolof en la documentación consultada, ni de datos de rendimiento que permitan una comparación cuantitativa. La comparativa se limita, por tanto, al propio modelo base y a la familia genérica de la que deriva.

## Limitaciones y advertencias

- Información pública insuficiente: la model card no documenta arquitectura, contexto, datos de entrenamiento, licencia ni benchmarks, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.
- Licencia no especificada: al no indicarse la licencia, no puede confirmarse el uso comercial. Es imprescindible consultar el repositorio del modelo base (mamelles/Qwen3.5-9B-Wolof-Instruct-v1) antes de cualquier despliegue productivo.
- Cobertura lingüística restringida: solo se declara wolof; el rendimiento en otros idiomas no está documentado y probablemente sea limitado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, agravado por la escasez de datos de entrenamiento típica en lenguas de bajos recursos; se recomienda validación humana en usos sensibles.
- Sesgos: no documentados; los corpus en wolof disponibles suelen estar sesgados hacia ciertas variedades y registros, pero no hay evidencia publicada para este modelo concreto.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M se marcan explícitamente como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Sin cuantizaciones imatrix: el autor indica que no hay versiones ponderadas por importancia, que suelen ofrecer mejor relación calidad/tamaño.
- Contexto desconocido: sin datos sobre la ventana de contexto, no puede garantizarse el rendimiento en conversaciones largas o documentos extensos.
- Fecha de creación futura en los metadatos (2026-11-11): conviene verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Wolof-Instruct-v1-GGUF
- Modelo base: https://huggingface.co/mamelles/Qwen3.5-9B-Wolof-Instruct-v1
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Wolof-Instruct-v1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
