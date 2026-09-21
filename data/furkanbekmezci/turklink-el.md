# furkanbekmezci/turklink-el

## Resumen

TurkLink EL es un sistema completo de enlazado de entidades (entity linking) para turco, orientado a resolver menciones de texto a identificadores Q-ID de Wikidata. Lo publica el usuario furkanbekmezci (la model card referencia internamente el repositorio frcturus/turklink-el) y se distribuye como un paquete reproducible que combina varios componentes: un detector de menciones aprendido, un bi-encoder MiniLM, un catalogo FAISS HNSW y un cross-encoder BERTurk, con una capa final de confianza ajustada sobre validacion. No es un modelo generativo unico, sino un pipeline de recuperacion y reranking de entidades.

El sistema se entrena principalmente sobre el corpus TurkLink (Akdas y Tantug, 2026) y cubre un catalogo de 3.958.456 Q-ID. Su relevancia actual esta en que ofrece un piloto autocontenido, con codigo fuente incluido y artefactos de evaluacion, para una tarea, el entity linking en turco, con menos recursos abiertos que el ingles. El repositorio ocupa 8,9 GB, mayoritariamente por el indice vectorial, y la model card advierte de que se trata de un piloto con supervision de menciones debil y no exhaustiva.

El bundle completo requiere en torno a 10 GB de disco y al menos 12 GB de RAM, funciona en Linux con CPU o CUDA y en macOS con CPU. La licencia de los checkpoints y artefactos derivados del corpus es CC BY-SA 4.0, mientras que el codigo fuente es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de entity linking: detector de menciones + bi-encoder MiniLM + indice FAISS HNSW + cross-encoder BERTurk + calibracion de confianza |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | CC BY-SA 4.0 para checkpoints y artefactos derivados del corpus; Apache-2.0 para el codigo fuente; MiniLM Apache-2.0 y BERTurk MIT como modelos preentrenados base |
| Formato de pesos | safetensors, mas indice FAISS y ficheros JSONL para el catalogo |
| Tamano del repositorio | 8,9 GB |
| Catalogo de entidades | 3.958.456 Q-ID de Wikidata |
| Dataset de entrenamiento | yakdas/turklink-corpus (revision c8d7fe7bdd0ae934268d30ef64f6444940bdf6dc) |
| Documentos de entrenamiento / validacion / test | 28.310 / 2.350 / 2.353 |
| Semilla | 42 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El sistema no es un transformer unico, sino una cadena de componentes especializados. La primera etapa es un detector de menciones aprendido que localiza los fragmentos de texto candidatos. La segunda es un bi-encoder MiniLM que genera embeddings de mencion y de entidad para recuperar candidatos mediante un indice FAISS HNSW construido sobre el catalogo completo de 3.958.456 Q-ID. La tercera etapa es un cross-encoder basado en BERTurk que rerankea los candidatos recuperados, y por ultimo una capa de confianza ajustada sobre el conjunto de validacion. Los artefactos de cada etapa se pueden descargar por separado (retriever, reranker y mention detector).

El entrenamiento se realiza principalmente sobre el corpus TurkLink, con muestreo por documento y preservando la pertenencia oficial a los splits. El catalogo incorpora ademas 449 entidades de entrenamiento que faltaban, recuperadas mediante fallback de etiquetas de Wikidata en turco, multilingue e ingles, con una instantanea congelada en `wikidata-supplement.jsonl`; segun el autor, no se usaron etiquetas de test para esta reparacion. La model card indica que la supervision de menciones es debil y no exhaustiva, y que las anotaciones automaticas, las descripciones traducidas y el catalogo historico pueden contener errores. La receta completa sobre el corpus no se ejecuto para este piloto; los ajustes de entrenamiento, los conteos efectivos y los historiales de validacion estan en `training.json` de cada componente.

## Capacidades

