# microduckapp/microduck-head-haywire

## Resumen

microduck-head-haywire es una política de movimiento publicada por microduckapp para el robot bípedo Microduck; no es un modelo de lenguaje ni un modelo generativo de propósito general. El artefacto principal es `policy.onnx`, una red neuronal exportada a ONNX que recibe 61 observaciones por paso de control y emite 14 consignas articulares a 50 Hz, con una duración fija de 10,3 segundos. El movimiento mantiene el cuerpo inmóvil mientras la cabeza ejecuta una secuencia errática que termina con un gesto amplio de «reinicio».

Microduck es una plataforma bípeda de 25 cm, 800 g y 399 USD desarrollada por Pollen Robotics, el brazo de robótica de Hugging Face, y entrenada con aprendizaje por refuerzo en MuJoCo según la información pública del robot. Esta ficha describe una de las 16 políticas `microduck-move` publicadas por el autor, concebidas para instalarse y reproducirse desde la app MicroDuck.

Su interés es doble: ejemplifica la distribución de comportamientos robóticos como artefactos ONNX acompañados de un manifiesto de instalación, y permite evaluar el pipeline de despliegue y transferencia sim-to-real del ecosistema Microduck sin entrenar una política propia. No se dispone de licencia, idiomas ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal exportada a ONNX; topología interna (capas, tipo de red) no disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; 61 observaciones por paso de control |
| Tipos de cuantización | No disponible; solo se publica el artefacto ONNX sin variantes cuantizadas declaradas |
| Idiomas soportados | No disponible; no aplica a un modelo de control motor |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto de instalación (`manifest.json`) |
| Entrada | 61 observaciones por paso |
| Salida | 14 objetivos articulares |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,3 s (aproximadamente 515 pasos de control) |
| Pipeline declarado | Robotics |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto publicado es una política neuronal en formato ONNX. No se documenta el número de capas, el tipo de red —MLP, transformer u otra—, el número de parámetros ni la función de pérdida. La interfaz sí está especificada: 61 entradas, 14 salidas de objetivo articular y una frecuencia de 50 Hz, lo que implica unos 515 pasos de control para los 10,3 segundos de movimiento. Tampoco se detalla la composición de las 61 observaciones: no se indica si incluyen posiciones articulares, velocidades, datos de IMU, fase temporal u otras señales.

No se especifica si esta política concreta se entrenó con aprendizaje por refuerzo, imitación o animación por keyframes. La información pública del programa Microduck indica que el robot se entrena con aprendizaje por refuerzo en MuJoCo y que los comportamientos se transfieren a hardware real, pero esta ficha no puede confirmar que `head-haywire` siga exactamente ese procedimiento. No se publican curvas de entrenamiento, composición del dataset, procesos de RLHF/DPO —no aplicables a este tipo de modelo— ni métricas de transferencia sim-to-real.

## Capacidades

- Reproducción de una coreografía fija de 10,3 segundos: el cuerpo permanece estable y la cabeza ejecuta una secuencia de movimiento errático seguida de un gesto final de reinicio.
- Control motor de 14 articulaciones o objetivos articulares a partir de 61 observaciones, con una frecuencia de 50 Hz.
- Inferencia portátil mediante ONNX, ejecutable con ONNX Runtime en CPU o GPU.
- Instalación y reproducción desde la app MicroDuck a través de `manifest.json`.
- Inclusión de un vídeo de previsualización (`media/preview.mp4`) para verificar el comportamiento antes de desplegarlo.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio ni capacidades multilingües.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo reactivo ni adaptativo: la secuencia está fijada por la política y no se describe ningún mecanismo de condicionamiento a instrucciones externas.

## Casos de uso

