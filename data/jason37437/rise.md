# Jason37437/RiSE

## Resumen

RiSE (Residual Subspace Expert) es un conjunto de puntos de control para la localizacion generalizable de manipulaciones en imagenes con texto, un problema clasico de forense documental. Lo publica el usuario Jason37437 en Hugging Face y el codigo asociado vive en el repositorio KahimWong/RiSE de GitHub. No es un modelo generativo ni un modelo de lenguaje: es un modelo de vision por computador que produce una prediccion densa (a nivel de pixel o region) sobre que zonas de una imagen han sido alteradas.

El modelo parte del backbone auto-supervisado DINOv3 ViT-L/16 de Meta (facebook/dinov3-vitl16-pretrain-lvd1689m) y anade el mecanismo "Residual Subspace Expert" descrito en el titulo. Se distribuyen cuatro variantes (RiSE-1, RiSE-3, RiSE-9 y RiSE-9-DCT), todas sobre el mismo backbone; la variante DCT incorpora un proyector de coeficientes DCT de 1024 canales con fusion en el bloque 10 (indice base cero), lo que le permite explotar artefactos de compresion JPEG.

La relevancia actual es doble: por un lado ataca la generalizacion cross-domain en forense de documentos, donde los modelos suelen degradarse al pasar de un dominio de entrenamiento a capturas de pantalla, escaneos o fotografias de documentos; por otro, se apoya en un backbone de ultima generacion (DINOv3) en lugar de disenos ad hoc. El protocolo de evaluacion publico (Doc Protocol, entrenamiento en DocTamper y evaluacion en siete conjuntos) y la licencia MIT de los checkpoints facilitan su reproduccion, aunque a fecha de la ficha el repositorio no tiene descargas ni valoraciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer ViT-L/16 (DINOv3) con cabezas "Residual Subspace Expert"; la variante RiSE-9-DCT anade un proyector DCT de 1024 canales con fusion en el bloque 10 (indice base cero) |
| Parametros totales | No disponible (backbone ViT-L/16, orden de magnitud de ~300 M de parametros solo en el backbone; no se documenta el total con cabezas y proyectores) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; la inferencia acepta imagenes de 512x512 pixeles) |
| Tipos de cuantizacion | No disponible (se distribuyen checkpoints PyTorch .pth sin variantes cuantizadas documentadas) |
| Idiomas soportados | en (idioma declarado en la ficha; el modelo procesa imagenes, el campo se refiere a la documentacion) |
| Licencia | MIT para los checkpoints; los terminos del backbone preentrenado DINOv3 se aplican por separado |
| Formato de pesos | PyTorch (.pth) acompanado de un fichero de configuracion .json por checkpoint; hashes SHA-256 y tamanos en checksums.json |
| Variantes incluidas | RiSE-1, RiSE-3, RiSE-9, RiSE-9-DCT (checkpoint + config cada una) |
| Tamano del repositorio | 5,6 GB |
| Metrica declarada | F1 |
| Dataset asociado | Jason37437/Doc-Protocol-Data |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

RiSE combina un backbone ViT-L/16 preentrenado con DINOv3 (24 bloques, patch de 16x16) con el modulo propietario "Residual Subspace Expert". El backbone aporta representaciones visuales generalistas y el modulo experto se encarga de aislar la senal residual de manipulacion, es decir, la diferencia entre la imagen observada y la estructura esperada del documento. La arquitectura no es MoE ni un modelo de espacio de estados: es un transformer de vision con cabezas adicionales. La variante RiSE-9-DCT incorpora ademas una rama que proyecta coeficientes DCT a 1024 canales y los fusiona en el bloque 10, de modo que el modelo puede explotar discontinuidades en la rejilla de bloques JPEG tipicas de las ediciones sobre documentos ya comprimidos.

En cuanto al entrenamiento, la model card documenta un protocolo "Doc Protocol": entrenamiento sobre DocTamper y evaluacion en siete conjuntos de test. Los conjuntos in-domain (FCD, SCD y Test) se comprimen exactamente una vez aplicando el factor de calidad final oficial (record[-1]); los conjuntos cross-domain (T-SROIE, OSTF, TPIC-13 y RTM) se usan como parches JPEG RGB originales, sin redimensionado ni recompresion adicional. No se detalla en la informacion proporcionada el numero de tokens o imagenes de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO (poco habituales en este tipo de tarea). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal, que no aplican a un modelo de vision densa.

## Capacidades

