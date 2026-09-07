# openbmb/MiniCPM5-2B-Midtrain

## Resumen

MiniCPM5-2B-Midtrain es un modelo de lenguaje de texto denso de 2.516.756.480 parametros (aproximadamente 2.500 millones), desarrollado por OpenBMB, el grupo de IA open source detras de la serie MiniCPM. Es el segundo modelo de la serie MiniCPM5, despues de MiniCPM5-1B, y se presenta como una version optimizada para despliegue en dispositivos (on-device), entornos locales y escenarios con recursos limitados. El modelo sigue una arquitectura Transformer densa basada en Llama y esta disenado para sobresalir en tareas de razonamiento de codigo, matematicas, comprension de contexto largo, uso de herramientas y tareas agenticas. Segun el fabricante, alcanza el estado del arte en su clase de 2B y se mantiene competitivo con modelos de 4B. Se distribuye bajo licencia Apache 2.0 y soporta ingles y chino.

El modelo es un checkpoint "Midtrain" (entrenamiento intermedio) dentro de la serie MiniCPM5, lo que indica que puede no ser la version final del modelo. En la informacion disponible no se especifican la longitud de contexto exacta, los tipos de cuantizacion ni los resultados de benchmarks, por lo que estos datos se indican como no disponibles. El modelo esta pensado para aplicaciones de generacion de texto, agentes con tool calling y razonamiento en entornos de computacion de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama) |
| Parametros totales | 2.516.756.480 |
| Longitud de contexto | No disponible (el modelo se presenta con soporte de contexto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiniCPM5-2B-Midtrain es un Transformer denso, sin mezcla de expertos (MoE), que sigue la arquitectura Llama. El entrenamiento se ha realizado sobre un conjunto de datasets propios de OpenBMB, incluyendo Ultra-FineWeb, UltraX-Preview, Ultra-FineWeb-L3, UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609. Esta composicion sugiere una fase de preentrenamiento seguida de ajuste supervisado (SFT) y aprendizaje por refuerzo (RL), aunque no se han publicado detalles sobre el numero de tokens ni las tecnicas especificas de alineacion. El modelo se presenta como una version "midtrain" (entrenamiento intermedio) dentro de la serie MiniCPM5, lo que implica que podria ser un checkpoint anterior a la version final.

No se han documentado innovaciones tecnicas destacables como atencion lineal o decodificacion especulativa en la informacion disponible. El enfasis del modelo esta en la eficiencia para despliegue en dispositivos y escenarios con recursos limitados, manteniendo un rendimiento competitivo en tareas de razonamiento, codigo y uso de herramientas.

## Capacidades

- Generacion de texto y razonamiento general, incluyendo conversaciones multi-turno.
- Razonamiento de codigo y matematicas, con ventajas sobre modelos de tamano similar en estas areas.
- Comprension de contexto largo, orientada a documentos extensos y tareas que requieren ventanas de atencion amplias.
- Uso de herramientas (tool calling) y tareas agenticas, con soporte para integracion en flujos de trabajo automatizados.
- Seguimiento de instrucciones y conocimiento general, segun el radar de capacidades del fabricante.
- Soporte multilingue en ingles y chino, con entrada y salida de texto (no multimodal).

## Casos de uso

- Asistentes conversacionales en dispositivos moviles o de borde: el modelo puede ejecutarse localmente en smartphones o mini-PCs gracias a su tamano compacto, gestionando conversaciones multi-turno sin depender de servidores externos.
- Generacion de codigo en entornos de desarrollo integrados (IDE): su capacidad de razonamiento de codigo permite sugerencias, autocompletado y refactorizacion en editores como VS Code, con despliegue local para evitar fugas de datos.
- Agentes automatizados con tool calling: el modelo puede integrarse en pipelines que llaman a APIs, consultan bases de datos o ejecutan scripts, realizando tareas de forma autonoma en entornos de CI/CD o automatizacion de procesos.
- Razonamiento matematico en aplicaciones educativas: su rendimiento en matematicas lo hace adecuado para tutores inteligentes, resolucion de problemas paso a paso y generacion de ejercicios personalizados.
- Resumen y extraccion de informacion de documentos largos: gracias al soporte de contexto largo, puede procesar contratos, informes o articulos extensos para generar resumenes o extraer entidades clave.
- Chatbots bilingues ingles-chino: el modelo puede atender consultas en ambos idiomas, siendo util para aplicaciones de atencion al cliente en empresas con operaciones en China y paises anglofonos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El fabricante afirma que MiniCPM5-2B alcanza el estado del arte en su clase (2B) y que es competitivo con modelos de 4B, pero no se proporcionan cifras concretas de evaluaciones como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, aproximadamente 5 GB de VRAM para los pesos (2.516.756.480 parametros x 2 bytes). Con cuantizacion a 4 bits, alrededor de 1,3 GB. No se dispone de datos oficiales de cuantizacion.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para FP16; una RTX 4090 ofrece margen para contextos largos o mayor throughput. En CPU puede ejecutarse con llama.cpp, aunque con menor velocidad.
- Cabe en GPU de consumo: si, con cuantizacion a 4 bits o 8 bits en tarjetas como RTX 3050 o superiores.
- Opciones de despliegue: transformers, vLLM, llama.cpp, Ollama y TGI, segun los tags del repositorio y la compatibilidad con endpoints.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con modelos similares. El fabricante afirma que MiniCPM5-2B es el estado del arte en la clase 2B y que compite con modelos de 4B, pero no se aportan datos de referencia de otros modelos. Dentro de la misma serie, existe MiniCPM5-1B, pero no se han publicado especificaciones completas en la informacion disponible.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos especificos en la informacion disponible, aunque el modelo puede heredar sesgos de los datos de entrenamiento.
- Riesgo de alucinacion: presente en todos los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad para este checkpoint.
- Limitaciones de contexto: la longitud de contexto exacta no se especifica, aunque el modelo se promociona como de contexto largo.
- Idiomas: solo se ha evaluado el rendimiento en ingles y chino; no se garantiza un buen comportamiento en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos completos.
- Caveat: el modelo es una version "Midtrain" (checkpoint intermedio), lo que puede implicar diferencias de rendimiento respecto a la version final de MiniCPM5-2B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openbmb/MiniCPM5-2B-Midtrain
- Informe tecnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper adicional (arXiv 2602.09003): https://arxiv.org/abs/2602.09003
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Wiki de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Plataforma UltraData: https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Articulo de Artificial Analysis: https://artificialanalysis.ai/articles/openbmb-releases-minicpm5-2b
