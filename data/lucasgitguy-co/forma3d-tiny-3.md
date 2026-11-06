# Lucasgitguy-co/forma3d-tiny-3

## Resumen

Forma3D Tiny 3 es un prototipo de investigación de generación 3D a partir de una imagen (image-to-3D) desarrollado por el usuario Lucasgitguy-co. Se trata de un ajuste fino (finetune) del checkpoint `Lucasgitguy-co/forma3d-tiny-2`, continuado desde la revisión `1648582b07a0f7f9d482a8c0f4cf89e6ecd86972`, y orientado a producir representaciones de nubes de Gaussianas 3D (Gaussian splatting) a partir de vistas ortográficas de objetos centrados sobre fondo negro.

El modelo es deliberadamente minúsculo: 306.321 parámetros, una rejilla de 16 al cubo, anchura 64 y un máximo de 4.096 ranuras de Gaussianas. No es un modelo de propósito general ni un generador fotorrealista; el autor lo describe explícitamente como un baseline de investigación. La salida es un fichero PLY de Gaussianas, no una malla GLB texturizada, y no existe condicionamiento por prompt de texto.

Su relevancia es metodológica más que práctica: documenta un pipeline completo de entrenamiento con supervisión mediante mallas proxy (mesh-proxy supervision), particionado por grupos de objetos para evitar fugas de datos y evaluación sobre vistas held-out idénticas entre checkpoints. La mejora respecto a v2 en pérdida de test (de 0,690551 a 0,544487) y en IoU de ocupación (de 0,286866 a 0,339860) sirve como referencia reproducible para experimentos de reconstrucción 3D de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo compacto de imagen a Gaussianas 3D; rejilla de 16³, anchura 64) |
| Parámetros totales | 306.321 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D, sin contexto de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (sin condicionamiento de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`); salida en PLY de Gaussianas |

## Arquitectura y entrenamiento

El modelo mantiene la misma arquitectura que forma3d-tiny-2: 306.321 parámetros, rejilla de 16 al cubo, anchura 64 y hasta 4.096 ranuras de Gaussianas. La supervisión se realiza mediante muestras isotrópicas de superficie de malla, comprimidas a una Gaussiana por celda de rejilla ocupada; se muestrean colores de superficie de textura, pero no se emplea renderizado PBR completo ni renderizado diferenciable. La salida es una nube de Gaussianas en formato PLY.

El entrenamiento se realizó sobre 512 objetos del dataset ABO (Amazon Berkeley Objects, revisión `c7c8293fed3b7ab122ef5d7896521a187e0962d7`), con 2.048 imágenes proxy Gaussianas ortográficas sobre fondo negro. El particionado agrupa objetos, IDs de artículo compartidos y hashes exactos de malla/imagen/objetivo antes de dividir: 348 grupos de entrenamiento, 87 de validación y 77 de test, con exclusión del test del entrenamiento y de la selección de checkpoint. El ajuste continuó desde v2 con un optimizador AdamW reiniciado, completó 6.000 pasos y seleccionó el paso 6.000 únicamente por pérdida de validación. El autor indica que no se ejecutaron, fusionaron ni destilaron MeshAnythingV2, Idol Diffusers, SHARP, Pixal3D, Idol Turbo ni Qwen3.5-4B-3D-Coder, y que la receta es exclusivamente local en Mac.

## Capacidades

- Generación de nubes de Gaussianas 3D a partir de una única imagen de entrada.
- Reconstrucción de forma aproximada de objetos centrados sobre fondo negro.
- Salida en formato PLY de Gaussianas (no malla GLB texturizada).
- Muestreo de color de superficie a partir de la textura del objeto.
- Sin condicionamiento por prompt de texto.
- Sin soporte de tool calling, function calling ni agentes.
- Sin capacidades multilingües (no procesa lenguaje).
- Sin modo de razonamiento, visión general, audio ni otras modalidades.

## Casos de uso

- Prototipado de investigación en image-to-3D: sirve como baseline reproducible y de bajo coste para comparar variantes de supervisión con mallas proxy antes de escalar a modelos mayores.
- Generación de proxies geométricos para pipelines de impresión 3D: la salida PLY de Gaussianas puede convertirse a malla y usarse como borrador inicial de un objeto a partir de una foto cenital sobre fondo negro.
- Docencia y experimentación académica: sus 306.321 parámetros permiten entrenar y evaluar en hardware de consumo, incluido un Mac con backend MPS, lo que facilita reproducir el pipeline completo.
- Generación de activos 3D aproximados para previsualización en entornos de diseño: obtener una representación volumétrica rápida de un objeto catalogado (por ejemplo, productos ABO) sin necesidad de modelado manual.
- Investigación en supervisión débil: el esquema de compresión a una Gaussiana por celda de rejilla es un caso de estudio para técnicas de supervisión con mallas proxy y muestreo de superficie.
- Benchmarking de infraestructura de inferencia 3D: al ser tan pequeño, permite medir latencia y throughput de pipelines de Gaussian splatting en dispositivos modestos antes de migrar a modelos mayores.
- Reconstrucción de catálogo a pequeña escala: procesar lotes de imágenes de objetos centrados sobre negro para obtener nubes de Gaussianas de referencia en tareas de comparación o indexación visual.

## Benchmarks y rendimiento

Evaluación sobre las mismas vistas proxy held-out de ABO para ambos checkpoints:

| Métrica | v2 (inicio) | v3 (seleccionado) |
|---|---:|---:|
| Pérdida media de test | 0,690551 | 0,544487 |
| IoU medio de ocupación de vista (umbral 0,5) | 0,286866 | 0,339860 |

El autor advierte que estas mediciones no demuestran reconstrucción sobre fotos naturales, fotorrealismo, calidad de malla, calidad de renderizado en vistas noveles ni mejora en los dominios originales de v2. No se publican intervalos de confianza ni afirmaciones de generalización amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 306.321 parámetros el modelo cabe holgadamente en cualquier GPU de consumo, aunque no se proporcionan cifras exactas.
- GPU recomendadas: no disponible; el autor documenta ejecución en dispositivo `mps` (Apple Silicon).
- Cabe en GPU de consumo: sí, por el reducido tamaño del modelo; no se especifican modelos concretos.
- Opciones de despliegue: instalación del repositorio con `pip install .` y uso de los comandos `image3d generate` e `image3d preview`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / rejilla | Licencia | Disponibilidad |
|---|---|---|---|---|
| Forma3D Tiny 3 | 306.321 | Rejilla 16³, 4.096 ranuras Gaussianas | Apache 2.0 | Hugging Face |
| Forma3D Tiny 2 | 306.321 | Rejilla 16³, 4.096 ranuras Gaussianas | Apache 2.0 | Hugging Face |
| Forma3D-Tiny v0.2 | 306.321 | Rejilla 16³ | No disponible | Hugging Face |
| MeshAnythingV2, SHARP, Pixal3D, Idol Turbo, Qwen3.5-4B-3D-Coder | No disponible | No disponible | No disponible | No ejecutados ni comparados por el autor |

No se dispone de datos de benchmarks comparativos con modelos externos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo califica de baseline coarse, no de modelo de propósito general.
- Entrenado exclusivamente con imágenes proxy sintéticas de objetos ABO sobre fondo negro; no se reclama entrenamiento con fotos naturales ni generalización a otros dominios.
- La salida es un PLY de Gaussianas, no una malla GLB texturizada; requiere postprocesado para obtener mallas.
- Sin condicionamiento por prompt de texto: no se puede guiar la generación con instrucciones.
- Posibles duplicados cercanos en el dataset y solapamiento no determinado con datasets de entrenamiento de modelos ancestros.
- Sin intervalos de confianza ni afirmaciones amplias de generalización; el IoU de ocupación es bajo (0,339860 con umbral 0,5).
- Riesgo de alucinación geométrica y de reconstrucciones imprecisas fuera de la distribución de objetos ABO.
- Licencia Apache 2.0 para pesos y código, pero los datos ABO subyacentes son CC BY 4.0 (Amazon.com y contribuidores de ABO, convertidos a GLB por CodePawl); deben conservarse NOTICE, THIRD_PARTY.md y ATTRIBUTIONS.json.
- Los activos crudos no se incluyen en el repositorio; es necesario obtenerlos por separado respetando sus licencias.
- Sin datos publicados sobre sesgos, latencia o comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lucasgitguy-co/forma3d-tiny-3
- Modelo base (v2): https://huggingface.co/Lucasgitguy-co/forma3d-tiny-2
- Modelo ancestro (Forma3D-Tiny v0.2): https://huggingface.co/Lucasgitguy-co/forma3d-tiny
- Dataset ABO GLB: https://huggingface.co/datasets/codepawl/abo-glb
- Repositorio GitHub Forma3D (editor STL, proyecto relacionado por nombre): https://github.com/lukethehawk/Forma3D
