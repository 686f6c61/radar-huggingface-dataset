# mradermacher/Cerberus-24B-i1-GGUF

## Resumen

Cerberus-24B-i1-GGUF es la version cuantizada en formato GGUF del modelo Cerberus-24B, desarrollado originalmente por el usuario c4tdr0ut y cuantizado por mradermacher. Se trata de un modelo de generacion de texto de aproximadamente 23.570 millones de parametros (23,57 B), afinado a partir de la familia Mistral, orientado a conversacion y con la etiqueta "uncensored", lo que indica que ha sido entrenado para reducir los rechazos y filtros de contenido tipicos de los modelos alineados.

El modelo base fue afinado mediante una combinacion de ORPO (Odds Ratio Preference Optimization) y QLoRA, segun los tags declarados en la model card. Esta version concreta no es un modelo nuevo, sino un conjunto de cuantizaciones con imatrix (importancia matrix) generadas por mradermacher, que van desde IQ1_S (5,4 GB) hasta Q6_K (19,4 GB), pensadas para ejecutar el modelo en hardware de consumo mediante llama.cpp y ecosistemas compatibles.

La relevancia de esta ficha radica en que permite desplegar un modelo de ~24 B en GPUs de consumo con cuantizaciones de 4 bits (Q4_K_M, 14,4 GB), manteniendo un equilibrio razonable entre calidad y huella de memoria. Es importante senalar que la informacion publica disponible es escasa: no se declaran idiomas soportados, benchmarks ni detalles del dataset de entrenamiento, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Mistral, segun tags) |
| Parametros totales | 23.572.403.200 (~23,57 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | no disponible (la model card solo declara "en") |
| Licencia | other (ver limitaciones) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Cerberus-24B es un transformer decoder-only de ~23,57 B de parametros, derivado de la familia Mistral segun los tags de la model card. El afinamiento se realizo con ORPO (un metodo de alineacion que combina la optimizacion de preferencias con el ajuste supervisado en una sola etapa) y QLoRA (fine-tuning de bajo rango sobre pesos cuantizados). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO.

Esta version concreta (i1-GGUF) ha sido cuantizada por mradermacher utilizando matrices de importancia (imatrix) generadas a partir del modelo base, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas. El repositorio incluye tambien el fichero imatrix (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. No se declaran innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a chat.
- Modelo etiquetado como "uncensored": menor tendencia a rechazar peticiones por politicas de contenido.
- Razonamiento general y generacion de texto (segun el pipeline declarado: text-generation).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponibles; la model card solo declara ingles ("en").
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantizacion Q4_K_M (14,4 GB) el modelo cabe en una RTX 4090 (24 GB) o en una RTX 3090, permitiendo inferencia privada sin conexion a servicios externos.
- Prototipado de asistentes conversacionales: al estar afinado para chat y disponible en GGUF, se puede integrar en llama.cpp u Ollama para iterar rapidamente sobre prompts y flujos de dialogo.
- Generacion de texto creativo sin filtros estrictos: la etiqueta "uncensored" lo hace adecuado para experimentacion con narrativa, role-play o guiones donde los modelos alineados suelen rechazar contenido.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 23 variantes de cuantizacion, lo que permite medir el impacto de la precision en la calidad de salida para un mismo modelo.
- Investigacion sobre alineacion y seguridad: util para estudiar el comportamiento de modelos afinados con ORPO y comparar sus respuestas frente a modelos alineados convencionalmente.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 (6,6-10,8 GB) permiten ejecutar el modelo en GPUs de 8-12 GB, a costa de perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, mas overhead de contexto y KV cache):
  - IQ1_S: ~5,4 GB
  - IQ2_M: ~8,2 GB
  - IQ3_M: ~10,8 GB
  - IQ4_XS: ~12,9 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para Q4_K_M en adelante; RTX 4080/4070 Ti (16 GB) para Q4_K_S/IQ4_XS; GPUs de 8-12 GB para IQ2/IQ3. Para Q6_K conviene una GPU de 24 GB o superior (A100, H100) si se quiere contexto amplio.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones; Q6_K requiere 24 GB o repartir entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero esta version concreta es GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cerberus-24B-i1-GGUF | ~23,57 B | no disponible | other | GGUF | Afinado ORPO/QLoRA, uncensored |
| Mistral Small (24B) | ~24 B | no disponible | Apache 2.0 (segun version) | safetensors/GGUF | Referencia de la familia; alineacion estandar |
| Gemma 2 27B | ~27 B | no disponible | Gemma License | safetensors/GGUF | Alternativa de tamano similar, alineada |
| Qwen2.5 32B | ~32 B | no disponible | Apache 2.0 | safetensors/GGUF | Mayor tamano, multilingue |

Nota: los datos de contexto y rendimiento de los modelos comparados no se han verificado en la informacion proporcionada; se indican a modo orientativo de categoria.

## Limitaciones y advertencias

- La licencia es "other": no se especifican los terminos exactos, por lo que el uso comercial requiere consultar la licencia del modelo base (c4tdr0ut/Cerberus-24B) antes de desplegarlo en produccion.
- Modelo "uncensored": puede generar contenido inapropiado, ofensivo o inseguro; no es adecuado para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como todo modelo de lenguaje, puede inventar hechos.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado.
- Contexto: no se especifica la longitud de ventana, lo que impide planificar casos de uso con documentos largos.
- Cuantizaciones de muy baja precision (IQ1, IQ2) degradan notablemente la calidad; las propias notas del autor las describen como "for the desperate".
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El repo ocupa 253,6 GB por incluir todas las variantes; conviene descargar solo la cuantizacion necesaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mradermacher/Cerberus-24B-i1-GGUF
- Modelo base: https://huggingface.co/c4tdr0ut/Cerberus-24B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Cerberus-24B-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Cerberus-24B-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
