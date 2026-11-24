# perkakastempur/liars-bar-cheat-esp-v3

## Resumen

`perkakastempur/liars-bar-cheat-esp-v3` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows de 64 bits distribuido como archivo ZIP (`monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip`, 4,8 MB) que, segun su propia model card, implementa un overlay externo con funcionalidades de ESP (deteccion de jugadores, cajas delimitadoras, esqueletos y radar 2D) orientado al videojuego Liars Bar. El autor lo etiqueta con la licencia MIT y lo publica bajo el identificador `liars-bar-cheat-esp-v3` en la version `v2.5.3` (build `90DDF9`).

El artefacto no incluye pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la seccion `pipeline` de Hugging Face figura como no disponible y las descargas y likes son cero en el momento de la consulta. Las etiquetas del repositorio (`windows`, `windows-11`, `x64`, `portable`) confirman que su naturaleza es la de una aplicacion binaria, no la de un modelo entrenado. Por tanto, esta ficha documenta el artefacto tal como aparece publicado y senala explicitamente los campos que no aplican o no estan disponibles.

La relevancia de esta entrada es fundamentalmente negativa: ejemplifica un caso de uso indebido de Hugging Face como plataforma de distribucion de software ejecutable de terceros, con redirecciones a repositorios de GitHub ajenos al ecosistema de IA y con instrucciones para ejecutar binarios como administrador. Cualquier evaluacion tecnica del artefacto como modelo de lenguaje, vision o multimodal carece de sentido con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable externo para Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio; no se especifica si son idiomas de interfaz o de documentacion) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado al repositorio. La model card describe un "user-mode external core" que renderiza mediante Desktop Duplication sin hooks internos en DLL, un overlay externo a 144 Hz o mas con cajas 2D/3D, esqueletos y distancia, un radar 2D con filtrado de botin por rareza, perfiles JSON intercambiables en caliente, una tecla de panico (`END`) para descarga instantanea del proceso y una capa de render "stream-proof" pensada para excluirse de OBS, ShadowPlay y Discord. Estos terminos describen tecnicas de trampas para videojuegos, no componentes de un modelo de aprendizaje automatico.

El paquete se presenta como compilado para Windows 10 y 11 de 64 bits, con tamano de 4,8 MB y firma de build `90DDF931F1`. No se documenta ningun conjunto de datos, ninguna fase de preentrenamiento, ajuste supervisado, RLHF ni DPO. Tampoco se aporta informacion sobre decodificacion especulativa, atencion lineal ni ninguna otra innovacion propia de modelos generativos.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No dispone de capacidades de vision por computador en el sentido de un modelo multimodal entrenado; el termino "ESP" hace referencia a la superposicion de informacion de jugadores en pantalla dentro del juego.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues reales mas alla de las etiquetas de idioma declaradas en los metadatos.
- Funcionalidades declaradas por el autor: overlay externo con cajas y esqueletos, radar 2D con filtro de botin, perfiles JSON con cambio en caliente, tecla de panico y capa de render excluida de capturas.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legitimas de procesamiento de lenguaje, vision, codigo o datos.
- Uso en produccion de software: descartado; se trata de un binario de terceros sin trazabilidad de codigo fuente verificable en el propio repositorio de Hugging Face.
- Investigacion en IA: descartado; no hay pesos, dataset, configuracion ni resultados reproducibles.
- Analisis de seguridad: el artefacto puede estudiarse como ejemplo de distribucion de ejecutables con contrasena en el ZIP y redireccion a repositorios de GitHub ajenos, pero ese analisis debe hacerse en un entorno aislado y no requiere ejecutar el binario.
- Docencia sobre higiene en plataformas de modelos: sirve como caso de estudio de etiquetado incorrecto de repositorios en Hugging Face.
- Auditoria de cadena de suministro: util para ilustrar practicas de riesgo, como pedir ejecucion como administrador y contrasenas embebidas en la documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica de modelos de IA, y las cifras que aparecen en la model card (por ejemplo, `348 Hz` de sondeo, `< 20 ms` de respuesta, `< 29 ms` de overlay o `96.7%` de consistencia) son afirmaciones del autor sobre el comportamiento del ejecutable, no resultados de benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no aplica en el sentido de inferencia; las cifras de milisegundos y hercios de la model card corresponden al overlay del ejecutable y no son verificables con la informacion disponible.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecucion como administrador y extraccion del ZIP con contrasena `2026`.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos similares" porque el artefacto no es un modelo de IA. La comparacion con modelos de lenguaje, vision o multimodales carece de sentido tecnico.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como si lo fuera.
- Riesgo de seguridad alto: la model card pide descargar un ZIP desde un repositorio de GitHub de terceros, extraerlo con contrasena y ejecutar un `.exe` como administrador; ese flujo es incompatible con practicas seguras de cadena de suministro.
- Contrasena embebida en la documentacion (`2026`): practica habitual en distribucion de malware para evadir analisis automatizado.
- Suplantacion de identidad: el nombre del archivo (`monster-hunter-wilds-trainer-mod-...`) no coincide con el nombre del repositorio (`liars-bar-cheat-esp-v3`), lo que dificulta la trazabilidad.
- Incumplimiento de terminos de servicio: las funcionalidades descritas (ESP, radar, overlay) constituyen trampas en videojuegos y vulneran habitualmente los terminos de uso de los titulos afectados.
- Licencia MIT declarada: aunque el metadato figura como MIT, no se incluye el texto de la licencia ni el codigo fuente en el repositorio de Hugging Face, por lo que la cobertura real de la licencia es dudosa.
- Idiomas: las etiquetas de idioma no implican soporte funcional verificado.
- Sin senales de uso comunitario: cero descargas y cero likes en el momento de la consulta, lo que impide cualquier validacion por terceros.
- Alucinacion y sesgos: no aplica en el sentido de modelos generativos, pero la model card contiene afirmaciones tecnicas no verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/perkakastempur/liars-bar-cheat-esp-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/sara37207/liars-bar-cheat-esp-v3
- Repositorio de GitHub del binario enlazado: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Descarga del archivo ZIP citada por el autor: https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
