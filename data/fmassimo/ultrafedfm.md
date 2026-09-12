# fmassimo/UltraFedFM

## Resumen

UltraFedFM es un modelo fundacional para imagen de ecografía (ultrasound) preentrenado de forma autosupervisada mediante un autoencoder enmascarado (MAE) y con un esquema de aprendizaje federado en el que participaron 16 instituciones sin compartir datos brutos entre ellas. El resultado es un encoder de representaciones visuales entrenado sobre aproximadamente 1 millón de imágenes que cubren 19 órganos y 10 modalidades ecográficas, pensado para servir como punto de partida en tareas posteriores de diagnóstico y segmentación.

La ficha corresponde al repositorio `fmassimo/UltraFedFM` de HuggingFace, que es un espejo no oficial y sin modificaciones del modelo original. El código y los pesos originales los publican los autores en el repositorio `yuncheng97/UltraFedFM` de GitHub y en los enlaces de OneDrive, Google Drive y Baidu que figuran en su README; el trabajo se publicó en npj Digital Medicine 8, 714 (2025) y su preprint está disponible en arXiv (2411.16380).

Su relevancia actual es doble. Por un lado, demuestra que es viable entrenar un modelo fundacional médico de forma federada preservando la privacidad de los datos de cada centro. Por otro, ofrece a grupos de investigación y desarrolladores un encoder preentrenado en dominio ecográfico, listo para ajuste fino con pocas etiquetas. No es un modelo generativo de texto: la información disponible no especifica el backbone exacto ni el número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder enmascarado (masked autoencoder, MAE) sobre imágenes de ecografía; el backbone concreto no se especifica en la información disponible |
| Parámetros totales | No disponible (el checkpoint `checkpoint.pth` ocupa 1,34 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de visión, la entrada son imágenes, no secuencias de texto |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de imagen médica); no disponible para texto |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`checkpoint.pth`), 1,34 GB |

## Arquitectura y entrenamiento

La arquitectura se basa en el paradigma de autoencoder enmascarado (MAE): se ocultan aleatoriamente una fracción de los parches de la imagen de entrada y la red aprende a reconstruirlos, lo que fuerza al encoder a capturar estructura anatómica y textura ecográfica sin necesidad de anotaciones. El preentrenamiento se realizó de forma federada entre 16 instituciones, de modo que cada centro entrenó localmente y solo se intercambiaron actualizaciones del modelo (agregación federada), sin transferir imágenes de pacientes. El corpus agregado ronda el millón de imágenes y abarca 19 órganos y 10 modalidades de ecografía.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la resolución de entrada, el tamaño de parche, la estrategia de enmascaramiento ni si hubo etapas posteriores de ajuste supervisado o alineamiento. Tampoco se especifica el número de parámetros del encoder ni la familia concreta de backbone. Los autores describen el modelo como base para tareas posteriores de diagnóstico y segmentación.

## Capacidades

- Extracción de representaciones visuales de imágenes ecográficas: el encoder produce embeddings de imagen reutilizables para clasificación, detección o segmentación tras añadir una cabeza de tarea.
- Aprendizaje autosupervisado: reconstrucción de parches enmascarados, lo que permite preentrenar sin etiquetas.
- Preentrenamiento federado: el modelo se ha entrenado con agregación entre instituciones, preservando los datos locales.
- Cobertura de dominio amplia dentro de la ecografía: 19 órganos y 10 modalidades según la documentación del autor.
- Ajuste fino para diagnóstico: la model card indica que sirve para tareas posteriores de diagnóstico.
- Ajuste fino para segmentación: la model card indica segmentación como tarea de destino.
- No dispone de generación de texto, razonamiento simbólico, código ni matemáticas.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente.
- No se documentan capacidades multilingües ni procesamiento de audio.
- No se documenta un modo de razonamiento explícito (thinking mode) ni decodificación especulativa, por tratarse de un modelo de visión.

## Casos de uso

