# hmkang/wam-dit4dit-robocasa-wan22-4latin2latout

## Resumen

El modelo `hmkang/wam-dit4dit-robocasa-wan22-4latin2latout` es un ajuste fino (finetune) del modelo base Wan2.2-TI2V-5B de Wan-AI, especializado en predicción de vídeo como world model para entornos de cocina robótica (RoboCasa Kitchen). Desarrollado por el usuario hmkang, este modelo se entrena exclusivamente en modo vídeo, sin entrenar el DiT de acción, lo que lo convierte en un predictor de frames futuros a partir de un contexto latente de 4 frames de entrada que generan 2 frames de salida.

La relevancia actual radica en su aplicación como world model para robótica y simulación, permitiendo generar secuencias de vídeo coherentes en entornos domésticos sin necesidad de acciones explícitas. Al estar basado en Wan2.2-TI2V-5B, hereda la arquitectura de difusión de vídeo de dicho modelo, aunque los detalles específicos de parámetros y contexto no se han publicado en la ficha. El repositorio incluye checkpoints de inferencia con pesos en formato safetensors y una copia EMA del DiT de vídeo, excluyendo el estado del optimizador para no reanudar entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (basado en Wan2.2-TI2V-5B) |
| Parametros totales | no disponible (el modelo base tiene 5B, pero el finetune no especifica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards con índice) |

## Arquitectura y entrenamiento

El modelo es un finetune de Wan2.2-TI2V-5B, un modelo de difusión de texto-imagen-vídeo. En este ajuste, se entrena únicamente el DiT de vídeo (modo `video`), dejando el DiT de acción sin entrenar. El condicionamiento latente es `4latin2latout`, es decir, se proporcionan 4 frames latentes de contexto y el modelo predice 2 frames latentes futuros. El entrenamiento se realizó en 8 GPUs H200, y se guarda una copia EMA del DiT de vídeo (bajo el prefijo `_video_ema_model.*`) con un esquema de calentamiento de EMA de diffusers (inv_gamma=1.0, power=0.75, cap 0.9999). No se incluye el estado del optimizador, por lo que los checkpoints son solo para inferencia, extracción de características o probing.

No se han publicado detalles sobre el dataset de entrenamiento, número de tokens, ni técnicas adicionales como RLHF o DPO.

## Capacidades

- Predicción de vídeo: genera 2 frames latentes futuros a partir de 4 frames latentes de contexto, actuando como world model en entornos RoboCasa Kitchen.
- Extracción de características: al ser un modelo de vídeo entrenado, puede usarse para extraer representaciones latentes de secuencias de vídeo.
- Probing: los checkpoints permiten análisis de representaciones internas del modelo.
- No soporta acciones: al no entrenar el DiT de acción, no puede condicionarse a comandos de acción.
- No se mencionan capacidades de texto, tool calling, agentes, ni multilingüismo.

## Casos de uso

- Investigación en world models: el modelo puede predecir la evolución de una escena de cocina robótica a partir de observaciones visuales, útil para estudiar dinámicas de entornos domésticos.
- Simulación para entrenamiento de políticas: aunque no genera acciones, puede usarse como módulo de predicción de estado en pipelines de aprendizaje por refuerzo basado en modelos.
- Generación de vídeo condicionado: dado un contexto de 4 frames, genera 2 frames futuros, permitiendo crear secuencias sintéticas para aumento de datos.
- Extracción de características latentes: los pesos del DiT de vídeo pueden servir como extractor de características para tareas downstream de robótica.
- Evaluación de modelos de mundo: sirve como punto de comparación para otros world models en dominios de cocina.
- Análisis de representaciones: los checkpoints permiten estudiar cómo el modelo codifica información espacial y temporal en entornos robóticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM, GPU recomendadas, latencia o throughput.
- El entrenamiento se realizó en 8x H200, lo que sugiere que la inferencia requiere GPUs de gama alta con gran memoria (probablemente al menos 40-80 GB de VRAM para el modelo de 5B en fp32 o fp16).
- El tamaño del repositorio es de 44.9 GB, lo que indica que los pesos completos ocupan ese espacio.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, etc.), pero al ser un modelo de difusión de vídeo, es probable que requiera un pipeline específico de Wan2.2.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (cocina RoboCasa) y puede no generalizar a otros entornos.
- No soporta acciones, limitando su uso en tareas que requieran condicionamiento por comandos.
- Los checkpoints no permiten reanudar el entrenamiento (sin estado del optimizador).
- No se han documentado sesgos, pero al entrenarse en un entorno simulado específico, puede presentar sesgos visuales propios de RoboCasa.
- Riesgo de alucinación en la generación de vídeo: como todo modelo generativo, puede producir frames incoherentes o irreales.
- La licencia Apache 2.0 se aplica al finetune, pero los términos del modelo base Wan2.2-TI2V-5B también son vinculantes para el uso del derivado.
- No hay información sobre idiomas, por lo que no se garantiza soporte multilingüe.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/hmkang/wam-dit4dit-robocasa-wan22-4latin2latout)
- [Modelo base Wan2.2-TI2V-5B-Diffusers](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers)
