# RiverRider/srt-sunstone-linear-head

## Resumen

SRT-Sunstone Linear Head es un componente de recuperación cross-modal desarrollado por RiverRider, que convierte el modelo congelado google/gemma-4-31B-it en un motor de recuperación imagen↔texto sin modificar ningún peso del backbone. Se trata de un par de proyecciones lineales entrenadas (dos capas `nn.Linear(5376, 1024)`) que leen los estados ocultos de la capa 47 del modelo base durante el forward pass, aprovechando la correspondencia cross-modal que el autor sostiene que es lineal en este sustrato.

El modelo resuelve el problema de la recuperación cross-modal (image-to-text y text-to-image) sin necesidad de entrenar un modelo multimodal completo, sino anadiendo un cabezal ligero de solo 12,3 millones de parametros sobre un backbone congelado. Su relevancia actual radica en que demuestra robustez frente a cambios de runtime: el cabezal fue entrenado una sola vez con estados bf16 de datacenter y mantiene su rendimiento a traves de reducciones de escala 10×, cuantizacion de 4 bits (con una perdida de solo −0,01 R@1) y cambios de silicio (CUDA a Apple-Silicon MLX), lo que lo convierte en un artefacto portable entre distintos entornos de despliegue.

El repositorio incluye tres versiones del cabezal (v1, v2 y v3) que forman una escalera de conocimiento sobre el runtime objetivo, junto con un verbalizador de 36M de parametros que condiciona un Qwen3-0.6B congelado para describir puntos en el espacio de 1024 dimensiones, y un mapa 2D de las 118.287 imagenes de COCO train2017.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Par de proyecciones lineales `nn.Linear(5376, 1024)` sobre backbone congelado google/gemma-4-31B-it |
| Parametros totales | ~12,3M (cabezal); ~36M (verbalizador opcional) |
| Parametros activos | Todos (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo generativo; lee estados ocultos de la capa 47) |
| Tipos de cuantizacion | Probado con cuantizacion de 4 bits (perdida de −0,01 R@1) y bf16 de datacenter |
| Idiomas soportados | No disponible (depende del backbone gemma-4-31B-it) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, `weights_only=True`-safe), `.npz` para el mapa, `.json` para etiquetas |

## Arquitectura y entrenamiento

El cabezal consiste en dos proyecciones lineales independientes, una para imagen (`img`) y otra para texto (`txt`), ambas de 5376 a 1024 dimensiones, junto con dos vectores de centrado por modalidad (`mu_img`, `mu_txt`) que son obligatorios para compensar la anisotropia del espacio de representaciones. El entrenamiento se realizo con 117.000 pares imagen-caption de COCO train2017 usando perdida InfoNCE, y el protocolo de evaluacion usa 1.000 imagenes held-out de COCO val2017 contra sus 5.000 captions (chance R@1 ≈ 0,001).

El autor reporta que un MLP entrenado con los mismos datos nunca supera a este mapa lineal, y que la brecha se amplia con mas datos, lo que sugiere que la correspondencia cross-modal en este sustrato es lineal. Existen tres versiones del cabezal: v1 (entrenamiento base), v2 (con aumentacion de jitter medio, perturbaciones aleatorias de norma ~U(0, 30)) y v3 (con aumentacion de deriva medida, usando residuos reales cross-runtime de 3.000 pares MLX-Q4 menos CUDA-bf16, escalados ~U(0, 1.5)). La version v3 actua como regularizador y mejora incluso el rendimiento same-runtime (i2t 0,679 vs 0,661 de v1).

## Capacidades

- Recuperacion cross-modal imagen→texto (i2t) y texto→imagen (t2i) con R@1 de 0,661 y 0,506 respectivamente en COCO val2017.
- Lectura de estados ocultos de la capa 47 del backbone congelado sin modificar sus pesos.
- Robustez cross-runtime: mantiene rendimiento con cuantizacion 4 bits, reduccion de escala 10× y cambio de silicio (CUDA→MLX) sin recalibracion.
- Recalibracion ligera: con ~200 estados no apareados del runtime objetivo (42KB), alcanza i2t R@1 de 0,658, a 0,2 puntos del rendimiento same-runtime.
- Verbalizacion de puntos del espacio: el verbalizador de 36M de parametros condiciona un Qwen3-0.6B congelado para describir cualquier punto del espacio de 1024 dimensiones, incluso en regiones sin fotografias reales.
- Deteccion de categorias: AUC de 0,883 en las 80 categorias de COCO medido directamente contra anotaciones.
- Mapa 2D del espacio: proyeccion de las 118.287 imagenes de COCO train2017 con 24 regiones etiquetadas.

## Casos de uso

