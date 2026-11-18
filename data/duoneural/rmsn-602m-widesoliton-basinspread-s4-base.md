# DuoNeural/RMSN-602M-WideSoliton-BasinSpread-s4-Base

## Resumen

RMSN-602M-WideSoliton-BasinSpread-s4-Base es un modelo de lenguaje recurrente desarrollado por DuoNeural Lab bajo la familia RMSN (Recurrent Momentum Soliton Network). Se trata de un modelo port-hamiltoniano con topología de solitones discretos, una arquitectura que se aleja del transformer convencional y que el autor describe como capaz de hacer seguir la fase topológica mediante el exponente de Lyapunov. El modelo tiene 602,4 millones de parámetros, una dimensión de 1792, profundidad de 16 y 64 slots.

Este checkpoint concreto es una semilla de documentación (seed 4) dentro de la "wave107", un experimento que estudia las cuencas de atracción global del entrenamiento. Según la model card, las arquitecturas con D entre 1664 y 1792 muestran cuencas globalmente atractivas, de modo que la mayoría de semillas aleatorias convergen a una topología casi óptima (dispersión de 1,95 puntos CoT entre 5 semillas), mientras que D=2048 presenta cuencas "riddled" con dispersión de 2,87 puntos CoT. El modelo se publica como base, sin ajuste fino de instrucciones ni de chat.

La relevancia de este modelo es fundamentalmente de investigación: explora si las redes recurrentes con estructura hamiltoniana y dinámica de solitones pueden ofrecer una alternativa estable y energéticamente fundamentada a los transformers, y documenta empíricamente el fenómeno de las cuencas de atracción en función del ancho del modelo. No obstante, la información pública disponible es muy escasa y no incluye datos de benchmarks, idiomas ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Recurrent Momentum Soliton Network (RMSN), port-hamiltoniana con topologia de solitones discretos |
| Parametros totales | 602,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2,1 GB en PyTorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en una red recurrente denominada Recurrent Momentum Soliton Network, formulada como sistema port-hamiltoniano con topología de solitones discretos. La dimensión es D=1792, con 16 capas de profundidad y 64 slots. El autor indica que el exponente de Lyapunov sigue la fase topológica del sistema, lo que sugiere un mecanismo de estabilidad dinámica ligado a la formulación hamiltoniana. No se detalla en la información disponible el mecanismo de atención, el esquema de recurrencia exacto ni cómo se realiza la predicción de tokens.

El entrenamiento consta de 75.000 pasos y alcanza una pérdida de validación de 4,7101 (perplejidad aproximada de 111,1). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste instructivo. Este checkpoint pertenece a la "wave107" y documenta la dispersión de cuencas de atracción entre semillas: para D=1792 la dispersión es de 1,95 puntos CoT en 5 semillas, frente a 2,87 puntos CoT para D=2048. No se aportan más innovaciones técnicas (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto autoregresiva como modelo base de lenguaje (sin ajuste instructivo documentado).
- Razonamiento y modelado de lenguaje de propósito general, a evaluar empíricamente dado que no hay benchmarks publicados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- No se documentan capacidades de visión, audio ni modo "thinking".
- Interés específico en investigación: dinámica recurrente port-hamiltoniana y análisis de cuencas de atracción.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas para estudiar si la formulación port-hamiltoniana con solitones ofrece estabilidad de entrenamiento y convergencia reproducible entre semillas, gracias a la documentación de la dispersión de cuencas (1,95 puntos CoT en D=1792).
- Estudio de cuencas de atracción y sensibilidad a la inicialización: al ser una semilla documentada de la wave107, permite reproducir y comparar el comportamiento de convergencia frente a otras semillas y anchos (D=1664-1792 frente a D=2048).
- Experimentos de modelado de lenguaje a escala media (~600 M de parámetros): útil para validar pipelines de entrenamiento y evaluación en entornos con recursos limitados antes de escalar a modelos mayores.
- Análisis de dinámica de sistemas recurrentes: la relación entre el exponente de Lyapunov y la fase topológica permite estudiar estabilidad y caos en redes neuronales recurrentes.
- Base para ajuste fino experimental: al publicarse como modelo base con licencia Apache 2.0, puede servir de punto de partida para tareas downstream en laboratorio, siempre que se valide su calidad con evaluaciones propias.
- Reproducibilidad de resultados de laboratorio: el checkpoint permite a otros grupos verificar las afirmaciones sobre convergencia y pérdida de validación (4,7101) documentadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado es la pérdida de validación de 4,7101 (perplejidad aproximada de 111,1) tras 75.000 pasos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 602,4 M de parámetros en fp16 requiere aproximadamente 1,2 GB solo para pesos, más memoria para activaciones y estados recurrentes; en fp32 serían unos 2,4 GB. Estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque no se ha verificado compatibilidad ni rendimiento.
- Cabe en GPU de consumo: probablemente sí por tamaño de parámetros, pero no confirmado por el autor.
- Opciones de despliegue: no disponible. La librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser un transformer estándar es poco probable que estos motores lo soporten sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia (RMSN) ni alternativas recurrentes port-hamiltonianas con las que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no está diseñado para uso conversacional directo ni para seguir instrucciones.
- Perplejidad de validación elevada (≈111,1), lo que sugiere una calidad de modelado de lenguaje limitada en comparación con modelos de tamaño similar bien entrenados; no hay benchmarks que permitan confirmarlo.
- Ausencia total de datos sobre idiomas, dataset de entrenamiento, tokens vistos y contexto máximo, lo que impide evaluar su cobertura lingüística y sus límites de ventana.
- Riesgo de alucinación no cuantificado; al ser un modelo base, la generación puede ser incoherente o repetitiva.
- Sesgos desconocidos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos del repositorio.
- Ecosistema limitado: al no ser un transformer estándar, la integración con herramientas habituales (vLLM, TGI, llama.cpp) no está garantizada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- Fecha de creación indicada como 2026-11-17, posterior a la fecha habitual de consulta; verificar la vigencia y autenticidad del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-602M-WideSoliton-BasinSpread-s4-Base
- Papers de DuoNeural: referenciados en la model card como "DuoNeural papers", sin enlace directo disponible.
- Cita indicada: DuoNeural Lab. RMSN: Recurrent Momentum Soliton Networks. 2026. (sin URL disponible)
