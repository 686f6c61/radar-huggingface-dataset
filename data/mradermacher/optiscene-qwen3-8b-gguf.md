# mradermacher/OptiScene-Qwen3-8B-GGUF

## Resumen

OptiScene-Qwen3-8B-GGUF es la distribucion en formato GGUF del modelo Prisoner/OptiScene-Qwen3-8B, un ajuste fino de Qwen3-8B especializado en generacion de escenas de interior y layouts 3D. El modelo original ha sido entrenado mediante SFT y DPO sobre el dataset B3rrYang/3D-SynthPlace_indoor_scenes_dataset, lo que lo orienta a tareas de sintesis estructurada de espacios tridimensionales descritas en lenguaje natural. Esta version GGUF la publica mradermacher, un conocido cuantizador de la comunidad, para facilitar su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo base Qwen3-8B aporta una arquitectura transformer densa de aproximadamente 8.190 millones de parametros, con capacidades conversacionales y de razonamiento heredadas. Sobre esa base, el ajuste fino de OptiScene introduce comportamiento especializado en la generacion de layouts indoor, lo que lo hace relevante para pipelines de diseno asistido por IA, prototipado de interiores y generacion procedural de escenas.

La publicacion de esta variante cuantizada es relevante porque reduce los requisitos de hardware de un modelo de 8B a rangos accesibles en GPU de consumo (desde 3,4 GB en Q2_K hasta 16,5 GB en f16), manteniendo la licencia MIT del modelo original, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo original Prisoner/OptiScene-Qwen3-8B parte de la arquitectura transformer densa de Qwen3-8B, con 8.190 millones de parametros. Sobre esa base se ha realizado un ajuste fino en dos fases: primero SFT (supervised fine-tuning) y despues DPO (direct preference optimization), segun indican las etiquetas de la model card. El dataset de entrenamiento es B3rrYang/3D-SynthPlace_indoor_scenes_dataset, orientado a escenas de interior sinteticas y layouts 3D. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni detalles sobre innovaciones arquitectonicas adicionales.

Esta version GGUF ha sido generada por mradermacher mediante cuantizacion estatica (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2). No se han publicado por el momento cuantizaciones ponderadas o con imatrix para este modelo; el autor indica que si no aparecen en aproximadamente una semana tras las estaticas, probablemente no las tenga planificadas, aunque acepta peticiones via Community Discussion.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen3-8B.
- Generacion de escenas de interior y layouts 3D a partir de descripciones en lenguaje natural (especialidad del ajuste fino).
- Razonamiento estructurado orientado a la sintesis de espacios y distribucion de objetos.
- Capacidades conversacionales (etiqueta "conversational" en Hugging Face).
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Prototipado de diseno de interiores: el modelo puede generar layouts 3D estructurados a partir de descripciones textuales de habitaciones, sirviendo como primer paso en pipelines de diseno asistido antes de la renderizacion final.
- Generacion procedural de escenas para videojuegos y simuladores: integrado en herramientas de autoria, permite crear distribuciones de muebles y objetos coherentes en espacios indoor descritos por el disenador.
- Aumento de datasets sinteticos: util para generar variaciones de escenas de interior que alimenten modelos de vision por computador o de reconstruccion 3D, aprovechando el ajuste sobre 3D-SynthPlace.
- Asistentes de configuracion de espacios en retail: un chatbot que recibe la descripcion de una estancia y devuelve un layout propuesto con los productos del catalogo colocados de forma plausible.
- Herramientas de planificacion de mudanzas o reformas: dado un plano descrito en texto, el modelo propone distribuciones alternativas de mobiliario que el usuario puede revisar y refinar conversacionalmente.
- Despliegue en local para investigacion: gracias a las cuantizaciones GGUF (desde 3,4 GB), investigadores pueden ejecutar el modelo en estaciones de trabajo sin GPU de datacenter para experimentar con generacion de layouts.
- Integracion en pipelines de CI/CD para validacion de escenas: el modelo puede actuar como generador de casos de prueba estructurados que validen parsers y renderizadores de layouts 3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano de fichero, mas overhead de contexto):
  - Q2_K: ~3,4 GB
  - Q3_K_S: ~3,9 GB
  - Q3_K_M: ~4,2 GB
  - Q3_K_L: ~4,5 GB
  - IQ4_XS: ~4,7 GB
  - Q4_K_S: ~4,9 GB
  - Q4_K_M: ~5,1 GB
  - Q5_K_S: ~5,8 GB
  - Q5_K_M: ~6,0 GB
  - Q6_K: ~6,8 GB
  - Q8_0: ~8,8 GB
  - f16: ~16,5 GB
- GPU recomendadas: no disponible de forma especifica; por tamano, Q4_K_M encaja en GPUs consumer con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 3070), Q6_K y Q8_0 requieren 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4090), y f16 requiere 24 GB o mas (RTX 3090, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python, text-generation-webui). El tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| OptiScene-Qwen3-8B-GGUF | 8,19B | no disponible | Generacion de escenas indoor / layouts 3D | MIT | GGUF |
| Qwen3-8B (base) | ~8B | no disponible | Proposito general, conversacional | no disponible en esta ficha | safetensors, GGUF (por terceros) |
| Prisoner/OptiScene-Qwen3-8B | 8,19B | no disponible | Generacion de escenas indoor / layouts 3D | MIT | safetensors |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la informacion proporcionada para establecer comparaciones de rendimiento cuantitativas.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente como ingles ("en"); el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Especializacion estrecha: el ajuste SFT+DPO sobre un dataset concreto de escenas indoor puede degradar capacidades generales de Qwen3-8B fuera del dominio de layouts 3D.
- Riesgo de alucinacion: como todo modelo generativo, puede producir layouts fisicamente invalidos, con solapamientos de objetos o dimensiones incoherentes; se recomienda validacion programatica posterior.
- Sesgos: no se documentan sesgos especificos en la informacion disponible, pero el dataset de entrenamiento (escenas sinteticas) puede no representar la diversidad de espacios reales.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion proporcionada; conviene verificar en el modelo base antes de usarlo con entradas largas.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda conservar el aviso de copyright y verificar la licencia del modelo base Qwen3-8B, que puede imponer condiciones adicionales.
- Cuantizaciones estaticas: no hay versiones ponderadas/imatrix disponibles; las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia de los layouts generados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.

## Enlaces

- Repositorio Hugging Face (esta version GGUF): https://huggingface.co/mradermacher/OptiScene-Qwen3-8B-GGUF
- Modelo base (safetensors): https://huggingface.co/Prisoner/OptiScene-Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/B3rrYang/3D-SynthPlace_indoor_scenes_dataset
- Pagina de overview del cuantizador: https://hf.tst.eu/model#OptiScene-Qwen3-8B-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
