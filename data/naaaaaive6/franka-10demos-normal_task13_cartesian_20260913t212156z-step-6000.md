# NaaaaaiVe6/franka-10demos-normal_task13_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de política robótica (step 6000) para un brazo Franka, publicado por el usuario NaaaaaiVe6 bajo la librería openpi y etiquetado con la familia pi05. No es un modelo de lenguaje: es un modelo visión-lenguaje-acción (VLA) orientado al control de manipulación, convertido de JAX a PyTorch en bfloat16 manteniendo la configuración de entrenamiento original del modelo Franka. El peso total declarado en safetensors es de 3.616.757.520 parámetros (unos 3,62 mil millones), lo que en bfloat16 ocupa aproximadamente 7,2 GB, coincidiendo con el tamaño del repositorio.

La representación de acciones es cartesiana absoluta (XYZ + cuaternión xyzw + pinza binaria -1/+1) y no deltas de controlador, un detalle crítico para cualquier integración. El modelo produce 50 pasos y 32 coordenadas por inferencia, de las cuales solo las ocho primeras corresponden a acciones del robot (previsiblemente 3 de posición, 4 de orientación y 1 de pinza). El resto de coordenadas no debe interpretarse como acciones.

Por su naturaleza, se trata de un artefacto de investigación muy específico: parece un ajuste fino sobre una única tarea (task13) con diez demostraciones, sin licencia declarada, sin métricas publicadas y con cero descargas. La relevancia aquí no está en el rendimiento demostrado, sino en su valor como pieza reproducible dentro del ecosistema openpi de Physical Intelligence.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; etiquetada como openpi / pi05 (VLA de la familia pi0.5). No confirmado con documentación del autor |
| Parametros totales | 3.616.757.520 (aprox. 3,62 mil millones) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en bfloat16 (sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robótica; no se declara cobertura lingüística) |
| Licencia | No disponible |
| Formato de pesos | safetensors en bfloat16, convertidos desde JAX a PyTorch |
| Representación de acciones | Cartesiana absoluta: XYZ + cuaternión xyzw + pinza binaria (-1/+1). No son deltas de controlador |
| Salida por inferencia | 50 pasos x 32 coordenadas; solo las 8 primeras son acciones del robot |
| Entradas declaradas | Cámaras y estado del robot (detallado en log.txt); requiere assets/franka/norm_stats.json y las transformadas de entrenamiento correspondientes |
| Tamano del repositorio | 7,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (marca temporal futura respecto a la fecha habitual de consulta) |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la model card. La etiqueta pi05 y la librería openpi sitúan el modelo en la línea de políticas VLA de tipo flow matching con un experto de acciones, donde un backbone visión-lenguaje procesa observaciones multimodales y un módulo específico genera secuencias de acciones. Esta descripción es una inferencia a partir de las etiquetas y no está confirmada por el autor en la información disponible.

Lo que sí se declara explícitamente es el proceso de conversión: el checkpoint se pasó de JAX a PyTorch en bfloat16 conservando la configuración de entrenamiento Franka original. El nombre del repositorio indica que el ajuste se hizo con diez demostraciones (10demos) sobre la tarea task13, lo que apunta a un entrenamiento de imitación de muy pocos episodios. El número de paso (6000) sugiere que se trata de un checkpoint intermedio o final de una tirada de entrenamiento corta. No se documentan volumen de datos, composición del dataset, ni uso de RLHF, DPO u optimización por preferencias, algo esperable en este tipo de políticas.

## Capacidades

