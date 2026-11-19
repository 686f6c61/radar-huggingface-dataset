# Jomify/MangaTrans-Diffusion-v3

## Resumen

MangaTrans-Diffusion v3 es un modelo de difusión de tipo transformer (DiT) de 119,3 millones de parámetros desarrollado por Jomify para una tarea muy concreta: renderizar texto chino suministrado por el usuario sobre páginas de manga japonesas ya existentes. No es un modelo de traducción ni de OCR; el llamador debe aportar la página original, las cadenas en chino, las cajas de maquetación y, opcionalmente, las cajas de borrado. El modelo se encarga únicamente de la fase de rotulación (lettering) sobre la imagen.

La arquitectura es un DiT personalizado de 16 capas, anchura 768 y 12 cabezas de atención, entrenado desde cero con un objetivo de flujo rectificado (rectified flow) que parte del latente de origen más ruido escalado a 0,5. Utiliza como códec de imagen un VAE congelado de FLUX.1-dev (16 canales latentes, stride 8) que no se distribuye con el modelo y debe obtenerse por separado bajo sus propios términos. La inferencia se realiza por teselas de 64 píxeles latentes (512 píxeles de imagen) con solapamiento de 48/384.

El modelo es relevante por su enfoque especializado: en lugar de generar páginas completas, edita regiones concretas respetando el arte subyacente y sustituyendo el texto original por caracteres chinos. Frente a la versión v2 entrenada solo con pares reales, la v3 incorpora variantes sintéticas y eleva la precisión de caracteres CJK del 60,7 % al 72,1 % en la evaluación histórica del proyecto. La licencia MIT de los pesos es permisiva, aunque el VAE dependiente y los datos de entrenamiento arrastran restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT personalizado, 16 capas, anchura 768, 12 cabezas |
| Parámetros totales | 119.291.712 (119,3 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; teselas de 64 píxeles latentes / 512 píxeles de imagen) |
| Tipos de cuantización | no disponible (pesos publicados en float16 EMA) |
| Idiomas soportados | chino (zh), japonés (ja) |
| Licencia | MIT (pesos DiT y código original); VAE FLUX.1-dev bajo términos propios |
| Formato de pesos | safetensors (`model.safetensors`, ~239 MB) + `config.json` |
| Condicionamiento | latente de origen + imagen de glifos (64 canales plegados) |
| Objetivo de entrenamiento | rectified flow desde origen + ruido escalado a 0,5 |
| Códec de imagen | VAE congelado de FLUX.1-dev, 16 canales latentes, stride 8 (dependencia externa) |
| Teselado de inferencia | 64 píxeles latentes / stride 48 (512 / 384 píxeles de imagen) |
| Checkpoint publicado | paso 40.000, pesos EMA en float16 |
| Tamaño del repo | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) diseñado específicamente para edición condicionada de regiones de imagen. Recibe como condición el latente de la página de origen junto con una imagen de glifos que codifica el texto chino a renderizar, plegada en 64 canales. El objetivo es un flujo rectificado que arranca desde el latente de origen más ruido escalado a 0,5, lo que sitúa el proceso cerca de la imagen original y favorece la preservación del arte circundante. Solo el DiT se entrenó desde cero; el VAE es el de FLUX.1-dev, congelado y no incluido en el repositorio.

El entrenamiento combinó aproximadamente 1,8 mil pares reales de páginas japonés/chino alineadas con unas 7 mil variantes sintéticas de texto muestreadas en proporción 1:1 respecto a los pares reales. Las páginas de entrenamiento proceden de ediciones escaneadas de manga adulto con derechos de autor, y ni las páginas, ni el texto OCR, ni las cachés de latentes, ni las imágenes derivadas se distribuyen. La evaluación histórica se realizó sobre 215 páginas reservadas de obras no vistas, con 2.864 líneas y unos 14,7 mil caracteres, leyendo de vuelta los recortes de línea generados mediante reconocimiento de RapidOCR.

## Capacidades

- Renderizado de texto chino sobre páginas de manga japonesas existentes, respetando el arte subyacente fuera de las cajas de edición.
- Edición image-to-image condicionada por cajas de maquetación y cajas de borrado opcionales.
- Generación de glifos CJK con soporte de fuentes chinas externas (por ejemplo, Noto CJK).
- Procesamiento por teselas con solapamiento, lo que permite cubrir páginas de resolución arbitraria.
- Integración con un pipeline propio (`PageTranslator`) en lugar de pipelines estándar de Diffusers o Transformers.
- Soporte de entrada en japonés (página original) y salida en chino (texto renderizado).
- No incluye OCR, traducción ni planificación de maquetación: esas fases quedan fuera del modelo.

## Casos de uso

