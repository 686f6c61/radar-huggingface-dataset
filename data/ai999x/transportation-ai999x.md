# AI999X/transportation-ai999x

## Resumen

Transportation (transportation-ai999x) es un motor de cálculo determinista empaquetado como modelo de question-answering para ingeniería del transporte. Lo desarrolla AI999X y resuelve 81 cálculos repartidos en 16 temas: dinámica de vehículos, distancias de frenado y visibilidad, flujo de tráfico, geometría de carreteras, operación ferroviaria, planificación de rutas y capacidad de transporte público. Cada cálculo devuelve su fórmula, los pasos intermedios, las unidades y una explicación en lenguaje natural; cuando una entrada falta o está fuera de rango, devuelve una razón en texto en lugar de un número inventado.

El punto clave es que no es un modelo neuronal generativo: los pesos publicados son safetensors de 4.715.520 parámetros (unos 4,7 M) que acompañan a un motor compilado en Rust. La inferencia se ejecuta de forma local y offline en cuatro formatos: aplicación de escritorio (Windows y Linux), línea de comandos, navegador y paquete de Python. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

Es relevante para docentes, estudiantes y equipos de ingeniería que necesitan respuestas reproducibles y auditables en lugar de texto plausible. El autor declara cero alucinaciones y resultados idénticos verificados en Windows y Linux sobre Python 3.10 a 3.14, aunque la métrica aparece marcada como no verificada en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de cálculo determinista compilado en Rust, empaquetado con pesos safetensors; no es un transformer generativo |
| Parametros totales | 4.715.520 (4,7 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto conversacional) |
| Tipos de cuantizacion | No disponible; el motor se distribuye como binario compilado y build Python puro |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; distribución adicional como ZIP/TAR.GZ (escritorio y CLI) y paquete pip |

## Arquitectura y entrenamiento

La ficha técnica describe un único motor compilado que implementa 81 cálculos de ingeniería del transporte agrupados en 16 temas. No se documenta una arquitectura de red neuronal, ni número de tokens de entrenamiento, ni fases de RLHF o DPO. El comportamiento es determinista por diseño: cada consulta se resuelve aplicando la fórmula correspondiente con validación de rangos y unidades, y la salida incluye los pasos intermedios. Los pesos safetensors (4,7 M de parámetros) acompañan al motor, pero la model card no detalla su función exacta dentro del pipeline.

La innovación destacable no es algorítmica en el sentido habitual, sino de ingeniería de producto: el mismo motor se compila para escritorio y CLI, se expone en navegador y se distribuye como paquete de Python. En Windows y Linux x86-64, `pip install transportation-ai999x` instala el motor compilado; en macOS y ARM instala una build Python puro que, según el autor, ofrece las mismas respuestas. El autor declara resultados idénticos entre plataformas sobre un conjunto de 563 preguntas documentadas.

## Capacidades

- Resolución paso a paso de 81 cálculos de ingeniería del transporte en 16 temas, con fórmula, unidades y explicación.
- Distancias de visibilidad y frenado, incluida la componente de pendiente.
- Geometría de carreteras: peralte, curvas verticales, velocidad segura en curva horizontal.
- Flujo de tráfico: modelo de Greenshields, onda de choque, nivel de servicio en autopista a partir de densidad.
- Sincronización semafórica y teoría de colas (retardo uniforme D/D/1).
- Dinámica de vehículos: gradiente de subviraje y velocidad característica o crítica (modelo de bicicleta).
- Operación ferroviaria: tiempos de recorrido y planificación de rutas.
- Elasticidades directas y cruzadas de probabilidades de elección logit.
- Cargas equivalentes por eje según la ley de cuarta potencia.
- Validación de entradas: devuelve una razón en texto cuando falta un dato o está fuera de rango, en lugar de un número.
- Ejecución offline y local; sin llamadas a servicios externos.
- Interfaz de escritorio con escenas y gráficos generados a partir del resultado calculado.
- No soporta tool calling genérico, agentes multi-paso ni visión; su alcance es el catálogo de cálculos documentado.

## Casos de uso

