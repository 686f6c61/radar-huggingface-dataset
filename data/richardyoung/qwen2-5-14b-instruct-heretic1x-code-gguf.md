# richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-14B-Instruct-heretic1x-code-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen2.5-14B-Instruct-heretic1x-code, un derivado "abliterated" (tambien llamado "heretic") del Qwen2.5-14B-Instruct de Alibaba. El autor, richardyoung, publica esta version optimizada para su uso con llama.cpp y Ollama, con el objetivo de ofrecer un modelo de 14.770 millones de parametros que pueda ejecutarse en hardware de consumo con distintos niveles de cuantizacion. La "abliteracion" elimina o atenua los mecanismos de rechazo del modelo original, de modo que responde a peticiones que el Qwen2.5-Instruct estandar declinaria.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con un contexto nativo de 32.768 tokens (extensible hasta 131.072 mediante RoPE scaling segun la documentacion de la familia Qwen2.5, aunque esta ficha no dispone de confirmacion explicita para este derivado concreto). El sufijo "code" en el nombre sugiere un ajuste adicional orientado a generacion de codigo, aunque la informacion disponible no detalla la composicion exacta de ese ajuste. La cuantizacion se ha realizado con el metodo imatrix, lo que suele mejorar la calidad de las cuantizaciones de baja precision (Q2, Q3, Q4).

Su relevancia actual radica en dos factores: por un lado, permite desplegar un modelo de 14B con calidad razonable en GPUs de consumo (RTX 3060 12 GB, RTX 4090 24 GB) o incluso en CPU con cuantizaciones agresivas; por otro, el caracter "uncensored" lo hace atractivo para investigacion sobre alineamiento, red teaming y estudios de sesgos, aunque tambien conlleva riesgos evidentes en produccion. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B-Instruct) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para este derivado (Qwen2.5 base: 32.768 tokens nativos) |
| Tipos de cuantizacion | GGUF con imatrix (multiples niveles de cuantizacion; niveles concretos no detallados) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 14.770 millones de parametros, heredado directamente de la arquitectura Qwen2.5-14B-Instruct: atencion multi-cabeza con RoPE, normalizacion RMSNorm y capas feed-forward con SwiGLU. Sobre esa base, el autor aplico un proceso de "abliteracion" (heretic) que suprime la direccion de rechazo en el espacio de activaciones, y un ajuste adicional etiquetado como "code". No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO en esta variante concreta.

La cuantizacion a GGUF se ha realizado con imatrix (importance matrix), una tecnica que calibra los pesos segun su relevancia para reducir la perdida de calidad en cuantizaciones de baja precision. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal en esta publicacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Generacion y asistencia de codigo (el sufijo "code" indica ajuste orientado a programacion, aunque no se detalla su alcance).
- Razonamiento general y respuesta a instrucciones heredado de Qwen2.5-Instruct.
- Comportamiento "uncensored": responde a solicitudes que el modelo original rechazaria.
- Compatible con llama.cpp, Ollama y endpoints compatibles (segun tags).
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como responde un LLM sin mecanismos de rechazo, util para analisis de robustez y red teaming en entornos controlados.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4 o Q5 cabe en GPUs de 24 GB (RTX 4090) y permite asistentes de codigo offline sin dependencia de la nube.
- Generacion de codigo en pipelines internos: integrable via llama.cpp u Ollama para autocompletado y generacion de tests en repositorios privados, con la ventaja de no enviar codigo a terceros.
- Prototipado rapido de chatbots: la ventana de contexto de la familia Qwen2.5 (32.768 tokens) permite conversaciones largas y analisis de documentos extensos en ingles.
- Educacion e investigacion academica: estudio comparativo de modelos abliterated frente a sus versiones alineadas en tareas de sesgo y toxicidad.
- Experimentacion con cuantizaciones imatrix: banco de pruebas para evaluar la degradacion de calidad por nivel de cuantizacion en modelos de 14B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 9-10 GB en Q4_K_M, 12-13 GB en Q5_K_M y 15-16 GB en Q8_0 (estimacion por tamano de pesos; no confirmada en la model card).
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o Q6_K; RTX 3090/4080 (16-24 GB) para Q5; RTX 3060 12 GB para Q4.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB con Q4 y en RTX 4090 con cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (segun tags); vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct-heretic1x-code-GGUF | 14,77B | no disponible (base: 32.768) | apache-2.0 | GGUF | Abliterated, acceso gated |
| Qwen2.5-14B-Instruct (original) | 14,77B | 32.768 | apache-2.0 | safetensors, GGUF | Alineado, sin abliteracion |
| Qwen2.5-Coder-14B-Instruct | 14,77B | 32.768 | apache-2.0 | safetensors, GGUF | Especializado en codigo, alineado |
| Llama-3.1-8B-Instruct | 8,03B | 131.072 | Llama 3.1 Community | safetensors, GGUF | Menor tamano, contexto mayor, licencia mas restrictiva |

## Limitaciones y advertencias

- Modelo abliterated: la supresion de rechazos implica riesgo elevado de generar contenido toxico, ilegal o peligroso; no apto para produccion sin filtros externos.
- Riesgo de alucinacion: inherente a los modelos de 14B; no se han publicado evaluaciones especificas para este derivado.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano no esta garantizado.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias y el acceso esta restringido (gated) en Hugging Face.
- Contexto: aunque la familia Qwen2.5 soporta 32.768 tokens, no se confirma que este derivado mantenga esa ventana tras la abliteracion y el ajuste de codigo.
- Sin benchmarks publicados: imposible comparar su calidad real frente al modelo original o frente a otras variantes.
- Descargas y comunidad muy reducidas (369 descargas, 0 likes): poca validacion externa y soporte limitado.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen2.5-14B-Instruct-heretic1x-code
- Qwen2.5-14B-Instruct original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
