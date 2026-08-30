# NC-AI-consortium-VAETKI/VAETKI

## Resumen

VAETKI es un modelo de lenguaje de gran escala desarrollado por el consorcio NC-AI, una iniciativa colaborativa liderada por NC-AI con la participación de 13 organizaciones. El modelo, denominado VAETKI-100B-A10B, adopta una arquitectura Mixture-of-Experts (MoE) para equilibrar rendimiento y coste computacional, con un total de 112,2 mil millones de parámetros de los cuales solo 10,1 mil millones se activan por token. Está diseñado tanto para investigación como para aplicaciones reales, con especial énfasis en tareas de razonamiento avanzado, conocimiento especializado y escenarios de uso agéntico.

El modelo soporta cuatro idiomas principales (coreano, inglés, chino y japonés) y ofrece una ventana de contexto de 32 000 tokens. Una característica distintiva es su modo de funcionamiento dual: las tareas de tool agent operan en modo no-pensante, mientras que el resto de tareas utilizan un modo de pensamiento explícito. El entrenamiento incluye una fase de pre-entrenamiento con 9,8 billones de tokens y una fase de post-entrenamiento con alineación de preferencias humanas, lo que permite una generación de texto más natural y consistente. Su licencia MIT facilita su adopción tanto en entornos académicos como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers, Mixture-of-Experts (MoE) |
| Parametros totales | 112,2 mil millones (112 191 900 672) |
| Parametros activos | 10,1 mil millones |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano, ingles, chino, japones |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VAETKI emplea una arquitectura Transformer causal con capas MoE. El modelo tiene 48 capas, 24 cabezas de atención por capa, 128 expertos en total y 8 expertos activados por token. El tamaño del vocabulario es de 126 000 tokens. Esta configuración permite obtener la capacidad de un modelo denso de gran tamaño con un coste de inferencia reducido, ya que solo se activa una fracción de los parámetros en cada paso.

El entrenamiento se realizó en dos fases. La fase de pre-entrenamiento utilizó un corpus de 9,8 billones de tokens compuesto por múltiples datasets públicos y propietarios, incluyendo FineWeb-2, The Stack v2, Nemotron-CC-v2, DCLM-baseline-1.0, entre otros. Además, con el apoyo de la Agencia Nacional de Sociedad de la Información (NIA) de Corea, se incorporaron 7,6 mil millones de tokens adicionales específicos para comprensión de contexto largo y razonamiento Chain-of-Thought en chino y japonés. La fase de post-entrenamiento incluyó un dataset adicional de 10 mil millones de tokens centrado en estudios coreanos y razonamiento matemático, junto con alineación de preferencias humanas para mejorar el seguimiento de instrucciones y la coherencia conversacional.

## Capacidades

