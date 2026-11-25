# MOME-Heritage-in-Motion-Lab/Krea-2-LoRA-nyomat-test

## Resumen

Krea-2-LoRA-nyomat-test es un adaptador LoRA de tipo text-to-image desarrollado por MOME-Heritage-in-Motion-Lab sobre el modelo base Krea 2 de Krea. El adaptador se ha entrenado sobre la variante `krea/Krea-2-Raw` utilizando el conjunto de datos `margin2model/nyomat`, y está pensado para cargarse sobre la variante destilada `krea/Krea-2-Turbo` para inferencia en ocho pasos. Se distribuye en formato Diffusers nativo de Krea 2 como un único fichero `pytorch_lora_weights.safetensors` de aproximadamente 0,8 GB de repositorio.

El modelo resuelve el problema de especializar la generación de imágenes del modelo base Krea 2 hacia el dominio concreto representado por el dataset nyomat, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, permite ajustar el estilo o el contenido generado con un coste computacional y de almacenamiento muy reducido en comparación con un fine-tuning completo, y se integra directamente en el pipeline `Krea2Pipeline` de la librería Diffusers.

Su relevancia actual radica en que demuestra el flujo recomendado por Krea para adaptadores: entrenar sobre RAW y desplegar sobre Turbo con ocho pasos de inferencia y `guidance_scale=0.0`, lo que abarata mucho la generación en producción. No obstante, se trata de un artefacto experimental (sufijo "test" en el nombre, cero likes y 23 descargas en el momento de la consulta), con licencia comunitaria restrictiva y sin documentación sobre el dataset ni sobre métricas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image Krea 2 |
| Parametros totales | no disponible (el adaptador LoRA se distribuye como `pytorch_lora_weights.safetensors`; el modelo base no se incluye en el repo) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el ejemplo oficial usa `torch.bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (con Krea Acceptable Use Policy) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`, formato Diffusers nativo de Krea 2) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base de difusión Krea 2, que se congela durante el entrenamiento. Según la model card, el adaptador se entrenó sobre `krea/Krea-2-Raw` con el dataset `margin2model/nyomat` y está pensado para cargarse sobre `krea/Krea-2-Turbo`, la variante destilada del modelo, para inferencia en ocho pasos. No se especifican en la información disponible el rango del LoRA, el número de pasos de entrenamiento, el tamaño del dataset nyomat, la resolución de entrenamiento ni si se aplicaron técnicas como LoRA con dropout o regularización.

La innovación práctica del flujo es la separación entre entrenamiento y despliegue: se entrena sobre RAW (modelo no destilado) y se infiere sobre Turbo con `num_inference_steps=8` y `guidance_scale=0.0`, lo que reduce drásticamente el coste de generación. El adaptador se almacena en formato Diffusers nativo de Krea 2 y se carga con `pipe.load_lora_weights()` sobre una instancia de `Krea2Pipeline`. No hay información sobre la composición del dataset de entrenamiento, el número de tokens de texto utilizados ni sobre si hubo filtrado o curación de datos.

## Capacidades

- Generación de imágenes text-to-image condicionada por prompt, con resolución configurable (el ejemplo oficial usa 1024x1024).
- Especialización de dominio: el adaptador modula el estilo y el contenido del modelo base Krea 2 hacia el dataset nyomat, cuyo contenido concreto no está documentado en la información disponible.
- Inferencia rápida en ocho pasos sobre `krea/Krea-2-Turbo` con `guidance_scale=0.0`.
- Integración nativa con la librería Diffusers mediante `Krea2Pipeline` y `load_lora_weights`.
- Compatibilidad con `enable_model_cpu_offload()` para reducir el uso de VRAM en GPUs de menor capacidad.
- Control de reproducibilidad mediante semilla (`torch.Generator`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step, visión, audio ni modos de pensamiento; al ser un modelo de imagen, no aplican.

## Casos de uso

- Generación de imágenes de dominio específico: cargando el LoRA sobre Krea-2-Turbo se obtienen imágenes con el estilo o contenido del dataset nyomat, útil cuando se necesita un look concreto sin reentrenar el modelo completo.
- Prototipado rápido de estilos visuales: al ser un adaptador de 0,8 GB, se puede intercambiar entre experimentos sin duplicar el modelo base, lo que acelera la iteración en estudios de diseño.
- Producción de imágenes a bajo coste: la inferencia en ocho pasos con `guidance_scale=0.0` sobre Turbo reduce el tiempo de generación, adecuado para pipelines que necesitan throughput alto.
- Despliegue en GPUs de consumo: con `enable_model_cpu_offload()` y `bfloat16`, el ejemplo oficial está pensado para ejecutarse en hardware moderado, lo que facilita pruebas locales.
- Investigación sobre adaptadores LoRA en difusión: sirve como referencia del flujo RAW-para-entrenar / Turbo-para-inferir recomendado por Krea.
- Conservación y patrimonio digital: dado el perfil del autor (MOME Heritage in Motion Lab), el adaptador puede emplearse para generar material visual relacionado con colecciones o motivos del dataset nyomat, siempre que la licencia lo permita.
- Generación de imágenes reproducibles en experimentos: el uso de semilla fija permite comparar variaciones de prompt con el mismo adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el ejemplo usa `torch_dtype=torch.bfloat16` y `enable_model_cpu_offload()`, lo que sugiere que el pipeline completo no cabe cómodamente en GPUs de gama baja sin offload.
- GPU recomendadas: no disponible en la información proporcionada; el ejemplo oficial emplea `device="cuda"` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No confirmado; el uso de CPU offload en el ejemplo apunta a que se busca compatibilidad con GPUs de VRAM limitada, pero no se indica un mínimo.
- Opciones de despliegue: Diffusers (`Krea2Pipeline`), con `load_lora_weights` y `enable_model_cpu_offload`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a un modelo de difusión de este tipo).
- Latencia y throughput estimados: no disponible; solo se sabe que la inferencia se realiza en ocho pasos sobre Krea-2-Turbo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (adaptadores LoRA text-to-image sobre Krea 2 u otros modelos de difusión).

## Limitaciones y advertencias

- Artefacto experimental: el nombre incluye "test", tiene cero likes y 23 descargas, y no hay documentación sobre calidad, dataset ni evaluación.
- Dataset de entrenamiento no documentado: se desconoce el contenido, tamaño y posibles sesgos de `margin2model/nyomat`, lo que impide evaluar sesgos de género, etnia, cultura o estilo.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido incoherente o no fiel al prompt, especialmente con prompts fuera del dominio de entrenamiento.
- Licencia restrictiva: la Krea 2 Community License permite uso comercial solo por debajo de un umbral de ingresos anuales; por encima se requiere licencia enterprise de Krea. Además, los despliegues deben implementar las salvaguardas exigidas por la licencia y cumplir la Krea Acceptable Use Policy.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma; requiere descargar `krea/Krea-2-Turbo` (o Raw) y cumplir también su licencia.
- Idiomas no especificados: no hay información sobre el soporte multilingüe de los prompts.
- Sin garantías de producción: al no haber benchmarks ni evaluación publicada, no se recomienda su uso en entornos críticos sin una validación propia.
- Fecha de creación futura (2026-11-19) en los metadatos: conviene verificar la vigencia y el estado del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/MOME-Heritage-in-Motion-Lab/Krea-2-LoRA-nyomat-test
- Modelo base Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Modelo base Raw: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Política de uso aceptable de Krea 2: https://www.krea.ai/krea-2-use-policy
- Dataset nyomat: `margin2model/nyomat` (referenciado en la model card; no se proporciona URL directa)
- Diffusers: https://github.com/huggingface/diffusers
