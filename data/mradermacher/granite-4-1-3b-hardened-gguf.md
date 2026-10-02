# mradermacher/granite-4.1-3b-hardened-GGUF

## Resumen

`mradermacher/granite-4.1-3b-hardened-GGUF` es un conjunto de cuantizaciones en formato GGUF del modelo `hirundo-io/granite-4.1-3b-hardened`, publicado por el usuario mradermacher. No es un modelo entrenado desde cero, sino una redistribucion optimizada para inferencia local del modelo base de Hirundo, que a su vez deriva de la familia IBM Granite 4.1 en su variante densa de 3B parametros. El objetivo de estas cuantizaciones es reducir el peso del modelo (de aproximadamente 6,9 GB en f16 hasta 1,5 GB en Q2_K) para que pueda ejecutarse en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles con GGUF.

El rasgo distintivo del modelo base es su caracter de "hardened": segun las etiquetas declaradas (`behavioral-unlearning`, `prompt-injection`, `security-hardening`), ha sido sometido a un proceso de olvido conductual y endurecimiento frente a inyeccion de prompts, con el fin de reducir comportamientos no deseados y mejorar la resistencia ante ataques de prompt adversarial. Esto lo orienta a despliegues donde la robustez del modelo frente a entradas maliciosas es un requisito relevante.

El modelo tiene 3.402.836.480 parametros totales (aproximadamente 3,4B), esta declarado unicamente para ingles (`en`) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La fecha de creacion del repositorio es el 1 de octubre de 2026, con muy pocas descargas y likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de IBM Granite 4.1 dense 3B; se asume transformer denso) |
| Parametros totales | 3.402.836.480 (aprox. 3,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repositorio con multiples ficheros por nivel de cuantizacion) |

## Arquitectura y entrenamiento

No se proporcionan detalles de arquitectura en la informacion disponible. El modelo base declarado es `hirundo-io/granite-4.1-3b-hardened`, que segun la nomenclatura y las etiquetas procede de la familia IBM Granite 4.1 dense, ofrecida en tamanos de 3B, 8B y 30B. La unica informacion tecnica concreta disponible apunta a que el modelo ha sido sometido a un proceso de *behavioral unlearning* y endurecimiento frente a inyeccion de prompts (`prompt-injection`), orientado a reducir respuestas no deseadas y aumentar la resistencia a ataques adversariales. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como RLHF o DPO.

En cuanto a la cuantizacion, mradermacher indica que se trata de cuantizaciones estaticas (no ponderadas con imatrix), generadas sobre el modelo en formato HuggingFace y reconvertidas a GGUF. El autor senala que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de publicacion y que podrian no llegar a generarse. No se documenta ninguna innovacion adicional como decodificacion especulativa, atencion lineal o arquitectura hibrida.

## Capacidades

- Generacion de texto conversacional en ingles, dado que el repositorio esta marcado como `conversational`.
- Endurecimiento frente a inyeccion de prompts, orientado a resistir entradas adversariales que intenten secuestrar el comportamiento del modelo.
- Comportamiento alineado mediante *behavioral unlearning*, con el objetivo declarado de suprimir ciertos comportamientos no deseados del modelo base.
- Herencia de las capacidades del modelo base Granite 4.1 dense 3B, que segun la documentacion de IBM incluye mejoras en uso de herramientas (*tool calling*), seguimiento de instrucciones, codigo y razonamiento matematico, aunque no hay confirmacion especifica de estas capacidades en el modelo endurecido.
- Formato GGUF compatible con motores de inferencia local, lo que permite despliegue en CPU y GPU.
- No hay evidencia disponible de soporte de vision, audio, modo de razonamiento explicito (*thinking*) ni capacidad multilingue mas alla del ingles.

## Casos de uso

