# dmitchelljackson/cerebellum-08b-scrollvocab-sft

## Resumen

`cerebellum-08b-scrollvocab-sft` es un adaptador QDoRA (LoRA con descomposición de magnitud y dirección, sobre base cuantizada en nf4) entrenado por el usuario `dmitchelljackson` sobre el modelo multimodal `Qwen/Qwen3.5-0.8B`. No es un modelo autónomo: es la capa de ejecución de un diseño de dos niveles en el que un modelo frontera planifica y este adaptador se encarga de la interacción física con la interfaz. Esa división explica su tamaño reducido, pensado para ejecutarse de forma continua con un coste bajo en lugar de para razonar.

El modelo recibe una captura de pantalla con etiquetas Set-of-Mark y el árbol de accesibilidad de Android, y emite una única acción por paso en una gramática compacta (`T <label>` para toques, `S <dir> <label>` para desplazamientos, más tipo/atrás/inicio/espera y señales terminales de finalización o de imposibilidad). Al ser las etiquetas símbolos de un solo token, una acción completa ocupa un par de tokens en lugar de una frase. Los prompts son de episodio completo y de solo adición, de modo que el historial se acumula y el modelo ve lo que ya ha hecho.

Se trata del paso 424 del SFT de la ejecución `som_08b_r128_scrollvocab_20260831`, conservado como punto de reinicio antes de que se ramificaran los experimentos de punteros a elementos visuales. Está entrenado en una única RTX 3060 de 12 GB y hoy se ejecuta en un equipo de desarrollo o servidor de CI que controla un emulador o un dispositivo conectado por adb; ejecutarlo en el propio teléfono es el objetivo a largo plazo, pero el trabajo de latencia y empaquetado aún no se ha realizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal del modelo base `Qwen/Qwen3.5-0.8B` con adaptador QDoRA (LoRA + DoRA); detalles internos del transformer base no disponibles |
| Parametros totales | 0,8B en el modelo base; numero exacto de parametros del adaptador no disponible (rank 128, alpha 256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el autor solo indica que los prompts son de episodio completo y de solo adicion) |
| Tipos de cuantizacion | base en nf4; el adaptador se distribuye en safetensors. No se documentan otros formatos |
| Idiomas soportados | no disponible (la salida es una gramatica de acciones y etiquetas, no texto libre) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); el modelo base se carga cuantizado en nf4 |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3.5-0.8B`, un modelo multimodal de tipo image-text-to-text, mediante la libreria PEFT. La configuracion de entrenamiento es rank 128, alpha 256 y DoRA (una variante de LoRA que descompone la actualizacion de pesos en magnitud y direccion) sobre una base cuantizada en nf4. El ajuste se hizo con SFT sobre tareas de AndroidControl, en una unica RTX 3060 de 12 GB.

La innovacion principal descrita es gramatical: la ejecucion `scrollvocab` introduce una gramatica descompuesta para el desplazamiento, donde la direccion y el objetivo son tokens separados (`S <dir> <label>`), frente al esquema de toque directo (`T <label>`). Ademas del toque y el desplazamiento, el modelo emite acciones de escritura, atras, inicio y espera, junto con senales terminales de finalizacion o de imposibilidad. No se documentan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

Un detalle operativo relevante para quien reutilice el checkpoint: para fusionar el adaptador hay que cargar la base en nf4, descuantizarla y despues aplicar `merge_and_unload`. La model card advierte de que fusionar contra los pesos cuantizados degrada el grounding de forma silenciosa.

## Capacidades

- Prediccion de acciones de interfaz de Android a partir de una captura con etiquetas Set-of-Mark y el arbol de accesibilidad.
- Emision de una unica accion por paso en una gramatica compacta basada en etiquetas de un solo token.
- Toque sobre un elemento etiquetado (`T <label>`).
- Desplazamiento con direccion y objetivo como tokens separados (`S <dir> <label>`).
- Acciones adicionales de escritura, atras, inicio y espera.
- Senales terminales de tarea finalizada o de tarea inviable.
- Seguimiento de episodios completos mediante prompts de solo adicion, de forma que el modelo mantiene visibilidad del historial de acciones ya ejecutadas.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso autonomo, vision general, audio ni modo de pensamiento explicito. El modelo no planifica: ejecuta un paso dado un estado observado.

## Casos de uso

- Automatizacion de pruebas de interfaz en Android: el adaptador actua como motor de accion sobre un emulador controlado por adb, ejecutando secuencias de toques y desplazamientos definidas por un planificador, lo que permite validar flujos de UI de forma repetible en CI.
- Agentes GUI de dos niveles: un modelo frontera descompone el objetivo en pasos y este adaptador los materializa sobre la pantalla; el reparto permite usar un modelo pequeno y barato para la capa que se ejecuta de forma constante.
- RPA sobre aplicaciones moviles: automatizacion de tareas repetitivas (cumplimentar formularios, navegar menus, confirmar dialogos) sobre dispositivos reales o emulados mediante conexion adb.
- Generacion de datos anotados para agentes GUI: al ejecutar politicas sobre AndroidControl o pantallas propias se pueden recolectar trazas de accion etiquetadas para entrenar o evaluar etapas posteriores.
- Granjas de dispositivos en servidores de CI: al caber en una GPU de gama de consumo y en pocos cientos de MB de VRAM, permite levantar muchas instancias en paralelo sobre un unico servidor para pruebas distribuidas.
- Automatizacion de accesibilidad: uso del arbol de accesibilidad como fuente principal de la decision, lo que permite operar sobre elementos semanticos en lugar de depender solo de la posicion en pixeles.
- Evaluacion y regresion de agentes: dado que el autor lo mantiene como punto de reinicio del paso 424, sirve como linea base estable contra la que comparar ramas experimentales posteriores.

## Benchmarks y rendimiento

Resultados de la model card sobre fragmentos reservados de AndroidControl (shards 0 y 1), con coincidencia exacta:

| Metrica | Valor |
|---|---|
| Tap, coincidencia exacta | 73,5% |
| Tap, suelo tras revision humana de los fallos | 81,6% |
| AndroidWorld, 100 tareas reservadas, tarea completa | 51% |

El autor subraya que la diferencia entre las dos primeras filas es relevante: de 36 "fallos" revisados manualmente, solo 9 eran errores reales; el resto eran artefactos del espacio de etiquetas (objetivos duplicados, padre e hijo que cubren el mismo toque, o una ventana emergente cuya fila estaba etiquetada con el widget subyacente). Por eso el 81,6% se presenta como suelo de la precision real de toque, no como cifra ajustada.

Tambien advierte de que la cifra del 51% corresponde a una ejecucion de 100 tareas de AndroidWorld y mide finalizacion de tarea completa, una tarea mucho mas dificil que la precision por paso; las dos cifras no son comparables directamente. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 0,8B de parametros y se carga en nf4; la huella esperada es de aproximadamente 0,5 a 1 GB de VRAM, mas el adaptador. Es una estimacion aritmetica a partir del tamano, no una cifra publicada por el autor.
- Entrenamiento documentado: una sola RTX 3060 de 12 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM deberia ser suficiente; una RTX 3060, RTX 4060 o superiores cubren el caso con holgura. El autor no publica GPU recomendadas para inferencia.
- Cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU moderna con unos pocos GB de VRAM. No se documenta una via de ejecucion en CPU ni en el propio telefono; el autor indica explicitamente que el despliegue en el dispositivo es un objetivo futuro y que el trabajo de latencia y empaquetado no se ha hecho.
- Opciones de despliegue: al ser un adaptador PEFT para `transformers`, el camino natural es cargar la base en nf4 y montar el adaptador con PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y hay que tener en cuenta la advertencia de fusionar solo tras descuantizar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. La busqueda web no devolvio resultados tecnicos relevantes sobre este modelo ni sobre alternativas de la misma categoria, y la model card no incluye comparaciones con otros sistemas. La unica referencia disponible es el propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cerebellum-08b-scrollvocab-sft | 0,8B (base) + adaptador QDoRA | no disponible | 73,5% tap exacto; 81,6% suelo tras revision; 51% tarea completa en AndroidWorld | no disponible | adaptador PEFT en HuggingFace |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | no disponible | no disponible | pesos base en HuggingFace |
| Alternativas de agentes GUI de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La gramatica solo puede tocar el centro de los elementos. Las vistas opacas dibujadas a medida (por ejemplo, una rejilla de calendario o un lienzo expuesto como un unico `View` grande) concentran muchos objetivos en un solo nodo, y el modelo toca con seguridad pero de forma incorrecta. Afecta a aproximadamente el 0,3% de los toques reservados. El arreglo previsto es escalar esas pantallas al modelo frontera en lugar de adivinar.
- Las filas que el arbol de accesibilidad marca como no accionables no se pueden seleccionar en absoluto, independientemente de lo que se vea en pantalla.
- Es un adaptador, no un modelo autonomo: requiere el modelo base y exactamente el mismo formato de prompt con el que fue entrenado.
- La fusion de pesos contra la base cuantizada degrada el grounding de forma silenciosa; hay que descuantizar antes de `merge_and_unload`.
- Riesgo de alucinacion de accion: el modelo puede emitir un toque confiado sobre una etiqueta incorrecta, especialmente en vistas personalizadas; conviene incorporar verificacion posterior al paso o escalado al planificador.
- Sesgos conocidos: no documentados. El entrenamiento se realizo sobre AndroidControl, por lo que el comportamiento fuera de esa distribucion de pantallas, idiomas de interfaz y estilos visuales no esta caracterizado.
- Limitaciones de idioma y contexto: no disponibles. El modelo no genera texto libre, sino una gramatica de acciones, pero no se especifica si las etiquetas o los elementos accesibles en idiomas distintos del de entrenamiento afectan al rendimiento.
- Restricciones de licencia: la licencia no esta declarada ni en la informacion de HuggingFace ni en la model card, por lo que no se puede confirmar el uso comercial. Conviene consultar al autor antes de cualquier despliegue en produccion.
- Estado de madurez: es un checkpoint intermedio de SFT (paso 424) conservado como punto de reinicio, no un artefacto final; con 0 descargas y 0 likes en el momento de redactar esta ficha.
- Requiere integracion externa: necesita un emulador o dispositivo conectado por adb, ademas de un sistema que genere las etiquetas Set-of-Mark y extraiga el arbol de accesibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dmitchelljackson/cerebellum-08b-scrollvocab-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Biblioteca PEFT: https://github.com/huggingface/peft
- La busqueda web no devolvio papers, blogs, repositorios ni demos relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha.