- Enlazado de menciones de texto en turco a entidades de Wikidata, devolviendo el Q-ID, la confianza y el span de la mencion (por ejemplo, `Apple` a Q312 con confianza 0.577 y span [0, 5)).
- Deteccion de menciones en texto plano como etapa integrada del pipeline.
- Recuperacion de candidatos a gran escala sobre un catalogo de 3.958.456 Q-ID mediante busqueda vectorial FAISS HNSW.
- Reranking de candidatos con un cross-encoder BERTurk para mejorar la precision en la primera posicion.
- Estimacion de confianza calibrada para un Q-ID dada una mencion con span ya proporcionado.
- Abtencion basada en umbral, aunque no es un detector de NIL entrenado.
- Despliegue modular: es posible usar solo el retriever (embeddings), solo el reranker o solo el detector de menciones de forma independiente.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente.

## Casos de uso

- Enlazado de entidades en articulos de prensa turca: el pipeline procesa texto plano, detecta menciones de personas, organizaciones y lugares, y las resuelve a Q-ID de Wikidata, lo que facilita la indexacion y el analisis posterior de noticias.
- Construccion de grafos de conocimiento: los Q-ID generados permiten crear aristas normalizadas entre documentos y entidades, reutilizables en bases de datos de grafos y en sistemas de recomendacion basados en entidades.
- Enriquecimiento de pipelines ETL: integrable como paso de normalizacion en flujos de datos donde las menciones de texto turco deben mapearse a identificadores externos estables.
- Busqueda semantica y recuperacion documental: los embeddings del retriever y el catalogo FAISS permiten ampliar consultas con entidades enlazadas y mejorar el recall en buscadores sobre corpus turcos.
- Anotacion de corpus para NLP en turco: el detector de menciones y el enlazador sirven como preanotadores automaticos que reducen el trabajo manual antes de una revision humana.
- Normalizacion de menciones en redes sociales o dominios ruidosos: el sistema comparte rasgos de caso y apostrofo entre entrenamiento e inferencia, lo que ayuda con las convenciones ortograficas del turco, aunque el autor advierte de degradacion en dominios nuevos.
- Analisis de series historicas o periodisticas: al resolver menciones a Q-ID se pueden agregar estadisticas de cobertura por entidad a lo largo del tiempo, teniendo en cuenta las limitaciones de un catalogo historico.

## Benchmarks y rendimiento

Resultados medidos del piloto (el autor aclara que son resultados de este piloto muestreado, no los del articulo TurkLink; la exactitud equivale al micro-F1 porque cada mencion tiene un unico Q-ID de referencia):

| Dataset | Menciones | Accuracy / micro-F1 | R@1 | R@5 | R@10 | R@32 | Cobertura del catalogo |
|---|---:|---:|---:|---:|---:|---:|---:|
| mewsli-9-tr | 5811 | 0.8226 | 0.7567 | 0.8845 | 0.9029 | 0.9248 | 0.9955 |
| mewsli-x-tr-dev | 262 | 0.9008 | 0.7863 | 0.9389 | 0.9542 | 0.9656 | 0.9962 |
| mewsli-x-tr-test | 1215 | 0.8593 | 0.7778 | 0.8963 | 0.9185 | 0.9342 | 0.9951 |
| test | 2000 | 0.8020 | 0.7500 | 0.8695 | 0.8900 | 0.9050 | 0.9985 |
| validation | 2000 | 0.8335 | 0.7725 | 0.8900 | 0.9105 | 0.9335 | 0.9980 |

Proxy de extremo a extremo sobre texto bruto (incluye la deteccion de menciones; las menciones correctas no anotadas se cuentan como falsos positivos segun la referencia de hipervinculos dispersa):

| Dataset | Ventanas | Precision EL | Recall EL | micro-F1 EL | micro-F1 de menciones |
|---|---:|---:|---:|---:|---:|
| test | 300 | 0.2286 | 0.6429 | 0.3372 | 0.4052 |
| validation | 300 | 0.2073 | 0.6559 | 0.3150 | 0.3669 |

Los resultados de Mewsli, cuando aparecen, corresponden a transferencia de dominio supervisada en turco contra este catalogo, no al protocolo zero-shot original de XTREME-R ni a sus descripciones de candidatos. Las metricas de extremo a extremo de TurkLink son proxies de hipervinculos dispersos y no deben presentarse como exactitud exhaustiva de NER.

