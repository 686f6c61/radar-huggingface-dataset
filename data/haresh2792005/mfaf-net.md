# haresh2792005/MFAF-Net

## Resumen

MFAF-Net (Multimodal Facial Analysis and Feature-guided Network) es un framework computacional publicado en Hugging Face por el usuario haresh2792005 que simula y predice resultados de procedimientos de cirugia estetica facial. A diferencia de los modelos generativos habituales, no se trata de un modelo de difusion ni de una red neuronal entrenada con pesos publicados: es un pipeline de cinco modulos que combina extraccion de puntos faciales con MediaPipe FaceMesh, analisis de metadatos del paciente y un motor de deformacion geometrica (warp de Delaunay) para renderizar una aproximacion postoperatoria sobre la fotografia original.

El sistema se presenta como una prueba de concepto para integrar datos multimodales del paciente con vision por computador aplicada a la prediccion de resultados quirurgicos. Cubre seis procedimientos: rinoplastia, blefaroplastia, ritidectomia, genioplastia, cirugia de frente y elevacion de cejas. La representacion multimodal fusiona 468 puntos faciales con un vector de 12 dimensiones derivado de la informacion demografica del paciente.

Es relevante como ejemplo de enfoque interpretable y reproducible frente a los sistemas generativos opacos: no depende de IA generativa externa ni de modelos de difusion entrenados, lo que facilita la trazabilidad clinica y academica. No obstante, el repositorio tiene 0 descargas, 0 likes y un tamano de 0.0 GB, lo que sugiere que no contiene pesos publicados ni artefactos de modelo descargables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de 5 modulos: extraccion de caracteristicas faciales (MediaPipe FaceMesh), analisis de informacion del paciente, fusion con atencion especifica por procedimiento, simulacion geometrica (warp de Delaunay) y comparacion cuantitativa |
| Parametros totales | no disponible (no se publican pesos ni recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizables) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos; es codigo Python con dependencias de MediaPipe, OpenCV, NumPy, scikit-image, Matplotlib, Pillow y Flask) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline modular de cinco etapas, no un transformer ni una red neuronal profunda con pesos entrenados publicados. El modulo 1 extrae 468 landmarks faciales y mediciones regionales mediante MediaPipe FaceMesh. El modulo 2 construye un vector de caracteristicas de 12 dimensiones a partir de metadatos del paciente (edad, sexo, tipo de piel y datos de prescripcion). El modulo 3 fusiona ambas representaciones aplicando atencion especifica por procedimiento, que pondera las regiones anatomicas relevantes para cada intervencion. El modulo 4 realiza la simulacion mediante deformacion geometrica de Delaunay sobre la imagen original, y el modulo 5 calcula metricas de comparacion (SSIM, PSNR, MAE) entre la imagen original y la simulada.

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO. El propio autor describe el sistema como "deep-learning-inspired" y aclara que no emplea IA generativa externa ni modelos de difusion entrenados. La innovacion tecnica declarada es la fusion multimodal con atencion guiada por procedimiento combinada con un motor de warp geometrico interpretable, orientado a reproducibilidad y comunicacion clinica.

## Capacidades

- Extraccion de 468 landmarks faciales y mediciones regionales mediante MediaPipe FaceMesh.
- Fusion multimodal de caracteristicas visuales con metadatos del paciente (vector de 12 dimensiones).
- Atencion especifica por procedimiento para ponderar regiones anatomicas relevantes.
- Simulacion de seis procedimientos: rinoplastia, blefaroplastia, ritidectomia, genioplastia, cirugia de frente y elevacion de cejas.
- Renderizado de aproximacion postoperatoria mediante warp geometrico de Delaunay sobre la fotografia original.
- Comparacion cuantitativa de resultados mediante SSIM, PSNR y MAE.
- Interfaz web de dashboard construida con Flask, HTML, CSS y JavaScript.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), vision generativa, audio ni capacidades agenticas multi-paso.
- Capacidades multilingues: no disponibles (la interfaz y la documentacion estan en ingles).

## Casos de uso

