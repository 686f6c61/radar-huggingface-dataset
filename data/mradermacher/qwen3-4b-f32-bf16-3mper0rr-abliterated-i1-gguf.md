# mradermacher/Qwen3-4B-F32-BF16-3MPER0RR-abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo `3MPER0RR/Qwen3-4B-F32-BF16-3MPER0RR-abliterated`, una version "abliterated" (con el comportamiento de rechazo eliminado de los pesos) del modelo Qwen3-4B. Las cuantizaciones han sido generadas por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos a GGUF, utilizando cuantizacion con imatrix (matriz de importancia) para las variantes de la serie i1.

El modelo base tiene 4.022.468.096 parametros (aproximadamente 4,02 mil millones) y hereda la arquitectura transformer decoder-only densa de Qwen3-4B. La modificacion "abliterated" sustituye el proceso habitual de alineacion y rechazo por una proyeccion de los pesos que elimina la direccion de rechazo, de modo que el modelo no se niega a responder ante ciertas peticiones que un Qwen3-4B alineado rechazaria.

Es relevante para desarrolladores e investigadores que necesiten un modelo compacto (~4B) ejecutable en hardware de consumo, sin filtros de rechazo integrados y con multiples niveles de cuantizacion (desde IQ1_S de 1,2 GB hasta variantes de mayor precision). El repositorio tiene 26 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion muy baja y poca validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-4B); no es MoE |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No confirmada en el repositorio; el modelo base Qwen3-4B documenta 32.768 tokens nativos |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S (y otras de mayor tamano segun los tags) |
| Idiomas soportados | en (ingles), segun la model card y los tags |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes i1 con imatrix); el modelo base se distribuye en safetensors F32/BF16 |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es la de Qwen3-4B: un transformer decoder-only denso con atencion por causalidad. Este repositorio no reentrena el modelo, sino que parte de la version abliterated de 3MPER0RR y la convierte a GGUF aplicando cuantizacion. Las variantes de la serie i1 emplean cuantizacion con imatrix, que calcula una matriz de importancia a partir de datos de calibracion para minimizar la perdida de calidad en los pesos mas sensibles, especialmente en cuantizaciones agresivas (por debajo de 4 bits).

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO, ya que corresponden al entrenamiento del Qwen3-4B original (externo a este repositorio). La innovacion tecnica relevante aqui es el proceso de "abliteration": una transformacion de los pesos que identifica la direccion latente asociada al rechazo y proyecta los pesos ortogonalmente a esa direccion, eliminando la tendencia a negarse a responder. Este proceso puede degradar ligeramente capacidades generales del modelo, aunque no se aportan mediciones al respecto.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento de proposito general, matematicas y generacion de codigo (capacidades heredadas de Qwen3-4B).
- Soporte de cuantizacion para ejecucion local en CPU y GPU mediante llama.cpp y derivados.
- Respuestas sin rechazo ante peticiones que un modelo alineado bloquearia (caracteristica principal del modelo abliterated).
- Herramientas de inferencia etiquetadas como compatibles con text-generation-inference y endpoints.
- Capacidades multilingues: no confirmadas en este repositorio; el campo de idioma solo declara ingles.
- Tool calling, modo thinking o capacidades de vision: no confirmadas en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: analizar como varia el comportamiento de un modelo al eliminar la direccion de rechazo, comparando respuestas frente a un Qwen3-4B alineado.
- Generacion de texto creativo sin filtros: redaccion de ficcion o contenido que un modelo alineado podria rechazar por politica, en entornos controlados.
- Pruebas de robustez y red teaming: evaluar la facilidad con la que el modelo produce contenido sensible, para calibrar defensas en pipelines propios.
- Inferencia local en hardware de consumo: con cuantizaciones Q4_K_M (~2,6 GB) puede ejecutarse en GPUs de gama media o incluso en CPU con llama.cpp.
- Integracion en prototipos y demos: modelo compacto de ~4B para aplicaciones de chatbot en ingles donde no se requiera filtrado de contenido.
- Ajuste fino posterior (fine-tuning): la licencia Apache 2.0 y el tamano reducido lo hacen util como base para experimentos de destilacion o adaptacion con LoRA.
- Evaluacion de degradacion por cuantizacion: comparar las distintas variantes i1 (de IQ1_S a Q5_K_M) para medir el impacto de la cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona tablas de MMLU, HumanEval, GSM8K ni comparativas de rendimiento para este repositorio de cuantizaciones. No se deben inferir cifras del modelo base Qwen3-4B, ya que el proceso de abliteration y la cuantizacion pueden alterar el rendimiento.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de archivo, mas overhead de contexto):
  - i1-IQ1_S / i1-IQ1_M: ~1,2 GB
  - i1-IQ2_XXS a i1-IQ2_M: ~1,3-1,6 GB
  - i1-Q2_K / i1-IQ3_XXS: ~1,8 GB
  - i1-Q3_K_M / i1-Q3_K_L: ~2,2-2,3 GB
  - i1-IQ4_XS / i1-Q4_K_S / i1-Q4_K_M: ~2,4-2,6 GB
  - i1-Q5_K_S: ~2,9 GB
  - El repo completo ocupa 48,0 GB (todas las variantes empaquetadas).
