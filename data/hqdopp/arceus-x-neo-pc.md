# hqdopp/arceus-x-neo-pc

## Resumen

`hqdopp/arceus-x-neo-pc` es un repositorio alojado en Hugging Face que, pese a su clasificacion como modelo, no contiene ningun modelo de inteligencia artificial. La model card describe un supuesto ejecutable de Windows (`arceus-x-neo-pc-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado como "Arceus X Neo PC", una herramienta de tipo *executor* para Roblox distribuida a traves de un repositorio de GitHub de terceros. No se declara arquitectura neuronal, numero de parametros, longitud de contexto ni pesos en formato safetensors o GGUF.

El repositorio utiliza el etiquetado de Hugging Face (tags de idioma y licencia MIT) pero su contenido real es una pagina de descarga de software empaquetado, con instrucciones para descomprimir un archivo protegido por contrasena y ejecutarlo como administrador. No hay evidencia de que exista un modelo entrenado, un tokenizador o artefactos de inferencia asociados. El contador de descargas y de "likes" figura a cero en el momento de la consulta.

Por tanto, esta ficha documenta la ausencia de un modelo utilizable y advierte de los riesgos de seguridad asociados. Cualquier evaluacion tecnica como modelo de lenguaje, vision o multimodal carece de objeto: no hay pesos, no hay benchmarks y no hay pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe una aplicacion Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun tags del repositorio, no verificables como capacidades del modelo) |
| Licencia | MIT (declarada en metadatos; aplicable al repositorio, no a un artefacto de modelo) |
| Formato de pesos | no disponible (el unico artefacto referenciado es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, dataset de entrenamiento, numero de tokens procesados ni tecnicas de alineacion (RLHF, DPO u otras). La model card no menciona transformer, MoE, SSM ni ninguna otra familia arquitectonica. El contenido se limita a describir supuestas funcionalidades de una aplicacion de escritorio: un editor basado en Monaco, un "script hub" con ejecucion de presets en la nube, compatibilidad declarada con el estandar sUNC, adjuncion a procesos cliente y sincronizacion de offsets tras parches. Estos terminos pertenecen al ambito de la inyeccion de scripts en videojuegos, no al entrenamiento de modelos.

No existe evidencia de pesos, checkpoints, configuraciones de tokenizador ni artefactos de inferencia en el repositorio. La unica referencia tecnica concreta es un binario de Windows distribuido mediante un enlace a GitHub Releases de una cuenta ajena al autor del repositorio de Hugging Face, protegido por contrasena y con instrucciones para ejecutarlo con privilegios de administrador. Todo ello es incompatible con la definicion de un modelo open source publicable y evaluable.

## Capacidades

- No se ha documentado ninguna capacidad de generacion de texto, razonamiento, codigo o matematicas.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) documentadas.
- No hay modo "thinking" ni decodificacion especulativa descrita.
- Las unicas "capacidades" que menciona la model card son funcionalidades de una aplicacion de escritorio para Windows (editor Monaco, script hub, adjuncion de procesos), no capacidades de un modelo de IA.

## Casos de uso

No procede enumerar casos de uso de un modelo de IA, porque no existe tal modelo. Los escenarios que sugiere la model card pertenecen a la manipulacion de clientes de videojuegos y quedan fuera del ambito de esta publicacion. A modo de advertencia, los unicos usos plausibles del artefacto distribuido serian:

- Ejecucion de binarios de procedencia no verificada en sistemas Windows, con el riesgo de malware que ello implica.
- Inyeccion de scripts en clientes de Roblox, lo que puede vulnerar los terminos de servicio de la plataforma y acarrear el baneo de cuentas.
- Distribucion de software empaquetado con contrasena y alojado en repositorios de terceros, practica habitual en campañas de distribucion de software no deseado.
- Suplantacion de la etiqueta "modelo" en Hugging Face para aumentar la visibilidad de una pagina de descarga.
- Ninguno de estos escenarios constituye un caso de uso legitimo de un modelo de IA open source evaluable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, porque no hay modelo que evaluar. Las cifras que aparecen en la model card (por ejemplo, "98%+ sUNC", "96,9% de consistencia" o "390 Hz de polling") son afirmaciones de marketing sobre una aplicacion de escritorio y no resultados de evaluacion de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, no hay pesos de modelo.
- GPU recomendadas: no aplicable.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponible.
- El unico requisito documentado es de sistema operativo: Windows 10 u 11 de 64 bits, con ejecucion como administrador del binario `arceus-x-neo-pc-v1.2.0-win64.exe`.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que el repositorio no contiene un modelo de IA. Compararlo con modelos de lenguaje, vision o multimodales seria un ejercicio sin base tecnica.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuracion ni pipeline de inferencia.
- La model card incluye instrucciones para descargar y ejecutar un binario de Windows desde un repositorio de GitHub de un tercero, con contrasena de descompresion y privilegios de administrador; esta pauta es caracteristica de campañas de distribucion de software potencialmente malicioso.
- El binario no esta firmado ni verificado por el autor del repositorio de Hugging Face, y la cuenta de GitHub que lo aloja (`ClaraHakansson4302`) no tiene relacion declarada con `hqdopp`.
- La licencia MIT declarada en los metadatos no aclara la titularidad del binario ni de las supuestas funcionalidades descritas.
- No hay evidencia de sesgos, alucinaciones o limitaciones linguisticas porque no hay modelo; el riesgo relevante es de seguridad informatica, no de calidad de generacion.
- El uso de herramientas de inyeccion de scripts en Roblox puede contravenir los terminos de servicio de la plataforma y conllevar sanciones sobre la cuenta del usuario.
- No se recomienda su descarga, extraccion ni ejecucion en entornos de produccion ni personales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hqdopp/arceus-x-neo-pc
- Repositorio de GitHub referenciado en la model card: https://github.com/ClaraHakansson4302/arceus-x-neo-pc
- Enlace de descarga citado en la model card: https://github.com/ClaraHakansson4302/arceus-x-neo-pc/releases/latest/download/arceus-x-neo-pc-v1.2.0-win64.zip
- No se han encontrado papers, blogs tecnicos, demos ni repositorios de codigo asociados a un modelo de IA en la informacion disponible.
