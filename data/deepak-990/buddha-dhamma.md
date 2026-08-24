# deepak-990/Buddha-Dhamma

## Resumen

Buddha-Dhamma es un modelo de lenguaje especializado en conversación sobre enseñanzas budistas, desarrollado por el usuario deepak-990. Se trata de un fine-tuning del modelo Qwen3-4B-Instruct-2507, convertido a formato GGUF mediante la librería Unsloth para su ejecución eficiente en entornos locales con llama.cpp u Ollama. El modelo cuenta con 4.022.468.096 parámetros (aproximadamente 4 mil millones) y se distribuye únicamente en una cuantización Q4_K_M, lo que lo hace adecuado para hardware de consumo.

La relevancia de este modelo radica en su especialización temática: ofrece una alternativa ajustada para responder preguntas y mantener diálogos sobre el Dhamma (las enseñanzas del Buda), un nicho poco cubierto por los modelos generalistas. Al estar basado en Qwen3, hereda la arquitectura transformer decoder-only de dicha familia, aunque no se especifican detalles adicionales sobre el entrenamiento ni el contexto máximo soportado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo: qwen3-4b-instruct-2507.Q4_K_M.gguf) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar, preentrenado por Alibaba Cloud. Sobre esta base, deepak-990 realizó un fine-tuning con la librería Unsloth, que optimiza el proceso de ajuste mediante técnicas de aceleración y reducción de memoria. El resultado se convirtió a formato GGUF para su uso con llama.cpp y herramientas compatibles.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas más allá del uso de Unsloth para el fine-tuning y la cuantización posterior.

## Capacidades

- Generación de texto conversacional, orientada a responder preguntas y mantener diálogos sobre el Dhamma y enseñanzas budistas.
- Soporte de chat multi-turno gracias a su naturaleza instructiva (basado en Qwen3-Instruct).
- Ejecución local eficiente gracias a la cuantización Q4_K_M, que reduce el tamaño del modelo a aproximadamente 2.5 GB.
- Compatibilidad con llama.cpp y Ollama, lo que permite su despliegue en entornos sin GPU dedicada o con GPUs de gama baja.

No se especifican capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio. Dado que es un modelo de texto puro, se asume que no incluye dichas funcionalidades.

## Casos de uso

- Asistente personal de meditación y estudio budista: el modelo puede responder preguntas sobre conceptos como las Cuatro Nobles Verdades, el Noble Óctuple Sendero o la naturaleza de la mente, ofreciendo explicaciones adaptadas al nivel del usuario.
- Chatbot para comunidades religiosas o centros de retiro: puede integrarse en plataformas de mensajería para ofrecer respuestas inmediatas a dudas frecuentes sobre práctica y doctrina, reduciendo la carga de los instructores humanos.
- Herramienta educativa para cursos de filosofía oriental: los estudiantes pueden interactuar con el modelo para explorar interpretaciones de textos clásicos, aunque con la advertencia de que no sustituye el análisis académico riguroso.
- Generación de contenido para blogs o redes sociales: permite redactar reflexiones, citas o artículos breves sobre temas budistas, siempre que se revise el resultado para evitar imprecisiones.
- Aplicación de diario guiado: el modelo puede plantear preguntas introspectivas basadas en enseñanzas budistas, ayudando a los usuarios a practicar la autoobservación y el mindfulness.
- Prototipo de investigación en humanidades digitales: sirve como base para experimentos sobre procesamiento de lenguaje religioso o comparación de respuestas generadas por IA con textos canónicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este fine-tuning específico. Dado que se basa en Qwen3-4B-Instruct-2507, su rendimiento general será similar al de dicho modelo base, pero no se puede confirmar sin datos propios.

## Requisitos de hardware

- El archivo GGUF Q4_K_M ocupa aproximadamente 2.5 GB, por lo que la VRAM necesaria para inferencia ronda los 3-4 GB, dependiendo del contexto y del backend utilizado.
- Es compatible con GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, RTX 4060, así como con Apple Silicon (M1/M2/M3) mediante llama.cpp.
- También puede ejecutarse únicamente con CPU, aunque con mayor latencia; es viable para uso interactivo en equipos modernos.
- Despliegue recomendado con llama.cpp (comando `llama-cli -hf deepak-990/Buddha-Dhamma --jinja`) o mediante Ollama, que incluye un Modelfile en el repositorio.
- Para servidores con mayor concurrencia, se podría convertir a formatos como AWQ o GPTQ, aunque no se proporcionan dichos archivos.
- La latencia estimada en una GPU de gama media (RTX 3060) sería de 20-40 tokens por segundo, mientras que en CPU pura podría bajar a 5-10 tokens por segundo, siempre dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos especializados en temática budista o espiritual. No se han encontrado modelos equivalentes en el ecosistema open source con la misma especialización y tamaño. Como referencia, se podría comparar con el Qwen3-4B-Instruct-2507 base, pero no se dispone de datos de rendimiento específicos de este fine-tuning.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial y redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Al ser un fine-tuning sin documentación sobre el dataset, existe riesgo de sesgos en las respuestas, especialmente en interpretaciones doctrinales que pueden variar entre escuelas budistas.
- El modelo puede alucinar citas o referencias a textos canónicos, por lo que no debe utilizarse como fuente autoritativa sin verificación humana.
- La longitud de contexto no está documentada; aunque Qwen3-4B-Instruct-2507 soporta hasta 32k tokens (según la versión base), no se confirma que este fine-tuning mantenga esa capacidad.
- No se garantiza la precisión en temas complejos de filosofía budista, y el modelo podría simplificar en exceso o mezclar conceptos de diferentes tradiciones.
- Al ser un modelo pequeño (4B), su capacidad de razonamiento profundo es limitada en comparación con modelos de mayor tamaño, lo que puede afectar a preguntas que requieran análisis matizado.

## Enlaces

- [HuggingFace: deepak-990/Buddha-Dhamma](https://huggingface.co/deepak-990/Buddha-Dhamma)
- [Unsloth (librería de fine-tuning)](https://github.com/unslothai/unsloth)
- [llama.cpp (repositorio de inferencia)](https://github.com/ggerganov/llama.cpp)
