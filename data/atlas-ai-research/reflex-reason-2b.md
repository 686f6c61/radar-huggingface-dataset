# Atlas-AI-research/reflex-reason-2b

## Resumen

Reflex Reason 2B es un adaptador LoRA de tipo "thinking model" publicado por Atlas AI (cuenta de HuggingFace `Atlas-AI-research`) sobre el modelo base `Qwen/Qwen3-VL-2B-Instruct`. Forma parte de Reflex, un agente de navegador local: el modelo observa una captura de pantalla de la pagina junto con su arbol de accesibilidad, razona paso a paso dentro de etiquetas `<think>` y emite exactamente una accion en un bloque de triple comilla invertida (por ejemplo `click [815]` o `type [272] [usb hub]`).

El diseno es de enrutado en dos niveles: un modelo rapido companero, Reflex Instinct 0.6B, resuelve en unos 0,2 s los pasos en los que tiene confianza calibrada, y cuando esa confianza cae por debajo de un umbral de 0,2 el paso se deriva a Reflex Reason, que tarda unos segundos pero ve la pagina. Segun el autor, este enrutado alcanza un 52,4 % de acierto de paso frente al 26,8 % de Instinct en solitario, llamando a Reason en el 59 % de los pasos.

El modelo esta especializado en un unico dominio (automatizacion web sobre arboles de accesibilidad WebArena/BrowserGym) y solo declara ingles. El repositorio pesa 0,1 GB porque contiene unicamente el adaptador, no los pesos completos: para usarlo hay que cargar el modelo base de 2.000 millones de parametros y fusionar el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank 32, alpha 64) sobre las proyecciones de atencion y MLP del modelo de lenguaje de Qwen3-VL-2B-Instruct; transformer multimodal vision-language |
| Parametros totales | 2.000 millones en el modelo base, mas los parametros del adaptador (no cuantificados en la informacion proporcionada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana nativa declarada; el autor indica que los prompts de entrenamiento llegaron hasta 7.168 tokens y recomienda recortar paginas largas por lineas completas |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el adaptador en safetensors; el autor no distribuye versiones cuantizadas) |
| Idiomas soportados | ingles (unico idioma declarado) |
| Licencia | openrail |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

Reflex Reason 2B no es un modelo entrenado desde cero: es un adaptador LoRA de rank 32 y alpha 64 aplicado sobre las proyecciones de atencion y MLP del modelo de lenguaje de `Qwen/Qwen3-VL-2B-Instruct`, un transformer multimodal que procesa texto e imagenes. El adaptador se entreno durante 1.244 pasos, lo que segun el autor supuso 6,9 horas en una unica RTX 5070. El modelo consume dos modalidades de entrada: el arbol de accesibilidad de la pagina en formato WebArena/BrowserGym (una linea por elemento como `[id] role 'name' properties`, indentado por profundidad) y, opcionalmente, una captura del viewport redimensionada a 1024x640 con relleno negro (no estirada), que se tokeniza en 640 tokens de imagen. La imagen se inserta al principio del turno de usuario con los marcadores `<|vision_start|><|image_pad|><|vision_end|>`.

Los datos de entrenamiento combinan tres conjuntos: `osunlp/Multimodal-Mind2Web` (captura mas arbol), `stanfordnlp/nnetnav-live` y `stanfordnlp/nnetnav-wa` (solo arbol). El autor advierte que las etiquetas de NNetNav son ruidosas porque provienen de un explorador basado en un LLM, de modo que un paso suele admitir varias acciones razonables y la registrada es solo una de ellas. No se documentan fases de RLHF o DPO. La innovacion principal no esta en la arquitectura, sino en el formato de salida (razonamiento explicito seguido de una unica accion parseable) y en el enrutado por confianza calibrada entre este modelo y Reflex Instinct 0.6B.

## Capacidades

- Generacion de acciones web: produce exactamente una accion por turno entre `click [id]`, `type [id] [texto]`, `select [id] [opcion]`, `hover [id]`, `press [key_comb]`, `scroll [down|up]`, `goto [url]`, `go_back`, `go_forward`, `new_tab`, `tab_focus [index]`, `close_tab` y `stop [respuesta]`.
- Razonamiento explicito en modo pensamiento: escribe su cadena de razonamiento dentro de `<think>...</think>` antes de emitir la accion, lo que permite auditar la decision.
- Percepcion multimodal: lee el arbol de accesibilidad y, opcionalmente, una captura de pantalla a 1024x640 (640 tokens de imagen).
- Seguimiento de estado multi-paso: recibe `task:`, `url:`, `history:` (una accion previa por linea) y `page:`, de modo que puede encadenar pasos y evitar repetir acciones.
- Manejo de tareas imposibles: soporta la accion `stop [N/A]` cuando la tarea no es realizable en la pagina.
- Multilingue: solo ingles declarado.
- Tool calling generico, function calling, agentes fuera del dominio web, vision de imagenes naturales, audio o generacion de codigo: no documentado por el autor.

