# saidaliu27/nanowm-b2-rt1-flow-300k-seed1

## Resumen

NanoWM-B/2 RT-1 flow matching (seed 1, 300k pasos) es un modelo de mundo (*world model*) para robótica desarrollado por el usuario saidaliu27. Predice fotogramas futuros de una escena a partir de un fotograma de contexto y una secuencia de acciones, lo que permite simular la evolución del entorno sin ejecutar físicamente el robot. El modelo se publica como export de inferencia en formato safetensors, con 158.598.160 parámetros y un tamaño de repositorio de 0,6 GB.

Técnicamente se apoya en el backbone NanoWM-B/2, un transformer con atención temporal causal y condicionamiento de acción aditivo, que opera sobre latentes del VAE `stabilityai/sd-vae-ft-mse` (4 × 32 × 32 para imágenes de 256 × 256). El objetivo de predicción es *flow matching* con muestreo de timesteps log-normal y sin zero-terminal-SNR, y está entrenado sobre el dataset RT-1 de Fractal con un tamaño de lote de 64 durante 300.000 pasos.

Su relevancia es acotada pero específica: se trata de un modelo pequeño, con licencia MIT y entrenado desde cero, orientado a investigación en planificación y evaluación de políticas robóticas mediante rollouts latentes. No es un modelo de lenguaje ni un asistente general; es una pieza de infraestructura para experimentación en modelos de mundo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (NanoWM-B/2) con atención temporal causal y condicionamiento de acción aditivo; predicción por flow matching sobre latentes de VAE |
| Parámetros totales | 158.598.160 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; secuencia fija de un fotograma de contexto y tres fotogramas futuros |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada visual y vector de acción) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), más `config.yaml`, `manifest.json` y `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo emplea el backbone NanoWM-B/2, un transformer con atención temporal causal que procesa una secuencia compuesta por un fotograma de contexto y tres fotogramas futuros, representados como latentes de 4 × 32 × 32 obtenidos con el VAE `stabilityai/sd-vae-ft-mse` a partir de imágenes de 256 × 256. Las acciones, de dimensión 7, se inyectan mediante condicionamiento aditivo. La cabeza de predicción utiliza flow matching (`experiment.diffusion.pred_name: flow`) con muestreo de timesteps log-normal y zero-terminal-SNR desactivado; C3 también está desactivado.

El entrenamiento se realizó sobre el dataset RT-1 (Fractal) durante 300.000 pasos con tamaño de lote de 64, usando la semilla 1. El repositorio incluye `metadata.json` con las estadísticas de acciones del entrenamiento, necesarias para normalizar mediante `(action - action_mean) / action_std` siguiendo el cargador de datos de NanoWM. El export no contiene estado del optimizador, fotogramas del dataset ni pesos del VAE; es un checkpoint de inferencia, no reanudable para entrenamiento. El `manifest.json` recoge hashes de origen y verificación de carga estricta e igualdad de tensores.

## Capacidades

- Predicción de fotogramas futuros condicionada por acciones en entornos robóticos RT-1.
- Modelado de dinámica visual a partir de latentes de VAE, con tres pasos de horizonte.
- Condicionamiento de acción de dimensión 7 (típico de control de efector final en robótica manipulativa).
- Muestreo por flow matching con número de pasos configurable (250 por defecto en la configuración guardada; 10 pasos en las ablaciones de incertidumbre asociadas).
- Integración con el ecosistema `nano-world-model` para rollouts latentes y utilidades de evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Evaluación de políticas robóticas en simulación latente: el modelo permite generar rollouts de tres fotogramas futuros dado un contexto y una secuencia de acciones, lo que sirve para estimar el comportamiento de una política sin ejecución física en el robot.
- Planificación basada en modelo (*model-based planning*): al predecir la evolución visual del entorno bajo distintas acciones, se pueden comparar trayectorias candidatas y seleccionar la de mayor recompensa estimada antes de actuar.
- Aumento de datos para entrenamiento de políticas: los rollouts generados pueden usarse como datos sintéticos adicionales para entrenar o afinar políticas de manipulación en el dominio RT-1.
- Investigación en modelos de mundo: el checkpoint, con licencia MIT y 158 M de parámetros, es un punto de partida reproducible (semilla 1, 300k pasos) para estudiar objetivos de flow matching frente a difusión clásica en predicción visual.
- Detección de desviaciones del modelo (*world model mismatch*): comparar las predicciones del modelo con observaciones reales del robot permite detectar cambios en la dinámica o fallos del entorno.
- Prototipado en hardware de consumo: su tamaño reducido y su naturaleza de inferencia permiten ejecutar experimentos en una única GPU, algo inviable con modelos de mundo de mayor escala.
- Ablaciones de incertidumbre: la configuración asociada permite reducir el muestreo a 10 pasos, lo que facilita barridos de hiperparámetros y estudios de calibración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 158,6 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,63 GB y en fp16 unos 0,32 GB; sumando el VAE `stabilityai/sd-vae-ft-mse` (dependencia externa) y los latentes de la secuencia, el consumo total es del orden de 1-2 GB en fp16, aunque no se documenta una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; se recomiendan RTX 3060/4060 o superiores para comodidad. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, incluidas las de gama de entrada con 4-6 GB.
- Opciones de despliegue: el modelo se carga mediante el repositorio `nano-world-model` (PyTorch + `safetensors` + `omegaconf` + `huggingface_hub`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El muestreo por defecto usa 250 pasos de flow matching, lo que condiciona la latencia; las ablaciones de incertidumbre usan 10 pasos.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de mundo para RT-1 con flow matching) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Es un export de inferencia: no contiene estado del optimizador ni permite reanudar el entrenamiento.
- Depende del VAE `stabilityai/sd-vae-ft-mse`, que no se incluye en el repositorio y debe descargarse por separado.
- Requiere normalizar las acciones con `(action - action_mean) / action_std` usando `metadata.json`; omitir este paso invalida las predicciones.
- Horizonte de predicción fijo de tres fotogramas futuros; no es un modelo autorregresivo de horizonte largo sin mecanismos adicionales.
- Entrenado exclusivamente sobre RT-1 (Fractal); se espera un rendimiento pobre fuera de ese dominio visual y de acciones.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes conversacionales.
- Riesgo de alucinación visual: como modelo generativo, puede producir fotogramas plausibles pero incorrectos, especialmente en configuraciones de acción fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene revisar también la licencia del VAE dependiente.
- Sin datos publicados de benchmarks, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.
- El número de pasos de muestreo por defecto (250) puede ser excesivo para aplicaciones en tiempo real; las ablaciones usan 10 pasos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saidaliu27/nanowm-b2-rt1-flow-300k-seed1
- VAE dependiente: https://huggingface.co/stabilityai/sd-vae-ft-mse
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del código `nano-world-model` ni demos.
