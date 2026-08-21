# alejomalia/totemheart

## Resumen

Totemheart es un motor de simulación emocional determinista para agentes de IA, desarrollado por AlejoMalia. No es un modelo de lenguaje ni un clasificador de sentimientos, sino un kernel de control que proporciona a un agente un estado interno consistente e inspeccionable a lo largo de una conversación y entre días: personalidad, humor, memoria, estrés, apego, deseo e inferencia social. Estos estados evolucionan mediante dinámicas basadas en teoría de control y neurociencia, en lugar de recalcular cada respuesta a partir de una etiqueta de humor.

El sistema se implementa como un paquete de software en Node.js (versión 0.1.6) y se integra con LLMs externos como Claude, GPT u Ollama. Su relevancia radica en ofrecer continuidad conductual a agentes conversacionales, permitiendo que el mismo insulto tenga un efecto distinto según el contexto previo, que la repetición de afecto produzca reacciones decrecientes, o que el estrés no resuelto baje el umbral de un arrebato. Todo ello es estado computado, inspeccionable y verificable mediante pruebas automatizadas.

El repositorio en HuggingFace no contiene pesos de modelo ni artefactos de aprendizaje automático; es un repositorio de código fuente. La arquitectura subyacente es un sistema de módulos numéricos independientes que interactúan en cadena bajo activación dispersa, con una filosofía explícita de que la experiencia subjetiva queda fuera del diseño (0% por diseño).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de control determinista (módulos numéricos independientes) sobre Node.js; no es un modelo de redes neuronales |
| Parametros totales | no disponible (no es un modelo de pesos) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (depende del LLM externo al que se conecte) |
| Tipos de cuantizacion | no aplica (es código fuente JavaScript) |
| Idiomas soportados | no disponible (el código y la documentación están en inglés; el comportamiento depende del LLM externo) |
| Licencia | MIT (según badge en la model card) |
| Formato de pesos | no aplica (código fuente, paquete npm) |

## Arquitectura y entrenamiento

Totemheart no se entrena en el sentido clásico del aprendizaje automático. Es un sistema diseñado a mano que implementa dinámicas de control y neurociencia: filtrado de Kalman sobre la activación, control PID con anti-windup para necesidades básicas (resistencia, hambre), decaimiento no lineal cúbico (un mayor desplazamiento del punto de equilibrio se restaura proporcionalmente más fuerte), consolidación de memoria estilo REM en tiempos de inactividad, decaimiento de pesos latentes hacia un suelo no nulo, reactivación por solapamiento de tokens, y señal de recompensa mediante error de predicción temporal (RPE = R_t + γ·V(S_t+1) − V(S_t)) con trazas de elegibilidad por relación.

La memoria relacional usa dos acumuladores separados (afinidad y aversión) para representar ambivalencia real, en lugar de promediar a neutral. La respuesta al estrés se modela con carga alostática: la reactividad a entradas negativas aumenta cuanto más tiempo permanece el estrés sin abordarse. El sistema incluye 94 mecanismos verificados, 17 cubiertos y 0 fallidos, según los badges de la model card. No hay datos de entrenamiento con tokens ni procesos de RLHF/DPO.

## Capacidades

- Simulación de estados emocionales persistentes: personalidad, humor, memoria, estrés, apego, deseo e inferencia social.
- Dinámicas de control en tiempo real: cada pico, decaimiento, pull homeostático y fase circadiana interactúa y alimenta la siguiente respuesta.
- Memoria con consolidación estilo REM y reactivación por solapamiento de tokens, en lugar de recuerdo ciego.
- Mecanismos sociales: vínculo, química residual, duelo, secreto e intuición, con activación dispersa.
- Inspección completa del estado: se puede llamar a `getEmotionalState()` en cualquier momento para ver exactamente por qué reaccionó de cierta manera.
- Persistencia mediante `toJSON()` y rehidratación con verificación de ida y vuelta en las pruebas.
- Integración con LLMs externos (Claude, GPT, Ollama, etc.) mediante un proveedor de transformadores opcional.
- No es un generador de texto: no produce lenguaje por sí mismo, sino directivas de estado que un LLM externo convierte en respuestas.

