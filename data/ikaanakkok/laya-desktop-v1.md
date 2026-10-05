# ikaanakkok/laya-desktop-v1

## Resumen

laya-desktop-v1 es una cabeza de decisión (decision head) para agentes de escritorio, publicada por el usuario ikaanakkok como continuación especializada de cklxx/laya-browser v17s. No es un modelo generativo de texto: se trata de un encoder bidireccional mmBERT-base de 322 millones de parámetros con una cabeza de decisión de 2 capas que responde a preguntas tipadas (`choice`, `noul` y `score`) sobre un estado en una sola pasada forward, devolviendo probabilidades calibradas. Forma parte de la familia Laya, un motor de decisiones «System 1» no autorregresivo orientado a agentes y automatización.

El modelo está especializado en operación de escritorio sobre Ubuntu. La observación que recibe es el árbol de accesibilidad AT-SPI serializado como texto TSV (campos `tag / name / text / class / description / position / size`), y las acciones que predice son clicks, escritura, pulsaciones de tecla y scrolls al estilo AT-SPI/xdotool. No utiliza capturas de pantalla en ningún momento: es un modelo puramente textual.

Su relevancia actual radica en que ofrece un componente de decisión ligero y desplegable en hardware modesto (funciona incluso en CPU sobre una Raspberry Pi 5) para bucles de agentes «computer-use», con métricas publicadas sobre un conjunto de validación de 12.076 casos. El checkpoint se publica bajo licencia MIT conservando los avisos de las licencias upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder mmBERT-base (322M) + cabeza de decision de 2 capas, formato `laya_fmt` v3; no autorregresiva |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el estado de entrada es un TSV de accesibilidad de ~1.200 caracteres) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 |
| Idiomas soportados | en (ingles); texto en turco queda fuera de distribucion para esta cabeza |
| Licencia | MIT (con avisos upstream Apache-2.0 conservados) |
| Formato de pesos | safetensors (`model.safetensors`, 643 MB, bf16), mas `encoder/`, `tokenizer/` y `rl_agent_config.json` |

## Arquitectura y entrenamiento

La arquitectura reutiliza el diseño de la familia Laya: un encoder mmBERT-base de 322 millones de parámetros que procesa el estado textual en una única pasada bidireccional, seguido de una cabeza de decisión de 2 capas (`LAYA_HEAD=768`) que produce respuestas tipadas. Las preguntas son de tres clases: `choice` (selección entre opciones), `noul` (sí/no con abstención del tipo «no sé») y `score`. El modelo devuelve probabilidades calibradas, no texto libre. El checkpoint es un reemplazo directo (drop-in) de `v17s/`, con el mismo layout de archivos.

El entrenamiento parte del modelo base `cklxx/laya-browser` v17s y es una continuación RLCD (reinforcement learning from comparative decisions, según la familia Laya) ejecutada en una sola GPU (RX 7800 XT de 16 GB, bf16). Los datos provienen de `gui-wm/agentnet-success-v1`: 34.898 casos (34.686 pasos + 212 DONE) que se expanden a 50.788 ítems por epoch (31.227 de operación y 19.561 de target), con 12.076 ítems de evaluación nunca vistos en entrenamiento. Las aplicaciones cubiertas por el mezcla de datos son VS Code (9.274), LibreOffice Impress (7.845), GIMP (5.010), Chrome (4.926), shell del SO (3.325), LibreOffice Writer (2.624), VLC (1.067) y LibreOffice Calc (827). La configuración del run fue `MICRO=4 ACCUM=8 LAYA_HEAD=768 EPOCHS=2 COMPILE=0 CKPT=1`, con un throughput de ~5,4 ítems/s, ~2,6 h por epoch y un pico de VRAM de 6,7 GB. El estado publicado corresponde a un epoch completo más aproximadamente el 48 % del segundo (el run se detuvo en el ítem 24.292 de 50.788).

Una innovación destacable del diseño es el mecanismo de selección de candidatos: en lugar de dar al modelo el árbol de accesibilidad completo, se emplea una selección por chunks en dos pasadas (chunk de anchura 12 más una final). La cabeza de target actúa como re-ranker de una lista corta, no como selector global.

## Capacidades

