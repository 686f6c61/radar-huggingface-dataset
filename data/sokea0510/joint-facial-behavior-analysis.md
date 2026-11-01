# sokea0510/joint-facial-behavior-analysis

## Resumen

`sokea0510/joint-facial-behavior-analysis` es un repositorio de investigación publicado en HuggingFace bajo el nombre de Joint Facial Behavior Analysis Toolkit (JFBA). No se trata de un modelo de lenguaje ni de un checkpoint de red neuronal entrenado, sino de un pequeño paquete Python con interfaz de línea de comandos que orquesta backends publicados de análisis facial (actualmente un adaptador para LibreFace) para estimar unidades de acción facial (AU) y realizar alineamiento de rostros. El autor lo describe explícitamente como código en estado de "public-preview": el repositorio no incluye pesos propios, y el checkpoint local experimental fue entrenado con objetivos proxy derivados de geometría y no ha sido validado contra un conjunto de test independiente codificado con FACS humano.

El problema que aborda es la reproducibilidad en computación afectiva: el toolkit registra junto a cada resultado el backend utilizado, el runtime y las limitaciones conocidas, y exporta salidas estructuradas en JSON sin redistribuir el medio de entrada. Está etiquetado como `image-classification` en el pipeline de HuggingFace, pero su naturaleza real es la de una herramienta de inferencia sobre modelos de terceros, no la de un modelo entrenado por el autor.

