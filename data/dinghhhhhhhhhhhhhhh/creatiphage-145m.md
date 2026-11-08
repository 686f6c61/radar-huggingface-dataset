# dinghhhhhhhhhhhhhhh/CreatiPhage-145M

## Resumen

CreatiPhage-145M es un modelo de lenguaje de ADN autorregresivo desarrollado por CreatiPhage Biotechnology Co., Ltd. (publicado en Hugging Face bajo el usuario `dinghhhhhhhhhhhhhhh`). Su propósito es la generación de secuencias de ADN de bacteriófagos (fagos) y sirve como backbone preentrenado del sistema CPDD (CreatiPhage Diffusion DNA Language Model), un proyecto que combina generación autorregresiva y difusión para el diseño de fagos terapéuticos.

El modelo cuenta con 144,5 millones de parámetros y una ventana de contexto de 98.304 tokens, lo que en el dominio genómico equivale a secuencias de ADN muy largas (cada token representa presumiblemente una base nucleotídica). Se distribuye en formato safetensors FP32 con pesos bajo licencia CC BY 4.0 y código asociado bajo Apache-2.0. Está etiquetado con los tags `genomics`, `dna` y `phage`, lo que lo sitúa en la categoría de modelos fundacionales especializados en biología computacional y, más concretamente, en el diseño generativo de bacteriófagos.

