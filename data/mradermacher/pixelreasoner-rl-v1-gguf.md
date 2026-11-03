# mradermacher/PixelReasoner-RL-v1-GGUF

## Resumen

PixelReasoner-RL-v1-GGUF es la version cuantizada en formato GGUF del modelo TIGER-Lab/PixelReasoner-RL-v1, publicada por el usuario mradermacher. Se trata de un modelo multimodal de aproximadamente 7.615 millones de parametros (7,6B) orientado al razonamiento sobre imagenes, desarrollado originalmente por TIGER-Lab, el mismo grupo responsable de datasets y modelos centrados en razonamiento visual. La version GGUF permite ejecutar el modelo en entornos de inferencia local mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en safetensors.

El modelo base se entrena sobre el dataset TIGER-Lab/PixelReasoner-SFT-Data y emplea tecnicas de aprendizaje por refuerzo (indicado por el sufijo "RL" en su nombre) para mejorar el razonamiento visual multi-paso. La cuantizacion de mradermacher incluye tanto los pesos del modelo de lenguaje como el proyector multimodal (mmproj) necesario para procesar imagenes, lo que permite un despliegue completo en hardware de consumo.

Esta ficha es relevante porque documenta una de las pocas opciones de razonamiento visual con licencia Apache 2.0 disponible en formato GGUF, lo que facilita su integracion en pipelines locales sin depender de APIs externas ni de GPUs de datacenter. No obstante, la informacion publica sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector visual mmproj); detalles internos no disponibles |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y el ecosistema de TIGER-Lab, se trata de un modelo multimodal que combina un modelo de lenguaje con un proyector visual (mmproj), disenado para razonar sobre imagenes. El sufijo "RL" sugiere un entrenamiento con aprendizaje por refuerzo tras una fase de ajuste supervisado (SFT) sobre el dataset TIGER-Lab/PixelReasoner-SFT-Data. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni tecnicas especificas de RLHF/DPO.

La version aqui documentada es una cuantizacion estatica realizada por mradermacher mediante llama.cpp. El autor indica que no ha generado cuantizaciones con imatrix (weighted) para este modelo, por lo que solo existen cuantizaciones estaticas. Se incluyen ficheros separados para el proyector multimodal (mmproj) en Q8_0 y f16, necesarios para el procesamiento de imagenes.

## Capacidades

- Razonamiento visual multi-paso: el modelo esta disenado para resolver tareas que requieren analizar imagenes y razonar sobre ellas de forma iterativa.
- Procesamiento de imagenes: gracias al proyector multimodal (mmproj) incluido en el repositorio.
- Generacion de texto: capacidades estandar de un modelo de lenguaje de 7,6B.
- Conversacion multi-turno: el tag "conversational" indica soporte para dialogos.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere integracion con APIs de inferencia tipo OpenAI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Analisis de documentos escaneados: el modelo puede procesar imagenes de documentos y razonar sobre su contenido, util para extraccion de informacion en entornos con requisitos de privacidad donde no se puede usar una API externa.
- Asistencia en diagnostico visual: en prototipos de investigacion, puede analizar imagenes y generar razonamientos paso a paso, adecuado para entornos academicos que necesitan transparencia en el proceso de inferencia.
- Automatizacion de soporte tecnico con capturas de pantalla: el modelo puede recibir imagenes de errores o interfaces y generar explicaciones, integrable en herramientas internas mediante llama.cpp.
- Educacion y tutoria visual: puede razonar sobre diagramas, graficos o figuras y explicar conceptos, aprovechando su capacidad de razonamiento multi-paso.
- Investigacion en razonamiento visual: al ser Apache 2.0 y estar disponible en GGUF, sirve como base para experimentos de investigacion en entornos con recursos limitados.
- Procesamiento por lotes en local: con cuantizaciones Q4_K_M (4,8 GB) puede ejecutarse en GPUs de consumo para tareas de clasificacion y descripcion de imagenes a escala moderada.
- Integracion en pipelines de CI/CD para validacion visual: puede verificar capturas de pantalla o resultados de renderizado en tests automatizados, aunque con las limitaciones propias de un modelo de 7,6B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + mmproj + overhead de contexto):
  - Q2_K: ~3,1 GB + 1,0 GB mmproj Q8_0 + overhead; viable en GPUs de 6-8 GB.
  - Q4_K_M: ~4,8 GB + 1,0 GB mmproj Q8_0 + overhead; recomendado para GPUs de 8-12 GB.
  - Q5_K_M: ~5,5 GB + 1,0 GB mmproj; requiere 10-12 GB.
  - Q8_0: ~8,2 GB + 1,0 GB mmproj; requiere 12-16 GB.
  - f16: ~15,3 GB + 1,5 GB mmproj; requiere 24 GB o mas.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si, en la mayoria de configuraciones con cuantizacion Q4_K_M o inferior.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF y mmproj para vision.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PixelReasoner-RL-v1-GGUF | 7,6B | no disponible | Apache 2.0 | GGUF | Razonamiento visual, solo ingles |
| Qwen2.5-VL-7B | 7B | 128K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Multimodal, multilingue, ampliamente soportado |
| LLaVA-1.5-7B | 7B | 4K (segun documentacion publica) | Apache 2.0 | safetensors, GGUF | Multimodal, comunidad amplia |
| InternVL2-8B | 8B | 8K (segun documentacion publica) | MIT | safetensors | Multimodal, buen rendimiento en benchmarks visuales |

Nota: los datos de contexto y rendimiento de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia orientativa.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos del repositorio; el rendimiento en castellano no esta garantizado.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion inherente a modelos de 7,6B, especialmente en tareas de razonamiento visual complejo.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas con muchas imagenes o dialogos largos.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad del razonamiento; se recomienda Q4_K_M o superior.
- No hay cuantizaciones imatrix disponibles, lo que limita la calidad en tamanos bajos.
- Aunque la licencia es Apache 2.0, el modelo base puede tener restricciones adicionales no documentadas en esta ficha; conviene revisar la model card original de TIGER-Lab antes de uso comercial.
- El repositorio tiene muy pocas descargas (228) y likes (1), lo que sugiere poca validacion por parte de la comunidad.
- No se han publicado benchmarks que permitan comparar su rendimiento real con alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PixelReasoner-RL-v1-GGUF
- Modelo base: https://huggingface.co/TIGER-Lab/PixelReasoner-RL-v1
- Dataset de SFT: https://huggingface.co/datasets/TIGER-Lab/PixelReasoner-SFT-Data
- Pagina de descargas del autor: https://hf.tst.eu/model#PixelReasoner-RL-v1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
