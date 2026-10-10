# kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s3000

## Resumen

`NAJY_act_all11_c100_m1_27D_60k_s3000` es un checkpoint de política robótica basado en ACT (Action Chunking Transformer), publicado por el usuario kiroaiseoul dentro del ecosistema LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitación (behavioral cloning) que mapea observaciones multimodales de un robot (estado de 27 dimensiones y tres cámaras RGB de 480x640) a secuencias de acciones de 16 dimensiones, con 51.700.368 parámetros totales y un tamaño de repositorio de 0,2 GB.

El modelo está entrenado sobre el conjunto de datos Trossen Mobile AI y corresponde al paso 60.000 de la ejecución identificada como `t24_all11_c100_m1_60k_s3000`, con 11 etapas o tareas ("all11"). Según la propia model card, se trata de una subida destinada a análisis y puntuación interna ("실기 배포 후보 확정과는 별개", es decir, independiente de la confirmación de candidatos para despliegue real), no de una versión final lista para producción.

Su relevancia es la de un ejemplo representativo de política ACT pequeña (en torno a 50 millones de parámetros) aplicada a manipulación con base móvil, un perfil de modelo que cabe en GPU de consumo e incluso en hardware embebido tipo Jetson. Al estar publicado con licencia Apache 2.0 y formato safetensors dentro del estándar LeRobot, resulta reutilizable para investigación en imitación y fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), transformer con encoder de observaciones, decoder de acciones y componente CVAE |
| Parametros totales | 51.700.368 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT consume historial de observaciones fijo, sin ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `c9b362a4af1b8a11d86c9d142bdee7e5a7d0d3357b97bf78d7278ffa0fbbf479`) |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de aprendizaje por imitación presentada originalmente en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023). Combina un transformer encoder que procesa las observaciones (estado del robot más imágenes de cámaras) con un transformer decoder que genera un "chunk" de acciones futuras de una sola vez, y un codificador CVAE que modela la variabilidad de las demostraciones humanas para evitar el colapso de modos. El objetivo es reducir el error de compounding que aparece al predecir acciones paso a paso.

En este caso concreto, la model card declara las siguientes features de entrada y salida: `observation.state` de 27 dimensiones, tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) con tensores `[3, 480, 640]` cada una, y `action` de 16 dimensiones. El nombre del checkpoint sugiere 11 tareas o etapas (`all11`), un tamaño de chunk de 100 (`c100`), 27 dimensiones de estado (`27D`) y 60.000 pasos de entrenamiento (`60k`), pero la model card no detalla el número de tokens, la composición exacta del dataset, ni si se empleó RLHF o DPO (en ACT no es habitual: se trata de clonación de comportamiento supervisada, no de aprendizaje por refuerzo). La información sobre el dataset de entrenamiento y las hiperparámetros no está disponible más allá de estos identificadores.

## Capacidades

