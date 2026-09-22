# mickeyvanolst/trellis-text-coreml

## Resumen

TRELLIS Text Core ML es un paquete de pesos convertidos del modelo de generacion 3D de Microsoft TRELLIS, adaptado para ejecutarse de forma nativa en Apple Silicon y macOS 14 o superior. Lo publica el usuario mickeyvanolst (repositorio mickeyvanolst/trellis-text-coreml) y su proposito concreto es habilitar el modo prompt-a-malla (prompt-to-mesh) del operador Geo Gen dentro de TouchDesigner, mediante el plugin TD Apple ML. No es una aplicacion de generacion autonoma: es un conjunto de 40 paquetes Core ML acompanados del tokenizador CLIP, las licencias y un inventario SHA-256 (bundle.json), con un peso de descarga de aproximadamente 3,28 GB.

El bundle encadena el codificador de texto CLIP ViT-L/14, un flujo y decodificador de forma gruesa, un flujo de detalle disperso, un decodificador de malla y un decodificador de apariencia gaussiano. El helper nativo se encarga del muestreo, el enrutado disperso, la extraccion con FlexiCubes, la eliminacion de fragmentos, la simplificacion de malla, el renderizado de apariencia y el horneado de UV. Todo el pipeline se ejecuta sin runtime de inferencia Python dentro del operador de TouchDesigner.

La relevancia del proyecto es practica: traslada un modelo de investigacion text-to-3D a un formato compilado (Core ML, generado con coremltools 9.0) que se integra en un flujo de trabajo creativo en tiempo real sobre hardware de consumo Apple. Como contrapartida, la equivalencia numerica completa con el pipeline CUDA original no esta establecida, el bundle solo funciona dentro de una release AML compatible y las mallas generadas son aproximadas, sin garantia de ser estancas o imprimibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de generacion 3D en varias etapas: codificador de texto CLIP ViT-L/14, flujo/decodificador de forma gruesa (coarse shape flow/decoder), flujo de detalle disperso (sparse detail flow), decodificador de malla (FlexiCubes) y decodificador de apariencia gaussiano |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (el codificador de texto es CLIP ViT-L/14; la documentacion del bundle no especifica limite de tokens) |
| Tipos de cuantizacion | no disponible como esquema cerrado; la conversion uso precision mixta del modelo origen con atencion explicita en float32 |
| Idiomas soportados | no disponible (no se documenta cobertura multilingue; los ejemplos de prompt de la model card estan en ingles) |
| Licencia | MIT (TRELLIS, Microsoft Corporation; CLIP, OpenAI). La conversion no altera las licencias originales. Las librerias nativas de geometria se distribuyen y atribuyen por separado con el plugin AML |
| Formato de pesos | Core ML: 40 paquetes (.mlpackage), tokenizador CLIP, inventario SHA-256 en bundle.json; ~3,28 GB de descarga, 3,3 GB de repositorio |

## Arquitectura y entrenamiento

El bundle no introduce pesos nuevos ni ajuste fino: es una conversion directa de pesos de TRELLIS a Core ML. Las revisiones de origen declaradas son microsoft/TRELLIS-text-large (4aad9f4a110329a410974d7f41ce5333a9a1fc87) para el flujo de texto, JeffreyXiang/TRELLIS-image-large (25e0d31ffbebe4b5a97464dd851910efc3002d96) para los decodificadores de forma, malla y apariencia, y openai/clip-vit-large-patch14 (32bd64288804d66eefd0ccbe215aa642df71cc41) para el codificador y tokenizador de texto. El pipeline completo requiere toda la carpeta: codificador de texto, forma gruesa, detalle disperso, decodificador de malla y un decodificador de apariencia separado.

La conversion se realizo con coremltools 9.0, aplicando atencion en float32 explicita donde era necesario y precision mixta procedente del modelo original. El helper nativo selecciona rutas de computo CPU/GPU ya probadas para cada paquete; modificar esas rutas puede producir resultados incorrectos. Las semillas aleatorias nativas son repetibles dentro de esta implementacion, pero no reproducen el flujo de ruido de NumPy, y la equivalencia completa con el pipeline CUDA original no se ha establecido. La extraccion de superficie usa FlexiCubes sobre una superficie aprendida de 256³, con posterior eliminacion de fragmentos, simplificacion y horneado de UV. Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se detallan en la informacion disponible y corresponden a los modelos TRELLIS originales.

## Capacidades

