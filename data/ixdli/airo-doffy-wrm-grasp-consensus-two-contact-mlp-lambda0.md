# IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-lambda0

## Resumen

AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-lambda0 es un modelo de aprendizaje por imitación para robótica, publicado por el usuario IXDLI en HuggingFace bajo la etiqueta de pipeline `robotics`. No es un modelo de lenguaje: se trata de una política de agarre (grasp policy) basada en difusión que genera acciones de manipulación a partir de dos expertos entrenados conjuntamente, uno denominado BEAVER (codificación de contactos en ambos anillos) y otro de visión. El modelo resuelve el problema de decidir puntos de agarre y verificar el contacto físico durante la manipulación, un paso crítico en tareas de pick-and-place y ensamblaje automatizado.

La arquitectura combina un codificador BEAVER unificado que trabaja con 144 bits estrictos de contacto de menos de 10 mm más 9 características de habilitación de sensores, y un experto de visión. Ambas observaciones nativas se inyectan como entradas independientes en una MLP compartida; no se emplea ninguna GRU ni distancias crudas. El enrutado conjunto ordinario utiliza `router + vis + q`, con un peso de pérdida auxiliar de experto fijado en `lambda_expert=0.0`. El repositorio ocupa 25,2 GB e incluye los artefactos y el código fuente en el directorio `checkpoints/`.

El entrenamiento se realizó sobre una única tarea (`cluster12`), con 1 GPU, 10 CPU, tamaño de lote de 32 y seguimiento en línea mediante Weights & Biases, finalizando a los 100 000 pasos. Su relevancia actual es la de servir como referencia reproducible para investigación en políticas de difusión aplicadas a agarre con contacto multimétodo, aunque carece de benchmarks publicados, licencia declarada y descripción de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión con dos expertos entrenados conjuntamente (BEAVER de contacto + visión), codificador BEAVER unificado y MLP compartida; sin GRU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE; usa dos expertos de difusión con MLP compartida) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; no se documenta ventana de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, es un modelo de robótica sin interfaz de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); se cita `last.pt` con SHA-256 `432e4e44bd56c40b66ef20c8459a4d1df49331390702e38d77907dbbb969b809` |

## Arquitectura y entrenamiento

La arquitectura se articula en torno a dos expertos de difusión entrenados de forma conjunta: BEAVER, que consume la señal de contacto de ambos anillos, y un experto de visión. El codificador BEAVER unificado trabaja con 144 bits de contacto estrictos de menos de 10 mm y 9 características de habilitación de sensores. Un contacto se considera válido únicamente si su estado es 5 o 9, la distancia es finita y mayor o igual que cero, y se cumple la puerta de presencia (*presence gate*). Las dos observaciones nativas se introducen como entradas independientes en una MLP compartida, y el diseño descarta explícitamente el uso de GRU y de distancias crudas.

El modelo emplea un enrutado conjunto ordinario con `router + vis + q` y un peso de pérdida auxiliar de experto de `lambda_expert=0.0`. El entrenamiento se limitó a una sola tarea (`cluster12`) durante 100 000 pasos, con un tamaño de lote de 32 sobre 1 GPU y 10 CPU, y con registro en línea en Weights & Biases. No se especifican en la información disponible el número de tokens o muestras, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en el sentido habitual de los modelos de lenguaje).

## Capacidades

- Generación de acciones de agarre mediante un proceso de difusión con dos expertos entrenados conjuntamente.
- Codificación de contacto de alta precisión: 144 bits de contacto estrictos de menos de 10 mm por anillo, más 9 características de habilitación de sensores.
- Validación formal del contacto basada en estado (solo 5 o 9), distancia finita no negativa y puerta de presencia.
- Condicionamiento por visión: el experto visual aporta información del entorno como segunda observación nativa.
- Consenso entre dos puntos de contacto (variante *consensus two-contact*) para tareas de agarre bilateral.
- Fusión multimodal de observaciones independientes en una MLP compartida, sin recurrencia (sin GRU).
- Soporte de *tool calling* o *function calling*: no aplica.
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplica.
- Capacidades multilingües: no aplica.
- Modos especiales (modo *thinking*, audio, etc.): no disponible.

## Casos de uso

