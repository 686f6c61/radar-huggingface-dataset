# Lucasgitguy-co/forma3d-tiny

## Resumen

Forma3D-Tiny v0.2 es un modelo experimental de conversión de imagen a representación 3D mediante Gaussian splatting, desarrollado por el usuario independiente Lucasgitguy-co. Se trata de un prototipo de investigación de tamaño muy reducido (306.321 parámetros) que toma una imagen ortográfica de un objeto centrado sobre fondo negro y genera una nube de Gaussianas isótropas en formato PLY, no una malla triangular. El modelo está post-entrenado a partir del checkpoint sintético de Image3D Student y se distribuye con licencia Apache-2.0.

Su relevancia es acotada: no es un modelo de propósito general para foto-a-3D, sino una línea base tosca para experimentación con supervisión mediante proxies de malla y Gaussianas. El autor lo declara explícitamente como un baseline de investigación con una rejilla de 16³ y entrenado únicamente sobre datos sintéticos derivados de Objaverse (CC0) y Scenario Labs (CC-BY-4.0). Los resultados medidos son modestos: IoU de ocupación de 0,307 en el conjunto de test.

El modelo no soporta texto, código ni razonamiento; su única tarea es la reconstrucción 3D aproximada a partir de imágenes renderizadas sintéticamente. Por tanto, esta ficha debe leerse como la de una herramienta de nicho para investigadores que trabajen en pipelines de image-to-3D con Gaussian splatting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de image-to-Gaussian; no se detalla la topología de red en la model card) |
| Parametros totales | 306.321 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.pt` (PyTorch); salida en PLY de Gaussianas |
| Resolución de rejilla | 16³ |
| Pipeline | image-to-3d |
| Checkpoint seleccionado | Paso 4800 (de 5000 pasos totales) |
| Modelo base | Lucasgitguy-co/image3d-student |
| Datasets de entrenamiento | allenai/objaverse (subconjunto CC0), scenario-labs/3d-collection (CC-BY-4.0) |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna de la red (número de capas, tipo de encoder visual, mecanismo de atención, etc.), solo que se trata de un modelo compacto de image-to-Gaussian con supervisión mediante proxies de malla. El entrenamiento parte del checkpoint de demostración sintética de Image3D Student y se post-entrena durante 5000 pasos, seleccionándose el checkpoint del paso 4800.

Los datos de entrenamiento consisten exclusivamente en objetos de Objaverse (subconjunto CC0) y Scenario Labs (CC-BY-4.0). El preprocesado centra y escala uniformemente los objetos en un cubo de 0,9 de lado, muestrea la superficie y la convierte en objetivos de Gaussianas isótropas; las imágenes ortográficas se renderizan a partir de esas mismas nubes proxy. No hubo destilación de profesores como Idol, Hunyuan, InstantMesh o Hi3D, ni entrenamiento con fotografías naturales, MultiScan, 3D-Front, Show3D o Voxel51. Se reserva una partición de test del 15 % excluida del entrenamiento y de la selección de checkpoint.

## Capacidades

- Generación de nubes de Gaussianas 3D (formato PLY) a partir de una imagen ortográfica de un objeto centrado sobre fondo negro.
- Reconstrucción aproximada de geometría a nivel de ocupación (IoU de 0,307 en test).
- Inferencia en CPU (`--device cpu`) y en Apple Silicon vía MPS (`--device mps`); soporte CUDA implementado pero no probado según el autor.
- Comando de previsualización (`image3d preview`) para renderizar un PNG a partir del PLY generado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni vídeo; no hay modo "thinking" ni visión 2D general.

## Casos de uso

- Investigación en image-to-3D con Gaussian splatting: sirve como línea base reproducible para comparar nuevas técnicas de supervisión con proxies de malla, dado que el autor publica comandos de reproducción en COMMANDS.md.
- Docencia y experimentación académica: su tamaño (306.321 parámetros) y su ejecución en CPU o MPS lo hacen adecuado para entornos sin GPU dedicada, permitiendo a estudiantes ejecutar el pipeline completo en un portátil.
- Pruebas de integración de pipelines de reconstrucción 3D: el formato de salida PLY de Gaussianas permite integrarlo en visores y herramientas de renderizado gaussiano existentes para validar flujos de trabajo.
- Generación de prototipos de assets 3D sintéticos: para objetos simples renderizados de forma controlada (centrados, fondo negro, iluminación ortográfica), el modelo produce una nube aproximada útil como borrador geométrico.
- Validación de metodologías de evaluación: el repo incluye `evaluation.json` con partición de test separada, lo que permite reutilizar el protocolo (IoU de ocupación, pérdida de test) en experimentos comparativos.
- Benchmarking de eficiencia en hardware modesto: al ser un modelo minúsculo, sirve para medir latencias y consumo en CPU/MPS antes de escalar a modelos mayores de image-to-3D.

## Benchmarks y rendimiento

| Metrica | Modelo base | Post-entrenado (v0.2) |
|---|---|---|
| Pérdida de test | 0,842823 | 0,584055 |
| IoU de ocupación | 0,272567 | 0,307005 |

Evaluación sobre 14 objetos de test independientes y 60 vistas de test. El autor advierte que estas métricas miden reconstrucción tosca de proxies sobre la distribución de datos renderizados y no demuestran fotorrealismo, mallas watertight, calidad de producción ni fidelidad de texturas.

## Requisitos de hardware

- VRAM estimada: no disponible en la model card; con 306.321 parámetros, la huella de memoria es mínima (del orden de megabytes para los pesos), aunque no se publica una cifra oficial.
- GPU recomendadas: no se especifican. El autor probó la ejecución en Mac con MPS; el soporte CUDA está implementado pero no fue probado en la máquina de preparación de los scripts.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño ínfimo del modelo, aunque no se aportan mediciones.
- Opciones de despliegue: scripts propios del repositorio (`setup-mac.sh`, CLI `image3d generate` y `image3d preview`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Forma3D-Tiny v0.2 | 306.321 | Image-to-Gaussian (PLY) | No aplica | Apache-2.0 | HuggingFace |
| InstantMesh | No disponible en la información | Image-to-mesh | No aplica | No disponible | Mencionado solo como referencia de no-destilación |
| Hunyuan3D | No disponible en la información | Image-to-3D | No aplica | No disponible | Mencionado solo como referencia de no-destilación |
| Hi3D | No disponible en la información | Image-to-3D | No aplica | No disponible | Mencionado solo como referencia de no-destilación |

No se dispone de datos de parámetros, licencia ni benchmarks de los modelos alternativos en la información proporcionada; la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo declarado explícitamente como "coarse research baseline", no apto como modelo general de foto-a-3D.
- Entrenado solo con imágenes ortográficas renderizadas de objetos centrados sobre fondo negro; las fotografías naturales quedan fuera de la distribución verificada.
- La salida es una nube de Gaussianas en PLY, no una malla triangular; no produce geometría watertight.
- Las métricas publicadas (IoU 0,307) reflejan reconstrucción tosca sobre la distribución sintética y no garantizan fotorrealismo ni fidelidad de texturas.
- Pueden persistir duplicados cercanos en los datos pese al agrupamiento por fuente y la deduplicación exacta por bytes.
- La licencia Apache-2.0 cubre código y pesos, pero no los derechos sobre datasets ni assets individuales; deben conservarse ATTRIBUTIONS.json y consultarse DATASETS.md.
- La licencia no concede derechos sobre marcas comerciales ni imágenes de terceros.
- No hay información sobre sesgos (no aplica en el sentido habitual de sesgos lingüísticos, pero no se documentan sesgos geométricos o de distribución de objetos).
- Riesgo de alucinación geométrica: al ser un modelo generativo, puede producir geometría plausible pero incorrecta en objetos fuera de la distribución de entrenamiento.
- Sin datos de cuantización, latencia ni throughput publicados; el soporte CUDA no está validado por el autor.
- Cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Lucasgitguy-co/forma3d-tiny
- Modelo base: https://huggingface.co/Lucasgitguy-co/image3d-student
- Dataset Objaverse: https://huggingface.co/datasets/allenai/objaverse
- Dataset Scenario Labs 3D Collection: https://huggingface.co/datasets/scenario-labs/3d-collection
- Repositorio de código, paper o demo: no disponible en la información proporcionada.
