# kilic9970/deit-retrieval-playground

## Resumen

Este repositorio contiene una implementación compacta y personalizada de **DeiT** (Data-efficient Image Transformers) orientada a tareas de **retrieval** (recuperación de información visual). El autor, kilic9970, la presenta como una configuración "nano" pensada para revisión de código, pruebas de humo (smoke tests) y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción.

El modelo tiene únicamente 33.088 parámetros, lo que lo convierte en un artefacto extremadamente ligero. Incluye un checkpoint de inicialización en formato safetensors, pero no ha sido entrenado con ningún dataset, por lo que no se puede utilizar directamente para tareas reales de retrieval sin un entrenamiento previo. Su relevancia actual es limitada: sirve como punto de partida para desarrolladores que quieran experimentar con arquitecturas DeiT adaptadas a retrieval, o como base para pruebas de integración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (configuracion nano) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en DeiT, con una escala "nano" (muy reducida). Segun la model card, emplea atencion de ventana deslizante (sliding window), fusion mediante co-atencion (co-attention), activacion GELU y normalizacion RMSNorm. No se especifica el numero de capas, cabezas de atencion ni dimensiones ocultas, pero el recuento de parametros (33K) sugiere una red extremadamente pequena.

El checkpoint incluido (`model.safetensors`) es una inicializacion valida para pruebas de humo, no un modelo entrenado. No se ha realizado ningun entrenamiento con datos reales. La configuracion por defecto del experimento usa el optimizador RMSprop con un programa de aprendizaje polinomial, pero estos son valores iniciales del script, no evidencia de una ejecucion completada. No se ha aplicado RLHF, DPO ni ninguna tecnica de ajuste posterior.

## Capacidades

- **Retrieval visual**: el modelo esta disenado para tareas de recuperacion de imagenes, aunque no se han verificado capacidades concretas al no estar entrenado.
- **Implementacion personalizada**: requiere un adaptador explicito para cargarse con APIs genericas de HuggingFace; no es compatible con `AutoModel` sin modificaciones.
- **Ejecucion de pruebas**: sirve para validar el flujo de entrenamiento, la logica de atencion y la integracion del pipeline en entornos de desarrollo.
- **Sin capacidades de texto, codigo, audio o vision general**: al ser un modelo de vision puro y sin entrenar, no ofrece ninguna funcionalidad utilizable en produccion.

## Casos de uso

- **Pruebas de humo en pipelines de retrieval**: el modelo permite verificar que el codigo de entrenamiento, la carga de datos y la inferencia funcionan correctamente antes de lanzar experimentos con modelos mas grandes.
- **Desarrollo de adaptadores para DeiT**: al ser una implementacion personalizada, es util para aprender a integrar arquitecturas no estandar con el ecosistema HuggingFace.
- **Experimentos de arquitectura**: investigadores pueden modificar la configuracion (atencion, fusion, normalizacion) y evaluar el impacto en tareas de retrieval a pequena escala.
- **Validacion de metricas en datasets pequenos**: siguiendo la guia de evaluacion del autor, se puede usar con Flickr30k para probar el flujo de evaluacion, aunque los resultados no seran significativos sin entrenamiento.
- **Ensenanza y aprendizaje**: como ejemplo didactico de una implementacion DeiT compacta, puede servir para estudiar los componentes internos del modelo.
- **Base para entrenamiento desde cero**: si se dispone de datos y recursos, el checkpoint de inicializacion puede usarse como punto de partida para entrenar un modelo de retrieval real, aunque su capacidad es muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reivindica ninguna puntuacion de benchmark y que el checkpoint no es un modelo entrenado. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni metricas de retrieval como Recall@K.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero con 33.088 parametros, el uso de memoria es despreciable (menos de 1 MB en precision de 32 bits). Cualquier GPU moderna, incluso una integrada, puede ejecutarlo.
- **GPU recomendadas**: no aplica; cualquier hardware con soporte PyTorch es suficiente.
- **Compatibilidad con GPU de consumo**: si, cualquier GPU consumer (RTX 2060, GTX 1650, etc.) lo ejecuta sin problemas.
- **Opciones de despliegue**: al ser un modelo de vision personalizado, no se puede usar directamente con vLLM, llama.cpp u Ollama (orientados a LLMs). Se requiere un script Python propio (como `pipeline.py`) para cargar y ejecutar el modelo.
- **Latencia y throughput**: no disponibles, pero al ser tan pequeno, la inferencia es practicamente instantanea en CPU.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en el repositorio del autor ni en la informacion proporcionada. Dado que es una implementacion experimental sin entrenar, no tiene sentido compararlo con modelos de retrieval establecidos como CLIP, SigLIP o DINOv2.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicializacion aleatoria; no produce resultados utiles para retrieval real.
- **Sin garantias de robustez**: la model card advierte que no se ha auditado para robustez, equidad ni transferencia de dominio.
- **Alucinacion y sesgos**: al no tener datos de entrenamiento, no aplica, pero cualquier uso en produccion seria completamente invalido.
- **Licencia**: Apache-2.0 permite uso comercial, pero los terminos de los datasets externos (como Flickr30k) deben revisarse por separado.
- **Integracion limitada**: requiere un adaptador explicito; no funciona con APIs genericas de HuggingFace.
- **Sin soporte de contexto largo ni multilingue**: es un modelo de vision puro, sin capacidades de texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kilic9970/deit-retrieval-playground)
- [Perfil del autor en HuggingFace](https://huggingface.co/kilic9970)
