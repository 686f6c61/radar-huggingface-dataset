# mradermacher/abliterated-minicpm5-2b-v2-i1-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo KidIkaros/abliterated-minicpm5-2b-v2, generadas por el usuario mradermacher. Se trata de un modelo de generación de texto de aproximadamente 2,52 mil millones de parámetros (2.516.756.480 según los pesos en safetensors), derivado de la familia MiniCPM5 en su variante de 2B y sometido a un proceso de "abliteration", es decir, la eliminación o atenuación de los mecanismos de rechazo aprendidos durante el alineamiento. El repositorio incluye únicamente el formato GGUF cuantizado, pensado para su uso con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que combina tres características poco habituales en un modelo de su tamaño: licencia Apache 2.0, naturaleza "abliterated" (sin filtros de rechazo) y una batería amplia de cuantizaciones con imatrix que van desde IQ1_S (0,8 GB) hasta Q6_K (2,2 GB). Esto permite desplegarlo en hardware muy modesto, incluidos equipos de consumo e incluso CPU, manteniendo un tamaño de fichero reducido.

No obstante, la información pública disponible es muy limitada: el repositorio no incluye datos sobre longitud de contexto, composición del dataset de entrenamiento, número de tokens, benchmarks ni procedimiento exacto de abliteración o DPO. La model card se limita a listar los ficheros cuantizados y a remitir al modelo base. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (inferido del nombre del modelo base MiniCPM5; no confirmado en la informacion disponible) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en transformers/pytorch) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de lo que sugiere el nombre del modelo base (KidIkaros/abliterated-minicpm5-2b-v2), que apunta a un transformer decoder-only de la familia MiniCPM5 en su variante de 2B parámetros. El repositorio únicamente contiene los pesos cuantizados en GGUF; no se incluye el script de conversión, la configuración del modelo ni el tokenizador, que deben tomarse del modelo original.

En cuanto al entrenamiento, las etiquetas del repositorio indican "abliterated" y "dpo". Esto sugiere que el modelo base fue sometido a un proceso de abliteration para eliminar la dirección de rechazo en el espacio de activaciones y, presumiblemente, a un ajuste posterior con DPO (Direct Preference Optimization). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases adicionales de RLHF o SFT. Tampoco se documentan innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.).

Las cuantizaciones de este repositorio son de tipo "i1" con fichero imatrix, lo que indica que mradermacher generó una matriz de importancia (importance matrix) para mejorar la calidad de las cuantizaciones de baja precisión. El propio autor advierte en la model card que las cuantizaciones por debajo de Q4 pierden calidad de forma apreciable.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogo multi-turno ("conversational").
- Generación de texto creativo sin los filtros de rechazo habituales, al haber sido "abliterated".
- Ajuste por preferencias (DPO) que, según las etiquetas, debería mejorar la calidad de las respuestas respecto al modelo base sin ajustar.
- Ejecución local en CPU y GPU gracias al formato GGUF y al soporte de llama.cpp.
- No hay información sobre soporte de tool calling o function calling.
- No hay información sobre capacidades de agente, razonamiento multi-paso o "thinking mode".
- No hay información sobre visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según el campo de idiomas del repositorio.

## Casos de uso

