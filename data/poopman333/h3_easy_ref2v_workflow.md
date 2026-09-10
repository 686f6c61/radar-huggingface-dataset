# PoopMan333/H3_Easy_Ref2V_Workflow

## Resumen

Este repositorio no contiene un modelo de red neuronal, sino un conjunto de dos flujos de trabajo (workflows) en formato JSON para ComfyUI, orientados a facilitar la generación de vídeo con referencia de imagen (Ref2V) sobre el modelo MiniMax H3. Lo publica el usuario PoopMan333 bajo el identificador `H3_Easy_Ref2V_Workflow` y su propósito declarado es automatizar la escritura de prompts para H3 R2V, tarea que, según el autor, condiciona entre el 80 % y el 90 % del resultado final. El repositorio pesa 0,0 GB, lo que confirma que no incluye pesos: solo grafos, notas de configuración y material de ejemplo.

El flujo escanea el vídeo de entrada (si existe) para captionarlo y transcribir su audio, captiona las imágenes de referencia, carga un LLM pequeño a elección del usuario (se recomienda Qwen3-VL 8B en fp8_scaled, o nvfp4 en tarjetas de 12 GB) y redacta el prompt de H3 R2V en el formato correcto según la intención indicada. La variante completa añade además la generación del vídeo con los modelos H3 descargados aparte desde `Comfy-Org/MiniMax-H3`. Se distribuyen dos ficheros: `Nugget_H3_EasyR2V_Full_WF_v03.json` y `Nugget_H3_EasyR2V_Prompter_Only_v03.json`.

