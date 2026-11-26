# ERISLab/Benchmark-QuantizedHSIC

## Resumen

ERISLab/Benchmark-QuantizedHSIC no es un modelo generativo, sino un repositorio de 1.230 checkpoints en precision completa en PyTorch (1,1 GB en total) publicado como material reproducible del articulo "Benchmarking Post-Training Quantization for Transformer and Mamba Hyperspectral Classifiers", presentado en el taller CV4EO de WACV 2027. Lo firman Pronay Sarker, Edwin Arkel Rios, Bo-Cheng Lai y Min-Chun Hu, y su proposito es servir de base para evaluar tecnicas de cuantizacion post-entrenamiento (Half-Quadratic Quantization, HQQ, y optimum-quanto) sobre clasificadores de imagenes hiperespectrales.

El repositorio cubre cinco arquitecturas (SpectralFormer, SpectralFormer-CT, MViT, MassFormer y Spectral-Spatial Mamba) entrenadas sobre seis escenas hiperespectrales: Indian Pines, Pavia University, Houston 2013 y tres escenas de Marte captadas por CRISM (Utopia Planitia, Nili Fossae y Holden Crater). Cada combinacion se entrena con cinco semillas (0-4), y se exploran variaciones de presupuesto de etiquetas, anchura de embedding y tamano de tesela espacial.

Es relevante ahora porque combina dos lineas de investigacion activas: por un lado, la aplicacion de arquitecturas transformer y SSM (Mamba) a teledeteccion hiperespectral, donde los metodos clasicos siguen siendo convolucionales o basados en attention espectral; por otro, la cuantizacion post-entrenamiento como via para desplegar estos modelos en plataformas de observacion de la Tierra con recursos limitados. El repositorio no almacena pesos cuantizados: cada resultado cuantizado se reconstruye desde un checkpoint mediante el codigo del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de checkpoints de cinco familias: SpectralFormer, SpectralFormer-CT, MViT, MassFormer y Spectral-Spatial Mamba (transformer y SSM) |
| Parametros totales | no disponible (depende de la familia y de la anchura de embedding; el repositorio no publica recuentos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes hiperespectrales por pixel/tesela, no modelo de lenguaje) |
| Tipos de cuantizacion | HQQ (Half-Quadratic Quantization) y optimum-quanto; los pesos cuantizados no se almacenan, se regeneran con `tools/eval.py` |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (diccionario con `state_dict` y `config` como `argparse.Namespace`); requiere `weights_only=False` al cargar |

## Arquitectura y entrenamiento

El repositorio agrupa cinco familias de clasificadores hiperespectrales. SpectralFormer y SpectralFormer-CT son arquitecturas transformer orientadas a la secuencia espectral de cada pixel; MViT es una variante de vision transformer multiescala; MassFormer emplea attention enmascarada sobre el eje espectral; y Spectral-Spatial Mamba (SS-Mamba) sustituye la attention por un modelo de espacio de estados con procesamiento de teselas espaciales. Cada checkpoint contiene los pesos con la mejor precision de validacion y un objeto `config` con los argumentos de entrenamiento, el serial de la ejecucion y las credenciales de W&B del lanzamiento.

El diseno experimental es un grid factorial. La malla principal (serial 60000) entrena 5 modelos x 6 escenas x 5 semillas con 20 etiquetas por clase (150 checkpoints). Los seriales 60101-60104 anaden presupuestos de 5, 10, 20 y 40 etiquetas por clase (600 checkpoints). Los seriales 60201-60203 varian la anchura de embedding a 16, 32 y 64 para SpectralFormer, SpectralFormer-CT, MassFormer y MViT (360 checkpoints). Los seriales 60301-60304 varian el tamano de tesela espacial de SS-Mamba a 15, 5, 3 y 1 (equivalentes a 1, 9, 25 y 225 tokens; 120 checkpoints). La innovacion metodologica no esta en el entrenamiento, sino en el protocolo de cuantizacion post-entrenamiento con HQQ y Quanto y en las sondas de rango efectivo (`analysis/probes.sh`) que el articulo usa para analizar como afecta la cuantizacion a cada familia.

## Capacidades

- Clasificacion de imagenes hiperespectrales a nivel de pixel o de tesela espacial sobre cubos de datos de teledeteccion.
- Evaluacion reproducible de cuantizacion post-entrenamiento con HQQ y optimum-quanto a distintos bit-widths y tamanos de grupo (por ejemplo, 4 bits con grupo 64).
- Analisis de robustez frente a reduccion de etiquetas de entrenamiento (de 5 a 40 etiquetas por clase).
- Analisis de sensibilidad a la anchura de embedding (16, 32 y 64) en las familias transformer.
- Analisis de sensibilidad a la resolucion espacial de tesela en SS-Mamba (1, 9, 25 y 225 tokens).
- Cobertura de dominios terrestres (Indian Pines, Pavia University, Houston 2013) y planetarios (CRISM: Utopia Planitia, Nili Fossae, Holden Crater).
- Reproducibilidad mediante registro de seriales (`docs/SERIALS.md`) y SHA-1 de cada checkpoint evaluado en el CSV de ejecuciones.
- No soporta generacion de texto, tool calling, agentes, vision general ni capacidades multilingues: es un benchmark de clasificacion, no un modelo de proposito general.