- Decisión tipada no autorregresiva: responde a preguntas de tipo `choice`, `noul` y `score` en una sola pasada forward, devolviendo probabilidades calibradas (temperatura T = 1,0225).
- Predicción de operaciones de escritorio: el conjunto de operaciones es CLICK, TYPE_TEXT, SCROLL_DOWN, SCROLL_UP, WAIT, PRESS_ENTER, DONE y BLOCKED.
- Selección de objetivos sobre el árbol de accesibilidad: identifica filas de accesibilidad (ids 1-based) más el rol del elemento objetivo.
- Comprensión de observaciones basadas en AT-SPI: procesa árboles de accesibilidad serializados como TSV con campos de etiqueta, nombre, texto, clase, descripción, posición y tamaño.
- Integración en bucles de agente: pensado como el órgano de decisión de un bucle de agente de escritorio, no como modelo conversacional.
- No genera texto: no es un modelo de chat ni de generación; no produce explicaciones ni razonamiento en lenguaje natural.
- No tiene capacidades de visión: las capturas de pantalla se usan únicamente como material de auditoría, nunca como entrada.
- Sin soporte de tool calling ni function calling en el sentido convencional; la interfaz es la API de preguntas tipadas de la librería `laya`.

## Casos de uso

- Automatización de escritorio sobre Ubuntu: el modelo recibe el árbol AT-SPI de la aplicación activa y decide la siguiente acción (click, escritura, scroll) en un bucle cerrado, sustituyendo a scripts frágiles basados en coordenadas.
- Agentes «computer-use» para tareas ofimáticas: con datos de entrenamiento en LibreOffice Writer, Calc e Impress, puede pilotar la edición de documentos, hojas de cálculo y presentaciones prediciendo operaciones sobre elementos accesibles.
- Asistencia en entornos de desarrollo: dado que incluye 9.274 casos de VS Code, es adecuado para automatizar acciones en el editor (navegación, ejecución de comandos, interacción con paneles) dentro de un pipeline de agente.
- Navegación web controlada desde escritorio: con 4.926 casos de Chrome en el entrenamiento, puede operar sobre páginas en el contexto de una ventana de navegador mediante el árbol de accesibilidad.
- Edición gráfica asistida: los 5.010 casos de GIMP permiten usarlo para secuenciar acciones en un editor de imágenes (selección de herramientas, ajustes) a través de elementos accesibles.
- Automatización del shell del sistema operativo: los 3.325 casos de shell del SO habilitan decisiones sobre ventanas, diálogos y menús del entorno de escritorio Ubuntu.
- Despliegue en hardware de bajo consumo: al ejecutarse en CPU (Raspberry Pi 5, fp32, 4 hilos) con un paso de ~5,1 s, es viable para automatizaciones de bajo volumen o entornos sin GPU.
- Re-ranker de candidatos en pipelines existentes: puede integrarse como etapa de ordenación de listas cortas de elementos cuando un componente previo ya ha reducido el espacio de búsqueda.

## Benchmarks y rendimiento

Resultados sobre el conjunto held-out de 12.076 ítems (nunca usado en entrenamiento):

| Metrica | Valor |
|---|---|
| Precisión de operación | 0.939 (n = 7.069) |
| Target top-1 | 0.231 (n = 5.007; rango normalizado medio 0.260) |
| Calibración | T = 1.0225 (ajustada sobre el mismo split; nll 1.390) |

Desglose por operación gold: CLICK 0.985 (n = 6.704) · TYPE_TEXT 0.190 (n = 189) · SCROLL_UP 0.000 (n = 102) · DONE 0.000 (n = 39) · PRESS_ENTER 0.000 (n = 18) · SCROLL_DOWN 0.000 (n = 17). El autor atribuye los ceros a escasez de muestras (entre 17 y 102 casos por clase), no a un colapso medido. La exportación anterior (epoch 1 + 21 % del segundo) obtuvo 0.929 / 0.217 con T = 0.983.

Sonda en vivo de 80 casos sobre la máquina de entrenamiento: con la lista completa de candidatos (media de 161, máximo 344), el top-1 fue del 2 % (nivel de azar). Restringido a selección por chunks en dos pasadas (chunk 12 + final) alcanza el 13 % (el ganador de chunk correcto aparece en el 34 % de los casos). El 0.231 anterior se mide, por tanto, sobre conjuntos de candidatos restringidos.

