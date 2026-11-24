# Arukha/kingdom-come-deliverance-2-trainer-pc

## Resumen

El repositorio `Arukha/kingdom-come-deliverance-2-trainer-pc` no contiene un modelo de inteligencia artificial. Se trata de un artefacto alojado en Hugging Face que, segun su model card, distribuye un supuesto "trainer" o utilidad de trampas para el videojuego Kingdom Come: Deliverance 2, empaquetado como ejecutable portable para Windows x64. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia asociados.

La model card describe caracteristicas propias de una herramienta de modificacion de partidas (overlay externo, ESP, suavizado de entrada, perfiles JSON intercambiables) y enlaza a un archivo ZIP alojado en un repositorio de GitHub de terceros, protegido con contrasena. Ninguno de esos elementos constituye un modelo de lenguaje, vision o multimodal.

Por tanto, esta ficha documenta la ausencia de un modelo evaluable: no existe arquitectura, parametros, contexto ni datos de entrenamiento que analizar. La relevancia tecnica para desarrolladores e investigadores es nula en el ambito de IA; el interes, si lo hay, es exclusivamente como caso de estudio de contenido ajeno a la plataforma y de posibles riesgos de seguridad asociados a la descarga de ejecutables de origen no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de aprendizaje automatico. La model card menciona un ejecutable `dandys-world-forsaken-script-2026-v1.2.2-win64.exe` (build v4.5.7, identificador D780FB) dentro de un ZIP de 4,8 MB, con contrasena de extraccion "2026", alojado en un repositorio de GitHub de un tercero (`pedrolong1343/dandys-world-forsaken-script-2026`). No se documenta ningun proceso de entrenamiento, dataset, tokenizador ni innovacion tecnica de IA.

Las "caracteristicas" descritas en la model card (capa de renderizado, suavizado de entrada bezier, overlay externo a 144 Hz, escaner de offsets dinamico, nucleo externo en modo usuario) son funcionalidades de una herramienta de manipulacion de videojuegos, no componentes de un modelo.

## Capacidades

- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son etiquetas de metadatos del repositorio.
- No incluye modo de pensamiento, audio ni ninguna modalidad de IA.
- El artefacto distribuido es un ejecutable de Windows x64 presentado como trainer del juego Kingdom Come: Deliverance 2.

## Casos de uso

- No aplica como modelo de IA: no existe inferencia posible, por lo que no hay escenarios de generacion de texto, codigo, analisis de datos ni atencion al cliente.
- Auditoria de contenido en plataformas de modelos: util para estudiar como se cuelan artefactos ajenos (ejecutables, enlaces a terceros) en repositorios etiquetados como modelos, y para disenar filtros de moderacion.
- Analisis de riesgo de cadena de suministro: el flujo descrito (descarga de ZIP desde un repositorio de GitHub no oficial, contrasena fija, ejecucion como administrador) es un patron tipico de distribucion de software no verificado que conviene documentar en formaciones de seguridad.
- Formacion en higiene de descargas: caso practico para explicar por que no debe ejecutarse como administrador un binario de origen desconocido.
- Estudio de tecnicas de ingenieria social en model cards: el uso de insignias de descargas y valoraciones no verificables es un ejemplo de senales de confianza falsas.
- No se identifica ningun caso de uso legitimo relacionado con IA, desarrollo de software o investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable y la model card no incluye metricas de IA (MMLU, HumanEval, GSM8K u otras). Los unicos datos numericos presentes son afirmaciones de marketing de la propia model card (descargas, valoracion 4,9/5, tiempos de respuesta en milisegundos) que no son verificables ni corresponden a rendimiento de un modelo.

## Requisitos de hardware

- No aplica VRAM para inferencia: no hay pesos que cargar.
- El artefacto declarado requiere un escritorio Windows x64 (se menciona Windows 11 en las etiquetas).
- No se especifican GPU recomendadas porque no hay computo de IA implicado.
- No cabe en GPU consumer ni en GPU de centro de datos en calidad de modelo, porque no es un modelo.
- Opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI: no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a cualquier modelo open source real (por ejemplo, familias tipo Llama, Mistral o Qwen), la comparacion carece de sentido: no hay parametros, contexto, licencia de pesos ni artefactos de inferencia que contrastar.

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con las metricas habituales de la ficha (parametros, contexto, benchmarks).
- Distribucion de un ejecutable de Windows con contrasena fija y ejecucion recomendada como administrador: patron de alto riesgo que puede implicar malware, mineros, stealers o modificaciones del sistema.
- Los enlaces apuntan a repositorios de GitHub de terceros no verificados, no al espacio oficial del autor en Hugging Face.
- Las cifras de descargas, valoracion y rendimiento de la model card no son verificables y no deben tomarse como evidencia.
- La licencia MIT declarada se refiere al repositorio; no queda claro que ampare el binario distribuido ni su legalidad frente a los terminos de servicio del videojuego.
- Uso del artefacto en un videojuego: posible incumplimiento de los terminos de servicio y riesgo de sanciones en servicios en linea.
- No debe ejecutarse en entornos de produccion, corporativos ni de investigacion.
- No hay sesgos de modelo que analizar por ausencia de modelo; el riesgo relevante es de seguridad informatica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Arukha/kingdom-come-deliverance-2-trainer-pc
- Repositorio de GitHub enlazado en la model card (tercero, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026
- Descarga del ZIP enlazada en la model card (tercero, no verificada): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio de GitHub alternativo enlazado en la model card (tercero, no verificado): https://github.com/VebogoCode35/kingdom-come-deliverance-2-trainer-pc/releases/latest
