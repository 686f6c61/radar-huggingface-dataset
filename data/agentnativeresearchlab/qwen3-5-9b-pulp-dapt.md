# AgentNativeResearchLab/Qwen3.5-9B-PULP-DAPT

## Resumen

Qwen3.5-9B-PULP-DAPT es un modelo de 9.400 millones de parámetros desarrollado por AgentNativeResearchLab como continuación del pretraining (domain-adaptive pretraining, DAPT) sobre el modelo base Qwen/Qwen3.5-9B-Base. Su objetivo es inyectar conocimiento factual sobre la plataforma PULP (Carfield/Cheshire SoC RISC-V de ETH Zurich) en un LLM, sirviendo como proxy público del problema de "inyectar el conocimiento de un chip propietario en un LLM" (el escenario ChipNeMo). El modelo alcanza un 81,6 % de precisión en un banco de 1.776 preguntas factuales sobre la plataforma, frente al 72,2 % de Claude Opus 5 en modo closed-book, y un 97 % en recuperación de offsets de registros.

La relevancia del modelo no reside solo en el resultado, sino en la receta de entrenamiento: el DAPT sobre el corpus bruto no produjo ninguna mejora en memorización, mientras que una etapa de aumentación mediante reescritura de conocimiento con plantillas LLM (24 plantillas, incluyendo formas inversas) y documentos narrativos de tablas completas fue la responsable de todas las ganancias. El entrenamiento completo duró 77 minutos en 4 GPU H100 (~20 USD), lo que demuestra que es posible inyectar conocimiento técnico especializado de forma eficiente y económica.

Se trata de un modelo base (sin chat template) orientado a extracción de conocimiento mediante few-shot completion. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-9B-Base, un transformer denso de 9.400 millones de parametros. No se han publicado detalles especificos sobre la arquitectura interna (numero de capas, cabezas de atencion, etc.) en la informacion disponible.

El entrenamiento consistio en una fase de continued pretraining (stage=pt) a parametros completos en bf16, utilizando LLaMA-Factory con DeepSpeed ZeRO-3. El corpus de entrenamiento incluyo:

- 31,2 millones de tokens del corpus de la organizacion pulp-platform en GitHub.
- 3,49 millones de tokens de aumentacion mediante reescritura de conocimiento.
- 8 % de rejuego de wikitext para mitigar el olvido catastrofico.

Hiperparametros: learning rate 5e-6 con decaimiento coseno, batch global 16, packing de secuencias a 4096 tokens, 2 epocas. El entrenamiento tardo 77 minutos en 4 GPU H100.

La innovacion clave es la etapa de aumentacion por reescritura de conocimiento: cada hecho se reexpresó mediante 24 plantillas generadas por LLM (un tercio en forma inversa), con cobertura completa sobre todos los hechos (no solo los evaluados), mas documentos narrativos de tablas completas para combatir la interferencia entre hechos similares. Segun el autor, el DAPT sobre el corpus bruto no produjo ninguna ganancia en preguntas de memorizacion (loss 0.80→0.35, pero offsets 1/42 → 1/42), lo que demuestra que la aumentacion fue el factor decisivo.

## Capacidades

- Conocimiento factual profundo sobre la plataforma PULP Carfield/Cheshire: mapas de registros, mapas de memoria, pines de dependencia, semantica de documentacion, correspondencias driver↔registro e historial de issues.
- Recuperacion precisa de offsets de registros (97 % de precision en el banco completo).
- Extraccion de conocimiento mediante few-shot completion, ya que es un modelo base sin chat template.
- Capacidades generativas heredadas del modelo base Qwen3.5-9B-Base (generacion de texto, razonamiento, codigo, etc., aunque no se han evaluado formalmente tras el DAPT).
- Sin soporte de tool calling, agentes o modo thinking (no se menciona en la informacion disponible).
- Monolingue en ingles.

## Casos de uso

- Asistencia en diseño de chips: el modelo puede responder preguntas sobre mapas de registros y direcciones de memoria del SoC Carfield/Cheshire, acelerando la consulta de documentacion tecnica durante el desarrollo de RTL.

- Verificacion de RTL: permite comprobar correspondencias entre drivers y registros de forma conversacional, reduciendo el tiempo de busqueda en codigo fuente y especificaciones.

- Generacion de documentacion tecnica automatizada: a partir de consultas few-shot, el modelo puede redactar descripciones de bloques de registros o explicaciones de pines de dependencia para incluir en manuales de referencia.

