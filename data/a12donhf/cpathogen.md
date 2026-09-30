# a12donhf/CPathOGen

## Resumen

CPathOGen es un modelo de difusion latente condicionada desarrollado por Samarth Singhal y Varang Rai (repositorio `a12dongithub/PathOGen`), publicado bajo el identificador `a12donhf/CPathOGen`. Sintetiza teselas de histopatologia de 512 x 512 pixeles con tincion hematoxilina-eosina (H&E) a partir de dos entradas: un mapa espacial celular de cinco canales y un vector de morfologia/apariencia de 16 valores estandarizados. El objetivo no es la generacion artistica, sino la generacion de contrafactuales controlados que permitan a un investigador modificar una propiedad concreta (morfologia nuclear, organizacion celular, apariencia de tincion) manteniendo fijo el ruido de difusion, y comparar asi la respuesta de un modelo de patologia congelado sobre imagenes emparejadas.

Tecnicamente es un ajuste fino de `Manojb/stable-diffusion-2-1-base` con dos componentes anadidos: un codificador espacial aprendido que proyecta el mapa celular a caracteristicas latentes concatenadas con el latente ruidoso, y modulos FiLM por bloque que inyectan los controles de morfologia durante el proceso de denoising. No es un `ControlNetModel` estandar ni un `DiffusionPipeline` autonomo de Diffusers, por lo que requiere el codigo de inferencia del proyecto para cargarse correctamente.

El checkpoint liberado corresponde al identificador `checkpoint-30000_FID58/checkpoint-30000` usado en los flujos de inferencia del proyecto, entrenado sobre aproximadamente 1,4 millones de teselas de 512 x 512 de TCGA-BRCA con etiquetado debil de nucleos mediante CellViT++. El repositorio ocupa 4,2 GB y su relevancia actual es acotada pero especifica: cubre un nicho de explicabilidad en patologia computacional donde la generacion contrafactual controlada es escasa y metodologicamente delicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (UNet + VAE) con codificador espacial aprendido y modulacion FiLM por bloque; ajuste fino de Stable Diffusion 2.1 base |
| Parametros totales | no disponible (el checkpoint incluye UNet, VAE de SD 2.1 base mas FiLM MLPs y codificador espacial; el autor no publica recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagen; entrada fija de 512 x 512) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica sin cuantizar ni convertir) |
| Idiomas soportados | en |
| Licencia | openrail++ (CreativeML Open RAIL++-M heredada de Stable Diffusion 2.1) |
| Formato de pesos | safetensors (UNet y VAE) y state dicts de PyTorch en .pt (film_mlps.pt, spatial_encoder.pt); cargados con `weights_only=True` |

## Arquitectura y entrenamiento

El modelo parte de `Manojb/stable-diffusion-2-1-base` y conserva su UNet y su VAE. Sobre esa base incorpora un codificador espacial entrenado que transforma un mapa NPZ de celulas en caracteristicas latentes; esas caracteristicas se concatenan con el latente ruidoso antes del denoising, en lugar de inyectarse mediante un ControlNet convencional. Los 16 valores de morfologia y apariencia se aplican a traves de modulos FiLM (Feature-wise Linear Modulation) situados en cada bloque del UNet, lo que permite modificar controles concretos sin alterar el resto de la tuberia.

Las entradas espaciales deben tener forma `(512, 512, 5)` o `(5, 512, 512)` con el orden de canales neoplastic, inflammatory, connective, dead y epithelial; los valores cero en todos los canales representan fondo, y las intensidades se aceptan como uint8 en `[0, 255]` o como flotantes en `[0, 1]`. No es un render de color, sino un mapa de centroides celulares suavizados. El vector de morfologia sigue el orden `area_mean, area_var, eccentricity_mean, eccentricity_var, solidity_mean, solidity_var, perimeter_mean, perimeter_var, grad_mean, grad_var, r_mean, r_var, g_mean, g_var, b_mean, b_var`.

El entrenamiento descrito en el articulo usa aproximadamente 1,4 millones de teselas de 512 x 512 de TCGA-BRCA, conservando aquellas con mas de dos celulas tumorales detectadas, con contornos, localizaciones y etiquetas de nucleos debiles generados por CellViT++. Se emplearon ocho GPU Tesla V100. El autor no documenta en la model card el uso de RLHF, DPO ni tecnicas de alineamiento preferencial, lo cual es coherente con un modelo generativo de imagen de dominio cientifico.

