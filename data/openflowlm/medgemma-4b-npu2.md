# OpenFlowLM/Medgemma-4B-NPU2

## Resumen

Medgemma-4B-NPU2 es un port cuantizado del modelo médico MedGemma 4B, empaquetado por OpenFlowLM en el formato propietario Q4NX para su ejecución sobre las NPU AMD XDNA (plataforma Ryzen AI). No se trata de un modelo entrenado desde cero ni de un GGUF: es una conversión del modelo `Atomic-Germ/Medgemma-4B-NPU2` realizada con la herramienta `oflm pack`, que a su vez deriva del GGUF `medgemma-4b-it.i1-Q4_1.gguf` de mradermacher. Su propósito es permitir la inferencia local de un modelo médico multimodal en hardware de PC con NPU integrada, sin depender de GPU dedicada ni de servicios en la nube.

El modelo subyacente, MedGemma 4B, es un modelo abierto de Google DeepMind para desarrollo de IA sanitaria, construido como fine-tune de la arquitectura Gemma 3 4B (`google/gemma-3-4b-pt`) y orientado a imagen médica y razonamiento clínico. La model card del port etiqueta la tarea como `image-text-to-text`, aunque el propio contenedor declara la modalidad como "language", una discrepancia relevante que conviene verificar antes de asumir capacidades de visión en este paquete concreto.

