# MindMapDigital/Bhed-v0.1

## Resumen
Bhed (भेद, "distinción" en hindi) es un modelo de redacción de información personal identificable (PII) multilingüe desarrollado por MindMapDigital. Está diseñado específicamente para procesar consultas de carácter legal y fiscal en español, inglés e hindi/hinglish, devolviendo el mismo texto con los datos personales sustituidos por etiquetas tipadas como `[PER_1]`, `[TAX_ID_1]`, `[BANK_ACCOUNT_1]`, `[NATIONAL_ID_1]` o `[MONEY_1]`. El modelo se distribuye como un paquete Python (`bhed`) que gestiona la carga, el prompting, la decodificación y el post-procesado determinista.

La propuesta diferencial del modelo es la preservación literal del texto fuera de las entidades detectadas: según la model card, la fidelidad del texto no redactado es del 100 % por construcción, ya que solo se sustituyen los fragmentos coincidentes. Además, la API expone un campo `blocked` que se activa si la salida no se puede parsear o si persisten fugas de identificadores, lo que aporta una capa de seguridad adicional en entornos de producción sensibles.

El modelo se publica bajo licencia Apache 2.0, con un tamaño de repositorio de aproximadamente 0,1 GB y dependencias de `torch>=2.1` y `transformers>=4.45`. Está pensado para ejecutarse preferentemente en GPU CUDA (con soporte de CPU en float32) y su ámbito declarado son consultas legales y fiscales en los tres idiomas indicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se mencionan dtypes de carga: bfloat16, float16, float32) |
| Idiomas soportados | español (es), inglés (en), hindi/hinglish (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna del modelo (no se especifica si es un transformer denso, MoE u otra variante), ni el número de parámetros, ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente describe el comportamiento funcional: dado un texto de entrada, el modelo genera una salida JSON con el mapeo de entidades, que el paquete `bhed` procesa de forma determinista para producir el texto redactado.

Sí se documenta un detalle técnico relevante: `redact` utiliza decodificación greedy y post-procesado determinista, lo que garantiza que el texto fuera de las etiquetas se preserve íntegramente. El campo `blocked` del método `analyze` actúa como salvaguarda cuando la salida del modelo no es parseable o contiene identificadores residuales, lo que sugiere un diseño orientado a la robustez en pipelines de privacidad. El modelo base (foundation weights) se descarga en la primera carga, mientras que el paquete local ocupa unos 120 MB.

## Capacidades
- Redacción de PII en español, inglés e hindi/hinglish: sustituye nombres, identificadores fiscales, cuentas bancarias, teléfonos, identificadores nacionales y cantidades monetarias por etiquetas tipadas.
- Detección de entidades específicas de cada jurisdicción: NIF (España), PAN y Aadhaar (India), entre otras reflejadas en los ejemplos.
- Preservación literal del texto no redactado: la fidelidad fuera de las etiquetas es del 100 % por construcción, según la model card.
- Salida estructurada mediante `analyze`: devuelve `sanitized`, `mapping`, `model_output`, `blocked`, `flags` y `entities` (con tipo, valor y offsets).
- Modo de extracción cruda (`extract`): devuelve únicamente el JSON de mapeo sin post-procesado.
- Interfaz de línea de comandos (`bhed`) con soporte de salida JSON (`--json`).
- Reutilización de instancia: un mismo objeto `Bhed` puede procesar múltiples consultas tras una única carga.
- No se documentan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso
- Anonimización previa a auditorías legales: el modelo permite procesar expedientes con datos de clientes en español antes de enviarlos a revisores externos, sustituyendo NIF, cuentas y nombres por etiquetas reversibles mediante el `mapping` devuelto por `analyze`.
- Cumplimiento de RGPD en pipelines de datos: integrado en un paso previo al almacenamiento o al envío a un LLM de terceros, redacta PII de consultas fiscales y legales en español e inglés preservando el resto del texto para mantener la utilidad analítica.
- Procesamiento de documentación fiscal india: los ejemplos de la model card incluyen Aadhaar, PAN y cantidades en rupias, lo que lo hace adecuado para equipos que gestionan expedientes en hindi o hinglish.
- Atención al cliente con datos sensibles: en un chatbot legal o financiero, `redact` puede aplicarse a los mensajes entrantes antes de registrarlos en logs, evitando fugas de teléfonos, cuentas o identificadores.
- Generación de datasets sintéticos o de investigación: el `mapping` estructurado permite invertir la redacción de forma controlada, útil para construir corpus anotados de PII en tres idiomas.
- Verificación de fugas en producción: el flag `blocked` permite construir alertas automáticas cuando el modelo no consigue parsear la salida o detecta identificadores residuales, integrándose en sistemas de monitorización.
- Preprocesado para modelos de lenguaje de terceros: como paso previo a enviar consultas a un LLM externo, Bhed elimina la PII manteniendo la estructura semántica de la consulta original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio es de 0,1 GB (unos 120 MB de paquete), aunque los pesos fundacionales se descargan en la primera carga y su tamaño no se especifica.
- GPU recomendadas: no se indican modelos concretos; la model card solo señala que el runtime previsto es una GPU CUDA.
- Compatibilidad con GPU de consumo: no confirmada; dado el reducido tamaño del paquete es plausible, pero no se documenta.
- CPU: soportada, cargando los pesos en float32.
- Dtypes de carga: bfloat16 en CUDA cuando esté soportado, float16 en su defecto, float32 en CPU.
- Opciones de despliegue: paquete Python `bhed` (con `pip install -e .`), CLI `bhed`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Bhed se posiciona como un modelo especializado en redacción de PII multilingüe (es/en/hi), una categoría en la que existen alternativas comerciales y de código abierto, pero no se aportan datos que permitan una comparación rigurosa de parámetros, contexto o rendimiento.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bhed-v0.1 | no disponible | no disponible | es, en, hi | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- No se documentan sesgos conocidos del modelo; al operar sobre textos legales y fiscales en tres jurisdicciones distintas, es recomendable auditar su comportamiento por idioma y tipo de entidad.
- Riesgo de alucinación en la generación del JSON de mapeo: aunque el post-procesado es determinista, el modelo podría omitir entidades o generar etiquetas incorrectas; el flag `blocked` mitiga parcialmente este riesgo, pero no lo elimina.
- Ámbito restringido a consultas legales y fiscales según la model card; su comportamiento fuera de ese dominio no está caracterizado.
- Cobertura lingüística limitada a español, inglés e hindi/hinglish; no se declara soporte para otras lenguas.
- Longitud de contexto no documentada, lo que impide planificar su uso con documentos extensos sin pruebas previas.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), no se especifican garantías ni condiciones adicionales más allá de las de la propia licencia.
- El modelo requiere el paquete `bhed` para la carga y el post-procesado; no se documenta un uso directo con `transformers` estándar, lo que puede limitar la integración en stacks existentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/MindMapDigital/Bhed-v0.1
