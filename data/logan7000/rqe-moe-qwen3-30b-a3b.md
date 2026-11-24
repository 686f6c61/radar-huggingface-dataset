# logan7000/rqe-moe-qwen3-30b-a3b

## Resumen

RQE MoE Qwen3-30B-A3B es un artefacto de investigación publicado por el usuario logan7000 que aplica una técnica denominada RQE (aparentemente inspirada en teoría de juegos) sobre el modelo Qwen3-30B-A3B congelado. En lugar de un ajuste fino convencional, el autor añade un experto adicional con compuerta (gate) por cada capa MoE del modelo base, sumando 226,6 millones de parámetros entrenables, y entrena ese añadido sobre trazas del solver RQE junto con texto general para la compuerta. El paquete incluye además un control: un LoRA plano de rango 256 (213,9 millones de parámetros) entrenado sobre los mismos datos y el mismo calendario.

El interés del artefacto es metodológico: permite comparar empíricamente la inyección de un experto nuevo en un MoE congelado frente a un adaptador LoRA clásico, con métricas de tasa de aprobado en tareas de juegos y en MATH-500. Los resultados publicados muestran ventajas del experto añadido en varias tareas de juegos (por ejemplo, 97,8% frente a 94,5% en partidas de 7-10 jugadores) pero una caída en MATH-500 respecto al base congelado (79,2% frente a 81,8%).

Se trata de un repositorio de 1,8 GB con pesos en formato propietario (state dict de los módulos añadidos) y con código de carga no publicado todavía, por lo que no es directamente desplegable con las herramientas estándar. La licencia declarada es Apache 2.0, heredada del modelo base Qwen3-30B-A3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3-30B-A3B) con un experto adicional con compuerta por capa MoE |
| Parametros totales | No disponible (modelo base Qwen3-30B-A3B; el añadido suma 226,6M entrenables) |
| Parametros activos | No disponible (heredado del base Qwen3-30B-A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en formato propietario, no GGUF) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | State dict propio (`addon-2000.pt`, `addon-3000.pt`); LoRA plano en `plain-lora-r256/step-2000` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-30B-A3B congelado y le inyecta un experto adicional con compuerta en cada capa MoE. El conjunto de módulos añadidos suma 226,6 millones de parámetros entrenables y se guarda como state dict en formato propio (`addon-2000.pt` y `addon-3000.pt` correspondientes a los pasos 2.000 y 3.000). La compuerta del nuevo experto se entrena con una mezcla de trazas del solver RQE (las mismas usadas en `logan7000/rqe-sft-qwen3-4b-lora`) y algo de texto general. El control es un LoRA de rango 256 con 213,9 millones de parámetros sobre el mismo MoE congelado, con los mismos datos y el mismo calendario de entrenamiento.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. La innovación técnica declarada es el mecanismo de experto añadido con compuerta sobre un MoE congelado, que permite comparar su comportamiento con un adaptador LoRA de capacidad similar. El código de carga de los módulos añadidos forma parte del proyecto del autor y no es público todavía.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-30B-A3B.
- Resolución de juegos de teoría de juegos: juegos entrenados, partidas de 7-10 jugadores, coloreado, hawk-dove-retaliator y battle of the sexes.
- Producción de respuestas cercanas a la uniformidad en escenarios de juego (91,4% en el experto añadido frente a 80,5% en el LoRA).
- Razonamiento matemático evaluado en MATH-500 (79,2% en el experto añadido).
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación sobre arquitecturas MoE: comparar la inyección de un experto nuevo con compuerta frente a un LoRA de capacidad similar sobre un modelo congelado, usando las métricas de aprobado publicadas como referencia.
- Estudio de teoría de juegos aplicada a LLM: evaluar cómo un modelo se comporta en juegos entrenados (99,0% de aprobado) y en juegos no vistos de 7-10 jugadores (97,8%), útil para analizar estrategias emergentes.
- Análisis de calibración y uniformidad de respuestas: el 91,4% de respuestas cercanas a la uniforme en el experto añadido frente al 80,5% del LoRA permite estudiar sesgos de explotación en entornos de juego.
- Reproducción de experimentos de ajuste eficiente: el par experto añadido / LoRA plano con idénticos datos y calendario sirve como banco de pruebas controlado para metodologías de adaptación.
- Evaluación de degradación en matemáticas: la caída de MATH-500 (79,2% frente al 81,8% del base) es un caso de estudio sobre el olvido catastrófico al especializar un MoE.
- Docencia y divulgación: material para explicar cómo funciona una compuerta de experto en un MoE y qué diferencia hay respecto a un adaptador de bajo rango.

## Benchmarks y rendimiento

| Benchmark | Experto añadido (paso 2.000) | LoRA plano (paso 2.000) | Base congelado |
|---|---|---|---|
| Juegos entrenados (tasa de aprobado) | 99,0% | 98,5% | No disponible |
| Partidas de 7-10 jugadores | 97,8% | 94,5% | No disponible |
| Coloreado + hawk-dove-retaliator | 63,5% | 52,8% | No disponible |
| Respuestas cercanas a uniforme | 91,4% | 80,5% | No disponible |
| Battle of the sexes | 28% | 30% | No disponible |
| MATH-500 | 79,2% | 73,4% | 81,8% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base Qwen3-30B-A3B y del formato propietario de los módulos añadidos.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el formato de pesos propio impide el uso directo con llama.cpp u Ollama.
- Opciones de despliegue: no disponible; el código de carga de los módulos añadidos no es público, por lo que vLLM, TGI y llama.cpp no pueden cargarlo sin trabajo de integración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RQE MoE Qwen3-30B-A3B (este) | Base 30B-A3B + 226,6M añadidos | No disponible | Apache 2.0 | State dict propio | Código de carga no público |
| Qwen3-30B-A3B (base) | 30B totales, 3B activos | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Público y desplegable |
| LoRA plano r=256 (control del mismo repo) | 213,9M adaptadores | No disponible | Apache 2.0 | LoRA | Incluido en el repo |

## Limitaciones y advertencias

- Los pesos están en un formato propietario (state dict de los módulos añadidos) y el código de carga no es público, lo que impide el despliegue directo.
- El autor lo declara explícitamente como artefacto de investigación y sin garantía.
- El rendimiento en MATH-500 cae respecto al base congelado (79,2% frente a 81,8%), lo que sugiere pérdida de capacidad general al especializar.
- En battle of the sexes el experto añadido rinde peor que el LoRA (28% frente a 30%), lo que indica que la ventaja no es uniforme entre tareas.
- No se documentan sesgos conocidos, riesgos de alucinación, idiomas soportados ni limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero la falta de código de carga y de documentación de entrenamiento limita la reproducibilidad y la evaluación de riesgos en producción.
- El repositorio no tiene descargas ni likes, y el pipeline no está declarado, por lo que no hay evidencia de uso comunitario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/logan7000/rqe-moe-qwen3-30b-a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Dataset de referencia del autor (trazas RQE): https://huggingface.co/logan7000/rqe-sft-qwen3-4b-lora
