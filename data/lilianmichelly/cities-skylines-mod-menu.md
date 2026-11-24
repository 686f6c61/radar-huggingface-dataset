# Lilianmichelly/cities-skylines-mod-menu

## Resumen

El repositorio `Lilianmichelly/cities-skylines-mod-menu` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una publicacion que empaqueta un supuesto ejecutable de Windows (`cities-skylines-mod-menu-v1.2.0-win64.exe`) distribuido a traves de un archivo ZIP de 8,9 MB protegido con contrasena, presentado como un "mod menu" para el videojuego Cities Skylines. La model card describe funciones propias de software de trampas para videojuegos (radar 2D, filtrado de objetos, suavizado de entrada, perfilado JSON), no capacidades de generacion de lenguaje, vision o razonamiento.

No existe ninguna evidencia de que este artefacto sea un modelo entrenado: no hay pesos, no hay arquitectura declarada, no hay tokenizador, no hay pipeline asociado y las descargas y likes son cero. La etiqueta `license: mit` y el listado de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) parecen copiados de una plantilla de model card y no guardan relacion con el contenido real del repositorio.

Desde el punto de vista de la evaluacion tecnica, este repositorio debe clasificarse como no conforme con la categoria de modelo de IA. La ficha se redacta igualmente para dejar constancia de los datos disponibles y de las advertencias de seguridad pertinentes, dado que el patron de distribucion (binario ejecutable, contrasena en el propio README, enlaces a un repositorio de GitHub de terceros, peticion de ejecucion como administrador) coincide con tecnicas habituales de distribucion de software malicioso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin relacion con el contenido) |
| Licencia | mit (declarada) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, datos de entrenamiento, numero de tokens, composicion del corpus ni tecnicas de alineacion (RLHF, DPO, SFT). El repositorio no incluye ficheros de pesos en formatos habituales (`safetensors`, `GGUF`, `ONNX`, `PyTorch`), ni `config.json`, ni tokenizador, ni scripts de entrenamiento o inferencia.

La model card describe en su lugar un binario externo en modo usuario para Windows x64 que, segun el autor, emplea "Desktop Duplication rendering without internal DLL hooks", escaneo dinamico de offsets, suavizado de entrada bezier a 289 Hz de sondeo y perfiles JSON intercambiables en caliente. Estos terminos corresponden a tecnicas de trampas en videojuegos (aim assist, radar, loot filter) y no a componentes de un modelo de lenguaje.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingue real pese al listado de idiomas en los metadatos.
- El artefacto descrito por el autor es un ejecutable de Windows x64 que, segun la model card, ofrece funciones de radar 2D, filtrado de objetos por rareza, suavizado de entrada y perfiles de configuracion. Estas funciones no constituyen capacidades de un modelo de IA.

## Casos de uso

No procede. El repositorio no contiene un modelo de IA y, por tanto, no existen casos de uso legitimos de inferencia, generacion o analisis. Se enumeran a continuacion unicamente escenarios en los que este tipo de artefacto se encuentra habitualmente, con la advertencia correspondiente:

- Distribucion de software no verificado: el patron (ZIP con contrasena incluida en el README, enlace a un repositorio de GitHub ajeno al autor de Hugging Face, instruccion de ejecutar como administrador) es habitual en campanas de malware. No debe ejecutarse en entornos de produccion ni en maquinas personales.
- Auditoria de seguridad: un analista puede descargar el binario en una maquina virtual aislada y sin red para inspeccionarlo con herramientas de analisis estatico y dinamico, con el objetivo de caracterizar la amenaza.
- Formacion en concienciacion: el repositorio sirve como ejemplo real de model card falsificada que imita la estructura de un modelo de IA para atraer descargas.
- Investigacion de abuso de plataformas: permite estudiar como se camuflan artefactos no relacionados bajo etiquetas de modelos y licencias permisivas en hubs publicos.
- Monitorizacion de repositorios: util para construir reglas de deteccion automatica de repositorios que no contienen pesos y que distribuyen ejecutables.
- Respuesta a incidentes: si un usuario ha ejecutado el binario, el contenido del README aporta indicadores (nombre del ZIP, contrasena `2026`, ruta del repositorio de GitHub) utiles para la busqueda de artefactos en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del artefacto descrito: Windows 10 u 11 de 64 bits, procesadores Intel o AMD x64, menos de 64 MB de RAM segun la model card, y permisos de administrador para ejecutar el binario.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Frente a repositorios legitimos de modelos open source, las diferencias son estructurales: ausencia de pesos, ausencia de `config.json`, ausencia de tokenizador, ausencia de pipeline declarado y presencia de un ejecutable de Windows como artefacto principal.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no es utilizable para inferencia, fine-tuning ni evaluacion de capacidades linguisticas.
- El artefacto principal es un binario ejecutable de Windows distribuido en un ZIP con contrasena. Ejecutarlo supone un riesgo de seguridad alto y no recomendado.
- La model card incluye afirmaciones no verificables (por ejemplo, "929K+ downloads" y "99% Verified") que no coinciden con las metricas reales del repositorio en Hugging Face (0 descargas, 0 likes).
- Los enlaces de descarga apuntan a un repositorio de GitHub (`kerstinm269/cities-skylines-mod-menu`) distinto del espacio de Hugging Face, lo que impide verificar la cadena de custodia del binario.
- La licencia MIT declarada no aporta garantias sobre el contenido ni sobre la ausencia de codigo malicioso; una licencia permisiva no equivale a un artefacto seguro.
- El listado de idiomas y las etiquetas de la model card parecen plantillas copiadas y no describen el contenido real.
- Uso comercial: no procede, al no existir un modelo licenciable para tal fin.
- Riesgo de suplantacion: el nombre del repositorio y la estructura de la model card pueden inducir a confundirlo con un modelo o con un mod legitimo del videojuego.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Lilianmichelly/cities-skylines-mod-menu
- Repositorio de GitHub referenciado en la model card: https://github.com/kerstinm269/cities-skylines-mod-menu
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/kerstinm269/cities-skylines-mod-menu/releases/latest/download/cities-skylines-mod-menu-v1.2.0-win64.zip
- Pagina de releases citada en la model card: https://github.com/kerstinm269/cities-skylines-mod-menu/releases/latest
