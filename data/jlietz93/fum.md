# jlietz93/FUM

## Resumen

El modelo FUM (Fully Unified Model) es una arquitectura de inteligencia artificial inspirada en el cerebro, desarrollada por Justin Lietz (usuario jlietz93). Su objetivo es lograr un aprendizaje eficiente, operación autónoma e inteligencia emergente mediante la integración de redes neuronales spiking (SNN), plasticidad dependiente de tiempo de disparo (STDP), plasticidad estructural y un motor de auto-mejora (SIE). Se presenta como una arquitectura "scale-free", lo que sugiere que su diseño no depende de un tamaño fijo de parámetros, sino de principios de organización dinámica.

El modelo se publica bajo licencia MIT y se distribuye a través de Hugging Face, aunque la ficha oficial es extremadamente escasa: no se especifican parámetros, contexto, idiomas ni pipeline. La información disponible proviene principalmente del repositorio de GitHub asociado, donde se describe como un sistema de aprendizaje autónomo capaz de extraer patrones complejos a partir de datos mínimos. Su relevancia actual radica en la exploración de alternativas a los transformers clásicos, apostando por mecanismos biológicos como la plasticidad sináptica y el aprendizaje continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal spiking (SNN) con plasticidad estructural y STDP, integrada con un motor de auto-mejora (SIE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF u otro) |

## Arquitectura y entrenamiento

Según la descripción del repositorio de GitHub, FUM combina redes neuronales spiking con mecanismos de plasticidad sináptica dependiente de tiempo de disparo (STDP) y plasticidad estructural, lo que le permite reorganizar dinámicamente sus conexiones. Incluye un motor de auto-mejora (SIE) que ajusta el comportamiento del sistema en función de la experiencia acumulada. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO. La arquitectura se describe como "scale-free", lo que podría implicar que no depende de una escala fija de parámetros, sino de principios de organización emergente, aunque no se ofrecen especificaciones cuantitativas.

## Capacidades

- Aprendizaje autónomo: el modelo está diseñado para operar sin supervisión externa continua, adaptando su estructura interna mediante plasticidad.
- Procesamiento de patrones temporales: al ser una red spiking, maneja información temporal y secuencial de forma natural.
- Auto-mejora: el motor SIE permite al modelo modificar sus propios parámetros o reglas de aprendizaje en función del rendimiento.
- Eficiencia con datos mínimos: se afirma que puede aprender patrones complejos a partir de conjuntos de datos reducidos, aunque no se aportan métricas.
- No se documentan capacidades específicas como generación de texto, tool calling, visión o soporte multilingüe.

## Casos de uso

- Investigación en IA neuromórfica: FUM puede servir como banco de pruebas para estudiar mecanismos de plasticidad y aprendizaje continuo en entornos académicos.
- Simulación de procesos cognitivos: su diseño inspirado en el cerebro permite modelar fenómenos como la memoria a corto plazo o la adaptación a estímulos cambiantes.
- Sistemas de aprendizaje en tiempo real: la naturaleza spiking y la plasticidad estructural podrían aplicarse a entornos donde los datos llegan de forma incremental, como robótica o sensores.
- Experimentación con arquitecturas alternativas: desarrolladores que buscan alternativas a los transformers pueden analizar su comportamiento y compararlo con modelos clásicos.
- Educación en neurociencia computacional: como ejemplo de integración de STDP y redes spiking en un marco unificado.
- Prototipos de agentes autónomos: la capacidad de auto-mejora podría explorarse en entornos simulados donde el agente debe adaptarse a tareas cambiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se ofrecen comparativas con modelos similares.

## Requisitos de hardware

- No se dispone de información sobre requisitos de VRAM, GPU recomendadas o latencia.
- Al ser una red spiking, podría ejecutarse en hardware neuromórfico o en GPUs convencionales, pero no se especifica.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama.
- Dado que no se publican pesos ni formato, no es posible estimar requisitos prácticos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con la misma arquitectura (SNN con STDP y auto-mejora) en el ecosistema de Hugging Face. Los modelos de lenguaje convencionales (LLaMA, Mistral, etc.) no son comparables por su naturaleza y objetivos.

## Limitaciones y advertencias

- El modelo se encuentra en una fase claramente experimental: no hay documentación técnica detallada, ni pesos publicados, ni resultados de evaluación.
- No se ha validado su rendimiento en tareas del mundo real; las afirmaciones sobre "inteligencia emergente" y "aprendizaje eficiente" carecen de evidencia empírica.
- Al ser una arquitectura spiking, su integración con el ecosistema actual de herramientas (transformers, pipelines de Hugging Face) es limitada o nula.
- La licencia MIT permite uso comercial, pero al no existir un artefacto descargable, su aplicabilidad práctica es nula.
- Riesgo de alucinación o comportamiento impredecible: sin datos de entrenamiento ni validación, no se puede garantizar ningún tipo de fiabilidad.
- La fecha de creación (2026) y la ausencia de actividad sugieren que el proyecto puede estar inactivo o ser una propuesta teórica sin implementación funcional.

## Enlaces

- Hugging Face: https://huggingface.co/jlietz93/FUM
- Repositorio GitHub (FullyUnifiedModel): https://github.com/justinlietz93/FullyUnifiedModel
- Repositorio GitHub (FUM_Void-Intelligence-Theory): https://github.com/justinlietz93/FUM_Void-Intelligence-Theory
- Colección de modelos de jlietz93 en Hugging Face: https://huggingface.co/collections/jlietz93/video-models y https://huggingface.co/collections/jlietz93/research-models
