# simon-donike/RS-SR-LTDF

## Resumen

LDSR-S2 (identificador de repositorio `simon-donike/RS-SR-LTDF`) es un modelo de super-resolución por difusión latente para imagenes multiespectrales de Sentinel-2. Desarrollado por simon-donike en el marco del proyecto OpenSR, realiza un aumento de resolución de 4x sobre las bandas R, G, B y NIR de Sentinel-2, pasando de una rejilla nativa de 10 m a una salida nominal de 2,5 m (parches de 128x128 px de entrada que se convierten en 512x512 px).

El modelo se distribuye como pesos para la librería `opensr-model` y no como un modelo de lenguaje: es un modelo de imagen a imagen (`image-to-image`) que opera exclusivamente sobre tensores de reflectancia flotante, sin gestionar georreferenciación, teselado ni costura de rasters, tareas que quedan delegadas al pipeline circundante (por ejemplo, `opensr-utils`). El checkpoint V1 (`opensr-ldsrs2_v1_0_0.ckpt`) es la version canonica y recomendada por el autor; V2 (`v2.0.0-preview`) es una vista previa de investigación que afina V1 sobre pares entre sensores del dataset SEN2NAIP v2, sin que el autor afirme que supere en calidad a V1.

Su relevancia actual es doble. Por un lado, ofrece una via abierta y con licencia MIT para investigación en super-resolución de observación de la Tierra, un campo donde la mayoria de soluciones publicadas no liberan pesos. Por otro, el propio autor insiste en una advertencia critica: la salida de 2,5 m no es una medición independiente de un sensor de 2,5 m y el detalle generado puede ser incorrecto, omitido o alucinado, por lo que cualquier estudio downstream debe validar de forma independiente la imagen reconstruida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (latent diffusion) para super-resolución, con autoencoder congelado en el ajuste de V2 y muestreadores DPM-Solver++ 2M y DDIM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (idioma declarado del repositorio; la model card solo existe en ingles) |
| Licencia | MIT |
| Formato de pesos | checkpoints de PyTorch / PyTorch Lightning (`.ckpt`) |
| Tarea (pipeline) | image-to-image |
| Entrada | Reflectancia flotante Sentinel-2 L2A, rango aproximado [0, 1], orden de bandas B04, B03, B02, B08 (R, G, B, NIR); forma `4 x H x W` o `B x 4 x H x W` |
| Salida | Cuatro bandas a `4H x 4W`, preservando la convencion de batch de la entrada |
| Factor de super-resolución | 4x (10 m a una rejilla nominal de 2,5 m) |
| Tamano del repositorio | 21,4 GB |
| Descargas / likes | 0 descargas, 3 likes |
| Fecha de creacion | 2024-01-04 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

LDSR-S2 es un modelo de difusión latente aplicado a super-resolución (de ahi la denominacion LDSR, *latent diffusion super-resolution*). Sigue el esquema habitual de esta familia: un autoencoder que comprime la imagen a un espacio latente y un proceso de difusión que genera el latente de alta resolución, del que se decodifica la salida de `4H x 4W`. En el ajuste fino que da lugar a V2, el autoencoder permanece congelado y solo se entrena el componente de difusión. El muestreo se realiza por defecto con DPM-Solver++ 2M en 3 pasos con retroproyección (*back-projection*), y existe una alternativa más lenta basada en DDIM con 100 pasos invocable mediante `--sampler ddim`.

