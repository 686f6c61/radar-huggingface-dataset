# mradermacher/Mending-Hearts-12B-i1-GGUF

## Resumen

Mending-Hearts-12B-i1-GGUF es una colección de cuantizaciones GGUF del modelo Mending-Hearts-12B, creada por mradermacher. El modelo base, Mending-Hearts-12B, es un merge (combinación de modelos) realizado con mergekit, orientado a tareas conversacionales en inglés. La versión GGUF permite ejecutar el modelo en hardware de consumo mediante motores de inferencia como llama.cpp, Ollama o LM Studio, con diferentes niveles de precisión y tamaño.

La relevancia de esta publicación radica en que ofrece una amplia gama de cuantizaciones (desde IQ1_S de 3,1 GB hasta Q6_K de 10,2 GB) con la técnica imatrix, que optimiza la calidad de los pesos cuantizados. El modelo base tiene 12.247.782.400 parámetros (12,2B), lo que lo sitúa en una categoría media-alta, capaz de ofrecer un buen equilibrio entre capacidad y requisitos de hardware. Sin embargo, no se dispone de información pública sobre la arquitectura interna, el entrenamiento o los benchmarks del modelo original, lo que limita la evaluación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo merge, probablemente transformer, sin especificar) |
| Parametros totales | 12.247.782.400 (12,2B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo imatrix incluido) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo base Mending-Hearts-12B. Segun las etiquetas de HuggingFace, se trata de un merge realizado con mergekit, lo que implica una combinacion de multiples modelos preentrenados. No se especifican los componentes del merge, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF fue realizada por mradermacher utilizando el metodo imatrix, que calcula matrices de importancia para mejorar la calidad de los pesos cuantizados, especialmente en cuantizaciones de baja precision. El repositorio incluye un archivo imatrix de 0,1 GB que permite generar cuantizaciones personalizadas.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational", lo que sugiere que esta optimizado para dialogos y asistentes virtuales.
- Soporte en ingles: el idioma declarado es exclusivamente ingles, sin evidencia de capacidades multilingues.
- Integracion con herramientas de inferencia local: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- Personalizacion de cuantizacion: el archivo imatrix permite a los usuarios generar sus propios cuantizados ajustados a sus necesidades.
- No se dispone de informacion sobre tool calling, agentes, razonamiento avanzado, vision o audio.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede ejecutarse en una GPU de consumo para crear un chatbot privado sin conexion a internet, aprovechando las cuantizaciones Q4_K_M o Q5_K_M para un equilibrio entre calidad y rendimiento.
- Prototipado rapido de aplicaciones de NLP: al ser un modelo de 12B, puede servir para experimentar con generacion de texto, resumen o clasificacion antes de pasar a modelos mas grandes.
- Despliegue en entornos con recursos limitados: las cuantizaciones IQ2 o IQ3 permiten ejecutar el modelo en equipos con 4-6 GB de VRAM, aunque con perdida de calidad.
- Generacion de contenido creativo en ingles: redaccion de textos, correos o articulos con un modelo de tamano medio que no requiere infraestructura de servidor.
- Fines educativos: para estudiar el impacto de diferentes niveles de cuantizacion en la calidad de salida, gracias a la amplia variedad de archivos GGUF disponibles.
- Base para fine-tuning o merges posteriores: el modelo original (safetensors) podria utilizarse como punto de partida para nuevas combinaciones con mergekit, aunque no se dispone de acceso directo al modelo base en este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo. Por tanto, no es posible comparar su rendimiento cuantitativo con otros modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el tamano del archivo GGUF, se necesita aproximadamente 1-2 GB adicionales de VRAM para el contexto y las operaciones de inferencia. Por ejemplo, el archivo Q4_K_M de 7,6 GB requiere al menos 9-10 GB de VRAM, mientras que el IQ2_M de 4,5 GB puede funcionar con 6 GB.
- GPU recomendadas: para las cuantizaciones de alta calidad (Q5_K_M, Q6_K), se recomienda una GPU con 12 GB o mas de VRAM, como RTX 3060 12GB, RTX 4070 o superiores. Para cuantizaciones ligeras (IQ2, IQ3), una RTX 3060 8GB o incluso una GTX 1070 8GB podria ser suficiente.
- Compatibilidad con consumer GPU: si, la mayoria de las cuantizaciones caben en GPUs de consumo de 8-12 GB. Las versiones mas pequeñas (IQ1, IQ2) pueden ejecutarse en equipos con 4-6 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga) y cualquier frontend compatible con GGUF. Tambien se puede usar con Python mediante la libreria llama-cpp-python.
- Latencia y throughput: no se dispone de mediciones especificas. En una RTX 3090, un modelo de 12B cuantizado a Q4_K_M suele generar entre 20 y 40 tokens por segundo, pero estos valores son orientativos y dependen de la implementacion y el hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo base es un merge sin documentacion publica, y no se conocen sus componentes ni su rendimiento relativo. Como alternativa generica, se podrian considerar otros modelos de 12B como Mistral-7B (7B, mas pequeño) o Llama-3.1-8B (8B), pero no hay datos para comparar calidad. Se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede estar restringido. Se debe contactar con el autor del modelo base (Sorihon) para aclarar los terminos.
- Idioma limitado al ingles: no es adecuado para aplicaciones multilingues.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generico sin informacion sobre su entrenamiento, es probable que presente sesgos presentes en los datos de entrenamiento y riesgo de generar informacion falsa.
- Falta de documentacion: no hay informacion sobre la arquitectura, el dataset de entrenamiento ni los benchmarks, lo que dificulta evaluar su idoneidad para tareas especificas.
- Calidad de las cuantizaciones extremas: las versiones IQ1_S e IQ1_M (3,1 y 3,3 GB) tienen una calidad muy reducida y solo son recomendables para pruebas de concepto o cuando el hardware es extremadamente limitado.
- Repositorio sin verificacion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Mending-Hearts-12B-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/Sorihon/Mending-Hearts-12B
- Pagina de descarga de mradermacher: https://hf.tst.eu/model#Mending-Hearts-12B-i1-GGUF
- Version con cuantizaciones estaticas: https://huggingface.co/mradermacher/Mending-Hearts-12B-GGUF
