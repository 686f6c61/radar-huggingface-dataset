# adwumatech-ai/nebula-st-twi-en

## Resumen

nebula-st-twi-en es un modelo de traducción de voz (speech translation) que convierte audio en twi (akán) a texto en inglés. Lo desarrolla adwumatech-ai dentro del proyecto nebula-research, y se publica como versión 0.1.0 bajo licencia CC BY 4.0. El modelo resuelve un problema concreto y poco cubierto: no existen sistemas ASR comerciales ni de código abierto que soporten twi, por lo que la vía habitual de transcribir y luego traducir no es viable.

Técnicamente es un modelo híbrido: reutiliza el encoder de openai/whisper-small congelado salvo las 4 capas superiores, y le acopla un decoder transformer pequeño entrenado desde cero (d_model=256, 4 capas, 8 cabezas). El conjunto suma 119.629.655 parámetros y ocupa unos 0,5 GB en el repositorio. No incorpora cabeceras de condicionamiento de idioma (LID, DANN ni embeddings de idioma): es un baseline deliberadamente simple.

Su relevancia ahora es doble. Por un lado, cubre un par de idiomas (twi-inglés) con muy poca representación en la investigación en voz. Por otro, su empaquetado es reproducible: incluye pesos en safetensors sin pickle, un manifest.json con SHA-256 por fichero y el código de inferencia dentro del propio repositorio, de modo que la carga no requiere descargas adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-small (congelado salvo las 4 capas superiores) + decoder transformer propio (d_model=256, 4 capas, 8 cabezas) |
| Parámetros totales | 119.629.655 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo hereda la ventana de entrada de Whisper-small, pero no se documenta en la model card) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | ak (twi), en |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (con config.json, tokenizer/, manifest.json y código de carga en el repo) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder asimétrico. El encoder es el de openai/whisper-small, congelado excepto las 4 capas superiores, que se afinan. El decoder es un transformer pequeño entrenado desde cero con d_model=256, 4 capas y 8 cabezas de atención, que genera texto en inglés a partir de las representaciones del encoder. No hay cabeceras de identificación de idioma, adversariales (DANN) ni embeddings de idioma: el autor lo describe explícitamente como un modelo baseline sin condicionamiento lingüístico.

El entrenamiento usa únicamente los shards aprobados en dataset_registry.yaml del repositorio nebula-research, todos derivados del dataset adwumatech-ai/mghana-st (CC BY 4.0). Se trata de 12 subconjuntos: seis de twi de Akuapim (mghana_st-akuapim-twi-1 a 6) y seis de twi asante (mghana_st-asanti-twi-1 a 6). El número de horas de audio de entrenamiento no está publicado en la model card. No se documenta el uso de RLHF, DPO ni otras fases de alineación. La evaluación prevista usa búsqueda por haces (beam size 4) con BLEU/chrF multi-referencia mediante sacrebleu, aunque los resultados aún no se han publicado.

## Capacidades

- Traducción de voz a texto: recibe audio en twi y genera la traducción directa al inglés, sin pasar por una transcripción intermedia en twi.
- Procesamiento de audio mono/multicanal: la función de inferencia documentada acepta formas [channels, samples] con la frecuencia de muestreo original.
- Tokenización basada en Whisper: el repositorio incluye el tokenizer y el feature extractor de Whisper.
- Inferencia en CPU y GPU: load_exported_model acepta el parámetro device, y el ejemplo oficial usa "cpu".
- Verificación de integridad: manifest.json incluye un SHA-256 por fichero que se comprueba antes de cargar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá del propio pipeline de traducción de voz.
- Cobertura lingüística limitada a twi (ak) e inglés (en); no cubre ga, ewe ni fante, según las limitaciones declaradas por el autor.

## Casos de uso