## Casos de uso

- Investigacion en cuantizacion post-entrenamiento: cargar un checkpoint con `torch.load(..., weights_only=False)` y aplicar HQQ o Quanto con `tools/eval.py` para medir la caida de precision a 8, 4 o 2 bits en cada familia y escena.
- Seleccion de arquitectura para teledeteccion hiperespectral: comparar SpectralFormer, MViT, MassFormer y SS-Mamba bajo identico protocolo (mismas escenas, mismas semillas, mismo presupuesto de etiquetas) antes de comprometerse con una familia en un proyecto.
- Despliegue en plataformas de observacion de la Tierra con recursos limitados: usar los resultados de cuantizacion para decidir si un clasificador SpectralFormer o SS-Mamba puede ejecutarse en hardware embarcado a 4 bits sin perdida inaceptable de exactitud.
- Clasificacion de materiales en escenas CRISM: reutilizar los checkpoints de Utopia Planitia, Nili Fossae y Holden Crater como linea base para experimentos de identificacion de minerales en superficie marciana.
- Estudio de eficiencia de datos: aprovechar los seriales 60101-60104 para medir como varia la exactitud con 5, 10, 20 y 40 etiquetas por clase, util en escenarios donde el etiquetado de terreno es costoso.
- Reproducibilidad de resultados academicos: el repositorio permite regenerar cada tabla del articulo desde los checkpoints y el SHA-1 registrado, sin depender de pesos cuantizados precalculados.
- Analisis de rango efectivo: ejecutar `analysis/probes.sh` para estudiar la estructura de pesos de cada familia y justificar decisiones de cuantizacion a nivel de capa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al articulo de WACV 2027 (enlace pendiente de publicacion) para las cifras de exactitud y de degradacion por cuantizacion.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio (1,1 GB para 1.230 checkpoints) sugiere checkpoints individuales del orden de pocos megabytes, compatibles con GPU de consumo, pero no se publican cifras por modelo.
- GPU recomendadas: no disponible. El codigo usa PyTorch y las sondas de rango efectivo requieren GPU (`bash analysis/probes.sh`), sin especificar modelo.
- GPU de consumo: probablemente viable dado el tamano de los checkpoints, pero no confirmado en la informacion disponible.
- Opciones de despliegue: el flujo previsto es PyTorch con el repositorio de codigo (`tools/eval.py`, lanzadores de `script/`) y las librerias HQQ y optimum-quanto. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ERISLab/Benchmark-QuantizedHSIC | Benchmark de checkpoints de clasificacion hiperespectral (5 familias) | no disponible | no aplica | Apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| SpectralFormer (original, Hong et al.) | Transformer espectral para HSI | no disponible | no aplica | no disponible | Repositorio de los autores |
| SS-Mamba / Mamba-based HSI classifiers | Modelo de espacio de estados para HSI | no disponible | no aplica | no disponible | Publicaciones y repositorios de terceros |

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo listo para inferencia directa: requiere clonar el repositorio de codigo, instalar su entorno y construir el modelo con `build_model` a partir de los argumentos de entrenamiento.
- La carga exige `weights_only=False` porque `config` es un `argparse.Namespace`, lo que implica riesgos de seguridad al cargar checkpoints de origen no fiable.
- El serial del directorio puede diferir del serial registrado en `config`; los checkpoints de SpectralFormer-CT almacenan la clave de modelo `sf`. Un mapeo incorrecto produce evaluaciones erroneas.
- No se almacenan pesos cuantizados: cualquier comparacion de cuantizacion debe regenerarse, lo que introduce dependencia de las versiones de HQQ y optimum-quanto.
- Dominio muy restringido: solo clasificacion de imagenes hiperespectrales en seis escenas concretas; no generaliza a otras tareas de vision ni de lenguaje.
- Riesgo de sobreajuste a las escenas del benchmark: Indian Pines, Pavia y Houston son conjuntos pequenos y ampliamente usados, con posible sesgo de seleccion en la literatura.
- Sin datos publicados de sesgo, alucinacion o comportamiento fuera de distribucion; no aplican las metricas habituales de modelos generativos.
- Licencia Apache-2.0 permite uso comercial, pero el articulo asociado aun no tiene enlace publicado, lo que limita la verificacion de resultados.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ERISLab/Benchmark-QuantizedHSIC
- Codigo: https://github.com/itsPronay/Benchmark-QuantizedHSIC
- Articulo: pendiente de publicacion (la model card indica "link to be added")
- Registro de seriales: `docs/SERIALS.md` en el repositorio de codigo
- Cita: Sarker, Rios, Lai y Hu, "Benchmarking Post-Training Quantization for Transformer and Mamba Hyperspectral Classifiers", WACV 2027 Workshops (CV4EO)
