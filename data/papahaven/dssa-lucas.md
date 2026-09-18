# Papahaven/DSSA-LUCAS

## Resumen

DSSA-LUCAS (Dual Surface-Subsurface Adapter) es un modelo de clasificación de cobertura del suelo desarrollado por Papahaven que combina fotografía RGB a nivel del suelo con propiedades fisicoquímicas del horizonte superficial del suelo. A diferencia de los modelos de teledetección convencionales, que operan sobre imágenes satelitales, DSSA está diseñado para muestreos de campo terrestres y se entrena sobre el benchmark LUCAS (Land Use/Cover Area frame Survey), con 13.608 muestras de entrenamiento y un conjunto de test congelado de 2.917 muestras repartidas en 6 clases.

El repositorio publica dos variantes de pesos: DSSA-Standard, la arquitectura completa con 8,42 millones de parámetros, y DSSA-Lite, una versión optimizada para edge computing con 3,99 millones de parámetros. Ambas usan EfficientNet-B0 como extractor visual y añaden adaptadores ligeros que inyectan el vector de suelo mediante un mecanismo de enrutamiento por relevancia de modalidad. En el benchmark congelado, DSSA-Standard alcanza un 86,20 % de accuracy y 0,8287 de macro F1, mientras que DSSA-Lite se queda en un 80,63 % de accuracy con menos de la mitad de parámetros.

