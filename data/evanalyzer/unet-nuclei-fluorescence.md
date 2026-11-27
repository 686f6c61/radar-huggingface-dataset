# evanalyzer/unet-nuclei-fluorescence

## Resumen

`evanalyzer/unet-nuclei-fluorescence` es una conversion a formato safetensors del modelo **NucleiSegmentationBoundaryModel** desarrollado por Constantin Pape (EMBL Heidelberg) y publicado originalmente en bioimage.io con el identificador `affable-shark`. Se trata de una U-Net 2D entrenada para segmentar nucleos celulares en imagenes de microscopia de fluorescencia, principalmente con tincion DAPI. Para cada pixel predice dos canales: probabilidad de nucleo (foreground) y probabilidad de borde de nucleo, lo que permite separar nucleos que se tocan.

El modelo resuelve un problema clasico en bioimagen: la segmentacion de instancias en imagenes de microscopia, donde los nucleos aparecen agrupados y es necesario distinguir objetos individuales. La innovacion de este repositorio concreto no es el modelo en si, sino el empaquetado: los pesos originales de PyTorch se han convertido a safetensors sin reentrenar ni modificar, con metadatos de arquitectura embebidos, para que puedan cargarse desde herramientas que no dependen de Python ni de PyTorch, como la implementacion en Rust de EVAnalyzer.

La relevancia actual radica en la portabilidad: al almacenar los pesos en un formato estandar con metadatos de configuracion (`evanalyzer_arch`, `config`, `preprocessing`), el modelo puede integrarse en pipelines de analisis de imagen en produccion sin necesidad de un stack de deep learning completo. El repositorio ocupa aproximadamente 0,1 GB y los pesos son de ~116 MB en f32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2D (torch-em `UNet2d`), encoder-decoder convolucional con conexiones skip |
| Parametros totales | no disponible (46 tensores, fichero de ~116 MB en f32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 2D de H x W multiplos de 16, minimo 64) |
| Tipos de cuantizacion | f32 unicamente (pesos en safetensors f32) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (extension `.evanet`, renombrable a `.safetensors`) |

Parametros de arquitectura adicionales: `in_channels=1`, `out_channels=2` (foreground y boundaries), `depth=4`, `initial_features=64`, `gain=2`, normalizacion InstanceNorm, activacion final Sigmoid.

## Arquitectura y entrenamiento

La red es una U-Net 2D clasica implementada en torch-em (`UNet2d`), con cuatro niveles de profundidad, 64 caracteristicas iniciales y factor de crecimiento `gain=2`. Recibe una imagen de un solo canal y produce dos mapas de probabilidad (nucleo y borde) tras una activacion Sigmoid. La normalizacion es InstanceNorm, el valor por defecto de torch-em. El preprocesado requerido es normalizacion zero-mean unit-variance por imagen: `(x - mean) / (std + 1e-6)` calculada sobre todos los pixeles.

Segun la documentacion original, el modelo se entreno con torch-em sobre los nucleos del 2018 Data Science Bowl (BBBC038): 447 imagenes de entrenamiento y 50 de validacion, con funcion de perdida Dice, optimizador Adam, tasa de aprendizaje 1e-4 y 1458 epocas. No se ha realizado ningun reentrenamiento ni fine-tuning en esta conversion; los pesos son identicos a los originales. La conversion verifica la equivalencia numerica: al ejecutar el fichero convertido sobre `test_input_0.npy` (256 x 256) frente a `test_output_0.npy` del paquete bioimage.io, la diferencia maxima es de 2,6 x 10^-6 y ningun pixel cambia de lado respecto al umbral 0,5.

## Capacidades

- Segmentacion semantica de nucleos en imagenes de microscopia de fluorescencia (DAPI y tinciones similares).
- Prediccion de mapas de probabilidad de foreground (nucleo) y de borde de nucleo en dos canales independientes.
- Separacion de nucleos en contacto mediante el canal de bordes, combinable con watershed, multicut o etiquetado de componentes conexas.
- Entrada de un unico canal en escala de grises; requiere dimensiones H y W multiplos de 16 y minimo 64.
- Salida con valores en [0, 1] por pixel y canal.
- Carga directa desde safetensors en cualquier herramienta compatible, incluida la implementacion en Rust de EVAnalyzer sin Python ni PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, vision general, audio ni capacidades multilingues: es un modelo puramente de segmentacion de imagen.

## Casos de uso

