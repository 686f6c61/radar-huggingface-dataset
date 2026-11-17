# BigFashion/big-fashion-week12-models

## Resumen

Big Fashion Week12 — browser models es un repositorio de artefactos ONNX empaquetados por el usuario BigFashion para alimentar una aplicacion web docente (clase "Big Fashion", semana 12). No es un modelo entrenado por el autor: el repositorio redistribuye conversiones a ONNX de dos modelos de vision para moda (un detector YOLOS de Fashionpedia y el codificador visual de FashionCLIP) junto con el analizador morfologico coreano Kiwi compilado a WebAssembly. El objetivo es que toda la inferencia ocurra en el navegador del estudiante, sin enviar imagenes ni texto a servidores externos.

El contenido se organiza en dos variantes de cuantizacion por modelo: `yolos_fp16.onnx` y `yolos_q8.onnx`, y `clip_vision_fp16.onnx` y `clip_vision_q8.onnx` (fp16 y 8 bits respectivamente). Ademas incluye el directorio `kiwi/` con `kiwi-wasm.wasm` y los ficheros de modelo asociados, que corresponden al paquete npm `kiwi-nlp` sin modificaciones.

La relevancia de este repositorio es acotada y practica: sirve como ejemplo de despliegue de modelos de vision ligeros en el cliente mediante ONNX Runtime Web y WASM, con licencias permisivas (MIT para los modelos de vision, Apache 2.0 para Kiwi). No aporta pesos originales ni resultados de benchmarks propios, y el tamano total del repo es de aproximadamente 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOS (detector de objetos tipo transformer) y CLIP vision encoder (ViT); Kiwi es un analizador morfologico basado en reglas y modelos estadisticos, no un transformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de vision; Kiwi no usa contexto de tokens en el sentido de un LLM) |
| Tipos de cuantizacion | fp16 y 8 bits (q8) para los modelos ONNX de vision |
| Idiomas soportados | no disponible en la informacion del repo; Kiwi es especifico de coreano |
| Licencia | mixta: MIT (YOLOS y FashionCLIP) y Apache 2.0 (Kiwi) |
| Formato de pesos | ONNX (fp16 y q8) y WebAssembly (Kiwi) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Agrupa conversiones y redistribuciones de tres componentes:

- **YOLOS Fashionpedia** (`valentinafevu/yolos-fashionpedia`): detector de objetos basado en la arquitectura YOLOS, un transformer de vision que formula la deteccion como prediccion de secuencias de cajas y etiquetas. Exportado a ONNX en fp16 y cuantizado a 8 bits. Entrenado originalmente sobre el dataset Fashionpedia (prendas y atributos de moda). No se detalla en la informacion disponible el numero de tokens ni el procedimiento de entrenamiento original.
- **FashionCLIP** (`patrickjohncyh/fashion-clip`): se incluye unicamente el codificador visual (vision encoder) de un modelo CLIP adaptado al dominio de la moda, exportado a ONNX en fp16 y q8. El codificador de texto no aparece en el listado de ficheros proporcionado.
- **Kiwi**: analizador morfologico coreano distribuido via el paquete npm `kiwi-nlp`, compilado a WebAssembly y sin modificaciones. Se usa para procesamiento de texto coreano en el navegador.

No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF/DPO) en la informacion disponible. La innovacion practica del repo es el empaquetado para ejecucion en cliente (ONNX Runtime Web / WASM).

## Capacidades

- Deteccion de objetos de moda en imagenes (prendas, accesorios y posiblemente atributos segun el etiquetado de Fashionpedia) mediante YOLOS.
- Extraccion de embeddings visuales de imagenes de moda mediante el codificador visual de FashionCLIP, util para busqueda por similitud o clasificacion zero-shot si se dispone de embeddings de texto compatibles.
- Analisis morfologico de texto en coreano mediante Kiwi (tokenizacion, lematizacion y etiquetado gramatical).
- Inferencia completamente en el navegador sin envio de datos a servidores.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni modo thinking.
- No se documenta soporte multilingue mas alla del coreano en Kiwi.

## Casos de uso

