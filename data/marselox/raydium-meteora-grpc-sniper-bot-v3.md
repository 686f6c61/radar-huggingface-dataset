# Marselox/raydium-meteora-grpc-sniper-bot-v3

## Resumen

El repositorio `Marselox/raydium-meteora-grpc-sniper-bot-v3` no contiene un modelo de inteligencia artificial, sino un supuesto ejecutable para Windows x64 presentado como bot de trading de criptomonedas para los protocolos Raydium y Meteora (Solana). La model card describe una aplicación de escritorio con enrutamiento de órdenes por gRPC y WebSocket, copia de carteras de "smart money", agrupación de transacciones mediante Lookup Tables y un monedero local cifrado con AES-256. No hay pesos, arquitectura neuronal ni pipeline de inferencia asociados.

La ficha se redacta, por tanto, como evaluación técnica de un artefacto que aparece indexado en Hugging Face bajo una licencia MIT y etiquetas multilingües (14 idiomas), pero que no constituye un modelo fundacional ni un modelo ajustado. Cualquier uso en producción debe considerar que el binario se distribuye a través de un repositorio de GitHub de terceros (`GerhardKlein0995/raydium-meteora-grpc-sniper-bot-v3`), protegido con contraseña de archivo y sin trazabilidad de código fuente, lo que impide verificar sus afirmaciones de rendimiento.

El interés de esta entrada reside en su valor como caso de estudio de riesgo en la cadena de suministro de software: un artefacto con apariencia de modelo (tags, idiomas, licencia) que en realidad es un ejecutable de terceros orientado a operar con claves privadas de criptomonedas del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; aplicación de escritorio x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un `.zip` con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un ejecutable `raydium-meteora-grpc-sniper-bot-v3-v1.2.0-win64.exe` (build `v3.3.7`, hash corto `9BDEAF`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. La model card menciona componentes de sistema: streaming de transacciones por gRPC y WebSocket, 15 y 16 hilos de trabajo según el módulo, sondeo a 364 Hz y 434 Hz, y firma local de transacciones con AES-256. No se aporta código fuente, hash de integridad completo, lista de dependencias ni resultados de auditoría.

No hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.), porque el objeto no es un modelo de lenguaje. Las afirmaciones de latencia ("sub-40ms") y de frecuencia de sondeo provienen exclusivamente de la model card y no están verificadas de forma independiente.

## Capacidades

- Enrutamiento de órdenes hacia Raydium y Meteora mediante gRPC y WebSocket, según la descripción del autor.
- Simulación de operaciones ("paper trading") contra libros de órdenes en vivo.
- Copia de carteras de ballenas ("smart-money copytrade") con dimensionamiento proporcional.
- Agrupación de hasta 20 monederos en una misma transacción mediante Lookup Tables.
- Almacenamiento local de claves con cifrado AES-256 y firma sin exposición remota, según el autor.
- Filtro previo a la compra de tokens fraudulentos (verificación de autoridades de mint/freeze y bloqueo de liquidez).
- Interfaz multilingüe declarada en 14 idiomas.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente en el sentido de los modelos de lenguaje.

## Casos de uso

- Evaluación de riesgo de cadena de suministro: analizar el artefacto en un entorno aislado para documentar cómo se distribuyen ejecutables de terceros bajo apariencia de modelos en Hugging Face. Adecuado por la discrepancia entre metadatos (licencia, idiomas) y contenido real (binario Windows).
- Formación en seguridad de monederos: estudiar el patrón de "key vault local" y las implicaciones de ejecutar binarios sin código fuente verificable. Adecuado porque la model card describe firma local de transacciones con claves del usuario.
- Investigación de malware y phishing: usar el ZIP como muestra en un sandbox (p. ej., CAPE, Cuckoo, ANY.RUN) para identificar comportamiento de red y persistencia. Adecuado por la contraseña de archivo, que dificulta el escaneo automático y es un patrón habitual para evadir antivirus.
- Docencia sobre ingeniería social en repositorios: ejemplificar cómo una model card con insignias, tabla de "capacidades" y enlaces de descarga puede imitar la presentación de un modelo legítimo. Adecuado por la estructura del README.
- Auditoría de cumplimiento: verificar si el uso de un bot de trading no auditado cumple la normativa financiera aplicable (MiCA en la UE, requisitos de custodia). Adecuado porque implica manejo de claves privadas y ejecución de órdenes.
- Análisis de mercado de herramientas DeFi: contrastar las afirmaciones de latencia (sub-40 ms, 364 Hz) con mediciones reales de RPC de Solana en un entorno controlado. Adecuado para desmentir o confirmar cifras no verificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras aportadas por el autor son latencias y frecuencias de sondeo declaradas (sub-40 ms de enrutamiento, 364 Hz y 434 Hz de polling, 15 y 16 hilos de trabajo), sin metodología, hardware de referencia ni reproducibilidad.