- Generacion de texto en cuatro idiomas: coreano, ingles, chino y japones, con soporte para traduccion entre ellos.
- Razonamiento complejo y Chain-of-Thought: el modelo activa un modo de pensamiento explicito para tareas que no son de tool agent, lo que mejora el rendimiento en problemas de logica y matematicas.
- Tool calling y uso de agentes: las tareas de tool agent se ejecutan en modo no-pensante, optimizando la latencia y la precision en llamadas a funciones externas.
- Seguimiento de instrucciones: la alineacion con preferencias humanas garantiza respuestas mas naturales y consistentes en dialogos multi-turno.
- Comprension de contexto largo: con 32 000 tokens de ventana, puede procesar documentos extensos, articulos cientificos o conversaciones prolongadas.
- Capacidades de codigo: el entrenamiento incluye datasets como The Stack v2 y OpenCodeGeneticInstruct, lo que le permite generar y comprender codigo en multiples lenguajes de programacion.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones multi-turno en coreano, ingles, chino y japones, manteniendo el contexto durante toda la interaccion gracias a su ventana de 32 000 tokens. Su modo de tool agent permite integrarse con sistemas de ticketing o bases de conocimiento externas.
- Traduccion automatica de documentos tecnicos: gracias a su entrenamiento en cuatro idiomas y su capacidad de seguir instrucciones, puede traducir manuales, patentes o documentacion tecnica manteniendo la terminologia especializada.
- Asistente de programacion en entornos de desarrollo: con soporte para generacion de codigo y tool calling, puede integrarse en IDEs o pipelines de CI/CD para autocompletar funciones, revisar codigo o generar tests.
- Analisis de documentos legales o financieros: la ventana de contexto de 32 000 tokens permite procesar contratos, informes anuales o expedientes completos, extrayendo clausulas relevantes o resumiendo informacion clave.
- Agente de investigacion academica: el modelo puede buscar informacion en repositorios, resumir articulos cientificos y responder preguntas complejas sobre dominios especializados, gracias a su entrenamiento con datasets de ciencia abierta y razonamiento matematico.
- Generacion de contenido localizado para mercados asiaticos: empresas que operan en Corea, Japon, China o paises de habla inglesa pueden usar el modelo para crear copywriting, descripciones de producto o respuestas de soporte adaptadas culturalmente a cada region.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas con otros modelos, ni metricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el Technical Report en el repositorio de GitHub para obtener datos de evaluacion detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 112,2 mil millones de parametros en precision FP16, el modelo ocuparia aproximadamente 224 GB solo en pesos, por lo que se requiere una GPU o cluster con al menos 256 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: no se han publicado requisitos oficiales. Dado el tamano del modelo, serian necesarias GPUs de alta gama como NVIDIA A100 80 GB (varias en paralelo), H100 80 GB o H200. No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantizacion agresiva.
- Opciones de despliegue: no se mencionan frameworks especificos en la documentacion. Dado que los pesos estan en formato safetensors, es compatible con vLLM, TensorRT-LLM o Hugging Face Transformers. Para cuantizacion, se podrian usar herramientas como llama.cpp o AutoGPTQ, aunque no hay confirmacion oficial.
- Latencia y throughput: no disponible. El modelo MoE con 10,1 mil millones de parametros activos reduce el coste computacional por token en comparacion con un modelo denso de 112 mil millones, pero aun asi requiere hardware de centro de datos para un rendimiento aceptable.

## Comparativa con modelos similares

No se dispone de datos de benchmarks publicados para VAETKI, por lo que no es posible realizar una comparativa cuantitativa fiable. Como referencia cualitativa, se pueden considerar otros modelos MoE de tamano similar:

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia |
|---|---|---|---|---|---|
| VAETKI-100B-A10B | 112,2B | 10,1B | 32k | ko, en, zh, ja | MIT |
| Mixtral 8x22B | 141B | 39B | 64k | multilingue | Apache 2.0 |
| Qwen2.5-MoE-A14B | 14B (activos) | 14B | 128k | multilingue | Apache 2.0 |

Nota: los datos de Mixtral y Qwen2.5-MoE son de conocimiento general y pueden no estar actualizados. VAETKI se distingue por su enfoque en idiomas asiaticos y su modo de pensamiento dual, pero sin benchmarks no se puede establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones de sesgo. Al entrenarse con datos web y corpora publicos, puede heredar sesgos presentes en esos datos, especialmente en contextos culturales y sociales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en tareas de razonamiento complejo o conocimiento especializado. Se recomienda validar las salidas en aplicaciones criticas.
- Limitaciones de contexto: aunque la ventana es de 32 000 tokens, el rendimiento en contextos muy largos puede degradarse. No se han publicado pruebas de recuperacion de informacion en posiciones intermedias.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo puede incluir componentes o datasets con licencias propias. Se debe revisar la documentacion del repositorio para verificar la procedencia de los datos de entrenamiento.
- Soporte de idiomas: aunque cubre cuatro idiomas, el rendimiento puede variar significativamente entre ellos. El coreano y el ingles probablemente tengan mejor cobertura que el chino y el japones, dado el origen del consorcio.
- Requisitos de hardware: el tamano del modelo (448,8 GB en safetensors) hace que su despliegue en entornos con recursos limitados sea inviable sin cuantizacion, y no hay informacion sobre cuantizaciones oficiales disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NC-AI-consortium-VAETKI/VAETKI
- Repositorio de GitHub (release v1.0.0): https://github.com/wbl-ncai/VAETKI/tree/releases/v1.0.0
- Technical Report (PDF): https://github.com/wbl-ncai/VAETKI/blob/releases/v1.0.0/VAETKI_Technical_Report.pdf
- Perfil de la organizacion en Hugging Face: https://huggingface.co/NC-AI-consortium-VAETKI
