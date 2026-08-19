# lemuralabs/Muse-Glimmer-30B-GUI-Grounding-Fast

## Resumen

Muse-Glimmer-30B-GUI-Grounding-Fast es un adaptador LoRA ligero desarrollado por lemuralabs sobre el modelo vision-lenguaje Muse-Glimmer-30B de Meta. Su proposito es convertir un VLM agéntico generalista en un modelo especializado de GUI grounding: dada una captura de pantalla y una instruccion en lenguaje natural, devuelve directamente la bounding box del elemento objetivo en formato `[x1, y1, x2, y2]`, sin razonamiento verbose intermedio.

El problema que resuelve es la fiabilidad de salida en bucles de agente: el modelo base tiende a "pensar en voz alta" y enterrar la coordenada entre ~200 tokens de razonamiento, lo que encarece la inferencia y dificulta el parseo. Este adaptador reduce la respuesta a ~5 tokens deterministas, con una tasa de parseo del 99,7 % en ScreenSpot-v2 completo, frente al 63 % del modelo base con prompt simple.

Es relevante ahora porque los agentes de computer-use y automatizacion de GUI necesitan coordenadas de clic exactas y rapidas dentro de bucles de agente, y este adaptador demuestra que un LoRA quirurgico (~0,7 % de parametros, torre de vision congelada) puede convertir un VLM generalista en un grounder de GUI competitivo con modelos especializados de 7B, manteniendo la licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Muse-Glimmer-30B (VLM de Meta) |
| Parametros totales | 30B (modelo base) + adaptador LoRA (~0,7 % de parametros ajustados) |
| Parametros activos | No aplica (no es MoE); el adaptador LoRA ajusta ~0,7 % de los parametros del modelo base |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de uso oficial emplea bfloat16) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PeftModel) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de un solo nodo que ajusta aproximadamente el 0,7 % de los parametros del modelo base Muse-Glimmer-30B, con la torre de vision congelada. El modelo base es un VLM agéntico de Meta que ya localiza elementos de interfaz, pero que tiende a emitir razonamiento verbose antes de proporcionar la coordenada. El adaptador le ensena a responder unicamente con la bounding box normalizada.

El entrenamiento se realizo sobre aproximadamente 40.000 capturas de pantalla unicas (escritorio y movil). El dato mas destacable del proceso es que la diversidad de imagenes fue el factor dominante: un primer intento con solo ~5.000 imagenes de escritorio se sobreajusto y se estanco en un 70,5 % de precision, mientras que ampliar a ~40.000 imagenes unicas (incluyendo movil) elevo la precision al 88,1 % sin aumentar los pasos de entrenamiento. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado con LoRA sobre datos abiertos.

## Capacidades

- GUI grounding: dada una captura de pantalla y una instruccion ("cierra esta ventana", "el icono de ajustes"), devuelve la bounding box del elemento en formato `[x1, y1, x2, y2]` normalizado (0-1).
- Salida determinista y parseable: respuesta de ~5 tokens sin razonamiento intermedio, con tasa de parseo del 99,7 % en el benchmark completo.
- Compatible con plataformas multiples: escritorio (macOS, Windows, Linux), movil (iOS, Android), web, foros y herramientas.
- Soporta objetivos de texto (94,2 % de precision) e iconos (80,3 %).
- Integrable en pipelines de computer-use y agentes de UI mediante transformers + PEFT.
- Reduccion del coste por accion de aproximadamente 10 veces frente al modelo base, al eliminar el razonamiento verbose.

## Casos de uso

- Automatizacion de GUI (RPA): el adaptador puede integrarse en pipelines de automatizacion de escritorio para localizar botones, campos y menus a partir de capturas de pantalla, devolviendo coordenadas exactas de clic sin necesidad de razonamiento adicional.
- Agentes de computer-use: en bucles de agente que requieren multiples acciones por pantalla, la salida directa de ~5 tokens reduce el coste por accion aproximadamente 10 veces frente al modelo base, que emite ~200 tokens de razonamiento.
- Pruebas de interfaz automatizadas: puede verificar que los elementos de una UI se renderizan en la posicion esperada comparando la bounding box predicha con la real.
- Herramientas de accesibilidad: ayuda a usuarios con discapacidad motora a navegar interfaces mediante instrucciones en lenguaje natural, localizando el elemento al que se desea hacer clic.
- Asistentes de soporte remoto: un agente puede guiar al usuario paso a paso por una interfaz, localizando cada elemento de la pantalla que el usuario comparte.
- Automatizacion de flujos web: integrado en un navegador headless, puede localizar elementos en capturas de pantalla de paginas web para rellenar formularios, hacer clic en enlaces o cerrar modales.

