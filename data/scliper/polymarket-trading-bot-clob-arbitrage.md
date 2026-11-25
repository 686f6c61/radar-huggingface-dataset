# Scliper/polymarket-trading-bot-clob-arbitrage

## Resumen

La ficha solicitada corresponde al identificador `Scliper/polymarket-trading-bot-clob-arbitrage` alojado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de IA ni de un artefacto de aprendizaje automatico: es un repositorio que distribuye un supuesto ejecutable para Windows presentado como "bot de trading" para Polymarket con arbitraje CLOB. No contiene pesos, configuracion de transformer, tokenizador ni ningun otro componente propio de un modelo de lenguaje.

La model card no describe arquitectura, datos de entrenamiento ni capacidades cognitivas. En su lugar incluye instrucciones para descargar y descomprimir un archivo ZIP protegido con contrasena (`2026`) y ejecutar un binario como administrador. El nombre del binario (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`) y el del repositorio de origen no guardan relacion con el titulo del proyecto, lo que constituye una senal de alarma clasica de distribucion de software potencialmente malicioso.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, pero debe leerse como una advertencia: no es un modelo evaluable, no dispone de benchmarks y no deberia ejecutarse en entornos de produccion ni en maquinas con datos sensibles. Los campos tecnicos propios de un modelo se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; artefacto ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El repositorio contiene metadatos de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y una model card que actua como pagina de descarga. El artefacto descrito es un binario `robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe` empaquetado en un ZIP de 4,8 MB, con contrasena de extraccion `2026` y ejecucion recomendada como administrador.

La model card menciona modulos con nombres como "multi-instance attach", "post-patch offset sync", "auto-execute directory" o "keyless execution flow", acompanados de cifras de consistencia (96,2 %, 97,8 %) y frecuencias de sondeo (419 Hz, 199 Hz) sin ninguna metodologia que las respalde. No hay publicacion de dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones tecnicas verificables.

## Capacidades

- No es un modelo generativo: no produce texto, codigo ni razonamiento.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos del repositorio.
- No dispone de modo thinking, vision, audio ni ninguna modalidad.
- La unica "funcionalidad" declarada es la ejecucion de un binario de Windows que, segun el autor, operaria sobre Polymarket mediante arbitraje CLOB.

## Casos de uso

- Ninguno recomendado en produccion. El artefacto no es un modelo y no puede integrarse en pipelines de IA.
- Auditoria de seguridad: analizar el binario en un entorno aislado (sandbox, maquina virtual sin red) para determinar su comportamiento real antes de cualquier uso.
- Estudio de campanas de distribucion en Hugging Face: sirve como ejemplo de repositorio que suplanta la identidad de un modelo o bot para distribuir ejecutables.
- Formacion en higiene de cadena de suministro: ilustra por que no deben ejecutarse binarios de origen desconocido con privilegios de administrador.
- Analisis de reputacion de repositorios: util para calibrar heuristicas (cero descargas, cero likes, nombre de binario incongruente con el titulo, contrasena en el ZIP).
- Documentacion de incidentes: recoger metadatos e IOC (indicadores de compromiso) para informes de threat intelligence.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de IA y no existen metricas como MMLU, HumanEval o GSM8K aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni modelo que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras de la model card (419 Hz, 199 Hz, < 15 ms) no son verificables ni corresponden a inferencia de un modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Scliper/polymarket-trading-bot-clob-arbitrage | no disponible (no es modelo) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Modelos de trading/agentes financieros open source | no disponible | no disponible | no disponible | variable | variable |
| LLM genericos open source (referencia de categoria) | no disponible | no disponible | no disponible | variable | variable |

No se conocen modelos comparables de la misma categoria porque el artefacto no pertenece a ninguna categoria de modelo de IA. La comparativa no es significativa.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y capacidad de inferencia.
- Riesgo de seguridad alto: distribuye un ejecutable de Windows que se solicita ejecutar como administrador, con contrasena en el ZIP para dificultar el analisis automatizado.
- Incongruencia de nombres: el titulo del repositorio (`polymarket-trading-bot-clob-arbitrage`) no coincide con el binario (`robrun-trainer-esp-aimbot-2026-v1.2.2-win64.exe`), lo que sugiere suplantacion o reutilizacion de plantillas.
- Cero descargas y cero likes en Hugging Face: sin evidencia de uso legitimo ni validacion por la comunidad.
- La licencia MIT declarada no garantiza la legalidad ni la seguridad del binario distribuido.
- Posible incumplimiento de las condiciones de uso de Polymarket si el software interactua con su API o CLOB.
- Riesgo de robo de credenciales, mineria, exfiltracion de datos o instalacion de malware si se ejecuta en un equipo real.
- No debe usarse en produccion, en equipos corporativos ni en maquinas con acceso a carteras cripto o claves de API.
- Los idiomas listados son metadatos; no hay evidencia de soporte multilingue funcional.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Scliper/polymarket-trading-bot-clob-arbitrage
- Model card citada (referencia, no recomendada para descarga): https://huggingface.co/Scliper/polymarket-trading-bot-clob-arbitrage
- Repositorio de origen mencionado en la model card: https://github.com/MikhailMa649/polymarket-trading-bot-clob-arbitrage
- Repositorio de releases mencionado en la model card: https://github.com/Shuhua73716/robrun-trainer-esp-aimbot-2026
- Documentacion de Polymarket CLOB (contexto del supuesto uso): https://docs.polymarket.com
- Politica de contenido de Hugging Face: https://huggingface.co/content-guidelines
