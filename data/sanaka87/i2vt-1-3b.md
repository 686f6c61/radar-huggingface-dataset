# sanaka87/i2vt-1.3b

## Resumen

I2VT-1.3B es un adaptador LoRA para edición de vídeo guiada por instrucciones, desarrollado por el usuario sanaka87 (repositorio HorizonWind2004) y presentado en el artículo *Improving and Expanding Video Editing Capabilities Without Videos*. El modelo parte del editor de vídeo ByteDance/Bernini-R-1.3B-Diffusers y lo especializa mediante la técnica I2VT (Image-to-Video Transfer), que aprovecha un editor de imágenes congelado (JoyAI-Image-Edit) para transferir capacidades de edición nuevas sin necesidad de pares de vídeos etiquetados.

La relevancia del trabajo reside en su método de entrenamiento: en lugar de recopilar costosos datasets de vídeo emparejado, trata cada imagen fuente como un vídeo de un solo fotograma y deja que el editor de imágenes guíe la predicción del editor de vídeo en cada paso de su trayectoria de denoising. Así, con solo 17.000 imágenes (I2VT-17K) y un LoRA de rango 128, el modelo mejora las ediciones básicas y amplía el editor a cuatro tareas nuevas: cambio de acción, cambio de expresión, movimiento corporal y reiluminación de escena.

El resultado es un adaptador ligero (0,4 GB) sobre un backbone DiT de 1.300 millones de parámetros, con licencia Apache 2.0 y pipeline `video-to-video` en diffusers. Su tamaño contenido lo hace desplegable en hardware de consumo y su enfoque sin cambios de arquitectura facilita la integración sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre un transformer DiT (base Bernini-R-1.3B); adaptador de rango 128 y alpha 64 en todas las capas lineales |
| Parametros totales | 1.300 millones (backbone base; el adaptador LoRA es un subconjunto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión de vídeo; ventana de 81 fotogramas en inferencia) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16; la cuantización depende del modelo base) |
| Idiomas soportados | no disponible (las instrucciones de edición se procesan vía el codificador de texto del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`bernini_lora_step_200.safetensors`, bf16) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Bernini-R-1.3B, un editor de vídeo basado en un transformer de difusión (DiT) con backbone congelado durante el ajuste. El LoRA tiene rango 128 y alpha 64 y se inserta en todas las capas lineales del DiT. El entrenamiento emplea el dataset I2VT-17K (17.000 imágenes), learning rate 2e-5, batch de 48 imágenes fuente, 200 pasos y 10 pasos de rollout por imagen. La escala de guía del editor de imágenes se fija en 2 para acciones y movimiento corporal, y en 1 para el pool de OpenVE, expresiones y reiluminación.

La innovación clave es I2VT: el editor de vídeo procesa cada imagen fuente como un vídeo de un fotograma y un editor de imágenes congelado (JoyAI-Image-Edit) guía su predicción en cada paso de la trayectoria de denoising. Este esquema no requiere cambios de arquitectura ni nuevos vídeos emparejados, y en test time el editor ajustado edita clips completos. La inferencia usa los ajustes oficiales de Bernini-R: sampler UniPC, 40 pasos, 81 fotogramas, guía APG (vídeo fuente 1,25; imagen 4,5; texto 4,0), time shift 5 y semilla 42.

## Capacidades

- Edición de vídeo guiada por instrucciones en lenguaje natural (pipeline `video-to-video`).
- Ediciones básicas: estilo global, cambio local, cambio de fondo, eliminación local y adición local.
- Tareas nuevas de OpenVE++: cambio de acción, cambio de expresión, movimiento corporal y reiluminación de escena.
- Transferencia de capacidades desde un editor de imágenes sin pares de vídeo etiquetados.
- Integración nativa con la librería diffusers sobre el modelo base Bernini-R-1.3B.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general ni audio; el modelo es específicamente un editor de vídeo.

## Casos de uso

- Postproducción de vídeo asistida: aplicar cambios de estilo global o de fondo a clips existentes mediante una instrucción de texto, usando los 81 fotogramas por inferencia del ajuste oficial.
- Reiluminación de escenas: corregir o cambiar la iluminación de un clip rodado con luz no deseada, una de las cuatro tareas nuevas que el LoRA añade al modelo base.
- Edición de actuaciones: modificar expresiones faciales o movimientos corporales de actores en vídeo para pruebas de concepto o correcciones, con la advertencia de uso responsable del autor.
- Prototipado rápido en investigación: evaluar técnicas de edición instruction-based sobre un backbone de 1,3B desplegable en hardware modesto, dado el tamaño del adaptador (0,4 GB).
- Eliminación o adición de objetos locales: limpiar elementos no deseados de un plano o insertar objetos mediante instrucciones, aprovechando las mejoras en las ediciones básicas de OpenVE-Bench.
- Generación de variantes de contenido: producir versiones alternativas de un mismo clip (cambio de acción o de escena) para selección creativa en estudios pequeños.
- Docencia y demostraciones: mostrar el funcionamiento de la transferencia imagen-a-vídeo en cursos de visión por computador, con un modelo de pesos abiertos y licencia permisiva.

