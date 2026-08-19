# glyphsoftware/sentinel-r3-gguf

## Resumen

Sentinel-R3 es un modelo de lenguaje especializado en seguridad ofensiva, desarrollado por Glyph Software LLP. Está diseñado para tareas de red team, pruebas de penetración y ciberseguridad ofensiva, con soporte nativo para tool calling y uso de agentes. El modelo se distribuye en formato GGUF cuantizado, lo que permite su ejecución local en hardware de consumo mediante llama.cpp u otros motores compatibles.

Con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), Sentinel-R3 se posiciona en la gama media-alta de modelos locales. Su licencia propietaria (glyph-proprietary-1.0) y su acceso restringido en HuggingFace limitan su uso comercial y requieren aceptación de condiciones. El modelo está orientado exclusivamente al idioma inglés y su propósito principal es la automatización de tareas de seguridad ofensiva en entornos autorizados.

La relevancia de Sentinel-R3 radica en su especialización: mientras que los modelos generalistas pueden asistir en tareas de seguridad, este modelo está afinado específicamente para el ciclo completo de una prueba de penetración, desde el reconocimiento hasta la explotación y el post-explotación, integrando razonamiento multi-paso y ejecución de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta sugiere qwen3_5, no confirmado) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo GGUF, cuantizaciones no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | glyph-proprietary-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna de Sentinel-R3. La etiqueta `qwen3_5` en HuggingFace sugiere una posible base en la familia Qwen, pero no esta confirmada. Tampoco se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados o el uso de tecnicas como RLHF o DPO.

El modelo base es `glyphsoftware/sentinel-r3`, y la version GGUF es una cuantizacion de ese modelo para inferencia local. La organizacion Glyph Software ha publicado versiones anteriores (r2, r2.1, r2.2) con caracteristicas similares: soporte de tool calling, formato de chat con roles system/user/assistant/tool, y un enfoque en escenarios de pentesting autorizado. Se desconoce si Sentinel-R3 incorpora innovaciones tecnicas adicionales respecto a sus predecesores.

## Capacidades

- Generacion de texto especializada en seguridad ofensiva: reconocimiento, escaneo de vulnerabilidades, explotacion, post-explotacion y redaccion de informes.
- Soporte de tool calling / function calling: el modelo puede invocar herramientas externas (nmap, curl, scripts personalizados) y procesar sus resultados.
- Capacidades de agente: razonamiento multi-paso y ejecucion de secuencias de acciones para completar tareas complejas de pentesting.
- Uso de formato de chat con roles system, user, assistant y tool, permitiendo establecer un "persona" de pentester y reglas de compromiso.
- Multilingue: no, solo ingles (segun la etiqueta `en`).
- No se indica soporte de vision, audio u otras modalidades.

## Casos de uso

- Automatizacion de reconocimiento pasivo y activo: el modelo puede generar comandos para enumerar subdominios, puertos y servicios, y analizar los resultados para identificar vectores de ataque.
- Generacion de exploits y payloads: dado un CVE o una vulnerabilidad conocida, Sentinel-R3 puede redactar codigo de explotacion o adaptar payloads existentes.
- Orquestacion de herramientas de pentesting: integrado en un agente, el modelo decide que herramienta ejecutar (nmap, gobuster, sqlmap, etc.), interpreta la salida y ajusta la siguiente accion.
- Redaccion de informes de pruebas de penetracion: a partir de los hallazgos, el modelo genera documentacion tecnica con evidencias, impacto y recomendaciones de mitigacion.
- Simulacion de adversarios en ejercicios de red team: el modelo puede actuar como un atacante autonomo en entornos de laboratorio controlados, probando defensas y detectando brechas.
- Asistencia en respuesta a incidentes: aunque su foco es ofensivo, puede ayudar a entender tecnicas de ataque para mejorar la postura defensiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni metricas especificas de seguridad ofensiva (como tasas de exito en entornos CTF o pruebas de penetracion).

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 26,9B parametros en GGUF, las necesidades aproximadas son:
  - Q4_K_M: ~15-16 GB VRAM
  - Q5_K_M: ~17-18 GB VRAM
  - Q8_0: ~27-28 GB VRAM
  (estimaciones basadas en modelos de tamano similar; no hay datos oficiales)
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para cuantizaciones Q4/Q5; A100 40GB o H100 para cuantizaciones mayores o mayor velocidad.
- En consumer GPU: cabe en RTX 3090/4090 con cuantizacion Q4_K_M o Q5_K_M. No cabe en GPUs de 12 GB o menos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptador GGUF), text-generation-inference (TGI) si se convierte a safetensors.
- Latencia y throughput: no disponibles. Dependen de la GPU y la cuantizacion; en una RTX 4090 con Q4_K_M se puede esperar entre 20-40 tokens/s, pero no es un dato oficial.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. Existen otros modelos de seguridad ofensiva como WhiteRabbitNeo (13B y 33B) o PentestGPT, pero no hay datos publicos de rendimiento comparado con Sentinel-R3. La licencia propietaria y el acceso restringido limitan la disponibilidad frente a alternativas open source.

## Limitaciones y advertencias

- Licencia propietaria (glyph-proprietary-1.0): restringe el uso comercial y la redistribucion. Es necesario aceptar condiciones en HuggingFace para acceder al modelo.
- Acceso gated: el modelo no es de descarga libre; requiere aprobacion de la organizacion.
- Idioma: solo ingles, lo que limita su uso en entornos no angloparlantes.
- Sesgos y alucinaciones: al ser un modelo especializado en seguridad ofensiva, puede generar contenido peligroso si se usa fuera de entornos autorizados. No se han publicado evaluaciones de sesgo o robustez.
- Riesgo de uso indebido: el modelo esta disenado para ataques; su uso debe limitarse a pruebas autorizadas y entornos de laboratorio.
- Sin datos de contexto: se desconoce la longitud maxima de contexto, lo que puede afectar a tareas que requieran historiales largos.
- Sin informacion sobre cuantizaciones disponibles: el repo GGUF no lista las variantes, por lo que el usuario debe inspeccionar el contenido antes de descargar.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/glyphsoftware/sentinel-r3-gguf
- Modelo base (safetensors): https://huggingface.co/glyphsoftware/sentinel-r3
- Organizacion Glyph Software: https://huggingface.co/glyphsoftware/models
- Repositorio del agente Sentinel (CLI): https://github.com/Glyph-Software/sentinel
- Version anterior r2.1 en LM Studio Hub: https://lmstudio.ai/glyphsoftware/sentinel-r2.1-gguf
