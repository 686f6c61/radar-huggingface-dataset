# 3CTeam/fpvla-stage2-827-50k

## Resumen

El modelo 3CTeam/fpvla-stage2-827-50k es un sistema de visión-lenguaje-acción (VLA) desarrollado por el equipo 3CTeam de la Universidad de Tsinghua, especializado en robótica. Se trata de un fine-tuning del modelo base OpenVLA-7B, al que se le añade una capacidad adicional de predicción de trayectorias (trace prediction). El modelo recibe una imagen y una instrucción en lenguaje natural, y genera tanto la acción de control del robot como una trayectoria normalizada de 33 puntos que describe el movimiento esperado.

La relevancia de este modelo radica en su enfoque híbrido: combina la generación de acciones discretas con la predicción de trayectorias continuas, lo que permite una planificación más robusta en tareas de manipulación. Con 7.626 millones de parámetros, se sitúa en la gama de modelos VLA de tamaño medio, adecuado para investigación y aplicaciones de robótica en entornos controlados. La licencia Apache-2.0 facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje-acción) basado en OpenVLA-7B |
| Parametros totales | 7.626.343.875 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en precisión original) |
| Idiomas soportados | No disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de OpenVLA-7B, que combina un codificador de visión SigLIP con un modelo de lenguaje Llama-2-7B. Sobre esta base, se añaden dos cabezas especializadas: una cabeza de acción (Action Head) implementada como MLP para generar comandos de control, y una cabeza de trayectoria (Trace Head) lineal que regresa directamente una secuencia de 33 puntos normalizados (coordenadas x,y) que representan la trayectoria predicha. La inferencia de la trayectoria es determinista, sin muestreo estocástico.

El entrenamiento se realizó mediante fine-tuning supervisado sobre el modelo base, con datos de robótica que incluyen demostraciones de manipulación. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset. La etapa 2 (stage2) sugiere un proceso de entrenamiento en fases, probablemente con una primera etapa de pre-entrenamiento y esta segunda de ajuste fino con 50k ejemplos (según el nombre del repo). No se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de acciones de control para robots manipuladores a partir de imágenes y lenguaje natural.
- Predicción de trayectorias continuas de 33 puntos, lo que permite planificar movimientos suaves y evitar obstáculos.
- Integración de información visual y textual para tareas de manipulación como "coger el objeto rojo" o "apilar los bloques".
- Inferencia determinista para la trayectoria, lo que facilita la reproducibilidad en entornos de evaluación.
- Soporte de ejecución en tiempo real gracias a la arquitectura eficiente de OpenVLA (7B parámetros).
- No se documentan capacidades de tool calling, agentes multi-paso ni soporte multilingüe explícito.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico para realizar tareas de pick-and-place, apilado o ensamblaje, guiado por instrucciones en lenguaje natural y visión en tiempo real.
- Navegación de robots móviles: la predicción de trayectoria permite planificar rutas en entornos conocidos, combinando la percepción visual con la generación de puntos de paso.
- Automatización de tareas industriales: integrado en líneas de producción, puede ejecutar operaciones de clasificación o empaquetado basadas en comandos verbales y visión.
- Investigación en aprendizaje por imitación: sirve como modelo base para estudiar la transferencia de políticas entre entornos simulados y reales, gracias a su capacidad de predecir trayectorias.
- Teleoperación asistida: el modelo puede sugerir trayectorias al operador humano, reduciendo la carga cognitiva en tareas de control remoto.
- Desarrollo de sistemas de interacción humano-robot: permite que un robot entienda instrucciones complejas y ejecute acciones con precisión, útil en entornos educativos o de asistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni evaluaciones específicas de robótica (éxito en tareas, precisión de trayectoria). Se recomienda consultar el repositorio del autor o publicaciones futuras para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 7.626 millones de parámetros. En precisión FP32 (probablemente el formato de los safetensors, dado el tamaño del repo de 30.5 GB), se necesitan aproximadamente 30 GB de VRAM solo para los pesos. Con cuantización a 8 bits se reduce a ~8 GB, y a 4 bits a ~4 GB, aunque no se proporcionan archivos cuantizados oficiales.
- GPU recomendadas: para inferencia en FP32 se requiere una GPU con al menos 32 GB de VRAM, como A100 40GB, A6000 48GB o H100 80GB. Con cuantización a 8 bits, una RTX 4090 (24 GB) sería suficiente.
- En consumer GPU: es posible ejecutar el modelo en una RTX 4090 o similar si se aplica cuantización (por ejemplo, mediante bitsandbytes o GPTQ), aunque no se ofrecen versiones GGUF ni Ollama.
- Opciones de despliegue: el modelo se carga mediante la librería `transformers` con el código personalizado de Prismatic (OpenVLA). Se puede servir con vLLM o TGI si se adapta, pero no hay soporte nativo documentado. Para robótica, se recomienda ejecutar en un entorno con Python y PyTorch.
- Latencia y throughput: no se proporcionan datos. En una A100, se espera una latencia de decenas de milisegundos por paso, pero depende del hardware y la optimización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3CTeam/fpvla-stage2-827-50k | 7.6B | No disponible | VLA (OpenVLA-7B + trace head) | Apache-2.0 | HuggingFace |
| OpenVLA-7B | 7B | No disponible | VLA (SigLIP + Llama-2-7B) | MIT | HuggingFace |
| RT-2 (Google) | 55B | No disponible | VLA (PaLI-X + PaLM) | No abierto | No disponible |

La comparativa se limita a parámetros y arquitectura, ya que no hay datos de rendimiento publicados para el modelo de 3CTeam. OpenVLA-7B es el modelo base y comparte la misma estructura, pero sin la cabeza de trayectoria. RT-2 es un modelo mucho mayor y no está disponible públicamente.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de robótica, puede heredar sesgos de los entornos de entrenamiento (por ejemplo, objetos o escenarios poco representados).
- Riesgo de alucinación en la predicción de trayectorias: el modelo puede generar trayectorias inconsistentes con la física del entorno si la imagen o la instrucción son ambiguas.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de 7B, es probable que tenga una ventana limitada (típicamente 2048 tokens), lo que restringe la cantidad de historial conversacional o instrucciones complejas.
- Idiomas: no se indica soporte multilingüe; es probable que el modelo funcione mejor en inglés, dado que OpenVLA se entrenó principalmente con datos en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe atribuir el copyright y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Para producción, se recomienda validar el modelo en el entorno robótico específico, ya que la generalización a escenarios no vistos puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3CTeam/fpvla-stage2-827-50k
- Modelo base OpenVLA-7B: https://huggingface.co/openvla/openvla-7b
- Página del equipo 3CTeam: https://huggingface.co/3CTeam/models
- Repositorio de OpenVLA (código de Prismatic): https://github.com/openvla/openvla
