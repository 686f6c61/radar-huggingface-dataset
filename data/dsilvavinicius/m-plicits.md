# dsilvavinicius/m-plicits

## Resumen

M-plicits es un metodo de representacion de superficies 3D mediante campos implicos neuronales, presentado en NeurIPS 2026 por Vinícius da Silva, Isabelle Melo, Matheus Bessa, Guilherme Schardong, Luiz Schirmer, André Araújo, Nuno Gonçalves, Hélio Lopes, Alberto Raposo, Luiz Velho y Tiago Novello. La tecnica representa una superficie como una SIREN base mas una secuencia de SIREN residuales entrenadas en vecindarios anidados de la superficie precedente, lo que da lugar a un esquema multiescala de refinamiento progresivo.

Este repositorio de HuggingFace no contiene un modelo generativo ni un modelo de lenguaje, sino los pesos oficiales liberados: 105 checkpoints de PyTorch correspondientes a 36 formas ajustadas de manera independiente, junto con sus configuraciones de entrenamiento originales, copiadas sin modificar desde la release v1.0 de GitHub. El interes practico esta en que permite reproducir las reconstrucciones del paper, ejecutar extraccion de superficie, sphere tracing en tiempo real, normales analiticas y normal mapping neuronal sin reentrenar.

El metodo se evalua especificamente por su robustez frente a nubes de puntos orientadas con ruido, un escenario habitual en escaneo 3D real. Cada checkpoint es una representacion especifica de una forma concreta: no se trata de un modelo que reconstruya un escaneo no visto sin entrenamiento previo, lo cual condiciona por completo sus casos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SIREN (redes sinusoidales) con residuales multiescala anidados |
| Parametros totales | no disponible (config.json declara recuentos por forma, pero la cifra no se publica en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoints); exportables a formato binario propietario del renderer CUDA |
| Numero de checkpoints | 105, correspondientes a 36 formas |
| Niveles por forma | 34 formas con coarse, medium y fine; `58168` con coarse y medium; `normalized_thai_gt_half` con coarse |
| Libreria | PyTorch |
| Tamano del repositorio | 0.0 GB (redondeado por HuggingFace) |

## Arquitectura y entrenamiento

M-plicits modela una superficie mediante una SIREN base seguida de una secuencia de SIREN residuales. Cada nivel de la jerarquia se entrena en un vecindario anidado de la superficie definida por el nivel anterior, de modo que los niveles mas finos actuan como residuales y solo tienen sentido sumados a todos los niveles precedentes. La formulacion permite extraer superficies a resoluciones configurables, hacer sphere tracing en tiempo real, calcular normales de forma analitica y aplicar normal mapping neuronal. La comparacion visual publicada incluye resultados frente a iNGP sobre entradas con ruido.

Los checkpoints liberados corresponden a formas normalizadas y limpias del Stanford 3D Scanning Repository y de Thingi32, con sus configuraciones de entrenamiento originales. Las bandas de inferencia adaptativas se calcularon sobre los puntos de entrenamiento exactos liberados de cada forma mediante la ecuacion 5 del paper: `delta_i = 1.3 * max_j |sum_{k=0}^i f_k(x_j)|`. Todos los checkpoints deben cargarse con `w0=1`, ya que las frecuencias de entrenamiento ya estan incorporadas en los pesos guardados; las frecuencias de los ficheros YAML describen el entrenamiento y no deben reaplicarse en carga. Los datos de entrenamiento con ruido, las variantes con outliers y los materiales de textura permanecen en la release de GitHub.

## Capacidades