En cuanto a los datos, el autor documenta que V2 se afina a partir de V1 sobre pares entre sensores del dataset [SEN2NAIP v2](https://huggingface.co/datasets/tacofoundation/SEN2NAIPv2), es decir, pares Sentinel-2 / NAIP que permiten aprender la relacion entre una imagen de 10 m y una referencia aérea de mayor resolución. El checkpoint EMA seleccionado corresponde a 21.000 actualizaciones del optimizador. No se especifican en la informacion disponible el numero total de tokens o parches de entrenamiento, la composicion exacta del dataset, la resolucion espacial de los pares NAIP utilizados, ni si hubo fases de RLHF o DPO (no aplicables en un modelo de imagen). Tampoco se detalla la arquitectura interna del autoencoder ni la dimensionalidad del espacio latente. El autor advierte que el etiquetado de versiones (`v2.0.0-preview`, `v2.0.0`, `v2.0.0-inference`) es historico y que las versiones de modelo, dataset y software son independientes entre si.

## Capacidades

- Super-resolución multiespectral 4x sobre las bandas B04 (rojo), B03 (verde), B02 (azul) y B08 (NIR) de Sentinel-2 L2A, con salida a una rejilla nominal de 2,5 m.
- Procesamiento por lotes: acepta tensores `4 x H x W` o `B x 4 x H x W`.
- Inferencia sobre parches: el autor indica que un parche de 128x128 px es un punto de partida practico.
- Muestreo rapido de 3 pasos con DPM-Solver++ 2M y retroproyección, y muestreo mas lento y opcional con DDIM a 100 pasos.
- Modo de ajuste fino: los checkpoints pueden usarse como inicializacion de entrenamiento con datos propios (`model.pretrained_checkpoint`, `resume_checkpoint: null` y optimizador nuevo).
- Capacidad de recuperacion de estado de entrenamiento con el checkpoint completo de V2, que conserva pesos, EMA, optimizador, scaler, bucles y callbacks para reanudar una ejecucion compatible.
- No dispone de soporte de *tool calling*, agentes, razonamiento multi-paso, vision generalista, audio ni generacion de texto: es un modelo puramente image-to-image.
- No realiza georreferenciación, teselado, costura de rasters ni gestion de mascaras de nubes o nodata; esas funciones pertenecen al pipeline externo.

## Casos de uso

- Visualizacion de observacion de la Tierra: mejora de la apariencia visual de productos Sentinel-2 para comunicacion cientifica o divulgacion, aumentando la rejilla de 10 m a 2,5 m nominales sobre parches de 128x128 px previamente calibrados a reflectancia L2A.
- Investigacion en super-resolucion: banco de pruebas reproducible y con licencia MIT para comparar estrategias de difusión latente, muestreadores (DPM-Solver++ frente a DDIM) y esquemas de retroproyección sobre la misma entrada multiespectral.
- Generacion de candidatos para estudios de deteccion de cambios: el modelo permite obtener dos reconstrucciones de la misma zona en fechas distintas y alimentar un analisis de cambios, siempre que el estudio valide la imagen frente a datos independientes.
- Preprocesado de entrada para modelos downstream de segmentacion: el aumento 4x puede utilizarse como etapa previa a clasificadores de cobertura del suelo o de delimitacion de parcelas, con la salvedad de que el detalle sintetizado puede no corresponder a estructuras reales.
- Agricultura de precision: monitorizacion de parcelas y seguimiento de campañas mediante reconstrucciones repetidas sobre la misma zona, aprovechando que el modelo trabaja con reflectancias calibradas y no con numeros digitales brutos.
- Monitorizacion de entornos urbanos e infraestructuras: al existir ejemplos de entrada etiquetados como urbanos y rurales (`example_urban.pt`, `example_rural.pt`), el modelo puede aplicarse a la mejora de escenas urbanas para tareas de inspeccion visual.
- Adaptacion a dominio propio mediante ajuste fino: partiendo del checkpoint V1 como inicializador recomendado, un equipo puede entrenar sobre su propia distribucion geografica o estacional para mitigar la variabilidad de rendimiento documentada por el autor.
- Docencia y prototipado: el flujo de instalacion (`pip install opensr-model`) y el script de ejemplo de V2 permiten montar una demostracion funcional en pocos pasos sobre GPU o CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de PSNR, SSIM, LPIPS ni de ningun otro conjunto de evaluacion para los checkpoints V1 o V2, y el propio autor indica que V2 "no ha establecido una calidad mejor o igual de forma global" en comparacion con V1, sin aportar metricas cuantitativas que respalden la afirmacion. Tampoco se documentan latencias ni tasas de rendimiento medidas.

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra oficial. El autor no publica requisitos de memoria. Como referencia no confirmada, el checkpoint V2 de inferencia ocupa aproximadamente 676 MB y el estado completo de entrenamiento aproximadamente 2,04 GB, pero el consumo en ejecucion depende de la resolucion del parche, del tamano de batch y del muestreador, y no se especifica.
- GPU recomendadas: no disponible. El unico requisito declarado es disponer de una build de PyTorch adecuada al hardware; el modelo se instancia con `device="cuda"` si hay GPU disponible y cae a `"cpu"` en caso contrario.
- Compatibilidad con GPU de consumo: no confirmada. El modelo puede ejecutarse en CPU, pero no se documenta el rendimiento ni los tiempos por parche en ese modo.
- Opciones de despliegue: la libreria oficial es `opensr-model`, instalable desde PyPI o desde el commit fijado `8e0422df71be686504570ff91a656c2698d7c2bd` para el muestreador de la vista previa de V2. La descarga de pesos se hace con `huggingface_hub` (`hf_hub_download` o `snapshot_download`). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Procesamiento geoespacial complementario: `opensr-utils` se encarga de georreferenciación, teselado y costura de rasters.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a modelos comparables de super-resolución de Sentinel-2 ni cifras que permitan situar a LDSR-S2 frente a alternativas. La unica comparacion que puede establecerse con los datos disponibles es interna, entre los dos checkpoints del propio repositorio:

| Aspecto | V1 (`opensr-ldsrs2_v1_0_0.ckpt`) | V2 (`opensr-ldsrs2_v2_0_0_preview.ckpt`) |
|---|---|---|
| Estado | Canonico, recomendado | Vista previa de investigacion |
| Entrenamiento | Checkpoint de referencia | Ajuste fino de V1 sobre SEN2NAIP v2, autoencoder congelado, EMA a 21.000 actualizaciones |
| Muestreo | Configuracion por defecto del paquete | DPM-Solver++ 2M, 3 pasos, retroproyeccion (recipe experimental) |
| Tamano del checkpoint | no disponible | ~676 MB (inferencia); ~2,04 GB el estado completo |
| Calidad | Referencia | El autor no confirma mejora global frente a V1; el muestreo rapido cambia detalle por velocidad |
| Uso recomendado | Inferencia y ajuste fino | Experimentacion; seleccion explicita mediante la revision `v2.0.0-preview` |

## Limitaciones y advertencias

- Riesgo de alucinacion explicito: el autor advierte que el detalle generado puede ser incorrecto, omitido o inventado. La salida no debe tratarse como una medicion real.
- La rejilla de 2,5 m no es una medicion independiente de un sensor de 2,5 m. La consistencia de la retroproyección no demuestra que las estructuras finas reconstruidas sean reales.
- Variabilidad de rendimiento segun geografia, tipo de cobertura del suelo, estacion del año y condiciones de adquisicion. Un ajuste validado en una region no garantiza resultados equivalentes en otra.
- Entrada estricta: se requiere reflectancia calibrada de Sentinel-2 L2A en orden B04, B03, B02, B08. Pasar numeros digitales brutos sin su escalado y offsets apropiados produce resultados no validos.
- Las mascaras de nubes y de nodata deben gestionarse antes de la inferencia; el modelo no las procesa.
- El modelo opera sobre tensores: no realiza georreferenciación, teselado ni costura, por lo que su uso en produccion exige un pipeline geoespacial adicional.
- V2 es una vista previa de investigacion, seleccionable solo de forma explicita. El autor indica que no ha demostrado una calidad mejor o igual a V1 de forma global, y que su muestreador rapido de 3 pasos cambia detalle por velocidad en lugar de mejorar la calidad.
- El checkpoint completo de V2 no es un paquete portable de reanudacion y no lo acepta el cargador de inferencia publico, aunque si es valido para recuperar el estado de entrenamiento con una configuracion compatible.
- La model card escribe "Repeated sampling measures" sin completar la frase, por lo que no puede extraerse ninguna conclusion de ese parrafo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia del modelo no exime de las obligaciones derivadas del uso de datos de Sentinel-2 o de los terminos de las fuentes de entrenamiento.
- Repositorio con 0 descargas y 3 likes en la fecha de consulta: no existe una comunidad amplia de validacion independiente que respalde el comportamiento del modelo en produccion.
- Idiomas soportados: solo ingles en la documentacion. No hay traduccion de la model card ni soporte declarado para otros idiomas.
- No se documentan sesgos especificos, pero la variabilidad geografica y estacional reportada actua de facto como un sesgo de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simon-donike/RS-SR-LTDF
- Repositorio OpenSR (`opensr-model`): https://github.com/ESAOpenSR/opensr-model
- Utilidades geoespaciales OpenSR (`opensr-utils`): https://github.com/ESAOpenSR/opensr-utils
- Dataset de ajuste fino SEN2NAIP v2: https://huggingface.co/datasets/tacofoundation/SEN2NAIPv2
- Guia de inferencia local de OpenSR: https://github.com/ESAOpenSR/opensr-model#2-%EF%B8%8F-install-and-usage---local
- Guia de entrenamiento de OpenSR: https://github.com/ESAOpenSR/opensr-model/blob/main/docs/training.md
- Commit fijado para el muestreador de la vista previa V2: https://github.com/ESAOpenSR/opensr-model/commit/8e0422df71be686504570ff91a656c2698d7c2bd
- Archivos de la revisión `v2.0.0-preview` (configuracion, ejemplo, procedencia y sumas de verificacion): `v2.0.0/inference.yaml`, `v2.0.0/example.py`, `v2.0.0/provenance.json`, `v2.0.0/SHA256SUMS`, `v2.0.0/TRAINING.md` dentro del repositorio de HuggingFace
- Entradas de ejemplo incluidas en el repositorio: `example_rural.pt`, `example_urban.pt`
