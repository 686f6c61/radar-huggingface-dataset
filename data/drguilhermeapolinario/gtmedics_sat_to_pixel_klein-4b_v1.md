# drguilhermeapolinario/gtmedics_sat_to_pixel_klein-4b_v1

## Resumen
GTMedics sat_to_pixel_klein-4b_v1 es un adaptador LoRA para el modelo de difusión FLUX.2 Klein 4B, desarrollado por drguilhermeapolinario en el marco del proyecto Contagem Pixel Art. Resuelve una tarea muy concreta de conversión image-to-image: transformar un tile de ortofoto aérea 2D, previamente reproyectado a una geometría ortográfica isométrica, en una interpretación de mapa urbano en pixel art con paleta cálida, preservando el trazado de calles, la huella de los edificios y la distribución de vegetación.

El adaptador no modifica la arquitectura del modelo base: se aplica sobre FLUX.2 Klein 4B (familia FLUX de Black Forest Labs, variante de 4.000 millones de parámetros) mediante `peft` y `diffusers`. Su relevancia es de nicho: automatiza la generación de cartografía estilizada isométrica a partir de datos geoespaciales reales, un flujo habitual en videojuegos con mapas basados en ciudades reales, visualización urbana y proyectos de gemelos digitales con estética retro.

La versión v1 se publica bajo licencia Apache 2.0, con un tamaño de repositorio de 0,1 GB (solo los pesos del LoRA), y está pensada para inferencia rápida (4 pasos, guidance 1.0) sobre GPU con soporte BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión FLUX.2 Klein 4B |
| Parametros totales | No disponible (el repositorio contiene únicamente los pesos del adaptador; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (el ejemplo de inferencia usa BF16) |
| Idiomas soportados | No disponible (el prompt de inferencia está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`gtmedics_satelite2pixel_100_v1.safetensors`) |
| Pipeline | image-to-image |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Resolución de entrada/salida | 1024 × 1024 px, RGB |
| Palabra de activación | `mgwarm` |
| Pasos de inferencia recomendados | 4 |
| Guidance scale recomendado | 1.0 |

## Arquitectura y entrenamiento
El adaptador es un LoRA entrenado con AI Toolkit sobre FLUX.2 Klein Base 4B; en inferencia se aplica sobre la variante destilada 4B del mismo modelo base, sin apilar el adaptador FastCello, ya que el estilo visual está incorporado en las imágenes de entrenamiento. No se especifican en la información disponible el rango del LoRA, el número de pasos de entrenamiento ni el tamaño exacto del dataset.

El dato técnico más relevante es la preparación de los datos: las imágenes de entrada se obtuvieron por remuestreo afín de ortofoto aérea 2D (sin malla 3D) al mismo espacio de pantalla de la cámara isométrica del objetivo. La fuente de entrenamiento es ortofoto municipal (`Imagem_2023`, Web Mercator zoom 20, ~0,149 m/px), reproyectada con transformación afín bilineal a una cámara ortográfica isométrica con azimut −15° y elevación −45° (encurtamiento vertical por sen 45° ≈ 0,707). Cada tile cubre un rectángulo de 150 m × 212,1 m (~0,1465 m/px en el eje horizontal), con un paso de mosaico de +72,4 m E / +19,4 m N por columna y +27,4 m E / −102,4 m N por fila. El alineamiento del plano de suelo se calibró contra el render 3D mediante NCC sobre bordes Sobel, con apoyo del MDT (~4,83 px/m de altitud). Esta preparación permite que el LoRA se concentre en extruir volúmenes, tejados y fachadas alineados píxel a píxel con el trazado del suelo.

## Capacidades
- Conversión image-to-image de ortofoto isométrica 2D a pixel art isométrico con paleta cálida (`mgwarm`).
- Preservación del trazado de calles, huellas de edificios, distribución de vegetación y vehículos existentes en la imagen de entrada.
- Inferencia de volúmenes 3D coherentes (tejados y fachadas) a escala de mapa.
- Renderizado de vehículos pequeños alineados a las calles, sin añadir vehículos ni edificios nuevos.
- Texturas de terreno detalladas con bordes pixel art nítidos y cálidos.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades de texto: es exclusivamente un modelo de imagen.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso
- Generación de mapas de videojuego basados en ciudades reales: a partir de ortofotos municipales reproyectadas a la geometría isométrica de entrenamiento, el LoRA produce tiles de mapa en pixel art listos para integrar en un motor 2D isométrico, manteniendo el trazado viario real.
- Prototipado rápido de assets cartográficos: equipos de arte pueden convertir lotes de tiles (1024 × 1024) en variantes estilizadas con una sola pasada de 4 pasos, reduciendo el trabajo manual de reinterpretación.
- Visualización urbana estilizada para presentaciones: mapas de barrio con estética retro para informes, demos o material divulgativo, partiendo de datos geoespaciales abiertos.
- Gemelos digitales con capa estética: superponer la salida pixel art sobre datos SIG para comunicación pública, aprovechando que la salida respeta el trazado del suelo de la entrada.
- Investigación en control geométrico de difusión: el adaptador sirve como caso de estudio de cómo un LoRA puede aprender a extruir volúmenes alineados a una proyección afín concreta, útil para experimentos de condicionamiento geométrico.
- Generación de tiles para mapas procedurales: usar la salida como referencia de estilo o como textura base en pipelines de generación de mapas por mosaico, respetando el paso de rejilla documentado (+72,4 m E / +19,4 m N por columna).
- Docencia y divulgación geoespacial: convertir ortofotos en ilustraciones isométricas para explicar la relación entre proyección, escala y volumen en Sistemas de Información Geográfica.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La única evaluación reportada por el autor es cualitativa: consideró satisfactorios los resultados en 58 de 58 imágenes de prueba, sin métricas de fidelidad geométrica ni afirmación de desempeño en otras regiones.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explícita; el modelo base FLUX.2 Klein 4B en BF16 requiere del orden de 8-10 GB de VRAM para inferencia a 1024 × 1024, más la sobrecarga del pipeline `diffusers`.
- GPU recomendadas: cualquier GPU con soporte BF16 y al menos ~12 GB de VRAM; se sugiere RTX 4090, A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y en GPUs de 16 GB; en 8 GB requeriría cuantización del modelo base, no documentada.
- Opciones de despliegue: `diffusers` con `Flux2KleinPipeline` + `peft` (flujo documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de este tipo).
- Latencia y throughput: no disponibles; el autor recomienda 4 pasos de inferencia con guidance 1.0, lo que sitúa la generación en el régimen de los modelos de difusión destilados rápidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GTMedics sat_to_pixel_klein-4b_v1 | LoRA sobre FLUX.2 Klein 4B | 4B (base) | Ortofoto isométrica → pixel art | Apache 2.0 | Hugging Face |
| FLUX.2 Klein 4B (base) | Modelo de difusión | 4B | Image-to-image general | No disponible en la información | Hugging Face |
| Alternativas de estilización pixel art sobre FLUX | LoRA | 4B (base) | Estilización genérica | Variable | No disponible |
| Modelos de cartografía estilizada dedicados | No disponible | No disponible | Mapa → arte isométrico | No disponible | No disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados; el entrenamiento se limita a ortofoto municipal de una región concreta, por lo que el estilo puede no generalizar a otras ciudades, densidades urbanas o tipos de vegetación.
- Riesgo de alucinación: el modelo puede inferir tejados, fachadas o texturas no presentes en la entrada; el prompt recomienda no añadir vehículos ni edificios, pero no hay garantía métrica de fidelidad geométrica.
- Limitación de entrada crítica: los recortes nadir convencionales (norte arriba, proporción 1:1 en el suelo) quedan fuera de la distribución de entrenamiento. La entrada debe estar ya rotada −15° y comprimida verticalmente −45°, con 1024 × 1024 px y proyección afín bilineal; de lo contrario, los resultados serán inconsistentes.
- Limitación de idioma: el prompt de referencia está en inglés y no se documentan otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base FLUX.2 Klein 4B tiene su propia licencia, que debe verificarse por separado antes de desplegar en producción.
- Caveat de producción: la evaluación es cualitativa (58/58 imágenes consideradas satisfactorias por el autor), sin métricas de fidelidad geométrica ni validación en otras regiones; conviene evaluar con datos propios antes de automatizar lotes.
- No se documentan cuantizaciones del adaptador ni del modelo base para entornos con VRAM limitada.

## Enlaces
- Pesos del LoRA en Hugging Face: https://huggingface.co/drguilhermeapolinario/gtmedics_sat_to_pixel_klein-4b_v1
- Modelo base FLUX.2 Klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Notebook de inferencia (Colab): inferencia_colab.ipynb (incluido en el repositorio del modelo)
- AI Toolkit (herramienta de entrenamiento): https://github.com/ostris/ai-toolkit
- Documentación de diffusers: https://huggingface.co/docs/diffusers
