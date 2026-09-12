# IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda0

## Resumen

AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda0 es una política de control robótico publicada por el usuario IXDLI en HuggingFace, orientada al agarre de dos contactos. No es un modelo de lenguaje: se trata de un modelo de difusión compuesto por dos expertos entrenados conjuntamente, uno táctil (BEAVER, con ambos anillos) y otro visual, que alimentan un MLP compartido. El enrutado entre expertos se calcula únicamente a partir de las observaciones (latentes `detach(z_B)`, `detach(z_V)` y `q`), sin usar `x_t` ni el paso de difusión `t` como entradas del router.

El modelo se entrena sobre una única tarea denominada cluster9, con un solo GPU, 8 CPU y batch size 32, hasta los 100 000 pasos, con seguimiento en línea en Weights & Biases. El encoder unificado de BEAVER consume 144 bits de contacto estrictos (distancias inferiores a 10 mm) más 9 características de habilitación de sensores, y la validez de un contacto exige estado 5 o 9, distancia finita mayor o igual que cero y compuerta de presencia activa.

Su relevancia es acotada y experimental: el repositorio tiene 0 descargas y 0 likes, no declara licencia, no incluye idiomas ni benchmarks, y su interés se limita a la investigación en fusión táctil-visual para manipulación robótica y al estudio de routers desacoplados en arquitecturas de difusión con múltiples expertos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión con dos expertos (BEAVER táctil y visión) sobre MLP compartido; router basado solo en observaciones (`detach(z_B)`, `detach(z_V)`, `q`); sin GRU |
| Parametros totales | no disponible |
| Parametros activos | no disponible (hay dos expertos y un router, pero no se confirma una arquitectura MoE dispersa ni el reparto de parámetros) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no se declara ventana de contexto ni horizonte de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`library_name: pytorch`), con artefactos y código fuente en `checkpoints/`; se cita `last.pt` como checkpoint final. No se mencionan safetensors ni GGUF |
| Tarea | cluster9 (tarea única de agarre) |
| Entradas | Bits de contacto BEAVER (144, estricto <10 mm), 9 características de habilitación de sensores y observación visual nativa |
| Salidas | Trayectoria de acciones de agarre generada por difusión (no se detalla dimensionalidad) |
| Tamaño del repositorio | 25,2 GB |
| Hash del checkpoint final | `last.pt` SHA-256: `b96f0f6e1e1ab9f762f30da5af564905177bebbf94f59fe08a1420853f8329a7` |

## Arquitectura y entrenamiento

La arquitectura combina dos expertos de difusión entrenados de forma conjunta: uno táctil basado en el encoder unificado BEAVER (que cubre ambos anillos) y otro visual. Las dos observaciones nativas se introducen como entradas independientes en un MLP compartido; el autor indica explícitamente que no se emplea ninguna GRU y que no se utilizan distancias en crudo, sino bits de contacto estrictos. La codificación táctil se construye con 144 bits de contacto (distancia inferior a 10 mm) más 9 características de habilitación de sensores. Un contacto solo se considera válido si cumple tres condiciones simultáneas: estado igual a 5 o 9, distancia finita mayor o igual que cero, y compuerta de presencia activa.

La innovación destacable es el esquema de enrutado: el router es estrictamente dependiente de la observación y utiliza `detach(z_B)`, `detach(z_V)` y `q`, dejando fuera tanto la muestra ruidosa `x_t` como el nivel de ruido `t`. Además, el peso de la pérdida auxiliar de experto es `lambda_expert = 0.0`, por lo que no hay término explícito de equilibrio de carga entre expertos. El entrenamiento se realizó en una sola GPU y 8 CPU con batch size 32, tarea única cluster9, seguimiento en línea con Weights & Biases y finalización a los 100 000 pasos. No se especifican el número de tokens ni episodios, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO (conceptos que, por otra parte, no aplican a una política de control robótico).

## Capacidades

- Generación de acciones de agarre mediante difusión condicionada por observación táctil y visual, orientada a agarres de dos contactos.
- Fusión multimodal táctil-visual: entradas nativas independientes procesadas por un MLP compartido.
- Codificación táctil estructurada: 144 bits de contacto estricto (<10 mm) más 9 características de habilitación de sensores, con reglas explícitas de validez de contacto.
- Enrutado desacoplado por observación: selección de experto basada en los latentes `detach(z_B)`, `detach(z_V)` y `q`.
- Entrenamiento multi-experto conjunto con peso de pérdida auxiliar nulo (`lambda_expert = 0.0`).
- Ejecución de una tarea concreta (cluster9) con un solo GPU y 8 CPU a batch size 32.
- No soporta tool calling ni function calling: no es un modelo de lenguaje ni expone interfaz de texto.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales ni capacidades multilingües.
- No se declaran capacidades de visión general (captioning, VQA), audio, código ni matemáticas; el canal visual se usa como observación de control, no como tarea de percepción abierta.
- No se documenta ningún modo de razonamiento explícito (thinking mode) ni decodificación especulativa.