- Control de manipulación en un brazo Franka mediante políticas de imitación, generando trozos de 50 acciones por inferencia.
- Salida de pose cartesiana absoluta del efector final (XYZ + cuaternión xyzw) más comando binario de pinza (-1/+1).
- Procesamiento multimodal: la model card menciona entradas de cámara y de estado del robot.
- Ejecución de una tarea concreta (task13) tras un ajuste con diez demostraciones.
- No se declara soporte de tool calling, function calling ni orquestación de agentes; es un modelo de política, no un LLM conversacional.
- No se declaran capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproduccion de experimentos en openpi: el checkpoint permite repetir la política entrenada sobre Franka para verificar resultados de conversión JAX a PyTorch y comprobar que la inferencia es coherente con las transformadas originales.
- Evaluacion comparativa de checkpoints intermedios: al ser un step 6000 concreto, sirve para trazar curvas de aprendizaje frente a otros pasos del mismo entrenamiento y detectar sobreajuste con solo diez demostraciones.
- Base para ajuste fino con mas datos: partiendo de este checkpoint es posible continuar el entrenamiento con demostraciones adicionales de la misma tarea para mejorar robustez.
- Pruebas de integracion del stack de control: útil para validar el pipeline completo (cámaras, estado, normalización con norm_stats.json, bucle de control) antes de invertir en políticas mejor entrenadas.
- Analisis de representacion de acciones: dado que la salida es cartesiana absoluta y no deltas, el modelo permite estudiar el comportamiento del controlador ante comandos de pose absoluta y los fallos asociados.
- Docencia y prototipado en laboratorio: escenario de bajo riesgo para que un equipo nuevo aprenda el flujo de trabajo de openpi sin depender de un modelo propietario o con licencia restrictiva.
- Auditoria de artefactos de terceros: al no haber licencia ni validación externa, es un caso útil para practicar la revisión de procedencia, pesos y convenciones antes de incorporar un modelo a un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas. Tampoco hay métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 7,2 GB. Con activaciones, buffers de cámara y el experto de acciones, es razonable reservar entre 10 y 14 GB, aunque no hay mediciones publicadas por el autor.
- GPU recomendadas: A100, H100, L40S o RTX 4090 para inferencia en bfloat16 sin cuantizar.
- GPU de consumo: cabe previsiblemente en RTX 4090, RTX 3090 y RTX 4080 de 16 GB o superiores. En tarjetas de 8-12 GB requeriría cuantización, que no está disponible en el repositorio.
- Opciones de despliegue: el repositorio está pensado para openpi, con pesos PyTorch en safetensors y conversión desde JAX. Herramientas de servido de LLM como vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de política, salvo que se implemente un servidor propio.
- Requisitos adicionales: es imprescindible el archivo assets/franka/norm_stats.json y las transformadas de entrenamiento correspondientes; sin ellos las salidas no son interpretables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de referencia que figuran a continuación provienen de conocimiento general del ecosistema y no de la información proporcionada en esta búsqueda, por lo que deben verificarse antes de usarse. Las celdas no verificadas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (franka-10demos task13, step 6000) | 3,62 mil millones | No disponible | No publicado | No disponible | Repositorio personal en HuggingFace, 0 descargas |
| Politicas openpi / pi0 de Physical Intelligence | No disponible en esta busqueda | No disponible | No disponible | No disponible | Repositorio openpi publico |
| OpenVLA y variantes | No disponible en esta busqueda | No disponible | No disponible | No disponible | Publico en HuggingFace |
| Politicas de manipulacion tipo RT-2 / GR00T | No disponible en esta busqueda | No disponible | No disponible | No disponible | Publico |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable. La diferencia más relevante y verificable es que este checkpoint es un ajuste específico de tarea con diez demostraciones, mientras que los modelos de referencia son políticas generalistas entrenadas con datasets a gran escala.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. No debe asumirse permiso de uso.
- Especificidad extrema: el nombre indica diez demostraciones y una única tarea (task13). La generalización a otras tareas, objetos o posiciones es previsiblemente muy limitada.
- Riesgo alto de sobreajuste: con tan pocos episodios, la política puede memorizar trayectorias y fallar ante variaciones mínimas de iluminación, posición inicial o dinámica del entorno.
- Representación de acciones no estándar: al ser cartesiana absoluta y no deltas de controlador, un uso accidental como deltas puede producir movimientos peligrosos en un robot real.
- Salida parcialmente utilizable: solo 8 de las 32 coordenadas son acciones. Ignorar el resto es obligatorio; malinterpretarlas invalida el control.
- Dependencia de artefactos externos: sin norm_stats.json y las transformadas exactas, las salidas carecen de sentido. El propio autor remite a log.txt para el layout y las convenciones, e indica que algunas convenciones del controlador requieren confirmación.
- Sin validación de la comunidad: cero descargas y cero likes; no hay evidencia independiente de que el checkpoint funcione.
- Procedencia no oficial: la cuenta que publica no es la organización de Physical Intelligence, por lo que no hay garantía de que la conversión JAX a PyTorch sea fiel al modelo original.
- Marcas temporales futuras (creación 2026-09-16) y resultados de búsqueda web no relacionados, lo que dificulta la trazabilidad del artefacto.
- Riesgo de alucinación en el sentido habitual no aplica; el riesgo equivalente es la generación de trayectorias plausibles pero físicamente inviables.
- Advertencia de seguridad: no usar en un robot físico sin validación previa en simulación y sin limitadores de par, velocidad y espacio de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task13_cartesian_20260913T212156Z-step-6000
- Archivo log.txt citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task13_cartesian_20260913T212156Z-step-6000/blob/main/log.txt
- Estadísticas de normalización citadas: assets/franka/norm_stats.json dentro del propio repositorio
- Repositorio openpi (referencia del ecosistema, no enlazado por el autor): https://github.com/Physical-Intelligence/openpi
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a cuestionarios diarios de Bing y se han descartado por no ser pertinentes.
