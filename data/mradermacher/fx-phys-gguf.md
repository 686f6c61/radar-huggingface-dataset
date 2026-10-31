# mradermacher/Fx-Phys-GGUF

## Resumen

Fx-Phys-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo endless-frontier/Fx-Phys, publicada por el cuantizador mradermacher. El modelo base es un LLM multimodal de 35,5 mil millones de parámetros basado en la arquitectura qwen3.6 con mezcla de expertos (MoE), especializado en razonamiento científico, con foco en física, finanzas y uso de herramientas. La versión GGUF permite ejecutarlo localmente en hardware de consumo mediante llama.cpp, Ollama y otras herramientas compatibles, con cuantizaciones que van desde Q2_K (13,3 GB) hasta Q8_0 (37,9 GB).

La relevancia de esta ficha radica en que el modelo base combina capacidades multimodales (incluye archivos mmproj para la parte de visión) con un enfoque vertical en razonamiento científico, un nicho poco cubierto por modelos abiertos de este tamaño. Al ser una cuantización de terceros, la ficha del repositorio original es escasa en detalles técnicos, por lo que varios datos (contexto, datos de entrenamiento, benchmarks) no están disponibles públicamente en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (base qwen3.6), multimodal |
| Parámetros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, endless-frontier/Fx-Phys, se construye sobre la arquitectura qwen3.6 como un transformer con mezcla de expertos (MoE) y capacidades multimodales, lo que explica la presencia de archivos mmproj (proyector multimodal) en las cuantizaciones. El número de parámetros activos por token no está disponible, aunque el tamaño total de 35,5 B y la etiqueta MoE sugieren que solo una fracción de expertos se activa en cada pasada. No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO.

Esta versión de mradermacher no altera la arquitectura: aplica cuantizaciones estáticas de k-quants (y un IQ4_XS) sobre los pesos originales, además de cuantizar el proyector multimodal en Q8_0 y f16. Existe también una variante con imatrix (matriz de importancia ponderada) en mradermacher/Fx-Phys-i1-GGUF, que suele ofrecer mejor calidad a igual tamaño de archivo.

## Capacidades

- Razonamiento científico especializado, con etiquetas específicas de física y finanzas
- Capacidades multimodales: incluye proyector de visión (mmproj) para procesar imágenes junto con texto
- Tool use / function calling (etiqueta tool-use en la model card)
- Generación de texto conversacional (etiqueta conversational)
- Compatibilidad con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, etc.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque la etiqueta de razonamiento científico sugiere uso en cadenas de razonamiento largas
- Capacidades multilingües: no disponible; la model card solo declara inglés

## Casos de uso

- Resolución de problemas de física a nivel investigador: el modelo está etiquetado específicamente para physics y scientific-reasoning, por lo que puede asistir en derivaciones, planteamiento de ecuaciones y verificación de razonamientos cuantitativos
- Análisis cuantitativo en finanzas: la etiqueta finance indica utilidad en modelado financiero, interpretación de escenarios y razonamiento sobre datos numéricos
- Interpretación de figuras y gráficos científicos: gracias al mmproj multimodal, puede leer gráficas, diagramas y documentos escaneados dentro de papers
- Asistente con herramientas: la etiqueta tool-use permite integrarlo en agentes que llaman a calculadoras, simuladores o APIs externas durante el razonamiento
- Inferencia local en hardware de consumo: con la cuantización Q4_K_M (21,8 GB) cabe en una GPU de 24 GB, útil para entornos sin acceso a nube o con requisitos de privacidad
- Prototipado de pipelines científicos: el formato GGUF facilita pruebas rápidas con llama.cpp u Ollama antes de escalar a despliegues con vLLM sobre el modelo base
- Generación de texto técnico en inglés: redacción de secciones de papers, informes técnicos y explicaciones de resultados experimentales

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del LLM):
  - Q2_K: ~13,3 GB
  - Q3_K_M: ~17,3 GB
  - IQ4_XS: ~19,5 GB
  - Q4_K_M: ~21,8 GB
  - Q5_K_M: ~25,4 GB
  - Q6_K: ~29,3 GB
  - Q8_0: ~37,9 GB
  - Añadir ~0,7-1 GB si se usa el proyector multimodal (mmproj)
- GPU recomendadas:
  - Q4_K_M / IQ4_XS: RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) ejecutan las cuantizaciones de 4 bits completas en GPU
  - Q6_K y superiores: A100 40 GB, A100 80 GB, H100, o doble GPU de consumo (2x RTX 3090)
  - Con offload parcial a CPU (llama.cpp), es viable en máquinas con 32 GB de RAM y GPU de 12-16 GB, con pérdida de velocidad
- Consumer GPU: sí, las cuantizaciones Q2_K a Q4_K_M caben en GPUs de 24 GB; las de 16 GB requieren offload a CPU o RAM
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF; para el modelo base sin cuantizar, vLLM o TGI con safetensors
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Fx-Phys (endless-frontier) | 35,5 B | MoE (qwen3.6) | no disponible | Sí (mmproj) | Apache 2.0 |
| Qwen3-30B-A3B | 30,5 B (3,3 B activos) | MoE | 128 K | No | Apache 2.0 |
| Qwen3-32B | 32,5 B | Dense | 128 K | No | Apache 2.0 |
| GLM-4.5-Air | 106 B (~12 B activos) | MoE | 128 K | No | MIT |

Nota: Fx-Phys se diferencia de alternativas de tamaño similar por su especialización en razonamiento científico y su naturaleza multimodal, aunque carece de datos públicos de contexto y benchmarks para una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un modelo especializado en física y finanzas, puede mostrar sesgos hacia el dominio científico en anglosajón y rendir peor fuera de él
- Riesgo de alucinación: elevado en tareas de razonamiento cuantitativo si no se verifica; se recomienda contrastar derivaciones y cálculos con herramientas externas (la etiqueta tool-use facilita este enfoque)
- Limitaciones de idioma: la model card solo declara inglés; el rendimiento en castellano no está documentado y probablemente sea inferior
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y los términos del modelo base endless-frontier/Fx-Phys
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la calidad, especialmente en razonamiento matemático y científico; para tareas exigentes se recomiendan Q4_K_M o superiores, o la variante imatrix (Fx-Phys-i1-GGUF)
- Soporte multimodal en GGUF: el mmproj requiere runtimes actualizados (llama.cpp reciente); no todos los frontales soportan la parte de visión
- Datos técnicos incompletos: longitud de contexto, parámetros activos y benchmarks no están publicados, lo que dificulta la evaluación previa a producción

## Enlaces

- Repositorio GGUF (cuantizaciones estáticas): https://huggingface.co/mradermacher/Fx-Phys-GGUF
- Modelo base: https://huggingface.co/endless-frontier/Fx-Phys
- Cuantizaciones imatrix (ponderadas): https://huggingface.co/mradermacher/Fx-Phys-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#Fx-Phys-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
