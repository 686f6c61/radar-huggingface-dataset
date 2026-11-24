# Marselox/gmgn-bullx-photon-copytrade-bot-pc

## Resumen

El artefacto publicado bajo el identificador `Marselox/gmgn-bullx-photon-copytrade-bot-pc` no es un modelo de inteligencia artificial, sino un paquete ejecutable para Windows distribuido a través de Hugging Face. La model card asociada describe un supuesto bot de copytrading para el ecosistema Solana (con referencias a Gmgn, Bullx y Photon), empaquetado como un ZIP de 8,9 MB con contraseña de extracción, un ejecutable `.exe` que debe lanzarse como administrador y una serie de módulos (motor de bundles Jito/MEV, gestor de 20 wallets con Lookup Tables, enrutado de órdenes, bóveda local AES-256). No contiene pesos, tokenizador, configuración de arquitectura ni ningún componente propio de un modelo de lenguaje.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto, cuantizaciones ni capacidades cognitivas, porque el artefacto no las tiene. Los campos técnicos habituales se marcan como "no disponible" o "no aplica". Lo relevante aquí, desde el punto de vista de un desarrollador o investigador, es la advertencia: se trata de un binario opaco de procedencia no verificable, alojado en un repositorio de modelos, con indicadores típicos de distribución maliciosa o no auditada (contraseña en el propio README, ejecución como administrador, enlaces a un repositorio de GitHub de un tercero distinto del autor en Hugging Face, insignias de descargas no comprobables).

La ficha se redacta íntegra siguiendo la estructura obligatoria, pero con la calificación explícita de que el objeto descrito no es un modelo de IA y de que su uso conlleva riesgos de seguridad significativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA; es un binario ejecutable para Windows) |
| Parametros totales | no disponible (no existen pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable en el binario) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no aplica; el artefacto distribuido es un ZIP con un `.exe` (`gmgn-bullx-photon-copytrade-bot-pc-v1.2.0-win64.zip`, 8,9 MB, contraseña `2026`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. La model card describe, en su lugar, un conjunto de módulos de software para el sistema operativo Windows: un motor de bundles Jito/MEV con dimensionado dinámico de propinas, un agrupador de 20 wallets mediante Lookup Tables, gestión de take profit multinivel, enrutado de órdenes por WebSocket y gRPC, una bóveda local de claves AES-256 y un módulo de copytrading de "smart money". Estas descripciones no vienen acompañadas de código fuente, hashes verificables, firma del binario ni artefactos de build reproducibles.

La única información estructural disponible es la del manifiesto de release (`slug`, `version = "3.6.3"`, `signature`), que aparece truncada en la documentación proporcionada. No hay dataset, no hay tokens de entrenamiento, no hay RLHF ni DPO, y no hay innovación técnica verificable en el sentido en que se aplicaría a un modelo de lenguaje.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelo.
- Las capacidades declaradas por el autor son funcionales de un bot de trading: ejecución de bundles, copia de wallets, gestión de claves locales y enrutado de transacciones.
- Ninguna de esas capacidades está verificada de forma independiente; no hay tests, demos ni código publicado.
- El soporte multilingüe se limita a etiquetas de metadatos; no hay interfaz ni documentación multilingüe verificable.

## Casos de uso

- Ninguno recomendado en producción. El artefacto no es un modelo y no debe desplegarse como tal.
- Auditoría de seguridad: un analista puede usar la model card y el ZIP como muestra para estudiar patrones de distribución de binarios opacos en repositorios de modelos (contraseña embebida, ejecución como administrador, enlaces a repositorios de terceros).
- Formación y concienciación: sirve como caso práctico de por qué no debe ejecutarse un `.exe` descargado de un repositorio de Hugging Face sin verificación de firma ni análisis en sandbox.
- Análisis de cadena de suministro: permite ilustrar la diferencia entre un artefacto de modelo (pesos, tokenizador, config) y un binario arbitrario etiquetado con metadatos de modelo.
- Investigación de malware: en un entorno aislado y sin red, puede estudiarse el comportamiento del ejecutable para caracterizar la familia de amenaza, si la hubiera.
- Documentación de políticas: útil como referencia para equipos que definan reglas de admisión de artefactos en sus pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo de IA, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Las cifras que aparecen en la model card (`< 49 MB` de RAM, `386 Hz` de polling, `< 5 ms` de respuesta, `13` hilos de trabajo) son afirmaciones del autor sin metodología, sin entorno de medida ni reproducibilidad, y no deben tratarse como datos de rendimiento verificados.

## Requisitos de hardware

- Plataforma declarada: Windows 10 y Windows 11 de 64 bits.
- VRAM: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un `.exe` que el autor indica ejecutar como administrador.
- Consumo declarado por el autor: por debajo de 49-64 MB de RAM según módulo, con 13 hilos de trabajo. No verificado.
- Latencia y throughput: cifras del autor no auditadas; no deben citarse como referencia.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA. Frente a un modelo open source real, las diferencias son estructurales: ausencia de pesos, de tokenizador, de configuración de arquitectura, de licencia aplicable al uso del software (la licencia MIT declarada en metadatos no cubre necesariamente el binario) y de cualquier posibilidad de auditoría del comportamiento.

| Criterio | Este artefacto | Modelo open source típico |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF, etc.) |
| Tokenizador y config | No | Sí |
| Código de inferencia | No | Sí (repositorio público) |
| Benchmarks reproducibles | No | Habitualmente sí |
| Auditoría del comportamiento | Imposible sin ingeniería inversa | Posible |
| Licencia aplicable al binario | Dudosa pese a declarar MIT | Clara |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo carece de sentido.
- Binario opaco: no hay código fuente, hashes públicos verificables ni firma de código.
- Distribución con contraseña (`2026`) embebida en el propio README: práctica atípica que dificulta el análisis automático por parte de antivirus y sandboxes.
- Instrucción de ejecutar como administrador: eleva el impacto potencial de cualquier comportamiento malicioso.
- Enlaces de descarga apuntan a un repositorio de GitHub de un autor distinto (`DennisMiyazaki`) del autor en Hugging Face (`Marselox`): inconsistencia de atribución.
- Insignias de descargas (`593K+`) y de build no verificables; no hay historial de releases contrastable.
- Riesgo de phishing, robo de claves o de fondos: la propia model card menciona gestión de claves AES-256 y firma local de transacciones, lo que convierte al binario en un objetivo de alto valor si es fraudulento.
- Licencia MIT declarada en metadatos, pero sin archivo LICENSE en el repositorio ni titularidad clara del binario; no debe asumirse permiso de uso comercial del ejecutable.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta, pese a la cifra de descargas que afirma el README.
- No debe ejecutarse en máquinas de producción ni con claves reales de wallet bajo ninguna circunstancia.
- Si se analiza, hacerlo en una máquina virtual sin red, sin credenciales y con instantánea previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Marselox/gmgn-bullx-photon-copytrade-bot-pc
- Repositorio de GitHub referenciado en la model card (autor distinto): https://github.com/DennisMiyazaki/gmgn-bullx-photon-copytrade-bot-pc
- Releases referenciadas (no verificadas): https://github.com/DennisMiyazaki/gmgn-bullx-photon-copytrade-bot-pc/releases/latest
- Paper: no disponible
- Blog o demo: no disponible
