# EhRLe/bullx-neo-solana-sniper-bot

## Resumen

`EhRLe/bullx-neo-solana-sniper-bot` no es un modelo de inteligencia artificial. Es un repositorio alojado en Hugging Face que distribuye un ejecutable binario para Windows (`bullx-neo-solana-sniper-bot-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB) presentado como un bot de trading automatizado para la blockchain de Solana, orientado a la plataforma Bullx Neo. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje: los tags (`windows`, `windows-11`, `x64`, `portable`) y el contenido de la model card describen una aplicación de escritorio, no un modelo entrenado.

El problema que dice resolver es la ejecución de operaciones de compra en lanzamientos de tokens en Solana con baja latencia (el autor afirma enrutamiento de órdenes por debajo de 40 ms), filtros anti-honeypot, bundles MEV vía Jito y copia de carteras de ballenas. Sin embargo, no hay ninguna evidencia técnica verificable: cero descargas, cero likes, sin paper, sin código fuente, sin pipeline declarado y con un binario distribuido dentro de un ZIP protegido con contraseña (`2026`) alojado en un repositorio de GitHub de terceros.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar un artefacto que se hace pasar por recurso de IA en Hugging Face, describir qué afirma ser y señalar los riesgos de seguridad asociados a la ejecución de binarios opacos con privilegios de administrador en un contexto financiero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA. Es un ejecutable nativo Windows x64 distribuido en un ZIP |
| Parametros totales | No disponible (no existen pesos de modelo) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; corresponden a la interfaz del binario, no a capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | No disponible. El artefacto distribuido es `bullx-neo-solana-sniper-bot-v1.2.0-win64.zip` (8,9 MB), que contiene `bullx-neo-solana-sniper-bot-v1.2.0-win64.exe` |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card describe un programa de escritorio con módulos funcionales: sandbox de paper trading, enrutamiento de órdenes asíncrono, motor de bundles Jito/MEV, filtro pre-compra de honeypots, copia de operaciones de carteras de ballenas y un empaquetador de 20 carteras mediante Lookup Tables de Solana. El autor cita métricas de consumo (`< 21 MB` y `< 61 MB` de RAM según módulo), `4` hilos de trabajo y sondeo a `212 Hz`, pero no aporta código, binarios reproducibles ni metodología de medición.

El "entrenamiento" declarado es inexistente: no hay dataset, no hay tokens de entrenamiento, no hay RLHF ni DPO. La build se identifica como `v1.5.6 (CC0627)` y el nombre del ZIP incluye `v1.2.0`, una inconsistencia de versionado que no se explica en la documentación. La distribución se realiza mediante enlaces a un repositorio de GitHub (`brewerverdigris/bullx-neo-solana-sniper-bot`) ajeno a la cuenta de Hugging Face, con un ZIP protegido por contraseña, práctica que impide la inspección previa del contenido por parte de antivirus y analistas.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling en el sentido de un LLM; las "capacidades" descritas son funciones de un bot de trading.
- Afirma ejecutar sandbox de paper trading contra libros de órdenes en vivo.
- Afirma enrutamiento de órdenes por debajo de 40 ms vía WebSocket y gRPC.
- Afirma construcción de bundles Jito/MEV con dimensionado dinámico de propinas.
- Afirma filtro pre-compra de honeypots mediante verificación de autoridades de mint/freeze y bloqueo de liquidez.
- Afirma copia automatizada de carteras de ballenas con dimensionado proporcional.
- Afirma ejecución multi-cartera en el mismo bloque mediante Lookup Tables (hasta 20 carteras).
- Interfaz multilingüe declarada en 14 idiomas.
- No hay capacidades multimodales, de audio, visión ni modo de razonamiento extendido.

## Casos de uso

- Ninguno recomendado en producción. El artefacto no es un modelo y no debe desplegarse como tal en pipelines de IA.
- Auditoría de seguridad: analizar el binario en una máquina virtual aislada y sin claves privadas para determinar si el ejecutable realiza exfiltración de datos, given la ausencia de código fuente y el uso de contraseña en el ZIP.
- Estudio de campañas de distribución maliciosa: documentar el patrón de repositorios en Hugging Face que suplantan recursos de IA para distribuir ejecutables con temática financiera.
- Formación en seguridad operacional: usar el caso como ejemplo de por qué no se deben ejecutar binarios "como administrador" tras desactivar advertencias de SmartScreen o Defender.
- Investigación de ecosistema Solana: si se busca un bot de trading legítimo, priorizar proyectos con código abierto verificable, auditorías publicadas y binarios firmados; este repositorio no cumple ninguno de esos criterios.
- Monitorización de supply chain: incluir el identificador `EhRLe/bullx-neo-solana-sniper-bot` en listas de bloqueo de descargas corporativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras del autor (sub-40 ms de enrutamiento, 212 Hz de sondeo, < 21 MB y < 61 MB de RAM) carecen de metodología, entorno de medición y reproducibilidad, por lo que no constituyen benchmarks verificables.

## Requisitos de hardware

- VRAM: no aplica; no hay inferencia de modelo.
- CPU: procesador x64 (Intel o AMD) según la model card.
- Sistema operativo: Windows 10 o Windows 11 de 64 bits.
- RAM: el autor declara menos de 21 MB y menos de 61 MB por módulo, cifra no verificada.
- Almacenamiento: el ZIP ocupa 8,9 MB; el espacio descomprimido no se especifica.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer con Windows x64; no requiere GPU dedicada según la documentación.
- Opciones de despliegue: ejecución nativa del `.exe` en Windows; no es compatible con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo.
- Latencia y throughput: no verificables.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a herramientas legítimas de trading automatizado en Solana (por ejemplo, frameworks de código abierto con repositorios auditables), la diferencia principal es la ausencia total de transparencia: sin código, sin binarios firmados, sin historial de versiones verificable y con distribución vía contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo de lenguaje, visión o código carece de sentido.
- Riesgo de seguridad alto: distribución de un ejecutable opaco, comprimido con contraseña (`2026`) y con instrucciones explícitas de ejecutarlo "como administrador", lo que facilita la persistencia y el acceso privilegiado si el binario es malicioso.
- Instrucciones para desactivar o ignorar advertencias de Windows Defender y SmartScreen, patrón habitual en campañas de malware.
- Enlaces de descarga apuntan a un repositorio de GitHub de un tercero (`brewerverdigris`), no al repositorio de Hugging Face, lo que rompe la cadena de custodia.
- Cero descargas y cero likes en Hugging Face, pese a que la model card muestra insignias de "878K+ descargas" y "99% verificado": los datos de la propia tarjeta son inconsistentes con las métricas reales de la plataforma.
- Inconsistencia de versiones entre el nombre del ZIP (`v1.2.0`) y la build declarada (`v1.5.6`).
- Riesgo financiero directo: un bot de trading que maneje claves privadas o fondos puede provocar pérdidas totales; no hay auditoría, garantía ni soporte.
- Licencia MIT declarada, pero sin código fuente al que aplicarla de forma verificable.
- Sesgos y alucinación: no aplica en el sentido de un LLM, pero la documentación contiene afirmaciones no verificables que funcionan como marketing engañoso.
- No apto para producción, investigación ni uso educativo sin aislamiento previo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/EhRLe/bullx-neo-solana-sniper-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/brewerverdigris/bullx-neo-solana-sniper-bot
- Enlace de descarga del ZIP citado: https://github.com/brewerverdigris/bullx-neo-solana-sniper-bot/releases/latest/download/bullx-neo-solana-sniper-bot-v1.2.0-win64.zip
- No se han encontrado papers, blogs técnicos, demos ni documentación adicional en la información proporcionada.
