# reaperdoesntknow/Qwen3.5-2B-CyberSec

## Resumen

Qwen3.5-2B-CyberSec es un ajuste fino (fine-tuning) del checkpoint Qwen3.5 2B publicado por el usuario reaperdoesntknow bajo licencia Apache-2.0. El modelo se distribuye en formato Transformers/Safetensors y esta asociado en sus metadatos al dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, un conjunto de instrucciones orientado a ciberseguridad. Su proposito declarado es la investigacion y la experimentacion local con modelos pequenos aplicados a prompts de seguridad informatica.

Tecnicamente se trata de un modelo de 2.274.069.824 parametros (aproximadamente 2,27 mil millones) construido sobre la arquitectura Qwen3.5, que la model card describe como una arquitectura de generacion condicional con componentes de texto y vision. El repositorio ocupa 4,6 GB e incluye pesos en safetensors; existe ademas una variante GGUF publicada en un repositorio separado.

Su relevancia es doble: por un lado, demuestra el flujo tipico de adaptacion de un modelo base pequeno con Unsloth para una tarea vertical concreta; por otro, la propia model card es inusualmente honesta al advertir que no se publican benchmarks, evaluaciones de seguridad ni comparaciones con el modelo base, por lo que no debe considerarse una autoridad validada en ciberseguridad. Es un artefacto de investigacion, no un producto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (generacion condicional con componentes de texto y vision) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio principal; existe variante GGUF en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers); GGUF en repositorio aparte |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-2B y conserva la arquitectura Qwen3.5, que la model card identifica como una configuracion de generacion condicional multimodal con modulos de texto y vision. El pipeline declarado en Hugging Face es text-generation, aunque los tags incluyen image-text-to-text y el ejemplo de carga utiliza AutoModelForMultimodalLM y AutoProcessor, lo que sugiere que el checkpoint mantiene la capacidad de procesar entradas de imagen y texto. El tamano de 2,27 mil millones de parametros lo situa en la franja de modelos pequenos, aptos para inferencia en hardware de consumo.

En cuanto al entrenamiento, la unica informacion disponible es la asociacion con el dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset y el uso de la libreria Unsloth, habitual en flujos de ajuste fino eficiente (LoRA/QLoRA). La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros, criterios de seleccion de checkpoint ni si hubo RLHF o DPO. Tampoco se describen tecnicas adicionales como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo citado seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat mediante plantilla (`apply_chat_template`).
- Respuestas a instrucciones tecnicas de ciberseguridad, presumiblemente sesgadas por el dataset Trendyol de instrucciones.
- Procesamiento multimodal texto-imagen segun la configuracion Qwen3.5 (el ejemplo de carga usa un procesador multimodal), aunque no se documenta el alcance real de esta capacidad tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Investigacion sobre respuestas de modelos pequenos a prompts de ciberseguridad: util para estudiar como un modelo de 2,27 B parametros reacciona a instrucciones del dominio, comparando cualitativamente con el checkpoint base unsloth/Qwen3.5-2B.
- Prototipado local de asistentes de formacion: desplegado en una estacion de trabajo, puede generar explicaciones introductorias sobre conceptos como privilegio minimo, segmentacion de red o gestion de parches, siempre con revision humana.
- Evaluacion comparativa de ajustes finos: sirve como punto de partida para medir regresiones de capacidad general frente al modelo base, tal como propone la propia model card.
- Experimentos de cuantizacion y conversion: al existir variante GGUF, es adecuado para probar pipelines de cuantizacion y medir degradacion de calidad en un modelo pequeno.
- Generacion de borradores de documentacion de seguridad: puede redactar borradores de politicas o checklists que un analista revisa y corrige, aprovechando el vocabulario del dominio aprendido.
- Banco de pruebas de alineacion y seguridad: util para estudiar la generacion de contenido dual-use y disenar filtros o evaluaciones de salida peligrosa en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe informe versionado de benchmarks, comparacion con baseline, resultado en conjunto de test reservado ni evaluacion de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,27 B parametros, en fp16 serian aproximadamente 4,5 GB solo de pesos; en cuantizacion de 8 bits, en torno a 2,3 GB; en 4 bits, alrededor de 1,2-1,5 GB. Son estimaciones por tamano, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con margen para el contexto; A100/H100 no son necesarias por tamano, aunque pueden usarse para lotes grandes.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y similares; en 4 bits podria caber en GPUs de 6-8 GB.
- Opciones de despliegue: Transformers con `device_map="auto"` (segun el ejemplo oficial), llama.cpp u Ollama mediante la variante GGUF publicada en repositorio separado; vLLM y TGI no estan documentados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-CyberSec | 2,27 B | no disponible | Ajuste fino en ciberseguridad | Apache-2.0 | Hugging Face (safetensors + GGUF) |
| unsloth/Qwen3.5-2B (base) | ~2 B (no confirmado) | no disponible | Modelo generalista | no disponible en esta ficha | Hugging Face |
| Trendyol cybersecurity instruction models | no disponible | no disponible | Instrucciones de ciberseguridad | no disponible | Hugging Face (dataset asociado) |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay benchmarks publicados para este checkpoint ni datos de rendimiento del modelo base en esta ficha.

## Limitaciones y advertencias

- No hay benchmarks ni evaluaciones de seguridad publicadas; la asociacion con un dataset no implica mejora de rendimiento frente al modelo base.
- Riesgo elevado de alucinacion en orientacion tecnica: la model card advierte que puede generar guia incorrecta o insegura.
- El dataset de entrenamiento puede contener errores, practicas obsoletas o material sensible de doble uso.
- No se documentan preprocesado del dataset, comprobaciones de contaminacion, hiperparametros ni criterios de seleccion de checkpoint, lo que dificulta la reproducibilidad.
- No ejecutar comandos generados sin revision y aislamiento; no usar el modelo como unica base para respuesta a incidentes, divulgacion de vulnerabilidades o decisiones de control de acceso.
- Idioma limitado al ingles; el rendimiento en castellano no esta documentado.
- Aunque la licencia es Apache-2.0, conviene verificar las obligaciones de atribucion y las condiciones del modelo base upstream antes de un uso comercial.
- El repositorio tiene 0 likes y unas 2.579 descargas en la fecha de consulta, lo que sugiere una validacion comunitaria escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec
- Variante GGUF: https://huggingface.co/reaperdoesntknow/Qwen3.5-2B-CyberSec-GGUF
- Modelo base inmediato: https://huggingface.co/unsloth/Qwen3.5-2B
- Dataset asociado: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Coleccion CIx cybersecurity models: https://huggingface.co/collections/reaperdoesntknow/cix-cybersecurity-models
