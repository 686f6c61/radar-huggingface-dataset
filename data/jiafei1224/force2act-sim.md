# Jiafei1224/Force2Act-Sim

## Resumen

Force2Act-Sim es un conjunto de políticas de control robótico entrenadas para cinco tareas simuladas de manipulación con contacto rico en fuerza, pertenecientes al benchmark Force2Act-Bench implementado sobre el simulador Genesis. Lo desarrolla el usuario Jiafei1224 y se publica bajo licencia MIT con un repositorio de 6,1 GB en formato safetensors. No es un modelo de lenguaje: es un modelo de robótica (pipeline `robotics`) orientado a generar acciones de control a partir de observaciones y señales de fuerza, usando flow matching como paradigma de generación de acciones.

El paquete incluye cinco políticas globales de fuerza, una por tarea (`pivot_block`, `push_box`, `bottle_wiping`, `plug_insertion_round`, `plug_insertion_usb`), y un modelo unificado denominado Mixture of Force Experts (MoFE) que cubre las cinco tareas con un solo conjunto de pesos. Cada carpeta contiene `model.safetensors` y `config.yaml`, y las configuraciones de las políticas individuales apuntan al experto correspondiente dentro de MoFE.

Su relevancia radica en que aborda un problema clásico y difícil en robótica: el control de contacto en tareas de inserción, empuje, pivoteo y limpieza, donde las señales de fuerza son tan informativas como las visuales. Los resultados reportados en la model card (93,8 % de éxito medio sobre 305 ensayos) sitúan el sistema como una referencia útil para investigar políticas híbridas fuerza-acción en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica con flow matching y mezcla de expertos de fuerza (MoFE); detalles de capas y bloques no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoFE agrega expertos, pero no se publica el recuento) |
| Longitud de contexto | no aplica (modelo de control robótico, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.yaml` por carpeta) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de políticas entrenadas con flow matching, un paradigma generativo que modela un campo de velocidades para producir trayectorias de acción continuas, adecuado para control motor de alta frecuencia. El componente MoFE (Mixture of Force Experts) agrega varios expertos especializados en distintos regímenes de contacto: empuje, adherencia, deslizamiento e inserción. Cada experto aprende una ley de contacto propia expresada como relación entre fuerza normal y fuerza tangencial, lo que sugiere una descomposición explícita del espacio de contacto en modos físicos interpretables.

Los pesos publicados corresponden a las medias exponenciales (EMA) tras 60 épocas de entrenamiento. El entrenamiento se realizó en el simulador Genesis sobre las cinco tareas de Force2Act-Bench. No se especifican en la información proporcionada el número de tokens o muestras de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste por refuerzo o preferencias; estos datos figuran como no disponibles.

## Capacidades

- Generación de acciones de control robótico para manipulación con contacto rico en fuerza en cinco tareas simuladas: pivoteo de bloque, empuje de caja con presión, limpieza de botella, inserción de enchufe redondo e inserción de enchufe USB.
- Control basado en señales de fuerza: las leyes de contacto aprendidas por MoFE modelan fuerza normal en función de la fuerza tangencial o perpendicular según el experto (por ejemplo, inserción con 1,55·|F⊥| + 7,73 N).
- Política unificada multitarea mediante MoFE, además de políticas individuales por tarea.
- Integración con el paquete `force2act` y el ejecutable `force2act-bench` para evaluar cada tarea.
- Carga directa desde Hugging Face mediante `Force2ActAgent.from_pretrained`.
- No se documentan capacidades de tool calling, agentes de lenguaje, multilingüismo, visión, audio ni modo de razonamiento explícito, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en control de contacto: usar las políticas como línea base reproducible en Force2Act-Bench para comparar nuevos métodos de manipulación con fuerza en el simulador Genesis.
- Inserción de precisión en simulación: la política `plug_insertion_usb` sirve para estudiar estrategias de alineación y tolerancia en tareas de inserción con holgura reducida, donde la señal de fuerza es crítica.
- Empuje y pivoteo de objetos: `push_box` y `pivot_block` permiten experimentar con control de fuerza normal en tareas de contacto sostenido y rotación de objetos.
- Limpieza y tareas de frotamiento: `bottle_wiping` es útil para investigar políticas que modulan la fuerza normal durante movimientos repetitivos sobre superficies.
- Evaluación de mezclas de expertos: el modelo MoFE permite estudiar si un único conjunto de pesos puede cubrir varios regímenes de contacto sin degradar el rendimiento frente a políticas especializadas.
- Transferencia sim-a-real como línea de investigación: las leyes de contacto aprendidas (fuerzas en newtons por experto) ofrecen un punto de partida interpretable para analizar qué magnitudes físicas habría que calibrar antes de un despliegue en hardware real.
- Docencia y prototipado rápido: la instalación vía pip y el comando `force2act-bench` facilitan montar un entorno de experimentación en pocos pasos.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre Force2Act-Bench (tasas de éxito sobre el protocolo completo de 305 ensayos):

| Tarea | Tasa de éxito |
|---|---|
| Block pivoting | 93,3 % |
| Press-push box | 100 % |
| Bottle wiping | 98,0 % |
| Round plug | 96,0 % |
| USB plug | 76,0 % |
| Media | 93,8 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 6,1 GB en total, repartido entre seis conjuntos de pesos (cinco políticas y MoFE), por lo que cada política individual es sustancialmente menor que el total.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; al ser un modelo de control robótico de tamaño moderado, es plausible que quepa en GPUs de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: paquete `force2act` (instalación vía pip desde el repositorio de GitHub), comando `force2act-bench --task <tarea>` y API `Force2ActAgent.from_pretrained`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de manipulación con fuerza publicados con métricas sobre el mismo benchmark. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Force2Act-Sim | no disponible | no aplica | 93,8 % medio en Force2Act-Bench | MIT | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación (Genesis); no hay evidencia en la información disponible de validación en robots reales ni de resultados de transferencia sim-a-real.
- El rendimiento es heterogéneo entre tareas: la inserción USB cae al 76,0 % frente al 100 % del empuje de caja, lo que indica mayor dificultad en tareas de tolerancia estrecha.
- No se publican detalles de arquitectura, recuento de parámetros ni composición del dataset, lo que limita la reproducibilidad y la auditoría técnica.
- No se documentan sesgos, pero al ser un modelo de control físico, sus fallos se manifiestan como comportamientos inseguros (fuerzas excesivas, colisiones) más que como sesgos de contenido; requiere límites de par y fuerza en el hardware.
- La licencia MIT permite uso comercial, pero la ausencia de validación en hardware real hace desaconsejable un despliegue en producción sin una evaluación propia y protocolos de seguridad.
- No se especifican requisitos de versión del simulador Genesis ni compatibilidad con otras versiones del paquete `force2act`.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/Jiafei1224/Force2Act-Sim
- Repositorio del paquete Force2Act: https://github.com/k3rth1v5n/Force2Act
- Simulador Genesis: no disponible en la información proporcionada
- Paper de Force2Act-Bench: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