- **Analisis de imagenes de microscopia en pipelines de investigacion**: el modelo genera mapas de nucleo y borde que, tras postprocesado con watershed o multicut, permiten contar y medir nucleos individuales en experimentos de biologia celular. Es adecuado por su entrenamiento especifico en el dataset del Data Science Bowl, representativo de variabilidad en tinciones y condiciones de imagen.
- **Integracion en herramientas nativas sin Python**: al ser safetensors plano con metadatos de arquitectura, puede cargarse desde aplicaciones en Rust (como EVAnalyzer) u otros lenguajes, evitando desplegar un stack de PyTorch en entornos de escritorio o servidores ligeros.
- **Automatizacion de cuantificacion celular en laboratorio**: conteo de nucleos por campo, calculo de densidad celular o area nuclear media en placas de cultivo, usando el canal foreground con umbral 0,5 y el canal de bordes para separar agregados.
- **Preprocesado para clasificacion o fenotipado posterior**: la segmentacion sirve como paso previo para extraer regiones de interes que alimenten clasificadores de estado celular, analisis de morfologia o mediciones de intensidad por nucleo.
- **Control de calidad en experimentos de imagen**: deteccion de campos con baja densidad nuclear, artefactos de tincion o imagenes fuera de foco mediante la distribucion de probabilidades del canal foreground.
- **Reproducibilidad de resultados publicados**: al mantener los pesos originales de bioimage.io `affable-shark` con verificacion numerica documentada, permite reproducir resultados de pipelines que ya usaban el modelo original en formato PyTorch.
- **Prototipado rapido en entornos con recursos limitados**: el fichero de ~116 MB en f32 y la arquitectura U-Net 2D de profundidad 4 permiten inferencia en CPU o GPU de gama media sin requisitos de memoria elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica documentada es la verificacion de equivalencia tras la conversion: diferencia maxima de 2,6 x 10^-6 frente a la salida esperada del paquete bioimage.io sobre `test_input_0.npy` (256 x 256), sin cambios de clasificacion en el umbral 0,5.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con pesos f32 de ~116 MB, el modelo cabe holgadamente en GPUs de consumo, y la memoria dominante sera la de las activaciones, proporcional al area de la imagen de entrada.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; modelos como RTX 3060, RTX 4090, A100 o H100 son mas que suficientes. No se especifican requisitos minimos oficiales.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna e incluso en CPU para imagenes de tamano moderado.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y `torch_em.model.UNet2d` en Python; implementacion nativa en Rust de EVAnalyzer; cualquier herramienta que lea safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada/salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `evanalyzer/unet-nuclei-fluorescence` (este) | U-Net 2D, depth 4, 64 features | 1 canal / 2 canales (nucleo, borde) | CC-BY-4.0 | safetensors | Conversion verificada del modelo bioimage.io `affable-shark` |
| bioimage.io `affable-shark` (original) | U-Net 2D (torch-em) | 1 canal / 2 canales | CC-BY-4.0 | PyTorch state dict | Pesos identicos; requiere PyTorch y torch-em |
| Cellpose (modelos de segmentacion de nucleos) | Arquitectura propia (U-Net con flujo) | Imagen / mascaras y flujos | Licencia propia de Cellpose (no disponible en esta informacion) | PyTorch | No se dispone de datos comparativos en la informacion proporcionada |
| StarDist (modelos 2D de nucleos) | U-Net con prediccion de poligonos | Imagen / estrellas convexas | Licencia propia de StarDist (no disponible en esta informacion) | Keras/TensorFlow, PyTorch | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo entrenado especificamente para nucleos en microscopia de fluorescencia (principalmente DAPI); su rendimiento fuera de ese dominio (microscopia de campo claro, tejidos con tinciones distintas, otras modalidades) no esta garantizado.
- Requiere preprocesado estricto: normalizacion zero-mean unit-variance por imagen y dimensiones multiplos de 16 (minimo 64). Un preprocesado incorrecto degrada las predicciones.
- La salida son mapas de probabilidad, no instancias segmentadas; es necesario un postprocesado (watershed, multicut o etiquetado de componentes conexas) para obtener nucleos individuales.
- Riesgo de falsos positivos y negativos en imagenes con ruido, desenfoque, saturacion o densidades nucleares muy altas; no se documentan metricas de robustez fuera del conjunto de validacion original.
- Sesgos potenciales derivados del dataset de entrenamiento (2018 Data Science Bowl, 447 imagenes), que puede no representar todas las especies, tejidos o protocolos de tincion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a Constantin Pape y al proyecto bioimage.io; es obligatorio citar la obra original.
- El repositorio no esta afiliado ni respaldado por el autor original ni por la comunidad bioimage.io; la responsabilidad de la conversion recae en `evanalyzer`.
- Solo se distribuyen pesos en f32; no hay versiones cuantizadas oficiales, lo que puede limitar el despliegue en entornos con restricciones estrictas de memoria.
- El fichero usa la extension `.evanet`; algunas herramientas pueden requerir renombrarlo a `.safetensors`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/evanalyzer/unet-nuclei-fluorescence
- Modelo original en bioimage.io (`affable-shark`): https://bioimage.io/#/?id=affable-shark
- EVAnalyzer (repositorio): https://github.com/evanalyzer/evanalyzer
- torch-em (libreria de entrenamiento): https://github.com/constantinpape/torch-em
- Experimentos torch-em para el Data Science Bowl: https://github.com/constantinpape/torch-em/tree/main/experiments/dsb
- safetensors: https://github.com/huggingface/safetensors
- Paper U-Net (Ronneberger, Fischer, Brox, 2015): https://doi.org/10.1007/978-3-319-24574-4_28
- Paper 2018 Data Science Bowl (Caicedo et al., 2019): https://doi.org/10.1038/s41592-019-0612-7
- torch-em en Zenodo: https://doi.org/10.5281/zenodo.5108853
- Modelo en Zenodo: https://doi.org/10.5281/zenodo.5764892