- Filtrado y saneamiento de entradas en aplicaciones LLM: dado su endurecimiento frente a inyeccion de prompts, puede emplearse como primera linea para evaluar o procesar entradas potencialmente maliciosas antes de pasarlas a un modelo mayor.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones de entre 1,5 GB y 3,7 GB, puede ejecutarse en portatiles o mini-PC sin GPU dedicada, cubriendo tareas de generacion de texto y asistencia conversacional sencilla.
- Asistente conversacional en ingles integrado en aplicaciones de escritorio: el modelo es conversacional y con 3,4B parametros puede ofrecer respuestas con latencia baja en un unico equipo.
- Evaluacion de robustez y experimentacion en seguridad: util como modelo de referencia para estudiar el efecto del *behavioral unlearning* y del endurecimiento ante ataques de prompt, comparandolo con el modelo base sin endurecer.
- Prototipado rapido en pipelines de agentes: las capacidades heredadas de *tool calling* del modelo base permiten integrarlo en flujos de automatizacion de bajo coste, siempre verificando su comportamiento real.
- Sistemas educativos o de demostracion: al ser ligero y de licencia Apache 2.0, es adecuado para entornos de formacion donde se ensene a desplegar modelos GGUF con llama.cpp u Ollama.
- Inferencia en el borde (*edge*): su tamano reducido permite empaquetarlo en dispositivos con poca memoria, siempre que las tareas no exijan contexto muy largo ni razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y las busquedas web no aportan cifras especificas para esta variante cuantizada ni para el modelo base endurecido.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada a partir del tamano de fichero mas overhead de contexto y runtime):
  - Q2_K (1,5 GB): aprox. 2,5-3 GB de VRAM.
  - Q4_K_M (2,2 GB): aprox. 3,5-4,5 GB de VRAM.
  - Q6_K (2,9 GB): aprox. 4,5-5,5 GB de VRAM.
  - Q8_0 (3,7 GB): aprox. 5-6,5 GB de VRAM.
  - f16 (6,9 GB): aprox. 8-9 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para las cuantizaciones bajas (por ejemplo GTX 1650, RTX 3050, RTX 4060); para Q8_0 o f16 se recomienda RTX 3070/4070 o superior. En entornos de servidor, A100 y H100 no son necesarias por el reducido tamano del modelo.
- Cabe en GPU de consumo: si, practicamente todas las cuantizaciones inferiores a Q6_K caben en GPUs de 4-6 GB. Las variantes Q8_0 y f16 requieren 6-9 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. El autor enlaza a los README de TheBloke para instrucciones de uso y concatenacion de ficheros multiparte. El repositorio indica compatibilidad con `endpoints_compatible` y con `transformers` (para los pesos originales en safetensors del modelo base).
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la cuantizacion y del contexto empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/granite-4.1-3b-hardened-GGUF | 3,4B | no disponible | GGUF | apache-2.0 | Cuantizacion del modelo endurecido de Hirundo; solo ingles |
| hirundo-io/granite-4.1-3b-hardened | 3,4B | no disponible | safetensors/HF | apache-2.0 | Modelo base sin cuantizar, origen de esta ficha |
| IBM Granite 4.1 dense 3B | aprox. 3B | no disponible | safetensors/HF y variantes | apache-2.0 | Modelo original de IBM; mejoras en tool use, codigo y matematicas segun IBM |
| mradermacher/granite-4.1-3b-abilerated-unc-GGUF | no disponible | no disponible | GGUF | no disponible | Otra cuantizacion del mismo autor sobre una variante distinta de Granite 4.1 3B |

## Limitaciones y advertencias

- Idioma: el repositorio esta marcado unicamente para ingles (`en`); el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Sesgos conocidos: no se documentan de forma especifica. Al derivar de un modelo de IBM, puede heredar sesgos presentes en los datos de entrenamiento del modelo original, no declarados en esta ficha.
- Riesgo de alucinacion: no cuantificado. Con 3,4B parametros, el modelo es propenso a errores factuales en tareas de conocimiento, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K).
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K introducen degradacion notable; el propio autor marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- Efecto del endurecimiento no verificado: no hay benchmarks que confirmen el grado real de resistencia a inyeccion de prompts ni el impacto del *behavioral unlearning* sobre las capacidades generales.
- Contexto no documentado: se desconoce la longitud de contexto soportada, lo que dificulta planificar usos con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `hirundo-io/granite-4.1-3b-hardened` y del Granite 4.1 original antes de un despliegue comercial.
- Madurez del repositorio: con cero descargas y cero likes en el momento de redaccion, no hay validacion de la comunidad sobre la calidad o el comportamiento real de estas cuantizaciones.
- Cuantizaciones ponderadas no disponibles: no existen versiones imatrix, lo que puede reducir la calidad relativa frente a cuantizaciones ponderadas equivalentes de otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/granite-4.1-3b-hardened-GGUF
- Modelo base: https://huggingface.co/hirundo-io/granite-4.1-3b-hardened
- Pagina de descargas del autor: https://hf.tst.eu/model#granite-4.1-3b-hardened-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Granite 4.1 en IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Granite 4.1 en LM Studio: https://lmstudio.ai/models/granite-4.1
- Granite Guardian (GitHub): https://github.com/ibm-granite/granite-guardian
- Cuantizacion alternativa del mismo autor: https://huggingface.co/mradermacher/granite-4.1-3b-abilerated-unc-GGUF
- Cuantizacion alternativa i1 del mismo autor: https://huggingface.co/mradermacher/granite-4.1-3b-abilerated-unc-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
