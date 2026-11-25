# M7TARM/photon-keyless-executor

## Resumen

`M7TARM/photon-keyless-executor` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un supuesto ejecutor de scripts para Windows distribuido como binario comprimido (`photon-keyless-executor-v1.2.0-win64.zip`, 8,9 MB). La model card describe funcionalidades de inyección de scripts en procesos de cliente, compatibilidad con la API `sUNC` (hookmetamethod, getgc, Drawing API) y un flujo de "ejecución sin clave" orientado a entornos de ejecución tipo Roblox. No se declara ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia.

El artefacto se presenta con etiquetas propias de un modelo (`language`, `license: mit`, `region: us`), pero el contenido real es una aplicación x64 para Windows 10 (22H2) y Windows 11 (24H2), empaquetada en un ZIP protegido con contraseña (`2026`) y publicada mediante enlaces a un repositorio de GitHub de terceros (`alessiokwon72/photon-keyless-executor`). El repositorio de Hugging Face no incluye ficheros de pesos en formatos estándar como safetensors o GGUF.

Desde la perspectiva de evaluación de modelos, esta ficha no puede aportar especificaciones de arquitectura, entrenamiento, benchmarks ni requisitos de inferencia porque no existen: el objeto publicado es software ejecutable de procedencia no verificada, con indicios claros de distribución de malware o de herramienta de trampas. Se documenta aquí con fines de catalogación y advertencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card, sin verificación funcional) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card describe módulos de software: un espacio de trabajo basado en Monaco Editor, un puente hacia una VM Luau, adjunción a múltiples instancias de cliente, compatibilidad declarada del 98 % con la suite de pruebas `sUNC` y sincronización de offsets tras parches del cliente. Estos elementos corresponden a un ejecutor de scripts, no a un modelo generativo.

No se documentan datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación en atención o decodificación. Tampoco se publican ficheros de configuración (`config.json`), tokenizador, índice de pesos ni tarjetas de datos asociadas.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling en el sentido de un modelo de lenguaje.
- No implementa agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos no están respaldadas por ningún componente lingüístico verificable.
- Las funciones descritas en la model card (inyección de scripts, `hookmetamethod`, `getgc`, Drawing API, adjunción a procesos) son propias de un ejecutor de trampas para videojuegos, no de un modelo.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no debe desplegarse en entornos de producción, investigación ni desarrollo.
- Catalogación de repositorios sospechosos: este caso sirve como ejemplo de repositorio que abusa de metadatos de modelo (`license`, `language`, `tags`) para distribuir un binario ajeno al ecosistema de Hugging Face.
- Formación en seguridad: puede utilizarse como muestra didáctica de técnicas de ingeniería social (contraseña en el ZIP, instrucciones de "ejecutar como administrador", listas blancas en Windows Defender, enlaces a repositorios de GitHub de terceros).
- Análisis de malware en laboratorio aislado: únicamente con fines de investigación defensiva, en una máquina virtual sin red y sin credenciales.
- Auditoría de cadena de suministro: revisión de cómo se enlazan artefactos entre Hugging Face y GitHub en releases automáticas.
- Concienciación de equipos: ilustrar por qué no debe ejecutarse software descargado de repositorios de modelos sin verificación de firma ni análisis previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (`< 18 ms`, `< 57 MB` de RAM, `99,5 %` de consistencia, `98 %+ sUNC`) son afirmaciones de marketing del autor sin metodología, sin conjunto de prueba y sin reproducibilidad, por lo que no constituyen benchmarks válidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que inferir.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del binario: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64 (Intel o AMD), 8,9 MB de archivo comprimido y menos de 57 MB de RAM según el autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras del autor no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable porque el artefacto no es un modelo de lenguaje ni un modelo multimodal. Cualquier comparación con modelos open source de parámetros y contexto definidos sería engañosa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje natural.
- Riesgo de malware: el patrón (ZIP con contraseña, ejecutable que requiere privilegios de administrador, instrucciones para desactivar avisos de Windows Defender y SmartScreen, enlaces a un repositorio de GitHub de terceros no vinculado al autor de Hugging Face) coincide con tácticas habituales de distribución de software malicioso.
- Suplantación de identidad: la model card menciona un identificador de GitHub (`alessiokwon72/photon-keyless-executor`) distinto del autor de Hugging Face (`M7TARM`), lo que impide verificar la cadena de custodia del binario.
- Uso ilícito potencial: las funciones descritas (inyección en procesos de cliente, evasión de sistemas anti-trampas) pueden infringir los términos de servicio de plataformas de terceros y la legislación aplicable en materia de acceso no autorizado a sistemas.
- Licencia: aunque se declara MIT en los metadatos, una licencia de software no legitima el uso del artefacto para actividades prohibidas por otros contratos o normas.
- Fiabilidad de los metadatos: los campos `language`, `tags` y `pipeline` no reflejan el contenido real del repositorio; no deben usarse para indexación automática ni para recomendación de modelos.
- Sin soporte ni mantenimiento verificables: cero descargas y cero "likes" en el momento de la consulta, sin historial de versiones auditable en Hugging Face.
- Recomendación: no descargar, no extraer y no ejecutar el binario. Si ya se ha ejecutado, realizar un análisis forense del sistema y rotar credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/M7TARM/photon-keyless-executor
- Repositorio de GitHub referenciado en la model card: https://github.com/alessiokwon72/photon-keyless-executor
- Release referenciada en la model card: https://github.com/alessiokwon72/photon-keyless-executor/releases/latest
- Paquete directo citado en la model card: https://github.com/alessiokwon72/photon-keyless-executor/releases/latest/download/photon-keyless-executor-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible
