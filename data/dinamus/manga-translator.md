# Dinamus/manga-translator

## Resumen

Manga Translator es un proyecto de traducción por lotes de páginas de manga, publicado en Hugging Face bajo el identificador `Dinamus/manga-translator` y licencia MIT. No es un modelo de pesos único, sino un pipeline orquestado que combina detección de regiones de texto, OCR, traducción automática, inpaint y exportación de resultados. El autor lo plantea como una aplicación (backend en Python con FastAPI y CLI, más una interfaz web en Next.js) orientada inicialmente a la dirección japonés→inglés, con arquitectura modular que permite sustituir componentes por modelos reales.

La relevancia del proyecto reside en su enfoque de "modelos libres y locales": por defecto funciona con stubs sin GPU ni descargas, y opcionalmente integra `manga-ocr` para el reconocimiento de texto y `opus-mt-ja-en` para la traducción. Además incorpora controles de calidad propios de herramientas de scanlation en producción, como glosarios para preservar nombres propios y diccionarios de reemplazo previos y posteriores a la traducción basados en expresiones regulares.

Es importante señalar que la model card describe un sistema de extremo a extremo con fases de desarrollo (la fase 1 cubre detect → OCR → translate → overlay; la fase 2 añade inpaint y typeset), y no documenta parámetros, longitud de contexto ni datos de entrenamiento propios, ya que delega esas funciones en modelos de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multi-componente (deteccion de regiones, OCR, traduccion, inpaint, exportacion); no es un unico transformer |
| Parametros totales | no disponible (depende de los modelos de terceros integrados) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los componentes ONNX y los modelos opcionales se usan tal cual se cargan) |
| Idiomas soportados | Japones como origen e ingles como destino (JP→EN) en la fase inicial |
| Licencia | MIT |
| Formato de pesos | no disponible (el proyecto integra pesos de terceros; menciona ONNX en las etiquetas y `anime-manga-big-lama.pt` para inpaint) |

## Arquitectura y entrenamiento

El sistema no entrena un modelo propio, sino que compone un pipeline de cinco etapas: (1) deteccion de regiones de texto mediante contornos heurísticos, con CTD (Comic Text Detector) previsto como opción futura; (2) OCR del texto fuente, usando `manga-ocr` cuando se activa `MANGA_TRANSLATOR_REAL_MODELS=1` y un stub en caso contrario; (3) traduccion JP→EN con `opus-mt-ja-en` en modo real; (4) inpaint de las burbujas, con relleno plano para regiones claras, Big-LaMa para regiones texturadas cuando `anime-manga-big-lama.pt` está presente en `data/models`, y OpenCV Telea como alternativa; y (5) exportacion de PNG lado a lado más zip o CBZ.

La innovación técnica del proyecto no está en el aprendizaje profundo sino en la ingeniería de calidad de traducción y en la ergonomía del flujo de trabajo. El orden de lectura sigue la convención del manga (derecha a izquierda, por bandas de panel), las líneas ya presentes en el idioma destino se dejan pasar sin traducir y las burbujas idénticas se traducen una sola vez. Se incluye además un script de evaluación (`eval_accuracy.py`) que mide CER para el OCR y chrF para la traducción, con soporte para Ollama como backend.

No se dispone de información sobre volúmenes de datos de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO, dado que el proyecto no entrena modelos base.

## Capacidades

- Deteccion de regiones de texto en páginas de manga mediante contornos heurísticos.
- OCR de texto japonés con `manga-ocr` en modo de modelos reales.
- Traduccion automatica japonés→inglés con `opus-mt-ja-en`.
- Inpaint de burbujas de texto: relleno plano para zonas claras, Big-LaMa para zonas texturadas y OpenCV Telea como respaldo.
- Colorizacion opcional de la página limpia a 576 px (`MANGA_TRANSLATOR_COLORIZE=1`).
- Exportacion de resultados en PNG lado a lado, zip y CBZ.
- Control de calidad mediante glosario de nombres y términos, diccionario previo (corrección de artefactos OCR y eliminación de onomatopeyas) y diccionario posterior (corrección de fraseo recurrente de la MT).
- Procesamiento por lotes con API FastAPI, CLI (`manga-translator translate-batch`) e interfaz web Next.js con sondeo de progreso de trabajos.
- Evaluacion cuantitativa de precisión con CER y chrF contra traducciones conocidas.

## Casos de uso

