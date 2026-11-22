# mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit-V2-4B-CyberSecurity-Qwen3.5 es un modelo de lenguaje especializado en ciberseguridad ofensiva, desarrollado por el usuario xtools-at y cuantizado en formato GGUF por mradermacher. Se construye sobre una base Qwen 3.5 de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) y se ha afinado mediante instrucciones y LoRA/PEFT sobre un conjunto de datasets orientados a pentesting, red team, investigacion de vulnerabilidades, CTF y analisis de seguridad. El modelo esta disenado para generar razonamiento tecnico y respuestas accionables en tareas de seguridad, incluyendo modo de razonamiento (reasoning) y soporte conversacional.

La relevancia de este modelo radica en su especializacion vertical: frente a modelos generalistas del mismo tamano, Qwensploit-V2 concentra su entrenamiento en dominios de seguridad ofensiva, lo que puede mejorar la precision en tareas como explotacion controlada, analisis de superficies de ataque o generacion de scripts de reconocimiento. Al estar disponible en GGUF con multiples niveles de cuantizacion (desde Q2_K hasta f16), puede desplegarse en hardware de consumo, lo que facilita su uso en laboratorios, entornos de formacion y pruebas de seguridad locales sin depender de infraestructura en la nube.

El repositorio tiene un tamano de 41,0 GB e incluye cuantizaciones estaticas, ademas de un repositorio separado con cuantizaciones ponderadas/imatrix. La licencia es "other", lo que exige revisar los terminos del modelo base y del autor original antes de cualquier uso comercial. El modelo solo declara soporte para ingles y esta etiquetado con capacidades multimodales (archivos mmproj), aunque la informacion disponible no detalla la naturaleza exacta de dicha multimodalidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen 3.5 (no se detalla variante exacta; incluye etiqueta `mtp`) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen 3.5, una arquitectura transformer, y ha sido afinado mediante instrucciones y tecnicas de LoRA/PEFT (segun las etiquetas `lora`, `peft`, `instruction-tuning`). La etiqueta `mtp` sugiere multi-token prediction, aunque no se dispone de documentacion tecnica que confirme su implementacion exacta. El entrenamiento combina varios datasets de ciberseguridad: PentesterFlow/OffsecCyber, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. No se especifica el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

La informacion disponible no detalla si se aplicaron tecnicas de RLHF o DPO, ni innovaciones como decodificacion especulativa o atencion lineal. La presencia de archivos `mmproj` indica soporte multimodal (probablemente vision), pero no se documenta el modulo visual ni su integracion. El proceso de cuantizacion ha sido realizado por mradermacher con cuantizaciones estaticas (quantize_version 2) y un repositorio separado para cuantizaciones ponderadas/imatrix.

## Capacidades

- Generacion de texto y razonamiento tecnico orientado a ciberseguridad.
- Razonamiento multi-paso (modo reasoning) para tareas de analisis y planificacion.
- Red team y pentesting: generacion de comandos, scripts y estrategias de explotacion controlada.
- Investigacion de vulnerabilidades y analisis de seguridad.
- Resolucion de retos CTF (capture the flag).
- Soporte conversacional multi-turno.
- Capacidad multimodal indicada por los archivos `mmproj` (naturaleza exacta no disponible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes: no disponible en la informacion.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Formacion en ciberseguridad: el modelo puede generar explicaciones paso a paso de vulnerabilidades y tecnicas de explotacion en entornos de laboratorio, sirviendo como tutor interactivo para estudiantes de seguridad ofensiva.
- Pentesting autorizado: uso en pruebas de penetracion con alcance definido para generar hipotesis de ataque, comandos de reconocimiento y scripts de validacion, aprovechando su entrenamiento en datasets de offsec.
- Resolucion de CTF: asistencia en retos de captura de bandera, incluyendo analisis de binarios, web, criptografia y forense, gracias a su modo de razonamiento y especializacion.
- Analisis de vulnerabilidades: apoyo en la revision de configuraciones, codigo y superficies de ataque para identificar posibles debilidades, con generacion de recomendaciones de mitigacion.
- Redaccion de informes de seguridad: generacion de hallazgos, descripciones tecnicas y recomendaciones a partir de notas de pruebas, reduciendo el tiempo de documentacion.
- Automatizacion de tareas de reconocimiento: integracion en pipelines locales para generar comandos de enumeracion y scripts auxiliares, desplegable en GGUF con llama.cpp u Ollama en hardware de consumo.
- Laboratorios de respuesta a incidentes: analisis de trazas y artefactos para proponer hipotesis de compromiso y pasos de contencion, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K), 2,7-2,9 GB (Q4_K_S/Q4_K_M), 3,7 GB (Q6_K), 4,7 GB (Q8_0) y 8,8 GB (f16), segun los tamanos de archivo indicados en la model card.
- GPU recomendadas: no disponible de forma explicita; por tamano, cabe en GPUs de consumo con 6-8 GB de VRAM o mas.
- Cabe en GPU de consumo: si, en tarjetas con al menos 4-6 GB de VRAM para cuantizaciones Q4, y 8-10 GB para Q8_0/f16.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base es compatible con transformers y text-generation-inference.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit-V2-4B-CyberSecurity-Qwen3.5 | 4,3 mil millones | no disponible | Ciberseguridad ofensiva | other | GGUF, safetensors |
| Qwen 3.5 base (4B) | no disponible | no disponible | Generalista | no disponible | safetensors, GGUF |
| Modelos generalistas de 4B (p. ej., Llama 3.2 3B, Phi-3.5-mini) | 3-4 mil millones | no disponible | Generalista | licencias respectivas | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, formato y especializacion; los datos de contexto y benchmarks de los alternativas no estan disponibles en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datasets de ciberseguridad, puede reflejar sesgos de las fuentes (por ejemplo, tecnicas ofensivas sin contexto etico).
- Riesgo de alucinacion: inherente a modelos de 4B; puede generar comandos o vulnerabilidades inexistentes, por lo que requiere validacion humana.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta disponible.
- Restricciones de licencia: licencia "other"; es imprescindible revisar los terminos del modelo base y del autor original antes de uso comercial.
- Uso dual: el modelo esta orientado a seguridad ofensiva; su uso debe limitarse a entornos autorizados y cumplir la legislacion aplicable.
- Caveat para produccion: no hay benchmarks publicados que validen su rendimiento; se recomienda evaluacion propia antes de desplegarlo en flujos criticos.
- La multimodalidad indicada por `mmproj` no esta documentada; su comportamiento real no puede confirmarse con la informacion disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
