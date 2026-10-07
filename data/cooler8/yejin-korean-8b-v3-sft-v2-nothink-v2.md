# cooler8/yejin-korean-8b-v3-sft-v2-nothink-v2

## Resumen

Yejin Korean 8B v3 SFT v2 (no-think v2) es un modelo de lenguaje de 7.241.740.288 parámetros (aproximadamente 7,24B) afinado para instrucciones en coreano. Lo publica el usuario cooler8 en HuggingFace bajo licencia Apache 2.0. Por las etiquetas del repositorio (qwen3, safetensors, korean, text-generation, conversational), se trata de un ajuste supervisado (SFT) sobre una base de la familia Qwen3, orientado a generación de texto y conversación multi-turno en coreano.

El modelo forma parte de la serie "Yejin Korean" y esta variante concreta se etiqueta como "no-think", es decir, está configurada para responder sin activar una fase de razonamiento explícita: su plantilla de chat incluye un bloque `<think> </think>` vacío antes de la respuesta, lo que indica que fue entrenada para omitir la cadena de pensamiento visible. Esto la diferencia de otras variantes del mismo autor que sí podrían exponer razonamiento.

Su relevancia es limitada por su carácter muy específico: es un modelo monolingüe (solo coreano), con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta útil como referencia para experimentar con ajuste fino en coreano sobre base Qwen3 y para tareas de instrucción conversacional en ese idioma, pero no hay evidencia pública de rendimiento frente a alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta qwen3; detalles de capas no disponibles) |
| Parametros totales | 7.241.740.288 (aproximadamente 7,24B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la etiqueta qwen3 sugiere herencia de la ventana nativa de Qwen3, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 14,5 GB) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna, el número de capas, cabezas de atención ni dimensiones ocultas. La etiqueta `qwen3` del repositorio apunta a que el modelo se construye sobre una base de la familia Qwen3 (transformer denso con atención estándar), ajustada posteriormente mediante SFT para instrucciones en coreano. El nombre "v3 SFT v2" sugiere que es la segunda iteración de un ajuste supervisado sobre la tercera versión de la base Yejin Korean.

No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otras técnicas de alineamiento posteriores. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos híbridos. El único detalle de entrenamiento inferible es el modo "no-think": la plantilla de chat inserta `<think> </think>` vacío, lo que indica un ajuste para responder directamente sin traza de razonamiento.

## Capacidades

- Generación de texto en coreano con formato conversacional multi-turno (etiqueta `conversational`).
- Seguimiento de instrucciones en coreano, según el propósito declarado del modelo ("Korean instruction-following language model").
- Modo "no-think": responde sin exponer cadena de razonamiento, ya que el bloque de pensamiento se emite vacío.
- Plantilla de chat compatible con el formato `<|user|>` / `<|assistant|>` / `<|end|>` y con `apply_chat_template` de Transformers.
- Soporte de `device_map="auto"` y carga en bfloat16 a través de la API estándar de Transformers.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso explícito: no disponible.
- Capacidades multilingües: solo coreano declarado; no se documentan otros idiomas.
- Capacidades de visión, audio o multimodalidad: no disponibles.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno mediante su plantilla de chat y `apply_chat_template`, adecuado para prototipos de atención al cliente en coreano donde no se requiere razonamiento explícito.
- Generación de respuestas de formato corto y directo: al estar en modo "no-think", es apropiado para tareas donde se busca una salida inmediata sin traza de razonamiento (por ejemplo, respuestas FAQ).
- Ajuste fino adicional sobre coreano: sirve como punto de partida (SFT ya aplicado) para quien quiera especializar aún más el modelo en un dominio concreto en coreano.
- Experimentación académica con bases Qwen3 en idiomas de bajos recursos: útil para estudiar transferencia de la base Qwen3 al coreano tras SFT.
- Generación de texto sintético en coreano para aumentar datasets: puede emplearse para producir corpus en coreano que luego se filtren y revisen manualmente.
- Chatbots de nicho o demos internas: por su licencia Apache 2.0, permite desplegar un prototipo conversacional en coreano sin restricciones de uso comercial derivadas de la licencia.
- Evaluación comparativa de variantes "think" frente a "no-think": este modelo permite medir el impacto de desactivar la cadena de pensamiento en la calidad de respuesta en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (7,24B parámetros):
  - bfloat16 / float16: aproximadamente 14,5 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 16-18 GB de VRAM.
  - int8: aproximadamente 7-8 GB de pesos.
  - int4: aproximadamente 4-5 GB de pesos.
- GPU recomendadas:
  - Inferencia en bfloat16 sin cuantizar: NVIDIA A100 (40/80 GB), H100, o GPUs consumer con 24 GB (RTX 3090, RTX 4090).
  - Inferencia cuantizada a int8/int4: RTX 4080 (16 GB), RTX 4070 Ti (12 GB), e incluso GPUs de 8-12 GB con cuantización agresiva.
- ¿Cabe en GPU consumer? Sí. En bfloat16 cabe en RTX 3090/4090 (24 GB) con margen para contexto moderado; en cuantización int4 cabe en GPUs de 8-12 GB.
- Opciones de despliegue: Transformers (según el ejemplo de la model card), vLLM y TGI para servir en bfloat16; llama.cpp/Ollama requerirían convertir los pesos a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cooler8/yejin-korean-8b-v3-sft-v2-nothink-v2 | 7,24B | no disponible | Coreano | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen3-8B (base de referencia de la familia etiquetada) | Aproximadamente 8B | Nativa de Qwen3, no confirmada para este modelo | Multilingue (incluye coreano) | Apache 2.0 | Ampliamente disponible |
| Alternativas coreanas de la misma categoria (por ejemplo EEVE-Korean) | Variable | No disponible | Coreano | Variable | HuggingFace |

No se dispone de datos de rendimiento comparativos entre este modelo y las alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Cualquier cifra de benchmark de terceros no debe atribuirse a este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al ser un ajuste sobre dataset no especificado, pueden heredarse sesgos del corpus de SFT.
- Riesgo de alucinación: no evaluado públicamente; sin benchmarks no puede acotarse.
- Limitación de idioma: el modelo declara únicamente coreano (ko); no se garantiza un rendimiento correcto en castellano, inglés u otros idiomas.
- Limitación de contexto: la model card no especifica la ventana de contexto, por lo que no puede confirmarse su comportamiento en contextos largos.
- Modo "no-think": al omitir la cadena de razonamiento, puede rendir peor en tareas que requieren deducción explícita (matemáticas, lógica multi-paso) frente a variantes con pensamiento activado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia correspondiente.
- Madurez: con 0 descargas y 0 likes, no hay señales de adopción ni validación por parte de la comunidad; conviene tratarlo como modelo experimental.
- Producción: sin benchmarks, sin información de entrenamiento y sin cuantizaciones oficiales, no es recomendable desplegarlo en producción crítica sin una evaluación propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cooler8/yejin-korean-8b-v3-sft-v2-nothink-v2
- Paper: no disponible
- Blog o página del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