- Pick-and-place industrial: la política genera comandos de agarre condicionados por visión y por la lectura de contacto de ambos anillos, lo que permite verificar que la pieza está sujeta antes de moverla.
- Selección y colocación en logística (bin picking): el consenso entre dos puntos de contacto ayuda a elegir agarres estables en objetos apilados o parcialmente ocluidos.
- Manipulación con sensores táctiles: los 144 bits de contacto de menos de 10 mm permiten explotar matrices táctiles de alta resolución para detectar contactos puntuales y evitar fuerzas excesivas.
- Ensamblaje de precisión: la validación estricta de contacto (solo estados 5 y 9, distancia finita y puerta de presencia) reduce falsos positivos de sujeción en inserciones con tolerancias estrechas.
- Investigación reproducible en políticas de difusión: al publicar los artefactos, el hash SHA-256 del checkpoint y la configuración de entrenamiento, sirve como línea base reentrenable para comparar variantes de expertos y pérdidas auxiliares.
- Evaluación de robustez de agarre bilateral: la variante *consensus two-contact* permite estudiar cómo se comporta la política cuando solo uno de los dos contactos es válido.
- Integración en bucles de control robótico: al ser un modelo PyTorch sin dependencias de servidores de inferencia de lenguaje, puede cargarse directamente en el nodo de control del robot junto al *driver* de los sensores.
- Análisis de ablación de `lambda_expert`: con el valor fijado en 0.0, este checkpoint permite medir el efecto de desactivar la pérdida auxiliar de experto frente a otras configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo documenta la configuración de entrenamiento (tarea `cluster12`, 1 GPU, 10 CPU, lote de 32, 100 000 pasos, seguimiento en línea con W&B) y el hash del checkpoint, sin métricas de éxito de agarre, tasas de colisión ni comparaciones cuantitativas.

## Requisitos de hardware

- El repositorio completo ocupa 25,2 GB, incluyendo artefactos y checkpoints; el tamaño individual de `last.pt` no está disponible.
- Entrenamiento documentado: 1 GPU, 10 CPU y tamaño de lote de 32 durante 100 000 pasos.
- VRAM estimada para inferencia: no disponible (no se publican cifras oficiales).
- GPU recomendadas: no disponible; el entrenamiento se realizó con una única GPU sin especificar modelo.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de una política basada en MLP y no de un modelo de lenguaje de gran tamaño, es plausible que quepa en GPU de consumo, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: PyTorch nativo, cargando los checkpoints del directorio `checkpoints/`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos cuantitativos verificables en la información proporcionada para establecer una comparativa con alternativas de la misma categoría (políticas de difusión para agarre robótico). La model card no incluye métricas de rendimiento, número de parámetros ni referencias a líneas base.

| Modelo | Parametros | Contexto/observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-lambda0 | no disponible | 144 bits de contacto + 9 features de sensor + vision | no disponible | no disponible | HuggingFace, repo de 25,2 GB |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal hasta que el autor lo aclare.
- No se han publicado benchmarks ni métricas de éxito de agarre, de modo que no es posible estimar su rendimiento real en producción.
- El entrenamiento se limitó a una única tarea (`cluster12`), lo que limita la generalización a otros objetos, entornos o configuraciones de sensor.
- El modelo depende de un formato de observación muy específico: 144 bits de contacto de menos de 10 mm por anillo, 9 características de habilitación y contactos válidos solo con estado 5 o 9. Cualquier sensor que no produzca exactamente ese formato requerirá adaptación.
- Riesgo de alucinación en el sentido de políticas que generan acciones plausibles pero inviables: en robótica esto se traduce en agarres fallidos o colisiones, por lo que se recomienda validación física y límites de fuerza externos.
- No se documentan sesgos del dataset, composición de los datos ni procedencia de las demostraciones, lo que impide evaluar sesgos sistemáticos hacia ciertos objetos o posiciones.
- Sin soporte de lenguaje, tool calling ni razonamiento simbólico: no puede integrarse como agente conversacional ni interpretar instrucciones en texto.
- La fecha de creación y actualización indicada en HuggingFace es 2026-09-10, lo que conviene verificar antes de tomar decisiones de producción.
- El repositorio es grande (25,2 GB) para tratarse de una política de agarre, lo que puede encarecer el almacenamiento y la distribución en flotas de robots.
- No se documentan requisitos de VRAM, latencia ni throughput, datos imprescindibles para planificar un despliegue en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/AIRO-Doffy-WRM-Grasp-consensus-two-contact-mlp-lambda0
- Artefactos y código fuente: directorio `checkpoints/` dentro del repositorio del modelo
- Checkpoint `last.pt` (SHA-256): `432e4e44bd56c40b66ef20c8459a4d1df49331390702e38d77907dbbb969b809`
- No se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la búsqueda web realizada; los resultados devueltos corresponden a páginas corporativas de Microsoft y no guardan relación con el modelo.