- Subtitulado de contenido audiovisual en twi: el modelo traduce directamente el audio a subtítulos en inglés, lo que evita la falta de un ASR previo en twi y permite publicar material en inglés a partir de grabaciones originales en akán.
- Atención ciudadana y servicios públicos en Ghana: integrado en un sistema de atención telefónica, puede convertir las llamadas en twi en resúmenes o transcripciones en inglés para operadores que no hablan la lengua.
- Investigación lingüística y documentación: permite generar corpus paralelos twi-inglés a partir de grabaciones de campo, con la ventaja de que el pipeline es de un solo paso y reproducible (versión fijada y hashes verificables).
- Evaluación de tecnologías de voz de bajo recurso: sirve como baseline para comparar futuras aproximaciones (cascada ASR+MT, modelos multilingües, fine-tuning de Whisper) en un par de idiomas sin herramientas comerciales.
- Prototipado en local sin dependencias externas: al incluir el código de carga y no requerir descargas adicionales, se puede desplegar en entornos aislados o con conectividad limitada, por ejemplo en una estación de trabajo con CPU.
- Traducción de entrevistas y material educativo: grabaciones de clase o entrevistas en twi pueden convertirse a inglés para su difusión o revisión por parte de equipos que no dominan el idioma.
- Integración en demos y APIs: el Space nebula-st-demo expone el modelo como servicio, lo que facilita probarlo antes de integrarlo en un producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que aún no hay resultados de evaluación y remite al Space nebula-research-results para las cifras más recientes. La metodología prevista es beam search con beam size 4 sobre el split de test reservado, con BLEU/chrF multi-referencia vía sacrebleu.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 119,6 millones de parámetros en precisión completa (fp32) los pesos ocupan aproximadamente 0,48 GB; en fp16, unos 0,24 GB. A ello hay que sumar las activaciones del encoder de Whisper-small y del decoder, no cuantificadas en la documentación.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería poder alojar el modelo en fp16 o fp32, pero es una estimación, no un dato del autor.
- GPU de consumo: sí, previsiblemente cabe en GTX 1650, RTX 3050, RTX 4060 y superiores; el ejemplo oficial de uso funciona en CPU.
- Opciones de despliegue: no es un modelo estándar de transformers, por lo que no se puede cargar con AutoModel. Se usa el código incluido en el repositorio (inference.py, export_model.py) mediante snapshot_download con la revisión v0.1.0. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI. Existe un Space de demo/API.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| nebula-st-twi-en | Speech translation (encoder Whisper-small + decoder propio) | 119,6 M | ak, en | CC BY 4.0 | Baseline sin condicionamiento de idioma; sin benchmarks publicados |
| openai/whisper-small | ASR multilingüe | 244 M | Multilingüe (sin twi) | MIT (según el modelo original de OpenAI) | No soporta ASR en twi, ga, ewe ni fante, por lo que no sirve como baseline en cascada para este par |
| Cascada ASR + traducción automática | Pipeline de dos etapas | Depende de los componentes | Depende de los componentes | Depende de los componentes | No viable para twi-inglés por la ausencia de ASR en twi, según el propio autor |

No se dispone de otros modelos comparables de traducción de voz twi-inglés en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida a twi (ak) e inglés (en); no cubre ga, ewe ni fante.
- No existe un baseline ASR en cascada para comparar: Whisper no soporta ASR en twi, ga, ewe ni fante, así que no se puede medir la mejora frente a una pipeline transcribir-y-traducir.
- Entrenado con un dataset a escala de investigación; el autor advierte de un rendimiento irregular fuera de la distribución de entrenamiento (ruido de fondo, estilos de habla poco habituales).
- No hay resultados de evaluación publicados, por lo que no se puede verificar la calidad con BLEU/chrF ni compararla con alternativas.
- El número de horas de audio de entrenamiento no está publicado.
- Es un modelo baseline sin cabeceras de identificación de idioma ni condicionamiento lingüístico, lo que puede afectar a la robustez en entradas ambiguas.
- No es un modelo estándar de transformers: requiere el código del repositorio y una revisión fijada (v0.1.0); no hay soporte documentado para runtimes de inferencia habituales.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución tanto al modelo como al dataset mghana-st.
- Riesgo de alucinación y de traducciones inexactas inherente a los modelos generativos de voz; no se documentan sesgos específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adwumatech-ai/nebula-st-twi-en
- Dataset de entrenamiento: https://huggingface.co/datasets/adwumatech-ai/mghana-st
- Repositorio de investigación: https://github.com/adwumatech-ai/nebula-research
- Registro de datasets: https://github.com/adwumatech-ai/nebula-research/blob/main/dataset_registry.yaml
- Space de resultados: https://huggingface.co/spaces/adwumatech-ai/nebula-research-results
- Space de demo/API: https://huggingface.co/spaces/adwumatech-ai/nebula-st-demo
- Modelo base del encoder: https://huggingface.co/openai/whisper-small
