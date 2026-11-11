# GiangSon-5/Llama-3.2-1B-Instruct-QLoRA-UIT-VSFC

## Resumen

Llama-3.2-1B-Instruct-QLoRA-UIT-VSFC es un adaptador LoRA (QLoRA en 4 bits NF4) publicado por el usuario GiangSon-5 sobre el modelo base meta-llama/Llama-3.2-1B-Instruct. Su proposito es especializar un modelo conversacional pequeno en la clasificacion de sentimiento (negativo, neutro, positivo) de comentarios de estudiantes universitarios en vietnamita, usando el corpus UIT-VSFC como unico conjunto de entrenamiento y evaluacion.

El modelo resuelve un problema acotado: el modelo base, en modo zero-shot, tiende a responder "neutral" de forma excesiva ante entradas en vietnamita, alcanzando solo un 45,10 % de exactitud en el split de test. Tras el ajuste fino con QLoRA, el adaptador eleva la exactitud al 92,92 % y el Macro-F1 de 43,59 % a 82,11 %, manteniendo un formato de salida estricto del tipo "Sentiment: positive|negative|neutral" en el 100 % de las 3.166 frases de test.

Es relevante por su eficiencia: solo entrena 11.272.192 parametros (1,48 % del total), se ejecuta en una unica NVIDIA L4 de 22 GB y se distribuye como adaptador safetensors de aproximadamente 0,1 GB, lo que permite cargarlo junto al modelo base cuantizado en 4 bits en hardware de consumo. No es un modelo generalista: es una pieza de clasificacion supervisada de dominio y idioma restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA sobre proyecciones lineales |
| Parametros totales | 1B en el modelo base; 11.272.192 parametros entrenables en el adaptador (1,48 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama 3.2 1B Instruct) |
| Tipos de cuantizacion | QLoRA con 4-bit NormalFloat (NF4) y Double Quantization en el modelo base; adaptador LoRA en safetensors (r = 16, alpha = 32) |
| Idiomas soportados | vietnamita (vi) e ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | adapter_model.safetensors (PEFT/LoRA); requiere el modelo base meta-llama/Llama-3.2-1B-Instruct |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre las siete proyecciones lineales del transformer del modelo base (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj) con rango r = 16 y alpha = 32. El modelo base se carga cuantizado en 4 bits NF4 con Double Quantization mediante bitsandbytes, y el entrenamiento se realiza con precision mixta BF16 y TF32 nativos. El adaptador final se exporta como adapter_model.safetensors para cargarse con PEFT junto al modelo base original.

El entrenamiento usa los 11.426 ejemplos de entrenamiento del corpus UIT-VSFC durante 3 epocas (1.074 pasos de optimizacion, aproximadamente 42,15 minutos) en una unica NVIDIA L4 de 22,03 GB, con un pico de VRAM de 11,39 GB. Se aplica enmascaramiento de perdida sobre el prompt (-100 por token) y aislamiento de padding con el token `<|finetune_right_pad_id|>` (ID 128004). El checkpoint final se selecciona por Macro-F1 en validacion (paso 900: exactitud 95,01 %, Macro-F1 87,85 %) en lugar de por exactitud bruta, para compensar el fuerte desbalanceo de clases. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Clasificacion de sentimiento en vietnamita en tres clases (negative, neutral, positive) sobre texto de feedback estudiantil.
- Generacion de texto autoregresiva en formato generativo controlado: produce exactamente "Sentiment: <etiqueta>".
- Cumplimiento estricto de formato: 100,00 % de conformidad en las 3.166 entradas de test.
- Conversacion multi-turno heredada del modelo base (chat template de Llama 3.2).
- Comprension y generacion basica en ingles, ademas del vietnamita.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada a vi y en segun los metadatos del modelo.

## Casos de uso