Es relevante ahora porque aborda un problema sanitario acuciante: la resistencia a antibióticos y la necesidad de herramientas computacionales para diseñar fagos terapéuticos de forma dirigida. Al ser un checkpoint general de seis épocas (no un fine-tune específico de especie), funciona como base sobre la que construir adaptaciones posteriores. El repositorio tiene un tamaño de 0,6 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que se trata de un lanzamiento muy reciente y aún sin validación comunitaria amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (modelo de lenguaje de ADN); detalles internos (capas, dimensiones, atención) no disponibles |
| Parametros totales | 144.498.102 (144,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 98.304 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en FP32 safetensors |
| Idiomas soportados | no disponible (dominio genómico: secuencias de ADN, no lenguaje natural) |
| Licencia | CC BY 4.0 (pesos), con atribución a CreatiPhage Biotechnology Co., Ltd.; código Apache-2.0 |
| Formato de pesos | safetensors (FP32) |
| Libreria | PyTorch |
| Tamano del repo | 0,6 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La model card describe CreatiPhage-145M como un modelo de lenguaje de ADN autorregresivo ("autoregressive DNA language model") orientado a la generación de secuencias de fagos. La información disponible no detalla el número de capas, la dimensión oculta, el esquema de tokenización (por ejemplo, tokenización por base o por k-meros) ni el mecanismo de atención concreto. Lo que sí se especifica es una ventana de contexto de 98.304 tokens, un valor notablemente largo para un modelo de 145 M de parámetros, coherente con la necesidad de modelar genomas de fagos completos o fragmentos extensos en una sola pasada.

El checkpoint publicado es un modelo general entrenado durante seis épocas, explícitamente descrito como "not a species-specific fine-tune". No se han publicado en la información disponible el volumen de tokens de entrenamiento, la composición del corpus (por ejemplo, proporción de genomas de fagos frente a otros genomas bacterianos), ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. El modelo forma parte del proyecto CPDD (CreatiPhage Diffusion DNA Language Model), en el que este backbone autorregresivo se combina con un componente de difusión; el modelo hermano CPDD-147M se publica por separado. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación autorregresiva de secuencias de ADN, con arranque desde un primer (primer) dado; el ejemplo de la model card genera 16 nucleótidos a partir de `ATGCGT`.
- Modelado de contexto genómico largo: ventana de 98.304 tokens, adecuada para secuencias de ADN de gran longitud.
- Generación condicionada por prefijo (prompting de ADN), útil para completar o extender fragmentos de genoma.
- Base preentrenada para fine-tuning específico de especie o de función (por ejemplo, fagos líticos frente a lisogénicos).
- Componente backbone del sistema CPDD, que añade generación por difusión sobre este modelo autorregresivo.
- Inferencia en CPU según el quickstart oficial (`--device cpu`), además de GPU.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni procesamiento de lenguaje natural multilingüe.

## Casos de uso

- Diseño generativo de candidatos a fagos terapéuticos: el modelo permite generar secuencias de ADN de fagos que después se evalúan experimentalmente, como paso inicial de un pipeline de descubrimiento contra bacterias resistentes a antibióticos. Es adecuado por su especialización en el dominio y su contexto largo, que permite trabajar con genomas completos.
- Exploración de diversidad de secuencias: partiendo de primers conocidos, se pueden muestrear variantes de genomas de fagos para estudiar el espacio de secuencias plausibles antes de la síntesis y validación in vitro.
- Preentrenamiento base para fine-tuning específico de especie: al ser un checkpoint general de seis épocas, sirve como punto de partida para adaptar el modelo a familias concretas de fagos mediante entrenamiento adicional con datos propios.
- Investigación en modelos de lenguaje genómicos: útil como referencia de 145 M parámetros con contexto de 98 K tokens para estudiar escalado, tokenización y modelado autorregresivo en ADN.
- Componente de sistemas híbridos autorregresivo-difusión: al ser el backbone de CPDD, se integra en pipelines que combinan generación secuencial y difusión para producir secuencias de ADN, por ejemplo en el diseño de bibliotecas de fagos.
- Análisis y completado de regiones genómicas: dado un fragmento de ADN, el modelo puede proponer continuaciones plausibles que ayuden a anotar o reconstruir regiones de interés en genomas de fagos.
- Docencia y prototipado en bioinformática: con 0,6 GB de pesos y ejecución posible en CPU, permite montar demostraciones de generación de ADN en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos en FP32 de 144,5 M parámetros: el repositorio ocupa 0,6 GB, por lo que la inferencia básica requiere aproximadamente 0,6 GB de memoria para los pesos, más el overhead del runtime de PyTorch y del contexto (98.304 tokens de contexto pueden incrementar de forma significativa el consumo de memoria de activaciones y caché KV según la implementación).
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) puede alojar los pesos; el cuello de botella real será la memoria de activaciones con contextos muy largos.
- Ejecución en CPU documentada oficialmente en el quickstart (`--device cpu`), adecuada para pruebas y generación de secuencias cortas.
- GPUs de centro de datos (A100, H100) no son necesarias para este tamaño de modelo salvo que se requiera throughput elevado o contextos máximos en lote.
- Opciones de despliegue: el modelo requiere el código PyTorch del repositorio `CreatiPhage-Diffusion-DNA-Lm` (script `examples/generate_ar.py`); no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CreatiPhage-145M | 144,5 M | 98.304 tokens | ADN de fagos (generación autorregresiva) | CC BY 4.0 (pesos), Apache-2.0 (código) | Hugging Face, requiere código propio |
| CPDD-147M (mismo proyecto) | 147 M (según nombre) | no disponible | ADN de fagos (difusión) | no disponible en la información | Hugging Face (`dinghhhhhhhhhhhhhhh/CPDD-147M`) |
| Otros modelos de lenguaje genómico (por ejemplo, modelos de ADN fundacionales de tamaño comparable) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de resultados de benchmarks ni de especificaciones detalladas de alternativas comparables, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El propio autor advierte que es un checkpoint general de seis épocas y no un fine-tune específico de especie; las secuencias generadas requieren evaluación independiente.
- Riesgo de generar secuencias de ADN no viables o no funcionales biológicamente; la plausibilidad del modelo no equivale a validez experimental.
- No se documentan datos sobre sesgos del corpus de entrenamiento, composición del dataset ni posibles sesgos hacia determinadas familias de fagos o genomas bacterianos.
- Contexto de 98.304 tokens: aunque amplio, secuencias que lo excedan quedarán truncadas o requerirán estrategias de ventana deslizante no documentadas.
- El modelo está especializado en ADN y no soporta lenguaje natural, tool calling, agentes ni multimodalidad; no debe emplearse fuera de su dominio.
- Licencia CC BY 4.0 para los pesos: permite uso comercial con atribución a CreatiPhage Biotechnology Co., Ltd.; el código asociado es Apache-2.0. Es necesario verificar el cumplimiento de la atribución en productos derivados.
- El modelo exige el código PyTorch del repositorio para su uso; no hay integración documentada con runtimes estándar de inferencia (vLLM, llama.cpp, Ollama, TGI), lo que complica el despliegue en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ausencia de validación comunitaria y de informes de terceros sobre calidad o robustez.
- Uso en bioseguridad: la generación de secuencias de fagos con posible aplicación terapéutica debe someterse a evaluación de bioseguridad y a la normativa aplicable antes de cualquier síntesis o uso experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dinghhhhhhhhhhhhhhh/CreatiPhage-145M
- Modelo CPDD-147M: https://huggingface.co/dinghhhhhhhhhhhhhhh/CPDD-147M
- Código: https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm
- Informe técnico (PDF): https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm/blob/main/paper/CPDD_technical_report.pdf
- Licencia del código (Apache-2.0): https://github.com/dhnihaoya/CreatiPhage-Diffusion-DNA-Lm/blob/main/LICENSE
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Sitio corporativo de CreatiPhage: https://www.cphage.com/en/
