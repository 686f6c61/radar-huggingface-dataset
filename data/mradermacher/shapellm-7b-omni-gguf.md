# mradermacher/ShapeLLM-7B-omni-GGUF

## Resumen

ShapeLLM-7B-omni es un modelo multimodal de gran escala orientado a la generacion de mallas 3D (mesh generation) a partir de entradas multimodales. Desarrollado originalmente por yejunliang23, se distribuye aqui en formato GGUF gracias al trabajo de cuantizacion de mradermacher. El modelo parte de una base de 7.671.584.256 parametros (aproximadamente 7,7 mil millones) y esta etiquetado como Multimodal-Large-Language-Model con capacidad de generacion de mallas.

Esta ficha documenta la version cuantizada en GGUF del modelo, publicada el 3 de junio de 2025 y actualizada por ultima vez el 21 de noviembre de 2026. La relevancia de esta distribucion radica en que permite ejecutar un modelo multimodal de 7B especializado en geometria 3D en hardware de consumo mediante llama.cpp y herramientas compatibles, algo que el formato original en transformers dificultaria por requisitos de VRAM.

La informacion disponible publicamente es limitada: la model card del repositorio GGUF se centra en los detalles de cuantizacion y no incluye especificaciones detalladas de arquitectura, datos de entrenamiento ni benchmarks. Los datos que no constan se indican explicitamente como "no disponible" a lo largo de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con capacidad de generacion de mallas; detalles de la arquitectura no publicados en la informacion disponible) |
| Parametros totales | 7.671.584.256 (aprox. 7,7B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplementos multimodales) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en transformers |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base (yejunliang23/ShapeLLM-7B-omni) esta etiquetado como Multimodal-Large-Language-Model con la capacidad especifica de mesh-generation, lo que sugiere una integracion de un codificador multimodal con un modelo de lenguaje de aproximadamente 7,7 mil millones de parametros para producir geometria 3D. Los detalles sobre el tipo de transformer, el mecanismo de atencion, la composicion del dataset de entrenamiento, el numero de tokens y las tecnicas de alineacion (RLHF, DPO u otras) no estan publicados en la informacion disponible.

En cuanto al proceso de cuantizacion, la model card indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf). Un dato tecnico relevante es que el autor senala la deteccion de valores NaN en la capa `blk.4.attn_q.weight` durante el proceso, y que las cuantizaciones no emplean imatrix (`no_imatrix`), lo que puede afectar a la calidad relativa frente a cuantizaciones con matriz de importancia. Se incluyen suplementos multimodales (mmproj) en Q8_0 y f16, necesarios para procesar las entradas multimodales en llama.cpp.

## Capacidades

- Generacion de mallas 3D (mesh generation): capacidad principal declarada del modelo, orientada a producir geometria tridimensional.
- Procesamiento multimodal: la presencia de ficheros mmproj confirma soporte de entradas multimodales (ademas de texto) en el pipeline de llama.cpp.
- Generacion de texto y conversacion: etiquetado como "conversational", apto para dialogos multi-turno.
- Razonamiento multimodal: al combinar un LLM de 7,7B con un codificador multimodal, puede razonar sobre las entradas no textuales que procese.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada; la unica capacidad especial confirmada es la generacion de mallas.

## Casos de uso

- Prototipado de assets 3D: el modelo puede generar mallas a partir de descripciones o entradas multimodales, acelerando la creacion de borradores de geometria en pipelines de diseno de videojuegos o animacion antes del modelado final manual.
- Investigacion en generacion 3D: util como linea base reproducible en entornos academicos para experimentar con generacion de mallas condicionada por texto u otras modalidades, gracias a su licencia MIT y su disponibilidad en GGUF.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,6 GB) permiten ejecutar el modelo en GPUs de consumo con 8-12 GB de VRAM mediante llama.cpp, algo inviable con el modelo original en f16 (15,4 GB).
- Herramientas de autoría 3D asistida: integracion en asistentes conversacionales que, mediante dialogo multi-turno, refinen iterativamente la geometria generada y permitan al usuario ajustar la malla resultante.
- Educacion y demostraciones tecnicas: el reducido tamano de las cuantizaciones bajas (Q2_K, 3,1 GB) facilita demostraciones en portatiles sin GPU dedicada, mostrando las capacidades de un modelo multimodal 3D en entornos docentes.
- Evaluacion comparativa de cuantizaciones: el amplio abanico de cuantizaciones publicadas (de Q2_K a f16) permite estudiar el impacto de la cuantizacion en la calidad de la generacion de mallas, un caso de uso metodologico relevante para investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar overhead de contexto ni el suplemento mmproj):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,6 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,3 GB
  - f16: ~15,4 GB
- Suplemento multimodal adicional: mmproj-Q8_0 (~1,0 GB) o mmproj-f16 (~1,5 GB).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, las cuantizaciones Q4_K_M y Q5_K_M encajan en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Las cuantizaciones Q8_0 y f16 requieren GPUs de mayor capacidad (RTX 4090 24 GB o superiores).
- Cabe en GPU de consumo: si, en las cuantizaciones Q2_K a Q6_K con GPUs de 8 GB o mas; Q8_0 requiere ~10 GB efectivos con overhead.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, llama-cpp-python). El modelo base original esta pensado para transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, se trata de un modelo multimodal de ~7,7B parametros especializado en generacion de mallas 3D, una categoria de nicho con pocos modelos publicos comparables en formato GGUF.

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| ShapeLLM-7B-omni (este) | ~7,7B | no disponible | Generacion de mallas 3D multimodal | MIT | GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Calidad de las cuantizaciones: el autor detecto valores NaN en la capa `blk.4.attn_q.weight` durante el proceso de cuantizacion y las cuantizaciones no emplean imatrix, lo que puede degradar la calidad respecto al modelo original, especialmente en las cuantizaciones mas agresivas (Q2_K, Q3_K).
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; como modelo generativo, es susceptible de producir geometria o texto incorrectos.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar su uso en tareas de contexto largo.
- Uso comercial: la licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base original (yejunliang23/ShapeLLM-7B-omni) y de cualquier dependencia multimodal.
- Madurez del ecosistema: el soporte de entradas multimodales en llama.cpp para generacion de mallas puede ser limitado o experimental; conviene validar el pipeline completo (modelo + mmproj) antes de llevar a produccion.
- Documentacion escasa: la ausencia de benchmarks y de detalles de arquitectura dificulta la evaluacion objetiva frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ShapeLLM-7B-omni-GGUF
- Modelo base original: https://huggingface.co/yejunliang23/ShapeLLM-7B-omni
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#ShapeLLM-7B-omni-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
