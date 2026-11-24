# eslam343445/bybit-binance-perp-copytrade-bot

## Resumen

La entrada `eslam343445/bybit-binance-perp-copytrade-bot` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que aloja la model card de una supuesta aplicacion ejecutable para Windows (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, empaquetada en un ZIP de 4,8 MB), presentada como bot de copytrading de perpetuos para Bybit y Binance. El contenido no incluye pesos, tokenizador, configuracion de arquitectura ni artefactos propios de un modelo de lenguaje.

El texto de la model card mezcla la tematica financiera con referencias a un supuesto "cheat trainer" del juego Schedule 1, incluye enlaces a repositorios de GitHub de terceros, una contrasena de extraccion (`2026`) y afirmaciones de descargas no verificables (827K+). La metadata de Hugging Face declara la licencia MIT y catorce idiomas, pero no existe ningun checkpoint asociado ni pipeline definido.

Desde la perspectiva de evaluacion de modelos, esta ficha no puede completarse con datos tecnicos reales: no hay parametros, contexto, cuantizaciones ni benchmarks. Se documenta la entrada para dejar constancia de su naturaleza y de los riesgos asociados a la distribucion de binarios sin verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadata) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio distribuye un binario `.exe` dentro de un `.zip` de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto descrito es un ejecutable nativo para Windows 10/11 x64 (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, build declarada `v4.9.3` / `ABAA098B67`) que, segun el autor, se ejecutaria con privilegios de administrador y sin dependencias externas. La model card menciona modulos de "paper-trade sandbox", "honeypot filter", "multi-tier take profit", "smart-money copytrade", "AES-256 key vault" y "order routing" con latencias declaradas entre 21 y 38 ms, pero no aporta codigo fuente, hashes de verificacion ni trazabilidad de compilacion.

Tampoco se documenta ningun dataset, proceso de RLHF/DPO ni innovacion tecnica verificable. La unica informacion estructural es la metadata YAML de Hugging Face (tags `windows`, `windows-11`, `x64`, `portable`) y el texto promocional de la model card.

## Capacidades

- No se trata de un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No dispone de modo de razonamiento, vision, audio ni capacidades multimodales.
- El autor atribuye al binario funciones de copytrading de perpetuos, filtrado de tokens y gestion de claves, sin evidencia tecnica verificable.
- El soporte multilingue declarado se limita a la metadata del repositorio, no a capacidades del artefacto.

## Casos de uso

- No se identifican casos de uso legitimos como modelo de IA, al no existir modelo.
- Evaluacion de riesgos de supply chain: la entrada sirve como ejemplo de repositorio de Hugging Face que distribuye ejecutables de procedencia no verificada; util para formar a equipos de seguridad en la deteccion de este patron.
- Auditoria de model cards: caso practico de metadata (tags, licencia, idiomas) que no se corresponde con el contenido real del repositorio.
- Monitorizacion de abusos en plataformas de modelos: util para disenar heuristicas que detecten repositorios sin pesos ni configuracion pero con enlaces a binarios externos.
- Analisis de ingenieria social: el texto emplea badges de descargas, valoraciones y contrasenas de extraccion para generar confianza; sirve como muestra documentada de tecnicas de persuasion.
- Formacion en ciberseguridad: estudio de tecnicas de camuflaje que mezclan tematica financiera y videojuegos en una misma model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas cifras del autor son latencias declaradas de modulo (menos de 21, 25, 26, 32 y 38 ms) y consumo de RAM (menos de 26 MB), sin metodologia, hardware de referencia ni reproducibilidad.

## Requisitos de hardware

- No aplica VRAM: no hay pesos de modelo que cargar.
- El autor declara ejecucion en Windows 10/11 de 64 bits, sin GPU especifica.
- Consumo declarado: menos de 26 MB de RAM (no verificado).
- No procede despliegue con vLLM, llama.cpp, Ollama ni TGI.
- No se dispone de datos de latencia o throughput verificables.

## Comparativa con modelos similares

| Criterio | Esta entrada | Modelo de IA tipico en Hugging Face |
|---|---|---|
| Contenido | Binario `.exe` en ZIP + model card promocional | Pesos (safetensors/GGUF) + config + tokenizador |
| Parametros | no disponible | Declarados en `config.json` |
| Contexto | no disponible | Declarado en la model card |
| Benchmarks | no disponible | Tablas reproducibles |
| Licencia | MIT | MIT, Apache-2.0, Llama, etc. |
| Verificabilidad | Nula (sin hashes ni fuente) | Reproducible con `transformers`/`llama.cpp` |

No se identifican modelos comparables porque la entrada no es un modelo.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como LLM carece de sentido.
- Riesgo alto de seguridad: distribucion de un ejecutable de procedencia desconocida, alojado en GitHub de terceros, con instrucciones para ejecutarlo como administrador y contrasena de extraccion.
- Inconsistencia interna: el nombre del binario (`schedule-1-cheat-trainer`) no coincide con la tematica financiera del titulo.
- Posible phishing o malware: los badges de descargas, la valoracion inventada y la urgencia son patrones habituales de campanas maliciosas.
- La licencia MIT declarada no aporta garantias sobre el binario ni sobre su origen.
- No debe ejecutarse en entornos de produccion ni en maquinas con claves de exchange.
- La fecha de creacion (2026-11-24) y la ausencia de descargas o likes en Hugging Face contradicen las cifras de popularidad de la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/eslam343445/bybit-binance-perp-copytrade-bot
- Repositorio GitHub referenciado en la model card: https://github.com/Patel5092/bybit-binance-perp-copytrade-bot
- Repositorio GitHub referenciado para la descarga: https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
