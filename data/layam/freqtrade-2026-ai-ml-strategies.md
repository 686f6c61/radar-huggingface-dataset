# layam/freqtrade-2026-ai-ml-strategies

## Resumen

El repositorio `layam/freqtrade-2026-ai-ml-strategies` alojado en Hugging Face no contiene un modelo de lenguaje en el sentido habitual del término. Se trata de un artefacto empaquetado para Windows x64 (un archivo ZIP de 8,9 MB con un ejecutable `.exe`) que se presenta como una herramienta de trading algorítmico basada en Freqtrade con estrategias de machine learning. La model card describe funcionalidades de trading (paper-trading, take profit multinivel, enrutado de órdenes, filtros anti-honeypot, gestión de claves AES-256) y no incluye ninguna información sobre arquitectura de red neuronal, parámetros, tokenizador o contexto.

No se dispone de datos sobre el desarrollador más allá del alias `layam`. El repositorio no registra descargas ni interacciones (0 descargas, 0 likes) y fue creado y actualizado el mismo día (24 de noviembre de 2026), lo que sugiere una publicación automatizada o de muy reciente creación. Es relevante advertir que la estructura de la model card (instrucciones para descargar un ZIP protegido con contraseña desde un repositorio de GitHub de terceros, ejecutar un `.exe` como administrador y "activar módulos") coincide con patrones habituales de distribución de software potencialmente no verificado, no con la de un modelo de IA open source convencional.

Por tanto, esta ficha documenta lo que el repositorio declara explícitamente y marca como "no disponible" todo aquello que no puede confirmarse, sin atribuirle capacidades de modelo de lenguaje que no se evidencian en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se declara arquitectura de modelo; el artefacto es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con `.exe` para Windows; no se publican safetensors, GGUF ni otros formatos de pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red, datos de entrenamiento, número de tokens, composición del dataset ni procesos de alineación (RLHF, DPO) en la información disponible. La model card no describe un transformer, MoE, SSM ni ningún otro paradigma de modelo; se limita a enumerar funcionalidades de una aplicación de trading (sandbox de paper-trading, take profit multinivel, bundler de 20 wallets, filtro anti-honeypot, enrutado de órdenes con latencias declaradas de menos de 40 ms, vault local AES-256).

Las cifras técnicas que aparecen en la model card (tiempos de respuesta de 22-27 ms, sondeo a 243 Hz, tamaño de 8,9 MB, build `F9D523`) corresponden a un binario de aplicación, no a un modelo de IA, y no son verificables desde el repositorio de Hugging Face. No hay información sobre innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling en el sentido de un modelo de lenguaje.
- No se declara soporte de agentes ni razonamiento multi-paso.
- La model card menciona capacidades de aplicación de trading: simulación de paper-trading, take profit multinivel con trailing stop, ejecución multi-wallet mediante lookup tables, filtro anti-honeypot (verificación de mint/freeze authority y bloqueo de LP), enrutado de órdenes por WebSocket/gRPC y almacenamiento local de claves AES-256.
- Multilingüismo: los metadatos listan 14 idiomas, pero no se especifica ninguna capacidad lingüística del artefacto; probablemente reflejan la localización de la documentación, no del software.

## Casos de uso

- Evaluación de estrategias de trading en simulación: la herramienta declara un sandbox de paper-trading contra libros de órdenes en vivo; podría usarse para probar estrategias sin riesgo de capital, aunque la naturaleza no verificada del binario desaconseja su ejecución en entornos con datos sensibles.
- Automatización de salidas escalonadas: el take profit multinivel con migración a trailing stop podría emplearse en bots de trading que necesiten cerrar posiciones por tramos.
- Ejecución multi-wallet: el bundler de 20 wallets con lookup tables apunta a escenarios de ejecución coordinada en el mismo bloque, típicos de operativa on-chain.
- Filtrado de tokens fraudulentos: el filtro anti-honeypot podría integrarse en un pipeline previo a la compra para descartar contratos con autoridades de mint/freeze activas o liquidez no bloqueada.
- Enrutado de órdenes de baja latencia: el streaming por WebSocket y gRPC con latencias declaradas inferiores a 40 ms encajaría en estrategias sensibles a la latencia, si las cifras fueran verificables.
- Gestión local de claves: el vault AES-256 no custodial podría usarse para firma local sin exponer claves a servicios remotos, siempre que el binario haya sido auditado.
- Advertencia transversal: ninguno de estos casos debe considerarse validado; la distribución vía ZIP con contraseña y ejecutable como administrador desde un repositorio de GitHub de terceros es un vector de riesgo conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente métricas de aplicación (tiempos de respuesta declarados de 22-27 ms, sondeo a 243 Hz) que no son benchmarks de modelo y no son verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica / no disponible (no se declara un modelo de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Plataforma declarada: Windows 10/11 de 64 bits (x64).
- Tamaño del artefacto: 8,9 MB (ZIP).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto es un ejecutable de Windows.
- Latencia y throughput: la model card declara menos de 40 ms en enrutado de órdenes y 243 Hz de sondeo, sin metodología de medición publicada.

## Comparativa con modelos similares

No disponible. No se identifican modelos comparables porque el repositorio no publica un modelo de lenguaje ni pesos; los artefactos comparables serían otras herramientas de trading algorítmico, fuera del alcance de esta ficha. Como referencia de la categoría "modelo de IA", no hay parámetros, contexto ni benchmarks que permitan una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA verificable: no hay pesos, arquitectura, tokenizador ni benchmarks publicados; tratarlo como modelo de lenguaje sería un error de categoría.
- Riesgo de seguridad elevado: la instalación propuesta implica descargar un ZIP de un repositorio de GitHub de terceros, extraerlo con contraseña y ejecutar un `.exe` como administrador; este patrón es habitual en campañas de distribución de software no deseado.
- Cero señales de validación comunitaria: 0 descargas y 0 likes en Hugging Face, repositorio creado y actualizado el mismo día.
- Las métricas declaradas (latencias, frecuencias de sondeo, número de wallets) no incluyen metodología ni código fuente auditable.
- Licencia MIT declarada en los metadatos, pero sin archivo de licencia ni código visible que permita verificar su aplicabilidad; el uso comercial del binario no está respaldado por una auditoría.
- Ámbito financiero: cualquier uso en trading real conlleva riesgo de pérdida de capital; no hay evidencia de backtesting reproducible ni de resultados auditados.
- Idiomas: los 14 idiomas listados en metadatos no implican capacidades lingüísticas del artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/layam/freqtrade-2026-ai-ml-strategies
- Repositorio de GitHub citado en la model card: https://github.com/VasitoTa77/freqtrade-2026-ai-ml-strategies
- Descarga del archivo ZIP citada en la model card: https://github.com/VasitoTa77/freqtrade-2026-ai-ml-strategies/releases/latest/download/freqtrade-2026-ai-ml-strategies-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/VasitoTa77/freqtrade-2026-ai-ml-strategies/releases/latest
- Proyecto Freqtrade (referencia del nombre, no afiliado según la información disponible): https://github.com/freqtrade/freqtrade