## Casos de uso

- Agente de navegador local con enrutado por confianza: desplegar Reason como el "pensador" de un sistema de dos modelos donde Instinct 0.6B resuelve a ~0,2 s los pasos de alta confianza y Reason interviene en el 59 % de los pasos restantes; segun el autor, esta configuracion eleva el acierto de paso del 26,8 % al 52,4 %.
- Automatizacion de tareas web repetitivas: rellenar formularios, aplicar filtros de catalogo o completar flujos de compra en intranets y paneles internos, aprovechando que el modelo trabaja sobre el arbol de accesibilidad y no sobre coordenadas de pixeles, lo que lo hace mas robusto frente a cambios de diseno.
- QA y pruebas end-to-end de aplicaciones web: usar el modelo como conductor de pruebas funcionales que navega por la interfaz y verifica que los elementos existen y son operables, leyendo los identificadores `[id]` directamente del arbol de accesibilidad.
- Extraccion de datos mediante navegacion: recorrer listados paginados, abrir fichas de producto y acumular informacion, usando `history:` para no repetir pasos y `stop [respuesta]` para cerrar la tarea con un resultado.
- Rellenado de formularios con datos sensibles en local: al ser un adaptador de 2.000 millones de parametros ejecutable en una GPU de consumo, permite procesar capturas y arboles de paginas internas sin enviar nada a la nube.
- Asistencia a la navegacion para usuarios con movilidad reducida: traducir una instruccion en lenguaje natural a una secuencia de acciones concretas sobre la pagina, ya que la salida en `[id]` es directamente ejecutable por un driver.
- Investigacion en computer-use y calibracion de confianza: el modelo y su companero permiten estudiar politicas de enrutado, umbrales de confianza y compensacion entre latencia y precision en agentes web.
- Construccion de agentes de automatizacion de back-office: procesar tareas administrativas en portales WebArena/BrowserGym, donde el autor reporta un 29,0 % de acierto de paso completo con solo el arbol de accesibilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre pasos apartados despues de 1.244 pasos de entrenamiento (6,9 horas en una RTX 5070):

| Conjunto | Pasos | Operacion | Elemento | Paso completo | Latencia p50 |
|---|---|---|---|---|---|
| Multimodal-Mind2Web (captura + arbol) | 100 | 98 % | 77 % | 76 % | 3,6 s |
| NNetNav live web (solo arbol) | 81 | 55,6 % | 42,0 % | 34,6 % | 6,9 s |
| NNetNav WebArena sites (solo arbol) | 69 | 43,5 % | 33,3 % | 29,0 % | 5,5 s |

Enrutado Instinct + Reason sobre 250 pasos apartados:

| Configuracion | Acierto de paso | Llamadas a Reason | Latencia |
|---|---|---|---|
| Reflex Instinct 0.6B en solitario | 26,8 % | 0 % | ~0,2 s por paso |
| Enrutado Instinct + Reason (umbral de confianza 0,2) | 52,4 % | 59 % de los pasos | no disponible como media agregada |

