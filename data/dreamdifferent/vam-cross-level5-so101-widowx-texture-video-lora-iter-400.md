# dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-400

## Resumen

Este repositorio contiene un checkpoint LoRA de adaptación para el modelo Video2World de MimicVideo, desarrollado por el usuario `dreamdifferent` en HuggingFace. Se trata de un adaptador entrenado específicamente para la generación de vídeo robótico con el brazo WidowX, utilizando dos cámaras simultáneas (esquina y frontal) y una instrucción textual concreta: "pick up the candle and place it into the bowl". El checkpoint corresponde a la iteración 400 de un entrenamiento más largo, y está diseñado para cargarse sobre un backbone fusionado concreto (`dreamdifferent/widowx250-video-fused`), no como modelo independiente.

La relevancia de este modelo radica en su enfoque: en lugar de entrenar un modelo de vídeo genérico, se aplica una adaptación de bajo rango (LoRA) sobre un modelo de difusión de vídeo ya preentrenado, lo que permite especializarlo en una tarea de manipulación robótica con un coste de entrenamiento reducido. El repositorio incluye los artefactos necesarios para reproducir la inferencia, aunque el dataset de entrenamiento no se distribuye y está sujeto a políticas de acceso externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre DiT fusionado (fused_video2world_dit) de MimicVideo |
| Parametros totales | no disponible (el repo pesa 3.7 GB, pero el checkpoint LoRA es un adaptador) |
| Parametros activos | no disponible (no se especifica el rango del LoRA, aunque el nombre sugiere r=256) |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instrucción de entrenamiento está en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente .pt o safetensors, no se especifica) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) diseñado para aplicarse sobre un backbone de tipo `fused_video2world_dit`, que combina un modelo de difusión de vídeo (Video2World) con una fusión previa de LoRA de WidowX/Bridge. El backbone base es el repositorio `dreamdifferent/widowx250-video-fused` en su revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`, con un checkpoint de 3.9 GB. El adaptador se entrena sobre este backbone ya fusionado, no sobre el modelo Bridge original, lo que es un requisito crítico para una carga correcta.

El entrenamiento se realizó con un dataset de 158 episodios y 54 261 frames, capturados con dos cámaras (`corner_cam` y `front_cam`) y combinados en una vista apilada horizontalmente (`hstack`) a 5 Hz. La instrucción textual asociada es "pick up the candle and place it into the bowl". El proceso de entrenamiento utiliza el código y configuración de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`), junto con un tokenizador de vídeo y un codificador de texto T5-11B. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser supervisado directamente sobre los datos de vídeo.

## Capacidades

- Generación de vídeo condicionada por instrucción textual para tareas de manipulación robótica.
- Procesamiento de entrada de dos cámaras simultáneas (esquina y frontal) con vista apilada horizontalmente.
- Adaptación específica a la tarea de recoger una vela y colocarla en un cuenco con el brazo WidowX.
- Integración con el ecosistema MimicVideo, incluyendo tokenizador de vídeo y codificador T5.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Simulación de tareas robóticas: el modelo puede generar vídeos sintéticos de la ejecución de la tarea de manipulación, útiles para validar políticas de control antes de desplegarlas en el robot real.
- Aumento de datos para entrenamiento de políticas: los vídeos generados pueden servir como datos adicionales para entrenar modelos de visión-accion o políticas de imitación, especialmente en entornos con pocos datos reales.
- Evaluación de modelos de planificación: dado que el modelo genera vídeo condicionado a una instrucción, puede usarse para probar si un planificador produce secuencias visualmente coherentes y plausibles.
- Desarrollo de sistemas de teleoperación asistida: la generación de vídeo puede ayudar a previsualizar movimientos del brazo robótico antes de ejecutarlos, mejorando la seguridad en entornos delicados.
- Investigación en modelos de mundo (world models): el adaptador demuestra cómo especializar un modelo de vídeo genérico en un dominio robótico concreto mediante LoRA, sirviendo como caso de estudio para técnicas de adaptación eficiente.
- Reproducción de experimentos: al estar disponible el checkpoint y los artefactos de configuración, otros investigadores pueden reproducir el entrenamiento o la inferencia para comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de generación de vídeo robótico, no de un modelo de lenguaje o razonamiento general.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información proporcionada.
- El backbone base (`fused_video2world_dit`) tiene un checkpoint de aproximadamente 3.9 GB, por lo que se requiere una GPU con suficiente memoria para cargarlo junto con el adaptador LoRA y el tokenizador de vídeo.
- Dado el tamaño del modelo de difusión y el codificador T5-11B, es probable que se necesite una GPU de gama alta (por ejemplo, A100, H100 o RTX 4090 con al menos 24 GB de VRAM), pero este dato no está confirmado.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.). El modelo está pensado para usarse con el código de MimicVideo, que probablemente requiera PyTorch y un entorno de inferencia personalizado.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para generación de vídeo robótico con MimicVideo). El repositorio es específico y no se han encontrado alternativas directas en la búsqueda web. Se recomienda consultar el perfil del autor en HuggingFace para ver otros adaptadores similares, como el de KUKA IIWA14, aunque no se dispone de detalles suficientes para una comparación rigurosa.

## Limitaciones y advertencias

- El modelo es un adaptador, no un modelo autónomo: requiere cargar el backbone exacto `dreamdifferent/widowx250-video-fused` en la revisión especificada. Cargar un backbone distinto (por ejemplo, el Bridge original) produciría resultados incorrectos.
- El entrenamiento se limita a una única tarea (recoger una vela y colocarla en un cuenco) y a un robot concreto (WidowX). No se puede esperar generalización a otras tareas o robots sin reentrenamiento.
- El dataset de entrenamiento no está incluido y está sujeto a políticas de acceso externas. Los usuarios deben cumplir con los términos de MimicVideo, NVIDIA Cosmos y los checkpoints base.
- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o de redistribución.
- No se reportan sesgos conocidos, pero al ser un modelo entrenado con datos de un entorno robótico específico, puede presentar sesgos hacia las condiciones de iluminación, fondo o configuración de la cámara de los datos de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir secuencias que no corresponden a la física real del robot o del entorno, lo que debe tenerse en cuenta en aplicaciones de simulación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-video-lora-iter-400
- Perfil del autor en HuggingFace: https://huggingface.co/dreamdifferent
- Datasets del autor: https://huggingface.co/dreamdifferent/datasets
- Repositorio del backbone requerido: `dreamdifferent/widowx250-video-fused` (revisión `f0cea76b62c5dd66b06b9f965932ddea32a7b546`)
- Código de MimicVideo (commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`): no se proporciona URL directa en la información disponible.
