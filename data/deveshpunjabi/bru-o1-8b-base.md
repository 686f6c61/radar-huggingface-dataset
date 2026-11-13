# deveshpunjabi/BRU-o1-8B-Base

## Resumen

BRU-o1-8B-Base es un checkpoint base de tipo texto, preentrenado y condicionado en el espacio de pesos, desarrollado por el usuario de Hugging Face deveshpunjabi. Se presenta como la base sobre la que se construye BRU-o1-8B, un modelo orientado a agentes de razonamiento locales, codigo verificable y aplicaciones en siete lenguas indias. Utiliza una arquitectura propia registrada como `BruForCausalLM` (`model_type: "bru"`), implementada con `custom_code` y distribuida a traves de la libreria transformers.

El modelo cuenta con 8.190.735.360 parametros (8,191B) distribuidos en 36 capas, con atencion de tipo GQA (32 cabezas de consulta y 8 de clave/valor, `head_dim=128`), QK-Norm, attention sinks y una MLP SwiGLU de dimension intermedia 12288. El contexto es de 32K tokens nativo, extendido hasta 128K mediante YaRN, y el vocabulario alcanza los 151.936 tokens, incluyendo identificadores de control nativos para ``.

Su relevancia actual reside en dos factores: por un lado, esta disenado para el segmento de 4B-10B parametros con despliegue en hardware de consumo (ocupa 5.997 GiB en VRAM a 4 bits NF4 y 4,90 GB en GGUF Q4_K_M, cabiendo en una T4 o en una RTX 3050 de portatil); por otro, se ofrece como punto de partida limpio para preentrenamiento continuado, destilacion, SFT de dominio y postentrenamiento propio con SimPO o GRPO. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BruForCausalLM` (`model_type: "bru"`), transformer decoder-only con GQA (32Q / 8KV, `head_dim=128`), QK-Norm, Attention Sinks y SwiGLU (`12288`) |
| Parametros totales | 8.190.735.360 (8,191B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (entrada + salida via YaRN); 32K nativo |
| Tipos de cuantizacion | 4-bit NF4; GGUF Q4_K_M (mencionados en la model card) |
| Idiomas soportados | en, hi, sd (sindhi en devanagari, `snd_Deva`), mr, gu, bn, ta, te, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, ru, pl |
| Licencia | Apache License 2.0 (atribucion en `NOTICE`) |
| Formato de pesos | safetensors; GGUF (Q4_K_M) |
| Capas | 36 |
| Vocabulario | 151.936 tokens (con IDs nativos `<think>` 151667 y `</think>` 151668) |
| Tamano del repo | 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con atencion agrupada por consultas (GQA) de 32 cabezas de consulta y 8 de clave/valor, con `head_dim=128`, normalizacion QK-Norm y sesgos de attention sink aprendidos. La MLP es SwiGLU con dimension intermedia de 12288. Una innovacion destacada en la model card es el condicionamiento en el espacio de pesos sobre 252 pares de tensores: integra adaptacion de rango 16 de espectro completo en las 36 capas y las 7 proyecciones (`q, k, v, o, gate, up, down`) con normalizacion de gauge de Frobenius (`||B||_F / ||A||_F = 1.0`), supresion de bucles mediante `mlp.down_proj` de 64 columnas en 21 capas y sesgos de attention sink aprendidos, lo que permite extender la ventana de contexto hasta 128K tokens.

El modelo se distribuye como checkpoint base preentrenado y condicionado, pensado explicitamente para ser especializado. La model card menciona como tecnicas de postentrenamiento previstas la destilacion Decoupled Tempered Top-K (referencia `arXiv:2511.23404`), el SFT de dominio, SimPO y GRPO. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO sobre este checkpoint base.

## Capacidades

- Generacion de texto autoregresiva en 22 idiomas, con enfasis en ingles, hindi y siete lenguas indias (sindhi en devanagari, marathi, gujarati, bengali, tamil y telugu).
- Razonamiento explicito mediante los identificadores de control nativos `<think>` y `</think>`, que permiten estructurar cadenas de pensamiento.
- Capacidad de razonamiento y codigo verificable, segun la orientacion declarada del modelo final BRU-o1-8B.
- Soporte de conversacion multiturno (tag `conversational`).
- Contexto largo de hasta 128K tokens mediante YaRN, util para documentos extensos y sesiones de agente prolongadas.
- Preparado para tool calling y razonamiento multi-paso a traves de postentrenamiento posterior (el checkpoint base no garantiza estas capacidades de forma nativa).
- No dispone de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Punto de partida para preentrenamiento continuado (CPT): al ser un checkpoint base con licencia Apache 2.0, permite adaptar el modelo a dominios verticales (legal, medico, financiero) partiendo de pesos ya condicionados, sin necesidad de entrenar desde cero.
- Destilacion de modelos mayores: la model card cita explicitamente la destilacion Decoupled Tempered Top-K (`arXiv:2511.23404`) como flujo de trabajo previsto, lo que lo hace adecuado para transferir capacidades de modelos grandes a un modelo de 8B desplegable en edge.
- SFT de dominio y postentrenamiento con SimPO o GRPO: sirve como base para alinear el modelo con preferencias o recompensas especificas de una organizacion.
- Aplicaciones en lenguas indias: con soporte nativo de hindi, sindhi, marathi, gujarati, bengali, tamil y telugu, es util para asistentes de atencion al ciudadano, traduccion o generacion de contenido en estos idiomas.
- Agentes de razonamiento locales: los tokens `<think>` permiten separar el razonamiento interno de la respuesta final, lo que facilita la integracion en pipelines de agentes que necesitan trazabilidad del proceso.
- Despliegue en hardware de consumo: con 4,90 GB en GGUF Q4_K_M y 5.997 GiB en NF4, puede ejecutarse en una RTX 3050 de portatil o en una T4 en la nube para prototipado y demos locales.
- Procesamiento de documentos largos: la ventana de 128K tokens permite resumir, extraer informacion o responder preguntas sobre contratos, informes o expedientes extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 5.997 GiB a 4 bits NF4; 4,90 GB en GGUF Q4_K_M; el checkpoint completo en safetensors ocupa 16,4 GB (aproximadamente 16 GB en FP16/BF16).
- GPU recomendadas: NVIDIA T4 (16 GB), RTX 3050 de portatil (8 GB) para cuantizacion 4 bits; para precision completa se requiere una GPU con al menos 24 GB, como RTX 4090, A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3050 y superiores con cuantizacion 4 bits; en RTX 4090 cabe en precision completa.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por la arquitectura `custom_code`); llama.cpp/Ollama mediante el GGUF Q4_K_M; vLLM y TGI no estan confirmados en la informacion disponible para esta arquitectura personalizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BRU-o1-8B-Base | 8,191B | 128K (32K nativo) | Apache 2.0 | Hugging Face, transformers con `custom_code` | Arquitectura propia `bru`, enfasis en lenguas indias y edge |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community License | Hugging Face, amplio ecosistema | Arquitectura estandar, soporte nativo en vLLM, llama.cpp y TGI |
| Qwen2.5 7B | 7,6B | 128K | Apache 2.0 | Hugging Face, amplio ecosistema | Multilingue con buen soporte asiatico, arquitectura estandar |
| Mistral 7B v0.3 | 7,2B | 32K | Apache 2.0 | Hugging Face, amplio ecosistema | Contexto menor, ecosistema maduro |

No se dispone de datos de rendimiento comparativo de BRU-o1-8B-Base en la informacion proporcionada; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint base, no un modelo instruido: no se espera que siga instrucciones de forma fiable ni que mantenga formatos conversacionales sin un postentrenamiento previo.
- Requiere `trust_remote_code=True` y la implementacion `BruForCausalLM`, lo que implica revisar el codigo personalizado antes de ejecutarlo en produccion.
- El soporte en herramientas de inferencia estandar (vLLM, TGI, llama.cpp) no esta confirmado para la arquitectura `bru`; el GGUF Q4_K_M esta mencionado, pero su compatibilidad con llama.cpp no se detalla.
- Riesgo de alucinacion inherente a los modelos de lenguaje preentrenados, no mitigado por alineamiento en este checkpoint.
- No se documentan sesgos conocidos ni la composicion del corpus de entrenamiento, lo que dificulta evaluar riesgos de sesgo linguistico o cultural.
- La calidad en lenguas indias depende de la cobertura real del preentrenamiento, no especificada en la model card.
- Aunque la licencia es Apache 2.0, se exige atribucion en el fichero `NOTICE`; conviene revisar los terminos de los pesos derivados.
- El modelo no tiene vision ni audio; cualquier caso de uso multimodal queda fuera de su alcance.
- No hay resultados de benchmarks publicados que permitan validar las afirmaciones de rendimiento de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/deveshpunjabi/BRU-o1-8B-Base
- Modelo final BRU-o1-8B: https://huggingface.co/deveshpunjabi/bru-o1-model
- Paper citado (Decoupled Tempered Top-K Distillation): https://arxiv.org/abs/2511.23404
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
