# InsightUX/capstone_testing_folder

## Resumen

InsightUX/capstone_testing_folder no es un modelo de lenguaje, sino un paquete de aplicacion de escritorio para Windows orientado a la investigacion de experiencia de usuario mediante eye-tracking. Lo publica el usuario InsightUX en Hugging Face bajo licencia MIT y contiene el codigo fuente completo de una aplicacion, herramientas de evaluacion guiada, pruebas automatizadas, un modelo de mirada en formato ONNX (models/gaze_cnn_v4.onnx) con sus datos externos y un checkpoint de calibracion (checkpoints/best_model_v4.pt). El repositorio ocupa aproximadamente 0,1 GB.

El componente de aprendizaje automatico es una red neuronal convolucional (CNN) para estimacion de la mirada, exportada a ONNX, que se usa junto con la webcam del equipo para calibrar y validar la posicion de la mirada del usuario. La aplicacion incluye ademas un modo de evaluacion guiada con 16 comprobaciones, incluida una calibracion nueva y una validacion de nueve objetivos, asi como pruebas unitarias y de integracion ejecutables con pytest.

Es relevante como ejemplo de proyecto final (capstone) reproducible de investigacion UX: empaqueta el pipeline completo de captura, calibracion, medida y generacion de informes (REPORT_TABLES.html y CSV de las tablas 5.1 a 5.5). No debe confundirse con un modelo generativo: no hay pesos de transformer, tokenizador ni pipeline de inferencia de texto publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN para estimacion de mirada (gaze_cnn_v4), exportada a ONNX; aplicacion de escritorio en Python con interfaz Tk/WebView2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y checkpoint PyTorch .pt) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (models/gaze_cnn_v4.onnx con datos externos) y checkpoint PyTorch (checkpoints/best_model_v4.pt) |

## Arquitectura y entrenamiento

La informacion disponible indica que el componente de vision es una CNN de estimacion de mirada (gaze_cnn_v4) exportada a ONNX, acompanada de un checkpoint de entrenamiento en PyTorch (best_model_v4.pt). No se detallan la profundidad de la red, el numero de capas, el tamano de las imagenes de entrada, el numero de parametros ni el dataset de entrenamiento empleado. Tampoco se especifican tecnicas de aumento de datos, funcion de perdida ni metrica de error angular de la mirada.

La parte de aplicacion es un programa de escritorio para Windows que requiere Python 3.11 con soporte de Tcl/Tk y Microsoft Edge WebView2 Runtime, e integra Playwright con Chromium para comprobaciones de interfaz. El paquete incluye pruebas de regresion con pytest y un manifiesto (UPLOAD_MANIFEST.json) que registra tamanos y hashes SHA-256 de los ficheros. El modo Drishti AI es opcional y depende de servicios remotos configurados mediante GEMINI_API_KEY o de un proxy autorizado con DRISHTI_PROXY_URL y DRISHTI_APP_SECRET; no se incluyen credenciales.

## Capacidades

- Estimacion de la mirada mediante webcam a partir de un modelo ONNX (gaze_cnn_v4) y un checkpoint de calibracion.
- Calibracion del usuario y validacion con nueve objetivos dentro del flujo de evaluacion guiada.
- Evaluacion guiada con 16 comprobaciones, incluidas comprobaciones de tiempo y de recursos que confirman la recogida de datos, sin imponer limites de velocidad ni de RAM.
- Ejecucion de comprobaciones seguras (TC12/13): cinco pruebas unitarias y una de integracion.
- Grabacion de sesiones de navegacion normales de al menos 30 segundos y parada controlada.
- Gestion de participantes y de personas dentro de la aplicacion, con calibracion y grabaciones separadas y excluidas de la evaluacion por perfil.
- Generacion de informes: REPORT_TABLES.html, CSV de las tablas 5.1 a 5.5 y carpeta _evidence/ por cada carpeta de resultados.
- Pruebas automatizadas con pytest, incluidas comprobaciones opcionales de interfaz en navegador (variable INSIGHTUX_RUN_UI_CHECKS=1).
- Integracion opcional con servicios remotos de IA (Drishti AI) mediante clave de API o proxy autorizado.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni agentes.

## Casos de uso

