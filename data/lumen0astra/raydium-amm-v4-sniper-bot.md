# LUMEN0ASTRA/raydium-amm-v4-sniper-bot

## Resumen

`LUMEN0ASTRA/raydium-amm-v4-sniper-bot` es un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial. La model card describe un supuesto binario para Windows x64 denominado "Raydium Amm V4 Sniper Bot", empaquetado en un archivo ZIP (`elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip`, 4,8 MB) protegido con contraseña y distribuido mediante enlaces a repositorios de GitHub de terceros. No se declara arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia; el campo `pipeline` figura como no disponible y el repositorio acumula 0 descargas y 0 likes.

El contenido es altamente sospechoso desde el punto de vista de seguridad. La model card mezcla de forma incoherente el nombre de un bot de trading en Solana (Raydium AMM v4) con el de un supuesto *trainer* del videojuego *Elden Ring*, emplea un nombre de archivo que no coincide con el título del repositorio, incluye una contraseña fija de extracción (`2026`) y enlaza a cuentas de GitHub ajenas al autor declarado. Estas prácticas son habituales en campañas de distribución de *malware* que se camuflan como herramientas de trading o de trampas para juegos.

Por todo ello, esta ficha documenta el repositorio como lo que es —un artefacto no relacionado con IA— y advierte explícitamente de que no debe descargarse ni ejecutarse. No existe información técnica verificable sobre parámetros, contexto, cuantización, entrenamiento ni benchmarks, por lo que la mayoría de los campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un binario para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados en metadatos, sin modelo asociado) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal. La model card menciona componentes propios de un supuesto bot de trading —enrutamiento de órdenes en menos de 40 ms, streaming de transacciones por WebSocket y gRPC, almacén local de claves AES-256, simulador de *paper trading*, agrupación de 20 carteras mediante *Lookup Tables*, motor de *bundles* Jito/MEV y objetivos de *take profit* multinivel— junto con referencias a hilos de trabajo ("15 worker threads", "14 worker threads"). Ninguno de estos elementos constituye un modelo de lenguaje o de otro tipo entrenado con datos.

No hay información sobre datasets, número de tokens, procesos de RLHF/DPO ni innovaciones técnicas de aprendizaje automático. La única "innovación" declarada es de naturaleza operativa (ejecución multi-cartera en el mismo bloque), no algorítmica.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de *tool calling* ni de *function calling* en el sentido de modelos de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- El multilingüismo figura únicamente como etiqueta en los metadatos (14 idiomas), sin evidencia de un modelo que lo respalde.
- Las supuestas funciones descritas (enrutamiento de órdenes, firma local de claves, simulación de estrategias, *bundling* de transacciones) corresponden a un binario de trading, no a un modelo de IA.

## Casos de uso

- No procede. El repositorio no contiene un modelo de IA y no es apto para ninguno de los casos de uso habituales (generación de texto, código, atención al cliente, análisis documental, etc.).
- El supuesto uso legítimo (automatización de operaciones en Raydium AMM v4) no puede verificarse y, dado el patrón de la model card, debe considerarse de riesgo elevado.
- Cualquier escenario de despliegue en producción, investigación o evaluación comparativa queda descartado por ausencia de artefactos de modelo.
- Uso educativo o de auditoría de seguridad: únicamente como ejemplo documentado de model card fraudulenta en Hugging Face.
- No se recomienda su descarga, extracción ni ejecución en ningún entorno, ni siquiera aislado, sin análisis previo en una sandbox dedicada.
- No existe caso de uso válido para desarrolladores o investigadores que busquen un modelo de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica: no hay pesos que cargar ni inferencia que ejecutar.
- El artefacto distribuido es un ejecutable de Windows x64 (presuntamente 4,8 MB), no un modelo con requisitos de VRAM.
- No se especifican GPU, VRAM, latencia ni throughput de inferencia.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni ningún otro motor de inferencia.
- El único "requisito" declarado es Windows 10 u 11 de 64 bits y ejecución como administrador, lo que en sí mismo constituye una señal de alarma.

## Comparativa con modelos similares

No disponible. No existe categoría de modelo comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos reales de la misma supuesta temática (por ejemplo, asistentes de trading basados en LLM), la diferencia fundamental es la ausencia total de pesos, arquitectura y evaluación reproducible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA: no hay pesos, tokenizador, configuración ni código de inferencia.
- Incoherencia grave entre el nombre del repositorio (bot de trading en Raydium), el nombre del archivo distribuido (un supuesto *trainer* de *Elden Ring*) y las cuentas de GitHub enlazadas (ajenas al autor declarado).
- Distribución mediante ZIP con contraseña fija (`2026`) y enlaces a *releases* de terceros: patrón típico de campañas de *malware*.
- Instrucción explícita de ejecutar el binario como administrador, lo que eleva el impacto potencial de cualquier carga maliciosa.
- La model card justifica de antemano las alertas de Windows Defender y SmartScreen ("heuristic checks may prompt a warning"), táctica habitual para que el usuario desactive protecciones.
- Licencia MIT declarada, pero sin código fuente ni artefactos que permitan verificar su aplicabilidad.
- Riesgo de fraude financiero y de robo de claves: la propia descripción menciona gestión de claves AES-256 y firma de transacciones.
- Cero descargas y cero likes en el momento de la consulta; sin comunidad ni validación independiente.
- No debe utilizarse en producción, ni evaluarse como modelo, ni citarse como referencia técnica de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LUMEN0ASTRA/raydium-amm-v4-sniper-bot
- Enlaces de descarga y *releases* de GitHub presentes en la model card (no verificar ni seguir): `https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip` y `https://github.com/cyoshida597/raydium-amm-v4-sniper-bot/releases/latest`
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados.
