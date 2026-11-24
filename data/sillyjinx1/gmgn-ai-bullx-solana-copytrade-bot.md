# sillyjinx1/gmgn-ai-bullx-solana-copytrade-bot

## Resumen

La entrada `sillyjinx1/gmgn-ai-bullx-solana-copytrade-bot` de Hugging Face no corresponde a un modelo de inteligencia artificial en el sentido tecnico habitual. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows x64 (`pump-fun-jito-bundler-sniper-bot-2026-v1.2.2-win64.zip`, 4,8 MB) presentado como un bot de copytrading para la red Solana, con empaquetado portable y contrasena de extraccion. No existe informacion sobre arquitectura de red neuronal, parametros, tokenizador ni pesos en el formato convencional.

El autor (`sillyjinx1`) publica la ficha con etiquetas propias de un modelo (`windows`, `portable`, `x64`, licencia `mit` y una lista de 14 idiomas), pero el contenido de la model card describe funcionalidades de un programa de escritorio: copia de carteras de ballenas, sandbox de paper trading, bundler de 20 wallets con Lookup Tables, take profit multinivel, enrutado de ordenes por debajo de 40 ms y filtro antihoneypot. Ninguno de esos elementos es un componente de un modelo de lenguaje.

Por tanto, esta ficha documenta lo que el repositorio declara ser, senalando de forma explicita todos los campos tecnicos que no estan disponibles. No se ha publicado ningun dato verificable sobre pesos, entrenamiento, benchmarks ni rendimiento de inferencia, y el propio patron de distribucion (ZIP con contrasena, ejecutable como administrador, enlaces a repositorios de terceros) es caracteristico de campanas de software potencialmente no deseado, no de un modelo open source evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; se describe como aplicacion portable x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas de la model card) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP de 4,8 MB con un `.exe` para Windows 10/11 x64) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal, dataset de entrenamiento, numero de tokens, proceso de alineamiento (RLHF/DPO) ni innovacion algorítmica. La model card enumera subsistemas funcionales de una aplicacion de trading: mirroring de wallets, simulacion de paper trading, bundling de transacciones mediante Lookup Tables de Solana, take profit escalonado con trailing stop, enrutado de ordenes por WebSocket y gRPC, y verificacion de mint/freeze authority y bloqueo de liquidez. Son descripciones de comportamiento de software, no de un modelo.

El unico dato cuantitativo declarado es el tamano del paquete (4,8 MB) y cifras de rendimiento del supuesto ejecutable (menos de 54 MB de RAM, respuesta por debajo de 4 ms, 20 ms y 29 ms en distintos modulos, 12 hilos de trabajo). No hay trazabilidad sobre como se obtienen esas cifras ni codigo fuente asociado en el repositorio de Hugging Face.

## Capacidades

- No se declara ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- La model card atribuye al binario funciones de copytrading, paper trading, bundling multi-wallet, take profit automatizado, enrutado de ordenes y filtrado de honeypots.
- La lista de idiomas (14) figura solo como metadato; no hay evidencia de capacidades linguisticas asociadas.

## Casos de uso

- No disponible. Al no tratarse de un modelo de IA evaluable, no es posible definir casos de uso de inferencia (generacion, clasificacion, RAG, agentes, etc.).
- El unico escenario que el autor describe es la ejecucion del binario en un escritorio Windows x64 para automatizar operaciones en Solana; esta ficha no valida ni recomienda ese uso.
- Cualquier despliegue en produccion de un modelo requiere pesos, tokenizador y licencia verificables, ninguno de los cuales esta presente en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas cifras presentes son autoinformadas por el autor sobre el ejecutable (RAM inferior a 54 MB, latencias de 4 ms, 20 ms y 29 ms, 12 hilos) y no son verificables ni comparables con metricas de modelos (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos de modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles.
- Requisitos declarados por el autor para el binario: Windows 10 u 11 de 64 bits, ejecucion como administrador, 7-Zip o WinRAR para extraer el ZIP con contrasena `2026`.
- Latencia y throughput: solo cifras autoinformadas por el autor, sin metodologia ni reproduccion.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable, ya que el repositorio no contiene un modelo de IA. Frente a modelos open source reales (por ejemplo, familias Llama, Mistral o Qwen), la comparacion no es posible por ausencia de parametros, contexto, pesos y benchmarks.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni codigo de modelo; no es evaluable como modelo de IA pese a estar alojado en Hugging Face.
- Distribucion mediante ZIP protegido con contrasena y ejecutable que solicita privilegios de administrador: patron habitual de software potencialmente no deseado o malicioso.
- Enlaces de descarga apuntan a repositorios de GitHub de terceros (`carlos7088`, `ivanmustafa`) no vinculados al autor de la model card, lo que impide verificar integridad y procedencia.
- Cifras de descargas (186K+) y valoracion (5,0/5) mostradas como badges no son verificables y contrastan con las 0 descargas y 0 likes registrados en Hugging Face.
- No hay informacion sobre sesgos, alucinacion o limitaciones linguisticas porque no hay modelo subyacente.
- La licencia MIT declarada aplica, en su caso, al contenido del repositorio, pero no aclara la situacion legal de un binario de trading automatizado ni el cumplimiento normativo en jurisdicciones con restricciones sobre criptoactivos.
- Riesgo financiero y de seguridad: ejecutar software de trading cerrado con acceso a claves o wallets puede provocar perdida de fondos; no se recomienda su uso sin auditoria de codigo y binario.
- No se debe tratar esta entrada como una recomendacion tecnica; se documenta unicamente con fines de evaluacion y advertencia.

## Enlaces

- Hugging Face: https://huggingface.co/sillyjinx1/gmgn-ai-bullx-solana-copytrade-bot
- Repositorio citado en la model card (tercero): https://github.com/carlos7088/pump-fun-jito-bundler-sniper-bot-2026
- Repositorio citado en la model card (tercero): https://github.com/ivanmustafa/gmgn-ai-bullx-solana-copytrade-bot
- Paper: no disponible
- Blog o documentacion tecnica: no disponible
- Demo: no disponible