Latencia: ~959 ms por pasada en la máquina de entrenamiento con chunking (precisión de operación del 100 % en ese contexto); ~5,1 s por paso completo en Raspberry Pi 5 (CPU, fp32, 4 hilos); decenas de milisegundos en la RX 7800 XT.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos en bf16 ocupa 643 MB; en fp32 son aproximadamente 1,3 GB. Con overhead de activaciones y tokenizer, cabe holgadamente en GPUs de 4 GB o más (estimación a partir del tamaño de pesos, no dato publicado).
- VRAM de entrenamiento: pico de 6,7 GB con la configuración publicada (`MICRO=4`, `CKPT=1`); con `CKPT=0` se produce OOM en 16 GB.
- GPU recomendadas: el autor entrenó en una AMD RX 7800 XT de 16 GB. Para inferencia basta cualquier GPU con 4 GB o más; no se especifican modelos NVIDIA concretos en la información disponible.
- ¿Cabe en GPU de consumo? Sí, con claridad. La carga de pesos en bf16 es inferior a 1 GB, por lo que cualquier GPU de consumo moderna es suficiente.
- CPU: funciona en CPU. Sobre Raspberry Pi 5 (fp32, 4 hilos) un paso completo tarda ~5,1 s, lo que lo hace viable para automatización de baja frecuencia.
- Opciones de despliegue: librería `laya` (`laya.load(...)` + `agent.predict(...)`) y servidor HTTP propio (`python systemone_server.py <puerto> <ckpt> <chunk_width>`, por ejemplo `8792` de puerto y `12` de anchura de chunk). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación disponible.
- Latencia y throughput: ~959 ms/pasada en la máquina de entrenamiento con chunking; decenas de milisegundos en la RX 7800 XT; ~5,1 s por paso en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ikaanakkok/laya-desktop-v1 | 321,9 M | TSV AT-SPI de ~1.200 caracteres | op 0.939 / target top-1 0.231 (held-out) | MIT | HuggingFace |
| cklxx/laya-browser v17s | no disponible | no disponible | no disponible (modelo base del que deriva) | Apache-2.0 | HuggingFace |
| convaiinnovations/laya | no disponible | soporta 100+ idiomas | no disponible | Apache-2.0 | HuggingFace / API alojada |

El modelo es un derivado especializado del head de navegador (`laya-browser v17s`): comparte arquitectura y formato, pero sustituye el canal de observación web por el árbol AT-SPI de escritorio. No hay resultados públicos de benchmarks comparables entre ambos checkpoints en la información disponible, más allá de que el head de navegador está ponderado hacia el turco y este hacia el inglés.

## Limitaciones y advertencias

- Modelo solo texto, sin visión: los elementos sin nombre accesible no pueden ser objetivo; las capturas de pantalla son únicamente material de auditoría.
- Cobertura de aplicaciones limitada: solo ocho aplicaciones de Ubuntu aparecen en la mezcla de entrenamiento (VS Code, LibreOffice Impress/Writer/Calc, GIMP, Chrome, VLC y shell del SO). Cualquier otra queda sin probar.
- Idioma: la interfaz en inglés es la soportada; el texto en turco dentro de una aplicación queda fuera de distribución para esta cabeza (el head de navegador, `laya-browser-v1`, es el ponderado hacia el turco).
- El target head es un re-ranker, no un selector: dado el árbol de accesibilidad completo (media de 161 candidatos, hasta 344), el top-1 cae al 2 %, nivel de azar. No debe alimentarse con el árbol entero; hay que usar selección por chunks.
- La lista corta basada en embeddings del encoder (`laya.shortlist`) no funcionó en este head: recall@20 del 12,5 %, frente al 34 % de una línea base léxica simple.
- Clases con muy pocas muestras: TYPE_TEXT, SCROLL_UP, DONE, PRESS_ENTER y SCROLL_DOWN presentan entre 17 y 102 casos, con precisión de 0.000 en varias de ellas. Cualquier uso productivo de estas operaciones requiere validación adicional.
- Estado de publicación parcial: el checkpoint detenido en el ~48 % del segundo epoch y marcado como `partial: true` en `rl_agent_config.json`.
- Uso prohibido sin verificación humana para autenticación, pagos o acciones irreversibles.
- Riesgo de alucinación de objetivos: dado que el target top-1 es de 0.231 incluso en condiciones restringidas, la selección de elemento es el punto más frágil del bucle.
- Licencia MIT, pero con datos de entrenamiento (`gui-wm/agentnet-success-v1`) sujetos a sus propios términos; conviene revisarlos para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikaanakkok/laya-desktop-v1
- Modelo base: https://huggingface.co/cklxx/laya-browser
- Laya (sitio oficial): https://laya.convaiinnovations.com/
- Repositorio GitHub de Laya: https://github.com/NandhaKishorM/laya
- Laya AI (sitio del modelo): https://laya-model.com/
- Laya AI, guía de inicio: https://laya-model.com/get-started
- Blog en HuggingFace sobre Laya: https://huggingface.co/blog/sora-2/laya-ai-model-how-it-works-run-it-locally-and-eval
