# mradermacher/Azazel-24B-i1-GGUF

## Resumen

Azazel-24B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo Azazel-24B, publicado por el usuario c4tdr0ut y cuantizado por mradermacher. El modelo original cuenta con 23.572.403.200 parámetros (aproximadamente 23,6 mil millones) y está orientado a uso conversacional en inglés. Esta versión GGUF está pensada para inferencia local eficiente mediante llama.cpp y herramientas compatibles, con cuantizaciones generadas a partir de una matriz de importancia (imatrix) para preservar mejor la calidad en los niveles de compresión bajos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~24B en hardware de consumo, algo inviable con los pesos en precisión completa. Sin embargo, la información pública es muy escasa: no se detallan la arquitectura interna del modelo base, los datos de entrenamiento, la licencia ni los resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un modelo de nicho o reciente.

Esta ficha documenta exclusivamente lo que puede verificarse a partir de los metadatos y la model card disponibles, indicando explícitamente "no disponible" en todos aquellos aspectos que el autor no ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base c4tdr0ut/Azazel-24B; presumiblemente transformer, sin confirmar) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q2_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); pesos originales del modelo base presumiblemente en safetensors |
| Tamano del repo | 8,9 GB |
| Modelo base | c4tdr0ut/Azazel-24B |
| Cuantizador | mradermacher (cuantizaciones ponderadas con imatrix) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Azazel-24B (c4tdr0ut/Azazel-24B). Los metadatos indican la etiqueta `transformers` y un recuento de parámetros de 23.572.403.200, pero no se especifica si se trata de un transformer denso, un modelo MoE, híbrido o de otra familia. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

Respecto a las cuantizaciones, mradermacher ha generado las versiones i1 (imatrix) a partir de una matriz de importancia calculada sobre el modelo base, lo que permite conservar mejor la perplejidad en niveles de compresión agresivos (IQ1, IQ2, IQ3). El repositorio incluye además el fichero imatrix (`Azazel-24B.imatrix.gguf`, 0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Se ofrecen también cuantizaciones estáticas en un repositorio separado (mradermacher/Azazel-24B-GGUF). No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Compatible con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia estándar.
- Formato GGUF apto para llama.cpp y ecosistemas derivados (Ollama, LM Studio, KoboldCpp, etc.).
- Capacidades de razonamiento, código, matemáticas, tool calling, agentes o visión: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Inferencia local en estaciones de trabajo: gracias a las cuantizaciones Q4_K_M y Q5_K_M, un modelo de ~23,6 B puede ejecutarse en GPU de consumo con 16-24 GB de VRAM, útil para prototipado sin conexión.
- Despliegue en servidores sin GPU de datacenter: las cuantizaciones IQ3/IQ4 permiten servir el modelo en CPU o GPU modestas mediante llama.cpp, reduciendo costes frente a alternativas en la nube.
- Experimentación con cuantización: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar la degradación de perplejidad entre niveles.
- Chat conversacional en inglés: la etiqueta `conversational` sugiere uso en asistentes de texto; conviene validar la calidad real antes de producción dado que no hay benchmarks.
- Integración en pipelines de inferencia compatibles con OpenAI: el tag `endpoints_compatible` facilita conectar el modelo a servidores tipo vLLM/llama.cpp con API compatible.
- Evaluación comparativa de cuantizaciones: útil para estudios que midan el impacto de IQ1-IQ6 sobre un modelo de ~24B en tareas de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño de parámetros y cuantización):
  - Q2_K / IQ2: ~8-10 GB.
  - Q3_K_M / IQ3_M: ~11-13 GB.
  - Q4_K_M / IQ4_XS: ~14-16 GB.
  - Q5_K_M: ~17-19 GB.
  - Q6_K: ~20-22 GB.
  - Pesos en FP16 (referencia, no incluidos en este repo): ~47 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4-Q5; RTX 4080/3090 (16-24 GB) para Q3-Q4; A100/H100 para FP16 o servir múltiples usuarios.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; Q6_K requiere 24 GB y deja poco margen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui y servidores compatibles con GGUF.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de tamaño similar.

## Limitaciones y advertencias

- Licencia no especificada: no puede confirmarse el uso comercial; es imprescindible contactar con el autor del modelo base (c4tdr0ut) antes de un despliegue en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas es desconocido.
- Sin benchmarks: no hay evidencia publicada de calidad en razonamiento, código o matemáticas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de alineación no puede evaluarse su magnitud.
- Sesgos: no documentados por el autor.
- Longitud de contexto desconocida: limita la planificación de aplicaciones con documentos largos.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación mínimo; conviene tratar el modelo como experimental.
- Las cuantizaciones IQ1/IQ2 pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Azazel-24B-i1-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Azazel-24B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Azazel-24B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Azazel-24B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