- Clasificación de patologías ecográficas con pocas etiquetas: se parte del checkpoint y se ajusta una cabeza de clasificación sobre un conjunto pequeño de imágenes anotadas de un servicio concreto, aprovechando que el encoder ya ha visto cerca de un millón de ecografías de 19 órganos.
- Segmentación de estructuras anatómicas: se añade un decodificador de segmentación (por ejemplo, estilo U-Net o un decodificador ligero sobre los tokens del encoder) para delimitar órganos o lesiones en ecografía abdominal, tiroidea o cardiaca.
- Aprendizaje federado multi-hospital: varias instituciones repiten el esquema de agregación para mejorar el modelo con sus datos locales sin exportar imágenes de pacientes, útil en entornos con restricciones de cumplimiento normativo.
- Adaptación de dominio a un equipo o protocolo nuevo: ajuste fino del encoder para compensar diferencias de fabricante de sonda, ajustes de ganancia o protocolos de adquisición, reduciendo la caída de rendimiento entre centros.
- Investigación en representaciones autosupervisadas de imagen médica: uso del encoder como extractor de features para comparar estrategias de preentrenamiento (MAE frente a otros objetivos) en el dominio ecográfico.
- Recuperación de estudios similares: generar embeddings de cada exploración y construir un índice vectorial para buscar casos morfológicamente parecidos en un archivo hospitalario, apoyando revisión y docencia.
- Preetiquetado para anotación asistida: usar el modelo ajustado para proponer máscaras o etiquetas iniciales que después revisan los radiólogos, reduciendo el coste de crear nuevos conjuntos anotados.
- Control de calidad de adquisición: detectar planos o imágenes fuera de protocolo a partir de las representaciones aprendidas, como filtro previo a la lectura clínica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (npj Digital Medicine 8, 714, 2025; arXiv:2411.16380) es la fuente donde deben consultarse las métricas originales, pero no se han proporcionado sus tablas en el material recibido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el checkpoint de 1,34 GB corresponde a un modelo de tamaño moderado; en fp32 la inferencia del encoder cabe con holgura en GPUs de consumo, aunque no se especifican resolución de entrada ni tamaño de lote.
- GPU recomendadas para ajuste fino: no disponibles en la información proporcionada. Por el tamaño del checkpoint, un ajuste fino completo es viable en GPUs de gama alta tipo A100, H100 o RTX 4090; el ajuste de cabezas de tarea con el encoder congelado es viable en GPUs de gama media.
- Cabe en GPU de consumo: previsiblemente sí para inferencia, dado el tamaño del checkpoint, aunque no se confirma oficialmente.
- Opciones de despliegue: PyTorch nativo (es la librería declarada). No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. El despliegue en producción requeriría exportar a TorchScript u ONNX por cuenta del integrador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye especificaciones, métricas ni datos de licencia de otros modelos fundacionales de ecografía, por lo que no es posible establecer una comparación cuantitativa fiable sin inventar cifras.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no genera texto, no mantiene conversaciones, no hace tool calling ni razonamiento multi-paso.
- Es un checkpoint de preentrenamiento, no un modelo listo para uso directo. Requiere construir cabezas de tarea y seguir las instrucciones del repositorio original para cargarlo.
- Riesgo de predicciones erróneas: en segmentación o clasificación médica los fallos pueden tener consecuencias clínicas; se requiere validación externa y supervisión profesional.
- Sesgos potenciales: el corpus procede de 16 instituciones concretas, con equipos, protocolos y poblaciones determinados. No se documenta análisis de sesgo por sexo, edad, etnia ni tipo de ecógrafo.
- Cobertura de dominio limitada a ecografía: no se ha entrenado para resonancia, tomografía computarizada ni radiografía, y su transferencia a esas modalidades no está documentada.
- Licencia Apache-2.0, que permite uso comercial y modificación, pero no exime de cumplir la normativa sanitaria aplicable (marcado CE, autorización FDA u equivalente) antes de cualquier uso clínico.
- Este repositorio es un espejo no oficial: no lo mantienen los autores originales, no hay garantía de actualizaciones, tiene 0 descargas y no se documenta verificación de integridad de los pesos más allá de la procedencia indicada.
- No se dispone de información sobre cuantizaciones soportadas, idiomas, ni métricas de rendimiento, lo que dificulta planificar latencia y coste de despliegue.
- Al tratarse de un mirror, conviene contrastar el hash del checkpoint con el publicado por los autores antes de usarlo en cualquier flujo serio.

## Enlaces

- Repositorio de HuggingFace (espejo): https://huggingface.co/fmassimo/UltraFedFM
- Código original: https://github.com/yuncheng97/UltraFedFM
- Preprint en arXiv: https://arxiv.org/abs/2411.16380
- Artículo en npj Digital Medicine: https://www.nature.com/npjdigitalmed (Jiang, Y. et al., npj Digital Medicine 8, 714, 2025)
- Pesos originales: enlaces de OneDrive, Google Drive y Baidu incluidos en el README del repositorio de GitHub