## Benchmarks y rendimiento

Resultados en ScreenSpot-v2 completo (1.272 muestras):

| Modelo | Precision | Tasa de parseo |
|---|---|---|
| **Muse-Glimmer-30B-GUI-Grounding-Fast (este modelo)** | **88,1 %** | **99,7 %** |

Diagnostico en subconjunto de 400 muestras (prompt simple "output the box"):

| Configuracion | Precision | Tasa de parseo |
|---|---|---|
| Base Muse-Glimmer-30B (prompt simple) | 39,5 % | 63 % |
| + este adaptador | 87,0 % | 99,8 % |

Precision por plataforma y tipo de objetivo (benchmark completo):

| Categoria | Precision |
|---|---|
| GitLab | 93,2 % |
| macOS | 91,8 % |
| iOS | 90,3 % |
| Foro | 88,6 % |
| Web/tienda | 88,2 % |
| Android | 87,2 % |
| Herramienta | 86,7 % |
| Windows | 81,1 % |
| Texto | 94,2 % |
| Icono | 80,3 % |

Nota: la cifra del 39,5 % del modelo base esta limitada por el harness de evaluacion; con su propio harness agéntico, el base alcanza ~75 %. El adaptador hace que esa capacidad emerja de forma fiable y directa. Los resultados son evaluaciones propias del autor, no un leaderboard verificado oficialmente.

## Requisitos de hardware

- El adaptador LoRA en si es ligero (repositorio de 0,8 GB), pero requiere cargar el modelo base Muse-Glimmer-30B completo.
- En bfloat16, los pesos del modelo base ocupan aproximadamente 60 GB de VRAM, por lo que se necesita al menos una GPU de 80 GB (A100/H100) o una configuracion multi-GPU.
- Con cuantizacion de 8 bits, se reduce a ~30 GB, lo que permitiria ejecutarlo en una A6000 de 48 GB o en dos RTX 4090 de 24 GB con sharding.
- Con cuantizacion de 4 bits, ~15-16 GB, cabria en una RTX 4090 o RTX 3090 de 24 GB.
- Despliegue recomendado: transformers + PEFT (ejemplo oficial del autor); vLLM con soporte de LoRA es una alternativa posible para inferencia en produccion, aunque no esta documentada por el autor.
- Nota: los requisitos de VRAM son estimaciones basadas en el tamano del modelo base (30B); el autor no proporciona cifras oficiales de hardware.

## Comparativa con modelos similares

Resultados en ScreenSpot-v2 (cifras publicadas por el autor; no es un leaderboard verificado oficialmente):

| Modelo | Parametros | ScreenSpot-v2 |
|---|---|---|
| SeeClick | ~9,6B | 54,0 |
| Qwen2-VL-7B | 7B | 66,9 |
| UGround-7B | 7B | 76,5 |
| OS-Atlas-7B | 7B | 87,1 |
| **Este modelo (LoRA sobre Muse-Glimmer-30B)** | 30B | **88,1** |
| UGround-V1 | 7B | 89,4 |
| UI-TARS-7B | 7B | 91,6 |

El adaptador supera a OS-Atlas-7B y Qwen2-VL-7B, es competitivo con UGround-V1 y queda ligeramente por detras de UI-TARS-7B, con la ventaja de ser un LoRA ligero sobre un modelo generalista y con licencia Apache 2.0.

## Limitaciones y advertencias

- Los resultados en ScreenSpot-v2 son evaluaciones propias del autor, no un leaderboard verificado oficialmente; la comparativa con otros modelos usa cifras publicadas por cada uno, no medidas con el mismo harness.
- La precision en Windows (81,1 %) y en iconos (80,3 %) es notablemente inferior a la de texto (94,2 %) y a la de otras plataformas; puede requerir ajuste adicional para esos dominios.
- El adaptador depende del modelo base Muse-Glimmer-30B, que debe descargarse por separado; el repositorio del adaptador solo contiene los pesos LoRA.
- No se dispone de informacion sobre la longitud de contexto, idiomas soportados ni cuantizaciones oficiales del modelo base en la documentacion proporcionada.
- Aunque la licencia del adaptador es Apache 2.0, hay que verificar la licencia del modelo base de Meta para uso comercial.
- No se documentan sesgos especificos, pero como modelo entrenado sobre capturas de pantalla, su rendimiento depende de la diversidad de interfaces vistas durante el entrenamiento; puede degradarse en interfaces muy alejadas de las muestras de entrenamiento.
- El modelo es muy reciente (publicado en agosto de 2026) y cuenta con cero descargas registradas, por lo que su comportamiento en produccion aun no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/lemuralabs/Muse-Glimmer-30B-GUI-Grounding-Fast
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