- Demostración de expresividad robótica: el movimiento sirve como ejemplo de comportamiento no locomotor para presentaciones, ferias y vídeos de producto del robot Microduck, aprovechando su duración corta y su efecto visual reconocible.
- Prueba de humo del pipeline de instalación: al incluir `manifest.json`, permite verificar de extremo a extremo el flujo de instalación, carga y reproducción de políticas en la app MicroDuck antes de desplegar comportamientos más complejos.
- Validación sim-to-real de la cadena de control de cabeza y cuello: investigadores pueden comparar la ejecución de la política en simulación y en hardware para detectar discrepancias en los 14 objetivos articulares y en la respuesta a 50 Hz.
- Docencia en robótica y control: la interfaz 61→14 y el formato ONNX facilitan explicar en un laboratorio cómo se estructura una política de control, cómo se inspecciona con ONNX Runtime y cómo se integra en un robot real.
- Test de regresión de la app y del runtime: al ser un artefacto pequeño y de duración fija, puede usarse como caso de prueba para comprobar que una actualización de ONNX Runtime o de la app MicroDuck no rompe la reproducción de movimientos existentes.
- Producción de contenido audiovisual: el vídeo de previsualización y la secuencia de 10,3 s permiten grabar material promocional o educativo sin necesidad de desarrollar una política nueva.
- Investigación en comparación de políticas: puede servir como línea base de comportamiento fijo frente a políticas generativas o condicionadas por instrucciones, siempre que se documenten las condiciones de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Resultado |
|---|---|
| Tasa de éxito del movimiento | No disponible |
| Error de seguimiento articular | No disponible |
| Métricas de transferencia sim-to-real | No disponible |
| Latencia real de inferencia | No disponible; el presupuesto de control a 50 Hz es de 20 ms por paso |
| Throughput requerido | 50 inferencias por segundo |
| Comparación con otras políticas | No disponible |

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,0 GB) y el formato ONNX, la inferencia está pensada para ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se requieren. Cualquier CPU moderna con ONNX Runtime debería ser suficiente; una GPU solo aportaría margen si se ejecutan varias políticas en paralelo, extremo no documentado.
- ¿Cabe en GPU de consumo? Sí, con enorme holgura, pero su uso es innecesario para este artefacto.
- Opciones de despliegue: ONNX Runtime y la app MicroDuck mediante `manifest.json`. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia: el bucle de control exige 50 Hz, es decir, 20 ms por paso. No se publica la latencia real medida en el robot.
- Throughput: 50 inferencias por segundo como requisito derivado de la frecuencia de control.
- Almacenamiento: el repositorio ocupa 0,0 GB, por lo que el espacio necesario es mínimo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Duración | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-head-haywire | Política de movimiento ONNX | 61 observaciones / 14 objetivos articulares | 50 Hz | 10,3 s | No disponible | Hugging Face, 0 descargas, 0 likes |
| microduck-midnight-snack | Política de movimiento de la misma familia | No disponible | No disponible | No disponible | No disponible | Hugging Face, mismo autor |
| Otras políticas `microduck-move` del autor | Políticas de movimiento para Microduck | No disponible | No disponible | No disponible | No disponible | 16 modelos publicados según la página del autor |
| Políticas de locomoción entrenadas con RL en MuJoCo | Control robótico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos públicos comparables de parámetros, contexto, rendimiento o licencia para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso para uso comercial, redistribución o modificación. Es el principal riesgo para producción.
- El movimiento es fijo y no reactivo: no se adapta a obstáculos, instrucciones de usuario ni cambios del entorno.
- Dependencia de la morfología Microduck: la política está diseñada para un robot concreto de 25 cm y 800 g; no se documenta su robustez frente a cambios de hardware, firmware o calibración.
- Interfaz rígida: exige exactamente 61 observaciones y produce 14 objetivos articulares a 50 Hz. Cualquier cambio en el vector de observaciones o en el orden de las articulaciones puede invalidar el movimiento.
- Sin métricas de transferencia sim-to-real publicadas: se desconoce la fidelidad del comportamiento en hardware real frente a simulación.
- El nombre y la descripción describen una cabeza que «se vuelve completamente loca»; no se documentan límites de par, protección térmica ni márgenes de seguridad para los actuadores de cabeza y cuello.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento.
- Dependencia de la app MicroDuck y de `manifest.json`: cambios en el formato del manifiesto o en la versión de ONNX Runtime pueden romper la instalación.
- No es un modelo de lenguaje: no tiene contexto textual, idiomas, alucinaciones lingüísticas ni sesgos de ese tipo; sus riesgos son de control físico y de seguridad del robot.
- No se documentan procesos de evaluación de seguridad, certificación ni pruebas de estrés de los actuadores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/microduckapp/microduck-head-haywire)
- [Página del autor microduckapp en Hugging Face](https://huggingface.co/microduckapp)
- [MarkTechPost: Hugging Face presenta Microduck, un bípedo open source de 399 USD y 25 cm](https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/)
- [PCMag: Meet Microduck, a $399 Open-Source Robot That Can Learn New Tricks](https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks)
- [The AI Insider: Hugging Face's Pollen Robotics releases Microduck](https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/)
- [Tech360: Hugging Face unveils Microduck](https://www.tech360.tv/hugging-face-unveils-microduck-new-open-source-biped-ai-robot-2026-31-08)
