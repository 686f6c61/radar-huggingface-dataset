# chomeed/mimicgen_square_d0_224x224_dinowm

## Resumen

El modelo `chomeed/mimicgen_square_d0_224x224_dinowm` es un world model de estilo DINO-WM (arxiv:2411.04983) desarrollado por el usuario chomeed. Está diseñado para robótica de manipulación con dos cámaras y predice características de parches DINOv2 futuras en lugar de reconstruir píxeles directamente. El modelo resuelve el problema de modelar dinámicas visuales del entorno a partir de trayectorias offline, evitando la reconstrucción costosa de imágenes y permitiendo una predicción determinista en un solo paso.

La arquitectura combina un encoder congelado `facebook/dinov2-small` (ViT-S/14, 384 dimensiones) con un predictor transformer de 6 capas y atención completa. El modelo avanza 8 acciones del entorno (0.4 segundos a 20 fps) en un solo forward pass, sin difusión ni bucle de muestreo. El checkpoint contiene solo los parámetros entrenables (13.4M), mientras que DINOv2 y el VAE de SD3.5 se descargan por separado y permanecen congelados. Está pensado para integrarse en sistemas de planificación y control de robots manipuladores.

Su relevancia radica en que demuestra que es posible aprender dinámicas visuales efectivas prediciendo características preentrenadas de DINOv2 en lugar de píxeles, reduciendo la carga computacional y mejorando la generalización. El modelo supera al baseline de "copiar el frame actual" en error de características y PSNR en todas las tareas evaluadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor transformer de 6 capas (pre-norm, 6 cabezas, MLP 2048) + encoder DINOv2-small congelado + decoder VAE SD3.5 congelado |
| Parametros totales | 13.4M (entrenables); el checkpoint solo incluye estos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1178 tokens de características (2 frames × 2 vistas × 196 parches + action + state + query tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión/dinámica, sin texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo sigue el enfoque DINO-WM: predice características de parche DINOv2 futuras en lugar de píxeles. El encoder es un ViT-S/14 congelado que convierte imágenes de 224×224 en 196 parches (14×14) por vista y frame, descartando el token CLS. El predictor es un transformer de 6 capas con atención bidireccional completa sobre una secuencia de 1178 tokens que incluye: 2 frames de contexto × 2 vistas × 196 parches, más tokens de acción (8 pasos × 7 dimensiones), estado del robot (9 dimensiones) y 392 tokens de consulta (2 vistas × 196 parches). La identidad se codifica mediante embeddings aditivos de posición, vista y frame. La pérdida es MSE simple en el espacio de características. El decoder, solo para visualización, convierte las características predichas en RGB mediante un VAE de SD3.5 congelado, entrenado con características desacopladas (detached).

El entrenamiento usó 177,074 ventanas de entrenamiento y 13,217 de validación, con datos de los datasets `mimicgen_square_d0_224x224_mtdit_flow_40k_success`, `..._failure` y `mimicgen_square_d0_224x224`. Las cámaras son `agentview` y `eye_in_hand` a 224×224. El estado del robot se limita a `observation.state[:9]` (posición del efector 3D, cuaternión 4D y apertura del gripper 2D). Se entrenó 60,000 pasos con un batch de 32, alcanzando un pico de memoria de 12.5 GB y ~96 muestras/s en una RTX 5090, con un tiempo total de ~5.5 horas por tarea. Las ablaciones muestran que el condicionamiento de acción es crítico (eliminarlo degrada el error en +8.8%), mientras que el historial satura en 2 frames.

## Capacidades

- Predicción de dinámicas visuales: predice las características DINOv2 de los frames futuros (t+8) a partir de contexto pasado y acciones, en un solo paso determinista.
- Multi-vista: procesa y predice conjuntamente las vistas `agentview` y `eye_in_hand`, usando embeddings de vista aprendidos.
- Condicionamiento por acción y estado: el modelo acepta un chunk de 8 acciones y el estado del robot (9 dimensiones) para condicionar la predicción.
- Planificación en bucle: `predict_from_features` permite saltar la re-encodificación del contexto fijo en bucles de planificación.
- Decodificación opcional: puede convertir las características predichas en imágenes RGB (solo para inspección) mediante un decoder VAE SD3.5.
- No requiere reconstrucción de píxeles: reduce la carga computacional frente a modelos que predicen imágenes directamente.

## Casos de uso

- Planificación de movimientos en robótica: el modelo puede usarse para evaluar secuencias de acciones candidatas antes de ejecutarlas, prediciendo el resultado visual de 8 pasos de acción en un solo forward. Adecuado porque es determinista y rápido (~96 muestras/s en RTX 5090).
- Control predictivo por modelo (MPC): integrarlo en un bucle de control que optimiza acciones en base a la predicción de características futuras, útil para tareas de manipulación como ensamblaje o empuje.
- Aprendizaje por refuerzo basado en modelo: sirve como modelo del entorno para entrenar políticas en simulación o para planificación en el espacio de características, sin necesidad de renderizar imágenes.
- Validación de políticas: en pipelines de entrenamiento de robots, puede comprobar si una política ejecutará correctamente una tarea comparando las características predichas con las esperadas.
- Generación de datos sintéticos: aunque no genera imágenes, puede usarse para filtrar o validar datos de entrenamiento, detectando trayectorias que se desvían de la dinámica aprendida.
- Investigación en modelos de mundo: como base para estudiar el efecto de la predicción de características preentrenadas en tareas de manipulación multi-vista, comparándolo con enfoques basados en píxeles.

## Benchmarks y rendimiento

Los resultados se reportan en episodios no vistos (20 por dataset fuente, 13,217 ventanas). El baseline es "copiar el frame actual", que es fuerte porque t+8 está solo 0.4 segundos por delante.

| Tarea | Feature MSE | Copiar frame | PSNR | Copiar frame | SSIM | Copiar frame | LPIPS | Copiar frame |
|---|---|---|---|---|---|---|---|---|
| coffee_d0 | 0.457 | 1.451 | 23.25 | 18.06 | 0.9167 | 0.9000 | 0.1185 | 0.0977 |
| **square_d0** | **0.661** | **1.806** | **22.65** | **18.13** | **0.9019** | **0.8900** | **0.1558** | **0.1144** |
| threading_d0 | 0.499 | 1.554 | 24.12 | 20.17 | 0.9213 | 0.9156 | 0.1169 | 0.0771 |
| square_d1 | 0.670 | 1.428 | 19.82 | 16.99 | 0.8294 | 0.8577 | 0.2424 | 0.1329 |
| hammer_cleanup_d1 | 0.655 | 1.886 | 20.38 | 15.77 | 0.8248 | 0.8233 | 0.2828 | 0.1730 |

En square_d0, el error latente (feature MSE) es un 63% inferior al baseline de copia. El autor advierte que LPIPS es un artefacto del decoder (el oracle ya es peor que copiar), por lo que la métrica principal es el error de características.

## Requisitos de hardware

- VRAM estimada: 12.5 GB pico durante el entrenamiento con batch 32 en fp32. Para inferencia, se puede reducir el batch a 1 y usar fp16/bf16, estimando unos 2-4 GB.
- GPU recomendadas: RTX 5090 (usada en entrenamiento), RTX 4090, A100, H100. Cualquier GPU con al menos 8 GB VRAM es suficiente para inferencia.
- Compatibilidad con GPU de consumo: sí, una RTX 3080 o superior puede ejecutar la inferencia con batch pequeño.
- Opciones de despliegue: el modelo es un checkpoint PyTorch que requiere código personalizado (`dino_dynamics.py`). No hay soporte directo para vLLM, llama.cpp u Ollama; se integra en pipelines de PyTorch.
- Latencia y throughput: ~96 muestras/s en RTX 5090 durante el entrenamiento; en inferencia, el throughput será similar o mayor, con latencia de milisegundos para un solo paso.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. El modelo se basa en el enfoque DINO-WM original (arXiv:2411.04983), pero con diferencias clave: multi-vista, tokens de consulta explícitos y proprioceptivo solo como entrada. No se puede comparar cuantitativamente con otras implementaciones sin más datos.

## Limitaciones y advertencias

- Predicción de un solo paso: el modelo está entrenado para avanzar 8 acciones en un solo salto; el despliegue multi-step (rollout) no está probado y puede acumular errores.
- Sin evaluación de planificación: no se ha evaluado el modelo en tareas de planificación completas; solo se han medido métricas de predicción.
- Dependencia del decoder: las imágenes generadas son solo para inspección y están limitadas por el decoder de 0.2M parámetros, que no captura fidelidad de alta calidad.
- Licencia no disponible: no se especifica licencia, lo que impide su uso comercial sin autorización explícita.
- Sin soporte de lenguaje: el modelo es puramente visual y no procesa texto ni instrucciones.
- Sin cuantizaciones publicadas: no hay versiones GGUF o safetensors cuantizadas; solo el checkpoint .pt en fp32.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chomeed/mimicgen_square_d0_224x224_dinowm
- Paper DINO-WM: https://arxiv.org/abs/2411.04983
- Dataset de éxito (success): https://huggingface.co/datasets/chomeed/mimicgen_square_d0_224x224_mtdit_flow_40k_success
- Página de MimicGen: https://mimicgen.github.io/
- Código de MimicGen (NVlabs): https://github.com/NVlabs/mimicgen