## Casos de uso

- Desarrollo de personajes para videojuegos: un NPC puede mantener un estado emocional coherente a lo largo de múltiples encuentros, reaccionando de forma distinta según el historial de interacciones con el jugador.
- Asistentes conversacionales con continuidad afectiva: un asistente que recuerda el tono de conversaciones anteriores y ajusta su comportamiento sin necesidad de almacenar todo el historial en el prompt.
- Simulación de relaciones para investigación en psicología computacional: el motor permite estudiar cómo emergen dinámicas humanas como el apego, la ambivalencia o el estrés crónico a partir de mecanismos numéricos simples.
- Agentes de rol o compañía: un agente que muestra reacciones emocionales realistas y persistentes, con memoria de eventos pasados y cambios de humor graduales.
- Pruebas de robustez en sistemas de diálogo: al ser determinista y tener 3087 pruebas automatizadas, sirve como banco de pruebas para verificar que un LLM externo respeta directivas de estado complejas.
- Educación en teoría de control aplicada a IA: el código es legible y documentado, útil para enseñar filtrado de Kalman, PID, decaimiento no lineal y error de predicción temporal en un contexto práctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El proyecto no reporta métricas estándar de LLM (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje. En su lugar, la model card documenta una suite de pruebas: 3087 pruebas reales (92 de regresión, 893 de integración, 2029 de propiedades, 49 de plugins, más 63 de rondas de mecanismos dedicadas). Estas pruebas verifican el comportamiento determinista de los mecanismos, no el rendimiento generativo.

## Requisitos de hardware

- No requiere GPU: es un paquete de software Node.js que se ejecuta en CPU.
- Requiere Node.js versión 18 o superior.
- La memoria y el uso de CPU dependen del número de mecanismos activos y de la frecuencia de actualización; no hay datos de consumo específicos en la documentación.
- Para integrarlo con un LLM, se necesita el hardware del LLM externo (por ejemplo, una GPU para inferencia local o una API en la nube).
- Opciones de despliegue: como módulo npm en cualquier servidor Node.js, o embebido en una aplicación existente. No hay soporte nativo para vLLM, llama.cpp u Ollama, aunque se puede conectar a ellos mediante el proveedor de transformadores.

## Comparativa con modelos similares

No disponible. Totemheart no es un modelo de lenguaje y no tiene comparables directos en el ecosistema de modelos de pesos. En el ámbito de simulación emocional, los enfoques típicos se basan en prompt engineering o clasificadores de sentimiento, que carecen de la dinámica de control y la persistencia inspeccionable que ofrece Totemheart. No se han identificado alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por sí mismo. Requiere un LLM externo para producir respuestas, lo que añade latencia y coste.
- No hay evidencia de validación externa: los badges de pruebas son estáticos y actualizados a mano, sin CI configurado. La model card advierte que deben tratarse como una instantánea, no como una garantía en vivo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El sistema está diseñado para simular comportamiento, no para afirmar sentiencia. No debe interpretarse como un modelo con experiencia subjetiva.
- La documentación está en inglés; no hay soporte oficial para otros idiomas en el código.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que indica que es un proyecto incipiente sin adopción comunitaria.
- La fecha de creación (2026-08-21) es posterior a la fecha actual de conocimiento, lo que sugiere que el proyecto es muy reciente o que la fecha es incorrecta.

## Enlaces

- HuggingFace: https://huggingface.co/alejomalia/totemheart
- GitHub: https://github.com/AlejoMalia/Totemheart
- Calibration ledger: https://github.com/AlejoMalia/Totemheart/blob/main/CALIBRATION.md
