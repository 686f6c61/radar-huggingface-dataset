# hi3d-official/Hi3Dv1.0

## Resumen

Hi3D v1.0 es un modelo de refinado de geometría 3D de alta resolución desarrollado por hi3d-official. No genera una malla desde cero a partir de una imagen: parte de una malla tosca (coarse mesh) y de una imagen de referencia del mismo objeto, y devuelve una geometría de alta frecuencia con detalle local fino, como molduras, relieves, dientes o hendiduras. Técnicamente se apoya en la representación y la arquitectura de refinado de Sparc3D: muestrea latentes sparse de forma progresiva, los decodifica con un VAE sparse con autopruning y extrae la malla final.

El interés del modelo está en su escalera de refinado en tres pasadas, que elevan la resolución efectiva de extracción hasta 1536³ sobre una rejilla estructural nominal mucho menor (64³, 128³ y 192³). Esto evita operar con tensores densos de 1536³ y permite un escalado práctico del detalle. El informe técnico del proyecto cita un entrenamiento sobre aproximadamente dos millones de activos 3D curados.

La versión publicada (23 de octubre de 2026) incluye únicamente los artefactos del modelo de refinado en safetensors, con un repositorio de 7,7 GB. El código de inferencia vive en el repositorio de GitHub; el código de entrenamiento y el arnés de evaluación del paper no se distribuyen. La licencia es la hi3d-open-license-agreement-1.0, y el stack solo se ha validado en Linux con GPU NVIDIA y una tarjeta de 96 GB (H20).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generativa sobre latentes sparse (herencia de Sparc3D): transformers condicionados por imagen sobre coordenadas derivadas de la geometría tosca y VAE sparse con autopruning; familia exacta y número de capas no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la condición es una imagen de referencia más una malla tosca) |
| Tipos de cuantización | no disponible (solo se distribuyen pesos safetensors; no se documentan variantes FP8, GGUF ni INT) |
| Idiomas soportados | en, zh (según los metadatos del repositorio; la salida es geometría, no texto) |
| Licencia | hi3d-open-license-agreement-1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors |
| Entrada | Imagen de referencia + malla tosca del mismo objeto |
| Salida | Malla 3D refinada (geometría; los renders de comparación no representan texturas generadas) |
| Resolución de extracción | 512³ (1 pasada), 1024³ (2 pasadas), 1536³ (3 pasadas) |
| Tamaño del repositorio | 7,7 GB |

## Arquitectura y entrenamiento

El pipeline aplica un esquema de refinado iterativo. Las características de la imagen condicionan un muestreo de flujos (flow) sobre latentes sparse en coordenadas derivadas de la geometría tosca. Tras decodificar y extraer la malla, esta se revoxeliza para proporcionar el soporte sparse de la pasada siguiente. Cada pasada emplea un transformer distinto y eleva simultáneamente la rejilla estructural nominal y la rejilla de extracción:

| Pasada | Rejilla estructural nominal | Rejilla de extracción sparse | Transformer |
|---|---|---|---|
| 1 | 64³ | 512³ | `transformer_512` |
| 2 | 128³ | 1024³ | `transformer_1024` |
| 3 | 192³ | 1536³ | `transformer_1024` |

Una petición a 512³ ejecuta una sola pasada; 1024³ ejecuta dos; 1536³ ejecuta las tres. El autor subraya que estas etiquetas describen rejillas nominales de coordenadas sparse y de extracción, no un tensor latente denso de 1536³ ni un número fijo de triángulos.

En cuanto a los datos, el informe técnico menciona aproximadamente dos millones de activos 3D curados. No se detalla la composición del dataset, el número de tokens o muestras por etapa, ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias: esa información es no disponible en el material proporcionado. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención linear. El paquete de Python y la API pública conservan los nombres `sparc3d` y `Sparc3DPipeline` por compatibilidad.

## Capacidades

