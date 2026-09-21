# PeytonT/calisthenics-humanoid-decoder-v2

## Resumen

Calisthenics humanoid decoder v2 es un decodificador compacto de landmarks a malla (landmark-to-mesh) publicado por el usuario PeytonT en HuggingFace. No es un modelo de lenguaje ni un modelo generativo de texto: es un componente de visualización que convierte anclas de pose en una malla humanoides de 7.228 vértices y 14.505 triángulos, con un total de 283.026 bytes de pesos empaquetados. Su función es alimentar el visor de pose de la aplicación CaliCombos, orientada a calistenia, y se ejecuta en el navegador mediante WASM con SIMD y una ruta de respaldo en JavaScript.

La versión 2 corrige la principal limitación de la v1, que derivaba toda la cabeza de un marco de cuello hombro-oreja y por tanto no reaccionaba a la orientación de la nariz. La v2 añade un marco craneal específico definido por centro de oreja, nariz y ambas orejas (hueso 55, índices [72, 0, 3, 4]), lo que permite controlar el cabeceo de la cabeza con independencia de la postura de cuello y cuerpo. Mantiene compatibilidad con la interfaz de 73 anclas de la v1.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, el repositorio ocupa 0,0 GB y la model card no documenta benchmarks de precisión anatómica: las cifras publicadas son errores en espacio de modelo relativos al profesor (teacher-relative), no exactitud anatómica medida. La licencia es sam-license (etiquetada como license: other) y remite a los términos de SAM 3D Body y a los términos de geometría de superficie MHR.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de malla a partir de anclas de pose (no es un transformer de lenguaje, MoE ni SSM) |
| Parámetros totales | no disponible (no se publica recuento de parámetros; los pesos empaquetados ocupan 283.026 bytes) |
| Longitud de contexto | no aplica / no disponible (no procesa secuencias de texto; la entrada es una interfaz de 73 anclas) |
| Tipos de cuantización | no disponible (se distribuyen pesos empaquetados, con rutas nativa/Python, JavaScript empaquetado y WASM que superan comprobaciones de paridad numérica) |
| Idiomas soportados | no disponible (el modelo no procesa texto ni voz) |
| Licencia | sam-license, declarada como license: other, con enlace a https://huggingface.co/facebook/sam-3d-body-dinov3/blob/main/LICENSE |
| Formato de pesos | Tensores empaquetados descritos en manifest.json, con verificación de SHA-256 previa al desempaquetado |
| Mallado de salida | 7.228 vértices y 14.505 triángulos |
| Interfaz de entrada | 73 anclas; control de cabeza en el hueso 55, índices [72, 0, 3, 4] (centro de oreja, nariz, oreja izquierda, oreja derecha) |
| Sistema de coordenadas | x hacia la derecha, y hacia arriba, z hacia el observador |
| Runtime | Ejecución WASM SIMD propiedad de la aplicación, con respaldo en JavaScript |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-21 |

## Arquitectura y entrenamiento

El decoder transforma anclas de pose en geometría de superficie. La v2 introduce un marco de cabeza diferenciado (centro de oreja, nariz, oreja izquierda, oreja derecha) cuyo eje de orejas controla el roll, de modo que el cabeceo puede variar sin alterar cuello ni cuerpo. Los vértices de cabeza requieren un marco facial utilizable: si las anclas de cara faltan o son degeneradas, los vértices del cráneo se retienen en lugar de sustituirse por una cabeza inventada orientada hacia arriba. La aplicación estabiliza además ojos y orejas tomando la nariz como referencia.

El decoder de superficie se destiló a partir de muestras MHR y del ajuste corregido de vídeo completo. La adaptación corporal se mezcla con el decoder anterior y se contrasta con poses sintéticas separadas para limitar regresiones. La model card advierte explícitamente de que el ajuste corregido es una fuente de entrenamiento y que su reproducción constituye una reconstrucción, no una validación independiente sobre superficie de personas reales. Los datos de validación se publican en validation.json. No se especifican en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF o DPO, conceptos que en cualquier caso no aplican a este tipo de modelo.

## Capacidades

