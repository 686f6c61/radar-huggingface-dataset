# asferrer/oceanguard-biodex

## Resumen

OceanGuard BioDex es un paquete de recursos de identificacion visual de especies marinas publicado por el desarrollador asferrer para su aplicacion Android OceanGuard AI. No es un modelo de lenguaje generativo, sino un conjunto de artefactos que permiten la identificacion de especies en el dispositivo sin conexion: un codificador de imagenes BioCLIP ViT-B/16 exportado a ONNX en fp32, un indice de referencia con 198 especies (mayoritariamente mediterraneas), un catalogo taxonomico multilingue y datos auxiliares de filtrado geografico. El sistema implementa recuperacion visual (RAG visual): la foto se codifica con BioCLIP y se compara con embeddings de referencia, devolviendo "no identificado" cuando la confianza calibrada es baja.

El paquete v2 sustituye al v1 (OpenCLIP ViT-B/32 sobre LAION-2B) y mejora de forma sustancial la precision: Top-1 de 0,643 frente a 0,489 en iNaturalist, y Top-5 de 0,858 frente a 0,768. La relevancia actual reside en que demuestra un pipeline completo de vision por computador para biodiversidad desplegable en movil, con calibracion de umbrales, autotest numerico en el dispositivo y trazabilidad de licencias de cada foto de referencia.

