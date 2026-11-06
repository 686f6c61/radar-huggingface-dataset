# mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__static__groot__seed_0

## Resumen

`mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__static__groot__seed_0` es una política robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA. No es un modelo de lenguaje generalista, sino un checkpoint de control visuomotor especializado: recibe observaciones de estado proprioceptivo y tres cámaras (vista de agente y dos cámaras en la muñeca del robot) y emite vectores de acción de 7 dimensiones para un brazo Franka Panda en un entorno simulado. El repositorio ocupa 50,3 GB y contiene 3.144.016.000 parámetros en formato safetensors.

El modelo resuelve una tarea concreta de manipulación: recoger piezas geométricas complejas (formas con lóbulos, ranuras, púas, anillos, etc.) descritas en lenguaje natural y depositarlas en una caja. El dataset de entrenamiento contiene 790 episodios y 157.904 fotogramas a 20 FPS, con 22 instrucciones de tarea distintas que describen cada objeto con gran detalle morfológico. Es relevante porque demuestra el flujo de trabajo de ajuste fino de un modelo fundacional cross-embodiment para una tarea de picking especializada, y porque el nombre del repositorio codifica la configuración experimental (máscara, overlay al 75 %, todas las cámaras, escena estática, semilla 0).

La licencia Apache 2.0 permite uso comercial, pero el modelo está ligado a un robot y a una tarea específicos: no es un asistente conversacional ni un modelo de propósito general. Su valor está en servir como referencia reproducible de entrenamiento con GR00T + LeRobot y en la evaluación de políticas visuomotoras en escenarios de alta variabilidad geométrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (las instrucciones del dataset están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 50,3 GB) |

## Arquitectura y entrenamiento

La política se basa en GR00T N1.7, un modelo fundacional de NVIDIA para razonamiento y habilidades humanoides. La arquitectura combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL, que procesa las imágenes de las cámaras y la instrucción textual de la tarea, con un transformer de acciones entrenado mediante flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La entrada de estado tiene 9 dimensiones y las tres cámaras aportan imágenes de 3×224×224; la salida es un vector de acción de 7 dimensiones.

El ajuste fino se realizó con LeRobot sobre el dataset `train_800_complex__mask__overlay_a75__sim__all_cameras__static`, compuesto por 790 episodios y 157.904 fotogramas a 20 FPS en un entorno simulado con robot Panda. Las 22 tareas del dataset describen objetos con alta variabilidad morfológica (formas con cuatro lóbulos, ranuras profundas, púas, anillos, superficies estriadas) y la instrucción es siempre "recoger el objeto y colocarlo en la caja". El nombre del checkpoint indica el uso de máscara, overlay al 75 %, todas las cámaras, escena estática y semilla 0, lo que sugiere un barrido experimental sistemático sobre esas variables. No se documentan en la información disponible detalles sobre RLHF, DPO ni el número total de tokens de entrenamiento del backbone.

## Capacidades

