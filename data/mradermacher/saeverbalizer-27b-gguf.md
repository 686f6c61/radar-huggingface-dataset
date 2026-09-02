# mradermacher/SAEVerbalizer-27B-GGUF

## Resumen

SAEVerbalizer-27B es un modelo de lenguaje desarrollado por el grupo THU-KEG de la Universidad Tsinghua, diseñado específicamente para la interpretabilidad mecanicista de modelos neuronales. Su función principal es generar explicaciones en lenguaje natural para los "features" aprendidos por sparse autoencoders (SAE), una técnica que permite descomponer las representaciones internas de un modelo en componentes interpretables. El modelo se basa en un backbone Gemma de 27B parámetros y ha sido entrenado con 48.000 pares feature-explicación, según el paper oficial.

Esta ficha se centra en la versión cuantizada a formato GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp, Ollama u otros motores compatibles. La cuantización reduce el tamaño del modelo de los 54 GB originales (en fp16) a entre 10,6 y 28,8 GB según el nivel de precisión elegido, facilitando su uso en entornos con VRAM limitada. El modelo está pensado para investigación en interpretabilidad, no como chatbot de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Gemma 27B, configuracion 27B-L16 segun paper) |
| Parametros totales | 27.009.346.304 (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Gemma (licencia del modelo base) |
| Formato de pesos | GGUF (safetensors disponible en el repo base) |

## Arquitectura y entrenamiento

El modelo base SAEVerbalizer-27B emplea una arquitectura transformer basada en Gemma de 27B parámetros, adaptada para la tarea de "verbalizacion de representaciones". Segun el paper, se utiliza la configuracion 27B-L16, que probablemente indica 16 capas del backbone (aunque no se especifica en la informacion disponible). El entrenamiento se realizo con 48.000 pares feature-explicacion, donde cada par asocia un feature de un SAE con una explicacion textual generada por humanos o por modelos auxiliares. El objetivo es que el modelo aprenda a mapear la activacion de un feature concreto a una descripcion linguistica clara y fiel.

No se dispone de detalles sobre el dataset completo, el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO. La implementacion oficial se publica bajo licencia MIT para el codigo, mientras que los pesos del modelo siguen la licencia Gemma.

## Capacidades

- Generacion de explicaciones en lenguaje natural para features de sparse autoencoders (SAE), permitiendo interpretar que representa cada dimension interna de un modelo.
- Soporte para analisis de interpretabilidad mecanicista: dado un feature (tipicamente un vector de activacion), el modelo produce una frase que describe su funcion.
- Capacidad multilingue limitada: el modelo esta entrenado principalmente en ingles, aunque podria generalizar parcialmente a otros idiomas.
- No es un modelo conversacional ni de proposito general: su salida esta restringida al dominio de explicaciones de features.
- Compatible con herramientas de cuantizacion GGUF, lo que permite su ejecucion en CPU y GPU de consumo mediante llama.cpp, Ollama, LM Studio, etc.

## Casos de uso

- Investigacion en interpretabilidad de modelos: los equipos de IA pueden usar SAEVerbalizer para analizar los features internos de modelos como Gemma o Llama, obteniendo descripciones textuales que facilitan la comprension de los mecanismos internos.
- Auditoria de sesgos y seguridad: al verbalizar features, es posible identificar representaciones problematicas (por ejemplo, asociadas a genero, raza o contenido toxico) y corregirlas antes del despliegue.
- Desarrollo de tecnicas de edicion de modelos: las explicaciones generadas pueden guiar la intervencion sobre features especificos, por ejemplo, para eliminar un sesgo concreto sin retrain completo.
- Documentacion automatica de arquitecturas: los investigadores pueden generar catalogos de features interpretables para modelos propios, acelerando la redaccion de papers y reportes tecnicos.
- Educacion en IA: el modelo sirve como herramienta didactica para explicar conceptos de interpretabilidad mecanicista en cursos avanzados de machine learning.
- Comparacion de SAEs: al verbalizar features de distintos sparse autoencoders, se pueden comparar cualitativamente las representaciones aprendidas por diferentes configuraciones o semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de arXiv (2608.13538v1) describe experimentos de analisis, pero no se incluyen metricas estandar como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para tareas genericas de lenguaje. La evaluacion se centra en la calidad de las explicaciones generadas, medida mediante metricas de similitud semantica o evaluacion humana, cuyos datos no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el quant elegido, se necesita entre 11 GB (Q2_K) y 29 GB (Q8_0) para cargar los pesos en memoria. Con contexto adicional, se recomienda sumar 2-4 GB.
- GPU recomendadas: para quants bajos (Q2_K-Q4_K_M) es suficiente una RTX 3060 12GB o RTX 4060 Ti 16GB. Para Q5_K_M o superiores, se recomienda RTX 4090 24GB o A100 40GB.
- En CPU: los quants Q2_K y Q3_K pueden ejecutarse en sistemas con 16-32 GB de RAM usando llama.cpp, aunque con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- Latencia y throughput: no se dispone de mediciones oficiales. Como referencia, un modelo de 27B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero esto depende del motor y la configuracion.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos que realicen exactamente la misma tarea de verbalizacion de features de SAE. El modelo base THU-KEG/SAEVerbalizer-27B es el unico referente conocido, y esta version GGUF es una cuantizacion del mismo. No se pueden comparar parametros, contexto o rendimiento con alternativas porque no existen datos publicos de modelos comparables en la misma categoria.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para explicar features de SAE; su uso fuera de este dominio produce resultados sin sentido o alucinaciones.
- La licencia Gemma restringe el uso comercial y puede imponer obligaciones de atribucion o distribucion. Revisar los terminos completos antes de usar en produccion.
- Los quants de baja precision (Q2_K, Q3_K) pueden degradar significativamente la calidad de las explicaciones, especialmente en conceptos abstractos o tecnicos.
- El modelo solo soporta ingles de forma fiable; las explicaciones en otros idiomas pueden ser incorrectas o incoherentes.
- No se han publicado evaluaciones de sesgo o robustez; como modelo entrenado sobre datos de internet, puede reflejar sesgos presentes en el corpus.
- La cuantizacion GGUF no incluye el archivo de tokenizador original; es necesario descargar el modelo base desde THU-KEG para obtener los archivos auxiliares si se requiere compatibilidad total.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/SAEVerbalizer-27B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/THU-KEG/SAEVerbalizer-27B
- Codigo oficial (GitHub): https://github.com/THU-KEG/SAEVerbalizer
- Paper en arXiv: https://arxiv.org/html/2608.13538v1
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
