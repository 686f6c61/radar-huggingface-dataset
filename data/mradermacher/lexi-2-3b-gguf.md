# mradermacher/lexi-2.3b-GGUF

## Resumen

Lexi 2.3b es un modelo de lenguaje conversacional de tipo transformer, desarrollado originalmente por Reallexi-llc y distribuido en formato GGUF por mradermacher. Con 2.245.681.664 parametros totales (aproximadamente 2,25 mil millones), se situa en la categoria de modelos pequenos, disenados para ejecutarse en hardware de consumo y en entornos con recursos limitados. La unica version disponible en este repositorio es la cuantizada, derivada del modelo base `Reallexi-llc/lexi-2.3b`.

La relevancia de esta ficha radica en que el repositorio ofrece una bateria completa de cuantizaciones GGUF (desde Q2_K hasta f16), lo que permite desplegar el modelo en practicamente cualquier maquina, desde un portatil con 8 GB de RAM hasta un servidor con GPU dedicada. El modelo esta etiquetado como conversacional y declara soporte unicamente para ingles.

La informacion publicada por el autor es muy escasa: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento, la licencia ni resultados de benchmarks. Esta ficha recoge exclusivamente los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que el autor no ha hecho publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (deducida del uso de `transformers` y del formato de pesos; el autor no especifica variante) |
| Parametros totales | 2.245.681.664 (aproximadamente 2,25 B) |
| Parametros activos | no disponible (no es un modelo MoE segun los datos publicados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base original esta en safetensors |

## Arquitectura y entrenamiento

El autor del repositorio no publica detalles sobre la arquitectura interna del modelo base. Por las etiquetas del repositorio (`transformers`, `gguf`) y por el tamano de parametros, se trata de un transformer decoder-only de aproximadamente 2,25 mil millones de parametros. No se especifica si emplea atencion con ventana deslizante, GQA, RoPE u otras optimizaciones modernas.

Tampoco se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. El repositorio de mradermacher es exclusivamente una conversion a GGUF del modelo `Reallexi-llc/lexi-2.3b`; no anade ni modifica el entrenamiento. Las cuantizaciones son estaticas (no ponderadas ni con imatrix), segun indica el propio autor en la model card.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Razonamiento basico y respuesta a instrucciones, aunque no se documenta el nivel de alineacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles declarado; no hay evidencia de soporte de otros idiomas.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Compatible con endpoints de inferencia (`endpoints_compatible` en las etiquetas).

## Casos de uso

- Prototipado rapido en local: al caber en cuantizaciones de 1,0 a 2,5 GB, permite probar un chatbot conversacional en un portatil sin GPU dedicada usando llama.cpp u Ollama, lo que acelera la validacion de ideas antes de escalar a modelos mayores.
- Asistentes conversacionales ligeros en ingles: el modelo puede gestionar dialogos multi-turno sencillos en aplicaciones de escritorio o moviles donde el presupuesto de memoria es inferior a 4 GB.
- Generacion de texto en entornos edge: su tamano reducido permite desplegarlo en dispositivos con recursos limitados (Raspberry Pi con 8 GB, mini-PC) para tareas de redaccion asistida o resumen de textos cortos.
- Filtrado y clasificacion de texto: puede emplearse como clasificador generativo de baja latencia en pipelines de procesamiento de lenguaje natural donde no se requiere un modelo grande.
- Educacion y experimentacion: util como modelo de referencia para comparar el impacto de distintas cuantizaciones (Q2_K frente a Q8_0) en la calidad de salida, dado que el repositorio ofrece todas las variantes.
- Base para fine-tuning ligero: al ser un modelo pequeno, sirve como punto de partida para ajuste supervisado en tareas especificas en ingles con recursos de GPU modestos (una RTX 3060 de 12 GB es suficiente para QLoRA).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 1,0 GB; Q4_K_M aproximadamente 1,5 GB; Q8_0 aproximadamente 2,5 GB; f16 aproximadamente 4,6 GB (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; una RTX 3060, RTX 4060 o superior para Q8_0 con contexto amplio; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas (GTX 1650 4 GB en adelante) para cuantizaciones Q4 y Q5; para f16 se recomienda al menos 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Tambien es compatible con endpoints de inferencia segun las etiquetas del repositorio.
- Latencia y throughput: no disponibles; al ser un modelo de 2,25 B, se espera una generacion de decenas de tokens por segundo en GPU de consumo con cuantizaciones Q4, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Lexi 2.3b (este) | 2,25 B | no disponible | no disponible | GGUF | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face |
| Gemma-2-2B-it | 2,6 B | 8 192 tokens | Gemma Terms | safetensors, GGUF | Hugging Face |
| Phi-3-mini-4k-instruct | 3,8 B | 4 096 tokens | MIT | safetensors, GGUF | Hugging Face |

La comparativa se limita a parametros, contexto, licencia y disponibilidad, ya que no hay benchmarks publicados de Lexi 2.3b que permitan comparar rendimiento. Frente a alternativas como Qwen2.5-1.5B o Gemma-2-2B, Lexi 2.3b carece de documentacion sobre contexto y licencia, lo que supone una desventaja para su adopcion en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse presumiblemente con datos web en ingles, es probable que herede sesgos de genero, raza y culturales, pero no hay evaluacion publicada.
- Riesgo de alucinacion: no cuantificado; en modelos de este tamano el riesgo de generar informacion falsa es elevado, especialmente en tareas factuales.
- Limitaciones de contexto e idioma: solo se declara soporte de ingles y no se publica la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido; se recomienda contactar con Reallexi-llc antes de usarlo en produccion.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; el autor recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y calidad.
- Falta de documentacion: la ausencia de model card detallada, benchmarks y datos de entrenamiento dificulta la evaluacion rigurosa y la reproducibilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lexi-2.3b-GGUF
- Modelo base: https://huggingface.co/Reallexi-llc/lexi-2.3b
- Pagina de descargas del autor: https://hf.tst.eu/model#lexi-2.3b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
