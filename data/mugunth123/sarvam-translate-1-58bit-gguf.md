# Mugunth123/sarvam-translate-1.58bit-GGUF

## Resumen

Mugunth123/sarvam-translate-1.58bit-GGUF es una cuantizacion de precision extrema (1,58 bits, esquema ternario IQ1_M con imatrix de calibracion) del modelo sarvamai/sarvam-translate, un modelo fundacional de traduccion multilingue desarrollado por Sarvam AI en colaboracion con AI4Bharat y construido sobre Gemma 3 4B-IT de Google DeepMind. El objetivo del modelo base es la traduccion bidireccional entre el ingles y las 22 lenguas programadas de la India, un espacio traditionally mal cubierto por los modelos multilingues genericos.

La contribucion de este repositorio concreto es de ingenieria de despliegue: reduce el peso de 8,1 GB (sin cuantizar) a 1,11 GB, lo que permite ejecutar un modelo de traduccion de 3.880 millones de parametros en hardware muy modesto, incluidos dispositivos de borde, CPU y GPUs de consumo con poca VRAM. Emplea un esquema ternario de 1,75 bits efectivos por peso, que segun el autor conserva mayor fidelidad semantica que la variante de 1 bit puro con un coste de tamano minimo.

El modelo hereda la arquitectura de Gemma 3 4B (transformer con GQA de 8 cabezas de consulta y 4 de clave/valor, 34 capas) y un contexto de hasta 8.192 tokens. Es relevante ahora porque demuestra que la traduccion automatica de calidad aceptable para lenguas de bajos recursos puede empaquetarse en menos de 1,2 GB y ejecutarse localmente, sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B), GQA con 8 Q-heads y 4 KV-heads, 34 capas |
| Parametros totales | 3.880.263.168 (~3,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 8.192 tokens |
| Tipos de cuantizacion | GGUF IQ1_M (ternario, 1,58 bits, 1,75 BPW efectivos); el autor publica tambien IQ1_S (1 bit), IQ2_M, Q4_K_M y Q8_0 |
| Idiomas soportados | 22 lenguas programadas de la India mas ingles: as, bn, brx, doi, gom, gu, hi, kn, ks, mai, ml, mni, mr, ne, or, pa, sa, sat, sd, ta, te, ur |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (fichero sarvam-translate-IQ1_M.gguf) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only derivado de Gemma 3 4B-IT, con atencion por grupos (GQA) de 8 cabezas de consulta y 4 de clave/valor distribuidas en 34 capas. El ajuste fino para traduccion lo realizaron Sarvam AI y AI4Bharat sobre el checkpoint instructivo de Gemma 3, especializandolo en pares de traduccion ingles-lenguas indias. La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO especificas para traduccion; estos datos deben consultarse en la model card del modelo base.

La innovacion tecnica de este repositorio es la cuantizacion a 1,58 bits mediante el esquema IQ1_M de llama.cpp, que agrupa pesos en bloques ternarios (valores -1, 0, +1 con escalas) y emplea una imatrix de calibracion para minimizar la perdida de calidad. El resultado son 1,75 bits efectivos por peso y un fichero de 1,11 GB frente a los 8,1 GB del modelo sin cuantizar. No se dispone de informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal en esta variante.

## Capacidades

- Traduccion bidireccional entre ingles y 22 lenguas programadas de la India (asames, bengali, bodo, dogri, gujarati, hindi, kannada, cachemir, konkani, maithili, malayalam, manipuri, marathi, nepali, odia, punjabi, sanscrito, santali, sindhi, tamil, telugu y urdu).
- Generacion de texto conversacional en formato de turnos de Gemma 3 (`<start_of_turn>user` / `<start_of_turn>model`).
- Traduccion guiada por instrucciones en lenguaje natural ("Translate the text below to Hindi").
- Inferencia determinista recomendada con temperatura 0,0 para traduccion.
- Capacidad de procesar entradas de hasta 8.192 tokens, adecuada para parrafos y documentos cortos.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido para esta variante cuantizada.

## Casos de uso

- Traduccion local en dispositivos de borde: con 1,11 GB de pesos, el modelo cabe en telefonos de gama alta, Raspberry Pi con suficiente RAM o mini-PC, permitiendo traduccion offline sin conexion ni coste por API.
- Traduccion de documentacion tecnica al hindi y otras lenguas indias: el contexto de 8.192 tokens permite procesar secciones completas de manuales manteniendo coherencia terminologica dentro del fragmento.
- Atencion al cliente multilingue en India: integrado en un backend llama.cpp, puede traducir mensajes de usuarios en tamil, telugu o bengali al ingles para que un agente o sistema posterior los procese, y devolver la respuesta traducida.
- Localizacion de interfaces y contenidos web: traduccion por lotes de cadenas cortas con temperatura 0,0 para maximizar consistencia y reproducibilidad entre ejecuciones.
- Preservacion linguistica y acceso a la informacion: traduccion de material educativo y sanitario a lenguas de bajos recursos como santali, bodo o manipuri, donde los modelos comerciales suelen tener cobertura limitada.
- Prototipado e investigacion: banco de pruebas de bajo coste para evaluar la viabilidad de traduccion ternaria en pipelines de NLP, comparando IQ1_M con las variantes IQ1_S, IQ2_M, Q4_K_M y Q8_0 del mismo autor.
- Traduccion en entornos con restricciones de privacidad: al ejecutarse en local, los textos sensibles (juridicos, medicos) no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas como BLEU, chrF, COMET, MMLU ni comparaciones cuantitativas frente a otras cuantizaciones o modelos de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB con IQ1_M (1,11 GB de pesos mas cache KV para el contexto configurado).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; RTX 3050, RTX 4060, RTX 4090, A100 y H100 funcionan sobradamente. Tambien es viable en CPU pura.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`), llama-cpp-python, y cualquier runtime compatible con GGUF (Ollama, LM Studio). El autor no documenta soporte explicito para vLLM o TGI, que tipicamente requieren formatos safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El autor recomienda `-t 8` hilos y `--single-turn` en la CLI de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Mugunth123/sarvam-translate-1.58bit-GGUF | 3,88 mil millones | 8.192 | GGUF IQ1_M (1,11 GB) | GPL-3.0 | Cuantizacion ternaria del modelo Sarvam; maxima compresion |
| Mugunth123/sarvam-translate-4bit-GGUF | 3,88 mil millones | 8.192 | GGUF Q4_K_M (2,31 GB) | GPL-3.0 | Misma base, mayor fidelidad a costa de mas memoria |
| Mugunth123/sarvam-translate-8bit-GGUF | 3,88 mil millones | 8.192 | GGUF Q8_0 (3,84 GB) | GPL-3.0 | Practicamente sin perdida de cuantizacion |
| sarvamai/sarvam-translate (base) | 3,88 mil millones | 8.192 | Safetensors (8,1 GB) | GPL-3.0 | Modelo original sin cuantizar; requiere GPU con mas VRAM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la eleccion entre ellas debe basarse en el equilibrio entre memoria disponible y fidelidad de traduccion requerida.

## Limitaciones y advertencias

- La cuantizacion a 1,58 bits introduce degradacion de calidad respecto al modelo original; es esperable perdida de fluidez y precision en lenguas de bajos recursos, aunque el autor afirma que IQ1_M supera a IQ1_S en fidelidad semantica.
- Riesgo de alucinacion y de omision de contenido en textos largos o con terminologia especializada, agravado por la compresion extrema de pesos.
- Contexto limitado a 8.192 tokens: documentos mas largos requieren fragmentacion, lo que puede romper la coherencia terminologica entre segmentos.
- Cobertura limitada a ingles y 22 lenguas indias; no es un modelo multilingue general y no debe usarse para otros pares de idiomas.
- Licencia GPL-3.0: el uso comercial es posible, pero obliga a distribuir el codigo derivado bajo la misma licencia, lo que puede ser incompatible con productos propietarios. Conviene revisar las condiciones del modelo base sarvamai/sarvam-translate.
- El modelo base deriva de Gemma 3, sujeto a los terminos de uso de Google; la combinacion de licencias debe verificarse antes de un despliegue en produccion.
- No se documentan evaluaciones de sesgo para esta variante; los sesgos del modelo base pueden persistir o amplificarse con la cuantizacion.
- Repositorio con 163 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado, sin garantias de mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mugunth123/sarvam-translate-1.58bit-GGUF
- Modelo base: https://huggingface.co/sarvamai/sarvam-translate
- Cuantizacion 1 bit (IQ1_S): https://huggingface.co/Mugunth123/sarvam-translate-1bit-GGUF
- Cuantizacion 2 bits (IQ2_M): https://huggingface.co/Mugunth123/sarvam-translate-2bit-GGUF
- Cuantizacion 4 bits (Q4_K_M): https://huggingface.co/Mugunth123/sarvam-translate-4bit-GGUF
- Cuantizacion 8 bits (Q8_0): https://huggingface.co/Mugunth123/sarvam-translate-8bit-GGUF
- Perfil del autor: https://huggingface.co/Mugunth123
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Gemma 3 (Google DeepMind): https://huggingface.co/google/gemma-3-4b-it
