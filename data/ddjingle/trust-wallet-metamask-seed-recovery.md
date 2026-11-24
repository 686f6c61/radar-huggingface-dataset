# ddjingle/trust-wallet-metamask-seed-recovery

## Resumen

La ficha que sigue analiza el repositorio publicado en Hugging Face bajo el identificador `ddjingle/trust-wallet-metamask-seed-recovery`. Tras revisar los metadatos y el contenido de la model card, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un paquete binario para Windows x64 que el autor presenta como una herramienta de recuperacion de frases semilla (seed phrases) de carteras Trust Wallet y MetaMask. Los tags declarados (windows, x64, portable) y la ausencia de pipeline confirman que no hay pesos, tokenizador ni arquitectura neuronal asociada.

El artefacto se distribuye como un archivo ZIP de 4,8 MB con contrasena y un ejecutable interno, y su model card emplea tecnicas habituales de ingenieria social (insignias de descargas y valoraciones inventadas, enlaces a repositorios de terceros, instrucciones para desactivar avisos de Windows Defender y ejecutar como administrador). El nombre del binario hace referencia a un supuesto macro de un juego, lo que resulta incoherente con la funcionalidad anunciada. Todo ello apunta a un patron de distribucion de software potencialmente malicioso (infostealer o similar) disfrazado de utilidad cripto.

Desde la perspectiva de un blog tecnico de IA open source, este repositorio no cumple ninguno de los criterios para ser catalogado como modelo: no hay parametros, contexto, licencia de pesos ni benchmarks. La ficha se redacta, por tanto, para documentar la ausencia de dichos elementos y advertir de los riesgos, sin que ello constituya una recomendacion de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | no disponible (distribucion en ZIP con ejecutable .exe) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un ejecutable compilado para Windows 10/11 de 64 bits, empaquetado en un ZIP de 4,8 MB protegido con contrasena. La model card menciona modulos como "SIMD multi-core engine", "PBKDF2 hashing", "BIP39 validator" y "BIP44/BIP84 address generation", pero no aporta codigo fuente, hashes de verificacion ni trazabilidad de compilacion que permitan auditar dichas afirmaciones.

La unica innovacion tecnica reseñable es negativa: la card instruye a ejecutar el binario como administrador, a desactivar advertencias de SmartScreen y a ignorar alertas del antivirus, practicas que contradicen las recomendaciones basicas de seguridad y que son caracteristicas de campanas de distribucion de malware.

## Capacidades

- No dispone de capacidades de generacion de texto, razonamiento, codigo ni matematicas: no es un modelo linguistico.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingues en el sentido de un LLM; los idiomas listados son metadatos de la card.
- El autor alega funciones de recuperacion de frases semilla, derivacion multi-cadena y validacion BIP39, sin evidencia verificable.

## Casos de uso

- Auditoria de seguridad: analizar el binario en un entorno aislado (sandbox, maquina virtual sin red) para determinar su comportamiento real antes de cualquier otra consideracion.
- Formacion en concienciacion: usar la card como ejemplo didactico de ingenieria social en repositorios de modelos (insignias falsas, contrasenas en el ZIP, instrucciones para desactivar el antivirus).
- Investigacion de malware: extraer indicadores de compromiso (URLs de descarga, nombres de ficheros, hashes) para alimentar bases de datos de threat intelligence.
- Monitorizacion de plataformas: documentar la presencia de artefactos no relacionados con IA en Hugging Face para mejorar los filtros de moderacion.
- Analisis de cadena de suministro: rastrear los repositorios de GitHub enlazados y su relacion con otras publicaciones del mismo autor.
- No se recomienda ningun caso de uso productivo, educativo ni personal que implique ejecutar el binario en un sistema con datos reales o carteras cripto activas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la card (215 Hz de polling, 98,8 % de consistencia, 96,5 % de consistencia, 15 hilos de trabajo) son afirmaciones del autor sin metodologia, conjunto de datos ni protocolo de evaluacion, por lo que no constituyen benchmarks verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 x64.
- Memoria RAM alegada por el autor: menos de 28 MB durante la ejecucion.
- Opciones de despliegue: ejecucion nativa del .exe en Windows; no procede vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de la card no son auditables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoria, se compara con utilidades legitimas de recuperacion de carteras y con modelos ligeros de propósito general:

| Criterio | Este artefacto | Herramienta legitima de recuperacion (p. ej. Ian Coleman BIP39, offline) | Modelo LLM pequeno (p. ej. Qwen2.5-1.5B) |
|---|---|---|---|
| Naturaleza | Binario Windows sin codigo fuente | Pagina HTML/JS auditable, offline | Pesos de red neuronal |
| Parametros | no disponible | no aplica | 1.540 M |
| Contexto | no disponible | no aplica | 32.768 tokens |
| Verificabilidad | Nula (ZIP con contrasena) | Codigo abierto | Pesos y card publicos |
| Licencia | MIT declarada | MIT | Apache 2.0 |
| Riesgo de seguridad | Alto | Bajo si se usa offline | Bajo |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y evaluaciones; cualquier uso como modelo es imposible.
- La card incluye instrucciones para ejecutar como administrador y desactivar protecciones del sistema, patron tipico de malware.
- El nombre del binario (`fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`) no guarda relacion con la funcionalidad anunciada, lo que sugiere reutilizacion de un empaquetado ajeno.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros, no al repositorio de Hugging Face, lo que rompe la trazabilidad.
- Las insignias de descargas (294K+) y valoracion (4,8/5) son inconsistentes con los 0 descargas y 0 likes registrados en Hugging Face.
- Riesgo elevado de robo de frases semilla y claves privadas si se introduce cualquier dato real en la herramienta.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su cadena de suministro.
- Cero adopcion verificable y actualizacion el mismo dia de la creacion (24 de noviembre de 2026), lo que sugiere publicacion automatizada.
- No debe ejecutarse en equipos con carteras cripto, credenciales o datos personales.

## Enlaces

- Hugging Face: https://huggingface.co/ddjingle/trust-wallet-metamask-seed-recovery
- Repositorio GitHub enlazado en la card (descarga del ZIP): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio GitHub enlazado en la card (releases): https://github.com/misasimmons/trust-wallet-metamask-seed-recovery/releases/latest
- Referencia BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Referencia BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