- Soporte a ingenieros de firmware: consulta rapida de offsets de registros, valores de mascaras y configuraciones de memoria sin necesidad de acceder a los repositorios.

- Analisis de historial de issues: el modelo conoce el historial de problemas reportados en la plataforma, lo que permite recuperar soluciones pasadas o contextos de bugs similares.

- Investigacion en inyeccion de conocimiento propietario: sirve como banco de pruebas publico para metodologias DAPT y de aumentacion de conocimiento, aplicable a dominios donde la informacion confidencial de un chip debe integrarse en un LLM sin exponerla.

- Integracion en herramientas EDA como copiloto de conocimiento: puede conectarse a entornos de desarrollo para responder preguntas sobre la plataforma en tiempo real, mejorando la productividad de los equipos de hardware.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en un benchmark propio de 1.776 preguntas factuales sobre la plataforma PULP, con un subconjunto de auditoria de 125 preguntas. El modelo se compara con su base (Qwen3.5-9B-Base) y con Claude Opus 5 en modo closed-book.

| Modelo | Subconjunto auditoria (125q) | Banco completo (1.776q) |
|---|---|---|
| Qwen3.5-9B-Base | 43,2 % | 41,2 % |
| Claude Opus 5 (closed-book) | 72,0 % | 72,2 % |
| Qwen3.5-9B-PULP-DAPT | 92,8 % | 81,6 % |

Adicionalmente, el modelo alcanza un 97 % de precision en la recuperacion de offsets de registros dentro del banco completo, frente al 28 % de Claude Opus 5. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~19 GB (tamano del repo 18,8 GB). Requiere una GPU con al menos 24 GB para trabajar sin cuantizacion.
- Con cuantizacion a 8 bits: ~10 GB, cabe en GPUs consumer como RTX 3080/4080 (12-16 GB).
- Con cuantizacion a 4 bits: ~5-6 GB, cabe en RTX 3060/4060 (8-12 GB) y en Apple Silicon con suficiente RAM unificada.
- GPU recomendadas: A100/H100 para inferencia en bf16 con vLLM; RTX 4090 o RTX 3090 para cuantizacion 8-bit; RTX 4060 o similares para 4-bit.
- Opciones de despliegue: vLLM (soporta safetensors directamente), llama.cpp (requiere conversion a GGUF), Ollama (si se publica un GGUF), TGI (text-generation-inference).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en benchmark PULP (1.776q) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Base | 9,4B | no disponible | 41,2 % | apache-2.0 | HuggingFace |
| Qwen3.5-9B-PULP-DAPT | 9,4B | no disponible | 81,6 % | apache-2.0 | HuggingFace |
| Claude Opus 5 | no disponible | no disponible | 72,2 % (closed-book) | propietaria | API comercial |

No se dispone de otros modelos de la misma categoria (DAPT especifico de hardware) con datos publicos comparables. El modelo Qwen3.5-9B-PULP-DAPT supera claramente a su base y a un modelo propietario de gran tamano en la tarea de conocimiento factual sobre PULP, aunque carece de evaluacion en benchmarks genericos.

## Limitaciones y advertencias

- El conocimiento se limita a una instantanea de los repositorios pulp-platform de agosto de 2026; cambios posteriores no estan reflejados.
- No se ha realizado una auditoria de olvido (p. ej., MMLU) tras el DAPT, por lo que el impacto en capacidades genericas no esta cuantificado.
- Debil en razonamiento de pertenencia a rangos numericos (region ownership en mapas de memoria).
- No es un modelo instruction-tuned; requiere few-shot completion o un SFT posterior para tareas conversacionales.
- Solo soporta ingles.
- La licencia Apache-2.0 permite uso comercial, pero el conocimiento inyectado proviene de la plataforma PULP, que es de codigo abierto; para dominios propietarios, la metodologia deberia adaptarse respetando la confidencialidad de los datos.
- No se han publicado benchmarks estandar (MMLU, HumanEval, etc.) que permitan comparar su rendimiento general con otros modelos de 9B.

## Enlaces

- HuggingFace: https://huggingface.co/AgentNativeResearchLab/Qwen3.5-9B-PULP-DAPT
- Repositorio GitHub (receta, datos y benchmark): https://github.com/ARA-Labs/PULP-LLM
- Plataforma PULP: https://pulp-platform.org/
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