## Requisitos de hardware

- Disco: aproximadamente 10 GB para el bundle completo (el repositorio en HuggingFace ocupa 8,9 GB, en su mayoria por el indice).
- Memoria: al menos 12 GB de RAM para ejecutar el bundle completo.
- GPU: no se especifica VRAM minima en la informacion disponible; el sistema funciona en CPU.
- Sistemas soportados: Linux con CPU o CUDA y macOS con CPU (la model card menciona un ajuste para OpenMP en macOS si los wheels entran en conflicto).
- Modelos de GPU concretos recomendados: no disponible.
- Encaje en GPU de consumo: no disponible; al ejecutarse en CPU, no se documenta un requisito de VRAM.
- Opciones de despliegue: biblioteca Python instalable mediante wheel (`pip install https://huggingface.co/frcturus/turklink-el/resolve/main/turklink_el-0.1.0-py3-none-any.whl`) o instalacion desde el codigo fuente incluido en `source/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos de entity linking en turco en la informacion disponible, por lo que no es posible establecer una comparativa cuantitativa con alternativas de la misma categoria.

A modo de contexto, los componentes reutilizables que acompanan al bundle son los siguientes:

| Componente | Funcion | Licencia |
|---|---|---|
| turklink-retriever | Embeddings y recuperacion de candidatos | CC BY-SA 4.0 (MiniLM base Apache-2.0) |
| turklink-reranker | Reranking de candidatos | CC BY-SA 4.0 (BERTurk base MIT) |
| turklink-mention-detector | Deteccion de menciones | CC BY-SA 4.0 |

## Limitaciones y advertencias

- No es un desambiguador morfologico completo: los rasgos de caso y apostrofo del turco se comparten entre entrenamiento e inferencia, lo que limita el tratamiento de formas complejas.
- La supervision de menciones es debil y no exhaustiva, por lo que el detector puede omitir menciones validas.
- El corpus, las anotaciones automaticas, las descripciones traducidas y el catalogo historico pueden contener errores que se propagan a las predicciones.
- El rendimiento puede degradarse en dominios nuevos, entidades nuevas o poco frecuentes, nombres comunes y menciones ambiguas.
- La confianza esta calibrada para un Q-ID dada una mencion con span proporcionado, no para la correccion de la mencion, y puede variar segun el dominio.
- La abtencion es por umbral y no constituye un detector de NIL entrenado, por lo que los casos sin entidad en el catalogo pueden resolverse de forma incorrecta.
- El catalogo cubre 3.958.456 Q-ID; las entidades ausentes cuentan como fallos.
- Las metricas de extremo a extremo sobre texto bruto son proxies de hipervinculos dispersos y no equivalen a una evaluacion exhaustiva de NER.
- Licencia: los checkpoints y los artefactos derivados del corpus estan bajo CC BY-SA 4.0 con atribucion a TurkLink, lo que impone condiciones de compartir igual para usos derivados; el codigo es Apache-2.0 y los modelos base mantienen sus licencias (MiniLM Apache-2.0, BERTurk MIT).
- El autor indica que la receta completa sobre el corpus no se ejecuto para este piloto y que las mediciones son de un muestreo.

## Enlaces

- HuggingFace: https://huggingface.co/furkanbekmezci/turklink-el
- Dataset TurkLink: https://huggingface.co/datasets/yakdas/turklink-corpus
- Articulo de referencia: Akdas y Tantug (2026), DOI https://doi.org/10.1016/j.procs.2026.01.041
- Retriever: https://huggingface.co/frcturus/turklink-retriever
- Reranker: https://huggingface.co/frcturus/turklink-reranker
- Detector de menciones: https://huggingface.co/frcturus/turklink-mention-detector
- Wheel de la biblioteca: https://huggingface.co/frcturus/turklink-el/resolve/main/turklink_el-0.1.0-py3-none-any.whl
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las entradas devueltas (YouTube, Instagram, Shazam) no guardan relacion con el modelo.