- Modelo base en F32/BF16 (safetensors): requiere aproximadamente 16 GB en F32 o ~8 GB en BF16.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para cuantizaciones Q4/Q5; A100 o H100 no son necesarias para un modelo de 4B.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 4 GB de VRAM para las cuantizaciones Q4/Q5, y en CPU mediante llama.cpp para las variantes mas pequenas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui, y text-generation-inference (segun los tags del repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3-4B abliterated i1 GGUF) | ~4,02 B | No confirmado | GGUF | apache-2.0 | Sin rechazo; cuantizado por mradermacher; 26 descargas |
| Qwen/Qwen3-4B-GGUF | ~4 B | 32.768 tokens (segun Qwen) | GGUF | apache-2.0 | Version oficial alineada de Qwen |
| Qwen3-4B-Instruct-2507 / Thinking-2507 | ~4 B | 32.768 tokens (segun Qwen) | safetensors | apache-2.0 | Variante actualizada oficial (julio 2025) |
| Otros modelos abliterated de ~4B | variable | variable | GGUF/safetensors | variable | Indice en abliteratedmodels.org (850 modelos) |

## Limitaciones y advertencias

- Modelo sin rechazo: elimina las negativas de seguridad, por lo que puede generar contenido danino, sesgado o ilegal. Requiere uso responsable y control de acceso si se despliega en produccion.
- Riesgo de alucinacion: inherente a los modelos de ~4B y potencialmente agravado por la cuantizacion agresiva en las variantes de menor tamano (IQ1, IQ2).
- Idiomas: la model card solo declara ingles; el comportamiento en castellano no esta validado y probablemente sea inferior al de modelos multilingues especificos.
- Calidad variable entre cuantizaciones: las variantes por debajo de 4 bits (IQ1_S, IQ2_XXS) tendran degradacion notable; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Adopcion muy baja: 26 descargas y 0 likes, sin validacion independiente ni benchmarks publicados. No hay garantias de calidad.
- Contexto no confirmado: no se especifica en el repositorio la longitud de contexto soportada tras la cuantizacion.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae en el usuario.
- No es un modelo de MoE ni dispone de parametros activos reducidos; el rendimiento de inferencia depende del hardware.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3-4B-F32-BF16-3MPER0RR-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/3MPER0RR/Qwen3-4B-F32-BF16-3MPER0RR-abliterated
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3-4B-F32-BF16-3MPER0RR-abliterated-GGUF
- Perfil del cuantizador mradermacher: https://huggingface.co/mradermacher
- Qwen3-4B-GGUF oficial: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Repositorio QwenLM/Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3-4b
- Indice de modelos abliterated: https://www.abliteratedmodels.org/
- README de referencia de TheBloke para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
