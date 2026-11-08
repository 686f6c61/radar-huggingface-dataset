# CholoAsis/qnvoice-cebuano-translation

## Resumen

QnVoice Compact English-to-Cebuano Translation es un paquete de traduccion automatica ingles-cebuano disenado para inferencia offline en dispositivo. Lo publica el usuario CholoAsis (OASIS) en Hugging Face y se construye sobre el modelo base IndexTeam/Index-Translate-2B, al que se le aplica una reduccion de vocabulario y un adaptador LoRA entrenado con pesos nuevos para el dominio conversacional de QnVoice. El resultado se distribuye como un par de artefactos GGUF (base compacta mas adaptador) ejecutables con llama.cpp.

La relevancia del modelo es su enfoque de eficiencia: reduce el vocabulario del modelo base de 248.320 a 55.000 tokens, conservando el alfabeto de bytes, el prompt de traduccion y los tokens vistos en los ejemplos de entrenamiento conversacional. El adaptador anade actualizaciones de rango 16 al ultimo bloque del decodificador. El paquete completo ocupa aproximadamente 1,0 GB en el repositorio, con una base de 978.348.256 bytes y un adaptador de 262.560 bytes.

El modelo se presenta como una alternativa evaluable y reutilizable comercialmente frente a Helsinki-NLP OPUS-MT. Segun la model card, mejora a Helsinki en FLORES-200 y en el conjunto conversacional propio, pero obtiene peores resultados en Tatoeba, lo que indica que las peticiones cortas e idiomaticas siguen siendo un punto debil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre IndexTeam/Index-Translate-2B con vocabulario reducido y adaptador LoRA en el ultimo bloque del decodificador |
| Parametros totales | 131.072 (dato de safetensors); el modelo base declara 978.348.256 bytes de pesos |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por frase en el benchmark nativo (configuracion de ejecucion) |
| Tipos de cuantizacion | GGUF (artefactos distribuidos en formato GGUF); no se detallan otros niveles de cuantizacion |
| Idiomas soportados | ingles (en) y cebuano (ceb) |
| Licencia | apache-2.0-base-cc-by-4.0-adapter (licencia compuesta; ver LICENSES.md) |
| Formato de pesos | GGUF (base y adaptador) |

## Arquitectura y entrenamiento

El modelo parte de IndexTeam/Index-Translate-2B, un transformer de traduccion, y aplica una reduccion de vocabulario que conserva 55.000 de los 248.320 tokens originales: el alfabeto de bytes, el prompt de traduccion y los tokens presentes en los ejemplos de entrenamiento conversacional. Sobre esa base se entrena un adaptador LoRA de rango 16 que actualiza unicamente el ultimo bloque del decodificador. El paquete publicado corresponde al checkpoint de 60 pasos seleccionado en desarrollo, aplicado con una fuerza de 0,08.

El entrenamiento del adaptador se realizo con pesos nuevos para el dominio conversacional de QnVoice. La model card indica que se excluyeron de los prompts de adaptacion las coincidencias normalizadas exactas en ingles con los conjuntos de test. No se detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset. La evaluacion se hizo con decodificacion greedy, comparando los artefactos GGUF exactos con la exportacion ONNX de Helsinki fijada por QnVoice, en un Mac con Apple Silicon. No se especifican tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Traduccion de texto de ingles a cebuano, orientada a inferencia offline en dispositivo.
- Ejecucion con llama.cpp mediante carga conjunta de base GGUF y adaptador LoRA GGUF.
- Modo de plantilla de chat con `enable_thinking` desactivado y decodificacion greedy recomendada.
- Prompt de traduccion especifico conservado en el vocabulario reducido.
- Uso comercial contemplado por la licencia compuesta, con condiciones de atribucion descritas en LICENSES.md.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso.
- Cobertura limitada a los pares de idiomas en/ceb.

## Casos de uso

- Traduccion offline en aplicaciones moviles: el par base mas adaptador en GGUF permite ejecutar la traduccion sin conexion en dispositivos con recursos limitados, que es el objetivo declarado del proyecto QnVoice.
- Traduccion de conversaciones de chat: el adaptador se entreno sobre el conjunto conversacional de QnVoice y obtiene 55,42 chrF++ en ese dominio, por encima de Helsinki (48,96), lo que lo hace adecuado para mensajes informales de tipo dialogo.
- Evaluacion comparativa de traductores: sirve como referencia para comparar con OPUS-MT en FLORES-200 y en conjuntos conversacionales propios, con intervalos de confianza bootstrap publicados.
- Procesamiento por lotes de frases en ingles: con contexto de 512 tokens por frase y limite de generacion de 192 tokens, encaja en pipelines de traduccion de oraciones independientes.
- Integracion en herramientas de escritorio con llama.cpp: la CLI documentada permite incorporarlo a scripts locales de traduccion sin dependencias de servicios en la nube.
- Prototipado de productos de traduccion para cebuano: al ser un release de investigacion con licencia que permite reutilizacion comercial, sirve de base para validar flujos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

