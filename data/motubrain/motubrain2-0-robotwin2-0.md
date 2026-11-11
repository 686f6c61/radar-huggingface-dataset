# Motubrain/Motubrain2.0-robotwin2.0

## Resumen

Motubrain2.0-robotwin2.0 es una política robótica (policy) publicada por Motubrain en Hugging Face, entrenada sobre el conjunto de datos RoboTwin 2.0 y orientada a la manipulación bimanual con solo efector final (EEF-only). Se distribuye como un checkpoint de safetensors de 78,1 GB que contiene únicamente los pesos de la política, junto con un `config.yaml` que describe la arquitectura y los parámetros de muestreo necesarios para la inferencia. No es un modelo de lenguaje generalista, sino un componente de control para robots que traduce observaciones multimodales (tres cámaras) en acciones de efector final y pinzas.

El modelo emplea una arquitectura de tipo DiT (Diffusion Transformer) con muestreo de Euler de 30 pasos, sin destilación (non-distilled) y con pesos EMA en el paso 20.000 de entrenamiento. Trabaja con una representación canónica de 55 dimensiones de la que solo se activan las dos poses de EEF y las pinzas, resultando en 20 dimensiones internas; el adaptador de RoboTwin expone acciones de 16 dimensiones con rotaciones xyzw en el cable. Requiere componentes externos (VAE, T5Gemma y DA3) que no se incluyen en el repositorio.

Su relevancia es acotada pero específica: cubre el nicho de políticas de imitación para manipulación bimanual en entornos simulados RoboTwin, con instrucciones de inferencia muy detalladas (estadísticas de cuantiles, umbrales de caché del DiT, orden de cámaras) que facilitan la reproducibilidad. La ausencia de licencia, idiomas declarados y benchmarks publicados limita su evaluación para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con muestreo Euler; política EEF-only no destilada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control con ventana de observación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`ckpts/step-20000-ema.safetensors`) + `config.yaml` + `rw_n2_q1.json` |

## Arquitectura y entrenamiento

La política se basa en un Diffusion Transformer (DiT) que genera acciones mediante muestreo de Euler de 30 pasos con `time shift` de 6,0 y `action time shift` de 1,0, sin classifier-free guidance (CFG). Incorpora caché del DiT con umbrales 0,95/0,93. El checkpoint corresponde a los pesos EMA en el paso 20.000 de entrenamiento y no es un estudiante DMD de cuatro pasos, es decir, no está destilado para inferencia rápida. La representación de acciones usa `canonical55` con solo las dos poses de EEF y las pinzas activas (20 dimensiones internas); las poses EEF son relativas a cámara con rot6d dentro del modelo, mientras que las pinzas son absolutas. El adaptador RoboTwin convierte a 16 dimensiones de EEF + pinza con rotaciones xyzw en el cable.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron RLHF/DPO. El modelo depende de componentes externos no incluidos: VAE, T5Gemma y DA3, lo que implica que la inferencia requiere ensamblar un pipeline multimodal con esos pesos por separado. La normalización de acciones usa estadísticas de cuantiles 0,01/0,99 con epsilon 0,001 y recorte en [-5, 5]; los campos relativos usan estadísticas por paso y los absolutos estadísticas globales.

## Capacidades

- Generación de acciones de efector final y pinzas para manipulación bimanual en el simulador RoboTwin 2.0.
- Control basado en tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) en ese orden estricto.
- Representación de rotaciones mediante rot6d internamente y xyzw en el adaptador de RoboTwin.
- Política no destilada con muestreo de difusión de 30 pasos Euler, orientada a calidad más que a latencia.
- Soporte de normalización por cuantiles con recorte para estabilidad de acciones.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo thinking; es una política robótica específica.

## Casos de uso

- Manipulación bimanual en simulación RoboTwin 2.0: el modelo genera acciones EEF + pinza a partir de tres vistas de cámara, adecuado para tareas de pick-and-place y ensamblaje simulados con dos brazos.
- Evaluación de políticas de imitación: sirve como referencia no destilada (30 pasos Euler) para comparar frente a estudiantes DMD de cuatro pasos en términos de éxito y latencia.
- Investigación en representaciones de acción: el uso de `canonical55` con rot6d interno y xyzw en el cable permite estudiar el impacto de la parametrización de rotaciones en el control.
- Reproducción de experimentos con estadísticas de cuantiles: los ficheros `rw_n2_q1.json` y `config.yaml` permiten replicar exactamente la normalización (0,01/0,99, epsilon 0,001, clipping [-5,5]).
- Base para fine-tuning en dominios RoboTwin: al ser una política EEF-only con pesos EMA, puede adaptarse a nuevas tareas del mismo simulador manteniendo el pipeline de tres cámaras.
- Despliegue en pipelines de evaluación offline: la caché del DiT (umbrales 0,95/0,93) reduce cómputo en rollouts largos, útil para barridos de hiperparámetros en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 78,1 GB, lo que sugiere que los pesos en precisión completa no caben en GPUs de consumo sin cuantización o sharding.
- GPU recomendadas: no disponible; por tamaño, se requerirían GPUs de datacenter (A100/H100) o multi-GPU para cargar el checkpoint completo, aunque no se confirma.
- Cabe en consumer GPU: no disponible; el tamaño del repo (78,1 GB) excede la VRAM de RTX 4090 (24 GB) en precisión completa.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política robótica); la carga se realiza con el loader de inferencia que busca `config.yaml` en el directorio padre de `ckpts/`.
- Latencia y throughput: no disponibles; el muestreo de 30 pasos Euler sin destilación implica mayor coste que un estudiante DMD de cuatro pasos, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (políticas robóticas EEF-only sobre RoboTwin) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial; tratar como restringido hasta verificación.
- El checkpoint contiene solo pesos de política; requiere VAE, T5Gemma y DA3 externos, lo que complica la reproducibilidad y añade dependencias no versionadas en el repo.
- No es un estudiante DMD de cuatro pasos: la inferencia con 30 pasos Euler es más lenta que variantes destiladas.
- Dependencia estricta del orden de cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) y de la estructura de directorios (`config.yaml` sobre `ckpts/`); un empaquetado incorrecto rompe el loader.
- Normalización sensible: requiere las estadísticas de cuantiles exactas (0,01/0,99, epsilon 0,001, clipping [-5,5]) y distinguir campos relativos (por paso) de absolutos (globales).
- Sesgos y alucinaciones: no documentados; al ser una política de imitación, puede fallar fuera de la distribución del dataset RoboTwin 2.0.
- Sin idiomas ni benchmarks publicados: no hay evidencia de generalización más allá del simulador ni métricas de éxito reportadas.
- Fecha de creación futura (2026-11-11) y cero descargas/likes: madurez y validación comunitaria nulas en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Motubrain/Motubrain2.0-robotwin2.0
