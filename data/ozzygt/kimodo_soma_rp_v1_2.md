# OzzyGT/Kimodo_SOMA_RP_v1_2

## Resumen
Kimodo_SOMA_RP_v1_2 es una conversión a Diffusers del modelo NVIDIA Kimodo SOMA RP v1.2, orientado a generación de movimiento humano 3D condicionada por texto. No es un modelo de lenguaje general: es un pipeline de texto-a-movimiento que incorpora un codificador de texto basado en Meta Llama 3 8B Instruct y adaptadores LLM2Vec, junto con los pesos de movimiento de Kimodo. El autor de la conversión es OzzyGT y el modelo se publica con licencias combinadas de NVIDIA y Meta.

El modelo resuelve la generación de clips cortos de movimiento a partir de prompts en inglés, con salida sobre el esqueleto SOMA77, unidades en metros, root motion preservado y una duración de ejemplo de 120 fotogramas, equivalentes a 4 segundos a 30 FPS. Su relevancia práctica está en que permite usar Kimodo desde el ecosistema Diffusers mediante bloques modulares, aunque con dependencias pesadas, licencias restrictivas y ausencia de benchmarks publicados en la información disponible.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular de Diffusers para texto-a-movimiento; codificador de texto Llama 3 8B Instruct con adaptadores LLM2Vec; el backbone exacto del generador de movimiento no se detalla en la información disponible |
| Parámetros totales | 283.281.795 según el recuento de safetensors disponible; el repositorio también incluye el codificador Llama 3 8B y adaptadores LLM2Vec, no desglosados en la información |
| Parámetros activos | No aplica; no se describe como modelo MoE |
| Longitud de contexto | No disponible para el pipeline; el ejemplo genera 120 fotogramas (4 s a 30 FPS) y no se documenta un límite de tokens o de frames |
| Tipos de cuantización | No disponible; no se documentan GGUF, INT8 ni FP8. El ejemplo carga el text encoder en bfloat16 y el resto en float32 |
| Idiomas soportados | en (inglés) |
| Licencia | kimodo-and-llama3-component-licenses: pesos de movimiento con NVIDIA Open Model License; codificador con Meta Llama 3 Community License y Acceptable Use Policy; código personalizado Apache-2.0; código LLM2Vec adaptado MIT |
| Formato de pesos | safetensors; pipeline modular Diffusers con bloques separados en OzzyGT/Kimodo_SOMA_Modular |
| Pipeline de HuggingFace | no disponible |
| Salida | Movimiento 3D sobre esqueleto SOMA77, en metros, +Y arriba, +Z hacia delante inicial y root motion preservado |
| Repositorio | 16,3 GB |

## Arquitectura y entrenamiento
La información disponible describe una conversión a Diffusers de NVIDIA Kimodo SOMA RP v1.2, con un pipeline modular en el que los bloques se cargan desde `OzzyGT/Kimodo_SOMA_Modular` y los componentes desde este repositorio. El uso de `num_inference_steps` y la librería Diffusers apuntan a un proceso de generación por difusión, pero no se especifica el backbone exacto del generador de movimiento, el número de capas, la dimensión interna ni el mecanismo de atención. La condición textual se procesa con un codificador Llama 3 8B Instruct adaptado mediante LLM2Vec, con adaptadores MNTP y supervisado.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otro ajuste por preferencias, ni las innovaciones técnicas del modelo original. La conversión incorpora una integración modular en Diffusers, salida a 30 FPS, control de semilla y preservación del root motion; los prompts negativos no están soportados.

## Capacidades
- Generación de movimiento humano 3D a partir de prompts en inglés; el ejemplo documentado produce 120 fotogramas, 4 segundos a 30 FPS.
- Salida sobre el esqueleto SOMA77, con unidades en metros, +Y arriba, +Z hacia delante inicial y root motion preservado.
- Control de semilla y número de pasos de inferencia; el ejemplo usa `seed=42` y 100 pasos.
- Exportación de la salida a NPZ mediante NumPy, adecuada para postproceso, visualización o retargeting.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte multilingüe; la model card declara únicamente inglés.
- No se documenta visión, audio ni otras modalidades.
- No admite prompts negativos.
- No es un modelo de chat general, aunque incluya un codificador Llama 3 8B Instruct.

## Casos de uso
- Previsualización de animación: generar ciclos de carrera o caminata de 4 segundos como bloque base para animática y blocking, y después retargetear el esqueleto SOMA77 al rig final. Es adecuado porque produce movimiento con root motion y una duración manejable para iteración rápida.
- Prototipado de locomoción en videojuegos: crear clips de movimiento para NPCs y validar velocidad, dirección y sensación de desplazamiento antes de invertir en captura de movimiento o animación manual.
- Animación de avatares en VR: generar respuestas corporales cortas a partir de texto para prototipos de interacción, siempre que el avatar utilice o pueda retargetearse desde SOMA77.
- Aumento de datos para investigación en reconocimiento de acciones: producir variaciones con distintas semillas y prompts para ampliar datasets de movimiento, con la ventaja de que la salida es estructurada y exportable a NPZ.
- Simulación y robótica: usar movimientos de referencia de 4 segundos en entornos simulados para estudiar locomoción de humanoides, previo retargeting al modelo cinemático del robot.
- Docencia y divulgación: demostrar pipelines texto