## Casos de uso

- Investigación en agarre de dos contactos: el modelo sirve como referencia reproducible para estudiar políticas de difusión que requieren contactos estrictos por debajo de 10 mm, gracias a la codificación de 144 bits de contacto y a las reglas de validez (estado 5 o 9, distancia finita y compuerta de presencia).
- Ablación de esquemas de enrutado: la variante `detached-router-lambda0` permite comparar routers que solo ven la observación (`detach(z_B)`, `detach(z_V)`, `q`) frente a routers que incorporan `x_t` y `t`, dentro de una misma tarea cluster9.
- Estudio de fusión táctil-visual: al tratar las dos observaciones nativas como entradas independientes de un MLP compartido, es un banco de pruebas para medir la contribución relativa del canal táctil BEAVER y del canal visual.
- Replicación de experimentos: el repositorio incluye artefactos y código en `checkpoints/` junto con el SHA-256 de `last.pt`, lo que permite verificar la integridad del checkpoint final antes de reproducir el entrenamiento de 100 000 pasos.
- Análisis de robustez ante fallos de sensor: las 9 características de habilitación de sensores y la compuerta de presencia hacen del modelo un caso útil para estudiar el comportamiento de la política cuando parte de los sensores táctiles no está disponible.
- Punto de partida para ajuste fino en manipulación: puede emplearse como inicialización o como baseline en tareas de agarre con configuración sensorial similar a cluster9, siempre que se respeten las convenciones de estado y distancia del encoder BEAVER.
- Docencia y divulgación técnica: como ejemplo compacto de política de difusión multi-experto sobre MLP (sin GRU, sin transformer), resulta adecuado para explicar routers desacoplados y pérdidas auxiliares nulas en cursos de aprendizaje por refuerzo robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito de agarre, métricas de simulación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El autor no publica cifras de memoria ni el tamaño de los tensores del modelo.
- GPU recomendadas: no disponible. La model card solo indica que el entrenamiento se realizó con 1 GPU, sin especificar modelo ni memoria.
- CPU: 8 CPU declaradas para el entrenamiento; no se documentan requisitos para inferencia.
- Tamaño del repositorio: 25,2 GB, que incluye el directorio `checkpoints/` con varios artefactos, por lo que el peso del modelo cargado en memoria puede ser inferior al tamaño total del repositorio (no confirmado).
- ¿Cabe en GPU de consumo? No confirmado. No se publican cifras de VRAM ni el número de parámetros, de modo que no puede afirmarse que quepa en una RTX 4090 u otra GPU de gama de consumo.
- Opciones de despliegue: PyTorch es la única vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso). El seguimiento se realizó con Weights & Biases durante el entrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye métricas ni especificaciones de modelos comparables, y no se han suministrado resultados que permitan situar esta política frente a otras propuestas de agarre táctil-visual. Cualquier comparación numérica exigiría datos que no constan en la model card ni en los resultados de búsqueda, que no contienen referencias técnicas al modelo.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial, modificación ni redistribución; es necesario contactar con el autor.
- Ausencia de benchmarks: no hay evidencia cuantitativa de tasa de éxito, robustez o generalización, ni en simulación ni en robot real.
- Tarea única: el entrenamiento se limita a cluster9, por lo que no hay garantía de transferencia a otras tareas, morfologías, sensores o distribuciones de objetos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de revisión externa o reproducciones independientes.
- Riesgo de colapso de experto: con `lambda_expert = 0.0` no existe término de equilibrio de carga entre los dos expertos, de modo que uno de ellos podría recibir un uso marginal sin que la pérdida lo penalice (observación derivada de la configuración declarada, no medida por el autor).
- Dependencia de convenciones de sensor muy específicas: la validez de contacto exige estado 5 o 9, distancia finita no negativa y compuerta de presencia; cualquier cambio en la semántica de esas señales invalida la codificación de 144 bits.
- Sensibilidad a la calibración: el umbral estricto de 10 mm implica que variaciones en la precisión del sensor táctil pueden alterar los bits de contacto y, con ellos, la política.
- Sin cuantizaciones publicadas: no se ofrecen versiones en FP16, INT8 ni formatos GGUF, lo que dificulta el despliegue en hardware restringido.
- Artefactos sin catalogar: el repositorio pesa 25,2 GB y solo se verifica con hash el archivo `last.pt`; el resto de artefactos de `checkpoints/` no está documentado en detalle.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos de lenguaje, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento, sin métricas publicadas que lo cuantifiquen.
- Idiomas: no procede; el modelo no procesa lenguaje natural.

## Enlaces

- HuggingFace: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-detached-router-lambda0
- Paper: no disponible
- Blog o documentación del autor: no disponible
- Repositorio de código: no disponible (la model card menciona artefactos y código fuente en `checkpoints/`, pero sin enlace externo)
- Demo: no disponible
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relacionado con este modelo; no se han incluido por no ser relevantes.