| Evaluacion held-out | Frases | Helsinki chrF++ | QnVoice chrF++ | Helsinki BLEU | QnVoice BLEU |
|---|---:|---:|---:|---:|---:|
| FLORES-200 devtest | 1.012 | 52,70 | **55,37** | 24,12 | **28,28** |
| QnVoice conversation | 40 | 48,96 | **55,42** | 24,23 | **31,26** |
| OPUS Tatoeba v2026-07-08 | 424 | **55,02** | 41,00 | **27,74** | 14,52 |

La ganancia en FLORES-200 fue de 2,67 puntos chrF++ (intervalo bootstrap pareado del 95%: +1,97 a +3,36). En el conjunto conversacional fue de 6,46 puntos (+1,35 a +11,85). En Tatoeba la diferencia fue de -14,03 puntos (-16,74 a -11,36). Ambos decodificadores devolvieron texto no vacio en todas las frases. Las puntuaciones son metricas de solapamiento de corpus, no porcentajes de traducciones correctas. No se aportan cifras de latencia ni de memoria en iPhone.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 1,0 GB y la base pesa 978.348.256 bytes, por lo que la inferencia en GGUF cabe en unos pocos GB de memoria.
- GPU recomendadas: no se especifican. El benchmark se ejecuto en un Mac con Apple Silicon, lo que sugiere viabilidad en hardware de consumo.
- GPU de consumo: no se confirma compatibilidad con modelos concretos (RTX 4090, etc.); el formato GGUF y el tamano permiten esperar ejecucion en GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: llama.cpp (documentado con `llama-cli`, `--lora`, `--jinja`, `--chat-template-kwargs`, `--temp 0`, `-c 512`, `-n 192`).
- Latencia y throughput: no disponibles. La model card indica explicitamente que no se reclaman cifras de latencia ni memoria para iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLORES-200 chrF++ | Tatoeba chrF++ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| QnVoice Compact en-ceb | 131.072 (safetensors); base de 978.348.256 bytes | 512 tokens por frase en benchmark | 55,37 | 41,00 | apache-2.0-base-cc-by-4.0-adapter | GGUF en Hugging Face |
| Helsinki-NLP OPUS-MT (export ONNX fijado por QnVoice) | no disponible | no disponible | 52,70 | 55,02 | no disponible en la informacion | ONNX |
| IndexTeam/Index-Translate-2B (base) | 2B (por nombre) | no disponible | no disponible | no disponible | no disponible en la informacion | Hugging Face |

La comparativa se limita a los datos publicados en la model card; no se dispone de resultados de otros traductores en-ceb en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a Helsinki en Tatoeba (41,00 frente a 55,02 chrF++; 14,52 frente a 27,74 BLEU), lo que indica fallos en peticiones cortas e idiomaticas.
- Las referencias del conjunto conversacional QnVoice fueron creadas para este experimento y no han sido evaluadas por hablantes nativos independientes.
- Se desconoce la exposicion del entrenamiento upstream a las fuentes de test publicas.
- Las metricas son de solapamiento de corpus, no miden correccion semantica.
- No sustituye al traductor de cebuano incluido en QnVoice para iOS.
- Cobertura limitada a ingles y cebuano; no hay soporte multilingue adicional.
- Licencia compuesta (apache-2.0 para la base, CC BY 4.0 para el adaptador): es necesario revisar LICENSES.md para uso comercial y atribucion.
- No se han publicado cifras de latencia ni de memoria en dispositivos moviles.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CholoAsis/qnvoice-cebuano-translation
- Licencias: https://huggingface.co/CholoAsis/qnvoice-cebuano-translation/blob/main/LICENSES.md
- CITATION.cff: https://huggingface.co/CholoAsis/qnvoice-cebuano-translation/blob/main/CITATION.cff
- Modelo base: https://huggingface.co/IndexTeam/Index-Translate-2B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor en Hugging Face: https://huggingface.co/CholoAsis/models
- Articulo sobre herramientas de traduccion en vivo 2026: https://www.marktechpost.com/2026/10/12/top-12-ai-live-translation-tools-2026/