- Comunicacion clinica preoperatoria: el cirujano puede generar una aproximacion visual del resultado esperado sobre la fotografia del paciente para alinear expectativas antes de la intervencion, apoyandose en el warp geometrico interpretable.
- Investigacion academica en prediccion de resultados quirurgicos: el pipeline es reproducible y sus modulos estan separados, lo que permite aislar y evaluar cada etapa (extraccion, fusion, simulacion) en estudios comparativos.
- Formacion de residentes de cirugia estetica: el dashboard permite experimentar con distintos procedimientos y parametros demograficos para comprender el efecto geometrico de cada intervencion sobre los landmarks faciales.
- Evaluacion cuantitativa de tecnicas de simulacion: las metricas SSIM, PSNR y MAE del modulo 5 permiten comparar la fidelidad de distintas aproximaciones geometricas frente a fotografias reales postoperatorias.
- Prototipado rapido de herramientas de analisis facial: el codigo Python con MediaPipe y OpenCV sirve como base para construir aplicaciones de analisis facial que requieran landmarks y mediciones regionales.
- Demostracion docente de pipelines multimodales: el sistema ilustra de forma completa la fusion de caracteristicas visuales y tabulares con atencion guiada, sin necesidad de infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el pipeline se ejecuta en CPU con MediaPipe y OpenCV, sin pesos de red neuronal que cargar en GPU.
- GPU recomendadas: no se requiere GPU. El sistema esta disenado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: si, cualquier equipo con Python 3.8+ puede ejecutarlo; no necesita GPU dedicada.
- Opciones de despliegue: ejecucion local mediante `python run.py` con Flask en `http://localhost:5000`; tambien puede integrarse como libreria Python en otros pipelines.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MFAF-Net | Pipeline geometrico con landmarks | no disponible | no aplica | MIT | Codigo en Hugging Face, sin pesos |
| Modelos de difusion para edicion facial (p. ej. InstructPix2Pix) | Difusion generativa | no disponible en esta ficha | no aplica | variable | Pesos publicos en Hugging Face |
| GANs de simulacion facial quirurgica | GAN condicional | no disponible en esta ficha | no aplica | variable | Publicaciones academicas, disponibilidad variable |
| MediaPipe FaceMesh (componente base) | Malla facial | no disponible | no aplica | Apache 2.0 | Disponible en Google MediaPipe |

La comparativa es orientativa: MFAF-Net no compite en la misma categoria que los modelos generativos, ya que no produce imagenes mediante sintesis neuronal sino mediante deformacion geometrica controlada. Su ventaja es la interpretabilidad y la ausencia de dependencia de pesos entrenados; su limitacion es la fidelidad visual frente a enfoques generativos.

## Limitaciones y advertencias

- No se publican pesos ni artefactos de modelo: el repositorio tiene 0.0 GB y 0 descargas, por lo que no es posible verificar ni reproducir resultados sin ejecutar el codigo fuente.
- El autor describe el sistema como "deep-learning-inspired" y aclara que no emplea IA generativa ni difusion; la calidad de la simulacion depende del warp geometrico, no de sintesis aprendida.
- Riesgo de expectativas clinicas irreales: una simulacion geometrica no captura cambios de textura, cicatrizacion, iluminacion ni variabilidad biologica real.
- No debe usarse como herramienta de diagnostico ni como sustituto del criterio medico; es una prueba de concepto para comunicacion e investigacion.
- Sesgos potenciales derivados de los metadatos del paciente (edad, sexo, tipo de piel) y de la cobertura de MediaPipe FaceMesh en distintas etnias y condiciones de iluminacion.
- Limitaciones de idioma: la interfaz y documentacion estan solo en ingles.
- La licencia MIT permite uso comercial, pero la ausencia de validacion clinica desaconseja su despliegue en produccion sanitaria sin evaluacion adicional.
- Dependencia de versiones concretas de MediaPipe, OpenCV y Flask, lo que puede afectar a la reproducibilidad a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/haresh2792005/MFAF-Net
- MediaPipe FaceMesh: https://google.github.io/mediapipe/solutions/face_mesh.html
- OpenCV: https://opencv.org/
- Flask: https://flask.palletsprojects.com/
- scikit-image (metricas SSIM/PSNR): https://scikit-image.org/
