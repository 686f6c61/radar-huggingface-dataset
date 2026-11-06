# GeertWang/starvla-pipette-aim-wrist1031-pi05-base

## Resumen

starvla-pipette-aim-wrist1031-pi05-base es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario GeertWang en Hugging Face. Se trata de un ajuste fino por imitación (behavior cloning) del modelo base PI0.5 (identificado en la model card como `tenstep/pi_model_starvla pi05_base_starvla` en fp32) para una tarea muy concreta: el paso 3 de una tarea de pipeteo con un robot Unitree G1 equipado con manos Inspire, consistente en apuntar la pipeta de la mano derecha hacia el tubo de la mano izquierda.

El modelo emplea un esquema de flow matching para predecir velocidades de acción, con pérdida MSE ponderada por fotograma (peso 1 para datos autónomos, 2 para datos humanos y 0 para fotogramas enmascarados). Los datos provienen de 230 episodios de entrenamiento y 38 de validación recogidos mediante HG-DAgger (intervención humana sobre política autónoma), sin teleoperación, con vistas ego, FOCUS y muñeca izquierda, además de la velocidad de muñeca medida como estado.

Es relevante como ejemplo de flujo de trabajo de ajuste fino de VLA sobre un modelo base para manipulación fina, pero conviene subrayar que el autor indica explícitamente que el modelo solo se ha evaluado offline y nunca se ha ejecutado sobre un robot real. El repositorio ocupa 8,3 GB y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA derivada de PI0.5 (modelo base `pi05_base_starvla`, fp32); predicción de velocidades por flow matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, aparentemente fp32 según el modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pi05/checkpoints/steps_14352_pytorch_model.pt`) |
| Libreria | starvla |
| Tarea | Behavior cloning, robot Unitree G1 con manos Inspire |
| Entradas | Vistas ego + FOCUS + muñeca izquierda, más velocidad de muñeca medida como estado |
| Salida | Acciones (velocidades) para el control del robot |
| Tamano del repositorio | 8,3 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base PI0.5 (`pi05_base_starvla` en fp32) y se ajusta con todos los parámetros entrenables. La formulación es de flow matching: la red predice velocidades de acción y se optimiza con un error cuadrático medio ponderado por fotograma, con pesos automáticos de 1 para fotogramas autónomos, 2 para fotogramas humanos y 0 para fotogramas enmascarados. No se emplea aprendizaje por refuerzo.

Los datos de entrenamiento consisten en 230 episodios de entrenamiento y 38 episodios de validación recogidos con HG-DAgger (sin teleoperación), con 114.830 anclas de entrenamiento. Cada episodio se corta antes de la fase de extracción de la pipeta, por lo que el modelo no se entrena en esa fase. La receta de entrenamiento usa batch de 128 (4 × 16 × acumulación 2), learning rate de 5e-5 con decaimiento coseno hasta 1e-6 y 10 épocas; los números de paso indicados son micro-pasos. El checkpoint seleccionado es `steps_14352_pytorch_model.pt`, elegido sobre el mismo conjunto de validación con el que se evalúa, lo que el propio autor advierte que hace las métricas ligeramente optimistas.

## Capacidades

- Control visomotor para una tarea de manipulación fina: apuntar una pipeta sostenida en la mano derecha hacia un tubo sostenido en la mano izquierda en un Unitree G1 con manos Inspire.
- Política de imitación entrenada con datos de intervención humana (HG-DAgger), lo que permite aprender de correcciones humanas sobre la política autónoma.
- Fusión de múltiples vistas: vista ego, vista FOCUS y vista de muñeca izquierda.
- Uso de estado propioceptivo: velocidad de muñeca medida como entrada adicional.
- Predicción de acciones mediante flow matching (velocidades), no clasificación discreta de acciones.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural, al tratarse de un modelo específico de robótica.
- No se documentan capacidades multilingües ni de visión general fuera del dominio de la tarea.

## Casos de uso

- Investigación en manipulación fina con VLA: servir como punto de partida reproducible para estudiar ajuste fino de PI0.5 sobre tareas de precisión con robots humanoides, usando el checkpoint y la receta documentada.
- Aprendizaje por intervención humana (HG-DAgger): el modelo ilustra cómo combinar datos autónomos y humanos con ponderación por fotograma para corregir una política base en una subtarea concreta.
- Benchmark interno de políticas de imitación: las métricas offline sobre 480 muestras retenidas permiten comparar variantes de la misma receta (vistas, pesos, número de pasos) antes de desplegar en hardware.
- Prototipado de flujos de pipeteo en laboratorio: base para experimentar con el paso 3 de una secuencia de pipeteo antes de integrar la política completa en un pipeline de laboratorio automatizado.
- Estudio de selección de checkpoint y sobreajuste: el caso documenta explícitamente la elección del checkpoint sobre el mismo holdout de evaluación, útil como ejemplo didáctico de buenas y malas prácticas en validación.
- Integración en la librería starvla: sirve como ejemplo de configuración (`config.yaml`) para entrenar y evaluar políticas VLA con esa librería, ajustando las rutas de `base_vlm` y tokenizer a copias locales.

## Benchmarks y rendimiento

El autor publica únicamente métricas offline sobre 480 muestras retenidas (38 episodios), sin ejecución en robot:

| 480 muestras retenidas | Todos los 38 episodios | Fotogramas humanos | Fotogramas autónomos | 12 primeros | 12 últimos |
|---|---|---|---|---|---|
| Este checkpoint | 0,0176 | 0,0316 | 0,0080 | 0,0375 | 0,0099 |
| Referencia "hold still" (repetir la primera fila objetivo) | 0,0149 | no disponible | no disponible | 0,0278 | 0,0089 |

La referencia "hold still" obtiene un error menor que el checkpoint en el agregado y en los tramos inicial y final, lo que el autor reconoce implícitamente al presentar ambas filas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 8,3 GB y el modelo base se describe en fp32, pero no se detalla el número de parámetros ni el consumo real.
- GPU recomendadas: no disponible. Al tratarse de un modelo derivado de PI0.5 en fp32, es previsible que requiera GPU de datacenter (A100, H100) para inferencia cómoda, pero esta estimación no está confirmada en la información proporcionada.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería indicada es `starvla`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El autor advierte que `config.yaml` contiene rutas de la máquina de entrenamiento (`base_vlm` / tokenizer) que deben apuntarse a copias locales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| starvla-pipette-aim-wrist1031-pi05-base | no disponible | no disponible | Manipulación fina (pipeteo) en Unitree G1 | no disponible | Hugging Face, 0 descargas |
| PI0.5 base (`tenstep/pi_model_starvla pi05_base_starvla`) | no disponible | no disponible | VLA generalista base | no disponible | Referenciado en la model card |
| Otras políticas VLA open source (p. ej., OpenVLA, RT-2) | no disponible en la información | no disponible | Manipulación robótica general | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a la relación de derivación respecto al modelo base PI0.5.

## Limitaciones y advertencias

- El modelo no se ha ejecutado nunca sobre un robot real; todas las métricas son offline y el autor lo advierte explícitamente.
- El checkpoint se seleccionó sobre el mismo holdout con el que se evalúa, por lo que las puntuaciones son ligeramente optimistas.
- La referencia "hold still" supera al checkpoint en el error agregado (0,0149 frente a 0,0176), lo que cuestiona la ventaja práctica de la política aprendida en esta subtarea.
- El modelo solo se ha entrenado para el paso 3 de la tarea de pipeteo y no para la fase de extracción, que queda fuera del conjunto de datos.
- Dominio muy restringido: un robot concreto (Unitree G1), unas manos concretas (Inspire) y una tarea concreta; no se documenta generalización a otras tareas, objetos o morfologías.
- Licencia no disponible: no puede confirmarse el uso comercial ni la redistribución.
- Idiomas no disponibles: no se documentan capacidades lingüísticas.
- El archivo `config.yaml` contiene rutas absolutas de la máquina de entrenamiento que deben reconfigurarse antes de usar el modelo.
- No se documentan sesgos, tasas de alucinación ni comportamientos de seguridad en entornos reales; al ser un modelo de control robótico, cualquier despliegue físico requiere validación y medidas de seguridad adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeertWang/starvla-pipette-aim-wrist1031-pi05-base
- Modelo base referenciado en la model card: `tenstep/pi_model_starvla` (checkpoint `pi05_base_starvla` en fp32); no se proporciona URL directa en la información disponible.
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