- Generacion de malla 3D a partir de un prompt de texto dentro de TouchDesigner, con extraccion de superficie aprendida a 256³ mediante FlexiCubes.
- Control de calidad/tiempo mediante parametros de muestreo: pasos de forma, pasos de detalle, nivel de detalle de malla y resolucion de textura (por defecto 8 pasos de forma, 8 de detalle, malla estandar y textura 1024²).
- Decodificacion de apariencia separada: color y albedo se obtienen del decodificador gaussiano de apariencia, muestreando albedo por texel a partir de vistas de apariencia renderizadas, y no de los canales auxiliares de color de la cabeza de malla.
- Salida de normales geometricas de la superficie (no normales de detalle).
- Horneado de UV y renderizado de apariencia integrados en el helper nativo.
- Simplificacion de malla con objetivo configurable: el ajuste Standard apunta a un maximo de 60.000 triangulos y a un cuarto del recuento original, con un limite de error geometrico que puede conservar mas triangulos si es necesario.
- Eliminacion de fragmentos desconectados con umbral configurable: el tamano minimo de pieza por defecto es el 0,1% del recuento de triangulos de la pieza conectada mayor, y puede ponerse a 0 para conservar detalles pequenos separados.
- Reproducibilidad de semilla dentro de la implementacion nativa (no equivalente al flujo de ruido de NumPy).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento.

## Casos de uso

- Prototipado rapido de assets 3D en instalaciones interactivas: el operador genera una malla desde un prompt directamente en la red de TouchDesigner, sin salir del entorno ni usar un runner Python, lo que permite iterar sobre la forma antes de exportar.
- Visuales generativos en directo para VJ y espectaculos: con 8 pasos de forma y 8 de detalle y una textura de 1024², el flujo por defecto esta pensado para uso interactivo en un equipo de desarrollo Apple Silicon, no para produccion masiva por lotes.
- Previsualizacion de concepto en pipelines de modelado: se pueden generar varias mallas cambiando la semilla y usar la vista previa gruesa cuando el resultado supera los limites del helper, para decidir que variante modelar en serio despues.
- Integracion en herramientas de diseno grafico y motion: la salida incluye UV horneadas y albedo por texel, por lo que la malla puede texturizarse y renderizarse en el resto del pipeline grafico convencional.
- Generacion de props para escenas de videojuego o VR en fase de blockout: el ajuste de malla Standard (hasta 60.000 triangulos, un cuarto del recuento original) ofrece presupuestos de poligonos manejables para escenas de prueba.
- Demostraciones y docencia sobre text-to-3D en hardware de consumo: el bundle funciona en un Apple M4 con 24 GB de memoria y no requiere GPU NVIDIA ni CUDA, lo que simplifica montar talleres y pruebas sobre portatiles.
- Exploracion de variaciones de diseno con control de detalle: subir pasos o resolucion de textura intercambia tiempo y memoria por calidad, util para comparar configuraciones en un estudio pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida de rendimiento aportada es una latencia de generacion: un prompt `a mouse` con semilla 42 tardo 112,5 segundos dentro de TouchDesigner en un Apple M4 con 24 GB de memoria, con los modelos ya cargados. La primera compilacion Core ML tarda mas. Es una medicion de maquina de desarrollo y no una garantia de velocidad para otros prompts o equipos.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 14 o superior. El bundle es Core ML, por lo que no hay soporte de CUDA ni de GPU NVIDIA documentado.
- Memoria: medicion de referencia en un Apple M4 con 24 GB de memoria. No se especifica un minimo oficial de memoria unificada.
- VRAM estimada: no disponible; no se publican cifras de memoria por cuantizacion. El peso de descarga del bundle es de aproximadamente 3,28 GB, pero el pico de memoria durante la generacion no se documenta.
- GPU recomendadas: no disponible como lista. El unico hardware mencionado en la informacion es el Apple M4 (24 GB).
- Cabe en GPU de consumo: si, en el sentido de que se ejecuta en hardware Apple Silicon integrado; no se documenta su uso en GPUs discretas de consumo.
- Opciones de despliegue: TouchDesigner con el plugin TD Apple ML (AML), seleccionando Geo Gen, Input, Prompt, y luego Manage Models, TRELLIS Text, Download. Alternativa: descargar el repositorio manteniendo la estructura de directorios y configurar Prompt Model Folder. El helper nativo utiliza rutas de computo CPU/GPU previamente probadas por paquete. No se soportan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: 112,5 segundos por generacion (`a mouse`, semilla 42, ajustes por defecto, modelos cargados, Apple M4 24 GB). Sin cifras de throughput por lote ni de latencia con otros ajustes.
- Limites del helper: como maximo 32.768 celdas de detalle ocupadas y 8.192 tokens de atencion agrupados. Si se superan, el helper devuelve error en lugar de truncar; en ese caso hay que cambiar de semilla o usar la previsualizacion gruesa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trellis-text-coreml (este bundle) | no disponible | no disponible | Sin benchmarks publicados; 112,5 s por generacion en Apple M4 24 GB (prompt `a mouse`, semilla 42) | MIT (TRELLIS y CLIP) | HuggingFace, solo en formato Core ML, requiere TouchDesigner + AML |
| microsoft/TRELLIS-text-large (origen) | no disponible | no disponible | no disponible en la informacion proporcionada | MIT | HuggingFace, pesos originales para pipeline CUDA |
| JeffreyXiang/TRELLIS-image-large (origen de decodificadores) | no disponible | no disponible | no disponible en la informacion proporcionada | MIT | HuggingFace; modo imagen a 3D |
| TripoSR / SF3D (descargas alternativas de AML) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Descargas solo de imagen; no aportan los modelos de este bundle |

