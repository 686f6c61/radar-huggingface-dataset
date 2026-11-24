# dadsdew/gmgn-snipex-solana-copytrade-bot

## Resumen

La entrada `dadsdew/gmgn-snipex-solana-copytrade-bot` de Hugging Face no contiene un modelo de inteligencia artificial. Se trata de un repositorio que aloja la documentación de un supuesto bot de copytrading para la red Solana, distribuido como ejecutable portable para Windows de 64 bits bajo el nombre de fichero `schedule-1-cheat-trainer-v1.2.2-win64.exe`. El autor declarado es `dadsdew` y la licencia indicada es MIT, aunque el contenido real del artefacto no es verificable a partir de la información disponible.

La model card describe módulos de ejecución de operaciones (bundler de 20 wallets mediante Lookup Tables, motor de bundles Jito/MEV, filtro antihoneypot, take profit multinivel y una bóveda local de claves AES-256), todo ello empaquetado en un ZIP de 4,8 MB protegido con contraseña. No se declara ningún pipeline de Hugging Face, ni pesos, ni arquitectura de red neuronal, ni tokenizador, ni dataset de entrenamiento.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplir los apartados técnicos habituales porque no existe un modelo subyacente. Se documenta el contenido tal como aparece y se señalan de forma explícita los riesgos de seguridad asociados a la distribución de binarios opacos con instrucciones para desactivar las protecciones del sistema operativo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El repositorio contiene una model card con formato de página de descarga que referencia un binario compilado para Windows 10/11 de 64 bits, un ZIP de 4,8 MB protegido con la contraseña `2026` y un identificador de build `E0F59D` sobre la versión `v2.8.3`. Los enlaces de descarga apuntan a repositorios de GitHub de terceros (`arjunzimmermann624/schedule-1-cheat-trainer` y `ReneBarnes478/gmgn-snipex-solana-copytrade-bot`), no a artefactos alojados en Hugging Face.

No hay información sobre datos de entrenamiento, proceso de alineación (RLHF, DPO), tokenizador ni innovaciones técnicas de inferencia. Los valores de frecuencia que aparecen en la model card (`175 Hz`, `136 Hz`, `180 Hz`, `298 Hz`) y el número de hilos (`13` worker threads) son afirmaciones de marketing sin respaldo técnico verificable y no corresponden a métricas de un modelo lingüístico.

## Capacidades

- No se declara ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se declara capacidad de agentes ni razonamiento multi-paso basado en un LLM.
- La model card atribuye al binario funciones de ejecución de operaciones en Solana: bundler multi-wallet, motor de bundles Jito/MEV, filtro previo a la compra de tokens, take profit multinivel y almacenamiento local de claves.
- Los idiomas listados en los metadatos (14 códigos ISO) probablemente describen la localización de la documentación, no capacidades lingüísticas de un modelo.

## Casos de uso

- No procede. Al no existir un modelo de IA, no hay escenarios de inferencia que documentar.
- Evaluación de seguridad de artefactos: el repositorio puede servir como caso de estudio de campañas de distribución de binarios potencialmente maliciosos disfrazados de herramientas de trading.
- Auditoría de repositorios en Hugging Face: útil para calibrar filtros de moderación que detecten model cards con formato de landing page de descarga en lugar de documentación de modelo.
- Análisis de ingeniería social: la estructura (contraseña en el propio README, instrucciones para ejecutar como administrador, indicaciones para desactivar SmartScreen) es representativa de un patrón conocido de distribución de malware.
- Formación en ciberseguridad: ejemplo didáctico de por qué no deben ejecutarse binarios de origen no verificado con privilegios elevados.
- Monitorización de la plataforma: indicador de la presencia de contenido no relacionado con modelos en el Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica en el sentido de VRAM para inferencia de un modelo: no hay pesos que cargar.
- El artefacto declarado es un ejecutable para Windows 10/11 de 64 bits, con un tamaño de paquete de 4,8 MB.
- No se especifican requisitos de CPU, RAM, GPU ni almacenamiento para el binario.
- No se documentan opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, porque no hay modelo que servir.
- No se dispone de datos de latencia ni throughput verificables; las cifras en hercios de la model card no son contrastables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos comparable porque el repositorio no contiene un modelo de IA. Los artefactos con los que podría compararse serían otros binarios de trading o bots de copytrading, pero no se dispone de información verificable sobre ellos en el material proporcionado.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; la model card está redactada como una página de descarga de software, no como documentación técnica de un modelo.
- El binario se distribuye comprimido con contraseña (`2026`) y se solicita ejecutarlo como administrador, lo que dificulta el análisis y eleva el impacto de cualquier comportamiento malicioso.
- La model card incluye instrucciones explícitas para ignorar advertencias de Windows Defender y SmartScreen, práctica habitual en la distribución de malware.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros no verificados, no al propio Hub de Hugging Face.
- Un bot que gestiona claves privadas de wallets Solana y firma transacciones es un objetivo de alto valor: la bóveda AES-256 local que se anuncia no es auditable a partir de la información disponible.
- No hay evidencia de auditoría de código, firma digital del binario ni trazabilidad del build `E0F59D`.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el contenido real del ejecutable.
- Riesgo elevado de fraude financiero y de robo de fondos si se utiliza con claves reales.
- No debe ejecutarse en ningún entorno de producción ni en máquinas con acceso a wallets con fondos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dadsdew/gmgn-snipex-solana-copytrade-bot
- Enlace de descarga referenciado en la model card (GitHub, terceros): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Repositorio de GitHub referenciado (terceros): https://github.com/ReneBarnes478/gmgn-snipex-solana-copytrade-bot/releases/latest