El tamano del repositorio es de 1,1 GB, con el codificador ONNX de 345 MB como pieza principal. La licencia del paquete es CC BY 4.0, aunque los componentes individuales tienen licencias distintas (MIT para el codificador BioCLIP, CC BY 4.0 para el indice, y CC BY-NC para AquaMaps en el catalogo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BioCLIP ViT-B/16 (vision transformer) exportado a ONNX; pack v1: OpenCLIP ViT-B/32 |
| Parametros totales | no disponible (ViT-B/16, aproximadamente 86 M en el backbone, no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224 px) |
| Tipos de cuantizacion | fp32 (publicado); int8 probado pero no publicado por inconsistencias entre x86 y ARM |
| Idiomas soportados | 6 idiomas en el catalogo de nombres comunes (no especificados en la model card) |
| Licencia | CC BY 4.0 (paquete); encoder BioCLIP MIT; catalogo incluye datos AquaMaps CC BY-NC |
| Formato de pesos | ONNX (fp32), indice binario SPEX (float16 + JSON lines), JSON, JSONL |
| Dimension del embedding | 512 |
| Entrada del encoder | `pixel_values` [1, 3, 224, 224] |
| Salida del encoder | `image_features` [1, 512] |
| Especies en el indice | 198 (pack v2); 203 (pack v1) |
| Prototipos por especie | 6 (k-means) |
| Fotos de referencia | 5.010 |
| Tamano del repositorio | 1,1 GB |
| Tamano del encoder ONNX | 345 MB |

## Arquitectura y entrenamiento

El componente central es BioCLIP ViT-B/16, un vision transformer con atencion por parches de 16x16 sobre imagenes de 224x224, que produce un embedding de 512 dimensiones. BioCLIP es un modelo fundacional para el arbol de la vida entrenado por el equipo de imageomics (Stevens et al., CVPR 2024) sobre datos de iNaturalist; el paquete no reentrena el codificador, sino que lo exporta a ONNX en fp32 y lo acompaña de un contrato de entrada (`species_pack.json`) con tamano 224, media y desviacion tipica de CLIP, nombres de tensores, temperatura softmax y umbrales calibrados sobre un split de validacion.

El indice de referencia se construye con k-means sobre los embeddings de 5.010 fotos de 198 especies, generando 6 prototipos por especie almacenados en formato SPEX (cabecera, vectores float16 y lineas JSON). La recuperacion compara el embedding de la consulta con estos prototipos. El paquete incluye ademas un autotest numerico: el embedding de un patron sintetico calculado en PC se compara con el resultado en dispositivo y la app rechaza el encoder si la similitud coseno es inferior a 0,99. Se intento una version int8 del encoder pero no se publico porque ONNX Runtime produce resultados distintos en x86 y en telefonos ARM, fallando el autotest.

## Capacidades

- Identificacion visual de 198 especies marinas (mayoritariamente mediterraneas) mediante recuperacion sobre embeddings.
- Funcionamiento completamente offline en Android tras la descarga del paquete.
- Rechazo calibrado: por debajo de los umbrales de confianza responde "no identificado" y muestra candidatos cercanos en lugar de adivinar.
- Filtro geografico opcional mediante raster MEOW (Marine Ecoregions of the World) a 0,25 grados y jerarquia de ecorregiones.
- Catalogo taxonomico con nombres cientificos y comunes en 6 idiomas, AphiaID, ecorregiones MEOW y estado IUCN.
- Trazabilidad de licencias y atribucion por foto de referencia (`reference_provenance.jsonl`).
- Autotest de integridad numerica del encoder en el dispositivo (coseno >= 0,99).
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un pipeline de vision y recuperacion.

## Casos de uso

- Identificacion de especies en campo sin cobertura: un buceador o biologo marino fotografia un ejemplar y la app devuelve la especie o candidatos, sin necesidad de red, gracias al codificador ONNX de 345 MB y al indice local.
- Ciencia ciudadana y avistamientos: integracion del paquete en apps de registro de biodiversidad para preetiquetar fotos antes de la validacion experta, reduciendo el esfuerzo de anotacion manual.
- Educacion ambiental en museos o acuarios: catalogo multilingue con nombres comunes en 6 idiomas y estado IUCN para fichas interactivas de especies.
- Control de capturas en pesca artesanal: verificacion visual de especies declaradas, con el filtro MEOW para restringir candidatos a la ecorregion de la zona de pesca.
- Monitorizacion de especies invasoras o protegidas: el rechazo calibrado (83 % de fotos fuera de catalogo rechazadas en iNaturalist) permite separar avistamientos plausibles de ruido.
- Auditoria de datasets de biodiversidad: uso del indice y la procedencia para reconstruir y evaluar pipelines de recuperacion visual con licencias trazables.
- Despliegue en dispositivos de bajo consumo: el formato ONNX fp32 y el indice float16 estan pensados para inferencia en movil, sin GPU dedicada.

## Benchmarks y rendimiento

Los resultados proceden de la evaluacion del propio autor con la cadena de la app (recorte cuadrado central, 224 px, normalizacion del paquete) sobre fotos no incluidas en el indice.

| Conjunto de test | Pack | Top-1 | Top-5 | Respondidas con alta confianza (proporcion / precision) | Fotos fuera de catalogo rechazadas |
|---|---|---|---|---|---|
| iNaturalist (3.236 fotos, 198 especies, 305 fuera de catalogo) | v1 | 0,489 | 0,768 | n/a | n/a |
| iNaturalist (3.236 fotos, 198 especies, 305 fuera de catalogo) | v2 | 0,643 | 0,858 | 28 % / 94,5 % | 83 % |
| GBIF (no iNaturalist) y Wikimedia Commons (4.107 fotos, 197 especies, 336 fuera de catalogo) | v1 | 0,404 | 0,699 | n/a | n/a |
| GBIF (no iNaturalist) y Wikimedia Commons (4.107 fotos, 197 especies, 336 fuera de catalogo) | v2 | 0,594 | 0,825 | 30 % / 91,6 % | 77 % |

Las respuestas de menor confianza ("posibles" especies) son correctas aproximadamente el 70 % de las veces. Los errores principales se concentran en pares de especies morfologicamente similares del mismo genero o familia (por ejemplo *Sardina pilchardus* y *Engraulis encrasicolus*, *Hippocampus hippocampus* y *H. guttulatus*, *Caretta caretta* y *Eretmochelys imbricata*). Las etiquetas del segundo conjunto de test no han sido verificadas por un experto.

## Requisitos de hardware

- Inferencia en movil Android: el codificador ONNX fp32 de 345 MB esta disenado para ejecutarse en el dispositivo; no se especifican requisitos minimos de RAM o SoC.
- VRAM estimada en servidor: no disponible en la model card; por el tamano del ViT-B/16 en fp32, cabria en cualquier GPU consumer con al menos 2-4 GB libres, aunque no se aportan medidas.
- GPU recomendadas: no disponibles; el caso de uso declarado es CPU/GPU integrada en telefono, no servidor.
- Compatibilidad consumer: previsiblemente cualquier GPU consumer moderna puede ejecutar el encoder ONNX, pero no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (unico runtime mencionado); no se citan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se documenta que la version int8 falla el autotest en ARM por divergencias de ONNX Runtime entre x86 y ARM.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Top-1 (iNaturalist) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OceanGuard BioDex v2 (este paquete) | BioCLIP ViT-B/16 + indice de 198 especies | no disponible (ViT-B/16) | 224x224 px, embedding 512 | 0,643 | CC BY 4.0 (paquete), MIT (encoder) | Hugging Face, ONNX |
| OceanGuard BioDex v1 | OpenCLIP ViT-B/32 + indice de 203 especies | no disponible (ViT-B/32) | 224x224 px | 0,489 | CC BY 4.0 (paquete), MIT (encoder) | Hugging Face, ONNX |
| BioCLIP base (imageomics/bioclip) | Vision foundation model | no disponible | 224x224 px | no disponible (no evaluado en este test) | MIT | Hugging Face |
| OpenCLIP ViT-B/32 LAION-2B | Vision-language model | no disponible | 224x224 px | no disponible (no evaluado en este test) | MIT | Hugging Face |

No se dispone de comparaciones con otros paquetes de identificacion de especies marinas en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura limitada a 198 especies, mayoritariamente mediterraneas; especies fuera de catalogo se rechazan en un 77-83 % de los casos, pero el resto puede producir falsos positivos.
- Confusion documentada entre pares de especies morfologicamente similares del mismo genero o familia.
- La precision de las respuestas de baja confianza ("posibles") ronda el 70 %, insuficiente para decisiones criticas sin revision experta.
- Las etiquetas del conjunto de test de GBIF y Wikimedia Commons no han sido verificadas por un experto, lo que limita la fiabilidad de esas cifras.
- La version int8 no se publica por inconsistencias entre x86 y ARM; solo hay encoder fp32, con mayor coste de almacenamiento (345 MB) y computo.
- Licencias heterogeneas: el catalogo incorpora datos de AquaMaps con licencia CC BY-NC, por lo que el uso comercial requiere revisar los terminos de AquaMaps antes de su explotacion.
- El indice y la procedencia son CC BY 4.0 y derivan solo de fotos de iNaturalist con licencia CC0 o CC BY; las fotos originales no se redistribuyen, pero la atribucion debe conservarse.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso; cualquier uso conversacional requiere un componente adicional.
- El autotest del encoder exige coseno >= 0,99 en dispositivo; desviaciones por versiones de ONNX Runtime o hardware pueden provocar el rechazo del paquete.
- No se documentan sesgos demograficos ni de otro tipo, pero la distribucion geografica de las fotos de referencia (iNaturalist) puede sesgar el rendimiento hacia zonas con mayor cobertura de observaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asferrer/oceanguard-biodex
- Repositorio de la app y herramientas de reconstruccion/evaluacion: https://github.com/asferrer/oceanguard-app
- BioCLIP (imageomics/bioclip): https://huggingface.co/imageomics/bioclip
- Paper BioCLIP (Stevens et al., CVPR 2024): https://arxiv.org/abs/2311.18803
- Documentacion del pipeline de especies (`docs/SPECIES_ID.md`): https://github.com/asferrer/oceanguard-app/blob/main/docs/SPECIES_ID.md
- Herramientas de especies (`tools/species/`): https://github.com/asferrer/oceanguard-app/tree/main/tools/species
- MEOW (Spalding et al., 2007, The Nature Conservancy): https://www.nature.org/