- Decodificación de landmarks a malla humanoides: genera una superficie de 7.228 vértices y 14.505 triángulos a partir de la interfaz de 73 anclas.
- Control independiente del cabeceo de la cabeza mediante el marco craneal de la v2; en la v1 ese mismo input producía respuesta nula en los vértices de cabeza.
- Gestión de anclas faciales ausentes o degeneradas: los vértices del cráneo quedan retenidos en lugar de generarse una cabeza ficticia.
- Estabilización de ojos y orejas respecto a la nariz, coordinada con la posición facial.
- Ejecución íntegra en navegador: ruta WASM SIMD y ruta de respaldo en JavaScript, ambas con paridad numérica verificada frente a la ruta nativa/Python.
- Compatibilidad retrocompatible con la interfaz de 73 anclas de la v1.
- Integración de runtime: lectura de manifest.json, verificación de SHA-256 y desempaquetado de tensores; el runtime de CaliCombos realiza la conversión de cámara a pantalla y registra las manos observadas contra las muñecas del cuerpo.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni capacidades multilingües. La información disponible no documenta ninguna de estas funciones.

## Casos de uso

- Visor de pose de calistenia en navegador: el decoder alimenta el visor de CaliCombos con una malla de 7.228 vértices generada a partir de 73 anclas, sin necesidad de servidor de inferencia, lo que permite mostrar la postura del atleta en tiempo real en la propia página.
- Corrección de la forma en ejercicios con componente craneal: al depender el cabeceo de un marco nasal independiente, el visor puede representar correctamente posiciones como el pino o el front lever sin que la cabeza quede bloqueada respecto a la postura del cuello.
- Reconstrucción de superficie en cliente para análisis de vídeo de entrenamiento: la malla se genera localmente en el navegador a partir de anclas ya extraídas, lo que evita enviar vídeo o poses a un backend y reduce requisitos de privacidad y ancho de banda.
- Aplicaciones web con requisitos de peso mínimo: con 283.026 bytes de pesos empaquetados, el modelo es adecuado para entornos donde no es viable descargar checkpoints de varios gigabytes, como demos educativas o herramientas embebidas.
- Despliegue con compatibilidad amplia de navegadores: la ruta WASM SIMD cubre navegadores modernos y el respaldo en JavaScript mantiene la funcionalidad cuando SIMD no está disponible, lo que simplifica la matriz de compatibilidad.
- Prototipado de visualización de malla a partir de anclas 3D: el formato de manifest.json con verificación de integridad permite integrar el decoder en pipelines de investigación que necesiten una superficie ligera sin depender de SAM 3D Body completo.
- Evaluación comparativa de versiones del decoder: el proyecto publica validation.json y métricas de error en espacio de modelo, lo que facilita reproducir la comparación entre v1 y v2 en poses sintéticas controladas.
- Visualización anatómica aproximada en materiales docentes: la malla permite ilustrar la postura estimada en ejercicios de calistenia, siempre que se asuma que la forma corporal individual y la silueta de la ropa no se reconstruyen con exactitud.

## Benchmarks y rendimiento

La información disponible no incluye benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes), ya que el modelo no es un modelo de lenguaje. La model card sí publica errores en espacio de modelo, relativos al profesor y no medidas de exactitud anatómica:

| Evaluación | Métrica | v1 | v2 |
|---|---|---|---|
| 64 poses sintéticas independientes | Error medio de superficie de cabeza (unidades de modelo) | 0,02673 | 0,00155 |
| 64 poses sintéticas independientes | Error medio de superficie corporal (unidades de modelo) | 0,01208 | 0,01199 |
| Reconstrucción del ajuste corregido | Error medio corporal (unidades de modelo) | 0,02277 | 0,01888 |
| Prueba controlada de cabeceo | Respuesta de vértices de cabeza | nula | el movimiento de cabeza no altera el resto de vértices |

