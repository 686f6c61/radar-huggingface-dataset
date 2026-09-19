# snmedia153/korean-web-page-inspector

## Resumen

Korean Web Page Inspector es un modelo de clasificación de texto publicado por el usuario snmedia153 en HuggingFace, pensado para inspeccionar páginas web en coreano y devolver, en formato JSON, tanto el estado de la página como la presencia y posición de elementos de inicio de sesión y registro. No es un modelo generativo ni un modelo de visión: combina un encoder de frases congelado (paraphrase-multilingual-MiniLM-L12-v2), una cabeza de clasificación propia entrenada con regresión ridge, reglas estructurales sobre el DOM y un paso de validación de selectores CSS. El objetivo declarado es separar dos cosas que un clasificador de etiqueta única mezclaría: el propósito de la página (por ejemplo, `NORMAL`) y los roles de los elementos presentes (`LOGIN_ENTRY`, `SIGNUP_ENTRY`), permitiendo que coexistan varios formularios de login con sus posiciones y relaciones preservadas.

Técnicamente es un sistema ligero orientado a CPU: el encoder base no se reentrena, solo la cabeza de clasificación, y el despliegue se empaqueta en Docker con un límite de 2 CPUs y 1536 MB de memoria. El tokenizador trabaja con un límite de 128 tokens y cadenas de características de hasta 2000 caracteres, con mask mean pooling y normalización L2 sobre embeddings de 384 dimensiones. La salida está pensada para ser consumida por programas posteriores (automatización de scraping, QA de formularios, monitorización de páginas), no por un usuario final conversacional.

