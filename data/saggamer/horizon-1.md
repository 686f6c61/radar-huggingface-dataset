# saggamer/horizon-1

## Resumen

Horizon 1 es un adaptador experimental de generación y edición de imágenes desarrollado por el usuario saggamer (Kira Superapp) para ejecutarse en Apple Silicon mediante MLX y la librería MFLUX. No es un modelo fundacional independiente, sino un bundle de aproximadamente 84 MB que se apoya en el checkpoint base FLUX.2 Klein 4B en cuantización 4-bit (unos 4,6 GB que se descargan en el primer arranque). Su objetivo es combinar generación texto-a-imagen sin imagen de origen, edición guiada por instrucciones, grounding semántico y controles espaciales dentro de un flujo creativo local.

La versión 0.2 añade un experto de creatividad entrenado mediante LoRA junto con un adaptador de edición, un puente semántico, un grounder de instrucciones y controles espaciales. El entrenamiento del experto creativo se realizó con 1.024 actualizaciones del optimizador sobre 1.024 filas (1.023 grupos) provenientes de COCO-Caption2017 y DiffusionDB, usando flow-matching supervisado con replay, no aprendizaje online autónomo.

Es relevante ahora porque demuestra un patrón de despliegue de modelos de difusión en hardware de consumo Apple (probado en un M4 de 24 GB), con licencia Apache 2.0 y un runtime propio. El propio autor lo describe como un lanzamiento de investigación, no como un editor listo para producción ni una reivindicación de estado del arte.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre FLUX.2 Klein base 4B (modelo de difusión), ejecutado con MLX/MFLUX |
| Parámetros totales | No disponible para el adaptador; el checkpoint base es de 4B |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; presupuesto de prompt nativo de 256 tokens con rechazo explícito de desbordamiento |
| Tipos de cuantización | 4-bit (checkpoint base en 4-bit) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Bundle MLX/MFLUX (adaptador de ~84 MB); no compatible con safetensors estándar de Diffusers ni con `mlx_lm.load` |
| Tamaño del repositorio | 0,1 GB |
| Resolución de generación | 512 × 512 por defecto; múltiplos de 16 entre 256 y 1024 |
| Pasos por defecto | 20 |
| Guidance por defecto | 4 |
| Librería | mflux |

## Arquitectura y entrenamiento

Horizon 1 se construye como un adaptador sobre el checkpoint de difusión FLUX.2 Klein base 4B, en su variante 4-bit para MLX. El sistema se compone de varias piezas separadas: un experto de creatividad entrenado con LoRA para generación texto-a-imagen sin imagen de origen, un adaptador de edición, un puente semántico de modo creatividad, un grounder de instrucciones y controles espaciales. La generación parte de ruido aleatorio y texto únicamente, sin imagen en blanco, tokens de referencia, cabeza de grounding ni máscara de edición.

El entrenamiento del experto creativo consistió en 1.024 actualizaciones del optimizador (completadas el 20 de octubre de 2026) sobre 1.024 filas de entrenamiento agrupadas en 1.023 grupos, combinando captions de COCO-Caption2017 y pares imagen/prompt de DiffusionDB. Los ejemplos de COCO se restringieron a las licencias 4, 7 y 8 (CC BY 2.0, Flickr sin restricciones conocidas de copyright y obras del gobierno de EE. UU.); DiffusionDB se distribuye bajo CC0 1.0. Se sustituyeron cinco filas sintéticas por cinco ejemplos positivos de replay supervisado sin aumentar el total, y esos ejemplos guiados se excluyeron de las pruebas de novedad. Se trata de replay de flow-matching supervisado, no de aprendizaje online autónomo ni de un benchmark de preferencia creativa humana.

## Capacidades

- Generación de imágenes texto-a-imagen sin imagen de origen, partiendo de ruido aleatorio y prompt.
- Edición de imágenes guiada por instrucciones en lenguaje natural.
- Grounding semántico de instrucciones y controles espaciales (colocación de objetos y regiones).
- Soporte de image-to-image mediante el adaptador de edición.
- Escritura de PNG junto con metadatos JSON de procedencia (provenance).
- Control de resolución entre 256 y 1024 en múltiplos de 16, con 512 × 512 como valor por defecto.
- Control de semilla, pasos y guidance para reproducibilidad.
- Interfaz de línea de comandos con modos de generación y edición (`horizon-image`, con `horizon-edit` como alias compatible).

## Casos de uso

