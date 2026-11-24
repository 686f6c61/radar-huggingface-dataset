# Kobyko/raydium-meteora-grpc-sniper-bot-unlocked

## Resumen

El identificador `Kobyko/raydium-meteora-grpc-sniper-bot-unlocked` no corresponde a un modelo de inteligencia artificial, sino a un repositorio alojado en Hugging Face que distribuye un ejecutable para Windows (un supuesto bot de trading denominado "sniper" para los DEX Raydium y Meteora sobre Solana). El autor declarado es el usuario "Kobyko", y el paquete se publica como binario portable `x64` para Windows 10 y 11, con licencia MIT declarada en los metadatos.

No existe información alguna sobre arquitectura de red neuronal, parámetros, contexto, tokenizador ni pesos. La model card no describe un modelo de lenguaje: contiene instrucciones de descarga, una contraseña de archivo comprimido (`2026`), enlaces a un repositorio de GitHub de un tercero y afirmaciones de rendimiento propias de software de trading (enrutamiento de órdenes en menos de 40 ms, filtros antimoneda, engine de bundles Jito/MEV). Los campos `pipeline_tag` y los datos de benchmarks están vacíos.

Por tanto, esta ficha documenta lo que el artefacto es realmente y advierte de que no debe evaluarse como modelo de IA. Cualquier uso del binario conlleva riesgos de seguridad significativos y no verificables desde la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable de trading para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; idiomas de la documentación, no del modelo) |
| Licencia | MIT (declarada por el autor) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 8,9 MB con un `.exe` para win64, build declarada `v2.0.7` / `CA7E1F`) |

## Arquitectura y entrenamiento

No aplica. No hay arquitectura de red neuronal, ni datos de entrenamiento, ni proceso de RLHF/DPO, ni innovaciones técnicas de modelado. El contenido de la model card describe funcionalidades de un programa de trading: sondeo de datos a frecuencias declaradas de 447 Hz y 237 Hz, enrutamiento de órdenes por WebSocket y gRPC, verificación de autoridades de mint/freeze y bloqueo de liquidez, firma local con AES-256 y un motor de bundles para inclusión atómica con propinas dinámicas.

Estas cifras son afirmaciones del autor no verificadas ni contrastables con artefactos publicados (no hay código fuente, ni binarios reproducibles, ni auditoría). No existe información sobre el proceso de construcción, dependencias o cadena de suministro del ejecutable.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelos.
- El paquete se presenta como herramienta de ejecución de operaciones en los DEX Raydium y Meteora (ecosistema Solana) desde Windows.
- Funciones declaradas por el autor (no verificadas): take profit multinivel, sandbox de paper trading, filtro previo a la compra de tokens, almacén local de claves y motor de bundles Jito/MEV.
- Multilingüismo: solo afecta a la documentación del repositorio, no a ninguna capacidad del artefacto.

## Casos de uso

Ninguno de los siguientes casos se recomienda; se enumeran únicamente para describir el uso previsto según el autor y sus riesgos asociados.

- Ejecución de operaciones en Raydium y Meteora: el autor plantea el binario como cliente de trading con enrutamiento de órdenes por gRPC/WebSocket. No hay evidencia de que funcione ni de que sea seguro.
- Simulación de estrategias (paper trading): se anuncia un sandbox contra libros de órdenes en vivo; sin código fuente no es auditable.
- Filtrado de tokens previo a la compra: se menciona verificación de mint/freeze authority y bloqueo de liquidez; inverificable.
- Gestión local de claves: se describe un almacén AES-256 no custodial; la ejecución de un binario cerrado con acceso a claves privadas es un riesgo crítico.
- Inclusión de transacciones vía bundles: se menciona Jito/MEV con propinas dinámicas; no hay documentación técnica pública que lo respalde.
- Uso educativo o de investigación sobre distribución de software: el repositorio sirve como caso de estudio de paquetes con contraseña de archivo, enlaces externos y avisos de SmartScreen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (447 Hz, 237 Hz, menos de 32 ms, 97,7 % de consistencia, 344K descargas, valoración del 99 %) son afirmaciones de marketing del autor, no medidas reproducibles, y no se presentan como benchmarks de modelos de IA.

## Requisitos de hardware

- VRAM: no aplica; no es un modelo de IA.
- GPU: no aplica; el artefacto se distribuye como ejecutable `x64` para Windows 10/11.
- Requisitos declarados: Windows 10 u 11 de 64 bits, descompresión con contraseña `2026` y ejecución como administrador (según el autor).
- Despliegue: no aplica (no hay soporte de vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: las cifras del autor (menos de 40 ms de enrutamiento, sondeo a 447 Hz) no son verificables ni se corresponden con inferencia de modelos.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, los bots de trading de código abierto suelen publicarse con repositorio de código fuente auditable y sin contraseñas de archivo; este paquete no cumple ninguno de esos criterios según la información disponible.

## Limitaciones y advertencias

- No es un modelo de IA: evaluarlo como tal carece de sentido; los metadatos de Hugging Face están siendo usados para alojar un binario.
- Riesgo de seguridad alto: distribución de un `.exe` cerrado con contraseña de archivo, enlaces de descarga a un repositorio de GitHub de un tercero y petición de ejecución como administrador. Es un patrón habitual en campañas de malware.
- El propio autor reconoce alertas de Windows Defender y SmartScreen, y pide al usuario que las ignore; esto impide cualquier verificación de integridad.
- Acceso potencial a claves privadas de wallets: aunque se anuncie firma local no custodial, no hay auditoría ni código fuente que lo respalde.
- Riesgo financiero: cualquier operación real en DEX con un binario no auditado puede derivar en pérdida total de fondos.
- Licencia MIT declarada, pero sin código fuente asociado no hay forma de ejercer los derechos que otorga.
- Sin mantenimiento verificable: cero descargas y cero "likes" en el momento de la consulta, pese a las cifras infladas que muestra la model card.
- Idiomas: los 14 idiomas listados corresponden a la documentación, no a capacidades del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Kobyko/raydium-meteora-grpc-sniper-bot-unlocked
- Repositorio de GitHub referenciado por el autor: https://github.com/adaml024/raydium-meteora-grpc-sniper-bot-unlocked
- Releases del repositorio referenciado: https://github.com/adaml024/raydium-meteora-grpc-sniper-bot-unlocked/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