Es relevante ahora porque ejemplifica una tendencia concreta: llevar modelos especializados de dominio sanitario a NPUs de consumo mediante runtimes alternativos (OpenFlowLM, version 0.1.0, convertido el 2026-10-01). El repositorio pesa 4,8 GB y los pesos ocupan 3,51 GB, por lo que el modelo cabe en un portátil con NPU Ryzen AI. El contrapunto es que la adopción es prácticamente nula (0 descargas, 0 likes) y que la licencia heredada del modelo base impone restricciones de uso sanitario que hay que respetar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal de la familia Gemma 3 (etiqueta `gemma3_text`), con codificador visual tipo SigLIP en el modelo base |
| Parametros totales | ~4B (heredados de MedGemma 4B / Gemma 3 4B; no confirmados de forma explicita en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4NX con componentes Q8_0, Q4_1 y BF16; GGUF de origen cuantizado en Q4_1 |
| Idiomas soportados | no disponibles (los metadatos de HuggingFace no los especifican) |
| Licencia | other (modelo base bajo licencia Health AI Developer Foundations de Google) |
| Formato de pesos | `model.q4nx` (formato propietario de OpenFlowLM; no es GGUF) |
| Tamano de pesos | 3,51 GB (`model.q4nx`); repositorio completo de 4,8 GB |
| Runtime | OpenFlowLM (OFLM) 0.1.0 sobre NPU AMD XDNA |
| Modelo de origen | Atomic-Germ/Medgemma-4B-NPU2 (relacion: quantized) |
| Fecha de conversion | 2026-10-01 |

## Arquitectura y entrenamiento

La arquitectura procede íntegramente del modelo base: MedGemma 4B es un transformer decoder-only derivado de Gemma 3 4B, con atención y capas propias de esa familia y, en su versión multimodal, un codificador visual basado en SigLIP para procesar imágenes médicas. Este port no modifica la arquitectura, sino que reempaqueta los pesos ya cuantizados en el contenedor Q4NX que consume el runtime de OpenFlowLM. La información proporcionada no detalla el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO ni innovaciones de decodificación propias de este paquete, por lo que esos puntos quedan como no disponibles.

Los tags del repositorio apuntan a los dominios de especialización del modelo base (radiología, dermatología, patología, oftalmología, radiografía de tórax) y a un conjunto de referencias arXiv que respaldan el trabajo original. Es importante subrayar que el proceso aquí documentado es exclusivamente de conversión y cuantización (`oflm pack` a partir de un GGUF Q4_1), no de entrenamiento adicional: no hay evidencia en la información disponible de un fine-tune específico sobre este port más allá del que ya incorpora el modelo MedGemma de origen.

## Capacidades

- Generación de texto clínico e interpretación de imágenes médicas en el modelo base (radiología, dermatología, patología, oftalmología y radiografía de tórax, según los tags del repositorio).
- Tarea declarada `image-text-to-text`, es decir, entrada de imagen más texto y salida de texto, siempre que la modalidad visual se confirme en el runtime.
- Razonamiento clínico (`clinical-reasoning`), orientado a apoyar tareas de interpretación y descripción estructurada.
- Conversación multi-turno básica (etiqueta `conversational`).
- Compatibilidad con el ecosistema `transformers` a nivel de metadatos del repositorio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, function calling, agentes o modo de razonamiento explícito ("thinking"): no disponible.
- Capacidades de audio o vídeo: no disponibles.

Advertencia: el contenedor OFLM declara la modalidad como "language", lo que podría indicar que el paquete para NPU solo expone la parte de texto y no la visión. Conviene validar esto antes de asumir cualquier capacidad multimodal en este artefacto concreto.

## Casos de uso

- Triaje asistido de radiografía de tórax: el modelo base está especializado en `chest-x-ray`, por lo que puede generar descripciones estructuradas de hallazgos a partir de una imagen, útil como primera capa de cribado en investigación. Requiere validación clínica independiente antes de cualquier uso real.
- Apoyo en dermatología: análisis y descripción de lesiones cutáneas en entornos de investigación o anotación de conjuntos de datos dermatológicos.
- Patología digital: ayuda en la descripción de preparaciones y en la generación de borradores de informes, siempre bajo supervisión de un patólogo.
- Oftalmología: interpretación asistida de retinografías u otras imágenes oculares dentro de flujos de investigación.
- Anotación y curación de datasets médicos: preetiquetado automático de imágenes y textos clínicos para acelerar la construcción de corpus supervisados.
- Despliegue en el borde (edge) sobre portátiles con Ryzen AI: inferencia local de un modelo médico de 4B sin enviar datos de pacientes a la nube, lo que reduce riesgos de privacidad y cumple con requisitos de residencia de datos.
- Formación médica y simulación: generación de descripciones razonadas de casos para material docente, con revisión humana obligatoria.
- Integración en herramientas de investigación clínica: empaquetado dentro de pipelines locales que consumen el runtime OFLM para prototipado rápido de aplicaciones sanitarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, MedQA, VQA-RAD ni de ningún otro conjunto de evaluación, y tampoco se aportan comparativas de latencia o throughput. Cualquier cifra que se citara de MedGemma 4B correspondería al modelo original de Google DeepMind, no a este port cuantizado, y no debe extrapolarse sin una evaluación propia sobre el formato Q4NX.

## Requisitos de hardware

- VRAM/RAM para inferencia: los pesos ocupan 3,51 GB (`model.q4nx`), por lo que el modelo cabe holgadamente en memoria unificada de equipos con NPU Ryzen AI; el repositorio completo ocupa 4,8 GB.
- Hardware objetivo: NPU AMD XDNA (plataforma AMD Ryzen AI). El artefacto está compilado específicamente para este acelerador mediante `xclbin`.
- GPU dedicadas (A100, H100, RTX 4090, etc.): no aplica, el formato Q4NX no está pensado para CUDA y no es un GGUF ejecutable por llama.cpp.
- ¿Cabe en hardware de consumo? Sí, en portátiles y mini-PC con NPU Ryzen AI; no es un modelo pensado para GPU de consumo tradicionales.
- Opciones de despliegue: runtime OpenFlowLM (OFLM) mediante `oflm-add` e `oflm run`; la documentación de FastFlowLM también recoge MedGemma 4B sobre NPU AMD Ryzen AI. No compatible con vLLM, TGI, Ollama o llama.cpp en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medgemma-4B-NPU2 (este port) | ~4B | no disponible | Q4NX / OpenFlowLM sobre NPU AMD XDNA | other (Health AI Developer Foundations) | HuggingFace, 0 descargas |
| MedGemma 4B (Google DeepMind) | 4B | no disponible en esta ficha | safetensors / transformers | Health AI Developer Foundations | Modelo oficial de Google |
| MedGemma 27B (texto y multimodal) | 27B | no disponible en esta ficha | safetensors / transformers | Health AI Developer Foundations | Modelo oficial de Google |
| Gemma 3 4B (modelo base general) | 4B | no disponible en esta ficha | safetensors, GGUF | Gemma Terms | Ampliamente disponible |

No se dispone de datos de rendimiento comparativos en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad. Este port no aporta mejoras de capacidad frente a MedGemma 4B: solo cambia el empaquetado y el acelerador objetivo (NPU AMD XDNA), a cambio de atarse a un runtime propietario y sin validación comunitaria.

## Limitaciones y advertencias

- Licencia restringida: el modelo base se distribuye bajo Health AI Developer Foundations, con condiciones específicas para uso sanitario; no es una licencia de uso libre general y exige revisar los términos antes de cualquier despliegue, incluido el comercial.
- No apto para decisiones clínicas directas: MedGemma está pensado para investigación y desarrollo, no para diagnóstico o tratamiento sin validación independiente y supervisión profesional.
- Riesgo de alucinación elevado en dominio médico: cualquier salida debe ser verificada por personal cualificado; los errores en este contexto tienen consecuencias graves.
- Discrepancia de modalidad: el repositorio etiqueta `image-text-to-text`, pero el contenedor OFLM declara modalidad "language"; podría no exponer visión en la práctica.
- Formato propietario: Q4NX no es interoperable con llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad y ata el modelo al runtime OpenFlowLM y a hardware AMD XDNA.
- Artefacto de comunidad sin validación: 0 descargas y 0 likes, sin benchmarks ni evaluaciones publicadas; se desconoce la degradación introducida por la cuantización Q4_1 respecto al modelo original.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe correcto sin pruebas propias.
- Contexto no especificado: no hay confirmación de la ventana de contexto en este paquete, lo que afecta a tareas que requieran documentos largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenFlowLM/Medgemma-4B-NPU2
- Modelo de origen (Atomic-Germ): https://huggingface.co/Atomic-Germ/Medgemma-4B-NPU2
- Repositorio relacionado de OpenFlowLM: https://huggingface.co/OpenFlowLM/medgemma-4b-it-NPU2
- Pagina oficial de MedGemma en Google DeepMind: https://deepmind.google/models/gemma/medgemma/
- Blog de investigacion de Google sobre MedGemma: https://research.google/blog/medgemma-our-most-capable-open-models-for-health-ai-development/
- Documentacion de FastFlowLM sobre MedGemma 4B en NPU AMD Ryzen AI: https://fastflowlm.com/docs/models/medgemma/
- Referencias arXiv incluidas en los tags del repositorio: arxiv:2303.15343, arxiv:2507.05201, arxiv:2405.03162, arxiv:2106.14463, arxiv:2412.03555, arxiv:2501.19393, arxiv:2009.13081, arxiv:2102.09542, arxiv:2411.15640, arxiv:2404.05590, arxiv:2501.18362 (accesibles en https://arxiv.org/abs/ID)
