# plunderer54/raydium-meteora-grpc-sniper-bot-v2

## Resumen

`plunderer54/raydium-meteora-grpc-sniper-bot-v2` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas de la plataforma (idiomas, licencia MIT), no contiene un modelo de inteligencia artificial. La model card describe un supuesto ejecutable portable para Windows x64 denominado `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` (build `v4.4.3`, `989310`), empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`, que se distribuye a través de enlaces a repositorios de GitHub de terceros.

El contenido se presenta como un "bot sniper" para los DEX Raydium y Meteora sobre Solana, con módulos de copytrade de "smart money", motor de bundles Jito/MEV, enrutado de órdenes por gRPC y WebSocket, y una "bóveda de claves AES-256 local". Ninguno de estos componentes corresponde a un modelo de lenguaje, a pesos neuronales ni a una arquitectura de IA; no hay parámetros, tokenizador, contexto ni artefactos de inferencia.

Desde el punto de vista de la evaluación técnica, el repositorio no es utilizable como modelo: no existe pipeline declarado, no hay ficheros de pesos y el patrón de distribución (ZIP con contraseña, binario `.exe` alojado en un repositorio ajeno, instrucciones de ejecución como administrador) coincide con el de campañas de malware y programas potencialmente no deseados. Esta ficha documenta lo que el autor declara, marcando explícitamente como no disponibles todos los parámetros propios de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como ejecutable nativo x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; no implica capacidades lingüísticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe un supuesto binario con módulos funcionales: copytrade asíncrono de carteras, motor de bundles Jito/MEV con dimensionado dinámico de propinas, enrutado de órdenes con latencia declarada inferior a 40 ms sobre streaming gRPC y WebSocket a 163 Hz, un "bundler" de 20 carteras mediante Lookup Tables con respuesta declarada inferior a 6 ms, una bóveda local AES-256 para firma no custodial y un sandbox de paper trading con 14 hilos de trabajo.

Todas estas cifras son afirmaciones del autor sin verificación independiente, sin código fuente publicado, sin trazabilidad de build reproducible y sin artefactos de auditoría. No hay información sobre datos de entrenamiento, tokens procesados, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, SSM), porque el objeto descrito no es un modelo generativo.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no hay pesos ni motor de inferencia.
- No soporta tool calling ni function calling en el sentido de un LLM; los "módulos" descritos son funcionalidades de un supuesto ejecutable de trading.
- No soporta razonamiento multi-paso ni agentes basados en lenguaje.
- Las capacidades multilingües que sugieren los metadatos (14 idiomas) no están respaldadas por ningún componente lingüístico verificable.
- Funcionalidades declaradas por el autor, no verificadas: copytrade de carteras, bundles Jito/MEV, enrutado gRPC de baja latencia, firma local con AES-256 y sandbox de simulación.
- No hay modo "thinking", audio, visión ni ninguna capacidad propia de un modelo fundacional.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no puede integrarse en pipelines de inferencia, RAG, agentes o generación de código.
- Auditoría de seguridad de la cadena de suministro: un equipo puede usar este repositorio como caso de estudio de distribución sospechosa (ZIP con contraseña, binario en repositorio de terceros, instrucciones de ejecución como administrador) para formar a analistas.
- Investigación de threat intelligence: catalogar el patrón de publicación en Hugging Face de binarios etiquetados con metadatos de modelo para detectar abuso de la plataforma.
- Formación en higiene de dependencias: ilustrar por qué no deben ejecutarse binarios opacos descargados desde enlaces de GitHub ajenos al autor declarado.
- Evaluación de políticas de moderación de hubs de modelos: servir como ejemplo de contenido que debería revisarse o retirarse por no corresponder a un modelo.
- Documentación de riesgos en entornos DeFi: analizar la promesa de "bots sniper" como vector habitual de fraude y de robo de claves.
- No se recomienda ningún uso en producción, ni financiero ni de otro tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las únicas cifras son afirmaciones de marketing del autor (latencia inferior a 40 ms, 163 Hz de sondeo, respuesta inferior a 6 ms, 14 hilos, consumo de RAM inferior a 36 MB y 18 MB por módulo) sin metodología, hardware de referencia ni verificación independiente.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 u 11 de 64 bits, ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo cifras declaradas por el autor, no reproducibles ni auditables.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| plunderer54/raydium-meteora-grpc-sniper-bot-v2 | Binario Windows (no es un modelo de IA) | no disponible | no disponible | MIT (declarada) | Hugging Face, 0 descargas, 0 likes |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No existe una categoría de "modelos similares" porque el artefacto no es un modelo. Frente a un LLM open source real, la comparación es inválida en parámetros, contexto, benchmarks y utilidad.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia.
- Riesgo elevado de malware: distribución mediante ZIP con contraseña, binario `.exe` alojado en un repositorio de GitHub de un tercero distinto del autor declarado y ejecución recomendada como administrador.
- Ausencia total de verificación: 0 descargas y 0 likes en el momento de la consulta, sin código fuente, sin hashes publicados y sin build reproducible.
- Riesgo de robo de claves: la propuesta de "bóveda AES-256 local" para firmar transacciones en Solana implica manejo de claves privadas por parte de un binario opaco.
- Riesgo financiero: los "bots sniper" y el copytrade de carteras se asocian con frecuencia a esquemas de fraude, front-running y pérdida de fondos.
- Licencia MIT declarada en metadatos, pero sin fichero LICENSE verificable en la información disponible; irrelevante para uso comercial porque no hay modelo que licenciar.
- Idiomas declarados sin respaldo técnico; no debe interpretarse como capacidad multilingüe real.
- Alucinación y sesgos: no aplica en el sentido de un LLM, pero las afirmaciones de rendimiento de la model card no están sustentadas por ninguna evidencia.
- Recomendación: no descargar ni ejecutar el artefacto; reportar el repositorio a Hugging Face si se confirma que no corresponde a un modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/plunderer54/raydium-meteora-grpc-sniper-bot-v2
- Repositorio de GitHub referenciado en la model card (no verificado, no recomendado): https://github.com/Shuji23605/raydium-meteora-grpc-sniper-bot-v2
- Repositorio de GitHub del supuesto binario (no verificado, no recomendado): https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Paper, blog, demo o documentación técnica: no disponible
