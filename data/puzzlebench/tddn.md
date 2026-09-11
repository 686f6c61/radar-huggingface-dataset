# PuzzleBench/TDDN

## Resumen

PuzzleBench/TDDN es un repositorio de modelo alojado en HuggingFace por el usuario PuzzleBench. La única información sustantiva publicada en su model card es un aviso de traslado: el modelo ha dejado de mantenerse en esa ruta y ahora se aloja en PuzzlePerception/TDDN. No se documenta arquitectura, tamaño, contexto, licencia ni idiomas en el repositorio original.

El repositorio original acumula 0 descargas y 0 likes, y sus metadatos no declaran pipeline de inferencia, licencia ni idiomas soportados. Los únicos tags registrados son de región (region:us). La fecha de creación indicada en los metadatos es el 11 de septiembre de 2026, con última actualización el mismo día, un intervalo de unos seis minutos que sugiere que el repositorio se creó únicamente como redirección al nuevo espacio.

No se dispone de ninguna especificación técnica verificable, por lo que esta ficha se limita a constatar el estado del repositorio y a señalar la ruta vigente. Cualquier evaluación técnica del modelo debe realizarse sobre PuzzlePerception/TDDN, donde el autor indica que se mantiene el proyecto, y no sobre la copia aquí descrita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |
| Estado del repositorio | obsoleto, redirige a PuzzlePerception/TDDN |
| Repositorio sucesor | PuzzlePerception/TDDN |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Fecha de creacion (metadatos) | 2026-09-11 |
| Ultima actualizacion (metadatos) | 2026-09-11 |

## Arquitectura y entrenamiento

No disponible. La model card del repositorio PuzzleBench/TDDN no incluye ninguna descripción de arquitectura, composición del dataset, número de tokens de entrenamiento ni método de ajuste (RLHF, DPO u otros). El contenido publicado se limita al aviso de traslado a PuzzlePerception/TDDN.

Tampoco se documentan innovaciones técnicas asociadas (atención lineal, decodificación especulativa, mezcla de expertos, arquitecturas híbridas u otras). Para obtener información de arquitectura y entrenamiento habría que consultar la model card del repositorio sucesor, que no forma parte de la información proporcionada en esta búsqueda.

## Capacidades

No se ha publicado información sobre las capacidades del modelo en el repositorio analizado. No es posible confirmar ninguno de los siguientes puntos sin datos del autor:

- Generación de texto, razonamiento, código o matemáticas: no disponible.
- Capacidades de visión, audio o multimodalidad: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.
- Modos especiales (thinking mode, decodificación con razonamiento explícito): no disponible.

La única inferencia posible a partir del nombre del repositorio y de la organización (PuzzleBench, PuzzlePerception) es que se trata de un proyecto de investigación en evaluación de modelos, pero esto no está confirmado por ninguna documentación publicada.

## Casos de uso

No es posible proponer casos de uso concretos y verificables sin especificaciones del modelo. Los escenarios siguientes son marcos genéricos de evaluación, condicionados a que el repositorio sucesor PuzzlePerception/TDDN publique las capacidades, el contexto y la licencia del modelo; no deben tomarse como usos confirmados.

- Integración en pipelines de generación de texto: solo viable si el modelo expone pesos en safetensors o GGUF y una licencia que permita uso comercial; ambos datos están sin publicar.
- Evaluación comparativa en benchmarks académicos: el repositorio no publica resultados, por lo que cualquier comparación exigiría ejecutar la evaluación de forma independiente sobre PuzzlePerception/TDDN.
- Despliegue en servidores de inferencia (vLLM, TGI): depende del formato de pesos y de la arquitectura, no disponibles.
- Ejecución en hardware de consumo mediante llama.cpp u Ollama: depende del número de parámetros y del nivel de cuantización soportado, no disponibles.
- Asistencia en código o razonamiento multi-paso: no confirmado por el autor.
- Uso como componente de un sistema de agentes con tool calling: no confirmado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

Sin el recuento de parámetros, la longitud de contexto y el formato de pesos no es posible realizar ninguna estimación fundamentada de memoria o rendimiento.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del modelo. La organización PuzzlePerception publica otros modelos, pero no se dispone de sus fichas ni de datos que permitan establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PuzzleBench/TDDN | no disponible | no disponible | no disponible | repositorio redirigido |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio PuzzleBench/TDDN está obsoleto: el autor indica que el modelo se mantiene ahora en PuzzlePerception/TDDN. Descargar desde la ruta antigua puede dar acceso a una versión desactualizada o vacía.
- No se declara licencia, por lo que no puede asumirse ningún derecho de uso comercial, modificación o redistribución.
- No se declara idioma soportado, por lo que no puede garantizarse comportamiento correcto en castellano ni en ningún otro idioma.
- No se publican sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Con 0 descargas y 0 likes no existe evidencia de uso en producción ni de validación por parte de la comunidad.
- Los metadatos de fecha (creación y actualización el mismo día, en 2026) y la ausencia total de documentación sugieren que el repositorio es un contenedor de redirección, no una publicación de modelo evaluable.

## Enlaces

- Repositorio original (obsoleto): https://huggingface.co/PuzzleBench/TDDN
- Repositorio sucesor indicado por el autor: https://huggingface.co/PuzzlePerception/TDDN
- Catálogo de modelos de la organización sucesora: https://huggingface.co/PuzzlePerception/models
- Paper, blog, repositorio de código o demo: no disponible
