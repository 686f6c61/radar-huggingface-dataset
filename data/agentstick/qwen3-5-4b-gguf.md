# agentstick/Qwen3.5-4B-GGUF

## Resumen

Qwen3.5-4B-GGUF es un espejo no modificado de los pesos cuantizados del modelo Qwen3.5-4B, publicado por el usuario `agentstick` como repositorio de descarga para su plataforma AgentStick. El repositorio no introduce ningún cambio sobre el original: contiene un único archivo GGUF (`Qwen3.5-4B-Q4_K_M.gguf`, 2.740.937.888 bytes) cuyo sha256 se declara idéntico al del modelo fuente alojado por `unsloth`. Todos los créditos corresponden a los autores originales.

El modelo base cuenta con 4.205.751.296 parámetros según los datos de safetensors, lo que lo sitúa en la gama de 4B típica de la familia Qwen. La única cuantización incluida en este repositorio es Q4_K_M con tabla de importancias (imatrix), un formato orientado a inferencia eficiente en CPU y GPU de gama media.

La relevancia de esta ficha es acotada: se trata de un artefacto de distribución, no de un desarrollo propio. Cualquier evaluación técnica debe remitirse al repositorio original de `unsloth` y a la documentación oficial de Qwen, ya que este mirror no aporta model card técnica, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5; arquitectura transformer segun la familia, no confirmada en la informacion) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (unico archivo: `Qwen3.5-4B-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo Qwen3.5-4B. La model card de este repositorio es exclusivamente un aviso de espejo y no incluye detalles tecnicos.

El unico dato tecnico verificable en este repositorio es la cuantizacion: Q4_K_M con imatrix, un esquema de cuantizacion de 4 bits por bloque con matriz de importancias que prioriza la precision en las capas mas sensibles. El archivo resultante ocupa 2.740.937.888 bytes (aproximadamente 2,55 GiB) para 4.205.751.296 parametros, lo que equivale a unos 5,2 bits por parametro efectivos contando metadatos y tensores no cuantizados.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio sugiere uso en dialogos multi-turno, aunque no se documentan capacidades especificas.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que el formato GGUF es desplegable en infraestructuras de inferencia compatibles.
- Capacidades de codigo, matematicas, vision, tool calling, agentes o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card original esta redactada en portugues e ingles, pero no se declaran idiomas soportados.

## Casos de uso

- Despliegue local en estaciones de trabajo: el archivo Q4_K_M de ~2,55 GiB permite ejecutar el modelo en equipos con 8 GB de RAM o VRAM, usando llama.cpp u Ollama, sin necesidad de GPU dedicada.
- Prototipado rapido de asistentes conversacionales: al ser un GGUF de 4B, sirve para validar flujos de chat multi-turno en local antes de escalar a modelos mayores.
- Inferencia en CPU para entornos sin acelerador: la cuantizacion Q4_K_M con imatrix esta pensada para mantener calidad aceptable con throughput moderado en CPU.
- Espejo de descarga para pipelines automatizados: util para organizaciones que necesitan fijar una revision concreta y verificar integridad mediante sha256 en sus procesos de CI.
- Evaluacion comparativa de cuantizaciones: sirve como referencia Q4_K_M frente a otras cuantizaciones del mismo modelo base (Q5_K_M, Q8_0, etc.) para medir la perdida de calidad.
- Pruebas de integracion con servidores compatibles con OpenAI: el tag `endpoints_compatible` sugiere su uso en backends tipo llama.cpp server o vLLM con soporte GGUF, para validar APIs antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para el archivo Q4_K_M completo, mas overhead de contexto KV cache (variable segun longitud de contexto).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100); el modelo es pequeno y no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 6 GB o mas; tambien en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con endpoints OpenAI que acepten GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-GGUF (este repo) | 4,2B | no disponible | Apache 2.0 | GGUF Q4_K_M | Espejo de unsloth/Qwen3.5-4B-GGUF |
| unsloth/Qwen3.5-4B-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (multiples cuantizaciones) | Fuente original del archivo |
| Modelo base Qwen3.5-4B | 4,2B | no disponible | Apache 2.0 | safetensors | Pesos sin cuantizar |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria (por ejemplo, Llama 3.2 3B o Gemma 3 4B); la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones; no aporta garantias adicionales sobre el modelo original ni mantenimiento propio.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en escenarios que dependan de estas caracteristicas.
- La cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en safetensors; para tareas sensibles a la exactitud (matematicas, codigo) conviene validar contra el modelo sin cuantizar.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda conservar los avisos de atribucion a los autores originales de Qwen y de la cuantizacion de unsloth.
- El tag `endpoints_compatible` no garantiza compatibilidad con todos los backends; conviene verificar el soporte GGUF del servidor elegido antes de desplegar en produccion.
- El repositorio no tiene descargas ni likes y fue creado recientemente, por lo que no existe validacion comunitaria de su contenido mas alla del sha256 declarado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agentstick/Qwen3.5-4B-GGUF
- Fuente original del GGUF: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Revision citada: `e87f176479d0855a907a41277aca2f8ee7a09523`