- Digitalizacion y traduccion de colecciones personales de manga: el pipeline procesa carpetas completas de páginas con `translate-batch` y exporta zip o CBZ listos para lectura, sin necesidad de GPU en la fase de stubs.
- Prototipado rápido de herramientas de scanlation: la separacion entre backend FastAPI y UI Next.js permite integrar el motor en un servicio web propio y sustituir cada etapa (OCR, traduccion, inpaint) por el modelo que convenga.
- Preservacion de terminologia en series largas: el glosario JSON mantiene nombres de personajes y términos recurrentes consistentes entre capítulos, enviando al traductor solo las entradas presentes en la página.
- Limpieza de artefactos OCR antes de traducir: el diccionario previo basado en regex corrige errores de reconocimiento y elimina onomatopeyas que degradarian la traduccion.
- Correccion sistemática de la fraseo de la MT: el diccionario posterior normaliza expresiones que el modelo de traduccion reproduce de forma inconsistente, útil en producción con grandes volúmenes.
- Evaluacion comparativa de backends de traduccion: el script `eval_accuracy.py` con backend Ollama permite medir CER y chrF y decidir qué combinación de OCR y traductor ofrece mejor calidad antes de desplegar.
- Investigacion sobre pipelines de visión y lenguaje para cómics: la arquitectura modular y la licencia MIT facilitan experimentar con detectores (por ejemplo, CTD) o modelos de inpaint alternativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la existencia de un script de evaluación (`eval_accuracy.py`) que calcula CER para el OCR y chrF para la traducción, sin aportar cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. En modo stub (fase 1) no requiere GPU ni descarga de modelos; en modo de modelos reales depende de `manga-ocr`, `opus-mt-ja-en` y, opcionalmente, Big-LaMa.
- GPU recomendadas: no disponibles en la informacion proporcionada. El proyecto está pensado para ejecucion local y menciona explicitamente la opcion de modelos libres y locales.
- Compatibilidad con GPU de consumo: no confirmada; la fase de stubs funciona sin GPU, y el modo real no especifica requisitos mínimos.
- Opciones de despliegue: backend FastAPI con uvicorn, CLI propia, interfaz Next.js; integracion opcional con Ollama para evaluacion. No se mencionan vLLM, llama.cpp ni TGI, ya que no se sirve un LLM propio.
- Latencia y throughput: no disponibles.
- Nota de plataforma: en Windows, la instalacion de Torch en rutas largas de `.venv` puede fallar con WinError 206; el autor recomienda un entorno virtual corto como `C:\mtvenv`.

## Comparativa con modelos similares

| Proyecto | Enfoque | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dinamus/manga-translator | Pipeline modular detect + OCR + MT + inpaint con FastAPI y Next.js | JP→EN (fase inicial) | MIT | Hugging Face, codigo en el repositorio |
| manga-image-translator | Motor de traduccion de manga de extremo a extremo | Multiple | No indicada en la informacion | Mencionado como referencia; el autor advierte de no incrustarlo como libreria por su licencia GPL |
| BallonsTranslator | Herramienta de traduccion y edicion de globos | No indicada | No indicada en la informacion | Mencionado como referencia; misma advertencia sobre GPL |
| Dinamus/ml-danbooru-onnx-repo | Etiquetado de imagenes y enrutado de carpetas | No aplica | No indicada | Hugging Face; el autor lo separa explicitamente de este proyecto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La fase inicial solo cubre deteccion, OCR, traduccion y previsualizacion con superposicion; el inpaint y la composicion tipografica de paginas finales corresponden a la fase 2 y pueden no estar completos.
- La direccion de traduccion documentada es japonés→inglés; no se confirman otros pares de idiomas.
- Por defecto el pipeline usa stubs, no modelos reales; es necesario activar `MANGA_TRANSLATOR_REAL_MODELS=1` y configurar los backends de OCR y traduccion para obtener resultados reales.
- La deteccion de texto es heurística (contornos); la integracion de CTD se describe como opcional y futura, lo que puede afectar a la precision en paginas complejas.
- El inpaint con Big-LaMa requiere colocar manualmente `anime-manga-big-lama.pt` en `data/models`; en su ausencia se recurre a OpenCV Telea, con calidad inferior en regiones texturadas.
- La licencia MIT permite uso comercial, pero el autor advierte explicitamente de no incrustar motores GPL como manga-image-translator o BallonsTranslator como librerias; la composicion de pesos Apache/MIT es la via indicada.
- No se documentan sesgos conocidos, tasas de alucinacion ni limites de contexto, al no tratarse de un modelo generativo propio.
- El proyecto no presenta descargas ni likes en Hugging Face en el momento de la consulta, lo que sugiere un ecosistema de validacion limitado.
- La instalacion en Windows puede fallar por rutas largas (WinError 206), lo que exige entornos virtuales cortos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dinamus/manga-translator
- Repositorio relacionado del autor (etiquetado de imagenes): https://huggingface.co/Dinamus/ml-danbooru-onnx-repo
- Modelo OCR referenciado: `manga-ocr`
- Modelo de traduccion referenciado: `opus-mt-ja-en`
- Pesos de inpaint referenciados: `anime-manga-big-lama.pt`
- Motor de referencia (GPL, no incrustar como libreria): manga-image-translator
- Herramienta de referencia (GPL, no incrustar como libreria): BallonsTranslator