No se han publicado resultados de benchmarks estándar en la información disponible. Las cifras anteriores son errores relativos al profesor en espacio de modelo y no deben interpretarse como precisión anatómica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no se distribuye como checkpoint de pesos con cuantizaciones documentadas, sino como tensores empaquetados de 283.026 bytes que se ejecutan dentro de una aplicación web.
- GPU recomendadas: no disponible. La ejecución descrita es en navegador mediante WASM SIMD con respaldo en JavaScript, es decir, sobre CPU del cliente.
- Compatibilidad con GPU de consumo: no aplica según la información disponible; no se documenta ruta CUDA, ROCm ni Metal.
- Opciones de despliegue: navegador con WASM SIMD y ruta JavaScript de respaldo, más una ruta nativa/Python usada para las comprobaciones de paridad numérica. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia equivalentes, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por frame ni de frecuencia de actualización.
- Memoria: los pesos empaquetados ocupan 283.026 bytes, por lo que la huella del modelo es reducida; el consumo total dependerá del runtime de la aplicación anfitriona, sin datos publicados.
- Pruebas de plataforma: el editor se ha probado en Chrome de escritorio en disposición de escritorio y de tamaño de teléfono; los teléfonos reales no se han probado.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calisthenics humanoid decoder v2 | Decodificador de landmarks a malla, ejecución en navegador | 283.026 bytes de pesos empaquetados; malla de 7.228 vértices | 73 anclas, control craneal en hueso 55 | sam-license (license: other) | HuggingFace; 0 descargas, 0 likes |
| Calisthenics humanoid decoder v1 | Decodificador equivalente, versión previa | no disponible | 73 anclas, sin control de cabeceo independiente (respuesta nula en la prueba controlada) | no disponible | Compatibilidad de interfaz declarada con v2; no se aporta enlace |
| SAM 3D Body | Ajuste de cuerpo 3D, profesor usado para destilar | checkpoint de varios gigabytes, según la model card | no disponible en esta información | sam-license, con LICENSE-SAM.txt en el repositorio | https://huggingface.co/facebook/sam-3d-body-dinov3 |
| Geometría de superficie MHR | Fuente de geometría de superficie | no disponible | no disponible | términos MHR, con LICENSE-MHR.txt en el repositorio | Repositorio del autor; no se aporta enlace directo |

La comparación con alternativas de terceros en la misma categoría (decodificadores compactos de malla para navegador) no está disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre modelos comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, de visión o de audio.
- No localiza la cara en una imagen ni corrige una pose de entrada errónea. El decoder solo cambia la visualización de la malla.
- Las métricas publicadas son errores en espacio de modelo relativos al profesor, no exactitud anatómica medida. La model card lo indica de forma explícita.
- El humanoides es una estimación: la forma corporal individual, la silueta de la ropa y la anatomía oculta no se reconstruyen con exactitud.
- El ajuste corregido usado como fuente de entrenamiento se reproduce como reconstrucción, no como validación independiente sobre personas reales.
- Los vértices de cabeza quedan retenidos cuando faltan anclas faciales o son colineales, lo que puede producir huecos visibles en la malla.
- Los teléfonos reales no se han probado; la validación de interfaz se limita a Chrome de escritorio con diseños de escritorio y de tamaño de teléfono.
- La licencia es sam-license, declarada como license: other. Cualquier uso comercial queda sujeto a los términos de SAM 3D Body y a los términos de MHR incluidos como LICENSE-SAM.txt y LICENSE-MHR.txt; no se ofrece en la información disponible una autorización comercial explícita para este decoder derivado.
- El modelo no redistribuye el checkpoint SAM completo, sino un decoder destilado compacto; no se incluyen vídeos fuente, imágenes de revisión, observaciones de entrenamiento por fotograma ni credenciales.
- Estado de adopción nulo en el momento de la consulta: 0 descargas y 0 likes, repositorio de 0,0 GB y sin pipeline declarado, lo que limita la evidencia externa de funcionamiento.
- Riesgo de alucinación en sentido estricto: no aplica a un decodificador de malla, pero sí existe riesgo de geometría plausible y errónea cuando las anclas de entrada son defectuosas.
- No se documentan sesgos demográficos ni evaluación de sesgo; la diversidad de formas corporales representadas depende de las muestras MHR y del ajuste usado en la destilación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PeytonT/calisthenics-humanoid-decoder-v2
- Licencia referenciada (sam-license): https://huggingface.co/facebook/sam-3d-body-dinov3/blob/main/LICENSE
- Repositorio de SAM 3D Body, profesor usado en la destilación: https://huggingface.co/facebook/sam-3d-body-dinov3
- Términos de MHR citados en la model card: LICENSE-MHR.txt, dentro del repositorio del modelo
- Términos de SAM citados en la model card: LICENSE-SAM.txt, dentro del repositorio del modelo
- Detalles de validación: validation.json, dentro del repositorio del modelo
- Manifiesto de pesos y verificación de integridad: manifest.json, dentro del repositorio del modelo
- Resultados de la búsqueda web: no se encontraron enlaces relevantes sobre este modelo; los resultados devueltos trataban sobre envases de aperitivos sin gluten y no guardan relación con el modelo.