Su relevancia actual es limitada pero concreta: sirve como capa de auditoría y trazabilidad para investigadores que necesitan ejecutar análisis de AU de forma reproducible, con advertencias explícitas sobre el carácter experimental de las salidas. El tamaño del repositorio es de 0.0 GB, lo que confirma la ausencia de binarios de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (toolkit de orquestación sobre backends de terceros; backend actual: LibreFace) |
| Parametros totales | No disponible (no se incluyen pesos propios en el repositorio) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (procesamiento de imagen o vídeo, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en (inglés, según metadatos del repositorio) |
| Licencia | MIT (solo el código original; los backends y datasets upstream conservan sus propias licencias) |
| Formato de pesos | No disponible (el repositorio no contiene binarios; plantilla de repositorio de modelo sin pesos) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red neuronal propia. Es un paquete Python (`src/jfba/`) que envuelve backends de análisis facial publicados mediante adaptadores; el único adaptador documentado en la model card es LibreFace, instalable con `pip install libreface`. La CLI `jfba analyze path/to/input.jpg --output results.json` ejecuta el pipeline de inferencia, guarda resultados legibles por máquina y registra backend, runtime y limitaciones junto a cada salida. El repositorio incluye tests offline que usan un backend falso, lo que permite validar la integración sin dependencias externas.

Respecto al entrenamiento, el autor distingue explícitamente tres artefactos que no deben presentarse como un único modelo: un checkpoint experimental conjunto de AU y alineamiento (prototipo de investigación de Sokea Teng, retenido a la espera de etiquetas AU genuinas y evaluación held-out), los pesos de LibreFace (propiedad de USC ICT, que deben enlazarse y no redistribuirse) y el checkpoint child-AU HRM MAE-Face (de Hugging Rain Man, con términos no comerciales). El checkpoint local se entrenó con objetivos proxy derivados de geometría y no ha sido validado contra un conjunto de test independiente codificado con FACS humano; el autor advierte que publicarlo como un modelo AU preciso sería engañoso. No se documentan número de tokens, composición del dataset ni fases de RLHF o DPO, porque no aplica a este tipo de herramienta.

## Capacidades

- Estimación de unidades de acción facial (AU) sobre imágenes o vídeo mediante backends publicados.
- Alineamiento facial (face alignment) integrado en el mismo flujo de trabajo conjunto.
- Exportación de resultados estructurados en JSON sin redistribuir el medio de entrada.
- Registro de metadatos de trazabilidad: backend empleado, runtime y limitaciones junto a cada resultado.
- Visualizaciones cualitativas de intensidades AU, mapas de atención, valores de fiabilidad y patrones de co-activación (salidas proxy experimentales, no calibradas).
- Interfaz de línea de comandos pequeña y auditable, pensada para revisión de investigación.
- Punto de extensión para añadir futuros modelos tras revisión de licencia y evaluación.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multimodalidad texto-imagen.

## Casos de uso

- Investigación en computación afectiva reproducible: el toolkit ejecuta el pipeline de AU y guarda junto a cada resultado el backend, el runtime y las limitaciones, lo que permite a un revisor reproducir y auditar el experimento sin depender de la memoria del autor.
- Anotación asistida previa a codificación FACS humana: las salidas de AU pueden servir como propuesta inicial que un codificador humano revisa y corrige, dado que el propio autor advierte que no son probabilidades calibradas ni medidas clínicas.
- Análisis de dinámica temporal en vídeo: el flujo procesa secuencias completas y genera trayectorias temporales de proxy, útil para estudiar la evolución de la conducta facial a lo largo de un clip en estudios exploratorios.
- Docencia en análisis facial: al ser un paquete pequeño con tests offline y backend falso, permite montar prácticas donde el alumnado ejecuta el pipeline sin necesidad de datos biométricos reales ni de pesos externos.
- Integración en pipelines de investigación con requisitos de privacidad: la CLI no sube el medio de entrada y el repositorio mantiene datasets y medios de participantes fuera de la publicación, lo que facilita cumplir con políticas de consentimiento y ética.
- Comparación de backends de análisis facial: la capa de adaptadores permite sustituir el backend (por ejemplo, LibreFace u otros) y contrastar resultados bajo el mismo formato de salida y las mismas advertencias registradas.
- Prototipado de herramientas de revisión cualitativa: las visualizaciones de cuatro paneles y las trayectorias temporales sirven para revisar casos de estudio de forma cualitativa antes de diseñar una evaluación cuantitativa formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los ejemplos del showcase son ilustraciones cualitativas de la interfaz y del flujo de visualización, no resultados de benchmark, y que las intensidades AU, porcentajes, mapas de atención, valores de fiabilidad y patrones de co-activación mostrados son salidas proxy experimentales no validadas contra codificación FACS humana independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no incluye pesos propios; el consumo depende del backend upstream instalado (LibreFace en la configuración documentada) y de la resolución y duración del medio de entrada.
- GPU recomendadas: no disponible. No se documentan requisitos de GPU en la model card.
- Compatibilidad con GPU de consumo: no disponible. Al no publicarse pesos ni requisitos, no puede confirmarse si el backend actual cabe en tarjetas como RTX 4090 o similares.
- Opciones de despliegue: instalación como paquete Python editable (`pip install -e .`) más el backend upstream correspondiente (`pip install libreface` en el adaptador documentado); ejecución mediante la CLI `jfba analyze`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de herramienta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Herramienta | Tipo | Pesos incluidos | Contexto / entrada | Licencia | Estado |
|---|---|---|---|---|---|
| JFBA (este repositorio) | Toolkit de orquestación sobre backends | No | Imagen o vídeo | MIT (código propio) | Public-preview, sin checkpoint validado |
| LibreFace (USC ICT) | Modelo de análisis facial | Sí (upstream) | Imagen o vídeo | Según proyecto oficial | Backend upstream citado por JFBA |
| HRM MAE-Face child-AU (Hugging Rain Man) | Checkpoint de AU infantil | Sí (upstream) | Imagen | Términos no comerciales | Backend upstream citado por JFBA |
| OpenFace | Toolkit de análisis facial | Sí (upstream) | Imagen o vídeo | Según proyecto oficial | No citado en la información disponible |

La comparación directa con modelos de lenguaje no procede: JFBA no es un modelo generativo ni un checkpoint entrenado, sino una capa de integración. Frente a los backends que envuelve, su valor diferencial es la trazabilidad (registro de backend, runtime y limitaciones) y la ausencia de redistribución de pesos y medios, no el rendimiento predictivo.

## Limitaciones y advertencias

- El repositorio no incluye ningún checkpoint propio entrenado y validado; el checkpoint local experimental fue entrenado con objetivos proxy derivados de geometría y no se ha evaluado contra un conjunto de test independiente codificado con FACS humano.
- Las salidas de AU, intensidades, porcentajes, mapas de atención, valores de fiabilidad y patrones de co-activación son proxies experimentales y no deben tratarse como probabilidades calibradas, medidas clínicas ni evidencia diagnóstica.
- El toolkit no infiere condiciones médicas, estado de desarrollo, diagnóstico, emoción, intención ni estado mental; cualquier uso en ese sentido queda fuera de su propósito declarado.
- Los rostros son datos biométricos: se requiere consentimiento, aprobación ética, minimización de la recogida, protección de identidades y borrado cuando dejen de ser necesarios.
- Uso prohibido explícitamente por el autor: vigilancia encubierta, reconocimiento de identidad, diagnóstico clínico, decisiones de elegibilidad y perfilado de alto riesgo.
- La licencia MIT cubre solo el código original; los modelos, paquetes y datasets upstream conservan sus propias licencias y pueden imponer términos más restrictivos (por ejemplo, el checkpoint HRM MAE-Face tiene términos no comerciales). Debe revisarse la licencia del backend antes de cualquier uso comercial.
- No se incluye ningún dataset; los investigadores deben solicitar o descargar cada dataset desde su proveedor original y cumplir sus términos de licencia, consentimiento y citación.
- El soporte de idioma declarado es únicamente inglés (`en`), aunque al tratarse de análisis de imagen el idioma afecta principalmente a la documentación y a las etiquetas, no a la inferencia.
- El estado es public-preview: la interfaz y el flujo pueden cambiar, y la incorporación de un modelo futuro está condicionada a revisión de licencia y evaluación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de adopción externa ni de validación por terceros.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sokea0510/joint-facial-behavior-analysis
- Documentación del modelo en el repositorio: MODEL_CARD.md (referenciado en la model card)
- Revisión de literatura: docs/RESEARCH_REVIEW.md (referenciado en la model card)
- Política de datasets: docs/DATASETS.md (referenciado en la model card)
- Manifiesto del showcase con checksums: assets/showcase/README.md (referenciado en la model card)
- Citación: CITATION.cff (referenciado en la model card)
- Backend LibreFace (USC ICT): enlace al proyecto oficial según la model card, URL no especificada en la información disponible
- Checkpoint HRM MAE-Face child-AU (Hugging Rain Man): enlace al proyecto oficial según la model card, URL no especificada en la información disponible