- Refinado de geometría 3D de alta resolución a partir de una malla tosca y una imagen de referencia del mismo objeto.
- Generación de detalle local fino: relieves estratificados, molduras arquitectónicas, bordes curvos, escamas, dientes y surcos concéntricos.
- Escalado por niveles de extracción (512³, 1024³ y 1536³) con coste computacional creciente.
- Completado plausible de vistas ocultas: el modelo infiere superficies no visibles de forma verosímil, no como reconstrucción exacta.
- Extracción de malla tras la decodificación, con revoxelización entre pasadas para conservar el soporte sparse.
- Condicionamiento por imagen, lo que permite alinear el refinado con la apariencia del objeto de referencia.
- Soporte de assets de distintas categorías: vehículos, personajes blindados, butacas, bolsos, bustos humanoides, robots mecánicos y personajes estilizados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Refinado de fotogrametría y escaneado 3D: se parte de una malla de baja resolución obtenida por escaneado y de una fotografía del objeto; el modelo recupera detalle que la malla original no resuelve, útil para catalogación o reproducción.
- E-commerce y visualización de producto: con una foto y una malla base se genera geometría de alta resolución para render interactivo o realidad aumentada; para catálogos grandes puede bastar la pasada única a 512³.
- Diseño industrial y prototipado: a partir de una malla conceptual se obtiene geometría con detalle local suficiente para evaluar encajes, molduras o superficies curvas antes de fabricación aditiva.
- Patrimonio cultural y museística: piezas con relieves, cornisas y grabados se refinan hasta 1536³ para capturar microdetalle; conviene validar visualmente las zonas ocultas, que son completadas de forma plausible.
- Videojuegos y VFX: uso de 512³ o 1024³ para LODs intermedios y de la escalera completa para assets principales; hay que tener en cuenta que el color de los renders de comparación corresponde a normales de superficie, no a texturas generadas.
- Escultura digital y personajes: bustos, robots y personajes estilizados se benefician del refinado de detalle en zonas como rostros, articulaciones y paneles mecánicos.
- Investigación en representaciones 3D sparse: al conservar los nombres de API de Sparc3D, sirve como base reproducible para experimentos de refinado sobre latentes sparse, aunque el arnés de evaluación no se distribuye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El repositorio incluye comparativas visuales cualitativas (detalle local frente a nueve métodos y comparaciones multivista de vehículo, personaje blindado, butaca, bolso, busto humanoide, robots y personaje estilizado), pero no se aportan métricas numéricas como Chamfer Distance, F-score, PSNR o tasas de éxito, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor indica explícitamente que el pico de memoria y la viabilidad en tarjetas menores no se han establecido.
- GPU validadas: una única configuración medida, NVIDIA H20 de 96 GB. La escalera completa a 1536³ solo se ha validado en esa GPU.
- Requisito mínimo declarado: GPU NVIDIA con compute capability 8.0 o superior. No existe ruta de inferencia en CPU.
- GPU de consumo: no confirmado. Al no haberse medido el consumo de memoria, no puede afirmarse que quepa en RTX 4090 u otras tarjetas de consumo.
- Entorno de software: Linux, Python 3.10, CUDA toolkit en el rango 12.0–12.5 alineado con la build de PyTorch. El stack medido fue Python 3.10.12, PyTorch 2.5.0+cu124 y CUDA 12.4.131.
- Dependencias críticas: `flash-attn==2.7.4.post1` (compilación desde fuente, sin aislamiento de build) y `spconv-cu120==2.3.6`, fijadas mediante `docker/constraints.txt`. Los kernels de malla en Triton se compilan en el primer uso.
- Opciones de despliegue: instalación desde el código fuente del repositorio de GitHub con `pip install -e ".[inference]"`. No hay publicación en PyPI ni wheel precompilada del proyecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Representación | Resolución de extracción | Condicionamiento | Licencia | Datos públicos |
|---|---|---|---|---|---|
| Hi3D v1.0 | Latentes sparse con VAE sparse autopruning (base Sparc3D) | 512³ / 1024³ / 1536³ en tres pasadas | Imagen de referencia + malla tosca | hi3d-open-license-agreement-1.0 | Pesos safetensors (7,7 GB); código de inferencia; sin código de entrenamiento ni arnés de evaluación |
| Sparc3D (modelo base) | Latentes sparse | no disponible | Imagen | no disponible | Paper arXiv:2505.14521; pesos y especificaciones no detallados en la información disponible |
| Otros modelos image-to-3D (Trellis, Hunyuan3D y familia) | no disponible | no disponible | Imagen | no disponible | no disponible en la información proporcionada |

No se dispone de datos verificables de parámetros, contexto o rendimiento cuantitativo de las alternativas que permitan una comparación numérica rigurosa; la comparación debe hacerse, por tanto, a nivel de representación y flujo de trabajo.

## Limitaciones y advertencias

- No es un modelo text-to-3D ni un generador desde cero: requiere una malla tosca de partida y una imagen de referencia del mismo objeto.
- Las vistas ocultas se completan de forma plausible, no como reconstrucción fiel; no debe usarse como sustituto de un escaneado en aplicaciones que exijan exactitud geométrica en superficies no observadas.
- No genera texturas: los renders coloreados de las comparativas son normales de superficie.
- Solo se han publicado los artefactos de refinado; el código de entrenamiento y el arnés de evaluación del paper no están incluidos, lo que limita la reproducibilidad de las cifras del informe.
- Solo hay dos idiomas declarados en los metadatos (en, zh) y no aplican a la salida del modelo, que es geometría.
- El pico de memoria no está caracterizado y la escalera de 1536³ solo se ha validado en una H20 de 96 GB; desplegar en GPUs menores es una incógnita hasta que se mida.
- Sin ruta de inferencia en CPU y sin wheel precompilada: el despliegue exige compilar `flash-attn` y fijar versiones concretas de CUDA, PyTorch y `spconv`, lo que añade fragilidad operativa.
- La licencia es `other` (hi3d-open-license-agreement-1.0): deben revisarse los términos del archivo LICENSE antes de cualquier uso comercial; en la información disponible no se detallan las restricciones concretas.
- Riesgo de sesgo en la distribución de los dos millones de activos 3D de entrenamiento: no se documenta su composición, por lo que se desconoce la cobertura de categorías, estilos o procedencias.
- Riesgo de alucinación geométrica: el modelo puede inventar estructuras coherentes con la imagen de referencia pero inexistentes en el objeto real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Repositorio de GitHub (código de inferencia): https://github.com/hi3d-official/Hi3Dv1.0
- Detalles del pipeline: https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/pipeline.md
- Informe técnico (PDF): https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Descarga directa del informe técnico: https://github.com/hi3d-official/Hi3Dv1.0/raw/refs/heads/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Demo en vivo (Space de Sparc3D): https://huggingface.co/spaces/ilcve21/Sparc3D
- Sitio web internacional: http://hi3d.ai/
- Sitio web para China: https://www.hi3d.cn/
- Paper de referencia (etiqueta arXiv del repositorio): https://arxiv.org/abs/2505.14521
- Resultados de búsqueda web (plataformas comerciales; no se ha verificado su relación con este repositorio): https://www.hi3d.ai/, https://www.hi3d.ai/fr, https://hi3d.pro/, https://hi3d.pro/fr, https://hi3dai.pro/fr/
