# cpral/Bielik-11B-v3.1-Instruct-ungated

## Resumen

Bielik-11B-v3.1-Instruct es un modelo de lenguaje generativo de tipo causal decoder-only con 11.168.796.672 parámetros, desarrollado por SpeakLeash en colaboración con el centro de supercomputación ACC Cyfronet AGH. Se trata de una actualización de la línea Bielik 11B v3 que amplía el preentrenamiento continuo multilingüe y refuerza el post-entrenamiento orientado a seguimiento de instrucciones, uso de herramientas y razonamiento. El modelo está optimizado especialmente para polaco y otras lenguas europeas, cubriendo 56 idiomas en total.

La ficha que nos ocupa, `cpral/Bielik-11B-v3.1-Instruct-ungated`, es una réplica del modelo original `speakleash/Bielik-11B-v3.1-Instruct` con la recolección de datos desactivada y con requisito de autenticación en Hugging Face para descargar los pesos. Los pesos, la licencia y el comportamiento del modelo son idénticos al original; solo cambia el mecanismo de acceso y el tratamiento de telemetría.

El modelo resulta relevante para desarrolladores que necesitan un LLM de tamano medio (11B) con contexto de 32.768 tokens, soporte nativo de tool calling y un modo de razonamiento explícito controlable mediante `reasoning_effort`, todo ello bajo licencia Apache 2.0 y con un énfasis poco habitual en lenguas europeas de menor representación, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parametros totales | 11.168.796.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de despliegue con vLLM; no se documenta un máximo distinto) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (los pesos se distribuyen en safetensors; no se listan variantes GGUF/AWQ/GPTQ oficiales) |
| Idiomas soportados | 56 idiomas: pl, en, es, de, fr, it, pt, nl, ru, uk, cs, sk, sl, hr, sr, bs, bg, mk, ro, hu, el, tr, da, sv, no, fi, et, lt, lv, is, ca, gl, eu, cy, ga, gd, lb, fo, mt, sq, hy, az, be, ka, kk, la, ar, he, fa, hi, id, ja, ko, zh, vi, cnr, hbs |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 11B parámetros. El pipeline de entrenamiento consta de tres etapas: preentrenamiento sobre 500.000 millones de tokens de corpus multilingües cuidadosamente seleccionados y procesados por el equipo de SpeakLeash, con énfasis en lenguas europeas y polaco; SFT sobre 26 millones de muestras; y una etapa de aprendizaje por refuerzo basada en una variante modificada de GRPO ejecutada sobre 14 entornos diversos. El entrenamiento se llevó a cabo en la infraestructura HPC de ACC Cyfronet AGH (supercomputadores Athena y Helios) dentro del entorno PLGrid y de la Gaia AI Factory.

