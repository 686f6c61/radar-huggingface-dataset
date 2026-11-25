# raquelferna/mae-demo

## Resumen

`raquelferna/mae-demo` es un repositorio experimental publicado en Hugging Face por el usuario raquelferna que contiene una implementación propia de una arquitectura denominada Mae, orientada a tareas de generación. No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de código con un checkpoint de inicialización válido para pruebas de humo (smoke tests). El autor lo describe explícitamente como un punto de partida experimental para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

La arquitectura declarada combina atención lineal con fusión mediante cross attention, activación approx gelu y normalización por batchnorm, en una escala etiquetada como "huge". El checkpoint en safetensors contiene 33.088 parámetros totales, un volumen coherente con una inicialización de juguete y no con un modelo de escala real. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es, por tanto, exclusivamente documental y didáctica: sirve para estudiar cómo se estructura un pipeline de generación con atención lineal y cross attention en PyTorch, no para desplegar cargas de trabajo reales. La model card advierte de que no se reclama ninguna puntuación de benchmark y de que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mae (transformer con atención lineal y fusión por cross attention) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura Mae se describe en la model card con atención lineal, fusión mediante cross attention, activación approx gelu y normalización batchnorm. La escala declarada es "huge", aunque el recuento real de parámetros del checkpoint (33.088) corresponde a una inicialización mínima, no a un modelo de gran tamaño. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto, que emplea el optimizador RMSprop con un esquema de warmup constante.

No se ha ejecutado ningún entrenamiento: el archivo `model.safetensors` se presenta como un checkpoint de inicialización válido para pruebas de humo y el autor indica explícitamente que no se reclama ninguna puntuación de benchmark. No hay información sobre volumen de tokens, composición del dataset, RLHF, DPO ni ninguna otra fase de alineación. Tampoco se documentan innovaciones de decodificación ni mecanismos de atención específicos más allá de la atención lineal y la cross attention ya citadas.

## Capacidades

- Generación de texto: el repositorio está etiquetado para la tarea de generación, pero al no existir un checkpoint entrenado no hay evidencia de calidad generativa.
- Atención lineal: la arquitectura declara atención de complejidad lineal, lo que en teoría facilitaría contextos largos, aunque no se especifica ninguna longitud de contexto concreta.
- Fusión por cross attention: el diseño contempla la combinación de dos flujos de representación mediante cross attention, útil en escenarios multimodales o condicionados, sin que se documente su aplicación concreta.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Estudio de arquitecturas de atención lineal: el código permite inspeccionar cómo se implementa la atención lineal combinada con cross attention en PyTorch, como base para prototipar variantes antes de un entrenamiento real.
- Pruebas de humo de pipelines: el checkpoint de inicialización permite verificar que el flujo de carga, el forward pass y la generación funcionan de extremo a extremo sin necesidad de pesos entrenados.
- Docencia y formación: sirve como ejemplo mínimo y legible de un pipeline de generación con configuración separada (`config.json`, `training_args.json`) para explicar la estructura de un proyecto de modelado.
- Base para experimentos de receta de entrenamiento: la receta por defecto con RMSprop y warmup constante puede tomarse como punto de partida para comparar optimizadores y schedulers en un entorno controlado.
- Referencia para integración de adaptadores: al ser una implementación personalizada, obliga a escribir un adaptador explícito para las APIs de carga automática, lo que resulta útil para aprender a integrar modelos no estándar en frameworks propios.
- Plantilla de repositorio en Hugging Face: el conjunto de archivos (script, README, configuración, pesos) sirve como esqueleto para publicar nuevos experimentos con la documentación mínima exigible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 33.088 parámetros el checkpoint cabe holgadamente en cualquier GPU, e incluso en CPU.
- GPU recomendadas: no aplica para cargas reales; cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) es más que suficiente para ejecutar el ejemplo de prueba de humo.
- Cabe en GPU consumer: sí, en cualquier modelo actual, dado el tamaño mínimo del checkpoint.
- Opciones de despliegue: el autor indica que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, y el repositorio no constituye un modelo entrenado que pueda contrastarse con alternativas de la misma categoría.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es una inicialización para pruebas de humo, no un modelo funcional para generación.
- No se ha auditado en robustez, equidad ni transferencia de dominio, según advierte el propio autor.
- No se declara ningún idioma soportado, por lo que no puede asumirse cobertura multilingüe.
- No se especifica longitud de contexto, tipos de cuantización ni compatibilidad con herramientas de despliegue estándar.
- Riesgo de alucinación: no evaluable, al no existir un modelo entrenado.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero el autor recomienda revisar por separado los términos de los datos de origen si se emplean datasets externos.
- Cualquier resultado obtenido con un futuro checkpoint entrenado deberá documentarse de forma separada de los valores por defecto aquí incluidos.
- Al ser una implementación personalizada, la carga mediante APIs automáticas requiere escribir un adaptador explícito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/raquelferna/mae-demo
