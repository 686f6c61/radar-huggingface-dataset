# guilleg003/ppo-Pyramids

## Resumen

`guilleg003/ppo-Pyramids` es un artefacto de entrenamiento de refuerzo publicado en Hugging Face por el usuario guilleg003, correspondiente a la unidad 5 de un curso sobre Unity ML-Agents. No es un modelo de lenguaje ni un modelo fundacional: es una política PPO (Proximal Policy Optimization) con curiosidad intrínseca RND (Random Network Distillation) entrenada sobre el entorno `Pyramids` de ML-Agents, exportada a ONNX para su inferencia en Unity.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, y se creó y actualizó el 21 de noviembre de 2026. El entrenamiento se realizó con Unity ML-Agents 1.1.0, PyTorch 2.2.2, la configuración `PyramidsRND` de Unity y semilla 42, y el ONNX se exportó a los 223 898 pasos.

Su relevancia es exclusivamente didáctica: sirve como ejemplo reproducible de un pipeline de RL con recompensa intrínseca en ML-Agents, pero el propio autor reconoce que el agente todavía no resuelve la tarea de forma fiable. No debe evaluarse como un modelo de propósito general ni utilizarse como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política PPO con red de curiosidad RND (Random Network Distillation) sobre observaciones del entorno ML-Agents; arquitectura de red concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entorno de RL, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos exportados en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportado desde PyTorch 2.2.2) |

## Arquitectura y entrenamiento

El artefacto es una política entrenada con PPO, el algoritmo de optimización de política proximal estándar de ML-Agents, sobre el entorno `Pyramids` de Unity. Incorpora curiosidad intrínseca mediante RND, una técnica que entrena una red predictora para aproximar la salida de una red objetivo fija y usa el error de predicción como recompensa intrínseca, incentivando la exploración en zonas novedosas del espacio de estados. La configuración empleada es la predefinida `PyramidsRND` de Unity ML-Agents 1.1.0.

El entrenamiento se ejecutó con PyTorch 2.2.2 y semilla 42, y el modelo se exportó a ONNX al alcanzar los 223 898 pasos. El último bloque de métricas registrado, correspondiente a los 210 000 pasos, muestra un retorno medio de -1,000 con desviación 0,000. El autor indica explícitamente que el agente no resuelve la tarea de forma fiable y que se incluyen tanto la configuración como el registro íntegro del entrenamiento. No se dispone de información sobre el número de tokens (no aplica), la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control de agente en el entorno `Pyramids` de Unity ML-Agents mediante inferencia ONNX.
- Exploración guiada por recompensa intrínseca RND durante el entrenamiento.
- Exportación reproducible: el ONNX se generó al finalizar la ejecución a los 223 898 pasos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni uso como agente conversacional.
- No tiene capacidades multilingües, de visión, audio ni modo de razonamiento.
- No se han documentado capacidades adicionales más allá del control del entorno citado.

## Casos de uso

- Reproducción didáctica de un pipeline de RL con ML-Agents: permite replicar el entrenamiento con la configuración `PyramidsRND`, semilla 42 y las versiones indicadas (ML-Agents 1.1.0, PyTorch 2.2.2) para comparar curvas de aprendizaje.
- Estudio de recompensa intrínseca RND: sirve como caso base para analizar cómo evoluciona el retorno medio con curiosidad activada en un entorno con recompensa dispersa, dado que el retorno registrado es -1,000 ± 0,000.
- Integración en Unity como política ONNX: el archivo puede cargarse en el runtime de ML-Agents para inspeccionar el comportamiento del agente en el entorno `Pyramids`, sin esperar un rendimiento óptimo.
- Material de docencia para unidades de curso: el repositorio incluye configuración y registro íntegro, lo que facilita explicar el flujo completo de entrenamiento y exportación.
- Punto de partida para ajuste fino: dado que el agente no resuelve la tarea, puede usarse como inicialización para continuar el entrenamiento con más pasos o hiperparámetros distintos.
- Auditoría de reproducibilidad: permite verificar que una ejecución con semilla 42 y las versiones declaradas produce resultados comparables, útil en ejercicios de control de experimentos.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| reinforcement-learning | ML-Agents-Pyramids | Training mean reward | -1,000 +/- 0,000 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se detalla el número de parámetros de la política.
- GPU recomendadas: no disponible; al ser una política pequeña de ML-Agents, es probable que quepa en GPU de consumo, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada por el autor.
- Opciones de despliegue: inferencia ONNX en el runtime de Unity ML-Agents; no se documentan otros backends (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entorno | Licencia | Disponibilidad |
|---|---|---|---|---|
| guilleg003/ppo-Pyramids | Política PPO + RND en ONNX | ML-Agents-Pyramids | no disponible | Hugging Face, 0 descargas |
| Políticas `PyramidsRND` de referencia de Unity ML-Agents | Configuración base del entorno | ML-Agents-Pyramids | según licencia de Unity ML-Agents | Incluidas en el paquete de ML-Agents |
| Otros artefactos PPO de ML-Agents en Hugging Face | Políticas PPO de distintos entornos | Varios | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El agente no resuelve la tarea de forma fiable según el propio autor; el retorno medio registrado es -1,000 ± 0,000.
- No es un modelo de lenguaje: no admite prompts, tool calling, razonamiento ni generación de texto.
- La licencia no está disponible, lo que impide confirmar si se permite uso comercial.
- No se especifican los idiomas ni capacidades multilingües (no aplica).
- El artefacto está ligado a versiones concretas (ML-Agents 1.1.0, PyTorch 2.2.2) y a una semilla (42); cambios de versión pueden alterar la reproducibilidad.
- No hay información sobre sesgos, alucinación o comportamiento fuera del entorno `Pyramids`; el alcance es exclusivamente ese entorno.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- No se han publicado requisitos de hardware ni métricas de latencia, lo que dificulta planificar un despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/guilleg003/ppo-Pyramids
