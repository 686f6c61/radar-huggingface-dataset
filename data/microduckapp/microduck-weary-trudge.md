# microduckapp/microduck-weary-trudge

## Resumen

`microduckapp/microduck-weary-trudge` es una política de control motriz empaquetada en formato ONNX para el robot bípedo MicroDuck, un pequeño robot de 25 cm y código abierto desarrollado por Pollen Robotics y Hugging Face. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general, sino de una "move" (animación motriz preentrenada) que el robot reproduce: una secuencia de 12,2 segundos en la que el autómata camina fatigado, se detiene, se desploma con un suspiro y se arrastra de nuevo hacia delante.

El artefacto lo publica la cuenta `microduckapp` dentro del ecosistema de la app MicroDuck, que distribuye movimientos descargables para el robot. El repositorio es mínimo (0,0 GB): contiene `policy.onnx` (la red que mapea 61 observaciones de entrada a 14 objetivos articulares de salida a 50 Hz), un `manifest.json` con los requisitos de instalación y reproducción, y un vídeo de previsualización en `media/preview.mp4`. La política se ejecuta como controlador de bucle cerrado sobre el hardware real o sobre un simulador compatible.

Su relevancia es acotada pero concreta: sirve como ejemplo real de transferencia sim-to-real de comportamientos expresivos en robótica de bajo coste, y como pieza reutilizable para quien quiera experimentar con el pipeline de movimientos de MicroDuck sin entrenar una política desde cero. La falta de documentación técnica en la model card limita, sin embargo, cualquier evaluación rigurosa de su arquitectura interna o de su calidad de seguimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política de control exportada a ONNX; topología interna no documentada (entrada 61 observaciones, salida 14 objetivos articulares) |
| Parametros totales | no disponible (el repositorio ocupa 0,0 GB, lo que indica un modelo muy pequeño) |
| Longitud de contexto | no disponible (no aplica: es una política de control, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye únicamente como `policy.onnx` |
| Idiomas soportados | no disponible (no aplica: no procesa ni genera texto) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompanado de `manifest.json` y `media/preview.mp4` |
| Frecuencia de control | 50 Hz |
| Dimension de entrada | 61 observaciones |
| Dimension de salida | 14 objetivos articulares |
| Duracion del movimiento | 12,2 segundos |
| Pipeline declarado | robotics |
| Etiquetas | onnx, robotics, microduck-move, region:us |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red: solo especifica el contrato de interfaz (61 observaciones de entrada, 14 objetivos articulares de salida, ejecución a 50 Hz) y el empaquetado en ONNX. Por el contexto de la plataforma, se trata de una política de control entreneada mediante aprendizaje por refuerzo en MuJoCo y exportada para inferencia en el robot, el enfoque que Pollen Robotics y Hugging Face documentan públicamente para MicroDuck. El reducido tamano del repositorio es coherente con una red de pocas capas y miles de parámetros, típica de políticas de locomoción para hardware de bajo coste.

No hay información publicada sobre el número de tokens o episodios de entrenamiento, la composición del dataset, el uso de RLHF/DPO (fuera de lugar en este dominio) ni sobre técnicas concretas como decodificación especulativa o atención lineal. Tampoco se detalla si la política incorpora observaciones propioceptivas, de IMU, de contacto o de consigna de fase temporal dentro de las 61 entradas. Cualquier afirmación al respecto sería especulativa y no se sostiene con la documentación disponible.

## Capacidades

- Reproducción de una secuencia motriz expresiva de 12,2 segundos con cuatro fases narrativas: marcha fatigada, desaceleración hasta parada, desplome con suspiro y arrastre posterior.
- Control de 14 articulaciones del bípedo a 50 Hz en bucle cerrado, a partir de 61 observaciones por paso.
- Ejecución como política de control en el robot MicroDuck real o en simulación compatible con el pipeline de la plataforma.
- Integración con la app MicroDuck mediante `manifest.json`, que declara qué necesita el pato para instalar y reproducir el movimiento.
- Distribución portable en ONNX, lo que permite ejecución con ONNX Runtime en CPU sin dependencias de frameworks de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo fundacional.

## Casos de uso

- Demostraciones de robot social: el movimiento aporta una expresividad narrativa (cansancio, suspiro, arrastre) útil en ferias, presentaciones de producto y vídeos de marketing donde se busca transmitir "personalidad" con hardware de 399 dólares.
- Pruebas de integración del pipeline sim-to-real: sirve como caso de prueba de extremo a extremo para verificar que el flujo de instalación desde `manifest.json`, carga del ONNX y ejecución a 50 Hz funciona antes de desplegar políticas propias.
- Validación de reproducción de movimientos en la app MicroDuck: permite comprobar el comportamiento del reproductor de movimientos descargables (sincronización, transiciones, gestión de parada) sin escribir una política nueva.
- Base para experimentos de reentrenamiento o fine-tuning: al ser un ONNX con interfaz conocida (61→14), se puede usar como referencia de observaciones y acciones al entrenar variantes con MuJoCo y comparar el seguimiento articular.
- Docencia en robótica y aprendizaje por refuerzo: ejemplo compacto de política de control exportada, útil para explicar el contrato observación-acción, la frecuencia de control y el empaquetado de un comportamiento en un artefacto reproducible.
- Pruebas de robustez y estirada de límites mecánicos: las fases de desplome y arrastre someten al bípedo a posturas poco habituales, lo que resulta útil para verificar limites de par, recuperación de pose y comportamiento ante pérdida de equilibrio.
- Evaluación comparativa de movimientos: al convivir con otras "moves" del mismo autor (por ejemplo, `microduck-midnight-snack`), permite comparar consumo, estabilidad y desgaste entre animaciones sobre el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de seguimiento articular, error de posición, tasa de caídas, consumo energetico ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; por el tamano del repositorio (0,0 GB) la política cabe holgadamente en memoria de un microcontrolador o en la CPU del robot.
- GPU recomendadas: no disponible; no se requiere GPU. La inferencia a 50 Hz (paso de 20 ms) con 61 entradas y 14 salidas es viable en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso sin GPU; el cuello de botella es el hardware de control del MicroDuck, no el computo de la red.
- Opciones de despliegue: ONNX Runtime (CPU), otras implementaciones compatibles con ONNX, o el runtime propio de la app MicroDuck descrito en `manifest.json`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: el bucle de control esta fijado a 50 Hz (20 ms por paso), pero no se publican cifras medidas de latencia de inferencia ni de throughput en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-weary-trudge | Movimiento MicroDuck (ONNX) | 61 obs. / 14 articulaciones a 50 Hz | 12,2 s | no disponible | Hugging Face, 0 descargas |
| microduckapp/microduck-midnight-snack | Movimiento MicroDuck (misma familia) | no disponible | no disponible | no disponible | Hugging Face (misma cuenta) |
| Politica de locomocion general de MicroDuck | Politica RL sim-to-real | no disponible | no disponible | no disponible | Documentada en el anuncio de la plataforma, sin ficha tecnica publica |

No se dispone de datos de rendimiento, parametros ni contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparacion se limita, por tanto, a formato, interfaz y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: la model card no detalla arquitectura, datos de entrenamiento, métricas ni proceso de validacion, lo que impide evaluar su calidad antes de desplegarla.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificación; conviene contactar con el autor antes de integrarla en un producto.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso real ni de validacion por terceros.
- Movimiento altamente especifico y de corta duracion (12,2 s); no es una política de locomocion general ni un controlador de proposito multiple.
- Dependencia del hardware objetivo: las 14 salidas articulares estan pensadas para la morfologia del MicroDuck; trasladarlas a otro robot requiere redefinir el espacio de acciones.
- Riesgo de comportamiento no deseado fuera de distribucion: como toda política entrenada en simulacion, puede degradarse ante perturbaciones, fricción o desgaste no modelados; la model card no reporta tasas de caida ni pruebas de robustez.
- Fases de desplome y arrastre pueden implicar contactos no nominales con el suelo y mayor desgaste mecanico o consumo de par en las articulaciones.
- No aplica el riesgo de alucinacion linguistico, pero si el riesgo de desviacion silenciosa del comportamiento esperado sin senal de error explicita.
- Formato ONNX unico: no hay versiones GGUF, safetensors ni pesos de entrenamiento, lo que limita la inspeccion, la edicion y el reentrenamiento directo.
- Fechas de publicacion muy recientes (creado el 27 de octubre de 2026) y ausencia de actualizaciones posteriores; el ecosistema de movimientos puede cambiar sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-weary-trudge
- Cuenta del autor en Hugging Face: https://huggingface.co/microduckapp
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
- Anuncio y analisis en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura en The AI Insider: https://theaiinsider.tech/2026/08/28/hugging-faces-pollen-robotics-releases-small-cute-open-source-microduck-robot/
- Cobertura en TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