- Generación de secuencias de acciones robóticas (action chunks) de 16 dimensiones a partir de observaciones visuales y propioceptivas.
- Procesamiento multimodal de tres flujos de imagen RGB de 480x640 píxeles simultáneos (cámara alta y dos cámaras de muñeca) más un vector de estado de 27 dimensiones.
- Aprendizaje por imitación orientado a manipulación robótica, con capacidad de modelar multimodalidad de demostraciones mediante el componente CVAE.
- Diseñado para escenarios de robot móvil con base (según el contexto declarado: `trossen-ai-simulation` y `mobile_base_investigation.md`).
- Compatible con la librería LeRobot (`--checkpoint <carpeta>`, estructura `pretrained_model`), lo que permite cargarlo directamente en herramientas de diagnóstico como `stage_cond_diag.py`.
- No soporta tool calling, function calling, uso como agente conversacional, ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Manipulación robótica bimanual en laboratorio: el modelo genera chunks de acciones para brazos Trossen a partir de tres cámaras y el estado de 27 dimensiones, adecuado para tareas de pick-and-place y ensamblaje guiado por visión.
- Navegación y manipulación con base móvil: los 27 grados del estado permiten incluir la base móvil, por lo que sirve para políticas que combinan desplazamiento y manipulación (contexto declarado en `mobile_base_investigation.md`).
- Punto de partida para fine-tuning: al tener solo 51,7 millones de parámetros y licencia Apache 2.0, es viable reentrenarlo con demostraciones propias de un robot distinto con coste de cómputo bajo.
- Evaluación y comparación interna de checkpoints: la model card indica que la subida está pensada para análisis y puntuación ("분석·채점용 업로드"), con un `multi_manifest.json` y verificación por sha256, por lo que se usa como artefacto de un pipeline de scoring entre etapas de entrenamiento.
- Reproducción de experimentos de ACT en LeRobot: sirve como referencia para validar implementaciones de ACT en el ecosistema LeRobot y comparar curvas de entrenamiento a 60.000 pasos.
- Despliegue en hardware embebido o edge: su reducido tamaño permite ejecutarlo en plataformas como Jetson Orin o incluso en CPU para pruebas de bucle cerrado de baja frecuencia.
- Investigación en behavioral cloning multimodal: útil para estudiar cómo el CVAE de ACT gestiona la ambigüedad de demostraciones humanas con múltiples cámaras y estado de alta dimensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de acción (MSE/L1), ni comparaciones numéricas con otros checkpoints; únicamente proporciona los identificadores de la ejecución, las features y el hash del archivo de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,21 GB en fp32 (51,7 M de parámetros por 4 bytes) y en torno a 0,10 GB en fp16. Cabe holgadamente en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 están sobradamente dimensionadas para inferencia. También es viable la ejecución en CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas, incluidas soluciones integradas y plataformas embebidas tipo NVIDIA Jetson.
- Opciones de despliegue: la librería de referencia es LeRobot (Hugging Face), que carga la estructura `pretrained_model`. Dado que el modelo está en safetensors/PyTorch, es exportable a ONNX para inferencia en borde. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de frecuencia de control, latencia por chunk ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_m1_27D_60k_s3000 | 51.700.368 | 27D de estado + 3 camaras 480x640; accion 16D | apache-2.0 | Hugging Face (LeRobot) | Checkpoint de analisis, no de despliegue final |
| ACT original (ALOHA, Zhao et al. 2023) | no disponible en la informacion proporcionada | no disponible | no disponible | Repositorio de investigacion | Arquitectura de referencia sobre la que se basa este modelo |
| Otros checkpoints ACT en LeRobot | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos verificados |

No se dispone de cifras verificadas de rendimiento ni de parametros de modelos alternativos en la informacion proporcionada; la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al ser un modelo de clonación de comportamiento hereda los sesgos y la distribución de las demostraciones de entrenamiento (Trossen Mobile AI). Fuera de esa distribución, el rendimiento esperado cae.
- Riesgo de alucinacion: no aplica en el sentido lingüístico, pero sí existe riesgo de generar acciones erráticas o fuera de rango cuando la observación se aleja de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa lenguaje natural, por lo que no tiene idiomas ni ventana de contexto en tokens. Las entradas están fijadas a 27D de estado y tres cámaras 480x640; cualquier cambio de sensores o resolución requiere reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, con obligación de mantener aviso de licencia y sin garantía. No se declaran restricciones adicionales.
- Caveat para produccion: la propia model card indica que el checkpoint se sube para análisis y puntuación, y que es independiente de la confirmación de candidatos para despliegue real. No debe tratarse como versión validada para producción.
- El checkpoint corresponde al paso 60.000 de una ejecución concreta; no hay garantía de que haya convergido ni de que supere a otros pasos intermedios.
- No se documentan tipos de cuantizacion ni versiones optimizadas para inferencia en borde, lo que obliga a exportar y validar manualmente si se busca latencia mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_m1_27D_60k_s3000
- LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Articulo original de ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705
- Contexto citado por el autor: `trossen-ai-simulation` (`docs/mobile_base_investigation.md` seccion 94) — no se proporciona URL directa en la informacion disponible.
- Trossen Robotics: https://www.trossenrobotics.com