## Limitaciones y advertencias

- La generacion es aproximada: las mallas pueden presentar aberturas u otros defectos y no se garantiza que sean imprimibles ni estancas (watertight).
- El bundle no es una aplicacion de generacion autonoma. Los paquetes Core ML por si solos no generan nada; se requiere el helper nativo y una release de AML compatible.
- Es obligatorio conservar la estructura de directorios completa (codificador de texto, forma gruesa, detalle disperso, decodificador de malla y decodificador de apariencia). Las descargas de TripoSR/SF3D solo de imagen no sustituyen a estos modelos.
- Limites duros del helper: 32.768 celdas de detalle ocupadas y 8.192 tokens de atencion agrupados. Al superarlos se produce un error, no un truncado, por lo que hay que cambiar de semilla o usar la previsualizacion gruesa.
- La equivalencia completa con el pipeline CUDA original no esta establecida. Las semillas nativas son repetibles dentro de esta implementacion, pero no reproducen el flujo de ruido de NumPy.
- Modificar las rutas de computo CPU/GPU seleccionadas por el helper puede provocar resultados incorrectos; son rutas probadas y no parametros libres.
- Idiomas soportados: no disponible. No hay declaracion de cobertura multilingue y los ejemplos de la model card estan en ingles.
- No se documentan sesgos del modelo ni evaluaciones de sesgo; tampoco hay datos sobre tasa de alucinacion geometrica o fallos por tipo de prompt.
- Licencia MIT para TRELLIS (Microsoft) y CLIP (OpenAI), con uso comercial permitido por esas licencias. Las librerias nativas de geometria se distribuyen y atribuyen aparte con el plugin AML, por lo que su licencia debe revisarse por separado.
- El rendimiento indicado (112,5 s) es una medicion de una sola maquina de desarrollo con los modelos ya cargados; la primera compilacion Core ML tarda mas. Aumentar pasos, detalle de malla o resolucion de textura incrementa tiempo y memoria.
- Advertencia de disponibilidad: el repositorio aparece con 0 descargas y 0 likes, publicado el 22 de septiembre de 2026 segun los metadatos, lo que sugiere un artefacto muy reciente y poco validado por la comunidad.
- No hay datos de benchmarks comparativos con otros sistemas text-to-3D en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/mickeyvanolst/trellis-text-coreml
- Modelo base (flujo de texto): https://huggingface.co/microsoft/TRELLIS-text-large
- Modelo base (decodificadores de forma, malla y apariencia): https://huggingface.co/JeffreyXiang/TRELLIS-image-large
- Modelo base (codificador y tokenizador de texto CLIP): https://huggingface.co/openai/clip-vit-large-patch14
- Ficheros de licencia incluidos en el bundle: TRELLIS-LICENSE.txt (Microsoft Corporation, MIT) y CLIP-LICENSE.txt (OpenAI, MIT)
- Recetas de conversion: carpeta labs/trellis-text del proyecto TD Apple ML (no se proporciona URL publica en la informacion disponible)
- Busqueda web realizada: sin resultados relevantes; los enlaces devueltos corresponden a la portada y paginas comerciales de Reddit, sin relacion con el modelo