- **Aplicacion web docente de moda**: el repositorio esta pensado para servir modelos a una app de clase que corre en el navegador; el estudiante sube una imagen y obtiene detecciones o embeddings sin que la foto salga de su equipo.
- **Deteccion de prendas en el cliente**: usar `yolos_q8.onnx` para localizar y clasificar prendas en fotos de outfits dentro de una pagina web, con un coste de descarga reducido gracias a la cuantizacion a 8 bits.
- **Busqueda visual por similitud**: emplear los embeddings de `clip_vision_fp16.onnx` para indexar imagenes de un catalogo y recuperar prendas visualmente parecidas, calculando distancias coseno en el navegador o en un backend ligero.
- **Prototipado de filtros de moda sin backend**: integrar la deteccion y los embeddings en una demo estatica (GitHub Pages, por ejemplo) para experimentar con clasificacion y filtrado de imagenes sin infraestructura de servidor.
- **Procesamiento de texto coreano en cliente**: usar el modulo `kiwi/` para tokenizar y normalizar consultas en coreano dentro de la misma app, por ejemplo para etiquetar prendas o buscar por descripcion.
- **Ensenanza de despliegue de modelos**: el repositorio sirve como material didactico para mostrar el flujo completo de exportacion a ONNX, cuantizacion fp16/q8 y ejecucion con WASM en el navegador.
- **Evaluacion comparativa de cuantizacion**: comparar `fp16` frente a `q8` en terminos de tamano, latencia y precision en un entorno real de navegador usando los pares de ficheros incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM**: no aplica en el sentido tradicional; la inferencia se ejecuta en el navegador sobre CPU y, si esta disponible, GPU via WebGPU/WebGL. El repo completo ocupa aproximadamente 0,5 GB, pero cada fichero ONNX individual es una fraccion de ese total.
- **GPU dedicada**: no es necesaria. Los modelos estan disenados para ejecutarse en el cliente; el rendimiento dependera del dispositivo del usuario.
- **Consumer GPU**: irrelevante para el caso de uso previsto; cualquier equipo con navegador moderno compatible con ONNX Runtime Web puede ejecutar los modelos.
- **Despliegue**: ONNX Runtime Web (WASM y, opcionalmente, WebGPU), servidor estatico para servir los ficheros `.onnx` y `.wasm`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos artefactos.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Big Fashion Week12 (este repo) | YOLOS + CLIP vision + Kiwi, ONNX/WASM | no disponible | no aplica | MIT + Apache 2.0 | Hugging Face (repo de 0,5 GB) |
| `valentinafevu/yolos-fashionpedia` | YOLOS original (PyTorch) | no disponible | no aplica | MIT | Hugging Face |
| `patrickjohncyh/fashion-clip` | CLIP completo (texto + vision) | no disponible | no disponible | MIT | Hugging Face |
| Kiwi (`kiwi-nlp`) | Analizador morfologico coreano | no disponible | no aplica | Apache 2.0 | npm / GitHub |

La comparativa se limita a las fuentes originales de las que deriva este repositorio, ya que no se dispone de datos de rendimiento ni de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo original**: son conversiones y redistribuciones; cualquier merito o defecto de los pesos corresponde a los autores originales enlazados en la model card.
- **Licencia mixta**: los ficheros de vision son MIT y Kiwi es Apache 2.0; el campo `license` del repo figura como `other` con nombre `mixed-mit-apache-2.0`, por lo que conviene revisar los avisos de cada subdirectorio antes de un uso comercial.
- **Alcance funcional limitado**: no hay generacion de texto, razonamiento ni tool calling; no debe evaluarse como un LLM.
- **Idioma**: Kiwi solo procesa coreano; no se documentan otros idiomas.
- **Sesgos y alucinacion**: no se documentan sesgos especificos; en deteccion de objetos el riesgo equivalente es la clasificacion erronea o la omision de prendas poco representadas en Fashionpedia.
- **Contexto**: no aplica; los modelos de vision no tienen ventana de contexto en tokens.
- **Produccion**: al ejecutarse en el navegador, el rendimiento depende del hardware del usuario y de la compatibilidad del navegador con ONNX Runtime Web; no hay datos publicados de latencia ni de precision tras la cuantizacion q8.
- **Falta de documentacion**: no se indican parametros, composicion del dataset de entrenamiento ni metricas, lo que dificulta una evaluacion cuantitativa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BigFashion/big-fashion-week12-models
- Modelo original YOLOS Fashionpedia: https://huggingface.co/valentinafevu/yolos-fashionpedia
- Modelo original FashionCLIP: https://huggingface.co/patrickjohncyh/fashion-clip
- Kiwi (analizador morfologico coreano): https://github.com/bab2min/Kiwi
- Paquete npm `kiwi-nlp`: no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles
