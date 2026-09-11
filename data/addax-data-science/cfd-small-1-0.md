# Addax-Data-Science/CFD-SMALL-1-0

## Resumen

Addax-Data-Science/CFD-SMALL-1-0 es un repositorio de Hugging Face publicado por Addax Data Science que redistribuye un modelo de visión por computador orientado a la detección de peces, desarrollado originalmente por Filippo Varini, Dan Morris y los contribuidores del proyecto Community Fish Detector. No se trata de un modelo de lenguaje: el identificador CFD corresponde a Community Fish Detector y el sufijo SMALL apunta a una variante de tamaño reducido dentro de esa familia.

El repositorio actúa como espejo de conveniencia para facilitar su integración en AddaxAI, la plataforma de Addax Data Science, y cada modelo redistribuido conserva su licencia original y su atribución. El tamaño del repositorio es de 0,1 GB, coherente con un detector de imágenes compacto, pero la model card no publica arquitectura, número de parámetros, resolución de entrada, composición del dataset ni procedimiento de entrenamiento.

Su relevancia es de nicho: interesa a equipos que trabajan con cámaras trampa, vídeo subacuático o monitorización de fauna íctica y quieren un detector ya empaquetado para AddaxAI. Para cualquier otro uso, la ausencia de documentación técnica y de datos de rendimiento en la información disponible obliga a consultar el repositorio original del proyecto antes de plantear su adopción en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, no procesa texto) |
| Licencia | no disponible en el repositorio; se indica que hereda la licencia del proyecto original Community Fish Detector |
| Formato de pesos | no disponible |
| Tarea | detección de peces en imágenes (según la descripción del proyecto de origen) |
| Tamaño del repositorio | 0,1 GB |
| Desarrollador original | Filippo Varini, Dan Morris y contribuidores de Community Fish Detector |
| Redistribuidor | Addax Data Science (AddaxAI) |

## Arquitectura y entrenamiento

La información proporcionada no incluye ningún detalle sobre la arquitectura del modelo. No se especifica si se trata de una red convolucional de detección de objetos de una etapa o de dos etapas, ni el backbone, la resolución de entrada, el número de parámetros o el tamaño de la cabeza de detección. Tampoco se documentan técnicas de aumento de datos, función de pérdida ni método de anclaje.

Respecto al entrenamiento, la model card únicamente remite al repositorio de GitHub del proyecto Community Fish Detector para obtener información ampliada, atribución y cita académica. No se indica el número de imágenes de entrenamiento, la composición del dataset, las especies cubiertas, el régimen de anotación ni si hubo etapas de ajuste fino posteriores. La única cifra objetiva disponible es el tamaño del repositorio, 0,1 GB, que sugiere un conjunto de pesos pequeño y, por tanto, un modelo de capacidad reducida, pero esto es una inferencia a partir del tamaño del archivo y no un dato declarado por el autor.

## Capacidades

- Detección de peces en imágenes: el modelo se distribuye como parte de la familia Community Fish Detector, orientada a localizar individuos de peces en imágenes o fotogramas de vídeo.
- Integración con AddaxAI: el repositorio está empaquetado específicamente para que la plataforma AddaxAI pueda cargarlo como modelo redistribuido.
- Procesamiento por lotes de imágenes: al ser un modelo de visión, encaja en flujos de inferencia offline sobre directorios de imágenes, propio de los pipelines de cámaras trampa.
- Generación de texto: no aplica. No es un modelo de lenguaje.
- Razonamiento, matemáticas y código: no aplica.
- Tool calling o function calling: no disponible, y previsiblemente no aplica a un modelo de detección.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Modo thinking, visión generativa, audio o vídeo con descripción textual: no disponible.

## Casos de uso

- Monitorización de poblaciones ícticas con cámaras trampa subacuáticas: el modelo permite procesar automáticamente las capturas de una cámara fija y obtener detecciones de peces sin revisar manualmente cada imagen, lo que reduce el coste de los estudios de seguimiento a largo plazo.
- Cribado previo de vídeo de larga duración: en lugar de revisar horas de grabación, se ejecuta el detector fotograma a fotograma (o con muestreo temporal) para localizar los segmentos con presencia de peces y concentrar el esfuerzo humano en esos tramos.
- Conteo asistido en acuicultura y piscifactorías: combinado con un paso de conteo posterior sobre las cajas detectadas, sirve para estimar el número de individuos visibles en tanques o canales, siempre que el dominio de imagen se parezca al de entrenamiento.
- Estudios de paso de peces en infraestructuras fluviales: escalas de peces, azudes y centrales hidroeléctricas pueden instrumentarse con cámaras y usar el detector para registrar eventos de paso y su frecuencia temporal.
- Anotación asistida para investigación ecológica: las detecciones se usan como propuesta inicial que un anotador humano corrige, acelerando la creación de datasets etiquetados de fauna íctica.
- Detección temprana de especies invasoras: si el modelo está entrenado con las clases adecuadas, puede emplearse como alerta temprana en masas de agua donde se vigila la aparición de especies no nativas; requiere verificar antes la cobertura de clases del modelo.
- Docencia y ciencia ciudadana: proyectos educativos o de voluntariado pueden desplegar el detector sobre imágenes aportadas por participantes para clasificar y contabilizar peces de forma semiautomática.
- Integración en pipelines de AddaxAI: al estar empaquetado para esa plataforma, se puede incorporar como componente de un flujo mayor de análisis de datos de biodiversidad sin trabajo adicional de conversión de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de detección (mAP, precisión, recall, F1) ni comparaciones con otros detectores, y la búsqueda web realizada no ha devuelto documentación técnica del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, por lo que, si el peso se corresponde con un único conjunto de pesos, la huella de memoria del modelo sería muy reducida, pero se trata de una inferencia a partir del tamaño del repositorio y no de un dato declarado.
- GPU recomendadas: no disponible. No se especifican requisitos de cómputo, ni si el modelo está preparado para CUDA, ROCm, Metal o CPU.
- Encaje en GPU de consumo: no disponible. Dado el tamaño del repositorio, es plausible que quepa en GPUs de consumo e incluso que la inferencia en CPU sea viable, pero no hay confirmación por parte del autor.
- Opciones de despliegue: la vía prevista por el redistribuidor es AddaxAI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que en cualquier caso están orientados a modelos de lenguaje y no aplicarían a un detector de imágenes.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones que permitan comparar este modelo con alternativas de la misma categoría (por ejemplo, otros detectores de peces o detectores de objetos genéricos ajustados a fauna íctica). Cualquier comparación requeriría consultar el repositorio original del proyecto Community Fish Detector y ejecutar una evaluación propia sobre un conjunto de datos común.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se publican arquitectura, parámetros, resolución de entrada, dataset ni métricas, lo que impide estimar su comportamiento antes de probarlo.
- Sesgos desconocidos: al no especificarse la composición del conjunto de entrenamiento, no se puede saber si el modelo generaliza a distintas especies, aguas, iluminaciones o calidades de imagen.
- Riesgo de degradación en condiciones adversas: turbidez del agua, reflejos, baja iluminación, oclusión parcial o peces muy pequeños son escenarios habituales donde un detector de este tipo puede fallar; no hay datos publicados que cuantifiquen ese impacto.
- Falsos positivos y falsos negativos: no hay métricas de precisión ni recall, por lo que no se puede calibrar el umbral de confianza ni estimar el error esperado en producción.
- Licencia no declarada en el repositorio: la model card indica que cada modelo conserva su licencia original y remite a los archivos de licencia y al repositorio del proyecto, pero no especifica cuál es. Antes de cualquier uso comercial es obligatorio revisar la licencia de Community Fish Detector y cumplir sus términos.
- Modelo redistribuido, no desarrollado por el publicador: el mantenimiento, las actualizaciones y el soporte dependen del proyecto original; el repositorio de Addax Data Science actúa como espejo y puede quedar desactualizado.
- Naturaleza del modelo: no genera texto, no razona y no admite instrucciones en lenguaje natural. Cualquier caso de uso debe plantearse como detección de objetos sobre imágenes.
- Sin garantías de rendimiento ni de soporte: no hay benchmarks, ni versionado documentado de cambios, ni información sobre el proceso de validación previo a la publicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Addax-Data-Science/CFD-SMALL-1-0
- Repositorio original en GitHub (Community Fish Detector): https://github.com/filippovarini/community-fish-detector
- Instrucciones de cita del proyecto original: https://github.com/filippovarini/community-fish-detector#citing-this-work
- Licencia del proyecto original: https://github.com/filippovarini/community-fish-detector
- Plataforma AddaxAI: https://addaxdatascience.com/addaxai/
- Sitio de Addax Data Science: https://addaxdatascience.com/

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre el modelo. Los enlaces obtenidos corresponden a contenidos no relacionados (la especie de antílope addax y empresas homónimas) y se han descartado por no aportar información técnica.
