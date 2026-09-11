# IXDLI/AIRO-Doffy-DP-joint-beaver-contact-vision-15mm

## Resumen

AIRO-Doffy-DP-joint-beaver-contact-vision-15mm es un modelo de robótica publicado por el usuario IXDLI en HuggingFace, etiquetado con el pipeline `robotics` y la librería PyTorch. Por su denominación y por la descripción de la model card, se trata de una política de control tipo Diffusion Policy (DP) que se ejecuta sobre un brazo robótico y fusiona en la misma representación de observación características RGB, siete valores articulares, 144 contactos binarios de sensores táctiles Beaver y nueve indicadores de presencia. El modelo incorpora explícitamente información de contacto con un umbral de 15 mm: las distancias válidas, finitas y no negativas hasta 15 mm inclusive se interpretan como contacto.

El problema que aborda es el control visuotáctil de manipulación: en lugar de depender exclusivamente de la visión, la política condiciona sus acciones sobre señales de contacto densas, lo que resulta relevante en tareas donde la oclusión, la precisión subcentimétrica o la detección de contacto físico son críticas. El horizonte de observación es de dos pasos, lo que implica que la política consume un historial corto de observaciones multimodal.

La información pública es muy limitada: no se especifican parámetros totales, longitud de contexto, licencia, idiomas ni resultados de benchmarks, y el repositorio, de 14,2 GB, no registra descargas ni interacciones. Esto lo convierte en un artefacto de investigación o de despliegue interno más que en un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DP) segun la denominacion del autor; detalles de la red no disponibles |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible; horizonte de observacion de 2 pasos |
| Tipos de cuantizacion | no disponible (pesos PyTorch sin cuantizar documentados) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`); artefacto principal `last.pt` con SHA-256 `cbbe6d24a7ad7ac34055baa679bf9bbd7a1a6da642b76232f2ffff246f7122d7` |
| Autor | IXDLI |
| Pipeline | robotics |
| Espacio de observacion | RGB + 7 valores articulares + 144 contactos binarios Beaver + 9 indicadores de presencia |
| Umbral de contacto | 15 mm (distancias finitas no negativas <= 15 mm se consideran contacto) |
| Tamano del repositorio | 14,2 GB |
| Fecha de creacion | 2026-09-11 |
| Fecha de actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como "Native DP", es decir, una Diffusion Policy que concatena directamente las modalidades de entrada en lugar de tratar cada una por separado. La observación nativa combina características RGB, siete valores articulares, 144 contactos binarios procedentes de sensores Beaver y nueve indicadores de presencia, con un horizonte de observación de dos pasos. El umbral de contacto se fija en 15 mm. No se detalla en la información disponible ni el backbone concreto (UNet, transformer u otro), ni el número de pasos de difusión, ni el espacio de acciones, ni el número de parámetros.

En cuanto al entrenamiento, la model card indica que se utilizó una GPU y ocho CPUs, con un tamano de lote de 32 y seguimiento en línea mediante Weights & Biases. El entrenamiento finaliza a los 100.000 pasos. No se especifica el número de tokens o episodios, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO (no aplicables habitualmente en este tipo de políticas, pero no confirmado). Los artefactos y el código fuente se encuentran en el directorio `checkpoints/` del repositorio. El único control de integridad documentado es el hash SHA-256 del fichero `last.pt`.

## Capacidades

- Generación de acciones de control para un brazo robótico de 7 grados de libertad a partir de observaciones multimodales.
- Fusión visuotáctil: combina imágenes RGB con 144 señales de contacto binarias de sensores Beaver.
- Detección de contacto con umbral configurable documentado en 15 mm.
- Interpretación de nueve indicadores de presencia, presumiblemente asociados a la detección de objetos o estados del entorno.
- Procesamiento de un historial de observación de dos pasos, lo que permite capturar información temporal de corto plazo.
- Condicionamiento conjunto de visión, propiocepción articular y tacto en una sola representación ("native DP concatenation").
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Ensamblaje con contacto físico: la política puede guiar inserciones y ajustes donde la señal de contacto de los 144 sensores Beaver aporta información que la visión no resuelve por oclusión, usando el umbral de 15 mm para decidir cuándo se ha establecido contacto.
- Tareas de tipo "peg-in-hole" y conexión de conectores: la combinación de visión con contactos binarios permite corregir la trayectoria en el momento en que se detecta contacto, reduciendo el riesgo de dañar pieza o herramienta.
- Palpado y exploración táctil: con 144 contactos binarios, el modelo puede ejecutar barridos de superficie y reaccionar a la geometría detectada, útil en inspección o caracterización de objetos.
- Manipulación en entornos con oclusión parcial: al depender también del tacto, el modelo es adecuado para escenas donde la cámara no ve la zona de agarre, como interiores de contenedores o espacios reducidos.
- Automatización de pick-and-place con verificación de presencia: los nueve indicadores de presencia permiten confirmar que el objeto está donde se espera antes y después del agarre.
- Investigación en aprendizaje visuotáctil: sirve como punto de partida o referencia para experimentos de fusión multimodal con políticas de difusión, dado que expone explícitamente el esquema de concatenación de modalidades.
- Despliegue de políticas end-to-end en un banco de robot real: el artefacto `last.pt` es directamente cargable en PyTorch, lo que facilita integrarlo en un bucle de control propio, siempre que el robot replique exactamente el formato de observación descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta hiperparámetros de entrenamiento (una GPU, ocho CPUs, lote de 32, 100.000 pasos) y el hash de integridad de `last.pt`; no incluye tasas de éxito, métricas de tarea ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio pesa 14,2 GB, pero ese tamano puede incluir checkpoints intermedios y otros artefactos, por lo que no permite derivar el número de parámetros ni la memoria necesaria.
- GPU para entrenamiento: la model card indica que se entrenó con una sola GPU, sin especificar el modelo.
- GPU recomendadas: no disponible. No se puede confirmar si cabe en GPU de consumo (RTX 4090, RTX 3090, etc.) al desconocerse el tamano del modelo.
- Opciones de despliegue: la librería declarada es PyTorch, de modo que el despliegue previsible es inferencia nativa en PyTorch cargando `last.pt`. No se documentan integraciones con vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, y estas herramientas no son aplicables a un modelo de robótica de este tipo.
- Latencia y throughput: no disponibles. En políticas de difusión, la latencia depende del número de pasos de denoising y del backbone, ninguno de los cuales se especifica en la información proporcionada.
- Requisitos del sistema: para reproducir el entrenamiento documentado se necesitan una GPU, ocho CPUs y seguimiento opcional en Weights & Biases.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos de rendimiento ni modelos alternativos concretos. La comparativa se limita, por tanto, a la categoría metodológica:

| Modelo | Tipo | Entrada | Licencia | Rendimiento |
|---|---|---|---|---|
| AIRO-Doffy-DP-joint-beaver-contact-vision-15mm | Diffusion Policy visuotáctil | RGB + 7 articulaciones + 144 contactos + 9 presencia | no disponible | no disponible |
| Diffusion Policy (Chi et al.) | Política de difusión basada en visión | Visión (+ opcionalmente propriocepción) | referencia académica | no disponible en la informacion proporcionada |
| ACT (Action Chunking Transformer) | Transformer con chunking de acciones | Visión + propriocepción | referencia académica | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido ni bajo qué condiciones. Es un riesgo legal relevante antes de cualquier despliegue en producción.
- Acoplamiento al hardware: el modelo asume siete valores articulares, 144 contactos Beaver y nueve indicadores de presencia. Cualquier robot que no replique exactamente esta configuración no puede usar el modelo sin readaptación.
- Sin validación comunitaria: cero descargas y cero likes. No hay evidencia pública de reproducción independiente ni de resultados en tareas reales.
- Riesgo de sobreajuste al entorno de entrenamiento: al no documentarse la composición del dataset, se desconoce la diversidad de objetos, iluminación, posiciones y condiciones de contacto cubiertas.
- Generalización limitada: como política específica de tarea, es previsible que no transfiera a tareas o morfologías distintas de las vistas durante el entrenamiento.
- Dependencia del umbral de contacto: el comportamiento está calibrado con un umbral de 15 mm; cambios en la calibración del sensor o en la escala de distancias pueden degradar la política.
- Historial de observación corto: dos pasos de observación limitan la capacidad de razonar sobre dinámicas de largo plazo o tareas con memoria extensa.
- Sin benchmarks publicados: no es posible estimar la tasa de éxito esperada antes de desplegarlo en un banco de pruebas.
- Verificación de integridad: conviene comprobar el SHA-256 de `last.pt` (`cbbe6d24a7ad7ac34055baa679bf9bbd7a1a6da642b76232f2ffff246f7122d7`) antes de cargar el checkpoint en un sistema real.
- No es un modelo de lenguaje: no ofrece generación de texto, razonamiento simbólico, tool calling ni capacidades multilingües.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IXDLI/AIRO-Doffy-DP-joint-beaver-contact-vision-15mm
- Repositorio de artefactos y código fuente: directorio `checkpoints/` dentro del repositorio de HuggingFace.
- Paper, blog, demo o repositorio adicional: no disponible. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a medios de consumo y ofertas comerciales sin relación alguna).
