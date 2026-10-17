# JuicyKaraageNo1/kenbunshoku-onepiece

## Resumen

Kenbunshoku One Piece (release B2.1) es un par de modelos ONNX de visión por computador desarrollados por JuicyKaraageNo1 para reconocer cartas del juego de cartas coleccionables One Piece en fotogramas de vídeo de partidas. El sistema combina un detector YOLOX-Nano que localiza cada carta (con clases cara y dorso) y un reconocedor basado en características MobileNetV3-Small que proyecta cada recorte a un vector de 128 valores; ese vector se compara contra un banco de embeddings de 5.489 cartas para decidir qué carta es.

El proyecto es una iniciativa fan no oficial, sin relación con Bandai ni con ningún editor, y se distribuye con licencia Apache-2.0. Forma parte de la extensión de Chrome Kenbunshoku, que muestra el arte oficial de una carta cuando el puntero descansa sobre ella en un vídeo de YouTube o Twitch. No genera imágenes ni incluye arte de cartas: solo lee e identifica.

La relevancia es doble: por un lado demuestra un pipeline completo de detección más recuperación (image retrieval) con modelos muy pequeños (3,7 MB y 4,0 MB) ejecutables en navegador; por otro, publica metadatos de catálogo, grupos de identidad y reglas de aceptación (tau 0,62; delta 0,05) que permiten reproducir decisiones concretas. La documentación indica que fue entrenado con el toolkit cardvision, que aún no es público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos ONNX: detector YOLOX-Nano + reconocedor MobileNetV3-Small con proyeccion a vector de 128 valores |
| Parametros totales | no disponible (pesos: detector 3,7 MB, reconocedor 4,0 MB, fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | fp32 (no se documentan otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (detector.onnx, recognizer.onnx) |

## Arquitectura y entrenamiento

El sistema no es un modelo único sino un pipeline en dos etapas. El detector usa YOLOX-Nano con dos clases (cara de carta y dorso de carta), salida fp32 y 3,7 MB de pesos, que devuelve caja, puntuación y clase para cada carta de la imagen. El reconocedor toma el recorte de cada cara y, mediante características MobileNetV3-Small con una proyección adicional (fp32, 4,0 MB), produce un vector de 128 valores. La etapa final es una búsqueda de vecino más cercano contra bank.json, que contiene un vector por carta calculado a partir de imágenes de cartas (las imágenes en sí no se publican), con 5.489 cartas indexadas.

La decisión de mostrar un nombre se controla con una regla de aceptación explícita en accept.json: umbral tau 0,62, margen delta 0,05 sobre el segundo candidato y reintento con rotación activado. Si la coincidencia no supera ambos criterios, no se muestra nada, lo que reduce falsos positivos en vídeo. El catálogo cubre 5.502 cartas (13 sin arte, por lo que no están en el banco) y se agrupa en 2.816 identidades mediante bank.identity-groups.json, donde una carta y sus reimpresiones cuentan como una identidad; las cartas que solo comparten nombre son identidades distintas y todas las variantes DON!! se agrupan en una sola identidad.

Sobre los datos de entrenamiento, la model card solo ofrece recuentos y es explícita en que no se publica ningún fotograma, imagen ni arte: se mencionan 23 fotogramas etiquetados de vídeos públicos, procedentes de 12 grupos de grabación, etiquetados en dos sesiones. El texto disponible se interrumpe en ese punto, por lo que no se detallan el resto de la composición del dataset, el número de tokens (no aplica) ni si hubo RLHF o DPO. El entrenamiento se realizó con el toolkit open source cardvision (paquete Python cardvision y runtime TypeScript cardvision-browser), que todavía no es público.

La release B2.1 (f80d5b56cd907f03) difiere de la release evaluada B2 (26a98a0f49a74545) únicamente en una entrada de catálogo (OP09-051_p2, cuyo nombre, impresión y facetas se corrigieron), y por tanto en bank.identity-groups.json. Los modelos, los vectores del banco y la regla de aceptación son idénticos byte a byte entre ambas releases.

## Capacidades

- Detección de cartas en fotogramas de vídeo: localiza cajas con caja, puntuación y clase (cara o dorso) mediante YOLOX-Nano.
- Reconocimiento por recuperación: convierte cada cara detectada en un vector de 128 valores y busca la carta más cercana en un banco de 5.489 cartas.
- Regla de aceptación conservadora: solo emite un nombre si la coincidencia supera tau 0,62 y un margen de 0,05 sobre el segundo candidato, con reintento de rotación.
- Agrupación por identidad: 2.816 identidades que tratan una carta y sus reimpresiones como la misma entidad.
- Ejecución en navegador: pensado para ONNX Runtime Web (WebGPU con respaldo WebAssembly) dentro de la extensión Kenbunshoku en YouTube y Twitch.
- Uso como librería ONNX: los dos modelos pueden cargarse en onnxruntime (Python) o cualquier runtime ONNX, con los ajustes fijados en release.json.
- No soporta generación de texto, tool calling, agentes, multilingüismo ni visión general; está especializado exclusivamente en identificación de cartas de One Piece Card Game.

## Casos de uso

- Extensión de navegador para vídeos: al pasar el puntero sobre una carta en un vídeo de YouTube o Twitch, el sistema ejecuta detector y reconocedor en ONNX Runtime Web y muestra el arte oficial de la carta identificada. Es exactamente el escenario para el que se construyó.
- Anotación automática de partidas grabadas: con el pipeline infer (cuando se publique el toolkit) se puede procesar un vídeo completo y generar anotaciones por fotograma con la carta detectada, útil para crear datasets o resúmenes de partidas.
- Indexado y búsqueda de colecciones: dado un banco de embeddings, se puede comparar una foto de una carta contra el catálogo para identificarla, aprovechando los 5.489 vectores ya calculados.
- Verificación de listas de mazo: comprobar automáticamente qué cartas aparecen en una partida frente a una lista declarada, usando las agrupaciones de identidad para tolerar reimpresiones.
- Herramientas para creadores de contenido: generación de superposiciones o subtítulos con el nombre de la carta durante la edición de vídeos de partidas.
- Investigación en recuperación visual: servir de base reproducible para estudiar umbrales de aceptación, márgenes sobre el segundo candidato y agrupaciones de identidad en un dominio cerrado (TCG).
- Aplicaciones móviles o de escritorio de escaneo de cartas: por el tamaño mínimo de ambos modelos (3,7 MB + 4,0 MB), es viable ejecutarlos en dispositivos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las cifras fueron medidas sobre la release B2 y que la release B2.1 no fue remedida, pero el fragmento disponible no incluye la tabla de resultados ni métricas concretas (precisión, recall, mAP, exactitud de reconocimiento).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los pesos suman aproximadamente 7,7 MB en fp32 (detector 3,7 MB + reconocedor 4,0 MB), por lo que la inferencia cabe holgadamente en cualquier GPU con al menos unos cientos de MB disponibles.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo no requiere A100, H100 ni tarjetas de gama alta. En navegador se apoya en WebGPU cuando está disponible.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, incluida una GTX 1050 o una GPU integrada reciente; de hecho está pensado para ejecutarse en el navegador del usuario final.
- Opciones de despliegue: ONNX Runtime (Python), ONNX Runtime Web 1.29.0 (WebGPU con respaldo WebAssembly) y cualquier otro runtime compatible con ONNX. La extensión Kenbunshoku integra ambas partes ya construidas.
- Latencia y throughput: no disponible. No se documentan cifras de latencia ni de fotogramas por segundo para ninguna plataforma.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de métricas comparables para este sistema, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural, el pipeline se apoya en dos arquitecturas conocidas y muy ligeras:

| Aspecto | Kenbunshoku One Piece | Detector genérico YOLOX-Nano | Reconocedor genérico MobileNetV3-Small |
|---|---|---|---|
| Tarea | Detección + recuperación de cartas | Detección de objetos | Clasificación / extracción de características |
| Parametros totales | no disponible (pesos 3,7 MB + 4,0 MB) | no disponible en esta ficha | no disponible en esta ficha |
| Contexto | no aplica | no aplica | no aplica |
| Licencia | Apache-2.0 | no disponible | no disponible |
| Disponibilidad | ONNX público en HuggingFace | según implementación | según implementación |

No se conocen alternativas específicas publicadas para reconocimiento de cartas de One Piece Card Game con las que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Proyecto fan no oficial: no está afiliado ni respaldado por Bandai ni por ningún editor; los nombres y artes de las cartas pertenecen a sus titulares.
- El modelo solo lee cartas: no genera imágenes y no incluye arte de cartas en el repositorio.
- Datos de entrenamiento muy reducidos: se mencionan 23 fotogramas etiquetados en la parte disponible de la model card, lo que sugiere poca cobertura de condiciones de grabación, iluminación, ángulos y resoluciones.
- Posible sesgo hacia los vídeos de los que proceden los fotogramas (12 grupos de grabación), con menor rendimiento en otras fuentes.
- Riesgo de errores de identificación entre reimpresiones o cartas de nombre similar; la agrupación en identidades mitiga parte del problema, pero el sistema puede confundir impresiones distintas de la misma identidad.
- La regla de aceptación (tau 0,62; delta 0,05) prioriza precisión sobre cobertura, por lo que puede no mostrar nombre en casos ambiguos.
- La corrección de identidad introducida en B2.1 (OP09-051_p2) no fue remedida; los pesos y vectores son idénticos, pero un cambio de grupo de identidad puede alterar candidatos o segundos candidatos en otras cartas.
- El catálogo incluye algunas impresiones solo en japonés, pero la model card aclara que eso no implica soporte de cartas japonesas.
- Idiomas: no disponible; la información no especifica soporte multilingüe ni idiomas de aplicación.
- El toolkit cardvision (Python y TypeScript) no es público todavía, por lo que comandos como verify-release o infer no funcionan aún; hoy solo hay dos vías de uso reales (la extensión Kenbunshoku o un runtime ONNX propio).
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero conviene revisar aparte los derechos sobre catálogo, nombres y arte de cartas, que no se incluyen.
- El tamaño del repositorio figura como 0,0 GB en los metadatos de HuggingFace, pese a contener archivos binarios; conviene verificar las sumas SHA256 tras la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JuicyKaraageNo1/kenbunshoku-onepiece
- Dataset de etiquetas: https://huggingface.co/datasets/JuicyKaraageNo1/kenbunshoku-onepiece-labels
- Repositorio de la extensión Kenbunshoku: https://github.com/ryangswe/kenbunshoku
- Sección "Built on cardvision" del repositorio: https://github.com/ryangswe/kenbunshoku#built-on-cardvision