- Analisis de encuestas de satisfaccion docente: procesar en lote los comentarios abiertos de los estudiantes y agregar la polaridad por asignatura o profesor, aprovechando el 92,92 % de exactitud en el dominio exacto de UIT-VSFC.
- Monitorizacion de feedback en plataformas educativas: clasificar en tiempo real los comentarios entrantes y enrutar los negativos a un equipo de atencion, con un coste de inferencia bajo en una GPU de consumo.
- Etiquetado asistido de corpus: usar el modelo para preanotar grandes volumenes de texto en vietnamita y reducir el trabajo de anotacion humana, revisando despues los casos de baja confianza.
- Clasificacion en entornos con VRAM limitada: desplegar el adaptador con el modelo base en 4 bits en una RTX 4090 o similar, dado el pico de 11,39 GB registrado en entrenamiento.
- Investigacion sobre eficiencia de PEFT: servir como referencia reproducible de QLoRA sobre un modelo de 1B con metricas completas de validacion y test.
- Filtrado de resenas en aplicaciones de gestion academica: detectar automaticamente comentarios negativos en formularios de evaluacion para priorizar su revision.
- Prototipado rapido de clasificadores de texto en vietnamita: adaptar la receta (QLoRA + formato generativo) a otros dominios con pocos recursos de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Conjunto | Metrica | Valor |
|---|---|---|---|
| Clasificacion de sentimiento (formato generativo) | UIT-VSFC test (n = 3.166) | Exactitud (autoregresiva greedy) | 0,9292 |
| Clasificacion de sentimiento (formato generativo) | UIT-VSFC test (n = 3.166) | Macro-F1 | 0,8211 |
| Clasificacion de sentimiento (formato generativo) | UIT-VSFC test (n = 3.166) | Weighted-F1 | 0,9292 |
| Clasificacion de sentimiento (mejor checkpoint) | UIT-VSFC validacion (n = 1.583) | Exactitud (paso 900) | 0,9501 |
| Clasificacion de sentimiento (mejor checkpoint) | UIT-VSFC validacion (n = 1.583) | Macro-F1 (paso 900) | 0,8785 |

Referencia comparativa declarada por el autor: el modelo base en zero-shot obtiene 45,10 % de exactitud y 43,59 % de Macro-F1 en el mismo test, lo que supone una mejora de +47,82 puntos porcentuales en exactitud.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11,39 GB de pico con el modelo base en 4 bits NF4 y el adaptador cargado (dato de entrenamiento del autor); en cuantizaciones de 8 bits o BF16 el requisito crece por encima de los 2-3 GB del peso puro y puede superar los 4-8 GB segun configuracion.
- GPU recomendadas: NVIDIA L4 (22 GB) usada en el entrenamiento; A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) usando 4 bits NF4.
- Opciones de despliegue: PyTorch + Transformers + bitsandbytes + PEFT (ruta documentada); vLLM, llama.cpp, Ollama y TGI no estan documentados en la informacion disponible para este adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo requirio aproximadamente 42,15 minutos para 1.074 pasos en una L4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-QLoRA-UIT-VSFC | 1B (11,27 M entrenables) | no disponible | Adaptador QLoRA para sentimiento en vietnamita | llama3.2 | Hugging Face (adaptador) |
| meta-llama/Llama-3.2-1B-Instruct | 1B | no disponible | Modelo base conversacional generalista | llama3.2 | Hugging Face |
| Adaptadores QLoRA genericos para clasificacion | variable | variable | Ajuste supervisado de dominio | variable | Hugging Face |

No se dispone en la informacion proporcionada de resultados de benchmarks de modelos alternativos comparables en UIT-VSFC, por lo que la comparativa numerica con terceros no esta disponible.

## Limitaciones y advertencias

- Dominio y idioma restringidos: entrenado exclusivamente con UIT-VSFC (feedback de estudiantes en vietnamita); el rendimiento fuera de ese dominio o en otros registros del idioma no esta validado.
- Riesgo de alucinacion y de deriva de formato fuera de distribucion: aunque el 100 % de conformidad se midio en test, entradas atipicas pueden producir etiquetas invalidas o texto adicional.
- Desbalanceo de clases: el Macro-F1 (82,11 %) es notablemente inferior a la exactitud (92,92 %), lo que indica peor rendimiento en clases minoritarias.
- Metricas no verificadas de forma independiente: todos los resultados proceden de la model card del autor y estan marcados como `verified: false`.
- Licencia llama3.2: el uso comercial esta sujeto a la Llama 3.2 Community License, con obligaciones de atribucion y restricciones de uso aceptable; debe revisarse antes de produccion.
- Dependencia del modelo base: el adaptador no es autonomo; requiere descargar meta-llama/Llama-3.2-1B-Instruct y aceptar su licencia.
- Sin datos de contexto maximo, latencia ni throughput documentados; conviene medirlos en el entorno de despliegue objetivo.
- Modelo de muy baja adopcion (0 descargas, 0 likes en el momento de la consulta): sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GiangSon-5/Llama-3.2-1B-Instruct-QLoRA-UIT-VSFC
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Dataset UIT-VSFC: https://huggingface.co/datasets/uitnlp/vietnamese_students_feedback
- Cuaderno Colab del autor: https://colab.research.google.com/drive/1Sdoos-5rbbaWZZddqXcssWYUVl9ykMp8
- Paper QLoRA (arXiv:2305.14314): https://arxiv.org/abs/2305.14314
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Paper Llama 3 (arXiv:2407.21783): https://arxiv.org/abs/2407.21783