- Representacion de superficies 3D como campo implico (SDF) a partir de una forma ajustada individualmente.
- Extraccion de superficie a malla (`.ply`) con resolucion configurable; 256 como previsualizacion y 512 para el protocolo del paper.
- Refinamiento multiescala anidado: los niveles fine y medium son residuales y requieren todos los niveles anteriores.
- Sphere tracing en tiempo real mediante el renderer CUDA incluido.
- Normales analiticas derivadas de la representacion implicita.
- Normal mapping neuronal (`-iters=20,5,0 -normal_lod=2` en el renderer).
- Robustez frente a nubes de puntos orientadas con ruido, incluido un 1 % de ruido reproducible con `reproduce.py noise`.
- Inferencia en CPU (`--device cpu`) o en GPU CUDA.
- Exportacion de checkpoints al formato binario del renderer mediante `export_experiment.py`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Reconstruccion de superficies a partir de escaneos ruidosos: el modelo esta disenado explicitamente para ser robusto frente a nubes de puntos orientadas con ruido, por lo que encaja en pipelines de digitalizacion donde la captura no es limpia.
- Extraccion de mallas para produccion 3D: `reconstruct.py` genera ficheros `.ply` a la resolucion deseada (256 para previsualizacion, 512 para el protocolo del paper), integrables en flujos de modelado y renderizado.
- Visualizacion interactiva en tiempo real: el renderer CUDA permite sphere tracing sobre los checkpoints exportados, util para inspeccion de resultados o demostraciones.
- Investigacion en representaciones implicitas: sirve como baseline reproducible contra iNGP y otros metodos, con pesos oficiales y configuraciones de entrenamiento publicadas.
- Generacion de normales y normal mapping neuronal: util para shading de alta frecuencia sobre la superficie reconstruida sin geometria adicional.
- Reproduccion de resultados academicos: la release incluye las configuraciones exactas y las bandas adaptativas, lo que permite replicar las cifras del paper NeurIPS 2026.
- Reentrenamiento sobre escaneos propios: el repositorio de codigo permite ajustar nuevas formas con el mismo esquema, aunque cada forma requiere su propio entrenamiento.
- Activos para videojuegos y contenido interactivo: la combinacion de normales analiticas, normal mapping y renderizado en tiempo real es aplicable a activos 3D de alta fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card indica que el paper evalua la robustez frente a nubes de puntos orientadas con ruido y que la release de GitHub contiene resultados verificados, protocolo de evaluacion y artefactos de reconstruccion conocidos por forma, pero no se incluyen cifras concretas (PSNR, Chamfer, F-score u otras) en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada.
- Inferencia en CPU: soportada mediante `--device cpu`, sin cifras de latencia publicadas.
- Renderer CUDA: dirigido a Windows y a una GPU NVIDIA con CUDA; no se documentan otros sistemas operativos para el renderer.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, aunque el tamano del repositorio (0.0 GB redondeado) sugiere checkpoints ligeros en disco.
- Opciones de despliegue: `reconstruct.py` del repositorio de codigo (entorno conda `new_i3d` via `environment.yml`), descarga con `huggingface_hub.snapshot_download`, carga directa con `i3d.util.from_pth` y `w0=1`, y el renderer CUDA propio (`MIP-plicitsRenderer.exe`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Representacion | Multiescala | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M-plicits | Implicito neuronal (SIREN + residuales) | SDF por forma | Si, residuales anidados | MIT | Pesos y codigo publicos |
| iNGP (instant-ngp) | Implicito neuronal (hash grid) | SDF / densidad | No en el mismo esquema | no disponible | Referencia citada en la comparacion del paper |
| SIREN | Implicito neuronal puro | SDF / senal | No | no disponible | Arquitectura base de M-plicits |
| NeuS / Neuralangelo | Implicito neuronal para reconstruccion multi-vista | SDF | Parcial | no disponible | no disponible en la informacion recogida |

No se dispone de cifras comparativas de parametros, contexto ni rendimiento para estas alternativas en la informacion proporcionada; la unica comparacion explicita en el material es la ilustracion frente a iNGP sobre entradas con ruido.

## Limitaciones y advertencias

- Cada checkpoint representa una unica forma: no es un modelo que reconstruya un escaneo no visto sin entrenamiento previo.
- Las formas liberadas se ajustaron sobre nubes de puntos limpias y normalizadas del Stanford 3D Scanning Repository y de Thingi32; el comportamiento fuera de esa normalizacion de coordenadas no esta garantizado.
- Los niveles fine y medium son residuales: usarlos de forma aislada produce resultados incorrectos. Deben combinarse con todos los niveles precedentes.
- Las bandas de inferencia guardadas dependen de los checkpoints liberados y de sus entradas originales; es necesario recalcularlas tras reentrenar o modificar la normalizacion de coordenadas.
- Los checkpoints deben cargarse con `w0=1`; reaplicar las frecuencias de los YAML de entrenamiento es un error documentado.
- Existen artefactos de reconstruccion conocidos y especificos por forma, documentados en `REPRODUCING.md`.
- El renderer CUDA solo apunta a Windows con GPU NVIDIA, lo que limita el despliegue en otros entornos.
- No hay resultados de benchmarks numericos publicados en la informacion disponible, por lo que la evaluacion cuantitativa frente a alternativas no puede contrastarse aqui.
- Riesgo de sesgo: las formas de entrenamiento provienen de un conjunto reducido de repositorios de escaneo, por lo que la generalizacion a otras familias de geometria no esta caracterizada.
- Licencia MIT: permite uso comercial y modificacion, pero al tratarse de una release academica no hay garantias de mantenimiento ni soporte.
- La model card original aparece truncada en el ultimo parrafo sobre velocidad de ejecucion, por lo que las cifras de rendimiento en tiempo real no estan disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dsilvavinicius/m-plicits
- Paper: https://arxiv.org/abs/2609.28684
- Hugging Face Papers: https://huggingface.co/papers/2609.28684
- Pagina del proyecto: https://dsilvavinicius.github.io/m-plicits/
- Codigo: https://github.com/dsilvavinicius/m-plicits
- Datos y activos adicionales (release v1.0): https://github.com/dsilvavinicius/m-plicits/releases/tag/v1.0
- Protocolo de reproduccion: https://github.com/dsilvavinicius/m-plicits/blob/main/REPRODUCING.md
- Renderer CUDA: https://github.com/dsilvavinicius/m-plicits/tree/main/renderer
- Tema GitHub neurips-2026: https://github.com/topics/neurips-2026