Es relevante ahora para quienes ya trabajan con MiniMax H3 en ComfyUI y quieren reducir el coste de iteración: con semilla fija, el flujo evita repetir la transcripción del vídeo y la redacción del prompt si las entradas no cambian, de modo que se puede probar una semilla nueva sin volver a pagar la inferencia del LLM potenciador. La licencia aplicable es la `minimax-h3-community-license`, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: es un grafo de ComfyUI (JSON) que orquesta modelos externos; no define arquitectura propia |
| Parámetros totales | No aplica: el repositorio no contiene pesos (tamaño de 0,0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible: depende del LLM potenciador elegido y de los límites del modelo H3 |
| Tipos de cuantización | fp8_scaled y nvfp4 citados para el modelo potenciador Qwen3-VL 8B; para H3, no disponible |
| Idiomas soportados | No disponible. La transcripción de audio usa faster-whisper, cuyo cobertura idiomática depende del modelo Whisper instalado |
| Licencia | minimax-h3-community-license (`license: other`) |
| Formato de pesos | No aplica: los ficheros del repositorio son JSON de workflow. Los pesos (H3 y el LLM potenciador) se descargan por separado |
| Versión del flujo | v03 (según nombres de fichero) |
| Dependencias de nodos | ComfyUI-Nugget, ComfyUI-KJNodes y, solo en el flujo completo, ComfyUI-PlagueKind-Nodes |
| Modelos externos requeridos | MiniMax H3 desde `Comfy-Org/MiniMax-H3`; LLM potenciador tipo Qwen3-VL 8B |
| Pipeline declarado | video-to-video |
| Descargas / likes | 0 descargas / 8 likes |
| Fecha de creación / actualización | 2026-09-02 / 2026-09-09 |

## Arquitectura y entrenamiento

No hay arquitectura de red que describir: el repositorio es una capa de orquestación construida sobre ComfyUI. Funcionalmente encadena cuatro etapas: (1) análisis del vídeo de entrada, con captioning y transcripción de audio mediante `faster-whisper` instalado en el intérprete de Python propio de ComfyUI; (2) captioning de las imágenes de referencia, lo que permite usarlo también como flujo de imagen a vídeo; (3) carga de un LLM local que recibe el captioning, la transcripción y la intención del usuario para redactar el prompt de H3 R2V en el formato esperado; y (4) en la variante completa, invocación de los modelos H3 para generar el vídeo final.

No se proporciona información sobre datos de entrenamiento, número de tokens, composición del dataset ni procesos de ajuste como RLHF o DPO, porque el repositorio no entrena ningún modelo. La innovación técnica destacable es de ingeniería de flujo, no de modelado: el cacheo condicionado a semilla fija evita repetir la transcripción y la generación del prompt cuando el vídeo, las imágenes y el prompt de usuario no cambian. El propio autor advierte que el flujo no aporta creatividad: solo formatea el prompt, y recomienda mantener resolución y duración contenidas porque parece existir una ventana de contexto arbitraria ligada a las especificaciones del equipo.

## Capacidades

- Generación de prompts de H3 R2V en el formato correcto, a partir de una intención escrita por el usuario y del material de referencia.
- Captioning automático de vídeo y de imágenes de referencia.
- Transcripción de audio del vídeo mediante faster-whisper (opcional, requiere el script de instalación de Nugget).
- Funcionamiento como flujo de imagen a vídeo cuando no se aporta vídeo de entrada.
- Reemplazo de personaje en un clip usando imágenes de referencia.
- Reemplazo simultáneo de fondo y personaje.
- Reemplazo de personaje junto con nueva línea de diálogo.
- Generación de vídeo completa en la variante `Full_WF` (requiere los modelos H3).
- Modo "solo potenciador", que escribe el prompt y permite copiarlo o conectarlo a un grafo H3 propio.
- Reutilización de resultados con semilla fija para abaratar pruebas iterativas.
- No soporta, según el autor, generación autónoma de ideas ni escenas complejas fuera del alcance del modelo H3.

## Casos de uso

- Reemplazo de personaje en metraje existente: se aporta el clip original y una o varias imágenes de referencia, y el flujo construye el prompt que indica a H3 qué persona sustituir y por cuál, incluyendo descripciones diferenciadoras cuando hay varios sujetos en escena.
- Sustitución de fondo y personaje en una sola pasada: útil en posproducción para recolocar una actuación grabada en un plató virtual sin regrabar, aprovechando que el captioning de vídeo y de imágenes alimenta el prompt con ambos elementos.
- Doblaje con cambio de intérprete: el flujo transcribe la línea de diálogo original y la incorpora al prompt, de modo que H3 regenera la escena con otra persona manteniendo el texto hablado.
- Previsualización de reparto (previz): antes de rodar, se prueba cómo quedaría un actor distinto en una escena ya grabada, reduciendo coste de casting y de pruebas en plató.
- Limpieza previa de material para anonimización: sustituir a una persona identificable por una figura neutra, por ejemplo una silueta sin rasgos, antes de publicar el clip.
- Integración en un grafo H3 ya existente: la variante `Prompter_Only` se conecta al pipeline propio del usuario para mejorar la calidad del prompt sin rehacer la configuración de generación.
- Iteración rápida de prompts en producción: con semilla fija, el equipo puede probar variaciones de semilla sin repetir la transcripción ni la inferencia del LLM potenciador, lo que abarata las rondas de ajuste.
- Catalogación de material audiovisual: el captioning de vídeo e imágenes y la transcripción de audio generan metadatos reutilizables aunque no se llegue a generar vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas cuantitativas de calidad, fidelidad de reemplazo, latencia ni throughput. Tampoco se aportan comparativas numéricas frente a otros métodos de reemplazo de personaje. Los únicos datos verificables del repositorio son 0 descargas, 8 likes y un tamaño de 0,0 GB.

## Requisitos de hardware

- El repositorio en sí no necesita GPU: solo almacena ficheros JSON de workflow y material de ejemplo.
- Modelo potenciador: el autor recomienda empezar con Qwen3-VL 8B en fp8_scaled y bajar a nvfp4 en tarjetas de 12 GB, lo que sugiere que la variante fp8_scaled no resulta cómoda en ese nivel de VRAM.
- Modelos H3: el consumo de VRAM no está indicado en la información disponible; debe consultarse la documentación de `Comfy-Org/MiniMax-H3`.
- No se especifican GPU concretas (A100, H100, RTX 4090 u otras) ni si el conjunto cabe en GPU de consumo.
- Despliegue: ComfyUI, con los nodos ComfyUI-Nugget, ComfyUI-KJNodes y, para el flujo completo, ComfyUI-PlagueKind-Nodes.
- Para la transcripción de audio es necesario ejecutar el script de instalación de Nugget, que instala `faster-whisper` en el Python propio de ComfyUI; un `pip install` convencional apunta a otro intérprete y el paquete seguirá apareciendo como ausente.
- Latencia y throughput estimados: no disponibles.
- El autor recomienda limitar resolución y duración, ya que existe una ventana de contexto aparentemente ligada a las especificaciones del equipo y reducir el tamaño de entrada mejora la tasa de éxito.

## Comparativa con modelos similares

| Alternativa | Tipo | Qué aporta | Limitaciones | Licencia |
|---|---|---|---|---|
| Escritura manual de prompts para H3 R2V | Flujo de trabajo manual | Control total sobre el texto y sin dependencia de nodos extra | Consume tiempo por iteración y depende de la habilidad del operador; el autor cifra en un 80-90 % del resultado la calidad del prompt | Sujeta a la licencia de H3 |
| `Prompter_Only_v03` (mismo repositorio) | Workflow de ComfyUI | Solo redacta el prompt y se integra en un grafo H3 propio | No genera vídeo ni aporta creatividad | minimax-h3-community-license |
| `Full_WF_v03` (mismo repositorio) | Workflow de ComfyUI | Transcripción, prompt y generación de vídeo en un único grafo | Requiere más nodos y los modelos H3; escenas complejas siguen siendo difíciles | minimax-h3-community-license |
| Método de reemplazo de personaje con Sam3 | Método citado por el autor | Alternativa sugerida cuando H3 converge al personaje original | No se detallan parámetros, contexto ni licencia en la información disponible | No disponible |

No se dispone de datos de rendimiento comparados entre estas opciones ni frente a otros workflows de potenciación de prompts publicados por terceros.

## Limitaciones y advertencias

- No es un modelo: no se pueden evaluar sesgos, alineación ni calidad de generación intrínseca del repositorio, porque toda la capacidad procede de modelos externos.
- El flujo no aporta creatividad: solo formatea el prompt a partir de la intención del usuario. El autor lo resume como "slop prompt in, slop video out".
- Riesgo de alucinación heredado: el captioning de vídeo e imágenes y la redacción del prompt las realiza un LLM, que puede describir incorrectamente el material de referencia; el autor recomienda revisar el prompt mejorado antes de generar.
- Convergencia indeseada en reemplazo de personaje: si la persona original y la nueva se parecen demasiado, H3 puede volver al sujeto original. El autor sugiere intercalar un paso intermedio, por ejemplo una figura verde sin rostro, o explorar el método con Sam3.
- Escenas complejas: el propio autor reconoce que son muy difíciles de resolver con este flujo.
- Descripciones ambiguas: con más de un sujeto en escena, una descripción detallada (por ejemplo, indicando la prenda) mejora el resultado frente a una referencia genérica.
- Límites de contexto prácticos: parece existir una ventana arbitraria ligada al hardware; conviene reducir resolución y duración.
- Dependencias frágiles: si un paquete de nodos falta, ComfyUI no abrirá el fichero y la opción de bypass no resuelve el problema; hay que instalar, reiniciar y reabrir.
- Instalación de faster-whisper: debe hacerse con el script de Nugget sobre el intérprete de ComfyUI, no con un `pip install` genérico.
- Licencia: `minimax-h3-community-license` (etiquetada como `license: other`). No se detallan en la información disponible las condiciones exactas para uso comercial; es imprescindible revisar el enlace de licencia de MiniMax H3 antes de utilizarlo en producción.
- Adopción muy baja: 0 descargas registradas y 8 likes, con un repositorio actualizado por última vez el 2026-09-09. No hay evidencia de uso en producción.
- Idiomas soportados: no disponibles a nivel de repositorio; dependen del modelo Whisper y del LLM potenciador empleados.
- Los resultados de búsqueda web asociados a esta consulta no contienen información relevante sobre el modelo ni sobre el repositorio: proceden de foros en búlgaro sin relación con MiniMax H3.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/PoopMan333/H3_Easy_Ref2V_Workflow
- Licencia MiniMax H3 Community: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Modelos MiniMax H3 para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Material de ejemplo del autor: https://huggingface.co/datasets/PoopMan333/Examples (rutas `Prompt_Enhancer/full wf view image.PNG`, `Prompt_Enhancer/prompt enhancer only view.PNG`, `Prompt_Enhancer/Character_replacement_example.mp4`, `Prompt_Enhancer/example char replacement.PNG`, `Prompt_Enhancer/example side by side.mp4`, `Prompt_Enhancer/example side by side 2.mp4`, `Prompt_Enhancer/BG_and_Char_Replacement_Example.mp4`, `Prompt_Enhancer/Voice_Line_and_Char_Replacement_Example.mp4`)
- Ficheros de workflow citados: `Nugget_H3_EasyR2V_Full_WF_v03.json` y `Nugget_H3_EasyR2V_Prompter_Only_v03.json` (incluidos en el repositorio)
- Paquetes de nodos requeridos: ComfyUI-Nugget, ComfyUI-KJNodes, ComfyUI-PlagueKind-Nodes (URL no disponible en la información proporcionada)
- Paper, blog o demo oficial: no disponible
