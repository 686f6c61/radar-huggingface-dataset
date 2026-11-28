# mradermacher/WorldReward-qwen38-27b-GGUF

## Resumen

WorldReward-qwen38-27b-GGUF es la versión cuantizada en formato GGUF del modelo WorldReward-qwen38-27b, desarrollado originalmente por CodeGoat24 y convertido por mradermacher. Se trata de un modelo de recompensa (reward model) y modelo de mundo (world model) orientado a la generación de vídeo y al control de cámara, según los tags declarados en su model card. Con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), se posiciona en la franja de modelos densos de gran tamaño aptos para inferencia local mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de consumo mediante cuantización, algo impensable en precisión completa (el repositorio completo ocupa 187,9 GB). El autor de la cuantización, mradermacher, es un actor conocido en el ecosistema GGUF y ofrece un abanico amplio de cuantizaciones estáticas, desde Q2_K hasta Q8_0, además de los suplementos multimodales mmproj.

No obstante, la información pública disponible es muy limitada: la model card original no detalla arquitectura, datos de entrenamiento, benchmarks ni longitud de contexto. Esta ficha refleja exclusivamente lo verificable y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen, sin confirmar) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base CodeGoat24/WorldReward-qwen38-27b en la documentación proporcionada. El nombre del checkpoint sugiere una base de la familia Qwen con 27B de parámetros, pero no se confirma en la model card. Tampoco consta el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras.

Lo que sí se deduce de los tags es su propósito: reward-model, world-model, video-generation y camera-control. Esto indica que el modelo está diseñado para puntuar o evaluar trayectorias generadas (por ejemplo, en pipelines de generación de vídeo) y potencialmente para modelar dinámicas de escena y control de cámara. La cuantización de mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), e incluye archivos mmproj separados, lo que confirma que el modelo base tiene componentes multimodales (probablemente visión) que se conservan en precisión Q8_0 o f16.

## Capacidades

- Evaluación de recompensa: el modelo está etiquetado como reward-model, por lo que se espera que puntúe respuestas o trayectorias según un criterio aprendido.
- Modelado de mundo: tag world-model, orientado a representar dinámicas de escena.
- Generación de vídeo: tag video-generation, probablemente como evaluador o componente de un pipeline.
- Control de cámara: tag camera-control, posiblemente para condicionar o evaluar movimientos de cámara en vídeo generado.
- Multimodalidad: la presencia de archivos mmproj confirma soporte de entrada visual además de texto.
- Conversacional: el tag conversational indica uso en formato de diálogo.
- Compatibilidad con endpoints: tag endpoints_compatible.
- Idiomas: únicamente inglés declarado.
- Tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de pipelines de generación de vídeo: usar el modelo como reward model para puntuar clips generados y filtrar o reordenar candidatos antes de la entrega final, aprovechando su etiqueta video-generation.
- Control de cámara en producción audiovisual: evaluar trayectorias de cámara sintéticas y seleccionar las que mejor se ajustan a una instrucción, gracias al tag camera-control.
- Investigación en world models: emplear el modelo como componente de evaluación en entornos simulados donde se necesita medir la coherencia física o dinámica de secuencias generadas.
- RLHF y fine-tuning con recompensas: integrar el modelo como reward model en pipelines de aprendizaje por refuerzo para alinear generadores de vídeo o de texto.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,6 GB) o Q5_K_M (19,3 GB) puede ejecutarse en GPUs de consumo de gama alta, útil para prototipado sin depender de la nube.
- Filtrado de datasets multimodales: puntuar pares vídeo-texto para construir corpus de entrenamiento de mayor calidad.
- Evaluación automatizada en CI: integrar el modelo en pipelines que verifiquen la calidad de salidas generadas antes de publicar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 10,8 GB.
  - Q3_K_S: aproximadamente 12,2 GB.
  - Q3_K_M: aproximadamente 13,4 GB.
  - Q3_K_L: aproximadamente 14,4 GB.
  - IQ4_XS: aproximadamente 15,3 GB.
  - Q4_K_S: aproximadamente 15,7 GB.
  - Q4_K_M: aproximadamente 16,6 GB.
  - Q5_K_S: aproximadamente 18,8 GB.
  - Q5_K_M: aproximadamente 19,3 GB.
  - Q6_K: aproximadamente 22,2 GB.
  - Q8_0: aproximadamente 28,7 GB.
  - Añadir 0,7 GB (mmproj Q8_0) o 1,0 GB (mmproj f16) si se usa la parte multimodal.
- GPU recomendadas: para Q8_0 o Q6_K, GPUs de 32 GB o más (A100 40 GB, H100, RTX 5090). Para Q4_K_M y Q5_K_M, GPUs de 24 GB (RTX 3090, RTX 4090) con margen ajustado. Para Q3_K_M o inferiores, GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantizaciones Q4 y Q5; en GPUs de 16 GB con Q3 o Q2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para este repositorio, ya que distribuye pesos GGUF y no safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de reward model o world model de 27B en la documentación proporcionada. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WorldReward-qwen38-27b-GGUF | 26,9B | no disponible | apache-2.0 | GGUF | reward/world model, multimodal |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Información pública muy escasa: no constan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Idioma: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente limitado.
- Riesgo de alucinación: inherente a los modelos generativos; en tareas de recompensa puede producir puntuaciones inconsistentes.
- Sesgos: no documentados, pero al no conocerse el dataset de entrenamiento no pueden descartarse sesgos de dominio (vídeo, cinematografía) ni culturales.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original y de los datos de entrenamiento, no detalladas.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- La parte multimodal requiere cargar el archivo mmproj correspondiente; sin él, las capacidades de visión no estarán disponibles.
- No se garantiza compatibilidad con vLLM o TGI al distribuirse únicamente en GGUF.
- El repositorio completo ocupa 187,9 GB; descargar solo la cuantización necesaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WorldReward-qwen38-27b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/WorldReward-qwen38-27b
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/WorldReward-qwen38-27b-i1-GGUF
- Página de overview del autor: https://hf.tst.eu/model#WorldReward-qwen38-27b-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
