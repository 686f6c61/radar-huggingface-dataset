# NoxNotreve/Qwen2.5-Coder-3B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-3B-Instruct-GGUF es la version cuantizada en formato GGUF del modelo de generacion de codigo Qwen2.5-Coder-3B-Instruct, desarrollado por Alibaba Cloud y publicado originalmente como parte de la familia Qwen2.5-Coder. Este repositorio concreto, subido por el usuario NoxNotreve, ofrece los pesos en formato GGUF para su ejecucion eficiente en CPU y GPU mediante herramientas como llama.cpp u Ollama, sin necesidad de transformar los pesos originales.

El modelo base es un transformer causal de 3.397 millones de parametros (3,4B), entrenado sobre 5,5 billones de tokens que combinan codigo fuente, datos de grounding texto-codigo y datos sinteticos. Con una ventana de contexto de 32.768 tokens, esta pensado para tareas de generacion, razonamiento y reparacion de codigo, asi como para aplicaciones de agentes de codigo. Su relevancia actual radica en que ofrece capacidades de asistente de programacion en un tamano reducido que cabe en hardware de consumo, siendo una alternativa ligera a modelos de 7B o superiores.

El repositorio incluye ocho niveles de cuantizacion (q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0), lo que permite ajustar el equilibrio entre calidad y consumo de recursos segun el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y word embeddings atados |
| Parametros totales | 3.397.103.616 (3,39 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (hasta 131.072 con YARN en vLLM, no en GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Ingles (y codigo de programacion) |
| Licencia | Qwen Research License (uso comercial restringido) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 36 capas, 16 cabezas de atencion de consulta (Q) y 2 cabezas de clave/valor (KV) usando atencion con GQA (Grouped Query Attention). Emplea RoPE (Rotary Positional Embedding), SwiGLU como funcion de activacion, RMSNorm para normalizacion y bias en las capas de atencion QKV. Los embeddings de palabra estan atados (tied), lo que reduce el numero total de parametros no-embedding a 2,77 B.

El entrenamiento se realizo en dos etapas: pretraining y post-training (instruction tuning). Segun el informe tecnico de Qwen2.5-Coder (arXiv:2409.12186), el dataset de entrenamiento incluye 5.5 trillones de tokens de codigo fuente, texto-code grounding y datos sinteticos. El ajuste fino instructivo sigue el enfoque de la familia Qwen2.5, con datos de chat, codigo y razonamiento. La variante GGUF no introduce cambios arquitectonicos: es una cuantizacion de los pesos originales de safetensors del modelo base.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion (Python, JavaScript, Java, C++, Go, Rust, entre otros), con soporte para completar funciones, clases y scripts completos.
- Razonamiento sobre codigo: explica que hace un fragmento, identifica errores logicos y sugiere correcciones.
- Reparacion de codigo (code fixing), con capacidad de recibir un bloque con un error y devolver la version corregida.
- Chat conversacional orientado a programacion, con capacidad de mantener contexto multi-turno dentro de la ventana de 32K tokens.
- Competencias generales de lenguaje y matematicas heredadas del modelo base Qwen2.5, aunque su foco principal es el codigo.
- Soporte de tool calling no documentado de forma explicita en la model card; no se confirma function calling en este repo.
- Capacidad de agente limitada: el modelo puede integrarse en pipelines de agentes de codigo, pero no incluye un modo thinking explicito ni vision.

## Casos de uso

- Asistente de programacion integrado en IDE: puede usarse con extensiones de VS Code o Neovim para generar codigo, explicar fragmentos y completar funciones. Su tamano permite ejecutarlo localmente en un portatil con 8 GB de RAM usando cuantizacion q4_K_M.
- Autocompletado en servidores de desarrollo: gracias a su ventana de 32.768 tokens, puede procesar archivos completos de proyectos medianos y sugerir implementaciones coherentes con el contexto del proyecto.
- Educacion y formacion en programacion: el modelo puede explicar conceptos, generar ejemplos y corregir ejercicios de estudiantes, funcionando como tutor local sin conexion.
- Reparacion automatica de errores en CI/CD: integrable en pipelines de integracion continua para analizar logs de error y proponer parches, aunque su tamano no le permite manejar repositorios muy grandes en una sola pasada.
- Generacion de documentacion tecnica: puede recibir un bloque de codigo y generar comentarios, docstrings o documentacion Markdown explicando el funcionamiento.
- Prototipado rapido de scripts: util para generar scripts de automatizacion (bash, Python) o consultas SQL a partir de descripciones en lenguaje natural, con la ventaja de poder ejecutarse en entornos sin GPU.
- Chatbot de soporte tecnico interno: puede responder preguntas frecuentes sobre APIs y librerias concretas si se le proporciona el contexto necesario en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog oficial de Qwen2.5-Coder (qwenlm.github.io/blog/qwen2.5-coder-family) para evaluaciones detalladas, pero no se incluyen cifras concretas de MMLU, HumanEval o GSM8K en el repositorio de GGUF. Se recomienda consultar el blog y el informe tecnico (arXiv:2409.12186) para obtener resultados comparativos.

## Requisitos de hardware

- VRAM estimada: con cuantizacion q4_K_M, el modelo ocupa aproximadamente 1,8-2,0 GB de memoria; con q8_0 sube a unos 3,5 GB. En CPU, el uso de RAM esta en el mismo rango.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones mas bajas sin problemas. Para q8_0 se recomienda 6 GB o mas.
- Compatibilidad con consumer GPU: si, es un modelo pensado para ejecucion local en equipos de consumo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (disponible en el catalogo oficial), vLLM (con YARN para contexto extendido), TGI y cualquier runtime que soporte GGUF.
- Latencia estimada: en CPU moderna (por ejemplo, Apple M2 o Ryzen 7), la generacion de tokens con q4_K_M suele estar entre 20 y 40 tokens por segundo; en GPU consumer puede superar los 100 tokens por segundo. No hay cifras oficiales publicadas en el repo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Foco |
|---|---|---|---|---|---|
| Qwen2.5-Coder-3B-Instruct | 3,39 B | 32.768 | qwen-research | GGUF | Codigo, chat |
| CodeLlama-7B-Instruct | 7 B | 16.384 | Llama 2 | GGUF | Codigo, chat |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 | DeepSeek License | GGUF | Codigo, chat |
| StarCoder2-3B | 3 B | 16.384 | Apache-2.0 | safetensors | Codigo |

El Qwen2.5-Coder-3B ofrece una ventana de contexto mas amplia que CodeLlama-7B y DeepSeek-Coder-6.7B, y un tamano comparable a StarCoder2-3B, pero con licencia restringida para uso comercial (qwen-research). Su principal ventaja es la calidad de generacion de codigo para su tamano, segun el informe oficial, aunque no hay datos de benchmark verificables en este repo.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial y requiere solicitud de permiso para despliegues en produccion. No es una licencia open source estandar (Apache/MIT).
- Idiomas: solo se declara ingles, aunque el modelo base puede entender algo de espanol; no se garantiza calidad multilingue.
- Riesgo de alucinacion en codigo: puede generar funciones que parecen validas pero contienen errores logicos o llamadas a APIs inexistentes, especialmente en lenguajes menos comunes.
- Contexto limitado a 32.768 tokens en GGUF: la extension a 131.072 tokens solo es posible con vLLM y el modelo no cuantizado, no con llama.cpp.
- Sesgos: como modelo entrenado con codigo de repositorios publicos, puede replicar patrones sesgados o codigo de baja calidad presente en los datos de entrenamiento.
- No se incluyen los pesos en safetensors en este repo, solo las cuantizaciones GGUF; para acceder al modelo original hay que ir al repositorio de Qwen.

## Enlaces

- Repositorio HuggingFace de este modelo: https://huggingface.co/NoxNotreve/Qwen2.5-Coder-3B-Instruct-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Repositorio GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF
- Blog oficial de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentacion de Qwen (incluye guia llama.cpp): https://qwen.readthedocs.io/en/latest/
- Paper tecnico de Qwen2.5-Coder: https://arxiv.org/abs/2409.12186
- Paper tecnico de Qwen2: https://arxiv.org/abs/2407.10671
- Pagina de Ollama para qwen2.5-coder: https://ollama.com/library/qwen2.5-coder:3b-instruct