- Localizacion de manipulaciones en imagenes: genera predicciones densas que senalan que regiones de una imagen han sido alteradas, en lugar de una simple etiqueta binaria de imagen falsa o autentica.
- Enfoque text-centric: el modelo esta disenado para documentos e imagenes con texto (capturas, escaneos, fotografias de documentos), no para fotografia natural generica.
- Analisis de artefactos de compresion: la variante RiSE-9-DCT utiliza coeficientes DCT y requiere entrada JPEG, lo que le permite detectar rastros de doble compresion y ediciones sobre material ya comprimido.
- Generalizacion cross-domain: el protocolo de evaluacion cubre siete conjuntos, incluidos dominios no vistos en entrenamiento (T-SROIE, OSTF, TPIC-13, RTM).
- Entrada de imagen fija: inferencia sobre imagenes de 512x512 pixeles.
- Carga segura de pesos: el repositorio de codigo incluye un cargador estricto y el repositorio de modelos publica checksums SHA-256 y tamanos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, dialogo multi-turno, vision generativa, audio ni modo "thinking": no es un modelo de lenguaje ni multimodal generativo.
- Capacidades multilingues: no documentadas; el campo de idioma declarado es unicamente en.

## Casos de uso

- Verificacion documental en procesos KYC y onboarding: el modelo puede actuar como segunda linea de defensa sobre nominas, extractos bancarios o recibos subidos por el usuario, marcando las regiones sospechosas para revision manual antes de aprobar la cuenta.
- Analisis forense de siniestros en seguros: ante facturas o partes medicos digitalizados, el modelo localiza que campos han sido modificados, lo que permite priorizar expedientes por riesgo en lugar de revisar todo manualmente.
- Verificacion de justificantes de pago en plataformas de comercio electronico: las capturas de transferencias suelen circular como JPEG recomprimidos; la variante RiSE-9-DCT esta especificamente preparada para este escenario al explotar artefactos DCT.
- Auditoria de titulos academicos y certificaciones: comparar el documento presentado con la estructura esperada y detectar inserciones o sustituciones de texto en diplomas y certificados.
- Preprocesado en pipelines de moderacion y fact-checking: integrar el modelo como filtro previo que marque imagenes con texto editado (titulares, tweets, capturas) para que un analista humano revise solo los casos con mayor probabilidad de manipulacion.
- Investigacion academica en forense documental: usar los cuatro checkpoints y el protocolo Doc Protocol como linea base reproducible sobre DocTamper y los siete conjuntos de evaluacion, o como punto de partida para comparar tecnicas de localizacion.
- Cumplimiento normativo y eDiscovery: en entornos con requisitos de auditoria documental, generar mapas de manipulacion trazables que se archiven junto al documento original y su hash.
- Analisis de reclamaciones en marketplaces: detectar capturas de conversaciones o resenas manipuladas antes de resolver una disputa entre comprador y vendedor.

## Benchmarks y rendimiento

La model card describe un benchmark propio, "Doc Protocol F1", con entrenamiento en DocTamper y evaluacion en siete conjuntos (in-domain: FCD, SCD, Test; cross-domain: T-SROIE, OSTF, TPIC-13, RTM). Sin embargo, los resultados numericos se presentan unicamente como una imagen (table2.svg) dentro del repositorio y no estan incluidos en el texto de la informacion proporcionada.

No se han publicado en la informacion disponible los valores concretos de F1, ni resultados en benchmarks estandar de forense como MMLU, HumanEval o GSM8K (que ademas no aplican a este tipo de modelo). No se inventan cifras.

| Benchmark | Conjuntos | Metrica | Resultado |
|---|---|---|---|
| Doc Protocol | FCD, SCD, Test, T-SROIE, OSTF, TPIC-13, RTM | F1 | No disponible en el texto; publicado como table2.svg en el repositorio de Hugging Face |

## Requisitos de hardware

