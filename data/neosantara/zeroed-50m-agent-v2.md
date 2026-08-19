# neosantara/Zeroed-50M-Agent-V2

## Resumen

Zeroed-50M-Agent-V2 es un modelo de lenguaje de 50 millones de parámetros desarrollado por el equipo Neosantara, especializado en tareas de codificación y agente. Se trata de la versión refinada de Zeroed-50M, obtenida mediante fine-tuning supervisado (SFT) sobre dos conjuntos de datos: CodeAlpaca-20k, compuesto por instrucciones de programación en Python de alta densidad, y las trayectorias resueltas y verificadas del conjunto SWE-agent-trajectories de Nebius. El entrenamiento se realizó en una GPU Tesla T4 de Google Colab, con 1000 pasos y una pérdida final de 2.3009.

El modelo está diseñado para actuar como agente de codificación, con optimizaciones de decodificación como repetición penalizada (1.2) y top-k (20). Su tamaño reducido lo hace adecuado para entornos con recursos limitados, aunque la información pública disponible es escasa y no se detallan aspectos como la arquitectura interna, la longitud de contexto o los datos de entrenamiento más allá de los mencionados. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 50 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0.2 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo. Por el nombre y el tamano, se trata de un transformer denso de 50 millones de parametros, pero no se confirma. El entrenamiento consistio en un fine-tuning supervisado (SFT) partiendo del checkpoint `neosantara/Zeroed-50M-Agent`. Los datos de entrenamiento incluyen CodeAlpaca-20k (instrucciones de codigo Python) y trayectorias SWE resueltas y verificadas (con `target=True`) del conjunto `nebius/SWE-agent-trajectories`. Se realizaron 1000 pasos de fine-tuning con una perdida final de 2.3009. No se mencionan tecnicas como RLHF, DPO ni otras innovaciones. Las optimizaciones de decodificacion aplicadas son repeticion penalizada (1.2) y top-k (20).

## Capacidades

- Generacion de codigo Python a partir de instrucciones en lenguaje natural, gracias al entrenamiento sobre CodeAlpaca-20k.
- Resolucion de tareas de ingenieria de software (SWE) basandose en trayectorias verificadas de agentes.
- Actuar como agente de codificacion en flujos de trabajo automatizados, aunque no se especifica soporte explicito para tool calling o function calling.
- Generacion de texto en ingles, con foco en dominios tecnicos y de programacion.
- Capacidad de razonamiento limitada por su tamano reducido (50M), adecuada para tareas simples y de corto alcance.
- No se reportan capacidades multimodales, vision, audio ni modo de pensamiento extendido.

## Casos de uso

- Autocompletado de codigo en entornos de desarrollo integrado (IDE): el modelo puede sugerir fragmentos de Python en tiempo real, aprovechando su entrenamiento en instrucciones de codigo. Su tamano reducido permite ejecutarlo localmente en maquinas modestas.
- Asistente de programacion para principiantes: puede explicar conceptos basicos de Python y generar ejemplos sencillos, aunque su capacidad de razonamiento complejo es limitada.
- Generacion de scripts de automatizacion: util para crear pequenos scripts de tareas repetitivas (procesamiento de archivos, llamadas a APIs) a partir de descripciones en lenguaje natural.
- Educacion y formacion en programacion: como modelo de demostracion en cursos o talleres donde se requiera un LLM ligero y de codigo abierto.
- Prototipado rapido de agentes de codigo: al ser pequeno y con licencia MIT, sirve para experimentar con pipelines de agentes sin coste de inferencia elevado.
- Despliegue en dispositivos edge o embebidos: su tamano permite ejecutarlo en hardware con poca memoria, como Raspberry Pi o moviles, para tareas de asistencia de codigo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada: un modelo de 50M de parametros en precision FP16 ocupa aproximadamente 100 MB de memoria; en int8, unos 50 MB. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una Tesla T4 (usada para el entrenamiento) o una RTX 3060 son mas que adecuadas.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo reciente (serie GTX 10xx o superior) puede ejecutarlo sin problemas.
- Opciones de despliegue: al ser un modelo pequeno, puede servirse con llama.cpp, Ollama, o incluso en CPU pura. Tambien es compatible con frameworks como vLLM o TGI, aunque no se confirma oficialmente.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, la latencia en GPU moderna seria de milisegundos por token, y en CPU de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria (50M de parametros especializados en codificacion). No se puede establecer una comparativa fiable sin datos de referencia.

## Limitaciones y advertencias

- Tamano muy reducido (50M): la capacidad de razonamiento, comprension de contexto largo y generacion de codigo complejo es muy limitada en comparacion con modelos de cientos de miles de millones de parametros.
- Solo soporta ingles: no hay soporte multilingue, lo que restringe su uso a entornos angloparlantes.
- Riesgo de alucinacion: al ser un modelo pequeno, puede generar codigo incorrecto o inventar APIs inexistentes. Se recomienda validacion humana en produccion.
- Sin informacion sobre sesgos: no se han publicado evaluaciones de sesgos ni de seguridad.
- Datos de entrenamiento limitados: solo se mencionan CodeAlpaca-20k y SWE-agent-trajectories; no se detalla la composicion completa ni el volumen total de tokens.
- Sin garantias de rendimiento: al no haber benchmarks publicos, no se puede evaluar su calidad relativa.
- Licencia MIT: permite uso comercial, pero el modelo se ofrece sin garantias explicitas por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neosantara/Zeroed-50M-Agent-V2
- Sitio web de Neosantara: https://www.neosantara.xyz/en
- Documentacion de modelos de Neosantara: https://docs.neosantara.xyz/en/models-overview
- Documentacion general de Neosantara: https://docs.neosantara.xyz/
- Ejemplo de uso de Neosantara con Agno: https://docs.agno.com/examples/models/neosantara/tool-use