Su relevancia actual es doble: por un lado, demuestra que la fusión multimodal imagen-tabla puede mejorar la clasificación de cobertura del suelo sin recurrir a imágenes satelitales; por otro, su tamaño (15,5 MB y 32,5 MB de checkpoint) permite desplegarlo en hardware de consumo e incluso en dispositivos de campo con menos de 1 GB de VRAM. El modelo se publica bajo licencia MIT y el código está disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (EfficientNet-B0 como backbone) con adaptadores multimodales; Spatial Attention Decomposition, enrutamiento Physics-Guided Modality Relevance (PGMR) y Adaptive Zero-Soil canopy gating |
| Parametros totales | DSSA-Standard: 8,42 M; DSSA-Lite: 3,99 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | no disponible (los pesos se publican en FP32, sin versiones cuantizadas) |
| Idiomas soportados | en (la model card declara unicamente ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (`best_dssa_full_standard.pth`, 32,5 MB; `dssa_lite_best_seed42.pth`, 15,5 MB) |
| Entrada de imagen | tensor RGB de 224 x 224 |
| Entrada tabular | vector de suelo normalizado de 8 caracteristicas (pH_H2O, pH_CaCl2, OC, CaCO3, N, P, K, EC) |
| Clases de salida | 6 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

DSSA se construye sobre EfficientNet-B0 como extractor de caracteristicas visuales y le acopla dos ramas adicionales. La primera es un modulo de atencion espacial que descompone los mapas de caracteristicas para resaltar regiones relevantes de la fotografia a nivel del suelo. La segunda es un adaptador tabular que procesa el vector fisicoquimico del suelo mediante un enrutamiento denominado Physics-Guided Modality Relevance (PGMR), que reparte el peso entre las variables visibles (pH_H2O, pH_CaCl2, OC, CaCO3, EC) y las subsuperficiales (N, P, K, EC). Sobre ambas se aplica un mecanismo de compuerta llamado Adaptive Zero-Soil canopy gating, pensado para degradar de forma controlada cuando la informacion de suelo es escasa o nula. En la variante estandar, la dimension compartida es de 256 con 4 cabezas de atencion.

DSSA-Lite trunca EfficientNet-B0 en la etapa 5 y descarta la cabeza de expansion de 1.280 canales, lo que reduce la sobrecarga del adaptador a 528.000 parametros y baja la dimension interna a 128, con un dropout de 0,15. El entrenamiento se realizo con PyTorch 2.6.0, CUDA 12.8 y cuDNN 9.x en precision simple (FP32) sobre una NVIDIA GeForce RTX 5070 Ti de 16 GB. DSSA-Standard tardo entre 20 y 25 minutos en converger (25-28 epocas, batch de 64, entre 45 y 55 segundos por epoca, con paciencia de early stopping de 15). DSSA-Lite convergio en 20-24 epocas, entre 10 y 12 minutos totales, a 25-35 segundos por epoca. No se documenta en la model card el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con una tarea discriminativa.

## Capacidades

- Clasificacion de cobertura del suelo en 6 clases a partir de fotografia RGB a nivel del suelo.
- Fusion multimodal de imagen y datos tabulares fisicoquimicos del suelo (8 variables normalizadas).
- Atencion espacial descompuesta sobre la imagen para resaltar regiones discriminativas.
- Enrutamiento condicionado por fisica del suelo (PGMR) que pondera variables visibles frente a subsuperficiales.
- Compuerta Adaptative Zero-Soil, que permite operar con informacion de suelo reducida o ausente.
- Inferencia en tiempo real: 9,85 ms de latencia por imagen en DSSA-Lite y 13,87 ms en DSSA-Standard, ambos con batch de 1.
- Alto throughput en lote: 3.724,4 img/s (Lite) y 3.344,9 img/s (Standard) con batch de 64.
- No soporta tool calling, function calling, agentes, generacion de texto ni razonamiento multi-paso.
- No dispone de modo thinking, vision generativa, audio ni capacidades multilingues (declara solo ingles).

## Casos de uso

- Inventario de cobertura del suelo en campanas de campo: el modelo clasifica cada punto de muestreo a partir de la fotografia tomada por el tecnico y la analitica de suelo asociada, sustituyendo la etiquetacion manual y reduciendo el sesgo entre anotadores.
- Monitorizacion agricola de parcelas: integrado en una aplicacion movil de campo, DSSA-Lite procesa cada imagen en menos de 10 ms con 698 MB de VRAM, lo que permite clasificar cultivos y coberturas in situ sin conexion a un servidor.
- Seguimiento de carbono organico y degradacion del suelo: al incorporar OC, CaCO3 y pH como variables de entrada, el modelo distingue coberturas asociadas a suelos acidos o calcicos, util para programas de vigilancia de la salud del suelo.
- Validacion de productos satelitales: las predicciones de DSSA sobre puntos LUCAS sirven como verdad terreno de alta calidad para contrastar mapas de cobertura generados por teledeteccion orbital.
- Anotacion automatica de grandes repositorios fotograficos: con 3.344,9 img/s en batch de 64 sobre una sola GPU, es viable etiquetar lotes masivos de imagenes de campana previamente no clasificadas.
- Investigacion en IA medioambiental: la arquitectura de adaptadores ligeros sobre EfficientNet-B0 sirve como linea base reproducible para estudiar la fusion de modalidades imagen-tabla en ciencias del suelo.
- Despliegue en dispositivos de borde: con 3,99 millones de parametros y 15,5 MB de checkpoint, DSSA-Lite puede ejecutarse en equipos con GPU integrada o en estaciones de campo alimentadas por bateria.
- Planificacion territorial y forestal: la clasificacion sistematica de transectos permite alimentar modelos de cambio de uso del suelo con observaciones georreferenciadas consistentes.

## Benchmarks y rendimiento

| Modelo | Parametros | Latencia (B=1) | Throughput (B=64) | VRAM pico | Accuracy (test) | Macro F1 | Cohen's Kappa |
|---|---|---|---|---|---|---|---|
| DSSA-Lite (edge) | 3,99 M | 9,85 ms | 3.724,4 img/s | 698,0 MB | 80,63 % | 0,7487 | 0,7553 |
| DSSA-Standard | 8,42 M | 13,87 ms | 3.344,9 img/s | 893,7 MB | 86,20 % | 0,8287 | 0,8286 |

Las metricas corresponden al benchmark LUCAS congelado con N = 2.917 muestras y 6 clases. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de clasificacion de cobertura del suelo, ni desgloses por clase, matriz de confusion o intervalos de confianza.

## Requisitos de hardware

- VRAM estimada en FP32: 698,0 MB para DSSA-Lite y 893,7 MB para DSSA-Standard, medidos en el perfilado oficial del autor.
- Cabe en cualquier GPU de consumo: desde una GTX 1650 de 4 GB hasta una RTX 4090, pasando por RTX 3060, RTX 4060 o RTX 5070 Ti. No requiere VRAM de centro de datos.
- GPU de referencia usada en el entrenamiento y perfilado: NVIDIA GeForce RTX 5070 Ti (16 GB GDDR7, arquitectura Blackwell SMs) con CPU x86-64.
- Entorno de software validado: PyTorch 2.6.0, CUDA 12.8 y cuDNN 9.x.
- Latencia en batch de 1: 9,85 ms (Lite) y 13,87 ms (Standard).
- Throughput en batch de 64: 3.724,4 img/s (Lite) y 3.344,9 img/s (Standard).
- Opciones de despliegue: los checkpoints son ficheros `.pth` de PyTorch y requieren el codigo de los modulos `models.dssa_model` y `models.dssa_lite` del repositorio GitHub. No se publican versiones ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de este tipo. La via recomendada es cargar el `state_dict` con `torch.load(..., weights_only=True)` y ejecutar en modo evaluacion.
- Ahorro de memoria adicional: al ser modelos pequenos, la carga puede hacerse en CPU (`map_location="cpu"`) y mover a GPU solo durante la inferencia.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas de DSSA frente a otros clasificadores de cobertura del suelo, ni resultados de modelos alternativos sobre el mismo subconjunto LUCAS congelado. La unica comparacion documentada es interna, entre las dos variantes del propio modelo:

| Criterio | DSSA-Lite | DSSA-Standard |
|---|---|---|
| Parametros | 3,99 M | 8,42 M |
| Accuracy (test) | 80,63 % | 86,20 % |
| Macro F1 | 0,7487 | 0,8287 |
| Cohen's Kappa | 0,7553 | 0,8286 |
| Latencia (B=1) | 9,85 ms | 13,87 ms |
| VRAM pico | 698,0 MB | 893,7 MB |
| Tamano de checkpoint | 15,5 MB | 32,5 MB |
| Backbone | EfficientNet-B0 truncado en etapa 5 | EfficientNet-B0 completo con adaptadores |
| Licencia | MIT | MIT |

Respecto a alternativas de la misma categoria (clasificadores sobre EfficientNet-B0 sin rama tabular, o modelos de cobertura del suelo basados en imagenes satelitales), no hay datos de rendimiento en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Dominio de aplicacion muy acotado: solo clasifica 6 clases de cobertura del suelo y no es un modelo generativo ni un asistente conversacional.
- Dependencia del vector de suelo: la entrada requiere 8 variables fisicoquimicas normalizadas (pH_H2O, pH_CaCl2, OC, CaCO3, N, P, K, EC). Sin ellas, el rendimiento depende del mecanismo Adaptive Zero-Soil gating, cuyo comportamiento no se cuantifica en la model card.
- Tipo de imagen restringido: las fotografias deben ser RGB a nivel del suelo y de 224 x 224. No se ha evaluado con imagenes satelitales, aereas, multiespectrales ni con otras condiciones de iluminacion.
- Idioma: la model card declara soporte unicamente en ingles, aunque al ser un clasificador de imagenes el impacto real es limitado; no hay documentacion multilingue.
- Riesgo de sesgo: el entrenamiento se apoya en LUCAS, una encuesta con cobertura geografica europea y protocolos de muestreo concretos. El modelo puede degradarse fuera de ese contexto geografico, edafologico o de practicas de muestreo.
- Sin validacion externa: todas las metricas provienen de un unico conjunto de test congelado (N = 2.917) y de dos particiones de semilla. No hay validacion cruzada, particion por region geografica ni evaluacion en dominios distintos.
- Estado de publicacion: la cita asociada referencia un envio a IEEE con ano 2026 y no consta articulo aceptado ni revisado por pares en la informacion disponible.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- Formato de pesos: se distribuyen como `.pth` de PyTorch, sin `safetensors`, ONNX ni cuantizaciones. La carga exige `weights_only=True` y confiar en el fichero, ademas de depender del codigo del repositorio GitHub para reconstruir la clase del modelo.
- Licencia: MIT, permisiva y compatible con uso comercial, siempre que se conserve el aviso de copyright y la atribucion.
- Alucinacion: no aplica en el sentido generativo; el riesgo real es una clasificacion erronea con alta confianza, sin mecanismo de abstención documentado.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion relevante sobre el modelo (devuelven resultados no relacionados), por lo que no hay fuentes externas que corroboren las cifras.

## Enlaces

- HuggingFace: https://huggingface.co/Papahaven/DSSA-LUCAS
- Repositorio de codigo en GitHub: https://github.com/siam4201/DSSA-LUCAS
- Cita asociada (envio a IEEE Transactions / Conference, 2026): Siam, Sarker y Mim, Farhana Nur, "Dual Surface-Subsurface Adapter for Ground-Level Land Cover Classification with Soil Physicochemical Context".
- Resultados de busqueda web: sin resultados relevantes para el modelo; las entradas devueltas corresponden a un portal educativo no relacionado.
