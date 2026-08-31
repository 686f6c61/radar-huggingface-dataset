# newazhala/website-technology-evidence-classifier

## Resumen

El modelo `newazhala/website-technology-evidence-classifier` es un clasificador de texto basado en scikit-learn, desarrollado por el usuario newazhala, que identifica tecnologías web (frameworks, CMS, librerías, servidores, etc.) a partir de evidencias textuales extraídas de un sitio web. Resuelve el problema de la detección de tecnologías (web fingerprinting) mediante un pipeline clásico de TF-IDF y regresión logística, sin necesidad de redes neuronales. Su relevancia radica en su simplicidad y bajo coste computacional, aunque su entrenamiento se ha realizado sobre un dataset sintético, lo que limita su aplicabilidad directa a sitios reales sin ajuste adicional.

La arquitectura combina TF-IDF a nivel de palabra (unigramas y bigramas) con TF-IDF a nivel de carácter (n-gramas de 3 a 5), unidos mediante una `FeatureUnion`, seguidos de una regresión logística. El modelo devuelve las cinco tecnologías más probables con sus puntuaciones de confianza. No se especifican parámetros totales, contexto ni idiomas soportados, y al ser un modelo clásico no utiliza cuantización ni formatos de pesos neuronales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FeatureUnion (TF-IDF de palabras + TF-IDF de caracteres) + Regresion logistica |
| Parametros totales | no disponible (modelo clasico, no neuronal) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de bolsa de palabras) |
| Tipos de cuantizacion | no aplica (modelo clasico) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente joblib/pickle, no especificado) |

## Arquitectura y entrenamiento

El modelo emplea un pipeline de scikit-learn que combina dos extractores TF-IDF: uno a nivel de palabra con unigramas y bigramas, y otro a nivel de carácter con n-gramas de 3 a 5. Ambos se fusionan mediante una `FeatureUnion`, y el vector resultante alimenta un clasificador de regresión logística. Los features de carácter mejoran la tolerancia a URLs, rutas, cadenas de versión y pequeñas diferencias de formato, lo que resulta útil para el fingerprinting web.

El entrenamiento se realizó sobre el dataset complementario `website-technology-evidence-dataset`, que es sintético y está orientado a huellas digitales (fingerprints). No se han publicado detalles sobre el número de ejemplos, el proceso de generación de datos ni si se aplicaron técnicas como RLHF o DPO (no aplicables a un modelo clásico). La model card advierte explícitamente que las métricas de evaluación solo son válidas sobre este benchmark controlado y no deben interpretarse como precisión en sitios web reales.

## Capacidades

- Clasificacion de tecnologias web a partir de texto de evidencia (por ejemplo, fragmentos de HTML, metaetiquetas, URLs, cadenas de version).
- Devuelve las cinco tecnologias mas probables con puntuaciones de confianza.
- Tolerancia a variaciones de formato gracias a los n-gramas de caracteres.
- Inferencia rapida y ligera, apta para entornos sin GPU.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.
- No se especifican capacidades multilingues; el dataset sintetico probablemente este en ingles, pero no se confirma.

## Casos de uso

- Analisis de competencia: dado el HTML de un sitio web, el modelo identifica que CMS, framework o servidor utiliza, permitiendo comparar el stack tecnologico de competidores.
- Inventario de activos web: una empresa puede escanear sus propios dominios y obtener un listado de tecnologias desplegadas para gestionar licencias, vulnerabilidades o deuda tecnica.
- Enriquecimiento de datos de mercado: integrar el clasificador en un pipeline que procesa miles de sitios y genera estadisticas sobre la cuota de mercado de frameworks o plataformas.
- Deteccion de tecnologias obsoletas: al clasificar sitios, se pueden marcar aquellos que usan versiones antiguas de librerias o CMS, facilitando campañas de actualizacion.
- Filtrado de leads en desarrollo web: agencias pueden identificar rapidamente que tecnologia usa un sitio potencial cliente y adaptar su propuesta comercial.
- Investigacion academica: como herramienta de referencia para estudios sobre la evolucion del uso de tecnologias web, siempre que se ajuste o valide previamente sobre datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un archivo `metrics.json` con metricas de evaluacion, pero no se proporcionan valores concretos. Ademas, se advierte que dichas metricas se obtuvieron sobre un dataset sintetico y no son representativas del rendimiento en entornos reales.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un pipeline clasico de scikit-learn, por lo que no requiere GPU. Un solo nucleo de CPU es suficiente para clasificar cientos de textos por segundo.
- VRAM estimada: 0 GB (no utiliza memoria de GPU).
- GPU recomendadas: ninguna.
- Compatible con cualquier hardware moderno, incluidos Raspberry Pi o instancias cloud de bajo coste.
- Opciones de despliegue: al ser scikit-learn, se puede servir con Flask/FastAPI, o mediante herramientas como MLflow o BentoML. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no se han publicado mediciones, pero por la naturaleza del modelo se espera una latencia inferior a 10 ms por muestra en CPU moderna.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores de tecnologias web basados en scikit-learn). Existen herramientas como Wappalyzer o BuiltWith, pero son servicios propietarios y no publican modelos abiertos comparables. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es sintetico y basado en huellas digitales; el rendimiento en sitios web reales puede ser significativamente inferior.
- Las metricas publicadas (si existen en `metrics.json`) solo son validas sobre el benchmark controlado y no deben extrapolarse.
- No se especifican los idiomas soportados; es probable que el modelo funcione mejor con evidencias en ingles, pero no esta confirmado.
- Al ser un clasificador clasico, no maneja contexto ni semantica; solo utiliza frecuencias de n-gramas, por lo que puede fallar ante ofuscacion o tecnologias no incluidas en el dataset.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias de exactitud ni soporte.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una adopcion muy limitada y poca validacion externa.
- No se proporciona informacion sobre sesgos, pero al estar entrenado con datos sinteticos podria reflejar los sesgos del proceso de generacion de dichos datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/newazhala/website-technology-evidence-classifier
- Espacio de demostracion (Website Technology Detector): https://huggingface.co/spaces/newazhala/website-technology-detector/tree/main
- Proyecto relacionado (AzkiWeb): https://azkiweb.com/
- Pagina de precios de diseno web (mencionada en la model card): https://azkiweb.com/website-design-price
