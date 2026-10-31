# nalemi/persona_light_uncensored_win64

## Resumen

**persona_light_uncensored_win64** es un prototipo de aplicación de chat de texto local y autónoma para Windows de 64 bits, publicada por el usuario *nalemi* en Hugging Face. No es un modelo nuevo en sí mismo: se trata de un binario standalone que empaqueta el modelo **Qwen2.5-3B-Instruct-Abliterated** en formato GGUF con cuantización Q4_K_M, ejecutándose sobre llama.cpp de forma totalmente offline, sin nube ni telemetría.

El propósito declarado del proyecto es demostrar que la IA local puede desarrollar una "personalidad" sin censura ("abliterated"), funcionando sobre CPU y RAM del sistema, incluso en hardware antiguo. El modelo base, Qwen2.5-3B-Instruct de Alibaba, es un transformer decoder-only de 3 mil millones de parámetros, y la versión "abliterated" ha sido modificada para eliminar sus mecanismos de rechazo de seguridad.

Es relevante como ejemplo de empaquetado de LLM ligeros para inferencia en CPU, aunque conviene subrayar que se trata de un prototipo experimental con descargas prácticamente nulas, orientado a investigación y experimentación local, no a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 3 mil millones (Qwen2.5-3B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (Qwen2.5 soporta hasta 32.768 tokens, pero el empaquetado no lo especifica) |
| Tipos de cuantizacion | Q4_K_M (variante i1 de imatrix, GGUF) |
| Idiomas soportados | Ingles y aleman (declarados); el modelo base Qwen2.5 soporta mas de 29 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen2.5-3B-Instruct-Abliterated.i1-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo subyacente es **Qwen2.5-3B-Instruct**, un transformer decoder-only de 3 mil millones de parámetros entrenado por Alibaba, ajustado por instrucciones (SFT) y alineado posteriormente (RLHF/DPO según la documentación oficial de la familia Qwen2.5). La variante utilizada aquí es una versión **abliterated**, es decir, una modificación de los pesos (típicamente mediante análisis de direcciones de rechazo) que neutraliza el comportamiento de negación entrenado, permitiendo respuestas sin filtros de seguridad.

El empaquetado distribuido emplea cuantización **Q4_K_M con matriz de importancia (imatrix, variante i1)** en formato GGUF para llama.cpp, lo que reduce el modelo a un tamaño manejable en CPU. No hay datos publicados sobre el número de tokens de entrenamiento ni la composición del dataset en la ficha del repositorio. El autor lo describe como prototipo ligero de una arquitectura mayor llamada "Persona", de la que no se ofrece documentación adicional.

## Capacidades

- Generacion de texto conversacional multi-turno mediante interfaz de chat de texto pura
- Razonamiento sin filtros de seguridad (version abliterated del modelo instruct)
- Ejecucion 100% offline, sin dependencias de nube ni telemetria
- Inferencia en CPU y RAM del sistema, sin necesidad de GPU
- Instalacion cero: binario standalone portable para Windows 64 bits
- No incluye capacidades multimodales, voz ni ejecucion autonoma de agentes (declarado explicitamente como fuera del alcance de este prototipo)
- No hay informacion sobre soporte de tool calling o function calling en este empaquetado

## Casos de uso

- **Experimentacion con modelos abliterated en local:** permite probar el comportamiento de un modelo sin filtros en un entorno aislado, sin enviar datos a servicios externos, util para investigacion sobre alineacion y seguridad.
- **Pruebas de LLM en hardware antiguo:** al ejecutarse en CPU con cuantizacion Q4_K_M, es adecuado para equipos de escritorio sin GPU dedicada y con RAM limitada.
- **Desarrollo y depuracion de prompts offline:** el binario portable permite iterar prompts sin instalar dependencias (Python, CUDA, drivers), util para prototipado rapido.
- **Entornos sin conexion a internet:** ideal para maquinas aisladas (air-gapped) donde se necesita un asistente de texto basico.
- **Estudio de patrones de comportamiento conversacional:** el autor lo plantea como banco de pruebas para explorar "patrones de comportamiento locales" de una persona artificial.
- **Demostraciones y educacion:** sirve como ejemplo didactico de como empaquetar un GGUF con llama.cpp en un ejecutable standalone para Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para referencia, el modelo base Qwen2.5-3B-Instruct tiene resultados publicados por Alibaba, pero no se incluyen en la ficha de este repositorio ni se han verificado para este empaquetado concreto.

## Requisitos de hardware

- **VRAM:** no aplica; el empaquetado esta optimizado para ejecucion en **CPU y RAM del sistema**. El repositorio ocupa 2,4 GB, por lo que se estima un consumo de RAM de entre 3 y 4 GB durante la inferencia (estimacion, no dato oficial).
- **GPU:** no necesaria; no se mencionan requisitos de GPU ni aceleracion.
- **Consumer hardware:** disenado para hardware antiguo; cualquier PC Windows 64 bits con al menos 4-8 GB de RAM deberia ejecutarlo.
- **Despliegue:** el binario ya integra llama.cpp; alternativamente, el GGUF subyacente puede ejecutarse con llama.cpp, Ollama o LM Studio por separado. No hay soporte declarado para vLLM o TGI (orientados a GPU).
- **Latencia:** no se publican cifras; la ficha indica que la primera respuesta puede tardar unos segundos mientras el modelo se carga en memoria. En CPU con Q4_K_M y 3B parametros, se esperan velocidades del orden de unos pocos tokens por segundo en maquinas modestas (estimacion).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Ejecucion | Licencia | Particularidad |
|---|---|---|---|---|---|
| persona_light_uncensored_win64 | 3B (Qwen2.5 base) | Q4_K_M GGUF | CPU, Windows standalone | Apache 2.0 | Abliterated, empaquetado portable sin instalacion |
| Qwen2.5-3B-Instruct (oficial) | 3B | multiples (BF16, GGUF, AWQ...) | CPU/GPU | Apache 2.0 (Qwen license para >3B) | Modelo original con filtros de seguridad intactos |
| Llama-3.2-3B-Instruct | 3B | multiples GGUF | CPU/GPU | Llama Community License | Alternativa de Meta, contexto de 128K tokens |
| Phi-3.5-mini-instruct | 3,8B | multiples GGUF | CPU/GPU | MIT | Alternativa de Microsoft, buen rendimiento por parametro |

La diferencia principal frente a las alternativas no es el modelo base sino el empaquetado: binario Windows sin dependencias y la eliminacion de filtros de seguridad, algo que las distribuciones oficiales no ofrecen.

## Limitaciones y advertencias

- **Eliminacion de salvaguardas:** al ser un modelo abliterated, genera contenido sin los rechazos de seguridad del modelo original. Esto conlleva riesgo elevado de outputs ofensivos, daninos o ilegales; el autor delega toda la responsabilidad en el usuario.
- **Alucinaciones:** como todo modelo de 3B parametros, la tasa de alucinacion es alta, especialmente en datos factuales y razonamiento complejo.
- **Contexto e idioma:** la longitud de contexto efectiva del empaquetado no esta documentada; los idiomas declarados son ingles y aleman, con rendimiento limitado fuera de ellos.
- **Capacidad limitada:** 3B parametros cuantizados a 4 bits implica perdida notable de calidad frente a modelos grandes; no apto para tareas de razonamiento exigente, codigo complejo o agentes.
- **Madurez del proyecto:** prototipo con 0 descargas y 1 like, sin documentacion tecnica detallada, sin pipeline declarado y sin historial de mantenimiento verificable.
- **Licencia:** Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de la version abliterated y los terminos del modelo base Qwen2.5 (Apache 2.0 para la variante de 3B).
- **Plataforma:** exclusivo de Windows 64 bits; no hay binarios para Linux o macOS en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nalemi/persona_light_uncensored_win64
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog oficial de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado otros enlaces relevantes (papers, demos o documentacion adicional) en la informacion disponible.