El post-entrenamiento incorpora un formato propio de razonamiento (``) y de llamada a herramientas (`<tool_call>{"name": …, "arguments": …}</tool_call>`), con parsers específicos publicados en el repositorio `speakleash/bielik-tools` para vLLM. El framework de entrenamiento utilizado es ALLaMo, una implementación de código abierto desarrollada por Krzysztof Ociepa. No se documentan en la información disponible innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno en 56 idiomas, con especial calidad en polaco y lenguas europeas.
- Razonamiento explícito mediante modo thinking controlable con `reasoning_effort` en cinco niveles: `none` (por defecto), `low`, `medium`, `high` y `max`.
- Tool calling / function calling nativo con formato propio y parsers oficiales para vLLM (v0.24 o superior, probado en 0.32).
- Soporte de agentes y razonamiento multi-paso, con posibilidad de excluir definiciones de herramientas cuando `tool_choice="none"`.
- Seguimiento de instrucciones reforzado mediante SFT y RL sobre 14 entornos.
- Capacidades multilingües amplias, incluyendo castellano, catalán, gallego y euskera.
- No se documentan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Atención al cliente automatizada en Europa: el modelo puede gestionar conversaciones multi-turno con hasta 32.768 tokens de contexto y responder en el idioma del usuario entre 56 lenguas, lo que lo hace adecuado para despliegues regionales con requisitos de cobertura lingüística amplia.
- Generación de código asistida con tool calling: gracias a su formato estructurado de llamadas a funciones y a los parsers de vLLM, puede integrarse en pipelines de CI/CD o en asistentes de IDE que invoquen herramientas externas (compiladores, linters, APIs de repositorios).
- Agentes autónomos de razonamiento multi-paso: con `reasoning_effort="high"` o `"max"` el modelo emite trazas de pensamiento separadas del contenido final, lo que facilita la auditoría de decisiones en flujos agénticos.
- Procesamiento de documentación técnica multilingüe: resumen, extracción y reescritura de documentos largos en lenguas europeas de menor representación donde otros modelos rinden peor.
- Asistentes para administraciones públicas y empresas en Polonia y Europa central: el énfasis del entrenamiento en polaco, checo, eslovaco, húngaro, rumano y lenguas balcánicas lo posiciona bien para tareas de redacción administrativa y traducción interna.
- Investigación en PLN europea: evaluación comparativa de modelos multilingües, experimentos de alineación con GRPO y estudios de razonamiento controlable sobre una base Apache 2.0.
- Despliegue on-premise con vLLM: al caber en una sola GPU de 80 GB en precisión completa y ser servible con parsers oficiales, encaja en infraestructuras privadas con requisitos de soberanía de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22,3 GB en fp16/bf16 (tamano del repositorio de pesos), alrededor de 11-12 GB en cuantización de 8 bits y en torno a 6-7 GB en 4 bits (estimaciones por tamano de parámetros; no se listan cuantizaciones oficiales).
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB para servicio en fp16 con contexto completo de 32.768 tokens y concurrencia moderada; L40S 48 GB como alternativa.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización de 8 o 4 bits, o en fp16 con contexto reducido y batch pequeno; en RTX 3090 (24 GB) de forma similar.
- Opciones de despliegue: vLLM 0.24 o superior con los parsers de `speakleash/bielik-tools` (recomendado para tool calling y reasoning estructurados); transformers con la plantilla `chat_template.jinja` incluida; llama.cpp u Ollama requerirían conversión a GGUF, no documentada oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-11B-v3.1-Instruct (esta ficha) | 11,17B | 32.768 | Apache 2.0 | Multilingüe europeo, tool calling, reasoning | Hugging Face (con autenticación en esta réplica) |
| Bielik-11B-v3.0-Instruct | no disponible | no disponible | Apache 2.0 | Versión anterior de la misma familia | Hugging Face |
| Modelos comparables de 11B (p. ej. Mistral, Llama) | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada | no disponible |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se documentan mitigaciones específicas más allá del modo de razonamiento.
- Sesgos potenciales derivados del corpus de preentrenamiento, con sobrerrepresentación del polaco y de lenguas europeas frente a otras regiones.
- El modo de razonamiento consume tokens adicionales; si se agota `max_tokens` durante la fase de pensamiento, el campo `content` queda vacío.
- La bandera `enable_thinking` de Bielik v3.0 se ignora en esta plantilla; es necesario usar `reasoning_effort`.
- El tool calling estructurado requiere vLLM 0.24 o superior y los parsers oficiales; sin ellos el modelo puede emitir llamadas como texto plano.
- Esta réplica exige autenticación en Hugging Face para descargar los pesos, lo que anade un paso operativo respecto al modelo original.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento originales si se requiere garantía legal plena.
- No se documentan cuantizaciones oficiales; cualquier conversión a GGUF o formatos de 4 bits corre a cargo del usuario y puede degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/Bielik-11B-v3.1-Instruct-ungated
- Modelo base original: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Organización SpeakLeash: https://speakleash.org/
- ACC Cyfronet AGH: https://www.cyfronet.pl/en
- Supercomputadores Athena y Helios: https://www.cyfronet.pl/en/supercomputers/our-supercomputers
- PLGrid: https://plgrid.pl/
- Gaia AI Factory: https://gaia.plgrid.pl/
- EuroHPC Joint Undertaking: https://www.eurohpc-ju.europa.eu/index_en
- Framework ALLaMo: https://github.com/chrisociepa/allamo
- Parsers de tool calling y reasoning para vLLM: https://github.com/speakleash/bielik-tools
- Chat oficial: https://chat.bielik.ai/
