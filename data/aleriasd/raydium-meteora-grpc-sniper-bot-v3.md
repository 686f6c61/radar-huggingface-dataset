# aleriasd/raydium-meteora-grpc-sniper-bot-v3

## Resumen

`aleriasd/raydium-meteora-grpc-sniper-bot-v3` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un ejecutable portable para Windows x64 presentado como "sniper bot" para los DEX Raydium y Meteora sobre Solana, con supuestas capacidades de enrutamiento de órdenes por gRPC, copia de carteras ("smart-money copytrade"), filtro de honeypots y bóveda local de claves AES-256. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

El autor declara la etiqueta `license: mit` y una lista de 14 idiomas, pero esos metadatos son los habituales de una model card de Hugging Face y no reflejan capacidades lingüísticas reales: no existe ningún modelo subyacente que pueda generar texto, razonar o procesar lenguaje. La fecha de creación y actualización (24 de noviembre de 2026) y la ausencia total de descargas y valoraciones indican que el repositorio es de creación reciente y sin tracción.

La relevancia de esta ficha es, por tanto, negativa: sirve para documentar que el artefacto no debe evaluarse como modelo y para advertir de los riesgos de seguridad asociados a su distribución (ejecutable empaquetado en ZIP con contraseña, descarga desde un repositorio de GitHub de terceros ajeno al autor declarado y contenido de la model card con marcado promocional). No se dispone de información sobre arquitectura, entrenamiento ni benchmarks porque no aplica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos de la model card; sin modelo subyacente que los soporte) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El contenido del repositorio es un binario `rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe` (build declarada `v3.3.7`, identificador `9BDEAF5DD5`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card describe módulos funcionales del supuesto bot (enrutamiento de órdenes por WebSocket y gRPC, sandbox de paper trading, copia de carteras, bundler de 20 wallets mediante Lookup Tables, bóveda de claves AES-256 y filtro de honeypots), pero no aporta código fuente, especificación de protocolo ni evidencia verificable de su funcionamiento.

Desde el punto de vista técnico, no hay innovación alguna que evaluar en el sentido de la ficha: no hay decodificación especulativa, atención lineal, mezcla de expertos ni estrategia de entrenamiento. La única "técnica" descrita es la operativa de distribución (ZIP con contraseña y ejecución como administrador), que es precisamente un patrón habitual en campañas de malware y no un atributo de un modelo.

## Capacidades

- No genera texto, no razona, no escribe código ni resuelve matemáticas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso basado en modelo.
- No tiene capacidades multilingües reales pese a la lista de 14 idiomas en los metadatos.
- No dispone de modo "thinking", visión, audio ni ninguna modalidad.
- Las supuestas capacidades descritas en la model card (enrutamiento sub-40 ms, copia de ballenas, bundler de 20 wallets, bóveda AES-256) son afirmaciones del autor sin verificación independiente y no constituyen capacidades de un modelo de IA.

## Casos de uso

No se identifican casos de uso legítimos como modelo de IA, porque no lo es. Los escenarios que se describen a continuación son los que la model card sugiere, junto con la advertencia correspondiente:

- Trading automatizado en Raydium y Meteora: el supuesto bot enrutaría órdenes por gRPC y WebSocket; sin auditoría del binario no es posible confirmar que lo haga ni que no exfiltre claves.
- Copia de carteras ("smart-money copytrade"): replicaría posiciones de wallets seleccionadas; implica manejar claves privadas en el equipo local, con el riesgo asociado a un ejecutable de procedencia no verificada.
- Simulación de estrategias (paper trading): la model card menciona un sandbox sin riesgo; sería el único uso potencialmente inocuo si el binario se ejecutase en una máquina aislada y sin claves reales.
- Filtrado de honeypots previo a la compra: verificación de autoridades de mint/freeze y bloqueo de liquidez; no hay evidencia de que el binario implemente esta comprobación.
- Bundling multi-wallet en el mismo bloque mediante Lookup Tables: operativa de lanzamiento coordinado; de nuevo, sin verificación.
- Estudio de patrones de distribución maliciosa en Hugging Face: el repositorio puede usarse como caso de análisis para investigadores de seguridad que estudien cómo se camuflan ejecutables como model cards.
- Documentación de riesgos para equipos que evalúan repositorios de Hugging Face: sirve como ejemplo de por qué conviene filtrar por pipeline, formato de pesos y presencia de artefactos de modelo antes de descargar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de modelo, porque el artefacto no es un modelo. Las cifras que aparecen en la model card (sub-40 ms de enrutamiento, 364 Hz de sondeo, 434 Hz, 15 y 16 hilos de trabajo) son afirmaciones del autor sin metodología ni reproducción independiente, y no deben interpretarse como rendimiento medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del ejecutable: Windows 10 u 11 de 64 bits, ejecución como administrador, 4,8 MB de archivo ZIP.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no pueden cargar este artefacto).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de lenguaje ni un modelo multimodal. Cualquier comparación con LLM open source (por parámetros, contexto o licencia) sería engañosa.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Artefacto principal | ZIP con `.exe` para Windows | Pesos en safetensors o GGUF |
| Pesos y tokenizador | Ausentes | Presentes |
| Pipeline declarado | No disponible | Text generation, image-text-to-text, etc. |
| Evaluable con benchmarks | No | Sí |
| Despliegue en vLLM/llama.cpp | Imposible | Posible |

## Limitaciones y advertencias

- No es un modelo de IA: no debe citarse como tal en comparativas, rankings ni informes técnicos.
- El binario se descarga desde un repositorio de GitHub de terceros (`JoaoSchaefer973/rob-run-cheat-mod-menu-2026`) distinto del autor declarado en Hugging Face, lo que rompe la cadena de custodia y dificulta la verificación.
- El ZIP está protegido con contraseña (`2026`), un patrón que dificulta el análisis automático por parte de antivirus y servicios de sandbox.
- Se solicita ejecución como administrador, lo que amplía el impacto potencial de cualquier comportamiento malicioso.
- El binario manipula claves privadas de wallets según su propia descripción (bóveda AES-256 local); ejecutarlo con fondos reales implica riesgo directo de pérdida de capital.
- No hay código fuente, auditoría, firma de código ni reproducibilidad; la licencia MIT declarada no aporta garantías sobre el contenido distribuido.
- Riesgo elevado de alucinación no aplica, pero sí de suplantación: la model card imita el formato de fichas de modelos reales con insignias, tablas y FAQ para ganar apariencia de legitimidad.
- Uso comercial: la licencia MIT permitiría teóricamente su redistribución, pero se desaconseja cualquier uso en producción sin análisis forense previo del binario.
- Los metadatos de idioma (14 idiomas) son heredados de la plantilla y no reflejan ninguna capacidad real.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/aleriasd/raydium-meteora-grpc-sniper-bot-v3
- Repositorio de GitHub referenciado en la model card: https://github.com/GerhardKlein0995/raydium-meteora-grpc-sniper-bot-v3
- Repositorio de GitHub del que se descarga el binario: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026
- Enlace de descarga directa citado en la model card: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