- Prototipado creativo local en Mac: generar conceptos visuales a 512 × 512 desde un prompt y una semilla fija, útil para iterar ideas sin depender de servicios en la nube y con procedencia JSON registrada.
- Edición por instrucciones en flujos de diseño: aplicar el adaptador de edición sobre una imagen existente para modificar elementos concretos descritos en lenguaje natural, aprovechando el grounder de instrucciones.
- Composición con controles espaciales: usar las señales de colocación para ubicar objetos en regiones concretas, adecuado para maquetas y pruebas de layout.
- Pruebas de investigación en hardware Apple: validar pipelines de difusión 4-bit con MLX/MFLUX en un M4 de 24 GB, midiendo paridad numérica y conversión mediante los JSON de evaluación incluidos.
- Integración en asistentes creativos conectados a herramientas: servir como componente de generación y edición dentro de un asistente con bucle de ejecución y permisos, como el propuesto por Kira Superapp.
- Generación de imágenes de referencia para documentación o demostraciones internas, con control de resolución y semilla para resultados reproducibles.
- Evaluación comparativa de adaptadores LoRA sobre FLUX.2 Klein 4B: el bundle permite reproducir las pruebas de generación incluidas (`evaluation/generation_test.json`) y comprobar la preservación de valores entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor incluye únicamente pruebas cualitativas de generación sin imagen de origen sobre un Apple M4 (20 pasos, guidance 4, 512 × 512): un caso de tetera- ballena con taza naranja y otro de barcos de papel con limón. En el primero, la composición es reconocible pero el asa y la boquilla funcionales especificadas no quedan claramente establecidas; en el segundo, la composición está presente pero no es inequívoco que haya exactamente tres barcos distintos. Ninguna de las dos instrucciones completas se marca como éxito semántico verificado, y el propio autor advierte que dos ejemplos no constituyen un benchmark amplio.

## Requisitos de hardware

- Mac con Apple Silicon y acceso a Metal; probado en un M4 de 24 GB. Macs con menos memoria no han sido validados.
- Python 3.12 o superior.
- Espacio en disco suficiente para el checkpoint base (unos 4,6 GB en la primera ejecución) y las dependencias.
- El adaptador en sí ocupa aproximadamente 84 MB; el repositorio completo, 0,1 GB.
- Despliegue mediante el runtime MFLUX/MLX incluido; no es compatible con `mlx_lm.load`, `AutoModel` de Transformers ni pipelines estándar de Diffusers.
- Resoluciones mayores de 512 × 512 requieren más memoria.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto/prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Horizon 1 | Adaptador LoRA sobre FLUX.2 Klein 4B (difusión) | Base 4B; adaptador ~84 MB | 256 tokens de prompt | Apache 2.0 | Hugging Face (bundle MLX) |
| FLUX.2 Klein base 4B | Modelo de difusión base | 4B | No disponible | No disponible en la información | Hugging Face (black-forest-labs) |
| FLUX2-klein-base-4B-mlx-4bit | Checkpoint base cuantizado 4-bit para MLX | 4B | No disponible | No disponible en la información | Hugging Face (AITRADER) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un lanzamiento de investigación, no un editor listo para producción ni una reivindicación de estado del arte.
- La adherencia a instrucciones sobre fotografías reales sigue siendo limitada.
- El conteo de objetos, la colocación espacial y el diseño funcional de objetos son experimentales; los propios ejemplos del autor no se marcan como éxitos semánticos verificados.
- Solo se han validado pruebas completas de imagen a 512 × 512; tamaños mayores consumen más memoria y no están validados.
- El presupuesto de prompt es de 256 tokens, con rechazo explícito de desbordamiento.
- Solo soporta inglés.
- No incluye modelo de chat de texto ni generación de PPT/PDF.
- No debe cargarse con `mlx_lm.load`, `AutoModel` ni pipelines estándar de Diffusers; requiere el runtime MFLUX específico.
- El entrenamiento se limita a 1.024 actualizaciones y 1.024 filas, con cinco ejemplos de replay supervisado; no es aprendizaje online ni un benchmark de preferencia creativa.
- Riesgo de sesgos derivado de los datos de entrenamiento (COCO y DiffusionDB) no cuantificado en la información disponible.
- Riesgo de alucinación visual: los objetos solicitados pueden no representarse fielmente (asa y boquilla no establecidas en el ejemplo de la tetera).
- La licencia Apache 2.0 permite uso comercial, pero el checkpoint base y sus dependencias deben verificarse por separado.

## Enlaces

- [Hugging Face: saggamer/horizon-1](https://huggingface.co/saggamer/horizon-1)
- [Kira Superapp](https://kira-superapp.vercel.app/)
- [GitHub KIRA-Superapp](https://github.com/saggamer/KIRA-Superapp)
- [Diagonal Browser (código fuente)](https://github.com/saggamer/KIRA-Superapp/tree/main/diagonal_browser)
- [Modelo base: black-forest-labs/FLUX.2-klein-base-4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B)
- [Checkpoint base MLX 4-bit: AITRADER/FLUX2-klein-base-4B-mlx-4bit](https://huggingface.co/AITRADER/FLUX2-klein-base-4B-mlx-4bit)
- [Dataset COCO-Caption2017](https://huggingface.co/datasets/lmms-lab-encoder/COCO-Caption2017)
- [Dataset DiffusionDB](https://huggingface.co/datasets/poloclub/diffusiondb)
- [Dataset MagicBrush](https://huggingface.co/datasets/osunlp/MagicBrush)