- Escritura creativa y ficción sin restricciones temáticas: el proceso de abliteration elimina las negativas automáticas, lo que permite generar narrativa con temáticas que otros modelos rechazarían. Adecuado para autores que necesitan borradores sin fricción.
- Roleplay y personajes conversacionales: su naturaleza conversacional y su tamaño reducido lo hacen apto para chatbots de personaje que se ejecutan en local, con latencia baja en GPU de gama media.
- Generación de datos sintéticos: puede emplearse para producir grandes volúmenes de texto de entrenamiento en inglés, especialmente en dominios donde los modelos alineados se niegan a generar ejemplos.
- Investigación sobre alineación y mecanismos de rechazo: útil como caso de estudio para comparar las activaciones y respuestas de un modelo abliterated frente a su versión original, en trabajos de interpretabilidad.
- Red teaming y análisis de prompts adversarios: sirve como modelo de referencia "sin filtros" para estudiar cómo se comporta un sistema sin salvaguardas y diseñar mejores defensas.
- Prototipado rápido de asistentes conversacionales: al ocupar menos de 2,2 GB en Q6_K, se puede integrar en un prototipo con Ollama o llama.cpp en un portátil sin GPU dedicada.
- Despliegue en edge o dispositivos con recursos limitados: las cuantizaciones IQ2 permiten ejecutarlo en dispositivos con menos de 2 GB de memoria, útil para demos offline o entornos embebidos.
- Traducción y reescritura en inglés: como modelo solo-inglés, puede usarse para parafrasear, resumir o adaptar registro en ese idioma, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el overhead de contexto y KV cache. Orientativamente: ~1 GB para IQ2, ~1,7 GB para Q4_K_M y ~2,2 GB para Q6_K, más entre 0,5 y 2 GB adicionales según la longitud de contexto configurada.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, etc.), e incluso en GPUs integradas con memoria compartida.
- Funciona en CPU pura mediante llama.cpp, con velocidades dependientes del número de núcleos.
- GPU profesionales (A100, H100) no son necesarias; el modelo está muy por debajo de su capacidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. Para batching de alto rendimiento se puede usar vLLM con soporte GGUF, aunque no es su caso de uso natural.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características estructurales. Se listan alternativas de categoría similar (modelos densos de ~2B parámetros) y se marca como "no disponible" todo aquello que no consta en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| abliterated-minicpm5-2b-v2 (i1-GGUF) | ~2,52 B | no disponible | apache-2.0 | no disponible | GGUF (este repo) y pesos base en HF |
| MiniCPM5-2B (modelo base sin abliterar) | ~2 B (no confirmado) | no disponible | no disponible | no disponible | referenciado como base |
| Modelos densos de ~2B de otras familias (p. ej. variantes tipo Qwen, Llama o Gemma de tamano similar) | ~1,5-3 B | no disponible | depende del modelo | no disponible | disponibles en HF |

No se puede establecer una comparación cuantitativa fiable sin benchmarks ni datos de contexto del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado o atenuado deliberadamente los mecanismos de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros. No debe desplegarse en entornos públicos sin salvaguardas externas.
- Riesgo elevado de alucinación: con solo ~2,5 B de parámetros, la fiabilidad factual es limitada y no debe usarse como fuente de verdad sin verificación.
- Solo inglés: no se declara soporte de otros idiomas, incluido el castellano.
- Longitud de contexto desconocida: no se documenta la ventana máxima, lo que dificulta planificar tareas de contexto largo.
- Calidad degradada en cuantizaciones bajas: el propio autor advierte que IQ1 e IQ2 son para casos "desesperados" y que Q2_K_S es de muy baja calidad. Para uso real se recomienda Q4_K_M o superior.
- Posible incompatibilidad de licencia: aunque el repo se marca como apache-2.0, la abliteration de un modelo base puede entrar en conflicto con los términos de uso originales del modelo de partida; conviene revisar la licencia del modelo base antes de un uso comercial.
- Repositorio sin adopción: 0 descargas y 0 "likes" en el momento de la consulta, y sin benchmarks ni evaluación independiente, lo que reduce la confianza en su comportamiento en producción.
- Fecha de creación declarada (2026-09-18) posterior a la fecha de muchos despliegues actuales; verificar la vigencia y posibles actualizaciones del repositorio.
- La model card no documenta el proceso exacto de abliteration ni de DPO, lo que impide reproducir el entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-v2-i1-GGUF
- Modelo base: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b-v2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-v2-GGUF
- Página resumen del autor para este modelo: https://hf.tst.eu/model#abliterated-minicpm5-2b-v2-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

Nota: la búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces anteriores proceden de la propia model card y del repositorio de HuggingFace.
