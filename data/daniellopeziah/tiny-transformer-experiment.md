# DANIELLOPEZiah/tiny-transformer-experiment

## Resumen

Tiny Transformer for Classification es un experimento educativo publicado por DANIELLOPEZiah (Daniel Lopez) en Hugging Face bajo licencia MIT. Se trata de una implementación mínima y transparente de un Transformer de escala "tiny" con atención dispersa, fusión tensorial, activación aproximada GELU y normalización GroupNorm, orientada a tareas de clasificación. El checkpoint incluido en el repositorio (49.600 parámetros en formato safetensors) es una inicialización válida para pruebas de humo, no un modelo entrenado: la model card indica explícitamente que no se presentan resultados de benchmarks y que el entrenamiento real queda como trabajo futuro.

El proyecto tiene valor como base de código clara y reproducible para entender arquitecturas Transformer y para diseñar experimentos controlados. Su relevancia es didáctica y de prototipado, no productiva. Incluye un script Python ejecutable (`model.py`) con un bloque `__main__` que sirve como ejemplo de smoke test, además de `config.json` y `training_args.json` con la configuración por defecto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención dispersa, fusión tensorial, activación approx GELU, normalización GroupNorm) |
| Parametros totales | 49.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Transformer en miniatura con atención dispersa y fusión tensorial. La activación usa una aproximación GELU y la normalización se realiza con GroupNorm. Todos los componentes están implementados en un único archivo Python (`model.py`), pensado para ser legible y modificable.

En cuanto al entrenamiento, el checkpoint `model.safetensors` es una inicialización válida para smoke tests, no un checkpoint entrenado. La model card aclara que no se reclama ningún resultado de benchmark. El experimento define una receta por defecto con el optimizador Lion y un programador de calentamiento constante (`constant warmup`), pero estos valores son puntos de partida en el script y no evidencia de una ejecución completa. No se menciona RLHF, DPO ni ningún tipo de ajuste posterior al entrenamiento.

## Capacidades

- Arquitectura preparada para clasificación: el script incluye un ejemplo ejecutable de smoke test, pero el modelo no ha sido entrenado, por lo que no clasifica de forma útil todavía.
- Generación de texto: no disponible (no es un modelo de lenguaje generativo).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.
- Código educativo: `model.py` es un artefacto principal con un bloque `__main__` que puede ejecutarse con `python model.py --help` para inspeccionar el ejemplo.

## Casos de uso

- Aprendizaje de arquitecturas Transformer: `model.py` es una implementación mínima que permite estudiar cómo funciona la atención dispersa y la fusión tensorial en un contexto real, sin la complejidad de un modelo grande.
- Pruebas de humo en integración continua: introducir el script en un pipeline de CI/CD para verificar que la implementación se ejecuta correctamente tras cambios en el código.
- Prototipado experimental: usar la base de código para probar variantes de mecanismos de atención, capas de normalización o funciones de activación con datasets pequeños.
- Experimentos de eficiencia: medir tiempo de ejecución y uso de memoria de una implementación Transformer muy pequeña, comparando distintas configuraciones sin necesidad de infraestructura costosa.
- Desarrollo de adaptadores de carga: al ser una implementación personalizada, sirve para practicar la creación de adaptadores que permitan cargar el modelo con APIs automáticas de Hugging Face.
- Base para entrenar un clasificador pequeño: si se entrena con un dataset etiquetado propio y se documentan las métricas, el modelo puede convertirse en un clasificador experimental para dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay mediciones publicadas. Dado el tamaño del modelo (49.600 parámetros), la ejecución es posible en cualquier GPU o CPU con PyTorch instalado.
- GPU recomendadas: no se ha documentado ninguna GPU concreta.
- En consumer GPU: sí, el modelo es trivial y cabe en cualquier hardware moderno.
- Opciones de despliegue: no se ha documentado soporte para vLLM, llama.cpp, Ollama ni TGI. La carga requiere un adaptador explícito porque es una implementación personalizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. En la información revisada no se han encontrado modelos comparables de la misma escala y propósito que puedan utilizarse como referencia.

## Limitaciones y advertencias

- El checkpoint incluido es de inicialización y no ha sido entrenado.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, como indica la propia model card.
- Los resultados de un futuro checkpoint entrenado deben documentarse por separado de los valores por defecto del repositorio.
- No se recomienda su uso en producción sin un entrenamiento y una validación adecuados.
- No se han publicado métricas de rendimiento ni de calidad.
- La carga con APIs automáticas de Hugging Face requiere un adaptador explícito, ya que la implementación es personalizada.
- La licencia MIT permite uso comercial, pero al utilizar datasets externos hay que revisar los términos de esos datos por separado.
- No es un modelo generativo, por lo que el riesgo de alucinación no es aplicable en el sentido habitual.

## Enlaces

- Hugging Face: https://huggingface.co/DANIELLOPEZiah/tiny-transformer-experiment
- Perfil de Hugging Face del autor: https://huggingface.co/DANIELLOPEZiah
- GitHub (repositorio relacionado): https://github.com/ConversionPsychology/AI-Advancements
