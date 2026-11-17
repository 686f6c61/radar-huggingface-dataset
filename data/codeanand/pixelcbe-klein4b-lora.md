# codeanand/pixelcbe-klein4b-lora

## Resumen

Pixel Coimbatore painter es un adapter LoRA de rango 64 desarrollado por el usuario codeanand para el modelo de difusion FLUX.2 [klein] 4B de Black Forest Labs. Su funcion es transformar un render isometrico de ciudad con sombreado plano en una version con estilo pixel art dibujado a mano, imitando la estetica del proyecto pixelcbe.com. El modelo se publica como un unico artefacto de 0,2 GB en formato LoRA, pensado para cargarse sobre el modelo base mediante la pipeline image-to-image.

El caso de uso es muy especifico: no se trata de un modelo generalista de generacion de imagenes, sino de un estilizador entrenado sobre pares de imagenes (render base generado a partir de datos de OpenStreetMap y su version pintada) de la propia ciudad de Coimbatore. Esto lo hace especialmente adecuado para pipelines de cartografia artistica o videojuegos que necesiten convertir mapas vectoriales o renders 3D en tiles con estetica retro.

La relevancia actual es limitada pero clara dentro de su nicho: demuestra un flujo de trabajo reproducible y de bajo coste (2000 pasos, una A100, unos 5 USD) para especializar un modelo de difusion moderno en un estilo visual concreto, con licencia Apache 2.0 y codigo de entrenamiento publicado. No obstante, al momento de la ficha no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adapter de bajo rango) sobre FLUX.2 [klein] 4B, modelo de difusion |
| Parametros totales | no disponible (el adapter pesa 0,2 GB; el modelo base tiene 4B) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a la generacion de imagen) |
| Licencia | Apache 2.0 (sujeta ademas a la licencia del modelo base) |
| Formato de pesos | LoRA (repo de 0,2 GB); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El adapter es un edit-LoRA de rango 64 entrenado con ostris/ai-toolkit sobre el modelo base FLUX.2 [klein] 4B. El entrenamiento consistio en 2000 pasos ejecutados en una unica GPU A100, con un coste aproximado de 5 USD. El dataset de entrenamiento son pares de imagenes compuestos por un render base isometrico de 1024x1024 generado con el script `base/render_v2.py` del repositorio del autor y la version pintada manualmente del mismo render, manteniendo camara y paleta constantes.

La innovacion tecnica no reside en la arquitectura (que hereda integramente del modelo base) sino en el enfoque de datos: el autor genera sus propios pares de entrenamiento a partir de datos de OpenStreetMap, lo que le permite controlar la distribucion visual y especializar el LoRA en la trama urbana india densa. El pipeline complementa el modelo con tratamiento procedural para terreno, aeropuertos, estadios y pasos elevados, que quedan fuera del alcance del LoRA.

## Capacidades

- Transformacion image-to-image de renders isometricos con sombreado plano a estilo pixel art dibujado a mano.
- Estilizacion coherente de tiles de 1024x1024 manteniendo la geometria y la camara del render de entrada.
- Inferencia rapida: 4 pasos y aproximadamente 1,5 segundos por tile en una A100.
- Especializacion en trama urbana densa, particularmente de ciudades indias.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de imagen).
- No dispone de capacidades multilingues, de vision general ni de audio.
- No se documentan capacidades de control fino (ControlNet, inpainting selectivo) mas alla de la edicion condicionada por la imagen de entrada.

## Casos de uso

- Cartografia artistica de ciudades: convertir renders isometricos generados desde OpenStreetMap en tiles pixel art para mapas web o posters, aprovechando que el LoRA fue entrenado exactamente sobre ese tipo de entrada.
- Fondos de videojuego con estetica retro: generar tiles de ciudad coherentes en estilo pixel art a partir de geometria 3D existente, reduciendo el trabajo manual de un artista de pixeles.
- Prototipado rapido de direccion de arte: evaluar como quedaria un mapa o escenario con estetica pixel art antes de invertir en assets definitivos, con un coste de inferencia de segundos por tile.
- Visualizacion de datos urbanos: presentar datos de OpenStreetMap de forma atractiva para divulgacion o marketing, manteniendo la fidelidad geometrica del render original.
- Generacion de assets para juegos de gestion o simulacion urbana: producir variaciones estilizadas de un mismo barrio a partir de distintos renders base.
- Pipeline de publicacion automatizada: integrar el LoRA en un flujo que renderice, estilice y componga tiles de forma desatendida, dado el bajo tiempo por tile y la naturaleza determinista del par entrada-salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta datos operativos: 2000 pasos de entrenamiento, 4 pasos de inferencia y aproximadamente 1,5 segundos por tile de 1024x1024 en una A100.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base FLUX.2 [klein] 4B requiere, en la practica, GPUs con al menos 16-24 GB de VRAM en precision completa, y menos con cuantizacion (dato no confirmado en la informacion proporcionada).
- GPU recomendadas: A100 (configuracion usada por el autor para entrenamiento e inferencia). Para el modelo base de 4B, se puede considerar H100, A100 o RTX 4090, aunque no se documentan mediciones en estas ultimas.
- Cabe en GPU de consumo: probablemente en RTX 4090 y modelos con 24 GB o mas, sujeto a la cuantizacion del modelo base; no confirmado.
- Opciones de despliegue: el autor referencia `train/modal_train.py::paint` para la inferencia; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables directamente a difusion).
- Latencia y throughput: aproximadamente 1,5 segundos por tile de 1024x1024 con 4 pasos en una A100.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codeanand/pixelcbe-klein4b-lora | LoRA de estilo pixel art sobre FLUX.2 klein 4B | adapter de 0,2 GB sobre base de 4B | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| black-forest-labs/FLUX.2-klein-4B | Modelo base de difusion image-to-image | 4B | no aplica | segun modelo base | Hugging Face |
| LoRAs de pixel art genericos para FLUX | Adapters de estilo | variable | no aplica | variable | Hugging Face y comunidades |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo altamente especializado: funciona bien en trama urbana india densa y puede degradarse en otros tipos de escena o geografias.
- Entrenado con pares de un unico pipeline de render (`render_v2.py`) con camara y paleta fijas; entradas con otra camara, resolucion o paleta pueden producir resultados inconsistentes.
- Terreno, aeropuertos, estadios y pasos elevados no los resuelve el LoRA, sino el pipeline procedural del autor.
- Riesgo de alucinacion visual: puede inventar detalles urbanos o alterar la geometria del render de entrada.
- Licencia Apache 2.0 para el adapter, pero el uso queda sujeto tambien a la licencia del modelo base FLUX.2 [klein] 4B, que debe verificarse antes de un uso comercial.
- Sin descargas ni validacion de la comunidad en el momento de la ficha; no hay evidencia externa de calidad mas alla de la imagen de ejemplo del autor.
- No se documentan sesgos especificos, pero al entrenarse sobre una ciudad concreta puede reproducir sesgos de representacion urbana de esa region.
- No apto para tareas de texto, codigo, razonamiento o agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codeanand/pixelcbe-klein4b-lora
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Codigo del proyecto: https://github.com/Codebrahma/pixelcbe
- Sitio del proyecto: https://pixelcbe.com
- Herramienta de entrenamiento: https://github.com/ostris/ai-toolkit
- Datos de mapa: https://www.openstreetmap.org