## Capacidades

- Generacion condicionada de imagenes: sintetiza teselas H&E de 512 x 512 pixeles desde un mapa espacial celular y un vector de morfologia.
- Control espacial explicito: la organizacion celular se gobierna mediante el mapa de cinco canales (neoplasico, inflamatorio, conectivo, muerto, epitelial).
- Control morfologico y de apariencia: 16 variables estandarizadas que cubren area, excentricidad, solidez, perimetro, gradiente y medias y varianzas de color RGB a nivel de nucleo.
- Generacion contrafactual emparejada: al mantener fijo el ruido de difusion y cambiar solo un control solicitado, permite comparar respuestas de un modelo de patologia sobre imagenes con el mismo punto de partida estocastico.
- Soporte de condiciones personalizadas: acepta mapas NPZ y ficheros JSON de morfologia externos mediante `--spatial-map` y `--morphology-json`.
- Flujo reproducible: semilla configurable (`--seed`), numero de pasos de muestreo (`--steps`) e intensidad espacial (`--spatial-strength`).
- No soporta texto libre como condicion principal, tool calling, function calling ni razonamiento multi-paso. La unica capacidad linguistica implicada es el codificador de texto de SD 2.1 base, en ingles.

## Casos de uso

- Explicabilidad de clasificadores de cancer de mama: se introducen cambios controlados en la morfologia nuclear o en la organizacion celular y se mide si un modelo de patologia congelado cambia su prediccion, lo que ayuda a identificar que caracteristicas visuales son causalmente relevantes para el clasificador.
- Auditoria de sensibilidad a la tincion: modificando `r_mean`, `g_mean`, `b_mean` y sus varianzas se puede comprobar si un modelo diagnostico es robusto a variaciones de stain entre laboratorios o si depende de artefactos cromaticos.
- Aumento de datos sinteticos para validacion: genera cohortes de teselas con distribuciones morfologicas definidas para estresar pipelines de analisis antes de disponer de datos reales anotados.
- Estudio de sesgos por subtipo celular: variando la proporcion de los canales neoplasico, inflamatorio y conectivo en el mapa espacial se puede evaluar como responde un analizador a composiciones tisulares poco representadas en el conjunto de entrenamiento.
- Analisis de robustez frente a distribuciones fuera de rango: se aplican controles extremos y se mide degradacion de calidad o aparicion de artefactos en el modelo evaluado, documentando los limites de validez del pipeline.
- Investigacion metodologica en generacion contrafactual: sirve como referencia reproducible para comparar tecnicas de intervencion condicionada (FiLM mas concatenacion latente) frente a alternativas como ControlNet o edicion basada en atencion.
- Docencia y divulgacion tecnica: permite ilustrar con ejemplos controlados como un cambio morfologico concreto afecta a la salida de un modelo, sin usar imagenes de pacientes reales.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son metricas distribucionales de generacion sobre el protocolo de evaluacion del proyecto y su conjunto de referencia. No se han publicado resultados de benchmarks de clasificacion (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo de difusion de imagen.

| Protocolo de generacion | FID | KID (media) |
|---|---:|---:|
| Sin filtrado por semilla | 42,9228 | 0,0246604 |
| Seleccion con CellViT++ sobre ocho semillas | 36,7168 | 0,0196440 |

La mejora de FID en el segundo protocolo no proviene unicamente del generador: requiere generar varios candidatos y ordenarlos con CellViT++, por lo que una sola llamada al modelo no reproduce ese resultado. El autor advierte ademas que la demo de software incluida (`--synthetic-example`) no reproduce la evaluacion del articulo.

## Requisitos de hardware

- Entorno obligatorio: Python 3.10 o 3.11, PyTorch con soporte CUDA y una GPU NVIDIA. El autor no documenta soporte de CPU ni de Apple Silicon.
- VRAM estimada: el autor no publica cifras. Como referencia orientativa, la inferencia en fp16 con UNet, VAE y codificador de texto de la base SD 2.1 suele situarse en torno a 6-8 GB, a lo que hay que sumar el codificador espacial y los MLP de FiLM. Cifra no verificada en la informacion disponible.
- GPU recomendadas: el entrenamiento utilizo ocho Tesla V100. Para inferencia se espera que funcione en A100, H100 y en GPUs de consumo con suficiente memoria; una RTX 4090 (24 GB) o una RTX 3060 de 12 GB deberian ser suficientes segun esa estimacion, pero no hay validacion publicada.
- Despliegue: el checkpoint no es un `DiffusionPipeline` autonomo ni un `ControlNetModel` estandar de Diffusers. La unica via documentada es el script `inference/generate.py` del repositorio de GitHub. No hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI, que ademas no estan orientados a difusion.
- Descarga y cache: los pesos se descargan desde HuggingFace y el codificador de texto, tokenizador y scheduler desde `Manojb/stable-diffusion-2-1-base`; las descargas quedan en cache.
- Latencia y throughput: no disponible.

Ejemplo de invocacion documentado por el autor:

```bash
git clone https://github.com/a12dongithub/PathOGen.git
cd PathOGen
python -m pip install -r inference/requirements.txt
python inference/generate.py --synthetic-example --seed 42 --steps 30 --spatial-strength 2 --output outputs/demo.png
```

## Comparativa con modelos similares

No se dispone de datos verificables de otros generadores contrafactuales de histopatologia en la informacion proporcionada, por lo que la comparacion se limita a la relacion con su modelo base y con el enfoque estandar de control espacial en difusion.

| Modelo o enfoque | Tipo | Parametros | Resolucion de salida | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CPathOGen | Difusion latente con codificador espacial y FiLM | no disponible | 512 x 512 | Mapa espacial de 5 canales + vector de 16 morfologias | CreativeML Open RAIL++-M | HuggingFace (0 descargas, 0 likes) |
| Stable Diffusion 2.1 base (`Manojb/stable-diffusion-2-1-base`) | Difusion latente texto-a-imagen | no disponible en la informacion | 512 x 512 | Prompt de texto | CreativeML Open RAIL++-M | HuggingFace |
| `ControlNetModel` estandar de Diffusers | Difusion latente con rama de control adicional | depende de la variante | 512 x 512 o superior | Mapa de bordes, profundidad, pose u otros | segun la variante | HuggingFace |
| Otros generadores contrafactuales de histopatologia | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso clinico excluido: el generador no esta validado para diagnostico clinico ni para manejo de pacientes. Es una herramienta de investigacion.
- Ausencia de artefacto de normalizacion: el script de preprocesamiento historico no guardo el `StandardScaler` ajustado. Reutilizar valores ya estandarizados del conjunto original es lo unico verificable; un escalador reajustado sobre otra cohorte altera los controles de tincion y geometria.
- Contrafactualidad no garantizada: compartir el ruido de difusion y fijar las condiciones no asegura que toda propiedad no medida permanezca constante. Las diferencias observadas pueden deberse a variables no controladas.
- Perdida de heterogeneidad: los resumenes globales de morfologia comprimen la variabilidad a nivel de celula individual.
- Artefactos fuera de distribucion: controles alejados del rango de entrenamiento producen artefactos visuales.
- Interpretacion causal limitada: las respuestas ante intervenciones sinteticas miden el comportamiento del modelo evaluado, no causalidad biologica ni respuesta a tratamientos.
- Dependencia de software externo: la seleccion de candidatos y el analisis independiente de nucleos requieren CellViT++ y checkpoints propios, que no forman parte de esta release.
- Alcance del checkpoint: se libera unicamente el generador (UNet, VAE, FiLM MLPs y codificador espacial). Se excluyen estado del optimizador, estado del scheduler y ficheros pickle de estado aleatorio.
- Licencia: los pesos conservan los terminos CreativeML Open RAIL++-M de Stable Diffusion 2.1, que incluyen restricciones de uso en determinados ambitos ademas del uso comercial. Las herramientas y datasets de terceros mantienen sus propias licencias y requisitos de acceso.
- Idioma: la etiqueta de idioma es unicamente `en`; no hay soporte multilingue declarado.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Estado de publicacion: el enlace de arXiv no estaba disponible en el momento de redactar esta ficha; el articulo figuraba como pendiente de envio.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo: los enlaces recuperados correspondian a sitios de retransmision deportiva sin relacion alguna con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a12donhf/CPathOGen
- Codigo e instrucciones completas en GitHub: https://github.com/a12dongithub/PathOGen
- Modelo base: https://huggingface.co/Manojb/stable-diffusion-2-1-base
- Articulo (arXiv): pendiente de envio, enlace no disponible en la informacion proporcionada
- Resultados adicionales de la busqueda web: no se han encontrado enlaces relevantes
