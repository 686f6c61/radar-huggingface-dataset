# microduckapp/microduck-tail-chase

## Resumen

microduck-tail-chase es un artefacto de robótica publicado por el usuario microduckapp en HuggingFace, no un modelo de lenguaje. Se trata de una política de control motriz (`policy.onnx`) que reproduce un movimiento concreto y cerrado —denominado "tail chase"— para el robot Microduck, distribuido a través de la app MicroDuck. Según la model card, el robot detecta su propia cola, gira sobre sí mismo persiguiéndola y después invierte el sentido de la rotación. La secuencia tiene una duración fija de 10,7 segundos.

El interes técnico del artefacto está en su interfaz: la política recibe un vector de 61 observaciones y emite 14 consignas articulares ("joint targets") a 50 Hz, es decir, un bucle de control a 20 ms por paso. El repositorio incluye además un `manifest.json` que describe qué necesita el robot para instalar y ejecutar el movimiento, y un vídeo de previsualización. El tamaño del repositorio es de 0,0 GB y el pipeline declarado es `robotics`.

No se dispone de información sobre la arquitectura interna de la red, el número de parámetros, el proceso de entrenamiento ni la licencia. El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado resultados de búsqueda web relevantes: las consultas devolvieron únicamente contenido no relacionado, por lo que todos los datos de esta ficha proceden exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de control robótico exportada a ONNX; no se detalla la topología interna) |
| Parametros totales | no disponible (repositorio de 0,0 GB; no se publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); vector de observación de 61 dimensiones por paso de control, a 50 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el artefacto no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` |

Otros datos técnicos declarados: 14 salidas de consigna articular, frecuencia de control de 50 Hz, duración del movimiento de 10,7 s, pipeline `robotics`, etiquetas `onnx`, `robotics`, `microduck-move` y `region:us`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal: solo se especifica el contrato de entrada/salida (61 observaciones → 14 consignas articulares a 50 Hz) y el formato de serialización (ONNX). No hay información sobre si se trata de un perceptrón multicapa, una red recurrente, un transformer pequeño o una política entrenada por imitación o por refuerzo. Tampoco se indica el número de capas, el tamaño de las capas ocultas ni el régimen de precisión (FP32, FP16, INT8) del grafo exportado.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o episodios, la composición de las observaciones (qué sensores o articulaciones ocupan las 61 dimensiones), el uso de RLHF/DPO —fuera de alcance en este dominio— ni innovaciones técnicas como decodificación especulativa o atención lineal. La única información operativa adicional es la existencia de un `manifest.json` que actúa como descriptor de instalación y reproducción del movimiento dentro de la app MicroDuck, lo que sugiere un formato de empaquetado propietario para políticas de movimiento del robot.

## Capacidades

- Ejecución de una secuencia motriz predefinida de 10,7 segundos de duración para el robot Microduck.
- Control articular de bucle cerrado a 50 Hz: 14 consignas de articulación por paso, con un presupuesto de 20 ms por inferencia.
- Consumo de un vector de observación de 61 dimensiones por paso de control.
- Comportamiento descrito como "persecución de la cola": rotación continua sobre sí mismo y posterior inversión del sentido de giro.
- Distribución mediante la app MicroDuck, con un `manifest.json` que declara los requisitos de instalación y reproducción.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación simbólica.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general o audio.
- No dispone de modo "thinking" ni de mecanismos de cadena de pensamiento.

## Casos de uso

- Demostración de producto en la app MicroDuck: el movimiento sirve como contenido de exhibición para mostrar la expresividad del robot en vídeos y materiales comerciales, usando `media/preview.mp4` como referencia visual del resultado esperado.
- Prueba de extremo a extremo del pipeline de instalación de políticas: el par `manifest.json` + `policy.onnx` permite validar el flujo completo de descubrimiento, descarga, instalación y reproducción de movimientos en la app, sin depender de políticas adicionales.
- Verificación de latencia de inferencia ONNX en el hardware del robot: con un presupuesto estricto de 20 ms por paso a 50 Hz, la política es un caso de prueba útil para medir si el runtime ONNX y la CPU/GPU objetivo sostienen el ritmo de control sin degradación.
- Prueba de regresión del bus de motores y los límites articulares: al emitir 14 consignas articulares conocidas durante 10,7 s, permite comprobar que el robot respeta los rangos de las articulaciones y que no se producen saturaciones ni bloqueos.
- Material educativo en robótica: ejemplo mínimo y autocontenido de política reactiva con contrato de observación/acción explícito, útil para explicar cómo se empaqueta y despliega una política de control en un robot de bajo coste.
- Validación de la cadena simulador → robot real: la secuencia fija y de corta duración facilita comparar la trayectoria articular ejecutada en simulación con la del robot físico y detectar desviaciones de calibración.
- Prueba de seguridad y parada de emergencia: la rotación continua sobre el propio eje es un escenario adecuado para verificar que los mecanismos de aborto, límites de par y vigilancia de corriente actúan correctamente durante un movimiento repetitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen métricas de éxito de la tarea, error de seguimiento articular, robustez ante perturbaciones ni evaluación de transferencia sim2real en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB, lo que sugiere un artefacto de tamaño muy reducido, pero no se publica el tamaño del fichero `policy.onnx` ni su régimen de precisión.
- GPU recomendadas: no disponibles. No se indica si el artefacto está pensado para ejecutarse en CPU integrada del robot, en un SBC o en un acelerador externo.
- Compatibilidad con GPU de consumo: no disponible. Un grafo ONNX de este contrato (61 entradas, 14 salidas) es compatible en principio con cualquier runtime ONNX en CPU, pero no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime es el runtime natural dado el formato de pesos. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: el único requisito publicado es la frecuencia de control de 50 Hz, lo que fija un presupuesto máximo de 20 ms por inferencia incluyendo lectura de sensores, cómputo y envío de consignas. No se publican latencias medidas ni throughput.
- Almacenamiento: el repositorio completo ocupa 0,0 GB según los metadatos, incluyendo el vídeo de previsualización.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos o políticas de la misma categoría (movimientos empaquetados para el robot Microduck) con datos de parámetros, contexto o rendimiento que permitan una comparación cuantitativa. Tampoco se dispone de métricas de referencia de políticas de control robótico comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tail-chase | no disponible | no aplica (61 obs. por paso) | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, redistribución ni modificación del artefacto. Es un bloqueo potencial para cualquier integración en producto.
- Ausencia total de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión pública que permitan inferir calidad o robustez.
- Comportamiento fuera de distribución no caracterizado: al ser una política cerrada para un movimiento concreto, no hay garantías de comportamiento seguro si se ejecuta en condiciones distintas (superficie irregular, robot descalibrado, carga adicional).
- Riesgo físico inherente: el movimiento implica rotación continua sobre el propio eje del robot; sin datos de límites de par, corriente o vigilancia de colisión, debe ejecutarse en un entorno despejado y bajo supervisión.
- Opacidad del contrato de observación: no se documenta qué representa cada una de las 61 dimensiones de entrada, lo que impide validar la política con datos sintéticos o reproducir el pipeline de inferencia fuera de la app MicroDuck.
- Dependencia de la app y del `manifest.json`: el movimiento está diseñado para instalarse y reproducirse mediante la app del fabricante, lo que introduce una dependencia de software propietario no documentada en detalle.
- Documentación mínima: la model card es puramente descriptiva (una frase de comportamiento y una lista de ficheros), sin información de entrenamiento, evaluación ni limitaciones conocidas.
- No aplica la noción de sesgo lingüístico o alucinación al no ser un modelo de lenguaje; el riesgo equivalente es la divergencia entre la trayectoria prevista y la ejecutada.
- Idiomas no aplicables: el artefacto no procesa texto, por lo que la ausencia de dicha información no debe interpretarse como una limitación funcional.
- Fecha de creación en los metadatos (27 de octubre de 2026) posterior a la fecha habitual de consulta: conviene verificar la vigencia del repositorio antes de depender de él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microduckapp/microduck-tail-chase
- Fichero de política: https://huggingface.co/microduckapp/microduck-tail-chase/blob/main/policy.onnx
- Manifiesto de instalación: https://huggingface.co/microduckapp/microduck-tail-chase/blob/main/manifest.json
- Previsualización del movimiento: https://huggingface.co/microduckapp/microduck-tail-chase/blob/main/media/preview.mp4
- Paper, blog o repositorio adicional: no disponible (la búsqueda web no devolvió resultados relevantes sobre este modelo)
