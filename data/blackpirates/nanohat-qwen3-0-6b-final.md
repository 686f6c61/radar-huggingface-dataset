# blackpirates/nanohat-qwen3-0.6b-final

## Resumen

NanoHat-0.6B es un modelo de lenguaje ultracompacto de 0,6 mil millones de parámetros, afinado a partir de Qwen/Qwen3-0.6B por el autor blackpirates, cuyo propósito es traducir instrucciones en lenguaje natural a llamadas de sistema Linux estructuradas en formato `<tool_call>` JSON. No es un modelo de propósito general: es el motor de razonamiento del NanoHat Linux OS Harness sobre Fedora Workstation, y está diseñado para operar estrictamente bajo demanda del usuario, no de forma autónoma en segundo plano.

El modelo se distribuye en formatos safetensors y GGUF, con licencia Apache 2.0, y está pensado para ejecución local en hardware de consumo. Su relevancia radica en la combinación de tamaño mínimo (596 millones de parámetros reales) con un rendimiento especializado en tool calling que, según la model card del autor, supera al modelo base en precisión de argumentos y coincidencia exacta de herramientas, manteniendo latencias P50 por debajo de 600 ms en configuraciones sin modo thinking.

La versión publicada como `nanohat:latest` (v4.1.2) se presenta como el checkpoint de producción del proyecto, con mejoras acumuladas en seguridad frente a comandos destructivos y en cadenas de múltiples herramientas. El repositorio de Hugging Face acumula 1508 descargas y un tamaño de 21,1 GB, lo que refleja la inclusión de múltiples cuantizaciones y artefactos además de los pesos principales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras cuantizaciones no especificadas |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha afinado mediante fine-tuning supervisado para especializarlo en la generación de payloads `<tool_call>` JSON contra un contrato de 10 herramientas inyectado por el harness NanoHat. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; únicamente se indica que el objetivo del ajuste es la traducción de instrucciones coloquiales a llamadas de sistema estructuradas, respuestas en texto plano para preguntas generales de Linux, aritmética y rechazos de seguridad.

La innovación principal no reside en la arquitectura, sino en la especialización extrema del ajuste: el modelo aprende a emitir el formato nativo `<tool_call>` de forma consistente (100% de tasa de formato en las 239 consultas de herramientas del benchmark del autor) y a respetar un contrato de herramientas fijo. El harness Python (`pip install nanohat`) es el que inyecta el esquema y despacha las llamadas, de modo que el modelo por sí solo no ejecuta comandos. Se documenta además un modo thinking opcional que mejora la precisión a costa de latencia (P50 de 1307,6 ms frente a 595,7 ms con thinking desactivado).

## Capacidades

- Generación de llamadas a herramientas en formato `<tool_call>` JSON contra un contrato fijo de 10 herramientas de sistema Linux.
- Tool calling y function calling estructurado, con soporte de cadenas de múltiples herramientas (multi-tool chains).
- Respuestas en texto plano para preguntas generales sobre Linux y aritmética.
- Rechazos de seguridad ante peticiones destructivas (100% de tasa de rechazo según la model card en v4.1.2).
- Modo thinking opcional que incrementa la precisión en la selección de herramientas y argumentos.
- Capacidades conversacionales básicas dentro del ámbito del harness.
- Soporte multilingüe limitado al inglés; no se documentan otros idiomas.
- No se documentan capacidades de visión, audio ni generación de código general.

## Casos de uso

- Automatización de tareas de administración en Fedora Workstation: el usuario formula una petición coloquial y el modelo la traduce a una llamada `<tool_call>` que el harness NanoHat ejecuta localmente, sin que el modelo actúe de forma autónoma.
- Asistente de línea de comandos con seguridad integrada: ante peticiones potencialmente destructivas, el modelo emite un rechazo en texto plano, lo que permite construir interfaces de shell asistidas con una capa de seguridad explícita.
- Despliegue en dispositivos de recursos limitados: con 596 millones de parámetros y cuantización GGUF, el modelo puede ejecutarse en CPU o en GPU de consumo, lo que lo hace adecuado para portátiles y estaciones de trabajo sin aceleradores dedicados.
- Integración en pipelines de operaciones: el harness puede invocar el modelo para traducir instrucciones de runbooks a llamadas estructuradas, manteniendo el formato JSON verificable antes de la ejecución.
- Evaluación de contratos de herramientas: al estar especializado en un esquema fijo de 10 herramientas, sirve como referencia para medir la calidad de formato `<tool_call>` en modelos pequeños frente al modelo base.
- Prototipado de agentes locales de un solo paso: cadenas de múltiples herramientas con cobertura parcial del 100% en el benchmark del autor permiten construir flujos de dos o tres comandos encadenados sin salir del equipo.
- Sustituto ligero de modelos mayores en entornos air-gapped: al ejecutarse con llama.cpp u Ollama y no requerir conectividad, encaja en estaciones de trabajo aisladas con requisitos de privacidad.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre 299 consultas no vistas (239 de herramientas + 60 conversacionales, aritméticas y de rechazo de seguridad), evaluadas a través del NanoHat Harness:

