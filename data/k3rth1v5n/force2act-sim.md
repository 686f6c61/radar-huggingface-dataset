# k3rth1v5n/Force2Act-Sim

## Resumen

Force2Act-Sim es un conjunto de políticas de control robótico entrenadas para cinco tareas de manipulación con contacto intensivo (contact-rich manipulation) del benchmark Force2Act-Bench, ejecutado sobre el simulador Genesis. Lo desarrolla el autor independiente k3rth1v5n y se publica bajo licencia MIT. El modelo aborda el problema del control de fuerza en robótica manipulativa, donde las políticas puramente cinemáticas fallan al no modelar las fuerzas de contacto.

El repositorio contiene seis checkpoints: una política global de fuerza por cada una de las cinco tareas (pivot_block, push_box, bottle_wiping, plug_insertion_round y plug_insertion_usb), con pesos EMA tras 60 épocas de entrenamiento, y un modelo unificado denominado Mixture of Force Experts (MoFE) que cubre las cinco tareas con un único conjunto de pesos. Cada carpeta incluye model.safetensors y config.yaml.

La relevancia del modelo radica en su enfoque de flow matching combinado con una mezcla de expertos especializados por régimen de contacto (pushing, sticking, sliding, insertion), que aprende leyes de fuerza explícitas. El tamaño del repositorio es de 6,1 GB, aunque no se detallan el número de parámetros ni la longitud de contexto, ya que no es un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de flow matching con Mixture of Force Experts (MoFE); no disponible el detalle de la red troncal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE de parámetros) |
| Longitud de contexto | no disponible (no aplica; modelo de robótica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | MIT |
| Formato de pesos | safetensors (con config.yaml por carpeta) |

## Arquitectura y entrenamiento

La arquitectura se basa en flow matching para generar acciones de control, con una variante de mezcla de expertos (Mixture of Force Experts, MoFE) que especializa submodelos según el régimen de contacto físico: pushing, sticking (dos expertos), sliding (tres expertos) e insertion. Cada experto aprende una ley de fuerza normal en newtons: el experto de pushing produce 6,11 N constantes; sticking 1 y 2 modelan relaciones lineales con la fuerza tangencial (5,80·Ft + 1,19 y 7,51·Ft + 1,97 respectivamente); sliding 1, 2 y 3 producen 9,35 N, 5,99 N y 16,14 N; e insertion modela 1,55·|F⊥| + 7,73. Esta estructura permite que el modelo unificado (MoFE) cubra las cinco tareas con un solo checkpoint.

Los datos de entrenamiento corresponden a las cinco tareas simuladas de Force2Act-Bench en Genesis. Las políticas por tarea se entrenaron durante 60 épocas y se publican con pesos EMA. No se especifican el número de tokens, la composición del dataset ni si se emplearon RLHF o DPO, ya que no es un modelo generativo de texto. La innovación técnica principal es la descomposición explícita de las leyes de contacto en expertos interpretables, lo que aporta cierta transparencia sobre el comportamiento de fuerza aprendido.

## Capacidades

- Control de fuerza en tareas de manipulación con contacto intensivo: pivoteo de bloques, empuje de cajas, limpieza de botellas e inserción de conectores (redondo y USB).
- Políticas especializadas por tarea con pesos EMA tras 60 épocas.
- Modelo unificado MoFE que cubre las cinco tareas con un único conjunto de pesos.
- Aprendizaje de leyes de fuerza interpretables por régimen de contacto (pushing, sticking, sliding, insertion).
- Integración con el paquete force2act y el CLI force2act-bench para evaluación en el simulador Genesis.
- API de Python mediante Force2ActAgent.from_pretrained para cargar políticas desde Hugging Face.
- No dispone de tool calling, capacidades de agente multi-paso, multilingües ni de visión/audio, al ser un modelo de control robótico.

## Casos de uso

- Evaluación de referencia en Force2Act-Bench: cargar cada política con force2act-bench --task <tarea> para reproducir las tasas de éxito publicadas (93,8 % de media sobre 305 ensayos) y comparar nuevas propuestas contra una línea base sólida.
- Investigación en control de fuerza: usar las leyes de contacto aprendidas por MoFE (por ejemplo, la relación lineal de sticking 1: 5,80·Ft + 1,19) para analizar cómo el modelo adapta la fuerza normal a la tangencial en distintos regímenes.
- Desarrollo de políticas multitarea: emplear el checkpoint MoFE como punto de partida para un único controlador que cubra las cinco tareas, reduciendo la necesidad de mantener cinco políticas separadas.
- Pivoteo de bloques en entornos simulados: desplegar la política pivot_block (93,3 % de éxito) como base para tareas de reorientación de objetos que requieren control fino de fuerza.
- Inserción de conectores: usar plug_insertion_round (96,0 %) y plug_insertion_usb (76,0 %) para estudiar los cuellos de botella en tareas de inserción de alta precisión, donde la política USB muestra el rendimiento más bajo.
- Limpieza y empuje de objetos: aprovechar bottle_wiping (98,0 %) y push_box (100 %) como políticas de referencia para tareas de contacto sostenido y empuje controlado.
- Integración en pipelines de simulación: conectar Force2ActAgent con Genesis para generar trayectorias de fuerza en experimentos de sim-to-real antes de transferir a hardware físico.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Force2Act-Bench (tasas de éxito sobre el protocolo completo de 305 ensayos):

| Tarea | Tasa de éxito |
|---|---|
| Block pivoting | 93,3 % |
| Press-push box | 100 % |
| Bottle wiping | 98,0 % |
| Round plug | 96,0 % |
| USB plug | 76,0 % |
| Media | 93,8 % |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 6,1 GB e incluye seis checkpoints, por lo que el requisito por checkpoint es sustancialmente menor, pero no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: paquete Python force2act (instalación vía pip desde el repositorio de GitHub) y CLI force2act-bench; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoría (políticas de manipulación con contacto intensivo) ni datos de rendimiento de alternativas.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en simulación (Genesis); no se aportan evidencias de transferencia sim-to-real.
- La tarea de inserción USB muestra un rendimiento notablemente inferior (76,0 %) frente al resto, lo que indica fragilidad en ese régimen de contacto.
- No se documentan sesgos, pero al ser un modelo de control físico, sus leyes de fuerza están ajustadas a las condiciones del simulador y pueden no generalizar a otras dinámicas o materiales.
- No se especifican el número de parámetros, la arquitectura troncal ni los datos de entrenamiento, lo que limita la reproducibilidad y la evaluación de riesgos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las dependencias del paquete force2act.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de la comunidad.
- No aplica el riesgo de alucinación textual, pero sí el riesgo de fallo silencioso en control físico si se despliega fuera del dominio simulado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k3rth1v5n/Force2Act-Sim
- Repositorio del paquete force2act: https://github.com/k3rth1v5n/Force2Act