Su relevancia es limitada pero concreta: es un ejemplo de modelo de "portafolio" que documenta un pipeline híbrido (aprendizaje + reglas) para un problema de parsing web real, con licencia MIT para el código y la cabeza, y Apache-2.0 heredada del encoder base. En el momento de redacción de esta ficha el repositorio tiene 0 descargas y 0 likes, y todas las métricas publicadas son de evaluación interna, no de validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM) congelado + cabeza de clasificación ridge + reglas estructurales de DOM |
| Parametros totales | No disponible (el encoder base es MiniLM-L12, con embeddings de 384 dimensiones; los pesos del encoder no se actualizan) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (límite del tokenizador); cadenas de características de hasta 2000 caracteres |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | MIT para el código, la documentación y la cabeza de clasificación; Apache-2.0 para el encoder MiniLM base |
| Formato de pesos | ONNX (etiqueta declarada en el repositorio); librería `custom` |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |
| Pipeline declarado | text-classification |
| Pooling | Mask mean pooling con normalización L2 |
| Hiperparámetros | Ridge 0.1; umbral de similitud de embeddings 0.45; umbral de diferencia de puntuación superior 0.10 |
| Registros de entrenamiento de la cabeza aprobada | 894 (versión `1789825206742410542`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema tiene cuatro componentes diferenciados según la propia model card. Primero, un encoder multilingual MiniLM congelado que convierte el texto y los atributos extraídos del DOM en embeddings de 384 dimensiones. Segundo, una cabeza de clasificación ridge con balanceo de clases que predice el estado de la página, el rol de los elementos y su presencia. Tercero, un conjunto de reglas sobre la estructura del DOM que incorporan relaciones entre formularios y contenedores, así como la evidencia del estado detectado. Cuarto, un mecanismo de validación de selectores que comprueba si la posición detectada coincide de forma única en el HTML actual.

El punto clave del entrenamiento es que el encoder base no se modifica: solo se ajusta la cabeza de clasificación, con 894 registros anotados en la versión de modelo aprobada. El autor distribuye por separado un modelo "aprobado" y otro con etiquetado automático incluido. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO; dado que se trata de una cabeza ridge sobre embeddings congelados, esas técnicas no resultarían aplicables del modo habitual. La innovación técnica reseñable es precisamente la combinación de un clasificador neuronal ligero con reglas explícitas de DOM para resolver un problema de desambiguación entre propósito de página y presencia de elementos.

## Capacidades

- Clasificación del estado de una página web coreana (por ejemplo, etiquetas como `NORMAL`) y del rol de sus elementos (`LOGIN_ENTRY`, `SIGNUP_ENTRY`).
- Detección simultánea de múltiples formularios de inicio de sesión en una misma página, preservando posición y relaciones entre ellos.
- Extracción de embeddings de texto y atributos del DOM mediante un encoder multilingual MiniLM (384 dimensiones), con cobertura de coreano e inglés.
- Validación de selectores: comprueba que la ubicación detectada en el HTML es única y consistente.
- Salida estructurada en JSON apta para ser consumida por programas posteriores.
- Aplicación de reglas estructurales de DOM para reforzar el resultado del clasificador estadístico (Macro F1 combinado de 0.8408 frente a 0.6410 del cabezal de página aislado).
- Interfaz web (WebUI) construida con Ant Design, shadcn/ui y Recharts para introducir HTML y revisar el veredicto, las posiciones de los elementos, las puntuaciones y el JSON resultante.
- No soporta generación de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio: es un clasificador de texto especializado.

## Casos de uso

- Automatización de scraping en sitios coreanos: el modelo permite decidir si una página requiere autenticación antes de extraer contenido, devolviendo una etiqueta de estado junto con los selectores de los formularios, lo que simplifica la lógica de la araña.
- Monitorización de páginas de login y registro: integrado en un job periódico, detecta cuándo aparece un formulario nuevo o cambia su posición, útil para equipos de QA que vigilan regresiones en portales propios.
- Auditoría de accesibilidad y calidad de formularios: al identificar cada `LOGIN_ENTRY` y `SIGNUP_ENTRY` con su ubicación validada por selector, facilita comprobar que los formularios siguen un patrón consistente en todo un sitio.
- Enrutado de tráfico web en proxies o gateways: un componente intermedio puede clasificar la página servida y decidir si aplica políticas distintas a páginas normales frente a pantallas de autenticación.
- Construcción de datasets etiquetados para terceros: su salida JSON puede usarse como propuesta de anotación previa que un revisor humano confirme, reduciendo el coste de etiquetado en proyectos de parsing web en coreano.
- Análisis competitivo y estudios de UX sobre portales coreanos: permite inventariar de forma automática qué proporción de páginas de un dominio expone formularios de registro o login y en qué posición.
- Validación en pipelines de pruebas end-to-end: al ejecutarse en CPU y devolver JSON, encaja como aserción automática en tests que comprueban que una página concreta sigue mostrando el formulario esperado.
- Despliegue local en entornos sin GPU: el contenedor Docker con 2 CPUs y 1536 MB de memoria permite ejecutarlo en máquinas modestas o en CI sin acelerador.

## Benchmarks y rendimiento

Los únicos datos publicados son de evaluación interna y proceden de la model card del autor. No hay comparación con modelos de terceros.

| Métrica | Valor | Ámbito de evaluación |
|---|---:|---|
| Macro F1 del cabezal de página | 0.6410 | 185 páginas |
| Macro F1 con reglas estructurales combinadas | 0.8408 | 185 páginas |
| Exactitud con reglas estructurales combinadas | 0.9405 | Misma evaluación interna |
| Coincidencia exacta del conjunto de elementos | 0.5574 | Subconjunto de elementos revisados |

El propio autor advierte que el conjunto evaluado y la composición de clases pueden variar entre ejecuciones, por lo que una subida en las curvas no implica necesariamente una mejora en condiciones idénticas. Los umbrales citados (similitud 0.45, diferencia de puntuación 0.10) corresponden al código actual y no se conserva registro de valores anteriores. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado explícitamente para ejecutarse sin GPU.
- Contenedor de referencia: `docker run --rm --cpus 2 --memory 1536m -p 127.0.0.1:18791:7860 page-inspector`, es decir, 2 CPUs y 1536 MB de memoria asignada.
- VRAM estimada: no aplica en el modo de despliegue documentado; no se especifica un requisito de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible (no se documenta soporte GPU ni aceleración por hardware).
- Encaje en GPU de consumo: no procede según la información disponible, ya que el diseño es CPU-first.
- Opciones de despliegue: Docker (imagen `page-inspector`) y script `start.ps1` en Windows; servicio accesible en `http://127.0.0.1:18791`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El único punto de referencia citado es el encoder base del propio sistema, que no es una alternativa sino un componente interno.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Korean Web Page Inspector | No disponible | 128 tokens / 2000 caracteres | Macro F1 0.8408 y exactitud 0.9405 en 185 páginas (evaluación interna) | MIT (código y cabeza) + Apache-2.0 (encoder) | HuggingFace, 0 descargas |
| paraphrase-multilingual-MiniLM-L12-v2 | No disponible en la información proporcionada | No disponible | No aplica al caso de uso (encoder de propósito general) | Apache-2.0 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Está especializado en páginas web en coreano; el soporte de inglés aparece declarado, pero no se documentan métricas desagregadas por idioma.
- No es un modelo de visión: no interpreta capturas de pantalla, solo texto y atributos extraídos del DOM.
- No es un modelo fundacional ni generativo; cualquier expectativa de generación de texto, razonamiento o tool calling queda fuera de su alcance.
- La coincidencia exacta del conjunto de elementos es de 0.5574, lo que indica que en una proporción relevante de casos la lista de elementos detectados no coincide exactamente con la revisada.
- Todas las métricas proceden de evaluación interna sobre 185 páginas y un subconjunto de elementos revisados; no hay validación externa ni reproducibilidad independiente.
- El autor advierte de que el conjunto de evaluación y la composición de clases cambian entre ejecuciones, por lo que las cifras no son directamente comparables entre versiones.
- No se documentan sesgos específicos, pero al depender de un encoder multilingual y de reglas de DOM escritas a mano, puede heredar los sesgos de representación del corpus original del encoder y fallar en estructuras HTML poco convencionales.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe riesgo de falsos positivos o negativos al clasificar estados y roles de elementos.
- La licencia MIT cubre el código, la documentación y la cabeza de clasificación propias; el encoder base mantiene Apache-2.0 y sus avisos deben conservarse según los ficheros `NOTICE`, `BASE_MODEL_LICENSE.txt` y `licenses/`.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad que haya validado el comportamiento en producción.
- No se publican los HTML ni las capturas originales de los sitios usados para el entrenamiento, lo que impide auditar la composición del dataset a partir del repositorio.
- En producción conviene tratar la salida como una propuesta que requiere verificación, especialmente en el paso de validación de selectores sobre HTML dinámico generado por JavaScript.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snmedia153/korean-web-page-inspector
- Encoder base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Documentación referenciada en el repositorio (rutas relativas a la model card): `INSTALL.md`, `EVALUATION.md`, `LABELING.md`, `DATA.md`, `LICENSE_REVIEW.md`, `NOTICE`, `BASE_MODEL_LICENSE.txt`, `licenses/`
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido genérico sobre Instagram); no se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
