# mradermacher/Eternal.Bondange-3.2-1B-i1-GGUF

## Resumen

Eternal.Bondange-3.2-1B-i1-GGUF es una colección de cuantizaciones GGUF con matriz de importancia (imatrix) del modelo NovaCorp/Eternal.Bondange-3.2-1B, publicada por el cuantizador mradermacher, un creador muy prolífico en Hugging Face conocido por generar versiones cuantizadas de miles de modelos. El modelo base es un merge (fusión de modelos mediante mergekit) de aproximadamente 1.500 millones de parámetros, etiquetado como prototipo y orientado a roleplay, juegos de rol (RPG) y contenido sin censura, con un número bajo de negativas (low refusals) y un proceso de abliteration (eliminación de los mecanismos de rechazo del modelo).

La relevancia de esta ficha no está tanto en el modelo base, del que no se ha publicado documentación técnica detallada, sino en la disponibilidad de cuantizaciones que permiten ejecutarlo en hardware muy modesto: los archivos van desde 0,6 GB (IQ1_S) hasta 1,3 GB (Q6_K). Esto lo hace apto para ordenadores sin GPU dedicada, móviles o Raspberry Pi, dentro de la categoría "low-specs" que el propio autor utiliza como etiqueta. El repositorio acumula más de 2.400 descargas.

Debe subrayarse que el modelo está etiquetado explícitamente como "not-for-all-audiences" (no apto para todos los públicos) y "nsfw", por lo que su uso requiere responsabilidad por parte del usuario final. La licencia heredada es Llama 3, lo que implica acogerse a la licencia comunitaria de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura exacta no disponible; base derivada de la familia Llama) |
| Parametros totales | 1.498.482.720 (~1,5 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas imatrix) |
| Idiomas soportados | Ingles, espanol |
| Licencia | Llama 3 (Community License) |
| Formato de pesos | GGUF (cuantizaciones imatrix); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base, NovaCorp/Eternal.Bondange-3.2-1B, es un merge creado con mergekit, una herramienta que combina los pesos de varios modelos existentes para obtener un modelo resultante sin necesidad de entrenamiento desde cero. El nombre y las etiquetas sugieren que parte de una base derivada de la familia Llama 3.2 (probablemente Llama 3.2 1B, dado el tamano de ~1,5 B de parametros y la licencia Llama 3). El sufijo "abliterated" en las etiquetas indica que se ha aplicado un proceso que neutraliza las direcciones de activacion responsables de las negativas del modelo, eliminando de facto sus salvaguardas de seguridad.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO), dado que el modelo base no publica una model card tecnica. Por su parte, la version de mradermacher no es un reentrenamiento: se trata de cuantizaciones GGUF con matriz de importancia (imatrix), una tecnica de Ikawrakow que calcula la importancia de cada peso sobre un corpus de calibracion para reducir la perdida de calidad en cuantizaciones agresivas (especialmente en los rangos IQ1-IQ3). La cuantizacion se realizo desde los pesos safetensors en formato HF.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y juego de rol (etiquetas rp, rpg, roleplay).
- Contenido sin censura: el modelo abliterated produce muy pocas negativas (low-refusals), incluyendo contenido para adultos (nsfw).
- Soporte de ingles y espanol segun las etiquetas de idioma del modelo base.
- Formato conversacional (etiqueta "conversational" en el repositorio).
- Ejecucion en hardware de gama muy baja gracias a las cuantizaciones IQ1/IQ2 (menos de 1 GB de archivo).
- No hay indicios de capacidades de vision, audio, tool calling ni modo de razonamiento (thinking mode).

## Casos de uso

