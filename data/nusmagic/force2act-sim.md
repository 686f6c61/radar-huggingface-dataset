# NUSMAGIC/Force2Act-Sim

## Resumen

Force2Act-Sim es un conjunto de políticas de control robótico entrenadas para cinco tareas simuladas de manipulación con contacto intensivo (contact-rich manipulation), publicado por el grupo NUSMAGIC. El modelo resuelve el problema del control de fuerza en tareas donde el robot debe mantener contacto físico con objetos —empujar, insertar, limpiar o pivotar—, un escenario donde las políticas puramente visuales o de imitación suelen fallar por no modelar explícitamente las fuerzas de interacción. La relevancia actual reside en que combina flow matching con una arquitectura de mezcla de expertos de fuerza (Mixture of Force Experts, MoFE) que aprende leyes de contacto interpretables.

El repositorio contiene seis conjuntos de pesos en formato safetensors: cinco políticas globales de fuerza, una por tarea (`pivot_block`, `push_box`, `bottle_wiping`, `plug_insertion_round`, `plug_insertion_usb`), más un modelo MoFE único que cubre las cinco tareas. Cada carpeta incluye además un `config.yaml`. El tamaño total del repositorio es de 6,1 GB y la licencia es MIT.

No se dispone de información sobre el número de parámetros, la arquitectura interna de la red ni la longitud de contexto, ya que la model card no los detalla y el modelo no es un modelo de lenguaje. Los resultados reportados en Force2Act-Bench (Genesis) alcanzan un 93,8 % de éxito medio sobre 305 ensayos completos del protocolo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control robótico con flow matching y Mixture of Force Experts (MoFE); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE en el sentido de parámetros activos; MoFE es una mezcla de expertos de fuerza) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.yaml` por carpeta) |

## Arquitectura y entrenamiento

Force2Act-Sim se compone de políticas entrenadas mediante flow matching para generar acciones de control de fuerza. La innovación principal es la Mixture of Force Experts (MoFE): un único modelo que integra varios expertos especializados en distintos regímenes de contacto (empuje, adherencia, deslizamiento e inserción), cada uno con su propia ley de contacto aprendida. Las políticas globales por tarea corresponden a los pesos EMA tras 60 épocas de entrenamiento.

Las leyes de contacto aprendidas por MoFE son explícitas y cuantificables: empuje con fuerza normal de 6,11 N; dos modos de adherencia con 5,80·F_t + 1,19 y 7,51·F_t + 1,97; tres modos de deslizamiento con 9,35 N, 5,99 N y 16,14 N; e inserción con 1,55·|F_⊥| + 7,73. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en robótica). El entrenamiento se realizó sobre el simulador Genesis dentro del benchmark Force2Act-Bench.

## Capacidades

- Control de fuerza en tareas de manipulación con contacto intensivo: pivoteo de bloques, empuje de cajas, limpieza de botellas e inserción de conectores redondos y USB.
- Generación de acciones mediante flow matching condicionadas por el estado del robot y las fuerzas de contacto.
- Mezcla de expertos de fuerza (MoFE) que selecciona o combina regímenes de contacto según la fase de la tarea.
- Políticas por tarea independientes, además de un modelo unificado para las cinco tareas.
- Integración con el entorno de benchmark Force2Act-Bench mediante el comando `force2act-bench --task <tarea>`.
- Carga directa como agente mediante `Force2ActAgent.from_pretrained` desde Hugging Face.
- No dispone de capacidades de generación de texto, visión, tool calling, agentes conversacionales ni multilingüismo.

## Casos de uso

- **Automatización de ensamblaje con inserción de conectores**: la política `plug_insertion_usb` y `plug_insertion_round` permite a un brazo robótico alinear y insertar conectores aplicando la ley de inserción aprendida (1,55·|F_⊥| + 7,73), útil en líneas de montaje electrónico donde el control de fuerza evita dañar los pines.
- **Manipulación de objetos en almacén**: `push_box` logra un 100 % de éxito en el empuje de cajas, adecuado para tareas de clasificación y desplazamiento de paquetes en entornos logísticos simulados antes del despliegue real.
- **Tareas de limpieza robótica**: `bottle_wiping` (98,0 % de éxito) sirve para validar estrategias de fregado con contacto mantenido, aplicable a robots de servicio doméstico o industrial que requieren presión constante sobre superficies.
- **Manipulación diestra de objetos rígidos**: `pivot_block` (93,3 %) permite rotar bloques mediante contacto controlado, relevante en investigación de destreza robótica y en tareas de reorientación de piezas.
- **Entrenamiento y evaluación en simulación con Genesis**: el paquete `force2act[bench]` permite reproducir el protocolo completo de 305 ensayos para comparar nuevas políticas frente a las publicadas, como baseline en investigación académica.
- **Modelo unificado multi-tarea con MoFE**: el experto `mofe` permite desplegar un solo modelo para las cinco tareas, reduciendo la complejidad de mantenimiento en un pipeline robótico que alterne entre empuje, inserción y limpieza.
- **Investigación en leyes de contacto interpretables**: las relaciones fuerza normal/fuerza tangencial aprendidas pueden analizarse para diseñar controladores clásicos híbridos o para validar modelos físicos de fricción.

## Benchmarks y rendimiento

Resultados sobre Force2Act-Bench (Genesis), tasas de éxito sobre el protocolo completo de 305 ensayos:

| Tarea | Tasa de exito |
|---|---|
| Block pivoting (`pivot_block`) | 93,3 % |
| Press-push box (`push_box`) | 100 % |
| Bottle wiping (`bottle_wiping`) | 98,0 % |
| Round plug (`plug_insertion_round`) | 96,0 % |
| USB plug (`plug_insertion_usb`) | 76,0 % |
| Media | 93,8 % |

No se han publicado en la información disponible comparaciones con otros modelos en la misma tabla de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 6,1 GB en safetensors, por lo que un solo conjunto de pesos (una tarea) es sustancialmente menor y probablemente quepa en GPUs de consumo, aunque no se confirma el tamaño por política.
- GPU recomendadas: no disponibles en la información proporcionada; al tratarse de una política de control robótico, no requiere necesariamente GPUs de datacenter como A100 o H100, pero no se especifica.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (6,1 GB) sugiere que un subconjunto de pesos podría ejecutarse en tarjetas con 8-16 GB, sin dato oficial.
- Opciones de despliegue: paquete `force2act` instalable desde el repositorio de GitHub (`pip install "force2act[bench] @ git+https://github.com/k3rth1v5n/Force2Act"`), con CLI `force2act-bench` y API `Force2ActAgent`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de control de fuerza con contacto intensivo (por ejemplo, políticas de diffusion policy o ACT) que permitan una comparación rigurosa de parámetros, contexto, rendimiento y licencia. Se indica por tanto: no disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en simulación (Genesis); no se aportan evidencias de transferencia a robots reales (sim-to-real), lo que es un riesgo importante para producción.
- La tarea con peor rendimiento es la inserción USB (76,0 %), con una brecha de 24 puntos frente al resto; no es adecuada para despliegues que exijan alta fiabilidad en esa tarea sin ajuste adicional.
- No se documentan sesgos, pero al ser un modelo de robótica no aplican sesgos lingüísticos; sí puede heredar sesgos de los datos de simulación (geometrías, materiales, fricción).
- Riesgo de fallo en condiciones de contacto no vistas durante el entrenamiento; las leyes de fuerza aprendidas son específicas de las tareas del benchmark.
- No hay información sobre el número de parámetros ni sobre el coste computacional de inferencia, lo que dificulta planificar el despliegue.
- Licencia MIT: permite uso comercial y modificación, pero sin garantías; conviene revisar las dependencias del paquete `force2act` y del simulador Genesis, que pueden tener licencias propias.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/NUSMAGIC/Force2Act-Sim
- Repositorio GitHub del paquete: https://github.com/k3rth1v5n/Force2Act
- No se han encontrado en la información disponible enlaces a papers, blogs, demos ni otros recursos adicionales.