- Recuperacion de imagenes a gran escala: el cabezal puede indexar galerias de millones de imagenes proyectando cada una a un punto de 1024 dimensiones y recuperando por similitud coseno, con latencia minima al ser una unica proyeccion lineal.
- Despliegue en entornos heterogeneos: al ser robusto a cambios de runtime, un mismo artefacto puede servir en produccion con GPUs CUDA y en edge con Apple-Silicon sin reentrenar, manteniendo R@1 dentro de 3 puntos del reference de datacenter.
- Busqueda multimodal en dispositivos locales: con cuantizacion 4 bits y la tolerancia a deriva de runtime, el cabezal cabe en equipos de consumo y permite busqueda imagen→texto on-device.
- Pipeline de etiquetado automatico: el verbalizador puede generar descripciones de imagenes sin necesidad de un modelo de vision dedicado, leyendo solo el punto en el espacio de representaciones.
- Analisis de espacios latentes: el mapa 2D y las etiquetas regionales permiten explorar la estructura semantica del espacio de representaciones del backbone, util para investigacion en interpretabilidad.
- Sistema de recomendacion cross-modal: dado un texto de consulta, se puede recuperar la imagen mas relevante de un catalogo, o viceversa, con una unica proyeccion y busqueda por vecinos proximos.

## Benchmarks y rendimiento

Resultados de recuperacion en COCO val2017 (1.000 imagenes held-out vs 5.000 captions, chance R@1 ≈ 0,001):

| Metodo | i2t R@1 | i2t R@5 | i2t R@10 | t2i R@1 |
|---|---:|---:|---:|---:|
| Centered cosine (zero training) | 0,288 | 0,523 | 0,648 | 0,173 |
| Cabezal lineal (117k pares, InfoNCE) | 0,661 | 0,911 | 0,967 | 0,506 |

Resultados cross-runtime de la version v3 (sin recalibracion):

| Metrica | v3 (sin recal) | v1 (con recal) |
|---|---:|---:|
| i2t R@1 | 0,636 | 0,634 |
| t2i R@1 | 0,469 | 0,424 |

Resultados del verbalizador (500 puntos held-out contra galeria de 118.287, chance = mediana 59.143):

| Brazo | R@1 | R@10 | Mediana de rango |
|---|---:|---:|---:|
| Primera caption COCO (entrenada) | 0,212 | 0,554 | 8 |
| Segunda caption COCO (no vista) | 0,074 | 0,254 | 45 |
| El verbalizador | 0,042 | 0,194 | 64 |
| Punto de otra imagen | 0,000 | 0,000 | 55.866 |
| Media de todos los puntos | 0,000 | 0,002 | 59.135 |

Deteccion de categorias: AUC 0,883 en las 80 categorias de COCO.

## Requisitos de hardware

- VRAM estimada: el cabezal ocupa ~0,3 GB en disco; al ser una proyeccion lineal sobre un backbone congelado, el requisito dominante es el del backbone gemma-4-31B-it (31B parametros, ~62 GB en bf16, ~16 GB en 4 bits).
- GPU recomendadas: el backbone requiere GPU de datacenter (A100, H100) en bf16, o GPUs de consumo con cuantizacion 4 bits (RTX 4090 con 24 GB puede ser suficiente con cuantizacion agresiva).
- Compatibilidad con consumer GPU: el cabezal en si es trivial; el backbone limita el despliegue. Con cuantizacion 4 bits y offloading, es posible en GPUs de 16-24 GB.
- Opciones de despliegue: el cabezal es agnóstico al runtime; se puede integrar con vLLM, llama.cpp, MLX u Ollama para el backbone, y el cabezal se ejecuta como una capa lineal adicional en PyTorch o MLX.
- Latencia y throughput: no disponible; al ser una unica proyeccion lineal, la latencia anadida es minima comparada con el forward pass del backbone.

## Comparativa con modelos similares

No hay disponibles modelos directamente comparables en la informacion proporcionada, ya que se trata de un componente de recuperacion cross-modal disenado para un backbone especifico, no de un modelo multimodal autonomo. Como referencia conceptual, se podria comparar con CLIP (Radford et al., 2021), que tambien usa proyecciones separadas para imagen y texto, pero CLIP entrena un encoder de vision desde cero mientras que este cabezal lee estados de un LLM congelado. La comparacion cuantitativa no es posible sin ejecutar ambos en el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- El cabezal depende completamente del backbone gemma-4-31B-it; no funciona con otros modelos sin reentrenar.
- La recalibracion de medias por runtime es recomendada con todas las versiones; con v1 es imprescindible (omitirla cuesta ~24 puntos de i2t R@1).
- El verbalizador tiene un rendimiento limitado (R@1 de 0,042) y no debe interpretarse como un sustituto de captions humanas; su valor es cualitativo, no cuantitativo.
- La primera fila de la evaluacion del verbalizador (primera caption COCO) es un control de cableado, no un techo humano; la referencia honesta es la segunda caption (mediana 45).
- No se proporcionan datos sobre sesgos del modelo; al derivar de COCO, puede heredar sesgos de ese dataset.
- Riesgo de alucinacion en el verbalizador: puede emitir frases fluidas sobre un espacio muerto si se apunta al espacio equivocado.
- Licencia Apache-2.0 permite uso comercial, pero el backbone gemma-4-31B-it tiene su propia licencia que debe verificarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RiverRider/srt-sunstone-linear-head
- Repositorio del backbone: https://huggingface.co/RiverRider/Gemma-4-31B-it-SRT-Sunstone
- Repositorio GitHub SRT: https://github.com/space-bacon/SRT
- Repositorio GitHub SRT-Sunstone: https://github.com/space-bacon/SRT-Sunstone
- Abstract del paper SRT: https://raw.githubusercontent.com/space-bacon/SRT/refs/heads/main/arxiv/abstract.txt
- Demo en vivo: https://lab.sunstonenorth.com
