# mradermacher/finnai-slm-v4-GGUF

## Resumen

finnai-slm-v4-GGUF es la colección de cuantizaciones en formato GGUF del modelo finndot/finnai-slm-v4, un modelo de lenguaje pequeno (SLM) de aproximadamente 1.720 millones de parametros, especializado en finanzas personales y parsing de informacion bancaria. Lo desarrolla el equipo de finndot y la cuantizacion la firma mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF de modelos abiertos. La relevancia del modelo radica en su enfoque vertical: no es un asistente generalista, sino un extractor conversacional orientado a datos financieros del contexto indio (UPI, SMS bancarios, seguimiento de gastos).

La model card identifica el modelo base como un ajuste fino mediante QLoRA y LoRA/PEFT sobre una arquitectura de la familia Qwen3, segun las etiquetas del repositorio, aunque la ficha no confirma explicitamente la arquitectura subyacente. El entrenamiento se realizo sobre el dataset finndot/finnai-slm-data-v4. El resultado se orienta al despliegue en dispositivo (on-device), movil y mediante LiteRT-LM, lo que explica el interes por cuantizaciones agresivas que caben en memoria reducida.

Para un desarrollador, este repositorio ofrece trece variantes de cuantizacion (desde Q2_K de 0,9 GB hasta f16 de 3,5 GB) bajo licencia Apache 2.0, lo que facilita el uso comercial y la integracion en aplicaciones de finanzas personales multilingues para el mercado indio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio apuntan a la familia Qwen3, sin confirmar en la model card) |
| Parametros totales | 1.720.574.976 (~1,72 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, hi, ta, te, mr, bn, kn, ml, gu, pa (ingles, hindi, tamil, telugu, marati, bengali, kannada, malayalam, gujarati, punyabi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizados por mradermacher a partir del modelo base en safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no detalla la arquitectura interna del modelo base. Las etiquetas asociadas (qwen, qwen3, transformers) y el uso de la libreria transformers apuntan a un transformer decoder-only de la familia Qwen3, pero este dato no se confirma de forma explicita en la informacion disponible. El modelo base finndot/finnai-slm-v4 fue ajustado mediante tecnicas de QLoRA y LoRA/PEFT, segun las etiquetas del repositorio, lo que indica un proceso de fine-tuning eficiente en parametros sobre un modelo preentrenado.

El dataset de ajuste es finndot/finnai-slm-data-v4, si bien la model card no especifica el numero de tokens de entrenamiento, la composicion detallada del corpus ni si hubo fases de RLHF o DPO. El enfasis tematico (parsing de SMS bancarios, extraccion de informacion y JSON, UPI, seguimiento de gastos, Hinglish) sugiere un dataset orientado a tareas de extraccion estructurada en el dominio financiero indio. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y modo chat, con orientacion a asistencia sobre finanzas personales.
- Extraccion de informacion y parsing de SMS bancarios, con salida estructurada.
- Extraccion de JSON, adecuada para pipelines que requieran respuestas con formato rigido.
- Procesamiento de datos del sistema de pagos UPI y terminologia bancaria india.
- Seguimiento de gastos (expense tracker) y analitica financiera personal.
- Funcion de tutor, segun la etiqueta "tutor" del repositorio, orientada a guiar al usuario en la interpretacion de sus finanzas.
- Capacidades multilingues en diez idiomas: ingles, hindi, tamil, telugu, marati, bengali, kannada, malayalam, gujarati y punyabi, con soporte etiquetado para Hinglish.
- Orientacion a despliegue on-device y movil mediante LiteRT y LiteRT-LM.
- No se documenta soporte explicito de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Extraccion estructurada de SMS bancarios: el modelo esta entrenado especificamente para parsear mensajes de entidades bancarias indias y devolver la informacion en formato JSON, integrándose en una app movil que lea los SMS y genere transacciones automaticas.
- Clasificacion y registro de pagos UPI: al recibir texto con detalles de una transferencia, el modelo puede extraer importe, contraparte y referencia para alimentar un gestor de gastos.
- Aplicacion movil de finanzas personales on-device: con las cuantizaciones Q4 (1,2 GB) o Q3 (1,0 GB) el modelo cabe en un telefono de gama media y permite procesar datos financieros sin enviarlos a la nube.
- Analitica de gastos por categorias: el modelo puede tomar un historial de transacciones y responder preguntas sobre patrones de consumo, sirviendo de capa conversacional sobre una base de datos financiera.
- Tutor financiero multilingue: gracias al soporte de diez idiomas indios, puede explicar conceptos de presupuesto o credito a usuarios en su lengua materna dentro de una app de educacion financiera.
- Normalizacion de datos para pipelines de ingestión: como extractor JSON, encaja en procesos ETL que conviertan texto no estructurado (correos, SMS, notas) en registros tabulares.
- Asistente de atencion al cliente para una fintech india: el modelo puede gestionar consultas multi-turno sobre transacciones en hindi o ingles, gestionando el tono y el contexto de la conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q2_K ~0,9 GB; Q3_K_S/M/L ~1,0-1,1 GB; IQ4_XS ~1,1 GB; Q4_K_S/M ~1,2 GB; Q5_K_S/M ~1,3-1,4 GB; Q6_K ~1,5 GB; Q8_0 ~1,9 GB; f16 ~3,5 GB.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM es suficiente para las cuantizaciones Q4 y Q5. Modelos como RTX 3060, RTX 4060, RTX 4090 o Apple Silicon (M1 en adelante) funcionan con holgura. Para f16, 8 GB de VRAM son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas de gama media y alta, e incluso en iGPU y en telefonos moviles con 2-4 GB de memoria libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. El modelo original (no GGUF) esta pensado para LiteRT-LM y despliegue movil.
- Latencia y throughput estimados: no disponibles. Dado el tamano (~1,7 B), se espera una generacion fluida incluso en hardware modesto, pero no se han publicado cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finndot/finnai-slm-v4 (GGUF) | ~1,72 B | no disponible | 10 idiomas indios + en | apache-2.0 | GGUF, transformers, LiteRT |
| Qwen3-1.7B | ~1,7 B | no disponible en esta ficha | multilingue amplio | apache-2.0 | transformers, GGUF, multiples |
| Llama-3.2-1B | ~1,2 B | 128 K (segun su model card publica) | principalmente ingles | Llama 3.2 Community License | transformers, GGUF, ONNX |
| Gemma-2-2B | ~2,6 B | 8 K (segun su model card publica) | multilingue limitado | Gemma Terms of Use | transformers, GGUF, Keras |

La comparativa anterior es orientativa: los datos de los modelos alternativos no provienen de la informacion proporcionada en esta busqueda y pueden requerir verificacion. La ventaja diferencial de finnai-slm-v4 es su especializacion en parsing financiero indio y su soporte de diez idiomas del subcontinente, frente a modelos generalistas que no cubren esas tareas de forma nativa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible; cabe esperar sesgos derivados del dataset financiero indio con el que se ajusto.
- Riesgo de alucinacion inherente a cualquier modelo de 1,7 B, especialmente al extraer campos JSON de texto ambiguo o poco frecuente. Se recomienda validar la salida con un esquema estricto antes de escribir en una base de datos.
- Longitud de contexto no documentada: se desconoce si soporta conversaciones largas o historiales extensos de transacciones en una sola pasada.
- Especializacion estrecha: fuera del dominio financiero y del contexto indio, su rendimiento generalista probablemente sea inferior al de modelos de tamano similar no especializados.
- El soporte de idiomas se limita a ingles y nueve idiomas indios; no se declara castellano ni otras lenguas europeas.
- Licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales mas alla de las obligaciones de atribucion y aviso de cambios.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar notablemente la calidad en tareas de extraccion estructurada; para produccion se recomienda Q5_K_M o Q6_K.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/finnai-slm-v4-GGUF
- Modelo base: https://huggingface.co/finndot/finnai-slm-v4
- Dataset de entrenamiento: https://huggingface.co/datasets/finndot/finnai-slm-data-v4
- Listado de cuantizaciones del autor: https://hf.tst.eu/model#finnai-slm-v4-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
