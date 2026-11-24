# EhRLe/bybit-binance-perp-copytrade-bot-v2

## Resumen

La ficha solicitada corresponde al identificador de Hugging Face `EhRLe/bybit-binance-perp-copytrade-bot-v2`, publicado por el usuario `EhRLe`. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es una publicacion que distribuye un supuesto ejecutable para Windows (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`) empaquetado en un archivo ZIP protegido con contrasena. No existe pipeline declarado, no hay pesos, no hay tokenizador y no hay arquitectura de red neuronal asociada.

El contenido de la model card describe funcionalidades propias de un bot de trading de criptomonedas (enrutamiento de ordenes, copia de carteras, filtros anti-honeypot, bundles MEV) y emplea tecnicas de promocion tipicas de campanas de distribucion de software potencialmente malicioso: insignias de descargas y valoraciones no verificables, enlaces a repositorios de terceros ajenos al autor declarado, contrasena fija para descomprimir y ejecucion como administrador. El nombre del binario (`rob-run-cheat-mod-menu`) no guarda relacion con el titulo del repositorio, lo que constituye una senal de alarma adicional.

Desde la perspectiva de un editor tecnico de IA open source, esta publicacion no cumple ninguno de los criterios para ser catalogada como modelo: carece de parametros, de contexto, de licencia de pesos (la licencia MIT declarada aplica, en todo caso, al texto de la model card) y de cualquier artefacto inferible. La ficha se completa a continuacion con los campos obligatorios, indicando explicitamente la ausencia de datos cuando corresponde, y se anaden advertencias de seguridad relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; no se declara arquitectura de red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card; no implica capacidad linguistica real) |
| Licencia | MIT (declarada en los metadatos; aplicable al texto de la model card, no a pesos inexistentes) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de modelo que describir. La publicacion no incluye ficheros de pesos en formatos habituales (`safetensors`, `GGUF`, `ONNX`, `PyTorch`), no declara tokenizador, no referencia ningun paper ni repositorio de entrenamiento, y no aporta informacion sobre dataset, numero de tokens, composicion de datos ni tecnicas de alineacion (RLHF, DPO, SFT). El unico artefacto descrito es un binario Windows de 4,8 MB comprimido, lo que descarta por completo que contenga un modelo de lenguaje de cualquier tamano.

La model card mezcla terminologia de trading (bundles MEV, Lookup Tables, enrutamiento de ordenes por WebSocket y gRPC, filtros anti-honeypot) con metricas no verificables (97,6 % y 99,2 % de consistencia, latencia inferior a 40 ms, menos de 63 MB de RAM). No se aporta metodologia de medicion, ni repositorio de codigo fuente auditable, ni trazas reproducibles.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se declara soporte de tool calling ni de function calling en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se acredita capacidad multilingue real pese a listar catorce codigos de idioma en los metadatos.
- La model card atribuye al binario funciones de trading automatizado (copia de carteras, ejecucion multi-wallet, sandbox de paper trading), sin evidencia tecnica verificable.

## Casos de uso

- No procede. Al no existir un modelo de IA, no hay escenarios legitimos de inferencia, generacion o analisis que puedan recomendarse.
- Evaluacion de riesgos de cadena de suministro: el artefacto puede emplearse como caso de estudio en formacion sobre identificacion de campanas de distribucion de malware en plataformas de modelos.
- Analisis de reputacion de repositorios: util para ilustrar patrones de publicaciones de bajo esfuerzo con enlaces a terceros y contrasenas fijas.
- Monitorizacion de plataformas: sirve como ejemplo de contenido que deberia activar revisiones automatizadas en Hugging Face.
- Documentacion de incidentes: referencia para equipos de seguridad que cataloguen artefactos sospechosos.
- Formacion en higiene operativa: ejemplo practico de por que no debe ejecutarse un binario desconocido como administrador.
- No se recomienda ningun uso productivo, comercial ni de investigacion del binario distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras mencionadas en la model card (97,6 % de consistencia, 99,2 %, latencia inferior a 40 ms, consumo inferior a 63 MB de RAM) no son benchmarks de modelos de IA, carecen de metodologia y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son reproducibles ni auditables.
- Requisito real declarado por el autor: Windows 10 u 11 de 64 bits y ejecucion como administrador, lo que incrementa el riesgo de compromiso del sistema.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque la publicacion no es un modelo de IA. Frente a modelos open source reales de la misma plataforma (cualquier LLM con pesos `safetensors` o `GGUF`), la diferencia cualitativa es total: aquellos declaran parametros, contexto, licencia de pesos y artefactos auditables; esta publicacion no ofrece ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no puede ejecutar inferencia, generar texto ni procesar lenguaje natural.
- Riesgo elevado de software malicioso: binario `.exe` de origen no verificado, distribuido en ZIP con contrasena fija (`2026`) y con instrucciones de ejecucion como administrador.
- Suplantacion de identidad probable: el enlace de descarga apunta a un repositorio de GitHub (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026`) distinto del autor declarado en Hugging Face (`EhRLe` / `Caroline27881`).
- Inconsistencia entre titulo y binario: el ejecutable se llama `rob-run-cheat-mod-menu`, no guarda relacion con el supuesto bot de trading.
- Metricas no verificables y ausencia de codigo fuente auditable.
- La licencia MIT declarada no otorga ninguna garantia sobre el binario ni sobre su comportamiento en ejecucion.
- Riesgo financiero y legal: un supuesto bot de trading con acceso a claves de exchange puede provocar perdidas patrimoniales y vulnerar terminos de servicio de las plataformas.
- Uso comercial: desaconsejado en cualquier escenario; no hay base tecnica para integrarlo en produccion.
- Recomendacion: no descargar ni ejecutar el artefacto; si ya se ha hecho, analizarlo en entorno aislado y revisar credenciales y claves de API expuestas.

## Enlaces

- Hugging Face: https://huggingface.co/EhRLe/bybit-binance-perp-copytrade-bot-v2
- Repositorio de GitHub referenciado en la model card (no verificado, ajeno al autor declarado): https://github.com/Caroline27881/bybit-binance-perp-copytrade-bot-v2
- Repositorio de GitHub del binario referenciado (no verificado): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026
- Paper, blog o demo oficial: no disponible
