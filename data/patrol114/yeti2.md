# patrol114/Yeti2

## Resumen

Yeti2 es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario patrol114 en Hugging Face, construido sobre el modelo base DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored. Se distribuye como repositorio PEFT de 4,3 GB en formato safetensors y esta etiquetado para generacion de texto y uso conversacional. No es un modelo completo, sino un delta de pesos que requiere cargar el modelo base para funcionar.

El modelo llega sin model card descriptiva: el README generado automaticamente por TRL solo indica que se entreno con SFT y recoge las versiones del framework (PEFT 0.22.0, TRL 0.24.0, Transformers 5.5.0, PyTorch 2.11.0, Datasets 4.3.0, Tokenizers 0.22.2). No se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni evaluaciones. El nombre interno del entrenamiento (20261127T171639Z-633492957) sugiere un pipeline automatizado sin curacion posterior.

Su relevancia es limitada y fundamentalmente experimental: cero descargas y cero likes en el momento de la consulta, licencia no declarada y un modelo base marcado como "uncensored" y "heretic", lo que anticipa riesgos de contenido y de cumplimiento. Resulta util como ejemplo de adaptador LoRA sobre un Qwen de gran tamano, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only; arquitectura del base no documentada en la informacion disponible |
| Parametros totales | no disponible (el adaptador ocupa 4,3 GB en safetensors; el base se infiere de ~40B por su nombre, sin confirmacion) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible para el adaptador; el base admitiria las habituales de transformers/llama.cpp, sin datos publicados |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin contenido) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT mediante TRL 0.24.0 y PEFT 0.22.0, con Unsloth entre las etiquetas del repositorio, lo que apunta a un entrenamiento optimizado en memoria sobre GPU de consumo. No se especifican rango, alpha, modulos objetivo ni numero de pasos. El modelo base, DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored, es a su vez un derivado de la familia Qwen con ajustes orientados a eliminar filtros de seguridad; la informacion disponible no detalla su arquitectura interna, su ventana de contexto ni su volumen de entrenamiento.

No hay datos sobre el dataset de SFT: ni numero de tokens, ni composicion, ni si hubo etapas de preferencia (DPO/RLHF) posteriores. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El unico dato verificable del entrenamiento es la pila de software utilizada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" y el ejemplo de pipeline de la model card.
- Ajuste SFT sobre un base de gran tamano, lo que en principio preserva las capacidades del modelo original (razonamiento, codigo, matematicas), aunque sin evaluacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Alineacion de seguridad reducida por herencia del base "uncensored/heretic": el adaptador no incorpora salvaguardas documentadas.

## Casos de uso

- Experimentacion con PEFT: cargar el adaptador sobre el base con `PeftModel.from_pretrained` para estudiar como un SFT ligero modifica el comportamiento de un modelo de ~40B sin reentrenar todos los pesos.
- Investigacion sobre desalineacion y contenido: analizar en entorno controlado que tipo de respuestas produce un adaptador entrenado sobre un base sin filtros, con fines de auditoria de seguridad.
- Prototipado de asistentes conversacionales: usar el pipeline de generacion de la model card como base para un chatbot de demostracion, asumiendo que requiere GPU de gama alta.
- Evaluacion comparativa de adaptadores: medir la deriva de calidad entre el base y el LoRA en tareas de razonamiento y codigo mediante un harness propio (lm-evaluation-harness), ya que el autor no publica metricas.
- Fine-tuning incremental: emplear el adaptador como punto de partida para merges o entrenamientos adicionales con TRL, dado que el repositorio incluye toda la metadata de versiones del framework.
- Docencia y formacion: ilustrar el ciclo completo de SFT con Unsloth/TRL sobre modelos grandes, incluidos los riesgos de publicar artefactos sin model card ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: 4,3 GB en disco; en memoria, el delta LoRA es pequeno, pero debe convivir con el modelo base completo.
- VRAM para el base: no disponible con precision; un modelo de ~40B en bf16 requeriria del orden de 80 GB, y en cuantizacion de 4 bits, alrededor de 20-25 GB, siempre que el base sea compatible con dicha cuantizacion.
- GPU recomendadas: A100 80 GB o H100 para bf16; para cuantizacion 4 bits, RTX 4090 (24 GB) o A6000 (48 GB) como minimo.
- Cabe en GPU de consumo: previsiblemente si, solo con el base cuantizado y en GPUs de 24 GB o mas; no confirmado por el autor.
- Despliegue: transformers + PEFT para cargar el adaptador; vLLM y TGI requeririan fusionar (merge) el LoRA en el base antes de servir; llama.cpp/Ollama solo si se exporta a GGUF tras el merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| patrol114/Yeti2 | LoRA SFT sobre Qwen ~40B | no disponible (base ~40B por nombre) | no disponible | no disponible | 0 descargas, 0 likes |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | Modelo base completo | ~40B (segun nombre) | no disponible | no disponible | Repositorio publico en HF |
| Adaptadores LoRA genericos de TRL | LoRA SFT | variable | depende del base | variable | Amplia en HF |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: sin dataset, hiperparametros ni evaluaciones, lo que impide reproducir el entrenamiento.
- Licencia no declarada: no hay autorizacion explicita de uso comercial; el uso en produccion es juridicamente arriesgado.
- Base "uncensored/heretic": alta probabilidad de generar contenido toxico, ilegal o inseguro; no apto para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion y de deriva respecto al base, sin metricas que lo cuantifiquen.
- Idiomas y contexto no declarados: no se puede garantizar soporte multilingue ni ventanas largas.
- Cero traccion en la comunidad (0 descargas, 0 likes): sin validacion externa ni issues reportados.
- Fecha de creacion futura en los metadatos (2026-11-27): posible artefacto del pipeline de publicacion; conviene verificar la integridad del repositorio.
- Requiere cargar el base completo: el coste real de inferencia es el del modelo de ~40B, no el del adaptador.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/patrol114/Yeti2
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
