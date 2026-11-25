# kennnnnzx/hyperliquid-trading-bot-perp-copytrade

## Resumen

El repositorio `kennnnnzx/hyperliquid-trading-bot-perp-copytrade` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como binario portable para Windows x64 (archivo `delta-executor-pc-2026-v1.2.2-win64.zip`, 4,8 MB) que se presenta bajo la etiqueta de "bot de trading" para Hyperliquid, pero cuya model card describe en realidad funcionalidades de un *executor* de Roblox (adjunción a procesos, inyección de scripts en una VM Luau, editor Monaco, sincronización de offsets tras parches del cliente). No hay pesos, tokenizador, arquitectura de red neuronal ni pipeline de inferencia asociados.

La ficha se redacta, por tanto, como evaluación técnica de un artefacto que aparece indexado en Hugging Face con apariencia de modelo, pero que no lo es. Esto es relevante para desarrolladores e investigadores porque este tipo de repositorios emplean tageo y nomenclatura propios de modelos (licencia, idiomas, pipeline) para ganar visibilidad y distribuir ejecutables potencialmente maliciosos mediante ingeniería social: contraseña de archivo, enlaces a releases de terceros, instrucciones para ejecutar como administrador y para desactivar avisos de SmartScreen.

No se dispone de información sobre arquitectura, parámetros, contexto ni datos de entrenamiento porque no existen. Cualquier uso en producción de este artefacto conlleva riesgos de seguridad graves y no debe confundirse con un modelo desplegable mediante vLLM, llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Windows con VM Luau) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; sin relación con capacidades lingüísticas reales) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` x64 de 4,8 MB) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. Según la propia model card, el binario implementa mecanismos de adjunción a procesos de cliente, un puente con una VM Luau, un editor Monaco con resaltado de sintaxis y consola, adjunción multi-instancia, ejecución "keyless" de scripts y sincronización de offsets tras actualizaciones semanales del cliente ("automated Wednesday client signature updates"). Estas descripciones corresponden a herramientas de inyección de código en aplicaciones de terceros, no a un transformer, MoE, SSM ni modelo híbrido.

No hay datos sobre número de tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). La etiqueta `pipeline` del repositorio figura como no disponible, coherente con la ausencia de un pipeline de aprendizaje automático.

## Capacidades

- No genera texto, no razona, no escribe código ni resuelve matemáticas: no es un modelo lingüístico.
- No soporta *tool calling* ni *function calling* en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales pese a declarar 14 idiomas en los metadatos.
- El binario declara funcionalidades de ejecución de scripts en cliente, adjunción a procesos y sincronización de offsets, según la model card del autor.
- No se documenta modo *thinking*, visión, audio ni ninguna modalidad de entrada/salida de IA.

## Casos de uso

- Ninguno recomendado. El artefacto no es un modelo y su ejecución implica riesgos de seguridad no evaluados.
- Auditoría de seguridad: analizar el ZIP y el `.exe` en un entorno aislado (sandbox sin red, máquina virtual desechable) para determinar comportamiento real antes de cualquier otra consideración.
- Investigación de campañas de *malware* distribuidas vía Hugging Face: el repositorio es un caso de estudio de tageo abusivo (etiquetas de modelo, licencia MIT e idiomas) para promocionar un ejecutable.
- Monitorización de la plataforma: usar este tipo de repositorios como señal para construir reglas de detección (binarios `.exe`/`.zip` con contraseña, enlaces a releases de terceros, instrucciones de ejecución como administrador).
- Formación interna: ejemplo didáctico de por qué no debe ejecutarse software descargado de un repositorio de modelos sin verificación de procedencia ni firma.
- No usar en ningún caso para trading real: el nombre sugiere operativa con perpetuos en Hyperliquid, pero no hay evidencia de funcionalidad legítima de trading ni de gestión segura de claves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de MMLU, HumanEval, GSM8K ni métricas de inferencia. Las únicas cifras presentes en la model card (RAM "< 60 MB", tiempos de respuesta "< 4 ms" y "< 16 ms", 7 y 12 hilos de trabajo) son afirmaciones del autor sobre el ejecutable, no mediciones verificables de un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10/11 de 64 bits, procesadores Intel o AMD x64, y una huella de memoria inferior a 60 MB según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica; el artefacto es un binario `.exe` que el autor indica ejecutar como administrador.
- Latencia y throughput: no disponibles ni verificables; las cifras de milisegundos de la model card no son medibles de forma independiente.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. A modo de contraste puramente estructural:

| Artefacto | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `kennnnnzx/hyperliquid-trading-bot-perp-copytrade` | Ejecutable Windows (no modelo) | no disponible | no disponible | MIT | ZIP con `.exe` x64 |
| Modelo LLM open source típico | Red neuronal transformer | Millones a cientos de miles de millones | Miles a millones de tokens | Variable (Apache-2.0, MIT, etc.) | safetensors, GGUF |
| Modelo de visión típico | CNN/ViT | Millones a miles de millones | no aplica | Variable | safetensors, ONNX |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, tokenizador y pipeline; no puede evaluarse con métricas de NLP.
- Riesgo de seguridad elevado: distribución de un `.exe` protegido con contraseña (`2026`), alojado en un release de GitHub de un tercero (`dawidb9567/...`), con instrucciones para ejecutarlo como administrador y para excluirlo de Windows Defender/SmartScreen.
- La model card mezcla terminología de trading con funcionalidades de *executor* de Roblox, lo que sugiere suplantación de identidad y posible *malware* o *adware*.
- Descargas y *likes* a cero en el momento de la consulta: sin evidencia de adopción ni de revisión por la comunidad.
- Licencia MIT declarada, pero sin código fuente ni artefactos auditables que permitan verificar su aplicabilidad.
- Idiomas declarados sin respaldo funcional; no debe interpretarse como soporte multilingüe real.
- Uso comercial desaconsejado: sin garantías, sin soporte, sin trazabilidad de dependencias y con riesgo legal si el binario interactúa con servicios de terceros (Hyperliquid, Roblox) incumpliendo sus términos.
- No debe ejecutarse en máquinas con credenciales, carteras de criptomonedas o datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kennnnnzx/hyperliquid-trading-bot-perp-copytrade
- Release de terceros citado en la model card: https://github.com/dawidb9567/delta-executor-pc-2026/releases/download/v1.2.0/delta-executor-pc-2026-v1.2.2-win64.zip
- Releases del repositorio citado como origen: https://github.com/ReneBarnes478/hyperliquid-trading-bot-perp-copytrade/releases/latest
- Papers, blogs, demos o documentación técnica: no disponible
