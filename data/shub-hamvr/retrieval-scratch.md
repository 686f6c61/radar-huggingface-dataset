# SHUB-HAMVR/retrieval-scratch

## Resumen

El modelo `SHUB-HAMVR/retrieval-scratch` es una implementación compacta y personalizada de la arquitectura **Beit** orientada a tareas de *retrieval* (recuperación de información). Desarrollado por el usuario SHUB-HAMVR, se presenta como un artefacto experimental de escala **nano**, pensado para pruebas de humo, revisión de código y experimentos controlados, no como un modelo listo para producción. Con solo 24.832 parámetros, su tamaño es mínimo, lo que lo hace útil para validar el flujo de entrenamiento o la integración de componentes, pero carece de cualquier capacidad real de recuperación entrenada.

El repositorio incluye un checkpoint de inicialización (`model.safetensors`) que no ha sido entrenado ni auditado. La configuración arquitectónica emplea atención *sparse*, co-atención, activación *swish* y normalización *batchnorm*. No se proporcionan datos sobre longitud de contexto, idiomas soportados ni resultados de benchmarks. Su relevancia actual es limitada: sirve como punto de partida para desarrolladores que quieran explorar arquitecturas de retrieval desde cero, pero no como un modelo utilizable en aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Beit (nano) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en **Beit**, un modelo de tipo transformer con atención *sparse* y un mecanismo de **co-atención** (co-attention) para fusionar información entre consultas y documentos, típico en tareas de retrieval. La activación es *swish* y la normalización se realiza con *batchnorm* en lugar de *layernorm*, una elección poco común en transformers. El checkpoint incluido es una inicialización aleatoria, no un modelo entrenado; no se documenta ningún proceso de entrenamiento, ni número de tokens, ni composición de dataset, ni técnicas como RLHF o DPO. El autor indica que la configuración por defecto usa el optimizador *lion* con programación *cosine*, pero estos son valores de arranque en el script, no evidencia de una ejecución completada.

## Capacidades

- **Retrieval experimental**: el modelo está diseñado para tareas de recuperación, pero al no estar entrenado, no presenta ninguna capacidad funcional verificada.
- **Pruebas de humo**: puede ejecutarse para comprobar que el flujo de forward/backward funciona correctamente en un entorno de desarrollo.
- **Revisión de código**: su implementación en un único archivo Python (`model.py`) permite inspeccionar y modificar la arquitectura fácilmente.
- **Integración personalizada**: al ser una implementación a medida, requiere un adaptador explícito para usarse con APIs genéricas de carga automática.
- **Sin soporte de tool calling, agentes, visión ni multilingüismo**: no se documenta ninguna de estas capacidades.

## Casos de uso

- **Validación de pipelines de entrenamiento**: el modelo puede usarse para verificar que un script de entrenamiento (por ejemplo, con el optimizador *lion* y schedule *cosine*) funciona de principio a fin, antes de escalar a modelos más grandes.
- **Pruebas de integración en sistemas de retrieval**: sirve como componente mínimo para probar la conexión entre un dataloader, un modelo y una métrica de evaluación, sin coste computacional.
- **Experimentos de arquitectura**: al ser nano y de código abierto, permite modificar la atención *sparse* o la co-atención y medir su efecto en un entorno controlado.
- **Educación e investigación**: útil para estudiantes que quieran entender cómo se implementa un modelo de retrieval desde cero, sin depender de librerías de alto nivel.
- **Generación de checkpoints de referencia**: puede usarse para generar inicializaciones aleatorias consistentes (con semilla fija) y comparar diferentes configuraciones de entrenamiento.
- **Depuración de entornos**: al ser extremadamente pequeño, es ideal para comprobar que CUDA, PyTorch y los formatos de safetensors están correctamente instalados en una máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación y que el checkpoint no está entrenado. Se sugiere una primera evaluación con **Flickr30k** y al menos tres semillas, pero no se aportan datos numéricos.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 MB (24.832 parámetros en FP32 ocupan ~99 KB). Cualquier GPU moderna o incluso una CPU puede ejecutar el modelo sin problemas.
- **GPU recomendadas**: no se requiere ninguna GPU específica; cualquier hardware con PyTorch instalado es suficiente.
- **Compatibilidad con GPUs de consumo**: sí, absolutamente todas (RTX 2060, RTX 4090, etc.) e incluso Raspberry Pi con PyTorch.
- **Opciones de despliegue**: al ser un modelo personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere un script propio o un adaptador.
- **Latencia y throughput**: no disponibles, pero al ser tan pequeño, la inferencia es prácticamente instantánea en cualquier hardware.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (Beit nano para retrieval) en la información proporcionada. Los modelos de retrieval convencionales (como DPR, ColBERT o Sentence-BERT) tienen órdenes de magnitud más de parámetros y están entrenados, por lo que no son directamente comparables.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el archivo `model.safetensors` es una inicialización aleatoria, no un modelo con capacidades de retrieval reales.
- **Sin auditoría de robustez o sesgos**: el autor advierte que no se ha auditado el modelo para robustez, equidad ni transferencia de dominio.
- **Alto riesgo de alucinación**: al no estar entrenado, cualquier salida generada será ruido aleatorio; no debe usarse en producción.
- **Sin soporte de contexto largo**: no se especifica la longitud de contexto, pero dado el tamaño, es probablemente muy limitada.
- **Restricciones de licencia**: aunque la licencia BSD-3-Clause permite uso comercial, el autor recomienda revisar los términos de los datos externos si se usan con datasets como Flickr30k.
- **Requiere adaptador**: las APIs genéricas de HuggingFace no cargarán este modelo sin un adaptador explícito, lo que dificulta su uso en pipelines estándar.

## Enlaces

- [HuggingFace - SHUB-HAMVR/retrieval-scratch](https://huggingface.co/SHUB-HAMVR/retrieval-scratch)
- [Perfil de SHUB-HAMVR en HuggingFace](https://huggingface.co/SHUB-HAMVR)
