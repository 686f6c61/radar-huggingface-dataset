# Esstor/doomsday-ghost-client

## Resumen

`Esstor/doomsday-ghost-client` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows de 64 bits distribuido como archivo ZIP (`doomsday-ghost-client-v1.2.0-win64.zip`, 8,9 MB) y protegido con contrasena. La model card lo describe como un cliente externo de tipo "game cheat" (trampas para videojuegos) con funciones de escaneo dinamico de offsets, overlay externo a 144 Hz, cajas delimitadoras 2D/3D, esqueletos de huesos y ESP de distancia, entre otras. No existe ninguna arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

El problema que dice resolver es la automatizacion de trampas en videojuegos sobre Windows 10/11 x64, operando en modo usuario y sin inyeccion de DLL internas, segun la propia descripcion del autor. No es, por tanto, un modelo de lenguaje ni multimodal, y no ofrece generacion de texto, razonamiento, codigo ni ninguna capacidad propia de un sistema de IA. La relevancia para un blog de IA open source es nula desde el punto de vista tecnico, y su interes es mas bien el de un caso de uso indebido del ecosistema Hugging Face.

La ficha se redacta igualmente segun la estructura solicitada, indicando de forma explicita "no disponible" en todos los parametros propios de un modelo de IA que no existen en este repositorio. Se advierte de que el contenido de la model card incluye enlaces de descarga de un binario ejecutable con contrasena y recomendaciones de desactivar avisos de Windows Defender y SmartScreen, practica de riesgo elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas del repositorio, no capacidades del binario) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como ZIP con ejecutable `.exe`; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni artefactos de aprendizaje automatico. Segun la model card, el paquete incluye un ejecutable (`doomsday-ghost-client-v1.2.0-win64.exe`, version `v2.0.9`, build `8C4437`) que corre en modo usuario sobre Windows x64, con un supuesto nucleo externo que emplea Desktop Duplication para renderizar un overlay sin hooks de DLL internas, 16 hilos de trabajo y sondeo a 292 Hz para el overlay y 409 Hz para el cambio de perfiles JSON.

Las unicas afirmaciones tecnicas del autor son de rendimiento del binario (consistencia del 98,4 % en la resolucion de firmas de punteros, consumo inferior a 45 MB de RAM para la capa de render y menos de 44 MB para la descarga de panico con la tecla `END`). No hay informacion sobre datos de entrenamiento, RLHF, DPO ni innovaciones de arquitectura neuronal, porque no existe ningun componente de ese tipo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve problemas matematicos.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; las etiquetas de idioma del repositorio no corresponden a ninguna funcionalidad del binario.
- No ofrece modo "thinking", vision, audio ni ninguna modalidad de IA.
- Segun la model card, el binario incluye funciones de escaneo dinamico de offsets, overlay externo, ESP de distancia, cajas 2D/3D, esqueletos de huesos, cambio de perfiles JSON y tecla de panico, orientadas a hacer trampas en videojuegos.

## Casos de uso

- No procede. El artefacto no es un modelo de IA y no tiene aplicaciones legitimas en el desarrollo de software, la investigacion ni la produccion de sistemas inteligentes.
- Su unico proposito declarado es la manipulacion de videojuegos mediante tecnicas de trampa (overlay, ESP, resolucion de offsets), lo que infringe habitualmente los terminos de servicio de las plataformas de juego y puede conllevar el baneo de cuentas.
- La distribucion como ZIP con contrasena y la recomendacion de excluir el ejecutable de Windows Defender y SmartScreen son patrones habituales en la distribucion de software potencialmente malicioso, no casos de uso legitimos.
- No se identifican escenarios de atencion al cliente, generacion de codigo, analisis de datos, agentes ni ninguna otra aplicacion practica de IA.
- Cualquier uso del binario en un entorno corporativo o de investigacion deberia descartarse por motivos de seguridad y cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas presentes en la model card son de rendimiento del ejecutable (consistencia del 98,4 %, sondeo a 292 Hz y 409 Hz, consumo inferior a 45 MB de RAM, 16 hilos), sin comparacion con modelos de IA ni verificacion independiente.

## Requisitos de hardware

- No aplica en terminos de VRAM: no hay pesos ni inferencia neuronal.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, procesador Intel o AMD x64, y ejecucion como administrador.
- Consumo de memoria declarado: inferior a 45 MB de RAM para la capa de render y menos de 44 MB para la descarga de panico.
- Tamano del paquete: 8,9 MB (ZIP).
- No hay soporte de vLLM, llama.cpp, Ollama, TGI ni ningun runtime de inferencia, porque no existe un modelo que ejecutar.
- No se dispone de datos de latencia o throughput relevantes para IA.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el repositorio no contiene un modelo. Como referencia de categoria, podria compararse con otros ejecutables de trampas para videojuegos, pero no se dispone de informacion verificable sobre alternativas ni de datos tecnicos objetivos para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: el paquete se distribuye como ejecutable con contrasena (`2026`) y la model card recomienda desactivar avisos de Windows Defender y SmartScreen, lo que impide el analisis antivirus convencional y es un patron tipico de malware.
- Los enlaces de descarga apuntan a un repositorio de GitHub de terceros (`mCox69/doomsday-ghost-client`), no al propio Hugging Face, lo que anade riesgo de suplantacion.
- Uso declarado como trampa en videojuegos: infringe terminos de servicio, puede provocar el baneo de cuentas y, en algunos paises, consecuencias legales.
- La licencia MIT del repositorio no legitima el uso del binario ni exime de responsabilidad al usuario.
- No hay verificacion independiente de las metricas declaradas por el autor.
- Se recomienda no descargar ni ejecutar el binario en ningun entorno, y reportar el repositorio a Hugging Face si se detecta contenido abusivo o malicioso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Esstor/doomsday-ghost-client
- Repositorio de GitHub citado en la model card: https://github.com/mCox69/doomsday-ghost-client
- Descarga del paquete citada en la model card: https://github.com/mCox69/doomsday-ghost-client/releases/latest/download/doomsday-ghost-client-v1.2.0-win64.zip
- No se han encontrado papers, blogs, demos ni documentacion tecnica adicional en la informacion proporcionada.
