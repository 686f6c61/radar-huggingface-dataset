# mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-i1-GGUF

## Resumen

NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-i1-GGUF es una recuantización en formato GGUF del modelo prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO, publicada por el usuario mradermacher, especializado en la conversión y cuantización de pesos a GGUF con matrices de importancia (imatrix). El modelo de partida es un ajuste fino de tipo "abliterated" y "uncensored", es decir, con las direcciones de rechazo eliminadas del espacio de activaciones, orientado a generación de texto sin filtros de seguridad incorporados y con capacidades declaradas de uso agéntico y tool calling.

El nombre comercial indica 4B parámetros y las etiquetas del repositorio apuntan a la familia Qwen3.5, aunque los metadatos de safetensors publicados en la ficha registran 897.272 parámetros, una cifra que no concuerda con la denominación del modelo y cuya unidad no se especifica en la información disponible. El repositorio aplica licencia Apache 2.0 y declara únicamente inglés como idioma soportado, con salida en formato GGUF para su uso mediante llama.cpp, Ollama o servidores compatibles con llama-cpp.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de la familia NeoHorse en hardware de consumo mediante cuantizaciones IQ de bajo bit (desde IQ1_S hasta Q6_K), algo imposible con los pesos originales en safetensors. Se trata, por tanto, de una ficha de distribución más que de un modelo nuevo: no aporta arquitectura ni entrenamiento propios, sino una cadena de cuantización con imatrix sobre el trabajo de prithivMLmods.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del repositorio mencionan "qwen3.5"; el README no describe la arquitectura) |
| Parametros totales | 897.272 según los metadatos de safetensors citados en la ficha; el nombre del modelo indica 4B. Discrepancia no aclarada en la información disponible |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones dinámicas con imatrix); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO |
| Version de cuantizacion declarada | quantize_version: 2, output_tensor_quantised: 1, convert_type: hf |
| Fichero imatrix incluido | NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO.imatrix.gguf (0,1 GB) |
| Tamano del repositorio | 0,0 GB según la ficha (solo consta enlazado el fichero imatrix; no se puede confirmar qué cuantizaciones están publicadas) |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del modelo base. El README del repositorio de cuantizacion se limita a indicar que se trata de "weighted/imatrix quants" del modelo prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO, sin detallar si el modelo original es un transformer denso, un MoE ni su configuración de capas, atencion o tokenizador. La unica pista arquitectonica es la etiqueta qwen3.5 incluida por el autor de la cuantizacion, que sugiere una base de la familia Qwen, pero no se aporta confirmacion documental.

Respecto al entrenamiento, tampoco se publican datos en la informacion proporcionada: no se indica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Las etiquetas abliterated, uncensored y heretic indican que el modelo base ha pasado por un procedimiento de abliteracion (eliminacion de direcciones de rechazo en las activaciones) para reducir los comportamientos de negativa, pero no se documentan en este repositorio los detalles metodologicos ni los hiperparametros de dicho proceso. La innovacion tecnica de esta publicacion concreta se limita al uso de matrices de importancia (imatrix) para calibrar la cuantizacion, lo que segun el autor mejora la calidad de las cuantizaciones de bajo bit frente a las estaticas.

## Capacidades

- Generacion de texto en ingles: es el unico idioma declarado en los metadatos.
- Uso agéntico y multi-step reasoning: las etiquetas agentic y tool-use indican soporte previsto para flujos con llamadas a herramientas, aunque no se documenta el formato exacto de plantilla ni la sintaxis de tool calling.
- Function calling: declarado a nivel de etiqueta, sin especificacion tecnica en el README.
- Generacion sin filtros de contenido: el ajuste de tipo abliterated/uncensored elimina las negativas por politica de seguridad del modelo base.
- Razonamiento y codigo: no disponible; no se publican evaluaciones ni declaraciones explicitas sobre estas capacidades.
- Vision, audio o multimodalidad: no disponible; no se declara ninguna modalidad adicional ni fichero mmproj (el campo skip_mmproj figura vacio).
- Modo thinking explicito: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos.

## Casos de uso

- Generacion de texto en ingles en local: el modelo puede ejecutarse con llama.cpp u Ollama en un equipo de consumo gracias a las cuantizaciones de bajo bit (desde IQ1_S), lo que permite desplegar generacion de texto sin conexion ni coste por token.
- Escritura creativa y ficcion sin restricciones tematicas: al tratarse de un modelo abliterado, resulta adecuado para narrativa, guiones o dialogos que aborden violencia, contenido adulto o temas que los modelos alineados rechazan por defecto; el desarrollador asume la responsabilidad del filtrado posterior.
- Prototipado de agentes con tool calling: las etiquetas agentic y tool-use permiten integrarlo como motor de decision en un bucle de agente que consulte APIs, aunque la ausencia de documentacion sobre el formato de llamada obliga a verificar empiricamente la plantilla de chat.
- Asistente conversacional multi-turno embebido: al ser un GGUF de pocos gigabytes, puede desplegarse en un portatil o mini-PC como backend de un asistente local, con la advertencia de que no se dispone de datos de contexto maximo en la informacion publicada.
- Experimentacion en investigacion sobre abliteration: sirve como material de comparacion para estudiar como la eliminacion de direcciones de rechazo afecta a la coherencia, la utilidad y la seguridad de un modelo de ~4B frente a su version alineada.
- Generacion de datos sinteticos y aumento de dataset: puede emplearse para producir corpus en ingles de tematica no filtrada, con revision humana posterior para descartar alucinaciones y sesgos.
- Pruebas de cuantizacion e imatrix: el repositorio incluye el fichero imatrix (0,1 GB), lo que permite a otros desarrolladores generar sus propias cuantizaciones personalizadas con el mismo calibrado que uso mradermacher.
- Despliegue en entornos air-gapped: al operar totalmente en local mediante GGUF, encaja en escenarios con requisitos de confidencialidad donde no se permite enviar datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones de perplejidad entre las distintas cuantizaciones ofrecidas. La unica referencia grafica es el enlace externo al grafico comparativo de tipos de cuantizacion de ikawrakow, que no aporta cifras especificas de este modelo.

## Requisitos de hardware

Las cifras siguientes son estimaciones para un modelo denso de la clase 4B en formato GGUF, no datos confirmados por el repositorio. Si el recuento real de parametros fuese el de 897.272 registrado en los metadatos de safetensors, los requisitos serian notablemente inferiores.

- VRAM estimada para inferencia (modelo + cache KV con contexto moderado):
  - IQ2/IQ3: en torno a 1,5-2,5 GB.
  - Q4_K_M: en torno a 3-4 GB.
  - Q5_K_M: en torno a 3,5-4,5 GB.
  - Q6_K: en torno a 4-5 GB.
  - Si se ejecuta el modelo base en precision 16 bits, el requisito sube a aproximadamente 8-9 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y cualquier GPU con 6 GB o mas para las cuantizaciones bajas; A100 o H100 no son necesarias para un modelo de este tamano y solo aportarian velocidad.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o inferior, y tambien en equipos con graficos integrados si se opta por IQ2/IQ3 y se delega parte de las capas a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui y servidores compatibles con llama-cpp (el repositorio incluye la etiqueta endpoints_compatible y text-generation-inference en los tags). No se recomienda vLLM ni TGI clasico con ficheros GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia, y estas dependen del hardware, de la cuantizacion elegida y del tamano de contexto configurado.

## Comparativa con modelos similares

La comparativa siguiente utiliza especificaciones publicas de los desarrolladores de cada modelo alternativo; los datos del modelo de esta ficha figuran como "no disponible" cuando el repositorio no los aporta.

| Modelo | Parametros | Contexto | Licencia | Multilingue | GGUF disponible |
|---|---|---|---|---|---|
| NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO (esta ficha) | 4B nominal / 897.272 segun safetensors | no disponible | Apache 2.0 | Solo ingles | Si (i1, con imatrix) |
| Qwen3-4B | 4B | 32.768 tokens, ampliable a 131.072 con YaRN | Apache 2.0 | Si, mas de 100 idiomas | Si |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Llama 3.2 Community License | Si, 8 idiomas declarados | Si |
| Gemma-3-4B-IT | 4B | 131.072 tokens | Gemma Terms of Use | Si, mas de 140 idiomas | Si |

Frente a estas alternativas, el modelo de esta ficha se diferencia por su caracter abliterado y sin censura, no por capacidades tecnicas superiores. Qwen3-4B, Llama-3.2-3B y Gemma-3-4B ofrecen ventanas de contexto documentadas y cobertura multilingue, mientras que NeoHorse solo declara ingles y no publica su longitud de contexto. No se dispone de datos de benchmarks que permitan comparar la calidad de generacion entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgos ni de toxicidad para este modelo ni para su base.
- Riesgo de alucinacion: no cuantificado. Al tratarse de un modelo de ~4B, la tasa de alucinacion tiende a ser superior a la de modelos mayores, y las cuantizaciones de muy bajo bit (IQ1, IQ2) degradan adicionalmente la fidelidad de la salida.
- Ausencia de filtros de seguridad: el ajuste abliterated elimina las negativas por politica, por lo que el modelo puede generar contenido ofensivo, ilegal o danino. Su uso en produccion exige capas de moderacion externas y supervision humana.
- Limitacion de idioma: solo se declara ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que impide planificar aplicaciones que dependan de conversaciones largas o de documentos extensos.
- Discrepancia en el recuento de parametros: los metadatos indican 897.272 parametros frente a los 4B del nombre, sin aclaracion. Conviene verificar el modelo antes de dimensionar infraestructura.
- Estado de publicacion incierto: el tamano del repositorio figura como 0,0 GB y solo aparece enlazado el fichero imatrix, por lo que no se puede confirmar que todas las cuantizaciones listadas esten efectivamente subidas. Existe un repositorio hermano con cuantizaciones estaticas.
- Uso comercial: la licencia Apache 2.0 del repositorio de cuantizacion permite uso comercial, pero conviene revisar la licencia del modelo base y la de los datos de entrenamiento originales, no documentadas en esta ficha.
- Sin garantias: el autor declara que el trabajo se realiza en su tiempo libre con infraestructura de su empleador; no hay soporte ni mantenimiento comprometido.
- Reproducibilidad: no se publica la receta de cuantizacion mas alla de los metadatos de version ni los parametros de calibracion de la imatrix.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-i1-GGUF
- Repositorio de cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO
- Fichero imatrix: https://huggingface.co/mradermacher/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-i1-GGUF/resolve/main/NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO.imatrix.gguf
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#NeoHorse-1-4B-Max-Heretic-Uncensored-TURBO-i1-GGUF
- Guia de uso de ficheros GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Perfil de nicoboss, proveedor de computo: https://huggingface.co/nicoboss
- nethype GmbH: https://www.nethype.de/