- Rotulación automatizada de scanlations: dado un capítulo con la traducción china ya producida y las cajas de diálogo definidas, el modelo sustituye el texto japonés por el chino tesela a tesela, preservando el arte de los bocadillos.
- Investigación en edición de imágenes consciente de tipografía: sirve como banco de pruebas para estudiar cómo los modelos de difusión manejan el renderizado de caracteres complejos sobre fondos variables.
- Herramienta de asistencia para equipos de traducción: el traductor aporta las cadenas y el maquetador define las cajas; el modelo se encarga del renderizado final, reduciendo el trabajo manual de recolocación de texto.
- Prototipado de pipelines de localización de cómic: integrado tras un OCR y un motor de traducción, permite evaluar de extremo a extremo la calidad visual del resultado antes de invertir en rotulación manual.
- Generación de material de evaluación para reconocedores OCR: las páginas renderizadas con texto conocido permiten construir conjuntos de prueba controlados para medir la precisión de lectores CJK.
- Edición selectiva de regiones con borrado: usando cajas de borrado, se puede eliminar texto original y renderizar el nuevo sin alterar el resto de la página, útil para revisiones puntuales de una traducción.
- Docencia y demostración técnica: al ser un modelo pequeño (119 M) con código abierto, sirve para explicar el funcionamiento de un DiT condicionado con flujo rectificado en un contexto realista.

## Benchmarks y rendimiento

Evaluación histórica del proyecto sobre 215 páginas reservadas de obras no vistas (2.864 líneas, ~14,7 mil caracteres), con lectura de los recortes generados mediante RapidOCR. Los artefactos crudos no se incluyen y la evaluación completa no se repitió durante la preparación del lanzamiento.

| Imagen | Precisión de caracteres CJK | Líneas exactas |
|---|---:|---:|
| Fuente japonesa | 4,9 % | 0,7 % |
| v2 · solo pares reales | 60,7 % | 29,0 % |
| v3 · reales + sintéticos | 72,1 % | 46,0 % |
| Referencia china a través del VAE | 98,1 % | 94,7 % |

Las puntuaciones OCR combinan errores de renderizado y del reconocedor; no equivalen a una valoración humana de legibilidad ni garantizan generalización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 119,3 M de parámetros en float16 los pesos ocupan ~239 MB, pero el VAE de FLUX.1-dev y las activaciones por tesela dominan el consumo.
- GPU recomendadas: no disponible; el proyecto indica Python 3.10+, CUDA y una fuente china, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: muy probable por el tamaño del DiT, pero no confirmada en la documentación; el VAE de FLUX.1-dev es el componente limitante.
- Opciones de despliegue: script propio `translate_page.py` del repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un DiT de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / tesela | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MangaTrans-Diffusion v3 | 119,3 M | Renderizado de texto chino sobre manga | Teselas de 512 px | MIT (pesos DiT) | Hugging Face, repo GitHub |
| FLUX.1-dev | no disponible en la información | Generación y edición de imágenes general | no disponible | Términos propios (no comercial) | Hugging Face |
| Modelos de traducción de manga genéricos | no disponible | Traducción texto a texto | no disponible | variable | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El texto pequeño, los caracteres complejos y la puntuación pueden renderizarse de forma incorrecta; los trazos presentan temblor.
- El rendimiento es peor sobre tramas (screentone) o arte que dentro de bocadillos con fondo plano.
- No existe mecanismo de consistencia entre páginas ni control del estilo de rotulación.
- El modelo procede de una única fuente de entrenamiento; no se evaluaron otros editores ni material para todos los públicos.
- Hereda un prior visual de material adulto; es necesario inspeccionar las salidas y usar solo material sobre el que se tenga autorización.
- El VAE de FLUX.1-dev no está incluido y conserva sus propios términos y condiciones de acceso; la licencia MIT del proyecto no los sustituye.
- Los datos de entrenamiento (páginas, OCR, latentes, imágenes derivadas) no se distribuyen ni se licencian con el modelo.
- No es un sistema de traducción de producción: OCR, traducción y planificación de maquetación quedan fuera de su alcance.
- El Space asociado es una demostración estática del método, no inferencia en vivo.
- Los resultados de evaluación son históricos, reportados por el proyecto, sin artefactos crudos ni repetición en el lanzamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jomify/MangaTrans-Diffusion-v3
- Código fuente: https://github.com/jomify/MangaTrans-Diffusion
- Demostración (Space): https://huggingface.co/spaces/Jomify/MangaTrans-Diffusion
- README en chino: https://github.com/jomify/MangaTrans-Diffusion/blob/main/README.zh-CN.md
- Ejemplo de comparación: https://raw.githubusercontent.com/Jomify/MangaTrans-Diffusion/main/showcase/example/comparison.webp
- Receta de inferencia y archivos a resolución completa: https://github.com/jomify/MangaTrans-Diffusion/tree/main/showcase/example
- Arquitectura del modelo: https://github.com/jomify/MangaTrans-Diffusion/blob/main/showcase/architecture.svg
- VAE dependiente (FLUX.1-dev): https://huggingface.co/black-forest-labs/FLUX.1-dev
- Licencia del VAE: https://huggingface.co/black-forest-labs/FLUX.1-dev/blob/main/LICENSE.md
