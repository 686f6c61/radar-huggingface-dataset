# leejet/FLUX.1-schnell-gguf

## Resumen

FLUX.1-schnell-gguf es la versión cuantizada en formato GGUF del modelo de generación de imágenes FLUX.1-schnell desarrollado por Black Forest Labs. La conversión y publicación corre a cargo de leejet, autor del proyecto stable-diffusion.cpp, y está pensada para ejecutar FLUX en hardware con recursos limitados mediante dicha implementación en C/C++.

El modelo base FLUX.1-schnell es un transformer de difusión (flow matching) de aproximadamente 11.900 millones de parámetros orientado a la síntesis texto-a-imagen con un número reducido de pasos de muestreo. Esta versión GGUF mantiene la licencia Apache 2.0 del original, lo que la hace atractiva para uso comercial y para integración en herramientas locales.

Su relevancia actual radica en que permite ejecutar un modelo de imagen de gran calidad en GPUs de consumo con 6 GB o incluso 4 GB de VRAM, algo inviable con los pesos originales en precisión completa. El repositorio acumula más de 87.000 descargas, lo que refleja un interés considerable por parte de la comunidad de inferencia local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching), base FLUX.1-schnell |
| Parámetros totales | 11.891.178.560 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantización | GGUF (distintos niveles de cuantización publicados en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido con stable-diffusion.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente, FLUX.1-schnell, es un transformer de difusión basado en flow matching condicionado por texto, diseñado para generar imágenes en muy pocos pasos de muestreo (la variante "schnell" está optimizada para inferencia rápida). Los pesos originales suman 11.891.178.560 parámetros según los safetensors del modelo base.

Esta ficha corresponde exclusivamente a la conversión a GGUF realizada por leejet mediante stable-diffusion.cpp. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni el uso de RLHF/DPO. La model card únicamente indica que los ficheros se han convertido con stable-diffusion.cpp y que la licencia de los ficheros cuantizados sigue la del modelo original (Apache 2.0).

## Capacidades

- Generación de imágenes a partir de descripciones textuales en inglés (texto-a-imagen).
- Inferencia con pocos pasos de muestreo, característica de la variante schnell.
- Ejecución en hardware de gama baja mediante stable-diffusion.cpp (GPU con 6 GB o incluso 4 GB de VRAM según la model card).
- Distribución en múltiples niveles de cuantización GGUF para ajustar calidad y consumo de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en equipos de consumo: usar stable-diffusion.cpp con una cuantización GGUF adecuada permite generar imágenes en GPUs con 6 GB o 4 GB de VRAM, sin necesidad de estaciones de trabajo con GPUs de datacenter.
- Prototipado rápido de conceptos visuales: la variante schnell está pensada para pocos pasos de muestreo, lo que agiliza iteraciones de diseño y exploración de ideas en local.
- Integración en aplicaciones de escritorio o herramientas offline: el formato GGUF y la implementación en C/C++ facilitan el despliegue en entornos sin Python ni frameworks pesados.
- Creación de contenido para blogs y documentación técnica: generación local de ilustraciones a partir de prompts en inglés, con control total sobre los datos al no depender de servicios en la nube.
- Evaluación y experimentación con cuantizaciones: el repositorio permite comparar distintos niveles GGUF para medir el compromiso entre calidad de imagen y uso de VRAM.
- Pipelines de generación por lotes en hardware modesto: al caber en GPUs de consumo, se pueden montar granjas de generación de bajo coste para producir imágenes en volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: la model card indica que FLUX puede ejecutarse con stable-diffusion.cpp en GPUs con 6 GB o incluso 4 GB de VRAM, dependiendo de la cuantización GGUF elegida.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el requisito indicado es de cantidad de VRAM, no de gama.
- GPU de consumo: sí, cabe en GPUs de consumo con al menos 4-6 GB de VRAM según la cuantización.
- Opciones de despliegue: stable-diffusion.cpp (implementación de referencia para estos ficheros GGUF, según la model card). No se documentan otras opciones en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| FLUX.1-schnell-gguf (leejet) | 11.891.178.560 (base) | GGUF | Apache 2.0 | Cuantización de FLUX.1-schnell para inferencia local de bajo VRAM |
| FLUX.1-schnell (Black Forest Labs) | 11.891.178.560 | safetensors | Apache 2.0 | Modelo original texto-a-imagen, requiere más VRAM |
| Otras cuantizaciones GGUF de FLUX.1-schnell | no disponible | GGUF | Apache 2.0 (heredada) | Alternativas de la comunidad; datos no disponibles en esta búsqueda |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo texto-a-imagen: no procesa ni genera texto; los prompts deben estar en inglés según el campo de idiomas del repositorio.
- Solo se declara soporte de inglés; el rendimiento con prompts en otros idiomas no está documentado.
- Al ser una cuantización, puede existir una pérdida de calidad de imagen respecto a los pesos originales en precisión completa; el grado depende del nivel GGUF elegido.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base FLUX.1-schnell; no se documentan evaluaciones de sesgo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base original antes de desplegar en producción.
- El despliegue documentado se limita a stable-diffusion.cpp; no se garantiza compatibilidad con otros runners en la información disponible.
- Los requisitos de 4-6 GB de VRAM son orientativos según la model card y dependen de la cuantización y la resolución de salida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leejet/FLUX.1-schnell-gguf
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.1-schnell
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- Documentación de FLUX en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/models/flux.md