- Docencia de ingeniería del transporte: el alumnado plantea un problema de distancia de visibilidad y obtiene la fórmula, los pasos y las unidades, lo que permite corregir el procedimiento y no solo el resultado final.
- Corrección de ejercicios y tutoría: con 563 preguntas doradas documentadas, el motor sirve como referencia reproducible para comparar entregas y detectar errores de unidades.
- Verificación en gabinete de proyectos viarios: cálculo rápido de peralte, curvas verticales y velocidad segura en curva para comprobar hipótesis antes de pasar al software de diseño geométrico.
- Análisis de capacidad y niveles de servicio: estimación de densidad y nivel de servicio en un segmento básico de autopista para prefactibilidad de ampliaciones.
- Estudios de sincronización semafórica: retardo uniforme y formación de colas en un cruce con demanda conocida, útil para priorizar intersecciones en un plan de movilidad.
- Planificación de rutas y tiempos de recorrido: cálculo de la ruta más rápida sobre una red con longitudes y velocidades por enlace, y estimación de tiempos de recorrido ferroviario.
- Integración en pipelines de Python: el paquete `transportation-ai999x` permite incorporar los cálculos a cuadernos de análisis o a scripts de validación de datos de aforo.
- Uso en campo sin conectividad: la aplicación de escritorio y la CLI funcionan offline en Windows y Linux, lo que facilita consultas en oficina técnica o en visitas de obra.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index:

| Tarea | Conjunto de evaluación | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Question answering (transporte) | Golden answers (563 preguntas documentadas, Windows + Linux, Python 3.10-3.14) | Accuracy | 1,0 (idéntico en cada plataforma) | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el motor se ejecuta en CPU y los pesos ocupan unos pocos megabytes (repositorio de 0,0 GB según Hugging Face).
- GPU recomendadas: no se requiere GPU.
- Cabe en cualquier equipo de consumo: Windows o Linux x86-64 para la build compilada; macOS y ARM mediante la build Python puro.
- Opciones de despliegue: aplicación de escritorio (Windows/Linux), CLI `transportation`, navegador en la página del modelo y paquete `pip install transportation-ai999x` para Python 3.10 o superior.
- Latencia y throughput: no disponibles; al ser cálculo determinista local, la latencia depende del cálculo concreto y del equipo, no de un motor de inferencia neuronal.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| transportation-ai999x | Motor determinista + pesos safetensors | 4,7 M | No aplica | Apache 2.0 | 81 cálculos de ingeniería del transporte con pasos |
| LLM generalista (p. ej. Llama, Qwen) | Transformer generativo | Miles de millones | Decenas de miles de tokens | Variable | Texto libre; riesgo de alucinación en cálculos |
| Software de diseño geométrico (p. ej. AutoCAD Civil 3D, OpenRoads) | Herramienta CAD profesional | No aplica | No aplica | Comercial | Diseño y modelado, no resolución explicada de ejercicios |

No se dispone de datos de benchmarks comparativos con estas alternativas en la información proporcionada. La comparación cualitativa se limita al tipo de herramienta y su encaje de uso.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte declarado de castellano ni de otros idiomas.
- El alcance está cerrado a los 81 cálculos documentados en 16 temas; no responde preguntas fuera de ese catálogo.
- No es un modelo generativo: no redacta informes, no razona sobre texto libre ni mantiene conversaciones abiertas.
- La métrica de accuracy 1,0 aparece marcada como no verificada en el model-index; conviene tratarla como declaración del autor.
- La evaluación se limita a 563 preguntas doradas sobre Windows y Linux con Python 3.10-3.14; no cubre macOS ni ARM de forma nativa con el motor compilado.
- En macOS y ARM se instala una build Python puro; el autor afirma respuestas idénticas, pero el rendimiento puede diferir.
- No se documentan sesgos, pues no hay entrenamiento sobre corpus lingüístico; el riesgo principal es de alcance (interpretar mal una pregunta fuera del catálogo) y no de alucinación de cifras.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; conviene revisar el archivo LICENSE del repositorio para los términos exactos.
- Para producción, validar que las fórmulas y constantes coinciden con la normativa aplicable en la jurisdicción del proyecto (por ejemplo, AASHTO frente a normas nacionales), ya que la model card no especifica la fuente normativa de cada cálculo.
- El repositorio tiene un tamaño de 0,0 GB y 332 descargas; es un proyecto con poca tracción comunitaria, sin likes, lo que reduce la base de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/AI999X/transportation-ai999x
- Página del modelo con demo en navegador: https://www.ai999x.com/models/transportation-ai999x/
- Capacidades del modelo: https://www.ai999x.com/models/transportation-ai999x/#capabilities
- Aplicación de escritorio, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-transportation-1.6.7-windows-x86_64.zip
- Aplicación de escritorio, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-transportation-1.6.7-linux-x86_64.tar.gz
- CLI, Windows: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-windows-x86_64.zip
- CLI, Linux: https://github.com/AI999X/ai999x-desktop/releases/download/v1.6.7/ai999x-cli-1.6.7-linux-x86_64.tar.gz
- Vídeo de demostración: https://www.ai999x.com/?ax_shot=transportation-ai999x/clip.mp4
