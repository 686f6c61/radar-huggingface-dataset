# elnemer7/ElNeMeR-Image-Deepfake-Diffusion-ONNX

## Resumen

ElNeMeR-Image-Deepfake-Diffusion-ONNX es un clasificador de imagenes orientado a forense digital, desarrollado por Eng. Mahmoud ElNemer bajo el sello ElNeMeR Digital Solutions & AI. Su funcion es distinguir fotografias autenticas de camara (incluso tras compresion tipo WhatsApp) frente a imagenes sinteticas generadas por modelos de difusion como Midjourney, FLUX o DALL-E, deepfakes de tipo face-swap basados en GAN y composites manipulados mediante inpainting. El modelo se distribuye en formato ONNX con licencia MIT y pipeline de `image-classification`.

La propuesta tecnica se apoya en un vector de 24 caracteristicas de analisis forense de imagen: propiedades opticas, aberracion cromatica, transformada 2D-FFT, residuos de sensor PRNU y metricas ELA por cuadrantes. Sobre ese vector opera un clasificador neuronal de cuatro clases. No se trata de un modelo generativo ni de un transformer de lenguaje, sino de un discriminador especializado de imagenes.

La relevancia actual radica en la explosion de contenido sintetico y en la necesidad de herramientas ligeras y desplegables en produccion para verificacion de autenticidad. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos pueden no estar publicados o que el paquete es de tamano minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador neuronal sobre vector de 24 caracteristicas forenses (opticas, aberracion cromatica, 2D-FFT, PRNU, ELA por cuadrantes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada | Imagen (preprocesada a 24 caracteristicas forenses) |
| Salida | Probabilidades sobre 4 clases |
| Clases | 0: AUTHENTIC_CAMERA_PHOTO; 1: DIFFUSION_AI_GENERATED; 2: FACESWAP_GAN_DEEPFAKE; 3: COMPOSITE_INPAINT_EDITED |
| Libreria | onnx |
| Pipeline | image-classification |
| Tamano del repo | 0.0 GB (segun Hugging Face) |

## Arquitectura y entrenamiento

La model card describe una arquitectura de clasificacion neuronal que opera sobre un vector de 24 caracteristicas extraidas de la imagen de entrada. Estas caracteristicas combinan senales forenses clasicas: propiedades opticas de la lente, patrones de aberracion cromatica, analisis espectral mediante 2D-FFT, residuos de ruido de sensor PRNU (Photo Response Non-Uniformity) y analisis ELA (Error Level Analysis) desglosado por cuadrantes. El clasificador esta calibrado especificamente para separar fotografias reales de camara (incluso con recompresion agresiva tipo WhatsApp) de sintesis por difusion, face-swaps GAN y composites editados por inpainting.

No se especifican en la informacion disponible el numero de parametros del clasificador, el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de aumento de datos o calibracion adicional. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, dado que no es un modelo de lenguaje. La exportacion a ONNX facilita el despliegue en entornos de inferencia heterogeneos (CPU, GPU, edge) mediante ONNX Runtime.

## Capacidades

- Clasificacion de imagenes en cuatro categorias forenses: foto autentica, generacion por difusion, deepfake face-swap GAN y composite editado.
- Deteccion de sintesis de modelos de difusion concretos mencionados: Midjourney, FLUX y DALL-E.
- Robustez declarada frente a compresion tipo WhatsApp en fotografias autenticas.
- Analisis de artefactos forenses: aberracion cromatica, 2D-FFT, PRNU y ELA por cuadrantes.
- Deteccion de manipulaciones por inpainting y composites.
- Inferencia via ONNX Runtime, apta para CPU y GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la clasificacion de imagen.

## Casos de uso

- Verificacion de autenticidad en medios de comunicacion: un redactor o fact-checker pasa una imagen sospechosa por el clasificador ONNX para obtener una probabilidad de que sea sintetica o manipulada antes de publicarla.
- Moderacion de contenido en plataformas: integracion en pipelines de subida de imagenes para marcar posibles deepfakes face-swap o composites editados y derivarlos a revision humana.
- Forense digital en investigacion: apoyo a peritos que necesitan una primera senal automatica sobre si una prueba fotografica presenta residuos compatibles con generacion por difusion o edicion por inpainting.
- Verificacion de identidad documental: comprobacion de que la fotografia adjunta a un documento no es un face-swap GAN, como capa adicional en procesos KYC.
- Analisis de imagenes recibidas por mensajeria: el modelo declara calibracion para fotos reales tras compresion tipo WhatsApp, lo que permite usarlo sobre material reenviado en canales de mensajeria.
- Automatizacion de triaje en aseguradoras o reclamaciones: clasificacion previa de imagenes aportadas como evidencia para detectar composites o sintesis antes de la validacion manual.
- Despliegue en entornos con recursos limitados: al ser ONNX y de repo minimo, puede ejecutarse en CPU o en dispositivos edge dentro de servicios de verificacion de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repo figura como 0.0 GB y no se detalla el tamano del grafo ONNX.
- GPU recomendadas: no disponible; al ser un clasificador sobre 24 caracteristicas, es previsible que funcione en CPU, pero no se confirma en la informacion.
- Compatibilidad con GPU de consumo: no confirmada; por la naturaleza del modelo (clasificador ligero sobre vector de caracteristicas) es plausible en RTX 4090 y gamas inferiores, pero no hay dato oficial.
- Opciones de despliegue: ONNX Runtime (CPU/GPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Clases | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ElNeMeR-Image-Deepfake-Diffusion-ONNX | Clasificador forense de imagen | 24 caracteristicas (opticas, FFT, PRNU, ELA) | 4 | MIT | ONNX | Hugging Face (0 descargas) |
| Detectores deepfake basados en CNN (genericos) | Clasificador de imagen | Red convolucional extremo a extremo | Variable | Variable | PyTorch/ONNX | Multiples en Hugging Face |
| Detectores de imagenes IA tipo CLIP-based | Clasificador multimodal | Embeddings CLIP + cabeza de clasificacion | Variable | Variable | PyTorch | Multiples en Hugging Face |
| Herramientas forenses clasicas (ELA, PRNU) | Analisis no neuronal | Reglas y metricas estadisticas | No aplica | Variable | Scripts | Diversas |

No se dispone de datos de rendimiento comparativo publicados para este modelo, por lo que la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- No se han publicado benchmarks ni metricas de precision, recall o AUC; la eficacia real del clasificador no esta verificada de forma independiente.
- El repositorio registra 0 descargas y 0 likes, y el tamano aparece como 0.0 GB; existe riesgo de que los pesos no esten efectivamente publicados o de que el paquete este incompleto.
- El modelo se calibra contra generadores concretos (Midjourney, FLUX, DALL-E); puede degradarse frente a modelos de difusion mas recientes o no contemplados.
- La deteccion de face-swap se limita a la categoria GAN declarada; no se especifica cobertura de face-swaps basados en difusion.
- Riesgo de falsos positivos en fotografias reales con postprocesado intenso, recortes o recompresiones distintas de las contempladas.
- No se documentan sesgos por demografia, tipo de camara, iluminacion o resolucion; podrian existir diferencias de rendimiento no reportadas.
- Licencia MIT permite uso comercial, pero no se ofrece garantia ni soporte oficial; el autor no detalla limitaciones de responsabilidad.
- No procesa texto ni audio; su uso esta restringido a clasificacion de imagenes.
- La model card incluye sellos y enlaces corporativos; conviene tratar las afirmaciones de robustez como no validadas hasta disponer de evaluacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Image-Deepfake-Diffusion-ONNX
- Plataforma en vivo: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