## Benchmarks y rendimiento

Evaluación con jueces automáticos (puntuación 1-5 en cumplimiento de instrucción, consistencia con la fuente y calidad visual; media de las tres).

**OpenVE-Bench** (ediciones básicas, juez Gemini 2.5 Pro)

| Modelo | Global Style | Local Change | Background Change | Local Remove | Local Add | Overall |
|---|---|---|---|---|---|---|
| Bernini-R-1.3B | 3,27 | 4,01 | 2,94 | 2,88 | 2,41 | 3,10 |
| I2VT-1.3B | 3,93 | 4,01 | 3,12 | 3,45 | 2,59 | 3,42 |

**OpenVE++** (tareas nuevas)

| Modelo | Juez | Action Change | Expression Change | Body Movement | Scene Relighting | Overall |
|---|---|---|---|---|---|---|
| Bernini-R-1.3B | Gemini 3.8 Flash | 1,43 | 1,50 | 1,10 | 2,11 | 1,54 |
| I2VT-1.3B | Gemini 3.8 Flash | 3,35 | 3,67 | 2,90 | 3,65 | 3,39 |
| Bernini-R-1.3B | Gemini 2.5 Pro | 1,83 | 2,00 | 1,14 | 2,43 | 1,85 |
| I2VT-1.3B | Gemini 2.5 Pro | 3,47 | 3,47 | 2,32 | 3,21 | 3,12 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone DiT de 1,3B en bf16 requiere aproximadamente 2,6 GB solo para pesos, más el codificador de texto, el VAE y las activaciones para 81 fotogramas.
- GPU recomendadas: no especificadas por el autor; por tamaño del backbone, una GPU consumer de gama alta (RTX 4090, 24 GB) debería ser suficiente, y probablemente también GPUs de 12-16 GB con precisión reducida.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de 1,3B y el adaptador de 0,4 GB, aunque no se publican requisitos oficiales.
- Opciones de despliegue: diffusers (librería declarada); los scripts de inferencia están en el repositorio de código. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles; la configuración de referencia usa 40 pasos de UniPC sobre 81 fotogramas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tareas de edición | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| I2VT-1.3B | 1,3B (backbone) + LoRA | Adaptador LoRA sobre DiT | Básicas + 4 nuevas (OpenVE++) | Apache 2.0 | Hugging Face (8 descargas) |
| Bernini-R-1.3B | 1,3B | Editor de vídeo DiT | Básicas (OpenVE-Bench) | Apache 2.0 | Hugging Face (modelo base) |
| JoyAI-Image-Edit | no disponible | Editor de imágenes | Edición de imagen | no disponible | Uso como guía congelada en I2VT |

No se dispone de datos de otros editores de vídeo comparables en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de uso indebido: los pesos pueden alterar acciones y expresiones de personas reales en vídeos; el autor prohíbe crear contenido engañoso sobre personas reales o sin su consentimiento y exige etiquetar los vídeos editados como editados.
- Dependencia del modelo base: requiere cargar el LoRA sobre ByteDance/Bernini-R-1.3B-Diffusers; no es un modelo autónomo.
- Idiomas soportados no documentados; el rendimiento multilingüe de las instrucciones depende del codificador de texto del backbone.
- Sin datos publicados sobre sesgos, tasa de alucinación visual o robustez fuera de los benchmarks OpenVE-Bench y OpenVE++.
- Los benchmarks usan jueces automáticos (Gemini 2.5 Pro y Gemini 3.8 Flash), no evaluación humana.
- Repositorio con muy poca adopción (8 descargas, 0 likes) y artículo arXiv aún no publicado ("coming soon"), lo que limita la validación independiente.
- Licencia Apache 2.0 permite uso comercial, pero las restricciones de uso responsable del autor deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanaka87/i2vt-1.3b
- Página del proyecto: https://i2v-transfer.github.io/
- Código: https://github.com/HorizonWind2004/i2v-transfer
- Dataset I2VT-17K: https://huggingface.co/datasets/sanaka87/I2VT-17K
- Benchmark OpenVE++: https://huggingface.co/datasets/sanaka87/OpenVEPP-Bench
- Modelo base: https://huggingface.co/ByteDance/Bernini-R-1.3B-Diffusers
- arXiv: pendiente de publicación ("coming soon")