- Roleplay interactivo en dispositivos de gama baja: los cuantos IQ2/IQ3 (0,6-0,9 GB) permiten mantener conversaciones de rol en portatiles antiguos o mini-PC sin GPU, con SillyTavern o koboldcpp.
- Prototipado rapido de personajes para juegos: un desarrollador de videojuegos puede integrar el modelo en un motor (por ejemplo, mediante llama.cpp) para dotar de dialogo a NPCs sin depender de APIs externas.
- Pruebas de abliteration y alineacion: investigadores pueden usar el modelo como caso de estudio para analizar como la eliminacion de negativas afecta a la coherencia y a la seguridad de un modelo pequeno.
- Escritura creativa de ficcion adulta: generacion de narrativa sin las restricciones habituales de los modelos comerciales, bajo responsabilidad del usuario.
- Benchmarking de cuantizaciones: la amplia gama de cuantos (24 variantes) sirve para comparar la degradacion de calidad entre IQ1_S y Q6_K en un mismo modelo de 1,5 B.
- Asistentes conversacionales personales offline: despliegue local con Ollama o LM Studio en equipos sin conexion a internet, aprovechando el tamano reducido de los archivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un grafico comparativo de perplejidad para tipos de cuantizacion de baja calidad elaborado por ikawrakow (enlace en la seccion de enlaces), pero no contiene metricas del modelo base (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM / memoria estimada para inferencia: desde ~0,7 GB de RAM/VRAM para IQ1_S (0,6 GB de archivo) hasta ~1,5 GB para Q6_K (1,3 GB de archivo), mas overhead del runtime (~0,3-0,5 GB). Ejecutable integramente en CPU.
- GPU recomendadas: no son necesarias; cualquier GPU con 2 GB de VRAM (o incluso integrada) es mas que suficiente. En CPU, cualquier procesador moderno de los ultimos anos funciona sin problema.
- Consumer GPUs: cabe con holgura en cualquier GPU domestica (GTX 1050, RTX 3060, RTX 4090, etc.); el modelo esta pensado precisamente para equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp, koboldcpp, Ollama, LM Studio, GPT4All y cualquier runtime compatible con GGUF. No es un modelo adecuado para vLLM o TGI, que no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible; dada la talla de 1,5 B y las cuantizaciones agresivas, es de esperar velocidades superiores a 20-30 tokens/s incluso en CPU de gama media, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Orientacion | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Eternal.Bondange-3.2-1B (i1-GGUF) | ~1,5 B | no disponible | Llama 3 | Roleplay, sin censura, abliterated | 24 cuantos imatrix |
| Llama 3.2 1B Instruct (base probable) | 1,24 B | 128K | Llama 3 | Uso general, con salvaguardas | GGUF oficial de Meta |
| Dolphin 3.0 Llama 3.2 1B (Cognitive Computations) | ~1,5 B | 128K | Llama 3 | Sin censura, uso general | GGUF comunitarios |
| Llama 3.2 1B (mradermacher i1-GGUF) | 1,24 B | 128K | Llama 3 | Base general | Cuantos imatrix equivalentes |

Nota: el contexto de 128K de las alternativas procede de la familia Llama 3.2; para el modelo de esta ficha no esta confirmado. Frente a la base Llama 3.2 1B original, Eternal.Bondange ofrece un comportamiento sin negativas orientado a roleplay, a costa de un perfil de seguridad eliminado y una documentacion tecnica practicamente inexistente.

## Limitaciones y advertencias

- Contenido para adultos y sin censura: el modelo esta etiquetado como nsfw y not-for-all-audiences; no debe exponerse a usuarios menores de edad ni desplegarse en entornos sin control de acceso.
- Riesgo de alucinacion elevado: al ser un merge de 1,5 B sin documentacion de entrenamiento ni benchmarks publicados, la fiabilidad factual es baja; no es apto para tareas que exijan precision.
- Etiquetado como "prototype": el propio autor lo considera un prototipo, por lo que su comportamiento puede ser inestable o cambiante entre versiones.
- Limitacion de idioma: solo declara ingles y espanol; el rendimiento en espanol no esta verificado con benchmarks.
- Licencia Llama 3: hereda la Llama 3 Community License de Meta, con sus restricciones (limites de usuarios mensuales para uso comercial comercializable, politica de uso aceptable de Meta que prohíbe ciertos contenidos).
- La abliteration elimina las salvaguardas de seguridad: el usuario asume toda la responsabilidad legal y etica del contenido generado; no se recomienda para produccion en productos orientados al publico general.
- Los cuantos IQ1_S/IQ1_M e IQ2 degradan notablemente la calidad (el propio autor los describe como "for the desperate"); se recomienda Q4_K_S o superior.
- Longitud de contexto, plantilla de chat y hiperparametros recomendados: no disponible; habra que inferirlos del modelo base o probar empiricamente.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/mradermacher/Eternal.Bondange-3.2-1B-i1-GGUF
- Modelo base: https://huggingface.co/NovaCorp/Eternal.Bondange-3.2-1B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Eternal.Bondange-3.2-1B-GGUF
- Pagina de descargas resumida de mradermacher: https://hf.tst.eu/model#Eternal.Bondange-3.2-1B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas de Artefact2 sobre cuantos: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad de cuantos (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
