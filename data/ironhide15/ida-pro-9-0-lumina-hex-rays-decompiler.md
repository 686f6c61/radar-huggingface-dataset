# ironhide15/ida-pro-9-0-lumina-hex-rays-decompiler

## Resumen

El repositorio `ironhide15/ida-pro-9-0-lumina-hex-rays-decompiler` no contiene un modelo de inteligencia artificial. Pese a su identificador y a las etiquetas de Hugging Face, la model card publicada por el autor describe un supuesto ejecutable portable para Windows de 64 bits (`monster-hunter-wilds-trainer-mod-2026-v1.2.2-win64.exe`, 4,8 MB) que se distribuye en un archivo ZIP protegido con contrasena y se anuncia como "IDA Pro 9.0 Lumina Hex Rays Decompiler". No existe ningun artefacto de pesos neuronales, tokenizador, configuracion de arquitectura ni pipeline asociado.

El contenido del README mezcla terminologia de ingenieria inversa (IDA Pro, Hex-Rays, decompilador) con referencias a un "roblox executor", un "trainer" de Monster Hunter Wilds, compatibilidad con "sUNC", inyeccion de scripts Luau y un editor Monaco. Esta combinacion es caracteristica de las campanas de distribucion de software potencialmente no deseado (PUP) o malware que se camuflan en plataformas de modelos para obtener visibilidad y enlaces de descarga.

Por tanto, esta ficha documenta la ausencia de un modelo real y advierte sobre los riesgos de seguridad. No hay arquitectura, parametros, contexto ni licencia aplicables a un modelo de lenguaje. Cualquier evaluacion tecnica como modelo de IA es imposible con la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos, no verificable) |
| Licencia | mit (declarada en metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un .exe de Windows) |

## Arquitectura y entrenamiento

No se ha publicado ninguna arquitectura de red neuronal, dataset de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovacion tecnica de inferencia. El repositorio no incluye ficheros `config.json`, `model.safetensors`, `tokenizer.json` ni ningun otro componente propio de un modelo de Hugging Face.

El unico contenido descrito es un binario ejecutable para Windows x64 empaquetado en un ZIP de 4,8 MB con contrasena. El README menciona "13 worker threads", "220 Hz polling", "388 Hz polling" y "306 Hz polling", cifras sin sentido en el contexto de un decompilador y que encajan con la retorica de los ejecutores de scripts para videojuegos. No hay evidencia de entrenamiento, evaluacion ni publicacion cientifica asociada.

## Capacidades

- No se puede confirmar ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- El README afirma soporte de "tool calling" implicito mediante un "script hub" y "hookmetamethod, getgc & Drawing API", terminos propios de la API de ejecucion de scripts en Roblox, no de un LLM.
- No hay evidencia de soporte de agentes, razonamiento multi-paso ni modo "thinking".
- El multilingue se limita a etiquetas de metadatos sin modelo subyacente que las respalde.
- No se documenta ninguna capacidad de decompilacion real de binarios ni integracion verificable con IDA Pro o Hex-Rays.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo de IA y no debe ejecutarse en entornos de desarrollo, investigacion ni produccion.
- Un analista de seguridad podria estudiar el binario en una maquina virtual aislada y sin red para caracterizar la amenaza, pero nunca en un puesto de trabajo real.
- Un equipo de moderacion de plataformas podria usar este caso como ejemplo de model card fraudulenta para entrenar clasificadores de repositorios maliciosos.
- Un investigador de supply chain podria documentar el patron de nombres (marca de herramienta legitima + "free download" + contrasena en el ZIP) como indicador de compromiso.
- Un responsable de cumplimiento podria incluirlo en listas de bloqueo de dominios y hashes para prevenir descargas en la organizacion.
- Un formador en concienciacion podria emplearlo como caso practico de ingenieria social dirigida a desarrolladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README incluye cifras decorativas ("558K+ downloads", "4.8/5 rating", "98%+ sUNC compatibility") que no son mediciones verificables ni comparables con ningun modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, no hay modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras en Hz del README no son mediciones de inferencia.
- Requisito real declarado por el autor: Windows 10 u 11 de 64 bits y ejecucion como administrador, lo cual es en si mismo una senal de alarma.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable porque el repositorio no contiene un modelo. Frente a decompiladores reales (Hex-Rays Decompiler de IDA Pro, Ghidra, Binary Ninja, RetDec) no hay ninguna relacion tecnica: esos productos son software de analisis binario, no modelos de lenguaje, y este repositorio no los implementa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; su presencia en Hugging Face es un uso indebido de la plataforma.
- El README solicita ejecutar un `.exe` como administrador y extraer un ZIP con contrasena: patron clasico de distribucion de malware o PUP.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no relacionados con el autor declarado ni con Hex-Rays.
- El propio texto se autodenomina "roblox executor", lo que contradice el nombre de decompilador y sugiere suplantacion de identidad de un producto comercial.
- Riesgo alto de robo de credenciales, persistencia, mineria o instalacion de software no deseado si se ejecuta.
- La licencia MIT declarada en metadatos no otorga ningun derecho sobre el binario ni garantiza su procedencia.
- No usar en produccion, ni en equipos corporativos, ni en maquinas con acceso a datos sensibles.
- Se recomienda reportar el repositorio a Hugging Face y no descargar ningun artefacto asociado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ironhide15/ida-pro-9-0-lumina-hex-rays-decompiler
- Enlaces de descarga citados en la model card (no verificar ni abrir): `github.com/martina1713/monster-hunter-wilds-trainer-mod-2026/releases/...` y `github.com/agnieszkadanielsson36/ida-pro-9-0-lumina-hex-rays-decompiler/releases/latest`
- Producto legitimo suplantado: Hex-Rays IDA Pro (https://hex-rays.com/ida-pro)
- Alternativas reales de decompilacion: Ghidra (https://ghidra-sre.org/), Binary Ninja (https://binary.ninja/), RetDec (https://github.com/avast/retdec)
- Canal de reporte de abuso de Hugging Face: https://huggingface.co/contact
