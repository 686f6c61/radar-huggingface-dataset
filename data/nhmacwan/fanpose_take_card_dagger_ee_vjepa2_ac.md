# nhmacwan/fanpose_take_card_dagger_ee_vjepa2_ac

## Resumen

Este repositorio contiene un predictor condicionado por acciones (action-conditioned predictor) construido sobre un codificador V-JEPA 2.1 ViT-B congelado, desarrollado por el usuario nhmacwan. El objetivo es aprender un modelo del mundo en el espacio de estados de efector final (end-effector) para una tarea bimanual de robótica con brazos SO101, concretamente la tarea "fanpose take-card". El modelo combina un encoder de vídeo de V-JEPA 2.1 con un predictor de 19,7 millones de parámetros y 6 capas, siguiendo la arquitectura oficial del repositorio V-JEPA 2.

El resultado es explícitamente negativo y exploratorio. El autor lo publica por transparencia y reproducibilidad, no como un checkpoint utilizable. El predictor no supera en ningún momento de las 300 épocas de entrenamiento la línea base trivial de copiar el último fotograma, lo que indica que no aprende a predecir el efecto específico de una acción mejor que la hipótesis de que nada cambia.

La relevancia de esta ficha es doble: por un lado, documenta un caso de fallo reproducible en el entrenamiento de modelos del mundo para robótica con pocos datos; por otro, sirve como referencia metodológica sobre cómo evaluar correctamente este tipo de modelos mediante líneas base triviales y pruebas de acciones barajadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ViT-B congelado de V-JEPA 2.1) + predictor action-conditioned de 6 capas |
| Parámetros totales | Predictor: 19,7 M; encoder V-JEPA 2.1 ViT-B congelado (tamaño no especificado en la información disponible) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa pasos de modelo del mundo a 5 Hz) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `best.pt` y `last.pt` (checkpoints PyTorch con `torch.load`, no compatibles con `diffusers`, `transformers` ni `PreTrainedPolicy` de LeRobot) |

## Arquitectura y entrenamiento

El modelo emplea un codificador V-JEPA 2.1 ViT-B congelado (el modelo más pequeño de la familia V-JEPA 2.1) y un predictor condicionado por acciones de 19,7 M de parámetros y 6 capas, tomado sin modificaciones de `src/models/ac_predictor.py` del repositorio oficial de V-JEPA 2. El predictor opera sobre un grid de 8x8 tokens (dim 768) y recibe acciones de 14 dimensiones en el espacio de efector final: para cada brazo (izquierdo y derecho), delta de posición en metros, delta de rotación como vector de rotación relativo verdadero calculado mediante `R_target @ R_state^-1`, y delta de pinza. Los pasos del modelo del mundo son a 5 Hz.

El entrenamiento se realizó sobre el dataset `nhmacwan/lerobot_fanpose_take_card_dagger_ee`, compuesto por 10 episodios de 20 segundos a 30 fps con brazos bimanuales SO101, divididos en 8 de entrenamiento y 2 de validación. Solo se utilizó la cámara `observation.images.left_head`, ya que el layout de tokens del predictor oficial fija exactamente `grid_height * grid_width` tokens de imagen por fotograma y no permite añadir la segunda cámara (`left_side`) sin un tiling espacial fuera del alcance del experimento. La función de pérdida sigue la receta oficial de V-JEPA 2-AC: L1 con teacher forcing más 2 pasos autorregresivos sobre latentes normalizados por layer norm.

## Capacidades

- Predicción de latentes futuros condicionada por acciones en el espacio de efector final para una tarea bimanual concreta.
- Procesamiento de observaciones visuales de una única cámara (`left_head`) con grid de 8x8 tokens.
- Manejo de acciones de 14 dimensiones (posición, rotación relativa y pinza por brazo).
- Evaluación de ranking de acciones (`action_ranking_acc` en torno a 0,88-0,90), lo que indica cierta sensibilidad a la acción ejecutada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento.
- No es un modelo de propósito general: está especializado en una única tarea y un único entorno.

## Casos de uso

- Reproducción de resultados negativos en investigación: sirve como referencia documentada de un fallo de entrenamiento con pocos datos, útil para comparar recetas y evitar repetir errores.
- Estudio de líneas base en modelos del mundo: el código y los logs (`log.jsonl`, `args.json`, `split.json`) permiten analizar cómo se comporta un predictor frente a la línea base trivial de copiar el último fotograma.
- Análisis de representación de acciones: el cálculo de delta de rotación relativo (`R_target @ R_state^-1`) y el ranking de acciones pueden reutilizarse en experimentos metodológicos sobre representación de acciones.
- Docencia y formación: ejemplo concreto de evaluación rigurosa de un modelo del mundo con métricas `tf`, `copy`, `ar` y `shuffled_tf`.
- Punto de partida para experimentos con más datos: el autor indica que podría reentrenarse con sustancialmente más episodios de demostración antes de usarse para planificación o control.
- Referencia de integración con V-JEPA 2: el código `code/model.py` muestra cómo construir el predictor oficial sobre el encoder congelado, reutilizable en otros pipelines de robótica.

## Benchmarks y rendimiento

Resultados reportados por el autor (pérdida L1, menor es mejor):

| Métrica | Mejor época (~29, `best.pt`) | Época final (299, `last.pt`) |
|---|---|---|
| `tf` (predictor, 1 paso) | 0,113 | 0,126 |
| `copy` (predecir "nada cambia") | 0,099 | 0,098 |
| `ar` (autorregresivo) | 0,119 | 0,129 |
| `shuffled_tf` (acciones incorrectas) | 0,124 | 0,137 |
| `action_ranking_acc` | ~0,88 | ~0,90 |

El predictor `tf` nunca supera la línea base `copy` en 300 épocas, y empeora con más entrenamiento (sobreajuste). La señal genuina es que `shuffled_tf` es consistentemente peor que `tf` y que `action_ranking_acc` se sitúa en 0,88-0,90 en lugar de ~0,5, lo que indica que el predictor distingue una trayectoria real de una barajada, pero no predice el efecto de una acción específica mejor que no hacer nada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con un predictor de 19,7 M de parámetros y un encoder ViT-B, la huella es moderada, pero no se especifican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del encoder ViT-B es plausible, pero no se confirma en la información.
- Opciones de despliegue: carga manual con `torch.load` y el constructor `build_predictor()` de `code/model.py`; requiere el repositorio V-JEPA 2 para `src.models.ac_predictor`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni LeRobot `PreTrainedPolicy`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (V-JEPA 2.1-AC, fanpose take-card) | 19,7 M (predictor) + ViT-B congelado | No disponible | `tf` 0,113, no supera baseline `copy` 0,099 | Apache 2.0 | Hugging Face |
| V-JEPA 2-AC oficial (referencia) | No disponible | No disponible | No disponible | No disponible | Repositorio facebookresearch/vjepa2 |
| Intento previo en tarea sim con 45 episodios (mencionado por el autor) | No disponible | No disponible | Mismo modo de fallo, menos severo | No disponible | No disponible |

No se dispone de datos de benchmarks comparables de modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Resultado negativo explícito: el autor advierte que no debe usarse para planificación, control ni como punto de partida preentrenado sin sustancialmente más datos de demostración.
- El predictor `tf` no supera la línea base trivial `copy` en ningún momento del entrenamiento y empeora con más épocas (sobreajuste).
- Dataset muy reducido: 10 episodios de 20 segundos (8 de entrenamiento, 2 de validación), insuficiente para un predictor de 20 M de parámetros entrenado desde cero.
- Una sola cámara: el layout de tokens del predictor oficial impide incorporar la segunda cámara sin tiling espacial.
- Checkpoint no estándar: no es compatible con `diffusers`, `transformers` ni LeRobot `PreTrainedPolicy`; requiere carga manual con `torch.load` y el código de referencia.
- Especialización extrema: una única tarea y un único entorno; no generaliza a otras tareas ni dominios.
- Sin capacidades lingüísticas ni multilingües; los idiomas figuran como no disponibles y no aplican.
- Riesgo de alucinación en el sentido de predicciones plausibles pero incorrectas: el modelo distingue trayectorias reales de barajadas, pero no predice correctamente el efecto de acciones específicas.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja cualquier uso en producción dado el fallo de la comprobación de sanidad.

## Enlaces

- [Hugging Face: nhmacwan/fanpose_take_card_dagger_ee_vjepa2_ac](https://huggingface.co/nhmacwan/fanpose_take_card_dagger_ee_vjepa2_ac)
- [Dataset: nhmacwan/lerobot_fanpose_take_card_dagger_ee](https://huggingface.co/datasets/nhmacwan/lerobot_fanpose_take_card_dagger_ee)
- [Repositorio V-JEPA 2 (facebookresearch/vjepa2)](https://github.com/facebookresearch/vjepa2)