- Control visuomotor de un brazo Franka Panda en simulación: genera acciones de 7 dimensiones a partir de observaciones multimodales.
- Comprensión de instrucciones en lenguaje natural que describen la geometría del objeto a manipular (forma, lóbulos, ranuras, textura, proporciones).
- Fusión de tres vistas de cámara (vista de agente y dos cámaras en la muñeca) con estado proprioceptivo de 9 dimensiones.
- Ejecución de tareas de picking y colocación en caja sobre objetos de geometría compleja y variable.
- Entrenamiento y despliegue mediante el ecosistema LeRobot, con integración en el flujo de GR00T.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- **Automatización de picking en líneas de fabricación**: la política puede recoger piezas metálicas de geometría compleja (similares a las piezas MIM) y colocarlas en contenedores, usando las tres cámaras para localizar el objeto y el estado proprioceptivo para planificar la aproximación.
- **Generación de datos sintéticos para entrenamiento de robots**: al estar entrenada en simulación con escena estática y múltiples cámaras, sirve como generador de trayectorias etiquetadas para aumentar datasets de manipulación.
- **Evaluación de modelos fundacionales cross-embodiment**: el checkpoint permite comparar el rendimiento de GR00T N1.7 frente a otras políticas (p. ej., ACT, Diffusion Policy) en una tarea de referencia con 22 variantes de objeto.
- **Prototipado rápido de tareas de manipulación**: con LeRobot, un equipo puede reentrenar o ajustar esta política sobre un nuevo conjunto de objetos sin partir de cero, reutilizando el backbone Cosmos-Reason2/Qwen3-VL.
- **Investigación en robustez a variabilidad geométrica**: las 22 descripciones de objeto permiten estudiar cómo afecta la complejidad morfológica (lóbulos, ranuras, púas) a la tasa de éxito del agarre.
- **Validación de pipelines de simulación a realidad**: el modelo entrenado en simulación con escena estática puede servir como base para experimentos de transferencia a un Panda real, midiendo la brecha sim-to-real.
- **Docencia y reproducción de experimentos**: el nombre del checkpoint codifica la configuración exacta (máscara, overlay, cámaras, semilla), lo que facilita la reproducibilidad en cursos de robótica y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 3.144 millones de parámetros en safetensors, los pesos en fp32 ocupan aproximadamente 12,6 GB; en fp16, unos 6,3 GB. A ello hay que sumar el coste del backbone visión-lenguaje y de las tres cámaras a 224×224, por lo que se recomienda un mínimo de 16 GB de VRAM.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda; RTX 3090 (24 GB) también es viable.
- **Cabe en GPU consumer**: sí, en RTX 4090, RTX 3090 y, con cuantización o reducción de resolución, potencialmente en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- **Opciones de despliegue**: LeRobot (framework nativo del checkpoint), con soporte para el flujo de GR00T; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son adecuadas para una política visuomotora.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3.144 M | no disponible | Picking de objetos complejos en simulación (Panda) | Apache 2.0 | Hugging Face, 19 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment para humanoides | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot estándar (ACT, Diffusion Policy) | del orden de decenas de millones | no disponible | Manipulación por imitación | Apache 2.0 | Hugging Face / LeRobot |
| OpenVLA | ~7.000 M | no disponible | Control visuomotor generalista | no disponible en la información | Hugging Face |

La comparación con OpenVLA y las políticas LeRobot estándar es orientativa: este checkpoint es un ajuste fino especializado, no un modelo generalista, por lo que las cifras de parámetros no son directamente comparables en términos de capacidad.

## Limitaciones y advertencias

- **Especialización extrema**: el modelo solo ha sido entrenado para la tarea de recoger objetos geométricos y colocarlos en una caja; no generaliza a otras tareas sin reentrenamiento.
- **Dependencia del entorno simulado**: entrenado con escena estática y robot Panda; el rendimiento en un robot real o en escenas dinámicas no está documentado.
- **Riesgo de alucinación motora**: como política visuomotora, puede generar trayectorias inválidas o colisiones ante objetos fuera de la distribución de entrenamiento.
- **Sesgos del dataset**: las 22 descripciones de objeto son muy específicas y en inglés; objetos con morfologías no representadas pueden degradar el rendimiento.
- **Idioma**: no se documentan capacidades multilingües; las instrucciones de entrenamiento están en inglés.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo incorpora el backbone Cosmos-Reason2/Qwen3-VL, cuyas condiciones de uso deben verificarse por separado.
- **Tamaño del repo**: 50,3 GB dificulta el despliegue en entornos con almacenamiento limitado; no se ofrecen cuantizaciones oficiales.
- **Madurez**: 19 descargas y 0 likes indican un checkpoint de investigación, no un modelo validado en producción.

## Enlaces

- [Hugging Face del modelo](https://huggingface.co/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__static__groot__seed_0)
- [Dataset de entrenamiento](https://huggingface.co/datasets/mim-chess-vlas/train_800_complex__mask__overlay_a75__sim__all_cameras__static)
- [GR00T N1.7 en GitHub (NVIDIA/Isaac-GR00T)](https://github.com/NVIDIA/Isaac-GR00T)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