- VRAM estimada para inferencia: no documentada por el autor. Como referencia de orden de magnitud, un ViT-L/16 con imagenes de 512x512 pixeles y lote 1 ocupa del orden de 2 a 4 GB en precision de 32 bits, incluyendo pesos y activaciones; se trata de una estimacion basada en la arquitectura, no de un dato publicado.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 4070) deberia ser suficiente para inferencia en lote 1; para evaluacion por lotes sobre los siete conjuntos conviene una GPU de 16-24 GB (RTX 4090, A5000, L4) o superior (A100, H100).
- Compatibilidad con GPU de consumo: si, previsiblemente cabe en GPU de consumo modernas; no hay confirmacion publicada.
- Opciones de despliegue: el repositorio oficial proporciona un script infer.py para inferencia sobre una imagen y evaluate.py para evaluacion por lotes, ambos sobre PyTorch 2.4.0 con torchvision 0.19.0 (indice cu121) y un entorno virtual con requirements.txt. No se documentan integraciones con servidores de inferencia como vLLM, TGI, Ollama o llama.cpp, que ademas no estan orientados a este tipo de modelo denso de vision.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo.
- Requisito de entrada: 512x512 pixeles; la variante RiSE-9-DCT exige entrada JPEG para que la rama DCT tenga sentido.
- Almacenamiento: el repositorio completo ocupa 5,6 GB e incluye los cuatro checkpoints; conviene descargar solo el checkpoint necesario con el comando hf download indicado en la model card.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RiSE (RiSE-1/3/9/9-DCT) | DINOv3 ViT-L/16 + modulo Residual Subspace Expert; rama DCT en RiSE-9-DCT | No disponible el total; backbone ViT-L/16 del orden de ~300 M | Imagenes 512x512 | Localizacion de manipulacion en imagenes con texto | MIT (checkpoints); terminos del backbone DINOv3 por separado | Hugging Face: Jason37437/RiSE; codigo en GitHub KahimWong/RiSE |
| facebook/dinov3-vitl16-pretrain-lvd1689m | ViT-L/16 auto-supervisado | Backbone ViT-L del orden de ~300 M | No disponible | Backbone generalista de representacion visual (no realiza forense por si mismo) | No disponible | Hugging Face |
| TruFor | No disponible | No disponible | No disponible | Localizacion de manipulacion en imagen natural | No disponible | No disponible |
| CAT-Net | No disponible | No disponible | No disponible | Deteccion de manipulacion basada en artefactos de compresion | No disponible | No disponible |

Los modelos TruFor y CAT-Net se citan como referencias habituales de la literatura de localizacion de manipulaciones y aparecen en el ecosistema de evaluacion de este tipo de tareas, pero los datos concretos de parametros, contexto, licencia y disponibilidad no se han verificado en la informacion proporcionada, por lo que se marcan como no disponibles. No se dispone de comparativas cuantitativas publicadas en el material facilitado.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto, no mantiene conversaciones y no soporta tool calling ni agentes; cualquier uso como asistente es un error de planteamiento.
- Dominio de entrenamiento acotado: el entrenamiento se realiza sobre DocTamper, un corpus de manipulacion documental; el rendimiento en fotografia natural, imagenes medicas o escenas genericas no esta documentado y previsiblemente sera inferior.
- Riesgo de falsos positivos y falsos negativos: no se publican tasas de error, curvas de calibracion ni umbrales recomendados en la informacion disponible. En un flujo KYC o antifraude, la salida del modelo debe tratarse como senal de revision, no como decision automatica.
- Dependencia del formato de entrada: RiSE-9-DCT requiere entrada JPEG; alimentarlo con PNG u otros formatos invalida la rama DCT. El resto de variantes asumen imagenes de 512x512, por lo que cualquier redimensionado previo altera las senales forenses.
- Riesgo de sobreajuste al protocolo de evaluacion: los conjuntos in-domain se comprimen exactamente una vez con un factor de calidad oficial; en produccion, las imagenes pueden haber sufrido recompresiones en cadena que no se cubren en el protocolo.
- Idiomas y sesgos: el campo de idioma declarado es en y no se documentan analisis de sesgo por tipo de documento, sistema de escritura, origen geografico o calidad de escaneo.
- Validacion externa inexistente: el repositorio tiene cero descargas y cero valoraciones en el momento de redactar la ficha, y las fechas de creacion y actualizacion son atipicas (2026). Conviene tratar los pesos como material no auditado por terceros.
- Licencia: los checkpoints se publican bajo MIT, lo que permite uso comercial, pero el backbone preentrenado DINOv3 tiene sus propios terminos que se aplican por separado. Es imprescindible revisarlos antes de un despliegue comercial.
- Integridad de pesos: la model card advierte de que se deben cargar los checkpoints con el cargador estricto del repositorio y verificar los SHA-256 de checksums.json; cargar pesos no verificados con torch.load sin control es un riesgo de seguridad.
- Sin datos de hardware: no hay cifras publicadas de VRAM, latencia ni throughput, por lo que el dimensionamiento de un servicio en produccion requiere medicion propia.
- Cambio de nombre de ficheros: los ficheros publicos se han renombrado respecto a los originales, aunque los bytes de los checkpoints se conservan; hay que emparejar cada .pth con su .json de configuracion correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jason37437/RiSE
- Codigo y uso: https://github.com/KahimWong/RiSE
- Instrucciones de preparacion de datos: https://github.com/KahimWong/RiSE#-data-preparation
- Dataset asociado: https://huggingface.co/datasets/Jason37437/Doc-Protocol-Data
- Modelo base: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Checkpoints: RiSE-1.pth, RiSE-3.pth, RiSE-9.pth, RiSE-9-DCT.pth (con sus respectivos RiSE-1.json, RiSE-3.json, RiSE-9.json y RiSE-9-DCT.json)
- Hashes y tamanos: checksums.json en el repositorio de Hugging Face
- Resultados del benchmark Doc Protocol: table2.svg en el repositorio de Hugging Face
