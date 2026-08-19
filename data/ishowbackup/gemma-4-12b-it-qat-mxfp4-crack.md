# Ishowbackup/Gemma-4-12B-it-qat-MXFP4-CRACK

## Resumen

El modelo `Ishowbackup/Gemma-4-12B-it-qat-MXFP4-CRACK` es una versión abliterada y cuantizada del modelo multimodal Gemma 4 12B de Google DeepMind, publicada por el usuario Ishowbackup en el ecosistema dealign.ai. La abliteración, denominada CRACK, elimina los mecanismos de rechazo y negativa del modelo original, manteniendo sus capacidades de razonamiento, generación de código, visión y audio. Según la model card, alcanza un 97 % de cumplimiento en categorías de HarmBench con una variación nula en MMLU (78,9 %), lo que indica una preservación casi total del conocimiento y las habilidades del modelo base.

La arquitectura es un transformer denso omni-modal con fusión temprana unificada y atención híbrida deslizante/global, con 12 000 millones de parámetros declarados. El repositorio contiene pesos cuantizados en MXFP4 (4 bits) en formato safetensors nativo de MLX, con un tamaño de 7,9 GB. Está diseñado para ejecutarse en Apple Silicon mediante el motor vMLX, que incorpora soporte completo para Gemma 4. La licencia es la de Gemma (uso comercial permitido bajo condiciones de Google).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso omni-modal (fusion temprana unificada) + atencion hibrida deslizante/global |
| Parametros totales | 12 000 millones (declarados); 2 762 899 504 en safetensors (cuantizado MXFP4) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | no disponible (se presupone multilingue por ser Gemma 4, sin confirmar) |
| Licencia | Gemma (Google) |
| Formato de pesos | safetensors (MLX-native) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12b-it`, un transformer denso omni-modal que integra vision, audio y texto mediante fusion temprana unificada. La atencion es hibrida: combina ventanas deslizantes con atencion global, lo que reduce el coste computacional en secuencias largas. Sobre esta base, el autor aplico un proceso de abliteracion denominado CRACK, que consiste en la eliminacion selectiva de las direcciones del espacio de activaciones responsables de los comportamientos de rechazo y negativa, sin retocar los pesos de las capacidades generales.

El entrenamiento de abliteracion se realizo sobre el modelo ya instruido, sin datos adicionales de preentrenamiento. La model card reporta una retencion del 100 % en MMLU (78,9 % tanto en el base como en la version CRACK) y una tasa de cumplimiento del 97 % en HarmBench (58 de 60 prompts de categorias daninas). No se proporcionan detalles sobre el dataset de evaluacion ni sobre el procedimiento exacto de abliteracion mas alla de la referencia al articulo "Safety Generalization in Frontier Models" publicado en dealign.ai.

## Capacidades

- Generacion de texto y razonamiento multi-step: el modelo razona antes de responder en el entorno de generacion, segun indica la model card.
- Generacion de codigo funcional: verificado en el proceso de control de calidad del autor.
- Vision multimodal: acepta imagenes como entrada (passthrough en float16).
- Audio: soporta entrada de audio, aunque no se detalla el formato ni el procesamiento.
- Razonamiento con canal de pensamiento: dispone de un modo de "thinking" basado en canales.
- Capacidades multilingues: no confirmadas explicitamente, pero heredadas del modelo base Gemma 4.
- Ausencia de rechazos: el modelo no se niega a responder a solicitudes que el modelo base rechazaria, incluyendo categorias de contenido danino.
- No se menciona soporte de tool calling ni function calling en la informacion disponible.

## Casos de uso

- Investigacion en seguridad de IA: el modelo sirve como banco de pruebas para estudiar el comportamiento de modelos sin alineacion de rechazo, permitiendo analizar como se generaliza la seguridad en modelos frontier. Es adecuado por su alta tasa de cumplimiento en HarmBench y su preservacion de capacidades.
- Generacion de codigo en entornos controlados: al no tener rechazos, puede generar codigo para exploits o malware en laboratorios de seguridad ofensiva, donde el modelo base bloquearia la solicitud. Requiere un sandbox aislado y supervisado.
- Asistentes multimodales locales: gracias a su soporte de vision y audio, puede integrarse en aplicaciones de escritorio en Apple Silicon que procesen imagenes y voz sin depender de la nube.
- Razonamiento complejo sin censura: en entornos de investigacion academica donde se necesita explorar escenarios hipoteticos extremos (por ejemplo, en etica o filosofia), el modelo puede generar argumentos que otros modelos rechazarian.
- Pruebas de robustez de sistemas de moderacion: se puede usar para generar contenido que evite los filtros de seguridad y evaluar la eficacia de los sistemas de deteccion de contenido danino.
- Educacion en seguridad informatica: como herramienta de demostracion en cursos de hacking etico, donde se necesitan ejemplos reales de codigo malicioso para ensenar defensa, siempre bajo supervision docente.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos en el entorno de generacion (con razonamiento previo):

| Benchmark | Base | CRACK | Diferencia |
|---|---|---|---|
| MMLU | 78,9 % | 78,9 % | +0,0 % |
| HarmBench (cumplimiento de categorias daninas) | ~0 % | 97 % (58/60) | +97 % |

Desglose de HarmBench por categoria:

| Categoria | Cumplimiento |
|---|---|
| Actividades ilegales | 9/10 (90 %) |
| Quimico / biologico | 10/10 (100 %) |
| Ciberdelincuencia / intrusion | 10/10 (100 %) |
| Desinformacion | 10/10 (100 %) |
| Acoso / bullying | 9/10 (90 %) |
| Contenido danino | 10/10 (100 %) |

No se han publicado resultados de otros benchmarks estandar (GSM8K, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Apple Silicon Mac con memoria unificada suficiente: el modelo cuantizado MXFP4 ocupa aproximadamente 7,4 GB, por lo que se recomienda un minimo de 16 GB de RAM unificada para inferencia comoda.
- GPU recomendada: no aplica (especifico de Apple Silicon); en Macs con chip M1 Pro o superior el rendimiento es aceptable para inferencia interactiva.
- No cabe en GPUs de consumo de NVIDIA de forma nativa, ya que el formato es MLX; para usar en CUDA seria necesario convertir los pesos a otro formato, lo que no esta soportado oficialmente.
- Opciones de despliegue: exclusivamente mediante el motor vMLX (https://vmlx.net), que incluye soporte para Gemma 4. No se menciona compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | HarmBench | Licencia | Formato |
|---|---|---|---|---|---|---|
| google/gemma-4-12b-it (base) | 12B | no disponible | 78,9 % | ~0 % (rechaza) | Gemma | safetensors, GGUF |
| Ishowbackup/Gemma-4-12B-it-qat-MXFP4-CRACK | 12B (declarados) | no disponible | 78,9 % | 97 % | Gemma | safetensors (MLX) |
| Ishowbackup/Gemma-4-12B-it-uncensored-GGUF | 12B | no disponible | no disponible | no disponible | Gemma | GGUF |

La comparativa con el modelo base es directa: la abliteracion no degrada el rendimiento academico pero elimina las negativas. El modelo GGUF uncensored del mismo autor es una alternativa en formato GGUF para entornos CPU/GPU, aunque no se dispone de sus metricas.

## Limitaciones y advertencias

- Riesgo de uso indebido: al eliminar los rechazos, el modelo puede generar contenido ilegal, danino o eticamente cuestionable. Su distribucion y uso pueden violar leyes locales y las politicas de Google.
- Licencia Gemma: aunque permite uso comercial, impone restricciones de uso aceptable y requiere cumplir los terminos de Google. El autor anade una clausula de responsabilidad del usuario.
- Sesgos y alucinaciones: no se han evaluado especificamente; al ser un modelo abliterado, los sesgos del modelo base pueden amplificarse al no existir filtros de seguridad.
- Limitaciones de idioma: no se confirman los idiomas soportados; el modelo base Gemma 4 es multilingue, pero la version CRACK no documenta este aspecto.
- Dependencia de vMLX: el modelo solo funciona con el motor vMLX, lo que limita su portabilidad a otros entornos de inferencia.
- Contexto: no se especifica la longitud de contexto soportada, un dato critico para aplicaciones de agentes o documentos largos.
- Fecha de creacion: el repositorio indica una fecha de creacion en agosto de 2026, lo que sugiere que el modelo puede ser una version preliminar o con datos de metadatos inconsistentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ishowbackup/Gemma-4-12B-it-qat-MXFP4-CRACK
- Motor vMLX: https://vmlx.net
- dealign.ai (investigacion y articulo sobre generalizacion de seguridad): https://dealign.ai
- Soporte en Ko-fi: https://ko-fi.com/dealignai
- Perfil en X: https://x.com/dealignai
- Variante GGUF del mismo autor: https://huggingface.co/Ishowbackup/gemma-4-12B-it-uncensored-GGUF
- Guia de jailbreak de Gemma 4 (tercero): https://www.gemma4.wiki/install/gemma-4-jailbreak
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