Advertencias del propio autor sobre estas cifras: la evaluacion sobre Multimodal-Mind2Web usa un 5 % de las tareas reservado de su split de entrenamiento, por lo que los sitios web pueden solaparse con los de entrenamiento, y las paginas se recortaron a una ventana del arbol que contiene el objetivo; no es el benchmark oficial cross-website de Mind2Web. Ademas, las etiquetas de NNetNav son ruidosas al proceder de un explorador LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,1 GB; el modelo base de 2.000 millones de parametros en bf16 ronda los 4-5 GB de pesos, y sumando activaciones y el codificador visual el consumo razonable se situa en torno a 6-8 GB. Es una estimacion, no un dato publicado por el autor.
- GPU de entrenamiento: el autor entreno el adaptador en 6,9 horas sobre una unica RTX 5070.
- GPU de consumo: por tamano, el modelo cabe en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4090, RTX 5070). La VRAM exacta minima no esta publicada.
- GPU de centro de datos: A100, H100 o L40S son suficientes y quedan sobredimensionadas para un modelo de este tamano; su interes estaria en servir muchas peticiones concurrentes.
- Opciones de despliegue: el autor documenta y prueba el uso con `transformers` (`AutoProcessor`, `Qwen3VLForConditionalGeneration`) y `peft` (`PeftModel.from_pretrained(...).merge_and_unload()`), con un ejemplo verificado en CPU. Compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta confirmada en la informacion proporcionada, y al tratarse de un adaptador requeriria fusionarlo antes de exportarlo.
- Latencia medida: p50 de 3,6 s en Mind2Web, 5,5 s en sitios WebArena y 6,9 s en NNetNav live web, con hardware no especificado mas alla de la mencion a la RTX 5070 en entrenamiento. Throughput no disponible.
- Generacion: el ejemplo del autor usa `max_new_tokens=384` y decodificacion determinista (`do_sample=False`).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Acierto de paso | Latencia p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Reflex Reason 2B | 2.000 M (base) + LoRA | Captura + arbol de accesibilidad, o solo arbol | 29,0 % - 76 % segun conjunto | 3,6 - 6,9 s | openrail | Adaptador en HuggingFace |
| Reflex Instinct 0.6B | 600 M | no disponible en la informacion proporcionada | 26,8 % (en solitario) | ~0,2 s | no disponible | Modelo companero en HuggingFace |
| Otros modelos de computer-use / web-agent | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros modelos de agente web en la informacion proporcionada, por lo que la unica comparacion fiable es la del propio sistema Reflex.

## Limitaciones y advertencias

- Alcance restringido al dominio web: el modelo esta entrenado para emitir una accion sobre un arbol de accesibilidad en formato WebArena/BrowserGym; fuera de ese esquema de entrada su comportamiento no esta documentado.
- Dependencia del formato: la pagina debe presentarse como una linea por elemento (`[id] role 'name' properties`) indentada por profundidad. Un arbol mal formateado o con identificadores cambiados degrada la salida.
- Solo ingles: el unico idioma declarado es el ingles, tanto en instrucciones como en paginas.
- Riesgo de alucinacion de acciones: el modelo puede generar un identificador `[id]` plausible que no exista en la pagina, por lo que el ejecutor debe validar el identificador antes de actuar y gestionar la accion `stop [N/A]`.
- Umbral de enrutado sensible: el propio autor senala que un umbral de 0,2 empató con la mejor precision y que umbrales mas altos solo incrementan el numero de llamadas a Reason sin mejorar el acierto, lo que hace critica la calibracion de confianza del modelo rapido.
- Benchmarks no comparables directamente: los resultados de Mind2Web no corresponden al benchmark oficial cross-website, y las etiquetas de NNetNav son ruidosas al proceder de un explorador LLM.
- Ruido en los datos de entrenamiento: al haber varias acciones validas por paso en NNetNav, el acierto medido puede subestimar el comportamiento real del modelo.
- Licencia OpenRAIL: permite uso comercial pero impone restricciones sobre usos daninos y obliga a propagar esas restricciones a obras derivadas. Conviene revisar el texto completo de la licencia antes de un despliegue en produccion.
- Es un adaptador, no un modelo completo: su uso exige cargar `Qwen/Qwen3-VL-2B-Instruct` y cumplir tambien la licencia de ese modelo base.
- Cifras de adopcion nulas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2 de octubre de 2026, por lo que no existe validacion externa independiente de los resultados publicados.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces encontrados corresponden a entidades homonimas (operadores de competencias, marcas de ropa y muebles) sin relacion con Atlas AI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Atlas-AI-research/reflex-reason-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo companero Reflex Instinct 0.6B: https://huggingface.co/Atlas-AI-research/reflex-instinct-0.6b
- Dataset Multimodal-Mind2Web: https://huggingface.co/datasets/osunlp/Multimodal-Mind2Web
- Dataset NNetNav WebArena: https://huggingface.co/datasets/stanfordnlp/nnetnav-wa
- Dataset NNetNav live web: https://huggingface.co/datasets/stanfordnlp/nnetnav-live
- Referencia arXiv incluida en los tags (titulo no disponible en la informacion proporcionada): https://arxiv.org/abs/2410.02907
