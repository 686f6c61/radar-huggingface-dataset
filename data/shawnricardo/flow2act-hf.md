# ShawnRicardo/Flow2Act-HF

## Resumen

Flow2Act es un modelo de investigación orientado a la anticipación de movimiento con fundamento geométrico ("geometrically grounded motion anticipation") para tareas de actuación robótica. Lo desarrolla un equipo académico encabezado por Lijun Guo y Haoyu Zhao, con afiliaciones de Wuhan University, The Chinese University of Hong Kong, NIO, University of Hong Kong y Nanjing University. El repositorio de Hugging Face (`ShawnRicardo/Flow2Act-HF`) está publicado por el usuario ShawnRicardo y, en el momento de la consulta, presenta 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que indica que no contiene pesos publicados ni artefactos descargables.

La propuesta técnica que describe la model card se apoya en tres elementos: un historial de decisión disperso ("sparse decision history"), consultas de futuro aprendibles ("learnable future queries") y supervisión de profundidad junto con desplazamientos 2D/3D, todo ello conectado a un "action expert". El objetivo declarado es aprender a actuar anticipando movimiento fundamentado geométricamente, un planteamiento habitual en políticas visomotoras para manipulación robótica.

La relevancia actual del proyecto es principalmente documental y de seguimiento de línea de investigación: no hay pesos, no hay licencia declarada, no hay idiomas declarados y no hay pipeline definido. Cualquier evaluación práctica del modelo queda bloqueada hasta que el autor publique artefactos y documentación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card menciona historial de decisión disperso, consultas de futuro aprendibles y un "action expert"; no se especifica la familia de arquitectura) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio ocupa 0.0 GB; no hay safetensors, GGUF ni checkpoints publicados) |

## Arquitectura y entrenamiento

La model card describe un pipeline con cuatro componentes visibles: un historial de decisión disperso, consultas de futuro aprendibles, supervisión de profundidad y de desplazamientos 2D/3D, y un módulo denominado "action expert". La figura de arquitectura (`assets/pipeline.png`) sugiere un esquema de anticipación de movimiento en el que el modelo predice desplazamientos geométricos y los utiliza para generar acciones. No se especifica si el backbone es un transformer, un modelo híbrido o una arquitectura específica para robótica, ni se detalla el mecanismo de atención.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, el régimen de preentrenamiento ni las innovaciones de decodificación. Tampoco se documentan detalles sobre el espacio de acciones, la frecuencia de control o el tipo de observaciones (RGB, profundidad, propriocepción). Todo ello debe considerarse no disponible.

## Capacidades

- Anticipación de movimiento con fundamento geométrico: la arquitectura descrita predice desplazamientos 2D/3D y profundidad, lo que sugiere capacidades de razonamiento espacial y estimación de movimiento.
- Actuación robótica: la presencia de un "action expert" apunta a la generación de acciones motoras, presumiblemente en entornos de manipulación.
- Historial de decisión disperso: el modelo está diseñado para operar con un historial de decisiones incompleto o submuestreado, lo que puede favorecer el control en tiempo real.
- Consultas de futuro aprendibles: mecanismo para representar estados futuros, orientado a la planificación a corto plazo.
- Generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso y capacidades multilingües: no disponible. No hay evidencia en la información proporcionada de que el modelo soporte estas capacidades.

## Casos de uso

- Investigación en políticas visomotoras: el modelo serviría como base para experimentos de anticipación de movimiento en manipulación robótica, aprovechando la supervisión de profundidad y desplazamientos 2D/3D descrita en la model card.
- Planificación a corto plazo en robótica: las consultas de futuro aprendibles permiten representar estados futuros y podrían emplearse para seleccionar acciones en horizontes cortos, siempre que se publiquen los pesos.
- Control con historial disperso: el diseño con historial de decisión disperso encaja en escenarios donde las observaciones o decisiones previas no están disponibles a alta frecuencia, como sistemas embebidos con limitaciones de ancho de banda.
- Reproducción de resultados académicos: el repositorio y la página del proyecto permiten a otros grupos replicar el pipeline una vez se liberen los artefactos.
- Evaluación comparativa de métodos de anticipación geométrica: el modelo puede servir como referencia en estudios que comparen supervisión de profundidad frente a supervisión puramente visual.
- Integración en simuladores de robótica: el "action expert" podría conectarse a entornos simulados para validar políticas antes de un despliegue físico, condicionado a la disponibilidad de pesos y a la documentación del espacio de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se conocen parámetros ni formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el repositorio no contiene pesos ni configuración de inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas visomotoras con anticipación geométrica) con especificaciones verificables.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene pesos (0.0 GB), por lo que el modelo no es ejecutable tal como está publicado.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; en ausencia de licencia, debe asumirse reserva de derechos por defecto.
- No se declaran idiomas soportados ni pipeline, lo que limita la integración con herramientas estándar de Hugging Face.
- No hay información sobre sesgos, riesgo de alucinación o limitaciones de contexto; al tratarse de un modelo de actuación, los fallos se traducirían en acciones incorrectas en el entorno físico, con riesgos de seguridad asociados.
- No se documentan protocolos de evaluación, lo que impide validar las afirmaciones de la model card.
- La fecha de creación del repositorio (2026-11-16) y la ausencia de descargas o likes sugieren un estado muy temprano de publicación; la información puede cambiar sin previo aviso.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/ShawnRicardo/Flow2Act-HF
- Página del proyecto: https://shawnricardo.github.io/Flow2Act.github.io/
- Código: https://github.com/ShawnRicardo/Flow2Act
- Página personal del primer autor: https://shawnricardo.github.io/
- Página personal del segundo autor: https://maxwell-zhao.github.io/
