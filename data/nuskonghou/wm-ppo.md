# nuskonghou/wm-ppo

## Resumen

WM-PPO es un conjunto de checkpoints LoRA publicados por el usuario nuskonghou que implementan el metodo descrito en el articulo *Learning to Act with World Models by Valuing What Comes Next* (arXiv:2611.12200). El modelo parte de Qwen/Qwen3-4B-Instruct-2507 y aplica un ajuste fino con PPO (Proximal Policy Optimization) en el que un modelo del mundo predice la siguiente observacion de cada accion candidata y el critico del PPO valora esos sucesores predichos. El resultado es una politica para agentes LLM que toma decisiones en entornos de texto.

La publicacion incluye tres ejecuciones independientes sobre los entornos ALFWorld (iteracion 36), ScienceWorld (iteracion 60) y Sokoban textual (iteracion 36), junto con el calentamiento compartido y el modelo del mundo inicial de cada entorno. En inferencia solo se necesita la politica; el modelo del mundo y el critico se emplean durante el entrenamiento para calibrar los valores de transicion.

Es relevante para investigadores que trabajan en aprendizaje por refuerzo con LLM y agentes basados en texto, ya que propone una via para incorporar la dinamica del entorno al bucle de PPO sin requerir el modelo del mundo en produccion. El repositorio ocupa 9,5 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptadores LoRA y entrenamiento PPO |
| Parametros totales | 4B en el modelo base; el adaptador LoRA anade un numero no disponible de parametros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA via PEFT) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parametros, al que se anaden adaptadores LoRA entrenados con PEFT. El entrenamiento sigue el algoritmo WM-PPO: un modelo del mundo predice la observacion siguiente para cada accion candidata, y el critico de PPO valora esos sucesores predichos. Los valores de transicion calibrados de esta forma mejoran tanto el aprendizaje de la politica como el del critico. En inferencia solo se despliega la politica.

Los checkpoints publicados corresponden a tres entornos: ALFWorld (iteracion 36), ScienceWorld (iteracion 60) y Sokoban textual (iteracion 36). Se incluyen tambien el calentamiento compartido y el modelo del mundo inicial de cada entorno. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF mas alla del propio PPO.

## Capacidades

- Generacion de texto y razonamiento en el marco de tareas de agente sobre entornos textuales.
- Toma de decisiones secuenciales en ALFWorld, ScienceWorld y Sokoban textual.
- Aprendizaje por refuerzo con PPO guiado por un modelo del mundo que valora las consecuencias predichas de cada accion.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (generacion, instrucciones, posible soporte multilingue), aunque no se detallan en la informacion disponible.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion en RL para agentes LLM: reproducir los experimentos del articulo cargando los checkpoints en el repositorio de codigo y evaluando la politica en ALFWorld, ScienceWorld o Sokoban.
- Agentes de resolucion de tareas domesticas simuladas: la politica entrenada en ALFWorld puede emplearse para navegar y manipular objetos en entornos textuales con instrucciones en lenguaje natural.
- Experimentos de ciencia basica simulada: el checkpoint de ScienceWorld sirve para evaluar politicas que realizan experimentos y responden preguntas en un laboratorio textual.
- Planificacion en entornos con estado discreto: el checkpoint de Sokoban textual permite estudiar la resolucion de puzles de empuje de cajas como banco de pruebas de razonamiento secuencial.
- Estudio comparativo de metodos de RL: usar WM-PPO como linea base frente a PPO estandar u otros metodos de aprendizaje de politica con LLM.
- Desarrollo de modelos del mundo para agentes: reutilizar el modelo del mundo inicial incluido en el repositorio para investigar la prediccion de observaciones y la valoracion de transiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base tiene 4B parametros, por lo que en precision completa requiere aproximadamente 8 GB solo para pesos, y menos con cuantizacion (valores no confirmados en la informacion).
- GPU recomendadas: no disponible.
- No se confirma si cabe en GPU de consumo; por el tamano del modelo base (4B) es plausible en GPUs consumer con cuantizacion, pero no hay dato oficial.
- Opciones de despliegue: no disponible; el autor indica cargar los checkpoints en el directorio `weights/` del repositorio de codigo `github.com/nuskonghou/wm-ppo`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WM-PPO (nuskonghou) | 4B (base Qwen3-4B-Instruct-2507) + LoRA | no disponible | RL con PPO y modelo del mundo | Apache 2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 | 4B | no disponible | LLM instructivo general | no disponible en la informacion | Hugging Face |
| Alternativas de agentes RL | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre WM-PPO y otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en tres entornos concretos (ALFWorld, ScienceWorld, Sokoban textual); su comportamiento fuera de ellos no esta documentado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion externa de la comunidad.
- No se han publicado resultados de benchmarks, lo que impide verificar las mejoras frente a PPO estandar.
- No se detallan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507.
- El uso en produccion requiere integrar los checkpoints con el codigo del repositorio y validar los checksums SHA256SUMS; no se documenta un pipeline de despliegue estandar (vLLM, TGI, Ollama).
- El modelo del mundo y el critico se usan solo en entrenamiento; en inferencia solo se necesita la politica, lo que simplifica el despliegue pero limita la funcionalidad a la politica entrenada.

## Enlaces

- Hugging Face: https://huggingface.co/nuskonghou/wm-ppo
- Articulo: https://arxiv.org/abs/2611.12200
- Codigo: https://github.com/nuskonghou/wm-ppo
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
