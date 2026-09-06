# robotensor/bpp-genesis

## Resumen

El modelo `robotensor/bpp-genesis` es el checkpoint de referencia (baseline) para la competición RoboTensor ICIL de aprendizaje por imitación in-context con una sola demostración. Lo desarrolla el equipo de RoboTensor y consiste en la conversión a formato `safetensors` de los dos checkpoints públicos de Behavior Prompting Policy (BPP), el método de la página oficial behavior-prompting.github.io. El modelo está pensado para servir como punto de partida que los participantes deben superar en el validador de la competición.

Incluye dos políticas separadas, una por habilidad evaluada: `pick_and_place` (manipulación en mesa, dominio LIBERO) con 690.455.718 parámetros, y `draw_anything` (dibujo en pizarra, dominio DrawAnything-Sim) con 344.772.217 parámetros. Los pesos son idénticos a los checkpoints originales de `austinpatel/libero` y `austinpatel/drawanything_sim`, respectivamente, pero se han convertido para eliminar el formato pickle y usar únicamente tensores en `safetensors`. No se especifica la arquitectura interna ni la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 690.455.718 (pick_and_place) y 344.772.217 (draw_anything) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Behavior Prompting Policy (BPP), una técnica de aprendizaje por imitación in-context que permite a un robot ejecutar una tarea a partir de una única demostración. Los dos checkpoints provienen de entrenamientos previos en dominios distintos: `pick_and_place` fue entrenado en LIBERO, un entorno de manipulación en mesa con tareas de pick-and-place, mientras que `draw_anything` fue entrenado en DrawAnything-Sim, un simulador de dibujo sobre pizarra. Los pesos no han sido modificados respecto a los checkpoints originales.

El proceso de conversión se realizó con la herramienta `icilval convert-ckpt`, que desempaqueta el checkpoint de entrenamiento, escribe los tensores como `safetensors`, resuelve la configuración del modelo, neutraliza los ajustes exclusivos de entrenamiento y reescribe las rutas `_target_` del paquete antiguo (`umi_day.`) al nuevo (`behavior_prompting.`). No se detalla la arquitectura interna (número de capas, tipo de atención, etc.) en la información disponible.

## Capacidades

- Imitación in-context de una sola demostración para tareas robóticas de manipulación.
- Ejecución de la habilidad `pick_and_place` en el dominio LIBERO (manipulación en mesa).
- Ejecución de la habilidad `draw_anything` en el dominio DrawAnything-Sim (dibujo en pizarra).
- Formato de pesos compatible con el validador de la competición RoboTensor ICIL.
- Sin soporte documentado de tool calling, agentes, razonamiento multi-paso, visión multimodal o capacidades multilingües.

## Casos de uso

- Baseline para competiciones de robótica: los participantes pueden comparar sus políticas con este checkpoint de referencia en el validador oficial de RoboTensor ICIL.
- Investigación en aprendizaje por imitación de un solo demo: el modelo sirve como punto de partida para estudiar cómo mejorar la generalización de políticas robóticas a partir de una única demostración.
- Automatización de tareas de pick-and-place en entornos de laboratorio: la política `pick_and_place` puede ejecutar manipulaciones básicas en mesa, útil para bancos de pruebas robóticas.
- Prototipado de robots que dibujan sobre pizarras: la política `draw_anything` permite explorar la generación de trazos en un entorno simulado de dibujo.
- Evaluación de pipelines de conversión de pesos: el modelo demuestra el uso de `icilval convert-ckpt` para transformar checkpoints de entrenamiento en formato `safetensors` sin pérdida de pesos.
- Replicación de resultados en entornos académicos: al ser de código abierto y con licencia MIT, puede utilizarse como referencia reproducible en trabajos de investigación sobre políticas de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aproximado): para `pick_and_place` (690M parámetros) en FP32 se requieren unos 2,8 GB de VRAM; en FP16, unos 1,4 GB. Para `draw_anything` (344M parámetros) en FP32 se requieren unos 1,4 GB; en FP16, unos 0,7 GB.
- GPU recomendadas: cualquier GPU de consumo con al menos 4 GB de VRAM, como una RTX 3060 o superior, puede ejecutar ambos checkpoints en FP16.
- Opciones de despliegue: no se especifican en la información disponible. Al tratarse de `safetensors`, pueden cargarse con PyTorch o con bibliotecas compatibles, pero no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Es un modelo baseline, no optimizado, por lo que su rendimiento en tareas reales puede ser inferior al de soluciones específicamente entrenadas.
- Solo cubre dos habilidades concretas (`pick_and_place` y `draw_anything`); no es un modelo generalista.
- No se dispone de información sobre la arquitectura interna ni sobre la longitud de contexto, lo que limita la evaluación de sus capacidades.
- No se han documentado sesgos ni riesgos de alucinación específicos, pero al ser una política robótica, los fallos de ejecución pueden causar comportamientos no deseados en el entorno físico o simulado.
- La licencia MIT permite uso comercial, pero la responsabilidad sobre el uso en sistemas reales recae en el usuario.
- El modelo no incluye cuantizaciones ni optimizaciones de inferencia, por lo que su despliegue eficiente requiere trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robotensor/bpp-genesis
- Página de la competición RoboTensor ICIL: https://icil.robotensor.ai
- Página oficial de Behavior Prompting Policy: https://behavior-prompting.github.io/
- Checkpoint original de LIBERO: https://huggingface.co/austinpatel/libero
- Checkpoint original de DrawAnything-Sim: https://huggingface.co/austinpatel/drawanything_sim
- Modelo relacionado en Hugging Face: https://huggingface.co/robotensor/bpp-libero-genesis