| Metrica | Qwen3-0.6B base (think=OFF) | Qwen3-0.6B base (think=ON) | NanoHat v4.1.2 (think=OFF) | NanoHat v4.1.2 (think=ON) |
|---|---|---|---|---|
| Tasa de formato nativo `<tool_call>` (239) | 82,43% | 95,40% | 100,0% | 100,0% |
| Coincidencia exacta de herramienta (239) | 66,95% | 76,99% | 92,89% | 96,65% |
| Coincidencia canónica de argumentos (239) | 51,05% | 65,27% | 85,77% | 92,89% |
| Coincidencia estricta de argumentos (239) | 41,84% | 58,58% | 84,94% | 89,96% |
| Tasa de llamadas duplicadas (menor es mejor) | 0,84% | 1,26% | 0,84% | 0,00% |
| Tasa de paso en sandbox (239) | 73,64% | 86,19% | 99,58% | 99,58% |
| Tasa limpia sin herramientas, cero alucinaciones (60) | 100,0% | 100,0% | 100,0% | 98,33% |
| Tasa de alucinación de herramienta espuria (menor es mejor) | 0,00% | 0,00% | 0,00% | 1,67% |
| Coincidencia combinada intención y herramienta (299) | 73,58% | 81,61% | 94,31% | 96,99% |
| Precisión canónica combinada (299) | 60,87% | 72,24% | 88,63% | 93,98% |
| Latencia mediana P50 | 580,4 ms | 1461,0 ms | 595,7 ms | 1307,6 ms |
| Latencia de cola P95 | 996,4 ms | 3644,7 ms | 1001,1 ms | 2518,2 ms |
| Latencia media | 851,9 ms | 1800,5 ms | 937,0 ms | 1471,9 ms |

Desglose por intención (v4.1.2 frente a base):

| Bucket | Base (think=OFF) | Base (think=ON) | NanoHat v4.1.2 (think=OFF) | NanoHat v4.1.2 (think=ON) |
|---|---|---|---|---|
| Single-tool (209) — coincidencia exacta | 73,68% | 82,78% | 99,04% | 99,04% |
| Single-tool (209) — argumentos canónicos | 56,46% | 70,33% | 91,39% | 95,22% |
| Multi-tool (30) — secuencia exacta | 20,00% | 36,67% | 50,00% | 80,00% |
| Multi-tool (30) — cobertura parcial | 43,33% | 60,00% | 73,33% | 100,0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 596 millones de parámetros, una cuantización GGUF de 4 bits ocupa aproximadamente 400-500 MB, y los pesos en FP16 rondan 1,2 GB.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama baja y ejecución en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF incluido en el repo), Ollama (registro `asimansari-o/nanohat`), transformers, text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo).
- Latencia y throughput: P50 de 595,7 ms y P95 de 1001,1 ms con thinking desactivado; P50 de 1307,6 ms y P95 de 2518,2 ms con thinking activado, medidos por el autor en hardware edge no especificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoHat-0.6B (v4.1.2) | 596 M | no disponible | Tool calling Linux, contrato de 10 herramientas | Apache 2.0 | Hugging Face, Ollama |
| Qwen/Qwen3-0.6B (base) | 0,6 B | no disponible | Propósito general | Apache 2.0 | Hugging Face |
| Alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base Qwen3-0.6B, sobre el que el autor reporta mejoras de 26 puntos en coincidencia exacta de herramienta (66,95% a 92,89% con thinking desactivado) y de 34,7 puntos en coincidencia canónica de argumentos (51,05% a 85,77%). No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está ajustado para un contrato fijo de 10 herramientas del harness NanoHat; fuera de ese esquema su utilidad es limitada.
- Idioma: solo se documenta inglés; no hay evidencia de soporte para castellano ni otros idiomas.
- Longitud de contexto: no documentada en la información disponible, lo que impide garantizar conversaciones multi-turno largas.
- Alucinación de herramientas: la model card reporta un 1,67% de llamadas espurias con thinking activado, aunque un 0% con thinking desactivado en el conjunto evaluado.
- Dependencia del harness: el modelo por sí solo no ejecuta comandos; requiere el CLI Python `nanohat` para inyectar el esquema y despachar las llamadas, lo que añade una dependencia externa en producción.
- Evaluación autoinformada: todos los benchmarks proceden del autor y del harness del propio proyecto, sin validación independiente conocida.
- Cadenas multi-tool: la coincidencia exacta de secuencia es del 50% con thinking desactivado y del 80% con thinking activado, por lo que los flujos de varios pasos siguen siendo un punto débil.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda las limitaciones y sesgos del Qwen3-0.6B base, no documentados en esta ficha.
- Tamaño del repositorio: 21,1 GB, lo que puede dificultar la descarga en entornos con ancho de banda limitado; conviene seleccionar únicamente los artefactos GGUF necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackpirates/nanohat-qwen3-0.6b-final
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del harness NanoHat: https://github.com/asimansari-git/NanoHat
- Registro en Ollama: https://ollama.com/asimansari-o/nanohat
- DOI del proyecto: https://doi.org/10.5281/zenodo.23618505
