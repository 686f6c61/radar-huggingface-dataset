# AbteeXAILab/lumynax-reasoning-deepseek-prover-v2-671b-gguf

## Resumen

LumynaX Reasoning DeepSeek-Prover V2 671B GGUF es un paquete de pesos en formato GGUF del modelo DeepSeek-Prover-V2-671B, publicado por AbteeX AI Labs, un laboratorio con sede en Aotearoa (Nueva Zelanda), como parte de su familia de modelos "LumynaX" orientada a IA soberana y ejecución local. El modelo base, desarrollado originalmente por DeepSeek, es un transformador de arquitectura Mixture-of-Experts (MoE) con 671 mil millones de parámetros totales, especializado en razonamiento matemático, demostración de teoremas y verificación formal de pruebas.

Este repositorio concreto se presenta como un "release legacy" y un "artefacto de investigación desactualizado". La model card indica explícitamente que no se mantiene, no se recomienda para producción y no representa las capacidades actuales de AbteeX AI Labs. El paquete conserva los pesos originales del modelo DeepSeek sin modificación, y su integración con el sistema propietario "LumynaX Core" se describe como "infusión enrutada" (routed infusion), es decir, el orquestador LumynaX dirige la inferencia a través del modelo sin alterar sus pesos.

La relevancia de esta publicación radica en su valor de reproducibilidad para investigación: permite ejecutar localmente, mediante llama.cpp, un modelo de razonamiento de gran escala en hardware con suficiente VRAM, aunque su estado de abandono y la ausencia de documentación técnica detallada limitan su utilidad práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) - transformer |
| Parametros totales | 671.026.419.200 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF, sin lista de archivos) |
| Idiomas soportados | en (ingles), mi (maori) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Prover-V2-671B emplea una arquitectura de transformer con mezcla de expertos (MoE), diseñada para tareas de razonamiento formal y demostración de teoremas. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la documentación de este repositorio. La model card de AbteeX AI Labs no aporta datos técnicos sobre el entrenamiento del modelo original, limitándose a describir el mecanismo de "infusión" de LumynaX, que en este caso es una integración enrutada sin modificación de pesos.

El paquete GGUF se ha generado para su uso con llama.cpp, lo que implica una conversión de los pesos originales a este formato. No se mencionan innovaciones técnicas adicionales en la conversión ni en el empaquetado. El repositorio incluye archivos de verificación como `checksums.sha256` y `release_export_manifest.json`, pero su contenido no se detalla en la información disponible.

## Capacidades

- Razonamiento matematico avanzado: el modelo base esta especializado en problemas de matematicas, demostracion de teoremas y verificacion de pruebas formales.
- Generacion de texto: al ser un modelo de lenguaje de gran tamano, puede generar texto coherente en ingles y maori, aunque su entrenamiento principal se centra en dominios matematicos.
- Ejecucion local: al estar en formato GGUF, es compatible con llama.cpp y herramientas derivadas como Ollama, lo que permite su despliegue en entornos sin acceso a la nube.
- Integracion con LumynaX Core: segun la model card, el modelo puede ser orquestado por el sistema LumynaX para aplicar controles de soberania, planificacion agente y optimizacion de inferencia, aunque esta funcionalidad es propietaria y no esta documentada en este repositorio.
- Soporte multilingue limitado: los idiomas declarados son ingles y maori, lo que sugiere una cobertura linguistica reducida en comparacion con modelos multilingues generales.

## Casos de uso