- Investigacion de usabilidad con eye-tracking: el paquete permite montar un entorno de estudio en un portatil Windows, calibrar la mirada del participante y registrar sesiones de navegacion para analizar patrones de atencion visual.
- Validacion de calibracion en laboratorio: el flujo guiado exige una calibracion nueva y una validacion de nueve objetivos, lo que facilita comprobar la precision del modelo de mirada antes de cada sesion.
- Docencia y proyectos finales: al incluir codigo fuente, plan de pruebas (TEST_PLAN.html) e informes generados, sirve como material reproducible para asignaturas de interaccion persona-ordenador o vision por computador.
- Pruebas de regresion de una aplicacion de captura: pytest y las comprobaciones TC12/13 permiten verificar que la recogida de datos y la integracion funcionan tras cambios en el codigo.
- Auditoria de resultados: los CSV de las tablas 5.1 a 5.5 y la carpeta _evidence/ permiten reconstruir y revisar las mediciones de cada sesion.
- Evaluacion comparativa de interfaces web: la grabacion de sesiones de navegacion de al menos 30 segundos con Playwright y Chromium permite estudiar la atencion del usuario sobre paginas reales.
- Prototipado de asistentes con analisis de mirada: la integracion opcional con Drishti AI mediante GEMINI_API_KEY o proxy permite anadir analisis remoto sobre las capturas, siempre que se configuren las credenciales localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye error angular de la mirada, precision por objetivo, latencia de inferencia ni throughput del modelo ONNX.

## Requisitos de hardware

- Entorno de ejecucion: portatil o equipo con Windows, Python 3.11 con Tcl/Tk y Microsoft Edge WebView2 Runtime; se requiere webcam con acceso habilitado.
- VRAM estimada: no disponible; el modelo ONNX de mirada es un componente auxiliar y el repositorio completo ocupa unos 0,1 GB, por lo que no se anticipa una carga significativa de memoria de GPU, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponibles; la model card no especifica aceleracion por GPU ni versiones de CUDA, ROCm o DirectML.
- Compatibilidad con GPU de consumo: no confirmada; el diseno parece orientado a ejecucion en CPU dentro de una aplicacion de escritorio.
- Despliegue: aplicacion nativa de Windows lanzada con START_GUIDED_TESTING.cmd; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Almacenamiento: el paquete incluye el modelo ONNX con datos externos y el checkpoint .pt; los entornos virtuales, artefactos de compilacion y datos de sesion se excluyen del repositorio.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de estimacion de mirada ni proyectos de investigacion UX con caracteristicas equivalentes, y no se dispone de datos de rendimiento para establecer una comparacion fundamentada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni agentes; cualquier uso en ese sentido queda fuera de su proposito.
- Solo Windows: la instalacion documentada depende de Python 3.11 con Tcl/Tk y de Microsoft Edge WebView2 Runtime, y no se describe soporte para Linux ni macOS.
- No se deben copiar entornos virtuales entre equipos; hay que crear uno nuevo con los comandos indicados.
- Hay que descargar los ficheros reales del modelo y no los punteros de Git LFS, o la aplicacion no dispondra de los pesos ONNX.
- Las rutas temporales largas de Windows pueden afectar a algunas pruebas.
- La prueba de comparacion de copias del codigo fuente requiere una carpeta de referencia separada y se omite si no esta disponible.
- Las mediciones guiadas y los informes de pytest son independientes: ejecutar pytest no realiza un estudio real de mirada.
- Los servicios remotos opcionales (Drishti AI) requieren credenciales que no se incluyen; los servicios no disponibles deben marcarse como Blocked en la guia.
- No se incluyen cuentas locales, sesiones ni calibraciones previas; los datos nuevos se generan en testing/data/.
- Riesgo de sesgo y de alucinacion: no aplica al componente de vision en el sentido habitual, pero no se documentan sesgos demograficos del modelo de mirada ni su precision en distintos tonos de piel, gafas o condiciones de iluminacion, lo que es un caveat relevante para produccion.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright y revisar las licencias de las dependencias de terceros (Playwright, Chromium, WebView2).
- El modelo no debe usarse para vigilancia ni para inferir estados cognitivos o emocionales sin consentimiento informado y sin revision etica, dado el caracter sensible de los datos de seguimiento ocular.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/InsightUX/capstone_testing_folder
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
