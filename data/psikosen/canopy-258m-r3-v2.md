# psikosen/canopy-258m-r3-v2

## Resumen

Canopy-258M-R3 v2 es un modelo de lenguaje causal de tipo Mixture-of-Experts recurrente (MoE recurrente), desarrollado por psikosen, con 296.304.390 parámetros totales según el checkpoint en safetensors (la model card declara 258.555.654). Está diseñado para ejecución de alta velocidad en entornos de edge computing, con especialización en razonamiento matemático, síntesis de código Python y uso de navegador como agente web. La versión v2 introduce mejoras en dominio unificado, interacción natural con navegador (trayectorias de ratón Bézier cúbicas, cadencia de tecleo gaussiana, grounding de coordenadas Set-of-Marks) y auditoría visual de capturas de pantalla. Su arquitectura recurrente con routing top-2 entre 8 expertos activa aproximadamente 112 millones de parámetros por token, lo que lo hace eficiente para inferencia en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recurrent Mixture-of-Experts (MoE) causal language model |
| Parámetros totales | 296.304.390 (según checkpoint safetensors); la model card declara 258.555.654 |
| Parámetros activos | ~112 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de Mixture-of-Experts recurrente. Según la model card, se compone de 6 bloques MoE centrales que se ejecutan dos veces, lo que equivale a 18 capas efectivas. El mecanismo de enrutamiento selecciona los 2 expertos más relevantes entre un total de 8 expertos especializados, con un "Tokenwise Thought Bus" que coordina el flujo de información. Esta combinación de recurrencia y sparse MoE permite mantener un coste computacional bajo por token (unos 112 millones de parámetros activos) mientras se conserva una capacidad total de 258 millones de parámetros.

No se han proporcionado detalles sobre los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un "dominio unificado" con equilibrio entre conocimiento factual y ejecución de herramientas, pero no ofrece especificaciones adicionales sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto en inglés, con enfoque en razonamiento matemático y síntesis de código Python.
- Ejecución de herramientas (tool execution) y uso de navegador como agente web, con capacidades de interacción natural: movimientos de ratón con trayectorias Bézier cúbicas, cadencia de tecleo gaussiana y grounding de coordenadas mediante Set-of-Marks.
- Auditoría visual de capturas de pantalla: genera trazas de auditoría paso a paso con retículas de coordenadas (coordinate crosshairs).
- Razonamiento multi-paso para tareas de navegación web, con un 100% de tasa de éxito en el Extended Browser Suite Benchmark (7 modalidades de interacción web).
- Generación de código Python con un 50.0% de tasa de aprobación ejecutada en HumanEval y 100% de sintaxis válida.
- No se indica soporte de visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Automatización de navegación web en entornos edge: el modelo puede controlar un navegador mediante acciones de ratón y teclado realistas, lo que permite automatizar formularios, extracción de datos y flujos de usuario en páginas web sin depender de APIs específicas.
- Generación de código Python en asistentes locales: con un 50% de pass rate en HumanEval y 100% de sintaxis válida, puede integrarse en editores o entornos de desarrollo para sugerir funciones y scripts en tiempo real, incluso en máquinas sin GPU dedicada.
- Razonamiento matemático en dispositivos de bajo consumo: su bajo número de parámetros activos (~112M) permite resolver problemas matemáticos en routers, Raspberry Pi u otros dispositivos de borde.
- Auditoría visual de agentes de navegador: puede generar un registro de auditoría con coordenadas sobre capturas de pantalla, lo que facilita la verificación de que un agente ha realizado las acciones esperadas en una interfaz web.
- Pruebas automatizadas de front-end: la capacidad de generar trayectorias de ratón y tecleo con cadencia realista permite simular interacciones de usuario en pruebas de regresión de interfaces web.
- Asistente conversacional técnico en inglés: gracias a su licencia Apache 2.0 y su tamaño reducido, puede desplegarse en local para responder consultas sobre código o matemáticas sin enviar datos a servicios externos.
- Integración en pipelines de CI/CD para verificación de código: su soporte de tool execution permite ejecutar pruebas o comandos como parte de un flujo de integración continua, aunque se requiere una integración personalizada.

## Benchmarks y rendimiento

La información disponible incluye los siguientes resultados declarados por el autor:

| Benchmark | Resultado |
|---|---|
| HumanEval (pass rate ejecutado) | 50.0% |
| Sintaxis de código (code syntax) | 100% |
| Extended Browser Suite Benchmark | 100% en 7 modalidades de interacción web |

No se han publicado resultados de benchmarks estándar como MMLU, GSM8K o TruthfulQA en la información disponible.

## Requisitos de hardware

- Con 296.304.390 parámetros y un tamaño de repo de 0.6 GB, los pesos probablemente están almacenados en FP16 o BF16, lo que requiere aproximadamente 0.6 GB de VRAM solo para los pesos.
- El modelo está diseñado para edge computing, por lo que puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o inferiores, así como en CPUs con suficiente RAM si se aplica cuantización (aunque no se especifican tipos de cuantización).
- No se han proporcionado datos de latencia ni throughput.
- Opciones de despliegue: Transformers, según la model card. No se documentan otras opciones como llama.cpp u Ollama en la información disponible.

## Comparativa con modelos similares

No se han encontrado comparativas directas con otros modelos en la información proporcionada. La versión anterior, psikosen/canopy-258m-r3, existe en Hugging Face, pero no se dispone de sus especificaciones ni resultados para realizar una comparación detallada.

## Limitaciones y advertencias

- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- La longitud de contexto no está especificada, por lo que se desconoce el comportamiento con entradas largas.
- No se han publicado evaluaciones exhaustivas de sesgos, alucinaciones ni seguridad; al ser un modelo pequeño, es probable que presente alucinaciones en tareas complejas.
- El checkpoint está etiquetado como "custom_code" en Hugging Face, lo que indica que puede requerir código personalizado en Transformers; se debe revisar el código del autor antes de desplegar en producción.
- Los benchmarks declarados (HumanEval, Browser Suite) provienen del autor y no han sido verificados de forma independiente.
- La discrepancia entre los parámetros totales del checkpoint (296.304.390) y los declarados en la model card (258.555.654) debe tenerse en cuenta al estimar el consumo de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/psikosen/canopy-258m-r3-v2
- Versión anterior: https://huggingface.co/psikosen/canopy-258m-r3
