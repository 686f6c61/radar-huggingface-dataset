# AMAImedia/Ling3.2-124B-A5.5B-FP8-GGUF

## Resumen

Ling-3.2-air es un modelo de lenguaje multimodal nativo de tipo MoE híbrido desarrollado por inclusionAI (equipo asociado a Ant Group). Con 124.000 millones de parámetros totales y solo 5.500 millones activos por token, está disenado para automatizacion de flujos de trabajo, razonamiento sobre documentos profesionales y tareas de analisis cuantitativo y legal. La ficha que nos ocupa es una cuantizacion FP8 en formato GGUF publicada por AMAImedia, que facilita el despliegue en infraestructura propia con un equilibrio entre precision y huella de memoria.

La arquitectura combina capas de atencion linear KDA con capas de atencion Gated MLA en proporcion 5:1, lo que reduce el coste computacional del contexto largo manteniendo calidad de atencion completa en puntos clave. El modelo soporta 29 idiomas y una ventana de contexto de 256K tokens, con decodificacion especulativa NEXTN (MTP) integrada en SGLang.

Su relevancia actual radica en que ofrece un rendimiento cercano a modelos propietarios en tareas de agentes y documentos (AutomationBench-AA del 61%, Terminal-Bench 4.0 del 27%) con licencia MIT y pesos abiertos, lo que permite uso comercial sin restricciones y despliegue on-premise. Esta version GGUF FP8 esta pensada para inferencia en GPUs de centro de datos con 4-8 aceleradores de 80-141 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrido con atencion linear KDA + Gated MLA (5:1), transformer |
| Parametros totales | 127.920.654.544 (~124B) |
| Parametros activos | 5.500 millones (~5.5B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | FP8 (esta version); GGUF con imatrix; el repo base ofrece otras cuantizaciones GGUF |
| Idiomas soportados | 29: zh, en, ru, vi, ja, hi, es, fr, de, pt, it, ar, ko, th, id, ms, bn, tr, pl, uk, nl, cs, sv, ro, el, he, fa, ur, kk, uz |
| Licencia | MIT |
| Formato de pesos | GGUF (FP8), safetensors en el modelo base |
| Capas transformer | 35 KDA + 7 Gated MLA (proporcion 5:1), 2 capas densas |
| Expertos | 512 enrutados, 1 compartido, 8 activados |
| Cabezas de atencion | 32 |
| Hidden size | 2560 |
| Tamano intermedio experto | 768 |
| Tamano intermedio denso | 6144 |
| Vocabulario | 157.184 tokens |
| Tamano del repo | 263,8 GB |

## Arquitectura y entrenamiento

Ling-3.2-air emplea una arquitectura MoE hibrida con 35 capas de atencion linear KDA (Kernelized Delta Attention) y 7 capas de Gated MLA, en una proporcion 5:1. Esta combinacion busca reducir el coste cuadratico de la atencion en contextos largos: las capas KDA procesan secuencias con coste lineal, mientras que las capas MLA preservan capacidad de atencion completa en puntos estrategicos de la red. El modelo tiene 512 expertos enrutados, 1 experto compartido y activa 8 expertos por token, lo que explica la relacion 124B/5.5B entre parametros totales y activos. El vocabulario de 157.184 tokens sugiere un tokenizador multilingue ampliado para cubrir los 29 idiomas declarados.

El modelo base es inclusionAI/Ling-3.2-air, que comparte arquitectura multimodal nativa con Ling-3.0-flash-VL. Segun la model card, se ha optimizado para automatizacion de flujos de trabajo y razonamiento sobre documentos profesionales, con mejoras sustanciales frente a su predecesor: AutomationBench-AA pasa del 15,7% al 61%, GDP.pdf all-pass del 8,4% al 16%, AA-Briefcase v1.1 sube 353 puntos Elo (de 987 a 1340) y Terminal-Bench 4.0 pasa del 0% al 27%. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona soporte de decodificacion especulativa NEXTN (MTP) y optimizaciones de decodificacion para Hopper en SGLang.

Esta version concreta es una cuantizacion FP8 en GGUF generada por AMAImedia con imatrix, derivada de la cuantizacion de bartowski. El autor indica que el trabajo de cuantizacion se realizo en hardware alquilado (H200/Blackwell) para modelos de este tamano.

## Capacidades

- Generacion de texto y razonamiento multi-turno en 29 idiomas, incluyendo espanol, ingles, chino, arabe, hindi y la mayoria de lenguas europeas.
- Capacidad multimodal nativa heredada de la arquitectura de Ling-3.0-flash-VL (vision integrada en el modelo base; la cuantizacion GGUF puede no preservar todas las capacidades visuales, no confirmado en la informacion disponible).
- Razonamiento sobre documentos profesionales: analisis de PDFs, informes financieros y textos legales (GDP.pdf, Harvey LAB-AA).
- Automatizacion de flujos de trabajo y agentes: AutomationBench-AA del 61%.
- Ejecucion de tareas en terminal y entornos de linea de comandos: Terminal-Bench 4.0 con 27% de exito.
- Tool calling / function calling: soportado mediante parser automatico en SGLang (`--tool-call-parser auto`, resuelve a `ling3`).
- Modo de razonamiento explicito: parser de razonamiento automatico (`--reasoning-parser auto`).
- Decodificacion especulativa NEXTN (MTP) para acelerar la generacion.
- Analisis cuantitativo de datos y tareas de soporte legal y financiero.

## Casos de uso

- Atencion al cliente automatizada multilingue: con 256K tokens de contexto y 29 idiomas, el modelo puede mantener conversaciones largas con historial completo y atender clientes en espanol, ingles, arabe o hindi sin cambiar de modelo. El bajo numero de parametros activos (5.5B) reduce el coste por token frente a modelos densos equivalentes.
- Automatizacion de flujos de trabajo empresariales: integrado como agente en pipelines de RPA o sistemas de ticketing, el modelo puede encadenar pasos multi-herramienta (consultar APIs, leer documentos, redactar respuestas) gracias al soporte de tool calling y al rendimiento en AutomationBench-AA (61%).
- Analisis de documentos financieros y legales: procesamiento de informes anuales, contratos y expedientes PDF de decenas de paginas dentro de la ventana de contexto, con capacidad de extraer clausulas, comparar condiciones y generar resumenes estructurados. El rendimiento en Harvey LAB-AA (87,7% de criterios superados) lo hace apto para asistencia a equipos juridicos.
- Asistente de desarrollo y operaciones: ejecucion de comandos en terminal, diagnostico de errores y automatizacion de tareas de CI/CD mediante tool calling; el 27% de exito en Terminal-Bench 4.0 lo situa como asistente de operaciones, no como sustituto de un ingeniero.
- Generacion de codigo en produccion: integracion en pipelines de CI/CD para revision de parches, generacion de tests y documentacion tecnica; el soporte de function calling permite conectarlo a repositorios y sistemas de issues.
- Traduccion y localizacion profesional: cobertura de 29 idiomas con un unico modelo, util para plataformas de doblaje y subtitulado (el autor lo publica en el contexto de su plataforma de doblaje automatizado NOESIS).
- Investigacion academica con pesos abiertos: licencia MIT y formato GGUF permiten experimentacion reproducible, fine-tuning y auditoria sin restricciones de uso comercial.
- Despliegue on-premise en sectores regulados: banca, salud o administracion publica pueden ejecutar el modelo en infraestructura propia sin enviar datos a terceros, gracias a la licencia permisiva y a los formatos abiertos.

## Benchmarks y rendimiento

| Benchmark | Ling-3.2-air | Ling-3.0-flash-VL (predecesor) |
|---|---|---|
| Artificial Analysis Intelligence Index v5.0.1 | 23 | no disponible |
| AutomationBench-AA | 61% | 15,7% |
| GDP.pdf (all-pass) | 16% | 8,4% |
| AA-Briefcase v1.1 (Elo) | 1340 | 987 |
| Terminal-Bench 4.0 | 27% | 0% |
| Harvey LAB-AA v1.1 (criterios superados) | 87,7% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, antes de control de alucinacion) | 8,3% | no disponible |
| Harvey LAB-AA v1.1 (all-pass, tras control de alucinacion) | 0,8% | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar de conocimiento general o codigo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo GGUF FP8 ocupa 263,8 GB, por lo que se necesitan al menos 4 GPUs de 80 GB (H100/H800) o 4 GPUs de 141 GB (H20-3e/H200) para cargar los pesos completos con margen para KV cache.
- Configuracion recomendada por el autor: 4 GPUs de clase 141 GB (H20-3e, H200) o nodos Blackwell de 4 GPUs (B300/GB300) con `--tp 4` y contexto de 262.144 tokens.
- En GPUs de 80 GB (H100/H800): escalar a `--tp 8`.
- No cabe en GPUs de consumo (RTX 4090, 3090, 5090) en esta cuantizacion FP8; se requeriria una cuantizacion GGUF de menor precision (Q4/Q5) del repo de bartowski, y aun asi excede la VRAM de una sola tarjeta consumer.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-Ling-3.0-flash-VL` con soporte day-0, NEXTN y optimizaciones Hopper); llama.cpp/Ollama para cuantizaciones GGUF de menor tamano; vLLM y TGI no confirmados en la informacion disponible para esta arquitectura.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa NEXTN y las optimizaciones de decodificacion Hopper deberian mejorar el throughput respecto a decodificacion autoregresiva estandar, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ling-3.2-air (esta ficha, FP8 GGUF) | 124B / 5.5B | 256K | MIT | MoE hibrido KDA+MLA, multimodal nativo, 29 idiomas |
| Ling-3.0-flash-VL | no disponible | no disponible | no disponible | Predecesor directo; mismo linaje arquitectonico; rendimiento inferior en AutomationBench, GDP.pdf, AA-Briefcase y Terminal-Bench |
| Ling-3.2-air (bartowski GGUF) | 124B / 5.5B | 256K | MIT | Cuantizaciones GGUF de referencia del mismo modelo base, sin FP8 |
| inclusionAI/Ling-3.2-air (original) | 124B / 5.5B | 256K | MIT | Pesos safetensors originales en BF16; referencia de maxima calidad |

No se dispone en la informacion proporcionada de comparativas con modelos de otros fabricantes (por ejemplo, Qwen, DeepSeek o Llama) en la misma categoria.

## Limitaciones y advertencias

- Riesgo de alucinacion documentado: en Harvey LAB-AA v1.1, el all-pass cae del 8,3% al 0,8% tras aplicar el control de alucinacion de material, lo que indica que el modelo puede generar contenido no sustentado en los documentos fuente. Es imprescindible validacion humana en contextos legales o financieros.
- La cuantizacion FP8 puede degradar ligeramente la calidad respecto a los pesos BF16 originales; no se aportan metricas comparativas de la perdida de rendimiento.
- Capacidades multimodales (vision) no confirmadas en esta version GGUF; verificar antes de usarla en tareas de imagen.
- El rendimiento en tareas de terminal es limitado (27% en Terminal-Bench 4.0): no es adecuado como agente autonomo de operaciones sin supervision.
- Contexto de 256K: el coste de KV cache crece con la longitud; planificar memoria en consecuencia.
- Idiomas: aunque declara 29 idiomas, la calidad puede variar; no se aportan evaluaciones por idioma.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor de la cuantizacion no ofrece garantias sobre el modelo ni sobre los pesos derivados.
- La model card incluye llamadas a donaciones y enlaces de monetizacion; no afectan a la licencia, pero conviene revisar el origen de la cuantizacion antes de usarla en produccion.
- No se especifican sesgos conocidos ni composicion del dataset de entrenamiento, lo que dificulta la evaluacion de riesgos de sesgo.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/AMAImedia/Ling3.2-124B-A5.5B-FP8-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.2-air
- Cuantizaciones GGUF de bartowski: https://huggingface.co/bartowski/Ling-3.2-air-GGUF
- ModelScope del modelo base: https://www.modelscope.cn/models/inclusionAI/Ling-3.2-air
- Predecesor multimodal: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organizacion inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Web del autor de la cuantizacion: https://AMAImedia.com
- X (Twitter) del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/djbionicl