- Investigacion academica en matematicas: el modelo puede asistir a investigadores en la exploracion de conjeturas, la generacion de demostraciones preliminares y la verificacion de pasos logicos en pruebas formales, aprovechando su especializacion en razonamiento matematico.
- Educacion y tutoria avanzada: como herramienta de apoyo para estudiantes de matematicas de nivel universitario, puede generar explicaciones paso a paso de teoremas y problemas, aunque su estado legacy limita su fiabilidad.
- Verificacion de software formal: en entornos de desarrollo donde se requiere demostrar propiedades de programas (por ejemplo, con asistentes de pruebas como Lean o Coq), el modelo puede sugerir estrategias de demostracion, aunque no se garantiza su precision.
- Experimentacion con inferencia local: para desarrolladores que deseen evaluar el rendimiento de un modelo MoE de 671B en hardware propio, este paquete GGUF permite probar la viabilidad de ejecucion con llama.cpp en configuraciones de multiples GPUs.
- Reproducibilidad de investigacion: dado que el repositorio incluye sumas de verificacion y manifiestos de exportacion, puede utilizarse para reproducir experimentos previos de AbteeX AI Labs o para auditar el proceso de empaquetado.
- Desarrollo de sistemas de IA soberana: en el contexto del proyecto LumynaX, el modelo podria integrarse en pipelines que prioricen el control local de datos y la independencia de infraestructura cloud, aunque esta aplicacion no esta soportada activamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Dado que el paquete es un artefacto legacy sin mantenimiento, no se dispone de datos fiables sobre su calidad de salida en tareas especificas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 671 mil millones de parametros, incluso en cuantizaciones agresivas (por ejemplo, 4-bit), el modelo requiere un minimo de aproximadamente 350-400 GB de VRAM para cargar los pesos, asumiendo una cuantizacion eficiente. El tamano del repositorio es de 404.5 GB, lo que sugiere que la cuantizacion utilizada no es extremadamente baja.
- GPU recomendadas: se necesitan multiples GPUs de alta gama. Configuraciones tipicas incluyen 8x A100 80GB, 8x H100 80GB o 4x A100 80GB con cuantizacion mas agresiva, aunque no se ha verificado la compatibilidad.
- Compatibilidad con GPU de consumo: no es viable en una sola GPU de consumo (RTX 4090, 3090, etc.) debido a la limitacion de VRAM (24 GB). Solo seria posible con tecnicas de offloading a CPU o memoria compartida, con una latencia extremadamente alta.
- Opciones de despliegue: llama.cpp es el runtime principal, y por extension herramientas como Ollama o llama-cpp-python. Tambien podria utilizarse con servidores de inferencia compatibles con GGUF, aunque no se mencionan otros.
- Latencia y throughput: no disponibles. Dependen criticamente del numero de GPUs, la cuantizacion y el ancho de banda de interconexion (NVLink, PCIe).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base DeepSeek-Prover-V2-671B pertenece a la familia de modelos de razonamiento matematico de DeepSeek, junto con DeepSeek-R1 y DeepSeek-Coder, pero no se han proporcionado datos de rendimiento ni especificaciones de estos modelos en la documentacion de este repositorio. Por tanto, no se puede ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Estado legacy y desactualizado: la model card declara explicitamente que el modelo no se mantiene, no se recomienda para produccion y no representa las capacidades actuales de AbteeX AI Labs. Su uso en entornos criticos es desaconsejable.
- Licencia restrictiva: la licencia se indica como "other", sin especificar los terminos exactos. Esto puede implicar restricciones para uso comercial o modificacion. Se recomienda revisar el archivo `LICENSE.txt` incluido en el repositorio antes de cualquier uso.
- Riesgo de alucinacion: al ser un modelo de razonamiento matematico, puede generar demostraciones incorrectas o pasos logicos invalidos con alta confianza. No debe utilizarse como sustituto de verificacion humana en contextos formales.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos o comportamientos problematicos. Dado el entrenamiento especializado, es probable que tenga un rendimiento pobre en tareas generales de lenguaje.
- Limitaciones de contexto: no se especifica la longitud de contexto soportada. El modelo base DeepSeek-Prover-V2 podria tener una ventana de 128K tokens, pero este dato no esta confirmado en la informacion disponible.
- Soporte linguistico reducido: solo se declaran ingles y maori, lo que limita su utilidad en aplicaciones multilingues.
- Requisitos de hardware extremos: la mayoria de los desarrolladores no podran ejecutar este modelo localmente debido a los requisitos de VRAM, lo que restringe su accesibilidad practica.

## Enlaces

- [HuggingFace - AbteeXAILab/lumynax-reasoning-deepseek-prover-v2-671b-gguf](https://huggingface.co/AbteeXAILab/lumynax-reasoning-deepseek-prover-v2-671b-gguf)
- [Repositorio fuente en GitHub](https://github.com/Aimaghsoodi/lumynax-reasoning-deepseek-prover-v2-671b-gguf)
- [AbteeX AI Labs](https://abteex.com)
- [LumynaX](https://lumynax.com)
- [Contacto](mailto:aimaghsoodi@abteex.com)
- [Modelo base en HuggingFace - deepseek-ai/DeepSeek-Prover-V2-671B](https://huggingface.co/deepseek-ai/DeepSeek-Prover-V2-671B)