## Requisitos de hardware

- Plataforma: Windows 10 u 11 de 64 bits, según la model card.
- VRAM estimada para inferencia: no aplica (no hay modelo neuronal).
- GPU recomendadas: no aplica.
- Cabe en GPU de consumo: no aplica; requiere CPU x64 y ejecución como administrador según las instrucciones del autor.
- Opciones de despliegue: ejecución directa del `.exe` en Windows; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no verificados; el autor declara enrutamiento por debajo de 40 ms y sondeo a 364/434 Hz sin datos de medición.

## Comparativa con modelos similares

No disponible. No existen modelos de lenguaje comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros tipos de artefacto indexados en Hugging Face:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Riesgo principal |
|---|---|---|---|---|
| `Marselox/raydium-meteora-grpc-sniper-bot-v3` | Ejecutable Windows (bot de trading) | no aplica | no aplica | MIT | Binario de terceros, sin código fuente, con acceso a claves privadas |
| Modelo de lenguaje open source típico (p. ej., familia Llama, Qwen, Mistral) | Pesos safetensors/GGUF | 7B-70B | 8k-128k | licencias permisivas o comunitarias | Alucinación, sesgos, requisitos de GPU |
| Repositorio de herramientas DeFi open source (p. ej., clientes RPC de Solana) | Código fuente | no aplica | no aplica | MIT/Apache-2.0 | Dependencias, mantenimiento |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto ni ofrece inferencia; los metadatos de Hugging Face (tags de idioma, licencia) no reflejan la naturaleza del artefacto.
- Distribución opaca: el binario se aloja en un repositorio de GitHub de un tercero (`GerhardKlein0995`), no en el repositorio de Hugging Face, y no se publica código fuente ni hash de integridad completo.
- ZIP protegido con contraseña (`2026`): patrón que dificulta el análisis automático por antivirus y motores de sandbox, y que debe tratarse como señal de alerta.
- Ejecución como administrador: las instrucciones piden privilegios elevados, lo que amplía el impacto de cualquier comportamiento malicioso.
- Acceso a claves privadas: la aplicación declara gestionar un monedero local con AES-256 y firmar transacciones; un binario no auditado con este acceso puede vaciar fondos.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta; sin issues, discusiones ni auditorías públicas.
- Riesgo financiero y regulatorio: operar con bots no auditados puede incumplir normativa de mercados de criptoactivos y conllevar pérdidas totales del capital.
- Riesgo de alucinación: no aplica al no ser un modelo generativo; el equivalente es la posible falsedad de las capacidades declaradas en la model card.
- Licencia MIT: permite uso comercial y modificación, pero no otorga ninguna garantía ni responsabilidad al autor; el usuario asume todo el riesgo.

## Enlaces

- Hugging Face: https://huggingface.co/Marselox/raydium-meteora-grpc-sniper-bot-v3
- Repositorio de GitHub citado en la model card: https://github.com/GerhardKlein0995/raydium-meteora-grpc-sniper-bot-v3
- Releases del repositorio citado: https://github.com/GerhardKlein0995/raydium-meteora-grpc-sniper-bot-v3/releases/latest
- Descarga directa del ZIP citada por el autor: https://github.com/GerhardKlein0995/raydium-meteora-grpc-sniper-bot-v3/releases/latest/download/raydium-meteora-grpc-sniper-bot-v3-v1.2.0-win64.zip
- Documentación de Raydium: https://docs.raydium.io
- Documentación de Meteora: https://docs.meteora.ag
- Documentación de Solana (gRPC/Geyser): https://docs.solana.com
